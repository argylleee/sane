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

export function explain(level: Level, lang: Lang): Verdict['explanation'] {
  return templates[lang][level];
}

export function localizeSignals(signals: Signal[], lang: Lang): Signal[] {
  return signals.map((signal) => ({
    ...signal,
    label: signalLabels[lang][signal.id] ?? signal.label,
  }));
}
