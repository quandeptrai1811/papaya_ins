import { TenantConfig } from "../data/mockTenants";

export interface DiffItem {
  path: string;
  category: "branding" | "claimTypes" | "approvalRules" | "notifications" | "customFields" | "general";
  label: string;
  valA: string;
  valB: string;
  isDifferent: boolean;
}

export function compareConfigs(a: TenantConfig, b: TenantConfig): DiffItem[] {
  const diffs: DiffItem[] = [];

  // Helper to add a comparison item
  const compareValue = (
    category: DiffItem["category"],
    label: string,
    valA: any,
    valB: any,
    path: string
  ) => {
    const strA = typeof valA === "object" ? JSON.stringify(valA) : String(valA ?? "N/A");
    const strB = typeof valB === "object" ? JSON.stringify(valB) : String(valB ?? "N/A");
    diffs.push({
      path,
      category,
      label,
      valA: strA,
      valB: strB,
      isDifferent: strA !== strB
    });
  };

  // 1. General & Branding
  compareValue("general", "Config Version", a.version, b.version, "General > Version");
  compareValue("branding", "Company Name", a.branding.companyName, b.branding.companyName, "Branding > Company Name");
  compareValue("branding", "Primary Color", a.branding.primaryColor, b.branding.primaryColor, "Branding > Primary Color");
  compareValue("branding", "Secondary Color", a.branding.secondaryColor, b.branding.secondaryColor, "Branding > Secondary Color");
  compareValue("branding", "Logo URL", a.branding.logoUrl, b.branding.logoUrl, "Branding > Logo URL");

  // 2. Claim Types
  const allTypes = ["OUTPATIENT", "INPATIENT", "DENTAL", "MATERNITY", "OPTICAL"];
  allTypes.forEach(type => {
    const typeA = a.claimTypes[type] || { enabled: false, requiredDocuments: [], optionalDocuments: [], slaDays: 0 };
    const typeB = b.claimTypes[type] || { enabled: false, requiredDocuments: [], optionalDocuments: [], slaDays: 0 };

    compareValue("claimTypes", `${type} - Enabled Status`, typeA.enabled ? "Enabled" : "Disabled", typeB.enabled ? "Enabled" : "Disabled", `Claim Types > ${type} > Enabled`);
    
    if (typeA.enabled || typeB.enabled) {
      compareValue("claimTypes", `${type} - Required Documents`, typeA.requiredDocuments.join(", ") || "None", typeB.requiredDocuments.join(", ") || "None", `Claim Types > ${type} > Required Docs`);
      compareValue("claimTypes", `${type} - Optional Documents`, typeA.optionalDocuments.join(", ") || "None", typeB.optionalDocuments.join(", ") || "None", `Claim Types > ${type} > Optional Docs`);
      compareValue("claimTypes", `${type} - SLA Days`, `${typeA.slaDays} days`, `${typeB.slaDays} days`, `Claim Types > ${type} > SLA`);
    }
  });

  // 3. Approval Rules
  compareValue("approvalRules", "Auto-Approval Threshold", 
    `$${a.approvalRules.autoApprovalThreshold.toLocaleString()}`, 
    `$${b.approvalRules.autoApprovalThreshold.toLocaleString()}`, 
    "Approval Rules > Auto-Approval"
  );

  const getTiersText = (tiers: typeof a.approvalRules.tiers) => {
    if (tiers.length === 0) return "No manual approval tiers (Auto-approve only)";
    return tiers.map(tier => {
      const min = `$${tier.minAmount.toLocaleString()}`;
      const max = tier.maxAmount === null ? "∞" : `$${tier.maxAmount.toLocaleString()}`;
      return `${tier.role} (${min} to ${max})`;
    }).join(" | ");
  };

  compareValue("approvalRules", "Approval Routing Tiers", getTiersText(a.approvalRules.tiers), getTiersText(b.approvalRules.tiers), "Approval Rules > Tiers");

  // 4. Notifications
  const events = ["claim_submitted", "approved", "rejected", "payment_sent"];
  events.forEach(event => {
    const label = event.split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    const notifA = a.notifications[event] || { channels: [], emailTemplate: "" };
    const notifB = b.notifications[event] || { channels: [], emailTemplate: "" };

    compareValue("notifications", `${label} Channels`, notifA.channels.map(c => c.toUpperCase()).join(", ") || "None", notifB.channels.map(c => c.toUpperCase()).join(", ") || "None", `Notifications > ${event} > Channels`);
    compareValue("notifications", `${label} Template Summary`, 
      notifA.emailTemplate ? `${notifA.emailTemplate.slice(0, 45)}...` : "None", 
      notifB.emailTemplate ? `${notifB.emailTemplate.slice(0, 45)}...` : "None", 
      `Notifications > ${event} > Template`
    );
  });

  // 5. Custom Fields
  const getFieldsText = (fields: typeof a.customFields) => {
    if (fields.length === 0) return "None";
    return fields.map(f => `${f.label} (${f.type}${f.required ? ", required" : ""})`).join(" | ");
  };
  compareValue("customFields", "Custom Fields Enforced", getFieldsText(a.customFields), getFieldsText(b.customFields), "Custom Fields");

  // 6. Escalations
  compareValue("general", "Escalation Target", a.escalationEmail || "N/A", b.escalationEmail || "N/A", "General > Escalation Email");

  return diffs;
}
