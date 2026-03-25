import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getILTSQuestionsForExam, getILTSDomainsForExam, ILTS_TEST_CONFIG } from '../data/ilts-questions';

const examOptions = [
  { id: 'ilts_content', label: 'ILTS Content Area', examLabel: 'Content & Pedagogy' },
];

function getTestConfig(examId) {
  return ILTS_TEST_CONFIG[examId] || ILTS_TEST_CONFIG.ilts_content;
}

const config = {
  title: 'ILTS Prep (Illinois)',
  resultsStorageKey: 'allen-ace-ilts-results',
  adaptiveStorageKey: 'allen-ace-ilts-adaptive',
  examOptions,
  defaultExamId: 'ilts_content',
  getQuestionsForExam: getILTSQuestionsForExam,
  getDomainsForExam: getILTSDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory: { ilts_content: 'ILTS Content' },
  backLink: '/teacher-dashboard',
};

export default function IltsPrep() {
  return <TestPrepPage config={config} />;
}
