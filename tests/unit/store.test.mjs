// Unit tests for server/store.js data layer
import { describe, it, expect } from 'vitest';
import {
  getTeachers, addTeacher, verifyTeacher, findTeacher,
  addStudent, verifyStudent, joinClass,
  getClassesByTeacher, saveClassesForTeacher,
  getAssignmentsByTeacher, saveAssignmentsForTeacher,
  getGradesByTeacher, saveGradesForTeacher,
  getModulesByTeacher, saveModulesForTeacher,
  addSubmission,
  addNotification, getNotifications, getUnreadNotificationCount,
  markNotificationRead, markAllNotificationsRead,
  replaceStandardsForOwner, getStandardsByOwner,
  replaceStandardMappingsForOwner, getStandardMappingsByOwner,
  getMasteryDashboard,
} from '../../server/store.js';

const unique = () => `unit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

describe('Store — Teachers', () => {
  it('addTeacher creates a new teacher', async () => {
    const u = unique();
    const res = await addTeacher(u, 'Password123');
    expect(res.success).toBe(true);
  });

  it('addTeacher rejects duplicate', async () => {
    const u = unique();
    await addTeacher(u, 'Password123');
    const res = await addTeacher(u, 'Password123');
    expect(res.success).toBe(false);
  });

  it('verifyTeacher authenticates correct password', async () => {
    const u = unique();
    await addTeacher(u, 'MyPass99');
    const res = await verifyTeacher(u, 'MyPass99');
    expect(res.success).toBe(true);
  });

  it('verifyTeacher rejects wrong password', async () => {
    const u = unique();
    await addTeacher(u, 'MyPass99');
    const res = await verifyTeacher(u, 'WrongPass');
    expect(res.success).toBe(false);
  });

  it('findTeacher returns teacher', async () => {
    const u = unique();
    await addTeacher(u, 'Password123');
    const t = findTeacher(u);
    expect(t).toBeTruthy();
    expect(t.username).toBe(u);
  });

  it('getTeachers returns array', () => {
    const list = getTeachers();
    expect(Array.isArray(list)).toBe(true);
  });
});

describe('Store — Students', () => {
  it('addStudent creates student', async () => {
    const u = unique();
    const res = await addStudent({ username: u, password: 'pass1234', displayName: 'Test' });
    expect(res.success).toBe(true);
    expect(res.student.id).toBeTruthy();
  });

  it('verifyStudent authenticates', async () => {
    const u = unique();
    await addStudent({ username: u, password: 'pass5678', displayName: 'Stu' });
    const res = await verifyStudent(u, 'pass5678');
    expect(res.success).toBe(true);
  });
});

describe('Store — Classes', () => {
  it('save and retrieve classes', async () => {
    const teacher = unique();
    await addTeacher(teacher, 'Password123');
    const classes = [{ id: 'c1', name: 'Math 101' }, { id: 'c2', name: 'Science' }];
    saveClassesForTeacher(teacher, classes);
    const retrieved = getClassesByTeacher(teacher);
    expect(retrieved.length).toBe(2);
  });
});

describe('Store — Notifications', () => {
  it('add and retrieve notifications', () => {
    const userId = unique();
    addNotification({ userId, userRole: 'teacher', type: 'test', title: 'Hello', message: 'World' });
    addNotification({ userId, userRole: 'teacher', type: 'test', title: 'Second', message: 'Msg' });
    const list = getNotifications(userId);
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  it('unread count works', () => {
    const userId = unique();
    addNotification({ userId, userRole: 'teacher', type: 'test', title: 'A', message: 'B' });
    const count = getUnreadNotificationCount(userId);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('markNotificationRead works', () => {
    const userId = unique();
    addNotification({ userId, userRole: 'teacher', type: 'test', title: 'Mark', message: 'Read' });
    const list = getNotifications(userId);
    const notif = list[0];
    markNotificationRead(notif.id, userId);
    const after = getNotifications(userId);
    const found = after.find(n => n.id === notif.id);
    expect(found.read).toBe(true);
  });
});

describe('Store — Mastery', () => {
  it('computes mastery dashboard from mapped assignment grades', async () => {
    const owner = unique();
    await addTeacher(owner, 'Password123');
    saveClassesForTeacher(owner, [{
      id: `cls-${owner}`,
      name: 'Mastery Class',
      districtId: 'd-1',
      schoolId: 's-1',
      students: [{ id: `stu-${owner}`, name: 'Student One' }],
    }]);
    saveAssignmentsForTeacher(owner, [{
      id: `asg-${owner}`,
      classId: `cls-${owner}`,
      title: 'Quiz 1',
      questions: [{ id: 'q1', prompt: 'Question 1' }],
    }]);
    saveGradesForTeacher(owner, [{ studentId: `stu-${owner}`, assignmentId: `asg-${owner}`, score: 84 }]);

    replaceStandardsForOwner(owner, [{ code: 'TEKS.A.5A', label: 'Linear functions' }]);
    replaceStandardMappingsForOwner(owner, [{
      classId: `cls-${owner}`,
      assignmentId: `asg-${owner}`,
      standardCode: 'TEKS.A.5A',
      standardLabel: 'Linear functions',
      weight: 1,
    }]);

    const out = getMasteryDashboard(owner, { level: 'class' });
    expect(out.rows.length).toBeGreaterThan(0);
    expect(out.rows[0].mastery).toBe(84);
    expect(out.summary.averageMastery).toBe(84);
  });

  it('returns 0 mastery when mapped assignment has no grades', async () => {
    const owner = unique();
    await addTeacher(owner, 'Password123');
    saveClassesForTeacher(owner, [{
      id: `cls-ng-${owner}`,
      name: 'No Grade Class',
      students: [{ id: `stu-ng-${owner}`, name: 'Student NG' }],
    }]);
    saveAssignmentsForTeacher(owner, [{
      id: `asg-ng-${owner}`,
      classId: `cls-ng-${owner}`,
      title: 'No Grade Quiz',
      questions: [{ id: 'q1', prompt: 'Question 1' }],
    }]);
    replaceStandardMappingsForOwner(owner, [{
      classId: `cls-ng-${owner}`,
      assignmentId: `asg-ng-${owner}`,
      standardCode: 'TEKS.3.4C',
      weight: 1,
    }]);

    const out = getMasteryDashboard(owner, { level: 'class' });
    expect(out.rows.length).toBeGreaterThan(0);
    expect(out.rows[0].mastery).toBe(0);
  });

  it('uses question-level submission scores for question mappings', async () => {
    const owner = unique();
    await addTeacher(owner, 'Password123');
    saveClassesForTeacher(owner, [{
      id: `cls-q-${owner}`,
      name: 'Question Mastery Class',
      students: [{ id: `stu-q-${owner}`, name: 'Student Q' }],
    }]);
    saveAssignmentsForTeacher(owner, [{
      id: `asg-q-${owner}`,
      classId: `cls-q-${owner}`,
      title: 'Question Quiz',
      questions: [{ id: 'q1', prompt: 'Q1' }, { id: 'q2', prompt: 'Q2' }],
    }]);
    addSubmission({
      id: `sub-q-${owner}`,
      assessmentId: `asg-q-${owner}`,
      classId: `cls-q-${owner}`,
      studentId: `stu-q-${owner}`,
      questionScores: [
        { questionId: 'q1', score: 1, maxPoints: 1, status: 'graded' },
        { questionId: 'q2', score: 0, maxPoints: 1, status: 'graded' },
      ],
      submittedAt: new Date().toISOString(),
    });
    replaceStandardMappingsForOwner(owner, [{
      classId: `cls-q-${owner}`,
      assignmentId: `asg-q-${owner}`,
      questionId: 'q1',
      standardCode: 'TEKS.Q.1',
      weight: 1,
    }]);

    const out = getMasteryDashboard(owner, { level: 'class' });
    expect(out.rows.length).toBeGreaterThan(0);
    expect(out.rows[0].mastery).toBe(100);
  });

  it('stores and returns standards and mappings', async () => {
    const owner = unique();
    await addTeacher(owner, 'Password123');
    const s = replaceStandardsForOwner(owner, [{ code: 'TEKS.1.1A', label: 'Standard A' }]);
    expect(s.success).toBe(true);
    expect(getStandardsByOwner(owner).some((x) => x.code === 'TEKS.1.1A')).toBe(true);

    const m = replaceStandardMappingsForOwner(owner, [{
      classId: 'class-x',
      assignmentId: 'assignment-x',
      standardCode: 'TEKS.1.1A',
      weight: 1,
    }]);
    expect(m.success).toBe(true);
    expect(getStandardMappingsByOwner(owner).length).toBeGreaterThan(0);
  });

  it('deduplicates identical mappings in store replacement', async () => {
    const owner = unique();
    await addTeacher(owner, 'Password123');
    replaceStandardMappingsForOwner(owner, [
      { classId: 'class-y', assignmentId: 'assignment-y', questionId: 'q1', standardCode: 'TEKS.X.1', weight: 1 },
      { classId: 'class-y', assignmentId: 'assignment-y', questionId: 'q1', standardCode: 'TEKS.X.1', weight: 1 },
    ]);
    const rows = getStandardMappingsByOwner(owner);
    expect(rows.length).toBe(1);
  });
});
