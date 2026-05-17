'use client';
import { useState, useMemo } from 'react';

const COLS = [
  { key: 'claim_id', label: 'Claim ID' },
  { key: 'member_name', label: 'Member' },
  { key: 'claim_type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'submitted_date', label: 'Submitted' },
  { key: 'submitted_amount', label: 'Submitted (฿)' },
  { key: 'approved_amount', label: 'Approved (฿)' },
  { key: 'insurer', label: 'Insurer' },
  { key: 'country', label: 'Country' },
  { key: 'processing_days', label: 'Days' },
];

const STATUS_COLOR = { APPROVED: '#4ade80', REJECTED: '#f87171', PENDING: '#facc15', IN_REVIEW: '#6c63ff' };
const PAGE_SIZE = 25;

export default function ClaimsTable({ claims, activeDiag, onClearDiag }) {
  const [sortKey, setSortKey] = useState('submitted_date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return activeDiag ? claims.filter(c => c.diagnosis_icd10 === activeDiag) : claims;
  }, [claims, activeDiag]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const rows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const exportCsv = () => {
    const header = COLS.map(c => c.label).join(',');
    const rows = filtered.map(c => COLS.map(col => JSON.stringify(c[col.key] ?? '')).join(','));
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'claims_export.csv'; a.click();
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <h3 className="chart-title" style={{ marginBottom: 4 }}>
            {activeDiag ? `Drill-down: ${activeDiag.split('–')[0].trim()}` : 'All Claims'}
          </h3>
          <p className="table-count">{filtered.length.toLocaleString()} claims</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeDiag && <button className="btn-clear" onClick={onClearDiag}>✕ Clear Filter</button>}
          <button className="btn-export" onClick={exportCsv}>⬇ Export CSV</button>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {COLS.map(c => (
                <th key={c.key} onClick={() => handleSort(c.key)}>
                  {c.label} {sortKey === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.claim_id}>
                <td className="mono">{r.claim_id}</td>
                <td>{r.member_name}</td>
                <td><span className="type-badge">{r.claim_type}</span></td>
                <td><span className="status-dot" style={{ color: STATUS_COLOR[r.status] }}>● {r.status}</span></td>
                <td>{r.submitted_date}</td>
                <td className="num">฿{r.submitted_amount.toLocaleString()}</td>
                <td className="num">฿{r.approved_amount.toLocaleString()}</td>
                <td>{r.insurer}</td>
                <td>{r.country}</td>
                <td className="num">{r.processing_days ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(1)}>««</button>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
        <button disabled={page === totalPages} onClick={() => setPage(totalPages)}>»»</button>
      </div>
    </div>
  );
}
