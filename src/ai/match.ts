// OWNER: model. Embedding comparison of a message against hand-written scam archetypes and
// ordinary-message examples. Similarity names the likely pattern; it does not decide the verdict.
import type { Match } from '../types';
import { getArchetypeIndex } from './archetypeIndex';
import { embedTexts, getEmbeddingsStatus } from './embedClient';
import {
  embeddingEvidence,
  evidenceLevel,
  type EmbeddingEvidence,
  type EvidenceLevel,
} from './vector';

export { MARGIN_MODERATE, MARGIN_STRONG, evidenceLevel, type EvidenceLevel } from './vector';

/**
 * Best-archetype similarity alone does NOT separate scams from legit messages (held-out pilot:
 * scams 0.852 to 0.906, legit 0.850 to 0.897). Prefer `matchWithEvidence().level`, which compares
 * against benign examples. A lower score is never evidence of safety.
 */
export const SIMILARITY_FLOOR = 0.9;

async function evidenceFor(text: string): Promise<EmbeddingEvidence | null> {
  if (getEmbeddingsStatus().state !== 'ready') return null;
  const [query] = await embedTexts([text], 'query');
  return embeddingEvidence(query, await getArchetypeIndex());
}

/**
 * Top 3 scam archetypes by similarity (unfiltered, so the UI can show them). Returns [] when the
 * embedding model is not loaded yet, which analyze() treats as the rules-only fallback.
 */
export async function matchArchetypes(text: string): Promise<Match[]> {
  return (await evidenceFor(text))?.matches ?? [];
}

export type MatchWithEvidence = EmbeddingEvidence & { level: EvidenceLevel };

/**
 * Matches plus the benign comparison. `level` is 'strong' | 'moderate' supporting scam evidence,
 * or 'none' (no evidence either way). Returns null while the model is not ready.
 */
export async function matchWithEvidence(text: string): Promise<MatchWithEvidence | null> {
  const evidence = await evidenceFor(text);
  return evidence ? { ...evidence, level: evidenceLevel(evidence.margin) } : null;
}
