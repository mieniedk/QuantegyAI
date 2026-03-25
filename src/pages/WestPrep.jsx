import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getWESTQuestionsForExam, getWESTDomainsForExam, WEST_TEST_CONFIG } from '../data/west-questions';

const examOptions = [
  { id: 'west_basic', label: 'WEST–B (Basic Skills)', examLabel: 'Reading, Math, Writing' },
];

function getTestConfig(examId) {
  return WEST_TEST_CONFIG[examId] || WEST_TEST_CONFIG.west_basic;
}

const config = {
  title: 'WEST Prep (Washington)',
  resultsStorageKey: 'allen-ace-west-results',
  adaptiveStorageKey: 'allen-ace-west-adaptive',
  examOptions,
  defaultExamId: 'west_basic',
  getQuestionsForExam: getWESTQuestionsForExam,
  getDomainsForExam: getWESTDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory: { west_basic: 'WEST–B' },
  backLink: '/teacher-dashboard',
};

export default function WestPrep() {
  return <TestPrepPage config={config} />;
}
