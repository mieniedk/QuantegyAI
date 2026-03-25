import React from 'react';
import TestPrepPage from './TestPrepPage';
import {
  getIndiaQuestionsForExam,
  getIndiaDomainsForExam,
  INDIA_TEST_CONFIG,
} from '../data/india-questions';

const examOptions = [
  { id: 'ctet_p1', label: 'CTET Paper 1 (Primary)', examLabel: 'Classes 1–5: Child Dev, Language, Maths & EVS' },
  { id: 'ctet_p2', label: 'CTET Paper 2 (Elementary)', examLabel: 'Classes 6–8: Child Dev, Language, Maths & Science' },
  { id: 'professional', label: 'Professional Knowledge', examLabel: 'NEP 2020, RTE, inclusion & child rights' },
];

function getTestConfig(examId) {
  return INDIA_TEST_CONFIG[examId] || INDIA_TEST_CONFIG.ctet_p1;
}

const examLabelsForHistory = Object.fromEntries(
  examOptions.map((o) => [o.id, o.label])
);

const config = {
  title: 'India Teacher Prep',
  resultsStorageKey: 'allen-ace-india-results',
  adaptiveStorageKey: 'allen-ace-india-adaptive',
  examOptions,
  defaultExamId: 'ctet_p1',
  getQuestionsForExam: getIndiaQuestionsForExam,
  getDomainsForExam: getIndiaDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory,
  backLink: '/teacher-dashboard',
};

export default function IndiaPrep() {
  return <TestPrepPage config={config} />;
}
