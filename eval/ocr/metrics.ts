// Character and word error rates for comparing OCR output with known text.
function distance<T>(a: T[], b: T[]): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = temp;
    }
  }
  return row[b.length];
}

const squash = (text: string) => text.normalize('NFKC').toLowerCase().replace(/\s+/gu, ' ').trim();

export function characterErrorRate(truth: string, read: string): number {
  const a = [...squash(truth)];
  return a.length === 0 ? (read.trim() ? 1 : 0) : distance(a, [...squash(read)]) / a.length;
}

export function wordErrorRate(truth: string, read: string): number {
  const a = squash(truth).split(' ').filter(Boolean);
  return a.length === 0
    ? read.trim()
      ? 1
      : 0
    : distance(a, squash(read).split(' ').filter(Boolean)) / a.length;
}
