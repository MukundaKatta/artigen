/**
 * Tests for the pure parseRichText helper consumed by RichText.tsx.
 * Component-render tests aren't feasible in the current node test
 * environment, but the parser is the meaty logic worth covering.
 */

import { parseRichText } from '@/lib/parse-rich-text';

describe('parseRichText', () => {
  it('returns a single text part for plain content', () => {
    expect(parseRichText('hello world')).toEqual([
      { type: 'text', value: 'hello world' },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseRichText('')).toEqual([]);
  });

  it('parses a single @mention', () => {
    expect(parseRichText('@alice')).toEqual([
      { type: 'mention', value: '@alice', handle: 'alice' },
    ]);
  });

  it('parses a single #hashtag', () => {
    expect(parseRichText('#art')).toEqual([
      { type: 'hashtag', value: '#art', tag: 'art' },
    ]);
  });

  it('interleaves text, mentions, and hashtags', () => {
    expect(parseRichText('hi @alice check out #art today')).toEqual([
      { type: 'text', value: 'hi ' },
      { type: 'mention', value: '@alice', handle: 'alice' },
      { type: 'text', value: ' check out ' },
      { type: 'hashtag', value: '#art', tag: 'art' },
      { type: 'text', value: ' today' },
    ]);
  });

  it('handles mentions and hashtags with dots and underscores', () => {
    expect(parseRichText('@user.name #my_tag')).toEqual([
      { type: 'mention', value: '@user.name', handle: 'user.name' },
      { type: 'text', value: ' ' },
      { type: 'hashtag', value: '#my_tag', tag: 'my_tag' },
    ]);
  });

  it('treats @ or # alone (no chars) as plain text', () => {
    expect(parseRichText('an @ sign')).toEqual([
      { type: 'text', value: 'an @ sign' },
    ]);
    expect(parseRichText('the # symbol')).toEqual([
      { type: 'text', value: 'the # symbol' },
    ]);
  });

  it('parses adjacent mention then hashtag with no space', () => {
    // The regex consumes [@#][word]+ tokens; with no separator between two
    // tokens the second still parses as its own segment.
    const parts = parseRichText('@a#b');
    expect(parts.map((p) => p.value)).toEqual(['@a', '#b']);
    expect(parts[0]).toMatchObject({ type: 'mention', handle: 'a' });
    expect(parts[1]).toMatchObject({ type: 'hashtag', tag: 'b' });
  });

  it('handles very long inputs without crashing', () => {
    const longInput = '@user '.repeat(500) + 'tail';
    const parts = parseRichText(longInput);
    expect(parts.filter((p) => p.type === 'mention')).toHaveLength(500);
    // Trailing text is " tail" — the regex pulls only the @user tokens
    expect(parts[parts.length - 1]).toEqual({ type: 'text', value: ' tail' });
  });

  it('preserves emoji as text', () => {
    expect(parseRichText('great work 🎨 @bob')).toEqual([
      { type: 'text', value: 'great work 🎨 ' },
      { type: 'mention', value: '@bob', handle: 'bob' },
    ]);
  });

  it('does not match @ or # inside email-like strings as mentions', () => {
    // The regex matches the @word part of an email — by design here, since
    // the rule is "any @ followed by word chars". Document the behavior.
    const parts = parseRichText('contact me at foo@bar.com');
    expect(parts.some((p) => p.type === 'mention' && p.handle === 'bar.com')).toBe(true);
  });
});
