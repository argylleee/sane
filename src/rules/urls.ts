import brands from '../data/brands.json';
import keywords from '../data/keywords.json';
import type { Signal } from '../types';

const URL_TEXT = /https?:\/\/[^\s<>"']+|(?:[\p{L}\p{N}-]+\.)+[\p{L}]{2,}(?:\/[^\s<>"']*)?/giu;

export function urlSignals(text: string): Signal[] {
  const signals: Signal[] = [];
  for (const match of text.matchAll(URL_TEXT)) {
    const value = match[0].replace(/[),.!?;:]+$/, '');
    if (!value) continue;
    let host: string;
    try {
      host = new URL(
        /^https?:\/\//i.test(value) ? value : 'https://' + value,
      ).hostname.toLowerCase();
    } catch {
      continue;
    }
    const rawHost = value
      .replace(/^https?:\/\//i, '')
      .split(/[/?#]/, 1)[0]
      .toLowerCase();
    const compactHost = rawHost
      .replace(/0/g, 'o')
      .replace(/5/g, 's')
      .replace(/[^a-z0-9]/g, '');
    const span: [number, number] = [match.index, match.index + value.length];
    if (
      brands.brands.some(
        ({ name, domains }) =>
          compactHost.includes(name) &&
          !domains.some((domain) => host === domain || host.endsWith('.' + domain)),
      ) &&
      !signals.some((signal) => signal.id === 'lookalike_domain')
    ) {
      signals.push({
        id: 'lookalike_domain',
        label: 'Brand-like link outside its known domain',
        weight: 35,
        span,
      });
    }
    if (
      (keywords.shorteners.includes(host) ||
        keywords.suspicious_tlds.some((tld) => host.endsWith('.' + tld))) &&
      !signals.some((signal) => signal.id === 'suspicious_link')
    ) {
      signals.push({
        id: 'suspicious_link',
        label: 'Shortened link or unusual domain ending',
        weight: 15,
        span,
      });
    }
  }
  return signals;
}
