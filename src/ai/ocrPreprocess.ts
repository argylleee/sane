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

const CLOCK = String.raw`\d{1,2}[:.]\d{2}(?:\s?[ap]\.?\s?m\.?)?`;
const DAY = String.raw`(?:today|yesterday|ngayon|kahapon|mon|tue|wed|thu|fri|sat|sun)[a-z]*`;
const MONTH = String.raw`(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}(?:,?\s+\d{4})?`;

const NOISE_LINES = [
  new RegExp(`^${CLOCK}$`, 'i'), // clock
  // Whole status bar on one line ("9:41 al 5G 87%"): a clock plus short tokens and battery/signal.
  new RegExp(
    `^${CLOCK}(?=.*(?:\\d{1,3}\\s?%|\\b(?:lte|5g|4g|3g|wi-?fi)\\b))(?:\\s+[\\w%+.!|-]{1,4}){1,6}$`,
    'i',
  ),
  new RegExp(`^(?:${DAY}|${MONTH})(?:,?\\s*(?:at\\s+)?${CLOCK})?$`, 'i'), // date separators
  new RegExp(
    `^(?:text message|sms|mms|imessage|rcs message|chat)(?:\\s*[-\u2022\u00b7]\\s*.*)?$`,
    'i',
  ),
  new RegExp(`^(?:read|delivered|seen|sent)(?:\\s+(?:by\\b.*|at\\s+)?${CLOCK}?)?$`, 'i'),
  /^\d{1,3}\s?%$/, // battery
  /^(?:lte|5g|4g|3g|2g|wi-?fi|vo\s?lte|volte|r|h\+?)(?:\s+(?:lte|5g|4g|\d{1,3}\s?%))*$/i, // signal
  /^(?:delivered|seen|sent|typing\.{0,3}|type a message|write a message|text message|message|aa|today|yesterday|now|online|active now|reply|forward|copy|more|back|<\s*back|messages|chats|search|send|tap to load preview|mark as read|details|info)$/i,
  /^[\W_]{1,6}$/u, // stray punctuation, bubbles and arrows
];

// Bubble borders, avatars and icons that Tesseract reads as symbols at the edge of a line.
// "*" and "#" are kept: they are part of USSD codes such as *143#.
const EDGE_JUNK =
  /^[|[\]{}<>\u00ab\u00bb\u00a9\u00ae\u00b0\u2022\u00b7~_=\\]+\s*|\s*[|[\]{}<>\u00ab\u00bb\u00a9\u00ae\u00b0\u2022\u00b7~_=\\]+$/gu;
// A time stamp printed at the end of a chat bubble, after the sentence ended, or with read ticks.
const TRAILING_TIME = new RegExp(
  `(?<=[.!?)])\\s+${CLOCK}\\s*[\u2713\u2714]{0,2}$|\\s+${CLOCK}\\s*[\u2713\u2714]{1,2}$`,
  'iu',
);
// Only endings that are not also everyday English or Filipino words ("at", "in", "to", "me", "co").
const TLD =
  'com|ph|net|org|gov|edu|ly|xyz|top|vip|io|link|online|site|club|info|biz|shop|cc|click|icu|buzz|cfd|sbs|tk';
// After "word. " only endings that never start a sentence, so "done. shop now" stays two words.
const SPACED_TLD = 'com|ph|net|org|gov|ly|xyz|io|tk|icu|cfd|sbs|vip|biz|cc';
// Filipino prefixes that keep their hyphen when OCR splits them across lines (i-click, mag-load).
const PREFIX_HYPHEN =
  /(?:^|\s)(?:i|mag|nag|pag|ka|ma|na|pa|ipa|maki|paki|nakiki|naka|pinaka|mala)-$/iu;

/** Repairs OCR spacing and character mistakes that break links, codes and keywords. */
export function repairOcrLine(line: string): string {
  return (
    line
      .replace(/[\u2018\u2019\u201a\u2032]/gu, "'")
      .replace(/[\u201c\u201d\u201e\u2033]/gu, '"')
      .replace(/[\u2010-\u2015\u2212]/gu, '-')
      .replace(/\u2026/gu, '...')
      .replace(EDGE_JUNK, '')
      .replace(TRAILING_TIME, '')
      .replace(/\b(https?)\s*:\s*\/\s*\/\s*/giu, '$1://')
      .replace(/\bwww\s*[.,]\s*/giu, 'www.')
      // "gcash . com", "gcash. com/ph", "bit.ly / abc": lowercase only, as links are read lowercase.
      .replace(
        new RegExp(`([\\p{Ll}\\p{N}-])\\.\\s+(${SPACED_TLD})\\b(?![\\p{L}\\p{N}])`, 'gu'),
        '$1.$2',
      )
      .replace(new RegExp(`([\\p{Ll}\\p{N}-])\\s+\\.\\s*(${TLD})\\b`, 'gu'), '$1.$2')
      .replace(new RegExp(`(\\.(?:${TLD}))\\s+/\\s*`, 'gu'), '$1/')
      .replace(/(\p{L})\|(\p{L})/gu, '$1l$2') // "G|obe" -> "Globe"
      .replace(/(^|\s)\|(?=\p{Ll})/gu, '$1I') // "|f you" -> "If you"
      .replace(/\b0(TP|tp)\b/gu, 'O$1') // "0TP" -> "OTP"
      .replace(/\b(M?)P[1l|]N\b/gu, '$1PIN')
      .replace(/\s+/gu, ' ')
      .trim()
  );
}

function isGarbage(line: string): boolean {
  const alnum = line.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  if (line.length < 8 && alnum / line.length < 0.5) return true; // short, mostly symbols
  if (alnum / line.length < 0.4) return true; // mostly symbols at any length
  const tokens = line.split(' ');
  const singles = tokens.filter((token) => /^[\p{L}\W]$/u.test(token)).length;
  return tokens.length >= 3 && singles / tokens.length >= 0.6; // "a | e i" icon noise
}

const URL_CONTINUES = /(?:https?:\/\/|www\.)\S*[/\-.=?&_]$/iu;

/** Joins lines that a chat bubble wrapped, keeping a break after a finished sentence. */
function reflow(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    const previous = out.at(-1);
    if (previous === undefined) {
      out.push(line);
      continue;
    }
    if (URL_CONTINUES.test(previous)) out[out.length - 1] = previous + line;
    else if (PREFIX_HYPHEN.test(previous)) out[out.length - 1] = previous + line;
    else if (/\p{Ll}-$/u.test(previous) && /^\p{Ll}/u.test(line))
      out[out.length - 1] = previous.slice(0, -1) + line; // "veri-" + "fy"
    else if (/[.!?:;"')]$/u.test(previous) && !/^\p{Ll}/u.test(line)) out.push(line);
    else out[out.length - 1] = `${previous} ${line}`;
  }
  return out;
}

/**
 * Turns raw Tesseract output into readable message text: drops status-bar and chat-chrome lines,
 * repairs broken links and common character mistakes, rejoins wrapped bubble lines, and keeps
 * paragraph breaks. Real message words are never rewritten beyond spacing and obvious OCR errors.
 */
export function cleanOcrText(text: string): string {
  const paragraphs = text
    .normalize('NFKC')
    .replace(ZERO_WIDTH, '')
    .split(/\r?\n\s*\r?\n/u)
    .map((paragraph) =>
      reflow(
        paragraph
          .split(/\r?\n/u)
          .map((line) => line.replace(/\s+/gu, ' ').trim())
          .filter((line) => line.length > 0 && !NOISE_LINES.some((p) => p.test(line)))
          .map(repairOcrLine)
          .filter(
            (line) => line.length > 0 && !NOISE_LINES.some((p) => p.test(line)) && !isGarbage(line),
          ),
      ),
    )
    .filter((lines) => lines.length > 0);
  const lines = paragraphs.flat();
  // Drop an exact repeat of the previous line (a second read of the same bubble).
  return lines.filter((line, i) => line !== lines[i - 1]).join('\n');
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
