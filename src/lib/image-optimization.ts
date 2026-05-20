/**
 * Image optimization utilities for the upload pipeline.
 *
 * Provides dimension calculations, quality presets, and metadata stripping
 * to reduce upload sizes and improve load times.
 *
 * When expo-image-manipulator is added, the `optimizeForUpload` function
 * can be extended to resize and compress images before upload.
 */

// ── Dimension Presets ────────────────────────────────────────────

export type ImagePreset = 'thumbnail' | 'feed' | 'full' | 'avatar' | 'story';

type DimensionConfig = {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0-1 for JPEG quality
};

const PRESETS: Record<ImagePreset, DimensionConfig> = {
  thumbnail: { maxWidth: 300, maxHeight: 300, quality: 0.6 },
  feed: { maxWidth: 1080, maxHeight: 1350, quality: 0.8 },
  full: { maxWidth: 2048, maxHeight: 2048, quality: 0.9 },
  avatar: { maxWidth: 400, maxHeight: 400, quality: 0.7 },
  story: { maxWidth: 1080, maxHeight: 1920, quality: 0.8 },
};

export function getPreset(name: ImagePreset): DimensionConfig {
  return PRESETS[name];
}

// ── Dimension Calculations ───────────────────────────────────────

/**
 * Calculate resized dimensions while maintaining aspect ratio.
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  preset: ImagePreset,
): { width: number; height: number; needsResize: boolean } {
  const { maxWidth, maxHeight } = PRESETS[preset];

  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight, needsResize: false };
  }

  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
    needsResize: true,
  };
}

// ── File Size Estimation ─────────────────────────────────────────

/**
 * Estimate compressed file size in bytes.
 * Based on rough JPEG compression ratios at various quality levels.
 */
export function estimateCompressedSize(
  width: number,
  height: number,
  quality: number,
): number {
  // Raw pixels * 3 bytes per pixel (RGB)
  const rawSize = width * height * 3;
  // JPEG compression ratio varies: ~10:1 at q=0.8, ~20:1 at q=0.6
  const compressionRatio = 5 + (1 - quality) * 25;
  return Math.round(rawSize / compressionRatio);
}

/**
 * Check if an image should be compressed based on its estimated size.
 */
export function shouldCompress(
  width: number,
  height: number,
  targetMaxKB: number = 500,
): boolean {
  const estimatedSize = estimateCompressedSize(width, height, 0.9);
  return estimatedSize > targetMaxKB * 1024;
}

// ── Upload Path Helpers ──────────────────────────────────────────

/**
 * Generate a storage path with preset-based subfolder.
 */
export function generateUploadPath(
  userId: string,
  fileName: string,
  preset: ImagePreset,
): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  return `${userId}/${preset}/${timestamp}_${sanitized}`;
}

/**
 * Convert a storage public URL to a resized variant URL.
 * Works with Supabase Storage image transformation API.
 */
export function getResizedUrl(
  publicUrl: string,
  width: number,
  height?: number,
): string {
  // Supabase Storage supports image transformations via query params
  const url = new URL(publicUrl);
  url.searchParams.set('width', String(width));
  if (height) {
    url.searchParams.set('height', String(height));
  }
  url.searchParams.set('resize', 'contain');
  return url.toString();
}

/**
 * Get a thumbnail URL for a given public URL.
 */
export function getThumbnailUrl(publicUrl: string): string {
  return getResizedUrl(publicUrl, PRESETS.thumbnail.maxWidth, PRESETS.thumbnail.maxHeight);
}

/**
 * Get a feed-optimized URL for a given public URL.
 */
export function getFeedUrl(publicUrl: string): string {
  return getResizedUrl(publicUrl, PRESETS.feed.maxWidth);
}

// ── Network-aware quality selection ─────────────────────────────

/**
 * NetInfo's `effectiveType` values, plus an offline flag we model ourselves.
 * Match the values reported by `@react-native-community/netinfo` so callers
 * can pass `netInfo.details.effectiveType` directly.
 */
export type NetworkQuality = 'offline' | '2g' | '3g' | '4g' | '5g' | 'unknown';

const QUALITY_SCALE: Record<NetworkQuality, number> = {
  offline: 0.5, // serve a small cached-friendly variant if we still try
  '2g': 0.5,
  '3g': 0.65,
  '4g': 1,
  '5g': 1,
  unknown: 1,
};

/**
 * Pick a feed image width based on network quality. Slow connections get
 * a smaller variant; 4g+ gets the full feed preset.
 */
export function getFeedUrlForNetwork(
  publicUrl: string,
  network: NetworkQuality = 'unknown',
): string {
  const scale = QUALITY_SCALE[network] ?? 1;
  const width = Math.max(360, Math.round(PRESETS.feed.maxWidth * scale));
  return getResizedUrl(publicUrl, width);
}
