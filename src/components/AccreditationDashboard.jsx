/**
 * Accreditation Dashboard — Compliance + accreditation automation.
 * Standards mapping, evidence tracking, audit exports, competency progression.
 */
import React, { useState, useMemo } from 'react';
import {
  FRAMEWORKS, getStandardsMappings, addStandardsMapping,
  getEvidence, autoCollectEvidence, getEvidenceForClass,
  getClassCompetencyOverview, generateAuditBundle,
  downloadAuditBundle, downloadEvidenceCSV,
} from '../utils/compliance';
import { getClasses, getAssignments, getGameResults } from '../utils/storage';

const TABS = [
  { id: 'overview', label: 'Compliance Overview', icon: '\uD83D\uDCCB' },
  { id: 'mapping', label: 'Standards Mapping', icon: '\uD83D\uDD17' },
  { id: 'evidence', label: 'Evidence Tracker', icon: '\uD83D\uDCC2' },
  { id: 'progression', label: 'Competency Progression', icon: '\uD83D\uDCC8' },
  { id: 'export', label: 'Audit Export', icon: '\uD83D\uDCE6' },
  { id: 'report', label: 'AI Report', icon: '\uD83E\uDDE0' },
];

const levelColor = { mastered: '#22c55e', proficient: '#84cc16', developing: '#f59e0b', struggling: '#ef4444', 'not-started': '#cbd5e1' };
const levelLabel = { mastered: 'Mastered', proficient: 'Proficient', developing: 'Developing', struggling: 'Struggling', 'not-started': 'Not Started' };
const statusColor = { compliant: '#22c55e', partial: '#f59e0b', 'non-compliant': '#ef4444', sufficient: '#22c55e', insufficient: '#ef4444', none: '#cbd5e1' };

export default function AccreditationDashboard() {
  const [tab, setTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('teks');
  const [mapLoading, setMapLoading] = useState(false);
  const [mapResult, setMapResult] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const [reportType, setReportType] = useState('full-report');
  const [collectMsg, setCollectMsg] = useState('');

  const classes = useMemo(() => getClasses(), []);
  const evidence = useMemo(() => getEvidence(), [collectMsg]);
  const mappings = useMemo(() => getStandardsMappings(), [mapResult]);

  const selectedCls = classes.find((c) => c.id === selectedClass);
  const classEvidence = selectedClass ? getEvidenceForClass(selectedClass) : evidence;
  const competencyData = selectedClass ? getClassCompetencyOverview(selectedClass) : null;

  // Overview stats
  const stats = useMemo(() => {
    const totalStudents = new Set();
    classes.forEach((c) => (c.students || []).forEach((s) => totalStudents.add(s.id)));
    const allResults = getGameResults();
    const allAssignments = getAssignments();
    const uniqueStandards = new Set();
    evidence.forEach((e) => (e.standards || []).forEach((s) => uniqueStandards.add(s)));

    return {
      classes: classes.length,
      students: totalStudents.size,
      evidence: evidence.length,
      standards: uniqueStandards.size,
      mappings: mappings.length,
      sessions: allResults.length,
      assignments: allAssignments.length,
    };
  }, [classes, evidence, mappings]);

  const handleAutoCollect = () => {
    if (!selectedClass) return;
    const count = autoCollectEvidence(selectedClass);
    setCollectMsg(`Collected ${count} new evidence artifacts.`);
    setTimeout(() => setCollectMsg(''), 3000);
  };

  const handleMapStandards = async () => {
    if (!selectedCls) return;
    setMapLoading(true);
    setMapResult(null);
    const outcomes = (selectedCls.teksStandards || []).map((id) => ({ id, description: id }));
    try {
      const resp = await fetch('/api/map-standards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learningOutcomes: outcomes,
          sourceFramework: 'TEKS',
          targetFramework: FRAMEWORKS.find((f) => f.id === selectedFramework)?.name || selectedFramework,
          gradeLevel: selectedCls.gradeLevel || selectedCls.gradeId,
        }),
      });
      const data = await resp.json();
      if (data.result) {
        setMapResult(data.result);
        (data.result.mappings || []).forEach((m) => {
          addStandardsMapping({
            classId: selectedClass,
            frameworkId: selectedFramework,
            sourceId: m.sourceId,
            targetStandards: m.targetStandards,
          });
        });
      }
    } catch (err) {
      setMapResult({ error: err.message });
    }
    setMapLoading(false);
  };

  const handleGenerateReport = async () => {
    if (!selectedClass) return;
    setReportLoading(true);
    setReportResult(null);
    try {
      const bundle = generateAuditBundle(selectedClass);
      const resp = await fetch('/api/compliance-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditBundle: { ...bundle, evidence: bundle?.evidence?.slice(0, 50) },
          frameworkId: selectedFramework,
          reportType,
        }),
      });
      const data = await resp.json();
      setReportResult(data.result || data.rawResult || null);
    } catch (err) {
      setReportResult({ error: err.message });
    }
    setReportLoading(false);
  };

  const gradeColor = (score) => score >= 90 ? '#22c55e' : score >= 80 ? '#84cc16' : score >= 70 ? '#eab308' : score >= 60 ? '#f97316' : '#ef4444';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #0f172a, #1e40af)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff',
        }}>{'\uD83C\uDFDB\uFE0F'}</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Compliance & Accreditation</h2>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Auto-map standards, track evidence, export audit bundles, monitor competency progression.</p>
        </div>
      </div>

      {/* Class + Framework selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={{
          padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, minWidth: 200,
        }}>
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({(c.students || []).length} students)</option>)}
        </select>
        <select value={selectedFramework} onChange={(e) => setSelectedFramework(e.target.value)} style={{
          padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, minWidth: 200,
        }}>
          {FRAMEWORKS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Accreditation sections" style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            border: tab === t.id ? '2px solid #1e40af' : '1px solid #e2e8f0',
            background: tab === t.id ? '#eff6ff' : '#fff',
            color: tab === t.id ? '#1e40af' : '#64748b',
          }}><span aria-hidden="true">{t.icon}</span> {t.label}</button>
        ))}
      </div>

      {/* ═══════ OVERVIEW ═══════ */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Classes', value: stats.classes, color: '#2563eb' },
              { label: 'Students', value: stats.students, color: '#7c3aed' },
              { label: 'Evidence', value: stats.evidence, color: '#059669' },
              { label: 'Standards Tracked', value: stats.standards, color: '#0891b2' },
              { label: 'Mappings', value: stats.mappings, color: '#d97706' },
              { label: 'Game Sessions', value: stats.sessions, color: '#dc2626' },
            ].map((s) => (
              <div key={s.label} style={{
                padding: '16px 14px', borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Frameworks */}
          <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800 }}>Supported Frameworks</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {FRAMEWORKS.map((f) => (
              <div key={f.id} style={{
                padding: 14, borderRadius: 10, background: f.id === selectedFramework ? '#eff6ff' : '#fff',
                border: f.id === selectedFramework ? '2px solid #2563eb' : '1px solid #e2e8f0',
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>{f.name}</div>
                <div style={{ fontSize: 11, color: '#7c3aed', marginBottom: 4 }}>{f.region} · {f.type}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{f.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ STANDARDS MAPPING ═══════ */}
      {tab === 'mapping' && (
        <div>
          <div style={{ padding: 16, borderRadius: 12, background: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 800, color: '#0c4a6e' }}>{'\uD83D\uDD17'} Auto-Map Standards</h4>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#475569' }}>
              AI maps your class learning outcomes from {FRAMEWORKS.find((f) => f.id === 'teks')?.name} to {FRAMEWORKS.find((f) => f.id === selectedFramework)?.name}.
            </p>
            <button type="button" onClick={handleMapStandards} disabled={mapLoading || !selectedClass} style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: selectedClass ? '#2563eb' : '#e2e8f0',
              color: selectedClass ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>
              {mapLoading ? 'Mapping...' : `Map ${selectedCls?.name || 'Select a class'} Standards`}
            </button>
          </div>

          {mapResult && !mapResult.error && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {mapResult.coverageSummary && (
                <div style={{ padding: '14px 18px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900 }}>{mapResult.coverageSummary.coveragePercent}%</div>
                    <div style={{ fontSize: 10, opacity: 0.7 }}>Coverage</div>
                  </div>
                  {['fullAlignment', 'partialAlignment', 'noMatch'].map((k) => (
                    <div key={k} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>{mapResult.coverageSummary[k] || 0}</div>
                      <div style={{ fontSize: 10, opacity: 0.7 }}>{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                    </div>
                  ))}
                </div>
              )}
              {(mapResult.mappings || []).map((m, i) => (
                <div key={i} style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 6 }}>{m.sourceId}: {m.sourceDescription}</div>
                  {(m.targetStandards || []).map((ts, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, paddingLeft: 12 }}>
                      <span style={{
                        padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 800,
                        background: ts.alignment === 'full' ? '#dcfce7' : ts.alignment === 'partial' ? '#fef9c3' : '#fee2e2',
                        color: ts.alignment === 'full' ? '#166534' : ts.alignment === 'partial' ? '#854d0e' : '#991b1b',
                      }}>{ts.alignment}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>{ts.id}</span>
                      <span style={{ fontSize: 11, color: '#64748b', flex: 1 }}>{ts.description}</span>
                      <span style={{ fontSize: 9, color: '#94a3b8' }}>{ts.confidence}</span>
                    </div>
                  ))}
                  {m.gaps?.length > 0 && (
                    <div style={{ paddingLeft: 12, marginTop: 4 }}>
                      {m.gaps.map((g, k) => <div key={k} style={{ fontSize: 11, color: '#ef4444' }}>{'\u26A0'} Gap: {g}</div>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Existing mappings */}
          {mappings.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#475569' }}>Saved Mappings ({mappings.length})</h4>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {mappings.slice(0, 10).map((m, i) => (
                  <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                    {m.sourceId} {'\u2192'} {(m.targetStandards || []).map((t) => t.id).join(', ')}
                  </div>
                ))}
                {mappings.length > 10 && <div style={{ color: '#94a3b8', marginTop: 4 }}>...and {mappings.length - 10} more</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ EVIDENCE TRACKER ═══════ */}
      {tab === 'evidence' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" onClick={handleAutoCollect} disabled={!selectedClass} style={{
              padding: '10px 18px', borderRadius: 8, border: 'none',
              background: selectedClass ? '#059669' : '#e2e8f0',
              color: selectedClass ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>
              {'\uD83D\uDD04'} Auto-Collect Evidence {selectedCls ? `for ${selectedCls.name}` : ''}
            </button>
            {collectMsg && <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>{'\u2713'} {collectMsg}</span>}
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>
              <strong>{classEvidence.length}</strong> artifacts
            </div>
          </div>

          {/* Evidence stats */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            {['game-result', 'discussion', 'exit-ticket', 'assignment'].map((type) => {
              const count = classEvidence.filter((e) => e.type === type).length;
              return (
                <div key={type} style={{
                  padding: '10px 14px', borderRadius: 8, background: '#fff', border: '1px solid #e2e8f0',
                  fontSize: 12, minWidth: 100,
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{count}</div>
                  <div style={{ color: '#64748b', textTransform: 'capitalize' }}>{type.replace('-', ' ')}s</div>
                </div>
              );
            })}
          </div>

          {/* Evidence table */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Type', 'Student', 'Standards', 'Score', 'Date', 'Description'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classEvidence.slice(0, 50).map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700,
                          background: e.type === 'game-result' ? '#dbeafe' : e.type === 'discussion' ? '#f3e8ff' : '#dcfce7',
                          color: e.type === 'game-result' ? '#1e40af' : e.type === 'discussion' ? '#7c3aed' : '#166534',
                        }}>{e.type}</span>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#0f172a' }}>{e.studentId?.replace('s-', '').slice(0, 10) || '-'}</td>
                      <td style={{ padding: '8px 12px', color: '#7c3aed', fontSize: 11 }}>{(e.standards || []).join(', ') || '-'}</td>
                      <td style={{ padding: '8px 12px' }}>
                        {e.score != null ? (
                          <span style={{ fontWeight: 700, color: e.score >= 80 ? '#22c55e' : e.score >= 60 ? '#eab308' : '#ef4444' }}>{e.score}%</span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#94a3b8', fontSize: 11 }}>{e.timestamp ? new Date(e.timestamp).toLocaleDateString() : '-'}</td>
                      <td style={{ padding: '8px 12px', color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {classEvidence.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                No evidence collected yet. {selectedClass ? 'Click "Auto-Collect" to scan.' : 'Select a class first.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ COMPETENCY PROGRESSION ═══════ */}
      {tab === 'progression' && (
        <div>
          {!selectedClass ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              Select a class above to view competency progression.
            </div>
          ) : competencyData && (
            <>
              {/* Standards heatmap */}
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800 }}>Standards Coverage Heatmap</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 6, marginBottom: 20 }}>
                {Object.entries(competencyData.standards).map(([std, data]) => {
                  const total = data.mastered + data.proficient + data.developing + data.struggling + data.notStarted;
                  const pct = total > 0 ? Math.round(((data.mastered + data.proficient) / total) * 100) : 0;
                  return (
                    <div key={std} title={`${std}: ${pct}% proficient+`} style={{
                      padding: '10px 6px', borderRadius: 8, textAlign: 'center',
                      background: pct >= 80 ? '#dcfce7' : pct >= 60 ? '#fef9c3' : pct >= 30 ? '#fee2e2' : '#f1f5f9',
                      border: '1px solid #e2e8f0',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{std}</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: gradeColor(pct) }}>{pct}%</div>
                      <div style={{ fontSize: 9, color: '#94a3b8' }}>{total} assess.</div>
                    </div>
                  );
                })}
              </div>

              {/* Per-student competency grid */}
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800 }}>Student Competency Grid</h4>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, position: 'sticky', left: 0, background: '#f8fafc', zIndex: 1, borderBottom: '2px solid #e2e8f0' }}>Student</th>
                      {Object.keys(competencyData.standards).slice(0, 12).map((std) => (
                        <th key={std} style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 600, fontSize: 9, borderBottom: '2px solid #e2e8f0', minWidth: 50, maxWidth: 60 }}>
                          {std}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(competencyData.students || []).map((s) => (
                      <tr key={s.id}>
                        <td style={{ padding: '6px 12px', fontWeight: 600, position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderBottom: '1px solid #f1f5f9' }}>{s.name}</td>
                        {Object.keys(competencyData.standards).slice(0, 12).map((std) => {
                          const comp = s.competencies[std];
                          const lvl = comp?.level || 'not-started';
                          return (
                            <td key={std} style={{ padding: '4px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                              <div title={`${levelLabel[lvl]}: ${comp?.avgScore || 0}%`} style={{
                                width: 24, height: 24, borderRadius: 4, margin: '0 auto',
                                background: levelColor[lvl], display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 8, color: '#fff', fontWeight: 800,
                              }}>
                                {comp?.avgScore || ''}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(competencyData.students || []).length === 0 && (
                  <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No student data. Collect evidence first.</div>
                )}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                {Object.entries(levelColor).map(([lvl, color]) => (
                  <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                    <span style={{ color: '#64748b' }}>{levelLabel[lvl]}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════ AUDIT EXPORT ═══════ */}
      {tab === 'export' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>{'\uD83D\uDCE6'} Audit-Ready Export Bundles</h4>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Download complete compliance packages with metadata, standards coverage, evidence artifacts, student competency maps, and discussion records.
            </p>

            {!selectedClass ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: 8 }}>
                Select a class above to generate export bundles.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{
                  padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{'\uD83D\uDCC4'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Full Audit Bundle (JSON)</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Complete data package: metadata, students, standards, evidence, competencies, discussions.</div>
                  </div>
                  <button type="button" onClick={() => downloadAuditBundle(selectedClass)} style={{
                    padding: '10px 20px', borderRadius: 8, border: 'none', background: '#2563eb',
                    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>Download JSON</button>
                </div>

                <div style={{
                  padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{'\uD83D\uDCCA'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Evidence Log (CSV)</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Spreadsheet-friendly evidence export for auditors. Includes type, student, standards, scores, dates.</div>
                  </div>
                  <button type="button" onClick={() => downloadEvidenceCSV(selectedClass)} style={{
                    padding: '10px 20px', borderRadius: 8, border: 'none', background: '#059669',
                    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>Download CSV</button>
                </div>

                {/* Bundle preview */}
                {selectedCls && (() => {
                  const bundle = generateAuditBundle(selectedClass);
                  if (!bundle) return null;
                  return (
                    <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 8 }}>Bundle Preview</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, fontSize: 12 }}>
                        {[
                          { label: 'Students', value: bundle.summary.studentCount },
                          { label: 'Assignments', value: bundle.summary.assignmentCount },
                          { label: 'Sessions', value: bundle.summary.totalSessions },
                          { label: 'Evidence', value: bundle.summary.evidenceArtifacts },
                          { label: 'Standards', value: bundle.summary.standardsMapped },
                          { label: 'Class Avg', value: bundle.summary.classAverage ? `${bundle.summary.classAverage}%` : 'N/A' },
                        ].map((s) => (
                          <div key={s.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{s.value}</div>
                            <div style={{ color: '#64748b', fontSize: 10 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ AI REPORT ═══════ */}
      {tab === 'report' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={{
              padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13,
            }}>
              <option value="full-report">Full Compliance Report</option>
              <option value="gap-analysis">Gap Analysis</option>
              <option value="evidence-summary">Evidence Summary</option>
              <option value="readiness-assessment">Audit Readiness Assessment</option>
            </select>
            <button type="button" onClick={handleGenerateReport} disabled={reportLoading || !selectedClass} style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: selectedClass ? '#1e40af' : '#e2e8f0',
              color: selectedClass ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>
              {reportLoading ? '\u2728 Generating Report...' : '\uD83E\uDDE0 Generate AI Report'}
            </button>
          </div>

          {reportResult && typeof reportResult === 'object' && !reportResult.error && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {/* Report header */}
              <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #0f172a, #1e40af)', color: '#fff' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800 }}>{reportResult.title || 'Compliance Report'}</h3>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{reportResult.date || new Date().toLocaleDateString()}</div>
                {reportResult.overallCompliance != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%', border: `3px solid ${gradeColor(reportResult.overallCompliance)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                    }}>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>{reportResult.overallCompliance}</div>
                      <div style={{ fontSize: 8 }}>/100</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>Grade: {reportResult.overallGrade}</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{reportResult.executiveSummary}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sections */}
              {(reportResult.sections || []).map((s, i) => (
                <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{s.heading}</span>
                    {s.status && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800,
                        background: (statusColor[s.status] || '#94a3b8') + '18',
                        color: statusColor[s.status] || '#94a3b8', textTransform: 'uppercase',
                      }}>{s.status}</span>
                    )}
                    {s.score != null && <span style={{ fontSize: 13, fontWeight: 800, color: gradeColor(s.score), marginLeft: 'auto' }}>{s.score}/100</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{s.content}</div>
                </div>
              ))}

              {/* Standards analysis */}
              {reportResult.standardsAnalysis?.length > 0 && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800 }}>Standards Analysis</h4>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {reportResult.standardsAnalysis.map((sa, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, background: '#f8fafc', fontSize: 12 }}>
                        <span style={{ fontWeight: 700, color: '#2563eb', minWidth: 50 }}>{sa.standardId}</span>
                        <span style={{ flex: 1, color: '#475569' }}>{sa.description?.slice(0, 60)}</span>
                        <span style={{ fontSize: 10, color: '#64748b' }}>{sa.evidenceCount} ev.</span>
                        {sa.sufficiency && (
                          <span style={{
                            padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 800,
                            background: (statusColor[sa.sufficiency] || '#94a3b8') + '18',
                            color: statusColor[sa.sufficiency] || '#94a3b8',
                          }}>{sa.sufficiency}</span>
                        )}
                        {sa.avgPerformance != null && <span style={{ fontWeight: 700, color: gradeColor(sa.avgPerformance) }}>{sa.avgPerformance}%</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gaps */}
              {reportResult.gaps?.length > 0 && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{'\u26A0\uFE0F'} Gaps</h4>
                  {reportResult.gaps.map((g, i) => (
                    <div key={i} style={{ padding: 8, borderRadius: 6, background: '#fef2f2', marginBottom: 6, fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{
                          padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 800,
                          background: g.severity === 'critical' ? '#ef4444' : g.severity === 'major' ? '#f97316' : '#eab308', color: '#fff',
                        }}>{g.severity}</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{g.area}</span>
                      </div>
                      <div style={{ color: '#475569' }}>{g.recommendation}</div>
                      {g.deadline && <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>Deadline: {g.deadline}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Action items */}
              {reportResult.actionItems?.length > 0 && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 800, color: '#2563eb' }}>{'\u2705'} Action Items</h4>
                  {reportResult.actionItems.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                      <span style={{
                        padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 800,
                        background: a.priority === 'high' ? '#fee2e2' : a.priority === 'medium' ? '#fef9c3' : '#dcfce7',
                        color: a.priority === 'high' ? '#991b1b' : a.priority === 'medium' ? '#854d0e' : '#166534',
                      }}>{a.priority}</span>
                      <span style={{ flex: 1, color: '#0f172a' }}>{a.action}</span>
                      <span style={{ color: '#94a3b8', fontSize: 10 }}>{a.owner}</span>
                      <span style={{ color: '#94a3b8', fontSize: 10 }}>{a.deadline}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Audit readiness */}
              {reportResult.auditReadiness && (
                <div style={{ padding: '16px 20px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 800 }}>
                    Audit Readiness: <span style={{ color: reportResult.auditReadiness.ready ? '#22c55e' : '#ef4444' }}>
                      {reportResult.auditReadiness.ready ? '\u2713 READY' : '\u2717 NOT READY'}
                    </span>
                    {reportResult.auditReadiness.score != null && (
                      <span style={{ marginLeft: 8, fontSize: 13, color: gradeColor(reportResult.auditReadiness.score) }}>{reportResult.auditReadiness.score}%</span>
                    )}
                  </h4>
                  {reportResult.auditReadiness.blockers?.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      {reportResult.auditReadiness.blockers.map((b, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#ef4444', marginBottom: 2 }}>{'\u2717'} {b}</div>
                      ))}
                    </div>
                  )}
                  {reportResult.auditReadiness.nextSteps?.length > 0 && (
                    <div>
                      {reportResult.auditReadiness.nextSteps.map((s, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#059669', marginBottom: 2 }}>{'\u2192'} {s}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {reportResult && typeof reportResult === 'string' && (
            <div style={{ padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13, whiteSpace: 'pre-wrap' }}>{reportResult}</div>
          )}
        </div>
      )}
    </div>
  );
}
