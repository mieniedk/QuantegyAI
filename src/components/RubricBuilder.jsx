import React, { useState } from 'react';

const DEFAULT_LEVELS = ['Excellent', 'Proficient', 'Developing', 'Beginning'];
const DEFAULT_CRITERIA = [{ name: '', description: '', scores: [4, 3, 2, 1] }];

export default function RubricBuilder({ rubric, onChange, readOnly = false }) {
  const [criteria, setCriteria] = useState(rubric?.criteria || DEFAULT_CRITERIA);
  const [levels, setLevels] = useState(rubric?.levels || DEFAULT_LEVELS);
  const [title, setTitle] = useState(rubric?.title || '');

  const emit = (c, l, t) => {
    const r = { title: t ?? title, levels: l ?? levels, criteria: c ?? criteria, totalPoints: (c ?? criteria).reduce((s, cr) => s + Math.max(...cr.scores), 0) };
    onChange?.(r);
  };

  const updateCriterion = (idx, field, value) => {
    const next = criteria.map((c, i) => i === idx ? { ...c, [field]: value } : c);
    setCriteria(next); emit(next);
  };

  const updateScore = (cIdx, sIdx, value) => {
    const next = criteria.map((c, i) => {
      if (i !== cIdx) return c;
      const scores = [...c.scores];
      scores[sIdx] = parseInt(value) || 0;
      return { ...c, scores };
    });
    setCriteria(next); emit(next);
  };

  const addCriterion = () => {
    const next = [...criteria, { name: '', description: '', scores: levels.map((_, i) => levels.length - i) }];
    setCriteria(next); emit(next);
  };

  const removeCriterion = (idx) => {
    if (criteria.length <= 1) return;
    const next = criteria.filter((_, i) => i !== idx);
    setCriteria(next); emit(next);
  };

  const updateLevel = (idx, value) => {
    const next = levels.map((l, i) => i === idx ? value : l);
    setLevels(next); emit(null, next);
  };

  if (readOnly && rubric) {
    return (
      <div style={{ overflowX: 'auto' }}>
        {rubric.title && <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>{rubric.title}</h3>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontWeight: 700, color: '#475569' }}>Criteria</th>
              {rubric.levels.map((l, i) => (
                <th key={i} style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', fontWeight: 700, color: '#475569', minWidth: 100 }}>{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rubric.criteria.map((c, ci) => (
              <tr key={ci}>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#0f172a' }}>
                  {c.name}
                  {c.description && <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400, marginTop: 2 }}>{c.description}</div>}
                </td>
                {c.scores.map((s, si) => (
                  <td key={si} style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#2563eb' }}>{s}</td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f0f7ff' }}>
              <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>Total</td>
              <td colSpan={rubric.levels.length} style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 900, fontSize: 16, color: '#2563eb' }}>
                {rubric.totalPoints || rubric.criteria.reduce((s, c) => s + Math.max(...c.scores), 0)} pts
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, background: '#fff' }}>
      <input value={title} onChange={e => { setTitle(e.target.value); emit(null, null, e.target.value); }}
        placeholder="Rubric title (optional)" disabled={readOnly}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 15, fontWeight: 700, marginBottom: 12, boxSizing: 'border-box' }} />

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', minWidth: 160 }}>Criteria</th>
              {levels.map((l, i) => (
                <th key={i} style={{ padding: '8px 12px', borderBottom: '2px solid #e2e8f0', minWidth: 100 }}>
                  <input value={l} onChange={e => updateLevel(i, e.target.value)} disabled={readOnly}
                    style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: 700, fontSize: 12, color: '#475569' }} />
                </th>
              ))}
              {!readOnly && <th style={{ width: 36 }} />}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c, ci) => (
              <tr key={ci}>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                  <input value={c.name} onChange={e => updateCriterion(ci, 'name', e.target.value)}
                    placeholder="Criterion name" disabled={readOnly}
                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 4, padding: '4px 8px', fontWeight: 600, fontSize: 13, marginBottom: 4, boxSizing: 'border-box' }} />
                  <input value={c.description || ''} onChange={e => updateCriterion(ci, 'description', e.target.value)}
                    placeholder="Description" disabled={readOnly}
                    style={{ width: '100%', border: '1px solid #f1f5f9', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: '#64748b', boxSizing: 'border-box' }} />
                </td>
                {c.scores.map((s, si) => (
                  <td key={si} style={{ padding: '6px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', verticalAlign: 'top' }}>
                    <input type="number" value={s} onChange={e => updateScore(ci, si, e.target.value)}
                      min={0} disabled={readOnly}
                      style={{ width: 48, textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: 4, padding: '4px', fontWeight: 700, fontSize: 14, color: '#2563eb' }} />
                  </td>
                ))}
                {!readOnly && (
                  <td style={{ padding: '6px 4px', verticalAlign: 'top' }}>
                    <button type="button" onClick={() => removeCriterion(ci)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16, padding: 4 }}
                      title="Remove criterion">×</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <button type="button" onClick={addCriterion}
          style={{ marginTop: 8, padding: '6px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#475569' }}>
          + Add Criterion
        </button>
      )}
    </div>
  );
}
