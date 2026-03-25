import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import qbotImg from '../assets/qbot.svg';

/**
 * Qbot mascot – runs across the screen once when you land on a page,
 * then disappears completely so nothing is blocked.
 */

/* ── CSS keyframes injected once ── */
const STYLE_ID = 'qbot-animations';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes qbot-entrance {
      0%   { left: calc(100vw + 10px); }
      100% { left: -100px; }
    }
    @keyframes qbot-run-bob {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25%      { transform: translateY(-8px) rotate(-6deg); }
      50%      { transform: translateY(0) rotate(0deg); }
      75%      { transform: translateY(-8px) rotate(6deg); }
    }
  `;
  document.head.appendChild(style);
}

const Qbot = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(true);

  /* On every page navigation: show run, then hide completely */
  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 0, zIndex: 9999,
      animation: 'qbot-entrance 2s ease-in-out forwards',
      pointerEvents: 'none',
    }}>
      <div style={{ animation: 'qbot-run-bob 0.3s ease-in-out infinite' }}>
        <img src={qbotImg} alt="Qbot running" style={{
          width: 70, height: 'auto',
          transform: 'scaleX(-1)',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
        }} />
      </div>
    </div>
  );
};

export default Qbot;
