/**
 * CORS configuration for Cloudflare Pages Functions
 * Enables browser requests from admin dashboard
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle CORS preflight requests
 * @param {Request} request - The incoming request
 * @returns {Response|null} - CORS response for OPTIONS, null otherwise
 */
export function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  return null;
}
