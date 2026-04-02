// Cloudflare Pages Functions - 处理 OAuth 路由
export async function onRequestGet(request, env) {
  const url = new URL(request.url);
  
  // 从环境变量获取配置
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return new Response('Server not configured: Missing OAuth credentials', { status: 500 });
  }
  
  // 回调地址
  const redirectUri = 'https://image-background-remover.world/auth/google/callback';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // /auth/google - 跳转到 Google 登录
  if (url.pathname === '/auth/google') {
    const state = Date.now().toString();
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=offline&state=${state}`;
    return Response.redirect(authUrl, 302);
  }

  // /auth/google/callback - 处理回调
  if (url.pathname === '/auth/google/callback') {
    const code = url.searchParams.get('code');
    if (!code) {
      return new Response('Missing code', { status: 400, headers: corsHeaders });
    }

    try {
      // 换取 access_token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        return new Response('Failed to get tokens', { status: 500, headers: corsHeaders });
      }

      const tokens = await tokenRes.json();

      // 获取用户信息
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const user = await userRes.json();

      // 跳转到网站首页并携带用户信息
      const redirectUrl = new URL('https://image-background-remover.world/callback');
      redirectUrl.searchParams.set('user', JSON.stringify(user));
      redirectUrl.searchParams.set('email', user.email);
      redirectUrl.searchParams.set('name', user.name);
      redirectUrl.searchParams.set('picture', user.picture);
      
      return Response.redirect(redirectUrl.toString(), 302);
    } catch (err) {
      return new Response('Error: ' + err.message, { status: 500, headers: corsHeaders });
    }
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}