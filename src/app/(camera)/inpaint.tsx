import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useInpainting } from '@/hooks/useInpainting';
import { MaskDrawingCanvas } from '@/components/create/MaskDrawingCanvas';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function InpaintRoute() {
  const { imageUrl, postId } = useLocalSearchParams<{ imageUrl: string; postId?: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { job, loading, startInpainting } = useInpainting(user?.id);
  const [maskUri, setMaskUri] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Inpaint' }} />
      <Text style={styles.sectionTitle}>Draw mask on the area to replace</Text>
      <MaskDrawingCanvas imageUri={imageUrl || ''} onMaskReady={setMaskUri} />
      <Text style={styles.sectionTitle}>Prompt</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe what to fill in the masked area..."
        placeholderTextColor={colors.textSecondary}
        value={prompt}
        onChangeText={setPrompt}
        multiline
      />
      <View style={styles.buttonRow}>
        <Button
          title={job?.status === 'processing' ? 'Processing...' : 'Start Inpainting'}
          variant="primary"
          loading={loading || job?.status === 'processing'}
          disabled={!maskUri || !prompt || job?.status === 'processing'}
          onPress={() => {
            if (maskUri && prompt && imageUrl) {
              startInpainting(imageUrl, maskUri, prompt, postId || undefined);
            }
          }}
          style={styles.button}
        />
      </View>
      {job?.status === 'failed' && (
        <Text style={styles.errorText}>{job.error_message || 'Inpainting failed. Please try again.'}</Text>
      )}
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
  input: { marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: fontSize.md, color: colors.text, fontFamily: typography.regular, minHeight: 60 },
  buttonRow: { padding: spacing.lg },
  button: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  errorText: { color: colors.error, fontSize: fontSize.sm, textAlign: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
});
