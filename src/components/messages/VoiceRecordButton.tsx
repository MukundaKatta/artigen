import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '@/services/voice.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  recording: boolean;
  duration: number;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
};

export function VoiceRecordButton({ recording, duration, onStart, onStop, onCancel }: Props) {
  if (recording) {
    return (
      <View style={styles.recordingBar}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={20} color={colors.error} />
        </TouchableOpacity>
        <View style={styles.recordingIndicator}>
          <View style={styles.redDot} />
          <Text style={styles.durationText}>{formatDuration(duration)}</Text>
        </View>
        <TouchableOpacity onPress={onStop} style={styles.sendButton}>
          <Ionicons name="send" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onStart} hitSlop={8}>
      <Ionicons name="mic-outline" size={24} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  cancelButton: {
    padding: spacing.xs,
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  durationText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
