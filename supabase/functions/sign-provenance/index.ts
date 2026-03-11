import { corsHeaders, jsonResponse, createServiceClient, requireAuth, checkRateLimit, rateLimitResponse } from '../_shared/auth.ts';

async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSign(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    if (!checkRateLimit(authResult.userId, 'sign-provenance', 10, 60)) {
      return rateLimitResponse();
    }

    const supabase = createServiceClient();
    const { post_id, image_url, prompt, model_id, model_name } = await req.json();

    if (!post_id || !image_url) {
      return jsonResponse({ error: 'post_id and image_url required' }, 400);
    }

    const author_id = authResult.userId;

    // Verify the post belongs to this user
    const { data: post } = await supabase.from('posts').select('user_id').eq('id', post_id).single();
    if (!post || post.user_id !== author_id) {
      return jsonResponse({ error: 'Forbidden' }, 403);
    }

    const contentHash = await sha256(image_url + post_id);
    const promptHash = prompt ? await sha256(prompt) : null;

    // Proper HMAC signature
    const signingKey = Deno.env.get('PROVENANCE_SIGNING_KEY');
    if (!signingKey || signingKey === 'default-dev-key') {
      console.warn('PROVENANCE_SIGNING_KEY not set or insecure — refusing to sign');
      return jsonResponse({ error: 'Provenance signing is not configured' }, 500);
    }
    const signatureData = `${contentHash}:${author_id}:${post_id}`;
    const signature = await hmacSign(signatureData, signingKey);

    const c2paManifest = {
      claim_generator: 'artigen/1.0',
      title: `AI Art by ${author_id}`,
      assertions: [
        { label: 'c2pa.actions', data: { actions: [{ action: 'c2pa.created', parameters: { 'ai.model': model_name || model_id || 'unknown' } }] } },
        { label: 'c2pa.hash.data', data: { hash: contentHash, algorithm: 'SHA-256' } },
      ],
      signature_info: {
        alg: 'HMAC-SHA-256',
        issuer: 'artigen',
        time: new Date().toISOString(),
      },
    };

    await supabase.from('art_provenance').upsert({
      post_id,
      author_id,
      content_hash: contentHash,
      prompt_hash: promptHash,
      model_id: model_id || null,
      model_name: model_name || null,
      generation_date: new Date().toISOString(),
      signature,
      c2pa_manifest: c2paManifest,
      verification_status: 'verified',
    }, { onConflict: 'post_id' });

    await supabase.from('posts').update({ has_provenance: true }).eq('id', post_id);

    return jsonResponse({ success: true, content_hash: contentHash });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
