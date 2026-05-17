'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function InsurerBar({ claims }) {
  const data = useMemo(() => {
    const insurers = [...new Set(claims.map(c => c.insurer))];
    return insurers.map(ins => {
      const sub = claims.filter(c => c.insurer === ins);
      const approved = sub.filter(c => c.status === 'APPROVED').length;
      const rejected = sub.filter(c => c.status === 'REJECTED').length;
      const rate = sub.length ? ((approved / sub.length) * 100).toFixed(1) : 0;
      return { insurer: ins, Approved: Number(rate), Rejected: Number((rejected / sub.length * 100).toFixed(1)) };
    });
  }, [claims]);

  return (
    <div className="chart-card">
      <h3 className="chart-title">Approval Rate by Insurer</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="insurer" tick={{ fontSize: 12, fill: '#7a7f9a' }} />
          <YAxis unit="%" tick={{ fontSize: 11, fill: '#7a7f9a' }} domain={[0, 100]} />
          <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1a1c2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Approved" fill="#4ade80" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Rejected" fill="#f87171" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
