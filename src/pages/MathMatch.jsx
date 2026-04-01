import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TEKS_GRADES, TEKS_STANDARDS } from '../data/teks';
import { saveGameResult, findMatchingAssignment } from '../utils/storage';
import { formatMathHtml } from '../utils/mathFormat';
import { sanitizeHtml } from '../utils/sanitize';
import GameReview from '../components/GameReview';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import qbotImg from '../assets/qbot.svg';

/* ══════════════════════════════════════════════════════════════════════════
   QUESTION POOLS – TEKS-aligned for Grade 3 and Algebra I
   Each entry: { expression, answer, teks }
   ══════════════════════════════════════════════════════════════════════════ */

const QUESTION_POOLS = {
  grade3: {
    '3.4A': [
      { expression: '345 + 278', answer: '623', teks: '3.4A' },
      { expression: '900 − 456', answer: '444', teks: '3.4A' },
      { expression: '150 + 375', answer: '525', teks: '3.4A' },
      { expression: '802 − 319', answer: '483', teks: '3.4A' },
      { expression: '467 + 233', answer: '700', teks: '3.4A' },
      { expression: '561 − 289', answer: '272', teks: '3.4A' },
      { expression: '124 + 376', answer: '500', teks: '3.4A' },
      { expression: '750 − 483', answer: '267', teks: '3.4A' },
      { expression: '218 + 497', answer: '715', teks: '3.4A' },
      { expression: '600 − 234', answer: '366', teks: '3.4A' },
    ],
    '3.4C': [
      { expression: '4 × 3', answer: '12', teks: '3.4C' },
      { expression: '5 × 6', answer: '30', teks: '3.4C' },
      { expression: '7 × 8', answer: '56', teks: '3.4C' },
      { expression: '9 × 4', answer: '36', teks: '3.4C' },
      { expression: '8 × 8', answer: '64', teks: '3.4C' },
      { expression: '3 × 8', answer: '24', teks: '3.4C' },
      { expression: '7 × 5', answer: '35', teks: '3.4C' },
      { expression: '2 × 9', answer: '18', teks: '3.4C' },
      { expression: '8 × 4', answer: '32', teks: '3.4C' },
      { expression: '6 × 7', answer: '42', teks: '3.4C' },
      { expression: '3 × 5', answer: '15', teks: '3.4C' },
      { expression: '9 × 9', answer: '81', teks: '3.4C' },
    ],
    '3.5A': [
      { expression: '250 + 130', answer: '380', teks: '3.5A' },
      { expression: '475 − 200', answer: '275', teks: '3.5A' },
      { expression: '310 + 290', answer: '600', teks: '3.5A' },
      { expression: '500 − 125', answer: '375', teks: '3.5A' },
      { expression: '999 − 500', answer: '499', teks: '3.5A' },
      { expression: '350 + 150', answer: '500', teks: '3.5A' },
      { expression: '430 + 220', answer: '650', teks: '3.5A' },
      { expression: '800 − 450', answer: '350', teks: '3.5A' },
    ],
  },
  algebra: {
    // A.2A – Domain & Range of linear functions
    'A.2A': [
      { expression: 'Domain of y = 2x + 1', answer: '(−∞, ∞)', teks: 'A.2A' },
      { expression: 'Range of y = 5', answer: '{5}', teks: 'A.2A' },
      { expression: 'Domain of x = 3', answer: '{3}', teks: 'A.2A' },
      { expression: 'y-intercept of y = 2x + 1', answer: '1', teks: 'A.2A' },
      { expression: 'y-intercept of y = −3x + 9', answer: '9', teks: 'A.2A' },
      { expression: 'x-intercept of y = 2x − 6', answer: '(3, 0)', teks: 'A.2A' },
    ],
    // A.2B – Write linear equations in various forms
    'A.2B': [
      { expression: 'Slope 3, y-int 2 → y = ?', answer: 'y = 3x + 2', teks: 'A.2B' },
      { expression: 'Slope −1, y-int 5 → y = ?', answer: 'y = −x + 5', teks: 'A.2B' },
      { expression: 'Slope ½, y-int −4 → y = ?', answer: 'y = ½x − 4', teks: 'A.2B' },
      { expression: 'm=2, point (1,5) → y−5=?', answer: '2(x−1)', teks: 'A.2B' },
      { expression: 'Slope 0, y-int 7 → y = ?', answer: 'y = 7', teks: 'A.2B' },
      { expression: 'y = 2x + 3 → standard form', answer: '2x − y = −3', teks: 'A.2B' },
    ],
    // A.3A – Slope
    'A.3A': [
      { expression: 'Slope: (1,2) & (3,8)', answer: '3', teks: 'A.3A' },
      { expression: 'Slope: (0,5) & (2,1)', answer: '−2', teks: 'A.3A' },
      { expression: 'Slope: (−1,4) & (3,4)', answer: '0', teks: 'A.3A' },
      { expression: 'Slope: (2,1) & (2,7)', answer: 'Undefined', teks: 'A.3A' },
      { expression: 'Slope of y = 4x − 9', answer: '4', teks: 'A.3A' },
      { expression: 'Slope of y = −½x + 3', answer: '−½', teks: 'A.3A' },
      { expression: 'Slope: (0,0) & (5,10)', answer: '2', teks: 'A.3A' },
      { expression: 'Slope of 3x + y = 6', answer: '−3', teks: 'A.3A' },
      { expression: 'Slope: (1,3) & (3,13)', answer: '5', teks: 'A.3A' },
      { expression: 'Slope of y = ⅓x + 2', answer: '⅓', teks: 'A.3A' },
    ],
    // A.3B – Rate of change
    'A.3B': [
      { expression: 'Rate: $50→$80 in 3 hrs', answer: '$10/hr', teks: 'A.3B' },
      { expression: 'Rate: 0→120 mi in 2 hrs', answer: '60 mph', teks: 'A.3B' },
      { expression: 'Rate: 200→50 gal in 5 hr', answer: '−30 gal/hr', teks: 'A.3B' },
      { expression: 'Rate: temp 70→85 in 3 hr', answer: '5 °F/hr', teks: 'A.3B' },
      { expression: 'Rate: 400→100 in 6 sec', answer: '−50/sec', teks: 'A.3B' },
      { expression: 'Rate: balance $0→$600, 12 mo', answer: '$50/mo', teks: 'A.3B' },
    ],
    // A.5A – Solve linear equations in one variable
    'A.5A': [
      { expression: '2x + 6 = 14, x = ?', answer: '4', teks: 'A.5A' },
      { expression: '3(x − 2) = 15, x = ?', answer: '7', teks: 'A.5A' },
      { expression: '6x − 12 = 18, x = ?', answer: '5', teks: 'A.5A' },
      { expression: '−2x + 10 = 4, x = ?', answer: '3', teks: 'A.5A' },
      { expression: '3x + 9 = 0, x = ?', answer: '−3', teks: 'A.5A' },
      { expression: 'x/4 = 5, x = ?', answer: '20', teks: 'A.5A' },
      { expression: '5x + 3 = 48, x = ?', answer: '9', teks: 'A.5A' },
      { expression: '2x − 3 = 13, x = ?', answer: '8', teks: 'A.5A' },
      { expression: '8x = 96, x = ?', answer: '12', teks: 'A.5A' },
      { expression: '3x − 7 = 38, x = ?', answer: '15', teks: 'A.5A' },
    ],
    // A.5B – Solve linear inequalities
    'A.5B': [
      { expression: '3x > 12 → x ?', answer: 'x > 4', teks: 'A.5B' },
      { expression: '2x + 1 ≤ 9 → x ?', answer: 'x ≤ 4', teks: 'A.5B' },
      { expression: '−x < 5 → x ?', answer: 'x > −5', teks: 'A.5B' },
      { expression: '4x − 8 ≥ 0 → x ?', answer: 'x ≥ 2', teks: 'A.5B' },
      { expression: 'x/2 + 3 > 7 → x ?', answer: 'x > 8', teks: 'A.5B' },
      { expression: '−2x ≥ 10 → x ?', answer: 'x ≤ −5', teks: 'A.5B' },
    ],
    // A.5C – Systems of equations
    'A.5C': [
      { expression: 'y=x+1, y=2x−1 → x?', answer: '2', teks: 'A.5C' },
      { expression: 'x+y=10, x−y=4 → x?', answer: '7', teks: 'A.5C' },
      { expression: '2x+y=11, x=3 → y?', answer: '5', teks: 'A.5C' },
      { expression: 'x+y=5, 2x+y=8 → x?', answer: '3', teks: 'A.5C' },
      { expression: 'y=x−2, y=−x+6 → x?', answer: '4', teks: 'A.5C' },
      { expression: 'x+y=9, 2x+y=15 → x?', answer: '6', teks: 'A.5C' },
    ],
    // A.6A – Domain & Range of quadratics
    'A.6A': [
      { expression: 'Range of f(x) = x²', answer: 'y ≥ 0', teks: 'A.6A' },
      { expression: 'Range of f(x) = −x²', answer: 'y ≤ 0', teks: 'A.6A' },
      { expression: 'Range of f(x) = x²+3', answer: 'y ≥ 3', teks: 'A.6A' },
      { expression: 'Range of f(x) = −(x−1)²+5', answer: 'y ≤ 5', teks: 'A.6A' },
      { expression: 'Min value of f(x) = x²−6x+10', answer: '1', teks: 'A.6A' },
      { expression: 'Max value of f(x) = −x²+4x', answer: '4', teks: 'A.6A' },
    ],
    // A.7A – Graph quadratics / key attributes
    'A.7A': [
      { expression: 'Vertex of y = (x−3)²+1', answer: '(3, 1)', teks: 'A.7A' },
      { expression: 'Vertex of y = x²−4', answer: '(0, −4)', teks: 'A.7A' },
      { expression: 'Axis of sym: y=(x+2)²', answer: 'x = −2', teks: 'A.7A' },
      { expression: 'y-int of y = x²+3x−10', answer: '−10', teks: 'A.7A' },
      { expression: 'Vertex of y = −(x+1)²+9', answer: '(−1, 9)', teks: 'A.7A' },
      { expression: 'Opens up or down: y=−x²', answer: 'Down', teks: 'A.7A' },
    ],
    // A.8A – Solve quadratics
    'A.8A': [
      { expression: 'x²−9 = 0, x = ?', answer: '±3', teks: 'A.8A' },
      { expression: 'x²+5x+6=0, x = ?', answer: '−2, −3', teks: 'A.8A' },
      { expression: 'x²−4x=0, x = ?', answer: '0, 4', teks: 'A.8A' },
      { expression: 'x²=25, x = ?', answer: '±5', teks: 'A.8A' },
      { expression: 'x²−x−6=0, x = ?', answer: '3, −2', teks: 'A.8A' },
      { expression: '2x²−8=0, x = ?', answer: '±2', teks: 'A.8A' },
      { expression: 'x²+6x+9=0, x = ?', answer: '−3', teks: 'A.8A' },
      { expression: 'x²−16=0, x = ?', answer: '±4', teks: 'A.8A' },
    ],
    // A.9A – Exponential domain & range
    'A.9A': [
      { expression: 'Range of f(x) = 2^x', answer: 'y > 0', teks: 'A.9A' },
      { expression: 'Asymptote of y = 5^x', answer: 'y = 0', teks: 'A.9A' },
      { expression: 'Range of f(x)=2^x+1', answer: 'y > 1', teks: 'A.9A' },
      { expression: 'f(x)=2^x, f(3)=?', answer: '8', teks: 'A.9A' },
      { expression: 'f(x)=3^x, f(2)=?', answer: '9', teks: 'A.9A' },
      { expression: 'f(x)=(½)^x, f(−2)=?', answer: '4', teks: 'A.9A' },
    ],
    // A.10A – Add/subtract polynomials
    'A.10A': [
      { expression: '(3x+2)+(x−5)', answer: '4x − 3', teks: 'A.10A' },
      { expression: '(x²+3x)−(2x−1)', answer: 'x²+x+1', teks: 'A.10A' },
      { expression: '(5x−4)+(−3x+7)', answer: '2x + 3', teks: 'A.10A' },
      { expression: '(2x²+x)+(x²−3x)', answer: '3x²−2x', teks: 'A.10A' },
      { expression: '(4x+9)−(4x+2)', answer: '7', teks: 'A.10A' },
      { expression: '(x²−5)+(−x²+5)', answer: '0', teks: 'A.10A' },
    ],
    // A.10E – Factor trinomials
    'A.10E': [
      { expression: 'Factor x²+5x+6', answer: '(x+2)(x+3)', teks: 'A.10E' },
      { expression: 'Factor x²−7x+12', answer: '(x−3)(x−4)', teks: 'A.10E' },
      { expression: 'Factor x²+x−12', answer: '(x+4)(x−3)', teks: 'A.10E' },
      { expression: 'Factor x²−9', answer: '(x+3)(x−3)', teks: 'A.10E' },
      { expression: 'Factor x²−4x+4', answer: '(x−2)²', teks: 'A.10E' },
      { expression: 'Factor x²+8x+16', answer: '(x+4)²', teks: 'A.10E' },
    ],
    // A.11B – Laws of exponents
    'A.11B': [
      { expression: 'x³ · x⁴ = ?', answer: 'x⁷', teks: 'A.11B' },
      { expression: 'x⁸ ÷ x³ = ?', answer: 'x⁵', teks: 'A.11B' },
      { expression: '(x²)³ = ?', answer: 'x⁶', teks: 'A.11B' },
      { expression: 'x⁰ = ?', answer: '1', teks: 'A.11B' },
      { expression: 'x⁻² = ?', answer: '1/x²', teks: 'A.11B' },
      { expression: '(2x)³ = ?', answer: '8x³', teks: 'A.11B' },
      { expression: '(x³y²)² = ?', answer: 'x⁶y⁴', teks: 'A.11B' },
      { expression: '5⁻¹ = ?', answer: '1/5', teks: 'A.11B' },
    ],
    // A.12B – Evaluate functions
    'A.12B': [
      { expression: 'f(x)=3x+1, f(4)=?', answer: '13', teks: 'A.12B' },
      { expression: 'f(x)=x²−5, f(3)=?', answer: '4', teks: 'A.12B' },
      { expression: 'f(x)=2x², f(−2)=?', answer: '8', teks: 'A.12B' },
      { expression: 'f(x)=x+7, f(0)=?', answer: '7', teks: 'A.12B' },
      { expression: 'g(x)=−x+10, g(4)=?', answer: '6', teks: 'A.12B' },
      { expression: 'h(x)=x²+x, h(3)=?', answer: '12', teks: 'A.12B' },
    ],
  },
};

// Competency-aligned pools for instruction/assessment competencies.
const COMPETENCY_MATCH_POOLS = {
  math712: {
    comp001: [
      { expression: 'Integers include negatives, zero, and', answer: 'Positive whole numbers', teks: 'comp001' },
      { expression: 'A number with no repeating/terminating decimal can be', answer: 'Irrational', teks: 'comp001' },
      { expression: '|−9| equals', answer: '9', teks: 'comp001' },
      { expression: 'If a/b has b ≠ 0, the number is', answer: 'Rational', teks: 'comp001' },
      { expression: 'GCF focuses on', answer: 'Greatest common factor', teks: 'comp001' },
      { expression: 'LCM focuses on', answer: 'Least common multiple', teks: 'comp001' },
    ],
    comp002: [
      { expression: 'Constant first difference indicates', answer: 'Linear pattern', teks: 'comp002' },
      { expression: 'Slope measures', answer: 'Rate of change', teks: 'comp002' },
      { expression: 'Vertex form highlights', answer: 'Parabola vertex', teks: 'comp002' },
      { expression: 'Exponential growth has base', answer: 'Greater than 1', teks: 'comp002' },
      { expression: 'Solve system graphically by finding', answer: 'Intersection point', teks: 'comp002' },
      { expression: 'Function notation f(3) means', answer: 'Evaluate at 3', teks: 'comp002' },
    ],
    comp003: [
      { expression: 'Pythagorean theorem relates', answer: 'Sides of right triangles', teks: 'comp003' },
      { expression: 'A rigid motion preserves', answer: 'Distance and angle measure', teks: 'comp003' },
      { expression: 'Circle radius is half the', answer: 'Diameter', teks: 'comp003' },
      { expression: 'Area is measured in', answer: 'Square units', teks: 'comp003' },
      { expression: 'Volume is measured in', answer: 'Cubic units', teks: 'comp003' },
      { expression: 'Parallel lines cut by transversal create', answer: 'Angle relationships', teks: 'comp003' },
    ],
    comp004: [
      { expression: 'Mean equals', answer: 'Sum divided by count', teks: 'comp004' },
      { expression: 'Median is', answer: 'Middle value', teks: 'comp004' },
      { expression: 'Independent events satisfy P(A and B)=', answer: 'P(A) × P(B)', teks: 'comp004' },
      { expression: 'Total probability over sample space equals', answer: '1', teks: 'comp004' },
      { expression: 'A scatter plot trend can show', answer: 'Correlation', teks: 'comp004' },
      { expression: 'Outliers influence mean more than', answer: 'Median', teks: 'comp004' },
    ],
    comp005: [
      { expression: 'Counterexample is used to', answer: 'Disprove a claim', teks: 'comp005' },
      { expression: 'Deductive reasoning moves from', answer: 'General to specific', teks: 'comp005' },
      { expression: 'A valid argument requires', answer: 'Logical justification', teks: 'comp005' },
      { expression: 'Modeling translates context into', answer: 'Mathematical representation', teks: 'comp005' },
      { expression: 'Checking reasonableness supports', answer: 'Solution verification', teks: 'comp005' },
      { expression: 'Equivalent representations reveal', answer: 'Same relationship', teks: 'comp005' },
    ],
    c020: [
      { expression: 'Concrete → Representational → ?', answer: 'Abstract', teks: 'c020' },
      { expression: 'Use this to monitor understanding during lesson', answer: 'Formative assessment', teks: 'c020' },
      { expression: 'Best first move for new concept', answer: 'Use multiple representations', teks: 'c020' },
      { expression: 'Scaffold that supports language in math', answer: 'Sentence stems', teks: 'c020' },
      { expression: 'Talk move: "Why does your method work?" supports', answer: 'Mathematical reasoning', teks: 'c020' },
      { expression: 'Adjusting instruction based on evidence is called', answer: 'Responsive teaching', teks: 'c020' },
      { expression: 'Grouping students by need for a short task', answer: 'Flexible grouping', teks: 'c020' },
      { expression: 'Showing graph, table, and equation builds', answer: 'Conceptual connections', teks: 'c020' },
      { expression: 'Entry supports so all students can begin', answer: 'Multiple entry points', teks: 'c020' },
      { expression: 'Explain-and-justify classroom norm builds', answer: 'Math discourse', teks: 'c020' },
    ],
    c021: [
      { expression: 'Assessment used to improve ongoing teaching', answer: 'Formative', teks: 'c021' },
      { expression: 'Assessment used to certify learning at end', answer: 'Summative', teks: 'c021' },
      { expression: 'Item that reveals misconception quickly', answer: 'Diagnostic question', teks: 'c021' },
      { expression: 'Student work analysis mainly identifies', answer: 'Error patterns', teks: 'c021' },
      { expression: 'Best feedback style for growth', answer: 'Specific and actionable', teks: 'c021' },
      { expression: 'Assessment must match target', answer: 'Validity', teks: 'c021' },
      { expression: 'Consistent results across attempts', answer: 'Reliability', teks: 'c021' },
      { expression: 'Rubric criterion focused on explanation quality', answer: 'Reasoning evidence', teks: 'c021' },
      { expression: 'Quick end-of-class check', answer: 'Exit ticket', teks: 'c021' },
      { expression: 'Reteach decision should use', answer: 'Assessment data', teks: 'c021' },
    ],
    comp006: [
      { expression: 'Planning starts from standards and', answer: 'Learning goals', teks: 'comp006' },
      { expression: 'Different paths to same objective are', answer: 'Differentiation', teks: 'comp006' },
      { expression: 'Strong math task asks students to', answer: 'Explain their thinking', teks: 'comp006' },
      { expression: 'Most useful misconception response', answer: 'Probe and revoice', teks: 'comp006' },
      { expression: 'Evidence-based next step after quiz', answer: 'Targeted reteach', teks: 'comp006' },
      { expression: 'Assessment cycle: teach → check →', answer: 'Adjust instruction', teks: 'comp006' },
    ],
  },
  calculus: {
    calc_limits: [
      { expression: 'lim(x->0) sin(x)/x', answer: '1', teks: 'calc_limits' },
      { expression: 'lim(x->3) (x^2-9)/(x-3)', answer: '6', teks: 'calc_limits' },
      { expression: 'Direct LHospital forms include 0/0 and', answer: 'infinity/infinity', teks: 'calc_limits' },
      { expression: 'If f is continuous at a then lim(x->a) f(x) equals', answer: 'f(a)', teks: 'calc_limits' },
      { expression: 'lim(x->infinity) 1/x', answer: '0', teks: 'calc_limits' },
      { expression: 'lim(x->0) (1-cos x)/x^2', answer: '1/2', teks: 'calc_limits' },
    ],
    calc_derivatives: [
      { expression: 'd/dx[x^3]', answer: '3x^2', teks: 'calc_derivatives' },
      { expression: 'd/dx[sin x]', answer: 'cos x', teks: 'calc_derivatives' },
      { expression: 'd/dx[e^x]', answer: 'e^x', teks: 'calc_derivatives' },
      { expression: 'Derivative of a constant', answer: '0', teks: 'calc_derivatives' },
      { expression: 'd/dx[ln x]', answer: '1/x', teks: 'calc_derivatives' },
      { expression: 'Power rule coefficient for x^7', answer: '7', teks: 'calc_derivatives' },
    ],
    calc_derivative_apps: [
      { expression: 'Critical points occur where f\'(x)=0 or', answer: 'undefined', teks: 'calc_derivative_apps' },
      { expression: 'If f\'(x)>0 then f is', answer: 'increasing', teks: 'calc_derivative_apps' },
      { expression: 'If f\'\'(x)>0 then graph is', answer: 'concave up', teks: 'calc_derivative_apps' },
      { expression: 'Local max often changes f\' from + to', answer: '-', teks: 'calc_derivative_apps' },
      { expression: 'Optimization uses derivative to find', answer: 'extrema', teks: 'calc_derivative_apps' },
      { expression: 'Tangent slope equals the', answer: 'derivative value', teks: 'calc_derivative_apps' },
    ],
    calc_integrals: [
      { expression: 'Integral is reverse of', answer: 'derivative', teks: 'calc_integrals' },
      { expression: '∫ x^2 dx', answer: 'x^3/3 + C', teks: 'calc_integrals' },
      { expression: '∫ cos x dx', answer: 'sin x + C', teks: 'calc_integrals' },
      { expression: 'Definite integral gives', answer: 'net area', teks: 'calc_integrals' },
      { expression: 'FTC links integrals and', answer: 'derivatives', teks: 'calc_integrals' },
      { expression: '∫ 1 dx', answer: 'x + C', teks: 'calc_integrals' },
    ],
    calc_series: [
      { expression: 'Geometric series converges when |r| is less than', answer: '1', teks: 'calc_series' },
      { expression: 'Harmonic series sum(1/n) is', answer: 'divergent', teks: 'calc_series' },
      { expression: 'Taylor polynomial approximates a', answer: 'function locally', teks: 'calc_series' },
      { expression: 'Maclaurin is Taylor centered at', answer: '0', teks: 'calc_series' },
      { expression: 'If terms do not go to 0, series', answer: 'diverges', teks: 'calc_series' },
      { expression: 'Ratio test often targets', answer: 'factorials/exponentials', teks: 'calc_series' },
    ],
    calc_advanced: [
      { expression: 'A differential equation relates a function and its', answer: 'derivatives', teks: 'calc_advanced' },
      { expression: 'Slope field visualizes solutions to', answer: 'ODEs', teks: 'calc_advanced' },
      { expression: 'Average value of f on [a,b] includes factor', answer: '1/(b-a)', teks: 'calc_advanced' },
      { expression: 'Parametric curve needs equations for x and', answer: 'y', teks: 'calc_advanced' },
      { expression: 'Polar coordinates use r and', answer: 'theta', teks: 'calc_advanced' },
      { expression: 'Initial value problem needs equation plus', answer: 'initial condition', teks: 'calc_advanced' },
    ],
    calc_c001: [
      { expression: 'lim(x->3) (x^2-9)/(x-3)', answer: '6', teks: 'calc_c001' },
      { expression: 'Continuity requires limit equals', answer: 'function value', teks: 'calc_c001' },
      { expression: 'lim(x->0) sin x / x', answer: '1', teks: 'calc_c001' },
      { expression: 'lim(x->infinity) 1/x', answer: '0', teks: 'calc_c001' },
    ],
    calc_c002: [
      { expression: 'LHospital direct indeterminate: 0/0 or', answer: 'infinity/infinity', teks: 'calc_c002' },
      { expression: 'lim(x->0) (1-cos x)/x^2', answer: '1/2', teks: 'calc_c002' },
      { expression: 'lim(x->infinity) ln(x)/x', answer: '0', teks: 'calc_c002' },
      { expression: 'For 0*infinity first rewrite as', answer: 'quotient', teks: 'calc_c002' },
    ],
    calc_c003: [
      { expression: 'd/dx[x^5]', answer: '5x^4', teks: 'calc_c003' },
      { expression: 'd/dx[cos x]', answer: '-sin x', teks: 'calc_c003' },
      { expression: 'd/dx[ln x]', answer: '1/x', teks: 'calc_c003' },
      { expression: 'd/dx[x^2+3x]', answer: '2x+3', teks: 'calc_c003' },
    ],
    calc_c004: [
      { expression: 'dy/dx of x^2 + y^2 = 1 includes', answer: 'implicit differentiation', teks: 'calc_c004' },
      { expression: 'Related rates differentiate with respect to', answer: 'time', teks: 'calc_c004' },
      { expression: 'd/dx[e^x]', answer: 'e^x', teks: 'calc_c004' },
      { expression: 'd/dx[a^x] includes factor', answer: 'ln(a)', teks: 'calc_c004' },
    ],
    calc_c005: [
      { expression: 'If f\' changes + to -, point is local', answer: 'maximum', teks: 'calc_c005' },
      { expression: 'If f\' changes - to +, point is local', answer: 'minimum', teks: 'calc_c005' },
      { expression: 'Critical points: f\'=0 or', answer: 'undefined', teks: 'calc_c005' },
      { expression: 'First derivative test classifies', answer: 'extrema', teks: 'calc_c005' },
    ],
    calc_c006: [
      { expression: 'If f\'\' > 0, graph is', answer: 'concave up', teks: 'calc_c006' },
      { expression: 'Inflection point where concavity', answer: 'changes', teks: 'calc_c006' },
      { expression: 'Second derivative test uses f\' and', answer: 'f\'\'', teks: 'calc_c006' },
      { expression: 'Curve sketching uses signs of', answer: 'f\', f\'\'', teks: 'calc_c006' },
    ],
    calc_c007: [
      { expression: 'Optimization objective is often', answer: 'maximize/minimize', teks: 'calc_c007' },
      { expression: 'Set derivative to 0 to find', answer: 'candidates', teks: 'calc_c007' },
      { expression: 'Absolute extrema on closed interval include', answer: 'endpoints', teks: 'calc_c007' },
      { expression: 'Word constraints become', answer: 'equations', teks: 'calc_c007' },
    ],
    calc_c008: [
      { expression: 'Antiderivative of x^n uses denominator', answer: 'n+1', teks: 'calc_c008' },
      { expression: 'Integral includes constant', answer: 'C', teks: 'calc_c008' },
      { expression: '∫ 2x dx', answer: 'x^2 + C', teks: 'calc_c008' },
      { expression: '∫ sec^2 x dx', answer: 'tan x + C', teks: 'calc_c008' },
    ],
    calc_c009: [
      { expression: 'Definite integral from a to b gives', answer: 'net area', teks: 'calc_c009' },
      { expression: 'FTC Part 1 uses accumulation function and', answer: 'derivative', teks: 'calc_c009' },
      { expression: 'Integral sign with bounds is', answer: 'definite integral', teks: 'calc_c009' },
      { expression: 'Area above x-axis contributes', answer: 'positive', teks: 'calc_c009' },
    ],
    calc_c010: [
      { expression: 'u-substitution reverses', answer: 'chain rule', teks: 'calc_c010' },
      { expression: 'Choose u as inner function in', answer: 'composition', teks: 'calc_c010' },
      { expression: 'du comes from derivative of', answer: 'u', teks: 'calc_c010' },
      { expression: 'Back-substitute to original variable', answer: 'x', teks: 'calc_c010' },
    ],
    calc_c011: [
      { expression: 'If ratio test limit < 1, series', answer: 'converges', teks: 'calc_c011' },
      { expression: 'If ratio test limit > 1, series', answer: 'diverges', teks: 'calc_c011' },
      { expression: 'Geometric ratio r with |r|<1 means', answer: 'convergent', teks: 'calc_c011' },
      { expression: 'nth-term test: term not ->0 means', answer: 'divergent', teks: 'calc_c011' },
    ],
    calc_c012: [
      { expression: 'First-order ODE can model', answer: 'growth/decay', teks: 'calc_c012' },
      { expression: 'Average value on [a,b] uses', answer: '1/(b-a)', teks: 'calc_c012' },
      { expression: 'Parametric derivative dy/dx equals', answer: '(dy/dt)/(dx/dt)', teks: 'calc_c012' },
      { expression: 'Polar area uses integral of', answer: 'r^2', teks: 'calc_c012' },
    ],
  },
  math48: {
    comp48_6: [
      { expression: 'Assessment used during instruction', answer: 'Formative', teks: 'comp48_6' },
      { expression: 'Support that helps students start task', answer: 'Scaffolding', teks: 'comp48_6' },
      { expression: 'Using data to regroup students is', answer: 'Differentiation', teks: 'comp48_6' },
      { expression: 'Best quick understanding check', answer: 'Exit ticket', teks: 'comp48_6' },
      { expression: 'Feedback should be', answer: 'Timely and specific', teks: 'comp48_6' },
      { expression: 'Analyze wrong work to find', answer: 'Misconceptions', teks: 'comp48_6' },
    ],
  },
  ec6: {
    comp_ec6_6: [
      { expression: 'Math discussion routine builds', answer: 'Academic language', teks: 'comp_ec6_6' },
      { expression: 'Visuals + manipulatives support', answer: 'Conceptual understanding', teks: 'comp_ec6_6' },
      { expression: 'Small-group reteach should follow', answer: 'Progress monitoring', teks: 'comp_ec6_6' },
      { expression: 'Clear success criteria improve', answer: 'Student self-assessment', teks: 'comp_ec6_6' },
      { expression: 'Questioning strategy to deepen thinking', answer: 'Ask for justification', teks: 'comp_ec6_6' },
      { expression: 'Best use of quiz results', answer: 'Plan next instruction', teks: 'comp_ec6_6' },
    ],
  },
};

/* ── Helpers ── */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickUniqueByAnswer = (pool, count = 6) => {
  const usedAnswers = new Set();
  const unique = [];
  for (const q of shuffle(pool)) {
    if (usedAnswers.has(q.answer)) continue;
    unique.push(q);
    usedAnswers.add(q.answer);
    if (unique.length >= count) break;
  }
  return unique.slice(0, count);
};

const pickPairs = (grade, teksFilter, count = 6) => {
  const pool = [];
  const gradePool = QUESTION_POOLS[grade] || {};
  const teksIds = teksFilter ? teksFilter.split(',').map((t) => t.trim()).filter(Boolean) : [];
  if (teksIds.length > 0) {
    for (const id of teksIds) {
      if (gradePool[id]) pool.push(...gradePool[id]);
    }
  }
  if (pool.length === 0) {
    Object.values(gradePool).forEach((arr) => pool.push(...arr));
  }
  return pickUniqueByAnswer(pool, count);
};

const pickCompetencyPairs = ({ examId, compId, currentStd, teksFilter, count = 6 }) => {
  const examPool = COMPETENCY_MATCH_POOLS[examId] || {};
  const teksIds = teksFilter ? teksFilter.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const keysToTry = [...new Set([currentStd, ...teksIds, compId].filter(Boolean))];
  const scoped = [];
  keysToTry.forEach((k) => {
    if (examPool[k]) scoped.push(...examPool[k]);
  });
  if (scoped.length > 0) return pickUniqueByAnswer(scoped, count);
  return [];
};

const CARD_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1'];

/* ── Generate a brief explanation for how to solve the expression ── */
const explainPair = (expression, answer, teks) => {
  const expr = expression.trim();
  // Addition / subtraction (multi-digit)
  if (/\d+\s*[+]\s*\d+/.test(expr)) {
    const [a, b] = expr.split('+').map(s => s.trim());
    return `Add the numbers: ${a} + ${b}. Line up the digits by place value and add column by column to get ${answer}.`;
  }
  if (/\d+\s*[−\-]\s*\d+/.test(expr)) {
    const parts = expr.split(/[−\-]/).map(s => s.trim());
    return `Subtract: ${parts[0]} − ${parts[1]}. Regroup (trade) if needed. The difference is ${answer}.`;
  }
  // Multiplication
  if (/\d+\s*[×x]\s*\d+/.test(expr)) {
    const [a, b] = expr.split(/[×x]/).map(s => s.trim());
    return `Multiply: ${a} × ${b}. You can think of it as ${a} groups of ${b}, which equals ${answer}.`;
  }
  // Slope questions
  if (/slope/i.test(expr)) {
    return `Use the slope formula m = (y₂ − y₁) / (x₂ − x₁) to find the slope = ${answer}.`;
  }
  // Domain / Range
  if (/domain|range/i.test(expr)) {
    return `For standard linear functions, the domain and range are typically all real numbers. The answer is ${answer}.`;
  }
  // Solve equation
  if (/x\s*=\s*\?/i.test(expr) || /solve/i.test(expr)) {
    return `Isolate x by performing inverse operations on both sides of the equation. The solution is x = ${answer}.`;
  }
  // Factor
  if (/factor/i.test(expr)) {
    return `Find two numbers that multiply to give the constant and add to give the middle coefficient. The factored form is ${answer}.`;
  }
  // Vertex
  if (/vertex/i.test(expr)) {
    return `For vertex form y = a(x − h)² + k, the vertex is at (h, k) = ${answer}.`;
  }
  // Exponent simplification
  if (/x[⁰¹²³⁴⁵⁶⁷⁸⁹]+/.test(expr)) {
    return `Apply the laws of exponents (product rule: add exponents; quotient rule: subtract; power rule: multiply). Result: ${answer}.`;
  }
  // Rate of change
  if (/rate/i.test(expr)) {
    return `Rate of change = (change in output) / (change in input) = ${answer}.`;
  }
  // Function evaluation
  if (/f\(/.test(expr)) {
    return `Substitute the given value into the function and simplify to get ${answer}.`;
  }
  // Default
  return `Evaluate the expression step by step to arrive at the answer: ${answer}.`;
};

/* ══════════════════════════════════════════════════════════════════════════ */

const QBotBubble = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,245,255,0.05)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(0,245,255,0.1)', marginBottom: 12 }}>
    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#1e3a5f,#0d1b2a)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #00f5ff', overflow: 'hidden' }}>
      <img src={qbotImg} alt="QBot" style={{ width: 24 }} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#7dd3fc', lineHeight: 1.4 }}>{msg}</div>
  </div>
);

const MathMatch = () => {
  const [searchParams] = useSearchParams();
  const gradeParam = searchParams.get('grade') || '';
  const GRADES_WITH_POOLS = ['grade3', 'algebra'];
  const initialGrade = (gradeParam && GRADES_WITH_POOLS.includes(gradeParam))
    ? gradeParam
    : (gradeParam === 'grade7-12' || gradeParam === 'grade4-8' ? 'algebra' : 'grade3');
  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [gameStarted, setGameStarted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [pairCount, setPairCount] = useState(6);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [bestScore, setBestScore] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [scopeUnavailable, setScopeUnavailable] = useState(false);
  const [autoStarting, setAutoStarting] = useState(false);
  const [mismatchMap, setMismatchMap] = useState({});   // pairId → mismatch count
  const lockRef = useRef(false);
  const autoStartRef = useRef(false);

  const teksParam = searchParams.get('teks') || '';
  const compParam = searchParams.get('comp') || '';
  const currentStd = searchParams.get('currentStd') || searchParams.get('std') || '';
  const examId = searchParams.get('examId') || '';
  const strictScope = searchParams.get('from') === 'loop' && !!(teksParam || compParam || currentStd);
  const launchedFromLoop = searchParams.get('from') === 'loop';
  const embeddedLaunch = searchParams.get('embed') === '1';
  const loopEmbeddedMode = launchedFromLoop && embeddedLaunch;
  const labelParam = searchParams.get('label') || '';
  const { returnUrl, goBack } = useGameReturn();
  // Resolve student identity: URL params first, then fall back to saved session
  const _session = (() => {
    try {
      const saved = localStorage.getItem('quantegy-student-session');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })();
  const studentId = searchParams.get('sid') || _session?.studentId || '';
  const assignmentId = searchParams.get('aid') || '';
  const classId = searchParams.get('cid') || _session?.classId || '';

  // Sync selectedGrade from URL when grade or teks param is present
  useEffect(() => {
    if (teksParam) {
      const firstTeks = teksParam.split(',')[0].trim();
      if (firstTeks.startsWith('3.')) setSelectedGrade('grade3');
      else setSelectedGrade('algebra');
    } else if (gradeParam && GRADES_WITH_POOLS.includes(gradeParam)) {
      setSelectedGrade(gradeParam);
    } else if (gradeParam === 'grade7-12' || gradeParam === 'grade4-8') {
      setSelectedGrade('algebra');
    }
  }, [teksParam, gradeParam]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameComplete) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(timer);
  }, [gameStarted, gameComplete, startTime]);

  // Check game complete
  useEffect(() => {
    if (gameStarted && cards.length > 0 && matched.size === cards.length) {
      setGameComplete(true);
      const key = `math-match-best-${selectedGrade}-${pairCount}`;
      const prev = localStorage.getItem(key);
      const score = moves;
      if (!prev || score < parseInt(prev)) {
        localStorage.setItem(key, String(score));
        setBestScore(score);
      } else {
        setBestScore(parseInt(prev));
      }
      // Save result for gradebook (efficiency score: fewer moves = higher %)
      const maxMoves = pairCount * 3; // generous baseline
      const efficiency = Math.min(100, Math.round((1 - (moves - pairCount) / maxMoves) * 100));
      const pctScore = Math.max(0, Math.min(100, efficiency));
      if (studentId) {
        let resolvedAid = assignmentId;
        if (!resolvedAid && classId) {
          const match = findMatchingAssignment(classId, 'math-match', teksParam || undefined);
          if (match) resolvedAid = match.id;
        }
        saveGameResult({
          studentId,
          assignmentId: resolvedAid || `unassigned-${Date.now()}`,
          classId: classId || '',
          gameId: 'math-match', teks: teksParam,
          score: pctScore, moves, time: elapsed, pairs: pairCount,
          grade: selectedGrade,
        });
      }
    }
  }, [matched, cards.length, gameStarted]);

  const startGame = useCallback(() => {
    const competencyScoped = pickCompetencyPairs({
      examId,
      compId: compParam,
      currentStd,
      teksFilter: teksParam,
      count: pairCount,
    });
    let pairs = competencyScoped.length > 0 ? competencyScoped : pickPairs(selectedGrade, teksParam, pairCount);
    let gradeToUse = selectedGrade;
    if (strictScope && competencyScoped.length === 0) {
      setScopeUnavailable(true);
      setCards([]);
      setGameStarted(false);
      return;
    }
    setScopeUnavailable(false);
    // If this grade has no content (e.g. TExES 7-12 in dropdown but only grade3/algebra have pools), fallback so game always starts
    if (!strictScope && pairs.length === 0) {
      for (const fallback of ['algebra', 'grade3']) {
        pairs = pickPairs(fallback, teksParam, pairCount);
        if (pairs.length > 0) {
          gradeToUse = fallback;
          setSelectedGrade(fallback);
          break;
        }
      }
    }
    if (pairs.length === 0) return; // still no content; should not happen for grade3/algebra
    // Create cards: for each pair, one card = expression, one card = answer
    const cardList = [];
    pairs.forEach((p, i) => {
      const pairId = `pair-${i}`;
      const color = CARD_COLORS[i % CARD_COLORS.length];
      cardList.push({ id: `${pairId}-expr`, pairId, text: p.expression, type: 'expression', answer: String(p.answer), teks: p.teks, color });
      cardList.push({ id: `${pairId}-ans`, pairId, text: p.answer, type: 'answer', answer: String(p.answer), teks: p.teks, color });
    });
    setCards(shuffle(cardList));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setElapsed(0);
    setStartTime(Date.now());
    setGameComplete(false);
    setShowReview(false);
    setMismatchMap({});
    setGameStarted(true);
  }, [selectedGrade, teksParam, pairCount, examId, compParam, currentStd, strictScope]);

  // Loop launches should start immediately for snappier UX.
  useEffect(() => {
    if (!loopEmbeddedMode || autoStartRef.current || gameStarted || gameComplete) return;
    autoStartRef.current = true;
    setAutoStarting(true);
    requestAnimationFrame(() => {
      startGame();
      setAutoStarting(false);
    });
  }, [loopEmbeddedMode, gameStarted, gameComplete, startGame]);

  const handleCardClick = (cardId) => {
    if (lockRef.current) return;
    if (matched.has(cardId)) return;
    if (flipped.includes(cardId)) return;
    if (flipped.length >= 2) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      const c1 = cards.find((c) => c.id === first);
      const c2 = cards.find((c) => c.id === second);

      if (c1.answer === c2.answer && c1.type !== c2.type) {
        setTimeout(() => {
          setMatched((prev) => new Set([...prev, first, second]));
          setFlipped([]);
        }, 500);
      } else {
        setMismatchMap((prev) => {
          const next = { ...prev };
          next[c1.pairId] = (next[c1.pairId] || 0) + 1;
          next[c2.pairId] = (next[c2.pairId] || 0) + 1;
          return next;
        });
        lockRef.current = true;
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 900);
      }
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const gradeLabel = TEKS_GRADES.find((g) => g.id === selectedGrade)?.label || selectedGrade;
  const availableTeks = Object.keys(QUESTION_POOLS[selectedGrade] || {});
  const standardsList = availableTeks.map((id) => {
    const list = TEKS_STANDARDS[selectedGrade] || [];
    return list.find((s) => s.id === id) || { id, description: id };
  });

  // Grid columns – use more columns so cards stay small
  const totalCards = pairCount * 2;
  const cols = totalCards <= 8 ? 4 : totalCards <= 12 ? 4 : totalCards <= 16 ? 5 : 5;

  return (
    <div style={{ padding: '12px 16px', maxWidth: 600, margin: '0 auto', fontFamily: 'system-ui, sans-serif', paddingBottom: returnUrl ? 96 : 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        {!loopEmbeddedMode && (returnUrl ? (
          <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue practice</button>
        ) : (
          <Link to="/games" style={{ color: '#007bff', textDecoration: 'none', fontSize: 13 }}>← Games</Link>
        ))}
        {gameStarted && !gameComplete && (
          <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 600, color: '#475569' }}>
            <span>Moves: {moves}</span>
            <span>Time: {formatTime(elapsed)}</span>
            <span>Matched: {matched.size / 2}/{pairCount}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24 }}>Math Match</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
            Match expressions with answers.
            {teksParam && <span style={{ marginLeft: 6, padding: '2px 8px', background: '#e8f0fe', color: '#1a5cba', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>Focused: {teksParam}</span>}
          </p>
        </div>
        <button type="button" onClick={() => setShowHelp(!showHelp)}
          style={{
            padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 6,
            background: showHelp ? '#e8f4ff' : '#f8fafc', color: '#1e3a5f',
            border: showHelp ? '2px solid #007bff' : '1px solid #d1d5db', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
          {showHelp ? 'Hide Help' : 'How to Play'}
        </button>
      </div>

      {/* ── Instructions (always accessible) ── */}
      {showHelp && (
        <div style={{
          marginBottom: 14, padding: 14, borderRadius: 10,
          background: 'linear-gradient(135deg, #eff6ff, #f0f7ff)',
          border: '1px solid #bfdbfe',
        }}>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#334155', lineHeight: 1.65 }}>
            <li>You'll see a grid of <strong>face-down cards</strong> (each showing "?").</li>
            <li><strong>Click any card</strong> to flip it. It shows either a <span style={{ padding: '1px 5px', background: '#dbeafe', color: '#1e40af', borderRadius: 3, fontWeight: 600, fontSize: 11 }}>math expression</span> (e.g. <em>4 × 3</em>) or an <span style={{ padding: '1px 5px', background: '#dcfce7', color: '#166534', borderRadius: 3, fontWeight: 600, fontSize: 11 }}>answer</span> (e.g. <em>12</em>).</li>
            <li><strong>Click a second card</strong>. If it's the matching answer for the expression (or vice versa), both stay face-up!</li>
            <li>If they <strong>don't match</strong>, both flip back. Remember where they are!</li>
            <li>Match <strong>all pairs</strong> in the fewest moves and fastest time to win.</li>
          </ol>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
            Tip: Use your memory! When cards flip back, remember their position for later.
          </p>
        </div>
      )}

      {/* ── Setup Screen ── */}
      {!gameStarted && !loopEmbeddedMode && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
          {autoStarting && launchedFromLoop && (
            <div style={{ marginBottom: 12, padding: 12, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 13, color: '#1e3a8a' }}>
              Loading Math Match board...
            </div>
          )}
          {scopeUnavailable && (
            <div style={{ marginBottom: 12, padding: 12, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', fontSize: 13, color: '#7f1d1d' }}>
              No competency-aligned Math Match set is available for this exact loop scope yet.
            </div>
          )}
          {strictScope && (
            <div style={{ marginBottom: 12, padding: 12, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 13, color: '#1e3a8a' }}>
              This loop launch is locked to competency-aligned content only.
            </div>
          )}
          {!teksParam && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Grade Level</label>
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}
                  style={{ padding: 10, width: '100%', maxWidth: 280, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}>
                  {TEKS_GRADES.map((g) => (<option key={g.id} value={g.id}>{g.label}</option>))}
                </select>
              </div>

              {availableTeks.length === 0 && (
                <div style={{ marginBottom: 16, padding: 12, background: '#fef3c7', borderRadius: 8, border: '1px solid #fcd34d', fontSize: 13, color: '#92400e' }}>
                  Math Match has practice content for <strong>Grade 3</strong> and <strong>Algebra I</strong>. Choose one of those above to play, or click Start Game and we’ll use Algebra I.
                </div>
              )}

              <div style={{ marginBottom: 16, padding: 12, background: '#f0f7ff', borderRadius: 8 }}>
                <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 14 }}>Aligned TEKS Standards:</p>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#475569' }}>
                  {standardsList.map((s) => (
                    <li key={s.id} style={{ marginBottom: 3 }}><strong>{s.id}:</strong> {s.description}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {labelParam && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f0fdf4', borderRadius: 8 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#166534' }}>Focused Practice: {labelParam}</p>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Number of Pairs</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[4, 6, 8, 10].map((n) => (
                <button key={n} type="button" onClick={() => setPairCount(n)}
                  style={{
                    padding: '10px 18px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    border: pairCount === n ? '2px solid #007bff' : '1px solid #d1d5db',
                    background: pairCount === n ? '#e8f4ff' : '#fff',
                    color: pairCount === n ? '#007bff' : '#374151',
                  }}>
                  {n} pairs
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={startGame}
            style={{
              padding: '14px 32px', fontSize: 18, fontWeight: 700, cursor: 'pointer',
              background: 'linear-gradient(135deg, #007bff, #0056d2)', color: '#fff',
              border: 'none', borderRadius: 10, boxShadow: '0 4px 14px rgba(0,123,255,0.3)',
            }}>
            Start Game
          </button>
        </div>
      )}

      {!gameStarted && loopEmbeddedMode && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, fontSize: 13, color: '#475569' }}>
          {scopeUnavailable
            ? 'No scoped Math Match board is available for this loop right now. Use Continue to move to the next tile.'
            : 'Loading Math Match board...'}
        </div>
      )}

      {/* ── Game Board ── */}
      {gameStarted && !gameComplete && (
        <>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: '#eff6ff', border: '2px solid #93c5fd', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af' }}>Question</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: '#f0fdf4', border: '2px solid #86efac', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#166534' }}>Answer</span>
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 6,
        }}>
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id);
            const isMatched = matched.has(card.id);
            const showFace = isFlipped || isMatched;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                style={{
                  position: 'relative',
                  minHeight: 64,
                  borderRadius: 8,
                  border: isMatched
                    ? `2px solid ${card.color}`
                    : showFace
                      ? card.type === 'expression' ? '2px solid #93c5fd' : '2px solid #86efac'
                      : card.type === 'expression' ? '2px solid #1d4ed8' : '2px solid #15803d',
                  cursor: isMatched ? 'default' : 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  lineHeight: 1.25,
                  transition: 'all 0.25s ease',
                  background: isMatched
                    ? `${card.color}18`
                    : showFace
                      ? card.type === 'expression' ? '#eff6ff' : '#f0fdf4'
                      : card.type === 'expression'
                        ? 'linear-gradient(135deg, #1e3a8a, #1e40af)'
                        : 'linear-gradient(135deg, #14532d, #166534)',
                  color: isMatched
                    ? card.color
                    : showFace
                      ? card.type === 'expression' ? '#1e3a8a' : '#14532d'
                      : '#fff',
                  opacity: isMatched ? 0.6 : 1,
                  boxShadow: isFlipped && !isMatched
                    ? card.type === 'expression' ? '0 0 10px rgba(59,130,246,0.25)' : '0 0 10px rgba(34,197,94,0.25)'
                    : 'none',
                }}
              >
                {showFace ? (
                  <>
                    <span style={{ fontSize: totalCards <= 12 ? 13 : 11, wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(card.text)) }} />
                    <span style={{
                      marginTop: 3, fontSize: 8, fontWeight: 800, padding: '1px 6px', borderRadius: 3,
                      background: card.type === 'expression' ? '#bfdbfe' : '#bbf7d0',
                      color: card.type === 'expression' ? '#1e40af' : '#166534',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {card.type === 'expression' ? 'Question' : 'Answer'}
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 20 }}>?</span>
                    <span style={{
                      marginTop: 4, fontSize: 8, fontWeight: 800, padding: '1px 6px', borderRadius: 3,
                      background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {card.type === 'expression' ? 'Q' : 'A'}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
        </>
      )}

      {/* ── Game Complete ── */}
      {gameComplete && !showReview && (() => {
        // Gather unique pairs for the summary
        const pairMap = {};
        cards.forEach((c) => {
          if (!pairMap[c.pairId]) pairMap[c.pairId] = {};
          pairMap[c.pairId][c.type] = c.text;
          pairMap[c.pairId].teks = c.teks;
        });
        const totalMismatches = Object.values(mismatchMap).reduce((a, b) => a + b, 0);

        return (
          <div style={{
            marginTop: 16, padding: 28, textAlign: 'center', borderRadius: 14,
            background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
            border: '1px solid #86efac',
          }}>
            <QBotBubble msg="Nice matching - use the review to reconnect each expression to its computed value. 🤖🎯" />
            <p style={{ margin: 0, fontSize: 36 }}>🎉</p>
            <h2 style={{ margin: '8px 0', color: '#166534' }}>You matched them all!</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '16px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1e40af' }}>{moves}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Moves</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#7c3aed' }}>{formatTime(elapsed)}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Time</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#059669' }}>{pairCount}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Pairs</p>
              </div>
            </div>
            {totalMismatches > 0 && (
              <p style={{ margin: '4px 0', fontSize: 13, color: '#b45309' }}>
                You had <strong>{totalMismatches}</strong> mismatch{totalMismatches > 1 ? 'es' : ''} before finding all pairs.
              </p>
            )}
            {bestScore !== null && (
              <p style={{ margin: '8px 0', fontSize: 13, color: '#475569' }}>
                Best for {pairCount} pairs ({gradeLabel}): <strong>{bestScore} moves</strong>
              </p>
            )}
            <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#475569' }}>
              Grade: {gradeLabel}{teksParam && ` • Focused: ${teksParam}`}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginTop: 8 }}>
              {returnUrl && (
                <button type="button" onClick={goBack} style={{
                  width: '100%', padding: '14px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff',
                  border: '2px solid #34d399', borderRadius: 12,
                  boxShadow: '0 0 14px rgba(5,150,105,0.35)',
                }}>
                  Continue
                </button>
              )}
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
{null}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setShowReview(true)}
                  style={{
                    padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
                    border: '2px solid #fbbf24', borderRadius: 10,
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}>
                  <span style={{ fontSize: 18 }}>📝</span> Review Solutions
                </button>
                <button type="button" onClick={startGame}
                  style={{
                    padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    background: '#007bff', color: '#fff', border: 'none', borderRadius: 8,
                  }}>
                  Play Again
                </button>
                {!loopEmbeddedMode && (
                  <button type="button" onClick={() => { setGameStarted(false); setGameComplete(false); setShowReview(false); }}
                    style={{
                      padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                      background: '#f8fafc', color: '#475569', border: '1px solid #d1d5db', borderRadius: 8,
                    }}>
                    Back
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Post-Game Review ── */}
      {gameComplete && showReview && (() => {
        // Build review items from matched pairs
        const pairMap = {};
        cards.forEach((c) => {
          if (!pairMap[c.pairId]) pairMap[c.pairId] = {};
          pairMap[c.pairId][c.type] = c.text;
          pairMap[c.pairId].teks = c.teks;
          pairMap[c.pairId].pairId = c.pairId;
        });
        const reviewItems = Object.values(pairMap).map((p) => {
          const hadMismatches = (mismatchMap[p.pairId] || 0) > 0;
          return {
            question: p.expression,
            correctAnswer: p.answer,
            userAnswer: hadMismatches ? 'Mismatched before finding' : p.answer,
            isCorrect: !hadMismatches,
            teks: p.teks,
            explanation: explainPair(p.expression, p.answer, p.teks),
          };
        });
        const correctCount = reviewItems.filter((r) => r.isCorrect).length;
        return (
          <GameReview
            questions={reviewItems}
            score={correctCount}
            total={reviewItems.length}
            time={elapsed}
            gameTitle={`Math Match – ${gradeLabel}`}
            onPlayAgain={returnUrl ? undefined : startGame}
            continueUrl={returnUrl || undefined}
            continueLabel="Continue"
            onBack={() => { setGameStarted(false); setGameComplete(false); setShowReview(false); }}
            backLabel="Back"
          />
        );
      })()}

      {/* ── Bottom controls during game ── */}
      {gameStarted && !gameComplete && !loopEmbeddedMode && (
        <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={startGame}
            style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>
            Restart
          </button>
          <button type="button" onClick={() => { setGameStarted(false); setGameComplete(false); }}
            style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>
            Back
          </button>
        </div>
      )}

      {/* ── Consistent loop CTA: always available at every screen/state ── */}
      {returnUrl && (
        <LoopContinueButton onClick={goBack} label="Continue" />
      )}
    </div>
  );
};

export default MathMatch;
