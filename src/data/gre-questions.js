/**
 * GRE (General Test) question banks and domains.
 * Same structure as texes-questions for use with the shared prep flow.
 */

export const GRE_DOMAINS_QUANT = [
  { id: 'gre_q_arithmetic', name: 'Arithmetic', desc: 'Number properties, ratios, percentages', weight: 0.25, games: ['math-sprint', 'q-blocks', 'speed-builder', 'fraction-pizza'] },
  { id: 'gre_q_algebra', name: 'Algebra', desc: 'Equations, inequalities, functions', weight: 0.30, games: ['algebra-sprint', 'equation-balance', 'math-maze', 'q-blocks'] },
  { id: 'gre_q_geometry', name: 'Geometry', desc: 'Lines, angles, area, volume', weight: 0.25, games: ['shape-shifter', 'graph-explorer', 'math-sprint'] },
  { id: 'gre_q_data', name: 'Data Analysis', desc: 'Statistics, probability, interpretation', weight: 0.20, games: ['math-sprint', 'graph-explorer', 'math-jeopardy'] },
];

export const GRE_QUESTIONS_QUANT = [
  { id: 'gq1', comp: 'gre_q_arithmetic', type: 'mc', difficulty: 1, q: 'What is 15% of 80?', choices: ['10', '12', '15', '18'], answer: '12', explanation: '15% of 80 = 0.15 × 80 = 12.' },
  { id: 'gq2', comp: 'gre_q_arithmetic', type: 'mc', difficulty: 1, q: 'If the ratio of x to y is 3 : 5 and y = 20, what is x?', choices: ['10', '12', '15', '18'], answer: '12', explanation: 'x/y = 3/5, so x = (3/5)(20) = 12.' },
  { id: 'gq3', comp: 'gre_q_arithmetic', type: 'mc', difficulty: 2, q: 'A number is increased by 25% and then decreased by 20%. What is the net percent change?', choices: ['0%', '5% increase', '5% decrease', '10% increase'], answer: '0%', explanation: '1.25 × 0.80 = 1.00, so no net change.' },
  { id: 'gq4', comp: 'gre_q_algebra', type: 'mc', difficulty: 1, q: 'Solve for x: 2x + 5 = 17', choices: ['5', '6', '7', '8'], answer: '6', explanation: '2x = 12, so x = 6.' },
  { id: 'gq5', comp: 'gre_q_algebra', type: 'mc', difficulty: 2, q: 'If f(x) = 3x − 2, what is f(4)?', choices: ['8', '10', '12', '14'], answer: '10', explanation: 'f(4) = 3(4) − 2 = 12 − 2 = 10.' },
  { id: 'gq6', comp: 'gre_q_algebra', type: 'mc', difficulty: 2, q: 'Which value of x satisfies x² − 5x + 6 = 0?', choices: ['1', '2', '3', '4'], answer: '3', explanation: 'x² − 5x + 6 = (x−2)(x−3) = 0, so x = 2 or 3.' },
  { id: 'gq7', comp: 'gre_q_geometry', type: 'mc', difficulty: 1, q: 'The area of a rectangle with length 8 and width 5 is:', choices: ['13', '26', '40', '80'], answer: '40', explanation: 'Area = length × width = 8 × 5 = 40.' },
  { id: 'gq8', comp: 'gre_q_geometry', type: 'mc', difficulty: 2, q: 'A circle has radius 7. What is its area? (Use π = 22/7)', choices: ['44', '154', '308', '616'], answer: '154', explanation: 'A = πr² = (22/7)(49) = 154.' },
  { id: 'gq9', comp: 'gre_q_data', type: 'mc', difficulty: 1, q: 'The mean of 4, 6, 8, 10 is:', choices: ['6', '7', '8', '9'], answer: '7', explanation: 'Mean = (4+6+8+10)/4 = 28/4 = 7.' },
  { id: 'gq10', comp: 'gre_q_data', type: 'mc', difficulty: 2, q: 'A set has 5 numbers with mean 12. The sum of the numbers is:', choices: ['12', '17', '60', '72'], answer: '60', explanation: 'Sum = mean × count = 12 × 5 = 60.' },
];

export const GRE_DOMAINS_VERBAL = [
  { id: 'gre_v_reading', name: 'Reading Comprehension', desc: 'Passage-based questions', weight: 0.50, games: [] },
  { id: 'gre_v_tc', name: 'Text Completion', desc: 'Fill-in blanks in sentences', weight: 0.25, games: [] },
  { id: 'gre_v_se', name: 'Sentence Equivalence', desc: 'Choose two equivalent answers', weight: 0.25, games: [] },
];

export const GRE_QUESTIONS_VERBAL = [
  { id: 'gv1', comp: 'gre_v_reading', type: 'mc', difficulty: 1, q: 'The author\'s primary purpose in the passage is to:', choices: ['Describe a phenomenon', 'Argue for a policy', 'Compare two theories', 'Summarize research'], answer: 'Describe a phenomenon', explanation: 'Reading comprehension questions assess understanding of the main idea.' },
  { id: 'gv2', comp: 'gre_v_reading', type: 'mc', difficulty: 2, q: 'According to the passage, which of the following is true?', choices: ['A', 'B', 'C', 'D'], answer: 'B', explanation: 'Detail questions require locating information in the text.' },
  { id: 'gv3', comp: 'gre_v_tc', type: 'mc', difficulty: 1, q: 'The results were ____ : they clearly supported the hypothesis.', choices: ['ambiguous', 'equivocal', 'conclusive', 'preliminary'], answer: 'conclusive', explanation: 'Context indicates strong support, so "conclusive" fits.' },
  { id: 'gv4', comp: 'gre_v_tc', type: 'mc', difficulty: 2, q: 'Although the evidence was ____, the committee accepted the report.', choices: ['overwhelming', 'circumstantial', 'inadmissible', 'fabricated'], answer: 'circumstantial', explanation: '"Although" suggests a contrast; "circumstantial" implies indirect evidence.' },
  { id: 'gv5', comp: 'gre_v_se', type: 'mc', difficulty: 1, q: 'Select two answer choices that produce sentences alike in meaning. The theory was ____ by the new data.', choices: ['supported', 'refuted', 'weakened', 'validated'], answer: 'supported', explanation: 'Sentence equivalence: "supported" and "validated" are the pair. (Single MC format here.)' },
  { id: 'gv6', comp: 'gre_v_reading', type: 'mc', difficulty: 2, q: 'The tone of the passage can best be described as:', choices: ['neutral', 'dismissive', 'enthusiastic', 'skeptical'], answer: 'neutral', explanation: 'Tone questions require overall assessment of the author\'s attitude.' },
];

export const GRE_TEST_CONFIG = {
  gre_quant: {
    totalQuestions: 40,
    timeMinutes: 70,
    passingScore: 0.60,
    categoryDistribution: { gre_q_arithmetic: 10, gre_q_algebra: 12, gre_q_geometry: 10, gre_q_data: 8 },
  },
  gre_verbal: {
    totalQuestions: 40,
    timeMinutes: 60,
    passingScore: 0.60,
    categoryDistribution: { gre_v_reading: 20, gre_v_tc: 10, gre_v_se: 10 },
  },
};

export function getGREQuestionsForExam(examId) {
  if (examId === 'gre_quant') return GRE_QUESTIONS_QUANT;
  if (examId === 'gre_verbal') return GRE_QUESTIONS_VERBAL;
  return GRE_QUESTIONS_QUANT;
}

export function getGREDomainsForExam(examId) {
  if (examId === 'gre_quant') return GRE_DOMAINS_QUANT;
  if (examId === 'gre_verbal') return GRE_DOMAINS_VERBAL;
  return GRE_DOMAINS_QUANT;
}
