import { Claim } from '../src/types';
import {
  duplicateClaimRule,
  rapidResubmissionRule,
  upcodingRule,
  unbundlingRule,
  phantomBillingRule,
  weekendAnomalyRule,
  diagnosisMismatchRule,
  amountClusteringRule
} from '../src/rules';

function createDummyClaim(overrides: Partial<Claim> = {}): Claim {
  return {
    claim_id: 'C-001',
    member_id: 'M-001',
    provider_id: 'P-001',
    provider_name: 'Test Clinic',
    claim_date: '2024-05-15', // Wednesday
    claim_type: 'OUTPATIENT',
    diagnosis_code: 'D-001',
    procedure_codes: ['P-101'],
    submitted_amount: 1000,
    is_weekend: false,
    is_fraudulent: false,
    ...overrides
  };
}

describe('Fraud Scoring Rules', () => {
  describe('Rule 1: Duplicate Claim', () => {
    it('should flag exact duplicates', () => {
      const c1 = createDummyClaim();
      const c2 = createDummyClaim({ claim_id: 'C-002' }); // same fields otherwise
      const flag = duplicateClaimRule.evaluate(c2, [c1, c2]);
      expect(flag).not.toBeNull();
      expect(flag?.rule).toBe('duplicate_claim');
      expect(flag?.evidence).toContain('C-001');
    });

    it('should not flag if date differs', () => {
      const c1 = createDummyClaim({ claim_date: '2024-05-15' });
      const c2 = createDummyClaim({ claim_id: 'C-002', claim_date: '2024-05-16' });
      expect(duplicateClaimRule.evaluate(c2, [c1, c2])).toBeNull();
    });
  });

  describe('Rule 2: Rapid Re-submission', () => {
    it('should flag same member, same diagnosis within 7 days', () => {
      const c1 = createDummyClaim({ claim_date: '2024-05-10' });
      const c2 = createDummyClaim({ claim_id: 'C-002', claim_date: '2024-05-15' }); // 5 days
      const flag = rapidResubmissionRule.evaluate(c2, [c1, c2]);
      expect(flag).not.toBeNull();
      expect(flag?.evidence).toContain('Rapid re-submission');
    });

    it('should not flag if > 7 days', () => {
      const c1 = createDummyClaim({ claim_date: '2024-05-10' });
      const c2 = createDummyClaim({ claim_id: 'C-002', claim_date: '2024-05-20' }); // 10 days
      expect(rapidResubmissionRule.evaluate(c2, [c1, c2])).toBeNull();
    });
  });

  describe('Rule 3: Upcoding', () => {
    it('should flag if amount is > 2 std dev above mean', () => {
      const claims = [
        createDummyClaim({ submitted_amount: 1000 }),
        createDummyClaim({ submitted_amount: 1100 }),
        createDummyClaim({ submitted_amount: 900 })
      ];
      // Mean = 1000, StdDev = ~100
      upcodingRule.aggregate && upcodingRule.aggregate(claims);
      
      const suspicious = createDummyClaim({ submitted_amount: 2000 }); // Way above 1000 + 200
      const flag = upcodingRule.evaluate(suspicious, claims);
      expect(flag).not.toBeNull();
      expect(flag?.rule).toBe('upcoding');
    });

    it('should not flag normal amount', () => {
      const claims = [
        createDummyClaim({ submitted_amount: 1000 }),
        createDummyClaim({ submitted_amount: 1100 }),
        createDummyClaim({ submitted_amount: 900 })
      ];
      upcodingRule.aggregate && upcodingRule.aggregate(claims);
      
      const normal = createDummyClaim({ submitted_amount: 1050 }); 
      expect(upcodingRule.evaluate(normal, claims)).toBeNull();
    });
  });

  describe('Rule 4: Unbundling', () => {
    it('should flag if multiple codes cover a bundle', () => {
      // In bundled_codes.json: BND-01 requires P-101, P-102, P-103
      const c = createDummyClaim({ procedure_codes: ['P-101', 'P-102', 'P-103', 'P-999'] });
      const flag = unbundlingRule.evaluate(c, [c]);
      expect(flag).not.toBeNull();
      expect(flag?.rule).toBe('unbundling');
      expect(flag?.evidence).toContain('BND-01');
    });

    it('should not flag partial bundle', () => {
      const c = createDummyClaim({ procedure_codes: ['P-101', 'P-102'] });
      expect(unbundlingRule.evaluate(c, [c])).toBeNull();
    });
  });

  describe('Rule 5: Phantom Billing', () => {
    it('should flag > 30 claims on same day for provider', () => {
      const claims: Claim[] = Array.from({length: 35}, (_, i) => 
        createDummyClaim({ claim_id: `C-${i}`, provider_id: 'P-999', claim_date: '2024-06-01' })
      );
      phantomBillingRule.aggregate && phantomBillingRule.aggregate(claims);
      
      const flag = phantomBillingRule.evaluate(claims[0], claims);
      expect(flag).not.toBeNull();
      expect(flag?.evidence).toContain('exceeds threshold of 30');
    });

    it('should not flag normal volume', () => {
      const claims: Claim[] = Array.from({length: 10}, (_, i) => 
        createDummyClaim({ claim_id: `C-${i}`, provider_id: 'P-999', claim_date: '2024-06-01' })
      );
      // Need to isolate state or reset, but JS module state is shared across tests. 
      // For simplicity in this demo test, we use a new provider ID
      const claims2: Claim[] = Array.from({length: 10}, (_, i) => 
        createDummyClaim({ claim_id: `CX-${i}`, provider_id: 'P-888', claim_date: '2024-06-02' })
      );
      phantomBillingRule.aggregate && phantomBillingRule.aggregate(claims2);
      expect(phantomBillingRule.evaluate(claims2[0], claims2)).toBeNull();
    });
  });

  describe('Rule 6: Weekend Anomaly', () => {
    it('should flag weekend surgical claim for weekday-only provider', () => {
      const claims: Claim[] = Array.from({length: 50}, (_, i) => 
        createDummyClaim({ claim_id: `C-${i}`, provider_id: 'P-W', is_weekend: false })
      );
      weekendAnomalyRule.aggregate && weekendAnomalyRule.aggregate(claims);

      const suspicious = createDummyClaim({
        provider_id: 'P-W',
        is_weekend: true,
        procedure_codes: ['P-501'] // Surgical code
      });
      const flag = weekendAnomalyRule.evaluate(suspicious, claims);
      expect(flag).not.toBeNull();
      expect(flag?.rule).toBe('weekend_anomaly');
    });

    it('should not flag non-surgical weekend claim', () => {
      const suspicious = createDummyClaim({
        provider_id: 'P-W',
        is_weekend: true,
        procedure_codes: ['P-101'] // Not surgical
      });
      expect(weekendAnomalyRule.evaluate(suspicious, [])).toBeNull();
    });
  });

  describe('Rule 7: Diagnosis-Procedure Mismatch', () => {
    it('should flag mismatch', () => {
      // In clinical_pairs.json: D-001 supports P-101, P-102, P-103
      const c = createDummyClaim({ diagnosis_code: 'D-001', procedure_codes: ['P-999'] });
      const flag = diagnosisMismatchRule.evaluate(c, [c]);
      expect(flag).not.toBeNull();
      expect(flag?.rule).toBe('diagnosis_procedure_mismatch');
    });

    it('should not flag valid pair', () => {
      const c = createDummyClaim({ diagnosis_code: 'D-001', procedure_codes: ['P-101'] });
      expect(diagnosisMismatchRule.evaluate(c, [c])).toBeNull();
    });
  });

  describe('Rule 8: Amount Clustering', () => {
    it('should flag amounts just below 50000', () => {
      const c = createDummyClaim({ submitted_amount: 49500 });
      const flag = amountClusteringRule.evaluate(c, [c]);
      expect(flag).not.toBeNull();
      expect(flag?.rule).toBe('amount_clustering');
      expect(flag?.evidence).toContain('auto-approval threshold');
    });

    it('should not flag low amounts', () => {
      const c = createDummyClaim({ submitted_amount: 45000 });
      expect(amountClusteringRule.evaluate(c, [c])).toBeNull();
    });

    it('should not flag amounts above threshold', () => {
      const c = createDummyClaim({ submitted_amount: 51000 });
      expect(amountClusteringRule.evaluate(c, [c])).toBeNull();
    });
  });
});
