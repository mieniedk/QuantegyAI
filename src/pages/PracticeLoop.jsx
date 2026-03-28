import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { queryBank, getLecture, recordResult, getConceptId } from '../data/testBank';
import {
  getQuestionsForExam, getDomainsForExam, getStandardForQuestion,
  getCompName, getCompForTeks, getCompKeyIdea,
} from '../data/texes-questions';
import { GAMES_CATALOG } from '../data/games';
import { getMicroConcept } from '../data/microConcepts';
import CompetencyActivity from '../components/CompetencyActivity';
import ReasoningExplorer from '../components/ReasoningExplorer';
import Calculator, { CALC_TYPE_BY_EXAM } from '../components/Calculator';
import ScratchPad from '../components/ScratchPad';
import AnimatedLecture from '../components/AnimatedLecture';
import { getLectureForComp } from '../data/lectures';
import { sanitizeHtml } from '../utils/sanitize';
import { formatMathHtml, conceptToBulletHtml } from '../utils/mathFormat';
import {
  getMasteryScore, getMasteryStatus, updateMastery, getExamProgress, getStandardPathProgress,
  retryMasteryPersist,
} from '../utils/masteryEngine';
import { phaseNeedsUrlUpdate, withPhaseInSearch } from '../utils/practiceLoopUrl';
import {
  COLOR, CARD, BTN_PRIMARY, BTN_GAME_LINK, BADGE, HEADING, BODY,
  SCOPE_BADGE, OPTION_BASE, OPTION_SELECTED, OPTION_DISABLED,
  resultBanner, resultTitle, resultScore, PROGRESS_TRACK, progressFill,
  MOBILE_BP, SMALL_PHONE_BP, TIGHT_LANDSCAPE_HEIGHT_BP,
} from '../utils/loopStyles';
import learningLoopConfig from '../data/learning-loop-config.json';
import {
  buildLoopReviewKey,
  loadLoopReview,
  addWeakQuestionIds,
  toggleFlaggedQuestion,
  getSpacedReviewCandidates,
  persistLoopReviewSnapshot,
} from '../utils/loopReviewStorage';
import {
  getLearningGoals,
  saveLearningGoals,
  getPacingPreference,
  savePacingPreference,
  touchLoopSessionStart,
  milestoneStorageKey,
  trySetMilestone,
  saveSessionDiagnosticPct,
  getSessionDiagnosticPct,
  saveReflection,
  shouldOfferBreak,
  markBreakOffered,
  getRecoveryHintForDifficulty,
  getTeachingMove,
  getExamCountdownLabel,
} from '../utils/learningExperienceStorage';

import PaywallGate from '../components/PaywallGate';
import SaveProgressModal from '../components/SaveProgressModal';
import { isStudentLoggedIn, hasExamAccess } from '../utils/studentAuth';
import { fireConfetti } from '../utils/confetti';
import { trackEvent, flushTelemetryOnExit } from '../utils/telemetry';
import { motionTransition } from '../utils/motion';
import { showAppToast } from '../utils/appToast';

const COMPETENCY_EXPLORER = { id: 'concept-explorer', name: 'Concept Explorer', path: '/concept-explorer' };
const FREE_TILE_LIMIT = 5;
const SAVE_PROGRESS_TILE_THRESHOLD = 3;
const QUIZ_PHASES = new Set([
  'diagnostic',
  'check-quiz',
  'check-quiz-2',
  'check-quiz-3',
  'check-quiz-4',
  'check-quiz-5',
  'check-quiz-6',
  'check-quiz-7',
  'check-quiz-8',
  'readiness-quiz',
  'mastery-check',
]);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hashString(input) {
  let h = 2166136261;
  const s = String(input || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle(arr, seedInput) {
  const a = [...arr];
  let state = hashString(seedInput) || 1;
  const rand = () => {
    state = Math.imul(state, 1664525) + 1013904223;
    return ((state >>> 0) / 4294967296);
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeDifficulty(value) {
  if (value === 1 || value === '1' || value === 'easy') return 'easy';
  if (value === 3 || value === '3' || value === 'hard') return 'hard';
  return 'medium';
}

function inferMathFocus(questionText = '') {
  const text = String(questionText || '').toLowerCase();
  if (!text) return 'algebraic setup';
  if (/(slope|intercept|linear|y\s*=|mx\+b|rate of change)/.test(text)) return 'linear relationships';
  if (/(quadratic|parabola|vertex|discriminant|factor)/.test(text)) return 'quadratic structure';
  if (/(fraction|numerator|denominator|common denominator|rational)/.test(text)) return 'fraction operations';
  if (/(percent|percentage|ratio|proportion|unit rate)/.test(text)) return 'ratio and percent reasoning';
  if (/(probability|mean|median|mode|standard deviation|data|distribution)/.test(text)) return 'data and probability reasoning';
  if (/(area|perimeter|volume|surface area|triangle|circle|angle|polygon|geometry)/.test(text)) return 'geometry measurement';
  if (/(exponent|power|radical|sqrt|log|logarithm|exponential)/.test(text)) return 'exponent and radical rules';
  if (/(inequality|<|>|<=|>=)/.test(text)) return 'inequality reasoning';
  return 'algebraic setup';
}

function buildMathRecoveryHint(q) {
  const questionText = String(q?.question || '');
  const correct = q?.correct == null ? '' : String(q.correct);
  const correctSnippet = correct ? ` For this item, the correct value/choice is ${correct}.` : '';
  const focus = inferMathFocus(questionText);
  if (focus === 'linear relationships') {
    return `Set up the line explicitly (identify slope and intercept), then substitute values and verify the sign of your slope.${correctSnippet}`;
  }
  if (focus === 'quadratic structure') {
    return `Rewrite the expression in a usable form (factor, complete the square, or use the quadratic formula), then check by substitution.${correctSnippet}`;
  }
  if (focus === 'fraction operations') {
    return `Use a common denominator before adding/subtracting, simplify only after combining terms, and keep track of negatives.${correctSnippet}`;
  }
  if (focus === 'ratio and percent reasoning') {
    return `Translate the prompt into a proportion or percent equation first, solve step-by-step, then check units and scale.${correctSnippet}`;
  }
  if (focus === 'data and probability reasoning') {
    return `List the sample space or data values first, apply the exact formula (mean/median/probability), then verify denominator and interpretation.${correctSnippet}`;
  }
  if (focus === 'geometry measurement') {
    return `Sketch and label all known measures, choose the matching geometry formula, and plug in units carefully.${correctSnippet}`;
  }
  if (focus === 'exponent and radical rules') {
    return `Apply one exponent/radical rule at a time (do not combine unlike bases/terms), then simplify and check equivalent forms.${correctSnippet}`;
  }
  if (focus === 'inequality reasoning') {
    return `Solve as an equation first, then apply inequality rules (including flipping the sign when multiplying/dividing by a negative), and test a point.${correctSnippet}`;
  }
  return `Translate the words into an equation, solve one algebra step at a time, and substitute back to verify.${correctSnippet}`;
}

function summarizeMathFocus(missedQuestions = []) {
  if (!Array.isArray(missedQuestions) || missedQuestions.length === 0) return '';
  const counts = new Map();
  missedQuestions.forEach((q) => {
    const focus = inferMathFocus(q?.question || '');
    counts.set(focus, (counts.get(focus) || 0) + 1);
  });
  let top = '';
  let topCount = 0;
  counts.forEach((count, focus) => {
    if (count > topCount) {
      top = focus;
      topCount = count;
    }
  });
  return top;
}

function orderByDifficultyBias(items, bias = 'medium', seedInput = '') {
  const easy = [];
  const medium = [];
  const hard = [];
  for (const item of items) {
    const d = normalizeDifficulty(item?.difficulty);
    if (d === 'easy') easy.push(item);
    else if (d === 'hard') hard.push(item);
    else medium.push(item);
  }
  const seeded = (arr, suffix) => seededShuffle(arr, `${seedInput}|${suffix}`);
  if (bias === 'easy') return [...seeded(easy, 'easy'), ...seeded(medium, 'medium'), ...seeded(hard, 'hard')];
  if (bias === 'hard') return [...seeded(hard, 'hard'), ...seeded(medium, 'medium'), ...seeded(easy, 'easy')];
  return [...seeded(medium, 'medium'), ...seeded(easy, 'easy'), ...seeded(hard, 'hard')];
}

function toYouTubeEmbed(url) {
  if (!url) return null;
  const match = (String(url).match(/(?:embed\/|v=)([a-zA-Z0-9_-]+)/) || String(url).match(/youtu\.be\/([a-zA-Z0-9_-]+)/));
  if (!match?.[1]) return null;
  return `https://www.youtube.com/embed/${match[1]}`;
}

function computeTargetCountsFromMix(total, mix = {}) {
  const safeTotal = Math.max(0, Number(total) || 0);
  if (safeTotal === 0) return { easy: 0, medium: 0, hard: 0 };
  const rawEasy = Number(mix.easy ?? 0.34);
  const rawMedium = Number(mix.medium ?? 0.43);
  const rawHard = Number(mix.hard ?? 0.23);
  const sum = rawEasy + rawMedium + rawHard;
  const e = sum > 0 ? rawEasy / sum : 0.34;
  const m = sum > 0 ? rawMedium / sum : 0.43;
  const h = sum > 0 ? rawHard / sum : 0.23;

  const base = {
    easy: Math.floor(e * safeTotal),
    medium: Math.floor(m * safeTotal),
    hard: Math.floor(h * safeTotal),
  };
  let remain = safeTotal - (base.easy + base.medium + base.hard);
  const frac = [
    ['easy', e * safeTotal - base.easy],
    ['medium', m * safeTotal - base.medium],
    ['hard', h * safeTotal - base.hard],
  ].sort((a, b) => b[1] - a[1]);
  let idx = 0;
  while (remain > 0) {
    base[frac[idx % frac.length][0]] += 1;
    remain -= 1;
    idx += 1;
  }
  return base;
}

function buildOrderedPoolForPhase(items, {
  seedInput = '',
  bias = 'medium',
  mix = null,
} = {}) {
  const easy = [];
  const medium = [];
  const hard = [];
  for (const q of items || []) {
    const d = normalizeDifficulty(q?.difficulty);
    if (d === 'easy') easy.push(q);
    else if (d === 'hard') hard.push(q);
    else medium.push(q);
  }

  const seeded = (arr, tag) => seededShuffle(arr, `${seedInput}|${tag}`);
  const e = seeded(easy, 'easy');
  const m = seeded(medium, 'medium');
  const h = seeded(hard, 'hard');
  const targets = mix ? computeTargetCountsFromMix(items.length, mix) : null;

  const pullUnique = (bucket, count, selectedSet, out) => {
    for (const item of bucket) {
      if (out.length >= count) break;
      if (selectedSet.has(item.id)) continue;
      selectedSet.add(item.id);
      out.push(item);
    }
  };

  const ordered = [];
  const selected = new Set();
  if (targets) {
    const easyTarget = [];
    pullUnique(e, targets.easy, selected, easyTarget);
    if (easyTarget.length < targets.easy) pullUnique(m, targets.easy, selected, easyTarget);
    if (easyTarget.length < targets.easy) pullUnique(h, targets.easy, selected, easyTarget);
    ordered.push(...easyTarget);

    const mediumTarget = [];
    pullUnique(m, targets.medium, selected, mediumTarget);
    if (mediumTarget.length < targets.medium) pullUnique(e, targets.medium, selected, mediumTarget);
    if (mediumTarget.length < targets.medium) pullUnique(h, targets.medium, selected, mediumTarget);
    ordered.push(...mediumTarget);

    const hardTarget = [];
    pullUnique(h, targets.hard, selected, hardTarget);
    if (hardTarget.length < targets.hard) pullUnique(m, targets.hard, selected, hardTarget);
    if (hardTarget.length < targets.hard) pullUnique(e, targets.hard, selected, hardTarget);
    ordered.push(...hardTarget);
  }

  const byBias = orderByDifficultyBias(items, bias, `${seedInput}|bias`);
  for (const item of byBias) {
    if (selected.has(item.id)) continue;
    selected.add(item.id);
    ordered.push(item);
  }
  return ordered;
}

function pickPhaseQuestions(orderedPool, count, usedIds, recentIds = []) {
  const out = [];
  const inPhase = new Set();
  const recent = new Set(recentIds || []);

  const takeFrom = (list, predicate) => {
    for (const q of list) {
      if (out.length >= count) break;
      if (inPhase.has(q.id)) continue;
      if (!predicate(q)) continue;
      inPhase.add(q.id);
      out.push(q);
    }
  };

  // 1) Prefer never-used and not-recent items.
  takeFrom(orderedPool, (q) => !usedIds.has(q.id) && !recent.has(q.id));
  // 2) Allow never-used items even if recent.
  if (out.length < count) takeFrom(orderedPool, (q) => !usedIds.has(q.id));
  // 3) Then allow used but not-recent.
  if (out.length < count) takeFrom(orderedPool, (q) => !recent.has(q.id));
  // 4) Finally allow any remaining to fill.
  if (out.length < count) takeFrom(orderedPool, () => true);

  return out.slice(0, count);
}

const MATH_ACTIVITY_MODES = ['slope', 'intercept', 'both', 'y-intercept-read'];
const LINEAR_FUNCTION_COMPS = new Set(['comp002']);
const LINEAR_FUNCTION_STANDARDS = new Set(['c005', 'c006']);

function buildActivityModeSequence(count, seedInput) {
  const base = seededShuffle(MATH_ACTIVITY_MODES, seedInput);
  const sequence = [];
  for (let i = 0; i < count; i++) sequence.push(base[i % base.length]);
  return sequence;
}

const TILE_ID_TO_PHASE = {
  'diagnostic-quiz': 'diagnostic',
  'video-a': 'video',
  'check-quiz-1': 'check-quiz',
  'game-a': 'game',
  'check-quiz-2': 'check-quiz-2',
  'interactive-a': 'activity-1',
  'check-quiz-3': 'check-quiz-3',
  'concept-reminder-a': 'concept-refresh',
  'check-quiz-4': 'check-quiz-4',
  'game-b': 'game2',
  'check-quiz-5': 'check-quiz-5',
  'interactive-b': 'activity-2',
  'check-quiz-6': 'check-quiz-6',
  'video-b': 'video-2',
  'check-quiz-7': 'check-quiz-7',
  'game-c': 'game3',
  'check-quiz-8': 'check-quiz-8',
  'interactive-c': 'activity-3',
  'game-d': 'game4',
  'readiness-quiz': 'readiness-quiz',
  'mastery-test': 'mastery-check',
};
const PHASES = (learningLoopConfig.sequence || [])
  .map((tile) => TILE_ID_TO_PHASE[tile.id])
  .filter(Boolean);
function readPositiveInt(value, fallback) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}
const QUIZ_SPECS = learningLoopConfig.quizSpecs || {};
const DIAGNOSTIC_COUNT = readPositiveInt(QUIZ_SPECS.diagnostic?.questionCount, 4);
const CHECK_QUIZ_COUNT = readPositiveInt(QUIZ_SPECS.check?.questionCount, 3);
const READINESS_COUNT = readPositiveInt(QUIZ_SPECS.readiness?.questionCount, DIAGNOSTIC_COUNT);
const MASTERY_COUNT = readPositiveInt(
  QUIZ_SPECS.mastery?.questionCount
    ?? QUIZ_SPECS.mastery?.questionCountMax
    ?? QUIZ_SPECS.mastery?.questionCountMin,
  5,
);
const STEPS_PER_CYCLE = PHASES.length;

/** Spaced review: weave weak/flagged items into these checkpoints (one slot each). */
const SPACED_REVIEW_PHASE_KEYS = new Set(['check-quiz-3', 'check-quiz-6', 'readiness-quiz']);

const QUIZ_SUFFIX_LABEL = {
  diagnostic: 'Diagnostic quiz',
  check: 'Short quiz (after Video A)',
  check2: 'Short quiz (after Game 1)',
  check3: 'Short quiz (mid-loop A)',
  check4: 'Short quiz (after concept recap)',
  check5: 'Short quiz (before Activity B)',
  check6: 'Short quiz (before Video B)',
  check7: 'Short quiz (after Video B)',
  check8: 'Short quiz (before final activity)',
  readiness: 'Readiness quiz',
  mastery: 'Mastery test',
};
const QUIZ_SUFFIX_TO_PHASE = {
  diagnostic: 'diagnostic',
  check: 'check-quiz',
  check2: 'check-quiz-2',
  check3: 'check-quiz-3',
  check4: 'check-quiz-4',
  check5: 'check-quiz-5',
  check6: 'check-quiz-6',
  check7: 'check-quiz-7',
  check8: 'check-quiz-8',
  readiness: 'readiness-quiz',
  mastery: 'mastery-check',
};

const MICRO_GOALS_BY_PHASE = {
  diagnostic: 'A short quiz to find your starting point so the loop focuses on what you need most.',
  video: 'A short animated tip highlights one key idea for this standard.',
  'micro-teach': 'A quick lesson with key vocabulary and examples you can apply right away.',
  'check-quiz': 'Show you can use the concept you just learned on a few practice questions.',
  game: 'Practice the same skill in a game format to build speed and confidence.',
  'check-quiz-2': 'Confirm the skill is sticking after mixed practice.',
  'activity-1': 'Connect the concept to a hands-on or visual task.',
  'check-quiz-3': 'Mid-loop checkpoint — see how much you have retained so far.',
  'concept-refresh': 'A quick recap of the key idea before your next quiz.',
  'check-quiz-4': 'Check whether the recap cleared up any remaining gaps.',
  game2: 'A different game to make sure the skill transfers beyond one question style.',
  'activity-2': 'Build fluency with another interactive exercise.',
  'check-quiz-5': 'Checkpoint before the second half of the loop.',
  'activity-3': 'One more interactive to prepare you for the readiness gate.',
  'check-quiz-8': 'Sharpen your understanding before the final stretch.',
  'activity-4': 'Low-stakes practice to reinforce the concept.',
  'activity-5': 'Warm up for the next checkpoint quiz.',
  'activity-6': 'Keep your momentum going before the next game break.',
  'activity-7': 'Hands-on practice to prepare you for the deeper lesson.',
  'video-2': 'A deeper lesson that zooms into a specific technique within this competency.',
  'check-quiz-7': 'Show that the deeper lesson translated into stronger problem-solving.',
  game3: 'One more game to mix things up before the final quizzes.',
  'activity-8': 'Warm up for the next lesson with targeted practice.',
  'activity-9': 'One more interactive before the last game.',
  game4: 'Lock in retention before the final checkpoints.',
  'activity-10': 'Prepare for the pre-mastery quiz.',
  'check-quiz-6': 'A spaced-review pulse to make sure earlier material is still solid.',
  'activity-11': 'Final practice before readiness and mastery.',
  'readiness-quiz': 'Prove you are ready for the mastery test — review items may appear.',
  'mastery-check': 'Earn competency completion or see exactly what to revisit.',
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function gradeToExamId(g) {
  if (!g) return null;
  if (g === 'grade7-12' || g === 'algebra') return 'math712';
  if (g === 'grade4-8') return 'math48';
  return null;
}

function texesToBankItem(q, { spacedReview = false } = {}) {
  return {
    id: q.id, type: q.type || 'mc', difficulty: q.difficulty || 1,
    question: q.q, options: q.choices, correct: q.answer,
    explanation: q.explanation, comp: q.comp,
    spacedReview: !!spacedReview,
  };
}


/* ── Tile-type visual config ── */
const TILE_TYPE_META = {
  quiz: { icon: '\uD83D\uDCDD', label: 'Quiz', accent: COLOR.blue },
  video: { icon: '\uD83C\uDFAC', label: 'Lesson', accent: COLOR.blue },
  game: { icon: '\uD83C\uDFAE', label: 'Game', accent: COLOR.amber },
  interactive: { icon: '\u2728', label: 'Activity', accent: COLOR.purple },
  'concept-reminder': { icon: '\uD83D\uDCA1', label: 'Concept', accent: COLOR.purple },
  'mastery-test': { icon: '\uD83C\uDFC6', label: 'Mastery', accent: COLOR.green },
};
const SOLVE_TILE_TYPES = new Set(['quiz', 'game', 'interactive']);

const PHASE_TO_TILE_TYPE = {};
(learningLoopConfig.sequence || []).forEach((tile) => {
  const mapped = TILE_ID_TO_PHASE[tile.id];
  if (mapped) PHASE_TO_TILE_TYPE[mapped] = tile.type;
});

function getTileMeta(phaseKey) {
  const type = PHASE_TO_TILE_TYPE[phaseKey] || 'quiz';
  return TILE_TYPE_META[type] || TILE_TYPE_META.quiz;
}

/* ── Sub-components ── */

const PHASE_ENTER_STYLE = `
@keyframes phaseEnter {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .phase-card-enter { animation: none !important; }
}
`;
const _phaseStyleInjected = (() => {
  if (typeof document === 'undefined') return false;
  const s = document.createElement('style');
  s.textContent = PHASE_ENTER_STYLE;
  document.head.appendChild(s);
  return true;
})();

function PhaseCard({ children, stepIndex, totalSteps, phaseKey }) {
  const meta = phaseKey ? getTileMeta(phaseKey) : null;
  const tileType = phaseKey ? (PHASE_TO_TILE_TYPE[phaseKey] || 'quiz') : null;
  const compactSolveCard = !!tileType && SOLVE_TILE_TYPES.has(tileType);
  const narrowScreen = typeof window !== 'undefined' && window.innerWidth < 900;
  const stepNum = typeof stepIndex === 'number' ? stepIndex + 1 : null;
  return (
    <div
      className="phase-card-enter"
      style={{
        ...CARD,
        padding: compactSolveCard ? (narrowScreen ? '14px 12px' : '18px 16px') : CARD.padding,
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        animation: motionTransition('phaseEnter 0.35s ease-out'),
      }}
    >
      {stepNum != null && totalSteps && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: compactSolveCard ? 10 : 14, paddingBottom: compactSolveCard ? 8 : 12,
          borderBottom: `1px solid ${COLOR.borderLight}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {meta && <span style={{ fontSize: compactSolveCard ? 16 : 18 }}>{meta.icon}</span>}
            <span style={{ fontSize: compactSolveCard ? 11 : 12, fontWeight: 800, color: meta?.accent || COLOR.blue, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Step {stepNum} of {totalSteps}
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{ width: compactSolveCard ? 66 : 80, height: 6, borderRadius: 6, background: '#e5e7eb', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 6, background: meta?.accent || COLOR.green, width: `${Math.round((stepNum / totalSteps) * 100)}%`, transition: motionTransition('width 0.4s ease') }} />
            </div>
            <span style={{ fontSize: compactSolveCard ? 10 : 11, fontWeight: 700, color: COLOR.textMuted }}>{Math.round((stepNum / totalSteps) * 100)}%</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function PhaseBadge({ color, children }) {
  return <div style={{ ...BADGE, background: color + '18', color }}>{children}</div>;
}

function PhaseHeader({ badgeColor, badgeLabel, title, description, scopeBadge }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <PhaseBadge color={badgeColor}>{badgeLabel}</PhaseBadge>
      {scopeBadge && <div style={SCOPE_BADGE}>{scopeBadge}</div>}
      {title && <h2 style={{ ...HEADING, marginBottom: 8 }}>{title}</h2>}
      {description && <p style={{ ...BODY, marginBottom: 0 }}>{description}</p>}
    </div>
  );
}

function StepProgress({ current, total, compact = false, smallPhone = false }) {
  const safeCurrent = Math.max(0, current || 0);
  const safeTotal = Math.max(1, total || 1);
  // Include the current tile so visual progress matches "Step X of Y".
  const pct = Math.round(((safeCurrent + 1) / safeTotal) * 100);
  return (
    <div style={{ marginBottom: compact ? 8 : 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: compact ? (smallPhone ? 9 : 10) : 11, fontWeight: 700, color: COLOR.textMuted, marginBottom: 4, lineHeight: 1.3 }}>
        <span>Step {safeCurrent + 1} of {safeTotal}</span><span>{pct}%</span>
      </div>
      <div style={PROGRESS_TRACK}><div style={progressFill(pct)} /></div>
    </div>
  );
}

function MasteryBar({ label, score, status }) {
  const clr = score >= 85 ? COLOR.green : score >= 40 ? COLOR.amber : COLOR.red;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: COLOR.text, marginBottom: 3 }}>
        <span>{label}</span><span style={{ color: clr }}>{score}% — {status}</span>
      </div>
      <div style={PROGRESS_TRACK}><div style={progressFill(score, clr)} /></div>
    </div>
  );
}

function ExamBar({ label, mastered, total, countLabel = 'mastered' }) {
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: COLOR.textMuted, marginBottom: 3 }}>
        <span>{label} progress</span><span>{mastered}/{total} {countLabel}</span>
      </div>
      <div style={PROGRESS_TRACK}><div style={progressFill(pct, COLOR.blue)} /></div>
    </div>
  );
}

function MicroGoalBanner({ phase, whyMatters, compact = false, smallPhone = false }) {
  const text = MICRO_GOALS_BY_PHASE[phase];
  if (!text && !whyMatters) return null;
  return (
    <div style={{ marginBottom: compact ? 8 : 14 }}>
      {whyMatters && (
        <div
          style={{
            marginBottom: compact ? 8 : 10,
            padding: compact ? (smallPhone ? '8px 10px' : '9px 12px') : '10px 14px',
            borderRadius: 10,
            background: '#f0fdf4',
            border: `1px solid ${COLOR.green}44`,
            fontSize: compact ? 12 : 13,
            color: COLOR.text,
            lineHeight: compact ? 1.45 : 1.55,
          }}
        >
          <span style={{ fontWeight: 800, color: COLOR.green, fontSize: compact ? 9 : 10, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
            Why this matters
          </span>
          {whyMatters}
        </div>
      )}
      {text && (
        <div
          style={{
            padding: compact ? (smallPhone ? '8px 10px' : '9px 12px') : '10px 14px',
            borderRadius: 10,
            background: '#eff6ff',
            border: `1px solid ${COLOR.blue}33`,
            fontSize: compact ? 12 : 13,
            color: COLOR.text,
            lineHeight: compact ? 1.45 : 1.55,
          }}
        >
          <span style={{ fontWeight: 800, color: COLOR.blue, fontSize: compact ? 9 : 10, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
            Goal for this step
          </span>
          {text}
        </div>
      )}
    </div>
  );
}

function WorkedSolution({ explanation, misconception }) {
  const [open, setOpen] = React.useState(true);
  if (!explanation && !misconception) return null;

  const steps = [];
  let hasSteps = false;
  if (explanation) {
    const lines = explanation.split('\n').filter((l) => l.trim());
    for (const line of lines) {
      const m = line.match(/^(Step\s+\d+)\s*:\s*(.*)/i);
      if (m) {
        hasSteps = true;
        steps.push({ label: m[1], text: m[2] });
      } else if (hasSteps && steps.length > 0) {
        steps[steps.length - 1].text += ' ' + line.trim();
      } else {
        steps.push({ label: null, text: line.trim() });
      }
    }
  }

  return (
    <div style={{ marginTop: 10 }}>
      {misconception && (
        <div style={{ marginBottom: 8, padding: '10px 14px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 13, lineHeight: 1.55, color: '#78350f' }}>
          <strong style={{ display: 'block', marginBottom: 3, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Watch out</strong>
          <span style={{ fontStyle: 'italic' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(String(misconception))) }} />
        </div>
      )}
      {steps.length > 0 && (
        <div style={{ borderRadius: 10, border: `1px solid ${COLOR.border}`, overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
              padding: '10px 14px', background: COLOR.card, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, color: COLOR.text,
            }}
          >
            Worked Solution
            <span style={{ fontSize: 11, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>&#9660;</span>
          </button>
          {open && (
            <div style={{ padding: '8px 14px 14px' }}>
              {hasSteps ? steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < steps.length - 1 ? 10 : 0, alignItems: 'flex-start' }}>
                  <span style={{
                    flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
                    background: COLOR.blue, color: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 12, fontWeight: 800, marginTop: 1,
                  }}>{i + 1}</span>
                  <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6, color: COLOR.text, paddingTop: 3 }}>
                    <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(s.text)) }} />
                  </div>
                </div>
              )) : steps.map((s, i) => (
                <div key={i} style={{ fontSize: 13, lineHeight: 1.6, color: COLOR.text, marginBottom: i < steps.length - 1 ? 6 : 0 }}>
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(s.text)) }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuizBlock({
  pool, answers, setAnswers, submitted, setSubmitted, onSubmit, onContinue, quizLabel, quizDesc, onSkip,
  flaggedIds, onToggleFlag, showRecoveryHints = true,
  stepIndex, totalSteps, phaseKey, speedFeedback,
}) {
  const quizContainerRef = useRef(null);
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 900;
  const compactLandscape = viewportWidth > viewportHeight && viewportHeight <= 430;
  const compactQuiz = viewportWidth <= 430 || compactLandscape;
  const tinyQuiz = viewportWidth <= 360;
  const actionBtnStyle = compactQuiz
    ? { ...BTN_PRIMARY, width: '100%', minHeight: 44, padding: tinyQuiz ? '10px 12px' : '10px 14px', fontSize: 14 }
    : BTN_PRIMARY;
  const firstIncompleteQuestionId = useMemo(() => {
    if (!Array.isArray(pool)) return null;
    const pending = pool.find((q) => answers[q.id] == null);
    return pending?.id || pool[0]?.id || null;
  }, [pool, answers]);

  if (!pool || pool.length === 0) return (
    <PhaseCard stepIndex={stepIndex} totalSteps={totalSteps} phaseKey={phaseKey}>
      <PhaseHeader badgeColor={COLOR.textMuted} badgeLabel={quizLabel || 'Quiz'} description="No questions are available for this competency yet. Your progress is unaffected — tap Continue to move on." />
      <button type="button" onClick={onSkip || onContinue} style={BTN_PRIMARY}>Continue</button>
    </PhaseCard>
  );
  const flaggedSet = flaggedIds instanceof Set ? flaggedIds : new Set(flaggedIds || []);
  const correctCount = pool.filter((q) => answers[q.id] === q.correct).length;
  const scorePct = pool.length > 0 ? Math.round((correctCount / pool.length) * 100) : 0;
  const missedQuestions = pool.filter((q) => answers[q.id] !== q.correct);
  const topMissFocus = summarizeMathFocus(missedQuestions);
  const resultMessage = scorePct === 100
    ? 'Outstanding! You nailed this checkpoint with accurate setup and execution.'
    : scorePct >= 80
      ? `Strong checkpoint. You are mostly accurate; tighten one or two steps in ${topMissFocus || 'algebraic setup'} to prevent small misses.`
      : scorePct >= 50
        ? `Good effort. Most misses are in ${topMissFocus || 'multi-step setup'} — rework those items by writing each transformation line-by-line.`
        : `This checkpoint shows a gap in ${topMissFocus || 'core setup skills'}. Slow down, model each step, and verify with substitution before submitting.`;
  const nextStepMessage = scorePct === 100
    ? 'Next math step: continue and challenge yourself with harder items while keeping full written work.'
    : scorePct >= 80
      ? `Next math step: revisit the missed ${topMissFocus || 'concept'} item(s), solve again without choices, then continue.`
      : scorePct >= 50
        ? `Next math step: do one targeted redo on ${topMissFocus || 'the missed concept'} and check each arithmetic/algebra operation.`
        : `Next math step: use the concept reminder, then reattempt with a strict routine: define variables, set equation, solve, and verify.`;
  return (
    <PhaseCard stepIndex={stepIndex} totalSteps={totalSteps} phaseKey={phaseKey}>
      <PhaseHeader
        badgeColor={COLOR.blue}
        badgeLabel={quizLabel}
        description={quizDesc}
      />
      <div ref={quizContainerRef} data-quiz-block="true">
      {pool.map((q, qi) => (
        <div key={q.id} className="quiz-question" data-question-id={q.id} data-hotkey-target={String(firstIncompleteQuestionId === q.id)} style={{ marginBottom: compactQuiz ? 16 : 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <p style={{ fontWeight: 700, color: COLOR.text, margin: 0, fontSize: tinyQuiz ? 14 : 15, lineHeight: compactQuiz ? 1.45 : 1.5, flex: '1 1 200px' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(`Q${qi + 1}: ${q.question}`)) }} />
            {q.spacedReview && (
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 10px', borderRadius: 999, background: COLOR.amberBg, color: '#92400e', border: `1px solid ${COLOR.amber}` }}>
                Spaced review
              </span>
            )}
          </div>
          <div role="radiogroup" aria-label={`Question ${qi + 1} options`} style={{ display: 'flex', flexDirection: 'column', gap: compactQuiz ? 6 : 8 }}>
            {(q.options || []).map((opt, optIdx) => {
              const selected = answers[q.id] === opt;
              const isCorrect = submitted && opt === q.correct;
              const isWrong = submitted && selected && opt !== q.correct;
              let style = selected ? { ...OPTION_SELECTED } : { ...OPTION_BASE };
              if (submitted) {
                style = { ...OPTION_DISABLED };
                if (isCorrect) style = { ...style, borderColor: COLOR.green, background: COLOR.greenLight };
                if (isWrong) style = { ...style, borderColor: COLOR.red, background: COLOR.redBg };
              }
              return (
                <button
                  key={`${q.id}-${optIdx}`}
                  type="button"
                  className="quiz-option"
                  data-option-index={optIdx}
                  disabled={submitted}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                  style={{ ...style, outlineOffset: 2, minHeight: compactQuiz ? 44 : undefined, padding: compactQuiz ? (tinyQuiz ? '10px 12px' : '10px 14px') : style.padding, fontSize: compactQuiz ? 14 : style.fontSize, lineHeight: compactQuiz ? 1.35 : style.lineHeight }}
                >
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(String(opt))) }} />
                </button>
              );
            })}
          </div>
          {submitted && answers[q.id] !== q.correct && (q.explanation || q.misconception) && (
            <WorkedSolution explanation={q.explanation} misconception={q.misconception} />
          )}
          {submitted && answers[q.id] !== q.correct && !q.explanation && !q.misconception && showRecoveryHints && (
            <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: '#fffbeb', border: `1px solid ${COLOR.amber}55`, fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>Try this next</strong>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(buildMathRecoveryHint(q) || getRecoveryHintForDifficulty(q.difficulty))) }} />
            </div>
          )}
          {submitted && answers[q.id] === q.correct && q.explanation && (
            <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: COLOR.blueBg, fontSize: 13, color: COLOR.text, lineHeight: 1.5 }}>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(String(q.explanation))) }} />
            </div>
          )}
          {submitted && onToggleFlag && (
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                onClick={() => onToggleFlag(q.id)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: compactQuiz ? '8px 12px' : '6px 12px',
                  minHeight: compactQuiz ? 40 : undefined,
                  borderRadius: 8,
                  border: `1px solid ${flaggedSet.has(q.id) ? COLOR.amber : COLOR.border}`,
                  background: flaggedSet.has(q.id) ? COLOR.amberBg : '#fff',
                  color: flaggedSet.has(q.id) ? '#92400e' : COLOR.textSecondary,
                  cursor: 'pointer',
                }}
              >
                {flaggedSet.has(q.id) ? '★ Flagged for review' : 'Flag this question to review later'}
              </button>
            </div>
          )}
        </div>
      ))}
      </div>
      {!submitted ? (
        <button type="button" onClick={onSubmit} disabled={Object.keys(answers).length < pool.length} style={Object.keys(answers).length < pool.length ? { ...actionBtnStyle, opacity: 0.5, cursor: 'not-allowed' } : actionBtnStyle}>Submit</button>
      ) : (
        <>
          <div style={resultBanner(correctCount === pool.length)}>
            <div style={resultTitle}>{correctCount === pool.length ? 'Perfect!' : 'Results'}</div>
            <div style={resultScore(correctCount === pool.length)}>{correctCount}/{pool.length} correct</div>
          </div>
          <div style={{ marginTop: -4, marginBottom: 10, fontSize: 13, color: COLOR.text, lineHeight: 1.6 }}>{resultMessage}</div>
          {speedFeedback && <div style={{ marginBottom: 8, fontSize: 12, color: COLOR.blue, fontWeight: 600 }}>{speedFeedback}</div>}
          <div style={{ marginBottom: 12, fontSize: 12, color: COLOR.textMuted }}>{nextStepMessage}</div>
          <button type="button" onClick={onContinue} style={actionBtnStyle}>Continue</button>
        </>
      )}
      {!submitted && onSkip && <button type="button" onClick={onSkip} style={{ ...actionBtnStyle, background: COLOR.borderLight, color: COLOR.textSecondary, border: `1px solid ${COLOR.border}`, boxShadow: 'none', marginTop: 8 }}>Skip</button>}
    </PhaseCard>
  );
}

const VERIFIED_GAME_PATHS = new Set(
  GAMES_CATALOG.map((g) => g.path).concat(['/concept-explorer']),
);

function GamePhase({ gameLabel, scopeBadge, description, gameUrl, gameName, onSkip, stepIndex, totalSteps, phaseKey, continueOnly = false, scopeDebugText = '' }) {
  const basePath = (gameUrl || '').split('?')[0];
  const isVerified = VERIFIED_GAME_PATHS.has(basePath);
  const [frameHeight, setFrameHeight] = useState(560);

  useEffect(() => {
    const computeHeight = () => {
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const maxByViewport = Math.max(420, Math.floor(vh * 0.72));
      const target = vw <= 480
        ? 430
        : vw <= 768
          ? 500
          : 620;
      setFrameHeight(Math.min(target, maxByViewport));
    };
    computeHeight();
    window.addEventListener('resize', computeHeight);
    return () => window.removeEventListener('resize', computeHeight);
  }, []);

  return (
    <PhaseCard stepIndex={stepIndex} totalSteps={totalSteps} phaseKey={phaseKey}>
      <PhaseHeader
        badgeColor={COLOR.amber}
        badgeLabel={gameLabel}
        title={gameName}
        description={description}
        scopeBadge={scopeBadge}
      />
      {scopeDebugText && (
        <div
          style={{
            marginBottom: 10,
            padding: '8px 10px',
            borderRadius: 8,
            border: `1px solid ${COLOR.blue}44`,
            background: '#eff6ff',
            color: '#1e3a8a',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {scopeDebugText}
        </div>
      )}
      {isVerified ? (
        <div style={{ marginBottom: 12 }}>
          <iframe
            title={`Embedded ${gameName}`}
            src={gameUrl}
            style={{
              width: '100%',
              height: frameHeight,
              border: `1px solid ${COLOR.border}`,
              borderRadius: 12,
              background: '#0f172a',
            }}
          />
        </div>
      ) : (
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fcd34d', fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
          This game is coming soon. Tap Continue to keep practicing.
        </div>
      )}
      <button type="button" onClick={onSkip} style={BTN_PRIMARY}>Continue</button>
    </PhaseCard>
  );
}


function ActivityPhase({ subject, examId, comp, currentStd, mode, activityIndex, onComplete, badgeLabel, stepIndex, totalSteps, phaseKey, seed = 0 }) {
  return (
    <PhaseCard stepIndex={stepIndex} totalSteps={totalSteps} phaseKey={phaseKey}>
      <PhaseHeader badgeColor={COLOR.purple} badgeLabel={badgeLabel} />
      <CompetencyActivity
        subject={subject} examId={examId} comp={comp}
        currentStd={currentStd}
        mode={mode}
        activityIndex={activityIndex + seed}
        onComplete={onComplete}
        continueLabel="Continue"
        badgeLabel={badgeLabel}
        embedded
      />
    </PhaseCard>
  );
}

const NUMBER_SET_OPTIONS = [
  { id: 'N', label: 'Natural (N)' },
  { id: 'Z', label: 'Integer (Z)' },
  { id: 'Q', label: 'Rational (Q)' },
  { id: 'I', label: 'Irrational (I)' },
];

const NUMBER_SET_PROMPTS = [
  { id: 'v1', value: '6', answer: 'N' },
  { id: 'v2', value: '-4', answer: 'Z' },
  { id: 'v3', value: '1.5', answer: 'Q' },
  { id: 'v4', value: '0.121212...', answer: 'Q' },
  { id: 'v5', value: 'π', answer: 'I' },
  { id: 'v6', value: '√2', answer: 'I' },
];

const PROPERTY_OPTIONS = [
  { id: 'commutative', label: 'Commutative' },
  { id: 'associative', label: 'Associative' },
  { id: 'distributive', label: 'Distributive' },
  { id: 'inverse', label: 'Inverse' },
];

const PROPERTY_PROMPTS = [
  { id: 'p1', text: 'a + b = b + a', answer: 'commutative' },
  { id: 'p2', text: '(a + b) + c = a + (b + c)', answer: 'associative' },
  { id: 'p3', text: 'a(b + c) = ab + ac', answer: 'distributive' },
  { id: 'p4', text: 'a + (−a) = 0', answer: 'inverse' },
];

function NumberSetsChallenge({ onContinue }) {
  const [setAnswers, setSetAnswers] = useState({});
  const [propertyAnswers, setPropertyAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const allSetAnswered = NUMBER_SET_PROMPTS.every((item) => !!setAnswers[item.id]);
  const allPropertyAnswered = PROPERTY_PROMPTS.every((item) => !!propertyAnswers[item.id]);
  const canSubmit = allSetAnswered && allPropertyAnswered;

  const setCorrect = NUMBER_SET_PROMPTS.filter((item) => setAnswers[item.id] === item.answer).length;
  const propertyCorrect = PROPERTY_PROMPTS.filter((item) => propertyAnswers[item.id] === item.answer).length;
  const total = NUMBER_SET_PROMPTS.length + PROPERTY_PROMPTS.length;
  const score = setCorrect + propertyCorrect;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ ...BODY, marginBottom: 10 }}>
        Place each value in the smallest set that fits (N, Z, Q, or I), then match each algebra statement to its property.
      </div>

      <div style={{ marginBottom: 14, padding: '12px 14px', border: `1px solid ${COLOR.border}`, borderRadius: 10, background: '#fff' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: COLOR.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Number sets
        </div>
        {NUMBER_SET_PROMPTS.map((item) => (
          <div key={item.id} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, color: COLOR.text, marginBottom: 6 }}>{item.value}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {NUMBER_SET_OPTIONS.map((opt) => {
                const selected = setAnswers[item.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setSetAnswers((prev) => ({ ...prev, [item.id]: opt.id }));
                    }}
                    style={selected ? { ...OPTION_BASE, ...OPTION_SELECTED } : OPTION_BASE}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 14, padding: '12px 14px', border: `1px solid ${COLOR.border}`, borderRadius: 10, background: '#fff' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: COLOR.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Properties
        </div>
        {PROPERTY_PROMPTS.map((item) => (
          <div key={item.id} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, color: COLOR.text, marginBottom: 6 }}>{item.text}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PROPERTY_OPTIONS.map((opt) => {
                const selected = propertyAnswers[item.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setPropertyAnswers((prev) => ({ ...prev, [item.id]: opt.id }));
                    }}
                    style={selected ? { ...OPTION_BASE, ...OPTION_SELECTED } : OPTION_BASE}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={!canSubmit}
          style={!canSubmit ? { ...BTN_PRIMARY, opacity: 0.55, cursor: 'not-allowed' } : BTN_PRIMARY}
        >
          Check answers
        </button>
      ) : (
        <>
          <div style={resultBanner(score === total)}>
            <div style={resultTitle}>{score === total ? 'Excellent!' : 'Nice effort'}</div>
            <div style={resultScore(score === total)}>{score}/{total} correct</div>
          </div>
          <button type="button" onClick={onContinue} style={BTN_PRIMARY}>Continue</button>
        </>
      )}
    </div>
  );
}

const REFLECTION_CHIPS = ['Procedures', 'Vocabulary', 'Word problems', 'Graphs', 'Proofs', 'Feels solid'];
const END_LOOP_CONFIDENCE_OPTIONS = [
  { v: 1, label: 'Not at all confident' },
  { v: 2, label: 'A little confident' },
  { v: 3, label: 'Somewhat confident' },
  { v: 4, label: 'Pretty confident' },
  { v: 5, label: 'Very confident' },
];
const LOOP_START_OPTIONS = [
  { id: 'diagnostic', label: 'Full loop (diagnostic start)', phase: 'diagnostic' },
  { id: 'video', label: 'Video micro-lesson', phase: 'video' },
  { id: 'lesson', label: 'Quick lesson', phase: 'micro-teach' },
  { id: 'interactive', label: 'Interactive activity', phase: 'activity-1' },
  { id: 'game', label: 'Game practice', phase: 'game' },
  { id: 'game-alt', label: 'Different game variation', phase: 'game2' },
  { id: 'quiz', label: 'Short quiz', phase: 'check-quiz' },
  { id: 'readiness', label: 'Readiness quiz', phase: 'readiness-quiz' },
  { id: 'mastery', label: 'Mastery quiz', phase: 'mastery-check' },
];

function MasteryScreen({
  conceptTitle, teks, grade, comp, examId, label, currentStd,
  sessionSummary,
  effortStats,
  diagnosticSessionPct,
  lastCheckpointPct,
  teachingMove,
  shareUrl,
  shareTitle,
  loopKeyForReflection,
  loopCompleteBanner,
  onFinalConfidenceCheckIn,
}) {
  const [reflChips, setReflChips] = useState([]);
  const [reflText, setReflText] = useState('');
  const [reflSaved, setReflSaved] = useState(false);
  const [reflError, setReflError] = useState('');
  const [shareHint, setShareHint] = useState('');
  const [endLoopConfidence, setEndLoopConfidence] = useState(null);
  const [chosenCompKey, setChosenCompKey] = useState('');
  const [chosenStartId, setChosenStartId] = useState('diagnostic');
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);
  useEffect(() => { fireConfetti({ intensity: 'high' }); }, []);

  const domains = getDomainsForExam(examId) || [];
  const currentIdx = domains.findIndex((d) => d.id === comp);
  const currentDomain = currentIdx >= 0 ? domains[currentIdx] : null;
  const stds = currentDomain?.standards || [];
  const stdIdx = stds.findIndex((s) => s.id === currentStd);
  const compName = (stdIdx >= 0 ? stds[stdIdx]?.name : null) || conceptTitle;

  let globalCompIdx = 0;
  for (let di = 0; di < Math.max(0, currentIdx); di++) globalCompIdx += (domains[di]?.standards?.length || 0);
  globalCompIdx += Math.max(0, stdIdx);
  const totalComps = domains.reduce((s, d) => s + (d.standards?.length || 0), 0);

  const nextStd = stdIdx >= 0 ? stds[stdIdx + 1] : undefined;
  const nextDomain = currentIdx >= 0 ? domains[currentIdx + 1] : undefined;
  const nextDomainFirstComp = nextDomain?.standards?.[0];

  const buildLoopUrl = (dom, stdId, startPhase) => {
    const g = grade || 'grade7-12';
    const eid = examId || 'math712';
    const domId = typeof dom === 'string' ? dom : dom?.id;
    return `/practice-loop?comp=${encodeURIComponent(domId)}&grade=${encodeURIComponent(g)}&examId=${encodeURIComponent(eid)}&label=${encodeURIComponent(dom?.name || domId)}${stdId ? `&currentStd=${encodeURIComponent(stdId)}` : ''}${startPhase ? `&phase=${encodeURIComponent(startPhase)}` : ''}`;
  };

  const competencyChoices = useMemo(() => {
    const out = [];
    domains.forEach((dom, di) => {
      const domLabel = `Domain ${ROMAN[di] || di + 1}: ${dom.name || dom.id}`;
      const standards = dom.standards || [];
      if (!standards.length) {
        out.push({
          key: `${dom.id}::`,
          domainId: dom.id,
          domainName: dom.name || dom.id,
          standardId: '',
          label: domLabel,
        });
        return;
      }
      standards.forEach((s) => {
        out.push({
          key: `${dom.id}::${s.id}`,
          domainId: dom.id,
          domainName: dom.name || dom.id,
          standardId: s.id,
          label: `${domLabel} · ${s.name || s.id}`,
        });
      });
    });
    return out;
  }, [domains]);

  useEffect(() => {
    if (!competencyChoices.length) return;
    const currentKey = `${currentDomain?.id || ''}::${currentStd || ''}`;
    const fallbackKey = competencyChoices[0]?.key || '';
    if (!chosenCompKey) {
      const preferred = competencyChoices.find((c) => c.key === currentKey)?.key || fallbackKey;
      setChosenCompKey(preferred);
      return;
    }
    if (!competencyChoices.some((c) => c.key === chosenCompKey)) {
      setChosenCompKey(fallbackKey);
    }
  }, [competencyChoices, currentDomain, currentStd, chosenCompKey]);

  const selectedCompChoice = useMemo(
    () => competencyChoices.find((c) => c.key === chosenCompKey) || null,
    [competencyChoices, chosenCompKey],
  );
  const selectedStart = useMemo(
    () => LOOP_START_OPTIONS.find((o) => o.id === chosenStartId) || LOOP_START_OPTIONS[0],
    [chosenStartId],
  );
  const customPracticeUrl = selectedCompChoice
    ? buildLoopUrl(
      { id: selectedCompChoice.domainId, name: selectedCompChoice.domainName },
      selectedCompChoice.standardId,
      selectedStart?.phase,
    )
    : null;

  const toggleReflChip = (c) => {
    setReflChips((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const saveReflectionLocal = () => {
    if (!loopKeyForReflection) return;
    const r = saveReflection(loopKeyForReflection, { chips: reflChips, text: reflText });
    if (!r.ok) {
      setReflError(
        r.code === 'QUOTA_EXCEEDED'
          ? 'Storage is full — free space on this device, then retry saving your reflection.'
          : 'Could not save your reflection. Retry in a moment.',
      );
      return;
    }
    setReflError('');
    setReflSaved(true);
  };

  const endLoopConfidenceLabel = END_LOOP_CONFIDENCE_OPTIONS.find((o) => o.v === endLoopConfidence)?.label || '';

  const handleShare = async () => {
    const body = `${shareTitle || compName}\n${shareUrl || window.location.href}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle || 'QuantegyAI', text: body, url: shareUrl || window.location.href });
        if (mountedRef.current) setShareHint('Shared!');
        setTimeout(() => { if (mountedRef.current) setShareHint(''); }, 3000);
        return;
      } catch {
        /* fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(body);
      if (mountedRef.current) setShareHint('Copied to clipboard — paste to a friend or study chat.');
      setTimeout(() => { if (mountedRef.current) setShareHint(''); }, 5000);
    } catch {
      if (mountedRef.current) setShareHint('Copy blocked — select and copy the link manually.');
    }
  };

  return (
    <PhaseCard>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        {loopCompleteBanner && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, background: COLOR.successBg, border: `1px solid ${COLOR.successBorder}`, fontSize: 14, fontWeight: 700, color: COLOR.successText, textAlign: 'left' }}>
            You finished the full adaptive loop for this competency — that effort counts even beyond the score.
          </div>
        )}
        {sessionSummary && (
          <div style={{ textAlign: 'left', marginBottom: 20, padding: '14px 16px', borderRadius: 12, background: '#f8fafc', border: `1px solid ${COLOR.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: COLOR.textMuted, marginBottom: 8 }}>Session recap</div>
            {diagnosticSessionPct != null && lastCheckpointPct != null && (
              <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.text, fontWeight: 600 }}>
                Progress signal: diagnostic {Math.round(diagnosticSessionPct * 100)}% → last checkpoint {Math.round(lastCheckpointPct * 100)}% correct
              </p>
            )}
            {effortStats && (
              <p style={{ margin: '0 0 8px', fontSize: 12, color: COLOR.textSecondary }}>
                Effort this run: ~{effortStats.tilesCompleted} tiles completed · {effortStats.quizCheckpoints} quiz checkpoints · your work is saved on this device
              </p>
            )}
            {sessionSummary.overallPct != null && (
              <p style={{ margin: '0 0 6px', fontSize: 14, color: COLOR.text, fontWeight: 600 }}>
                Overall on loop quizzes: {sessionSummary.overallPct}% correct ({sessionSummary.totalCorrect}/{sessionSummary.totalAnswered} items)
              </p>
            )}
            <p style={{ margin: '0 0 6px', fontSize: 13, color: COLOR.textSecondary }}>
              Checkpoints completed: {sessionSummary.quizCount}
            </p>
            {(sessionSummary.flaggedCount > 0 || sessionSummary.weakTracked > 0) && (
              <p style={{ margin: '0 0 6px', fontSize: 12, color: COLOR.textMuted }}>
                Review queue: {sessionSummary.flaggedCount} flagged
                {sessionSummary.weakTracked > 0 ? ` · ${sessionSummary.weakTracked} weak items tracked for spaced review` : ''}
              </p>
            )}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${COLOR.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: COLOR.blue, marginBottom: 4 }}>Next focus</div>
              <p style={{ margin: 0, fontSize: 14, color: COLOR.text, lineHeight: 1.5 }}>{sessionSummary.nextFocus}</p>
            </div>
            {(sessionSummary.needsWorkTopics?.length > 0 || sessionSummary.needsWorkCheckpoints?.length > 0) && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${COLOR.borderLight}` }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#b45309', marginBottom: 4 }}>Needs more work</div>
                {sessionSummary.needsWorkTopics?.length > 0 && (
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: COLOR.textSecondary }}>
                    Topics: {sessionSummary.needsWorkTopics.join(' · ')}
                  </p>
                )}
                {sessionSummary.needsWorkCheckpoints?.length > 0 && (
                  <p style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary }}>
                    Checkpoints: {sessionSummary.needsWorkCheckpoints.join(' · ')}
                  </p>
                )}
              </div>
            )}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${COLOR.borderLight}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: COLOR.textMuted, marginBottom: 4 }}>How to read the progress bar</div>
              <p style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.5 }}>
                Each block is one tile in the loop. Green is strong (75%+), amber means partial understanding (45-74%), red means revisit soon (&lt;45%), and blue marks the current tile. Faded blocks are upcoming steps.
              </p>
            </div>
          </div>
        )}
        <div style={{ textAlign: 'left', marginBottom: 20, padding: '14px 16px', borderRadius: 12, background: '#eef2ff', border: `1px solid ${COLOR.blue}33` }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: COLOR.blue, marginBottom: 8 }}>Final check-in</div>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.5 }}>
            You finished this learning loop. How confident do you feel about this competency now?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
            {END_LOOP_CONFIDENCE_OPTIONS.map(({ v, label }) => (
              <button
                key={`end-loop-confidence-${v}`}
                type="button"
                onClick={() => {
                  setEndLoopConfidence(v);
                  if (onFinalConfidenceCheckIn) onFinalConfidenceCheckIn(v);
                }}
                style={{
                  ...BTN_PRIMARY,
                  minHeight: 40,
                  background: endLoopConfidence === v ? COLOR.blue : '#fff',
                  color: endLoopConfidence === v ? '#fff' : COLOR.text,
                  border: `1px solid ${endLoopConfidence === v ? COLOR.blue : COLOR.border}`,
                  boxShadow: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {endLoopConfidence != null && (
            <p style={{ margin: '10px 0 0', fontSize: 12, color: '#1e3a8a', fontWeight: 600 }}>
              Saved for this session: {endLoopConfidenceLabel}
            </p>
          )}
        </div>
        {teachingMove && (
          <div style={{ textAlign: 'left', marginBottom: 20, padding: '14px 16px', borderRadius: 12, background: '#fefce8', border: `1px solid #fde047`, fontSize: 13, color: '#713f12', lineHeight: 1.55 }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a16207', marginBottom: 6 }}>Bring it to the classroom</div>
            {teachingMove}
          </div>
        )}
        <div style={{ marginBottom: 20, padding: '14px 16px', borderRadius: 12, background: COLOR.card, border: `1px solid ${COLOR.border}`, textAlign: 'left' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: COLOR.textMuted, marginBottom: 8 }}>Share & study partner</div>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.5 }}>
            Share this competency link so a colleague or cohort can run the same path and compare notes.
          </p>
          <button type="button" onClick={handleShare} style={{ ...BTN_PRIMARY, width: '100%', marginBottom: 8 }}>
            Share or copy link
          </button>
          {shareHint && <p style={{ margin: 0, fontSize: 12, color: COLOR.green, fontWeight: 600 }}>{shareHint}</p>}
        </div>
        {loopKeyForReflection && (
          <div style={{ marginBottom: 20, padding: '14px 16px', borderRadius: 12, background: '#f8fafc', border: `1px solid ${COLOR.border}`, textAlign: 'left' }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: COLOR.blue, marginBottom: 8 }}>3-second reflection (optional)</div>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: COLOR.textSecondary }}>What still feels fuzzy? Tap any, add a note, save — private on this device.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {REFLECTION_CHIPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleReflChip(c)}
                  disabled={reflSaved}
                  aria-pressed={reflChips.includes(c)}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '6px 10px',
                    borderRadius: 999,
                    border: `1px solid ${reflChips.includes(c) ? COLOR.blue : COLOR.border}`,
                    background: reflChips.includes(c) ? '#dbeafe' : '#fff',
                    color: COLOR.text,
                    cursor: reflSaved ? 'default' : 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <textarea
              value={reflText}
              onChange={(e) => setReflText(e.target.value)}
              disabled={reflSaved}
              placeholder="One sentence optional…"
              rows={2}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${COLOR.border}`, fontSize: 13, marginBottom: 10, fontFamily: 'inherit', resize: 'vertical' }}
            />
            {reflError && (
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#b91c1c', fontWeight: 600 }}>{reflError}</p>
            )}
            {!reflSaved ? (
              <button type="button" onClick={saveReflectionLocal} style={{ ...BTN_PRIMARY, fontSize: 13 }}>Save reflection</button>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: COLOR.green, fontWeight: 600 }}>Saved — you can close this screen anytime.</p>
            )}
          </div>
        )}
        <div style={{ marginBottom: 20, padding: '14px 16px', borderRadius: 12, background: '#eff6ff', border: `1px solid ${COLOR.blue}33`, textAlign: 'left' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: COLOR.blue, marginBottom: 8 }}>Practice your way</div>
          <p style={{ margin: '0 0 10px', fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.5 }}>
            Choose the competency you want to practice next, then choose how you want to start (video, lesson, game, quiz, or mastery quiz).
          </p>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: COLOR.textMuted }}>Competency</label>
          <select
            value={chosenCompKey}
            onChange={(e) => setChosenCompKey(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLOR.border}`, fontSize: 13, fontFamily: 'inherit' }}
          >
            {competencyChoices.map((choice) => (
              <option key={choice.key} value={choice.key}>{choice.label}</option>
            ))}
          </select>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: COLOR.textMuted }}>Start with</label>
          <select
            value={chosenStartId}
            onChange={(e) => setChosenStartId(e.target.value)}
            style={{ width: '100%', marginBottom: 12, padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLOR.border}`, fontSize: 13, fontFamily: 'inherit' }}
          >
            {LOOP_START_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
          {customPracticeUrl && (
            <Link to={customPracticeUrl} style={{ ...BTN_GAME_LINK, marginBottom: 0 }}>
              Start selected practice →
            </Link>
          )}
        </div>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: COLOR.successText }}>
          Competency complete!
        </h2>
        <p style={{ margin: '0 0 6px', fontSize: 16, color: COLOR.green, fontWeight: 600 }}>{compName}</p>
        {currentDomain && (
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#15803d' }}>
            Domain {ROMAN[currentIdx] || currentIdx + 1}: {currentDomain.name}
            {stds.length > 1 && stdIdx >= 0 && ` · ${stdIdx + 1} of ${stds.length} competencies in this domain`}
          </p>
        )}
        <p style={{ margin: '0 0 20px', fontSize: 13, color: COLOR.textSecondary }}>
          {globalCompIdx + 1} of {totalComps} competencies completed
        </p>
        {nextStd && (
          <Link to={buildLoopUrl(currentDomain, nextStd.id, 'diagnostic')} style={{ ...BTN_GAME_LINK, marginBottom: 10 }}>
            Next: {nextStd.name} →
          </Link>
        )}
        {!nextStd && nextDomain && nextDomainFirstComp && (
          <Link to={buildLoopUrl(nextDomain, nextDomainFirstComp.id, 'diagnostic')} style={{ ...BTN_GAME_LINK, marginBottom: 10 }}>
            Next Domain: {ROMAN[currentIdx + 1] || currentIdx + 2} — {nextDomain.name} →
          </Link>
        )}
        <Link to="/texes-prep" style={{ display: 'block', textAlign: 'center', fontSize: 14, color: COLOR.blue, textDecoration: 'none', marginTop: 10 }}>
          ← Back to Test Prep
        </Link>
      </div>
    </PhaseCard>
  );
}

function CompetencyRoadmap({ domains, currentComp, currentStd, examId, grade, label, expanded, onToggle }) {
  if (!domains || domains.length === 0) return null;
  const currentIdx = domains.findIndex((d) => d.id === currentComp);
  const currentDomain = currentIdx >= 0 ? domains[currentIdx] : null;
  const stds = currentDomain?.standards || [];
  const stdIdx = stds.findIndex((s) => s.id === currentStd);

  let globalCompIdx = 0;
  for (let di = 0; di < Math.max(0, currentIdx); di++) globalCompIdx += (domains[di]?.standards?.length || 0);
  globalCompIdx += Math.max(0, stdIdx);
  const totalComps = domains.reduce((s, d) => s + (d.standards?.length || 0), 0);

  const buildLoopUrl = (dom, stdId) => {
    const g = grade || 'grade7-12';
    const eid = examId || 'math712';
    const domId = typeof dom === 'string' ? dom : dom?.id;
    return `/practice-loop?comp=${encodeURIComponent(domId)}&grade=${encodeURIComponent(g)}&examId=${encodeURIComponent(eid)}&label=${encodeURIComponent(dom?.name || domId)}${stdId ? `&currentStd=${encodeURIComponent(stdId)}` : ''}`;
  };

  return (
    <div style={{ marginBottom: 16, borderRadius: 12, background: COLOR.card, border: `1px solid ${COLOR.border}`, overflow: 'hidden' }}>
      <button type="button" onClick={onToggle} aria-expanded={expanded} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLOR.textMuted, marginBottom: 2 }}>
            {currentDomain
              ? `Domain ${ROMAN[currentIdx] || currentIdx + 1}: ${currentDomain.name} · Competency ${globalCompIdx + 1} of ${totalComps}`
              : `${totalComps} competencies`}
          </div>
        </div>
        <span style={{ fontSize: 12, color: COLOR.textMuted }}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${COLOR.borderLight}` }}>
          {domains.map((dom, i) => {
            const domStds = dom.standards || [];
            return (
              <div key={dom.id} style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ minWidth: 22, height: 18, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, background: i === currentIdx ? '#7c3aed' : '#e2e8f0', color: i === currentIdx ? '#fff' : '#64748b', padding: '0 4px' }}>
                    {ROMAN[i] || i + 1}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: i === currentIdx ? '#334155' : '#94a3b8' }}>{dom.name}</div>
                </div>
                {domStds.map((s) => {
                  const isCurrentStd = dom.id === currentComp && s.id === currentStd;
                  const compNum = s.name?.match(/Competency\s+(\d+)/)?.[1] || '';
                  return (
                    <Link key={s.id} to={buildLoopUrl(dom, s.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0 4px 28px', textDecoration: 'none' }}>
                      <div style={{ minWidth: 28, height: 20, borderRadius: 4, flexShrink: 0, padding: '0 4px', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCurrentStd ? '#2563eb' : '#e2e8f0', color: isCurrentStd ? '#fff' : '#64748b' }}>
                        {compNum || s.id.replace('c0', '').replace('c', '')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: isCurrentStd ? 700 : 500, color: isCurrentStd ? '#1e40af' : '#475569' }}>
                          {s.name?.replace(/^Competency\s+\d+\s*[—–-]\s*/, '') || s.name}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */

export default function PracticeLoop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = searchParams;
  const isAdaptiveDebug = !!import.meta.env.DEV && params.get('debugAdaptive') === '1';
  const teks = params.get('teks') || '';
  const label = params.get('label') || teks || 'Practice';
  const grade = params.get('grade') || 'grade7-12';
  const comp = params.get('comp') || '';
  const currentStd = params.get('currentStd') || params.get('std') || '';
  const singleTeks = teks.split(',')[0] || '';
  const sid = params.get('sid') || '';
  const cid = params.get('cid') || '';
  const examId = params.get('examId') || gradeToExamId(grade) || 'math712';
  const requestedPhase = params.get('phase');
  const sessionPhaseKey = `practice-loop-phase:${examId}:${comp}:${currentStd || ''}:${teks}`;
  const sessionQuizKey = `practice-loop-quiz:${comp}:${teks}:${currentStd || ''}`;
  const savePromptSessionKey = `practice-loop-save-prompted:${grade}:${comp}:${currentStd || ''}`;
  const savedPhase = typeof window !== 'undefined' ? window.sessionStorage.getItem(sessionPhaseKey) : null;
  const initialPhase = requestedPhase && PHASES.includes(requestedPhase)
    ? requestedPhase
    : savedPhase && PHASES.includes(savedPhase)
      ? savedPhase
      : (PHASES[0] || 'diagnostic');
  const subject = params.get('subject') || 'math';

  const [phase, setPhase] = useState(initialPhase);
  const [roadmapExpanded, setRoadmapExpanded] = useState(false);
  const [studyNavOpen, setStudyNavOpen] = useState(false);
  const [practiceSwitchOpen, setPracticeSwitchOpen] = useState(false);
  const [practiceCompKey, setPracticeCompKey] = useState('');
  const [practiceStartId, setPracticeStartId] = useState('diagnostic');
  const [loopSessionSeed] = useState(() => {
    if (typeof window === 'undefined') return 'ssr';
    const key = 'practice-loop-session-seed';
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const fresh = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(key, fresh);
    return fresh;
  });

  const domains = useMemo(() => getDomainsForExam(examId) || [], [examId]);
  const validExam = domains.length > 0;

  const compDomain = useMemo(() => {
    const doms = getDomainsForExam(examId) || [];
    return doms.find((d) => d.id === comp) || null;
  }, [comp, examId]);

  const compIdx = useMemo(() => {
    const doms = getDomainsForExam(examId) || [];
    return doms.findIndex((d) => d.id === comp);
  }, [examId, comp]);

  const resolvedStdId = useMemo(() => {
    if (currentStd) return currentStd;
    if (!compDomain || !singleTeks) return '';
    const fallback = (compDomain.standards || []).find((s) => s.id === singleTeks);
    return fallback?.id || '';
  }, [currentStd, compDomain, singleTeks]);

  const currentStdObj = useMemo(() => {
    if (!resolvedStdId || !compDomain) return null;
    return (compDomain.standards || []).find((s) => s.id === resolvedStdId) || null;
  }, [resolvedStdId, compDomain]);


  const compDisplay = comp ? (compDomain ? `Domain ${ROMAN[compIdx] || compIdx + 1}: ${compDomain.name}` : getCompName(comp)) : null;
  const compShort = compDomain?.name || getCompName(comp) || null;
  const gameScopeBadge = currentStdObj ? currentStdObj.name : compShort;
  const conceptId = getConceptId(singleTeks) || comp;
  /** Bumps after localStorage heal (retry) so mastery/progress re-read from disk */
  const [storageHealTick, setStorageHealTick] = useState(0);
  const masteryScore = useMemo(
    () => getMasteryScore(examId, comp, singleTeks, currentStd),
    [examId, comp, singleTeks, currentStd, storageHealTick],
  );
  const masteryStatus = useMemo(
    () => getMasteryStatus(examId, comp, singleTeks, currentStd),
    [examId, comp, singleTeks, currentStd, storageHealTick],
  );
  const examProgress = useMemo(() => {
    const hasStandards = (domains || []).some((d) => (d.standards || []).length > 0);
    if (examId === 'math712' && hasStandards) {
      return getStandardPathProgress(examId, domains);
    }
    return getExamProgress(examId, domains.map((d) => d.id));
  }, [examId, domains, storageHealTick]);

  const [tilesCompleted, setTilesCompleted] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [checkQuizFailStreak, setCheckQuizFailStreak] = useState(0);
  const [videoReplayCount, setVideoReplayCount] = useState(0);
  const MAX_VIDEO_REPLAYS = 0;
  const [showEarlyMasteryOffer, setShowEarlyMasteryOffer] = useState(false);
  const [readinessRetries, setReadinessRetries] = useState(0);
  const [conceptRefreshReturnPhase, setConceptRefreshReturnPhase] = useState(null);
  const [adaptiveDebugMessage, setAdaptiveDebugMessage] = useState('init');
  const [xpPoints, setXpPoints] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizPhaseScores, setQuizPhaseScores] = useState({});
  /** Bumps when navigating tiles so quiz pools re-read weak/flagged data for spaced review */
  const [reviewPoolEpoch, setReviewPoolEpoch] = useState(0);
  const [revisitSeed, setRevisitSeed] = useState(0);
  const microConcept = useMemo(
    () => getMicroConcept(examId, comp, singleTeks, currentStd, tilesCompleted + revisitSeed),
    [examId, comp, singleTeks, currentStd, tilesCompleted, revisitSeed],
  );
  /** Re-render flag buttons after toggling localStorage */
  const [flaggedVersion, setFlaggedVersion] = useState(0);
  /** 1–5 self-reported confidence; most recent last */
  const [confidenceRatings, setConfidenceRatings] = useState([]);
  const [lastCheckInMilestone, setLastCheckInMilestone] = useState(0);
  const [showConfidenceCheckIn, setShowConfidenceCheckIn] = useState(false);
  const [pendingConfidenceCheckIn, setPendingConfidenceCheckIn] = useState(false);
  const [coachAdaptiveNote, setCoachAdaptiveNote] = useState('');
  const [celebrationToast, setCelebrationToast] = useState(null);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const quizStartTimeRef = useRef(Date.now());
  const skipNextQuizTimerResetRef = useRef(false);
  const [lastQuizAvgMs, setLastQuizAvgMs] = useState(null);
  const prevQuizAvgRef = useRef(null);
  const [calcOpen, setCalcOpen] = useState(false);
  const [padOpen, setPadOpen] = useState(false);
  const calcType = CALC_TYPE_BY_EXAM[examId] || null;
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [localSaveWarning, setLocalSaveWarning] = useState(false);
  /** Last browser storage failure with optional payload for Retry */
  const [storageIssue, setStorageIssue] = useState(null);
  const [diagnosticSessionPct, setDiagnosticSessionPct] = useState(null);
  const [learningGoals, setLearningGoals] = useState(() => (typeof window !== 'undefined' ? getLearningGoals() : { examDate: '', focusCompId: '' }));
  const [pacingPref, setPacingPref] = useState(() => (typeof window !== 'undefined' ? getPacingPreference() : 'balanced'));
  const [goalsPanelOpen, setGoalsPanelOpen] = useState(false);
  const [coachExpanded, setCoachExpanded] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showFocusTools, setShowFocusTools] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  const [viewportHeight, setViewportHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 900));
  const [isCompactDock, setIsCompactDock] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 700 : false));
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const dockAutoCollapsedRef = useRef(false);
  const [showSecondaryPanels, setShowSecondaryPanels] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= MOBILE_BP : true));
  const secondaryPanelsPrimedRef = useRef(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [showSaveProgressModal, setShowSaveProgressModal] = useState(false);
  const saveProgressPromptedRef = useRef(
    typeof window !== 'undefined' && window.sessionStorage.getItem(savePromptSessionKey) === '1',
  );
  const streakMilestoneRef = useRef(false);
  const breakModalRef = useRef(null);
  const confidenceModalRef = useRef(null);

  const CONFIDENCE_CHECKIN_TILES = [4, 8, 12, 16, 20];
  const isMobile = viewportWidth < MOBILE_BP;
  const isSmallPhone = viewportWidth < SMALL_PHONE_BP;
  const isLandscapeTight = isMobile && viewportWidth > viewportHeight && viewportHeight <= TIGHT_LANDSCAPE_HEIGHT_BP;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let raf = null;
    const onResize = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        setViewportWidth(window.innerWidth);
        setViewportHeight(window.innerHeight);
        setIsCompactDock(window.innerWidth < 700);
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      if (raf != null) window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isMobile) {
      setKeyboardOpen(false);
      return undefined;
    }
    let raf = null;
    const vv = window.visualViewport;
    const isTextEntry = (el) => {
      if (!el || typeof el !== 'object') return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable === true;
    };
    const computeKeyboardState = () => {
      const baseHeight = window.innerHeight || 0;
      const vvHeight = vv?.height ?? baseHeight;
      const vvOffsetTop = vv?.offsetTop ?? 0;
      const insetLoss = baseHeight - vvHeight - vvOffsetTop;
      const activeIsTextEntry = isTextEntry(document.activeElement);
      setKeyboardOpen(insetLoss > 120 || (activeIsTextEntry && insetLoss > 40));
    };
    const onViewportChange = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        computeKeyboardState();
      });
    };
    const onFocusIn = () => onViewportChange();
    const onFocusOut = () => window.setTimeout(computeKeyboardState, 120);

    computeKeyboardState();
    vv?.addEventListener('resize', onViewportChange);
    vv?.addEventListener('scroll', onViewportChange);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      if (raf != null) window.cancelAnimationFrame(raf);
      vv?.removeEventListener('resize', onViewportChange);
      vv?.removeEventListener('scroll', onViewportChange);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      setShowSecondaryPanels(true);
      secondaryPanelsPrimedRef.current = false;
      return undefined;
    }
    if (isLandscapeTight) {
      setShowSecondaryPanels(false);
      return undefined;
    }
    if (secondaryPanelsPrimedRef.current) {
      setShowSecondaryPanels(true);
      return undefined;
    }
    setShowSecondaryPanels(false);
    const t = setTimeout(() => {
      secondaryPanelsPrimedRef.current = true;
      setShowSecondaryPanels(true);
    }, 280);
    return () => clearTimeout(t);
  }, [isMobile, isLandscapeTight]);

  useEffect(() => {
    if (isLandscapeTight) setDockCollapsed(true);
  }, [isLandscapeTight]);

  const adaptiveScope = learningLoopConfig.adaptiveScope || {};
  const adaptiveExamIds = Array.isArray(adaptiveScope.examIds) && adaptiveScope.examIds.length > 0
    ? adaptiveScope.examIds
    : ['math712'];
  const requireCompetency = adaptiveScope.requireCompetency !== false;
  const requireStandard = adaptiveScope.requireStandard !== false;
  const adaptiveEnabledForContext = adaptiveExamIds.includes(examId)
    && (!requireCompetency || !!comp)
    && (!requireStandard || !!currentStd);
  const ADAPTIVE = adaptiveEnabledForContext ? (learningLoopConfig.adaptiveRules || {}) : {};

  const loopReviewKey = useMemo(() => {
    const eid = gradeToExamId(grade) || examId;
    const c = comp || (singleTeks && eid && getCompForTeks(singleTeks, eid)) || '';
    if (!eid || !c) return '';
    return buildLoopReviewKey(eid, c, currentStd);
  }, [grade, examId, comp, currentStd, singleTeks]);

  const loopMilestoneKey = useMemo(() => {
    const eid = gradeToExamId(grade) || examId;
    const c = comp || (singleTeks && eid && getCompForTeks(singleTeks, eid)) || '';
    return milestoneStorageKey(eid, c, currentStd);
  }, [examId, comp, currentStd, singleTeks, grade]);

  const shareUrlForPartner = useMemo(() => {
    const eid = examId || 'math712';
    const g = grade || 'grade7-12';
    const p = new URLSearchParams();
    if (comp) p.set('comp', comp);
    p.set('examId', eid);
    p.set('grade', g);
    if (label) p.set('label', label);
    if (currentStd) p.set('currentStd', currentStd);
    if (typeof window !== 'undefined') return `${window.location.origin}/practice-loop?${p.toString()}`;
    return `/practice-loop?${p.toString()}`;
  }, [comp, currentStd, examId, grade, label]);

  const practiceCompChoices = useMemo(() => {
    const out = [];
    domains.forEach((dom, di) => {
      const standards = dom.standards || [];
      if (!standards.length) {
        out.push({
          key: `${dom.id}::`,
          domainId: dom.id,
          domainName: dom.name || dom.id,
          standardId: '',
          label: `Domain ${ROMAN[di] || di + 1}: ${dom.name || dom.id}`,
        });
        return;
      }
      standards.forEach((s) => {
        out.push({
          key: `${dom.id}::${s.id}`,
          domainId: dom.id,
          domainName: dom.name || dom.id,
          standardId: s.id,
          label: `Domain ${ROMAN[di] || di + 1}: ${dom.name || dom.id} · ${s.name || s.id}`,
        });
      });
    });
    return out;
  }, [domains]);

  useEffect(() => {
    if (!practiceCompChoices.length) return;
    const currentKey = `${comp || ''}::${currentStd || ''}`;
    const fallback = practiceCompChoices[0]?.key || '';
    if (!practiceCompKey) {
      const preferred = practiceCompChoices.find((c) => c.key === currentKey)?.key || fallback;
      setPracticeCompKey(preferred);
      return;
    }
    if (!practiceCompChoices.some((c) => c.key === practiceCompKey)) {
      setPracticeCompKey(fallback);
    }
  }, [practiceCompChoices, practiceCompKey, comp, currentStd]);

  const selectedPracticeComp = useMemo(
    () => practiceCompChoices.find((c) => c.key === practiceCompKey) || null,
    [practiceCompChoices, practiceCompKey],
  );
  const selectedPracticeStart = useMemo(
    () => LOOP_START_OPTIONS.find((o) => o.id === practiceStartId) || LOOP_START_OPTIONS[0],
    [practiceStartId],
  );
  const practiceSwitchUrl = useMemo(() => {
    if (!selectedPracticeComp) return null;
    const p = new URLSearchParams();
    p.set('comp', selectedPracticeComp.domainId);
    p.set('examId', examId || 'math712');
    p.set('grade', grade || 'grade7-12');
    p.set('label', selectedPracticeComp.domainName || selectedPracticeComp.domainId);
    if (selectedPracticeComp.standardId) p.set('currentStd', selectedPracticeComp.standardId);
    if (selectedPracticeStart?.phase) p.set('phase', selectedPracticeStart.phase);
    return `/practice-loop?${p.toString()}`;
  }, [selectedPracticeComp, selectedPracticeStart, examId, grade]);

  const diagnosticPctForRecap = diagnosticSessionPct != null
    ? diagnosticSessionPct
    : (loopMilestoneKey ? getSessionDiagnosticPct(loopMilestoneKey) : null);

  useEffect(() => {
    let cancelled = false;
    if (params.get('paid') === '1' || isStudentLoggedIn()) {
      hasExamAccess(examId)
        .then((ok) => { if (!cancelled && ok) setIsPaid(true); })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, [examId]);

  const lastCheckpointBeforeMastery = useMemo(() => {
    const rev = [...quizHistory].reverse();
    const found = rev.find((e) => e.phase !== 'mastery');
    return found?.accuracy ?? null;
  }, [quizHistory]);

  const flaggedIdList = useMemo(
    () => (loopReviewKey ? loadLoopReview(loopReviewKey).flagged : []),
    [loopReviewKey, flaggedVersion],
  );
  const flaggedIdSet = useMemo(() => new Set(flaggedIdList), [flaggedIdList]);

  const handleToggleLoopFlag = useCallback((questionId) => {
    if (!loopReviewKey) return;
    const res = toggleFlaggedQuestion(loopReviewKey, questionId);
    if (!res.persist.ok) {
      setStorageIssue({
        kind: 'flag',
        code: res.persist.code,
        message: res.persist.message,
        recovery: res.recovery,
      });
    }
    setFlaggedVersion((v) => v + 1);
  }, [loopReviewKey]);

  const handleStorageRetry = useCallback(() => {
    setStorageIssue((issue) => {
      if (!issue) return null;
      let r = { ok: false };
      try {
        if (issue.kind === 'mastery' && issue.recovery) {
          r = retryMasteryPersist(issue.recovery.examId, issue.recovery.key, issue.recovery.entry);
        } else if ((issue.kind === 'review' || issue.kind === 'flag') && issue.recovery) {
          r = persistLoopReviewSnapshot(issue.recovery.key, issue.recovery.snapshot);
        } else if (issue.kind === 'milestone' && issue.recovery) {
          r = trySetMilestone(issue.recovery.loopKey, issue.recovery.name).persist;
        } else if (issue.kind === 'diagnostic' && issue.recovery) {
          r = saveSessionDiagnosticPct(issue.recovery.loopKey, issue.recovery.pct);
        } else if (issue.kind === 'goals' && issue.recovery) {
          r = saveLearningGoals(issue.recovery.goals);
        } else if (issue.kind === 'pacing' && issue.recovery?.pacing != null) {
          r = savePacingPreference(issue.recovery.pacing);
        } else if (issue.kind === 'session_meta' && issue.recovery?.seed) {
          r = touchLoopSessionStart(issue.recovery.seed);
        }
      } catch (e) {
        r = { ok: false, code: 'UNKNOWN', message: (e && e.message) || String(e) };
      }
      if (r.ok) {
        queueMicrotask(() => {
          setStorageHealTick((n) => n + 1);
          if (issue.kind === 'review' || issue.kind === 'flag') setReviewPoolEpoch((n) => n + 1);
          if (issue.kind === 'flag') setFlaggedVersion((v) => v + 1);
          if (issue.kind === 'pacing' && issue.recovery?.pacing != null) setPacingPref(issue.recovery.pacing);
        });
        return null;
      }
      return { ...issue, code: r.code, message: r.message || issue.message };
    });
  }, []);

  const sessionSummary = useMemo(() => {
    const review = loopReviewKey ? loadLoopReview(loopReviewKey) : { flagged: [], weak: {} };
    const flaggedCount = (review.flagged || []).length;
    const weakTracked = Object.keys(review.weak || {}).length;
    let totalAnswered = 0;
    let totalCorrect = 0;
    quizHistory.forEach((e) => {
      const t = e.total ?? 0;
      totalAnswered += t;
      totalCorrect += Math.round((e.accuracy || 0) * t);
    });
    const overallPct = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : null;
    let worst = null;
    quizHistory.forEach((e) => {
      const t = e.total ?? 0;
      if (t === 0) return;
      if (!worst || e.accuracy < worst.accuracy) worst = e;
    });
    const focusCounts = new Map();
    quizHistory.forEach((e) => {
      const focus = String(e.topMissFocus || '').trim();
      if (!focus || (e.wrongCount ?? 0) <= 0) return;
      focusCounts.set(focus, (focusCounts.get(focus) || 0) + 1);
    });
    const needsWorkTopics = [...focusCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([focus, count]) => (count > 1 ? `${focus} (${count} checkpoints)` : focus));
    const needsWorkCheckpoints = quizHistory
      .filter((e) => (e.total ?? 0) > 0 && (e.accuracy ?? 1) < 0.75)
      .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))
      .slice(0, 3)
      .map((e) => `${e.label || e.phase} (${Math.round((e.accuracy || 0) * 100)}%)`);
    const parts = [];
    if (flaggedCount > 0) {
      parts.push(`Revisit the ${flaggedCount} question${flaggedCount === 1 ? '' : 's'} you flagged—they can appear again in mid-loop and readiness quizzes.`);
    }
    if (worst && worst.accuracy < 0.85) {
      parts.push(`Sharpen ${worst.label || worst.phase} (you scored ${Math.round(worst.accuracy * 100)}% there this session).`);
    }
    if (needsWorkTopics.length > 0) {
      parts.push(`Topic pattern to revisit: ${needsWorkTopics[0]}.`);
    }
    if (weakTracked > 0 && !parts.length) {
      parts.push(`You have ${weakTracked} item${weakTracked === 1 ? '' : 's'} saved for spaced review on your next loop run.`);
    }
    if (!parts.length) {
      parts.push('Solid work—move to the next competency when you’re ready, or run this loop again for more reps.');
    }
    return {
      overallPct,
      totalCorrect,
      totalAnswered,
      quizCount: quizHistory.length,
      flaggedCount,
      weakTracked,
      needsWorkTopics,
      needsWorkCheckpoints,
      nextFocus: parts.join(' '),
    };
  }, [quizHistory, loopReviewKey]);

  const [highWatermark, setHighWatermark] = useState(() => {
    try {
      const stored = window.sessionStorage.getItem(`practice-loop-watermark:${comp}:${teks}:${currentStd || ''}`);
      return stored != null ? Math.max(-1, Number(stored)) : -1;
    } catch { return -1; }
  });
  const highWatermarkKeyRef = useRef(`practice-loop-watermark:${comp}:${teks}:${currentStd || ''}`);
  useEffect(() => {
    try { window.sessionStorage.setItem(highWatermarkKeyRef.current, String(highWatermark)); } catch {}
  }, [highWatermark]);
  useEffect(() => {
    const idx = PHASES.indexOf(phase);
    if (idx > highWatermark) setHighWatermark(idx);
  }, [phase, highWatermark]);
  const pendingPaywallPhaseRef = React.useRef(null);
  const [detourFromStep, setDetourFromStep] = useState(null);
  const [revisitReturnPhase, setRevisitReturnPhase] = useState(null);
  const revisitReturnRef = React.useRef(null);

  const goToPhase = useCallback((p, options = {}) => {
    setReviewPoolEpoch((n) => n + 1);
    const { skipProgress = false } = options;
    const normalizedPhase = PHASES.includes(p) ? p : (TILE_ID_TO_PHASE[p] || 'diagnostic');

    if (revisitReturnRef.current && !options._fromRevisitReturn) {
      const returnTo = revisitReturnRef.current;
      // If revisit state points to the current tile (stale), clear it and continue.
      if (returnTo === phase || returnTo === normalizedPhase) {
        revisitReturnRef.current = null;
        setRevisitReturnPhase(null);
        setDetourFromStep(null);
        showAppToast('Continuing to next tile...');
      } else {
        revisitReturnRef.current = null;
        setRevisitReturnPhase(null);
        setDetourFromStep(null);
        setPhase(returnTo);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (revisitReturnRef.current && !options._fromRevisitReturn) {
      // Safety fallback: if anything re-set the ref synchronously, clear and continue.
      revisitReturnRef.current = null;
      setRevisitReturnPhase(null);
      setDetourFromStep(null);
    }
    const targetIdx = PHASES.indexOf(normalizedPhase);
    const willAdvance = !skipProgress && targetIdx > highWatermark;
    const projectedTilesCompleted = willAdvance ? tilesCompleted + 1 : tilesCompleted;
    if (willAdvance) {
      setHighWatermark(targetIdx);
      setTilesCompleted((n) => n + 1);
    }
    if (!isPaid && normalizedPhase !== 'paywall' && normalizedPhase !== 'diagnostic' && projectedTilesCompleted > FREE_TILE_LIMIT) {
      pendingPaywallPhaseRef.current = normalizedPhase;
      setPhase('paywall');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (ADAPTIVE.earlyMasteryExit?.enabled && normalizedPhase !== 'mastery-check' && normalizedPhase !== 'readiness-quiz') {
      const curScore = getMasteryScore(examId, comp, singleTeks, currentStd);
      const minTiles = ADAPTIVE.earlyMasteryExit.minimumTilesCompleted || 8;
      if (curScore >= (ADAPTIVE.earlyMasteryExit.masteryThreshold || 85) && tilesCompleted + 1 >= minTiles) {
        setShowEarlyMasteryOffer(true);
      }
    }

    if (isAdaptiveDebug) setAdaptiveDebugMessage((prev) => `${prev} | goto:${normalizedPhase}`);
    trackEvent('practice_loop_phase_change', { from: phase, to: normalizedPhase, examId, comp, currentStd: currentStd || '' });
    setPhase(normalizedPhase);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [examId, comp, singleTeks, currentStd, tilesCompleted, highWatermark, isPaid, ADAPTIVE, isAdaptiveDebug, phase]);

  const revisitCooldownRef = React.useRef(false);
  const revisitTile = useCallback((phaseKey) => {
    if (revisitCooldownRef.current) return;
    const idx = PHASES.indexOf(phaseKey);
    if (idx < 0) return;
    revisitCooldownRef.current = true;
    setTimeout(() => { revisitCooldownRef.current = false; }, 400);
    setRevisitReturnPhase(phase);
    revisitReturnRef.current = phase;
    setReviewPoolEpoch((n) => n + 1);
    setRevisitSeed((n) => n + 1);
    setDetourFromStep(idx);
    setPhase(phaseKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phase]);

  const goToPhaseAfterDiagnostic = useCallback((diagnosticCorrect, diagnosticTotal) => {
    // Always progress in sequence after tile 1 so every competency completes
    // the same full-tile learning loop without diagnostic skip-ahead jumps.
    if (isAdaptiveDebug) setAdaptiveDebugMessage(`diagnostic:${diagnosticCorrect}/${diagnosticTotal} -> next:video`);
    setCoachAdaptiveNote('');
    goToPhase('video');
  }, [goToPhase, isAdaptiveDebug]);

  const goToPhaseAfterCheckQuiz = useCallback((correctCount, total, normalNext, phaseKey) => {
    setCoachAdaptiveNote('');
    if (!ADAPTIVE.struggleDetection?.enabled) {
      goToPhase(normalNext);
      return;
    }
    const failRatio = total > 0 ? correctCount / total : 1;
    const nextStreak = failRatio < 0.5 ? checkQuizFailStreak + 1 : 0;
    setCheckQuizFailStreak(nextStreak);

    let nextPhase = normalNext;

    if (nextStreak >= 2 && ADAPTIVE.struggleDetection.twoConsecutiveFailures?.action === 'replayPreviousVideo') {
      if (videoReplayCount < MAX_VIDEO_REPLAYS) {
        const laterHalf = phaseKey === 'check-quiz-6' || phaseKey === 'check-quiz-7' || phaseKey === 'check-quiz-8';
        nextPhase = laterHalf ? 'video-2' : 'video';
        setVideoReplayCount((n) => n + 1);
        setCheckQuizFailStreak(0);
        setCoachAdaptiveNote('Two tough quizzes in a row — replaying the video so the next checks feel fairer.');
      } else {
        setCheckQuizFailStreak(0);
        setCoachAdaptiveNote('Moving forward — you can always revisit concepts later.');
      }
    } else if (correctCount === 0 && total > 0 && ADAPTIVE.struggleDetection.zeroCorrectOnCheckQuiz?.action === 'insertConceptReminder') {
      const resumeAfterRefresh = normalNext === 'concept-refresh' ? 'check-quiz-4' : normalNext;
      setConceptRefreshReturnPhase(resumeAfterRefresh);
      setDetourFromStep(PHASES.indexOf(phaseKey));
      nextPhase = 'concept-refresh';
      setCoachAdaptiveNote('That checkpoint had no correct answers — we are inserting a concept recap before the next challenge.');
    }

    if (isAdaptiveDebug) {
      setAdaptiveDebugMessage(`check:${phaseKey} score:${correctCount}/${total} streak:${nextStreak} replays:${videoReplayCount}/${MAX_VIDEO_REPLAYS} next:${nextPhase}`);
    }
    const isDetour = nextPhase === 'concept-refresh' && nextPhase !== normalNext;
    goToPhase(nextPhase, { skipProgress: isDetour });
  }, [ADAPTIVE, goToPhase, checkQuizFailStreak, videoReplayCount, isAdaptiveDebug]);

  const goToPhaseAfterReadiness = useCallback((correctCount, pool, answers) => {
    if (!ADAPTIVE.readinessGating?.enabled) {
      setCoachAdaptiveNote('');
      goToPhase('mastery-check');
      return;
    }
    const minCorrect = ADAPTIVE.readinessGating.minCorrect ?? 3;
    const requireMediumOrHardCorrect = !!ADAPTIVE.readinessGating.requireMediumOrHardCorrect;
    const maxRetries = ADAPTIVE.readinessGating.onFail?.maxRetries ?? 2;
    const hasMediumOrHardCorrect = pool.some((q) => {
      if (answers[q.id] !== q.correct) return false;
      const difficulty = normalizeDifficulty(q.difficulty);
      return difficulty === 'medium' || difficulty === 'hard';
    });
    const passed = correctCount >= minCorrect && (!requireMediumOrHardCorrect || hasMediumOrHardCorrect);
    if (isAdaptiveDebug) {
      setAdaptiveDebugMessage(
        `readiness:${correctCount}/${pool.length} medHard:${hasMediumOrHardCorrect ? 'yes' : 'no'} retries:${readinessRetries} pass:${passed ? 'yes' : 'no'}`,
      );
    }
    if (passed) {
      setCoachAdaptiveNote('');
      goToPhase('mastery-check');
    } else if (readinessRetries < maxRetries) {
      setReadinessRetries((n) => n + 1);
      setReadinessAnswers({});
      setReadinessSubmitted(false);
      setCoachAdaptiveNote('Readiness gate not met yet — quick concept recap, then you can try readiness again with spaced review mixed in.');
      setConceptRefreshReturnPhase('readiness-quiz');
      setDetourFromStep(PHASES.indexOf('readiness-quiz'));
      goToPhase('concept-refresh', { skipProgress: true });
    } else {
      setCoachAdaptiveNote('Moving to mastery after max readiness attempts — use results to spot remaining gaps.');
      goToPhase('mastery-check');
    }
  }, [ADAPTIVE, goToPhase, readinessRetries, isAdaptiveDebug]);

  const phaseRawIdx = PHASES.indexOf(phase);
  const phaseIndex = phaseRawIdx >= 0 ? phaseRawIdx : 0;
  const displayPhaseIndex = detourFromStep != null ? detourFromStep : phaseIndex;
  // When switching competency/standard scopes, clear detour-only indexing so
  // each loop paints tile progress from its own current phase.
  useEffect(() => {
    revisitReturnRef.current = null;
    setRevisitReturnPhase(null);
    setConceptRefreshReturnPhase(null);
    setDetourFromStep(null);
  }, [examId, comp, teks, currentStd]);
  const phaseTileMeta = useMemo(() => {
    const out = {};
    (learningLoopConfig.sequence || []).forEach((tile) => {
      const mapped = TILE_ID_TO_PHASE[tile.id];
      if (mapped) out[mapped] = tile;
    });
    return out;
  }, []);
  const getTileLabel = useCallback((phaseKey, fallback) => phaseTileMeta[phaseKey]?.label || fallback, [phaseTileMeta]);

  const CHECK_DIFFICULTY_BY_PHASE = useMemo(() => {
    const out = {};
    const progression = ADAPTIVE.difficultyEscalation?.checkQuizProgression || [];
    progression.forEach((bucket) => {
      const bias = bucket?.difficultyBias || 'medium';
      (bucket?.tiles || []).forEach((tileId) => {
        const phaseKey = TILE_ID_TO_PHASE[tileId];
        if (phaseKey) out[phaseKey] = bias;
      });
    });
    return out;
  }, [ADAPTIVE]);
  const currentDifficultyBias = CHECK_DIFFICULTY_BY_PHASE[phase] || 'n/a';
  const recentQuizAccuracy = useMemo(() => {
    if (!quizHistory.length) return 0;
    const recent = quizHistory.slice(-4);
    const avg = recent.reduce((sum, item) => sum + item.accuracy, 0) / recent.length;
    return Math.round(avg * 100);
  }, [quizHistory]);

  /** Map average confidence 1–5 → 0–100 (self-efficacy signal) */
  const confidenceIndex = useMemo(() => {
    if (!confidenceRatings.length) return null;
    const recent = confidenceRatings.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    return Math.round(((avg - 1) / 4) * 100);
  }, [confidenceRatings]);

  /**
   * Blends quiz performance with self-reported confidence so we meet students
   * where they feel they are, not only where scores say they are.
   */
  const blendedReadiness = useMemo(() => {
    const hasPerf = quizHistory.length > 0;
    const hasConf = confidenceIndex != null;
    if (!hasPerf && !hasConf) return 65;
    if (!hasPerf) return confidenceIndex;
    if (!hasConf) return recentQuizAccuracy;
    return Math.round(0.62 * recentQuizAccuracy + 0.38 * confidenceIndex);
  }, [quizHistory, recentQuizAccuracy, confidenceIndex]);

  const supportLevel = useMemo(() => {
    if (blendedReadiness < 55) return 'intensive-support';
    if (blendedReadiness < 80) return 'guided-practice';
    return 'challenge-ready';
  }, [blendedReadiness]);

  const examCountdownCoach = useMemo(() => getExamCountdownLabel(learningGoals.examDate), [learningGoals.examDate]);

  const coachMessage = useMemo(() => {
    const lowConf = confidenceIndex != null && confidenceIndex < 40;
    const highConf = confidenceIndex != null && confidenceIndex >= 75;
    let core = '';
    if (supportLevel === 'intensive-support') {
      if (lowConf) {
        core = 'Your reflection says this still feels shaky — we will prioritize clear models, guided interactives, and bite-sized wins before ramping difficulty.';
      } else {
        core = 'We will slow down, add more guided interactives, and reinforce key ideas before pushing forward.';
      }
    } else if (supportLevel === 'guided-practice') {
      if (highConf && recentQuizAccuracy < 70) {
        core = 'You feel more ready than your last scores suggest — we will bridge that gap with targeted practice so confidence matches performance.';
      } else {
        core = 'You are building momentum. Continue with mixed quizzes and interactives to reinforce setup, strategy, and verification steps.';
      }
    } else if (lowConf) {
      core = 'Scores look strong, but if you still feel unsure, use the next activities to prove it to yourself — confidence will follow.';
    } else {
      core = 'You are ready for challenge mode. Expect tougher items and faster progression opportunities.';
    }

    if (pacingPref === 'support') {
      core += ' You asked for more support — we will favor explanations and gentler sequencing.';
    } else if (pacingPref === 'faster') {
      core += ' You prefer a faster pace — push through quizzes when you feel ready, and use skip only when you are truly confident.';
    }

    if (learningGoals.focusCompId && comp === learningGoals.focusCompId) {
      core += ' This competency is in your focus list — extra reps here pay off for your goal.';
    } else if (learningGoals.focusCompId && examId === 'math712') {
      const fd = domains.find((d) => d.id === learningGoals.focusCompId);
      if (fd) core += ` When you finish here, consider extra time on your focus domain: ${fd.name}.`;
    }

    if (examCountdownCoach) {
      core += ` ${examCountdownCoach}`;
    }

    return core;
  }, [supportLevel, confidenceIndex, recentQuizAccuracy, pacingPref, learningGoals, comp, examId, domains, examCountdownCoach]);

  const recordConfidenceCheckIn = useCallback((value) => {
    setConfidenceRatings((prev) => [...prev, value].slice(-8));
    setLastCheckInMilestone(tilesCompleted);
    setPendingConfidenceCheckIn(false);
    setShowConfidenceCheckIn(false);
    if (isAdaptiveDebug) setAdaptiveDebugMessage(`confidence:${value}/5 milestone:${tilesCompleted}`);
  }, [tilesCompleted, isAdaptiveDebug]);

  const quizCountsByPhase = useMemo(() => ({
    diagnostic: DIAGNOSTIC_COUNT,
    'check-quiz': CHECK_QUIZ_COUNT,
    'check-quiz-2': CHECK_QUIZ_COUNT,
    'check-quiz-3': CHECK_QUIZ_COUNT,
    'check-quiz-4': CHECK_QUIZ_COUNT,
    'check-quiz-5': CHECK_QUIZ_COUNT,
    'check-quiz-6': CHECK_QUIZ_COUNT,
    'check-quiz-7': CHECK_QUIZ_COUNT,
    'check-quiz-8': CHECK_QUIZ_COUNT,
    'readiness-quiz': READINESS_COUNT,
    'mastery-check': MASTERY_COUNT,
  }), []);

  const quizSpecKeyByPhase = useMemo(() => ({
    diagnostic: 'diagnostic',
    'check-quiz': 'check',
    'check-quiz-2': 'check',
    'check-quiz-3': 'check',
    'check-quiz-4': 'check',
    'check-quiz-5': 'check',
    'check-quiz-6': 'check',
    'check-quiz-7': 'check',
    'check-quiz-8': 'check',
    'readiness-quiz': 'readiness',
    'mastery-check': 'mastery',
  }), []);

  const quizPhaseOrder = useMemo(() => ([
    'diagnostic',
    'check-quiz',
    'check-quiz-2',
    'check-quiz-3',
    'check-quiz-4',
    'check-quiz-5',
    'check-quiz-6',
    'check-quiz-7',
    'check-quiz-8',
    'readiness-quiz',
    'mastery-check',
  ]), []);

  const quizPoolsByPhase = useMemo(() => {
    const eid = gradeToExamId(grade) || examId;
    const c = comp || (singleTeks && eid && getCompForTeks(singleTeks, eid));
    if (!c || !eid) return {};

    const texesList = getQuestionsForExam(eid) || [];
    let scopedComp = c;
    let scopedStd = currentStd || '';
    if (!texesList.some((q) => q.type === 'mc' && q.comp === scopedComp)) {
      const parentDomain = (domains || []).find((d) => (d.standards || []).some((s) => s.id === scopedComp));
      if (parentDomain) {
        scopedStd = scopedStd || scopedComp;
        scopedComp = parentDomain.id;
      }
    }

    let sourcePool = texesList.filter((q) => q.type === 'mc' && q.comp === scopedComp);
    if (scopedStd) {
      const byStd = sourcePool.filter((q) => getStandardForQuestion(q.id) === scopedStd);
      if (byStd.length > 0) sourcePool = byStd;
    }
    if (sourcePool.length === 0) return {};

    const sourceById = new Map(sourcePool.map((q) => [q.id, q]));
    const allowedIds = new Set(sourcePool.map((q) => q.id));

    const pools = {};
    const usedIds = new Set();
    const recentIds = [];

    for (const phaseKey of quizPhaseOrder) {
      const count = quizCountsByPhase[phaseKey] || CHECK_QUIZ_COUNT;
      const specKey = quizSpecKeyByPhase[phaseKey] || 'check';
      const mix = QUIZ_SPECS[specKey]?.difficultyMix || null;
      const bias = CHECK_DIFFICULTY_BY_PHASE[phaseKey] || (specKey === 'mastery' ? 'hard' : specKey === 'diagnostic' ? 'easy' : 'medium');
      const epochPart = SPACED_REVIEW_PHASE_KEYS.has(phaseKey) ? `|rev${reviewPoolEpoch}` : '';
      const phaseSeed = `${loopSessionSeed}|quiz|${phaseKey}|${grade}|${singleTeks}|${scopedComp}|${scopedStd}${epochPart}|rs${revisitSeed}`;
      const ordered = buildOrderedPoolForPhase(sourcePool, { seedInput: phaseSeed, bias, mix });
      const picked = pickPhaseQuestions(ordered, count, usedIds, recentIds);

      let pickedFinal = picked;
      let spacedInjectedId = null;
      if (SPACED_REVIEW_PHASE_KEYS.has(phaseKey) && loopReviewKey) {
        const candidates = getSpacedReviewCandidates(loopReviewKey, allowedIds, 12);
        const inPhase = new Set(picked.map((q) => q.id));
        for (const rid of candidates) {
          if (inPhase.has(rid)) continue;
          const raw = sourceById.get(rid);
          if (!raw) continue;
          spacedInjectedId = rid;
          pickedFinal = [raw, ...picked.slice(0, Math.max(0, count - 1))];
          break;
        }
      }

      pools[phaseKey] = pickedFinal.map((q) => texesToBankItem(q, { spacedReview: spacedInjectedId != null && q.id === spacedInjectedId }));

      for (const q of pickedFinal) {
        usedIds.add(q.id);
        recentIds.push(q.id);
      }
      while (recentIds.length > 12) recentIds.shift();
    }

    return pools;
  }, [
    grade, examId, comp, currentStd, singleTeks, loopSessionSeed, reviewPoolEpoch, revisitSeed, loopReviewKey, domains,
    CHECK_DIFFICULTY_BY_PHASE, quizCountsByPhase, quizSpecKeyByPhase, quizPhaseOrder,
  ]);
  const sourcePoolCoverage = useMemo(() => {
    const eid = gradeToExamId(grade) || examId;
    const c = comp || (singleTeks && eid && getCompForTeks(singleTeks, eid));
    if (!c || !eid) return { total: 0, easy: 0, medium: 0, hard: 0 };
    const texesList = getQuestionsForExam(eid) || [];
    let scopedComp = c;
    let scopedStd = currentStd || '';
    if (!texesList.some((q) => q.type === 'mc' && q.comp === scopedComp)) {
      const parentDomain = (domains || []).find((d) => (d.standards || []).some((s) => s.id === scopedComp));
      if (parentDomain) {
        scopedStd = scopedStd || scopedComp;
        scopedComp = parentDomain.id;
      }
    }

    let pool = texesList.filter((q) => q.type === 'mc' && q.comp === scopedComp);
    if (scopedStd) {
      const byStd = pool.filter((q) => getStandardForQuestion(q.id) === scopedStd);
      if (byStd.length > 0) pool = byStd;
    }
    const counts = { total: pool.length, easy: 0, medium: 0, hard: 0 };
    pool.forEach((q) => { counts[normalizeDifficulty(q.difficulty)] += 1; });
    return counts;
  }, [grade, examId, comp, singleTeks, currentStd, domains]);

  const diagnosticPool = useMemo(
    () => quizPoolsByPhase.diagnostic || [],
    [quizPoolsByPhase],
  );
  const [diagnosticAnswers, setDiagnosticAnswers] = useState({});
  const [diagnosticSubmitted, setDiagnosticSubmitted] = useState(false);

  const checkQuizPool = useMemo(
    () => quizPoolsByPhase['check-quiz'] || [],
    [quizPoolsByPhase],
  );
  const [checkQuizAnswers, setCheckQuizAnswers] = useState({});
  const [checkQuizSubmitted, setCheckQuizSubmitted] = useState(false);

  const checkQuiz2Pool = useMemo(
    () => quizPoolsByPhase['check-quiz-2'] || [],
    [quizPoolsByPhase],
  );
  const [checkQuiz2Answers, setCheckQuiz2Answers] = useState({});
  const [checkQuiz2Submitted, setCheckQuiz2Submitted] = useState(false);

  const checkQuiz3Pool = useMemo(
    () => quizPoolsByPhase['check-quiz-3'] || [],
    [quizPoolsByPhase],
  );
  const [checkQuiz3Answers, setCheckQuiz3Answers] = useState({});
  const [checkQuiz3Submitted, setCheckQuiz3Submitted] = useState(false);

  const checkQuiz4Pool = useMemo(
    () => quizPoolsByPhase['check-quiz-4'] || [],
    [quizPoolsByPhase],
  );
  const [checkQuiz4Answers, setCheckQuiz4Answers] = useState({});
  const [checkQuiz4Submitted, setCheckQuiz4Submitted] = useState(false);

  const checkQuiz5Pool = useMemo(
    () => quizPoolsByPhase['check-quiz-5'] || [],
    [quizPoolsByPhase],
  );
  const [checkQuiz5Answers, setCheckQuiz5Answers] = useState({});
  const [checkQuiz5Submitted, setCheckQuiz5Submitted] = useState(false);

  const checkQuiz6Pool = useMemo(
    () => quizPoolsByPhase['check-quiz-6'] || [],
    [quizPoolsByPhase],
  );
  const [checkQuiz6Answers, setCheckQuiz6Answers] = useState({});
  const [checkQuiz6Submitted, setCheckQuiz6Submitted] = useState(false);

  const checkQuiz7Pool = useMemo(
    () => quizPoolsByPhase['check-quiz-7'] || [],
    [quizPoolsByPhase],
  );
  const [checkQuiz7Answers, setCheckQuiz7Answers] = useState({});
  const [checkQuiz7Submitted, setCheckQuiz7Submitted] = useState(false);

  const checkQuiz8Pool = useMemo(
    () => quizPoolsByPhase['check-quiz-8'] || [],
    [quizPoolsByPhase],
  );
  const [checkQuiz8Answers, setCheckQuiz8Answers] = useState({});
  const [checkQuiz8Submitted, setCheckQuiz8Submitted] = useState(false);

  const readinessPool = useMemo(
    () => quizPoolsByPhase['readiness-quiz'] || [],
    [quizPoolsByPhase],
  );
  const [readinessAnswers, setReadinessAnswers] = useState({});
  const [readinessSubmitted, setReadinessSubmitted] = useState(false);

  const masteryPool = useMemo(
    () => quizPoolsByPhase['mastery-check'] || [],
    [quizPoolsByPhase],
  );
  const [masteryAnswers, setMasteryAnswers] = useState({});
  const [masterySubmitted, setMasterySubmitted] = useState(false);
  const quizResumeHydratedRef = useRef(false);

  const clearQuizProgressState = useCallback(() => {
    setDiagnosticAnswers({});
    setDiagnosticSubmitted(false);
    setCheckQuizAnswers({});
    setCheckQuizSubmitted(false);
    setCheckQuiz2Answers({});
    setCheckQuiz2Submitted(false);
    setCheckQuiz3Answers({});
    setCheckQuiz3Submitted(false);
    setCheckQuiz4Answers({});
    setCheckQuiz4Submitted(false);
    setCheckQuiz5Answers({});
    setCheckQuiz5Submitted(false);
    setCheckQuiz6Answers({});
    setCheckQuiz6Submitted(false);
    setCheckQuiz7Answers({});
    setCheckQuiz7Submitted(false);
    setCheckQuiz8Answers({});
    setCheckQuiz8Submitted(false);
    setReadinessAnswers({});
    setReadinessSubmitted(false);
    setMasteryAnswers({});
    setMasterySubmitted(false);
    setQuizPhaseScores({});
    setHighWatermark(-1);
    try { window.sessionStorage.removeItem(sessionQuizKey); } catch {}
    try { window.sessionStorage.removeItem(highWatermarkKeyRef.current); } catch {}
  }, [sessionQuizKey]);

  useEffect(() => {
    if (quizResumeHydratedRef.current) return;
    quizResumeHydratedRef.current = true;
    try {
      const raw = window.sessionStorage.getItem(sessionQuizKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const savedPhase = saved.phase && PHASES.includes(saved.phase) ? saved.phase : null;
      if (savedPhase) {
        suppressQuizResetRef.current = true;
        setPhase(savedPhase);
      }
      const savedIdx = savedPhase ? PHASES.indexOf(savedPhase) : -1;
      const reached = (phaseKey) => {
        const idx = PHASES.indexOf(phaseKey);
        return idx >= 0 && savedIdx >= idx;
      };
      if (saved.quizPhaseScores && typeof saved.quizPhaseScores === 'object') {
        setQuizPhaseScores(saved.quizPhaseScores);
      }
      setDiagnosticAnswers(saved.diagnosticAnswers || {});
      setDiagnosticSubmitted(!!saved.diagnosticSubmitted);
      setCheckQuizAnswers(reached('check-quiz') ? (saved.checkQuizAnswers || {}) : {});
      setCheckQuizSubmitted(reached('check-quiz') && !!saved.checkQuizSubmitted);
      setCheckQuiz2Answers(reached('check-quiz-2') ? (saved.checkQuiz2Answers || {}) : {});
      setCheckQuiz2Submitted(reached('check-quiz-2') && !!saved.checkQuiz2Submitted);
      setCheckQuiz3Answers(reached('check-quiz-3') ? (saved.checkQuiz3Answers || {}) : {});
      setCheckQuiz3Submitted(reached('check-quiz-3') && !!saved.checkQuiz3Submitted);
      setCheckQuiz4Answers(reached('check-quiz-4') ? (saved.checkQuiz4Answers || {}) : {});
      setCheckQuiz4Submitted(reached('check-quiz-4') && !!saved.checkQuiz4Submitted);
      setCheckQuiz5Answers(reached('check-quiz-5') ? (saved.checkQuiz5Answers || {}) : {});
      setCheckQuiz5Submitted(reached('check-quiz-5') && !!saved.checkQuiz5Submitted);
      setCheckQuiz6Answers(reached('check-quiz-6') ? (saved.checkQuiz6Answers || {}) : {});
      setCheckQuiz6Submitted(reached('check-quiz-6') && !!saved.checkQuiz6Submitted);
      setCheckQuiz7Answers(reached('check-quiz-7') ? (saved.checkQuiz7Answers || {}) : {});
      setCheckQuiz7Submitted(reached('check-quiz-7') && !!saved.checkQuiz7Submitted);
      setCheckQuiz8Answers(reached('check-quiz-8') ? (saved.checkQuiz8Answers || {}) : {});
      setCheckQuiz8Submitted(reached('check-quiz-8') && !!saved.checkQuiz8Submitted);
      setReadinessAnswers(reached('readiness-quiz') ? (saved.readinessAnswers || {}) : {});
      setReadinessSubmitted(reached('readiness-quiz') && !!saved.readinessSubmitted);
      setMasteryAnswers(reached('mastery-check') ? (saved.masteryAnswers || {}) : {});
      setMasterySubmitted(reached('mastery-check') && !!saved.masterySubmitted);
      if (saved.quizStartAt) {
        quizStartTimeRef.current = saved.quizStartAt;
        skipNextQuizTimerResetRef.current = true;
      }
    } catch {}
  }, [sessionQuizKey]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(sessionQuizKey, JSON.stringify({
        phase,
        quizStartAt: quizStartTimeRef.current,
        quizPhaseScores,
        diagnosticAnswers, diagnosticSubmitted,
        checkQuizAnswers, checkQuizSubmitted,
        checkQuiz2Answers, checkQuiz2Submitted,
        checkQuiz3Answers, checkQuiz3Submitted,
        checkQuiz4Answers, checkQuiz4Submitted,
        checkQuiz5Answers, checkQuiz5Submitted,
        checkQuiz6Answers, checkQuiz6Submitted,
        checkQuiz7Answers, checkQuiz7Submitted,
        checkQuiz8Answers, checkQuiz8Submitted,
        readinessAnswers, readinessSubmitted,
        masteryAnswers, masterySubmitted,
      }));
    } catch {}
  }, [
    sessionQuizKey, phase, quizPhaseScores,
    diagnosticAnswers, diagnosticSubmitted,
    checkQuizAnswers, checkQuizSubmitted,
    checkQuiz2Answers, checkQuiz2Submitted,
    checkQuiz3Answers, checkQuiz3Submitted,
    checkQuiz4Answers, checkQuiz4Submitted,
    checkQuiz5Answers, checkQuiz5Submitted,
    checkQuiz6Answers, checkQuiz6Submitted,
    checkQuiz7Answers, checkQuiz7Submitted,
    checkQuiz8Answers, checkQuiz8Submitted,
    readinessAnswers, readinessSubmitted,
    masteryAnswers, masterySubmitted,
  ]);

  const tileProgress = useMemo(() => {
    // Keep the visual tile bar aligned with the displayed step number.
    const currentIdx = Math.max(0, Math.min(PHASES.length - 1, Number(displayPhaseIndex) || 0));
    return PHASES.map((p, i) => {
      const meta = getTileMeta(p);
      const label = meta?.icon || '';
      const name = phaseTileMeta[p]?.label || p.replace(/-/g, ' ');
      if (i <= currentIdx && quizPhaseScores[p] != null) {
        const pct = Math.max(0, Math.min(100, Math.round(quizPhaseScores[p])));
        const color = pct >= 75 ? COLOR.green : pct >= 45 ? COLOR.amber : COLOR.red;
        return { key: p, label, name, pct, color, status: 'done' };
      }
      if (i < currentIdx) return { key: p, label, name, pct: null, color: COLOR.green, status: 'passed' };
      if (i === currentIdx) return { key: p, label, name, pct: null, color: COLOR.blue, status: 'current' };
      return { key: p, label, name, pct: null, color: null, status: 'future' };
    });
  }, [displayPhaseIndex, phaseTileMeta, quizPhaseScores]);

  const quizResetMap = useMemo(() => ({
    'check-quiz': [setCheckQuizAnswers, setCheckQuizSubmitted],
    'check-quiz-2': [setCheckQuiz2Answers, setCheckQuiz2Submitted],
    'check-quiz-3': [setCheckQuiz3Answers, setCheckQuiz3Submitted],
    'check-quiz-4': [setCheckQuiz4Answers, setCheckQuiz4Submitted],
    'check-quiz-5': [setCheckQuiz5Answers, setCheckQuiz5Submitted],
    'check-quiz-6': [setCheckQuiz6Answers, setCheckQuiz6Submitted],
    'check-quiz-7': [setCheckQuiz7Answers, setCheckQuiz7Submitted],
    'check-quiz-8': [setCheckQuiz8Answers, setCheckQuiz8Submitted],
  }), []);
  const suppressQuizResetRef = useRef(true);
  useEffect(() => {
    if (suppressQuizResetRef.current) {
      suppressQuizResetRef.current = false;
      return;
    }
    const resetters = quizResetMap[phase];
    if (resetters) {
      resetters[0]({});
      resetters[1](false);
    }
  }, [phase, quizResetMap]);

  const fourGames = useMemo(() => {
    const isOk = (g) => g && (!Array.isArray(g.grades) || g.grades.includes(grade));
    let eligible = GAMES_CATALOG.filter(isOk);
    if (eligible.length === 0) return [COMPETENCY_EXPLORER];

    const strictMath712StdScope = examId === 'math712' && !!currentStd;
    const STRICT_SCOPED_GAME_IDS = new Set(['q-blocks', 'math-bingo', 'math-match']);
    if (strictMath712StdScope) {
      eligible = eligible.filter((g) => STRICT_SCOPED_GAME_IDS.has(g.id));
      if (eligible.length === 0) return [COMPETENCY_EXPLORER];
    }

    // Games whose content is hardcoded to a specific domain and can't adapt to
    // arbitrary TEKS.  Map competency → set of game IDs to exclude.
    // Games whose content is hardcoded and can't adapt to the competency's TEKS.
    // Games whose content can't adapt to the competency's TEKS. Keyed by comp.
    // Shared set of games with hardcoded elementary content (no TEKS filtering).
    const HARDCODED_GAMES = [
      'escape-room', 'scavenger-hunt', 'speed-builder', 'crosses-knots',
      'math-memory', 'time-traveler', 'math-maze', 'fraction-pizza',
      'number-line-ninja', 'shape-shifter', 'fraction-frenzy',
    ];
    const COMP_GAME_EXCLUDE = {
      comp001: new Set([...HARDCODED_GAMES, 'qbot-shop']),
      comp002: new Set([...HARDCODED_GAMES, 'qbot-shop']),
      comp003: new Set([...HARDCODED_GAMES, 'qbot-shop']),
      comp004: new Set([
        ...HARDCODED_GAMES, 'qbot-shop', 'equation-balance', 'graph-explorer',
        'algebra-sprint', 'math-sprint', 'q-blocks',
      ]),
      comp005: new Set([...HARDCODED_GAMES, 'qbot-shop']),
      comp006: new Set([...HARDCODED_GAMES, 'qbot-shop']),
    };
    // Games extended with content for a competency — placed first in rotation.
    const COMP_GAME_PREFER = strictMath712StdScope
      ? {
          comp001: ['q-blocks', 'math-bingo', 'math-match'],
          comp002: ['q-blocks', 'math-bingo', 'math-match'],
          comp003: ['q-blocks', 'math-bingo', 'math-match'],
          comp004: ['q-blocks', 'math-bingo', 'math-match'],
          comp005: ['q-blocks', 'math-bingo', 'math-match'],
          comp006: ['q-blocks', 'math-bingo', 'math-match'],
        }
      : {
          comp001: ['math-match', 'math-bingo', 'math-jeopardy', 'q-blocks'],
          comp002: ['math-match', 'math-bingo', 'math-jeopardy', 'q-blocks'],
          comp003: ['math-match', 'math-bingo', 'math-jeopardy', 'q-blocks'],
          comp004: ['math-match', 'math-bingo', 'math-jeopardy', 'math-millionaire', 'q-blocks'],
          comp005: ['math-match', 'math-bingo', 'math-jeopardy', 'q-blocks'],
          comp006: ['math-match', 'math-bingo', 'math-jeopardy', 'q-blocks'],
        };

    const exclude = comp && COMP_GAME_EXCLUDE[comp];
    if (exclude) eligible = eligible.filter((g) => !exclude.has(g.id));
    if (eligible.length === 0) return [COMPETENCY_EXPLORER];

    // Deterministic offset from competency so each standard gets a different mix.
    let hash = 0;
    const seed = `${comp || ''}|${currentStd || ''}|${examId || ''}`;
    for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    const offset = ((hash % eligible.length) + eligible.length) % eligible.length;

    const picked = [];
    // Insert preferred games first (if they are in the eligible list).
    const preferred = (comp && COMP_GAME_PREFER[comp]) || [];
    for (const pid of preferred) {
      const g = eligible.find((e) => e.id === pid);
      if (g && picked.length < 4) picked.push(g);
    }
    const pickedIds = new Set(picked.map((g) => g.id));
    for (let i = 0; i < eligible.length && picked.length < 4; i++) {
      const g = eligible[(offset + i) % eligible.length];
      if (!pickedIds.has(g.id)) { picked.push(g); pickedIds.add(g.id); }
    }
    return picked;
  }, [grade, comp, currentStd, examId]);

  const activityModes = useMemo(() => {
    if (subject !== 'math') return [];
    const loopSeed = `${loopSessionSeed}|${grade}|${examId}|${comp}|${currentStd}|${teks}`;
    return buildActivityModeSequence(11, `${loopSeed}|activities`);
  }, [subject, grade, comp, examId, currentStd, teks, loopSessionSeed]);

  const getActivityMode = useCallback((index, fallback = 'slope') => {
    if (subject !== 'math') return undefined;
    if (comp === 'comp002' && currentStd) {
      const standardModes = {
        c004: ['sequence-patterns', 'sequence-patterns', 'function-transform'],
        c005: ['function-transform', 'function-transform', 'quadratic'],
        c006: ['slope', 'intercept', 'both'],
        c007: ['function-transform', 'quadratic', 'function-transform'],
        c008: ['function-transform', 'function-transform', 'quadratic'],
        c009: ['trig-circle', 'trig-circle', 'function-transform'],
        c010: ['quadratic', 'function-transform', 'quadratic'],
      };
      const mapped = standardModes[currentStd];
      if (mapped?.length) return mapped[index % mapped.length];
    }
    if (!LINEAR_FUNCTION_COMPS.has(comp)) return undefined;
    // Domain II is broad; only force linear-mode activities for linear-focused standards.
    if (currentStd && !LINEAR_FUNCTION_STANDARDS.has(currentStd)) return undefined;
    if (supportLevel === 'intensive-support') {
      const supportModes = ['y-intercept-read', 'intercept', 'slope', 'intercept'];
      return supportModes[index % supportModes.length] || fallback;
    }
    if (supportLevel === 'challenge-ready') {
      const challengeModes = ['both', 'slope', 'both', 'intercept'];
      return challengeModes[index % challengeModes.length] || activityModes[index] || fallback;
    }
    return activityModes[index] || fallback;
  }, [subject, comp, currentStd, activityModes, supportLevel]);

  const game1 = fourGames[0];
  const game2 = fourGames[1] || COMPETENCY_EXPLORER;
  const game3 = fourGames[2] || COMPETENCY_EXPLORER;
  const game4 = fourGames[3] || COMPETENCY_EXPLORER;
  const gamePath = game1?.path || '/concept-explorer';
  const gameDisplayName = game1?.name || 'Competency Explorer';

  const lecture = useMemo(() => (singleTeks && !compDomain ? getLecture(singleTeks) : null), [singleTeks, compDomain]);
  const introLecture = useMemo(() => {
    if (comp) return getLectureForComp(comp, resolvedStdId || singleTeks);
    return lecture || null;
  }, [comp, lecture, resolvedStdId, singleTeks]);

  const deepDiveLecture = useMemo(() => {
    // When a specific standard is active, keep both videos aligned to that standard.
    if (resolvedStdId) return introLecture;
    if (!compDomain) return introLecture;
    const otherStd = (compDomain.standards || []).find((s) => s.id && s.id !== currentStd);
    if (otherStd?.id) {
      const l = getLectureForComp(comp, otherStd.id);
      if (l) return l;
    }
    return introLecture;
  }, [resolvedStdId, compDomain, introLecture, currentStd, comp]);
  const bankCount = useMemo(() => queryBank({ teks: singleTeks, grade, format: 'multiple-choice' }).length, [singleTeks, grade]);
  const usedBank = bankCount >= Math.max(DIAGNOSTIC_COUNT, CHECK_QUIZ_COUNT);
  const reminderText = useMemo(() => {
    // Standard-specific loops should not fall back to broad domain blurbs.
    if (currentStdObj?.desc) return currentStdObj.desc;
    if (compDomain?.desc) return compDomain.desc;
    if (usedBank && lecture?.keyIdea) return lecture.keyIdea;
    if (comp && getCompKeyIdea(comp)) return getCompKeyIdea(comp);
    return lecture?.keyIdea || lecture?.title || (label ? 'Focus: ' + label : '') || 'Quick focus on this concept, then questions and a game.';
  }, [usedBank, lecture, comp, label, compDomain, currentStdObj]);
  const { introVideoEmbed, deepDiveVideoEmbed } = useMemo(() => {
    const uniqueEmbeds = [];
    const pushUnique = (raw) => {
      const embed = toYouTubeEmbed(raw);
      if (!embed) return;
      if (!uniqueEmbeds.includes(embed)) uniqueEmbeds.push(embed);
    };

    // Always prioritize lecture videos tied to the active competency/standard.
    pushUnique(introLecture?.video);
    pushUnique(deepDiveLecture?.video);

    // Only allow broad domain fallbacks when no specific standard is selected.
    if (!resolvedStdId) {
      (compDomain?.videos || []).forEach(pushUnique);
      pushUnique(compDomain?.video);
      pushUnique(lecture?.video);
      pushUnique('https://www.youtube.com/embed/CLWpkv6ccpA');
    }

    return {
      introVideoEmbed: uniqueEmbeds[0] || null,
      deepDiveVideoEmbed: uniqueEmbeds[1] || null,
    };
  }, [compDomain, lecture, introLecture, deepDiveLecture, resolvedStdId]);

  const conceptTitle = useMemo(() => {
    if (currentStdObj) return currentStdObj.name;
    const allDomains = getDomainsForExam(examId) || [];
    const ci = allDomains.findIndex((d) => d.id === comp);
    if (ci >= 0) return `Domain ${ROMAN[ci] || ci + 1}: ${allDomains[ci].name}`;
    return compShort || label || teks;
  }, [currentStdObj, examId, comp, compShort, label, teks]);
  const showNumberSetsActivity = !deepDiveVideoEmbed && (comp === 'comp001' || currentStd === 'c001');
  const hasUniqueDeepDiveLecture = !!(deepDiveLecture && comp !== 'comp001' && deepDiveLecture !== introLecture);
  const useGeometricRefreshActivity = comp === 'comp005' || currentStd === 'c018';
  const conceptRefreshConcept = useMemo(() => {
    const normalizeConceptText = (v) => String(v || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const seen = new Set([
      normalizeConceptText(microConcept?.conceptText),
      normalizeConceptText(reminderText),
    ].filter(Boolean));

    // Also avoid texts already surfaced earlier in this same loop session.
    const maxSeenIndex = Math.max(0, tilesCompleted + revisitSeed + 2);
    for (let vi = 0; vi <= maxSeenIndex; vi++) {
      const prior = getMicroConcept(examId, comp, singleTeks, currentStd, vi);
      const priorKey = normalizeConceptText(prior?.conceptText);
      if (priorKey) seen.add(priorKey);
    }

    let alt = null;
    // Try several variant offsets so recap content stays fresh within the same loop.
    for (let step = 1; step <= 10; step++) {
      const candidate = getMicroConcept(examId, comp, singleTeks, currentStd, tilesCompleted + revisitSeed + step);
      const textKey = normalizeConceptText(candidate?.conceptText);
      if (candidate?.conceptText && !seen.has(textKey)) {
        alt = candidate;
        break;
      }
    }

    if (!microConcept) return alt;
    if (!alt) {
      const nonDuplicateFallbackText = microConcept?.misconception
        ? `Watch out focus: ${microConcept.misconception}`
        : (microConcept?.workedExample
          ? `Worked-example focus: ${microConcept.workedExample}`
          : (reminderText || microConcept?.title || conceptTitle || 'Quick recap'));
      return {
        ...microConcept,
        title: microConcept?.title ? `${microConcept.title} - New Angle` : conceptTitle,
        conceptText: nonDuplicateFallbackText,
        illustrationHtml: undefined,
      };
    }
    if (alt.conceptText && alt.conceptText !== microConcept.conceptText) return alt;

    // Last-resort fallback so recap is not a duplicate of the prior concept tile.
    const fallbackText = microConcept?.misconception
      ? `Watch out focus: ${microConcept.misconception}`
      : (microConcept?.workedExample
        ? `Worked-example focus: ${microConcept.workedExample}`
        : (reminderText || microConcept.conceptText || ''));

    return {
      ...microConcept,
      title: microConcept?.title ? `${microConcept.title} — New Angle` : conceptTitle,
      conceptText: fallbackText,
      illustrationHtml: undefined,
    };
  }, [examId, comp, singleTeks, currentStd, tilesCompleted, revisitSeed, microConcept, reminderText, conceptTitle]);

  const buildReturnUrl = (returnPhase) => {
    const base = `/practice-loop?teks=${encodeURIComponent(teks)}&label=${encodeURIComponent(label)}&grade=${encodeURIComponent(grade)}&phase=${returnPhase}`;
    const compParam = comp ? `&comp=${encodeURIComponent(comp)}` : '';
    const stdParam = currentStd ? `&currentStd=${encodeURIComponent(currentStd)}` : '';
    return `${base}${compParam}${stdParam}&examId=${encodeURIComponent(examId)}`;
  };

  const buildGameUrl = (path, returnPhaseOverride = null) => {
    const base = (path || gamePath).startsWith('/') ? (path || gamePath) : `/${path || gamePath}`;
    const sep = base.includes('?') ? '&' : '?';
    const returnPhase = returnPhaseOverride ?? 'check-quiz-2';
    const returnUrl = encodeURIComponent(buildReturnUrl(returnPhase));
    const gameTeks = singleTeks || currentStd || comp || '';
    const compParam = comp ? `&comp=${encodeURIComponent(comp)}` : '';
    const stdParam = currentStd ? `&currentStd=${encodeURIComponent(currentStd)}` : '';
    const examParam = examId ? `&examId=${encodeURIComponent(examId)}` : '';
    return `${base}${sep}teks=${encodeURIComponent(gameTeks)}&label=${encodeURIComponent(label)}&grade=${encodeURIComponent(grade)}&sid=${encodeURIComponent(sid)}&cid=${encodeURIComponent(cid)}${compParam}${stdParam}${examParam}&mode=adaptive&from=loop&embed=1&returnPhase=${encodeURIComponent(returnPhase)}&returnUrl=${returnUrl}`;
  };
  const gameUrl = buildGameUrl(game1?.path);
  const game2Url = buildGameUrl(game2?.path, 'check-quiz-5');
  const game2DisplayName = game2?.name || gameDisplayName;
  const game3Url = buildGameUrl(game3?.path, 'check-quiz-8');
  const game3DisplayName = game3?.name || gameDisplayName;
  const game4Url = buildGameUrl(game4?.path, 'readiness-quiz');
  const game4DisplayName = game4?.name || gameDisplayName;
  const showScopedGameDebug = examId === 'math712' && !!currentStd;
  const scopedGameDebugText = showScopedGameDebug
    ? `Scoped games for ${currentStd.toUpperCase()}: 1) ${gameDisplayName}  2) ${game2DisplayName}  3) ${game3DisplayName}  4) ${game4DisplayName}`
    : '';

  const hasTopic = !!(teks || label);
  const examLabel = examId === 'math712' ? 'Math 7\u201312' : examId === 'math48' ? 'Math 4\u20138' : examId ? String(examId) : null;

  const whyMattersLine = useMemo(() => {
    if (!hasTopic) return '';

    const WHY_IT_MATTERS = {
      c001: 'Understanding the real number system lets you build every other math topic on a solid foundation — and the TExES exam tests whether you can teach it clearly.',
      c002: 'Complex numbers unlock solutions to equations that real numbers alone cannot solve. You will use them in engineering contexts and the exam expects fluency with operations and representations.',
      c003: 'Number theory (primes, divisibility, modular arithmetic) sharpens logical reasoning — a skill the exam tests directly and one your future students rely on for proofs and problem solving.',
      c004: 'For Competency 004, focus on writing explicit and recursive rules for arithmetic, geometric, and Fibonacci-like sequences; then generalize to the nth term and apply in context. Expect finance modeling (simple/compound interest and annuity-style growth) and interpretation of what each term/rate means in real situations.',
      c005: 'Functions are the backbone of algebra and calculus. Mastering domain, range, transformations, and inverses prepares you for nearly a third of the exam.',
      c006: 'Linear and quadratic functions appear everywhere — from slope and systems of equations to projectile motion. This is one of the most heavily tested competencies.',
      c007: 'Polynomial, rational, and piecewise functions model complex real-world behavior. The exam tests your ability to analyze graphs, asymptotes, and domain restrictions.',
      c008: 'Exponential and logarithmic functions model growth, decay, and real-world phenomena like compound interest — common exam topics and essential for your future classroom.',
      c009: 'Trigonometry connects algebra to geometry through the unit circle. The exam tests identities, graphs, and modeling periodic phenomena.',
      c010: 'Calculus (limits, derivatives, integrals) ties together everything you have learned. Even a few solid items here can boost your overall score significantly.',
      c011: 'Measurement — area, volume, conversions — is something you will teach constantly. The exam checks that you can apply these ideas accurately across 2-D and 3-D contexts.',
      c012: 'Axiomatic geometry (proofs, constructions, congruence) tests your ability to reason deductively — a core skill for both the exam and the classroom.',
      c013: 'Knowing properties of triangles, quadrilaterals, circles, and 3-D shapes lets you solve practical problems and is a staple of the geometry portion of the exam.',
      c014: 'Coordinate and transformational geometry connects algebra with shape. The exam expects you to use distance, midpoint, conics, and transformations fluently.',
      c015: 'Data analysis — mean, median, box plots, scatter plots — is how we make sense of real-world information. Teachers use these tools daily, and the exam tests your ability to interpret and communicate data clearly.',
      c016: 'Probability — from basic events to distributions — helps students make informed decisions under uncertainty. The exam tests your ability to calculate, model, and explain likelihood.',
      c017: 'Statistical inference (hypothesis tests, confidence intervals, regression) turns data into conclusions. Mastering this competency proves you can teach evidence-based reasoning.',
      c018: 'Mathematical reasoning and problem-solving strategies are tested throughout the exam. Strength here lifts every other domain.',
      c019: 'Connecting math to the real world and communicating clearly are skills every math teacher needs — and the exam specifically assesses them.',
      c020: 'Understanding how students learn math — from concrete to abstract — directly impacts your teaching effectiveness and is a dedicated section of the exam.',
      c021: 'Knowing how to design assessments and diagnose student misconceptions makes you a better teacher and is specifically tested on the TExES.',
    };

    const stdId = currentStd || '';
    if (WHY_IT_MATTERS[stdId]) return WHY_IT_MATTERS[stdId];

    if (examId === 'math712' || examId === 'math48') {
      return 'This competency is part of the TExES certification framework — strength here supports your exam score and your classroom teaching.';
    }
    if (currentStdObj?.desc) {
      const d = String(currentStdObj.desc);
      return d.length > 220 ? `${d.slice(0, 220)}…` : d;
    }
    return '';
  }, [hasTopic, examId, currentStdObj, currentStd]);

  useEffect(() => {
    if (!hasTopic || !loopSessionSeed) return;
    const r = touchLoopSessionStart(loopSessionSeed);
    if (!r.ok) {
      setStorageIssue({
        kind: 'session_meta',
        code: r.code,
        message: r.message,
        recovery: { seed: loopSessionSeed },
      });
    }
  }, [hasTopic, loopSessionSeed]);

  useEffect(() => {
    const on = () => { setIsOnline(true); setLocalSaveWarning(false); };
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const deepLinkGuardRan = useRef(false);
  const pendingPhaseUrlSyncRef = useRef(null);
  useEffect(() => {
    if (deepLinkGuardRan.current || !hasTopic) return;
    deepLinkGuardRan.current = true;
    if (PHASES.includes(phase)) return;
    setPhase(PHASES[0] || 'diagnostic');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTopic, phase]);

  useEffect(() => {
    if (skipNextQuizTimerResetRef.current) {
      skipNextQuizTimerResetRef.current = false;
      return;
    }
    quizStartTimeRef.current = Date.now();
  }, [phase]);

  useEffect(() => {
    if (!celebrationToast) return;
    const t = setTimeout(() => setCelebrationToast(null), 7000);
    return () => clearTimeout(t);
  }, [celebrationToast]);

  useEffect(() => {
    if (!coachAdaptiveNote) return;
    const t = setTimeout(() => setCoachAdaptiveNote(''), 16000);
    return () => clearTimeout(t);
  }, [coachAdaptiveNote, phase]);

  useEffect(() => {
    if (tilesCompleted > 0) setCoachExpanded(false);
  }, [tilesCompleted]);

  useEffect(() => {
    if (!focusMode && displayPhaseIndex >= 1) {
      setFocusMode(true);
      setShowFocusTools(false);
    }
  }, [displayPhaseIndex, focusMode]);

  useEffect(() => {
    if (!focusMode) return;
    setDockCollapsed(true);
  }, [focusMode, phase]);

  useEffect(() => {
    if (dockAutoCollapsedRef.current) return;
    if (displayPhaseIndex >= 2) {
      dockAutoCollapsedRef.current = true;
      setDockCollapsed(true);
    }
  }, [displayPhaseIndex]);

  useEffect(() => {
    if (saveProgressPromptedRef.current) return;
    if (isPaid || phase === 'paywall') return;
    if (tilesCompleted >= SAVE_PROGRESS_TILE_THRESHOLD && !isStudentLoggedIn()) {
      saveProgressPromptedRef.current = true;
      try { window.sessionStorage.setItem(savePromptSessionKey, '1'); } catch {}
      setShowSaveProgressModal(true);
    }
  }, [tilesCompleted, isPaid, phase, savePromptSessionKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = window.location.search;
    if (!phaseNeedsUrlUpdate(search, phase)) return;
    pendingPhaseUrlSyncRef.current = phase;
    // Push phase transitions so browser back can move through loop steps.
    setSearchParams(withPhaseInSearch(search, phase), { replace: false });
  }, [phase, setSearchParams]);

  useEffect(() => {
    // Keep local phase state synced when the URL changes (browser/device back).
    if (!requestedPhase || !PHASES.includes(requestedPhase)) return;
    if (requestedPhase === phase) {
      if (pendingPhaseUrlSyncRef.current === requestedPhase) pendingPhaseUrlSyncRef.current = null;
      return;
    }
    // Ignore stale URL values while a phase URL update is still in flight.
    if (pendingPhaseUrlSyncRef.current && requestedPhase !== pendingPhaseUrlSyncRef.current) return;
    setPhase(requestedPhase);
  }, [requestedPhase, phase]);

  useEffect(() => {
    try { window.sessionStorage.setItem(sessionPhaseKey, phase); } catch {}
  }, [phase, sessionPhaseKey]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (calcOpen || padOpen) return;
      const quizPhases = ['diagnostic', 'check-quiz', 'check-quiz-2', 'check-quiz-3', 'check-quiz-4', 'check-quiz-5', 'check-quiz-6', 'check-quiz-7', 'check-quiz-8', 'readiness-quiz', 'mastery-check'];
      if (!quizPhases.includes(phase)) return;
      const key = e.key;
      const quizScope = document.querySelector('.phase-card-enter [data-quiz-block="true"]');
      if (!quizScope) return;
      if (key >= '1' && key <= '4') {
        const targetQ = quizScope.querySelector('.quiz-question[data-hotkey-target="true"]') || quizScope.querySelector('.quiz-question');
        if (!targetQ) return;
        const optBtns = targetQ.querySelectorAll('.quiz-option:not([disabled])');
        const idx = parseInt(key, 10) - 1;
        if (optBtns[idx]) {
          e.preventDefault();
          optBtns[idx].click();
        }
      }
      if (key === 'Enter') {
        const candidates = Array.from(quizScope.parentElement?.querySelectorAll('button[type="button"]:not([disabled])') || []);
        const submitBtn = candidates.find((btn) => (btn.textContent || '').includes('Submit') || (btn.textContent || '').includes('Check'));
        if (submitBtn) {
          e.preventDefault();
          submitBtn.click();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, calcOpen, padOpen]);

  useEffect(() => {
    if (!hasTopic || !loopSessionSeed) return;
    if (shouldOfferBreak(loopSessionSeed, tilesCompleted, 8, 22)) {
      setShowBreakModal(true);
      markBreakOffered(loopSessionSeed);
    }
  }, [hasTopic, tilesCompleted, loopSessionSeed]);

  useEffect(() => flushTelemetryOnExit(), []);

  useEffect(() => {
    if (!hasTopic) return;
    trackEvent('practice_loop_phase_view', { phase, examId, comp, currentStd: currentStd || '' });
  }, [hasTopic, phase, examId, comp, currentStd]);

  useEffect(() => {
    if (!hasTopic) return;
    if (!CONFIDENCE_CHECKIN_TILES.includes(tilesCompleted)) return;
    if (tilesCompleted <= lastCheckInMilestone) return;
    // Non-blocking: surface an optional prompt instead of auto-opening a modal.
    setPendingConfidenceCheckIn(true);
  }, [tilesCompleted, lastCheckInMilestone, hasTopic]);

  useEffect(() => {
    if (showBreakModal && breakModalRef.current) breakModalRef.current.focus();
  }, [showBreakModal]);

  useEffect(() => {
    if (showConfidenceCheckIn && confidenceModalRef.current) confidenceModalRef.current.focus();
  }, [showConfidenceCheckIn]);

  const submitQuiz = (pool, answers, setSubmitted, gameIdSuffix) => {
    setSubmitted(true);
    const elapsed = Date.now() - quizStartTimeRef.current;
    const avgMs = pool.length > 0 ? Math.round(elapsed / pool.length) : 0;
    const prevAvg = prevQuizAvgRef.current;
    prevQuizAvgRef.current = avgMs;
    if (prevAvg != null && prevAvg > 0 && avgMs > 0) {
      const pctFaster = Math.round(((prevAvg - avgMs) / prevAvg) * 100);
      if (pctFaster >= 10) {
        setLastQuizAvgMs(`⚡ ${pctFaster}% faster than your previous quiz`);
      } else if (pctFaster <= -15) {
        setLastQuizAvgMs('Take your time — accuracy matters more than speed');
      } else {
        setLastQuizAvgMs(null);
      }
    } else {
      setLastQuizAvgMs(null);
    }
    const correctCount = pool.filter((q) => answers[q.id] === q.correct).length;
    const accuracy = pool.length > 0 ? correctCount / pool.length : 0;
    const accuracyPct = Math.round(accuracy * 100);
    const quizPhaseKey = QUIZ_SUFFIX_TO_PHASE[gameIdSuffix];
    if (quizPhaseKey) {
      setQuizPhaseScores((prev) => ({ ...prev, [quizPhaseKey]: accuracyPct }));
    }
    trackEvent('practice_loop_quiz_submit', {
      phase: gameIdSuffix,
      examId,
      comp,
      currentStd: currentStd || '',
      total: pool.length,
      correct: correctCount,
      accuracyPct,
    });
    const missedQuestions = pool.filter((q) => answers[q.id] !== q.correct);
    const wrongIds = missedQuestions.map((q) => q.id);
    const topMissFocus = summarizeMathFocus(missedQuestions);
    if (loopReviewKey && wrongIds.length) {
      const weakRes = addWeakQuestionIds(loopReviewKey, wrongIds);
      if (!weakRes.ok) {
        setStorageIssue({
          kind: 'review',
          code: weakRes.code,
          message: weakRes.message,
          recovery: weakRes.recovery,
        });
      }
    }
    const hasMediumCorrect = pool.some((q) => answers[q.id] === q.correct && (q.difficulty === 2 || q.difficulty === 'medium'))
      || (pool.every((q) => q.difficulty !== 2) && correctCount > 0);
    pool.forEach((q) => { if (conceptId) recordResult(conceptId, { correct: answers[q.id] === q.correct, time: 0, gameId: `practice-loop-${gameIdSuffix}` }); });
    const masteryRes = updateMastery(examId, comp, singleTeks, { type: gameIdSuffix === 'diagnostic' ? 'diagnostic' : 'post-quiz', correct: correctCount, total: pool.length, hasMediumCorrect }, currentStd || undefined);
    if (!masteryRes.persist.ok) {
      setStorageIssue({
        kind: 'mastery',
        code: masteryRes.persist.code,
        message: masteryRes.persist.message,
        recovery: masteryRes.recovery,
      });
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setLocalSaveWarning(true);
    }

    if (gameIdSuffix === 'diagnostic' && loopMilestoneKey) {
      const diagPersist = saveSessionDiagnosticPct(loopMilestoneKey, accuracy);
      if (!diagPersist.ok) {
        setStorageIssue({
          kind: 'diagnostic',
          code: diagPersist.code,
          message: diagPersist.message,
          recovery: { loopKey: loopMilestoneKey, pct: accuracy },
        });
      }
      setDiagnosticSessionPct(accuracy);
    }

    if (loopMilestoneKey && hasMediumCorrect) {
      const ms = trySetMilestone(loopMilestoneKey, 'firstMedHard');
      if (ms.applied && ms.persist.ok) {
        setCelebrationToast('First medium-or-tougher correct on this competency — strong milestone.');
      } else if (ms.applied && !ms.persist.ok) {
        setStorageIssue({
          kind: 'milestone',
          code: ms.persist.code,
          message: ms.persist.message,
          recovery: { loopKey: loopMilestoneKey, name: 'firstMedHard' },
        });
      }
    }

    setQuizHistory((prev) => [...prev, {
      phase: gameIdSuffix,
      label: QUIZ_SUFFIX_LABEL[gameIdSuffix] || gameIdSuffix,
      accuracy,
      total: pool.length,
      wrongCount: wrongIds.length,
      topMissFocus,
    }].slice(-12));

    if (accuracy === 1 && pool.length >= 3) {
      fireConfetti({ intensity: 'medium' });
    }

    if (accuracy >= 0.8) {
      setQuizStreak((n) => {
        const next = n + 1;
        if (next >= 3 && !streakMilestoneRef.current) {
          streakMilestoneRef.current = true;
          queueMicrotask(() => setCelebrationToast('Three quizzes at 80%+ in a row — great retention signal.'));
        }
        return next;
      });
      setXpPoints((n) => n + (accuracy === 1 ? 30 : 18));
    } else if (accuracy >= 0.5) {
      setQuizStreak(0);
      setXpPoints((n) => n + 10);
    } else {
      setQuizStreak(0);
      setXpPoints((n) => n + 6);
    }
    if (isAdaptiveDebug) setAdaptiveDebugMessage(`quiz:${gameIdSuffix} accuracy:${Math.round(accuracy * 100)}% support:${supportLevel}`);
  };

  /* ═══════════════════════════════════ RENDER ═══════════════════════════════════ */
  const speedFeedback = lastQuizAvgMs || null;

  const teachingMoveLine = comp ? getTeachingMove(comp) : '';
  const isQuizPhase = QUIZ_PHASES.has(phase);
  const currentTileType = PHASE_TO_TILE_TYPE[phase] || 'quiz';
  const slimDockForSolve = SOLVE_TILE_TYPES.has(currentTileType) && !isLandscapeTight;
  const pageShellStyle = useMemo(() => ({
    minHeight: '100vh',
    background: COLOR.bg,
    padding: isMobile ? (keyboardOpen ? '10px 10px 14px' : '14px 10px 28px') : '24px 16px 40px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  }), [isMobile, keyboardOpen]);
  const pageInnerStyle = useMemo(() => ({
    maxWidth: isMobile ? 860 : 980,
    margin: '0 auto',
  }), [isMobile]);

  if (!validExam) {
    return (
      <div style={pageShellStyle}>
        <div style={pageInnerStyle}>
          <PhaseCard>
            <PhaseHeader badgeColor={COLOR.red} badgeLabel="Unknown exam" title="Exam not found" description={`The exam "${examId}" is not recognised. Please go back and pick a valid test.`} />
            <Link to="/texes-prep" style={BTN_PRIMARY}>Back to TExES Prep</Link>
          </PhaseCard>
        </div>
      </div>
    );
  }

  return (
    <div style={pageShellStyle}>
      <div style={pageInnerStyle}>

        {(!isOnline || localSaveWarning) && hasTopic && (
          <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fcd34d', fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
            {!isOnline ? 'You appear offline — answers still work in this session; progress is saved on this device when storage is available.' : ''}
            {localSaveWarning && isOnline ? 'Connection may be unstable — your work is stored locally in the browser.' : ''}
          </div>
        )}

        {storageIssue && hasTopic && (
          <div
            role="alert"
            style={{
              marginBottom: 12,
              padding: '12px 14px',
              borderRadius: 10,
              background: '#fee2e2',
              border: '1px solid #fecaca',
              fontSize: 13,
              color: '#991b1b',
              lineHeight: 1.5,
            }}
          >
            <strong style={{ display: 'block', marginBottom: 6 }}>Could not save to this device</strong>
            <p style={{ margin: '0 0 10px' }}>
              {storageIssue.code === 'QUOTA_EXCEEDED'
                ? 'Browser storage is full. Free space (clear site data or other sites) and tap Retry.'
                : (storageIssue.message || 'A storage error occurred.')}{' '}
              This step may not have been stored until save succeeds.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleStorageRetry}
                style={{ ...BTN_PRIMARY, background: '#b91c1c', border: '1px solid #991b1b', fontSize: 13 }}
              >
                Retry save
              </button>
              <button
                type="button"
                onClick={() => setStorageIssue(null)}
                style={{
                  fontSize: 13,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: `1px solid ${COLOR.border}`,
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {celebrationToast && (
          <div
            role="status"
            style={{
              position: 'fixed',
              bottom: 24,
              left: 16,
              right: 16,
              maxWidth: 520,
              margin: '0 auto',
              zIndex: 200,
              padding: '14px 18px',
              borderRadius: 12,
              background: '#1e3a5f',
              color: '#f8fafc',
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              border: '1px solid #3b82f6',
            }}
          >
            {celebrationToast}
          </div>
        )}

        {showBreakModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="break-modal-title"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 150,
              background: 'rgba(15, 23, 42, 0.5)',
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'center',
              padding: isMobile ? '12px 10px' : 16,
            }}
          >
            <div ref={breakModalRef} tabIndex={-1} style={{ maxWidth: 400, width: '100%', maxHeight: 'calc(100dvh - 24px)', overflowY: 'auto', marginTop: isMobile ? 10 : 0, padding: isMobile ? 16 : 22, borderRadius: 16, background: '#fff', border: `1px solid ${COLOR.border}`, outline: 'none' }}>
              <h3 id="break-modal-title" style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>Take a short break?</h3>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: COLOR.textSecondary, lineHeight: 1.55 }}>
                You have been in this loop for a while. A 5-minute break often improves focus for the next quizzes.
              </p>
              <button type="button" onClick={() => setShowBreakModal(false)} style={{ ...BTN_PRIMARY, width: '100%' }}>Continue learning</button>
            </div>
          </div>
        )}

        {isAdaptiveDebug && (
          <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: '#111827', color: '#e5e7eb', border: '1px solid #374151', fontSize: 11, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>Adaptive Debug</div>
            <div>phase: {phase} | tiles: {tilesCompleted} | score: {masteryScore}%</div>
            <div>checkFailStreak: {checkQuizFailStreak} | videoReplays: {videoReplayCount}/{MAX_VIDEO_REPLAYS} | readinessRetries: {readinessRetries}</div>
            <div>adaptiveEnabled: {adaptiveEnabledForContext ? 'yes' : 'no'} | exam: {examId} | comp: {comp || 'n/a'} | std: {currentStd || 'n/a'}</div>
            <div>difficultyBias(current): {currentDifficultyBias}</div>
            <div>sourcePool: total {sourcePoolCoverage.total} | easy {sourcePoolCoverage.easy} | medium {sourcePoolCoverage.medium} | hard {sourcePoolCoverage.hard}</div>
            <div>blendedReadiness: {blendedReadiness}% | confIndex: {confidenceIndex ?? 'n/a'}</div>
            <div style={{ color: '#93c5fd' }}>lastDecision: {adaptiveDebugMessage}</div>
          </div>
        )}

        {keyboardOpen && hasTopic && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginBottom: 10,
              padding: '8px 10px',
              borderRadius: 10,
              background: '#eff6ff',
              border: `1px solid ${COLOR.blue}55`,
              color: '#1e3a8a',
              fontSize: 12,
              lineHeight: 1.4,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span aria-hidden>⌨</span>
            <span>Typing mode: header tools are hidden while the keyboard is open.</span>
          </div>
        )}

        {hasTopic && pendingConfidenceCheckIn && !showConfidenceCheckIn && (
          <div
            style={{
              marginBottom: 10,
              padding: '10px 12px',
              borderRadius: 10,
              background: '#eef6ff',
              border: `1px solid ${COLOR.blue}44`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 12, color: '#1e3a8a', fontWeight: 600 }}>
              Quick confidence check-in is ready. Open it when convenient.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowConfidenceCheckIn(true)}
                style={{ ...BTN_PRIMARY, padding: '7px 12px', minHeight: 34, fontSize: 12 }}
              >
                Open check-in
              </button>
              <button
                type="button"
                onClick={() => {
                  setLastCheckInMilestone(tilesCompleted);
                  setPendingConfidenceCheckIn(false);
                }}
                style={{
                  padding: '7px 12px',
                  minHeight: 34,
                  borderRadius: 8,
                  border: `1px solid ${COLOR.border}`,
                  background: '#fff',
                  color: COLOR.textSecondary,
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Later
              </button>
            </div>
          </div>
        )}

        {hasTopic && !keyboardOpen && (
          <div style={{
            position: 'sticky', top: isLandscapeTight ? 0 : (isCompactDock ? (isSmallPhone ? 0 : 2) : 8), zIndex: 20,
            marginBottom: isLandscapeTight ? 8 : (isCompactDock ? 10 : 18),
            padding: isLandscapeTight
              ? (dockCollapsed ? '7px 8px' : '8px 8px')
              : (slimDockForSolve && !dockCollapsed)
                ? (isCompactDock ? '8px 9px' : '9px 12px')
              : (dockCollapsed ? (isCompactDock ? '8px 9px' : '8px 14px') : (isCompactDock ? '9px 9px' : '12px 14px')),
            borderRadius: 14,
            background: COLOR.card, border: `1px solid ${COLOR.border}`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden',
            transition: 'padding 0.2s ease',
          }}>
            {/* Collapsed: compact summary + tile bar */}
            {dockCollapsed && (
              <>
                <button
                  type="button"
                  onClick={() => setDockCollapsed(false)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: isSmallPhone ? '6px 0' : 0, minHeight: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: isSmallPhone ? 'wrap' : 'nowrap', gap: 8, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: COLOR.blue, whiteSpace: isSmallPhone ? 'normal' : 'nowrap' }}>
                      Step {displayPhaseIndex + 1}/{STEPS_PER_CYCLE}
                    </span>
                    {conceptTitle && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: COLOR.textMuted, whiteSpace: isSmallPhone ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conceptTitle} · {masteryScore}%
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: isSmallPhone ? 9 : 10, fontWeight: 700, color: COLOR.textMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>{isSmallPhone ? '▼' : '▼ Details'}</span>
                </button>
                <div style={{ marginTop: 6, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 2 }}>
                  <div style={{ display: 'grid', gap: isSmallPhone ? 1 : 2, alignItems: 'center', gridTemplateColumns: `repeat(${Math.max(1, STEPS_PER_CYCLE)}, minmax(8px, 1fr))`, minWidth: Math.max(isSmallPhone ? 150 : 160, STEPS_PER_CYCLE * (isSmallPhone ? 9 : 10)) }}>
                    {tileProgress.map((t) => {
                      const clickable = t.status === 'done' || t.status === 'passed';
                      return (
                        <div
                          key={t.key}
                          role={clickable ? 'button' : undefined}
                          tabIndex={clickable ? 0 : undefined}
                          aria-label={`${t.name}${clickable ? ', revisit tile' : ''}`}
                          title={`${t.name}${t.pct != null ? ` — ${t.pct}%` : t.status === 'passed' ? ' — done' : t.status === 'current' ? ' — now' : ''}${clickable ? ' (click to revisit)' : ''}`}
                          onClick={clickable ? () => revisitTile(t.key) : undefined}
                          onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') revisitTile(t.key); } : undefined}
                          style={{
                            height: isSmallPhone ? 10 : 9, borderRadius: 4,
                            background: t.color || '#e5e7eb',
                            opacity: t.status === 'future' ? 0.35 : 1,
                            border: t.status === 'current' ? `2px solid ${COLOR.blue}` : '1px solid transparent',
                            cursor: clickable ? 'pointer' : 'default',
                            transition: 'background 0.3s, opacity 0.3s, transform 0.15s',
                          }}
                          onMouseEnter={!isMobile && clickable ? (e) => { e.currentTarget.style.transform = 'scaleY(1.6)'; } : undefined}
                          onMouseLeave={!isMobile && clickable ? (e) => { e.currentTarget.style.transform = 'scaleY(1)'; } : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
                {revisitReturnPhase && (
                  <button
                    onClick={() => {
                      const returnTo = revisitReturnPhase;
                      revisitReturnRef.current = null;
                      setRevisitReturnPhase(null);
                      setDetourFromStep(null);
                      goToPhase(returnTo, { skipProgress: true, _fromRevisitReturn: true });
                    }}
                    style={{
                      marginTop: 6, width: '100%', padding: '5px 0',
                      borderRadius: 8, border: `1.5px solid ${COLOR.blue}`,
                      background: 'transparent', color: COLOR.blue,
                      fontWeight: 700, fontSize: 11, cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = COLOR.blue + '12'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    ← Return to where you left off
                  </button>
                )}
              </>
            )}

            {/* Expanded: full dock */}
            {!dockCollapsed && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isCompactDock ? 6 : 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: isCompactDock ? 'wrap' : 'nowrap', gap: 6, minWidth: 0, fontSize: isCompactDock ? 9 : 10, fontWeight: 800, color: COLOR.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <span aria-hidden>▣</span>
                    <span>Progress</span>
                    {conceptTitle && (
                      <span
                        style={{
                          fontWeight: 700,
                          textTransform: 'none',
                          letterSpacing: 0,
                          color: COLOR.textSecondary,
                          fontSize: isCompactDock ? 10 : 11,
                          whiteSpace: isCompactDock ? 'normal' : 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: isCompactDock ? '100%' : 340,
                        }}
                        title={`Competency: ${conceptTitle}`}
                      >
                        · Competency: {conceptTitle}
                      </span>
                    )}
                  </div>
                  {displayPhaseIndex >= 2 && (
                    <button
                      type="button"
                      onClick={() => setDockCollapsed(true)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: COLOR.textMuted, padding: '6px 8px', minHeight: 34 }}
                    >
                      ▲ Collapse
                    </button>
                  )}
                </div>
                <div style={{ marginBottom: isCompactDock ? 8 : 10 }}>
                  <StepProgress current={displayPhaseIndex} total={STEPS_PER_CYCLE} compact={isCompactDock} smallPhone={isSmallPhone} />
                </div>
                {!isLandscapeTight && !slimDockForSolve && (
                  <div style={{ marginBottom: isCompactDock ? 8 : 10 }}>
                    <MicroGoalBanner phase={phase} whyMatters={whyMattersLine} compact={isCompactDock} smallPhone={isSmallPhone} />
                  </div>
                )}
                {!slimDockForSolve && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: isCompactDock ? 9 : 10, fontWeight: 800, color: COLOR.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <span aria-hidden>◍</span>
                      <span>Performance</span>
                    </div>
                    {conceptTitle && <MasteryBar label={conceptTitle} score={masteryScore} status={masteryStatus} />}
                    {examProgress.total > 0 && examLabel && (
                      <ExamBar
                        label={examLabel}
                        mastered={examProgress.mastered}
                        total={examProgress.total}
                        countLabel={examProgress.mode === 'standards' ? 'competencies (≥85%)' : 'domains mastered'}
                      />
                    )}
                    {compDisplay && (
                      <div style={{ marginTop: 6, fontSize: isCompactDock ? 10 : 11, color: COLOR.textMuted, whiteSpace: isCompactDock ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: isCompactDock ? 1.3 : 1.35, wordBreak: isCompactDock ? 'break-word' : 'normal' }}>
                        {compDisplay}{currentStdObj ? ` · ${currentStdObj.name}` : ''}
                      </div>
                    )}
                  </>
                )}
                {slimDockForSolve && (
                  <div style={{ marginTop: -2, marginBottom: 6, fontSize: isCompactDock ? 10 : 11, color: COLOR.textSecondary, fontWeight: 600 }}>
                    Focus mode: more room to solve this tile.
                  </div>
                )}

                <div style={{ height: 1, background: COLOR.borderLight, margin: isCompactDock ? '8px 0 6px' : '10px 0 8px' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCompactDock ? 4 : 6 }}>
                  <div style={{ fontSize: isCompactDock ? 9 : 10, fontWeight: 800, color: COLOR.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tile Progress</div>
                  <div style={{ fontSize: isCompactDock ? 9 : 10, fontWeight: 700, color: COLOR.textSecondary }}>
                    Step {displayPhaseIndex + 1} / {STEPS_PER_CYCLE}
                  </div>
                </div>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 2 }}>
                  <div style={{ display: 'grid', gap: isCompactDock ? 2 : 3, alignItems: 'center', gridTemplateColumns: `repeat(${Math.max(1, STEPS_PER_CYCLE)}, minmax(10px, 1fr))`, minWidth: Math.max(isCompactDock ? (isSmallPhone ? 170 : 180) : 220, STEPS_PER_CYCLE * (isCompactDock ? (isSmallPhone ? 11 : 12) : 14)) }}>
                    {tileProgress.map((t) => {
                      const clickable = t.status === 'done' || t.status === 'passed';
                      return (
                        <div
                          key={t.key}
                          role={clickable ? 'button' : undefined}
                          tabIndex={clickable ? 0 : undefined}
                          aria-label={`${t.name}${clickable ? ', revisit tile' : ''}`}
                          title={`${t.name}${t.pct != null ? ` — ${t.pct}%` : t.status === 'passed' ? ' — done' : t.status === 'current' ? ' — now' : ''}${clickable ? ' (click to revisit)' : ''}`}
                          onClick={clickable ? () => revisitTile(t.key) : undefined}
                          onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') revisitTile(t.key); } : undefined}
                          style={{
                            height: isCompactDock ? (isSmallPhone ? 12 : 11) : 10,
                            borderRadius: 4,
                            background: t.color || '#e5e7eb',
                            opacity: t.status === 'future' ? 0.35 : 1,
                            border: t.status === 'current' ? `2px solid ${COLOR.blue}` : '1px solid transparent',
                            cursor: clickable ? 'pointer' : 'default',
                            transition: 'background 0.3s, opacity 0.3s, transform 0.15s',
                          }}
                          onMouseEnter={!isMobile && clickable ? (e) => { e.currentTarget.style.transform = 'scaleY(1.6)'; } : undefined}
                          onMouseLeave={!isMobile && clickable ? (e) => { e.currentTarget.style.transform = 'scaleY(1)'; } : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: isCompactDock ? 8 : 10, marginTop: 6, fontSize: isCompactDock ? 9 : 10, fontWeight: 700, color: COLOR.textMuted, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 3, background: COLOR.green, display: 'inline-block' }} /> ≥75%</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 3, background: COLOR.amber, display: 'inline-block' }} /> 45–74%</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 3, background: COLOR.red, display: 'inline-block' }} /> &lt;45%</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 3, background: COLOR.blue, border: '1.5px solid ' + COLOR.blue, display: 'inline-block' }} /> Now</span>
                </div>
                {!isCompactDock && !isLandscapeTight && !slimDockForSolve && (
                  <div style={{ marginTop: 4, fontSize: 10, color: COLOR.textSecondary, fontStyle: 'italic' }}>
                    Click a completed tile to revisit.
                  </div>
                )}
                {revisitReturnPhase && (
                  <button
                    onClick={() => {
                      const returnTo = revisitReturnPhase;
                      revisitReturnRef.current = null;
                      setRevisitReturnPhase(null);
                      setDetourFromStep(null);
                      goToPhase(returnTo, { skipProgress: true, _fromRevisitReturn: true });
                    }}
                    style={{
                      marginTop: 8, width: '100%', padding: isCompactDock ? '8px 0' : '9px 0', minHeight: 40,
                      borderRadius: 8, border: `1.5px solid ${COLOR.blue}`,
                      background: 'transparent', color: COLOR.blue,
                      fontWeight: 700, fontSize: isCompactDock ? 11 : 12, cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = COLOR.blue + '12'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    ← Return to where you left off
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {showSaveProgressModal && (
          <SaveProgressModal
            onClose={() => {
              saveProgressPromptedRef.current = true;
              try { window.sessionStorage.setItem(savePromptSessionKey, '1'); } catch {}
              setShowSaveProgressModal(false);
            }}
            onSignedUp={() => {
              saveProgressPromptedRef.current = true;
              try { window.sessionStorage.setItem(savePromptSessionKey, '1'); } catch {}
              setShowSaveProgressModal(false);
              showAppToast('Progress saved — you can log in from any device.');
              hasExamAccess(examId)
                .then((ok) => { if (ok) setIsPaid(true); })
                .catch(() => {});
            }}
          />
        )}

        {showConfidenceCheckIn && hasTopic && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confidence-checkin-title"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(15, 23, 42, 0.55)',
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'center',
              padding: isMobile ? '12px 10px' : 16,
            }}
          >
            <div
              ref={confidenceModalRef}
              tabIndex={-1}
              style={{
                maxWidth: 440,
                width: '100%',
                borderRadius: 16,
                maxHeight: 'calc(100dvh - 24px)',
                overflowY: 'auto',
                marginTop: isMobile ? 8 : 0,
                padding: isMobile ? '16px 14px' : '24px 22px',
                background: '#fff',
                outline: 'none',
                boxShadow: '0 25px 50px rgba(0,0,0,0.18)',
                border: `1px solid ${COLOR.border}`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: COLOR.blue, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Quick check-in</div>
              <h3 id="confidence-checkin-title" style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800, color: COLOR.text, lineHeight: 1.3 }}>
                How confident do you feel about this topic right now?
              </h3>
              <p style={{ margin: '0 0 18px', fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.55 }}>
                Your answer is private to this session and helps us match videos, quizzes, and interactives to how you feel — not only your last score.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { v: 1, label: 'Not at all confident' },
                  { v: 2, label: 'A little confident' },
                  { v: 3, label: 'Somewhat confident' },
                  { v: 4, label: 'Pretty confident' },
                  { v: 5, label: 'Very confident' },
                ].map(({ v, label }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => recordConfidenceCheckIn(v)}
                    style={{
                      ...BTN_PRIMARY,
                      textAlign: 'left',
                      padding: '12px 16px',
                      minHeight: 44,
                      background: '#f8fafc',
                      color: COLOR.text,
                      border: `1px solid ${COLOR.border}`,
                      boxShadow: 'none',
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${COLOR.borderLight}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLOR.textMuted, marginBottom: 8 }}>Match pace to how you feel</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      const pr = savePacingPreference('support');
                      if (!pr.ok) {
                        setStorageIssue({
                          kind: 'pacing',
                          code: pr.code,
                          message: pr.message,
                          recovery: { pacing: 'support' },
                        });
                        return;
                      }
                      setPacingPref('support');
                      setLastCheckInMilestone(tilesCompleted);
                      setPendingConfidenceCheckIn(false);
                      setShowConfidenceCheckIn(false);
                    }}
                    style={{ ...BTN_PRIMARY, textAlign: 'left', padding: '10px 14px', minHeight: 42, background: '#f1f5f9', color: COLOR.text, border: `1px solid ${COLOR.border}`, boxShadow: 'none', fontSize: 13 }}
                  >
                    I want more support — slower, more explanations
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const pr = savePacingPreference('faster');
                      if (!pr.ok) {
                        setStorageIssue({
                          kind: 'pacing',
                          code: pr.code,
                          message: pr.message,
                          recovery: { pacing: 'faster' },
                        });
                        return;
                      }
                      setPacingPref('faster');
                      setLastCheckInMilestone(tilesCompleted);
                      setPendingConfidenceCheckIn(false);
                      setShowConfidenceCheckIn(false);
                    }}
                    style={{ ...BTN_PRIMARY, textAlign: 'left', padding: '10px 14px', minHeight: 42, background: '#f1f5f9', color: COLOR.text, border: `1px solid ${COLOR.border}`, boxShadow: 'none', fontSize: 13 }}
                  >
                    I feel ready — let me move faster when I can
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLastCheckInMilestone(tilesCompleted);
                  setPendingConfidenceCheckIn(false);
                  setShowConfidenceCheckIn(false);
                }}
                style={{
                  marginTop: 14,
                  width: '100%',
                  padding: '10px',
                  minHeight: 40,
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLOR.textMuted,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Skip for now (we will ask again later)
              </button>
            </div>
          </div>
        )}

        {showEarlyMasteryOffer && phase !== 'mastery-check' && phase !== 'readiness-quiz' && (
          <div style={{ marginBottom: 16, padding: '14px 18px', borderRadius: 12, background: COLOR.successBg, border: `2px solid ${COLOR.successBorder}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLOR.successText, marginBottom: 6 }}>
              You're doing great! Mastery score is {getMasteryScore(examId, comp, singleTeks, currentStd)}%.
            </div>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: COLOR.textSecondary }}>
              You can skip ahead to the Readiness Quiz, or keep practicing for a stronger score.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => { setShowEarlyMasteryOffer(false); goToPhase('readiness-quiz'); }} style={{ ...BTN_PRIMARY, fontSize: 13, padding: '8px 18px' }}>Skip to Readiness Quiz</button>
              <button type="button" onClick={() => setShowEarlyMasteryOffer(false)} style={{ ...BTN_PRIMARY, fontSize: 13, padding: '8px 18px', background: COLOR.borderLight, color: COLOR.textSecondary, border: `1px solid ${COLOR.border}`, boxShadow: 'none' }}>Keep Practicing</button>
            </div>
          </div>
        )}

        {phase === 'paywall' && (
          <PaywallGate
            examId={examId}
            diagnosticScore={diagnosticPctForRecap != null ? Math.round(diagnosticPctForRecap * 100) : undefined}
            onUnlocked={() => {
              setIsPaid(true);
              const pending = pendingPaywallPhaseRef.current;
              pendingPaywallPhaseRef.current = null;
              const nextIdx = Math.min(FREE_TILE_LIMIT, PHASES.length - 1);
              setPhase(pending && PHASES.includes(pending) ? pending : (PHASES[nextIdx] || 'check-quiz-2'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {phase === 'diagnostic' && (
          <QuizBlock
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} speedFeedback={speedFeedback}
            pool={diagnosticPool} answers={diagnosticAnswers} setAnswers={setDiagnosticAnswers}
            submitted={diagnosticSubmitted} setSubmitted={setDiagnosticSubmitted}
            onSubmit={() => submitQuiz(diagnosticPool, diagnosticAnswers, setDiagnosticSubmitted, 'diagnostic')}
            onContinue={() => {
              const correct = diagnosticPool.filter((q) => diagnosticAnswers[q.id] === q.correct).length;
              goToPhaseAfterDiagnostic(correct, diagnosticPool.length);
            }}
            quizLabel={`${getTileLabel('diagnostic', 'Diagnostic')} · ${DIAGNOSTIC_COUNT} questions`}
            quizDesc="Let's see what you already know. Based on your score, we'll personalize the loop for you."
            flaggedIds={flaggedIdSet}
            onToggleFlag={loopReviewKey ? handleToggleLoopFlag : undefined}
            onSkip={() => goToPhase('video')}
          />
        )}

        {phase === 'game' && (
          <GamePhase
            key={revisitSeed}
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase}
            gameLabel={getTileLabel('game', 'Game 1')}
            scopeBadge={gameScopeBadge}
            description="Play a quick game to build skills. Press the green Continue button whenever you're ready to move on."
            gameUrl={gameUrl} gameName={gameDisplayName}
            continueOnly
            scopeDebugText={scopedGameDebugText}
            onSkip={() => goToPhase('check-quiz-2')}
          />
        )}

        {phase === 'micro-teach' && (
          <PhaseCard stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase}>
            <PhaseHeader
              badgeColor={COLOR.purple}
              badgeLabel={getTileLabel('micro-teach', 'Concept lesson')}
              title={hasTopic ? (microConcept?.title || conceptTitle) : null}
              description={!hasTopic ? 'Pick a topic to practice. Start from Test Prep.' : null}
            />
            {hasTopic ? (
              <>
                <div style={{ ...BODY, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(conceptToBulletHtml(microConcept?.conceptText || reminderText || '')) }} />
                {microConcept?.illustrationHtml && (
                  <div style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(microConcept.illustrationHtml) }} />
                )}
                {microConcept?.workedExample && (
                  <div style={{ marginBottom: 16, padding: 14, background: COLOR.successBg, borderRadius: 12, border: `1px solid ${COLOR.successBorder}` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: COLOR.successText, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Worked example</div>
                    <p style={{ margin: 0, fontSize: 15, color: COLOR.green, fontWeight: 600, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(microConcept.workedExample)) }} />
                  </div>
                )}
                {microConcept?.misconception && (
                  <div style={{ marginBottom: 24, padding: 14, background: COLOR.amberBg, borderRadius: 12, border: `1px solid ${COLOR.amberBorder}` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: COLOR.amber, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Watch out</div>
                    <p style={{ margin: 0, fontSize: 14, color: '#92400e', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(microConcept.misconception)) }} />
                  </div>
                )}
                <button type="button" onClick={() => goToPhase('video')} style={BTN_PRIMARY}>Continue</button>
              </>
            ) : (
              <Link to="/texes-prep" style={{ ...BTN_GAME_LINK, marginBottom: 0 }}>TExES Test Prep</Link>
            )}
          </PhaseCard>
        )}

        {phase === 'video' && (
          <PhaseCard stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase}>
            <PhaseHeader
              badgeColor={COLOR.blue}
              badgeLabel={getTileLabel('video', 'Micro-Lesson')}
              title={hasTopic ? (compDomain?.name || lecture?.title || label || teks) : null}
              description={!hasTopic ? 'Pick a topic to start.' : null}
            />
            {hasTopic ? (
              <>
                {(introLecture && comp !== 'comp001') ? (
                  <div style={{ marginBottom: 16 }}>
                    <AnimatedLecture
                      lecture={introLecture}
                      compName={compShort}
                      variant="intro"
                      onDone={() => goToPhase('check-quiz')}
                    />
                  </div>
                ) : introVideoEmbed ? (
                  <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', background: '#000' }}>
                    <iframe title={getTileLabel('video', 'Intro video')} src={introVideoEmbed} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: '100%', aspectRatio: '16/9', border: 'none' }} />
                  </div>
                ) : null}
                {!(introLecture && comp !== 'comp001') && <p style={BODY} dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(reminderText)) }} />}
                <button type="button" onClick={() => goToPhase('check-quiz')} style={BTN_PRIMARY}>Continue</button>
              </>
            ) : (
              <Link to="/texes-prep" style={{ ...BTN_GAME_LINK, marginBottom: 0 }}>TExES Test Prep</Link>
            )}
          </PhaseCard>
        )}

        {phase === 'check-quiz' && (
          <QuizBlock
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} speedFeedback={speedFeedback}
            pool={checkQuizPool} answers={checkQuizAnswers} setAnswers={setCheckQuizAnswers}
            submitted={checkQuizSubmitted} setSubmitted={setCheckQuizSubmitted}
            onSubmit={() => submitQuiz(checkQuizPool, checkQuizAnswers, setCheckQuizSubmitted, 'check')}
            onContinue={() => {
              const c = checkQuizPool.filter((q) => checkQuizAnswers[q.id] === q.correct).length;
              goToPhaseAfterCheckQuiz(c, checkQuizPool.length, 'game', 'check-quiz');
            }}
            quizLabel={`${getTileLabel('check-quiz', 'Short Quiz')} · ${CHECK_QUIZ_COUNT} questions`}
            quizDesc="Quick check after the concept and video."
            flaggedIds={flaggedIdSet}
            onToggleFlag={loopReviewKey ? handleToggleLoopFlag : undefined}
            onSkip={() => goToPhase('game')}
          />
        )}

        {phase === 'activity-1' && <ActivityPhase stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} subject={subject} examId={examId} comp={comp} currentStd={currentStd} mode={getActivityMode(0)} activityIndex={0} seed={revisitSeed} badgeLabel={getTileLabel('activity-1', 'Activity 1')} onComplete={() => goToPhase('check-quiz-3')} />}

        {phase === 'check-quiz-2' && (
          <QuizBlock
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} speedFeedback={speedFeedback}
            pool={checkQuiz2Pool} answers={checkQuiz2Answers} setAnswers={setCheckQuiz2Answers}
            submitted={checkQuiz2Submitted} setSubmitted={setCheckQuiz2Submitted}
            onSubmit={() => submitQuiz(checkQuiz2Pool, checkQuiz2Answers, setCheckQuiz2Submitted, 'check2')}
            onContinue={() => {
              const c = checkQuiz2Pool.filter((q) => checkQuiz2Answers[q.id] === q.correct).length;
              goToPhaseAfterCheckQuiz(c, checkQuiz2Pool.length, 'activity-1', 'check-quiz-2');
            }}
            quizLabel={`${getTileLabel('check-quiz-2', 'Short Quiz')} · ${CHECK_QUIZ_COUNT} questions`}
            quizDesc="Another quick check to reinforce."
            flaggedIds={flaggedIdSet}
            onToggleFlag={loopReviewKey ? handleToggleLoopFlag : undefined}
            onSkip={() => goToPhase('activity-1')}
          />
        )}

        {phase === 'activity-2' && <ActivityPhase stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} subject={subject} examId={examId} comp={comp} currentStd={currentStd} mode={getActivityMode(1)} activityIndex={1} seed={revisitSeed} badgeLabel={getTileLabel('activity-2', 'Activity 2')} onComplete={() => goToPhase('check-quiz-6')} />}

        {phase === 'game2' && (
          <GamePhase
            key={revisitSeed}
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase}
            gameLabel={getTileLabel('game2', 'Game 2')}
            scopeBadge={gameScopeBadge}
            description="A different game to reinforce what you've learned so far."
            gameUrl={game2Url} gameName={game2DisplayName}
            scopeDebugText={scopedGameDebugText}
            onSkip={() => goToPhase('check-quiz-5')}
          />
        )}

        {phase === 'activity-3' && <ActivityPhase stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} subject={subject} examId={examId} comp={comp} currentStd={currentStd} mode={getActivityMode(2)} activityIndex={2} seed={revisitSeed} badgeLabel={getTileLabel('activity-3', 'Activity 3')} onComplete={() => goToPhase('game4')} />}

        {phase === 'check-quiz-3' && (
          <QuizBlock
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} speedFeedback={speedFeedback}
            pool={checkQuiz3Pool} answers={checkQuiz3Answers} setAnswers={setCheckQuiz3Answers}
            submitted={checkQuiz3Submitted} setSubmitted={setCheckQuiz3Submitted}
            onSubmit={() => submitQuiz(checkQuiz3Pool, checkQuiz3Answers, setCheckQuiz3Submitted, 'check3')}
            onContinue={() => {
              const c = checkQuiz3Pool.filter((q) => checkQuiz3Answers[q.id] === q.correct).length;
              goToPhaseAfterCheckQuiz(c, checkQuiz3Pool.length, 'concept-refresh', 'check-quiz-3');
            }}
            quizLabel={`${getTileLabel('check-quiz-3', 'Short Quiz')} · ${CHECK_QUIZ_COUNT} questions`}
            quizDesc="Quick check before continuing."
            flaggedIds={flaggedIdSet}
            onToggleFlag={loopReviewKey ? handleToggleLoopFlag : undefined}
            onSkip={() => goToPhase('concept-refresh')}
          />
        )}

        {phase === 'activity-4' && <ActivityPhase stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} subject={subject} examId={examId} comp={comp} currentStd={currentStd} mode={getActivityMode(3)} activityIndex={3} seed={revisitSeed} badgeLabel={getTileLabel('activity-4', 'Activity 4')} onComplete={() => goToPhase('concept-refresh')} />}

        {phase === 'concept-refresh' && (
          <PhaseCard stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase}>
            <PhaseHeader
              badgeColor={COLOR.purple}
              badgeLabel={getTileLabel('concept-refresh', useGeometricRefreshActivity ? 'Interactive recap' : 'Concept recap')}
              title={hasTopic ? (useGeometricRefreshActivity ? 'Geometric Sequence Challenge' : (conceptRefreshConcept?.title || conceptTitle || 'Key idea')) : null}
            />
            {hasTopic ? (
              useGeometricRefreshActivity ? (
                <ReasoningExplorer
                  modeOverride="pattern-finder"
                  forcePatternType="geometric"
                  embedded
                  badgeLabel={getTileLabel('concept-refresh', 'Interactive recap')}
                  continueLabel="Continue"
                  onComplete={() => {
                    const dest = (conceptRefreshReturnPhase && conceptRefreshReturnPhase !== 'concept-refresh')
                      ? conceptRefreshReturnPhase
                      : 'check-quiz-4';
                    setConceptRefreshReturnPhase(null);
                    setDetourFromStep(null);
                    goToPhase(dest);
                  }}
                />
              ) : (
                <>
                  <div style={{ ...BODY, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(conceptToBulletHtml(conceptRefreshConcept?.conceptText || reminderText || '')) }} />
                  {conceptRefreshConcept?.illustrationHtml && (
                    <div style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(conceptRefreshConcept.illustrationHtml) }} />
                  )}
                  <button type="button" onClick={() => { const dest = (conceptRefreshReturnPhase && conceptRefreshReturnPhase !== 'concept-refresh') ? conceptRefreshReturnPhase : 'check-quiz-4'; setConceptRefreshReturnPhase(null); setDetourFromStep(null); goToPhase(dest); }} style={BTN_PRIMARY}>Continue</button>
                </>
              )
            ) : (
              <button type="button" onClick={() => { const dest = (conceptRefreshReturnPhase && conceptRefreshReturnPhase !== 'concept-refresh') ? conceptRefreshReturnPhase : 'check-quiz-4'; setConceptRefreshReturnPhase(null); setDetourFromStep(null); goToPhase(dest); }} style={BTN_PRIMARY}>Continue</button>
            )}
          </PhaseCard>
        )}

        {phase === 'activity-5' && <ActivityPhase stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} subject={subject} examId={examId} comp={comp} currentStd={currentStd} mode={getActivityMode(4)} activityIndex={4} seed={revisitSeed} badgeLabel={getTileLabel('activity-5', 'Activity 5')} onComplete={() => goToPhase('check-quiz-4')} />}

        {phase === 'check-quiz-4' && (
          <QuizBlock
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} speedFeedback={speedFeedback}
            pool={checkQuiz4Pool} answers={checkQuiz4Answers} setAnswers={setCheckQuiz4Answers}
            submitted={checkQuiz4Submitted} setSubmitted={setCheckQuiz4Submitted}
            onSubmit={() => submitQuiz(checkQuiz4Pool, checkQuiz4Answers, setCheckQuiz4Submitted, 'check4')}
            onContinue={() => {
              const c = checkQuiz4Pool.filter((q) => checkQuiz4Answers[q.id] === q.correct).length;
              goToPhaseAfterCheckQuiz(c, checkQuiz4Pool.length, 'game2', 'check-quiz-4');
            }}
            quizLabel={`${getTileLabel('check-quiz-4', 'Short Quiz')} · ${CHECK_QUIZ_COUNT} questions`}
            quizDesc="Another check after the concept recap."
            flaggedIds={flaggedIdSet}
            onToggleFlag={loopReviewKey ? handleToggleLoopFlag : undefined}
            onSkip={() => goToPhase('game2')}
          />
        )}

        {phase === 'activity-6' && <ActivityPhase stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} subject={subject} examId={examId} comp={comp} currentStd={currentStd} mode={getActivityMode(5)} activityIndex={5} seed={revisitSeed} badgeLabel={getTileLabel('activity-6', 'Activity 6')} onComplete={() => goToPhase('game3')} />}

        {phase === 'game3' && (
          <GamePhase
            key={revisitSeed}
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase}
            gameLabel={getTileLabel('game3', 'Game 3')}
            scopeBadge={gameScopeBadge}
            description="Switch it up with another game to keep practicing."
            gameUrl={game3Url} gameName={game3DisplayName}
            scopeDebugText={scopedGameDebugText}
            onSkip={() => goToPhase('check-quiz-8')}
          />
        )}

        {phase === 'check-quiz-8' && (
          <QuizBlock
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} speedFeedback={speedFeedback}
            pool={checkQuiz8Pool} answers={checkQuiz8Answers} setAnswers={setCheckQuiz8Answers}
            submitted={checkQuiz8Submitted} setSubmitted={setCheckQuiz8Submitted}
            onSubmit={() => submitQuiz(checkQuiz8Pool, checkQuiz8Answers, setCheckQuiz8Submitted, 'check8')}
            onContinue={() => {
              const c = checkQuiz8Pool.filter((q) => checkQuiz8Answers[q.id] === q.correct).length;
              goToPhaseAfterCheckQuiz(c, checkQuiz8Pool.length, 'activity-3', 'check-quiz-8');
            }}
            quizLabel={`${getTileLabel('check-quiz-8', 'Short Quiz')} · ${CHECK_QUIZ_COUNT} questions`}
            quizDesc="Final short quiz before the last interactive tile."
            flaggedIds={flaggedIdSet}
            onToggleFlag={loopReviewKey ? handleToggleLoopFlag : undefined}
            onSkip={() => goToPhase('activity-3')}
          />
        )}

        {phase === 'activity-7' && <ActivityPhase stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} subject={subject} examId={examId} comp={comp} currentStd={currentStd} mode={getActivityMode(6)} activityIndex={6} seed={revisitSeed} badgeLabel={getTileLabel('activity-7', 'Activity 7')} onComplete={() => goToPhase('check-quiz-5')} />}

        {phase === 'check-quiz-5' && (
          <QuizBlock
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} speedFeedback={speedFeedback}
            pool={checkQuiz5Pool} answers={checkQuiz5Answers} setAnswers={setCheckQuiz5Answers}
            submitted={checkQuiz5Submitted} setSubmitted={setCheckQuiz5Submitted}
            onSubmit={() => submitQuiz(checkQuiz5Pool, checkQuiz5Answers, setCheckQuiz5Submitted, 'check5')}
            onContinue={() => {
              const c = checkQuiz5Pool.filter((q) => checkQuiz5Answers[q.id] === q.correct).length;
              goToPhaseAfterCheckQuiz(c, checkQuiz5Pool.length, 'activity-2', 'check-quiz-5');
            }}
            quizLabel={`${getTileLabel('check-quiz-5', 'Short Quiz')} · ${CHECK_QUIZ_COUNT} questions`}
            quizDesc="Quick check before the next activity."
            flaggedIds={flaggedIdSet}
            onToggleFlag={loopReviewKey ? handleToggleLoopFlag : undefined}
            onSkip={() => goToPhase('activity-2')}
          />
        )}

        {phase === 'activity-8' && <ActivityPhase stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} subject={subject} examId={examId} comp={comp} currentStd={currentStd} mode={getActivityMode(7, 'intercept')} activityIndex={7} seed={revisitSeed} badgeLabel={getTileLabel('activity-8', 'Activity 8')} onComplete={() => goToPhase('video-2')} />}

        {phase === 'video-2' && (
          <PhaseCard stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase}>
            <PhaseHeader
              badgeColor={COLOR.blue}
              badgeLabel={getTileLabel('video-2', 'Deep Dive Lesson')}
              title={hasTopic ? (compDomain?.name || lecture?.title || label || teks) : null}
              description={!hasTopic ? 'Pick a topic to start.' : null}
            />
            {hasTopic ? (
              <>
                {hasUniqueDeepDiveLecture ? (
                  <div style={{ marginBottom: 16 }}>
                    <AnimatedLecture
                      lecture={deepDiveLecture}
                      compName={compShort}
                      variant="deep-dive"
                      onDone={() => goToPhase('check-quiz-7')}
                    />
                  </div>
                ) : deepDiveVideoEmbed ? (
                  <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', background: '#000' }}>
                    <iframe title={getTileLabel('video-2', 'Deep dive video')} src={deepDiveVideoEmbed} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: '100%', aspectRatio: '16/9', border: 'none' }} />
                  </div>
                ) : showNumberSetsActivity ? (
                  <NumberSetsChallenge onContinue={() => goToPhase('check-quiz-7')} />
                ) : (
                  <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#eef2ff', border: `1px solid ${COLOR.blue}55`, fontSize: 13, color: '#1e3a8a', lineHeight: 1.5 }}>
                    No second unique video for this competency right now, so this tile gives you a different recap angle instead of repeating the same clip.
                  </div>
                )}
                {!hasUniqueDeepDiveLecture && !showNumberSetsActivity && (
                  <div style={BODY} dangerouslySetInnerHTML={{ __html: sanitizeHtml(conceptToBulletHtml(conceptRefreshConcept?.conceptText || reminderText || '')) }} />
                )}
                {!showNumberSetsActivity && <button type="button" onClick={() => goToPhase('check-quiz-7')} style={BTN_PRIMARY}>Continue</button>}
              </>
            ) : (
              <button type="button" onClick={() => goToPhase('check-quiz-7')} style={BTN_PRIMARY}>Continue</button>
            )}
          </PhaseCard>
        )}

        {phase === 'check-quiz-7' && (
          <QuizBlock
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} speedFeedback={speedFeedback}
            pool={checkQuiz7Pool} answers={checkQuiz7Answers} setAnswers={setCheckQuiz7Answers}
            submitted={checkQuiz7Submitted} setSubmitted={setCheckQuiz7Submitted}
            onSubmit={() => submitQuiz(checkQuiz7Pool, checkQuiz7Answers, setCheckQuiz7Submitted, 'check7')}
            onContinue={() => {
              const c = checkQuiz7Pool.filter((q) => checkQuiz7Answers[q.id] === q.correct).length;
              goToPhaseAfterCheckQuiz(c, checkQuiz7Pool.length, 'game3', 'check-quiz-7');
            }}
            quizLabel={`${getTileLabel('check-quiz-7', 'Short Quiz')} · ${CHECK_QUIZ_COUNT} questions`}
            quizDesc="Short check after Video B."
            flaggedIds={flaggedIdSet}
            onToggleFlag={loopReviewKey ? handleToggleLoopFlag : undefined}
            onSkip={() => goToPhase('game3')}
          />
        )}

        {phase === 'activity-9' && <ActivityPhase stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} subject={subject} examId={examId} comp={comp} currentStd={currentStd} mode={getActivityMode(8, 'y-intercept-read')} activityIndex={8} seed={revisitSeed} badgeLabel={getTileLabel('activity-9', 'Activity 9')} onComplete={() => goToPhase('game4')} />}

        {phase === 'game4' && (
          <GamePhase
            key={revisitSeed}
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase}
            gameLabel={getTileLabel('game4', 'Game 4')}
            scopeBadge={gameScopeBadge}
            description="One last game for retention before the final stretch."
            gameUrl={game4Url} gameName={game4DisplayName}
            scopeDebugText={scopedGameDebugText}
            onSkip={() => goToPhase('readiness-quiz')}
          />
        )}

        {phase === 'activity-10' && <ActivityPhase stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} subject={subject} examId={examId} comp={comp} currentStd={currentStd} mode={getActivityMode(9)} activityIndex={9} seed={revisitSeed} badgeLabel={getTileLabel('activity-10', 'Activity 10')} onComplete={() => goToPhase('check-quiz-6')} />}

        {phase === 'check-quiz-6' && (
          <QuizBlock
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} speedFeedback={speedFeedback}
            pool={checkQuiz6Pool} answers={checkQuiz6Answers} setAnswers={setCheckQuiz6Answers}
            submitted={checkQuiz6Submitted} setSubmitted={setCheckQuiz6Submitted}
            onSubmit={() => submitQuiz(checkQuiz6Pool, checkQuiz6Answers, setCheckQuiz6Submitted, 'check6')}
            onContinue={() => {
              const c = checkQuiz6Pool.filter((q) => checkQuiz6Answers[q.id] === q.correct).length;
              goToPhaseAfterCheckQuiz(c, checkQuiz6Pool.length, 'video-2', 'check-quiz-6');
            }}
            quizLabel={`${getTileLabel('check-quiz-6', 'Short Quiz')} · ${CHECK_QUIZ_COUNT} questions`}
            quizDesc="Final check before mastery assessment."
            flaggedIds={flaggedIdSet}
            onToggleFlag={loopReviewKey ? handleToggleLoopFlag : undefined}
            onSkip={() => goToPhase('video-2')}
          />
        )}

        {phase === 'activity-11' && <ActivityPhase stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} subject={subject} examId={examId} comp={comp} currentStd={currentStd} mode={getActivityMode(10)} activityIndex={10} seed={revisitSeed} badgeLabel={getTileLabel('activity-11', 'Activity 11')} onComplete={() => goToPhase('mastery-check')} />}

        {phase === 'readiness-quiz' && (
          <QuizBlock
            stepIndex={displayPhaseIndex} totalSteps={STEPS_PER_CYCLE} phaseKey={phase} speedFeedback={speedFeedback}
            pool={readinessPool} answers={readinessAnswers} setAnswers={setReadinessAnswers}
            submitted={readinessSubmitted} setSubmitted={setReadinessSubmitted}
            onSubmit={() => submitQuiz(readinessPool, readinessAnswers, setReadinessSubmitted, 'readiness')}
            onContinue={() => {
              const correct = readinessPool.filter((q) => readinessAnswers[q.id] === q.correct).length;
              goToPhaseAfterReadiness(correct, readinessPool, readinessAnswers);
            }}
            quizLabel={`${getTileLabel('readiness-quiz', 'Readiness Quiz')} · ${READINESS_COUNT} questions${readinessRetries > 0 ? ` (attempt ${readinessRetries + 1})` : ''}`}
            quizDesc={readinessRetries > 0
              ? "Let's try again after that review. You need to pass to unlock the Mastery Test."
              : "One final readiness check before the mastery test. You need to pass to continue."}
            flaggedIds={flaggedIdSet}
            onToggleFlag={loopReviewKey ? handleToggleLoopFlag : undefined}
            onSkip={ADAPTIVE.readinessGating?.enabled ? undefined : () => goToPhase('mastery-check')}
          />
        )}

        {phase === 'mastery-check' && (
          <>
            {!masterySubmitted ? (
              <QuizBlock
                pool={masteryPool} answers={masteryAnswers} setAnswers={setMasteryAnswers}
                submitted={masterySubmitted} setSubmitted={setMasterySubmitted}
                onSubmit={() => submitQuiz(masteryPool, masteryAnswers, setMasterySubmitted, 'mastery')}
                onContinue={() => setMasterySubmitted(true)}
                quizLabel={`${getTileLabel('mastery-check', 'Mastery Test')} · ${MASTERY_COUNT} questions`}
                quizDesc="Show what you've learned! Answer these to demonstrate mastery."
                flaggedIds={flaggedIdSet}
                onToggleFlag={loopReviewKey ? handleToggleLoopFlag : undefined}
              />
            ) : (
              <>
                <PhaseCard>
                  <PhaseBadge color={COLOR.green}>Mastery Results</PhaseBadge>
                  <h2 style={HEADING}>Results</h2>
                  {masteryPool.map((q, qi) => {
                    const userAns = masteryAnswers[q.id];
                    const correct = userAns === q.correct;
                    return (
                      <div key={q.id} style={{ marginBottom: 16, padding: 14, borderRadius: 10, background: correct ? COLOR.successBg : COLOR.redBg, border: `1px solid ${correct ? COLOR.successBorder : '#fca5a5'}` }}>
                        <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 14, color: COLOR.text }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(`Q${qi+1}: ${q.question}`)) }} />
                        <p style={{ margin: '0 0 4px', fontSize: 13, color: correct ? COLOR.green : COLOR.red }}>
                          Your answer: {userAns || '(none)'} {correct ? '✓' : '✗'}
                        </p>
                        {!correct && <p style={{ margin: '0 0 4px', fontSize: 13, color: COLOR.green, fontWeight: 600 }}>Correct: {q.correct}</p>}
                        {q.explanation && <p style={{ margin: '4px 0 0', fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.5 }}>{q.explanation}</p>}
                      </div>
                    );
                  })}
                </PhaseCard>
                <MasteryScreen
                  conceptTitle={conceptTitle}
                  teks={teks}
                  grade={grade}
                  comp={comp}
                  examId={examId}
                  label={label}
                  currentStd={currentStd}
                  sessionSummary={sessionSummary}
                  effortStats={{ tilesCompleted, quizCheckpoints: quizHistory.length }}
                  diagnosticSessionPct={diagnosticPctForRecap}
                  lastCheckpointPct={lastCheckpointBeforeMastery}
                  teachingMove={teachingMoveLine}
                  shareUrl={shareUrlForPartner}
                  shareTitle={`${conceptTitle} — QuantegyAI loop complete`}
                  loopKeyForReflection={loopReviewKey}
                  loopCompleteBanner
                  onFinalConfidenceCheckIn={recordConfidenceCheckIn}
                />
              </>
            )}
          </>
        )}

        {phaseRawIdx < 0 && phase !== 'mastery-check' && (
          <PhaseCard>
            <PhaseHeader badgeColor={COLOR.red} badgeLabel="Unknown step" description="This step is not recognised. Returning to the beginning of the loop." />
            <button
              type="button"
              onClick={() => {
                clearQuizProgressState();
                setPhase(PHASES[0] || 'diagnostic');
              }}
              style={BTN_PRIMARY}
            >
              Restart loop
            </button>
          </PhaseCard>
        )}

        {hasTopic && showSecondaryPanels && !keyboardOpen && (!focusMode || showFocusTools) && (
          <div style={{ marginTop: isMobile ? 12 : 24, padding: isMobile ? '12px 12px' : '14px 18px', borderRadius: 12, background: '#f8fafc', border: `1px solid ${COLOR.border}` }}>
            <button
              type="button"
              onClick={() => setCoachExpanded((v) => !v)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: isSmallPhone ? 'flex-start' : 'center', flexWrap: isSmallPhone ? 'wrap' : 'nowrap', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 36 }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: COLOR.blue, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {coachExpanded ? '▼' : '▶'} Learning Coach
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, textAlign: isSmallPhone ? 'left' : 'right' }}>
                XP {xpPoints} · Streak {quizStreak}{quizStreak >= 3 ? ' · On Fire' : ''}
              </div>
            </button>
            {coachExpanded && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 14, color: COLOR.text, lineHeight: 1.6 }}>{coachMessage}</div>
                {coachAdaptiveNote && (
                  <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: '#eef2ff', border: `1px solid ${COLOR.blue}40`, fontSize: 13, color: '#312e81', lineHeight: 1.55 }}>
                    <strong style={{ display: 'block', marginBottom: 4, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: COLOR.blue }}>Why the path shifted</strong>
                    {coachAdaptiveNote}
                  </div>
                )}
                <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: COLOR.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pacing preference</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {[
                    { id: 'support', label: 'More support' },
                    { id: 'balanced', label: 'Balanced' },
                    { id: 'faster', label: 'Faster' },
                  ].map(({ id, label: pl }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        const pr = savePacingPreference(id);
                        if (!pr.ok) {
                          setStorageIssue({
                            kind: 'pacing',
                            code: pr.code,
                            message: pr.message,
                            recovery: { pacing: id },
                          });
                          return;
                        }
                        setPacingPref(id);
                      }}
                      aria-pressed={pacingPref === id}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: `1px solid ${pacingPref === id ? COLOR.blue : COLOR.border}`,
                        background: pacingPref === id ? '#dbeafe' : '#fff',
                        color: COLOR.text,
                        cursor: 'pointer',
                      }}
                    >
                      {pl}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: COLOR.textMuted }}>
                  Readiness blend: {blendedReadiness}%
                  {confidenceIndex != null && ` · Confidence signal: ${confidenceIndex}%`}
                  {quizHistory.length > 0 && ` · Quiz trend: ${recentQuizAccuracy}%`}
                  {' · '}
                  Support: {supportLevel.replace(/-/g, ' ')}
                </div>
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${COLOR.borderLight}` }}>
                  <button
                    type="button"
                    onClick={() => setPracticeSwitchOpen((v) => !v)}
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 800, color: COLOR.blue, textTransform: 'uppercase', letterSpacing: '0.05em', padding: 0 }}
                  >
                    {practiceSwitchOpen ? '▼' : '▶'} Practice your way (switch competency anytime)
                  </button>
                  {practiceSwitchOpen && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ marginBottom: 6, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.45 }}>
                        Pick any competency and choose where to start: video, lesson, interactive, game, quiz, readiness, or mastery.
                      </div>
                      <label style={{ display: 'block', marginBottom: 4, fontSize: 11, fontWeight: 700, color: COLOR.textMuted }}>Competency</label>
                      <select
                        value={practiceCompKey}
                        onChange={(e) => setPracticeCompKey(e.target.value)}
                        style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${COLOR.border}`, fontSize: 12, fontFamily: 'inherit' }}
                      >
                        {practiceCompChoices.map((choice) => (
                          <option key={choice.key} value={choice.key}>{choice.label}</option>
                        ))}
                      </select>
                      <label style={{ display: 'block', marginBottom: 4, fontSize: 11, fontWeight: 700, color: COLOR.textMuted }}>Start with</label>
                      <select
                        value={practiceStartId}
                        onChange={(e) => setPracticeStartId(e.target.value)}
                        style={{ width: '100%', marginBottom: 10, padding: '8px 10px', borderRadius: 8, border: `1px solid ${COLOR.border}`, fontSize: 12, fontFamily: 'inherit' }}
                      >
                        {LOOP_START_OPTIONS.map((option) => (
                          <option key={`mid-loop-start-${option.id}`} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                      {practiceSwitchUrl && (
                        <Link to={practiceSwitchUrl} style={{ ...BTN_GAME_LINK, marginBottom: 0 }}>
                          Start selected practice →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {hasTopic && focusMode && !keyboardOpen && !showFocusTools && (
          <div style={{ marginBottom: 12, padding: isMobile ? '10px 12px' : '10px 14px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${COLOR.border}` }}>
            <button
              type="button"
              onClick={() => setShowFocusTools(true)}
              style={{
                width: '100%',
                minHeight: 38,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left',
                color: COLOR.textSecondary,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span>Focus mode is on — loop tile first.</span>
              <span style={{ color: COLOR.blue }}>Show tools</span>
            </button>
          </div>
        )}

        {hasTopic && showSecondaryPanels && !keyboardOpen && (!focusMode || showFocusTools) && (
          <div style={{ marginBottom: 14, borderRadius: 12, background: COLOR.card, border: `1px solid ${COLOR.border}`, overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setStudyNavOpen(o => !o)}
              aria-expanded={studyNavOpen}
              style={{ width: '100%', padding: isMobile ? '12px 12px' : '10px 14px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', minHeight: 42 }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLOR.textMuted }}>
                Study Navigation & Goals
              </div>
              <span style={{ fontSize: 12, color: COLOR.textMuted }}>{studyNavOpen ? '▲' : '▼'}</span>
            </button>
            {studyNavOpen && (
              <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${COLOR.borderLight}` }}>
                {focusMode && (
                  <div style={{ margin: '10px 0 12px' }}>
                    <button
                      type="button"
                      onClick={() => setShowFocusTools(false)}
                      style={{
                        width: '100%',
                        minHeight: 36,
                        borderRadius: 8,
                        border: `1px solid ${COLOR.border}`,
                        background: '#fff',
                        color: COLOR.textSecondary,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Hide tools and return to loop focus
                    </button>
                  </div>
                )}
                {examId === 'math712' && (
                  <div style={{ marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => setGoalsPanelOpen((o) => !o)}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 800, color: COLOR.blue, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      {goalsPanelOpen ? '▼' : '▶'} Your goals (exam date & focus domain)
                    </button>
                    {goalsPanelOpen && (
                      <div style={{ marginTop: 12 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Target exam or study date</label>
                        <input
                          type="date"
                          value={learningGoals.examDate}
                          onChange={(e) => setLearningGoals((g) => ({ ...g, examDate: e.target.value }))}
                          style={{ width: '100%', padding: 8, borderRadius: 8, border: `1px solid ${COLOR.border}`, marginBottom: 10 }}
                        />
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Weakest domain to prioritize</label>
                        <select
                          value={learningGoals.focusCompId}
                          onChange={(e) => setLearningGoals((g) => ({ ...g, focusCompId: e.target.value }))}
                          style={{ width: '100%', padding: 8, borderRadius: 8, border: `1px solid ${COLOR.border}`, marginBottom: 10 }}
                        >
                          <option value="">— None selected —</option>
                          {domains.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const r = saveLearningGoals(learningGoals);
                            if (!r.ok) {
                              setStorageIssue({
                                kind: 'goals',
                                code: r.code,
                                message: r.message,
                                recovery: { goals: { ...learningGoals } },
                              });
                              return;
                            }
                            setGoalsPanelOpen(false);
                          }}
                          style={{ ...BTN_PRIMARY, fontSize: 13, padding: '8px 16px' }}
                        >
                          Save goals
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <CompetencyRoadmap
                  domains={domains}
                  currentComp={comp}
                  currentStd={currentStd}
                  examId={examId}
                  grade={grade}
                  label={label}
                  expanded={roadmapExpanded}
                  onToggle={() => setRoadmapExpanded((v) => !v)}
                />

                {examId === 'math712' && (
                  <div style={{ marginBottom: 8, marginTop: 12, textAlign: 'center' }}>
                    <Link
                      to="/math-712-learning-path"
                      style={{ fontSize: 13, fontWeight: 700, color: COLOR.blue, textDecoration: 'none' }}
                    >
                      ← Full learning path (all 21 competencies)
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Floating student toolbar: calculator + scratch pad */}
      <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 9998, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setPadOpen((o) => !o)}
          aria-label={padOpen ? 'Close scratch pad' : 'Open scratch pad'}
          style={{
            height: 44, borderRadius: 22, padding: '0 16px 0 12px',
            background: padOpen ? '#1e293b' : '#6d28d9', color: '#fff',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
        >
          {padOpen ? '\u2715' : '\u270F\uFE0F'} Scratch Pad
        </button>
        {calcType && (
          <button
            type="button"
            onClick={() => setCalcOpen((o) => !o)}
            aria-label={calcOpen ? 'Close calculator' : 'Open calculator'}
            style={{
              height: 44, borderRadius: 22, padding: '0 16px 0 12px',
              background: calcOpen ? '#1e293b' : '#2563eb', color: '#fff',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {calcOpen ? '\u2715' : '\uD83D\uDDA9'}{' '}
            {{ graphing: 'TI-84', scientific: 'Scientific', basic: 'Calc' }[calcType] || 'Calc'}
          </button>
        )}
      </div>
      <ScratchPad open={padOpen} onClose={() => setPadOpen(false)} />
      {calcType && <Calculator mode={calcType} open={calcOpen} onClose={() => setCalcOpen(false)} />}
    </div>
  );
}
