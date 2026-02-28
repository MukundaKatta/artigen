import { supabase } from '@/lib/supabase';
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
  // ── Replicate (Paid) ─────────────────────────────────
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

export async function generateImage(
  request: GenerateImageRequest
): Promise<{ data: GenerateImageResponse | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('generate', {
    body: request,
  });

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
    return { data: null, error: msg };
  }

  if (data?.error) {
    return { data: null, error: data.error };
  }

  return { data: data as GenerateImageResponse, error: null };
}
