import React, { useState, useMemo } from 'react';
import { getItemAnalysis } from '../utils/storage';

export default function ItemAnalysis({ assessmentId, assessmentName, onBack }) {
  const [sortDir, setSortDir] = useState('asc');
  const raw = useMemo(() => getItemAnalysis(assessmentId), [assessmentId]);

  const items = useMemo(() => {
    const sorted = [...raw];
    sorted.sort((a, b) => sortDir === 'asc' ? a.difficulty - b.difficulty : b.difficulty - a.difficulty);
    return sorted;
  }, [raw, sortDir]);

  const totalResponses = raw.length > 0 ? raw[0].total : 0;
  const avgScore = raw.length > 0
    ? Math.round(raw.reduce((s, q) => s + (q.total ? q.correct / q.total : 0), 0) / raw.length * 100)
    : 0;
  const hardest = raw.length > 0 ? raw.reduce((h, q) => q.difficulty < h.difficulty ? q : h, raw[0]) : null;
  const easiest = raw.length > 0 ? raw.reduce((e, q) => q.difficulty > e.difficulty ? q : e, raw[0]) : null;

  const diffColor = (d) => d < 0.3 ? '#dc2626' : d > 0.7 ? '#059669' : '#d97706';
  const diffBg = (d) => d < 0.3 ? '#fef2f2' : d > 0.7 ? '#f0fdf4' : '#fffbeb';
  const diffLabel = (d) => d < 0.3 ? 'Hard' : d > 0.7 ? 'Easy' : 'Medium';
  const truncate = (s, n = 60) => s && s.length > n ? s.slice(0, n) + '...' : s || '';

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  if (raw.length === 0) {
    return (
      <div>
        {onBack && (
          <button type="button" onClick={onBack} style={backBtnStyle}>&larr; Back</button>
        )}
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{'\uD83D\uDCCA'}</div>
          <p style={{ fontSize: 15, fontWeight: 700 }}>No Responses Yet</p>
          <p style={{ fontSize: 13 }}>Item analysis will appear once students submit this assessment.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {onBack && (
        <button type="button" onClick={onBack} style={backBtnStyle}>&larr; Back to Assessments</button>
      )}

      <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
        Item Analysis {assessmentName ? `\u2014 ${assessmentName}` : ''}
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>
        Per-question difficulty, correctness, and response distribution.
      </p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 24 }}>
        <SummaryCard icon={'\uD83D\uDCE5'} label="Total Responses" value={totalResponses} />
        <SummaryCard icon={'\uD83C\uDFAF'} label="Avg Score" value={`${avgScore}%`} />
        <SummaryCard icon={'\uD83D\uDD25'} label="Hardest Question"
          value={hardest ? truncate(hardest.questionText, 30) : '\u2014'}
          sub={hardest ? `${Math.round(hardest.difficulty * 100)}% correct` : ''} color="#dc2626" />
        <SummaryCard icon={'\u2705'} label="Easiest Question"
          value={easiest ? truncate(easiest.questionText, 30) : '\u2014'}
          sub={easiest ? `${Math.round(easiest.difficulty * 100)}% correct` : ''} color="#059669" />
      </div>

      {/* Sort Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          {items.length} Question{items.length !== 1 ? 's' : ''}
        </span>
        <button type="button" onClick={() => setSortDir((d) => d === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569',
          }}>
          Difficulty {sortDir === 'asc' ? '\u2191 Hardest First' : '\u2193 Easiest First'}
        </button>
      </div>

      {/* Per-Question Table */}
      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((q, idx) => {
          const pct = Math.round(q.difficulty * 100);
          const flagged = q.difficulty < 0.3 || q.difficulty > 0.9;
          const optEntries = Object.entries(q.optionDistribution);
          const maxOpt = Math.max(...optEntries.map(([, v]) => v), 1);

          return (
            <div key={q.questionId} style={{
              background: '#fff', borderRadius: 10, border: `1px solid ${flagged ? '#fbbf24' : '#e2e8f0'}`,
              padding: '14px 18px', position: 'relative',
            }}>
              {flagged && (
                <span style={{ position: 'absolute', top: 10, right: 14, fontSize: 14 }}
                  title={q.difficulty < 0.3 ? 'Too hard — most students missed this' : 'Too easy — almost everyone got it right'}>
                  {'\uD83D\uDEA9'}
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', minWidth: 28, marginTop: 2 }}>
                  Q{idx + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 6, lineHeight: 1.4 }}>
                    {truncate(q.questionText, 120)}
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Difficulty badge */}
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                      background: diffBg(q.difficulty), color: diffColor(q.difficulty),
                    }}>
                      {diffLabel(q.difficulty)} ({q.difficulty.toFixed(2)})
                    </span>
                    {/* % Correct */}
                    <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                      {pct}% correct ({q.correct}/{q.total})
                    </span>
                  </div>
                </div>
              </div>

              {/* Option Distribution Bar Chart */}
              {optEntries.length > 0 && (
                <div style={{ marginLeft: 42 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                    Response Distribution
                  </div>
                  {optEntries.map(([optKey, count], oi) => {
                    const barPct = q.total > 0 ? (count / q.total) * 100 : 0;
                    return (
                      <div key={optKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', minWidth: 36, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {String(optKey).length > 5 ? String(optKey).slice(0, 5) + '..' : String(optKey)}
                        </span>
                        <div style={{ flex: 1, height: 16, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                          <div style={{
                            height: '100%', borderRadius: 4,
                            width: `${barPct}%`,
                            background: COLORS[oi % COLORS.length],
                            transition: 'width 0.3s',
                            minWidth: barPct > 0 ? 2 : 0,
                          }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#64748b', minWidth: 40, fontWeight: 600 }}>
                          {count} ({Math.round(barPct)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 10, background: '#fff',
      border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{icon} {label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: color || '#0f172a', lineHeight: 1.3 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

const backBtnStyle = {
  padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 700,
  cursor: 'pointer', background: '#f1f5f9', border: '1px solid #e2e8f0',
  color: '#475569', marginBottom: 16, display: 'inline-block',
};
