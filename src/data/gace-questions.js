/**
 * GACE — Georgia Assessments for the Certification of Educators.
 */

export const GACE_DOMAINS_PROGRAM = [
  { id: 'gace_prog_read', name: 'Reading', desc: 'Comprehension, analysis', weight: 0.33, games: [] },
  { id: 'gace_prog_math', name: 'Mathematics', desc: 'Number sense, algebra, data', weight: 0.34, games: ['math-sprint', 'algebra-sprint', 'q-blocks'] },
  { id: 'gace_prog_write', name: 'Writing', desc: 'Written expression', weight: 0.33, games: [] },
];

export const GACE_QUESTIONS_PROGRAM = [
  { id: 'gp1', comp: 'gace_prog_read', type: 'mc', difficulty: 1, q: 'The passage primarily discusses:', choices: ['A', 'B', 'C', 'D'], answer: 'A', explanation: 'Main idea.' },
  { id: 'gp2', comp: 'gace_prog_math', type: 'mc', difficulty: 1, q: '15 − 3 × 4 =', choices: ['48', '3', '12', '0'], answer: '3', explanation: 'Order of operations: 3×4=12, 15−12=3.' },
  { id: 'gp3', comp: 'gace_prog_math', type: 'mc', difficulty: 2, q: 'If 40% of n = 24, then n =', choices: ['60', '9.6', '96', '12'], answer: '60', explanation: '0.40n = 24, n = 60.' },
  { id: 'gp4', comp: 'gace_prog_write', type: 'mc', difficulty: 1, q: 'Which sentence has no error?', choices: ['A', 'B', 'C', 'D'], answer: 'B', explanation: 'Grammar and mechanics.' },
  { id: 'gp5', comp: 'gace_prog_read', type: 'mc', difficulty: 2, q: 'The author\'s tone is best described as:', choices: ['neutral', 'dismissive', 'enthusiastic', 'skeptical'], answer: 'neutral', explanation: 'Tone = attitude.' },
  { id: 'gp6', comp: 'gace_prog_write', type: 'mc', difficulty: 2, q: 'The most effective topic sentence is:', choices: ['A', 'B', 'C', 'D'], answer: 'C', explanation: 'Topic sentence introduces main idea.' },
];

export const GACE_TEST_CONFIG = {
  gace_program: { totalQuestions: 90, timeMinutes: 180, passingScore: 0.70, categoryDistribution: { gace_prog_read: 30, gace_prog_math: 30, gace_prog_write: 30 } },
};

export function getGACEQuestionsForExam(examId) {
  return GACE_QUESTIONS_PROGRAM;
}

export function getGACEDomainsForExam(examId) {
  return GACE_DOMAINS_PROGRAM;
}
