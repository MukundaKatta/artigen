import { supabase } from '@/lib/supabase';
import { trackEvent, TELEMETRY_EVENTS } from '@/lib/telemetry';
import { captureException } from '@/lib/error-tracking';
import type { GenerateImageRequest, GenerateImageResponse, AiModel } from '@/types';

// ── Available Models ─────────────────────────────────────────

export const AI_MODELS: AiModel[] = [
  // ── Hugging Face (Free) ──────────────────────────────
  {
    id: 'black-forest-labs/FLUX.1-schnell',
    name: 'Flux Schnell',
    description: 'Fast, high-quality — Free via Hugging Face',
    category: 'image',
    provider: 'huggingface',
    defaultSettings: { steps: 4, cfg_scale: 0, width: 1024, height: 1024 },
    maxSteps: 4,
  },
  {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    name: 'SDXL 1.0',
    description: 'Versatile with many styles — Free via Hugging Face',
    category: 'image',
    provider: 'huggingface',
    defaultSettings: { steps: 30, cfg_scale: 7.5, width: 1024, height: 1024 },
    maxSteps: 50,
  },
  {
    id: 'stabilityai/stable-diffusion-2-1',
    name: 'Stable Diffusion 2.1',
    description: 'Reliable classic model — Free via Hugging Face',
    category: 'image',
    provider: 'huggingface',
    defaultSettings: { steps: 30, cfg_scale: 7.5, width: 768, height: 768 },
    maxSteps: 50,
  },
  {
    id: 'runwayml/stable-diffusion-v1-5',
    name: 'Stable Diffusion 1.5',
    description: 'Lightweight and fast — Free via Hugging Face',
    category: 'image',
    provider: 'huggingface',
    defaultSettings: { steps: 25, cfg_scale: 7.5, width: 512, height: 512 },
    maxSteps: 50,
  },
  // ── OpenAI DALL-E 3 (Premium) ────────────────────────
  {
    id: 'dall-e-3-standard',
    name: 'DALL-E 3',
    description: 'OpenAI — photorealistic, prompt-faithful — 40 credits',
    category: 'image',
    provider: 'openai',
    defaultSettings: { steps: 1, cfg_scale: 0, width: 1024, height: 1024 },
    maxSteps: 1,
  },
  {
    id: 'dall-e-3-hd',
    name: 'DALL-E 3 HD',
    description: 'OpenAI — maximum detail, hyper-real — 80 credits',
    category: 'image',
    provider: 'openai',
    defaultSettings: { steps: 1, cfg_scale: 0, width: 1024, height: 1024 },
    maxSteps: 1,
  },
  // ── Google Imagen 3 (Premium) ─────────────────────────
  {
    id: 'imagen-3',
    name: 'Imagen 3',
    description: 'Google — vivid, natural compositions — 25 credits',
    category: 'image',
    provider: 'gemini',
    defaultSettings: { steps: 1, cfg_scale: 0, width: 1024, height: 1024 },
    maxSteps: 1,
  },
  // ── Google Imagen 4 (Premium) ────────────────────────
  {
    id: 'imagen-4',
    name: 'Imagen 4',
    description: 'Google — next-gen photorealism, superior detail — 35 credits',
    category: 'image',
    provider: 'gemini',
    defaultSettings: { steps: 1, cfg_scale: 0, width: 1024, height: 1024 },
    maxSteps: 1,
  },
  // ── Replicate (Paid) ─────────────────────────────────
  {
    id: 'black-forest-labs/flux-2-schnell',
    name: 'FLUX.2 Schnell',
    description: 'Next-gen fast generation, improved coherence — 8 credits',
    category: 'image',
    provider: 'replicate',
    defaultSettings: { steps: 4, cfg_scale: 0, width: 1024, height: 1024 },
    maxSteps: 4,
  },
  {
    id: 'black-forest-labs/flux-2-dev',
    name: 'FLUX.2 Dev',
    description: 'Highest quality FLUX model, stunning detail — 40 credits',
    category: 'image',
    provider: 'replicate',
    defaultSettings: { steps: 28, cfg_scale: 3.5, width: 1024, height: 1024 },
    maxSteps: 50,
  },
  {
    id: 'black-forest-labs/flux-schnell',
    name: 'Flux Schnell',
    description: 'Fast, high-quality — ~$0.003/image',
    category: 'image',
    provider: 'replicate',
    defaultSettings: { steps: 4, cfg_scale: 0, width: 1024, height: 1024 },
    maxSteps: 4,
  },
  {
    id: 'black-forest-labs/flux-dev',
    name: 'Flux Dev',
    description: 'Highest quality, slower — ~$0.03/image',
    category: 'image',
    provider: 'replicate',
    defaultSettings: { steps: 28, cfg_scale: 3.5, width: 1024, height: 1024 },
    maxSteps: 50,
  },
  {
    id: 'stability-ai/sdxl',
    name: 'SDXL 1.0',
    description: 'Versatile, negative prompts — ~$0.01/image',
    category: 'image',
    provider: 'replicate',
    defaultSettings: { steps: 30, cfg_scale: 7.5, width: 1024, height: 1024, scheduler: 'K_EULER' },
    maxSteps: 50,
    supportedSchedulers: [
      'DDIM',
      'DPMSolverMultistep',
      'HeunDiscrete',
      'KarrasDPM',
      'K_EULER_ANCESTRAL',
      'K_EULER',
      'PNDM',
    ],
  },
  {
    id: 'stability-ai/stable-diffusion-3',
    name: 'Stable Diffusion 3',
    description: 'Best text rendering — ~$0.03/image',
    category: 'image',
    provider: 'replicate',
    defaultSettings: { steps: 28, cfg_scale: 5, width: 1024, height: 1024 },
    maxSteps: 50,
  },
];

// ── Generate Image ───────────────────────────────────────────

const GENERATION_TIMEOUT_MS = 120_000; // 2 minutes

function timeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Generation timed out. Please try again.')), ms),
  );
}

export async function generateImage(
  request: GenerateImageRequest
): Promise<{ data: GenerateImageResponse | null; error: string | null }> {
  const startTime = Date.now();

  trackEvent(TELEMETRY_EVENTS.generation_started, {
    model_id: request.model_id,
    provider: request.provider,
    width: request.width ?? 0,
    height: request.height ?? 0,
  });

  let data, error;
  try {
    const result = await Promise.race([
      supabase.functions.invoke('generate', { body: request }),
      timeoutPromise(GENERATION_TIMEOUT_MS),
    ]);
    data = result.data;
    error = result.error;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed';
    trackEvent(TELEMETRY_EVENTS.generation_failed, {
      model_id: request.model_id,
      provider: request.provider,
      error_message: msg.slice(0, 200),
      duration_ms: Date.now() - startTime,
    });
    return { data: null, error: msg };
  }

  const durationMs = Date.now() - startTime;

  if (error) {
    // Try to extract the real error from the response body
    let msg = error.message || 'Generation failed';
    try {
      if (typeof error.context === 'object' && error.context?.body) {
        const body = await new Response(error.context.body).json();
        if (body?.error) msg = body.error;
      }
    } catch {
      // use default message
    }

    trackEvent(TELEMETRY_EVENTS.generation_failed, {
      model_id: request.model_id,
      provider: request.provider,
      error_message: msg.slice(0, 200),
      duration_ms: durationMs,
    });
    captureException(new Error(`Generation failed: ${msg}`), {
      model_id: request.model_id,
      provider: request.provider,
    });

    return { data: null, error: msg };
  }

  if (data?.error) {
    trackEvent(TELEMETRY_EVENTS.generation_failed, {
      model_id: request.model_id,
      provider: request.provider,
      error_message: String(data.error).slice(0, 200),
      duration_ms: durationMs,
    });
    return { data: null, error: data.error };
  }

  trackEvent(TELEMETRY_EVENTS.generation_completed, {
    model_id: request.model_id,
    provider: request.provider,
    duration_ms: durationMs,
    generation_time_ms: (data as GenerateImageResponse).generation_time_ms ?? durationMs,
  });

  return { data: data as GenerateImageResponse, error: null };
}
