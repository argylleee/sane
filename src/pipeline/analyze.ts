// OWNER: backend (orchestration and fallbacks). Contract: src/types.ts.
import type { AnalyzeInput, AnalyzeOptions, Verdict } from '../types';
import { extractText } from '../ai/ocr';
import { matchWithEvidence, type MatchWithEvidence } from '../ai/match';
import { explain, localizeSignals } from '../explain/templates';
import { runRules } from '../rules';
import { score } from '../score/score';
import { normalize } from './normalize';

function fallback(opts: AnalyzeOptions, ocrFailed = false): Verdict {
  const explanation = explain('not_sure', opts.lang);
  return {
    level: 'not_sure',
    score: 0,
    signals: [],
    matches: [],
    lang: opts.lang,
    explanation: ocrFailed
      ? {
          ...explanation,
          steps: [
            {
              en: 'Could not read the image. Paste the message text instead.',
              fil: 'Hindi mabasa ang larawan. I-paste na lang ang mensahe.',
              taglish: 'Hindi mabasa ang image. I-paste na lang ang message.',
            }[opts.lang],
            ...explanation.steps,
          ],
        }
      : explanation,
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
    let evidence: MatchWithEvidence | null = null;
    try {
      evidence = await matchWithEvidence(text);
    } catch {
      // Fallback 1: embeddings failed, so score from rules only.
    }

    const matches = evidence?.matches ?? [];
    const { level, score: total, archetypeId } = score(signals, matches, evidence?.level);
    const verdict: Verdict = {
      level,
      score: total,
      signals: localizeSignals(signals, opts.lang),
      matches,
      archetypeId,
      lang: opts.lang,
      explanation: { ...explain(level, opts.lang) },
      usedModels: { ocr, embeddings: evidence !== null, llm: false },
    };
    if (opts.useLLM) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const extra = await Promise.race([
          (async () => {
            const { explainWithLlm, archetypes } = await import('../ai');
            return explainWithLlm({
              level,
              lang: opts.lang,
              archetypeName: archetypes.find(({ id }) => id === archetypeId)?.name[opts.lang],
              signals: verdict.signals.map(({ label }) => label),
              text,
            });
          })(),
          new Promise<null>((resolve) => {
            timer = setTimeout(() => resolve(null), 15000);
          }),
        ]);
        if (extra !== null) {
          verdict.explanation.extra = extra;
          verdict.usedModels.llm = true;
        }
      } catch {
        // The optional explanation must never replace the computed verdict.
      } finally {
        clearTimeout(timer);
      }
    }
    return verdict;
  } catch {
    return fallback(opts, 'image' in input); // Fallback 4: never show a blank screen.
  }
}
