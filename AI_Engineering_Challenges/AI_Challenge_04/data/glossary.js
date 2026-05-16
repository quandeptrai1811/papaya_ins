export const glossaryData = [
  // General Insurance
  {
    id: "premium",
    term: "Premium",
    category: "General Insurance",
    definition: "The amount paid by the policyholder to the insurance company to purchase and maintain an insurance policy. It can be paid monthly, quarterly, or annually.",
    relatedTerms: ["policyholder", "underwriting"]
  },
  {
    id: "policyholder",
    term: "Policyholder",
    category: "General Insurance",
    definition: "The person or entity who owns the insurance policy and has the right to exercise all privileges under the contract of insurance.",
    relatedTerms: ["premium", "beneficiary"]
  },
  {
    id: "underwriting",
    term: "Underwriting",
    category: "General Insurance",
    definition: "The process by which an insurance company evaluates the risk of insuring a person or asset and determines the appropriate premium to charge.",
    relatedTerms: ["premium", "exclusion"]
  },
  {
    id: "endorsement",
    term: "Endorsement",
    category: "General Insurance",
    definition: "A written document attached to an insurance policy that modifies its terms by adding, removing, or altering coverage.",
    relatedTerms: ["rider", "exclusion"]
  },
  {
    id: "rider",
    term: "Rider",
    category: "General Insurance",
    definition: "An add-on provision to a basic insurance policy that provides additional benefits to the policyholder at an extra cost.",
    relatedTerms: ["endorsement"]
  },
  {
    id: "grace-period",
    term: "Grace Period",
    category: "General Insurance",
    definition: "A specified amount of time after a premium payment is due during which the policy remains active even if the payment has not been made.",
    relatedTerms: ["premium"]
  },
  {
    id: "lapsed-policy",
    term: "Lapsed Policy",
    category: "General Insurance",
    definition: "An insurance policy that is no longer active because the policyholder failed to pay the required premiums before the end of the grace period.",
    relatedTerms: ["grace-period", "premium"]
  },

  // Claims
  {
    id: "claim",
    term: "Claim",
    category: "Claims",
    definition: "A formal request by a policyholder to an insurance company for coverage or compensation for a covered loss or policy event.",
    relatedTerms: ["adjudication", "deductible"]
  },
  {
    id: "deductible",
    term: "Deductible",
    category: "Claims",
    definition: "The amount of money the policyholder must pay out-of-pocket before the insurance company will cover any expenses.",
    relatedTerms: ["copay", "coinsurance", "claim"]
  },
  {
    id: "copay",
    term: "Copay",
    category: "Claims",
    definition: "A fixed amount a policyholder pays for a covered healthcare service after they've paid their deductible.",
    relatedTerms: ["deductible", "coinsurance"]
  },
  {
    id: "coinsurance",
    term: "Coinsurance",
    category: "Claims",
    definition: "The percentage of costs of a covered service the policyholder pays after they've paid their deductible.",
    relatedTerms: ["deductible", "copay"]
  },
  {
    id: "adjudication",
    term: "Adjudication",
    category: "Claims",
    definition: "The process by which an insurance company evaluates a claim and decides whether to pay it, deny it, or reduce the payout amount.",
    relatedTerms: ["claim", "explanation-of-benefits"]
  },
  {
    id: "subrogation",
    term: "Subrogation",
    category: "Claims",
    definition: "The legal right of an insurance company to pursue a third party that caused an insurance loss to the insured in order to recover the amount of the claim paid.",
    relatedTerms: ["claim"]
  },
  {
    id: "explanation-of-benefits",
    term: "Explanation of Benefits (EOB)",
    category: "Claims",
    definition: "A statement sent by a health insurance company explaining what medical treatments or services were paid for on their behalf.",
    relatedTerms: ["adjudication", "claim"]
  },
  {
    id: "adjuster",
    term: "Adjuster",
    category: "Claims",
    definition: "A representative of the insurance company who investigates and evaluates claims to determine the extent of the company's liability.",
    relatedTerms: ["claim", "adjudication"]
  },

  // Coverage
  {
    id: "sum-insured",
    term: "Sum Insured",
    category: "Coverage",
    definition: "The maximum amount an insurance company will pay out for a covered loss under a specific insurance policy.",
    relatedTerms: ["annual-limit", "sub-limit"]
  },
  {
    id: "annual-limit",
    term: "Annual Limit",
    category: "Coverage",
    definition: "The maximum amount of money your insurance company will pay for your covered services over the course of a policy year.",
    relatedTerms: ["sum-insured"]
  },
  {
    id: "sub-limit",
    term: "Sub-limit",
    category: "Coverage",
    definition: "A cap placed on the amount of coverage available for a specific type of loss, which is lower than the overall policy sum insured.",
    relatedTerms: ["sum-insured", "annual-limit"]
  },
  {
    id: "exclusion",
    term: "Exclusion",
    category: "Coverage",
    definition: "Specific conditions or circumstances for which the insurance policy does not provide coverage or benefits.",
    relatedTerms: ["pre-existing-condition"]
  },
  {
    id: "waiting-period",
    term: "Waiting Period",
    category: "Coverage",
    definition: "A specified period of time beginning with the effective date of the policy during which specific benefits are not payable.",
    relatedTerms: ["pre-existing-condition"]
  },
  {
    id: "pre-existing-condition",
    term: "Pre-existing Condition",
    category: "Coverage",
    definition: "A medical condition or illness that the insured had before the start date of a new health insurance policy.",
    relatedTerms: ["exclusion", "waiting-period"]
  },
  {
    id: "network",
    term: "Network",
    category: "Coverage",
    definition: "The facilities, providers, and suppliers your health insurer or plan has contracted with to provide healthcare services.",
    relatedTerms: ["out-of-pocket-maximum"]
  },
  {
    id: "out-of-pocket-maximum",
    term: "Out-of-Pocket Maximum",
    category: "Coverage",
    definition: "The absolute maximum amount you will have to pay for covered services in a single year. After this, the insurer pays 100%.",
    relatedTerms: ["deductible", "coinsurance"]
  },

  // Life & Health
  {
    id: "beneficiary",
    term: "Beneficiary",
    category: "Life & Health",
    definition: "The person or entity designated to receive the death benefit from a life insurance policy or annuity contract.",
    relatedTerms: ["policyholder"]
  },
  {
    id: "maturity",
    term: "Maturity",
    category: "Life & Health",
    definition: "The date upon which the face amount of a life insurance policy becomes payable to the policyholder if they are still living.",
    relatedTerms: ["surrender-value"]
  },
  {
    id: "surrender-value",
    term: "Surrender Value",
    category: "Life & Health",
    definition: "The amount of money the policyholder receives from the insurance company if they decide to terminate a whole life policy before it matures or the insured event occurs.",
    relatedTerms: ["maturity"]
  },
  {
    id: "mortality-table",
    term: "Mortality Table",
    category: "Life & Health",
    definition: "A statistical table showing the probability of death at each age, used by actuaries to calculate life insurance premiums.",
    relatedTerms: ["actuarial", "underwriting"]
  },
  {
    id: "actuarial",
    term: "Actuarial",
    category: "Life & Health",
    definition: "Relating to the statistical calculation of risk and life expectancy to set insurance premiums.",
    relatedTerms: ["mortality-table", "underwriting"]
  },
  {
    id: "whole-life",
    term: "Whole Life Insurance",
    category: "Life & Health",
    definition: "A life insurance policy which is guaranteed to remain in force for the insured's entire lifetime, provided required premiums are paid.",
    relatedTerms: ["term-life", "surrender-value"]
  },
  {
    id: "term-life",
    term: "Term Life Insurance",
    category: "Life & Health",
    definition: "Life insurance that provides coverage at a fixed rate of payments for a limited period of time, the relevant term.",
    relatedTerms: ["whole-life"]
  },
  {
    id: "death-benefit",
    term: "Death Benefit",
    category: "Life & Health",
    definition: "The payout to the beneficiary of a life insurance policy, annuity, or pension when the insured or annuitant dies.",
    relatedTerms: ["beneficiary", "whole-life"]
  },

  // Reinsurance
  {
    id: "ceding-company",
    term: "Ceding Company",
    category: "Reinsurance",
    definition: "An insurance company that transfers all or part of a risk to a reinsurer to protect against catastrophic losses.",
    relatedTerms: ["treaty", "facultative"]
  },
  {
    id: "retrocession",
    term: "Retrocession",
    category: "Reinsurance",
    definition: "A transaction in which a reinsurer transfers risks it has assumed to another reinsurer.",
    relatedTerms: ["ceding-company"]
  },
  {
    id: "treaty",
    term: "Treaty Reinsurance",
    category: "Reinsurance",
    definition: "A broad reinsurance agreement covering a whole class or portfolio of risks, automatically accepting all policies that fall within its terms.",
    relatedTerms: ["facultative", "ceding-company"]
  },
  {
    id: "facultative",
    term: "Facultative Reinsurance",
    category: "Reinsurance",
    definition: "A type of reinsurance in which the reinsurer negotiates separately for each insurance contract it will reinsure.",
    relatedTerms: ["treaty", "ceding-company"]
  },
  {
    id: "loss-ratio",
    term: "Loss Ratio",
    category: "Reinsurance",
    definition: "The ratio of incurred losses and loss-adjustment expenses to net earned premiums, a key indicator of profitability.",
    relatedTerms: ["underwriting"]
  },
  {
    id: "retention",
    term: "Retention",
    category: "Reinsurance",
    definition: "The portion of risk that an insurance company keeps for its own account and does not pass on to a reinsurer.",
    relatedTerms: ["ceding-company"]
  },
  {
    id: "catastrophe-bond",
    term: "Catastrophe Bond",
    category: "Reinsurance",
    definition: "A high-yield debt instrument that raises money for insurance companies in the event of a natural disaster.",
    relatedTerms: ["retrocession"]
  },

  // Regulatory
  {
    id: "solvency",
    term: "Solvency",
    category: "Regulatory",
    definition: "An insurance company's ability to meet its long-term financial obligations and pay all valid claims.",
    relatedTerms: ["reserve", "statutory-reporting"]
  },
  {
    id: "reserve",
    term: "Reserve",
    category: "Regulatory",
    definition: "Funds set aside by an insurance company specifically for the payment of anticipated future claims and obligations.",
    relatedTerms: ["solvency", "ibnr"]
  },
  {
    id: "ibnr",
    term: "IBNR (Incurred But Not Reported)",
    category: "Regulatory",
    definition: "A reserve provision for claims and events that have occurred but have not yet been reported to the insurance company.",
    relatedTerms: ["reserve", "actuarial"]
  },
  {
    id: "statutory-reporting",
    term: "Statutory Reporting",
    category: "Regulatory",
    definition: "The mandatory financial reporting that insurance companies must submit to state or national regulators based on specific accounting principles.",
    relatedTerms: ["compliance", "solvency"]
  },
  {
    id: "compliance",
    term: "Compliance",
    category: "Regulatory",
    definition: "The act of ensuring an insurance company adheres to all applicable laws, regulations, and industry standards.",
    relatedTerms: ["statutory-reporting"]
  },
  {
    id: "guaranty-fund",
    term: "Guaranty Fund",
    category: "Regulatory",
    definition: "A state-administered fund that protects policyholders in the event that an insurance company becomes insolvent or goes bankrupt.",
    relatedTerms: ["solvency"]
  },
  {
    id: "market-conduct",
    term: "Market Conduct",
    category: "Regulatory",
    definition: "The non-financial operations of an insurance company, including sales practices, marketing, underwriting, and claims handling.",
    relatedTerms: ["compliance"]
  }
];
