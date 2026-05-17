export interface Claim {
  claim_id: string;
  member_id: string;
  provider_id: string;
  provider_name: string;
  claim_date: string; // ISO format (YYYY-MM-DD)
  claim_type: 'OUTPATIENT' | 'INPATIENT' | 'DENTAL';
  diagnosis_code: string;
  procedure_codes: string[];
  submitted_amount: number;
  is_weekend: boolean;
  // Hidden field used only for evaluation metrics
  is_fraudulent: boolean;
  fraud_patterns?: string[]; // Tags indicating which patterns were intentionally embedded
}

export interface FraudFlag {
  rule: string;
  severity: number;
  evidence: string;
}

export interface ScoredClaim {
  claim_id: string;
  risk_score: number;
  flags: FraudFlag[];
}

export interface RuleEvaluator {
  name: string;
  severity: number; // 1-5
  // Pass 1: Optional aggregation (e.g., calculating standard deviations, provider stats)
  aggregate?: (claims: Claim[]) => void;
  // Pass 2: Evaluation
  evaluate: (claim: Claim, allClaims: Claim[]) => FraudFlag | null;
}

export interface FraudMetrics {
  total_claims: number;
  actual_frauds: number;
  predicted_frauds: number;
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  precision: number;
  recall: number;
  fpr: number; // False Positive Rate
}
