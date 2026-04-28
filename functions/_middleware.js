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

        // Credentials from environment variables (fallback to default for safety)
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

    // Continue to the next middleware or asset
    try {
        return await next();
    } catch (err) {
        console.error('Middleware Error:', err);
        return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
    }
}
