/**
 * OAE — Ohio Assessments for Educators.
 */

export const OAE_DOMAINS_CONTENT = [
  { id: 'oae_cont_math', name: 'Mathematics', desc: 'Number sense, algebra, geometry, data', weight: 0.50, games: ['math-sprint', 'algebra-sprint', 'shape-shifter', 'graph-explorer'] },
  { id: 'oae_cont_ped', name: 'Professional Knowledge', desc: 'Instruction, assessment, environment', weight: 0.50, games: [] },
];

export const OAE_QUESTIONS_CONTENT = [
  { id: 'oa1', comp: 'oae_cont_math', type: 'mc', difficulty: 1, q: 'Which fraction is greater: 2/3 or 3/4?', choices: ['2/3', '3/4', 'equal', 'cannot tell'], answer: '3/4', explanation: '2/3 ≈ 0.67, 3/4 = 0.75.' },
  { id: 'oa2', comp: 'oae_cont_math', type: 'mc', difficulty: 2, q: 'Solve: 3n + 7 = 22', choices: ['5', '6', '7', '8'], answer: '5', explanation: '3n = 15, n = 5.' },
  { id: 'oa3', comp: 'oae_cont_math', type: 'mc', difficulty: 1, q: 'How many sides does a pentagon have?', choices: ['4', '5', '6', '7'], answer: '5', explanation: 'Penta = five.' },
  { id: 'oa4', comp: 'oae_cont_ped', type: 'mc', difficulty: 1, q: 'An IEP is used for:', choices: ['all students', 'students with disabilities', 'gifted only', 'ELLs only'], answer: 'students with disabilities', explanation: 'Individualized Education Program.' },
  { id: 'oa5', comp: 'oae_cont_ped', type: 'mc', difficulty: 2, q: 'Accommodations in instruction:', choices: ['change the content', 'provide access without changing content', 'lower expectations', 'replace instruction'], answer: 'provide access without changing content', explanation: 'Access, not modification of standards.' },
  { id: 'oa6', comp: 'oae_cont_ped', type: 'mc', difficulty: 1, q: 'Summative assessment is used:', choices: ['during instruction', 'at the end of a unit or course', 'only for grades', 'never'], answer: 'at the end of a unit or course', explanation: 'Summative = end; formative = during.' },
];

export const OAE_TEST_CONFIG = {
  oae_content: { totalQuestions: 100, timeMinutes: 180, passingScore: 0.70, categoryDistribution: { oae_cont_math: 50, oae_cont_ped: 50 } },
};

export function getOAEQuestionsForExam(examId) {
  return OAE_QUESTIONS_CONTENT;
}

export function getOAEDomainsForExam(examId) {
  return OAE_DOMAINS_CONTENT;
}
