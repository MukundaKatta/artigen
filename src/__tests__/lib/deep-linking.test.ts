import { parseDeepLink, createDeepLink } from '@/lib/deep-linking';

describe('parseDeepLink', () => {
  it('parses a post deep link', () => {
    expect(parseDeepLink('artigen://post/abc123')).toEqual({
      screen: '/(screens)/post/[id]',
      params: { id: 'abc123' },
    });
  });

  it('parses a user deep link', () => {
    expect(parseDeepLink('artigen://user/u-9')).toEqual({
      screen: '/(screens)/user/[id]',
      params: { id: 'u-9' },
    });
  });

  it('parses a community deep link', () => {
    expect(parseDeepLink('artigen://community/c-7')).toEqual({
      screen: '/(screens)/community/[id]',
      params: { id: 'c-7' },
    });
  });

  it('parses a challenge deep link', () => {
    expect(parseDeepLink('artigen://challenge/x-1')).toEqual({
      screen: '/(screens)/challenge/[id]',
      params: { id: 'x-1' },
    });
  });

  it('parses a profile deep link (no id)', () => {
    expect(parseDeepLink('artigen://profile')).toEqual({
      screen: '/(tabs)/profile',
      params: undefined,
    });
  });

  it('returns null for unknown resources', () => {
    expect(parseDeepLink('artigen://nope/123')).toBeNull();
  });

  it('returns null for resource missing an id (when one is required)', () => {
    expect(parseDeepLink('artigen://post')).toBeNull();
  });

  it('returns null for empty / malformed input', () => {
    expect(parseDeepLink('')).toBeNull();
    expect(parseDeepLink('not-a-url')).toBeNull();
  });
});

describe('createDeepLink', () => {
  it('builds a custom-scheme URL for a resource with id', () => {
    expect(createDeepLink('post', 'abc')).toBe('artigen://post/abc');
  });

  it('builds a custom-scheme URL for a resource without id', () => {
    expect(createDeepLink('profile')).toBe('artigen://profile');
  });
});
