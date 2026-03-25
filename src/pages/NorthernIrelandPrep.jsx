import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getNorthernIrelandQuestionsForExam, getNorthernIrelandDomainsForExam, NI_TEST_CONFIG } from '../data/northernireland-questions';

const examOptions = [
  { id: 'numeracy', label: 'Numeracy', examLabel: 'Number, data & problem solving' },
  { id: 'literacy', label: 'Literacy', examLabel: 'Reading, SPaG & writing' },
  { id: 'professional', label: 'Professional Knowledge', examLabel: 'NI Curriculum, GTCNI, safeguarding' },
];

const config = {
  title: 'Northern Ireland Teacher Prep',
  resultsStorageKey: 'allen-ace-northernireland-results',
  adaptiveStorageKey: 'allen-ace-northernireland-adaptive',
  examOptions,
  defaultExamId: 'numeracy',
  getQuestionsForExam: getNorthernIrelandQuestionsForExam,
  getDomainsForExam: getNorthernIrelandDomainsForExam,
  getTestConfig: (id) => NI_TEST_CONFIG[id] || NI_TEST_CONFIG.numeracy,
  hasFullExamAccess: true,
  examLabelsForHistory: Object.fromEntries(examOptions.map((o) => [o.id, o.label])),
  backLink: '/teacher-dashboard',
};

export default function NorthernIrelandPrep() { return <TestPrepPage config={config} />; }
