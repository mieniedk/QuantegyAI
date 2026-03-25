import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getGACEQuestionsForExam, getGACEDomainsForExam, GACE_TEST_CONFIG } from '../data/gace-questions';

const examOptions = [
  { id: 'gace_program', label: 'GACE Program Admission', examLabel: 'Reading, Math, Writing' },
];

function getTestConfig(examId) {
  return GACE_TEST_CONFIG[examId] || GACE_TEST_CONFIG.gace_program;
}

const config = {
  title: 'GACE Prep (Georgia)',
  resultsStorageKey: 'allen-ace-gace-results',
  adaptiveStorageKey: 'allen-ace-gace-adaptive',
  examOptions,
  defaultExamId: 'gace_program',
  getQuestionsForExam: getGACEQuestionsForExam,
  getDomainsForExam: getGACEDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory: { gace_program: 'GACE Program Admission' },
  backLink: '/teacher-dashboard',
};

export default function GacePrep() {
  return <TestPrepPage config={config} />;
}
