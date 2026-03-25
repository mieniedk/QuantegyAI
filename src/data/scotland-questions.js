/**
 * Scotland teacher certification prep — GTCS, Curriculum for Excellence.
 * Numeracy, Literacy, Professional Knowledge. Same structure as other prep for TestPrepPage.
 */

export const SCOTLAND_NUMERACY_DOMAINS = [
  { id: 'scot_num', name: 'Number & Data', desc: 'Arithmetic, percentages, statistics', weight: 0.40, games: ['math-sprint', 'q-blocks'] },
  { id: 'scot_data', name: 'Data & Statistics', desc: 'Charts, averages, interpreting data', weight: 0.35, games: ['graph-explorer'] },
  { id: 'scot_problem', name: 'Problem Solving', desc: 'Multi-step, reasoning', weight: 0.25, games: ['math-sprint'] },
];

export const SCOTLAND_NUMERACY_QUESTIONS = [
  { id: 's1', comp: 'scot_num', type: 'mc', difficulty: 1, q: 'What is 20% of 150?', choices: ['25', '30', '35', '40'], answer: '30', explanation: '0.20 × 150 = 30.' },
  { id: 's2', comp: 'scot_num', type: 'mc', difficulty: 2, q: 'A class of 32 has 8 absent. What fraction are present?', choices: ['1/4', '3/4', '1/2', '2/3'], answer: '3/4', explanation: '24 present out of 32 = 3/4.' },
  { id: 's3', comp: 'scot_data', type: 'mc', difficulty: 1, q: 'Mean of 5, 10, 15, 20, 25?', choices: ['12', '15', '17', '20'], answer: '15', explanation: '(5+10+15+20+25)/5 = 15.' },
  { id: 's4', comp: 'scot_data', type: 'mc', difficulty: 2, q: 'A pie chart shows 72° for one category. What percentage?', choices: ['7.2%', '20%', '72%', '25%'], answer: '20%', explanation: '72/360 = 1/5 = 20%.' },
  { id: 's5', comp: 'scot_problem', type: 'mc', difficulty: 1, q: 'Books cost £4 each. Budget £36. Maximum number?', choices: ['8', '9', '10', '12'], answer: '9', explanation: '36 ÷ 4 = 9.' },
  { id: 's6', comp: 'scot_problem', type: 'mc', difficulty: 2, q: 'Solve: 2x + 7 = 19', choices: ['5', '6', '7', '8'], answer: '6', explanation: '2x = 12, x = 6.' },
];

export const SCOTLAND_LITERACY_DOMAINS = [
  { id: 'scot_lit_read', name: 'Reading & Comprehension', desc: 'Main idea, inference', weight: 0.40, games: [] },
  { id: 'scot_lit_spag', name: 'Spelling, Punctuation & Grammar', desc: 'SPaG', weight: 0.35, games: [] },
  { id: 'scot_lit_write', name: 'Writing & Communication', desc: 'Clarity, audience', weight: 0.25, games: [] },
];

export const SCOTLAND_LITERACY_QUESTIONS = [
  { id: 'sl1', comp: 'scot_lit_read', type: 'mc', difficulty: 1, q: 'The main idea of a paragraph is typically:', choices: ['one detail', 'the central point the author conveys', 'the last sentence', 'the title'], answer: 'the central point the author conveys', explanation: 'Main idea = central message.' },
  { id: 'sl2', comp: 'scot_lit_read', type: 'mc', difficulty: 2, q: 'Inference in reading means:', choices: ['copying text', 'drawing conclusions from evidence in the text', 'only literal facts', 'skipping'], answer: 'drawing conclusions from evidence in the text', explanation: 'Inference = conclusions from what is stated or implied.' },
  { id: 'sl3', comp: 'scot_lit_spag', type: 'mc', difficulty: 1, q: 'Which is correct?', choices: ['Their going to school', 'They\'re going to school', 'There going to school'], answer: 'They\'re going to school', explanation: 'They\'re = they are.' },
  { id: 'sl4', comp: 'scot_lit_spag', type: 'mc', difficulty: 2, q: 'A comma is used correctly to:', choices: ['join two independent clauses without a conjunction', 'separate items in a list', 'end a sentence'], answer: 'separate items in a list', explanation: 'Commas separate list items.' },
  { id: 'sl5', comp: 'scot_lit_write', type: 'mc', difficulty: 1, q: 'School reports should be:', choices: ['informal', 'clear, accurate, and professional', 'very brief only'], answer: 'clear, accurate, and professional', explanation: 'Reports need clear, professional language.' },
  { id: 'sl6', comp: 'scot_lit_write', type: 'mc', difficulty: 2, q: 'Audience in writing refers to:', choices: ['only the teacher', 'who will read the text and their needs', 'the curriculum'], answer: 'who will read the text and their needs', explanation: 'Audience = intended readers.' },
];

export const SCOTLAND_PROFESSIONAL_DOMAINS = [
  { id: 'scot_curr', name: 'Curriculum for Excellence', desc: 'CfE, experiences and outcomes', weight: 0.35, games: [] },
  { id: 'scot_safe', name: 'Child Protection & Welfare', desc: 'Safeguarding, GIRFEC', weight: 0.35, games: [] },
  { id: 'scot_stand', name: 'GTCS Standards & Conduct', desc: 'Professional standards', weight: 0.30, games: [] },
];

export const SCOTLAND_PROFESSIONAL_QUESTIONS = [
  { id: 'sp1', comp: 'scot_curr', type: 'mc', difficulty: 1, q: 'Curriculum for Excellence (CfE) is organised around:', choices: ['only subjects', 'experiences and outcomes, broad general education, senior phase', 'only secondary', 'no framework'], answer: 'experiences and outcomes, broad general education, senior phase', explanation: 'CfE uses experiences and outcomes and phases.' },
  { id: 'sp2', comp: 'scot_curr', type: 'mc', difficulty: 2, q: 'Formative assessment in Scottish schools is used to:', choices: ['only report', 'inform teaching and next steps during learning', 'replace summative', 'grade only'], answer: 'inform teaching and next steps during learning', explanation: 'Assessment for Learning guides teaching.' },
  { id: 'sp3', comp: 'scot_safe', type: 'mc', difficulty: 1, q: 'GIRFEC stands for:', choices: ['General Inspection Framework', 'Getting it right for every child', 'Government Inspection', 'No such framework'], answer: 'Getting it right for every child', explanation: 'GIRFEC is Scotland\'s approach to supporting children.' },
  { id: 'sp4', comp: 'scot_safe', type: 'mc', difficulty: 2, q: 'If you have a child protection concern in Scotland, you should:', choices: ['keep it confidential', 'follow school policy and report to the designated person', 'only tell the child', 'wait for proof'], answer: 'follow school policy and report to the designated person', explanation: 'Concerns must be reported to the designated person.' },
  { id: 'sp5', comp: 'scot_stand', type: 'mc', difficulty: 1, q: 'GTCS is the:', choices: ['General Teaching Council for Scotland', 'Government Teaching body', 'only for headteachers', 'no such body'], answer: 'General Teaching Council for Scotland', explanation: 'GTCS registers and regulates teachers in Scotland.' },
  { id: 'sp6', comp: 'scot_stand', type: 'mc', difficulty: 2, q: 'Professional standards for teachers in Scotland include:', choices: ['only subject knowledge', 'professional values, knowledge, and practice', 'only for probationers', 'no standards'], answer: 'professional values, knowledge, and practice', explanation: 'GTCS standards cover values, knowledge, and practice.' },
];

export const SCOTLAND_TEST_CONFIG = {
  numeracy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { scot_num: 16, scot_data: 14, scot_problem: 10 } },
  literacy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { scot_lit_read: 16, scot_lit_spag: 14, scot_lit_write: 10 } },
  professional: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { scot_curr: 14, scot_safe: 14, scot_stand: 12 } },
};

export function getScotlandQuestionsForExam(examId) {
  const map = { numeracy: SCOTLAND_NUMERACY_QUESTIONS, literacy: SCOTLAND_LITERACY_QUESTIONS, professional: SCOTLAND_PROFESSIONAL_QUESTIONS };
  return map[examId] || SCOTLAND_NUMERACY_QUESTIONS;
}

export function getScotlandDomainsForExam(examId) {
  const map = { numeracy: SCOTLAND_NUMERACY_DOMAINS, literacy: SCOTLAND_LITERACY_DOMAINS, professional: SCOTLAND_PROFESSIONAL_DOMAINS };
  return map[examId] || SCOTLAND_NUMERACY_DOMAINS;
}
