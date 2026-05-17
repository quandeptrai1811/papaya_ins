import * as path from 'path';
import * as fs from 'fs';
import BenefitsCalculator from './calculator';
import policy from '../data/policy.json';
import expenses from '../data/expenses.json';

console.log('--- Papaya Insurance Policy Calculator ---');
console.log(`Policy: ${policy.policy_number} | Effective Date: ${policy.effective_date}`);
console.log(`Total Expenses to Process: ${expenses.length}\n`);

const calculator = new BenefitsCalculator(policy);
const results = calculator.processExpenses(expenses);

// Write to expected_outputs.json
const outputPath = path.join(__dirname, '../output/expected_outputs.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

let totalSubmitted = 0;
let totalCovered = 0;
let totalMemberPays = 0;

results.forEach(res => {
  totalSubmitted += res.submitted_amount;
  totalCovered += res.covered_amount;
  totalMemberPays += res.member_pays;

  const decisionColor = 
    res.decision === 'FULLY_COVERED' ? '\x1b[32m' : // Green
    res.decision === 'PARTIALLY_COVERED' ? '\x1b[33m' : // Yellow
    '\x1b[31m'; // Red

  console.log(`[${res.expense_id}] Submitted: ${res.submitted_amount} | ${decisionColor}${res.decision}\x1b[0m`);
  console.log(`          Covered: ${res.covered_amount} | Copay/Deductible: ${res.member_pays}`);
  console.log(`          Reason:  ${res.reason}`);
  console.log('--------------------------------------------------');
});

console.log('\n--- Summary ---');
console.log(`Total Submitted: ${totalSubmitted}`);
console.log(`Total Covered:   ${totalCovered}`);
console.log(`Total Member:    ${totalMemberPays}`);
