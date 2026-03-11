import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  corsHeaders,
  jsonResponse,
  requireAuth,
  checkRateLimit,
  rateLimitResponse,
} from '../_shared/auth.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const UPSCALE_CREDITS = 15;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;

  if (!checkRateLimit(authResult.userId, 'upscale', 10, 60)) {
    return rateLimitResponse();
  }

  try {
    const { image_url, scale } = await req.json();

    if (!image_url || typeof image_url !== 'string') {
      return jsonResponse({ error: 'image_url is required' }, 400);
    }
    if (image_url.length > 10000) {
      return jsonResponse({ error: 'image_url too long' }, 400);
    }

    const upscaleScale = scale === 4 ? 4 : 2;

    // Auth client for credit deduction
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Deduct credits
    const { error: deductErr } = await supabase.rpc('deduct_generation_credits', {
      p_user_id: authResult.userId,
      p_cost: UPSCALE_CREDITS,
    });

    if (deductErr) {
      if (deductErr.message?.includes('insufficient_credits')) {
        return jsonResponse({ error: 'insufficient_credits', credits_needed: UPSCALE_CREDITS }, 402);
      }
      throw deductErr;
    }

    const replicateToken = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateToken) {
      // Refund on config error
      await supabase.rpc('refund_generation_credits', { p_user_id: authResult.userId, p_cost: UPSCALE_CREDITS });
      return jsonResponse({ error: 'Upscaling service not configured' }, 500);
    }

    const startTime = Date.now();

    // Use Real-ESRGAN via Replicate for upscaling
    const predictionRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${replicateToken}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({
        version: '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
        input: {
          image: image_url,
          scale: upscaleScale,
          face_enhance: true,
        },
      }),
    });

    let prediction = await predictionRes.json();

    // Poll if not yet complete
    if (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
      let attempts = 0;
      while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < 30) {
        await new Promise((r) => setTimeout(r, 3000));
        prediction = await (await fetch(pollUrl, {
          headers: { Authorization: `Bearer ${replicateToken}` },
        })).json();
        attempts++;
      }
    }

    if (prediction.status === 'failed') {
      // Refund on failure
      await supabase.rpc('refund_generation_credits', { p_user_id: authResult.userId, p_cost: UPSCALE_CREDITS });
      return jsonResponse({ error: prediction.error || 'Upscaling failed' }, 500);
    }

    const outputUrl = typeof prediction.output === 'string' ? prediction.output : prediction.output?.[0];
    if (!outputUrl) {
      await supabase.rpc('refund_generation_credits', { p_user_id: authResult.userId, p_cost: UPSCALE_CREDITS });
      return jsonResponse({ error: 'Unexpected output from upscaler' }, 500);
    }

    // Log transaction
    const { data: wallet } = await supabase.from('wallets').select('id').eq('user_id', authResult.userId).maybeSingle();
    if (wallet) {
      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        type: 'ai_generation',
        amount_cents: UPSCALE_CREDITS,
        fee_cents: 0,
        description: `Image upscale ${upscaleScale}x`,
        status: 'completed',
      });
    }

    return jsonResponse({
      upscaled_url: outputUrl,
      scale: upscaleScale,
      credits_used: UPSCALE_CREDITS,
      processing_time_ms: Date.now() - startTime,
    });
  } catch (err: any) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
