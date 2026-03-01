import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVoicePlayer } from '@/hooks/useVoicePlayer';
import { parseVoiceDuration, formatDuration } from '@/services/voice.service';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';

type Props = {
  mediaUrl: string;
  content: string | null;
  isMine: boolean;
};

const BAR_COUNT = 20;

export function VoiceMessageBubble({ mediaUrl, content, isMine }: Props) {
  const { playing, progress, speed, togglePlay, cycleSpeed } = useVoicePlayer();
  const durationMs = parseVoiceDuration(content);

  const barHeights = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => 8 + Math.sin(i * 0.8) * 8 + Math.random() * 4),
    []
  );

  return (
    <View style={[styles.container, isMine ? styles.containerMine : styles.containerTheirs]}>
      <TouchableOpacity onPress={() => togglePlay(mediaUrl)} style={styles.playButton}>
        <Ionicons
          name={playing ? 'pause' : 'play'}
          size={22}
          color={isMine ? colors.textLight : colors.text}
        />
      </TouchableOpacity>

      <View style={styles.waveform}>
        {barHeights.map((barHeight, i) => {
          const isPlayed = progress > 0 && i / BAR_COUNT <= progress;
          return (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: barHeight,
                  backgroundColor: isPlayed
                    ? (isMine ? 'rgba(255,255,255,0.9)' : colors.primary)
                    : (isMine ? 'rgba(255,255,255,0.4)' : colors.border),
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.meta}>
        <Text style={[styles.duration, isMine && styles.textMine]}>
          {formatDuration(durationMs)}
        </Text>
        <TouchableOpacity onPress={cycleSpeed}>
          <Text style={[styles.speed, isMine && styles.textMine]}>
            {speed}x
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  containerMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    ...shadows.sm,
  },
  containerTheirs: {
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: 4,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 24,
    gap: 1.5,
  },
  bar: {
    width: 2.5,
    borderRadius: 1,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  duration: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  speed: {
    fontSize: 10,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  textMine: {
    color: 'rgba(255,255,255,0.7)',
  },
});
