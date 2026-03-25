import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getGhanaQuestionsForExam, getGhanaDomainsForExam, GHANA_TEST_CONFIG } from '../data/ghana-questions';

const examOptions = [
  { id: 'numeracy', label: 'Numeracy', examLabel: 'Number, data & problem solving' },
  { id: 'literacy', label: 'Literacy', examLabel: 'Reading, SPaG & writing' },
  { id: 'professional', label: 'Professional Knowledge', examLabel: 'Curriculum, NTC, inclusion' },
];

const config = {
  title: 'Ghana Teacher Prep',
  resultsStorageKey: 'allen-ace-ghana-results',
  adaptiveStorageKey: 'allen-ace-ghana-adaptive',
  examOptions,
  defaultExamId: 'numeracy',
  getQuestionsForExam: getGhanaQuestionsForExam,
  getDomainsForExam: getGhanaDomainsForExam,
  getTestConfig: (id) => GHANA_TEST_CONFIG[id] || GHANA_TEST_CONFIG.numeracy,
  hasFullExamAccess: true,
  examLabelsForHistory: Object.fromEntries(examOptions.map((o) => [o.id, o.label])),
  backLink: '/teacher-dashboard',
};

export default function GhanaPrep() { return <TestPrepPage config={config} />; }
