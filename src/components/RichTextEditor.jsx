import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { sanitizeHtml } from '../utils/sanitize';

if (typeof window !== 'undefined') window.katex = katex;

/* ─── Custom Formula Blot for Quill 2.x ─── */
const Embed = Quill.import('blots/embed');

class FormulaBlot extends Embed {
  static create(value) {
    const node = super.create(value);
    if (typeof value === 'string') {
      try {
        katex.render(value, node, { throwOnError: false, displayMode: false });
      } catch (err) {
        console.debug('KaTeX render fallback:', err);
        node.textContent = value;
      }
      node.setAttribute('data-value', value);
    }
    return node;
  }
  static value(node) {
    return node.getAttribute('data-value');
  }
}
FormulaBlot.blotName = 'formula';
FormulaBlot.tagName = 'SPAN';
FormulaBlot.className = 'ql-formula';
Quill.register(FormulaBlot, true);

/* ─── Math Symbol Categories ─── */
const MATH_CATEGORIES = [
  {
    id: 'templates',
    label: '📐 Templates',
    symbols: [
      { display: '□/□', latex: '\\frac{}{}', tip: 'Fraction' },
      { display: 'x²', latex: '^{2}', tip: 'Square' },
      { display: 'xⁿ', latex: '^{}', tip: 'Exponent' },
      { display: 'x₁', latex: '_{}', tip: 'Subscript' },
      { display: '√x', latex: '\\sqrt{}', tip: 'Square root' },
      { display: 'ⁿ√x', latex: '\\sqrt[]{}', tip: 'nth root' },
      { display: '|x|', latex: '\\left|  \\right|', tip: 'Absolute value' },
      { display: '( )', latex: '\\left(  \\right)', tip: 'Parentheses' },
      { display: '[ ]', latex: '\\left[  \\right]', tip: 'Brackets' },
      { display: '{ }', latex: '\\left\\{  \\right\\}', tip: 'Braces' },
      { display: 'ā', latex: '\\overline{}', tip: 'Line segment / repeating decimal' },
      { display: 'a⃗', latex: '\\overrightarrow{}', tip: 'Ray / vector' },
    ],
  },
  {
    id: 'operators',
    label: '➕ Operators',
    symbols: [
      { display: '+', latex: '+' }, { display: '−', latex: '-' },
      { display: '×', latex: '\\times ' }, { display: '÷', latex: '\\div ' },
      { display: '·', latex: '\\cdot ' }, { display: '=', latex: '=' },
      { display: '≠', latex: '\\neq ' }, { display: '±', latex: '\\pm ' },
      { display: '<', latex: '<' }, { display: '>', latex: '>' },
      { display: '≤', latex: '\\leq ' }, { display: '≥', latex: '\\geq ' },
      { display: '≈', latex: '\\approx ' }, { display: '∝', latex: '\\propto ' },
    ],
  },
  {
    id: 'greek',
    label: 'αβ Greek',
    symbols: [
      { display: 'α', latex: '\\alpha ' }, { display: 'β', latex: '\\beta ' },
      { display: 'γ', latex: '\\gamma ' }, { display: 'δ', latex: '\\delta ' },
      { display: 'θ', latex: '\\theta ' }, { display: 'λ', latex: '\\lambda ' },
      { display: 'μ', latex: '\\mu ' }, { display: 'π', latex: '\\pi ' },
      { display: 'σ', latex: '\\sigma ' }, { display: 'φ', latex: '\\phi ' },
      { display: 'ω', latex: '\\omega ' }, { display: 'Δ', latex: '\\Delta ' },
      { display: 'Σ', latex: '\\Sigma ' }, { display: 'Ω', latex: '\\Omega ' },
    ],
  },
  {
    id: 'geometry',
    label: '📏 Geometry',
    symbols: [
      { display: '∠', latex: '\\angle ' }, { display: '△', latex: '\\triangle ' },
      { display: '⊥', latex: '\\perp ' }, { display: '∥', latex: '\\parallel ' },
      { display: '°', latex: '^\\circ ' }, { display: '≅', latex: '\\cong ' },
      { display: '~', latex: '\\sim ' },
    ],
  },
  {
    id: 'advanced',
    label: '∫ Advanced',
    symbols: [
      { display: '∑', latex: '\\sum_{i=1}^{n} ' }, { display: '∏', latex: '\\prod_{i=1}^{n} ' },
      { display: '∫', latex: '\\int_{a}^{b} ' }, { display: 'lim', latex: '\\lim_{x \\to } ' },
      { display: '∞', latex: '\\infty ' }, { display: 'log', latex: '\\log ' },
      { display: 'ln', latex: '\\ln ' }, { display: 'sin', latex: '\\sin ' },
      { display: 'cos', latex: '\\cos ' }, { display: 'tan', latex: '\\tan ' },
    ],
  },
];

const COMMON_EQUATIONS = [
  { label: 'a² + b² = c²', latex: 'a^2 + b^2 = c^2' },
  { label: 'A = πr²', latex: 'A = \\pi r^2' },
  { label: 'y = mx + b', latex: 'y = mx + b' },
  { label: 'A = ½bh', latex: 'A = \\frac{1}{2}bh' },
  { label: 'A = lw', latex: 'A = lw' },
  { label: 'P = 2l + 2w', latex: 'P = 2l + 2w' },
  { label: 'V = lwh', latex: 'V = lwh' },
  { label: 'd = rt', latex: 'd = rt' },
  { label: 'slope', latex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}' },
  { label: 'quadratic', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { label: 'C = 2πr', latex: 'C = 2\\pi r' },
  { label: 'V = πr²h', latex: 'V = \\pi r^2 h' },
];

/* ═══════════════════════════════════════════════
   Math Equation Dialog
   ═══════════════════════════════════════════════ */
function MathDialog({ onInsert, onClose }) {
  const [latex, setLatex] = useState('');
  const [category, setCategory] = useState('templates');
  const [tab, setTab] = useState('type');
  const inputRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (tab === 'type') setTimeout(() => inputRef.current?.focus(), 50);
  }, [tab]);

  useEffect(() => {
    if (!previewRef.current) return;
    if (latex.trim()) {
      try {
        katex.render(latex, previewRef.current, { throwOnError: false, displayMode: true });
      } catch (err) {
        console.debug('KaTeX preview fallback:', err);
        previewRef.current.textContent = 'Invalid expression';
      }
    } else {
      previewRef.current.innerHTML = '<span style="color:#94a3b8">Type or click symbols to build your equation</span>';
    }
  }, [latex]);

  const insertSymbol = (sym) => {
    const input = inputRef.current;
    if (!input) { setLatex(prev => prev + sym.latex); return; }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newVal = latex.slice(0, start) + sym.latex + latex.slice(end);
    setLatex(newVal);
    setTimeout(() => {
      const bracePos = sym.latex.indexOf('{}');
      const curPos = bracePos >= 0 ? start + bracePos + 1 : start + sym.latex.length;
      input.focus();
      input.setSelectionRange(curPos, curPos);
    }, 0);
  };

  const loadEquation = (eq) => {
    setLatex(eq.latex);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInsert = () => { if (latex.trim()) onInsert(latex.trim()); };

  const activeCat = MATH_CATEGORIES.find(c => c.id === category);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg,#7c3aed08,#2563eb08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>📐</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>Math Equation</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[{ id: 'type', label: '⌨️ Type' }, { id: 'draw', label: '✏️ Draw' }].map(t => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{
                padding: '6px 16px', borderRadius: 8,
                border: tab === t.id ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                background: tab === t.id ? '#f0e7ff' : '#fff', cursor: 'pointer',
                fontWeight: 700, fontSize: 13, color: tab === t.id ? '#7c3aed' : '#64748b',
              }}>{t.label}</button>
            ))}
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8', padding: 4 }}>✕</button>
        </div>

        {tab === 'type' ? (
          <div style={{ padding: 20, overflowY: 'auto', maxHeight: 'calc(90vh - 70px)' }}>
            {/* LaTeX input */}
            <label style={sectionLabel}>LaTeX Expression</label>
            <input
              ref={inputRef}
              type="text"
              value={latex}
              onChange={e => setLatex(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && latex.trim()) handleInsert(); if (e.key === 'Escape') onClose(); }}
              placeholder="e.g.  \frac{1}{2} + \sqrt{3}"
              style={latexInputStyle}
              autoComplete="off"
              spellCheck={false}
            />

            {/* Symbol palette */}
            <div style={{ display: 'flex', gap: 4, marginTop: 16, marginBottom: 10, flexWrap: 'wrap' }}>
              {MATH_CATEGORIES.map(cat => (
                <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} style={{
                  padding: '5px 12px', borderRadius: 8,
                  border: category === cat.id ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                  background: category === cat.id ? '#f0e7ff' : '#fff', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, color: category === cat.id ? '#7c3aed' : '#64748b',
                }}>{cat.label}</button>
              ))}
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
              gap: 6, marginBottom: 16,
            }}>
              {activeCat?.symbols.map((sym, i) => (
                <button key={i} type="button" onClick={() => insertSymbol(sym)} title={sym.tip || sym.latex}
                  style={symbolBtnStyle}>
                  {sym.display}
                </button>
              ))}
            </div>

            {/* Common equations */}
            <label style={sectionLabel}>Common Equations (STAAR / Algebra)</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {COMMON_EQUATIONS.map((eq, i) => (
                <button key={i} type="button" onClick={() => loadEquation(eq)} title={eq.latex}
                  style={eqBtnStyle}>
                  {eq.label}
                </button>
              ))}
            </div>

            {/* Preview */}
            <label style={sectionLabel}>Live Preview</label>
            <div ref={previewRef} style={previewStyle} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
              <button type="button" onClick={handleInsert} disabled={!latex.trim()} style={{
                ...insertBtnStyle,
                background: latex.trim() ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#e2e8f0',
                color: latex.trim() ? '#fff' : '#94a3b8',
                cursor: latex.trim() ? 'pointer' : 'default',
                boxShadow: latex.trim() ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
              }}>Insert Equation</button>
            </div>
          </div>
        ) : (
          <DrawingCanvas
            onInsert={(dataUrl) => onInsert(null, dataUrl)}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Drawing Canvas — freehand math sketching
   ═══════════════════════════════════════════════ */
function DrawingCanvas({ onInsert, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState(3);
  const [penColor, setPenColor] = useState('#1e293b');
  const [isEraser, setIsEraser] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const lastPos = useRef(null);
  const undoStack = useRef([]);

  const drawGrid = useCallback((ctx, w, h) => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawGrid(canvas.getContext('2d'), canvas.width, canvas.height);
    undoStack.current = [canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)];
  }, [drawGrid]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    const prev = lastPos.current;
    const mid = { x: (prev.x + pos.x) / 2, y: (prev.y + pos.y) / 2 };
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
    ctx.strokeStyle = isEraser ? '#fff' : penColor;
    ctx.lineWidth = isEraser ? penSize * 5 : penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    if (!hasContent) setHasContent(true);
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (undoStack.current.length > 40) undoStack.current.shift();
    }
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas || undoStack.current.length <= 1) return;
    undoStack.current.pop();
    const prev = undoStack.current[undoStack.current.length - 1];
    canvas.getContext('2d').putImageData(prev, 0, 0);
    if (undoStack.current.length <= 1) setHasContent(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawGrid(ctx, canvas.width, canvas.height);
    undoStack.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    setHasContent(false);
  };

  const handleInsert = () => {
    onInsert(canvasRef.current.toDataURL('image/png'));
  };

  const PEN_COLORS = ['#1e293b', '#dc2626', '#2563eb', '#059669', '#7c3aed', '#d97706'];

  return (
    <div style={{ padding: 20 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setIsEraser(false)} style={{
          padding: '6px 14px', borderRadius: 8,
          border: !isEraser ? '2px solid #7c3aed' : '1px solid #e2e8f0',
          background: !isEraser ? '#f0e7ff' : '#fff', cursor: 'pointer',
          fontWeight: 700, fontSize: 12, color: !isEraser ? '#7c3aed' : '#64748b',
        }}>✏️ Pen</button>
        <button type="button" onClick={() => setIsEraser(true)} style={{
          padding: '6px 14px', borderRadius: 8,
          border: isEraser ? '2px solid #ea580c' : '1px solid #e2e8f0',
          background: isEraser ? '#fff7ed' : '#fff', cursor: 'pointer',
          fontWeight: 700, fontSize: 12, color: isEraser ? '#ea580c' : '#64748b',
        }}>🧹 Eraser</button>

        <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

        {PEN_COLORS.map(c => (
          <button key={c} type="button" onClick={() => { setPenColor(c); setIsEraser(false); }}
            style={{
              width: 24, height: 24, borderRadius: '50%', border: penColor === c && !isEraser ? '3px solid #7c3aed' : '2px solid #e2e8f0',
              background: c, cursor: 'pointer', padding: 0, flexShrink: 0,
            }} aria-label={`Color ${c}`} />
        ))}

        <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>Size:</span>
          <input type="range" min={1} max={10} value={penSize} onChange={e => setPenSize(Number(e.target.value))}
            style={{ width: 70, accentColor: '#7c3aed' }} />
        </div>

        <div style={{ flex: 1 }} />

        <button type="button" onClick={undo} disabled={undoStack.current.length <= 1} style={{
          padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
          cursor: 'pointer', fontWeight: 700, fontSize: 12, color: '#64748b',
          opacity: undoStack.current.length <= 1 ? 0.4 : 1,
        }}>↩ Undo</button>
        <button type="button" onClick={clearCanvas} style={{
          padding: '6px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff',
          cursor: 'pointer', fontWeight: 700, fontSize: 12, color: '#dc2626',
        }}>🗑 Clear</button>
      </div>

      {/* Canvas */}
      <div style={{ border: '2px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={560}
          height={300}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, textAlign: 'center' }}>
        Draw your equation with mouse, touch, or stylus. Use colors for emphasis.
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Image only — no math symbol conversion</span>
        <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
        <button type="button" onClick={handleInsert} disabled={!hasContent} style={{
          ...insertBtnStyle,
          background: hasContent ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#e2e8f0',
          color: hasContent ? '#fff' : '#94a3b8',
          cursor: hasContent ? 'pointer' : 'default',
          boxShadow: hasContent ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
        }}>Keep as image only</button>
      </div>
    </div>
  );
}

/* ─── Inline draw overlay: draw with pen directly in the editor area ─── */
function InlineDrawOverlay({ wrapperRef, onInsert, onClose }) {
  const canvasRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [canvasSize, setCanvasSize] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState(3);
  const [penColor, setPenColor] = useState('#1e293b');
  const [isEraser, setIsEraser] = useState(false);
  const [lineStyle, setLineStyle] = useState('solid'); // 'solid' | 'dotted'
  const [straightLineMode, setStraightLineMode] = useState(false); // true = draw straight line between two points
  const straightLineStart = useRef(null);
  const [hasContent, setHasContent] = useState(false);
  const lastPos = useRef(null);
  const undoStack = useRef([]);
  const hasInitedRef = useRef(false);

  useEffect(() => {
    if (!wrapperRef?.current) {
      setRect(null);
      return;
    }
    const el = wrapperRef.current.querySelector('.ql-container');
    if (el) {
      const update = () => setRect(el.getBoundingClientRect());
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    setRect(null);
  }, [wrapperRef]);

  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const updateSize = () => {
      const r = el.getBoundingClientRect();
      const w = r.width > 0 ? r.width : 400;
      const h = r.height > 0 ? r.height : 200;
      setCanvasSize({ w, h });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rect]);

  useEffect(() => {
    if (!canvasSize || !canvasRef.current || hasInitedRef.current) return;
    hasInitedRef.current = true;
    const canvas = canvasRef.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(canvasSize.w * dpr);
    canvas.height = Math.floor(canvasSize.h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    undoStack.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
  }, [canvasSize]);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    const t = e.touches?.[0] ?? e.changedTouches?.[0];
    if (t) {
      return { x: (t.clientX - r.left) * scaleX, y: (t.clientY - r.top) * scaleY };
    }
    return { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
  }, []);

  const startDraw = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    const ctx = canvasRef.current.getContext('2d');
    if (straightLineMode) {
      straightLineStart.current = pos;
      setIsDrawing(true);
      return;
    }
    setIsDrawing(true);
    lastPos.current = pos;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!canvasRef.current) return;
    if (straightLineMode) return; // straight line is drawn on pointer up only
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    const ctx = canvasRef.current.getContext('2d');
    const prev = lastPos.current;
    const mid = { x: (prev.x + pos.x) / 2, y: (prev.y + pos.y) / 2 };
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
    ctx.strokeStyle = isEraser ? '#fff' : penColor;
    ctx.lineWidth = isEraser ? penSize * 5 : penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash(lineStyle === 'dotted' ? [Math.max(2, penSize * 2), Math.max(2, penSize)] : []);
    ctx.stroke();
    lastPos.current = pos;
    if (!hasContent) setHasContent(true);
  };

  const stopDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (straightLineMode && straightLineStart.current) {
      const pos = getPos(e);
      if (pos) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.beginPath();
        ctx.moveTo(straightLineStart.current.x, straightLineStart.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize;
        ctx.lineCap = 'round';
        ctx.setLineDash(lineStyle === 'dotted' ? [Math.max(2, penSize * 2), Math.max(2, penSize)] : []);
        ctx.stroke();
        undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (undoStack.current.length > 40) undoStack.current.shift();
        setHasContent(true);
      }
      straightLineStart.current = null;
    } else if (isDrawing) {
      undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (undoStack.current.length > 40) undoStack.current.shift();
    }
    setIsDrawing(false);
    lastPos.current = null;
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas || undoStack.current.length <= 1) return;
    undoStack.current.pop();
    const prev = undoStack.current[undoStack.current.length - 1];
    canvas.getContext('2d').putImageData(prev, 0, 0);
    if (undoStack.current.length <= 1) setHasContent(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    undoStack.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    setHasContent(false);
  };

  const handleDone = () => {
    if (!canvasRef.current || !hasContent) return;
    onInsert(canvasRef.current.toDataURL('image/png'));
    onClose();
  };

  const PEN_COLORS = ['#1e293b', '#dc2626', '#2563eb', '#059669', '#7c3aed'];

  // Use editor rect if valid; otherwise center overlay so drawing always works
  const minOverlayW = 400;
  const minOverlayH = 340;
  const useRect = rect && rect.width >= 80 && rect.height >= 120;
  const overlayStyle = useRect
    ? {
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: Math.max(rect.width, minOverlayW),
        height: Math.max(rect.height, minOverlayH),
        zIndex: 10000,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        border: '2px solid #7c3aed',
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      }
    : {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: Math.min(minOverlayW + 80, typeof window !== 'undefined' ? window.innerWidth * 0.92 : 520),
        height: Math.min(minOverlayH + 60, typeof window !== 'undefined' ? window.innerHeight * 0.75 : 420),
        zIndex: 10000,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        border: '2px solid #7c3aed',
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      };

  return (
    <div style={overlayStyle}>
      {/* Top toolbar: Pen, Line, Eraser, line style, colors, etc. */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }}>
        <button type="button" onClick={() => { setIsEraser(false); setStraightLineMode(false); }} style={{
          padding: '4px 10px', borderRadius: 6, border: !isEraser && !straightLineMode ? '2px solid #7c3aed' : '1px solid #e2e8f0',
          background: !isEraser && !straightLineMode ? '#f0e7ff' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 11, color: !isEraser && !straightLineMode ? '#7c3aed' : '#64748b',
        }}>Pen</button>
        <button type="button" onClick={() => { setIsEraser(false); setStraightLineMode(true); }} style={{
          padding: '4px 10px', borderRadius: 6, border: straightLineMode ? '2px solid #059669' : '1px solid #e2e8f0',
          background: straightLineMode ? '#d1fae5' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 11, color: straightLineMode ? '#059669' : '#64748b',
        }} title="Draw straight lines (e.g. for functions)">Line</button>
        <button type="button" onClick={() => { setIsEraser(true); setStraightLineMode(false); }} style={{
          padding: '4px 10px', borderRadius: 6, border: isEraser ? '2px solid #ea580c' : '1px solid #e2e8f0',
          background: isEraser ? '#fff7ed' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 11, color: isEraser ? '#ea580c' : '#64748b',
        }}>Eraser</button>
        <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 2 }}>|</span>
        <button type="button" onClick={() => setLineStyle('solid')} style={{
          padding: '4px 8px', borderRadius: 6, border: lineStyle === 'solid' ? '2px solid #2563eb' : '1px solid #e2e8f0',
          background: lineStyle === 'solid' ? '#dbeafe' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 11, color: lineStyle === 'solid' ? '#2563eb' : '#64748b',
        }} title="Solid stroke">Solid</button>
        <button type="button" onClick={() => setLineStyle('dotted')} style={{
          padding: '4px 8px', borderRadius: 6, border: lineStyle === 'dotted' ? '2px solid #2563eb' : '1px solid #e2e8f0',
          background: lineStyle === 'dotted' ? '#dbeafe' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 11, color: lineStyle === 'dotted' ? '#2563eb' : '#64748b',
        }} title="Dashed/dotted stroke">Dotted</button>
        {PEN_COLORS.map(c => (
          <button key={c} type="button" onClick={() => { setPenColor(c); setIsEraser(false); }}
            style={{
              width: 20, height: 20, borderRadius: '50%', border: penColor === c && !isEraser ? '2px solid #7c3aed' : '1px solid #e2e8f0',
              background: c, cursor: 'pointer', padding: 0, flexShrink: 0,
            }} aria-label={`Color ${c}`} />
        ))}
        <input type="range" min={1} max={8} value={penSize} onChange={e => setPenSize(Number(e.target.value))} style={{ width: 60, accentColor: '#7c3aed' }} />
        <button type="button" onClick={undo} disabled={!undoStack.current || undoStack.current.length <= 1} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#64748b', opacity: undoStack.current?.length <= 1 ? 0.5 : 1 }}>Undo</button>
        <button type="button" onClick={clearCanvas} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#dc2626' }}>Clear</button>
      </div>
      {/* Canvas: minimum height so drawing always works */}
      <div ref={canvasWrapRef} style={{ flex: 1, minHeight: 180, position: 'relative', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: 'block', cursor: 'crosshair', pointerEvents: 'auto' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
      {/* Bottom bar: clear choice — Insert as image OR Cancel (no text conversion) */}
      <div style={{ flexShrink: 0, padding: '12px 14px', borderTop: '2px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Add your drawing to the message:</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" onClick={handleDone} disabled={!hasContent} style={{
            padding: '12px 20px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700,
            background: hasContent ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#e2e8f0',
            color: hasContent ? '#fff' : '#94a3b8', cursor: hasContent ? 'pointer' : 'default',
            boxShadow: hasContent ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
          }}>
            ✓ Insert as image (keep as drawing)
          </button>
          <span style={{ fontSize: 12, color: '#64748b' }}>— stays a picture, not converted to text</span>
          <button type="button" onClick={onClose} style={{
            padding: '12px 18px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff',
            cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#64748b',
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Toolbar Configuration
   ═══════════════════════════════════════════════ */
const TOOLBAR_FULL = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  [{ align: [] }],
  ['link', 'image', 'video'],
  ['formula', 'draw'],
  ['clean'],
];

const TOOLBAR_COMPACT = [
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'formula', 'draw', 'video'],
  ['clean'],
];

const FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'blockquote', 'code-block',
  'align', 'link', 'image', 'video', 'formula',
];

/* ═══════════════════════════════════════════════
   Main RichTextEditor Component
   ═══════════════════════════════════════════════ */
export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write something...',
  compact = false,
  minHeight = 120,
  readOnly = false,
  prominentDrawButton = false,
}) {
  const quillRef = useRef(null);
  const wrapperRef = useRef(null);
  const [showMathDialog, setShowMathDialog] = useState(false);
  const [showDrawDialog, setShowDrawDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const cursorRef = useRef(null);

  const handleFormulaBtn = useCallback(() => {
    const editor = quillRef.current?.getEditor?.();
    if (editor) cursorRef.current = editor.getSelection();
    setShowMathDialog(true);
  }, []);

  const handleDrawBtn = useCallback(() => {
    const editor = quillRef.current?.getEditor?.();
    if (editor) cursorRef.current = editor.getSelection();
    setShowDrawDialog(true);
  }, []);

  const handleDrawInsert = useCallback((dataUrl) => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor) { setShowDrawDialog(false); return; }
    const len = editor.getLength();
    const saved = cursorRef.current;
    const index = saved != null && typeof saved.index === 'number' && saved.index >= 0 && saved.index <= len
      ? saved.index
      : Math.max(0, len - 1);
    editor.insertEmbed(index, 'image', dataUrl, 'user');
    editor.setSelection(index + 1, 0, 'user');
    editor.focus();
    setShowDrawDialog(false);
  }, []);

  const handleVideoBtn = useCallback(() => {
    const editor = quillRef.current?.getEditor?.();
    if (editor) cursorRef.current = editor.getSelection();
    setVideoUrl('');
    setShowVideoDialog(true);
  }, []);

  const parseVideoUrl = (url) => {
    let m;
    m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
    m = url.match(/vimeo\.com\/(\d+)/);
    if (m) return `https://player.vimeo.com/video/${m[1]}`;
    return null;
  };

  const handleVideoInsert = useCallback(() => {
    const embedUrl = parseVideoUrl(videoUrl);
    if (!embedUrl) return;
    const editor = quillRef.current?.getEditor?.();
    if (!editor) { setShowVideoDialog(false); return; }
    const range = cursorRef.current || editor.getSelection(true) || { index: editor.getLength() - 1 };
    const html = `<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;margin:12px 0;"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
    editor.clipboard.dangerouslyPasteHTML(range.index, html, 'user');
    setShowVideoDialog(false);
    setVideoUrl('');
  }, [videoUrl]);

  const handleMathInsert = useCallback((latex, imageDataUrl) => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor) { setShowMathDialog(false); return; }
    const range = cursorRef.current || editor.getSelection(true) || { index: editor.getLength() - 1 };

    if (latex) {
      editor.insertEmbed(range.index, 'formula', latex, 'user');
      editor.setSelection(range.index + 1, 0, 'user');
    } else if (imageDataUrl) {
      editor.insertEmbed(range.index, 'image', imageDataUrl, 'user');
      editor.setSelection(range.index + 1, 0, 'user');
    }
    setShowMathDialog(false);
  }, []);

  // Use editor's raw HTML whenever content has images so drawings (data: URLs) stay unchanged
  const handleEditorChange = useCallback((content, delta, source, editor) => {
    if (editor && typeof editor.getHTML === 'function' && typeof content === 'string' && (content.includes('<img') || content.includes('data:'))) {
      const rawHtml = editor.getHTML();
      if (typeof rawHtml === 'string' && rawHtml.length > 0) {
        onChange(rawHtml);
        return;
      }
    }
    onChange(content);
  }, [onChange]);

  const modules = useMemo(() => ({
    toolbar: {
      container: compact ? TOOLBAR_COMPACT : TOOLBAR_FULL,
      handlers: { formula: handleFormulaBtn, draw: handleDrawBtn, video: handleVideoBtn },
    },
  }), [compact, handleFormulaBtn, handleDrawBtn, handleVideoBtn]);

  // When user uses a pen in the text box, open the draw panel so they can embed a figure (instead of device converting ink to text)
  const handleWrapperPointerDown = useCallback((e) => {
    if (readOnly || !prominentDrawButton) return;
    if (e.pointerType !== 'pen') return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const editorEl = wrapper.querySelector('.ql-editor');
    if (!editorEl || !editorEl.contains(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    handleDrawBtn();
  }, [readOnly, prominentDrawButton, handleDrawBtn]);

  return (
    <div
      ref={wrapperRef}
      className="rte-wrapper"
      style={{ borderRadius: 8, overflow: 'hidden', position: 'relative' }}
      onPointerDown={handleWrapperPointerDown}
    >
      {prominentDrawButton && !readOnly && (
        <button
          type="button"
          onClick={handleDrawBtn}
          style={{
            width: '100%',
            padding: '10px 14px',
            marginBottom: 8,
            borderRadius: 8,
            border: '2px solid #7c3aed',
            background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)',
            color: '#5b21b6',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 18 }}>✏️</span>
          Draw here or in the box below — then click &quot;Insert as image&quot; to embed (not convert to text)
        </button>
      )}
      <style>{`
        .rte-wrapper .ql-container { min-height: ${minHeight}px; font-size: 13px; font-family: inherit; }
        .rte-wrapper .ql-editor { min-height: ${minHeight}px; color: #0f172a !important; background: #fff !important; font-size: 13px !important; }
        .rte-wrapper .ql-toolbar { border-color: #e2e8f0 !important; background: #f8fafc; border-radius: 8px 8px 0 0; padding: 3px 6px !important; min-height: 28px !important; }
        .rte-wrapper .ql-snow .ql-toolbar button { height: 18px !important; width: 22px !important; padding: 1px 3px !important; }
        .rte-wrapper .ql-snow .ql-toolbar button svg { width: 12px !important; height: 12px !important; }
        .rte-wrapper .ql-snow .ql-toolbar .ql-formats { margin-right: 10px !important; }
        .rte-wrapper .ql-snow .ql-toolbar .ql-picker { height: 18px !important; font-size: 11px !important; }
        .rte-wrapper .ql-snow .ql-toolbar .ql-picker-label { padding: 0 4px !important; line-height: 18px !important; }
        .rte-wrapper .ql-snow .ql-toolbar .ql-picker.ql-expanded .ql-picker-options { padding: 2px 6px !important; }
        .rte-wrapper .ql-container { border-color: #e2e8f0 !important; border-radius: 0 0 8px 8px; background: #fff !important; }
        .rte-wrapper .ql-editor.ql-blank::before { color: #94a3b8; font-style: normal; font-size: 13px; }
        .rte-wrapper .ql-formula {
          cursor: pointer; padding: 2px 4px; background: #faf5ff; border-radius: 4px;
          border: 1px solid #e9d5ff; display: inline-block; vertical-align: middle;
        }
        .rte-wrapper .ql-snow .ql-toolbar button.ql-formula {
          width: auto !important; padding: 1px 5px !important; font-size: 11px; font-weight: 700;
        }
        .rte-wrapper .ql-snow .ql-toolbar button.ql-formula::after {
          content: '∑'; font-size: 11px; font-weight: 700; color: #7c3aed;
        }
        .rte-wrapper .ql-snow .ql-toolbar button.ql-formula:hover::after { color: #6d28d9; }
        .rte-wrapper .ql-snow .ql-toolbar button.ql-video {
          width: auto !important; padding: 1px 5px !important; font-size: 11px;
        }
        .rte-wrapper .ql-snow .ql-toolbar button.ql-video::after {
          content: '🎬'; font-size: 11px;
        }
        .rte-wrapper .ql-snow .ql-toolbar button.ql-video:hover { background: #f0f7ff; border-radius: 4px; }
        .rte-wrapper .ql-snow .ql-toolbar button.ql-draw {
          width: auto !important; padding: 1px 5px !important; font-size: 11px;
        }
        .rte-wrapper .ql-snow .ql-toolbar button.ql-draw svg { display: none; }
        .rte-wrapper .ql-snow .ql-toolbar button.ql-draw::after {
          content: '✏️ Draw'; font-size: 11px; font-weight: 600; color: #0f172a;
        }
        .rte-wrapper .ql-snow .ql-toolbar button.ql-draw:hover::after { color: #2563eb; }
        .video-embed iframe { max-width: 100%; }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleEditorChange}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder}
        readOnly={readOnly}
        useSemanticHTML={false}
      />
      {showMathDialog && (
        <MathDialog
          onInsert={handleMathInsert}
          onClose={() => setShowMathDialog(false)}
        />
      )}
      {showDrawDialog && (
        <InlineDrawOverlay
          wrapperRef={wrapperRef}
          onInsert={handleDrawInsert}
          onClose={() => setShowDrawDialog(false)}
        />
      )}
      {showVideoDialog && (
        <div style={overlayStyle} onClick={() => setShowVideoDialog(false)}>
          <div style={{ ...dialogStyle, maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>🎬 Embed Video</span>
              <button type="button" onClick={() => setShowVideoDialog(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              <label style={sectionLabel}>YouTube or Vimeo URL</label>
              <input
                type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleVideoInsert(); if (e.key === 'Escape') setShowVideoDialog(false); }}
                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                style={latexInputStyle} autoFocus
              />
              {videoUrl && !parseVideoUrl(videoUrl) && (
                <div style={{ color: '#dc2626', fontSize: 12, marginTop: 8 }}>Please enter a valid YouTube or Vimeo URL.</div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" onClick={() => setShowVideoDialog(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="button" onClick={handleVideoInsert} disabled={!videoUrl || !parseVideoUrl(videoUrl)} style={{
                  ...insertBtnStyle,
                  background: videoUrl && parseVideoUrl(videoUrl) ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : '#e2e8f0',
                  color: videoUrl && parseVideoUrl(videoUrl) ? '#fff' : '#94a3b8',
                  cursor: videoUrl && parseVideoUrl(videoUrl) ? 'pointer' : 'default',
                  boxShadow: videoUrl && parseVideoUrl(videoUrl) ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                }}>Embed Video</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  compact: PropTypes.bool,
  minHeight: PropTypes.number,
  readOnly: PropTypes.bool,
};

/* ═══════════════════════════════════════════════
   RichTextViewer — renders saved editor content
   ═══════════════════════════════════════════════ */
export function RichTextViewer({ html }) {
  if (!html) return null;
  return (
    <div
      className="ql-editor rich-viewer"
      style={{ padding: 0, fontSize: 14, lineHeight: 1.7, color: '#334155' }}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}

RichTextViewer.propTypes = {
  html: PropTypes.string,
};

/* ═══════════════════════════════════════════════
   Shared Styles
   ═══════════════════════════════════════════════ */
const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 10000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
};

const dialogStyle = {
  background: '#fff', borderRadius: 16, width: '95%', maxWidth: 620,
  maxHeight: '90vh', overflow: 'hidden',
  boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
};

const sectionLabel = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
};

const latexInputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '2px solid #e2e8f0', fontSize: 15, fontFamily: 'monospace',
  boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s',
};

const symbolBtnStyle = {
  padding: '10px 4px', borderRadius: 8, border: '1px solid #e2e8f0',
  background: '#f8fafc', cursor: 'pointer', fontSize: 16, fontWeight: 600,
  color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center',
  minHeight: 42, transition: 'all 0.12s',
};

const eqBtnStyle = {
  padding: '6px 12px', borderRadius: 8, border: '1px solid #e9d5ff',
  background: '#faf5ff', cursor: 'pointer', fontSize: 12, fontWeight: 700,
  color: '#7c3aed', whiteSpace: 'nowrap',
};

const previewStyle = {
  minHeight: 56, padding: '16px 20px', background: '#fafbfd', borderRadius: 10,
  border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center',
  justifyContent: 'center', fontSize: 22, overflowX: 'auto',
};

const cancelBtnStyle = {
  padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0',
  background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#64748b',
};

const insertBtnStyle = {
  padding: '10px 24px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14,
};
