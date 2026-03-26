import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import SkeletonLoader from '../components/SkeletonLoader';

const Quiz = () => {
  const { id } = useParams();
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/question-bank/${id}`);
        const data = await res.json();
        if (data.success) setBank(data.bank);
        else         setError(data.error || 'Question bank not found.');
      } catch (e) {
        setError(e?.message?.toLowerCase().includes('fetch') ? 'Unable to connect. Please check your connection and try again.' : 'Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const setAnswer = (qIdx, val) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: val }));
  };

  const handleSubmit = () => setSubmitted(true);

  const getScore = () => {
    if (!bank || !bank.questions) return { correct: 0, total: 0 };
    let correct = 0;
    bank.questions.forEach((q, i) => {
      if (bank.format === 'multiple-choice' && answers[i] === q.correct) correct++;
      if (bank.format === 'true-false' && answers[i] === String(q.correct)) correct++;
    });
    return { correct, total: bank.questions.length };
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: 24 }}>
        <SkeletonLoader variant="card" width={320} height={100} />
        <SkeletonLoader variant="text" count={3} style={{ marginTop: 16 }} />
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ color: '#dc2626' }}>Quiz not found</h2>
      <p style={{ color: '#64748b' }}>{error}</p>
      <Link to="/" style={{ color: '#007bff' }}>Go to home page</Link>
    </div>
  );

  const q = bank.questions || [];
  const fmt = bank.format || 'multiple-choice';
  const score = submitted ? getScore() : null;

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', color: '#fff', padding: 24, borderRadius: 14, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>{bank.title || 'Math Quiz'}</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, opacity: 0.85 }}>
          {bank.teksStandard ? `TEKS ${bank.teksStandard}` : 'Math'} &middot;{' '}
          {bank.difficulty || 'Mixed'} &middot;{' '}
          {q.length} question{q.length !== 1 ? 's' : ''} &middot;{' '}
          {fmt === 'multiple-choice' ? 'Multiple Choice' : fmt === 'true-false' ? 'True / False' : 'Open-Ended'}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.6 }}>Powered by Quantegy AI</p>
      </div>

      {/* Score banner */}
      {submitted && score && (
        <div style={{
          padding: 16, borderRadius: 10, marginBottom: 20, textAlign: 'center',
          background: score.correct === score.total ? '#dcfce7' : score.correct >= score.total * 0.7 ? '#fef9c3' : '#fee2e2',
          border: `1px solid ${score.correct === score.total ? '#22c55e' : score.correct >= score.total * 0.7 ? '#eab308' : '#dc2626'}`,
        }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            {score.correct} / {score.total} correct ({Math.round(score.correct / score.total * 100)}%)
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#475569' }}>
            {score.correct === score.total
              ? 'Perfect score - every item was solved correctly.'
              : score.correct >= score.total * 0.7
                ? 'Strong result - rework missed questions to identify the exact math step that failed.'
                : 'Use the explanations below to rebuild setup, operations, and verification on each missed item.'}
          </p>
        </div>
      )}

      {/* Questions */}
      <div style={{ display: 'grid', gap: 16 }}>
        {q.map((question, i) => {
          const userAnswer = answers[i];
          const isCorrect = fmt === 'multiple-choice'
            ? userAnswer === question.correct
            : fmt === 'true-false'
              ? userAnswer === String(question.correct)
              : null;

          return (
            <div key={question.id || i} style={{
              padding: 18, borderRadius: 12, border: '1px solid #e2e8f0',
              background: submitted
                ? (isCorrect ? '#f0fdf4' : isCorrect === false ? '#fef2f2' : '#fff')
                : '#fff',
            }}>
              <p style={{ margin: '0 0 10px', fontWeight: 600, fontSize: 16 }}>
                {i + 1}. {fmt === 'true-false' ? question.statement : question.question}
              </p>

              {/* Multiple choice options */}
              {fmt === 'multiple-choice' && (
                <div style={{ display: 'grid', gap: 6 }}>
                  {Object.entries(question.options || {}).map(([k, v]) => {
                    const selected = userAnswer === k;
                    const isRight = k === question.correct;
                    let bg = '#fff';
                    let border = '1px solid #e5e7eb';
                    if (submitted && isRight) { bg = '#dcfce7'; border = '1px solid #22c55e'; }
                    else if (submitted && selected && !isRight) { bg = '#fee2e2'; border = '1px solid #dc2626'; }
                    else if (selected) { bg = '#e0f2fe'; border = '1px solid #0284c7'; }

                    return (
                      <label key={k} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                        borderRadius: 8, border, background: bg, cursor: submitted ? 'default' : 'pointer',
                      }}>
                        <input type="radio" name={`q-${i}`} value={k}
                          checked={selected} onChange={() => setAnswer(i, k)}
                          disabled={submitted}
                          style={{ accentColor: '#007bff' }}
                        />
                        <span style={{ fontWeight: selected ? 600 : 400, fontSize: 14 }}>
                          <strong>{k})</strong> {v}
                          {submitted && isRight && <span style={{ color: '#16a34a', marginLeft: 6 }}>✓</span>}
                          {submitted && selected && !isRight && <span style={{ color: '#dc2626', marginLeft: 6 }}>✗</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* True / False */}
              {fmt === 'true-false' && (
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  {['true', 'false'].map((val) => {
                    const selected = userAnswer === val;
                    const isRight = val === String(question.correct);
                    let bg = '#fff';
                    let border = '1px solid #e5e7eb';
                    if (submitted && isRight) { bg = '#dcfce7'; border = '1px solid #22c55e'; }
                    else if (submitted && selected && !isRight) { bg = '#fee2e2'; border = '1px solid #dc2626'; }
                    else if (selected) { bg = '#e0f2fe'; border = '1px solid #0284c7'; }

                    return (
                      <label key={val} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px',
                        borderRadius: 8, border, background: bg, cursor: submitted ? 'default' : 'pointer', fontWeight: selected ? 600 : 400,
                      }}>
                        <input type="radio" name={`q-${i}`} value={val}
                          checked={selected} onChange={() => setAnswer(i, val)}
                          disabled={submitted} style={{ accentColor: '#007bff' }}
                        />
                        {val === 'true' ? 'True' : 'False'}
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Open-ended */}
              {fmt === 'open-ended' && (
                <div>
                  <RichTextEditor
                    value={userAnswer || ''}
                    onChange={(val) => setAnswer(i, val)}
                    placeholder="Type your answer here... click ∑ for math equations"
                    compact
                    minHeight={60}
                    readOnly={submitted}
                  />
                  {submitted && (
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: '#16a34a' }}>
                      <strong>Expected answer:</strong> {question.answer}
                    </p>
                  )}
                </div>
              )}

              {/* Show explanation after submission */}
              {submitted && fmt === 'true-false' && question.explanation && (
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>{question.explanation}</p>
              )}
              {submitted && fmt === 'multiple-choice' && question.misconception && (
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#b45309', background: '#fefce8', padding: '4px 8px', borderRadius: 4 }}>Watch out: {question.misconception}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!submitted && q.length > 0 && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button type="button" onClick={handleSubmit}
            disabled={fmt !== 'open-ended' && Object.keys(answers).length < q.length}
            style={{
              padding: '12px 32px', fontSize: 16, fontWeight: 700, borderRadius: 10, border: 'none',
              background: (fmt !== 'open-ended' && Object.keys(answers).length < q.length) ? '#94a3b8' : '#007bff',
              color: '#fff', cursor: (fmt !== 'open-ended' && Object.keys(answers).length < q.length) ? 'not-allowed' : 'pointer',
            }}>
            Submit Answers
          </button>
          {fmt !== 'open-ended' && Object.keys(answers).length < q.length && (
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#94a3b8' }}>
              Answer all {q.length} questions to submit ({Object.keys(answers).length}/{q.length} answered)
            </p>
          )}
        </div>
      )}

      {/* Try again */}
      {submitted && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button type="button"
            onClick={() => { setAnswers({}); setSubmitted(false); }}
            style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600, borderRadius: 8, border: '1px solid #007bff', background: '#f0f7ff', color: '#007bff', cursor: 'pointer', marginRight: 12 }}>
            Try Again
          </button>
          <Link to="/" style={{ color: '#64748b', fontSize: 14 }}>Back to home</Link>
        </div>
      )}
    </div>
  );
};

export default Quiz;
