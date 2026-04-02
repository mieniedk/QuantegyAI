import React, { useState, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import qbotImg from '../assets/qbot.svg';
import { formatMathHtml } from '../utils/mathFormat';
import { sanitizeHtml } from '../utils/sanitize';
import { explainJeopardyMc } from '../utils/loopGameTutoring';

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
      { q: 'What is 125 + 234?', choices: ['359', '349', '369', '259'], answer: '359', explanation: 'Add ones, then tens, then hundreds with regrouping: 125 + 234 = 359.', misconception: 'Check regrouping—349 and 369 are common if a column sum is misread.' },
      { q: 'What is 503 − 278?', choices: ['225', '235', '215', '325'], answer: '225', explanation: 'Subtract with regrouping from 503: 503 − 278 = 225.', misconception: '235 often comes from subtracting smaller digits top-down without trading.' },
      { q: '467 + 385 = ?', choices: ['852', '842', '862', '752'], answer: '852', explanation: '7+5=12 (write 2, carry 1); 6+8+1=15 (write 5, carry 1); 4+3+1=8 → 852.', misconception: 'Forgetting carried 1 into the hundreds column yields 842.' },
      { q: '1,000 − 463 = ?', choices: ['537', '547', '637', '437'], answer: '537', explanation: 'Think complement: 463 + 537 = 1000, or regroup across zeros carefully.', misconception: '437 is a typical under-subtraction error.' },
      { q: 'A store had 1,250 items. They sold 687. How many are left?', choices: ['563', '573', '463', '663'], answer: '563', explanation: '“Left” means subtract: 1250 − 687 = 563.', misconception: 'Adding sold to inventory answers a different question.' },
    ],
  },
  '3.4C': {
    label: 'Multiply',
    icon: '✖️',
    questions: [
      { q: 'What is 3 × 4?', choices: ['12', '7', '16', '9'], answer: '12', explanation: '3 groups of 4 (or 4 groups of 3) = 12; memorize or skip-count.', misconception: 'Adding 3+4 gives 7, not the product.' },
      { q: 'What is 7 × 6?', choices: ['42', '36', '48', '56'], answer: '42', explanation: '7 × 6 = 42 from facts or as 7 + 7 + 7 + 7 + 7 + 7.', misconception: '56 is 7×8; match the pair to the question.' },
      { q: '9 × 8 = ?', choices: ['72', '63', '81', '64'], answer: '72', explanation: '9 × 8 = 72 (one of the “harder” facts—use 10×8 − 8 if needed).', misconception: '81 is 9×9, not 9×8.' },
      { q: 'A baker makes 8 trays with 7 muffins each. How many muffins in all?', choices: ['56', '48', '63', '54'], answer: '56', explanation: 'Equal groups → multiply: 8 × 7 = 56.', misconception: '8 + 7 is not the total for “each” problems.' },
      { q: 'There are 9 rows of desks with 9 desks in each row. How many desks?', choices: ['81', '72', '90', '63'], answer: '81', explanation: '9 × 9 = 81 (square number).', misconception: '72 is 9×8; both factors are 9 here.' },
    ],
  },
  '3.4D': {
    label: 'Divide',
    icon: '➗',
    questions: [
      { q: 'What is 12 ÷ 3?', choices: ['4', '3', '6', '5'], answer: '4', explanation: 'How many 3s in 12? 3 × 4 = 12, so 12 ÷ 3 = 4.', misconception: 'Dividing is not “subtract 3 once.”' },
      { q: '35 ÷ 5 = ?', choices: ['7', '6', '8', '5'], answer: '7', explanation: '5 × 7 = 35, so 35 ÷ 5 = 7.', misconception: '6 × 5 = 30, not 35.' },
      { q: '56 ÷ 8 = ?', choices: ['7', '8', '6', '9'], answer: '7', explanation: '8 × 7 = 56, so 56 ÷ 8 = 7.', misconception: '8 × 8 = 64, not 56.' },
      { q: '72 cookies shared equally among 9 friends. How many each?', choices: ['8', '7', '9', '6'], answer: '8', explanation: 'Partition 72 into 9 equal shares: 72 ÷ 9 = 8.', misconception: '“Shared equally” means divide, not multiply.' },
      { q: 'A farmer plants 63 seeds in 7 equal rows. How many seeds per row?', choices: ['9', '8', '7', '10'], answer: '9', explanation: '63 ÷ 7 = 9 because 7 × 9 = 63.', misconception: '7 × 8 = 56; need product 63.' },
    ],
  },
  '3.3A': {
    label: 'Fractions',
    icon: '🍕',
    questions: [
      { q: 'What fraction is shaded if 1 of 4 equal parts is colored?', choices: ['1/4', '1/2', '1/3', '3/4'], answer: '1/4', explanation: 'Numerator = parts shaded; denominator = equal parts in the whole → 1/4.', misconception: '1/2 would need 2 of 4 parts shaded.' },
      { q: 'Which is greater: 3/8 or 5/8?', choices: ['5/8', '3/8', 'They are equal', 'Cannot tell'], answer: '5/8', explanation: 'Same denominator → compare numerators: 5 > 3, so 5/8 is greater.', misconception: 'Do not compare denominators when the bottoms match.' },
      { q: 'What fraction of a pizza is left if you eat 2 of 6 equal slices?', choices: ['4/6', '2/6', '3/6', '1/6'], answer: '4/6', explanation: 'Left = total slices − eaten = 6 − 2 = 4 of 6 → 4/6.', misconception: '2/6 is the part eaten, not left.' },
      { q: 'Place these in order from least to greatest: 5/8, 2/8, 7/8', choices: ['2/8, 5/8, 7/8', '7/8, 5/8, 2/8', '5/8, 2/8, 7/8', '2/8, 7/8, 5/8'], answer: '2/8, 5/8, 7/8', explanation: 'Eighths share a unit; order by numerator: 2 < 5 < 7.', misconception: 'Largest numerator last would be descending order.' },
      { q: 'A number line is divided into 6 equal parts. What fraction is at mark 5?', choices: ['5/6', '1/6', '6/5', '5/5'], answer: '5/6', explanation: '5 of 6 equal intervals from 0 → 5/6.', misconception: '5/5 is the whole; mark 5 is not the endpoint unless mis-counting parts.' },
    ],
  },
  '3.2A': {
    label: 'Place Value',
    icon: '🔢',
    questions: [
      { q: 'What is the value of the 5 in 352?', choices: ['50', '5', '500', '300'], answer: '50', explanation: '5 is in the tens place: 5 × 10 = 50.', misconception: 'Face value 5 ignores place value.' },
      { q: 'What digit is in the hundreds place of 4,728?', choices: ['7', '4', '2', '8'], answer: '7', explanation: 'Places: thousands 4, hundreds 7, tens 2, ones 8.', misconception: '4 is thousands, not hundreds.' },
      { q: 'Write 600 + 40 + 3 as a number.', choices: ['643', '634', '463', '346'], answer: '643', explanation: '6 hundreds, 4 tens, 3 ones → 643.', misconception: '346 swaps hundreds and ones.' },
      { q: 'Which number has a 9 in the thousands place?', choices: ['9,241', '2,941', '4,219', '1,492'], answer: '9,241', explanation: 'Read left to right: 9,241 has 9 in the thousands place.', misconception: 'In 2,941 the 9 is in hundreds.' },
      { q: 'The number 8,056 has how many hundreds?', choices: ['0', '8', '5', '6'], answer: '0', explanation: 'In 8,056 the digit in the hundreds place is 0 (8 thousands, 0 hundreds, 5 tens, 6 ones).', misconception: 'The 8 is in the thousands place, not hundreds.' },
    ],
  },
  '3.5B': {
    label: 'Missing Numbers',
    icon: '❓',
    questions: [
      { q: '5 + ___ = 12. What is the missing number?', choices: ['7', '6', '8', '5'], answer: '7', explanation: 'What adds to 5 to make 12? 12 − 5 = 7.', misconception: 'Guessing without inverse operation leads to off-by-one errors.' },
      { q: '___ × 4 = 24. What is the missing factor?', choices: ['6', '8', '5', '7'], answer: '6', explanation: '24 ÷ 4 = 6, since 6 × 4 = 24.', misconception: '8 × 4 = 32, not 24.' },
      { q: '45 ÷ ___ = 9. What goes in the blank?', choices: ['5', '6', '4', '9'], answer: '5', explanation: 'If 45 ÷ x = 9, then x = 45 ÷ 9 = 5 (check: 45 ÷ 5 = 9).', misconception: 'Picking 9 confuses the divisor with the quotient.' },
      { q: 'If 8 × ___ = 64, what is the missing number?', choices: ['8', '7', '9', '6'], answer: '8', explanation: '64 ÷ 8 = 8.', misconception: '7 × 8 = 56.' },
      { q: '___ − 125 = 375. What is the starting number?', choices: ['500', '450', '400', '550'], answer: '500', explanation: 'Add back: 375 + 125 = 500.', misconception: 'Subtracting again treats it like 500 − 125.' },
    ],
  },
  '3.7B': {
    label: 'Perimeter & Area',
    icon: '📐',
    questions: [
      { q: 'What is the perimeter of a square with side 3?', choices: ['12', '9', '6', '16'], answer: '12', explanation: 'Square perimeter = 4 × side = 4 × 3 = 12.', misconception: '9 is 3×3 (area), not perimeter.' },
      { q: 'A rectangle is 5 long and 3 wide. What is its perimeter?', choices: ['16', '15', '8', '20'], answer: '16', explanation: 'P = 2L + 2W = 2(5) + 2(3) = 10 + 6 = 16.', misconception: '15 is 5×3 (area).' },
      { q: 'What is the area of a 4 × 6 rectangle?', choices: ['24', '20', '10', '28'], answer: '24', explanation: 'Area = length × width = 4 × 6 = 24 square units.', misconception: 'Perimeter would be 2(4+6)=20.' },
      { q: 'A square garden has a perimeter of 36 feet. How long is each side?', choices: ['9', '6', '12', '8'], answer: '9', explanation: 'Side = perimeter ÷ 4 = 36 ÷ 4 = 9.', misconception: '6 × 4 = 24, not 36.' },
      { q: 'A rectangle has area 48 sq units and width 6. What is the length?', choices: ['8', '6', '9', '7'], answer: '8', explanation: 'Length = area ÷ width = 48 ÷ 6 = 8.', misconception: '6 × 6 = 36, not 48.' },
    ],
  },
  '3.5A': {
    label: 'Patterns',
    icon: '🔄',
    questions: [
      { q: 'What comes next? 2, 5, 8, 11, ___', choices: ['14', '13', '15', '12'], answer: '14', explanation: 'Add 3 each time: 11 + 3 = 14.', misconception: 'Adding 2 would ignore the +3 rule.' },
      { q: 'What is the rule? 10, 20, 30, 40...', choices: ['+10', '+20', '×2', '+5'], answer: '+10', explanation: 'Each term is 10 more than the previous.', misconception: '×2 would jump 10→20→40, not 30.' },
      { q: 'Complete: 3, 6, 12, 24, ___', choices: ['48', '36', '30', '28'], answer: '48', explanation: 'Multiply by 2 each step (geometric): 24 × 2 = 48.', misconception: '+12 would give 36, but the rule is doubling.' },
      { q: 'What comes next? 100, 90, 80, 70, ___', choices: ['60', '50', '65', '75'], answer: '60', explanation: 'Subtract 10 each time: 70 − 10 = 60.', misconception: '75 would break the −10 pattern.' },
      { q: 'Skip count by 7: 7, 14, 21, 28, ___', choices: ['35', '34', '36', '42'], answer: '35', explanation: '28 + 7 = 35.', misconception: '42 is the next multiple after 35.' },
    ],
  },
  '3.4H': {
    label: 'Word Problems',
    icon: '📝',
    questions: [
      { q: 'Sam has 24 stickers. He gives 8 away. Which number sentence matches?', choices: ['24 − 8 = ?', '24 + 8 = ?', '24 × 8 = ?', '8 − 24 = ?'], answer: '24 − 8 = ?', explanation: '“Gives away” removes from the total → subtraction.', misconception: 'Adding would increase the amount.' },
      { q: 'A class has 4 rows with 7 desks each. Which number sentence finds the total?', choices: ['4 × 7 = ?', '4 + 7 = ?', '7 − 4 = ?', '7 ÷ 4 = ?'], answer: '4 × 7 = ?', explanation: 'Equal groups of 7, 4 times → multiplication.', misconception: '4 + 7 ignores the “each row” structure.' },
      { q: '36 crayons are shared equally among 6 students. Which finds how many each gets?', choices: ['36 ÷ 6 = ?', '36 − 6 = ?', '36 × 6 = ?', '36 + 6 = ?'], answer: '36 ÷ 6 = ?', explanation: 'Partition into 6 equal shares → divide.', misconception: 'Subtracting 6 only removes one student’s unknown share.' },
      { q: 'A bakery made 156 muffins in the morning and 278 in the afternoon. Which finds the total?', choices: ['156 + 278 = ?', '278 − 156 = ?', '156 × 278 = ?', '278 ÷ 156 = ?'], answer: '156 + 278 = ?', explanation: '“Total” for two parts → add.', misconception: 'Subtracting compares two amounts, not combines them.' },
      { q: 'A farmer has 9 baskets with 8 apples each, then eats 5. Which TWO-step sentence finds how many are left?', choices: ['(9 × 8) − 5 = ?', '9 + 8 − 5 = ?', '(9 − 5) × 8 = ?', '9 × (8 − 5) = ?'], answer: '(9 × 8) − 5 = ?', explanation: 'First total apples = 9×8; then remove 5 eaten.', misconception: '9×(8−5) changes the group size incorrectly.' },
    ],
  },

  /* ── Probability & Statistics ── */
  'PROB.1': {
    label: 'Basic Probability',
    icon: '🎲',
    questions: [
      { q: 'What is the probability of flipping heads on a fair coin?', choices: ['1/2', '1/4', '1/3', '1'], answer: '1/2', explanation: 'Two equally likely outcomes (H, T); favorable is one → 1/2.', misconception: '1 would ignore tails entirely.' },
      { q: 'A bag has 3 red and 5 blue marbles. What is P(red)?', choices: ['3/8', '5/8', '3/5', '1/2'], answer: '3/8', explanation: 'P(red) = red count ÷ total = 3/(3+5) = 3/8.', misconception: '3/5 uses only the blue count as denominator.' },
      { q: 'What is the probability of rolling a 6 on a standard die?', choices: ['1/6', '1/3', '1/2', '6/6'], answer: '1/6', explanation: 'Six faces, one is 6 → 1/6.', misconception: '6/6 would mean “always 6.”' },
      { q: 'A spinner has 4 equal sections: red, blue, green, yellow. What is P(blue)?', choices: ['1/4', '1/2', '1/3', '2/4'], answer: '1/4', explanation: 'One favorable section out of four equal sections.', misconception: '1/2 might come from pairing colors instead of counting sections.' },
      { q: 'Two coins are flipped. What is the probability both are heads?', choices: ['1/4', '1/2', '1/3', '2/4'], answer: '1/4', explanation: 'Sample space {HH, HT, TH, TT}; HH is one of four equally likely outcomes.', misconception: '1/2 treats the second flip as depending on the first or ignores order.' },
    ],
  },
  'PROB.2': {
    label: 'Mean, Median, Mode',
    icon: '📊',
    questions: [
      { q: 'What is the mean of 2, 4, 6, 8, 10?', choices: ['6', '5', '7', '8'], answer: '6', explanation: 'Sum = 30, five values → 30/5 = 6.', misconception: '8 is the maximum, not the average.' },
      { q: 'What is the median of 3, 7, 9, 12, 15?', choices: ['9', '7', '12', '3'], answer: '9', explanation: 'Ordered list already; middle value (third of five) is 9.', misconception: 'Mean would be (3+7+9+12+15)/5 = 9.2 here—median is exactly 9.' },
      { q: 'Data: 4, 4, 5, 6, 7. What is the mode?', choices: ['4', '5', '6', '7'], answer: '4', explanation: 'Mode = most frequent value; 4 appears twice.', misconception: 'Middle number would be median (5), not mode.' },
      { q: 'The range of {5, 12, 8, 20, 3} is?', choices: ['17', '15', '12', '20'], answer: '17', explanation: 'Range = max − min = 20 − 3 = 17.', misconception: '20 is the max alone, not the spread.' },
      { q: 'Test scores: 70, 80, 90, 100. What is the mean?', choices: ['85', '80', '90', '75'], answer: '85', explanation: '(70+80+90+100)/4 = 340/4 = 85.', misconception: '90 is the median of these four, not the mean.' },
    ],
  },
  'PROB.3': {
    label: 'Counting & Combos',
    icon: '🔢',
    questions: [
      { q: 'What is 5! (5 factorial)?', choices: ['120', '60', '24', '20'], answer: '120', explanation: '5! = 5×4×3×2×1 = 120.', misconception: '24 is 4!, not 5!.' },
      { q: 'How many ways can you arrange 3 books on a shelf?', choices: ['6', '3', '9', '12'], answer: '6', explanation: '3! = 6 orderings of three distinct books.', misconception: '3 counts slots, not permutations.' },
      { q: 'C(4, 2) = ? (4 choose 2)', choices: ['6', '8', '4', '12'], answer: '6', explanation: 'C(4,2) = 4!/(2!2!) = 6 unordered pairs.', misconception: '8 is 2^3 for a different problem; combinations are not 4×2 here.' },
      { q: 'A menu has 3 appetizers and 4 entrees. How many different meals?', choices: ['12', '7', '3', '16'], answer: '12', explanation: 'Multiplication principle: 3 × 4 = 12 appetizer–entree pairs.', misconception: '7 is sum, which fits “either/or,” not one of each.' },
      { q: 'P(5, 2) = ? (permutations of 5 items taken 2)', choices: ['20', '10', '25', '15'], answer: '20', explanation: 'P(5,2) = 5×4 = 20 (order matters).', misconception: 'C(5,2)=10 ignores order.' },
    ],
  },
  'PROB.4': {
    label: 'Data & Graphs',
    icon: '📈',
    questions: [
      { q: 'Which graph is best for showing parts of a whole?', choices: ['Circle/Pie chart', 'Line graph', 'Scatter plot', 'Histogram'], answer: 'Circle/Pie chart', explanation: 'Pie slices show proportions that sum to 100% of one whole.', misconception: 'Line graphs emphasize change over time, not composition.' },
      { q: 'A box plot shows which value in the center?', choices: ['Median', 'Mean', 'Mode', 'Range'], answer: 'Median', explanation: 'The box line marks the median (Q2); whiskers extend toward extremes.', misconception: 'The mean is not drawn by default on a standard box plot.' },
      { q: 'What does the IQR (interquartile range) measure?', choices: ['Spread of middle 50%', 'Total range', 'Average value', 'Number of outliers'], answer: 'Spread of middle 50%', explanation: 'IQR = Q3 − Q1, width of the central half of the data.', misconception: 'Total range uses min–max and is more sensitive to outliers.' },
      { q: 'A histogram groups data into what?', choices: ['Bins/intervals', 'Categories', 'Percentages', 'Pairs'], answer: 'Bins/intervals', explanation: 'Numeric data are counted in contiguous intervals (bins).', misconception: 'Bar charts for categorical labels are not the same as histogram bins.' },
      { q: 'A scatter plot with points trending upward shows what correlation?', choices: ['Positive', 'Negative', 'No correlation', 'Inverse'], answer: 'Positive', explanation: 'Larger x tends with larger y → positive association.', misconception: 'Negative would slope downward overall.' },
    ],
  },
  'PROB.5': {
    label: 'Expected Value',
    icon: '🎯',
    questions: [
      { q: 'A fair die is rolled. What is the expected value?', choices: ['3.5', '3', '4', '6'], answer: '3.5', explanation: 'E = (1+2+3+4+5+6)/6 = 21/6 = 3.5.', misconception: '3 is the median face, not the long-run average.' },
      { q: 'You win $10 on heads, lose $5 on tails. What is the expected value per flip?', choices: ['$2.50', '$5.00', '$7.50', '$0'], answer: '$2.50', explanation: 'E = 0.5(10) + 0.5(−5) = 5 − 2.5 = 2.5.', misconception: '$5 averages the two outcomes without probability weights.' },
      { q: 'If P(win) = 0.3 and the prize is $100, what is the expected winnings?', choices: ['$30', '$100', '$70', '$50'], answer: '$30', explanation: 'E = 0.3 × 100 = 30 (assuming $0 otherwise).', misconception: '$100 ignores that you only win 30% of the time.' },
      { q: 'Which has a higher expected value: a guaranteed $50 or a 60% chance at $100?', choices: ['60% at $100', 'Guaranteed $50', 'They are equal', 'Cannot tell'], answer: '60% at $100', explanation: '0.6 × 100 = 60 > 50.', misconception: 'Risk aversion is real, but expected value is still $60.' },
      { q: 'In 100 coin flips, about how many heads do you expect?', choices: ['50', '100', '25', '75'], answer: '50', explanation: 'Expected count = n × P(H) = 100 × 0.5 = 50.', misconception: '100 would mean every flip is heads.' },
    ],
  },

  /* ── Algebra ── */
  'A.3A': {
    label: 'Slope & Lines',
    icon: '📐',
    questions: [
      { q: 'What is the slope of y = 3x + 1?', choices: ['3', '1', '3x', '−3'], answer: '3', explanation: 'In y = mx + b, m is the slope → 3.', misconception: '1 is the y-intercept b, not the slope.' },
      { q: 'Find the slope between (0, 2) and (4, 10).', choices: ['2', '4', '8', '1'], answer: '2', explanation: 'm = (10−2)/(4−0) = 8/4 = 2.', misconception: '8 is the rise only; slope divides by run.' },
      { q: 'What is the y-intercept of y = 5x − 7?', choices: ['−7', '5', '7', '−5'], answer: '−7', explanation: 'Set x = 0 → y = −7, or read b in y = mx + b.', misconception: '5 is the slope, not where the line crosses the y-axis.' },
      { q: 'A line passes through (1, 3) and (3, 7). What is the slope?', choices: ['2', '4', '3', '1'], answer: '2', explanation: 'm = (7−3)/(3−1) = 4/2 = 2.', misconception: '4 is Δy without dividing by Δx.' },
      { q: 'Which line is steeper: y = 2x or y = 5x?', choices: ['y = 5x', 'y = 2x', 'Same steepness', 'Cannot tell'], answer: 'y = 5x', explanation: 'Larger |m| means a steeper climb for positive slopes.', misconception: 'Same steepness would require equal slopes.' },
    ],
  },
  'A.5A': {
    label: 'Functions',
    icon: '⚡',
    questions: [
      { q: 'If f(x) = 2x + 1, what is f(3)?', choices: ['7', '5', '6', '9'], answer: '7', explanation: 'f(3) = 2(3) + 1 = 7.', misconception: 'Forgetting +1 gives 6.' },
      { q: 'Which is a function: {(1,2),(1,3)} or {(1,2),(2,3)}?', choices: ['{(1,2),(2,3)}', '{(1,2),(1,3)}', 'Both', 'Neither'], answer: '{(1,2),(2,3)}', explanation: 'Each input must have exactly one output; x = 1 cannot map to both 2 and 3.', misconception: 'A relation can still “look small” and fail the function rule.' },
      { q: 'What is the domain of f(x) = x + 5?', choices: ['All real numbers', 'x > 0', 'x ≠ 5', 'Only integers'], answer: 'All real numbers', explanation: 'Linear polynomials are defined for every real x.', misconception: 'x ≠ 5 would matter for 1/(x−5), not x + 5.' },
      { q: 'If f(x) = x^(2) − 1, what is f(4)?', choices: ['15', '16', '17', '7'], answer: '15', explanation: '4² − 1 = 16 − 1 = 15.', misconception: '16 is 4² without subtracting 1.' },
      { q: 'The vertical line test checks if a graph is a ___?', choices: ['Function', 'Linear', 'Quadratic', 'Polynomial'], answer: 'Function', explanation: 'If any vertical line hits the graph more than once, one x has multiple y.', misconception: 'Horizontal lines test one-to-one (injective), not “is a function.”' },
    ],
  },
  'A.7A': {
    label: 'Solve Equations',
    icon: '⚖️',
    questions: [
      { q: 'Solve: 2x + 3 = 11', choices: ['x = 4', 'x = 7', 'x = 3', 'x = 5'], answer: 'x = 4', explanation: '2x = 8 → x = 4.', misconception: 'x = 7 might come from adding 3 instead of subtracting.' },
      { q: 'Solve: 5x − 10 = 0', choices: ['x = 2', 'x = 5', 'x = −2', 'x = 10'], answer: 'x = 2', explanation: '5x = 10 → x = 2.', misconception: 'x = 5 confuses coefficient with solution.' },
      { q: 'Solve: x/3 = 9', choices: ['x = 27', 'x = 3', 'x = 12', 'x = 6'], answer: 'x = 27', explanation: 'Multiply both sides by 3 → x = 27.', misconception: 'Dividing 9 by 3 is the wrong inverse for x/3 = 9.' },
      { q: 'Solve: 3(x + 2) = 21', choices: ['x = 5', 'x = 7', 'x = 3', 'x = 9'], answer: 'x = 5', explanation: 'x + 2 = 7 → x = 5.', misconception: 'Distributing as 3x + 2 omits 3×2.' },
      { q: 'Solve: 4x = 2x + 12', choices: ['x = 6', 'x = 4', 'x = 3', 'x = 12'], answer: 'x = 6', explanation: '2x = 12 → x = 6.', misconception: 'Subtracting 2x from the wrong side can drop the variable term.' },
    ],
  },
  'A.8A': {
    label: 'Exponents & Roots',
    icon: '√',
    questions: [
      { q: 'What is √(144)?', choices: ['12', '14', '11', '13'], answer: '12', explanation: '12² = 144.', misconception: '14² = 196.' },
      { q: 'Simplify: 2^(3) × 2^(2)', choices: ['2^(5) = 32', '2^(6) = 64', '2^(1) = 2', '4^(5)'], answer: '2^(5) = 32', explanation: 'Same base: add exponents → 2^(3+2) = 2^5 = 32.', misconception: 'Multiplying bases 2×2 as 4 and keeping wrong exponent.' },
      { q: 'What is 5^(0)?', choices: ['1', '0', '5', 'Undefined'], answer: '1', explanation: 'Any nonzero base to the 0 power is 1.', misconception: '“Zero exponent removes the base” is not the rule—output is 1.' },
      { q: 'Simplify: √(49 × 4)', choices: ['14', '28', '7', '196'], answer: '14', explanation: '√(49×4) = √49·√4 = 7×2 = 14.', misconception: '28 doubles one factor but not both square roots correctly.' },
      { q: 'What is 3^(−2)?', choices: ['(1)/(9)', '−9', '−6', '9'], answer: '(1)/(9)', explanation: 'a^(−n) = 1/a^n → 1/3² = 1/9.', misconception: 'Negative exponent is not a negative base; −9 is wrong.' },
    ],
  },
  'A.11B': {
    label: 'Quadratics',
    icon: '📈',
    questions: [
      { q: 'What shape does y = x^(2) make?', choices: ['Parabola', 'Line', 'Circle', 'Hyperbola'], answer: 'Parabola', explanation: 'Degree-2 polynomial graphs are U-shaped parabolas.', misconception: 'y = x² is not linear (not y = mx + b).' },
      { q: 'What is the vertex of y = (x − 3)^(2) + 2?', choices: ['(3, 2)', '(−3, 2)', '(3, −2)', '(2, 3)'], answer: '(3, 2)', explanation: 'Vertex form y = a(x − h)² + k has vertex (h, k) → (3, 2).', misconception: 'Sign errors flip h or k to (−3) or (3, −2).' },
      { q: 'Factor: x^(2) − 9', choices: ['(x+3)(x−3)', '(x+9)(x−1)', '(x−3)^(2)', '(x+3)^(2)'], answer: '(x+3)(x−3)', explanation: 'Difference of squares: a² − b² = (a − b)(a + b) with a = x, b = 3.', misconception: '(x−3)² expands to x² − 6x + 9, not x² − 9.' },
      { q: 'Solve: x^(2) = 25', choices: ['x = ±5', 'x = 5', 'x = −5', 'x = 25'], answer: 'x = ±5', explanation: 'Square roots of 25 are 5 and −5.', misconception: 'Only +5 misses the negative solution.' },
      { q: 'In y = ax^(2) + bx + c, what determines if the parabola opens up or down?', choices: ['Sign of a', 'Value of b', 'Value of c', 'Sign of b'], answer: 'Sign of a', explanation: 'a > 0 opens up; a < 0 opens down.', misconception: 'b shifts and tilts the axis of symmetry; it does not flip opening direction alone.' },
    ],
  },
  'A.12B': {
    label: 'GCF & LCM',
    icon: '🔗',
    questions: [
      { q: 'What is the GCF of 12 and 18?', choices: ['6', '3', '9', '12'], answer: '6', explanation: '12 = 2²·3, 18 = 2·3² → shared factors 2·3 = 6.', misconception: '9 divides 18 but not 12.' },
      { q: 'What is the LCM of 4 and 6?', choices: ['12', '24', '6', '2'], answer: '12', explanation: 'Smallest positive multiple of both: 12 = 4×3 = 6×2.', misconception: '6 is a multiple of 6 but not of 4.' },
      { q: 'Factor 24 into primes.', choices: ['2^(3) × 3', '4 × 6', '2 × 12', '8 × 3'], answer: '2^(3) × 3', explanation: '24 = 8×3 = 2³·3 (prime factorization).', misconception: '4×6 is not fully prime factored.' },
      { q: 'GCF(20, 30) = ?', choices: ['10', '20', '5', '30'], answer: '10', explanation: '20 = 2²·5, 30 = 2·3·5 → GCF = 2·5 = 10.', misconception: '20 is not a divisor of 30.' },
      { q: 'LCM(3, 5) = ?', choices: ['15', '8', '1', '30'], answer: '15', explanation: 'Coprime numbers: LCM = product = 15.', misconception: '30 is a common multiple but not the least.' },
    ],
  },
  // TExES Math 7-12 — Mathematical Learning, Instruction & Assessment
  c020: {
    label: 'Instruction',
    icon: '🧠',
    questions: [
      { q: 'In CRA, what does A stand for?', choices: ['Assessment', 'Abstract', 'Algorithm', 'Application'], answer: 'Abstract', explanation: 'CRA = Concrete → Representational → Abstract: move from manipulatives/diagrams to symbols with understanding.', misconception: '“Abstract” is the symbolic stage, not a separate test type here.' },
      { q: 'Which move best supports conceptual understanding first?', choices: ['Memorize formulas only', 'Use multiple representations', 'Timed drill immediately', 'Skip discourse'], answer: 'Use multiple representations', explanation: 'Tables, graphs, contexts, and symbols together reveal structure before speed pressure.', misconception: 'Drill before meaning often cements mistakes, not concepts.' },
      { q: 'A teacher changes groups after checking exit tickets. This is:', choices: ['Summative grading', 'Responsive instruction', 'Norm-referenced scoring', 'Benchmark-only planning'], answer: 'Responsive instruction', explanation: 'Formative evidence (exit tickets) should adjust the next lesson’s tasks or grouping.', misconception: 'Summative grades rarely give timely information for same-day regrouping.' },
      { q: 'Sentence stems in math class primarily support:', choices: ['Classroom volume', 'Academic language production', 'Calculator speed', 'Homework completion'], answer: 'Academic language production', explanation: 'Frames like “I noticed… because…” scaffold precise vocabulary and argumentation for ELs and all learners.', misconception: 'Stems are not mainly for louder discussion—they target language and reasoning.' },
      { q: 'Asking students to compare two methods mainly builds:', choices: ['Procedural fluency only', 'Reasoning and discourse', 'Seat time', 'Memorization'], answer: 'Reasoning and discourse', explanation: 'Comparison surfaces efficiency, correctness, and connections between strategies.', misconception: 'Fluency alone does not require explaining why two paths match.' },
    ],
  },
  c021: {
    label: 'Assessment',
    icon: '📋',
    questions: [
      { q: 'Which assessment is used during learning to adjust instruction?', choices: ['Formative', 'Summative', 'Normed exam', 'Final project only'], answer: 'Formative', explanation: 'Formative assessment gathers evidence while learning is in progress to guide teaching moves.', misconception: 'Summative evaluates mastery after instruction; it is less suited for immediate pivots.' },
      { q: 'A quality rubric criterion for math explanation focuses on:', choices: ['Neat handwriting', 'Reasoning evidence', 'Page length', 'Color usage'], answer: 'Reasoning evidence', explanation: 'Rubric criteria should align to the math practice: logic, representations, and justification—not surface features.', misconception: 'Neatness correlates weakly with mathematical validity.' },
      { q: 'Analyzing wrong answers is most useful for identifying:', choices: ['Student seating', 'Misconceptions', 'Attendance errors', 'Bell schedule'], answer: 'Misconceptions', explanation: 'Error patterns reveal systematic thinking issues (e.g., adding numerators) to target in reteaching.', misconception: 'A single careless slip is different from a class-wide misconception trend.' },
      { q: 'Which phrase best describes high-impact feedback?', choices: ['General praise only', 'Specific and actionable', 'Given once per unit', 'Focused on personality'], answer: 'Specific and actionable', explanation: 'Name what was done well or poorly and give a next step the student can try immediately.', misconception: 'Vague praise does not improve performance on the next attempt.' },
      { q: 'If results are consistent across similar administrations, the assessment has high:', choices: ['Validity', 'Reliability', 'Bias', 'Difficulty drift'], answer: 'Reliability', explanation: 'Reliability = stable, repeatable measurement. Validity = measures the intended construct.', misconception: 'A test can be reliable yet invalid if it measures the wrong thing consistently.' },
    ],
  },
  comp006: {
    label: 'Teaching Moves',
    icon: '🎯',
    questions: [
      { q: 'Standards-aligned planning begins with:', choices: ['Random worksheet', 'Learning goal and success criteria', 'Homework first', 'Quiz score sorting'], answer: 'Learning goal and success criteria', explanation: 'Start from the TEKS/learning target and what evidence will show mastery; tasks follow the goal.', misconception: 'Activities without a clear target make alignment hard to defend.' },
      { q: 'Best immediate response to a common class misconception:', choices: ['Ignore and continue', 'Probe thinking and reteach', 'Assign extra homework only', 'Move to next chapter'], answer: 'Probe thinking and reteach', explanation: 'Surface student reasoning (“why did you add denominators?”), then address the logic gap with a targeted task.', misconception: 'Extra homework without diagnosis often repeats the same error.' },
      { q: 'A valid reason to use multiple entry points is to:', choices: ['Lower expectations', 'Increase access while keeping rigor', 'Avoid discussion', 'Reduce planning'], answer: 'Increase access while keeping rigor', explanation: 'Different paths (context, diagram, table) can all land on the same demanding idea.', misconception: 'Access and rigor are complements when tasks are well designed.' },
      { q: 'After collecting quick-check data, strongest next step is:', choices: ['Keep same plan regardless', 'Adjust instruction for needs', 'Grade and file away', 'Only reteach top students'], answer: 'Adjust instruction for needs', explanation: 'Use the data to form small groups, resequence examples, or clarify a definition before moving on.', misconception: 'Filing grades without instructional response wastes formative information.' },
      { q: 'Questioning that asks “How do you know?” targets:', choices: ['Compliance', 'Mathematical justification', 'Speed only', 'Copying notes'], answer: 'Mathematical justification', explanation: 'Press for warrants: evidence from definitions, diagrams, or computation—not authority.', misconception: '“Because the teacher said so” is not a mathematical justification.' },
    ],
  },
  comp001: {
    label: 'Number Concepts',
    icon: '🔢',
    questions: [
      { q: 'Which set includes both rational and irrational numbers?', choices: ['Integers', 'Natural numbers', 'Real numbers', 'Whole numbers'], answer: 'Real numbers', explanation: 'The real number line includes every rational number (fractions, terminating/repeating decimals) and every irrational number (like √2 or π). Integers, whole numbers, and naturals omit most irrationals.', misconception: 'Integers and whole numbers look “big,” but they still miss most real numbers.' },
      { q: 'What is |−7|?', choices: ['−7', '7', '0', '1/7'], answer: '7', explanation: 'Absolute value measures distance from zero on the number line, so it is never negative: |−7| = 7.', misconception: 'Do not keep the minus sign—absolute value answers “how far,” not “which direction.”' },
      { q: 'Which is irrational?', choices: ['3/4', '0.25', '√(2)', '−5'], answer: '√(2)', explanation: '√(2) cannot be written as a ratio of integers; its decimal never repeats. 3/4, 0.25, and −5 are all rational.', misconception: 'A square root is not automatically irrational—√(4)=2 is rational.' },
      { q: 'LCM is used to find:', choices: ['Least common denominator', 'Largest prime factor', 'Mean', 'Range'], answer: 'Least common denominator', explanation: 'When adding fractions, rewrite with a common denominator; the least common multiple of the denominators gives the smallest shared denominator.', misconception: 'The mean and range describe data sets, not fraction addition.' },
      { q: 'If a number can be written as a/b, b ≠ 0, it is:', choices: ['Irrational', 'Complex only', 'Rational', 'Imaginary'], answer: 'Rational', explanation: '“Rational” means ratio of integers with nonzero denominator. That includes integers (n/1) and terminating/repeating decimals.', misconception: '“Rational” does not mean “makes sense in context”—it is a formal definition.' },
    ],
  },
  comp002: {
    label: 'Algebra',
    icon: '📈',
    questions: [
      { q: 'Constant first differences indicate a(n):', choices: ['Quadratic', 'Linear pattern', 'Exponential decay', 'Random set'], answer: 'Linear pattern', explanation: 'If successive outputs increase by the same amount each step, outputs lie on a line: Δy is constant for equal Δx.', misconception: 'Quadratics have constant second differences; exponentials have roughly constant ratios.' },
      { q: 'Slope represents:', choices: ['Y-intercept only', 'Rate of change', 'Domain limit', 'Axis of symmetry'], answer: 'Rate of change', explanation: 'Slope m = rise/run tells how much y changes per unit change in x—speed of change along the line.', misconception: 'The y-intercept is where x=0, not the steepness.' },
      { q: 'Vertex form y = a(x − h)^(2) + k makes it easiest to read:', choices: ['Roots only', 'Asymptote', 'Vertex', 'Average rate'], answer: 'Vertex', explanation: 'In y = a(x − h)² + k, the turning point is (h, k); sign of a tells up/down opening.', misconception: 'Roots come from setting y=0; the vertex is read directly from h and k.' },
      { q: 'Solving a system graphically means finding:', choices: ['Any x-value', 'The intersection point', 'The y-intercept only', 'The slope sign'], answer: 'The intersection point', explanation: 'Each equation is a graph; simultaneous solutions are coordinates where both graphs meet.', misconception: 'A single line’s y-intercept does not solve the system unless both lines share that point.' },
      { q: 'For exponential growth, the base is typically:', choices: ['0', '1', 'Greater than 1', 'Negative'], answer: 'Greater than 1', explanation: 'For P = P₀·b^x with b>1, repeated multiplication by b increases outputs; b=1 is constant; 0<b<1 is decay.', misconception: 'Base 1 is not “growth”; base 0 collapses to zero after the first step.' },
    ],
  },
  comp003: {
    label: 'Geometry',
    icon: '📐',
    questions: [
      { q: 'Pythagorean theorem applies to:', choices: ['Any triangle', 'Right triangles', 'Only equilateral triangles', 'Only circles'], answer: 'Right triangles', explanation: 'a² + b² = c² relates the legs and hypotenuse only when the angle between a and b is 90°.', misconception: 'Equilateral triangles are special but the Pythagorean theorem is about a right angle.' },
      { q: 'A rigid transformation preserves:', choices: ['Area only', 'Distance and angle measure', 'Slope only', 'Orientation only'], answer: 'Distance and angle measure', explanation: 'Translations, rotations, reflections (and compositions) are rigid: size and shape stay the same; corresponding lengths and angles match.', misconception: 'Dilations are not rigid—they scale lengths.' },
      { q: 'Area units are:', choices: ['Linear units', 'Square units', 'Cubic units', 'Degrees'], answer: 'Square units', explanation: 'Area covers a 2D region, so units are squares (e.g., cm²).', misconception: 'Degrees measure angles, not area.' },
      { q: 'Volume units are:', choices: ['Square units', 'Cubic units', 'Percent', 'Radians'], answer: 'Cubic units', explanation: 'Volume fills 3D space, so units are cubes (e.g., cm³).', misconception: 'Square units are for surfaces, not space inside a solid.' },
      { q: 'Radius is ____ the diameter.', choices: ['Double', 'Half', 'Equal to', 'Unrelated to'], answer: 'Half', explanation: 'Diameter = 2r, so r = d/2.', misconception: 'Do not double the radius when the stem asks for radius.' },
    ],
  },

  /* ── Differential & Integral Calculus (c010) ── */
  'c010-lim': {
    label: 'Limits',
    icon: '🎯',
    questions: [
      { q: 'What is lim_(x→3) (x^(2) − 9)/(x − 3)?', choices: ['6', '0', '3', 'Undefined'], answer: '6', explanation: 'Factor: (x²−9)/(x−3) = (x+3)(x−3)/(x−3) = x+3 for x≠3; plug in 3 → 6.', misconception: 'Do not plug x=3 into the original 0/0 form without simplifying.' },
      { q: 'If lim_(x→a) f(x) = f(a), the function is ___ at a.', choices: ['Continuous', 'Differentiable', 'Increasing', 'Bounded'], answer: 'Continuous', explanation: 'Continuity at a requires the limit to exist, equal f(a), and f(a) defined. Differentiability is stronger.', misconception: 'Continuous does not imply differentiable (e.g., |x| at 0).' },
      { q: 'lim_(x→0) sin(x)/x = ?', choices: ['1', '0', '∞', 'Undefined'], answer: '1', explanation: 'Standard limit from squeeze theorem / geometry; sin(x) behaves like x near 0.', misconception: 'sin(0)/0 is indeterminate—use the limit, not substitution alone.' },
      { q: 'A limit that approaches different values from left and right is called:', choices: ['Does not exist', 'Continuous', 'Finite', 'Removable'], answer: 'Does not exist', explanation: 'For a two-sided limit to exist, left- and right-hand limits must agree.', misconception: '“Removable” is a type of discontinuity where limits agree but f(a) differs or is undefined.' },
      { q: 'lim_(x→∞) (1)/(x) = ?', choices: ['0', '1', '∞', 'Undefined'], answer: '0', explanation: 'As x grows, 1/x shrinks toward 0 (horizontal asymptote y=0).', misconception: '∞ is not a real number output for this limit—the function tends to 0.' },
    ],
  },
  'c010-der': {
    label: 'Derivatives',
    icon: '📈',
    questions: [
      { q: 'The derivative of x^(3) is:', choices: ['3x^(2)', 'x^(2)', '3x^(3)', '(x^(4))/(4)'], answer: '3x^(2)', explanation: 'Power rule: d/dx[x^n] = n·x^(n−1); here n=3 → 3x².', misconception: 'Do not raise the exponent by 1 in the derivative—that is antidifferentiation.' },
      { q: 'f\'(x) = 0 at a point means the tangent line is:', choices: ['Horizontal', 'Vertical', 'Undefined', 'Steep'], answer: 'Horizontal', explanation: 'Derivative = slope; zero slope means a horizontal tangent (potential local max/min or plateau).', misconception: 'Vertical tangents correspond to infinite slope, not f′=0.' },
      { q: 'The derivative of sin(x) is:', choices: ['cos(x)', '−cos(x)', 'sin(x)', '−sin(x)'], answer: 'cos(x)', explanation: 'd/dx sin x = cos x; d/dx cos x = −sin x (memorize the pairing).', misconception: 'The derivative of sin is not sin.' },
      { q: 'The chain rule is used when you have:', choices: ['A composition of functions', 'Two added functions', 'A constant', 'A polynomial only'], answer: 'A composition of functions', explanation: 'For f(g(x)), multiply outer′(inner)·inner′—needed whenever x is “inside” another function.', misconception: 'Sums use the sum rule; compositions use the chain rule.' },
      { q: 'If f\'(x) > 0 on an interval, f is:', choices: ['Increasing', 'Decreasing', 'Constant', 'Undefined'], answer: 'Increasing', explanation: 'Positive derivative ⇒ graph rises as x increases on that interval.', misconception: 'f′>0 does not tell concavity—that is f″.' },
    ],
  },
  'c010-int': {
    label: 'Integrals',
    icon: '∫',
    questions: [
      { q: '∫ x^(2) dx = ?', choices: ['(x^(3))/(3) + C', 'x^(3) + C', '2x + C', '(x^(2))/(2) + C'], answer: '(x^(3))/(3) + C', explanation: 'Antiderivative power rule: add 1 to exponent, divide by new exponent; +C for the family of antiderivatives.', misconception: '∫x² is not x³ alone—divide by 3.' },
      { q: 'A definite integral computes:', choices: ['Net area under the curve', 'The slope', 'A derivative', 'The y-intercept'], answer: 'Net area under the curve', explanation: '∫_a^b f(x)dx accumulates signed area between the graph and the x-axis from a to b.', misconception: 'Slope comes from derivatives, not integrals.' },
      { q: 'The Fundamental Theorem of Calculus links:', choices: ['Derivatives and integrals', 'Limits and slopes', 'Area and perimeter', 'Sine and cosine'], answer: 'Derivatives and integrals', explanation: 'Part I: if F′=f then ∫_a^b f = F(b)−F(a). Part II: d/dx ∫_a^x f = f(x).', misconception: 'It is the bridge between rate of change and accumulation.' },
      { q: '∫cos(x) dx = ?', choices: ['sin(x) + C', '−sin(x) + C', 'cos(x) + C', 'tan(x) + C'], answer: 'sin(x) + C', explanation: 'sin′ = cos, so antiderivative of cos is sin + C.', misconception: '∫cos is not −cos; that is ∫sin.' },
      { q: 'The "C" in an indefinite integral represents:', choices: ['Constant of integration', 'Coefficient', 'Cosine', 'Chain rule result'], answer: 'Constant of integration', explanation: 'Many functions differ by a constant but share the same derivative; +C captures all antiderivatives.', misconception: 'C is not optional on indefinite integrals in general.' },
    ],
  },
  'c010-fun': {
    label: 'Functions',
    icon: '⚡',
    questions: [
      { q: 'The domain of f(x) = 1/x excludes:', choices: ['x = 0', 'x = 1', 'All negatives', 'Nothing'], answer: 'x = 0', explanation: 'Division by zero is undefined; x=0 is excluded from the domain (vertical asymptote).', misconception: 'Negative x are fine for 1/x; only 0 breaks the rule.' },
      { q: 'An even function satisfies:', choices: ['f(−x) = f(x)', 'f(−x) = −f(x)', 'f(0) = 0', 'f(x) > 0'], answer: 'f(−x) = f(x)', explanation: 'Even symmetry: same y when you replace x by −x (graph symmetric across y-axis).', misconception: 'f(−x)=−f(x) defines odd, not even.' },
      { q: 'A vertical asymptote occurs where:', choices: ['The denominator is zero', 'The function is constant', 'The derivative is zero', 'The numerator is zero'], answer: 'The denominator is zero', explanation: 'For rational functions, zeros of the denominator (after simplifying) often produce vertical asymptotes if the numerator is nonzero there.', misconception: 'Numerator zero suggests a hole or x-intercept, not necessarily a vertical asymptote.' },
      { q: 'Which is a transcendental function?', choices: ['e^(x)', 'x^(2) + 1', '3x − 7', 'x^(5)'], answer: 'e^(x)', explanation: 'Transcendental functions are not algebraic (exponential, log, trig); polynomials are algebraic.', misconception: '“Transcendental” does not mean “very hard polynomial.”' },
      { q: 'If f(g(x)) = x and g(f(x)) = x, then f and g are:', choices: ['Inverses', 'Equal', 'Perpendicular', 'Parallel'], answer: 'Inverses', explanation: 'Composing in either order yields the identity ⇒ f and g undo each other (inverses).', misconception: 'Inverse functions are not generally equal to each other.' },
    ],
  },
  'c010-app': {
    label: 'Applications',
    icon: '🚀',
    questions: [
      { q: 'To find maximum profit, set the ___ equal to zero.', choices: ['First derivative', 'Second derivative', 'Integral', 'Limit'], answer: 'First derivative', explanation: 'Extrema of smooth functions on an interval often occur where P′=0 (critical points) or at endpoints; first derivative test classifies.', misconception: 'Setting P=0 finds break-even, not max profit.' },
      { q: 'Related rates problems use which rule?', choices: ['Chain rule', 'Power rule only', 'L\'Hôpital\'s rule', 'Sum rule'], answer: 'Chain rule', explanation: 'Quantities depend on time t through compositions (e.g., V(r(t))); differentiate with respect to t using the chain rule.', misconception: 'L’Hôpital applies to indeterminate limits, not typical related-rates setup.' },
      { q: 'The second derivative tells you about:', choices: ['Concavity', 'Slope', 'Area', 'Domain'], answer: 'Concavity', explanation: 'f″>0 ⇒ concave up (holds water); f″<0 ⇒ concave down. f′ gives slope.', misconception: 'Do not confuse slope (f′) with bend (f″).' },
      { q: 'To find area between two curves, you ___ their functions.', choices: ['Subtract and integrate', 'Add and differentiate', 'Multiply', 'Divide'], answer: 'Subtract and integrate', explanation: 'On [a,b], area ≈ ∫ (top − bottom) dx when one graph is above the other.', misconception: 'Differentiation finds rate/slope, not enclosed area.' },
      { q: 'If f\'\'(c) > 0 at a critical point c, the point is a:', choices: ['Local minimum', 'Local maximum', 'Saddle point', 'Inflection point'], answer: 'Local minimum', explanation: 'Second derivative test: f′(c)=0 and f″(c)>0 ⇒ concave up ⇒ local min at c.', misconception: 'f″>0 at a critical point is not a maximum—that requires f″<0.' },
    ],
  },
  comp004: {
    label: 'Probability & Stats',
    icon: '🎲',
    questions: [
      { q: 'Mean is computed by:', choices: ['Middle value', 'Most frequent value', 'Sum ÷ count', 'Max − min'], answer: 'Sum ÷ count', explanation: 'Mean (average) = (sum of data values) ÷ (how many values).', misconception: 'Middle value is the median; most frequent is the mode.' },
      { q: 'Median is the:', choices: ['Average', 'Middle value', 'Largest value', 'Smallest value'], answer: 'Middle value', explanation: 'Sort data; median is the middle (or average of two middles). Resistant to outliers unlike the mean.', misconception: 'The mean is pulled by extreme values; median is not “the average” in everyday speech.' },
      { q: 'For independent events, P(A and B)=', choices: ['P(A)+P(B)', 'P(A)×P(B)', 'P(A)−P(B)', '1−P(A)'], answer: 'P(A)×P(B)', explanation: 'Independence means one outcome does not change the other’s probability: multiply for “and.”', misconception: 'Add probabilities only for mutually exclusive “or” events (with care).' },
      { q: 'Total probability of a complete sample space is:', choices: ['0', '0.5', '1', 'Depends on units'], answer: '1', explanation: 'All disjoint outcomes cover 100% of possibilities, so probabilities sum to 1.', misconception: 'Probabilities are unitless; they do not depend on inches vs centimeters.' },
      { q: 'Scatter plots are used to study:', choices: ['Exact proofs', 'Correlation', 'Prime factorization', 'Polygon congruence'], answer: 'Correlation', explanation: 'Pairs (x,y) show association: direction, strength, and unusual points.', misconception: 'Correlation from a plot is exploratory; causation needs design, not just pattern.' },
    ],
  },
  comp005: {
    label: 'Processes',
    icon: '🧩',
    questions: [
      { q: 'A counterexample is used to:', choices: ['Prove every claim', 'Disprove a universal claim', 'Estimate answers', 'Find slope'], answer: 'Disprove a universal claim', explanation: 'One valid counterexample shows “for all” statements are false; proving “for all” needs general reasoning.', misconception: 'Examples can suggest truth but do not prove a universal claim.' },
      { q: 'Deductive reasoning moves from:', choices: ['Specific to general', 'General to specific', 'Graph to table only', 'Data to opinion'], answer: 'General to specific', explanation: 'Start from definitions, axioms, or known theorems and derive conclusions for particular cases.', misconception: 'Inductive pattern-spotting is not the same as deductive proof.' },
      { q: 'A strong mathematical argument includes:', choices: ['A guess only', 'Logical justification', 'No assumptions', 'Only final answer'], answer: 'Logical justification', explanation: 'Claims should follow from definitions and prior results with clear steps others can audit.', misconception: 'A correct-looking answer without reasoning is not a complete argument.' },
      { q: 'Modeling in math means:', choices: ['Memorizing formulas', 'Representing real situations mathematically', 'Drawing only', 'Eliminating variables only'], answer: 'Representing real situations mathematically', explanation: 'Choose variables, constraints, and relationships that reflect the context; interpret solutions back in words.', misconception: 'A picture alone is not a model unless it encodes quantitative structure.' },
      { q: 'Checking reasonableness helps with:', choices: ['Formatting', 'Solution verification', 'Color choices', 'Class attendance'], answer: 'Solution verification', explanation: 'Estimate, use units, boundary cases, or inverse operations to catch sign/scale errors.', misconception: 'Reasonableness checks complement—not replace—algebraic correctness.' },
    ],
  },
  calc_limits: {
    label: 'Limits & LHospital',
    icon: '∞',
    questions: [
      { q: 'Evaluate lim_(x->3) (x^(2)-9)/(x-3).', choices: ['6', '3', '9', '0'], answer: '6', explanation: 'Factor: (x−3)(x+3)/(x−3) = x+3 for x≠3; plug 3 → 6.', misconception: 'Substituting into 0/0 without simplifying gives a false “undefined” conclusion for the limit.' },
      { q: 'LHospital applies directly to which forms?', choices: ['0/0 and infinity/infinity', '0*infinity only', '1^infinity only', 'Any quotient'], answer: '0/0 and infinity/infinity', explanation: 'L’Hôpital’s rule applies to indeterminate quotients 0/0 or ∞/∞ (after verifying hypotheses).', misconception: 'Other indeterminate types often need algebra or log first.' },
      { q: 'What is lim_(x->0) sin(x)/x?', choices: ['1', '0', 'Does not exist', 'infinity'], answer: '1', explanation: 'Standard limit; sin x ~ x near 0.', misconception: '0/0 is indeterminate—do not conclude 0 without a theorem.' },
      { q: 'If left and right limits are different, the limit:', choices: ['Does not exist', 'Is zero', 'Is continuous', 'Equals f(a)'], answer: 'Does not exist', explanation: 'Two-sided limit requires matching one-sided limits.', misconception: 'Continuity would need the limit to exist and equal f(a).' },
      { q: 'What is lim_(x->infinity) ln(x)/x?', choices: ['0', '1', 'infinity', 'Undefined'], answer: '0', explanation: 'x grows faster than ln x (∞/∞ with L’Hôpital: (1/x)/1 → 0).', misconception: 'Both top and bottom go to ∞, but the ratio still tends to 0.' },
    ],
  },
  calc_derivatives: {
    label: 'Differentiation',
    icon: 'f\'',
    questions: [
      { q: 'd/dx[x^(4)] equals:', choices: ['4x^(3)', 'x^(3)', '4x^(4)', 'x^(5)/5'], answer: '4x^(3)', explanation: 'Power rule: 4x^(4−1) = 4x³.', misconception: 'x^5/5 is an antiderivative of x⁴, not the derivative.' },
      { q: 'd/dx[sin(x)] equals:', choices: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'], answer: 'cos(x)', explanation: 'Memorized derivative pair: (sin x)′ = cos x.', misconception: '−cos x is the derivative of −sin x, not sin x.' },
      { q: 'd/dx[ln(x)] equals:', choices: ['1/x', 'ln(x)', 'x', 'e^(x)'], answer: '1/x', explanation: 'For x > 0, d/dx ln x = 1/x.', misconception: 'ln x is not its own derivative (that is e^x).' },
      { q: 'The chain rule is for:', choices: ['Compositions', 'Products only', 'Constants', 'Linear terms only'], answer: 'Compositions', explanation: 'Use when an “inner” function is inside an outer: d/dx f(g(x)) = f′(g(x))g′(x).', misconception: 'Products use the product rule, not the chain rule alone.' },
      { q: 'd/dx[e^(x)] equals:', choices: ['e^(x)', 'x*e^(x)', '1', 'ln(x)'], answer: 'e^(x)', explanation: 'The exponential function is its own derivative.', misconception: 'x e^x would need the product rule on x·e^x.' },
    ],
  },
  calc_derivative_apps: {
    label: 'Derivative Applications',
    icon: '📉',
    questions: [
      { q: 'A critical point occurs where f\' is zero or:', choices: ['Undefined', 'Positive', 'Negative', 'Continuous'], answer: 'Undefined', explanation: 'Critical numbers: where f′ = 0 or f′ DNE (within the domain).', misconception: 'f′ > 0 means increasing, not “critical.”' },
      { q: 'If f\' changes from positive to negative, you have a local:', choices: ['Maximum', 'Minimum', 'Inflection point', 'Asymptote'], answer: 'Maximum', explanation: 'Rising then falling ⇒ peak (first derivative test).', misconception: 'Inflection is about f″ changing sign, not f′ alone.' },
      { q: 'If f\'\'(x) > 0, the graph is:', choices: ['Concave up', 'Concave down', 'Decreasing', 'Flat'], answer: 'Concave up', explanation: 'Positive second derivative ⇒ bends upward (holds water).', misconception: 'Decreasing/increasing is f′, not f″.' },
      { q: 'Optimization problems usually require finding:', choices: ['Extrema', 'Intercepts only', 'Domain only', 'Range only'], answer: 'Extrema', explanation: 'Max/min on an interval: check critical points and endpoints.', misconception: 'Intercepts alone do not locate optima.' },
      { q: 'A tangent line slope at x=a is:', choices: ['f\'(a)', 'f(a)', 'f\'\'(a)', 'integral of f'], answer: 'f\'(a)', explanation: 'Derivative value = instantaneous rate = tangent slope.', misconception: 'f(a) is height on the graph, not slope.' },
    ],
  },
  calc_integrals: {
    label: 'Integration',
    icon: '∫',
    questions: [
      { q: 'Integral of x^(2) is:', choices: ['x^(3)/3 + C', 'x^(3) + C', '2x + C', 'x^(2)/2 + C'], answer: 'x^(3)/3 + C', explanation: 'Power rule for antiderivatives: add 1 to exponent, divide.', misconception: 'x³ alone misses the ÷3; 2x is the derivative of x².' },
      { q: 'A definite integral gives:', choices: ['Net area', 'Instantaneous slope', 'Domain', 'Intercept'], answer: 'Net area', explanation: '∫_a^b f(x)dx accumulates signed area under y = f(x).', misconception: 'Slope comes from f′, not ∫f.' },
      { q: 'The Fundamental Theorem links integrals and:', choices: ['Derivatives', 'Polygons', 'Matrices', 'Probability'], answer: 'Derivatives', explanation: 'FTC connects differentiation and integration as inverse processes.', misconception: 'It is not about geometric shapes in the sense of polygons.' },
      { q: 'Use u-substitution when integrand has:', choices: ['Inner function with derivative', 'Only constants', 'No composition', 'Absolute values only'], answer: 'Inner function with derivative', explanation: 'Look for g′(x)dx paired with f(g(x))—the chain rule “backward.”', misconception: 'Constants alone do not signal substitution.' },
      { q: 'Integral of 1 from 0 to 4 equals:', choices: ['4', '1', '0', '8'], answer: '4', explanation: '∫_0^4 1 dx = 4 − 0 = 4 (rectangle height 1, width 4).', misconception: '1 is the integrand value, not the accumulated area.' },
    ],
  },
  calc_series: {
    label: 'Series',
    icon: 'Σ',
    questions: [
      { q: 'A geometric series converges when |r| is:', choices: ['< 1', '> 1', '= 2', 'a prime'], answer: '< 1', explanation: 'Σ ar^n converges (for |r|<1) to a/(1−r) when a is fixed.', misconception: '|r| ≥ 1 makes terms not decay to 0 fast enough (|r|>1) or fail ratio test in the usual sense.' },
      { q: 'The harmonic series sum 1/n is:', choices: ['Divergent', 'Convergent', 'Alternating only', 'Finite'], answer: 'Divergent', explanation: 'Partial sums grow without bound (integral/p-series intuition).', misconception: 'Terms → 0 is necessary but not sufficient for convergence.' },
      { q: 'Maclaurin series is centered at:', choices: ['0', '1', 'pi', 'infinity'], answer: '0', explanation: 'Maclaurin = Taylor series about 0.', misconception: 'Taylor about other points is not called Maclaurin.' },
      { q: 'If terms do not approach 0, the series:', choices: ['Diverges', 'Converges', 'Oscillates to one value', 'Is geometric'], answer: 'Diverges', explanation: 'nth-term test: if lim a_n ≠ 0, Σa_n diverges.', misconception: 'Terms → 0 does not guarantee convergence (harmonic example).' },
      { q: 'Ratio test limit L<1 implies:', choices: ['Convergent', 'Divergent', 'Inconclusive always', 'Undefined'], answer: 'Convergent', explanation: 'For positive-term series, L < 1 ⇒ absolute convergence in many standard cases.', misconception: 'L = 1 means the ratio test is inconclusive.' },
    ],
  },
  calc_advanced: {
    label: 'Advanced Calculus',
    icon: '🧠',
    questions: [
      { q: 'A differential equation relates a function and its:', choices: ['Derivatives', 'Integrals only', 'Limits only', 'Matrices'], answer: 'Derivatives', explanation: 'ODEs/PDEs involve unknown y and one or more derivatives of y.', misconception: '“Integral equation” is a different formal type.' },
      { q: 'In parametric form, dy/dx equals:', choices: ['(dy/dt)/(dx/dt)', '(dx/dt)/(dy/dt)', 'dy*dx', 'dt/dx'], answer: '(dy/dt)/(dx/dt)', explanation: 'Chain rule: dy/dx = (dy/dt)/(dx/dt) when dx/dt ≠ 0.', misconception: 'Inverting the fraction flips the slope incorrectly.' },
      { q: 'Average value of f on [a,b] includes factor:', choices: ['1/(b-a)', 'b-a', '1/(a+b)', 'ab'], answer: '1/(b-a)', explanation: 'f_avg = (1/(b−a)) ∫_a^b f(x)dx.', misconception: 'Multiplying by (b−a) would be the integral itself, not the average.' },
      { q: 'Polar coordinates are written as:', choices: ['(r, theta)', '(x, y)', '(rho, z)', '(m, b)'], answer: '(r, theta)', explanation: 'Plane polar: distance r from origin, angle θ from a ray.', misconception: '(ρ, z) is cylindrical 3D, not standard plane polar.' },
      { q: 'An initial value problem needs an equation and:', choices: ['Initial condition', 'Second graph', 'Table only', 'No boundary data'], answer: 'Initial condition', explanation: 'Pick the unique solution matching y(t₀) (or similar) from the family of solutions.', misconception: 'Without a condition, many solutions can remain valid.' },
    ],
  },
};

// Ensure strict loop launches can resolve every Math 7-12 standard key directly.
const MATH712_STD_TO_CATEGORY_KEY = {
  c001: 'comp001', c002: 'comp001', c003: 'comp001',
  c004: 'comp002', c005: 'comp002', c006: 'comp002', c007: 'comp002', c008: 'comp002',
  c009: 'comp003', c010: 'c010-lim', c011: 'comp003', c012: 'comp003', c013: 'comp003', c014: 'comp004',
  c015: 'comp004', c016: 'comp004', c017: 'comp004',
  c018: 'comp005', c019: 'comp005',
  c020: 'c020', c021: 'c021',
};

Object.entries(MATH712_STD_TO_CATEGORY_KEY).forEach(([stdId, categoryKey]) => {
  if (!CATEGORY_BANKS[stdId] && CATEGORY_BANKS[categoryKey]) {
    CATEGORY_BANKS[stdId] = {
      ...CATEGORY_BANKS[categoryKey],
      label: `${CATEGORY_BANKS[categoryKey].label} (${String(stdId).toUpperCase()})`,
      questions: [...CATEGORY_BANKS[categoryKey].questions],
    };
  }
});

const ALL_CATEGORIES = Object.keys(CATEGORY_BANKS);

const STD_TO_COMP = {
  c001: 'comp001', c002: 'comp001', c003: 'comp001',
  c004: 'comp002', c005: 'comp002', c006: 'comp002', c007: 'comp002', c008: 'comp002',
  c009: 'comp003', c010: 'comp003', c011: 'comp003', c012: 'comp003', c013: 'comp003',
  c014: 'comp004', c015: 'comp004', c016: 'comp004', c017: 'comp004',
  c018: 'comp005', c019: 'comp005',
  c020: 'comp006', c021: 'comp006',
  calc_c001: 'calc_limits', calc_c002: 'calc_limits',
  calc_c003: 'calc_derivatives', calc_c004: 'calc_derivatives',
  calc_c005: 'calc_derivative_apps', calc_c006: 'calc_derivative_apps', calc_c007: 'calc_derivative_apps',
  calc_c008: 'calc_integrals', calc_c009: 'calc_integrals', calc_c010: 'calc_integrals',
  calc_c011: 'calc_series',
  calc_c012: 'calc_advanced',
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
    // In strict loop mode, prioritize the exact standard first.
    if (currentStd) {
      const exactStdKeys = expandStdCats([currentStd]).filter((k) => CATEGORY_BANKS[k]);
      if (exactStdKeys.length > 0) {
        return exactStdKeys.sort(() => Math.random() - 0.5).slice(0, Math.min(5, exactStdKeys.length));
      }
    }
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
  const [dailyDouble, setDailyDouble] = useState(() => {
    const col = Math.floor(Math.random() * categories.length);
    const row = Math.floor(Math.random() * 5);
    return `${col}-${row}`;
  }); // "col-row" key
  const [showDailyDouble, setShowDailyDouble] = useState(false);
  const [wager, setWager] = useState(0);

  const { returnUrl, goBack, isEmbedded } = useGameReturn();

  const totalCells = categories.length * 5;
  const maxScore = categories.length * POINT_VALUES.reduce((a, b) => a + b, 0);

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

    const bankExpl = typeof activeCell.q.explanation === 'string' && activeCell.q.explanation.trim()
      ? activeCell.q.explanation.trim()
      : null;
    const bankMisc = typeof activeCell.q.misconception === 'string' && activeCell.q.misconception.trim()
      ? activeCell.q.misconception.trim()
      : null;
    setAnsweredQuestions(prev => [...prev, {
      question: activeCell.q.q,
      correctAnswer: activeCell.q.answer,
      studentAnswer: choice,
      correct: isCorrect,
      teks: activeCell.teks,
      points: isCorrect ? points : 0,
      explanation: bankExpl || explainJeopardyMc(activeCell.q, choice, isCorrect),
      misconception: !isCorrect
        ? (bankMisc || 'Cross out choices that only sound reasonable — the stem usually rewards the most precise or directly supported option.')
        : '',
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

  // Show full review automatically at game end.
  useEffect(() => {
    if (!gameOver || showReview || answeredQuestions.length === 0) return;
    const timer = setTimeout(() => setShowReview(true), 120);
    return () => clearTimeout(timer);
  }, [gameOver, showReview, answeredQuestions.length]);

  if (strictScope && categories.length === 0) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#7f1d1d' }}>
          No competency-aligned Jeopardy categories are available for this loop step yet.
        </div>
        <div style={{ marginTop: 12 }}>
          {returnUrl && (!isEmbedded ? <LoopContinueButton onClick={goBack} /> : (
            <button type="button" onClick={goBack} style={{ ...btnStyle('#059669'), width: '100%' }}>Continue to practice loop</button>
          ))}
          {!returnUrl && !isEmbedded ? <Link to="/games">Back to Games</Link> : null}
        </div>
      </div>
    );
  }

  if (showReview) {
    const questionScore = answeredQuestions.filter((q) => q.correct).length;
    const questionTotal = answeredQuestions.length;
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <GameReview
          questions={answeredQuestions}
          score={questionScore}
          total={questionTotal}
          gameName="Math Jeopardy"
          onClose={() => setShowReview(false)}
          continueUrl={returnUrl || undefined}
          continueLabel={isEmbedded ? 'Continue to practice loop' : 'Continue'}
          onContinue={returnUrl ? goBack : undefined}
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
        {returnUrl && (!isEmbedded || gameOver) ? (
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

      {returnUrl && !isEmbedded && <LoopContinueButton onClick={goBack} />}
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
