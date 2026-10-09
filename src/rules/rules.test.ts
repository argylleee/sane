import { describe, expect, it } from 'vitest';
import type { Lang } from '../types';
import { localizeSignals } from '../explain/templates';
import { runRules } from './index';

function ids(text: string): string[] {
  return runRules(text).map(({ id }) => id);
}

describe('broader scam patterns', () => {
  it('recognizes delivery fee lures without treating normal tracking as a scam', () => {
    expect(ids('Your parcel is held. Pay the handling fee at this link.')).toEqual(
      expect.arrayContaining(['delivery_scam', 'money_request', 'link_action']),
    );
    expect(ids('Your order is out for delivery today. Track it in the app.')).not.toContain(
      'delivery_scam',
    );
  });

  it('recognizes bank staff impersonation and card-detail requests', () => {
    expect(ids('This is the card security desk. Read back your 6 digit code now.')).toEqual(
      expect.arrayContaining(['bank_impersonation', 'otp_pin_request']),
    );
    expect(ids('Send your card number and CVV to activate the account.')).toContain(
      'card_data_request',
    );
  });

  it('recognizes risky job and investment offers', () => {
    expect(ids('Work from home. Pay the registration fee to start.')).toContain('job_bait');
    expect(ids('Guaranteed crypto profit. Deposit 2,000 today.')).toContain('investment_bait');
  });

  it('recognizes government-benefit and romance money lures', () => {
    expect(ids('May ayuda. Ibigay ang bank account number para ma-release.')).toContain(
      'government_bait',
    );
    expect(ids('Sweetheart, send money for my hospital emergency.')).toContain('romance_bait');
  });

  it('recognizes additional shorteners and brand lookalikes', () => {
    expect(ids('Verify at https://metrobank-secure.top now.')).toEqual(
      expect.arrayContaining(['lookalike_domain', 'suspicious_link']),
    );
    expect(ids('Open https://surl.li/example to claim.')).toContain('suspicious_link');
  });
});

describe('safety-message guardrails and localization', () => {
  it('does not flag warnings that mention credentials, links, or fees', () => {
    expect(ids('Your bank OTP arrived. Never share it with anyone.')).not.toContain(
      'otp_pin_request',
    );
    expect(ids('Bank staff will never ask for your OTP.')).not.toContain('bank_impersonation');
    expect(ids('We never ask for your card number or CVV.')).not.toContain('card_data_request');
    expect(ids('Scam alert: never click the link or pay the fee.')).not.toEqual(
      expect.arrayContaining(['link_action', 'money_request']),
    );
    expect(
      ids('The official government app never asks for your bank account number.'),
    ).not.toContain('government_bait');
  });

  it('keeps every new signal span inside the source text', () => {
    const text = 'Sweetheart, send money for the delivery fee through https://surl.li/x.';
    for (const signal of runRules(text)) {
      expect(signal.span).toBeDefined();
      const [start, end] = signal.span ?? [0, 0];
      expect(start).toBeGreaterThanOrEqual(0);
      expect(end).toBeLessThanOrEqual(text.length);
      expect(text.slice(start, end).length).toBeGreaterThan(0);
    }
  });

  it.each(['en', 'fil', 'taglish'] as Lang[])('localizes new labels in %s', (lang) => {
    const signals = localizeSignals(
      runRules('Guaranteed crypto profit. Deposit money today.'),
      lang,
    );
    expect(signals.find(({ id }) => id === 'investment_bait')?.label).toBeTruthy();
    expect(signals.find(({ id }) => id === 'money_request')?.label).toBeTruthy();
  });
});
