import React from 'react';
import TestPrepPage from './TestPrepPage';
import {
  getActuaryQuestionsForExam,
  getActuaryDomainsForExam,
  ACTUARY_TEST_CONFIG,
} from '../data/actuary-questions';

const examOptions = [
  { id: 'soa_p', label: 'SOA Exam P', examLabel: 'Probability' },
  { id: 'soa_fm', label: 'SOA Exam FM', examLabel: 'Financial Mathematics' },
  { id: 'soa_ifm', label: 'SOA Exam IFM', examLabel: 'Investment and Financial Markets' },
  { id: 'soa_srm', label: 'SOA Exam SRM', examLabel: 'Statistics for Risk Modeling' },
  { id: 'soa_stam', label: 'SOA Exam STAM', examLabel: 'Short-Term Actuarial Mathematics' },
  { id: 'soa_ltam', label: 'SOA Exam LTAM', examLabel: 'Long-Term Actuarial Mathematics' },
  { id: 'cas_mas1', label: 'CAS MAS-I', examLabel: 'Modern Actuarial Statistics I' },
  { id: 'cas_mas2', label: 'CAS MAS-II', examLabel: 'Modern Actuarial Statistics II' },
  { id: 'cas_5', label: 'CAS Exam 5', examLabel: 'Basic Techniques for Ratemaking and Estimating Claim Liabilities' },
  { id: 'cas_6', label: 'CAS Exam 6', examLabel: 'Regulation and Financial Reporting' },
  { id: 'cas_7', label: 'CAS Exam 7', examLabel: 'Estimation of Policy Liabilities, Insurance Company Valuation' },
  { id: 'cas_8', label: 'CAS Exam 8', examLabel: 'Advanced Ratemaking' },
  { id: 'cas_9', label: 'CAS Exam 9', examLabel: 'Financial Risk and Rate of Return' },
];

function getTestConfig(examId) {
  return ACTUARY_TEST_CONFIG[examId] || ACTUARY_TEST_CONFIG.soa_p;
}

const examLabelsForHistory = Object.fromEntries(
  examOptions.map((o) => [o.id, o.label])
);

const config = {
  title: 'Actuary Prep',
  resultsStorageKey: 'allen-ace-actuary-results',
  adaptiveStorageKey: 'allen-ace-actuary-adaptive',
  examOptions,
  defaultExamId: 'soa_p',
  getQuestionsForExam: getActuaryQuestionsForExam,
  getDomainsForExam: getActuaryDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory,
  backLink: '/teacher-dashboard',
};

export default function ActuaryPrep() {
  return <TestPrepPage config={config} />;
}
