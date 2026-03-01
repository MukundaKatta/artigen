import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getChallenges, getActiveChallenge } from '@/services/challenge.service';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function ChallengesRoute() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getActiveChallenge(),
      getChallenges(),
    ]).then(([activeRes, allRes]) => {
      setActive(activeRes.data);
      setChallenges(allRes.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Challenges' }} />
      {active && (
        <TouchableOpacity style={styles.activeCard} onPress={() => router.push(`/(screens)/challenge/${active.id}`)}>
          <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>ACTIVE</Text></View>
          <Text style={styles.activeTitle}>{active.prompt_theme}</Text>
          <Text style={styles.activeHint}>{active.description}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.sectionTitle}>All Challenges</Text>
      <FlatList
        data={challenges}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => router.push(`/(screens)/challenge/${item.id}`)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.prompt_theme}</Text>
              <Text style={styles.rowMeta}>daily · {item.date}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No challenges yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  activeCard: { margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.primary + '10', borderRadius: 12, borderWidth: 1, borderColor: colors.primary + '30' },
  activeBadge: { backgroundColor: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: spacing.sm },
  activeBadgeText: { color: '#fff', fontSize: 10, fontFamily: typography.bold },
  activeTitle: { fontSize: fontSize.lg, fontFamily: typography.bold, color: colors.text, marginBottom: 4 },
  activeHint: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  activeCount: { fontSize: fontSize.sm, fontFamily: typography.medium, color: colors.primary },
  sectionTitle: { fontSize: fontSize.md, fontFamily: typography.semiBold, color: colors.text, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowTitle: { fontSize: fontSize.md, fontFamily: typography.medium, color: colors.text },
  rowMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textSecondary, padding: spacing.xl },
});
