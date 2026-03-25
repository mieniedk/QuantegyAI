import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getMTTCQuestionsForExam, getMTTCDomainsForExam, MTTC_TEST_CONFIG } from '../data/mttc-questions';

const examOptions = [
  { id: 'mttc_elem', label: 'MTTC Elementary Education', examLabel: 'Elementary' },
];

function getTestConfig(examId) {
  return MTTC_TEST_CONFIG[examId] || MTTC_TEST_CONFIG.mttc_elem;
}

const config = {
  title: 'MTTC Prep (Michigan)',
  resultsStorageKey: 'allen-ace-mttc-results',
  adaptiveStorageKey: 'allen-ace-mttc-adaptive',
  examOptions,
  defaultExamId: 'mttc_elem',
  getQuestionsForExam: getMTTCQuestionsForExam,
  getDomainsForExam: getMTTCDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory: { mttc_elem: 'MTTC Elementary' },
  backLink: '/teacher-dashboard',
};

export default function MttcPrep() {
  return <TestPrepPage config={config} />;
}
