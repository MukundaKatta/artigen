import { extractHashtags, extractMentions } from '@/utils/extract-hashtags';

describe('extractHashtags', () => {
  it('extracts hashtags from text', () => {
    expect(extractHashtags('Hello #world #react')).toEqual(['world', 'react']);
  });

  it('returns empty array when no hashtags', () => {
    expect(extractHashtags('Hello world')).toEqual([]);
  });

  it('converts hashtags to lowercase', () => {
    expect(extractHashtags('#React #NEXT')).toEqual(['react', 'next']);
  });

  it('handles hashtags with underscores and numbers', () => {
    expect(extractHashtags('#ai_art #3d_render')).toEqual(['ai_art', '3d_render']);
  });

  it('ignores hashtags with special characters', () => {
    expect(extractHashtags('#hello-world #good')).toEqual(['hello', 'good']);
  });

  it('handles empty string', () => {
    expect(extractHashtags('')).toEqual([]);
  });

  it('handles string with only hash symbols', () => {
    expect(extractHashtags('# ## ###')).toEqual([]);
  });

  it('handles multiple spaces between hashtags', () => {
    expect(extractHashtags('#one   #two    #three')).toEqual(['one', 'two', 'three']);
  });
});

describe('extractMentions', () => {
  it('extracts mentions from text', () => {
    expect(extractMentions('Hey @john check this')).toEqual(['john']);
  });

  it('returns empty array when no mentions', () => {
    expect(extractMentions('Hello world')).toEqual([]);
  });

  it('handles mentions with dots and underscores', () => {
    expect(extractMentions('@john.doe @jane_doe')).toEqual(['john.doe', 'jane_doe']);
  });

  it('handles multiple mentions', () => {
    expect(extractMentions('@alice @bob @charlie')).toEqual(['alice', 'bob', 'charlie']);
  });

  it('preserves mention case', () => {
    expect(extractMentions('@JohnDoe')).toEqual(['JohnDoe']);
  });

  it('handles empty string', () => {
    expect(extractMentions('')).toEqual([]);
  });
});
