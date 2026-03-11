import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generateCaption, CAPTION_TONES, TONE_LABELS } from '@/services/caption.service';
import type { CaptionTone } from '@/services/caption.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onUse: (caption: string) => void;
  imageUri: string;
};

export function CaptionGenerator({ visible, onClose, onUse, imageUri }: Props) {
  const [selectedTone, setSelectedTone] = useState<CaptionTone>('casual');
  const [caption, setCaption] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    try {
      setGenerating(true);
      const { data } = await generateCaption(imageUri, selectedTone);
      setCaption(data);
    } catch (error) {
      console.error('Failed to generate caption:', error);
    } finally {
      setGenerating(false);
    }
  }

  function handleUse() {
    if (caption) {
      onUse(caption);
      onClose();
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Caption</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Select tone</Text>
        <View style={styles.tones}>
          {CAPTION_TONES.map((tone) => (
            <TouchableOpacity
              key={tone}
              style={[styles.toneChip, selectedTone === tone && styles.toneSelected]}
              onPress={() => setSelectedTone(tone)}
            >
              <Text style={[styles.toneText, selectedTone === tone && styles.toneTextSelected]}>
                {TONE_LABELS[tone]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate} disabled={generating}>
          {generating ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color={colors.textLight} />
              <Text style={styles.generateText}>{caption ? 'Regenerate' : 'Generate Caption'}</Text>
            </>
          )}
        </TouchableOpacity>

        {caption && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultCaption}>{caption}</Text>
            <TouchableOpacity style={styles.useButton} onPress={handleUse}>
              <Text style={styles.useText}>Use this caption</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  tones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  toneChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toneSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toneText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  toneTextSelected: {
    color: colors.textLight,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  generateText: {
    color: colors.textLight,
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  resultCaption: {
    fontSize: fontSize.lg,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  useButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  useText: {
    color: colors.textLight,
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
});
