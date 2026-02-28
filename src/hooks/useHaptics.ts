import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const noop = () => {};

export function useHaptics() {
  if (Platform.OS === 'web') {
    return { light: noop, medium: noop, heavy: noop, selection: noop, success: noop, error: noop };
  }

  return {
    light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
    selection: () => Haptics.selectionAsync(),
    success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  };
}
