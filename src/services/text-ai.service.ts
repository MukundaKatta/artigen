import { supabase } from '@/lib/supabase';

export type TextAITask = 'enhance_prompt' | 'write_caption' | 'chat' | 'describe_to_prompt';
export type TextAIProvider = 'claude' | 'gpt4o' | 'gemini';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export const TEXT_AI_PROVIDERS: { value: TextAIProvider; label: string; description: string }[] = [
  { value: 'claude',  label: 'Claude',   description: 'Anthropic — creative & nuanced' },
  { value: 'gpt4o',   label: 'GPT-4o',  description: 'OpenAI — versatile & powerful' },
  { value: 'gemini',  label: 'Gemini',   description: 'Google — multimodal & fast' },
];

async function callTextAI(
  task: TextAITask,
  provider: TextAIProvider,
  input: Record<string, unknown>
): Promise<{ result: string | null; credits_used: number; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('text-ai', {
    body: { task, provider, input },
  });

  if (error) {
    let msg = error.message || 'AI call failed';
    try {
      if (typeof error.context === 'object' && error.context?.body) {
        const body = await new Response(error.context.body).json();
        if (body?.error) msg = body.error;
      }
    } catch { /* use default */ }
    return { result: null, credits_used: 0, error: msg };
  }

  if (data?.error) {
    return { result: null, credits_used: 0, error: data.error };
  }

  return { result: data.result, credits_used: data.credits_used ?? 5, error: null };
}

export async function enhancePrompt(
  prompt: string,
  provider: TextAIProvider = 'claude'
): Promise<{ result: string | null; error: string | null }> {
  const { result, error } = await callTextAI('enhance_prompt', provider, { prompt });
  return { result, error };
}

export async function describeToPrompt(
  description: string,
  provider: TextAIProvider = 'claude'
): Promise<{ result: string | null; error: string | null }> {
  const { result, error } = await callTextAI('describe_to_prompt', provider, { description });
  return { result, error };
}

export async function writeCaption(
  imageUrl: string,
  provider: TextAIProvider = 'claude'
): Promise<{ result: string | null; error: string | null }> {
  const { result, error } = await callTextAI('write_caption', provider, { imageUrl });
  return { result, error };
}

export async function chatMessage(
  messages: ChatMessage[],
  provider: TextAIProvider = 'claude'
): Promise<{ result: string | null; error: string | null }> {
  const { result, error } = await callTextAI('chat', provider, { messages });
  return { result, error };
}
