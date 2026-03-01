import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVisualSearch } from '@/hooks/useVisualSearch';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { SCREEN_WIDTH, POST_GRID_GAP } from '@/lib/constants';

const COLS = 3;
const SIZE = (SCREEN_WIDTH - POST_GRID_GAP * (COLS - 1)) / COLS;

export default function VisualSearchScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const { results, loading, findSimilar } = useVisualSearch();

  React.useEffect(() => { if (postId) findSimilar(postId); }, [postId]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Similar Art</Text>
      <FlatList
        data={results}
        numColumns={COLS}
        keyExtractor={(item, i) => item.post_id || String(i)}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/(screens)/post/${item.post_id}`)}>
            <View style={styles.cell}>
              {item.media_url ? (
                <Image
                  source={{ uri: item.media_url }}
                  style={styles.cellImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}>
                    {Math.round((item.similarity ?? 0) * 100)}%
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No similar posts found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: fontSize.lg, fontFamily: typography.bold, color: colors.text, padding: spacing.md },
  cell: { width: SIZE, height: SIZE, backgroundColor: colors.surface },
  cellImage: { width: SIZE, height: SIZE },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: fontSize.sm, fontFamily: typography.medium, color: colors.textSecondary },
  empty: { textAlign: 'center', color: colors.textSecondary, padding: spacing.xl },
});
