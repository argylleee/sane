// OWNER: model. Screenshot preparation and cleanup for OCR. Everything stays in memory: nothing is
// stored or sent. The pure helpers are unit-tested; preprocessImage needs a browser canvas.

const MIN_LONG_SIDE = 1200; // below this, upscale: small text is the main cause of messy OCR
const MAX_LONG_SIDE = 2600; // above this, downscale: very large images are slow and not more accurate
const DARK_MEAN_LUMINANCE = 0.45;

export function targetSize(width: number, height: number): { width: number; height: number } {
  const long = Math.max(width, height);
  let scale = 1;
  if (long < MIN_LONG_SIDE) scale = Math.min(3, MIN_LONG_SIDE / long);
  else if (long > MAX_LONG_SIDE) scale = MAX_LONG_SIDE / long;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** Mean luminance 0..1, sampling every few pixels. */
export function meanLuminance(rgba: Uint8ClampedArray, step = 16): number {
  let sum = 0;
  let count = 0;
  for (let i = 0; i + 2 < rgba.length; i += 4 * step) {
    sum += 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
    count += 1;
  }
  return count === 0 ? 1 : sum / count / 255;
}

/** Dark-theme chats have light text on a dark background, which Tesseract reads poorly. */
export function isDarkImage(rgba: Uint8ClampedArray): boolean {
  return meanLuminance(rgba) < DARK_MEAN_LUMINANCE;
}

/** Grayscale and contrast-stretch in place (2nd to 98th percentile), inverting dark images. */
export function enhanceInPlace(rgba: Uint8ClampedArray, invert: boolean): void {
  const gray = new Uint8ClampedArray(rgba.length / 4);
  const histogram = new Uint32Array(256);
  for (let i = 0, p = 0; i + 2 < rgba.length; i += 4, p += 1) {
    const value = Math.round(0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]);
    gray[p] = value;
    histogram[value] += 1;
  }
  const total = gray.length;
  const percentile = (fraction: number) => {
    let seen = 0;
    for (let level = 0; level < 256; level += 1) {
      seen += histogram[level];
      if (seen >= total * fraction) return level;
    }
    return 255;
  };
  const low = percentile(0.02);
  const high = Math.max(low + 1, percentile(0.98));
  for (let i = 0, p = 0; p < gray.length; i += 4, p += 1) {
    let value = Math.round(((gray[p] - low) / (high - low)) * 255);
    value = Math.min(255, Math.max(0, value));
    if (invert) value = 255 - value;
    rgba[i] = rgba[i + 1] = rgba[i + 2] = value;
    rgba[i + 3] = 255;
  }
}

// Zero-width and byte-order-mark characters, built from code points to keep the source plain ASCII.
const ZERO_WIDTH = new RegExp(
  `[${String.fromCharCode(0x200b)}-${String.fromCharCode(0x200f)}${String.fromCharCode(0xfeff)}]`,
  'gu',
);

const NOISE_LINES = [
  /^\d{1,2}[:.]\d{2}(?:\s?[ap]\.?m\.?)?$/i, // clock
  /^\d{1,3}\s?%$/, // battery
  /^(?:lte|5g|4g|3g|2g|wi-?fi|vo\s?lte|volte|r|h\+?)$/i, // signal indicators
  /^(?:delivered|seen|sent|typing\.{0,3}|type a message|message|aa|today|yesterday|now|online|active now)$/i,
  /^[\W_]{1,6}$/u, // stray punctuation, bubbles and arrows
];

/** Removes status-bar and chat-chrome lines and low-quality fragments. Keeps real message text. */
export function cleanOcrText(text: string): string {
  const lines = text
    .normalize('NFKC')
    .replace(ZERO_WIDTH, '')
    .split(/\r?\n/u)
    .map((line) => line.replace(/\s+/gu, ' ').trim())
    .filter((line) => line.length > 0)
    .filter((line) => !NOISE_LINES.some((pattern) => pattern.test(line)))
    .filter((line) => {
      const alnum = line.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
      return line.length >= 8 || alnum / line.length >= 0.5; // short, mostly symbols: garbage
    });
  return lines.join('\n');
}

/**
 * Scales, grays, contrast-stretches and (for dark themes) inverts the screenshot, and returns a PNG
 * blob. Any failure returns the original file so OCR can still try.
 */
export async function preprocessImage(file: File): Promise<Blob> {
  try {
    if (typeof createImageBitmap === 'undefined') return file;
    const bitmap = await createImageBitmap(file);
    const { width, height } = targetSize(bitmap.width, bitmap.height);
    const canvas =
      typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(width, height)
        : Object.assign(document.createElement('canvas'), { width, height });
    const context = canvas.getContext('2d', { willReadFrequently: true }) as
      CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const pixels = context.getImageData(0, 0, width, height);
    enhanceInPlace(pixels.data, isDarkImage(pixels.data));
    context.putImageData(pixels, 0, 0);
    if ('convertToBlob' in canvas) return await canvas.convertToBlob({ type: 'image/png' });
    return await new Promise<Blob>((resolve, reject) =>
      (canvas as HTMLCanvasElement).toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the image.'))),
        'image/png',
      ),
    );
  } catch {
    return file;
  }
}
