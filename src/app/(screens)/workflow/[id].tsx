import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useWorkflow } from '@/hooks/useWorkflow';
import { WorkflowStepList } from '@/components/workflows/WorkflowStepList';
import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';

export default function WorkflowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { template, loading, loadTemplate, startRun } = useWorkflow(user?.id);

  useEffect(() => {
    if (id) loadTemplate(id);
  }, [id, loadTemplate]);

  const handleUse = useCallback(async () => {
    if (!template) return;
    const steps = Array.isArray(template.steps) ? template.steps : [];
    if (steps.length === 0) {
      Alert.alert('Error', 'This workflow has no steps.');
      return;
    }
    const { data, error } = await startRun(template.name, steps, template.id);
    if (error) {
      Alert.alert('Error', 'Failed to start workflow run.');
      return;
    }
    if (data) {
      router.push(`/(screens)/workflow/run/${data.id}`);
    }
  }, [template, startRun, router]);

  if (loading && !template) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Workflow' }} />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (!template) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Workflow' }} />
        <View style={styles.emptyContainer}>
          <Ionicons name="layers-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Workflow not found</Text>
        </View>
      </View>
    );
  }

  const steps = Array.isArray(template.steps) ? template.steps : [];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: template.name }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{template.name}</Text>
          {template.description && (
            <Text style={styles.description}>{template.description}</Text>
          )}

          {/* Author row */}
          <View style={styles.authorRow}>
            <Avatar uri={template.user?.avatar_url} size="sm" />
            <Text style={styles.authorName}>{template.user?.username}</Text>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="layers-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{steps.length} steps</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="play-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{formatNumber(template.use_count)} uses</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="bookmark-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{formatNumber(template.save_count)} saves</Text>
            </View>
          </View>
        </View>

        {/* Steps list */}
        <View style={styles.stepsContainer}>
          <Text style={styles.sectionTitle}>Steps</Text>
          <WorkflowStepList steps={steps} />
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.useButton}
            onPress={handleUse}
            activeOpacity={0.7}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.useButtonText}>Run Workflow</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
  },
  scroll: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  authorName: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  stepsContainer: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  useButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
});
