import { Platform } from 'react-native';
import {
  impactAsync,
  selectionAsync,
  notificationAsync,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from 'expo-haptics';

const noop = () => {};

export function useHaptics() {
  if (Platform.OS === 'web') {
    return { light: noop, medium: noop, heavy: noop, selection: noop, success: noop, error: noop };
  }

  return {
    light: () => impactAsync(ImpactFeedbackStyle.Light),
    medium: () => impactAsync(ImpactFeedbackStyle.Medium),
    heavy: () => impactAsync(ImpactFeedbackStyle.Heavy),
    selection: () => selectionAsync(),
    success: () => notificationAsync(NotificationFeedbackType.Success),
    error: () => notificationAsync(NotificationFeedbackType.Error),
  };
}
