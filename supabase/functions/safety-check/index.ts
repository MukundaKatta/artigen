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

    const { post_id, image_url } = await req.json();

    if (!post_id || !image_url) {
      return new Response(JSON.stringify({ error: 'post_id and image_url required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Call image safety classifier API (placeholder — replace with actual API)
    const safetyApiUrl = Deno.env.get('SAFETY_API_URL') || '';
    const safetyApiKey = Deno.env.get('SAFETY_API_KEY') || '';

    let labelType: 'safe' | 'sensitive' | 'mature' | 'nsfw' = 'safe';
    let confidence: number | null = null;
    let categories: Record<string, number> = {};

    if (safetyApiUrl) {
      try {
        const response = await fetch(safetyApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${safetyApiKey}` },
          body: JSON.stringify({ image_url }),
        });

        if (response.ok) {
          const result = await response.json();
          labelType = result.label || 'safe';
          confidence = result.confidence || null;
          categories = result.categories || {};
        }
      } catch {
        // Default to safe if API fails
      }
    }

    // Upsert content label
    await supabase.from('content_labels').upsert({
      post_id,
      label_type: labelType,
      ai_confidence: confidence,
      ai_categories: categories,
      is_ai_labeled: true,
    }, { onConflict: 'post_id' });

    return new Response(JSON.stringify({ success: true, label: labelType }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
