import { CountryConfig, Rule, RuleDiff, RuleType } from './types';
import { loadCountryConfig } from './engine';

// Group rules by rule_type for easy comparison
function groupByType(config: CountryConfig): Partial<Record<RuleType, Rule[]>> {
  const grouped: Partial<Record<RuleType, Rule[]>> = {};
  for (const rule of config.rules) {
    if (!grouped[rule.rule_type]) grouped[rule.rule_type] = [];
    grouped[rule.rule_type]!.push(rule);
  }
  return grouped;
}

function describeRule(rule: Rule): string {
  const p = rule.parameters;
  switch (rule.rule_type) {
    case 'document_requirement':
      return `Requires [${p.required_documents?.join(', ')}] for [${p.applies_to_claim_types?.join(', ')}]`;
    case 'sla_check':
      return `${p.sla_business_days} business days for [${p.sla_claim_types?.join(', ')}]`;
    case 'waiting_period':
      return `General: ${p.waiting_days_general} days, Pre-existing: ${p.waiting_days_preexisting} days`;
    case 'data_masking':
      return `Mask '${p.field}' using strategy '${p.mask_strategy}'`;
    case 'coverage_mandate':
      return `Mandate '${p.mandate_type}' when ${p.condition}`;
    default:
      return JSON.stringify(p);
  }
}

export function diffCountries(countryA: string, countryB: string): RuleDiff[] {
  const configA = loadCountryConfig(countryA);
  const configB = loadCountryConfig(countryB);
  const groupA = groupByType(configA);
  const groupB = groupByType(configB);

  const allTypes = new Set<RuleType>([
    ...Object.keys(groupA) as RuleType[],
    ...Object.keys(groupB) as RuleType[]
  ]);

  const diffs: RuleDiff[] = [];

  for (const ruleType of allTypes) {
    const rulesA = groupA[ruleType] ?? [];
    const rulesB = groupB[ruleType] ?? [];

    if (rulesA.length === 0 && rulesB.length > 0) {
      diffs.push({
        rule_type: ruleType,
        country_a: configA.country,
        country_b: configB.country,
        difference: `${configA.country} has no ${ruleType} rules, but ${configB.country} has: ${rulesB.map(describeRule).join('; ')}`
      });
    } else if (rulesB.length === 0 && rulesA.length > 0) {
      diffs.push({
        rule_type: ruleType,
        country_a: configA.country,
        country_b: configB.country,
        difference: `${configB.country} has no ${ruleType} rules, but ${configA.country} has: ${rulesA.map(describeRule).join('; ')}`
      });
    } else {
      // Compare rule summaries
      const summariesA = rulesA.map(describeRule).sort();
      const summariesB = rulesB.map(describeRule).sort();
      const onlyInA = summariesA.filter(s => !summariesB.includes(s));
      const onlyInB = summariesB.filter(s => !summariesA.includes(s));

      if (onlyInA.length > 0 || onlyInB.length > 0) {
        diffs.push({
          rule_type: ruleType,
          country_a: configA.country,
          country_b: configB.country,
          difference: [
            onlyInA.length > 0 ? `${configA.country} only: ${onlyInA.join('; ')}` : '',
            onlyInB.length > 0 ? `${configB.country} only: ${onlyInB.join('; ')}` : ''
          ].filter(Boolean).join(' | ')
        });
      }
    }
  }

  return diffs;
}
