/**
 * Ireland (Republic) teacher certification prep — Teaching Council, Droichead.
 * Numeracy, Literacy, Professional Knowledge. Same structure as other prep for TestPrepPage.
 */

export const IRELAND_NUMERACY_DOMAINS = [
  { id: 'ire_num', name: 'Number & Algebra', desc: 'Arithmetic, percentages', weight: 0.40, games: ['math-sprint', 'q-blocks'] },
  { id: 'ire_data', name: 'Data & Statistics', desc: 'Charts, averages', weight: 0.35, games: ['graph-explorer'] },
  { id: 'ire_problem', name: 'Problem Solving', desc: 'Multi-step, reasoning', weight: 0.25, games: ['math-sprint'] },
];

export const IRELAND_NUMERACY_QUESTIONS = [
  { id: 'ire1', comp: 'ire_num', type: 'mc', difficulty: 1, q: 'What is 30% of 90?', choices: ['25', '27', '30', '33'], answer: '27', explanation: '0.30 × 90 = 27.' },
  { id: 'ire2', comp: 'ire_num', type: 'mc', difficulty: 2, q: 'Simplify: 4/7 + 2/7', choices: ['6/14', '6/7', '2/7', '8/7'], answer: '6/7', explanation: '4/7 + 2/7 = 6/7.' },
  { id: 'ire3', comp: 'ire_data', type: 'mc', difficulty: 1, q: 'Mean of 6, 8, 10, 12, 14?', choices: ['8', '9', '10', '11'], answer: '10', explanation: '(6+8+10+12+14)/5 = 10.' },
  { id: 'ire4', comp: 'ire_data', type: 'mc', difficulty: 2, q: 'In a class of 30, 1/3 are boys. How many girls?', choices: ['10', '15', '20', '25'], answer: '20', explanation: '2/3 × 30 = 20 girls.' },
  { id: 'ire5', comp: 'ire_problem', type: 'mc', difficulty: 1, q: 'Perimeter of square with side 8 cm?', choices: ['16 cm', '32 cm', '64 cm', '8 cm'], answer: '32 cm', explanation: '4 × 8 = 32 cm.' },
  { id: 'ire6', comp: 'ire_problem', type: 'mc', difficulty: 2, q: 'Solve: 3n + 6 = 21', choices: ['4', '5', '6', '7'], answer: '5', explanation: '3n = 15, n = 5.' },
];

export const IRELAND_LITERACY_DOMAINS = [
  { id: 'ire_lit_read', name: 'Reading & Comprehension', desc: 'Main idea, inference', weight: 0.40, games: [] },
  { id: 'ire_lit_spag', name: 'SPaG', desc: 'Spelling, punctuation, grammar', weight: 0.35, games: [] },
  { id: 'ire_lit_write', name: 'Writing', desc: 'Clarity, audience', weight: 0.25, games: [] },
];

export const IRELAND_LITERACY_QUESTIONS = [
  { id: 'irel1', comp: 'ire_lit_read', type: 'mc', difficulty: 1, q: 'The main idea of a paragraph is:', choices: ['one detail', 'the central point the author conveys', 'the last sentence', 'the title'], answer: 'the central point the author conveys', explanation: 'Main idea = central message.' },
  { id: 'irel2', comp: 'ire_lit_read', type: 'mc', difficulty: 2, q: 'Inference means:', choices: ['copying', 'drawing conclusions from evidence in the text', 'only literal', 'guessing'], answer: 'drawing conclusions from evidence in the text', explanation: 'Inference = conclusions from evidence.' },
  { id: 'irel3', comp: 'ire_lit_spag', type: 'mc', difficulty: 1, q: 'Correct: The children did _____ homework.', choices: ['they\'re', 'their', 'there'], answer: 'their', explanation: 'Their = possessive.' },
  { id: 'irel4', comp: 'ire_lit_spag', type: 'mc', difficulty: 2, q: 'Semicolon is used to:', choices: ['introduce a list', 'link two closely related independent clauses', 'end a sentence'], answer: 'link two closely related independent clauses', explanation: 'Semicolon connects related sentences.' },
  { id: 'irel5', comp: 'ire_lit_write', type: 'mc', difficulty: 1, q: 'Report writing should be:', choices: ['informal', 'clear, accurate, professional', 'very brief only'], answer: 'clear, accurate, professional', explanation: 'Reports need clear, professional language.' },
  { id: 'irel6', comp: 'ire_lit_write', type: 'mc', difficulty: 2, q: 'Audience in writing is:', choices: ['only the teacher', 'who will read and their needs', 'the curriculum'], answer: 'who will read and their needs', explanation: 'Audience = intended readers.' },
];

export const IRELAND_PROFESSIONAL_DOMAINS = [
  { id: 'ire_curr', name: 'Primary School Curriculum / Framework', desc: 'Curriculum, pedagogy', weight: 0.35, games: [] },
  { id: 'ire_safe', name: 'Child Protection & Welfare', desc: 'Safeguarding, reporting', weight: 0.35, games: [] },
  { id: 'ire_stand', name: 'Teaching Council & Droichead', desc: 'Registration, induction', weight: 0.30, games: [] },
];

export const IRELAND_PROFESSIONAL_QUESTIONS = [
  { id: 'irep1', comp: 'ire_curr', type: 'mc', difficulty: 1, q: 'The Primary School Curriculum in Ireland is organised around:', choices: ['only subjects', 'key curriculum areas and skills', 'only secondary', 'no framework'], answer: 'key curriculum areas and skills', explanation: 'Primary curriculum has key areas and skills.' },
  { id: 'irep2', comp: 'ire_curr', type: 'mc', difficulty: 2, q: 'Assessment for Learning (AfL) is used to:', choices: ['only report', 'inform teaching and next steps', 'replace summative', 'grade only'], answer: 'inform teaching and next steps', explanation: 'AfL guides teaching and learning.' },
  { id: 'irep3', comp: 'ire_safe', type: 'mc', difficulty: 1, q: 'Child protection in Irish schools requires:', choices: ['only attendance', 'awareness of welfare and reporting concerns to designated liaison person', 'only curriculum'], answer: 'awareness of welfare and reporting concerns to designated liaison person', explanation: 'Report concerns to DLP per policy.' },
  { id: 'irep4', comp: 'ire_safe', type: 'mc', difficulty: 2, q: 'If you have a child protection concern, you should:', choices: ['keep confidential', 'follow school policy and report to the designated liaison person', 'only tell the child'], answer: 'follow school policy and report to the designated liaison person', explanation: 'Report to DLP; do not investigate alone.' },
  { id: 'irep5', comp: 'ire_stand', type: 'mc', difficulty: 1, q: 'The Teaching Council of Ireland is responsible for:', choices: ['only curriculum', 'registration and regulation of the teaching profession', 'only initial teacher education'], answer: 'registration and regulation of the teaching profession', explanation: 'Teaching Council registers and regulates teachers.' },
  { id: 'irep6', comp: 'ire_stand', type: 'mc', difficulty: 2, q: 'Droichead is:', choices: ['a curriculum', 'the national induction framework for newly qualified teachers in Ireland', 'only for primary', 'optional'], answer: 'the national induction framework for newly qualified teachers in Ireland', explanation: 'Droichead is the NQT induction programme.' },
];

export const IRELAND_TEST_CONFIG = {
  numeracy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { ire_num: 16, ire_data: 14, ire_problem: 10 } },
  literacy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { ire_lit_read: 16, ire_lit_spag: 14, ire_lit_write: 10 } },
  professional: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { ire_curr: 14, ire_safe: 14, ire_stand: 12 } },
};

export function getIrelandQuestionsForExam(examId) {
  const map = { numeracy: IRELAND_NUMERACY_QUESTIONS, literacy: IRELAND_LITERACY_QUESTIONS, professional: IRELAND_PROFESSIONAL_QUESTIONS };
  return map[examId] || IRELAND_NUMERACY_QUESTIONS;
}

export function getIrelandDomainsForExam(examId) {
  const map = { numeracy: IRELAND_NUMERACY_DOMAINS, literacy: IRELAND_LITERACY_DOMAINS, professional: IRELAND_PROFESSIONAL_DOMAINS };
  return map[examId] || IRELAND_NUMERACY_DOMAINS;
}
