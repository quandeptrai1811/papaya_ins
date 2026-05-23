import React, { useState, useEffect } from "react";
import { TenantConfig } from "../data/mockTenants";
import { processClaim, ProcessResult, ClaimData } from "../utils/engine";
import { User, DollarSign, Calendar, CheckSquare, Mail, Calculator, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

interface ClaimSimulatorProps {
  activeTenant: TenantConfig;
}

export default function ClaimSimulator({ activeTenant }: ClaimSimulatorProps) {
  // 1. Claim Form States
  const [memberName, setMemberName] = useState("John Doe");
  const [claimType, setClaimType] = useState("OUTPATIENT");
  const [amount, setAmount] = useState<number>(15000);
  const [submissionDate, setSubmissionDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, string>>({});

  // Result state
  const [result, setResult] = useState<ProcessResult | null>(null);
  
  // Track checked docs manually in simulation
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  // Reset custom fields when tenant or claimType changes
  useEffect(() => {
    const initialFields: Record<string, string> = {};
    activeTenant.customFields.forEach(f => {
      initialFields[f.id] = "";
    });
    setCustomFieldsData(initialFields);
    setResult(null);
    setCheckedDocs({});
    
    // Find first enabled claim type for this tenant
    const enabledTypes = Object.entries(activeTenant.claimTypes)
      .filter(([_, conf]) => conf.enabled)
      .map(([key]) => key);
    
    if (enabledTypes.length > 0 && !enabledTypes.includes(claimType)) {
      setClaimType(enabledTypes[0]);
    }
  }, [activeTenant]);

  const handleCustomFieldChange = (id: string, val: string) => {
    setCustomFieldsData({
      ...customFieldsData,
      [id]: val
    });
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();

    const claimData: ClaimData = {
      memberName,
      claimType,
      amount,
      submissionDate,
      customFieldsData
    };

    const processResult = processClaim(activeTenant, claimData);
    setResult(processResult);
    
    // Reset checked docs
    const initialChecked: Record<string, boolean> = {};
    processResult.requiredDocuments.forEach(doc => {
      initialChecked[doc] = false;
    });
    setCheckedDocs(initialChecked);
  };

  const toggleDocCheck = (doc: string) => {
    setCheckedDocs({
      ...checkedDocs,
      [doc]: !checkedDocs[doc]
    });
  };

  const isAllDocsChecked = result?.requiredDocuments.every(doc => checkedDocs[doc]) ?? false;

  // Render a list of enabled claim types for selector
  const enabledClaimTypes = Object.entries(activeTenant.claimTypes)
    .filter(([_, conf]) => conf.enabled)
    .map(([key]) => key);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px", alignItems: "start" }}>
      
      {/* Simulation Inputs Form Card */}
      <form onSubmit={handleSimulate} className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem" }}>
            Claim Sandbox Playground
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Submit a test claim to evaluate rules for <strong>{activeTenant.branding.companyName}</strong>
          </p>
        </div>

        {/* Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>Member Name</label>
          <div style={{ position: "relative" }}>
            <input 
              type="text" 
              id="input-sim-member"
              value={memberName} 
              onChange={(e) => setMemberName(e.target.value)} 
              style={{ width: "100%", paddingLeft: "36px" }}
              required
            />
            <User size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-muted)" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>Claim Type</label>
            <select 
              id="select-sim-type"
              value={claimType} 
              onChange={(e) => setClaimType(e.target.value)}
              style={{ width: "100%" }}
            >
              {enabledClaimTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>Amount ($)</label>
            <div style={{ position: "relative" }}>
              <input 
                type="number" 
                id="input-sim-amount"
                min="1"
                value={amount} 
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)} 
                style={{ width: "100%", paddingLeft: "32px" }}
                required
              />
              <DollarSign size={16} style={{ position: "absolute", left: "10px", top: "13px", color: "var(--text-muted)" }} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>Submission Date</label>
          <div style={{ position: "relative" }}>
            <input 
              type="date" 
              id="input-sim-date"
              value={submissionDate} 
              onChange={(e) => setSubmissionDate(e.target.value)} 
              style={{ width: "100%", paddingLeft: "36px" }}
              required
            />
            <Calendar size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "var(--text-muted)" }} />
          </div>
        </div>

        {/* Dynamic Tenant-Specific Custom Fields */}
        {activeTenant.customFields.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-glass)", display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--primary)" }}>Insurer Custom Fields Enforced:</span>
            {activeTenant.customFields.map(field => (
              <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                  {field.label} {field.required && "*"}
                </label>
                <input 
                  type={field.type === "number" ? "number" : "text"} 
                  id={`input-sim-custom-${field.id}`}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={customFieldsData[field.id] || ""}
                  onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                  style={{ width: "100%", fontSize: "0.85rem", padding: "8px 12px" }}
                />
                {result && result.customFieldsValidation.errors[field.id] && (
                  <span style={{ fontSize: "0.7rem", color: "var(--danger)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertTriangle size={10} /> {result.customFieldsValidation.errors[field.id]}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <button 
          type="submit" 
          id="btn-run-simulation"
          style={{
            background: `linear-gradient(135deg, ${activeTenant.branding.primaryColor}, ${activeTenant.branding.secondaryColor})`,
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            fontWeight: "700",
            fontSize: "0.9rem",
            marginTop: "8px",
            boxShadow: `0 4px 20px ${activeTenant.branding.primaryColor}22`
          }}
        >
          Process Claim Execution
        </button>
      </form>

      {/* Simulation Results Visualization Card */}
      <div className="glass-panel" style={{ padding: "24px", minHeight: "450px", display: "flex", flexDirection: "column", justifyContent: result ? "flex-start" : "center" }}>
        {!result ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "40px" }}>
            <Calculator size={48} style={{ strokeWidth: 1.2 }} />
            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--text-secondary)" }}>Awaiting Execution</h4>
            <p style={{ fontSize: "0.8rem", maxWidth: "250px" }}>
              Configure your claim parameters on the left and click "Process Claim" to evaluate.
            </p>
          </div>
        ) : (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            
            {/* Header / Claim Status Banner */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "12px" }}>
              <div>
                <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem" }}>
                  Execution Evaluation Report
                </h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Processed at {new Date(result.slaDeadline).toLocaleDateString()} SLA Deadline
                </p>
              </div>

              {result.isValid ? (
                <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.15)", color: "var(--success)", border: "1px solid var(--success)", padding: "3px 8px", borderRadius: "4px", fontWeight: "600" }}>
                  SUCCESS: Valid Claim
                </span>
              ) : (
                <span style={{ fontSize: "0.75rem", background: "rgba(239, 68, 68, 0.15)", color: "var(--danger)", border: "1px solid var(--danger)", padding: "3px 8px", borderRadius: "4px", fontWeight: "600" }}>
                  FAIL: Invalid Custom Fields
                </span>
              )}
            </div>

            {/* Visual approval routing journey pipeline */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "10px", padding: "14px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                Approval Routing Pipeline:
              </span>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                <div style={{ padding: "6px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-glass)", borderRadius: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Claim Submitted
                </div>
                
                <div style={{ flex: 1, height: "2px", background: "var(--border-glass)" }} />
                
                <div 
                  style={{ 
                    padding: "8px 14px", 
                    background: result.approvalRoute.autoApproved ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)", 
                    border: `1px solid ${result.approvalRoute.autoApproved ? "var(--success)" : "var(--primary)"}`, 
                    borderRadius: "8px", 
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: result.approvalRoute.autoApproved ? "var(--success)" : "var(--primary)",
                    boxShadow: result.approvalRoute.autoApproved ? "0 0 10px rgba(16, 185, 129, 0.15)" : "none"
                  }}
                >
                  {result.approvalRoute.role}
                </div>
              </div>
              
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheck size={12} style={{ color: "var(--success)" }} /> {result.approvalRoute.description}
              </p>
            </div>

            {/* SLA Calendar countdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              
              {/* SLA Target box */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "10px", padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Calculator size={20} style={{ color: "var(--accent)" }} />
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Processing SLA</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "700" }}>{result.slaDays} Business Days</div>
                </div>
              </div>

              {/* Deadline box */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "10px", padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Calendar size={20} style={{ color: "var(--warning)" }} />
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>SLA Deadline</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--warning)" }}>{result.slaDeadline}</div>
                </div>
              </div>
            </div>

            {/* Document Checklist Interactive panel */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "10px", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)" }}>
                  Mandated Document Checklist:
                </span>
                <span 
                  style={{ 
                    fontSize: "0.7rem", 
                    background: isAllDocsChecked ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)", 
                    color: isAllDocsChecked ? "var(--success)" : "var(--warning)", 
                    padding: "2px 6px", 
                    borderRadius: "4px",
                    fontWeight: "600"
                  }}
                >
                  {isAllDocsChecked ? "All documents uploaded" : "Upload missing files"}
                </span>
              </div>

              {result.requiredDocuments.length === 0 ? (
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "4px 0" }}>
                  No documents mandated for this claim type under current config.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                  {result.requiredDocuments.map((doc) => (
                    <label 
                      key={doc} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px", 
                        fontSize: "0.8rem", 
                        cursor: "pointer",
                        color: checkedDocs[doc] ? "var(--text-primary)" : "rgba(255,255,255,0.6)"
                      }}
                    >
                      <input 
                        type="checkbox" 
                        id={`checkbox-sim-doc-${doc}`}
                        checked={checkedDocs[doc] || false} 
                        onChange={() => toggleDocCheck(doc)} 
                        style={{ cursor: "pointer" }}
                      />
                      <span style={{ textDecoration: checkedDocs[doc] ? "line-through" : "none" }}>{doc}</span>
                      <span style={{ fontSize: "0.65rem", padding: "1px 4px", borderRadius: "3px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" }}>Required</span>
                    </label>
                  ))}

                  {result.optionalDocuments.map((doc) => (
                    <div key={doc} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      <CheckSquare size={14} style={{ opacity: 0.3 }} />
                      <span>{doc}</span>
                      <span style={{ fontSize: "0.65rem", padding: "1px 4px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}>Optional</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notification logs dispatch output */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "10px", padding: "14px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                Dispatched Communication Logs (Simulated):
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto", marginTop: "8px" }}>
                {result.notifications.map((notif, nIdx) => {
                  const evLabel = notif.event.split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
                  return (
                    <div key={nIdx} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "6px", padding: "10px", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700" }}>{evLabel}</span>
                        <div style={{ display: "flex", gap: "4px" }}>
                          {notif.channels.map(chan => (
                            <span key={chan} style={{ fontSize: "0.6rem", background: "var(--primary-glow)", color: "var(--primary)", padding: "1px 4px", borderRadius: "3px", fontWeight: "600" }}>
                              {chan.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap", borderLeft: "2px solid var(--border-glass)", paddingLeft: "8px", marginTop: "4px" }}>
                        {notif.renderedTemplate}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
