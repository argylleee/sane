import { describe, expect, it } from 'vitest';
import { createProgressTracker, EXPECTED_FILE_BYTES } from './progress';

const MODEL = 'onnx/model_quantized.onnx';

describe('createProgressTracker', () => {
  it('weights files by size and never goes backwards', () => {
    const track = createProgressTracker();
    track({ status: 'progress', file: 'tokenizer.json', loaded: 1_000, total: 17_082_730 });
    const early = track({
      status: 'progress',
      file: MODEL,
      loaded: 59_000_000,
      total: 118_308_185,
    });
    expect(early).toBeGreaterThan(35);
    expect(early).toBeLessThan(50);
    // A small file starting at 0% must not drag the overall value down.
    expect(track({ status: 'progress', file: 'config.json', loaded: 0, total: 658 })).toBe(early);
    expect(track({ status: 'progress', file: MODEL, loaded: 30_000_000, total: 118_308_185 })).toBe(
      early,
    );
  });

  it('uses the percentage when byte counts are missing and reaches near 100 when files are done', () => {
    const track = createProgressTracker();
    expect(track({ status: 'progress', file: MODEL, progress: 50 })).toBeGreaterThan(30);
    for (const file of Object.keys(EXPECTED_FILE_BYTES)) track({ status: 'done', file });
    expect(track({ status: 'ready' })).toBe(99); // the client sets 100 only when the model is ready
  });

  it('ignores files it does not know', () => {
    const track = createProgressTracker();
    expect(track({ status: 'progress', file: 'other/file.bin', loaded: 5, total: 10 })).toBe(0);
  });
});
