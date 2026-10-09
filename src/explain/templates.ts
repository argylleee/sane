// OWNER: backend. Stub: one safe generic explanation per language.
import type { Lang, Level, Verdict } from '../types';

const generic: Record<Lang, Verdict['explanation']> = {
  en: {
    headline: 'Not sure about this message.',
    steps: [
      'Do not share OTPs, PINs, or passwords.',
      'Check with the sender using a number you already trust.',
    ],
  },
  fil: {
    headline: 'Hindi sigurado sa mensaheng ito.',
    steps: [
      'Huwag ibigay ang OTP, PIN, o password.',
      'Kumpirmahin sa nagpadala gamit ang numerong pinagkakatiwalaan mo.',
    ],
  },
  taglish: {
    headline: 'Not sure kami sa message na ito.',
    steps: [
      'Huwag i-share ang OTP, PIN, o password.',
      'I-verify sa sender gamit ang number na alam mong totoo.',
    ],
  },
};

export function explain(_level: Level, lang: Lang): Verdict['explanation'] {
  return generic[lang];
}
