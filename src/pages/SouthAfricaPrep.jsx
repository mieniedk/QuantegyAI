import React from 'react';
import TestPrepPage from './TestPrepPage';
import {
  getSouthAfricaQuestionsForExam,
  getSouthAfricaDomainsForExam,
  SOUTHAFRICA_TEST_CONFIG,
} from '../data/southafrica-questions';

const examOptions = [
  { id: 'numeracy', label: 'Numeracy', examLabel: 'Number, data & problem solving' },
  { id: 'literacy', label: 'Literacy', examLabel: 'Reading, grammar & writing' },
  { id: 'professional', label: 'Professional Knowledge', examLabel: 'CAPS, SACE & child protection' },
];

function getTestConfig(examId) {
  return SOUTHAFRICA_TEST_CONFIG[examId] || SOUTHAFRICA_TEST_CONFIG.numeracy;
}

const examLabelsForHistory = Object.fromEntries(
  examOptions.map((o) => [o.id, o.label])
);

const config = {
  title: 'South Africa Teacher Prep',
  resultsStorageKey: 'allen-ace-southafrica-results',
  adaptiveStorageKey: 'allen-ace-southafrica-adaptive',
  examOptions,
  defaultExamId: 'numeracy',
  getQuestionsForExam: getSouthAfricaQuestionsForExam,
  getDomainsForExam: getSouthAfricaDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory,
  backLink: '/teacher-dashboard',
};

export default function SouthAfricaPrep() {
  return <TestPrepPage config={config} />;
}
