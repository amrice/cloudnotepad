import { verifyToken, json, error } from '../../shared/types';

// 认证中间件
export async function authMiddleware(
  request: Request
): Promise<Response | null> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(401, '未登录');
  }

  const token = authHeader.substring(7);
  const jwtSecret = 'cloudnotepad-jwt-secret-2024';

  try {
    const result = await verifyToken(token, jwtSecret);
    if (!result.valid) {
      return error(401, '登录已过期');
    }
  } catch {
    return error(401, '无效的令牌');
  }

  return null;
}

// 首次设置密码
export async function handleSetup(
  request: Request
): Promise<Response> {
  try {
    // @ts-ignore - KV 是 EdgeOne Pages 的全局变量
    if (typeof KV === 'undefined') {
      return error(500, 'KV 存储未配置');
    }

    const { password } = await request.json();

    if (!password || password.length < 4) {
      return error(400, '密码长度至少 4 位');
    }

    // 检查是否已设置过密码
    // @ts-ignore
    const hasSetup = await KV.get('config:hasSetup');
    if (hasSetup) {
      return error(400, '密码已设置，请直接登录');
    }

    // 生成密码哈希
    const salt = 'cloudnotepad-default-salt-2024';
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 保存密码哈希
    // @ts-ignore
    await KV.put('config:password', hashHex);
    // @ts-ignore
    await KV.put('config:hasSetup', 'true');

    return json({ success: true });
  } catch (err) {
    console.error('Setup error:', err);
    return error(500, '设置失败: ' + String(err));
  }
}

// 登录
export async function handleLogin(
  request: Request
): Promise<Response> {
  try {
    const { password } = await request.json();

    // 检查是否首次设置
    // @ts-ignore
    const hasSetup = await KV.get('config:hasSetup');
    if (!hasSetup) {
      return error(401, '请先设置密码');
    }

    // 验证密码
    const salt = 'cloudnotepad-default-salt-2024';
    // @ts-ignore
    const storedHash = await KV.get('config:password');
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex !== storedHash) {
      return error(401, '密码错误');
    }

    // 生成 token
    const jwtSecret = 'cloudnotepad-jwt-secret-2024';
    const payload = {
      sub: 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };
    const token = btoa(JSON.stringify(payload)) + '.' + btoa(jwtSecret) + '.' + 'signature';

    return json({ success: true, token });
  } catch (err) {
    console.error('Login error:', err);
    return error(500, '登录失败');
  }
}

// 验证会话
export async function handleVerify(
  request: Request
): Promise<Response> {
  const authResult = await authMiddleware(request);
  if (authResult) {
    return json({ valid: false });
  }
  return json({ valid: true });
}

// 登出
export async function handleLogout(): Promise<Response> {
  return json({ success: true });
}
