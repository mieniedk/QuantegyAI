/**
 * Northern Ireland teacher certification prep — GTCNI, curriculum.
 * Numeracy, Literacy, Professional Knowledge. Same structure as other prep for TestPrepPage.
 */

export const NI_NUMERACY_DOMAINS = [
  { id: 'ni_num', name: 'Number & Algebra', desc: 'Arithmetic, percentages', weight: 0.40, games: ['math-sprint', 'q-blocks'] },
  { id: 'ni_data', name: 'Data & Statistics', desc: 'Charts, averages', weight: 0.35, games: ['graph-explorer'] },
  { id: 'ni_problem', name: 'Problem Solving', desc: 'Multi-step, reasoning', weight: 0.25, games: ['math-sprint'] },
];

export const NI_NUMERACY_QUESTIONS = [
  { id: 'ni1', comp: 'ni_num', type: 'mc', difficulty: 1, q: 'What is 15% of 120?', choices: ['15', '18', '20', '25'], answer: '18', explanation: '0.15 × 120 = 18.' },
  { id: 'ni2', comp: 'ni_num', type: 'mc', difficulty: 2, q: 'A ratio 3:2, total 30. Smaller part?', choices: ['12', '15', '18', '20'], answer: '12', explanation: '2/5 × 30 = 12.' },
  { id: 'ni3', comp: 'ni_data', type: 'mc', difficulty: 1, q: 'Mean of 2, 4, 6, 8, 10?', choices: ['5', '6', '7', '8'], answer: '6', explanation: '(2+4+6+8+10)/5 = 6.' },
  { id: 'ni4', comp: 'ni_data', type: 'mc', difficulty: 2, q: 'Pie chart: 60° represents what fraction?', choices: ['1/6', '1/5', '1/4', '1/3'], answer: '1/6', explanation: '60/360 = 1/6.' },
  { id: 'ni5', comp: 'ni_problem', type: 'mc', difficulty: 1, q: 'Area of rectangle 7 m × 5 m?', choices: ['24 m²', '35 m²', '12 m²', '26 m²'], answer: '35 m²', explanation: '7 × 5 = 35 m².' },
  { id: 'ni6', comp: 'ni_problem', type: 'mc', difficulty: 2, q: 'Solve: 5y + 4 = 24', choices: ['3', '4', '5', '6'], answer: '4', explanation: '5y = 20, y = 4.' },
];

export const NI_LITERACY_DOMAINS = [
  { id: 'ni_lit_read', name: 'Reading & Comprehension', desc: 'Main idea, inference', weight: 0.40, games: [] },
  { id: 'ni_lit_spag', name: 'SPaG', desc: 'Spelling, punctuation, grammar', weight: 0.35, games: [] },
  { id: 'ni_lit_write', name: 'Writing', desc: 'Clarity, audience', weight: 0.25, games: [] },
];

export const NI_LITERACY_QUESTIONS = [
  { id: 'nil1', comp: 'ni_lit_read', type: 'mc', difficulty: 1, q: 'Main idea of a passage is:', choices: ['one detail', 'the central point or message', 'the first word', 'the title'], answer: 'the central point or message', explanation: 'Main idea = central message.' },
  { id: 'nil2', comp: 'ni_lit_read', type: 'mc', difficulty: 2, q: 'Inference in reading is:', choices: ['copying', 'drawing conclusions from text evidence', 'only literal', 'skipping'], answer: 'drawing conclusions from text evidence', explanation: 'Inference = conclusions from evidence.' },
  { id: 'nil3', comp: 'ni_lit_spag', type: 'mc', difficulty: 1, q: 'Correct: _____ going to the school.', choices: ['Their', 'They\'re', 'There'], answer: 'They\'re', explanation: 'They\'re = they are.' },
  { id: 'nil4', comp: 'ni_lit_spag', type: 'mc', difficulty: 2, q: 'Apostrophe shows:', choices: ['plural', 'possession or contraction', 'emphasis'], answer: 'possession or contraction', explanation: 'Apostrophe = ownership or contraction.' },
  { id: 'nil5', comp: 'ni_lit_write', type: 'mc', difficulty: 1, q: 'Formal report writing should be:', choices: ['informal', 'clear, accurate, professional', 'only bullet points'], answer: 'clear, accurate, professional', explanation: 'Reports need clear, professional language.' },
  { id: 'nil6', comp: 'ni_lit_write', type: 'mc', difficulty: 2, q: 'Paragraph structure includes:', choices: ['no organisation', 'topic sentence and supporting details', 'one sentence'], answer: 'topic sentence and supporting details', explanation: 'Paragraphs have main idea + support.' },
];

export const NI_PROFESSIONAL_DOMAINS = [
  { id: 'ni_curr', name: 'Northern Ireland Curriculum', desc: 'Curriculum, key stages', weight: 0.35, games: [] },
  { id: 'ni_safe', name: 'Safeguarding & Child Protection', desc: 'Welfare, reporting', weight: 0.35, games: [] },
  { id: 'ni_stand', name: 'GTCNI & Professional Conduct', desc: 'Registration, standards', weight: 0.30, games: [] },
];

export const NI_PROFESSIONAL_QUESTIONS = [
  { id: 'nip1', comp: 'ni_curr', type: 'mc', difficulty: 1, q: 'The Northern Ireland Curriculum is organised by:', choices: ['only subjects', 'areas of learning and key stages', 'only primary', 'no framework'], answer: 'areas of learning and key stages', explanation: 'NI Curriculum has areas of learning and key stages.' },
  { id: 'nip2', comp: 'ni_curr', type: 'mc', difficulty: 2, q: 'Formative assessment is used to:', choices: ['only grade', 'inform teaching and learning during instruction', 'replace summative', 'rank only'], answer: 'inform teaching and learning during instruction', explanation: 'Assessment for Learning guides teaching.' },
  { id: 'nip3', comp: 'ni_safe', type: 'mc', difficulty: 1, q: 'Safeguarding means:', choices: ['only attendance', 'protecting children from harm and promoting welfare', 'only curriculum'], answer: 'protecting children from harm and promoting welfare', explanation: 'Safeguarding = protect and promote welfare.' },
  { id: 'nip4', comp: 'ni_safe', type: 'mc', difficulty: 2, q: 'Child protection concern: you should', choices: ['keep confidential', 'report to designated safeguarding lead', 'only tell child'], answer: 'report to designated safeguarding lead', explanation: 'Report to DSL per policy.' },
  { id: 'nip5', comp: 'ni_stand', type: 'mc', difficulty: 1, q: 'GTCNI is the:', choices: ['General Teaching Council for Northern Ireland', 'Government Teaching body', 'only for principals'], answer: 'General Teaching Council for Northern Ireland', explanation: 'GTCNI registers teachers in NI.' },
  { id: 'nip6', comp: 'ni_stand', type: 'mc', difficulty: 2, q: 'Professional standards in NI include:', choices: ['only subject knowledge', 'professional values and practice', 'only for ECTs'], answer: 'professional values and practice', explanation: 'Standards cover values and practice.' },
];

export const NI_TEST_CONFIG = {
  numeracy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { ni_num: 16, ni_data: 14, ni_problem: 10 } },
  literacy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { ni_lit_read: 16, ni_lit_spag: 14, ni_lit_write: 10 } },
  professional: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { ni_curr: 14, ni_safe: 14, ni_stand: 12 } },
};

export function getNorthernIrelandQuestionsForExam(examId) {
  const map = { numeracy: NI_NUMERACY_QUESTIONS, literacy: NI_LITERACY_QUESTIONS, professional: NI_PROFESSIONAL_QUESTIONS };
  return map[examId] || NI_NUMERACY_QUESTIONS;
}

export function getNorthernIrelandDomainsForExam(examId) {
  const map = { numeracy: NI_NUMERACY_DOMAINS, literacy: NI_LITERACY_DOMAINS, professional: NI_PROFESSIONAL_DOMAINS };
  return map[examId] || NI_NUMERACY_DOMAINS;
}
