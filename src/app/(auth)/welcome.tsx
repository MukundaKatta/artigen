import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Slide = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
};

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'sparkles',
    iconColor: '#FFD700',
    title: 'Create AI Art',
    subtitle: 'Transform your ideas into stunning artwork with cutting-edge AI models. Just describe what you imagine.',
    gradient: ['#7C3AED', '#A855F7'],
  },
  {
    id: '2',
    icon: 'people',
    iconColor: '#4ECDC4',
    title: 'Join the Community',
    subtitle: 'Share your creations, discover incredible art, and connect with artists from around the world.',
    gradient: ['#0095F6', '#00D4FF'],
  },
  {
    id: '3',
    icon: 'trophy',
    iconColor: '#FFD700',
    title: 'Compete & Grow',
    subtitle: 'Enter daily challenges, earn badges, climb the leaderboard, and develop your unique creative style.',
    gradient: ['#FF6B6B', '#FF8E53'],
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
      if (Platform.OS !== 'web') Haptics.selectionAsync();
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const isLastSlide = activeIndex === SLIDES.length - 1;

  function handleNext() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLastSlide) {
      router.replace('/(auth)/register');
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  }

  function handleSkip() {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.replace('/(auth)/login');
  }

  function renderSlide({ item }: { item: Slide }) {
    return (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <LinearGradient
          colors={item.gradient as [string, string]}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={item.icon} size={64} color={item.iconColor} />
        </LinearGradient>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Skip button */}
      <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.skipContainer}>
        <AnimatedPressable onPress={handleSkip} scaleValue={0.9}>
          <Text style={styles.skipText}>Skip</Text>
        </AnimatedPressable>
      </Animated.View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.slideList}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {SLIDES.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              index === activeIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Bottom buttons */}
      <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.bottomContainer}>
        <AnimatedPressable
          style={styles.nextButton}
          onPress={handleNext}
          scaleValue={0.95}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={isLastSlide ? 'sparkles' : 'arrow-forward'}
            size={18}
            color="#fff"
          />
        </AnimatedPressable>

        {isLastSlide && (
          <AnimatedPressable
            style={styles.loginButton}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              router.replace('/(auth)/login');
            }}
            scaleValue={0.95}
          >
            <Text style={styles.loginButtonText}>Already have an account? Log in</Text>
          </AnimatedPressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 20,
    right: spacing.lg,
    zIndex: 10,
  },
  skipText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  slideList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  slideTitle: {
    fontSize: 28,
    fontFamily: typography.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideSubtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
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
  bottomContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
  },
  nextButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  loginButtonText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.primary,
  },
});
