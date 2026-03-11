import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { sortMediaByOrder } from '@/utils/media';

type Props = {
  posts: any[];
  onCancel: (postId: string) => void;
  onPublish: (postId: string) => void;
};

function formatScheduledDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ScheduledPostsList({ posts, onCancel, onPublish }: Props) {
  if (posts.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="calendar-outline" size={48} color={colors.border} />
        <Text style={styles.emptyTitle}>No scheduled posts</Text>
        <Text style={styles.emptyText}>Schedule posts to publish automatically</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      removeClippedSubviews={true}
      renderItem={({ item }) => {
        const media = sortMediaByOrder(item.media);
        const firstMedia = media[0];

        return (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              {firstMedia && (
                <Image source={{ uri: firstMedia.media_url }} style={styles.thumbnail} contentFit="cover" />
              )}
              <View style={styles.cardInfo}>
                {item.caption ? (
                  <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
                ) : (
                  <Text style={styles.noCaption}>No caption</Text>
                )}
                <View style={styles.scheduleRow}>
                  <Ionicons name="calendar" size={14} color={colors.primary} />
                  <Text style={styles.scheduleText}>
                    {formatScheduledDate(item.scheduled_at)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.publishButton} onPress={() => onPublish(item.id)}>
                <Text style={styles.publishText}>Publish Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => onCancel(item.id)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  caption: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 20,
  },
  noCaption: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  scheduleText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  publishButton: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
  },
  publishText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.primary,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.error,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
