'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BUCKETS = [
  { label: '1-3d', min: 1, max: 3 }, { label: '4-7d', min: 4, max: 7 },
  { label: '8-14d', min: 8, max: 14 }, { label: '15-21d', min: 15, max: 21 },
  { label: '22-30d', min: 22, max: 30 },
];

export default function ProcessingHist({ claims }) {
  const data = useMemo(() => {
    return BUCKETS.map(b => ({
      label: b.label,
      count: claims.filter(c => c.processing_days >= b.min && c.processing_days <= b.max).length,
    }));
  }, [claims]);

  return (
    <div className="chart-card">
      <h3 className="chart-title">Processing Time Distribution</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#7a7f9a' }} />
          <YAxis tick={{ fontSize: 11, fill: '#7a7f9a' }} />
          <Tooltip
            formatter={(v) => [v.toLocaleString(), 'Claims']}
            contentStyle={{ background: '#1a1c2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
          />
          <Bar dataKey="count" fill="#4ade80" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
