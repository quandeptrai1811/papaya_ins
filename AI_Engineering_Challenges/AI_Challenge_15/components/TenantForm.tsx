import React, { useState, useEffect } from "react";
import { TenantConfig, ClaimTypeConfig, ApprovalTier, CustomField, NotificationChannel } from "../data/mockTenants";
import { Plus, Trash2, Save, Palette, FileText, ShieldCheck, Bell, HelpCircle, UserCheck } from "lucide-react";

interface TenantFormProps {
  initialConfig?: TenantConfig | null;
  onSave: (config: TenantConfig) => void;
  onCancel: () => void;
  existingNames: string[];
}

export default function TenantForm({ initialConfig, onSave, onCancel, existingNames }: TenantFormProps) {
  const [activeTab, setActiveTab] = useState<"branding" | "claims" | "approval" | "notifications" | "fields">("branding");
  
  // 1. Branding States
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
  
  // 2. Claim Types States
  const [claimTypes, setClaimTypes] = useState<Record<string, ClaimTypeConfig>>({
    OUTPATIENT: { enabled: true, requiredDocuments: [], optionalDocuments: [], slaDays: 5 },
    INPATIENT: { enabled: true, requiredDocuments: [], optionalDocuments: [], slaDays: 10 },
    DENTAL: { enabled: false, requiredDocuments: [], optionalDocuments: [], slaDays: 7 },
    MATERNITY: { enabled: false, requiredDocuments: [], optionalDocuments: [], slaDays: 7 },
    OPTICAL: { enabled: false, requiredDocuments: [], optionalDocuments: [], slaDays: 7 },
  });

  // 3. Approval Rules States
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState<number>(5000);
  const [tiers, setTiers] = useState<ApprovalTier[]>([]);

  // 4. Notifications States
  const [notifications, setNotifications] = useState<Record<string, { channels: NotificationChannel[]; emailTemplate: string }>>({
    claim_submitted: { channels: ["email"], emailTemplate: "" },
    approved: { channels: ["email"], emailTemplate: "" },
    rejected: { channels: ["email"], emailTemplate: "" },
    payment_sent: { channels: ["email"], emailTemplate: "" }
  });

  // 5. Custom Fields State
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  
  // 6. General States
  const [escalationEmail, setEscalationEmail] = useState("");

  // Validation Errors state
  const [errors, setErrors] = useState<string[]>([]);

  // Load initial config
  useEffect(() => {
    if (initialConfig) {
      setCompanyName(initialConfig.branding.companyName);
      setLogoUrl(initialConfig.branding.logoUrl);
      setPrimaryColor(initialConfig.branding.primaryColor);
      setSecondaryColor(initialConfig.branding.secondaryColor);
      setClaimTypes({ ...initialConfig.claimTypes });
      setAutoApprovalThreshold(initialConfig.approvalRules.autoApprovalThreshold);
      setTiers([...initialConfig.approvalRules.tiers]);
      
      const loadedNotifs: Record<string, { channels: NotificationChannel[]; emailTemplate: string }> = {};
      Object.entries(initialConfig.notifications).forEach(([key, value]) => {
        loadedNotifs[key] = {
          channels: [...value.channels],
          emailTemplate: value.emailTemplate
        };
      });
      setNotifications(loadedNotifs);
      setCustomFields([...initialConfig.customFields]);
      setEscalationEmail(initialConfig.escalationEmail || "");
      setErrors([]);
    } else {
      // Create defaults for NEW tenant
      setCompanyName("");
      setLogoUrl("");
      setPrimaryColor("#6366f1");
      setSecondaryColor("#a855f7");
      setClaimTypes({
        OUTPATIENT: { enabled: true, requiredDocuments: ["Receipt", "Medical Certificate"], optionalDocuments: [], slaDays: 5 },
        INPATIENT: { enabled: true, requiredDocuments: ["Discharge Summary", "Invoice"], optionalDocuments: [], slaDays: 10 },
        DENTAL: { enabled: false, requiredDocuments: ["Dental Invoice"], optionalDocuments: [], slaDays: 7 },
        MATERNITY: { enabled: false, requiredDocuments: ["Birth Certificate"], optionalDocuments: [], slaDays: 10 },
        OPTICAL: { enabled: false, requiredDocuments: ["Optician Prescription"], optionalDocuments: [], slaDays: 7 },
      });
      setAutoApprovalThreshold(5000);
      setTiers([{ role: "Assessor", minAmount: 5000, maxAmount: null }]);
      setNotifications({
        claim_submitted: { channels: ["email"], emailTemplate: "Dear {{memberName}},\n\nYour claim for {{claimType}} ({{amount}}) is received." },
        approved: { channels: ["email"], emailTemplate: "Dear {{memberName}},\n\nYour claim for {{claimType}} ({{amount}}) is APPROVED." },
        rejected: { channels: ["email"], emailTemplate: "Dear {{memberName}},\n\nYour claim for {{claimType}} ({{amount}}) is declined. Reason: {{reason}}" },
        payment_sent: { channels: ["email"], emailTemplate: "Dear {{memberName}},\n\nPayment of {{amount}} is processed." }
      });
      setCustomFields([]);
      setEscalationEmail("escalations@company.com");
      setErrors([]);
    }
  }, [initialConfig]);

  // Handle tier adding/removing
  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier ? (lastTier.maxAmount || lastTier.minAmount + 50000) : autoApprovalThreshold;
    setTiers([...tiers, { role: "Approver Tier " + (tiers.length + 1), minAmount: newMin, maxAmount: null }]);
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, key: keyof ApprovalTier, val: any) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [key]: val };
    setTiers(updated);
  };

  // Handle custom field adding/removing
  const addCustomField = () => {
    setCustomFields([...customFields, { id: "field_" + Date.now(), label: "New Field", type: "text", required: false }]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const updateCustomField = (index: number, key: keyof CustomField, val: any) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [key]: val };
    setCustomFields(updated);
  };

  // Handle Claim Type edits
  const toggleClaimType = (type: string) => {
    setClaimTypes({
      ...claimTypes,
      [type]: { ...claimTypes[type], enabled: !claimTypes[type].enabled }
    });
  };

  const updateClaimTypeSla = (type: string, days: number) => {
    setClaimTypes({
      ...claimTypes,
      [type]: { ...claimTypes[type], slaDays: days }
    });
  };

  const updateClaimTypeDocs = (type: string, key: "requiredDocuments" | "optionalDocuments", rawText: string) => {
    const docArray = rawText.split(",").map(s => s.trim()).filter(s => s !== "");
    setClaimTypes({
      ...claimTypes,
      [type]: { ...claimTypes[type], [key]: docArray }
    });
  };

  // Notification triggers
  const toggleNotifChannel = (event: string, channel: NotificationChannel) => {
    const currNotif = notifications[event];
    const hasChannel = currNotif.channels.includes(channel);
    const updatedChannels = hasChannel 
      ? currNotif.channels.filter(c => c !== channel)
      : [...currNotif.channels, channel];

    setNotifications({
      ...notifications,
      [event]: { ...currNotif, channels: updatedChannels }
    });
  };

  const updateNotifTemplate = (event: string, text: string) => {
    setNotifications({
      ...notifications,
      [event]: { ...notifications[event], emailTemplate: text }
    });
  };

  // Form Validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    // 1. Company Name check
    if (!companyName.trim()) {
      validationErrors.push("Company Name is required.");
    } else if (!initialConfig && existingNames.includes(companyName.trim().toLowerCase())) {
      validationErrors.push("A tenant with this Company Name already exists.");
    }

    // 2. Color check
    if (!primaryColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      validationErrors.push("Primary Color must be a valid hex color code (e.g. #3b82f6).");
    }
    if (!secondaryColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      validationErrors.push("Secondary Color must be a valid hex color code (e.g. #8b5cf6).");
    }

    // 3. At least one claim type enabled
    const enabledTypes = Object.entries(claimTypes).filter(([_, conf]) => conf.enabled);
    if (enabledTypes.length === 0) {
      validationErrors.push("At least one claim type must be enabled.");
    }

    // 4. SLA target processing time positive for enabled claim types
    enabledTypes.forEach(([key, conf]) => {
      if (conf.slaDays <= 0) {
        validationErrors.push(`SLA target processing days for ${key} must be a positive integer.`);
      }
    });

    // 5. Auto approval must be >= 0
    if (autoApprovalThreshold < 0) {
      validationErrors.push("Auto-approval threshold must be greater than or equal to 0.");
    }

    // 6. Custom field definitions checks
    customFields.forEach((field, i) => {
      if (!field.label.trim()) {
        validationErrors.push(`Custom Field ${i + 1} must have a valid label.`);
      }
      if (!field.id.trim() || field.id.includes(" ")) {
        validationErrors.push(`Custom Field ${i + 1} must have a unique identifier containing no spaces.`);
      }
    });

    // 7. Escalation email check
    if (escalationEmail && !escalationEmail.includes("@")) {
      validationErrors.push("Escalation target must be a valid email address.");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Auto scroll to top of form to see errors
      const formEl = document.getElementById("tenant-editor-form");
      if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Prepare final object
    const finalConfig: TenantConfig = {
      id: initialConfig?.id || companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      version: initialConfig ? initialConfig.version + 1 : 1,
      updatedAt: new Date().toISOString(),
      branding: {
        companyName: companyName.trim(),
        logoUrl: logoUrl.trim() || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=120&h=120&q=80",
        primaryColor,
        secondaryColor
      },
      claimTypes,
      approvalRules: {
        autoApprovalThreshold,
        tiers
      },
      notifications: notifications as any,
      customFields,
      escalationEmail: escalationEmail.trim()
    };

    onSave(finalConfig);
  };

  return (
    <form id="tenant-editor-form" onSubmit={handleSubmit} className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "14px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem" }}>
            {initialConfig ? `Configure Insurer: ${initialConfig.branding.companyName}` : "Onboard New Insurer"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            {initialConfig ? `Creating configuration version ${initialConfig.version + 1}` : "Zero-code tenant initialization wizard"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            type="button" 
            id="btn-cancel-config"
            onClick={onCancel}
            className="glass-panel" 
            style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.85rem" }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            id="btn-save-config"
            style={{ padding: "8px 16px", background: "var(--primary)", border: "none", borderRadius: "8px", color: "#fff", fontWeight: "600", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px", boxShadow: "var(--shadow-glow)" }}
          >
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {errors.length > 0 && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid var(--danger)", borderRadius: "8px", padding: "16px" }}>
          <h4 style={{ color: "var(--danger)", fontWeight: "700", marginBottom: "8px", fontSize: "0.95rem" }}>Validation Failure ({errors.length} issues)</h4>
          <ul style={{ fontSize: "0.85rem", listStyleType: "square", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {errors.map((err, i) => (
              <li key={i} style={{ color: "rgba(255, 255, 255, 0.9)" }}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tab Header Selector */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "1px" }}>
        {[
          { id: "branding", label: "Branding", icon: Palette },
          { id: "claims", label: "Claim Operations", icon: FileText },
          { id: "approval", label: "Approval Rules", icon: ShieldCheck },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "fields", label: "Custom Fields", icon: UserCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-editor-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: "none",
                border: "none",
                padding: "10px 16px",
                color: isActive ? "var(--primary)" : "var(--text-secondary)",
                borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                fontWeight: isActive ? "600" : "500",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panel Content */}
      <div style={{ minHeight: "350px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* TAB 1: BRANDING */}
        {activeTab === "branding" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Insurer (Company) Name *</label>
                <input 
                  type="text" 
                  id="input-company-name"
                  placeholder="e.g. SafeGuard Insurance" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Logo URL</label>
                <input 
                  type="url" 
                  id="input-logo-url"
                  placeholder="https://..." 
                  value={logoUrl} 
                  onChange={(e) => setLogoUrl(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Primary Brand Color (Hex) *</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input 
                    type="color" 
                    id="colorpicker-primary"
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ padding: "0", width: "40px", height: "40px", cursor: "pointer", border: "none" }}
                  />
                  <input 
                    type="text" 
                    id="input-primary-color"
                    placeholder="#3b82f6" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)} 
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Secondary Brand Color (Hex) *</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input 
                    type="color" 
                    id="colorpicker-secondary"
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{ padding: "0", width: "40px", height: "40px", cursor: "pointer", border: "none" }}
                  />
                  <input 
                    type="text" 
                    id="input-secondary-color"
                    placeholder="#8b5cf6" 
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)} 
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Ops Escalations Email</label>
              <input 
                type="text" 
                id="input-escalation-email"
                placeholder="escalations@insurer.com" 
                value={escalationEmail} 
                onChange={(e) => setEscalationEmail(e.target.value)} 
              />
            </div>
          </div>
        )}

        {/* TAB 2: CLAIM OPERATIONS */}
        {activeTab === "claims" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
              Enable specific claim classes, allocate processing business days, and list matching document mandates.
            </p>

            {Object.keys(claimTypes).map((type) => {
              const config = claimTypes[type];
              return (
                <div 
                  key={type} 
                  className="glass-panel" 
                  style={{ 
                    padding: "16px", 
                    background: config.enabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)",
                    border: `1px solid ${config.enabled ? "rgba(59, 130, 246, 0.2)" : "var(--border-glass)"}`
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: config.enabled ? "12px" : "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input 
                        type="checkbox" 
                        id={`checkbox-claim-${type}`}
                        checked={config.enabled} 
                        onChange={() => toggleClaimType(type)}
                        style={{ width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <span style={{ fontWeight: "700", fontSize: "0.95rem", color: config.enabled ? "var(--text-primary)" : "var(--text-muted)" }}>
                        {type}
                      </span>
                    </div>
                    {config.enabled && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>SLA Target:</span>
                        <input 
                          type="number" 
                          id={`input-sla-${type}`}
                          min="1" 
                          style={{ width: "65px", padding: "4px 8px", fontSize: "0.85rem" }}
                          value={config.slaDays} 
                          onChange={(e) => updateClaimTypeSla(type, parseInt(e.target.value) || 0)}
                        />
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>business days</span>
                      </div>
                    )}
                  </div>

                  {config.enabled && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>Required Documents (comma separated)</label>
                        <input 
                          type="text" 
                          id={`input-req-docs-${type}`}
                          placeholder="e.g. Medical Report, Receipt, ID Card"
                          value={config.requiredDocuments.join(", ")}
                          onChange={(e) => updateClaimTypeDocs(type, "requiredDocuments", e.target.value)}
                          style={{ fontSize: "0.8rem", padding: "6px 10px" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>Optional Documents (comma separated)</label>
                        <input 
                          type="text" 
                          id={`input-opt-docs-${type}`}
                          placeholder="e.g. Lab reports, Referral memo"
                          value={config.optionalDocuments.join(", ")}
                          onChange={(e) => updateClaimTypeDocs(type, "optionalDocuments", e.target.value)}
                          style={{ fontSize: "0.8rem", padding: "6px 10px" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: APPROVAL RULES */}
        {activeTab === "approval" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Auto-Approval Threshold ($) *</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input 
                  type="number" 
                  id="input-auto-approval"
                  min="0" 
                  value={autoApprovalThreshold} 
                  onChange={(e) => setAutoApprovalThreshold(parseInt(e.target.value) || 0)} 
                  style={{ width: "200px" }}
                />
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Claims up to this amount are approved with zero human intervention.
                </span>
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Manual Approval Routing Tiers</h4>
                <button 
                  type="button" 
                  id="btn-add-approval-tier"
                  onClick={addTier}
                  style={{ padding: "6px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-glass)", borderRadius: "6px", fontSize: "0.8rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Plus size={14} /> Add Tier
                </button>
              </div>

              {tiers.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", border: "1px dashed var(--border-glass)", borderRadius: "8px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  All claims exceeding the auto-approval threshold will route to standard "Assessor" (no custom tiers defined).
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {tiers.map((tier, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: "grid", 
                        gridTemplateColumns: "1.5fr 1fr 1fr 40px", 
                        gap: "10px", 
                        alignItems: "center", 
                        background: "rgba(255,255,255,0.02)", 
                        padding: "10px 14px", 
                        borderRadius: "8px", 
                        border: "1px solid var(--border-glass)" 
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Approver Role</span>
                        <input 
                          type="text" 
                          id={`input-tier-role-${idx}`}
                          placeholder="e.g. Assessor, Team Lead"
                          value={tier.role} 
                          onChange={(e) => updateTier(idx, "role", e.target.value)}
                          style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                        />
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Min Amount ($)</span>
                        <input 
                          type="number" 
                          id={`input-tier-min-${idx}`}
                          value={tier.minAmount} 
                          onChange={(e) => updateTier(idx, "minAmount", parseInt(e.target.value) || 0)}
                          style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Max Amount (Leave blank for infinity)</span>
                        <input 
                          type="number" 
                          id={`input-tier-max-${idx}`}
                          placeholder="Infinity"
                          value={tier.maxAmount ?? ""} 
                          onChange={(e) => updateTier(idx, "maxAmount", e.target.value === "" ? null : parseInt(e.target.value) || null)}
                          style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                        />
                      </div>

                      <button 
                        type="button" 
                        id={`btn-remove-tier-${idx}`}
                        onClick={() => removeTier(idx)}
                        style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer", display: "flex", justifyContent: "center", marginTop: "14px" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
              Configure messaging triggers, dispatch channels, and custom templates for claim milestones. Use placeholders like <code style={{ color: "var(--primary)" }}>{"{{memberName}}"}</code>, <code style={{ color: "var(--primary)" }}>{"{{claimType}}"}</code>, and <code style={{ color: "var(--primary)" }}>{"{{amount}}"}</code> in templates.
            </p>

            {Object.entries(notifications).map(([event, notif]) => {
              const label = event.split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
              return (
                <div key={event} className="glass-panel" style={{ padding: "16px", background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                      Event: {label}
                    </span>
                    
                    <div style={{ display: "flex", gap: "12px" }}>
                      {["email", "SMS", "webhook"].map((channel) => {
                        const isChecked = notif.channels.includes(channel as any);
                        return (
                          <label key={channel} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", cursor: "pointer" }}>
                            <input 
                              type="checkbox" 
                              id={`checkbox-notif-${event}-${channel}`}
                              checked={isChecked} 
                              onChange={() => toggleNotifChannel(event, channel as any)}
                            />
                            {channel.toUpperCase()}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Dispatch Template</label>
                    <textarea 
                      id={`textarea-template-${event}`}
                      rows={3}
                      value={notif.emailTemplate}
                      onChange={(e) => updateNotifTemplate(event, e.target.value)}
                      placeholder="Input message body here..."
                      style={{ fontSize: "0.8rem", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-glass)", borderRadius: "6px", padding: "8px", resize: "vertical", color: "rgba(255,255,255,0.9)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 5: CUSTOM FIELDS */}
        {activeTab === "fields" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Custom Submission Data Fields</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Enforce additional data inputs during the claim registration phase (e.g. Employee ID, Department, Welfare Code).
                </p>
              </div>
              <button 
                type="button" 
                id="btn-add-custom-field"
                onClick={addCustomField}
                style={{ padding: "6px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-glass)", borderRadius: "6px", fontSize: "0.8rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Plus size={14} /> Add Custom Field
              </button>
            </div>

            {customFields.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", border: "1px dashed var(--border-glass)", borderRadius: "8px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No custom fields defined. Members will submit claims using standard properties only.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {customFields.map((field, idx) => (
                  <div 
                    key={field.id} 
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr 1fr 80px 40px", 
                      gap: "10px", 
                      alignItems: "center", 
                      background: "rgba(255,255,255,0.02)", 
                      padding: "10px 14px", 
                      borderRadius: "8px", 
                      border: "1px solid var(--border-glass)" 
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Field Unique ID (e.g., employeeId)</span>
                      <input 
                        type="text" 
                        id={`input-field-id-${idx}`}
                        placeholder="e.g. departmentCode"
                        value={field.id} 
                        onChange={(e) => updateCustomField(idx, "id", e.target.value)}
                        style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                      />
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Field Label (User Facing)</span>
                      <input 
                        type="text" 
                        id={`input-field-label-${idx}`}
                        placeholder="e.g. Department Code"
                        value={field.label} 
                        onChange={(e) => updateCustomField(idx, "label", e.target.value)}
                        style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Data Type</span>
                      <select 
                        id={`select-field-type-${idx}`}
                        value={field.type} 
                        onChange={(e) => updateCustomField(idx, "type", e.target.value)}
                        style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                      >
                        <option value="text">Text String</option>
                        <option value="number">Numeric Value</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Required?</span>
                      <input 
                        type="checkbox" 
                        id={`checkbox-field-req-${idx}`}
                        checked={field.required} 
                        onChange={(e) => updateCustomField(idx, "required", e.target.checked)}
                        style={{ width: "16px", height: "16px", cursor: "pointer" }}
                      />
                    </div>

                    <button 
                      type="button" 
                      id={`btn-remove-field-${idx}`}
                      onClick={() => removeCustomField(field.id)}
                      style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer", display: "flex", justifyContent: "center", marginTop: "14px" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </form>
  );
}
