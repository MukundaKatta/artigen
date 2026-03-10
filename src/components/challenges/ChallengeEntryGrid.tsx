import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { SCREEN_WIDTH, POST_GRID_GAP } from '@/lib/constants';
import { colors } from '@/lib/theme';

const COLUMNS = 3;
const SIZE = (SCREEN_WIDTH - POST_GRID_GAP * (COLUMNS - 1)) / COLUMNS;

type Props = { entries: any[]; onPress: (postId: string) => void };

export function ChallengeEntryGrid({ entries, onPress }: Props) {
  return (
    <View style={styles.grid}>
      {entries.map(entry => (
        <AnimatedPressable
          key={entry.id}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            onPress(entry.post?.id || entry.post_id);
          }}
          scaleValue={0.97}
        >
          <Image
            source={{ uri: entry.post?.media?.[0]?.media_url }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        </AnimatedPressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: POST_GRID_GAP },
  image: { width: SIZE, height: SIZE, backgroundColor: colors.backgroundSecondary },
});
