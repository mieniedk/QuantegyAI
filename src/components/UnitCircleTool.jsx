import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';

const KEY_ANGLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

const EXACT_VALUES = {
  0: { sin: '0', cos: '1' },
  30: { sin: '1/2', cos: 'sqrt(3)/2' },
  45: { sin: 'sqrt(2)/2', cos: 'sqrt(2)/2' },
  60: { sin: 'sqrt(3)/2', cos: '1/2' },
  90: { sin: '1', cos: '0' },
  120: { sin: 'sqrt(3)/2', cos: '-1/2' },
  135: { sin: 'sqrt(2)/2', cos: '-sqrt(2)/2' },
  150: { sin: '1/2', cos: '-sqrt(3)/2' },
  180: { sin: '0', cos: '-1' },
  210: { sin: '-1/2', cos: '-sqrt(3)/2' },
  225: { sin: '-sqrt(2)/2', cos: '-sqrt(2)/2' },
  240: { sin: '-sqrt(3)/2', cos: '-1/2' },
  270: { sin: '-1', cos: '0' },
  300: { sin: '-sqrt(3)/2', cos: '1/2' },
  315: { sin: '-sqrt(2)/2', cos: 'sqrt(2)/2' },
  330: { sin: '-1/2', cos: 'sqrt(3)/2' },
};

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function degreeToPiString(deg) {
  if (deg === 0) return '0';
  if (deg === 180) return 'pi';
  if (deg === 360) return '2pi';
  const num = deg;
  const den = 180;
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  if (n === 1 && d === 1) return 'pi';
  if (d === 1) return `${n}pi`;
  if (n === 1) return `pi/${d}`;
  return `${n}pi/${d}`;
}

function roundTo(v, d = 4) {
  return Math.round(v * 10 ** d) / 10 ** d;
}

export default function UnitCircleTool({ open, onClose }) {
  const [deg, setDeg] = useState(45);
  const panelRef = useRef(null);
  const dragState = useRef(null);
  const [pos, setPos] = useState({ x: -1, y: -1 });

  useEffect(() => {
    if (open && pos.x === -1) {
      const w = window.innerWidth;
      setPos({ x: Math.max(8, w - 360), y: 96 });
    }
  }, [open, pos.x]);

  const onDragStart = useCallback((e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragState.current = { startX: clientX - pos.x, startY: clientY - pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragState.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setPos({ x: clientX - dragState.current.startX, y: clientY - dragState.current.startY });
    };
    const onUp = () => { dragState.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  const trig = useMemo(() => {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const tan = Math.abs(cos) < 1e-10 ? 'undefined' : String(roundTo(sin / cos, 4));
    return {
      rad,
      x: roundTo(cos, 4),
      y: roundTo(sin, 4),
      tan,
      exact: EXACT_VALUES[deg] || null,
    };
  }, [deg]);

  if (!open) return null;

  const W = 300;
  const H = 300;
  const cx = W / 2;
  const cy = H / 2;
  const r = 110;
  const px = cx + trig.x * r;
  const py = cy - trig.y * r;

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
        width: 340,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: '#0f766e',
          color: '#fff',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>Unit Circle</span>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#ccfbf1', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}
          aria-label="Close unit circle tool"
        >
          x
        </button>
      </div>

      <div style={{ padding: 12 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', borderRadius: 10, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
          <line x1={0} y1={cy} x2={W} y2={cy} stroke="#94a3b8" strokeWidth="1.2" />
          <line x1={cx} y1={0} x2={cx} y2={H} stroke="#94a3b8" strokeWidth="1.2" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth="2" />
          <line x1={cx} y1={cy} x2={px} y2={py} stroke="#2563eb" strokeWidth="2.4" />
          <circle cx={px} cy={py} r="5" fill="#2563eb" />
          <text x={px + 8} y={py - 8} fontSize="11" fill="#0f172a">({trig.exact?.cos || trig.x}, {trig.exact?.sin || trig.y})</text>
          <text x={W - 20} y={cy - 6} fontSize="10" fill="#334155">x</text>
          <text x={cx + 6} y={14} fontSize="10" fill="#334155">y</text>
        </svg>

        <div style={{ marginTop: 10 }}>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={deg}
            onChange={(e) => setDeg(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: '#334155', display: 'grid', gap: 4 }}>
          <div><strong>theta:</strong> {deg} deg ({degreeToPiString(deg)})</div>
          <div><strong>sin(theta):</strong> {trig.exact?.sin || trig.y}</div>
          <div><strong>cos(theta):</strong> {trig.exact?.cos || trig.x}</div>
          <div><strong>tan(theta):</strong> {trig.tan}</div>
        </div>

        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {KEY_ANGLES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setDeg(a)}
              style={{
                padding: '7px 4px',
                borderRadius: 8,
                border: `1px solid ${deg === a ? '#0f766e' : '#cbd5e1'}`,
                background: deg === a ? '#ccfbf1' : '#fff',
                color: '#0f172a',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {a} deg
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
