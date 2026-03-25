/**
 * Nigeria teacher certification prep — TRCN, NCE, curriculum.
 * Numeracy, Literacy, Professional Knowledge. Same structure as other prep for TestPrepPage.
 */

export const NIGERIA_NUMERACY_DOMAINS = [
  { id: 'ng_num', name: 'Number & Algebra', desc: 'Arithmetic, percentages', weight: 0.40, games: ['math-sprint', 'q-blocks'] },
  { id: 'ng_data', name: 'Data & Statistics', desc: 'Charts, averages', weight: 0.35, games: ['graph-explorer'] },
  { id: 'ng_problem', name: 'Problem Solving', desc: 'Multi-step, reasoning', weight: 0.25, games: ['math-sprint'] },
];

export const NIGERIA_NUMERACY_QUESTIONS = [
  { id: 'ng1', comp: 'ng_num', type: 'mc', difficulty: 1, q: 'What is 25% of 200?', choices: ['40', '50', '60', '75'], answer: '50', explanation: '0.25 × 200 = 50.' },
  { id: 'ng2', comp: 'ng_num', type: 'mc', difficulty: 2, q: 'A class of 40 has 25% absent. How many present?', choices: ['10', '25', '30', '35'], answer: '30', explanation: '75% × 40 = 30.' },
  { id: 'ng3', comp: 'ng_data', type: 'mc', difficulty: 1, q: 'Mean of 4, 8, 12, 16, 20?', choices: ['10', '12', '14', '16'], answer: '12', explanation: '(4+8+12+16+20)/5 = 12.' },
  { id: 'ng4', comp: 'ng_data', type: 'mc', difficulty: 2, q: 'Pie chart: 90° is what percentage?', choices: ['9%', '25%', '90%', '50%'], answer: '25%', explanation: '90/360 = 25%.' },
  { id: 'ng5', comp: 'ng_problem', type: 'mc', difficulty: 1, q: 'Area of rectangle 9 m × 4 m?', choices: ['26 m²', '36 m²', '13 m²', '18 m²'], answer: '36 m²', explanation: '9 × 4 = 36 m².' },
  { id: 'ng6', comp: 'ng_problem', type: 'mc', difficulty: 2, q: 'Solve: 2x + 8 = 20', choices: ['4', '6', '8', '10'], answer: '6', explanation: '2x = 12, x = 6.' },
];

export const NIGERIA_LITERACY_DOMAINS = [
  { id: 'ng_lit_read', name: 'Reading & Comprehension', desc: 'Main idea, inference', weight: 0.40, games: [] },
  { id: 'ng_lit_spag', name: 'SPaG', desc: 'Spelling, punctuation, grammar', weight: 0.35, games: [] },
  { id: 'ng_lit_write', name: 'Writing', desc: 'Clarity, audience', weight: 0.25, games: [] },
];

export const NIGERIA_LITERACY_QUESTIONS = [
  { id: 'ngl1', comp: 'ng_lit_read', type: 'mc', difficulty: 1, q: 'Main idea of a passage is:', choices: ['one detail', 'the central point or message', 'the title only', 'the first word'], answer: 'the central point or message', explanation: 'Main idea = central message.' },
  { id: 'ngl2', comp: 'ng_lit_read', type: 'mc', difficulty: 2, q: 'Inference means:', choices: ['copying', 'drawing conclusions from evidence', 'only literal', 'guessing'], answer: 'drawing conclusions from evidence', explanation: 'Inference = conclusions from evidence.' },
  { id: 'ngl3', comp: 'ng_lit_spag', type: 'mc', difficulty: 1, q: 'Correct: _____ books are on the table.', choices: ['They\'re', 'Their', 'There'], answer: 'Their', explanation: 'Their = possessive.' },
  { id: 'ngl4', comp: 'ng_lit_spag', type: 'mc', difficulty: 2, q: 'Full stop is used to:', choices: ['separate list items', 'end a complete sentence', 'introduce quote'], answer: 'end a complete sentence', explanation: 'Full stop ends a sentence.' },
  { id: 'ngl5', comp: 'ng_lit_write', type: 'mc', difficulty: 1, q: 'Reports to parents should be:', choices: ['informal', 'clear and professional', 'very short only'], answer: 'clear and professional', explanation: 'Reports need clear, professional language.' },
  { id: 'ngl6', comp: 'ng_lit_write', type: 'mc', difficulty: 2, q: 'Coherent writing has:', choices: ['no structure', 'logical flow and connections', 'only short sentences'], answer: 'logical flow and connections', explanation: 'Coherence = logical flow.' },
];

export const NIGERIA_PROFESSIONAL_DOMAINS = [
  { id: 'ng_curr', name: 'Curriculum & Teaching', desc: 'UBE, curriculum, pedagogy', weight: 0.35, games: [] },
  { id: 'ng_inclusive', name: 'Inclusive Education', desc: 'Inclusion, diversity', weight: 0.30, games: [] },
  { id: 'ng_stand', name: 'TRCN & Professional Conduct', desc: 'Registration, ethics', weight: 0.35, games: [] },
];

export const NIGERIA_PROFESSIONAL_QUESTIONS = [
  { id: 'ngp1', comp: 'ng_curr', type: 'mc', difficulty: 1, q: 'UBE in Nigeria stands for:', choices: ['University Basic Education', 'Universal Basic Education', 'Union of Basic Educators', 'no such programme'], answer: 'Universal Basic Education', explanation: 'UBE provides free basic education (primary and JSS).' },
  { id: 'ngp2', comp: 'ng_curr', type: 'mc', difficulty: 2, q: 'Formative assessment is used to:', choices: ['only grade', 'inform teaching and learning during instruction', 'replace summative', 'rank only'], answer: 'inform teaching and learning during instruction', explanation: 'Formative assessment guides teaching.' },
  { id: 'ngp3', comp: 'ng_inclusive', type: 'mc', difficulty: 1, q: 'Inclusive education aims to:', choices: ['separate by ability', 'enable all learners to participate and succeed with appropriate support', 'only high achievers', 'no support'], answer: 'enable all learners to participate and succeed with appropriate support', explanation: 'Inclusion = all learners with support.' },
  { id: 'ngp4', comp: 'ng_inclusive', type: 'mc', difficulty: 2, q: 'Differentiation in Nigerian classrooms supports:', choices: ['same for all', 'addressing diverse learning needs and strengths', 'only one method'], answer: 'addressing diverse learning needs and strengths', explanation: 'Differentiation addresses varied needs.' },
  { id: 'ngp5', comp: 'ng_stand', type: 'mc', difficulty: 1, q: 'TRCN stands for:', choices: ['Teachers Registration Council of Nigeria', 'Teaching Resource Centre of Nigeria', 'Teacher Review Council', 'no such body'], answer: 'Teachers Registration Council of Nigeria', explanation: 'TRCN registers and regulates teachers.' },
  { id: 'ngp6', comp: 'ng_stand', type: 'mc', difficulty: 2, q: 'If you have a child protection concern in Nigeria, you should:', choices: ['keep confidential', 'follow school policy and report to the designated authority', 'only tell the child'], answer: 'follow school policy and report to the designated authority', explanation: 'Report concerns per policy and law.' },
];

export const NIGERIA_TEST_CONFIG = {
  numeracy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.50, categoryDistribution: { ng_num: 16, ng_data: 14, ng_problem: 10 } },
  literacy: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.50, categoryDistribution: { ng_lit_read: 16, ng_lit_spag: 14, ng_lit_write: 10 } },
  professional: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.50, categoryDistribution: { ng_curr: 14, ng_inclusive: 12, ng_stand: 14 } },
};

export function getNigeriaQuestionsForExam(examId) {
  const map = { numeracy: NIGERIA_NUMERACY_QUESTIONS, literacy: NIGERIA_LITERACY_QUESTIONS, professional: NIGERIA_PROFESSIONAL_QUESTIONS };
  return map[examId] || NIGERIA_NUMERACY_QUESTIONS;
}

export function getNigeriaDomainsForExam(examId) {
  const map = { numeracy: NIGERIA_NUMERACY_DOMAINS, literacy: NIGERIA_LITERACY_DOMAINS, professional: NIGERIA_PROFESSIONAL_DOMAINS };
  return map[examId] || NIGERIA_NUMERACY_DOMAINS;
}
