export interface Branding {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface ClaimTypeConfig {
  enabled: boolean;
  requiredDocuments: string[];
  optionalDocuments: string[];
  slaDays: number;
}

export interface ApprovalTier {
  role: string;
  minAmount: number;
  maxAmount: number | null; // null represents infinity
}

export interface ApprovalRules {
  autoApprovalThreshold: number;
  tiers: ApprovalTier[];
}

export type NotificationEvent = 'claim_submitted' | 'approved' | 'rejected' | 'payment_sent';
export type NotificationChannel = 'email' | 'SMS' | 'webhook';

export interface NotificationConfig {
  channels: NotificationChannel[];
  emailTemplate: string;
}

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number';
  required: boolean;
}

export interface TenantConfig {
  id: string;
  version: number;
  updatedAt: string;
  branding: Branding;
  claimTypes: Record<string, ClaimTypeConfig>; // OUTPATIENT, INPATIENT, DENTAL, MATERNITY, OPTICAL
  approvalRules: ApprovalRules;
  notifications: Record<NotificationEvent, NotificationConfig>;
  customFields: CustomField[];
  escalationEmail: string;
}

export const INITIAL_TENANTS: TenantConfig[] = [
  {
    id: "safeguard-corporate",
    version: 1,
    updatedAt: "2026-05-17T22:00:00Z",
    branding: {
      companyName: "SafeGuard Insurance",
      logoUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=120&h=120&q=80",
      primaryColor: "#1e3a8a",
      secondaryColor: "#3b82f6"
    },
    claimTypes: {
      OUTPATIENT: {
        enabled: true,
        requiredDocuments: ["Medical Certificate", "Receipt"],
        optionalDocuments: ["Referral Letter"],
        slaDays: 5
      },
      INPATIENT: {
        enabled: true,
        requiredDocuments: ["Discharge Summary", "Hospital Bill", "Medical Certificate"],
        optionalDocuments: ["Lab Reports"],
        slaDays: 10
      },
      DENTAL: {
        enabled: true,
        requiredDocuments: ["Dental Treatment Plan", "Receipt"],
        optionalDocuments: ["X-Ray"],
        slaDays: 7
      },
      MATERNITY: {
        enabled: false,
        requiredDocuments: ["Discharge Summary", "Receipt"],
        optionalDocuments: [],
        slaDays: 7
      },
      OPTICAL: {
        enabled: false,
        requiredDocuments: ["Prescription", "Receipt"],
        optionalDocuments: [],
        slaDays: 7
      }
    },
    approvalRules: {
      autoApprovalThreshold: 20000,
      tiers: [
        { role: "Assessor", minAmount: 20000, maxAmount: 100000 },
        { role: "Team Lead", minAmount: 100000, maxAmount: 500000 },
        { role: "Director", minAmount: 500000, maxAmount: null }
      ]
    },
    notifications: {
      claim_submitted: {
        channels: ["email"],
        emailTemplate: "Hello {{memberName}},\n\nYour claim for {{claimType}} with amount {{amount}} has been successfully submitted to SafeGuard. We are reviewing it under SLA ({{slaDays}} days).\n\nBest regards,\nSafeGuard Corporate Team"
      },
      approved: {
        channels: ["email"],
        emailTemplate: "Hello {{memberName}},\n\nCongratulations! Your claim for {{claimType}} of {{amount}} has been approved.\n\nBest regards,\nSafeGuard Corporate Team"
      },
      rejected: {
        channels: ["email"],
        emailTemplate: "Hello {{memberName}},\n\nWe regret to inform you that your claim for {{claimType}} of {{amount}} has been declined.\nReason: {{reason}}\n\nBest regards,\nSafeGuard Corporate Team"
      },
      payment_sent: {
        channels: ["email"],
        emailTemplate: "Hello {{memberName}},\n\nGood news! A payout of {{amount}} has been processed for your {{claimType}} claim.\n\nBest regards,\nSafeGuard Corporate Team"
      }
    },
    customFields: [
      { id: "employeeId", label: "Employee ID", type: "text", required: true }
    ],
    escalationEmail: "escalations@safeguard.com"
  },
  {
    id: "healthfirst-retail",
    version: 1,
    updatedAt: "2026-05-17T22:00:00Z",
    branding: {
      companyName: "HealthFirst",
      logoUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=120&h=120&q=80",
      primaryColor: "#10b981",
      secondaryColor: "#34d399"
    },
    claimTypes: {
      OUTPATIENT: {
        enabled: true,
        requiredDocuments: ["Receipt", "Medical Note"],
        optionalDocuments: [],
        slaDays: 7
      },
      INPATIENT: {
        enabled: true,
        requiredDocuments: ["Discharge Summary", "Receipt"],
        optionalDocuments: [],
        slaDays: 7
      },
      DENTAL: {
        enabled: true,
        requiredDocuments: ["Dental Receipt"],
        optionalDocuments: ["Treatment Plan"],
        slaDays: 7
      },
      MATERNITY: {
        enabled: true,
        requiredDocuments: ["Birth Certificate", "Hospital Receipt"],
        optionalDocuments: ["Antenatal Record"],
        slaDays: 7
      },
      OPTICAL: {
        enabled: true,
        requiredDocuments: ["Prescription Invoice"],
        optionalDocuments: [],
        slaDays: 7
      }
    },
    approvalRules: {
      autoApprovalThreshold: 5000,
      tiers: [
        { role: "Assessor", minAmount: 5000, maxAmount: 50000 },
        { role: "Manager", minAmount: 50000, maxAmount: null }
      ]
    },
    notifications: {
      claim_submitted: {
        channels: ["email", "SMS"],
        emailTemplate: "Dear {{memberName}},\n\nYour HealthFirst retail claim for {{claimType}} ({{amount}}) is received. Current processing SLA is {{slaDays}} business days."
      },
      approved: {
        channels: ["email", "SMS"],
        emailTemplate: "Dear {{memberName}},\n\nYour HealthFirst claim for {{claimType}} ({{amount}}) has been APPROVED."
      },
      rejected: {
        channels: ["email", "SMS"],
        emailTemplate: "Dear {{memberName}},\n\nYour HealthFirst claim for {{claimType}} ({{amount}}) was rejected. Reason: {{reason}}."
      },
      payment_sent: {
        channels: ["email", "SMS"],
        emailTemplate: "Dear {{memberName}},\n\nPayment of {{amount}} is on its way for your {{claimType}} claim!"
      }
    },
    customFields: [],
    escalationEmail: "retail_escalations@healthfirst.com"
  },
  {
    id: "govhealth-government",
    version: 1,
    updatedAt: "2026-05-17T22:00:00Z",
    branding: {
      companyName: "GovHealth",
      logoUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=120&h=120&q=80",
      primaryColor: "#475569",
      secondaryColor: "#d97706"
    },
    claimTypes: {
      OUTPATIENT: {
        enabled: true,
        requiredDocuments: ["Official Government Invoice", "Prescription List"],
        optionalDocuments: ["Department Referral Memo"],
        slaDays: 15
      },
      INPATIENT: {
        enabled: true,
        requiredDocuments: ["Government Hospital Discharge Certificate", "Itemized Cost Breakdown"],
        optionalDocuments: ["Welfare Support Certificate"],
        slaDays: 15
      },
      DENTAL: {
        enabled: false,
        requiredDocuments: [],
        optionalDocuments: [],
        slaDays: 15
      },
      MATERNITY: {
        enabled: false,
        requiredDocuments: [],
        optionalDocuments: [],
        slaDays: 15
      },
      OPTICAL: {
        enabled: false,
        requiredDocuments: [],
        optionalDocuments: [],
        slaDays: 15
      }
    },
    approvalRules: {
      autoApprovalThreshold: 0, // All claims require manual review
      tiers: [
        { role: "Committee", minAmount: 0, maxAmount: null }
      ]
    },
    notifications: {
      claim_submitted: {
        channels: ["email", "webhook"],
        emailTemplate: "OFFICIAL MEMORANDUM\n\nTo: {{memberName}}\nSubject: Receipt of claim ({{claimType}})\nAmount: {{amount}}\n\nYour submission is under formal review by the GovHealth committee under the standard SLA of 15 business days."
      },
      approved: {
        channels: ["email", "webhook"],
        emailTemplate: "OFFICIAL MEMORANDUM\n\nTo: {{memberName}}\nSubject: Approval of claim ({{claimType}})\nAmount: {{amount}}\n\nYour claim has been formally approved for reimbursement."
      },
      rejected: {
        channels: ["email", "webhook"],
        emailTemplate: "OFFICIAL MEMORANDUM\n\nTo: {{memberName}}\nSubject: Rejection of claim ({{claimType}})\nAmount: {{amount}}\n\nThe GovHealth committee has rejected your claim.\nReason: {{reason}}"
      },
      payment_sent: {
        channels: ["email", "webhook"],
        emailTemplate: "OFFICIAL MEMORANDUM\n\nTo: {{memberName}}\nSubject: Disbursement of funds\nAmount: {{amount}}\n\nPayment has been disbursed to your designated treasury account."
      }
    },
    customFields: [
      { id: "department", label: "Department", type: "text", required: true },
      { id: "budgetCode", label: "Budget Code", type: "text", required: true }
    ],
    escalationEmail: "public_affairs@govhealth.gov"
  }
];
