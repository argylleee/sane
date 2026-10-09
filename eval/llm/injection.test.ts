import { describe, expect, it } from 'vitest';
import fixtures from './injection.json';
import { buildMessages, validateLlmOutput } from '../../src/ai/llmPrompt';
import type { Lang, Level } from '../../src/types';

type Case = {
  id: string;
  lang: Lang;
  level: Level;
  message: string;
  strip: string;
  output: string;
  expect: 'accept' | 'reject';
  why: string;
};
const cases = fixtures.cases as Case[];

describe('LLM guard fixtures', () => {
  it('has at least 30 cases across the three languages', () => {
    expect(cases.length).toBeGreaterThanOrEqual(30);
    for (const lang of ['en', 'fil', 'taglish'] as const)
      expect(cases.filter((item) => item.lang === lang).length).toBeGreaterThanOrEqual(10);
  });

  it.each(cases)('prompt for $id keeps the message as inert data ($why)', (item) => {
    const user = buildMessages({
      level: item.level,
      lang: item.lang,
      signals: [],
      text: item.message,
    })[1].content;
    const body = user.split('<<<\n')[1].split('\n>>>')[0];
    expect(body).not.toContain('<<<');
    expect(body).not.toContain('>>>');
    expect(body).not.toMatch(/```/);
    expect(body).not.toMatch(/^\s*(?:system|assistant)\s*:/im);
    expect(body).not.toMatch(/<\|/);
    if (item.strip) expect(body.toLowerCase()).not.toContain(item.strip.toLowerCase());
  });

  it.each(cases)('guard for $id: $expect ($why)', (item) => {
    const result = validateLlmOutput(item.output, { level: item.level, lang: item.lang });
    if (item.expect === 'accept') expect(result).not.toBeNull();
    else expect(result).toBeNull();
  });
});
