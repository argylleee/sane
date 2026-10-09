// OWNER: backend. Signal spans refer to this normalized copy of the input.
const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;
const CONFUSABLES: Record<string, string> = {
  а: 'a',
  е: 'e',
  о: 'o',
  р: 'p',
  с: 'c',
  х: 'x',
  у: 'y',
  і: 'i',
  ӏ: 'l',
};

export function normalize(text: string): string {
  return text
    .normalize('NFKC')
    .replace(ZERO_WIDTH, '')
    .replace(/[аеорсхуіӏ]/g, (char) => CONFUSABLES[char])
    .trim();
}
