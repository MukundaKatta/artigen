import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type LeaderboardEntry = { id: string; user?: { id: string; avatar_url?: string; username?: string }; vote_count: number };
type Props = { entries: LeaderboardEntry[]; onPress?: (userId: string) => void };

const LeaderboardItem = React.memo(function LeaderboardItem({
  item,
  index,
  onPress,
}: {
  item: LeaderboardEntry;
  index: number;
  onPress?: (userId: string) => void;
}) {
  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    if (item.user?.id) onPress?.(item.user.id);
  }, [item.user?.id, onPress]);

  return (
    <Animated.View entering={FadeInRight.delay(Math.min(index, 10) * 40).duration(250)}>
      <AnimatedPressable
        style={styles.row}
        onPress={handlePress}
        scaleValue={0.98}
      >
        <Text style={[styles.rank, index < 3 && styles.rankTop]}>#{index + 1}</Text>
        <Image
          source={{ uri: item.user?.avatar_url }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
        <Text style={styles.username}>{item.user?.username}</Text>
        <Text style={styles.votes}>{item.vote_count} votes</Text>
      </AnimatedPressable>
    </Animated.View>
  );
});

export function LeaderboardList({ entries, onPress }: Props) {
  const renderItem = useCallback(
    ({ item, index }: { item: LeaderboardEntry; index: number }) => (
      <LeaderboardItem item={item} index={index} onPress={onPress} />
    ),
    [onPress]
  );

  const keyExtractor = useCallback((item: LeaderboardEntry) => item.id, []);

  return (
    <FlatList
      data={entries}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, gap: spacing.sm },
  rank: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.primary, width: 30 },
  rankTop: { color: colors.warning },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.backgroundSecondary },
  username: { flex: 1, fontSize: fontSize.sm, fontFamily: typography.medium, color: colors.text },
  votes: { fontSize: fontSize.sm, color: colors.textSecondary },
});
