import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { POST_GRID_SIZE, POST_GRID_GAP } from '@/lib/constants';
import type { Collection } from '@/types';

type Props = {
  collections: Collection[];
  onCreateNew: () => void;
};

export function CollectionGrid({ collections, onCreateNew }: Props) {
  const router = useRouter();

  const renderItem = ({ item }: { item: Collection | 'add' }) => {
    if (item === 'add') {
      return (
        <AnimatedPressable style={styles.addCard} onPress={() => {
          if (Platform.OS !== 'web') Haptics.selectionAsync();
          onCreateNew();
        }} scaleValue={0.95}>
          <Ionicons name="add" size={32} color={colors.textSecondary} />
          <Text style={styles.addText}>New</Text>
        </AnimatedPressable>
      );
    }

    return (
      <AnimatedPressable
        style={styles.card}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.selectionAsync();
          router.push(`/(screens)/collection/${item.id}`);
        }}
        scaleValue={0.97}
      >
        {item.cover_url ? (
          <Image source={{ uri: item.cover_url }} style={styles.cover} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.cover, styles.emptycover]}>
            <Ionicons name="bookmark" size={24} color={colors.border} />
          </View>
        )}
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.count}>{item.post_count} posts</Text>
      </AnimatedPressable>
    );
  };

  const data: (Collection | 'add')[] = [...collections, 'add'];

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => (typeof item === 'string' ? 'add' : item.id)}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    flex: 1,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  emptycover: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
  },
  count: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  addCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
