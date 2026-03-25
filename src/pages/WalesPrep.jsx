import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getWalesQuestionsForExam, getWalesDomainsForExam, WALES_TEST_CONFIG } from '../data/wales-questions';

const examOptions = [
  { id: 'numeracy', label: 'Numeracy', examLabel: 'Number, data & problem solving' },
  { id: 'literacy', label: 'Literacy', examLabel: 'Reading, SPaG & writing' },
  { id: 'professional', label: 'Professional Knowledge', examLabel: 'Curriculum for Wales, EWC, safeguarding' },
];

const config = {
  title: 'Wales Teacher Prep',
  resultsStorageKey: 'allen-ace-wales-results',
  adaptiveStorageKey: 'allen-ace-wales-adaptive',
  examOptions,
  defaultExamId: 'numeracy',
  getQuestionsForExam: getWalesQuestionsForExam,
  getDomainsForExam: getWalesDomainsForExam,
  getTestConfig: (id) => WALES_TEST_CONFIG[id] || WALES_TEST_CONFIG.numeracy,
  hasFullExamAccess: true,
  examLabelsForHistory: Object.fromEntries(examOptions.map((o) => [o.id, o.label])),
  backLink: '/teacher-dashboard',
};

export default function WalesPrep() { return <TestPrepPage config={config} />; }
