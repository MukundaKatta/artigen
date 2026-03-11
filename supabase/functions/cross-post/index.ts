import { corsHeaders, jsonResponse, createServiceClient, requireAuth, checkRateLimit, rateLimitResponse } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    if (!checkRateLimit(authResult.userId, 'cross-post', 10, 60)) {
      return rateLimitResponse();
    }

    const supabase = createServiceClient();
    const { crossPostId } = await req.json();

    if (!crossPostId || typeof crossPostId !== 'string') {
      return jsonResponse({ error: 'crossPostId is required' }, 400);
    }

    // Fetch the cross post record and verify ownership
    const { data: crossPost, error: fetchError } = await supabase
      .from('cross_posts')
      .select('*, post:posts(*, media:post_media(*))')
      .eq('id', crossPostId)
      .single();

    if (fetchError || !crossPost) {
      return jsonResponse({ error: 'Cross post record not found' }, 404);
    }

    if (crossPost.user_id !== authResult.userId) {
      return jsonResponse({ error: 'Not authorized to process this cross post' }, 403);
    }

    // Update status to 'posting'
    await supabase
      .from('cross_posts')
      .update({ status: 'posting' })
      .eq('id', crossPostId);

    // Simulate platform API call with a 2-second delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Placeholder: simulate success (90% of the time) or failure (10%)
    const success = Math.random() > 0.1;

    if (success) {
      const platformPostId = `${crossPost.platform}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await supabase
        .from('cross_posts')
        .update({
          status: 'posted',
          platform_post_id: platformPostId,
          posted_at: new Date().toISOString(),
        })
        .eq('id', crossPostId);

      return jsonResponse({
        success: true,
        platform_post_id: platformPostId,
        platform: crossPost.platform,
      });
    } else {
      const errorMessage = `Failed to post to ${crossPost.platform}: API rate limit exceeded`;

      await supabase
        .from('cross_posts')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', crossPostId);

      return jsonResponse({
        success: false,
        error: errorMessage,
        platform: crossPost.platform,
      });
    }
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
