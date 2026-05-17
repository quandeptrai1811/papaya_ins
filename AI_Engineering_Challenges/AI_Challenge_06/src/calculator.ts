/**
 * Policy Benefits Calculator
 * Handles tracking remaining limits, deductibles, and processing expenses.
 */

export default class BenefitsCalculator {
  policy: any;
  effectiveDate: Date;
  remainingDeductible: number;
  state: {
    annual: Record<string, number>;
    visits: Record<string, Record<string, number>>;
    sub_annual: Record<string, Record<string, number>>;
  };

  constructor(policy: any) {
    this.policy = policy;
    this.effectiveDate = new Date(policy.effective_date);
    
    // Initialize State
    this.remainingDeductible = policy.deductible_annual || 0;
    this.state = {
      annual: {}, // { BENEFIT_TYPE: remaining_limit }
      visits: {}, // { BENEFIT_TYPE: { SUB_BENEFIT: remaining_visits } }
      sub_annual: {} // { BENEFIT_TYPE: { SUB_BENEFIT: remaining_sub_annual_limit } }
    };

    // Populate initial state from policy
    for (const [type, benefit] of Object.entries(policy.benefits || {}) as [string, any][]) {
      if (benefit.annual_limit) {
        this.state.annual[type] = benefit.annual_limit;
      }
      
      this.state.visits[type] = {};
      this.state.sub_annual[type] = {};
      
      if (benefit.sub_benefits) {
        for (const [subName, subRules] of Object.entries(benefit.sub_benefits) as [string, any][]) {
          if (subRules.visits_per_year) {
            this.state.visits[type][subName] = subRules.visits_per_year;
          }
          if (subRules.limit_per_year) {
             this.state.sub_annual[type][subName] = subRules.limit_per_year;
          }
        }
      }
    }
  }

  processExpenses(expenses: any[]) {
    // Ensure chronological processing
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sortedExpenses.map(expense => this.processSingleExpense(expense));
  }

  processSingleExpense(expense: any) {
    let { expense_id, date, benefit_type, sub_benefit, amount, diagnosis } = expense;
    let submitted = amount;
    let covered = amount;
    let memberPays = 0;
    let reason = [];

    const benefitRules = this.policy.benefits[benefit_type];
    const subRules = benefitRules ? benefitRules.sub_benefits[sub_benefit] : null;

    // Output Base
    const result = {
      expense_id,
      submitted_amount: submitted,
      covered_amount: 0,
      copay_amount: 0,
      member_pays: submitted,
      decision: "DENIED",
      reason: "",
      remaining_annual_limit: this.state.annual[benefit_type] || 0,
      remaining_visit_limit: (this.state.visits[benefit_type] && this.state.visits[benefit_type][sub_benefit]) || null
    };

    // 1. Valid Benefit Check
    if (!benefitRules || !subRules) {
      result.reason = "Benefit type or sub-benefit not found in policy.";
      return result;
    }

    // 2. Exclusion Check
    if (this.policy.exclusions) {
      const isExcluded = this.policy.exclusions.some(ex => 
        diagnosis.toLowerCase().includes(ex.toLowerCase())
      );
      if (isExcluded) {
        result.reason = "Diagnosis matches policy exclusions.";
        return result;
      }
    }

    // 3. Waiting Period Check
    if (benefitRules.waiting_period_days) {
      const expDate = new Date(date);
      const waitingMs = benefitRules.waiting_period_days * 24 * 60 * 60 * 1000;
      const eligibleDate = new Date(this.effectiveDate.getTime() + waitingMs);
      
      if (expDate < eligibleDate) {
        result.reason = `Denied: Within ${benefitRules.waiting_period_days}-day waiting period.`;
        return result;
      }
    }

    // 4. Visit Count Check
    if (subRules.visits_per_year) {
      const remainingVisits = this.state.visits[benefit_type][sub_benefit];
      if (remainingVisits <= 0) {
        result.reason = "Denied: Annual visit limit exhausted.";
        return result;
      }
    }

    // 5. Global Deductible Application
    if (this.remainingDeductible > 0) {
      const appliedDeductible = Math.min(covered, this.remainingDeductible);
      covered -= appliedDeductible;
      memberPays += appliedDeductible;
      this.remainingDeductible -= appliedDeductible;
      reason.push(`Deductible applied: ${appliedDeductible}`);
      
      if (covered <= 0) {
        result.member_pays = memberPays;
        result.decision = "PARTIALLY_COVERED";
        result.reason = reason.join(". ") + ".";
        return result;
      }
    }

    // 6. Sub-limit Capping
    if (subRules.limit_per_visit && covered > subRules.limit_per_visit) {
      const overage = covered - subRules.limit_per_visit;
      covered = subRules.limit_per_visit;
      memberPays += overage;
      reason.push(`Capped at per-visit limit of ${subRules.limit_per_visit}`);
    } else if (subRules.limit_per_day && covered > subRules.limit_per_day) {
      // Treating 'per_day' similarly to 'per_visit' for simplified expenses without duration
      const overage = covered - subRules.limit_per_day;
      covered = subRules.limit_per_day;
      memberPays += overage;
      reason.push(`Capped at per-day limit of ${subRules.limit_per_day}`);
    } else if (subRules.limit_per_event && covered > subRules.limit_per_event) {
      const overage = covered - subRules.limit_per_event;
      covered = subRules.limit_per_event;
      memberPays += overage;
      reason.push(`Capped at per-event limit of ${subRules.limit_per_event}`);
    }

    // Check sub_annual limit
    if (subRules.limit_per_year) {
      const remSubAnnual = this.state.sub_annual[benefit_type][sub_benefit];
      if (remSubAnnual <= 0) {
        result.reason = "Denied: Sub-benefit annual limit exhausted.";
        return result;
      }
      if (covered > remSubAnnual) {
        const overage = covered - remSubAnnual;
        covered = remSubAnnual;
        memberPays += overage;
        reason.push(`Capped by remaining sub-benefit annual limit`);
      }
    }

    // 7. Copay Application (on the remaining covered amount)
    let copayApplied = 0;
    if (benefitRules.copay) {
      const copayDetails = [];
      
      // Fixed copay check
      if (benefitRules.copay.fixed > 0) {
        const fixedCopay = Math.min(covered, benefitRules.copay.fixed);
        copayApplied += fixedCopay;
        copayDetails.push(`${fixedCopay} THB fixed copay`);
      }
      
      // Percentage copay check
      if (benefitRules.copay.percentage > 0) {
        const percentageBasis = covered - copayApplied;
        let percentageCopay = percentageBasis * (benefitRules.copay.percentage / 100);
        
        // Check max copay per visit
        if (benefitRules.copay.max_per_visit && percentageCopay > benefitRules.copay.max_per_visit) {
          percentageCopay = benefitRules.copay.max_per_visit;
        }
        
        copayApplied += percentageCopay;
        copayDetails.push(`${benefitRules.copay.percentage}% copay`);
      }

      if (copayApplied > 0) {
        covered -= copayApplied;
        memberPays += copayApplied;
        result.copay_amount = copayApplied;
        reason.push(`${copayDetails.join(" + ")} applied`);
      }
    }

    // 8. Annual Limit Capping
    const remAnnual = this.state.annual[benefit_type];
    if (remAnnual <= 0) {
      result.reason = "Denied: Annual benefit limit exhausted.";
      return result;
    }

    if (covered > remAnnual) {
      const overage = covered - remAnnual;
      covered = remAnnual;
      memberPays += overage;
      reason.push(`Capped by remaining annual limit`);
    }

    // Apply State Deductions
    this.state.annual[benefit_type] -= covered;
    
    if (subRules.visits_per_year) {
      this.state.visits[benefit_type][sub_benefit] -= 1;
    }
    if (subRules.limit_per_year) {
      this.state.sub_annual[benefit_type][sub_benefit] -= covered;
    }

    // Finalize Result
    result.covered_amount = covered;
    result.member_pays = memberPays;
    
    if (covered === submitted) {
      result.decision = "FULLY_COVERED";
      if (reason.length === 0) reason.push("Fully covered");
    } else {
      result.decision = "PARTIALLY_COVERED";
    }

    result.reason = reason.join(". ") + ".";
    result.remaining_annual_limit = this.state.annual[benefit_type];
    
    if (subRules.visits_per_year) {
      result.remaining_visit_limit = this.state.visits[benefit_type][sub_benefit];
    } else {
      delete result.remaining_visit_limit; // Don't return if not applicable
    }

    return result;
  }
}
