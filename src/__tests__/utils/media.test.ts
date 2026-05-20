import {
  sortMediaByOrder,
  getOptimizedImageUrl,
  getThumbnailUrl,
  getFeedImageUrl,
} from '@/utils/media';
import type { PostMedia } from '@/types/database';

function makeMedia(id: string, sort_order: number): PostMedia {
  return {
    id,
    post_id: 'p1',
    media_url: `https://cdn/${id}.jpg`,
    media_type: 'image',
    thumbnail_url: null,
    blurhash: null,
    width: 100,
    height: 100,
    duration_seconds: null,
    sort_order,
    created_at: '2026-01-01',
  };
}

describe('sortMediaByOrder', () => {
  it('returns empty array for undefined / null / empty', () => {
    expect(sortMediaByOrder(undefined)).toEqual([]);
    expect(sortMediaByOrder(null)).toEqual([]);
    expect(sortMediaByOrder([])).toEqual([]);
  });

  it('sorts by sort_order ascending', () => {
    const out = sortMediaByOrder([
      makeMedia('b', 2),
      makeMedia('a', 0),
      makeMedia('c', 1),
    ]);
    expect(out.map((m) => m.id)).toEqual(['a', 'c', 'b']);
  });

  it('returns a new array (does not mutate the input)', () => {
    const input = [makeMedia('b', 2), makeMedia('a', 0)];
    const out = sortMediaByOrder(input);
    expect(out).not.toBe(input);
    expect(input.map((m) => m.id)).toEqual(['b', 'a']); // unchanged
  });
});

describe('getOptimizedImageUrl', () => {
  const originalEnv = process.env.EXPO_PUBLIC_SUPABASE_URL;
  beforeAll(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  });
  afterAll(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = originalEnv;
  });

  it('returns empty string for undefined / null', () => {
    expect(getOptimizedImageUrl(undefined)).toBe('');
    expect(getOptimizedImageUrl(null)).toBe('');
  });

  it('falls through unchanged for non-Supabase URLs', () => {
    const url = 'https://other.cdn/image.jpg';
    expect(getOptimizedImageUrl(url, { width: 500 })).toBe(url);
  });

  it('rewrites Supabase /object/ to /render/image/ and appends transform params', () => {
    const url =
      'https://example.supabase.co/storage/v1/object/public/posts/u1/img.jpg';
    const out = getOptimizedImageUrl(url, { width: 600, height: 400, quality: 80, format: 'webp' });
    expect(out).toContain('/storage/v1/render/image/public/posts/u1/img.jpg');
    expect(out).toContain('width=600');
    expect(out).toContain('height=400');
    expect(out).toContain('quality=80');
    expect(out).toContain('format=webp');
  });

  it('uses & separator when the URL already has a query string', () => {
    const url =
      'https://example.supabase.co/storage/v1/object/public/posts/img.jpg?token=abc';
    const out = getOptimizedImageUrl(url, { width: 300 });
    expect(out.split('?').length).toBe(2);
    expect(out).toContain('token=abc&width=300');
  });
});

describe('getThumbnailUrl / getFeedImageUrl', () => {
  const originalEnv = process.env.EXPO_PUBLIC_SUPABASE_URL;
  beforeAll(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  });
  afterAll(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = originalEnv;
  });

  const url = 'https://example.supabase.co/storage/v1/object/public/img.jpg';

  it('thumbnail uses width=400 quality=75', () => {
    const out = getThumbnailUrl(url);
    expect(out).toContain('width=400');
    expect(out).toContain('quality=75');
  });

  it('feed uses width=1080 quality=80', () => {
    const out = getFeedImageUrl(url);
    expect(out).toContain('width=1080');
    expect(out).toContain('quality=80');
  });

  it('both return empty string for falsy input', () => {
    expect(getThumbnailUrl(undefined)).toBe('');
    expect(getFeedImageUrl(null)).toBe('');
  });
});
