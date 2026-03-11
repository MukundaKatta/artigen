/**
 * Production error tracking service.
 *
 * Provides a Sentry-style API backed by the telemetry system.
 * Replace the telemetry calls with a real provider (Sentry, Bugsnag)
 * when ready — the public API stays the same.
 */

import { trackEvent, trackError as telemetryTrackError, TELEMETRY_EVENTS, type TelemetryPayload } from '@/lib/telemetry';
import { logger } from '@/lib/logger';

// ── Breadcrumbs ──────────────────────────────────────────────────

type Breadcrumb = {
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  timestamp: string;
  data?: Record<string, unknown>;
};

const MAX_BREADCRUMBS = 30;
const breadcrumbs: Breadcrumb[] = [];

export function addBreadcrumb(category: string, message: string, level: Breadcrumb['level'] = 'info', data?: Record<string, unknown>) {
  breadcrumbs.push({
    category,
    message,
    level,
    timestamp: new Date().toISOString(),
    data,
  });
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
}

// ── User Context ─────────────────────────────────────────────────

let userContext: { id: string; username?: string } | null = null;

export function setUser(user: { id: string; username?: string } | null) {
  userContext = user;
}

// ── Capture API ──────────────────────────────────────────────────

export function captureException(error: Error, context?: TelemetryPayload) {
  logger.error(`[ErrorTracking] ${error.name}: ${error.message}`);

  telemetryTrackError(error, {
    ...context,
    user_id: userContext?.id ?? undefined,
    breadcrumb_count: breadcrumbs.length,
    last_breadcrumb: breadcrumbs[breadcrumbs.length - 1]?.message ?? '',
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: TelemetryPayload) {
  trackEvent(TELEMETRY_EVENTS.api_error, {
    error_name: level,
    error_message: message.slice(0, 500),
    user_id: userContext?.id ?? undefined,
    ...context,
  });
}

// ── Performance Transactions ─────────────────────────────────────

type Transaction = {
  name: string;
  startTime: number;
  spans: { name: string; startTime: number; endTime?: number }[];
};

const activeTransactions = new Map<string, Transaction>();

export function startTransaction(name: string): string {
  const id = `${name}-${Date.now()}`;
  activeTransactions.set(id, {
    name,
    startTime: Date.now(),
    spans: [],
  });
  return id;
}

export function addSpan(transactionId: string, spanName: string) {
  const tx = activeTransactions.get(transactionId);
  if (!tx) return;
  // Close previous open span
  const lastSpan = tx.spans[tx.spans.length - 1];
  if (lastSpan && !lastSpan.endTime) {
    lastSpan.endTime = Date.now();
  }
  tx.spans.push({ name: spanName, startTime: Date.now() });
}

export function finishTransaction(transactionId: string) {
  const tx = activeTransactions.get(transactionId);
  if (!tx) return;

  const duration = Date.now() - tx.startTime;
  // Close any open span
  const lastSpan = tx.spans[tx.spans.length - 1];
  if (lastSpan && !lastSpan.endTime) {
    lastSpan.endTime = Date.now();
  }

  trackEvent(TELEMETRY_EVENTS.feed_load_time, {
    metric_name: `transaction.${tx.name}`,
    duration_ms: duration,
    span_count: tx.spans.length,
    user_id: userContext?.id ?? undefined,
  });

  activeTransactions.delete(transactionId);
}

// ── Global Error Handler ─────────────────────────────────────────

export function initErrorTracking() {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    captureException(error, { is_fatal: isFatal ?? false });
    originalHandler(error, isFatal);
  });
}
