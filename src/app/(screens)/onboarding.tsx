import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, borderRadius, typography, gradients } from '@/lib/theme';
import { trackEvent, TELEMETRY_EVENTS } from '@/lib/telemetry';
import { storage } from '@/lib/storage';

type OnboardingStep = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  gradient: [string, string];
};

const STEPS: OnboardingStep[] = [
  {
    id: 'create',
    icon: 'sparkles',
    title: 'Create with AI',
    description:
      'Transform your ideas into stunning artwork using cutting-edge AI models. From photorealistic to anime, any style is possible.',
    gradient: ['#667EEA', '#764BA2'],
  },
  {
    id: 'share',
    icon: 'people',
    title: 'Share & Connect',
    description:
      'Join a vibrant community of AI artists. Share your creations, discover amazing artwork, and collaborate with other creators.',
    gradient: ['#F093FB', '#F5576C'],
  },
  {
    id: 'earn',
    icon: 'diamond',
    title: 'Earn & Grow',
    description:
      'Monetize your art through our marketplace, receive tips, and build your brand. Complete challenges to earn badges and climb the ranks.',
    gradient: ['#4FACFE', '#00F2FE'],
  },
  {
    id: 'explore',
    icon: 'compass',
    title: 'Explore & Learn',
    description:
      'Browse trending art, take tutorials from top creators, and get personalized recommendations based on your unique taste.',
    gradient: ['#43E97B', '#38F9D7'],
  },
];

const ONBOARDING_KEY = 'artigen_onboarding_completed';

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const handleNext = useCallback(() => {
    if (currentIndex < STEPS.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
      trackEvent(TELEMETRY_EVENTS.onboarding_step_completed, {
        step: STEPS[currentIndex].id,
        step_index: currentIndex,
      });
    } else {
      completeOnboarding();
    }
  }, [currentIndex]);

  const handleSkip = useCallback(() => {
    trackEvent(TELEMETRY_EVENTS.onboarding_skipped, {
      skipped_at_step: currentIndex,
    });
    completeOnboarding();
  }, [currentIndex]);

  const completeOnboarding = useCallback(async () => {
    trackEvent(TELEMETRY_EVENTS.onboarding_completed);
    await storage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  }, []);

  const renderStep = useCallback(
    ({ item, index }: { item: OnboardingStep; index: number }) => (
      <View style={[styles.stepContainer, { width }]}>
        <LinearGradient
          colors={item.gradient}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={item.icon} size={80} color="white" />
        </LinearGradient>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    ),
    [width],
  );

  const isLastStep = currentIndex === STEPS.length - 1;

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={STEPS}
        renderItem={renderStep}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Dot indicators */}
      <View style={styles.dotsContainer}>
        {STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Next / Get Started button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.nextButtonPressed,
          ]}
        >
          <LinearGradient
            colors={gradients.primaryButton}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>
              {isLastStep ? 'Get Started' : 'Next'}
            </Text>
            {!isLastStep && (
              <Ionicons name="arrow-forward" size={20} color="white" />
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  skipText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontFamily: typography.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: fontSize.lg,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  nextButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  nextButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  nextButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: 'white',
  },
});
