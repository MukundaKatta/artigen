import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  audioUrl: string;
  title?: string;
};

export function MusicPlayer({ audioUrl, title }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = useCallback(() => {
    // Audio playback would be handled by expo-av in production
    setIsPlaying((prev) => !prev);
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={togglePlay}
        style={styles.playButton}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause music' : 'Play music'}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={20}
          color={colors.textLight}
        />
      </TouchableOpacity>
      <View style={styles.info}>
        {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
      <Text style={styles.duration}>0:30</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  duration: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
});
