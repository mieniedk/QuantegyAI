/**
 * CommutativityExplorer — Addition (base-ten blocks), multiplication (array grid), subtraction (not commutative).
 */
import React, { useState, useCallback } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BADGE } from '../utils/loopStyles';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap');

.commex-wrap {
  --unit-color: #4FC3F7;
  --unit-border: #0288D1;
  --rod-color: #FFD54F;
  --rod-border: #F9A825;
  --flat-color: #AED581;
  --flat-border: #689F38;
  --bg: #FFF8E1;
  --card-bg: #FFFFFF;
  --text: #37474F;
  --accent: #FF7043;
  --accent-dark: #E64A19;
  --success: #66BB6A;
  --danger: #EF5350;
  --equal-bg: #E8F5E9;
  --notequal-bg: #FFEBEE;
  --shadow: 0 4px 20px rgba(0,0,0,0.08);
  --radius: 16px;
  font-family: 'Nunito', sans-serif;
  color: var(--text);
  background: var(--bg);
  background-image:
    radial-gradient(circle at 20% 80%, rgba(79,195,247,0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,213,79,0.1) 0%, transparent 50%);
  border-radius: var(--radius);
  padding: 20px;
  box-sizing: border-box;
}
.commex-wrap * { box-sizing: border-box; }
.commex-wrap.commex-embedded {
  background: transparent;
  background-image: none;
  padding: 0;
}
.commex-wrap h1 {
  font-family: 'Fredoka', sans-serif;
  text-align: center;
  font-size: 2rem;
  margin: 0 0 4px;
  color: var(--text);
}
.commex-wrap h1 span { color: var(--accent); }
.commex-wrap .commex-subtitle {
  text-align: center;
  font-size: 0.95rem;
  color: #78909C;
  margin: 0 0 24px;
  font-weight: 600;
}
.commex-wrap .commex-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.commex-wrap .commex-tab {
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  padding: 10px 24px;
  border: 3px solid #CFD8DC;
  border-radius: 40px;
  background: white;
  cursor: pointer;
  transition: all 0.25s;
  color: #78909C;
}
.commex-wrap .commex-tab:hover { border-color: var(--accent); color: var(--accent); }
.commex-wrap .commex-tab.commex-active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
  box-shadow: 0 4px 12px rgba(255,112,67,0.3);
}
.commex-wrap .commex-tab.commex-active.commex-tab-sub {
  background: var(--danger);
  border-color: var(--danger);
  box-shadow: 0 4px 12px rgba(239,83,80,0.3);
}
.commex-wrap .commex-card {
  max-width: 780px;
  margin: 0 auto 24px;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 28px 24px;
  border: 2px solid #ECEFF1;
}
.commex-wrap.commex-embedded .commex-card {
  margin-bottom: 16px;
  box-shadow: none;
  border: 1px solid ${COLOR.border};
}
.commex-wrap .commex-banner {
  background: linear-gradient(135deg, #E3F2FD, #F3E5F5);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 22px;
  font-size: 0.95rem;
  line-height: 1.5;
  font-weight: 600;
  color: #455A64;
  text-align: center;
}
.commex-wrap .commex-input-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.commex-wrap .commex-num-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.commex-wrap .commex-num-group label {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #90A4AE;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.commex-wrap .commex-num-input {
  width: 100px;
  font-family: 'Fredoka', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  border: 3px solid #CFD8DC;
  border-radius: 12px;
  padding: 8px;
  color: var(--text);
  background: #FAFAFA;
  transition: border-color 0.2s;
  outline: none;
}
.commex-wrap .commex-num-input:focus { border-color: var(--accent); background: white; }
.commex-wrap .commex-op-symbol {
  font-family: 'Fredoka', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
  padding-top: 18px;
}
.commex-wrap .commex-commute {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto 24px;
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 12px 32px;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.25s;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  box-shadow: 0 4px 16px rgba(255,112,67,0.3);
}
.commex-wrap .commex-commute:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255,112,67,0.4);
}
.commex-wrap .commex-commute .commex-arrow { font-size: 1.3rem; transition: transform 0.4s; display: inline-block; }
.commex-wrap .commex-commute.commex-swapped .commex-arrow { transform: rotate(180deg); }
.commex-wrap .commex-stage {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.commex-wrap .commex-panel {
  flex: 1;
  min-width: 200px;
  max-width: 340px;
  background: #FAFAFA;
  border: 2px dashed #CFD8DC;
  border-radius: 14px;
  padding: 16px;
  min-height: 140px;
  transition: all 0.4s;
}
.commex-wrap .commex-panel.commex-hi-a { border-color: var(--unit-border); background: #E1F5FE; }
.commex-wrap .commex-panel.commex-hi-b { border-color: var(--rod-border); background: #FFF8E1; }
.commex-wrap .commex-panel-label {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 10px;
  color: #78909C;
}
.commex-wrap .commex-blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  align-items: flex-end;
}
.commex-wrap .commex-block {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  animation: commex-popIn 0.3s ease-out both;
}
@keyframes commex-popIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.commex-wrap .commex-unit {
  width: 22px; height: 22px;
  background: var(--unit-color);
  border: 2px solid var(--unit-border);
  font-size: 0.6rem;
  color: var(--unit-border);
}
.commex-wrap .commex-rod {
  width: 22px; height: 80px;
  background: repeating-linear-gradient(0deg, var(--rod-color) 0px, var(--rod-color) 6px, var(--rod-border) 6px, var(--rod-border) 8px);
  border: 2px solid var(--rod-border);
  font-size: 0.55rem;
  color: var(--rod-border);
  writing-mode: vertical-lr;
}
.commex-wrap .commex-flat {
  width: 80px; height: 80px;
  background: repeating-linear-gradient(0deg, var(--flat-color) 0px, var(--flat-color) 6px, var(--flat-border) 6px, var(--flat-border) 7px);
  border: 2px solid var(--flat-border);
  font-size: 0.7rem;
  color: var(--flat-border);
  position: relative;
}
.commex-wrap .commex-flat::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(90deg, transparent 0px, transparent 6px, var(--flat-border) 6px, var(--flat-border) 7px);
  opacity: 0.4;
}
.commex-wrap .commex-stage-op {
  font-family: 'Fredoka', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent);
  align-self: center;
  padding: 0 4px;
}
.commex-wrap .commex-result {
  text-align: center;
  padding: 16px;
  border-radius: 14px;
  margin-bottom: 4px;
  transition: all 0.4s;
}
.commex-wrap .commex-result.commex-equal { background: var(--equal-bg); }
.commex-wrap .commex-result.commex-notequal { background: var(--notequal-bg); }
.commex-wrap .commex-eq-line {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
  line-height: 1.4;
}
.commex-wrap .commex-eq-line .commex-val { color: var(--accent-dark); }
.commex-wrap .commex-verdict {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
}
.commex-wrap .commex-verdict.commex-yes { color: var(--success); }
.commex-wrap .commex-verdict.commex-no { color: var(--danger); }
.commex-wrap .commex-mult-grid {
  display: grid;
  gap: 2px;
  justify-content: center;
  margin: 0 auto;
}
.commex-wrap .commex-mult-cell {
  width: 22px; height: 22px;
  background: var(--unit-color);
  border: 1.5px solid var(--unit-border);
  border-radius: 3px;
  animation: commex-popIn 0.15s ease-out both;
}
.commex-wrap .commex-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
  flex-wrap: wrap;
}
.commex-wrap .commex-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #78909C;
}
.commex-wrap .commex-swatch {
  width: 18px; height: 18px;
  border-radius: 3px;
  border: 2px solid;
}
@media (max-width: 600px) {
  .commex-wrap h1 { font-size: 1.5rem; }
  .commex-wrap .commex-card { padding: 18px 14px; }
  .commex-wrap .commex-num-input { width: 80px; font-size: 1.4rem; }
  .commex-wrap .commex-op-symbol { font-size: 1.5rem; }
  .commex-wrap .commex-panel { min-width: 140px; padding: 10px; }
  .commex-wrap .commex-eq-line { font-size: 1.2rem; }
  .commex-wrap .commex-stage-op { font-size: 1.8rem; }
}
`;

function makeBlocks(n, keyBase) {
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;
  const nodes = [];
  let d = 0;
  for (let i = 0; i < hundreds; i++) {
    nodes.push(
      <div key={`${keyBase}-h${i}`} className="commex-block commex-flat" style={{ animationDelay: `${d++ * 0.05}s` }}>100</div>,
    );
  }
  for (let i = 0; i < tens; i++) {
    nodes.push(
      <div key={`${keyBase}-t${i}`} className="commex-block commex-rod" style={{ animationDelay: `${d++ * 0.05}s` }}>10</div>,
    );
  }
  for (let i = 0; i < ones; i++) {
    nodes.push(<div key={`${keyBase}-u${i}`} className="commex-block commex-unit" style={{ animationDelay: `${d++ * 0.03}s` }} />);
  }
  return nodes;
}

const INSTRUCTIONS = {
  add: '🔄 Choose two numbers, then press Commute! to swap them. Do you get the same answer?',
  multiply: '🔄 See multiplication as an array of blocks. Swap the numbers — does the total change?',
  subtract: '🤔 Try swapping these numbers. Careful! Does subtraction work the same way?',
};

export default function CommutativityExplorer({
  onComplete,
  continueLabel = 'Continue',
  badgeLabel,
  embedded = false,
}) {
  const [op, setOp] = useState('add');
  const [a, setA] = useState(23);
  const [b, setB] = useState(14);
  const [swapped, setSwapped] = useState(false);

  const clamp = useCallback(
    (v, lo, hi) => Math.min(hi, Math.max(lo, v)),
    [],
  );

  const setAClamped = useCallback(
    (raw) => {
      const n = parseInt(String(raw), 10);
      const v = Number.isFinite(n) ? n : 0;
      if (op === 'multiply') setA(clamp(v, 0, 12));
      else setA(clamp(v, 0, 200));
    },
    [op, clamp],
  );

  const setBClamped = useCallback(
    (raw) => {
      const n = parseInt(String(raw), 10);
      const v = Number.isFinite(n) ? n : 0;
      if (op === 'multiply') setB(clamp(v, 0, 12));
      else setB(clamp(v, 0, 200));
    },
    [op, clamp],
  );

  const switchOp = useCallback((next) => {
    setOp(next);
    setSwapped(false);
    if (next === 'add') {
      setA(23);
      setB(14);
    } else if (next === 'multiply') {
      setA(4);
      setB(6);
    } else {
      setA(25);
      setB(13);
    }
  }, []);

  const commute = useCallback(() => {
    const t = a;
    setA(b);
    setB(t);
    setSwapped((s) => !s);
  }, [a, b]);

  const sym = op === 'add' ? '+' : op === 'multiply' ? '×' : '−';
  const symColor = op === 'subtract' ? 'var(--danger)' : 'var(--accent)';

  const ca = op === 'multiply' ? clamp(a, 0, 12) : a;
  const cb = op === 'multiply' ? clamp(b, 0, 12) : b;
  const forward = op === 'add' ? ca + cb : op === 'multiply' ? ca * cb : ca - cb;
  const reverse = op === 'add' ? cb + ca : op === 'multiply' ? cb * ca : cb - ca;
  const isComm = forward === reverse;

  const resultBody = (
    <div className="commex-eq-line">
      <span className="commex-val">{ca}</span> {sym} <span className="commex-val">{cb}</span> = <span className="commex-val">{forward}</span>
      &nbsp;&nbsp;and&nbsp;&nbsp;
      <span className="commex-val">{cb}</span> {sym} <span className="commex-val">{ca}</span> = <span className="commex-val">{reverse}</span>
    </div>
  );
  const verdict = (
    <div className={`commex-verdict ${isComm ? 'commex-yes' : 'commex-no'}`}>
      {isComm
        ? op === 'add'
          ? '✅ Same answer! Addition IS commutative: a + b = b + a'
          : '✅ Same answer! Multiplication IS commutative: a × b = b × a'
        : '❌ Different answers! Subtraction is NOT commutative: a − b ≠ b − a'}
    </div>
  );

  let stage = null;
  if (op === 'add') {
    stage = (
      <div className="commex-stage">
        <div className="commex-panel commex-hi-a">
          <div className="commex-panel-label">{a}</div>
          <div className="commex-blocks">{makeBlocks(a, 'a')}</div>
        </div>
        <div className="commex-stage-op">+</div>
        <div className="commex-panel commex-hi-b">
          <div className="commex-panel-label">{b}</div>
          <div className="commex-blocks">{makeBlocks(b, 'b')}</div>
        </div>
      </div>
    );
  } else if (op === 'multiply') {
    const total = ca * cb;
    const cells = [];
    for (let i = 0; i < total; i++) {
      cells.push(<div key={i} className="commex-mult-cell" style={{ animationDelay: `${i * 0.02}s` }} />);
    }
    stage = (
      <div className="commex-stage">
        <div className="commex-panel" style={{ minWidth: 'auto', maxWidth: 'none', flex: '0 1 auto' }}>
          <div className="commex-panel-label">
            {ca} rows × {cb} columns = {total} blocks
          </div>
          <div
            className="commex-mult-grid"
            style={{
              gridTemplateColumns: `repeat(${cb}, 22px)`,
              gridTemplateRows: `repeat(${ca}, 22px)`,
            }}
          >
            {cells}
          </div>
        </div>
      </div>
    );
  } else {
    stage = (
      <div className="commex-stage">
        <div className="commex-panel commex-hi-a">
          <div className="commex-panel-label">{a} (start with this many)</div>
          <div className="commex-blocks">{makeBlocks(a, 'sa')}</div>
        </div>
        <div className="commex-stage-op" style={{ color: 'var(--danger)' }}>−</div>
        <div className="commex-panel commex-hi-b">
          <div className="commex-panel-label">{b} (take away this many)</div>
          <div className="commex-blocks">{makeBlocks(b, 'sb')}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className={`commex-wrap${embedded ? ' commex-embedded' : ''}`}>
        {!embedded && (
          <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple, marginBottom: 12 }}>
            {badgeLabel || 'Number properties'}
          </div>
        )}
        <h1>
          🧱 <span>Commutativity</span> Explorer
        </h1>
        <p className="commex-subtitle">Swap the numbers and see what happens!</p>

        <div className="commex-tabs">
          <button
            type="button"
            className={`commex-tab${op === 'add' ? ' commex-active' : ''}`}
            onClick={() => switchOp('add')}
          >
            ➕ Addition
          </button>
          <button
            type="button"
            className={`commex-tab${op === 'multiply' ? ' commex-active' : ''}`}
            onClick={() => switchOp('multiply')}
          >
            ✖️ Multiplication
          </button>
          <button
            type="button"
            className={`commex-tab${op === 'subtract' ? ' commex-active commex-tab-sub' : ''}`}
            onClick={() => switchOp('subtract')}
          >
            ➖ Subtraction
          </button>
        </div>

        <div className="commex-card">
          <div className="commex-banner">{INSTRUCTIONS[op]}</div>

          <div className="commex-input-row">
            <div className="commex-num-group">
              <label htmlFor="commex-a">Number A</label>
              <input
                id="commex-a"
                className="commex-num-input"
                type="number"
                value={a}
                min={0}
                max={op === 'multiply' ? 12 : 200}
                onChange={(e) => setAClamped(e.target.value)}
              />
            </div>
            <div className="commex-op-symbol" style={{ color: symColor }}>
              {sym}
            </div>
            <div className="commex-num-group">
              <label htmlFor="commex-b">Number B</label>
              <input
                id="commex-b"
                className="commex-num-input"
                type="number"
                value={b}
                min={0}
                max={op === 'multiply' ? 12 : 200}
                onChange={(e) => setBClamped(e.target.value)}
              />
            </div>
          </div>

          <button type="button" className={`commex-commute${swapped ? ' commex-swapped' : ''}`} onClick={commute}>
            <span className="commex-arrow">⇄</span> Commute!
          </button>

          {stage}

          <div className={`commex-result${isComm ? ' commex-equal' : ' commex-notequal'}`}>
            {resultBody}
            {verdict}
          </div>
        </div>

        <div className="commex-legend">
          <div className="commex-legend-item">
            <div className="commex-swatch" style={{ background: 'var(--flat-color)', borderColor: 'var(--flat-border)' }} />
            Hundred (100)
          </div>
          <div className="commex-legend-item">
            <div className="commex-swatch" style={{ background: 'var(--rod-color)', borderColor: 'var(--rod-border)' }} />
            Ten (10)
          </div>
          <div className="commex-legend-item">
            <div className="commex-swatch" style={{ background: 'var(--unit-color)', borderColor: 'var(--unit-border)' }} />
            One (1)
          </div>
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
