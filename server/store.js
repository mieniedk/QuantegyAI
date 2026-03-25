import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'quantegy.db');
const LEGACY_JSON = path.join(DATA_DIR, 'users.json');
const SALT_ROUNDS = 12;

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);

// Performance pragmas
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

// ════════════════════════════════════════════════════════════════
//  SCHEMA
// ════════════════════════════════════════════════════════════════

db.exec(`
  CREATE TABLE IF NOT EXISTS teachers (
    username  TEXT PRIMARY KEY,
    password  TEXT NOT NULL,
    role      TEXT NOT NULL DEFAULT 'teacher',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS students (
    id          TEXT PRIMARY KEY,
    username    TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    displayName TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'student',
    createdAt   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS student_classes (
    studentId TEXT NOT NULL REFERENCES students(id),
    classId   TEXT NOT NULL,
    PRIMARY KEY (studentId, classId)
  );

  CREATE TABLE IF NOT EXISTS profiles (
    username  TEXT PRIMARY KEY REFERENCES teachers(username),
    data      TEXT NOT NULL DEFAULT '{}',
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    username TEXT PRIMARY KEY REFERENCES teachers(username),
    data     TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS classes (
    id        TEXT PRIMARY KEY,
    teacher   TEXT NOT NULL,
    data      TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (teacher) REFERENCES teachers(username)
  );
  CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher);

  CREATE TABLE IF NOT EXISTS assignments (
    id      TEXT PRIMARY KEY,
    classId TEXT NOT NULL,
    data    TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (classId) REFERENCES classes(id)
  );
  CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(classId);

  CREATE TABLE IF NOT EXISTS game_results (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher  TEXT NOT NULL,
    data     TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (teacher) REFERENCES teachers(username)
  );
  CREATE INDEX IF NOT EXISTS idx_game_results_teacher ON game_results(teacher);

  CREATE TABLE IF NOT EXISTS grades (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher TEXT NOT NULL,
    data    TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (teacher) REFERENCES teachers(username)
  );
  CREATE INDEX IF NOT EXISTS idx_grades_teacher ON grades(teacher);

  CREATE TABLE IF NOT EXISTS modules (
    id      TEXT PRIMARY KEY,
    classId TEXT NOT NULL,
    data    TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (classId) REFERENCES classes(id)
  );
  CREATE INDEX IF NOT EXISTS idx_modules_class ON modules(classId);

  CREATE TABLE IF NOT EXISTS announcements (
    id      TEXT PRIMARY KEY,
    classId TEXT NOT NULL,
    data    TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (classId) REFERENCES classes(id)
  );
  CREATE INDEX IF NOT EXISTS idx_announcements_class ON announcements(classId);

  CREATE TABLE IF NOT EXISTS discussions (
    id      TEXT PRIMARY KEY,
    classId TEXT NOT NULL,
    data    TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (classId) REFERENCES classes(id)
  );
  CREATE INDEX IF NOT EXISTS idx_discussions_class ON discussions(classId);

  CREATE TABLE IF NOT EXISTS chat_messages (
    id              TEXT PRIMARY KEY,
    classId         TEXT NOT NULL,
    authorId        TEXT,
    authorName      TEXT,
    dmTo            TEXT,
    text            TEXT NOT NULL DEFAULT '',
    media           TEXT,
    createdAt       TEXT NOT NULL DEFAULT (datetime('now')),
    serverTimestamp  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_chat_class ON chat_messages(classId);
  CREATE INDEX IF NOT EXISTS idx_chat_dm ON chat_messages(classId, authorId, dmTo);

  CREATE TABLE IF NOT EXISTS assessments (
    id       TEXT PRIMARY KEY,
    teacher  TEXT NOT NULL,
    data     TEXT NOT NULL DEFAULT '{}',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (teacher) REFERENCES teachers(username)
  );
  CREATE INDEX IF NOT EXISTS idx_assessments_teacher ON assessments(teacher);

  CREATE TABLE IF NOT EXISTS submissions (
    id           TEXT PRIMARY KEY,
    assessmentId TEXT,
    classId      TEXT,
    studentId    TEXT,
    data         TEXT NOT NULL DEFAULT '{}',
    submittedAt  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_submissions_assessment ON submissions(assessmentId);
  CREATE INDEX IF NOT EXISTS idx_submissions_class ON submissions(classId);
  CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(studentId);

  CREATE TABLE IF NOT EXISTS question_banks (
    id   TEXT PRIMARY KEY,
    data TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id        TEXT PRIMARY KEY,
    userId    TEXT NOT NULL,
    userRole  TEXT NOT NULL DEFAULT 'teacher',
    type      TEXT NOT NULL,
    title     TEXT NOT NULL,
    message   TEXT NOT NULL DEFAULT '',
    data      TEXT NOT NULL DEFAULT '{}',
    read      INTEGER NOT NULL DEFAULT 0,
    emailed   INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(userId, read, createdAt);

  CREATE TABLE IF NOT EXISTS notification_prefs (
    userId  TEXT PRIMARY KEY,
    data    TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS standards_catalog (
    id         TEXT PRIMARY KEY,
    owner      TEXT NOT NULL,
    code       TEXT NOT NULL,
    label      TEXT NOT NULL DEFAULT '',
    framework  TEXT NOT NULL DEFAULT '',
    subject    TEXT NOT NULL DEFAULT '',
    gradeBand  TEXT NOT NULL DEFAULT '',
    data       TEXT NOT NULL DEFAULT '{}',
    createdAt  TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_standards_owner_code ON standards_catalog(owner, code);

  CREATE TABLE IF NOT EXISTS standard_mappings (
    id            TEXT PRIMARY KEY,
    owner         TEXT NOT NULL,
    classId       TEXT NOT NULL,
    assignmentId  TEXT NOT NULL,
    questionId    TEXT,
    standardCode  TEXT NOT NULL,
    standardLabel TEXT NOT NULL DEFAULT '',
    weight        REAL NOT NULL DEFAULT 1,
    data          TEXT NOT NULL DEFAULT '{}',
    createdAt     TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt     TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_std_map_owner ON standard_mappings(owner);
  CREATE INDEX IF NOT EXISTS idx_std_map_class ON standard_mappings(classId);
  CREATE INDEX IF NOT EXISTS idx_std_map_assignment ON standard_mappings(assignmentId);

  CREATE TABLE IF NOT EXISTS district_hierarchy_state (
    id        TEXT PRIMARY KEY,
    data      TEXT NOT NULL DEFAULT '{}',
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Peer reviews
  CREATE TABLE IF NOT EXISTS peer_review_assignments (
    id            TEXT PRIMARY KEY,
    assignmentId  TEXT NOT NULL,
    classId       TEXT NOT NULL,
    anonymous     INTEGER NOT NULL DEFAULT 1,
    rubricJson    TEXT NOT NULL DEFAULT '[]',
    createdAt     TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_pra_assignment ON peer_review_assignments(assignmentId);

  CREATE TABLE IF NOT EXISTS peer_reviews (
    id              TEXT PRIMARY KEY,
    praId           TEXT NOT NULL REFERENCES peer_review_assignments(id),
    reviewerStudentId TEXT NOT NULL,
    revieweeStudentId TEXT NOT NULL,
    score           REAL,
    feedback        TEXT NOT NULL DEFAULT '',
    rubricScores    TEXT NOT NULL DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'pending',
    submittedAt     TEXT,
    createdAt       TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_pr_pra ON peer_reviews(praId);
  CREATE INDEX IF NOT EXISTS idx_pr_reviewer ON peer_reviews(reviewerStudentId);

  -- Student groups
  CREATE TABLE IF NOT EXISTS groups (
    id        TEXT PRIMARY KEY,
    classId   TEXT NOT NULL,
    name      TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_groups_class ON groups(classId);

  CREATE TABLE IF NOT EXISTS group_members (
    groupId   TEXT NOT NULL REFERENCES groups(id),
    studentId TEXT NOT NULL,
    PRIMARY KEY (groupId, studentId)
  );

  -- Announcement read tracking
  CREATE TABLE IF NOT EXISTS announcement_reads (
    announcementId TEXT NOT NULL,
    userId         TEXT NOT NULL,
    readAt         TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (announcementId, userId)
  );

  -- Student activity tracking
  CREATE TABLE IF NOT EXISTS activity_log (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    userId       TEXT NOT NULL,
    userRole     TEXT NOT NULL DEFAULT 'student',
    action       TEXT NOT NULL,
    resourceType TEXT NOT NULL DEFAULT '',
    resourceId   TEXT NOT NULL DEFAULT '',
    durationMs   INTEGER NOT NULL DEFAULT 0,
    meta         TEXT NOT NULL DEFAULT '{}',
    ts           TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(userId, ts);
  CREATE INDEX IF NOT EXISTS idx_activity_resource ON activity_log(resourceType, resourceId);

  -- iCal feed tokens
  CREATE TABLE IF NOT EXISTS ical_tokens (
    token     TEXT PRIMARY KEY,
    userId    TEXT NOT NULL,
    userRole  TEXT NOT NULL DEFAULT 'teacher',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_ical_user ON ical_tokens(userId);

  -- TA class assignments
  CREATE TABLE IF NOT EXISTS class_tas (
    taUsername TEXT NOT NULL REFERENCES teachers(username),
    classId    TEXT NOT NULL REFERENCES classes(id),
    PRIMARY KEY (taUsername, classId)
  );
  CREATE INDEX IF NOT EXISTS idx_class_tas_ta ON class_tas(taUsername);

  -- Student subscriptions (freemium paywall)
  CREATE TABLE IF NOT EXISTS student_subscriptions (
    studentId TEXT PRIMARY KEY REFERENCES students(id),
    data      TEXT NOT NULL DEFAULT '{}'
  );

  -- Student learning progress (server-side persistence)
  CREATE TABLE IF NOT EXISTS student_progress (
    studentId TEXT NOT NULL REFERENCES students(id),
    key       TEXT NOT NULL,
    data      TEXT NOT NULL DEFAULT '{}',
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (studentId, key)
  );
`);

// ════════════════════════════════════════════════════════════════
//  MIGRATION: import legacy users.json if it exists
// ════════════════════════════════════════════════════════════════

function runMigration() {
  if (!fs.existsSync(LEGACY_JSON)) return;
  let legacy;
  try { legacy = JSON.parse(fs.readFileSync(LEGACY_JSON, 'utf-8')); } catch { return; }

  const hasTeachers = db.prepare('SELECT COUNT(*) AS c FROM teachers').get().c;
  if (hasTeachers > 0) {
    // Already migrated — rename old file as backup
    try { fs.renameSync(LEGACY_JSON, LEGACY_JSON + '.migrated'); } catch {}
    return;
  }

  console.log('[migration] Importing legacy users.json into SQLite...');
  const migrateAll = db.transaction(() => {
    // Teachers
    const insTeacher = db.prepare('INSERT OR IGNORE INTO teachers (username, password, role, createdAt) VALUES (?, ?, ?, ?)');
    for (const t of (legacy.teachers || [])) {
      insTeacher.run(t.username, t.password, t.role || 'teacher', t.createdAt || new Date().toISOString());
    }

    // Students
    const insStudent = db.prepare('INSERT OR IGNORE INTO students (id, username, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
    const insSC = db.prepare('INSERT OR IGNORE INTO student_classes (studentId, classId) VALUES (?, ?)');
    for (const s of (legacy.students || [])) {
      insStudent.run(s.id, s.username, s.password, s.displayName || s.username, s.role || 'student', s.createdAt || new Date().toISOString());
      for (const cid of (s.classIds || [])) insSC.run(s.id, cid);
    }

    // Profiles
    const insProfile = db.prepare('INSERT OR IGNORE INTO profiles (username, data, updatedAt) VALUES (?, ?, ?)');
    for (const [username, prof] of Object.entries(legacy.profiles || {})) {
      insProfile.run(username, JSON.stringify(prof), prof.updatedAt || new Date().toISOString());
    }

    // Subscriptions
    const insSub = db.prepare('INSERT OR IGNORE INTO subscriptions (username, data) VALUES (?, ?)');
    for (const [username, sub] of Object.entries(legacy.subscriptions || {})) {
      insSub.run(username, JSON.stringify(sub));
    }

    // Classes
    const insClass = db.prepare('INSERT OR IGNORE INTO classes (id, teacher, data) VALUES (?, ?, ?)');
    for (const c of (legacy.classes || [])) {
      const { id, teacher, ...rest } = c;
      insClass.run(id, teacher, JSON.stringify({ id, teacher, ...rest }));
    }

    // Assignments
    const insAssn = db.prepare('INSERT OR IGNORE INTO assignments (id, classId, data) VALUES (?, ?, ?)');
    for (const a of (legacy.assignments || [])) {
      insAssn.run(a.id || `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, a.classId, JSON.stringify(a));
    }

    // Game results
    const insGR = db.prepare('INSERT INTO game_results (teacher, data) VALUES (?, ?)');
    for (const r of (legacy.gameResults || [])) {
      insGR.run(r._teacher || 'unknown', JSON.stringify(r));
    }

    // Grades
    const insGrade = db.prepare('INSERT INTO grades (teacher, data) VALUES (?, ?)');
    for (const g of (legacy.grades || [])) {
      insGrade.run(g._teacher || 'unknown', JSON.stringify(g));
    }

    // Modules
    const insMod = db.prepare('INSERT OR IGNORE INTO modules (id, classId, data) VALUES (?, ?, ?)');
    for (const m of (legacy.modules || [])) {
      insMod.run(m.id || `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, m.classId, JSON.stringify(m));
    }

    // Announcements
    const insAnn = db.prepare('INSERT OR IGNORE INTO announcements (id, classId, data) VALUES (?, ?, ?)');
    for (const a of (legacy.announcements || [])) {
      insAnn.run(a.id || `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, a.classId, JSON.stringify(a));
    }

    // Discussions
    const insDisc = db.prepare('INSERT OR IGNORE INTO discussions (id, classId, data) VALUES (?, ?, ?)');
    for (const d of (legacy.discussions || [])) {
      insDisc.run(d.id || `d-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, d.classId, JSON.stringify(d));
    }

    // Chat messages
    const insChat = db.prepare('INSERT OR IGNORE INTO chat_messages (id, classId, authorId, authorName, dmTo, text, media, createdAt, serverTimestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const m of (legacy.chatMessages || [])) {
      insChat.run(
        m.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        m.classId, m.authorId || null, m.authorName || null,
        m.dmTo || m.recipientId || null,
        m.body || m.text || '', m.media ? JSON.stringify(m.media) : null,
        m.createdAt || new Date().toISOString(), m.serverTimestamp || new Date().toISOString()
      );
    }

    // Assessments
    const insAssess = db.prepare('INSERT OR IGNORE INTO assessments (id, teacher, data, createdAt) VALUES (?, ?, ?, ?)');
    for (const a of (legacy.assessments || [])) {
      insAssess.run(a.id, a._teacher || 'unknown', JSON.stringify(a), a.createdAt || new Date().toISOString());
    }

    // Submissions
    const insSubmit = db.prepare('INSERT OR IGNORE INTO submissions (id, assessmentId, classId, studentId, data, submittedAt) VALUES (?, ?, ?, ?, ?, ?)');
    for (const s of (legacy.submissions || [])) {
      insSubmit.run(
        s.id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        s.assessmentId || null, s.classId || null, s.studentId || null,
        JSON.stringify(s), s.submittedAt || new Date().toISOString()
      );
    }

    // Question banks
    const insQB = db.prepare('INSERT OR IGNORE INTO question_banks (id, data) VALUES (?, ?)');
    for (const [id, bank] of Object.entries(legacy.questionBanks || {})) {
      insQB.run(id, JSON.stringify(bank));
    }
  });

  migrateAll();
  console.log('[migration] Legacy data imported successfully.');
  try { fs.renameSync(LEGACY_JSON, LEGACY_JSON + '.migrated'); } catch {}
}

runMigration();

// ════════════════════════════════════════════════════════════════
//  PREPARED STATEMENTS (compiled once, reused)
// ════════════════════════════════════════════════════════════════

const stmts = {
  // Teachers
  allTeachers:    db.prepare('SELECT username, password, role, createdAt FROM teachers'),
  findTeacher:    db.prepare('SELECT * FROM teachers WHERE username = ?'),
  insertTeacher:  db.prepare('INSERT INTO teachers (username, password, role, createdAt) VALUES (?, ?, ?, ?)'),
  updateTeacherPw: db.prepare('UPDATE teachers SET password = ?, role = COALESCE(NULLIF(role, \'\'), \'teacher\') WHERE username = ?'),

  // Students
  allStudents:    db.prepare('SELECT * FROM students'),
  findStudentId:  db.prepare('SELECT * FROM students WHERE id = ?'),
  findStudentUn:  db.prepare('SELECT * FROM students WHERE username = ?'),
  insertStudent:  db.prepare('INSERT INTO students (id, username, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)'),
  studentClasses: db.prepare('SELECT classId FROM student_classes WHERE studentId = ?'),
  insertSC:       db.prepare('INSERT OR IGNORE INTO student_classes (studentId, classId) VALUES (?, ?)'),

  // Profiles
  getProfile:     db.prepare('SELECT data FROM profiles WHERE username = ?'),
  upsertProfile:  db.prepare('INSERT INTO profiles (username, data, updatedAt) VALUES (?, ?, ?) ON CONFLICT(username) DO UPDATE SET data = excluded.data, updatedAt = excluded.updatedAt'),

  // Subscriptions (teacher)
  getSub:         db.prepare('SELECT data FROM subscriptions WHERE username = ?'),
  upsertSub:      db.prepare('INSERT INTO subscriptions (username, data) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET data = excluded.data'),

  // Student subscriptions
  getStudentSub:    db.prepare('SELECT data FROM student_subscriptions WHERE studentId = ?'),
  upsertStudentSub: db.prepare('INSERT INTO student_subscriptions (studentId, data) VALUES (?, ?) ON CONFLICT(studentId) DO UPDATE SET data = excluded.data'),

  // Student progress
  getStudentProgress:    db.prepare('SELECT key, data, updatedAt FROM student_progress WHERE studentId = ?'),
  getStudentProgressKey: db.prepare('SELECT data, updatedAt FROM student_progress WHERE studentId = ? AND key = ?'),
  upsertStudentProgress: db.prepare('INSERT INTO student_progress (studentId, key, data, updatedAt) VALUES (?, ?, ?, ?) ON CONFLICT(studentId, key) DO UPDATE SET data = excluded.data, updatedAt = excluded.updatedAt'),

  // Classes
  classesByTeacher: db.prepare('SELECT data FROM classes WHERE teacher = ?'),
  classById:        db.prepare('SELECT data FROM classes WHERE id = ?'),
  classByCode:      db.prepare('SELECT data FROM classes WHERE json_extract(data, \'$.classCode\') = ?'),
  upsertClass:      db.prepare('INSERT INTO classes (id, teacher, data) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET teacher = excluded.teacher, data = excluded.data'),
  deleteClassesByTeacher: db.prepare('DELETE FROM classes WHERE teacher = ? AND id NOT IN (SELECT value FROM json_each(?))'),

  // Assignments
  assignmentsByClass: db.prepare('SELECT data FROM assignments WHERE classId = ?'),
  upsertAssignment:   db.prepare('INSERT INTO assignments (id, classId, data) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET classId = excluded.classId, data = excluded.data'),
  deleteAssignmentsNotIn: db.prepare('DELETE FROM assignments WHERE classId IN (SELECT id FROM classes WHERE teacher = ?) AND id NOT IN (SELECT value FROM json_each(?))'),

  // Game Results
  gameResultsByTeacher: db.prepare('SELECT data FROM game_results WHERE teacher = ?'),
  deleteGameResults:    db.prepare('DELETE FROM game_results WHERE teacher = ?'),
  insertGameResult:     db.prepare('INSERT INTO game_results (teacher, data) VALUES (?, ?)'),

  // Class TAs
  tasByClass:     db.prepare('SELECT taUsername FROM class_tas WHERE classId = ?'),
  classesByTA:    db.prepare('SELECT classId FROM class_tas WHERE taUsername = ?'),
  insertClassTA:  db.prepare('INSERT OR IGNORE INTO class_tas (taUsername, classId) VALUES (?, ?)'),
  removeClassTA:  db.prepare('DELETE FROM class_tas WHERE taUsername = ? AND classId = ?'),

  // Grades
  gradesByTeacher:  db.prepare('SELECT data FROM grades WHERE teacher = ?'),
  deleteGrades:     db.prepare('DELETE FROM grades WHERE teacher = ?'),
  insertGrade:      db.prepare('INSERT INTO grades (teacher, data) VALUES (?, ?)'),

  // Modules
  modulesByClass:  db.prepare('SELECT data FROM modules WHERE classId = ?'),
  upsertModule:    db.prepare('INSERT INTO modules (id, classId, data) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET classId = excluded.classId, data = excluded.data'),
  deleteModulesNotIn: db.prepare('DELETE FROM modules WHERE classId IN (SELECT id FROM classes WHERE teacher = ?) AND id NOT IN (SELECT value FROM json_each(?))'),

  // Announcements
  annByClass:      db.prepare('SELECT data FROM announcements WHERE classId = ?'),
  upsertAnn:       db.prepare('INSERT INTO announcements (id, classId, data) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET classId = excluded.classId, data = excluded.data'),
  deleteAnnNotIn:  db.prepare('DELETE FROM announcements WHERE classId IN (SELECT id FROM classes WHERE teacher = ?) AND id NOT IN (SELECT value FROM json_each(?))'),

  // Discussions
  discByClass:     db.prepare('SELECT data FROM discussions WHERE classId = ?'),
  upsertDisc:      db.prepare('INSERT INTO discussions (id, classId, data) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET classId = excluded.classId, data = excluded.data'),
  deleteDiscNotIn: db.prepare('DELETE FROM discussions WHERE classId IN (SELECT id FROM classes WHERE teacher = ?) AND id NOT IN (SELECT value FROM json_each(?))'),

  // Chat
  chatByClass:     db.prepare('SELECT * FROM chat_messages WHERE classId = ? ORDER BY createdAt ASC'),
  chatDM:          db.prepare('SELECT * FROM chat_messages WHERE classId = ? AND ((authorId = ? AND dmTo = ?) OR (authorId = ? AND dmTo = ?)) ORDER BY createdAt ASC'),
  insertChat:      db.prepare('INSERT OR IGNORE INTO chat_messages (id, classId, authorId, authorName, dmTo, text, media, createdAt, serverTimestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'),
  chatByTeacher:   db.prepare('SELECT * FROM chat_messages WHERE classId IN (SELECT id FROM classes WHERE teacher = ?) ORDER BY createdAt ASC'),
  deleteChatByTeacherNotIn: db.prepare('DELETE FROM chat_messages WHERE classId IN (SELECT id FROM classes WHERE teacher = ?) AND id NOT IN (SELECT value FROM json_each(?))'),

  // Assessments
  assessByTeacher: db.prepare('SELECT data FROM assessments WHERE teacher = ?'),
  assessById:      db.prepare('SELECT data FROM assessments WHERE id = ?'),
  upsertAssess:    db.prepare('INSERT INTO assessments (id, teacher, data, createdAt) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET teacher = excluded.teacher, data = excluded.data'),
  deleteAssessNotIn: db.prepare('DELETE FROM assessments WHERE teacher = ? AND id NOT IN (SELECT value FROM json_each(?))'),

  // Submissions
  subByAssessment: db.prepare('SELECT data FROM submissions WHERE assessmentId = ?'),
  subByStudent:    db.prepare('SELECT data FROM submissions WHERE studentId = ?'),
  subByClass:      db.prepare('SELECT data FROM submissions WHERE classId = ?'),
  upsertSub2:     db.prepare('INSERT INTO submissions (id, assessmentId, classId, studentId, data, submittedAt) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data'),
  deleteSubNotIn:  db.prepare('DELETE FROM submissions WHERE classId IN (SELECT id FROM classes WHERE teacher = ?) AND id NOT IN (SELECT value FROM json_each(?))'),

  // Question banks
  getQB:         db.prepare('SELECT id, data FROM question_banks'),
  getQBById:     db.prepare('SELECT data FROM question_banks WHERE id = ?'),
  upsertQB:      db.prepare('INSERT INTO question_banks (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data'),

  // Notifications
  getNotifs:      db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ?'),
  getUnreadCount: db.prepare('SELECT COUNT(*) AS c FROM notifications WHERE userId = ? AND read = 0'),
  insertNotif:    db.prepare('INSERT INTO notifications (id, userId, userRole, type, title, message, data, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'),
  markRead:       db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?'),
  markAllRead:    db.prepare('UPDATE notifications SET read = 1 WHERE userId = ?'),
  getNotifPrefs:  db.prepare('SELECT data FROM notification_prefs WHERE userId = ?'),
  upsertNotifPrefs: db.prepare('INSERT INTO notification_prefs (userId, data) VALUES (?, ?) ON CONFLICT(userId) DO UPDATE SET data = excluded.data'),

  // Standards catalog
  standardsByOwner: db.prepare('SELECT * FROM standards_catalog WHERE owner = ? ORDER BY code ASC'),
  upsertStandard: db.prepare(`
    INSERT INTO standards_catalog (id, owner, code, label, framework, subject, gradeBand, data, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      code = excluded.code,
      label = excluded.label,
      framework = excluded.framework,
      subject = excluded.subject,
      gradeBand = excluded.gradeBand,
      data = excluded.data,
      updatedAt = excluded.updatedAt
  `),
  deleteStandardByOwnerCode: db.prepare('DELETE FROM standards_catalog WHERE owner = ? AND code = ?'),

  // Standards mappings
  mappingsByOwner: db.prepare('SELECT * FROM standard_mappings WHERE owner = ? ORDER BY updatedAt DESC'),
  mappingsByOwnerClass: db.prepare('SELECT * FROM standard_mappings WHERE owner = ? AND classId = ? ORDER BY updatedAt DESC'),
  mappingsByOwnerAssignment: db.prepare('SELECT * FROM standard_mappings WHERE owner = ? AND assignmentId = ? ORDER BY updatedAt DESC'),
  deleteMappingsByOwner: db.prepare('DELETE FROM standard_mappings WHERE owner = ?'),
  upsertMapping: db.prepare(`
    INSERT INTO standard_mappings (id, owner, classId, assignmentId, questionId, standardCode, standardLabel, weight, data, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      classId = excluded.classId,
      assignmentId = excluded.assignmentId,
      questionId = excluded.questionId,
      standardCode = excluded.standardCode,
      standardLabel = excluded.standardLabel,
      weight = excluded.weight,
      data = excluded.data,
      updatedAt = excluded.updatedAt
  `),
  allClasses: db.prepare('SELECT data FROM classes'),
  allAssignments: db.prepare('SELECT data FROM assignments'),
  allGrades: db.prepare('SELECT data FROM grades'),
  allSubmissions: db.prepare('SELECT data FROM submissions'),

  // District hierarchy shared state
  getDistrictHierarchyState: db.prepare('SELECT data FROM district_hierarchy_state WHERE id = ?'),
  upsertDistrictHierarchyState: db.prepare(`
    INSERT INTO district_hierarchy_state (id, data, updatedAt)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updatedAt = excluded.updatedAt
  `),
};

// ════════════════════════════════════════════════════════════════
//  HELPER: parse JSON rows
// ════════════════════════════════════════════════════════════════

function rows(stmt, ...args) {
  return stmt.all(...args).map(r => JSON.parse(r.data));
}

function classIds(teacher) {
  return stmts.classesByTeacher.all(teacher).map(r => JSON.parse(r.data).id);
}

// ════════════════════════════════════════════════════════════════
//  TEACHERS
// ════════════════════════════════════════════════════════════════

export function getTeachers() {
  return stmts.allTeachers.all();
}

export function findTeacher(username) {
  return stmts.findTeacher.get(username) || null;
}

export async function addTeacher(username, password) {
  const existing = stmts.findTeacher.get(username);
  if (existing) return { success: false, error: 'Username already exists.' };
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  stmts.insertTeacher.run(username, hashed, 'teacher', new Date().toISOString());
  return { success: true };
}

export async function verifyTeacher(username, password) {
  const teacher = stmts.findTeacher.get(username);
  if (!teacher) return { success: false, error: 'Account not found.' };

  const isHashed = teacher.password.startsWith('$2a$') || teacher.password.startsWith('$2b$');
  let valid = false;

  if (isHashed) {
    valid = await bcrypt.compare(password, teacher.password);
  } else {
    valid = teacher.password === password;
    if (valid) {
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      stmts.updateTeacherPw.run(hashed, username);
    }
  }

  if (!valid) return { success: false, error: 'Incorrect password.' };
  return { success: true, username: teacher.username, role: teacher.role || 'teacher' };
}

export async function resetPassword(username, newPassword) {
  const teacher = stmts.findTeacher.get(username);
  if (!teacher) return { success: false, error: 'Account not found.' };
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  stmts.updateTeacherPw.run(hashed, username);
  return { success: true };
}

// ════════════════════════════════════════════════════════════════
//  STUDENTS
// ════════════════════════════════════════════════════════════════

export function getStudents() {
  return stmts.allStudents.all().map(s => ({
    ...s,
    classIds: stmts.studentClasses.all(s.id).map(r => r.classId),
  }));
}

export function findStudent(studentId) {
  const s = stmts.findStudentId.get(studentId);
  if (!s) return null;
  return { ...s, classIds: stmts.studentClasses.all(s.id).map(r => r.classId) };
}

export function findStudentByUsername(username) {
  const s = stmts.findStudentUn.get(username);
  if (!s) return null;
  return { ...s, classIds: stmts.studentClasses.all(s.id).map(r => r.classId) };
}

export async function addStudent({ username, password, displayName, classCode }) {
  const existing = stmts.findStudentUn.get(username);
  if (existing) return { success: false, error: 'Username already taken.' };

  let matchingClassId = null;
  if (classCode) {
    const row = stmts.classByCode.get(classCode);
    if (!row) return { success: false, error: 'Invalid class code.' };
    matchingClassId = JSON.parse(row.data).id;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const id = `stu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  const insertTx = db.transaction(() => {
    stmts.insertStudent.run(id, username, hashed, displayName || username, 'student', now);
    if (matchingClassId) stmts.insertSC.run(id, matchingClassId);
  });
  insertTx();

  return {
    success: true,
    student: { id, username, displayName: displayName || username, role: 'student', classIds: matchingClassId ? [matchingClassId] : [] },
  };
}

export async function verifyStudent(username, password) {
  const student = findStudentByUsername(username);
  if (!student) return { success: false, error: 'Account not found.' };
  const valid = await bcrypt.compare(password, student.password);
  if (!valid) return { success: false, error: 'Incorrect password.' };
  return {
    success: true,
    student: { id: student.id, username: student.username, displayName: student.displayName, role: 'student', classIds: student.classIds },
  };
}

export function joinClass(studentId, classCode) {
  const row = stmts.classByCode.get(classCode);
  if (!row) return { success: false, error: 'Invalid class code.' };
  const cls = JSON.parse(row.data);
  const stu = stmts.findStudentId.get(studentId);
  if (!stu) return { success: false, error: 'Student not found.' };
  stmts.insertSC.run(studentId, cls.id);
  return { success: true, classId: cls.id, className: cls.name };
}

// ════════════════════════════════════════════════════════════════
//  PROFILES & SUBSCRIPTIONS
// ════════════════════════════════════════════════════════════════

export function getProfile(username) {
  const row = stmts.getProfile.get(username);
  return row ? JSON.parse(row.data) : null;
}

export function saveProfile(username, profile) {
  const data = { ...profile, updatedAt: new Date().toISOString() };
  stmts.upsertProfile.run(username, JSON.stringify(data), data.updatedAt);
  return { success: true };
}

export function getSubscriptionData(username) {
  const row = stmts.getSub.get(username);
  return row ? JSON.parse(row.data) : null;
}

export function saveSubscriptionData(username, data) {
  stmts.upsertSub.run(username, JSON.stringify(data));
  return { success: true };
}

// ── Student Subscriptions ──

export function getStudentSubscription(studentId) {
  const row = stmts.getStudentSub.get(studentId);
  return row ? JSON.parse(row.data) : null;
}

export function saveStudentSubscription(studentId, data) {
  stmts.upsertStudentSub.run(studentId, JSON.stringify(data));
  return { success: true };
}

// ── Student Progress ──

export function getStudentProgress(studentId) {
  const rows = stmts.getStudentProgress.all(studentId);
  const result = {};
  for (const r of rows) result[r.key] = { data: JSON.parse(r.data), updatedAt: r.updatedAt };
  return result;
}

export function saveStudentProgress(studentId, key, data) {
  const now = new Date().toISOString();
  stmts.upsertStudentProgress.run(studentId, key, JSON.stringify(data), now);
  return { success: true };
}

// ════════════════════════════════════════════════════════════════
//  CLASSES
// ════════════════════════════════════════════════════════════════

export function getClassesByTeacher(username) {
  return rows(stmts.classesByTeacher, username);
}

export function saveClassesForTeacher(username, classes) {
  const tx = db.transaction(() => {
    const keepIds = classes.map(c => c.id);
    stmts.deleteClassesByTeacher.run(username, JSON.stringify(keepIds));
    for (const c of classes) {
      stmts.upsertClass.run(c.id, username, JSON.stringify({ ...c, teacher: username }));
    }
  });
  tx();
}

// ════════════════════════════════════════════════════════════════
//  ASSIGNMENTS
// ════════════════════════════════════════════════════════════════

export function getAssignmentsByTeacher(username) {
  const cids = classIds(username);
  const results = [];
  for (const cid of cids) results.push(...rows(stmts.assignmentsByClass, cid));
  return results;
}

export function saveAssignmentsForTeacher(username, assignments) {
  const tx = db.transaction(() => {
    const keepIds = assignments.map(a => a.id).filter(Boolean);
    stmts.deleteAssignmentsNotIn.run(username, JSON.stringify(keepIds));
    for (const a of assignments) {
      const id = a.id || `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      stmts.upsertAssignment.run(id, a.classId, JSON.stringify({ ...a, id }));
    }
  });
  tx();
}

// ════════════════════════════════════════════════════════════════
//  GAME RESULTS
// ════════════════════════════════════════════════════════════════

export function getGameResultsByTeacher(username) {
  return rows(stmts.gameResultsByTeacher, username);
}

export function saveGameResultsForTeacher(username, results) {
  const tx = db.transaction(() => {
    stmts.deleteGameResults.run(username);
    for (const r of results) {
      stmts.insertGameResult.run(username, JSON.stringify({ ...r, _teacher: username }));
    }
  });
  tx();
}

// ════════════════════════════════════════════════════════════════
//  GRADES
// ════════════════════════════════════════════════════════════════

export function getGradesByTeacher(username) {
  return rows(stmts.gradesByTeacher, username);
}

export function saveGradesForTeacher(username, grades) {
  const tx = db.transaction(() => {
    stmts.deleteGrades.run(username);
    for (const g of grades) {
      stmts.insertGrade.run(username, JSON.stringify({ ...g, _teacher: username }));
    }
  });
  tx();
}

/** Get grades for a student across all their classes, filtered by assignment postPolicy/gradesPosted. */
export function getGradesForStudent(studentId) {
  const classIds = stmts.studentClasses.all(studentId).map(r => r.classId);
  if (!classIds.length) return { grades: [], assignments: [], classes: [] };
  const classes = classIds.map(cid => stmts.classById.get(cid)).filter(Boolean).map(r => JSON.parse(r.data));
  const assignments = [];
  for (const cid of classIds) assignments.push(...rows(stmts.assignmentsByClass, cid));
  const allGrades = rows(stmts.allGrades);
  const studentGrades = allGrades.filter(g => g.studentId === studentId);
  const postedAssignmentIds = new Set(
    assignments.filter(a => {
      const policy = a.postPolicy || 'auto';
      if (policy === 'auto') return true;
      return !!a.gradesPosted;
    }).map(a => a.id)
  );
  const filteredGrades = studentGrades.filter(g => postedAssignmentIds.has(g.assignmentId));
  return { grades: filteredGrades, assignments, classes };
}

// ════════════════════════════════════════════════════════════════
//  MODULES
// ════════════════════════════════════════════════════════════════

export function getModulesByTeacher(username) {
  const cids = classIds(username);
  const results = [];
  for (const cid of cids) results.push(...rows(stmts.modulesByClass, cid));
  return results;
}

export function saveModulesForTeacher(username, modules) {
  const tx = db.transaction(() => {
    const keepIds = modules.map(m => m.id).filter(Boolean);
    stmts.deleteModulesNotIn.run(username, JSON.stringify(keepIds));
    for (const m of modules) {
      const id = m.id || `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      stmts.upsertModule.run(id, m.classId, JSON.stringify({ ...m, id }));
    }
  });
  tx();
}

// ════════════════════════════════════════════════════════════════
//  ANNOUNCEMENTS
// ════════════════════════════════════════════════════════════════

export function getAnnouncementsByTeacher(username) {
  const cids = classIds(username);
  const results = [];
  for (const cid of cids) results.push(...rows(stmts.annByClass, cid));
  return results;
}

export function saveAnnouncementsForTeacher(username, announcements) {
  const tx = db.transaction(() => {
    const keepIds = announcements.map(a => a.id).filter(Boolean);
    stmts.deleteAnnNotIn.run(username, JSON.stringify(keepIds));
    for (const a of announcements) {
      const id = a.id || `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      stmts.upsertAnn.run(id, a.classId, JSON.stringify({ ...a, id }));
    }
  });
  tx();
}

// ════════════════════════════════════════════════════════════════
//  DISCUSSIONS
// ════════════════════════════════════════════════════════════════

export function getDiscussionsByTeacher(username) {
  const cids = classIds(username);
  const results = [];
  for (const cid of cids) results.push(...rows(stmts.discByClass, cid));
  return results;
}

export function saveDiscussionsForTeacher(username, discussions) {
  const tx = db.transaction(() => {
    const keepIds = discussions.map(d => d.id).filter(Boolean);
    stmts.deleteDiscNotIn.run(username, JSON.stringify(keepIds));
    for (const d of discussions) {
      const id = d.id || `d-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      stmts.upsertDisc.run(id, d.classId, JSON.stringify({ ...d, id }));
    }
  });
  tx();
}

// ════════════════════════════════════════════════════════════════
//  CHAT MESSAGES
// ════════════════════════════════════════════════════════════════

export function getChatByTeacher(username) {
  return stmts.chatByTeacher.all(username).map(formatChatRow);
}

export function saveChatForTeacher(username, messages) {
  const tx = db.transaction(() => {
    const keepIds = messages.map(m => m.id).filter(Boolean);
    stmts.deleteChatByTeacherNotIn.run(username, JSON.stringify(keepIds));
    for (const m of messages) {
      const id = m.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      stmts.insertChat.run(
        id, m.classId, m.authorId || null, m.authorName || null,
        m.dmTo || m.recipientId || null,
        m.body || m.text || '', m.media ? JSON.stringify(m.media) : null,
        m.createdAt || new Date().toISOString(), m.serverTimestamp || new Date().toISOString()
      );
    }
  });
  tx();
}

export function addChatMessage(message) {
  const id = message.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  stmts.insertChat.run(
    id, message.classId, message.authorId || null, message.authorName || null,
    message.dmTo || message.recipientId || null,
    message.body || message.text || '', message.media ? JSON.stringify(message.media) : null,
    message.createdAt || now, now
  );
  return { success: true };
}

export function getChatByClass(classId) {
  return stmts.chatByClass.all(classId).map(formatChatRow);
}

function formatChatRow(row) {
  return {
    id: row.id,
    classId: row.classId,
    authorId: row.authorId,
    authorName: row.authorName,
    dmTo: row.dmTo,
    body: row.text,
    text: row.text,
    media: row.media ? JSON.parse(row.media) : null,
    createdAt: row.createdAt,
    serverTimestamp: row.serverTimestamp,
  };
}

// ════════════════════════════════════════════════════════════════
//  ASSESSMENTS
// ════════════════════════════════════════════════════════════════

export function getAssessmentsByTeacher(username) {
  return rows(stmts.assessByTeacher, username);
}

export function saveAssessmentsForTeacher(username, assessments) {
  const tx = db.transaction(() => {
    const keepIds = assessments.map(a => a.id).filter(Boolean);
    stmts.deleteAssessNotIn.run(username, JSON.stringify(keepIds));
    for (const a of assessments) {
      stmts.upsertAssess.run(a.id, username, JSON.stringify({ ...a, _teacher: username }), a.createdAt || new Date().toISOString());
    }
  });
  tx();
}

export function addAssessment(assessment) {
  const now = new Date().toISOString();
  stmts.upsertAssess.run(assessment.id, assessment._teacher || 'unknown', JSON.stringify({ ...assessment, createdAt: now }), now);
  return { success: true, id: assessment.id };
}

export function getAssessmentById(id) {
  const row = stmts.assessById.get(id);
  return row ? JSON.parse(row.data) : null;
}

// ════════════════════════════════════════════════════════════════
//  SUBMISSIONS
// ════════════════════════════════════════════════════════════════

export function getSubmissionsByTeacher(username) {
  const cids = classIds(username);
  const results = [];
  for (const cid of cids) results.push(...rows(stmts.subByClass, cid));
  return results;
}

export function saveSubmissionsForTeacher(username, submissions) {
  const tx = db.transaction(() => {
    const keepIds = submissions.map(s => s.id).filter(Boolean);
    stmts.deleteSubNotIn.run(username, JSON.stringify(keepIds));
    for (const s of submissions) {
      const id = s.id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      stmts.upsertSub2.run(id, s.assessmentId || null, s.classId || null, s.studentId || null, JSON.stringify({ ...s, id }), s.submittedAt || new Date().toISOString());
    }
  });
  tx();
}

export function addSubmission(submission) {
  const id = submission.id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  let questionScores = Array.isArray(submission?.questionScores) ? submission.questionScores : null;
  if (!questionScores && submission?.gradeResult?.results) {
    questionScores = Object.entries(submission.gradeResult.results).map(([questionId, r]) => ({
      questionId,
      score: Number(r?.score ?? 0),
      maxPoints: Number(r?.maxPoints ?? 0),
      status: r?.status || 'graded',
    }));
  }
  const payload = {
    ...submission,
    ...(Array.isArray(questionScores) ? { questionScores } : {}),
    id,
    submittedAt: submission.submittedAt || now,
  };
  stmts.upsertSub2.run(id, submission.assessmentId || null, submission.classId || null, submission.studentId || null, JSON.stringify(payload), now);
  return { success: true };
}

export function getSubmissionsForAssessment(assessmentId) {
  return rows(stmts.subByAssessment, assessmentId);
}

export function getSubmissionsByStudent(studentId) {
  return rows(stmts.subByStudent, studentId);
}

// ════════════════════════════════════════════════════════════════
//  QUESTION BANKS
// ════════════════════════════════════════════════════════════════

export function getQuestionBanks() {
  const result = {};
  for (const row of stmts.getQB.all()) {
    result[row.id] = JSON.parse(row.data);
  }
  return result;
}

export function saveQuestionBank(id, bank) {
  stmts.upsertQB.run(id, JSON.stringify({ ...bank, id }));
  return { success: true, id };
}

export function getQuestionBankById(id) {
  const row = stmts.getQBById.get(id);
  return row ? JSON.parse(row.data) : null;
}

// ════════════════════════════════════════════════════════════════
//  ALL TEACHER DATA (single fetch for login/sync)
// ════════════════════════════════════════════════════════════════

export function getAllTeacherData(username) {
  const classes = getClassesByTeacher(username);
  const cids = classes.map(c => c.id);

  const assignments = [];
  const modules = [];
  const announcements = [];
  const discussions = [];
  const chatMessages = [];
  const submissions = [];
  for (const cid of cids) {
    assignments.push(...rows(stmts.assignmentsByClass, cid));
    modules.push(...rows(stmts.modulesByClass, cid));
    announcements.push(...rows(stmts.annByClass, cid));
    discussions.push(...rows(stmts.discByClass, cid));
    chatMessages.push(...stmts.chatByClass.all(cid).map(formatChatRow));
    submissions.push(...rows(stmts.subByClass, cid));
  }

  return {
    profile: getProfile(username),
    subscription: getSubscriptionData(username),
    classes,
    assignments,
    gameResults: getGameResultsByTeacher(username),
    grades: getGradesByTeacher(username),
    modules,
    announcements,
    discussions,
    chatMessages,
    assessments: getAssessmentsByTeacher(username),
    submissions,
  };
}

export function getAllTeacherDataForTA(taUsername) {
  const classIds = getTAClassIds(taUsername);
  if (!classIds.length) return { classes: [], assignments: [], grades: [], modules: [], announcements: [], discussions: [], chatMessages: [], assessments: [], submissions: [] };
  const classes = classIds.map(cid => stmts.classById.get(cid)).filter(Boolean).map(r => JSON.parse(r.data));
  const assignments = [];
  const modules = [];
  const announcements = [];
  const discussions = [];
  const submissions = [];
  for (const cid of classIds) {
    assignments.push(...rows(stmts.assignmentsByClass, cid));
    modules.push(...rows(stmts.modulesByClass, cid));
    announcements.push(...rows(stmts.annByClass, cid));
    discussions.push(...rows(stmts.discByClass, cid));
    submissions.push(...rows(stmts.subByClass, cid));
  }
  const allGrades = rows(stmts.allGrades);
  const assignIds = new Set(assignments.map(a => a.id));
  const grades = allGrades.filter(g => assignIds.has(g.assignmentId));
  const teacherUsernames = [...new Set(classes.map(c => c.teacher))];
  const assessments = teacherUsernames.flatMap(t => getAssessmentsByTeacher(t));
  const chatMessages = classIds.flatMap(cid => stmts.chatByClass.all(cid).map(formatChatRow));
  return {
    profile: getProfile(taUsername),
    subscription: getSubscriptionData(taUsername),
    classes,
    assignments,
    gameResults: [],
    grades,
    modules,
    announcements,
    discussions,
    chatMessages,
    assessments,
    submissions,
  };
}

// ════════════════════════════════════════════════════════════════
//  BULK SYNC
// ════════════════════════════════════════════════════════════════

export function bulkSaveTeacherContent(username, data) {
  const tx = db.transaction(() => {
    if (data.modules) saveModulesForTeacher(username, data.modules);
    if (data.announcements) saveAnnouncementsForTeacher(username, data.announcements);
    if (data.discussions) saveDiscussionsForTeacher(username, data.discussions);
    if (data.chatMessages) saveChatForTeacher(username, data.chatMessages);
    if (data.assessments) saveAssessmentsForTeacher(username, data.assessments);
    if (data.submissions) saveSubmissionsForTeacher(username, data.submissions);
  });
  tx();
  return { success: true };
}

// ════════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ════════════════════════════════════════════════════════════════

export function addNotification({ userId, userRole, type, title, message, data }) {
  const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  stmts.insertNotif.run(id, userId, userRole || 'teacher', type, title, message || '', JSON.stringify(data || {}), now);
  return { success: true, id };
}

export function getNotifications(userId, limit = 50) {
  return stmts.getNotifs.all(userId, limit).map(n => ({
    ...n,
    data: JSON.parse(n.data),
    read: !!n.read,
    emailed: !!n.emailed,
  }));
}

export function getUnreadNotificationCount(userId) {
  return stmts.getUnreadCount.get(userId).c;
}

export function markNotificationRead(id, userId) {
  stmts.markRead.run(id, userId);
  return { success: true };
}

export function markAllNotificationsRead(userId) {
  stmts.markAllRead.run(userId);
  return { success: true };
}

export function getNotificationPrefs(userId) {
  const row = stmts.getNotifPrefs.get(userId);
  return row ? JSON.parse(row.data) : {
    email_assignments: true,
    email_grades: true,
    email_announcements: true,
    email_chat: false,
    inapp_assignments: true,
    inapp_grades: true,
    inapp_announcements: true,
    inapp_chat: true,
  };
}

export function saveNotificationPrefs(userId, prefs) {
  stmts.upsertNotifPrefs.run(userId, JSON.stringify(prefs));
  return { success: true };
}

// ════════════════════════════════════════════════════════════════
//  STANDARDS MAPPING / MASTERY ANALYTICS
// ════════════════════════════════════════════════════════════════

function parseStandardRow(row) {
  const extra = row?.data ? JSON.parse(row.data) : {};
  return {
    id: row.id,
    owner: row.owner,
    code: row.code,
    label: row.label,
    framework: row.framework,
    subject: row.subject,
    gradeBand: row.gradeBand,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...extra,
  };
}

function parseMappingRow(row) {
  const extra = row?.data ? JSON.parse(row.data) : {};
  return {
    id: row.id,
    owner: row.owner,
    classId: row.classId,
    assignmentId: row.assignmentId,
    questionId: row.questionId || null,
    standardCode: row.standardCode,
    standardLabel: row.standardLabel || '',
    weight: Number(row.weight) || 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...extra,
  };
}

export function getStandardsByOwner(owner) {
  if (!owner) return [];
  return stmts.standardsByOwner.all(owner).map(parseStandardRow);
}

export function replaceStandardsForOwner(owner, standards = []) {
  if (!owner) return { success: false, error: 'owner is required' };
  const tx = db.transaction(() => {
    const existing = getStandardsByOwner(owner);
    const keepCodes = new Set();
    for (const standard of standards) {
      const code = String(standard?.code || '').trim();
      if (!code) continue;
      keepCodes.add(code);
      const now = new Date().toISOString();
      const existingMatch = existing.find((s) => s.code === code);
      const id = existingMatch?.id || standard?.id || `std-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const payload = {
        ...standard,
        id,
        code,
        owner,
        label: String(standard?.label || code),
        framework: String(standard?.framework || ''),
        subject: String(standard?.subject || ''),
        gradeBand: String(standard?.gradeBand || ''),
      };
      stmts.upsertStandard.run(
        id,
        owner,
        payload.code,
        payload.label,
        payload.framework,
        payload.subject,
        payload.gradeBand,
        JSON.stringify(payload),
        now,
        now
      );
    }
    for (const s of existing) {
      if (!keepCodes.has(s.code)) {
        stmts.deleteStandardByOwnerCode.run(owner, s.code);
      }
    }
  });
  tx();
  return { success: true, standards: getStandardsByOwner(owner) };
}

export function getStandardMappingsByOwner(owner, filters = {}) {
  if (!owner) return [];
  const classId = filters?.classId ? String(filters.classId) : '';
  const assignmentId = filters?.assignmentId ? String(filters.assignmentId) : '';
  if (assignmentId) return stmts.mappingsByOwnerAssignment.all(owner, assignmentId).map(parseMappingRow);
  if (classId) return stmts.mappingsByOwnerClass.all(owner, classId).map(parseMappingRow);
  return stmts.mappingsByOwner.all(owner).map(parseMappingRow);
}

export function replaceStandardMappingsForOwner(owner, mappings = []) {
  if (!owner) return { success: false, error: 'owner is required' };
  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    stmts.deleteMappingsByOwner.run(owner);
    const seen = new Set();
    for (const mapping of mappings) {
      const classId = String(mapping?.classId || '').trim();
      const assignmentId = String(mapping?.assignmentId || '').trim();
      const standardCode = String(mapping?.standardCode || '').trim();
      if (!classId || !assignmentId || !standardCode) continue;
      const questionId = mapping?.questionId ? String(mapping.questionId) : null;
      const dedupeKey = `${classId}|${assignmentId}|${questionId || ''}|${standardCode.toLowerCase()}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      const id = mapping?.id || `map-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const payload = {
        ...mapping,
        id,
        owner,
        classId,
        assignmentId,
        questionId,
        standardCode,
        standardLabel: String(mapping?.standardLabel || mapping?.standardName || ''),
        weight: Number(mapping?.weight) > 0 ? Number(mapping.weight) : 1,
      };
      stmts.upsertMapping.run(
        payload.id,
        owner,
        payload.classId,
        payload.assignmentId,
        payload.questionId,
        payload.standardCode,
        payload.standardLabel,
        payload.weight,
        JSON.stringify(payload),
        now,
        now
      );
    }
  });
  tx();
  return { success: true, mappings: getStandardMappingsByOwner(owner) };
}

function average(list) {
  if (!list.length) return 0;
  return list.reduce((s, n) => s + n, 0) / list.length;
}

function submissionTimeValue(sub) {
  const t = sub?.submittedAt || sub?.updatedAt || sub?.startedAt || sub?.createdAt;
  const n = Date.parse(t || '');
  return Number.isFinite(n) ? n : 0;
}

function questionPercentFromSubmission(submission, questionId) {
  if (!submission || !questionId) return null;
  const list = Array.isArray(submission.questionScores) ? submission.questionScores : [];
  const hit = list.find((q) => String(q?.questionId || '') === String(questionId));
  if (hit && Number.isFinite(Number(hit.maxPoints)) && Number(hit.maxPoints) > 0) {
    const pct = (Number(hit.score || 0) / Number(hit.maxPoints)) * 100;
    return Math.max(0, Math.min(100, pct));
  }
  const r = submission?.gradeResult?.results?.[questionId];
  if (r && Number.isFinite(Number(r.maxPoints)) && Number(r.maxPoints) > 0) {
    const pct = (Number(r.score || 0) / Number(r.maxPoints)) * 100;
    return Math.max(0, Math.min(100, pct));
  }
  return null;
}

export function getMasteryDashboard(owner, options = {}) {
  if (!owner) return { rows: [], summary: { averageMastery: 0, standards: 0, records: 0 } };
  const level = ['district', 'school', 'class'].includes(options?.level) ? options.level : 'class';
  const scopeValue = options?.scopeValue ? String(options.scopeValue) : '';
  const mappings = getStandardMappingsByOwner(owner);
  if (!mappings.length) return { rows: [], summary: { averageMastery: 0, standards: 0, records: 0 } };

  const grades = rows(stmts.allGrades);
  const classes = rows(stmts.allClasses);
  const assignments = rows(stmts.allAssignments);
  const submissions = rows(stmts.allSubmissions);
  const classById = new Map(classes.map((c) => [c.id, c]));
  const assignmentById = new Map(assignments.map((a) => [a.id, a]));
  const gradeByKey = new Map(grades.map((g) => [`${g.studentId}:${g.assignmentId}`, g]));
  const latestSubByStudentAssessment = new Map();
  for (const sub of submissions) {
    if (!sub?.studentId) continue;
    const targetId = sub.assessmentId || sub.assignmentId;
    if (!targetId) continue;
    const key = `${sub.studentId}:${targetId}`;
    const prev = latestSubByStudentAssessment.get(key);
    if (!prev || submissionTimeValue(sub) > submissionTimeValue(prev)) {
      latestSubByStudentAssessment.set(key, sub);
    }
  }

  const rowsOut = [];
  for (const map of mappings) {
    const assignment = assignmentById.get(map.assignmentId);
    const classId = map.classId || assignment?.classId;
    if (!classId) continue;
    const cls = classById.get(classId);
    if (!cls) continue;
    const roster = (cls.students || []).filter((s) => s?.id);
    const scores = [];
    for (const stu of roster) {
      if (map.questionId) {
        const submission = latestSubByStudentAssessment.get(`${stu.id}:${map.assignmentId}`);
        const questionPct = questionPercentFromSubmission(submission, map.questionId);
        if (questionPct !== null) scores.push(questionPct);
      } else {
        const grade = gradeByKey.get(`${stu.id}:${map.assignmentId}`);
        if (grade && Number.isFinite(Number(grade.score))) {
          scores.push(Math.max(0, Math.min(100, Number(grade.score))));
        }
      }
    }
    const mastery = Math.round(average(scores));
    const districtId = cls.districtId || '';
    const schoolId = cls.schoolId || '';
    if (level === 'district' && scopeValue && districtId !== scopeValue) continue;
    if (level === 'school' && scopeValue && schoolId !== scopeValue) continue;
    if (level === 'class' && scopeValue && classId !== scopeValue) continue;
    rowsOut.push({
      districtId,
      districtName: cls.districtName || districtId || 'Unassigned District',
      schoolId,
      schoolName: cls.schoolName || schoolId || 'Unassigned School',
      classId,
      className: cls.name || classId,
      assignmentId: map.assignmentId,
      assignmentTitle: assignment?.title || assignment?.name || map.assignmentId,
      questionId: map.questionId || '',
      standardCode: map.standardCode,
      standardLabel: map.standardLabel || map.standardCode,
      scoreSource: map.questionId ? 'questionScores' : 'gradebook',
      weight: map.weight || 1,
      mastery,
      studentsAssessed: scores.length,
      studentsEnrolled: roster.length,
    });
  }

  const grouped = new Map();
  for (const row of rowsOut) {
    const key = level === 'district'
      ? `${row.districtId}|${row.standardCode}`
      : level === 'school'
        ? `${row.schoolId}|${row.standardCode}`
        : `${row.classId}|${row.standardCode}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }
  const reduced = [];
  for (const list of grouped.values()) {
    const first = list[0];
    const mastery = Math.round(average(list.map((r) => r.mastery)));
    reduced.push({
      ...first,
      mastery,
      mappedItems: list.length,
      studentsAssessed: Math.round(average(list.map((r) => r.studentsAssessed))),
      studentsEnrolled: Math.round(average(list.map((r) => r.studentsEnrolled))),
    });
  }

  return {
    rows: reduced.sort((a, b) => a.standardCode.localeCompare(b.standardCode)),
    summary: {
      averageMastery: Math.round(average(reduced.map((r) => r.mastery))),
      standards: new Set(reduced.map((r) => r.standardCode)).size,
      records: reduced.length,
    },
  };
}

export function getDistrictHierarchy(id = 'global') {
  const row = stmts.getDistrictHierarchyState.get(id);
  if (!row) return { id, districts: [], updatedAt: null };
  try {
    const data = JSON.parse(row.data || '{}');
    return {
      id,
      districts: Array.isArray(data.districts) ? data.districts : [],
      updatedAt: data.updatedAt || null,
    };
  } catch {
    return { id, districts: [], updatedAt: null };
  }
}

export function getTAClassIds(taUsername) {
  return stmts.classesByTA.all(taUsername).map(r => r.classId);
}

export function addTAToClass(taUsername, classId) {
  const teacher = stmts.classById.get(classId);
  if (!teacher) return { success: false, error: 'Class not found.' };
  const ta = stmts.findTeacher.get(taUsername);
  if (!ta) return { success: false, error: 'TA user not found.' };
  if (ta.role !== 'ta') return { success: false, error: 'User is not a TA.' };
  stmts.insertClassTA.run(taUsername, classId);
  return { success: true };
}

export function removeTAFromClass(taUsername, classId) {
  stmts.removeClassTA.run(taUsername, classId);
  return { success: true };
}

export function getTAsForClass(classId) {
  return stmts.tasByClass.all(classId).map(r => r.taUsername);
}

export function saveDistrictHierarchy(next, id = 'global') {
  const payload = {
    id,
    districts: Array.isArray(next?.districts) ? next.districts : [],
    updatedAt: new Date().toISOString(),
  };
  stmts.upsertDistrictHierarchyState.run(id, JSON.stringify(payload), payload.updatedAt);
  return { success: true, data: payload };
}

// ════════════════════════════════════════════════════════════════
//  PEER REVIEWS
// ════════════════════════════════════════════════════════════════

const prStmts = {
  insertPRA: db.prepare('INSERT INTO peer_review_assignments (id, assignmentId, classId, anonymous, rubricJson, createdAt) VALUES (?, ?, ?, ?, ?, ?)'),
  getPRAByAssignment: db.prepare('SELECT * FROM peer_review_assignments WHERE assignmentId = ?'),
  getPRAById: db.prepare('SELECT * FROM peer_review_assignments WHERE id = ?'),
  insertPR: db.prepare('INSERT INTO peer_reviews (id, praId, reviewerStudentId, revieweeStudentId, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)'),
  getPRsByPRA: db.prepare('SELECT * FROM peer_reviews WHERE praId = ? ORDER BY createdAt ASC'),
  getPRsByReviewer: db.prepare('SELECT * FROM peer_reviews WHERE reviewerStudentId = ? ORDER BY createdAt ASC'),
  getPRById: db.prepare('SELECT * FROM peer_reviews WHERE id = ?'),
  updatePR: db.prepare('UPDATE peer_reviews SET score = ?, feedback = ?, rubricScores = ?, status = ?, submittedAt = ? WHERE id = ?'),
};

export function createPeerReviewAssignment({ assignmentId, classId, anonymous, rubric, studentIds }) {
  const id = `pra-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  prStmts.insertPRA.run(id, assignmentId, classId, anonymous ? 1 : 0, JSON.stringify(rubric || []), now);
  if (Array.isArray(studentIds) && studentIds.length > 1) {
    const shuffled = [...studentIds].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length; i++) {
      const reviewer = shuffled[i];
      const reviewee = shuffled[(i + 1) % shuffled.length];
      const prId = `pr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${i}`;
      prStmts.insertPR.run(prId, id, reviewer, reviewee, 'pending', now);
    }
  }
  return { success: true, id, reviews: prStmts.getPRsByPRA.all(id) };
}

export function getPeerReviewAssignment(assignmentId) {
  const pra = prStmts.getPRAByAssignment.get(assignmentId);
  if (!pra) return null;
  return { ...pra, rubric: JSON.parse(pra.rubricJson || '[]'), reviews: prStmts.getPRsByPRA.all(pra.id).map(parsePR) };
}

function parsePR(r) {
  return { ...r, rubricScores: JSON.parse(r.rubricScores || '{}'), anonymous: undefined };
}

export function submitPeerReview(id, { score, feedback, rubricScores }) {
  const pr = prStmts.getPRById.get(id);
  if (!pr) return { success: false, error: 'Review not found.' };
  prStmts.updatePR.run(score ?? null, feedback || '', JSON.stringify(rubricScores || {}), 'submitted', new Date().toISOString(), id);
  const pra = prStmts.getPRAById.get(pr.praId);
  if (pra && score != null) {
    const cls = stmts.classById.get(pra.classId);
    if (cls) {
      const classData = JSON.parse(cls.data);
      const teacher = classData.teacher;
      if (teacher) {
        const allGrades = rows(stmts.gradesByTeacher, teacher);
        const normScore = Math.min(100, Math.max(0, typeof score === 'number' ? score : (typeof rubricScores === 'object' && rubricScores ? Object.values(rubricScores).reduce((s, v) => s + (Number(v) || 0), 0) : 0)));
        const idx = allGrades.findIndex(g => g.studentId === pr.revieweeStudentId && g.assignmentId === pra.assignmentId);
        const entry = { studentId: pr.revieweeStudentId, assignmentId: pra.assignmentId, score: Math.round(normScore), source: 'peerReview', syncedAt: new Date().toISOString() };
        if (idx >= 0 && allGrades[idx].source !== 'manual') allGrades[idx] = { ...allGrades[idx], ...entry };
        else if (idx < 0) allGrades.push(entry);
        else return { success: true };
        saveGradesForTeacher(teacher, allGrades);
      }
    }
  }
  return { success: true };
}

export function getPeerReviewsForStudent(studentId) {
  return prStmts.getPRsByReviewer.all(studentId).map(parsePR);
}

export function getPeerReviewById(id) {
  const row = prStmts.getPRById.get(id);
  if (!row) return null;
  return { ...parsePR(row), id: row.id };
}

// ════════════════════════════════════════════════════════════════
//  STUDENT GROUPS
// ════════════════════════════════════════════════════════════════

const grpStmts = {
  insertGroup: db.prepare('INSERT INTO groups (id, classId, name, createdAt) VALUES (?, ?, ?, ?)'),
  groupsByClass: db.prepare('SELECT * FROM groups WHERE classId = ? ORDER BY createdAt ASC'),
  groupById: db.prepare('SELECT * FROM groups WHERE id = ?'),
  deleteGroup: db.prepare('DELETE FROM groups WHERE id = ?'),
  insertMember: db.prepare('INSERT OR IGNORE INTO group_members (groupId, studentId) VALUES (?, ?)'),
  removeMember: db.prepare('DELETE FROM group_members WHERE groupId = ? AND studentId = ?'),
  membersByGroup: db.prepare('SELECT studentId FROM group_members WHERE groupId = ?'),
  clearMembers: db.prepare('DELETE FROM group_members WHERE groupId = ?'),
};

export function createGroup(classId, name) {
  const id = `grp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  grpStmts.insertGroup.run(id, classId, name || 'Untitled Group', new Date().toISOString());
  return { success: true, id };
}

export function getGroupsByClass(classId) {
  return grpStmts.groupsByClass.all(classId).map(g => ({
    ...g,
    members: grpStmts.membersByGroup.all(g.id).map(m => m.studentId),
  }));
}

export function setGroupMembers(groupId, studentIds) {
  const g = grpStmts.groupById.get(groupId);
  if (!g) return { success: false, error: 'Group not found.' };
  const tx = db.transaction(() => {
    grpStmts.clearMembers.run(groupId);
    for (const sid of (studentIds || [])) grpStmts.insertMember.run(groupId, sid);
  });
  tx();
  return { success: true, members: grpStmts.membersByGroup.all(groupId).map(m => m.studentId) };
}

export function deleteGroup(groupId) {
  const tx = db.transaction(() => {
    grpStmts.clearMembers.run(groupId);
    grpStmts.deleteGroup.run(groupId);
  });
  tx();
  return { success: true };
}

// ════════════════════════════════════════════════════════════════
//  ANNOUNCEMENT READ TRACKING
// ════════════════════════════════════════════════════════════════

const annReadStmts = {
  markRead: db.prepare('INSERT OR IGNORE INTO announcement_reads (announcementId, userId, readAt) VALUES (?, ?, ?)'),
  getReads: db.prepare('SELECT * FROM announcement_reads WHERE announcementId = ? ORDER BY readAt DESC'),
  getReadCount: db.prepare('SELECT COUNT(*) AS c FROM announcement_reads WHERE announcementId = ?'),
  isRead: db.prepare('SELECT 1 FROM announcement_reads WHERE announcementId = ? AND userId = ?'),
};

export function markAnnouncementRead(announcementId, userId) {
  annReadStmts.markRead.run(announcementId, userId, new Date().toISOString());
  return { success: true };
}

export function getAnnouncementReads(announcementId) {
  return annReadStmts.getReads.all(announcementId);
}

export function getAnnouncementReadCount(announcementId) {
  return annReadStmts.getReadCount.get(announcementId).c;
}

export function isAnnouncementRead(announcementId, userId) {
  return !!annReadStmts.isRead.get(announcementId, userId);
}

// ════════════════════════════════════════════════════════════════
//  ACTIVITY LOG
// ════════════════════════════════════════════════════════════════

const actStmts = {
  insert: db.prepare('INSERT INTO activity_log (userId, userRole, action, resourceType, resourceId, durationMs, meta, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'),
  byUser: db.prepare('SELECT * FROM activity_log WHERE userId = ? ORDER BY ts DESC LIMIT ?'),
  byResource: db.prepare('SELECT * FROM activity_log WHERE resourceType = ? AND resourceId = ? ORDER BY ts DESC LIMIT ?'),
  byClassStudents: db.prepare(`
    SELECT al.* FROM activity_log al
    WHERE al.userId IN (SELECT studentId FROM student_classes WHERE classId = ?)
    ORDER BY al.ts DESC LIMIT ?
  `),
  countByUserAction: db.prepare('SELECT action, COUNT(*) AS c FROM activity_log WHERE userId = ? GROUP BY action'),
  timeByUser: db.prepare('SELECT userId, SUM(durationMs) AS totalMs FROM activity_log WHERE resourceType = ? AND resourceId = ? GROUP BY userId'),
};

export function logActivity(entries) {
  const list = Array.isArray(entries) ? entries : [entries];
  const tx = db.transaction(() => {
    for (const e of list) {
      actStmts.insert.run(
        e.userId || '', e.userRole || 'student', e.action || 'page_view',
        e.resourceType || '', e.resourceId || '', e.durationMs || 0,
        JSON.stringify(e.meta || {}), e.ts || new Date().toISOString()
      );
    }
  });
  tx();
  return { success: true, count: list.length };
}

export function getActivityByUser(userId, limit = 100) {
  return actStmts.byUser.all(userId, limit).map(r => ({ ...r, meta: JSON.parse(r.meta || '{}') }));
}

export function getActivityByResource(resourceType, resourceId, limit = 100) {
  return actStmts.byResource.all(resourceType, resourceId, limit).map(r => ({ ...r, meta: JSON.parse(r.meta || '{}') }));
}

export function getClassActivityLog(classId, limit = 500) {
  return actStmts.byClassStudents.all(classId, limit).map(r => ({ ...r, meta: JSON.parse(r.meta || '{}') }));
}

export function getActivitySummary(userId) {
  return actStmts.countByUserAction.all(userId);
}

export function getTimeOnResource(resourceType, resourceId) {
  return actStmts.timeByUser.all(resourceType, resourceId);
}

// ════════════════════════════════════════════════════════════════
//  ICAL TOKENS
// ════════════════════════════════════════════════════════════════

const icalStmts = {
  insert: db.prepare('INSERT OR IGNORE INTO ical_tokens (token, userId, userRole, createdAt) VALUES (?, ?, ?, ?)'),
  getByUser: db.prepare('SELECT token FROM ical_tokens WHERE userId = ? LIMIT 1'),
  getByToken: db.prepare('SELECT * FROM ical_tokens WHERE token = ?'),
  deleteByUser: db.prepare('DELETE FROM ical_tokens WHERE userId = ?'),
};

export function getOrCreateIcalToken(userId, userRole = 'teacher') {
  const existing = icalStmts.getByUser.get(userId);
  if (existing) return existing.token;
  const token = `ical-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  icalStmts.insert.run(token, userId, userRole, new Date().toISOString());
  return token;
}

export function resolveIcalToken(token) {
  return icalStmts.getByToken.get(token) || null;
}

export function revokeIcalToken(userId) {
  icalStmts.deleteByUser.run(userId);
  return { success: true };
}

// ════════════════════════════════════════════════════════════════
//  GLOBAL SEARCH
// ════════════════════════════════════════════════════════════════

export function globalSearch(query, { teacher, limit = 50 } = {}) {
  const q = `%${(query || '').trim().toLowerCase()}%`;
  if (!q || q === '%%') return { classes: [], assignments: [], students: [], wiki: [] };

  const classRows = teacher
    ? db.prepare("SELECT data FROM classes WHERE teacher = ? AND LOWER(data) LIKE ?").all(teacher, q)
    : db.prepare("SELECT data FROM classes WHERE LOWER(data) LIKE ? LIMIT ?").all(q, limit);
  const classes = classRows.map(r => { const d = JSON.parse(r.data); return { id: d.id, name: d.name, teacher: d.teacher }; }).slice(0, limit);

  const assignRows = teacher
    ? db.prepare("SELECT data FROM assignments WHERE classId IN (SELECT id FROM classes WHERE teacher = ?) AND LOWER(data) LIKE ?").all(teacher, q)
    : db.prepare("SELECT data FROM assignments WHERE LOWER(data) LIKE ? LIMIT ?").all(q, limit);
  const assignments = assignRows.map(r => { const d = JSON.parse(r.data); return { id: d.id, name: d.name || d.title, classId: d.classId }; }).slice(0, limit);

  const stuRows = db.prepare("SELECT id, username, displayName FROM students WHERE LOWER(username) LIKE ? OR LOWER(displayName) LIKE ? LIMIT ?").all(q, q, limit);
  const students = stuRows.map(s => ({ id: s.id, username: s.username, displayName: s.displayName }));

  let wiki = [];
  try {
    const wikiRows = db.prepare("SELECT id, classId, title FROM wiki_pages WHERE LOWER(title) LIKE ? OR LOWER(body) LIKE ? LIMIT ?").all(q, q, limit);
    wiki = wikiRows;
  } catch { /* wiki table may not exist yet */ }

  return { classes, assignments, students, wiki };
}

export { db };

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGINT', () => { db.close(); process.exit(0); });
process.on('SIGTERM', () => { db.close(); process.exit(0); });
