import { corsHeaders, jsonResponse, createServiceClient, requireAuth } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    const supabase = createServiceClient();
    const { job_id } = await req.json();

    if (!job_id || typeof job_id !== 'string') {
      return jsonResponse({ error: 'job_id is required' }, 400);
    }

    // Get the job and verify ownership
    const { data: job } = await supabase
      .from('animation_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (!job) {
      return jsonResponse({ error: 'Job not found' }, 404);
    }

    if (job.user_id !== authResult.userId) {
      return jsonResponse({ error: 'Not authorized to process this job' }, 403);
    }

    await supabase.from('animation_jobs').update({ status: 'processing' }).eq('id', job_id);

    // Call animation API (placeholder — replace with Stable Video Diffusion / RunwayML)
    const apiUrl = Deno.env.get('ANIMATION_API_URL') || 'https://api.example.com/animate';
    const apiKey = Deno.env.get('ANIMATION_API_KEY') || '';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          image_url: job.source_image_url,
          animation_type: job.animation_type,
          settings: job.settings,
          duration_seconds: job.duration_seconds,
        }),
      });

      if (!response.ok) throw new Error('API call failed');

      const { video_url, thumbnail_url } = await response.json();

      await supabase.from('animation_jobs').update({
        status: 'completed',
        result_video_url: video_url,
        thumbnail_url: thumbnail_url || null,
        completed_at: new Date().toISOString(),
      }).eq('id', job_id);
    } catch {
      await supabase.from('animation_jobs').update({
        status: 'failed',
        error_message: 'Animation API unavailable',
        completed_at: new Date().toISOString(),
      }).eq('id', job_id);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
