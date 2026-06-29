/**
 * Convenience wrapper around `showToast`. Lets callers write
 *   toast.success("Saved")
 * instead of
 *   showToast({ type: 'success', message: 'Saved' })
 *
 * Supports inline actions and per-call duration overrides.
 */
import { showToast } from '@/components/ui/Toast';

type Action = { label: string; onPress: () => void };
type Opts = { duration?: number; action?: Action };

function make(type: 'success' | 'error' | 'info' | 'warning') {
  return (message: string, opts: Opts = {}) => showToast({ message, type, ...opts });
}

export const toast = {
  success: make('success'),
  error: make('error'),
  info: make('info'),
  warning: make('warning'),
  /** Lower-level escape hatch. */
  show: showToast,
};
