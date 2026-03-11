import { corsHeaders, jsonResponse, createServiceClient, requireAuth, checkRateLimit, rateLimitResponse, validateImageUrl } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    if (!checkRateLimit(authResult.userId, 'embed-image', 20, 60)) {
      return rateLimitResponse();
    }

    const supabase = createServiceClient();
    const { post_id, image_url } = await req.json();

    if (!post_id || typeof post_id !== 'string') {
      return jsonResponse({ error: 'post_id is required' }, 400);
    }
    const urlError = validateImageUrl(image_url);
    if (urlError) return jsonResponse({ error: urlError }, 400);

    // Verify the post belongs to the authenticated user
    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .eq('user_id', authResult.userId)
      .single();

    if (!post) {
      return jsonResponse({ error: 'Post not found or not owned by user' }, 403);
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

      return jsonResponse({ success: true, placeholder: true });
    }

    const { embedding } = await embedResponse.json();

    await supabase.from('post_embeddings').upsert({
      post_id,
      embedding: JSON.stringify(embedding),
      model_version: 'clip-vit-b-32',
    }, { onConflict: 'post_id' });

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
