/**
 * ReasoningExplorer — Interactive activities for Domain V: Mathematical Processes.
 *
 * Modes (rotated by activityIndex):
 *   0  "proof-sorter"         Drag proof steps into correct logical order.
 *   1  "representation-match" Connect matching representations (table, graph, equation, verbal).
 *   2  "pattern-finder"       Discover the rule in a sequence, predict next terms.
 */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BADGE } from '../utils/loopStyles';
import qbotImg from '../assets/qbot.svg';

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

function QBotBubble({ message, mood }) {
  const moodEmoji = { wave: '\u{1F44B}', think: '\u{1F914}', encourage: '\u{1F4AA}', celebrate: '\u{1F389}' };
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#4c1d95,#2e1065)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #a78bfa', boxShadow: '0 2px 8px rgba(124,58,237,0.2)' }}>
        <img src={qbotImg} alt="QBot" style={{ width: 26 }} />
      </div>
      <div style={{ background: '#f5f3ff', borderRadius: '2px 12px 12px 12px', padding: '8px 12px', border: '1px solid #ddd6fe', flex: 1, fontSize: 13, fontWeight: 600, color: '#4c1d95', lineHeight: 1.5 }}>
        <span style={{ marginRight: 4 }}>{moodEmoji[mood] || ''}</span>{message}
      </div>
    </div>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 0 — Proof Sorter
   Given a mathematical argument with shuffled steps, drag them into the
   correct logical order.
   ═══════════════════════════════════════════════════════════════════════════ */

const PROOFS = [
  {
    title: 'Prove: The sum of two even numbers is even',
    steps: [
      'Let a and b be even numbers.',
      'Then a = 2m and b = 2n for some integers m and n.',
      'a + b = 2m + 2n',
      '= 2(m + n)',
      'Since m + n is an integer, 2(m + n) is even.',
      'Therefore, a + b is even. \u25A0',
    ],
  },
  {
    title: 'Prove: The product of two odd numbers is odd',
    steps: [
      'Let a and b be odd numbers.',
      'Then a = 2m + 1 and b = 2n + 1 for some integers m and n.',
      'ab = (2m + 1)(2n + 1)',
      '= 4mn + 2m + 2n + 1',
      '= 2(2mn + m + n) + 1',
      'Since 2mn + m + n is an integer, the product has the form 2k + 1, which is odd. \u25A0',
    ],
  },
  {
    title: 'Prove: If n\u00B2 is even, then n is even (contrapositive)',
    steps: [
      'We prove the contrapositive: if n is odd, then n\u00B2 is odd.',
      'Let n be odd. Then n = 2k + 1 for some integer k.',
      'n\u00B2 = (2k + 1)\u00B2 = 4k\u00B2 + 4k + 1',
      '= 2(2k\u00B2 + 2k) + 1',
      'Since 2k\u00B2 + 2k is an integer, n\u00B2 has the form 2j + 1, which is odd.',
      'The contrapositive is true, so the original statement holds. \u25A0',
    ],
  },
  {
    title: 'Prove: \u221A2 is irrational (by contradiction)',
    steps: [
      'Assume \u221A2 is rational: \u221A2 = a/b in lowest terms (gcd(a,b) = 1).',
      'Then 2 = a\u00B2/b\u00B2, so a\u00B2 = 2b\u00B2.',
      'a\u00B2 is even, so a must be even. Let a = 2k.',
      '(2k)\u00B2 = 2b\u00B2 \u21D2 4k\u00B2 = 2b\u00B2 \u21D2 b\u00B2 = 2k\u00B2.',
      'b\u00B2 is even, so b is also even.',
      'Both a and b are even \u2014 contradicting gcd(a,b) = 1. Therefore \u221A2 is irrational. \u25A0',
    ],
  },
];

function ProofSorter({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);
  const proof = useMemo(() => PROOFS[roundIdx % PROOFS.length], [roundIdx]);
  const correctOrder = proof.steps;
  const [items, setItems] = useState(() => shuffle(correctOrder));
  const [checked, setChecked] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  useEffect(() => { setItems(shuffle(proof.steps)); setChecked(false); }, [proof]);

  const isCorrect = items.every((item, i) => item === correctOrder[i]);

  const onDragStart = (idx) => setDragIdx(idx);
  const onDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx == null || dragIdx === idx) return;
    setItems((prev) => {
      const newItems = [...prev];
      const [moved] = newItems.splice(dragIdx, 1);
      newItems.splice(idx, 0, moved);
      return newItems;
    });
    setDragIdx(idx);
  };
  const onDragEnd = () => setDragIdx(null);

  const moveItem = (from, to) => {
    setItems((prev) => {
      const newItems = [...prev];
      const [moved] = newItems.splice(from, 1);
      newItems.splice(to, 0, moved);
      return newItems;
    });
  };

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Order the Proof Steps
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Arrange every statement in valid proof order.
      </p>
      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: COLOR.blue }}>{proof.title}</p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Drag the steps into the correct logical order, or use the arrows.
      </p>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {items.filter((item, i) => item === correctOrder[i]).length}/{items.length} in place
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: checked && isCorrect ? '#047857' : '#64748b', background: checked && isCorrect ? '#ecfdf5' : '#f8fafc', border: `1px solid ${checked && isCorrect ? '#86efac' : '#e5e7eb'}`, borderRadius: 999, padding: '4px 10px' }}>
          Status: {checked ? (isCorrect ? 'Solved' : 'Needs reorder') : 'Editing'}
        </span>
      </div>
      <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${COLOR.border}`, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.45 }}>
        <strong>How to use:</strong> Start with assumptions/definitions, then algebraic manipulation, and finish with the conclusion.
      </div>

      <QBotBubble
        message={checked && isCorrect ? 'Correct logical order: the proof flows from assumptions and definitions to justified transformations and conclusion.' : checked && !isCorrect ? 'Order is not correct yet. Put definitions and givens before algebraic manipulation and final statement.' : 'Read each step carefully. A proof starts with assumptions and definitions, then builds logically to the conclusion.'}
        mood={checked && isCorrect ? 'celebrate' : checked ? 'think' : 'wave'}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {items.map((item, idx) => {
          const correctPos = correctOrder.indexOf(item);
          const isRight = checked && idx === correctPos;
          const isWrong = checked && idx !== correctPos;
          return (
            <div key={item} draggable onDragStart={() => onDragStart(idx)} onDragOver={(e) => onDragOver(e, idx)} onDragEnd={onDragEnd}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'grab',
                background: isRight ? COLOR.greenLight : isWrong ? '#fef2f2' : dragIdx === idx ? COLOR.blueBg : '#fff',
                border: `2px solid ${isRight ? COLOR.greenBorder : isWrong ? '#fca5a5' : dragIdx === idx ? COLOR.blueBorder : COLOR.border}`,
                color: isRight ? COLOR.green : isWrong ? '#ef4444' : COLOR.text,
                transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', minWidth: 20 }}>{idx + 1}</span>
              <span style={{ flex: 1 }}>{item}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {idx > 0 && (
                  <button type="button" onClick={() => moveItem(idx, idx - 1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#9ca3af', padding: 0, lineHeight: 1 }}>{'\u25B2'}</button>
                )}
                {idx < items.length - 1 && (
                  <button type="button" onClick={() => moveItem(idx, idx + 1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#9ca3af', padding: 0, lineHeight: 1 }}>{'\u25BC'}</button>
                )}
              </div>
              {isRight && <span style={{ fontSize: 14 }}>{'\u2713'}</span>}
              {isWrong && <span style={{ fontSize: 14 }}>{'\u2717'}</span>}
            </div>
          );
        })}
      </div>

      {checked && isCorrect && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p aria-live="polite" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>{'\u2713'} Proof steps are in correct order!</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!checked && (
          <button type="button" onClick={() => setChecked(true)}
            style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, flex: '1 1 auto' }}>
            Check Order
          </button>
        )}
        {checked && !isCorrect && (
          <button type="button" onClick={() => setChecked(false)}
            style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, flex: '1 1 auto' }}>
            Try Again
          </button>
        )}
        <button type="button" onClick={() => setRound((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Proof
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 1 — Representation Match
   Four representations of a linear relationship: table, equation,
   verbal description, and small graph. Match them by clicking pairs.
   ═══════════════════════════════════════════════════════════════════════════ */

const REP_PROBLEMS = [
  {
    equation: 'y = 2x + 1',
    verbal: 'Starts at 1, increases by 2 for each step',
    table: [[0, 1], [1, 3], [2, 5], [3, 7]],
    m: 2, b: 1,
  },
  {
    equation: 'y = \u2212x + 4',
    verbal: 'Starts at 4, decreases by 1 for each step',
    table: [[0, 4], [1, 3], [2, 2], [3, 1]],
    m: -1, b: 4,
  },
  {
    equation: 'y = 3x',
    verbal: 'Starts at the origin, increases by 3 for each step',
    table: [[0, 0], [1, 3], [2, 6], [3, 9]],
    m: 3, b: 0,
  },
  {
    equation: 'y = 0.5x + 2',
    verbal: 'Starts at 2, increases by 0.5 for each step',
    table: [[0, 2], [1, 2.5], [2, 3], [3, 3.5]],
    m: 0.5, b: 2,
  },
];

function MiniGraph({ m, b, size = 80 }) {
  const pad = 8;
  const sx = (v) => pad + (v / 4) * (size - 2 * pad);
  const sy = (v) => size - pad - (v / 10) * (size - 2 * pad);
  const y0 = m * 0 + b;
  const y4 = m * 4 + b;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block' }}>
      <rect x={0} y={0} width={size} height={size} rx={6} fill="#f8fafc" stroke={COLOR.border} strokeWidth={1} />
      <line x1={pad} y1={size - pad} x2={size - pad} y2={size - pad} stroke="#d1d5db" strokeWidth={1} />
      <line x1={pad} y1={pad} x2={pad} y2={size - pad} stroke="#d1d5db" strokeWidth={1} />
      <line x1={sx(0)} y1={sy(y0)} x2={sx(4)} y2={sy(y4)} stroke={COLOR.blue} strokeWidth={2} />
      {[0, 1, 2, 3].map((x) => (
        <circle key={x} cx={sx(x)} cy={sy(m * x + b)} r={3} fill={COLOR.blue} stroke="#fff" strokeWidth={1} />
      ))}
    </svg>
  );
}

function RepresentationMatch({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);

  const problems = useMemo(() => {
    const picked = shuffle(REP_PROBLEMS).slice(0, 2);
    const cards = [];
    picked.forEach((p, i) => {
      const group = i;
      cards.push({ id: `eq-${i}`, type: 'Equation', content: p.equation, group });
      cards.push({ id: `vb-${i}`, type: 'Verbal', content: p.verbal, group });
      cards.push({ id: `tb-${i}`, type: 'Table', content: p.table, group, isTable: true });
      cards.push({ id: `gr-${i}`, type: 'Graph', content: p, group, isGraph: true });
    });
    return shuffle(cards);
  }, [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const [selected, setSelected] = useState(null);
  const [matched, setMatched] = useState({});
  const [wrong, setWrong] = useState(null);
  const wrongTimeoutRef = useRef(null);

  useEffect(() => { setSelected(null); setMatched({}); setWrong(null); }, [roundIdx]);
  useEffect(() => () => { if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current); }, []);

  const allMatched = Object.keys(matched).length === problems.length;
  const MATCH_COLORS = ['#2563eb', '#059669'];

  const handleClick = (card) => {
    if (matched[card.id] != null) return;
    if (selected == null) {
      setSelected(card);
      setWrong(null);
    } else {
      if (selected.id === card.id) { setSelected(null); return; }
      if (selected.group === card.group) {
        setMatched((prev) => ({ ...prev, [selected.id]: card.group, [card.id]: card.group }));
        setSelected(null);
      } else {
        setWrong(card.id);
        if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
        wrongTimeoutRef.current = setTimeout(() => setWrong(null), 700);
        setSelected(null);
      }
    }
  };

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>Match the Representations</p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Match all cards that represent the same linear relationship.
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Click two cards that represent the same linear relationship. Match all pairs!
      </p>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {Object.keys(matched).length}/{problems.length} cards matched
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: allMatched ? '#047857' : '#64748b', background: allMatched ? '#ecfdf5' : '#f8fafc', border: `1px solid ${allMatched ? '#86efac' : '#e5e7eb'}`, borderRadius: 999, padding: '4px 10px' }}>
          Status: {allMatched ? 'Solved' : 'In progress'}
        </span>
      </div>
      <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${COLOR.border}`, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.45 }}>
        <strong>How to use:</strong> Pick one card, then find another with matching slope and intercept.
      </div>

      <QBotBubble
        message={allMatched ? 'All matched! Every linear relationship can be expressed as an equation, table, graph, or verbal description. Being able to move between these is a key mathematical skill.' : 'A linear relationship can be shown in many ways. Look for matching slope and y-intercept across different forms.'}
        mood={allMatched ? 'celebrate' : 'wave'}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
        {problems.map((card) => {
          const isMatched = matched[card.id] != null;
          const isSel = selected && selected.id === card.id;
          const isWrongCard = wrong === card.id;
          const matchColor = isMatched ? MATCH_COLORS[card.group] : null;

          return (
            <button key={card.id} type="button" onClick={() => handleClick(card)}
              style={{
                padding: 10, borderRadius: 12, textAlign: 'center', cursor: isMatched ? 'default' : 'pointer',
                background: isMatched ? `${matchColor}12` : isWrongCard ? '#fef2f2' : isSel ? COLOR.blueBg : '#fff',
                border: `2px solid ${isMatched ? matchColor : isWrongCard ? '#fca5a5' : isSel ? COLOR.blueBorder : COLOR.border}`,
                transition: 'all 0.15s',
              }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>{card.type}</div>
              {card.isTable ? (
                <div style={{ fontSize: 12, fontWeight: 600, color: COLOR.text }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                    {card.content.map(([x, y], j) => (
                      <div key={j} style={{ fontSize: 11 }}>
                        <div style={{ color: '#9ca3af', fontSize: 9 }}>x={x}</div>
                        <div style={{ fontWeight: 700 }}>{y}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : card.isGraph ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <MiniGraph m={card.content.m} b={card.content.b} />
                </div>
              ) : (
                <div style={{ fontSize: 13, fontWeight: 700, color: COLOR.text }}>{card.content}</div>
              )}
              {isMatched && <div style={{ fontSize: 12, marginTop: 4, color: matchColor }}>{'\u2713'}</div>}
            </button>
          );
        })}
      </div>

      {allMatched && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p aria-live="polite" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>{'\u2713'} All representations matched!</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setRound((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Set
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 2 — Pattern Finder
   A sequence is shown. Student identifies the rule and predicts the next
   two terms. Visual tile patterns for geometric sequences.
   ═══════════════════════════════════════════════════════════════════════════ */

const PATTERNS = [
  { shown: [2, 5, 8, 11, 14], next: [17, 20], rule: 'Add 3 each time (arithmetic, d = 3)', type: 'arithmetic' },
  { shown: [3, 6, 12, 24, 48], next: [96, 192], rule: 'Multiply by 2 each time (geometric, r = 2)', type: 'geometric' },
  { shown: [1, 4, 9, 16, 25], next: [36, 49], rule: 'Perfect squares: n\u00B2', type: 'quadratic' },
  { shown: [1, 1, 2, 3, 5], next: [8, 13], rule: 'Fibonacci: each term = sum of previous two', type: 'fibonacci' },
  { shown: [100, 90, 81, 73, 66], next: [60, 55], rule: 'Subtract decreasing amounts: \u221210, \u22129, \u22128, \u22127, \u2212...', type: 'other' },
  { shown: [2, 6, 18, 54, 162], next: [486, 1458], rule: 'Multiply by 3 each time (geometric, r = 3)', type: 'geometric' },
  { shown: [1, 3, 6, 10, 15], next: [21, 28], rule: 'Triangular numbers: add 2, 3, 4, 5, 6, 7...', type: 'triangular' },
];

function PatternFinder({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);
  const pattern = useMemo(() => PATTERNS[roundIdx % PATTERNS.length], [roundIdx]);

  const [guess1, setGuess1] = useState('');
  const [guess2, setGuess2] = useState('');
  const [checked, setChecked] = useState(false);
  const [showRule, setShowRule] = useState(false);

  useEffect(() => { setGuess1(''); setGuess2(''); setChecked(false); setShowRule(false); }, [pattern]);

  const g1Correct = parseInt(guess1, 10) === pattern.next[0];
  const g2Correct = parseInt(guess2, 10) === pattern.next[1];
  const allCorrect = checked && g1Correct && g2Correct;

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>Find the Pattern</p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Predict the next two terms from the hidden rule.
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Study the sequence and predict the next two terms.
      </p>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Entries: {(guess1 ? 1 : 0) + (guess2 ? 1 : 0)}/2
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: allCorrect ? '#047857' : '#64748b', background: allCorrect ? '#ecfdf5' : '#f8fafc', border: `1px solid ${allCorrect ? '#86efac' : '#e5e7eb'}`, borderRadius: 999, padding: '4px 10px' }}>
          Status: {checked ? (allCorrect ? 'Solved' : 'Revise') : 'In progress'}
        </span>
      </div>
      <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${COLOR.border}`, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.45 }}>
        <strong>How to use:</strong> Check differences first, then try ratios if differences are not constant.
      </div>

      <QBotBubble
        message={allCorrect ? `Correct pattern rule identified: ${pattern.rule}. This supports algebraic generalization.` : checked && !allCorrect ? 'Not correct yet. Compare consecutive differences first; if not constant, test multiplicative ratios or recursive structure.' : 'Look at how each term relates to the previous one. Is it adding a constant? Multiplying? Something else?'}
        mood={allCorrect ? 'celebrate' : checked ? 'think' : 'wave'}
      />

      {/* Sequence display */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
        {pattern.shown.map((v, i) => (
          <div key={i} style={{ padding: '8px 14px', borderRadius: 10, background: '#eff6ff', border: '1px solid #93c5fd', fontSize: 18, fontWeight: 800, color: COLOR.blue, textAlign: 'center', minWidth: 44 }}>
            {v}
          </div>
        ))}
        <div style={{ padding: '8px 14px', borderRadius: 10, background: '#faf5ff', border: '2px dashed #ddd6fe', fontSize: 18, fontWeight: 800, color: COLOR.purple, minWidth: 44, textAlign: 'center' }}>
          ?
        </div>
        <div style={{ padding: '8px 14px', borderRadius: 10, background: '#faf5ff', border: '2px dashed #ddd6fe', fontSize: 18, fontWeight: 800, color: COLOR.purple, minWidth: 44, textAlign: 'center' }}>
          ?
        </div>
      </div>

      {/* Differences row */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
        {pattern.shown.slice(1).map((v, i) => {
          const diff = v - pattern.shown[i];
          return (
            <div key={i} style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textAlign: 'center', minWidth: 36 }}>
              {diff > 0 ? '+' : ''}{diff}
            </div>
          );
        })}
      </div>

      {/* Input fields */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 14, alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: COLOR.textSecondary, display: 'block', marginBottom: 4 }}>Term {pattern.shown.length + 1}</label>
          <input type="number" value={guess1} onChange={(e) => setGuess1(e.target.value)} disabled={allCorrect}
            style={{ width: 70, padding: '8px', borderRadius: 10, border: `2px solid ${checked ? (g1Correct ? COLOR.greenBorder : '#fca5a5') : COLOR.border}`, fontSize: 16, fontWeight: 700, textAlign: 'center', background: checked ? (g1Correct ? COLOR.greenLight : '#fef2f2') : '#fff' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: COLOR.textSecondary, display: 'block', marginBottom: 4 }}>Term {pattern.shown.length + 2}</label>
          <input type="number" value={guess2} onChange={(e) => setGuess2(e.target.value)} disabled={allCorrect}
            style={{ width: 70, padding: '8px', borderRadius: 10, border: `2px solid ${checked ? (g2Correct ? COLOR.greenBorder : '#fca5a5') : COLOR.border}`, fontSize: 16, fontWeight: 700, textAlign: 'center', background: checked ? (g2Correct ? COLOR.greenLight : '#fef2f2') : '#fff' }} />
        </div>
      </div>

      {checked && !allCorrect && (
        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#ef4444', fontWeight: 600, textAlign: 'center' }}>
          Expected: {pattern.next[0]}, {pattern.next[1]}
        </p>
      )}

      {/* Rule reveal */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <button type="button" onClick={() => setShowRule((p) => !p)}
          style={{ background: 'none', border: 'none', color: COLOR.purple, fontWeight: 700, cursor: 'pointer', fontSize: 13, textDecoration: 'underline', textUnderlineOffset: 2 }}>
          {showRule ? 'Hide rule' : 'Show the rule'}
        </button>
        {showRule && (
          <div style={{ marginTop: 6, padding: '8px 14px', borderRadius: 10, background: '#faf5ff', border: '1px solid #ddd6fe', fontSize: 13, fontWeight: 600, color: '#4c1d95' }}>
            {pattern.rule}
          </div>
        )}
      </div>

      {allCorrect && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p aria-live="polite" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>{'\u2713'} Both terms correct!</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!checked && (
          <button type="button" onClick={() => setChecked(true)} disabled={!guess1 || !guess2}
            style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, flex: '1 1 auto', opacity: guess1 && guess2 ? 1 : 0.4 }}>
            Check
          </button>
        )}
        <button type="button" onClick={() => setRound((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Pattern
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main export
   ═══════════════════════════════════════════════════════════════════════════ */
const MODES = ['proof-sorter', 'representation-match', 'pattern-finder'];

export default function ReasoningExplorer({ activityIndex = 0, onComplete, continueLabel = 'Continue', badgeLabel = 'Interactive activity', embedded = false }) {
  const mode = MODES[activityIndex % MODES.length];
  if (mode === 'proof-sorter') return <ProofSorter onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'representation-match') return <RepresentationMatch onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  return <PatternFinder onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
}
