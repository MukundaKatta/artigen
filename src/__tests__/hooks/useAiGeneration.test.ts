import { supabase } from '@/lib/supabase';
import { AI_MODELS, generateImage } from '@/services/ai.service';
import type { GenerateImageRequest, GenerateImageResponse } from '@/types';

// Since useAiGeneration is a React hook, we test the underlying service + model data
// and verify the hook's contract through the ai.service layer it depends on.
// Testing React hooks directly requires renderHook from @testing-library/react-hooks
// which may not be available; we focus on the logic the hook exercises.

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AI_MODELS selection', () => {
  it('default selected model is the first model (Flux Schnell)', () => {
    expect(AI_MODELS[0]).toBeDefined();
    expect(AI_MODELS[0].id).toBe('black-forest-labs/FLUX.1-schnell');
    expect(AI_MODELS[0].provider).toBe('huggingface');
  });

  it('all models have valid provider values', () => {
    const validProviders = ['huggingface', 'replicate', 'openai', 'gemini'];
    for (const model of AI_MODELS) {
      expect(validProviders).toContain(model.provider);
    }
  });

  it('all models have default width and height > 0', () => {
    for (const model of AI_MODELS) {
      expect(model.defaultSettings.width).toBeGreaterThan(0);
      expect(model.defaultSettings.height).toBeGreaterThan(0);
    }
  });

  it('all models have maxSteps > 0', () => {
    for (const model of AI_MODELS) {
      expect(model.maxSteps).toBeGreaterThan(0);
    }
  });

  it('can find a model by id', () => {
    const dalleModel = AI_MODELS.find((m) => m.id === 'dall-e-3-standard');
    expect(dalleModel).toBeDefined();
    expect(dalleModel!.provider).toBe('openai');
    expect(dalleModel!.name).toBe('DALL-E 3');
  });

  it('huggingface models are free (maxSteps <= 50)', () => {
    const hfModels = AI_MODELS.filter((m) => m.provider === 'huggingface');
    expect(hfModels.length).toBeGreaterThan(0);
    for (const model of hfModels) {
      expect(model.maxSteps).toBeLessThanOrEqual(50);
    }
  });

  it('SDXL replicate model has supported schedulers', () => {
    const sdxl = AI_MODELS.find((m) => m.id === 'stability-ai/sdxl');
    expect(sdxl).toBeDefined();
    expect(sdxl!.supportedSchedulers).toBeDefined();
    expect(sdxl!.supportedSchedulers!.length).toBeGreaterThan(0);
    expect(sdxl!.supportedSchedulers).toContain('K_EULER');
  });
});

describe('generateImage', () => {
  it('invokes supabase edge function with request body', async () => {
    const mockResponse: GenerateImageResponse = {
      image_url: 'https://example.com/image.png',
      prediction_id: 'pred-1',
      generation_time_ms: 3200,
      model_id: 'black-forest-labs/FLUX.1-schnell',
      model_name: 'Flux Schnell',
      settings: { steps: 4, width: 1024, height: 1024 },
    };

    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: mockResponse,
      error: null,
    });

    const request: GenerateImageRequest = {
      model_id: 'black-forest-labs/FLUX.1-schnell',
      provider: 'huggingface',
      prompt: 'A beautiful sunset over mountains',
      width: 1024,
      height: 1024,
      steps: 4,
    };

    const { data, error } = await generateImage(request);

    expect(supabase.functions.invoke).toHaveBeenCalledWith('generate', {
      body: request,
    });
    expect(data).toEqual(mockResponse);
    expect(error).toBeNull();
  });

  it('returns error message when edge function returns error', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Function invocation failed' },
    });

    const request: GenerateImageRequest = {
      model_id: 'black-forest-labs/FLUX.1-schnell',
      provider: 'huggingface',
      prompt: 'test',
    };

    const { data, error } = await generateImage(request);

    expect(data).toBeNull();
    expect(error).toBe('Function invocation failed');
  });

  it('returns error when response data contains an error field', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: { error: 'Insufficient credits' },
      error: null,
    });

    const request: GenerateImageRequest = {
      model_id: 'dall-e-3-standard',
      provider: 'openai',
      prompt: 'test',
    };

    const { data, error } = await generateImage(request);

    expect(data).toBeNull();
    expect(error).toBe('Insufficient credits');
  });

  it('returns successful response with all fields', async () => {
    const mockResponse: GenerateImageResponse = {
      image_url: 'https://cdn.example.com/generated.png',
      prediction_id: 'pred-abc',
      generation_time_ms: 5000,
      model_id: 'dall-e-3-hd',
      model_name: 'DALL-E 3 HD',
      settings: { quality: 'hd' },
    };

    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: mockResponse,
      error: null,
    });

    const request: GenerateImageRequest = {
      model_id: 'dall-e-3-hd',
      provider: 'openai',
      prompt: 'A photorealistic portrait',
      width: 1024,
      height: 1024,
    };

    const { data, error } = await generateImage(request);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.image_url).toBe('https://cdn.example.com/generated.png');
    expect(data!.prediction_id).toBe('pred-abc');
    expect(data!.generation_time_ms).toBe(5000);
    expect(data!.model_id).toBe('dall-e-3-hd');
  });

  it('handles edge function error with context body', async () => {
    // When the edge function returns a structured error with context.body
    const errorBody = JSON.stringify({ error: 'Model overloaded' });
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(errorBody));
        controller.close();
      },
    });

    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: {
        message: 'Edge function error',
        context: { body: readableStream },
      },
    });

    const request: GenerateImageRequest = {
      model_id: 'black-forest-labs/flux-schnell',
      provider: 'replicate',
      prompt: 'test',
    };

    const { data, error } = await generateImage(request);

    expect(data).toBeNull();
    expect(error).toBe('Model overloaded');
  });

  it('falls back to default error message when context body parsing fails', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: {
        message: 'Something went wrong',
        context: { body: 'not-json-stream' },
      },
    });

    const request: GenerateImageRequest = {
      model_id: 'black-forest-labs/flux-schnell',
      provider: 'replicate',
      prompt: 'test',
    };

    const { data, error } = await generateImage(request);

    expect(data).toBeNull();
    expect(error).toBe('Something went wrong');
  });
});

describe('generate function parameter building', () => {
  it('sends all optional parameters when provided', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: {
        image_url: 'https://example.com/img.png',
        prediction_id: 'p1',
        generation_time_ms: 1000,
        model_id: 'stability-ai/sdxl',
        model_name: 'SDXL',
        settings: {},
      },
      error: null,
    });

    const request: GenerateImageRequest = {
      model_id: 'stability-ai/sdxl',
      provider: 'replicate',
      prompt: 'A cat in space',
      negative_prompt: 'blurry, low quality',
      width: 1024,
      height: 1024,
      steps: 30,
      cfg_scale: 7.5,
      seed: 42,
      scheduler: 'K_EULER',
    };

    await generateImage(request);

    expect(supabase.functions.invoke).toHaveBeenCalledWith('generate', {
      body: request,
    });

    const calledBody = (supabase.functions.invoke as jest.Mock).mock.calls[0][1].body;
    expect(calledBody.negative_prompt).toBe('blurry, low quality');
    expect(calledBody.seed).toBe(42);
    expect(calledBody.scheduler).toBe('K_EULER');
    expect(calledBody.cfg_scale).toBe(7.5);
  });

  it('works without optional parameters', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: {
        image_url: 'https://example.com/img.png',
        prediction_id: 'p2',
        generation_time_ms: 500,
        model_id: 'black-forest-labs/FLUX.1-schnell',
        model_name: 'Flux Schnell',
        settings: {},
      },
      error: null,
    });

    const request: GenerateImageRequest = {
      model_id: 'black-forest-labs/FLUX.1-schnell',
      provider: 'huggingface',
      prompt: 'A simple test',
    };

    const { data, error } = await generateImage(request);

    expect(error).toBeNull();
    expect(data).toBeDefined();

    const calledBody = (supabase.functions.invoke as jest.Mock).mock.calls[0][1].body;
    expect(calledBody.negative_prompt).toBeUndefined();
    expect(calledBody.seed).toBeUndefined();
    expect(calledBody.scheduler).toBeUndefined();
  });
});
