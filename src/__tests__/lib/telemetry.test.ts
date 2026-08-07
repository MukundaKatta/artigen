/**
 * Telemetry uses module-level singleton state (an event queue + a flush timer),
 * so each test loads a *fresh* copy of the module via `jest.isolateModules`.
 * That gives every test an empty queue and its own timer, avoiding cross-test
 * bleed from the batched-upload behaviour.
 */

type TelemetryModule = typeof import('@/lib/telemetry');
type SupabaseModule = typeof import('@/lib/supabase');

/**
 * Load a fresh telemetry module with `supabase.from(...).insert` wired to a
 * spy, so each test can inspect (or fail) the upload independently.
 */
function loadTelemetry(insertImpl?: (rows: unknown) => unknown) {
  let mod!: TelemetryModule;
  const insert = jest.fn((rows: unknown) =>
    Promise.resolve(insertImpl ? insertImpl(rows) : { data: null, error: null }),
  );
  jest.isolateModules(() => {
    const supabaseMod = require('@/lib/supabase') as SupabaseModule;
    (supabaseMod.supabase.from as jest.Mock).mockReturnValue({ insert });
    mod = require('@/lib/telemetry') as TelemetryModule;
  });
  return { mod, insert };
}

describe('telemetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('exposes a stable, deduplicated set of event names', () => {
    const { mod } = loadTelemetry();
    const names = Object.values(mod.TELEMETRY_EVENTS);
    // The map is `{ x: 'x' }` shaped: keys and values must line up.
    for (const [key, value] of Object.entries(mod.TELEMETRY_EVENTS)) {
      expect(value).toBe(key);
    }
    // No duplicate event names.
    expect(new Set(names).size).toBe(names.length);
  });

  it('does not upload until the batch size (10) is reached', () => {
    const { mod, insert } = loadTelemetry();
    for (let i = 0; i < 9; i++) {
      mod.trackEvent(mod.TELEMETRY_EVENTS.post_liked, { i });
    }
    expect(insert).not.toHaveBeenCalled();
  });

  it('auto-flushes once a full batch of 10 events accumulates', () => {
    const { mod, insert } = loadTelemetry();
    for (let i = 0; i < 10; i++) {
      mod.trackEvent(mod.TELEMETRY_EVENTS.post_liked, { i });
    }
    expect(insert).toHaveBeenCalledTimes(1);
    const rows = insert.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(rows).toHaveLength(10);
    // Each row carries the canonical column shape used by the analytics table.
    expect(rows[0]).toEqual(
      expect.objectContaining({
        event_name: mod.TELEMETRY_EVENTS.post_liked,
        platform: expect.any(String),
      }),
    );
  });

  it('enriches every event payload with the platform', async () => {
    const { mod, insert } = loadTelemetry();
    mod.trackEvent(mod.TELEMETRY_EVENTS.screen_view, { screen_name: 'Feed' });
    await mod.flushTelemetry();
    const rows = insert.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(rows[0].properties).toEqual(
      expect.objectContaining({ screen_name: 'Feed', platform: expect.any(String) }),
    );
  });

  it('flushTelemetry is a no-op (no insert) when nothing is queued', async () => {
    const { mod, insert } = loadTelemetry();
    await mod.flushTelemetry();
    expect(insert).not.toHaveBeenCalled();
  });

  it('flushTelemetry uploads queued events on demand', async () => {
    const { mod, insert } = loadTelemetry();
    mod.trackEvent(mod.TELEMETRY_EVENTS.tip_sent, { amount: 5 });
    expect(insert).not.toHaveBeenCalled();
    await mod.flushTelemetry();
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('re-queues events when the upload fails so they are retried', async () => {
    // First upload rejects; the batch should be put back and uploaded next time.
    let call = 0;
    const { mod, insert } = loadTelemetry(() => {
      call += 1;
      if (call === 1) throw new Error('network down');
      return { data: null, error: null };
    });

    mod.trackEvent(mod.TELEMETRY_EVENTS.purchase_completed, { sku: 'credits_100' });
    await mod.flushTelemetry(); // fails -> re-queues
    await mod.flushTelemetry(); // succeeds

    expect(insert).toHaveBeenCalledTimes(2);
    const retriedRows = insert.mock.calls[1][0] as Array<Record<string, unknown>>;
    expect(retriedRows).toHaveLength(1);
    expect(retriedRows[0].event_name).toBe(mod.TELEMETRY_EVENTS.purchase_completed);
  });

  it('trackScreenView records a screen_view event with the screen name', async () => {
    const { mod, insert } = loadTelemetry();
    mod.trackScreenView('Profile', { tab: 'posts' });
    await mod.flushTelemetry();
    const rows = insert.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(rows[0].event_name).toBe(mod.TELEMETRY_EVENTS.screen_view);
    expect(rows[0].properties).toEqual(
      expect.objectContaining({ screen_name: 'Profile', tab: 'posts' }),
    );
  });

  it('trackError truncates long messages to 500 chars and keeps the error name', async () => {
    const { mod, insert } = loadTelemetry();
    const longMessage = 'x'.repeat(1000);
    mod.trackError(new TypeError(longMessage));
    await mod.flushTelemetry();
    const props = (insert.mock.calls[0][0] as Array<Record<string, any>>)[0].properties;
    expect(props.error_name).toBe('TypeError');
    expect(props.error_message).toHaveLength(500);
  });

  it('trackPerformance records a duration metric', async () => {
    const { mod, insert } = loadTelemetry();
    mod.trackPerformance('feed_render', 123);
    await mod.flushTelemetry();
    const props = (insert.mock.calls[0][0] as Array<Record<string, any>>)[0].properties;
    expect(props.metric_name).toBe('feed_render');
    expect(props.duration_ms).toBe(123);
  });

  it('flushes on the periodic timer interval', () => {
    const { mod, insert } = loadTelemetry();
    mod.trackEvent(mod.TELEMETRY_EVENTS.app_launch);
    expect(insert).not.toHaveBeenCalled();
    // Advance past the 30s flush interval.
    jest.advanceTimersByTime(30_000);
    expect(insert).toHaveBeenCalledTimes(1);
  });
});
