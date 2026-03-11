import { supabase } from '@/lib/supabase';

export const UPSCALE_CREDITS = 15;

export type UpscaleResult = {
  upscaled_url: string;
  scale: number;
  credits_used: number;
  processing_time_ms: number;
};

export async function upscaleImage(
  imageUrl: string,
  scale: 2 | 4 = 2,
): Promise<{ data: UpscaleResult | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('upscale-image', {
    body: { image_url: imageUrl, scale },
  });

  if (error) {
    let msg = error.message || 'Upscaling failed';
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

  return { data: data as UpscaleResult, error: null };
}
