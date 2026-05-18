import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  fontSize,
  typography,
  borderRadius,
  stickerColors,
  withOpacity,
} from '@/lib/theme';
import type { StickerType } from '@/services/sticker.service';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: StickerType) => void;
};

const STICKER_OPTIONS: { type: StickerType; icon: string; label: string; color: string }[] = [
  { type: 'poll', icon: 'bar-chart', label: 'Poll', color: stickerColors.poll },
  { type: 'quiz', icon: 'help-circle', label: 'Quiz', color: colors.accent },
  {
    type: 'question',
    icon: 'chatbox-ellipses',
    label: 'Question',
    color: stickerColors.question,
  },
  {
    type: 'emoji_slider',
    icon: 'happy',
    label: 'Emoji Slider',
    color: stickerColors.emojiSlider,
  },
  {
    type: 'countdown',
    icon: 'timer',
    label: 'Countdown',
    color: stickerColors.countdown,
  },
  { type: 'link', icon: 'link', label: 'Link', color: stickerColors.link },
];

export function StickerTray({ visible, onClose, onSelect }: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Sticker</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
          {STICKER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.type}
              style={styles.option}
              onPress={() => {
                onSelect(opt.type);
                onClose();
              }}
            >
              <View style={[styles.iconCircle, { backgroundColor: withOpacity(opt.color, 0.12) }]}>
                <Ionicons name={opt.icon as any} size={28} color={opt.color} />
              </View>
              <Text style={styles.optionLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  option: {
    alignItems: 'center',
    width: 80,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  optionLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
    textAlign: 'center',
  },
});
