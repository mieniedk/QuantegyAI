import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QBotExplainer from './QBotExplainer';
import { formatMathHtml } from '../utils/mathFormat';
import { sanitizeHtml } from '../utils/sanitize';

function reviewMathHtml(text) {
  if (text == null || text === '') return '';
  return sanitizeHtml(formatMathHtml(String(text)));
}

/**
 * Shared post-game review component.
 *
 * Props:
 *   questions – array of:
 *     { question, userAnswer, correctAnswer, isCorrect, teks?, explanation?, misconception?, choices? }
 *   score      – number correct
 *   total      – total questions
 *   time       – elapsed seconds (optional)
 *   gameTitle  – name of the game
 *   onPlayAgain – callback
 *   onBack      – callback (e.g. go to setup / games)
 *   backLabel   – label for back button (default "Back")
 *   continueUrl – if set, show "Next" button that navigates here (e.g. back to practice loop)
 *   continueLabel – label for Continue button (default "Continue")
 */
const GameReview = ({ questions = [], score, total, time, gameTitle, onPlayAgain, onBack, backLabel = 'Back', continueUrl, continueLabel = 'Continue' }) => {
  const [filter, setFilter] = useState('all'); // all | wrong | correct
  const navigate = useNavigate();

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const emoji = pct >= 90 ? '🌟' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '💪';
  const color = pct >= 70 ? '#16a34a' : pct >= 50 ? '#ca8a04' : '#dc2626';
  const bgGrad = pct >= 70
    ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)'
    : pct >= 50
      ? 'linear-gradient(135deg, #fefce8, #fef9c3)'
      : 'linear-gradient(135deg, #fef2f2, #fee2e2)';
  const borderColor = pct >= 70 ? '#86efac' : pct >= 50 ? '#fcd34d' : '#fca5a5';

  const wrongCount = questions.filter((q) => !q.isCorrect).length;
  const correctCount = questions.filter((q) => q.isCorrect).length;

  const filtered = filter === 'all'
    ? questions
    : filter === 'wrong'
      ? questions.filter((q) => !q.isCorrect)
      : questions.filter((q) => q.isCorrect);

  const formatTime = (s) => {
    if (!s && s !== 0) return null;
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      marginTop: 12,
    }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      {/* Score summary */}
      <div style={{
        padding: '24px 20px', textAlign: 'center', borderRadius: 16,
        background: bgGrad, border: `1px solid ${borderColor}`, marginBottom: 20,
      }}>
        <div style={{ fontSize: 44, marginBottom: 4 }}>{emoji}</div>
        <h2 style={{ margin: '0 0 4px', fontSize: 28, color: '#0f172a' }}>
          {score} / {total}
        </h2>
        <div style={{
          display: 'inline-block', padding: '4px 16px', borderRadius: 20,
          background: color, color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 8,
        }}>
          {pct}%
        </div>
        {time !== undefined && time !== null && (
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
            Time: {formatTime(time)}
          </p>
        )}
        {gameTitle && (
          <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: 12 }}>{gameTitle}</p>
        )}
        {continueUrl && (
          <div style={{ marginTop: 16 }}>
            <button type="button" onClick={() => navigate(continueUrl)} style={{
              width: '100%', padding: '14px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff',
              border: '2px solid #34d399', borderRadius: 12, boxShadow: '0 0 14px rgba(5,150,105,0.35)',
            }}>
              {continueLabel}
            </button>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      {questions.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[
            { id: 'all', label: `All (${questions.length})` },
            { id: 'wrong', label: `Wrong (${wrongCount})`, color: '#dc2626' },
            { id: 'correct', label: `Correct (${correctCount})`, color: '#16a34a' },
          ].map((f) => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: filter === f.id ? (f.color ? f.color + '15' : '#f1f5f9') : '#fff',
              border: filter === f.id ? `2px solid ${f.color || '#64748b'}` : '1px solid #e2e8f0',
              color: filter === f.id ? (f.color || '#0f172a') : '#64748b',
            }}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Question review cards */}
      <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
        {filtered.map((q, i) => {
          const idx = questions.indexOf(q) + 1;
          return (
            <div key={i} style={{
              padding: '16px 18px', borderRadius: 12,
              background: q.isCorrect ? '#f0fdf4' : '#fff',
              border: `2px solid ${q.isCorrect ? '#86efac' : '#fca5a5'}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800,
                    background: q.isCorrect ? '#dcfce7' : '#fee2e2',
                    color: q.isCorrect ? '#166534' : '#dc2626',
                    border: `2px solid ${q.isCorrect ? '#86efac' : '#fca5a5'}`,
                  }}>
                    {idx}
                  </span>
                  {q.teks && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                      background: '#e8f0fe', color: '#1a5cba',
                    }}>
                      {q.teks}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: 20, fontWeight: 700,
                  color: q.isCorrect ? '#16a34a' : '#dc2626',
                }}>
                  {q.isCorrect ? '✓' : '✗'}
                </span>
              </div>

              {/* Question */}
              <p style={{
                margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#0f172a',
                lineHeight: 1.5, whiteSpace: 'pre-line',
              }}
                dangerouslySetInnerHTML={{ __html: reviewMathHtml(q.question) }}
              />

              {/* Answer comparison */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: q.explanation ? 10 : 0 }}>
                {!q.isCorrect && q.userAnswer && (
                  <div style={{
                    padding: '8px 14px', borderRadius: 8,
                    background: '#fee2e2', border: '1px solid #fca5a5',
                    flex: 1, minWidth: 120,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', marginBottom: 2 }}>
                      Your Answer
                    </div>
                    <div style={{
                      fontSize: 16, fontWeight: 800, color: '#dc2626',
                      textDecoration: 'line-through', textDecorationThickness: 2,
                    }}
                      dangerouslySetInnerHTML={{ __html: reviewMathHtml(q.userAnswer) }}
                    />
                  </div>
                )}
                <div style={{
                  padding: '8px 14px', borderRadius: 8,
                  background: '#dcfce7', border: '1px solid #86efac',
                  flex: 1, minWidth: 120,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: 2 }}>
                    Correct Answer
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}
                    dangerouslySetInnerHTML={{ __html: reviewMathHtml(q.correctAnswer) }}
                  />
                </div>
              </div>

              {/* QBot step-by-step explanation */}
              <QBotExplainer
                question={q.question}
                explanation={q.explanation}
                misconception={!q.isCorrect ? q.misconception : null}
                correctAnswer={q.correctAnswer}
              />
            </div>
          );
        })}
      </div>

      </div>

      {/* Action buttons — sticky at bottom so always visible */}
      <div style={{
        flexShrink: 0,
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: 'flex',
        gap: 10,
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: '16px 16px max(16px, env(safe-area-inset-bottom))',
        background: 'var(--color-bg, #fff)',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
      }}>
        {continueUrl && (
          <button type="button" onClick={() => navigate(continueUrl)} style={{
            width: '100%', padding: '14px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff',
            border: '2px solid #34d399', borderRadius: 12, boxShadow: '0 0 14px rgba(5,150,105,0.35)',
          }}>
            {continueLabel}
          </button>
        )}
        {onPlayAgain && (
          <button type="button" onClick={onPlayAgain} style={{
            padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff',
            border: 'none', borderRadius: 10, boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
          }}>
            Play Again
          </button>
        )}
        {onBack && (
          <button type="button" onClick={onBack} style={{
            padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            background: '#f8fafc', color: '#475569',
            border: '1px solid #d1d5db', borderRadius: 10,
          }}>
            {backLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default GameReview;
