/**
 * MTEL — Massachusetts Tests for Educator Licensure.
 */

export const MTEL_DOMAINS_COMM = [
  { id: 'mtel_com_read', name: 'Reading', desc: 'Comprehension, analysis', weight: 0.50, games: [] },
  { id: 'mtel_com_write', name: 'Writing', desc: 'Written expression, grammar', weight: 0.50, games: [] },
];

export const MTEL_QUESTIONS_COMM = [
  { id: 'mc1', comp: 'mtel_com_read', type: 'mc', difficulty: 1, q: 'The main idea of the passage is:', choices: ['A', 'B', 'C', 'D'], answer: 'B', explanation: 'Main idea = central message.' },
  { id: 'mc2', comp: 'mtel_com_read', type: 'mc', difficulty: 2, q: 'The author\'s purpose is primarily to:', choices: ['entertain', 'inform', 'persuade', 'describe'], answer: 'inform', explanation: 'Author purpose.' },
  { id: 'mc3', comp: 'mtel_com_write', type: 'mc', difficulty: 1, q: 'Which sentence is correct?', choices: ['A', 'B', 'C', 'D'], answer: 'C', explanation: 'Grammar and usage.' },
  { id: 'mc4', comp: 'mtel_com_write', type: 'mc', difficulty: 2, q: 'The best revision for clarity is:', choices: ['A', 'B', 'C', 'D'], answer: 'A', explanation: 'Concision and clarity.' },
];

export const MTEL_DOMAINS_MATH = [
  { id: 'mtel_math_num', name: 'Number & Operations', desc: 'Number sense, operations', weight: 0.35, games: ['math-sprint', 'q-blocks', 'fraction-pizza'] },
  { id: 'mtel_math_alg', name: 'Algebra & Geometry', desc: 'Algebra, geometry', weight: 0.35, games: ['algebra-sprint', 'shape-shifter'] },
  { id: 'mtel_math_data', name: 'Data & Probability', desc: 'Statistics, probability', weight: 0.30, games: ['graph-explorer', 'math-jeopardy'] },
];

export const MTEL_QUESTIONS_MATH = [
  { id: 'mm1', comp: 'mtel_math_num', type: 'mc', difficulty: 1, q: '12 is 30% of what number?', choices: ['36', '40', '4', '3.6'], answer: '40', explanation: '12/0.30 = 40.' },
  { id: 'mm2', comp: 'mtel_math_alg', type: 'mc', difficulty: 1, q: 'Slope of line through (0,0) and (2,6)?', choices: ['2', '3', '4', '6'], answer: '3', explanation: 'Slope = 6/2 = 3.' },
  { id: 'mm3', comp: 'mtel_math_data', type: 'mc', difficulty: 2, q: 'Mean of 10, 20, 30, 40?', choices: ['20', '25', '30', '100'], answer: '25', explanation: '(10+20+30+40)/4 = 25.' },
];

export const MTEL_TEST_CONFIG = {
  mtel_comm: { totalQuestions: 42, timeMinutes: 240, passingScore: 0.70, categoryDistribution: { mtel_com_read: 21, mtel_com_write: 21 } },
  mtel_math: { totalQuestions: 45, timeMinutes: 240, passingScore: 0.70, categoryDistribution: { mtel_math_num: 16, mtel_math_alg: 16, mtel_math_data: 13 } },
};

export function getMTELQuestionsForExam(examId) {
  if (examId === 'mtel_math') return MTEL_QUESTIONS_MATH;
  return MTEL_QUESTIONS_COMM;
}

export function getMTELDomainsForExam(examId) {
  if (examId === 'mtel_math') return MTEL_DOMAINS_MATH;
  return MTEL_DOMAINS_COMM;
}
