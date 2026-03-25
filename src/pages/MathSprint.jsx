import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { recordResult } from '../utils/conceptTracker';
import { getAllConcepts } from '../data/taxonomy';
import { saveGameResult, findMatchingAssignment } from '../utils/storage';
import { sanitizeReturnUrl } from '../utils/sanitize';
import GameReview from '../components/GameReview';
import SkeletonLoader from '../components/SkeletonLoader';
import LoopContinueButton from '../components/LoopContinueButton';

const NAV_HEIGHT = 44;
const BOTTOM_BAR_HEIGHT = 64;

// Map TEKS code → conceptId(s) for tracking (Grade 1, 2, 3, 4, 5, 6)
const teksToConceptMap = {};
for (const gradeId of ['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6', 'grade7', 'grade8', 'grade4-8', 'grade7-12', 'grade9', 'grade10', 'grade11']) {
  for (const concept of getAllConcepts(gradeId)) {
    const code = concept.standardCode;
    if (!teksToConceptMap[code]) teksToConceptMap[code] = [];
    teksToConceptMap[code].push(concept.conceptId);
  }
}

/** Derive gradeId from TEKS code (e.g. "4.2A" → "grade4", "A.2A" → "grade9", "G.7A" → "grade10") */
function gradeFromTeks(teks) {
  if (!teks || typeof teks !== 'string') return 'grade3';
  if (teks.startsWith('A.')) return 'grade9'; // Algebra I = typical Grade 9
  if (teks.startsWith('G.')) return 'grade10'; // Geometry = typical Grade 10
  if (teks.startsWith('2A.')) return 'grade11'; // Algebra II = typical Grade 11
  const m = teks.match(/^(\d+)\./);
  if (m) {
    const g = parseInt(m[1], 10);
    if (g === 1) return 'grade1';
    if (g === 2) return 'grade2';
    if (g === 4) return 'grade4';
    if (g === 5) return 'grade5';
    if (g === 6) return 'grade6';
    if (g === 7) return 'grade7';
    if (g === 8) return 'grade8';
  }
  return 'grade3';
}

/* ── Explanation generators for Grade 3 math TEKS ── */
// These generate step-by-step explanations that QBotExplainer can detect patterns from.
// For arithmetic questions, QBotExplainer will auto-detect and generate visual chalkboard steps.
// For other types, we provide explicit "Step N:" formatted text.

const getSprintExplanation = (q) => {
  const question = q.question || '';
  const answer = q.correctAnswer || '';

  // Expanded form / place value sums: "3000 + 500 + 80 + 2 = ?" — let QBotExplainer handle
  const expandedSum = question.match(/^(\d+(?:\s*\+\s*\d+){2,})\s*=\s*\?/);
  if (expandedSum) {
    const parts = expandedSum[1].split('+').map(s => parseInt(s.trim()));
    const allPV = parts.every(p => {
      if (p === 0) return true;
      const s = String(p);
      return s[0] !== '0' && s.slice(1).split('').every(c => c === '0');
    });
    if (allPV) return null;
  }

  // Arithmetic: +, -, ×, ÷ — let QBotExplainer handle these with its smart parsers
  const arithMatch = question.match(/(\d[\d,]*)\s*([+\-×÷\u2212xX*\/])\s*(\d[\d,]*)/);
  if (arithMatch) {
    const n1 = parseInt(arithMatch[1].replace(/,/g, ''));
    const op = arithMatch[2];
    const n2 = parseInt(arithMatch[3].replace(/,/g, ''));
    if (['+'].includes(op)) {
      return `Step 1: Line up the numbers by place value: ${n1} and ${n2}.\nStep 2: Add column by column starting from the ones place. If a column totals 10 or more, regroup 1 to the next column.\nStep 3: ${n1} + ${n2} = ${n1 + n2}.\nStep 4: The answer is ${answer}.`;
    }
    if (['-', '\u2212'].includes(op)) {
      return `Step 1: Line up the numbers: ${n1} on top, ${n2} below.\nStep 2: Subtract column by column starting from the ones. If the top digit is smaller, regroup (trade) 1 from the next place.\nStep 3: ${n1} \u2212 ${n2} = ${n1 - n2}.\nStep 4: The answer is ${answer}.`;
    }
    if (['×', 'x', 'X', '*'].includes(op)) {
      const product = n1 * n2;
      return `Step 1: ${n1} × ${n2} means "${n1} groups of ${n2}.".\nStep 2: You can think of it as adding ${n2} a total of ${n1} times.\nStep 3: ${n1} × ${n2} = ${product}.\nStep 4: The answer is ${answer}.`;
    }
    if (['÷', '/'].includes(op) && n2 !== 0) {
      const quotient = Math.floor(n1 / n2);
      const remainder = n1 % n2;
      return `Step 1: ${n1} ÷ ${n2} means "how many groups of ${n2} fit into ${n1}?".\nStep 2: Think: ? × ${n2} = ${n1}.\nStep 3: ${quotient} × ${n2} = ${quotient * n2}${remainder ? ` with ${remainder} left over` : ''}.\nStep 4: The answer is ${answer}.`;
    }
  }

  // Rounding: QBotExplainer will detect "round X to the nearest Y" automatically
  if (question.match(/round/i)) {
    return null; // Let QBotExplainer's smart rounding generator handle it
  }

  // Fraction comparison
  const fracMatch = question.match(/(\d+)\s*\/\s*(\d+)/);
  if (fracMatch) {
    return null; // Let QBotExplainer's fraction generator handle it
  }

  // Perimeter/area
  if (question.match(/perimeter|area/i)) {
    return null; // Let QBotExplainer's perimeter generator handle it
  }

  // Place value / digit identification
  if (question.match(/digit.*place|place.*value|expanded\s+form/i)) {
    return null; // Let QBotExplainer's place value generator handle it
  }

  // Compare / order numbers
  if (question.match(/symbol|compare|___/i) || question.match(/>\s|<\s|=/)) {
    return null; // Let QBotExplainer's comparison generator handle it
  }

  // Shapes, geometry, measurement, data, financial literacy
  if (question.match(/faces|edges|vertices|sides|capacity|weight|how many students|bar graph|credit|saving|income|scarcity|spending/i)) {
    return null; // Let QBotExplainer's smart generators handle these
  }

  // Default: let QBotExplainer's smart generator try to explain
  return null;
};

const MathSprint = () => {
  const [searchParams] = useSearchParams();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState(null);

  const teks = searchParams.get('teks') || '';
  const label = searchParams.get('label') || '';
  const desc = searchParams.get('desc') || '';
  const conceptParam = searchParams.get('concept') || '';
  const gradeParam = searchParams.get('grade') || '';
  const mode = searchParams.get('mode') || ''; // 'remedial' = easier to teach; 'adaptive' = slightly harder
  const fromParams = searchParams.get('returnUrl') || '';
  const fromStorage = (() => { try { return sessionStorage.getItem('practice-loop-return') || ''; } catch { return ''; } })();
  const buildFallback = () => {
    if (!teks) return '';
    const p = new URLSearchParams();
    p.set('phase', 'reminder');
    p.set('teks', teks);
    if (label) p.set('label', label);
    p.set('grade', gradeParam || 'grade3');
    return `/practice-loop?${p.toString()}`;
  };
  const returnUrl = sanitizeReturnUrl(fromParams) || sanitizeReturnUrl(fromStorage) || sanitizeReturnUrl(buildFallback());
  const navigate = useNavigate();
  useEffect(() => {
    if (fromParams) try { sessionStorage.setItem('practice-loop-return', fromParams); } catch (_) {}
  }, [fromParams]);

  // Resolve student identity: URL params first, then fall back to saved session
  const session = (() => {
    try {
      const saved = localStorage.getItem('quantegy-student-session');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })();
  const studentId = searchParams.get('sid') || session?.studentId || '';
  const assignmentId = searchParams.get('aid') || '';
  const classId = searchParams.get('cid') || session?.classId || '';

  // Build iframe src with optional focus params
  let iframeSrc = '/games/math-sprint.html';
  const iframeParams = new URLSearchParams();
  if (teks) iframeParams.set('teks', teks);
  if (label) iframeParams.set('label', label);
  if (desc) iframeParams.set('desc', desc);
  if (gradeParam) iframeParams.set('grade', gradeParam);
  if (mode) iframeParams.set('mode', mode);
  if (returnUrl) iframeParams.set('from', 'loop'); // hide game footer so parent "Continue" bar is the only bottom CTA
  if (iframeParams.toString()) iframeSrc += '?' + iframeParams.toString();

  // If iframe doesn't fire onLoad within 5s (e.g. wrong content or load error), show area anyway and offer fallback
  useEffect(() => {
    const t = setTimeout(() => {
      setIframeLoaded((prev) => (prev ? prev : true));
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'mathSprintResult') {
        const { score, total, pts, avg, streak, diff, teks: playedTeks, questions } = event.data;

        // Save summary to localStorage (legacy)
        const legacyResults = JSON.parse(localStorage.getItem('mathSprintResults') || '[]');
        legacyResults.push({
          date: new Date().toISOString(),
          score, total, points: pts, avgTime: avg, bestStreak: streak,
          topic: diff, teks: playedTeks || [], gameId: 'math-sprint',
        });
        localStorage.setItem('mathSprintResults', JSON.stringify(legacyResults));

        // Save result for gradebook
        if (studentId) {
          let resolvedAid = assignmentId;
          if (!resolvedAid && classId) {
            const match = findMatchingAssignment(classId, 'math-sprint', playedTeks?.[0] || teks);
            if (match) resolvedAid = match.id;
          }
          const pctScore = total > 0 ? Math.round((score / total) * 100) : 0;
          const resolvedGrade = gradeFromTeks(playedTeks?.[0] || teks);
          saveGameResult({
            studentId,
            assignmentId: resolvedAid || `unassigned-${Date.now()}`,
            classId: classId || '',
            gameId: 'math-sprint',
            teks: playedTeks?.join(',') || teks,
            score: pctScore, correct: score, total,
            time: avg ? Math.round(avg * total) : 0,
            grade: resolvedGrade,
          });
        }

        // Build review data from enriched question details
        if (questions && Array.isArray(questions)) {
          const reviewItems = questions.map((q) => {
            const item = {
              question: q.question || `TEKS ${q.teks} question`,
              correctAnswer: q.correctAnswer || '—',
              userAnswer: q.userAnswer || '—',
              isCorrect: q.correct === true,
              teks: q.teks,
            };
            item.explanation = getSprintExplanation(item);
            return item;
          });
          setReviewData({ score, total, time: avg ? Math.round(avg * total) : 0, questions: reviewItems });

          // Record per-question results to concept tracker
          for (const q of questions) {
            const conceptIds = teksToConceptMap[q.teks] || [];
            if (conceptParam && conceptIds.includes(conceptParam)) {
              recordResult(conceptParam, { correct: q.correct, time: q.time, gameId: 'math-sprint' });
            } else {
              for (const cid of conceptIds) {
                recordResult(cid, { correct: q.correct, time: q.time, gameId: 'math-sprint' });
              }
            }
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [conceptParam, studentId, assignmentId, classId, teks]);

  return (
    <div style={{ background: '#0B1A3B', height: '100vh', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        flexShrink: 0,
        height: NAV_HEIGHT, padding: '0 20px',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(107,184,255,0.15)', boxSizing: 'border-box',
      }}>
        <Link to="/games" style={{ color: '#6BB8FF', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          {'\u2190'} Back
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>
          {teks ? `Focused: TEKS ${teks}` : 'TEKS-Aligned Math Sprint'}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {!iframeLoaded && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6BB8FF', fontFamily: 'sans-serif', zIndex: 5,
          }}>
            <SkeletonLoader variant="card" width={200} height={80} />
          </div>
        )}
        <iframe
          src={iframeSrc}
          title="Q-Bot Math Sprint"
          onLoad={() => setIframeLoaded(true)}
          style={{
            display: 'block', width: '100%', height: '100%', minHeight: 360,
            border: 'none', background: '#0B1A3B',
            opacity: iframeLoaded ? 1 : 0, transition: 'opacity 0.3s ease',
          }}
          allow="clipboard-write"
        />
        {iframeLoaded && !returnUrl && (
          <div style={{
            position: 'absolute', top: 8, right: 8, zIndex: 4,
            fontSize: 11, color: 'rgba(255,255,255,0.5)',
          }}>
            <a href={iframeSrc} target="_blank" rel="noopener noreferrer" style={{ color: '#6BB8FF', textDecoration: 'none' }}>
              Open in new tab
            </a>
          </div>
        )}
        {/* Hide occasional iframe seam/artifact above the bottom action bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 4,
            background: '#0B1A3B',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
      </div>

      {/* Bottom bar: always show Next when coming from practice loop so it's never missing */}
      <div style={{
        flexShrink: 0,
        height: BOTTOM_BAR_HEIGHT,
        padding: '0 16px',
        background: 'rgba(0,0,0,0.4)',
        borderTop: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        {returnUrl ? (
          <>
            <LoopContinueButton
              fixed={false}
              label="Continue"
              onClick={() => navigate(returnUrl)}
            />
            {reviewData && !showReview && (
              <button type="button" onClick={() => setShowReview(true)} style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
                border: '2px solid #fbbf24', borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>📝</span> Review Answers
              </button>
            )}
          </>
        ) : (
          <>
            {reviewData && !showReview && (
              <button type="button" onClick={() => setShowReview(true)} style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
                border: '2px solid #fbbf24', borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>📝</span> Review Answers
              </button>
            )}
            <Link to="/games" style={{
              padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'rgba(255,255,255,0.1)', color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
              textDecoration: 'none', display: 'inline-block',
            }}>
              Back
            </Link>
          </>
        )}
      </div>

      {/* ── Review Overlay ── */}
      {showReview && reviewData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 100,
          display: 'flex', justifyContent: 'center', overflowY: 'auto',
        }}>
          <div style={{
            width: '100%', maxWidth: 650, margin: '20px auto', padding: '24px',
            background: '#fff', borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            maxHeight: 'calc(100vh - 40px)', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 style={{ margin: 0, fontSize: 20, color: '#0f172a' }}>Math Sprint Review</h2>
              <button type="button" onClick={() => setShowReview(false)} style={{
                padding: '6px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: '#f1f5f9', color: '#475569', border: '1px solid #d1d5db', borderRadius: 8,
              }}>
                Close
              </button>
            </div>
            <GameReview
              questions={reviewData.questions}
              score={reviewData.score}
              total={reviewData.total}
              time={reviewData.time}
              gameTitle="Math Sprint"
              onPlayAgain={returnUrl ? undefined : () => { setShowReview(false); setReviewData(null); }}
              continueUrl={returnUrl || undefined}
              continueLabel="Continue"
              onBack={() => setShowReview(false)}
              backLabel="Back"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MathSprint;
