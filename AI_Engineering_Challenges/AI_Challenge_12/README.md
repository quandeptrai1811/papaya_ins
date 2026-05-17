# AI Challenge 12: Multi-Country Regulatory Rule Engine

This project is a fully **config-driven, extensible regulatory rule engine** built in **Node.js & TypeScript**. It validates insurance claims against country-specific regulations without hardcoding any country logic — adding a new country requires only a new JSON config file, zero code changes.

---

## 🌟 Key Features

1. **Pure Configuration-Driven Architecture**: Country rules are stored in decoupled JSON files (`data/rules/<country>.json`). The engine dynamically loads whichever config matches the claim's country.
2. **Rule Versioning**: Each rule has an `effective_date` and optional `expiry_date`. The engine evaluates only rules that were active on the claim's `submission_date`, naturally handling regulatory updates and sunset periods.
3. **5 Rule Type Evaluators**: Each rule type is handled by a dedicated, testable evaluator function:
   - `document_requirement` — validates submitted documents against required lists
   - `sla_check` — validates that claims are submitted within the allowed business-day window after treatment
   - `waiting_period` — validates that treatment occurred after the policy's general/pre-existing waiting period
   - `data_masking` — generates a masked representation of PII fields in the report output
   - `coverage_mandate` — enforces coverage guarantees (emergency, maternity, mental health parity)
4. **Structured Output**: Each claim returns an overall `COMPLIANT / NON_COMPLIANT / PARTIALLY_COMPLIANT` status with per-rule results, specific failure explanations, and actionable remediation strings.
5. **Rule Diff Engine**: Given two countries, the diff module compares rules grouped by type and surfaces all differences with human-readable summaries.
6. **Interactive CLI**: Four commands — `validate`, `view`, `diff`, and `countries` — cover all operational needs.
7. **17 Unit Tests**: Jest suite covering engine, versioning, masking strategies, waiting period edge cases, mandate conditions, and diffing.

---

## 📂 Architecture

```text
data/
├── claims.json           # 15 test claims (5 per country)
└── rules/
    ├── thailand.json     # 8 rules
    ├── vietnam.json      # 7 rules
    ├── hong_kong.json    # 7 rules
    └── singapore.json    # Skeleton config (4th country — zero code changes)

src/
├── types.ts              # All TypeScript interfaces
├── engine.ts             # Config loader, versioning filter, validation dispatcher
├── diff.ts               # Rule diff algorithm
├── cli.ts                # CLI orchestration
└── evaluators/
    ├── document_requirement.ts
    ├── sla_check.ts
    ├── waiting_period.ts
    ├── data_masking.ts
    └── coverage_mandate.ts
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Validate All 15 Test Claims
```bash
npm start
```
Outputs results to the console and saves to `output/validation_results.json`.

### 3. CLI Commands
```bash
# View all active rules for a country
npm run cli view thailand
npm run cli view vietnam
npm run cli view hong_kong

# Validate a single claim by ID
npm run cli validate TH-001
npm run cli validate HK-004

# Compare rules between two countries
npm run cli diff thailand vietnam
npm run cli diff hong_kong vietnam

# List all available country configs
npm run cli countries
```

### 4. Run Unit Tests
```bash
npm test
```

---

## 📋 Rule Schema

Each rule in a country config file follows this schema (suitable for non-engineers to author):

| Field | Type | Description |
|---|---|---|
| `rule_id` | string | Unique rule identifier (e.g. `TH-DOC-02`) |
| `description` | string | Human-readable explanation of the rule |
| `rule_type` | enum | One of: `document_requirement`, `sla_check`, `waiting_period`, `data_masking`, `coverage_mandate` |
| `parameters` | object | Type-specific configuration (see below) |
| `effective_date` | date | ISO date when rule became active |
| `expiry_date` | date \| null | ISO date when rule expires (null = never) |

### Adding a New Country
Create a new file `data/rules/<country>.json` with rules following the schema above. No code changes are needed — the engine will automatically detect and load the config.

> [!IMPORTANT]
> **Include `data/claims.json` and `output/validation_results.json` in the repository** to allow reviewers to verify rule outputs without running the engine.
