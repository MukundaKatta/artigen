import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Curated creative prompts ────────────────────────────────────

const PROMPTS = [
  { theme: 'Underwater city at sunset', description: 'Imagine a sprawling metropolis beneath the waves, bathed in warm golden light filtering through the ocean.', style: 'Photorealistic' },
  { theme: 'A cat as a Renaissance painting', description: 'Paint a regal feline portrait in the style of the Old Masters.', style: 'Classical oil painting' },
  { theme: 'Cyberpunk garden in neon rain', description: 'A lush garden where nature meets technology, illuminated by neon lights and falling rain.', style: 'Cyberpunk' },
  { theme: 'Ancient temple made of crystal', description: 'A sacred temple carved entirely from translucent crystal, refracting rainbow light.', style: 'Fantasy' },
  { theme: 'Robot reading a book in a library', description: 'A sentient robot sits quietly among towering shelves of old books.', style: 'Sci-fi illustration' },
  { theme: 'Floating islands above the clouds', description: 'Verdant islands drifting serenely above a sea of fluffy white clouds.', style: 'Dreamscape' },
  { theme: 'A dragon made of autumn leaves', description: 'A majestic dragon composed entirely of red, orange, and gold fallen leaves.', style: 'Nature fantasy' },
  { theme: 'Neon Tokyo street at 3 AM', description: 'The quiet beauty of a rain-slicked Tokyo alleyway glowing with neon signs.', style: 'Cinematic' },
  { theme: 'Steampunk hot air balloon race', description: 'Victorian-era airships racing through copper-tinted skies.', style: 'Steampunk' },
  { theme: 'A cozy treehouse in winter', description: 'A warm, inviting treehouse nestled in snow-covered branches with soft light glowing from within.', style: 'Storybook illustration' },
  { theme: 'Bioluminescent forest at night', description: 'A magical forest where every plant and creature glows with ethereal light.', style: 'Fantasy' },
  { theme: 'Space whale swimming among stars', description: 'A gentle cosmic whale drifting through a galaxy of twinkling stars.', style: 'Surreal' },
  { theme: 'Art Deco cityscape of the future', description: 'A futuristic city designed in lavish Art Deco style with gold and geometric patterns.', style: 'Art Deco' },
  { theme: 'A fox wearing a detective outfit', description: 'A clever fox in a trench coat and magnifying glass, solving mysteries.', style: 'Cartoon illustration' },
  { theme: 'Volcanic island paradise', description: 'A tropical island with an active volcano, surrounded by turquoise waters and lush vegetation.', style: 'Digital painting' },
  { theme: 'Abandoned amusement park at dawn', description: 'The haunting beauty of a forgotten carnival as the first light of day breaks through.', style: 'Atmospheric' },
  { theme: 'Origami animals come to life', description: 'Paper-folded animals unfolding and taking on vivid color and motion.', style: 'Paper craft' },
  { theme: 'Desert oasis with mirror-like water', description: 'A serene oasis in an endless desert, perfectly reflecting the sky above.', style: 'Photorealistic' },
  { theme: 'A castle built into a cliff face', description: 'An ancient fortress carved directly into towering sea cliffs.', style: 'Epic fantasy' },
  { theme: 'Mechanical butterfly garden', description: 'A garden filled with clockwork butterflies made of gears, brass, and jewels.', style: 'Steampunk' },
  { theme: 'Northern lights over a Viking village', description: 'Vivid aurora borealis dancing above a quiet Norse settlement.', style: 'Historical fantasy' },
  { theme: 'A coffee shop on the moon', description: 'A cozy lunar cafe with Earth visible through the window.', style: 'Retro sci-fi' },
  { theme: 'Samurai standing in cherry blossoms', description: 'A lone warrior in full armor beneath a shower of pink petals.', style: 'Japanese art' },
  { theme: 'Surreal melting clock landscape', description: 'A Dali-inspired dreamscape where time itself seems to melt and bend.', style: 'Surrealism' },
  { theme: 'Miniature world inside a snow globe', description: 'A tiny, detailed city thriving inside a magical snow globe.', style: 'Miniature' },
  { theme: 'Phoenix rising from digital flames', description: 'A mythical phoenix reborn from pixelated fire and data streams.', style: 'Digital art' },
  { theme: 'Enchanted library with flying books', description: 'An impossibly vast library where books soar through the air on their own.', style: 'Whimsical fantasy' },
  { theme: 'A wolf howling at a crystal moon', description: 'A majestic wolf silhouetted against a moon made of glowing crystal.', style: 'Fantasy' },
  { theme: 'Underwater coral reef ballroom', description: 'An elegant ballroom formed naturally within a vibrant coral reef.', style: 'Surreal' },
  { theme: 'Victorian greenhouse full of exotic plants', description: 'A grand glass greenhouse overflowing with rare and fantastical flora.', style: 'Botanical illustration' },
  { theme: 'Retro-futuristic space station', description: 'A 1960s vision of a space station with chrome and pastel interiors.', style: 'Retro sci-fi' },
  { theme: 'A bear painting at an easel', description: 'A gentle bear creating a masterpiece on canvas in a sunlit meadow.', style: 'Storybook illustration' },
  { theme: 'Glacier cave with hidden waterfalls', description: 'A breathtaking ice cave with crystalline walls and cascading water.', style: 'Nature photography' },
  { theme: 'Neon jellyfish in deep ocean', description: 'Luminous jellyfish pulsing with neon color in the darkest ocean depths.', style: 'Bioluminescent' },
  { theme: 'A village built on giant mushrooms', description: 'A whimsical settlement perched atop enormous, colorful toadstools.', style: 'Fantasy' },
  { theme: 'Sunset reflected in a motorcycle visor', description: 'A dramatic sunset captured in the mirrored visor of a motorcycle helmet.', style: 'Photorealistic' },
  { theme: 'Ancient Egyptian city at its peak', description: 'The glory of a pharaonic city in its golden age, bustling with life.', style: 'Historical' },
  { theme: 'A whale skeleton in a desert', description: 'The surreal sight of massive whale bones half-buried in sand dunes.', style: 'Surreal photography' },
  { theme: 'Fairy village inside a hollow tree', description: 'Tiny glowing homes and pathways hidden within the trunk of an ancient tree.', style: 'Fantasy miniature' },
  { theme: 'Cybernetic owl perched on a server rack', description: 'A half-mechanical owl with glowing eyes sitting atop humming technology.', style: 'Cyberpunk' },
  { theme: 'Hot springs on an alien planet', description: 'Steaming mineral pools on a strange world with two suns in the sky.', style: 'Sci-fi landscape' },
  { theme: 'A lighthouse in a thunderstorm', description: 'A steadfast lighthouse battling dramatic waves and lightning.', style: 'Dramatic' },
  { theme: 'Stained glass portrait of a scientist', description: 'A radiant stained glass window depicting a famous scientist at work.', style: 'Stained glass' },
  { theme: 'Bamboo forest with paper lanterns', description: 'A peaceful bamboo grove illuminated by floating paper lanterns at dusk.', style: 'Asian art' },
  { theme: 'A city inside a giant terrarium', description: 'A miniature civilization thriving inside an enormous glass container.', style: 'Surreal' },
  { theme: 'Pirate ship sailing through clouds', description: 'A weathered galleon navigating a sea of clouds instead of water.', style: 'Adventure fantasy' },
  { theme: 'Abstract emotion: Joy', description: 'Represent the feeling of pure joy using only color, shape, and light.', style: 'Abstract expressionism' },
  { theme: 'A maze of mirrors in a forest', description: 'Giant mirrors scattered through a misty forest, creating infinite reflections.', style: 'Surreal' },
  { theme: 'Polar bear exploring a sunken ship', description: 'An Arctic bear investigating a frozen shipwreck beneath ice-blue waters.', style: 'Digital painting' },
  { theme: 'Garden growing on a skyscraper roof', description: 'A lush, vibrant garden thriving on top of a modern glass skyscraper.', style: 'Urban nature' },
];

// ── Hash a date string to get a consistent index ────────────────

function hashDateToIndex(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % PROMPTS.length;
}

// ── CORS ────────────────────────────────────────────────────────

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

// ── Main Handler ────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Use today's date (UTC)
    const today = new Date().toISOString().split('T')[0];

    // Check if a challenge already exists for today
    const { data: existing } = await supabaseClient
      .from('daily_challenges')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      return jsonResponse({ challenge: existing, created: false });
    }

    // Pick a prompt using date hash
    const index = hashDateToIndex(today);
    const prompt = PROMPTS[index];

    const { data: challenge, error } = await supabaseClient
      .from('daily_challenges')
      .insert({
        prompt_theme: prompt.theme,
        description: prompt.description,
        date: today,
        style_suggestion: prompt.style,
      })
      .select()
      .single();

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ challenge, created: true });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
});
