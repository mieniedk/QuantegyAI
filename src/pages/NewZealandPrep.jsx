import React from 'react';
import TestPrepPage from './TestPrepPage';
import {
  getNewZealandQuestionsForExam,
  getNewZealandDomainsForExam,
  NEWZEALAND_TEST_CONFIG,
} from '../data/newzealand-questions';

const examOptions = [
  { id: 'numeracy', label: 'Numeracy', examLabel: 'Number, data & problem solving' },
  { id: 'literacy', label: 'Literacy', examLabel: 'Reading, grammar & writing' },
  { id: 'professional', label: 'Professional Knowledge', examLabel: 'NZ Curriculum, Te Tiriti & Our Code Our Standards' },
];

function getTestConfig(examId) {
  return NEWZEALAND_TEST_CONFIG[examId] || NEWZEALAND_TEST_CONFIG.numeracy;
}

const examLabelsForHistory = Object.fromEntries(
  examOptions.map((o) => [o.id, o.label])
);

const config = {
  title: 'New Zealand Teacher Prep',
  resultsStorageKey: 'allen-ace-newzealand-results',
  adaptiveStorageKey: 'allen-ace-newzealand-adaptive',
  examOptions,
  defaultExamId: 'numeracy',
  getQuestionsForExam: getNewZealandQuestionsForExam,
  getDomainsForExam: getNewZealandDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory,
  backLink: '/teacher-dashboard',
};

export default function NewZealandPrep() {
  return <TestPrepPage config={config} />;
}
