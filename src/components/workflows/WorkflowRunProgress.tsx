import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { WorkflowRun, WorkflowStep, WorkflowStepResult } from '@/services/workflow.service';

type Props = {
  run: WorkflowRun;
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const STEP_CONFIG: Record<string, { icon: IoniconName; label: string; color: string }> = {
  generate: { icon: 'sparkles', label: 'Generate', color: colors.accent },
  restyle: { icon: 'color-palette', label: 'Restyle', color: '#EC4899' },
  inpaint: { icon: 'brush', label: 'Inpaint', color: '#F59E0B' },
  upscale: { icon: 'resize', label: 'Upscale', color: '#10B981' },
};

export function WorkflowRunProgress({ run }: Props) {
  const steps = Array.isArray(run.steps) ? run.steps : [];
  const results = Array.isArray(run.results) ? run.results : [];
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (run.current_step / totalSteps) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(100, progress)}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {run.status === 'completed'
            ? 'Completed'
            : run.status === 'failed'
              ? 'Failed'
              : run.status === 'paused'
                ? 'Paused'
                : `Step ${run.current_step + 1} of ${totalSteps}`}
        </Text>
      </View>

      {/* Error message */}
      {run.error_message && (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text style={styles.errorText}>{run.error_message}</Text>
        </View>
      )}

      {/* Steps + results */}
      <View style={styles.stepsList}>
        {steps.map((step: WorkflowStep, index: number) => {
          const config = STEP_CONFIG[step.type] || {
            icon: 'ellipsis-horizontal' as IoniconName,
            label: step.type,
            color: colors.textSecondary,
          };
          const isCompleted = index < run.current_step;
          const isActive = index === run.current_step && run.status === 'running';
          const result = results[index];

          return (
            <View key={index} style={styles.stepRow}>
              {/* Step indicator */}
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.stepDot,
                    isCompleted && styles.stepDotCompleted,
                    isActive && styles.stepDotActive,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : isActive ? (
                    <Ionicons name={config.icon} size={12} color="#fff" />
                  ) : (
                    <Text style={styles.stepDotNumber}>{index + 1}</Text>
                  )}
                </View>
                {index < steps.length - 1 && (
                  <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
                )}
              </View>

              {/* Step content */}
              <View style={styles.stepContent}>
                <View style={styles.stepHeaderRow}>
                  <Text style={[styles.stepLabel, { color: config.color }]}>{config.label}</Text>
                  {isActive && (
                    <View style={styles.runningBadge}>
                      <Text style={styles.runningBadgeText}>Running</Text>
                    </View>
                  )}
                </View>

                {/* Result thumbnail */}
                {result?.image_url && (
                  <Image
                    source={{ uri: result.image_url }}
                    style={styles.resultThumbnail}
                    contentFit="cover"
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Final result */}
      {run.status === 'completed' &&
        results.length > 0 &&
        results[results.length - 1]?.image_url && (
          <View style={styles.finalResult}>
            <Text style={styles.finalResultLabel}>Final Result</Text>
            <Image
              source={{ uri: results[results.length - 1].image_url }}
              style={styles.finalResultImage}
              contentFit="cover"
            />
          </View>
        )}

      {/* Intermediate results thumbnails */}
      {results.length > 1 && (
        <View style={styles.thumbnailSection}>
          <Text style={styles.thumbnailLabel}>Intermediate Results</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {results.map((result: WorkflowStepResult, index: number) =>
              result?.image_url ? (
                <Image
                  key={index}
                  source={{ uri: result.image_url }}
                  style={styles.thumbnail}
                  contentFit="cover"
                />
              ) : null,
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  progressBarContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.md,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.error,
    lineHeight: 18,
  },
  stepsList: {
    paddingHorizontal: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotCompleted: {
    backgroundColor: colors.success,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotNumber: {
    fontSize: 10,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: colors.border,
  },
  stepLineCompleted: {
    backgroundColor: colors.success + '60',
  },
  stepContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepLabel: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  runningBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  runningBadgeText: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  resultThumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    backgroundColor: colors.border,
  },
  finalResult: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  finalResultLabel: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  finalResultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.border,
  },
  thumbnailSection: {
    paddingTop: spacing.lg,
  },
  thumbnailLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  thumbnailRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
  },
});
