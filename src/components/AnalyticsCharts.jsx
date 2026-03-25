import React, { useMemo } from 'react';

function Bar({ value, max, color = '#2563eb', label, height = 24 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      {label && <span style={{ fontSize: 12, color: '#64748b', minWidth: 80, textAlign: 'right' }}>{label}</span>}
      <div style={{ flex: 1, height, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.4s ease', minWidth: pct > 0 ? 4 : 0 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', minWidth: 36, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export function GradeDistribution({ grades, title = 'Grade Distribution' }) {
  const buckets = useMemo(() => {
    const b = { 'A (90-100)': 0, 'B (80-89)': 0, 'C (70-79)': 0, 'D (60-69)': 0, 'F (<60)': 0 };
    for (const g of (grades || [])) {
      const s = typeof g === 'number' ? g : g.score || g.grade || 0;
      if (s >= 90) b['A (90-100)']++;
      else if (s >= 80) b['B (80-89)']++;
      else if (s >= 70) b['C (70-79)']++;
      else if (s >= 60) b['D (60-69)']++;
      else b['F (<60)']++;
    }
    return b;
  }, [grades]);

  const max = Math.max(1, ...Object.values(buckets));
  const colors = { 'A (90-100)': '#059669', 'B (80-89)': '#2563eb', 'C (70-79)': '#f59e0b', 'D (60-69)': '#ea580c', 'F (<60)': '#dc2626' };

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>{title}</h3>
      {Object.entries(buckets).map(([label, count]) => (
        <Bar key={label} label={label} value={count} max={max} color={colors[label]} />
      ))}
    </div>
  );
}

export function CompletionRate({ assignments, grades, students, title = 'Assignment Completion' }) {
  const data = useMemo(() => {
    return (assignments || []).map(a => {
      const submitted = (grades || []).filter(g => g.assignmentId === a.id);
      const total = Array.isArray(students) ? students.length : 0;
      return { name: a.name, submitted: submitted.length, total, pct: total > 0 ? Math.round((submitted.length / total) * 100) : 0 };
    });
  }, [assignments, grades, students]);

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>{title}</h3>
      {data.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>No assignments yet</p>
      ) : (
        data.map((d, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
              <span style={{ color: '#334155', fontWeight: 600 }}>{d.name}</span>
              <span style={{ color: '#64748b' }}>{d.submitted}/{d.total} ({d.pct}%)</span>
            </div>
            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${d.pct}%`, height: '100%', background: d.pct >= 80 ? '#059669' : d.pct >= 50 ? '#f59e0b' : '#dc2626', borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function ClassAverage({ grades, title = 'Class Performance' }) {
  const stats = useMemo(() => {
    const scores = (grades || []).map(g => typeof g === 'number' ? g : g.score || g.grade || 0).filter(s => s > 0);
    if (scores.length === 0) return null;
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    const sorted = [...scores].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    return { avg: avg.toFixed(1), median: median.toFixed(1), min, max, count: scores.length };
  }, [grades]);

  if (!stats) return null;

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Average', value: stats.avg, color: '#2563eb' },
          { label: 'Median', value: stats.median, color: '#7c3aed' },
          { label: 'Highest', value: stats.max, color: '#059669' },
          { label: 'Lowest', value: stats.min, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudentPerformanceTrend({ studentId, grades, assignments }) {
  const data = useMemo(() => {
    return (assignments || [])
      .map(a => {
        const g = (grades || []).find(g => g.studentId === studentId && g.assignmentId === a.id);
        return g ? { name: a.name, score: g.score || 0, date: g.gradedAt || a.createdAt } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [studentId, grades, assignments]);

  if (data.length < 2) return null;

  const max = Math.max(100, ...data.map(d => d.score));
  const width = 300;
  const height = 100;
  const padding = 4;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.score / max) * (height - 2 * padding));
    return { x, y, ...d };
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Performance Trend</h4>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        <path d={line} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#2563eb" />
            <title>{p.name}: {p.score}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}
