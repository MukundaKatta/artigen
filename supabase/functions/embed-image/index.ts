import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { post_id, image_url } = await req.json();

    if (!post_id || !image_url) {
      return new Response(JSON.stringify({ error: 'post_id and image_url required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Call CLIP API to get embedding (placeholder — replace with actual CLIP endpoint)
    const clipApiUrl = Deno.env.get('CLIP_API_URL') || 'https://api.example.com/clip/embed';
    const clipApiKey = Deno.env.get('CLIP_API_KEY') || '';

    const embedResponse = await fetch(clipApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clipApiKey}` },
      body: JSON.stringify({ image_url }),
    });

    if (!embedResponse.ok) {
      // Store a zero vector as placeholder if API is not configured
      const zeroEmbedding = new Array(512).fill(0);
      await supabase.from('post_embeddings').upsert({
        post_id,
        embedding: JSON.stringify(zeroEmbedding),
        model_version: 'placeholder',
      }, { onConflict: 'post_id' });

      return new Response(JSON.stringify({ success: true, placeholder: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { embedding } = await embedResponse.json();

    await supabase.from('post_embeddings').upsert({
      post_id,
      embedding: JSON.stringify(embedding),
      model_version: 'clip-vit-b-32',
    }, { onConflict: 'post_id' });

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
