// OWNER: model. Measures how well embedding similarity separates scams from legit messages.
// Usage: node eval/probe.mjs   (downloads the int8 model once, then caches it)
// The messages in probe-messages.json are written separately from the archetype phrasings.
import { readFileSync } from 'node:fs';
import { pipeline } from '@huggingface/transformers';

const MODEL = 'Xenova/multilingual-e5-small';
const archetypes = JSON.parse(readFileSync('src/data/archetypes.json', 'utf8')).archetypes;
const messages = JSON.parse(readFileSync('eval/probe-messages.json', 'utf8'));

const extractor = await pipeline('feature-extraction', MODEL, { dtype: 'q8' });
async function embed(texts, kind) {
  const out = await extractor(
    texts.map((t) => `${kind}: ${t}`),
    { pooling: 'mean', normalize: true },
  );
  const dim = out.dims[1];
  return texts.map((_, i) => out.data.slice(i * dim, (i + 1) * dim));
}
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0); // vectors are normalized

const flat = archetypes.flatMap((a) => a.phrases.map((phrase) => ({ id: a.id, phrase })));
const index = (
  await embed(
    flat.map((f) => f.phrase),
    'passage',
  )
).map((vector, i) => ({
  id: flat[i].id,
  vector,
}));
const queries = await embed(
  messages.map((m) => m.text),
  'query',
);

const rows = messages.map((m, i) => {
  const best = new Map();
  for (const e of index) best.set(e.id, Math.max(best.get(e.id) ?? -1, dot(queries[i], e.vector)));
  const top = [...best].sort((a, b) => b[1] - a[1]).slice(0, 3);
  return { ...m, top };
});

let hitTop1 = 0;
let hitTop3 = 0;
let scams = 0;
for (const r of rows) {
  const ids = r.top.map((t) => t[0]);
  const mark = r.expect
    ? ids[0] === r.expect
      ? 'TOP1'
      : ids.includes(r.expect)
        ? 'TOP3'
        : 'MISS'
    : 'legit';
  if (r.expect) {
    scams++;
    if (ids[0] === r.expect) hitTop1++;
    if (ids.includes(r.expect)) hitTop3++;
  }
  console.log(
    `${r.id} ${r.lang.padEnd(7)} ${mark.padEnd(5)} best=${r.top[0][1].toFixed(3)} ${r.top.map((t) => `${t[0]}:${t[1].toFixed(2)}`).join(' ')}`,
  );
}
const scamBest = rows.filter((r) => r.expect).map((r) => r.top[0][1]);
const legitBest = rows.filter((r) => !r.expect).map((r) => r.top[0][1]);
const stat = (xs) => `min ${Math.min(...xs).toFixed(3)} max ${Math.max(...xs).toFixed(3)}`;
console.log(`\ntop1 ${hitTop1}/${scams}, top3 ${hitTop3}/${scams}`);
console.log(`scam best-similarity: ${stat(scamBest)}`);
console.log(`legit best-similarity: ${stat(legitBest)}`);
