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

    const { crossPostId } = await req.json();

    if (!crossPostId) {
      return new Response(
        JSON.stringify({ error: 'Missing crossPostId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the cross post record
    const { data: crossPost, error: fetchError } = await supabase
      .from('cross_posts')
      .select('*, post:posts(*, media:post_media(*))')
      .eq('id', crossPostId)
      .single();

    if (fetchError || !crossPost) {
      return new Response(
        JSON.stringify({ error: 'Cross post record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      // Simulate a platform post ID
      const platformPostId = `${crossPost.platform}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await supabase
        .from('cross_posts')
        .update({
          status: 'posted',
          platform_post_id: platformPostId,
          posted_at: new Date().toISOString(),
        })
        .eq('id', crossPostId);

      return new Response(
        JSON.stringify({
          success: true,
          platform_post_id: platformPostId,
          platform: crossPost.platform,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const errorMessage = `Failed to post to ${crossPost.platform}: API rate limit exceeded (simulated)`;

      await supabase
        .from('cross_posts')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', crossPostId);

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          platform: crossPost.platform,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
