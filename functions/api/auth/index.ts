import {
  verifyToken,
  json,
  jsonWithCookie,
  error,
  createAuthCookie,
  clearAuthCookie,
  LOGIN_DURATION_MAP,
} from '../../shared/types';

// @ts-ignore - KV 是 EdgeOne Pages 的全局变量
declare const KV: any;

const JWT_SECRET = 'cloudnotepad-jwt-secret-2024';
const SALT = 'cloudnotepad-default-salt-2024';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60; // 15分钟

// 从 Cookie 中获取 token
export function getTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith('auth_token=')) {
      return cookie.substring(11);
    }
  }
  return null;
}

// 认证中间件
export async function authMiddleware(request: Request): Promise<Response | null> {
  const token = getTokenFromCookie(request);

  if (!token) {
    return error(401, '未登录');
  }

  try {
    const result = await verifyToken(token, JWT_SECRET);
    if (!result.valid) {
      return error(401, '登录已过期');
    }
  } catch {
    return error(401, '无效的令牌');
  }

  return null;
}

// 生成密码哈希
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 生成 JWT Token
function generateToken(duration: string): string {
  const maxAge = LOGIN_DURATION_MAP[duration] || LOGIN_DURATION_MAP['7days'];
  const exp = maxAge > 0
    ? Math.floor(Date.now() / 1000) + maxAge
    : Math.floor(Date.now() / 1000) + 24 * 60 * 60; // session 默认24小时

  const payload = {
    sub: 'user',
    iat: Math.floor(Date.now() / 1000),
    exp,
    duration,
  };

  return btoa(JSON.stringify(payload)) + '.' + btoa(JWT_SECRET) + '.' + 'signature';
}

// 检查登录限制
async function checkLoginLimit(): Promise<{ blocked: boolean; remaining?: number }> {
  const attempts = await KV.get('auth:login_attempts', { type: 'json' }) || { count: 0, lastAttempt: 0 };
  const now = Date.now() / 1000;

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const elapsed = now - attempts.lastAttempt;
    if (elapsed < LOCKOUT_DURATION) {
      return { blocked: true, remaining: Math.ceil(LOCKOUT_DURATION - elapsed) };
    }
    // 锁定时间已过，重置
    await KV.put('auth:login_attempts', JSON.stringify({ count: 0, lastAttempt: 0 }));
  }

  return { blocked: false };
}

// 记录登录失败
async function recordLoginFailure(): Promise<void> {
  const attempts = await KV.get('auth:login_attempts', { type: 'json' }) || { count: 0, lastAttempt: 0 };
  await KV.put('auth:login_attempts', JSON.stringify({
    count: attempts.count + 1,
    lastAttempt: Date.now() / 1000,
  }));
}

// 重置登录限制
async function resetLoginLimit(): Promise<void> {
  await KV.put('auth:login_attempts', JSON.stringify({ count: 0, lastAttempt: 0 }));
}

// 首次设置密码
export async function handleSetup(request: Request): Promise<Response> {
  try {
    if (typeof KV === 'undefined') {
      return error(500, 'KV 存储未配置');
    }

    const { password } = await request.json();

    if (!password || password.length < 4) {
      return error(400, '密码长度至少 4 位');
    }

    const hasSetup = await KV.get('config:hasSetup');
    if (hasSetup) {
      return error(400, '密码已设置，请直接登录');
    }

    const hashHex = await hashPassword(password);
    await KV.put('config:password', hashHex);
    await KV.put('config:hasSetup', 'true');

    return json({ success: true });
  } catch (err) {
    console.error('Setup error:', err);
    return error(500, '设置失败: ' + String(err));
  }
}

// 登录
export async function handleLogin(request: Request): Promise<Response> {
  try {
    // 检查登录限制
    const limit = await checkLoginLimit();
    if (limit.blocked) {
      return error(429, `登录失败次数过多，请 ${limit.remaining} 秒后重试`);
    }

    const { password, duration = '7days' } = await request.json();

    const hasSetup = await KV.get('config:hasSetup');
    if (!hasSetup) {
      return error(401, '请先设置密码');
    }

    const storedHash = await KV.get('config:password');
    const inputHash = await hashPassword(password);

    if (inputHash !== storedHash) {
      await recordLoginFailure();
      return error(401, '密码错误');
    }

    // 登录成功，重置限制
    await resetLoginLimit();

    // 生成 token 和 cookie
    const token = generateToken(duration);
    const maxAge = LOGIN_DURATION_MAP[duration] || LOGIN_DURATION_MAP['7days'];
    const cookie = createAuthCookie(token, maxAge);

    return jsonWithCookie({ success: true }, cookie);
  } catch (err) {
    console.error('Login error:', err);
    return error(500, '登录失败');
  }
}

// 登出
export async function handleLogout(): Promise<Response> {
  const cookie = clearAuthCookie();
  return jsonWithCookie({ success: true }, cookie);
}

// 验证会话
export async function handleVerify(request: Request): Promise<Response> {
  const authResult = await authMiddleware(request);
  if (authResult) {
    return json({ valid: false });
  }
  return json({ valid: true });
}

// 检查是否已设置密码
export async function handleCheckSetup(): Promise<Response> {
  try {
    if (typeof KV === 'undefined') {
      return error(500, 'KV 存储未配置');
    }

    const hasSetup = await KV.get('config:hasSetup');
    return json({ hasSetup: !!hasSetup });
  } catch (err) {
    console.error('Check setup error:', err);
    return error(500, '检查设置状态失败');
  }
}

// 修改密码
export async function handleChangePassword(request: Request): Promise<Response> {
  try {
    // 验证登录状态
    const authResult = await authMiddleware(request);
    if (authResult) {
      return authResult;
    }

    const { oldPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 4) {
      return error(400, '新密码长度至少 4 位');
    }

    // 验证旧密码
    const storedHash = await KV.get('config:password');
    const oldHash = await hashPassword(oldPassword);

    if (oldHash !== storedHash) {
      return error(401, '旧密码错误');
    }

    // 设置新密码
    const newHash = await hashPassword(newPassword);
    await KV.put('config:password', newHash);

    return json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    return error(500, '修改密码失败');
  }
}

// 重置系统 - 删除所有 KV 数据
export async function handleReset(request: Request): Promise<Response> {
  try {
    // 验证登录状态
    const authResult = await authMiddleware(request);
    if (authResult) {
      return authResult;
    }

    // 验证密码
    const { password } = await request.json();
    const storedHash = await KV.get('config:password');
    const inputHash = await hashPassword(password);

    if (inputHash !== storedHash) {
      return error(401, '密码错误');
    }

    // 获取所有 key 并删除（分批获取，每次最多 256）
    let deletedCount = 0;
    let cursor: string | undefined;

    do {
      const listOptions: { limit: number; cursor?: string } = { limit: 256 };
      if (cursor) listOptions.cursor = cursor;

      const result = await KV.list(listOptions);
      const keys = result?.keys || [];

      for (const key of keys) {
        const keyName = typeof key === 'string' ? key : (key.key || key.name);
        if (keyName) {
          await KV.delete(keyName);
          deletedCount++;
        }
      }

      cursor = result?.cursor;
    } while (cursor);

    // 清除 Cookie
    const cookie = clearAuthCookie();
    return jsonWithCookie({ success: true, deleted: deletedCount }, cookie);
  } catch (err) {
    console.error('Reset error:', err);
    return error(500, '重置失败: ' + String(err));
  }
}
