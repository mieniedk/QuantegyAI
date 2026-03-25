import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getClasses, getMasteryAnalytics } from '../utils/storage';
import { TEKS_STANDARDS, TEKS_SUB_CONCEPTS, TEKS_GRADES } from '../data/teks';
import { DOMAINS, STANDARDS, getAllConcepts, getConceptById, getGamesForConcept, getTeksForConcept } from '../data/taxonomy';
import { getAllConceptStats, getAccuracy, getMasteryLevel, getWeakestConcepts, MASTERY_COLORS, MASTERY_LABELS } from '../utils/conceptTracker';
import TeacherLayout from '../components/TeacherLayout';

const getMasteryColor = (pct) => {
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#eab308';
  if (pct >= 40) return '#f97316';
  return '#ef4444';
};

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [mastery, setMastery] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('grade3');
  const [dashTab, setDashTab] = useState('heatmap'); // 'heatmap' | 'weakest' | 'legacy'
  const navigate = useNavigate();

  useEffect(() => {
    setClasses(getClasses());
    setMastery(getMasteryAnalytics());
  }, []);

  const classData = classes.find((c) => c.id === selectedClass);
  const teksForGrade = TEKS_STANDARDS[selectedGrade] || [];
  const relevantTeks = (selectedClass && classData?.teksStandards?.length)
    ? classData.teksStandards
    : teksForGrade.slice(0, 8).map((s) => s.id);
  const masteryByTeks = mastery?.byTeks || {};

  // New concept-level data
  const domains = DOMAINS[selectedGrade] || [];
  const allConcepts = useMemo(() => getAllConcepts(selectedGrade), [selectedGrade]);
  const allConceptIds = useMemo(() => allConcepts.map((c) => c.conceptId), [allConcepts]);
  const conceptStats = useMemo(() => getAllConceptStats(), [dashTab]); // re-read on tab change
  const weakest = useMemo(() => getWeakestConcepts(allConceptIds, 8), [allConceptIds]);

  const launchConcept = (concept) => {
    const teks = concept.standardCode || getTeksForConcept(concept.conceptId);
    const params = new URLSearchParams();
    params.set('teks', teks);
    params.set('label', concept.label);
    params.set('desc', concept.description || '');
    params.set('concept', concept.conceptId);
    navigate('/games/math-sprint?' + params.toString());
  };

  const tabBtn = (id, label) => (
    <button type="button" onClick={() => setDashTab(id)} style={{
      padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
      background: dashTab === id ? '#0f172a' : '#f1f5f9',
      color: dashTab === id ? '#fff' : '#475569',
      border: dashTab === id ? '1px solid #0f172a' : '1px solid #e2e8f0',
    }}>
      {label}
    </button>
  );

  return (
    <TeacherLayout>
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Analytics Dashboard</h1>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', color: 'white', padding: 24, borderRadius: 12, marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>TEKS-aligned mastery engine</p>
        <p style={{ margin: '8px 0 0', fontSize: 18, fontWeight: 600 }}>
          Concept heatmap · Exact gaps · Data-driven remediation
        </p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {classes.length > 0 && (
          <>
            <div>
              <label style={{ marginRight: 8, fontWeight: 600, fontSize: 13 }}>Class:</label>
              <select value={selectedClass || ''} onChange={(e) => setSelectedClass(e.target.value || null)} style={{ padding: 8, minWidth: 180 }}>
                <option value="">All classes</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </>
        )}
        <div>
          <label style={{ marginRight: 8, fontWeight: 600, fontSize: 13 }}>Grade:</label>
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} style={{ padding: 8 }}>
            {TEKS_GRADES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabBtn('heatmap', '🗺️ Concept Heatmap')}
        {tabBtn('weakest', '🔴 Top Weak Concepts')}
        {tabBtn('legacy', '📊 TEKS Mastery')}
      </div>

      {/* ── Concept Heatmap ── */}
      {dashTab === 'heatmap' && (
        <div>
          {domains.filter((d) => (STANDARDS[selectedGrade]?.[d.id] || []).length > 0).map((domain) => {
            const domainConcepts = allConcepts.filter((c) => c.domainId === domain.id);
            if (domainConcepts.length === 0) return null;
            return (
              <div key={domain.id} style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 16, color: '#1e293b' }}>
                  {domain.icon} {domain.label}
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 10,
                }}>
                  {domainConcepts.map((concept) => {
                    const stats = conceptStats[concept.conceptId];
                    const acc = stats && stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : null;
                    const level = acc !== null
                      ? (acc < 40 ? 'struggling' : acc < 65 ? 'developing' : acc < 85 ? 'proficient' : 'mastered')
                      : 'not-started';
                    const attempts = stats?.attempts || 0;

                    return (
                      <div
                        key={concept.conceptId}
                        onClick={() => launchConcept(concept)}
                        style={{
                          padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                          background: acc !== null
                            ? `linear-gradient(135deg, ${MASTERY_COLORS[level]}12, ${MASTERY_COLORS[level]}08)`
                            : '#f8fafc',
                          border: `2px solid ${MASTERY_COLORS[level]}`,
                          transition: 'transform 0.15s, box-shadow 0.15s',
                          position: 'relative',
                        }}
                        title={`Click to assign/preview ${concept.label}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{
                            padding: '1px 6px', background: '#e8f0fe', color: '#1a5cba',
                            borderRadius: 3, fontSize: 10, fontWeight: 700,
                          }}>{concept.standardCode}</span>
                          {acc !== null && (
                            <span style={{
                              fontSize: 18, fontWeight: 700, color: MASTERY_COLORS[level],
                            }}>{acc}%</span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>
                          {concept.label}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 10, color: '#94a3b8' }}>
                          {attempts > 0 ? `${attempts} attempts` : 'No data yet'}
                        </p>
                        {/* Mini bar */}
                        {acc !== null && (
                          <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                            <div style={{ width: `${acc}%`, height: '100%', background: MASTERY_COLORS[level], borderRadius: 2 }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 16, padding: 14, background: '#f0f7ff', borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
              <strong>Legend:</strong>{' '}
              {Object.entries(MASTERY_LABELS).map(([k, v]) => (
                <span key={k} style={{ marginRight: 12 }}>
                  <span style={{
                    display: 'inline-block', width: 10, height: 10, borderRadius: 2,
                    background: MASTERY_COLORS[k], marginRight: 4, verticalAlign: 'middle',
                  }} />
                  {v}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      {/* ── Top Weak Concepts ── */}
      {dashTab === 'weakest' && (
        <div>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 14 }}>
            Concepts with the lowest accuracy scores — prioritize these for remediation.
          </p>
          {weakest.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', background: '#f8fafc', borderRadius: 10 }}>
              <p style={{ color: '#94a3b8' }}>No performance data yet. Students need to play games first.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {weakest.map((w, idx) => {
                const concept = getConceptById(w.conceptId);
                if (!concept) return null;
                const level = w.accuracy < 40 ? 'struggling' : w.accuracy < 65 ? 'developing' : 'proficient';
                return (
                  <div key={w.conceptId} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: 16, borderRadius: 10, background: '#fff',
                    border: `1px solid ${idx < 3 ? '#fecaca' : '#e2e8f0'}`,
                    gap: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                        fontSize: 14, color: '#fff', flexShrink: 0,
                        background: idx < 3 ? '#ef4444' : '#f59e0b',
                      }}>#{idx + 1}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
                          <span style={{
                            padding: '1px 7px', background: '#e8f0fe', color: '#1a5cba',
                            borderRadius: 4, fontSize: 11, fontWeight: 700,
                          }}>{concept.standardCode}</span>
                          <span style={{
                            padding: '1px 6px', background: MASTERY_COLORS[level] + '18',
                            color: MASTERY_COLORS[level], borderRadius: 4, fontSize: 10, fontWeight: 700,
                          }}>{w.accuracy}%</span>
                        </div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{concept.label}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{w.attempts} attempts</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => launchConcept(concept)}
                      style={{
                        padding: '8px 16px', background: '#007bff', color: 'white',
                        border: 'none', borderRadius: 6, cursor: 'pointer',
                        fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                      }}>
                      Assign Practice
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Legacy TEKS Mastery view ── */}
      {dashTab === 'legacy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {relevantTeks.map((teksId) => {
            const standard = teksForGrade.find((s) => s.id === teksId) || { id: teksId, description: teksId };
            const data = masteryByTeks[teksId];
            const classMastery = data?.classMastery ?? 0;
            const subConcepts = TEKS_SUB_CONCEPTS[teksId] || [];
            const subData = data?.subConcepts || {};

            return (
              <div key={teksId} style={{
                border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden',
                background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}>
                <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h2 style={{ margin: '0 0 4px', fontSize: 22, color: '#0f172a' }}>TEKS {teksId}</h2>
                    <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>{standard.description}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class Mastery</p>
                    <p style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 700, color: getMasteryColor(classMastery) }}>{classMastery}%</p>
                  </div>
                </div>
                {subConcepts.length > 0 && (
                  <div style={{ padding: 20, background: '#f8fafc' }}>
                    <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#475569' }}>Conceptual breakdown</p>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {subConcepts.map((sub) => {
                        const pct = subData[sub.id] ?? 0;
                        const isGap = pct < 60;
                        return (
                          <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontWeight: 500, fontSize: 14 }}>{sub.label}</span>
                                <span style={{ fontWeight: 600, fontSize: 14, color: getMasteryColor(pct) }}>{pct}%</span>
                              </div>
                              <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: getMasteryColor(pct), borderRadius: 4 }} />
                              </div>
                            </div>
                            {isGap && <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, whiteSpace: 'nowrap' }}>Gap</span>}
                          </div>
                        );
                      })}
                    </div>
                    {subConcepts.some((s) => (subData[s.id] ?? 0) < 60) && (
                      <p style={{ margin: '12px 0 0', fontSize: 12, color: '#dc2626' }}>
                        <strong>Conceptual gap detected.</strong> Focus instruction on highlighted areas.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {relevantTeks.length === 0 && (
            <div style={{ padding: 48, textAlign: 'center', background: '#f8fafc', borderRadius: 12 }}>
              <p style={{ margin: 0, color: '#64748b' }}>Create a class and align TEKS standards to see mastery analytics.</p>
              <Link to="/teacher-class-new" style={{ display: 'inline-block', marginTop: 12, color: '#007bff' }}>Create a Class</Link>
            </div>
          )}
        </div>
      )}
    </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
