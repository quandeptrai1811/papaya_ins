'use client';

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Number(n).toLocaleString();
}

export default function KpiCards({ kpis }) {
  const cards = [
    { label: 'Total Claims', value: kpis.total.toLocaleString(), icon: '📋' },
    { label: 'Approval Rate', value: `${kpis.approvalRate}%`, icon: '✅' },
    { label: 'Avg Processing Time', value: `${kpis.avgProcessing} days`, icon: '⏱️' },
    { label: 'Total Approved', value: `฿${fmt(kpis.totalApproved)}`, icon: '💰' },
    { label: 'Avg Claim Amount', value: `฿${fmt(kpis.avgClaim)}`, icon: '📊' },
  ];
  return (
    <div className="kpi-grid">
      {cards.map(c => (
        <div key={c.label} className="kpi-card">
          <div className="kpi-icon">{c.icon}</div>
          <div className="kpi-value">{c.value}</div>
          <div className="kpi-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
