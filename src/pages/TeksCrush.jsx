import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import qbotImg from '../assets/qbot.svg';

const COLS = 5;
const ROWS = 4;
const TILE_GAP = 6;
const SWAP_DURATION = 200;
const FALL_DURATION = 250;
const MATCH_FLASH = 350;
const DEFAULT_DIFFICULTY = 'medium';
const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];
const DIFFICULTY_PRESETS = {
  easy: {
    startingMoves: 28,
    targetBase: 340,
    targetStep: 190,
    levelMoveBonus: 7,
    bigMatchThreshold: 5,
    scorePerTile: 13,
    comboStep: 0.65,
  },
  medium: {
    startingMoves: 24,
    targetBase: 380,
    targetStep: 220,
    levelMoveBonus: 6,
    bigMatchThreshold: 6,
    scorePerTile: 12,
    comboStep: 0.6,
  },
  hard: {
    startingMoves: 20,
    targetBase: 430,
    targetStep: 260,
    levelMoveBonus: 5,
    bigMatchThreshold: 7,
    scorePerTile: 11,
    comboStep: 0.55,
  },
};

const SUPERSCRIPT_MAP = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼',
  '(': '⁽', ')': '⁾',
  a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ',
  j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ',
  t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ',
  A: 'ᴬ', B: 'ᴮ', D: 'ᴰ', E: 'ᴱ', G: 'ᴳ', H: 'ᴴ', I: 'ᴵ', J: 'ᴶ', K: 'ᴷ',
  L: 'ᴸ', M: 'ᴹ', N: 'ᴺ', O: 'ᴼ', P: 'ᴾ', R: 'ᴿ', T: 'ᵀ', U: 'ᵁ', V: 'ⱽ', W: 'ᵂ',
};

const TILE_COLORS = [
  { bg: 'linear-gradient(145deg, rgba(59,130,246,0.28), rgba(30,64,175,0.28))', border: 'rgba(96,165,250,0.55)', glow: 'rgba(59,130,246,0.42)' },
  { bg: 'linear-gradient(145deg, rgba(16,185,129,0.28), rgba(5,150,105,0.28))', border: 'rgba(52,211,153,0.55)', glow: 'rgba(16,185,129,0.42)' },
  { bg: 'linear-gradient(145deg, rgba(245,158,11,0.28), rgba(217,119,6,0.28))', border: 'rgba(251,191,36,0.55)', glow: 'rgba(245,158,11,0.42)' },
  { bg: 'linear-gradient(145deg, rgba(236,72,153,0.28), rgba(190,24,93,0.28))', border: 'rgba(244,114,182,0.55)', glow: 'rgba(236,72,153,0.42)' },
  { bg: 'linear-gradient(145deg, rgba(139,92,246,0.28), rgba(109,40,217,0.28))', border: 'rgba(167,139,250,0.55)', glow: 'rgba(139,92,246,0.42)' },
  { bg: 'linear-gradient(145deg, rgba(20,184,166,0.28), rgba(13,148,136,0.28))', border: 'rgba(45,212,191,0.55)', glow: 'rgba(20,184,166,0.42)' },
];

const EXPLOSION_PARTICLES = [
  { dx: '-18px', dy: '-16px', c: '#f59e0b', d: '0ms' },
  { dx: '0px', dy: '-22px', c: '#f43f5e', d: '30ms' },
  { dx: '18px', dy: '-16px', c: '#22d3ee', d: '60ms' },
  { dx: '20px', dy: '2px', c: '#a78bfa', d: '90ms' },
  { dx: '12px', dy: '18px', c: '#34d399', d: '120ms' },
  { dx: '-12px', dy: '18px', c: '#60a5fa', d: '150ms' },
  { dx: '-20px', dy: '2px', c: '#f97316', d: '180ms' },
];

function toSuperscript(value) {
  return String(value).split('').map((ch) => SUPERSCRIPT_MAP[ch] ?? ch).join('');
}

function formatExpressionMath(expression) {
  return String(expression)
    .replace(/\^\(([^)]+)\)/g, (_, exp) => toSuperscript(`(${exp})`))
    .replace(/\^([A-Za-z0-9+\-−=]+)/g, (_, exp) => toSuperscript(exp));
}

/* ── Question pools by TEKS ── */
const QUESTION_GROUPS = {
  '3.4A': [
    { expressions: ['345 + 278', '123 + 500', '400 + 223'], answer: '623', answerLabel: '623' },
    { expressions: ['900 − 456', '800 − 356', '700 − 256'], answer: '444', answerLabel: '444' },
    { expressions: ['150 + 375', '300 + 225', '425 + 100'], answer: '525', answerLabel: '525' },
    { expressions: ['467 + 233', '500 + 200', '350 + 350'], answer: '700', answerLabel: '700' },
    { expressions: ['802 − 319', '600 − 117', '983 − 500'], answer: '483', answerLabel: '483' },
    { expressions: ['561 − 289', '472 − 200', '372 − 100'], answer: '272', answerLabel: '272' },
  ],
  '3.4C': [
    { expressions: ['4 × 3', '6 × 2', '2 × 6'], answer: '12', answerLabel: '12' },
    { expressions: ['5 × 6', '3 × 10', '15 × 2'], answer: '30', answerLabel: '30' },
    { expressions: ['7 × 8', '4 × 14', '56 ÷ 1'], answer: '56', answerLabel: '56' },
    { expressions: ['9 × 4', '6 × 6', '12 × 3'], answer: '36', answerLabel: '36' },
    { expressions: ['3 × 8', '4 × 6', '12 × 2'], answer: '24', answerLabel: '24' },
    { expressions: ['7 × 5', '35 ÷ 1', '5 × 7'], answer: '35', answerLabel: '35' },
    { expressions: ['8 × 4', '2 × 16', '4 × 8'], answer: '32', answerLabel: '32' },
    { expressions: ['6 × 7', '3 × 14', '21 × 2'], answer: '42', answerLabel: '42' },
  ],
  '3.4D': [
    { expressions: ['24 ÷ 6', '8 ÷ 2', '20 ÷ 5'], answer: '4', answerLabel: '4' },
    { expressions: ['36 ÷ 4', '27 ÷ 3', '45 ÷ 5'], answer: '9', answerLabel: '9' },
    { expressions: ['56 ÷ 8', '42 ÷ 6', '35 ÷ 5'], answer: '7', answerLabel: '7' },
    { expressions: ['48 ÷ 6', '40 ÷ 5', '16 ÷ 2'], answer: '8', answerLabel: '8' },
    { expressions: ['30 ÷ 5', '18 ÷ 3', '12 ÷ 2'], answer: '6', answerLabel: '6' },
    { expressions: ['45 ÷ 9', '25 ÷ 5', '15 ÷ 3'], answer: '5', answerLabel: '5' },
  ],
  '3.2A': [
    { expressions: ['500 + 30 + 7', '400 + 137', '537 × 1'], answer: '537', answerLabel: '537' },
    { expressions: ['200 + 80 + 4', '100 + 184', '284 × 1'], answer: '284', answerLabel: '284' },
    { expressions: ['700 + 60 + 9', '700 + 69', '769 × 1'], answer: '769', answerLabel: '769' },
    { expressions: ['300 + 10 + 5', '200 + 115', '315 × 1'], answer: '315', answerLabel: '315' },
    { expressions: ['900 + 40 + 2', '800 + 142', '942 × 1'], answer: '942', answerLabel: '942' },
    { expressions: ['100 + 50 + 8', '58 + 100', '158 × 1'], answer: '158', answerLabel: '158' },
  ],
  '3.3F': [
    { expressions: ['½ of 10', '¼ of 20', '⅕ of 25'], answer: '5', answerLabel: '5' },
    { expressions: ['⅓ of 9', '¼ of 12', '½ of 6'], answer: '3', answerLabel: '3' },
    { expressions: ['½ of 16', '¼ of 32', '⅛ of 64'], answer: '8', answerLabel: '8' },
    { expressions: ['⅓ of 12', '½ of 8', '¼ of 16'], answer: '4', answerLabel: '4' },
    { expressions: ['½ of 20', '¼ of 40', '⅕ of 50'], answer: '10', answerLabel: '10' },
    { expressions: ['⅓ of 6', '½ of 4', '¼ of 8'], answer: '2', answerLabel: '2' },
  ],
  '3.5B': [
    { expressions: ['3 × □ = 15', '□ = 15 ÷ 3', '5 × 3 = 15'], answer: '5', answerLabel: '□ = 5' },
    { expressions: ['4 × □ = 28', '□ = 28 ÷ 4', '7 × 4 = 28'], answer: '7', answerLabel: '□ = 7' },
    { expressions: ['6 × □ = 48', '□ = 48 ÷ 6', '8 × 6 = 48'], answer: '8', answerLabel: '□ = 8' },
    { expressions: ['9 × □ = 27', '□ = 27 ÷ 9', '3 × 9 = 27'], answer: '3', answerLabel: '□ = 3' },
    { expressions: ['5 × □ = 45', '□ = 45 ÷ 5', '9 × 5 = 45'], answer: '9', answerLabel: '□ = 9' },
    { expressions: ['7 × □ = 42', '□ = 42 ÷ 7', '6 × 7 = 42'], answer: '6', answerLabel: '□ = 6' },
  ],
  '3.7B': [
    { expressions: ['Perimeter 3×5', '3+5+3+5', '(3+5)×2'], answer: '16', answerLabel: 'P = 16' },
    { expressions: ['Perimeter 3×7', '3+7+3+7', '(3+7)×2'], answer: '20', answerLabel: 'P = 20' },
    { expressions: ['Area 3 by 4', '3 rows of 4', '4 × 3'], answer: '12', answerLabel: 'A = 12' },
    { expressions: ['Area 5 by 5', '5 rows of 5', '5 × 5'], answer: '25', answerLabel: 'A = 25' },
    { expressions: ['Area 3 by 6', '3 rows of 6', '6 × 3'], answer: '18', answerLabel: 'A = 18' },
    { expressions: ['Area 4 by 7', '4 rows of 7', '7 × 4'], answer: '28', answerLabel: 'A = 28' },
  ],
};

const ALGEBRA_GROUPS = {
  'A.3A': [
    { expressions: ['(4−1)/(2−0)', 'rise 3, run 2', 'Δy/Δx = 3/2'], answer: '3/2', answerLabel: 'm = 3/2' },
    { expressions: ['(8−2)/(5−2)', '6/3', 'slope = 2'], answer: '2', answerLabel: 'm = 2' },
    { expressions: ['(1−7)/(3−0)', '−6/3', 'slope = −2'], answer: '-2', answerLabel: 'm = −2' },
    { expressions: ['(5−5)/(8−1)', '0/7', 'horizontal'], answer: '0', answerLabel: 'm = 0' },
    { expressions: ['(7−3)/(1−0)', '4/1', 'slope = 4'], answer: '4', answerLabel: 'm = 4' },
    { expressions: ['(2−5)/(0−1)', '−3/−1', 'slope = 3'], answer: '3', answerLabel: 'm = 3' },
  ],
  'A.5A': [
    { expressions: ['2x = 10', 'x = 10/2', '10 ÷ 2'], answer: '5', answerLabel: 'x = 5' },
    { expressions: ['3x + 1 = 7', '3x = 6', '6/3'], answer: '2', answerLabel: 'x = 2' },
    { expressions: ['4x − 3 = 9', '4x = 12', '12/4'], answer: '3', answerLabel: 'x = 3' },
    { expressions: ['x/2 + 1 = 5', 'x/2 = 4', '2 × 4'], answer: '8', answerLabel: 'x = 8' },
    { expressions: ['7x = 42', 'x = 42/7', '42 ÷ 7'], answer: '6', answerLabel: 'x = 6' },
    { expressions: ['9x = 36', 'x = 36/9', '36 ÷ 9'], answer: '4', answerLabel: 'x = 4' },
  ],
  'A.7A': [
    { expressions: ['vertex (x−3)²+1', 'h=3, k=1', '(3, 1)'], answer: '(3,1)', answerLabel: 'V(3,1)' },
    { expressions: ['vertex (x+2)²−4', 'h=−2, k=−4', '(−2,−4)'], answer: '(-2,-4)', answerLabel: 'V(−2,−4)' },
    { expressions: ['vertex x²+6x+9', '(x+3)²', '(−3, 0)'], answer: '(-3,0)', answerLabel: 'V(−3,0)' },
    { expressions: ['vertex −(x−1)²+5', 'h=1, k=5', '(1, 5)'], answer: '(1,5)', answerLabel: 'V(1,5)' },
    { expressions: ['vertex (x−4)²', 'h=4, k=0', '(4, 0)'], answer: '(4,0)', answerLabel: 'V(4,0)' },
    { expressions: ['vertex x²−2x+1', '(x−1)²', '(1, 0)'], answer: '(1,0)', answerLabel: 'V(1,0)' },
  ],
  'A.10E': [
    { expressions: ['x²+5x+6', '(x+2)(x+3)', 'roots −2,−3'], answer: '(x+2)(x+3)', answerLabel: '(x+2)(x+3)' },
    { expressions: ['x²−x−6', '(x−3)(x+2)', 'roots 3,−2'], answer: '(x-3)(x+2)', answerLabel: '(x−3)(x+2)' },
    { expressions: ['x²−9', '(x−3)(x+3)', 'diff of sq.'], answer: '(x-3)(x+3)', answerLabel: '(x−3)(x+3)' },
    { expressions: ['x²+7x+12', '(x+3)(x+4)', 'roots −3,−4'], answer: '(x+3)(x+4)', answerLabel: '(x+3)(x+4)' },
    { expressions: ['x²−4x+4', '(x−2)²', 'perfect sq.'], answer: '(x-2)^2', answerLabel: '(x−2)²' },
    { expressions: ['x²+2x−8', '(x+4)(x−2)', 'roots −4,2'], answer: '(x+4)(x-2)', answerLabel: '(x+4)(x−2)' },
  ],
  'A.11B': [
    { expressions: ['x³·x²', 'x^(3+2)', 'x⁵'], answer: 'x^5', answerLabel: 'x⁵' },
    { expressions: ['x⁶÷x²', 'x^(6−2)', 'x⁴'], answer: 'x^4', answerLabel: 'x⁴' },
    { expressions: ['(x²)³', 'x^(2·3)', 'x⁶'], answer: 'x^6', answerLabel: 'x⁶' },
    { expressions: ['x⁴·x³', 'x^(4+3)', 'x⁷'], answer: 'x^7', answerLabel: 'x⁷' },
    { expressions: ['x⁸÷x⁵', 'x^(8−5)', 'x³'], answer: 'x^3', answerLabel: 'x³' },
    { expressions: ['(x⁴)²', 'x^(4·2)', 'x⁸'], answer: 'x^8', answerLabel: 'x⁸' },
  ],
  'A.8A': [
    { expressions: ['x²=9', '√(9)', '±3'], answer: '±3', answerLabel: 'x = ±3' },
    { expressions: ['x²=25', '√(25)', '±5'], answer: '±5', answerLabel: 'x = ±5' },
    { expressions: ['x²=16', '√(16)', '±4'], answer: '±4', answerLabel: 'x = ±4' },
    { expressions: ['x²=49', '√(49)', '±7'], answer: '±7', answerLabel: 'x = ±7' },
    { expressions: ['x²=1', '√(1)', '±1'], answer: '±1', answerLabel: 'x = ±1' },
    { expressions: ['x²=100', '√(100)', '±10'], answer: '±10', answerLabel: 'x = ±10' },
  ],
  'A.12B': [
    { expressions: ['f(x)=2x+1, f(3)', '2(3)+1', '7'], answer: '7', answerLabel: 'f(3)=7' },
    { expressions: ['f(x)=x²−1, f(4)', '16−1', '15'], answer: '15', answerLabel: 'f(4)=15' },
    { expressions: ['f(x)=x+4, f(6)', '6+4', '10'], answer: '10', answerLabel: 'f(6)=10' },
    { expressions: ['f(x)=x², f(3)', '3²', '9'], answer: '9', answerLabel: 'f(3)=9' },
    { expressions: ['f(x)=2x+1, f(5)', '2(5)+1', '11'], answer: '11', answerLabel: 'f(5)=11' },
    { expressions: ['f(x)=x³, f(2)', '2³', '8'], answer: '8', answerLabel: 'f(2)=8' },
  ],
};

const PROB_GROUPS = {
  'PROB.1': [
    { expressions: ['P(heads) coin', '1 out of 2', '50%'], answer: '1/2', answerLabel: 'P = 1/2' },
    { expressions: ['P(6) on die', '1 out of 6', '≈16.7%'], answer: '1/6', answerLabel: 'P = 1/6' },
    { expressions: ['P(even) on die', '3 out of 6', '50%'], answer: '1/2', answerLabel: 'P = 1/2' },
    { expressions: ['P(red) 3R 5B', '3 out of 8', '37.5%'], answer: '3/8', answerLabel: 'P = 3/8' },
    { expressions: ['P(heart) deck', '13 out of 52', '25%'], answer: '1/4', answerLabel: 'P = 1/4' },
    { expressions: ['P(king) deck', '4 out of 52', '1/13'], answer: '1/13', answerLabel: 'P = 1/13' },
  ],
  'PROB.2': [
    { expressions: ['Mean: 2,4,6,8', '(2+4+6+8)/4', '20/4'], answer: '5', answerLabel: 'Mean = 5' },
    { expressions: ['Median: 3,7,9', 'middle value', 'sorted 3,7,9'], answer: '7', answerLabel: 'Median = 7' },
    { expressions: ['Mode: 1,2,2,5,5,5', 'most frequent', 'appears 3×'], answer: '5', answerLabel: 'Mode = 5' },
    { expressions: ['Range: 4,8,15,20', '20 − 4', 'max − min'], answer: '16', answerLabel: 'Range = 16' },
    { expressions: ['Mean: 10,20,30', '(10+20+30)/3', '60/3'], answer: '20', answerLabel: 'Mean = 20' },
    { expressions: ['Median: 1,3,5,7,9', 'middle of 5', 'sorted → 5'], answer: '5', answerLabel: 'Median = 5' },
  ],
  'PROB.3': [
    { expressions: ['5!', '5×4×3×2×1', 'factorial'], answer: '120', answerLabel: '5! = 120' },
    { expressions: ['C(4,2)', '4!/(2!·2!)', '6 combos'], answer: '6', answerLabel: 'C(4,2) = 6' },
    { expressions: ['3!', '3×2×1', 'factorial'], answer: '6', answerLabel: '3! = 6' },
    { expressions: ['C(5,1)', '5!/(1!·4!)', '5 ways'], answer: '5', answerLabel: 'C(5,1) = 5' },
    { expressions: ['P(4,2)', '4!/(4−2)!', '4×3'], answer: '12', answerLabel: 'P(4,2) = 12' },
    { expressions: ['C(6,2)', '6!/(2!·4!)', '15 ways'], answer: '15', answerLabel: 'C(6,2) = 15' },
  ],
};

const INSTRUCTION_GROUPS = {
  comp001: [
    { expressions: ['|−9|', 'absolute value of −9', 'distance from 0'], answer: '9', answerLabel: '9' },
    { expressions: ['√(49)', 'square root of 49', '7² = ?'], answer: '7', answerLabel: '7' },
    { expressions: ['i²', 'imaginary unit squared', 'i × i'], answer: '−1', answerLabel: '−1' },
    { expressions: ['GCF(12,18)', 'greatest common factor', 'common factor maximum'], answer: '6', answerLabel: '6' },
    { expressions: ['LCM(4,6)', 'least common multiple', 'smallest common multiple'], answer: '12', answerLabel: '12' },
    { expressions: ['2⁵', '2×2×2×2×2', 'power of two'], answer: '32', answerLabel: '32' },
  ],
  comp002: [
    { expressions: ['Slope: (1,2) to (3,6)', '(6−2)/(3−1)', 'rate of change'], answer: '2', answerLabel: '2' },
    { expressions: ['f(x)=2x+1, f(3)', 'evaluate function', 'substitute x=3'], answer: '7', answerLabel: '7' },
    { expressions: ['Linear pattern common difference', 'constant add each step', 'sequence type'], answer: 'Arithmetic', answerLabel: 'Arithmetic' },
    { expressions: ['Vertex form y=a(x−h)²+k shows', 'key point of parabola', 'graph feature'], answer: 'Vertex', answerLabel: 'Vertex' },
    { expressions: ['Solve system graphically', 'where lines meet', 'common solution point'], answer: 'Intersection', answerLabel: 'Intersection' },
    { expressions: ['Exponential growth base', 'growth factor condition', 'b in y=ab^x'], answer: '> 1', answerLabel: 'Base > 1' },
  ],
  comp003: [
    { expressions: ['Pythagorean theorem applies to', 'triangle type', 'a²+b²=c²'], answer: 'Right triangles', answerLabel: 'Right triangles' },
    { expressions: ['Area unit type', 'measure of surface', '2D measure units'], answer: 'Square units', answerLabel: 'Square units' },
    { expressions: ['Volume unit type', '3D measure units', 'space filled units'], answer: 'Cubic units', answerLabel: 'Cubic units' },
    { expressions: ['Radius vs diameter', 'half of diameter', 'circle measure relation'], answer: 'r = d/2', answerLabel: 'r = d/2' },
    { expressions: ['Rigid transformation preserves', 'congruence condition', 'distance + angle'], answer: 'Distance and angles', answerLabel: 'Distance and angles' },
    { expressions: ['Triangle angle sum', 'interior angles total', 'geometry fact'], answer: '180°', answerLabel: '180°' },
  ],
  comp004: [
    { expressions: ['Mean definition', 'average formula', 'sum/count'], answer: 'Sum ÷ count', answerLabel: 'Sum ÷ count' },
    { expressions: ['Median definition', 'ordered middle value', 'center of data'], answer: 'Middle value', answerLabel: 'Middle value' },
    { expressions: ['Independent events', 'P(A and B)', 'probability multiplication'], answer: 'P(A)×P(B)', answerLabel: 'P(A)×P(B)' },
    { expressions: ['Sample space total probability', 'all outcomes combined', 'probability axiom'], answer: '1', answerLabel: '1' },
    { expressions: ['Scatter plot trend', 'relationship direction', 'association type'], answer: 'Correlation', answerLabel: 'Correlation' },
    { expressions: ['Outliers affect this more', 'sensitive center measure', 'not robust statistic'], answer: 'Mean', answerLabel: 'Mean' },
  ],
  comp005: [
    { expressions: ['Counterexample purpose', 'single exception role', 'logic tool'], answer: 'Disprove claim', answerLabel: 'Disprove claim' },
    { expressions: ['Deductive reasoning direction', 'general to specific', 'logic flow'], answer: 'General → specific', answerLabel: 'General → specific' },
    { expressions: ['Modeling means', 'real-world to math', 'representation process'], answer: 'Mathematical representation', answerLabel: 'Mathematical representation' },
    { expressions: ['Check reasonableness supports', 'after solving step', 'quality control'], answer: 'Verification', answerLabel: 'Verification' },
    { expressions: ['Equivalent representations show', 'same relationship in forms', 'table/graph/equation'], answer: 'Same relationship', answerLabel: 'Same relationship' },
    { expressions: ['Strong argument needs', 'beyond answer only', 'proof component'], answer: 'Justification', answerLabel: 'Justification' },
  ],
  c020: [
    { expressions: ['Concrete → Representational → ?', 'CRA final stage', 'Instruction sequence end'], answer: 'Abstract', answerLabel: 'Abstract' },
    { expressions: ['Use this during lesson', 'Check understanding in real time', 'Assessment for adjustment'], answer: 'Formative', answerLabel: 'Formative' },
    { expressions: ['Ask students to justify', 'Explain why method works', 'Discourse goal'], answer: 'Reasoning', answerLabel: 'Reasoning' },
    { expressions: ['Visual + verbal + symbolic', 'Show concept in many ways', 'Access strategy'], answer: 'Multiple representations', answerLabel: 'Multiple representations' },
    { expressions: ['Change groups after evidence', 'Adjust pacing from data', 'Teacher response move'], answer: 'Responsive instruction', answerLabel: 'Responsive instruction' },
    { expressions: ['Language scaffold in math', 'Structured speaking support', 'ELL support move'], answer: 'Sentence stems', answerLabel: 'Sentence stems' },
  ],
  c021: [
    { expressions: ['End-of-unit assessment type', 'Certifies learning result', 'High-stakes check type'], answer: 'Summative', answerLabel: 'Summative' },
    { expressions: ['Consistent results over time', 'Stability of measurement', 'Assessment quality trait'], answer: 'Reliability', answerLabel: 'Reliability' },
    { expressions: ['Measures intended target', 'Alignment to objective', 'Assessment quality trait'], answer: 'Validity', answerLabel: 'Validity' },
    { expressions: ['Probe misconception quickly', 'Short targeted check', 'Pre-reteach data item'], answer: 'Diagnostic question', answerLabel: 'Diagnostic question' },
    { expressions: ['Best feedback style', 'Clear next-step guidance', 'High-impact comment type'], answer: 'Specific and actionable', answerLabel: 'Specific and actionable' },
    { expressions: ['Quick class-end check', 'One-question understanding check', 'Common formative tool'], answer: 'Exit ticket', answerLabel: 'Exit ticket' },
  ],
  comp006: [
    { expressions: ['Planning starts with standards + ?', 'Define success criteria', 'Instruction design first move'], answer: 'Learning goals', answerLabel: 'Learning goals' },
    { expressions: ['Different supports, same rigor', 'Tailor access to learners', 'Instruction design approach'], answer: 'Differentiation', answerLabel: 'Differentiation' },
    { expressions: ['Analyze incorrect work', 'Find class-wide errors', 'Data use for planning'], answer: 'Misconception analysis', answerLabel: 'Misconception analysis' },
    { expressions: ['Students defend method', 'Explain and justify', 'Talk-move target'], answer: 'Math justification', answerLabel: 'Math justification' },
    { expressions: ['Teach → check → ?', 'Use evidence to change plan', 'Assessment cycle step'], answer: 'Adjust instruction', answerLabel: 'Adjust instruction' },
    { expressions: ['Temporary groups by need', 'Regroup for targeted support', 'Flexible structure'], answer: 'Flexible grouping', answerLabel: 'Flexible grouping' },
  ],
};

Object.assign(QUESTION_GROUPS, ALGEBRA_GROUPS, PROB_GROUPS, INSTRUCTION_GROUPS);
const ALL_TEKS = Object.keys(QUESTION_GROUPS);
const MAX_GROUPS = 6;

const STD_TO_COMP = {
  c001: 'comp001', c002: 'comp001', c003: 'comp001',
  c004: 'comp002', c005: 'comp002', c006: 'comp002', c007: 'comp002', c008: 'comp002',
  c009: 'comp003', c010: 'comp003', c011: 'comp003', c012: 'comp003', c013: 'comp003',
  c014: 'comp004', c015: 'comp004', c016: 'comp004', c017: 'comp004',
  c018: 'comp005', c019: 'comp005',
  c020: 'comp006', c021: 'comp006',
};

function pickRandomTeks(filterTeks, options = {}) {
  const { compId = '', currentStd = '', strictScope = false } = options;
  if (filterTeks) {
    const candidates = filterTeks.split(',').map(t => t.trim()).filter(t => QUESTION_GROUPS[t]);
    if (candidates.length > 0) return [...candidates].sort(() => Math.random() - 0.5).slice(0, 4);
    if (QUESTION_GROUPS[filterTeks]) return [filterTeks];
  }
  if (strictScope) {
    const explicit = filterTeks ? filterTeks.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const keys = [...new Set([
      currentStd,
      ...explicit,
      compId,
      STD_TO_COMP[currentStd],
      ...explicit.map((id) => STD_TO_COMP[id]).filter(Boolean),
    ].filter(Boolean))];
    const scoped = keys.filter((k) => QUESTION_GROUPS[k]);
    if (scoped.length > 0) return [...scoped].sort(() => Math.random() - 0.5).slice(0, Math.min(4, scoped.length));
    return [];
  }
  const available = ALL_TEKS.filter(t => QUESTION_GROUPS[t]?.length >= 4);
  return [...available].sort(() => Math.random() - 0.5).slice(0, 4);
}

function buildTilePool(teksIds, options = {}) {
  const { strictScope = false } = options;
  const seen = new Set();
  const groups = [];
  const addUnique = (g, tid) => {
    if (seen.has(g.answer)) {
      const existing = groups.find(x => x.answer === g.answer);
      if (existing) g.expressions.forEach(e => { if (!existing.expressions.includes(e)) existing.expressions.push(e); });
      return;
    }
    seen.add(g.answer);
    groups.push({ ...g, expressions: [...g.expressions], teks: tid });
  };
  teksIds.forEach(tid => (QUESTION_GROUPS[tid] || []).forEach(g => addUnique(g, tid)));
  if (!strictScope && groups.length < 4) ALL_TEKS.forEach(tid => (QUESTION_GROUPS[tid] || []).forEach(g => addUnique(g, tid)));
  const shuffled = [...groups].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(MAX_GROUPS, shuffled.length)).map((g, i) => ({ ...g, groupIdx: i }));
}

function buildSession(filterTeks, options = {}) {
  const ids = pickRandomTeks(filterTeks, options);
  const p = buildTilePool(ids, options);
  if (p.length === 0) return { ids, pool: [], board: [] };
  return { ids, pool: p, board: buildPlayableBoard(p) };
}

function getDifficultySettings(difficulty) {
  return DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS[DEFAULT_DIFFICULTY];
}

function buildTileGrades(pool) {
  const grades = {};
  (pool || []).forEach((g) => {
    const key = g.answerLabel || g.answer;
    if (!grades[key]) {
      grades[key] = { matchedTiles: 0, hitSwaps: 0, missSwaps: 0 };
    }
  });
  return grades;
}

function updateTileGrades(base, labels, field) {
  const next = { ...(base || {}) };
  (labels || []).forEach((label) => {
    if (!label) return;
    if (!next[label]) next[label] = { matchedTiles: 0, hitSwaps: 0, missSwaps: 0 };
    next[label] = { ...next[label], [field]: (next[label][field] || 0) + 1 };
  });
  return next;
}

function targetForLevel(level, settings) {
  return settings.targetBase + (Math.max(1, level) - 1) * settings.targetStep;
}

function randomTile(pool, focusAnswer = null) {
  const focusCandidates = focusAnswer
    ? pool.filter((g) => (g.answerLabel || g.answer) === focusAnswer)
    : [];
  const useFocus = focusCandidates.length > 0 && Math.random() < 0.65;
  const source = useFocus ? focusCandidates : pool;
  const group = source[Math.floor(Math.random() * source.length)];
  const expr = group.expressions[Math.floor(Math.random() * group.expressions.length)];
  return {
    id: Math.random().toString(36).slice(2, 10),
    expression: expr,
    answer: group.answer,
    answerLabel: group.answerLabel,
    groupIdx: group.groupIdx,
    teks: group.teks,
    falling: false,
    removing: false,
  };
}

function createBoard(pool, focusAnswer = null) {
  const board = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      let tile, attempts = 0;
      do {
        tile = randomTile(pool, focusAnswer);
        attempts++;
      } while (
        attempts < 100 &&
        ((c >= 2 && row[c - 1].answer === tile.answer && row[c - 2].answer === tile.answer) ||
         (r >= 2 && board[r - 1][c].answer === tile.answer && board[r - 2][c].answer === tile.answer))
      );
      row.push(tile);
    }
    board.push(row);
  }
  return board;
}

function buildPlayableBoard(pool, attempts = 40, focusAnswer = null) {
  for (let i = 0; i < attempts; i++) {
    const candidate = createBoard(pool, focusAnswer);
    if (findHintSwap(candidate)) return candidate;
  }
  return createBoard(pool, focusAnswer);
}

function findMatches(board) {
  const matched = new Set();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 3; c++) {
      const a = board[r][c]?.answer;
      if (a && board[r][c + 1]?.answer === a && board[r][c + 2]?.answer === a) {
        matched.add(`${r},${c}`); matched.add(`${r},${c + 1}`); matched.add(`${r},${c + 2}`);
        let ext = c + 3;
        while (ext < COLS && board[r][ext]?.answer === a) { matched.add(`${r},${ext}`); ext++; }
      }
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 3; r++) {
      const a = board[r][c]?.answer;
      if (a && board[r + 1][c]?.answer === a && board[r + 2][c]?.answer === a) {
        matched.add(`${r},${c}`); matched.add(`${r + 1},${c}`); matched.add(`${r + 2},${c}`);
        let ext = r + 3;
        while (ext < ROWS && board[ext][c]?.answer === a) { matched.add(`${ext},${c}`); ext++; }
      }
    }
  }
  return matched;
}

function applyGravity(board, pool, focusAnswer = null) {
  const nb = board.map(row => [...row]);
  for (let c = 0; c < COLS; c++) {
    let wr = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (nb[r][c] && !nb[r][c].removing) {
        if (wr !== r) { nb[wr][c] = { ...nb[r][c], falling: true }; nb[r][c] = null; }
        wr--;
      }
    }
    for (let r = wr; r >= 0; r--) nb[r][c] = { ...randomTile(pool, focusAnswer), falling: true };
  }
  return nb;
}

function cloneBoard(board) {
  return board.map((row) => row.map((tile) => (tile ? { ...tile } : tile)));
}

function swapCells(board, r1, c1, r2, c2) {
  const nb = cloneBoard(board);
  const tmp = nb[r1][c1];
  nb[r1][c1] = nb[r2][c2];
  nb[r2][c2] = tmp;
  return nb;
}

function findHintSwap(board) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const right = c + 1;
      if (right < COLS) {
        const swapped = swapCells(board, r, c, r, right);
        if (findMatches(swapped).size > 0) return { r1: r, c1: c, r2: r, c2: right };
      }
      const down = r + 1;
      if (down < ROWS) {
        const swapped = swapCells(board, r, c, down, c);
        if (findMatches(swapped).size > 0) return { r1: r, c1: c, r2: down, c2: c };
      }
    }
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════ */
const TeksCrush = () => {
  const [searchParams] = useSearchParams();
  const teksFilter = searchParams.get('teks');
  const compFilter = searchParams.get('comp') || '';
  const currentStd = searchParams.get('currentStd') || searchParams.get('std') || '';
  const teksLabel = searchParams.get('label') || teksFilter;
  const strictScope = searchParams.get('from') === 'loop' && !!(teksFilter || compFilter || currentStd);
  const sessionOptions = useMemo(() => ({ compId: compFilter, currentStd, strictScope }), [compFilter, currentStd, strictScope]);
  const sid = searchParams.get('sid');
  const aid = searchParams.get('aid');
  const cid = searchParams.get('cid');
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const settings = getDifficultySettings(difficulty);
  const [initialSession] = useState(() => buildSession(teksFilter, sessionOptions));

  const [teksIds, setTeksIds] = useState(() => initialSession.ids);
  const [pool, setPool] = useState(() => initialSession.pool);
  const [board, setBoard] = useState(() => initialSession.board);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(() => getDifficultySettings(DEFAULT_DIFFICULTY).startingMoves);
  const [matchCount, setMatchCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [matchedCells, setMatchedCells] = useState(new Set());
  const [swapping, setSwapping] = useState(null);
  const [message, setMessage] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [level, setLevel] = useState(1);
  const [targetScore, setTargetScore] = useState(() => targetForLevel(1, getDifficultySettings(DEFAULT_DIFFICULTY)));
  const [bestCombo, setBestCombo] = useState(1);
  const [hintSwap, setHintSwap] = useState(null);
  const [tileGrades, setTileGrades] = useState(() => buildTileGrades(initialSession.pool));
  const [practiceFocusAnswer, setPracticeFocusAnswer] = useState(null);
  const [showHowTo, setShowHowTo] = useState(true);
  const [shakeBoard, setShakeBoard] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  const [showCoachDetails, setShowCoachDetails] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 700 : true));

  const { returnUrl, goBack, isEmbedded } = useGameReturn();
  const boardRef = useRef(board);
  boardRef.current = board;
  const poolRef = useRef(pool);
  poolRef.current = pool;
  const focusAnswerRef = useRef(practiceFocusAnswer);
  focusAnswerRef.current = practiceFocusAnswer;
  const msgTimer = useRef(null);
  const idleHintTimer = useRef(null);
  const shakeTimer = useRef(null);

  const showMsg = useCallback((text, ms = 1500) => {
    if (msgTimer.current) clearTimeout(msgTimer.current);
    setMessage(text);
    msgTimer.current = setTimeout(() => setMessage(null), ms);
  }, []);

  useEffect(() => {
    const session = buildSession(teksFilter, sessionOptions);
    setTeksIds(session.ids);
    setPool(session.pool);
    setBoard(session.board);
    setSelected(null);
    setScore(0);
    setMoves(settings.startingMoves);
    setMatchCount(0);
    setGameOver(false);
    setShowReview(false);
    setAnimating(false);
    setMatchedCells(new Set());
    setSwapping(null);
    setMessage(null);
    setAnsweredQuestions([]);
    setLevel(1);
    setTargetScore(targetForLevel(1, settings));
    setBestCombo(1);
    setHintSwap(null);
    setTileGrades(buildTileGrades(session.pool));
    setPracticeFocusAnswer(null);
    setShowHowTo(true);
    setShakeBoard(false);
  }, [teksFilter, settings, sessionOptions]);

  useEffect(() => {
    if (idleHintTimer.current) clearTimeout(idleHintTimer.current);
    setHintSwap(null);
    if (animating || gameOver || moves <= 0) return undefined;
    idleHintTimer.current = setTimeout(() => {
      const hint = findHintSwap(boardRef.current);
      setHintSwap(hint);
    }, 5000);
    return () => {
      if (idleHintTimer.current) clearTimeout(idleHintTimer.current);
    };
  }, [board, animating, gameOver, moves, selected]);

  useEffect(() => () => {
    if (msgTimer.current) clearTimeout(msgTimer.current);
    if (idleHintTimer.current) clearTimeout(idleHintTimer.current);
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (viewportWidth > 700) setShowCoachDetails(true);
  }, [viewportWidth]);

  const isAdj = (r1, c1, r2, c2) =>
    (Math.abs(r1 - r2) === 1 && c1 === c2) || (r1 === r2 && Math.abs(c1 - c2) === 1);

  const processMatches = useCallback(async (bd, combo = 0) => {
    const matches = findMatches(bd);
    if (matches.size === 0) {
      const hint = findHintSwap(bd);
      if (!hint) {
        const reshuffled = buildPlayableBoard(poolRef.current, 40, focusAnswerRef.current);
        setBoard(reshuffled);
        showMsg('No moves — board reshuffled', 1200);
        setAnimating(false);
        return reshuffled;
      }
      setAnimating(false);
      return bd;
    }

    setMatchedCells(matches);
    const tiles = [];
    matches.forEach(k => { const [r, c] = k.split(',').map(Number); if (bd[r][c]) tiles.push(bd[r][c]); });
    if (tiles.length) {
      setTileGrades((prev) => {
        const counts = {};
        tiles.forEach((t) => {
          const key = t.answerLabel || t.answer;
          counts[key] = (counts[key] || 0) + 1;
        });
        const next = { ...(prev || {}) };
        Object.keys(counts).forEach((key) => {
          if (!next[key]) next[key] = { matchedTiles: 0, hitSwaps: 0, missSwaps: 0 };
          next[key] = { ...next[key], matchedTiles: (next[key].matchedTiles || 0) + counts[key] };
        });
        return next;
      });
    }

    const comboMultiplier = 1 + combo * settings.comboStep;
    const pts = Math.round(tiles.length * settings.scorePerTile * comboMultiplier);
    setScore(p => p + pts);
    setMatchCount(p => p + tiles.length);
    setBestCombo((prev) => (combo + 1 > prev ? combo + 1 : prev));

    if (combo > 0) showMsg(`${combo + 1}x COMBO! +${pts}`, 1200);
    else if (tiles.length >= 5) showMsg(`SPECTACULAR! +${pts}`, 1200);
    else if (tiles.length >= 4) showMsg(`GREAT! +${pts}`, 1000);
    if (tiles.length >= settings.bigMatchThreshold) {
      setShakeBoard(false);
      requestAnimationFrame(() => setShakeBoard(true));
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setShakeBoard(false), 300);
    }

    // Big opening matches give a small boost, cascades do not.
    if (combo === 0 && tiles.length >= settings.bigMatchThreshold) {
      setMoves((m) => m + 1);
      showMsg(`MEGA MATCH! +${pts} and +1 move`, 1400);
    }

    const teksSet = new Set();
    tiles.forEach(t => { if (t.teks) teksSet.add(t.teks); });
    teksSet.forEach(teks => {
      setAnsweredQuestions(prev => [...prev, {
        question: `Match ${tiles.length} tiles (${tiles[0]?.expression} = ${tiles[0]?.answer})`,
        correctAnswer: tiles[0]?.answerLabel || tiles[0]?.answer,
        studentAnswer: tiles[0]?.answerLabel || tiles[0]?.answer,
        correct: true, teks,
      }]);
    });

    await new Promise(r => setTimeout(r, MATCH_FLASH));
    const removed = bd.map((row, r) => row.map((t, c) => matches.has(`${r},${c}`) ? { ...t, removing: true } : t));
    const grav = applyGravity(removed, poolRef.current, focusAnswerRef.current);
    setBoard(grav);
    setMatchedCells(new Set());
    await new Promise(r => setTimeout(r, FALL_DURATION));
    const settled = grav.map(row => row.map(t => t ? { ...t, falling: false } : t));
    setBoard(settled);
    return processMatches(settled, combo + 1);
  }, [showMsg, settings.bigMatchThreshold, settings.comboStep, settings.scorePerTile]);

  const doSwap = useCallback((r1, c1, r2, c2) => {
    if (animating || gameOver || moves <= 0) return;
    if (!isAdj(r1, c1, r2, c2)) return;
    setHintSwap(null);
    setSelected(null);
    setAnimating(true);
    const original = cloneBoard(boardRef.current);
    const swapped = swapCells(original, r1, c1, r2, c2);

    setSwapping({ r1, c1, r2, c2 });

    setTimeout(() => {
      setBoard(swapped);
      const matches = findMatches(swapped);
      const swapLabels = [...new Set([
        swapped[r1][c1]?.answerLabel || swapped[r1][c1]?.answer,
        swapped[r2][c2]?.answerLabel || swapped[r2][c2]?.answer,
      ].filter(Boolean))];
      if (matches.size === 0) {
        setTileGrades((prev) => updateTileGrades(prev, swapLabels, 'missSwaps'));
        // Keep setup moves so players can build toward future matches.
        setSwapping(null);
        setMoves((m) => Math.max(0, m - 1));
        showMsg('Swap kept — set up your next match', 1000);
        setAnimating(false);
        return;
      }
      setSwapping(null);
      setTileGrades((prev) => updateTileGrades(prev, swapLabels, 'hitSwaps'));
      setMoves((p) => Math.max(0, p - 1));
      processMatches(swapped, 0);
    }, SWAP_DURATION);
  }, [animating, gameOver, moves, processMatches, showMsg]);

  const handleClick = useCallback((r, c) => {
    if (animating || gameOver || moves <= 0) return;
    setHintSwap(null);
    if (!selected) { setSelected({ r, c }); return; }
    if (selected.r === r && selected.c === c) { setSelected(null); return; }
    if (!isAdj(selected.r, selected.c, r, c)) { setSelected({ r, c }); return; }
    doSwap(selected.r, selected.c, r, c);
  }, [selected, animating, gameOver, moves, doSwap]);

  const touchRef = useRef(null);
  const SWIPE_THRESHOLD = 20;

  const onTouchStart = useCallback((r, c, e) => {
    const t = e.touches[0];
    setHintSwap(null);
    touchRef.current = { r, c, x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!touchRef.current) return;
    const t = e.changedTouches[0];
    const { r, c, x, y } = touchRef.current;
    touchRef.current = null;
    const dx = t.clientX - x;
    const dy = t.clientY - y;
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
    let tr, tc;
    if (Math.abs(dx) > Math.abs(dy)) {
      tr = r; tc = dx > 0 ? c + 1 : c - 1;
    } else {
      tr = dy > 0 ? r + 1 : r - 1; tc = c;
    }
    if (tr < 0 || tr >= ROWS || tc < 0 || tc >= COLS) return;
    doSwap(r, c, tr, tc);
  }, [doSwap]);

  const mouseRef = useRef(null);

  const onMouseDown = useCallback((r, c, e) => {
    setHintSwap(null);
    mouseRef.current = { r, c, x: e.clientX, y: e.clientY };
  }, []);

  const onMouseUp = useCallback((e) => {
    if (!mouseRef.current) return;
    const { r, c, x, y } = mouseRef.current;
    mouseRef.current = null;
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
    let tr, tc;
    if (Math.abs(dx) > Math.abs(dy)) {
      tr = r; tc = dx > 0 ? c + 1 : c - 1;
    } else {
      tr = dy > 0 ? r + 1 : r - 1; tc = c;
    }
    if (tr < 0 || tr >= ROWS || tc < 0 || tc >= COLS) return;
    doSwap(r, c, tr, tc);
  }, [doSwap]);

  useEffect(() => {
    if (moves <= 0 && !animating) {
      setGameOver(true);
      const pct = Math.min(100, Math.round((score / targetScore) * 100));
      saveGameResult({
        gameId: 'teks-crush', studentId: sid || undefined, assignmentId: aid || undefined,
        classId: cid || undefined, score: pct, correct: matchCount, total: targetScore,
        teks: teksIds.join(','), questions: answeredQuestions, extra: { rawScore: score, level },
      });
    }
  }, [moves, animating, score, targetScore, teksIds, level, answeredQuestions, sid, aid, cid, matchCount]);

  useEffect(() => {
    if (score >= targetScore && !gameOver) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setTargetScore(targetForLevel(nextLevel, settings));
      setMoves((p) => p + settings.levelMoveBonus);
      showMsg(`LEVEL ${nextLevel}! +${settings.levelMoveBonus} moves`, 2000);
    }
  }, [score, targetScore, gameOver, level, showMsg, settings]);

  const applyDifficulty = useCallback((nextDifficulty) => {
    if (nextDifficulty === difficulty) return;
    const nextSettings = getDifficultySettings(nextDifficulty);
    const session = buildSession(teksFilter, sessionOptions);
    setDifficulty(nextDifficulty);
    setTeksIds(session.ids);
    setPool(session.pool);
    setBoard(session.board);
    setSelected(null);
    setScore(0);
    setMoves(nextSettings.startingMoves);
    setMatchCount(0);
    setGameOver(false);
    setShowReview(false);
    setAnimating(false);
    setMatchedCells(new Set());
    setSwapping(null);
    setMessage(null);
    setAnsweredQuestions([]);
    setLevel(1);
    setTargetScore(targetForLevel(1, nextSettings));
    setBestCombo(1);
    setHintSwap(null);
    setTileGrades(buildTileGrades(session.pool));
    setPracticeFocusAnswer(null);
    setShowHowTo(true);
    setShakeBoard(false);
  }, [difficulty, teksFilter, sessionOptions]);

  const startFocusedPractice = useCallback((answerLabel) => {
    if (!answerLabel) return;
    const session = buildSession(teksFilter, sessionOptions);
    const nextPool = session.pool;
    const boardWithFocus = buildPlayableBoard(nextPool, 40, answerLabel);
    setTeksIds(session.ids);
    setPool(nextPool);
    setBoard(boardWithFocus);
    setSelected(null);
    setScore(0);
    setMoves(settings.startingMoves);
    setMatchCount(0);
    setGameOver(false);
    setShowReview(false);
    setAnimating(false);
    setMatchedCells(new Set());
    setSwapping(null);
    setMessage(null);
    setAnsweredQuestions([]);
    setLevel(1);
    setTargetScore(targetForLevel(1, settings));
    setBestCombo(1);
    setHintSwap(null);
    setTileGrades(buildTileGrades(nextPool));
    setPracticeFocusAnswer(answerLabel);
    setShowHowTo(true);
    setShakeBoard(false);
  }, [settings, teksFilter, sessionOptions]);

  const resetGame = () => {
    const session = buildSession(teksFilter, sessionOptions);
    setTeksIds(session.ids); setPool(session.pool); setBoard(session.board);
    setSelected(null); setScore(0); setMoves(settings.startingMoves); setMatchCount(0);
    setGameOver(false); setShowReview(false); setAnimating(false);
    setMatchedCells(new Set()); setSwapping(null); setMessage(null);
    setAnsweredQuestions([]); setLevel(1); setTargetScore(targetForLevel(1, settings)); setBestCombo(1); setHintSwap(null);
    setTileGrades(buildTileGrades(session.pool));
    setPracticeFocusAnswer(null);
    setShowHowTo(true);
    setShakeBoard(false);
  };

  if (strictScope && pool.length === 0) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#7f1d1d' }}>
          No competency-aligned TEKS Crush content is available for this loop step yet.
        </div>
        <div style={{ marginTop: 12 }}>
          {returnUrl ? <LoopContinueButton onClick={goBack} /> : !isEmbedded ? <Link to="/games">Back to Games</Link> : null}
        </div>
      </div>
    );
  }

  /* tile size is computed to fit screen */
  const tileSize = viewportWidth <= 700
    ? `min(78px, calc((100vw - ${TILE_GAP * (COLS + 1) + 28}px) / ${COLS}))`
    : `min(90px, calc((100vw - 360px) / ${COLS}))`;

  if (showReview) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <GameReview questions={answeredQuestions} score={score} total={targetScore}
          gameTitle="TEKS Crush" onBack={() => setShowReview(false)} backLabel="Back to Results" onPlayAgain={resetGame} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
          <button onClick={resetGame} style={btn('#22c55e')}>Play Again</button>
          {returnUrl
            ? <button onClick={goBack} style={btn('#6366f1')}>Continue Loop</button>
            : !isEmbedded ? <Link to="/games" style={{ ...btn('#6366f1'), textDecoration: 'none' }}>Back to Games</Link> : null}
        </div>
        {returnUrl && <LoopContinueButton onClick={goBack} />}
      </div>
    );
  }

  const pct = Math.min(100, Math.round((score / targetScore) * 100));
  const tileProgressRows = useMemo(() =>
    Object.entries(tileGrades)
      .map(([label, stats]) => {
        const matched = stats.matchedTiles || 0;
        const hit = stats.hitSwaps || 0;
        const miss = stats.missSwaps || 0;
        const attempts = hit + miss;
        const accuracy = attempts > 0 ? Math.round((hit / attempts) * 100) : 0;
        return { label, matched, hit, miss, attempts, accuracy };
      })
      .sort((a, b) => {
        // Prioritize lower-accuracy, frequently-attempted tiles first.
        if (a.attempts > 0 && b.attempts > 0 && a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
        if (a.attempts !== b.attempts) return b.attempts - a.attempts;
        return b.matched - a.matched;
      }),
  [tileGrades]);
  const nextFocusTile = tileProgressRows.find((row) => row.attempts >= 2 && row.accuracy < 70)?.label || null;
  const isPhoneLayout = viewportWidth <= 700;
  const topTileProgress = useMemo(() =>
    (pool || []).map((group) => {
      const label = group.answerLabel || group.answer;
      const stats = tileGrades?.[label] || { hitSwaps: 0, missSwaps: 0 };
      const attempts = (stats.hitSwaps || 0) + (stats.missSwaps || 0);
      const accuracy = attempts > 0 ? Math.round(((stats.hitSwaps || 0) / attempts) * 100) : 0;
      const color = accuracy >= 75 ? '#22c55e' : accuracy >= 45 ? '#f59e0b' : '#ef4444';
      return { label, attempts, accuracy, color };
    }),
  [pool, tileGrades]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)',
      color: '#fff', fontFamily: '"Inter","Segoe UI",system-ui,sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px', background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {returnUrl
          ? <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue</button>
          : !isEmbedded ? <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Games</Link> : <span />}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1 }}>TEKS Crush</div>
          {teksLabel && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{teksLabel}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setShowHowTo(true)}
            style={{
              border: '1px solid rgba(148,163,184,0.45)',
              background: 'rgba(15,23,42,0.35)',
              color: '#cbd5e1',
              borderRadius: 999,
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ?
          </button>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Lv {level}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 12px', background: 'rgba(255,255,255,0.02)',
      }}>
        <Stat label="Score" value={score} color="#fbbf24" />
        <Stat label="Moves" value={moves} color={moves <= 5 ? '#ef4444' : '#60a5fa'} />
        <Stat label="Matched" value={matchCount} color="#34d399" />
        <Stat label="Best Combo" value={`${bestCombo}x`} color="#a78bfa" />
        <div style={{ flex: 1, maxWidth: 120, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#64748b', marginBottom: 2 }}>Target {targetScore}</div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, background: pct >= 100 ? '#22c55e' : 'linear-gradient(90deg,#3b82f6,#8b5cf6)', width: `${Math.min(100, pct)}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>

      {/* Top tile progress strip */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 12px 2px' }}>
        <div style={{
          width: 'min(100%, 980px)',
          background: 'rgba(15,23,42,0.38)',
          border: '1px solid rgba(148,163,184,0.22)',
          borderRadius: 12,
          padding: '8px 10px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#cbd5e1', marginBottom: 6 }}>
            Tile Progress So Far
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isPhoneLayout ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
            {topTileProgress.map((row) => (
              <div key={`top-progress-${row.label}`} style={{
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: 8,
                padding: '5px 7px',
                background: 'rgba(2,6,23,0.35)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#e2e8f0' }}>{row.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: row.color }}>
                    {row.attempts > 0 ? `${row.accuracy}%` : '--'}
                  </span>
                </div>
                <div style={{ marginTop: 4, height: 6, borderRadius: 999, background: 'rgba(148,163,184,0.25)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${row.attempts > 0 ? row.accuracy : 0}%`, background: row.color, transition: 'width 180ms ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '6px 12px 2px' }}>
        {DIFFICULTY_ORDER.map((mode) => {
          const active = difficulty === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => applyDifficulty(mode)}
              style={{
                border: active ? '1px solid #22d3ee' : '1px solid rgba(148,163,184,0.35)',
                background: active ? 'rgba(34,211,238,0.18)' : 'rgba(15,23,42,0.35)',
                color: active ? '#a5f3fc' : '#cbd5e1',
                borderRadius: 999,
                padding: '3px 10px',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {mode}
            </button>
          );
        })}
      </div>
      {/* Instruction banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '8px 14px 6px',
      }}>
        <div style={{
          width: 'min(100%, 980px)',
          textAlign: 'center',
          fontSize: 13,
          color: '#cbd5e1',
          lineHeight: 1.45,
          background: 'rgba(15,23,42,0.35)',
          border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: 12,
          padding: '8px 12px',
        }}>
          Swap adjacent tiles to match <strong style={{ color: '#e2e8f0' }}>3+ with the same answer</strong>.
          {' '}Use the coach to pick your next focus tile.
          {hintSwap && <span style={{ color: '#67e8f9', marginLeft: 8 }}>Hint: glowing tiles can make a match.</span>}
        </div>
      </div>
      {message && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 12px 8px' }}>
          <div style={{
            width: 'min(100%, 860px)',
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(2,6,23,0.9)',
            border: '1px solid rgba(148,163,184,0.3)',
            color: '#fbbf24',
            fontSize: 13,
            fontWeight: 800,
            textAlign: 'center',
            boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
            animation: 'tcPop 0.25s ease',
          }}>
            {message}
          </div>
        </div>
      )}

      {/* Guided learning loop + board */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 8px 16px' }}>
        <div style={{
          width: '100%',
          maxWidth: 1120,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}>
          <aside style={{
            width: isPhoneLayout ? '100%' : 'min(100%, 220px)',
            background: 'rgba(15,23,42,0.45)',
            border: '1px solid rgba(148,163,184,0.25)',
            borderRadius: 12,
            padding: '10px 10px 8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Learning Loop
              </div>
              {isPhoneLayout && (
                <button
                  type="button"
                  onClick={() => setShowCoachDetails((prev) => !prev)}
                  style={{
                    border: '1px solid rgba(148,163,184,0.4)',
                    background: 'rgba(15,23,42,0.35)',
                    color: '#cbd5e1',
                    borderRadius: 999,
                    padding: '3px 9px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {showCoachDetails ? 'Hide Coach' : 'Show Coach'}
                </button>
              )}
            </div>
            <div style={{ marginTop: 6, fontSize: 10, color: '#cbd5e1', lineHeight: 1.4 }}>
              <div><strong style={{ color: '#e2e8f0' }}>1)</strong> Pick a focus tile</div>
              <div><strong style={{ color: '#e2e8f0' }}>2)</strong> Make matches around that answer</div>
              <div><strong style={{ color: '#e2e8f0' }}>3)</strong> Watch accuracy go up</div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 9,
                fontWeight: 700,
                border: '1px solid rgba(34,197,94,0.45)',
                background: 'rgba(34,197,94,0.14)',
                color: '#bbf7d0',
              }}>
                75-100% Strong
              </span>
              <span style={{
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 9,
                fontWeight: 700,
                border: '1px solid rgba(245,158,11,0.45)',
                background: 'rgba(245,158,11,0.14)',
                color: '#fde68a',
              }}>
                45-74% Practice
              </span>
              <span style={{
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 9,
                fontWeight: 700,
                border: '1px solid rgba(239,68,68,0.45)',
                background: 'rgba(239,68,68,0.14)',
                color: '#fecaca',
              }}>
                0-44% Focus
              </span>
            </div>
            <div style={{
              marginTop: 8,
              padding: '8px 9px',
              borderRadius: 8,
              background: 'rgba(30,41,59,0.55)',
              border: '1px solid rgba(148,163,184,0.2)',
              fontSize: 11,
              color: '#cbd5e1',
            }}>
              {practiceFocusAnswer
                ? <>Current focus: <strong style={{ color: '#86efac' }}>{practiceFocusAnswer}</strong></>
                : nextFocusTile
                  ? <>Suggested focus: <strong style={{ color: '#fcd34d' }}>{nextFocusTile}</strong></>
                  : <>Make a few swaps and we will suggest your next focus tile.</>}
            </div>
            {showCoachDetails && (
              <>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                type="button"
                disabled={!nextFocusTile}
                onClick={() => nextFocusTile && startFocusedPractice(nextFocusTile)}
                style={{
                  width: '100%',
                  border: '1px solid rgba(34,197,94,0.5)',
                  background: nextFocusTile ? 'rgba(34,197,94,0.2)' : 'rgba(100,116,139,0.2)',
                  color: nextFocusTile ? '#dcfce7' : '#94a3b8',
                  borderRadius: 8,
                  padding: '7px 8px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: nextFocusTile ? 'pointer' : 'default',
                  animation: nextFocusTile ? 'tcCoachPulse 1.5s ease-in-out infinite' : 'none',
                }}
              >
                {nextFocusTile ? `Practice Suggested Tile (${nextFocusTile})` : 'Practice Suggested Tile'}
              </button>
              <button
                type="button"
                disabled={!practiceFocusAnswer}
                onClick={() => setPracticeFocusAnswer(null)}
                style={{
                  width: '100%',
                  border: '1px solid rgba(148,163,184,0.45)',
                  background: practiceFocusAnswer ? 'rgba(15,23,42,0.45)' : 'rgba(100,116,139,0.18)',
                  color: practiceFocusAnswer ? '#cbd5e1' : '#94a3b8',
                  borderRadius: 8,
                  padding: '6px 8px',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: practiceFocusAnswer ? 'pointer' : 'default',
                }}
              >
                Clear Focus
              </button>
                </div>
                <div style={{ marginTop: 8, maxHeight: isPhoneLayout ? 180 : 280, overflowY: 'auto', paddingRight: 2 }}>
                  {tileProgressRows.length === 0 && (
                    <div style={{
                      padding: '8px 6px',
                      borderRadius: 8,
                      fontSize: 10,
                      color: '#94a3b8',
                      border: '1px dashed rgba(148,163,184,0.35)',
                      background: 'rgba(15,23,42,0.25)',
                    }}>
                      Progress will appear after your first swaps.
                    </div>
                  )}
              {tileProgressRows.map((row) => {
                const barColor = row.accuracy >= 75 ? '#22c55e' : row.accuracy >= 45 ? '#f59e0b' : '#ef4444';
                const statusLabel = row.accuracy >= 75 ? 'Strong' : row.accuracy >= 45 ? 'Practice' : 'Focus';
                return (
                  <button
                    key={`live-grade-${row.label}`}
                    type="button"
                    onClick={() => startFocusedPractice(row.label)}
                    style={{
                      width: '100%',
                      marginBottom: 6,
                      border: practiceFocusAnswer === row.label ? '1px solid rgba(34,197,94,0.55)' : '1px solid rgba(148,163,184,0.25)',
                      borderRadius: 8,
                      background: practiceFocusAnswer === row.label ? 'rgba(34,197,94,0.12)' : 'rgba(15,23,42,0.25)',
                      padding: '6px 7px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#e2e8f0' }}>{row.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: barColor }}>{statusLabel} {row.accuracy}%</span>
                    </div>
                    <div style={{ marginTop: 5, height: 6, borderRadius: 999, background: 'rgba(148,163,184,0.28)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${row.attempts > 0 ? row.accuracy : 0}%`, background: barColor, transition: 'width 180ms ease' }} />
                    </div>
                    <div style={{ marginTop: 4, fontSize: 9, color: '#94a3b8' }}>
                      Good swaps: {row.hit} | Missed swaps: {row.miss} | Matches: {row.matched}
                    </div>
                  </button>
                );
              })}
                </div>
              </>
            )}
          </aside>

          <div style={{ position: 'relative' }}>
            <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${tileSize})`,
          gridTemplateRows: `repeat(${ROWS}, ${tileSize})`,
          gap: TILE_GAP,
          borderRadius: 16, padding: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          animation: shakeBoard ? 'tcScreenShake 280ms ease-in-out' : 'none',
            }}>
              {board.map((row, r) => row.map((tile, c) => {
            if (!tile) return <div key={`${r}-${c}`} />;
            const isSel = selected?.r === r && selected?.c === c;
            const isMatch = matchedCells.has(`${r},${c}`);
            const isHint = !!hintSwap && (
              (hintSwap.r1 === r && hintSwap.c1 === c) || (hintSwap.r2 === r && hintSwap.c2 === c)
            );

            let tx = '';
            if (swapping) {
              const { r1, c1, r2, c2 } = swapping;
              const dxA = c2 - c1;
              const dyA = r2 - r1;
              const dxB = c1 - c2;
              const dyB = r1 - r2;
              // Use own tile size + grid gap so swap animation always renders.
              if (r === r1 && c === c1) tx = `translate(calc(${dxA} * (100% + ${TILE_GAP}px)), calc(${dyA} * (100% + ${TILE_GAP}px)))`;
              if (r === r2 && c === c2) tx = `translate(calc(${dxB} * (100% + ${TILE_GAP}px)), calc(${dyB} * (100% + ${TILE_GAP}px)))`;
            }

            const exprLen = tile.expression.length;
            const fs = exprLen > 14 ? 12 : exprLen > 10 ? 13 : exprLen > 7 ? 15 : 17;
            const tileTheme = TILE_COLORS[tile.groupIdx % TILE_COLORS.length];

            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleClick(r, c)}
                onTouchStart={(e) => onTouchStart(r, c, e)}
                onTouchEnd={onTouchEnd}
                onMouseDown={(e) => onMouseDown(r, c, e)}
                onMouseUp={onMouseUp}
                style={{
                  width: '100%', height: '100%', aspectRatio: '1',
                  borderRadius: 12,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  cursor: animating ? 'default' : 'pointer',
                  touchAction: 'none',
                  background: isMatch
                    ? 'rgba(34,197,94,0.25)'
                    : isSel
                      ? 'rgba(251,191,36,0.12)'
                      : tileTheme.bg,
                  color: '#f1f5f9',
                  fontWeight: 700, fontSize: fs, lineHeight: 1.2,
                  textAlign: 'center', padding: '4px 5px',
                  border: isMatch
                    ? '2px solid #22c55e'
                    : isSel
                      ? '2px solid #fbbf24'
                      : isHint
                        ? '2px dashed #22d3ee'
                      : `1px solid ${tileTheme.border}`,
                  boxShadow: isMatch
                    ? '0 0 14px rgba(34,197,94,0.5)'
                    : isSel
                      ? '0 0 12px rgba(251,191,36,0.4)'
                      : isHint
                        ? '0 0 12px rgba(34,211,238,0.45)'
                      : `0 1px 6px rgba(0,0,0,0.28), 0 0 10px ${tileTheme.glow}`,
                  transform: isMatch
                    ? 'scale(1.08)'
                    : tx || (tile.falling ? 'translateY(-80px)' : 'scale(1)'),
                  transition: swapping
                    ? `transform ${SWAP_DURATION}ms ease`
                    : `transform ${tile.falling ? FALL_DURATION : 120}ms ease, opacity 200ms, box-shadow 150ms, background 150ms`,
                  animation: isHint ? 'tcHintPulse 1.2s ease-in-out infinite' : 'none',
                  opacity: tile.removing ? 0 : 1,
                  userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                  overflow: 'hidden',
                }}
              >
                {isMatch && (
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'block',
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#fef08a',
                      boxShadow: '0 0 10px rgba(254,240,138,0.9)',
                      transform: 'translate(-50%, -50%)',
                      animation: 'tcBurstCore 420ms ease-out forwards',
                    }} />
                    <span style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      border: '2px solid rgba(253,224,71,0.9)',
                      transform: 'translate(-50%, -50%)',
                      animation: 'tcBurstRing 520ms ease-out forwards',
                    }} />
                    {EXPLOSION_PARTICLES.map((p, idx) => (
                      <span
                        key={`burst-${idx}`}
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: p.c,
                          transform: 'translate(-50%, -50%)',
                          animation: `tcParticle 520ms ease-out ${p.d} forwards`,
                          '--dx': p.dx,
                          '--dy': p.dy,
                        }}
                      />
                    ))}
                  </span>
                )}
                <span style={{ lineHeight: 1.15, wordBreak: 'break-word' }}>{formatExpressionMath(tile.expression)}</span>
                <span style={{
                  fontSize: 10, color: 'rgba(226,232,240,0.75)', marginTop: 2, fontWeight: 700,
                }}>= {tile.answerLabel}</span>
              </button>
            );
              }))}
            </div>

          </div>
        </div>
      </div>

      {/* Always-visible tile progress checker */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 10px 10px' }}>
        <div style={{
          width: 'min(100%, 760px)',
          background: 'rgba(15,23,42,0.38)',
          border: '1px solid rgba(148,163,184,0.25)',
          borderRadius: 12,
          padding: '8px 10px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#cbd5e1', marginBottom: 6 }}>
            Progress Checker (by tile answer)
          </div>
          {tileProgressRows.length === 0 && (
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Make a few swaps to start tracking per-tile progress.
            </div>
          )}
          <div style={{ display: 'grid', gap: 6 }}>
            {tileProgressRows.slice(0, isPhoneLayout ? 3 : 5).map((row) => {
              const barColor = row.accuracy >= 75 ? '#22c55e' : row.accuracy >= 45 ? '#f59e0b' : '#ef4444';
              return (
                <button
                  key={`checker-${row.label}`}
                  type="button"
                  onClick={() => startFocusedPractice(row.label)}
                  style={{
                    width: '100%',
                    border: practiceFocusAnswer === row.label ? '1px solid rgba(34,197,94,0.55)' : '1px solid rgba(148,163,184,0.25)',
                    borderRadius: 8,
                    background: practiceFocusAnswer === row.label ? 'rgba(34,197,94,0.12)' : 'rgba(15,23,42,0.22)',
                    padding: '6px 8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#e2e8f0' }}>{row.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{row.accuracy}%</span>
                  </div>
                  <div style={{ marginTop: 4, height: 6, borderRadius: 999, background: 'rgba(148,163,184,0.28)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${row.attempts > 0 ? row.accuracy : 0}%`, background: barColor, transition: 'width 180ms ease' }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Answer key */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 6, padding: '0 12px 10px', flexWrap: 'wrap',
      }}>
        {pool.map((g, i) => (
          <span key={i} style={{
            padding: '2px 7px', borderRadius: 5, fontSize: 9, fontWeight: 700,
            background: (g.answerLabel || g.answer) === practiceFocusAnswer ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.06)',
            color: (g.answerLabel || g.answer) === practiceFocusAnswer ? '#86efac' : '#cbd5e1',
            border: (g.answerLabel || g.answer) === practiceFocusAnswer ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.08)',
          }}>
            {g.answerLabel}
          </span>
        ))}
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'linear-gradient(170deg,#1e293b,#0f172a)', borderRadius: 20,
            padding: '28px 32px', textAlign: 'center', border: '2px solid #334155',
            maxWidth: 340, width: '90%',
          }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900, color: '#fbbf24' }}>
              {score >= targetScore ? 'Great Job!' : 'Game Over!'}
            </h2>
            <p style={{ margin: '0 0 14px', color: '#94a3b8', fontSize: 13 }}>
              Level {level} &middot; Score: {score} &middot; Matched: {matchCount}
            </p>
            <div style={{ marginBottom: 10 }}>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 999,
                border: '1px solid rgba(34,211,238,0.45)',
                background: 'rgba(34,211,238,0.12)',
                color: '#a5f3fc',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}>
                Difficulty: {difficulty}
              </span>
            </div>
            <QBotBubble msg="Accurate matching - each paired expression simplifies to the same value." />
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
              background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 10, marginBottom: 16,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#60a5fa' }}>{score}</div>
                <div style={{ fontSize: 9, color: '#94a3b8' }}>Score</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#34d399' }}>{matchCount}</div>
                <div style={{ fontSize: 9, color: '#94a3b8' }}>Matched</div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10,
              border: '1px solid rgba(148,163,184,0.2)',
              padding: '8px 10px',
              marginBottom: 14,
              textAlign: 'left',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#cbd5e1', marginBottom: 6 }}>
                Mini Grade Tab (by tile answer)
              </div>
              <div style={{ maxHeight: 140, overflowY: 'auto' }}>
                {Object.entries(tileGrades)
                  .sort((a, b) => (b[1].matchedTiles || 0) - (a[1].matchedTiles || 0))
                  .map(([label, stats]) => {
                    const attempts = (stats.hitSwaps || 0) + (stats.missSwaps || 0);
                    const acc = attempts > 0 ? Math.round(((stats.hitSwaps || 0) / attempts) * 100) : 0;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => startFocusedPractice(label)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          border: practiceFocusAnswer === label ? '1px solid rgba(34,197,94,0.5)' : '1px solid transparent',
                          background: practiceFocusAnswer === label ? 'rgba(34,197,94,0.08)' : 'transparent',
                          borderRadius: 6,
                          cursor: 'pointer',
                          padding: '0 4px',
                        }}
                      >
                        <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto auto',
                        gap: 8,
                        alignItems: 'center',
                        fontSize: 10,
                        color: '#e2e8f0',
                        padding: '4px 0',
                        borderBottom: '1px dashed rgba(148,163,184,0.2)',
                      }}>
                        <span style={{ fontWeight: 700 }}>{label}</span>
                        <span style={{ color: '#34d399' }}>M:{stats.matchedTiles || 0}</span>
                        <span style={{ color: '#60a5fa' }}>H:{stats.hitSwaps || 0}</span>
                        <span style={{ color: acc >= 70 ? '#22c55e' : acc >= 40 ? '#f59e0b' : '#ef4444' }}>{acc}%</span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {returnUrl && <button onClick={goBack} style={btn('#22c55e')}>Continue Practicing</button>}
              <button onClick={resetGame} style={btn(returnUrl ? '#6366f1' : '#22c55e')}>Play Again</button>
              <button onClick={() => setShowReview(true)} style={btn('#8b5cf6')}>Review Matches</button>
              {!returnUrl && !isEmbedded && <Link to="/games" style={{ ...btn('#475569'), textDecoration: 'none', display: 'block' }}>Back to Games</Link>}
            </div>
          </div>
        </div>
      )}

      {/* How to play overlay */}
      {showHowTo && !gameOver && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.68)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120,
        }}>
          <div style={{
            background: 'linear-gradient(170deg,#1e293b,#0f172a)', borderRadius: 16,
            padding: '18px 20px', border: '1px solid rgba(148,163,184,0.35)',
            maxWidth: 760, width: '94%',
          }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fbbf24', marginBottom: 8, textAlign: 'center' }}>
              How TEKS Crush Works
            </div>
            <div style={{
              fontSize: 13,
              color: '#cbd5e1',
              lineHeight: 1.45,
              display: 'grid',
              gridTemplateColumns: viewportWidth <= 700 ? '1fr' : '1fr 1fr',
              gap: 8,
            }}>
              <div>1) Swap adjacent tiles.</div>
              <div>2) Match 3+ expressions with the same answer.</div>
              <div>3) Matches score points and refill the board.</div>
              <div>4) Keep going until moves run out.</div>
              <div style={{ gridColumn: '1 / -1', marginTop: 2, color: '#93c5fd' }}>
                Tip: In results, click a tile in Mini Grade Tab to practice that tile more.
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setShowHowTo(false)}
                style={{
                  padding: '9px 16px',
                  border: 'none',
                  borderRadius: 10,
                  background: '#22c55e',
                  color: '#fff',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Start Playing
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes tcPop {
          0% { transform: scale(0.94); opacity: 0; }
          60% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes tcHintPulse {
          0% { box-shadow: 0 0 8px rgba(34,211,238,0.35); }
          50% { box-shadow: 0 0 16px rgba(34,211,238,0.75); }
          100% { box-shadow: 0 0 8px rgba(34,211,238,0.35); }
        }
        @keyframes tcBurstCore {
          0% { transform: translate(-50%,-50%) scale(0.2); opacity: 0; }
          35% { transform: translate(-50%,-50%) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1.7); opacity: 0; }
        }
        @keyframes tcBurstRing {
          0% { transform: translate(-50%,-50%) scale(0.4); opacity: 0.95; }
          100% { transform: translate(-50%,-50%) scale(2.6); opacity: 0; }
        }
        @keyframes tcParticle {
          0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0; }
          30% { transform: translate(calc(-50% + var(--dx) * 0.45), calc(-50% + var(--dy) * 0.45)) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.8); opacity: 0; }
        }
        @keyframes tcScreenShake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          100% { transform: translateX(0); }
        }
        @keyframes tcCoachPulse {
          0% { box-shadow: 0 0 0 rgba(34,197,94,0); }
          50% { box-shadow: 0 0 12px rgba(34,197,94,0.35); }
          100% { box-shadow: 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>

      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div style={{ textAlign: 'center', minWidth: 50 }}>
    <div style={{ fontSize: 18, fontWeight: 900, color }}>{value}</div>
    <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
  </div>
);

const QBotBubble = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,245,255,0.05)', borderRadius: 10, padding: '6px 10px', border: '1px solid rgba(0,245,255,0.1)', marginBottom: 12 }}>
    <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#1e3a5f,#0d1b2a)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #00f5ff', overflow: 'hidden' }}>
      <img src={qbotImg} alt="QBot" style={{ width: 20 }} />
    </div>
    <div style={{ fontSize: 11, fontWeight: 600, color: '#7dd3fc', lineHeight: 1.3 }}>{msg}</div>
  </div>
);

function btn(bg) {
  return {
    padding: '11px 22px', background: bg, color: '#fff',
    border: 'none', borderRadius: 10, cursor: 'pointer',
    fontSize: 13, fontWeight: 700, textAlign: 'center',
  };
}

export default TeksCrush;
