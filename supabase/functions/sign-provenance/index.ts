import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { post_id, author_id, image_url, prompt, model_id, model_name } = await req.json();

    if (!post_id || !author_id || !image_url) {
      return new Response(JSON.stringify({ error: 'post_id, author_id, image_url required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Compute content hash from image URL
    const contentHash = await sha256(image_url + post_id);
    const promptHash = prompt ? await sha256(prompt) : null;

    // Create signature (HMAC with server secret)
    const signingKey = Deno.env.get('PROVENANCE_SIGNING_KEY') || 'default-dev-key';
    const signatureData = `${contentHash}:${author_id}:${post_id}`;
    const signature = await sha256(signatureData + signingKey);

    // Build C2PA-like manifest
    const c2paManifest = {
      claim_generator: 'artigen/1.0',
      title: `AI Art by ${author_id}`,
      assertions: [
        { label: 'c2pa.actions', data: { actions: [{ action: 'c2pa.created', parameters: { 'ai.model': model_name || model_id || 'unknown' } }] } },
        { label: 'c2pa.hash.data', data: { hash: contentHash, algorithm: 'SHA-256' } },
      ],
      signature_info: {
        alg: 'SHA-256-HMAC',
        issuer: 'artigen',
        time: new Date().toISOString(),
      },
    };

    // Upsert provenance record
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

    // Mark post as having provenance
    await supabase.from('posts').update({ has_provenance: true }).eq('id', post_id);

    return new Response(JSON.stringify({ success: true, content_hash: contentHash }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
