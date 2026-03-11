import React from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { entries: any[]; onPress?: (userId: string) => void };

export function LeaderboardList({ entries, onPress }: Props) {
  return (
    <FlatList
      data={entries}
      keyExtractor={item => item.id}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInRight.delay(Math.min(index, 10) * 40).duration(250)}>
          <AnimatedPressable
            style={styles.row}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              onPress?.(item.user?.id);
            }}
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
      )}
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
