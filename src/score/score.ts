// OWNER: backend. Uses the TASK-202 floor and ordinary-message comparison thresholds.
import type { Level, Match, Signal } from '../types';
import { SIMILARITY_FLOOR, type EvidenceLevel } from '../ai/match';

export function score(
  signals: Signal[],
  matches: Match[],
  evidence: EvidenceLevel = 'none',
): { level: Level; score: number; archetypeId?: string } {
  const ruleScore = Math.min(
    100,
    signals.reduce((sum, signal) => sum + signal.weight, 0),
  );
  // Keep the established no-share guardrail. Similarity is not a credential request.
  if (ruleScore === 0 && signals.some(({ id }) => id === 'safe_credential_notice'))
    return { level: 'probably_fine', score: 0 };

  const top = matches[0];
  const supporting =
    (evidence === 'strong' || evidence === 'moderate') &&
    top !== undefined &&
    Number.isFinite(top.similarity) &&
    top.similarity >= SIMILARITY_FLOOR &&
    top.similarity <= 1;
  const bonus = supporting ? (evidence === 'strong' ? 25 : 12) : 0;
  const archetypeId = supporting ? top.archetypeId : undefined;
  if (ruleScore >= 60)
    return { level: 'likely_scam', score: Math.min(100, ruleScore + bonus), archetypeId };

  // Supporting embeddings have a suspicious floor, but cannot cross the likely-scam boundary.
  const total = supporting ? Math.min(59, Math.max(30, ruleScore + bonus)) : ruleScore;
  if (
    total >= 30 ||
    signals.some(({ id }) => id === 'otp_pin_request' || id === 'lookalike_domain')
  )
    return { level: 'suspicious', score: total, archetypeId };
  return { level: 'not_sure', score: total };
}
