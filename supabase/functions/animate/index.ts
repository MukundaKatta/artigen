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

    const { data: job } = await supabase.from('animation_jobs').select('*').eq('id', job_id).single();
    if (!job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
