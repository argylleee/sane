// OWNER: backend. Uses the TASK-202 floor and ordinary-message comparison thresholds.
import type { Level, Match, Signal } from '../types';
import { SIMILARITY_FLOOR, type EvidenceLevel } from '../ai/match';

// Asking for a secret or using a fake brand link is the core of most scams on its own.
const STRONG_ASK = new Set([
  'otp_pin_request',
  'card_data_request',
  'personal_data_request',
  'lookalike_domain',
]);
// Bait that becomes a classic scam once money is requested ("you won, pay the fee").
const MONEY_HOOK = new Set(['prize_or_job_bait', 'relative_claims', 'coercion', 'account_threat']);
// Weak cues that also appear in ordinary bank, delivery and family messages.
const WEAK = new Set([
  'urgency',
  'account_threat',
  'bank_impersonation',
  'money_request',
  'link_action',
  'prize_or_job_bait',
  'government_bait',
]);
const LIKELY = 60;

/**
 * Benign evidence: the message is clearly closer to an ordinary example than to any scam pattern.
 * Measured on the development set (multilingual-e5-small, Node CPU): every scam had a margin above
 * 0.005 and every ordinary message was at or below 0.01, most below -0.015.
 */
export const BENIGN_MARGIN = -0.02;
export const BENIGN_MARGIN_WITH_WEAK_CUE = -0.04;

export type ScoreContext = {
  /** Best scam similarity minus best ordinary-example similarity, when embeddings ran. */
  margin?: number | null;
  /** A link in the message that is not on a known official domain. */
  unverifiedLink?: boolean;
};

export function score(
  signals: Signal[],
  matches: Match[],
  evidence: EvidenceLevel = 'none',
  context: ScoreContext = {},
): { level: Level; score: number; archetypeId?: string } {
  const risky = signals.filter(({ weight }) => weight > 0);
  const ids = new Set(risky.map(({ id }) => id));
  let ruleScore = Math.min(
    100,
    risky.reduce((sum, signal) => sum + signal.weight, 0),
  );
  // Independent red flags together are much stronger than their sum suggests.
  const combined =
    ([...ids].some((id) => STRONG_ASK.has(id)) && ids.size >= 2) ||
    ids.size >= 3 ||
    (ids.has('money_request') && [...ids].some((id) => MONEY_HOOK.has(id))) ||
    (ids.has('gambling_bait') && ids.size >= 2); // casino spam plus a prize or pressure cue
  if (combined) ruleScore = Math.max(ruleScore, LIKELY);

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
  if (ruleScore >= LIKELY)
    return { level: 'likely_scam', score: Math.min(100, ruleScore + bonus), archetypeId };

  // Supporting embeddings have a suspicious floor, but cannot cross the likely-scam boundary.
  const total = supporting ? Math.min(59, Math.max(30, ruleScore + bonus)) : ruleScore;
  if (
    total >= 30 ||
    signals.some(({ id }) => id === 'otp_pin_request' || id === 'lookalike_domain')
  )
    return { level: 'suspicious', score: total, archetypeId };

  // "Probably fine" needs positive evidence from the model, never just an absence of rules.
  const margin = context.margin;
  const benign =
    !supporting &&
    !context.unverifiedLink &&
    typeof margin === 'number' &&
    Number.isFinite(margin) &&
    (risky.length === 0
      ? margin <= BENIGN_MARGIN
      : risky.length === 1 && WEAK.has(risky[0].id) && margin <= BENIGN_MARGIN_WITH_WEAK_CUE);
  if (benign) return { level: 'probably_fine', score: total };
  return { level: 'not_sure', score: total };
}
