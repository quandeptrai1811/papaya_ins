# Papaya Insurance Policy Benefits Calculator

This is a highly robust, chronological insurance benefits calculation engine written in **Node.js & TypeScript**. Built for AI Engineering Challenge 06. 

It automatically parses insurance policies and calculates payouts across a chronological sequence of claims, applying complex combinations of waiting periods, diagnosis exclusions, annual limits, sub-limits, deductibles, and multi-tier copays (both percentage and flat/fixed copays).

---

## 🌟 Key Features

1. **Chronological Limit Consumption**: Evaluates expenses sequentially by claim date, ensuring that earlier claims consume limits (annual limits, sub-benefit limits, visit counts, and deductibles) which dynamically affect all subsequent claim assessments.
2. **Multi-Step Policy Engine Pipeline**:
   - **Exclusion Check**: Immediately denies claims where the diagnosis matches policy-wide exclusions (e.g., cosmetic treatments).
   - **Waiting Period Check**: Validates if the claim falls within the benefit-specific waiting period from the policy's effective date. Denied claims do not consume limits or deductibles.
   - **Annual Visit Cap**: Enforces sub-benefit limits on the total allowed number of visits per year.
   - **Global Deductible**: Absorbs valid claims to reduce the member's annual deductible first. Absorbed amounts update the member's out-of-pocket costs while setting payout to `0` and decision to `PARTIALLY_COVERED` (payout is reduced).
   - **Sub-benefit Limits**: Enforces caps per-visit, per-day, and per-event.
   - **Sub-benefit Annual Limit**: Ensures payouts are capped if the remaining annual cap for that sub-benefit is lower than the current claim cost.
   - **Copay Calculations**: Computes stacked copays, supporting both flat/fixed copays (e.g., 500 THB flat) and percentage copays (e.g., 20% on the remaining covered amount), capped optionally by a per-visit maximum copay.
   - **Overall Benefit Annual Limits**: Final check ensuring that payout is capped when the overall annual limit of the parent benefit (e.g. OUTPATIENT, INPATIENT) is near exhaustion.
3. **TypeScript Architecture**:
   - Class state, benefits schema, and claims list are strongly typed.
   - Resolved JS millisecond Date subtraction using strict `.getTime()` arithmetic.
4. **Robust Output Schema**: Returns structured JSON data for each processed expense detailing exact payouts, remaining deductibles, remaining annual and visit limits, and human-readable audit reasons.
5. **Rich Verification Suite**: Features 14 comprehensive unit tests executing via Jest and `ts-jest`.

---

## 📂 Project Structure

- **`data/`**
  - [`policy.json`](./data/policy.json): The policy configuration defining limits, sub-limits, deductibles, waiting periods, copays, and exclusions.
  - [`expenses.json`](./data/expenses.json): 20 sequenced medical expenses exercising all edge cases in chronological order.
- **`src/`**
  - [`calculator.ts`](./src/calculator.ts): The core type-safe benefits evaluation pipeline and limit state manager.
  - [`run.ts`](./src/run.ts): The executable runner script printing colorized CLI summaries and generating `expected_outputs.json`.
- **`tests/`**
  - [`calculator.test.ts`](./tests/calculator.test.ts): 14 Jest assertions covering all complex business rules and validations.
- **`output/`**
  - [`expected_outputs.json`](./output/expected_outputs.json): Saved JSON output logs of the 20 processed expenses.
  - [`test_results.md`](./output/test_results.md): Detailed verification grid showing Jest outputs and chronological audit trails.
- **`tsconfig.json`**: TypeScript compiler configurations.
- **`jest.config.js`**: Setup to run typescript tests on-the-fly using `ts-jest`.

---

## 🚀 Getting Started

### 1. Installation
Install ts-jest, ts-node, TypeScript, and test type definitions:
```bash
npm install
```

### 2. Running the Pipeline
Run the main evaluation script which processes all 20 claims sequentially and dumps the result into `output/expected_outputs.json`:
```bash
npx ts-node src/run.ts
```

### 3. Running Unit Tests
Execute the comprehensive Jest test suite:
```bash
npm test
```

---

## 📊 Summary of Processed Claim Runs

Below is the aggregate execution result across our chronological test suite of 20 expenses:
- **Total Submitted Claims**: `818,500 THB`
- **Total Insurance Payout**: `425,700 THB`
- **Total Out-of-Pocket Member Share**: `392,800 THB`

For a granular breakdown of each individual expense decision, reasons, and limits, please refer to the detailed [test_results.md](./output/test_results.md).
