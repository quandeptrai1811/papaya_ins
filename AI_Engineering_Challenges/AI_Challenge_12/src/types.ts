// ─── Country Rule Config ───────────────────────────────────────────────────

export type RuleType =
  | 'document_requirement'
  | 'sla_check'
  | 'waiting_period'
  | 'data_masking'
  | 'coverage_mandate';

export type ClaimType = 'outpatient' | 'inpatient' | 'dental' | 'specialist' | 'maternity' | 'mental_health' | 'emergency';

export interface RuleParameters {
  // document_requirement
  required_documents?: string[];
  applies_to_claim_types?: ClaimType[];
  // sla_check
  sla_business_days?: number;
  sla_claim_types?: ClaimType[];
  // waiting_period
  waiting_days_general?: number;
  waiting_days_preexisting?: number;
  // data_masking
  field?: string;
  mask_strategy?: 'last_4' | 'initials' | 'first_char_last_digit';
  // coverage_mandate
  mandate_type?: string;
  condition?: string; // e.g. "policy_age_months > 12"
}

export interface Rule {
  rule_id: string;
  description: string;
  rule_type: RuleType;
  parameters: RuleParameters;
  effective_date: string; // ISO date
  expiry_date?: string | null;
}

export interface CountryConfig {
  country: string;
  rules: Rule[];
}

// ─── Claims ────────────────────────────────────────────────────────────────

export interface Claim {
  claim_id: string;
  country: string;
  claim_type: ClaimType;
  member_id: string;
  member_name: string;
  national_id: string; // full PII
  policy_start_date: string;
  submission_date: string;
  treatment_date: string;
  documents_submitted: string[];
  is_preexisting: boolean;
  is_emergency?: boolean;
  policy_age_months?: number;
}

// ─── Validation Results ────────────────────────────────────────────────────

export type RuleResult = 'PASS' | 'FAIL' | 'SKIPPED';
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT';

export interface RuleEvaluation {
  rule_id: string;
  rule_type: RuleType;
  description: string;
  result: RuleResult;
  explanation: string;
  remediation?: string;
  masked_data?: Record<string, string>; // For data_masking rules
}

export interface ValidationResult {
  claim_id: string;
  country: string;
  submission_date: string;
  overall_status: ComplianceStatus;
  rules_evaluated: number;
  rules_passed: number;
  rules_failed: number;
  evaluations: RuleEvaluation[];
}

// ─── Rule Diff ─────────────────────────────────────────────────────────────

export interface RuleDiff {
  rule_type: RuleType;
  country_a: string;
  country_b: string;
  difference: string;
}
