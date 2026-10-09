// OWNER: model. Public surface of the AI layer for the UI and pipeline.
export { detectCapabilities, type Capabilities, type Tier } from './capabilities';
export {
  getEmbeddingsStatus,
  loadEmbeddings,
  subscribeEmbeddings,
  type EmbeddingsStatus,
} from './embedClient';
export { shouldAutoPreload, startEmbeddingsPreload } from './preload';
export {
  evidenceLevel,
  matchArchetypes,
  matchWithEvidence,
  MARGIN_MODERATE,
  MARGIN_STRONG,
  SIMILARITY_FLOOR,
  type EvidenceLevel,
  type MatchWithEvidence,
} from './match';
export { archetypes, type Archetype } from './archetypeIndex';
export {
  explainWithLlm,
  getLlmStatus,
  loadLlm,
  subscribeLlm,
  LLM_MODEL_BY_TIER,
  type LlmStatus,
} from './llm';
export { extractText } from './ocr';
