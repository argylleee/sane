// OWNER: backend. Similarity thresholds await TASK-202 measurements.
import type { Level, Match, Signal } from '../types';

export function score(signals: Signal[], _matches: Match[]): { level: Level; score: number } {
  const total = Math.min(
    100,
    signals.reduce((sum, signal) => sum + signal.weight, 0),
  );
  if (total >= 60) return { level: 'likely_scam', score: total };
  if (
    total >= 30 ||
    signals.some(({ id }) => id === 'otp_pin_request' || id === 'lookalike_domain')
  )
    return { level: 'suspicious', score: total };
  if (total === 0 && signals.some(({ id }) => id === 'safe_credential_notice'))
    return { level: 'probably_fine', score: 0 };
  return { level: 'not_sure', score: total };
}
