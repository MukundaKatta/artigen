import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useAiMusic } from '@/hooks/useAiMusic';
import { MoodPicker } from '@/components/music/MoodPicker';
import { MusicPlayer } from '@/components/music/MusicPlayer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/Input';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function MusicGeneratorScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { job, loading, mood, setMood, generate } = useAiMusic(user?.id);
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(30);

  const handleGenerate = () => {
    generate({
      prompt: prompt || undefined,
      mood: mood || undefined,
      durationSeconds: duration,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'AI Music' }} />

      <Text style={styles.sectionTitle}>Mood</Text>
      <MoodPicker selected={mood} onSelect={setMood} />

      <View style={styles.section}>
        <Input
          label="Prompt (optional)"
          placeholder="Describe the music you want..."
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Duration: {duration}s</Text>
        <Slider
          minimumValue={10}
          maximumValue={60}
          step={5}
          value={duration}
          onValueChange={setDuration}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          style={styles.slider}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>10s</Text>
          <Text style={styles.sliderLabel}>60s</Text>
        </View>
      </View>

      {job?.status === 'processing' && (
        <View style={styles.processingContainer}>
          <LoadingSpinner size="large" color={colors.primary} />
          <Text style={styles.processingText}>Generating your music...</Text>
        </View>
      )}

      {job?.status === 'completed' && job.result_audio_url && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Music</Text>
          <MusicPlayer audioUrl={job.result_audio_url} title={mood || 'AI Generated'} />
        </View>
      )}

      {job?.status === 'failed' && (
        <View style={styles.section}>
          <Text style={styles.errorText}>
            Generation failed: {job.error_message || 'Unknown error'}
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <Button
          title={loading ? 'Generating...' : 'Generate Music'}
          variant="primary"
          loading={loading}
          disabled={!mood || loading}
          onPress={handleGenerate}
          size="lg"
          style={styles.button}
        />
      </View>

      {job?.status === 'completed' && (
        <Button
          title="Attach to Post"
          variant="outline"
          onPress={() => router.push({ pathname: '/(camera)/new-post', params: { musicUrl: job.result_audio_url, musicTitle: mood || 'AI Generated' } })}
          style={styles.button}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  processingContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  processingText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
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
