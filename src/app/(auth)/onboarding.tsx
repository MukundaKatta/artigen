import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useAuth } from '@/providers/AuthProvider';
import { updateTasteProfile } from '@/services/taste-profile.service';
import { trackEvent, TELEMETRY_EVENTS } from '@/lib/telemetry';
import { logger } from '@/lib/logger';
import { STYLE_OPTIONS, THEME_OPTIONS } from '@/lib/constants';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const MIN_SELECTIONS = 3;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'styles' | 'themes'>('styles');

  const toggleItem = useCallback(
    (item: string, set: Set<string>, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
      if (Platform.OS !== 'web') Haptics.selectionAsync();
      const next = new Set(set);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      setter(next);
    },
    [],
  );

  const handleContinue = useCallback(async () => {
    if (step === 'styles') {
      setStep('themes');
      trackEvent(TELEMETRY_EVENTS.onboarding_step_completed, { step: 'styles', count: selectedStyles.size });
      return;
    }

    // Save preferences
    setSaving(true);
    if (user?.id) {
      await updateTasteProfile(user.id, {
        preferredStyles: [...selectedStyles],
        preferredThemes: [...selectedThemes],
      }).catch((err) => logger.warn('Failed to save taste preferences:', err));
    }
    trackEvent(TELEMETRY_EVENTS.onboarding_completed, {
      styles_count: selectedStyles.size,
      themes_count: selectedThemes.size,
    });
    setSaving(false);
    router.replace('/(tabs)');
  }, [step, selectedStyles, selectedThemes, user, router]);

  const handleSkip = useCallback(() => {
    trackEvent(TELEMETRY_EVENTS.onboarding_skipped, { step });
    router.replace('/(tabs)');
  }, [step, router]);

  const currentItems = step === 'styles' ? STYLE_OPTIONS : THEME_OPTIONS;
  const currentSet = step === 'styles' ? selectedStyles : selectedThemes;
  const currentSetter = step === 'styles' ? setSelectedStyles : setSelectedThemes;
  const totalSelected = currentSet.size;
  const canContinue = totalSelected >= MIN_SELECTIONS;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
      {/* Skip */}
      <Animated.View entering={FadeIn.delay(200)} style={styles.skipContainer}>
        <AnimatedPressable onPress={handleSkip} scaleValue={0.9}>
          <Text style={styles.skipText}>Skip</Text>
        </AnimatedPressable>
      </Animated.View>

      {/* Header */}
      <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.header}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step === 'styles' && styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 'themes' && styles.stepDotActive]} />
        </View>
        <Ionicons
          name={step === 'styles' ? 'color-palette' : 'images'}
          size={32}
          color={colors.primary}
        />
        <Text style={styles.title}>
          {step === 'styles' ? 'What art styles do you love?' : 'What themes interest you?'}
        </Text>
        <Text style={styles.subtitle}>
          Pick at least {MIN_SELECTIONS} to personalize your feed
        </Text>
      </Animated.View>

      {/* Selection grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {currentItems.map((item, index) => {
          const isSelected = currentSet.has(item);
          return (
            <Animated.View key={item} entering={FadeInUp.delay(50 * Math.min(index, 8)).duration(300)}>
              <Pressable
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleItem(item, currentSet, currentSetter)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={item}
              >
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                )}
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {item}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Continue button */}
      <View style={styles.bottomContainer}>
        <Text style={styles.selectionCount}>
          {totalSelected} selected{totalSelected < MIN_SELECTIONS ? ` (need ${MIN_SELECTIONS - totalSelected} more)` : ''}
        </Text>
        <AnimatedPressable
          style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
          onPress={canContinue ? handleContinue : undefined}
          scaleValue={canContinue ? 0.95 : 1}
        >
          <Text style={[styles.continueText, !canContinue && styles.continueTextDisabled]}>
            {saving ? 'Saving...' : step === 'styles' ? 'Next' : 'Start Exploring'}
          </Text>
          <Ionicons
            name={step === 'styles' ? 'arrow-forward' : 'sparkles'}
            size={18}
            color={canContinue ? '#fff' : colors.textSecondary}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  skipContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  skipText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 149, 246, 0.08)',
  },
  chipText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
  bottomContainer: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  selectionCount: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
    minHeight: 48,
  },
  continueButtonDisabled: {
    backgroundColor: colors.backgroundSecondary,
  },
  continueText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
  continueTextDisabled: {
    color: colors.textSecondary,
  },
});
