export type RichTextPart =
  | { type: 'text'; value: string }
  | { type: 'mention'; value: string; handle: string }
  | { type: 'hashtag'; value: string; tag: string };

/**
 * Pure parser — splits a caption into text / @mention / #hashtag parts.
 *
 * A token is `[@#]` followed by one-or-more of `[a-zA-Z0-9._]`. Anything
 * else (including bare `@` or `#`, emoji, whitespace, punctuation) stays
 * as plain text.
 */
export function parseRichText(input: string): RichTextPart[] {
  const regex = /([@#][a-zA-Z0-9._]+)/g;
  const segments = input.split(regex);
  const parts: RichTextPart[] = [];
  for (const segment of segments) {
    if (segment === '') continue;
    if (segment.startsWith('@')) {
      parts.push({ type: 'mention', value: segment, handle: segment.slice(1) });
    } else if (segment.startsWith('#')) {
      parts.push({ type: 'hashtag', value: segment, tag: segment.slice(1) });
    } else {
      parts.push({ type: 'text', value: segment });
    }
  }
  return parts;
}
