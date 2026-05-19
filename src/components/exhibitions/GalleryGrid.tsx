import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { ExhibitionSubmissionWithDetails } from '@/services/exhibition.service';

type Props = {
  submissions: ExhibitionSubmissionWithDetails[];
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = 2;
const COLUMNS = 3;
const ITEM_SIZE = (SCREEN_WIDTH - GAP * (COLUMNS - 1)) / COLUMNS;
const FEATURED_SIZE = SCREEN_WIDTH;

export function GalleryGrid({ submissions }: Props) {
  const router = useRouter();

  const featured = submissions.filter((s) => s.status === 'featured');
  const accepted = submissions.filter((s) => s.status === 'accepted');
  const allVisible = [...featured, ...accepted];

  function handlePress(postId: string) {
    router.push(`/(screens)/post/${postId}`);
  }

  return (
    <View style={styles.container}>
      {/* Featured spotlight */}
      {featured.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={styles.featuredTitle}>Featured</Text>
          </View>
          {featured.map((item) => {
            const media = item.post?.media?.[0];
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.featuredItem}
                onPress={() => handlePress(item.post_id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Featured artwork by @${item.user.username}`}
              >
                {media && (
                  <Image
                    source={{ uri: media.media_url }}
                    style={styles.featuredImage}
                    contentFit="cover"
                  />
                )}
                <View style={styles.featuredOverlay}>
                  <View style={styles.featuredArtist}>
                    <Image
                      source={
                        item.user.avatar_url
                          ? { uri: item.user.avatar_url }
                          : require('../../../assets/images/default-avatar.png')
                      }
                      style={styles.artistAvatar}
                      contentFit="cover"
                    />
                    <Text style={styles.artistName}>@{item.user.username}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Gallery grid */}
      <View style={styles.grid}>
        {accepted.map((item) => {
          const media = item.post?.media?.[0];
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handlePress(item.post_id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Accepted artwork by @${item.user.username}`}
            >
              <View style={styles.gridItem}>
                {media && (
                  <Image
                    source={{ uri: media.media_url }}
                    style={styles.gridImage}
                    contentFit="cover"
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {allVisible.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>No curated artworks yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  featuredSection: {
    marginBottom: spacing.sm,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  featuredTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  featuredItem: {
    width: FEATURED_SIZE,
    height: FEATURED_SIZE * 0.6,
    position: 'relative',
    marginBottom: GAP,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredArtist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  artistAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  artistName: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textLight,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
