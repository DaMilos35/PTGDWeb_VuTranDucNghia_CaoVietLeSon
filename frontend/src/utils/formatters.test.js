import { describe, it, expect } from 'vitest';
import { formatPrice, formatNumber, truncate } from './formatters';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('formats a number as VND', () => {
      expect(formatPrice(100000)).toBe('100.000\u00A0đ');
      expect(formatPrice(0)).toBe('0\u00A0đ');
    });
  });

  describe('formatNumber', () => {
    it('formats a number with dot separators', () => {
      expect(formatNumber(1000000)).toBe('1.000.000');
    });
  });

  describe('truncate', () => {
    it('truncates strings longer than the specified length', () => {
      const longStr = 'This is a very long string that should be truncated';
      expect(truncate(longStr, 10)).toBe('This is a ...');
    });

    it('does not truncate short strings', () => {
      expect(truncate('Short', 10)).toBe('Short');
    });
    
    it('handles null or undefined safely', () => {
      expect(truncate(null)).toBe(null);
      expect(truncate(undefined)).toBe(undefined);
    });
  });
});
