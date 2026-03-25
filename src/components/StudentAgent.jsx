/**
 * Student AI Agent — A personalized AI companion that adapts in real-time.
 * It greets the student, suggests what to do next, celebrates achievements,
 * warns about weak areas, and proactively offers help.
 */
import React, { useState, useEffect, useCallback } from 'react';

const MOOD_STYLES = {
  encouraging: { bg: '#f0f9ff', border: '#bae6fd', accent: '#0284c7' },
  celebrating: { bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  motivating: { bg: '#faf5ff', border: '#e9d5ff', accent: '#9333ea' },
  'gentle-push': { bg: '#fffbeb', border: '#fde68a', accent: '#d97706' },
  welcoming: { bg: '#f0f9ff', border: '#bae6fd', accent: '#2563eb' },
};

const SUGGESTION_ACTIONS = {
  practice: { icon: '\uD83C\uDFAF', color: '#2563eb' },
  review: { icon: '\uD83D\uDD04', color: '#7c3aed' },
  challenge: { icon: '\u26A1', color: '#dc2626' },
  celebrate: { icon: '\uD83C\uDF89', color: '#22c55e' },
  streak: { icon: '\uD83D\uDD25', color: '#f59e0b' },
};

export default function StudentAgent({ studentProfile, onAction }) {
  const [agentState, setAgentState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const determineTrigger = useCallback(() => {
    const { accuracy, streak, mastered, lastActive, level } = studentProfile || {};
    if (streak >= 3 && streak % 3 === 0) return 'streak-milestone';
    if (mastered > 0 && mastered % 5 === 0) return 'mastery-achieved';
    if (lastActive) {
      const daysSince = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000);
      if (daysSince > 3) return 'idle-return';
    }
    if (accuracy != null && accuracy < 50) return 'low-accuracy';
    return 'dashboard-visit';
  }, [studentProfile]);

  useEffect(() => {
    let mounted = true;
    const fetchAgent = async () => {
      setLoading(true);
      try {
        const trigger = determineTrigger();
        const resp = await fetch('/api/student-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentProfile, trigger }),
        });
        const data = await resp.json();
        if (mounted) setAgentState(data);
      } catch (err) {
        console.warn('Student agent fetch failed:', err);
        if (mounted) {
          setAgentState({
            message: `Welcome back${studentProfile?.name ? `, ${studentProfile.name}` : ''}! Ready to learn something new today?`,
            suggestion: { type: 'practice', label: 'Start Practice', reason: 'Keep the momentum going!' },
            mood: 'welcoming',
            emoji: '\uD83D\uDC4B',
          });
        }
      }
      if (mounted) setLoading(false);
    };
    fetchAgent();
    return () => { mounted = false; };
  }, [studentProfile?.name, studentProfile?.accuracy, studentProfile?.streak, determineTrigger]);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatHistory((prev) => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);

    try {
      const resp = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [...chatHistory, { role: 'user', content: msg }],
          studentProfile,
          lessonTopic: msg,
          gradeLevel: studentProfile?.grade || 'Grade 3',
          mode: 'explain',
        }),
      });
      const data = await resp.json();
      setChatHistory((prev) => [...prev, { role: 'assistant', content: data.reply || 'I\'m here to help! Could you rephrase that?' }]);
    } catch (err) {
      console.warn('AI tutor chat failed:', err);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: 'Oops, connection issue. Try again!' }]);
    }
    setChatLoading(false);
  };

  if (dismissed || loading) {
    if (loading) return (
      <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', animation: 'fadeInSlide 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{'\uD83E\uDD16'}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>AI Agent is thinking...</div>
        </div>
      </div>
    );
    if (dismissed) return null;
  }

  if (!agentState) return null;

  const moodStyle = MOOD_STYLES[agentState.mood] || MOOD_STYLES.encouraging;
  const suggAction = SUGGESTION_ACTIONS[agentState.suggestion?.type] || SUGGESTION_ACTIONS.practice;

  return (
    <div style={{ animation: 'fadeInSlide 0.4s', marginBottom: 16 }}>
      {/* Agent card */}
      <div style={{
        borderRadius: 14, border: `1px solid ${moodStyle.border}`, background: moodStyle.bg,
        overflow: 'hidden', transition: 'all 0.2s',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${moodStyle.accent}, #7c3aed)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', flexShrink: 0,
          }}>{agentState.emoji || '\uD83E\uDD16'}</div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#1e293b' }}>{agentState.message}</div>

            {/* Suggestion button */}
            {agentState.suggestion && (
              <button type="button" onClick={() => onAction?.(agentState.suggestion)}
                style={{
                  marginTop: 10, padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: moodStyle.accent, color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                <span>{suggAction.icon}</span>
                {agentState.suggestion.label}
              </button>
            )}
            {agentState.suggestion?.reason && (
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{agentState.suggestion.reason}</div>
            )}
          </div>

          {/* Dismiss / expand controls */}
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button type="button" onClick={() => setChatOpen(!chatOpen)} title="Chat with Agent" style={{
              width: 26, height: 26, borderRadius: 6, border: '1px solid ' + moodStyle.border,
              background: 'transparent', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{'\uD83D\uDCAC'}</button>
            <button type="button" onClick={() => setDismissed(true)} title="Dismiss" style={{
              width: 26, height: 26, borderRadius: 6, border: '1px solid ' + moodStyle.border,
              background: 'transparent', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{'\u2715'}</button>
          </div>
        </div>

        {/* Inline chat */}
        {chatOpen && (
          <div style={{ borderTop: `1px solid ${moodStyle.border}`, padding: 12, background: '#fff' }}>
            <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 8 }}>
              {chatHistory.length === 0 && (
                <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: 10 }}>Ask me anything about math!</div>
              )}
              {chatHistory.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 6,
                }}>
                  <div style={{
                    maxWidth: '80%', padding: '8px 12px', borderRadius: 10,
                    background: m.role === 'user' ? moodStyle.accent : '#f1f5f9',
                    color: m.role === 'user' ? '#fff' : '#1e293b', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  }}>{m.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ fontSize: 12, color: '#94a3b8', padding: '4px 0' }}>{'\uD83E\uDD16'} Thinking...</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Ask me anything..." aria-label="Message your AI companion" disabled={chatLoading}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
                  fontSize: 13, boxSizing: 'border-box',
                }}
              />
              <button type="button" onClick={sendChat} disabled={chatLoading || !chatInput.trim()} style={{
                padding: '8px 14px', borderRadius: 8, border: 'none',
                background: chatInput.trim() ? moodStyle.accent : '#e2e8f0',
                color: chatInput.trim() ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>{'\u2191'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
