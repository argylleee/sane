import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { levels, summarize, type Case } from './metrics';

export function readFrozenSet(): Case[] {
  const bytes = readFileSync('eval/heldout/heldout.json');
  const hash = readFileSync('eval/heldout/README.md', 'utf8').match(
    /SHA-256: `([a-f0-9]{64})`/,
  )?.[1];
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(hash);
  return JSON.parse(bytes.toString('utf8')) as Case[];
}

it('preserves the frozen set, its language balance, provenance, and separation from reference text', () => {
  const cases = readFrozenSet();
  expect(cases.length).toBeGreaterThanOrEqual(40);
  expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
  const normalized = (text: string) =>
    text.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
  expect(new Set(cases.map((c) => normalized(c.text))).size).toBe(cases.length);
  const reference = JSON.parse(readFileSync('src/data/archetypes.json', 'utf8'));
  const existing: string[] = [
    ...JSON.parse(readFileSync('eval/testset.json', 'utf8')).map((c: { text: string }) => c.text),
    ...JSON.parse(readFileSync('eval/probe-messages.json', 'utf8')).map(
      (c: { text: string }) => c.text,
    ),
    ...reference.archetypes.flatMap((a: { phrases: string[] }) => a.phrases),
    ...reference.benign,
  ];
  const prior = new Set(existing.map(normalized));
  for (const c of cases) {
    expect(prior.has(normalized(c.text)), c.id).toBe(false);
    expect(levels.slice(0, 3)).toContain(c.expected);
    expect(['en', 'fil', 'taglish']).toContain(c.lang);
    expect(c.provenance.length).toBeGreaterThan(20);
    expect(c.pattern.length).toBeGreaterThan(0);
  }
  for (const lang of ['en', 'fil', 'taglish']) {
    const subset = cases.filter((c) => c.lang === lang);
    expect(subset).toHaveLength(14);
    expect(subset.filter((c) => c.expected === 'probably_fine')).toHaveLength(7);
  }
});

it('counts abstained scams conservatively and distinguishes level mismatches from false alarms', () => {
  const result = summarize([
    { id: 'a', lang: 'en', expected: 'likely_scam', actual: 'suspicious' },
    { id: 'b', lang: 'en', expected: 'suspicious', actual: 'not_sure' },
    { id: 'c', lang: 'en', expected: 'probably_fine', actual: 'suspicious' },
    { id: 'd', lang: 'en', expected: 'probably_fine', actual: 'probably_fine' },
  ]);
  expect(result).toMatchObject({
    caught: 1,
    falseAlarms: 1,
    abstained: 1,
    precision: 0.5,
    recall: 0.5,
    falsePositiveRate: 0.5,
    abstentionRate: 0.25,
    levelAgreement: 0.25,
    missedScams: ['b'],
    falseAlarmIds: ['c'],
    mismatchIds: ['a', 'b', 'c'],
  });
  expect(result.perLabel.suspicious).toMatchObject({
    precision: 0,
    recall: 0,
    falsePositiveRate: 2 / 3,
    abstentionRate: 1,
  });
  expect(result.confusion.likely_scam.suspicious).toBe(1);
  expect(result.perLabel.not_sure.recall).toBeNull();
  expect(summarize([]).precision).toBeNull();
});
