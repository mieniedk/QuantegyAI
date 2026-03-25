// src/components/QBotFloating.jsx – Global floating QBot chat button + panel
import React, { useState } from 'react';
import Chatbot from './Chatbot';
import qbotImg from '../assets/qbot.svg';

const QBotFloating = ({ context }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div role="region" aria-label="QBot chat assistant" style={{
          position: 'fixed', bottom: 80, right: 20, zIndex: 10000,
          animation: 'qbot-panel-in 0.25s ease-out',
        }}>
          <Chatbot context={context} />
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? 'Close QBot chat' : 'Open QBot chat assistant'}
        title={open ? 'Close QBot' : 'Ask QBot'}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 10001,
          width: 56, height: 56, borderRadius: '50%',
          background: open
            ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
            : 'linear-gradient(135deg, #2563eb, #7c3aed)',
          border: 'none', cursor: 'pointer',
          boxShadow: open
            ? '0 4px 20px rgba(220,38,38,0.4)'
            : '0 4px 20px rgba(37,99,235,0.4), 0 0 0 4px rgba(37,99,235,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? (
          <span style={{ fontSize: 22, color: '#fff', fontWeight: 800, lineHeight: 1 }}>✕</span>
        ) : (
          <img src={qbotImg} alt="Ask QBot" style={{ width: 38, height: 'auto' }} />
        )}
      </button>

      {/* Pulse ring when closed (attention grabber, plays once) */}
      {!open && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 10000,
          width: 56, height: 56, borderRadius: '50%',
          border: '2px solid rgba(37,99,235,0.4)',
          animation: 'qbot-pulse 2s ease-out 1',
          pointerEvents: 'none',
        }} />
      )}

      <style>{`
        @keyframes qbot-panel-in {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes qbot-pulse {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default QBotFloating;
