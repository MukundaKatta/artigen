/**
 * Input sanitization utilities for user-generated content.
 *
 * Defense-in-depth layer on the client side. Server-side validation
 * should always be the primary line of defense.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

const HTML_ENTITY_REGEX = /[&<>"'/]/g;

/**
 * Escape HTML special characters to prevent XSS in rendered content.
 */
export function escapeHtml(input: string): string {
  return input.replace(HTML_ENTITY_REGEX, (char) => HTML_ENTITY_MAP[char] || char);
}

/**
 * Strip all HTML tags from input. Useful for plain-text fields.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Remove null bytes and other control characters that could cause issues.
 */
export function stripControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize user input for safe storage and display.
 * Combines stripping control chars with HTML escaping.
 */
export function sanitizeInput(input: string): string {
  return escapeHtml(stripControlChars(input.trim()));
}

/**
 * Sanitize a plain-text field (captions, comments, bios).
 * Strips HTML tags but preserves line breaks and basic formatting.
 */
export function sanitizeText(input: string): string {
  return stripControlChars(stripHtml(input.trim()));
}

/**
 * Validate and sanitize a URL. Returns null if invalid.
 */
export function sanitizeUrl(input: string): string | null {
  try {
    const url = new URL(input);
    // Only allow http(s) protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    // Block javascript: protocol attempts (defense-in-depth)
    if (url.href.toLowerCase().includes('javascript:')) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

/**
 * Sanitize search query — strip potentially dangerous characters
 * while preserving normal search terms.
 */
export function sanitizeSearchQuery(input: string): string {
  return input
    .trim()
    .replace(/[<>{}[\]\\]/g, '')
    .slice(0, 200); // Cap search query length
}
