/**
 * Ghana teacher certification prep — NTC (National Teaching Council), curriculum.
 * Numeracy, Literacy, Professional Knowledge. Same structure as other prep for TestPrepPage.
 */

export const GHANA_NUMERACY_DOMAINS = [
  { id: 'gh_num', name: 'Number & Algebra', desc: 'Arithmetic, percentages', weight: 0.40, games: ['math-sprint', 'q-blocks'] },
  { id: 'gh_data', name: 'Data & Statistics', desc: 'Charts, averages', weight: 0.35, games: ['graph-explorer'] },
  { id: 'gh_problem', name: 'Problem Solving', desc: 'Multi-step, reasoning', weight: 0.25, games: ['math-sprint'] },
];

export const GHANA_NUMERACY_QUESTIONS = [
  { id: 'gh1', comp: 'gh_num', type: 'mc', difficulty: 1, q: 'What is 30% of 100?', choices: ['25', '30', '35', '40'], answer: '30', explanation: '0.30 × 100 = 30.' },
  { id: 'gh2', comp: 'gh_num', type: 'mc', difficulty: 2, q: 'Simplify: 3/8 + 2/8', choices: ['5/16', '5/8', '1/2', '6/8'], answer: '5/8', explanation: '3/8 + 2/8 = 5/8.' },
  { id: 'gh3', comp: 'gh_data', type: 'mc', difficulty: 1, q: 'Median of 2, 4, 6, 8, 10?', choices: ['4', '5', '6', '8'], answer: '6', explanation: 'Middle value is 6.' },
  { id: 'gh4', comp: 'gh_data', type: 'mc', difficulty: 2, q: 'In a class of 35, 20% got grade A. How many?', choices: ['5', '7', '10', '14'], answer: '7', explanation: '0.20 × 35 = 7.' },
  { id: 'gh5', comp: 'gh_problem', type: 'mc', difficulty: 1, q: 'Area of square with side 6 cm?', choices: ['12 cm²', '24 cm²', '36 cm²', '30 cm²'], answer: '36 cm²', explanation: '6 × 6 = 36 cm².' },
  { id: 'gh6', comp: 'gh_problem', type: 'mc', difficulty: 2, q: 'Solve: 4b − 3 = 17', choices: ['4', '5', '6', '7'], answer: '5', explanation: '4b = 20, b = 5.' },
];

export const GHANA_LITERACY_DOMAINS = [
  { id: 'gh_lit_read', name: 'Reading & Comprehension', desc: 'Main idea, inference', weight: 0.40, games: [] },
  { id: 'gh_lit_spag', name: 'SPaG', desc: 'Spelling, punctuation, grammar', weight: 0.35, games: [] },
  { id: 'gh_lit_write', name: 'Writing', desc: 'Clarity, audience', weight: 0.25, games: [] },
];

export const GHANA_LITERACY_QUESTIONS = [
  { id: 'ghl1', comp: 'gh_lit_read', type: 'mc', difficulty: 1, q: 'Main idea of a passage is:', choices: ['one detail', 'the central point or message', 'the title only'], answer: 'the central point or message', explanation: 'Main idea = central message.' },
  { id: 'ghl2', comp: 'gh_lit_read', type: 'mc', difficulty: 2, q: 'Inference means:', choices: ['copying', 'drawing conclusions from evidence', 'only literal'], answer: 'drawing conclusions from evidence', explanation: 'Inference = conclusions from evidence.' },
  { id: 'ghl3', comp: 'gh_lit_spag', type: 'mc', difficulty: 1, q: 'Correct: The pupils completed _____ work.', choices: ['they\'re', 'their', 'there'], answer: 'their', explanation: 'Their = possessive.' },
  { id: 'ghl4', comp: 'gh_lit_spag', type: 'mc', difficulty: 2, q: 'Apostrophe shows:', choices: ['plural', 'possession or contraction', 'emphasis'], answer: 'possession or contraction', explanation: 'Apostrophe = ownership or contraction.' },
  { id: 'ghl5', comp: 'gh_lit_write', type: 'mc', difficulty: 1, q: 'Reports to parents should be:', choices: ['informal', 'clear and professional', 'very short only'], answer: 'clear and professional', explanation: 'Reports need clear language.' },
  { id: 'ghl6', comp: 'gh_lit_write', type: 'mc', difficulty: 2, q: 'Paragraph structure includes:', choices: ['no organisation', 'topic sentence and supporting details', 'one sentence'], answer: 'topic sentence and supporting details', explanation: 'Paragraphs have main idea + support.' },
];

export const GHANA_PROFESSIONAL_DOMAINS = [
  { id: 'gh_curr', name: 'Curriculum & Teaching', desc: 'National curriculum, pedagogy', weight: 0.35, games: [] },
  { id: 'gh_inclusive', name: 'Inclusive Education', desc: 'Inclusion, diversity', weight: 0.30, games: [] },
  { id: 'gh_stand', name: 'NTC & Professional Conduct', desc: 'Licensure, ethics', weight: 0.35, games: [] },
];

export const GHANA_PROFESSIONAL_QUESTIONS = [
  { id: 'ghp1', comp: 'gh_curr', type: 'mc', difficulty: 1, q: 'NTC in Ghana stands for:', choices: ['National Training Council', 'National Teaching Council', 'National Teachers Committee', 'no such body'], answer: 'National Teaching Council', explanation: 'NTC licenses and regulates teachers in Ghana.' },
  { id: 'ghp2', comp: 'gh_curr', type: 'mc', difficulty: 2, q: 'Formative assessment is used to:', choices: ['only grade', 'inform teaching and learning during instruction', 'replace summative', 'rank only'], answer: 'inform teaching and learning during instruction', explanation: 'Formative assessment guides teaching.' },
  { id: 'ghp3', comp: 'gh_inclusive', type: 'mc', difficulty: 1, q: 'Inclusive education aims to:', choices: ['separate by ability', 'enable all learners to participate and succeed', 'only high achievers'], answer: 'enable all learners to participate and succeed', explanation: 'Inclusion = all learners with support.' },
  { id: 'ghp4', comp: 'gh_inclusive', type: 'mc', difficulty: 2, q: 'Differentiation supports:', choices: ['same for all', 'diverse learning needs and strengths', 'only one method'], answer: 'diverse learning needs and strengths', explanation: 'Differentiation addresses varied needs.' },
  { id: 'ghp5', comp: 'gh_stand', type: 'mc', difficulty: 1, q: 'Teacher licensure in Ghana is overseen by:', choices: ['Ministry only', 'National Teaching Council (NTC)', 'each school', 'no body'], answer: 'National Teaching Council (NTC)', explanation: 'NTC is responsible for teacher licensure.' },
  { id: 'ghp6', comp: 'gh_stand', type: 'mc', difficulty: 2, q: 'If you have a child protection concern, you should:', choices: ['keep confidential', 'follow school policy and report to the designated authority', 'only tell the child'], answer: 'follow school policy and report to the designated authority', explanation: 'Report per policy and law.' },
];

export const GHANA_TEST_CONFIG = {
  numeracy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.50, categoryDistribution: { gh_num: 16, gh_data: 14, gh_problem: 10 } },
  literacy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.50, categoryDistribution: { gh_lit_read: 16, gh_lit_spag: 14, gh_lit_write: 10 } },
  professional: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.50, categoryDistribution: { gh_curr: 14, gh_inclusive: 12, gh_stand: 14 } },
};

export function getGhanaQuestionsForExam(examId) {
  const map = { numeracy: GHANA_NUMERACY_QUESTIONS, literacy: GHANA_LITERACY_QUESTIONS, professional: GHANA_PROFESSIONAL_QUESTIONS };
  return map[examId] || GHANA_NUMERACY_QUESTIONS;
}

export function getGhanaDomainsForExam(examId) {
  const map = { numeracy: GHANA_NUMERACY_DOMAINS, literacy: GHANA_LITERACY_DOMAINS, professional: GHANA_PROFESSIONAL_DOMAINS };
  return map[examId] || GHANA_NUMERACY_DOMAINS;
}
