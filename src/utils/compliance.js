/**
 * Compliance & Accreditation Engine
 * Standards mapping, evidence tracking, audit exports, competency progression.
 */
import { getClasses, getGameResults, getAssignments, getGrades, getDiscussions, getExitTicketResponses } from './storage';
import { TEKS_STANDARDS } from '../data/teks';
import { STANDARDS as TAXONOMY_STANDARDS } from '../data/taxonomy';

const COMPLIANCE_KEY = 'allen-ace-compliance';
const EVIDENCE_KEY = 'allen-ace-evidence';
const MAPPING_KEY = 'allen-ace-standards-mapping';

// ═══════════════════════════════════════════════════════════════════
// ACCREDITATION FRAMEWORKS
// ═══════════════════════════════════════════════════════════════════

export const FRAMEWORKS = [
  {
    id: 'teks',
    name: 'Texas Essential Knowledge & Skills (TEKS)',
    region: 'Texas, USA',
    type: 'K-12 Standards',
    description: 'State-mandated curriculum standards for Texas public schools.',
  },
  {
    id: 'staar',
    name: 'STAAR Assessment Standards',
    region: 'Texas, USA',
    type: 'Assessment Framework',
    description: 'State of Texas Assessments of Academic Readiness benchmarks.',
  },
  {
    id: 'texes',
    name: 'Texas Examinations of Educator Standards',
    region: 'Texas, USA',
    type: 'Educator Certification',
    description: 'Certification standards for Texas educators.',
  },
  {
    id: 'ccss',
    name: 'Common Core State Standards',
    region: 'United States',
    type: 'K-12 Standards',
    description: 'National education standards adopted by most U.S. states.',
  },
  {
    id: 'aqf',
    name: 'Australian Qualifications Framework',
    region: 'Australia',
    type: 'Higher Ed / RTO',
    description: 'National qualifications framework for Australian education and training.',
  },
  {
    id: 'rto',
    name: 'RTO Compliance Standards',
    region: 'Australia',
    type: 'RTO Accreditation',
    description: 'Standards for Registered Training Organisations under ASQA.',
  },
  {
    id: 'caps',
    name: 'CAPS (Curriculum Assessment Policy)',
    region: 'South Africa',
    type: 'K-12 Standards',
    description: 'National curriculum framework for South African schools.',
  },
  {
    id: 'custom',
    name: 'Custom Framework',
    region: 'Global',
    type: 'Custom',
    description: 'Define your own accreditation or competency framework.',
  },
];

// ═══════════════════════════════════════════════════════════════════
// STANDARDS MAPPING
// ═══════════════════════════════════════════════════════════════════

export const getStandardsMappings = () => {
  try { return JSON.parse(localStorage.getItem(MAPPING_KEY) || '[]'); } catch { return []; }
};

export const saveStandardsMappings = (mappings) => {
  localStorage.setItem(MAPPING_KEY, JSON.stringify(mappings));
};

export const addStandardsMapping = (mapping) => {
  const mappings = getStandardsMappings();
  const newMapping = {
    id: `map-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...mapping,
  };
  mappings.push(newMapping);
  saveStandardsMappings(mappings);
  return newMapping;
};

export const getMappingsForClass = (classId) =>
  getStandardsMappings().filter((m) => m.classId === classId);

export const getMappingsForFramework = (frameworkId) =>
  getStandardsMappings().filter((m) => m.frameworkId === frameworkId);

// ═══════════════════════════════════════════════════════════════════
// EVIDENCE TRACKING
// ═══════════════════════════════════════════════════════════════════

export const getEvidence = () => {
  try { return JSON.parse(localStorage.getItem(EVIDENCE_KEY) || '[]'); } catch { return []; }
};

export const saveEvidence = (evidence) => {
  localStorage.setItem(EVIDENCE_KEY, JSON.stringify(evidence));
};

export const addEvidence = (entry) => {
  const evidence = getEvidence();
  const newEntry = {
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  evidence.push(newEntry);
  saveEvidence(evidence);
  return newEntry;
};

export const getEvidenceForStandard = (standardId) =>
  getEvidence().filter((e) => e.standardId === standardId || (e.standards || []).includes(standardId));

export const getEvidenceForStudent = (studentId) =>
  getEvidence().filter((e) => e.studentId === studentId);

export const getEvidenceForClass = (classId) =>
  getEvidence().filter((e) => e.classId === classId);

/**
 * Auto-collect evidence from existing platform data.
 * Scans game results, discussions, exit tickets and maps them to standards.
 */
export const autoCollectEvidence = (classId) => {
  const results = getGameResults().filter((r) => r.classId === classId);
  const discussions = getDiscussions().filter((d) => d.classId === classId);
  const exitTickets = getExitTicketResponses();
  const existingEvidence = getEvidence();
  const existingIds = new Set(existingEvidence.map((e) => e.sourceId));
  const newEvidence = [];

  results.forEach((r) => {
    if (existingIds.has(r.id)) return;
    const teksIds = (r.teks || '').split(',').map((t) => t.trim()).filter(Boolean);
    if (teksIds.length === 0 && r.gameId) teksIds.push(r.gameId);

    newEvidence.push({
      sourceId: r.id,
      type: 'game-result',
      classId,
      studentId: r.studentId,
      standards: teksIds,
      score: r.score,
      total: r.total,
      correct: r.correct,
      timestamp: r.timestamp,
      description: `Game: ${r.gameId || 'Unknown'} — Score: ${r.score}% (${r.correct}/${r.total})`,
      artifact: { gameId: r.gameId, score: r.score, correct: r.correct, total: r.total, time: r.time },
    });
  });

  discussions.forEach((d) => {
    (d.replies || []).forEach((reply) => {
      const key = `${d.id}-${reply.id}`;
      if (existingIds.has(key)) return;
      newEvidence.push({
        sourceId: key,
        type: 'discussion',
        classId,
        studentId: reply.authorId,
        standards: [],
        score: d.grades?.[reply.authorId] || null,
        timestamp: reply.createdAt,
        description: `Discussion reply in "${d.title || d.prompt || 'Discussion'}"`,
        artifact: { discussionId: d.id, replyId: reply.id },
      });
    });
  });

  if (newEvidence.length > 0) {
    const allEvidence = [...existingEvidence, ...newEvidence.map((e) => ({
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...e,
    }))];
    saveEvidence(allEvidence);
  }

  return newEvidence.length;
};

// ═══════════════════════════════════════════════════════════════════
// COMPETENCY PROGRESSION
// ═══════════════════════════════════════════════════════════════════

/**
 * Build a competency map for a student across all standards in a class.
 */
export const getStudentCompetencyMap = (studentId, classId) => {
  const evidence = getEvidenceForStudent(studentId).filter((e) => e.classId === classId);
  const competencies = {};

  evidence.forEach((e) => {
    (e.standards || []).forEach((std) => {
      if (!competencies[std]) {
        competencies[std] = { standardId: std, attempts: 0, totalScore: 0, evidence: [], lastSeen: null };
      }
      competencies[std].attempts += 1;
      if (e.score != null) competencies[std].totalScore += e.score;
      competencies[std].evidence.push(e.id);
      if (!competencies[std].lastSeen || e.timestamp > competencies[std].lastSeen) {
        competencies[std].lastSeen = e.timestamp;
      }
    });
  });

  Object.values(competencies).forEach((c) => {
    c.avgScore = c.attempts > 0 ? Math.round(c.totalScore / c.attempts) : 0;
    c.level = c.attempts === 0 ? 'not-started'
      : c.avgScore >= 85 ? 'mastered'
      : c.avgScore >= 65 ? 'proficient'
      : c.avgScore >= 40 ? 'developing'
      : 'struggling';
  });

  return competencies;
};

/**
 * Build a class-wide competency overview.
 */
export const getClassCompetencyOverview = (classId) => {
  const cls = getClasses().find((c) => c.id === classId);
  if (!cls) return { students: [], standards: {} };

  const students = (cls.students || []).map((s) => ({
    ...s,
    competencies: getStudentCompetencyMap(s.id, classId),
  }));

  const allStandards = {};
  students.forEach((s) => {
    Object.entries(s.competencies).forEach(([std, data]) => {
      if (!allStandards[std]) allStandards[std] = { id: std, mastered: 0, proficient: 0, developing: 0, struggling: 0, notStarted: 0, total: 0 };
      allStandards[std][data.level === 'not-started' ? 'notStarted' : data.level] += 1;
      allStandards[std].total += 1;
    });
  });

  return { students, standards: allStandards };
};

// ═══════════════════════════════════════════════════════════════════
// AUDIT EXPORT
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate a complete audit bundle for a class.
 */
export const generateAuditBundle = (classId) => {
  const cls = getClasses().find((c) => c.id === classId);
  if (!cls) return null;

  const assignments = getAssignments().filter((a) => a.classId === classId);
  const results = getGameResults().filter((r) => r.classId === classId);
  const grades = getGrades();
  const discussions = getDiscussions().filter((d) => d.classId === classId);
  const evidence = getEvidenceForClass(classId);
  const mappings = getMappingsForClass(classId);
  const overview = getClassCompetencyOverview(classId);

  const students = (cls.students || []).map((s) => {
    const studentResults = results.filter((r) => r.studentId === s.id);
    const scores = studentResults.map((r) => r.score).filter((v) => v != null);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const studentEvidence = evidence.filter((e) => e.studentId === s.id);

    return {
      id: s.id,
      name: s.name,
      joinedAt: s.joinedAt,
      averageScore: avg,
      totalSessions: studentResults.length,
      evidenceCount: studentEvidence.length,
      competencies: getStudentCompetencyMap(s.id, classId),
    };
  });

  const standardsCoverage = {};
  const teksStandards = cls.teksStandards || [];
  teksStandards.forEach((std) => {
    const stdEvidence = evidence.filter((e) => (e.standards || []).includes(std));
    standardsCoverage[std] = {
      id: std,
      evidenceCount: stdEvidence.length,
      studentsAssessed: new Set(stdEvidence.map((e) => e.studentId)).size,
      avgScore: stdEvidence.filter((e) => e.score != null).length > 0
        ? Math.round(stdEvidence.filter((e) => e.score != null).reduce((s, e) => s + e.score, 0) / stdEvidence.filter((e) => e.score != null).length)
        : null,
    };
  });

  return {
    metadata: {
      exportDate: new Date().toISOString(),
      platform: 'Quantegy AI',
      version: '1.0',
      classId: cls.id,
      className: cls.name,
      teacher: cls.teacher,
      classType: cls.classType,
      gradeLevel: cls.gradeLevel || cls.gradeId,
      createdAt: cls.createdAt,
    },
    summary: {
      studentCount: students.length,
      assignmentCount: assignments.length,
      totalSessions: results.length,
      evidenceArtifacts: evidence.length,
      standardsMapped: Object.keys(standardsCoverage).length,
      classAverage: students.filter((s) => s.averageScore != null).length > 0
        ? Math.round(students.filter((s) => s.averageScore != null).reduce((sum, s) => sum + s.averageScore, 0) / students.filter((s) => s.averageScore != null).length)
        : null,
    },
    standardsCoverage,
    standardsMappings: mappings,
    students,
    assignments: assignments.map((a) => ({ id: a.id, name: a.name, gameId: a.gameId, teks: a.focusTeks || a.teks })),
    evidence: evidence.slice(0, 500),
    competencyOverview: overview.standards,
    discussions: discussions.map((d) => ({
      id: d.id, title: d.title || d.prompt, replyCount: (d.replies || []).length,
      grades: d.grades,
    })),
  };
};

/**
 * Export audit bundle as downloadable JSON.
 */
export const downloadAuditBundle = (classId) => {
  const bundle = generateAuditBundle(classId);
  if (!bundle) return false;

  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `audit-${bundle.metadata.className.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

/**
 * Export as CSV for spreadsheet-based auditors.
 */
export const downloadEvidenceCSV = (classId) => {
  const evidence = getEvidenceForClass(classId);
  if (evidence.length === 0) return false;

  const headers = ['ID', 'Type', 'Student ID', 'Standards', 'Score', 'Date', 'Description'];
  const rows = evidence.map((e) => [
    e.id,
    e.type,
    e.studentId || '',
    (e.standards || []).join('; '),
    e.score ?? '',
    e.timestamp || e.createdAt || '',
    `"${(e.description || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `evidence-${classId}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};
