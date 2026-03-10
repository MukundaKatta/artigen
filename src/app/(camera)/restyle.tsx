import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useRestyle } from '@/hooks/useRestyle';
import { StylePresetGrid } from '@/components/create/StylePresetGrid';
import { RestylePreview } from '@/components/create/RestylePreview';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function RestyleRoute() {
  const { imageUrl, postId } = useLocalSearchParams<{ imageUrl: string; postId?: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { presets, selectedPreset, setSelectedPreset, job, startRestyle, loading } = useRestyle(user?.id);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Restyle' }} />
      <RestylePreview sourceUrl={imageUrl || ''} resultUrl={job?.result_image_url ?? undefined} />
      <Text style={styles.sectionTitle}>Choose a Style</Text>
      <StylePresetGrid presets={presets} selectedId={selectedPreset?.id || null} onSelect={setSelectedPreset} />
      <View style={styles.buttonRow}>
        <Button
          title={job?.status === 'processing' ? 'Processing...' : 'Apply Style'}
          variant="primary"
          loading={loading || job?.status === 'processing'}
          disabled={!selectedPreset || job?.status === 'processing'}
          onPress={() => {
            if (selectedPreset && imageUrl) {
              startRestyle(imageUrl, postId || undefined);
            }
          }}
          style={styles.button}
        />
      </View>
      {job?.status === 'completed' && (
        <Button
          title="Create Post with Result"
          variant="outline"
          onPress={() => router.push({ pathname: '/(camera)/new-post', params: { imageUri: job.result_image_url } })}
          style={styles.button}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  sectionTitle: { fontSize: fontSize.md, fontFamily: typography.semiBold, color: colors.text, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  buttonRow: { padding: spacing.lg },
  button: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
});
