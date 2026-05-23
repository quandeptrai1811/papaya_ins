import React, { useState } from "react";
import { TenantConfig } from "../data/mockTenants";
import { compareConfigs, DiffItem } from "../utils/diff";
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react";

interface TenantDiffProps {
  tenantA: TenantConfig;
  tenantB: TenantConfig;
}

export default function TenantDiff({ tenantA, tenantB }: TenantDiffProps) {
  const [diffsOnly, setDiffsOnly] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const diffItems = compareConfigs(tenantA, tenantB);
  
  // Filter logic
  const filteredItems = diffItems.filter(item => {
    if (diffsOnly && !item.isDifferent) return false;
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    return true;
  });

  const categories = [
    { id: "all", label: "All Properties" },
    { id: "general", label: "General" },
    { id: "branding", label: "Branding" },
    { id: "claimTypes", label: "Claim Types" },
    { id: "approvalRules", label: "Approval Rules" },
    { id: "notifications", label: "Notifications" },
    { id: "customFields", label: "Custom Fields" }
  ];

  return (
    <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "14px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem" }}>
            Configuration Matrix Diff
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Comparing <strong style={{ color: "var(--primary)" }}>{tenantA.branding.companyName}</strong> (v{tenantA.version}) 
            with <strong style={{ color: "var(--accent)" }}>{tenantB.branding.companyName}</strong> (v{tenantB.version})
          </p>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button 
            type="button"
            id="btn-toggle-diffs-only"
            onClick={() => setDiffsOnly(!diffsOnly)}
            className="glass-panel"
            style={{ 
              padding: "6px 12px", 
              background: diffsOnly ? "rgba(59, 130, 246, 0.15)" : "rgba(255,255,255,0.03)", 
              borderColor: diffsOnly ? "var(--primary)" : "var(--border-glass)",
              borderRadius: "8px", 
              color: diffsOnly ? "var(--primary)" : "var(--text-primary)", 
              fontSize: "0.8rem", 
              display: "flex", 
              alignItems: "center", 
              gap: "6px" 
            }}
          >
            {diffsOnly ? <EyeOff size={14} /> : <Eye size={14} />}
            {diffsOnly ? "Showing Differences Only" : "Show All Rules"}
          </button>
        </div>
      </div>

      {/* Category selector chips */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {categories.map(cat => {
          const isActive = filterCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`btn-diff-cat-${cat.id}`}
              type="button"
              onClick={() => setFilterCategory(cat.id)}
              className="glass-panel"
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: isActive ? "600" : "500",
                color: isActive ? "#ffffff" : "var(--text-secondary)",
                background: isActive ? "var(--primary)" : "rgba(255,255,255,0.02)",
                borderColor: isActive ? "var(--primary)" : "var(--border-glass)"
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Comparison Grid Table */}
      <div 
        style={{ 
          maxHeight: "500px", 
          overflowY: "auto", 
          border: "1px solid var(--border-glass)", 
          borderRadius: "12px", 
          background: "rgba(0, 0, 0, 0.15)" 
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border-glass)" }}>
              <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "700", width: "25%" }}>Parameter</th>
              <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "700", width: "32%" }}>{tenantA.branding.companyName}</th>
              <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "700", width: "32%" }}>{tenantB.branding.companyName}</th>
              <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: "700", width: "11%", textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                  No differences found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => (
                <tr 
                  key={idx}
                  style={{ 
                    borderBottom: "1px solid var(--border-glass)", 
                    background: item.isDifferent ? "rgba(239, 68, 68, 0.04)" : "transparent",
                    transition: "var(--transition-smooth)"
                  }}
                  className="diff-row"
                >
                  <td style={{ padding: "14px 16px", fontWeight: "600", color: "var(--text-primary)" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>
                      {item.path.split(" > ")[0]}
                    </div>
                    {item.label}
                  </td>
                  
                  {/* Tenant A Value Cell */}
                  <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.85)", whiteSpace: "pre-wrap" }}>
                    {item.label.toLowerCase().includes("color") && item.valA.startsWith("#") ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: item.valA }} />
                        <code style={{ fontFamily: "monospace" }}>{item.valA}</code>
                      </div>
                    ) : (
                      item.valA
                    )}
                  </td>

                  {/* Tenant B Value Cell */}
                  <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.85)", whiteSpace: "pre-wrap" }}>
                    {item.label.toLowerCase().includes("color") && item.valB.startsWith("#") ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: item.valB }} />
                        <code style={{ fontFamily: "monospace" }}>{item.valB}</code>
                      </div>
                    ) : (
                      item.valB
                    )}
                  </td>

                  {/* Status Cell */}
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    {item.isDifferent ? (
                      <span 
                        style={{ 
                          fontSize: "0.75rem", 
                          padding: "2px 6px", 
                          borderRadius: "4px", 
                          background: "rgba(239, 68, 68, 0.15)", 
                          color: "var(--danger)",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <AlertCircle size={10} /> Differs
                      </span>
                    ) : (
                      <span 
                        style={{ 
                          fontSize: "0.75rem", 
                          padding: "2px 6px", 
                          borderRadius: "4px", 
                          background: "rgba(16, 185, 129, 0.15)", 
                          color: "var(--success)",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <Check size={10} /> Matches
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
