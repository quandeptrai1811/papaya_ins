import React from "react";
import { TenantConfig } from "../data/mockTenants";

interface BrandPreviewProps {
  config: TenantConfig;
}

export default function BrandPreview({ config }: BrandPreviewProps) {
  const { branding, claimTypes } = config;

  // Render a mini preview card showing the brand identity
  return (
    <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--text-secondary)" }}>
        Insurer Brand Portal Mock
      </h3>
      
      {/* Mock Client Portal Frame */}
      <div 
        style={{
          background: "rgba(9, 13, 22, 0.9)",
          border: `1px solid ${branding.primaryColor || "var(--border-glass)"}`,
          borderRadius: "12px",
          padding: "16px",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Color stripe */}
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.secondaryColor})`
          }}
        />

        {/* Mock Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingTop: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {branding.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt={`${branding.companyName} logo`}
                style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: branding.primaryColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "0.8rem" }}>
                {branding.companyName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-primary)" }}>
              {branding.companyName}
            </span>
          </div>

          <span 
            style={{ 
              fontSize: "0.75rem", 
              padding: "3px 8px", 
              borderRadius: "20px", 
              background: `${branding.primaryColor}22`,
              color: branding.primaryColor,
              border: `1px solid ${branding.primaryColor}44`,
              fontWeight: "600"
            }}
          >
            Core Portal
          </span>
        </div>

        {/* Mock Portal Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
          <div style={{ height: "12px", width: "70%", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
          <div style={{ height: "8px", width: "40%", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
          
          <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
            {Object.entries(claimTypes)
              .filter(([_, value]) => value.enabled)
              .map(([key]) => (
                <span 
                  key={key} 
                  style={{ 
                    fontSize: "0.65rem", 
                    padding: "2px 6px", 
                    borderRadius: "4px", 
                    background: "rgba(255,255,255,0.06)", 
                    color: "var(--text-secondary)" 
                  }}
                >
                  {key}
                </span>
              ))}
          </div>
        </div>

        {/* Mock Submission Button using brand primary color */}
        <button 
          id="btn-brand-mock-submit"
          style={{
            width: "100%",
            marginTop: "12px",
            background: branding.primaryColor,
            border: "none",
            borderRadius: "6px",
            color: "#ffffff",
            padding: "8px",
            fontSize: "0.8rem",
            fontWeight: "600",
            boxShadow: `0 4px 12px ${branding.primaryColor}44`
          }}
          disabled
        >
          Submit Claims
        </button>
      </div>

      {/* Brand Swatches */}
      <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: branding.primaryColor, border: "1px solid var(--border-glass)" }} />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>Primary</div>
            <div style={{ fontSize: "0.8rem", fontWeight: "600", fontFamily: "monospace" }}>{branding.primaryColor}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: branding.secondaryColor, border: "1px solid var(--border-glass)" }} />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>Secondary</div>
            <div style={{ fontSize: "0.8rem", fontWeight: "600", fontFamily: "monospace" }}>{branding.secondaryColor}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
