import * as fs from 'fs';
import * as path from 'path';
import { Claim, CountryConfig, Rule, RuleEvaluation, ValidationResult, ComplianceStatus } from './types';
import { evaluateDocumentRequirement } from './evaluators/document_requirement';
import { evaluateSlaCheck } from './evaluators/sla_check';
import { evaluateWaitingPeriod } from './evaluators/waiting_period';
import { evaluateDataMasking } from './evaluators/data_masking';
import { evaluateCoverageMandate } from './evaluators/coverage_mandate';

const RULES_DIR = path.join(__dirname, '../data/rules');

// ── Config Loader ──────────────────────────────────────────────────────────

export function loadCountryConfig(country: string): CountryConfig {
  const normalized = country.toLowerCase().replace(/\s+/g, '_');
  const filePath = path.join(RULES_DIR, `${normalized}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`No rule configuration found for country: ${country}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CountryConfig;
}

export function listAvailableCountries(): string[] {
  return fs
    .readdirSync(RULES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

// ── Rule Versioning ────────────────────────────────────────────────────────

export function filterActiveRules(rules: Rule[], submissionDate: string): Rule[] {
  const submission = new Date(submissionDate);
  return rules.filter(rule => {
    const effective = new Date(rule.effective_date);
    if (effective > submission) return false; // rule not yet active at claim submission
    if (rule.expiry_date) {
      const expiry = new Date(rule.expiry_date);
      if (expiry < submission) return false; // rule has expired
    }
    return true;
  });
}

// ── Rule Evaluation Dispatch ───────────────────────────────────────────────

function evaluateRule(claim: Claim, rule: Rule): RuleEvaluation {
  switch (rule.rule_type) {
    case 'document_requirement': return evaluateDocumentRequirement(claim, rule);
    case 'sla_check':            return evaluateSlaCheck(claim, rule);
    case 'waiting_period':       return evaluateWaitingPeriod(claim, rule);
    case 'data_masking':         return evaluateDataMasking(claim, rule);
    case 'coverage_mandate':     return evaluateCoverageMandate(claim, rule);
    default:
      return {
        rule_id: rule.rule_id,
        rule_type: rule.rule_type,
        description: rule.description,
        result: 'SKIPPED',
        explanation: `Unknown rule type: ${rule.rule_type}`
      };
  }
}

// ── Main Engine ────────────────────────────────────────────────────────────

export function validateClaim(claim: Claim): ValidationResult {
  const config = loadCountryConfig(claim.country);
  const activeRules = filterActiveRules(config.rules, claim.submission_date);

  const evaluations: RuleEvaluation[] = activeRules.map(rule => evaluateRule(claim, rule));

  const passed = evaluations.filter(e => e.result === 'PASS').length;
  const failed = evaluations.filter(e => e.result === 'FAIL').length;

  let overall_status: ComplianceStatus;
  if (failed === 0) {
    overall_status = 'COMPLIANT';
  } else if (passed > 0 && failed > 0) {
    overall_status = 'PARTIALLY_COMPLIANT';
  } else {
    overall_status = 'NON_COMPLIANT';
  }

  return {
    claim_id: claim.claim_id,
    country: claim.country,
    submission_date: claim.submission_date,
    overall_status,
    rules_evaluated: evaluations.length,
    rules_passed: passed,
    rules_failed: failed,
    evaluations
  };
}

export function validateAllClaims(claims: Claim[]): ValidationResult[] {
  return claims.map(validateClaim);
}
