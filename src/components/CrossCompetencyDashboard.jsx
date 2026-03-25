/**
 * Cross-Competency Dashboard — Mastery by domain across all concepts
 * Learner-centric: shows competency coverage, cross-class portfolio,
 * and unlocked/locked skill breakdown per domain.
 */
import React, { useState, useMemo } from 'react';
import { DOMAINS } from '../data/taxonomy';
import { getMasteryLevel, MASTERY_COLORS, MASTERY_LABELS, isConceptUnlocked, getStudentPortfolio } from '../utils/conceptTracker';

export default function CrossCompetencyDashboard({
  conceptsByDomain,
  getMasteryLevel: getLevel,
  gradeId,
  showPortfolio = true,
  onConceptClick,
}) {
  const domains = DOMAINS[gradeId] || DOMAINS.algebra || [];
  const masteryFn = getLevel || getMasteryLevel;
  const [expanded, setExpanded] = useState(null);
  const portfolio = useMemo(() => showPortfolio ? getStudentPortfolio() : null, [showPortfolio]);

  const domainStats = domains.map((domain) => {
    const rawConcepts = conceptsByDomain?.[domain.id] || [];
    const concepts = rawConcepts.filter((c) => c && c.conceptId);
    const mastered = concepts.filter((c) => masteryFn(c.conceptId) === 'mastered').length;
    const proficient = concepts.filter((c) => masteryFn(c.conceptId) === 'proficient').length;
    const developing = concepts.filter((c) => masteryFn(c.conceptId) === 'developing').length;
    const struggling = concepts.filter((c) => masteryFn(c.conceptId) === 'struggling').length;
    const notStarted = concepts.filter((c) => masteryFn(c.conceptId) === 'not-started').length;
    const unlocked = concepts.filter((c) => isConceptUnlocked(c.conceptId)).length;
    const locked = concepts.length - unlocked;
    const total = concepts.length;
    const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
    const progressPct = total > 0 ? Math.round(((mastered + proficient) / total) * 100) : 0;

    return { domain, total, mastered, proficient, developing, struggling, notStarted, unlocked, locked, pct, progressPct, concepts };
  });

  const overallMastered = domainStats.reduce((s, d) => s + d.mastered, 0);
  const overallTotal = domainStats.reduce((s, d) => s + d.total, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallMastered / overallTotal) * 100) : 0;

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
      padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
        Competency Tracker
      </h3>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
        Cross-domain mastery tracking. {overallMastered}/{overallTotal} skills mastered ({overallPct}%).
      </p>

      {/* Overall progress ring */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
          <svg width={56} height={56} viewBox="0 0 56 56">
            <circle cx={28} cy={28} r={24} fill="none" stroke="#e2e8f0" strokeWidth={5} />
            <circle cx={28} cy={28} r={24} fill="none"
              stroke={overallPct >= 80 ? '#22c55e' : overallPct >= 40 ? '#3b82f6' : '#f59e0b'}
              strokeWidth={5} strokeLinecap="round"
              strokeDasharray={`${overallPct * 1.508} ${150.8 - overallPct * 1.508}`}
              transform="rotate(-90 28 28)"
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#0f172a',
          }}>{overallPct}%</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Overall Mastery</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {overallMastered} mastered across {domains.length} domains
          </div>
        </div>
      </div>

      {/* Cross-class portfolio (if multi-class) */}
      {portfolio && portfolio.classes.length > 1 && (
        <div style={{
          padding: 12, borderRadius: 10, background: '#faf5ff', border: '1px solid #e9d5ff',
          marginBottom: 14,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#7c3aed', marginBottom: 6 }}>
            Cross-Class Portfolio
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {portfolio.classes.map((cls) => (
              <div key={cls.classId} style={{
                padding: '6px 12px', borderRadius: 8, background: '#fff',
                border: '1px solid #e9d5ff', fontSize: 12,
              }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{cls.className}</div>
                <div style={{ color: '#7c3aed', fontWeight: 600 }}>
                  {cls.masteredCount}/{cls.totalConcepts} mastered · {cls.accuracy}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domain bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {domainStats.map(({ domain, total, mastered, proficient, developing, struggling, notStarted, unlocked, locked, pct, progressPct, concepts }) => (
          <div key={domain.id}>
            <div style={{
              padding: '12px 16px', background: '#f8fafc', borderRadius: 10,
              border: expanded === domain.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
              cursor: 'pointer', transition: 'border-color 0.15s',
            }} onClick={() => setExpanded(expanded === domain.id ? null : domain.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                  {domain.icon} {domain.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {locked > 0 && (
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                      {'\uD83D\uDD12'} {locked}
                    </span>
                  )}
                  <span style={{
                    fontSize: 14, fontWeight: 800,
                    color: pct >= 80 ? '#22c55e' : pct >= 50 ? '#3b82f6' : '#f59e0b',
                  }}>
                    {pct}%
                  </span>
                </div>
              </div>
              {/* Stacked progress bar */}
              <div style={{ height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden', display: 'flex' }}>
                {mastered > 0 && <div style={{ width: `${(mastered / total) * 100}%`, background: '#22c55e', height: '100%' }} />}
                {proficient > 0 && <div style={{ width: `${(proficient / total) * 100}%`, background: '#3b82f6', height: '100%' }} />}
                {developing > 0 && <div style={{ width: `${(developing / total) * 100}%`, background: '#f59e0b', height: '100%' }} />}
                {struggling > 0 && <div style={{ width: `${(struggling / total) * 100}%`, background: '#ef4444', height: '100%' }} />}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11, color: '#64748b' }}>
                <span style={{ color: '#22c55e' }}>{mastered} mastered</span>
                <span style={{ color: '#3b82f6' }}>{proficient} proficient</span>
                <span style={{ color: '#f59e0b' }}>{developing} developing</span>
                {locked > 0 && <span style={{ color: '#94a3b8' }}>{locked} locked</span>}
              </div>
            </div>

            {/* Expanded: show individual concepts — clickable when onConceptClick provided */}
            {expanded === domain.id && (
              <div style={{ padding: '8px 0 0 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(concepts || []).filter((c) => c && c.conceptId).map((c) => {
                  const level = masteryFn(c.conceptId);
                  const color = MASTERY_COLORS[level] || '#94a3b8';
                  const unl = isConceptUnlocked(c.conceptId);
                  const canLaunch = onConceptClick && unl;
                  const baseStyle = {
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                    borderRadius: 6, fontSize: 12, background: unl ? '#fff' : '#f8fafc',
                    opacity: unl ? 1 : 0.65,
                  };
                  if (canLaunch) {
                    baseStyle.width = '100%';
                    baseStyle.textAlign = 'left';
                    baseStyle.cursor = 'pointer';
                    baseStyle.border = 'none';
                    baseStyle.font = 'inherit';
                    baseStyle.transition = 'background 0.15s';
                  }
                  return (
                    <div
                      key={c.conceptId}
                      role={canLaunch ? 'button' : undefined}
                      tabIndex={canLaunch ? 0 : undefined}
                      onClick={canLaunch ? (e) => { e.stopPropagation(); onConceptClick(c); } : undefined}
                      onKeyDown={canLaunch ? (e) => { if ((e.key === 'Enter' || e.key === ' ') && c?.conceptId) { e.preventDefault(); onConceptClick(c); } } : undefined}
                      style={baseStyle}
                      onMouseEnter={canLaunch ? (e) => { e.currentTarget.style.background = '#eff6ff'; } : undefined}
                      onMouseLeave={canLaunch ? (e) => { e.currentTarget.style.background = '#fff'; } : undefined}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: unl ? color : '#cbd5e1' }} />
                      <span style={{ flex: 1, fontWeight: 600, color: unl ? '#0f172a' : '#94a3b8' }}>
                        {!unl && '\uD83D\uDD12 '}{c.label}
                      </span>
                      <span style={{
                        padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700,
                        background: unl ? color + '18' : '#f1f5f9', color: unl ? color : '#94a3b8',
                      }}>{unl ? (MASTERY_LABELS[level] || level || '—') : 'Locked'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
