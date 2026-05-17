import { Claim, Rule, RuleEvaluation } from '../types';

function maskLast4(value: string): string {
  if (value.length <= 4) return value;
  return '*'.repeat(value.length - 4) + value.slice(-4);
}

function maskInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0] + '.';
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return `${first}. ${last}.`;
}

function maskFirstCharLastDigit(value: string): string {
  const first = value[0];
  const lastDigit = value.match(/\d/g)?.pop() ?? value[value.length - 1];
  return `${first}${'*'.repeat(Math.max(0, value.length - 2))}${lastDigit}`;
}

export function evaluateDataMasking(claim: Claim, rule: Rule): RuleEvaluation {
  const { field, mask_strategy } = rule.parameters;
  if (!field || !mask_strategy) {
    return { rule_id: rule.rule_id, rule_type: rule.rule_type, description: rule.description, result: 'SKIPPED', explanation: 'Masking field or strategy not defined.' };
  }

  const rawValue = (claim as any)[field] as string | undefined;
  if (!rawValue) {
    return {
      rule_id: rule.rule_id,
      rule_type: rule.rule_type,
      description: rule.description,
      result: 'FAIL',
      explanation: `Field '${field}' not found on claim.`,
      remediation: `Ensure the claim includes the '${field}' field.`
    };
  }

  let maskedValue: string;
  switch (mask_strategy) {
    case 'last_4':           maskedValue = maskLast4(rawValue); break;
    case 'initials':         maskedValue = maskInitials(rawValue); break;
    case 'first_char_last_digit': maskedValue = maskFirstCharLastDigit(rawValue); break;
    default:                 maskedValue = '***';
  }

  return {
    rule_id: rule.rule_id,
    rule_type: rule.rule_type,
    description: rule.description,
    result: 'PASS',
    explanation: `Field '${field}' will be masked in reports using strategy '${mask_strategy}'.`,
    masked_data: { [field]: maskedValue }
  };
}
