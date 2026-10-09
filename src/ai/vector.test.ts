import { describe, expect, it } from 'vitest';
import { cosine, topMatches, type IndexEntry } from './vector';

const v = (...n: number[]) => new Float32Array(n);

describe('cosine', () => {
  it('is 1 for identical direction and 0 for orthogonal vectors', () => {
    expect(cosine(v(1, 2, 3), v(2, 4, 6))).toBeCloseTo(1);
    expect(cosine(v(1, 0), v(0, 1))).toBeCloseTo(0);
  });

  it('returns 0 for a zero vector instead of NaN', () => {
    expect(cosine(v(0, 0), v(1, 1))).toBe(0);
  });

  it('rejects mismatched lengths', () => {
    expect(() => cosine(v(1), v(1, 2))).toThrow();
  });
});

describe('topMatches', () => {
  const index: IndexEntry[] = [
    { archetypeId: 'otp', vector: v(1, 0) },
    { archetypeId: 'otp', vector: v(0.9, 0.1) },
    { archetypeId: 'parcel', vector: v(0, 1) },
    { archetypeId: 'prize', vector: v(0.5, 0.5) },
  ];

  it('keeps the best phrasing per archetype and sorts descending', () => {
    const top = topMatches(v(1, 0), index, 3);
    expect(top.map((m) => m.archetypeId)).toEqual(['otp', 'prize', 'parcel']);
    expect(top[0].similarity).toBeCloseTo(1);
  });

  it('limits to k and handles an empty index', () => {
    expect(topMatches(v(1, 0), index, 1)).toHaveLength(1);
    expect(topMatches(v(1, 0), [], 3)).toEqual([]);
  });
});
