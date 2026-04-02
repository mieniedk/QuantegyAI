import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import qbotImg from '../assets/qbot.svg';
import { fireConfetti } from '../utils/confetti';
import { motionTransition } from '../utils/motion';
import { trackEvent } from '../utils/telemetry';

/* ═══════════════════════════════════════════════════════════
   MATH BINGO — 5×5 bingo card
   QBot calls out math expressions; students mark the answer
   on their card. First to get 5 in a row/col/diagonal wins!
   ═══════════════════════════════════════════════════════════ */

const GRID = 5;
const TOTAL_CELLS = GRID * GRID;

/* ── Question pools by TEKS ── */
const Q_POOLS = {
  '3.4A': [
    { expr: '125 + 234', ans: 359 }, { expr: '503 − 278', ans: 225 },
    { expr: '467 + 233', ans: 700 }, { expr: '900 − 456', ans: 444 },
    { expr: '150 + 375', ans: 525 }, { expr: '802 − 319', ans: 483 },
    { expr: '350 + 150', ans: 500 }, { expr: '600 − 234', ans: 366 },
    { expr: '218 + 497', ans: 715 }, { expr: '750 − 483', ans: 267 },
    { expr: '561 − 289', ans: 272 }, { expr: '124 + 376', ans: 500 },
  ],
  '3.4C': [
    { expr: '4 × 3', ans: 12 }, { expr: '5 × 6', ans: 30 },
    { expr: '7 × 8', ans: 56 }, { expr: '9 × 4', ans: 36 },
    { expr: '6 × 6', ans: 36 }, { expr: '3 × 8', ans: 24 },
    { expr: '7 × 5', ans: 35 }, { expr: '2 × 9', ans: 18 },
    { expr: '8 × 4', ans: 32 }, { expr: '6 × 7', ans: 42 },
    { expr: '9 × 9', ans: 81 }, { expr: '3 × 7', ans: 21 },
    { expr: '5 × 5', ans: 25 }, { expr: '8 × 8', ans: 64 },
    { expr: '4 × 7', ans: 28 }, { expr: '6 × 9', ans: 54 },
    { expr: '3 × 3', ans: 9 }, { expr: '2 × 7', ans: 14 },
    { expr: '5 × 8', ans: 40 }, { expr: '9 × 3', ans: 27 },
  ],
  '3.4D': [
    { expr: '24 ÷ 6', ans: 4 }, { expr: '35 ÷ 5', ans: 7 },
    { expr: '56 ÷ 8', ans: 7 }, { expr: '48 ÷ 6', ans: 8 },
    { expr: '36 ÷ 4', ans: 9 }, { expr: '30 ÷ 5', ans: 6 },
    { expr: '45 ÷ 9', ans: 5 }, { expr: '72 ÷ 8', ans: 9 },
    { expr: '27 ÷ 3', ans: 9 }, { expr: '42 ÷ 7', ans: 6 },
    { expr: '18 ÷ 2', ans: 9 }, { expr: '63 ÷ 9', ans: 7 },
    { expr: '40 ÷ 8', ans: 5 }, { expr: '21 ÷ 3', ans: 7 },
    { expr: '54 ÷ 6', ans: 9 }, { expr: '16 ÷ 4', ans: 4 },
  ],
  '3.2A': [
    { expr: '500 + 30 + 7', ans: 537 }, { expr: '200 + 80 + 4', ans: 284 },
    { expr: '700 + 60 + 9', ans: 769 }, { expr: '300 + 10 + 5', ans: 315 },
    { expr: '900 + 40 + 2', ans: 942 }, { expr: '100 + 50 + 8', ans: 158 },
    { expr: '400 + 20 + 6', ans: 426 }, { expr: '800 + 70 + 1', ans: 871 },
  ],
  '3.5B': [
    { expr: '3 × ___ = 15', ans: 5 }, { expr: '___ × 4 = 28', ans: 7 },
    { expr: '6 × ___ = 48', ans: 8 }, { expr: '9 × ___ = 27', ans: 3 },
    { expr: '___ × 5 = 45', ans: 9 }, { expr: '7 × ___ = 42', ans: 6 },
    { expr: '___ × 8 = 64', ans: 8 }, { expr: '4 × ___ = 24', ans: 6 },
    { expr: '___ + 125 = 500', ans: 375 }, { expr: '1000 − ___ = 600', ans: 400 },
  ],
  '3.3F': [
    { expr: '½ of 10', ans: 5 }, { expr: '⅓ of 9', ans: 3 },
    { expr: '½ of 16', ans: 8 }, { expr: '¼ of 12', ans: 3 },
    { expr: '½ of 20', ans: 10 }, { expr: '⅓ of 12', ans: 4 },
    { expr: '¼ of 20', ans: 5 }, { expr: '½ of 14', ans: 7 },
    { expr: '⅓ of 18', ans: 6 }, { expr: '¼ of 32', ans: 8 },
  ],
  '3.7B': [
    { expr: 'Perimeter: 3 by 5', ans: 16 }, { expr: 'Perimeter: 4 by 4', ans: 16 },
    { expr: 'Area: 3 by 4', ans: 12 }, { expr: 'Perimeter: 6 by 2', ans: 16 },
    { expr: 'Area: 5 by 5', ans: 25 }, { expr: 'Perimeter: 7 by 3', ans: 20 },
    { expr: 'Area: 6 by 4', ans: 24 }, { expr: 'Perimeter: 5 by 5', ans: 20 },
    { expr: 'Area: 8 by 3', ans: 24 }, { expr: 'Perimeter: 10 by 2', ans: 24 },
  ],

  /* ── Probability & Statistics ── */
  'PROB.1': [
    { expr: 'P(heads) as %', ans: 50 }, { expr: 'P(6 on a die) as 1 in ?', ans: 6 },
    { expr: 'P(even on die) as %', ans: 50 }, { expr: 'Cards in a deck', ans: 52 },
    { expr: 'Suits in a deck', ans: 4 }, { expr: 'P(heart) → 52 ÷ ?', ans: 4 },
    { expr: 'Faces on a die', ans: 6 }, { expr: 'P(not 6) → ? in 6', ans: 5 },
    { expr: '3 red + 5 blue bag → total', ans: 8 },
    { expr: 'P(king): 52 ÷ 4 = 1 in ?', ans: 13 },
    { expr: 'Coin outcomes (H or T)', ans: 2 },
    { expr: 'Two coins → outcomes', ans: 4 },
  ],
  'PROB.2': [
    { expr: 'Mean: 2, 4, 6, 8, 10', ans: 6 }, { expr: 'Mean: 3, 5, 7', ans: 5 },
    { expr: 'Median: 1, 3, 5, 7, 9', ans: 5 }, { expr: 'Median: 2, 8, 10', ans: 8 },
    { expr: 'Mode: 4, 4, 5, 6, 7', ans: 4 }, { expr: 'Range: 3, 7, 12, 20', ans: 17 },
    { expr: 'Range: 5, 5, 10, 15', ans: 10 }, { expr: 'Mean: 10, 20, 30', ans: 20 },
    { expr: 'Mean: 0, 5, 10, 15, 20', ans: 10 }, { expr: 'Median: 4, 6, 8', ans: 6 },
    { expr: 'Mode: 1, 2, 2, 3, 3, 3', ans: 3 }, { expr: 'Range: 1, 1, 1, 9', ans: 8 },
    { expr: 'Mean: 7, 7, 7', ans: 7 }, { expr: 'Median: 11, 13, 15, 17, 19', ans: 15 },
    { expr: 'Mean: 1, 2, 3, 4, 5', ans: 3 },
  ],
  'PROB.3': [
    { expr: '3!', ans: 6 }, { expr: '4!', ans: 24 }, { expr: '5!', ans: 120 },
    { expr: 'C(4, 2)', ans: 6 }, { expr: 'C(5, 1)', ans: 5 }, { expr: 'C(6, 2)', ans: 15 },
    { expr: 'C(5, 3)', ans: 10 }, { expr: 'P(4, 2)', ans: 12 },
    { expr: 'C(3, 1)', ans: 3 }, { expr: 'P(3, 2)', ans: 6 },
    { expr: '2! + 3!', ans: 8 }, { expr: 'C(4, 1)', ans: 4 },
    { expr: 'C(6, 1)', ans: 6 }, { expr: 'C(5, 2)', ans: 10 },
  ],

  /* ── Algebra ── */
  'A.5A': [
    { expr: 'f(x)=2x+1, f(3)', ans: 7 }, { expr: 'f(x)=3x−2, f(4)', ans: 10 },
    { expr: 'f(x)=x²−1, f(3)', ans: 8 }, { expr: 'f(x)=5x, f(5)', ans: 25 },
    { expr: 'f(x)=x+10, f(6)', ans: 16 }, { expr: 'f(x)=2x², f(2)', ans: 8 },
    { expr: 'f(x)=4x−3, f(5)', ans: 17 }, { expr: 'f(x)=x²+2, f(4)', ans: 18 },
    { expr: 'f(x)=3x+5, f(3)', ans: 14 }, { expr: 'f(x)=x−7, f(20)', ans: 13 },
    { expr: 'f(x)=6x, f(4)', ans: 24 }, { expr: 'f(x)=x²−4, f(5)', ans: 21 },
  ],
  'A.3A': [
    { expr: 'Slope: (6−2)/(4−2)', ans: 2 }, { expr: 'Slope: (9−3)/(2−0)', ans: 3 },
    { expr: 'Slope: (10−5)/(5−0)', ans: 1 }, { expr: 'y=3x+1, y-int', ans: 1 },
    { expr: 'y=2x+5, y-int', ans: 5 }, { expr: 'y=−x+4, y-int', ans: 4 },
    { expr: 'y=4x−8, y-int', ans: -8 }, { expr: 'Slope: (8−2)/(3−1)', ans: 3 },
    { expr: 'y=x+9, f(0)', ans: 9 }, { expr: 'Slope: (0−6)/(3−0)', ans: -2 },
    { expr: 'y=5x, slope', ans: 5 }, { expr: 'y=−2x+7, slope', ans: -2 },
  ],
  'A.7A': [
    { expr: '2x=10 → x', ans: 5 }, { expr: '3x+1=16 → x', ans: 5 },
    { expr: 'x/2=9 → x', ans: 18 }, { expr: '4x=28 → x', ans: 7 },
    { expr: 'x−5=12 → x', ans: 17 }, { expr: '2x+6=20 → x', ans: 7 },
    { expr: '5x−5=20 → x', ans: 5 }, { expr: 'x/3=6 → x', ans: 18 },
    { expr: '3x=21 → x', ans: 7 }, { expr: 'x+8=15 → x', ans: 7 },
    { expr: '6x=36 → x', ans: 6 }, { expr: '2x−4=10 → x', ans: 7 },
  ],
  'A.8A': [
    { expr: 'x²=49 → x', ans: 7 }, { expr: '√(64)', ans: 8 },
    { expr: '√(144)', ans: 12 }, { expr: 'x²=25 → x', ans: 5 },
    { expr: '√(81)', ans: 9 }, { expr: '√(100)', ans: 10 },
    { expr: 'x²=16 → x', ans: 4 }, { expr: '√(36)', ans: 6 },
    { expr: '2³', ans: 8 }, { expr: '3³', ans: 27 },
    { expr: '√(121)', ans: 11 }, { expr: '√(225)', ans: 15 },
  ],
  'A.10E': [
    { expr: '|−7|', ans: 7 }, { expr: '|5−12|', ans: 7 },
    { expr: '|−3| + |−4|', ans: 7 }, { expr: '|0|', ans: 0 },
    { expr: '|−15|', ans: 15 }, { expr: '|8−20|', ans: 12 },
    { expr: '|−1| × 9', ans: 9 }, { expr: '|3−11|', ans: 8 },
    { expr: '|−6| + 5', ans: 11 }, { expr: '|−25|', ans: 25 },
  ],
  'A.11B': [
    { expr: '2⁰', ans: 1 }, { expr: '2⁴', ans: 16 },
    { expr: '3²', ans: 9 }, { expr: '5²', ans: 25 },
    { expr: '10²', ans: 100 }, { expr: '2⁵', ans: 32 },
    { expr: '4²', ans: 16 }, { expr: '6²', ans: 36 },
    { expr: '7²', ans: 49 }, { expr: '1¹⁰⁰', ans: 1 },
    { expr: '2⁶', ans: 64 }, { expr: '10³', ans: 1000 },
  ],
  'A.12B': [
    { expr: 'GCF(12, 18)', ans: 6 }, { expr: 'GCF(8, 12)', ans: 4 },
    { expr: 'LCM(4, 6)', ans: 12 }, { expr: 'LCM(3, 5)', ans: 15 },
    { expr: 'GCF(20, 30)', ans: 10 }, { expr: 'LCM(6, 8)', ans: 24 },
    { expr: 'GCF(15, 25)', ans: 5 }, { expr: 'LCM(4, 10)', ans: 20 },
    { expr: 'GCF(9, 12)', ans: 3 }, { expr: 'LCM(5, 7)', ans: 35 },
    { expr: 'GCF(16, 24)', ans: 8 }, { expr: 'LCM(3, 8)', ans: 24 },
  ],
  'A.6A': [
    { expr: 'y=2x, x=6 → y', ans: 12 }, { expr: 'y=x/2, x=14 → y', ans: 7 },
    { expr: 'y=3x+1, x=3 → y', ans: 10 }, { expr: 'y=x−4, x=11 → y', ans: 7 },
    { expr: 'y=2x−5, x=8 → y', ans: 11 }, { expr: 'y=4x, x=4 → y', ans: 16 },
    { expr: 'y=x+15, x=5 → y', ans: 20 }, { expr: 'y=5x−10, x=4 → y', ans: 10 },
    { expr: 'y=x², x=3 → y', ans: 9 }, { expr: 'y=2x+3, x=7 → y', ans: 17 },
  ],

  /* ── TExES Math 7-12 competency-level pools ── */

  // Domain I — Number Concepts
  'c001': [
    { expr: '|−12|', ans: 12 }, { expr: '|7 − 15|', ans: 8 },
    { expr: '(−3)(−5)', ans: 15 }, { expr: '−8 + 20', ans: 12 },
    { expr: '√(49)', ans: 7 }, { expr: '√(169)', ans: 13 },
    { expr: '2⁵', ans: 32 }, { expr: '3³', ans: 27 },
    { expr: '(−2)⁴', ans: 16 }, { expr: '(−1)⁷', ans: -1 },
    { expr: '|−25| − 10', ans: 15 }, { expr: '√(64+36)', ans: 10 },
    { expr: '2⁸ ÷ 2⁵', ans: 8 }, { expr: '9⁰ + 5⁰', ans: 2 },
  ],
  'c002': [
    { expr: 'Re(3+4i)', ans: 3 }, { expr: 'Im(5−2i)', ans: -2 },
    { expr: 'i² = ?', ans: -1 }, { expr: 'i⁴ = ?', ans: 1 },
    { expr: '|3+4i| = ?', ans: 5 }, { expr: '|5+12i| = ?', ans: 13 },
    { expr: 'Re((2+i)+(3−i))', ans: 5 }, { expr: 'Im((2+3i)−(1+i))', ans: 2 },
    { expr: 'i⁶ = ?', ans: -1 }, { expr: 'i⁸ = ?', ans: 1 },
    { expr: '|6+8i| = ?', ans: 10 }, { expr: 'Re(7i)', ans: 0 },
    { expr: '|1+0i|', ans: 1 }, { expr: 'Im(4)', ans: 0 },
  ],
  'c003': [
    { expr: 'GCF(12,18)', ans: 6 }, { expr: 'LCM(4,6)', ans: 12 },
    { expr: 'GCF(20,30)', ans: 10 }, { expr: 'LCM(3,5)', ans: 15 },
    { expr: '3! = ?', ans: 6 }, { expr: '4! = ?', ans: 24 },
    { expr: 'C(5,2)', ans: 10 }, { expr: 'C(6,2)', ans: 15 },
    { expr: '17 mod 5', ans: 2 }, { expr: '23 mod 7', ans: 2 },
    { expr: 'Smallest prime > 20', ans: 23 }, { expr: 'C(4,2)', ans: 6 },
    { expr: '5! ÷ 4!', ans: 5 }, { expr: 'GCF(48,36)', ans: 12 },
  ],

  // Domain II — Patterns and Algebra
  'c004': [
    { expr: 'a₁=2, d=3 → a₅', ans: 14 }, { expr: 'a₁=5, d=4 → a₆', ans: 25 },
    { expr: 'a₁=1, r=2 → a₅', ans: 16 }, { expr: 'Σ(1 to 4) = ?', ans: 10 },
    { expr: 'a₁=3, d=7 → a₄', ans: 24 }, { expr: 'Σ(1 to 5) = ?', ans: 15 },
    { expr: 'a₁=2, r=3 → a₃', ans: 18 }, { expr: 'Fib: 1,1,2,3,5,?', ans: 8 },
    { expr: 'Fib: 1,1,2,3,5,8,?', ans: 13 }, { expr: 'a₁=10, d=−2 → a₆', ans: 0 },
    { expr: 'Σ(1 to 6) = ?', ans: 21 }, { expr: 'a₁=4, r=2 → a₄', ans: 32 },
    { expr: 'a₁=100, d=−10 → a₅', ans: 60 }, { expr: 'Σ(2+4+6+8)', ans: 20 },
  ],
  'c005': [
    { expr: 'f(x)=2x+1, f(3)', ans: 7 }, { expr: 'f(x)=x²−1, f(4)', ans: 15 },
    { expr: 'f(x)=3x, f(8)', ans: 24 }, { expr: 'g(x)=x+5, g(7)', ans: 12 },
    { expr: 'f(x)=x², g(x)=x+1, f(g(2))', ans: 9 },
    { expr: 'f(x)=2x, f(f(3))', ans: 12 },
    { expr: 'Domain of √(x): min x', ans: 0 },
    { expr: 'f(x)=x−3, f⁻¹(7)', ans: 10 },
    { expr: 'f(x)=|x|, f(−6)', ans: 6 }, { expr: 'f(x)=x³, f(2)', ans: 8 },
    { expr: 'f(x)=5x−10, f(4)', ans: 10 }, { expr: 'f(x)=x²+1, f(3)', ans: 10 },
    { expr: 'f(x)=x/2, f(30)', ans: 15 }, { expr: 'f(x)=4x+3, f(2)', ans: 11 },
  ],
  'c006': [
    { expr: 'Slope: (8−2)/(4−1)', ans: 2 }, { expr: 'y=3x+5, y-int', ans: 5 },
    { expr: 'y=−2x+9, slope', ans: -2 }, { expr: 'x²−5x+6=0, smaller root', ans: 2 },
    { expr: 'x²−5x+6=0, larger root', ans: 3 }, { expr: 'Vertex of (x−3)²+1 → y', ans: 1 },
    { expr: 'Vertex of (x−3)²+1 → x', ans: 3 },
    { expr: '2x+y=10, y-int', ans: 10 }, { expr: 'Discriminant: x²−4x+4', ans: 0 },
    { expr: 'x²=36 → positive x', ans: 6 },
    { expr: 'y=4x−3, f(2)', ans: 5 }, { expr: 'Slope: (0−6)/(3−0)', ans: -2 },
    { expr: '(x−1)(x+5)=0 → sum of roots', ans: -4 },
    { expr: 'Perp. slope to m=⅓', ans: -3 },
  ],
  'c007': [
    { expr: 'Degree of 5x⁴−3x+1', ans: 4 }, { expr: 'Degree of x³+2x', ans: 3 },
    { expr: '√(x+7)=3 → x', ans: 2 }, { expr: '√(x−1)=4 → x', ans: 17 },
    { expr: 'f(x)=(x²−9)/(x−3), f(5)', ans: 8 },
    { expr: 'Zeros of x²−4: count', ans: 2 },
    { expr: '|2x−6|=0 → x', ans: 3 }, { expr: 'Max turns of x⁵', ans: 4 },
    { expr: 'Max zeros of x⁴+1', ans: 4 },
    { expr: '√(25)', ans: 5 }, { expr: '∛(27)', ans: 3 }, { expr: '∛(64)', ans: 4 },
    { expr: '|x|=7 → # solutions', ans: 2 }, { expr: 'Degree of 9', ans: 0 },
  ],
  'c008': [
    { expr: 'log₂(8)', ans: 3 }, { expr: 'log₃(27)', ans: 3 },
    { expr: 'log₁₀(100)', ans: 2 }, { expr: 'log₅(25)', ans: 2 },
    { expr: '2⁰', ans: 1 }, { expr: 'log₂(32)', ans: 5 },
    { expr: 'log₄(16)', ans: 2 }, { expr: '10¹', ans: 10 },
    { expr: 'log₂(64)', ans: 6 }, { expr: 'e⁰', ans: 1 },
    { expr: 'ln(e²)', ans: 2 }, { expr: 'ln(e⁵)', ans: 5 },
    { expr: 'log₁₀(1000)', ans: 3 }, { expr: 'log₃(81)', ans: 4 },
  ],
  'c009': [
    { expr: 'sin(30°) = 1/?', ans: 2 }, { expr: 'cos(60°) = 1/?', ans: 2 },
    { expr: 'tan(45°)', ans: 1 }, { expr: 'sin(90°)', ans: 1 },
    { expr: 'cos(0°)', ans: 1 }, { expr: 'sin(0°)', ans: 0 },
    { expr: 'cos(90°)', ans: 0 }, { expr: 'tan(0°)', ans: 0 },
    { expr: 'Period of sin(x) ÷ π', ans: 2 }, { expr: 'Period of tan(x) ÷ π', ans: 1 },
    { expr: 'sin²(θ)+cos²(θ)', ans: 1 }, { expr: 'Period of sin(2x) ÷ π', ans: 1 },
    { expr: 'Amplitude of 3sin(x)', ans: 3 }, { expr: 'Amplitude of −5cos(x)', ans: 5 },
    { expr: '180° in radians = ?π', ans: 1 }, { expr: '360° ÷ π radians = ?π', ans: 2 },
    { expr: 'Quadrant of 150°', ans: 2 }, { expr: 'Quadrant of 200°', ans: 3 },
    { expr: 'Quadrant of 310°', ans: 4 }, { expr: 'Ref angle of 150°', ans: 30 },
    { expr: 'Ref angle of 240° − 180°', ans: 60 }, { expr: 'sin(270°)', ans: -1 },
    { expr: 'cos(180°)', ans: -1 }, { expr: 'Vertical shift of sin(x)+4', ans: 4 },
  ],
  'c010': [
    { expr: 'd/dx[x³] at x=2', ans: 12 }, { expr: 'd/dx[x²] at x=3', ans: 6 },
    { expr: 'd/dx[5x] = ?', ans: 5 }, { expr: 'd/dx[x⁴] at x=1', ans: 4 },
    { expr: '∫₀² 3x² dx', ans: 8 }, { expr: '∫₀¹ 2x dx', ans: 1 },
    { expr: 'd/dx[7] = ?', ans: 0 }, { expr: 'lim(x→3) x²', ans: 9 },
    { expr: 'd/dx[x²+3x] at x=1', ans: 5 }, { expr: '∫₁³ 2 dx', ans: 4 },
    { expr: 'd/dx[6x²] at x=1', ans: 12 }, { expr: 'lim(x→2) (x+5)', ans: 7 },
    { expr: '∫₀³ 1 dx', ans: 3 }, { expr: 'd/dx[x⁵] at x=1', ans: 5 },
  ],

  // Domain III — Geometry and Measurement
  'c011': [
    { expr: 'Area: rect 5×8', ans: 40 }, { expr: 'Perimeter: rect 5×8', ans: 26 },
    { expr: 'Area: triangle b=10,h=6', ans: 30 }, { expr: 'Circumference: r=7 ÷ π', ans: 14 },
    { expr: 'Volume: cube side 3', ans: 27 }, { expr: 'Area: circle r=5 ÷ π', ans: 25 },
    { expr: 'Hypotenuse: 3,4,?', ans: 5 }, { expr: 'Hypotenuse: 5,12,?', ans: 13 },
    { expr: 'Volume: cylinder r=3,h=4 ÷ π', ans: 36 },
    { expr: 'Scale factor 2 → area ×?', ans: 4 },
    { expr: 'Scale factor 3 → volume ×?', ans: 27 },
    { expr: 'Area: square side 9', ans: 81 }, { expr: 'Perimeter: equil. △ side 7', ans: 21 },
    { expr: 'Surface area cube side 2', ans: 24 },
  ],
  'c012': [
    { expr: '△ angle sum', ans: 180 }, { expr: 'Quad angle sum', ans: 360 },
    { expr: 'Supplementary to 65°', ans: 115 }, { expr: 'Complementary to 35°', ans: 55 },
    { expr: 'Vertical angle of 40°', ans: 40 }, { expr: 'Pentagon angle sum ÷ 5', ans: 108 },
    { expr: 'Hexagon angle sum', ans: 720 }, { expr: '# sides: angle sum 1080°', ans: 8 },
    { expr: 'Exterior angle sum (any polygon)', ans: 360 },
    { expr: 'Supplementary to 90°', ans: 90 },
    { expr: 'Each angle regular △', ans: 60 }, { expr: 'Each angle regular □', ans: 90 },
    { expr: 'SSS, SAS, ASA, AAS → # theorems', ans: 4 },
    { expr: 'Complementary to 60°', ans: 30 },
  ],
  'c013': [
    { expr: 'Inscribed ∠ for 100° arc', ans: 50 }, { expr: 'Central ∠ = arc → 70° arc', ans: 70 },
    { expr: 'Regular octagon int. angle', ans: 135 }, { expr: 'Regular decagon int. angle', ans: 144 },
    { expr: 'Exterior ∠ of regular hexagon', ans: 60 },
    { expr: 'Interior sum: heptagon ÷ 180', ans: 5 },
    { expr: 'Inscribed ∠ in semicircle', ans: 90 },
    { expr: 'Ext. angle = sum of remotes: 80+50', ans: 130 },
    { expr: 'Missing △ angle: 60°, 70°, ?', ans: 50 },
    { expr: 'Missing △ angle: 45°, 90°, ?', ans: 45 },
    { expr: 'Diagonals of hexagon', ans: 9 }, { expr: 'Diagonals of pentagon', ans: 5 },
    { expr: 'Sum of ext. angles (any polygon)', ans: 360 },
    { expr: 'Arc for inscribed 45°', ans: 90 },
  ],
  'c014': [
    { expr: 'Distance: (0,0)→(3,4)', ans: 5 }, { expr: 'Distance: (0,0)→(5,12)', ans: 13 },
    { expr: 'Midpoint x: (2,8)', ans: 5 }, { expr: 'Midpoint y: (3,7)', ans: 5 },
    { expr: 'Reflect (3,4) about the x-axis → y', ans: -4 },
    { expr: 'Rotate 90° CCW: (1,0) → y', ans: 1 },
    { expr: 'Dilation k=3: length 4 → ?', ans: 12 },
    { expr: 'Dilation k=2: area 5 → ?', ans: 20 },
    { expr: 'Circle (x−1)²+(y−2)²=9 → r', ans: 3 },
    { expr: '|⟨3,4⟩| = ?', ans: 5 }, { expr: '⟨2,3⟩·⟨4,−1⟩', ans: 5 },
    { expr: 'Reflect (5,2) about the y-axis → x', ans: -5 },
    { expr: 'Distance: (1,1)→(4,5)', ans: 5 }, { expr: 'Midpoint x: (0,10)', ans: 5 },
  ],

  // Domain IV — Probability and Statistics
  'c015': [
    { expr: 'Mean: 2,4,6,8,10', ans: 6 }, { expr: 'Median: 1,3,5,7,9', ans: 5 },
    { expr: 'Mode: 4,4,5,6,7', ans: 4 }, { expr: 'Range: 3,7,12,20', ans: 17 },
    { expr: 'IQR: Q₃=8, Q₁=3', ans: 5 }, { expr: 'Mean: 10,20,30', ans: 20 },
    { expr: 'Median: 2,5,8,11,14', ans: 8 }, { expr: 'Range: 1,1,1,9', ans: 8 },
    { expr: 'Mean: 0,5,10,15,20', ans: 10 }, { expr: 'Median: 4,6,8', ans: 6 },
    { expr: 'Mode: 1,2,2,3,3,3', ans: 3 }, { expr: 'z = (82−75)/5 → round', ans: 1 },
    { expr: '68% rule: within ? σ', ans: 1 }, { expr: '95% rule: within ? σ', ans: 2 },
  ],
  'c016': [
    { expr: 'P(heads) as %', ans: 50 }, { expr: 'Faces on a die', ans: 6 },
    { expr: 'P(6 on die) → 1 in ?', ans: 6 }, { expr: 'Cards in deck', ans: 52 },
    { expr: 'C(5,2)', ans: 10 }, { expr: 'P(3,2)', ans: 6 },
    { expr: 'C(4,2)', ans: 6 }, { expr: '5!', ans: 120 },
    { expr: 'P(even on die) as %', ans: 50 }, { expr: 'P(A\')= 1−0.3 → as %', ans: 70 },
    { expr: 'Two coins → outcomes', ans: 4 }, { expr: 'Two dice → outcomes', ans: 36 },
    { expr: 'C(6,1)', ans: 6 }, { expr: 'Expected: E = 3(.5)+7(.5)', ans: 5 },
  ],
  'c017': [
    { expr: '95% CI → z ≈ ?', ans: 2 }, { expr: '99% CI → z ≈ ?', ans: 3 },
    { expr: 'Type I = false ? (1=pos,2=neg)', ans: 1 },
    { expr: '√(25) for SE calc', ans: 5 }, { expr: '√(100)', ans: 10 },
    { expr: 'r = 1 means ? correlation', ans: 1 },
    { expr: '# in sample if n=36 → √(n)', ans: 6 },
    { expr: 'σ=10, n=25 → SE = σ/√(n)', ans: 2 },
    { expr: 'Mean: 50, SE: 2, z=1 → upper', ans: 52 },
    { expr: 'Residual: obs=10, pred=7', ans: 3 },
    { expr: 'α = 0.05 → confidence %', ans: 95 },
    { expr: 'r² = 81 → r (positive)', ans: 9 },
    { expr: 'Power = 1 − β, β=0.2 → % power', ans: 80 },
    { expr: 'Degrees freedom: n−1, n=16', ans: 15 },
  ],

  // Domain V — Math Processes
  'c018': [
    { expr: '2+4+6+8+10', ans: 30 }, { expr: 'Next prime after 7', ans: 11 },
    { expr: 'n²+n+41 at n=1', ans: 43 }, { expr: 'Counter: "all primes odd" → ?', ans: 2 },
    { expr: '√(9+16)', ans: 5 }, { expr: '1+2+3+…+10', ans: 55 },
    { expr: 'Smallest perfect square > 50', ans: 64 },
    { expr: 'Triangular # for n=7', ans: 28 },
    { expr: '2⁰ + 2¹ + 2² + 2³', ans: 15 }, { expr: '100 − 37 − 26', ans: 37 },
    { expr: 'Area: 3×4 rect', ans: 12 }, { expr: '5² − 3²', ans: 16 },
    { expr: 'GCF(18,24)', ans: 6 }, { expr: 'LCM(6,10)', ans: 30 },
  ],
  'c019': [
    { expr: 'y=2x+1, f(4)', ans: 9 }, { expr: 'y=3x−5, f(3)', ans: 4 },
    { expr: 'Slope: (0,1)→(2,5)', ans: 2 }, { expr: 'Distance: (0,0)→(6,8)', ans: 10 },
    { expr: '|x−5|≤3 → lower bound', ans: 2 }, { expr: '|x−5|≤3 → upper bound', ans: 8 },
    { expr: 'Area: △ b=8, h=5', ans: 20 }, { expr: 'Perimeter: square side 7', ans: 28 },
    { expr: '3x = 21 → x', ans: 7 }, { expr: 'P(heads) as %', ans: 50 },
    { expr: 'Mean: 4, 6, 8', ans: 6 }, { expr: 'Hypotenuse: 8, 15, ?', ans: 17 },
    { expr: 'Volume: cube side 4', ans: 64 }, { expr: 'Median: 3,5,7,9,11', ans: 7 },
  ],

  // Domain VI — Learning & Assessment
  'c020': [
    { expr: 'CRA: C=concrete → # letters', ans: 3 },
    { expr: 'Bloom levels: how many?', ans: 6 },
    { expr: '¾ + ¼', ans: 1 }, { expr: '½ × 8', ans: 4 },
    { expr: '⅔ of 12', ans: 8 }, { expr: '3 × (4+2)', ans: 18 },
    { expr: '20% of 50', ans: 10 }, { expr: '25% of 80', ans: 20 },
    { expr: '10% of 130', ans: 13 }, { expr: '50% of 42', ans: 21 },
    { expr: '5 × 5 + 1', ans: 26 }, { expr: '(3+7) × 2', ans: 20 },
    { expr: '100 ÷ 4', ans: 25 }, { expr: '3² + 4²', ans: 25 },
  ],
  'c021': [
    { expr: '(x+3)² middle term coeff', ans: 6 },
    { expr: '¾ + ½ numerator over LCD 4', ans: 5 },
    { expr: '−3² = ? (order of ops)', ans: -9 },
    { expr: '(−3)² = ?', ans: 9 },
    { expr: 'Mean: 70, 80, 90', ans: 80 }, { expr: 'Median: 65, 75, 85, 95', ans: 80 },
    { expr: 'Score 85 − mean 70 ÷ SD 5 = z?', ans: 3 },
    { expr: '3(x+2) = 3x + ?', ans: 6 },
    { expr: 'Rubric levels typically', ans: 4 },
    { expr: '4² − 2²', ans: 12 }, { expr: '√(144)', ans: 12 },
    { expr: '½ of ½ × 100 as %', ans: 25 },
    { expr: '2(5) + 3(2)', ans: 16 }, { expr: '15 − (−5)', ans: 20 },
  ],

  // Comp-level fallback pools (when teks filter = comp00X)
  'comp001': [
    { expr: '|−12|', ans: 12 }, { expr: '√(49)', ans: 7 }, { expr: '2⁵', ans: 32 },
    { expr: '3³', ans: 27 }, { expr: '(−3)(−5)', ans: 15 }, { expr: '√(169)', ans: 13 },
    { expr: '|−9|', ans: 9 }, { expr: 'GCF(12,18)', ans: 6 }, { expr: 'LCM(4,6)', ans: 12 },
    { expr: '17 mod 5', ans: 2 }, { expr: 'C(5,2)', ans: 10 }, { expr: '5! ÷ 4!', ans: 5 },
  ],
  'comp002': [
    { expr: 'f(x)=2x+1, f(3)', ans: 7 }, { expr: 'Slope: (2,5)→(4,11)', ans: 3 },
    { expr: 'x²−5x+6=0 → small root', ans: 2 }, { expr: 'log₂(8)', ans: 3 },
    { expr: 'sin(30°)=1/?', ans: 2 }, { expr: 'tan(45°)', ans: 1 },
    { expr: 'a₁=2,d=3→a₅', ans: 14 }, { expr: 'd/dx[x²] at x=3', ans: 6 },
    { expr: 'Amplitude of 3sin(x)', ans: 3 }, { expr: '∛(27)', ans: 3 },
    { expr: 'Degree of x⁴+1', ans: 4 }, { expr: 'ln(e²)', ans: 2 },
  ],
  'comp003': [
    { expr: 'Area: rect 5×8', ans: 40 }, { expr: 'Perimeter: rect 5×8', ans: 26 },
    { expr: 'Hypotenuse: 3,4,?', ans: 5 }, { expr: '△ angle sum', ans: 180 },
    { expr: 'Distance: (0,0)→(3,4)', ans: 5 }, { expr: 'Inscribed ∠ for 100° arc', ans: 50 },
    { expr: 'Supplementary to 65°', ans: 115 }, { expr: 'Volume: cube side 3', ans: 27 },
    { expr: 'Dilation k=2 → area ×?', ans: 4 }, { expr: '|⟨3,4⟩|', ans: 5 },
    { expr: 'Each angle regular △', ans: 60 }, { expr: 'Exterior angle sum', ans: 360 },
  ],
  'comp004': [
    { expr: 'Mean: 2,4,6,8,10', ans: 6 }, { expr: 'Median: 1,3,5,7,9', ans: 5 },
    { expr: 'P(heads) as %', ans: 50 }, { expr: 'C(5,2)', ans: 10 },
    { expr: 'σ=10, n=25 → SE', ans: 2 }, { expr: '95% CI → z ≈ ?', ans: 2 },
    { expr: 'Range: 3,7,12,20', ans: 17 }, { expr: 'Mode: 4,4,5,6,7', ans: 4 },
    { expr: '5!', ans: 120 }, { expr: 'Cards in deck', ans: 52 },
    { expr: 'IQR: Q₃=8, Q₁=3', ans: 5 }, { expr: 'Two dice → outcomes', ans: 36 },
  ],
  'comp005': [
    { expr: '2+4+6+8+10', ans: 30 }, { expr: '√(9+16)', ans: 5 },
    { expr: 'Next prime after 7', ans: 11 }, { expr: '1+2+3+…+10', ans: 55 },
    { expr: '5² − 3²', ans: 16 }, { expr: 'Slope: (0,1)→(2,5)', ans: 2 },
    { expr: 'Distance: (0,0)→(6,8)', ans: 10 }, { expr: 'Mean: 4,6,8', ans: 6 },
    { expr: '|x−5|≤3 → lower bound', ans: 2 }, { expr: 'Area: △ b=8, h=5', ans: 20 },
    { expr: '3x=21 → x', ans: 7 }, { expr: 'Hypotenuse: 8,15,?', ans: 17 },
  ],
  'comp006': [
    { expr: '½ × 8', ans: 4 }, { expr: '⅔ of 12', ans: 8 },
    { expr: '25% of 80', ans: 20 }, { expr: '(x+3)² middle term coeff', ans: 6 },
    { expr: '(−3)² = ?', ans: 9 }, { expr: 'Mean: 70,80,90', ans: 80 },
    { expr: '3(x+2) = 3x + ?', ans: 6 }, { expr: '3² + 4²', ans: 25 },
    { expr: '20% of 50', ans: 10 }, { expr: '√(144)', ans: 12 },
    { expr: '50% of 42', ans: 21 }, { expr: '10% of 130', ans: 13 },
  ],
  calc_limits: [
    { expr: 'lim(x->0) sin(x)/x', ans: 1 }, { expr: 'lim(x->3) (x^2-9)/(x-3)', ans: 6 },
    { expr: 'lim(x->infinity) 1/x', ans: 0 }, { expr: 'lim(x->2) (x^2-4)/(x-2)', ans: 4 },
    { expr: 'lim(x->0) (1-cos x)/x^2', ans: 0.5 }, { expr: 'lim(x->infinity) ln(x)/x', ans: 0 },
  ],
  calc_derivatives: [
    { expr: 'd/dx[x^3] at x=2', ans: 12 }, { expr: 'd/dx[x^2] at x=3', ans: 6 },
    { expr: 'd/dx[sin x] at x=0', ans: 1 }, { expr: 'd/dx[e^x] at x=0', ans: 1 },
    { expr: 'd/dx[ln x] at x=1', ans: 1 }, { expr: 'd/dx[x^4] at x=1', ans: 4 },
  ],
  calc_derivative_apps: [
    { expr: 'f\'(x) > 0 means function is', ans: 1 }, { expr: 'f\'(x) < 0 means function is', ans: -1 },
    { expr: 'f\'\'(x) > 0 means concave', ans: 1 }, { expr: 'f\'\'(x) < 0 means concave', ans: -1 },
    { expr: 'A critical point can occur if f\'(x)=', ans: 0 }, { expr: 'Local max test sign change + to', ans: -1 },
  ],
  calc_integrals: [
    { expr: 'Integral of 2x from 0 to 1', ans: 1 }, { expr: 'Integral of 1 from 0 to 3', ans: 3 },
    { expr: 'Integral of 3x^2 from 0 to 2', ans: 8 }, { expr: 'Integral of x from 0 to 4', ans: 8 },
    { expr: 'Integral of cos(x) from 0 to pi/2', ans: 1 }, { expr: 'Integral of 5 from 0 to 2', ans: 10 },
  ],
  calc_series: [
    { expr: 'Convergence if |r| <', ans: 1 }, { expr: 'Maclaurin center value', ans: 0 },
    { expr: 'Harmonic series converges (1 yes, 0 no)', ans: 0 }, { expr: 'If term test fails, converges (1 yes, 0 no)', ans: 0 },
    { expr: 'sum n=1..4 of n', ans: 10 }, { expr: 'sum n=1..5 of n', ans: 15 },
  ],
  calc_advanced: [
    { expr: 'Average value factor on [a,b]', ans: 1 }, { expr: 'dy/dx for parametric uses quotient count', ans: 2 },
    { expr: 'Polar area uses factor 1/?', ans: 2 }, { expr: 'e^0', ans: 1 },
    { expr: 'ln(e^3)', ans: 3 }, { expr: 'Initial value data points needed', ans: 1 },
  ],
  calc_c001: [
    { expr: 'lim(x->3) (x^2-9)/(x-3)', ans: 6 }, { expr: 'lim(x->0) sin x/x', ans: 1 },
    { expr: 'lim(x->infinity) 1/x', ans: 0 }, { expr: 'lim(x->2) (x^2-4)/(x-2)', ans: 4 },
  ],
  calc_c002: [
    { expr: 'lim(x->0) (1-cos x)/x^2', ans: 0.5 }, { expr: 'lim(x->infinity) ln x/x', ans: 0 },
    { expr: 'lim(x->infinity) x/e^x', ans: 0 }, { expr: 'LHospital on x/x at infinity', ans: 1 },
  ],
  calc_c003: [
    { expr: 'd/dx[x^5] at x=1', ans: 5 }, { expr: 'd/dx[x^2+3x] at x=1', ans: 5 },
    { expr: 'd/dx[cos x] at x=0', ans: 0 }, { expr: 'd/dx[ln x] at x=1', ans: 1 },
  ],
  calc_c004: [
    { expr: 'd/dx[e^x] at 0', ans: 1 }, { expr: 'd/dx[a^x] includes ln(a): count letters', ans: 2 },
    { expr: 'If x^2+y^2=1 at (0,1), dy/dx', ans: 0 }, { expr: 'Related rates often use dt variable index', ans: 1 },
  ],
  calc_c005: [
    { expr: 'f\' sign + then - gives local max (1 yes)', ans: 1 }, { expr: 'f\' sign - then + gives local min (1 yes)', ans: 1 },
    { expr: 'critical if f\'=0 (1 yes)', ans: 1 }, { expr: 'critical if f\' undefined (1 yes)', ans: 1 },
  ],
  calc_c006: [
    { expr: 'f\'\' positive means concave up (1 yes)', ans: 1 }, { expr: 'f\'\' negative means concave down (1 yes)', ans: 1 },
    { expr: 'Inflection requires concavity change (1 yes)', ans: 1 }, { expr: 'Second derivative at max is often', ans: -1 },
  ],
  calc_c007: [
    { expr: 'Optimize area with fixed perimeter uses derivative (1 yes)', ans: 1 }, { expr: 'Include endpoints for absolute extrema (1 yes)', ans: 1 },
    { expr: 'Critical candidate from derivative equals', ans: 0 }, { expr: 'Local min f\' sign change from - to', ans: 1 },
  ],
  calc_c008: [
    { expr: 'Integral of 2x', ans: 1 }, { expr: 'Integral of x^2 gives denominator', ans: 3 },
    { expr: 'Integral of sec^2 x is tan x (1 yes)', ans: 1 }, { expr: 'Integral includes +C term count', ans: 1 },
  ],
  calc_c009: [
    { expr: 'Integral 0..3 of 1', ans: 3 }, { expr: 'Integral 1..3 of 2', ans: 4 },
    { expr: 'Area below axis contributes sign', ans: -1 }, { expr: 'Net area can cancel (1 yes)', ans: 1 },
  ],
  calc_c010: [
    { expr: 'u-sub reverses chain rule (1 yes)', ans: 1 }, { expr: 'Choose u as inner function count', ans: 1 },
    { expr: 'Back-substitute variable count', ans: 1 }, { expr: 'Integral of 2x e^(x^2) uses u=x^2 (1 yes)', ans: 1 },
  ],
  calc_c011: [
    { expr: 'Ratio test L<1 converges (1 yes)', ans: 1 }, { expr: 'Ratio test L>1 diverges (1 yes)', ans: 1 },
    { expr: 'Geometric |r|<1 converges (1 yes)', ans: 1 }, { expr: 'Term not->0 diverges (1 yes)', ans: 1 },
  ],
  calc_c012: [
    { expr: 'dy/dx=(dy/dt)/(dx/dt) has numerator count', ans: 1 }, { expr: 'Average value multiplier 1/(b-a) numerator', ans: 1 },
    { expr: 'Polar area includes factor 1/2 as denominator', ans: 2 }, { expr: 'IVP needs initial condition count', ans: 1 },
  ],
};

const ALL_TEKS = Object.keys(Q_POOLS);

const STD_TO_COMP = {
  c001: 'comp001', c002: 'comp001', c003: 'comp001',
  c004: 'comp002', c005: 'comp002', c006: 'comp002', c007: 'comp002', c008: 'comp002', c009: 'comp002', c010: 'comp002',
  c011: 'comp003', c012: 'comp003', c013: 'comp003', c014: 'comp003',
  c015: 'comp004', c016: 'comp004', c017: 'comp004',
  c018: 'comp005', c019: 'comp005',
  c020: 'comp006', c021: 'comp006',
  calc_c001: 'calc_limits', calc_c002: 'calc_limits',
  calc_c003: 'calc_derivatives', calc_c004: 'calc_derivatives',
  calc_c005: 'calc_derivative_apps', calc_c006: 'calc_derivative_apps', calc_c007: 'calc_derivative_apps',
  calc_c008: 'calc_integrals', calc_c009: 'calc_integrals', calc_c010: 'calc_integrals',
  calc_c011: 'calc_series',
  calc_c012: 'calc_advanced',
};

function inferCompFromStandard(standardId = '') {
  const calc = String(standardId).match(/^calc_c(\d{3})$/i);
  if (calc) {
    const n = Number(calc[1]);
    if (n >= 1 && n <= 2) return 'calc_limits';
    if (n >= 3 && n <= 4) return 'calc_derivatives';
    if (n >= 5 && n <= 7) return 'calc_derivative_apps';
    if (n >= 8 && n <= 10) return 'calc_integrals';
    if (n === 11) return 'calc_series';
    if (n === 12) return 'calc_advanced';
  }
  const m = String(standardId).match(/^c(\d{3})$/i);
  if (!m) return '';
  const n = Number(m[1]);
  if (n >= 1 && n <= 3) return 'comp001';
  if (n >= 4 && n <= 10) return 'comp002';
  if (n >= 11 && n <= 14) return 'comp003';
  if (n >= 15 && n <= 17) return 'comp004';
  if (n >= 18 && n <= 19) return 'comp005';
  if (n >= 20 && n <= 21) return 'comp006';
  return '';
}

function buildGame(filterTeks, options = {}) {
  const { compId = '', currentStd = '', strictScope = false } = options;
  const teksIds = filterTeks
    ? filterTeks.split(',').map(t => t.trim()).filter(Boolean)
    : [];
  const directStdKeys = [...new Set([currentStd, ...teksIds].filter((id) => id && /^(c\d{3}|calc_c\d{3})$/i.test(id) && Q_POOLS[id]))];
  const inferredCompKeys = [...new Set([
    compId,
    STD_TO_COMP[currentStd],
    inferCompFromStandard(currentStd),
    ...teksIds.map((id) => STD_TO_COMP[id]).filter(Boolean),
    ...teksIds.map((id) => inferCompFromStandard(id)).filter(Boolean),
  ].filter((id) => id && Q_POOLS[id]))];
  const scopeKeys = strictScope
    // In loop mode, prefer exact competency standard pool (e.g., c002) before broad domain pools.
    ? (directStdKeys.length > 0 ? directStdKeys : inferredCompKeys)
    : [...new Set([...directStdKeys, ...inferredCompKeys])];

  // 1. Build the pool — use only matching scope keys when available.
  let matchedPool = [];
  const keysToUse = scopeKeys.length > 0 ? scopeKeys : teksIds;
  if (keysToUse.length > 0) {
    for (const id of keysToUse) {
      if (Q_POOLS[id]) {
        Q_POOLS[id].forEach(q => matchedPool.push({ ...q, teks: id }));
      }
    }
  }

  // Strict loop mode fallback chain (keeps competency alignment where possible).
  if (strictScope && matchedPool.length === 0) {
    const fallbackKeys = [...new Set([
      ...inferredCompKeys,
    ].filter(Boolean))];
    for (const id of fallbackKeys) {
      if (Q_POOLS[id]) Q_POOLS[id].forEach((q) => matchedPool.push({ ...q, teks: id }));
    }
  }

  let fullPool;
  if (strictScope && matchedPool.length === 0) {
    // In loop strict mode, never leak unrelated TEKS into the deck.
    fullPool = [];
  } else if (matchedPool.length >= 24) {
    fullPool = matchedPool.sort(() => Math.random() - 0.5);
  } else if (strictScope && matchedPool.length > 0) {
    // Strict loop mode: never pull from unrelated competencies.
    fullPool = matchedPool.sort(() => Math.random() - 0.5);
  } else if (matchedPool.length > 0) {
    const matchedTeksSet = new Set(keysToUse);
    const rest = [];
    ALL_TEKS.forEach(t => {
      if (!matchedTeksSet.has(t)) Q_POOLS[t].forEach(q => rest.push({ ...q, teks: t }));
    });
    fullPool = [
      ...matchedPool.sort(() => Math.random() - 0.5),
      ...rest.sort(() => Math.random() - 0.5),
    ];
  }
  else {
    fullPool = [];
    ALL_TEKS.forEach(t => {
      Q_POOLS[t].forEach(q => fullPool.push({ ...q, teks: t }));
    });
    fullPool.sort(() => Math.random() - 0.5);
  }

  // 2. Pick exactly 24 questions with UNIQUE answers — one per card cell
  const cardQuestions = [];
  const usedAnswers = new Set();
  for (const q of fullPool) {
    if (!usedAnswers.has(q.ans) && cardQuestions.length < 24) {
      usedAnswers.add(q.ans);
      cardQuestions.push(q);
    }
  }

  // Pad if the pool didn't have 24 unique answers
  while (cardQuestions.length < 24) {
    if (strictScope && fullPool.length > 0) {
      const src = fullPool[cardQuestions.length % fullPool.length];
      cardQuestions.push({ ...src });
      continue;
    }
    const extra = Math.floor(Math.random() * 90) + 10;
    if (!usedAnswers.has(extra)) {
      usedAnswers.add(extra);
      cardQuestions.push({ expr: String(extra), ans: extra, teks: (keysToUse[0] || teksIds[0] || 'misc') });
    }
  }

  // 3. Build the bingo card (answer values + FREE in center)
  const cardAnswers = cardQuestions.map(q => q.ans).sort(() => Math.random() - 0.5);
  cardAnswers.splice(12, 0, 'FREE');

  // 4. Caller deck = exactly 24 questions, one per card cell, shuffled.
  const callerDeck = [...cardQuestions].sort(() => Math.random() - 0.5);

  return { card: cardAnswers, deck: callerDeck };
}

function checkWin(marked) {
  const lines = [];
  // Rows
  for (let r = 0; r < GRID; r++) {
    lines.push(Array.from({ length: GRID }, (_, c) => r * GRID + c));
  }
  // Columns
  for (let c = 0; c < GRID; c++) {
    lines.push(Array.from({ length: GRID }, (_, r) => r * GRID + c));
  }
  // Diagonals
  lines.push(Array.from({ length: GRID }, (_, i) => i * GRID + i));
  lines.push(Array.from({ length: GRID }, (_, i) => i * GRID + (GRID - 1 - i)));

  for (const line of lines) {
    if (line.every(idx => marked.has(idx))) return line;
  }
  return null;
}

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];
const CELL_COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed'];

/* ═══════════════════════════════════════════════════════════ */
const MathBingo = () => {
  const [searchParams] = useSearchParams();
  const teksFilter = searchParams.get('teks');
  const compFilter = searchParams.get('comp') || '';
  const currentStd = searchParams.get('currentStd') || searchParams.get('std') || '';
  const strictScope = searchParams.get('from') === 'loop' && !!(teksFilter || compFilter || currentStd);
  const sid = searchParams.get('sid');
  const aid = searchParams.get('aid');
  const cid = searchParams.get('cid');
  const { returnUrl, goBack, isEmbedded } = useGameReturn();

  const [{ card: initCard, deck: initDeck }] = useState(() => buildGame(teksFilter, { compId: compFilter, currentStd, strictScope }));
  const [deck, setDeck] = useState(initDeck);
  const [card, setCard] = useState(initCard);
  const [marked, setMarked] = useState(new Set([12])); // FREE space pre-marked
  const [callIndex, setCallIndex] = useState(-1); // current call
  const [calledHistory, setCalledHistory] = useState([]);
  const [currentCall, setCurrentCall] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [wrongPick, setWrongPick] = useState(null);
  const [winLine, setWinLine] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [deckExhausted, setDeckExhausted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [callAnim, setCallAnim] = useState(false);
  const [missedCount, setMissedCount] = useState(0);
  const [saveError, setSaveError] = useState('');

  const deckRef = useRef(deck);
  deckRef.current = deck;

  useEffect(() => {
    const g = buildGame(teksFilter, { compId: compFilter, currentStd, strictScope });
    setDeck(g.deck);
    setCard(g.card);
    trackEvent('math_bingo_start', { teksFilter: teksFilter || 'all' });
  }, [teksFilter, compFilter, currentStd, strictScope]);

  const nextCall = useCallback(() => {
    if (gameOver) return;
    const nextIdx = callIndex + 1;
    if (nextIdx >= deckRef.current.length) {
      setDeckExhausted(true);
      setGameOver(true);
      trackEvent('math_bingo_deck_exhausted', { teksFilter: teksFilter || 'all', score });
      return;
    }

    setCallAnim(true);
    setTimeout(() => setCallAnim(false), 600);

    const q = deckRef.current[nextIdx];
    setCallIndex(nextIdx);
    setCurrentCall(q);
    setShowAnswer(false);
    setWrongPick(null);
    setCalledHistory(prev => [...prev, q]);
  }, [callIndex, gameOver, teksFilter, score]);

  // Auto-call first question
  useEffect(() => {
    if (callIndex === -1) {
      const timer = setTimeout(() => nextCall(), 800);
      return () => clearTimeout(timer);
    }
  }, [callIndex, nextCall]);

  const handleCellClick = useCallback((idx) => {
    if (gameOver || !currentCall || marked.has(idx) || card[idx] === 'FREE') return;

    const cellValue = card[idx];
    if (cellValue === currentCall.ans) {
      // Correct!
      const newMarked = new Set([...marked, idx]);
      setMarked(newMarked);
      setScore(prev => prev + 100);
      setShowAnswer(true);

      setAnsweredQuestions(prev => [...prev, {
        question: currentCall.expr,
        correctAnswer: String(currentCall.ans),
        studentAnswer: String(currentCall.ans),
        correct: true,
        teks: currentCall.teks,
      }]);

      // Check win
      const line = checkWin(newMarked);
      if (line) {
        setWinLine(line);
        setGameOver(true);
        fireConfetti({ intensity: 'high' });
        trackEvent('math_bingo_win', { teksFilter: teksFilter || 'all', score: score + 600 });
        setScore(prev => prev + 500);
        const finalScore = score + 100 + 500;
        try {
          saveGameResult('math-bingo', {
            score: finalScore, total: 25 * 100 + 500,
            percentage: Math.round((finalScore / (25 * 100 + 500)) * 100),
            teksStandards: [...new Set(answeredQuestions.map(q => q.teks).concat(currentCall.teks))],
            questions: [...answeredQuestions, {
              question: currentCall.expr,
              correctAnswer: String(currentCall.ans),
              studentAnswer: String(currentCall.ans),
              correct: true,
              teks: currentCall.teks,
            }],
          }, { sid, aid, cid });
          setSaveError('');
        } catch {
          setSaveError('Could not save this game result locally. You can still continue playing.');
        }
      }
    } else {
      // Wrong cell
      setWrongPick(idx);
      setMissedCount(prev => prev + 1);
      setTimeout(() => setWrongPick(null), 600);

      setAnsweredQuestions(prev => [...prev, {
        question: currentCall.expr,
        correctAnswer: String(currentCall.ans),
        studentAnswer: String(cellValue),
        correct: false,
        teks: currentCall.teks,
      }]);
    }
  }, [gameOver, currentCall, marked, card, score, answeredQuestions, sid, aid, cid, teksFilter]);

  const handleSkip = () => {
    if (!currentCall || gameOver) return;
    setShowAnswer(true);
    setMissedCount(prev => prev + 1);
  };

  const resetGame = () => {
    const g = buildGame(teksFilter, { compId: compFilter, currentStd, strictScope });
    setDeck(g.deck);
    setCard(g.card);
    setMarked(new Set([12]));
    setCallIndex(-1);
    setCalledHistory([]);
    setCurrentCall(null);
    setShowAnswer(false);
    setWrongPick(null);
    setWinLine(null);
    setGameOver(false);
    setDeckExhausted(false);
    setShowReview(false);
    setScore(0);
    setAnsweredQuestions([]);
    setMissedCount(0);
    setSaveError('');
  };

  if (strictScope && (!deck || deck.length === 0)) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#7f1d1d' }}>
          No competency-aligned Bingo deck is available for this loop step yet.
        </div>
        <div style={{ marginTop: 12 }}>
          {returnUrl ? <LoopContinueButton onClick={goBack} /> : !isEmbedded ? <Link to="/games">Back to Games</Link> : null}
        </div>
      </div>
    );
  }

  if (showReview) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <GameReview
          questions={answeredQuestions}
          score={score}
          total={25 * 100 + 500}
          gameName="Math Bingo"
          onClose={() => setShowReview(false)}
        />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
          <button onClick={resetGame} style={btnStyle('#22c55e')}>Play Again</button>
          {!isEmbedded && <Link to="/games" style={{ ...btnStyle('#6366f1'), textDecoration: 'none' }}>Back to Games</Link>}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      color: '#fff',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px',
        background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        {returnUrl ? (
          <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: 0 }}>← Continue</button>
        ) : !isEmbedded ? (
          <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Games</Link>
        ) : <span />}
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 2, color: '#fbbf24' }}>
          MATH BINGO
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fbbf24' }}>{score}</div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>Score</div>
        </div>
      </div>

      {/* QBot Caller */}
      <div style={{
        maxWidth: 480, margin: '16px auto 0', padding: '0 16px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 16, padding: '14px 18px',
          border: '2px solid rgba(251,191,36,0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* QBot avatar */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #c7d2fe', overflow: 'hidden',
          }}>
            <img src={qbotImg} alt="QBot" style={{ width: 40, height: 'auto' }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
              QBot calls:
            </div>
            {currentCall ? (
              <div style={{
                fontSize: 22, fontWeight: 900, color: '#f1f5f9',
                animation: callAnim ? 'popCall 0.4s ease' : 'none',
              }}>
                {currentCall.expr}
                {showAnswer && (
                  <span style={{ fontSize: 14, color: '#22c55e', marginLeft: 10 }}>
                    = {currentCall.ans}
                  </span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 16, color: '#94a3b8' }}>Starting...</div>
            )}
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
              Call {callIndex + 1} of {deck.length}
              {currentCall && <span> · {currentCall.teks}</span>}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            {showAnswer && !gameOver && (
              <button onClick={nextCall} style={{
                padding: '8px 16px', background: '#22c55e', color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
              }}>
                Next ▶
              </button>
            )}
            {!showAnswer && currentCall && !gameOver && (
              <button onClick={handleSkip} style={{
                padding: '6px 12px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, cursor: 'pointer',
                fontSize: 11, fontWeight: 600,
              }}>
                Show Answer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Called numbers history */}
      {calledHistory.length > 1 && (
        <div style={{
          maxWidth: 480, margin: '8px auto 0', padding: '0 16px',
          display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {calledHistory.slice(0, -1).reverse().slice(0, 10).map((q, i) => (
            <span key={i} style={{
              padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
              background: 'rgba(255,255,255,0.06)', color: '#64748b',
            }}>
              {q.ans}
            </span>
          ))}
          {calledHistory.length > 11 && (
            <span style={{ fontSize: 10, color: '#475569' }}>+{calledHistory.length - 11} more</span>
          )}
        </div>
      )}

      {/* Bingo Card */}
      <div style={{
        maxWidth: 400, margin: '16px auto 0', padding: '0 16px',
      }}>
        {/* BINGO header */}
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${GRID}, 1fr)`, gap: 4, marginBottom: 4,
        }}>
          {BINGO_LETTERS.map((letter, i) => (
            <div key={letter} style={{
              textAlign: 'center', padding: '8px 0',
              fontSize: 22, fontWeight: 900, color: CELL_COLORS[i],
              letterSpacing: 2,
            }}>
              {letter}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID}, 1fr)`,
          gap: 4,
        }}>
          {card.map((value, idx) => {
            const col = idx % GRID;
            const isMarked = marked.has(idx);
            const isFree = value === 'FREE';
            const isWinCell = winLine && winLine.includes(idx);
            const isWrong = wrongPick === idx;
            const colColor = CELL_COLORS[col];

            return (
              <button
                key={idx}
                type="button"
                disabled={isMarked || isFree || gameOver}
                onClick={() => handleCellClick(idx)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isMarked || isFree || gameOver ? 'default' : 'pointer',
                  fontSize: isFree ? 13 : value >= 100 ? 14 : 18,
                  fontWeight: 800,
                  border: isWinCell
                    ? '3px solid #fbbf24'
                    : isWrong
                      ? '3px solid #ef4444'
                      : isMarked
                        ? '2px solid #22c55e'
                        : `2px solid ${colColor}33`,
                  background: isWinCell
                    ? 'rgba(251,191,36,0.2)'
                    : isWrong
                      ? 'rgba(239,68,68,0.2)'
                      : isMarked
                        ? 'rgba(34,197,94,0.15)'
                        : isFree
                          ? 'rgba(251,191,36,0.1)'
                          : 'rgba(255,255,255,0.04)',
                  color: isWinCell
                    ? '#fbbf24'
                    : isWrong
                      ? '#ef4444'
                      : isMarked
                        ? '#22c55e'
                        : isFree
                          ? '#fbbf24'
                          : '#e2e8f0',
                  transition: motionTransition('all 0.2s'),
                  boxShadow: isWinCell ? '0 0 16px rgba(251,191,36,0.3)' : 'none',
                  animation: isWrong ? motionTransition('shake 0.3s ease') : isMarked && !isFree ? motionTransition('stampIn 0.3s ease') : 'none',
                  position: 'relative',
                }}
              >
                {isFree ? (
                  <>
                    <span style={{ fontSize: 18 }}>⭐</span>
                    <span>FREE</span>
                  </>
                ) : (
                  value
                )}
                {isMarked && !isFree && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, pointerEvents: 'none',
                  }}>
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* How to play */}
      <div style={{
        maxWidth: 420, margin: '16px auto 0', padding: '0 20px',
        fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 1.6,
      }}>
        <strong style={{ color: '#94a3b8' }}>How to play:</strong> QBot calls a math expression.
        Find the <strong>answer</strong> on your card and click it!
        Get 5 in a row (horizontal, vertical, or diagonal) to win.
      </div>
      {saveError && (
        <div style={{ maxWidth: 480, margin: '10px auto 0', padding: '10px 12px', borderRadius: 10, border: '1px solid #fca5a5', background: '#fef2f2', color: '#991b1b', fontSize: 12, fontWeight: 600 }}>
          {saveError}
        </div>
      )}

      {/* Win / Game Over overlay */}
      {gameOver && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'linear-gradient(170deg, #1e293b, #0f172a)',
            borderRadius: 20, padding: '36px 32px', textAlign: 'center',
            border: `3px solid ${deckExhausted ? '#64748b' : '#fbbf24'}`,
            maxWidth: 380, width: '90%',
            boxShadow: `0 0 60px ${deckExhausted ? 'rgba(100,116,139,0.2)' : 'rgba(251,191,36,0.2)'}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{deckExhausted ? '⏱️' : '🎉'}</div>
            <h2 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 900, color: deckExhausted ? '#94a3b8' : '#fbbf24' }}>
              {deckExhausted ? 'No More Calls' : 'BINGO!'}
            </h2>
            <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: 14 }}>
              {deckExhausted ? 'The call deck ended before a bingo line formed. Rework missed calls and retry.' : 'You formed a valid bingo line from correct answers!'}
            </p>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
              background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 14, marginBottom: 20,
            }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24' }}>{score}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Score</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>
                  {answeredQuestions.filter(q => q.correct).length}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Correct</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444' }}>
                  {missedCount}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Missed</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={resetGame} style={btnStyle('#22c55e')}>Play Again</button>
              <button onClick={() => setShowReview(true)} style={btnStyle('#6366f1')}>Review Solutions</button>
              {!isEmbedded && <Link to="/games" style={{ ...btnStyle('#475569'), textDecoration: 'none', display: 'block' }}>Back to Games</Link>}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popCall {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes stampIn {
          0% { transform: scale(1.3); }
          50% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </div>
  );
};

function btnStyle(bg) {
  return {
    padding: '12px 24px', background: bg, color: '#fff',
    border: 'none', borderRadius: 10, cursor: 'pointer',
    fontSize: 14, fontWeight: 700, textAlign: 'center',
  };
}

export default MathBingo;
