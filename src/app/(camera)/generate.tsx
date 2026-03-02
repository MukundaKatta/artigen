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
import { Modal, TextInput, Switch } from 'react-native';

type Phase = 'prompt' | 'generating' | 'result';
type ProviderTab = 'huggingface' | 'replicate';

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
      showAlert('Generation Failed', genError);
    } else {
      setPhase('result');
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
      settings: JSON.stringify({ width, height, steps, cfg_scale, seed }),
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
    return (
      <View style={styles.centerContainer}>
        <LoadingSpinner />
        <Text style={styles.generatingTitle}>Generating...</Text>
        <Text style={styles.generatingPrompt} numberOfLines={3}>
          "{prompt.trim()}"
        </Text>
        <Text style={styles.generatingModel}>{selectedModel.name}</Text>
      </View>
    );
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
    );
  }

  // ── Prompt Phase ─────────────────────────────────────

  // save prompt modal
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
          <Pressable
            style={[
              styles.providerTab,
              providerTab === 'huggingface' && styles.providerTabActive,
            ]}
            onPress={() => handleProviderSwitch('huggingface')}
          >
            <Ionicons
              name="gift-outline"
              size={14}
              color={providerTab === 'huggingface' ? '#fff' : '#10B981'}
            />
            <Text
              style={[
                styles.providerTabText,
                providerTab === 'huggingface' && styles.providerTabTextActive,
              ]}
            >
              Free
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.providerTab,
              providerTab === 'replicate' && styles.providerTabActivePaid,
            ]}
            onPress={() => handleProviderSwitch('replicate')}
          >
            <Ionicons
              name="flash-outline"
              size={14}
              color={providerTab === 'replicate' ? '#fff' : '#8B5CF6'}
            />
            <Text
              style={[
                styles.providerTabText,
                providerTab === 'replicate' && styles.providerTabTextActive,
              ]}
            >
              Premium
            </Text>
          </Pressable>
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
            {filteredModels.map((model) => (
              <Pressable
                key={model.id}
                style={[
                  styles.modelOption,
                  model.id === selectedModel.id && styles.modelOptionActive,
                ]}
                onPress={() => handleModelSelect(model)}
              >
                <Text style={[
                  styles.modelOptionName,
                  model.id === selectedModel.id && styles.modelOptionNameActive,
                ]}>
                  {model.name}
                </Text>
                <Text style={styles.modelOptionDesc}>{model.description}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Prompt */}
        <Text style={styles.label}>Prompt</Text>
        <TextInput
          style={styles.promptInput}
          placeholder="Describe the image you want to create..."
          placeholderTextColor={colors.textSecondary}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

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
  // Generating phase
  generatingTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginTop: spacing.lg,
  },
  generatingPrompt: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  generatingModel: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.primary,
    marginTop: spacing.sm,
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
});
