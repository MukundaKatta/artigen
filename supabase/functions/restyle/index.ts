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
      .from('restyle_jobs')
      .select('*, style_preset:style_presets(*)')
      .eq('id', job_id)
      .single();

    if (!job) {
      return jsonResponse({ error: 'Job not found' }, 404);
    }

    if (job.user_id !== authResult.userId) {
      return jsonResponse({ error: 'Not authorized to process this job' }, 403);
    }

    // Update status to processing
    await supabase.from('restyle_jobs').update({ status: 'processing' }).eq('id', job_id);

    // Call img2img API (placeholder — replace with actual Stable Diffusion API)
    const apiUrl = Deno.env.get('IMG2IMG_API_URL') || 'https://api.example.com/img2img';
    const apiKey = Deno.env.get('IMG2IMG_API_KEY') || '';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          image_url: job.source_image_url,
          prompt: job.style_preset?.prompt_modifier || job.custom_style_prompt || '',
          model: job.style_preset?.model_id || 'stable-diffusion-xl',
        }),
      });

      if (!response.ok) throw new Error('API call failed');

      const { result_url } = await response.json();

      await supabase.from('restyle_jobs').update({
        status: 'completed',
        result_image_url: result_url,
        completed_at: new Date().toISOString(),
      }).eq('id', job_id);
    } catch {
      await supabase.from('restyle_jobs').update({
        status: 'failed',
        error_message: 'Style transfer API unavailable',
        completed_at: new Date().toISOString(),
      }).eq('id', job_id);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
