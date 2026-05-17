'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Claim {
  diagnosis_icd10: string;
  [key: string]: any;
}

interface DiagFreqBarProps {
  claims: Claim[];
  activeDiag: string | null;
  onSelect: (diag: string | null) => void;
}

export default function DiagFreqBar({ claims, activeDiag, onSelect }: DiagFreqBarProps) {
  const data = useMemo(() => {
    const map: Record<string, number> = {};
    claims.forEach(c => { map[c.diagnosis_icd10] = (map[c.diagnosis_icd10] || 0) + 1; });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a).slice(0, 10)
      .map(([name, count]) => ({ name: name.split('–')[0].trim(), full: name, count }));
  }, [claims]);

  return (
    <div className="chart-card">
      <h3 className="chart-title">Top 10 Diagnoses by Frequency</h3>
      {activeDiag && (
        <div className="drill-badge">
          Drilled: {activeDiag.split('–')[0].trim()} <button onClick={() => onSelect(null)}>✕</button>
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#7a7f9a' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#7a7f9a' }} width={90} />
          <Tooltip
            formatter={(v) => [v.toLocaleString(), 'Claims']}
            contentStyle={{ background: '#1a1c2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(d: any) => onSelect(activeDiag === d.full ? null : d.full)}>
            {data.map(entry => (
              <Cell key={entry.full} fill={activeDiag === entry.full ? '#f59e0b' : '#6c63ff'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
