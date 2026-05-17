import * as fs from 'fs';
import * as path from 'path';
import { Claim } from './types';
import { FraudEngine } from './engine';
import { allRules } from './rules';
import { calculateMetrics } from './metrics';

console.log('--- Papaya Insurance Fraud Detection Engine ---');

const dataPath = path.join(__dirname, '../data/claims.json');
if (!fs.existsSync(dataPath)) {
  console.error('Error: data/claims.json not found. Please run "npm run generate" first.');
  process.exit(1);
}

const claims: Claim[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
console.log(`Loaded ${claims.length} claims.`);

const engine = new FraudEngine();
allRules.forEach(r => engine.addRule(r));

console.log('Evaluating claims...');
const startTime = Date.now();
const scoredClaims = engine.evaluateAll(claims);
const endTime = Date.now();

console.log(`Evaluation completed in ${endTime - startTime}ms`);

// Threshold for predicted fraud: score > 0 (any flag triggers it, or we can use >= 20, etc.)
// Based on weights, let's say score >= 20 is fraud (at least one severity 2 flag)
const threshold = 20;
const metrics = calculateMetrics(claims, scoredClaims, threshold);

console.log('\n--- Metrics ---');
console.log(`Total Claims: ${metrics.total_claims}`);
console.log(`Actual Frauds: ${metrics.actual_frauds}`);
console.log(`Predicted Frauds: ${metrics.predicted_frauds}`);
console.log(`True Positives: ${metrics.true_positives}`);
console.log(`False Positives: ${metrics.false_positives}`);
console.log(`False Negatives: ${metrics.false_negatives}`);
console.log(`Precision: ${(metrics.precision * 100).toFixed(2)}%`);
console.log(`Recall: ${(metrics.recall * 100).toFixed(2)}% (Target >= 70%)`);
console.log(`False Positive Rate: ${(metrics.fpr * 100).toFixed(2)}% (Target <= 20%)`);

const outputDir = path.join(__dirname, '../output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

fs.writeFileSync(
  path.join(outputDir, 'scored_claims.json'),
  JSON.stringify(scoredClaims, null, 2)
);
fs.writeFileSync(
  path.join(outputDir, 'metrics.json'),
  JSON.stringify(metrics, null, 2)
);

console.log('\nSaved output to output/scored_claims.json and output/metrics.json');
