import {
  calculateDimensions,
  estimateCompressedSize,
  shouldCompress,
  getResizedUrl,
  getThumbnailUrl,
  getFeedUrl,
  getFeedUrlForNetwork,
  getPreset,
} from '@/lib/image-optimization';

describe('calculateDimensions', () => {
  it('returns originals untouched when within preset bounds', () => {
    expect(calculateDimensions(800, 600, 'feed')).toEqual({
      width: 800,
      height: 600,
      needsResize: false,
    });
  });

  it('scales down preserving aspect ratio when oversized', () => {
    const result = calculateDimensions(2160, 2700, 'feed'); // 4:5
    expect(result.needsResize).toBe(true);
    // feed preset is 1080x1350 (4:5)
    expect(result.width).toBe(1080);
    expect(result.height).toBe(1350);
  });

  it('scales by the tighter dimension', () => {
    const result = calculateDimensions(4000, 2000, 'feed'); // wide
    expect(result.needsResize).toBe(true);
    // width limit (1080) is the tighter constraint
    expect(result.width).toBe(1080);
    expect(result.height).toBe(540);
  });
});

describe('estimateCompressedSize', () => {
  it('returns a smaller estimate at lower quality', () => {
    const high = estimateCompressedSize(1000, 1000, 0.9);
    const low = estimateCompressedSize(1000, 1000, 0.5);
    expect(low).toBeLessThan(high);
  });
});

describe('shouldCompress', () => {
  it('returns true for large dimensions', () => {
    expect(shouldCompress(4000, 4000)).toBe(true);
  });

  it('returns false for small dimensions', () => {
    expect(shouldCompress(100, 100)).toBe(false);
  });
});

describe('getResizedUrl / getThumbnailUrl / getFeedUrl', () => {
  const base = 'https://cdn.example.com/path/image.jpg';

  it('appends width + resize=contain', () => {
    const url = new URL(getResizedUrl(base, 500));
    expect(url.searchParams.get('width')).toBe('500');
    expect(url.searchParams.get('resize')).toBe('contain');
  });

  it('appends height when provided', () => {
    const url = new URL(getResizedUrl(base, 500, 300));
    expect(url.searchParams.get('height')).toBe('300');
  });

  it('thumbnail uses the thumbnail preset dimensions', () => {
    const url = new URL(getThumbnailUrl(base));
    expect(url.searchParams.get('width')).toBe('300');
    expect(url.searchParams.get('height')).toBe('300');
  });

  it('feed url uses the feed width', () => {
    const url = new URL(getFeedUrl(base));
    expect(url.searchParams.get('width')).toBe('1080');
  });
});

describe('getFeedUrlForNetwork', () => {
  const base = 'https://cdn.example.com/image.jpg';

  it('returns the full feed width on 4g / 5g / unknown', () => {
    for (const net of ['4g', '5g', 'unknown'] as const) {
      const url = new URL(getFeedUrlForNetwork(base, net));
      expect(url.searchParams.get('width')).toBe('1080');
    }
  });

  it('shrinks for slow connections', () => {
    const url2g = new URL(getFeedUrlForNetwork(base, '2g'));
    const url3g = new URL(getFeedUrlForNetwork(base, '3g'));
    const url4g = new URL(getFeedUrlForNetwork(base, '4g'));

    const w2g = Number(url2g.searchParams.get('width'));
    const w3g = Number(url3g.searchParams.get('width'));
    const w4g = Number(url4g.searchParams.get('width'));

    expect(w2g).toBeLessThan(w3g);
    expect(w3g).toBeLessThan(w4g);
  });

  it('never goes below 360px (lower floor for legibility)', () => {
    const url = new URL(getFeedUrlForNetwork(base, '2g'));
    expect(Number(url.searchParams.get('width'))).toBeGreaterThanOrEqual(360);
  });

  it('defaults to full width when no quality is passed', () => {
    const url = new URL(getFeedUrlForNetwork(base));
    expect(url.searchParams.get('width')).toBe('1080');
  });
});

describe('getPreset', () => {
  it('returns the dimension config for each preset', () => {
    expect(getPreset('thumbnail').maxWidth).toBe(300);
    expect(getPreset('feed').maxWidth).toBe(1080);
    expect(getPreset('full').maxWidth).toBe(2048);
    expect(getPreset('avatar').maxWidth).toBe(400);
    expect(getPreset('story').maxWidth).toBe(1080);
  });
});
