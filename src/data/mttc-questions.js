/**
 * MTTC — Michigan Test for Teacher Certification.
 */

export const MTTC_DOMAINS_ELEM = [
  { id: 'mttc_el_math', name: 'Mathematics', desc: 'Number sense, algebra, geometry, data', weight: 0.50, games: ['math-sprint', 'algebra-sprint', 'q-blocks', 'fraction-pizza'] },
  { id: 'mttc_el_other', name: 'Other Content & Pedagogy', desc: 'ELA, science, social studies, instruction', weight: 0.50, games: [] },
];

export const MTTC_QUESTIONS_ELEM = [
  { id: 'mt1', comp: 'mttc_el_math', type: 'mc', difficulty: 1, q: '8 × 7 =', choices: ['54', '56', '58', '64'], answer: '56', explanation: '8 × 7 = 56.' },
  { id: 'mt2', comp: 'mttc_el_math', type: 'mc', difficulty: 2, q: 'A recipe calls for 2/3 cup flour. Triple the recipe. How much flour?', choices: ['2 cups', '6/3 cups', '2/9 cups', '1 cup'], answer: '2 cups', explanation: '3 × (2/3) = 2.' },
  { id: 'mt3', comp: 'mttc_el_math', type: 'mc', difficulty: 1, q: 'Perimeter of a square with side 6?', choices: ['12', '24', '36', '18'], answer: '24', explanation: '4 × 6 = 24.' },
  { id: 'mt4', comp: 'mttc_el_other', type: 'mc', difficulty: 1, q: 'Phonological awareness includes:', choices: ['letter names only', 'sounds in spoken language', 'spelling only', 'reading fluency only'], answer: 'sounds in spoken language', explanation: 'Phonological = sounds; can be without print.' },
  { id: 'mt5', comp: 'mttc_el_other', type: 'mc', difficulty: 2, q: 'A teacher uses a K-W-L chart to:', choices: ['grade only', 'activate prior knowledge and set purpose for reading', 'replace instruction', 'test only'], answer: 'activate prior knowledge and set purpose for reading', explanation: 'K=Know, W=Want, L=Learned.' },
  { id: 'mt6', comp: 'mttc_el_other', type: 'mc', difficulty: 1, q: 'Hands-on science activities primarily support:', choices: ['memorization only', 'concrete experience and inquiry', 'avoiding content', 'testing only'], answer: 'concrete experience and inquiry', explanation: 'Inquiry and conceptual understanding.' },
];

export const MTTC_TEST_CONFIG = {
  mttc_elem: { totalQuestions: 100, timeMinutes: 150, passingScore: 0.70, categoryDistribution: { mttc_el_math: 50, mttc_el_other: 50 } },
};

export function getMTTCQuestionsForExam(examId) {
  return MTTC_QUESTIONS_ELEM;
}

export function getMTTCDomainsForExam(examId) {
  return MTTC_DOMAINS_ELEM;
}
