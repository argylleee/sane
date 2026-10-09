import { describe, expect, it } from 'vitest';
import { analyze } from './analyze';

describe('analyze fallbacks', () => {
  it('returns not_sure for empty text', async () => {
    const verdict = await analyze({ text: '   ' }, { lang: 'en', useLLM: false });
    expect(verdict.level).toBe('not_sure');
    expect(verdict.usedModels).toEqual({ ocr: false, embeddings: false, llm: false });
  });

  it('returns not_sure instead of throwing when OCR is unavailable', async () => {
    const image = new Blob(['x']) as File;
    const verdict = await analyze({ image }, { lang: 'fil', useLLM: false });
    expect(verdict.level).toBe('not_sure');
    expect(verdict.lang).toBe('fil');
  });
});
