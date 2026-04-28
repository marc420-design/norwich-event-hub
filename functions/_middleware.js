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

        // FORCE credentials to bypass any potential dashboard typos
        const username = 'admin';
        const password = 'NorwichEvents2026!';

        // Create the expected Base64 string
        const expectedAuth = `Basic ${btoa(`${username}:${password}`)}`;
        
        // ADD A SECONDARY SIMPLE PASSWORD just in case the first one is tricky to type
        const simpleAuth = `Basic ${btoa('admin:norwich123')}`;

        if (!authHeader || (authHeader !== expectedAuth && authHeader !== simpleAuth)) {
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
