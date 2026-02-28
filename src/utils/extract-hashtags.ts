/**
 * Extracts hashtags from a text string.
 * Example: "Hello #world #react" -> ["world", "react"]
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#([a-zA-Z0-9_]+)/g);
  if (!matches) return [];
  return matches.map((tag) => tag.slice(1).toLowerCase());
}

/**
 * Extracts @mentions from a text string.
 * Example: "Hey @john check this" -> ["john"]
 */
export function extractMentions(text: string): string[] {
  const matches = text.match(/@([a-zA-Z0-9._]+)/g);
  if (!matches) return [];
  return matches.map((mention) => mention.slice(1));
}
