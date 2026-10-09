// OWNER: backend. All matching is local and never opens a message link.
import keywords from '../data/keywords.json';
import type { Signal } from '../types';
import { urlSignals } from './urls';

const WORD = /[\p{L}\p{N}]/u;
const SAFE_CREDENTIAL =
  /(?:do not|don't|never|huwag|wag)\s+(?:share|ibigay|i-share|sabihin|ibabahagi).{0,30}\b(?:otp|pin|mpin|code|password)\b/giu;
const CREDENTIAL_REQUEST =
  /\b(?:send|share|give|provide|enter|submit|reply|confirm|verify|ibigay|isend|i-send|pakisend|pakisabi|sabihin|ilagay|i-share|pa-send)\b.{0,35}\b(?:otp|pin|mpin|password|code)\b/giu;

function phraseSpan(text: string, phrases: string[]): [number, number] | undefined {
  const lower = text.toLocaleLowerCase();
  for (const phrase of phrases) {
    let at = lower.indexOf(phrase);
    while (at >= 0) {
      const end = at + phrase.length;
      if (!WORD.test(lower[at - 1] ?? '') && !WORD.test(lower[end] ?? '')) return [at, end];
      at = lower.indexOf(phrase, at + 1);
    }
  }
}

export function runRules(text: string): Signal[] {
  const signals = urlSignals(text);
  const safe = [...text.matchAll(SAFE_CREDENTIAL)];
  const request = [...text.matchAll(CREDENTIAL_REQUEST)].find(
    (match) =>
      !safe.some(
        (notice) =>
          match.index >= notice.index &&
          match.index + match[0].length <= notice.index + notice[0].length,
      ),
  );
  if (request) {
    signals.push({
      id: 'otp_pin_request',
      label: 'Asks for a one-time code or password',
      weight: 35,
      span: [request.index, request.index + request[0].length],
    });
  } else if (safe.length) {
    const notice = safe[0];
    signals.push({
      id: 'safe_credential_notice',
      label: 'Says not to share a code',
      weight: 0,
      span: [notice.index, notice.index + notice[0].length],
    });
  }
  const groups = [
    ['urgency', 'Pressures you to act quickly', 12],
    ['account_threat', 'Threatens account access', 15],
    ['money_request', 'Asks for money or a fee', 15],
    ['prize_or_job_bait', 'Promises a prize or easy income', 15],
    ['relative_claims', 'Claims a relative has a new number', 20],
  ] as const;
  for (const [id, label, weight] of groups) {
    const span = phraseSpan(text, keywords[id]);
    if (span) signals.push({ id, label, weight, span });
  }
  return signals;
}
