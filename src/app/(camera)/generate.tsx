import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAiGeneration } from '@/hooks/useAiGeneration';
import { AI_MODELS } from '@/services/ai.service';
import { showAlert } from '@/utils/alert';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';
import type { AiModel } from '@/types';
import Slider from '@react-native-community/slider';
import { createPrompt } from '@/services/prompt-library.service';
import { enhancePrompt, describeToPrompt } from '@/services/text-ai.service';
import { MODEL_CREDITS } from '@/services/credits.service';

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
  const base = model.defaultSettings.width; // native resolution
  const maxDim = Math.max(ratio.wRatio, ratio.hRatio);
  const scale = base / maxDim;
  // Round to nearest multiple of 64 (required by most diffusion models)
  const w = Math.round((ratio.wRatio * scale) / 64) * 64;
  const h = Math.round((ratio.hRatio * scale) / 64) * 64;
  return { width: w, height: h };
}

function GeneratingView({ prompt, modelName }: { prompt: string; modelName: string }) {
  const pulse = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
    shimmer.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1, false);
  }, [pulse, shimmer]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.95, 1.05]) }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-200, 200]) }],
  }));

  return (
    <View style={styles.centerContainer}>
      <Animated.View style={glowStyle}>
        <LinearGradient
          colors={['#8B5CF6', '#6D28D9', '#4C1D95']}
          style={styles.generatingOrb}
        >
          <Ionicons name="sparkles" size={40} color="#fff" />
        </LinearGradient>
      </Animated.View>
      <Text style={styles.generatingTitle}>Creating your art...</Text>
      <Text style={styles.generatingPrompt} numberOfLines={3}>
        "{prompt}"
      </Text>
      <View style={styles.generatingModelRow}>
        <Ionicons name="sparkles" size={12} color="#8B5CF6" />
        <Text style={styles.generatingModel}>{modelName}</Text>
      </View>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressShimmer, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(139,92,246,0.5)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: 200, height: '100%' }}
          />
        </Animated.View>
      </View>
    </View>
  );
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

  const filteredModels = models.filter(
    (m) => m.category === 'image' && m.provider === providerTab
  );

  function handleProviderSwitch(tab: ProviderTab) {
    setProviderTab(tab);
    // Auto-select first model of the new provider
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

  async function handleGenerate() {
    if (!prompt.trim()) {
      showAlert('Error', 'Please enter a prompt');
      return;
    }

    setPhase('generating');

    const aspect = ASPECT_RATIOS[selectedAspect];
    const { width, height } = getAspectDimensions(aspect, selectedModel);
    const { error: genError } = await generate({
      model_id: selectedModel.id,
      provider: selectedModel.provider,
      prompt: prompt.trim(),
      negative_prompt: negativePrompt.trim() || undefined,
      width,
      height,
      steps,
      cfg_scale: cfgScale || undefined,
      seed: seed ? Number(seed) : undefined,
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
    }
  }

  function handleRegenerate() {
    setPhase('prompt');
    reset();
  }

  function handleUseImage() {
    if (!result) return;

    const aspect = ASPECT_RATIOS[selectedAspect];
    const { width, height } = getAspectDimensions(aspect, selectedModel);
    router.push({
      pathname: '/(camera)/new-post',
      params: {
        imageUri: result.image_url,
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

  // save prompt modal — defined here so it's available before early returns
  function renderSaveModal() {
    return (
      <Modal
        visible={showSaveModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Prompt</Text>
            <TextInput
              style={[styles.input, styles.modalInput]}
              placeholder="Title (optional)"
              value={saveTitle}
              onChangeText={setSaveTitle}
            />
            <View style={styles.switchRow}>
              <Text style={styles.modalLabel}>Public</Text>
              <Switch value={savePublic} onValueChange={setSavePublic} />
            </View>
            <View style={styles.modalButtons}>
              <Button title="Cancel" variant="outline" onPress={() => setShowSaveModal(false)} />
              <Button title="Save" onPress={confirmSavePrompt} />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // ── Generating Phase ─────────────────────────────────
  if (phase === 'generating') {
    return <GeneratingView prompt={prompt.trim()} modelName={selectedModel.name} />;
  }

  // ── Result Phase ─────────────────────────────────────
  if (phase === 'result' && result) {
    return (
      <>
        {renderSaveModal()}
        <View style={styles.resultContainer}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <Image
            source={{ uri: result.image_url }}
            style={styles.resultImage}
            contentFit="contain"
          />
          <View style={styles.resultMeta}>
            <View style={styles.resultMetaRow}>
              <Ionicons name="sparkles" size={16} color="#8B5CF6" />
              <Text style={styles.resultModelName}>{result.model_name}</Text>
            </View>
            <Text style={styles.resultTime}>
              Generated in {(result.generation_time_ms / 1000).toFixed(1)}s
            </Text>
          </View>
          <Text style={styles.resultPromptLabel}>Prompt</Text>
          <Text style={styles.resultPromptText} selectable>
            {prompt.trim()}
          </Text>
        </ScrollView>
        <View style={styles.resultActions}>
          <Button
            title="Regenerate"
            variant="outline"
            onPress={handleRegenerate}
            style={styles.resultButton}
          />
          {user && (
            <Button
              title="Save Prompt"
              variant="outline"
              onPress={handleSavePrompt}
              style={styles.resultButton}
            />
          )}
          <Button
            title="Use This"
            onPress={handleUseImage}
            style={styles.resultButton}
          />
        </View>
        </View>
      </>
    );
  }

  // ── Prompt Phase ─────────────────────────────────────

  return (
    <>
      {renderSaveModal()}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Provider Toggle */}
        <View style={styles.providerToggle}>
          {([
            { key: 'huggingface', label: 'Free', icon: 'gift-outline', activeStyle: styles.providerTabActive, activeColor: '#fff', inactiveColor: '#10B981' },
            { key: 'replicate',   label: 'Flux',  icon: 'flash-outline', activeStyle: styles.providerTabActivePaid, activeColor: '#fff', inactiveColor: '#8B5CF6' },
            { key: 'openai',      label: 'DALL·E', icon: 'color-wand-outline', activeStyle: styles.providerTabActiveOpenAI, activeColor: '#fff', inactiveColor: '#10a37f' },
            { key: 'gemini',      label: 'Imagen', icon: 'planet-outline', activeStyle: styles.providerTabActiveGemini, activeColor: '#fff', inactiveColor: '#4285F4' },
          ] as const).map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.providerTab, providerTab === tab.key && tab.activeStyle]}
              onPress={() => handleProviderSwitch(tab.key as ProviderTab)}
            >
              <Ionicons name={tab.icon as any} size={13} color={providerTab === tab.key ? tab.activeColor : tab.inactiveColor} />
              <Text style={[styles.providerTabText, providerTab === tab.key && styles.providerTabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Model Selector */}
        <Text style={styles.label}>Model</Text>
        <Pressable
          style={styles.modelSelector}
          onPress={() => setShowModelPicker(!showModelPicker)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.modelName}>{selectedModel.name}</Text>
            <Text style={styles.modelDescription}>{selectedModel.description}</Text>
          </View>
          <Ionicons
            name={showModelPicker ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>

        {showModelPicker && (
          <View style={styles.modelList}>
            {filteredModels.map((model) => {
              const cost = MODEL_CREDITS[model.id];
              return (
                <Pressable
                  key={model.id}
                  style={[styles.modelOption, model.id === selectedModel.id && styles.modelOptionActive]}
                  onPress={() => handleModelSelect(model)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modelOptionName, model.id === selectedModel.id && styles.modelOptionNameActive]}>
                      {model.name}
                    </Text>
                    <Text style={styles.modelOptionDesc}>{model.description}</Text>
                  </View>
                  {cost === 0 ? (
                    <View style={styles.freeBadge}><Text style={styles.freeBadgeText}>FREE</Text></View>
                  ) : (
                    <View style={styles.creditBadge}><Text style={styles.creditBadgeText}>{cost} cr</Text></View>
                  )}
                </Pressable>
              );
            })}
          </View>
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
        />
        {/* AI Prompt Enhancer row */}
        <View style={styles.enhancerRow}>
          <Pressable
            style={[styles.enhancerBtn, enhancing && styles.enhancerBtnDisabled]}
            onPress={async () => {
              if (!prompt.trim()) { showAlert('Enter a prompt first', ''); return; }
              setEnhancing(true);
              const fn = describeMode ? describeToPrompt : enhancePrompt;
              const { result, error } = await fn(prompt.trim());
              setEnhancing(false);
              if (error === 'insufficient_credits') {
                showAlert(
                  'Need Credits',
                  'Prompt enhancement costs 5 credits.',
                  () => router.push('/(screens)/buy-credits' as never),
                );
              } else if (error) {
                showAlert('Error', error);
              } else if (result) {
                setPrompt(result);
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
          <View style={styles.advancedContainer}>
            {/* Negative Prompt */}
            <Text style={styles.label}>Negative Prompt</Text>
            <TextInput
              style={[styles.promptInput, { height: 60 }]}
              placeholder="What to avoid..."
              placeholderTextColor={colors.textSecondary}
              value={negativePrompt}
              onChangeText={setNegativePrompt}
              multiline
              textAlignVertical="top"
            />

            {/* Steps */}
            <View style={styles.sliderRow}>
              <Text style={styles.label}>Steps: {steps}</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={selectedModel.maxSteps}
                step={1}
                value={steps}
                onValueChange={setSteps}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
            </View>

            {/* CFG Scale */}
            <View style={styles.sliderRow}>
              <Text style={styles.label}>CFG Scale: {cfgScale.toFixed(1)}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={20}
                step={0.5}
                value={cfgScale}
                onValueChange={setCfgScale}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
            </View>

            {/* Seed */}
            <Text style={styles.label}>Seed (optional)</Text>
            <TextInput
              style={styles.seedInput}
              placeholder="Random"
              placeholderTextColor={colors.textSecondary}
              value={seed}
              onChangeText={setSeed}
              keyboardType="number-pad"
            />
          </View>
        )}

        <Button
          title="Generate"
          onPress={handleGenerate}
          size="lg"
          style={styles.generateButton}
          disabled={!prompt.trim()}
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
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  providerToggle: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: 3,
    gap: 3,
  },
  providerTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  providerTabActive: {
    backgroundColor: '#10B981',
  },
  providerTabActivePaid: {
    backgroundColor: '#8B5CF6',
  },
  providerTabActiveOpenAI: {
    backgroundColor: '#10a37f',
  },
  providerTabActiveGemini: {
    backgroundColor: '#4285F4',
  },
  providerTabText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  providerTabTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  modelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  modelName: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  modelDescription: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modelList: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modelOptionActive: {
    backgroundColor: 'rgba(0, 149, 246, 0.08)',
  },
  modelOptionName: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  modelOptionNameActive: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
  modelOptionDesc: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
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
  advancedContainer: {
    paddingBottom: spacing.md,
  },
  sliderRow: {
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  seedInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
  },
  generateButton: {
    marginTop: spacing.xxl,
  },
  // save prompt modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    marginBottom: spacing.md,
    color: colors.text,
  },
  modalInput: {
    marginBottom: spacing.md,
  },
  modalLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  // Generating phase
  generatingOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    color: colors.text,
    marginTop: spacing.xl,
  },
  generatingPrompt: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
    paddingHorizontal: spacing.xl,
  },
  generatingModelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  generatingModel: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: '#8B5CF6',
  },
  progressBar: {
    width: 200,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.xl,
  },
  progressShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 200,
  },
  // Result phase
  resultContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  resultContent: {
    padding: spacing.lg,
  },
  resultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  resultModelName: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  resultTime: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  resultPromptLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  resultPromptText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  resultActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  resultButton: {
    flex: 1,
  },
  // Model option badges
  freeBadge: {
    backgroundColor: 'rgba(88,195,34,0.12)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  freeBadgeText: { fontSize: fontSize.xs, fontFamily: typography.bold, color: '#58C322' },
  creditBadge: {
    backgroundColor: `${colors.primary}15`,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  creditBadgeText: { fontSize: fontSize.xs, fontFamily: typography.bold, color: colors.primary },
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
});
