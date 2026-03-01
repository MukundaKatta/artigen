import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useText3D } from '@/hooks/useText3D';
import { Text3DPreview } from '@/components/3d/Text3DPreview';
import { Text3DPromptInput } from '@/components/3d/Text3DPromptInput';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function TextTo3DScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { job, loading, generate } = useText3D(user?.id);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generate(prompt.trim(), negativePrompt.trim() || undefined);
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Text to 3D' }} />

      <Text3DPreview
        thumbnailUrl={job?.result_thumbnail_url}
        modelUrl={job?.result_model_url}
      />

      {job?.status === 'processing' && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.processingText}>Generating your 3D model...</Text>
          <Text style={styles.processingSubtext}>This may take a few minutes</Text>
        </View>
      )}

      {job?.status === 'failed' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Generation failed: {job.error_message || 'Unknown error'}
          </Text>
        </View>
      )}

      <View style={styles.inputSection}>
        <Text3DPromptInput
          prompt={prompt}
          onChangePrompt={setPrompt}
          negativePrompt={negativePrompt}
          onChangeNegativePrompt={setNegativePrompt}
        />
      </View>

      <View style={styles.buttonRow}>
        <Button
          title={loading ? 'Generating...' : 'Generate 3D Model'}
          variant="primary"
          loading={loading}
          disabled={!prompt.trim() || loading}
          onPress={handleGenerate}
          size="lg"
          style={styles.button}
        />
      </View>

      {job?.status === 'completed' && job.result_thumbnail_url && (
        <Button
          title="Create Post"
          variant="outline"
          onPress={() => router.push({ pathname: '/(camera)/new-post', params: { imageUri: job.result_thumbnail_url } })}
          style={styles.button}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inputSection: {
    paddingTop: spacing.lg,
  },
  processingContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  processingText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  processingSubtext: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  errorContainer: {
    padding: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.error,
    textAlign: 'center',
  },
  buttonRow: {
    padding: spacing.lg,
  },
  button: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
});
