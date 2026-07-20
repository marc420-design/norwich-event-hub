/**
 * Cloudflare Pages Function
 * Securely triggers the GitHub Actions scraper workflow
 * This avoids exposing the GITHUB_TOKEN in client-side JS
 */

export async function onRequestPost(context) {
    try {
        // 1. Get the GitHub token from environment variables
        // This MUST be set in the Cloudflare Pages dashboard
        const token = context.env.GITHUB_TOKEN;

        if (!token) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Server configuration error: GITHUB_TOKEN not found'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. GitHub API configuration
        const owner = 'marc420-design';
        const repo = 'norwich-event-hub';
        const workflowId = 'scrape-events.yml';
        const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`;

        // 3. Trigger the workflow dispatch
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${token}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'Norwich-Event-Hub-Cloudflare-Function'
            },
            body: JSON.stringify({
                ref: 'master' // or 'main' if that's the branch name
            })
        });

        if (response.status === 204) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Scraper workflow triggered successfully'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            const errorText = await response.text();
            return new Response(JSON.stringify({
                success: false,
                message: `GitHub API error: ${response.status} ${errorText}`
            }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: `Internal server error: ${error.message}`
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
