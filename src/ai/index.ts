// OWNER: model. Public surface of the AI layer for the UI and pipeline.
export { detectCapabilities, type Capabilities, type Tier } from './capabilities';
export {
  getEmbeddingsStatus,
  loadEmbeddings,
  subscribeEmbeddings,
  type EmbeddingsStatus,
} from './embedClient';
export { matchArchetypes, SIMILARITY_FLOOR } from './match';
export { archetypes, type Archetype } from './archetypeIndex';
