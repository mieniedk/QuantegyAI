import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getNYSTCEQuestionsForExam, getNYSTCEDomainsForExam, NYSTCE_TEST_CONFIG } from '../data/nystce-questions';

const examOptions = [
  { id: 'nystce_multi', label: 'NYSTCE Multi-Subject', examLabel: 'Multi-Subject (Childhood)' },
  { id: 'nystce_alst', label: 'NYSTCE ALST', examLabel: 'Academic Literacy Skills Test' },
];

function getTestConfig(examId) {
  return NYSTCE_TEST_CONFIG[examId] || NYSTCE_TEST_CONFIG.nystce_multi;
}

const config = {
  title: 'NYSTCE Prep (New York)',
  resultsStorageKey: 'allen-ace-nystce-results',
  adaptiveStorageKey: 'allen-ace-nystce-adaptive',
  examOptions,
  defaultExamId: 'nystce_multi',
  getQuestionsForExam: getNYSTCEQuestionsForExam,
  getDomainsForExam: getNYSTCEDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory: { nystce_multi: 'NYSTCE Multi-Subject', nystce_alst: 'NYSTCE ALST' },
  backLink: '/teacher-dashboard',
};

export default function NystcePrep() {
  return <TestPrepPage config={config} />;
}
