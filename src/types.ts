// Shared contract from .agents/skills/architecture. Integration owns this file.
// Change it only through a serialized shared change; all three streams build against it.
export type Lang = 'en' | 'fil' | 'taglish';

export type Level = 'likely_scam' | 'suspicious' | 'probably_fine' | 'not_sure';

export type Signal = { id: string; label: string; weight: number; span?: [number, number] };

export type Match = { archetypeId: string; similarity: number };

export type Verdict = {
  level: Level;
  score: number; // 0..100
  signals: Signal[];
  matches: Match[]; // top 3
  archetypeId?: string;
  lang: Lang;
  explanation: { headline: string; steps: string[]; extra?: string };
  usedModels: { ocr: boolean; embeddings: boolean; llm: boolean };
};

export type AnalyzeInput = { text: string } | { image: File };

export type AnalyzeOptions = { lang: Lang; useLLM: boolean };
