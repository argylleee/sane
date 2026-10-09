// OWNER: backend. Stub: no evidence means "not sure", never "probably fine".
import type { Level, Match, Signal } from '../types';

export function score(signals: Signal[], _matches: Match[]): { level: Level; score: number } {
  if (signals.length === 0) return { level: 'not_sure', score: 0 };
  const total = Math.min(
    100,
    signals.reduce((sum, signal) => sum + signal.weight, 0),
  );
  return { level: total >= 60 ? 'likely_scam' : 'suspicious', score: total };
}
