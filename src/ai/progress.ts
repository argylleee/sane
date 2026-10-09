// OWNER: model. Overall download progress across the model's files (pure, unit-tested).
// transformers.js reports progress per file, which made the UI bounce between 0% and 12%.
import type { LoadProgress } from './embedder';

/** Expected sizes in bytes of the files the embedding model downloads (from the HF file listing). */
export const EXPECTED_FILE_BYTES: Record<string, number> = {
  'onnx/model_quantized.onnx': 118_308_185,
  'tokenizer.json': 17_082_730,
  'config.json': 658,
  'tokenizer_config.json': 443,
};

const TOTAL_EXPECTED = Object.values(EXPECTED_FILE_BYTES).reduce((a, b) => a + b, 0);

function expectedKey(file: string): string | undefined {
  return Object.keys(EXPECTED_FILE_BYTES).find((key) => file.endsWith(key));
}

export type ProgressTracker = (event: LoadProgress) => number;

/** Returns a function that folds progress events into one monotonic 0..100 percentage. */
export function createProgressTracker(): ProgressTracker {
  const loadedByFile = new Map<string, number>();
  let overall = 0;
  return (event) => {
    const key = event.file ? expectedKey(event.file) : undefined;
    if (key) {
      const expected = EXPECTED_FILE_BYTES[key];
      if (event.status === 'done') loadedByFile.set(key, expected);
      else if (typeof event.loaded === 'number') {
        loadedByFile.set(
          key,
          Math.min(expected, Math.max(loadedByFile.get(key) ?? 0, event.loaded)),
        );
      } else if (typeof event.progress === 'number') {
        const bytes = (event.progress / 100) * expected;
        loadedByFile.set(key, Math.min(expected, Math.max(loadedByFile.get(key) ?? 0, bytes)));
      }
    }
    const loaded = [...loadedByFile.values()].reduce((a, b) => a + b, 0);
    overall = Math.max(overall, Math.min(99, Math.floor((loaded / TOTAL_EXPECTED) * 100)));
    return overall;
  };
}
