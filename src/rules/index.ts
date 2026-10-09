// OWNER: backend. All matching is local and never opens a message link.
import keywords from '../data/keywords.json';
import type { Signal } from '../types';
import { hasUrl, urlSignals } from './urls';

const WORD = /[\p{L}\p{N}]/u;
const SAFE_CREDENTIAL =
  /(?:do not|don't|never|huwag|wag)\s+(?:(?:ask\s+(?:you\s+)?to)\s+)?(?:share|send|give|provide|enter|submit|reply|ibigay|i-send|sabihin|ipasa|ibahagi|i-share|ibabahagi)[^.!?;]{0,35}\b(?:otp|pin|mpin|code|password)\b/giu;
const SAFE_PRONOUN =
  /(?:do not|don't|never|huwag|wag)\s+(?:share|send|give|ibigay|i-send|i-share)[^.!?;]{0,20}\b(?:it|ito|yan)\b/giu;
const CREDENTIAL_REQUEST =
  /\b(?:send|share|give|provide|enter|submit|reply|confirm|verify|ibigay|isend|i-send|pakisend|pakisabi|sabihin|ilagay|i-share|pa-send)\b[^.!?;]{0,35}\b(?:otp|pin|mpin|password|code)\b/giu;
const FOLLOWUP_CODE_REQUEST =
  /\b(?:send|share|give|ibigay|i-send|i-share)\b[^.!?;]{0,18}\b(?:it|ito|yan)\b/giu;
const READ_BACK_CODE =
  /\b(?:read back|tell us|tell me|pakisabi)\b.{0,35}\b(?:six|6|anim)\s*[- ]?\s*(?:digit|digits|number|numero)\b/giu;
const PERSONAL_DATA_REQUEST =
  /\b(?:ibigay|send|share|provide|ilagay|submit)\b[^.!?;]{0,60}\b(?:buong pangalan|full name|bank account|account number|numero ng bank account|card number)\b/giu;
const SAFE_PERSONAL_DATA =
  /(?:do not|don't|never|huwag|wag)\s+(?:(?:ask\s+(?:you\s+)?to)\s+)?(?:ibigay|send|share|provide|ilagay|submit)[^.!?;]{0,60}\b(?:buong pangalan|full name|bank account|account number|numero ng bank account|card number)\b/giu;
const LINK_ACTION = /\b(?:pindutin|i-click|click|tap|buksan|open|sa)\b.{0,15}\blink\b/giu;
const COERCION =
  /\b(?:i-text|isasabi|sabihin|expose|report)\b.{0,60}\b(?:family|friends|pamilya|kamag-anak)\b/giu;

function isNegated(text: string, at: number): boolean {
  const clause =
    text
      .slice(Math.max(0, at - 35), at)
      .split(/[.!?;,]/)
      .at(-1) ?? '';
  return /\b(?:do not|don't|never|huwag|wag)\s+(?:(?:ever|muna)\s+)?$/iu.test(clause);
}

function phraseSpan(
  text: string,
  phrases: string[],
  skipNegated = false,
): [number, number] | undefined {
  const lower = text.toLocaleLowerCase();
  for (const phrase of phrases) {
    let at = lower.indexOf(phrase);
    while (at >= 0) {
      const end = at + phrase.length;
      if (
        !WORD.test(lower[at - 1] ?? '') &&
        !WORD.test(lower[end] ?? '') &&
        !(skipNegated && isNegated(text, at))
      )
        return [at, end];
      at = lower.indexOf(phrase, at + 1);
    }
  }
}

export function runRules(text: string): Signal[] {
  const signals = urlSignals(text);
  const hasCredential = /\b(?:otp|pin|mpin|code|password|one-time password)\b/iu.test(text);
  const safe = [
    ...text.matchAll(SAFE_CREDENTIAL),
    ...(hasCredential ? [...text.matchAll(SAFE_PRONOUN)] : []),
  ];
  const request = [
    ...text.matchAll(CREDENTIAL_REQUEST),
    ...text.matchAll(READ_BACK_CODE),
    ...(hasCredential ? [...text.matchAll(FOLLOWUP_CODE_REQUEST)] : []),
  ].find(
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
  } else if (safe.length && !hasUrl(text)) {
    const notice = safe[0];
    signals.push({
      id: 'safe_credential_notice',
      label: 'Says not to share a code',
      weight: 0,
      span: [notice.index, notice.index + notice[0].length],
    });
  }
  const safePersonalData = [...text.matchAll(SAFE_PERSONAL_DATA)];
  const personalData = [...text.matchAll(PERSONAL_DATA_REQUEST)].find(
    (match) =>
      !safePersonalData.some(
        (notice) =>
          match.index >= notice.index &&
          match.index + match[0].length <= notice.index + notice[0].length,
      ),
  );
  if (personalData) {
    signals.push({
      id: 'personal_data_request',
      label: 'Asks for sensitive personal information',
      weight: 35,
      span: [personalData.index, personalData.index + personalData[0].length],
    });
  }
  const linkAction = [...text.matchAll(LINK_ACTION)].find((match) => !isNegated(text, match.index));
  if (linkAction) {
    const at = linkAction.index;
    signals.push({
      id: 'link_action',
      label: 'Directs you to a link',
      weight: 15,
      span: [at, at + linkAction[0].length],
    });
  }
  const coercion = text.match(COERCION);
  if (coercion?.length) {
    const at = text.indexOf(coercion[0]);
    signals.push({
      id: 'coercion',
      label: 'Threatens to contact your family or friends',
      weight: 20,
      span: [at, at + coercion[0].length],
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
    const span = phraseSpan(text, keywords[id], id === 'money_request');
    if (span) signals.push({ id, label, weight, span });
  }
  return signals;
}
