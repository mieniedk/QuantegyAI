import React, { useState, useRef, useEffect, useCallback } from 'react';

const COLORS = ['#111827', '#dc2626', '#2563eb', '#059669', '#d97706', '#7c3aed'];
const SIZES = [2, 4, 8];

export default function ScratchPad({ open, onClose }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const dragState = useRef(null);
  const [pos, setPos] = useState({ x: -1, y: -1 });
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [eraser, setEraser] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const W = 380, H = 300;

  useEffect(() => {
    if (open && pos.x === -1) {
      setPos({ x: 16, y: Math.max(60, Math.round(window.innerHeight / 2 - H / 2 - 40)) });
    }
  }, [open, pos.x]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
  }, [open, minimized]);

  const getXY = useCallback((e) => {
    const cvs = canvasRef.current;
    if (!cvs) return { x: 0, y: 0 };
    const rect = cvs.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (cvs.width / rect.width),
      y: (clientY - rect.top) * (cvs.height / rect.height),
    };
  }, []);

  const startDraw = useCallback((e) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = getXY(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [getXY]);

  const draw = useCallback((e) => {
    if (!drawing.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getXY(e);
    ctx.strokeStyle = eraser ? '#ffffff' : color;
    ctx.lineWidth = eraser ? size * 4 : size;
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [getXY, color, size, eraser]);

  const stopDraw = useCallback(() => { drawing.current = false; }, []);

  const clearCanvas = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, W * 2, H * 2);
  }, []);

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

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999,
        width: W, background: '#fff', borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Title bar */}
      <div
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', background: '#1e293b', color: '#fff', cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
          {'\u270F\uFE0F'} Scratch Pad
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button type="button" onClick={() => setMinimized((m) => !m)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }} aria-label={minimized ? 'Expand' : 'Minimize'}>
            {minimized ? '\u25A1' : '\u2012'}
          </button>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }} aria-label="Close scratch pad">
            {'\u2715'}
          </button>
        </div>
      </div>

      {!minimized && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
            {/* Colors */}
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setColor(c); setEraser(false); }}
                aria-label={`Color ${c}`}
                style={{
                  width: 22, height: 22, borderRadius: '50%', border: color === c && !eraser ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  background: c, cursor: 'pointer', padding: 0, flexShrink: 0,
                  boxShadow: color === c && !eraser ? '0 0 0 2px #bfdbfe' : 'none',
                }}
              />
            ))}

            <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 2px' }} />

            {/* Pen sizes */}
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setSize(s); setEraser(false); }}
                aria-label={`Pen size ${s}`}
                style={{
                  width: 26, height: 26, borderRadius: 6, border: size === s && !eraser ? '2px solid #2563eb' : '1px solid #d1d5db',
                  background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}
              >
                <div style={{ width: s + 2, height: s + 2, borderRadius: '50%', background: '#374151' }} />
              </button>
            ))}

            <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 2px' }} />

            {/* Eraser */}
            <button
              type="button"
              onClick={() => setEraser((e) => !e)}
              aria-label="Eraser"
              style={{
                padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: eraser ? '2px solid #2563eb' : '1px solid #d1d5db',
                background: eraser ? '#eff6ff' : '#f9fafb', color: '#374151',
              }}
            >
              Eraser
            </button>

            {/* Clear */}
            <button
              type="button"
              onClick={clearCanvas}
              aria-label="Clear scratch pad"
              style={{
                padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', marginLeft: 'auto',
              }}
            >
              Clear
            </button>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={W * 2}
            height={H * 2}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
            style={{
              width: W, height: H, background: '#fff',
              cursor: eraser ? 'cell' : 'crosshair', touchAction: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}
