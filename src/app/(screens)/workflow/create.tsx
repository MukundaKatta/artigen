import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkflow } from '@/hooks/useWorkflow';
import { WorkflowStepList } from '@/components/workflows/WorkflowStepList';
import { WorkflowStepEditor } from '@/components/workflows/WorkflowStepEditor';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { WorkflowStep } from '@/services/workflow.service';

export default function CreateWorkflowScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createTemplate } = useWorkflow(user?.id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // ── Step management ───────────────────────────────

  const handleAddStep = useCallback((step: WorkflowStep) => {
    if (editingIndex !== null) {
      setSteps((prev) => prev.map((s, i) => (i === editingIndex ? step : s)));
      setEditingIndex(null);
    } else {
      setSteps((prev) => [...prev, step]);
    }
    setShowEditor(false);
  }, [editingIndex]);

  const handleRemoveStep = useCallback((index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleMoveStep = useCallback((fromIndex: number, toIndex: number) => {
    setSteps((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const handleEditStep = useCallback((index: number) => {
    setEditingIndex(index);
    setShowEditor(true);
  }, []);

  const handleCancelEditor = useCallback(() => {
    setShowEditor(false);
    setEditingIndex(null);
  }, []);

  // ── Save template ─────────────────────────────────

  const handleCreate = useCallback(async () => {
    if (!user?.id) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Workflow name is required.');
      return;
    }
    if (steps.length === 0) {
      Alert.alert('Error', 'Add at least one step to your workflow.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await createTemplate(
      name.trim(),
      description.trim() || undefined,
      steps,
      isPublic,
    );
    setSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Failed to create workflow. Please try again.');
      return;
    }

    if (data) {
      router.replace(`/(screens)/workflow/${data.id}`);
    }
  }, [user?.id, name, description, steps, isPublic, createTemplate, router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Workflow' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dreamy Landscape Pipeline"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what this workflow does..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Steps */}
        <View style={styles.field}>
          <Text style={styles.label}>Steps ({steps.length})</Text>
          <WorkflowStepList
            steps={steps}
            editable
            onRemoveStep={handleRemoveStep}
            onMoveStep={handleMoveStep}
            onEditStep={handleEditStep}
          />

          {showEditor ? (
            <WorkflowStepEditor
              step={editingIndex !== null ? steps[editingIndex] : undefined}
              onSave={handleAddStep}
              onCancel={handleCancelEditor}
            />
          ) : (
            <TouchableOpacity
              style={styles.addStepButton}
              onPress={() => {
                setEditingIndex(null);
                setShowEditor(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addStepText}>Add Step</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Public toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Ionicons name="globe-outline" size={20} color={colors.text} />
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Public Workflow</Text>
              <Text style={styles.toggleDescription}>
                Allow others to discover and use this workflow
              </Text>
            </View>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textLight}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.createButton, (!name.trim() || steps.length === 0 || submitting) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!name.trim() || steps.length === 0 || submitting}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Workflow</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    borderStyle: 'dashed',
    marginTop: spacing.sm,
  },
  addStepText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  toggleDescription: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: '#fff',
  },
});
