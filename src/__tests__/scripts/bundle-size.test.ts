/**
 * Tests for the helpers exported from scripts/bundle-size.js (categorize +
 * fmt). The CLI side (main + walk) reads from dist/ — we don't exercise
 * that here.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { categorize, fmt } = require('../../../scripts/bundle-size.js') as {
  categorize: (ext: string) => string;
  fmt: (bytes: number) => string;
};

describe('categorize', () => {
  it.each([
    ['.js', 'JS'],
    ['.mjs', 'JS'],
    ['.css', 'CSS'],
    ['.html', 'HTML'],
    ['.png', 'Image'],
    ['.jpg', 'Image'],
    ['.webp', 'Image'],
    ['.svg', 'Image'],
    ['.woff2', 'Font'],
    ['.json', 'Data'],
    ['.map', 'Data'],
    ['.wasm', 'Other'],
    ['', 'Other'],
  ])('classifies %s as %s', (ext, expected) => {
    expect(categorize(ext)).toBe(expected);
  });

  it('is case-insensitive', () => {
    expect(categorize('.PNG')).toBe('Image');
    expect(categorize('.JS')).toBe('JS');
  });
});

describe('fmt', () => {
  it('uses B under 1 KB', () => {
    expect(fmt(0)).toBe('0 B');
    expect(fmt(512)).toBe('512 B');
    expect(fmt(1023)).toBe('1023 B');
  });

  it('uses KB at the 1 KB boundary', () => {
    expect(fmt(1024)).toBe('1.0 KB');
    expect(fmt(1500)).toBe('1.5 KB');
  });

  it('uses MB at the 1 MB boundary', () => {
    expect(fmt(1024 * 1024)).toBe('1.00 MB');
    expect(fmt(2.5 * 1024 * 1024)).toBe('2.50 MB');
  });
});
