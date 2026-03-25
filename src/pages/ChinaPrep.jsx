import React from 'react';
import TestPrepPage from './TestPrepPage';
import {
  getChinaQuestionsForExam,
  getChinaDomainsForExam,
  CHINA_TEST_CONFIG,
} from '../data/china-questions';

const examOptions = [
  { id: 'comprehensive_en', label: 'Comprehensive Quality (English)', examLabel: 'Literacy, ethics, logic' },
  { id: 'comprehensive_zh', label: '综合素质 (中文)', examLabel: '综合素养、职业道德、逻辑推理' },
  { id: 'pedagogy_en', label: 'Pedagogy & Psychology (English)', examLabel: 'Child development, learning theory, teaching design' },
  { id: 'pedagogy_zh', label: '教育知识与能力 (中文)', examLabel: '儿童发展、学习理论、教学设计' },
  { id: 'subject_en', label: 'Subject & Teaching (English)', examLabel: 'Subject knowledge, methods, assessment' },
  { id: 'subject_zh', label: '学科知识与教学能力 (中文)', examLabel: '学科知识、教学方法、评价与反思' },
];

function getTestConfig(examId) {
  return CHINA_TEST_CONFIG[examId] || CHINA_TEST_CONFIG.comprehensive_en;
}

const examLabelsForHistory = Object.fromEntries(
  examOptions.map((o) => [o.id, o.label])
);

const config = {
  title: 'China Teacher Prep',
  resultsStorageKey: 'allen-ace-china-results',
  adaptiveStorageKey: 'allen-ace-china-adaptive',
  examOptions,
  defaultExamId: 'comprehensive_en',
  getQuestionsForExam: getChinaQuestionsForExam,
  getDomainsForExam: getChinaDomainsForExam,
  getTestConfig,
  hasFullExamAccess: true,
  examLabelsForHistory,
  backLink: '/teacher-dashboard',
};

export default function ChinaPrep() {
  return <TestPrepPage config={config} />;
}
