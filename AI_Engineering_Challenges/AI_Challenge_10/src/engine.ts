import { Claim, RuleEvaluator, FraudFlag, ScoredClaim } from './types';

export class FraudEngine {
  private rules: RuleEvaluator[] = [];

  addRule(rule: RuleEvaluator) {
    this.rules.push(rule);
  }

  evaluateAll(claims: Claim[]): ScoredClaim[] {
    // Pass 1: Aggregation
    for (const rule of this.rules) {
      if (rule.aggregate) {
        rule.aggregate(claims);
      }
    }

    // Pass 2: Evaluation
    const scoredClaims: ScoredClaim[] = [];

    for (const claim of claims) {
      const flags: FraudFlag[] = [];
      let totalSeverity = 0;

      for (const rule of this.rules) {
        const flag = rule.evaluate(claim, claims);
        if (flag) {
          flags.push(flag);
          totalSeverity += flag.severity;
        }
      }

      // Calculate composite score (0-100)
      // Cap at 100. We can say each severity point is worth 10 score points for simplicity.
      let riskScore = Math.min(100, totalSeverity * 10);

      scoredClaims.push({
        claim_id: claim.claim_id,
        risk_score: riskScore,
        flags
      });
    }

    // Sort by risk score descending
    return scoredClaims.sort((a, b) => b.risk_score - a.risk_score);
  }
}
