import React, { useEffect, useCallback } from 'react';
import { Text, StyleSheet, Platform, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  notificationAsync,
  impactAsync,
  NotificationFeedbackType,
  ImpactFeedbackStyle,
} from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  spacing,
  fontSize,
  typography,
  shadows,
  borderRadius,
  lineHeight,
  zIndex,
  hitSlop,
  feedback,
} from '@/lib/theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastAction = {
  label: string;
  onPress: () => void;
};

type ToastConfig = {
  message: string;
  type?: ToastType;
  duration?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: ToastAction;
};

type ToastState = ToastConfig & { id: number };

const TOAST_ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
  warning: 'warning',
};

const TOAST_COLORS: Record<ToastType, string> = {
  success: colors.success,
  error: colors.error,
  info: colors.primary,
  warning: colors.warning,
};

const TOAST_BG: Record<ToastType, string> = {
  success: feedback.success.bg,
  error: feedback.error.bg,
  info: feedback.info.bg,
  warning: feedback.warning.bg,
};

// ── Global toast emitter ────────────────────────────

let toastListener: ((toast: ToastState) => void) | null = null;
let toastId = 0;

export function showToast(config: ToastConfig) {
  toastId += 1;
  toastListener?.({ ...config, id: toastId });
}

// ── Toast component ─────────────────────────────────

// Explicit (currently empty) props contract — #218.
export type ToastContainerProps = Record<string, never>;

export function ToastContainer(_: ToastContainerProps = {}) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = React.useState<ToastState | null>(null);

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const dismiss = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    toastListener = (newToast) => {
      setToast(newToast);

      // Haptic feedback
      if (Platform.OS !== 'web') {
        if (newToast.type === 'error') {
          notificationAsync(NotificationFeedbackType.Error);
        } else if (newToast.type === 'success') {
          notificationAsync(NotificationFeedbackType.Success);
        } else {
          impactAsync(ImpactFeedbackStyle.Light);
        }
      }

      // Animate in
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });

      // Auto-dismiss
      const duration = newToast.duration ?? 3000;
      opacity.value = withDelay(duration, withTiming(0, { duration: 250 }));
      translateY.value = withDelay(duration, withTiming(-100, { duration: 250 }));
      scale.value = withDelay(
        duration,
        withTiming(0.9, { duration: 250 }, () => {
          runOnJS(dismiss)();
        }),
      );
    };

    return () => {
      toastListener = null;
    };
  }, [translateY, opacity, scale, dismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!toast) return null;

  const type = toast.type ?? 'info';
  const icon = toast.icon ?? TOAST_ICONS[type];
  const tintColor = TOAST_COLORS[type];

  return (
    <Animated.View
      style={[styles.container, { top: insets.top + spacing.sm }, animatedStyle]}
      pointerEvents="box-none"
      accessibilityRole={type === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion={type === 'error' ? 'assertive' : 'polite'}
      accessibilityLabel={`${type}: ${toast.message}`}
    >
      <Animated.View style={[styles.toast, shadows.lg]}>
        <View style={[styles.iconWrap, { backgroundColor: TOAST_BG[type] }]}>
          <Ionicons name={icon} size={20} color={tintColor} />
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
        {toast.action ? (
          <Pressable
            onPress={toast.action.onPress}
            hitSlop={hitSlop.md}
            accessibilityRole="button"
            accessibilityLabel={toast.action.label}
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          >
            <Text style={[styles.actionText, { color: tintColor }]}>{toast.action.label}</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={dismiss}
          hitSlop={hitSlop.md}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        >
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: zIndex.toast,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    maxWidth: 400,
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  action: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
  },
});
