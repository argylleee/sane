// OWNER: backend. Stub: strips zero-width characters and normalizes Unicode.
const ZERO_WIDTH = new RegExp('[\\u200B-\\u200D\\uFEFF]', 'g');

export function normalize(text: string): string {
  return text.normalize('NFKC').replace(ZERO_WIDTH, '').trim();
}
