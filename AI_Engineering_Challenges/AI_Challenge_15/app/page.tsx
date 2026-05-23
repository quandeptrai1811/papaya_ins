"use client";

import React, { useState, useEffect } from "react";
import { TenantConfig, INITIAL_TENANTS } from "../data/mockTenants";
import BrandPreview from "../components/BrandPreview";
import TenantForm from "../components/TenantForm";
import TenantDiff from "../components/TenantDiff";
import TenantHistory from "../components/TenantHistory";
import ClaimSimulator from "../components/ClaimSimulator";
import { 
  Building2, 
  Layers, 
  Play, 
  GitCompare, 
  History, 
  Plus, 
  Edit3, 
  TrendingUp,
  Sliders,
  CheckCircle,
  FileCheck,
  Trash2
} from "lucide-react";

export default function Home() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [tenants, setTenants] = useState<TenantConfig[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [historyMap, setHistoryMap] = useState<Record<string, TenantConfig[]>>({});
  
  // Tab states
  const [activeTab, setActiveTab] = useState<"overview" | "sandbox" | "diff" | "history">("overview");
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Diff states
  const [diffIdA, setDiffIdA] = useState("");
  const [diffIdB, setDiffIdB] = useState("");

  // Sync state with localStorage after client hydration
  useEffect(() => {
    // 1. Load tenants
    const storedTenants = localStorage.getItem("papaya_tenants");
    let loadedTenants: TenantConfig[] = [];
    if (storedTenants) {
      try {
        loadedTenants = JSON.parse(storedTenants);
      } catch {
        loadedTenants = INITIAL_TENANTS;
      }
    } else {
      loadedTenants = INITIAL_TENANTS;
      localStorage.setItem("papaya_tenants", JSON.stringify(INITIAL_TENANTS));
    }
    setTenants(loadedTenants);

    // Set first tenant as selected by default
    if (loadedTenants.length > 0) {
      setSelectedTenantId(loadedTenants[0].id);
    }

    // 2. Load History Map
    const storedHistory = localStorage.getItem("papaya_history");
    let loadedHistory: Record<string, TenantConfig[]> = {};
    if (storedHistory) {
      try {
        loadedHistory = JSON.parse(storedHistory);
      } catch {
        // Fallback seed
        loadedTenants.forEach(t => {
          loadedHistory[t.id] = [t];
        });
      }
    } else {
      loadedTenants.forEach(t => {
        loadedHistory[t.id] = [t];
      });
      localStorage.setItem("papaya_history", JSON.stringify(loadedHistory));
    }
    setHistoryMap(loadedHistory);

    // Seed default diff choices
    if (loadedTenants.length > 1) {
      setDiffIdA(loadedTenants[0].id);
      setDiffIdB(loadedTenants[1].id);
    }

    setHasHydrated(true);
  }, []);

  const activeTenant = tenants.find(t => t.id === selectedTenantId) || null;

  // Save edits or on-boardings
  const handleSaveTenant = (config: TenantConfig) => {
    let updatedTenants: TenantConfig[] = [];
    const isNew = !tenants.some(t => t.id === config.id);

    if (isNew) {
      // Add new tenant
      updatedTenants = [...tenants, config];
    } else {
      // Update existing
      updatedTenants = tenants.map(t => t.id === config.id ? config : t);
    }

    // Update History Map
    const currHistory = historyMap[config.id] || [];
    // Prepend new version at the beginning (index 0)
    const updatedHistory = [config, ...currHistory];

    const newHistoryMap = {
      ...historyMap,
      [config.id]: updatedHistory
    };

    // Save states
    setTenants(updatedTenants);
    setHistoryMap(newHistoryMap);
    localStorage.setItem("papaya_tenants", JSON.stringify(updatedTenants));
    localStorage.setItem("papaya_history", JSON.stringify(newHistoryMap));

    // Reset panel toggles
    setIsEditing(false);
    setIsAddingNew(false);
    setSelectedTenantId(config.id);
  };

  // Rollback state triggers
  const handleRollback = (oldConfig: TenantConfig) => {
    const rolledConfig: TenantConfig = {
      ...oldConfig,
      version: activeTenant ? activeTenant.version + 1 : oldConfig.version + 1,
      updatedAt: new Date().toISOString()
    };

    const updatedTenants = tenants.map(t => t.id === rolledConfig.id ? rolledConfig : t);
    
    // Add rolled state to history chain
    const currHistory = historyMap[rolledConfig.id] || [];
    const updatedHistory = [rolledConfig, ...currHistory];

    const newHistoryMap = {
      ...historyMap,
      [rolledConfig.id]: updatedHistory
    };

    setTenants(updatedTenants);
    setHistoryMap(newHistoryMap);
    localStorage.setItem("papaya_tenants", JSON.stringify(updatedTenants));
    localStorage.setItem("papaya_history", JSON.stringify(newHistoryMap));
  };

  // Delete tenant configuration
  const handleDeleteTenant = (tenantId: string) => {
    if (tenants.length <= 1) {
      alert("Cannot delete the last remaining insurer configuration.");
      return;
    }

    if (!window.confirm("Are you sure you want to permanently delete this insurer configuration and all its history?")) {
      return;
    }

    const updatedTenants = tenants.filter(t => t.id !== tenantId);
    
    // Clean history
    const newHistoryMap = { ...historyMap };
    delete newHistoryMap[tenantId];

    // Reset diff selections if they point to deleted tenant
    if (diffIdA === tenantId) {
      setDiffIdA(updatedTenants[0]?.id || "");
    }
    if (diffIdB === tenantId) {
      setDiffIdB(updatedTenants[1]?.id || updatedTenants[0]?.id || "");
    }

    // Save states
    setTenants(updatedTenants);
    setHistoryMap(newHistoryMap);
    localStorage.setItem("papaya_tenants", JSON.stringify(updatedTenants));
    localStorage.setItem("papaya_history", JSON.stringify(newHistoryMap));

    // If active tenant was the deleted one, set selected tenant to another one
    if (selectedTenantId === tenantId) {
      setSelectedTenantId(updatedTenants[0].id);
    }
  };

  // Helper stats
  const totalInsurers = tenants.length;
  const totalEnabledClaimTypes = activeTenant
    ? Object.values(activeTenant.claimTypes).filter(c => c.enabled).length
    : 0;

  // Hydration guard to avoid SSR misses
  if (!hasHydrated) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", color: "var(--text-secondary)", fontSize: "1rem" }}>
        Loading Core Config Platform...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      {/* 1. Global Navigation Header */}
      <header 
        className="glass-panel" 
        style={{ 
          margin: "16px 24px", 
          padding: "14px 24px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          borderRadius: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Logo SVG */}
          <div style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)" }}>
            <Sliders size={20} style={{ color: "#ffffff" }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: "800", background: "linear-gradient(90deg, #f3f4f6, #9ca3af)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Papaya Core-Config Studio
            </h1>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
              MULTI-TENANT CLAIM PROCESSING WORKBENCH
            </p>
          </div>
        </div>

        {/* Global Action */}
        <button 
          id="btn-onboard-new"
          onClick={() => {
            setIsAddingNew(true);
            setIsEditing(false);
          }}
          style={{ 
            background: "linear-gradient(135deg, #3b82f6, #2563eb)", 
            color: "#ffffff", 
            border: "none", 
            padding: "8px 16px", 
            borderRadius: "8px", 
            fontWeight: "700", 
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)"
          }}
        >
          <Plus size={16} /> Onboard New Insurer
        </button>
      </header>

      {/* 2. Main Dashboard workspace */}
      {isAddingNew || isEditing ? (
        
        // EDITOR MODE (CRUD CREATE / UPDATE)
        <div style={{ margin: "0 24px 24px 24px" }} className="animate-fade-in">
          <TenantForm 
            initialConfig={isEditing ? activeTenant : null}
            onSave={handleSaveTenant}
            onCancel={() => {
              setIsAddingNew(false);
              setIsEditing(false);
            }}
            existingNames={tenants.map(t => t.branding.companyName.toLowerCase())}
          />
        </div>
      ) : (

        // VISUALIZER / WORKBENCH VIEW
        <div 
          style={{ 
            margin: "0 24px 24px 24px", 
            flex: 1, 
            display: "grid", 
            gridTemplateColumns: "280px 1fr", 
            gap: "20px",
            alignItems: "start"
          }}
          className="animate-fade-in"
        >
          
          {/* LEFT COLUMN: ACTIVE TENANT SELECTOR LIST */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="glass-panel" style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Active Insurers ({totalInsurers})
                </span>
                <span style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "20px", background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                  Zero-Code Portal
                </span>
              </div>

              {/* Insurers list grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {tenants.map((tenant) => {
                  const isSelected = tenant.id === selectedTenantId;
                  const activeTypes = Object.values(tenant.claimTypes).filter(c => c.enabled).length;

                  return (
                    <div 
                      key={tenant.id}
                      id={`tenant-card-${tenant.id}`}
                      onClick={() => {
                        setSelectedTenantId(tenant.id);
                        setIsEditing(false);
                        setIsAddingNew(false);
                      }}
                      className="glass-panel"
                      style={{
                        padding: "14px",
                        cursor: "pointer",
                        background: isSelected ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
                        borderColor: isSelected ? tenant.branding.primaryColor : "var(--border-glass)",
                        borderLeftWidth: "4px",
                        borderLeftColor: tenant.branding.primaryColor,
                        transform: isSelected ? "scale(1.01)" : "scale(1)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        {tenant.branding.logoUrl ? (
                          <img 
                            src={tenant.branding.logoUrl} 
                            alt={`${tenant.branding.companyName} logo`}
                            style={{ width: "24px", height: "24px", borderRadius: "4px", objectFit: "cover" }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: tenant.branding.primaryColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.7rem", fontWeight: "700" }}>
                            {tenant.branding.companyName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                          {tenant.branding.companyName}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        <span>Claim Types: <strong>{activeTypes}</strong></span>
                        <span style={{ background: "rgba(255,255,255,0.04)", padding: "1px 6px", borderRadius: "4px" }}>
                          v{tenant.version}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Active metrics Card */}
            {activeTenant && (
              <div 
                className="glass-panel" 
                style={{ 
                  padding: "16px", 
                  background: `linear-gradient(135deg, ${activeTenant.branding.primaryColor}12, ${activeTenant.branding.secondaryColor}12)` 
                }}
              >
                <h4 style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "12px" }}>
                  Selected Insurer Summary
                </h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Threshold:</span>
                    <strong style={{ color: "var(--success)" }}>
                      ${activeTenant.approvalRules.autoApprovalThreshold.toLocaleString()}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Enabled Types:</span>
                    <strong>{totalEnabledClaimTypes} classes</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Custom Fields:</span>
                    <strong>{activeTenant.customFields.length} custom</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button 
                    id="btn-edit-active"
                    onClick={() => setIsEditing(true)}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      color: "var(--text-primary)",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px"
                    }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>

                  <button 
                    id="btn-delete-active"
                    onClick={() => handleDeleteTenant(activeTenant.id)}
                    style={{
                      flex: 1,
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      color: "var(--danger)",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px"
                    }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* RIGHT COLUMN: INTERACTIVE WORKING TABS */}
          <main style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* View tabs bar */}
            <div className="glass-panel" style={{ padding: "8px", display: "flex", gap: "6px" }}>
              {[
                { id: "overview", label: "Branding & Operations", icon: Layers },
                { id: "sandbox", label: "Claim Sandbox Playground", icon: Play },
                { id: "diff", label: "Config Matrix Diff", icon: GitCompare },
                { id: "history", label: "Version Control Logs", icon: History }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-main-${tab.id}`}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className="glass-panel"
                    style={{
                      background: isActive ? "var(--primary)" : "transparent",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      color: isActive ? "#ffffff" : "var(--text-secondary)",
                      fontSize: "0.85rem",
                      fontWeight: isActive ? "700" : "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: isActive ? "0 4px 12px var(--primary-glow)" : "none"
                    }}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS RENDER */}
            <div style={{ minHeight: "450px" }}>
              
              {/* TAB A: OVERVIEW */}
              {activeTab === "overview" && activeTenant && (
                <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px", alignItems: "start" }}>
                  <BrandPreview config={activeTenant} />
                  
                  {/* Operations Rules Summary grid */}
                  <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "10px" }}>
                      Active Insurer Policy Engine Summary
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {/* SLA Limits */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Claims SLAs & Rules</span>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                          {Object.entries(activeTenant.claimTypes)
                            .filter(([_, conf]) => conf.enabled)
                            .map(([key, value]) => (
                              <div key={key} style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-glass)", borderRadius: "6px", padding: "6px 10px" }}>
                                <strong>{key}</strong>: {value.slaDays} business days
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Approval rules */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Approval Decision Limits</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                          <div style={{ fontSize: "0.8rem", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "6px", padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                            <span>Automatic Payout Threshold:</span>
                            <strong style={{ color: "var(--success)" }}>Under ${activeTenant.approvalRules.autoApprovalThreshold.toLocaleString()}</strong>
                          </div>
                          
                          {activeTenant.approvalRules.tiers.map((tier, idx) => (
                            <div key={idx} style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "6px", padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                              <span>Manual routing: {tier.role}</span>
                              <strong>
                                {tier.maxAmount === null 
                                  ? `Above $${tier.minAmount.toLocaleString()}`
                                  : `$${tier.minAmount.toLocaleString()} to $${tier.maxAmount.toLocaleString()}`}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Custom fields active */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Data Fields Checklist</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                          {activeTenant.customFields.length === 0 ? (
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No custom fields required for claim submission.</span>
                          ) : (
                            activeTenant.customFields.map(f => (
                              <div key={f.id} style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "6px", padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                                <span>{f.label} <code>({f.id})</code></span>
                                <strong>{f.required ? "Required" : "Optional"} ({f.type})</strong>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB B: CLAIM SIMULATOR */}
              {activeTab === "sandbox" && activeTenant && (
                <div className="animate-fade-in">
                  <ClaimSimulator activeTenant={activeTenant} />
                </div>
              )}

              {/* TAB C: CONFIG DIFF COMPARATOR */}
              {activeTab === "diff" && (
                <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  {/* Selectors card */}
                  <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Compare:</span>
                      <select 
                        id="select-diff-tenant-a"
                        value={diffIdA} 
                        onChange={(e) => setDiffIdA(e.target.value)}
                        style={{ flex: 1 }}
                      >
                        {tenants.map(t => (
                          <option key={t.id} value={t.id}>{t.branding.companyName} (v{t.version})</option>
                        ))}
                      </select>
                    </div>

                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold" }}>VS</span>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>With:</span>
                      <select 
                        id="select-diff-tenant-b"
                        value={diffIdB} 
                        onChange={(e) => setDiffIdB(e.target.value)}
                        style={{ flex: 1 }}
                      >
                        {tenants.map(t => (
                          <option key={t.id} value={t.id}>{t.branding.companyName} (v{t.version})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Render Diff matrix */}
                  {tenants.find(t => t.id === diffIdA) && tenants.find(t => t.id === diffIdB) && (
                    <TenantDiff 
                      tenantA={tenants.find(t => t.id === diffIdA)!} 
                      tenantB={tenants.find(t => t.id === diffIdB)!} 
                    />
                  )}
                </div>
              )}

              {/* TAB D: VERSION CONTROL HISTORY */}
              {activeTab === "history" && activeTenant && (
                <div className="animate-fade-in">
                  <TenantHistory 
                    currentConfig={activeTenant}
                    historyList={historyMap[activeTenant.id] || [activeTenant]}
                    onRollback={handleRollback}
                  />
                </div>
              )}

            </div>
          </main>
        </div>
      )}

      {/* 3. Global Footer */}
      <footer style={{ marginTop: "auto", borderTop: "1px solid var(--border-glass)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        <span>Papaya core multi-tenant configuration database synchronized locally</span>
        <span>AI Challenge 15 • InsurTech Configuration Hub</span>
      </footer>

    </div>
  );
}
