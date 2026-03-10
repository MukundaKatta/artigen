import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/providers/AuthProvider';
import { generateImage } from '@/services/ai.service';
import {
  COMIC_STYLES,
  splitPlotToPanels,
  buildPanelPrompt,
  saveComicPost,
} from '@/services/comic.service';
import type { ComicPanel, ComicStyle } from '@/services/comic.service';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';

const PANEL_COUNTS = [2, 3, 4, 6];
const MODEL_ID = 'black-forest-labs/FLUX.1-schnell';

export default function ComicGeneratorScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [phase, setPhase] = useState<'setup' | 'generating' | 'preview'>('setup');
  const [title, setTitle] = useState('');
  const [plot, setPlot] = useState('');
  const [characters, setCharacters] = useState('');
  const [panelCount, setPanelCount] = useState(4);
  const [style, setStyle] = useState<ComicStyle>('western_comic');
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef(false);

  const generateComic = useCallback(async () => {
    if (!plot.trim() || !user) return;
    abortRef.current = false;
    setPhase('generating');

    const descriptions = splitPlotToPanels(plot, panelCount);
    const initialPanels: ComicPanel[] = descriptions.map((desc, i) => ({
      id: `panel-${i}`,
      panelNumber: i + 1,
      description: desc,
      imageUrl: null,
      generating: true,
      error: null,
    }));
    setPanels(initialPanels);

    // Generate panels sequentially to maintain style consistency
    for (let i = 0; i < descriptions.length; i++) {
      if (abortRef.current) break;

      const prompt = buildPanelPrompt(descriptions[i], style, characters, i + 1, panelCount);
      const { data, error } = await generateImage({
        prompt,
        model_id: MODEL_ID,
        provider: 'huggingface',
        width: 768,
        height: 768,
      });

      setPanels((prev) =>
        prev.map((p) =>
          p.id === `panel-${i}`
            ? { ...p, generating: false, imageUrl: data?.image_url ?? null, error: error ?? null }
            : p
        )
      );
    }

    setPhase('preview');
  }, [plot, user, panelCount, style, characters]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    const readyPanels = panels.filter((p) => p.imageUrl);
    if (readyPanels.length === 0) return;

    setSaving(true);
    const { data, error } = await saveComicPost(user.id, readyPanels, title || 'Untitled Comic', plot, style);
    setSaving(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }
    Alert.alert('Shared!', 'Your comic has been posted.', [
      { text: 'View', onPress: () => router.push(`/(screens)/post/${data!.id}`) },
      { text: 'Done', onPress: () => router.back() },
    ]);
  }, [user, panels, title, plot, style, router]);

  const handleReset = useCallback(() => {
    abortRef.current = true;
    setPhase('setup');
    setPanels([]);
  }, []);

  const completedCount = panels.filter((p) => p.imageUrl).length;

  return (
    <>
      <Stack.Screen options={{ title: 'Comic Generator' }} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {phase === 'setup' && (
            <>
              {/* Header */}
              <LinearGradient
                colors={['#833AB4', '#E1306C', '#F77737']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerBanner}
              >
                <Ionicons name="book-outline" size={32} color="#fff" />
                <Text style={styles.headerTitle}>Comic Generator</Text>
                <Text style={styles.headerSubtitle}>Turn your story into AI-generated panels</Text>
              </LinearGradient>

              {/* Title */}
              <Text style={styles.label}>Comic Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. The Last Signal"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />

              {/* Plot */}
              <Text style={styles.label}>Story / Plot *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your story. Each sentence becomes a panel. e.g. A lone astronaut drifts through space. She discovers an ancient alien signal. The signal leads her to a hidden planet. She makes first contact."
                placeholderTextColor={colors.textSecondary}
                value={plot}
                onChangeText={setPlot}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={800}
              />
              <Text style={styles.charCount}>{plot.length}/800</Text>

              {/* Characters */}
              <Text style={styles.label}>Main Character(s) <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. a female astronaut in a white suit"
                placeholderTextColor={colors.textSecondary}
                value={characters}
                onChangeText={setCharacters}
              />

              {/* Panel count */}
              <Text style={styles.label}>Number of Panels</Text>
              <View style={styles.chipRow}>
                {PANEL_COUNTS.map((n) => (
                  <Pressable
                    key={n}
                    style={[styles.chip, panelCount === n && styles.chipActive]}
                    onPress={() => setPanelCount(n)}
                  >
                    <Text style={[styles.chipText, panelCount === n && styles.chipTextActive]}>{n}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Style */}
              <Text style={styles.label}>Art Style</Text>
              <View style={styles.styleGrid}>
                {COMIC_STYLES.map((s) => (
                  <Pressable
                    key={s.value}
                    style={[styles.styleChip, style === s.value && styles.styleChipActive]}
                    onPress={() => setStyle(s.value)}
                  >
                    <Text style={[styles.styleChipText, style === s.value && styles.styleChipTextActive]}>
                      {s.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Generate button */}
              <Pressable
                style={[styles.generateBtn, !plot.trim() && styles.generateBtnDisabled]}
                onPress={generateComic}
                disabled={!plot.trim()}
              >
                <LinearGradient
                  colors={['#833AB4', '#E1306C', '#F77737']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.generateBtnGradient}
                >
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.generateBtnText}>Generate {panelCount} Panels</Text>
                </LinearGradient>
              </Pressable>
            </>
          )}

          {(phase === 'generating' || phase === 'preview') && (
            <>
              {/* Progress header */}
              {phase === 'generating' && (
                <View style={styles.progressHeader}>
                  <LoadingSpinner size="small" color={colors.primary} />
                  <Text style={styles.progressText}>
                    Generating panel {completedCount + 1} of {panelCount}...
                  </Text>
                </View>
              )}

              {phase === 'preview' && (
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>{title || 'Untitled Comic'}</Text>
                  <Text style={styles.previewSubtitle}>{completedCount} panels generated</Text>
                </View>
              )}

              {/* Panels grid */}
              <View style={[styles.panelsGrid, panelCount === 2 && styles.panelsGrid2]}>
                {panels.map((panel) => (
                  <View key={panel.id} style={styles.panelContainer}>
                    <View style={styles.panelImageWrap}>
                      {panel.imageUrl ? (
                        <Image source={{ uri: panel.imageUrl }} style={styles.panelImage} contentFit="cover" />
                      ) : panel.generating ? (
                        <View style={styles.panelPlaceholder}>
                          <LoadingSpinner size="small" color={colors.primary} />
                          <Text style={styles.panelGeneratingText}>Generating...</Text>
                        </View>
                      ) : (
                        <View style={[styles.panelPlaceholder, styles.panelError]}>
                          <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
                        </View>
                      )}
                      <View style={styles.panelNumber}>
                        <Text style={styles.panelNumberText}>{panel.panelNumber}</Text>
                      </View>
                    </View>
                    <Text style={styles.panelCaption} numberOfLines={2}>{panel.description}</Text>
                  </View>
                ))}
              </View>

              {/* Actions */}
              {phase === 'preview' && (
                <View style={styles.actionRow}>
                  <Pressable style={styles.resetBtn} onPress={handleReset}>
                    <Ionicons name="refresh" size={18} color={colors.text} />
                    <Text style={styles.resetBtnText}>Remake</Text>
                  </Pressable>
                  <Pressable style={styles.shareBtn} onPress={handleSave} disabled={saving}>
                    {saving ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="share-outline" size={18} color="#fff" />
                        <Text style={styles.shareBtnText}>Share Comic</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              )}
            </>
          )}

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  headerBanner: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: 'rgba(255,255,255,0.8)',
  },
  label: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  optional: {
    fontFamily: typography.regular,
    color: colors.textSecondary,
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
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'right',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  styleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  styleChipActive: {
    borderColor: '#833AB4',
    backgroundColor: 'rgba(131,58,180,0.1)',
  },
  styleChipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  styleChipTextActive: {
    color: '#833AB4',
  },
  generateBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  generateBtnDisabled: {
    opacity: 0.4,
  },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  generateBtnText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  progressText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  previewHeader: {
    padding: spacing.lg,
  },
  previewTitle: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  previewSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  panelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  panelsGrid2: {
    flexDirection: 'column',
  },
  panelContainer: {
    width: '47%',
  },
  panelImageWrap: {
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
    ...shadows.sm,
  },
  panelImage: {
    width: '100%',
    height: '100%',
  },
  panelPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  panelError: {
    backgroundColor: 'rgba(237,73,86,0.08)',
  },
  panelGeneratingText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  panelNumber: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelNumberText: {
    fontSize: fontSize.xs,
    fontFamily: typography.bold,
    color: '#fff',
  },
  panelCaption: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 16,
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
  shareBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  shareBtnText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
});
