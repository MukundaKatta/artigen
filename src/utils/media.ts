import type { PostMedia } from '@/types/database';

/** Sort post media by sort_order field. Returns a new sorted array. */
export function sortMediaByOrder(media: PostMedia[] | undefined | null): PostMedia[] {
  if (!media || media.length === 0) return [];
  return [...media].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

/**
 * Get an optimized image URL from Supabase Storage with transforms.
 * Supabase Storage supports on-the-fly image resizing via render/ endpoint.
 * Falls through for non-Supabase URLs.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: { width?: number; height?: number; quality?: number; format?: 'webp' | 'origin' } = {},
): string {
  if (!url) return '';

  // Only transform Supabase Storage URLs
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !url.includes(supabaseUrl) || !url.includes('/storage/v1/object/')) {
    return url;
  }

  // Replace /object/ with /render/image/ for Supabase image transforms
  const renderUrl = url.replace('/storage/v1/object/', '/storage/v1/render/image/');

  const params = new URLSearchParams();
  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));
  if (options.quality) params.set('quality', String(options.quality));
  if (options.format) params.set('format', options.format);

  const separator = renderUrl.includes('?') ? '&' : '?';
  return `${renderUrl}${separator}${params.toString()}`;
}

/** Thumbnail URL for grid views (e.g., profile grid, explore). */
export function getThumbnailUrl(url: string | undefined | null): string {
  return getOptimizedImageUrl(url, { width: 400, quality: 75 });
}

/** Medium-res URL for feed views. */
export function getFeedImageUrl(url: string | undefined | null): string {
  return getOptimizedImageUrl(url, { width: 1080, quality: 80 });
}
