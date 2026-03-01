import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RatingStars } from '@/components/critiques/RatingStars';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { submitCritique } from '@/services/critique.service';
import type { CritiqueRatings } from '@/services/critique.service';

// TODO: Replace with real auth hook
const MOCK_USER_ID = 'current-user-id';

export default function CreateCritiqueScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();

  const [ratings, setRatings] = useState<CritiqueRatings>({
    composition_rating: 0,
    color_rating: 0,
    technique_rating: 0,
    prompt_craft_rating: 0,
    originality_rating: 0,
    overall_rating: 0,
  });
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateRating = useCallback((key: keyof CritiqueRatings, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const allRated = Object.values(ratings).every((v) => v > 0);
  const canSubmit = allRated && feedbackText.trim().length >= 10;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !postId) return;

    setSubmitting(true);
    const { data, error } = await submitCritique(postId, MOCK_USER_ID, ratings, feedbackText.trim());
    setSubmitting(false);

    if (error) {
      Alert.alert('Error', error.message || 'Failed to submit critique. Please try again.');
      return;
    }

    Alert.alert('Success', 'Your critique has been submitted!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [canSubmit, postId, ratings, feedbackText, router]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Art Critique</Text>
        <Text style={styles.subtitle}>
          Rate this artwork across different dimensions and share your constructive feedback.
        </Text>

        {/* Rating categories */}
        <View style={styles.ratingsSection}>
          <RatingStars
            label="Composition"
            value={ratings.composition_rating}
            onChange={(v) => updateRating('composition_rating', v)}
          />
          <RatingStars
            label="Color"
            value={ratings.color_rating}
            onChange={(v) => updateRating('color_rating', v)}
          />
          <RatingStars
            label="Technique"
            value={ratings.technique_rating}
            onChange={(v) => updateRating('technique_rating', v)}
          />
          <RatingStars
            label="Prompt Craft"
            value={ratings.prompt_craft_rating}
            onChange={(v) => updateRating('prompt_craft_rating', v)}
          />
          <RatingStars
            label="Originality"
            value={ratings.originality_rating}
            onChange={(v) => updateRating('originality_rating', v)}
          />

          <View style={styles.divider} />

          <RatingStars
            label="Overall"
            value={ratings.overall_rating}
            onChange={(v) => updateRating('overall_rating', v)}
            size={24}
          />
        </View>

        {/* Feedback text */}
        <Text style={styles.feedbackLabel}>Written Feedback</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Share constructive feedback about this artwork... (min 10 characters)"
          placeholderTextColor={colors.textSecondary}
          value={feedbackText}
          onChangeText={setFeedbackText}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={2000}
        />
        <Text style={styles.charCount}>
          {feedbackText.length}/2000
        </Text>

        {/* Submit button */}
        <Button
          title="Submit Critique"
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          loading={submitting}
          disabled={!canSubmit}
          style={styles.submitButton}
        />

        {!allRated && (
          <Text style={styles.hintText}>
            Please rate all categories to submit your critique.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  heading: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  ratingsSection: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  feedbackLabel: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    lineHeight: 22,
  },
  charCount: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  submitButton: {
    width: '100%',
  },
  hintText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
