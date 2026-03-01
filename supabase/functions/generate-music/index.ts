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
    const { data: job } = await supabase.from('music_generation_jobs').select('*').eq('id', job_id).single();
    if (!job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Update status to processing
    await supabase.from('music_generation_jobs').update({ status: 'processing' }).eq('id', job_id);

    // Call music generation API (e.g., Replicate meta/musicgen)
    const apiUrl = Deno.env.get('MUSIC_API_URL') || 'https://api.replicate.com/v1/predictions';
    const apiKey = Deno.env.get('REPLICATE_API_KEY') || '';

    try {
      const prompt = [job.mood, job.genre, job.prompt].filter(Boolean).join(', ') || 'ambient music';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          version: 'b05b1dff1d8c6dc63d14b0cdb42135571e441f4bed3f3c3b978f530e1c1b6f44',
          input: {
            prompt,
            duration: job.duration_seconds || 30,
            model_version: 'stereo-large',
          },
        }),
      });

      if (!response.ok) throw new Error('Music generation API call failed');

      const prediction = await response.json();

      // Poll for completion (Replicate async pattern)
      let result = prediction;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max

      while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const pollResponse = await fetch(`${apiUrl}/${result.id}`, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        result = await pollResponse.json();
        attempts++;
      }

      if (result.status === 'succeeded' && result.output) {
        const audioUrl = typeof result.output === 'string' ? result.output : result.output[0];

        await supabase.from('music_generation_jobs').update({
          status: 'completed',
          result_audio_url: audioUrl,
          completed_at: new Date().toISOString(),
        }).eq('id', job_id);
      } else {
        throw new Error(result.error || 'Music generation failed');
      }
    } catch (err) {
      await supabase.from('music_generation_jobs').update({
        status: 'failed',
        error_message: (err as Error).message || 'Music generation API unavailable',
        completed_at: new Date().toISOString(),
      }).eq('id', job_id);
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
