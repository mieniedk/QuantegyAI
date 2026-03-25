import React from 'react';
import TestPrepPage from './TestPrepPage';
import {
  getCanadaQuestionsForExam,
  getCanadaDomainsForExam,
  CANADA_TEST_CONFIG,
} from '../data/canada-questions';

const examOptions = [
  { id: 'ontario', label: 'Ontario', examLabel: 'Math Proficiency & Professional Knowledge' },
  { id: 'bc', label: 'British Columbia', examLabel: 'Numeracy & BC Curriculum' },
  { id: 'alberta', label: 'Alberta', examLabel: 'Program of Studies & Math' },
  { id: 'quebec', label: 'Quebec', examLabel: 'Mathématiques & Programme' },
  { id: 'saskatchewan', label: 'Saskatchewan', examLabel: 'Curriculum & Professional Practice' },
  { id: 'manitoba', label: 'Manitoba', examLabel: 'Numeracy & Curriculum' },
  { id: 'nova_scotia', label: 'Nova Scotia', examLabel: 'Curriculum Outcomes & Practice' },
  { id: 'new_brunswick', label: 'New Brunswick', examLabel: 'Curriculum & Bilingual Context' },
  { id: 'newfoundland', label: 'Newfoundland and Labrador', examLabel: 'Curriculum & Assessment' },
  { id: 'pei', label: 'Prince Edward Island', examLabel: 'Curriculum & Pedagogy' },
  { id: 'nwt', label: 'Northwest Territories', examLabel: 'Curriculum & Northern Context' },
  { id: 'yukon', label: 'Yukon', examLabel: 'Curriculum & First Nations' },
  { id: 'nunavut', label: 'Nunavut', examLabel: 'Inuit Qaujimajatuqangit & Curriculum' },
];

function getTestConfig(examId) {
  return CANADA_TEST_CONFIG[examId] || CANADA_TEST_CONFIG.ontario;
}

const examLabelsForHistory = Object.fromEntries(
  examOptions.map((o) => [o.id, o.label])
);

const config = {
  title: 'Canada Teacher Prep',
  resultsStorageKey: 'allen-ace-canada-results',
  adaptiveStorageKey: 'allen-ace-canada-adaptive',
  examOptions,
  defaultExamId: 'ontario',
  getQuestionsForExam: getCanadaQuestionsForExam,
  getDomainsForExam: getCanadaDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory,
  backLink: '/teacher-dashboard',
};

export default function CanadaPrep() {
  return <TestPrepPage config={config} />;
}
