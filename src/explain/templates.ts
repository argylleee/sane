// OWNER: backend. Fixed advice remains available without any model.
import type { Lang, Level, Signal, Verdict } from '../types';

// TASK-212 Filipino/Taglish copy awaits native-speaker review.
// New signals retain the fixed no-payment / verify-separately template advice.
const signalLabels: Record<Lang, Record<string, string>> = {
  en: {
    lookalike_domain: 'Brand-like link outside its known domain',
    suspicious_link: 'Shortened link or unusual domain ending',
    otp_pin_request: 'Asks for a one-time code or password',
    safe_credential_notice: 'Says not to share a code',
    urgency: 'Pressures you to act quickly',
    account_threat: 'Threatens account access',
    money_request: 'Asks for money or a fee',
    prize_or_job_bait: 'Promises a prize or easy income',
    relative_claims: 'Claims a relative has a new number',
    personal_data_request: 'Asks for sensitive personal information',
    card_data_request: 'Asks for card details or a security code',
    bank_impersonation: 'Claims to be a bank or wallet while requesting action',
    delivery_scam: 'Uses a delivery problem to ask for a fee or link visit',
    job_bait: 'Offers work while asking for payment or sensitive details',
    investment_bait: 'Promises unusually quick or guaranteed investment returns',
    government_bait: 'Uses a government benefit to request details or payment',
    romance_bait: 'Uses a personal relationship to ask for money',
    link_action: 'Directs you to a link',
    coercion: 'Threatens to contact your family or friends',
    advance_fee: 'Requires payment before a promised benefit',
    marketplace_deposit: 'Asks for a deposit before you can inspect an item',
    relative_emergency: 'Uses a family emergency to request money',
    gambling_bait: 'Promotes online gambling with free spins or bonus money',
  },
  fil: {
    lookalike_domain: 'Link na kamukha ng kilalang brand pero iba ang domain',
    suspicious_link: 'Pinaikling link o di-karaniwang dulo ng domain',
    otp_pin_request: 'Humihingi ng code o password',
    safe_credential_notice: 'Sinasabing huwag ibigay ang code',
    urgency: 'Pinagmamadali kang kumilos',
    account_threat: 'Nagbabanta tungkol sa access sa account',
    money_request: 'Humihingi ng pera o bayad',
    prize_or_job_bait: 'Nangangako ng premyo o madaling kita',
    relative_claims: 'Nagpapanggap na kamag-anak na may bagong numero',
    personal_data_request: 'Humihingi ng sensitibong personal na impormasyon',
    card_data_request: 'Humihingi ng detalye ng card o security code',
    bank_impersonation: 'Nagpapanggap na bangko o wallet habang may hinihiling na aksyon',
    delivery_scam: 'Gumagamit ng problema sa delivery para humingi ng bayad o link',
    job_bait: 'Nag-aalok ng trabaho habang humihingi ng bayad o sensitibong detalye',
    investment_bait: 'Nangangako ng mabilis o garantisadong kita sa investment',
    government_bait: 'Gumagamit ng ayuda o benepisyo para humingi ng detalye o bayad',
    romance_bait: 'Gumagamit ng personal na relasyon para humingi ng pera',
    link_action: 'Pinapapunta ka sa isang link',
    coercion: 'Nagbabantang kontakin ang pamilya o mga kaibigan mo',
    advance_fee: 'Humihingi ng paunang bayad bago ibigay ang ipinangakong benepisyo',
    marketplace_deposit: 'Humihingi ng deposito bago mo makita ang gamit',
    relative_emergency: 'Gumagamit ng emergency ng kamag-anak para humingi ng pera',
    gambling_bait: 'Nag-aalok ng online sugal gamit ang libreng spin o bonus na pera',
  },
  taglish: {
    lookalike_domain: 'Mukhang brand link pero iba ang domain',
    suspicious_link: 'Shortened link o kakaibang domain ending',
    otp_pin_request: 'Humihingi ng code o password',
    safe_credential_notice: 'Sinasabing huwag i-share ang code',
    urgency: 'Minamadali kang mag-action',
    account_threat: 'May banta sa account access',
    money_request: 'Humihingi ng money o fee',
    prize_or_job_bait: 'May pangakong prize o easy income',
    relative_claims: 'Nagpapanggap na relative na may new number',
    personal_data_request: 'Humihingi ng sensitive personal information',
    card_data_request: 'Humihingi ng card details o security code',
    bank_impersonation: 'Nagpapanggap na bank o wallet habang may pinapagawa',
    delivery_scam: 'May delivery problem na ginagamit para humingi ng fee o link',
    job_bait: 'May job offer pero humihingi ng payment o sensitive details',
    investment_bait: 'Nangangako ng mabilis o guaranteed na investment returns',
    government_bait: 'Ginagamit ang government benefit para humingi ng details o bayad',
    romance_bait: 'Ginagamit ang personal na relasyon para humingi ng money',
    link_action: 'Pinapapunta ka sa isang link',
    coercion: 'Nagbabantang kontakin ang family o friends mo',
    advance_fee: 'Humihingi ng payment bago ibigay ang promised benefit',
    marketplace_deposit: 'Humihingi ng deposit bago mo ma-inspect ang item',
    relative_emergency: 'Ginagamit ang family emergency para humingi ng money',
    gambling_bait: 'Nag-o-offer ng online gambling gamit ang free spin o bonus money',
  },
};

const templates: Record<Lang, Record<Level, Verdict['explanation']>> = {
  en: {
    likely_scam: {
      headline: 'This message has several scam warning signs.',
      steps: [
        'Do not open the link or share a code.',
        'Contact the organization through its official app or a number you already trust.',
      ],
    },
    suspicious: {
      headline: 'This message needs a closer check.',
      steps: [
        'Do not send money or personal codes yet.',
        'Verify the request through a separate, trusted channel.',
      ],
    },
    probably_fine: {
      headline: 'No obvious request to share a code was found.',
      steps: [
        'Keep your code private.',
        'If anything else seems unusual, verify with the sender directly.',
      ],
    },
    not_sure: {
      headline: 'There is not enough evidence to judge this message.',
      steps: [
        'Do not share OTPs, PINs, or passwords.',
        'Check with the sender using a number you already trust.',
      ],
    },
  },
  fil: {
    likely_scam: {
      headline: 'Maraming babala ng panloloko sa mensaheng ito.',
      steps: [
        'Huwag buksan ang link o ibigay ang code.',
        'Makipag-ugnayan sa opisyal na app o numerong alam mong tama.',
      ],
    },
    suspicious: {
      headline: 'Kailangang suriin pa ang mensaheng ito.',
      steps: [
        'Huwag munang magpadala ng pera o personal na code.',
        'Kumpirmahin ang hiling sa hiwalay at mapagkakatiwalaang paraan.',
      ],
    },
    probably_fine: {
      headline: 'Walang malinaw na hiling na ibahagi ang code.',
      steps: [
        'Itago ang iyong code.',
        'Kung may kahina-hinala pa rin, kumpirmahin ito sa nagpadala.',
      ],
    },
    not_sure: {
      headline: 'Kulang ang palatandaan para matiyak ang mensaheng ito.',
      steps: [
        'Huwag ibigay ang OTP, PIN, o password.',
        'Kumpirmahin sa nagpadala gamit ang numerong pinagkakatiwalaan mo.',
      ],
    },
  },
  taglish: {
    likely_scam: {
      headline: 'May ilang scam warning signs ang message na ito.',
      steps: [
        'Huwag i-open ang link o i-share ang code.',
        'I-check sa official app o sa number na alam mong tama.',
      ],
    },
    suspicious: {
      headline: 'Kailangan pang i-check ang message na ito.',
      steps: [
        'Huwag munang mag-send ng pera o personal code.',
        'I-verify sa ibang trusted na paraan.',
      ],
    },
    probably_fine: {
      headline: 'Walang malinaw na request na i-share ang code.',
      steps: ['Keep your code private.', 'Kung may duda pa rin, i-confirm sa sender.'],
    },
    not_sure: {
      headline: 'Kulang ang clues para masabi kung scam ito.',
      steps: [
        'Huwag i-share ang OTP, PIN, o password.',
        'I-verify sa sender gamit ang trusted na number.',
      ],
    },
  },
};

type Advice = Record<Lang, string>;

// One concrete, signal-specific step per red flag. Ordered from most to least important.
const ADVICE: [string[], Advice][] = [
  [
    ['otp_pin_request'],
    {
      en: 'Never share an OTP, PIN or password. Real banks, wallets and agencies never ask for it.',
      fil: 'Huwag kailanman ibigay ang OTP, PIN o password. Hindi ito hinihingi ng totoong bangko, wallet o ahensya.',
      taglish:
        'Never i-share ang OTP, PIN o password. Hindi ito hinihingi ng legit na bank, wallet o agency.',
    },
  ],
  [
    ['card_data_request'],
    {
      en: 'Do not give your card number, CVV or expiry date through a message.',
      fil: 'Huwag ibigay ang numero, CVV o expiry ng card mo sa mensahe.',
      taglish: 'Huwag i-send ang card number, CVV o expiry date mo sa message.',
    },
  ],
  [
    ['lookalike_domain'],
    {
      en: 'The link only looks like a known brand. Do not open it. Use the official app instead.',
      fil: 'Kamukha lang ng kilalang brand ang link. Huwag itong buksan. Gamitin ang opisyal na app.',
      taglish:
        'Mukha lang legit ang link pero hindi. Huwag i-open. Sa official app ka na lang dumaan.',
    },
  ],
  [
    ['personal_data_request'],
    {
      en: 'Do not send IDs, selfies or account numbers to someone who messaged you first.',
      fil: 'Huwag magpadala ng ID, selfie o account number sa taong unang nag-message sa iyo.',
      taglish: 'Huwag mag-send ng ID, selfie o account number sa nag-message sa iyo nang biglaan.',
    },
  ],
  [
    ['gambling_bait'],
    {
      en: 'Free spins and bonus money are bait for unlicensed online casinos. Do not log in, register or deposit.',
      fil: 'Pain ng ilegal na online casino ang libreng spin at bonus. Huwag mag-login, mag-register o magdeposito.',
      taglish:
        'Pain ng illegal na online casino ang free spin at bonus. Huwag mag-login, mag-register o mag-deposit.',
    },
  ],
  [
    ['relative_claims', 'relative_emergency'],
    {
      en: 'Call your relative on the number you already have before sending anything.',
      fil: 'Tawagan muna ang kamag-anak sa dati niyang numero bago magpadala ng kahit ano.',
      taglish: 'Tawagan muna ang relative mo sa old number niya bago mag-send ng kahit ano.',
    },
  ],
  [
    ['advance_fee', 'money_request', 'prize_or_job_bait'],
    {
      en: 'Do not pay a fee to receive a prize, loan, aid or package. Real ones do not charge first.',
      fil: 'Huwag magbayad para makuha ang premyo, loan, ayuda o padala. Hindi naniningil muna ang totoo.',
      taglish:
        'Huwag mag-pay ng fee para ma-claim ang prize, loan, ayuda o parcel. Hindi naniningil muna ang legit.',
    },
  ],
  [
    ['delivery_scam'],
    {
      en: "Check the tracking number in the courier's official app, not through this message.",
      fil: 'Tingnan ang tracking number sa opisyal na app ng courier, hindi sa mensaheng ito.',
      taglish: 'I-check ang tracking number sa official app ng courier, hindi sa message na ito.',
    },
  ],
  [
    ['job_bait'],
    {
      en: 'Real employers do not ask you to pay, deposit or top up before you start.',
      fil: 'Hindi pinagbabayad o pinagdedeposito ng totoong employer bago ka magsimula.',
      taglish: 'Ang legit na employer, hindi ka pagbabayarin o pag-to-top up bago ka mag-start.',
    },
  ],
  [
    ['investment_bait'],
    {
      en: 'Guaranteed or doubled returns are a sign of fraud. Check the SEC advisories first.',
      fil: 'Palatandaan ng panloloko ang garantisado o dobleng tubo. Tingnan muna ang mga abiso ng SEC.',
      taglish: 'Red flag ang guaranteed o double na returns. I-check muna ang SEC advisories.',
    },
  ],
  [
    ['government_bait'],
    {
      en: 'Claim government aid only through the official office or app, never by paying or replying here.',
      fil: 'Kunin lang ang ayuda sa opisyal na tanggapan o app, hindi sa pagbabayad o pagsagot dito.',
      taglish:
        'Sa official office o app lang mag-claim ng ayuda, hindi sa pag-pay o pag-reply dito.',
    },
  ],
  [
    ['romance_bait'],
    {
      en: 'Do not send money to someone you have only met online.',
      fil: 'Huwag magpadala ng pera sa taong sa online mo lang nakilala.',
      taglish: 'Huwag mag-send ng pera sa taong online mo lang nakilala.',
    },
  ],
  [
    ['marketplace_deposit'],
    {
      en: 'Do not pay a deposit before you see the item. Meet in a safe place or use cash on delivery.',
      fil: 'Huwag magdeposito bago mo makita ang gamit. Magkita sa ligtas na lugar o mag-cash on delivery.',
      taglish: 'Huwag mag-deposit bago mo makita ang item. Mag-meet sa safe na lugar o mag-COD.',
    },
  ],
  [
    ['coercion'],
    {
      en: 'Do not pay because of threats. Save the messages and report them to the authorities.',
      fil: 'Huwag magbayad dahil sa pananakot. I-save ang mga mensahe at i-report sa awtoridad.',
      taglish: 'Huwag mag-pay dahil sa threats. I-save ang messages at i-report sa authorities.',
    },
  ],
  [
    ['account_threat', 'bank_impersonation'],
    {
      en: 'Open your bank or wallet app yourself, or call the hotline printed on your card.',
      fil: 'Ikaw mismo ang magbukas ng app ng bangko o wallet, o tumawag sa hotline sa likod ng card.',
      taglish:
        'Ikaw mismo mag-open ng bank o wallet app, o tawagan ang hotline sa likod ng card mo.',
    },
  ],
  [
    ['suspicious_link', 'link_action'],
    {
      en: 'Do not open links from unexpected messages. Type the official address yourself.',
      fil: 'Huwag buksan ang link mula sa di-inaasahang mensahe. Ikaw mismo ang mag-type ng opisyal na address.',
      taglish:
        'Huwag i-open ang links sa unexpected na messages. I-type mo mismo ang official address.',
    },
  ],
  [
    ['urgency'],
    {
      en: 'Take your time. Scammers rush you so you do not stop to check.',
      fil: 'Huwag magmadali. Minamadali ka ng manloloko para hindi ka na makapagsuri.',
      taglish: 'Take your time. Minamadali ka ng scammer para hindi mo na ma-check.',
    },
  ],
];

const MAX_STEPS = 3;

/**
 * The level's headline plus up to three steps: first the advice for the red flags actually found,
 * then the level's general advice. Every sentence is fixed, reviewed text, so it works without a model.
 */
export function explain(
  level: Level,
  lang: Lang,
  signals: Pick<Signal, 'id'>[] = [],
): Verdict['explanation'] {
  const base = templates[lang][level];
  if (level === 'probably_fine' || level === 'not_sure' || signals.length === 0)
    return { headline: base.headline, steps: [...base.steps] };
  const ids = new Set(signals.map(({ id }) => id));
  const specific = ADVICE.filter(([keys]) => keys.some((key) => ids.has(key))).map(
    ([, advice]) => advice[lang],
  );
  if (specific.length === 0) return { headline: base.headline, steps: [...base.steps] };
  const steps = [...specific.slice(0, MAX_STEPS - 1), ...base.steps.slice(1)];
  return { headline: base.headline, steps: [...new Set(steps)].slice(0, MAX_STEPS) };
}

export function localizeSignals(signals: Signal[], lang: Lang): Signal[] {
  return signals.map((signal) => ({
    ...signal,
    label: signalLabels[lang][signal.id] ?? signal.label,
  }));
}
