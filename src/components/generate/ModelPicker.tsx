import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MODEL_CREDITS } from '@/services/credits.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { AiModel } from '@/types';

type ProviderTab = 'huggingface' | 'replicate' | 'openai' | 'gemini';

const PROVIDER_TABS = [
  { key: 'huggingface' as const, label: 'Free', icon: 'gift-outline', activeStyle: 'green' as const, inactiveColor: '#10B981' },
  { key: 'replicate' as const, label: 'Flux', icon: 'flash-outline', activeStyle: 'accent' as const, inactiveColor: undefined },
  { key: 'openai' as const, label: 'DALL·E', icon: 'color-wand-outline', activeStyle: 'openai' as const, inactiveColor: '#10a37f' },
  { key: 'gemini' as const, label: 'Imagen', icon: 'planet-outline', activeStyle: 'gemini' as const, inactiveColor: '#4285F4' },
] as const;

const ACTIVE_STYLES: Record<string, object> = {
  green: { backgroundColor: '#10B981' },
  accent: { backgroundColor: colors.accent },
  openai: { backgroundColor: '#10a37f' },
  gemini: { backgroundColor: '#4285F4' },
};

type Props = {
  providerTab: ProviderTab;
  selectedModel: AiModel;
  filteredModels: AiModel[];
  showModelPicker: boolean;
  onProviderSwitch: (tab: ProviderTab) => void;
  onModelSelect: (model: AiModel) => void;
  onTogglePicker: () => void;
};

export function ModelPicker({
  providerTab,
  selectedModel,
  filteredModels,
  showModelPicker,
  onProviderSwitch,
  onModelSelect,
  onTogglePicker,
}: Props) {
  return (
    <>
      {/* Provider Toggle */}
      <View style={styles.providerToggle}>
        {PROVIDER_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.providerTab, providerTab === tab.key && ACTIVE_STYLES[tab.activeStyle]]}
            onPress={() => onProviderSwitch(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: providerTab === tab.key }}
            accessibilityLabel={`${tab.label} AI provider`}
          >
            <Ionicons
              name={tab.icon as any}
              size={13}
              color={providerTab === tab.key ? '#fff' : (tab.inactiveColor ?? colors.accent)}
            />
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
        onPress={onTogglePicker}
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
                onPress={() => onModelSelect(model)}
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
    </>
  );
}

const styles = StyleSheet.create({
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
});
