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
import { createCommunity } from '@/services/community.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export default function CreateCommunityRoute() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [rulesInput, setRulesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!user?.id) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Community name is required.');
      return;
    }

    setSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const rules = rulesInput
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const { data, error } = await createCommunity({
      name: name.trim(),
      description: description.trim() || undefined,
      owner_id: user.id,
      is_private: isPrivate,
      tags,
      rules,
    });

    setSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Failed to create community. Please try again.');
      return;
    }

    if (data) {
      router.replace(`/(screens)/community/${data.id}`);
    }
  }, [user?.id, name, description, tagsInput, isPrivate, rulesInput, router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Community' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Community name"
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
            placeholder="What is this community about?"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        {/* Tags */}
        <View style={styles.field}>
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="art, digital, illustration (comma-separated)"
            placeholderTextColor={colors.textSecondary}
            value={tagsInput}
            onChangeText={setTagsInput}
          />
          <Text style={styles.hint}>Separate tags with commas</Text>
        </View>

        {/* Privacy toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Private Community</Text>
              <Text style={styles.toggleDescription}>
                Only approved members can see posts
              </Text>
            </View>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textLight}
          />
        </View>

        {/* Rules */}
        <View style={styles.field}>
          <Text style={styles.label}>Rules</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="One rule per line"
            placeholderTextColor={colors.textSecondary}
            value={rulesInput}
            onChangeText={setRulesInput}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.hint}>Enter one rule per line</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.createButton, (!name.trim() || submitting) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!name.trim() || submitting}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.createButtonText}>Create Community</Text>
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
    color: colors.textLight,
  },
});
