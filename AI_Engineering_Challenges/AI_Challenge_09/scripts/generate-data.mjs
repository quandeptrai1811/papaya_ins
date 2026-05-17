import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CLAIM_TYPES = ['OUTPATIENT', 'OUTPATIENT', 'OUTPATIENT', 'INPATIENT', 'DENTAL', 'MATERNITY'];
const STATUSES = ['APPROVED', 'APPROVED', 'APPROVED', 'APPROVED', 'APPROVED', 'PENDING', 'PENDING', 'IN_REVIEW', 'REJECTED', 'REJECTED'];
const ASSESSORS = ['Sarah Jenkins', 'Michael Tan', 'Priya Nair', 'David Lim', 'Anna Kowalski'];
const INSURERS = ['AsiaCare', 'PacificShield', 'GlobeMed'];
const COUNTRIES = ['Thailand', 'Vietnam', 'Hong Kong'];
const ICD10 = [
  { code: 'J06.9', desc: 'Acute upper respiratory infection' },
  { code: 'K21.0', desc: 'Gastro-oesophageal reflux disease' },
  { code: 'M54.5', desc: 'Low back pain' },
  { code: 'J18.9', desc: 'Pneumonia' },
  { code: 'E11.9', desc: 'Type 2 diabetes mellitus' },
  { code: 'I10', desc: 'Essential hypertension' },
  { code: 'K29.7', desc: 'Gastritis' },
  { code: 'N39.0', desc: 'Urinary tract infection' },
  { code: 'A09', desc: 'Gastroenteritis' },
  { code: 'J45.9', desc: 'Asthma' },
  { code: 'S52.5', desc: 'Fracture of lower end of radius' },
  { code: 'G43.9', desc: 'Migraine' },
  { code: 'L30.9', desc: 'Dermatitis' },
  { code: 'F32.9', desc: 'Major depressive episode' },
  { code: 'O80', desc: 'Normal delivery' },
  { code: 'K35.8', desc: 'Acute appendicitis' },
  { code: 'I25.1', desc: 'Coronary artery disease' },
  { code: 'C50.9', desc: 'Breast cancer' },
  { code: 'Z30.0', desc: 'Contraception management' },
  { code: 'B34.9', desc: 'Viral infection' },
];

const FIRST = ['James','Emma','Oliver','Sophia','Liam','Ava','Noah','Isabella','William','Mia','Niran','Somchai','Laleh','Minh','Wei','Hana','Arjun','Priya','Kenji','Soo'];
const LAST = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Taylor','Nguyen','Chen','Patel','Kim','Tanaka','Santos','Cohen','Ali','Singh','Park'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function logNormal(mu, sigma) {
  const u = Math.random(), v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.round(Math.exp(mu + sigma * z));
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const START = new Date('2024-01-01').getTime();
const END = new Date('2024-12-31').getTime();

const claims = [];
for (let i = 1; i <= 5000; i++) {
  const claimType = rand(CLAIM_TYPES);
  const status = rand(STATUSES);
  const icd = rand(ICD10);
  const submittedMs = START + Math.random() * (END - START);
  const submittedDate = new Date(submittedMs).toISOString().split('T')[0];
  const rawAmount = Math.min(2000000, Math.max(500, logNormal(9.5, 1.4)));
  const submittedAmount = rawAmount;
  const approvedAmount = status === 'REJECTED' ? 0
    : status === 'PENDING' ? 0
    : Math.round(submittedAmount * (0.80 + Math.random() * 0.20));
  const processingDays = status === 'PENDING' ? null : randInt(1, 30);
  const processedDate = processingDays ? addDays(submittedDate, processingDays) : null;

  claims.push({
    claim_id: `CLM-${String(i).padStart(5, '0')}`,
    policy_id: `POL-${String(randInt(1, 2000)).padStart(5, '0')}`,
    member_name: `${rand(FIRST)} ${rand(LAST)}`,
    claim_type: claimType,
    diagnosis_icd10: `${icd.code} – ${icd.desc}`,
    submitted_amount: submittedAmount,
    approved_amount: approvedAmount,
    status,
    submitted_date: submittedDate,
    processed_date: processedDate,
    processing_days: processingDays,
    assessor: rand(ASSESSORS),
    insurer: rand(INSURERS),
    country: rand(COUNTRIES),
  });
}

const outPath = path.join(__dirname, '..', 'public', 'claims.json');
writeFileSync(outPath, JSON.stringify(claims, null, 0));
console.log(`Generated ${claims.length} claims → ${outPath}`);
