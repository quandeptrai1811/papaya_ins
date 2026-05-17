import BenefitsCalculator from '../src/calculator';
import policy from '../data/policy.json';
import expenses from '../data/expenses.json';

describe('Policy Benefits Calculator', () => {
  let calc;

  beforeEach(() => {
    // Reset calculator with a fresh copy of the policy before each test
    calc = new BenefitsCalculator(JSON.parse(JSON.stringify(policy)));
  });

  test('Test 1: Validates that first expense applies global deductible', () => {
    const exp = { ...expenses.find(e => e.expense_id === 'EXP-001'), date: '2024-12-31' }; // override date to pass waiting period
    const res = calc.processSingleExpense(exp);
    expect(res.decision).toBe('PARTIALLY_COVERED');
    expect(res.covered_amount).toBe(0);
    expect(res.member_pays).toBe(2000);
    expect(res.reason).toContain('Deductible applied: 2000');
  });

  test('Test 2: Waiting period denies claim', () => {
    // EXP-004 is Mar 05 (64 days after Jan 01). INPATIENT waiting period is 90 days.
    const exp = expenses.find(e => e.expense_id === 'EXP-004');
    const res = calc.processSingleExpense(exp);
    expect(res.decision).toBe('DENIED');
    expect(res.reason).toContain('Denied: Within 90-day waiting period');
  });

  test('Test 3: Diagnosis exclusion denies claim', () => {
    // EXP-018 diagnosis is "Cosmetic Treatment", which is in exclusions array
    const exp = expenses.find(e => e.expense_id === 'EXP-018');
    const res = calc.processSingleExpense(exp);
    expect(res.decision).toBe('DENIED');
    expect(res.reason).toBe('Diagnosis matches policy exclusions.');
  });

  test('Test 4: Applies 20% copay on Outpatient', () => {
    // First clear deductible (5000) using dummy expense with valid date
    calc.processSingleExpense({ ...expenses[0], amount: 5000, date: '2024-12-31' });
    
    // Now process a 2000 THB outpatient visit
    const exp = { ...expenses.find(e => e.expense_id === 'EXP-001'), amount: 2000, date: '2024-05-01' };
    const res = calc.processSingleExpense(exp);
    
    // Amount 2000. 20% copay = 400. 
    expect(res.covered_amount).toBe(1600);
    expect(res.member_pays).toBe(400);
    expect(res.reason).toContain('20% copay applied');
  });

  test('Test 5: Caps at per-visit limit', () => {
    calc.processSingleExpense({ ...expenses[0], amount: 5000, date: '2024-12-31' }); // clear deductible
    
    // EXP-005 is OUTPATIENT Doctor Visit for 4000. Limit is 3000.
    const exp = { ...expenses.find(e => e.expense_id === 'EXP-005'), amount: 4000, date: '2024-05-01' };
    const res = calc.processSingleExpense(exp);
    
    // 4000 capped to 3000. Copay 20% of 3000 = 600.
    // Covered = 2400. Member pays = 1000 (overage) + 600 (copay) = 1600.
    expect(res.covered_amount).toBe(2400);
    expect(res.member_pays).toBe(1600);
    expect(res.reason).toContain('Capped at per-visit limit');
  });

  test('Test 6: Caps copay at max_per_visit', () => {
    calc.processSingleExpense({ ...expenses[0], amount: 5000, date: '2024-12-31' }); // clear deductible
    
    // Diagnostic test has no per-visit limit, but has an annual sub-limit (10000).
    // Amount 8000. 20% copay = 1600. Max copay per visit = 1000.
    const exp = { ...expenses.find(e => e.expense_id === 'EXP-008'), amount: 8000, date: '2024-05-01' };
    const res = calc.processSingleExpense(exp);
    
    expect(res.copay_amount).toBe(1000); // instead of 1600
    expect(res.covered_amount).toBe(7000);
    expect(res.member_pays).toBe(1000);
  });

  test('Test 7: Exhausts Sub-benefit Annual Limit', () => {
    calc.processSingleExpense({ ...expenses[0], amount: 5000, date: '2024-12-31' }); // clear deductible
    
    // Two diagnostic tests of 6000 each. Sub limit is 10000.
    const exp1 = { ...expenses.find(e => e.expense_id === 'EXP-003'), amount: 6000, date: '2024-05-01' };
    const exp2 = { ...expenses.find(e => e.expense_id === 'EXP-008'), amount: 6000, date: '2024-05-02' };
    
    const res1 = calc.processSingleExpense(exp1);
    const res2 = calc.processSingleExpense(exp2);
    
    // Limits are consumed by covered amount.
    // exp1: 6000 submitted -> 1000 copay -> 5000 covered. Remaining sub limit = 5000.
    // exp2: 6000 submitted -> capped at 5000. Copay 20% of 5000 = 1000. Covered = 4000.
    expect(res2.reason).toContain('Capped by remaining sub-benefit annual limit');
    expect(res2.covered_amount).toBe(4000);
  });

  test('Test 8: Exhausts Annual Limit', () => {
    calc.processSingleExpense({ ...expenses[0], amount: 5000, date: '2024-12-31' }); // clear deductible
    
    // Inpatient has 500k limit.
    const exp1 = { ...expenses.find(e => e.expense_id === 'EXP-006'), amount: 400000, date: '2024-05-01' }; 
    
    const res1 = calc.processSingleExpense(exp1);
    // Surgery limit is 200k. So it caps at 200k.
    expect(res1.reason).toContain('Capped at per-event limit');
    expect(res1.covered_amount).toBe(200000);
    
    // Now we have 300k inpatient left. Let's do another 400k surgery.
    const exp2 = { ...expenses.find(e => e.expense_id === 'EXP-019'), amount: 400000, date: '2024-06-01' };
    const res2 = calc.processSingleExpense(exp2);
    expect(res2.covered_amount).toBe(200000); // Capped by 200k event limit again.
    
    // Now we have 100k inpatient left. Let's do another 200k surgery.
    const exp3 = { ...expenses.find(e => e.expense_id === 'EXP-019'), amount: 200000, date: '2024-07-01' };
    const res3 = calc.processSingleExpense(exp3);
    
    // Should cap by remaining annual limit (100k)
    expect(res3.reason).toContain('Capped by remaining annual limit');
    expect(res3.covered_amount).toBe(100000);
    
    // Try one more
    const exp4 = { ...expenses.find(e => e.expense_id === 'EXP-019'), amount: 200000, date: '2024-08-01' };
    const res4 = calc.processSingleExpense(exp4);
    expect(res4.decision).toBe('DENIED');
    expect(res4.reason).toBe('Denied: Annual benefit limit exhausted.');
  });

  test('Test 9: Exhausts Visit Count Limit', () => {
    calc.processSingleExpense({ ...expenses[0], amount: 5000, date: '2024-12-31' }); // clear deductible
    
    // Doctor visit has limit of 10 visits.
    // EXP-010 to EXP-017 are 8 visits. Plus EXP-005. That's 9 valid visits. 
    // Wait, let's force 11 visits by cloning one.
    const manyExpenses = Array(12).fill(null).map((_, i) => ({
      expense_id: `V-${i}`,
      date: `2024-12-${(i+1).toString().padStart(2, '0')}`,
      benefit_type: "OUTPATIENT",
      sub_benefit: "Doctor Visit",
      amount: 1000,
      diagnosis: "Checkup",
      provider: "Clinic"
    }));
    
    const resArr = calc.processExpenses(manyExpenses);
    
    // 11th visit should be denied
    const exp11 = resArr[10];
    expect(exp11.decision).toBe('DENIED');
    expect(exp11.reason).toBe('Denied: Annual visit limit exhausted.');
  });

  test('Test 10: Chronological Processing Pipeline works', () => {
    // Process the entire raw array which is intentionally out of order slightly (if it was)
    const results = calc.processExpenses(expenses);
    
    expect(results.length).toBe(20);
    
    // First expense is mostly deductible
    expect(results[0].member_pays).toBe(2000);
    
    // A later valid expense is partially covered with copay
    const exp7 = results.find(r => r.expense_id === 'EXP-007'); // Dental cleaning in June (after 180 day waiting period). Jan 1 + 180 days = ~June 29!
    // Wait, June 1 is BEFORE 180 days!
    expect(exp7.decision).toBe('DENIED');
    expect(exp7.reason).toContain('waiting period');
    
    // July 1 Dental should pass
    const exp9 = results.find(r => r.expense_id === 'EXP-009');
    expect(exp9.decision).toBe('PARTIALLY_COVERED'); // because 50% copay
  });

  test('Test 11: Applies both fixed and percentage copay for Dental', () => {
    calc.processSingleExpense({ ...expenses[0], amount: 5000, date: '2024-12-31' }); // clear deductible
    
    // Dental Basic Dental, amount 1500.
    // Fixed: 500 THB. Remaining: 1000 THB.
    // Percentage: 50% of 1000 = 500 THB.
    // Total copay = 1000 THB. Covered = 500 THB.
    const exp = {
      expense_id: 'EXP-DENT',
      date: '2024-12-01',
      benefit_type: 'DENTAL',
      sub_benefit: 'Basic Dental',
      amount: 1500,
      diagnosis: "Toothache",
      provider: "Dental Clinic"
    };
    
    const res = calc.processSingleExpense(exp);
    expect(res.copay_amount).toBe(1000);
    expect(res.covered_amount).toBe(500);
    expect(res.member_pays).toBe(1000);
    expect(res.reason).toContain('500 THB fixed copay + 50% copay applied');
  });

  test('Test 12: Normal full coverage (FULLY_COVERED) — zero copay inpatient within event limit', () => {
    // INPATIENT has 0% copay. Surgery limit is 200,000.
    // Clear the 90-day waiting period by using a date after April 1 (91+ days).
    // Deductible must be cleared first.
    calc.processSingleExpense({ ...expenses[0], amount: 5000, date: '2024-12-31' }); // clear deductible

    const exp = {
      expense_id: 'EXP-FULL',
      date: '2024-04-02', // Day 92 — past 90-day waiting period
      benefit_type: 'INPATIENT',
      sub_benefit: 'Surgery',
      amount: 150000, // Under 200k event limit, under 500k annual limit, 0% copay
      diagnosis: 'Emergency appendectomy',
      provider: 'General Hospital'
    };

    const res = calc.processSingleExpense(exp);
    expect(res.decision).toBe('FULLY_COVERED');
    expect(res.covered_amount).toBe(150000);
    expect(res.copay_amount).toBe(0);
    expect(res.member_pays).toBe(0);
  });

  test('Test 13: Invalid/unknown benefit type returns DENIED with clear reason', () => {
    const exp = {
      expense_id: 'EXP-INVALID',
      date: '2024-06-01',
      benefit_type: 'VISION',       // Not defined in policy
      sub_benefit: 'Eye Exam',
      amount: 1000,
      diagnosis: 'Annual eye check',
      provider: 'Eye Clinic'
    };

    const res = calc.processSingleExpense(exp);
    expect(res.decision).toBe('DENIED');
    expect(res.reason).toBe('Benefit type or sub-benefit not found in policy.');
    expect(res.covered_amount).toBe(0);
    expect(res.member_pays).toBe(1000);
  });

  test('Test 14: Multiple expenses sequentially consuming the same annual limit', () => {
    // Use inpatient Room & Board. Annual limit 500k. Per-day limit 8000. 0% copay.
    // Submit 3 claims in sequence. Each 7000 (under per-day limit).
    // All should pass, and each reduces the shared annual limit.
    calc.processSingleExpense({ ...expenses[0], amount: 5000, date: '2024-12-31' }); // clear deductible

    const makeRoomExp = (id, day) => ({
      expense_id: id,
      date: `2024-04-${day.toString().padStart(2, '0')}`,
      benefit_type: 'INPATIENT',
      sub_benefit: 'Room & Board',
      amount: 7000,
      diagnosis: 'Hospitalization',
      provider: 'General Hospital'
    });

    const res1 = calc.processSingleExpense(makeRoomExp('R1', 2));
    const res2 = calc.processSingleExpense(makeRoomExp('R2', 3));
    const res3 = calc.processSingleExpense(makeRoomExp('R3', 4));

    expect(res1.decision).toBe('FULLY_COVERED');
    expect(res1.covered_amount).toBe(7000);
    expect(res2.decision).toBe('FULLY_COVERED');
    expect(res2.covered_amount).toBe(7000);
    expect(res3.decision).toBe('FULLY_COVERED');
    expect(res3.covered_amount).toBe(7000);

    // Annual limit should have dropped from 500k by 21,000
    expect(res3.remaining_annual_limit).toBe(500000 - 21000);
  });
});
