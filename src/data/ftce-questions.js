/**
 * FTCE — Florida Teacher Certification Examinations.
 */

export const FTCE_DOMAINS_GK_MATH = [
  { id: 'ftce_gkm_num', name: 'Number Concepts & Operations', desc: 'Number sense, operations', weight: 0.33, games: ['math-sprint', 'q-blocks', 'fraction-pizza'] },
  { id: 'ftce_gkm_alg', name: 'Algebra & Geometry', desc: 'Algebraic reasoning, geometry', weight: 0.34, games: ['algebra-sprint', 'equation-balance', 'shape-shifter'] },
  { id: 'ftce_gkm_data', name: 'Data & Probability', desc: 'Statistics, probability', weight: 0.33, games: ['graph-explorer', 'math-jeopardy'] },
];

export const FTCE_QUESTIONS_GK_MATH = [
  { id: 'fgm1', comp: 'ftce_gkm_num', type: 'mc', difficulty: 1, q: '18% of 50 is:', choices: ['8', '9', '10', '11'], answer: '9', explanation: '0.18 × 50 = 9.' },
  { id: 'fgm2', comp: 'ftce_gkm_num', type: 'mc', difficulty: 1, q: 'Which is equivalent to 3/5?', choices: ['0.35', '0.5', '0.6', '0.53'], answer: '0.6', explanation: '3 ÷ 5 = 0.6.' },
  { id: 'fgm3', comp: 'ftce_gkm_alg', type: 'mc', difficulty: 1, q: 'Solve: 4x = 20', choices: ['4', '5', '16', '24'], answer: '5', explanation: 'x = 20/4 = 5.' },
  { id: 'fgm4', comp: 'ftce_gkm_alg', type: 'mc', difficulty: 2, q: 'Perimeter of a square with side 5?', choices: ['10', '20', '25', '15'], answer: '20', explanation: '4 × 5 = 20.' },
  { id: 'fgm5', comp: 'ftce_gkm_data', type: 'mc', difficulty: 1, q: 'Median of 3, 5, 7, 9?', choices: ['5', '6', '7', '8'], answer: '6', explanation: 'Average of 5 and 7 = 6.' },
  { id: 'fgm6', comp: 'ftce_gkm_data', type: 'mc', difficulty: 2, q: 'P(rolling a 3 on a fair die)?', choices: ['1/6', '1/3', '1/2', '3/6'], answer: '1/6', explanation: 'One favorable outcome out of 6.' },
];

export const FTCE_DOMAINS_PROF_ED = [
  { id: 'ftce_pe_plan', name: 'Instructional Design & Planning', desc: 'Objectives, assessment, differentiation', weight: 0.25, games: [] },
  { id: 'ftce_pe_env', name: 'Learning Environment', desc: 'Classroom management, climate', weight: 0.25, games: [] },
  { id: 'ftce_pe_inst', name: 'Instructional Delivery', desc: 'Strategies, communication', weight: 0.25, games: [] },
  { id: 'ftce_pe_assess', name: 'Assessment', desc: 'Formative, summative, feedback', weight: 0.25, games: [] },
];

export const FTCE_QUESTIONS_PROF_ED = [
  { id: 'fpe1', comp: 'ftce_pe_plan', type: 'mc', difficulty: 1, q: 'A learning objective should be:', choices: ['broad', 'measurable', 'vague', 'teacher-centered'], answer: 'measurable', explanation: 'Objectives should be observable and measurable.' },
  { id: 'fpe2', comp: 'ftce_pe_plan', type: 'mc', difficulty: 2, q: 'Differentiation primarily addresses:', choices: ['only readiness', 'readiness, interest, and learning profile', 'only interest', 'one pace for all'], answer: 'readiness, interest, and learning profile', explanation: 'Tomlinson: content, process, product, learning environment.' },
  { id: 'fpe3', comp: 'ftce_pe_env', type: 'mc', difficulty: 1, q: 'Positive behavior support focuses on:', choices: ['punishment only', 'prevention and teaching replacement behaviors', 'removal only', 'ignoring behavior'], answer: 'prevention and teaching replacement behaviors', explanation: 'PBS is proactive and teaches skills.' },
  { id: 'fpe4', comp: 'ftce_pe_inst', type: 'mc', difficulty: 1, q: 'Scaffolding means:', choices: ['giving answers', 'temporary support to reach the next level', 'avoiding challenge', 'independent work only'], answer: 'temporary support to reach the next level', explanation: 'Vygotsky: Zone of Proximal Development.' },
  { id: 'fpe5', comp: 'ftce_pe_assess', type: 'mc', difficulty: 2, q: 'Formative assessment is used to:', choices: ['grade only', 'inform instruction during learning', 'replace summative tests', 'rank students'], answer: 'inform instruction during learning', explanation: 'Formative = during; summative = end.' },
  { id: 'fpe6', comp: 'ftce_pe_assess', type: 'mc', difficulty: 1, q: 'Rubrics help students by:', choices: ['reducing feedback', 'clarifying expectations and criteria', 'replacing instruction', 'speeding grading only'], answer: 'clarifying expectations and criteria', explanation: 'Rubrics make criteria transparent.' },
];

export const FTCE_TEST_CONFIG = {
  ftce_gk_math: { totalQuestions: 40, timeMinutes: 85, passingScore: 0.70, categoryDistribution: { ftce_gkm_num: 14, ftce_gkm_alg: 14, ftce_gkm_data: 12 } },
  ftce_prof_ed: { totalQuestions: 120, timeMinutes: 150, passingScore: 0.70, categoryDistribution: { ftce_pe_plan: 30, ftce_pe_env: 30, ftce_pe_inst: 30, ftce_pe_assess: 30 } },
};

export function getFTCEQuestionsForExam(examId) {
  if (examId === 'ftce_prof_ed') return FTCE_QUESTIONS_PROF_ED;
  return FTCE_QUESTIONS_GK_MATH;
}

export function getFTCEDomainsForExam(examId) {
  if (examId === 'ftce_prof_ed') return FTCE_DOMAINS_PROF_ED;
  return FTCE_DOMAINS_GK_MATH;
}
