import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useOutpainting } from '@/hooks/useOutpainting';
import { OutpaintDirectionPicker } from '@/components/create/OutpaintDirectionPicker';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { SCREEN_WIDTH } from '@/lib/constants';

export default function OutpaintRoute() {
  const { imageUrl, postId } = useLocalSearchParams<{ imageUrl: string; postId?: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { job, loading, startOutpainting } = useOutpainting(user?.id);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | 'all'>('all');
  const [prompt, setPrompt] = useState('');

  const imageSize = SCREEN_WIDTH - spacing.lg * 2;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Outpaint' }} />
      <View style={styles.imageContainer}>
        {job?.result_image_url ? (
          <Image source={{ uri: job.result_image_url }} style={[styles.image, { width: imageSize, height: imageSize }]} />
        ) : (
          <Image source={{ uri: imageUrl || '' }} style={[styles.image, { width: imageSize, height: imageSize }]} />
        )}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </View>
      <Text style={styles.sectionTitle}>Expand Direction</Text>
      <OutpaintDirectionPicker selected={direction} onSelect={setDirection} />
      <Text style={styles.sectionTitle}>Prompt (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe what should appear in the expanded area..."
        placeholderTextColor={colors.textSecondary}
        value={prompt}
        onChangeText={setPrompt}
        multiline
      />
      <View style={styles.buttonRow}>
        <Button
          title={job?.status === 'processing' ? 'Processing...' : 'Expand Image'}
          variant="primary"
          loading={loading || job?.status === 'processing'}
          disabled={job?.status === 'processing'}
          onPress={() => {
            if (imageUrl) {
              startOutpainting(imageUrl, direction, postId || undefined, prompt || undefined);
            }
          }}
          style={styles.button}
        />
      </View>
      {job?.status === 'failed' && (
        <Text style={styles.errorText}>{job.error_message || 'Outpainting failed. Please try again.'}</Text>
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
  imageContainer: { alignItems: 'center', padding: spacing.lg },
  image: { borderRadius: 8 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8 },
  loadingText: { color: colors.textLight, fontSize: fontSize.sm, fontFamily: typography.medium, marginTop: spacing.sm },
  sectionTitle: { fontSize: fontSize.md, fontFamily: typography.semiBold, color: colors.text, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  input: { marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: fontSize.md, color: colors.text, fontFamily: typography.regular, minHeight: 60 },
  buttonRow: { padding: spacing.lg },
  button: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  errorText: { color: colors.error, fontSize: fontSize.sm, textAlign: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
});
