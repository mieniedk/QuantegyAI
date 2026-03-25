import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getGREQuestionsForExam, getGREDomainsForExam, GRE_TEST_CONFIG } from '../data/gre-questions';

const examOptions = [
  { id: 'gre_quant', label: 'GRE Quantitative', examLabel: 'Quantitative Reasoning' },
  { id: 'gre_verbal', label: 'GRE Verbal', examLabel: 'Verbal Reasoning' },
];

function getTestConfig(examId) {
  return GRE_TEST_CONFIG[examId] || GRE_TEST_CONFIG.gre_quant;
}

const config = {
  title: 'GRE Prep',
  resultsStorageKey: 'allen-ace-gre-results',
  adaptiveStorageKey: 'allen-ace-gre-adaptive',
  examOptions,
  defaultExamId: 'gre_quant',
  getQuestionsForExam: getGREQuestionsForExam,
  getDomainsForExam: getGREDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory: { gre_quant: 'GRE Quantitative', gre_verbal: 'GRE Verbal' },
  backLink: '/teacher-dashboard',
};

export default function GrePrep() {
  return <TestPrepPage config={config} />;
}
