/**
 * Cloudflare Pages Middleware
 * protecting /admin routes with Basic Auth
 */

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // Only protect paths starting with /admin (e.g., /admin, /admin.html)
    // Avoid protecting /, /assets, etc.
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
        const authHeader = request.headers.get('Authorization');

        // Credentials from environment variables (Cloudflare Dashboard)
        const password = env.ADMIN_PASSWORD || 'NorwichEvents2026!';
        const username = env.ADMIN_USERNAME || 'admin';

        // Basic Auth check
        const expectedAuth = `Basic ${btoa(`${username}:${password}`)}`;

        if (!authHeader || authHeader !== expectedAuth) {
            return new Response('Unauthorized', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="Norwich Event Hub Admin"',
                },
            });
        }
    }

    // Special case for exact /admin.html match if needed, but redirects handle /admin
    if (url.pathname === '/admin.html') {
         const authHeader = request.headers.get('Authorization');
         const password = env.ADMIN_PASSWORD || 'NorwichEvents2026!';
         const username = env.ADMIN_USERNAME || 'admin';
         const expectedAuth = `Basic ${btoa(`${username}:${password}`)}`;

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
