import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { createBattle } from '@/services/battle.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const TIME_OPTIONS = [5, 10, 15, 30, 60];

export default function CreateBattleScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!user?.id) return;
    if (!title.trim()) {
      Alert.alert('Error', 'Battle title is required.');
      return;
    }
    if (!theme.trim()) {
      Alert.alert('Error', 'Battle theme is required.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await createBattle(user.id, theme.trim(), title.trim(), timeLimit);
    setSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Failed to create battle. Please try again.');
      return;
    }

    if (data) {
      router.replace(`/(screens)/battle/${data.id}`);
    }
  }, [user?.id, title, theme, timeLimit, router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Battle' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Battle Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sunset Showdown"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Theme */}
        <View style={styles.field}>
          <Text style={styles.label}>Theme *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the art theme for this battle..."
            placeholderTextColor={colors.textSecondary}
            value={theme}
            onChangeText={setTheme}
            multiline
            numberOfLines={3}
            maxLength={300}
          />
          <Text style={styles.hint}>Both players will create art based on this theme</Text>
        </View>

        {/* Time limit */}
        <View style={styles.field}>
          <Text style={styles.label}>Time Limit</Text>
          <View style={styles.timeRow}>
            {TIME_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.timeChip, timeLimit === t && styles.timeChipActive]}
                onPress={() => setTimeLimit(t)}
                activeOpacity={0.7}
              >
                <Text style={[styles.timeChipText, timeLimit === t && styles.timeChipTextActive]}>
                  {t}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.hint}>How long each player has to create their art</Text>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            After both players submit their entries, the battle enters a 24-hour voting phase where the community decides the winner.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.createButton, (!title.trim() || !theme.trim() || submitting) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!title.trim() || !theme.trim() || submitting}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="flash" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create Battle</Text>
            </>
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
  hint: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timeChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeChipActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  timeChipText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  timeChipTextActive: {
    color: '#fff',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.primary,
    lineHeight: 18,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
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
