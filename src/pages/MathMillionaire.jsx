import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import qbotImg from '../assets/qbot.svg';
import { sanitizeHtml } from '../utils/sanitize';
import { formatMathHtml } from '../utils/mathFormat';

/* ═══════════════════════════════════════════════════════════
   MATH MILLIONAIRE — Who Wants to Be a Millionaire style
   15 progressively harder questions, 3 lifelines
   ═══════════════════════════════════════════════════════════ */

const PRIZE_LADDER = [
  100, 200, 300, 500, 1000,
  2000, 4000, 8000, 16000, 32000,
  64000, 125000, 250000, 500000, 1000000,
];
const SAFE_HAVENS = [4, 9]; // indices 4 ($1,000) and 9 ($32,000) are guaranteed
const TOTAL_QUESTIONS = 15;

/* ── Question pools by difficulty tier ── */
const EASY_DEFAULT = [
  { q: 'What is 3 + 5?', choices: ['7', '8', '9', '6'], correct: 1, teks: '3.4A' },
  { q: 'What is 10 − 4?', choices: ['5', '6', '7', '4'], correct: 1, teks: '3.4A' },
  { q: 'What is 2 × 3?', choices: ['5', '8', '6', '9'], correct: 2, teks: '3.4C' },
  { q: 'What is 12 ÷ 4?', choices: ['4', '2', '3', '6'], correct: 2, teks: '3.4D' },
  { q: 'What is 7 + 8?', choices: ['14', '16', '15', '13'], correct: 2, teks: '3.4A' },
  { q: 'What is 9 − 3?', choices: ['5', '7', '6', '4'], correct: 2, teks: '3.4A' },
  { q: 'What is 4 × 2?', choices: ['6', '10', '8', '12'], correct: 2, teks: '3.4C' },
  { q: 'What is 20 ÷ 5?', choices: ['5', '4', '3', '6'], correct: 1, teks: '3.4D' },
  { q: 'What is 6 + 9?', choices: ['14', '15', '16', '13'], correct: 1, teks: '3.4A' },
  { q: 'What is 15 − 7?', choices: ['9', '7', '8', '6'], correct: 2, teks: '3.4A' },
  { q: 'What is 5 × 1?', choices: ['1', '10', '5', '6'], correct: 2, teks: '3.4C' },
  { q: 'What is 18 ÷ 3?', choices: ['5', '7', '6', '9'], correct: 2, teks: '3.4D' },
  { q: 'Which digit is in the tens place of 482?', choices: ['4', '2', '8', '48'], correct: 2, teks: '3.2A' },
  { q: 'What is 50 + 30?', choices: ['70', '90', '80', '60'], correct: 2, teks: '3.4A' },
  { q: 'What is 3 × 5?', choices: ['12', '18', '15', '20'], correct: 2, teks: '3.4C' },
];

const MEDIUM_DEFAULT = [
  { q: 'What is 245 + 378?', choices: ['613', '623', '633', '523'], correct: 1, teks: '3.4A' },
  { q: 'What is 800 − 356?', choices: ['544', '454', '444', '434'], correct: 2, teks: '3.4A' },
  { q: 'What is 7 × 8?', choices: ['54', '48', '56', '64'], correct: 2, teks: '3.4C' },
  { q: 'What is 63 ÷ 9?', choices: ['8', '9', '7', '6'], correct: 2, teks: '3.4D' },
  { q: 'What is ½ of 16?', choices: ['6', '9', '8', '4'], correct: 2, teks: '3.3F' },
  { q: 'What is the value of 5 in 3,582?', choices: ['5', '50', '500', '5,000'], correct: 2, teks: '3.2A' },
  { q: 'What is 6 × 9?', choices: ['45', '63', '54', '56'], correct: 2, teks: '3.4C' },
  { q: 'What is 72 ÷ 8?', choices: ['8', '7', '9', '6'], correct: 2, teks: '3.4D' },
  { q: '423 + 289 = ?', choices: ['702', '712', '612', '722'], correct: 1, teks: '3.4A' },
  { q: 'What is ⅓ of 18?', choices: ['3', '9', '6', '12'], correct: 2, teks: '3.3F' },
  { q: 'If 4 × ___ = 36, what is ___?', choices: ['7', '8', '9', '6'], correct: 2, teks: '3.5B' },
  { q: 'Round 467 to the nearest hundred.', choices: ['400', '470', '500', '460'], correct: 2, teks: '3.2C' },
  { q: 'What is 8 × 7?', choices: ['54', '48', '56', '63'], correct: 2, teks: '3.4C' },
  { q: 'What is 900 − 478?', choices: ['432', '422', '412', '522'], correct: 1, teks: '3.4A' },
  { q: 'What is ¼ of 20?', choices: ['4', '10', '5', '8'], correct: 2, teks: '3.3F' },
];

const HARD_DEFAULT = [
  { q: 'A rectangle is 8 cm long and 5 cm wide. What is its perimeter?', choices: ['13 cm', '40 cm', '26 cm', '30 cm'], correct: 2, teks: '3.7B' },
  { q: 'What is 9 × 9?', choices: ['72', '81', '90', '63'], correct: 1, teks: '3.4C' },
  { q: 'A square has a side of 6 cm. What is its area?', choices: ['24 cm²', '12 cm²', '36 cm²', '30 cm²'], correct: 2, teks: '3.7B' },
  { q: '1,000 − 467 = ?', choices: ['633', '543', '533', '567'], correct: 2, teks: '3.4A' },
  { q: 'Which fraction is greater: ⅓ or ¼?', choices: ['⅓', '¼', 'They are equal', 'Cannot tell'], correct: 0, teks: '3.3F' },
  { q: 'If the pattern is 5, 10, 20, 40, ___ what comes next?', choices: ['60', '50', '80', '45'], correct: 2, teks: '3.5A' },
  { q: 'A rectangle is 12 cm long and 3 cm wide. What is its area?', choices: ['30 cm²', '36 cm²', '15 cm²', '24 cm²'], correct: 1, teks: '3.7B' },
  { q: '578 + 394 = ?', choices: ['962', '972', '872', '982'], correct: 1, teks: '3.4A' },
  { q: 'Which number sentence is true?', choices: ['5 × 4 = 4 × 5', '5 × 4 = 5 + 4', '4 × 5 = 4 + 5', '5 × 4 = 54'], correct: 0, teks: '3.4C' },
  { q: 'If 7 × ___ = 56, what goes in the blank?', choices: ['6', '9', '8', '7'], correct: 2, teks: '3.5B' },
  { q: 'A garden is 9 m by 4 m. How many 1 m² tiles to cover it?', choices: ['26', '13', '36', '32'], correct: 2, teks: '3.7B' },
  { q: 'Round 1,851 to the nearest thousand.', choices: ['1,800', '1,900', '2,000', '1,000'], correct: 2, teks: '3.2C' },
  { q: 'What fraction of a dollar is 25 cents?', choices: ['½', '⅓', '¼', '⅕'], correct: 2, teks: '3.3F' },
  { q: 'Amy has 48 stickers shared equally among 6 friends. How many each?', choices: ['6', '7', '8', '9'], correct: 2, teks: '3.4D' },
  { q: 'Which is the best estimate for 489 + 312?', choices: ['700', '900', '800', '1,000'], correct: 2, teks: '3.4A' },
];

/* ── TExES 7-12 competency-aligned question pools ── */
const COMP_POOLS = {
  comp001: {
    easy: [
      { q: 'Which of these is an irrational number?', choices: ['3/4', '0.75', '√(2)', '−5'], correct: 2 },
      { q: 'What is |−7|?', choices: ['−7', '7', '0', '1/7'], correct: 1 },
      { q: 'Which number is NOT a rational number?', choices: ['0.333...', '√(9)', 'π', '−2/3'], correct: 2 },
      { q: 'What is the GCD of 12 and 18?', choices: ['3', '6', '9', '36'], correct: 1 },
      { q: 'What is 2⁴?', choices: ['8', '16', '32', '6'], correct: 1 },
      { q: 'Simplify: 3² × 3³', choices: ['3⁵', '3⁶', '9⁵', '9⁶'], correct: 0 },
    ],
    medium: [
      { q: 'Which set contains ONLY integers?', choices: ['{−3, 0, 5}', '{½, 1, 2}', '{π, 3, 5}', '{0.5, 1, 1.5}'], correct: 0 },
      { q: 'What is the LCM of 8 and 12?', choices: ['4', '24', '48', '96'], correct: 1 },
      { q: 'Simplify: √(50)', choices: ['5√(2)', '25', '10√(5)', '2√(5)'], correct: 0 },
      { q: 'Which property states: a(b + c) = ab + ac?', choices: ['Associative', 'Commutative', 'Distributive', 'Identity'], correct: 2 },
      { q: 'Express 0.363636... as a fraction.', choices: ['36/100', '4/11', '36/99', '4/11 and 36/99'], correct: 2 },
      { q: 'What is (−3)³?', choices: ['9', '−9', '27', '−27'], correct: 3 },
    ],
    hard: [
      { q: 'The union of the rationals and irrationals gives which set?', choices: ['Integers', 'Whole numbers', 'Real numbers', 'Natural numbers'], correct: 2 },
      { q: 'Which is between √(10) and √(20)?', choices: ['3', '4', '5', '2'], correct: 1 },
      { q: 'Simplify: (2/3)⁻²', choices: ['4/9', '9/4', '−4/9', '3/2'], correct: 1 },
      { q: 'If a × b = 0, which must be true?', choices: ['a = 0', 'b = 0', 'a = 0 or b = 0', 'a = b'], correct: 2 },
      { q: 'Which number has exactly 6 factors?', choices: ['12', '16', '15', '9'], correct: 0 },
      { q: 'Simplify: √(72) − √(32)', choices: ['√(40)', '2√(2)', '4√(2)', '6√(2) − 4√(2)'], correct: 1 },
    ],
  },
  comp002: {
    easy: [
      { q: 'Solve: 2x + 3 = 11', choices: ['x = 3', 'x = 4', 'x = 7', 'x = 5.5'], correct: 1 },
      { q: 'What is the slope of y = 3x − 5?', choices: ['−5', '3', '−3', '5'], correct: 1 },
      { q: 'Evaluate f(x) = 2x + 1 when x = 3.', choices: ['5', '6', '7', '9'], correct: 2 },
      { q: 'Factor: x² − 9', choices: ['(x−3)²', '(x+3)(x−3)', '(x−9)(x+1)', '(x+9)(x−1)'], correct: 1 },
      { q: 'What is the y-intercept of y = −2x + 7?', choices: ['−2', '7', '2', '−7'], correct: 1 },
      { q: 'Solve: x/4 = 5', choices: ['x = 1', 'x = 9', 'x = 20', 'x = 4/5'], correct: 2 },
    ],
    medium: [
      { q: 'Solve the system: x + y = 5, x − y = 1', choices: ['(2, 3)', '(3, 2)', '(4, 1)', '(1, 4)'], correct: 1 },
      { q: 'What are the solutions of x² − 5x + 6 = 0?', choices: ['x = 2, 3', 'x = −2, −3', 'x = 1, 6', 'x = −1, −6'], correct: 0 },
      { q: 'A line passes through (0, 2) and (3, 8). What is its slope?', choices: ['3', '2', '6', '10/3'], correct: 1 },
      { q: 'If f(x) = x² − 4, what is f(−3)?', choices: ['5', '−13', '13', '−5'], correct: 0 },
      { q: 'Which equation represents a line parallel to y = 2x + 1?', choices: ['y = −2x + 3', 'y = 2x − 5', 'y = ½x + 1', 'y = −½x + 1'], correct: 1 },
      { q: 'Simplify: (x² + 3x − 10) ÷ (x − 2)', choices: ['x + 5', 'x − 5', 'x + 2', 'x − 3'], correct: 0 },
    ],
    hard: [
      { q: 'What is the vertex of f(x) = (x − 3)² − 4?', choices: ['(3, −4)', '(−3, 4)', '(3, 4)', '(−3, −4)'], correct: 0 },
      { q: 'The discriminant of 2x² + 3x + 5 = 0 is −31. What does this mean?', choices: ['Two real roots', 'One real root', 'No real roots', 'Cannot determine'], correct: 2 },
      { q: 'If f(x) = 3x − 1, find f⁻¹(x).', choices: ['(x+1)/3', '3x+1', '(x−1)/3', '1/(3x−1)'], correct: 0 },
      { q: 'Which function has an asymptote at x = 2?', choices: ['y = 1/(x−2)', 'y = x − 2', 'y = √(x−2)', 'y = (x−2)²'], correct: 0 },
      { q: 'Solve: |2x − 1| = 5', choices: ['x = 3 only', 'x = −2 only', 'x = 3 or x = −2', 'x = 2 or x = −3'], correct: 2 },
      { q: 'What type of function is f(x) = 2ˣ?', choices: ['Linear', 'Quadratic', 'Exponential', 'Logarithmic'], correct: 2 },
    ],
  },
  comp003: {
    easy: [
      { q: 'How many degrees are in a triangle?', choices: ['90°', '180°', '270°', '360°'], correct: 1 },
      { q: 'What is the area of a rectangle 5 cm by 8 cm?', choices: ['13 cm²', '26 cm²', '40 cm²', '80 cm²'], correct: 2 },
      { q: 'A circle has radius 7. What is its diameter?', choices: ['3.5', '7', '14', '49'], correct: 2 },
      { q: 'Two angles are supplementary. One is 65°. What is the other?', choices: ['25°', '115°', '295°', '65°'], correct: 1 },
      { q: 'What is the perimeter of a square with side 9?', choices: ['18', '27', '36', '81'], correct: 2 },
      { q: 'Which shape has all sides equal and all angles 90°?', choices: ['Rectangle', 'Rhombus', 'Square', 'Parallelogram'], correct: 2 },
    ],
    medium: [
      { q: 'Find the area of a triangle with base 10 and height 6.', choices: ['60', '30', '16', '80'], correct: 1 },
      { q: 'What is the distance between (1, 2) and (4, 6)?', choices: ['5', '7', '3', '25'], correct: 0 },
      { q: 'A circle has area 25π. What is its radius?', choices: ['5', '25', '12.5', '10'], correct: 0 },
      { q: 'What is the midpoint of (2, 4) and (8, 10)?', choices: ['(5, 7)', '(10, 14)', '(6, 6)', '(3, 3)'], correct: 0 },
      { q: 'A cylinder has radius 3 and height 10. What is its volume?', choices: ['30π', '90π', '60π', '9π'], correct: 1 },
      { q: 'In similar triangles, corresponding sides are:', choices: ['Equal', 'Proportional', 'Perpendicular', 'Parallel'], correct: 1 },
    ],
    hard: [
      { q: 'What is the volume of a sphere with radius 6?', choices: ['144π', '288π', '216π', '36π'], correct: 1 },
      { q: 'Rotate point (3, 0) by 90° counterclockwise about the origin.', choices: ['(0, 3)', '(0, −3)', '(−3, 0)', '(3, 3)'], correct: 0 },
      { q: 'A right triangle has legs 5 and 12. What is the hypotenuse?', choices: ['17', '13', '7', '60'], correct: 1 },
      { q: 'What is the surface area of a cube with side 4?', choices: ['64', '96', '24', '16'], correct: 1 },
      { q: 'The diagonals of which quadrilateral are always perpendicular?', choices: ['Rectangle', 'Parallelogram', 'Rhombus', 'Trapezoid'], correct: 2 },
      { q: 'What transformation maps (x, y) → (−x, y)?', choices: ['Reflect about the x-axis', 'Reflect about the y-axis', 'Rotate 90°', 'Translate left'], correct: 1 },
    ],
  },
  comp004: {
    easy: [
      { q: 'What is the mean of {2, 4, 6, 8}?', choices: ['4', '5', '6', '20'], correct: 1 },
      { q: 'A coin is flipped. What is P(heads)?', choices: ['0', '¼', '½', '1'], correct: 2 },
      { q: 'What is the mode of {3, 5, 5, 7, 9}?', choices: ['3', '5', '7', '9'], correct: 1 },
      { q: 'What is the range of {10, 15, 3, 22, 8}?', choices: ['19', '12', '22', '3'], correct: 0 },
      { q: 'A die is rolled. What is P(even)?', choices: ['1/6', '1/3', '1/2', '2/3'], correct: 2 },
      { q: 'Which measure is most affected by outliers?', choices: ['Median', 'Mode', 'Mean', 'Range'], correct: 2 },
    ],
    medium: [
      { q: 'What is the median of {1, 3, 3, 6, 7, 8, 9}?', choices: ['3', '6', '5.3', '7'], correct: 1 },
      { q: 'Two dice are rolled. What is P(sum = 7)?', choices: ['1/6', '1/12', '1/36', '7/36'], correct: 0 },
      { q: 'Data set A has σ = 8, set B has σ = 3. Which has more spread?', choices: ['A', 'B', 'Same', 'Cannot tell'], correct: 0 },
      { q: 'A bag has 3 red, 5 blue marbles. P(red)?', choices: ['3/5', '3/8', '5/8', '5/3'], correct: 1 },
      { q: 'What type of graph best shows parts of a whole?', choices: ['Line graph', 'Bar graph', 'Circle graph', 'Scatter plot'], correct: 2 },
      { q: 'In a normal distribution, about what % of data falls within 1 standard deviation?', choices: ['50%', '68%', '95%', '99%'], correct: 1 },
    ],
    hard: [
      { q: 'Events A and B are independent. P(A) = 0.3, P(B) = 0.5. Find P(A and B).', choices: ['0.8', '0.15', '0.2', '0.35'], correct: 1 },
      { q: 'A set of data has Q1 = 20, Q3 = 40. What is the IQR?', choices: ['10', '20', '30', '60'], correct: 1 },
      { q: 'How many ways can 5 books be arranged on a shelf?', choices: ['25', '120', '60', '10'], correct: 1 },
      { q: 'A scatter plot shows r = −0.92. What does this indicate?', choices: ['Strong positive', 'Weak positive', 'Strong negative', 'No correlation'], correct: 2 },
      { q: 'C(8, 3) = ?', choices: ['56', '336', '24', '40320'], correct: 0 },
      { q: 'A z-score of 2.0 means the value is how many σ above the mean?', choices: ['0.5', '1', '2', '3'], correct: 2 },
    ],
  },
  comp005: {
    easy: [
      { q: 'Which reasoning type starts from a general rule and applies it to a specific case?', choices: ['Inductive', 'Deductive', 'Abductive', 'Analogical'], correct: 1 },
      { q: 'If a = b and b = c, then a = c. This illustrates which property?', choices: ['Reflexive', 'Symmetric', 'Transitive', 'Distributive'], correct: 2 },
      { q: 'What is a counterexample?', choices: ['A supporting example', 'An exception that disproves', 'A formal proof', 'A hypothesis'], correct: 1 },
      { q: '"All squares are rectangles" is an example of:', choices: ['Conjecture', 'Counterexample', 'Theorem', 'Definition'], correct: 2 },
      { q: 'If 3x = 12, the inverse operation used to solve is:', choices: ['Addition', 'Subtraction', 'Multiplication', 'Division'], correct: 3 },
      { q: 'Estimating 49 × 21 as 50 × 20 = 1000 uses:', choices: ['Exact calculation', 'Rounding', 'Elimination', 'Graphing'], correct: 1 },
    ],
    medium: [
      { q: 'A student claims "all primes are odd." Which disproves this?', choices: ['7', '2', '11', '15'], correct: 1 },
      { q: 'Which proof technique assumes the opposite and derives a contradiction?', choices: ['Direct proof', 'Proof by contradiction', 'Inductive proof', 'Constructive proof'], correct: 1 },
      { q: 'The statement "If p, then q" is logically equivalent to:', choices: ['"If q, then p"', '"If not q, then not p"', '"If not p, then not q"', '"p and q"'], correct: 1 },
      { q: 'A function that models "doubles each hour" is best described as:', choices: ['Linear', 'Quadratic', 'Exponential', 'Constant'], correct: 2 },
      { q: 'Which representation is most useful for showing rate of change?', choices: ['Table', 'Graph', 'Equation', 'All are equally useful'], correct: 1 },
      { q: 'To solve a system of equations graphically, you find the:', choices: ['Slope', 'Y-intercept', 'Intersection point', 'Axis of symmetry'], correct: 2 },
    ],
    hard: [
      { q: 'Mathematical induction first proves a base case, then proves:', choices: ['The converse', 'The contrapositive', 'If true for k, then true for k+1', 'All even cases'], correct: 2 },
      { q: '"n² + n is always even for any integer n." This can be proven by noting:', choices: ['n(n+1) has consecutive integers', 'n² is always even', 'n is always positive', 'n+1 > n'], correct: 0 },
      { q: 'A teacher wants students to discover the Pythagorean theorem. Which approach is best?', choices: ['Lecture the proof', 'Have them measure right triangles', 'Assign problems from the textbook', 'Show a video'], correct: 1 },
      { q: 'The converse of "If it rains, then the ground is wet" is:', choices: ['"If wet, then it rained"', '"If not rain, then not wet"', '"If not wet, then not rain"', '"Rain and wet"'], correct: 0 },
      { q: 'A problem requires finding the dimensions of a fence with maximum area. This is an example of:', choices: ['Optimization', 'Estimation', 'Classification', 'Enumeration'], correct: 0 },
      { q: 'Which is NOT a valid proof technique?', choices: ['Direct proof', 'Proof by contradiction', 'Proof by example', 'Mathematical induction'], correct: 2 },
    ],
  },
  comp006: {
    easy: [
      { q: 'Which assessment is primarily used during instruction?', choices: ['Summative', 'Formative', 'Norm-referenced', 'Benchmark only'], correct: 1 },
      { q: 'Using exit-ticket data to regroup students is an example of:', choices: ['Grading policy', 'Responsive instruction', 'Static pacing', 'Standardized testing'], correct: 1 },
      { q: 'Sentence stems in math are most useful for:', choices: ['Reducing rigor', 'Supporting academic language', 'Replacing reasoning', 'Speed drills'], correct: 1 },
      { q: 'Best first planning step for a lesson is to identify:', choices: ['Homework load', 'Learning goals', 'Desk layout', 'Timer settings'], correct: 1 },
      { q: 'A teacher asks, "How do you know?" to promote:', choices: ['Compliance', 'Justification', 'Memorization', 'Silence'], correct: 1 },
      { q: 'A quick class-end check is commonly called:', choices: ['Unit exam', 'Exit ticket', 'Midterm', 'Benchmark'], correct: 1 },
    ],
    medium: [
      { q: 'Assessment validity means the tool:', choices: ['Is short', 'Measures intended target', 'Has many questions', 'Uses multiple choice'], correct: 1 },
      { q: 'Assessment reliability refers to:', choices: ['Student motivation', 'Consistent results', 'High average score', 'Strict grading'], correct: 1 },
      { q: 'Most productive response to a common misconception is to:', choices: ['Ignore it', 'Probe and reteach', 'Assign punishment', 'Move on immediately'], correct: 1 },
      { q: 'Differentiation in math instruction aims to:', choices: ['Lower standards', 'Preserve rigor while improving access', 'Teach one way only', 'Avoid discourse'], correct: 1 },
      { q: 'A rubric criterion that values explanation quality targets:', choices: ['Neatness', 'Reasoning evidence', 'Font choice', 'Completion speed'], correct: 1 },
      { q: 'Data-informed reteach decisions should be based on:', choices: ['Hunches only', 'Student work evidence', 'Parent requests only', 'Seat location'], correct: 1 },
    ],
    hard: [
      { q: 'Which pairing is correct?', choices: ['Formative: certifies end learning', 'Summative: adjusts in real time', 'Formative: informs next instructional move', 'Summative: daily exit ticket'], correct: 2 },
      { q: 'A mathematically rich task with multiple entry points primarily supports:', choices: ['Uniform speed', 'Equitable access and reasoning', 'Single algorithm recall', 'Silent individual work only'], correct: 1 },
      { q: 'The strongest evidence for a misconception pattern comes from:', choices: ['One skipped item', 'Across-student work samples', 'Attendance records', 'Teacher intuition alone'], correct: 1 },
      { q: 'If many students can execute steps but cannot explain why, instruction should prioritize:', choices: ['More timed drills', 'Conceptual discourse and representations', 'Harder numbers only', 'Shorter class periods'], correct: 1 },
      { q: 'A valid next step after a diagnostic check is:', choices: ['Keep same lesson regardless', 'Targeted small-group support', 'Delete low scores', 'Skip practice'], correct: 1 },
      { q: 'Best definition of responsive teaching in math:', choices: ['Following script exactly', 'Adjusting tasks based on evidence', 'Only summative testing', 'Avoiding student discussion'], correct: 1 },
    ],
  },
};

function pickQuestions(compId, options = {}) {
  const { strictScope = false } = options;
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const pool = compId && COMP_POOLS[compId];
  if (pool) {
    const easy = shuffle(pool.easy).slice(0, 5);
    const medium = shuffle(pool.medium).slice(0, 5);
    const hard = shuffle(pool.hard).slice(0, 5);
    return [...easy, ...medium, ...hard].map(q => ({ ...q, teks: compId }));
  }
  if (strictScope) return [];
  return [...shuffle(EASY_DEFAULT).slice(0, 5), ...shuffle(MEDIUM_DEFAULT).slice(0, 5), ...shuffle(HARD_DEFAULT).slice(0, 5)];
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];
const CHOICE_COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706'];

/* ── Sound engine — Millionaire-style dramatic sounds (Web Audio API) ── */
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function playNote(freq, duration, type = 'sine', vol = 0.18, attack = 0.01, release = null) {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + attack);
    const rel = release ?? duration * 0.7;
    gain.gain.setValueAtTime(vol, t + duration - rel);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  } catch (_) {}
}

function playChord(freqs, duration, type = 'sine', vol = 0.08, attack = 0.01) {
  freqs.forEach((f) => playNote(f, duration, type, vol, attack));
}

const SFX = {
  select: () => {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    [220, 330].forEach((f) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.55);
    });
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.type = 'sine'; lfo.frequency.value = 4;
    lfoG.gain.value = 8;
    lfo.connect(lfoG);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = 440;
    lfoG.connect(o.frequency);
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.85);
    lfo.start(t); lfo.stop(t + 0.85);
  },

  click: () => {
    playNote(392, 0.12, 'sine', 0.08);
    setTimeout(() => playNote(523, 0.12, 'sine', 0.08), 60);
  },

  correct: () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      playChord([261.6, 329.6, 392], 0.4, 'sine', 0.07, 0.02);
      await delay(350);
      playChord([293.7, 370, 440], 0.4, 'sine', 0.08, 0.02);
      await delay(350);
      playChord([329.6, 415.3, 523.3], 0.5, 'sine', 0.09, 0.02);
      await delay(400);
      playChord([392, 493.9, 587.3], 0.7, 'sine', 0.1, 0.02);
      playNote(784, 0.8, 'sine', 0.06, 0.1);
    })();
  },

  wrong: () => {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    [[174.6, 207.7, 261.6], [164.8, 196, 246.9]].forEach((chord, ci) => {
      chord.forEach((f) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = ci === 0 ? 'sine' : 'triangle';
        o.frequency.value = f;
        const start = t + ci * 0.6;
        g.gain.setValueAtTime(0.001, start);
        g.gain.linearRampToValueAtTime(0.1, start + 0.05);
        g.gain.setValueAtTime(0.1, start + 0.4);
        g.gain.exponentialRampToValueAtTime(0.001, start + (ci === 0 ? 0.6 : 1.2));
        o.connect(g); g.connect(ctx.destination);
        o.start(start); o.stop(start + (ci === 0 ? 0.65 : 1.3));
      });
    });
    const bass = ctx.createOscillator();
    const bG = ctx.createGain();
    bass.type = 'sine'; bass.frequency.value = 55;
    bG.gain.setValueAtTime(0.001, t + 0.6);
    bG.gain.linearRampToValueAtTime(0.12, t + 0.7);
    bG.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
    bass.connect(bG); bG.connect(ctx.destination);
    bass.start(t + 0.6); bass.stop(t + 2.1);
  },

  milestone: () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      playChord([261.6, 329.6, 392], 0.3, 'sine', 0.08);
      await delay(200);
      playChord([329.6, 415.3, 523.3], 0.3, 'sine', 0.09);
      await delay(200);
      playChord([392, 493.9, 587.3], 0.3, 'sine', 0.1);
      await delay(200);
      playChord([523.3, 659.3, 784], 0.8, 'sine', 0.12, 0.02);
      playNote(1047, 0.9, 'sine', 0.07, 0.15);
    })();
  },

  lifeline: () => {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    [523.3, 659.3, 784, 1047].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f * 0.9, t + i * 0.07);
      o.frequency.linearRampToValueAtTime(f, t + i * 0.07 + 0.06);
      g.gain.setValueAtTime(0.001, t + i * 0.07);
      g.gain.linearRampToValueAtTime(0.1, t + i * 0.07 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.25);
      o.connect(g); g.connect(ctx.destination);
      o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.3);
    });
  },

  win: () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      playChord([261.6, 329.6, 392], 0.3, 'sine', 0.09);
      await delay(150);
      playChord([329.6, 415.3, 523.3], 0.3, 'sine', 0.1);
      await delay(150);
      playChord([392, 493.9, 587.3], 0.3, 'sine', 0.1);
      await delay(150);
      playChord([523.3, 659.3, 784], 0.3, 'sine', 0.11);
      await delay(150);
      playChord([659.3, 830.6, 987.8], 0.4, 'sine', 0.12);
      await delay(250);
      playChord([784, 987.8, 1175, 1568], 1.2, 'sine', 0.1, 0.05);
      playNote(1568, 1.5, 'triangle', 0.04, 0.2);
    })();
  },

  walkAway: () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      playChord([392, 493.9, 587.3], 0.6, 'sine', 0.07, 0.05);
      await delay(500);
      playChord([349.2, 440, 523.3], 0.6, 'sine', 0.06, 0.05);
      await delay(500);
      playChord([293.7, 370, 440], 0.9, 'sine', 0.05, 0.05);
    })();
  },
};

/* ═══════════════════════════════════════════════════════════ */
const MathMillionaire = () => {
  const [searchParams] = useSearchParams();
  const teksFilter = searchParams.get('teks');
  const compFilter = searchParams.get('comp') || '';
  const currentStd = searchParams.get('currentStd') || searchParams.get('std') || '';
  const strictScope = searchParams.get('from') === 'loop' && !!(teksFilter || compFilter || currentStd);
  const sid = searchParams.get('sid');
  const aid = searchParams.get('aid');
  const cid = searchParams.get('cid');
  const { returnUrl, goBack } = useGameReturn();

  const [questions, setQuestions] = useState(() => pickQuestions(compFilter, { strictScope }));
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [walkAway, setWalkAway] = useState(false);
  const [finalPrize, setFinalPrize] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  // Lifelines
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [askQBotUsed, setAskQBotUsed] = useState(false);
  const [skipUsed, setSkipUsed] = useState(false);
  const [hiddenChoices, setHiddenChoices] = useState(new Set());
  const [qbotHint, setQbotHint] = useState(null);
  const [qbotAnim, setQbotAnim] = useState(false);

  // Animations
  const [revealPhase, setRevealPhase] = useState(0); // 0=none, 1=thinking, 2=result
  const [celebration, setCelebration] = useState(false);

  // Background tension loop — Millionaire-style rhythmic pulse
  const bgLoopRef = useRef(null);
  const startBgLoop = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      if (bgLoopRef.current) return;

      const master = ctx.createGain();
      master.gain.value = 0.09;
      master.connect(ctx.destination);

      const bass = ctx.createOscillator();
      bass.type = 'sine';
      bass.frequency.value = 55;
      const bassG = ctx.createGain();
      bassG.gain.value = 1;
      bass.connect(bassG);
      bassG.connect(master);
      bass.start();

      const pad = ctx.createOscillator();
      pad.type = 'triangle';
      pad.frequency.value = 82.4;
      const padG = ctx.createGain();
      padG.gain.value = 0.4;
      pad.connect(padG);
      padG.connect(master);
      pad.start();

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 1.8;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 0.6;
      lfo.connect(lfoDepth);
      lfoDepth.connect(bassG.gain);
      lfo.start();

      const lfo2 = ctx.createOscillator();
      lfo2.type = 'sine';
      lfo2.frequency.value = 0.9;
      const lfo2Depth = ctx.createGain();
      lfo2Depth.gain.value = 0.3;
      lfo2.connect(lfo2Depth);
      lfo2Depth.connect(padG.gain);
      lfo2.start();

      bgLoopRef.current = { bass, pad, lfo, lfo2, master };
    } catch (_) {}
  }, []);
  const stopBgLoop = useCallback(() => {
    if (!bgLoopRef.current) return;
    try {
      const { bass, pad, lfo, lfo2, master } = bgLoopRef.current;
      master.gain.exponentialRampToValueAtTime(0.001, getAudioCtx().currentTime + 0.5);
      setTimeout(() => {
        try { bass.stop(); pad.stop(); lfo.stop(); lfo2.stop(); } catch (_) {}
      }, 600);
    } catch (_) {}
    bgLoopRef.current = null;
  }, []);

  useEffect(() => {
    if (!answerRevealed && !gameOver) startBgLoop();
    else stopBgLoop();
    return () => stopBgLoop();
  }, [answerRevealed, gameOver, currentQ]);

  const question = questions[currentQ];
  const prize = PRIZE_LADDER[currentQ];
  const safeHavenPrize = () => {
    for (let i = currentQ - 1; i >= 0; i--) {
      if (SAFE_HAVENS.includes(i)) return PRIZE_LADDER[i];
    }
    return 0;
  };

  const handleAnswer = useCallback((idx) => {
    if (answerRevealed || selectedAnswer !== null) return;
    SFX.select();
    setSelectedAnswer(idx);
    setRevealPhase(1);

    setTimeout(() => {
      setAnswerRevealed(true);
      setRevealPhase(2);
      const isCorrect = idx === question.correct;

      setAnsweredQuestions(prev => [...prev, {
        question: question.q,
        correctAnswer: question.choices[question.correct],
        studentAnswer: question.choices[idx],
        correct: isCorrect,
        teks: question.teks,
      }]);

      if (isCorrect) {
        const isMilestone = SAFE_HAVENS.includes(currentQ);
        if (isMilestone) SFX.milestone(); else SFX.correct();
        setCelebration(true);
        setTimeout(() => setCelebration(false), 900);
      } else {
        SFX.wrong();
        setTimeout(() => {
          setFinalPrize(safeHavenPrize());
          setGameOver(true);
        }, 1200);
      }
    }, 500);
  }, [answerRevealed, selectedAnswer, question, currentQ]);

  const handleNextQuestion = () => {
    SFX.click();
    if (currentQ === TOTAL_QUESTIONS - 1) {
      SFX.win();
      setFinalPrize(1000000);
      setGameOver(true);
      return;
    }
    setCurrentQ(prev => prev + 1);
    setSelectedAnswer(null);
    setAnswerRevealed(false);
    setRevealPhase(0);
    setHiddenChoices(new Set());
    setQbotHint(null);
  };

  const handleWalkAway = () => {
    SFX.walkAway();
    setFinalPrize(PRIZE_LADDER[currentQ > 0 ? currentQ - 1 : 0]);
    if (currentQ === 0) setFinalPrize(0);
    setWalkAway(true);
    setGameOver(true);
  };

  const useFiftyFifty = () => {
    if (fiftyFiftyUsed || answerRevealed) return;
    SFX.lifeline();
    setFiftyFiftyUsed(true);
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== question.correct);
    const shuffledWrong = wrongIndices.sort(() => Math.random() - 0.5);
    setHiddenChoices(new Set([shuffledWrong[0], shuffledWrong[1]]));
  };

  const useAskQBot = () => {
    if (askQBotUsed || answerRevealed) return;
    SFX.lifeline();
    setAskQBotUsed(true);
    setQbotAnim(true);

    const isRight = Math.random() < 0.9;
    let hintIdx;
    if (isRight) {
      hintIdx = question.correct;
    } else {
      const wrong = [0, 1, 2, 3].filter(i => i !== question.correct);
      hintIdx = wrong[Math.floor(Math.random() * wrong.length)];
    }

    const hints = [
      `Solve hint: check operation order and simplify - this points to ${CHOICE_LABELS[hintIdx]}.`,
      `Math hint: substitute/check constraints and compare choices; ${CHOICE_LABELS[hintIdx]} fits best.`,
      `Reasoning hint: eliminate distractors with quick estimation; ${CHOICE_LABELS[hintIdx]} remains.`,
      `I evaluated the expressions and ${CHOICE_LABELS[hintIdx]} is most consistent.`,
    ];
    setTimeout(() => {
      SFX.click();
      setQbotHint(hints[Math.floor(Math.random() * hints.length)]);
      setQbotAnim(false);
    }, 1200);
  };

  const useSkip = () => {
    if (skipUsed || answerRevealed) return;
    SFX.lifeline();
    setSkipUsed(true);
    handleNextQuestion();
  };

  const endGame = () => {
    saveGameResult({
      gameId: 'math-millionaire',
      studentId: sid || undefined,
      assignmentId: aid || undefined,
      classId: cid || undefined,
      score: Math.round((finalPrize / 1000000) * 100),
      correct: answeredQuestions.filter(q => q.correct).length,
      total: answeredQuestions.length,
      teks: compFilter || teksFilter || '',
      questions: answeredQuestions,
      extra: { prize: finalPrize },
    });
  };

  useEffect(() => {
    if (gameOver) endGame();
  }, [gameOver]);

  const resetGame = () => {
    setQuestions(pickQuestions(compFilter, { strictScope }));
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAnswerRevealed(false);
    setGameOver(false);
    setWalkAway(false);
    setFinalPrize(0);
    setShowReview(false);
    setAnsweredQuestions([]);
    setFiftyFiftyUsed(false);
    setAskQBotUsed(false);
    setSkipUsed(false);
    setHiddenChoices(new Set());
    setQbotHint(null);
    setRevealPhase(0);
    setCelebration(false);
  };

  if (showReview) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <GameReview
          questions={answeredQuestions}
          score={finalPrize}
          total={1000000}
          gameTitle="Math Millionaire"
          onBack={() => setShowReview(false)}
          backLabel="Back to Results"
          onPlayAgain={resetGame}
        />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
          <button onClick={resetGame} style={btnStyle('#22c55e')}>Play Again</button>
          {returnUrl ? (
            <button type="button" onClick={goBack} style={btnStyle('#6366f1')}>Continue Loop</button>
          ) : (
            <Link to="/games" style={{ ...btnStyle('#6366f1'), textDecoration: 'none' }}>Back to Games</Link>
          )}
        </div>
        {returnUrl && <LoopContinueButton onClick={goBack} />}
      </div>
    );
  }

  if (strictScope && questions.length === 0) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#7f1d1d' }}>
          No competency-aligned Millionaire question set is available for this loop step yet.
        </div>
        <div style={{ marginTop: 12 }}>
          {returnUrl ? <button type="button" onClick={goBack} style={btnStyle('#22c55e')}>Continue</button> : <Link to="/games">Back to Games</Link>}
        </div>
      </div>
    );
  }

  /* ─── Game Over Screen ─── */
  if (gameOver) {
    const isMillionaire = finalPrize === 1000000;
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1a0533 50%, #0f172a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      }}>
        <div style={{
          background: 'linear-gradient(170deg, #1e293b, #0f172a)',
          borderRadius: 24, padding: '40px 36px', textAlign: 'center',
          border: isMillionaire ? '3px solid #fbbf24' : '2px solid rgba(255,255,255,0.1)',
          maxWidth: 420, width: '92%',
          boxShadow: isMillionaire ? '0 0 80px rgba(251,191,36,0.25)' : '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>
            {isMillionaire ? '👑' : walkAway ? '🚶' : '😔'}
          </div>
          <h2 style={{
            margin: '0 0 6px', fontSize: 26, fontWeight: 900,
            color: isMillionaire ? '#fbbf24' : walkAway ? '#22c55e' : '#ef4444',
          }}>
            {isMillionaire ? 'MILLIONAIRE!' : walkAway ? 'Smart Walk Away!' : 'Wrong Answer!'}
          </h2>
          <p style={{ margin: '0 0 24px', color: '#94a3b8', fontSize: 14 }}>
            {isMillionaire
              ? 'You answered all 15 questions!'
              : walkAway
                ? 'You took your winnings safely.'
                : `You fell back to the safe haven.`}
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 20, marginBottom: 24,
          }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>You won</div>
            <div style={{
              fontSize: 40, fontWeight: 900,
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              ${finalPrize.toLocaleString()}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 20, marginTop: 14,
            }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>
                  {answeredQuestions.filter(q => q.correct).length}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Correct</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>
                  {answeredQuestions.filter(q => !q.correct).length}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Wrong</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>
                  {currentQ + 1}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Reached</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {returnUrl && (
              <button onClick={goBack} style={btnStyle('#22c55e')}>Continue Practicing</button>
            )}
            <button onClick={resetGame} style={btnStyle(returnUrl ? '#6366f1' : '#22c55e')}>Play Again</button>
            <button onClick={() => setShowReview(true)} style={btnStyle('#8b5cf6')}>Review Solutions</button>
            {!returnUrl && (
              <Link to="/games" style={{ ...btnStyle('#475569'), textDecoration: 'none', display: 'block' }}>Back to Games</Link>
            )}
          </div>
        </div>
        {returnUrl && <LoopContinueButton onClick={goBack} />}
      </div>
    );
  }

  /* ─── Main Game ─── */
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1a0533 50%, #0f172a 100%)',
      color: '#fff',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {returnUrl ? (
          <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue</button>
        ) : (
          <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Games</Link>
        )}
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 1.5, color: '#fbbf24' }}>
          MATH MILLIONAIRE
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Q{currentQ + 1}/15</div>
      </div>

      <div style={{
        display: 'flex', maxWidth: 900, margin: '0 auto', padding: '16px 12px',
        gap: 16, flexWrap: 'wrap',
      }}>
        {/* Left: Prize Ladder */}
        <div style={{
          width: 160, flexShrink: 0,
          background: 'rgba(255,255,255,0.03)', borderRadius: 14,
          padding: '10px 0', border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
        }}>
          {[...PRIZE_LADDER].reverse().map((p, ri) => {
            const i = TOTAL_QUESTIONS - 1 - ri;
            const isCurrent = i === currentQ;
            const isPast = i < currentQ;
            const isSafe = SAFE_HAVENS.includes(i);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px',
                fontSize: 12, fontWeight: isCurrent ? 800 : 600,
                color: isCurrent ? '#fbbf24' : isPast ? '#22c55e' : isSafe ? '#f59e0b' : '#64748b',
                background: isCurrent ? 'rgba(251,191,36,0.1)' : 'transparent',
                borderLeft: isCurrent ? '3px solid #fbbf24' : isSafe ? '3px solid #f59e0b33' : '3px solid transparent',
                transition: 'all 0.3s',
              }}>
                <span style={{ width: 18, textAlign: 'right', opacity: 0.7 }}>{i + 1}</span>
                <span style={{ flex: 1 }}>${p.toLocaleString()}</span>
                {isPast && <span style={{ fontSize: 10 }}>✓</span>}
                {isSafe && !isPast && <span style={{ fontSize: 9 }}>🛡️</span>}
              </div>
            );
          })}
        </div>

        {/* Right: Question area */}
        <div style={{ flex: 1, minWidth: 280 }}>
          {/* Current prize */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              For ${prize.toLocaleString()}
            </div>
          </div>

          {/* Question */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
            borderRadius: 16, padding: '24px 20px', marginBottom: 16,
            border: '1px solid rgba(139,92,246,0.15)',
            textAlign: 'center',
            animation: celebration ? 'correctPulse 0.6s ease' : 'none',
          }}>
            <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 700, marginBottom: 8 }}>
              {question.teks}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, color: '#f1f5f9' }}>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(question.q)) }} />
            </div>
          </div>

          {/* QBot Hint */}
          {(qbotHint || qbotAnim) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(37,99,235,0.08)', borderRadius: 12,
              padding: '10px 14px', marginBottom: 14,
              border: '1px solid rgba(37,99,235,0.15)',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #c7d2fe', overflow: 'hidden',
                animation: qbotAnim ? 'qbotThink 0.6s ease infinite' : 'none',
              }}>
                <img src={qbotImg} alt="QBot" style={{ width: 28 }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#93c5fd' }}>
                {qbotAnim ? 'Analyzing the math steps...' : qbotHint}
              </div>
            </div>
          )}

          {/* Choices */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16,
          }}>
            {question.choices.map((choice, idx) => {
              if (hiddenChoices.has(idx)) {
                return <div key={idx} style={{
                  padding: 16, borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '2px solid rgba(255,255,255,0.04)',
                  opacity: 0.3,
                }} />;
              }

              const isSelected = selectedAnswer === idx;
              const isCorrect = question.correct === idx;
              let bg = 'rgba(255,255,255,0.04)';
              let border = 'rgba(255,255,255,0.08)';
              let color = '#e2e8f0';

              if (answerRevealed) {
                if (isCorrect) {
                  bg = 'rgba(34,197,94,0.15)';
                  border = '#22c55e';
                  color = '#22c55e';
                } else if (isSelected && !isCorrect) {
                  bg = 'rgba(239,68,68,0.15)';
                  border = '#ef4444';
                  color = '#ef4444';
                }
              } else if (isSelected && revealPhase === 1) {
                bg = 'rgba(251,191,36,0.12)';
                border = '#fbbf24';
                color = '#fbbf24';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={answerRevealed || selectedAnswer !== null}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 16px', borderRadius: 12,
                    background: bg,
                    border: `2px solid ${border}`,
                    color,
                    cursor: answerRevealed || selectedAnswer !== null ? 'default' : 'pointer',
                    fontSize: 15, fontWeight: 700, textAlign: 'left',
                    transition: 'all 0.2s',
                    animation: answerRevealed && isCorrect ? 'correctPulse 0.4s ease' : '',
                  }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: CHOICE_COLORS[idx] + '22',
                    color: CHOICE_COLORS[idx],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0,
                  }}>
                    {CHOICE_LABELS[idx]}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(String(choice))) }} />
                </button>
              );
            })}
          </div>

          {/* Bottom controls */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {/* Lifelines */}
            {!answerRevealed && (
              <>
                <button
                  onClick={useFiftyFifty}
                  disabled={fiftyFiftyUsed}
                  title="50:50 — Remove two wrong answers"
                  style={lifelineBtn(fiftyFiftyUsed, '#f59e0b')}
                >
                  50:50
                </button>
                <button
                  onClick={useAskQBot}
                  disabled={askQBotUsed}
                  title="Ask QBot for a math hint"
                  style={lifelineBtn(askQBotUsed, '#2563eb')}
                >
                  <img src={qbotImg} alt="" role="presentation" style={{ width: 16, height: 'auto', marginRight: 4 }} />
                  Ask QBot
                </button>
                <button
                  onClick={useSkip}
                  disabled={skipUsed}
                  title="Skip this question"
                  style={lifelineBtn(skipUsed, '#8b5cf6')}
                >
                  ⏭ Skip
                </button>
              </>
            )}

            {answerRevealed && selectedAnswer !== null && selectedAnswer === question.correct && (
              <button onClick={handleNextQuestion} style={btnStyle('#22c55e')}>
                {currentQ === TOTAL_QUESTIONS - 1 ? 'Claim $1,000,000!' : 'Next Question →'}
              </button>
            )}
          </div>

          {/* Walk away */}
          {!answerRevealed && currentQ > 0 && (
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <button
                onClick={handleWalkAway}
                style={{
                  padding: '8px 20px', background: 'transparent', color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                }}
              >
                Walk Away with ${PRIZE_LADDER[currentQ - 1].toLocaleString()}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes correctPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); box-shadow: 0 0 24px rgba(34,197,94,0.3); }
          100% { transform: scale(1); }
        }
        @keyframes qbotThink {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        @media (max-width: 640px) {
          /* Stack layout on mobile */
        }
      `}</style>
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </div>
  );
};

function btnStyle(bg) {
  return {
    padding: '12px 28px', background: bg, color: '#fff',
    border: 'none', borderRadius: 10, cursor: 'pointer',
    fontSize: 14, fontWeight: 700, textAlign: 'center',
  };
}

function lifelineBtn(used, accent) {
  return {
    padding: '8px 14px',
    background: used ? 'rgba(255,255,255,0.03)' : accent + '15',
    color: used ? '#475569' : accent,
    border: `2px solid ${used ? 'rgba(255,255,255,0.06)' : accent + '33'}`,
    borderRadius: 10, cursor: used ? 'default' : 'pointer',
    fontSize: 12, fontWeight: 700,
    opacity: used ? 0.4 : 1,
    display: 'flex', alignItems: 'center',
    textDecoration: used ? 'line-through' : 'none',
  };
}

export default MathMillionaire;
