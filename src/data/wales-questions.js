/**
 * Wales teacher certification prep — EWC, Curriculum for Wales.
 * Numeracy, Literacy, Professional Knowledge. Same structure as other prep for TestPrepPage.
 */

export const WALES_NUMERACY_DOMAINS = [
  { id: 'wales_num', name: 'Number & Algebra', desc: 'Arithmetic, percentages, ratios', weight: 0.40, games: ['math-sprint', 'q-blocks'] },
  { id: 'wales_data', name: 'Data & Statistics', desc: 'Charts, averages', weight: 0.35, games: ['graph-explorer'] },
  { id: 'wales_problem', name: 'Problem Solving', desc: 'Multi-step, reasoning', weight: 0.25, games: ['math-sprint'] },
];

export const WALES_NUMERACY_QUESTIONS = [
  { id: 'w1', comp: 'wales_num', type: 'mc', difficulty: 1, q: 'What is 25% of 80?', choices: ['18', '20', '22', '25'], answer: '20', explanation: '0.25 × 80 = 20.' },
  { id: 'w2', comp: 'wales_num', type: 'mc', difficulty: 2, q: 'Simplify: 2/5 + 1/5', choices: ['3/10', '3/5', '2/5', '1/5'], answer: '3/5', explanation: '2/5 + 1/5 = 3/5.' },
  { id: 'w3', comp: 'wales_data', type: 'mc', difficulty: 1, q: 'Median of 3, 5, 7, 9, 11?', choices: ['5', '6', '7', '9'], answer: '7', explanation: 'Middle value is 7.' },
  { id: 'w4', comp: 'wales_data', type: 'mc', difficulty: 2, q: 'In a class of 25, 40% are boys. How many boys?', choices: ['8', '10', '12', '15'], answer: '10', explanation: '0.40 × 25 = 10.' },
  { id: 'w5', comp: 'wales_problem', type: 'mc', difficulty: 1, q: 'Perimeter of a rectangle 10 m by 6 m?', choices: ['16 m', '32 m', '60 m', '30 m'], answer: '32 m', explanation: '2(10+6) = 32 m.' },
  { id: 'w6', comp: 'wales_problem', type: 'mc', difficulty: 2, q: 'Solve: 4x − 3 = 17', choices: ['4', '5', '6', '7'], answer: '5', explanation: '4x = 20, x = 5.' },
];

export const WALES_LITERACY_DOMAINS = [
  { id: 'wales_lit_read', name: 'Reading & Comprehension', desc: 'Main idea, inference', weight: 0.40, games: [] },
  { id: 'wales_lit_spag', name: 'SPaG', desc: 'Spelling, punctuation, grammar', weight: 0.35, games: [] },
  { id: 'wales_lit_write', name: 'Writing', desc: 'Clarity, audience', weight: 0.25, games: [] },
];

export const WALES_LITERACY_QUESTIONS = [
  { id: 'wl1', comp: 'wales_lit_read', type: 'mc', difficulty: 1, q: 'A topic sentence states:', choices: ['the end of the paragraph', 'the main idea of the paragraph', 'only a detail', 'a question only'], answer: 'the main idea of the paragraph', explanation: 'Topic sentence introduces main idea.' },
  { id: 'wl2', comp: 'wales_lit_read', type: 'mc', difficulty: 2, q: 'Inference means:', choices: ['copying', 'drawing conclusions from evidence in the text', 'only literal meaning', 'guessing'], answer: 'drawing conclusions from evidence in the text', explanation: 'Inference = conclusions from text evidence.' },
  { id: 'wl3', comp: 'wales_lit_spag', type: 'mc', difficulty: 1, q: 'Correct: The pupils finished _____ work.', choices: ['they\'re', 'their', 'there'], answer: 'their', explanation: 'Their = possessive.' },
  { id: 'wl4', comp: 'wales_lit_spag', type: 'mc', difficulty: 2, q: 'Full stop is used to:', choices: ['separate list items', 'end a complete sentence', 'introduce a quote'], answer: 'end a complete sentence', explanation: 'Full stop ends a sentence.' },
  { id: 'wl5', comp: 'wales_lit_write', type: 'mc', difficulty: 1, q: 'Reports to parents should be:', choices: ['informal', 'clear and professional', 'very short only'], answer: 'clear and professional', explanation: 'Reports need clear, professional language.' },
  { id: 'wl6', comp: 'wales_lit_write', type: 'mc', difficulty: 2, q: 'Coherent writing has:', choices: ['no structure', 'logical flow and connections', 'only short sentences'], answer: 'logical flow and connections', explanation: 'Coherence = logical flow.' },
];

export const WALES_PROFESSIONAL_DOMAINS = [
  { id: 'wales_curr', name: 'Curriculum for Wales', desc: 'Four purposes, areas of learning', weight: 0.35, games: [] },
  { id: 'wales_safe', name: 'Safeguarding & Welfare', desc: 'Child protection', weight: 0.35, games: [] },
  { id: 'wales_stand', name: 'EWC & Professional Conduct', desc: 'Standards, registration', weight: 0.30, games: [] },
];

export const WALES_PROFESSIONAL_QUESTIONS = [
  { id: 'wp1', comp: 'wales_curr', type: 'mc', difficulty: 1, q: 'Curriculum for Wales is built around:', choices: ['only subjects', 'four purposes and areas of learning and experience', 'only English', 'no framework'], answer: 'four purposes and areas of learning and experience', explanation: 'CfW has four purposes and AoLEs.' },
  { id: 'wp2', comp: 'wales_curr', type: 'mc', difficulty: 2, q: 'The four purposes in Wales emphasise:', choices: ['only exams', 'ambitious capable learners, healthy confident individuals, enterprising contributors, ethical informed citizens', 'only literacy', 'no purposes'], answer: 'ambitious capable learners, healthy confident individuals, enterprising contributors, ethical informed citizens', explanation: 'Four purposes guide the curriculum.' },
  { id: 'wp3', comp: 'wales_safe', type: 'mc', difficulty: 1, q: 'Safeguarding in Welsh schools includes:', choices: ['only attendance', 'protecting children from harm and promoting welfare', 'only curriculum'], answer: 'protecting children from harm and promoting welfare', explanation: 'Safeguarding = protect and promote welfare.' },
  { id: 'wp4', comp: 'wales_safe', type: 'mc', difficulty: 2, q: 'A child protection concern should be:', choices: ['kept confidential', 'reported to the designated safeguarding person', 'only told to the child'], answer: 'reported to the designated safeguarding person', explanation: 'Report to designated person per policy.' },
  { id: 'wp5', comp: 'wales_stand', type: 'mc', difficulty: 1, q: 'EWC stands for:', choices: ['Education and Welfare Council', 'Education Workforce Council', 'English Welsh Curriculum', 'no such body'], answer: 'Education Workforce Council', explanation: 'EWC registers education practitioners in Wales.' },
  { id: 'wp6', comp: 'wales_stand', type: 'mc', difficulty: 2, q: 'Professional standards in Wales set out:', choices: ['only subject knowledge', 'expectations for conduct and practice', 'only for NQTs'], answer: 'expectations for conduct and practice', explanation: 'Standards define conduct and practice.' },
];

export const WALES_TEST_CONFIG = {
  numeracy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { wales_num: 16, wales_data: 14, wales_problem: 10 } },
  literacy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { wales_lit_read: 16, wales_lit_spag: 14, wales_lit_write: 10 } },
  professional: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { wales_curr: 14, wales_safe: 14, wales_stand: 12 } },
};

export function getWalesQuestionsForExam(examId) {
  const map = { numeracy: WALES_NUMERACY_QUESTIONS, literacy: WALES_LITERACY_QUESTIONS, professional: WALES_PROFESSIONAL_QUESTIONS };
  return map[examId] || WALES_NUMERACY_QUESTIONS;
}

export function getWalesDomainsForExam(examId) {
  const map = { numeracy: WALES_NUMERACY_DOMAINS, literacy: WALES_LITERACY_DOMAINS, professional: WALES_PROFESSIONAL_DOMAINS };
  return map[examId] || WALES_NUMERACY_DOMAINS;
}
