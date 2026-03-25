import React, { useEffect, useState } from 'react';

const COLORS = {
  info: { bg: '#eff6ff', border: '#93c5fd', text: '#1e3a8a' },
  warning: { bg: '#fffbeb', border: '#fcd34d', text: '#78350f' },
  success: { bg: '#ecfdf5', border: '#86efac', text: '#166534' },
  error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
};

export default function AppToaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (evt) => {
      const detail = evt?.detail;
      if (!detail?.id || !detail?.message) return;
      setToasts((prev) => [...prev, detail].slice(-4));
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== detail.id));
      }, detail.durationMs || 3200);
    };
    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => {
        const c = COLORS[t.type] || COLORS.info;
        return (
          <div key={t.id} role="status" style={{ minWidth: 240, maxWidth: 360, padding: '10px 12px', borderRadius: 10, border: `1px solid ${c.border}`, background: c.bg, color: c.text, boxShadow: '0 8px 20px rgba(0,0,0,0.12)', fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
