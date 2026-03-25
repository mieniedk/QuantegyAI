import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getKenyaQuestionsForExam, getKenyaDomainsForExam, KENYA_TEST_CONFIG } from '../data/kenya-questions';

const examOptions = [
  { id: 'numeracy', label: 'Numeracy', examLabel: 'Number, data & problem solving' },
  { id: 'literacy', label: 'Literacy', examLabel: 'Reading, SPaG & writing' },
  { id: 'professional', label: 'Professional Knowledge', examLabel: 'CBC, TSC, safeguarding' },
];

const config = {
  title: 'Kenya Teacher Prep',
  resultsStorageKey: 'allen-ace-kenya-results',
  adaptiveStorageKey: 'allen-ace-kenya-adaptive',
  examOptions,
  defaultExamId: 'numeracy',
  getQuestionsForExam: getKenyaQuestionsForExam,
  getDomainsForExam: getKenyaDomainsForExam,
  getTestConfig: (id) => KENYA_TEST_CONFIG[id] || KENYA_TEST_CONFIG.numeracy,
  hasFullExamAccess: true,
  examLabelsForHistory: Object.fromEntries(examOptions.map((o) => [o.id, o.label])),
  backLink: '/teacher-dashboard',
};

export default function KenyaPrep() { return <TestPrepPage config={config} />; }
