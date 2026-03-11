import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAiGeneration } from '@/hooks/useAiGeneration';
import { AI_MODELS } from '@/services/ai.service';
import { showAlert } from '@/utils/alert';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { AiModel } from '@/types';
import { createPrompt } from '@/services/prompt-library.service';
import { enhancePrompt, describeToPrompt } from '@/services/text-ai.service';
import { PromptBuilder } from '@/components/generate/PromptBuilder';
import { MODEL_CREDITS } from '@/services/credits.service';
import { saveGeneration } from '@/services/generation-history.service';
import { upscaleImage, UPSCALE_CREDITS } from '@/services/upscale.service';

// Sub-components
import { GeneratingView } from '@/components/generate/GeneratingView';
import { ResultView } from '@/components/generate/ResultView';
import { ModelPicker } from '@/components/generate/ModelPicker';
import { SavePromptModal } from '@/components/generate/SavePromptModal';
import { AdvancedSettings } from '@/components/generate/AdvancedSettings';
import { TrendingPrompts } from '@/components/generate/TrendingPrompts';
import { PromptHistory } from '@/components/generate/PromptHistory';

type Phase = 'prompt' | 'generating' | 'result';
type ProviderTab = 'huggingface' | 'replicate' | 'openai' | 'gemini';

type AspectRatio = { label: string; wRatio: number; hRatio: number };

const ASPECT_RATIOS: AspectRatio[] = [
  { label: '1:1', wRatio: 1, hRatio: 1 },
  { label: '16:9', wRatio: 16, hRatio: 9 },
  { label: '9:16', wRatio: 9, hRatio: 16 },
  { label: '4:3', wRatio: 4, hRatio: 3 },
  { label: '3:4', wRatio: 3, hRatio: 4 },
];

/** Compute pixel dimensions that fit within the model's native resolution */
function getAspectDimensions(ratio: AspectRatio, model: AiModel) {
  const base = model.defaultSettings.width;
  const maxDim = Math.max(ratio.wRatio, ratio.hRatio);
  const scale = base / maxDim;
  const w = Math.round((ratio.wRatio * scale) / 64) * 64;
  const h = Math.round((ratio.hRatio * scale) / 64) * 64;
  return { width: w, height: h };
}

export default function GenerateRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    remixOfPostId?: string;
    remixPrompt?: string;
    remixNegativePrompt?: string;
    remixModelId?: string;
    remixSettings?: string;
    challengeId?: string;
    challengeTheme?: string;
    prefillPrompt?: string;
    prefill?: string;
  }>();
  const {
    generating,
    result,
    error,
    selectedModel,
    setSelectedModel,
    models,
    generate,
    reset,
  } = useAiGeneration();

  // Pre-fill from remix or challenge params
  const initialPrompt = params.remixPrompt || params.prefillPrompt || params.prefill || params.challengeTheme || '';
  const initialNegPrompt = params.remixNegativePrompt || '';

  const [phase, setPhase] = useState<Phase>('prompt');
  const [providerTab, setProviderTab] = useState<ProviderTab>('huggingface');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [negativePrompt, setNegativePrompt] = useState(initialNegPrompt);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [steps, setSteps] = useState(selectedModel.defaultSettings.steps);

  // prompt library save modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [savePublic, setSavePublic] = useState(true);
  const [cfgScale, setCfgScale] = useState(selectedModel.defaultSettings.cfg_scale);
  const [selectedAspect, setSelectedAspect] = useState(0);
  const [seed, setSeed] = useState('');
  const [enhancing, setEnhancing] = useState(false);
  const [describeMode, setDescribeMode] = useState(false);
  const [styleImageUri, setStyleImageUri] = useState<string | null>(null);
  const [img2imgStrength, setImg2imgStrength] = useState(0.65);
  const [batchCount, setBatchCount] = useState(1);
  const [upscaling, setUpscaling] = useState(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [showPromptBuilder, setShowPromptBuilder] = useState(false);

  async function handleUpscale() {
    if (!result?.image_url || upscaling) return;
    setUpscaling(true);
    const { data, error: upErr } = await upscaleImage(result.image_url, 2);
    setUpscaling(false);
    if (upErr === 'insufficient_credits') {
      showAlert(
        'Need Credits',
        `Upscaling costs ${UPSCALE_CREDITS} credits.`,
        () => router.push('/(screens)/buy-credits' as never),
      );
    } else if (upErr) {
      showAlert('Upscale Failed', upErr);
    } else if (data) {
      setUpscaledUrl(data.upscaled_url);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  async function pickStyleImage() {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
      allowsEditing: true,
    });
    if (!pickerResult.canceled && pickerResult.assets[0]) {
      const asset = pickerResult.assets[0];
      if (asset.base64) {
        setStyleImageUri(`data:image/jpeg;base64,${asset.base64}`);
      } else {
        setStyleImageUri(asset.uri);
      }
    }
  }

  const supportsStyleRef = ['replicate'].includes(selectedModel.provider);

  const filteredModels = models.filter(
    (m) => m.category === 'image' && m.provider === providerTab
  );

  function handleProviderSwitch(tab: ProviderTab) {
    setProviderTab(tab);
    const firstModel = models.find(
      (m) => m.category === 'image' && m.provider === tab
    );
    if (firstModel) {
      setSelectedModel(firstModel);
      setSteps(firstModel.defaultSettings.steps);
      setCfgScale(firstModel.defaultSettings.cfg_scale);
    }
    setShowModelPicker(false);
  }

  function handleModelSelect(model: AiModel) {
    setSelectedModel(model);
    setSteps(model.defaultSettings.steps);
    setCfgScale(model.defaultSettings.cfg_scale);
    setShowModelPicker(false);
  }

  function handleHistorySelect(historyPrompt: string, modelId: string) {
    setPrompt(historyPrompt);
    const model = models.find((m) => m.id === modelId);
    if (model) {
      handleModelSelect(model);
      setProviderTab(model.provider as ProviderTab);
    }
  }

  async function handleGenerate() {
    if (!prompt.trim()) {
      showAlert('Error', 'Please enter a prompt');
      return;
    }

    setPhase('generating');

    const aspect = ASPECT_RATIOS[selectedAspect];
    const { width, height } = getAspectDimensions(aspect, selectedModel);
    const { data: genResult, error: genError } = await generate({
      model_id: selectedModel.id,
      provider: selectedModel.provider,
      prompt: prompt.trim(),
      negative_prompt: negativePrompt.trim() || undefined,
      width,
      height,
      steps,
      cfg_scale: cfgScale || undefined,
      seed: seed ? Number(seed) : undefined,
      ...(styleImageUri ? { style_image_url: styleImageUri, img2img_strength: img2imgStrength } : {}),
      ...(batchCount > 1 ? { num_outputs: batchCount } : {}),
    });

    if (genError) {
      setPhase('prompt');
      if (genError === 'insufficient_credits') {
        showAlert(
          'Not Enough Credits',
          `This model costs ${MODEL_CREDITS[selectedModel.id] ?? 10} credits. Buy more to continue.`,
          () => router.push('/(screens)/buy-credits' as never),
        );
      } else {
        showAlert('Generation Failed', genError);
      }
    } else {
      setPhase('result');
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Save to generation history (fire-and-forget)
      if (user && genResult) {
        saveGeneration(user.id, {
          prompt: prompt.trim(),
          negative_prompt: negativePrompt.trim() || undefined,
          model_id: selectedModel.id,
          model_name: selectedModel.name,
          provider: selectedModel.provider,
          image_url: genResult.image_url,
          generation_time_ms: genResult.generation_time_ms,
          credits_used: MODEL_CREDITS[selectedModel.id] ?? 0,
          settings: genResult.settings || {},
        }).catch((err) => console.warn('Failed to save generation history:', err));
      }
    }
  }

  function handleRegenerate() {
    setPhase('prompt');
    setUpscaledUrl(null);
    reset();
  }

  function handleUseImage() {
    if (!result) return;

    const aspect = ASPECT_RATIOS[selectedAspect];
    const { width, height } = getAspectDimensions(aspect, selectedModel);
    router.push({
      pathname: '/(camera)/new-post',
      params: {
        imageUri: upscaledUrl || result.image_url,
        imageWidth: String(width),
        imageHeight: String(height),
        ...(params.remixOfPostId ? { remixOfPostId: params.remixOfPostId } : {}),
        ...(params.challengeId ? { challengeId: params.challengeId } : {}),
        aiMetadata: JSON.stringify({
          source: 'generated',
          provider: selectedModel.provider,
          model_id: result.model_id,
          model_name: result.model_name,
          prompt: prompt.trim(),
          negative_prompt: negativePrompt.trim(),
          style_tags: [],
          settings: result.settings,
          generation_time_ms: result.generation_time_ms,
          replicate_prediction_id: result.prediction_id,
        }),
      },
    });
  }

  async function handleSavePrompt() {
    if (!user) {
      showAlert('Error', 'Sign in to save prompts');
      return;
    }
    setShowSaveModal(true);
  }

  async function confirmSavePrompt() {
    if (!user) return;
    if (!prompt.trim()) {
      showAlert('Error', 'Prompt cannot be empty');
      return;
    }
    const title = saveTitle.trim() || prompt.trim().slice(0, 50);
    const aspect = ASPECT_RATIOS[selectedAspect];
    const { width, height } = getAspectDimensions(aspect, selectedModel);
    const { error } = await createPrompt({
      user_id: user.id,
      title,
      prompt: prompt.trim(),
      negative_prompt: negativePrompt.trim(),
      model_id: selectedModel.id,
      model_name: selectedModel.name,
      settings: { width, height, steps, cfg_scale: cfgScale, seed },
      style_tags: [],
      is_public: savePublic,
    });
    setShowSaveModal(false);
    if (error) {
      showAlert('Error', error.message || 'Failed to save prompt');
    } else {
      showAlert('Saved', 'Prompt added to your library');
      setSaveTitle('');
      setSavePublic(true);
    }
  }

  // ── Generating Phase ─────────────────────────────────
  if (phase === 'generating') {
    return <GeneratingView prompt={prompt.trim()} modelName={selectedModel.name} provider={selectedModel.provider} />;
  }

  // ── Result Phase ─────────────────────────────────────
  if (phase === 'result' && result) {
    return (
      <>
        <SavePromptModal
          visible={showSaveModal}
          title={saveTitle}
          isPublic={savePublic}
          onTitleChange={setSaveTitle}
          onPublicChange={setSavePublic}
          onCancel={() => setShowSaveModal(false)}
          onSave={confirmSavePrompt}
        />
        <ResultView
          imageUrl={result.image_url}
          upscaledUrl={upscaledUrl}
          modelName={result.model_name}
          generationTimeMs={result.generation_time_ms}
          prompt={prompt.trim()}
          upscaling={upscaling}
          showUpscale={!upscaledUrl && !!user}
          showSavePrompt={!!user}
          onRegenerate={handleRegenerate}
          onUpscale={handleUpscale}
          onSavePrompt={handleSavePrompt}
          onUseImage={handleUseImage}
        />
      </>
    );
  }

  // ── Prompt Phase ─────────────────────────────────────
  return (
    <>
      <SavePromptModal
        visible={showSaveModal}
        title={saveTitle}
        isPublic={savePublic}
        onTitleChange={setSaveTitle}
        onPublicChange={setSavePublic}
        onCancel={() => setShowSaveModal(false)}
        onSave={confirmSavePrompt}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ModelPicker
          providerTab={providerTab}
          selectedModel={selectedModel}
          filteredModels={filteredModels}
          showModelPicker={showModelPicker}
          onProviderSwitch={handleProviderSwitch}
          onModelSelect={handleModelSelect}
          onTogglePicker={() => setShowModelPicker(!showModelPicker)}
        />

        {/* Trending Prompts & Prompt History */}
        {!prompt.trim() && <TrendingPrompts onSelect={setPrompt} />}
        {!prompt.trim() && user && (
          <PromptHistory userId={user.id} onSelect={handleHistorySelect} />
        )}

        {/* Prompt */}
        <View style={styles.promptLabelRow}>
          <Text style={styles.label}>Prompt</Text>
          <Pressable
            style={styles.describeModeToggle}
            onPress={() => { setDescribeMode(!describeMode); setPrompt(''); }}
          >
            <Ionicons name={describeMode ? 'sparkles' : 'create-outline'} size={14} color={colors.primary} />
            <Text style={styles.describeModeText}>{describeMode ? 'Prompt mode' : 'Describe mode'}</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.promptInput}
          placeholder={describeMode
            ? 'Describe in plain English what you want (AI will write the prompt)...'
            : 'Describe the image you want to create...'}
          placeholderTextColor={colors.textSecondary}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          accessibilityLabel="Image generation prompt"
          accessibilityHint={describeMode ? 'Describe in plain English what you want' : 'Enter a detailed prompt for image generation'}
        />
        {/* AI Prompt Enhancer row */}
        <View style={styles.enhancerRow}>
          <Pressable
            style={[styles.enhancerBtn, enhancing && styles.enhancerBtnDisabled]}
            onPress={async () => {
              if (!prompt.trim()) { showAlert('Enter a prompt first', ''); return; }
              setEnhancing(true);
              const fn = describeMode ? describeToPrompt : enhancePrompt;
              const { result: enhanceResult, error: enhanceError } = await fn(prompt.trim());
              setEnhancing(false);
              if (enhanceError === 'insufficient_credits') {
                showAlert(
                  'Need Credits',
                  'Prompt enhancement costs 5 credits.',
                  () => router.push('/(screens)/buy-credits' as never),
                );
              } else if (enhanceError) {
                showAlert('Error', enhanceError);
              } else if (enhanceResult) {
                setPrompt(enhanceResult);
                setDescribeMode(false);
              }
            }}
            disabled={enhancing}
          >
            {enhancing ? (
              <LoadingSpinner size="small" />
            ) : (
              <Ionicons name="sparkles" size={14} color={colors.primary} />
            )}
            <Text style={styles.enhancerBtnText}>
              {describeMode ? 'Build Prompt with AI' : 'Enhance Prompt'} · 5 credits
            </Text>
          </Pressable>
        </View>

        {/* Prompt Builder */}
        {!showPromptBuilder && (
          <Pressable
            style={styles.enhancerBtn}
            onPress={() => setShowPromptBuilder(true)}
          >
            <Ionicons name="build-outline" size={14} color={colors.primary} />
            <Text style={styles.enhancerBtnText}>Prompt Builder · Free</Text>
          </Pressable>
        )}
        <PromptBuilder
          visible={showPromptBuilder}
          onInsert={(text) => setPrompt((prev) => prev ? `${prev}, ${text}` : text)}
          onClose={() => setShowPromptBuilder(false)}
        />

        {/* Style Reference Image */}
        {supportsStyleRef && (
          <View style={styles.styleRefSection}>
            <Text style={styles.label}>Style Reference (optional)</Text>
            {styleImageUri ? (
              <View style={styles.styleRefPreview}>
                <Image source={{ uri: styleImageUri }} style={styles.styleRefImage} contentFit="cover" />
                <View style={styles.styleRefOverlay}>
                  <Pressable
                    style={styles.styleRefRemove}
                    onPress={() => setStyleImageUri(null)}
                    accessibilityLabel="Remove style reference"
                  >
                    <Ionicons name="close-circle" size={24} color="#fff" />
                  </Pressable>
                </View>
                <View style={styles.sliderRow}>
                  <Text style={styles.label}>Influence: {Math.round(img2imgStrength * 100)}%</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0.1}
                    maximumValue={0.95}
                    step={0.05}
                    value={img2imgStrength}
                    onValueChange={setImg2imgStrength}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                    accessibilityLabel={`Style influence: ${Math.round(img2imgStrength * 100)}%`}
                  />
                </View>
              </View>
            ) : (
              <Pressable style={styles.styleRefPicker} onPress={pickStyleImage}>
                <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                <Text style={styles.styleRefPickerText}>Add a reference image</Text>
                <Text style={styles.styleRefPickerHint}>The AI will use this as a style guide</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Batch Generation */}
        {selectedModel.provider === 'replicate' && (
          <View style={styles.batchSection}>
            <Text style={styles.label}>Variations</Text>
            <View style={styles.batchRow}>
              {[1, 2, 3, 4].map((count) => (
                <Pressable
                  key={count}
                  style={[styles.batchChip, batchCount === count && styles.batchChipActive]}
                  onPress={() => setBatchCount(count)}
                >
                  <Text style={[styles.batchChipText, batchCount === count && styles.batchChipTextActive]}>
                    {count === 1 ? '1x' : `${count}x`}
                  </Text>
                </Pressable>
              ))}
              {batchCount > 1 && (
                <Text style={styles.batchCostText}>
                  {(MODEL_CREDITS[selectedModel.id] ?? 0) * batchCount} credits total
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Prompt Suggestions */}
        {!prompt.trim() && (
          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsLabel}>Try a prompt</Text>
              <Pressable
                onPress={() => router.push('/(screens)/generation-history' as never)}
                hitSlop={8}
                accessibilityLabel="View generation history"
              >
                <View style={styles.historyLink}>
                  <Ionicons name="time-outline" size={14} color={colors.primary} />
                  <Text style={styles.historyLinkText}>History</Text>
                </View>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
              {[
                'A majestic dragon perched on a crystal mountain at sunset',
                'Cyberpunk city street with neon signs and rain reflections',
                'Watercolor portrait of a woman with flowers in her hair',
                'Cute robot exploring an alien jungle, Pixar style',
                'Ancient temple overgrown with bioluminescent plants',
                'Astronaut floating above Earth with aurora borealis',
              ].map((suggestion) => (
                <Pressable
                  key={suggestion}
                  style={styles.suggestionChip}
                  onPress={() => setPrompt(suggestion)}
                >
                  <Text style={styles.suggestionChipText} numberOfLines={2}>
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Aspect Ratio */}
        <Text style={styles.label}>Aspect Ratio</Text>
        <View style={styles.aspectRow}>
          {ASPECT_RATIOS.map((ratio, index) => (
            <Pressable
              key={ratio.label}
              style={[
                styles.aspectChip,
                index === selectedAspect && styles.aspectChipActive,
              ]}
              onPress={() => setSelectedAspect(index)}
            >
              <Text style={[
                styles.aspectChipText,
                index === selectedAspect && styles.aspectChipTextActive,
              ]}>
                {ratio.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Advanced Settings */}
        <Pressable
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.advancedToggleText}>Advanced Settings</Text>
          <Ionicons
            name={showAdvanced ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>

        {showAdvanced && (
          <AdvancedSettings
            negativePrompt={negativePrompt}
            onNegativePromptChange={setNegativePrompt}
            steps={steps}
            onStepsChange={setSteps}
            maxSteps={selectedModel.maxSteps}
            cfgScale={cfgScale}
            onCfgScaleChange={setCfgScale}
            seed={seed}
            onSeedChange={setSeed}
          />
        )}

        <Button
          title={`Generate${MODEL_CREDITS[selectedModel.id] ? ` · ${(MODEL_CREDITS[selectedModel.id] ?? 0) * batchCount} credits` : ''}${batchCount > 1 ? ` (${batchCount}x)` : ''}`}
          onPress={handleGenerate}
          size="lg"
          style={styles.generateButton}
          disabled={!prompt.trim() || generating}
          loading={generating}
        />
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    height: 100,
    backgroundColor: colors.backgroundSecondary,
  },
  aspectRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  aspectChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  aspectChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
  },
  aspectChipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  aspectChipTextActive: {
    color: colors.primary,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  advancedToggleText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  generateButton: {
    marginTop: spacing.xxl,
  },
  promptLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.sm },
  describeModeToggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  describeModeText: { fontSize: fontSize.xs, fontFamily: typography.medium, color: colors.primary },
  enhancerRow: { marginTop: spacing.sm, marginBottom: spacing.sm },
  enhancerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  enhancerBtnDisabled: { opacity: 0.5 },
  enhancerBtnText: { fontSize: fontSize.sm, fontFamily: typography.medium, color: colors.primary },
  suggestionsContainer: {
    marginBottom: spacing.md,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  suggestionsLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyLinkText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  suggestionsScroll: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  suggestionChip: {
    backgroundColor: `${colors.primary}08`,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    maxWidth: 200,
  },
  suggestionChipText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 16,
  },
  // Style reference
  styleRefSection: {
    marginBottom: spacing.md,
  },
  styleRefPicker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
  },
  styleRefPickerText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  styleRefPickerHint: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  styleRefPreview: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  styleRefImage: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.md,
  },
  styleRefOverlay: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  styleRefRemove: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  sliderRow: {
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  // Batch generation
  batchSection: {
    marginBottom: spacing.md,
  },
  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  batchChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  batchChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
  },
  batchChipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  batchChipTextActive: {
    color: colors.primary,
  },
  batchCostText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
});
