import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getMTELQuestionsForExam, getMTELDomainsForExam, MTEL_TEST_CONFIG } from '../data/mtel-questions';

const examOptions = [
  { id: 'mtel_comm', label: 'MTEL Communication & Literacy', examLabel: 'Reading & Writing' },
  { id: 'mtel_math', label: 'MTEL Mathematics', examLabel: 'Mathematics' },
];

function getTestConfig(examId) {
  return MTEL_TEST_CONFIG[examId] || MTEL_TEST_CONFIG.mtel_comm;
}

const config = {
  title: 'MTEL Prep (Massachusetts)',
  resultsStorageKey: 'allen-ace-mtel-results',
  adaptiveStorageKey: 'allen-ace-mtel-adaptive',
  examOptions,
  defaultExamId: 'mtel_comm',
  getQuestionsForExam: getMTELQuestionsForExam,
  getDomainsForExam: getMTELDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory: { mtel_comm: 'MTEL Comm & Lit', mtel_math: 'MTEL Math' },
  backLink: '/teacher-dashboard',
};

export default function MtelPrep() {
  return <TestPrepPage config={config} />;
}
