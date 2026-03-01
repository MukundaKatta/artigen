import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import type { WorkflowTemplateWithUser } from '@/services/workflow.service';

type Props = {
  template: WorkflowTemplateWithUser;
  isSaved?: boolean;
  onToggleSave?: (templateId: string) => void;
};

const STEP_ICONS: Record<string, string> = {
  generate: 'sparkles',
  restyle: 'color-palette',
  inpaint: 'brush',
  upscale: 'resize',
};

export function WorkflowCard({ template, isSaved, onToggleSave }: Props) {
  const router = useRouter();
  const steps = Array.isArray(template.steps) ? template.steps : [];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(screens)/workflow/${template.id}`)}
      activeOpacity={0.7}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>{template.name}</Text>
          {template.description && (
            <Text style={styles.description} numberOfLines={2}>{template.description}</Text>
          )}
        </View>
        {onToggleSave && (
          <TouchableOpacity
            onPress={() => onToggleSave(template.id)}
            hitSlop={8}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Step icons row */}
      <View style={styles.stepsRow}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <View style={styles.stepIcon}>
              <Ionicons
                name={(STEP_ICONS[step.type] || 'ellipsis-horizontal') as any}
                size={14}
                color={colors.primary}
              />
            </View>
            {i < steps.length - 1 && <View style={styles.stepConnector} />}
          </React.Fragment>
        ))}
        <Text style={styles.stepCount}>{steps.length} steps</Text>
      </View>

      {/* Footer: author + stats */}
      <View style={styles.footer}>
        <View style={styles.authorRow}>
          <Avatar uri={template.user?.avatar_url} size="sm" />
          <Text style={styles.authorName}>{template.user?.username}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="play-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.statText}>{formatNumber(template.use_count)}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="bookmark-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.statText}>{formatNumber(template.save_count)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 4,
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepConnector: {
    width: 12,
    height: 2,
    backgroundColor: colors.primary + '30',
  },
  stepCount: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authorName: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});
