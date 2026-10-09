// OWNER: backend. Fixed advice remains available without any model.
import type { Lang, Level, Signal, Verdict } from '../types';

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
