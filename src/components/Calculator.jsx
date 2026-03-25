import React, { useState, useCallback, useRef, useEffect } from 'react';

/* ── Exam → calculator type mapping ── */
export const CALC_TYPE_BY_EXAM = {
  math712: 'graphing',
  physicsMath612: 'graphing',
  math48: 'scientific',
  chemistry: 'scientific',
  physicalScience: 'scientific',
  science712: 'scientific',
  science48: 'scientific',
  lifeScience712: 'scientific',
  ec6: 'basic',
};

const CALC_LABELS = { graphing: 'Graphing (TI-84)', scientific: 'Scientific', basic: 'Calculator' };

/* ── Safe expression evaluator (no eval) ── */
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    if (/\s/.test(expr[i])) { i++; continue; }
    if (/\d/.test(expr[i]) || (expr[i] === '.' && i + 1 < expr.length && /\d/.test(expr[i + 1]))) {
      let num = '';
      while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) { num += expr[i++]; }
      tokens.push({ type: 'num', value: parseFloat(num) });
      continue;
    }
    if ('+-*/^%'.includes(expr[i])) {
      if (expr[i] === '-' && (tokens.length === 0 || tokens[tokens.length - 1].type === 'op' || tokens[tokens.length - 1].type === 'lparen')) {
        let num = '-';
        i++;
        while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) { num += expr[i++]; }
        if (num.length > 1) { tokens.push({ type: 'num', value: parseFloat(num) }); continue; }
        tokens.push({ type: 'num', value: 0 });
        tokens.push({ type: 'op', value: '-' });
        continue;
      }
      tokens.push({ type: 'op', value: expr[i++] });
      continue;
    }
    if (expr[i] === '(') { tokens.push({ type: 'lparen' }); i++; continue; }
    if (expr[i] === ')') { tokens.push({ type: 'rparen' }); i++; continue; }
    const rest = expr.slice(i).toLowerCase();
    const fns = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'abs'];
    let matched = false;
    for (const fn of fns) {
      if (rest.startsWith(fn) && (i + fn.length >= expr.length || !/[a-z]/i.test(expr[i + fn.length]))) {
        tokens.push({ type: 'fn', value: fn });
        i += fn.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    if (rest.startsWith('pi') || rest.startsWith('π')) {
      tokens.push({ type: 'num', value: Math.PI });
      i += rest.startsWith('pi') ? 2 : 1;
      continue;
    }
    if (rest.startsWith('e') && (i + 1 >= expr.length || !/[a-z]/i.test(expr[i + 1]))) {
      tokens.push({ type: 'num', value: Math.E });
      i++;
      continue;
    }
    i++;
  }
  return tokens;
}

function parseExpr(tokens, pos) {
  let [left, p] = parseTerm(tokens, pos);
  while (p < tokens.length && tokens[p].type === 'op' && (tokens[p].value === '+' || tokens[p].value === '-')) {
    const op = tokens[p].value; p++;
    const [right, np] = parseTerm(tokens, p);
    left = op === '+' ? left + right : left - right;
    p = np;
  }
  return [left, p];
}
function parseTerm(tokens, pos) {
  let [left, p] = parsePower(tokens, pos);
  while (p < tokens.length && tokens[p].type === 'op' && (tokens[p].value === '*' || tokens[p].value === '/' || tokens[p].value === '%')) {
    const op = tokens[p].value; p++;
    const [right, np] = parsePower(tokens, p);
    left = op === '*' ? left * right : op === '/' ? left / right : left % right;
    p = np;
  }
  return [left, p];
}
function parsePower(tokens, pos) {
  let [base, p] = parseUnary(tokens, pos);
  if (p < tokens.length && tokens[p].type === 'op' && tokens[p].value === '^') {
    p++;
    const [exp, np] = parsePower(tokens, p);
    base = Math.pow(base, exp);
    p = np;
  }
  return [base, p];
}
function parseUnary(tokens, pos) {
  if (pos < tokens.length && tokens[pos].type === 'fn') {
    const fn = tokens[pos].value; pos++;
    const [arg, p] = parseAtom(tokens, pos);
    const map = { sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, log: Math.log10, ln: Math.log, sqrt: Math.sqrt, abs: Math.abs };
    return [(map[fn] || ((x) => x))(arg), p];
  }
  return parseAtom(tokens, pos);
}
function parseAtom(tokens, pos) {
  if (pos >= tokens.length) return [0, pos];
  if (tokens[pos].type === 'num') return [tokens[pos].value, pos + 1];
  if (tokens[pos].type === 'lparen') {
    const [val, p] = parseExpr(tokens, pos + 1);
    return [val, p < tokens.length && tokens[p].type === 'rparen' ? p + 1 : p];
  }
  return [0, pos + 1];
}

function safeEval(expr) {
  try {
    const normalized = String(expr || '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/[−–]/g, '-')
      .replace(/\*\*/g, '^')
      .replace(/[ˆ˄]/g, '^')
      .replace(/⁰/g, '^0')
      .replace(/¹/g, '^1')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/⁴/g, '^4')
      .replace(/⁵/g, '^5')
      .replace(/⁶/g, '^6')
      .replace(/⁷/g, '^7')
      .replace(/⁸/g, '^8')
      .replace(/⁹/g, '^9');

    const tokens = tokenize(normalized);
    if (tokens.length === 0) return '';
    const [result] = parseExpr(tokens, 0);
    if (!isFinite(result)) return 'Error';
    const str = String(result);
    return str.length > 14 ? result.toPrecision(10) : str;
  } catch {
    return 'Error';
  }
}

/* ── Styles ── */
const BTN = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', borderRadius: 8, cursor: 'pointer',
  fontSize: 16, fontWeight: 600, fontFamily: 'inherit',
  transition: 'background 0.12s, transform 0.08s',
  minHeight: 44, padding: '6px 2px',
};
const NUM_BTN = { ...BTN, background: '#f3f4f6', color: '#111827' };
const OP_BTN = { ...BTN, background: '#3b82f6', color: '#fff' };
const FN_BTN = { ...BTN, background: '#e0e7ff', color: '#3730a3', fontSize: 13 };
const ACT_BTN = { ...BTN, background: '#fef3c7', color: '#92400e' };
const EQ_BTN = { ...BTN, background: '#10b981', color: '#fff', fontSize: 18, fontWeight: 800 };

/* ── Calculator component ── */
export default function Calculator({ mode = 'basic', open, onClose }) {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(0);
  const [hasResult, setHasResult] = useState(false);
  const [graphTab, setGraphTab] = useState(false);
  const [graphEq, setGraphEq] = useState('');
  const panelRef = useRef(null);
  const displayInputRef = useRef(null);
  const graphInputRef = useRef(null);
  const dragState = useRef(null);
  const [pos, setPos] = useState({ x: -1, y: -1 });

  useEffect(() => {
    if (open && pos.x === -1) {
      const w = window.innerWidth;
      setPos({ x: Math.max(8, w - 340), y: 80 });
    }
  }, [open, pos.x]);

  useEffect(() => {
    if (!open) return;
    // Keep typing focus on the active input surface.
    requestAnimationFrame(() => {
      if (graphTab) graphInputRef.current?.focus();
      else displayInputRef.current?.focus();
    });
  }, [open, graphTab]);

  const append = useCallback((v) => {
    setDisplay((d) => {
      if (hasResult && /[\d.π]/.test(v)) { setHasResult(false); return v; }
      setHasResult(false);
      if (d === '0' && v !== '.') return v;
      return d + v;
    });
  }, [hasResult]);

  const clear = useCallback(() => { setDisplay('0'); setHasResult(false); }, []);
  const backspace = useCallback(() => setDisplay((d) => d.length > 1 ? d.slice(0, -1) : '0'), []);
  const insertGraphAtCaret = useCallback((token) => {
    const input = graphInputRef.current;
    if (!input) {
      setGraphEq((v) => `${v}${token}`);
      return;
    }
    const start = input.selectionStart ?? graphEq.length;
    const end = input.selectionEnd ?? graphEq.length;
    const next = `${graphEq.slice(0, start)}${token}${graphEq.slice(end)}`;
    setGraphEq(next);
    requestAnimationFrame(() => {
      input.focus();
      const caret = start + token.length;
      input.setSelectionRange(caret, caret);
    });
  }, [graphEq]);
  const backspaceGraph = useCallback(() => {
    const input = graphInputRef.current;
    if (!input) {
      setGraphEq((v) => (v.length > 0 ? v.slice(0, -1) : v));
      return;
    }
    const start = input.selectionStart ?? graphEq.length;
    const end = input.selectionEnd ?? graphEq.length;
    if (start !== end) {
      const next = `${graphEq.slice(0, start)}${graphEq.slice(end)}`;
      setGraphEq(next);
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(start, start);
      });
      return;
    }
    if (start <= 0) return;
    const next = `${graphEq.slice(0, start - 1)}${graphEq.slice(end)}`;
    setGraphEq(next);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start - 1, start - 1);
    });
  }, [graphEq]);

  const evaluate = useCallback(() => {
    const r = safeEval(display);
    setDisplay(r === '' ? '0' : String(r));
    setHasResult(true);
  }, [display]);

  const toggleSign = useCallback(() => {
    setDisplay((d) => {
      if (d === '0' || d === 'Error') return d;
      return d.startsWith('-') ? d.slice(1) : '-' + d;
    });
  }, []);

  const onKey = useCallback((e) => {
    const target = e.target;
    if (
      target instanceof HTMLElement &&
      (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
    ) {
      return;
    }

    if (graphTab) {
      if (/[\d.+\-*/%^()]/.test(e.key)) { insertGraphAtCaret(e.key); e.preventDefault(); }
      else if (e.key === 'Backspace' || e.key === 'Delete') { backspaceGraph(); e.preventDefault(); }
      else if (e.key === 'Escape') { setGraphEq(''); }
      return;
    }

    if (/[\d.+\-*/%^()]/.test(e.key)) { append(e.key); e.preventDefault(); }
    else if (e.key === 'Enter' || e.key === '=') { evaluate(); e.preventDefault(); }
    else if (e.key === 'Backspace' || e.key === 'Delete') { backspace(); e.preventDefault(); }
    else if (e.key === 'Escape') { clear(); }
  }, [append, evaluate, backspace, clear, graphTab, insertGraphAtCaret, backspaceGraph]);

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

  const isScientific = mode === 'scientific' || mode === 'graphing';

  const numPad = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
      <button type="button" style={ACT_BTN} onClick={clear}>C</button>
      <button type="button" style={ACT_BTN} onClick={backspace}>&#9003;</button>
      <button type="button" style={OP_BTN} onClick={() => append('%')}>%</button>
      <button type="button" style={OP_BTN} onClick={() => append('/')}>÷</button>

      <button type="button" style={NUM_BTN} onClick={() => append('7')}>7</button>
      <button type="button" style={NUM_BTN} onClick={() => append('8')}>8</button>
      <button type="button" style={NUM_BTN} onClick={() => append('9')}>9</button>
      <button type="button" style={OP_BTN} onClick={() => append('*')}>×</button>

      <button type="button" style={NUM_BTN} onClick={() => append('4')}>4</button>
      <button type="button" style={NUM_BTN} onClick={() => append('5')}>5</button>
      <button type="button" style={NUM_BTN} onClick={() => append('6')}>6</button>
      <button type="button" style={OP_BTN} onClick={() => append('-')}>−</button>

      <button type="button" style={NUM_BTN} onClick={() => append('1')}>1</button>
      <button type="button" style={NUM_BTN} onClick={() => append('2')}>2</button>
      <button type="button" style={NUM_BTN} onClick={() => append('3')}>3</button>
      <button type="button" style={OP_BTN} onClick={() => append('+')}>+</button>

      <button type="button" style={NUM_BTN} onClick={toggleSign}>±</button>
      <button type="button" style={NUM_BTN} onClick={() => append('0')}>0</button>
      <button type="button" style={NUM_BTN} onClick={() => append('.')}>.</button>
      <button type="button" style={EQ_BTN} onClick={evaluate}>=</button>
    </div>
  );

  const sciPad = isScientific && !graphTab && (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, marginBottom: 6 }}>
      <button type="button" style={FN_BTN} onClick={() => append('sin(')}>sin</button>
      <button type="button" style={FN_BTN} onClick={() => append('cos(')}>cos</button>
      <button type="button" style={FN_BTN} onClick={() => append('tan(')}>tan</button>
      <button type="button" style={FN_BTN} onClick={() => append('(')}>{'('}</button>
      <button type="button" style={FN_BTN} onClick={() => append(')')}>{')'}</button>

      <button type="button" style={FN_BTN} onClick={() => append('asin(')}>sin⁻¹</button>
      <button type="button" style={FN_BTN} onClick={() => append('acos(')}>cos⁻¹</button>
      <button type="button" style={FN_BTN} onClick={() => append('atan(')}>tan⁻¹</button>
      <button type="button" style={FN_BTN} onClick={() => append('log(')}>log</button>
      <button type="button" style={FN_BTN} onClick={() => append('ln(')}>ln</button>

      <button type="button" style={FN_BTN} onClick={() => append('^')}>x^y</button>
      <button type="button" style={FN_BTN} onClick={() => append('sqrt(')}>√</button>
      <button type="button" style={FN_BTN} onClick={() => append('π')}>π</button>
      <button type="button" style={FN_BTN} onClick={() => append('e')}>e</button>
      <button type="button" style={FN_BTN} onClick={() => append('^2')}>x²</button>

      <button
        type="button"
        style={{ ...FN_BTN, fontSize: 11 }}
        onClick={() => setMemory((m) => {
          const value = parseFloat(display);
          return Number.isFinite(value) ? m + value : m;
        })}
      >
        M+
      </button>
      <button type="button" style={{ ...FN_BTN, fontSize: 11 }} onClick={() => { setDisplay(String(memory)); setHasResult(true); }}>MR</button>
      <button type="button" style={{ ...FN_BTN, fontSize: 11 }} onClick={() => setMemory(0)}>MC</button>
      <button type="button" style={FN_BTN} onClick={() => append('abs(')}>|x|</button>
      <button type="button" style={{ ...FN_BTN, fontSize: 11 }} onClick={() => append('^(1/')}>ⁿ√</button>
    </div>
  );

  const graphPanel = mode === 'graphing' && graphTab && (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>y =</span>
        <input
          ref={graphInputRef}
          type="text"
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={graphEq}
          onChange={(e) => setGraphEq(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="x^2 + 1"
          style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'monospace', outline: 'none' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5 }}>
        <button type="button" style={{ ...NUM_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('7')}>7</button>
        <button type="button" style={{ ...NUM_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('8')}>8</button>
        <button type="button" style={{ ...NUM_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('9')}>9</button>
        <button type="button" style={{ ...OP_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('+')}>+</button>
        <button type="button" style={{ ...OP_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('-')}>−</button>
        <button type="button" style={{ ...ACT_BTN, minHeight: 34, fontSize: 12 }} onClick={backspaceGraph}>⌫</button>

        <button type="button" style={{ ...NUM_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('4')}>4</button>
        <button type="button" style={{ ...NUM_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('5')}>5</button>
        <button type="button" style={{ ...NUM_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('6')}>6</button>
        <button type="button" style={{ ...OP_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('*')}>×</button>
        <button type="button" style={{ ...OP_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('/')}>÷</button>
        <button type="button" style={{ ...NUM_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('.')}>.</button>

        <button type="button" style={{ ...NUM_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('1')}>1</button>
        <button type="button" style={{ ...NUM_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('2')}>2</button>
        <button type="button" style={{ ...NUM_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('3')}>3</button>
        <button type="button" style={{ ...NUM_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('0')}>0</button>
        <button type="button" style={{ ...ACT_BTN, minHeight: 34, fontSize: 12 }} onClick={() => setGraphEq('')}>C</button>
        <button type="button" style={{ ...FN_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('π')}>π</button>

        <button type="button" style={{ ...FN_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('x')}>x</button>
        <button type="button" style={{ ...FN_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('^')}>^</button>
        <button type="button" style={{ ...FN_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('^2')}>x²</button>
        <button type="button" style={{ ...FN_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('(')}>(</button>
        <button type="button" style={{ ...FN_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret(')')}>)</button>
        <button type="button" style={{ ...FN_BTN, minHeight: 34, fontSize: 12 }} onClick={() => insertGraphAtCaret('sqrt(')}>√</button>
      </div>
      <GraphCanvas equation={graphEq} />
    </div>
  );

  return (
    <div
      ref={panelRef}
      tabIndex={0}
      onKeyDown={onKey}
      style={{
        position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999,
        width: 320, background: '#fff', borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        outline: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* drag handle */}
      <div
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', background: '#1e293b', color: '#fff', cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>{CALC_LABELS[mode] || 'Calculator'}</span>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }} aria-label="Close calculator">✕</button>
      </div>

      {/* graphing tabs */}
      {mode === 'graphing' && (
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button type="button" onClick={() => setGraphTab(false)} style={{ flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: !graphTab ? '#eff6ff' : '#fff', color: !graphTab ? '#2563eb' : '#6b7280', borderBottom: !graphTab ? '2px solid #2563eb' : '2px solid transparent' }}>Calculator</button>
          <button type="button" onClick={() => setGraphTab(true)} style={{ flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: graphTab ? '#eff6ff' : '#fff', color: graphTab ? '#2563eb' : '#6b7280', borderBottom: graphTab ? '2px solid #2563eb' : '2px solid transparent' }}>Graph</button>
        </div>
      )}

      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {!graphTab && (
          <>
            {/* display */}
            <input
              ref={displayInputRef}
              type="text"
              inputMode="decimal"
              value={display}
              onChange={(e) => {
                const sanitized = String(e.target.value || '')
                  .replace(/×/g, '*')
                  .replace(/÷/g, '/')
                  .replace(/[−–]/g, '-')
                  .replace(/[ˆ˄]/g, '^')
                  .replace(/[^0-9.+\-*/%^()πe]/gi, '');
                setDisplay(sanitized || '0');
                setHasResult(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === '=') { evaluate(); e.preventDefault(); }
                else if (e.key === 'Escape') { clear(); }
              }}
              style={{
              background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10,
              padding: '12px 14px', fontSize: 22, fontWeight: 700, fontFamily: 'monospace',
              textAlign: 'right', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', minHeight: 48, display: 'flex', alignItems: 'center',
              justifyContent: 'flex-end', outline: 'none', width: '100%',
            }}
              aria-label="Calculator display input"
            />
            {sciPad}
            {numPad}
          </>
        )}
        {graphPanel}
      </div>
    </div>
  );
}

/* ── Lightweight graphing canvas ── */
function GraphCanvas({ equation }) {
  const canvasRef = useRef(null);
  const W = 296;
  const H = 220;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    const xMin = -10, xMax = 10, yMin = -8, yMax = 8;
    const toX = (x) => ((x - xMin) / (xMax - xMin)) * W;
    const toY = (y) => H - ((y - yMin) / (yMax - yMin)) * H;

    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
    for (let x = Math.ceil(xMin); x <= xMax; x++) { ctx.beginPath(); ctx.moveTo(toX(x), 0); ctx.lineTo(toX(x), H); ctx.stroke(); }
    for (let y = Math.ceil(yMin); y <= yMax; y++) { ctx.beginPath(); ctx.moveTo(0, toY(y)); ctx.lineTo(W, toY(y)); ctx.stroke(); }

    ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(toX(0), 0); ctx.lineTo(toX(0), H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, toY(0)); ctx.lineTo(W, toY(0)); ctx.stroke();

    ctx.fillStyle = '#6b7280'; ctx.font = '10px sans-serif';
    for (let x = Math.ceil(xMin); x <= xMax; x += 2) { if (x !== 0) ctx.fillText(String(x), toX(x) - 4, toY(0) + 12); }
    for (let y = Math.ceil(yMin); y <= yMax; y += 2) { if (y !== 0) ctx.fillText(String(y), toX(0) + 4, toY(y) + 3); }

    if (!equation.trim()) return;

    const evalAt = (xVal) => {
      const prepared = String(equation || '')
        .replace(/[−–]/g, '-')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\*\*/g, '^')
        .replace(/[ˆ˄]/g, '^')
        .replace(/x/gi, `(${xVal})`)
        .replace(/(\d|π|e)\s*\(/gi, '$1*(')
        .replace(/\)\s*(\d|π|e)/gi, ')*$1')
        .replace(/\)\s*\(/g, ')*(')
        .replace(/(\d|\)|π|e)\s*(sin|cos|tan|asin|acos|atan|log|ln|sqrt|abs)\s*\(/gi, '$1*$2(');
      return safeEval(prepared);
    };

    ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    const steps = 600;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (xMax - xMin) * (i / steps);
      const yStr = evalAt(x);
      const y = parseFloat(yStr);
      if (isNaN(y) || !isFinite(y)) { started = false; continue; }
      const px = toX(x), py = toY(y);
      if (py < -50 || py > H + 50) { started = false; continue; }
      if (!started) { ctx.moveTo(px, py); started = true; } else { ctx.lineTo(px, py); }
    }
    ctx.stroke();
  }, [equation]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', width: '100%', height: 'auto' }}
    />
  );
}
