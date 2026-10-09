// OWNER: model. Scores analyze() on eval/testset.json. Skipped unless EVAL=1 so it never gates CI.
// Usage: EVAL=1 npx vitest run eval/run.eval.test.ts   (PowerShell: $env:EVAL=1; npx vitest ...)
// EVAL_SET=path/to/set.json scores a different file, e.g. a held-out set kept out of the repo.
// In Node only rules run (no embedding model), so this reports the rules-only baseline.
import { readFileSync } from 'node:fs';
import { describe, it } from 'vitest';
import { analyze } from '../src/pipeline/analyze';
import type { Lang, Level } from '../src/types';

type Case = { id: string; lang: Lang; expected: Level; note: string; text: string };

describe.skipIf(!process.env.EVAL)('verdict evaluation (rules-only baseline)', () => {
  it('prints scam recall, false alarms, and abstain rate per language', async () => {
    const cases = JSON.parse(
      readFileSync(process.env.EVAL_SET ?? 'eval/testset.json', 'utf8'),
    ) as Case[];
    const flagged = (level: Level) => level === 'likely_scam' || level === 'suspicious';
    const stats = new Map<
      string,
      {
        scams: number;
        caught: number;
        legit: number;
        falseAlarms: number;
        abstained: number;
        total: number;
      }
    >();
    const misses: string[] = [];

    for (const c of cases) {
      const verdict = await analyze({ text: c.text }, { lang: c.lang, useLLM: false });
      const row = stats.get(c.lang) ?? {
        scams: 0,
        caught: 0,
        legit: 0,
        falseAlarms: 0,
        abstained: 0,
        total: 0,
      };
      row.total++;
      if (verdict.level === 'not_sure') row.abstained++;
      if (c.expected === 'probably_fine') {
        row.legit++;
        if (flagged(verdict.level)) {
          row.falseAlarms++;
          misses.push(`${c.id} FALSE ALARM (${verdict.level}): ${c.note}`);
        }
      } else {
        row.scams++;
        if (flagged(verdict.level)) row.caught++;
        else misses.push(`${c.id} MISSED (${verdict.level}): ${c.note}`);
      }
      stats.set(c.lang, row);
    }

    const all = [...stats.values()].reduce(
      (sum, r) => ({
        scams: sum.scams + r.scams,
        caught: sum.caught + r.caught,
        legit: sum.legit + r.legit,
        falseAlarms: sum.falseAlarms + r.falseAlarms,
        abstained: sum.abstained + r.abstained,
        total: sum.total + r.total,
      }),
      { scams: 0, caught: 0, legit: 0, falseAlarms: 0, abstained: 0, total: 0 },
    );
    const line = (name: string, r: typeof all) =>
      `${name.padEnd(8)} caught ${r.caught}/${r.scams} scams | false alarms ${r.falseAlarms}/${r.legit} legit | abstained ${r.abstained}/${r.total}`;
    console.log(
      ['', ...[...stats].map(([lang, r]) => line(lang, r)), line('ALL', all), '', ...misses].join(
        '\n',
      ),
    );
  });
});
