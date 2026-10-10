// OWNER: backend. What a message asks the reader to do. A message can only cause harm by itself if
// it asks for something: open a link, call or text a number, send money, give a code or personal
// details, or log in, sign up, claim or install. Code decides this, never a model.
import { hasUrl } from './urls';

export type AskKind = 'link' | 'contact' | 'money' | 'credential' | 'personal' | 'account_action';

const MONEY_WORD = String.raw`(?:money|pera|cash|pesos?|piso|php|₱|p\s?\d|\d[\d,.]*\s?k\b|\d{1,3},\d{3}|gcash|maya|fee|bayad|payment|load|amount|halaga|deposit|balance)`;

// Verbs that hand something over. Negated uses ("huwag i-share", "never send") are removed first.
const REQUEST = String.raw`(?:send|share|give|provide|enter|submit|reply|forward|confirm|update|type|tell|ibigay|ipadala|i-?send|pa-?send|paki-?send|pakisabi|sabihin|ilagay|i-?share|ibahagi|ipasa|i-?forward|i-?type|i-?confirm|i-?update|copy of)`;
const NEGATED_REQUEST = new RegExp(
  String.raw`\b(?:do not|don't|never|huwag(?: mong| niyong)?|wag(?: mong)?|hindi)\s+(?:\S+\s+){0,2}${REQUEST}\b[^.!?\n]*`,
  'giu',
);

const ASKS: [AskKind, RegExp][] = [
  [
    'contact',
    /(?:\+?63|\b0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}\b|\b(?:call|text|tawagan|i-?text|contact)\s+(?:us|me|this number|ang numerong ito|sa numerong ito|kami|ako)\b|\b(?:sa numerong ito|this number|numero na ito|number na ito)\b|\b(?:telegram|whatsapp|viber)\b|\b(?:message|dm|chat|pm)\s+(?:me|mo ako|niyo ako|us)\b/iu,
  ],
  [
    'money',
    new RegExp(
      String.raw`\b(?:pay|magbayad|mag-?pay|bayaran|babayaran|i-?pay|settle|deposit|mag-?deposit|magdeposito|pahiram|hiram|pautang|pakibalik|ibalik|i-?refund|top[ -]?up|mag-?top[ -]?up|mag-?load|pa-?load|pa-?gcash|padalhan|pambayad|pang-?bayad|abono|i-?abono|pakisend|paki-?send)\b|\b(?:send|i-?send|mag-?send|ipadala|magpadala|transfer|i-?transfer)\b[^.!?\n]{0,30}${MONEY_WORD}|\b(?:need|kailangan|kulang)\b[^.!?\n]{0,25}${MONEY_WORD}|\b(?:hospital|ospital|clinic|klinika|medical|tuition|matrikula)\s+(?:bill|fee|bayarin)s?\b|\b(?:help|tulungan|tulong)\b[^.!?\n]{0,25}\b(?:pay|bill|bayad|bayarin|gastos|pera|money)\b`,
      'iu',
    ),
  ],
  [
    'credential',
    new RegExp(
      String.raw`\b${REQUEST}\b[^.!?\n]{0,40}\b(?:otp|pin|mpin|password|passcode|one[- ]time (?:password|code|pin)|verification code|login code|security code|code|6[- ]digit)\b`,
      'iu',
    ),
  ],
  [
    'personal',
    new RegExp(
      String.raw`\b${REQUEST}\b[^.!?\n]{0,50}\b(?:valid id|government id|id|selfie|full name|buong pangalan|home address|address|birthday|date of birth|account number|card number|cvv|mother'?s maiden name|sss number|tin number|details|detalye)\b`,
      'iu',
    ),
  ],
  [
    'account_action',
    /\b(?:log ?in|mag-?log ?in|i-?log ?in|sign ?up|mag-?sign ?up|register|mag-?register|i-?register|verify|i-?verify|update (?:your|ang|mo ang) (?:details|account|info)|claim|i-?claim|click|i-?click|tap (?:here|the)|pindutin|download|i-?download|install|i-?install|reply with)\b/iu,
  ],
];

/** Every kind of request found in the text. An empty list means the message asks for nothing risky. */
export function findAsks(text: string): AskKind[] {
  const asked = text.replace(NEGATED_REQUEST, ' '); // "never share this code" asks for nothing
  const kinds = ASKS.filter(([, pattern]) => pattern.test(asked)).map(([kind]) => kind);
  if (hasUrl(text)) kinds.unshift('link');
  return kinds;
}
