import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'quantegy.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const MIGRATIONS = [
  {
    version: 1,
    name: 'create_wiki_pages',
    up: `
      CREATE TABLE IF NOT EXISTS wiki_pages (
        id        TEXT PRIMARY KEY,
        classId   TEXT NOT NULL,
        title     TEXT NOT NULL DEFAULT 'Untitled Page',
        body      TEXT NOT NULL DEFAULT '',
        createdBy TEXT NOT NULL,
        updatedBy TEXT,
        locked    INTEGER NOT NULL DEFAULT 0,
        publishedAt TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_wiki_class ON wiki_pages(classId);
    `,
  },
  {
    version: 2,
    name: 'create_wiki_revisions',
    up: `
      CREATE TABLE IF NOT EXISTS wiki_revisions (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        pageId    TEXT NOT NULL REFERENCES wiki_pages(id) ON DELETE CASCADE,
        body      TEXT NOT NULL DEFAULT '',
        editedBy  TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_wiki_rev_page ON wiki_revisions(pageId);
    `,
  },
  {
    version: 3,
    name: 'create_annotations',
    up: `
      CREATE TABLE IF NOT EXISTS annotations (
        id           TEXT PRIMARY KEY,
        submissionId TEXT NOT NULL,
        pageNum      INTEGER NOT NULL DEFAULT 1,
        x            REAL NOT NULL DEFAULT 0,
        y            REAL NOT NULL DEFAULT 0,
        width        REAL,
        height       REAL,
        type         TEXT NOT NULL DEFAULT 'comment',
        content      TEXT NOT NULL DEFAULT '',
        color        TEXT NOT NULL DEFAULT '#facc15',
        authorId     TEXT NOT NULL,
        authorName   TEXT,
        createdAt    TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_annot_sub ON annotations(submissionId);
    `,
  },
  {
    version: 4,
    name: 'create_moderated_grades',
    up: `
      CREATE TABLE IF NOT EXISTS moderated_grades (
        id             TEXT PRIMARY KEY,
        submissionId   TEXT NOT NULL,
        assessmentId   TEXT NOT NULL,
        graderId       TEXT NOT NULL,
        graderName     TEXT,
        score          REAL,
        maxScore       REAL,
        rubricScores   TEXT DEFAULT '{}',
        comments       TEXT DEFAULT '',
        isFinal        INTEGER NOT NULL DEFAULT 0,
        selectedBy     TEXT,
        createdAt      TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_modgrade_sub ON moderated_grades(submissionId);
      CREATE INDEX IF NOT EXISTS idx_modgrade_assess ON moderated_grades(assessmentId);
    `,
  },
  {
    version: 5,
    name: 'create_scorm_packages',
    up: `
      CREATE TABLE IF NOT EXISTS scorm_packages (
        id          TEXT PRIMARY KEY,
        classId     TEXT NOT NULL,
        title       TEXT NOT NULL DEFAULT 'SCORM Package',
        version     TEXT NOT NULL DEFAULT '1.2',
        entryUrl    TEXT NOT NULL DEFAULT '',
        manifestXml TEXT DEFAULT '',
        uploadedBy  TEXT NOT NULL,
        createdAt   TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_scorm_class ON scorm_packages(classId);

      CREATE TABLE IF NOT EXISTS scorm_attempts (
        id          TEXT PRIMARY KEY,
        packageId   TEXT NOT NULL REFERENCES scorm_packages(id),
        studentId   TEXT NOT NULL,
        status      TEXT NOT NULL DEFAULT 'not attempted',
        score       REAL,
        maxScore    REAL,
        timeSpent   INTEGER DEFAULT 0,
        suspendData TEXT DEFAULT '',
        location    TEXT DEFAULT '',
        completedAt TEXT,
        createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt   TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_scorm_att_pkg ON scorm_attempts(packageId);
      CREATE INDEX IF NOT EXISTS idx_scorm_att_stu ON scorm_attempts(studentId);
    `,
  },
];

export function runMigrations(dbInstance) {
  const db = dbInstance || new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version   INTEGER PRIMARY KEY,
      name      TEXT NOT NULL,
      appliedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    db.prepare('SELECT version FROM _migrations').all().map(r => r.version)
  );

  const pending = MIGRATIONS.filter(m => !applied.has(m.version))
    .sort((a, b) => a.version - b.version);

  if (pending.length === 0) return { applied: 0, total: MIGRATIONS.length };

  const insert = db.prepare('INSERT INTO _migrations (version, name) VALUES (?, ?)');
  const transaction = db.transaction(() => {
    for (const m of pending) {
      db.exec(m.up);
      insert.run(m.version, m.name);
      console.log(`[migration] Applied v${m.version}: ${m.name}`);
    }
  });

  transaction();
  return { applied: pending.length, total: MIGRATIONS.length };
}

export { MIGRATIONS };
