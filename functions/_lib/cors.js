/**
 * CORS configuration for Cloudflare Pages Functions
 * Enables browser requests from admin dashboard
 */

const ALLOWED_ORIGINS = [
  'https://norwicheventshub.com',
  'https://www.norwicheventshub.com',
];

export function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// Legacy export for existing callers
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://norwicheventshub.com',
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
      headers: getCorsHeaders(request)
    });
  }
  return null;
}
