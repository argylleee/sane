import { describe, expect, it } from 'vitest';
import { score } from '../score/score';
import { runRules } from './index';

// TASK-216 development cases, written for payment-disclaimer phrasings in Filipino, Taglish and
// English. They are not held-out text. Filipino and Taglish wording awaits native-speaker review.
const noPaymentNotices = [
  'Dadating bukas ang parcel mo. Hindi mo kailangang magbayad ng kahit ano.',
  'Paalala: ang delivery ng order mo ay libre. Wala kang babayaran.',
  'Parcel update: hindi na kailangan magbayad, bayad na ang shipping.',
  'Rider na po sa labas. Walang anumang bayad na kailangan para sa delivery.',
  'Ang order mo ay darating na. Libre ang pagpapadala at walang dagdag na bayad.',
  'Di mo na kailangang magbayad para sa delivery ng package mo.',
  'Your parcel arrives tomorrow. There is nothing to pay.',
  'Your package is on the way, free of charge. No additional fee applies.',
  'Delivery bukas, free delivery po, no extra charge.',
  'Your order will be delivered without any fee. You do not have to pay anything.',
];

describe('payment disclaimers on ordinary notices', () => {
  it.each(noPaymentNotices)('does not flag a notice that says nothing is owed: %s', (text) => {
    const ids = runRules(text).map(({ id }) => id);
    expect(ids).not.toContain('money_request');
    expect(ids).not.toContain('delivery_scam');
    expect(['suspicious', 'likely_scam']).not.toContain(score(runRules(text), []).level);
  });
});

describe('conditional or instructed payments are not disclaimers', () => {
  it.each([
    'If you do not pay the delivery fee today, your parcel will be returned.',
    'Kung hindi ka magbabayad ng fee ngayon, ibabalik ang parcel mo.',
    'Hindi pa bayad ang parcel fee mo, i-click ang link para magbayad.',
  ])('still flags the payment demand: %s', (text) => {
    expect(runRules(text).map(({ id }) => id)).toContain('money_request');
  });
});

describe('a disclaimer never hides a real demand', () => {
  it.each([
    ['Libre ang delivery pero magbayad ng 49 pesos na handling fee sa link.', 'money_request'],
    ['Walang bayad, basta ipadala mo ang OTP na natanggap mo.', 'otp_pin_request'],
    ['Wala kang babayaran. Send the 6-digit code to our agent to release it.', 'otp_pin_request'],
    ['No additional fee. Pay the processing fee first to claim your prize.', 'advance_fee'],
    [
      'Hindi mo kailangang magbayad ng delivery, pero magbayad muna ng claim fee sa premyo.',
      'advance_fee',
    ],
  ])('keeps the later request visible: %s', (text, expected) => {
    expect(runRules(text).map(({ id }) => id)).toContain(expected);
  });
});
