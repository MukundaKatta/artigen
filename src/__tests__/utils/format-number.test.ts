import { formatNumber } from '@/utils/format-number';

describe('formatNumber', () => {
  it('returns raw number below 1000', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(10000)).toBe('10K');
    expect(formatNumber(999999)).toBe('1000.0K');
  });

  it('formats millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1M');
    expect(formatNumber(1500000)).toBe('1.5M');
    expect(formatNumber(10000000)).toBe('10M');
  });

  it('formats billions with B suffix', () => {
    expect(formatNumber(1000000000)).toBe('1B');
    expect(formatNumber(2500000000)).toBe('2.5B');
  });

  it('removes trailing .0 for clean thousands', () => {
    expect(formatNumber(2000)).toBe('2K');
    expect(formatNumber(5000)).toBe('5K');
  });

  it('removes trailing .0 for clean millions', () => {
    expect(formatNumber(3000000)).toBe('3M');
  });
});
