import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { BadgeGrid } from '@/components/challenges/BadgeGrid';
import { StreakCounter } from '@/components/challenges/StreakCounter';
import { useStreak } from '@/hooks/useStreak';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function BadgesRoute() {
  const { user } = useAuth();
  const { streak, loading } = useStreak(user?.id);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('user_badges')
      .select('*, badge:badges(*)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .then(({ data }) => setBadges(data || []));
  }, [user?.id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Badges & Streaks' }} />
      <View style={styles.streakSection}>
        <StreakCounter currentStreak={streak?.current_streak || 0} longestStreak={streak?.longest_streak || 0} />
      </View>
      <Text style={styles.sectionTitle}>Earned Badges</Text>
      <BadgeGrid badges={badges} />
      {badges.length === 0 && <Text style={styles.empty}>Keep creating to earn badges!</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  streakSection: { padding: spacing.lg, alignItems: 'center' },
  sectionTitle: { fontSize: fontSize.md, fontFamily: typography.semiBold, color: colors.text, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  empty: { textAlign: 'center', color: colors.textSecondary, padding: spacing.xl, fontSize: fontSize.sm },
});
