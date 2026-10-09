// OWNER: backend (orchestration and fallbacks). Contract: src/types.ts.
import type { AnalyzeInput, AnalyzeOptions, Match, Verdict } from '../types';
import { extractText } from '../ai/ocr';
import { matchArchetypes } from '../ai/match';
import { explain } from '../explain/templates';
import { runRules } from '../rules';
import { score } from '../score/score';
import { normalize } from './normalize';

function fallback(opts: AnalyzeOptions): Verdict {
  return {
    level: 'not_sure',
    score: 0,
    signals: [],
    matches: [],
    lang: opts.lang,
    explanation: explain('not_sure', opts.lang),
    usedModels: { ocr: false, embeddings: false, llm: false },
  };
}

export async function analyze(input: AnalyzeInput, opts: AnalyzeOptions): Promise<Verdict> {
  try {
    let ocr = false;
    let raw: string;
    if ('text' in input) {
      raw = input.text;
    } else {
      raw = await extractText(input.image); // throws -> not_sure; the UI asks the user to paste
      ocr = true;
    }
    const text = normalize(raw);
    if (!text) return fallback(opts);

    const signals = runRules(text);
    let matches: Match[] = [];
    try {
      matches = await matchArchetypes(text);
    } catch {
      // Fallback 1: embeddings failed, so score from rules only.
    }

    const { level, score: total } = score(signals, matches);
    return {
      level,
      score: total,
      signals,
      matches,
      archetypeId: matches[0]?.archetypeId,
      lang: opts.lang,
      explanation: explain(level, opts.lang),
      usedModels: { ocr, embeddings: matches.length > 0, llm: false },
    };
  } catch {
    return fallback(opts); // Fallback 4: never show a blank screen.
  }
}
