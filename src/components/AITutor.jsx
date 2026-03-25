/**
 * AI Teaching Agent — Autonomous Socratic tutor that guides students
 * through lessons step-by-step, adapting to their responses in real-time.
 */
import React, { useState, useRef, useEffect } from 'react';

const MODES = [
  { id: 'explain', label: 'Teach Me', icon: '\uD83D\uDCDA', desc: 'Step-by-step explanation' },
  { id: 'practice', label: 'Practice', icon: '\uD83C\uDFAF', desc: 'Drill problems' },
  { id: 'review', label: 'Review', icon: '\uD83D\uDD04', desc: 'Quick review' },
];

export default function AITutor({ studentProfile, gradeId, onXPEarned }) {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('explain');
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const sendMessage = async (userMsg, isStart = false) => {
    const newHistory = isStart
      ? [{ role: 'user', content: userMsg }]
      : [...history, { role: 'user', content: userMsg }];

    if (!isStart) setHistory(newHistory);
    setLoading(true);
    setInput('');

    try {
      const resp = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: newHistory,
          studentProfile,
          lessonTopic: topic || 'math practice',
          gradeLevel: gradeId || 'Grade 3',
          mode,
        }),
      });
      const data = await resp.json();
      if (data.reply) {
        const updatedHistory = [...newHistory, { role: 'assistant', content: data.reply }];
        setHistory(updatedHistory);
        setStepsCompleted((s) => s + 1);
        if (stepsCompleted > 0 && stepsCompleted % 3 === 0) {
          onXPEarned?.(10);
        }
      }
    } catch (err) {
      setHistory([...newHistory, { role: 'assistant', content: 'Connection issue. Please try again.' }]);
    }
    setLoading(false);
  };

  const startLesson = () => {
    if (!topic.trim()) return;
    setStarted(true);
    setHistory([]);
    setStepsCompleted(0);
    sendMessage(`Teach me about: ${topic}`, true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!started) startLesson();
      else if (input.trim()) sendMessage(input.trim());
    }
  };

  // Pre-lesson screen
  if (!started) {
    return (
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{
          padding: '28px 24px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          color: '#fff',
        }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>{'\uD83E\uDDD1\u200D\uD83C\uDFEB'}</div>
          <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>AI Teaching Agent</h3>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Your personal tutor. Ask about any topic and I'll guide you step by step.</p>
        </div>

        <div style={{ padding: 24 }}>
          {/* Mode selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, display: 'block' }}>Learning Mode</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {MODES.map((m) => (
                <button key={m.id} type="button" onClick={() => setMode(m.id)} style={{
                  flex: 1, padding: '12px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  border: mode === m.id ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                  background: mode === m.id ? '#f5f3ff' : '#fff',
                  color: mode === m.id ? '#7c3aed' : '#475569',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Topic input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, display: 'block' }}>What do you want to learn?</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={handleKeyDown}
              placeholder='e.g. "adding fractions", "multiplication", "area of rectangles"...'
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid #e2e8f0',
                fontSize: 15, boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Quick topics */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {['Fractions', 'Multiplication', 'Division', 'Place Value', 'Geometry', 'Word Problems'].map((t) => (
              <button key={t} type="button" onClick={() => setTopic(t)} style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
                background: topic === t ? '#f5f3ff' : '#f8fafc', fontSize: 12, fontWeight: 600,
                color: topic === t ? '#7c3aed' : '#64748b', cursor: 'pointer',
              }}>{t}</button>
            ))}
          </div>

          <button type="button" onClick={startLesson} disabled={!topic.trim()} style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: topic.trim() ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : '#e2e8f0',
            color: topic.trim() ? '#fff' : '#94a3b8', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>Start Lesson {'\u2192'}</button>
        </div>
      </div>
    );
  }

  // Active lesson
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 560 }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
        color: '#fff', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <span style={{ fontSize: 20 }}>{'\uD83E\uDDD1\u200D\uD83C\uDFEB'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{topic}</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>{MODES.find((m) => m.id === mode)?.label} Mode · Step {stepsCompleted}</div>
        </div>
        <button type="button" onClick={() => { setStarted(false); setHistory([]); }} style={{
          padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
        }}>End Lesson</button>
      </div>

      {/* Chat area */}
      <div aria-live="polite" role="log" aria-label="Tutor conversation" style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {history.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '85%', padding: '12px 16px', borderRadius: 14,
              background: msg.role === 'user' ? '#2563eb' : '#f1f5f9',
              color: msg.role === 'user' ? '#fff' : '#0f172a',
              fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
              borderBottomRightRadius: msg.role === 'user' ? 4 : 14,
              borderBottomLeftRadius: msg.role === 'user' ? 14 : 4,
            }}>
              {msg.role === 'assistant' && <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', display: 'block', marginBottom: 4 }}>{'\uD83E\uDDD1\u200D\uD83C\uDFEB'} Tutor</span>}
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex' }}>
            <div style={{ padding: '12px 16px', borderRadius: 14, background: '#f1f5f9', fontSize: 14, color: '#94a3b8' }}>
              {'\uD83E\uDDD1\u200D\uD83C\uDFEB'} Thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Type your answer or ask a question..."
          aria-label="Reply to AI tutor"
          disabled={loading}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0',
            fontSize: 14, boxSizing: 'border-box',
          }}
        />
        <button type="button" onClick={() => input.trim() && sendMessage(input.trim())} disabled={loading || !input.trim()} style={{
          padding: '12px 20px', borderRadius: 10, border: 'none',
          background: input.trim() ? '#2563eb' : '#e2e8f0',
          color: input.trim() ? '#fff' : '#94a3b8', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>{'\u2191'}</button>
      </div>
    </div>
  );
}
