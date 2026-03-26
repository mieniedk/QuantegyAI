import React, { useState } from 'react';
import qbotImg from '../assets/qbot.svg';

/**
 * MiniLesson – A short, engaging lesson modal for a TEKS standard.
 *
 * Props:
 *   lecture   – lecture object from lectures.js
 *   onClose   – callback to close
 *   onPractice – optional callback to start practice after lesson
 *   onWarmUp   – optional callback to start warm-up after lesson
 *   flow       – 'learn-check-game': only show "Check your understanding" (onWarmUp), then game after check
 */
const MiniLesson = ({ lecture, onClose, onPractice, onWarmUp, flow }) => {
  const [step, setStep] = useState(0); // 0 = intro, 1..N = teaching steps, N+1 = example, N+2 = summary

  if (!lecture) return null;

  const totalTeachSteps = lecture.steps.length;
  const INTRO = 0;
  const TEACH_START = 1;
  const TEACH_END = totalTeachSteps;
  const EXAMPLE = totalTeachSteps + 1;
  const SUMMARY = totalTeachSteps + 2;
  const totalSteps = SUMMARY + 1;
  const progress = ((step + 1) / totalSteps) * 100;

  const isIntro = step === INTRO;
  const isTeach = step >= TEACH_START && step <= TEACH_END;
  const isExample = step === EXAMPLE;
  const isSummary = step === SUMMARY;
  const teachIdx = step - TEACH_START; // 0-based index into lecture.steps

  const videoUrl = lecture.video || null;
  const youtubeId = videoUrl && (videoUrl.match(/(?:embed\/|v=)([a-zA-Z0-9_-]+)/) || videoUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/))?.[1];
  const youtubeEmbedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null;
  const hasVideo = youtubeEmbedUrl || videoUrl;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.55)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 540, maxHeight: 'calc(100vh - 32px)',
          background: '#fff', borderRadius: 22, overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          padding: '18px 22px 16px', position: 'relative',
        }}>
          {/* Progress bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: 'rgba(255,255,255,0.2)',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: '#fbbf24',
              transition: 'width 0.4s ease',
              borderRadius: '0 2px 2px 0',
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{
                padding: '3px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: 6,
                fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: 0.5,
              }}>
                TEKS {lecture.teks}
              </span>
              <h2 style={{ margin: '8px 0 0', fontSize: 20, fontWeight: 800, color: '#fff' }}>
                {lecture.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,0.2)', cursor: 'pointer',
                color: '#fff', fontSize: 16, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Step indicator */}
          <div style={{
            display: 'flex', gap: 4, marginTop: 12,
          }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i <= step ? '#fbbf24' : 'rgba(255,255,255,0.25)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* ── Body (scrollable) ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '22px 24px',
        }}>
          {/* INTRO */}
          {isIntro && (
            <div>
              {/* Video at the beginning (short explainer) */}
              {hasVideo && (
                <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', background: '#0f172a', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '8px 14px', background: 'rgba(255,255,255,0.06)' }}>
                    📺 Watch first — then we'll practice
                  </div>
                  {youtubeEmbedUrl ? (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                      <iframe
                        title={`Video: ${lecture.title}`}
                        src={`${youtubeEmbedUrl}?rel=0`}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      style={{ width: '100%', display: 'block' }}
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}

              {/* QBot greeting */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  border: '2px solid #c7d2fe',
                }}>
                  <img src={qbotImg} alt="QBot" style={{ width: 44, height: 'auto' }} />
                </div>
                <div style={{
                  padding: '14px 18px', background: '#eff6ff', borderRadius: '4px 18px 18px 18px',
                  border: '1px solid #bfdbfe', flex: 1,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                    QBot Teacher
                  </div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1e40af', lineHeight: 1.6 }}>
                    Hey there! Let me teach you something cool. Ready? Let's go!
                  </p>
                </div>
              </div>

              {/* Objective */}
              <div style={{
                padding: '16px 18px', borderRadius: 14,
                background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                border: '2px solid #86efac', marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  🎯 Learning Goal
                </div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#065f46', lineHeight: 1.6 }}>
                  {lecture.objective}
                </p>
              </div>

              {/* Key Idea */}
              <div style={{
                padding: '16px 18px', borderRadius: 14,
                background: '#fffbeb', border: '2px solid #fcd34d',
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  💡 The Big Idea
                </div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#78350f', lineHeight: 1.6 }}>
                  {lecture.keyIdea}
                </p>
              </div>
            </div>
          )}

          {/* TEACHING STEPS */}
          {isTeach && (
            <div>
              <div style={{
                fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase',
                letterSpacing: 0.8, marginBottom: 14,
              }}>
                Step {teachIdx + 1} of {totalTeachSteps}
              </div>

              {/* Step card */}
              <div style={{
                padding: '20px 22px', borderRadius: 16,
                background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                border: '2px solid #c4b5fd',
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    color: '#fff', fontSize: 18, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(124,58,237,0.3)',
                  }}>
                    {teachIdx + 1}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#4c1d95' }}>
                    {lecture.steps[teachIdx].title}
                  </h3>
                </div>
                <p style={{
                  margin: 0, fontSize: 16, lineHeight: 1.7, color: '#3b0764',
                  paddingLeft: 52,
                }}>
                  {lecture.steps[teachIdx].content}
                </p>
              </div>

              {/* Show all previous steps as mini cards */}
              {teachIdx > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>Previous steps:</div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {lecture.steps.slice(0, teachIdx).map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 8, alignItems: 'flex-start',
                        padding: '8px 12px', borderRadius: 10, background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: '#e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 800,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{i + 1}</span>
                        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                          <strong>{s.title}:</strong> {s.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXAMPLE */}
          {isExample && (
            <div>
              <div style={{
                fontSize: 12, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase',
                letterSpacing: 0.8, marginBottom: 14,
              }}>
                📝 Worked Example
              </div>

              {/* Problem */}
              <div style={{
                padding: '18px 20px', borderRadius: 14,
                background: 'linear-gradient(170deg, #1a2332 0%, #0f1923 100%)',
                border: '3px solid #334155', marginBottom: 16,
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  Problem
                </div>
                <p style={{
                  margin: 0, fontSize: 20, fontWeight: 800, color: '#e2e8f0',
                  fontFamily: '"Fira Code", "Courier New", monospace',
                  textAlign: 'center', padding: '8px 0',
                }}>
                  {lecture.example.problem}
                </p>
              </div>

              {/* Solution steps */}
              <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
                {lecture.example.solution.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    padding: '10px 14px', borderRadius: 10,
                    background: '#f0f9ff', border: '1px solid #bae6fd',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                      color: '#fff', fontSize: 12, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#0c4a6e', paddingTop: 1 }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>

              {/* Answer */}
              <div style={{
                padding: '14px 18px', borderRadius: 12,
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '2px solid #86efac', textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                  ✅ Answer
                </div>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#166534' }}>
                  {lecture.example.answer}
                </p>
              </div>
            </div>
          )}

          {/* SUMMARY */}
          {isSummary && (
            <div>
              {/* QBot wrapping up */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  border: '2px solid #c7d2fe',
                }}>
                  <img src={qbotImg} alt="QBot" style={{ width: 44, height: 'auto' }} />
                </div>
                <div style={{
                  padding: '14px 18px', background: '#eff6ff', borderRadius: '4px 18px 18px 18px',
                  border: '1px solid #bfdbfe', flex: 1,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                    QBot Teacher
                  </div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1e40af', lineHeight: 1.6 }}>
                    You completed this mini-lesson. Use this math tip to keep your setup and solving steps accurate:
                  </p>
                </div>
              </div>

              {/* Tip card */}
              {lecture.tip && (
                <div style={{
                  padding: '18px 20px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  border: '2px solid #f59e0b', marginBottom: 20,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    🧠 Remember This!
                  </div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#78350f', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{lecture.tip}"
                  </p>
                </div>
              )}

              {/* Quick recap */}
              <div style={{
                padding: '16px 18px', borderRadius: 14,
                background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 20,
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                  Quick Recap
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {lecture.steps.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                        <strong>{s.title}:</strong> {s.content}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons: Learn → Check → Game flow shows only "Check your understanding" */}
              <div style={{ display: 'flex', gap: 10 }}>
                {onWarmUp && (
                  <button type="button" onClick={onWarmUp} style={{
                    flex: 1, padding: '14px 18px', borderRadius: 12, border: 'none',
                    background: flow === 'learn-check-game'
                      ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                      : 'linear-gradient(135deg, #f59e0b, #f97316)',
                    color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 3px 12px rgba(245,158,11,0.3)',
                  }}>
                    {flow === 'learn-check-game' ? '✓ Check your understanding' : '🔥 Take Warm-Up Quiz'}
                  </button>
                )}
                {onPractice && flow !== 'learn-check-game' && (
                  <button type="button" onClick={onPractice} style={{
                    flex: 1, padding: '14px 18px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 3px 12px rgba(37,99,235,0.3)',
                  }}>
                    🎮 Start Practicing
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer navigation ── */}
        <div style={{
          padding: '14px 22px 18px', borderTop: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#fafbfc',
        }}>
          <button
            type="button"
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: step > 0 ? '#f1f5f9' : 'transparent',
              color: '#475569', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', border: step > 0 ? '1px solid #e2e8f0' : 'none',
            }}
          >
            {step > 0 ? '← Back' : 'Close'}
          </button>

          <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>
            {step + 1} / {totalSteps}
          </span>

          {step < SUMMARY ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(37,99,235,0.3)',
              }}
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(22,163,74,0.3)',
              }}
            >
              Done ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniLesson;
