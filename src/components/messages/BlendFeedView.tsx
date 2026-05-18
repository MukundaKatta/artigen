import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { SCREEN_WIDTH, POST_GRID_GAP } from '@/lib/constants';

const COLS = 2;
const SIZE = (SCREEN_WIDTH - spacing.md * 2 - POST_GRID_GAP) / COLS;

type BlendItem = {
  post_id: string;
  media_url: string;
  relevance_score?: number;
};
type Props = { posts: BlendItem[]; onPostPress: (postId: string) => void; loading?: boolean };

const BlendGridItem = React.memo(function BlendGridItem({
  item,
  onPress,
}: {
  item: BlendItem;
  onPress: (postId: string) => void;
}) {
  const handlePress = useCallback(() => onPress(item.post_id), [item.post_id, onPress]);
  return (
    <TouchableOpacity onPress={handlePress}>
      <Image source={{ uri: item.media_url }} style={styles.image} />
    </TouchableOpacity>
  );
});

export function BlendFeedView({ posts, onPostPress, loading }: Props) {
  const renderItem = useCallback(
    ({ item }: { item: BlendItem }) => <BlendGridItem item={item} onPress={onPostPress} />,
    [onPostPress]
  );

  const keyExtractor = useCallback((item: BlendItem, i: number) => item.post_id || String(i), []);

  if (posts.length === 0 && !loading) {
    return <Text style={styles.empty}>No blend results yet</Text>;
  }

  return (
    <FlatList
      data={posts}
      numColumns={COLS}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.grid}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  grid: { padding: spacing.md, gap: POST_GRID_GAP },
  image: { width: SIZE, height: SIZE, borderRadius: 8 },
  empty: { textAlign: 'center', color: colors.textSecondary, padding: spacing.xl, fontSize: fontSize.sm },
});
