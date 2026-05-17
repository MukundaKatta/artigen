/**
 * Tests for src/utils/alert.ts. Verifies the platform-split behavior
 * (web uses window.alert/confirm; native uses RN Alert). The RN mock at
 * src/__mocks__/react-native.ts doesn't expose Alert by default — we mock
 * it inline per test for the native path.
 */

import { Platform } from 'react-native';
import { showAlert, showConfirm } from '@/utils/alert';

beforeEach(() => {
  jest.clearAllMocks();
  // node test env doesn't have a window; assign a stub so the web path runs
  (globalThis as { window?: { alert: jest.Mock; confirm: jest.Mock } }).window = {
    alert: jest.fn(),
    confirm: jest.fn(),
  };
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe('showAlert', () => {
  it('on web calls window.alert and onDismiss', () => {
    Platform.OS = 'web';
    const onDismiss = jest.fn();

    showAlert('Title', 'Message', onDismiss);

    expect(window.alert).toHaveBeenCalledWith('Title\nMessage');
    expect(onDismiss).toHaveBeenCalled();
  });

  it('on web omits message when not provided', () => {
    Platform.OS = 'web';

    showAlert('Title only');

    expect(window.alert).toHaveBeenCalledWith('Title only');
  });
});

describe('showConfirm', () => {
  it('on web invokes onConfirm when user confirms', () => {
    Platform.OS = 'web';
    (window.confirm as jest.Mock).mockReturnValue(true);
    const onConfirm = jest.fn();

    showConfirm('Delete?', 'This is permanent', onConfirm);

    expect(window.confirm).toHaveBeenCalledWith('Delete?\nThis is permanent');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('on web does not invoke onConfirm when user cancels', () => {
    Platform.OS = 'web';
    (window.confirm as jest.Mock).mockReturnValue(false);
    const onConfirm = jest.fn();

    showConfirm('Delete?', 'This is permanent', onConfirm);

    expect(onConfirm).not.toHaveBeenCalled();
  });
});
