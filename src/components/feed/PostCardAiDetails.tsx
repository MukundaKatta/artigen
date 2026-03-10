import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import type { AiMetadata } from '@/types/database';

type PostCardAiDetailsProps = {
  aiMetadata: AiMetadata;
  showDetails: boolean;
  onToggleDetails: () => void;
  onPromptRemix?: (postId: string) => void;
  postId: string;
};

export const PostCardAiDetails = React.memo(function PostCardAiDetails({
  aiMetadata,
  showDetails,
  onToggleDetails,
  onPromptRemix,
  postId,
}: PostCardAiDetailsProps) {
  return (
    <>
      {/* AI Prompt Preview */}
      {aiMetadata.prompt && (
        <View style={styles.promptPreview}>
          <View style={styles.promptPreviewHeader}>
            <Ionicons name="sparkles" size={12} color={colors.accent} />
            <Text style={styles.promptPreviewLabel}>{aiMetadata.model_name}</Text>
          </View>
          <Text style={styles.promptPreviewText} numberOfLines={2} selectable>
            {aiMetadata.prompt}
          </Text>
          {onPromptRemix && (
            <AnimatedPressable
              style={styles.usePromptButton}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                onPromptRemix(postId);
              }}
              scaleValue={0.95}
              accessibilityRole="button"
              accessibilityLabel="Use this prompt to generate your own art"
            >
              <Ionicons name="flash-outline" size={14} color="#fff" />
              <Text style={styles.usePromptButtonText}>Use This Prompt</Text>
            </AnimatedPressable>
          )}
        </View>
      )}

      {/* AI Details toggle */}
      <AnimatedPressable
        onPress={onToggleDetails}
        style={styles.aiDetailsToggle}
        scaleValue={0.97}
      >
        <Ionicons name="sparkles-outline" size={14} color={colors.accent} />
        <Text style={styles.aiDetailsToggleText}>
          {showDetails ? 'Hide' : 'View'} AI Details
        </Text>
      </AnimatedPressable>

      {/* AI Details (expanded) */}
      {showDetails && (
        <View style={styles.aiDetailsContainer}>
          <View style={styles.aiDetailRow}>
            <Text style={styles.aiDetailLabel}>Model</Text>
            <Text style={styles.aiDetailValue}>{aiMetadata.model_name}</Text>
          </View>
          <View style={styles.aiDetailRow}>
            <Text style={styles.aiDetailLabel}>Prompt</Text>
            <Text style={styles.aiDetailValue} selectable>{aiMetadata.prompt}</Text>
          </View>
          {aiMetadata.negative_prompt ? (
            <View style={styles.aiDetailRow}>
              <Text style={styles.aiDetailLabel}>Neg. Prompt</Text>
              <Text style={styles.aiDetailValue}>{aiMetadata.negative_prompt}</Text>
            </View>
          ) : null}
          {(aiMetadata.style_tags as string[])?.length > 0 && (
            <View style={styles.aiTagsRow}>
              {(aiMetadata.style_tags as string[]).map((tag: string) => (
                <View key={tag} style={styles.aiTag}>
                  <Text style={styles.aiTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.aiSettingsRow}>
            {(aiMetadata.settings as any)?.steps != null && (
              <Text style={styles.aiSettingChip}>Steps: {(aiMetadata.settings as any).steps}</Text>
            )}
            {(aiMetadata.settings as any)?.cfg_scale != null && (
              <Text style={styles.aiSettingChip}>CFG: {(aiMetadata.settings as any).cfg_scale}</Text>
            )}
            {(aiMetadata.settings as any)?.seed != null && (
              <Text style={styles.aiSettingChip}>Seed: {(aiMetadata.settings as any).seed}</Text>
            )}
            {aiMetadata.generation_time_ms != null && (
              <Text style={styles.aiSettingChip}>
                {(aiMetadata.generation_time_ms / 1000).toFixed(1)}s
              </Text>
            )}
          </View>
        </View>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  promptPreview: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    padding: spacing.md,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.12)',
  },
  promptPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  promptPreviewLabel: {
    fontSize: 11,
    fontFamily: typography.semiBold,
    color: colors.accent,
  },
  promptPreviewText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 18,
  },
  usePromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: spacing.sm,
  },
  usePromptButtonText: {
    fontSize: 12,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
  aiDetailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  aiDetailsToggleText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
  },
  aiDetailsContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  aiDetailRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  aiDetailLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    width: 70,
  },
  aiDetailValue: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.text,
    flex: 1,
    lineHeight: 16,
  },
  aiTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
  },
  aiTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  aiTagText: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: colors.accent,
  },
  aiSettingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  aiSettingChip: {
    fontSize: 10,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
