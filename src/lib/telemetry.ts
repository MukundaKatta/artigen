import { Platform } from 'react-native';

export type TelemetryPayload = Record<string, string | number | boolean | null | undefined>;

export const TELEMETRY_EVENTS = {
  future_labs_opened: 'future_labs_opened',
  feature_stub_opened: 'feature_stub_opened',
  feature_stub_cta_clicked: 'feature_stub_cta_clicked',
  future_flag_override_applied: 'future_flag_override_applied',
} as const;

export type TelemetryEventName = (typeof TELEMETRY_EVENTS)[keyof typeof TELEMETRY_EVENTS];

export function trackEvent(event: TelemetryEventName, payload: TelemetryPayload = {}) {
  // Phase 1: local instrumentation hookpoint.
  // In later phases this can be redirected to analytics backend.
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[telemetry]', event, { platform: Platform.OS, ...payload });
  }
}
