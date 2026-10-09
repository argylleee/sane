import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { it } from 'vitest';
import testset from '../testset.json';
import { SIMILARITY_FLOOR } from '../../src/ai/match';
import { BENIGN_ID, embeddingEvidence, evidenceLevel, type IndexEntry } from '../../src/ai/vector';

// Opt-in (EVAL_ARCHETYPES=1, needs the embedding model in the local cache; remote loading is off).
// Compares the committed archetype file with the baseline on origin/main using ONLY the development set
// (eval/testset.json): how many scams and how many ordinary messages would be flagged by the embedding
// evidence at SIMILARITY_FLOOR. It reads no held-out data and changes nothing.
type Archetypes = { archetypes: { id: string; phrases: string[] }[]; benign: string[] };
type Row = { id: string; lang: string; expected: string; text: string };

it.skipIf(process.env.EVAL_ARCHETYPES !== '1')(
  'compares archetype files on the development set',
  async () => {
    const { env } = await import('@huggingface/transformers');
    env.allowRemoteModels = false;
    const { createEmbedder } = await import('../../src/ai/embedder');
    const embed = await createEmbedder(undefined, 'cpu');
    const rows = testset as Row[];
    const queries = await embed(
      rows.map((row) => row.text),
      'query',
    );

    async function measure(data: Archetypes) {
      const flat = [
        ...data.archetypes.flatMap((a) => a.phrases.map((text) => ({ id: a.id, text }))),
        ...data.benign.map((text) => ({ id: BENIGN_ID, text })),
      ];
      const vectors = await embed(
        flat.map((item) => item.text),
        'passage',
      );
      const index: IndexEntry[] = flat.map((item, i) => ({
        archetypeId: item.id,
        vector: vectors[i],
      }));
      const flagged = rows.map((row, i) => {
        const evidence = embeddingEvidence(queries[i], index);
        const best = evidence.matches[0]?.similarity ?? 0;
        return {
          ...row,
          best,
          flagged: evidenceLevel(evidence.margin) !== 'none' && best >= SIMILARITY_FLOOR,
        };
      });
      const count = (pred: (r: (typeof flagged)[number]) => boolean) => flagged.filter(pred).length;
      const scams = flagged.filter((r) => r.expected !== 'probably_fine');
      const legit = flagged.filter((r) => r.expected === 'probably_fine');
      const byLang = Object.fromEntries(
        ['en', 'fil', 'taglish'].map((lang) => [
          lang,
          {
            scamsFlagged: `${scams.filter((r) => r.lang === lang && r.flagged).length}/${scams.filter((r) => r.lang === lang).length}`,
            legitFlagged: `${legit.filter((r) => r.lang === lang && r.flagged).length}/${legit.filter((r) => r.lang === lang).length}`,
          },
        ]),
      );
      return {
        scamsFlagged: `${count((r) => r.expected !== 'probably_fine' && r.flagged)}/${scams.length}`,
        legitFlagged: `${count((r) => r.expected === 'probably_fine' && r.flagged)}/${legit.length}`,
        maxLegitSimilarity: Math.max(...legit.map((r) => r.best)).toFixed(3),
        minScamSimilarity: Math.min(...scams.map((r) => r.best)).toFixed(3),
        byLang,
      };
    }

    const current = JSON.parse(readFileSync('src/data/archetypes.json', 'utf8')) as Archetypes;
    const baseline = JSON.parse(
      execFileSync('git', ['show', 'origin/main:src/data/archetypes.json'], { encoding: 'utf8' }),
    ) as Archetypes;
    const result = {
      floor: SIMILARITY_FLOOR,
      baseline: await measure(baseline),
      current: await measure(current),
    };
    if (process.env.ARCHETYPES_OUTPUT)
      writeFileSync(process.env.ARCHETYPES_OUTPUT, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
  },
  300_000,
);
