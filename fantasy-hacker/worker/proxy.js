/**
 * Fantasy Hacker · Puente con LaLiga Fantasy (Cloudflare Worker)
 *
 * El navegador no puede hablar directamente con la API de LaLiga Fantasy (CORS),
 * así que este Worker hace de intermediario:
 *   POST /login    { email, password }   -> tokens de LaLiga (no guarda la contraseña)
 *   POST /refresh  { refresh_token }     -> tokens renovados
 *   GET  /api/...                        -> reenvía la petición a la API de LaLiga Fantasy
 *
 * Solo permite lecturas (GET) de la API: no puede pujar, vender ni tocar tu equipo.
 * Solo acepta peticiones desde los orígenes de ALLOWED_ORIGINS.
 */

// Orígenes que pueden usar este Worker (separados por comas). Se puede cambiar
// desde Cloudflare con la variable de entorno ALLOWED_ORIGINS.
const DEFAULT_ORIGINS = 'https://futurecarkid-source.github.io';

const API_HOSTS = ['https://api-fantasy.llt-services.com', 'https://fantasy-api.llt-services.com'];
const TOKEN_URL = 'https://login.laliga.es/laligadspprob2c.onmicrosoft.com/oauth2/v2.0/token';
const EMAIL_CLIENT_ID = 'af88bcff-1157-40a0-b579-030728aacf0b';
const LOGIN_POLICIES = ['B2C_1A_ResourceOwnerv2', 'B2C_1A_5ULAIP_PARAMETRIZED_SIGNIN'];
const REFRESH_POLICY = 'B2C_1A_5ULAIP_PARAMETRIZED_SIGNIN';
const REDIRECT_URI = 'authredirect://com.lfp.laligafantasy';

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || DEFAULT_ORIGINS).split(',').map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get('Origin') || '';
    const okOrigin = allowed.includes('*') || allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': okOrigin ? origin || '*' : allowed[0],
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!okOrigin) return json({ error: 'Origen no permitido: ' + origin }, 403);

    const url = new URL(request.url);
    try {
      if (url.pathname === '/' || url.pathname === '/health') return json({ ok: true, name: 'fantasy-hacker-proxy' });

      if (url.pathname === '/login' && request.method === 'POST') {
        const { email, password } = await request.json();
        if (!email || !password) return json({ error: 'Faltan email o contraseña' }, 400);
        let last = null;
        for (const policy of LOGIN_POLICIES) {
          const body = new URLSearchParams({
            grant_type: 'password',
            client_id: EMAIL_CLIENT_ID,
            scope: `openid ${EMAIL_CLIENT_ID} offline_access`,
            redirect_uri: REDIRECT_URI,
            response_type: 'id_token',
            username: email,
            password,
          });
          const res = await fetch(`${TOKEN_URL}?p=${policy}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
          });
          const text = await res.text();
          let data = null;
          try { data = JSON.parse(text); } catch (e) { /* respuesta no JSON */ }
          if (res.ok && data && (data.id_token || data.access_token)) return json(data);
          last = { status: res.status, data };
          if (res.status !== 404 && data) break; // credenciales incorrectas: no seguir probando
        }
        const msg = last?.data?.error_description || last?.data?.error || 'No se pudo iniciar sesión';
        return json({ error: msg }, last?.status === 400 ? 401 : 502);
      }

      if (url.pathname === '/refresh' && request.method === 'POST') {
        const { refresh_token } = await request.json();
        if (!refresh_token) return json({ error: 'Falta refresh_token' }, 400);
        const res = await fetch(`${TOKEN_URL}?p=${REFRESH_POLICY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token,
            client_id: EMAIL_CLIENT_ID,
            scope: 'openid offline_access',
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !(data.id_token || data.access_token)) {
          return json({ error: data.error_description || data.error || 'Sesión caducada' }, 401);
        }
        return json(data);
      }

      if (url.pathname.startsWith('/api/')) {
        if (request.method !== 'GET') return json({ error: 'Solo lectura' }, 405);
        const headers = { 'x-lang': 'es', Accept: 'application/json' };
        const auth = request.headers.get('Authorization');
        if (auth) headers.Authorization = auth;
        let lastErr = null;
        for (const host of API_HOSTS) {
          try {
            const res = await fetch(host + url.pathname + url.search, { headers });
            return new Response(res.body, {
              status: res.status,
              headers: { ...cors, 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
            });
          } catch (e) {
            lastErr = e; // host caído o inexistente: probamos el siguiente
          }
        }
        return json({ error: 'API de LaLiga Fantasy no disponible: ' + (lastErr?.message || '') }, 502);
      }

      return json({ error: 'Ruta no encontrada' }, 404);
    } catch (e) {
      return json({ error: e.message || String(e) }, 500);
    }
  },
};
