import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SCREEN_WIDTH, POST_GRID_GAP } from '@/lib/constants';

const COLUMNS = 3;
const SIZE = (SCREEN_WIDTH - POST_GRID_GAP * (COLUMNS - 1)) / COLUMNS;

type Props = { entries: any[]; onPress: (postId: string) => void };

export function ChallengeEntryGrid({ entries, onPress }: Props) {
  return (
    <View style={styles.grid}>
      {entries.map(entry => (
        <TouchableOpacity key={entry.id} onPress={() => onPress(entry.post?.id || entry.post_id)}>
          <Image source={{ uri: entry.post?.media?.[0]?.media_url }} style={styles.image} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: POST_GRID_GAP },
  image: { width: SIZE, height: SIZE },
});
