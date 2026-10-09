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
const CARD_DATA_REQUEST =
  /\b(?:send|share|give|provide|enter|submit|reply|confirm|verify|ibigay|isend|i-send|pakisend|sabihin|ilagay|i-share|pa-send)\b[^.!?;]{0,45}\b(?:card number|card no\.?|cvv|cvc|security code|expiry|expiration|valid thru|numero ng card|likod ng card)\b/giu;
const FOLLOWUP_CODE_REQUEST =
  /\b(?:send|share|give|ibigay|i-send|i-share)\b[^.!?;]{0,18}\b(?:it|ito|yan)\b/giu;
const READ_BACK_CODE =
  /\b(?:read back|tell us|tell me|pakisabi)\b.{0,35}\b(?:six|6|anim)\s*[- ]?\s*(?:digit|digits|number|numero)\b/giu;
const PERSONAL_DATA_REQUEST =
  /\b(?:ibigay|send|share|provide|ilagay|submit|provide us)\b[^.!?;]{0,60}\b(?:buong pangalan|full name|bank account|account number|numero ng bank account|card number|home address|address|birthday|date of birth|government id|id number|sss number|philhealth number|selfie)\b/giu;
const SAFE_PERSONAL_DATA =
  /(?:do not|don't|never|huwag|wag)\s+(?:(?:ask\s+(?:you\s+)?to)\s+)?(?:ibigay|send|share|provide|ilagay|submit)[^.!?;]{0,60}\b(?:buong pangalan|full name|bank account|account number|numero ng bank account|card number|home address|address|birthday|date of birth|government id|id number|sss number|philhealth number|selfie)\b/giu;
const SAFE_CARD_DATA =
  /(?:do not|don't|never|huwag|wag)\s+(?:(?:ask\s+(?:you\s+)?to)\s+)?(?:send|share|give|provide|enter|submit|ibigay|ilagay|i-share)[^.!?;]{0,45}\b(?:card number|card no\.?|cvv|cvc|security code|expiry|expiration|valid thru|numero ng card|likod ng card)\b/giu;
const SAFE_FINANCE_REQUEST =
  /(?:do not|don't|never|huwag|wag)\s+(?:ask|request|require|humingi|hihingi)[^.!?;]{0,50}\b(?:otp|pin|mpin|password|code|card|bank account|account number|cvv)\b/iu;
const LINK_ACTION =
  /\b(?:pindutin|i-click|click|tap|buksan|open|visit|bisitahin|go to|punta sa|at|sa)\b.{0,20}\blink\b/giu;
const COERCION =
  /\b(?:i-text|isasabi|sabihin|expose|report)\b.{0,60}\b(?:family|friends|pamilya|kamag-anak)\b/giu;

const DELIVERY_CONTEXT =
  /\b(?:parcel|package|delivery|rider|courier|warehouse|shipment|order|padala|package)\b/iu;
const DELIVERY_ACTION =
  /\b(?:fee|pay|payment|magbayad|mag-pay|bayaran|link|click|pindutin|address is incomplete|kulang ang address|customs)\b/iu;
const FINANCE_CONTEXT =
  /\b(?:gcash|maya|bdo|bpi|unionbank|metrobank|security bank|rcbc|landbank|pnb|gotyme|coins\.ph|bank|bangko|e-wallet|wallet|card)\b/iu;
const FINANCE_IMPERSONATION =
  /\b(?:security desk|security team|support team|customer service|helpdesk|bank staff|wallet team|account department|card security|empleyado ng bangko|customer service)\b/iu;
const FINANCE_ACTION =
  /\b(?:read back|tell us|send|share|verify|confirm|update|unlock|reactivate|click|pindutin|link|otp|pin|password|code)\b/iu;
const JOB_CONTEXT =
  /\b(?:job|hiring|recruit|work from home|part-time|part time|reviewer|trabaho|empleo|kita|income|salary|sweldo|task)\b/iu;
const JOB_RISK =
  /\b(?:registration fee|training fee|deposit|pay|send money|guaranteed|personal information|telegram|bayad|mag-deposit|magpadala)\b/iu;
const INVESTMENT_CONTEXT =
  /\b(?:invest|investment|crypto|trading|profit|returns|tubo|puhunan|mag-invest|pag-iinvest)\b/iu;
const INVESTMENT_RISK =
  /\b(?:guaranteed|double|doble|dodoble|deposit|mag-deposit|limited slots|kaunti na lang|quick return|sure win)\b/iu;
const GOVERNMENT_CONTEXT =
  /\b(?:government|gobyerno|ayuda|benefit|subsidy|grant|relief|dswd|sss|philhealth|pag-ibig|bir)\b/iu;
const GOVERNMENT_ACTION =
  /\b(?:claim|release|register|verify|confirm|link|click|pindutin|ibigay|send|share|account number|bank account|magpadala)\b/iu;
const ROMANCE_CONTEXT =
  /\b(?:sweetheart|honey|darling|love|romance|dating|relationship|mahal|sinta|nakilala|girlfriend|boyfriend)\b/iu;
const ROMANCE_ACTION =
  /\b(?:send money|padala|loan|pautang|hospital|emergency|invest|deposit|fee|magpadala|mag-invest)\b/iu;

function isNegated(text: string, at: number): boolean {
  const clause =
    text
      .slice(Math.max(0, at - 35), at)
      .split(/[.!?;,]/)
      .at(-1) ?? '';
  return /\b(?:do not|don't|never|huwag|wag)(?:\s+\w+){0,6}\s*$/iu.test(clause);
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

function contextualSpan(
  text: string,
  context: RegExp,
  action: RegExp,
): [number, number] | undefined {
  const global = (pattern: RegExp) =>
    new RegExp(pattern.source, pattern.flags.replace('g', '') + 'g');
  const contexts = [...text.matchAll(global(context))];
  const actions = [...text.matchAll(global(action))];
  for (const contextMatch of contexts) {
    const contextAt = contextMatch.index;
    const actionMatch = actions.find((candidate) => Math.abs(candidate.index - contextAt) <= 140);
    if (!actionMatch || isNegated(text, actionMatch.index)) continue;
    return [actionMatch.index, actionMatch.index + actionMatch[0].length];
  }
}

function pushSignal(
  signals: Signal[],
  id: string,
  label: string,
  weight: number,
  span: [number, number] | undefined,
): void {
  if (span && !signals.some((signal) => signal.id === id))
    signals.push({ id, label, weight, span });
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
  const safeCardData = [...text.matchAll(SAFE_CARD_DATA)];
  const cardData = [...text.matchAll(CARD_DATA_REQUEST)].find(
    (match) =>
      !safeCardData.some(
        (notice) =>
          match.index >= notice.index &&
          match.index + match[0].length <= notice.index + notice[0].length,
      ),
  );
  if (cardData) {
    signals.push({
      id: 'card_data_request',
      label: 'Asks for card details or security code',
      weight: 35,
      span: [cardData.index, cardData.index + cardData[0].length],
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
    const span = phraseSpan(text, keywords[id], true);
    if (span) signals.push({ id, label, weight, span });
  }

  const safeNotice =
    (safe.length > 0 || SAFE_FINANCE_REQUEST.test(text)) && !request && !hasUrl(text);
  const financeSpan = contextualSpan(text, FINANCE_CONTEXT, FINANCE_IMPERSONATION);
  const financeActionSpan = contextualSpan(text, FINANCE_CONTEXT, FINANCE_ACTION);
  if (
    !safeNotice &&
    financeSpan &&
    financeActionSpan &&
    Math.abs(financeSpan[0] - financeActionSpan[0]) <= 140
  ) {
    pushSignal(
      signals,
      'bank_impersonation',
      'Claims to be a bank or wallet while requesting action',
      15,
      financeSpan,
    );
  }
  pushSignal(
    signals,
    'delivery_scam',
    'Uses a delivery problem to ask for a fee or link visit',
    20,
    contextualSpan(text, DELIVERY_CONTEXT, DELIVERY_ACTION),
  );
  pushSignal(
    signals,
    'job_bait',
    'Offers work while asking for payment or sensitive details',
    15,
    contextualSpan(text, JOB_CONTEXT, JOB_RISK),
  );
  pushSignal(
    signals,
    'investment_bait',
    'Promises unusually quick or guaranteed investment returns',
    15,
    contextualSpan(text, INVESTMENT_CONTEXT, INVESTMENT_RISK),
  );
  pushSignal(
    signals,
    'government_bait',
    'Uses a government benefit to request details or payment',
    15,
    contextualSpan(text, GOVERNMENT_CONTEXT, GOVERNMENT_ACTION),
  );
  pushSignal(
    signals,
    'romance_bait',
    'Uses a personal relationship to ask for money',
    15,
    contextualSpan(text, ROMANCE_CONTEXT, ROMANCE_ACTION),
  );
  return signals;
}
