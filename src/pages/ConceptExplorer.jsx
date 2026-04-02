/**
 * Concept Explorer — Interactive drill focusing on one concept.
 * Click-to-reveal cards: Key Idea, Worked Example, Watch Out.
 */
import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getMicroConcept } from '../data/microConcepts';
import { getCompName } from '../data/texes-questions';
import { formatMathHtml, conceptToBulletHtml } from '../utils/mathFormat';
import { sanitizeHtml } from '../utils/sanitize';
import useGameReturn from '../hooks/useGameReturn';

function gradeToExamId(grade) {
  if (grade === 'grade7-12') return 'math712';
  if (grade === 'grade4-8') return 'math48';
  if (grade === 'calculus') return 'calculus';
  if (grade === 'grade-ec6') return 'ec6';
  if (grade === 'grade-ec6-ela') return 'ec6_ela';
  if (grade === 'grade-ec6-science') return 'ec6_science';
  if (grade === 'grade-ec6-social') return 'ec6_social';
  if (grade === 'grade-ec6-full') return 'ec6_full';
  return grade || 'math712';
}

export default function ConceptExplorer() {
  const [searchParams] = useSearchParams();
  const teks = searchParams.get('teks') || '';
  const grade = searchParams.get('grade') || 'grade7-12';
  const comp = searchParams.get('comp') || '';
  const label = searchParams.get('label') || '';
  const { returnUrl, goBack } = useGameReturn();

  const examId = gradeToExamId(grade);
  const microConcept = getMicroConcept(examId, comp, teks);
  const conceptTitle = microConcept?.title || comp ? getCompName(comp) : label || 'Concept';

  const [revealed, setRevealed] = useState({ keyIdea: false, example: false, watchOut: false });
  const [allRevealed, setAllRevealed] = useState(false);

  const toggle = (key) => {
    setRevealed((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (next.keyIdea && next.example && next.watchOut) setAllRevealed(true);
      return next;
    });
  };

  const revealAll = () => {
    setRevealed({ keyIdea: true, example: true, watchOut: true });
    setAllRevealed(true);
  };

  const cards = [
    {
      key: 'keyIdea',
      label: 'Key idea',
      content: microConcept?.conceptText || 'No concept text available.',
      icon: '💡',
      color: '#2563eb',
    },
    {
      key: 'example',
      label: 'Worked example',
      content: microConcept?.workedExample || 'No worked example available.',
      icon: '✏️',
      color: '#059669',
    },
    {
      key: 'watchOut',
      label: 'Watch out',
      content: microConcept?.misconception || 'No common misconception noted.',
      icon: '⚠️',
      color: '#d97706',
    },
  ];

  const practiceLoopUrl = (() => {
    const p = new URLSearchParams();
    p.set('phase', 'diagnostic');
    if (teks) p.set('teks', teks);
    if (label) p.set('label', label);
    if (grade) p.set('grade', grade);
    if (comp) p.set('comp', comp);
    return `/practice-loop?${p.toString()}`;
  })();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', padding: '24px 16px 48px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#00f5ff', margin: '0 0 8px', textShadow: '0 0 20px rgba(0,245,255,0.3)' }}>
            Interactive concept drill
          </h1>
          <p style={{ fontSize: 16, color: '#94a3b8', margin: 0 }}>{conceptTitle}</p>
        </div>

        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20, textAlign: 'center' }}>
          Click each card to reveal. Focus on one concept at a time.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {cards.map(({ key, label, content, icon, color }) => (
            <div
              key={key}
              onClick={() => toggle(key)}
              style={{
                background: revealed[key] ? 'rgba(15, 23, 42, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                border: `2px solid ${revealed[key] ? color : 'rgba(148, 163, 184, 0.3)'}`,
                borderRadius: 14,
                padding: revealed[key] ? 18 : 20,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: revealed[key] ? `0 0 20px ${color}40` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: revealed[key] ? 12 : 0 }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: revealed[key] ? color : '#94a3b8' }}>{label}</span>
                {!revealed[key] && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>Click to reveal</span>}
              </div>
              {revealed[key] && (
                <>
                  <div
                    style={{ fontSize: 15, color: '#e2e8f0', lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(key === 'keyIdea' ? conceptToBulletHtml(content) : formatMathHtml(content)) }}
                  />
                  {key === 'keyIdea' && microConcept?.illustrationHtml && (
                    <div
                      style={{ marginTop: 12 }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(microConcept.illustrationHtml) }}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {!allRevealed && (
          <button
            type="button"
            onClick={revealAll}
            style={{
              width: '100%', marginTop: 20, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              background: 'rgba(0, 245, 255, 0.15)', color: '#00f5ff', border: '2px solid rgba(0, 245, 255, 0.5)',
              borderRadius: 12,
            }}
          >
            Reveal all
          </button>
        )}

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {returnUrl && (
            <button
              type="button"
              onClick={goBack}
              style={{
                display: 'block', width: '100%', padding: '14px 24px', fontSize: 16, fontWeight: 700, textAlign: 'center',
                background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', border: '2px solid #34d399', borderRadius: 12, boxShadow: '0 0 14px rgba(5,150,105,0.35)', textDecoration: 'none', cursor: 'pointer',
              }}
            >
              Continue
            </button>
          )}
          <Link
            to={practiceLoopUrl}
            style={{
              display: 'block', padding: '14px 24px', fontSize: 16, fontWeight: 700, textAlign: 'center',
              background: 'linear-gradient(135deg, #00f5ff, #00bb99)', color: '#0f172a', borderRadius: 12, textDecoration: 'none',
            }}
          >
            Practice this concept →
          </Link>
          <Link
            to="/texes-prep"
            style={{
              display: 'block', padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#94a3b8', textAlign: 'center', textDecoration: 'none',
            }}
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}
