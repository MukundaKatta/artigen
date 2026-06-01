import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getChallengeEntries } from '@/services/challenge.service';
import { ChallengeEntryGrid } from '@/components/challenges/ChallengeEntryGrid';
import { LeaderboardList } from '@/components/challenges/LeaderboardList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await getChallengeEntries(id!);
      setEntries(data || []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Challenge Entries</Text>
      <ChallengeEntryGrid entries={entries} onPress={(postId) => router.push(`/(screens)/post/${postId}`)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: fontSize.lg, fontFamily: typography.bold, color: colors.text, padding: spacing.md },
});
