'use client';
import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function weekKey(d) {
  const date = new Date(d);
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `W${String(week).padStart(2, '0')}`;
}
function monthKey(d) {
  return d.slice(0, 7);
}

export default function ClaimsOverTime({ claims }) {
  const [groupBy, setGroupBy] = useState('month');

  const data = useMemo(() => {
    const map = {};
    claims.forEach(c => {
      const key = groupBy === 'month' ? monthKey(c.submitted_date) : weekKey(c.submitted_date);
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([period, count]) => ({ period, count }));
  }, [claims, groupBy]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Claims Over Time</h3>
        <div className="toggle-group">
          <button className={groupBy === 'month' ? 'tog active' : 'tog'} onClick={() => setGroupBy('month')}>Month</button>
          <button className={groupBy === 'week' ? 'tog active' : 'tog'} onClick={() => setGroupBy('week')}>Week</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#7a7f9a' }} />
          <YAxis tick={{ fontSize: 11, fill: '#7a7f9a' }} />
          <Tooltip contentStyle={{ background: '#1a1c2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
          <Line type="monotone" dataKey="count" stroke="#6c63ff" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
