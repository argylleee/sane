import { describe, expect, it } from 'vitest';
import developmentSet from '../../eval/testset.json';
import { explain, localizeSignals } from '../explain/templates';
import { score } from '../score/score';
import type { Lang } from '../types';
import { runRules } from './index';

// New AI-authored development cases from scenario categories, not held-out text.
// Filipino and Taglish wording awaits native-speaker review.
const cases: [Lang, string, string][] = [
  ['fil', 'Magbayad ng singil muna bago makuha ang premyo.', 'advance_fee'],
  ['taglish', 'Pay muna ng claim fee bago makuha ang raffle reward.', 'advance_fee'],
  ['en', 'Send an advance fee before we release your aid grant.', 'advance_fee'],
  ['taglish', 'Para sa ayuda, send an upfront fee bago ang release.', 'advance_fee'],
  ['en', 'Pay the loan processing fee first before the funds are released.', 'advance_fee'],
  ['fil', 'Magbayad ng paunang bayad bago ibigay ang pautang.', 'advance_fee'],
  ['en', 'Pay a processing charge first to collect your raffle reward.', 'advance_fee'],
  ['fil', 'Magbayad muna ng paunang bayad bago matanggap ang tulong pinansyal.', 'advance_fee'],
  ['taglish', 'Send muna ng advance fee bago ma-release ang loan mo.', 'advance_fee'],
  ['en', 'For this job, top up your working balance to unlock paid tasks.', 'advance_fee'],
  ['fil', 'Para sa trabaho, dagdagan ang balanse bago magsimula ang mga gawain.', 'advance_fee'],
  [
    'taglish',
    'Para sa job, mag-top up ng working balance para ma-unlock ang tasks.',
    'advance_fee',
  ],
  ['en', 'For the marketplace camera, send a deposit before inspection.', 'marketplace_deposit'],
  ['fil', 'Para sa binebentang kamera, magdeposito bago makita ang gamit.', 'marketplace_deposit'],
  ['taglish', 'For the item sa marketplace, send deposit bago ma-inspect.', 'marketplace_deposit'],
  ['en', 'Our investment guarantees a profit each week.', 'investment_bait'],
  ['fil', 'Siguradong tubo ang aming puhunan linggo-linggo.', 'investment_bait'],
  ['taglish', 'Sure profit ang investment natin every week.', 'investment_bait'],
  [
    'en',
    'Your sister needs emergency money at the clinic. Transfer funds to me.',
    'relative_emergency',
  ],
  ['fil', 'Kapatid mo ito, nasa ospital. Ipadala ang pera sa akin.', 'relative_emergency'],
  ['taglish', 'Pinsan mo ito, may emergency sa clinic. Send funds sa akin.', 'relative_emergency'],
  ['en', 'Darling, transfer funds for my emergency treatment.', 'romance_bait'],
  ['fil', 'Mahal, ipadala ang pera para sa aking pagpapagamot.', 'romance_bait'],
  ['taglish', 'Honey, send funds for my emergency treatment.', 'romance_bait'],
  ['en', 'For SIM registration, forward the verification code to our agent.', 'otp_pin_request'],
  ['fil', 'Para sa SIM registration, ipadala ang OTP sa kinatawan.', 'otp_pin_request'],
  ['taglish', 'For SIM registration, paki-send ang one-time password sa agent.', 'otp_pin_request'],
];

const notices = [
  'Your courier shipment arrives today. No payment is required.',
  'Your delivery is scheduled. You do not need to pay a handling fee.',
  'Darating ang padala. Walang kailangang bayaran.',
  'Ang delivery ay bukas. Hindi kailangan ang bayad.',
  'Your parcel is ready. No need magbayad ng fee.',
  'Delivery today. Hindi required ang payment.',
  'Bank advisory: Never send your OTP or transfer funds to an unknown agent.',
  'Bangko: Huwag ipadala ang OTP sa iba.',
  'Bank reminder: Huwag i-forward ang verification code.',
  'Your OTP is 123456. Never share this code.',
  'May pautang ang opisyal na bangko. Walang paunang bayad.',
  'Scam warning: Never pay a processing charge first to collect a raffle reward.',
  'Huwag magdeposito bago makita ang binebentang gamit.',
  'Do not send a deposit before inspection of a marketplace item.',
  'The investment does not guarantee returns.',
  'Darling, my hospital appointment is tomorrow.',
  'Walang garantisadong tubo sa investment.',
];

describe('new multilingual development regressions', () => {
  it.each(cases)('%s detects %s', (lang, text, id) => {
    const signals = runRules(text);
    expect(signals.map((signal) => signal.id)).toContain(id);
    expect(['suspicious', 'likely_scam']).toContain(score(signals, []).level);
    expect(localizeSignals(signals, lang).find((signal) => signal.id === id)?.label).toBeTruthy();
    expect(explain('suspicious', lang).steps.length).toBeGreaterThan(0);
  });

  it.each(notices)('does not flag the legitimate notice: %s', (text) => {
    const signals = runRules(text);
    expect(signals.map((signal) => signal.id)).not.toContain('otp_pin_request');
    expect(signals.map((signal) => signal.id)).not.toContain('money_request');
    expect(['suspicious', 'likely_scam']).not.toContain(score(signals, []).level);
  });

  it('preserves a later positive request after a negated payment notice', () => {
    const text = 'No payment is required for delivery. Pay the processing fee first for a prize.';
    const signals = runRules(text);
    expect(signals.map((signal) => signal.id)).toContain('advance_fee');
    expect(signals.map((signal) => signal.id)).toContain('money_request');
    for (const { span } of signals) {
      expect(span).toBeDefined();
      const [start, end] = span!;
      expect(text.slice(start, end).trim()).not.toBe('');
      expect(end).toBeLessThanOrEqual(text.length);
    }
  });

  it('does not suppress payment demands expressed as conditional threats', () => {
    const text = 'Kung hindi mo bayaran, i-text ko ang pamilya mo.';
    expect(runRules(text).map(({ id }) => id)).toContain('money_request');
    expect(score(runRules(text), []).level).toBe('likely_scam');
  });

  it.each([
    'No payment is required but send your OTP to the agent.',
    'Walang kailangang bayaran pero ipadala ang OTP sa akin.',
    'No need magbayad ng fee but share your PIN with me.',
  ])('does not hide a credential request after a payment disclaimer: %s', (text) => {
    expect(runRules(text).map(({ id }) => id)).toContain('otp_pin_request');
  });

  it.each([
    'Investment reminder: deposit monthly into your existing account.',
    'Pay your electricity bill first, then apply for a job.',
    'For the camera item, pay the deposit after inspection.',
    'My sister has a hospital visit tomorrow. I will drive her there.',
  ])('keeps ordinary actions below the flag threshold: %s', (text) => {
    expect(['suspicious', 'likely_scam']).not.toContain(score(runRules(text), []).level);
  });

  it('keeps the original development-set false-alarm count at zero', () => {
    const rows = developmentSet.map((row) => ({
      ...row,
      actual: score(runRules(row.text), []).level,
    }));
    const flagged = (level: string) => level === 'suspicious' || level === 'likely_scam';
    const scams = rows.filter((row) => row.expected !== 'probably_fine');
    const legit = rows.filter((row) => row.expected === 'probably_fine');
    console.info(
      JSON.stringify({
        developmentOnly: true,
        caught: scams.filter((row) => flagged(row.actual)).length,
        scams: scams.length,
        falseAlarms: legit.filter((row) => flagged(row.actual)).length,
        legit: legit.length,
        abstentions: rows.filter((row) => row.actual === 'not_sure').length,
      }),
    );
    expect(legit.filter((row) => flagged(row.actual))).toEqual([]);
  });
});

describe('online casino and free-spin bait', () => {
  it.each([
    'Login at may 2 FREE Spin! Marami na ang nakakuha ng P789 7,890. Ikaw na ang susunod na maswerte!',
    'Claim your free spins now! 5,000 players already won. You could be next!',
    'Mag-register ngayon at makakuha ng FREE 100 bonus! Withdraw agad sa GCash.',
    'Jackpot hanggang P50,000! Mag-login na sa casino app, ikaw na ang susunod.',
    'Welcome bonus para sa new members, deposit 100 get 300. Sign up na!',
  ])('flags casino bait as likely_scam: %s', (text) => {
    const signals = runRules(text);
    expect(signals.map(({ id }) => id)).toContain('gambling_bait');
    expect(score(signals, []).level).toBe('likely_scam');
  });

  it.each([
    'Swerte mo naman, nanalo ka sa raffle ng office kanina!',
    'May slots pa sa seminar bukas, register na kayo.',
    'Register to the promo and get free 100 texts to all networks.',
    'Tara laro tayo mamaya sa park, ikaw ang taya.',
    'You can cash out at any partner outlet using the app.',
  ])('does not flag ordinary messages: %s', (text) => {
    expect(['suspicious', 'likely_scam']).not.toContain(score(runRules(text), []).level);
  });
});
