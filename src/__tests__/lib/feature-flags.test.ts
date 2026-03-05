import { getFeatureFlags, isFeatureEnabled, FUTURE_FEATURE_KEYS } from '@/lib/feature-flags';

describe('getFeatureFlags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns all flags as false by default', () => {
    const flags = getFeatureFlags();
    for (const key of FUTURE_FEATURE_KEYS) {
      expect(flags[key]).toBe(false);
    }
  });

  it('applies overrides', () => {
    const flags = getFeatureFlags({ live_provenance: true });
    expect(flags.live_provenance).toBe(true);
    expect(flags.transparency_center).toBe(false);
  });

  it('reads env variable overrides', () => {
    process.env.EXPO_PUBLIC_FF_LIVE_PROVENANCE = 'true';
    const flags = getFeatureFlags();
    expect(flags.live_provenance).toBe(true);
  });

  it('env supports multiple truthy values', () => {
    process.env.EXPO_PUBLIC_FF_SPATIAL_GALLERY = '1';
    expect(getFeatureFlags().spatial_gallery).toBe(true);

    process.env.EXPO_PUBLIC_FF_SPATIAL_GALLERY = 'yes';
    expect(getFeatureFlags().spatial_gallery).toBe(true);

    process.env.EXPO_PUBLIC_FF_SPATIAL_GALLERY = 'on';
    expect(getFeatureFlags().spatial_gallery).toBe(true);
  });

  it('env supports falsy values', () => {
    process.env.EXPO_PUBLIC_FF_DIRECTOR_MODE = '0';
    expect(getFeatureFlags().director_mode).toBe(false);

    process.env.EXPO_PUBLIC_FF_DIRECTOR_MODE = 'false';
    expect(getFeatureFlags().director_mode).toBe(false);

    process.env.EXPO_PUBLIC_FF_DIRECTOR_MODE = 'no';
    expect(getFeatureFlags().director_mode).toBe(false);
  });

  it('overrides take precedence over env', () => {
    process.env.EXPO_PUBLIC_FF_COMMERCE_V2 = 'true';
    const flags = getFeatureFlags({ commerce_v2: false });
    expect(flags.commerce_v2).toBe(false);
  });

  it('ignores invalid env values', () => {
    process.env.EXPO_PUBLIC_FF_LIVE_PROVENANCE = 'maybe';
    expect(getFeatureFlags().live_provenance).toBe(false);
  });
});

describe('isFeatureEnabled', () => {
  it('returns false for disabled features', () => {
    expect(isFeatureEnabled('live_provenance')).toBe(false);
  });

  it('returns true when overridden', () => {
    expect(isFeatureEnabled('live_provenance', { live_provenance: true })).toBe(true);
  });
});
