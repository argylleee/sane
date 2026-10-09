// OWNER: model. Pure vector math for archetype matching. No browser or model dependencies.
import type { Match } from '../types';

export type IndexEntry = { archetypeId: string; vector: Float32Array };

/** Reserved id for hand-written examples of ordinary (benign) messages in the index. */
export const BENIGN_ID = '__benign__';

/**
 * Margin = best scam-archetype similarity minus best benign-example similarity.
 * Pilot measurements (30 held-out and 30 development messages, e5-small int8):
 * margin > 0.02 flagged 10/16 held-out scams and 0/14 legit; margin > 0.01 flagged 13/16 and 1/14.
 * Small samples written by the team: treat as evidence, not as an accuracy claim.
 */
export const MARGIN_STRONG = 0.02;
export const MARGIN_MODERATE = 0.01;

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

/** Best similarity per scam archetype (an archetype has several phrasings), highest first. */
export function topMatches(query: Float32Array, index: IndexEntry[], k = 3): Match[] {
  const best = new Map<string, number>();
  for (const entry of index) {
    if (entry.archetypeId === BENIGN_ID) continue;
    const similarity = cosine(query, entry.vector);
    const current = best.get(entry.archetypeId);
    if (current === undefined || similarity > current) best.set(entry.archetypeId, similarity);
  }
  return [...best.entries()]
    .map(([archetypeId, similarity]) => ({ archetypeId, similarity }))
    .sort((x, y) => y.similarity - x.similarity)
    .slice(0, k);
}

/** Highest similarity to any benign example, or null when the index has none. */
export function bestBenign(query: Float32Array, index: IndexEntry[]): number | null {
  let best: number | null = null;
  for (const entry of index) {
    if (entry.archetypeId !== BENIGN_ID) continue;
    const similarity = cosine(query, entry.vector);
    if (best === null || similarity > best) best = similarity;
  }
  return best;
}

export type EmbeddingEvidence = {
  matches: Match[]; // top 3 scam archetypes
  benign: number | null;
  margin: number | null; // null when there are no benign examples or no archetype match
};

export function embeddingEvidence(query: Float32Array, index: IndexEntry[]): EmbeddingEvidence {
  const matches = topMatches(query, index, 3);
  const benign = bestBenign(query, index);
  const margin = benign === null || matches.length === 0 ? null : matches[0].similarity - benign;
  return { matches, benign, margin };
}

export type EvidenceLevel = 'strong' | 'moderate' | 'none';

/** Maps a margin to supporting scam evidence. 'none' is NOT evidence of safety. */
export function evidenceLevel(margin: number | null): EvidenceLevel {
  if (margin === null) return 'none';
  if (margin > MARGIN_STRONG) return 'strong';
  if (margin > MARGIN_MODERATE) return 'moderate';
  return 'none';
}
