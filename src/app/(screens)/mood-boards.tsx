import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/providers/AuthProvider';
import {
  fetchUserMoodBoards,
  fetchPublicMoodBoards,
  createMoodBoard,
  generateMoodBoardFromPrompt,
  type MoodBoard,
} from '@/services/mood-board.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

function MoodBoardCard({ board, index }: { board: MoodBoard; index: number }) {
  const router = useRouter();

  // Show first few colors from items
  const colorItems = board.items?.filter((i) => i.type === 'color').slice(0, 5) || [];

  return (
    <Animated.View entering={FadeInUp.delay(index * 60).duration(400)}>
      <AnimatedPressable
        style={styles.boardCard}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/(screens)/mood-board/${board.id}`);
        }}
        scaleValue={0.97}
      >
        {/* Color Preview Strip */}
        <View style={styles.colorStrip}>
          {colorItems.length > 0 ? (
            colorItems.map((item, i) => (
              <View
                key={item.id}
                style={[styles.colorSwatch, { backgroundColor: item.content, flex: 1 }]}
              />
            ))
          ) : (
            <View style={[styles.colorSwatch, { backgroundColor: board.background_color, flex: 1 }]} />
          )}
        </View>

        <View style={styles.boardInfo}>
          <Text style={styles.boardTitle} numberOfLines={1}>{board.title}</Text>
          {board.description ? (
            <Text style={styles.boardDesc} numberOfLines={2}>{board.description}</Text>
          ) : null}
          <View style={styles.boardMeta}>
            <Text style={styles.boardMetaText}>
              {board.items?.length || 0} items
            </Text>
            {board.is_public && (
              <View style={styles.publicBadge}>
                <Ionicons name="globe-outline" size={10} color={colors.primary} />
                <Text style={styles.publicBadgeText}>Public</Text>
              </View>
            )}
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function MoodBoardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [myBoards, setMyBoards] = useState<MoodBoard[]>([]);
  const [publicBoards, setPublicBoards] = useState<MoodBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'mine' | 'explore'>('mine');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const loadBoards = useCallback(async () => {
    setLoading(true);
    const [mine, pub] = await Promise.all([
      user?.id ? fetchUserMoodBoards(user.id) : Promise.resolve([]),
      fetchPublicMoodBoards(),
    ]);
    setMyBoards(mine);
    setPublicBoards(pub);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  async function handleCreateNew() {
    if (!user?.id) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const id = await createMoodBoard(user.id, 'Untitled Board');
    if (id) router.push(`/(screens)/mood-board/${id}`);
  }

  async function handleAiGenerate() {
    if (!user?.id || !aiPrompt.trim()) return;
    setGenerating(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const id = await generateMoodBoardFromPrompt(user.id, aiPrompt.trim());
    setGenerating(false);
    if (id) {
      setAiPrompt('');
      router.push(`/(screens)/mood-board/${id}`);
    }
  }

  const boards = tab === 'mine' ? myBoards : publicBoards;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} scaleValue={0.9}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.title}>Mood Boards</Text>
        <AnimatedPressable onPress={handleCreateNew} scaleValue={0.9}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </AnimatedPressable>
      </View>

      {/* AI Generate */}
      <View style={styles.aiSection}>
        <View style={styles.aiInputRow}>
          <Ionicons name="sparkles" size={18} color={colors.primary} />
          <TextInput
            style={styles.aiInput}
            placeholder="Describe a mood... (e.g., 'cozy autumn evening')"
            placeholderTextColor={colors.textSecondary}
            value={aiPrompt}
            onChangeText={setAiPrompt}
            returnKeyType="go"
            onSubmitEditing={handleAiGenerate}
          />
          <AnimatedPressable
            onPress={handleAiGenerate}
            scaleValue={0.9}
            disabled={generating || !aiPrompt.trim()}
          >
            {generating ? (
              <LoadingSpinner size="small" />
            ) : (
              <Ionicons name="arrow-forward-circle" size={28} color={aiPrompt.trim() ? colors.primary : colors.border} />
            )}
          </AnimatedPressable>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <AnimatedPressable
          style={[styles.tab, tab === 'mine' && styles.tabActive]}
          onPress={() => setTab('mine')}
          scaleValue={0.95}
        >
          <Text style={[styles.tabText, tab === 'mine' && styles.tabTextActive]}>My Boards</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={[styles.tab, tab === 'explore' && styles.tabActive]}
          onPress={() => setTab('explore')}
          scaleValue={0.95}
        >
          <Text style={[styles.tabText, tab === 'explore' && styles.tabTextActive]}>Explore</Text>
        </AnimatedPressable>
      </View>

      {/* Board List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={boards}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <MoodBoardCard board={item} index={index} />}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.list}
          refreshing={false}
          onRefresh={loadBoards}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="color-palette-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>
                {tab === 'mine' ? 'No boards yet' : 'No public boards'}
              </Text>
              <Text style={styles.emptySubtext}>
                {tab === 'mine'
                  ? 'Create a mood board to plan your next AI artwork'
                  : 'Be the first to share a public mood board'}
              </Text>
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
  aiSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  aiInput: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  list: {
    padding: spacing.lg,
  },
  gridRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  boardCard: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  colorStrip: {
    flexDirection: 'row',
    height: 80,
  },
  colorSwatch: {
    minWidth: 20,
  },
  boardInfo: {
    padding: spacing.sm,
    gap: 4,
  },
  boardTitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  boardDesc: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  boardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  boardMetaText: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  publicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  publicBadgeText: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: colors.primary,
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
    paddingHorizontal: spacing.xxxl,
  },
});
