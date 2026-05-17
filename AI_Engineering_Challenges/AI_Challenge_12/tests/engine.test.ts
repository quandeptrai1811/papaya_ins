import { validateClaim, filterActiveRules, loadCountryConfig } from '../src/engine';
import { diffCountries } from '../src/diff';
import { Claim, Rule } from '../src/types';

function makeClaim(overrides: Partial<Claim> = {}): Claim {
  return {
    claim_id: 'TEST-001',
    country: 'thailand',
    claim_type: 'outpatient',
    member_id: 'M-001',
    member_name: 'Test User',
    national_id: '1234567890123',
    policy_start_date: '2023-01-01',
    submission_date: '2024-06-01',
    treatment_date: '2024-05-28',
    documents_submitted: ['medical_receipt', 'prescription'],
    is_preexisting: false,
    policy_age_months: 17,
    ...overrides
  };
}

// ── Engine Integration Tests ─────────────────────────────────────────────────

describe('Engine: Thai outpatient — fully compliant', () => {
  it('should return COMPLIANT for a clean Thai outpatient claim', () => {
    const claim = makeClaim();
    const result = validateClaim(claim);
    expect(result.overall_status).toBe('COMPLIANT');
    expect(result.rules_failed).toBe(0);
  });
});

describe('Engine: Thai inpatient missing discharge_summary', () => {
  it('should return NON_COMPLIANT or PARTIALLY_COMPLIANT with a FAIL for TH-DOC-02', () => {
    const claim = makeClaim({ claim_type: 'inpatient', documents_submitted: ['medical_receipt'] });
    const result = validateClaim(claim);
    const docFail = result.evaluations.find(e => e.rule_id === 'TH-DOC-02');
    expect(docFail?.result).toBe('FAIL');
    expect(docFail?.explanation).toContain('discharge summary');
  });
});

describe('Engine: Thai emergency claim should always PASS TH-COV-01', () => {
  it('should pass the emergency coverage mandate', () => {
    const claim = makeClaim({ claim_type: 'emergency', is_emergency: true, documents_submitted: ['medical_receipt'] });
    const result = validateClaim(claim);
    const cov = result.evaluations.find(e => e.rule_id === 'TH-COV-01');
    expect(cov?.result).toBe('PASS');
  });
});

// ── Waiting Period Tests ──────────────────────────────────────────────────────

describe('Waiting Period: general waiting period failure', () => {
  it('should FAIL if treatment is within the 30-day general waiting period for Thailand', () => {
    const claim = makeClaim({ policy_start_date: '2024-01-01', treatment_date: '2024-01-10', submission_date: '2024-01-11' });
    const result = validateClaim(claim);
    const wait = result.evaluations.find(e => e.rule_id === 'TH-WAIT-01');
    expect(wait?.result).toBe('FAIL');
    expect(wait?.explanation).toContain('9 days after policy start');
  });

  it('should PASS if treatment is after the 30-day general waiting period', () => {
    const claim = makeClaim({ policy_start_date: '2024-01-01', treatment_date: '2024-02-05', submission_date: '2024-02-06' });
    const result = validateClaim(claim);
    const wait = result.evaluations.find(e => e.rule_id === 'TH-WAIT-01');
    expect(wait?.result).toBe('PASS');
  });

  it('should FAIL pre-existing condition within 120-day waiting period', () => {
    const claim = makeClaim({ is_preexisting: true, policy_start_date: '2024-01-01', treatment_date: '2024-03-15', submission_date: '2024-03-16' });
    const result = validateClaim(claim);
    const wait = result.evaluations.find(e => e.rule_id === 'TH-WAIT-01');
    expect(wait?.result).toBe('FAIL');
    expect(wait?.explanation).toContain('120 days');
  });
});

// ── Data Masking Tests ────────────────────────────────────────────────────────

describe('Data Masking: Thai national_id last_4', () => {
  it('should mask national_id to show only last 4 digits', () => {
    const claim = makeClaim({ national_id: '1234567890123' });
    const result = validateClaim(claim);
    const mask = result.evaluations.find(e => e.rule_id === 'TH-MASK-01');
    expect(mask?.masked_data?.national_id).toBe('*********0123');
  });
});

describe('Data Masking: Vietnam member_name initials', () => {
  it('should mask member_name to initials only', () => {
    const claim = makeClaim({ country: 'vietnam', member_name: 'Nguyen Van An', documents_submitted: ['medical_receipt', 'id_card_copy'] });
    const result = validateClaim(claim);
    const mask = result.evaluations.find(e => e.rule_id === 'VN-MASK-01');
    expect(mask?.masked_data?.member_name).toBe('N. A.');
  });
});

describe('Data Masking: Hong Kong HKID first_char_last_digit', () => {
  it('should mask HKID to first letter and last digit only', () => {
    const claim = makeClaim({ country: 'hong_kong', national_id: 'A1234567', documents_submitted: ['medical_receipt'] });
    const result = validateClaim(claim);
    const mask = result.evaluations.find(e => e.rule_id === 'HK-MASK-01');
    expect(mask?.masked_data?.national_id).toBe('A******7');
  });
});

// ── Rule Versioning Tests ─────────────────────────────────────────────────────

describe('Rule Versioning', () => {
  it('should exclude rules not yet effective at submission date', () => {
    const rules: Rule[] = [
      { rule_id: 'R-001', description: 'Future rule', rule_type: 'document_requirement', parameters: {}, effective_date: '2025-01-01', expiry_date: null }
    ];
    const active = filterActiveRules(rules, '2024-06-01');
    expect(active).toHaveLength(0);
  });

  it('should include rules effective at submission date', () => {
    const rules: Rule[] = [
      { rule_id: 'R-002', description: 'Past rule', rule_type: 'document_requirement', parameters: {}, effective_date: '2023-01-01', expiry_date: null }
    ];
    const active = filterActiveRules(rules, '2024-06-01');
    expect(active).toHaveLength(1);
  });

  it('should exclude expired rules', () => {
    const rules: Rule[] = [
      { rule_id: 'R-003', description: 'Expired rule', rule_type: 'document_requirement', parameters: {}, effective_date: '2023-01-01', expiry_date: '2023-12-31' }
    ];
    const active = filterActiveRules(rules, '2024-06-01');
    expect(active).toHaveLength(0);
  });
});

// ── VN Coverage Mandate Tests ─────────────────────────────────────────────────

describe('Vietnam: Maternity coverage mandate', () => {
  it('should apply maternity mandate for policies > 12 months old', () => {
    const claim = makeClaim({ country: 'vietnam', claim_type: 'maternity', policy_age_months: 15, documents_submitted: ['medical_receipt', 'id_card_copy'] });
    const result = validateClaim(claim);
    const mandate = result.evaluations.find(e => e.rule_id === 'VN-COV-01');
    expect(mandate?.result).toBe('PASS');
  });

  it('should SKIP maternity mandate for policies <= 12 months old', () => {
    const claim = makeClaim({ country: 'vietnam', claim_type: 'maternity', policy_age_months: 10, documents_submitted: ['medical_receipt', 'id_card_copy'] });
    const result = validateClaim(claim);
    const mandate = result.evaluations.find(e => e.rule_id === 'VN-COV-01');
    expect(mandate?.result).toBe('SKIPPED');
  });
});

// ── Diff Tests ────────────────────────────────────────────────────────────────

describe('Rule Diff', () => {
  it('should detect differences between Thailand and Vietnam', () => {
    const diffs = diffCountries('thailand', 'vietnam');
    expect(diffs.length).toBeGreaterThan(0);
  });

  it('should detect differences between Thailand and Hong Kong', () => {
    const diffs = diffCountries('thailand', 'hong_kong');
    expect(diffs.some(d => d.rule_type === 'waiting_period')).toBe(true);
  });

  it('should detect coverage mandate differences between Vietnam and Hong Kong', () => {
    const diffs = diffCountries('vietnam', 'hong_kong');
    const coverageDiff = diffs.find(d => d.rule_type === 'coverage_mandate');
    expect(coverageDiff).toBeDefined();
  });
});
