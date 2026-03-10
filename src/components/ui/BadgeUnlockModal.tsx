import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
};

type Props = {
  visible: boolean;
  badge: Badge | null;
  onClose: () => void;
};

export function BadgeUnlockModal({ visible, badge, onClose }: Props) {
  if (!badge) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.card}>
          <Animated.View entering={ZoomIn.delay(200).springify().damping(8)} style={styles.iconContainer}>
            <Ionicons
              name={badge.icon as any}
              size={48}
              color={colors.primary}
            />
          </Animated.View>

          <Animated.Text entering={FadeInUp.delay(300).duration(300)} style={styles.title}>
            Badge Unlocked!
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(400).duration(300)} style={styles.badgeName}>
            {badge.name}
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(500).duration(300)} style={styles.description}>
            {badge.description}
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(600).duration(300)} style={styles.category}>
            {badge.category}
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(700).duration(300)}>
            <AnimatedPressable
              style={styles.button}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onClose();
              }}
              scaleValue={0.95}
            >
              <Text style={styles.buttonText}>Got it</Text>
            </AnimatedPressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  badgeName: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  category: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxxl,
    borderRadius: borderRadius.lg,
  },
  buttonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textLight,
  },
});
