import React, { useState, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import qbotImg from '../assets/qbot.svg';
import { formatMathHtml } from '../utils/mathFormat';
import { sanitizeHtml } from '../utils/sanitize';

function jeopardyMathHtml(text) {
  if (text == null || text === '') return '';
  return sanitizeHtml(formatMathHtml(String(text)));
}

/* ═══════════════════════════════════════════════════════════
   MATH JEOPARDY — 5×5 trivia board
   Columns = TEKS categories, Rows = 100–500 point values
   ═══════════════════════════════════════════════════════════ */

const POINT_VALUES = [100, 200, 300, 400, 500];

/* ── Question banks per TEKS, difficulty scaled by point tier ── */
const CATEGORY_BANKS = {
  '3.4A': {
    label: 'Add & Subtract',
    icon: '➕',
    questions: [
      { q: 'What is 125 + 234?', choices: ['359', '349', '369', '259'], answer: '359' },
      { q: 'What is 503 − 278?', choices: ['225', '235', '215', '325'], answer: '225' },
      { q: '467 + 385 = ?', choices: ['852', '842', '862', '752'], answer: '852' },
      { q: '1,000 − 463 = ?', choices: ['537', '547', '637', '437'], answer: '537' },
      { q: 'A store had 1,250 items. They sold 687. How many are left?', choices: ['563', '573', '463', '663'], answer: '563' },
    ],
  },
  '3.4C': {
    label: 'Multiply',
    icon: '✖️',
    questions: [
      { q: 'What is 3 × 4?', choices: ['12', '7', '16', '9'], answer: '12' },
      { q: 'What is 7 × 6?', choices: ['42', '36', '48', '56'], answer: '42' },
      { q: '9 × 8 = ?', choices: ['72', '63', '81', '64'], answer: '72' },
      { q: 'A baker makes 8 trays with 7 muffins each. How many muffins in all?', choices: ['56', '48', '63', '54'], answer: '56' },
      { q: 'There are 9 rows of desks with 9 desks in each row. How many desks?', choices: ['81', '72', '90', '63'], answer: '81' },
    ],
  },
  '3.4D': {
    label: 'Divide',
    icon: '➗',
    questions: [
      { q: 'What is 12 ÷ 3?', choices: ['4', '3', '6', '5'], answer: '4' },
      { q: '35 ÷ 5 = ?', choices: ['7', '6', '8', '5'], answer: '7' },
      { q: '56 ÷ 8 = ?', choices: ['7', '8', '6', '9'], answer: '7' },
      { q: '72 cookies shared equally among 9 friends. How many each?', choices: ['8', '7', '9', '6'], answer: '8' },
      { q: 'A farmer plants 63 seeds in 7 equal rows. How many seeds per row?', choices: ['9', '8', '7', '10'], answer: '9' },
    ],
  },
  '3.3A': {
    label: 'Fractions',
    icon: '🍕',
    questions: [
      { q: 'What fraction is shaded if 1 of 4 equal parts is colored?', choices: ['1/4', '1/2', '1/3', '3/4'], answer: '1/4' },
      { q: 'Which is greater: 3/8 or 5/8?', choices: ['5/8', '3/8', 'They are equal', 'Cannot tell'], answer: '5/8' },
      { q: 'What fraction of a pizza is left if you eat 2 of 6 equal slices?', choices: ['4/6', '2/6', '3/6', '1/6'], answer: '4/6' },
      { q: 'Place these in order from least to greatest: 5/8, 2/8, 7/8', choices: ['2/8, 5/8, 7/8', '7/8, 5/8, 2/8', '5/8, 2/8, 7/8', '2/8, 7/8, 5/8'], answer: '2/8, 5/8, 7/8' },
      { q: 'A number line is divided into 6 equal parts. What fraction is at mark 5?', choices: ['5/6', '1/6', '6/5', '5/5'], answer: '5/6' },
    ],
  },
  '3.2A': {
    label: 'Place Value',
    icon: '🔢',
    questions: [
      { q: 'What is the value of the 5 in 352?', choices: ['50', '5', '500', '300'], answer: '50' },
      { q: 'What digit is in the hundreds place of 4,728?', choices: ['7', '4', '2', '8'], answer: '7' },
      { q: 'Write 600 + 40 + 3 as a number.', choices: ['643', '634', '463', '346'], answer: '643' },
      { q: 'Which number has a 9 in the thousands place?', choices: ['9,241', '2,941', '4,219', '1,492'], answer: '9,241' },
      { q: 'The number 8,056 has how many hundreds?', choices: ['0', '8', '5', '6'], answer: '0' },
    ],
  },
  '3.5B': {
    label: 'Missing Numbers',
    icon: '❓',
    questions: [
      { q: '5 + ___ = 12. What is the missing number?', choices: ['7', '6', '8', '5'], answer: '7' },
      { q: '___ × 4 = 24. What is the missing factor?', choices: ['6', '8', '5', '7'], answer: '6' },
      { q: '45 ÷ ___ = 9. What goes in the blank?', choices: ['5', '6', '4', '9'], answer: '5' },
      { q: 'If 8 × ___ = 64, what is the missing number?', choices: ['8', '7', '9', '6'], answer: '8' },
      { q: '___ − 125 = 375. What is the starting number?', choices: ['500', '450', '400', '550'], answer: '500' },
    ],
  },
  '3.7B': {
    label: 'Perimeter & Area',
    icon: '📐',
    questions: [
      { q: 'What is the perimeter of a square with side 3?', choices: ['12', '9', '6', '16'], answer: '12' },
      { q: 'A rectangle is 5 long and 3 wide. What is its perimeter?', choices: ['16', '15', '8', '20'], answer: '16' },
      { q: 'What is the area of a 4 × 6 rectangle?', choices: ['24', '20', '10', '28'], answer: '24' },
      { q: 'A square garden has a perimeter of 36 feet. How long is each side?', choices: ['9', '6', '12', '8'], answer: '9' },
      { q: 'A rectangle has area 48 sq units and width 6. What is the length?', choices: ['8', '6', '9', '7'], answer: '8' },
    ],
  },
  '3.5A': {
    label: 'Patterns',
    icon: '🔄',
    questions: [
      { q: 'What comes next? 2, 5, 8, 11, ___', choices: ['14', '13', '15', '12'], answer: '14' },
      { q: 'What is the rule? 10, 20, 30, 40...', choices: ['+10', '+20', '×2', '+5'], answer: '+10' },
      { q: 'Complete: 3, 6, 12, 24, ___', choices: ['48', '36', '30', '28'], answer: '48' },
      { q: 'What comes next? 100, 90, 80, 70, ___', choices: ['60', '50', '65', '75'], answer: '60' },
      { q: 'Skip count by 7: 7, 14, 21, 28, ___', choices: ['35', '34', '36', '42'], answer: '35' },
    ],
  },
  '3.4H': {
    label: 'Word Problems',
    icon: '📝',
    questions: [
      { q: 'Sam has 24 stickers. He gives 8 away. Which number sentence matches?', choices: ['24 − 8 = ?', '24 + 8 = ?', '24 × 8 = ?', '8 − 24 = ?'], answer: '24 − 8 = ?' },
      { q: 'A class has 4 rows with 7 desks each. Which number sentence finds the total?', choices: ['4 × 7 = ?', '4 + 7 = ?', '7 − 4 = ?', '7 ÷ 4 = ?'], answer: '4 × 7 = ?' },
      { q: '36 crayons are shared equally among 6 students. Which finds how many each gets?', choices: ['36 ÷ 6 = ?', '36 − 6 = ?', '36 × 6 = ?', '36 + 6 = ?'], answer: '36 ÷ 6 = ?' },
      { q: 'A bakery made 156 muffins in the morning and 278 in the afternoon. Which finds the total?', choices: ['156 + 278 = ?', '278 − 156 = ?', '156 × 278 = ?', '278 ÷ 156 = ?'], answer: '156 + 278 = ?' },
      { q: 'A farmer has 9 baskets with 8 apples each, then eats 5. Which TWO-step sentence finds how many are left?', choices: ['(9 × 8) − 5 = ?', '9 + 8 − 5 = ?', '(9 − 5) × 8 = ?', '9 × (8 − 5) = ?'], answer: '(9 × 8) − 5 = ?' },
    ],
  },

  /* ── Probability & Statistics ── */
  'PROB.1': {
    label: 'Basic Probability',
    icon: '🎲',
    questions: [
      { q: 'What is the probability of flipping heads on a fair coin?', choices: ['1/2', '1/4', '1/3', '1'], answer: '1/2' },
      { q: 'A bag has 3 red and 5 blue marbles. What is P(red)?', choices: ['3/8', '5/8', '3/5', '1/2'], answer: '3/8' },
      { q: 'What is the probability of rolling a 6 on a standard die?', choices: ['1/6', '1/3', '1/2', '6/6'], answer: '1/6' },
      { q: 'A spinner has 4 equal sections: red, blue, green, yellow. What is P(blue)?', choices: ['1/4', '1/2', '1/3', '2/4'], answer: '1/4' },
      { q: 'Two coins are flipped. What is the probability both are heads?', choices: ['1/4', '1/2', '1/3', '2/4'], answer: '1/4' },
    ],
  },
  'PROB.2': {
    label: 'Mean, Median, Mode',
    icon: '📊',
    questions: [
      { q: 'What is the mean of 2, 4, 6, 8, 10?', choices: ['6', '5', '7', '8'], answer: '6' },
      { q: 'What is the median of 3, 7, 9, 12, 15?', choices: ['9', '7', '12', '3'], answer: '9' },
      { q: 'Data: 4, 4, 5, 6, 7. What is the mode?', choices: ['4', '5', '6', '7'], answer: '4' },
      { q: 'The range of {5, 12, 8, 20, 3} is?', choices: ['17', '15', '12', '20'], answer: '17' },
      { q: 'Test scores: 70, 80, 90, 100. What is the mean?', choices: ['85', '80', '90', '75'], answer: '85' },
    ],
  },
  'PROB.3': {
    label: 'Counting & Combos',
    icon: '🔢',
    questions: [
      { q: 'What is 5! (5 factorial)?', choices: ['120', '60', '24', '20'], answer: '120' },
      { q: 'How many ways can you arrange 3 books on a shelf?', choices: ['6', '3', '9', '12'], answer: '6' },
      { q: 'C(4, 2) = ? (4 choose 2)', choices: ['6', '8', '4', '12'], answer: '6' },
      { q: 'A menu has 3 appetizers and 4 entrees. How many different meals?', choices: ['12', '7', '3', '16'], answer: '12' },
      { q: 'P(5, 2) = ? (permutations of 5 items taken 2)', choices: ['20', '10', '25', '15'], answer: '20' },
    ],
  },
  'PROB.4': {
    label: 'Data & Graphs',
    icon: '📈',
    questions: [
      { q: 'Which graph is best for showing parts of a whole?', choices: ['Circle/Pie chart', 'Line graph', 'Scatter plot', 'Histogram'], answer: 'Circle/Pie chart' },
      { q: 'A box plot shows which value in the center?', choices: ['Median', 'Mean', 'Mode', 'Range'], answer: 'Median' },
      { q: 'What does the IQR (interquartile range) measure?', choices: ['Spread of middle 50%', 'Total range', 'Average value', 'Number of outliers'], answer: 'Spread of middle 50%' },
      { q: 'A histogram groups data into what?', choices: ['Bins/intervals', 'Categories', 'Percentages', 'Pairs'], answer: 'Bins/intervals' },
      { q: 'A scatter plot with points trending upward shows what correlation?', choices: ['Positive', 'Negative', 'No correlation', 'Inverse'], answer: 'Positive' },
    ],
  },
  'PROB.5': {
    label: 'Expected Value',
    icon: '🎯',
    questions: [
      { q: 'A fair die is rolled. What is the expected value?', choices: ['3.5', '3', '4', '6'], answer: '3.5' },
      { q: 'You win $10 on heads, lose $5 on tails. What is the expected value per flip?', choices: ['$2.50', '$5.00', '$7.50', '$0'], answer: '$2.50' },
      { q: 'If P(win) = 0.3 and the prize is $100, what is the expected winnings?', choices: ['$30', '$100', '$70', '$50'], answer: '$30' },
      { q: 'Which has a higher expected value: a guaranteed $50 or a 60% chance at $100?', choices: ['60% at $100', 'Guaranteed $50', 'They are equal', 'Cannot tell'], answer: '60% at $100' },
      { q: 'In 100 coin flips, about how many heads do you expect?', choices: ['50', '100', '25', '75'], answer: '50' },
    ],
  },

  /* ── Algebra ── */
  'A.3A': {
    label: 'Slope & Lines',
    icon: '📐',
    questions: [
      { q: 'What is the slope of y = 3x + 1?', choices: ['3', '1', '3x', '−3'], answer: '3' },
      { q: 'Find the slope between (0, 2) and (4, 10).', choices: ['2', '4', '8', '1'], answer: '2' },
      { q: 'What is the y-intercept of y = 5x − 7?', choices: ['−7', '5', '7', '−5'], answer: '−7' },
      { q: 'A line passes through (1, 3) and (3, 7). What is the slope?', choices: ['2', '4', '3', '1'], answer: '2' },
      { q: 'Which line is steeper: y = 2x or y = 5x?', choices: ['y = 5x', 'y = 2x', 'Same steepness', 'Cannot tell'], answer: 'y = 5x' },
    ],
  },
  'A.5A': {
    label: 'Functions',
    icon: '⚡',
    questions: [
      { q: 'If f(x) = 2x + 1, what is f(3)?', choices: ['7', '5', '6', '9'], answer: '7' },
      { q: 'Which is a function: {(1,2),(1,3)} or {(1,2),(2,3)}?', choices: ['{(1,2),(2,3)}', '{(1,2),(1,3)}', 'Both', 'Neither'], answer: '{(1,2),(2,3)}' },
      { q: 'What is the domain of f(x) = x + 5?', choices: ['All real numbers', 'x > 0', 'x ≠ 5', 'Only integers'], answer: 'All real numbers' },
      { q: 'If f(x) = x^(2) − 1, what is f(4)?', choices: ['15', '16', '17', '7'], answer: '15' },
      { q: 'The vertical line test checks if a graph is a ___?', choices: ['Function', 'Linear', 'Quadratic', 'Polynomial'], answer: 'Function' },
    ],
  },
  'A.7A': {
    label: 'Solve Equations',
    icon: '⚖️',
    questions: [
      { q: 'Solve: 2x + 3 = 11', choices: ['x = 4', 'x = 7', 'x = 3', 'x = 5'], answer: 'x = 4' },
      { q: 'Solve: 5x − 10 = 0', choices: ['x = 2', 'x = 5', 'x = −2', 'x = 10'], answer: 'x = 2' },
      { q: 'Solve: x/3 = 9', choices: ['x = 27', 'x = 3', 'x = 12', 'x = 6'], answer: 'x = 27' },
      { q: 'Solve: 3(x + 2) = 21', choices: ['x = 5', 'x = 7', 'x = 3', 'x = 9'], answer: 'x = 5' },
      { q: 'Solve: 4x = 2x + 12', choices: ['x = 6', 'x = 4', 'x = 3', 'x = 12'], answer: 'x = 6' },
    ],
  },
  'A.8A': {
    label: 'Exponents & Roots',
    icon: '√',
    questions: [
      { q: 'What is √(144)?', choices: ['12', '14', '11', '13'], answer: '12' },
      { q: 'Simplify: 2^(3) × 2^(2)', choices: ['2^(5) = 32', '2^(6) = 64', '2^(1) = 2', '4^(5)'], answer: '2^(5) = 32' },
      { q: 'What is 5^(0)?', choices: ['1', '0', '5', 'Undefined'], answer: '1' },
      { q: 'Simplify: √(49 × 4)', choices: ['14', '28', '7', '196'], answer: '14' },
      { q: 'What is 3^(−2)?', choices: ['(1)/(9)', '−9', '−6', '9'], answer: '(1)/(9)' },
    ],
  },
  'A.11B': {
    label: 'Quadratics',
    icon: '📈',
    questions: [
      { q: 'What shape does y = x^(2) make?', choices: ['Parabola', 'Line', 'Circle', 'Hyperbola'], answer: 'Parabola' },
      { q: 'What is the vertex of y = (x − 3)^(2) + 2?', choices: ['(3, 2)', '(−3, 2)', '(3, −2)', '(2, 3)'], answer: '(3, 2)' },
      { q: 'Factor: x^(2) − 9', choices: ['(x+3)(x−3)', '(x+9)(x−1)', '(x−3)^(2)', '(x+3)^(2)'], answer: '(x+3)(x−3)' },
      { q: 'Solve: x^(2) = 25', choices: ['x = ±5', 'x = 5', 'x = −5', 'x = 25'], answer: 'x = ±5' },
      { q: 'In y = ax^(2) + bx + c, what determines if the parabola opens up or down?', choices: ['Sign of a', 'Value of b', 'Value of c', 'Sign of b'], answer: 'Sign of a' },
    ],
  },
  'A.12B': {
    label: 'GCF & LCM',
    icon: '🔗',
    questions: [
      { q: 'What is the GCF of 12 and 18?', choices: ['6', '3', '9', '12'], answer: '6' },
      { q: 'What is the LCM of 4 and 6?', choices: ['12', '24', '6', '2'], answer: '12' },
      { q: 'Factor 24 into primes.', choices: ['2^(3) × 3', '4 × 6', '2 × 12', '8 × 3'], answer: '2^(3) × 3' },
      { q: 'GCF(20, 30) = ?', choices: ['10', '20', '5', '30'], answer: '10' },
      { q: 'LCM(3, 5) = ?', choices: ['15', '8', '1', '30'], answer: '15' },
    ],
  },
  // TExES Math 7-12 — Mathematical Learning, Instruction & Assessment
  c020: {
    label: 'Instruction',
    icon: '🧠',
    questions: [
      { q: 'In CRA, what does A stand for?', choices: ['Assessment', 'Abstract', 'Algorithm', 'Application'], answer: 'Abstract' },
      { q: 'Which move best supports conceptual understanding first?', choices: ['Memorize formulas only', 'Use multiple representations', 'Timed drill immediately', 'Skip discourse'], answer: 'Use multiple representations' },
      { q: 'A teacher changes groups after checking exit tickets. This is:', choices: ['Summative grading', 'Responsive instruction', 'Norm-referenced scoring', 'Benchmark-only planning'], answer: 'Responsive instruction' },
      { q: 'Sentence stems in math class primarily support:', choices: ['Classroom volume', 'Academic language production', 'Calculator speed', 'Homework completion'], answer: 'Academic language production' },
      { q: 'Asking students to compare two methods mainly builds:', choices: ['Procedural fluency only', 'Reasoning and discourse', 'Seat time', 'Memorization'], answer: 'Reasoning and discourse' },
    ],
  },
  c021: {
    label: 'Assessment',
    icon: '📋',
    questions: [
      { q: 'Which assessment is used during learning to adjust instruction?', choices: ['Formative', 'Summative', 'Normed exam', 'Final project only'], answer: 'Formative' },
      { q: 'A quality rubric criterion for math explanation focuses on:', choices: ['Neat handwriting', 'Reasoning evidence', 'Page length', 'Color usage'], answer: 'Reasoning evidence' },
      { q: 'Analyzing wrong answers is most useful for identifying:', choices: ['Student seating', 'Misconceptions', 'Attendance errors', 'Bell schedule'], answer: 'Misconceptions' },
      { q: 'Which phrase best describes high-impact feedback?', choices: ['General praise only', 'Specific and actionable', 'Given once per unit', 'Focused on personality'], answer: 'Specific and actionable' },
      { q: 'If results are consistent across similar administrations, the assessment has high:', choices: ['Validity', 'Reliability', 'Bias', 'Difficulty drift'], answer: 'Reliability' },
    ],
  },
  comp006: {
    label: 'Teaching Moves',
    icon: '🎯',
    questions: [
      { q: 'Standards-aligned planning begins with:', choices: ['Random worksheet', 'Learning goal and success criteria', 'Homework first', 'Quiz score sorting'], answer: 'Learning goal and success criteria' },
      { q: 'Best immediate response to a common class misconception:', choices: ['Ignore and continue', 'Probe thinking and reteach', 'Assign extra homework only', 'Move to next chapter'], answer: 'Probe thinking and reteach' },
      { q: 'A valid reason to use multiple entry points is to:', choices: ['Lower expectations', 'Increase access while keeping rigor', 'Avoid discussion', 'Reduce planning'], answer: 'Increase access while keeping rigor' },
      { q: 'After collecting quick-check data, strongest next step is:', choices: ['Keep same plan regardless', 'Adjust instruction for needs', 'Grade and file away', 'Only reteach top students'], answer: 'Adjust instruction for needs' },
      { q: 'Questioning that asks “How do you know?” targets:', choices: ['Compliance', 'Mathematical justification', 'Speed only', 'Copying notes'], answer: 'Mathematical justification' },
    ],
  },
  comp001: {
    label: 'Number Concepts',
    icon: '🔢',
    questions: [
      { q: 'Which set includes both rational and irrational numbers?', choices: ['Integers', 'Natural numbers', 'Real numbers', 'Whole numbers'], answer: 'Real numbers' },
      { q: 'What is |−7|?', choices: ['−7', '7', '0', '1/7'], answer: '7' },
      { q: 'Which is irrational?', choices: ['3/4', '0.25', '√(2)', '−5'], answer: '√(2)' },
      { q: 'LCM is used to find:', choices: ['Least common denominator', 'Largest prime factor', 'Mean', 'Range'], answer: 'Least common denominator' },
      { q: 'If a number can be written as a/b, b ≠ 0, it is:', choices: ['Irrational', 'Complex only', 'Rational', 'Imaginary'], answer: 'Rational' },
    ],
  },
  comp002: {
    label: 'Algebra',
    icon: '📈',
    questions: [
      { q: 'Constant first differences indicate a(n):', choices: ['Quadratic', 'Linear pattern', 'Exponential decay', 'Random set'], answer: 'Linear pattern' },
      { q: 'Slope represents:', choices: ['Y-intercept only', 'Rate of change', 'Domain limit', 'Axis of symmetry'], answer: 'Rate of change' },
      { q: 'Vertex form y = a(x − h)^(2) + k makes it easiest to read:', choices: ['Roots only', 'Asymptote', 'Vertex', 'Average rate'], answer: 'Vertex' },
      { q: 'Solving a system graphically means finding:', choices: ['Any x-value', 'The intersection point', 'The y-intercept only', 'The slope sign'], answer: 'The intersection point' },
      { q: 'For exponential growth, the base is typically:', choices: ['0', '1', 'Greater than 1', 'Negative'], answer: 'Greater than 1' },
    ],
  },
  comp003: {
    label: 'Geometry',
    icon: '📐',
    questions: [
      { q: 'Pythagorean theorem applies to:', choices: ['Any triangle', 'Right triangles', 'Only equilateral triangles', 'Only circles'], answer: 'Right triangles' },
      { q: 'A rigid transformation preserves:', choices: ['Area only', 'Distance and angle measure', 'Slope only', 'Orientation only'], answer: 'Distance and angle measure' },
      { q: 'Area units are:', choices: ['Linear units', 'Square units', 'Cubic units', 'Degrees'], answer: 'Square units' },
      { q: 'Volume units are:', choices: ['Square units', 'Cubic units', 'Percent', 'Radians'], answer: 'Cubic units' },
      { q: 'Radius is ____ the diameter.', choices: ['Double', 'Half', 'Equal to', 'Unrelated to'], answer: 'Half' },
    ],
  },

  /* ── Differential & Integral Calculus (c010) ── */
  'c010-lim': {
    label: 'Limits',
    icon: '🎯',
    questions: [
      { q: 'What is lim_(x→3) (x^(2) − 9)/(x − 3)?', choices: ['6', '0', '3', 'Undefined'], answer: '6' },
      { q: 'If lim_(x→a) f(x) = f(a), the function is ___ at a.', choices: ['Continuous', 'Differentiable', 'Increasing', 'Bounded'], answer: 'Continuous' },
      { q: 'lim_(x→0) sin(x)/x = ?', choices: ['1', '0', '∞', 'Undefined'], answer: '1' },
      { q: 'A limit that approaches different values from left and right is called:', choices: ['Does not exist', 'Continuous', 'Finite', 'Removable'], answer: 'Does not exist' },
      { q: 'lim_(x→∞) (1)/(x) = ?', choices: ['0', '1', '∞', 'Undefined'], answer: '0' },
    ],
  },
  'c010-der': {
    label: 'Derivatives',
    icon: '📈',
    questions: [
      { q: 'The derivative of x^(3) is:', choices: ['3x^(2)', 'x^(2)', '3x^(3)', '(x^(4))/(4)'], answer: '3x^(2)' },
      { q: 'f\'(x) = 0 at a point means the tangent line is:', choices: ['Horizontal', 'Vertical', 'Undefined', 'Steep'], answer: 'Horizontal' },
      { q: 'The derivative of sin(x) is:', choices: ['cos(x)', '−cos(x)', 'sin(x)', '−sin(x)'], answer: 'cos(x)' },
      { q: 'The chain rule is used when you have:', choices: ['A composition of functions', 'Two added functions', 'A constant', 'A polynomial only'], answer: 'A composition of functions' },
      { q: 'If f\'(x) > 0 on an interval, f is:', choices: ['Increasing', 'Decreasing', 'Constant', 'Undefined'], answer: 'Increasing' },
    ],
  },
  'c010-int': {
    label: 'Integrals',
    icon: '∫',
    questions: [
      { q: '∫ x^(2) dx = ?', choices: ['(x^(3))/(3) + C', 'x^(3) + C', '2x + C', '(x^(2))/(2) + C'], answer: '(x^(3))/(3) + C' },
      { q: 'A definite integral computes:', choices: ['Net area under the curve', 'The slope', 'A derivative', 'The y-intercept'], answer: 'Net area under the curve' },
      { q: 'The Fundamental Theorem of Calculus links:', choices: ['Derivatives and integrals', 'Limits and slopes', 'Area and perimeter', 'Sine and cosine'], answer: 'Derivatives and integrals' },
      { q: '∫cos(x) dx = ?', choices: ['sin(x) + C', '−sin(x) + C', 'cos(x) + C', 'tan(x) + C'], answer: 'sin(x) + C' },
      { q: 'The "C" in an indefinite integral represents:', choices: ['Constant of integration', 'Coefficient', 'Cosine', 'Chain rule result'], answer: 'Constant of integration' },
    ],
  },
  'c010-fun': {
    label: 'Functions',
    icon: '⚡',
    questions: [
      { q: 'The domain of f(x) = 1/x excludes:', choices: ['x = 0', 'x = 1', 'All negatives', 'Nothing'], answer: 'x = 0' },
      { q: 'An even function satisfies:', choices: ['f(−x) = f(x)', 'f(−x) = −f(x)', 'f(0) = 0', 'f(x) > 0'], answer: 'f(−x) = f(x)' },
      { q: 'A vertical asymptote occurs where:', choices: ['The denominator is zero', 'The function is constant', 'The derivative is zero', 'The numerator is zero'], answer: 'The denominator is zero' },
      { q: 'Which is a transcendental function?', choices: ['e^(x)', 'x^(2) + 1', '3x − 7', 'x^(5)'], answer: 'e^(x)' },
      { q: 'If f(g(x)) = x and g(f(x)) = x, then f and g are:', choices: ['Inverses', 'Equal', 'Perpendicular', 'Parallel'], answer: 'Inverses' },
    ],
  },
  'c010-app': {
    label: 'Applications',
    icon: '🚀',
    questions: [
      { q: 'To find maximum profit, set the ___ equal to zero.', choices: ['First derivative', 'Second derivative', 'Integral', 'Limit'], answer: 'First derivative' },
      { q: 'Related rates problems use which rule?', choices: ['Chain rule', 'Power rule only', 'L\'Hôpital\'s rule', 'Sum rule'], answer: 'Chain rule' },
      { q: 'The second derivative tells you about:', choices: ['Concavity', 'Slope', 'Area', 'Domain'], answer: 'Concavity' },
      { q: 'To find area between two curves, you ___ their functions.', choices: ['Subtract and integrate', 'Add and differentiate', 'Multiply', 'Divide'], answer: 'Subtract and integrate' },
      { q: 'If f\'\'(c) > 0 at a critical point c, the point is a:', choices: ['Local minimum', 'Local maximum', 'Saddle point', 'Inflection point'], answer: 'Local minimum' },
    ],
  },
  comp004: {
    label: 'Probability & Stats',
    icon: '🎲',
    questions: [
      { q: 'Mean is computed by:', choices: ['Middle value', 'Most frequent value', 'Sum ÷ count', 'Max − min'], answer: 'Sum ÷ count' },
      { q: 'Median is the:', choices: ['Average', 'Middle value', 'Largest value', 'Smallest value'], answer: 'Middle value' },
      { q: 'For independent events, P(A and B)=', choices: ['P(A)+P(B)', 'P(A)×P(B)', 'P(A)−P(B)', '1−P(A)'], answer: 'P(A)×P(B)' },
      { q: 'Total probability of a complete sample space is:', choices: ['0', '0.5', '1', 'Depends on units'], answer: '1' },
      { q: 'Scatter plots are used to study:', choices: ['Exact proofs', 'Correlation', 'Prime factorization', 'Polygon congruence'], answer: 'Correlation' },
    ],
  },
  comp005: {
    label: 'Processes',
    icon: '🧩',
    questions: [
      { q: 'A counterexample is used to:', choices: ['Prove every claim', 'Disprove a universal claim', 'Estimate answers', 'Find slope'], answer: 'Disprove a universal claim' },
      { q: 'Deductive reasoning moves from:', choices: ['Specific to general', 'General to specific', 'Graph to table only', 'Data to opinion'], answer: 'General to specific' },
      { q: 'A strong mathematical argument includes:', choices: ['A guess only', 'Logical justification', 'No assumptions', 'Only final answer'], answer: 'Logical justification' },
      { q: 'Modeling in math means:', choices: ['Memorizing formulas', 'Representing real situations mathematically', 'Drawing only', 'Eliminating variables only'], answer: 'Representing real situations mathematically' },
      { q: 'Checking reasonableness helps with:', choices: ['Formatting', 'Solution verification', 'Color choices', 'Class attendance'], answer: 'Solution verification' },
    ],
  },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_BANKS);

const STD_TO_COMP = {
  c001: 'comp001', c002: 'comp001', c003: 'comp001',
  c004: 'comp002', c005: 'comp002', c006: 'comp002', c007: 'comp002', c008: 'comp002',
  c009: 'comp003', c010: 'comp003', c011: 'comp003', c012: 'comp003', c013: 'comp003',
  c014: 'comp004', c015: 'comp004', c016: 'comp004', c017: 'comp004',
  c018: 'comp005', c019: 'comp005',
  c020: 'comp006', c021: 'comp006',
};

const STD_JEOPARDY_CATS = {
  c010: ['c010-lim', 'c010-der', 'c010-int', 'c010-fun', 'c010-app'],
};

function expandStdCats(keys) {
  const expanded = [];
  for (const k of keys) {
    if (STD_JEOPARDY_CATS[k]) expanded.push(...STD_JEOPARDY_CATS[k]);
    else expanded.push(k);
  }
  return [...new Set(expanded)];
}

function pickCategories(filterTeks, options = {}) {
  const { compId = '', currentStd = '', strictScope = false } = options;
  const teksIds = filterTeks
    ? filterTeks.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const rawKeys = [...new Set([
    currentStd,
    ...teksIds,
    compId,
    STD_TO_COMP[currentStd],
    ...teksIds.map((id) => STD_TO_COMP[id]).filter(Boolean),
  ].filter(Boolean))];

  const strictKeys = expandStdCats(rawKeys);

  if (strictScope) {
    const matchedStrict = strictKeys.filter((k) => CATEGORY_BANKS[k]);
    if (matchedStrict.length === 0) return [];
    return matchedStrict.sort(() => Math.random() - 0.5).slice(0, Math.min(5, matchedStrict.length));
  }

  // Collect all matching categories
  const matched = teksIds.filter(t => CATEGORY_BANKS[t]);

  if (matched.length >= 5) {
    return matched.sort(() => Math.random() - 0.5).slice(0, 5);
  }

  if (matched.length > 0) {
    // Infer the domain prefix (e.g. "PROB", "A", "3") to pull related categories
    const prefixes = new Set(matched.map(t => t.split('.')[0]));
    const related = ALL_CATEGORIES.filter(
      t => !matched.includes(t) && prefixes.has(t.split('.')[0]),
    ).sort(() => Math.random() - 0.5);

    const pool = [...matched, ...related];
    if (pool.length >= 5) return pool.slice(0, 5);

    // Still need more — fill from other categories
    const usedSet = new Set(pool);
    const rest = ALL_CATEGORIES.filter(t => !usedSet.has(t)).sort(() => Math.random() - 0.5);
    return [...pool, ...rest].slice(0, 5);
  }

  return ALL_CATEGORIES.sort(() => Math.random() - 0.5).slice(0, 5);
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const MathJeopardy = () => {
  const [searchParams] = useSearchParams();
  const teksFilter = searchParams.get('teks');
  const compFilter = searchParams.get('comp') || '';
  const currentStd = searchParams.get('currentStd') || searchParams.get('std') || '';
  const teksLabel = searchParams.get('label') || teksFilter;
  const sid = searchParams.get('sid');
  const aid = searchParams.get('aid');
  const cid = searchParams.get('cid');
  const strictScope = searchParams.get('from') === 'loop' && !!(teksFilter || compFilter || currentStd);

  const [categories] = useState(() => pickCategories(teksFilter, { compId: compFilter, currentStd, strictScope }));
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(new Set()); // "col-row" keys
  const [activeCell, setActiveCell] = useState(null); // { col, row, q, points }
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false); // true after answering
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [dailyDouble, setDailyDouble] = useState(null); // "col-row" key
  const [showDailyDouble, setShowDailyDouble] = useState(false);
  const [wager, setWager] = useState(0);

  const { returnUrl, goBack, isEmbedded } = useGameReturn();

  // Set a random daily double on mount
  useEffect(() => {
    const col = Math.floor(Math.random() * categories.length);
    const row = Math.floor(Math.random() * 5);
    setDailyDouble(`${col}-${row}`);
  }, [categories]);

  const totalCells = categories.length * 5;
  const maxScore = categories.length * POINT_VALUES.reduce((a, b) => a + b, 0);

  if (strictScope && categories.length === 0) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#7f1d1d' }}>
          No competency-aligned Jeopardy categories are available for this loop step yet.
        </div>
        <div style={{ marginTop: 12 }}>
          {returnUrl ? <LoopContinueButton onClick={goBack} /> : !isEmbedded ? <Link to="/games">Back to Games</Link> : null}
        </div>
      </div>
    );
  }

  const handleCellClick = useCallback((col, row) => {
    const key = `${col}-${row}`;
    if (answered.has(key) || activeCell || gameOver) return;
    const teks = categories[col];
    const bank = CATEGORY_BANKS[teks];
    const q = bank.questions[row];
    const points = POINT_VALUES[row];

    if (key === dailyDouble) {
      setActiveCell({ col, row, q, points, teks, isDailyDouble: true });
      setShowDailyDouble(true);
      setWager(Math.min(points, Math.max(score, 100)));
      return;
    }

    setActiveCell({ col, row, q, points, teks });
  }, [answered, activeCell, gameOver, categories, dailyDouble, score]);

  const handleAnswer = useCallback((choice) => {
    if (showResult || !activeCell) return;
    setSelectedAnswer(choice);
    setShowResult(true);

    const isCorrect = choice === activeCell.q.answer;
    const points = activeCell.isDailyDouble ? wager : activeCell.points;

    if (isCorrect) {
      setScore(prev => prev + points);
      setStreak(prev => {
        const next = prev + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
    } else {
      setScore(prev => Math.max(0, prev - (activeCell.isDailyDouble ? wager : 0)));
      setStreak(0);
    }

    setAnsweredQuestions(prev => [...prev, {
      question: activeCell.q.q,
      correctAnswer: activeCell.q.answer,
      studentAnswer: choice,
      correct: isCorrect,
      teks: activeCell.teks,
      points: isCorrect ? points : 0,
    }]);
  }, [showResult, activeCell, wager]);

  const closeQuestion = useCallback(() => {
    if (!activeCell) return;
    const key = `${activeCell.col}-${activeCell.row}`;
    setAnswered(prev => new Set([...prev, key]));
    setActiveCell(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowDailyDouble(false);

    // Check if game is over
    if (answered.size + 1 >= totalCells) {
      setGameOver(true);
      const pct = Math.round((score / maxScore) * 100);
      saveGameResult('math-jeopardy', {
        score,
        total: maxScore,
        percentage: pct,
        teksStandards: categories,
        questions: answeredQuestions,
      }, { sid, aid, cid });
    }
  }, [activeCell, answered, totalCells, score, maxScore, categories, answeredQuestions, sid, aid, cid]);

  const confirmWager = () => {
    setShowDailyDouble(false);
  };

  const resetGame = () => {
    setScore(0);
    setAnswered(new Set());
    setActiveCell(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setShowReview(false);
    setAnsweredQuestions([]);
    setStreak(0);
    setBestStreak(0);
    const col = Math.floor(Math.random() * categories.length);
    const row = Math.floor(Math.random() * 5);
    setDailyDouble(`${col}-${row}`);
  };

  if (showReview) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <GameReview
          questions={answeredQuestions}
          score={score}
          total={maxScore}
          gameName="Math Jeopardy"
          onClose={() => setShowReview(false)}
        />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
          <button onClick={resetGame} style={btnStyle('#22c55e')}>Play Again</button>
          {!isEmbedded && <Link to="/games" style={{ ...btnStyle('#6366f1'), textDecoration: 'none' }}>Back to Games</Link>}
        </div>
      </div>
    );
  }

  const catColors = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a1628 0%, #1a237e 50%, #0a1628 100%)',
      color: '#fff',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      padding: '0 0 40px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px',
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '2px solid rgba(255,255,255,0.08)',
      }}>
        {returnUrl ? (
          <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue</button>
        ) : !isEmbedded ? (
          <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Games</Link>
        ) : <span />}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2, color: '#fbbf24' }}>
            MATH JEOPARDY
          </div>
          {teksLabel && <div style={{ fontSize: 11, color: '#94a3b8' }}>Focus: {teksLabel}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24' }}>${score}</div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>
            {streak > 1 && <span>🔥 {streak} streak</span>}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '8px 20px' }}>
        <div style={{
          height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
            width: `${(answered.size / totalCells) * 100}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, textAlign: 'center' }}>
          {answered.size} / {totalCells} questions answered
        </div>
        {answered.size === 0 && (
          <div style={{ maxWidth: 320, margin: '8px auto 0' }}>
            <QBotBubble msg="Pick a square to begin! QBot is cheering you on! 🤖" />
          </div>
        )}
      </div>

      {/* Jeopardy Board */}
      <div style={{
        maxWidth: 740, margin: '10px auto 0', padding: '0 12px',
      }}>
        {/* Category headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${categories.length}, 1fr)`,
          gap: 4,
          marginBottom: 4,
        }}>
          {categories.map((teks, ci) => {
            const bank = CATEGORY_BANKS[teks];
            return (
              <div key={teks} style={{
                background: catColors[ci % catColors.length],
                borderRadius: '10px 10px 4px 4px',
                padding: '12px 6px',
                textAlign: 'center',
                boxShadow: `0 2px 12px ${catColors[ci % catColors.length]}44`,
              }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{bank.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>{bank.label}</div>
                <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>{teks}</div>
              </div>
            );
          })}
        </div>

        {/* Question grid */}
        {POINT_VALUES.map((pts, row) => (
          <div key={row} style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${categories.length}, 1fr)`,
            gap: 4,
            marginBottom: 4,
          }}>
            {categories.map((teks, col) => {
              const key = `${col}-${row}`;
              const isAnswered = answered.has(key);
              const color = catColors[col % catColors.length];

              return (
                <button
                  key={key}
                  type="button"
                  disabled={isAnswered || !!activeCell}
                  onClick={() => handleCellClick(col, row)}
                  style={{
                    padding: '18px 8px',
                    borderRadius: 6,
                    border: isAnswered ? '2px solid transparent' : `2px solid ${color}44`,
                    background: isAnswered
                      ? 'rgba(255,255,255,0.03)'
                      : `linear-gradient(145deg, ${color}22, ${color}11)`,
                    color: isAnswered ? '#334155' : '#fbbf24',
                    fontSize: 22,
                    fontWeight: 900,
                    cursor: isAnswered ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    fontFamily: '"Inter", sans-serif',
                  }}
                  onMouseEnter={(e) => { if (!isAnswered) e.currentTarget.style.background = `${color}33`; }}
                  onMouseLeave={(e) => { if (!isAnswered) e.currentTarget.style.background = `linear-gradient(145deg, ${color}22, ${color}11)`; }}
                >
                  {isAnswered ? '—' : `$${pts}`}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* End Game button */}
      {!gameOver && answered.size > 0 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => {
            setGameOver(true);
            saveGameResult('math-jeopardy', {
              score, total: maxScore,
              percentage: Math.round((score / maxScore) * 100),
              teksStandards: categories,
              questions: answeredQuestions,
            }, { sid, aid, cid });
          }} style={{
            padding: '8px 20px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
            cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}>
            End Game Early
          </button>
        </div>
      )}

      {/* ══ Question Modal ══ */}
      {activeCell && !showDailyDouble && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 20,
        }}>
          <div style={{
            background: 'linear-gradient(170deg, #1e293b, #0f172a)',
            borderRadius: 20, padding: '32px 28px', maxWidth: 520, width: '100%',
            border: `3px solid ${catColors[activeCell.col % catColors.length]}`,
            boxShadow: `0 8px 40px ${catColors[activeCell.col % catColors.length]}33`,
            position: 'relative',
          }}>
            {/* Points badge */}
            <div style={{
              position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
              padding: '6px 20px', borderRadius: 20,
              background: catColors[activeCell.col % catColors.length],
              fontSize: 16, fontWeight: 900, color: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              {activeCell.isDailyDouble ? `DAILY DOUBLE · $${wager}` : `$${activeCell.points}`}
            </div>

            {/* Category + TEKS */}
            <div style={{ textAlign: 'center', marginTop: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                {CATEGORY_BANKS[activeCell.teks].icon} {CATEGORY_BANKS[activeCell.teks].label} · {activeCell.teks}
              </span>
            </div>

            {/* Question */}
            <div style={{
              fontSize: 20, fontWeight: 700, textAlign: 'center',
              lineHeight: 1.5, marginBottom: 24, color: '#f1f5f9',
              padding: '0 8px',
            }}
              dangerouslySetInnerHTML={{ __html: jeopardyMathHtml(activeCell.q.q) }}
            />

            {/* Answer choices */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {activeCell.q.choices.map((choice, i) => {
                const isSelected = selectedAnswer === choice;
                const isCorrectAnswer = choice === activeCell.q.answer;
                let bg = 'rgba(255,255,255,0.06)';
                let border = '2px solid rgba(255,255,255,0.12)';
                let textColor = '#e2e8f0';

                if (showResult) {
                  if (isCorrectAnswer) {
                    bg = 'rgba(34,197,94,0.2)';
                    border = '2px solid #22c55e';
                    textColor = '#22c55e';
                  } else if (isSelected && !isCorrectAnswer) {
                    bg = 'rgba(239,68,68,0.2)';
                    border = '2px solid #ef4444';
                    textColor = '#ef4444';
                  }
                } else if (isSelected) {
                  bg = catColors[activeCell.col % catColors.length] + '33';
                  border = `2px solid ${catColors[activeCell.col % catColors.length]}`;
                }

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={showResult}
                    onClick={() => handleAnswer(choice)}
                    style={{
                      padding: '14px 12px', borderRadius: 10,
                      background: bg, border,
                      color: textColor,
                      fontSize: 15, fontWeight: 700,
                      cursor: showResult ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'center',
                      lineHeight: 1.3,
                    }}
                  >
                    <span dangerouslySetInnerHTML={{ __html: jeopardyMathHtml(choice) }} />
                  </button>
                );
              })}
            </div>

            {/* Result feedback */}
            {showResult && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <div style={{
                  fontSize: 18, fontWeight: 900,
                  color: selectedAnswer === activeCell.q.answer ? '#22c55e' : '#ef4444',
                  marginBottom: 8,
                }}>
                  {selectedAnswer === activeCell.q.answer
                    ? `Correct reasoning. +$${activeCell.isDailyDouble ? wager : activeCell.points}`
                    : (
                      <span>
                        Not correct. The accepted solution is{' '}
                        <span dangerouslySetInnerHTML={{ __html: jeopardyMathHtml(activeCell.q.answer) }} />
                      </span>
                    )}
                </div>
                <button onClick={closeQuestion} style={{
                  padding: '10px 28px', background: '#fbbf24', color: '#0f172a',
                  border: 'none', borderRadius: 10, cursor: 'pointer',
                  fontSize: 14, fontWeight: 800,
                }}>
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ Daily Double Wager Modal ══ */}
      {showDailyDouble && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200,
        }}>
          <div style={{
            background: 'linear-gradient(170deg, #1e293b, #0f172a)',
            borderRadius: 20, padding: '36px 32px', maxWidth: 400, width: '90%',
            border: '3px solid #fbbf24',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>⭐</div>
            <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#fbbf24' }}>
              DAILY DOUBLE!
            </h2>
            <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: 14 }}>
              How much do you want to wager?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24' }}>$</span>
              <input
                type="number"
                min={0}
                max={Math.max(score, 500)}
                value={wager}
                onChange={(e) => setWager(Math.max(0, Math.min(Math.max(score, 500), parseInt(e.target.value) || 0)))}
                style={{
                  width: 120, padding: '10px 14px', fontSize: 22, fontWeight: 900,
                  textAlign: 'center', background: 'rgba(255,255,255,0.08)',
                  color: '#fbbf24', border: '2px solid #fbbf24', borderRadius: 10,
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>
              Max wager: ${Math.max(score, 500)} · Current score: ${score}
            </p>
            <button onClick={confirmWager} style={{
              padding: '12px 36px', background: '#fbbf24', color: '#0f172a',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              fontSize: 16, fontWeight: 900,
            }}>
              Lock It In!
            </button>
          </div>
        </div>
      )}

      {/* ══ Game Over ══ */}
      {gameOver && !activeCell && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200,
        }}>
          <div style={{
            background: 'linear-gradient(170deg, #1e293b, #0f172a)',
            borderRadius: 20, padding: '36px 32px', maxWidth: 400, width: '90%',
            border: '2px solid #334155',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
            <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#fbbf24' }}>
              {score >= maxScore * 0.7 ? 'Jeopardy Math Mastery!' : score >= maxScore * 0.4 ? 'Solid Math Reasoning' : 'Skills Building in Progress'}
            </h2>
            <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: 14 }}>
              Final Score: <strong style={{ color: '#fbbf24' }}>${score}</strong> of ${maxScore}
            </p>

            <QBotBubble msg="Review missed clues by rebuilding each equation or property step-by-step. 🤖⭐" />

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
              background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 14, marginBottom: 20,
            }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>
                  {answeredQuestions.filter(q => q.correct).length}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Correct</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444' }}>
                  {answeredQuestions.filter(q => !q.correct).length}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Wrong</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>
                  🔥 {bestStreak}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Best Streak</div>
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

const QBotBubble = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,245,255,0.05)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(0,245,255,0.1)', marginBottom: 12 }}>
    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#1e3a5f,#0d1b2a)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #00f5ff', overflow: 'hidden' }}>
      <img src={qbotImg} alt="QBot" style={{ width: 24 }} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#7dd3fc', lineHeight: 1.4 }}>{msg}</div>
  </div>
);

export default MathJeopardy;
