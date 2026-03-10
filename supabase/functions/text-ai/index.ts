import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, rateLimitResponse } from '../_shared/auth.ts';

const CREDITS_PER_CALL = 5;

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

type Task = 'enhance_prompt' | 'write_caption' | 'chat' | 'describe_to_prompt';
type Provider = 'claude' | 'gpt4o' | 'gemini';

function buildSystemPrompt(task: Task): string {
  switch (task) {
    case 'enhance_prompt':
      return 'You are an expert AI image prompt engineer. Take the user\'s rough prompt and rewrite it into a detailed, vivid, high-quality image generation prompt. Focus on style, lighting, composition, and mood. Return only the improved prompt, nothing else.';
    case 'write_caption':
      return 'You are a creative social media writer. Write a short, engaging caption for the AI artwork described or shown. Include 3-5 relevant hashtags at the end. Keep it under 150 characters before hashtags.';
    case 'describe_to_prompt':
      return 'You are an AI art prompt engineer. The user will describe what they want in plain English. Convert their description into a detailed, optimized prompt for an AI image generator like Stable Diffusion or DALL-E. Include style keywords, lighting, camera angle, and quality modifiers. Return only the final prompt.';
    case 'chat':
      return 'You are a helpful AI art assistant inside the Artigen app. Help users with creating AI art, understanding art styles, improving prompts, and exploring creative ideas. Be concise and inspiring.';
  }
}

// ── Claude ────────────────────────────────────────────────────
async function callClaude(task: Task, input: Record<string, unknown>): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('Anthropic API key not configured');

  const messages = task === 'chat'
    ? (input.messages as any[])
    : [{ role: 'user', content: input.prompt || input.description || input.imageUrl || '' }];

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: buildSystemPrompt(task),
      messages,
    }),
  });

  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

// ── OpenAI GPT-4o ─────────────────────────────────────────────
async function callGPT4o(task: Task, input: Record<string, unknown>): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const messages: any[] = [{ role: 'system', content: buildSystemPrompt(task) }];

  if (task === 'chat') {
    messages.push(...(input.messages as any[]));
  } else if (task === 'write_caption' && input.imageUrl) {
    messages.push({
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: input.imageUrl } },
        { type: 'text', text: 'Write a caption for this AI artwork.' },
      ],
    });
  } else {
    messages.push({ role: 'user', content: String(input.prompt || input.description || '') });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'gpt-4o', max_tokens: 512, messages }),
  });

  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ── Gemini ────────────────────────────────────────────────────
async function callGemini(task: Task, input: Record<string, unknown>): Promise<string> {
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  if (!apiKey) throw new Error('Google AI API key not configured');

  const systemPrompt = buildSystemPrompt(task);
  let userText = String(input.prompt || input.description || '');

  if (task === 'chat') {
    const msgs = input.messages as any[];
    userText = msgs[msgs.length - 1]?.content || '';
  }

  const parts: any[] = [{ text: systemPrompt + '\n\n' + userText }];

  if (task === 'write_caption' && input.imageUrl && String(input.imageUrl).startsWith('https')) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: '' } }); // URL-based not shown for simplicity
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    }
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── Main Handler ──────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Missing authorization' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return jsonResponse({ error: 'Unauthorized' }, 401);

    // Rate limit: 30 text-AI calls per minute per user
    if (!checkRateLimit(user.id, 'text-ai', 30, 60)) {
      return rateLimitResponse();
    }

    const body = await req.json();
    const task = body.task as Task;
    const provider = (body.provider || 'claude') as Provider;
    const input = body.input as Record<string, unknown>;

    const validTasks: Task[] = ['enhance_prompt', 'write_caption', 'chat', 'describe_to_prompt'];
    const validProviders: Provider[] = ['claude', 'gpt4o', 'gemini'];

    if (!task || !validTasks.includes(task)) {
      return jsonResponse({ error: `task must be one of: ${validTasks.join(', ')}` }, 400);
    }
    if (!validProviders.includes(provider)) {
      return jsonResponse({ error: `provider must be one of: ${validProviders.join(', ')}` }, 400);
    }
    if (!input || typeof input !== 'object') {
      return jsonResponse({ error: 'input object is required' }, 400);
    }
    if (task === 'chat' && (!Array.isArray(input.messages) || input.messages.length === 0)) {
      return jsonResponse({ error: 'chat task requires non-empty messages array' }, 400);
    }
    if (task === 'chat' && (input.messages as unknown[]).length > 50) {
      return jsonResponse({ error: 'messages array exceeds 50 message limit' }, 400);
    }

    // Deduct credits before calling AI
    const { error: deductError } = await supabase.rpc('deduct_generation_credits', {
      p_user_id: user.id,
      p_cost: CREDITS_PER_CALL,
    });

    if (deductError) {
      if (deductError.message?.includes('insufficient_credits')) {
        return jsonResponse({ error: 'insufficient_credits', credits_needed: CREDITS_PER_CALL }, 402);
      }
      throw deductError;
    }

    let result: string;
    try {
      switch (provider) {
        case 'claude':  result = await callClaude(task, input);  break;
        case 'gpt4o':   result = await callGPT4o(task, input);   break;
        case 'gemini':  result = await callGemini(task, input);  break;
        default: throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (genErr) {
      // Refund on failure
      await supabase.rpc('refund_generation_credits', { p_user_id: user.id, p_cost: CREDITS_PER_CALL });
      throw genErr;
    }

    // Log transaction
    const { data: wallet } = await supabase.from('wallets').select('id').eq('user_id', user.id).maybeSingle();
    if (wallet) {
      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        type: 'ai_generation',
        amount_cents: CREDITS_PER_CALL,
        fee_cents: 0,
        description: `Text AI (${provider}) — ${task}`,
        status: 'completed',
      });
    }

    return jsonResponse({ result, credits_used: CREDITS_PER_CALL });
  } catch (err: any) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
