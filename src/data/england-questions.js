/**
 * England teacher certification prep — QTS / professional skills style.
 * Numeracy, Literacy, Professional Knowledge. Same structure as other prep for TestPrepPage.
 */

// ─── Numeracy (QTS-style) ───
export const ENGLAND_NUMERACY_DOMAINS = [
  { id: 'eng_num_number', name: 'Number & Mental Strategies', desc: 'Arithmetic, percentages, ratios', weight: 0.40, games: ['math-sprint', 'q-blocks', 'fraction-pizza'] },
  { id: 'eng_num_data', name: 'Data & Statistics', desc: 'Charts, averages, interpreting data', weight: 0.35, games: ['graph-explorer', 'math-jeopardy'] },
  { id: 'eng_num_problem', name: 'Problem Solving', desc: 'Multi-step, reasoning, context', weight: 0.25, games: ['math-sprint', 'equation-balance'] },
];

export const ENGLAND_NUMERACY_QUESTIONS = [
  { id: 'en1', comp: 'eng_num_number', type: 'mc', difficulty: 1, q: 'What is 15% of 80?', choices: ['10', '12', '15', '18'], answer: '12', explanation: '0.15 × 80 = 12.' },
  { id: 'en2', comp: 'eng_num_number', type: 'mc', difficulty: 2, q: 'A class of 28 has 7 absent. What fraction are present?', choices: ['1/4', '3/4', '7/28', '1/7'], answer: '3/4', explanation: '21 present out of 28 = 21/28 = 3/4.' },
  { id: 'en3', comp: 'eng_num_number', type: 'mc', difficulty: 1, q: 'Simplify: 3/5 + 1/5', choices: ['4/10', '4/5', '2/5', '3/10'], answer: '4/5', explanation: '3/5 + 1/5 = 4/5.' },
  { id: 'en4', comp: 'eng_num_data', type: 'mc', difficulty: 1, q: 'Mean of 4, 6, 8, 10, 12?', choices: ['6', '7', '8', '10'], answer: '8', explanation: '(4+6+8+10+12)/5 = 40/5 = 8.' },
  { id: 'en5', comp: 'eng_num_data', type: 'mc', difficulty: 2, q: 'A pie chart shows 90° for one category. What percentage is that?', choices: ['9%', '25%', '90%', '50%'], answer: '25%', explanation: '90/360 = 1/4 = 25%.' },
  { id: 'en6', comp: 'eng_num_problem', type: 'mc', difficulty: 2, q: 'Books cost £3.50 each. Budget is £28. Maximum number that can be bought?', choices: ['7', '8', '9', '10'], answer: '8', explanation: '28 ÷ 3.50 = 8.' },
];

// ─── Literacy (QTS-style) ───
export const ENGLAND_LITERACY_DOMAINS = [
  { id: 'eng_lit_comprehension', name: 'Reading & Comprehension', desc: 'Main idea, inference, purpose', weight: 0.40, games: [] },
  { id: 'eng_lit_spag', name: 'Spelling, Punctuation & Grammar', desc: 'SPaG, sentence structure', weight: 0.35, games: [] },
  { id: 'eng_lit_writing', name: 'Writing & Communication', desc: 'Clarity, audience, structure', weight: 0.25, games: [] },
];

export const ENGLAND_LITERACY_QUESTIONS = [
  { id: 'el1', comp: 'eng_lit_comprehension', type: 'mc', difficulty: 1, q: 'The main purpose of a topic sentence is to:', choices: ['end the paragraph', 'state the main idea of the paragraph', 'list evidence only', 'ask a question'], answer: 'state the main idea of the paragraph', explanation: 'Topic sentence introduces the paragraph’s main idea.' },
  { id: 'el2', comp: 'eng_lit_comprehension', type: 'mc', difficulty: 2, q: 'Inference in reading means:', choices: ['copying the text', 'drawing conclusions from evidence in the text', 'ignoring the text', 'only literal facts'], answer: 'drawing conclusions from evidence in the text', explanation: 'Inference = conclusions based on what is stated or implied.' },
  { id: 'el3', comp: 'eng_lit_spag', type: 'mc', difficulty: 1, q: 'Which is correct?', choices: ['Their going to the school', 'They\'re going to the school', 'There going to the school', 'They are going to the school (both correct with They\'re)'], answer: 'They\'re going to the school', explanation: 'They\'re = they are. Their = possessive. There = place.' },
  { id: 'el4', comp: 'eng_lit_spag', type: 'mc', difficulty: 2, q: 'A comma is used correctly to:', choices: ['join two independent clauses without a conjunction', 'separate items in a list', 'replace a full stop', 'start a sentence'], answer: 'separate items in a list', explanation: 'Commas separate list items; two main clauses need a conjunction or semicolon.' },
  { id: 'el5', comp: 'eng_lit_writing', type: 'mc', difficulty: 1, q: 'Formal writing for school reports should typically:', choices: ['use slang', 'be clear, accurate, and professional', 'avoid all punctuation', 'use only bullet points'], answer: 'be clear, accurate, and professional', explanation: 'Reports require clear, accurate, professional language.' },
  { id: 'el6', comp: 'eng_lit_writing', type: 'mc', difficulty: 2, q: 'Audience in writing refers to:', choices: ['only the teacher', 'who will read the text and their needs', 'only parents', 'the curriculum'], answer: 'who will read the text and their needs', explanation: 'Audience = intended readers; writing is adapted to them.' },
];

// ─── Professional Knowledge (QTS / ECT) ───
export const ENGLAND_PROFESSIONAL_DOMAINS = [
  { id: 'eng_prof_curriculum', name: 'National Curriculum & Teaching', desc: 'Curriculum, pedagogy, assessment', weight: 0.35, games: [] },
  { id: 'eng_prof_safeguarding', name: 'Safeguarding & Welfare', desc: 'Child protection, wellbeing', weight: 0.35, games: [] },
  { id: 'eng_prof_behavior', name: 'Behaviour & Professional Conduct', desc: 'Behaviour, standards, ECT', weight: 0.30, games: [] },
];

export const ENGLAND_PROFESSIONAL_QUESTIONS = [
  { id: 'ep1', comp: 'eng_prof_curriculum', type: 'mc', difficulty: 1, q: 'The National Curriculum in England sets out:', choices: ['only optional content', 'programmes of study and attainment targets by key stage', 'only for secondary', 'no assessment'], answer: 'programmes of study and attainment targets by key stage', explanation: 'National Curriculum defines what should be taught and expected.' },
  { id: 'ep2', comp: 'eng_prof_curriculum', type: 'mc', difficulty: 2, q: 'Formative assessment (Assessment for Learning) is used to:', choices: ['only report to parents', 'inform teaching and next steps during learning', 'replace summative assessment', 'set grades only'], answer: 'inform teaching and next steps during learning', explanation: 'AfL provides feedback to improve learning and teaching.' },
  { id: 'ep3', comp: 'eng_prof_safeguarding', type: 'mc', difficulty: 1, q: 'Safeguarding in schools includes:', choices: ['only attendance', 'protecting children from harm and promoting welfare', 'only curriculum', 'only after school'], answer: 'protecting children from harm and promoting welfare', explanation: 'Safeguarding = protecting from harm and promoting welfare.' },
  { id: 'ep4', comp: 'eng_prof_safeguarding', type: 'mc', difficulty: 2, q: 'If you have a concern about a child\'s welfare, you should:', choices: ['keep it confidential and do nothing', 'follow school policy and report to the designated safeguarding lead', 'only tell the child', 'wait for proof'], answer: 'follow school policy and report to the designated safeguarding lead', explanation: 'Concerns must be reported to the DSL; do not investigate alone.' },
  { id: 'ep5', comp: 'eng_prof_behavior', type: 'mc', difficulty: 1, q: 'The Teacher Standards in England set out:', choices: ['only subject knowledge', 'expectations for conduct and teaching (Part 1 and Part 2)', 'only for trainees', 'no behaviour expectations'], answer: 'expectations for conduct and teaching (Part 1 and Part 2)', explanation: 'Teacher Standards define conduct and professional practice.' },
  { id: 'ep6', comp: 'eng_prof_behavior', type: 'mc', difficulty: 2, q: 'ECT (Early Career Teacher) induction typically lasts:', choices: ['one term', 'one year', 'two years', 'no induction'], answer: 'two years', explanation: 'In England, ECT induction is normally a two-year programme.' },
];

// ─── Test configs ───
export const ENGLAND_TEST_CONFIG = {
  numeracy: { totalQuestions: 28, timeMinutes: 45, passingScore: 0.63, categoryDistribution: { eng_num_number: 11, eng_num_data: 10, eng_num_problem: 7 } },
  literacy: { totalQuestions: 28, timeMinutes: 45, passingScore: 0.63, categoryDistribution: { eng_lit_comprehension: 11, eng_lit_spag: 10, eng_lit_writing: 7 } },
  professional: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { eng_prof_curriculum: 14, eng_prof_safeguarding: 14, eng_prof_behavior: 12 } },
};

export function getEnglandQuestionsForExam(examId) {
  const map = {
    numeracy: ENGLAND_NUMERACY_QUESTIONS,
    literacy: ENGLAND_LITERACY_QUESTIONS,
    professional: ENGLAND_PROFESSIONAL_QUESTIONS,
  };
  return map[examId] || ENGLAND_NUMERACY_QUESTIONS;
}

export function getEnglandDomainsForExam(examId) {
  const map = {
    numeracy: ENGLAND_NUMERACY_DOMAINS,
    literacy: ENGLAND_LITERACY_DOMAINS,
    professional: ENGLAND_PROFESSIONAL_DOMAINS,
  };
  return map[examId] || ENGLAND_NUMERACY_DOMAINS;
}
