import { Claim, ScoredClaim, FraudMetrics } from './types';

export function calculateMetrics(
  claims: Claim[],
  scoredClaims: ScoredClaim[],
  threshold: number = 30 // Any score >= threshold is predicted fraud
): FraudMetrics {
  const actualFrauds = new Set(claims.filter(c => c.is_fraudulent).map(c => c.claim_id));
  const predictedFrauds = new Set(scoredClaims.filter(c => c.risk_score >= threshold).map(c => c.claim_id));

  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;

  for (const claim of claims) {
    const isActual = actualFrauds.has(claim.claim_id);
    const isPredicted = predictedFrauds.has(claim.claim_id);

    if (isActual && isPredicted) tp++;
    if (!isActual && isPredicted) fp++;
    if (isActual && !isPredicted) fn++;
    if (!isActual && !isPredicted) tn++;
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;

  return {
    total_claims: claims.length,
    actual_frauds: actualFrauds.size,
    predicted_frauds: predictedFrauds.size,
    true_positives: tp,
    false_positives: fp,
    false_negatives: fn,
    precision,
    recall,
    fpr
  };
}
