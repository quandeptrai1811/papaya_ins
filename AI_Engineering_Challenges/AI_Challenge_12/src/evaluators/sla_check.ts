import { Claim, Rule, RuleEvaluation } from '../types';

const BUSINESS_DAYS_PER_WEEK = 5;

function calcBusinessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const cur = new Date(start);
  cur.setDate(cur.getDate() + 1); // start counting the next day
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function evaluateSlaCheck(claim: Claim, rule: Rule): RuleEvaluation {
  const { sla_business_days, sla_claim_types = [] } = rule.parameters;

  if (!sla_business_days) {
    return { rule_id: rule.rule_id, rule_type: rule.rule_type, description: rule.description, result: 'SKIPPED', explanation: 'SLA days not configured.' };
  }

  if (sla_claim_types.length > 0 && !sla_claim_types.includes(claim.claim_type)) {
    return {
      rule_id: rule.rule_id,
      rule_type: rule.rule_type,
      description: rule.description,
      result: 'SKIPPED',
      explanation: `SLA rule does not apply to ${claim.claim_type} claims.`
    };
  }

  // SLA measures the maximum allowed days between treatment date and submission date.
  // This validates that the claim was submitted within the allowed timeframe.
  const treatment = new Date(claim.treatment_date);
  const submission = new Date(claim.submission_date);
  const calendarDays = Math.floor((submission.getTime() - treatment.getTime()) / (1000 * 3600 * 24));
  const businessDaysElapsed = calcBusinessDaysBetween(treatment, submission);

  if (businessDaysElapsed > sla_business_days) {
    return {
      rule_id: rule.rule_id,
      rule_type: rule.rule_type,
      description: rule.description,
      result: 'FAIL',
      explanation: `SLA exceeded: claim submitted ${businessDaysElapsed} business days after treatment date (${claim.treatment_date}). The required SLA is ${sla_business_days} business days.`,
      remediation: `Future claims must be submitted within ${sla_business_days} business days of treatment.`
    };
  }

  return {
    rule_id: rule.rule_id,
    rule_type: rule.rule_type,
    description: rule.description,
    result: 'PASS',
    explanation: `SLA is within limits: claim submitted ${businessDaysElapsed} business days after treatment (max: ${sla_business_days}).`
  };
}
