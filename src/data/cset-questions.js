/**
 * CSET / CBEST — California Subject Examinations for Teachers & basic skills.
 */

export const CSET_DOMAINS_MATH = [
  { id: 'cset_math_alg', name: 'Algebra & Number Theory', desc: 'Algebra, number sense', weight: 0.35, games: ['algebra-sprint', 'equation-balance', 'math-sprint'] },
  { id: 'cset_math_geom', name: 'Geometry & Measurement', desc: 'Geometry, measurement', weight: 0.35, games: ['shape-shifter', 'graph-explorer'] },
  { id: 'cset_math_data', name: 'Probability & Statistics', desc: 'Data, probability', weight: 0.30, games: ['math-jeopardy', 'graph-explorer'] },
];

export const CSET_QUESTIONS_MATH = [
  { id: 'csm1', comp: 'cset_math_alg', type: 'mc', difficulty: 1, q: 'Solve: 5x − 2 = 18', choices: ['3', '4', '16', '20'], answer: '4', explanation: '5x = 20, x = 4.' },
  { id: 'csm2', comp: 'cset_math_alg', type: 'mc', difficulty: 2, q: 'Factor: x² − 4', choices: ['(x−2)²', '(x−2)(x+2)', '(x−4)(x+1)', '(x+2)²'], answer: '(x−2)(x+2)', explanation: 'Difference of squares.' },
  { id: 'csm3', comp: 'cset_math_geom', type: 'mc', difficulty: 1, q: 'Area of a circle with r = 5? (π ≈ 3.14)', choices: ['31.4', '78.5', '25', '15.7'], answer: '78.5', explanation: 'A = πr² = 25π ≈ 78.5.' },
  { id: 'csm4', comp: 'cset_math_geom', type: 'mc', difficulty: 2, q: 'Volume of a cylinder r=2, h=5?', choices: ['20π', '10π', '40π', '15π'], answer: '20π', explanation: 'V = πr²h = π(4)(5) = 20π.' },
  { id: 'csm5', comp: 'cset_math_data', type: 'mc', difficulty: 1, q: 'Range of 3, 7, 2, 9, 5?', choices: ['5', '7', '9', '6'], answer: '7', explanation: 'Range = 9 − 2 = 7.' },
  { id: 'csm6', comp: 'cset_math_data', type: 'mc', difficulty: 2, q: 'P(two heads in two coin flips)?', choices: ['1/4', '1/2', '1', '1/8'], answer: '1/4', explanation: '(1/2)(1/2) = 1/4.' },
];

export const CSET_DOMAINS_ELA = [
  { id: 'cset_ela_read', name: 'Reading Literature & Informational', desc: 'Comprehension, analysis', weight: 0.50, games: [] },
  { id: 'cset_ela_lang', name: 'Language & Writing', desc: 'Grammar, writing process', weight: 0.50, games: [] },
];

export const CSET_QUESTIONS_ELA = [
  { id: 'cse1', comp: 'cset_ela_read', type: 'mc', difficulty: 1, q: 'The theme of the passage is best stated as:', choices: ['A', 'B', 'C', 'D'], answer: 'B', explanation: 'Theme = central message.' },
  { id: 'cse2', comp: 'cset_ela_read', type: 'mc', difficulty: 2, q: 'The author uses metaphor to suggest:', choices: ['A', 'B', 'C', 'D'], answer: 'C', explanation: 'Literary analysis.' },
  { id: 'cse3', comp: 'cset_ela_lang', type: 'mc', difficulty: 1, q: 'Which sentence is grammatically correct?', choices: ['A', 'B', 'C', 'D'], answer: 'A', explanation: 'Subject-verb agreement, modifiers.' },
  { id: 'cse4', comp: 'cset_ela_lang', type: 'mc', difficulty: 2, q: 'The revision that best strengthens the argument is:', choices: ['A', 'B', 'C', 'D'], answer: 'D', explanation: 'Writing and rhetoric.' },
];

export const CSET_TEST_CONFIG = {
  cset_math: { totalQuestions: 50, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { cset_math_alg: 18, cset_math_geom: 18, cset_math_data: 14 } },
  cset_ela: { totalQuestions: 50, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { cset_ela_read: 25, cset_ela_lang: 25 } },
};

export function getCSETQuestionsForExam(examId) {
  if (examId === 'cset_ela') return CSET_QUESTIONS_ELA;
  return CSET_QUESTIONS_MATH;
}

export function getCSETDomainsForExam(examId) {
  if (examId === 'cset_ela') return CSET_DOMAINS_ELA;
  return CSET_DOMAINS_MATH;
}
