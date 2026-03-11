import { corsHeaders, jsonResponse, createServiceClient, requireAuth, checkRateLimit, rateLimitResponse } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    if (!checkRateLimit(authResult.userId, 'inpaint', 10, 60)) {
      return rateLimitResponse();
    }

    const supabase = createServiceClient();
    const { job_id } = await req.json();

    if (!job_id || typeof job_id !== 'string') {
      return jsonResponse({ error: 'job_id required' }, 400);
    }

    const { data: job } = await supabase.from('inpainting_jobs').select('*').eq('id', job_id).single();
    if (!job) {
      return jsonResponse({ error: 'Job not found' }, 404);
    }

    if (job.user_id !== authResult.userId) {
      return jsonResponse({ error: 'Forbidden' }, 403);
    }

    await supabase.from('inpainting_jobs').update({ status: 'processing' }).eq('id', job_id).eq('status', 'pending');

    const replicateToken = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateToken) {
      await supabase.from('inpainting_jobs').update({ status: 'failed', error_message: 'API not configured', completed_at: new Date().toISOString() }).eq('id', job_id);
      return jsonResponse({ error: 'API not configured' }, 500);
    }

    try {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${replicateToken}` },
        body: JSON.stringify({
          version: job.model_id || 'stability-ai/sdxl',
          input: {
            image: job.source_image_url,
            mask: job.mask_image_url,
            prompt: job.prompt,
            negative_prompt: job.negative_prompt || '',
            ...job.settings,
          },
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const { output: result_url } = await response.json();

      await supabase.from('inpainting_jobs').update({
        status: 'completed',
        result_image_url: Array.isArray(result_url) ? result_url[0] : result_url,
        completed_at: new Date().toISOString(),
      }).eq('id', job_id);
    } catch (apiErr) {
      await supabase.from('inpainting_jobs').update({
        status: 'failed',
        error_message: (apiErr as Error).message || 'Inpainting API unavailable',
        completed_at: new Date().toISOString(),
      }).eq('id', job_id);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
