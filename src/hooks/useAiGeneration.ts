import { useState, useCallback } from 'react';
import { generateImage, AI_MODELS } from '@/services/ai.service';
import type { GenerateImageRequest, GenerateImageResponse, AiModel } from '@/types';

/**
 * AI image-generation hook used by the generate screen and remix flows.
 *
 * Behavior:
 * - `generate(request)` calls `generateImage` which handles credit deduction,
 *   NSFW pre-checks, and provider dispatch server-side (see `ai.service.ts`).
 *   Returns `{ data, error }` — never throws.
 * - Credit cost is determined per-model server-side (see the model's
 *   `credit_cost` field in `AI_MODELS`); the deduction is atomic with the
 *   generation request.
 * - The NSFW guard runs both on the input prompt (rejected with
 *   `error: 'NSFW_PROMPT'`) and on the output image (rejected with
 *   `error: 'NSFW_OUTPUT'`). Neither consumes credits.
 * - This hook does NOT poll — `generateImage` is request/response synchronous
 *   from the client's perspective. For background jobs (animate, restyle,
 *   text-to-3d) use `useJobPolling`.
 * - There is no abort — once submitted, the request runs to completion. To
 *   "cancel" UX-wise, the caller can ignore the eventual result via `reset()`.
 *
 * Returns: `{ generating, result, error, selectedModel, setSelectedModel,
 *           generate, reset }`.
 */
export function useAiGeneration() {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerateImageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AiModel>(AI_MODELS[0]);

  const generate = useCallback(async (request: GenerateImageRequest) => {
    setGenerating(true);
    setError(null);
    setResult(null);

    const { data, error: genError } = await generateImage(request);

    if (genError) {
      setError(genError);
    } else {
      setResult(data);
    }

    setGenerating(false);
    return { data, error: genError };
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setGenerating(false);
  }, []);

  return {
    generating,
    result,
    error,
    selectedModel,
    setSelectedModel,
    models: AI_MODELS,
    generate,
    reset,
  };
}
