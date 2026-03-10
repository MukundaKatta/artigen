import { corsHeaders, jsonResponse, createServiceClient, requireAuth } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    const supabase = createServiceClient();
    const { job_id } = await req.json();

    if (!job_id) {
      return jsonResponse({ error: 'job_id required' }, 400);
    }

    const { data: job } = await supabase.from('text_to_3d_jobs').select('*').eq('id', job_id).single();
    if (!job) {
      return jsonResponse({ error: 'Job not found' }, 404);
    }

    if (job.user_id !== authResult.userId) {
      return jsonResponse({ error: 'Forbidden' }, 403);
    }

    await supabase.from('text_to_3d_jobs').update({ status: 'processing' }).eq('id', job_id).eq('status', 'pending');

    const apiUrl = Deno.env.get('TEXT_TO_3D_API_URL') || 'https://api.replicate.com/v1/predictions';
    const apiKey = Deno.env.get('REPLICATE_API_KEY') || Deno.env.get('REPLICATE_API_TOKEN') || '';

    if (!apiKey) {
      await supabase.from('text_to_3d_jobs').update({ status: 'failed', error_message: 'API not configured', completed_at: new Date().toISOString() }).eq('id', job_id);
      return jsonResponse({ error: 'API not configured' }, 500);
    }

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

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const prediction = await response.json();

      let result = prediction;
      let attempts = 0;
      const maxAttempts = 120;

      while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const pollResponse = await fetch(`${apiUrl}/${result.id}`, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        result = await pollResponse.json();
        attempts++;
      }

      if (result.status === 'succeeded' && result.output) {
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

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
