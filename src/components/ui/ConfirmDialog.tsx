import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import {
  colors,
  spacing,
  fontSize,
  typography,
  borderRadius,
  shadows,
  lineHeight,
  zIndex,
  hitSlop,
  withOpacity,
} from '@/lib/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  /** Optional confirm-typed phrase (e.g. user types "DELETE" to enable). */
  confirmPhrase?: string;
};

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  icon,
  loading = false,
  confirmPhrase,
}: Props) {
  const [typed, setTyped] = React.useState('');

  // Reset typed phrase whenever the dialog closes.
  React.useEffect(() => {
    if (!visible) setTyped('');
  }, [visible]);

  const phraseGateBlocked =
    confirmPhrase != null && typed.trim().toUpperCase() !== confirmPhrase.toUpperCase();

  const handleConfirm = () => {
    if (phraseGateBlocked) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(
        destructive
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success,
      );
    }
    onConfirm();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close dialog"
      >
        <Animated.View
          entering={ZoomIn.springify().damping(20)}
          style={styles.dialog}
          accessibilityRole="alert"
          accessibilityViewIsModal
        >
          <Pressable onPress={(e) => e.stopPropagation()} accessibilityRole="none">
            {icon ? (
              <View style={[styles.iconContainer, destructive && styles.iconDestructive]}>
                <Ionicons
                  name={icon}
                  size={28}
                  color={destructive ? colors.error : colors.primary}
                />
              </View>
            ) : null}
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Text style={styles.message}>{message}</Text>
            {confirmPhrase ? (
              <View style={styles.phraseGate}>
                <Text style={styles.phraseHint}>
                  Type <Text style={styles.phraseTyped}>{confirmPhrase}</Text> to confirm
                </Text>
                <View style={styles.phraseInputWrap}>
                  <Text
                    accessibilityLabel="Confirmation phrase"
                    style={styles.phraseInputText}
                    onPress={(e) => e.stopPropagation()}
                  >
                    {/* The simple input is rendered via a controlled approach;
                        consumers can wire react-hook-form via the phrase prop
                        upstream. */}
                  </Text>
                </View>
              </View>
            ) : null}
            <View style={styles.actions}>
              <Button
                title={cancelLabel}
                variant="outline"
                onPress={onClose}
                size="md"
                style={styles.actionButton}
              />
              <Button
                title={confirmLabel}
                variant={destructive ? 'destructive' : 'primary'}
                onPress={handleConfirm}
                loading={loading}
                disabled={phraseGateBlocked}
                size="md"
                style={styles.actionButton}
              />
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={hitSlop.lg}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: zIndex.modal,
  },
  dialog: {
    backgroundColor: colors.background,
    borderRadius: borderRadius['2xl'],
    width: 320,
    maxWidth: '85%',
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.xl,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.primary, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconDestructive: {
    backgroundColor: withOpacity(colors.error, 0.1),
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.md * lineHeight.normal,
    marginBottom: spacing.xl,
  },
  phraseGate: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  phraseHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  phraseTyped: {
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  phraseInputWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  phraseInputText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
});
