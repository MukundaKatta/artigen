import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCollectionPosts } from '@/services/collection.service';
import { getLocation } from '@/services/location.service';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { POST_GRID_SIZE, POST_GRID_GAP } from '@/lib/constants';
import { sortMediaByOrder } from '@/utils/media';

export default function CollectionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await getCollectionPosts(id);
      setPosts(data);
      setLoading(false);
    })();
  }, [id]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Collection' }} />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.post_id}
        numColumns={3}
        renderItem={({ item }) => {
          const post = (item as any).posts;
          const media = sortMediaByOrder(post?.media);
          const firstMedia = media[0];
          return (
            <TouchableOpacity
              onPress={() => router.push(`/(screens)/post/${post?.id}`)}
              style={styles.gridItem}
            >
              {firstMedia && (
                <Image
                  source={{ uri: firstMedia.media_url }}
                  style={styles.gridImage}
                  contentFit="cover"
                />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="bookmark-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>No posts in this collection</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gridItem: {
    width: POST_GRID_SIZE,
    height: POST_GRID_SIZE,
    marginRight: POST_GRID_GAP,
    marginBottom: POST_GRID_GAP,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
