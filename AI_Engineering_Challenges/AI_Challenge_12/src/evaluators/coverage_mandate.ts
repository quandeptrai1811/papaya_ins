import { Claim, Rule, RuleEvaluation } from '../types';

function evaluateCondition(condition: string, claim: Claim): boolean {
  // Safe, structured condition evaluator (no eval())
  // Supports: "claim_type == 'emergency'", "policy_age_months > 12"
  const eqMatch = condition.match(/^(\w+)\s*==\s*'([^']+)'$/);
  if (eqMatch) {
    const [, key, val] = eqMatch;
    return (claim as any)[key] === val;
  }
  const gtMatch = condition.match(/^(\w+)\s*>\s*(\d+)$/);
  if (gtMatch) {
    const [, key, val] = gtMatch;
    return ((claim as any)[key] as number) > parseInt(val, 10);
  }
  return false;
}

const mandateMessages: Record<string, string> = {
  emergency_coverage: 'Emergency treatment must be covered regardless of network status.',
  maternity_coverage: 'Maternity treatment must be covered for policies older than 12 months.',
  mental_health_parity: 'Mental health claims must be covered at the same level as physical health claims.'
};

export function evaluateCoverageMandate(claim: Claim, rule: Rule): RuleEvaluation {
  const { mandate_type, condition } = rule.parameters;

  if (!mandate_type || !condition) {
    return { rule_id: rule.rule_id, rule_type: rule.rule_type, description: rule.description, result: 'SKIPPED', explanation: 'Mandate type or condition not configured.' };
  }

  const conditionMet = evaluateCondition(condition, claim);
  if (!conditionMet) {
    return {
      rule_id: rule.rule_id,
      rule_type: rule.rule_type,
      description: rule.description,
      result: 'SKIPPED',
      explanation: `Coverage mandate '${mandate_type}' does not apply to this claim (condition: ${condition} is not met).`
    };
  }

  // If the condition matches, the mandate must be honoured — this is always a PASS
  // (it's a coverage guarantee, not a document requirement)
  return {
    rule_id: rule.rule_id,
    rule_type: rule.rule_type,
    description: rule.description,
    result: 'PASS',
    explanation: `Coverage mandate '${mandate_type}' applies and must be honoured: ${mandateMessages[mandate_type] ?? rule.description}`
  };
}
