/**
 * PedagogyExplorer — Interactive activities for Domain VI: Mathematical Learning,
 * Instruction, and Assessment.
 *
 * Modes (rotated by activityIndex):
 *   0  "lesson-sequencer"       Drag instructional activities into effective lesson order.
 *   1  "misconception-detector" Identify errors in student work and classify the misconception.
 *   2  "assessment-matcher"     Match learning objectives to appropriate assessment types.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BADGE } from '../utils/loopStyles';
import qbotImg from '../assets/qbot.svg';

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
   MODE 0 — Lesson Sequencer
   Given 6 instructional activities for a math lesson, arrange them in
   pedagogically sound order (gradual release model).
   ═══════════════════════════════════════════════════════════════════════════ */

const LESSONS = [
  {
    topic: 'Solving Two-Step Equations',
    steps: [
      { label: 'Warm-Up', text: 'Quick review: students solve 5 one-step equations independently (3 min).' },
      { label: 'Hook / Motivation', text: 'Real-world problem: "A gym charges $25/month plus a $50 sign-up fee. You paid $150. How many months?"' },
      { label: 'Direct Instruction', text: 'Teacher models solving 2x + 5 = 13 step by step, thinking aloud.' },
      { label: 'Guided Practice', text: 'Students solve 3 equations with partner support; teacher circulates and checks.' },
      { label: 'Independent Practice', text: 'Students complete 6 two-step equations on their own (differentiated by level).' },
      { label: 'Closure / Exit Ticket', text: 'Students write the two steps for solving any two-step equation and solve one final problem.' },
    ],
  },
  {
    topic: 'Introducing Probability',
    steps: [
      { label: 'Warm-Up', text: 'Students predict: "If I flip a coin 10 times, how many heads?" Record predictions.' },
      { label: 'Hook / Motivation', text: 'Play a quick game: roll dice and tally results. "Is the game fair?"' },
      { label: 'Direct Instruction', text: 'Define probability, sample space, and theoretical vs. experimental probability with examples.' },
      { label: 'Guided Practice', text: 'Class works together to calculate P(event) for spinners and cards with teacher scaffolding.' },
      { label: 'Independent Practice', text: 'Students run their own probability experiments and compare results to theoretical values.' },
      { label: 'Closure / Exit Ticket', text: 'Students explain the difference between theoretical and experimental probability in writing.' },
    ],
  },
  {
    topic: 'Properties of Quadrilaterals',
    steps: [
      { label: 'Warm-Up', text: 'Sort shapes: "Which of these are quadrilaterals?" Discuss with a partner.' },
      { label: 'Hook / Motivation', text: 'Show photos of architecture. "What quadrilateral shapes do you see? Why might architects choose them?"' },
      { label: 'Direct Instruction', text: 'Present the hierarchy: parallelogram \u2192 rectangle \u2192 square, with properties of each.' },
      { label: 'Guided Practice', text: 'Students measure angles and sides of cut-out quadrilaterals to verify properties.' },
      { label: 'Independent Practice', text: 'Given properties, students classify quadrilaterals and justify with evidence.' },
      { label: 'Closure / Exit Ticket', text: 'Venn diagram: place 5 quadrilaterals in the correct regions and explain one placement.' },
    ],
  },
];

function LessonSequencer({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);
  const lesson = useMemo(() => LESSONS[roundIdx % LESSONS.length], [roundIdx]);
  const correctOrder = lesson.steps;
  const [items, setItems] = useState(() => shuffle(correctOrder));
  const [checked, setChecked] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  useEffect(() => { setItems(shuffle(lesson.steps)); setChecked(false); }, [lesson]);

  const isCorrect = items.every((item, i) => item.label === correctOrder[i].label);

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
      const n = [...prev];
      const [moved] = n.splice(from, 1);
      n.splice(to, 0, moved);
      return n;
    });
  };

  const STEP_COLORS = ['#d97706', '#2563eb', '#7c3aed', '#059669', '#0891b2', '#dc2626'];

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Sequence the Lesson
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Arrange the lesson flow using effective instructional sequencing.
      </p>
      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: COLOR.blue }}>Topic: {lesson.topic}</p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Arrange these lesson components in the most effective instructional order. Drag or use arrows.
      </p>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {items.filter((item, i) => item.label === correctOrder[i].label).length}/{items.length} in place
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: checked && isCorrect ? '#047857' : '#64748b', background: checked && isCorrect ? '#ecfdf5' : '#f8fafc', border: `1px solid ${checked && isCorrect ? '#86efac' : '#e5e7eb'}`, borderRadius: 999, padding: '4px 10px' }}>
          Status: {checked ? (isCorrect ? 'Solved' : 'Needs reorder') : 'Editing'}
        </span>
      </div>
      <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${COLOR.border}`, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.45 }}>
        <strong>How to use:</strong> Start with activation and motivation, then explicit teaching, guided practice, independent practice, and closure.
      </div>

      <QBotBubble
        message={checked && isCorrect ? 'Correct lesson sequencing: gradual release moves from modeling to guided practice to independent application, with activation and closure.' : checked ? 'Sequence is not correct yet. Reorder by instructional flow: activate prior knowledge, explicit model, guided practice, independent practice, closure.' : 'Effective lessons follow a structure: activate prior knowledge, engage interest, teach explicitly, practice with support, then independently, and reflect.'}
        mood={checked && isCorrect ? 'celebrate' : checked ? 'think' : 'wave'}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {items.map((item, idx) => {
          const correctPos = correctOrder.findIndex((s) => s.label === item.label);
          const isRight = checked && idx === correctPos;
          const isWrong = checked && idx !== correctPos;
          return (
            <div key={item.label} draggable onDragStart={() => onDragStart(idx)} onDragOver={(e) => onDragOver(e, idx)} onDragEnd={onDragEnd}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 14px', borderRadius: 10, cursor: 'grab',
                background: isRight ? COLOR.greenLight : isWrong ? '#fef2f2' : dragIdx === idx ? COLOR.blueBg : '#fff',
                border: `2px solid ${isRight ? COLOR.greenBorder : isWrong ? '#fca5a5' : dragIdx === idx ? COLOR.blueBorder : COLOR.border}`,
                transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', minWidth: 20, marginTop: 2 }}>{idx + 1}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: STEP_COLORS[correctPos] || COLOR.text, display: 'inline-block', padding: '1px 8px', borderRadius: 4, background: `${STEP_COLORS[correctPos] || '#9ca3af'}15`, marginBottom: 4 }}>
                  {item.label}
                </span>
                <p style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.4 }}>{item.text}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                {idx > 0 && <button type="button" onClick={() => moveItem(idx, idx - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#9ca3af', padding: 0, lineHeight: 1 }}>{'\u25B2'}</button>}
                {idx < items.length - 1 && <button type="button" onClick={() => moveItem(idx, idx + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#9ca3af', padding: 0, lineHeight: 1 }}>{'\u25BC'}</button>}
              </div>
              {isRight && <span style={{ fontSize: 14, color: COLOR.green }}>{'\u2713'}</span>}
              {isWrong && <span style={{ fontSize: 14, color: '#ef4444' }}>{'\u2717'}</span>}
            </div>
          );
        })}
      </div>

      {checked && isCorrect && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p aria-live="polite" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>{'\u2713'} Perfect lesson sequence!</p>
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
          {'\u{1F504}'} New Lesson
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 1 — Misconception Detector
   Student work samples with errors. Identify the error step and classify
   the type of misconception.
   ═══════════════════════════════════════════════════════════════════════════ */

const MISCONCEPTIONS = [
  {
    title: 'Adding fractions',
    work: [
      { step: 'Problem: \u00BD + \u2153', isError: false },
      { step: 'Student writes: \u00BD + \u2153 = (1+1)/(2+3)', isError: true },
      { step: '= 2/5', isError: false },
    ],
    errorIdx: 1,
    misconception: 'Adding numerators and denominators separately',
    explanation: 'When adding fractions, you need a common denominator first. \u00BD + \u2153 = 3/6 + 2/6 = 5/6, not 2/5.',
    category: 'Procedural error',
  },
  {
    title: 'Distributing a negative',
    work: [
      { step: 'Simplify: \u22123(x \u2212 4)', isError: false },
      { step: 'Student writes: \u22123x \u2212 12', isError: true },
      { step: 'Final: \u22123x \u2212 12', isError: false },
    ],
    errorIdx: 1,
    misconception: 'Forgetting to distribute the negative to the second term',
    explanation: 'When distributing \u22123 to (x \u2212 4): \u22123(x) = \u22123x and \u22123(\u22124) = +12. The correct answer is \u22123x + 12.',
    category: 'Sign error',
  },
  {
    title: 'Solving an equation',
    work: [
      { step: 'Solve: 2x + 6 = 14', isError: false },
      { step: 'Step 1: 2x = 14 + 6 = 20', isError: true },
      { step: 'Step 2: x = 10', isError: false },
    ],
    errorIdx: 1,
    misconception: 'Adding instead of subtracting when moving terms',
    explanation: 'To isolate 2x, subtract 6 from both sides: 2x = 14 \u2212 6 = 8, so x = 4. The student added 6 instead.',
    category: 'Inverse operation error',
  },
  {
    title: 'Exponent rules',
    work: [
      { step: 'Simplify: (2x)\u00B3', isError: false },
      { step: 'Student writes: 2x\u00B3', isError: true },
      { step: 'Final: 2x\u00B3', isError: false },
    ],
    errorIdx: 1,
    misconception: 'Not applying the exponent to the coefficient',
    explanation: '(2x)\u00B3 means 2\u00B3 \u00B7 x\u00B3 = 8x\u00B3. The exponent applies to everything inside the parentheses, not just x.',
    category: 'Conceptual error',
  },
  {
    title: 'Order of operations',
    work: [
      { step: 'Evaluate: 3 + 4 \u00D7 2', isError: false },
      { step: 'Student writes: (3 + 4) \u00D7 2 = 7 \u00D7 2', isError: true },
      { step: '= 14', isError: false },
    ],
    errorIdx: 1,
    misconception: 'Performing addition before multiplication',
    explanation: 'By order of operations (PEMDAS), multiplication comes before addition: 3 + (4 \u00D7 2) = 3 + 8 = 11, not 14.',
    category: 'Order of operations error',
  },
];

function MisconceptionDetector({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);
  const problem = useMemo(() => MISCONCEPTIONS[roundIdx % MISCONCEPTIONS.length], [roundIdx]);

  const [selectedStep, setSelectedStep] = useState(null);
  const [phase, setPhase] = useState('identify');
  const [categoryGuess, setCategoryGuess] = useState(null);

  useEffect(() => { setSelectedStep(null); setPhase('identify'); setCategoryGuess(null); }, [problem]);

  const isStepCorrect = selectedStep === problem.errorIdx;
  const categories = ['Procedural error', 'Sign error', 'Inverse operation error', 'Conceptual error', 'Order of operations error'];

  const handleStepClick = (idx) => {
    if (phase !== 'identify') return;
    setSelectedStep(idx);
  };

  const handleCheckStep = () => {
    if (isStepCorrect) setPhase('classify');
    else setPhase('wrong-step');
  };

  const handleCheckCategory = () => {
    setPhase('done');
  };

  const isCategoryCorrect = categoryGuess === problem.category;

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Find the Misconception
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Identify the exact error step, then classify the misconception type.
      </p>
      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: COLOR.blue }}>{problem.title}</p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        {phase === 'identify' ? 'Click on the step where the student made an error.' : phase === 'classify' ? 'Error step identified. Now classify the misconception type.' : phase === 'wrong-step' ? 'That is not the first invalid step. Recheck the procedure and choose again.' : 'Review the explanation below.'}
      </p>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Stage: {phase === 'identify' ? 'Find error' : phase === 'classify' ? 'Classify' : phase === 'wrong-step' ? 'Retry step' : 'Reviewed'}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: phase === 'done' && isCategoryCorrect ? '#047857' : '#64748b', background: phase === 'done' && isCategoryCorrect ? '#ecfdf5' : '#f8fafc', border: `1px solid ${phase === 'done' && isCategoryCorrect ? '#86efac' : '#e5e7eb'}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {phase === 'identify' ? '0/2' : phase === 'classify' || phase === 'wrong-step' ? '1/2' : '2/2'}
        </span>
      </div>
      <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${COLOR.border}`, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.45 }}>
        <strong>How to use:</strong> Locate the first mathematically invalid step before choosing a category.
      </div>

      <QBotBubble
        message={phase === 'done' ? (isCategoryCorrect ? `Correct classification: "${problem.misconception}" is a ${problem.category}. This supports targeted reteach planning.` : `The error is "${problem.category}": ${problem.misconception}. Use this category to select a focused remediation move.`) : phase === 'classify' ? 'Error step found. Now classify whether the issue is procedural, conceptual, sign-based, or operation-order related.' : 'As a future math teacher, recognizing where and why students make errors is essential for effective instruction.'}
        mood={phase === 'done' && isCategoryCorrect ? 'celebrate' : phase === 'done' ? 'think' : phase === 'classify' ? 'encourage' : 'wave'}
      />

      {/* Student work display */}
      <div style={{ background: '#fffbeb', borderRadius: 14, border: '1px solid #fde68a', padding: '14px 16px', marginBottom: 14 }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#92400e' }}>{'\u{1F4DD}'} Student Work:</p>
        {problem.work.map((step, idx) => {
          const isSelected = selectedStep === idx;
          const showCorrect = (phase === 'classify' || phase === 'done') && idx === problem.errorIdx;
          const showWrongPick = phase === 'wrong-step' && isSelected && idx !== problem.errorIdx;
          return (
            <button key={idx} type="button" onClick={() => handleStepClick(idx)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', marginBottom: 4, borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: phase === 'identify' ? 'pointer' : 'default',
                background: showCorrect ? '#fef2f2' : showWrongPick ? '#fef3c7' : isSelected && phase === 'identify' ? COLOR.blueBg : '#fff',
                border: `2px solid ${showCorrect ? '#fca5a5' : showWrongPick ? '#fde68a' : isSelected && phase === 'identify' ? COLOR.blueBorder : '#fde68a'}`,
                color: showCorrect ? '#ef4444' : COLOR.text,
                transition: 'all 0.15s',
              }}>
              {step.step}
              {showCorrect && <span style={{ marginLeft: 8, color: '#ef4444', fontWeight: 800 }}>{'\u2190'} Error here!</span>}
            </button>
          );
        })}
      </div>

      {phase === 'identify' && selectedStep != null && (
        <button type="button" onClick={handleCheckStep}
          style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, marginBottom: 12 }}>
          This is the error step
        </button>
      )}

      {phase === 'wrong-step' && (
        <button type="button" onClick={() => { setPhase('identify'); setSelectedStep(null); }}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', marginBottom: 12 }}>
          Try Again
        </button>
      )}

      {/* Category classification */}
      {phase === 'classify' && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>What type of misconception is this?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {categories.map((cat) => (
              <button key={cat} type="button" onClick={() => setCategoryGuess(cat)}
                style={{
                  padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'left', cursor: 'pointer',
                  background: categoryGuess === cat ? COLOR.blueBg : '#fff',
                  border: `2px solid ${categoryGuess === cat ? COLOR.blueBorder : COLOR.border}`,
                  color: categoryGuess === cat ? COLOR.blue : COLOR.text,
                }}>
                {cat}
              </button>
            ))}
          </div>
          {categoryGuess && (
            <button type="button" onClick={handleCheckCategory}
              style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, marginTop: 10 }}>
              Check
            </button>
          )}
        </div>
      )}

      {/* Explanation */}
      {phase === 'done' && (
        <div style={{ margin: '0 0 14px', padding: '12px 16px', borderRadius: 12, background: isCategoryCorrect ? COLOR.greenLight : '#eff6ff', border: `1px solid ${isCategoryCorrect ? COLOR.greenBorder : '#93c5fd'}` }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 800, color: isCategoryCorrect ? COLOR.green : COLOR.blue }}>
            {isCategoryCorrect ? '\u2713 Correct classification!' : `The correct category: ${problem.category}`}
          </p>
          <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#4c1d95' }}>Misconception: {problem.misconception}</p>
          <p style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.5 }}>{problem.explanation}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setRound((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Problem
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 2 — Assessment Matcher
   Match learning objectives to the appropriate assessment type
   (formative, summative, diagnostic) and Bloom's taxonomy level.
   ═══════════════════════════════════════════════════════════════════════════ */

const ASSESSMENT_ITEMS = [
  {
    objective: 'Check if students can recall the quadratic formula before the lesson begins.',
    assessmentType: 'Diagnostic',
    blooms: 'Remember',
    explanation: 'This checks prior knowledge before instruction \u2014 a diagnostic purpose. Recalling a formula is at the Remember level.',
  },
  {
    objective: 'Observe students solving equations during guided practice to adjust instruction.',
    assessmentType: 'Formative',
    blooms: 'Apply',
    explanation: 'Monitoring during instruction to adjust teaching is formative assessment. Solving equations is application.',
  },
  {
    objective: 'End-of-unit test: students prove geometric theorems and apply them to novel situations.',
    assessmentType: 'Summative',
    blooms: 'Analyze',
    explanation: 'An end-of-unit test evaluates cumulative learning (summative). Proving theorems requires analysis and reasoning.',
  },
  {
    objective: 'Exit ticket: students explain in their own words why dividing by zero is undefined.',
    assessmentType: 'Formative',
    blooms: 'Understand',
    explanation: 'Exit tickets are quick formative checks. Explaining a concept in your own words demonstrates understanding.',
  },
  {
    objective: 'Students design a statistical study to answer a question of their choice.',
    assessmentType: 'Summative',
    blooms: 'Create',
    explanation: 'Designing an original study is at the Create level. As a major project it serves as summative assessment.',
  },
  {
    objective: 'Pre-test to determine which algebra skills students have mastered before a review unit.',
    assessmentType: 'Diagnostic',
    blooms: 'Apply',
    explanation: 'Pre-tests identify existing skill levels (diagnostic). Demonstrating mastery of skills involves application.',
  },
];

function AssessmentMatcher({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);

  const items = useMemo(() => shuffle(ASSESSMENT_ITEMS).slice(0, 3), [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  useEffect(() => { setAnswers({}); setChecked(false); }, [roundIdx]);

  const assessTypes = ['Diagnostic', 'Formative', 'Summative'];
  const bloomsLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  const setAnswer = (idx, field, value) => {
    setAnswers((prev) => ({ ...prev, [`${idx}-${field}`]: value }));
  };

  const allFilled = items.every((_, i) => answers[`${i}-type`] && answers[`${i}-blooms`]);
  const allCorrect = checked && items.every((item, i) => answers[`${i}-type`] === item.assessmentType && answers[`${i}-blooms`] === item.blooms);
  const totalCorrect = checked ? items.filter((item, i) => answers[`${i}-type`] === item.assessmentType && answers[`${i}-blooms`] === item.blooms).length : 0;

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Assessment Matcher
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Match each objective to both the correct assessment type and Bloom level.
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        For each learning objective, select the assessment type and Bloom's taxonomy level.
      </p>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {Object.keys(answers).length}/6 selections
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: allCorrect ? '#047857' : checked ? '#9a3412' : '#64748b', background: allCorrect ? '#ecfdf5' : checked ? '#fff7ed' : '#f8fafc', border: `1px solid ${allCorrect ? '#86efac' : checked ? '#fdba74' : '#e5e7eb'}`, borderRadius: 999, padding: '4px 10px' }}>
          Status: {checked ? `${totalCorrect}/${items.length} correct` : 'In progress'}
        </span>
      </div>
      <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${COLOR.border}`, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.45 }}>
        <strong>How to use:</strong> Choose when evidence is gathered (before/during/after instruction), then the cognitive demand.
      </div>

      <QBotBubble
        message={allCorrect ? 'All matched correctly! Understanding assessment types and cognitive levels helps you design meaningful evaluations aligned to learning goals.' : checked ? `You got ${totalCorrect} of ${items.length} fully correct. Remember: Diagnostic = before instruction, Formative = during, Summative = after. Bloom\'s levels build from Remember up to Create.` : 'Diagnostic checks prior knowledge. Formative monitors learning in progress. Summative evaluates at the end. Match each to the right Bloom\'s level too!'}
        mood={allCorrect ? 'celebrate' : checked ? 'think' : 'wave'}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
        {items.map((item, idx) => {
          const typeCorrect = checked && answers[`${idx}-type`] === item.assessmentType;
          const bloomsCorrect = checked && answers[`${idx}-blooms`] === item.blooms;
          return (
            <div key={idx} style={{ padding: '12px 16px', borderRadius: 12, background: '#f8fafc', border: `1px solid ${COLOR.border}` }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text, lineHeight: 1.4 }}>
                <span style={{ color: COLOR.blue, fontWeight: 800 }}>{idx + 1}.</span> {item.objective}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: COLOR.textSecondary, display: 'block', marginBottom: 3 }}>Assessment Type</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {assessTypes.map((t) => (
                      <button key={t} type="button" onClick={() => !checked && setAnswer(idx, 'type', t)}
                        style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: checked ? 'default' : 'pointer',
                          background: answers[`${idx}-type`] === t ? (checked ? (typeCorrect && t === item.assessmentType ? COLOR.greenLight : '#fef2f2') : COLOR.blueBg) : '#fff',
                          border: `1.5px solid ${answers[`${idx}-type`] === t ? (checked ? (typeCorrect && t === item.assessmentType ? COLOR.greenBorder : '#fca5a5') : COLOR.blueBorder) : COLOR.border}`,
                          color: answers[`${idx}-type`] === t ? (checked ? (typeCorrect && t === item.assessmentType ? COLOR.green : '#ef4444') : COLOR.blue) : COLOR.textSecondary,
                        }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: COLOR.textSecondary, display: 'block', marginBottom: 3 }}>Bloom's Level</label>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {bloomsLevels.map((b) => (
                      <button key={b} type="button" onClick={() => !checked && setAnswer(idx, 'blooms', b)}
                        style={{
                          padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: checked ? 'default' : 'pointer',
                          background: answers[`${idx}-blooms`] === b ? (checked ? (bloomsCorrect && b === item.blooms ? COLOR.greenLight : '#fef2f2') : '#faf5ff') : '#fff',
                          border: `1.5px solid ${answers[`${idx}-blooms`] === b ? (checked ? (bloomsCorrect && b === item.blooms ? COLOR.greenBorder : '#fca5a5') : '#ddd6fe') : COLOR.border}`,
                          color: answers[`${idx}-blooms`] === b ? (checked ? (bloomsCorrect && b === item.blooms ? COLOR.green : '#ef4444') : COLOR.purple) : COLOR.textSecondary,
                        }}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {checked && (
                <div style={{ marginTop: 6, padding: '6px 10px', borderRadius: 8, background: typeCorrect && bloomsCorrect ? COLOR.greenLight : '#eff6ff', border: `1px solid ${typeCorrect && bloomsCorrect ? COLOR.greenBorder : '#93c5fd'}`, fontSize: 11, color: typeCorrect && bloomsCorrect ? COLOR.green : COLOR.textSecondary, lineHeight: 1.4 }}>
                  {typeCorrect && bloomsCorrect ? '\u2713 ' : `Answer: ${item.assessmentType} / ${item.blooms}. `}{item.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!checked && (
          <button type="button" onClick={() => setChecked(true)} disabled={!allFilled}
            style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, flex: '1 1 auto', opacity: allFilled ? 1 : 0.4 }}>
            Check Answers
          </button>
        )}
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
   Main export
   ═══════════════════════════════════════════════════════════════════════════ */
const MODES = ['lesson-sequencer', 'misconception-detector', 'assessment-matcher'];

export default function PedagogyExplorer({ activityIndex = 0, onComplete, continueLabel = 'Continue', badgeLabel = 'Interactive activity', embedded = false }) {
  const mode = MODES[activityIndex % MODES.length];
  if (mode === 'lesson-sequencer') return <LessonSequencer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'misconception-detector') return <MisconceptionDetector onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  return <AssessmentMatcher onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
}
