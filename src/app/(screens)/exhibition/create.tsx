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
import { useAuth } from '@/providers/AuthProvider';
import { createExhibition } from '@/services/exhibition.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export default function CreateExhibitionRoute() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!user?.id) return;
    if (!title.trim()) {
      Alert.alert('Error', 'Exhibition title is required.');
      return;
    }

    setSubmitting(true);

    const { data, error } = await createExhibition(
      user.id,
      title.trim(),
      description.trim(),
      theme.trim(),
    );

    setSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Failed to create exhibition. Please try again.');
      return;
    }

    if (data) {
      router.replace(`/(screens)/exhibition/${data.id}`);
    }
  }, [user?.id, title, description, theme, router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Exhibition' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Exhibition title"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={150}
          />
        </View>

        {/* Theme */}
        <View style={styles.field}>
          <Text style={styles.label}>Theme</Text>
          <TextInput
            style={styles.input}
            placeholder='e.g., "Cyberpunk Dreams", "Nature Reimagined"'
            placeholderTextColor={colors.textSecondary}
            value={theme}
            onChangeText={setTheme}
            maxLength={100}
          />
          <Text style={styles.hint}>
            The theme helps artists know what kind of work to submit
          </Text>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your exhibition and what you're looking for..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.createButton, (!title.trim() || submitting) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!title.trim() || submitting}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.createButtonText}>Create Exhibition</Text>
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
