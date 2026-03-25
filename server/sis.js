/**
 * SIS (Student Information System) Integration
 *
 * Handles:
 *  - CSV roster import (students with name, email, class)
 *  - CSV grade export (for PowerSchool, Skyward, etc.)
 *  - Roster sync endpoints
 */

import {
  getClassesByTeacher, getStudents, addStudent, joinClass,
  getGradesByTeacher, getAssignmentsByTeacher,
} from './store.js';

function parseCSV(text) {
  const input = String(text || '').trim();
  if (!input) return { headers: [], rows: [] };

  // Handles quoted values, escaped quotes, and comma-in-field safely.
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(current.trim());
    current = '';
  };
  const pushRow = () => {
    // Ignore trailing empty rows.
    if (row.some((v) => v !== '')) rows.push(row);
    row = [];
  };

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      pushField();
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      pushField();
      pushRow();
    } else {
      current += ch;
    }
  }
  pushField();
  pushRow();

  if (rows.length < 2) return { headers: [], rows: [] };
  const headers = rows[0].map(h => String(h || '').replace(/^"|"$/g, '').trim().toLowerCase());
  const dataRows = rows.slice(1).map((values) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (values[idx] || '').replace(/^"|"$/g, ''); });
    return obj;
  });
  return { headers, rows: dataRows };
}

function canonicalUsername({ email, displayName, externalId }) {
  if (email) return email.toLowerCase().trim();
  const base = (displayName || 'student').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
  return externalId ? `${base}.${String(externalId).toLowerCase()}` : `${base}.${Math.floor(Math.random() * 1000)}`;
}

function toCSV(headers, rows) {
  const escape = (v) => {
    const str = String(v ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

export function createSISRouter(express, authMiddleware) {
  const router = express.Router();

  // Import roster from CSV
  router.post('/import-roster', authMiddleware, express.text({ type: '*/*', limit: '2mb' }), async (req, res) => {
    try {
      const username = req.user.username;
      const { classId } = req.query;
      if (!classId) return res.json({ success: false, error: 'classId query parameter required.' });

      const classes = getClassesByTeacher(username);
      const cls = classes.find(c => c.id === classId);
      if (!cls) return res.json({ success: false, error: 'Class not found.' });

      const dryRun = req.query.dryRun === '1' || req.query.dryRun === 'true';
      const { headers, rows } = parseCSV(req.body);
      if (rows.length === 0) return res.json({ success: false, error: 'CSV is empty or invalid.' });

      const nameField = headers.find(h => ['name', 'student_name', 'student', 'display_name', 'displayname', 'full_name'].includes(h));
      const emailField = headers.find(h => ['email', 'student_email', 'email_address'].includes(h));
      const idField = headers.find(h => ['student_id', 'id', 'sis_id', 'external_id'].includes(h));

      if (!nameField && !emailField) {
        return res.json({ success: false, error: 'CSV must have a "name" or "email" column.' });
      }

      const results = {
        imported: 0,
        existing: 0,
        duplicatesInFile: 0,
        invalidRows: 0,
        errors: [],
        warnings: [],
      };
      const existingStudents = getStudents();
      const seenKeys = new Set();

      for (const row of rows) {
        const displayName = (row[nameField] || row[emailField] || '').trim();
        const email = (row[emailField] || '').trim();
        const externalId = (row[idField] || '').trim();
        if (!displayName && !email) {
          results.invalidRows++;
          results.errors.push(`Row missing name/email: ${JSON.stringify(row)}`);
          continue;
        }
        const uname = canonicalUsername({ email, displayName, externalId });
        const dedupeKey = `${uname}|${externalId}`;
        if (seenKeys.has(dedupeKey)) {
          results.duplicatesInFile++;
          continue;
        }
        seenKeys.add(dedupeKey);

        const existing = existingStudents.find(s => s.username === uname || (email && s.username === email));

        if (existing) {
          if (!dryRun) joinClass(existing.id, cls.classCode);
          results.existing++;
        } else {
          const tempPassword = `student${Math.floor(1000 + Math.random() * 9000)}`;
          if (!dryRun) {
            const result = await addStudent({ username: uname, password: tempPassword, displayName: displayName || 'Student', classCode: cls.classCode });
            if (result.success) {
              results.imported++;
            } else {
              results.errors.push(`${displayName || uname}: ${result.error}`);
            }
          } else {
            results.imported++;
          }
        }
      }

      if (dryRun) {
        results.warnings.push('Dry run only: no student records were modified.');
      }
      res.json({ success: true, dryRun, ...results, total: rows.length });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  // Export grades as CSV
  router.get('/export-grades', authMiddleware, (req, res) => {
    try {
      const username = req.user.username;
      const { classId, format } = req.query;

      const classes = getClassesByTeacher(username);
      const grades = getGradesByTeacher(username);
      const assignments = getAssignmentsByTeacher(username);
      const students = getStudents();

      const targetClasses = classId ? classes.filter(c => c.id === classId) : classes;
      const targetClassIds = targetClasses.map(c => c.id);
      const classAssignments = assignments.filter(a => targetClassIds.includes(a.classId));
      const classStudents = students.filter(s => s.classIds?.some(id => targetClassIds.includes(id)));

      const headers = ['student_id', 'student_name', 'class', ...classAssignments.map(a => a.name), 'average'];
      const rows = classStudents.map(s => {
        const row = {
          student_id: s.id,
          student_name: s.displayName || s.username,
          class: targetClasses.find(c => s.classIds?.includes(c.id))?.name || '',
        };
        let total = 0, count = 0;
        for (const a of classAssignments) {
          const g = grades.find(g => g.studentId === s.id && g.assignmentId === a.id);
          row[a.name] = g?.score ?? '';
          if (g?.score != null) { total += g.score; count++; }
        }
        row.average = count > 0 ? (total / count).toFixed(1) : '';
        return row;
      });

      if (format === 'json') {
        return res.json({ success: true, headers, rows });
      }

      const csv = toCSV(headers, rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="grades-${Date.now()}.csv"`);
      res.send(csv);
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  // Strong roster sync (upsert/full with optional deactivate-missing)
  router.post('/sync-roster', authMiddleware, async (req, res) => {
    try {
      const username = req.user.username;
      const { classId } = req.query;
      const rows = Array.isArray(req.body?.students) ? req.body.students : [];
      const mode = String(req.body?.mode || 'upsert').toLowerCase(); // upsert | full
      const deactivateMissing = req.body?.deactivateMissing === true || mode === 'full';

      if (!classId) return res.json({ success: false, error: 'classId query parameter required.' });
      if (rows.length === 0) return res.json({ success: false, error: 'students[] is required.' });

      const classes = getClassesByTeacher(username);
      const cls = classes.find(c => c.id === classId);
      if (!cls) return res.json({ success: false, error: 'Class not found.' });

      const allStudents = getStudents();
      const activeIds = new Set();
      const summary = { created: 0, existing: 0, enrolled: 0, deactivated: 0, errors: [] };

      for (const row of rows) {
        const rowUsername = String(row?.username || row?.email || '').trim().toLowerCase();
        const displayName = String(row?.displayName || row?.name || rowUsername || 'Student').trim();
        if (!rowUsername) {
          summary.errors.push(`Invalid row: ${JSON.stringify(row)}`);
          continue;
        }

        let stu = allStudents.find(s => s.username.toLowerCase() === rowUsername);
        if (!stu) {
          const add = await addStudent({ username: rowUsername, password: 'student1234', displayName, classCode: cls.classCode });
          if (!add.success) {
            summary.errors.push(`${rowUsername}: ${add.error}`);
            continue;
          }
          summary.created++;
          stu = add.student;
        } else {
          joinClass(stu.id, cls.classCode);
          summary.existing++;
        }
        activeIds.add(stu.id);
        summary.enrolled++;
      }

      if (deactivateMissing) {
        const classStudents = getStudents().filter(s => (s.classIds || []).includes(classId));
        for (const stu of classStudents) {
          if (!activeIds.has(stu.id)) {
            // Direct un-enroll from class while preserving account.
            const { db } = await import('./store.js');
            db.prepare('DELETE FROM student_classes WHERE studentId = ? AND classId = ?').run(stu.id, classId);
            summary.deactivated++;
          }
        }
      }

      res.json({ success: true, classId, mode, deactivateMissing, summary });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  // Export roster as CSV
  router.get('/export-roster', authMiddleware, (req, res) => {
    try {
      const username = req.user.username;
      const { classId } = req.query;

      const classes = getClassesByTeacher(username);
      const students = getStudents();

      const targetClasses = classId ? classes.filter(c => c.id === classId) : classes;
      const targetClassIds = targetClasses.map(c => c.id);
      const classStudents = students.filter(s => s.classIds?.some(id => targetClassIds.includes(id)));

      const headers = ['student_id', 'username', 'display_name', 'class', 'enrolled_date'];
      const rows = classStudents.map(s => ({
        student_id: s.id,
        username: s.username,
        display_name: s.displayName || s.username,
        class: targetClasses.find(c => s.classIds?.includes(c.id))?.name || '',
        enrolled_date: s.createdAt || '',
      }));

      const csv = toCSV(headers, rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="roster-${Date.now()}.csv"`);
      res.send(csv);
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  return router;
}
