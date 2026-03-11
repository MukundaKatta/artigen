import { corsHeaders, jsonResponse, createServiceClient, requireAuth, checkRateLimit, rateLimitResponse } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    if (!checkRateLimit(authResult.userId, 'generate-music', 5, 60)) {
      return rateLimitResponse();
    }

    const supabase = createServiceClient();
    const { job_id } = await req.json();

    if (!job_id || typeof job_id !== 'string') {
      return jsonResponse({ error: 'job_id required' }, 400);
    }

    const { data: job } = await supabase.from('music_generation_jobs').select('*').eq('id', job_id).single();
    if (!job) {
      return jsonResponse({ error: 'Job not found' }, 404);
    }

    if (job.user_id !== authResult.userId) {
      return jsonResponse({ error: 'Forbidden' }, 403);
    }

    await supabase.from('music_generation_jobs').update({ status: 'processing' }).eq('id', job_id).eq('status', 'pending');

    const apiUrl = Deno.env.get('MUSIC_API_URL') || 'https://api.replicate.com/v1/predictions';
    const apiKey = Deno.env.get('REPLICATE_API_KEY') || Deno.env.get('REPLICATE_API_TOKEN') || '';

    if (!apiKey) {
      await supabase.from('music_generation_jobs').update({ status: 'failed', error_message: 'API not configured', completed_at: new Date().toISOString() }).eq('id', job_id);
      return jsonResponse({ error: 'API not configured' }, 500);
    }

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

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const prediction = await response.json();

      let result = prediction;
      let attempts = 0;
      const maxAttempts = 60;

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

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
