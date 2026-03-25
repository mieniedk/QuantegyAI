import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getPraxisQuestionsForExam, getPraxisDomainsForExam, PRAXIS_TEST_CONFIG } from '../data/praxis-questions';

const examOptions = [
  { id: 'praxis_math', label: 'Praxis Core Math', examLabel: 'Mathematics' },
  { id: 'praxis_reading', label: 'Praxis Core Reading', examLabel: 'Reading' },
];

function getTestConfig(examId) {
  return PRAXIS_TEST_CONFIG[examId] || PRAXIS_TEST_CONFIG.praxis_math;
}

const config = {
  title: 'Praxis Prep',
  resultsStorageKey: 'allen-ace-praxis-results',
  adaptiveStorageKey: 'allen-ace-praxis-adaptive',
  examOptions,
  defaultExamId: 'praxis_math',
  getQuestionsForExam: getPraxisQuestionsForExam,
  getDomainsForExam: getPraxisDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory: { praxis_math: 'Praxis Core Math', praxis_reading: 'Praxis Core Reading' },
  backLink: '/teacher-dashboard',
};

export default function PraxisPrep() {
  return <TestPrepPage config={config} />;
}
