import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { UPSCALE_CREDITS } from '@/services/upscale.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  imageUrl: string;
  upscaledUrl: string | null;
  modelName: string;
  generationTimeMs: number;
  prompt: string;
  upscaling: boolean;
  showUpscale: boolean;
  showSavePrompt: boolean;
  onRegenerate: () => void;
  onUpscale: () => void;
  onSavePrompt: () => void;
  onUseImage: () => void;
};

export function ResultView({
  imageUrl,
  upscaledUrl,
  modelName,
  generationTimeMs,
  prompt,
  upscaling,
  showUpscale,
  showSavePrompt,
  onRegenerate,
  onUpscale,
  onSavePrompt,
  onUseImage,
}: Props) {
  const displayUrl = upscaledUrl || imageUrl;

  return (
    <View style={styles.resultContainer}>
      <ScrollView contentContainerStyle={styles.resultContent}>
        <Image
          source={{ uri: displayUrl }}
          style={styles.resultImage}
          contentFit="contain"
        />
        {upscaledUrl && (
          <View style={styles.upscaleBadge}>
            <Ionicons name="resize-outline" size={12} color="#10B981" />
            <Text style={styles.upscaleBadgeText}>Upscaled 2x</Text>
          </View>
        )}
        <View style={styles.resultMeta}>
          <View style={styles.resultMetaRow}>
            <Ionicons name="sparkles" size={16} color={colors.accent} />
            <Text style={styles.resultModelName}>{modelName}</Text>
          </View>
          <Text style={styles.resultTime}>
            Generated in {(generationTimeMs / 1000).toFixed(1)}s
          </Text>
        </View>
        <Text style={styles.resultPromptLabel}>Prompt</Text>
        <Text style={styles.resultPromptText} selectable>
          {prompt}
        </Text>
      </ScrollView>
      <View style={styles.resultActions}>
        <Button
          title="Regenerate"
          variant="outline"
          onPress={onRegenerate}
          style={styles.resultButton}
        />
        {showUpscale && (
          <Button
            title={upscaling ? 'Upscaling...' : `Upscale 2x · ${UPSCALE_CREDITS} cr`}
            variant="outline"
            onPress={onUpscale}
            disabled={upscaling}
            style={styles.resultButton}
          />
        )}
        {showSavePrompt && (
          <Button
            title="Save Prompt"
            variant="outline"
            onPress={onSavePrompt}
            style={styles.resultButton}
          />
        )}
        <Button
          title="Use This"
          onPress={onUseImage}
          style={styles.resultButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  upscaleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  upscaleBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: '#10B981',
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
