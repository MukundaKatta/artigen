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
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useWrapped } from '@/hooks/useWrapped';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type SlideType = 'intro' | 'stats' | 'topPost' | 'personality' | 'monthly' | 'streak' | 'finale';

type Slide = {
  id: string;
  type: SlideType;
  gradient: readonly [string, string];
};

const SLIDES: Slide[] = [
  { id: 'intro', type: 'intro', gradient: ['#1a1a2e', '#16213e'] },
  { id: 'stats', type: 'stats', gradient: ['#7C3AED', '#A855F7'] },
  { id: 'topPost', type: 'topPost', gradient: ['#0F172A', '#1E293B'] },
  { id: 'personality', type: 'personality', gradient: ['#FF6B6B', '#FF8E53'] },
  { id: 'monthly', type: 'monthly', gradient: ['#0095F6', '#00D4FF'] },
  { id: 'streak', type: 'streak', gradient: ['#10B981', '#34D399'] },
  { id: 'finale', type: 'finale', gradient: [colors.accent, '#EC4899'] },
];

export default function WrappedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stats, loading } = useWrapped();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  if (loading || !stats) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Crafting your year in review...</Text>
      </LinearGradient>
    );
  }

  function handleNext() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.back();
    }
  }

  function renderSlide({ item }: { item: Slide }) {
    const s = stats!;
    return (
      <LinearGradient
        colors={item.gradient as [string, string]}
        style={[styles.slide, { width: SCREEN_WIDTH, paddingTop: insets.top + 60 }]}
      >
        {item.type === 'intro' && (
          <View style={styles.slideContent}>
            <Animated.Text entering={FadeInUp.delay(200)} style={styles.wrappedYear}>
              {s.year}
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(400)} style={styles.wrappedTitle}>
              Your Art{'\n'}Wrapped
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(600)} style={styles.wrappedSubtitle}>
              A year of creativity, community, and AI magic
            </Animated.Text>
            <Animated.View entering={ZoomIn.delay(800)}>
              <Ionicons name="sparkles" size={48} color="#FFD700" />
            </Animated.View>
          </View>
        )}

        {item.type === 'stats' && (
          <View style={styles.slideContent}>
            <Animated.Text entering={FadeInUp.delay(200)} style={styles.slideHeading}>
              Your Numbers
            </Animated.Text>
            <View style={styles.statsGrid}>
              {[
                { label: 'Artworks Created', value: formatNumber(s.totalPosts), icon: 'brush' as const },
                { label: 'Likes Received', value: formatNumber(s.totalLikes), icon: 'heart' as const },
                { label: 'Views', value: formatNumber(s.totalViews), icon: 'eye' as const },
                { label: 'Remixes', value: formatNumber(s.totalRemixes), icon: 'git-branch' as const },
                { label: 'Badges Earned', value: String(s.badgesEarned), icon: 'ribbon' as const },
                { label: 'Styles Explored', value: String(s.uniqueStyles), icon: 'color-palette' as const },
              ].map((stat, i) => (
                <Animated.View key={stat.label} entering={FadeInUp.delay(300 + i * 100)} style={styles.statCard}>
                  <Ionicons name={stat.icon} size={24} color="#FFD700" />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {item.type === 'topPost' && (
          <View style={styles.slideContent}>
            <Animated.Text entering={FadeInUp.delay(200)} style={styles.slideHeading}>
              Your Top Artwork
            </Animated.Text>
            {s.topPost ? (
              <>
                <Animated.View entering={ZoomIn.delay(400)} style={styles.topPostFrame}>
                  <Image
                    source={{ uri: s.topPost.mediaUrl }}
                    style={styles.topPostImage}
                    contentFit="cover"
                    transition={500}
                  />
                </Animated.View>
                <Animated.View entering={FadeInUp.delay(600)} style={styles.topPostStats}>
                  <Ionicons name="heart" size={20} color="#FF6B6B" />
                  <Text style={styles.topPostLikes}>{formatNumber(s.topPost.likesCount)} likes</Text>
                </Animated.View>
              </>
            ) : (
              <Text style={styles.wrappedSubtitle}>Create your first artwork to see it here next year!</Text>
            )}
          </View>
        )}

        {item.type === 'personality' && (
          <View style={styles.slideContent}>
            <Animated.View entering={ZoomIn.delay(200)}>
              <View style={styles.personalityBadge}>
                <Ionicons name="star" size={48} color="#FFD700" />
              </View>
            </Animated.View>
            <Animated.Text entering={FadeInUp.delay(400)} style={styles.personalityTitle}>
              {s.artPersonality}
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(600)} style={styles.wrappedSubtitle}>
              Your favorite style: {s.topStyle}
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(700)} style={styles.wrappedSubtitle}>
              You create mostly in the {s.favoriteTimeOfDay}
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(800)} style={styles.percentileText}>
              Top {s.percentileRank}% of creators
            </Animated.Text>
          </View>
        )}

        {item.type === 'monthly' && (
          <View style={styles.slideContent}>
            <Animated.Text entering={FadeInUp.delay(200)} style={styles.slideHeading}>
              Your Creative Calendar
            </Animated.Text>
            <View style={styles.monthGrid}>
              {s.creationsByMonth.map((count, i) => {
                const maxCount = Math.max(...s.creationsByMonth, 1);
                const height = Math.max(20, (count / maxCount) * 120);
                return (
                  <Animated.View key={i} entering={FadeInUp.delay(300 + i * 50)} style={styles.monthCol}>
                    <View style={[styles.monthBar, { height }]} />
                    <Text style={styles.monthLabel}>{MONTH_NAMES[i]}</Text>
                    <Text style={styles.monthCount}>{count}</Text>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        )}

        {item.type === 'streak' && (
          <View style={styles.slideContent}>
            <Animated.View entering={ZoomIn.delay(200)}>
              <Ionicons name="flame" size={80} color="#FF6B6B" />
            </Animated.View>
            <Animated.Text entering={FadeInUp.delay(400)} style={styles.streakNumber}>
              {s.longestStreak}
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(500)} style={styles.slideHeading}>
              Day Streak
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(600)} style={styles.wrappedSubtitle}>
              Your longest creative streak this year
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(700)} style={styles.wrappedSubtitle}>
              {s.communitiesJoined} communities joined
            </Animated.Text>
          </View>
        )}

        {item.type === 'finale' && (
          <View style={styles.slideContent}>
            <Animated.View entering={ZoomIn.delay(200)}>
              <Ionicons name="trophy" size={64} color="#FFD700" />
            </Animated.View>
            <Animated.Text entering={FadeInUp.delay(400)} style={styles.wrappedTitle}>
              Here's to{'\n'}{s.year + 1}
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(600)} style={styles.wrappedSubtitle}>
              Keep creating. Keep inspiring. Keep pushing the boundaries of AI art.
            </Animated.Text>
            <Animated.View entering={FadeInUp.delay(800)}>
              <AnimatedPressable
                style={styles.shareWrappedButton}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  // TODO: Share wrapped card as image
                }}
                scaleValue={0.95}
              >
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={styles.shareWrappedText}>Share Your Wrapped</Text>
              </AnimatedPressable>
            </Animated.View>
          </View>
        )}
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
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
      />

      {/* Close button */}
      <AnimatedPressable
        style={[styles.closeButton, { top: insets.top + spacing.sm }]}
        onPress={() => router.back()}
        scaleValue={0.9}
      >
        <Ionicons name="close" size={24} color="#fff" />
      </AnimatedPressable>

      {/* Progress dots */}
      <View style={[styles.dots, { bottom: insets.bottom + spacing.xl }]}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Next / Done button */}
      <AnimatedPressable
        style={[styles.nextButton, { bottom: insets.bottom + spacing.xxxl + 20 }]}
        onPress={handleNext}
        scaleValue={0.95}
      >
        <Text style={styles.nextText}>
          {activeIndex === SLIDES.length - 1 ? 'Done' : 'Next'}
        </Text>
        <Ionicons
          name={activeIndex === SLIDES.length - 1 ? 'checkmark' : 'arrow-forward'}
          size={18}
          color="#fff"
        />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontFamily: typography.medium,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  slideContent: {
    alignItems: 'center',
    gap: spacing.lg,
    width: '100%',
  },
  wrappedYear: {
    fontSize: 20,
    fontFamily: typography.bold,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 4,
  },
  wrappedTitle: {
    fontSize: 42,
    fontFamily: typography.bold,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 48,
  },
  wrappedSubtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  slideHeading: {
    fontSize: 28,
    fontFamily: typography.bold,
    color: '#fff',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    width: '45%',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: '#fff',
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  topPostFrame: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  topPostImage: {
    width: '100%',
    height: '100%',
  },
  topPostStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  topPostLikes: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
  personalityBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personalityTitle: {
    fontSize: 32,
    fontFamily: typography.bold,
    color: '#fff',
    textAlign: 'center',
  },
  percentileText: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    color: '#FFD700',
    marginTop: spacing.md,
  },
  monthGrid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
    paddingTop: spacing.xl,
  },
  monthCol: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  monthBar: {
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 4,
    minHeight: 20,
  },
  monthLabel: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: 'rgba(255,255,255,0.6)',
  },
  monthCount: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: '#fff',
  },
  streakNumber: {
    fontSize: 72,
    fontFamily: typography.bold,
    color: '#fff',
  },
  shareWrappedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shareWrappedText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#fff',
  },
  nextButton: {
    position: 'absolute',
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  nextText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
});
