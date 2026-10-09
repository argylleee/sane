// OWNER: model. Pure vector math for archetype matching. No browser or model dependencies.
import type { Match } from '../types';

export type IndexEntry = { archetypeId: string; vector: Float32Array };

export function cosine(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) throw new Error('Vector length mismatch.');
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/** Best similarity per archetype (an archetype has several phrasings), highest first. */
export function topMatches(query: Float32Array, index: IndexEntry[], k = 3): Match[] {
  const best = new Map<string, number>();
  for (const entry of index) {
    const similarity = cosine(query, entry.vector);
    const current = best.get(entry.archetypeId);
    if (current === undefined || similarity > current) best.set(entry.archetypeId, similarity);
  }
  return [...best.entries()]
    .map(([archetypeId, similarity]) => ({ archetypeId, similarity }))
    .sort((x, y) => y.similarity - x.similarity)
    .slice(0, k);
}
