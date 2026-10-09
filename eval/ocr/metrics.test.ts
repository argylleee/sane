import { describe, expect, it } from 'vitest';
import { characterErrorRate, wordErrorRate } from './metrics';

describe('OCR error rates', () => {
  it('is zero for identical text and ignores case and spacing', () => {
    expect(characterErrorRate('Pay the fee', 'pay  THE fee')).toBe(0);
    expect(wordErrorRate('Pay the fee', 'pay the fee')).toBe(0);
  });

  it('counts substitutions, insertions and deletions', () => {
    expect(characterErrorRate('abcd', 'abxd')).toBeCloseTo(0.25);
    expect(wordErrorRate('send the otp now', 'send otp now')).toBeCloseTo(0.25);
    expect(wordErrorRate('one two', 'one two three')).toBeCloseTo(0.5);
  });

  it('handles an empty truth', () => {
    expect(characterErrorRate('', '')).toBe(0);
    expect(characterErrorRate('', 'noise')).toBe(1);
  });
});
