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
    const { data: job } = await supabase.from('restyle_jobs').select('*, style_preset:style_presets(*)').eq('id', job_id).single();
    if (!job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
