import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { analyzeArtwork } from '@/services/art-coach.service';
import type { ArtCritique } from '@/services/art-coach.service';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

const SCORE_COLORS = ['#ED4956', '#F77737', '#FCAF45', '#58C322', '#0095F6'];
function scoreColor(score: number) {
  if (score <= 2) return SCORE_COLORS[0];
  if (score <= 4) return SCORE_COLORS[1];
  if (score <= 6) return SCORE_COLORS[2];
  if (score <= 8) return SCORE_COLORS[3];
  return SCORE_COLORS[4];
}

function ScoreBar({ score }: { score: number }) {
  return (
    <View style={styles.scoreBarTrack}>
      <View style={[styles.scoreBarFill, { width: `${score * 10}%` as any, backgroundColor: scoreColor(score) }]} />
    </View>
  );
}

function DimensionRow({ label, score, feedback }: { label: string; score: number; feedback: string }) {
  return (
    <View style={styles.dimensionRow}>
      <View style={styles.dimensionHeader}>
        <Text style={styles.dimensionLabel}>{label}</Text>
        <Text style={[styles.dimensionScore, { color: scoreColor(score) }]}>{score}/10</Text>
      </View>
      <ScoreBar score={score} />
      <Text style={styles.dimensionFeedback}>{feedback}</Text>
    </View>
  );
}

export default function ArtCoachScreen() {
  const { postId, imageUrl: rawImageUrl, prompt: rawPrompt } = useLocalSearchParams<{
    postId: string;
    imageUrl?: string;
    prompt?: string;
  }>();
  const router = useRouter();

  const [imageUrl, setImageUrl] = useState<string | null>(rawImageUrl ?? null);
  const [prompt, setPrompt] = useState<string | undefined>(rawPrompt);
  const [loading, setLoading] = useState(true);
  const [critique, setCritique] = useState<ArtCritique | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch post media + ai_metadata if imageUrl wasn't passed directly
  useEffect(() => {
    if (imageUrl) return;
    if (!postId) return;
    Promise.all([
      supabase
        .from('post_media')
        .select('media_url')
        .eq('post_id', postId)
        .eq('media_type', 'image')
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('ai_metadata')
        .select('prompt')
        .eq('post_id', postId)
        .maybeSingle(),
    ]).then(([mediaRes, aiRes]) => {
      if (mediaRes.data?.media_url) setImageUrl(mediaRes.data.media_url);
      if (aiRes.data?.prompt) setPrompt(aiRes.data.prompt);
    });
  }, [postId, imageUrl]);

  const runAnalysis = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await analyzeArtwork(url, prompt);
    setLoading(false);
    if (err) setError(err);
    else setCritique(data);
  }, [prompt]);

  useEffect(() => {
    if (imageUrl) runAnalysis(imageUrl);
  }, [imageUrl, runAnalysis]);

  return (
    <>
      <Stack.Screen options={{ title: 'AI Art Coach' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Artwork preview */}
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.artwork} contentFit="cover" />
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={['#833AB4', '#E1306C', '#F77737']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loadingGradientBar}
            />
            <View style={{ marginTop: spacing.xl }}>
              <LoadingSpinner size="large" color={colors.primary} />
            </View>
            <Text style={styles.loadingText}>Analyzing your artwork with AI...</Text>
            <Text style={styles.loadingSubtext}>Examining composition, color, creativity & more</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => imageUrl && runAnalysis(imageUrl)}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {critique && !loading && (
          <>
            {/* Overall Score */}
            <View style={styles.overallCard}>
              <LinearGradient
                colors={['#833AB4', '#E1306C', '#F77737']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.overallGradient}
              >
                <Text style={styles.overallScoreNum}>{critique.overallScore}</Text>
                <Text style={styles.overallScoreLabel}>/ 10</Text>
              </LinearGradient>
              <View style={styles.overallRight}>
                <Text style={styles.overallTitle}>AI Coach Score</Text>
                <Text style={styles.overallSummary}>{critique.summary}</Text>
              </View>
            </View>

            {/* Mood tags */}
            <View style={styles.tagsRow}>
              {critique.moodTags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Style notes */}
            <View style={styles.styleCard}>
              <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
              <Text style={styles.styleNotes}>{critique.styleNotes}</Text>
            </View>

            {/* Dimension breakdown */}
            <Text style={styles.sectionTitle}>Detailed Analysis</Text>
            <View style={styles.card}>
              <DimensionRow label="Composition" {...critique.dimensions.composition} />
              <DimensionRow label="Color Palette" {...critique.dimensions.colorPalette} />
              <DimensionRow label="Detail & Craft" {...critique.dimensions.detail} />
              <DimensionRow label="Creativity" {...critique.dimensions.creativity} />
              <DimensionRow label="Prompt Craft" {...critique.dimensions.promptCraft} />
            </View>

            {/* Strengths */}
            <Text style={styles.sectionTitle}>Strengths</Text>
            <View style={styles.card}>
              {critique.strengths.map((s, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ))}
            </View>

            {/* Improvements */}
            <Text style={styles.sectionTitle}>Areas to Improve</Text>
            <View style={styles.card}>
              {critique.improvements.map((s, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Ionicons name="arrow-up-circle" size={18} color={colors.warning} />
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ))}
            </View>

            {/* Prompt Suggestions */}
            <Text style={styles.sectionTitle}>Try These Prompts</Text>
            {critique.promptSuggestions.map((p, i) => (
              <Pressable
                key={i}
                style={styles.promptSuggestion}
                onPress={() => router.push({ pathname: '/(camera)/generate', params: { prefillPrompt: p } })}
              >
                <Text style={styles.promptSuggestionText}>{p}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </Pressable>
            ))}

            <View style={{ height: spacing.xxxl }} />
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  artwork: {
    width: '100%',
    height: 280,
    backgroundColor: colors.backgroundSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  loadingGradientBar: {
    height: 3,
    width: '60%',
    borderRadius: borderRadius.full,
  },
  loadingText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  errorText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  retryText: {
    color: '#fff',
    fontFamily: typography.semiBold,
    fontSize: fontSize.md,
  },
  overallCard: {
    flexDirection: 'row',
    margin: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  overallGradient: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  overallScoreNum: {
    fontSize: 40,
    fontFamily: typography.bold,
    color: '#fff',
    lineHeight: 44,
  },
  overallScoreLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  overallRight: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  overallTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  overallSummary: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  styleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  styleNotes: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  dimensionRow: {
    marginBottom: spacing.lg,
  },
  dimensionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  dimensionLabel: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  dimensionScore: {
    fontSize: fontSize.md,
    fontFamily: typography.bold,
  },
  scoreBarTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  dimensionFeedback: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bulletText: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 22,
  },
  promptSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  promptSuggestionText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 20,
  },
});
