import { Claim, Rule, RuleEvaluation } from '../types';

export function evaluateWaitingPeriod(claim: Claim, rule: Rule): RuleEvaluation {
  const { waiting_days_general = 30, waiting_days_preexisting = 90 } = rule.parameters;

  const policyStart = new Date(claim.policy_start_date);
  const treatmentDate = new Date(claim.treatment_date);
  const daysSincePolicyStart = Math.floor((treatmentDate.getTime() - policyStart.getTime()) / (1000 * 3600 * 24));

  const requiredDays = claim.is_preexisting ? waiting_days_preexisting : waiting_days_general;
  const conditionLabel = claim.is_preexisting ? 'pre-existing condition' : 'general';

  if (daysSincePolicyStart < requiredDays) {
    return {
      rule_id: rule.rule_id,
      rule_type: rule.rule_type,
      description: rule.description,
      result: 'FAIL',
      explanation: `Waiting period not satisfied for ${conditionLabel} claim. Treatment was ${daysSincePolicyStart} days after policy start (${claim.policy_start_date}). Required waiting period is ${requiredDays} days.`,
      remediation: `Claim must be resubmitted after ${new Date(policyStart.getTime() + requiredDays * 86400000).toISOString().split('T')[0]}.`
    };
  }

  return {
    rule_id: rule.rule_id,
    rule_type: rule.rule_type,
    description: rule.description,
    result: 'PASS',
    explanation: `Waiting period satisfied: ${daysSincePolicyStart} days elapsed since policy start (required: ${requiredDays} for ${conditionLabel}).`
  };
}
