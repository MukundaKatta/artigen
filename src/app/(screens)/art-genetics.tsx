import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { breedArtworks, saveOffspringPost } from '@/services/art-genetics.service';
import type { BreedResult } from '@/services/art-genetics.service';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';

const DNA_COLORS = { a: '#833AB4', b: '#F77737', blend: '#0095F6' };

export default function ArtGeneticsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [postIdA, setPostIdA] = useState('');
  const [postIdB, setPostIdB] = useState('');
  const [phase, setPhase] = useState<'setup' | 'breeding' | 'result'>('setup');
  const [result, setResult] = useState<BreedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleBreed = useCallback(async () => {
    if (!postIdA.trim() || !postIdB.trim()) return;
    setPhase('breeding');
    setError(null);

    const { data, error: err } = await breedArtworks(postIdA.trim(), postIdB.trim());
    if (err || !data) {
      setError(err ?? 'Breeding failed');
      setPhase('setup');
      return;
    }

    setResult(data);
    setPhase('result');
  }, [postIdA, postIdB]);

  const handleSave = useCallback(async () => {
    if (!user || !result) return;
    setSaving(true);
    const { data, error: err } = await saveOffspringPost(
      user.id,
      result.imageUrl,
      result.offspringPrompt,
      postIdA.trim(),
      postIdB.trim()
    );
    setSaving(false);
    if (err) { Alert.alert('Error', err); return; }
    Alert.alert('Posted!', 'Your offspring artwork has been shared.', [
      { text: 'View', onPress: () => router.push(`/(screens)/post/${data!.id}`) },
      { text: 'Done', onPress: () => router.back() },
    ]);
  }, [user, result, postIdA, postIdB, router]);

  const handleReset = useCallback(() => {
    setPhase('setup');
    setResult(null);
    setError(null);
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Art Genetics' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Header */}
        <LinearGradient
          colors={['#833AB4', '#515BD4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerEmoji}>🧬</Text>
          <Text style={styles.headerTitle}>Art Genetics</Text>
          <Text style={styles.headerSubtitle}>
            Combine two artworks to breed a unique offspring
          </Text>
        </LinearGradient>

        {phase === 'setup' && (
          <>
            {/* Parent A */}
            <Text style={styles.sectionTitle}>
              <Text style={{ color: DNA_COLORS.a }}>■ </Text>Parent A
            </Text>
            <Text style={styles.hint}>
              Go to a post, tap the share icon, and copy the Post ID from the URL.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Paste Post ID for artwork A"
              placeholderTextColor={colors.textSecondary}
              value={postIdA}
              onChangeText={setPostIdA}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* DNA divider */}
            <View style={styles.dnaDivider}>
              <View style={[styles.dnaLine, { backgroundColor: DNA_COLORS.a }]} />
              <View style={styles.dnaCenter}>
                <Text style={styles.dnaCross}>✕</Text>
              </View>
              <View style={[styles.dnaLine, { backgroundColor: DNA_COLORS.b }]} />
            </View>

            {/* Parent B */}
            <Text style={styles.sectionTitle}>
              <Text style={{ color: DNA_COLORS.b }}>■ </Text>Parent B
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Paste Post ID for artwork B"
              placeholderTextColor={colors.textSecondary}
              value={postIdB}
              onChangeText={setPostIdB}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <Pressable
              style={[styles.breedBtn, (!postIdA.trim() || !postIdB.trim()) && styles.breedBtnDisabled]}
              onPress={handleBreed}
              disabled={!postIdA.trim() || !postIdB.trim()}
            >
              <LinearGradient
                colors={['#833AB4', '#515BD4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.breedBtnGradient}
              >
                <Text style={styles.breedBtnText}>🧬 Breed Artworks</Text>
              </LinearGradient>
            </Pressable>

            {/* How it works */}
            <View style={styles.howCard}>
              <Text style={styles.howTitle}>How it works</Text>
              {[
                'Artigen extracts the visual DNA (style, themes, colors) from each parent artwork',
                'A unique genetic blend is computed, mixing traits from both parents',
                'A brand new artwork is generated carrying inherited characteristics',
              ].map((step, i) => (
                <View key={i} style={styles.howStep}>
                  <View style={styles.howNum}>
                    <Text style={styles.howNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.howText}>{step}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {phase === 'breeding' && (
          <View style={styles.breedingContainer}>
            {/* Animated DNA helix representation */}
            <View style={styles.dnaAnimation}>
              <View style={styles.dnaStrandA} />
              <ActivityIndicator color="#833AB4" size="large" />
              <View style={styles.dnaStrandB} />
            </View>
            <Text style={styles.breedingTitle}>Combining genetic material...</Text>
            <Text style={styles.breedingSubtitle}>
              Extracting traits from both parents and generating offspring
            </Text>
          </View>
        )}

        {phase === 'result' && result && (
          <>
            <Text style={styles.resultTitle}>🎉 Offspring Created</Text>

            {/* Offspring artwork */}
            <Image
              source={{ uri: result.imageUrl }}
              style={styles.offspringImage}
              contentFit="cover"
            />

            {/* Genetic traits */}
            <Text style={styles.sectionTitle}>Inherited Traits</Text>
            <View style={styles.traitsCard}>
              {result.traits.map((trait, i) => (
                <View key={i} style={styles.traitRow}>
                  <View style={styles.traitHeader}>
                    <View style={[styles.traitDot, { backgroundColor: DNA_COLORS[trait.fromParent] }]} />
                    <Text style={styles.traitName}>{trait.name}</Text>
                    <Text style={[styles.traitSource, { color: DNA_COLORS[trait.fromParent] }]}>
                      {trait.fromParent === 'blend' ? 'Blended' : `From ${trait.fromParent.toUpperCase()}`}
                    </Text>
                    <Text style={styles.traitWeight}>{trait.weight}%</Text>
                  </View>
                  <View style={styles.traitBarTrack}>
                    <View
                      style={[styles.traitBarFill, { width: `${trait.weight}%` as any, backgroundColor: DNA_COLORS[trait.fromParent] }]}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Prompt */}
            <Text style={styles.sectionTitle}>Offspring Prompt</Text>
            <View style={styles.promptCard}>
              <Text style={styles.promptText}>{result.offspringPrompt}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <Pressable style={styles.resetBtn} onPress={handleReset}>
                <Ionicons name="refresh" size={18} color={colors.text} />
                <Text style={styles.resetBtnText}>Breed Again</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="share-outline" size={18} color="#fff" />
                    <Text style={styles.saveBtnText}>Share Offspring</Text>
                  </>
                )}
              </Pressable>
            </View>
          </>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  headerEmoji: { fontSize: 40, marginBottom: spacing.sm },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  input: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dnaDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
  },
  dnaLine: { flex: 1, height: 2, borderRadius: 1 },
  dnaCenter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  dnaCross: {
    fontSize: fontSize.md,
    fontFamily: typography.bold,
    color: colors.text,
  },
  errorText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.error,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  breedBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  breedBtnDisabled: { opacity: 0.4 },
  breedBtnGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breedBtnText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
  howCard: {
    margin: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  howTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  howStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  howNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#833AB4',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  howNumText: { fontSize: fontSize.xs, fontFamily: typography.bold, color: '#fff' },
  howText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  breedingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
  },
  dnaAnimation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  dnaStrandA: {
    width: 4,
    height: 60,
    borderRadius: 2,
    backgroundColor: DNA_COLORS.a,
    opacity: 0.6,
  },
  dnaStrandB: {
    width: 4,
    height: 60,
    borderRadius: 2,
    backgroundColor: DNA_COLORS.b,
    opacity: 0.6,
  },
  breedingTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    color: colors.text,
    textAlign: 'center',
  },
  breedingSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  resultTitle: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    margin: spacing.lg,
  },
  offspringImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  traitsCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  traitRow: { marginBottom: spacing.md },
  traitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  traitDot: { width: 10, height: 10, borderRadius: 5 },
  traitName: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  traitSource: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
  },
  traitWeight: {
    fontSize: fontSize.sm,
    fontFamily: typography.bold,
    color: colors.textSecondary,
    width: 36,
    textAlign: 'right',
  },
  traitBarTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  traitBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  promptCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#833AB4',
  },
  promptText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    margin: spacing.lg,
    marginTop: spacing.xl,
  },
  resetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetBtnText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: '#833AB4',
  },
  saveBtnText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
});
