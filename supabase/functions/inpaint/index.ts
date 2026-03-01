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

    const { job_id } = await req.json();

    if (!job_id) {
      return new Response(JSON.stringify({ error: 'job_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get the job
    const { data: job } = await supabase.from('inpainting_jobs').select('*').eq('id', job_id).single();
    if (!job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Update status to processing
    await supabase.from('inpainting_jobs').update({ status: 'processing' }).eq('id', job_id);

    // Call Replicate API for inpainting
    const replicateToken = Deno.env.get('REPLICATE_API_TOKEN') || '';

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

      if (!response.ok) throw new Error('API call failed');

      const { output: result_url } = await response.json();

      await supabase.from('inpainting_jobs').update({
        status: 'completed',
        result_image_url: Array.isArray(result_url) ? result_url[0] : result_url,
        completed_at: new Date().toISOString(),
      }).eq('id', job_id);
    } catch {
      await supabase.from('inpainting_jobs').update({
        status: 'failed',
        error_message: 'Inpainting API unavailable',
        completed_at: new Date().toISOString(),
      }).eq('id', job_id);
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
