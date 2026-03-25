/**
 * Learning Path — Personalised pathway with mastery-based progression
 * Prerequisite-aware ordering; AI-powered pathway generation;
 * shows unlock gates so students know what to do next.
 */
import React, { useState } from 'react';
import { getMasteryLevel, MASTERY_COLORS, MASTERY_LABELS, isConceptUnlocked, getPrerequisiteStatus } from '../utils/conceptTracker';
import { getPrerequisites } from '../data/taxonomy';

export default function LearningPath({
  recommendations,
  allConcepts,
  onLaunch,
  maxItems = 6,
  gradeId,
  studentStats,
}) {
  const [aiPathway, setAiPathway] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiPath, setShowAiPath] = useState(false);

  // Build prerequisite-aware path: locked items are shown but gated
  const pathItems = recommendations.slice(0, maxItems).map((rec) => {
    const concept = allConcepts.find((c) => c.conceptId === rec.conceptId);
    if (!concept) return null;
    const level = getMasteryLevel(concept.conceptId);
    const unlocked = isConceptUnlocked(concept.conceptId);
    const prereqStatus = getPrerequisiteStatus(concept.conceptId);
    return { ...concept, level, rec, unlocked, prereqStatus };
  }).filter(Boolean);

  // Sort: unlocked first, then by priority
  pathItems.sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return 0;
  });

  const generateAiPathway = async () => {
    setAiLoading(true);
    try {
      const masteryData = allConcepts.slice(0, 20).map((c) => {
        const level = getMasteryLevel(c.conceptId);
        return `${c.label} (${c.standardCode}): ${level}`;
      }).join(', ');

      const resp = await fetch('/api/generate-pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeId: gradeId || 'grade3',
          masterySnapshot: masteryData,
          totalAttempts: studentStats?.totalAttempts || 0,
          accuracy: studentStats?.overallAccuracy || 0,
          masteredCount: studentStats?.masteredCount || 0,
          totalConcepts: studentStats?.totalConcepts || 0,
        }),
      });
      const data = await resp.json();
      if (data.pathway) {
        setAiPathway(data.pathway);
        setShowAiPath(true);
      }
    } catch (err) {
      console.error('AI pathway error:', err);
    }
    setAiLoading(false);
  };

  if (pathItems.length === 0) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      borderRadius: 14, border: '1px solid #bae6fd', padding: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#0c4a6e' }}>
            Your Learning Path
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#0369a1' }}>
            Mastery-based progression. Unlock new skills by mastering prerequisites.
          </p>
        </div>
        <button type="button" onClick={generateAiPathway} disabled={aiLoading} style={{
          padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700,
          background: aiLoading ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color: '#fff', cursor: aiLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap',
        }}>
          {aiLoading ? 'Analyzing...' : 'AI Pathway'}
        </button>
      </div>

      {/* AI pathway result */}
      {showAiPath && aiPathway && (
        <div style={{
          margin: '12px 0', padding: 14, borderRadius: 10,
          background: '#faf5ff', border: '1px solid #e9d5ff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#7c3aed' }}>AI-Recommended Pathway</span>
            <button type="button" onClick={() => setShowAiPath(false)} style={{
              background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', color: '#7c3aed',
            }}>x</button>
          </div>
          <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {aiPathway}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {pathItems.map((item, i) => {
          const color = MASTERY_COLORS[item.level];
          const prereqs = getPrerequisites(item.conceptId);
          const hasPrereqs = prereqs.length > 0;

          return (
            <div key={item.conceptId} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', background: item.unlocked ? '#fff' : '#f8fafc',
              borderRadius: 10,
              border: item.unlocked ? `2px solid ${color}40` : '2px dashed #cbd5e1',
              boxShadow: item.unlocked ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
              opacity: item.unlocked ? 1 : 0.75,
            }}>
              {/* Step number */}
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: item.unlocked ? color + '20' : '#e2e8f0',
                color: item.unlocked ? color : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, flexShrink: 0,
              }}>
                {item.unlocked ? i + 1 : '\uD83D\uDD12'}
              </span>

              {/* Concept info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: item.unlocked ? '#0f172a' : '#94a3b8' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {item.standardCode} · {item.unlocked ? MASTERY_LABELS[item.level] : `Unlock: ${item.prereqStatus.met}/${item.prereqStatus.total} prerequisites`}
                  {item.unlocked && item.rec?.accuracy != null && item.rec.attempts > 0 && (
                    <span> · {item.rec.accuracy}%</span>
                  )}
                </div>
                {/* Prerequisite pills */}
                {!item.unlocked && item.prereqStatus.prereqs.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    {item.prereqStatus.prereqs.map((p) => {
                      const pConcept = allConcepts.find((c) => c.conceptId === p.conceptId);
                      return (
                        <span key={p.conceptId} style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                          background: p.met ? '#dcfce7' : '#fef3c7',
                          color: p.met ? '#166534' : '#92400e',
                        }}>
                          {p.met ? '\u2713' : '\u25CB'} {pConcept?.label || p.conceptId.split('-').pop()}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action */}
              {item.unlocked ? (
                <button type="button" onClick={() => onLaunch?.(item)} style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0,
                }}>
                  Practice
                </button>
              ) : (
                <span style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: '#f1f5f9', color: '#94a3b8',
                }}>Locked</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
