import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { REACTION_EMOJIS, REACTION_TYPES } from '@/services/post-reaction.service';
import { colors, spacing, borderRadius, shadows } from '@/lib/theme';
import type { ReactionType } from '@/types';
import { useEffect } from 'react';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: ReactionType) => void;
  currentReaction?: ReactionType | null;
};

function AnimatedEmoji({ emoji, index, onPress, isSelected }: {
  emoji: string;
  index: number;
  onPress: () => void;
  isSelected: boolean;
}) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 40, withSpring(1, { damping: 8, stiffness: 200 }));
  }, [index, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.emojiButton, isSelected && styles.emojiSelected]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ReactionPicker({ visible, onClose, onSelect, currentReaction }: Props) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          {REACTION_TYPES.map((type, index) => (
            <AnimatedEmoji
              key={type}
              emoji={REACTION_EMOJIS[type]}
              index={index}
              isSelected={currentReaction === type}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(type);
                onClose();
              }}
            />
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    ...shadows.lg,
  },
  emojiButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiSelected: {
    backgroundColor: colors.backgroundSecondary,
  },
  emoji: {
    fontSize: 28,
  },
});
