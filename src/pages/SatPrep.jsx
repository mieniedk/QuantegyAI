import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getSATQuestionsForExam, getSATDomainsForExam, SAT_TEST_CONFIG } from '../data/sat-questions';

const examOptions = [
  { id: 'sat_math', label: 'SAT Math', examLabel: 'Math' },
  { id: 'sat_ebrw', label: 'SAT EBRW', examLabel: 'Evidence-Based Reading and Writing' },
];

function getTestConfig(examId) {
  return SAT_TEST_CONFIG[examId] || SAT_TEST_CONFIG.sat_math;
}

const config = {
  title: 'SAT Prep',
  resultsStorageKey: 'allen-ace-sat-results',
  adaptiveStorageKey: 'allen-ace-sat-adaptive',
  examOptions,
  defaultExamId: 'sat_math',
  getQuestionsForExam: getSATQuestionsForExam,
  getDomainsForExam: getSATDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory: { sat_math: 'SAT Math', sat_ebrw: 'SAT EBRW' },
  backLink: '/teacher-dashboard',
};

export default function SatPrep() {
  return <TestPrepPage config={config} />;
}
