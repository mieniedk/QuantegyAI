import React from 'react';
import TestPrepPage from './TestPrepPage';
import {
  getEnglandQuestionsForExam,
  getEnglandDomainsForExam,
  ENGLAND_TEST_CONFIG,
} from '../data/england-questions';

const examOptions = [
  { id: 'numeracy', label: 'Numeracy', examLabel: 'Number, data & problem solving' },
  { id: 'literacy', label: 'Literacy', examLabel: 'Reading, SPaG & writing' },
  { id: 'professional', label: 'Professional Knowledge', examLabel: 'Curriculum, safeguarding & behaviour' },
];

function getTestConfig(examId) {
  return ENGLAND_TEST_CONFIG[examId] || ENGLAND_TEST_CONFIG.numeracy;
}

const examLabelsForHistory = Object.fromEntries(
  examOptions.map((o) => [o.id, o.label])
);

const config = {
  title: 'England Teacher Prep',
  resultsStorageKey: 'allen-ace-england-results',
  adaptiveStorageKey: 'allen-ace-england-adaptive',
  examOptions,
  defaultExamId: 'numeracy',
  getQuestionsForExam: getEnglandQuestionsForExam,
  getDomainsForExam: getEnglandDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory,
  backLink: '/teacher-dashboard',
};

export default function EnglandPrep() {
  return <TestPrepPage config={config} />;
}
