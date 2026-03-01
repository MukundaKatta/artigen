import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useUpscaling } from '@/hooks/useUpscaling';
import { UpscalePreview } from '@/components/create/UpscalePreview';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function UpscaleRoute() {
  const { imageUrl, postId } = useLocalSearchParams<{ imageUrl: string; postId?: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { job, loading, startUpscaling } = useUpscaling(user?.id);
  const [scaleFactor, setScaleFactor] = useState<2 | 4>(2);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Upscale' }} />
      <UpscalePreview
        originalUri={imageUrl || ''}
        resultUri={job?.result_image_url || undefined}
        scaleFactor={scaleFactor}
      />
      <Text style={styles.sectionTitle}>Scale Factor</Text>
      <View style={styles.scaleRow}>
        <TouchableOpacity
          style={[styles.scaleButton, scaleFactor === 2 && styles.scaleButtonActive]}
          onPress={() => setScaleFactor(2)}
        >
          <Text style={[styles.scaleText, scaleFactor === 2 && styles.scaleTextActive]}>2x</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.scaleButton, scaleFactor === 4 && styles.scaleButtonActive]}
          onPress={() => setScaleFactor(4)}
        >
          <Text style={[styles.scaleText, scaleFactor === 4 && styles.scaleTextActive]}>4x</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <Button
          title={job?.status === 'processing' ? 'Processing...' : 'Upscale Image'}
          variant="primary"
          loading={loading || job?.status === 'processing'}
          disabled={job?.status === 'processing'}
          onPress={() => {
            if (imageUrl) {
              startUpscaling(imageUrl, scaleFactor, postId || undefined);
            }
          }}
          style={styles.button}
        />
      </View>
      {job?.status === 'failed' && (
        <Text style={styles.errorText}>{job.error_message || 'Upscaling failed. Please try again.'}</Text>
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
  scaleRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg },
  scaleButton: { flex: 1, paddingVertical: spacing.md, borderRadius: 8, borderWidth: 2, borderColor: colors.border, alignItems: 'center' },
  scaleButtonActive: { borderColor: colors.primary, backgroundColor: 'rgba(0, 149, 246, 0.1)' },
  scaleText: { fontSize: fontSize.lg, fontFamily: typography.semiBold, color: colors.textSecondary },
  scaleTextActive: { color: colors.primary },
  buttonRow: { padding: spacing.lg },
  button: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  errorText: { color: colors.error, fontSize: fontSize.sm, textAlign: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
});
