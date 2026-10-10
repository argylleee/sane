import { describe, expect, it } from 'vitest';
import { findAsks } from './ask';

describe('findAsks', () => {
  it.each([
    'Good morning! Hope you have a great day ahead.',
    'Thank you sa pa-birthday kahapon, sobrang saya ko!',
    'Your OTP is 220871. Huwag mong i-share kahit kanino.',
    'Your one-time password is 906412. Never share it with anyone.',
    'Reminder: your dental check-up is on Thursday. Bring your ID.',
    'Tara kape tayo later after work? Libre kita kasi birthday ko bukas.',
  ])('finds no risky request in: %s', (text) => {
    expect(findAsks(text)).toEqual([]);
  });

  it.each([
    ['Pakibalik naman po sa number na ito, kailangan ko lang.', 'money'],
    ['Tita, pwede bang pahiram muna ng 2k?', 'money'],
    ['Can you send the login code back to me please?', 'credential'],
    ['I-send ang copy ng valid ID at selfie mo dito.', 'personal'],
    ['Log in now and start playing!', 'account_action'],
    ['Visit bdo-online-ph.com to restore access.', 'link'],
    ['Message mo ako sa Telegram.', 'contact'],
  ] as const)('finds the request in: %s', (text, kind) => {
    expect(findAsks(text)).toContain(kind);
  });
});
