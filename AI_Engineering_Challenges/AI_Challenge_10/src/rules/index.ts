import { Claim, RuleEvaluator } from '../types';
import bundledCodes from '../../data/bundled_codes.json';
import clinicalPairs from '../../data/clinical_pairs.json';

// 1. Duplicate Claim
export const duplicateClaimRule: RuleEvaluator = {
  name: 'duplicate_claim',
  severity: 5,
  aggregate: (claims: Claim[]) => {
    // Optimization: could pre-calculate duplicates
  },
  evaluate: (claim: Claim, allClaims: Claim[]) => {
    const duplicates = allClaims.filter(c => 
      c.claim_id !== claim.claim_id &&
      c.member_id === claim.member_id &&
      c.provider_id === claim.provider_id &&
      c.claim_date === claim.claim_date &&
      c.diagnosis_code === claim.diagnosis_code
    );
    if (duplicates.length > 0) {
      return {
        rule: 'duplicate_claim',
        severity: 5,
        evidence: `Duplicate of ${duplicates.map(d => d.claim_id).join(', ')} (Same member, provider, date, diagnosis).`
      };
    }
    return null;
  }
};

// 2. Rapid Re-submission
export const rapidResubmissionRule: RuleEvaluator = {
  name: 'rapid_resubmission',
  severity: 4,
  evaluate: (claim: Claim, allClaims: Claim[]) => {
    const claimDate = new Date(claim.claim_date).getTime();
    const rapids = allClaims.filter(c => {
      if (c.claim_id === claim.claim_id) return false;
      if (c.member_id !== claim.member_id || c.diagnosis_code !== claim.diagnosis_code) return false;
      const otherDate = new Date(c.claim_date).getTime();
      const diffDays = Math.abs(claimDate - otherDate) / (1000 * 3600 * 24);
      return diffDays <= 7;
    });

    if (rapids.length > 0) {
      return {
        rule: 'rapid_resubmission',
        severity: 4,
        evidence: `Rapid re-submission with ${rapids.map(d => d.claim_id).join(', ')} (Same member, diagnosis within 7 days).`
      };
    }
    return null;
  }
};

// 3. Upcoding
const procedureStats: Record<string, { mean: number, stddev: number, count: number, sum: number, sumSq: number }> = {};
export const upcodingRule: RuleEvaluator = {
  name: 'upcoding',
  severity: 4,
  aggregate: (claims: Claim[]) => {
    // Pass 1a: Means
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    for (const c of claims) {
      const proc = c.procedure_codes[0]; // simplistic assumption for primary procedure cost
      if (!sums[proc]) { sums[proc] = 0; counts[proc] = 0; }
      sums[proc] += c.submitted_amount;
      counts[proc]++;
    }
    const means: Record<string, number> = {};
    for (const p in sums) means[p] = sums[p] / counts[p];

    // Pass 1b: Variance & StdDev
    const sumSq: Record<string, number> = {};
    for (const c of claims) {
      const proc = c.procedure_codes[0];
      if (!sumSq[proc]) sumSq[proc] = 0;
      sumSq[proc] += Math.pow(c.submitted_amount - means[proc], 2);
    }
    
    for (const p in sums) {
      const variance = counts[p] > 1 ? sumSq[p] / (counts[p] - 1) : 0;
      procedureStats[p] = {
        mean: means[p],
        stddev: Math.sqrt(variance),
        count: counts[p],
        sum: sums[p],
        sumSq: sumSq[p]
      };
    }
  },
  evaluate: (claim: Claim) => {
    const proc = claim.procedure_codes[0];
    const stats = procedureStats[proc];
    if (stats && stats.stddev > 0) {
      const threshold = stats.mean + 2 * stats.stddev;
      if (claim.submitted_amount > threshold) {
        const diffStdDevs = ((claim.submitted_amount - stats.mean) / stats.stddev).toFixed(2);
        return {
          rule: 'upcoding',
          severity: 4,
          evidence: `Submitted amount ${claim.submitted_amount} for procedure ${proc} is ${diffStdDevs} standard deviations above the mean of ${Math.round(stats.mean)}.`
        };
      }
    }
    return null;
  }
};

// 4. Unbundling
export const unbundlingRule: RuleEvaluator = {
  name: 'unbundling',
  severity: 4,
  evaluate: (claim: Claim) => {
    if (claim.procedure_codes.length <= 1) return null;
    
    // Check if any bundle is fully covered by the claim's procedures
    for (const [bundle, codes] of Object.entries(bundledCodes)) {
      const c = codes as string[];
      const isUnbundled = c.every(code => claim.procedure_codes.includes(code));
      if (isUnbundled) {
        return {
          rule: 'unbundling',
          severity: 4,
          evidence: `Multiple individual procedures (${c.join(', ')}) submitted when bundled code ${bundle} exists.`
        };
      }
    }
    return null;
  }
};

// 5. Phantom Billing
const providerDailyCounts: Record<string, number> = {};
export const phantomBillingRule: RuleEvaluator = {
  name: 'phantom_billing',
  severity: 5,
  aggregate: (claims: Claim[]) => {
    for (const c of claims) {
      const key = `${c.provider_id}_${c.claim_date}`;
      providerDailyCounts[key] = (providerDailyCounts[key] || 0) + 1;
    }
  },
  evaluate: (claim: Claim) => {
    const key = `${claim.provider_id}_${claim.claim_date}`;
    const count = providerDailyCounts[key];
    if (count > 30) {
      return {
        rule: 'phantom_billing',
        severity: 5,
        evidence: `Provider ${claim.provider_name} submitted ${count} claims on ${claim.claim_date} (exceeds threshold of 30).`
      };
    }
    return null;
  }
};

// 6. Weekend Anomaly
const providerWeekendStats: Record<string, { weekend: number, total: number }> = {};
export const weekendAnomalyRule: RuleEvaluator = {
  name: 'weekend_anomaly',
  severity: 3,
  aggregate: (claims: Claim[]) => {
    for (const c of claims) {
      if (!providerWeekendStats[c.provider_id]) {
        providerWeekendStats[c.provider_id] = { weekend: 0, total: 0 };
      }
      providerWeekendStats[c.provider_id].total++;
      if (c.is_weekend) {
        providerWeekendStats[c.provider_id].weekend++;
      }
    }
  },
  evaluate: (claim: Claim) => {
    // Only check surgical procedures (e.g. P-501, P-502, P-503, BND-05 based on our generator)
    const isSurgical = claim.procedure_codes.some(p => ['P-501', 'P-502', 'P-503', 'BND-05'].includes(p));
    if (!isSurgical || !claim.is_weekend) return null;

    const stats = providerWeekendStats[claim.provider_id];
    if (stats) {
      const weekendRatio = stats.weekend / stats.total;
      if (weekendRatio < 0.05) {
        return {
          rule: 'weekend_anomaly',
          severity: 3,
          evidence: `Surgical procedure on a weekend from provider ${claim.provider_name} who has ${(weekendRatio * 100).toFixed(1)}% historical weekend volume.`
        };
      }
    }
    return null;
  }
};

// 7. Diagnosis-Procedure Mismatch
export const diagnosisMismatchRule: RuleEvaluator = {
  name: 'diagnosis_procedure_mismatch',
  severity: 3,
  evaluate: (claim: Claim) => {
    const validProcs = (clinicalPairs as any)[claim.diagnosis_code] as string[];
    if (!validProcs) return null; // unknown diagnosis

    const mismatches = claim.procedure_codes.filter(p => !validProcs.includes(p));
    if (mismatches.length > 0) {
      return {
        rule: 'diagnosis_procedure_mismatch',
        severity: 3,
        evidence: `Procedures [${mismatches.join(', ')}] are not clinically associated with diagnosis ${claim.diagnosis_code}.`
      };
    }
    return null;
  }
};

// 8. Amount Clustering
export const amountClusteringRule: RuleEvaluator = {
  name: 'amount_clustering',
  severity: 2,
  evaluate: (claim: Claim) => {
    const threshold = 50000;
    const lowerBound = threshold * 0.95; // 47500
    if (claim.submitted_amount >= lowerBound && claim.submitted_amount < threshold) {
      const pct = ((claim.submitted_amount / threshold) * 100).toFixed(1);
      return {
        rule: 'amount_clustering',
        severity: 2,
        evidence: `Amount ${claim.submitted_amount} is ${pct}% of the 50,000 auto-approval threshold.`
      };
    }
    return null;
  }
};

export const allRules = [
  duplicateClaimRule,
  rapidResubmissionRule,
  upcodingRule,
  unbundlingRule,
  phantomBillingRule,
  weekendAnomalyRule,
  diagnosisMismatchRule,
  amountClusteringRule
];
