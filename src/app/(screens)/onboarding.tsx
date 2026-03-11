import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { spacing, fontSize, borderRadius, typography, gradients } from '@/lib/theme';
import { STYLE_OPTIONS, THEME_OPTIONS } from '@/lib/constants';
import { trackEvent, TELEMETRY_EVENTS } from '@/lib/telemetry';
import { storage } from '@/lib/storage';
import { updateTasteProfile } from '@/services/taste-profile.service';

type OnboardingStep = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  gradient: [string, string];
};

const INTRO_STEPS: OnboardingStep[] = [
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
];

const ONBOARDING_KEY = 'artigen_onboarding_completed';

// Style preference chips with colors for visual appeal
const STYLE_CHIPS = STYLE_OPTIONS.map((style) => ({
  label: style,
  gradient: getStyleGradient(style),
}));

const THEME_CHIPS = THEME_OPTIONS.map((theme) => ({
  label: theme,
  gradient: getThemeGradient(theme),
}));

function getStyleGradient(style: string): [string, string] {
  const map: Record<string, [string, string]> = {
    'Photorealistic': ['#667EEA', '#764BA2'],
    'Anime': ['#F093FB', '#F5576C'],
    'Oil Painting': ['#F77737', '#FD1D1D'],
    'Watercolor': ['#4FACFE', '#00F2FE'],
    'Digital Art': ['#8B5CF6', '#6D28D9'],
    'Pixel Art': ['#43E97B', '#38F9D7'],
    'Abstract': ['#E1306C', '#C13584'],
    'Minimalist': ['#262626', '#525252'],
    'Surreal': ['#515BD4', '#8134AF'],
    'Pop Art': ['#FF6B6B', '#FFE66D'],
    'Sketch': ['#636e72', '#2d3436'],
    'Comic Book': ['#0984E3', '#6C5CE7'],
    '3D Render': ['#00B894', '#00CEC9'],
    'Cinematic': ['#2d3436', '#636e72'],
    'Impressionist': ['#FDCB6E', '#E17055'],
  };
  return map[style] || ['#667EEA', '#764BA2'];
}

function getThemeGradient(theme: string): [string, string] {
  const map: Record<string, [string, string]> = {
    'Nature': ['#43E97B', '#38F9D7'],
    'Sci-Fi': ['#0095F6', '#1877F2'],
    'Fantasy': ['#8B5CF6', '#6D28D9'],
    'Urban': ['#636e72', '#2d3436'],
    'Portraits': ['#F093FB', '#F5576C'],
    'Animals': ['#F77737', '#FD1D1D'],
    'Architecture': ['#00B894', '#00CEC9'],
    'Food': ['#FDCB6E', '#E17055'],
    'Space': ['#0a0a2e', '#1a1a4e'],
    'Underwater': ['#4FACFE', '#00F2FE'],
    'Steampunk': ['#D4A574', '#8B6914'],
    'Cyberpunk': ['#E1306C', '#C13584'],
    'Historical': ['#A0522D', '#8B4513'],
    'Horror': ['#2d3436', '#000000'],
    'Whimsical': ['#FF6B6B', '#FFE66D'],
  };
  return map[theme] || ['#667EEA', '#764BA2'];
}

function StyleChip({
  label,
  gradient,
  selected,
  onToggle,
}: {
  label: string;
  gradient: [string, string];
  selected: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.selectionAsync();
        scale.value = withSpring(selected ? 1 : 1.05, { damping: 15, stiffness: 300 });
        onToggle();
      }}
      scaleValue={0.95}
    >
      <Animated.View style={animStyle}>
        <LinearGradient
          colors={selected ? gradient : ['transparent', 'transparent']}
          style={[
            chipStyles.chip,
            !selected && chipStyles.chipUnselected,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {selected && (
            <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginRight: 4 }} />
          )}
          <Text style={[chipStyles.chipText, selected && chipStyles.chipTextSelected]}>
            {label}
          </Text>
        </LinearGradient>
      </Animated.View>
    </AnimatedPressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipUnselected: {
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  chipText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: 'rgba(139, 92, 246, 0.8)',
  },
  chipTextSelected: {
    color: '#fff',
    fontFamily: typography.semiBold,
  },
});

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { themeColors } = useTheme();
  const { user } = useAuth();
  const [phase, setPhase] = useState<'intro' | 'styles' | 'themes'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);

  const handleNext = useCallback(() => {
    if (phase === 'intro') {
      if (currentIndex < INTRO_STEPS.length - 1) {
        const nextIndex = currentIndex + 1;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentIndex(nextIndex);
        trackEvent(TELEMETRY_EVENTS.onboarding_step_completed, {
          step: INTRO_STEPS[currentIndex].id,
          step_index: currentIndex,
        });
      } else {
        setPhase('styles');
      }
    } else if (phase === 'styles') {
      setPhase('themes');
    } else {
      completeOnboarding();
    }
  }, [phase, currentIndex]);

  const handleSkip = useCallback(() => {
    trackEvent(TELEMETRY_EVENTS.onboarding_skipped, {
      skipped_at_step: phase === 'intro' ? currentIndex : phase,
    });
    completeOnboarding();
  }, [phase, currentIndex]);

  const completeOnboarding = useCallback(async () => {
    const stylesArr = Array.from(selectedStyles);
    const themesArr = Array.from(selectedThemes);
    trackEvent(TELEMETRY_EVENTS.onboarding_completed, {
      styles_count: stylesArr.length,
      themes_count: themesArr.length,
    });
    await storage.setItem(ONBOARDING_KEY, 'true');

    // Save taste profile if user selected preferences
    if (user && (selectedStyles.size > 0 || selectedThemes.size > 0)) {
      updateTasteProfile(user.id, {
        preferredStyles: stylesArr,
        preferredThemes: themesArr,
        preferredPalettes: [],
      }).catch(() => {});
    }

    router.replace('/(tabs)');
  }, [selectedStyles, selectedThemes, user]);

  const toggleStyle = useCallback((style: string) => {
    setSelectedStyles((prev) => {
      const next = new Set(prev);
      if (next.has(style)) next.delete(style);
      else next.add(style);
      return next;
    });
  }, []);

  const toggleTheme = useCallback((theme: string) => {
    setSelectedThemes((prev) => {
      const next = new Set(prev);
      if (next.has(theme)) next.delete(theme);
      else next.add(theme);
      return next;
    });
  }, []);

  const renderStep = useCallback(
    ({ item }: { item: OnboardingStep }) => (
      <View style={[styles.stepContainer, { width }]}>
        <LinearGradient
          colors={item.gradient}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={item.icon} size={80} color="white" />
        </LinearGradient>
        <Text style={[styles.title, { color: themeColors.text }]}>{item.title}</Text>
        <Text style={[styles.description, { color: themeColors.textSecondary }]}>{item.description}</Text>
      </View>
    ),
    [width, themeColors],
  );

  const totalSteps = INTRO_STEPS.length + 2; // intro steps + styles + themes
  const activeStep = phase === 'intro' ? currentIndex : phase === 'styles' ? INTRO_STEPS.length : INTRO_STEPS.length + 1;

  function getButtonText() {
    if (phase === 'intro') {
      return currentIndex < INTRO_STEPS.length - 1 ? 'Next' : 'Choose Your Style';
    }
    if (phase === 'styles') return 'Pick Themes';
    return 'Start Creating';
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text style={[styles.skipText, { color: themeColors.textSecondary }]}>Skip</Text>
        </Pressable>
      </View>

      {phase === 'intro' ? (
        <FlatList
          ref={flatListRef}
          data={INTRO_STEPS}
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
      ) : (
        <Animated.View entering={FadeIn.duration(400)} style={styles.preferenceContainer}>
          <View style={styles.preferenceHeader}>
            <LinearGradient
              colors={phase === 'styles' ? ['#8B5CF6', '#6D28D9'] : ['#43E97B', '#38F9D7']}
              style={styles.preferenceIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={phase === 'styles' ? 'color-palette' : 'compass'}
                size={36}
                color="white"
              />
            </LinearGradient>
            <Text style={[styles.title, { color: themeColors.text }]}>
              {phase === 'styles' ? 'What styles do you love?' : 'What themes inspire you?'}
            </Text>
            <Text style={[styles.description, { color: themeColors.textSecondary }]}>
              {phase === 'styles'
                ? 'Pick at least 3 to personalize your feed'
                : 'Choose themes you want to see more of'}
            </Text>
          </View>

          <ScrollView
            style={styles.chipScrollView}
            contentContainerStyle={styles.chipContainer}
            showsVerticalScrollIndicator={false}
          >
            {(phase === 'styles' ? STYLE_CHIPS : THEME_CHIPS).map((chip) => (
              <StyleChip
                key={chip.label}
                label={chip.label}
                gradient={chip.gradient}
                selected={phase === 'styles' ? selectedStyles.has(chip.label) : selectedThemes.has(chip.label)}
                onToggle={() => phase === 'styles' ? toggleStyle(chip.label) : toggleTheme(chip.label)}
              />
            ))}
          </ScrollView>

          {(phase === 'styles' ? selectedStyles.size : selectedThemes.size) > 0 && (
            <Animated.View entering={FadeIn} style={styles.selectionCount}>
              <Text style={[styles.selectionCountText, { color: themeColors.accent }]}>
                {phase === 'styles' ? selectedStyles.size : selectedThemes.size} selected
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      )}

      {/* Dot indicators */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: themeColors.border },
              index === activeStep && [styles.dotActive, { backgroundColor: themeColors.primary }],
            ]}
          />
        ))}
      </View>

      {/* Next button */}
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
            <Text style={styles.nextButtonText}>{getButtonText()}</Text>
            {phase === 'intro' && currentIndex < INTRO_STEPS.length - 1 && (
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
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: fontSize.lg,
    fontFamily: typography.regular,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  preferenceContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  preferenceHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  preferenceIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  chipScrollView: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  selectionCount: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  selectionCountText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
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
  },
  dotActive: {
    width: 24,
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
