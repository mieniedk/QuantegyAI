/**
 * WEST — Washington Educator Skills Tests.
 */

export const WEST_DOMAINS_BASIC = [
  { id: 'west_b_read', name: 'Reading', desc: 'Comprehension, vocabulary, analysis', weight: 0.33, games: [] },
  { id: 'west_b_math', name: 'Mathematics', desc: 'Number sense, algebra, geometry, data', weight: 0.34, games: ['math-sprint', 'algebra-sprint', 'q-blocks'] },
  { id: 'west_b_write', name: 'Writing', desc: 'Written expression, grammar', weight: 0.33, games: [] },
];

export const WEST_QUESTIONS_BASIC = [
  { id: 'wb1', comp: 'west_b_read', type: 'mc', difficulty: 1, q: 'The main purpose of the passage is to:', choices: ['A', 'B', 'C', 'D'], answer: 'B', explanation: 'Main idea.' },
  { id: 'wb2', comp: 'west_b_math', type: 'mc', difficulty: 1, q: 'What is 20% of 90?', choices: ['18', '9', '20', '110'], answer: '18', explanation: '0.20 × 90 = 18.' },
  { id: 'wb3', comp: 'west_b_math', type: 'mc', difficulty: 2, q: 'Solve: x/4 = 5', choices: ['20', '9', '1.25', '4/5'], answer: '20', explanation: 'x = 5 × 4 = 20.' },
  { id: 'wb4', comp: 'west_b_write', type: 'mc', difficulty: 1, q: 'Which sentence is grammatically correct?', choices: ['A', 'B', 'C', 'D'], answer: 'A', explanation: 'Standard English conventions.' },
  { id: 'wb5', comp: 'west_b_read', type: 'mc', difficulty: 2, q: 'The author\'s tone suggests:', choices: ['approval', 'skepticism', 'neutrality', 'anger'], answer: 'skepticism', explanation: 'Tone from word choice.' },
  { id: 'wb6', comp: 'west_b_write', type: 'mc', difficulty: 2, q: 'The revision that best improves the paragraph is:', choices: ['A', 'B', 'C', 'D'], answer: 'C', explanation: 'Organization and clarity.' },
];

export const WEST_TEST_CONFIG = {
  west_basic: { totalQuestions: 90, timeMinutes: 180, passingScore: 0.70, categoryDistribution: { west_b_read: 30, west_b_math: 30, west_b_write: 30 } },
};

export function getWESTQuestionsForExam(examId) {
  return WEST_QUESTIONS_BASIC;
}

export function getWESTDomainsForExam(examId) {
  return WEST_DOMAINS_BASIC;
}
