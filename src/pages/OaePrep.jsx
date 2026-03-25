import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getOAEQuestionsForExam, getOAEDomainsForExam, OAE_TEST_CONFIG } from '../data/oae-questions';

const examOptions = [
  { id: 'oae_content', label: 'OAE Content & Professional Knowledge', examLabel: 'Content Area' },
];

function getTestConfig(examId) {
  return OAE_TEST_CONFIG[examId] || OAE_TEST_CONFIG.oae_content;
}

const config = {
  title: 'OAE Prep (Ohio)',
  resultsStorageKey: 'allen-ace-oae-results',
  adaptiveStorageKey: 'allen-ace-oae-adaptive',
  examOptions,
  defaultExamId: 'oae_content',
  getQuestionsForExam: getOAEQuestionsForExam,
  getDomainsForExam: getOAEDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory: { oae_content: 'OAE Content' },
  backLink: '/teacher-dashboard',
};

export default function OaePrep() {
  return <TestPrepPage config={config} />;
}
