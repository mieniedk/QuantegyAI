/**
 * CompetencyActivity — subject-aware interactive activity for the practice loop.
 *
 * Math domains route to dedicated interactive explorers:
 *   comp001 → NumberExplorer, comp002 → SlopeExplorer (with mode) or AlgebraExplorer,
 *   comp003 → GeoExplorer, comp004 → StatsExplorer,
 *   comp005 → ReasoningExplorer, comp006 → PedagogyExplorer.
 * Non-math subjects fall through to KeyConceptMatch or QuickRecall.
 */
import React, { useState, useMemo, useEffect } from 'react';
import SlopeExplorer from './SlopeExplorer';
import YInterceptExplorer from './YInterceptExplorer';
import NumberExplorer from './NumberExplorer';
import AlgebraExplorer from './AlgebraExplorer';
import GeoExplorer from './GeoExplorer';
import StatsExplorer from './StatsExplorer';
import ReasoningExplorer from './ReasoningExplorer';
import PedagogyExplorer from './PedagogyExplorer';
import CalculusExplorer from './CalculusExplorer';
import { sanitizeHtml } from '../utils/sanitize';
import { formatMathHtml } from '../utils/mathFormat';
import {
  COLOR, CARD, BTN_PRIMARY, BTN_PRIMARY_DISABLED, BADGE,
  OPTION_BASE, OPTION_SELECTED, OPTION_DISABLED,
} from '../utils/loopStyles';

/** Domain II standards where slope / intercept micro-activities apply */
const LINEAR_SLOPE_STANDARDS = new Set(['c005', 'c006']);

/** Three distinct interactives per standard (activity A/B/C); topics stay within the loop scope. */
const GEO_INTERACTIVE_MODE_SETS = {
  c011: ['area-builder', 'angle-explorer', 'transform-lab'],
  c012: ['angle-explorer', 'parallel-perp-lab', 'transform-lab'],
  c013: ['area-builder', 'parallel-perp-lab', 'angle-explorer'],
  c014: ['transform-lab', 'area-builder', 'parallel-perp-lab'],
};
const STATS_INTERACTIVE_MODE_SETS = {
  c015: ['mean-builder', 'median-sorter', 'box-plot'],
  c016: ['prob-sim', 'mean-builder', 'bell-curve'],
  c017: ['bell-curve', 'line-fit', 'box-plot'],
};
const REASONING_INTERACTIVE_MODE_SETS = {
  c018: ['proof-sorter', 'pattern-finder', 'representation-match'],
  c019: ['representation-match', 'pattern-finder', 'proof-sorter'],
  c022: ['pattern-finder', 'representation-match', 'proof-sorter'],
};
const PEDAGOGY_INTERACTIVE_MODE_SETS = {
  c020: ['lesson-sequencer', 'misconception-detector', 'assessment-matcher'],
  c021: ['assessment-matcher', 'lesson-sequencer', 'misconception-detector'],
};
/** When Domain II has no explicit `mode` from the loop, rotate these algebra modes by activity index. */
const DOMAIN2_ALGEBRA_FALLBACK_MODE_SET = {
  c004: ['sequence-patterns', 'function-transform', 'quadratic'],
  c005: ['function-transform', 'quadratic', 'sequence-patterns'],
  c006: ['quadratic', 'function-transform', 'sequence-patterns'],
  c007: ['quadratic', 'function-transform', 'sequence-patterns'],
  c008: ['function-transform', 'quadratic', 'sequence-patterns'],
  c009: ['trig-circle', 'function-transform', 'quadratic'],
  c010: ['quadratic', 'function-transform', 'trig-circle'],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * KeyConceptMatch — match key terms to their definitions (tap to pair).
 */
function KeyConceptMatch({ pairs, onComplete, continueLabel, badgeLabel, embedded }) {
  const [selected, setSelected] = useState(null);
  const [matched, setMatched] = useState({});
  const [wrong, setWrong] = useState(null);
  const shuffledDefs = useMemo(() => shuffle(pairs.map((p) => p.def)), [pairs]);
  const allMatched = Object.keys(matched).length === pairs.length;

  const handleTermClick = (idx) => { if (matched[idx] == null) { setSelected(idx); setWrong(null); } };
  const handleDefClick = (def) => {
    if (selected == null) return;
    if (pairs[selected].def === def) {
      setMatched((prev) => ({ ...prev, [selected]: def }));
      setSelected(null);
      setWrong(null);
    } else {
      setWrong(def);
      setTimeout(() => setWrong(null), 800);
    }
  };

  return (
    <div role="region" aria-label={badgeLabel || 'Vocabulary matching activity'} style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Interactive activity'}</div>}
      <p style={{ margin: '0 0 16px', fontSize: 15, color: COLOR.textSecondary, fontWeight: 600 }}>
        Choose a term on the left, then choose its matching definition on the right.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pairs.map((p, i) => (
            <button key={i} type="button" onClick={() => handleTermClick(i)} disabled={matched[i] != null}
              style={{
                padding: '12px 14px', fontSize: 14, fontWeight: 700, textAlign: 'left', borderRadius: 12,
                border: `2px solid ${matched[i] != null ? COLOR.successBorder : selected === i ? COLOR.blue : COLOR.border}`,
                background: matched[i] != null ? COLOR.successBg : selected === i ? COLOR.blueBg : COLOR.card,
                color: matched[i] != null ? COLOR.successText : COLOR.text,
                cursor: matched[i] != null ? 'default' : 'pointer',
                opacity: matched[i] != null ? 0.7 : 1,
                transition: 'border-color 0.15s, background 0.15s',
              }}>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(p.term)) }} />
              {matched[i] != null && ' \u2713'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shuffledDefs.map((def, i) => {
            const isUsed = Object.values(matched).includes(def);
            return (
              <button key={i} type="button" onClick={() => handleDefClick(def)} disabled={isUsed}
                style={{
                  padding: '12px 14px', fontSize: 13, fontWeight: 600, textAlign: 'left', borderRadius: 12,
                  border: `2px solid ${isUsed ? COLOR.successBorder : wrong === def ? '#fca5a5' : COLOR.border}`,
                  background: isUsed ? COLOR.successBg : wrong === def ? COLOR.redBg : COLOR.card,
                  color: isUsed ? COLOR.successText : COLOR.textSecondary,
                  cursor: isUsed ? 'default' : 'pointer',
                  opacity: isUsed ? 0.7 : 1,
                  transition: 'border-color 0.2s, background 0.2s',
                }}>
                <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(def)) }} />
                {isUsed && ' \u2713'}
              </button>
            );
          })}
        </div>
      </div>
      {allMatched && <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: COLOR.successText }}>{'\u2713'} All pairs are matched with accurate concept-to-definition reasoning.</p>}
      <button type="button" onClick={onComplete}
        style={BTN_PRIMARY}>
        {continueLabel}
      </button>
    </div>
  );
}

/**
 * QuickRecall — answer a competency-specific question correctly to continue.
 */
function QuickRecall({ question, onComplete, continueLabel, badgeLabel, embedded }) {
  const [answer, setAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const options = useMemo(() => {
    if (question.options) return question.options;
    if (question.choices) {
      const keys = ['A', 'B', 'C', 'D'];
      const obj = {};
      question.choices.forEach((c, i) => { obj[keys[i]] = c; });
      return obj;
    }
    return {};
  }, [question]);

  const correctKey = useMemo(() => {
    if (question.correct) return question.correct;
    if (question.answer && question.choices) {
      const keys = ['A', 'B', 'C', 'D'];
      const idx = question.choices.indexOf(question.answer);
      if (idx >= 0) return keys[idx];
    }
    const fallbackKeys = Object.keys(question.options || {});
    return fallbackKeys[0] || 'A';
  }, [question]);

  const isCorrect = submitted && answer === correctKey;
  const hasOptions = Object.keys(options).length > 0;

  if (!hasOptions) {
    return (
      <div style={embedded ? {} : CARD}>
        {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Interactive activity'}</div>}
        <p style={{ color: COLOR.textSecondary, margin: '0 0 20px', fontSize: 15 }}>No options available for this question. Tap Continue to move on.</p>
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
      </div>
    );
  }

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Interactive activity'}</div>}
      <p style={{ margin: '0 0 16px', fontSize: 15, color: COLOR.text, fontWeight: 700 }}>
        <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(question.q || question.question || question.statement || '')) }} />
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {Object.entries(options).map(([key, val]) => {
          const isCorrectKey = key === correctKey;
          const isSelected = answer === key;
          let style;
          if (submitted && isCorrectKey) {
            style = { ...OPTION_DISABLED, borderColor: COLOR.successBorder, background: COLOR.successBg };
          } else if (submitted && isSelected && !isCorrectKey) {
            style = { ...OPTION_DISABLED, borderColor: '#fca5a5', background: COLOR.redBg };
          } else if (isSelected) {
            style = OPTION_SELECTED;
          } else {
            style = submitted ? OPTION_DISABLED : OPTION_BASE;
          }
          return (
            <button key={key} type="button" onClick={() => !submitted && setAnswer(key)} style={style}>
              <strong style={{ marginRight: 6 }}>{key})</strong>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(String(val))) }} />
              {submitted && isCorrectKey && <span style={{ marginLeft: 8, color: COLOR.green, fontWeight: 800 }}>{'\u2713'}</span>}
              {submitted && isSelected && !isCorrectKey && <span style={{ marginLeft: 8, color: COLOR.red, fontWeight: 800 }}>{'\u2717'}</span>}
            </button>
          );
        })}
      </div>
      {!submitted && answer != null && (
        <button type="button" onClick={() => setSubmitted(true)}
          style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, border: `2px solid ${COLOR.blueBorder}`, boxShadow: `0 0 14px rgba(37,99,235,0.25)`, marginBottom: 12 }}>
          Check
        </button>
      )}
      {submitted && !isCorrect && (
        <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: COLOR.red }}>
          Not correct yet - the keyed answer is {correctKey}. Re-check the mathematical condition in the prompt before your next attempt. {question.explanation && <span style={{ fontWeight: 600, color: COLOR.textSecondary }}>{question.explanation}</span>}
        </p>
      )}
      {submitted && isCorrect && (
        <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: COLOR.successText }}>
          {'\u2713'} Correct choice - your selected option matches the required mathematical reasoning. {question.explanation && <span style={{ fontWeight: 600, color: COLOR.textSecondary }}>{question.explanation}</span>}
        </p>
      )}
      <button type="button" onClick={onComplete}
        style={BTN_PRIMARY}>
        {continueLabel}
      </button>
    </div>
  );
}

function buildPairsFromQuestions(questions, comp, count = 4) {
  const pool = questions.filter((q) => q.comp === comp && (q.q || q.question || q.statement));
  const picked = shuffle(pool).slice(0, count);
  return picked.map((q) => {
    const text = q.q || q.question || q.statement || '';
    const ans = q.answer || (q.choices ? q.choices.find((c, i) => ['A', 'B', 'C', 'D'][i] === q.correct) : '') || '';
    return { term: text.length > 80 ? text.slice(0, 77) + '...' : text, def: String(ans) };
  });
}

/**
 * Main exported component — picks the right activity based on subject.
 * All hooks are called unconditionally before any conditional returns.
 */
export default function CompetencyActivity({
  subject,
  examId,
  comp,
  currentStd = '',
  mode,
  onComplete = () => {},
  continueLabel = 'Continue',
  activityIndex = 0,
  /** Raw interactive slot 0 / 1 / 2 for tiles A / B / C (before revisit seed is added to activityIndex). */
  activitySlot = null,
  seed = 0,
  badgeLabel = 'Interactive activity',
  embedded = false,
}) {
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    let cancelled = false;
    import('../data/texes-questions').then((mod) => {
      if (cancelled) return;
      setQuestions(mod.getQuestionsForExam(examId) || []);
    }).catch(() => {
      if (!cancelled) setQuestions([]);
    });
    return () => { cancelled = true; };
  }, [examId]);
  const compQuestions = useMemo(() => questions.filter((q) => q.comp === comp), [questions, comp]);
  const useMatch = activityIndex % 2 === 0 && compQuestions.length >= 4;
  const pairs = useMemo(
    () => useMatch ? buildPairsFromQuestions(questions, comp, 4) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, comp, activityIndex, useMatch],
  );
  const question = useMemo(() => {
    if (compQuestions.length === 0) return null;
    return compQuestions[activityIndex % compQuestions.length];
  }, [compQuestions, activityIndex]);

  /* ── Math: topic-specific interactive activities ── */
  if (subject === 'math' && mode) {
    const slopeFamily = ['slope', 'intercept', 'both', 'y-intercept-read'];
    const allowSlopeFamily = comp === 'comp002' && (!currentStd || LINEAR_SLOPE_STANDARDS.has(currentStd));
    if (slopeFamily.includes(mode) && allowSlopeFamily) {
      if (mode === 'intercept') return <SlopeExplorer mode="intercept" onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
      if (mode === 'both') return <SlopeExplorer mode="both" onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
      if (mode === 'y-intercept-read') return <YInterceptExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
      if (mode === 'slope') return <SlopeExplorer mode="slope" onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
    }
    if (comp === 'comp002' && ['sequence-patterns', 'function-transform', 'quadratic', 'trig-circle'].includes(mode)) {
      return <AlgebraExplorer mode={mode} activityIndex={activityIndex} onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
    }
  }
  if (subject === 'math' && comp === 'comp001') {
    const numberModeSet = currentStd === 'c001'
      ? ['number-line', 'real-number-sets', 'real-properties', 'commutativity']
      : currentStd === 'c002'
        ? null
        : currentStd === 'c003'
          ? ['prime-blast', 'real-number-sets', 'factor-lab', 'gcd-lcm', 'prime-blast', 'real-number-sets', 'factor-lab']
          : null;
    const slot = activitySlot != null ? activitySlot : 0;
    let modeOverride = null;
    if (currentStd === 'c002') {
      const others = ['complex-geometry', 'complex-fractal', 'complex-card-sort', 'complex-arithmetic', 'complex-equations'];
      const s = ((Number(seed) || 0) % others.length + others.length) % others.length;
      modeOverride = slot === 1 ? 'real-number-sets' : slot === 0 ? others[s] : others[(s + 1) % others.length];
    }
    return (
      <NumberExplorer
        activityIndex={activityIndex}
        activitySlot={activitySlot}
        modeOverride={modeOverride}
        modeSet={numberModeSet}
        onComplete={onComplete}
        continueLabel={continueLabel}
        badgeLabel={badgeLabel}
        embedded={embedded}
      />
    );
  }
  if (subject === 'math' && comp === 'comp002' && !mode) {
    const fb = DOMAIN2_ALGEBRA_FALLBACK_MODE_SET[currentStd];
    if (fb?.length) {
      return (
        <AlgebraExplorer
          modeSet={fb}
          activityIndex={activityIndex}
          onComplete={onComplete}
          continueLabel={continueLabel}
          badgeLabel={badgeLabel}
          embedded={embedded}
        />
      );
    }
    return <AlgebraExplorer activityIndex={activityIndex} onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  }
  if (subject === 'math' && comp === 'comp003') {
    const geoSet = GEO_INTERACTIVE_MODE_SETS[currentStd];
    return (
      <GeoExplorer
        activityIndex={activityIndex}
        modeSet={geoSet}
        onComplete={onComplete}
        continueLabel={continueLabel}
        badgeLabel={badgeLabel}
        embedded={embedded}
      />
    );
  }
  if (subject === 'math' && comp === 'comp004') {
    const statsSet = STATS_INTERACTIVE_MODE_SETS[currentStd];
    return (
      <StatsExplorer
        activityIndex={activityIndex}
        modeSet={statsSet}
        onComplete={onComplete}
        continueLabel={continueLabel}
        badgeLabel={badgeLabel}
        embedded={embedded}
      />
    );
  }
  if (subject === 'math' && comp === 'comp005') {
    const reasoningSet = REASONING_INTERACTIVE_MODE_SETS[currentStd];
    return (
      <ReasoningExplorer
        activityIndex={activityIndex}
        modeSet={reasoningSet}
        onComplete={onComplete}
        continueLabel={continueLabel}
        badgeLabel={badgeLabel}
        embedded={embedded}
      />
    );
  }
  if (subject === 'math' && comp === 'comp006') {
    const pedagogySet = PEDAGOGY_INTERACTIVE_MODE_SETS[currentStd];
    return (
      <PedagogyExplorer
        activityIndex={activityIndex}
        modeSet={pedagogySet}
        onComplete={onComplete}
        continueLabel={continueLabel}
        badgeLabel={badgeLabel}
        embedded={embedded}
      />
    );
  }
  if (subject === 'math' && examId === 'calculus') {
    return (
      <CalculusExplorer
        currentStd={currentStd}
        activityIndex={activityIndex}
        onComplete={onComplete}
        continueLabel={continueLabel}
        badgeLabel={badgeLabel}
        embedded={embedded}
      />
    );
  }

  /* ── Non-math subjects ── */
  if (useMatch && pairs.length >= 2) {
    return <KeyConceptMatch pairs={pairs} onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  }

  if (!question) {
    return (
      <div style={embedded ? {} : CARD}>
        {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Interactive activity'}</div>}
        <p style={{ color: COLOR.textSecondary, margin: '0 0 20px', fontSize: 15 }}>No interactive content available for this competency yet.</p>
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>
          {continueLabel}
        </button>
      </div>
    );
  }

  const formattedQ = {
    ...question,
    q: question.q || question.question || question.statement,
    correct: (() => {
      if (question.correct) return question.correct;
      if (question.answer && question.choices) {
        const idx = question.choices.indexOf(question.answer);
        return idx >= 0 ? ['A', 'B', 'C', 'D'][idx] : 'A';
      }
      return 'A';
    })(),
    options: (() => {
      if (question.options) return question.options;
      if (question.choices) {
        const obj = {};
        question.choices.forEach((c, i) => { obj[['A', 'B', 'C', 'D'][i]] = c; });
        return obj;
      }
      return {};
    })(),
  };

  return <QuickRecall question={formattedQ} onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
}
