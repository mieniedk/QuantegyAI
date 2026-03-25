import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getScotlandQuestionsForExam, getScotlandDomainsForExam, SCOTLAND_TEST_CONFIG } from '../data/scotland-questions';

const examOptions = [
  { id: 'numeracy', label: 'Numeracy', examLabel: 'Number, data & problem solving' },
  { id: 'literacy', label: 'Literacy', examLabel: 'Reading, SPaG & writing' },
  { id: 'professional', label: 'Professional Knowledge', examLabel: 'CfE, GIRFEC, GTCS' },
];

const config = {
  title: 'Scotland Teacher Prep',
  resultsStorageKey: 'allen-ace-scotland-results',
  adaptiveStorageKey: 'allen-ace-scotland-adaptive',
  examOptions,
  defaultExamId: 'numeracy',
  getQuestionsForExam: getScotlandQuestionsForExam,
  getDomainsForExam: getScotlandDomainsForExam,
  getTestConfig: (id) => SCOTLAND_TEST_CONFIG[id] || SCOTLAND_TEST_CONFIG.numeracy,
  hasFullExamAccess: true,
  examLabelsForHistory: Object.fromEntries(examOptions.map((o) => [o.id, o.label])),
  backLink: '/teacher-dashboard',
};

export default function ScotlandPrep() { return <TestPrepPage config={config} />; }
