import { describe, expect, it } from 'vitest';
import dev2 from '../../eval/dev2.json';
import type { Lang } from '../types';
import { analyze } from './analyze';

// Second development set (eval/dev2.json): everyday messages and varied Philippine scams, written to
// find "Not sure" gaps. Rules only, no model. Not the frozen held-out set.
describe('dev2 regression gate (rules only)', () => {
  it('flags scams, keeps ordinary messages fine, and rarely abstains', async () => {
    const counts = { caught: 0, scams: 0, falseAlarms: 0, fineScams: 0, abstained: 0 };
    for (const item of dev2) {
      const { level } = await analyze(
        { text: item.text },
        { lang: item.lang as Lang, useLLM: false },
      );
      const flagged = level === 'suspicious' || level === 'likely_scam';
      if (item.expected === 'probably_fine') {
        if (flagged) counts.falseAlarms++;
      } else {
        counts.scams++;
        if (flagged) counts.caught++;
        if (level === 'probably_fine') counts.fineScams++;
      }
      if (level === 'not_sure') counts.abstained++;
    }
    expect(counts.fineScams).toBe(0); // never a confident wrong "fine" for a scam
    expect(counts.falseAlarms).toBe(0);
    expect(counts.caught).toBeGreaterThanOrEqual(15);
    expect(counts.abstained).toBeLessThanOrEqual(2);
  });
});
