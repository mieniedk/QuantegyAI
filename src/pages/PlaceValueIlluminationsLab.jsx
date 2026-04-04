import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

/**
 * Interactive visuals inspired by NCTM Interactive Institute (2015) workshop materials
 * on base-ten and place value (Place Value Triangle, Make It–Build It–Say It, renaming,
 * name-collection, skip counting / hundred chart). For teacher prep and classroom demos.
 */

const TAB_STYLE = (active) => ({
  padding: '10px 16px',
  borderRadius: 10,
  border: active ? '2px solid #2563eb' : '1px solid #e2e8f0',
  background: active ? 'rgba(37,99,235,0.08)' : '#fff',
  cursor: 'pointer',
  fontWeight: active ? 700 : 500,
  fontSize: 13,
  color: active ? '#1d4ed8' : '#475569',
});

function numberToWords(n) {
  if (n === 0) return 'zero';
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  if (n < 0) return 'negative ' + numberToWords(-n);
  if (n < 10) return ones[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o ? '-' + ones[o] : '');
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return ones[h] + ' hundred' + (rest ? ' ' + numberToWords(rest) : '');
  }
  return String(n);
}

function safeEvalInt(expr) {
  const t = String(expr || '').trim();
  if (!t || !/^[0-9+\-*/().\s]+$/.test(t)) return NaN;
  try {
    const v = Function('"use strict"; return (' + t + ')')();
    if (typeof v !== 'number' || !Number.isFinite(v)) return NaN;
    const r = Math.round(v);
    return Math.abs(v - r) < 1e-9 ? r : NaN;
  } catch {
    return NaN;
  }
}

function PlaceValueTriangleVisual() {
  const [example] = useState(32);
  const oralStandard = numberToWords(example).replace(/\b\w/g, (c) => c.toUpperCase());
  const tens = Math.floor(example / 10);
  const ones = example % 10;
  const oralBaseTen = `${tens === 1 ? 'One ten' : tens + ' tens'} and ${ones} ${ones === 1 ? 'one' : 'ones'}`;

  return (
    <div>
      <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
        The <strong>place value triangle</strong> links <em>saying</em> a number, <em>writing</em> it, and <em>base-ten structure</em>
        (standard and equivalent groupings). Tap each vertex for the example <strong>{example}</strong>.
      </p>
      <svg viewBox="0 0 420 340" style={{ width: '100%', maxWidth: 440, display: 'block', margin: '0 auto' }}>
        <defs>
          <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>
        </defs>
        <polygon points="210,28 380,288 40,288" fill="url(#triGrad)" stroke="#6366f1" strokeWidth="3" />
        <circle cx="210" cy="28" r="36" fill="#fff" stroke="#059669" strokeWidth="3" />
        <text x="210" y="34" textAnchor="middle" fontSize="11" fontWeight="800" fill="#065f46">Oral</text>
        <circle cx="380" cy="288" r="36" fill="#fff" stroke="#2563eb" strokeWidth="3" />
        <text x="380" y="294" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1d4ed8">Written</text>
        <circle cx="40" cy="288" r="42" fill="#fff" stroke="#d97706" strokeWidth="3" />
        <text x="40" y="286" textAnchor="middle" fontSize="10" fontWeight="800" fill="#b45309">Base-ten</text>
        <text x="40" y="300" textAnchor="middle" fontSize="9" fill="#b45309">concepts</text>
        <text x="210" y="175" textAnchor="middle" fontSize="14" fontWeight="700" fill="#312e81">Example: {example}</text>
      </svg>
      <div style={{ display: 'grid', gap: 10, marginTop: 16, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ padding: 12, borderRadius: 12, background: '#ecfdf5', border: '1px solid #86efac' }}>
          <strong style={{ color: '#065f46' }}>Oral — standard:</strong> <span style={{ fontWeight: 700 }}>{oralStandard}</span>
        </div>
        <div style={{ padding: 12, borderRadius: 12, background: '#fffbeb', border: '1px solid #fcd34d' }}>
          <strong style={{ color: '#b45309' }}>Oral — base-ten language:</strong> <span style={{ fontWeight: 700 }}>{oralBaseTen}</span>
        </div>
        <div style={{ padding: 12, borderRadius: 12, background: '#eff6ff', border: '1px solid #93c5fd' }}>
          <strong style={{ color: '#1d4ed8' }}>Written:</strong> <span style={{ fontSize: 22, fontWeight: 900 }}>{example}</span>
        </div>
      </div>
    </div>
  );
}

function MakeBuildSay() {
  const [tens, setTens] = useState(3);
  const [ones, setOnes] = useState(2);
  const value = tens * 10 + ones;
  const [quiz, setQuiz] = useState(null);
  const pickQuiz = useCallback(() => {
    const q = ['digit', 'value', 'place'][Math.floor(Math.random() * 3)];
    setQuiz(q);
  }, []);

  return (
    <div>
      <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 12 }}>
        <strong>Make It</strong> (choose digits) → <strong>Build It</strong> (see base-ten model) → <strong>Say It</strong> (read aloud).
        Extension: ask about <em>digit</em>, <em>value</em>, or <em>place</em>.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Tens digit</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 200 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button key={d} type="button" onClick={() => setTens(d)} style={{
                width: 36, height: 36, borderRadius: 8, border: tens === d ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: tens === d ? '#eff6ff' : '#fff', fontWeight: 800, cursor: 'pointer',
              }}>{d}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Ones digit</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 200 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button key={d} type="button" onClick={() => setOnes(d)} style={{
                width: 36, height: 36, borderRadius: 8, border: ones === d ? '2px solid #059669' : '1px solid #e2e8f0',
                background: ones === d ? '#ecfdf5' : '#fff', fontWeight: 800, cursor: 'pointer',
              }}>{d}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          {tens > 0 && (
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: tens }, (_, i) => (
                <div key={i} title="ten rod" style={{
                  width: 14, height: 100, borderRadius: 3, background: 'linear-gradient(180deg,#60a5fa,#2563eb)',
                  border: '1px solid #1e40af', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.15)',
                }} />
              ))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3, width: 11 * 5 + 12 }}>
            {Array.from({ length: ones }, (_, i) => (
              <div key={i} title="one cube" style={{
                width: 10, height: 10, borderRadius: 2, background: 'linear-gradient(135deg,#fcd34d,#f59e0b)',
                border: '1px solid #d97706',
              }} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', letterSpacing: 2 }}>{value}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#475569', marginTop: 4 }}>
            Say it: <em>{numberToWords(value).replace(/\b\w/g, (c) => c.toUpperCase())}</em>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
        <button type="button" onClick={pickQuiz} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}>
          Draw a question card
        </button>
        {quiz && (
          <p style={{ marginTop: 10, fontSize: 14, color: '#334155' }}>
            {quiz === 'digit' && (
              <>In <strong>{value}</strong>, what is the <strong>digit</strong> in the tens place? <strong>{tens}</strong></>
            )}
            {quiz === 'value' && (
              <>In <strong>{value}</strong>, what is the <strong>value</strong> of the digit in the tens place? <strong>{tens * 10}</strong></>
            )}
            {quiz === 'place' && (
              <>The digit <strong>{ones}</strong> is in which <strong>place</strong>? <strong>Ones</strong></>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function CompareIt() {
  const [a, setA] = useState(() => 10 + Math.floor(Math.random() * 80));
  const [b, setB] = useState(() => 10 + Math.floor(Math.random() * 80));
  const [picked, setPicked] = useState(null);
  const correct = a > b ? '>' : a < b ? '<' : '=';
  const next = () => {
    setA(10 + Math.floor(Math.random() * 80));
    setB(10 + Math.floor(Math.random() * 80));
    setPicked(null);
  };

  return (
    <div>
      <p style={{ color: '#475569', marginBottom: 12 }}>Place a symbol between the two numbers to make a true statement (workshop extension).</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{a}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {['<', '>', '='].map((sym) => (
            <button key={sym} type="button" onClick={() => setPicked(sym)} style={{
              width: 48, height: 48, fontSize: 22, fontWeight: 900, borderRadius: 10,
              border: picked === sym ? '3px solid #2563eb' : '1px solid #cbd5e1',
              background: picked === sym ? '#eff6ff' : '#fff', cursor: 'pointer',
            }}>{sym}</button>
          ))}
        </div>
        <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{b}</span>
      </div>
      {picked && (
        <p style={{ fontWeight: 700, color: picked === correct ? '#059669' : '#dc2626' }}>
          {picked === correct ? 'Correct — nice comparing!' : `Not quite — the true relation is ${correct}.`}
        </p>
      )}
      <button type="button" onClick={next} style={{ marginTop: 8, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#334155', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>New pair</button>
    </div>
  );
}

function RenameNumber() {
  const [target, setTarget] = useState(42);
  const [tensIn, setTensIn] = useState('');
  const [onesIn, setOnesIn] = useState('');
  const [msg, setMsg] = useState('');
  const check = () => {
    const t = parseInt(tensIn, 10);
    const o = parseInt(onesIn, 10);
    if (Number.isNaN(t) || Number.isNaN(o) || t < 0 || o < 0) {
      setMsg('Enter non-negative integers for tens and ones.');
      return;
    }
    if (t * 10 + o === target) setMsg('Yes — that is an equivalent grouping!');
    else setMsg(`That builds ${t * 10 + o}, not ${target}. Try again.`);
  };
  const newTarget = () => {
    const opts = [23, 35, 42, 47, 56, 63, 71, 85, 94];
    setTarget(opts[Math.floor(Math.random() * opts.length)]);
    setTensIn('');
    setOnesIn('');
    setMsg('');
  };

  return (
    <div>
      <p style={{ color: '#475569', marginBottom: 12 }}>
        How many ways can you <strong>rename</strong> a number using tens and ones? (e.g. 42 as 4 tens 2 ones, or 3 tens 12 ones.)
      </p>
      <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Target: {target}</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Tens</span>
          <input value={tensIn} onChange={(e) => setTensIn(e.target.value.replace(/\D/g, ''))} style={{ width: 64, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1' }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Ones</span>
          <input value={onesIn} onChange={(e) => setOnesIn(e.target.value.replace(/\D/g, ''))} style={{ width: 64, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1' }} />
        </label>
        <button type="button" onClick={check} style={{ padding: '8px 16px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Check</button>
        <button type="button" onClick={newTarget} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>New target</button>
      </div>
      {msg && <p style={{ marginTop: 10, fontWeight: 600, color: '#334155' }}>{msg}</p>}
    </div>
  );
}

function NameCollectionBox() {
  const [target, setTarget] = useState(48);
  const [expr, setExpr] = useState('');
  const [entries, setEntries] = useState([]);
  const add = () => {
    const v = safeEvalInt(expr);
    if (Number.isNaN(v)) {
      setEntries((prev) => [...prev, { expr, ok: false }]);
      setExpr('');
      return;
    }
    if (v === target) setEntries((prev) => [...prev, { expr, ok: true }]);
    else setEntries((prev) => [...prev, { expr, ok: false, got: v }]);
    setExpr('');
  };

  return (
    <div>
      <p style={{ color: '#475569', marginBottom: 12 }}>
        <strong>Name-collection box</strong> (UCSMP idea): fill the box with different expressions that equal the label. Use + − * / and parentheses — digits and operators only.
      </p>
      <div style={{
        border: '3px dashed #6366f1', borderRadius: 16, padding: 20, minHeight: 120, background: '#faf5ff',
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#5b21b6', marginBottom: 8 }}>LABEL</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#4c1d95' }}>{target}</div>
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {entries.map((e, i) => (
            <span key={i} style={{
              padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: e.ok ? '#d1fae5' : '#fee2e2', color: e.ok ? '#065f46' : '#991b1b',
            }}>
              {e.expr} {e.ok ? '✓' : `→ ${e.got}`}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder="e.g. 40 + 8 or (50 - 2) * 1"
          style={{ flex: '1 1 200px', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button type="button" onClick={add} style={{ padding: '10px 18px', borderRadius: 8, background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Add name</button>
        <button type="button" onClick={() => { setTarget(12 + Math.floor(Math.random() * 80)); setEntries([]); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>New label</button>
      </div>
    </div>
  );
}

function HundredChartSkip() {
  const [step, setStep] = useState(5);
  const [start, setStart] = useState(0);
  const cells = useMemo(() => Array.from({ length: 100 }, (_, i) => i + 1), []);
  const onPathSet = useMemo(() => {
    const s = new Set();
    for (let n = 1; n <= 100; n++) {
      if (start === 0) {
        if (n % step === 0) s.add(n);
      } else if (n % step === start) {
        s.add(n);
      }
    }
    return s;
  }, [step, start]);

  return (
    <div>
      <p style={{ color: '#475569', marginBottom: 12 }}>
        Skip-counting on a <strong>hundreds chart</strong> helps learners see structure (workshop Activity 3). Highlight a pattern by step size.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <label style={{ fontWeight: 600 }}>Step</label>
        {[2, 5, 10].map((s) => (
          <button key={s} type="button" onClick={() => setStep(s)} style={TAB_STYLE(step === s)}>Count by {s}</button>
        ))}
        <label style={{ fontWeight: 600, marginLeft: 8 }}>Start offset</label>
        <select value={start} onChange={(e) => setStart(Number(e.target.value))} style={{ padding: 8, borderRadius: 8 }}>
          {Array.from({ length: step }, (_, i) => (
            <option key={i} value={i}>{i === 0 ? '0 (from step)' : String(i)}</option>
          ))}
        </select>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 1fr)',
        gap: 4,
        maxWidth: 420,
        margin: '0 auto',
      }}>
        {cells.map((n) => {
          const onPath = onPathSet.has(n);
          return (
            <div
              key={n}
              style={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: onPath ? 800 : 500,
                borderRadius: 6,
                border: onPath ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: onPath ? '#dbeafe' : '#f8fafc',
                color: onPath ? '#1e3a8a' : '#64748b',
              }}
            >
              {n}
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: '#64748b', marginTop: 10 }}>
        Tip: Relate to a <strong>10×10 dot array</strong> — “how many rows of ten are visible?” (slide rows mentally) to connect to decade names.
      </p>
    </div>
  );
}

export default function PlaceValueIlluminationsLab() {
  const [tab, setTab] = useState('triangle');

  const tabs = [
    { id: 'triangle', label: 'Place value triangle' },
    { id: 'make', label: 'Make · Build · Say' },
    { id: 'compare', label: 'Compare' },
    { id: 'rename', label: 'Rename (tens & ones)' },
    { id: 'names', label: 'Name-collection box' },
    { id: 'chart', label: '100 chart skip count' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '24px 16px 48px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <Link to="/classroom-tools" style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>← Classroom tools</Link>
          {' · '}
          <Link to="/games" style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>Games</Link>
        </div>
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 26, color: '#0f172a' }}>Place value interactive lab</h1>
          <p style={{ margin: 0, color: '#475569', fontSize: 14, lineHeight: 1.55 }}>
            Visuals and activities aligned with <strong>NCTM Interactive Institute</strong> workshop ideas on base-ten structure:
            the place value triangle, composing and renaming, comparing, name-collection boxes, and skip counting on a hundreds chart.
            Use for pedagogy courses, elementary math methods, or student demos.
          </p>
        </header>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} style={TAB_STYLE(tab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
          {tab === 'triangle' && <PlaceValueTriangleVisual />}
          {tab === 'make' && <MakeBuildSay />}
          {tab === 'compare' && <CompareIt />}
          {tab === 'rename' && <RenameNumber />}
          {tab === 'names' && <NameCollectionBox />}
          {tab === 'chart' && <HundredChartSkip />}
        </div>
      </div>
    </div>
  );
}
