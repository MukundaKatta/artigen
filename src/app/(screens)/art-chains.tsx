import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { fetchArtChains, type ArtChain } from '@/services/art-chain.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';

function ChainCard({ chain, index }: { chain: ArtChain; index: number }) {
  const router = useRouter();

  return (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(400)}>
      <AnimatedPressable
        style={styles.chainCard}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/(screens)/art-chain/${chain.id}`);
        }}
        scaleValue={0.97}
      >
        {/* Chain Preview - overlapping images */}
        <View style={styles.chainPreview}>
          {chain.links.slice(0, 4).map((link, i) => (
            <Image
              key={link.id}
              source={{ uri: link.image_url }}
              style={[
                styles.chainPreviewImage,
                { left: i * 50, zIndex: 4 - i },
              ]}
              contentFit="cover"
              transition={200}
            />
          ))}
          {chain.total_links > 4 && (
            <View style={[styles.chainPreviewMore, { left: 4 * 50 }]}>
              <Text style={styles.chainPreviewMoreText}>+{chain.total_links - 4}</Text>
            </View>
          )}
        </View>

        <View style={styles.chainInfo}>
          <Text style={styles.chainTitle} numberOfLines={1}>{chain.title}</Text>
          <Text style={styles.chainTheme}>{chain.theme}</Text>
          <Text style={styles.chainDesc} numberOfLines={2}>{chain.description}</Text>

          <View style={styles.chainMeta}>
            <View style={styles.chainStat}>
              <Ionicons name="link" size={14} color={colors.textSecondary} />
              <Text style={styles.chainStatText}>{chain.total_links} links</Text>
            </View>
            <View style={styles.chainStat}>
              <Ionicons name="people" size={14} color={colors.textSecondary} />
              <Text style={styles.chainStatText}>{chain.total_participants} artists</Text>
            </View>
            <View style={styles.chainStat}>
              <Ionicons name="heart" size={14} color={colors.textSecondary} />
              <Text style={styles.chainStatText}>{formatNumber(chain.total_likes)}</Text>
            </View>
          </View>
        </View>

        {/* Status */}
        <View style={[
          styles.chainStatus,
          chain.status === 'open' && { backgroundColor: '#10B98120' },
          chain.status === 'featured' && { backgroundColor: '#F59E0B20' },
          chain.status === 'completed' && { backgroundColor: colors.border },
        ]}>
          <Ionicons
            name={chain.status === 'open' ? 'add-circle' : chain.status === 'featured' ? 'star' : 'checkmark-circle'}
            size={14}
            color={chain.status === 'open' ? '#10B981' : chain.status === 'featured' ? '#F59E0B' : colors.textSecondary}
          />
          <Text style={[
            styles.chainStatusText,
            { color: chain.status === 'open' ? '#10B981' : chain.status === 'featured' ? '#F59E0B' : colors.textSecondary },
          ]}>
            {chain.status === 'open' ? 'Join' : chain.status === 'featured' ? 'Featured' : 'Complete'}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ArtChainsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [chains, setChains] = useState<ArtChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  const loadChains = useCallback(async () => {
    setLoading(true);
    const data = await fetchArtChains(filter || undefined);
    setChains(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadChains();
  }, [loadChains]);

  const filters = [
    { key: '', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'featured', label: 'Featured' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} scaleValue={0.9}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.title}>Art Chains</Text>
        <AnimatedPressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            router.push('/(screens)/art-chain/create');
          }}
          scaleValue={0.9}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </AnimatedPressable>
      </View>

      {/* Description */}
      <View style={styles.descriptionCard}>
        <Ionicons name="link" size={20} color={colors.primary} />
        <Text style={styles.descriptionText}>
          Collaborative art evolving through each artist's interpretation. Add your link to the chain!
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {filters.map((f) => (
          <AnimatedPressable
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setFilter(f.key);
            }}
            scaleValue={0.95}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </AnimatedPressable>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={chains}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <ChainCard chain={item} index={index} />}
          contentContainerStyle={styles.list}
          refreshing={false}
          onRefresh={loadChains}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="link-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No chains yet</Text>
              <Text style={styles.emptySubtext}>Start a chain and invite others to evolve your art</Text>
            </View>
          }
        />
      )}
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
  descriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.lg,
  },
  descriptionText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  chainCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  chainPreview: {
    height: 60,
    flexDirection: 'row',
    position: 'relative',
  },
  chainPreviewImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.backgroundSecondary,
  },
  chainPreviewMore: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    position: 'absolute',
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundSecondary,
  },
  chainPreviewMoreText: {
    fontSize: fontSize.sm,
    fontFamily: typography.bold,
    color: colors.textSecondary,
  },
  chainInfo: {
    gap: 4,
  },
  chainTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.bold,
    color: colors.text,
  },
  chainTheme: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  chainDesc: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  chainMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  chainStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chainStatText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  chainStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  chainStatusText: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
