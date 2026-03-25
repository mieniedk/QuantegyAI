import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getFTCEQuestionsForExam, getFTCEDomainsForExam, FTCE_TEST_CONFIG } from '../data/ftce-questions';

const examOptions = [
  { id: 'ftce_gk_math', label: 'FTCE General Knowledge Math', examLabel: 'GK Mathematics' },
  { id: 'ftce_prof_ed', label: 'FTCE Professional Education', examLabel: 'Professional Education' },
];

function getTestConfig(examId) {
  return FTCE_TEST_CONFIG[examId] || FTCE_TEST_CONFIG.ftce_gk_math;
}

const config = {
  title: 'FTCE Prep (Florida)',
  resultsStorageKey: 'allen-ace-ftce-results',
  adaptiveStorageKey: 'allen-ace-ftce-adaptive',
  examOptions,
  defaultExamId: 'ftce_gk_math',
  getQuestionsForExam: getFTCEQuestionsForExam,
  getDomainsForExam: getFTCEDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory: { ftce_gk_math: 'FTCE GK Math', ftce_prof_ed: 'FTCE Prof Ed' },
  backLink: '/teacher-dashboard',
};

export default function FtcePrep() {
  return <TestPrepPage config={config} />;
}
