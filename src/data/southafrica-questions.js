/**
 * South Africa teacher certification prep — numeracy, literacy & professional knowledge.
 * Aligned with CAPS, SACE and registration requirements. Same structure as other prep for TestPrepPage.
 */

// ─── Numeracy ───
export const SOUTHAFRICA_NUMERACY_DOMAINS = [
  { id: 'za_num_number', name: 'Number & Algebra', desc: 'Arithmetic, percentages, ratios', weight: 0.40, games: ['math-sprint', 'q-blocks', 'fraction-pizza'] },
  { id: 'za_num_data', name: 'Statistics & Data', desc: 'Charts, averages, interpreting data', weight: 0.35, games: ['graph-explorer', 'math-jeopardy'] },
  { id: 'za_num_problem', name: 'Problem Solving', desc: 'Multi-step, measurement, context', weight: 0.25, games: ['math-sprint', 'equation-balance'] },
];

export const SOUTHAFRICA_NUMERACY_QUESTIONS = [
  { id: 'za1', comp: 'za_num_number', type: 'mc', difficulty: 1, q: 'What is 30% of 200?', choices: ['50', '60', '70', '80'], answer: '60', explanation: '0.30 × 200 = 60.' },
  { id: 'za2', comp: 'za_num_number', type: 'mc', difficulty: 2, q: 'A recipe uses flour and sugar in the ratio 4:1. For 500 g total, how much flour?', choices: ['100 g', '400 g', '250 g', '500 g'], answer: '400 g', explanation: '4/(4+1) × 500 = 4/5 × 500 = 400 g.' },
  { id: 'za3', comp: 'za_num_number', type: 'mc', difficulty: 1, q: 'Solve: 3x − 4 = 14', choices: ['4', '5', '6', '7'], answer: '6', explanation: '3x = 18, x = 6.' },
  { id: 'za4', comp: 'za_num_data', type: 'mc', difficulty: 1, q: 'Mean of 5, 10, 15, 20, 25?', choices: ['12', '15', '17', '20'], answer: '15', explanation: '(5+10+15+20+25)/5 = 75/5 = 15.' },
  { id: 'za5', comp: 'za_num_data', type: 'mc', difficulty: 2, q: 'In a class of 40, 25% achieved level 4. How many learners is that?', choices: ['8', '10', '12', '15'], answer: '10', explanation: '0.25 × 40 = 10.' },
  { id: 'za6', comp: 'za_num_problem', type: 'mc', difficulty: 2, q: 'A hall is 12 m long and 8 m wide. Perimeter in metres?', choices: ['96', '40', '20', '48'], answer: '40', explanation: 'Perimeter = 2(12 + 8) = 2 × 20 = 40 m.' },
];

// ─── Literacy ───
export const SOUTHAFRICA_LITERACY_DOMAINS = [
  { id: 'za_lit_comprehension', name: 'Reading & Comprehension', desc: 'Main idea, inference, purpose', weight: 0.40, games: [] },
  { id: 'za_lit_grammar', name: 'Grammar & Punctuation', desc: 'Sentence structure, clarity', weight: 0.35, games: [] },
  { id: 'za_lit_writing', name: 'Writing & Communication', desc: 'Audience, structure, reports', weight: 0.25, games: [] },
];

export const SOUTHAFRICA_LITERACY_QUESTIONS = [
  { id: 'zal1', comp: 'za_lit_comprehension', type: 'mc', difficulty: 1, q: 'The main idea of a text is:', choices: ['one detail', 'the central point or message the author conveys', 'the first word', 'the title only'], answer: 'the central point or message the author conveys', explanation: 'Main idea = central message or purpose of the text.' },
  { id: 'zal2', comp: 'za_lit_comprehension', type: 'mc', difficulty: 2, q: 'Reading for inference means:', choices: ['reading aloud only', 'drawing conclusions from what is stated or implied', 'skipping difficult words', 'reading once only'], answer: 'drawing conclusions from what is stated or implied', explanation: 'Inference = using evidence in the text to reach conclusions.' },
  { id: 'zal3', comp: 'za_lit_grammar', type: 'mc', difficulty: 1, q: 'Which is correct?', choices: ['The learners finished they\'re work', 'The learners finished their work', 'The learners finished there work', 'The learners finished they work'], answer: 'The learners finished their work', explanation: 'Their = possessive. They\'re = they are. There = place.' },
  { id: 'zal4', comp: 'za_lit_grammar', type: 'mc', difficulty: 2, q: 'A full stop is used to:', choices: ['separate items in a list', 'end a complete sentence', 'introduce a quote only', 'replace a comma'], answer: 'end a complete sentence', explanation: 'Full stop marks the end of a declarative sentence.' },
  { id: 'zal5', comp: 'za_lit_writing', type: 'mc', difficulty: 1, q: 'Report writing to parents and guardians should be:', choices: ['very brief only', 'clear, accurate, and professional', 'only in one language', 'only positive comments'], answer: 'clear, accurate, and professional', explanation: 'Reports should be clear, accurate, and professionally written.' },
  { id: 'zal6', comp: 'za_lit_writing', type: 'mc', difficulty: 2, q: 'Coherent writing has:', choices: ['no structure', 'ideas that flow logically and connect clearly', 'only short sentences', 'no paragraphs'], answer: 'ideas that flow logically and connect clearly', explanation: 'Coherence = logical flow and clear connections between ideas.' },
];

// ─── Professional Knowledge (CAPS, SACE, child protection) ───
export const SOUTHAFRICA_PROFESSIONAL_DOMAINS = [
  { id: 'za_prof_curriculum', name: 'CAPS & Teaching', desc: 'Curriculum, assessment, pedagogy', weight: 0.35, games: [] },
  { id: 'za_prof_inclusive', name: 'Inclusive Education & Diversity', desc: 'Inclusion, barriers, multilingualism', weight: 0.30, games: [] },
  { id: 'za_prof_conduct', name: 'SACE & Child Protection', desc: 'Professional standards, safeguarding', weight: 0.35, games: [] },
];

export const SOUTHAFRICA_PROFESSIONAL_QUESTIONS = [
  { id: 'zap1', comp: 'za_prof_curriculum', type: 'mc', difficulty: 1, q: 'CAPS stands for:', choices: ['Central Assessment for Primary Schools', 'Curriculum and Assessment Policy Statement', 'Council for Assessment and Planning', 'No such document'], answer: 'Curriculum and Assessment Policy Statement', explanation: 'CAPS is the national curriculum and assessment framework.' },
  { id: 'zap2', comp: 'za_prof_curriculum', type: 'mc', difficulty: 2, q: 'Formative assessment in CAPS is used to:', choices: ['only report to the department', 'inform teaching and support learning during the year', 'replace final exams', 'grade learners only'], answer: 'inform teaching and support learning during the year', explanation: 'Formative assessment guides teaching and learning.' },
  { id: 'zap3', comp: 'za_prof_inclusive', type: 'mc', difficulty: 1, q: 'Inclusive education in South Africa aims to:', choices: ['separate learners by ability', 'reduce barriers and enable all learners to participate and succeed', 'only support high achievers', 'remove assessment'], answer: 'reduce barriers and enable all learners to participate and succeed', explanation: 'Inclusive education addresses barriers so all can learn.' },
  { id: 'zap4', comp: 'za_prof_inclusive', type: 'mc', difficulty: 2, q: 'Multilingual classrooms in SA may involve:', choices: ['using only English', 'valuing home languages and supporting learning in more than one language', 'ignoring language diversity', 'no code-switching'], answer: 'valuing home languages and supporting learning in more than one language', explanation: 'SA policy supports additive multilingualism and home languages.' },
  { id: 'zap5', comp: 'za_prof_conduct', type: 'mc', difficulty: 1, q: 'SACE stands for:', choices: ['South African Certificate of Education', 'South African Council for Educators', 'School Assessment and Curriculum body', 'No such body'], answer: 'South African Council for Educators', explanation: 'SACE is the professional council for teachers; registration is required.' },
  { id: 'zap6', comp: 'za_prof_conduct', type: 'mc', difficulty: 2, q: 'If you have a concern about a child\'s safety or abuse in SA, you should:', choices: ['keep it confidential', 'follow school policy and report to the designated person or relevant authority (e.g. child protection, SAPS)', 'only tell the principal', 'wait for proof'], answer: 'follow school policy and report to the designated person or relevant authority (e.g. child protection, SAPS)', explanation: 'Child protection concerns must be reported as per policy and law.' },
];

// ─── Test configs ───
export const SOUTHAFRICA_TEST_CONFIG = {
  numeracy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.50, categoryDistribution: { za_num_number: 16, za_num_data: 14, za_num_problem: 10 } },
  literacy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.50, categoryDistribution: { za_lit_comprehension: 16, za_lit_grammar: 14, za_lit_writing: 10 } },
  professional: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.50, categoryDistribution: { za_prof_curriculum: 14, za_prof_inclusive: 12, za_prof_conduct: 14 } },
};

export function getSouthAfricaQuestionsForExam(examId) {
  const map = {
    numeracy: SOUTHAFRICA_NUMERACY_QUESTIONS,
    literacy: SOUTHAFRICA_LITERACY_QUESTIONS,
    professional: SOUTHAFRICA_PROFESSIONAL_QUESTIONS,
  };
  return map[examId] || SOUTHAFRICA_NUMERACY_QUESTIONS;
}

export function getSouthAfricaDomainsForExam(examId) {
  const map = {
    numeracy: SOUTHAFRICA_NUMERACY_DOMAINS,
    literacy: SOUTHAFRICA_LITERACY_DOMAINS,
    professional: SOUTHAFRICA_PROFESSIONAL_DOMAINS,
  };
  return map[examId] || SOUTHAFRICA_NUMERACY_DOMAINS;
}
