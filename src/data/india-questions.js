/**
 * India teacher certification prep — CTET-style (Paper 1 & 2) and professional knowledge.
 * Aligned with CTET, NEP 2020, RTE. Same structure as other prep for TestPrepPage.
 */

// ─── CTET Paper 1 (Primary: Classes 1–5) ───
export const INDIA_CTET_P1_DOMAINS = [
  { id: 'in_p1_cdp', name: 'Child Development & Pedagogy', desc: 'Development, learning, inclusive education', weight: 0.30, games: [] },
  { id: 'in_p1_lang', name: 'Language & Comprehension', desc: 'Language I & II, comprehension, pedagogy', weight: 0.30, games: [] },
  { id: 'in_p1_math_evs', name: 'Mathematics & Environmental Studies', desc: 'Number, EVS, pedagogy of math and EVS', weight: 0.40, games: ['math-sprint', 'q-blocks'] },
];

export const INDIA_CTET_P1_QUESTIONS = [
  { id: 'in1', comp: 'in_p1_cdp', type: 'mc', difficulty: 1, q: 'According to Piaget, the stage where children can think logically about concrete events is:', choices: ['Sensorimotor', 'Pre-operational', 'Concrete operational', 'Formal operational'], answer: 'Concrete operational', explanation: 'Concrete operational stage (7–11 years) involves logical thought about concrete things.' },
  { id: 'in2', comp: 'in_p1_cdp', type: 'mc', difficulty: 2, q: 'Inclusive education emphasises:', choices: ['separate schools for different abilities', 'educating all children together and removing barriers to participation', 'only gifted learners', 'no assessment'], answer: 'educating all children together and removing barriers to participation', explanation: 'Inclusion = all children in the same setting with support and access.' },
  { id: 'in3', comp: 'in_p1_lang', type: 'mc', difficulty: 1, q: 'Comprehension in reading involves:', choices: ['only decoding words', 'understanding and interpreting the meaning of the text', 'only speed', 'only grammar'], answer: 'understanding and interpreting the meaning of the text', explanation: 'Comprehension = making meaning from what is read.' },
  { id: 'in4', comp: 'in_p1_math_evs', type: 'mc', difficulty: 1, q: 'What is 1/4 + 1/4?', choices: ['1/8', '2/4', '1/2', '2/8'], answer: '1/2', explanation: '1/4 + 1/4 = 2/4 = 1/2.' },
  { id: 'in5', comp: 'in_p1_math_evs', type: 'mc', difficulty: 2, q: 'EVS (Environmental Studies) at primary level aims to:', choices: ['only science content', 'develop awareness and understanding of the environment, society, and natural world', 'ignore social studies', 'only textbook learning'], answer: 'develop awareness and understanding of the environment, society, and natural world', explanation: 'EVS integrates environment, science, and social aspects.' },
  { id: 'in6', comp: 'in_p1_lang', type: 'mc', difficulty: 2, q: 'Multilingualism in the Indian classroom is supported by:', choices: ['using only English', 'valuing mother tongue and using it as a resource for learning', 'ignoring home language', 'one language only'], answer: 'valuing mother tongue and using it as a resource for learning', explanation: 'NEP and RTE support mother tongue as medium and resource.' },
];

// ─── CTET Paper 2 (Elementary: Classes 6–8) ───
export const INDIA_CTET_P2_DOMAINS = [
  { id: 'in_p2_cdp', name: 'Child Development & Pedagogy', desc: 'Development, learning, assessment', weight: 0.30, games: [] },
  { id: 'in_p2_lang', name: 'Language & Comprehension', desc: 'Language I & II, comprehension', weight: 0.30, games: [] },
  { id: 'in_p2_math_sci', name: 'Mathematics & Science', desc: 'Number, algebra, science concepts, pedagogy', weight: 0.40, games: ['math-sprint', 'algebra-sprint'] },
];

export const INDIA_CTET_P2_QUESTIONS = [
  { id: 'in7', comp: 'in_p2_cdp', type: 'mc', difficulty: 1, q: 'Formative assessment is used to:', choices: ['only give grades', 'provide feedback during learning to improve teaching and learning', 'replace summative assessment', 'rank learners'], answer: 'provide feedback during learning to improve teaching and learning', explanation: 'Formative assessment supports ongoing improvement.' },
  { id: 'in8', comp: 'in_p2_cdp', type: 'mc', difficulty: 2, q: 'Vygotsky\'s zone of proximal development (ZPD) refers to:', choices: ['what the child can do alone', 'the gap between what a child can do alone and what they can do with support', 'only independent work', 'fixed ability'], answer: 'the gap between what a child can do alone and what they can do with support', explanation: 'ZPD = range where scaffolding and support enable learning.' },
  { id: 'in9', comp: 'in_p2_lang', type: 'mc', difficulty: 1, q: 'A topic sentence in a paragraph typically:', choices: ['ends the paragraph', 'states the main idea of the paragraph', 'lists examples only', 'asks a question only'], answer: 'states the main idea of the paragraph', explanation: 'Topic sentence introduces the paragraph’s main idea.' },
  { id: 'in10', comp: 'in_p2_math_sci', type: 'mc', difficulty: 1, q: 'Solve: 2x + 3 = 11', choices: ['4', '5', '6', '7'], answer: '4', explanation: '2x = 8, x = 4.' },
  { id: 'in11', comp: 'in_p2_math_sci', type: 'mc', difficulty: 2, q: 'In science teaching, hands-on activities are important because they:', choices: ['replace theory', 'help learners construct understanding through direct experience', 'only for fun', 'ignore concepts'], answer: 'help learners construct understanding through direct experience', explanation: 'Experiential learning supports conceptual understanding.' },
  { id: 'in12', comp: 'in_p2_math_sci', type: 'mc', difficulty: 1, q: 'What is 15% of 200?', choices: ['25', '30', '35', '40'], answer: '30', explanation: '0.15 × 200 = 30.' },
];

// ─── Professional Knowledge (NEP, RTE, inclusion) ───
export const INDIA_PROFESSIONAL_DOMAINS = [
  { id: 'in_prof_nep', name: 'NEP 2020 & Curriculum', desc: 'National Education Policy, curriculum framework', weight: 0.35, games: [] },
  { id: 'in_prof_inclusive', name: 'Inclusive Education & Diversity', desc: 'Inclusion, multilingualism, diversity', weight: 0.35, games: [] },
  { id: 'in_prof_rte', name: 'RTE & Child Rights', desc: 'Right to Education, child protection', weight: 0.30, games: [] },
];

export const INDIA_PROFESSIONAL_QUESTIONS = [
  { id: 'inp1', comp: 'in_prof_nep', type: 'mc', difficulty: 1, q: 'NEP 2020 aims to transform education in India by, among other things:', choices: ['only increasing fees', 'ensuring equitable quality education, flexibility, and holistic development', 'only higher education', 'removing mother tongue'], answer: 'ensuring equitable quality education, flexibility, and holistic development', explanation: 'NEP 2020 focuses on access, equity, quality, and holistic development.' },
  { id: 'inp2', comp: 'in_prof_nep', type: 'mc', difficulty: 2, q: 'Foundational literacy and numeracy (FLN) in NEP 2020 refers to:', choices: ['only secondary level', 'ensuring every child achieves basic reading, writing, and numeracy by Grade 3', 'only English', 'optional focus'], answer: 'ensuring every child achieves basic reading, writing, and numeracy by Grade 3', explanation: 'FLN is a key priority so all children gain basic skills early.' },
  { id: 'inp3', comp: 'in_prof_inclusive', type: 'mc', difficulty: 1, q: 'Inclusive education in the Indian context includes:', choices: ['only urban schools', 'educating children with and without disabilities together, with appropriate support', 'separate schools only', 'no support'], answer: 'educating children with and without disabilities together, with appropriate support', explanation: 'Inclusion = same setting with support for all.' },
  { id: 'inp4', comp: 'in_prof_inclusive', type: 'mc', difficulty: 2, q: 'Multilingual education as per NEP supports:', choices: ['only English medium', 'mother tongue/regional language as medium of instruction in early years', 'ignoring home language', 'one language only'], answer: 'mother tongue/regional language as medium of instruction in early years', explanation: 'NEP recommends mother tongue/regional language as medium in early grades.' },
  { id: 'inp5', comp: 'in_prof_rte', type: 'mc', difficulty: 1, q: 'RTE Act 2009 provides for:', choices: ['only private schools', 'free and compulsory education for children 6–14 years', 'only primary', 'no duties on government'], answer: 'free and compulsory education for children 6–14 years', explanation: 'RTE guarantees free and compulsory education for 6–14 age group.' },
  { id: 'inp6', comp: 'in_prof_rte', type: 'mc', difficulty: 2, q: 'If a teacher has a concern about child abuse or safety, they should:', choices: ['ignore it', 'follow school policy and report to the designated authority or child protection mechanisms', 'only tell the child', 'wait for proof'], answer: 'follow school policy and report to the designated authority or child protection mechanisms', explanation: 'Child safety concerns must be reported as per policy and law.' },
];

// ─── Test configs ───
export const INDIA_TEST_CONFIG = {
  ctet_p1: { totalQuestions: 150, timeMinutes: 150, passingScore: 0.60, categoryDistribution: { in_p1_cdp: 45, in_p1_lang: 45, in_p1_math_evs: 60 } },
  ctet_p2: { totalQuestions: 150, timeMinutes: 150, passingScore: 0.60, categoryDistribution: { in_p2_cdp: 45, in_p2_lang: 45, in_p2_math_sci: 60 } },
  professional: { totalQuestions: 40, timeMinutes: 90, passingScore: 0.60, categoryDistribution: { in_prof_nep: 14, in_prof_inclusive: 14, in_prof_rte: 12 } },
};

export function getIndiaQuestionsForExam(examId) {
  const map = {
    ctet_p1: INDIA_CTET_P1_QUESTIONS,
    ctet_p2: INDIA_CTET_P2_QUESTIONS,
    professional: INDIA_PROFESSIONAL_QUESTIONS,
  };
  return map[examId] || INDIA_CTET_P1_QUESTIONS;
}

export function getIndiaDomainsForExam(examId) {
  const map = {
    ctet_p1: INDIA_CTET_P1_DOMAINS,
    ctet_p2: INDIA_CTET_P2_DOMAINS,
    professional: INDIA_PROFESSIONAL_DOMAINS,
  };
  return map[examId] || INDIA_CTET_P1_DOMAINS;
}
