/**
 * Praxis (ETS) — used in many states for teacher certification.
 * Same structure as texes-questions for TestPrepPage.
 */

export const PRAXIS_DOMAINS_CORE_MATH = [
  { id: 'praxis_cm_num', name: 'Number & Quantity', desc: 'Number sense, operations, ratios', weight: 0.35, games: ['math-sprint', 'q-blocks', 'fraction-pizza'] },
  { id: 'praxis_cm_alg', name: 'Algebra & Functions', desc: 'Equations, expressions, functions', weight: 0.35, games: ['algebra-sprint', 'equation-balance', 'math-maze'] },
  { id: 'praxis_cm_geom', name: 'Geometry & Data', desc: 'Geometry, statistics, probability', weight: 0.30, games: ['shape-shifter', 'graph-explorer', 'math-jeopardy'] },
];

export const PRAXIS_QUESTIONS_CORE_MATH = [
  { id: 'pcm1', comp: 'praxis_cm_num', type: 'mc', difficulty: 1, q: 'What is 25% of 80?', choices: ['15', '20', '25', '30'], answer: '20', explanation: '0.25 × 80 = 20.' },
  { id: 'pcm2', comp: 'praxis_cm_num', type: 'mc', difficulty: 1, q: 'Simplify: 3/4 + 1/4', choices: ['1', '4/8', '1/2', '4/4'], answer: '1', explanation: '3/4 + 1/4 = 4/4 = 1.' },
  { id: 'pcm3', comp: 'praxis_cm_alg', type: 'mc', difficulty: 1, q: 'Solve: x − 7 = 12', choices: ['5', '19', '−5', '84'], answer: '19', explanation: 'x = 12 + 7 = 19.' },
  { id: 'pcm4', comp: 'praxis_cm_alg', type: 'mc', difficulty: 2, q: 'If 2x + 3 = 11, then x =', choices: ['4', '7', '14', '8'], answer: '4', explanation: '2x = 8, x = 4.' },
  { id: 'pcm5', comp: 'praxis_cm_geom', type: 'mc', difficulty: 1, q: 'Area of a rectangle 6 by 4?', choices: ['10', '24', '20', '12'], answer: '24', explanation: '6 × 4 = 24.' },
  { id: 'pcm6', comp: 'praxis_cm_geom', type: 'mc', difficulty: 2, q: 'Mean of 2, 4, 6, 8, 10?', choices: ['5', '6', '30', '7'], answer: '6', explanation: '(2+4+6+8+10)/5 = 6.' },
];

export const PRAXIS_DOMAINS_READING = [
  { id: 'praxis_rd_idea', name: 'Key Ideas & Details', desc: 'Main idea, inference, evidence', weight: 0.50, games: [] },
  { id: 'praxis_rd_craft', name: 'Craft & Structure', desc: 'Vocabulary, structure, purpose', weight: 0.30, games: [] },
  { id: 'praxis_rd_integ', name: 'Integration of Ideas', desc: 'Compare sources, argument', weight: 0.20, games: [] },
];

export const PRAXIS_QUESTIONS_READING = [
  { id: 'pr1', comp: 'praxis_rd_idea', type: 'mc', difficulty: 1, q: 'The main idea of the passage is:', choices: ['A', 'B', 'C', 'D'], answer: 'B', explanation: 'Main idea questions require identifying the central message.' },
  { id: 'pr2', comp: 'praxis_rd_idea', type: 'mc', difficulty: 2, q: 'The author most likely believes that:', choices: ['A', 'B', 'C', 'D'], answer: 'C', explanation: 'Inference from the text.' },
  { id: 'pr3', comp: 'praxis_rd_craft', type: 'mc', difficulty: 1, q: 'As used in line 5, "substantial" means:', choices: ['heavy', 'considerable', 'physical', 'legal'], answer: 'considerable', explanation: 'Words in context.' },
  { id: 'pr4', comp: 'praxis_rd_craft', type: 'mc', difficulty: 2, q: 'The passage is structured primarily by:', choices: ['chronology', 'comparison', 'cause and effect', 'problem and solution'], answer: 'comparison', explanation: 'Structure questions.' },
  { id: 'pr5', comp: 'praxis_rd_integ', type: 'mc', difficulty: 1, q: 'Which choice best supports the claim?', choices: ['A', 'B', 'C', 'D'], answer: 'A', explanation: 'Evidence-based reading.' },
];

export const PRAXIS_TEST_CONFIG = {
  praxis_math: { totalQuestions: 56, timeMinutes: 85, passingScore: 0.60, categoryDistribution: { praxis_cm_num: 20, praxis_cm_alg: 20, praxis_cm_geom: 16 } },
  praxis_reading: { totalQuestions: 56, timeMinutes: 85, passingScore: 0.60, categoryDistribution: { praxis_rd_idea: 28, praxis_rd_craft: 17, praxis_rd_integ: 11 } },
};

export function getPraxisQuestionsForExam(examId) {
  if (examId === 'praxis_reading') return PRAXIS_QUESTIONS_READING;
  return PRAXIS_QUESTIONS_CORE_MATH;
}

export function getPraxisDomainsForExam(examId) {
  if (examId === 'praxis_reading') return PRAXIS_DOMAINS_READING;
  return PRAXIS_DOMAINS_CORE_MATH;
}
