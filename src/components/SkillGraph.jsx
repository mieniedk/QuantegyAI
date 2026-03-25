/**
 * Skill Graph — Learner-centric competency view with prerequisite edges
 * Replaces course list with a visual skill/dependency graph.
 * Shows concepts by domain with mastery-based progression and unlock gates.
 */
import React, { useMemo, useRef, useState } from 'react';
import { DOMAINS, PREREQUISITES, getPrerequisites } from '../data/taxonomy';
import { getMasteryLevel, MASTERY_COLORS, MASTERY_LABELS, isConceptUnlocked, getPrerequisiteStatus } from '../utils/conceptTracker';

export default function SkillGraph({
  conceptsByDomain = {},
  getMasteryLevel: getLevel,
  onConceptClick,
  gradeId,
}) {
  const safeConceptsByDomain = conceptsByDomain && typeof conceptsByDomain === 'object' ? conceptsByDomain : {};
  const domains = (gradeId && DOMAINS[gradeId]) ? DOMAINS[gradeId] : DOMAINS.algebra || [];
  const masteryFn = getLevel || getMasteryLevel;
  const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'list'
  const [selectedConcept, setSelectedConcept] = useState(null);

  const allConcepts = useMemo(() => {
    const list = [];
    for (const d of domains) {
      for (const c of (safeConceptsByDomain[d.id] || [])) list.push({ ...c, domainId: d.id });
    }
    return list;
  }, [domains, safeConceptsByDomain]);

  const stats = useMemo(() => {
    const total = allConcepts.length;
    const mastered = allConcepts.filter((c) => masteryFn(c.conceptId) === 'mastered').length;
    const unlocked = allConcepts.filter((c) => isConceptUnlocked(c.conceptId)).length;
    const locked = total - unlocked;
    return { total, mastered, unlocked, locked };
  }, [allConcepts, masteryFn]);

  const handleConceptClick = (concept) => {
    const unlocked = isConceptUnlocked(concept.conceptId);
    if (unlocked) {
      onConceptClick?.(concept);
    } else {
      setSelectedConcept(concept);
    }
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              Your Skill Graph
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
              Master prerequisites to unlock new skills. Click any unlocked skill to practice.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['graph', 'list'].map((m) => (
              <button key={m} type="button" onClick={() => setViewMode(m)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: viewMode === m ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: viewMode === m ? '#eff6ff' : '#fff',
                color: viewMode === m ? '#1d4ed8' : '#64748b',
              }}>
                {m === 'graph' ? 'Dependency View' : 'List View'}
              </button>
            ))}
          </div>
        </div>

        {/* Progress summary */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <div style={{ padding: '8px 16px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <span style={{ fontWeight: 800, color: '#22c55e', fontSize: 16 }}>{stats.mastered}</span>
            <span style={{ fontSize: 12, color: '#065f46', marginLeft: 4 }}>mastered</span>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <span style={{ fontWeight: 800, color: '#2563eb', fontSize: 16 }}>{stats.unlocked}</span>
            <span style={{ fontSize: 12, color: '#1e40af', marginLeft: 4 }}>unlocked</span>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <span style={{ fontWeight: 800, color: '#94a3b8', fontSize: 16 }}>{stats.locked}</span>
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>locked</span>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: 10, background: '#faf5ff', border: '1px solid #e9d5ff' }}>
            <span style={{ fontWeight: 800, color: '#7c3aed', fontSize: 16 }}>{stats.total}</span>
            <span style={{ fontSize: 12, color: '#6d28d9', marginLeft: 4 }}>total skills</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        {['not-started', 'struggling', 'developing', 'proficient', 'mastered'].map((level) => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, background: MASTERY_COLORS[level] }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>{MASTERY_LABELS[level]}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: '#e2e8f0', border: '2px dashed #94a3b8' }} />
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Locked</span>
        </div>
      </div>

      {/* Prerequisite detail panel */}
      {selectedConcept && (() => {
        const prereqStatus = getPrerequisiteStatus(selectedConcept.conceptId);
        return (
          <div style={{
            padding: 16, borderRadius: 12, background: '#fff7ed', border: '2px solid #fed7aa',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#9a3412' }}>
                Unlock: {selectedConcept.label}
              </h4>
              <button type="button" onClick={() => setSelectedConcept(null)} style={{
                background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9a3412',
              }}>x</button>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#c2410c' }}>
              Master these prerequisites first ({prereqStatus.met}/{prereqStatus.total} complete):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {prereqStatus.prereqs.map((p) => {
                const concept = allConcepts.find((c) => c.conceptId === p.conceptId);
                return (
                  <div key={p.conceptId} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    borderRadius: 8, background: p.met ? '#f0fdf4' : '#fff',
                    border: p.met ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                  }}>
                    <span style={{ fontSize: 14 }}>{p.met ? '\u2705' : '\uD83D\uDD12'}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                      {concept?.label || p.conceptId}
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                      background: MASTERY_COLORS[p.level] + '20', color: MASTERY_COLORS[p.level],
                    }}>{MASTERY_LABELS[p.level]}</span>
                    {!p.met && concept && (
                      <button type="button" onClick={() => { setSelectedConcept(null); onConceptClick?.(concept); }} style={{
                        padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 700,
                        background: '#2563eb', color: '#fff', cursor: 'pointer',
                      }}>Practice</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Domains */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {domains.map((domain) => {
          const concepts = safeConceptsByDomain[domain.id] || [];
          if (concepts.length === 0) return null;

          const mastered = concepts.filter((c) => masteryFn(c.conceptId) === 'mastered').length;
          const total = concepts.length;
          const domainProgress = total > 0 ? Math.round((mastered / total) * 100) : 0;

          const firstUnlocked = concepts.find((c) => isConceptUnlocked(c.conceptId));
          const firstConcept = concepts[0];
          const handleDomainHeaderClick = () => {
            if (firstUnlocked) {
              onConceptClick?.(firstUnlocked);
            } else if (firstConcept) {
              setSelectedConcept(firstConcept);
            }
          };

          return (
            <div key={domain.id} style={{
              background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
              overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <button
                type="button"
                onClick={handleDomainHeaderClick}
                style={{
                  width: '100%', padding: '14px 18px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  border: 'none', borderBottom: '1px solid #e2e8f0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit',
                }}
                aria-label={`${domain.label}. ${firstUnlocked ? 'Click to practice' : total > 0 ? 'Click to see prerequisites' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{domain.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{domain.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 80, height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${domainProgress}%`, borderRadius: 3,
                      background: domainProgress >= 80 ? '#22c55e' : domainProgress >= 40 ? '#3b82f6' : '#f59e0b',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: domainProgress >= 80 ? '#22c55e' : '#64748b' }}>
                    {mastered}/{total}
                  </span>
                </div>
              </button>

              {viewMode === 'graph' ? (
                <DomainGraph
                  concepts={concepts}
                  allConcepts={allConcepts}
                  masteryFn={masteryFn}
                  onConceptClick={handleConceptClick}
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 16 }}>
                  {concepts.map((c) => {
                    const level = masteryFn(c.conceptId);
                    const color = MASTERY_COLORS[level];
                    const unlocked = isConceptUnlocked(c.conceptId);
                    return (
                      <button key={c.conceptId} type="button" onClick={() => handleConceptClick(c)} style={{
                        padding: '10px 14px', borderRadius: 10,
                        border: unlocked ? `2px solid ${color}` : '2px dashed #cbd5e1',
                        background: unlocked ? color + '12' : '#f8fafc',
                        cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 600,
                        color: unlocked ? '#0f172a' : '#94a3b8',
                        opacity: unlocked ? 1 : 0.7, minWidth: 140, transition: 'all 0.15s',
                      }}
                        onMouseEnter={(e) => { if (unlocked) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${color}30`; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          {!unlocked && <span style={{ fontSize: 11 }}>{'\uD83D\uDD12'}</span>}
                          <span style={{ width: 8, height: 8, borderRadius: 4, background: unlocked ? color : '#cbd5e1' }} />
                          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{c.standardCode}</span>
                        </div>
                        <div>{c.label}</div>
                        <div style={{ fontSize: 11, color: unlocked ? color : '#94a3b8', fontWeight: 700, marginTop: 2 }}>
                          {unlocked ? MASTERY_LABELS[level] : 'Locked'}
                        </div>
                      </button>
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

function DomainGraph({ concepts, allConcepts, masteryFn, onConceptClick }) {
  const containerRef = useRef(null);

  const { nodes, edges } = useMemo(() => {
    const conceptIds = new Set(concepts.map((c) => c.conceptId));
    const nodesMap = {};
    const col = {};
    const visited = new Set();

    function getDepth(cid, seen = new Set()) {
      if (seen.has(cid)) return 0;
      seen.add(cid);
      const prereqs = getPrerequisites(cid).filter((p) => conceptIds.has(p));
      if (prereqs.length === 0) return 0;
      return 1 + Math.max(...prereqs.map((p) => getDepth(p, seen)));
    }

    const depthMap = {};
    for (const c of concepts) depthMap[c.conceptId] = getDepth(c.conceptId);
    const maxDepth = Math.max(0, ...Object.values(depthMap));

    const colCounters = {};
    const sorted = [...concepts].sort((a, b) => depthMap[a.conceptId] - depthMap[b.conceptId]);
    for (const c of sorted) {
      const d = depthMap[c.conceptId];
      colCounters[d] = (colCounters[d] || 0) + 1;
    }

    const colIdx = {};
    const colCurrent = {};
    for (const c of sorted) {
      const d = depthMap[c.conceptId];
      colCurrent[d] = (colCurrent[d] || 0);
      colIdx[c.conceptId] = colCurrent[d];
      colCurrent[d]++;
      const totalInCol = colCounters[d];
      nodesMap[c.conceptId] = {
        concept: c,
        x: 40 + d * 180,
        y: 30 + colIdx[c.conceptId] * 62 + (concepts.length > 6 ? 0 : (6 - totalInCol) * 31),
      };
    }

    const edgeList = [];
    for (const c of concepts) {
      const prereqs = getPrerequisites(c.conceptId).filter((p) => conceptIds.has(p));
      for (const p of prereqs) {
        if (nodesMap[p] && nodesMap[c.conceptId]) {
          edgeList.push({ from: p, to: c.conceptId });
        }
      }
    }

    return { nodes: Object.values(nodesMap), edges: edgeList };
  }, [concepts]);

  const svgW = Math.max(400, (nodes.length > 0 ? Math.max(...nodes.map((n) => n.x)) : 0) + 200);
  const svgH = Math.max(150, (nodes.length > 0 ? Math.max(...nodes.map((n) => n.y)) : 0) + 70);
  const nodeW = 150;
  const nodeH = 48;

  const nodeMap = {};
  for (const n of nodes) nodeMap[n.concept.conceptId] = n;

  return (
    <div ref={containerRef} style={{ overflow: 'auto', padding: '12px 8px' }}>
      <svg width={svgW} height={svgH} style={{ display: 'block' }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-green" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="#22c55e" />
          </marker>
        </defs>

        {edges.map((e, i) => {
          const from = nodeMap[e.from];
          const to = nodeMap[e.to];
          if (!from || !to) return null;
          const x1 = from.x + nodeW;
          const y1 = from.y + nodeH / 2;
          const x2 = to.x;
          const y2 = to.y + nodeH / 2;
          const fromLevel = masteryFn(e.from);
          const met = fromLevel === 'mastered' || fromLevel === 'proficient';
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={met ? '#22c55e' : '#cbd5e1'} strokeWidth={met ? 2.5 : 1.5}
              strokeDasharray={met ? 'none' : '6 4'}
              markerEnd={met ? 'url(#arrow-green)' : 'url(#arrow)'}
            />
          );
        })}

        {nodes.map((n) => {
          const level = masteryFn(n.concept.conceptId);
          const color = MASTERY_COLORS[level];
          const unlocked = isConceptUnlocked(n.concept.conceptId);
          return (
            <g key={n.concept.conceptId} style={{ cursor: 'pointer' }} onClick={() => onConceptClick(n.concept)}>
              <rect x={n.x} y={n.y} width={nodeW} height={nodeH} rx={10} ry={10}
                fill={unlocked ? color + '18' : '#f8fafc'}
                stroke={unlocked ? color : '#cbd5e1'}
                strokeWidth={unlocked ? 2 : 1.5}
                strokeDasharray={unlocked ? 'none' : '6 4'}
              />
              {!unlocked && (
                <text x={n.x + nodeW - 16} y={n.y + 16} fontSize={11} textAnchor="middle">{'\uD83D\uDD12'}</text>
              )}
              <text x={n.x + 12} y={n.y + 19} fontSize={12} fontWeight={700} fill={unlocked ? '#0f172a' : '#94a3b8'}>
                {n.concept.label.length > 18 ? n.concept.label.slice(0, 17) + '\u2026' : n.concept.label}
              </text>
              <text x={n.x + 12} y={n.y + 35} fontSize={10} fill={unlocked ? color : '#94a3b8'} fontWeight={600}>
                {n.concept.standardCode} · {unlocked ? MASTERY_LABELS[level] : 'Locked'}
              </text>
              <circle cx={n.x + nodeW - 14} cy={n.y + 34} r={5} fill={unlocked ? color : '#cbd5e1'} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
