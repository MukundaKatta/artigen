import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useAnimation } from '@/hooks/useAnimation';
import { AnimationTypePicker } from '@/components/create/AnimationTypePicker';
import { AnimationPreview } from '@/components/create/AnimationPreview';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function AnimateRoute() {
  const { imageUrl, postId } = useLocalSearchParams<{ imageUrl: string; postId?: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { animationType, setAnimationType, job, startAnimation, loading } = useAnimation(user?.id);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Animate' }} />
      <AnimationPreview sourceUrl={imageUrl || ''} resultUrl={job?.result_video_url || null} />
      <Text style={styles.sectionTitle}>Animation Type</Text>
      <AnimationTypePicker selected={animationType} onSelect={(t: string) => setAnimationType(t as typeof animationType)} />
      <View style={styles.buttonRow}>
        <Button
          title={job?.status === 'processing' ? 'Processing...' : 'Start Animation'}
          variant="primary"
          loading={loading || job?.status === 'processing'}
          disabled={!animationType || job?.status === 'processing'}
          onPress={() => {
            if (animationType && imageUrl) {
              startAnimation(imageUrl, postId || undefined);
            }
          }}
          style={styles.button}
        />
      </View>
      {job?.status === 'completed' && job.result_video_url && (
        <Button
          title="Create Post with Video"
          variant="outline"
          onPress={() => router.push({ pathname: '/(camera)/new-post', params: { imageUri: job.result_video_url, mediaType: 'video' } })}
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
