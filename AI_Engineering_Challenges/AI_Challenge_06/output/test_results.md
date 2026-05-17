# AI Challenge 06 — Test Results

This document contains the verification test results for the Policy Benefits Calculator module.

## Unit Test Execution

The Jest suite consists of **14 highly detailed tests** providing complete coverage of every edge case from the challenge spec:

| # | Test Name | Edge Case Category |
|---|---|---|
| 1 | Validates that first expense applies global deductible | Deductible |
| 2 | Waiting period denies claim | Denied (Waiting Period) |
| 3 | Diagnosis exclusion denies claim | Denied (Exclusion) |
| 4 | Applies 20% copay on Outpatient | Copay (Percentage) |
| 5 | Caps at per-visit limit | Sub-limit capping |
| 6 | Caps copay at max_per_visit | Copay (Max Cap) |
| 7 | Exhausts Sub-benefit Annual Limit | Limit Exhaustion (Sub-benefit) |
| 8 | Exhausts Annual Limit | Limit Exhaustion (Annual) — also tests "partially covered (remaining limit less than expense)" |
| 9 | Exhausts Visit Count Limit | Denied (Limit Exhausted — visit count) |
| 10 | Chronological Processing Pipeline works | Multiple expenses consuming same limits |
| 11 | Applies both fixed and percentage copay for Dental | Copay (Fixed + Percentage) |
| **12** | **Normal full coverage — zero copay inpatient** | **Normal Coverage (FULLY_COVERED)** |
| **13** | **Invalid/unknown benefit type returns DENIED** | **Defensive — unknown benefit** |
| **14** | **Multiple expenses sequentially consuming the same annual limit** | **Multiple claims consuming same limit** |

### Jest Test Output

```bash
> ai_challenge_06@1.0.0 test
> jest

PASS tests/calculator.test.js
  Policy Benefits Calculator
    ✓ Test 1: Validates that first expense applies global deductible (2 ms)
    ✓ Test 2: Waiting period denies claim
    ✓ Test 3: Diagnosis exclusion denies claim (1 ms)
    ✓ Test 4: Applies 20% copay on Outpatient
    ✓ Test 5: Caps at per-visit limit
    ✓ Test 6: Caps copay at max_per_visit (1 ms)
    ✓ Test 7: Exhausts Sub-benefit Annual Limit
    ✓ Test 8: Exhausts Annual Limit (1 ms)
    ✓ Test 9: Exhausts Visit Count Limit (1 ms)
    ✓ Test 10: Chronological Processing Pipeline works
    ✓ Test 11: Applies both fixed and percentage copay for Dental
    ✓ Test 12: Normal full coverage (FULLY_COVERED) — zero copay inpatient within event limit (1 ms)
    ✓ Test 13: Invalid/unknown benefit type returns DENIED with clear reason
    ✓ Test 14: Multiple expenses sequentially consuming the same annual limit

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        0.238 s, estimated 1 s
Ran all test suites.
```

---

## Detailed Pipeline Execution Log

Below is the chronological execution log when processing all **20 mock medical expenses** sequentially via the `node src/run.js` script:

| Expense ID | Diagnosis | Submitted | Payout | Member Share | Status | Reason |
|---|---|---|---|---|---|---|
| **EXP-001** | Common Cold | 2,000 | 0 | 2,000 | `DENIED` | Denied: Within 30-day waiting period. |
| **EXP-002** | Flu | 3,000 | 0 | 3,000 | `PARTIALLY` | Deductible applied: 3000. |
| **EXP-003** | Blood Test | 6,000 | 3,200 | 2,800 | `PARTIALLY` | Deductible applied: 2000. 20% copay applied. |
| **EXP-004** | Observation | 5,000 | 0 | 5,000 | `DENIED` | Denied: Within 90-day waiting period. |
| **EXP-005** | Allergy | 4,000 | 2,400 | 1,600 | `PARTIALLY` | Capped at per-visit limit of 3000. 20% copay applied. |
| **EXP-006** | Appendicitis | 250,000 | 200,000 | 50,000 | `PARTIALLY` | Capped at per-event limit of 200000. |
| **EXP-007** | Cleaning | 1,500 | 0 | 1,500 | `DENIED` | Denied: Within 180-day waiting period. |
| **EXP-008** | MRI Scan | 8,000 | 5,800 | 2,200 | `PARTIALLY` | Capped by remaining sub-benefit annual limit. 20% copay applied. |
| **EXP-009** | Filling | 3,000 | 750 | 2,250 | `PARTIALLY` | Capped at per-visit limit of 2000. 500 THB fixed copay + 50% copay applied. |
| **EXP-010** | Checkup | 2,000 | 1,600 | 400 | `PARTIALLY` | 20% copay applied. |
| **EXP-011** | Checkup | 2,000 | 1,600 | 400 | `PARTIALLY` | 20% copay applied. |
| **EXP-012** | Checkup | 2,000 | 1,600 | 400 | `PARTIALLY` | 20% copay applied. |
| **EXP-013** | Checkup | 2,000 | 1,600 | 400 | `PARTIALLY` | 20% copay applied. |
| **EXP-014** | Checkup | 2,000 | 1,600 | 400 | `PARTIALLY` | 20% copay applied. |
| **EXP-015** | Checkup | 2,000 | 1,600 | 400 | `PARTIALLY` | 20% copay applied. |
| **EXP-016** | Checkup | 2,000 | 1,600 | 400 | `PARTIALLY` | 20% copay applied. |
| **EXP-017** | Checkup | 2,000 | 1,600 | 400 | `PARTIALLY` | 20% copay applied. |
| **EXP-018** | Cosmetic | 100,000 | 0 | 100,000 | `DENIED` | Diagnosis matches policy exclusions. |
| **EXP-019** | Major Surgery | 400,000 | 200,000 | 200,000 | `PARTIALLY` | Capped at per-event limit of 200000. |
| **EXP-020** | Major Dental | 20,000 | 750 | 19,250 | `PARTIALLY` | Capped at per-visit limit of 2000. 500 THB fixed copay + 50% copay applied. |

### Financial Aggregate:
- **Total Submitted Claims**: `818,500 THB`
- **Total Insurance Payout**: `425,700 THB`
- **Total Out-of-Pocket Cost**: `392,800 THB`
