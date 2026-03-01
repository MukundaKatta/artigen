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
      return new Response(JSON.stringify({ error: 'job_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the job
    const { data: job } = await supabase
      .from('avatar_generation_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (!job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update status to processing
    await supabase
      .from('avatar_generation_jobs')
      .update({ status: 'processing' })
      .eq('id', job_id);

    // Build style prompt based on the selected style
    const stylePrompts: Record<string, string> = {
      anime: 'anime style portrait, vibrant colors, detailed eyes, cel-shaded',
      cartoon: 'cartoon style avatar, fun and colorful, exaggerated features, disney-like',
      '3d': '3D rendered portrait, high quality, octane render, realistic lighting',
      pixel: 'pixel art portrait, 16-bit style, retro gaming aesthetic',
      watercolor: 'watercolor painting portrait, soft edges, artistic brush strokes',
      oil_painting: 'oil painting portrait, classical art style, rich textures, museum quality',
      cyberpunk: 'cyberpunk portrait, neon lights, futuristic, tech-augmented',
      fantasy: 'fantasy art portrait, magical, ethereal glow, epic composition',
      minimalist: 'minimalist portrait, clean lines, simple shapes, flat design',
      pop_art: 'pop art portrait, bold colors, halftone dots, Andy Warhol style',
    };

    const stylePrompt = stylePrompts[job.style] || 'portrait';
    const fullPrompt = job.prompt_modifier
      ? `${stylePrompt}, ${job.prompt_modifier}`
      : stylePrompt;

    // Call Replicate API (e.g., tencentarc/photomaker)
    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN') || '';
    const replicateModelUrl =
      Deno.env.get('REPLICATE_AVATAR_MODEL_URL') ||
      'https://api.replicate.com/v1/predictions';

    try {
      const response = await fetch(replicateModelUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${replicateApiToken}`,
        },
        body: JSON.stringify({
          version: Deno.env.get('REPLICATE_AVATAR_MODEL_VERSION') || '',
          input: {
            input_images: job.source_image_urls,
            prompt: fullPrompt,
            num_outputs: 4,
            style_strength_ratio: 30,
          },
        }),
      });

      if (!response.ok) throw new Error('Replicate API call failed');

      const prediction = await response.json();

      // Poll for prediction completion
      let resultUrls: string[] = [];
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes at 5s intervals

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;

        const pollResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: { Authorization: `Token ${replicateApiToken}` },
          }
        );

        const pollData = await pollResponse.json();

        if (pollData.status === 'succeeded') {
          resultUrls = Array.isArray(pollData.output) ? pollData.output : [pollData.output];
          break;
        }

        if (pollData.status === 'failed' || pollData.status === 'canceled') {
          throw new Error(pollData.error || 'Avatar generation failed');
        }
      }

      if (resultUrls.length === 0) {
        throw new Error('Generation timed out');
      }

      await supabase
        .from('avatar_generation_jobs')
        .update({
          status: 'completed',
          result_urls: resultUrls,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job_id);
    } catch (err) {
      await supabase
        .from('avatar_generation_jobs')
        .update({
          status: 'failed',
          error_message: (err as Error).message || 'Avatar generation API unavailable',
          completed_at: new Date().toISOString(),
        })
        .eq('id', job_id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
