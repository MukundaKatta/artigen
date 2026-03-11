import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

export type TelemetryPayload = Record<string, string | number | boolean | null | undefined>;

export const TELEMETRY_EVENTS = {
  // Navigation & Discovery
  screen_view: 'screen_view',
  tab_switch: 'tab_switch',
  deep_link_opened: 'deep_link_opened',

  // Content Creation
  generation_started: 'generation_started',
  generation_completed: 'generation_completed',
  generation_failed: 'generation_failed',
  post_created: 'post_created',
  post_deleted: 'post_deleted',

  // Social Engagement
  post_liked: 'post_liked',
  post_saved: 'post_saved',
  post_shared: 'post_shared',
  comment_created: 'comment_created',
  user_followed: 'user_followed',

  // Monetization
  purchase_started: 'purchase_started',
  purchase_completed: 'purchase_completed',
  tip_sent: 'tip_sent',
  subscription_started: 'subscription_started',

  // Performance
  app_launch: 'app_launch',
  feed_load_time: 'feed_load_time',
  image_load_time: 'image_load_time',
  api_error: 'api_error',

  // Feature Flags & Experiments
  future_labs_opened: 'future_labs_opened',
  feature_stub_opened: 'feature_stub_opened',
  feature_stub_cta_clicked: 'feature_stub_cta_clicked',
  future_flag_override_applied: 'future_flag_override_applied',

  // Onboarding
  onboarding_started: 'onboarding_started',
  onboarding_step_completed: 'onboarding_step_completed',
  onboarding_completed: 'onboarding_completed',
  onboarding_skipped: 'onboarding_skipped',

  // Errors
  error_boundary_triggered: 'error_boundary_triggered',
  rate_limit_hit: 'rate_limit_hit',
} as const;

export type TelemetryEventName = (typeof TELEMETRY_EVENTS)[keyof typeof TELEMETRY_EVENTS];

// ── Event Queue (batched upload) ─────────────────────────────────

type QueuedEvent = {
  event: TelemetryEventName;
  payload: TelemetryPayload;
  timestamp: string;
  platform: string;
};

const eventQueue: QueuedEvent[] = [];
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 30_000; // 30 seconds
let flushTimer: ReturnType<typeof setInterval> | null = null;

function startFlushTimer() {
  if (flushTimer) return;
  flushTimer = setInterval(flushEvents, FLUSH_INTERVAL_MS);
}

async function flushEvents() {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, BATCH_SIZE);

  try {
    await supabase.from('analytics_events').insert(
      batch.map((e) => ({
        event_name: e.event,
        properties: e.payload,
        platform: e.platform,
        created_at: e.timestamp,
      })),
    );
  } catch {
    // Re-queue failed events (up to a limit)
    if (eventQueue.length < 100) {
      eventQueue.unshift(...batch);
    }
  }
}

// ── Public API ───────────────────────────────────────────────────

export function trackEvent(event: TelemetryEventName, payload: TelemetryPayload = {}) {
  const enrichedPayload: TelemetryPayload = {
    ...payload,
    platform: Platform.OS,
  };

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[telemetry]', event, enrichedPayload);
  }

  // Queue for batch upload
  eventQueue.push({
    event,
    payload: enrichedPayload,
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
  });

  // Auto-flush when batch is full
  if (eventQueue.length >= BATCH_SIZE) {
    flushEvents();
  }

  startFlushTimer();
}

/**
 * Track screen views for navigation analytics.
 */
export function trackScreenView(screenName: string, params?: TelemetryPayload) {
  trackEvent(TELEMETRY_EVENTS.screen_view, {
    screen_name: screenName,
    ...params,
  });
}

/**
 * Track errors for monitoring and alerting.
 */
export function trackError(error: Error, context?: TelemetryPayload) {
  trackEvent(TELEMETRY_EVENTS.api_error, {
    error_name: error.name,
    error_message: error.message.slice(0, 500),
    ...context,
  });
}

/**
 * Track performance metrics.
 */
export function trackPerformance(metric: string, durationMs: number, context?: TelemetryPayload) {
  trackEvent(TELEMETRY_EVENTS.feed_load_time, {
    metric_name: metric,
    duration_ms: durationMs,
    ...context,
  });
}

/**
 * Flush all queued events immediately (call before app backgrounding).
 */
export async function flushTelemetry() {
  await flushEvents();
}
