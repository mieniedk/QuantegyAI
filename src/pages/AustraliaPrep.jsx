import React from 'react';
import TestPrepPage from './TestPrepPage';
import {
  getAustraliaQuestionsForExam,
  getAustraliaDomainsForExam,
  AUSTRALIA_TEST_CONFIG,
} from '../data/australia-questions';

const examOptions = [
  { id: 'numeracy', label: 'Numeracy', examLabel: 'LANTITE-style: number, data & problem solving' },
  { id: 'literacy', label: 'Literacy', examLabel: 'LANTITE-style: reading, grammar & writing' },
  { id: 'professional', label: 'Professional Knowledge', examLabel: 'Curriculum, child safety & AITSL standards' },
];

function getTestConfig(examId) {
  return AUSTRALIA_TEST_CONFIG[examId] || AUSTRALIA_TEST_CONFIG.numeracy;
}

const examLabelsForHistory = Object.fromEntries(
  examOptions.map((o) => [o.id, o.label])
);

const config = {
  title: 'Australia Teacher Prep',
  resultsStorageKey: 'allen-ace-australia-results',
  adaptiveStorageKey: 'allen-ace-australia-adaptive',
  examOptions,
  defaultExamId: 'numeracy',
  getQuestionsForExam: getAustraliaQuestionsForExam,
  getDomainsForExam: getAustraliaDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory,
  backLink: '/teacher-dashboard',
};

export default function AustraliaPrep() {
  return <TestPrepPage config={config} />;
}
