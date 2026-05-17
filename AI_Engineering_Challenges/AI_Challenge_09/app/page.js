'use client';
import { useState, useMemo } from 'react';
import claimsData from '@/public/claims.json';
import { filterData } from '@/lib/filterData';
import { computeKpis } from '@/lib/computeKpis';
import FilterBar from '@/components/FilterBar';
import KpiCards from '@/components/KpiCards';
import StatusDonut from '@/components/StatusDonut';
import ClaimsOverTime from '@/components/ClaimsOverTime';
import DiagFreqBar from '@/components/DiagFreqBar';
import DiagCostBar from '@/components/DiagCostBar';
import ProcessingHist from '@/components/ProcessingHist';
import InsurerBar from '@/components/InsurerBar';
import ClaimsTable from '@/components/ClaimsTable';

const INITIAL_FILTERS = { dateFrom: '', dateTo: '', claimType: '', insurer: '', country: '', status: '' };

export default function Dashboard() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [activeDiag, setActiveDiag] = useState(null);

  const filtered = useMemo(() => filterData(claimsData, filters), [filters]);
  const kpis = useMemo(() => computeKpis(filtered), [filtered]);

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-logo">PAPAYA INSURANCE</div>
        <h1>Claims Analytics Dashboard</h1>
        <p>{filtered.length.toLocaleString()} claims · 2024</p>
      </header>

      <FilterBar filters={filters} onChange={setFilters} claims={claimsData} />
      <KpiCards kpis={kpis} />

      <div className="charts-grid">
        <StatusDonut claims={filtered} />
        <ClaimsOverTime claims={filtered} />
        <DiagFreqBar claims={filtered} activeDiag={activeDiag} onSelect={setActiveDiag} />
        <DiagCostBar claims={filtered} activeDiag={activeDiag} onSelect={setActiveDiag} />
        <ProcessingHist claims={filtered} />
        <InsurerBar claims={filtered} />
      </div>

      <ClaimsTable claims={filtered} activeDiag={activeDiag} onClearDiag={() => setActiveDiag(null)} />
    </div>
  );
}
