import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { expect, it, vi } from 'vitest';
import type { Embed } from '../../src/ai/embedder';
import { analyze } from '../../src/pipeline/analyze';
import { summarize, type Case, type Row } from './metrics';
import type { Verdict } from '../../src/types';

// Node adapter replaces only worker transport. Shared matching/scoring use actual model vectors.
const adapter = vi.hoisted(() => ({ embed: undefined as Embed | undefined }));
vi.mock('../../src/ai/embedClient', () => ({
  getEmbeddingsStatus: () => ({ state: adapter.embed ? 'ready' : 'idle', progress: 0 }),
  embedTexts: (texts: string[], kind: 'query' | 'passage') => {
    if (!adapter.embed) throw new Error('No real embedding model loaded.');
    return adapter.embed(texts, kind);
  },
}));

it.skipIf(process.env.EVAL_HELDOUT !== '1')(
  'reports frozen holdout results without an accuracy gate',
  async () => {
    const bytes = readFileSync('eval/heldout/heldout.json');
    const hash = createHash('sha256').update(bytes).digest('hex');
    expect(hash).toBe(
      readFileSync('eval/heldout/README.md', 'utf8').match(/SHA-256: `([a-f0-9]{64})`/)?.[1],
    );
    const cases = JSON.parse(bytes.toString('utf8')) as Case[];
    async function run(embeddings: boolean) {
      const rows: (Row & {
        score: number;
        signals: string[];
        usedModels: Verdict['usedModels'];
      })[] = [];
      for (const c of cases) {
        const verdict = await analyze({ text: c.text }, { lang: c.lang, useLLM: false });
        // A silent model/pipeline fallback must not be counted as an embedding run.
        expect(verdict.usedModels.embeddings, c.id).toBe(embeddings);
        rows.push({
          id: c.id,
          lang: c.lang,
          expected: c.expected,
          actual: verdict.level,
          score: verdict.score,
          signals: verdict.signals.map((s) => s.id),
          usedModels: verdict.usedModels,
        });
      }
      return {
        overall: summarize(rows),
        perLanguage: Object.fromEntries(
          ['en', 'fil', 'taglish'].map((lang) => [
            lang,
            summarize(rows.filter((r) => r.lang === lang)),
          ]),
        ),
        rows,
      };
    }
    adapter.embed = undefined;
    const rulesOnly = await run(false);
    let embeddings: { status: string; reason?: string; results?: Awaited<ReturnType<typeof run>> } =
      {
        status: 'unmeasured',
        reason: 'EVAL_EMBEDDINGS=1 not requested; Node has no browser worker.',
      };
    if (process.env.EVAL_EMBEDDINGS === '1') {
      try {
        const { env } = await import('@huggingface/transformers');
        env.allowRemoteModels = false;
        const { createEmbedder } = await import('../../src/ai/embedder');
        adapter.embed = await createEmbedder(undefined, 'cpu');
      } catch (error) {
        embeddings = {
          status: 'unmeasured',
          reason: error instanceof Error ? error.message : String(error),
        };
      }
      if (adapter.embed) embeddings = { status: 'measured-node-cpu', results: await run(true) };
    }
    const report = {
      datasetHash: hash,
      detectorRevision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      rulesOnly,
      embeddings,
    };
    const output = `${JSON.stringify(report, null, 2)}\n`;
    console.log(output);
    if (process.env.HELDOUT_OUTPUT) writeFileSync(process.env.HELDOUT_OUTPUT, output);
  },
  300000,
);
