import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { saveGameResult, findMatchingAssignment } from '../utils/storage';
import { sanitizeReturnUrl } from '../utils/sanitize';
import GameReview from '../components/GameReview';
import SkeletonLoader from '../components/SkeletonLoader';
import LoopContinueButton from '../components/LoopContinueButton';

const NAV_HEIGHT = 44;
const BOTTOM_BAR = 56;

/* ── Explanation for Q-Blocks math questions ── */
const getQBlocksExplanation = (q) => {
  const expr = (q.question || '').trim();
  if (/Solve:.*x.*=/.test(expr) || /→ x = \?/.test(expr)) {
    return `Isolate x: do the same operation to both sides until you have x = something. The solution is x = ${q.correctAnswer}.`;
  }
  if (expr.includes('+')) {
    const parts = expr.split('+').map(s => s.trim());
    return `Add the numbers: ${parts[0]} + ${parts[1]} = ${q.correctAnswer}. Break them into place values if needed.`;
  }
  if (expr.includes('-') || expr.includes('−')) {
    return `Subtract step by step. Remember to regroup (trade) when the top digit is smaller. The answer is ${q.correctAnswer}.`;
  }
  if (expr.includes('×') || expr.includes('*')) {
    return `Multiply the numbers together. You can think of it as repeated addition. The product is ${q.correctAnswer}.`;
  }
  if (expr.includes('÷') || expr.includes('/')) {
    return `Division is the inverse of multiplication. Ask: what times the divisor gives the dividend? The answer is ${q.correctAnswer}.`;
  }
  return `Solve the expression step by step. The correct answer is ${q.correctAnswer}.`;
};

const QBlocks = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState(null);

  // Resolve student identity: URL params first, then fall back to saved session
  const _session = (() => {
    try {
      const saved = localStorage.getItem('quantegy-student-session');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })();
  const studentId = searchParams.get('sid') || _session?.studentId || '';
  const assignmentId = searchParams.get('aid') || '';
  const classId = searchParams.get('cid') || _session?.classId || '';
  const gradeParam = searchParams.get('grade') || 'grade3';
  const teksParam = searchParams.get('teks') || '';
  const labelParam = searchParams.get('label') || '';
  const returnUrl = sanitizeReturnUrl(searchParams.get('returnUrl') || '');

  // Redirect to raw game in same window — avoids iframe issues with PLAY button
  useEffect(() => {
    const p = new URLSearchParams();
    if (gradeParam) p.set('grade', gradeParam);
    if (teksParam) p.set('teks', teksParam);
    if (labelParam) p.set('label', labelParam);
    if (returnUrl) p.set('returnUrl', returnUrl);
    if (studentId) p.set('sid', studentId);
    if (classId) p.set('cid', classId);
    p.set('from', 'loop');
    const gameUrl = `/games/q-blocks.html?${p.toString()}`;
    if (!window.location.pathname.endsWith('.html')) {
      window.location.replace(gameUrl);
    }
  }, [gradeParam, teksParam, labelParam, returnUrl, studentId, classId]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'qblocksNavigate' && event.data.url) {
        try {
          navigate(event.data.url);
        } catch (_) {}
        return;
      }
      if (event.data && event.data.type === 'qblocksResult') {
        const { score, level, accuracy, correct, wrong, rowsCleared, wrongAnswers } = event.data;

        // Save to localStorage (legacy)
        const results = JSON.parse(localStorage.getItem('qblocksResults') || '[]');
        results.push({
          date: new Date().toISOString(),
          score, level, accuracy, correct, wrong, rowsCleared,
          gameId: 'q-blocks',
        });
        localStorage.setItem('qblocksResults', JSON.stringify(results));

        // Save result for gradebook auto-grading
        if (studentId) {
          let resolvedAid = assignmentId;
          if (!resolvedAid && classId) {
            const match = findMatchingAssignment(classId, 'q-blocks');
            if (match) resolvedAid = match.id;
          }
          const total = correct + wrong;
          const pctScore = total > 0 ? Math.round((correct / total) * 100) : 0;
          const teksToSave = teksParam || (gradeParam === 'grade4' ? '4.4A,4.4B,4.4C,4.4D,4.4E,4.4F,4.4G,4.4H,4.5A' : '3.4A,3.4C,3.5A');
          saveGameResult({
            studentId,
            assignmentId: resolvedAid || `unassigned-${Date.now()}`,
            classId: classId || '',
            gameId: 'q-blocks',
            teks: teksToSave,
            score: pctScore,
            correct, total,
            time: 0,
            grade: gradeParam,
          });
        }

        // Build review data from wrong answers
        if (wrongAnswers && wrongAnswers.length > 0) {
          const reviewItems = wrongAnswers.map((w) => {
            const item = {
              question: w.question,
              correctAnswer: w.correctAnswer,
              userAnswer: w.userAnswer,
              isCorrect: false,
              teks: '3.4A',
            };
            item.explanation = getQBlocksExplanation(item);
            return item;
          });
          setReviewData({
            score: correct,
            total: correct + wrong,
            questions: reviewItems,
            wrongOnly: true,
          });
        } else if (correct > 0) {
          // All correct! No wrong answers to review
          setReviewData({
            score: correct,
            total: correct + wrong,
            questions: [],
            wrongOnly: true,
          });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [studentId, assignmentId, classId, navigate]);

  return (
    <div style={{ background: '#0a0a1a', minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        height: NAV_HEIGHT, padding: '0 20px',
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,245,255,0.15)', boxSizing: 'border-box',
        position: 'relative', zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/games" style={{ color: '#00f5ff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            {'\u2190'} Back
          </Link>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>
          Q-Blocks {'\u00b7'} Math Puzzle
        </span>
      </div>

      {!iframeLoaded && (
        <div style={{
          position: 'absolute', top: NAV_HEIGHT, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#00f5ff', fontFamily: 'sans-serif', zIndex: 5,
        }}>
          <SkeletonLoader variant="card" width={200} height={80} />
        </div>
      )}

      <iframe
        src={(() => {
          const p = new URLSearchParams();
          if (gradeParam) p.set('grade', gradeParam);
          if (teksParam) p.set('teks', teksParam);
          if (labelParam) p.set('label', labelParam);
          if (returnUrl) p.set('returnUrl', returnUrl);
          p.set('from', 'loop');
          return `/games/q-blocks.html?${p.toString()}`;
        })()}
        title="Q-Blocks Math Puzzle"
        onLoad={() => setIframeLoaded(true)}
        style={{
          display: 'block', width: '100%',
          height: returnUrl ? `calc(100vh - ${NAV_HEIGHT}px - ${BOTTOM_BAR}px)` : `calc(100vh - ${NAV_HEIGHT}px)`,
          border: 'none', background: '#0a0a1a',
          opacity: iframeLoaded ? 1 : 0, transition: 'opacity 0.3s ease',
        }}
        allow="clipboard-write"
      />

      {/* ── Bottom bar: Continue / Review / Back (non-overlapping) ── */}
      {returnUrl && !showReview && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: BOTTOM_BAR,
          zIndex: 30, display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,10,26,0.96)', backdropFilter: 'blur(8px)',
          padding: '0 16px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
          borderTop: '1px solid rgba(34,197,94,0.3)',
        }}>
          {reviewData?.questions?.length > 0 && (
            <button type="button" onClick={() => setShowReview(true)} style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(245,158,11,0.2)', color: '#fbbf24',
              border: '1px solid rgba(245,158,11,0.4)', borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              Review
            </button>
          )}
          <Link to="/games" style={{
            padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
            textDecoration: 'none', display: 'inline-block',
          }}>
            Back
          </Link>
          <LoopContinueButton fixed={false} onClick={() => navigate(returnUrl)} label="Continue →" />
        </div>
      )}

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
              <h2 style={{ margin: 0, fontSize: 20, color: '#0f172a' }}>Q-Blocks Review</h2>
              <button type="button" onClick={() => setShowReview(false)} style={{
                padding: '6px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: '#f1f5f9', color: '#475569', border: '1px solid #d1d5db', borderRadius: 8,
              }}>
                Close
              </button>
            </div>
            <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 13 }}>
              Here are the questions you got wrong. Review the explanations to improve!
            </p>
            <GameReview
              questions={reviewData.questions}
              score={reviewData.score}
              total={reviewData.total}
              gameTitle="Q-Blocks"
              onPlayAgain={() => { setShowReview(false); setReviewData(null); }}
              onBack={() => setShowReview(false)}
              backLabel="Back"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default QBlocks;
