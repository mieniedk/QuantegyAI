import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getCSETQuestionsForExam, getCSETDomainsForExam, CSET_TEST_CONFIG } from '../data/cset-questions';

const examOptions = [
  { id: 'cset_math', label: 'CSET Math', examLabel: 'Mathematics' },
  { id: 'cset_ela', label: 'CSET ELA', examLabel: 'English' },
];

function getTestConfig(examId) {
  return CSET_TEST_CONFIG[examId] || CSET_TEST_CONFIG.cset_math;
}

const config = {
  title: 'CSET Prep (California)',
  resultsStorageKey: 'allen-ace-cset-results',
  adaptiveStorageKey: 'allen-ace-cset-adaptive',
  examOptions,
  defaultExamId: 'cset_math',
  getQuestionsForExam: getCSETQuestionsForExam,
  getDomainsForExam: getCSETDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory: { cset_math: 'CSET Math', cset_ela: 'CSET ELA' },
  backLink: '/teacher-dashboard',
};

export default function CsetPrep() {
  return <TestPrepPage config={config} />;
}
