import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  getGenerationHistory,
  deleteGeneration,
  type GenerationRecord,
} from '@/services/generation-history.service';
import { MODEL_CREDITS } from '@/services/credits.service';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';

const COLUMN_COUNT = 3;

export default function GenerationHistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [generations, setGenerations] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadGenerations = useCallback(async (pageNum: number, append = false) => {
    if (!user) return;
    const data = await getGenerationHistory(user.id, pageNum);
    if (data.length < 20) setHasMore(false);
    setGenerations((prev) => append ? [...prev, ...data] : data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadGenerations(0);
  }, [loadGenerations]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadGenerations(nextPage, true);
  }, [hasMore, loading, page, loadGenerations]);

  const handleDelete = useCallback((item: GenerationRecord) => {
    const doDelete = async () => {
      if (!user) return;
      const success = await deleteGeneration(item.id, user.id);
      if (success) {
        setGenerations((prev) => prev.filter((g) => g.id !== item.id));
      }
    };

    if (Platform.OS === 'web') {
      doDelete();
    } else {
      Alert.alert('Delete Generation', 'Remove this from your history?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  }, [user]);

  const handleReuse = useCallback((item: GenerationRecord) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(camera)/generate',
      params: {
        prefillPrompt: item.prompt,
        prefillModel: item.model_id,
      },
    });
  }, [router]);

  const renderItem = useCallback(({ item, index }: { item: GenerationRecord; index: number }) => {
    const creditCost = MODEL_CREDITS[item.model_id] ?? 0;

    return (
      <Animated.View
        entering={FadeInDown.delay(Math.min(index, 11) * 30).duration(200)}
        style={styles.gridItem}
      >
        <Pressable
          onPress={() => handleReuse(item)}
          onLongPress={() => handleDelete(item)}
          accessibilityLabel={`Generation: ${item.prompt.substring(0, 50)}`}
          accessibilityHint="Tap to reuse prompt, long press to delete"
        >
          <Image
            source={{ uri: item.image_url }}
            style={styles.gridImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            recyclingKey={item.id}
          />
          <View style={styles.gridOverlay}>
            <Text style={styles.modelBadge} numberOfLines={1}>
              {item.model_name}
            </Text>
            {creditCost > 0 && (
              <View style={styles.creditBadge}>
                <Ionicons name="flash" size={10} color={colors.warning} />
                <Text style={styles.creditText}>{creditCost}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }, [handleReuse, handleDelete]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      {generations.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No generations yet</Text>
          <Text style={styles.emptyText}>
            Your AI-generated images will appear here. Tap to reuse any prompt.
          </Text>
          <Pressable
            style={styles.createButton}
            onPress={() => router.push('/(camera)/generate')}
          >
            <Ionicons name="sparkles" size={18} color="#fff" />
            <Text style={styles.createButtonText}>Generate Your First Image</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={generations}
          numColumns={COLUMN_COUNT}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          ListHeaderComponent={
            <Text style={styles.headerText}>
              {generations.length} generation{generations.length !== 1 ? 's' : ''} — tap to reuse, hold to delete
            </Text>
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
  grid: {
    padding: spacing.xs,
  },
  headerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.regular,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  gridItem: {
    flex: 1 / COLUMN_COUNT,
    aspectRatio: 1,
    padding: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  modelBadge: {
    fontSize: 9,
    color: '#fff',
    fontFamily: typography.semiBold,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    maxWidth: '70%',
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  creditText: {
    fontSize: 9,
    color: colors.warning,
    fontFamily: typography.semiBold,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  createButtonText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
});
