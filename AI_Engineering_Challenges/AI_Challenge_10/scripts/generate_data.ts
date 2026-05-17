import * as fs from 'fs';
import * as path from 'path';
import { Claim } from '../src/types';
import clinicalPairs from '../data/clinical_pairs.json';
import bundledCodes from '../data/bundled_codes.json';

const NUM_MEMBERS = 500;
const NUM_PROVIDERS = 50;
const TOTAL_CLAIMS = 2000;
const START_DATE = new Date('2024-01-01');
const END_DATE = new Date('2024-12-31');

const members = Array.from({ length: NUM_MEMBERS }, (_, i) => `M-${(i + 1).toString().padStart(4, '0')}`);
const providers = Array.from({ length: NUM_PROVIDERS }, (_, i) => ({
  id: `PRV-${(i + 1).toString().padStart(3, '0')}`,
  name: `Provider Clinic ${i + 1}`,
  isWeekdayOnly: i < 10 // First 10 providers never work weekends normally
}));

const diagnoses = Object.keys(clinicalPairs);

// Procedure cost profiles (mean, stddev)
const procedureProfiles: Record<string, { mean: number, stddev: number, isSurgical?: boolean }> = {
  'P-101': { mean: 2000, stddev: 200 },
  'P-102': { mean: 3500, stddev: 300 },
  'P-103': { mean: 5000, stddev: 500 },
  'BND-01': { mean: 9000, stddev: 800 },
  'P-201': { mean: 1500, stddev: 150 },
  'P-202': { mean: 4000, stddev: 400 },
  'BND-02': { mean: 5000, stddev: 500 },
  'P-301': { mean: 8000, stddev: 600 },
  'P-302': { mean: 12000, stddev: 1000 },
  'P-303': { mean: 25000, stddev: 2000 },
  'P-304': { mean: 3000, stddev: 250 },
  'BND-03': { mean: 45000, stddev: 3000 },
  'P-401': { mean: 1000, stddev: 100 },
  'P-402': { mean: 2000, stddev: 200 },
  'BND-04': { mean: 2800, stddev: 250 },
  'P-501': { mean: 15000, stddev: 1200, isSurgical: true },
  'P-502': { mean: 22000, stddev: 1800, isSurgical: true },
  'P-503': { mean: 18000, stddev: 1500, isSurgical: true },
  'BND-05': { mean: 50000, stddev: 4000, isSurgical: true },
  'P-601': { mean: 4000, stddev: 350 },
  'P-602': { mean: 6000, stddev: 500 },
  'P-701': { mean: 8000, stddev: 700 },
  'P-801': { mean: 12000, stddev: 1100 },
  'P-802': { mean: 14000, stddev: 1300 },
  'P-901': { mean: 5000, stddev: 400 },
  'P-902': { mean: 7000, stddev: 600 },
  'P-903': { mean: 9000, stddev: 800 },
  'P-1001': { mean: 3500, stddev: 300 },
  'P-1002': { mean: 4500, stddev: 400 }
};

// Box-Muller transform for normal distribution
function randomNormal(mean: number, stddev: number): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.max(0, mean + num * stddev); // No negative amounts
}

function randomDate(start: Date, end: Date, forceWeekend = false, forceWeekday = false): Date {
  let d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const day = d.getDay();
  if (forceWeekend && day !== 0 && day !== 6) {
    d = new Date(d.getTime() + ((6 - day) * 86400000));
  }
  if (forceWeekday && (day === 0 || day === 6)) {
    d = new Date(d.getTime() + (day === 0 ? 86400000 : 2 * 86400000));
  }
  if (d > end) d = end;
  return d;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateNormalClaim(id: string): Claim {
  const member = randomItem(members);
  const provider = randomItem(providers);
  const diagnosis = randomItem(diagnoses);
  const validProcedures = (clinicalPairs as any)[diagnosis] as string[];
  const procedure = randomItem(validProcedures);
  const date = randomDate(START_DATE, END_DATE, false, provider.isWeekdayOnly);
  const is_weekend = date.getDay() === 0 || date.getDay() === 6;
  
  const profile = procedureProfiles[procedure] || { mean: 5000, stddev: 500 };
  const amount = Math.round(randomNormal(profile.mean, profile.stddev));

  return {
    claim_id: id,
    member_id: member,
    provider_id: provider.id,
    provider_name: provider.name,
    claim_date: date.toISOString().split('T')[0],
    claim_type: 'OUTPATIENT', // simplify
    diagnosis_code: diagnosis,
    procedure_codes: [procedure],
    submitted_amount: amount,
    is_weekend,
    is_fraudulent: false,
    fraud_patterns: []
  };
}

const claims: Claim[] = [];
let claimIdCounter = 1;
function nextId() {
  return `CLM-${(claimIdCounter++).toString().padStart(5, '0')}`;
}

// 1. Generate normal claims (1800)
for (let i = 0; i < 1800; i++) {
  claims.push(generateNormalClaim(nextId()));
}

// 2. Generate Fraud: Duplicates (30 pairs -> 60 claims total, we will generate 30 duplicates of existing claims)
for (let i = 0; i < 30; i++) {
  const baseClaim = { ...randomItem(claims) };
  baseClaim.claim_id = nextId();
  baseClaim.is_fraudulent = true;
  baseClaim.fraud_patterns = ['duplicate'];
  claims.push(baseClaim);
  
  // Tag original as well to ensure metrics align, but usually the second one is flagged
  // For simplicity, we just flag the new one as fraudulent and expect our engine to flag both or the latter.
}

// 3. Generate Fraud: Rapid Resubmission (30 claims)
for (let i = 0; i < 30; i++) {
  const baseClaim = { ...randomItem(claims) };
  const dateObj = new Date(baseClaim.claim_date);
  dateObj.setDate(dateObj.getDate() + Math.floor(Math.random() * 6) + 1); // 1-6 days later
  
  claims.push({
    ...baseClaim,
    claim_id: nextId(),
    claim_date: dateObj.toISOString().split('T')[0],
    is_weekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
    is_fraudulent: true,
    fraud_patterns: ['rapid_resubmission']
  });
}

// 4. Generate Fraud: Upcoding (30 claims)
for (let i = 0; i < 30; i++) {
  const claim = generateNormalClaim(nextId());
  const proc = claim.procedure_codes[0];
  const profile = procedureProfiles[proc];
  // > 2 std devs above mean
  claim.submitted_amount = Math.round(profile.mean + profile.stddev * (2.1 + Math.random()));
  claim.is_fraudulent = true;
  claim.fraud_patterns = ['upcoding'];
  claims.push(claim);
}

// 5. Generate Fraud: Unbundling (25 claims)
const bundledKeys = Object.keys(bundledCodes);
for (let i = 0; i < 25; i++) {
  const bundle = randomItem(bundledKeys);
  const unbundledCodes = (bundledCodes as any)[bundle] as string[];
  
  const claim = generateNormalClaim(nextId());
  claim.procedure_codes = unbundledCodes;
  // Make sure amount is high enough to represent unbundled sum
  let sum = 0;
  for (const c of unbundledCodes) {
    sum += randomNormal(procedureProfiles[c].mean, procedureProfiles[c].stddev);
  }
  claim.submitted_amount = Math.round(sum);
  claim.is_fraudulent = true;
  claim.fraud_patterns = ['unbundling'];
  claims.push(claim);
}

// 6. Generate Fraud: Phantom billing (25 claims on same day for same provider)
const phantomProvider = providers[15]; // arbitrary provider
const phantomDate = new Date('2024-06-15');
for (let i = 0; i < 35; i++) { // > 30 claims
  const claim = generateNormalClaim(nextId());
  claim.provider_id = phantomProvider.id;
  claim.provider_name = phantomProvider.name;
  claim.claim_date = phantomDate.toISOString().split('T')[0];
  claim.is_weekend = phantomDate.getDay() === 0 || phantomDate.getDay() === 6;
  claim.is_fraudulent = true;
  claim.fraud_patterns = ['phantom_billing'];
  claims.push(claim);
}

// 7. Generate Fraud: Weekend Anomaly (20 claims)
const weekdayProvider = providers[0]; // provider 0 is weekday only
for (let i = 0; i < 20; i++) {
  const claim = generateNormalClaim(nextId());
  claim.provider_id = weekdayProvider.id;
  claim.provider_name = weekdayProvider.name;
  const wDate = randomDate(START_DATE, END_DATE, true); // force weekend
  claim.claim_date = wDate.toISOString().split('T')[0];
  claim.is_weekend = true;
  claim.procedure_codes = ['P-501']; // Surgical
  claim.diagnosis_code = 'D-005';
  claim.is_fraudulent = true;
  claim.fraud_patterns = ['weekend_anomaly'];
  claims.push(claim);
}

// 8. Generate Fraud: Diagnosis-procedure mismatch (20 claims)
for (let i = 0; i < 20; i++) {
  const claim = generateNormalClaim(nextId());
  claim.diagnosis_code = 'D-001';
  claim.procedure_codes = ['P-801']; // invalid pair
  claim.is_fraudulent = true;
  claim.fraud_patterns = ['diagnosis_mismatch'];
  claims.push(claim);
}

// 9. Generate Fraud: Amount clustering (20 claims)
for (let i = 0; i < 20; i++) {
  const claim = generateNormalClaim(nextId());
  claim.submitted_amount = Math.floor(Math.random() * (49999 - 47500)) + 47500;
  claim.is_fraudulent = true;
  claim.fraud_patterns = ['amount_clustering'];
  claims.push(claim);
}

// Save dataset
fs.writeFileSync(
  path.join(__dirname, '../data/claims.json'),
  JSON.stringify(claims, null, 2)
);

console.log(`Generated ${claims.length} total claims. Saved to data/claims.json.`);
