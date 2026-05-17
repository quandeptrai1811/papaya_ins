'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function fmtM(v) { return v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v; }

export default function DiagCostBar({ claims, activeDiag, onSelect }) {
  const data = useMemo(() => {
    const map = {};
    claims.forEach(c => { map[c.diagnosis_icd10] = (map[c.diagnosis_icd10] || 0) + c.approved_amount; });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a).slice(0, 10)
      .map(([name, total]) => ({ name: name.split('–')[0].trim(), full: name, total: Math.round(total) }));
  }, [claims]);

  return (
    <div className="chart-card">
      <h3 className="chart-title">Top 10 Diagnoses by Total Cost</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis type="number" tickFormatter={fmtM} tick={{ fontSize: 11, fill: '#7a7f9a' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#7a7f9a' }} width={90} />
          <Tooltip
            formatter={(v) => [`฿${v.toLocaleString()}`, 'Total Cost']}
            contentStyle={{ background: '#1a1c2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(d) => onSelect(activeDiag === d.full ? null : d.full)}>
            {data.map(entry => (
              <Cell key={entry.full} fill={activeDiag === entry.full ? '#f59e0b' : '#38bdf8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
