import * as fs from 'fs';
import * as path from 'path';
import { Claim } from './types';
import { validateClaim, validateAllClaims, loadCountryConfig, listAvailableCountries, filterActiveRules } from './engine';
import { diffCountries } from './diff';

const CLAIMS_PATH = path.join(__dirname, '../data/claims.json');
const OUTPUT_DIR = path.join(__dirname, '../output');

function pad(s: string, len: number): string { return s.padEnd(len); }

function printHeader(title: string) {
  const line = '─'.repeat(60);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(`${line}`);
}

function printValidationResult(result: ReturnType<typeof validateClaim>) {
  const statusEmoji = result.overall_status === 'COMPLIANT' ? '✅' : result.overall_status === 'PARTIALLY_COMPLIANT' ? '⚠️ ' : '❌';
  console.log(`\n${statusEmoji} Claim ${result.claim_id} [${result.country}] — ${result.overall_status}`);
  console.log(`   Rules evaluated: ${result.rules_evaluated} | Passed: ${result.rules_passed} | Failed: ${result.rules_failed}`);
  for (const e of result.evaluations) {
    const icon = e.result === 'PASS' ? '  ✓' : e.result === 'FAIL' ? '  ✗' : '  ·';
    console.log(`${icon} [${e.rule_id}] ${e.explanation}`);
    if (e.remediation) console.log(`      → Remediation: ${e.remediation}`);
    if (e.masked_data) console.log(`      → Masked: ${JSON.stringify(e.masked_data)}`);
  }
}

const [,, command, ...args] = process.argv;

function loadClaims(): Claim[] {
  return JSON.parse(fs.readFileSync(CLAIMS_PATH, 'utf-8')) as Claim[];
}

function runValidateAll() {
  printHeader('Validate All 15 Claims');
  const claims = loadClaims();
  const results = validateAllClaims(claims);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'validation_results.json'), JSON.stringify(results, null, 2));

  for (const r of results) printValidationResult(r);

  const total = results.length;
  const compliant = results.filter(r => r.overall_status === 'COMPLIANT').length;
  const partial = results.filter(r => r.overall_status === 'PARTIALLY_COMPLIANT').length;
  const nonCompliant = results.filter(r => r.overall_status === 'NON_COMPLIANT').length;

  printHeader('Summary');
  console.log(`  Total Claims:          ${total}`);
  console.log(`  ✅ Compliant:          ${compliant}`);
  console.log(`  ⚠️  Partially:          ${partial}`);
  console.log(`  ❌ Non-Compliant:      ${nonCompliant}`);
  console.log(`\n  Results saved to output/validation_results.json`);
}

function runView(country: string) {
  printHeader(`Active Rules: ${country}`);
  const config = loadCountryConfig(country);
  const today = new Date().toISOString().split('T')[0];
  const active = filterActiveRules(config.rules, today);
  for (const rule of active) {
    console.log(`\n  [${rule.rule_id}] ${rule.description}`);
    console.log(`    Type: ${rule.rule_type} | Effective: ${rule.effective_date}`);
  }
}

function runDiff(countryA: string, countryB: string) {
  printHeader(`Rule Diff: ${countryA} vs ${countryB}`);
  const diffs = diffCountries(countryA, countryB);
  if (diffs.length === 0) {
    console.log('  No differences found.');
    return;
  }
  for (const d of diffs) {
    console.log(`\n  [${d.rule_type}]`);
    console.log(`  ${d.difference}`);
  }
}

function runValidateSingle(claimId: string) {
  const claim = loadClaims().find(c => c.claim_id === claimId);
  if (!claim) { console.error(`Claim not found: ${claimId}`); process.exit(1); }
  printHeader(`Validate Claim: ${claimId}`);
  printValidationResult(validateClaim(claim));
}

// ── CLI Dispatch ─────────────────────────────────────────────────────────────

switch (command) {
  case 'validate':
    if (args[0]) runValidateSingle(args[0]);
    else runValidateAll();
    break;
  case 'view':
    if (!args[0]) { console.error('Usage: npm run cli view <country>'); process.exit(1); }
    runView(args[0]);
    break;
  case 'diff':
    if (!args[0] || !args[1]) { console.error('Usage: npm run cli diff <countryA> <countryB>'); process.exit(1); }
    runDiff(args[0], args[1]);
    break;
  case 'countries':
    printHeader('Available Countries');
    listAvailableCountries().forEach(c => console.log(`  • ${c}`));
    break;
  default:
    // Default: run validate all
    runValidateAll();
    break;
}
