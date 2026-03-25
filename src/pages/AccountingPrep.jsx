import React from 'react';
import TestPrepPage from './TestPrepPage';
import {
  getAccountingQuestionsForExam,
  getAccountingDomainsForExam,
  ACCOUNTING_TEST_CONFIG,
} from '../data/accounting-questions';

const examOptions = [
  { id: 'cpa_aud', label: 'CPA — AUD', examLabel: 'Audit & Attestation' },
  { id: 'cpa_far', label: 'CPA — FAR', examLabel: 'Financial Accounting & Reporting' },
  { id: 'cpa_reg', label: 'CPA — REG', examLabel: 'Regulation' },
  { id: 'cpa_bec', label: 'CPA — BEC', examLabel: 'Business Environment & Concepts' },
  { id: 'cma_p1', label: 'CMA Part 1', examLabel: 'Financial Planning, Performance & Analytics' },
  { id: 'cma_p2', label: 'CMA Part 2', examLabel: 'Strategic Financial Management' },
  { id: 'cia_p1', label: 'CIA Part 1', examLabel: 'Essentials of Internal Auditing' },
  { id: 'cia_p2', label: 'CIA Part 2', examLabel: 'Practice of Internal Auditing' },
  { id: 'cia_p3', label: 'CIA Part 3', examLabel: 'Business Knowledge for Internal Auditing' },
];

function getTestConfig(examId) {
  return ACCOUNTING_TEST_CONFIG[examId] || ACCOUNTING_TEST_CONFIG.cpa_aud;
}

const examLabelsForHistory = Object.fromEntries(
  examOptions.map((o) => [o.id, o.label])
);

const config = {
  title: 'Accounting Exam Prep',
  resultsStorageKey: 'allen-ace-accounting-results',
  adaptiveStorageKey: 'allen-ace-accounting-adaptive',
  examOptions,
  defaultExamId: 'cpa_aud',
  getQuestionsForExam: getAccountingQuestionsForExam,
  getDomainsForExam: getAccountingDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory,
  backLink: '/teacher-dashboard',
};

export default function AccountingPrep() {
  return <TestPrepPage config={config} />;
}
