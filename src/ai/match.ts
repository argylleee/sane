// OWNER: model. Embedding similarity of a message against the hand-written scam archetypes.
import type { Match } from '../types';
import { getArchetypeIndex } from './archetypeIndex';
import { embedTexts, getEmbeddingsStatus } from './embedClient';
import { topMatches } from './vector';

/**
 * Starting value from the skill notes. e5 similarities are compressed, so tune this on our own
 * messages with `node eval/probe.mjs`. Scoring (backend) treats a best match below the floor as
 * "no strong match", which feeds not_sure.
 */
export const SIMILARITY_FLOOR = 0.8;

/**
 * Top 3 archetypes by similarity (unfiltered, so the UI can show them). Returns [] when the
 * embedding model is not loaded yet, which analyze() treats as the rules-only fallback.
 */
export async function matchArchetypes(text: string): Promise<Match[]> {
  if (getEmbeddingsStatus().state !== 'ready') return [];
  const [query] = await embedTexts([text], 'query');
  return topMatches(query, await getArchetypeIndex(), 3);
}
