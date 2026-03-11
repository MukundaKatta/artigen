import { corsHeaders, jsonResponse, createServiceClient, requireAuth, checkRateLimit, rateLimitResponse, validateImageUrl } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    if (!checkRateLimit(authResult.userId, 'safety-check', 20, 60)) {
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

    // Call image safety classifier API (placeholder — replace with actual API)
    const safetyApiUrl = Deno.env.get('SAFETY_API_URL') || '';
    const safetyApiKey = Deno.env.get('SAFETY_API_KEY') || '';

    let labelType: 'safe' | 'sensitive' | 'mature' | 'nsfw' = 'safe';
    let confidence: number | null = null;
    let categories: Record<string, number> = {};

    if (safetyApiUrl) {
      try {
        const response = await fetch(safetyApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${safetyApiKey}` },
          body: JSON.stringify({ image_url }),
        });

        if (response.ok) {
          const result = await response.json();
          const validLabels = ['safe', 'sensitive', 'mature', 'nsfw'];
          labelType = validLabels.includes(result.label) ? result.label : 'safe';
          confidence = typeof result.confidence === 'number' ? result.confidence : null;
          categories = result.categories || {};
        }
      } catch {
        // Default to safe if API fails
      }
    }

    // Upsert content label
    await supabase.from('content_labels').upsert({
      post_id,
      label_type: labelType,
      ai_confidence: confidence,
      ai_categories: categories,
      is_ai_labeled: true,
    }, { onConflict: 'post_id' });

    return jsonResponse({ success: true, label: labelType });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
