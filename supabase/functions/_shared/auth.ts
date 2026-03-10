import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://artigen-app.web.app',
  'https://artigen-app.firebaseapp.com',
  'http://localhost:8081',
  'http://localhost:19006',
];

/** Return the matching CORS origin or default to first allowed. */
export function getCorsOrigin(req?: Request): string {
  if (!req) return ALLOWED_ORIGINS[0];
  const origin = req.headers.get('Origin') || '';
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/** Create a Supabase client using the service role key (for DB operations). */
export function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

/**
 * Simple in-memory rate limiter for edge functions.
 * Limits requests per user per window (default: 10 requests per 60 seconds).
 */
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(
  userId: string,
  action: string,
  maxRequests = 10,
  windowSeconds = 60,
): boolean {
  const key = `${action}:${userId}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || (now - entry.windowStart) > windowSeconds * 1000) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

export function rateLimitResponse() {
  return jsonResponse({ error: 'Rate limit exceeded. Please try again later.' }, 429);
}

/**
 * Verify the caller's JWT and return the authenticated user ID.
 * Returns null if authentication fails.
 */
export async function getAuthUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user.id;
}

/**
 * Verify auth and return 401 response if not authenticated.
 * Use in edge functions that require user authentication.
 */
export async function requireAuth(req: Request): Promise<{ userId: string } | Response> {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  return { userId };
}
