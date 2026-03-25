// src/components/Chatbot.jsx – QBot AI Chat Assistant
import React, { useState, useRef, useEffect } from 'react';
import qbotImg from '../assets/qbot.svg';

const API_URL = '/api/chat';

/**
 * Simple markdown renderer for QBot messages.
 * Handles: ```code blocks```, **bold**, `inline code`, and plain text.
 */
function renderMarkdown(text) {
  if (!text) return null;

  // Split on code blocks first: ```...```
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    // Code block
    if (part.startsWith('```') && part.endsWith('```')) {
      const inner = part.slice(3, -3);
      // Remove optional language tag on first line
      const lines = inner.split('\n');
      const firstLine = lines[0].trim();
      const isLangTag = /^[a-z]{1,12}$/i.test(firstLine);
      const code = isLangTag ? lines.slice(1).join('\n') : inner;

      return (
        <pre key={i} style={{
          margin: '8px 0', padding: '10px 12px', borderRadius: 8,
          background: '#1e293b', color: '#e2e8f0',
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: 13, lineHeight: 1.15, overflowX: 'auto',
          whiteSpace: 'pre', border: '1px solid #334155',
          letterSpacing: '0px',
        }}>
          {code.replace(/^\n/, '')}
        </pre>
      );
    }

    // Inline formatting: **bold** and `inline code`
    // Split on **bold** and `code` patterns
    const inlineParts = part.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
      <span key={i}>
        {inlineParts.map((seg, j) => {
          if (seg.startsWith('**') && seg.endsWith('**')) {
            return <strong key={j}>{seg.slice(2, -2)}</strong>;
          }
          if (seg.startsWith('`') && seg.endsWith('`')) {
            return (
              <code key={j} style={{
                padding: '1px 5px', borderRadius: 4,
                background: 'rgba(0,0,0,0.06)',
                fontFamily: '"Fira Code", "Courier New", monospace',
                fontSize: '0.92em',
              }}>
                {seg.slice(1, -1)}
              </code>
            );
          }
          return seg;
        })}
      </span>
    );
  });
}

const Chatbot = ({ context }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi there! I'm QBot, your math helper. Ask me anything — I'll work through it step by step!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          context: context || { grade: 'Grade 3', role: 'student' },
        }),
      });

      const data = await res.json();

      if (data.success && data.reply) {
        setMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setError(data.error || 'QBot could not respond. Please try again.');
      }
    } catch (err) {
      setError('Could not reach QBot. Make sure the server is running (node server/index.js).');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: "Chat cleared! Ask me a new question anytime." },
    ]);
    setError(null);
  };

  // Quick suggestion chips
  const suggestions = [
    'What is 347 + 285?',
    'How do I round 720 to the nearest 100?',
    'Compare 3/8 and 5/8',
    'What is perimeter?',
  ];

  return (
    <div style={{
      width: 380, maxWidth: 'calc(100vw - 32px)', height: 520, maxHeight: 'calc(100vh - 100px)',
      display: 'flex', flexDirection: 'column',
      background: '#fff', borderRadius: 20,
      boxShadow: '0 12px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '14px 18px',
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.3)',
          overflow: 'hidden',
        }}>
          <img src={qbotImg} alt="QBot" style={{ width: 32, height: 'auto' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>QBot</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            {loading ? 'Thinking...' : 'AI Math Tutor'}
          </div>
        </div>
        <button
          type="button"
          onClick={clearChat}
          title="Clear chat"
          style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: 'rgba(255,255,255,0.15)', cursor: 'pointer',
            color: '#fff', fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          &#x1F5D1;
        </button>
      </div>

      {/* ── Messages ── */}
      <div aria-live="polite" aria-label="Chat messages" role="log" style={{
        flex: 1, overflowY: 'auto', padding: '14px 14px 8px',
        display: 'flex', flexDirection: 'column', gap: 10,
        background: '#f8fafc',
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 8,
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
              }}>
                <img src={qbotImg} alt="" role="presentation" style={{ width: 20, height: 'auto' }} />
              </div>
            )}
            <div style={{
              maxWidth: '82%', padding: '10px 14px', borderRadius: 14,
              fontSize: 13, lineHeight: 1.6, wordBreak: 'break-word',
              whiteSpace: msg.role === 'user' ? 'pre-wrap' : 'normal',
              ...(msg.role === 'user'
                ? {
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff', borderBottomRightRadius: 4,
                    whiteSpace: 'pre-wrap',
                  }
                : {
                    background: '#fff', color: '#1e293b',
                    border: '1px solid #e2e8f0', borderBottomLeftRadius: 4,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }),
            }}>
              {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={qbotImg} alt="" role="presentation" style={{ width: 20, height: 'auto' }} />
            </div>
            <div style={{
              padding: '10px 16px', borderRadius: 14, background: '#fff',
              border: '1px solid #e2e8f0', borderBottomLeftRadius: 4,
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: 'qbot-dot 1.2s infinite', animationDelay: '0s' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: 'qbot-dot 1.2s infinite', animationDelay: '0.2s' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: 'qbot-dot 1.2s infinite', animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 10,
            background: '#fef2f2', border: '1px solid #fecaca',
            fontSize: 12, color: '#991b1b', lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* Quick suggestions (show only at start) */}
        {messages.length <= 1 && !loading && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
              Try asking:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  style={{
                    padding: '6px 12px', borderRadius: 20,
                    background: '#eff6ff', border: '1px solid #bfdbfe',
                    color: '#2563eb', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <form onSubmit={sendMessage} style={{
        padding: '10px 14px 14px', borderTop: '1px solid #f1f5f9',
        display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
        background: '#fff',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask QBot a math question..."
          aria-label="Type a message to QBot"
          disabled={loading}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12,
            border: '2px solid #e2e8f0', fontSize: 14, outline: 'none',
            transition: 'border-color 0.15s',
            background: loading ? '#f8fafc' : '#fff',
          }}
          onFocus={(e) => e.target.style.borderColor = '#2563eb'}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            width: 40, height: 40, borderRadius: 12, border: 'none',
            background: loading || !input.trim()
              ? '#e2e8f0'
              : 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#fff', fontSize: 18, cursor: loading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s',
          }}
        >
          &#x27A4;
        </button>
      </form>

      {/* Dot animation keyframes */}
      <style>{`
        @keyframes qbot-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
