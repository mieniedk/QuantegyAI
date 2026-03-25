/**
 * SAT question banks and domains.
 * Same structure as texes-questions for use with the shared prep flow.
 */

export const SAT_DOMAINS_MATH = [
  { id: 'sat_m_algebra', name: 'Heart of Algebra', desc: 'Linear equations, inequalities, systems', weight: 0.35, games: ['algebra-sprint', 'equation-balance', 'math-maze', 'q-blocks'] },
  { id: 'sat_m_data', name: 'Problem Solving & Data Analysis', desc: 'Ratios, percentages, statistics', weight: 0.35, games: ['math-sprint', 'graph-explorer', 'math-jeopardy'] },
  { id: 'sat_m_advanced', name: 'Passport to Advanced Math', desc: 'Quadratics, exponents, radicals', weight: 0.30, games: ['algebra-sprint', 'math-maze', 'teks-crush'] },
];

export const SAT_QUESTIONS_MATH = [
  { id: 'sm1', comp: 'sat_m_algebra', type: 'mc', difficulty: 1, q: 'If 3x + 4 = 19, what is x?', choices: ['4', '5', '6', '7'], answer: '5', explanation: '3x = 15, so x = 5.' },
  { id: 'sm2', comp: 'sat_m_algebra', type: 'mc', difficulty: 1, q: 'Which ordered pair satisfies y = 2x − 1 when x = 3?', choices: ['(3, 4)', '(3, 5)', '(3, 6)', '(3, 7)'], answer: '(3, 5)', explanation: 'y = 2(3) − 1 = 5.' },
  { id: 'sm3', comp: 'sat_m_algebra', type: 'mc', difficulty: 2, q: 'Solve the system: x + y = 10 and 2x − y = 2.', choices: ['x = 4, y = 6', 'x = 5, y = 5', 'x = 6, y = 4', 'x = 8, y = 2'], answer: 'x = 4, y = 6', explanation: 'Adding: 3x = 12, x = 4; then y = 6.' },
  { id: 'sm4', comp: 'sat_m_data', type: 'mc', difficulty: 1, q: 'A shirt costs $40. After a 20% discount, the price is:', choices: ['$8', '$32', '$38', '$48'], answer: '$32', explanation: '40 × 0.80 = 32.' },
  { id: 'sm5', comp: 'sat_m_data', type: 'mc', difficulty: 2, q: 'The mean of 2, 4, 6, 8, 10 is 6. What is the median?', choices: ['4', '5', '6', '8'], answer: '6', explanation: 'Median is the middle value: 6.' },
  { id: 'sm6', comp: 'sat_m_data', type: 'mc', difficulty: 2, q: 'In a class of 20, 12 are girls. What fraction are boys?', choices: ['2/5', '3/5', '8/20', '12/20'], answer: '2/5', explanation: '8 boys out of 20 = 8/20 = 2/5.' },
  { id: 'sm7', comp: 'sat_m_advanced', type: 'mc', difficulty: 1, q: 'Simplify: x² · x³', choices: ['x⁵', 'x⁶', 'x', '2x⁵'], answer: 'x⁵', explanation: 'Add exponents: 2 + 3 = 5.' },
  { id: 'sm8', comp: 'sat_m_advanced', type: 'mc', difficulty: 2, q: 'If x² = 81, what is |x|?', choices: ['9', '81', '−9', '40.5'], answer: '9', explanation: 'x = 9 or −9, so |x| = 9.' },
  { id: 'sm9', comp: 'sat_m_advanced', type: 'mc', difficulty: 2, q: 'Factor: x² − 9', choices: ['(x−3)²', '(x−3)(x+3)', '(x−9)(x+1)', '(x+3)²'], answer: '(x−3)(x+3)', explanation: 'Difference of squares: a² − b² = (a−b)(a+b).' },
  { id: 'sm10', comp: 'sat_m_algebra', type: 'mc', difficulty: 2, q: 'What is the slope of the line through (0, 4) and (2, 10)?', choices: ['2', '3', '4', '6'], answer: '3', explanation: 'Slope = (10−4)/(2−0) = 6/2 = 3.' },
];

export const SAT_DOMAINS_EBRW = [
  { id: 'sat_e_reading', name: 'Reading', desc: 'Evidence, main idea, words in context', weight: 0.50, games: [] },
  { id: 'sat_e_writing', name: 'Writing and Language', desc: 'Expression of ideas, conventions', weight: 0.50, games: [] },
];

export const SAT_QUESTIONS_EBRW = [
  { id: 'se1', comp: 'sat_e_reading', type: 'mc', difficulty: 1, q: 'The main purpose of the passage is to:', choices: ['Entertain', 'Inform', 'Persuade', 'Describe'], answer: 'Inform', explanation: 'Reading questions assess purpose and comprehension.' },
  { id: 'se2', comp: 'sat_e_reading', type: 'mc', difficulty: 2, q: 'As used in line 12, "substantial" most nearly means:', choices: ['heavy', 'considerable', 'physical', 'legal'], answer: 'considerable', explanation: 'Words in context require understanding connotation.' },
  { id: 'se3', comp: 'sat_e_reading', type: 'mc', difficulty: 1, q: 'Which choice best supports the author\'s claim?', choices: ['A', 'B', 'C', 'D'], answer: 'B', explanation: 'Command of evidence questions link claims to text.' },
  { id: 'se4', comp: 'sat_e_writing', type: 'mc', difficulty: 1, q: 'Which choice completes the sentence with correct grammar? The team _____ won the game.', choices: ['have', 'has', 'were', 'are'], answer: 'has', explanation: 'Subject "team" is singular; "has" agrees.' },
  { id: 'se5', comp: 'sat_e_writing', type: 'mc', difficulty: 2, q: 'Which revision improves clarity? "She went to the store and she bought milk."', choices: ['She went to the store, and she bought milk.', 'She went to the store and bought milk.', 'She went to the store; and she bought milk.', 'No change'], answer: 'She went to the store and bought milk.', explanation: 'Removing the repeated "she" improves concision.' },
  { id: 'se6', comp: 'sat_e_writing', type: 'mc', difficulty: 2, q: 'Choose the option that best combines the two sentences. "The experiment failed. The results were still useful."', choices: ['The experiment failed, the results were still useful.', 'The experiment failed; the results were still useful.', 'Although the experiment failed, the results were still useful.', 'The experiment failed and the results were still useful.'], answer: 'Although the experiment failed, the results were still useful.', explanation: 'Subordination shows the contrast between failure and usefulness.' },
];

export const SAT_TEST_CONFIG = {
  sat_math: {
    totalQuestions: 44,
    timeMinutes: 70,
    passingScore: 0.60,
    categoryDistribution: { sat_m_algebra: 16, sat_m_data: 16, sat_m_advanced: 12 },
  },
  sat_ebrw: {
    totalQuestions: 52,
    timeMinutes: 64,
    passingScore: 0.60,
    categoryDistribution: { sat_e_reading: 26, sat_e_writing: 26 },
  },
};

export function getSATQuestionsForExam(examId) {
  if (examId === 'sat_math') return SAT_QUESTIONS_MATH;
  if (examId === 'sat_ebrw') return SAT_QUESTIONS_EBRW;
  return SAT_QUESTIONS_MATH;
}

export function getSATDomainsForExam(examId) {
  if (examId === 'sat_math') return SAT_DOMAINS_MATH;
  if (examId === 'sat_ebrw') return SAT_DOMAINS_EBRW;
  return SAT_DOMAINS_MATH;
}
