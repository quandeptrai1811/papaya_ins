import { TenantConfig, ClaimTypeConfig, CustomField, NotificationEvent } from "../data/mockTenants";

export interface ClaimData {
  memberName: string;
  claimType: string; // OUTPATIENT, INPATIENT, DENTAL, MATERNITY, OPTICAL
  amount: number;
  submissionDate: string; // YYYY-MM-DD
  customFieldsData: Record<string, string>;
}

export interface ProcessResult {
  tenantId: string;
  tenantName: string;
  claimType: string;
  amount: number;
  claimTypeEnabled: boolean;
  requiredDocuments: string[];
  optionalDocuments: string[];
  approvalRoute: {
    role: string;
    description: string;
    autoApproved: boolean;
  };
  notifications: Array<{
    event: string;
    channels: string[];
    renderedTemplate: string;
  }>;
  slaDeadline: string;
  slaDays: number;
  customFieldsValidation: {
    isValid: boolean;
    errors: Record<string, string>;
  };
  isValid: boolean;
  generalError?: string;
}

/**
 * Calculates a date offset by a given number of business days (skipping weekends).
 */
export function calculateSlaDeadline(submissionDateStr: string, businessDays: number): string {
  const date = new Date(submissionDateStr);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  let remainingDays = businessDays;
  while (remainingDays > 0) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
      remainingDays--;
    }
  }

  return date.toISOString().split("T")[0];
}

/**
 * Replaces placeholders like {{memberName}} in email templates with claim data.
 */
export function renderEmailTemplate(
  template: string,
  claim: ClaimData,
  slaDays: number,
  slaDeadline: string,
  approvalRole: string,
  companyName: string
): string {
  let rendered = template;
  rendered = rendered.replaceAll("{{memberName}}", claim.memberName || "Member");
  rendered = rendered.replaceAll("{{claimType}}", claim.claimType);
  rendered = rendered.replaceAll("{{amount}}", new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(claim.amount));
  rendered = rendered.replaceAll("{{slaDays}}", slaDays.toString());
  rendered = rendered.replaceAll("{{slaDeadline}}", slaDeadline);
  rendered = rendered.replaceAll("{{approverRole}}", approvalRole);
  rendered = rendered.replaceAll("{{companyName}}", companyName);
  rendered = rendered.replaceAll("{{reason}}", "Missing receipts or out-of-network treatment"); // Default fallback mock reason
  return rendered;
}

/**
 * Core runtime claim processing function.
 */
export function processClaim(config: TenantConfig, claimData: ClaimData): ProcessResult {
  const { branding, claimTypes, approvalRules, notifications, customFields } = config;
  const claimType = claimData.claimType;
  const typeConfig = claimTypes[claimType];

  // 1. Check if Claim Type is enabled
  if (!typeConfig || !typeConfig.enabled) {
    return {
      tenantId: config.id,
      tenantName: branding.companyName,
      claimType,
      amount: claimData.amount,
      claimTypeEnabled: false,
      requiredDocuments: [],
      optionalDocuments: [],
      approvalRoute: {
        role: "N/A",
        description: `This tenant does not support ${claimType} claims.`,
        autoApproved: false
      },
      notifications: [],
      slaDeadline: "N/A",
      slaDays: 0,
      customFieldsValidation: {
        isValid: false,
        errors: { claimType: `${claimType} claims are disabled for ${branding.companyName}.` }
      },
      isValid: false,
      generalError: `${claimType} claims are disabled for ${branding.companyName}.`
    };
  }

  // 2. Custom Fields Validation
  const errors: Record<string, string> = {};
  let isCustomFieldsValid = true;

  for (const field of customFields) {
    const value = claimData.customFieldsData[field.id];
    if (field.required && (!value || value.trim() === "")) {
      errors[field.id] = `${field.label} is required.`;
      isCustomFieldsValid = false;
    } else if (value && field.type === "number") {
      const parsed = Number(value);
      if (isNaN(parsed)) {
        errors[field.id] = `${field.label} must be a number.`;
        isCustomFieldsValid = false;
      }
    }
  }

  // 3. Document Requirements
  const requiredDocuments = typeConfig.requiredDocuments || [];
  const optionalDocuments = typeConfig.optionalDocuments || [];

  // 4. SLA Deadline Calculation (Business Days)
  const slaDays = typeConfig.slaDays || 7;
  const slaDeadline = calculateSlaDeadline(claimData.submissionDate, slaDays);

  // 5. Approval Routing Rules
  let approvalRole = "Assessor";
  let autoApproved = false;
  let approvalDescription = "";

  if (claimData.amount <= approvalRules.autoApprovalThreshold) {
    autoApproved = true;
    approvalRole = "Auto-Approved";
    approvalDescription = `Automatically approved (Claim amount is under the auto-approval threshold of ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(approvalRules.autoApprovalThreshold)}).`;
  } else {
    // Find matching tier
    const matchedTier = approvalRules.tiers.find(
      tier =>
        claimData.amount > tier.minAmount &&
        (tier.maxAmount === null || claimData.amount <= tier.maxAmount)
    );

    if (matchedTier) {
      approvalRole = matchedTier.role;
      const rangeText = matchedTier.maxAmount === null 
        ? `above ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(matchedTier.minAmount)}`
        : `between ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(matchedTier.minAmount)} and ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(matchedTier.maxAmount)}`;
      approvalDescription = `Routed to ${matchedTier.role} (Claim amount is ${rangeText}).`;
    } else {
      // Fallback to highest tier if somehow no tier explicitly matched
      if (approvalRules.tiers.length > 0) {
        const sortedTiers = [...approvalRules.tiers].sort((a, b) => b.minAmount - a.minAmount);
        approvalRole = sortedTiers[0].role;
        approvalDescription = `Routed to ${sortedTiers[0].role} (fallback to highest tier).`;
      } else {
        approvalRole = "Manual Reviewer";
        approvalDescription = "Routed to standard Manual Reviewer (no specific tiers configured).";
      }
    }
  }

  // 6. Notifications Render
  const events: NotificationEvent[] = ["claim_submitted", "approved", "rejected", "payment_sent"];
  const renderedNotifications = events.map(event => {
    const notifConfig = notifications[event] || { channels: ["email"], emailTemplate: "Notification" };
    return {
      event,
      channels: notifConfig.channels,
      renderedTemplate: renderEmailTemplate(
        notifConfig.emailTemplate,
        claimData,
        slaDays,
        slaDeadline,
        approvalRole,
        branding.companyName
      )
    };
  });

  return {
    tenantId: config.id,
    tenantName: branding.companyName,
    claimType,
    amount: claimData.amount,
    claimTypeEnabled: true,
    requiredDocuments,
    optionalDocuments,
    approvalRoute: {
      role: approvalRole,
      description: approvalDescription,
      autoApproved
    },
    notifications: renderedNotifications,
    slaDeadline,
    slaDays,
    customFieldsValidation: {
      isValid: isCustomFieldsValid,
      errors
    },
    isValid: isCustomFieldsValid
  };
}
