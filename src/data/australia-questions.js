/**
 * Australia teacher certification prep — LANTITE-style & professional knowledge.
 * Numeracy, Literacy, Professional Knowledge. Same structure as other prep for TestPrepPage.
 */

// ─── Numeracy (LANTITE-style) ───
export const AUSTRALIA_NUMERACY_DOMAINS = [
  { id: 'au_num_number', name: 'Number & Algebra', desc: 'Arithmetic, percentages, ratios, basic algebra', weight: 0.40, games: ['math-sprint', 'q-blocks', 'fraction-pizza'] },
  { id: 'au_num_data', name: 'Statistics & Probability', desc: 'Data, charts, averages, chance', weight: 0.35, games: ['graph-explorer', 'math-jeopardy'] },
  { id: 'au_num_problem', name: 'Measurement & Problem Solving', desc: 'Units, geometry, multi-step problems', weight: 0.25, games: ['math-sprint', 'equation-balance'] },
];

export const AUSTRALIA_NUMERACY_QUESTIONS = [
  { id: 'au1', comp: 'au_num_number', type: 'mc', difficulty: 1, q: 'What is 20% of 150?', choices: ['25', '30', '35', '40'], answer: '30', explanation: '0.20 × 150 = 30.' },
  { id: 'au2', comp: 'au_num_number', type: 'mc', difficulty: 2, q: 'A ratio of 2:3 is equivalent to:', choices: ['4:5', '4:6', '3:2', '6:4'], answer: '4:6', explanation: '2:3 = 4:6 (both parts multiplied by 2).' },
  { id: 'au3', comp: 'au_num_number', type: 'mc', difficulty: 1, q: 'Solve: 2x + 5 = 15', choices: ['4', '5', '6', '10'], answer: '5', explanation: '2x = 10, x = 5.' },
  { id: 'au4', comp: 'au_num_data', type: 'mc', difficulty: 1, q: 'Median of 3, 5, 7, 9, 11?', choices: ['5', '6', '7', '9'], answer: '7', explanation: 'Middle value of ordered set is 7.' },
  { id: 'au5', comp: 'au_num_data', type: 'mc', difficulty: 2, q: 'In a class, 12 of 30 students are boys. What percentage are girls?', choices: ['40%', '50%', '60%', '70%'], answer: '60%', explanation: '18 girls out of 30 = 18/30 = 60%.' },
  { id: 'au6', comp: 'au_num_problem', type: 'mc', difficulty: 2, q: 'A rectangle has length 8 m and width 5 m. Its area in m² is:', choices: ['13', '26', '40', '80'], answer: '40', explanation: 'Area = length × width = 8 × 5 = 40 m².' },
];

// ─── Literacy (LANTITE-style) ───
export const AUSTRALIA_LITERACY_DOMAINS = [
  { id: 'au_lit_comprehension', name: 'Reading & Comprehension', desc: 'Main idea, inference, purpose, vocabulary', weight: 0.40, games: [] },
  { id: 'au_lit_grammar', name: 'Grammar & Punctuation', desc: 'Sentence structure, punctuation, clarity', weight: 0.35, games: [] },
  { id: 'au_lit_writing', name: 'Writing & Communication', desc: 'Audience, structure, formal writing', weight: 0.25, games: [] },
];

export const AUSTRALIA_LITERACY_QUESTIONS = [
  { id: 'al1', comp: 'au_lit_comprehension', type: 'mc', difficulty: 1, q: 'The main idea of a paragraph is often found in:', choices: ['the last sentence only', 'the topic sentence (often the first)', 'the middle only', 'every sentence equally'], answer: 'the topic sentence (often the first)', explanation: 'Topic sentence usually states the main idea.' },
  { id: 'al2', comp: 'au_lit_comprehension', type: 'mc', difficulty: 2, q: 'When a text says "it was a Herculean task", the meaning is:', choices: ['easy', 'requiring great effort or strength', 'short', 'Greek'], answer: 'requiring great effort or strength', explanation: 'Herculean = very difficult or demanding (from Hercules).' },
  { id: 'al3', comp: 'au_lit_grammar', type: 'mc', difficulty: 1, q: 'Which sentence is correct?', choices: ['The students work was excellent', 'The students\' work was excellent', 'The student\'s work were excellent', 'The students work were excellent'], answer: 'The students\' work was excellent', explanation: 'Plural possessive: students\' = belonging to the students.' },
  { id: 'al4', comp: 'au_lit_grammar', type: 'mc', difficulty: 2, q: 'An apostrophe is used correctly to show:', choices: ['plural of nouns', 'possession or contraction', 'end of sentence', 'emphasis only'], answer: 'possession or contraction', explanation: 'Apostrophe shows ownership (Sarah\'s) or contraction (don\'t).' },
  { id: 'al5', comp: 'au_lit_writing', type: 'mc', difficulty: 1, q: 'Report writing for parents should be:', choices: ['informal only', 'clear, accurate, and professional', 'very brief only', 'only positive'], answer: 'clear, accurate, and professional', explanation: 'Reports need to be clear, accurate, and professionally worded.' },
  { id: 'al6', comp: 'au_lit_writing', type: 'mc', difficulty: 2, q: 'Cohesive writing uses linking words to:', choices: ['repeat the same idea', 'connect ideas and improve flow', 'avoid paragraphs', 'shorten the text'], answer: 'connect ideas and improve flow', explanation: 'Cohesion = connections between sentences and paragraphs.' },
];

// ─── Professional Knowledge (AITSL / registration) ───
export const AUSTRALIA_PROFESSIONAL_DOMAINS = [
  { id: 'au_prof_curriculum', name: 'Australian Curriculum & Teaching', desc: 'Curriculum, pedagogy, differentiation', weight: 0.35, games: [] },
  { id: 'au_prof_child_safety', name: 'Child Safety & Welfare', desc: 'Child protection, wellbeing, reporting', weight: 0.35, games: [] },
  { id: 'au_prof_standards', name: 'Professional Standards & Conduct', desc: 'AITSL standards, ethics, reflection', weight: 0.30, games: [] },
];

export const AUSTRALIA_PROFESSIONAL_QUESTIONS = [
  { id: 'ap1', comp: 'au_prof_curriculum', type: 'mc', difficulty: 1, q: 'The Australian Curriculum is organised by:', choices: ['states only', 'learning areas, general capabilities, and cross-curriculum priorities', 'only primary', 'no framework'], answer: 'learning areas, general capabilities, and cross-curriculum priorities', explanation: 'Australian Curriculum has learning areas, capabilities, and priorities.' },
  { id: 'ap2', comp: 'au_prof_curriculum', type: 'mc', difficulty: 2, q: 'Differentiation in Australian classrooms aims to:', choices: ['teach the same to everyone', 'address diverse learning needs and strengths', 'only support low achievers', 'eliminate assessment'], answer: 'address diverse learning needs and strengths', explanation: 'Differentiation adjusts content, process, and product for all learners.' },
  { id: 'ap3', comp: 'au_prof_child_safety', type: 'mc', difficulty: 1, q: 'Mandatory reporting in Australian education requires:', choices: ['only reporting attendance', 'reporting suspected abuse or harm to the relevant authority', 'only telling the principal', 'waiting for proof'], answer: 'reporting suspected abuse or harm to the relevant authority', explanation: 'Teachers must report reasonable suspicions to child protection authorities.' },
  { id: 'ap4', comp: 'au_prof_child_safety', type: 'mc', difficulty: 2, q: 'If you have a child safety concern, you should:', choices: ['keep it confidential', 'follow school policy and report to the appropriate person or authority', 'only tell the child', 'delay until you have proof'], answer: 'follow school policy and report to the appropriate person or authority', explanation: 'Follow your school’s child safety and reporting procedures.' },
  { id: 'ap5', comp: 'au_prof_standards', type: 'mc', difficulty: 1, q: 'AITSL stands for:', choices: ['Australian Institute for Teaching and School Leadership', 'Australian Independent Teachers Society', 'Assessment Institute for Teachers', 'No such body'], answer: 'Australian Institute for Teaching and School Leadership', explanation: 'AITSL develops the Australian Professional Standards for Teachers.' },
  { id: 'ap6', comp: 'au_prof_standards', type: 'mc', difficulty: 2, q: 'The Australian Professional Standards for Teachers describe:', choices: ['only content knowledge', 'what teachers should know and be able to do (Professional Knowledge, Practice, Engagement)', 'only for graduates', 'no behaviour'], answer: 'what teachers should know and be able to do (Professional Knowledge, Practice, Engagement)', explanation: 'Standards cover Knowledge, Practice, and Engagement across career stages.' },
];

// ─── Test configs ───
export const AUSTRALIA_TEST_CONFIG = {
  numeracy: { totalQuestions: 65, timeMinutes: 120, passingScore: 0.80, categoryDistribution: { au_num_number: 26, au_num_data: 23, au_num_problem: 16 } },
  literacy: { totalQuestions: 65, timeMinutes: 120, passingScore: 0.80, categoryDistribution: { au_lit_comprehension: 26, au_lit_grammar: 23, au_lit_writing: 16 } },
  professional: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.70, categoryDistribution: { au_prof_curriculum: 14, au_prof_child_safety: 14, au_prof_standards: 12 } },
};

export function getAustraliaQuestionsForExam(examId) {
  const map = {
    numeracy: AUSTRALIA_NUMERACY_QUESTIONS,
    literacy: AUSTRALIA_LITERACY_QUESTIONS,
    professional: AUSTRALIA_PROFESSIONAL_QUESTIONS,
  };
  return map[examId] || AUSTRALIA_NUMERACY_QUESTIONS;
}

export function getAustraliaDomainsForExam(examId) {
  const map = {
    numeracy: AUSTRALIA_NUMERACY_DOMAINS,
    literacy: AUSTRALIA_LITERACY_DOMAINS,
    professional: AUSTRALIA_PROFESSIONAL_DOMAINS,
  };
  return map[examId] || AUSTRALIA_NUMERACY_DOMAINS;
}
