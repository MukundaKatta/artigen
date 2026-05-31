/**
 * Tests for useHaptics — the thin Platform-aware wrapper around the
 * expo-haptics API. Verifies that:
 *   - on web, every returned function is a no-op (no native call)
 *   - on native, each function dispatches the matching expo-haptics call
 *     with the correct feedback style/type.
 */
import { Platform } from 'react-native';
import { useHaptics } from '@/hooks/useHaptics';
import {
  impactAsync,
  selectionAsync,
  notificationAsync,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from 'expo-haptics';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useHaptics on web', () => {
  beforeEach(() => {
    Platform.OS = 'web';
  });

  it('returns no-op functions', () => {
    const h = useHaptics();
    h.light();
    h.medium();
    h.heavy();
    h.selection();
    h.success();
    h.error();

    // Nothing native dispatched
    expect(impactAsync).not.toHaveBeenCalled();
    expect(selectionAsync).not.toHaveBeenCalled();
    expect(notificationAsync).not.toHaveBeenCalled();
  });
});

describe('useHaptics on native (ios)', () => {
  beforeEach(() => {
    Platform.OS = 'ios';
  });

  it('light → impactAsync(Light)', () => {
    useHaptics().light();
    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Light);
  });

  it('medium → impactAsync(Medium)', () => {
    useHaptics().medium();
    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Medium);
  });

  it('heavy → impactAsync(Heavy)', () => {
    useHaptics().heavy();
    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Heavy);
  });

  it('selection → selectionAsync()', () => {
    useHaptics().selection();
    expect(selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('success → notificationAsync(Success)', () => {
    useHaptics().success();
    expect(notificationAsync).toHaveBeenCalledWith(NotificationFeedbackType.Success);
  });

  it('error → notificationAsync(Error)', () => {
    useHaptics().error();
    expect(notificationAsync).toHaveBeenCalledWith(NotificationFeedbackType.Error);
  });
});
