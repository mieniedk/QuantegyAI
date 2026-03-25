// localStorage helpers with server-side persistence for auth data

import { fetchWithRetry } from './api.js';

const STORAGE_KEYS = {
  classes: 'allen-ace-classes',
  grades: 'allen-ace-grades',
  assignments: 'allen-ace-assignments',
  teachers: 'allen-ace-teachers',
  teacherProfiles: 'allen-ace-teacher-profiles',
  masteryAnalytics: 'allen-ace-mastery',
  gameResults: 'allen-ace-game-results',
  announcements: 'allen-ace-announcements',
  discussions: 'allen-ace-discussions',
  modules: 'allen-ace-modules',
  chatMessages: 'allen-ace-chat',
  spaces: 'allen-ace-spaces',
  spacePosts: 'allen-ace-space-posts',
  muddiestActivities: 'allen-ace-muddiest-activities',
  muddiestResponses: 'allen-ace-muddiest-responses',
  minutePaperActivities: 'allen-ace-minute-paper-activities',
  minutePaperResponses: 'allen-ace-minute-paper-responses',
  activity321: 'allen-ace-321-activities',
  activity321Responses: 'allen-ace-321-responses',
  tpsActivities: 'allen-ace-tps-activities',
  tpsThinkResponses: 'allen-ace-tps-think-responses',
  tpsPairResponses: 'allen-ace-tps-pair-responses',
  exitTicketActivities: 'allen-ace-exit-ticket-activities',
  exitTicketResponses: 'allen-ace-exit-ticket-responses',
  peerReviews: 'allen-ace-peer-reviews',
  marketplaceCourses: 'allen-ace-marketplace-courses',
  transactions: 'allen-ace-transactions',
  affiliates: 'allen-ace-affiliates',
  certificates: 'allen-ace-certificates',
};

// ── JWT Token Management ──

const TOKEN_KEY = 'quantegy-auth-token';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('quantegy-teacher-user');
  localStorage.removeItem('quantegy-student-user');
}

function authHeaders() {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ── Server-backed auth helpers ──

async function apiFetch(url, options = {}) {
  try {
    const res = await fetchWithRetry(url, {
      headers: authHeaders(),
      ...options,
    });
    const data = await res.json();
    if (res.status === 401 && data.error?.includes('expired')) {
      clearAuth();
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
    return data;
  } catch (err) {
    console.warn('API request failed:', err);
    return { success: false, error: 'Unable to connect. Please check your internet connection and try again.' };
  }
}

export async function serverSignup(username, password) {
  const result = await apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (result.success) {
    if (result.token) setAuthToken(result.token);
    const teachers = getTeachers();
    if (!teachers.some((t) => t.username === username)) {
      saveTeachers([...teachers, { username }]);
    }
    if (result.subscription) {
      const SUBS_KEY = 'allen-ace-subscriptions';
      const all = JSON.parse(localStorage.getItem(SUBS_KEY) || '{}');
      all[username] = result.subscription;
      localStorage.setItem(SUBS_KEY, JSON.stringify(all));
    }
  }
  return result;
}

export async function serverLogin(username, password) {
  const result = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (result.success) {
    if (result.token) setAuthToken(result.token);
    const teachers = getTeachers();
    if (!teachers.some((t) => t.username === username)) {
      saveTeachers([...teachers, { username }]);
    }
    if (result.profile) {
      const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.teacherProfiles) || '{}');
      profiles[username] = result.profile;
      localStorage.setItem(STORAGE_KEYS.teacherProfiles, JSON.stringify(profiles));
    }
    if (result.subscription) {
      const SUBS_KEY = 'allen-ace-subscriptions';
      const all = JSON.parse(localStorage.getItem(SUBS_KEY) || '{}');
      all[username] = result.subscription;
      localStorage.setItem(SUBS_KEY, JSON.stringify(all));
    }
    if (result.classes && result.classes.length > 0) {
      const localClasses = getClasses();
      const merged = [...result.classes];
      localClasses.forEach((lc) => {
        if (!merged.some((sc) => sc.id === lc.id)) merged.push(lc);
      });
      localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(merged));
    }
    if (result.assignments && result.assignments.length > 0) {
      const localAssignments = getAssignments();
      const merged = [...result.assignments];
      localAssignments.forEach((la) => {
        if (!merged.some((sa) => sa.id === la.id)) merged.push(la);
      });
      localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(merged));
    }
    if (result.gameResults && result.gameResults.length > 0) {
      const localResults = getGameResults();
      const merged = [...result.gameResults];
      localResults.forEach((lr) => {
        if (!merged.some((sr) => sr.id === lr.id)) merged.push(lr);
      });
      localStorage.setItem(STORAGE_KEYS.gameResults, JSON.stringify(merged));
    }
    if (result.grades && result.grades.length > 0) {
      const localGrades = getGrades();
      const merged = [...result.grades];
      localGrades.forEach((lg) => {
        if (!merged.some((sg) => sg.studentId === lg.studentId && sg.assignmentId === lg.assignmentId)) merged.push(lg);
      });
      localStorage.setItem(STORAGE_KEYS.grades, JSON.stringify(merged));
    }
    // Restore modules from server
    if (result.modules && result.modules.length > 0) {
      const local = getModules();
      const merged = [...result.modules];
      local.forEach((l) => { if (!merged.some((s) => s.id === l.id)) merged.push(l); });
      localStorage.setItem(STORAGE_KEYS.modules, JSON.stringify(merged));
    }
    // Restore announcements from server
    if (result.announcements && result.announcements.length > 0) {
      const local = getAnnouncements();
      const merged = [...result.announcements];
      local.forEach((l) => { if (!merged.some((s) => s.id === l.id)) merged.push(l); });
      localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(merged));
    }
    // Restore discussions from server
    if (result.discussions && result.discussions.length > 0) {
      const local = getDiscussions();
      const merged = [...result.discussions];
      local.forEach((l) => { if (!merged.some((s) => s.id === l.id)) merged.push(l); });
      localStorage.setItem(STORAGE_KEYS.discussions, JSON.stringify(merged));
    }
    // Restore chat messages from server
    if (result.chatMessages && result.chatMessages.length > 0) {
      const local = getChatMessages();
      const merged = [...result.chatMessages];
      local.forEach((l) => { if (!merged.some((s) => s.id === l.id)) merged.push(l); });
      localStorage.setItem(STORAGE_KEYS.chatMessages, JSON.stringify(merged));
    }
  }
  return result;
}

// ── Student Auth ──

export async function studentSignup(username, password, displayName, classCode) {
  const result = await apiFetch('/api/auth/student/signup', {
    method: 'POST',
    body: JSON.stringify({ username, password, displayName, classCode }),
  });
  if (result.success && result.token) {
    setAuthToken(result.token);
    localStorage.setItem('quantegy-student-user', JSON.stringify(result.student));
  }
  return result;
}

export async function studentLogin(username, password) {
  const result = await apiFetch('/api/auth/student/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (result.success && result.token) {
    setAuthToken(result.token);
    localStorage.setItem('quantegy-student-user', JSON.stringify(result.student));
  }
  return result;
}

export async function studentJoinClass(classCode) {
  return apiFetch('/api/auth/student/join-class', {
    method: 'POST',
    body: JSON.stringify({ classCode }),
  });
}

/** Fetch grades for logged-in student from server (respects grade posting policies). */
export async function fetchStudentGradesFromServer() {
  const result = await apiFetch('/api/auth/student/grades');
  if (result.success) return { grades: result.grades || [], assignments: result.assignments || [], classes: result.classes || [] };
  return null;
}

export async function verifySession() {
  const token = getAuthToken();
  if (!token) return null;
  const result = await apiFetch('/api/auth/verify', { method: 'POST' });
  if (result.success) return result.user;
  clearAuth();
  return null;
}

// Sync ALL teacher data to server in a single bulk request
export function syncAllToServer() {
  const username = localStorage.getItem('quantegy-teacher-user');
  if (!username) return;

  const allClasses = getClasses();
  const classes = allClasses.filter((c) => c.teacher === username);
  const classIds = classes.map((c) => c.id);

  const payload = {
    classes,
    assignments: getAssignments().filter((a) => classIds.includes(a.classId)),
    gameResults: getGameResults(),
    grades: getGrades(),
    modules: getModules().filter((m) => classIds.includes(m.classId)),
    announcements: getAnnouncements().filter((a) => classIds.includes(a.classId)),
    discussions: getDiscussions().filter((d) => classIds.includes(d.classId)),
    chatMessages: getChatMessages().filter((m) => classIds.includes(m.classId)),
  };

  fetchWithRetry('/api/auth/sync-all', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
    .then(r => r.json())
    .catch(err => console.warn('Server sync failed:', err));
}

export const syncClassesToServer = syncAllToServer;

let _syncTimer = null;
function _debouncedServerSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => syncAllToServer(), 800);
}

export async function serverLoadAccounts() {
  const result = await apiFetch('/api/auth/teachers');
  if (result.success && result.teachers) {
    return result.teachers;
  }
  return null;
}

export async function serverForgotLookup(username) {
  return apiFetch('/api/auth/forgot-lookup', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export async function serverResetPassword(username, newPassword) {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ username, newPassword }),
  });
}

export async function serverSaveProfile(username, profile) {
  const result = await apiFetch('/api/auth/profile', {
    method: 'POST',
    body: JSON.stringify({ username, profile }),
  });
  saveTeacherProfile(username, profile);
  return result;
}

export async function serverSaveSubscription(username, subscription) {
  return apiFetch('/api/auth/subscription', {
    method: 'POST',
    body: JSON.stringify({ username, subscription }),
  });
}

export const getMasteryAnalytics = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.masteryAnalytics);
    return data ? JSON.parse(data) : getDefaultMasteryData();
  } catch {
    return getDefaultMasteryData();
  }
};

export const saveMasteryAnalytics = (data) => {
  localStorage.setItem(STORAGE_KEYS.masteryAnalytics, JSON.stringify(data));
};

function getDefaultMasteryData() {
  return {
    byTeks: {
      '3.4C': { classMastery: 68, subConcepts: { 'equal-groups': 82, 'arrays': 54, 'area-models': 61, 'repeated-addition': 73 } },
      '3.4A': { classMastery: 72, subConcepts: { 'one-step': 88, 'two-step': 61, 'place-value': 68 } },
      '3.3A': { classMastery: 59, subConcepts: { 'concrete': 75, 'pictorial': 52, 'denominators': 51 } },
      'A.2A': { classMastery: 81, subConcepts: { 'domain': 85, 'range': 77 } },
      'A.5A': { classMastery: 64, subConcepts: { 'one-var': 70, 'distributive': 58 } },
    },
  };
}

export const getTeachers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.teachers);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveTeachers = (teachers) => {
  localStorage.setItem(STORAGE_KEYS.teachers, JSON.stringify(teachers));
};

export const getClasses = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.classes);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveClasses = (classes) => {
  localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(classes));
  // Auto-sync to server
  _debouncedServerSync();
};

export const getGrades = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.grades);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveGrades = (grades) => {
  localStorage.setItem(STORAGE_KEYS.grades, JSON.stringify(grades));
  _debouncedServerSync();
};

/**
 * Sync all auto-gradeable data sources into the grades array.
 * Sources: game results (auto-graded assignments), discussion grades, exit tickets.
 * Returns { synced, total, bySource } stats.
 */
export const syncGradebook = (classId) => {
  const grades = getGrades();
  const assignments = getAssignments();
  const gameResults = getGameResults();
  const discussions = getDiscussions();
  const exitTicketActivities = getExitTicketActivities();
  const exitTicketResponses = getExitTicketResponses();
  const classes = getClasses();

  const classFilter = classId ? (a) => a.classId === classId : () => true;
  const classAssignments = assignments.filter(classFilter);
  const targetClasses = classId ? classes.filter((c) => c.id === classId) : classes;

  let synced = 0;
  const bySource = { game: 0, discussion: 0, exitTicket: 0 };

  const applyLatePenalty = (assignment, rawScore, submittedAt) => {
    if (!assignment?.dueDate || !assignment?.latePolicy || assignment.latePolicy === 'accept' || assignment.latePolicy === 'none') return rawScore;
    if (rawScore == null) return rawScore;
    const grace = (assignment.gracePeriodMinutes || 0) * 60000;
    const due = new Date(assignment.dueDate).getTime() + grace;
    const sub = new Date(submittedAt || 0).getTime();
    if (sub <= due) return rawScore;
    const daysLate = Math.ceil((sub - due) / 86400000);
    if (assignment.latePolicy === 'deduct10') {
      const penalty = Math.min(100, daysLate * 10);
      return Math.max(0, rawScore - (rawScore * penalty / 100));
    }
    if (assignment.latePolicy === 'deduct20') {
      const penalty = Math.min(100, daysLate * 20);
      return Math.max(0, rawScore - (rawScore * penalty / 100));
    }
    if (assignment.latePolicy === 'half') return Math.min(rawScore, 50);
    return rawScore;
  };

  const upsert = (studentId, assignmentId, score, source, assignment, submittedAt) => {
    const existing = grades.findIndex(
      (g) => g.studentId === studentId && g.assignmentId === assignmentId
    );
    const adjustedScore = assignment && submittedAt
      ? applyLatePenalty(assignment, score, submittedAt)
      : score;
    const finalScore = Math.round(Math.min(100, Math.max(0, adjustedScore)));
    const entry = { studentId, assignmentId, score: finalScore, source, syncedAt: new Date().toISOString() };
    if (existing >= 0) {
      if (grades[existing].source === 'manual') return;
      grades[existing] = { ...grades[existing], ...entry };
    } else {
      grades.push(entry);
      synced++;
    }
    bySource[source] = (bySource[source] || 0) + 1;
  };

  // ── 1. Game results → grades (for auto-grade assignments) ──
  for (const assignment of classAssignments) {
    if (assignment.autoGrade === false || !assignment.gameId) continue;
    const cls = targetClasses.find((c) => c.id === assignment.classId);
    if (!cls) continue;

    for (const student of (cls.students || [])) {
      let results = gameResults
        .filter((r) => r.studentId === student.id && r.assignmentId === assignment.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      if (results.length === 0) continue;
      const best = results[0];
      const score = best.percentage != null ? best.percentage
        : best.score != null && best.total ? Math.round((best.score / best.total) * 100)
        : best.score != null ? best.score : null;

      if (score != null) {
        upsert(student.id, assignment.id, score, 'game', assignment, best.timestamp || best.submittedAt);
      }
    }
  }

  // ── 2. Discussion grades → grades ──
  for (const cls of targetClasses) {
    const classDiscs = discussions.filter((d) => d.classId === cls.id);
    for (const disc of classDiscs) {
      if (!disc.grades || Object.keys(disc.grades).length === 0) continue;
      const discAssignmentId = `disc-${disc.id}`;

      let discAssignment = assignments.find((a) => a.id === discAssignmentId);
      if (!discAssignment) {
        discAssignment = {
          id: discAssignmentId,
          name: `Discussion: ${(disc.title || disc.prompt || 'Untitled').slice(0, 40)}`,
          classId: cls.id,
          autoGrade: true,
          source: 'discussion',
        };
        assignments.push(discAssignment);
      }

      for (const [studentId, grade] of Object.entries(disc.grades)) {
        const score = typeof grade === 'number' ? grade : parseInt(grade, 10);
        if (!isNaN(score)) upsert(studentId, discAssignmentId, score, 'discussion', discAssignment, disc.updatedAt);
      }
    }
  }

  // ── 3. Exit ticket responses → grades ──
  for (const cls of targetClasses) {
    const classETs = exitTicketActivities.filter((et) => et.classId === cls.id);
    for (const et of classETs) {
      const etAssignmentId = `et-${et.id}`;
      const responses = exitTicketResponses.filter((r) => r.activityId === et.id);
      if (responses.length === 0) continue;

      let etAssignment = assignments.find((a) => a.id === etAssignmentId);
      if (!etAssignment) {
        etAssignment = {
          id: etAssignmentId,
          name: `Exit Ticket: ${(et.title || et.question || 'Untitled').slice(0, 40)}`,
          classId: cls.id,
          autoGrade: true,
          source: 'exitTicket',
        };
        assignments.push(etAssignment);
      }

      for (const resp of responses) {
        if (!resp.studentId) continue;
        const score = resp.score != null ? resp.score
          : resp.correct != null ? (resp.correct ? 100 : 0)
          : resp.percentage != null ? resp.percentage : null;
        if (score != null) upsert(resp.studentId, etAssignmentId, score, 'exitTicket', etAssignment, resp.submittedAt || resp.createdAt);
      }
    }
  }

  saveGrades(grades);
  saveAssignments(assignments);

  // Auto-check certificate eligibility for all students after sync
  try {
    for (const cls of targetClasses) {
      if (!cls.students?.length) continue;
      for (const student of cls.students) {
        checkAndIssueCertificate(student.id, cls.id);
      }
    }
  } catch (err) { console.warn('Certificate check (best-effort):', err); }

  return { synced, total: grades.length, bySource };
};

export const getAssignments = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.assignments);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveAssignments = (assignments) => {
  localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(assignments));
  _debouncedServerSync();
};

/* ── Teacher Profiles ── */

export const getTeacherProfile = (username) => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.teacherProfiles);
    const profiles = data ? JSON.parse(data) : {};
    return profiles[username] || null;
  } catch {
    return null;
  }
};

export const saveTeacherProfile = (username, profile) => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.teacherProfiles);
    const profiles = data ? JSON.parse(data) : {};
    profiles[username] = { ...profile, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.teacherProfiles, JSON.stringify(profiles));
  } catch (err) {
    console.warn('Save teacher profile failed:', err);
  }
};

export const getClassesByTeacher = (username) => {
  const classes = getClasses();
  return classes.filter((c) => c.teacher === username);
};

/* ── Class Codes ── */

/** Generate a short, unique, human-friendly class code (e.g. "MATH-7X3K") */
export const generateClassCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/I/1 to avoid confusion
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

/** Look up a class by its joinCode (case-insensitive) */
export const getClassByCode = (code) => {
  if (!code) return null;
  const classes = getClasses();
  return classes.find((c) => c.joinCode && c.joinCode.toUpperCase() === code.toUpperCase()) || null;
};

/** Add a student to a class roster (if not already in it). Returns updated class. */
export const addStudentToClass = (classId, studentName) => {
  const classes = getClasses();
  const cls = classes.find((c) => c.id === classId);
  if (!cls) return null;
  if (!cls.students) cls.students = [];

  // Check if student already exists (case-insensitive)
  const exists = cls.students.find((s) => s.name.toLowerCase() === studentName.toLowerCase());
  if (exists) return { cls, student: exists, isNew: false };

  const newStudent = {
    id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: studentName.trim(),
    joinedAt: new Date().toISOString(),
  };
  cls.students.push(newStudent);
  saveClasses(classes);
  return { cls, student: newStudent, isNew: true };
};

/**
 * Find a matching assignment for a class + game combination.
 * Used to auto-link game results when assignment ID is not in the URL.
 */
export const findMatchingAssignment = (classId, gameId, focusTeks) => {
  if (!classId || !gameId) return null;
  const assignments = getAssignments();
  if (focusTeks) {
    const exact = assignments.find(
      (a) => a.classId === classId && a.gameId === gameId && a.focusTeks === focusTeks
    );
    if (exact) return exact;
    // Also check if focusTeks is contained within a multi-standard assignment
    const partial = assignments.find(
      (a) => a.classId === classId && a.gameId === gameId && (a.focusTeks || '').split(',').includes(focusTeks)
    );
    if (partial) return partial;
  }
  // Fall back to any assignment matching classId + gameId
  return assignments.find(
    (a) => a.classId === classId && a.gameId === gameId
  ) || null;
};

/* ── Game Results (auto-grading) ── */

export const getGameResults = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.gameResults);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveGameResult = (result) => {
  const results = getGameResults();
  const newResult = {
    ...result,
    id: `gr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  results.push(newResult);
  localStorage.setItem(STORAGE_KEYS.gameResults, JSON.stringify(results));
  _debouncedServerSync();

  // Auto-sync this result into gradebook if assignment has autoGrade (with late penalty)
  try {
    if (newResult.assignmentId && newResult.studentId) {
      const assignments = getAssignments();
      const assignment = assignments.find((a) => a.id === newResult.assignmentId);
      if (assignment && assignment.autoGrade !== false) {
        let score = newResult.percentage != null ? newResult.percentage
          : newResult.score != null && newResult.total ? Math.round((newResult.score / newResult.total) * 100)
          : newResult.score != null ? newResult.score : null;
        if (score != null) {
          const grace = (assignment.gracePeriodMinutes || 0) * 60000;
          const due = assignment.dueDate ? new Date(assignment.dueDate).getTime() + grace : 0;
          const sub = new Date(newResult.timestamp || 0).getTime();
          if (assignment.latePolicy && assignment.latePolicy !== 'accept' && assignment.latePolicy !== 'none' && due && sub > due) {
            const daysLate = Math.ceil((sub - due) / 86400000);
            if (assignment.latePolicy === 'deduct10') score = Math.max(0, score - (score * Math.min(100, daysLate * 10) / 100));
            else if (assignment.latePolicy === 'deduct20') score = Math.max(0, score - (score * Math.min(100, daysLate * 20) / 100));
            else if (assignment.latePolicy === 'half') score = Math.min(score, 50);
          }
          const grades = getGrades();
          const idx = grades.findIndex((g) => g.studentId === newResult.studentId && g.assignmentId === newResult.assignmentId);
          const entry = { studentId: newResult.studentId, assignmentId: newResult.assignmentId, score: Math.round(Math.min(100, Math.max(0, score))), source: 'game', syncedAt: new Date().toISOString() };
          if (idx >= 0 && grades[idx].source !== 'manual') { grades[idx] = { ...grades[idx], ...entry }; }
          else if (idx < 0) { grades.push(entry); }
          saveGrades(grades);
        }
      }
    }
  } catch (err) { console.warn('Gradebook sync (best-effort):', err); }

  // Auto-check certificate eligibility after game completion
  try {
    if (newResult.studentId && newResult.classId) {
      checkAndIssueCertificate(newResult.studentId, newResult.classId);
    }
  } catch (err) { console.warn('Certificate check (best-effort):', err); }
};

/**
 * Get game results for a specific student + assignment.
 * Returns the latest result if multiple exist.
 */
export const getStudentAssignmentScore = (studentId, assignmentId) => {
  const results = getGameResults();
  const matches = results
    .filter((r) => r.studentId === studentId && r.assignmentId === assignmentId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return matches[0] || null;
};

/**
 * Get all game results for a student across all assignments.
 */
export const getStudentResults = (studentId) => {
  return getGameResults().filter((r) => r.studentId === studentId);
};

/**
 * Get all game results for a class.
 */
export const getClassResults = (classId) => {
  return getGameResults().filter((r) => r.classId === classId);
};

/* ── Announcements ── */

export const getAnnouncements = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.announcements) || '[]');
  } catch { return []; }
};

export const saveAnnouncements = (announcements) => {
  localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(announcements));
  _debouncedServerSync();
};

export const getClassAnnouncements = (classId) =>
  getAnnouncements().filter(a => a.classId === classId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const addAnnouncement = (announcement) => {
  const all = getAnnouncements();
  all.push({ ...announcement, id: `ann-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, createdAt: new Date().toISOString() });
  saveAnnouncements(all);
  return all;
};

export const deleteAnnouncement = (id) => {
  saveAnnouncements(getAnnouncements().filter(a => a.id !== id));
};

/* ── Discussions ── */

export const getDiscussions = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.discussions) || '[]');
  } catch { return []; }
};

export const saveDiscussions = (discussions) => {
  localStorage.setItem(STORAGE_KEYS.discussions, JSON.stringify(discussions));
  _debouncedServerSync();
};

export const getClassDiscussions = (classId) => {
  try {
    const list = (getDiscussions() || []).filter(d => d && d.classId === classId);
    return list.sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
  } catch { return []; }
};

export const addDiscussion = (discussion) => {
  const all = getDiscussions();
  const newDisc = {
    ...discussion,
    id: `disc-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    createdAt: new Date().toISOString(),
    replies: [],
    grades: {},
  };
  all.push(newDisc);
  saveDiscussions(all);
  return newDisc;
};

export const addReply = (discussionId, reply) => {
  const all = getDiscussions();
  const disc = all.find(d => d.id === discussionId);
  if (!disc) return null;
  const newReply = {
    ...reply,
    id: `reply-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    createdAt: new Date().toISOString(),
    likes: [],
  };
  disc.replies.push(newReply);
  disc.lastActivity = new Date().toISOString();
  saveDiscussions(all);
  return newReply;
};

export const toggleReplyLike = (discussionId, replyId, userId) => {
  const all = getDiscussions();
  const disc = all.find(d => d.id === discussionId);
  if (!disc) return;
  const reply = disc.replies.find(r => r.id === replyId);
  if (!reply) return;
  if (!reply.likes) reply.likes = [];
  const idx = reply.likes.indexOf(userId);
  if (idx >= 0) reply.likes.splice(idx, 1);
  else reply.likes.push(userId);
  saveDiscussions(all);
};

export const gradeDiscussion = (discussionId, studentId, grade) => {
  const all = getDiscussions();
  const disc = all.find(d => d.id === discussionId);
  if (!disc) return;
  if (!disc.grades) disc.grades = {};
  disc.grades[studentId] = grade;
  saveDiscussions(all);

  // Auto-sync to gradebook
  try {
    const score = typeof grade === 'number' ? grade : parseInt(grade, 10);
    if (!isNaN(score)) {
      const discAssignmentId = `disc-${discussionId}`;
      const assignments = getAssignments();
      if (!assignments.find((a) => a.id === discAssignmentId)) {
        assignments.push({
          id: discAssignmentId,
          name: `Discussion: ${(disc.title || disc.prompt || 'Untitled').slice(0, 40)}`,
          classId: disc.classId,
          autoGrade: true,
          source: 'discussion',
        });
        saveAssignments(assignments);
      }
      const grades = getGrades();
      const idx = grades.findIndex((g) => g.studentId === studentId && g.assignmentId === discAssignmentId);
      const entry = { studentId, assignmentId: discAssignmentId, score: Math.round(Math.min(100, Math.max(0, score))), source: 'discussion', syncedAt: new Date().toISOString() };
      if (idx >= 0 && grades[idx].source !== 'manual') { grades[idx] = { ...grades[idx], ...entry }; }
      else if (idx < 0) { grades.push(entry); }
      saveGrades(grades);
    }
  } catch (err) { console.warn('Discussion grade sync (best-effort):', err); }
};

export const deleteDiscussion = (id) => {
  saveDiscussions(getDiscussions().filter(d => d.id !== id));
};

export const deleteReply = (discussionId, replyId) => {
  const all = getDiscussions();
  const disc = all.find(d => d.id === discussionId);
  if (!disc) return;
  disc.replies = disc.replies.filter(r => r.id !== replyId);
  saveDiscussions(all);
};

/* ── Collaborative Spaces ── */

export const getSpaces = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.spaces) || '[]'); } catch { return []; }
};

export const saveSpaces = (spaces) => {
  localStorage.setItem(STORAGE_KEYS.spaces, JSON.stringify(spaces));
  _debouncedServerSync();
};

export const getClassSpaces = (classId) => {
  return getSpaces().filter(s => s.classId === classId).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const createSpace = (space) => {
  const all = getSpaces();
  const newSpace = {
    ...space,
    id: `space-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    memberIds: space.memberIds || [],
    createdAt: new Date().toISOString(),
  };
  all.push(newSpace);
  saveSpaces(all);
  return newSpace;
};

export const updateSpace = (spaceId, updates) => {
  const all = getSpaces();
  const idx = all.findIndex(s => s.id === spaceId);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates };
  saveSpaces(all);
  return all[idx];
};

export const deleteSpace = (spaceId) => {
  saveSpaces(getSpaces().filter(s => s.id !== spaceId));
  saveSpacePosts(getSpacePosts().filter(p => p.spaceId !== spaceId));
};

export const addMemberToSpace = (spaceId, studentId) => {
  const all = getSpaces();
  const space = all.find(s => s.id === spaceId);
  if (!space) return;
  if (!space.memberIds) space.memberIds = [];
  if (space.memberIds.includes(studentId)) return;
  space.memberIds.push(studentId);
  saveSpaces(all);
};

export const removeMemberFromSpace = (spaceId, studentId) => {
  const all = getSpaces();
  const space = all.find(s => s.id === spaceId);
  if (!space) return;
  if (space.memberIds) space.memberIds = space.memberIds.filter(id => id !== studentId);
  saveSpaces(all);
};

export const getSpacePosts = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.spacePosts) || '[]'); } catch { return []; }
};

export const saveSpacePosts = (posts) => {
  localStorage.setItem(STORAGE_KEYS.spacePosts, JSON.stringify(posts));
  _debouncedServerSync();
};

export const getPostsForSpace = (spaceId) => {
  return getSpacePosts()
    .filter(p => p.spaceId === spaceId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const addSpacePost = (spaceId, post) => {
  const all = getSpacePosts();
  const newPost = {
    ...post,
    id: `spost-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    spaceId,
    createdAt: new Date().toISOString(),
  };
  all.push(newPost);
  saveSpacePosts(all);
  return newPost;
};

export const deleteSpacePost = (postId) => {
  saveSpacePosts(getSpacePosts().filter(p => p.id !== postId));
};

/* ── Muddiest Point ── */

export const getMuddiestActivities = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.muddiestActivities) || '[]'); } catch { return []; }
};

export const saveMuddiestActivities = (activities) => {
  localStorage.setItem(STORAGE_KEYS.muddiestActivities, JSON.stringify(activities));
  _debouncedServerSync();
};

export const getClassMuddiestActivities = (classId) => {
  return getMuddiestActivities()
    .filter(a => a.classId === classId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const addMuddiestActivity = (activity) => {
  const all = getMuddiestActivities();
  const newAct = {
    ...activity,
    id: `mp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  all.push(newAct);
  saveMuddiestActivities(all);
  return newAct;
};

export const deleteMuddiestActivity = (activityId) => {
  saveMuddiestActivities(getMuddiestActivities().filter(a => a.id !== activityId));
  saveMuddiestResponses(getMuddiestResponses().filter(r => r.activityId !== activityId));
};

export const getMuddiestResponses = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.muddiestResponses) || '[]'); } catch { return []; }
};

export const saveMuddiestResponses = (responses) => {
  localStorage.setItem(STORAGE_KEYS.muddiestResponses, JSON.stringify(responses));
  _debouncedServerSync();
};

export const getResponsesForActivity = (activityId) => {
  return getMuddiestResponses()
    .filter(r => r.activityId === activityId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const addMuddiestResponse = (activityId, response) => {
  const all = getMuddiestResponses();
  const newResp = {
    ...response,
    id: `mpr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    activityId,
    createdAt: new Date().toISOString(),
  };
  all.push(newResp);
  saveMuddiestResponses(all);
  return newResp;
};

export const hasStudentResponded = (activityId, studentId) => {
  return getMuddiestResponses().some(r => r.activityId === activityId && r.studentId === studentId);
};

/* ── Minute Papers ── */

export const getMinutePaperActivities = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.minutePaperActivities) || '[]'); } catch { return []; }
};

export const saveMinutePaperActivities = (activities) => {
  localStorage.setItem(STORAGE_KEYS.minutePaperActivities, JSON.stringify(activities));
  _debouncedServerSync();
};

export const getClassMinutePaperActivities = (classId) => {
  return getMinutePaperActivities()
    .filter(a => a.classId === classId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const addMinutePaperActivity = (activity) => {
  const all = getMinutePaperActivities();
  const newAct = {
    ...activity,
    id: `mnp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  all.push(newAct);
  saveMinutePaperActivities(all);
  return newAct;
};

export const deleteMinutePaperActivity = (activityId) => {
  saveMinutePaperActivities(getMinutePaperActivities().filter(a => a.id !== activityId));
  saveMinutePaperResponses(getMinutePaperResponses().filter(r => r.activityId !== activityId));
};

export const getMinutePaperResponses = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.minutePaperResponses) || '[]'); } catch { return []; }
};

export const saveMinutePaperResponses = (responses) => {
  localStorage.setItem(STORAGE_KEYS.minutePaperResponses, JSON.stringify(responses));
  _debouncedServerSync();
};

export const getResponsesForMinutePaper = (activityId) => {
  return getMinutePaperResponses()
    .filter(r => r.activityId === activityId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const addMinutePaperResponse = (activityId, response) => {
  const all = getMinutePaperResponses();
  const newResp = {
    ...response,
    id: `mnpr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    activityId,
    createdAt: new Date().toISOString(),
  };
  all.push(newResp);
  saveMinutePaperResponses(all);
  return newResp;
};

export const hasStudentRespondedToMinutePaper = (activityId, studentId) => {
  return getMinutePaperResponses().some(r => r.activityId === activityId && r.studentId === studentId);
};

/* ── 3-2-1 Activity ── */

export const get321Activities = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.activity321) || '[]'); } catch { return []; }
};

export const save321Activities = (activities) => {
  localStorage.setItem(STORAGE_KEYS.activity321, JSON.stringify(activities));
  _debouncedServerSync();
};

export const getClass321Activities = (classId) => {
  return get321Activities()
    .filter(a => a.classId === classId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const add321Activity = (activity) => {
  const all = get321Activities();
  const newAct = { ...activity, id: `321-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() };
  all.push(newAct);
  save321Activities(all);
  return newAct;
};

export const delete321Activity = (activityId) => {
  save321Activities(get321Activities().filter(a => a.id !== activityId));
  save321Responses(get321Responses().filter(r => r.activityId !== activityId));
};

export const get321Responses = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.activity321Responses) || '[]'); } catch { return []; }
};

export const save321Responses = (responses) => {
  localStorage.setItem(STORAGE_KEYS.activity321Responses, JSON.stringify(responses));
  _debouncedServerSync();
};

export const getResponsesFor321 = (activityId) => {
  return get321Responses().filter(r => r.activityId === activityId).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const add321Response = (activityId, response) => {
  const all = get321Responses();
  const newResp = { ...response, id: `321r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, activityId, createdAt: new Date().toISOString() };
  all.push(newResp);
  save321Responses(all);
  return newResp;
};

export const hasStudentResponded321 = (activityId, studentId) => {
  return get321Responses().some(r => r.activityId === activityId && r.studentId === studentId);
};

/* ── Think-Pair-Share ── */
export const getTPSActivities = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.tpsActivities) || '[]'); } catch { return []; }
};
export const saveTPSActivities = (activities) => {
  localStorage.setItem(STORAGE_KEYS.tpsActivities, JSON.stringify(activities));
};
export const getClassTPSActivities = (classId) => {
  return getTPSActivities().filter(a => a.classId === classId).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};
export const addTPSActivity = (activity) => {
  const all = getTPSActivities();
  const newAct = { ...activity, id: `tps-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() };
  all.push(newAct);
  saveTPSActivities(all);
  return newAct;
};
export const deleteTPSActivity = (activityId) => {
  saveTPSActivities(getTPSActivities().filter(a => a.id !== activityId));
  saveTPSThinkResponses(getTPSThinkResponses().filter(r => r.activityId !== activityId));
  saveTPSPairResponses(getTPSPairResponses().filter(r => r.activityId !== activityId));
};

export const getTPSThinkResponses = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.tpsThinkResponses) || '[]'); } catch { return []; }
};
export const saveTPSThinkResponses = (responses) => {
  localStorage.setItem(STORAGE_KEYS.tpsThinkResponses, JSON.stringify(responses));
};
export const getThinkResponsesForTPS = (activityId) => {
  return getTPSThinkResponses().filter(r => r.activityId === activityId).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
};
export const addTPSThinkResponse = (activityId, response) => {
  const all = getTPSThinkResponses();
  const newResp = { ...response, id: `tps-think-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, activityId, createdAt: new Date().toISOString() };
  all.push(newResp);
  saveTPSThinkResponses(all);
  return newResp;
};
export const hasStudentThinkTPS = (activityId, studentId) => {
  return getTPSThinkResponses().some(r => r.activityId === activityId && r.studentId === studentId);
};

export const getTPSPairResponses = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.tpsPairResponses) || '[]'); } catch { return []; }
};
export const saveTPSPairResponses = (responses) => {
  localStorage.setItem(STORAGE_KEYS.tpsPairResponses, JSON.stringify(responses));
};
export const getPairResponsesForTPS = (activityId) => {
  return getTPSPairResponses().filter(r => r.activityId === activityId);
};
export const addTPSPairResponse = (activityId, pairId, response) => {
  const all = getTPSPairResponses();
  const existing = all.find(r => r.activityId === activityId && r.pairId === pairId);
  if (existing) {
    existing.pairResponse = response.pairResponse;
    existing.submittedBy = response.submittedBy;
    existing.updatedAt = new Date().toISOString();
    saveTPSPairResponses(all);
    return existing;
  }
  const newResp = { ...response, id: `tps-pair-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, activityId, pairId, createdAt: new Date().toISOString() };
  all.push(newResp);
  saveTPSPairResponses(all);
  return newResp;
};
export const getPairForStudent = (activityId, studentId, thinkResponses) => {
  const sorted = [...thinkResponses].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  const idx = sorted.findIndex(r => r.studentId === studentId);
  if (idx < 0) return null;
  const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
  if (pairIdx < 0 || pairIdx >= sorted.length) return null;
  const partner = sorted[pairIdx];
  const pairId = [studentId, partner.studentId].sort().join('-');
  return { partner, pairId };
};

/* ── Exit Ticket ── */
export const getExitTicketActivities = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.exitTicketActivities) || '[]'); } catch { return []; }
};
export const saveExitTicketActivities = (activities) => {
  localStorage.setItem(STORAGE_KEYS.exitTicketActivities, JSON.stringify(activities));
};
export const getClassExitTicketActivities = (classId) => {
  return getExitTicketActivities().filter(a => a.classId === classId).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};
export const addExitTicketActivity = (activity) => {
  const all = getExitTicketActivities();
  const newAct = { ...activity, id: `et-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() };
  all.push(newAct);
  saveExitTicketActivities(all);
  return newAct;
};
export const deleteExitTicketActivity = (activityId) => {
  saveExitTicketActivities(getExitTicketActivities().filter(a => a.id !== activityId));
  saveExitTicketResponses(getExitTicketResponses().filter(r => r.activityId !== activityId));
};
export const getExitTicketResponses = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.exitTicketResponses) || '[]'); } catch { return []; }
};
export const saveExitTicketResponses = (responses) => {
  localStorage.setItem(STORAGE_KEYS.exitTicketResponses, JSON.stringify(responses));
};
export const getResponsesForExitTicket = (activityId) => {
  return getExitTicketResponses().filter(r => r.activityId === activityId).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};
export const addExitTicketResponse = (activityId, response) => {
  const all = getExitTicketResponses();
  const newResp = { ...response, id: `etr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, activityId, createdAt: new Date().toISOString() };
  all.push(newResp);
  saveExitTicketResponses(all);
  return newResp;
};
export const hasStudentRespondedExitTicket = (activityId, studentId) => {
  return getExitTicketResponses().some(r => r.activityId === activityId && r.studentId === studentId);
};

/* ── Peer Review (discussion replies) ── */
export const getPeerReviews = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.peerReviews) || '[]'); } catch { return []; }
};
export const savePeerReviews = (reviews) => {
  localStorage.setItem(STORAGE_KEYS.peerReviews, JSON.stringify(reviews));
};
export const getPeerReviewsForReply = (discussionId, replyId) => {
  return getPeerReviews().filter(r => r.discussionId === discussionId && r.replyId === replyId).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
};
export const addPeerReview = (review) => {
  const all = getPeerReviews();
  const newRev = { ...review, id: `pr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() };
  all.push(newRev);
  savePeerReviews(all);
  return newRev;
};
export const hasStudentReviewedReply = (discussionId, replyId, reviewerId) => {
  return getPeerReviews().some(r => r.discussionId === discussionId && r.replyId === replyId && r.reviewerId === reviewerId);
};

/* ── Content Modules ── */
export const getModules = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.modules) || '[]'); } catch { return []; }
};
export const saveModules = (m) => { localStorage.setItem(STORAGE_KEYS.modules, JSON.stringify(m)); _debouncedServerSync(); };
export const getClassModules = (classId) => getModules().filter(m => m.classId === classId);
export const addModule = (mod) => {
  const all = getModules();
  const newMod = { ...mod, id: `mod-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, createdAt: new Date().toISOString(), items: [] };
  all.push(newMod);
  saveModules(all);
  return newMod;
};
export const updateModule = (id, updates) => {
  const all = getModules();
  const idx = all.findIndex(m => m.id === id);
  if (idx >= 0) { all[idx] = { ...all[idx], ...updates }; saveModules(all); }
  return all;
};
export const deleteModule = (id) => { saveModules(getModules().filter(m => m.id !== id)); };
export const addModuleItem = (moduleId, item) => {
  const all = getModules();
  const mod = all.find(m => m.id === moduleId);
  if (!mod) return;
  mod.items.push({ ...item, id: `item-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, createdAt: new Date().toISOString() });
  saveModules(all);
  return mod;
};
export const deleteModuleItem = (moduleId, itemId) => {
  const all = getModules();
  const mod = all.find(m => m.id === moduleId);
  if (!mod) return;
  mod.items = mod.items.filter(i => i.id !== itemId);
  saveModules(all);
};

/* ── Pre-built Course Content Population ── */

/**
 * Populate a class with pre-built lesson content from the courseContent library.
 * Adds modules and lesson items for the given grade and domains.
 * @param {string} classId - The class to populate
 * @param {string} gradeId - e.g. 'grade3', 'grade4', 'grade5', 'algebra'
 * @param {string[]} domainIds - Which domains to include (or empty for all)
 * @returns {{ modules: number, items: number }} counts of added content
 */
export const populateCourseContent = async (classId, gradeId, domainIds = []) => {
  const { COURSE_CONTENT } = await import('../data/courseContent.js');
  const gradeContent = COURSE_CONTENT[gradeId];
  if (!gradeContent) return { modules: 0, items: 0 };

  const domains = domainIds.length > 0
    ? domainIds.filter(d => gradeContent[d])
    : Object.keys(gradeContent);

  let moduleCount = 0;
  let itemCount = 0;

  for (const domainId of domains) {
    const domain = gradeContent[domainId];
    for (const contentModule of domain.modules) {
      const mod = addModule({
        classId,
        title: `${domain.icon} ${contentModule.title}`,
        description: contentModule.description,
        teks: contentModule.teks,
        domainId,
        type: 'prebuilt',
      });
      moduleCount++;

      for (const lesson of contentModule.lessons) {
        const lessonHtml = formatLessonAsHtml(lesson);
        addModuleItem(mod.id, {
          title: lesson.title,
          type: 'lesson',
          duration: lesson.duration,
          teks: lesson.teks,
          objective: lesson.objective,
          content: lessonHtml,
          lessonData: lesson,
        });
        itemCount++;
      }
    }
  }

  return { modules: moduleCount, items: itemCount };
};

function formatLessonAsHtml(lesson) {
  const s = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return Object.entries(obj).map(([k, v]) => {
      if (Array.isArray(v)) return `<strong>${k}:</strong> ${v.join(', ')}`;
      if (typeof v === 'object') return `<strong>${k}:</strong> ${s(v)}`;
      return `<strong>${k}:</strong> ${v}`;
    }).join('<br/>');
  };

  const sections = [];
  sections.push(`<h3>${lesson.title}</h3>`);
  sections.push(`<p><strong>Objective:</strong> ${lesson.objective}</p>`);
  sections.push(`<p><strong>Duration:</strong> ${lesson.duration} | <strong>TEKS:</strong> ${lesson.teks}</p>`);

  if (lesson.warmUp) {
    sections.push(`<h4>Warm-Up: ${lesson.warmUp.activity} (${lesson.warmUp.duration})</h4>`);
    sections.push(`<p>${lesson.warmUp.description}</p>`);
  }
  if (lesson.directInstruction) {
    sections.push(`<h4>Direct Instruction (${lesson.directInstruction.duration})</h4>`);
    sections.push(`<ol>${lesson.directInstruction.steps.map(s => `<li>${s}</li>`).join('')}</ol>`);
    if (lesson.directInstruction.keyVocabulary?.length) {
      sections.push(`<p><strong>Key Vocabulary:</strong> ${lesson.directInstruction.keyVocabulary.join(', ')}</p>`);
    }
  }
  if (lesson.guidedPractice) {
    sections.push(`<h4>Guided Practice: ${lesson.guidedPractice.activity} (${lesson.guidedPractice.duration})</h4>`);
    sections.push(`<p>${lesson.guidedPractice.description}</p>`);
  }
  if (lesson.independentPractice) {
    sections.push(`<h4>Independent Practice: ${lesson.independentPractice.activity} (${lesson.independentPractice.duration})</h4>`);
    sections.push(`<p>${lesson.independentPractice.description}</p>`);
  }
  if (lesson.closure) {
    sections.push(`<h4>Closure (${lesson.closure.duration})</h4>`);
    sections.push(`<p><strong>Exit Ticket:</strong> ${lesson.closure.exitTicket}</p>`);
    sections.push(`<p><strong>Reflection:</strong> ${lesson.closure.reflection}</p>`);
  }
  if (lesson.differentiation) {
    sections.push(`<h4>Differentiation</h4>`);
    sections.push(`<ul>`);
    sections.push(`<li><strong>Approaching:</strong> ${lesson.differentiation.approaching}</li>`);
    sections.push(`<li><strong>On Level:</strong> ${lesson.differentiation.onLevel}</li>`);
    sections.push(`<li><strong>Advanced:</strong> ${lesson.differentiation.advanced}</li>`);
    sections.push(`</ul>`);
  }
  if (lesson.materials?.length) {
    sections.push(`<p><strong>Materials:</strong> ${lesson.materials.join(', ')}</p>`);
  }
  if (lesson.teacherNotes) {
    sections.push(`<p><em>Teacher Notes: ${lesson.teacherNotes}</em></p>`);
  }

  return sections.join('\n');
}

/* ── Chat Messages ── */
export const getChatMessages = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.chatMessages) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};
export const saveChatMessages = (msgs) => { localStorage.setItem(STORAGE_KEYS.chatMessages, JSON.stringify(msgs)); _debouncedServerSync(); };

/** Class-wide chat (no recipientId) */
export const getClassChat = (classId) => {
  if (!classId) return [];
  return getChatMessages()
    .filter(m => m && m.classId === classId && !m.recipientId)
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
};

/** Direct messages between teacher and a student (1-on-1) */
export const getDMChat = (classId, participant1, participant2) => {
  if (!classId || participant1 == null || participant2 == null) return [];
  const all = getChatMessages().filter(m => m.classId === classId && m.recipientId && m.authorId);
  return all
    .filter(m => {
      const a = m.authorId;
      const r = m.recipientId;
      if (!a || !r) return false;
      return (a === participant1 && r === participant2) || (a === participant2 && r === participant1);
    })
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
};

/** Get list of students who have DMs with teacher in this class (for teacher's DM dropdown) */
export const getDMThreadsWithStudents = (classId) => {
  const all = getChatMessages().filter(m => m.classId === classId && m.recipientId);
  const students = new Set();
  all.forEach(m => {
    if (m.authorId === 'teacher' || m.recipientId === 'teacher') {
      students.add(m.authorId === 'teacher' ? m.recipientId : m.authorId);
    }
  });
  return [...students];
};

export const sendChatMessage = (msg) => {
  const all = getChatMessages();
  const newMsg = {
    ...msg,
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    createdAt: new Date().toISOString(),
  };
  all.push(newMsg);
  if (all.length > 5000) all.splice(0, all.length - 5000);
  saveChatMessages(all);
  return newMsg;
};
export const deleteChatMessage = (msgId) => {
  saveChatMessages(getChatMessages().filter(m => m.id !== msgId));
};

// ─── Class Duplication ──────────────────────────────────────────
export const duplicateClass = (classId, newName) => {
  const classes = getClasses();
  const original = classes.find((c) => c.id === classId);
  if (!original) return null;

  // Generate a unique join code
  let code;
  do { code = generateClassCode(); } while (classes.some((c) => c.joinCode === code));

  const newClass = {
    ...original,
    id: `cls-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: newName || `${original.name} (Copy)`,
    joinCode: code,
    students: [],
    createdAt: new Date().toISOString(),
  };
  classes.push(newClass);
  saveClasses(classes);

  // Duplicate assignments (without grades/results)
  const allAssignments = getAssignments();
  const origAssignments = allAssignments.filter((a) => a.classId === classId);
  const newAssignments = origAssignments.map((a, i) => ({
    ...a,
    id: `a-dup-${Date.now()}-${i}`,
    classId: newClass.id,
  }));
  saveAssignments([...allAssignments, ...newAssignments]);

  // Duplicate modules
  const allModules = getModules();
  const origModules = allModules.filter((m) => m.classId === classId);
  const newModules = origModules.map((m, i) => ({
    ...m,
    id: `mod-dup-${Date.now()}-${i}`,
    classId: newClass.id,
    createdAt: new Date().toISOString(),
  }));
  saveModules([...allModules, ...newModules]);

  // Duplicate discussions (without replies/grades)
  const allDiscs = getDiscussions();
  const origDiscs = allDiscs.filter((d) => d.classId === classId);
  const newDiscs = origDiscs.map((d, i) => ({
    ...d,
    id: `disc-dup-${Date.now()}-${i}`,
    classId: newClass.id,
    replies: [],
    grades: {},
    createdAt: new Date().toISOString(),
  }));
  saveDiscussions([...allDiscs, ...newDiscs]);

  return newClass;
};

// ─── Activity-Based Attendance ──────────────────────────────────
export const getStudentAttendance = (classId) => {
  const gameResults = getGameResults();
  const discussions = getClassDiscussions(classId);
  const exitTickets = getExitTicketResponses();
  const classes = getClasses();
  const cls = classes.find((c) => c.id === classId);
  if (!cls) return [];

  const students = cls.students || [];
  const today = new Date();
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  return students.map((s) => {
    const studentResults = gameResults.filter((r) => r.studentId === s.id && r.classId === classId);
    const studentReplies = discussions.flatMap((d) => (d.replies || []).filter((r) => r.authorId === s.id));
    const studentTickets = exitTickets.filter((r) => r.studentId === s.id);

    const activityByDay = {};
    studentResults.forEach((r) => {
      if (r.timestamp) {
        const day = new Date(r.timestamp).toISOString().split('T')[0];
        activityByDay[day] = (activityByDay[day] || 0) + 1;
      }
    });
    studentReplies.forEach((r) => {
      if (r.createdAt) {
        const day = new Date(r.createdAt).toISOString().split('T')[0];
        activityByDay[day] = (activityByDay[day] || 0) + 1;
      }
    });
    studentTickets.forEach((r) => {
      if (r.createdAt) {
        const day = new Date(r.createdAt).toISOString().split('T')[0];
        activityByDay[day] = (activityByDay[day] || 0) + 1;
      }
    });

    const presentDays = days.filter((d) => (activityByDay[d] || 0) > 0).length;
    const totalActivities = Object.values(activityByDay).reduce((a, b) => a + b, 0);
    const lastActive = Object.keys(activityByDay).sort().pop() || null;

    return {
      ...s,
      activityByDay,
      presentDays,
      totalActivities,
      lastActive,
      attendanceRate: days.length > 0 ? Math.round((presentDays / days.length) * 100) : 0,
      days,
    };
  });
};

// ─── Hours-Saved Tracker ────────────────────────────────────────
const HOURS_SAVED_KEY = 'allen-ace-hours-saved';

export const getHoursSaved = () => {
  try {
    return JSON.parse(localStorage.getItem(HOURS_SAVED_KEY) || '{"autoGraded":0,"aiGraded":0,"feedbackDrafts":0,"duplications":0,"transformations":0}');
  } catch { return { autoGraded: 0, aiGraded: 0, feedbackDrafts: 0, duplications: 0, transformations: 0 }; }
};

export const trackTimeSaved = (action, count = 1) => {
  const data = getHoursSaved();
  data[action] = (data[action] || 0) + count;
  localStorage.setItem(HOURS_SAVED_KEY, JSON.stringify(data));
  return data;
};

// ─── Dropout Detection & Alert System ────────────────────────────
const ALERTS_KEY = 'allen-ace-alerts';
const DROPOUT_SCAN_KEY = 'allen-ace-dropout-last-scan';

export const getAlerts = () => {
  try { return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]'); } catch { return []; }
};
export const saveAlerts = (alerts) => { localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts)); };
export const dismissAlert = (alertId) => {
  const all = getAlerts().map((a) => a.id === alertId ? { ...a, dismissed: true } : a);
  saveAlerts(all);
  return all;
};
export const getUnreadAlertCount = () => getAlerts().filter((a) => !a.dismissed && !a.read).length;
export const markAlertsRead = () => {
  const all = getAlerts().map((a) => ({ ...a, read: true }));
  saveAlerts(all);
};

/**
 * Background dropout scan — runs automatically, checks all classes for at-risk students.
 * Creates alerts for teachers. Deduplicates so the same student doesn't trigger multiple alerts.
 */
export const runDropoutScan = () => {
  const classes = getClasses();
  const gameResults = getGameResults();
  const alerts = getAlerts();
  const now = Date.now();
  const existingKeys = new Set(alerts.map((a) => a.key));
  let newAlerts = 0;

  for (const cls of classes) {
    if (!cls.students?.length) continue;
    const classResults = gameResults.filter((r) => r.classId === cls.id);

    for (const student of cls.students) {
      const studentResults = classResults
        .filter((r) => r.studentId === student.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      if (studentResults.length === 0) continue;

      const lastActive = new Date(studentResults[0].timestamp);
      const daysSince = Math.floor((now - lastActive.getTime()) / 86400000);

      // Score trend: compare last 5 vs previous 5
      const recent5 = studentResults.slice(0, 5);
      const prev5 = studentResults.slice(5, 10);
      const recentAvg = recent5.length ? recent5.reduce((s, r) => s + (r.percentage ?? r.score ?? 0), 0) / recent5.length : null;
      const prevAvg = prev5.length ? prev5.reduce((s, r) => s + (r.percentage ?? r.score ?? 0), 0) / prev5.length : null;
      const trend = (recentAvg != null && prevAvg != null) ? recentAvg - prevAvg : null;

      let severity = null;
      let reason = '';

      if (daysSince >= 7) { severity = 'critical'; reason = `Inactive for ${daysSince} days`; }
      else if (daysSince >= 5) { severity = 'high'; reason = `Inactive for ${daysSince} days`; }
      else if (daysSince >= 3) { severity = 'medium'; reason = `Inactive for ${daysSince} days`; }
      else if (trend !== null && trend < -20) { severity = 'high'; reason = `Score dropped ${Math.abs(Math.round(trend))}%`; }
      else if (trend !== null && trend < -10) { severity = 'medium'; reason = `Score declining ${Math.abs(Math.round(trend))}%`; }

      if (!severity) continue;

      const weekKey = `dropout-${cls.id}-${student.id}-${Math.floor(now / 604800000)}`;
      if (existingKeys.has(weekKey)) continue;

      alerts.push({
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        key: weekKey,
        type: 'dropout-risk',
        severity,
        classId: cls.id,
        className: cls.name,
        studentId: student.id,
        studentName: student.name,
        reason,
        daysSinceActive: daysSince,
        trend: trend ? Math.round(trend) : null,
        recentAvg: recentAvg ? Math.round(recentAvg) : null,
        createdAt: new Date().toISOString(),
        dismissed: false,
        read: false,
      });
      existingKeys.add(weekKey);
      newAlerts++;
    }
  }

  saveAlerts(alerts);
  localStorage.setItem(DROPOUT_SCAN_KEY, now.toString());
  return { newAlerts, totalAlerts: alerts.filter((a) => !a.dismissed).length };
};

/**
 * Auto-run scan if last scan was > 1 hour ago. Call this on teacher page load.
 */
export const autoDropoutScan = () => {
  const lastScan = parseInt(localStorage.getItem(DROPOUT_SCAN_KEY) || '0', 10);
  const hourAgo = Date.now() - 3600000;
  if (lastScan < hourAgo) return runDropoutScan();
  return null;
};

// ─── Auto-Certificate Issuance ──────────────────────────────────
/**
 * Check if a student has completed all assignments in a class and auto-issue certificate.
 */
export const checkAndIssueCertificate = (studentId, classId) => {
  const classes = getClasses();
  const cls = classes.find((c) => c.id === classId);
  if (!cls) return null;

  const assignments = getAssignments().filter((a) => a.classId === classId);
  if (assignments.length === 0) return null;

  const grades = getGrades();
  const studentGrades = grades.filter((g) => g.studentId === studentId && assignments.some((a) => a.id === g.assignmentId));

  const completedCount = studentGrades.filter((g) => g.score != null && g.score >= 0).length;
  const passingCount = studentGrades.filter((g) => g.score != null && g.score >= 60).length;
  const completionPct = Math.round((completedCount / assignments.length) * 100);

  if (completionPct < 80) return null;

  const passingPct = Math.round((passingCount / assignments.length) * 100);
  if (passingPct < 70) return null;

  const certs = getCertificates();
  const existing = certs.find((c) => c.studentId === studentId && c.classId === classId && c.status === 'valid');
  if (existing) return existing;

  const student = (cls.students || []).find((s) => s.id === studentId);
  const avgScore = studentGrades.length
    ? Math.round(studentGrades.reduce((s, g) => s + (g.score || 0), 0) / studentGrades.length)
    : 0;

  const cert = issueCertificate({
    studentId,
    studentName: student?.name || 'Student',
    courseName: cls.name,
    classId,
    grade: cls.gradeLevel,
    issuer: cls.teacher || 'Quantegy AI',
    issuerName: cls.teacher || 'Quantegy AI',
    autoIssued: true,
    completionPct,
    passingPct,
    avgScore,
  });

  // Create alert for teacher
  const alerts = getAlerts();
  alerts.push({
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    key: `cert-${classId}-${studentId}`,
    type: 'certificate-issued',
    severity: 'info',
    classId,
    className: cls.name,
    studentId,
    studentName: student?.name || 'Student',
    reason: `Auto-issued certificate (${avgScore}% avg, ${completionPct}% complete)`,
    createdAt: new Date().toISOString(),
    dismissed: false,
    read: false,
  });
  saveAlerts(alerts);

  return cert;
};

/**
 * Run certificate check for all students in a class.
 */
export const scanClassForCertificates = (classId) => {
  const cls = getClasses().find((c) => c.id === classId);
  if (!cls?.students?.length) return [];
  const issued = [];
  for (const student of cls.students) {
    const cert = checkAndIssueCertificate(student.id, classId);
    if (cert && cert.autoIssued) issued.push(cert);
  }
  return issued;
};

// ─── Marketplace Courses ────────────────────────────────────────
export const getMarketplaceCourses = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.marketplaceCourses) || '[]'); } catch { return []; }
};
export const saveMarketplaceCourses = (courses) => {
  localStorage.setItem(STORAGE_KEYS.marketplaceCourses, JSON.stringify(courses));
};
export const addMarketplaceCourse = (course) => {
  const all = getMarketplaceCourses();
  const newCourse = {
    ...course,
    id: `mc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    published: false,
    enrollments: 0,
    rating: 0,
    reviews: [],
    revenue: 0,
  };
  all.push(newCourse);
  saveMarketplaceCourses(all);
  return newCourse;
};
export const updateMarketplaceCourse = (courseId, updates) => {
  const all = getMarketplaceCourses();
  const idx = all.findIndex((c) => c.id === courseId);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates };
  saveMarketplaceCourses(all);
  return all[idx];
};
export const getTeacherCourses = (teacher) => getMarketplaceCourses().filter((c) => c.teacher === teacher);
export const getPublishedCourses = () => getMarketplaceCourses().filter((c) => c.published);

// ─── Transactions ───────────────────────────────────────────────
export const getTransactions = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions) || '[]'); } catch { return []; }
};
export const saveTransactions = (txns) => {
  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(txns));
};
export const addTransaction = (txn) => {
  const all = getTransactions();
  const newTxn = {
    ...txn,
    id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'completed',
  };
  all.push(newTxn);
  saveTransactions(all);

  // Update course enrollment count & revenue
  if (txn.courseId) {
    const courses = getMarketplaceCourses();
    const course = courses.find((c) => c.id === txn.courseId);
    if (course) {
      course.enrollments = (course.enrollments || 0) + 1;
      course.revenue = (course.revenue || 0) + (txn.amount || 0);
      saveMarketplaceCourses(courses);
    }
  }

  // Track affiliate commission
  if (txn.affiliateCode) {
    const affiliates = getAffiliateLinks();
    const link = affiliates.find((a) => a.code === txn.affiliateCode);
    if (link) {
      link.conversions = (link.conversions || 0) + 1;
      link.earned = (link.earned || 0) + (txn.amount || 0) * (link.commissionRate || 0.1);
      saveAffiliateLinks(affiliates);
    }
  }

  return newTxn;
};
export const getTeacherTransactions = (teacher) => getTransactions().filter((t) => t.seller === teacher);
export const getBuyerTransactions = (buyer) => getTransactions().filter((t) => t.buyer === buyer);

// ─── Affiliate System ───────────────────────────────────────────
export const getAffiliateLinks = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.affiliates) || '[]'); } catch { return []; }
};
export const saveAffiliateLinks = (links) => {
  localStorage.setItem(STORAGE_KEYS.affiliates, JSON.stringify(links));
};
export const createAffiliateLink = (owner, courseId) => {
  const all = getAffiliateLinks();
  const code = `ref-${Math.random().toString(36).slice(2, 8)}`;
  const link = {
    id: `aff-${Date.now()}`,
    owner,
    courseId,
    code,
    url: `${window.location.origin}/marketplace?ref=${code}`,
    commissionRate: 0.10,
    clicks: 0,
    conversions: 0,
    earned: 0,
    createdAt: new Date().toISOString(),
  };
  all.push(link);
  saveAffiliateLinks(all);
  return link;
};
export const getAffiliatesByOwner = (owner) => getAffiliateLinks().filter((a) => a.owner === owner);
export const trackAffiliateClick = (code) => {
  const all = getAffiliateLinks();
  const link = all.find((a) => a.code === code);
  if (link) { link.clicks = (link.clicks || 0) + 1; saveAffiliateLinks(all); }
};

// ─── Certificates ───────────────────────────────────────────────
export const getCertificates = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.certificates) || '[]'); } catch { return []; }
};
export const saveCertificates = (certs) => {
  localStorage.setItem(STORAGE_KEYS.certificates, JSON.stringify(certs));
};
export const issueCertificate = (data) => {
  const all = getCertificates();
  const verifyId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const cert = {
    ...data,
    id: `cert-${Date.now()}`,
    verifyId,
    verifyUrl: `${window.location.origin}/verify/${verifyId}`,
    issuedAt: new Date().toISOString(),
    status: 'valid',
  };
  all.push(cert);
  saveCertificates(all);
  return cert;
};
export const verifyCertificate = (verifyId) => {
  return getCertificates().find((c) => c.verifyId === verifyId && c.status === 'valid') || null;
};
export const getCertificatesByStudent = (studentId) => getCertificates().filter((c) => c.studentId === studentId);
export const getCertificatesByTeacher = (teacher) => getCertificates().filter((c) => c.issuer === teacher);

/* ── Grade Weighting & Schemes ── */
const GRADE_SETTINGS_KEY = 'allen-ace-grade-settings';
export const getGradeSettings = (classId) => {
  try { const all = JSON.parse(localStorage.getItem(GRADE_SETTINGS_KEY) || '{}'); return all[classId] || null; } catch { return null; }
};
export const saveGradeSettings = (classId, settings) => {
  const all = JSON.parse(localStorage.getItem(GRADE_SETTINGS_KEY) || '{}');
  all[classId] = { ...settings, updatedAt: new Date().toISOString() };
  localStorage.setItem(GRADE_SETTINGS_KEY, JSON.stringify(all));
};
const DEFAULT_GRADE_SCHEME = [
  { letter: 'A', min: 90, color: '#15803d' },
  { letter: 'B', min: 80, color: '#0369a1' },
  { letter: 'C', min: 70, color: '#d97706' },
  { letter: 'D', min: 60, color: '#c2410c' },
  { letter: 'F', min: 0, color: '#dc2626' },
];
export const getGradeScheme = (classId) => {
  const settings = getGradeSettings(classId);
  return settings?.scheme || DEFAULT_GRADE_SCHEME;
};
export const getLetterGrade = (score, classId) => {
  const scheme = getGradeScheme(classId);
  for (const tier of scheme) { if (score >= tier.min) return tier; }
  return scheme[scheme.length - 1];
};
export const getGradeCategories = (classId) => {
  const settings = getGradeSettings(classId);
  return settings?.categories || [];
};
export const saveGradeCategories = (classId, categories) => {
  const settings = getGradeSettings(classId) || {};
  saveGradeSettings(classId, { ...settings, categories });
};
export const saveGradeScheme = (classId, scheme) => {
  const settings = getGradeSettings(classId) || {};
  saveGradeSettings(classId, { ...settings, scheme });
};

const GPA_MAP = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 };

export const getSchemeType = (classId) => {
  const settings = getGradeSettings(classId);
  return settings?.schemeType || 'letter';
};
export const saveSchemeType = (classId, schemeType) => {
  const settings = getGradeSettings(classId) || {};
  saveGradeSettings(classId, { ...settings, schemeType });
};
export const getPassFailThreshold = (classId) => {
  const settings = getGradeSettings(classId);
  return settings?.passFailThreshold ?? 60;
};
export const savePassFailThreshold = (classId, threshold) => {
  const settings = getGradeSettings(classId) || {};
  saveGradeSettings(classId, { ...settings, passFailThreshold: threshold });
};

export const formatGrade = (score, classId) => {
  if (score == null || isNaN(score)) return '—';
  const type = getSchemeType(classId);
  if (type === 'percentage') return `${Math.round(score)}%`;
  if (type === 'points') return `${Math.round(score)}`;
  if (type === 'passfail') {
    const threshold = getPassFailThreshold(classId);
    return score >= threshold ? 'Pass' : 'Fail';
  }
  if (type === 'gpa') {
    const tier = getLetterGrade(score, classId);
    const gpa = GPA_MAP[tier.letter] ?? 0.0;
    return gpa.toFixed(1);
  }
  const tier = getLetterGrade(score, classId);
  return tier.letter;
};
export const computeWeightedAverage = (studentId, classId, assignments, grades) => {
  const categories = getGradeCategories(classId);
  if (!categories.length) {
    const scores = assignments.map(a => { const g = grades.find(g2 => g2.studentId === studentId && g2.assignmentId === a.id); return g ? g.score : null; }).filter(s => s !== null);
    return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  }
  let totalWeight = 0, weightedSum = 0;
  for (const cat of categories) {
    const catAssignments = assignments.filter(a => a.category === cat.id);
    if (!catAssignments.length) continue;
    const scores = catAssignments.map(a => { const g = grades.find(g2 => g2.studentId === studentId && g2.assignmentId === a.id); return g ? g.score : null; }).filter(s => s !== null);
    if (!scores.length) continue;
    const catAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
    weightedSum += catAvg * (cat.weight / 100);
    totalWeight += cat.weight;
  }
  if (totalWeight === 0) return null;
  return (weightedSum / totalWeight) * 100;
};

/* ── Module Prerequisites & Progression ── */
const MODULE_PROGRESS_KEY = 'allen-ace-module-progress';
export const getModuleProgress = (classId, studentId) => {
  try { const all = JSON.parse(localStorage.getItem(MODULE_PROGRESS_KEY) || '{}'); return all[`${classId}:${studentId}`] || {}; } catch { return {}; }
};
export const markModuleItemComplete = (classId, studentId, moduleId, itemId) => {
  const all = JSON.parse(localStorage.getItem(MODULE_PROGRESS_KEY) || '{}');
  const key = `${classId}:${studentId}`;
  if (!all[key]) all[key] = {};
  if (!all[key][moduleId]) all[key][moduleId] = [];
  if (!all[key][moduleId].includes(itemId)) all[key][moduleId].push(itemId);
  localStorage.setItem(MODULE_PROGRESS_KEY, JSON.stringify(all));
};
export const isModuleComplete = (classId, studentId, moduleId) => {
  const progress = getModuleProgress(classId, studentId);
  const mod = getModules().find(m => m.id === moduleId);
  if (!mod?.items?.length) return false;
  const req = mod.completionRequirement || 'all';
  const completed = progress[moduleId] || [];
  if (req === 'all') return mod.items.every(i => completed.includes(i.id));
  return completed.length > 0;
};
export const isModuleUnlocked = (classId, studentId, moduleId) => {
  const mod = getModules().find(m => m.id === moduleId);
  if (!mod?.prerequisiteModuleId) return true;
  return isModuleComplete(classId, studentId, mod.prerequisiteModuleId);
};

/* ── Sections & Differentiated Assignments ── */
const SECTIONS_KEY = 'allen-ace-sections';
export const getSections = (classId) => {
  try { const all = JSON.parse(localStorage.getItem(SECTIONS_KEY) || '{}'); return all[classId] || []; } catch { return []; }
};
export const saveSections = (classId, sections) => {
  const all = JSON.parse(localStorage.getItem(SECTIONS_KEY) || '{}');
  all[classId] = sections;
  localStorage.setItem(SECTIONS_KEY, JSON.stringify(all));
};
export const addSection = (classId, name) => {
  const sections = getSections(classId);
  const sec = { id: `sec-${Date.now()}`, name, studentIds: [], createdAt: new Date().toISOString() };
  saveSections(classId, [...sections, sec]);
  return sec;
};
export const assignStudentToSection = (classId, sectionId, studentId) => {
  const sections = getSections(classId);
  const updated = sections.map(s => s.id === sectionId ? { ...s, studentIds: [...new Set([...s.studentIds, studentId])] } : s);
  saveSections(classId, updated);
};
export const removeStudentFromSection = (classId, sectionId, studentId) => {
  const sections = getSections(classId);
  const updated = sections.map(s => s.id === sectionId ? { ...s, studentIds: s.studentIds.filter(id => id !== studentId) } : s);
  saveSections(classId, updated);
};

/* ── Mastery Paths ── */
const MASTERY_PATHS_KEY = 'allen-ace-mastery-paths';
export const getMasteryPaths = (classId) => {
  try { const all = JSON.parse(localStorage.getItem(MASTERY_PATHS_KEY) || '{}'); return all[classId] || []; } catch { return []; }
};
export const saveMasteryPaths = (classId, paths) => {
  const all = JSON.parse(localStorage.getItem(MASTERY_PATHS_KEY) || '{}');
  all[classId] = paths;
  localStorage.setItem(MASTERY_PATHS_KEY, JSON.stringify(all));
};
export const addMasteryPath = (classId, path) => {
  const paths = getMasteryPaths(classId);
  const mp = { id: `mp-${Date.now()}`, ...path, createdAt: new Date().toISOString() };
  saveMasteryPaths(classId, [...paths, mp]);
  return mp;
};
export const evaluateMasteryPath = (classId, studentId, assessmentId) => {
  const paths = getMasteryPaths(classId);
  const grades = getGrades();
  const g = grades.find(gr => gr.studentId === studentId && gr.assignmentId === assessmentId);
  if (!g) return null;
  const matching = paths.find(p => p.triggerAssessmentId === assessmentId);
  if (!matching) return null;
  for (const rule of (matching.rules || [])) {
    if (g.score >= rule.minScore && g.score <= (rule.maxScore ?? 100)) return rule;
  }
  return null;
};

/* ── ePortfolios ── */
const PORTFOLIOS_KEY = 'allen-ace-portfolios';
export const getPortfolios = () => {
  try { return JSON.parse(localStorage.getItem(PORTFOLIOS_KEY) || '[]'); } catch { return []; }
};
export const savePortfolios = (p) => localStorage.setItem(PORTFOLIOS_KEY, JSON.stringify(p));
export const getStudentPortfolio = (studentId) => getPortfolios().find(p => p.studentId === studentId) || null;
export const createPortfolio = (studentId, studentName, title) => {
  const all = getPortfolios();
  const existing = all.find(p => p.studentId === studentId);
  if (existing) return existing;
  const portfolio = { id: `pf-${Date.now()}`, studentId, studentName, title: title || `${studentName}'s Portfolio`, pages: [], createdAt: new Date().toISOString() };
  savePortfolios([...all, portfolio]);
  return portfolio;
};
export const addPortfolioPage = (portfolioId, page) => {
  const all = getPortfolios();
  const idx = all.findIndex(p => p.id === portfolioId);
  if (idx < 0) return null;
  const newPage = { id: `pp-${Date.now()}`, ...page, createdAt: new Date().toISOString() };
  all[idx].pages.push(newPage);
  savePortfolios(all);
  return newPage;
};
export const updatePortfolioPage = (portfolioId, pageId, updates) => {
  const all = getPortfolios();
  const pIdx = all.findIndex(p => p.id === portfolioId);
  if (pIdx < 0) return;
  all[pIdx].pages = all[pIdx].pages.map(pg => pg.id === pageId ? { ...pg, ...updates } : pg);
  savePortfolios(all);
};
export const deletePortfolioPage = (portfolioId, pageId) => {
  const all = getPortfolios();
  const pIdx = all.findIndex(p => p.id === portfolioId);
  if (pIdx < 0) return;
  all[pIdx].pages = all[pIdx].pages.filter(pg => pg.id !== pageId);
  savePortfolios(all);
};

/* ── Inbox / Messaging ── */
const INBOX_KEY = 'allen-ace-inbox';
export const getInboxMessages = () => {
  try { return JSON.parse(localStorage.getItem(INBOX_KEY) || '[]'); } catch { return []; }
};
export const saveInboxMessages = (msgs) => localStorage.setItem(INBOX_KEY, JSON.stringify(msgs));
export const getConversations = (userId) => {
  const msgs = getInboxMessages();
  const convos = {};
  msgs.filter(m => m.senderId === userId || m.recipientId === userId).forEach(m => {
    const cId = m.conversationId || m.id;
    if (!convos[cId]) convos[cId] = { id: cId, participants: [], messages: [], subject: m.subject || '(no subject)', updatedAt: m.createdAt };
    convos[cId].messages.push(m);
    if (new Date(m.createdAt) > new Date(convos[cId].updatedAt)) convos[cId].updatedAt = m.createdAt;
    [m.senderId, m.recipientId].forEach(p => { if (p && !convos[cId].participants.includes(p)) convos[cId].participants.push(p); });
  });
  return Object.values(convos).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};
export const sendInboxMessage = ({ senderId, senderName, recipientId, recipientName, subject, body, conversationId }) => {
  const all = getInboxMessages();
  const msg = { id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, conversationId: conversationId || `conv-${Date.now()}`, senderId, senderName, recipientId, recipientName, subject, body, read: false, createdAt: new Date().toISOString() };
  saveInboxMessages([...all, msg]);
  return msg;
};
export const markMessageRead = (messageId) => {
  const all = getInboxMessages();
  saveInboxMessages(all.map(m => m.id === messageId ? { ...m, read: true } : m));
};
export const getUnreadCount = (userId) => getInboxMessages().filter(m => m.recipientId === userId && !m.read).length;

/* ── Quiz Item Analysis ── */
const QUIZ_RESPONSES_KEY = 'allen-ace-quiz-responses';
export const getQuizResponses = () => {
  try { return JSON.parse(localStorage.getItem(QUIZ_RESPONSES_KEY) || '[]'); } catch { return []; }
};
export const saveQuizResponse = (response) => {
  const all = getQuizResponses();
  all.push({ ...response, submittedAt: new Date().toISOString() });
  localStorage.setItem(QUIZ_RESPONSES_KEY, JSON.stringify(all));
};
export const getItemAnalysis = (assessmentId) => {
  const responses = getQuizResponses().filter(r => r.assessmentId === assessmentId);
  if (!responses.length) return [];
  const questionMap = {};
  responses.forEach(r => {
    (r.answers || []).forEach(a => {
      if (!questionMap[a.questionId]) questionMap[a.questionId] = { questionId: a.questionId, questionText: a.questionText, total: 0, correct: 0, optionDistribution: {} };
      const q = questionMap[a.questionId];
      q.total++;
      if (a.correct) q.correct++;
      const key = String(a.selected);
      q.optionDistribution[key] = (q.optionDistribution[key] || 0) + 1;
    });
  });
  return Object.values(questionMap).map(q => ({
    ...q,
    difficulty: q.total ? (q.correct / q.total) : 0,
    discrimination: 0,
  }));
};

/* ── Plagiarism Detection ── */
const PLAGIARISM_KEY = 'allen-ace-plagiarism';
export const getPlagiarismReports = () => {
  try { return JSON.parse(localStorage.getItem(PLAGIARISM_KEY) || '[]'); } catch { return []; }
};
export const savePlagiarismReport = (report) => {
  const all = getPlagiarismReports();
  all.push({ id: `plag-${Date.now()}`, ...report, createdAt: new Date().toISOString() });
  localStorage.setItem(PLAGIARISM_KEY, JSON.stringify(all));
  return all[all.length - 1];
};
export const getPlagiarismReport = (submissionId) => getPlagiarismReports().find(r => r.submissionId === submissionId) || null;

/* ── Attendance ── */
const ATTENDANCE_KEY = 'allen-ace-attendance';
export const getAttendanceRecords = (classId) => {
  try { const all = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '{}'); return all[classId] || []; } catch { return []; }
};
export const saveAttendanceRecord = (classId, record) => {
  const all = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '{}');
  if (!all[classId]) all[classId] = [];
  const existing = all[classId].findIndex(r => r.date === record.date);
  if (existing >= 0) all[classId][existing] = record;
  else all[classId].push(record);
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(all));
};
export const getAttendanceForDate = (classId, date) => {
  return getAttendanceRecords(classId).find(r => r.date === date) || null;
};
export const getStudentAttendanceSummary = (classId, studentId) => {
  const records = getAttendanceRecords(classId);
  let present = 0, absent = 0, tardy = 0, excused = 0;
  records.forEach(r => {
    const entry = (r.entries || []).find(e => e.studentId === studentId);
    if (!entry) return;
    if (entry.status === 'present') present++;
    else if (entry.status === 'absent') absent++;
    else if (entry.status === 'tardy') tardy++;
    else if (entry.status === 'excused') excused++;
  });
  return { present, absent, tardy, excused, total: records.length };
};

/* ── File Manager ── */
const FILES_KEY = 'allen-ace-files';
export const getFileLibrary = (ownerId) => {
  try { const all = JSON.parse(localStorage.getItem(FILES_KEY) || '[]'); return all.filter(f => f.ownerId === ownerId); } catch { return []; }
};
export const saveFileToLibrary = (file) => {
  const all = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
  all.push({ id: `file-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, ...file, uploadedAt: new Date().toISOString() });
  localStorage.setItem(FILES_KEY, JSON.stringify(all));
  return all[all.length - 1];
};
export const deleteFileFromLibrary = (fileId) => {
  const all = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
  localStorage.setItem(FILES_KEY, JSON.stringify(all.filter(f => f.id !== fileId)));
};
export const createFolder = (ownerId, name, parentId) => {
  return saveFileToLibrary({ ownerId, name, type: 'folder', parentId: parentId || null, size: 0, url: null });
};
export const getFilesInFolder = (ownerId, folderId) => {
  return getFileLibrary(ownerId).filter(f => (f.parentId || null) === (folderId || null));
};
export const moveFile = (fileId, newParentId) => {
  const all = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
  localStorage.setItem(FILES_KEY, JSON.stringify(all.map(f => f.id === fileId ? { ...f, parentId: newParentId || null } : f)));
};
export const renameFile = (fileId, newName) => {
  const all = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
  localStorage.setItem(FILES_KEY, JSON.stringify(all.map(f => f.id === fileId ? { ...f, name: newName } : f)));
};
export const getFileUsage = (ownerId) => {
  const files = getFileLibrary(ownerId).filter(f => f.type !== 'folder');
  const totalBytes = files.reduce((s, f) => s + (f.size || 0), 0);
  return { count: files.length, totalBytes, totalMB: (totalBytes / (1024 * 1024)).toFixed(2) };
};

/* ── Blueprint Courses ── */
const BLUEPRINTS_KEY = 'allen-ace-blueprints';
export const getBlueprints = () => {
  try { return JSON.parse(localStorage.getItem(BLUEPRINTS_KEY) || '[]'); } catch { return []; }
};
export const saveBlueprints = (bp) => localStorage.setItem(BLUEPRINTS_KEY, JSON.stringify(bp));
export const createBlueprint = (sourceClassId, name) => {
  const cls = getClasses().find(c => c.id === sourceClassId);
  if (!cls) return null;
  const modules = getClassModules(sourceClassId);
  const announcements = getClassAnnouncements(sourceClassId);
  const assessments = getAssignments().filter(a => a.classId === sourceClassId);
  const bp = {
    id: `bp-${Date.now()}`, name: name || `${cls.name} Blueprint`, sourceClassId,
    snapshot: { classData: { ...cls, id: undefined, students: [] }, modules, announcements, assessments },
    childClassIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  const all = getBlueprints();
  all.push(bp);
  saveBlueprints(all);
  return bp;
};
export const syncBlueprintToChild = (blueprintId, childClassId) => {
  const all = getBlueprints();
  const bp = all.find(b => b.id === blueprintId);
  if (!bp) return null;
  const classes = getClasses();
  const child = classes.find(c => c.id === childClassId);
  if (!child) return null;
  const modules = getModules();
  const existingChildModules = modules.filter(m => m.classId === childClassId);
  const newModules = (bp.snapshot.modules || []).filter(m => !existingChildModules.some(em => em.name === m.name)).map(m => ({ ...m, id: `mod-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, classId: childClassId }));
  if (newModules.length) saveModules([...modules, ...newModules]);
  if (!bp.childClassIds.includes(childClassId)) { bp.childClassIds.push(childClassId); bp.updatedAt = new Date().toISOString(); saveBlueprints(all); }
  return { synced: newModules.length };
};
export const getBlueprintChildren = (blueprintId) => {
  const bp = getBlueprints().find(b => b.id === blueprintId);
  if (!bp) return [];
  const classes = getClasses();
  return bp.childClassIds.map(id => classes.find(c => c.id === id)).filter(Boolean);
};

/* ── Commons (shared content library, Canvas Commons–style) ── */
const COMMONS_KEY = 'allen-ace-commons';
export const getCommons = () => {
  try { return JSON.parse(localStorage.getItem(COMMONS_KEY) || '[]'); } catch { return []; }
};
export const saveCommons = (list) => localStorage.setItem(COMMONS_KEY, JSON.stringify(list));

/**
 * Share a class's content to Commons. Snapshot has no classIds; they are set on import.
 */
export const addToCommons = ({ title, description, author, gradeId, subject, includeModules, includeAssignments, includeAnnouncements, sourceClassId }) => {
  const cls = getClasses().find(c => c.id === sourceClassId);
  if (!cls) return null;
  const content = { modules: [], assignments: [], announcements: [] };
  if (includeModules) {
    content.modules = getClassModules(sourceClassId).map(m => {
      const { id, classId, ...rest } = m;
      return { ...rest, items: (m.items || []).map(({ id: iid, createdAt, ...item }) => item) };
    });
  }
  if (includeAssignments) {
    content.assignments = getAssignments()
      .filter(a => a.classId === sourceClassId)
      .map(({ id, classId, ...rest }) => rest);
  }
  if (includeAnnouncements) {
    content.announcements = getClassAnnouncements(sourceClassId).map(({ id, classId, ...rest }) => {
      const { createdAt, ...r } = rest;
      return r;
    });
  }
  const entry = {
    id: `commons-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: (title || cls.name).trim(),
    description: (description || '').trim(),
    author: author || cls.teacher || 'unknown',
    gradeId: gradeId || cls.gradeId || '',
    subject: subject || 'math',
    content,
    createdAt: new Date().toISOString(),
  };
  const all = getCommons();
  all.unshift(entry);
  saveCommons(all);
  return entry;
};

/**
 * Import a Commons resource into a class. Clones modules, assignments, announcements with new ids and target classId.
 */
export const importFromCommons = (commonsId, targetClassId) => {
  const commons = getCommons().find(c => c.id === commonsId);
  const targetClass = getClasses().find(c => c.id === targetClassId);
  if (!commons || !targetClass) return { modules: 0, assignments: 0, announcements: 0 };
  const result = { modules: 0, assignments: 0, announcements: 0 };
  const ts = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  if (commons.content.modules && commons.content.modules.length > 0) {
    const allModules = getModules();
    for (const m of commons.content.modules) {
      const newMod = {
        ...m,
        id: `mod-${ts()}`,
        classId: targetClassId,
        items: (m.items || []).map(item => ({ ...item, id: `item-${ts()}`, createdAt: new Date().toISOString() })),
        createdAt: new Date().toISOString(),
      };
      allModules.push(newMod);
      result.modules++;
    }
    saveModules(allModules);
  }
  if (commons.content.assignments && commons.content.assignments.length > 0) {
    const allAssignments = getAssignments();
    for (const a of commons.content.assignments) {
      allAssignments.push({
        ...a,
        id: `a-${ts()}`,
        classId: targetClassId,
      });
      result.assignments++;
    }
    saveAssignments(allAssignments);
  }
  if (commons.content.announcements && commons.content.announcements.length > 0) {
    const allAnnouncements = getAnnouncements();
    for (const ann of commons.content.announcements) {
      allAnnouncements.push({
        ...ann,
        id: `ann-${ts()}`,
        classId: targetClassId,
        createdAt: new Date().toISOString(),
      });
      result.announcements++;
    }
    saveAnnouncements(allAnnouncements);
  }
  return result;
};
