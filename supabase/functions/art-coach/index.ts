import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  corsHeaders,
  jsonResponse,
  requireAuth,
  checkRateLimit,
  rateLimitResponse,
} from '../_shared/auth.ts';

const CRITIQUE_PROMPT = `You are an expert AI art critic and coach with deep knowledge of visual composition, color theory, digital art, and AI image generation.

Analyze this AI-generated artwork and return a JSON response with the following exact structure:
{
  "overallScore": <number 1-10>,
  "summary": "<2-3 sentence overall impression>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "dimensions": {
    "composition": { "score": <1-10>, "feedback": "<1 sentence>" },
    "colorPalette": { "score": <1-10>, "feedback": "<1 sentence>" },
    "detail": { "score": <1-10>, "feedback": "<1 sentence>" },
    "creativity": { "score": <1-10>, "feedback": "<1 sentence>" },
    "promptCraft": { "score": <1-10>, "feedback": "<1 sentence>" }
  },
  "promptSuggestions": ["<improved prompt idea 1>", "<improved prompt idea 2>"],
  "styleNotes": "<1-2 sentences about the art style detected>",
  "moodTags": ["<mood tag 1>", "<mood tag 2>", "<mood tag 3>"]
}

Be honest, specific, and constructive. Only return valid JSON, no markdown.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;

  if (!checkRateLimit(authResult.userId, 'art-coach', 10, 60)) {
    return rateLimitResponse();
  }

  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  if (!ANTHROPIC_API_KEY) return jsonResponse({ error: 'AI service not configured' }, 500);

  let imageUrl: string;
  let prompt: string | undefined;

  try {
    const body = await req.json();
    imageUrl = body.imageUrl;
    prompt = body.prompt;
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  if (!imageUrl || typeof imageUrl !== 'string') return jsonResponse({ error: 'imageUrl is required' }, 400);
  if (imageUrl.length > 10000) return jsonResponse({ error: 'imageUrl too long' }, 400);

  // URL validation: require HTTPS and allowed domains only (prevent SSRF)
  if (!imageUrl.startsWith('https://')) {
    return jsonResponse({ error: 'imageUrl must use HTTPS' }, 400);
  }
  const IMAGE_URL_ALLOWED_DOMAINS = [
    'supabase.co',
    'supabase.in',
    'replicate.delivery',
    'replicate.com',
    'pbxt.replicate.delivery',
    'oaidalleapiprodscus.blob.core.windows.net',
    'githubusercontent.com',
    'cloudflare.com',
    'firebasestorage.googleapis.com',
  ];
  try {
    const parsedUrl = new URL(imageUrl);
    const hostname = parsedUrl.hostname;
    // Block private/internal IPs
    if (/^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.|::1|fc|fd|fe80)/i.test(hostname)) {
      return jsonResponse({ error: 'Internal URLs are not allowed' }, 400);
    }
    const domainAllowed = IMAGE_URL_ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
    if (!domainAllowed) {
      return jsonResponse({ error: 'Image URL domain not allowed' }, 400);
    }
  } catch {
    return jsonResponse({ error: 'Invalid imageUrl' }, 400);
  }

  if (prompt && typeof prompt === 'string' && prompt.length > 4000) return jsonResponse({ error: 'prompt too long' }, 400);

  const userMessage: Record<string, unknown>[] = [
    {
      type: 'image',
      source: { type: 'url', url: imageUrl },
    },
  ];

  if (prompt) {
    userMessage.push({
      type: 'text',
      text: `The prompt used to generate this image was: "${prompt}"\n\n${CRITIQUE_PROMPT}`,
    });
  } else {
    userMessage.push({ type: 'text', text: CRITIQUE_PROMPT });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Anthropic error:', err);
    return jsonResponse({ error: 'AI analysis failed' }, 500);
  }

  const anthropicData = await response.json();
  const rawText = anthropicData.content?.[0]?.text ?? '';

  let critique: Record<string, unknown>;
  try {
    critique = JSON.parse(rawText);
  } catch {
    return jsonResponse({ error: 'Failed to parse AI response' }, 500);
  }

  return jsonResponse({ critique });
});
