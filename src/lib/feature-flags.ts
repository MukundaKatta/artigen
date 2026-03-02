export const FUTURE_FEATURE_KEYS = [
  'live_provenance',
  'transparency_center',
  'localization_studio',
  'spatial_gallery',
  'director_mode',
  'commerce_v2',
] as const;

export type FutureFeatureKey = (typeof FUTURE_FEATURE_KEYS)[number];
export type FeatureFlagMap = Record<FutureFeatureKey, boolean>;

const DEFAULT_FLAGS: FeatureFlagMap = {
  live_provenance: false,
  transparency_center: false,
  localization_studio: false,
  spatial_gallery: false,
  director_mode: false,
  commerce_v2: false,
};

function parseBool(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on') return true;
  if (normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'off') return false;
  return undefined;
}

function envOverride(key: FutureFeatureKey): boolean | undefined {
  // Example: EXPO_PUBLIC_FF_LIVE_PROVENANCE=true
  const envKey = `EXPO_PUBLIC_FF_${key.toUpperCase()}`;
  return parseBool(process.env[envKey]);
}

export function getFeatureFlags(overrides?: Partial<FeatureFlagMap>): FeatureFlagMap {
  const flags: FeatureFlagMap = { ...DEFAULT_FLAGS };

  for (const key of FUTURE_FEATURE_KEYS) {
    const envValue = envOverride(key);
    if (envValue !== undefined) flags[key] = envValue;
  }

  if (overrides) {
    for (const key of FUTURE_FEATURE_KEYS) {
      if (overrides[key] !== undefined) flags[key] = Boolean(overrides[key]);
    }
  }

  return flags;
}

export function isFeatureEnabled(key: FutureFeatureKey, overrides?: Partial<FeatureFlagMap>): boolean {
  return getFeatureFlags(overrides)[key];
}
