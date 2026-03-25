import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getNigeriaQuestionsForExam, getNigeriaDomainsForExam, NIGERIA_TEST_CONFIG } from '../data/nigeria-questions';

const examOptions = [
  { id: 'numeracy', label: 'Numeracy', examLabel: 'Number, data & problem solving' },
  { id: 'literacy', label: 'Literacy', examLabel: 'Reading, SPaG & writing' },
  { id: 'professional', label: 'Professional Knowledge', examLabel: 'UBE, TRCN, inclusion' },
];

const config = {
  title: 'Nigeria Teacher Prep',
  resultsStorageKey: 'allen-ace-nigeria-results',
  adaptiveStorageKey: 'allen-ace-nigeria-adaptive',
  examOptions,
  defaultExamId: 'numeracy',
  getQuestionsForExam: getNigeriaQuestionsForExam,
  getDomainsForExam: getNigeriaDomainsForExam,
  getTestConfig: (id) => NIGERIA_TEST_CONFIG[id] || NIGERIA_TEST_CONFIG.numeracy,
  hasFullExamAccess: true,
  examLabelsForHistory: Object.fromEntries(examOptions.map((o) => [o.id, o.label])),
  backLink: '/teacher-dashboard',
};

export default function NigeriaPrep() { return <TestPrepPage config={config} />; }
