// OWNER: model. Embedding similarity of a message against the hand-written scam archetypes.
import type { Match } from '../types';
import { getArchetypeIndex } from './archetypeIndex';
import { embedTexts, getEmbeddingsStatus } from './embedClient';
import { topMatches } from './vector';

/**
 * A "strong match" threshold, measured with `node eval/probe.mjs` (20 messages, pilot only):
 * legit messages peaked at 0.893 and scams ranged 0.866 to 0.935, so the ranges OVERLAP.
 * Similarity tells us WHICH scam pattern a message resembles, not WHETHER it is a scam.
 * Use a best match at or above this value as supporting evidence of a scam. A lower value is
 * NOT evidence of safety: never let it produce `probably_fine` on its own. Rules decide the verdict.
 */
export const SIMILARITY_FLOOR = 0.9;

/**
 * Top 3 archetypes by similarity (unfiltered, so the UI can show them). Returns [] when the
 * embedding model is not loaded yet, which analyze() treats as the rules-only fallback.
 */
export async function matchArchetypes(text: string): Promise<Match[]> {
  if (getEmbeddingsStatus().state !== 'ready') return [];
  const [query] = await embedTexts([text], 'query');
  return topMatches(query, await getArchetypeIndex(), 3);
}
