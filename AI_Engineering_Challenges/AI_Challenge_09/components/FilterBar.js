'use client';
export default function FilterBar({ filters, onChange, claims }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });
  const claimTypes = ['', 'OUTPATIENT', 'INPATIENT', 'DENTAL', 'MATERNITY'];
  const insurers = ['', ...new Set(claims.map(c => c.insurer))];
  const countries = ['', ...new Set(claims.map(c => c.country))];
  const statuses = ['', 'APPROVED', 'REJECTED', 'PENDING', 'IN_REVIEW'];

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>From</label>
        <input type="date" value={filters.dateFrom} onChange={e => set('dateFrom', e.target.value)} />
      </div>
      <div className="filter-group">
        <label>To</label>
        <input type="date" value={filters.dateTo} onChange={e => set('dateTo', e.target.value)} />
      </div>
      <div className="filter-group">
        <label>Claim Type</label>
        <select value={filters.claimType} onChange={e => set('claimType', e.target.value)}>
          {claimTypes.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <label>Insurer</label>
        <select value={filters.insurer} onChange={e => set('insurer', e.target.value)}>
          {insurers.map(i => <option key={i} value={i}>{i || 'All Insurers'}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <label>Country</label>
        <select value={filters.country} onChange={e => set('country', e.target.value)}>
          {countries.map(c => <option key={c} value={c}>{c || 'All Countries'}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <label>Status</label>
        <select value={filters.status} onChange={e => set('status', e.target.value)}>
          {statuses.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>
      <button className="btn-reset" onClick={() => onChange({ dateFrom: '', dateTo: '', claimType: '', insurer: '', country: '', status: '' })}>
        ✕ Reset
      </button>
    </div>
  );
}
