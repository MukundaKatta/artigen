import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useWorkflow } from '@/hooks/useWorkflow';
import { WorkflowRunProgress } from '@/components/workflows/WorkflowRunProgress';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export default function WorkflowRunScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { run, loading, loadRun, pauseRun, resumeRun } = useWorkflow(user?.id);

  useEffect(() => {
    if (id) loadRun(id);
  }, [id, loadRun]);

  const handlePause = useCallback(() => {
    pauseRun();
  }, [pauseRun]);

  const handleResume = useCallback(() => {
    resumeRun();
  }, [resumeRun]);

  if (loading && !run) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Workflow Run' }} />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (!run) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Workflow Run' }} />
        <View style={styles.emptyContainer}>
          <Ionicons name="layers-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Run not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: run.name }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{run.name}</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                run.status === 'running' && styles.statusRunning,
                run.status === 'completed' && styles.statusCompleted,
                run.status === 'failed' && styles.statusFailed,
                run.status === 'paused' && styles.statusPaused,
              ]}
            >
              <Text style={styles.statusText}>{run.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <WorkflowRunProgress run={run} />

        {/* Controls */}
        {(run.status === 'running' || run.status === 'paused') && (
          <View style={styles.controls}>
            {run.status === 'running' && (
              <TouchableOpacity style={styles.pauseButton} onPress={handlePause} activeOpacity={0.7}>
                <Ionicons name="pause" size={20} color={colors.text} />
                <Text style={styles.pauseButtonText}>Pause</Text>
              </TouchableOpacity>
            )}
            {run.status === 'paused' && (
              <TouchableOpacity style={styles.resumeButton} onPress={handleResume} activeOpacity={0.7}>
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.resumeButtonText}>Resume</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Completed message */}
        {run.status === 'completed' && (
          <View style={styles.completedCard}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            <Text style={styles.completedText}>Workflow completed successfully!</Text>
          </View>
        )}
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
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  statusRunning: {
    backgroundColor: colors.primary + '20',
  },
  statusCompleted: {
    backgroundColor: colors.success + '20',
  },
  statusFailed: {
    backgroundColor: colors.error + '20',
  },
  statusPaused: {
    backgroundColor: colors.warning + '20',
  },
  statusText: {
    fontSize: 10,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  controls: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pauseButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.medium,
    color: colors.text,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  resumeButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: '#fff',
  },
  completedCard: {
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.success + '10',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  completedText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
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
