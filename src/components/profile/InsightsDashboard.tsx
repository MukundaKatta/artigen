import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInsights } from '@/hooks/useInsights';
import { formatNumber } from '@/utils/format-number';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  postId: string;
};

function StatBox({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
      <Text style={styles.statValue}>{formatNumber(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function InsightsDashboard({ postId }: Props) {
  const { insights, loading, fetchInsights } = useInsights(postId);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (loading) {
    return <ActivityIndicator style={styles.loader} color={colors.textSecondary} />;
  }

  if (!insights) return null;

  const engagementRate = insights.total_views > 0
    ? (((insights.likes + insights.comments + insights.saves) / insights.total_views) * 100).toFixed(1)
    : '0';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post Insights</Text>

      <View style={styles.statsRow}>
        <StatBox icon="eye-outline" label="Views" value={insights.total_views} />
        <StatBox icon="people-outline" label="Reach" value={insights.unique_viewers} />
        <StatBox icon="heart-outline" label="Likes" value={insights.likes} />
      </View>

      <View style={styles.statsRow}>
        <StatBox icon="chatbubble-outline" label="Comments" value={insights.comments} />
        <StatBox icon="bookmark-outline" label="Saves" value={insights.saves} />
        <View style={styles.statBox}>
          <Ionicons name="trending-up-outline" size={20} color={colors.success} />
          <Text style={styles.statValue}>{engagementRate}%</Text>
          <Text style={styles.statLabel}>Engagement</Text>
        </View>
      </View>

      {Object.keys(insights.source_breakdown).length > 0 && (
        <View style={styles.sourceSection}>
          <Text style={styles.sectionTitle}>Traffic Sources</Text>
          {Object.entries(insights.source_breakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([source, count]) => (
              <View key={source} style={styles.sourceRow}>
                <Text style={styles.sourceName}>{source}</Text>
                <View style={styles.sourceBarContainer}>
                  <View
                    style={[
                      styles.sourceBar,
                      { width: `${(count / insights.total_views) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.sourceCount}>{formatNumber(count)}</Text>
              </View>
            ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  loader: {
    padding: spacing.xxxl,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  sourceSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sourceName: {
    width: 60,
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
    textTransform: 'capitalize',
  },
  sourceBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sourceBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  sourceCount: {
    width: 40,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
