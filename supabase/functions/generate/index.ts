import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, rateLimitResponse } from '../_shared/auth.ts';

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const HF_INFERENCE_URL = 'https://api-inference.huggingface.co/models';

// Credit costs per model (0 = free)
const MODEL_CREDITS: Record<string, number> = {
  'black-forest-labs/FLUX.1-schnell': 0,
  'stabilityai/stable-diffusion-xl-base-1.0': 0,
  'stabilityai/stable-diffusion-2-1': 0,
  'runwayml/stable-diffusion-v1-5': 0,
  'black-forest-labs/flux-schnell': 5,
  'black-forest-labs/flux-dev': 30,
  'stability-ai/sdxl': 10,
  'stability-ai/stable-diffusion-3': 30,
  'dall-e-3-standard': 40,
  'dall-e-3-hd': 80,
  'imagen-3': 25,
  'imagen-4': 35,
  'black-forest-labs/flux-2-schnell': 8,
  'black-forest-labs/flux-2-dev': 40,
};

const REPLICATE_MODELS: Record<string, { version: string; name: string }> = {
  'black-forest-labs/flux-schnell': { version: 'latest', name: 'Flux Schnell' },
  'black-forest-labs/flux-dev': { version: 'latest', name: 'Flux Dev' },
  'stability-ai/sdxl': {
    version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
    name: 'SDXL 1.0',
  },
  'stability-ai/stable-diffusion-3': { version: 'latest', name: 'Stable Diffusion 3' },
  'black-forest-labs/flux-2-schnell': { version: 'latest', name: 'FLUX.2 Schnell' },
  'black-forest-labs/flux-2-dev': { version: 'latest', name: 'FLUX.2 Dev' },
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

// ── Hugging Face ──────────────────────────────────────────────
async function generateWithHuggingFace(
  modelId: string, prompt: string, negativePrompt?: string,
  width?: number, height?: number, steps?: number, cfgScale?: number, seed?: number,
) {
  const hfToken = Deno.env.get('HUGGINGFACE_API_TOKEN');
  if (!hfToken) throw new Error('Hugging Face API token not configured');
  const model = HF_MODELS[modelId];
  if (!model) throw new Error(`Unsupported Hugging Face model: ${modelId}`);

  const parameters: Record<string, unknown> = {};
  if (negativePrompt) parameters.negative_prompt = negativePrompt;
  if (width) parameters.width = width;
  if (height) parameters.height = height;
  if (steps) parameters.num_inference_steps = steps;
  if (cfgScale) parameters.guidance_scale = cfgScale;
  if (seed != null) parameters.seed = seed;

  const startTime = Date.now();
  const response = await fetch(`${HF_INFERENCE_URL}/${modelId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${hfToken}`, 'Content-Type': 'application/json', 'x-wait-for-model': 'true' },
    body: JSON.stringify({ inputs: prompt, parameters }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMsg = `Hugging Face API error (${response.status})`;
    try { const p = JSON.parse(errorBody); errorMsg = p.error || p.message || errorMsg; } catch { /* */ }
    throw new Error(errorMsg);
  }

  const imageBuffer = await response.arrayBuffer();
  const base64 = btoa(new Uint8Array(imageBuffer).reduce((d, b) => d + String.fromCharCode(b), ''));
  return {
    image_url: `data:image/png;base64,${base64}`,
    prediction_id: `hf_${Date.now()}`,
    generation_time_ms: Date.now() - startTime,
    model_id: modelId,
    model_name: model.name,
    settings: { steps, cfg_scale: cfgScale, seed, width, height },
  };
}

// ── Replicate ─────────────────────────────────────────────────
async function generateWithReplicate(
  modelId: string, prompt: string, negativePrompt?: string,
  width?: number, height?: number, steps?: number, cfgScale?: number,
  seed?: number, scheduler?: string, styleImageUrl?: string,
  img2imgStrength?: number, numOutputs?: number,
) {
  const replicateToken = Deno.env.get('REPLICATE_API_TOKEN');
  if (!replicateToken) throw new Error('Replicate API token not configured');
  const model = REPLICATE_MODELS[modelId];
  if (!model) throw new Error(`Unsupported Replicate model: ${modelId}`);

  const input: Record<string, unknown> = { prompt };
  if (negativePrompt) input.negative_prompt = negativePrompt;
  if (width) input.width = width;
  if (height) input.height = height;
  if (steps) input.num_inference_steps = steps;
  if (cfgScale) input.guidance_scale = cfgScale;
  if (seed) input.seed = seed;
  if (scheduler) input.scheduler = scheduler;
  if (styleImageUrl) {
    input.image = styleImageUrl;
    input.prompt_strength = img2imgStrength ?? 0.65;
  }
  if (numOutputs && numOutputs > 1) input.num_outputs = numOutputs;

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
    headers: { Authorization: `Bearer ${replicateToken}`, 'Content-Type': 'application/json', Prefer: 'wait' },
    body: JSON.stringify(body),
  });
  let prediction = await predictionRes.json();

  if (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
    const pollUrl = prediction.urls?.get || `${REPLICATE_API_URL}/${prediction.id}`;
    let attempts = 0;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < 60) {
      await new Promise((r) => setTimeout(r, 5000));
      prediction = await (await fetch(pollUrl, { headers: { Authorization: `Bearer ${replicateToken}` } })).json();
      attempts++;
    }
  }

  if (prediction.status === 'failed') throw new Error(prediction.error || 'Generation failed');
  const output = prediction.output;
  const imageUrls = Array.isArray(output) ? output : typeof output === 'string' ? [output] : [];
  if (imageUrls.length === 0) throw new Error('Unexpected output format');

  return {
    image_url: imageUrls[0],
    ...(imageUrls.length > 1 ? { image_urls: imageUrls } : {}),
    prediction_id: prediction.id,
    generation_time_ms: Date.now() - startTime,
    model_id: modelId,
    model_name: model.name,
    settings: { steps, cfg_scale: cfgScale, seed, width, height, scheduler, num_outputs: numOutputs },
  };
}

// ── DALL-E 3 ──────────────────────────────────────────────────
async function generateWithDallE(modelId: string, prompt: string, width?: number, height?: number) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const quality = modelId === 'dall-e-3-hd' ? 'hd' : 'standard';
  let size = '1024x1024';
  if (width && height) {
    const ratio = width / height;
    if (ratio > 1.2) size = '1792x1024';
    else if (ratio < 0.8) size = '1024x1792';
  }

  const startTime = Date.now();
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size, quality, response_format: 'url' }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `OpenAI error: ${res.status}`);
  }

  const data = await res.json();
  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) throw new Error('No image URL returned by DALL-E');

  return {
    image_url: imageUrl,
    prediction_id: `dalle_${Date.now()}`,
    generation_time_ms: Date.now() - startTime,
    model_id: modelId,
    model_name: modelId === 'dall-e-3-hd' ? 'DALL-E 3 HD' : 'DALL-E 3',
    settings: { size, quality, width, height },
  };
}

// ── Gemini Imagen 3 ───────────────────────────────────────────
async function generateWithImagen(prompt: string, width?: number, height?: number) {
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  if (!apiKey) throw new Error('Google AI API key not configured');

  const aspectRatio = (() => {
    if (!width || !height) return '1:1';
    const r = width / height;
    if (r > 1.4) return '16:9';
    if (r < 0.75) return '9:16';
    if (r > 1.1) return '4:3';
    if (r < 0.9) return '3:4';
    return '1:1';
  })();

  const startTime = Date.now();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio } }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `Imagen API error: ${res.status}`);
  }

  const data = await res.json();
  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('No image returned by Imagen');

  return {
    image_url: `data:image/png;base64,${b64}`,
    prediction_id: `imagen_${Date.now()}`,
    generation_time_ms: Date.now() - startTime,
    model_id: 'imagen-3',
    model_name: 'Imagen 3',
    settings: { aspectRatio, width, height },
  };
}

// ── Gemini Imagen 4 ───────────────────────────────────────────
async function generateWithImagen4(prompt: string, width?: number, height?: number) {
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  if (!apiKey) throw new Error('Google AI API key not configured');

  const aspectRatio = (() => {
    if (!width || !height) return '1:1';
    const r = width / height;
    if (r > 1.4) return '16:9';
    if (r < 0.75) return '9:16';
    if (r > 1.1) return '4:3';
    if (r < 0.9) return '3:4';
    return '1:1';
  })();

  const startTime = Date.now();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio } }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `Imagen 4 API error: ${res.status}`);
  }

  const data = await res.json();
  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('No image returned by Imagen 4');

  return {
    image_url: `data:image/png;base64,${b64}`,
    prediction_id: `imagen4_${Date.now()}`,
    generation_time_ms: Date.now() - startTime,
    model_id: 'imagen-4',
    model_name: 'Imagen 4',
    settings: { aspectRatio, width, height },
  };
}

// ── Main Handler ──────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Missing authorization' }, 401);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) return jsonResponse({ error: 'Unauthorized' }, 401);

    // Rate limit: 20 generations per minute per user
    if (!checkRateLimit(user.id, 'generate', 20, 60)) {
      return rateLimitResponse();
    }

    const body = await req.json();
    const model_id = body.model_id;
    const provider = body.provider || 'replicate';
    const prompt = body.prompt;
    const negative_prompt = body.negative_prompt;
    const width = body.width;
    const height = body.height;
    const steps = body.steps;
    const cfg_scale = body.cfg_scale;
    const seed = body.seed;
    const scheduler = body.scheduler;
    const style_image_url = body.style_image_url;
    const img2img_strength = body.img2img_strength;
    const num_outputs = body.num_outputs;

    if (!model_id || typeof model_id !== 'string') return jsonResponse({ error: 'model_id is required' }, 400);
    if (!prompt || typeof prompt !== 'string') return jsonResponse({ error: 'prompt is required' }, 400);
    if (prompt.length > 4000) return jsonResponse({ error: 'prompt exceeds 4000 character limit' }, 400);
    if (!['replicate', 'huggingface', 'openai', 'gemini'].includes(provider)) {
      return jsonResponse({ error: 'Invalid provider' }, 400);
    }
    if (width != null && (typeof width !== 'number' || width < 256 || width > 2048)) {
      return jsonResponse({ error: 'width must be between 256 and 2048' }, 400);
    }
    if (height != null && (typeof height !== 'number' || height < 256 || height > 2048)) {
      return jsonResponse({ error: 'height must be between 256 and 2048' }, 400);
    }
    if (steps != null && (typeof steps !== 'number' || steps < 1 || steps > 100)) {
      return jsonResponse({ error: 'steps must be between 1 and 100' }, 400);
    }
    if (cfg_scale != null && (typeof cfg_scale !== 'number' || cfg_scale < 0 || cfg_scale > 30)) {
      return jsonResponse({ error: 'cfg_scale must be between 0 and 30' }, 400);
    }
    if (num_outputs != null && (typeof num_outputs !== 'number' || num_outputs < 1 || num_outputs > 4)) {
      return jsonResponse({ error: 'num_outputs must be between 1 and 4' }, 400);
    }
    if (img2img_strength != null && (typeof img2img_strength !== 'number' || img2img_strength < 0.1 || img2img_strength > 1)) {
      return jsonResponse({ error: 'img2img_strength must be between 0.1 and 1' }, 400);
    }

    // Deduct credits for paid models
    const baseCreditCost = MODEL_CREDITS[model_id] ?? 10;
    const creditCost = baseCreditCost * (num_outputs ?? 1);
    if (creditCost > 0) {
      const { error: deductErr } = await supabaseClient.rpc('deduct_generation_credits', {
        p_user_id: user.id,
        p_cost: creditCost,
      });
      if (deductErr) {
        if (deductErr.message?.includes('insufficient_credits')) {
          return jsonResponse({ error: 'insufficient_credits', credits_needed: creditCost }, 402);
        }
        throw deductErr;
      }
    }

    let result: Record<string, unknown>;
    try {
      if (provider === 'huggingface') {
        result = await generateWithHuggingFace(model_id, prompt, negative_prompt, width, height, steps, cfg_scale, seed);
      } else if (provider === 'openai') {
        result = await generateWithDallE(model_id, prompt, width, height);
      } else if (provider === 'gemini') {
        result = model_id === 'imagen-4'
          ? await generateWithImagen4(prompt, width, height)
          : await generateWithImagen(prompt, width, height);
      } else {
        result = await generateWithReplicate(model_id, prompt, negative_prompt, width, height, steps, cfg_scale, seed, scheduler, style_image_url, img2img_strength, num_outputs);
      }
    } catch (genErr: any) {
      if (creditCost > 0) {
        await supabaseClient.rpc('refund_generation_credits', { p_user_id: user.id, p_cost: creditCost });
      }
      throw genErr;
    }

    // Log credit deduction
    if (creditCost > 0) {
      const { data: wallet } = await supabaseClient.from('wallets').select('id').eq('user_id', user.id).maybeSingle();
      if (wallet) {
        await supabaseClient.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          type: 'ai_generation',
          amount_cents: creditCost,
          fee_cents: 0,
          description: `Image generation — ${result.model_name || model_id}`,
          status: 'completed',
        });
      }
    }

    return jsonResponse(result);
  } catch (err: any) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
