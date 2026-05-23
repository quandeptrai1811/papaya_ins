import React from "react";
import { TenantConfig } from "../data/mockTenants";
import { compareConfigs } from "../utils/diff";
import { RotateCcw, Clock, CheckCircle2, ChevronDown } from "lucide-react";

interface TenantHistoryProps {
  currentConfig: TenantConfig;
  historyList: TenantConfig[]; // All versions of this tenant, sorted newest to oldest
  onRollback: (config: TenantConfig) => void;
}

export default function TenantHistory({ currentConfig, historyList, onRollback }: TenantHistoryProps) {
  
  // Format neat timestamps
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return isoString;
    }
  };

  // Helper to generate delta change summaries between a version and its predecessor
  const generateChangeSummary = (vCurrent: TenantConfig, vPrevious: TenantConfig | undefined) => {
    if (!vPrevious) {
      return ["Initial configuration onboarded."];
    }

    const diffs = compareConfigs(vPrevious, vCurrent);
    const changes = diffs.filter(d => d.isDifferent && d.label !== "Config Version");
    
    if (changes.length === 0) {
      return ["No operational configuration changes detected."];
    }

    return changes.map(c => {
      // Shorten long strings
      const trimText = (txt: string) => txt.length > 50 ? `${txt.slice(0, 47)}...` : txt;
      return `${c.label}: changed from "${trimText(c.valA)}" to "${trimText(c.valB)}"`;
    });
  };

  return (
    <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem" }}>
          Configuration Version Control
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
          Track and revert configuration states for <strong style={{ color: "var(--primary)" }}>{currentConfig.branding.companyName}</strong>
        </p>
      </div>

      {/* Timeline wrapper */}
      <div style={{ display: "flex", flexDirection: "column", position: "relative", paddingLeft: "20px", marginTop: "10px" }}>
        
        {/* Continuous vertical bar line */}
        <div 
          style={{
            position: "absolute",
            top: "10px",
            bottom: "10px",
            left: "4px",
            width: "2px",
            background: "linear-gradient(180deg, var(--primary) 0%, rgba(255,255,255,0.05) 100%)",
            zIndex: 1
          }}
        />

        {historyList.map((config, idx) => {
          const isActive = config.version === currentConfig.version;
          
          // Predecessor is the next element in the list because list is sorted newest to oldest
          const predecessor = historyList[idx + 1];
          const changeList = generateChangeSummary(config, predecessor);

          return (
            <div 
              key={config.version}
              className="timeline-item"
              style={{
                position: "relative",
                marginBottom: idx === historyList.length - 1 ? "0" : "28px"
              }}
            >
              {/* Node Bullet point */}
              <div 
                style={{
                  position: "absolute",
                  left: "-23px",
                  top: "3px",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: isActive ? "var(--primary)" : "rgba(255,255,255,0.2)",
                  boxShadow: isActive ? "0 0 10px var(--primary)" : "none",
                  border: isActive ? "2px solid #ffffff" : "2px solid rgba(9, 13, 22, 1)",
                  zIndex: 2
                }}
              />

              {/* Version Card content */}
              <div 
                className="glass-panel" 
                style={{
                  padding: "16px",
                  background: isActive ? "rgba(59, 130, 246, 0.04)" : "rgba(255, 255, 255, 0.01)",
                  border: `1px solid ${isActive ? "rgba(59, 130, 246, 0.2)" : "var(--border-glass)"}`
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <span 
                      style={{ 
                        fontWeight: "700", 
                        fontSize: "1.05rem",
                        color: isActive ? "var(--primary)" : "var(--text-primary)"
                      }}
                    >
                      Version {config.version}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "10px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> {formatTime(config.updatedAt)}
                    </span>
                  </div>

                  {isActive ? (
                    <span 
                      style={{ 
                        fontSize: "0.75rem", 
                        background: "rgba(16, 185, 129, 0.15)", 
                        color: "var(--success)", 
                        padding: "3px 8px", 
                        borderRadius: "20px", 
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <CheckCircle2 size={12} /> Current Active Version
                    </span>
                  ) : (
                    <button 
                      type="button" 
                      id={`btn-rollback-v${config.version}`}
                      onClick={() => onRollback(config)}
                      style={{ 
                        fontSize: "0.75rem", 
                        background: "rgba(255, 255, 255, 0.05)", 
                        border: "1px solid var(--border-glass)", 
                        color: "var(--text-primary)", 
                        padding: "4px 10px", 
                        borderRadius: "6px", 
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px" 
                      }}
                      className="rollback-btn"
                    >
                      <RotateCcw size={12} /> Rollback to v{config.version}
                    </button>
                  )}
                </div>

                {/* List of changes in this version */}
                <div style={{ background: "rgba(0,0,0,0.15)", padding: "10px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.02)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginBottom: "4px" }}>
                    Operational Changes:
                  </div>
                  <ul style={{ fontSize: "0.8rem", color: "var(--text-secondary)", paddingLeft: "14px", display: "flex", flexDirection: "column", gap: "4px", listStyleType: "circle" }}>
                    {changeList.map((change, cIdx) => (
                      <li key={cIdx} style={{ whiteSpace: "pre-wrap" }}>{change}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
