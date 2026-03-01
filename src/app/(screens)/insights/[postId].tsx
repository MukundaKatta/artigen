import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { InsightsDashboard } from '@/components/profile/InsightsDashboard';
import { colors } from '@/lib/theme';

export default function InsightsRoute() {
  const { postId } = useLocalSearchParams<{ postId: string }>();

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Post Insights' }} />
      {postId && <InsightsDashboard postId={postId} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
