import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { ExhibitionSubmissionWithDetails } from '@/services/exhibition.service';

type Props = {
  submission: ExhibitionSubmissionWithDetails;
  isCurator?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onFeature?: (id: string) => void;
};

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  accepted: colors.success,
  rejected: colors.like,
  featured: colors.primary,
};

const STATUS_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  pending: 'time-outline',
  accepted: 'checkmark-circle-outline',
  rejected: 'close-circle-outline',
  featured: 'star',
};

export function SubmissionCard({
  submission,
  isCurator,
  onAccept,
  onReject,
  onFeature,
}: Props) {
  const router = useRouter();
  const media = submission.post?.media?.[0];

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => router.push(`/(screens)/post/${submission.post_id}`)}
        activeOpacity={0.8}
      >
        {media && (
          <Image
            source={{ uri: media.media_url }}
            style={styles.image}
            contentFit="cover"
          />
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <View style={styles.userRow}>
          <Image
            source={
              submission.user.avatar_url
                ? { uri: submission.user.avatar_url }
                : require('../../../assets/images/default-avatar.png')
            }
            style={styles.avatar}
            contentFit="cover"
          />
          <Text style={styles.username}>@{submission.user.username}</Text>
        </View>

        {/* Status indicator */}
        <View style={styles.statusRow}>
          <Ionicons
            name={STATUS_ICONS[submission.status]}
            size={14}
            color={STATUS_COLORS[submission.status]}
          />
          <Text style={[styles.statusText, { color: STATUS_COLORS[submission.status] }]}>
            {submission.status}
          </Text>
        </View>

        {submission.curator_note && (
          <Text style={styles.curatorNote} numberOfLines={2}>
            {submission.curator_note}
          </Text>
        )}

        {/* Curator actions */}
        {isCurator && submission.status === 'pending' && (
          <View style={styles.curatorActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => onAccept?.(submission.id)}
            >
              <Ionicons name="checkmark" size={16} color={colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.featureBtn]}
              onPress={() => onFeature?.(submission.id)}
            >
              <Ionicons name="star" size={16} color={colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => onReject?.(submission.id)}
            >
              <Ionicons name="close" size={16} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  imageContainer: {
    width: 80,
    height: 80,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.border,
  },
  username: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    textTransform: 'capitalize',
  },
  curatorNote: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 4,
  },
  curatorActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    backgroundColor: colors.success,
  },
  featureBtn: {
    backgroundColor: colors.primary,
  },
  rejectBtn: {
    backgroundColor: colors.like,
  },
});
