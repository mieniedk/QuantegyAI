/**
 * Kenya teacher certification prep — TSC, curriculum (CBC).
 * Numeracy, Literacy, Professional Knowledge. Same structure as other prep for TestPrepPage.
 */

export const KENYA_NUMERACY_DOMAINS = [
  { id: 'ke_num', name: 'Number & Algebra', desc: 'Arithmetic, percentages', weight: 0.40, games: ['math-sprint', 'q-blocks'] },
  { id: 'ke_data', name: 'Data & Statistics', desc: 'Charts, averages', weight: 0.35, games: ['graph-explorer'] },
  { id: 'ke_problem', name: 'Problem Solving', desc: 'Multi-step, reasoning', weight: 0.25, games: ['math-sprint'] },
];

export const KENYA_NUMERACY_QUESTIONS = [
  { id: 'ke1', comp: 'ke_num', type: 'mc', difficulty: 1, q: 'What is 20% of 150?', choices: ['25', '30', '35', '40'], answer: '30', explanation: '0.20 × 150 = 30.' },
  { id: 'ke2', comp: 'ke_num', type: 'mc', difficulty: 2, q: 'A ratio 2:3, total 50. Larger part?', choices: ['20', '25', '30', '35'], answer: '30', explanation: '3/5 × 50 = 30.' },
  { id: 'ke3', comp: 'ke_data', type: 'mc', difficulty: 1, q: 'Mean of 5, 10, 15, 20, 25?', choices: ['12', '15', '17', '20'], answer: '15', explanation: '(5+10+15+20+25)/5 = 15.' },
  { id: 'ke4', comp: 'ke_data', type: 'mc', difficulty: 2, q: 'In a class of 45, 40% are girls. How many girls?', choices: ['16', '18', '20', '22'], answer: '18', explanation: '0.40 × 45 = 18.' },
  { id: 'ke5', comp: 'ke_problem', type: 'mc', difficulty: 1, q: 'Perimeter of rectangle 12 m by 5 m?', choices: ['17 m', '34 m', '60 m', '30 m'], answer: '34 m', explanation: '2(12+5) = 34 m.' },
  { id: 'ke6', comp: 'ke_problem', type: 'mc', difficulty: 2, q: 'Solve: 3a + 5 = 20', choices: ['4', '5', '6', '7'], answer: '5', explanation: '3a = 15, a = 5.' },
];

export const KENYA_LITERACY_DOMAINS = [
  { id: 'ke_lit_read', name: 'Reading & Comprehension', desc: 'Main idea, inference', weight: 0.40, games: [] },
  { id: 'ke_lit_spag', name: 'SPaG', desc: 'Spelling, punctuation, grammar', weight: 0.35, games: [] },
  { id: 'ke_lit_write', name: 'Writing', desc: 'Clarity, audience', weight: 0.25, games: [] },
];

export const KENYA_LITERACY_QUESTIONS = [
  { id: 'kel1', comp: 'ke_lit_read', type: 'mc', difficulty: 1, q: 'Topic sentence states:', choices: ['the end', 'the main idea of the paragraph', 'only a detail'], answer: 'the main idea of the paragraph', explanation: 'Topic sentence introduces main idea.' },
  { id: 'kel2', comp: 'ke_lit_read', type: 'mc', difficulty: 2, q: 'Inference in reading is:', choices: ['copying', 'drawing conclusions from evidence', 'only literal'], answer: 'drawing conclusions from evidence', explanation: 'Inference = conclusions from evidence.' },
  { id: 'kel3', comp: 'ke_lit_spag', type: 'mc', difficulty: 1, q: 'Correct: _____ going to school.', choices: ['Their', 'They\'re', 'There'], answer: 'They\'re', explanation: 'They\'re = they are.' },
  { id: 'kel4', comp: 'ke_lit_spag', type: 'mc', difficulty: 2, q: 'Comma is used correctly to:', choices: ['join two independent clauses without conjunction', 'separate items in a list', 'end sentence'], answer: 'separate items in a list', explanation: 'Commas separate list items.' },
  { id: 'kel5', comp: 'ke_lit_write', type: 'mc', difficulty: 1, q: 'School reports should be:', choices: ['informal', 'clear and professional', 'very brief only'], answer: 'clear and professional', explanation: 'Reports need clear language.' },
  { id: 'kel6', comp: 'ke_lit_write', type: 'mc', difficulty: 2, q: 'Audience in writing is:', choices: ['only teacher', 'who will read and their needs', 'curriculum'], answer: 'who will read and their needs', explanation: 'Audience = intended readers.' },
];

export const KENYA_PROFESSIONAL_DOMAINS = [
  { id: 'ke_curr', name: 'CBC & Curriculum', desc: 'Competency-based curriculum, pedagogy', weight: 0.35, games: [] },
  { id: 'ke_safe', name: 'Child Protection & Welfare', desc: 'Safeguarding, reporting', weight: 0.35, games: [] },
  { id: 'ke_stand', name: 'TSC & Professional Conduct', desc: 'Registration, standards', weight: 0.30, games: [] },
];

export const KENYA_PROFESSIONAL_QUESTIONS = [
  { id: 'kep1', comp: 'ke_curr', type: 'mc', difficulty: 1, q: 'CBC in Kenya stands for:', choices: ['Central Board of Curriculum', 'Competency Based Curriculum', 'Certificate Based Course', 'no such programme'], answer: 'Competency Based Curriculum', explanation: 'CBC emphasises competencies and skills.' },
  { id: 'kep2', comp: 'ke_curr', type: 'mc', difficulty: 2, q: 'Formative assessment in CBC is used to:', choices: ['only grade', 'inform teaching and support learning', 'replace summative', 'rank only'], answer: 'inform teaching and support learning', explanation: 'Formative assessment guides teaching.' },
  { id: 'kep3', comp: 'ke_safe', type: 'mc', difficulty: 1, q: 'Child protection in Kenyan schools includes:', choices: ['only attendance', 'protecting children from harm and promoting welfare', 'only curriculum'], answer: 'protecting children from harm and promoting welfare', explanation: 'Child protection = protect and promote welfare.' },
  { id: 'kep4', comp: 'ke_safe', type: 'mc', difficulty: 2, q: 'A child protection concern should be:', choices: ['kept confidential', 'reported to the designated person or authority', 'only told to the child'], answer: 'reported to the designated person or authority', explanation: 'Report per school policy and law.' },
  { id: 'kep5', comp: 'ke_stand', type: 'mc', difficulty: 1, q: 'TSC in Kenya stands for:', choices: ['Teachers Service Commission', 'Teaching Standards Council', 'Teacher Support Committee', 'no such body'], answer: 'Teachers Service Commission', explanation: 'TSC employs and regulates teachers in public service.' },
  { id: 'kep6', comp: 'ke_stand', type: 'mc', difficulty: 2, q: 'Professional teacher standards in Kenya include:', choices: ['only subject knowledge', 'ethics, conduct, and professional practice', 'only for trainees'], answer: 'ethics, conduct, and professional practice', explanation: 'Standards cover ethics and practice.' },
];

export const KENYA_TEST_CONFIG = {
  numeracy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.50, categoryDistribution: { ke_num: 16, ke_data: 14, ke_problem: 10 } },
  literacy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.50, categoryDistribution: { ke_lit_read: 16, ke_lit_spag: 14, ke_lit_write: 10 } },
  professional: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.50, categoryDistribution: { ke_curr: 14, ke_safe: 14, ke_stand: 12 } },
};

export function getKenyaQuestionsForExam(examId) {
  const map = { numeracy: KENYA_NUMERACY_QUESTIONS, literacy: KENYA_LITERACY_QUESTIONS, professional: KENYA_PROFESSIONAL_QUESTIONS };
  return map[examId] || KENYA_NUMERACY_QUESTIONS;
}

export function getKenyaDomainsForExam(examId) {
  const map = { numeracy: KENYA_NUMERACY_DOMAINS, literacy: KENYA_LITERACY_DOMAINS, professional: KENYA_PROFESSIONAL_DOMAINS };
  return map[examId] || KENYA_NUMERACY_DOMAINS;
}
