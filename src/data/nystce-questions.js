/**
 * NYSTCE — New York State Teacher Certification Examinations.
 */

export const NYSTCE_DOMAINS_MULTI = [
  { id: 'nys_multi_math', name: 'Mathematics', desc: 'Number sense, operations, problem solving', weight: 0.33, games: ['math-sprint', 'algebra-sprint', 'q-blocks'] },
  { id: 'nys_multi_ela', name: 'Literacy & ELA', desc: 'Reading, writing, language', weight: 0.34, games: [] },
  { id: 'nys_multi_arts', name: 'Arts & Sciences', desc: 'Social studies, science, arts', weight: 0.33, games: [] },
];

export const NYSTCE_QUESTIONS_MULTI = [
  { id: 'nym1', comp: 'nys_multi_math', type: 'mc', difficulty: 1, q: 'What is 1/3 + 1/6?', choices: ['1/9', '1/2', '2/9', '1/3'], answer: '1/2', explanation: '1/3 = 2/6; 2/6 + 1/6 = 3/6 = 1/2.' },
  { id: 'nym2', comp: 'nys_multi_math', type: 'mc', difficulty: 2, q: 'A shirt is 20% off. Original $50. Sale price?', choices: ['$10', '$40', '$45', '$30'], answer: '40', explanation: '20% off = 80% of 50 = $40.' },
  { id: 'nym3', comp: 'nys_multi_ela', type: 'mc', difficulty: 1, q: 'Phonemic awareness involves:', choices: ['letter names', 'hearing and manipulating sounds', 'spelling only', 'vocabulary'], answer: 'hearing and manipulating sounds', explanation: 'Phonemic awareness is oral and auditory.' },
  { id: 'nym4', comp: 'nys_multi_ela', type: 'mc', difficulty: 2, q: 'The main purpose of a topic sentence is to:', choices: ['end the paragraph', 'state the main idea of the paragraph', 'ask a question', 'cite a source'], answer: 'state the main idea of the paragraph', explanation: 'Topic sentence introduces paragraph focus.' },
  { id: 'nym5', comp: 'nys_multi_arts', type: 'mc', difficulty: 1, q: 'Scientific inquiry typically begins with:', choices: ['a conclusion', 'a question or problem', 'a report', 'a hypothesis only'], answer: 'a question or problem', explanation: 'Science starts with observation and questions.' },
  { id: 'nym6', comp: 'nys_multi_arts', type: 'mc', difficulty: 2, q: 'Primary sources in history include:', choices: ['textbooks only', 'documents from the time period', 'encyclopedias', 'biographies written later'], answer: 'documents from the time period', explanation: 'Primary = from the time; secondary = about the time.' },
];

export const NYSTCE_DOMAINS_ALST = [
  { id: 'nys_alst_read', name: 'Reading', desc: 'Comprehension, analysis', weight: 0.50, games: [] },
  { id: 'nys_alst_write', name: 'Writing', desc: 'Written analysis, argument', weight: 0.50, games: [] },
];

export const NYSTCE_QUESTIONS_ALST = [
  { id: 'nya1', comp: 'nys_alst_read', type: 'mc', difficulty: 1, q: 'The author\'s argument is primarily supported by:', choices: ['A', 'B', 'C', 'D'], answer: 'B', explanation: 'Evidence-based reading.' },
  { id: 'nya2', comp: 'nys_alst_read', type: 'mc', difficulty: 2, q: 'The tone of the passage can be described as:', choices: ['neutral', 'dismissive', 'enthusiastic', 'skeptical'], answer: 'neutral', explanation: 'Tone = author\'s attitude.' },
  { id: 'nya3', comp: 'nys_alst_write', type: 'mc', difficulty: 1, q: 'Which revision improves clarity?', choices: ['A', 'B', 'C', 'D'], answer: 'C', explanation: 'Concision and clarity.' },
  { id: 'nya4', comp: 'nys_alst_write', type: 'mc', difficulty: 2, q: 'A strong thesis statement should be:', choices: ['vague', 'debatable and specific', 'one word', 'a question'], answer: 'debatable and specific', explanation: 'Thesis states a claim that can be argued.' },
];

export const NYSTCE_TEST_CONFIG = {
  nystce_multi: { totalQuestions: 90, timeMinutes: 180, passingScore: 0.70, categoryDistribution: { nys_multi_math: 30, nys_multi_ela: 30, nys_multi_arts: 30 } },
  nystce_alst: { totalQuestions: 40, timeMinutes: 180, passingScore: 0.70, categoryDistribution: { nys_alst_read: 20, nys_alst_write: 20 } },
};

export function getNYSTCEQuestionsForExam(examId) {
  if (examId === 'nystce_alst') return NYSTCE_QUESTIONS_ALST;
  return NYSTCE_QUESTIONS_MULTI;
}

export function getNYSTCEDomainsForExam(examId) {
  if (examId === 'nystce_alst') return NYSTCE_DOMAINS_ALST;
  return NYSTCE_DOMAINS_MULTI;
}
