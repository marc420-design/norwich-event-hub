/**
 * Cloudflare Pages Middleware
 * Protects /admin and /agent/agent-admin routes with Basic Auth.
 */

const PROTECTED_PATHS = ['/admin', '/admin.html', '/agent/agent-admin.html'];

function isProtected(pathname) {
    return PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
}

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    if (isProtected(url.pathname)) {
        const username = env.ADMIN_USERNAME || 'admin';
        const password = env.ADMIN_PASSWORD || 'NorwichEvents2026!';
        const expectedAuth = `Basic ${btoa(`${username}:${password}`)}`;
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || authHeader !== expectedAuth) {
            return new Response('Unauthorized', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="Norwich Event Hub Admin"',
                },
            });
        }
    }

    try {
        return await next();
    } catch (err) {
        return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
    }
}
