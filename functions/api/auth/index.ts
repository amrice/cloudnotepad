import { verifyToken, json, error, Response } from '../../shared/types';

// 认证中间件
export async function authMiddleware(
  request: Request,
  env: Env
): Promise<Response<null> | null> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(401, '未登录');
  }

  const token = authHeader.substring(7);

  try {
    const result = await verifyToken(token, env.JWT_SECRET);
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
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const { password } = await request.json();

    if (!password || password.length < 4) {
      return error(400, '密码长度至少 4 位');
    }

    // 生成密码哈希
    const encoder = new TextEncoder();
    const data = encoder.encode(password + env.PASSWORD_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 保存密码哈希
    await env.KV.put('config:password', hashHex);
    await env.KV.put('config:hasSetup', 'true');

    return json({ success: true });
  } catch (err) {
    console.error('Setup error:', err);
    return error(500, '设置失败');
  }
}

// 登录
export async function handleLogin(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const { password } = await request.json();

    // 检查是否首次设置
    const hasSetup = await env.KV.get('config:hasSetup');
    if (!hasSetup) {
      return error(401, '请先设置密码');
    }

    // 验证密码
    const storedHash = await env.KV.get('config:password');
    const encoder = new TextEncoder();
    const data = encoder.encode(password + env.PASSWORD_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex !== storedHash) {
      return error(401, '密码错误');
    }

    // 生成 token（简化版）
    const payload = {
      sub: 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7天
    };
    const token = btoa(JSON.stringify(payload)) + '.' +
      btoa(env.JWT_SECRET) + '.' +
      'signature';

    return json({
      success: true,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return error(500, '登录失败');
  }
}

// 验证会话
export async function handleVerify(
  request: Request,
  env: Env
): Promise<Response> {
  const authResult = await authMiddleware(request, env);
  if (authResult) {
    return json({ valid: false });
  }
  return json({ valid: true });
}

// 登出
export async function handleLogout(): Promise<Response> {
  return json({ success: true });
}
