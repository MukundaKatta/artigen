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
    const { data: job } = await supabase.from('text_to_3d_jobs').select('*').eq('id', job_id).single();
    if (!job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Update status to processing
    await supabase.from('text_to_3d_jobs').update({ status: 'processing' }).eq('id', job_id);

    // Call Text-to-3D API (Replicate/Meshy)
    const apiUrl = Deno.env.get('TEXT_TO_3D_API_URL') || 'https://api.replicate.com/v1/predictions';
    const apiKey = Deno.env.get('REPLICATE_API_KEY') || '';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          version: 'aff1dc25547e0e39ab0340fcc0017beb22c8e0e4bf4a48b435e642ece60be307',
          input: {
            prompt: job.prompt,
            negative_prompt: job.negative_prompt || '',
            ...(job.settings || {}),
          },
        }),
      });

      if (!response.ok) throw new Error('Text-to-3D API call failed');

      const prediction = await response.json();

      // Poll for completion (Replicate async pattern)
      let result = prediction;
      let attempts = 0;
      const maxAttempts = 120; // 10 minutes max for 3D generation

      while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const pollResponse = await fetch(`${apiUrl}/${result.id}`, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        result = await pollResponse.json();
        attempts++;
      }

      if (result.status === 'succeeded' && result.output) {
        // Output format depends on the model — typically has model URL and/or thumbnail
        const output = result.output;
        const modelUrl = typeof output === 'string'
          ? output
          : output.model_url || output.mesh || output[0];
        const thumbnailUrl = typeof output === 'object'
          ? output.thumbnail_url || output.preview || output.thumbnail || null
          : null;

        await supabase.from('text_to_3d_jobs').update({
          status: 'completed',
          result_model_url: modelUrl,
          result_thumbnail_url: thumbnailUrl || modelUrl,
          completed_at: new Date().toISOString(),
        }).eq('id', job_id);
      } else {
        throw new Error(result.error || 'Text-to-3D generation failed');
      }
    } catch (err) {
      await supabase.from('text_to_3d_jobs').update({
        status: 'failed',
        error_message: (err as Error).message || 'Text-to-3D API unavailable',
        completed_at: new Date().toISOString(),
      }).eq('id', job_id);
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
