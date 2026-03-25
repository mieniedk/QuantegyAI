/**
 * New Zealand teacher certification prep — literacy, numeracy & professional knowledge.
 * Aligned with Teaching Council requirements. Same structure as other prep for TestPrepPage.
 */

// ─── Numeracy ───
export const NEWZEALAND_NUMERACY_DOMAINS = [
  { id: 'nz_num_number', name: 'Number & Algebra', desc: 'Arithmetic, percentages, ratios', weight: 0.40, games: ['math-sprint', 'q-blocks', 'fraction-pizza'] },
  { id: 'nz_num_data', name: 'Statistics & Data', desc: 'Charts, averages, interpreting data', weight: 0.35, games: ['graph-explorer', 'math-jeopardy'] },
  { id: 'nz_num_problem', name: 'Problem Solving', desc: 'Multi-step, measurement, context', weight: 0.25, games: ['math-sprint', 'equation-balance'] },
];

export const NEWZEALAND_NUMERACY_QUESTIONS = [
  { id: 'nz1', comp: 'nz_num_number', type: 'mc', difficulty: 1, q: 'What is 25% of 80?', choices: ['18', '20', '22', '25'], answer: '20', explanation: '0.25 × 80 = 20.' },
  { id: 'nz2', comp: 'nz_num_number', type: 'mc', difficulty: 2, q: 'A mix is 2 parts flour to 3 parts sugar. For 15 parts total, how many parts sugar?', choices: ['5', '6', '9', '10'], answer: '9', explanation: '3/(2+3) × 15 = 3/5 × 15 = 9.' },
  { id: 'nz3', comp: 'nz_num_number', type: 'mc', difficulty: 1, q: 'Simplify: 5/6 − 1/6', choices: ['4/6', '2/3', '4/12', '6/6'], answer: '2/3', explanation: '5/6 − 1/6 = 4/6 = 2/3.' },
  { id: 'nz4', comp: 'nz_num_data', type: 'mc', difficulty: 1, q: 'Mean of 10, 20, 30, 40?', choices: ['20', '25', '30', '100'], answer: '25', explanation: '(10+20+30+40)/4 = 100/4 = 25.' },
  { id: 'nz5', comp: 'nz_num_data', type: 'mc', difficulty: 2, q: 'A bar graph shows 24 students chose option A out of 80. What angle would that be on a pie chart?', choices: ['24°', '108°', '80°', '30°'], answer: '108°', explanation: '24/80 = 30%; 0.30 × 360 = 108°.' },
  { id: 'nz6', comp: 'nz_num_problem', type: 'mc', difficulty: 2, q: 'A classroom is 9 m by 6 m. Area in m²?', choices: ['15', '30', '54', '54 m'], answer: '54', explanation: '9 × 6 = 54 m².' },
];

// ─── Literacy ───
export const NEWZEALAND_LITERACY_DOMAINS = [
  { id: 'nz_lit_comprehension', name: 'Reading & Comprehension', desc: 'Main idea, inference, purpose', weight: 0.40, games: [] },
  { id: 'nz_lit_grammar', name: 'Grammar & Punctuation', desc: 'Sentence structure, clarity', weight: 0.35, games: [] },
  { id: 'nz_lit_writing', name: 'Writing & Communication', desc: 'Audience, structure, reports', weight: 0.25, games: [] },
];

export const NEWZEALAND_LITERACY_QUESTIONS = [
  { id: 'nzl1', comp: 'nz_lit_comprehension', type: 'mc', difficulty: 1, q: 'Identifying the main idea of a passage helps the reader to:', choices: ['memorise every word', 'understand the central point or purpose', 'ignore details', 'skip paragraphs'], answer: 'understand the central point or purpose', explanation: 'Main idea = central point or purpose of the text.' },
  { id: 'nzl2', comp: 'nz_lit_comprehension', type: 'mc', difficulty: 2, q: 'When a text implies something without stating it directly, the reader is using:', choices: ['literal reading only', 'inference', 'skimming', 'no strategy'], answer: 'inference', explanation: 'Inference = drawing conclusions from what is implied.' },
  { id: 'nzl3', comp: 'nz_lit_grammar', type: 'mc', difficulty: 1, q: 'Which is correct?', choices: ['Its a beautiful day', 'It\'s a beautiful day', 'Its\' a beautiful day', 'It is a beautiful day (only this form)'], answer: 'It\'s a beautiful day', explanation: 'It\'s = it is. Its = possessive (no apostrophe).' },
  { id: 'nzl4', comp: 'nz_lit_grammar', type: 'mc', difficulty: 2, q: 'A semicolon is correctly used to:', choices: ['introduce a list', 'link two closely related independent clauses', 'replace a comma in a list', 'end a question'], answer: 'link two closely related independent clauses', explanation: 'Semicolon connects two complete sentences that are closely related.' },
  { id: 'nzl5', comp: 'nz_lit_writing', type: 'mc', difficulty: 1, q: 'Writing for whānau and parents should be:', choices: ['very informal', 'clear, respectful, and appropriate to audience', 'only in te reo', 'only bullet points'], answer: 'clear, respectful, and appropriate to audience', explanation: 'Communication with whānau should be clear and respectful.' },
  { id: 'nzl6', comp: 'nz_lit_writing', type: 'mc', difficulty: 2, q: 'Paragraph structure typically includes:', choices: ['no organisation', 'a main idea (topic sentence) and supporting details', 'only questions', 'one sentence only'], answer: 'a main idea (topic sentence) and supporting details', explanation: 'Paragraphs usually have a topic sentence and supporting sentences.' },
];

// ─── Professional Knowledge (NZ Curriculum, Te Tiriti, Our Code Our Standards) ───
export const NEWZEALAND_PROFESSIONAL_DOMAINS = [
  { id: 'nz_prof_curriculum', name: 'NZ Curriculum & Teaching', desc: 'Curriculum, pedagogy, differentiation', weight: 0.35, games: [] },
  { id: 'nz_prof_tiriti', name: 'Te Tiriti & Cultural Responsiveness', desc: 'Te Tiriti o Waitangi, te reo, Māori learners', weight: 0.30, games: [] },
  { id: 'nz_prof_conduct', name: 'Professional Standards & Child Safety', desc: 'Our Code Our Standards, safeguarding', weight: 0.35, games: [] },
];

export const NEWZEALAND_PROFESSIONAL_QUESTIONS = [
  { id: 'nzp1', comp: 'nz_prof_curriculum', type: 'mc', difficulty: 1, q: 'The New Zealand Curriculum is based on:', choices: ['only subject content', 'vision, values, key competencies, and learning areas', 'only assessment', 'no framework'], answer: 'vision, values, key competencies, and learning areas', explanation: 'NZ Curriculum has vision, values, competencies, and learning areas.' },
  { id: 'nzp2', comp: 'nz_prof_curriculum', type: 'mc', difficulty: 2, q: 'Key competencies in the NZ Curriculum include:', choices: ['only literacy and numeracy', 'thinking, using language and symbols, managing self, relating to others, participating and contributing', 'only digital', 'no competencies'], answer: 'thinking, using language and symbols, managing self, relating to others, participating and contributing', explanation: 'These five key competencies are central to the NZ Curriculum.' },
  { id: 'nzp3', comp: 'nz_prof_tiriti', type: 'mc', difficulty: 1, q: 'Te Tiriti o Waitangi is foundational to education in Aotearoa New Zealand because it:', choices: ['applies only to history', 'establishes a partnership and obligations that inform equitable education for Māori and all learners', 'applies only to Māori-medium settings', 'is optional'], answer: 'establishes a partnership and obligations that inform equitable education for Māori and all learners', explanation: 'Te Tiriti underpins obligations to Māori and all learners.' },
  { id: 'nzp4', comp: 'nz_prof_tiriti', type: 'mc', difficulty: 2, q: 'Culturally responsive practice in NZ schools includes:', choices: ['ignoring cultural identity', 'valuing and incorporating learners\' cultures, language, and identity', 'only for Māori learners', 'no change to teaching'], answer: 'valuing and incorporating learners\' cultures, language, and identity', explanation: 'Culturally responsive teaching honours and uses students\' cultures.' },
  { id: 'nzp5', comp: 'nz_prof_conduct', type: 'mc', difficulty: 1, q: 'Our Code Our Standards are set by:', choices: ['the Ministry only', 'the Teaching Council of Aotearoa New Zealand', 'each school', 'no body'], answer: 'the Teaching Council of Aotearoa New Zealand', explanation: 'Teaching Council sets the Code and Standards for the profession.' },
  { id: 'nzp6', comp: 'nz_prof_conduct', type: 'mc', difficulty: 2, q: 'If you have a concern about a child\'s safety or wellbeing in NZ, you should:', choices: ['keep it private', 'follow school policy and report to the appropriate person or Oranga Tamariki where required', 'only tell the child', 'wait for proof'], answer: 'follow school policy and report to the appropriate person or Oranga Tamariki where required', explanation: 'Schools have procedures; serious concerns may go to Oranga Tamariki.' },
];

// ─── Test configs ───
export const NEWZEALAND_TEST_CONFIG = {
  numeracy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { nz_num_number: 16, nz_num_data: 14, nz_num_problem: 10 } },
  literacy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { nz_lit_comprehension: 16, nz_lit_grammar: 14, nz_lit_writing: 10 } },
  professional: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { nz_prof_curriculum: 14, nz_prof_tiriti: 12, nz_prof_conduct: 14 } },
};

export function getNewZealandQuestionsForExam(examId) {
  const map = {
    numeracy: NEWZEALAND_NUMERACY_QUESTIONS,
    literacy: NEWZEALAND_LITERACY_QUESTIONS,
    professional: NEWZEALAND_PROFESSIONAL_QUESTIONS,
  };
  return map[examId] || NEWZEALAND_NUMERACY_QUESTIONS;
}

export function getNewZealandDomainsForExam(examId) {
  const map = {
    numeracy: NEWZEALAND_NUMERACY_DOMAINS,
    literacy: NEWZEALAND_LITERACY_DOMAINS,
    professional: NEWZEALAND_PROFESSIONAL_DOMAINS,
  };
  return map[examId] || NEWZEALAND_NUMERACY_DOMAINS;
}
