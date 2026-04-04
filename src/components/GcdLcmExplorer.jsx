/**
 * GcdLcmExplorer — GCD (prime factors, Venn, factor number line), LCM (union, multiples line), a×b = GCD×LCM.
 */
import React, { useState, useCallback, useMemo, useId } from 'react';
import { COLOR, BTN_PRIMARY, BADGE } from '../utils/loopStyles';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap');

.gcdlcm-wrap {
  --a-color: #5C6BC0;
  --a-light: #E8EAF6;
  --a-mid: #9FA8DA;
  --b-color: #EF6C00;
  --b-light: #FFF3E0;
  --b-mid: #FFB74D;
  --shared-color: #00897B;
  --shared-light: #E0F2F1;
  --shared-dark: #00695C;
  --bg: #F5F7FA;
  --card: #FFFFFF;
  --text: #263238;
  --muted: #78909C;
  --radius: 16px;
  --shadow: 0 4px 24px rgba(0,0,0,0.07);
  --gcd-color: #00897B;
  --lcm-color: #8E24AA;
  --lcm-light: #F3E5F5;
  font-family: 'Nunito', sans-serif;
  color: var(--text);
  background: var(--bg);
  min-height: 0;
  padding: 20px;
  background-image:
    radial-gradient(circle at 10% 90%, rgba(92,107,194,0.06) 0%, transparent 50%),
    radial-gradient(circle at 90% 10%, rgba(239,108,0,0.06) 0%, transparent 50%);
  border-radius: var(--radius);
  box-sizing: border-box;
}
.gcdlcm-wrap * { box-sizing: border-box; }
.gcdlcm-wrap.gcdlcm-embedded {
  background: transparent;
  background-image: none;
  padding: 0;
}
.gcdlcm-wrap h1 {
  font-family: 'Fredoka', sans-serif;
  text-align: center;
  font-size: 2rem;
  margin: 0 0 2px;
}
.gcdlcm-wrap h1 .gcdlcm-gcd-title { color: var(--gcd-color); }
.gcdlcm-wrap h1 .gcdlcm-lcm-title { color: var(--lcm-color); }
.gcdlcm-wrap .gcdlcm-subtitle {
  text-align: center;
  color: var(--muted);
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0 0 22px;
}
.gcdlcm-wrap .gcdlcm-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.gcdlcm-wrap .gcdlcm-tab {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 9px 22px;
  border: 3px solid #CFD8DC;
  border-radius: 40px;
  background: white;
  cursor: pointer;
  transition: all 0.25s;
  color: var(--muted);
}
.gcdlcm-wrap .gcdlcm-tab:hover { border-color: var(--a-color); color: var(--a-color); }
.gcdlcm-wrap .gcdlcm-tab.gcdlcm-active {
  background: var(--a-color);
  border-color: var(--a-color);
  color: white;
  box-shadow: 0 4px 12px rgba(92,107,194,0.3);
}
.gcdlcm-wrap .gcdlcm-tab.gcdlcm-active[data-v="lcm"] {
  background: var(--lcm-color);
  border-color: var(--lcm-color);
  box-shadow: 0 4px 12px rgba(142,36,170,0.3);
}
.gcdlcm-wrap .gcdlcm-tab.gcdlcm-active[data-v="relation"] {
  background: var(--shared-color);
  border-color: var(--shared-color);
  box-shadow: 0 4px 12px rgba(0,137,123,0.3);
}
.gcdlcm-wrap .gcdlcm-card {
  max-width: 820px;
  margin: 0 auto 22px;
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 26px 22px;
  border: 2px solid #ECEFF1;
}
.gcdlcm-wrap.gcdlcm-embedded .gcdlcm-card {
  box-shadow: none;
  border: 1px solid ${COLOR.border};
}
.gcdlcm-wrap .gcdlcm-input-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.gcdlcm-wrap .gcdlcm-num-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.gcdlcm-wrap .gcdlcm-num-group label {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.gcdlcm-wrap .gcdlcm-num-group.gcdlcm-a-group label { color: var(--a-color); }
.gcdlcm-wrap .gcdlcm-num-group.gcdlcm-b-group label { color: var(--b-color); }
.gcdlcm-wrap .gcdlcm-num-input {
  width: 105px;
  font-family: 'Fredoka', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  border: 3px solid #CFD8DC;
  border-radius: 12px;
  padding: 8px;
  color: var(--text);
  background: #FAFAFA;
  outline: none;
  transition: border-color 0.2s;
}
.gcdlcm-wrap .gcdlcm-num-input:focus { background: white; }
.gcdlcm-wrap .gcdlcm-num-input.gcdlcm-a-in:focus { border-color: var(--a-color); }
.gcdlcm-wrap .gcdlcm-num-input.gcdlcm-b-in:focus { border-color: var(--b-color); }
.gcdlcm-wrap .gcdlcm-ampersand {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #B0BEC5;
  padding-top: 16px;
}
.gcdlcm-wrap .gcdlcm-section-label {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 12px;
  padding: 8px 16px;
  border-radius: 10px;
  text-align: center;
}
.gcdlcm-wrap .gcdlcm-section-label.gcdlcm-gcd-label { background: var(--shared-light); color: var(--gcd-color); }
.gcdlcm-wrap .gcdlcm-section-label.gcdlcm-lcm-label { background: var(--lcm-light); color: var(--lcm-color); }
.gcdlcm-wrap .gcdlcm-section-label.gcdlcm-rel-label { background: #E8F5E9; color: #2E7D32; }
.gcdlcm-wrap .gcdlcm-venn-wrap { display: flex; justify-content: center; margin: 18px 0; }
.gcdlcm-wrap .gcdlcm-factor-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin: 10px 0;
}
.gcdlcm-wrap .gcdlcm-chip {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 20px;
  animation: gcdlcm-popIn 0.3s ease-out both;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
@keyframes gcdlcm-popIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.gcdlcm-wrap .gcdlcm-chip-a { background: var(--a-light); color: var(--a-color); border: 2px solid var(--a-mid); }
.gcdlcm-wrap .gcdlcm-chip-b { background: var(--b-light); color: var(--b-color); border: 2px solid var(--b-mid); }
.gcdlcm-wrap .gcdlcm-chip-shared { background: var(--shared-light); color: var(--shared-color); border: 2px solid var(--shared-color); }
.gcdlcm-wrap .gcdlcm-chip-lcm { background: var(--lcm-light); color: var(--lcm-color); border: 2px solid #CE93D8; }
.gcdlcm-wrap .gcdlcm-numline-wrap { overflow-x: auto; padding: 10px 0; margin: 12px 0; }
.gcdlcm-wrap .gcdlcm-numline {
  display: flex;
  align-items: flex-end;
  gap: 0;
  min-width: max-content;
  padding: 0 10px;
}
.gcdlcm-wrap .gcdlcm-nl-tick {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 38px;
  flex-shrink: 0;
}
.gcdlcm-wrap .gcdlcm-nl-num {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: #B0BEC5;
  margin-bottom: 4px;
  min-height: 18px;
  transition: all 0.2s;
}
.gcdlcm-wrap .gcdlcm-nl-bar {
  width: 100%;
  height: 6px;
  background: #ECEFF1;
  border-radius: 3px;
  transition: all 0.3s;
}
.gcdlcm-wrap .gcdlcm-nl-tick.gcdlcm-a-mult .gcdlcm-nl-bar { background: var(--a-mid); height: 20px; border-radius: 4px; }
.gcdlcm-wrap .gcdlcm-nl-tick.gcdlcm-b-mult .gcdlcm-nl-bar { background: var(--b-mid); height: 20px; border-radius: 4px; }
.gcdlcm-wrap .gcdlcm-nl-tick.gcdlcm-both-mult .gcdlcm-nl-bar { background: var(--lcm-color); height: 32px; border-radius: 5px; }
.gcdlcm-wrap .gcdlcm-nl-tick.gcdlcm-a-mult .gcdlcm-nl-num { color: var(--a-color); font-size: 0.75rem; }
.gcdlcm-wrap .gcdlcm-nl-tick.gcdlcm-b-mult .gcdlcm-nl-num { color: var(--b-color); font-size: 0.75rem; }
.gcdlcm-wrap .gcdlcm-nl-tick.gcdlcm-both-mult .gcdlcm-nl-num { color: var(--lcm-color); font-size: 0.85rem; font-weight: 700; }
.gcdlcm-wrap .gcdlcm-nl-tick.gcdlcm-a-fact .gcdlcm-nl-bar { background: var(--a-mid); height: 20px; border-radius: 4px; }
.gcdlcm-wrap .gcdlcm-nl-tick.gcdlcm-b-fact .gcdlcm-nl-bar { background: var(--b-mid); height: 20px; border-radius: 4px; }
.gcdlcm-wrap .gcdlcm-nl-tick.gcdlcm-both-fact .gcdlcm-nl-bar { background: var(--gcd-color); height: 32px; border-radius: 5px; }
.gcdlcm-wrap .gcdlcm-nl-tick.gcdlcm-a-fact .gcdlcm-nl-num { color: var(--a-color); font-size: 0.75rem; }
.gcdlcm-wrap .gcdlcm-nl-tick.gcdlcm-b-fact .gcdlcm-nl-num { color: var(--b-color); font-size: 0.75rem; }
.gcdlcm-wrap .gcdlcm-nl-tick.gcdlcm-both-fact .gcdlcm-nl-num { color: var(--gcd-color); font-size: 0.85rem; font-weight: 700; }
.gcdlcm-wrap .gcdlcm-result-banner {
  text-align: center;
  padding: 16px;
  border-radius: 14px;
  margin-top: 14px;
  font-family: 'Fredoka', sans-serif;
}
.gcdlcm-wrap .gcdlcm-result-banner.gcdlcm-gcd-res { background: var(--shared-light); }
.gcdlcm-wrap .gcdlcm-result-banner.gcdlcm-lcm-res { background: var(--lcm-light); }
.gcdlcm-wrap .gcdlcm-result-banner.gcdlcm-rel-res { background: #E8F5E9; }
.gcdlcm-wrap .gcdlcm-result-big { font-size: 1.6rem; font-weight: 700; margin-bottom: 2px; }
.gcdlcm-wrap .gcdlcm-result-explain { font-size: 0.9rem; font-weight: 600; color: var(--muted); }
.gcdlcm-wrap .gcdlcm-result-big .gcdlcm-gcd-val { color: var(--gcd-color); }
.gcdlcm-wrap .gcdlcm-result-big .gcdlcm-lcm-val { color: var(--lcm-color); }
.gcdlcm-wrap .gcdlcm-result-big .gcdlcm-a-val { color: var(--a-color); }
.gcdlcm-wrap .gcdlcm-result-big .gcdlcm-b-val { color: var(--b-color); }
.gcdlcm-wrap .gcdlcm-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.gcdlcm-wrap .gcdlcm-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
}
.gcdlcm-wrap .gcdlcm-legend-dot { width: 14px; height: 14px; border-radius: 50%; }
.gcdlcm-wrap .gcdlcm-step-text {
  font-size: 0.92rem;
  font-weight: 600;
  color: #546E7A;
  text-align: center;
  margin: 8px 0;
  line-height: 1.5;
}
.gcdlcm-wrap .gcdlcm-step-text strong { color: var(--text); }
.gcdlcm-wrap .gcdlcm-relation-eq {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  padding: 20px;
  border-radius: 14px;
  background: #E8F5E9;
  margin: 14px 0;
  line-height: 1.8;
}
.gcdlcm-wrap .gcdlcm-relation-cards {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 14px 0;
}
.gcdlcm-wrap .gcdlcm-relation-card {
  padding: 14px 20px;
  border-radius: 12px;
  text-align: center;
}
@media (max-width: 600px) {
  .gcdlcm-wrap h1 { font-size: 1.5rem; }
  .gcdlcm-wrap .gcdlcm-card { padding: 16px 12px; }
  .gcdlcm-wrap .gcdlcm-num-input { width: 82px; font-size: 1.4rem; }
  .gcdlcm-wrap .gcdlcm-nl-tick { width: 28px; }
  .gcdlcm-wrap .gcdlcm-nl-num { font-size: 0.6rem; }
  .gcdlcm-wrap .gcdlcm-result-big { font-size: 1.3rem; }
  .gcdlcm-wrap .gcdlcm-relation-eq { font-size: 1.1rem; }
}
`;

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return a && b ? (a / gcd(a, b)) * b : 0;
}

function primeFactors(n) {
  const factors = [];
  let x = n;
  if (x < 2) return factors;
  for (let d = 2; d * d <= x; d += 1) {
    while (x % d === 0) {
      factors.push(d);
      x /= d;
    }
  }
  if (x > 1) factors.push(x);
  return factors;
}

function splitPrimeFactors(a, b) {
  const fa = primeFactors(a);
  const fb = primeFactors(b).slice();
  const shared = [];
  const onlyA = [];
  const onlyB = [];
  for (const p of fa) {
    const idx = fb.indexOf(p);
    if (idx !== -1) {
      shared.push(p);
      fb.splice(idx, 1);
    } else {
      onlyA.push(p);
    }
  }
  onlyB.push(...fb);
  return { shared, onlyA, onlyB };
}

function fmtList(arr) {
  return arr.length ? arr.join(' × ') : '—';
}

function VennDiagram({ onlyA, shared, onlyB, a, b }) {
  const uid = useId().replace(/:/g, '');
  const clipId = `gcdlcm-clip-${uid}`;
  const rA = 110;
  const rB = 110;
  const cx = 220;
  const overlap = 60;
  const cxA = cx - overlap;
  const cxB = cx + overlap;
  const cy = 120;
  const w = cx * 2;
  const h = 260;
  const gcdProduct = shared.length ? shared.reduce((p, v) => p * v, 1) : 1;
  const gcdLine = shared.length ? `${shared.join(' × ')} = ${gcdProduct}` : '1';

  return (
    <div className="gcdlcm-venn-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: 440 }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx={cxA} cy={cy} r={rA} fill="var(--a-light)" stroke="var(--a-color)" strokeWidth="2.5" opacity="0.7" />
        <circle cx={cxB} cy={cy} r={rB} fill="var(--b-light)" stroke="var(--b-color)" strokeWidth="2.5" opacity="0.7" />
        <defs>
          <clipPath id={clipId}>
            <circle cx={cxA} cy={cy} r={rA} />
          </clipPath>
        </defs>
        <circle cx={cxB} cy={cy} r={rB} fill="var(--shared-light)" clipPath={`url(#${clipId})`} opacity="0.8" />
        <text x={cxA - 55} y={30} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--a-color)">{a}</text>
        <text x={cxB + 55} y={30} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--b-color)">{b}</text>
        <text x={cxA - 45} y={cy - 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--a-color)">{fmtList(onlyA)}</text>
        <text x={cxA - 45} y={cy + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--muted)">{`only in ${a}`}</text>
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--shared-dark)">{fmtList(shared)}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--shared-color)">shared</text>
        <text x={cxB + 45} y={cy - 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--b-color)">{fmtList(onlyB)}</text>
        <text x={cxB + 45} y={cy + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--muted)">{`only in ${b}`}</text>
        <text x={cx} y={h - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--gcd-color)">{`GCD = ${gcdLine}`}</text>
      </svg>
    </div>
  );
}

function FactorNumberLine({ mode, a, b, maxEnd }) {
  const ticks = [];
  for (let i = 1; i <= maxEnd; i += 1) {
    if (mode === 'factor') {
      const inA = a % i === 0;
      const inB = b % i === 0;
      let cls = '';
      if (inA && inB) cls = 'gcdlcm-both-fact';
      else if (inA) cls = 'gcdlcm-a-fact';
      else if (inB) cls = 'gcdlcm-b-fact';
      ticks.push(
        <div key={i} className={`gcdlcm-nl-tick ${cls}`}>
          <div className="gcdlcm-nl-num">{cls ? i : ''}</div>
          <div className="gcdlcm-nl-bar" />
        </div>,
      );
    } else {
      const inA = i % a === 0;
      const inB = i % b === 0;
      let cls = '';
      if (inA && inB) cls = 'gcdlcm-both-mult';
      else if (inA) cls = 'gcdlcm-a-mult';
      else if (inB) cls = 'gcdlcm-b-mult';
      ticks.push(
        <div key={i} className={`gcdlcm-nl-tick ${cls}`}>
          <div className="gcdlcm-nl-num">{cls ? i : ''}</div>
          <div className="gcdlcm-nl-bar" />
        </div>,
      );
    }
  }
  return (
    <div className="gcdlcm-numline-wrap">
      <div className="gcdlcm-numline">{ticks}</div>
    </div>
  );
}

function PrimeChips({ factors, variant, delayStep = 0.06 }) {
  if (!factors.length) {
    return <span className={`gcdlcm-chip gcdlcm-chip-${variant}`}>1</span>;
  }
  return factors.map((v, i) => (
    <span key={`${v}-${i}`} className={`gcdlcm-chip gcdlcm-chip-${variant}`} style={{ animationDelay: `${(delayStep * i).toFixed(3)}s` }}>
      {v}
    </span>
  ));
}

export default function GcdLcmExplorer({
  onComplete,
  continueLabel = 'Continue',
  badgeLabel,
  embedded = false,
}) {
  const [view, setView] = useState('gcd');
  const [a, setA] = useState(12);
  const [b, setB] = useState(18);

  const setAClamped = useCallback((raw) => {
    const n = parseInt(String(raw), 10);
    const v = Number.isFinite(n) ? n : 1;
    setA(Math.max(1, Math.min(120, v)));
  }, []);

  const setBClamped = useCallback((raw) => {
    const n = parseInt(String(raw), 10);
    const v = Number.isFinite(n) ? n : 1;
    setB(Math.max(1, Math.min(120, v)));
  }, []);

  const { g, l, pfA, pfB, split, lcmFactors } = useMemo(() => {
    const aa = Math.max(1, Math.min(120, a));
    const bb = Math.max(1, Math.min(120, b));
    const sp = splitPrimeFactors(aa, bb);
    const lcmF = [...sp.onlyA, ...sp.shared, ...sp.onlyB].sort((x, y) => x - y);
    return {
      g: gcd(aa, bb),
      l: lcm(aa, bb),
      pfA: primeFactors(aa),
      pfB: primeFactors(bb),
      split: sp,
      lcmFactors: lcmF,
    };
  }, [a, b]);

  const ca = Math.max(1, Math.min(120, a));
  const cb = Math.max(1, Math.min(120, b));
  const product = ca * cb;
  const maxFac = Math.max(ca, cb);
  const maxMult = Math.min(l + Math.max(ca, cb) * 2, 200);

  const { shared, onlyA, onlyB } = split;

  const gcdProductRow = shared.length ? (
    <>
      {shared.map((v, i) => (
        <React.Fragment key={`${v}-s-${i}`}>
          {i > 0 && <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--muted)', padding: '0 2px' }}>×</span>}
          <span className="gcdlcm-chip gcdlcm-chip-shared" style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}>{v}</span>
        </React.Fragment>
      ))}
      <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--muted)', padding: '0 6px' }}>=</span>
      <span className="gcdlcm-chip gcdlcm-chip-shared" style={{ fontSize: '1.1rem' }}>{g}</span>
    </>
  ) : (
    <>
      <span className="gcdlcm-chip gcdlcm-chip-shared">1</span>
      <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--muted)', padding: '0 6px' }}>=</span>
      <span className="gcdlcm-chip gcdlcm-chip-shared" style={{ fontSize: '1.1rem' }}>{g}</span>
    </>
  );

  const lcmUnionRow = lcmFactors.length ? (
    <>
      {lcmFactors.map((v, i) => {
        const inShared = shared.includes(v);
        const cls = inShared ? 'gcdlcm-chip-shared' : (onlyA.includes(v) ? 'gcdlcm-chip-a' : 'gcdlcm-chip-b');
        return (
          <React.Fragment key={`${v}-l-${i}`}>
            {i > 0 && <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--muted)', padding: '0 2px' }}>×</span>}
            <span className={`gcdlcm-chip ${cls}`} style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}>{v}</span>
          </React.Fragment>
        );
      })}
      <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--muted)', padding: '0 6px' }}>=</span>
      <span className="gcdlcm-chip gcdlcm-chip-lcm" style={{ fontSize: '1.1rem' }}>{l}</span>
    </>
  ) : (
    <>
      <span className="gcdlcm-chip gcdlcm-chip-lcm">1</span>
      <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--muted)', padding: '0 6px' }}>=</span>
      <span className="gcdlcm-chip gcdlcm-chip-lcm" style={{ fontSize: '1.1rem' }}>{l}</span>
    </>
  );

  let body = null;
  if (view === 'gcd') {
    body = (
      <>
        <div className="gcdlcm-section-label gcdlcm-gcd-label">Greatest Common Divisor (GCD)</div>
        <p className="gcdlcm-step-text"><strong>Step 1:</strong> Find the prime factorization of each number</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', margin: '8px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--a-color)', marginBottom: 4 }}>{`${ca} =`}</div>
            <div className="gcdlcm-factor-row"><PrimeChips factors={pfA} variant="a" /></div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--b-color)', marginBottom: 4 }}>{`${cb} =`}</div>
            <div className="gcdlcm-factor-row"><PrimeChips factors={pfB} variant="b" /></div>
          </div>
        </div>
        <p className="gcdlcm-step-text"><strong>Step 2:</strong> Find the <em>shared</em> prime factors (the intersection)</p>
        <VennDiagram onlyA={onlyA} shared={shared} onlyB={onlyB} a={ca} b={cb} />
        <p className="gcdlcm-step-text"><strong>Step 3:</strong> The GCD is the product of the shared factors</p>
        <div className="gcdlcm-factor-row">{gcdProductRow}</div>
        <p className="gcdlcm-step-text" style={{ marginTop: 16 }}>
          <strong>Verify:</strong> All factors on the number line — <span style={{ color: 'var(--gcd-color)', fontWeight: 800 }}>teal bars</span> are common factors
        </p>
        <FactorNumberLine mode="factor" a={ca} b={cb} maxEnd={maxFac} />
        <div className="gcdlcm-result-banner gcdlcm-gcd-res">
          <div className="gcdlcm-result-big">
            GCD(<span className="gcdlcm-a-val">{ca}</span>, <span className="gcdlcm-b-val">{cb}</span>) = <span className="gcdlcm-gcd-val">{g}</span>
          </div>
          <div className="gcdlcm-result-explain">{`The largest number that divides both ${ca} and ${cb} evenly`}</div>
        </div>
      </>
    );
  } else if (view === 'lcm') {
    body = (
      <>
        <div className="gcdlcm-section-label gcdlcm-lcm-label">Least Common Multiple (LCM)</div>
        <p className="gcdlcm-step-text"><strong>Step 1:</strong> Find the prime factorization of each number</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', margin: '8px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--a-color)', marginBottom: 4 }}>{`${ca} =`}</div>
            <div className="gcdlcm-factor-row"><PrimeChips factors={pfA} variant="a" /></div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--b-color)', marginBottom: 4 }}>{`${cb} =`}</div>
            <div className="gcdlcm-factor-row"><PrimeChips factors={pfB} variant="b" /></div>
          </div>
        </div>
        <p className="gcdlcm-step-text"><strong>Step 2:</strong> Take <em>all</em> prime factors at their highest power (the union)</p>
        <div className="gcdlcm-factor-row">{lcmUnionRow}</div>
        <p className="gcdlcm-step-text" style={{ marginTop: 16 }}>
          <strong>Step 3:</strong> Find it on the multiples number line — <span style={{ color: 'var(--lcm-color)', fontWeight: 800 }}>purple bars</span> are common multiples
        </p>
        <FactorNumberLine mode="mult" a={ca} b={cb} maxEnd={maxMult} />
        <div className="gcdlcm-result-banner gcdlcm-lcm-res">
          <div className="gcdlcm-result-big">
            LCM(<span className="gcdlcm-a-val">{ca}</span>, <span className="gcdlcm-b-val">{cb}</span>) = <span className="gcdlcm-lcm-val">{l}</span>
          </div>
          <div className="gcdlcm-result-explain">{`The smallest number that is a multiple of both ${ca} and ${cb}`}</div>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <div className="gcdlcm-section-label gcdlcm-rel-label">⚡ The Golden Relationship</div>
        <p className="gcdlcm-step-text">There&apos;s a beautiful connection between GCD and LCM:</p>
        <div className="gcdlcm-relation-eq">
          <span className="gcdlcm-a-val">{ca}</span> × <span className="gcdlcm-b-val">{cb}</span> = <span className="gcdlcm-gcd-val">GCD</span> × <span className="gcdlcm-lcm-val">LCM</span>
          <br />
          <span className="gcdlcm-a-val">{ca}</span> × <span className="gcdlcm-b-val">{cb}</span> = <span className="gcdlcm-gcd-val">{g}</span> × <span className="gcdlcm-lcm-val">{l}</span>
          <br />
          <span style={{ color: 'var(--text)' }}>{product}</span> = <span style={{ color: 'var(--text)' }}>{g * l}</span>
          {' '}
          {product === g * l ? '✅' : ''}
        </div>
        <p className="gcdlcm-step-text">This means you can find one from the other:</p>
        <div className="gcdlcm-relation-cards">
          <div className="gcdlcm-relation-card" style={{ background: 'var(--lcm-light)' }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--lcm-color)', fontSize: '0.9rem', marginBottom: 4 }}>Find LCM from GCD</div>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
              LCM = <span className="gcdlcm-a-val">{ca}</span> × <span className="gcdlcm-b-val">{cb}</span> ÷ <span className="gcdlcm-gcd-val">{g}</span> = <span className="gcdlcm-lcm-val">{l}</span>
            </div>
          </div>
          <div className="gcdlcm-relation-card" style={{ background: 'var(--shared-light)' }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: 'var(--gcd-color)', fontSize: '0.9rem', marginBottom: 4 }}>Find GCD from LCM</div>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
              GCD = <span className="gcdlcm-a-val">{ca}</span> × <span className="gcdlcm-b-val">{cb}</span> ÷ <span className="gcdlcm-lcm-val">{l}</span> = <span className="gcdlcm-gcd-val">{g}</span>
            </div>
          </div>
        </div>
        <p className="gcdlcm-step-text"><strong>Why?</strong> Look at the prime factors with a Venn diagram:</p>
        <VennDiagram onlyA={onlyA} shared={shared} onlyB={onlyB} a={ca} b={cb} />
        <p className="gcdlcm-step-text" style={{ marginTop: 10 }}>
          <strong>GCD</strong> = product of the <span style={{ color: 'var(--gcd-color)', fontWeight: 800 }}>overlap</span>
          {' '}
          |
          {' '}
          <strong>LCM</strong> = product of <span style={{ color: 'var(--lcm-color)', fontWeight: 800 }}>everything</span>
          <br />
          Multiplying a × b counts the overlap <em>twice</em>, so a × b = GCD × LCM.
        </p>
        <div className="gcdlcm-result-banner gcdlcm-rel-res">
          <div className="gcdlcm-result-big" style={{ color: '#2E7D32' }}>
            <span className="gcdlcm-a-val">a</span> × <span className="gcdlcm-b-val">b</span> = <span className="gcdlcm-gcd-val">GCD(a,b)</span> × <span className="gcdlcm-lcm-val">LCM(a,b)</span>
          </div>
          <div className="gcdlcm-result-explain">Always true for any two positive integers!</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className={`gcdlcm-wrap${embedded ? ' gcdlcm-embedded' : ''}`}>
        {!embedded && (
          <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple, marginBottom: 12 }}>
            {badgeLabel || 'Number theory'}
          </div>
        )}
        <h1>
          🔢 <span className="gcdlcm-gcd-title">GCD</span>
          {' & '}
          <span className="gcdlcm-lcm-title">LCM</span>
          {' '}
          Explorer
        </h1>
        <p className="gcdlcm-subtitle">Discover how numbers share factors and multiples!</p>

        <div className="gcdlcm-tabs">
          <button
            type="button"
            data-v="gcd"
            className={`gcdlcm-tab${view === 'gcd' ? ' gcdlcm-active' : ''}`}
            onClick={() => setView('gcd')}
          >
            🔍 GCD
          </button>
          <button
            type="button"
            data-v="lcm"
            className={`gcdlcm-tab${view === 'lcm' ? ' gcdlcm-active' : ''}`}
            onClick={() => setView('lcm')}
          >
            🔗 LCM
          </button>
          <button
            type="button"
            data-v="relation"
            className={`gcdlcm-tab${view === 'relation' ? ' gcdlcm-active' : ''}`}
            onClick={() => setView('relation')}
          >
            ⚡ The Connection
          </button>
        </div>

        <div className="gcdlcm-card">
          <div className="gcdlcm-input-row">
            <div className="gcdlcm-num-group gcdlcm-a-group">
              <label htmlFor="gcdlcm-a">Number A</label>
              <input
                id="gcdlcm-a"
                className="gcdlcm-num-input gcdlcm-a-in"
                type="number"
                min={1}
                max={120}
                value={a}
                onChange={(e) => setAClamped(e.target.value)}
              />
            </div>
            <div className="gcdlcm-ampersand">&amp;</div>
            <div className="gcdlcm-num-group gcdlcm-b-group">
              <label htmlFor="gcdlcm-b">Number B</label>
              <input
                id="gcdlcm-b"
                className="gcdlcm-num-input gcdlcm-b-in"
                type="number"
                min={1}
                max={120}
                value={b}
                onChange={(e) => setBClamped(e.target.value)}
              />
            </div>
          </div>
          {body}
        </div>

        <div className="gcdlcm-legend">
          <div className="gcdlcm-legend-item"><div className="gcdlcm-legend-dot" style={{ background: 'var(--a-color)' }} /> Number A</div>
          <div className="gcdlcm-legend-item"><div className="gcdlcm-legend-dot" style={{ background: 'var(--b-color)' }} /> Number B</div>
          <div className="gcdlcm-legend-item"><div className="gcdlcm-legend-dot" style={{ background: 'var(--gcd-color)' }} /> Shared (GCD)</div>
          <div className="gcdlcm-legend-item"><div className="gcdlcm-legend-dot" style={{ background: 'var(--lcm-color)' }} /> Common multiple (LCM)</div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button type="button" onClick={onComplete} style={BTN_PRIMARY}>
            {continueLabel}
          </button>
        </div>
      </div>
    </>
  );
}
