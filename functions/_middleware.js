/**
 * Cloudflare Pages Middleware
 * protecting /admin routes with Basic Auth
 */

export async function onRequest(context) {
    const url = new URL(context.request.url);

    // Check if we are accessing the admin page
    // Matches /admin, /admin.html, /admin/anything
    if (url.pathname.startsWith('/admin')) {
        const authHeader = context.request.headers.get('Authorization');

        // Get credentials from environment variables or use defaults
        // User should set ADMIN_PASSWORD in Cloudflare Pages settings
        const password = context.env.ADMIN_PASSWORD || 'NorwichEvents2026!';
        const username = context.env.ADMIN_USERNAME || 'admin';

        // Construct expected header
        const credentials = btoa(`${username}:${password}`);
        const expectedAuth = `Basic ${credentials}`;

        // Verify
        if (!authHeader || authHeader !== expectedAuth) {
            return new Response('Unauthorized - Admin Access Required', {
                status: 401,
                headers: {
                    // Trigger browser's native login prompt
                    'WWW-Authenticate': 'Basic realm="Norwich Event Hub Admin"',
                },
            });
        }
    }

    // Continue to next middleware or asset
    return context.next();
}
