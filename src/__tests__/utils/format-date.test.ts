import { timeAgo, formatPostDate } from '@/utils/format-date';

describe('timeAgo', () => {
  it('returns short form for seconds', () => {
    const now = new Date();
    const result = timeAgo(now.toISOString());
    expect(result).toMatch(/^\d+s$/);
  });

  it('returns short form for minutes', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinAgo.toISOString())).toBe('5m');
  });

  it('returns short form for hours', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(timeAgo(twoHoursAgo.toISOString())).toBe('2h');
  });

  it('returns short form for days', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(timeAgo(threeDaysAgo.toISOString())).toBe('3d');
  });

  it('returns short form for single units', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    expect(timeAgo(oneHourAgo.toISOString())).toBe('1h');
  });
});

describe('formatPostDate', () => {
  it('formats this year without year suffix', () => {
    const thisYear = new Date().getFullYear();
    const result = formatPostDate(`${thisYear}-03-15T12:00:00Z`);
    expect(result).toBe('March 15');
  });

  it('formats previous year with year suffix', () => {
    const result = formatPostDate('2022-07-04T12:00:00Z');
    expect(result).toBe('July 4, 2022');
  });

  it('formats January 1 correctly', () => {
    const result = formatPostDate('2021-01-01T12:00:00Z');
    expect(result).toBe('January 1, 2021');
  });
});
