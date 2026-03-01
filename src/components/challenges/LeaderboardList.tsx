import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { entries: any[] };

export function LeaderboardList({ entries }: Props) {
  return (
    <FlatList
      data={entries}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <Text style={styles.rank}>#{index + 1}</Text>
          <Image source={{ uri: item.user?.avatar_url }} style={styles.avatar} />
          <Text style={styles.username}>{item.user?.username}</Text>
          <Text style={styles.votes}>{item.vote_count} votes</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, gap: spacing.sm },
  rank: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.primary, width: 30 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  username: { flex: 1, fontSize: fontSize.sm, fontFamily: typography.medium, color: colors.text },
  votes: { fontSize: fontSize.sm, color: colors.textSecondary },
});
