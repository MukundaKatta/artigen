import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const HF_INFERENCE_URL = 'https://api-inference.huggingface.co/models';

const REPLICATE_MODELS: Record<string, { version: string; name: string }> = {
  'black-forest-labs/flux-schnell': {
    version: 'latest',
    name: 'Flux Schnell',
  },
  'black-forest-labs/flux-dev': {
    version: 'latest',
    name: 'Flux Dev',
  },
  'stability-ai/sdxl': {
    version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
    name: 'SDXL 1.0',
  },
  'stability-ai/stable-diffusion-3': {
    version: 'latest',
    name: 'Stable Diffusion 3',
  },
};

const HF_MODELS: Record<string, { name: string }> = {
  'stabilityai/stable-diffusion-xl-base-1.0': { name: 'SDXL 1.0' },
  'runwayml/stable-diffusion-v1-5': { name: 'Stable Diffusion 1.5' },
  'stabilityai/stable-diffusion-2-1': { name: 'Stable Diffusion 2.1' },
  'black-forest-labs/FLUX.1-schnell': { name: 'Flux Schnell' },
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// ── Hugging Face Generation ───────────────────────────────────
async function generateWithHuggingFace(
  modelId: string,
  prompt: string,
  negativePrompt?: string,
  width?: number,
  height?: number,
  steps?: number,
  cfgScale?: number,
  seed?: number,
) {
  const hfToken = Deno.env.get('HUGGINGFACE_API_TOKEN');
  if (!hfToken) {
    throw new Error('Hugging Face API token not configured');
  }

  const model = HF_MODELS[modelId];
  if (!model) {
    throw new Error(`Unsupported Hugging Face model: ${modelId}`);
  }

  const parameters: Record<string, unknown> = {};
  if (negativePrompt) parameters.negative_prompt = negativePrompt;
  if (width) parameters.width = width;
  if (height) parameters.height = height;
  if (steps) parameters.num_inference_steps = steps;
  if (cfgScale) parameters.guidance_scale = cfgScale;
  if (seed != null) parameters.seed = seed;

  const startTime = Date.now();

  // HF Inference API returns raw image bytes
  const response = await fetch(`${HF_INFERENCE_URL}/${modelId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfToken}`,
      'Content-Type': 'application/json',
      'x-wait-for-model': 'true',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMsg = `Hugging Face API error (${response.status})`;
    try {
      const parsed = JSON.parse(errorBody);
      errorMsg = parsed.error || parsed.message || errorMsg;
    } catch {
      // use default message
    }
    throw new Error(errorMsg);
  }

  const generationTime = Date.now() - startTime;

  // Response is raw image bytes — convert to base64 data URI
  const imageBuffer = await response.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  const imageUrl = `data:image/png;base64,${base64}`;

  return {
    image_url: imageUrl,
    prediction_id: `hf_${Date.now()}`,
    generation_time_ms: generationTime,
    model_id: modelId,
    model_name: model.name,
    settings: { steps, cfg_scale: cfgScale, seed, width, height },
  };
}

// ── Replicate Generation ──────────────────────────────────────
async function generateWithReplicate(
  modelId: string,
  prompt: string,
  negativePrompt?: string,
  width?: number,
  height?: number,
  steps?: number,
  cfgScale?: number,
  seed?: number,
  scheduler?: string,
) {
  const replicateToken = Deno.env.get('REPLICATE_API_TOKEN');
  if (!replicateToken) {
    throw new Error('Replicate API token not configured');
  }

  const model = REPLICATE_MODELS[modelId];
  if (!model) {
    throw new Error(`Unsupported Replicate model: ${modelId}`);
  }

  const input: Record<string, unknown> = { prompt };
  if (negativePrompt) input.negative_prompt = negativePrompt;
  if (width) input.width = width;
  if (height) input.height = height;
  if (steps) input.num_inference_steps = steps;
  if (cfgScale) input.guidance_scale = cfgScale;
  if (seed) input.seed = seed;
  if (scheduler) input.scheduler = scheduler;

  const startTime = Date.now();

  let replicateUrl: string;
  let body: Record<string, unknown>;

  if (modelId.startsWith('black-forest-labs/')) {
    replicateUrl = `https://api.replicate.com/v1/models/${modelId}/predictions`;
    body = { input };
  } else {
    replicateUrl = REPLICATE_API_URL;
    body = { version: model.version, input };
  }

  const predictionRes = await fetch(replicateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${replicateToken}`,
      'Content-Type': 'application/json',
      Prefer: 'wait',
    },
    body: JSON.stringify(body),
  });

  let prediction = await predictionRes.json();

  // Poll if not yet complete
  if (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
    const pollUrl = prediction.urls?.get || `${REPLICATE_API_URL}/${prediction.id}`;
    let attempts = 0;
    const maxAttempts = 60;

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const pollRes = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${replicateToken}` },
      });
      prediction = await pollRes.json();
      attempts++;
    }
  }

  const generationTime = Date.now() - startTime;

  if (prediction.status === 'failed') {
    throw new Error(prediction.error || 'Generation failed');
  }

  let imageUrl: string;
  const output = prediction.output;
  if (Array.isArray(output)) {
    imageUrl = output[0];
  } else if (typeof output === 'string') {
    imageUrl = output;
  } else {
    throw new Error('Unexpected output format');
  }

  return {
    image_url: imageUrl,
    prediction_id: prediction.id,
    generation_time_ms: generationTime,
    model_id: modelId,
    model_name: model.name,
    settings: { steps, cfg_scale: cfgScale, seed, width, height, scheduler },
  };
}

// ── Main Handler ──────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization' }, 401);
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const {
      model_id,
      provider = 'replicate',
      prompt,
      negative_prompt,
      width,
      height,
      steps,
      cfg_scale,
      seed,
      scheduler,
    } = await req.json();

    if (!model_id || !prompt) {
      return jsonResponse({ error: 'model_id and prompt are required' }, 400);
    }

    let result;
    if (provider === 'huggingface') {
      result = await generateWithHuggingFace(
        model_id, prompt, negative_prompt, width, height, steps, cfg_scale, seed
      );
    } else {
      result = await generateWithReplicate(
        model_id, prompt, negative_prompt, width, height, steps, cfg_scale, seed, scheduler
      );
    }

    return jsonResponse(result);
  } catch (err: any) {
    // Return 200 with error field so Supabase client passes the message through
    // (non-2xx causes the client to swallow the actual error)
    return jsonResponse({ error: err.message || 'Internal server error' });
  }
});
