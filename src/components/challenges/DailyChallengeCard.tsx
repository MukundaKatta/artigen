import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { challenge: any; onPress: () => void };

export function DailyChallengeCard({ challenge, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <ImageBackground source={challenge.cover_url ? { uri: challenge.cover_url } : undefined} style={styles.bg} imageStyle={styles.bgImage}>
        <View style={styles.overlay}>
          <View style={styles.badge}>
            <Ionicons name="flame" size={14} color="#FF6B00" />
            <Text style={styles.badgeText}>{challenge.challenge_type?.toUpperCase() || 'DAILY'} CHALLENGE</Text>
          </View>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.hint} numberOfLines={2}>{challenge.prompt_hint}</Text>
          <Text style={styles.entries}>{challenge.entry_count || 0} entries</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.md, marginVertical: spacing.sm, borderRadius: 16, overflow: 'hidden' },
  bg: { minHeight: 140 },
  bgImage: { borderRadius: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: spacing.md, justifyContent: 'flex-end' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(255,107,0,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginBottom: spacing.xs },
  badgeText: { color: '#FF6B00', fontSize: 10, fontFamily: typography.bold },
  title: { color: '#fff', fontSize: fontSize.lg, fontFamily: typography.bold },
  hint: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm, marginTop: 2 },
  entries: { color: 'rgba(255,255,255,0.6)', fontSize: fontSize.xs, marginTop: spacing.xs },
});
