"use client";

import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';

// Load our dummy data
import policy01 from '@/data/policy-01.json';
import policy02 from '@/data/policy-02.json';

const POLICIES = [policy01, policy02];

export default function Home() {
  const [selectedPolicy, setSelectedPolicy] = useState(POLICIES[0]);

  const handlePrint = () => {
    window.print();
  };

  const p = selectedPolicy;
  const currency = p.plan.currency;

  return (
    <div className="app-wrapper">
      {/* Sidebar - Hidden on print */}
      <aside className="sidebar">
        <h2>Select Policy</h2>
        <div className="policy-selector">
          {POLICIES.map((policy, idx) => (
            <button 
              key={idx}
              className={`policy-btn ${selectedPolicy.policy_number === policy.policy_number ? 'active' : ''}`}
              onClick={() => setSelectedPolicy(policy)}
            >
              {policy.policyholder.name}<br/>
              <span style={{fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)'}}>
                {policy.policy_number}
              </span>
            </button>
          ))}
        </div>

        <button className="print-btn" onClick={handlePrint}>
          Print to PDF (Cmd+P)
        </button>
      </aside>

      {/* Main Document Area */}
      <main className="document-area">
        <div className="document-page">
          
          {/* Header */}
          <header className="doc-header">
            <div>
              <h1 className="doc-title">Policy Summary</h1>
              <p className="doc-subtitle">{p.plan.name} — {p.plan.tier} Tier</p>
            </div>
            <div className="doc-meta">
              Policy No: <strong>{p.policy_number}</strong><br/>
              Valid: <strong>{formatDate(p.plan.effective_date)} to {formatDate(p.plan.expiry_date)}</strong>
            </div>
          </header>

          {/* Quick Reference */}
          <div className="quick-ref-grid">
            <div className="quick-card highlight">
              <div className="quick-label">Policyholder</div>
              <div className="quick-value">{p.policyholder.name}</div>
            </div>
            <div className="quick-card">
              <div className="quick-label">Total Members</div>
              <div className="quick-value primary">{formatNumber(p.members.total)}</div>
            </div>
            <div className="quick-card">
              <div className="quick-label">Network Type</div>
              <div className="quick-value">{p.network.type.replace('_', ' ')}</div>
            </div>
          </div>

          {/* Member Breakdown */}
          <section className="section">
            <h2 className="section-title">Covered Members</h2>
            <div className="member-grid">
              <div className="member-card">
                <div className="member-num">{formatNumber(p.members.employee)}</div>
                <div className="member-lbl">Employees</div>
              </div>
              <div className="member-card">
                <div className="member-num">{formatNumber(p.members.dependent_spouse)}</div>
                <div className="member-lbl">Spouses</div>
              </div>
              <div className="member-card">
                <div className="member-num">{formatNumber(p.members.dependent_child)}</div>
                <div className="member-lbl">Children</div>
              </div>
              <div className="member-card" style={{background: 'var(--primary-light)', borderColor: '#bfdbfe'}}>
                <div className="member-num">{formatNumber(p.members.total)}</div>
                <div className="member-lbl">Total</div>
              </div>
            </div>
          </section>

          {/* Benefits Table */}
          <section className="section">
            <h2 className="section-title">Schedule of Benefits</h2>
            <table>
              <thead>
                <tr>
                  <th style={{width: '60%'}}>Benefit Description</th>
                  <th style={{width: '40%', textAlign: 'right'}}>Limit Amount</th>
                </tr>
              </thead>
              <tbody>
                {p.benefits.map((benefit, bIdx) => (
                  <React.Fragment key={bIdx}>
                    {/* Main Benefit Row */}
                    <tr>
                      <td className="benefit-type">
                        {benefit.type}
                        {benefit.waiting_period_days && (
                          <span className="badge badge-waiting">
                            {benefit.waiting_period_days} Day Waiting Period
                          </span>
                        )}
                      </td>
                      <td className="amount benefit-type">
                        {benefit.annual_limit ? `${formatCurrency(benefit.annual_limit, currency)} / Year` : 
                         benefit.lifetime_limit ? `${formatCurrency(benefit.lifetime_limit, currency)} / Lifetime` : ''}
                      </td>
                    </tr>
                    
                    {/* Sub-benefits */}
                    {benefit.sub_benefits && benefit.sub_benefits.map((sub, sIdx) => (
                      <tr key={`${bIdx}-${sIdx}`}>
                        <td className="benefit-sub">
                          • {sub.name}
                          {sub.max_days && ` (Max ${sub.max_days} days)`}
                          {sub.visits_per_year && ` (Max ${sub.visits_per_year} visits/yr)`}
                        </td>
                        <td className="amount">
                          {sub.limit_per_day ? `${formatCurrency(sub.limit_per_day, currency)} / Day` :
                           sub.limit_per_visit ? `${formatCurrency(sub.limit_per_visit, currency)} / Visit` :
                           sub.limit_per_event ? `${formatCurrency(sub.limit_per_event, currency)} / Event` :
                           sub.limit_per_pregnancy ? `${formatCurrency(sub.limit_per_pregnancy, currency)} / Pregnancy` :
                           sub.limit_per_year ? `${formatCurrency(sub.limit_per_year, currency)} / Year` : ''}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </section>

          {/* Copay & Network */}
          <div className="copay-network-flex">
            <section className="section flex-1">
              <h2 className="section-title">Copayment</h2>
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th style={{textAlign: 'right'}}>Copay %</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(p.copay).map(([key, val]: [string, any]) => (
                    <tr key={key}>
                      <td style={{textTransform: 'capitalize'}}>{key}</td>
                      <td className="amount">
                        {val.percentage}%
                        {val.max_per_visit ? ` (Max ${formatCurrency(val.max_per_visit, currency)})` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            
            <section className="section flex-1">
              <h2 className="section-title">Network</h2>
              <div className="quick-card">
                <p style={{marginBottom: '8px'}}><strong>Hospitals:</strong> {formatNumber(p.network.hospital_count)}</p>
                <p><strong>Countries:</strong> {p.network.countries.join(", ")}</p>
              </div>
            </section>
          </div>

          {/* Exclusions */}
          <section className="section">
            <div className="danger-box">
              <div className="danger-title">⚠ Policy Exclusions</div>
              <ul className="exclusion-list">
                {p.exclusions.map((exclusion, idx) => (
                  <li key={idx}>{exclusion}</li>
                ))}
              </ul>
            </div>
          </section>

        </div>
      </main>

    </div>
  );
}
