import React from 'react';

export default function LoopContinueButton({
  onClick,
  label = 'Continue →',
  fixed = true,
  zIndex = 9999,
  bottom = 24,
}) {
  const wrapperStyle = fixed
    ? {
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom,
        zIndex,
        animation: 'loopContinuePulse 2s ease-in-out infinite',
      }
    : {};

  return (
    <div style={wrapperStyle}>
      <style>{`
        @keyframes loopContinuePulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(5,150,105,0.4); }
          50% { box-shadow: 0 4px 30px rgba(5,150,105,0.7); }
        }
      `}</style>
      <button
        type="button"
        onClick={onClick}
        style={{
          padding: '16px 36px',
          fontSize: 17,
          fontWeight: 800,
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #059669, #047857)',
          color: '#fff',
          border: '2px solid #34d399',
          borderRadius: 14,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          whiteSpace: 'nowrap',
          letterSpacing: '0.02em',
          boxShadow: '0 4px 20px rgba(5,150,105,0.4)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {label}
      </button>
    </div>
  );
}
