import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/providers/AuthProvider';
import { fetchStyleEvolution, type StyleEvolution } from '@/services/style-evolution.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const MONTH_DISPLAY: Record<string, string> = {
  '01': 'January', '02': 'February', '03': 'March', '04': 'April',
  '05': 'May', '06': 'June', '07': 'July', '08': 'August',
  '09': 'September', '10': 'October', '11': 'November', '12': 'December',
};

const STYLE_COLORS: Record<string, string> = {
  Anime: '#FF6B6B',
  Photorealistic: '#4ECDC4',
  Watercolor: '#45B7D1',
  'Oil Painting': '#F7DC6F',
  Digital: '#BB8FCE',
  Abstract: '#E74C3C',
  Pixel: '#2ECC71',
  Cyberpunk: '#8E44AD',
  Fantasy: '#F39C12',
  Mixed: '#95A5A6',
};

function getStyleColor(style: string): string {
  return STYLE_COLORS[style] || colors.primary;
}

export default function StyleEvolutionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [evolution, setEvolution] = useState<StyleEvolution | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchStyleEvolution(user.id);
      setEvolution(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!evolution) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} scaleValue={0.9}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.title}>Style Evolution</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Summary Card */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="color-palette" size={24} color={colors.primary} />
              <Text style={styles.summaryValue}>{evolution.totalStylesExplored}</Text>
              <Text style={styles.summaryLabel}>Styles Explored</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Ionicons name="trending-up" size={24} color="#10B981" />
              <Text style={[styles.summaryValue, evolution.growthRate > 0 && { color: '#10B981' }]}>
                {evolution.growthRate > 0 ? '+' : ''}{evolution.growthRate}%
              </Text>
              <Text style={styles.summaryLabel}>Engagement Growth</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Ionicons name="heart" size={24} color="#FF6B6B" />
              <Text style={styles.summaryValue}>{evolution.currentFavorite}</Text>
              <Text style={styles.summaryLabel}>Current Fave</Text>
            </View>
          </View>
          <Text style={styles.narrativeText}>{evolution.styleJourney}</Text>
        </Animated.View>

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Your Creative Timeline</Text>
        <View style={styles.timeline}>
          {evolution.phases.map((phase, index) => {
            const [year, monthNum] = phase.month.split('-');
            const monthName = MONTH_DISPLAY[monthNum] || monthNum;
            const styleColor = getStyleColor(phase.dominantStyle);

            return (
              <Animated.View
                key={phase.month}
                entering={FadeInLeft.delay(200 + index * 100).duration(400)}
                style={styles.timelineItem}
              >
                {/* Timeline line + dot */}
                <View style={styles.timelineLine}>
                  <View style={[styles.timelineDot, { backgroundColor: styleColor }]} />
                  {index < evolution.phases.length - 1 && <View style={styles.timelineConnector} />}
                </View>

                {/* Content */}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineMonth}>{monthName} {year}</Text>
                  <View style={styles.phaseCard}>
                    {phase.topPostUrl && (
                      <Image
                        source={{ uri: phase.topPostUrl }}
                        style={styles.phaseImage}
                        contentFit="cover"
                        transition={300}
                      />
                    )}
                    <View style={styles.phaseInfo}>
                      <View style={[styles.phaseBadge, { backgroundColor: styleColor + '20' }]}>
                        <Text style={[styles.phaseBadgeText, { color: styleColor }]}>
                          {phase.dominantStyle}
                        </Text>
                      </View>
                      <Text style={styles.phaseModel}>{phase.dominantModel}</Text>
                      <View style={styles.phaseStats}>
                        <Text style={styles.phaseStat}>{phase.postCount} posts</Text>
                        <Text style={styles.phaseStat}>~{phase.avgLikes} avg likes</Text>
                      </View>

                      {/* Style breakdown mini-bars */}
                      <View style={styles.styleBreakdown}>
                        {Object.entries(phase.styles)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([style, count]) => {
                            const total = Object.values(phase.styles).reduce((a, b) => a + b, 0);
                            const pct = Math.round((count / total) * 100);
                            return (
                              <View key={style} style={styles.miniBar}>
                                <View
                                  style={[
                                    styles.miniBarFill,
                                    { width: `${pct}%`, backgroundColor: getStyleColor(style) },
                                  ]}
                                />
                                <Text style={styles.miniBarLabel}>{style} {pct}%</Text>
                              </View>
                            );
                          })}
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  summaryValue: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  narrativeText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  timeline: {
    paddingLeft: spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 140,
  },
  timelineLine: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: -2,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.lg,
  },
  timelineMonth: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  phaseCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  phaseImage: {
    width: 80,
    height: 100,
  },
  phaseInfo: {
    flex: 1,
    padding: spacing.sm,
    gap: 4,
  },
  phaseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  phaseBadgeText: {
    fontSize: 11,
    fontFamily: typography.semiBold,
  },
  phaseModel: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  phaseStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  phaseStat: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  styleBreakdown: {
    gap: 3,
    marginTop: 4,
  },
  miniBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  miniBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 6,
  },
  miniBarLabel: {
    fontSize: 8,
    fontFamily: typography.medium,
    color: '#fff',
    paddingLeft: 4,
  },
});
