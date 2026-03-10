import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useExhibition } from '@/hooks/useExhibition';
import { GalleryGrid } from '@/components/exhibitions/GalleryGrid';
import { SubmissionCard } from '@/components/exhibitions/SubmissionCard';
import { formatNumber } from '@/utils/format-number';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const STATUS_COLORS: Record<string, string> = {
  accepting: colors.success,
  curating: colors.warning,
  live: colors.primary,
  archived: colors.textSecondary,
};

export default function ExhibitionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { exhibition, submissions, loading, curate } = useExhibition(id, user?.id);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (!exhibition) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="images-outline" size={28} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>Exhibition not found</Text>
          <Text style={styles.emptyText}>This exhibition may have been removed</Text>
        </View>
      </View>
    );
  }

  const isCurator = exhibition.curator_id === user?.id;
  const isLive = exhibition.status === 'live';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: exhibition.title }} />
      <ScrollView style={styles.scroll}>
        {/* Cover */}
        {exhibition.cover_image_url ? (
          <Image
            source={{ uri: exhibition.cover_image_url }}
            style={styles.cover}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Ionicons name="images-outline" size={48} color={colors.textSecondary} />
          </View>
        )}

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[exhibition.status] }]}>
              <Text style={styles.statusBadgeText}>{exhibition.status}</Text>
            </View>
          </View>

          <Text style={styles.title}>{exhibition.title}</Text>
          {exhibition.description && (
            <Text style={styles.description}>{exhibition.description}</Text>
          )}

          {exhibition.theme && (
            <View style={styles.themeRow}>
              <Ionicons name="color-palette-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.themeText}>Theme: {exhibition.theme}</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatNumber(exhibition.submission_count)}</Text>
              <Text style={styles.statLabel}>submissions</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatNumber(exhibition.view_count)}</Text>
              <Text style={styles.statLabel}>views</Text>
            </View>
          </View>

          {/* Curator */}
          <TouchableOpacity
            style={styles.curatorRow}
            onPress={() => router.push(`/(screens)/user/${exhibition.curator.id}`)}
          >
            <Image
              source={
                exhibition.curator.avatar_url
                  ? { uri: exhibition.curator.avatar_url }
                  : require('../../../../assets/images/default-avatar.png')
              }
              style={styles.curatorAvatar}
              contentFit="cover"
            />
            <View>
              <Text style={styles.curatorLabel}>Curated by</Text>
              <Text style={styles.curatorName}>@{exhibition.curator.username}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Gallery view for live/archived exhibitions */}
        {(isLive || exhibition.status === 'archived') && (
          <GalleryGrid submissions={submissions} />
        )}

        {/* Submission list for curator during accepting/curating */}
        {isCurator && (exhibition.status === 'accepting' || exhibition.status === 'curating') && (
          <View style={styles.submissionsSection}>
            <Text style={styles.sectionTitle}>
              Submissions ({submissions.length})
            </Text>
            {submissions.map((sub) => (
              <SubmissionCard
                key={sub.id}
                submission={sub}
                isCurator
                onAccept={(sid) => curate(sid, 'accepted')}
                onReject={(sid) => curate(sid, 'rejected')}
                onFeature={(sid) => curate(sid, 'featured')}
              />
            ))}
            {submissions.length === 0 && (
              <Text style={styles.noSubmissions}>No submissions yet</Text>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
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
  cover: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundSecondary,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    padding: spacing.lg,
  },
  statusRow: {
    marginBottom: spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: typography.bold,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  themeText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  curatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  curatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
  },
  curatorLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  curatorName: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  submissionsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  noSubmissions: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});
