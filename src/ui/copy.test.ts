import { describe, expect, it } from 'vitest';
import { copyFor, VERDICT_LEVELS } from './copy';
import type { Lang } from '../types';

const languages: readonly Lang[] = ['en', 'fil', 'taglish'];

describe('localized interface copy', () => {
  it.each(languages)('provides complete scan and Learn copy for %s', (lang) => {
    const copy = copyFor(lang);

    for (const value of Object.values(copy)) {
      if (typeof value === 'string') expect(value.trim()).not.toBe('');
    }

    expect(copy.guides).toHaveLength(4);
    expect(copy.guides.every((guide) => guide.title.trim() && guide.body.trim())).toBe(true);
    expect(copy.howSteps).toHaveLength(3);
    expect(copy.howSteps.every((step) => step.trim())).toBe(true);
    expect(Object.keys(copy.assessment).sort()).toEqual([...VERDICT_LEVELS].sort());
    expect(
      VERDICT_LEVELS.every((level) =>
        Object.values(copy.assessment[level]).every((value) => value.trim()),
      ),
    ).toBe(true);
    expect(copy.characterCount(12, 2000)).toContain('12');
    expect(copy.screenshotSelected('sample.png')).toContain('sample.png');
  });
});
