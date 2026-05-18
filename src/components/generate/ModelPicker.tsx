import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MODEL_CREDITS } from '@/services/credits.service';
import { useTheme } from '@/providers/ThemeProvider';
import {
  colors,
  providerColors,
  spacing,
  fontSize,
  typography,
  borderRadius,
  withOpacity,
} from '@/lib/theme';
import type { AiModel } from '@/types';

type ProviderTab = 'huggingface' | 'replicate' | 'openai' | 'gemini';

const PROVIDER_TABS = [
  {
    key: 'huggingface' as const,
    label: 'Free',
    icon: 'gift-outline',
    activeStyle: 'green' as const,
    inactiveColor: providerColors.free,
  },
  {
    key: 'replicate' as const,
    label: 'Flux',
    icon: 'flash-outline',
    activeStyle: 'accent' as const,
    inactiveColor: undefined,
  },
  {
    key: 'openai' as const,
    label: 'DALL\u00B7E',
    icon: 'color-wand-outline',
    activeStyle: 'openai' as const,
    inactiveColor: providerColors.openai,
  },
  {
    key: 'gemini' as const,
    label: 'Imagen',
    icon: 'planet-outline',
    activeStyle: 'gemini' as const,
    inactiveColor: providerColors.gemini,
  },
] as const;

const ACTIVE_STYLES: Record<string, object> = {
  green: { backgroundColor: providerColors.free },
  accent: { backgroundColor: colors.accent },
  openai: { backgroundColor: providerColors.openai },
  gemini: { backgroundColor: providerColors.gemini },
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
  const { themeColors } = useTheme();
  const selectedCost = MODEL_CREDITS[selectedModel.id];

  return (
    <>
      {/* Provider Toggle */}
      <View style={[styles.providerToggle, { backgroundColor: themeColors.backgroundSecondary }]}>
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
              name={tab.icon as React.ComponentProps<typeof Ionicons>['name']}
              size={13}
              color={
                providerTab === tab.key
                  ? themeColors.textLight
                  : (tab.inactiveColor ?? themeColors.accent)
              }
            />
            <Text style={[styles.providerTabText, { color: themeColors.textSecondary }, providerTab === tab.key && styles.providerTabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Model Selector */}
      <Text style={[styles.label, { color: themeColors.textSecondary }]}>Model</Text>
      <Pressable
        style={[styles.modelSelector, { borderColor: themeColors.border, backgroundColor: themeColors.backgroundSecondary }]}
        onPress={onTogglePicker}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.modelNameRow}>
            <Text style={[styles.modelName, { color: themeColors.text }]}>{selectedModel.name}</Text>
            {selectedCost === 0 ? (
              <View style={styles.freeBadge}><Text style={styles.freeBadgeText}>FREE</Text></View>
            ) : selectedCost != null ? (
              <View style={styles.creditBadge}><Text style={styles.creditBadgeText}>{selectedCost} cr</Text></View>
            ) : null}
          </View>
          <Text style={[styles.modelDescription, { color: themeColors.textSecondary }]}>{selectedModel.description}</Text>
        </View>
        <Ionicons
          name={showModelPicker ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={themeColors.textSecondary}
        />
      </Pressable>

      {showModelPicker && (
        <View style={[styles.modelList, { borderColor: themeColors.border }]}>
          {filteredModels.map((model) => {
            const cost = MODEL_CREDITS[model.id];
            return (
              <Pressable
                key={model.id}
                style={[
                  styles.modelOption,
                  { borderBottomColor: themeColors.border },
                  model.id === selectedModel.id && { backgroundColor: themeColors.notificationUnread },
                ]}
                onPress={() => onModelSelect(model)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modelOptionName, { color: themeColors.text }, model.id === selectedModel.id && styles.modelOptionNameActive]}>
                    {model.name}
                  </Text>
                  <Text style={[styles.modelOptionDesc, { color: themeColors.textSecondary }]}>{model.description}</Text>
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
  },
  providerTabTextActive: {
    color: colors.textLight,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  modelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  modelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modelName: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
  },
  modelDescription: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    marginTop: 2,
  },
  modelList: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modelOptionName: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
  },
  modelOptionNameActive: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
  modelOptionDesc: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    marginTop: 2,
  },
  freeBadge: {
    backgroundColor: withOpacity(colors.success, 0.12),
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  freeBadgeText: { fontSize: fontSize.xs, fontFamily: typography.bold, color: colors.success },
  creditBadge: {
    backgroundColor: withOpacity(colors.primary, 0.08),
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  creditBadgeText: { fontSize: fontSize.xs, fontFamily: typography.bold, color: colors.primary },
});
