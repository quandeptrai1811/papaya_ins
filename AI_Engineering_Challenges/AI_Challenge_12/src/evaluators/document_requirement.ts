import { Claim, Rule, RuleEvaluation } from '../types';

export function evaluateDocumentRequirement(claim: Claim, rule: Rule): RuleEvaluation {
  const { required_documents = [], applies_to_claim_types = [] } = rule.parameters;

  // Only applies to specific claim types
  if (applies_to_claim_types.length > 0 && !applies_to_claim_types.includes(claim.claim_type)) {
    return {
      rule_id: rule.rule_id,
      rule_type: rule.rule_type,
      description: rule.description,
      result: 'SKIPPED',
      explanation: `Rule does not apply to ${claim.claim_type} claims.`
    };
  }

  const missing = required_documents.filter(doc => !claim.documents_submitted.includes(doc));
  if (missing.length > 0) {
    return {
      rule_id: rule.rule_id,
      rule_type: rule.rule_type,
      description: rule.description,
      result: 'FAIL',
      explanation: `Missing required document(s) for ${claim.claim_type} claim in ${claim.country}: ${missing.map(d => d.replace(/_/g, ' ')).join(', ')}.`,
      remediation: `Submit the following documents: ${missing.map(d => d.replace(/_/g, ' ')).join(', ')}.`
    };
  }

  return {
    rule_id: rule.rule_id,
    rule_type: rule.rule_type,
    description: rule.description,
    result: 'PASS',
    explanation: `All required documents are present for ${claim.claim_type} claim.`
  };
}
