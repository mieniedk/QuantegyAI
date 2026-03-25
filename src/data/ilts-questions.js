/**
 * ILTS — Illinois Licensure Testing System.
 */

export const ILTS_DOMAINS_CONTENT = [
  { id: 'ilts_cnt_math', name: 'Mathematics Content', desc: 'Number sense, algebra, geometry, data', weight: 0.50, games: ['math-sprint', 'algebra-sprint', 'q-blocks', 'shape-shifter'] },
  { id: 'ilts_cnt_ped', name: 'Instruction & Assessment', desc: 'Pedagogy, differentiation, assessment', weight: 0.50, games: [] },
];

export const ILTS_QUESTIONS_CONTENT = [
  { id: 'il1', comp: 'ilts_cnt_math', type: 'mc', difficulty: 1, q: 'What is 7 × 8?', choices: ['54', '56', '64', '15'], answer: '56', explanation: '7 × 8 = 56.' },
  { id: 'il2', comp: 'ilts_cnt_math', type: 'mc', difficulty: 2, q: 'Solve: 2(x + 3) = 14', choices: ['4', '5', '6', '7'], answer: '4', explanation: 'x + 3 = 7, x = 4.' },
  { id: 'il3', comp: 'ilts_cnt_math', type: 'mc', difficulty: 1, q: 'Area of triangle with base 10, height 4?', choices: ['14', '20', '40', '5'], answer: '20', explanation: '½(10)(4) = 20.' },
  { id: 'il4', comp: 'ilts_cnt_ped', type: 'mc', difficulty: 1, q: 'Formative assessment is best used to:', choices: ['grade report cards', 'inform instruction during learning', 'replace summative tests', 'rank students'], answer: 'inform instruction during learning', explanation: 'Formative = during instruction.' },
  { id: 'il5', comp: 'ilts_cnt_ped', type: 'mc', difficulty: 2, q: 'Productive struggle means:', choices: ['letting students fail', 'challenging tasks with appropriate support', 'only easy problems', 'no support'], answer: 'challenging tasks with appropriate support', explanation: 'Balance challenge and scaffolding.' },
  { id: 'il6', comp: 'ilts_cnt_ped', type: 'mc', difficulty: 1, q: 'Differentiation may include:', choices: ['one text for all', 'varied texts, grouping, and support by need', 'no groups', 'same pace for all'], answer: 'varied texts, grouping, and support by need', explanation: 'Content, process, product, environment.' },
];

export const ILTS_TEST_CONFIG = {
  ilts_content: { totalQuestions: 100, timeMinutes: 180, passingScore: 0.70, categoryDistribution: { ilts_cnt_math: 50, ilts_cnt_ped: 50 } },
};

export function getILTSQuestionsForExam(examId) {
  return ILTS_QUESTIONS_CONTENT;
}

export function getILTSDomainsForExam(examId) {
  return ILTS_DOMAINS_CONTENT;
}
