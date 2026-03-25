import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getIrelandQuestionsForExam, getIrelandDomainsForExam, IRELAND_TEST_CONFIG } from '../data/ireland-questions';

const examOptions = [
  { id: 'numeracy', label: 'Numeracy', examLabel: 'Number, data & problem solving' },
  { id: 'literacy', label: 'Literacy', examLabel: 'Reading, SPaG & writing' },
  { id: 'professional', label: 'Professional Knowledge', examLabel: 'Curriculum, Teaching Council, Droichead' },
];

const config = {
  title: 'Ireland Teacher Prep',
  resultsStorageKey: 'allen-ace-ireland-results',
  adaptiveStorageKey: 'allen-ace-ireland-adaptive',
  examOptions,
  defaultExamId: 'numeracy',
  getQuestionsForExam: getIrelandQuestionsForExam,
  getDomainsForExam: getIrelandDomainsForExam,
  getTestConfig: (id) => IRELAND_TEST_CONFIG[id] || IRELAND_TEST_CONFIG.numeracy,
  hasFullExamAccess: true,
  examLabelsForHistory: Object.fromEntries(examOptions.map((o) => [o.id, o.label])),
  backLink: '/teacher-dashboard',
};

export default function IrelandPrep() { return <TestPrepPage config={config} />; }
