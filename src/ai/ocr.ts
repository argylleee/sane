// OWNER: model. Screenshot to text with Tesseract.js (eng + fil), loaded lazily on first use.
// Tesseract manages its own Web Worker. analyze() treats any throw here as "ask the user to paste".
const OCR_TIMEOUT_MS = 20000;
const MIN_TEXT_LENGTH = 10;

type TesseractWorker = {
  recognize: (image: File) => Promise<{ data: { text: string } }>;
  terminate: () => Promise<unknown>;
};

let workerPromise: Promise<TesseractWorker> | undefined;

function getWorker(): Promise<TesseractWorker> {
  workerPromise ??= import('tesseract.js')
    .then(({ createWorker }) => createWorker(['eng', 'fil']) as Promise<TesseractWorker>)
    .catch((error) => {
      workerPromise = undefined; // allow a later retry
      throw error;
    });
  return workerPromise;
}

export async function extractText(image: File): Promise<string> {
  if (typeof Worker === 'undefined') throw new Error('OCR needs a browser environment.');
  const worker = await getWorker();
  const result = await Promise.race([
    worker.recognize(image),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('OCR timed out.')), OCR_TIMEOUT_MS),
    ),
  ]);
  const text = result.data.text.trim();
  if (text.length < MIN_TEXT_LENGTH) throw new Error('Not enough text found in the image.');
  return text;
}
