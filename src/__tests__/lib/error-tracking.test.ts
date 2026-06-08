/**
 * error-tracking keeps module-level singleton state (a breadcrumb ring buffer,
 * the current user context, and a map of in-flight transactions). Each test
 * loads a fresh copy via `jest.isolateModules` and spies on the underlying
 * telemetry module so we can assert what gets reported without bleed between
 * tests.
 *
 * `initErrorTracking` is intentionally not exercised here because it depends on
 * React Native's global `ErrorUtils`, which doesn't exist in the node test env.
 */

type ErrorTrackingModule = typeof import('@/lib/error-tracking');
type TelemetryModule = typeof import('@/lib/telemetry');

function loadErrorTracking() {
  let mod!: ErrorTrackingModule;
  let trackEvent!: jest.SpyInstance;
  let trackError!: jest.SpyInstance;
  jest.isolateModules(() => {
    const telemetry = require('@/lib/telemetry') as TelemetryModule;
    trackEvent = jest.spyOn(telemetry, 'trackEvent').mockImplementation(() => {});
    trackError = jest.spyOn(telemetry, 'trackError').mockImplementation(() => {});
    mod = require('@/lib/error-tracking') as ErrorTrackingModule;
  });
  return { mod, trackEvent, trackError };
}

describe('error-tracking', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('captureException', () => {
    it('forwards the error to telemetry with breadcrumb metadata', () => {
      const { mod, trackError } = loadErrorTracking();
      mod.addBreadcrumb('nav', 'opened feed');
      const error = new Error('boom');
      mod.captureException(error, { route: 'feed' });

      expect(trackError).toHaveBeenCalledTimes(1);
      const [reportedError, context] = trackError.mock.calls[0];
      expect(reportedError).toBe(error);
      expect(context).toEqual(
        expect.objectContaining({
          route: 'feed',
          breadcrumb_count: 1,
          last_breadcrumb: 'opened feed',
        }),
      );
    });

    it('includes the current user id when a user is set', () => {
      const { mod, trackError } = loadErrorTracking();
      mod.setUser({ id: 'user-42', username: 'ada' });
      mod.captureException(new Error('nope'));
      expect(trackError.mock.calls[0][1]).toEqual(expect.objectContaining({ user_id: 'user-42' }));
    });

    it('reports no user id after the user is cleared', () => {
      const { mod, trackError } = loadErrorTracking();
      mod.setUser({ id: 'user-42' });
      mod.setUser(null);
      mod.captureException(new Error('nope'));
      expect(trackError.mock.calls[0][1].user_id).toBeUndefined();
    });
  });

  describe('addBreadcrumb', () => {
    it('caps the breadcrumb buffer at 30 entries (oldest dropped first)', () => {
      const { mod, trackError } = loadErrorTracking();
      for (let i = 0; i < 35; i++) {
        mod.addBreadcrumb('test', `crumb-${i}`);
      }
      mod.captureException(new Error('x'));
      const context = trackError.mock.calls[0][1];
      // Buffer is bounded at 30...
      expect(context.breadcrumb_count).toBe(30);
      // ...and the most recent crumb is preserved.
      expect(context.last_breadcrumb).toBe('crumb-34');
    });
  });

  describe('captureMessage', () => {
    it('records an api_error telemetry event with the message and level', () => {
      const { mod, trackEvent } = loadErrorTracking();
      mod.captureMessage('something odd', 'warning', { area: 'upload' });
      expect(trackEvent).toHaveBeenCalledTimes(1);
      const [, payload] = trackEvent.mock.calls[0];
      expect(payload).toEqual(
        expect.objectContaining({
          error_name: 'warning',
          error_message: 'something odd',
          area: 'upload',
        }),
      );
    });

    it('truncates very long messages to 500 characters', () => {
      const { mod, trackEvent } = loadErrorTracking();
      mod.captureMessage('y'.repeat(900));
      expect(trackEvent.mock.calls[0][1].error_message).toHaveLength(500);
    });

    it('defaults the level to "info"', () => {
      const { mod, trackEvent } = loadErrorTracking();
      mod.captureMessage('hello');
      expect(trackEvent.mock.calls[0][1].error_name).toBe('info');
    });
  });

  describe('transactions', () => {
    it('emits a performance event with span count when finished', () => {
      const { mod, trackEvent } = loadErrorTracking();
      const id = mod.startTransaction('feed-load');
      mod.addSpan(id, 'fetch');
      mod.addSpan(id, 'render');
      mod.finishTransaction(id);

      expect(trackEvent).toHaveBeenCalledTimes(1);
      const [, payload] = trackEvent.mock.calls[0];
      expect(payload).toEqual(
        expect.objectContaining({
          metric_name: 'transaction.feed-load',
          span_count: 2,
          duration_ms: expect.any(Number),
        }),
      );
    });

    it('returns a unique id per transaction', () => {
      const { mod } = loadErrorTracking();
      const a = mod.startTransaction('a');
      const b = mod.startTransaction('b');
      expect(a).not.toBe(b);
      expect(a).toContain('a-');
      expect(b).toContain('b-');
    });

    it('ignores spans/finish for an unknown transaction id (no throw, no event)', () => {
      const { mod, trackEvent } = loadErrorTracking();
      expect(() => mod.addSpan('does-not-exist', 'span')).not.toThrow();
      expect(() => mod.finishTransaction('does-not-exist')).not.toThrow();
      expect(trackEvent).not.toHaveBeenCalled();
    });

    it('does not double-report when finishing the same transaction twice', () => {
      const { mod, trackEvent } = loadErrorTracking();
      const id = mod.startTransaction('once');
      mod.finishTransaction(id);
      mod.finishTransaction(id); // already deleted -> no-op
      expect(trackEvent).toHaveBeenCalledTimes(1);
    });
  });
});
