import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTrending } from '@/hooks/useTrending';
import { TrendingPromptsSection } from '@/components/search/TrendingPromptsSection';
import { TrendingStyleChips } from '@/components/search/TrendingStyleChips';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors } from '@/lib/theme';

export default function TrendingScreen() {
  const router = useRouter();
  const { prompts, styles: trendingStyles, loading } = useTrending();

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScrollView style={styles.container}>
      <TrendingStyleChips styles_data={trendingStyles} onSelect={() => {}} />
      <TrendingPromptsSection
        prompts={prompts}
        onGenerate={(prompt) => router.push({ pathname: '/(camera)/generate', params: { prefill: prompt } })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
