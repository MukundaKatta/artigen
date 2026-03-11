import {
  escapeHtml,
  stripHtml,
  stripControlChars,
  sanitizeInput,
  sanitizeText,
  sanitizeUrl,
  sanitizeSearchQuery,
} from '@/lib/sanitize';

describe('sanitize', () => {
  describe('escapeHtml', () => {
    it('escapes HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
      );
    });

    it('escapes ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('leaves safe strings unchanged', () => {
      expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
    });
  });

  describe('stripHtml', () => {
    it('removes HTML tags', () => {
      expect(stripHtml('<b>Bold</b> text')).toBe('Bold text');
    });

    it('removes nested tags', () => {
      expect(stripHtml('<div><p>Hello</p></div>')).toBe('Hello');
    });

    it('handles empty input', () => {
      expect(stripHtml('')).toBe('');
    });
  });

  describe('stripControlChars', () => {
    it('removes null bytes', () => {
      expect(stripControlChars('hello\x00world')).toBe('helloworld');
    });

    it('preserves newlines and tabs', () => {
      expect(stripControlChars('hello\n\tworld')).toBe('hello\n\tworld');
    });
  });

  describe('sanitizeInput', () => {
    it('trims, strips control chars, and escapes HTML', () => {
      expect(sanitizeInput('  <script>alert(1)</script>  ')).toBe(
        '&lt;script&gt;alert(1)&lt;&#x2F;script&gt;',
      );
    });
  });

  describe('sanitizeText', () => {
    it('strips HTML tags but preserves text', () => {
      expect(sanitizeText('  <b>Hello</b> World  ')).toBe('Hello World');
    });
  });

  describe('sanitizeUrl', () => {
    it('accepts valid HTTPS URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
    });

    it('accepts HTTP URLs', () => {
      expect(sanitizeUrl('http://example.com/path')).toBe('http://example.com/path');
    });

    it('rejects javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    });

    it('rejects data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<h1>Hi</h1>')).toBeNull();
    });

    it('rejects invalid URLs', () => {
      expect(sanitizeUrl('not-a-url')).toBeNull();
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('strips dangerous characters', () => {
      expect(sanitizeSearchQuery('hello <world> {test}')).toBe('hello world test');
    });

    it('trims whitespace', () => {
      expect(sanitizeSearchQuery('  hello  ')).toBe('hello');
    });

    it('caps length at 200 characters', () => {
      const long = 'a'.repeat(300);
      expect(sanitizeSearchQuery(long)).toHaveLength(200);
    });
  });
});
