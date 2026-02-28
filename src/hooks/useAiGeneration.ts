import { useState, useCallback } from 'react';
import { generateImage, AI_MODELS } from '@/services/ai.service';
import type { GenerateImageRequest, GenerateImageResponse, AiModel } from '@/types';

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
