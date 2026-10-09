import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import { it } from 'vitest';
import { cleanOcrText } from '../../src/ai/ocrPreprocess';
import { characterErrorRate, wordErrorRate } from './metrics';

// Opt-in, Node only: EVAL_OCR=1 OCR_DIR=<folder> (folder holds shot.png and shot.txt pairs of invented
// messages; never real private ones). Reports raw versus cleaned text error rates. Canvas preprocessing
// (scaling, grayscale, dark-theme inversion) needs a browser and is not measured here.
it.skipIf(process.env.EVAL_OCR !== '1')(
  'compares raw OCR with cleaned OCR text',
  async () => {
    const dir = process.env.OCR_DIR;
    if (!dir || !existsSync(dir))
      throw new Error('Set OCR_DIR to a folder of image and .txt pairs.');
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker(['eng', 'fil']);
    const rows: {
      name: string;
      rawCer: number;
      cleanCer: number;
      rawWer: number;
      cleanWer: number;
    }[] = [];
    for (const file of readdirSync(dir).filter((name) => /\.(png|jpe?g|webp)$/iu.test(name))) {
      const truthPath = join(dir, `${parse(file).name}.txt`);
      if (!existsSync(truthPath)) continue;
      const truth = readFileSync(truthPath, 'utf8');
      const { data } = await worker.recognize(join(dir, file));
      const clean = cleanOcrText(data.text);
      rows.push({
        name: file,
        rawCer: characterErrorRate(truth, data.text),
        cleanCer: characterErrorRate(truth, clean),
        rawWer: wordErrorRate(truth, data.text),
        cleanWer: wordErrorRate(truth, clean),
      });
    }
    await worker.terminate();
    const mean = (key: 'rawCer' | 'cleanCer' | 'rawWer' | 'cleanWer') =>
      rows.reduce((sum, row) => sum + row[key], 0) / Math.max(1, rows.length);
    const summary = {
      images: rows.length,
      rawCer: mean('rawCer'),
      cleanCer: mean('cleanCer'),
      rawWer: mean('rawWer'),
      cleanWer: mean('cleanWer'),
      rows,
    };
    if (process.env.OCR_OUTPUT)
      writeFileSync(process.env.OCR_OUTPUT, JSON.stringify(summary, null, 2));
    console.log(JSON.stringify({ ...summary, rows: undefined }));
  },
  600_000,
);
