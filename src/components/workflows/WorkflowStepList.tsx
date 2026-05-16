import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { WorkflowStep } from '@/services/workflow.service';

type Props = {
  steps: WorkflowStep[];
  currentStep?: number;
  editable?: boolean;
  onRemoveStep?: (index: number) => void;
  onMoveStep?: (fromIndex: number, toIndex: number) => void;
  onEditStep?: (index: number) => void;
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const STEP_CONFIG: Record<string, { icon: IoniconName; label: string; color: string }> = {
  generate: { icon: 'sparkles', label: 'Generate', color: colors.accent },
  restyle: { icon: 'color-palette', label: 'Restyle', color: '#EC4899' },
  inpaint: { icon: 'brush', label: 'Inpaint', color: '#F59E0B' },
  upscale: { icon: 'resize', label: 'Upscale', color: '#10B981' },
};

type StepItemProps = {
  step: WorkflowStep;
  index: number;
  totalSteps: number;
  currentStep?: number;
  editable: boolean;
  onRemoveStep?: (index: number) => void;
  onMoveStep?: (fromIndex: number, toIndex: number) => void;
  onEditStep?: (index: number) => void;
};

const WorkflowStepItem = React.memo(function WorkflowStepItem({
  step,
  index,
  totalSteps,
  currentStep,
  editable,
  onRemoveStep,
  onMoveStep,
  onEditStep,
}: StepItemProps) {
  const config = STEP_CONFIG[step.type] || { icon: 'ellipsis-horizontal' as IoniconName, label: step.type, color: colors.textSecondary };
  const isActive = currentStep === index;
  const isCompleted = currentStep !== undefined && index < currentStep;

  const handleEdit = useCallback(() => {
    if (editable) onEditStep?.(index);
  }, [editable, index, onEditStep]);

  const handleMoveUp = useCallback(() => onMoveStep?.(index, index - 1), [index, onMoveStep]);
  const handleMoveDown = useCallback(() => onMoveStep?.(index, index + 1), [index, onMoveStep]);
  const handleRemove = useCallback(() => onRemoveStep?.(index), [index, onRemoveStep]);

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.stepCard,
          isActive && styles.activeStep,
          isCompleted && styles.completedStep,
        ]}
        onPress={handleEdit}
        activeOpacity={editable ? 0.7 : 1}
        disabled={!editable}
      >
        {/* Step number + icon */}
        <View style={[styles.stepBadge, { backgroundColor: config.color + '20' }]}>
          {isCompleted ? (
            <Ionicons name="checkmark" size={16} color={colors.success} />
          ) : (
            <Ionicons name={config.icon} size={16} color={config.color} />
          )}
        </View>

        {/* Step info */}
        <View style={styles.stepInfo}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>Step {index + 1}</Text>
            <Text style={[styles.stepType, { color: config.color }]}>{config.label}</Text>
          </View>
          {step.prompt && (
            <Text style={styles.stepPrompt} numberOfLines={2}>{step.prompt}</Text>
          )}
          {step.custom_prompt && (
            <Text style={styles.stepPrompt} numberOfLines={2}>{step.custom_prompt}</Text>
          )}
          {step.type === 'upscale' && step.scale_factor && (
            <Text style={styles.stepPrompt}>{step.scale_factor}x upscale</Text>
          )}
        </View>

        {/* Edit controls */}
        {editable && (
          <View style={styles.editControls}>
            {index > 0 && (
              <TouchableOpacity onPress={handleMoveUp} hitSlop={8}>
                <Ionicons name="chevron-up" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {index < totalSteps - 1 && (
              <TouchableOpacity onPress={handleMoveDown} hitSlop={8}>
                <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleRemove} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* Connector line */}
      {index < totalSteps - 1 && (
        <View style={styles.connector}>
          <View style={[styles.connectorLine, isCompleted && styles.connectorCompleted]} />
        </View>
      )}
    </View>
  );
});

export const WorkflowStepList = React.memo(function WorkflowStepList({
  steps,
  currentStep,
  editable = false,
  onRemoveStep,
  onMoveStep,
  onEditStep,
}: Props) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <WorkflowStepItem
          key={index}
          step={step}
          index={index}
          totalSteps={steps.length}
          currentStep={currentStep}
          editable={editable}
          onRemoveStep={onRemoveStep}
          onMoveStep={onMoveStep}
          onEditStep={onEditStep}
        />
      ))}

      {steps.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="layers-outline" size={32} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No steps added yet</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeStep: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  completedStep: {
    borderColor: colors.success + '40',
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepInfo: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepNumber: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  stepType: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  stepPrompt: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  editControls: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    marginLeft: spacing.sm,
  },
  connector: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  connectorLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
  },
  connectorCompleted: {
    backgroundColor: colors.success + '60',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
