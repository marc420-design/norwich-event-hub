/**
 * Cloudflare Pages Middleware
 * Protecting /admin routes with Basic Auth
 */

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();

    // Paths to protect
    const protectedPaths = [
        '/admin',
        '/admin.html',
        '/trigger-scraper'
    ];

    const isProtected = protectedPaths.some(path => 
        pathname === path || pathname.startsWith(path + '/')
    );

    if (isProtected) {
        const authHeader = request.headers.get('Authorization');

        const username = env.ADMIN_USERNAME;
        const password = env.ADMIN_PASSWORD;
        const precomputedToken = env.ADMIN_BASIC_AUTH_TOKEN;
        const expectedAuth = precomputedToken
            ? `Basic ${precomputedToken}`
            : (username && password ? `Basic ${btoa(`${username}:${password}`)}` : null);

        if (!expectedAuth) {
            return new Response('Admin authentication is not configured.', {
                status: 500,
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
        }

        if (!authHeader || authHeader !== expectedAuth) {
            return new Response('Unauthorized', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="Norwich Event Hub Admin"',
                },
            });
        }
    }

    // Continue to the next middleware or asset
    try {
        return await next();
    } catch (err) {
        console.error('Middleware Error:', err);
        return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
    }
}
