import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import {
  getTeachers, addTeacher, verifyTeacher, resetPassword,
  getProfile, saveProfile, getSubscriptionData, saveSubscriptionData,
  getAllTeacherData, getAllTeacherDataForTA, findTeacher,
  getTAClassIds, addTAToClass, removeTAFromClass, getTAsForClass,
  getClassesByTeacher, saveClassesForTeacher,
  getAssignmentsByTeacher, saveAssignmentsForTeacher,
  getGameResultsByTeacher, saveGameResultsForTeacher,
  getGradesByTeacher, saveGradesForTeacher,
  getStudents, addStudent, verifyStudent, joinClass,
  getModulesByTeacher, saveModulesForTeacher,
  getAnnouncementsByTeacher, saveAnnouncementsForTeacher,
  getDiscussionsByTeacher, saveDiscussionsForTeacher,
  getChatByTeacher, saveChatForTeacher, addChatMessage, getChatByClass,
  getAssessmentsByTeacher, saveAssessmentsForTeacher, addAssessment, getAssessmentById,
  getSubmissionsByTeacher, saveSubmissionsForTeacher, addSubmission, getSubmissionsForAssessment, getSubmissionsByStudent,
  saveQuestionBank, getQuestionBankById,
  bulkSaveTeacherContent,
  addNotification, getNotifications, getUnreadNotificationCount,
  markNotificationRead, markAllNotificationsRead,
  getNotificationPrefs, saveNotificationPrefs,
  getStandardsByOwner, replaceStandardsForOwner,
  getStandardMappingsByOwner, replaceStandardMappingsForOwner,
  getMasteryDashboard,
  getDistrictHierarchy, saveDistrictHierarchy,
  createPeerReviewAssignment, getPeerReviewAssignment, submitPeerReview, getPeerReviewsForStudent, getPeerReviewById,
  createGroup, getGroupsByClass, setGroupMembers, deleteGroup,
  markAnnouncementRead, getAnnouncementReads, getAnnouncementReadCount,
  logActivity, getActivityByUser, getClassActivityLog, getActivitySummary, getTimeOnResource,
  getOrCreateIcalToken, resolveIcalToken, revokeIcalToken,
  globalSearch,
  getGradesForStudent,
  getStudentSubscription, saveStudentSubscription,
  getStudentProgress, saveStudentProgress,
} from './store.js';
import { createLTIRouter } from './lti.js';
import { createUploadRouter, UPLOADS_PATH } from './uploads.js';
import { initSocketIO } from './socket.js';
import { createSISRouter } from './sis.js';
import { createSSORouter } from './sso.js';
import { createSREMetricsMiddleware, createSRERouter, getSREMetrics, SLO_TARGETS, getBurnRateReport } from './sre.js';
import { createInMemoryRateLimiter } from './rateLimit.js';
import { createAuditMiddleware, readAuditLogs } from './audit.js';
import { maybeSendSLOAlerts } from './alerts.js';
import { runMigrations } from './migrations.js';
import { createWikiRouter } from './wiki.js';
import { createAnnotationsRouter } from './annotations.js';
import { createSCORMRouter } from './scorm.js';
import { createModeratedGradingRouter } from './moderated-grading.js';
import { createCourseExportRouter } from './course-export.js';
import { db } from './store.js';
import { getAdminScope, setAdminScope, hasScopeForClass } from './adminScopes.js';
import { createJobQueue } from './jobs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const isProduction = process.env.NODE_ENV === 'production';

function validateProductionEnv() {
  if (!isProduction) return;
  const skipSsoCheck = process.env.ALLEN_ACE_SKIP_SSO_CHECK === '1' || process.env.ALLEN_ACE_SKIP_SSO_CHECK === 'true';
  const warnings = [];
  const jwtSecret = String(process.env.JWT_SECRET || '').trim();
  if (!jwtSecret || jwtSecret.toLowerCase().includes('change-in-production')) {
    warnings.push('JWT_SECRET should be set to a strong value in production.');
  }
  if (!skipSsoCheck) {
    const requiredOAuth = ['GOOGLE_CLIENT_ID', 'MICROSOFT_CLIENT_ID', 'CLEVER_CLIENT_ID'];
    const configuredOAuth = requiredOAuth.filter((key) => String(process.env[key] || '').trim() !== '');
    if (configuredOAuth.length === 0) {
      warnings.push('No SSO provider configured (GOOGLE_CLIENT_ID, MICROSOFT_CLIENT_ID, or CLEVER_CLIENT_ID). SSO login will be disabled. Set ALLEN_ACE_SKIP_SSO_CHECK=1 to silence.');
    }
  }
  if (warnings.length > 0) {
    console.warn(`[startup] Production environment warnings:\n- ${warnings.join('\n- ')}`);
    console.warn('[startup] Server will start anyway — fix these for full functionality.');
  }
}

// JWT secret — MUST be set via JWT_SECRET env var on production (Render).
// The fallback is deterministic so tokens survive dev-server restarts.
const JWT_SECRET = process.env.JWT_SECRET || 'quantegy-ai-dev-jwt-secret-not-for-production';
const JWT_EXPIRY = '24h';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

const BILLING_PLANS = {
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    interval: 'month',
    amount: 2000,
    currency: 'usd',
    seatsIncluded: 1,
    features: ['ai-copilot', 'test-bank', 'gradebook', 'dashboard', 'export', 'share-link', 'unlimited-classes'],
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    interval: 'year',
    amount: 20000,
    currency: 'usd',
    seatsIncluded: 1,
    features: ['ai-copilot', 'test-bank', 'gradebook', 'dashboard', 'export', 'share-link', 'unlimited-classes'],
    priceId: process.env.STRIPE_PRICE_PRO_YEARLY || '',
  },
  district_monthly: {
    id: 'district_monthly',
    name: 'District Monthly',
    interval: 'month',
    amount: 1200,
    currency: 'usd',
    seatsIncluded: 10,
    features: ['ai-copilot', 'test-bank', 'gradebook', 'dashboard', 'export', 'share-link', 'unlimited-classes', 'district-admin', 'sis-sync'],
    priceId: process.env.STRIPE_PRICE_DISTRICT_MONTHLY || '',
  },
  district_yearly: {
    id: 'district_yearly',
    name: 'District Yearly',
    interval: 'year',
    amount: 12000,
    currency: 'usd',
    seatsIncluded: 10,
    features: ['ai-copilot', 'test-bank', 'gradebook', 'dashboard', 'export', 'share-link', 'unlimited-classes', 'district-admin', 'sis-sync'],
    priceId: process.env.STRIPE_PRICE_DISTRICT_YEARLY || '',
  },
};

const STUDENT_BILLING_PLANS = {
  student_exam_onetime: {
    id: 'student_exam_onetime',
    name: 'Single Exam – Lifetime Access',
    interval: null,
    amount: 2900,
    currency: 'usd',
    features: ['exam-access'],
    priceId: process.env.STRIPE_PRICE_STUDENT_EXAM_ONETIME || '',
  },
  student_monthly: {
    id: 'student_monthly',
    name: 'All Exams – Monthly',
    interval: 'month',
    amount: 999,
    currency: 'usd',
    features: ['exam-access-all'],
    priceId: process.env.STRIPE_PRICE_STUDENT_MONTHLY || '',
  },
};

function planFeatures(planId) {
  return BILLING_PLANS[planId]?.features || STUDENT_BILLING_PLANS[planId]?.features || [];
}

function computeEntitlements(subscription = {}) {
  const now = Date.now();
  const plan = String(subscription.plan || 'free');
  const paidUntil = subscription.paidUntil ? Date.parse(subscription.paidUntil) : 0;
  const trialEnd = subscription.trialEnd ? Date.parse(subscription.trialEnd) : 0;
  const paidActive = Number.isFinite(paidUntil) && paidUntil > now;
  const trialActive = plan === 'trial' && Number.isFinite(trialEnd) && trialEnd > now;
  const active = paidActive || trialActive;
  const featureSet = new Set(active ? planFeatures(plan) : []);
  const seats = Number(subscription.seats || BILLING_PLANS[plan]?.seatsIncluded || 1);
  const examIds = subscription.examIds || [];
  return {
    active,
    plan,
    seats,
    features: Array.from(featureSet),
    examIds,
    has(feature) { return featureSet.has(feature); },
    hasExam(examId) {
      if (featureSet.has('exam-access-all')) return true;
      return featureSet.has('exam-access') && examIds.includes(examId);
    },
  };
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// ── Auth Middleware ──

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Fallback: check for username in body (backward compatibility during migration)
      if (!isProduction && req.body?.username) {
        req.user = { username: req.body.username, role: 'teacher' };
        return next();
      }
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    try {
      const token = authHeader.slice(7);
      const decoded = verifyToken(token);
      req.user = decoded;

      if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(decoded.role)) {
          return res.status(403).json({ success: false, error: 'Insufficient permissions.' });
        }
      }

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ success: false, error: 'Invalid session token.' });
    }
  };
}

const requireAuth = authMiddleware();
const requireTeacher = authMiddleware('teacher');
const requireTeacherOrTA = authMiddleware(['teacher', 'ta']);
const requireStudent = authMiddleware('student');
const requireAdmin = authMiddleware('admin');
const requireTeacherOrAdmin = authMiddleware(['teacher', 'admin']);
const requireStudentOrTeacher = authMiddleware(['student', 'teacher']);

function requireEntitlement(feature) {
  return (req, res, next) => {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ success: false, error: 'Authentication required.' });
    const subscription = getSubscriptionData(username) || {};
    const ent = computeEntitlements(subscription);
    if (!ent.active || !ent.has(feature)) {
      return res.status(402).json({ success: false, error: `Feature requires active plan entitlement: ${feature}` });
    }
    req.entitlements = ent;
    return next();
  };
}

function requireSelfOrAdmin(paramName = 'username') {
  return (req, res, next) => {
    if (req.user?.role === 'admin') return next();
    const target = req.params?.[paramName];
    if (!target) return res.status(400).json({ success: false, error: `Missing route param: ${paramName}` });
    if (req.user?.username !== target) {
      return res.status(403).json({ success: false, error: 'Forbidden: tenant boundary violation.' });
    }
    next();
  };
}

function requireClassMembership() {
  return (req, res, next) => {
    if (req.user?.role === 'admin') return next();
    const classId = req.params?.classId || req.body?.classId || req.body?.message?.classId;
    if (!classId) return res.status(400).json({ success: false, error: 'classId required.' });

    if (req.user?.role === 'teacher') {
      const owned = getClassesByTeacher(req.user.username).some((c) => c.id === classId);
      if (!owned) return res.status(403).json({ success: false, error: 'Forbidden: class not owned by teacher.' });
      return next();
    }

    if (req.user?.role === 'student') {
      const stu = getStudents().find((s) => s.id === req.user.studentId || s.username === req.user.username);
      const inClass = !!stu?.classIds?.includes(classId);
      if (!inClass) return res.status(403).json({ success: false, error: 'Forbidden: student not enrolled in class.' });
      return next();
    }

    return res.status(403).json({ success: false, error: 'Forbidden.' });
  };
}

function getClassMetaById(classId) {
  if (!classId) return null;
  const row = db.prepare('SELECT data FROM classes WHERE id = ?').get(classId);
  if (!row) return null;
  try {
    const data = JSON.parse(row.data || '{}');
    return {
      id: data.id || classId,
      districtId: data.districtId || '',
      subAccountId: data.subAccountId || '',
      schoolId: data.schoolId || '',
      teacher: data.teacher || '',
    };
  } catch {
    return { id: classId };
  }
}

function getClassById(classId) {
  if (!classId) return null;
  const row = db.prepare('SELECT id, data FROM classes WHERE id = ?').get(classId);
  if (!row) return null;
  try {
    const data = JSON.parse(row.data || '{}');
    return { id: row.id, ...data };
  } catch {
    return { id: row.id };
  }
}

function listAllClasses() {
  const rows = db.prepare('SELECT id, data FROM classes').all();
  return rows.map((row) => {
    try {
      return { id: row.id, ...JSON.parse(row.data || '{}') };
    } catch {
      return { id: row.id };
    }
  });
}

function getAssignmentById(assignmentId) {
  if (!assignmentId) return null;
  const row = db.prepare('SELECT data FROM assignments WHERE id = ?').get(assignmentId);
  if (row) {
    try {
      return { ...JSON.parse(row.data || '{}'), __kind: 'assignment' };
    } catch {
      return null;
    }
  }
  const assessment = getAssessmentById(assignmentId);
  if (assessment) return { ...assessment, __kind: 'assessment' };
  return null;
}

function summarizeMasteryRows(rows = []) {
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + (Number(r.mastery) || 0), 0) / rows.length) : 0;
  return {
    averageMastery: avg,
    standards: new Set(rows.map((r) => r.standardCode)).size,
    records: rows.length,
  };
}

function filterRowsByAdminScope(rows, scope) {
  return rows.filter((row) => {
    const classMeta = getClassMetaById(row.classId);
    return classMeta ? hasScopeForClass(scope, classMeta) : false;
  });
}

function configuredSSOProviders() {
  return [
    { id: 'google', configured: !!process.env.GOOGLE_CLIENT_ID },
    { id: 'microsoft', configured: !!process.env.MICROSOFT_CLIENT_ID },
    { id: 'clever', configured: !!process.env.CLEVER_CLIENT_ID },
  ];
}

function readLTIPlatformsSafe() {
  try {
    const p = path.join(__dirname, 'data', 'lti-platforms.json');
    if (!fs.existsSync(p)) return [];
    const raw = JSON.parse(fs.readFileSync(p, 'utf-8'));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function hasScopeForDistrict(scope, district = {}) {
  const normalized = {
    superAdmin: scope?.superAdmin === true,
    districtIds: Array.isArray(scope?.districtIds) ? scope.districtIds.map(String) : [],
    subAccountIds: Array.isArray(scope?.subAccountIds) ? scope.subAccountIds.map(String) : [],
    schoolIds: Array.isArray(scope?.schoolIds) ? scope.schoolIds.map(String) : [],
  };
  if (normalized.superAdmin) return true;
  const hasDistrict = normalized.districtIds.length > 0;
  const hasSub = normalized.subAccountIds.length > 0;
  const hasSchool = normalized.schoolIds.length > 0;
  if (!hasDistrict && !hasSub && !hasSchool) return true; // back-compat

  if (district?.id && normalized.districtIds.includes(String(district.id))) return true;
  const subAccounts = Array.isArray(district?.subAccounts) ? district.subAccounts : [];
  const topSchools = Array.isArray(district?.schools) ? district.schools : [];
  for (const sa of subAccounts) {
    if (sa?.id && normalized.subAccountIds.includes(String(sa.id))) return true;
    const schools = Array.isArray(sa?.schools) ? sa.schools : [];
    for (const s of schools) {
      if (s?.id && normalized.schoolIds.includes(String(s.id))) return true;
    }
  }
  for (const s of topSchools) {
    if (s?.id && normalized.schoolIds.includes(String(s.id))) return true;
  }
  return false;
}

function isScopedAdmin(scope = {}) {
  if (scope?.superAdmin) return false;
  const hasDistrict = Array.isArray(scope?.districtIds) && scope.districtIds.length > 0;
  const hasSub = Array.isArray(scope?.subAccountIds) && scope.subAccountIds.length > 0;
  const hasSchool = Array.isArray(scope?.schoolIds) && scope.schoolIds.length > 0;
  return hasDistrict || hasSub || hasSchool;
}

function computeOnboardingReport({ districtId = '', owner = '', classId = '' } = {}, scope = {}) {
  const did = String(districtId || '').trim();
  const o = String(owner || '').trim();
  const cid = String(classId || '').trim();

  const hierarchy = getDistrictHierarchy('global');
  const districts = Array.isArray(hierarchy?.districts) ? hierarchy.districts : [];
  const district = districts.find((d) => String(d.id) === did) || null;

  const classMeta = cid ? getClassMetaById(cid) : null;
  const classInScope = classMeta ? hasScopeForClass(scope, classMeta) : false;
  const classStudentCount = cid
    ? getStudents().filter((s) => Array.isArray(s.classIds) && s.classIds.includes(cid)).length
    : 0;

  const standards = o ? getStandardsByOwner(o) : [];
  const mappingsRaw = o ? getStandardMappingsByOwner(o) : [];
  const mappings = filterRowsByAdminScope(mappingsRaw, scope).filter((m) => {
    if (!did) return true;
    const meta = getClassMetaById(m.classId);
    return meta && String(meta.districtId || '') === did;
  });

  const masteryRaw = o ? getMasteryDashboard(o, { level: 'class' }) : { rows: [] };
  const masteryRows = filterRowsByAdminScope(masteryRaw.rows || [], scope).filter((row) => {
    if (!did) return true;
    return String(row.districtId || '') === did;
  });

  const ssoProviders = configuredSSOProviders();
  const configuredSsoCount = ssoProviders.filter((p) => p.configured).length;
  const ltiPlatforms = readLTIPlatformsSafe();
  const activeLtiCount = ltiPlatforms.filter((p) => p?.active !== false).length;

  const checks = {
    districtSelected: !!district,
    classSelectedAndScoped: !!classMeta && classInScope,
    rosterHasStudents: classStudentCount > 0,
    standardsLoaded: standards.length > 0,
    mappingsLoaded: mappings.length > 0,
    masteryRowsPresent: masteryRows.length > 0,
    ssoConfigured: configuredSsoCount > 0,
    ltiConfigured: activeLtiCount > 0,
  };

  const checkEntries = Object.entries(checks).map(([id, ok]) => ({ id, ok: !!ok }));
  const passed = checkEntries.filter((c) => c.ok).length;
  const total = checkEntries.length;
  const scorePct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const failedChecks = checkEntries.filter((c) => !c.ok).map((c) => c.id);

  return {
    districtId: did,
    owner: o,
    classId: cid,
    checks,
    failedChecks,
    readyToMark: failedChecks.length === 0,
    scorePct,
    details: {
      districtName: district?.name || '',
      classStudentCount,
      standardsCount: standards.length,
      mappingsCount: mappings.length,
      masteryRowsCount: masteryRows.length,
      configuredSsoCount,
      activeLtiCount,
      ssoProviders,
    },
    generatedAt: new Date().toISOString(),
  };
}

function validateMappingsForOwner(owner, mappings, scope) {
  const errors = [];
  const list = Array.isArray(mappings) ? mappings : [];
  const dedupe = new Set();
  for (let i = 0; i < list.length; i += 1) {
    const m = list[i] || {};
    const classId = String(m.classId || '').trim();
    const assignmentId = String(m.assignmentId || '').trim();
    const questionId = m.questionId ? String(m.questionId).trim() : '';
    const standardCode = String(m.standardCode || '').trim();
    if (!classId || !assignmentId || !standardCode) {
      errors.push(`mappings[${i}] missing required fields (classId, assignmentId, standardCode).`);
      continue;
    }
    const dedupeKey = `${classId}|${assignmentId}|${questionId || ''}|${standardCode.toLowerCase()}`;
    if (dedupe.has(dedupeKey)) {
      errors.push(`mappings[${i}] duplicates an earlier mapping for the same class/assignment/question/standard.`);
      continue;
    }
    dedupe.add(dedupeKey);
    const classMeta = getClassMetaById(classId);
    if (!classMeta) {
      errors.push(`mappings[${i}] classId "${classId}" not found.`);
      continue;
    }
    if (!hasScopeForClass(scope, classMeta)) {
      errors.push(`mappings[${i}] classId "${classId}" outside admin scope.`);
      continue;
    }
    const assignment = getAssignmentById(assignmentId);
    if (!assignment) {
      errors.push(`mappings[${i}] assignmentId "${assignmentId}" not found.`);
      continue;
    }
    if (String(assignment.classId || '') !== classId) {
      errors.push(`mappings[${i}] assignmentId "${assignmentId}" does not belong to class "${classId}".`);
      continue;
    }
    if (questionId) {
      const questions = Array.isArray(assignment.questions) ? assignment.questions : [];
      const ids = new Set();
      questions.forEach((q, idx) => {
        if (q?.id) ids.add(String(q.id));
        ids.add(`q${idx + 1}`);
      });
      if (!ids.has(questionId)) {
        errors.push(`mappings[${i}] questionId "${questionId}" not found in assignment "${assignmentId}".`);
        continue;
      }
    }
    const classTeacher = String(classMeta.teacher || '');
    if (owner && classTeacher && classTeacher !== owner) {
      errors.push(`mappings[${i}] class "${classId}" is owned by "${classTeacher}", not "${owner}".`);
    }
  }
  return errors;
}

function requireAdminCapability(capability) {
  return (req, res, next) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin role required.' });
    }
    const scope = req.user?.scope || getAdminScope(req.user.username);
    if (scope.superAdmin) return next();
    if (capability && scope[capability] === false) {
      return res.status(403).json({ success: false, error: `Missing admin capability: ${capability}` });
    }
    return next();
  };
}

function requireAdminClassScope(classIdResolver = (req) => req.params.classId || req.body?.classId) {
  return (req, res, next) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ success: false, error: 'Admin role required.' });
    const classId = classIdResolver(req);
    if (!classId) return res.status(400).json({ success: false, error: 'classId is required.' });
    const classMeta = getClassMetaById(classId);
    if (!classMeta) return res.status(404).json({ success: false, error: 'Class not found.' });
    const scope = req.user?.scope || getAdminScope(req.user.username);
    if (!hasScopeForClass(scope, classMeta)) {
      return res.status(403).json({ success: false, error: 'Forbidden: outside district/sub-account/school scope.' });
    }
    req.classMeta = classMeta;
    req.adminScope = scope;
    return next();
  };
}

function notifyClassStudents(teacherUsername, classId, notifTemplate) {
  try {
    const students = getStudents();
    for (const stu of students) {
      if (stu.classIds && stu.classIds.includes(classId)) {
        addNotification({ ...notifTemplate, userId: stu.id, userRole: 'student' });
      }
    }
  } catch (err) { console.error('[notify] Error notifying class students:', err.message); }
}

const app = express();
const jobQueue = createJobQueue();
app.disable('etag');
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  if (req.path.startsWith('/api/')) {
    res.setHeader('X-API-Supported-Versions', 'v1');
  }
  // Baseline hardening headers.
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  if (!req.path.startsWith('/api/lti')) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  if (!req.path.startsWith('/api/')) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      "connect-src 'self' ws: wss: https://api.anthropic.com",
      "frame-src 'self' https://meet.jit.si",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);
  }
  next();
});
app.use(cors({ origin: true, credentials: false }));

async function upsertStripeSubscriptionRecord(evt) {
  const status = String(evt?.status || '');
  const metadata = evt?.metadata || {};

  const studentId = String(metadata.studentId || '').trim();
  if (studentId) {
    return upsertStudentStripeRecord(evt, studentId, status, metadata);
  }

  const username = String(metadata.username || '').trim().toLowerCase();
  if (!username) return { success: false, error: 'Missing metadata.username on Stripe object.' };
  const current = getSubscriptionData(username) || {};
  const plan = metadata.planId || current.plan || 'free';
  const paidUntil = evt?.current_period_end ? new Date(Number(evt.current_period_end) * 1000).toISOString() : current.paidUntil || null;
  const seats = Number(metadata.seats || current.seats || BILLING_PLANS[plan]?.seatsIncluded || 1);
  const subscription = {
    ...current,
    plan,
    seats,
    status,
    stripeCustomerId: evt?.customer || current.stripeCustomerId || null,
    stripeSubscriptionId: evt?.id || current.stripeSubscriptionId || null,
    billingCycle: BILLING_PLANS[plan]?.interval || current.billingCycle || null,
    paidUntil: status === 'active' || status === 'trialing' ? paidUntil : current.paidUntil,
    cancelAtPeriodEnd: !!evt?.cancel_at_period_end,
    updatedAt: new Date().toISOString(),
  };
  saveSubscriptionData(username, subscription);
  return { success: true, username, subscription };
}

function upsertStudentStripeRecord(evt, studentId, status, metadata) {
  const current = getStudentSubscription(studentId) || {};
  const plan = metadata.planId || current.plan || 'free';
  const examId = metadata.examId || '';
  const isOneTime = plan === 'student_exam_onetime';
  const existingExams = Array.isArray(current.examIds) ? current.examIds : [];
  const examIds = isOneTime && examId
    ? [...new Set([...existingExams, examId])]
    : existingExams;

  const paidUntil = isOneTime
    ? new Date(Date.now() + 100 * 365.25 * 24 * 3600 * 1000).toISOString()
    : evt?.current_period_end
      ? new Date(Number(evt.current_period_end) * 1000).toISOString()
      : current.paidUntil || null;

  const subscription = {
    ...current,
    plan,
    status,
    examIds,
    stripeCustomerId: evt?.customer || current.stripeCustomerId || null,
    stripeSubscriptionId: evt?.id || current.stripeSubscriptionId || null,
    billingCycle: STUDENT_BILLING_PLANS[plan]?.interval || current.billingCycle || null,
    paidUntil: status === 'active' || status === 'trialing' || isOneTime ? paidUntil : current.paidUntil,
    cancelAtPeriodEnd: !!evt?.cancel_at_period_end,
    updatedAt: new Date().toISOString(),
  };
  saveStudentSubscription(studentId, subscription);
  return { success: true, studentId, subscription };
}

app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  if (!stripe) return res.status(503).json({ success: false, error: 'Stripe is not configured.' });
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    if (STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(req.body.toString('utf8'));
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const subscriptionId = session.subscription;
    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      await upsertStripeSubscriptionRecord(sub);
    } else if (session.payment_status === 'paid' && session.metadata?.studentId) {
      upsertStudentStripeRecord(
        { status: 'active', customer: session.customer, metadata: session.metadata },
        session.metadata.studentId, 'active', session.metadata,
      );
    }
  }
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    await upsertStripeSubscriptionRecord(event.data.object);
  }
  if (event.type === 'customer.subscription.deleted') {
    const obj = event.data.object;
    const studentId = String(obj?.metadata?.studentId || '').trim();
    const username = String(obj?.metadata?.username || '').trim().toLowerCase();
    if (studentId) {
      const current = getStudentSubscription(studentId) || {};
      saveStudentSubscription(studentId, {
        ...current,
        status: 'canceled',
        cancelAtPeriodEnd: false,
        paidUntil: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else if (username) {
      const current = getSubscriptionData(username) || {};
      saveSubscriptionData(username, {
        ...current,
        status: 'canceled',
        cancelAtPeriodEnd: false,
        paidUntil: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
  res.json({ received: true });
}));

app.use(express.json());
app.use(express.text({ type: 'text/plain' }));
app.use((req, res, next) => {
  if (typeof req.body === 'string' && req.body.length > 0) {
    try { req.body = JSON.parse(req.body); } catch { /* leave as-is */ }
  }
  next();
});
app.use(createSREMetricsMiddleware());

const apiRateLimiter = createInMemoryRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: Number(process.env.API_RATE_LIMIT_PER_MIN || 180),
  keyPrefix: 'api',
});
const aiRateLimiter = createInMemoryRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: Number(process.env.AI_RATE_LIMIT_PER_MIN || 40),
  keyPrefix: 'ai',
});
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/ai', aiRateLimiter);
  app.use('/api', apiRateLimiter);
}
app.use(createAuditMiddleware({ decodeToken: verifyToken }));

// ── LTI 1.3 Integration ──
const ltiRouter = createLTIRouter(express, { requireAdminForPlatformWrites: requireAdmin });
app.use('/api/lti', ltiRouter);

// ── File Uploads ──
const uploadRouter = createUploadRouter(express, requireAuth);
app.use('/api/upload', uploadRouter);
app.use('/uploads', express.static(UPLOADS_PATH, { maxAge: '7d' }));

// ── SIS Integration ──
const sisRouter = createSISRouter(express, requireTeacher);
app.use('/api/sis', sisRouter);

// ── SSO / OAuth Integration ──
const ssoRouter = createSSORouter(express, signToken);
app.use('/api/sso', ssoRouter);

// ── SRE / SLO telemetry ──
const sreRouter = createSRERouter(express);
app.use('/api/sre', sreRouter);

// ── Run DB migrations ──
try { const mig = runMigrations(db); if (mig.applied > 0) console.log(`[migrations] Applied ${mig.applied} new migration(s).`); } catch (err) { console.error('[migrations] Error:', err.message); }

// ── Wiki Pages ──
const wikiRouter = createWikiRouter(express, db, requireAuth, requireTeacher);
app.use('/api/wiki', wikiRouter);

// ── Submission Annotations ──
const annotationsRouter = createAnnotationsRouter(express, db, requireAuth);
app.use('/api/annotations', annotationsRouter);

// ── SCORM / xAPI ──
const scormRouter = createSCORMRouter(express, db, requireAuth, requireTeacher);
app.use('/api/scorm', scormRouter);

// ── Moderated Grading ──
const moderatedGradingRouter = createModeratedGradingRouter(express, db, requireAuth, requireTeacher);
app.use('/api/moderated-grades', moderatedGradingRouter);

// ── Course Export / Import (IMS CC) ──
const courseExportRouter = createCourseExportRouter(express, db, requireTeacher);
app.use('/api/course', courseExportRouter);

// Allow iframe embedding when launched via LTI
app.use((req, res, next) => {
  if (req.query.lti === '1' || req.headers['sec-fetch-dest'] === 'iframe') {
    res.removeHeader('X-Frame-Options');
    res.setHeader('Content-Security-Policy', "frame-ancestors *;");
  }
  next();
});

function paginate(items, req) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const perPage = Math.min(200, Math.max(1, parseInt(req.query.per_page) || 50));
  const total = items.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const data = items.slice(start, start + perPage);
  return { data, pagination: { page, perPage, total, totalPages } };
}

const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
const hasValidKey = apiKey && apiKey !== 'your-actual-key-here';
if (!hasValidKey) {
  console.error('Missing ANTHROPIC_API_KEY in .env. Add your key and restart.');
}

let anthropic = null;
try {
  if (hasValidKey) {
    anthropic = new Anthropic({ apiKey });
  }
} catch (e) {
  console.error('Failed to create Anthropic client:', e.message);
}

// Helper: call Anthropic with retries and proper error handling
const MODEL = 'claude-sonnet-4-20250514';

async function callAnthropic(systemPrompt, userPrompt, maxTokens = 2048) {
  if (!anthropic) {
    throw new Error('Anthropic API key is not configured. Add ANTHROPIC_API_KEY to your .env file and restart the server.');
  }
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: userPrompt }],
  });
  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

// Global Express error handler for uncaught async errors
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error('Unhandled route error:', err);
      if (!res.headersSent) {
        const msg = extractErrorMessage(err);
        res.status(200).json({ success: false, error: msg });
      }
    });
  };
}

function extractErrorMessage(err) {
  let msg = err?.message || err?.error?.message || err?.body?.error?.message || 'An unexpected error occurred';
  if (err?.status === 401 || err?.statusCode === 401) msg = 'Invalid API key. Check your .env file.';
  if (err?.status === 429 || err?.statusCode === 429) msg = 'Rate limit exceeded or out of credits. Please try again later.';
  if (err?.status === 400 || err?.statusCode === 400) msg = 'Bad request: ' + (err?.body?.error?.message || err.message);
  if (err?.status === 404 || err?.statusCode === 404) msg = 'Model not found. The API model may have been updated.';
  if (err?.status === 529 || err?.statusCode === 529) msg = 'Anthropic API is overloaded. Please try again in a moment.';
  if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED')) msg = 'Cannot reach Anthropic API. Check your internet connection.';
  return String(msg);
}

function isStripeAuthError(err) {
  const status = err?.statusCode || err?.status;
  const type = String(err?.type || err?.rawType || '').toLowerCase();
  const msg = String(err?.message || '').toLowerCase();
  return status === 401
    || type.includes('authentication')
    || msg.includes('invalid api key');
}

function stripeAuthErrorMessage() {
  return 'Stripe authentication failed. Set STRIPE_SECRET_KEY on the server to a valid Stripe secret key (sk_live_... in production), then redeploy.';
}

function getOpenAPISpec() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Allen Ace LMS API',
      version: '1.0.0',
      description: 'Versioned API contract for Allen Ace LMS (`/api/v1/*`).',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Local server' },
    ],
    tags: [
      { name: 'Health', description: 'Health and operational status endpoints' },
      { name: 'SRE', description: 'SLO and telemetry endpoints' },
      { name: 'Admin', description: 'Admin-only operations' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Forbidden' },
          },
        },
      },
    },
    paths: {
      '/api/v1/health': {
        get: {
          tags: ['Health'],
          summary: 'Get service health summary',
          responses: {
            200: {
              description: 'Health payload',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      version: { type: 'string', example: 'v1' },
                      ok: { type: 'boolean' },
                      hasKey: { type: 'boolean' },
                      hasStripe: { type: 'boolean' },
                      hasAnthropic: { type: 'boolean' },
                      uptimeSeconds: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/status': {
        get: {
          tags: ['Health'],
          summary: 'Get customer-facing platform status',
          responses: {
            200: {
              description: 'Status payload',
            },
          },
        },
      },
      '/api/v1/sre/metrics': {
        get: {
          tags: ['SRE'],
          summary: 'Get SRE telemetry metrics',
          parameters: [
            {
              name: 'windowHours',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 720, default: 24 },
              description: 'Metrics window size in hours',
            },
          ],
          responses: {
            200: {
              description: 'Telemetry summary',
            },
          },
        },
      },
      '/api/sre/slos': {
        get: {
          tags: ['SRE'],
          summary: 'Get SLO target definitions',
          responses: {
            200: { description: 'SLO targets' },
          },
        },
      },
      '/api/sre/burn-rate': {
        get: {
          tags: ['SRE'],
          summary: 'Get SLO burn-rate signals',
          responses: {
            200: { description: 'Burn rate report' },
          },
        },
      },
      '/api/sre/snapshots': {
        get: {
          tags: ['SRE'],
          summary: 'Get persisted SRE metric snapshots',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 10, maximum: 2000, default: 200 },
              description: 'Max snapshots to return',
            },
          ],
          responses: {
            200: { description: 'Snapshots payload' },
          },
        },
      },
      '/api/sre/alerts/check': {
        post: {
          tags: ['Admin', 'SRE'],
          summary: 'Trigger SLO alert evaluation (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    windowHours: { type: 'integer', minimum: 1, maximum: 720, example: 24 },
                    cooldownMinutes: { type: 'integer', minimum: 1, maximum: 1440, example: 15 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Alert check result' },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/admin/audit-logs': {
        get: {
          tags: ['Admin'],
          summary: 'Get admin audit logs',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 10, maximum: 1000, default: 200 },
            },
          ],
          responses: {
            200: { description: 'Audit logs payload' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
          },
        },
      },
    },
  };
}

// ── Auth & User Persistence API ──

app.post('/api/auth/signup', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ success: false, error: 'Username and password required.' });
  if (password.length < 6) return res.json({ success: false, error: 'Password must be at least 6 characters.' });
  const result = await addTeacher(username, password);
  if (!result.success) return res.json(result);

  const TRIAL_DAYS = 7;
  const now = new Date();
  const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const subscription = { plan: 'trial', trialStart: now.toISOString(), trialEnd: trialEnd.toISOString(), paidUntil: null, stripeCustomerId: null };
  saveSubscriptionData(username, subscription);

  const token = signToken({ username, role: 'teacher' });
  res.json({ success: true, username, token, role: 'teacher', subscription });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ success: false, error: 'Username and password required.' });
  const result = await verifyTeacher(username, password);
  if (!result.success) return res.json(result);

  const data = (result.role === 'ta') ? getAllTeacherDataForTA(username) : getAllTeacherData(username);
  const role = result.role || 'teacher';
  const scope = role === 'admin' ? getAdminScope(username) : undefined;
  const token = signToken({ username, role, ...(scope ? { scope } : {}) });
  res.json({
    success: true, username, token, role, ...(scope ? { scope } : {}),
    profile: data.profile,
    subscription: data.subscription,
    classes: data.classes || [],
    assignments: data.assignments || [],
    gameResults: data.gameResults || [],
    grades: data.grades || [],
    modules: data.modules || [],
    announcements: data.announcements || [],
    discussions: data.discussions || [],
    chatMessages: data.chatMessages || [],
    assessments: data.assessments || [],
    submissions: data.submissions || [],
  });
}));

// Verify a JWT and return user info (used by frontend to check session validity)
app.post('/api/auth/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.json({ success: false, error: 'No token.' });
    const decoded = verifyToken(authHeader.slice(7));
    res.json({ success: true, user: { username: decoded.username, role: decoded.role, scope: decoded.scope || null } });
  } catch {
    res.json({ success: false, error: 'Invalid or expired token.' });
  }
});

// ── Student Auth ──

app.post('/api/auth/student/signup', asyncHandler(async (req, res) => {
  const { username, password, displayName, classCode } = req.body;
  if (!username || !password) return res.json({ success: false, error: 'Username and password required.' });
  if (password.length < 4) return res.json({ success: false, error: 'Password must be at least 4 characters.' });
  const result = await addStudent({ username, password, displayName, classCode });
  if (!result.success) return res.json(result);

  const token = signToken({ username: result.student.username, studentId: result.student.id, role: 'student', displayName: result.student.displayName });
  res.json({ success: true, token, role: 'student', student: result.student });
}));

app.post('/api/auth/student/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ success: false, error: 'Username and password required.' });
  const result = await verifyStudent(username, password);
  if (!result.success) return res.json(result);

  const token = signToken({ username: result.student.username, studentId: result.student.id, role: 'student', displayName: result.student.displayName });
  res.json({ success: true, token, role: 'student', student: result.student });
}));

app.post('/api/auth/student/join-class', requireStudent, (req, res) => {
  try {
    const { classCode } = req.body;
    if (!classCode) return res.json({ success: false, error: 'Class code required.' });
    const result = joinClass(req.user.studentId, classCode);
    res.json(result);
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/api/auth/student/grades', requireStudent, (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId) return res.json({ success: false, error: 'Student ID required.' });
    const data = getGradesForStudent(studentId);
    res.json({ success: true, grades: data.grades, assignments: data.assignments, classes: data.classes });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/api/auth/student/progress', requireStudent, (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId) return res.json({ success: false, error: 'Student ID required.' });
    const progress = getStudentProgress(studentId);
    res.json({ success: true, progress });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/auth/student/progress', requireStudent, (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId) return res.json({ success: false, error: 'Student ID required.' });
    const { key, data } = req.body;
    if (!key || typeof key !== 'string') return res.json({ success: false, error: 'key is required.' });
    if (key.length > 256) return res.json({ success: false, error: 'key too long.' });
    const payload = typeof data === 'object' && data !== null ? data : {};
    const result = saveStudentProgress(studentId, key, payload);
    res.json(result);
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ── Teacher List (protected) ──

app.get('/api/auth/teachers', requireTeacherOrAdmin, (req, res) => {
  try {
    const teachers = getTeachers();
    const list = teachers.map((t) => ({
      username: t.username,
      profile: getProfile(t.username),
    }));
    res.json({ success: true, teachers: list });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/auth/reset-password', asyncHandler(async (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) return res.json({ success: false, error: 'Username and new password required.' });
  if (newPassword.length < 6) return res.json({ success: false, error: 'Password must be at least 6 characters.' });
  const result = await resetPassword(username, newPassword);
  res.json(result);
}));

app.post('/api/auth/forgot-lookup', (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.json({ success: false, error: 'Username required.' });
    const teacher = findTeacher(username.trim());
    if (!teacher) return res.json({ success: false, error: 'No account found with that username.' });
    res.json({ success: true, username: teacher.username });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/auth/profile', requireTeacher, (req, res) => {
  try {
    const username = req.user.username;
    const { profile } = req.body;
    saveProfile(username, profile);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/api/auth/profile/:username', requireAuth, requireSelfOrAdmin('username'), (req, res) => {
  try {
    const profile = getProfile(req.params.username);
    res.json({ success: true, profile });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/auth/subscription', requireTeacher, (req, res) => {
  try {
    const username = req.user.username;
    const { subscription } = req.body;
    saveSubscriptionData(username, subscription);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/api/auth/subscription/:username', requireAuth, requireSelfOrAdmin('username'), (req, res) => {
  try {
    const sub = getSubscriptionData(req.params.username);
    res.json({ success: true, subscription: sub });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/api/billing/plans', (req, res) => {
  const plans = Object.values(BILLING_PLANS).map((p) => ({
    id: p.id,
    name: p.name,
    interval: p.interval,
    amount: p.amount,
    currency: p.currency,
    seatsIncluded: p.seatsIncluded,
    features: p.features,
    configured: !!p.priceId,
  }));
  res.json({ success: true, plans });
});

app.get('/api/billing/subscription/me', requireTeacher, (req, res) => {
  const username = req.user.username;
  const subscription = getSubscriptionData(username) || null;
  const entitlements = computeEntitlements(subscription || {});
  res.json({ success: true, username, subscription, entitlements });
});

app.get('/api/billing/entitlements/me', requireTeacher, (req, res) => {
  const username = req.user.username;
  const subscription = getSubscriptionData(username) || {};
  const entitlements = computeEntitlements(subscription);
  res.json({ success: true, username, entitlements });
});

app.get('/api/billing/feature/:feature/access', requireTeacher, (req, res) => {
  const username = req.user.username;
  const subscription = getSubscriptionData(username) || {};
  const entitlements = computeEntitlements(subscription);
  const feature = String(req.params.feature || '');
  res.json({
    success: true,
    feature,
    allowed: !!(entitlements.active && entitlements.has(feature)),
    plan: entitlements.plan,
    seats: entitlements.seats,
  });
});

app.get('/api/billing/pro/check', requireTeacher, requireEntitlement('ai-copilot'), (req, res) => {
  res.json({ success: true, active: true, plan: req.entitlements.plan, features: req.entitlements.features });
});

app.post('/api/billing/create-checkout-session', requireTeacher, asyncHandler(async (req, res) => {
  const username = req.user.username;
  const planId = String(req.body?.planId || '');
  const plan = BILLING_PLANS[planId];
  if (!plan) return res.status(400).json({ success: false, error: 'Invalid plan.' });
  const seats = Math.max(1, Math.min(10000, Number(req.body?.seats || plan.seatsIncluded || 1)));
  const existing = getSubscriptionData(username) || {};
  const origin = req.body?.origin || `${req.protocol}://${req.get('host')}`;
  const successUrl = `${origin}/checkout?success=1&plan=${encodeURIComponent(planId)}`;
  const cancelUrl = `${origin}/checkout?cancelled=1&plan=${encodeURIComponent(planId)}`;

  if (!stripe || !plan.priceId) {
    const now = new Date();
    const periodDays = planId.includes('yearly') ? 365 : 30;
    const paidUntil = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);
    const subscription = {
      ...existing,
      plan: planId,
      seats,
      status: 'active',
      paidUntil: paidUntil.toISOString(),
      billingCycle: plan.interval,
      stripeCustomerId: existing.stripeCustomerId || null,
      stripeSubscriptionId: existing.stripeSubscriptionId || null,
      updatedAt: now.toISOString(),
    };
    saveSubscriptionData(username, subscription);
    return res.json({ success: true, demo: true, url: successUrl });
  }

  let customerId = existing.stripeCustomerId || '';
  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        metadata: { username },
        name: username,
      });
      customerId = customer.id;
      saveSubscriptionData(username, { ...existing, stripeCustomerId: customerId });
    } catch (err) {
      console.error('[billing] teacher customer create failed:', err?.message || err);
      const hint = isStripeAuthError(err)
        ? stripeAuthErrorMessage()
        : (err?.message || 'Stripe customer creation failed.');
      return res.status(502).json({ success: false, error: hint });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [{ price: plan.priceId, quantity: seats }],
    allow_promotion_codes: true,
    metadata: {
      username,
      planId,
      seats: String(seats),
    },
    subscription_data: {
      metadata: {
        username,
        planId,
        seats: String(seats),
      },
    },
  });

  res.json({ success: true, url: session.url, sessionId: session.id });
}));

app.post('/api/billing/create-portal-session', requireTeacher, asyncHandler(async (req, res) => {
  const username = req.user.username;
  const sub = getSubscriptionData(username) || {};
  const origin = req.body?.origin || `${req.protocol}://${req.get('host')}`;

  if (!stripe || !sub.stripeCustomerId) {
    return res.json({ success: true, demo: true, url: `${origin}/pricing?user=${encodeURIComponent(username)}` });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${origin}/pricing`,
  });
  res.json({ success: true, url: portal.url });
}));

// ── Student Billing Endpoints ──

app.get('/api/billing/student/plans', (req, res) => {
  const plans = Object.values(STUDENT_BILLING_PLANS).map((p) => ({
    id: p.id, name: p.name, interval: p.interval,
    amount: p.amount, currency: p.currency, features: p.features,
    configured: !!p.priceId,
  }));
  res.json({ success: true, plans });
});

/**
 * Billing health probe (safe for production):
 * - Does NOT expose key values.
 * - Helps quickly diagnose Stripe/env configuration issues.
 */
app.get('/api/billing/health', (_req, res) => {
  const stripeMode = STRIPE_SECRET_KEY.startsWith('sk_live_')
    ? 'live'
    : STRIPE_SECRET_KEY.startsWith('sk_test_')
      ? 'test'
      : 'unknown';
  const studentPlans = Object.values(STUDENT_BILLING_PLANS).map((p) => ({
    id: p.id,
    configured: !!p.priceId,
  }));
  const teacherPlans = Object.values(BILLING_PLANS).map((p) => ({
    id: p.id,
    configured: !!p.priceId,
  }));
  res.json({
    success: true,
    stripeConfigured: !!stripe,
    stripeMode,
    webhookConfigured: !!STRIPE_WEBHOOK_SECRET,
    studentPlans,
    teacherPlans,
  });
});

function studentIdFromReq(req) {
  const rawStudentId = String(req.user?.studentId || req.user?.id || req.user?.sub || '').trim();
  const username = String(req.user?.username || '').trim();
  if (!rawStudentId && !username) return null;

  const students = getStudents();
  if (rawStudentId) {
    const byId = students.find((s) => s.id === rawStudentId);
    if (byId) return byId.id;
  }
  if (username) {
    const byUsername = students.find((s) => s.username === username);
    if (byUsername) return byUsername.id;
  }
  return null;
}

app.get('/api/billing/student/subscription/me', requireStudent, (req, res) => {
  const studentId = studentIdFromReq(req);
  if (!studentId) return res.status(401).json({ success: false, error: 'Invalid student session.' });
  const subscription = getStudentSubscription(studentId) || null;
  const entitlements = computeEntitlements(subscription || {});
  res.json({ success: true, studentId, subscription, entitlements });
});

/** Rebuild /practice-loop query after Stripe so comp/std/grade/phase match the session (avoids reset to tile 1). */
function sanitizeStudentCheckoutReturnSearch(raw, examIdFallback) {
  const allowed = new Set(['examId', 'exam', 'grade', 'comp', 'currentStd', 'std', 'label', 'teks', 'subject', 'phase', 'sid', 'cid']);
  const phaseOk = (v) => /^[a-z][a-z0-9-]{0,63}$/.test(String(v || ''));
  const p = new URLSearchParams();
  try {
    const q = new URLSearchParams(String(raw || '').replace(/^\?/, ''));
    for (const [k, v] of q.entries()) {
      if (!allowed.has(k) || String(v).length > 512) continue;
      if (k === 'paid' || k === 'session_id' || k === 'cancelled') continue;
      if (k === 'phase' && !phaseOk(v)) continue;
      p.set(k, v);
    }
  } catch (_) { /* ignore */ }
  const ex = String(examIdFallback || '').trim();
  if (ex && !p.get('examId')) {
    p.set('examId', ex);
    p.set('exam', ex);
  }
  return p.toString();
}

function studentCheckoutReturnUrls(origin, examId, returnSearchRaw) {
  const tail = sanitizeStudentCheckoutReturnSearch(returnSearchRaw, examId);
  const mid = tail ? `&${tail}` : '';
  return {
    successDemo: `${origin}/practice-loop?paid=1${mid}`,
    successStripe: `${origin}/practice-loop?paid=1${mid}&session_id={CHECKOUT_SESSION_ID}`,
    cancel: `${origin}/practice-loop?cancelled=1${mid}`,
  };
}

/** Ensures one-time exam purchase always records an exam id (fixes paid-but-still-locked if client omitted examId). */
function resolveStudentCheckoutExamId(body, planId) {
  let examId = String(body?.examId ?? '').trim();
  if (examId) return examId;
  const raw = String(body?.returnSearch ?? '').trim();
  try {
    const q = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);
    examId = String(q.get('examId') || q.get('exam') || '').trim();
  } catch (_) { /* ignore */ }
  if (examId) return examId;
  if (planId === 'student_exam_onetime') return 'math712';
  return '';
}

app.post('/api/billing/student/create-checkout-session', requireStudent, asyncHandler(async (req, res) => {
  const studentId = studentIdFromReq(req);
  if (!studentId) return res.status(401).json({ success: false, error: 'Invalid student session.' });
  const planId = String(req.body?.planId || '');
  const plan = STUDENT_BILLING_PLANS[planId];
  if (!plan) return res.status(400).json({ success: false, error: 'Invalid plan.' });

  if (!stripe) {
    console.warn('[billing] Stripe not configured (STRIPE_SECRET_KEY missing) — cannot process payment.');
    return res.status(503).json({ success: false, error: 'Payment processing is not available. Please contact support.' });
  }

  if (!plan.priceId) {
    const envKey = planId === 'student_exam_onetime'
      ? 'STRIPE_PRICE_STUDENT_EXAM_ONETIME'
      : 'STRIPE_PRICE_STUDENT_MONTHLY';
    console.error(`[billing] ${envKey} env var not set — cannot create Stripe checkout for plan "${planId}".`);
    return res.status(503).json({
      success: false,
      error: 'This plan is not yet configured for payment. Please contact support or check server environment variables.',
    });
  }

  const examId = resolveStudentCheckoutExamId(req.body, planId);

  const existing = getStudentSubscription(studentId) || {};
  const origin = req.body?.origin || `${req.protocol}://${req.get('host')}`;
  const returnSearch = req.body?.returnSearch;
  const { successStripe: successUrlStripe, cancel: cancelUrl } = studentCheckoutReturnUrls(origin, examId, returnSearch);

  let customerId = existing.stripeCustomerId || '';
  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        metadata: { studentId },
        email: req.user.username || undefined,
      });
      customerId = customer.id;
      saveStudentSubscription(studentId, { ...existing, stripeCustomerId: customerId });
    } catch (err) {
      console.error('[billing] student customer create failed:', err?.message || err);
      const hint = isStripeAuthError(err)
        ? stripeAuthErrorMessage()
        : (err?.message || 'Stripe customer creation failed.');
      return res.status(502).json({ success: false, error: hint });
    }
  }

  const isOneTime = planId === 'student_exam_onetime';
  const examMeta = isOneTime ? (examId || 'math712') : examId;
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: isOneTime ? 'payment' : 'subscription',
      customer: customerId,
      success_url: successUrlStripe,
      cancel_url: cancelUrl,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { studentId, planId, examId: examMeta },
      ...(isOneTime ? {} : {
        subscription_data: { metadata: { studentId, planId, examId: examMeta } },
      }),
    });
  } catch (err) {
    console.error('[billing] student checkout session create failed:', err?.message || err);
    const hint = isStripeAuthError(err)
      ? stripeAuthErrorMessage()
      : (err?.message || 'Stripe checkout could not be created. Check STRIPE_PRICE_STUDENT_EXAM_ONETIME / STRIPE_PRICE_STUDENT_MONTHLY in server env.');
    return res.status(502).json({ success: false, error: hint });
  }

  if (!session?.url) {
    return res.status(502).json({ success: false, error: 'Checkout session created but Stripe returned no redirect URL.' });
  }

  res.json({ success: true, url: session.url, sessionId: session.id });
}));

/**
 * Client calls this after Stripe redirect when webhooks are delayed or misconfigured.
 * Verifies the Checkout session belongs to this student and applies entitlements.
 */
app.post('/api/billing/student/confirm-checkout', requireStudent, asyncHandler(async (req, res) => {
  const studentId = studentIdFromReq(req);
  if (!studentId) return res.status(401).json({ success: false, error: 'Invalid student session.' });
  const sessionId = String(req.body?.sessionId || '').trim();
  if (!sessionId) return res.status(400).json({ success: false, error: 'Missing sessionId.' });
  if (!stripe) {
    return res.status(503).json({ success: false, error: 'Stripe is not configured on this server.' });
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  });
  const metaStudent = String(session.metadata?.studentId || '').trim();
  if (!metaStudent || metaStudent !== studentId) {
    return res.status(403).json({ success: false, error: 'This purchase does not match your account.' });
  }
  const complete = session.status === 'complete';
  const paid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
  if (!complete || !paid) {
    return res.json({
      success: false,
      error: 'Payment is not complete yet.',
      payment_status: session.payment_status,
      status: session.status,
    });
  }
  if (session.subscription) {
    const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
    const sub = await stripe.subscriptions.retrieve(subId);
    await upsertStripeSubscriptionRecord(sub);
  } else {
    upsertStudentStripeRecord(
      { status: 'active', customer: session.customer, metadata: session.metadata },
      studentId,
      'active',
      session.metadata || {},
    );
  }
  const subscription = getStudentSubscription(studentId) || null;
  const entitlements = computeEntitlements(subscription || {});
  res.json({ success: true, studentId, subscription, entitlements });
}));

// ── Classes & Assignments sync (protected) ──

app.post('/api/auth/classes', requireTeacher, (req, res) => {
  try {
    const username = req.user.username;
    const { classes } = req.body;
    saveClassesForTeacher(username, classes || []);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/api/auth/classes/:username', requireAuth, requireSelfOrAdmin('username'), (req, res) => {
  try {
    const classes = getClassesByTeacher(req.params.username);
    const { data, pagination } = paginate(classes, req);
    res.json({ success: true, classes: data, pagination });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/auth/assignments', requireTeacher, (req, res) => {
  try {
    const username = req.user.username;
    const { assignments, _newAssignment } = req.body;
    saveAssignmentsForTeacher(username, assignments || []);
    if (_newAssignment) {
      notifyClassStudents(username, _newAssignment.classId, {
        type: 'assignment_new',
        title: 'New Assignment',
        message: `${username} posted: ${_newAssignment.title || 'New assignment'}`,
        data: { assignmentId: _newAssignment.id, classId: _newAssignment.classId },
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/api/auth/assignments/:username', requireAuth, requireSelfOrAdmin('username'), (req, res) => {
  try {
    const assignments = getAssignmentsByTeacher(req.params.username);
    const { data, pagination } = paginate(assignments, req);
    res.json({ success: true, assignments: data, pagination });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/auth/game-results', requireAuth, (req, res) => {
  try {
    const username = req.user.username;
    const { gameResults } = req.body;
    saveGameResultsForTeacher(username, gameResults || []);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/api/auth/game-results/:username', requireAuth, requireSelfOrAdmin('username'), (req, res) => {
  try {
    const gameResults = getGameResultsByTeacher(req.params.username);
    const { data, pagination } = paginate(gameResults, req);
    res.json({ success: true, gameResults: data, pagination });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/auth/grades', requireTeacherOrTA, (req, res) => {
  try {
    const username = req.user.username;
    const { grades, _newGrade } = req.body;
    saveGradesForTeacher(username, grades || []);
    if (_newGrade && _newGrade.studentId) {
      addNotification({
        userId: _newGrade.studentId,
        userRole: 'student',
        type: 'grade_posted',
        title: 'Grade Posted',
        message: `Your grade for "${_newGrade.assignmentTitle || 'an assignment'}" has been posted.`,
        data: { grade: _newGrade.grade, classId: _newGrade.classId },
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ── Modules sync ──

app.post('/api/auth/modules', requireTeacher, (req, res) => {
  try {
    const username = req.user.username;
    const { modules } = req.body;
    saveModulesForTeacher(username, modules || []);
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/auth/modules/:username', requireAuth, requireSelfOrAdmin('username'), (req, res) => {
  try {
    const modules = getModulesByTeacher(req.params.username);
    const { data, pagination } = paginate(modules, req);
    res.json({ success: true, modules: data, pagination });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ── Announcements sync ──

app.post('/api/auth/announcements', requireTeacher, (req, res) => {
  try {
    const username = req.user.username;
    const { announcements, _newAnnouncement } = req.body;
    saveAnnouncementsForTeacher(username, announcements || []);
    if (_newAnnouncement) {
      notifyClassStudents(username, _newAnnouncement.classId, {
        type: 'announcement',
        title: 'New Announcement',
        message: _newAnnouncement.title || 'A new announcement was posted.',
        data: { classId: _newAnnouncement.classId },
      });
    }
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/auth/announcements/:username', requireAuth, requireSelfOrAdmin('username'), (req, res) => {
  try {
    const announcements = getAnnouncementsByTeacher(req.params.username);
    const { data, pagination } = paginate(announcements, req);
    res.json({ success: true, announcements: data, pagination });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ── Discussions sync ──

app.post('/api/auth/discussions', requireTeacher, (req, res) => {
  try {
    const username = req.user.username;
    const { discussions } = req.body;
    saveDiscussionsForTeacher(username, discussions || []);
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/auth/discussions/:username', requireAuth, requireSelfOrAdmin('username'), (req, res) => {
  try {
    const discussions = getDiscussionsByTeacher(req.params.username);
    const { data, pagination } = paginate(discussions, req);
    res.json({ success: true, discussions: data, pagination });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ── Chat Messages ──

app.post('/api/auth/chat', requireAuth, requireClassMembership(), (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ success: false, error: 'Message required.' });
    addChatMessage({ ...message, sender: req.user.username });
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.post('/api/auth/chat/sync', requireTeacher, (req, res) => {
  try {
    const username = req.user.username;
    const { chatMessages } = req.body;
    saveChatForTeacher(username, chatMessages || []);
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/auth/chat/:classId', requireAuth, requireClassMembership(), (req, res) => {
  try {
    res.json({ success: true, messages: getChatByClass(req.params.classId) });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ── Assessments ──

app.post('/api/auth/assessments', requireTeacher, (req, res) => {
  try {
    const username = req.user.username;
    const { assessments } = req.body;
    saveAssessmentsForTeacher(username, assessments || []);
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/auth/assessments/:username', requireAuth, requireSelfOrAdmin('username'), (req, res) => {
  try {
    const assessments = getAssessmentsByTeacher(req.params.username);
    const { data, pagination } = paginate(assessments, req);
    res.json({ success: true, assessments: data, pagination });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.post('/api/auth/assessment', requireTeacher, (req, res) => {
  try {
    const { assessment } = req.body;
    if (!assessment) return res.json({ success: false, error: 'Assessment data required.' });
    const result = addAssessment({ ...assessment, _teacher: req.user.username });
    res.json(result);
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/auth/assessment/:id', requireAuth, (req, res) => {
  try {
    const assessment = getAssessmentById(req.params.id);
    if (!assessment) return res.json({ success: false, error: 'Assessment not found.' });
    res.json({ success: true, assessment });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ── Submissions ──

app.post('/api/auth/submissions/sync', requireTeacher, (req, res) => {
  try {
    const username = req.user.username;
    const { submissions } = req.body;
    saveSubmissionsForTeacher(username, submissions || []);
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.post('/api/auth/submission', requireAuth, (req, res) => {
  try {
    const { submission } = req.body;
    if (!submission) return res.json({ success: false, error: 'Submission data required.' });
    const enriched = { ...submission, studentUsername: req.user.username };
    const result = addSubmission(enriched);
    res.json(result);
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/auth/submissions/assessment/:assessmentId', requireAuth, (req, res) => {
  try {
    res.json({ success: true, submissions: getSubmissionsForAssessment(req.params.assessmentId) });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/auth/submissions/student/:studentId', requireAuth, (req, res) => {
  try {
    res.json({ success: true, submissions: getSubmissionsByStudent(req.params.studentId) });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ── Bulk Content Sync (all localStorage data types at once) ──

app.post('/api/auth/sync-all', requireTeacher, (req, res) => {
  try {
    const username = req.user.username;
    const { classes, assignments, gameResults, grades, modules, announcements, discussions, chatMessages, assessments, submissions } = req.body;

    if (classes) saveClassesForTeacher(username, classes);
    if (assignments) saveAssignmentsForTeacher(username, assignments);
    if (gameResults) saveGameResultsForTeacher(username, gameResults);
    if (grades) saveGradesForTeacher(username, grades);

    bulkSaveTeacherContent(username, {
      modules, announcements, discussions, chatMessages, assessments, submissions,
    });

    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ── Load all teacher data (extended) ──

app.get('/api/auth/data/:username', requireAuth, requireSelfOrAdmin('username'), (req, res) => {
  try {
    const data = getAllTeacherData(req.params.username);
    res.json({ success: true, ...data });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  NOTIFICATIONS API
// ════════════════════════════════════════════════════════════════

function getNotificationUserId(req) {
  return req.user.role === 'student' ? (req.user.studentId || req.user.username) : req.user.username;
}

app.get('/api/notifications', requireAuth, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const userId = getNotificationUserId(req);
    const notifications = getNotifications(userId, limit);
    const unread = getUnreadNotificationCount(userId);
    res.json({ success: true, notifications, unread });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/notifications/unread-count', requireAuth, (req, res) => {
  try {
    const userId = getNotificationUserId(req);
    const count = getUnreadNotificationCount(userId);
    res.json({ success: true, count });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.post('/api/notifications/:id/read', requireAuth, (req, res) => {
  try {
    const userId = getNotificationUserId(req);
    markNotificationRead(req.params.id, userId);
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.post('/api/notifications/read-all', requireAuth, (req, res) => {
  try {
    const userId = getNotificationUserId(req);
    markAllNotificationsRead(userId);
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/notifications/prefs', requireAuth, (req, res) => {
  try {
    const userId = getNotificationUserId(req);
    const prefs = getNotificationPrefs(userId);
    res.json({ success: true, prefs });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.put('/api/notifications/prefs', requireAuth, (req, res) => {
  try {
    const userId = getNotificationUserId(req);
    saveNotificationPrefs(userId, req.body);
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.post('/api/generate-lesson-plan', asyncHandler(async (req, res) => {
  const { gradeLevel, teksStandard, prompt } = req.body;

  const gradeLabel = gradeLevel === 'algebra' ? 'Algebra I' : 'Grade 3';
  const teksPart = teksStandard
    ? `Focus on TEKS standard ${teksStandard}. `
    : '';

  const userPrompt = `You are a Texas teacher creating a lesson plan aligned to Texas TEKS standards.
Grade level: ${gradeLabel}
${teksPart}
Teacher request: ${prompt || 'Generate a comprehensive lesson plan.'}

Create a detailed lesson plan that includes:
1. Learning objectives (aligned to TEKS)
2. Materials needed
3. Warm-up / engagement activity
4. Main lesson steps (with time estimates)
5. Formative check / exit ticket
6. Differentiation ideas
7. Suggested math game or practice activity

Format the response in clear sections. Be practical and classroom-ready.`;

  const text = await callAnthropic(null, userPrompt);
  res.json({ success: true, content: text });
}));

// Question Generator – returns structured JSON for LMS features
app.post('/api/generate-questions', asyncHandler(async (req, res) => {
  const { gradeLevel, teksStandard, difficulty, representation, questionFormat, numQuestions } = req.body;
  const gradeLabel = gradeLevel === 'algebra' ? 'Algebra I' : 'Grade 3';
  const teksPart = teksStandard ? `Aligned to TEKS standard ${teksStandard}. ` : '';
  const count = Math.min(Math.max(parseInt(numQuestions) || 5, 1), 20);

  const formatInstructions = {
    'multiple-choice': `Each question MUST be multiple-choice with exactly 4 options (A, B, C, D). One option is the correct answer. The other 3 are plausible distractors based on common misconceptions.`,
    'true-false': `Each question MUST be a True/False statement. Provide the statement, whether it is True or False, and a brief explanation of why.`,
    'open-ended': `Each question MUST be an open-ended problem requiring a written answer. Provide the question, the correct answer, and a common misconception to watch for.`,
  };

  const fmt = questionFormat || 'multiple-choice';
  const fmtInstruction = formatInstructions[fmt] || formatInstructions['multiple-choice'];

  let jsonSchema;
  if (fmt === 'multiple-choice') {
    jsonSchema = `[{"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","misconception":"..."}]`;
  } else if (fmt === 'true-false') {
    jsonSchema = `[{"id":1,"statement":"...","correct":true,"explanation":"..."}]`;
  } else {
    jsonSchema = `[{"id":1,"question":"...","answer":"...","misconception":"..."}]`;
  }

  const userPrompt = `You are a Texas math teacher creating practice problems aligned to Texas TEKS standards.
Grade level: ${gradeLabel}
${teksPart}
Difficulty level: ${difficulty || 'Developing'}
Representation type: ${representation || 'Mixed'}
Question format: ${fmt}

${fmtInstruction}

Generate exactly ${count} problems that:
1. Are aligned to the specified TEKS standard
2. Match the difficulty level (Emerging = basic recall, Developing = apply concepts, Proficient = multi-step reasoning, Mastered = transfer to novel contexts)
3. Use the specified representation type
4. Are classroom-ready and grade-appropriate

CRITICAL: Return ONLY a valid JSON array, no markdown, no explanation, no code fences. The JSON must match this schema:
${jsonSchema}`;

  const rawText = await callAnthropic(null, userPrompt, 4096);

  // Try to parse as structured JSON, fall back to raw text
  let questions = null;
  try {
    const cleaned = rawText.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim();
    questions = JSON.parse(cleaned);
  } catch {
    // AI didn't return valid JSON – return raw text as fallback
  }

  res.json({ success: true, content: rawText, questions, format: fmt });
}));

// Feedback Engine
app.post('/api/generate-feedback', asyncHandler(async (req, res) => {
  const { gradeLevel, teksStandard, feedbackType, studentName } = req.body;
  const gradeLabel = gradeLevel === 'algebra' ? 'Algebra I' : 'Grade 3';
  const teksPart = teksStandard ? `Related to TEKS standard ${teksStandard}. ` : '';

  const typeInstructions = {
    'Progress summary': 'Write a progress summary for this student covering strengths, areas for growth, and next steps.',
    'Misconception breakdown': 'Identify likely misconceptions this student may have based on common patterns at this grade level. Explain each misconception and how to address it.',
    'Intervention suggestions': 'Suggest specific intervention strategies including small group activities, targeted practice, and scaffolding techniques.',
    'Parent communication draft': 'Draft a professional, encouraging email to the parent/guardian summarizing the student\'s progress, strengths, and areas to work on at home.',
  };

  const userPrompt = `You are a Texas math teacher writing feedback for a student.
Grade level: ${gradeLabel}
${teksPart}
Student: ${studentName || 'Student'}
Feedback type: ${feedbackType || 'Progress summary'}

${typeInstructions[feedbackType] || typeInstructions['Progress summary']}

Be specific, actionable, and encouraging. Use language appropriate for the audience (teacher notes for progress/misconception/intervention, parent-friendly for parent communication).`;

  const text = await callAnthropic(null, userPrompt);
  res.json({ success: true, content: text });
}));

// Grading Assistant
app.post('/api/evaluate-response', asyncHandler(async (req, res) => {
  const { gradeLevel, teksStandard, studentResponse } = req.body;
  const gradeLabel = gradeLevel === 'algebra' ? 'Algebra I' : 'Grade 3';
  const teksPart = teksStandard ? `Evaluated against TEKS standard ${teksStandard}. ` : '';

  const userPrompt = `You are a Texas math teacher evaluating a student's written response.
Grade level: ${gradeLabel}
${teksPart}

Student's response:
"${studentResponse}"

Evaluate this response and provide:
1. **Suggested rubric score** (0–4 scale):
   - 0: No understanding demonstrated
   - 1: Minimal understanding, major errors
   - 2: Partial understanding, some errors
   - 3: Strong understanding, minor errors
   - 4: Complete mastery, clear reasoning
2. **Reasoning quality assessment**: Is the explanation clear and logical?
3. **Mathematical accuracy**: Are the computations and concepts correct?
4. **Misconceptions identified**: What errors or misunderstandings are present?
5. **Specific feedback**: What should the student work on?
6. **Strengths**: What did the student do well?

Be fair, specific, and constructive.`;

  const text = await callAnthropic(null, userPrompt);
  res.json({ success: true, content: text });
}));

// ── AI-Native Endpoints ──

// 1. AI Curriculum Builder from learning outcomes
app.post('/api/generate-curriculum', asyncHandler(async (req, res) => {
  const { gradeLevel, learningOutcomes, teksStandards } = req.body;
  const gradeLabel = gradeLevel === 'algebra' ? 'Algebra I' : (gradeLevel || 'Grade 3').replace('grade', 'Grade ');
  const outcomes = Array.isArray(learningOutcomes) ? learningOutcomes.join('\n') : (learningOutcomes || '');
  const teksPart = Array.isArray(teksStandards) && teksStandards.length > 0
    ? `TEKS standards to cover: ${teksStandards.join(', ')}. `
    : '';

  const userPrompt = `You are a Texas curriculum designer. Create a unit/curriculum sequence from these learning outcomes.

Grade level: ${gradeLabel}
${teksPart}

Learning outcomes:
${outcomes || 'General math mastery for this grade level.'}

Return a structured curriculum with:
1. **Unit overview** (2-4 weeks)
2. **Lesson sequence** (each with: title, learning objective, key activities, formative check)
3. **Suggested pacing** (days per lesson)
4. **Differentiation strategies** per lesson
5. **Summative assessment ideas**

Format in clear sections. Be practical and classroom-ready.`;

  const text = await callAnthropic(null, userPrompt, 4096);
  res.json({ success: true, content: text });
}));

// 2. Rubric generation from assignment prompt
app.post('/api/generate-rubric', asyncHandler(async (req, res) => {
  const { assignmentPrompt, gradeLevel, teksStandard } = req.body;
  const gradeLabel = gradeLevel === 'algebra' ? 'Algebra I' : (gradeLevel || 'Grade 3').replace('grade', 'Grade ');
  const teksPart = teksStandard ? `Aligned to TEKS ${teksStandard}. ` : '';

  const userPrompt = `You are a Texas math teacher. Generate a grading rubric for this assignment.

Grade level: ${gradeLabel}
${teksPart}

Assignment prompt/description:
"${assignmentPrompt || 'Open-ended math response'}"

Return a rubric with:
1. **Criteria** (3-5 dimensions: e.g., Mathematical accuracy, Reasoning, Communication, etc.)
2. **Performance levels** for each (e.g., 4=Exemplary, 3=Proficient, 2=Developing, 1=Emerging)
3. **Descriptors** for each level
4. **Total points** suggestion

Format as a clear, usable rubric. Return ONLY the rubric text, no preamble.`;

  const text = await callAnthropic(null, userPrompt);
  res.json({ success: true, content: text });
}));

// 3. Auto-differentiated content (multiple reading levels)
app.post('/api/generate-differentiated', asyncHandler(async (req, res) => {
  const { content, gradeLevel, levels = ['below', 'on', 'above'] } = req.body;
  const gradeLabel = gradeLevel === 'algebra' ? 'Algebra I' : (gradeLevel || 'Grade 3').replace('grade', 'Grade ');

  const userPrompt = `You are a Texas math teacher creating differentiated versions of content.

Original content:
"${content || 'Math problem or instruction'}"

Grade level: ${gradeLabel}

Create ${levels.length} versions with different reading/complexity levels:
${levels.map((l, i) => `- Level ${i + 1} (${l}): ${l === 'below' ? 'Simpler language, shorter sentences, more scaffolding' : l === 'on' ? 'Grade-level appropriate' : 'More challenging, richer vocabulary'}`).join('\n')}

Return a JSON object:
{"versions":[{"level":"below","text":"..."},{"level":"on","text":"..."},{"level":"above","text":"..."}]}

CRITICAL: Return ONLY valid JSON, no markdown, no explanation.`;

  const rawText = await callAnthropic(null, userPrompt, 2048);
  let result = null;
  try {
    const cleaned = rawText.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim();
    result = JSON.parse(cleaned);
  } catch { /* fallback */ }
  res.json({ success: true, content: rawText, versions: result?.versions || null });
}));

// 4. Evaluate response WITH bias detection (AI marking assistant)
app.post('/api/evaluate-with-bias', asyncHandler(async (req, res) => {
  const { gradeLevel, teksStandard, studentResponse, studentName } = req.body;
  const gradeLabel = gradeLevel === 'algebra' ? 'Algebra I' : 'Grade 3';
  const teksPart = teksStandard ? `Evaluated against TEKS standard ${teksStandard}. ` : '';

  const userPrompt = `You are a Texas math teacher evaluating a student's written response. Be fair and objective.

Grade level: ${gradeLabel}
${teksPart}

Student's response:
"${studentResponse}"

Evaluate and provide:
1. **Suggested rubric score** (0–4 scale)
2. **Reasoning quality** and **mathematical accuracy**
3. **Misconceptions identified**
4. **Specific feedback** and **strengths**
5. **BIAS CHECK**: Note any potential grading bias (e.g., favoring verbose over concise, penalizing non-standard notation that is correct, cultural/linguistic assumptions). If none, say "No bias detected." Be brief on this section.`;

  const text = await callAnthropic(null, userPrompt);
  res.json({ success: true, content: text });
}));

// 5. Student misconception detection (from response history)
app.post('/api/detect-misconceptions', asyncHandler(async (req, res) => {
  const { gradeLevel, teksStandard, studentResponses } = req.body;
  const gradeLabel = gradeLevel === 'algebra' ? 'Algebra I' : 'Grade 3';
  const teksPart = teksStandard ? `TEKS: ${teksStandard}. ` : '';
  const responses = Array.isArray(studentResponses) ? studentResponses : [];

  const userPrompt = `You are a Texas math teacher analyzing a student's work to detect misconceptions.

Grade level: ${gradeLabel}
${teksPart}

Student responses (chronological):
${responses.length > 0
    ? responses.map((r, i) => `[${i + 1}] ${typeof r === 'string' ? r : (r.text || r.response || JSON.stringify(r))}`).join('\n\n')
    : 'No responses yet.'}

Identify:
1. **Likely misconceptions** (e.g., place value confusion, operation errors, procedural mistakes)
2. **Pattern** across responses (consistent vs. sporadic errors)
3. **Recommended interventions** (specific activities, scaffolding)
4. **Confidence** (High/Medium/Low) in each misconception

Be specific and actionable.`;

  const text = await callAnthropic(null, userPrompt);
  res.json({ success: true, content: text });
}));

// 6. Predictive early-warning risk system
app.post('/api/early-warning', asyncHandler(async (req, res) => {
  const { students, gradeLevel } = req.body;
  const gradeLabel = gradeLevel === 'algebra' ? 'Algebra I' : 'Grade 3';
  const studentData = Array.isArray(students) ? students : [];

  const userPrompt = `You are a Texas math teacher analyzing class data for early-warning risk.

Grade level: ${gradeLabel}

Student data (each has: name, avgGrade, participation, recentTrend, etc.):
${JSON.stringify(studentData, null, 2)}

For each student, assess:
1. **Risk level** (High / Medium / Low / On Track)
2. **Key factors** (grades, participation, trend)
3. **Recommended action** (1-2 sentences)
4. **Priority** for intervention (1 = highest)

Return a structured summary. Focus on students who need attention. Be concise.`;

  const text = await callAnthropic(null, userPrompt);
  res.json({ success: true, content: text });
}));

// 7. Bloom's taxonomy quiz generation (extend generate-questions with bloomLevel)
app.post('/api/generate-questions-bloom', asyncHandler(async (req, res) => {
  const { gradeLevel, teksStandard, bloomLevel, numQuestions = 5 } = req.body;
  const gradeLabel = gradeLevel === 'algebra' ? 'Algebra I' : 'Grade 3';
  const teksPart = teksStandard ? `TEKS ${teksStandard}. ` : '';
  const bloom = bloomLevel || 'apply';
  const bloomDesc = {
    remember: 'Recall facts, terms, basic concepts',
    understand: 'Explain ideas, interpret, summarize',
    apply: 'Use information in new situations',
    analyze: 'Break down, distinguish, relate',
    evaluate: 'Justify, judge, critique',
    create: 'Design, construct, produce',
  }[bloom] || bloom;

  const userPrompt = `You are a Texas math teacher creating questions aligned to Bloom's Taxonomy.

Grade level: ${gradeLabel}
${teksPart}
Bloom level: ${bloom} — ${bloomDesc}

Generate exactly ${Math.min(parseInt(numQuestions) || 5, 15)} multiple-choice questions that require ${bloom}-level thinking.
Each question: id, question, options (A,B,C,D), correct, misconception.

Return ONLY a valid JSON array:
[{"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","misconception":"..."}]

No markdown, no explanation.`;

  const rawText = await callAnthropic(null, userPrompt, 4096);
  let questions = null;
  try {
    const cleaned = rawText.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim();
    questions = JSON.parse(cleaned);
  } catch { /* fallback */ }
  res.json({ success: true, content: rawText, questions, format: 'multiple-choice' });
}));

// Shared question bank storage (persisted to disk)
app.post('/api/question-bank', (req, res) => {
  try {
    const { title, questions, format, gradeLevel, teksStandard, difficulty } = req.body;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    saveQuestionBank(id, { title, questions, format, gradeLevel, teksStandard, difficulty, createdAt: new Date().toISOString() });
    res.json({ success: true, id });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/api/question-bank/:id', (req, res) => {
  const bank = getQuestionBankById(req.params.id);
  if (!bank) return res.json({ success: false, error: 'Question bank not found or link expired.' });
  res.json({ success: true, bank });
});

app.get('/api/models', async (req, res) => {
  try {
    const r = await fetch('https://api.anthropic.com/v1/models', {
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ── Stripe Checkout (or demo mode) ──
// stripe is already initialized at top of file (line ~93). This block is a no-op for compatibility.

// Map plan IDs to Stripe price IDs (set these in .env when you create products in Stripe dashboard)
const PRICE_MAP = {
  pro_monthly: process.env.STRIPE_PRICE_MONTHLY || null,
  pro_yearly: process.env.STRIPE_PRICE_YEARLY || null,
};

app.post('/api/create-checkout', async (req, res) => {
  try {
    const { planId, username } = req.body;
    if (!planId || !username) return res.json({ success: false, error: 'Missing planId or username.' });

    // Real Stripe checkout
    if (stripe && PRICE_MAP[planId]) {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: PRICE_MAP[planId], quantity: 1 }],
        success_url: `${req.headers.origin || 'http://localhost:3000'}/pricing?checkout=success&plan=${planId}&user=${username}`,
        cancel_url: `${req.headers.origin || 'http://localhost:3000'}/pricing?checkout=cancel&user=${username}`,
        metadata: { username, planId },
      });
      return res.json({ success: true, url: session.url });
    }

    // Demo mode — no Stripe key, so activate client-side
    res.json({ success: true, demo: true, planId, username });
  } catch (err) {
    console.error('Checkout error:', err);
    res.json({ success: false, error: err.message });
  }
});

// Stripe Webhook (for real payments — verifies and activates plans server-side)
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(400).send('Stripe not configured');
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Payment successful for:', session.metadata?.username, session.metadata?.planId);
      // In production, update your database here
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// ── QBot Chat – conversational math tutor ──
app.post('/api/chat', asyncHandler(async (req, res) => {
  const { messages, context } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.json({ success: false, error: 'No messages provided.' });
  }

  const grade = context?.grade || 'Grade 3';
  const teks = context?.teks || '';
  const role = context?.role || 'student'; // student or teacher

  const systemPrompt = role === 'teacher'
    ? `You are QBot, a friendly and knowledgeable AI teaching assistant for Texas math teachers. You help with TEKS standards, lesson planning, classroom strategies, and student support. Be practical, concise, and helpful. Current grade level: ${grade}.${teks ? ` Current TEKS focus: ${teks}.` : ''}`
    : `You are QBot, a fun and encouraging AI math tutor for ${grade} students in Texas. You help students understand math concepts aligned to Texas TEKS standards.

RULES:
- Use simple, kid-friendly language appropriate for ${grade}.
- When explaining, ALWAYS show step-by-step work. Never just give the answer.
- Use real examples with numbers. Work through them step by step.
- Be encouraging! Celebrate effort and correct answers.
- If a student is confused, try explaining a different way (visual, story, simpler numbers).
- Keep responses concise (2-4 short paragraphs max).
- Use emoji sparingly to keep it fun but not overwhelming.
${teks ? `- Current TEKS focus: ${teks}.` : ''}
- If asked something not about math, gently redirect: "Great question! I'm best at math though. Want to try a math problem?"

FORMATTING RULES (very important):
- You can use **bold** for emphasis and \`inline code\` for numbers.
- For showing math work (like stacking numbers for addition), use triple-backtick code blocks (\`\`\`).
- For vertical math (addition/subtraction), stack numbers like:
\`\`\`
    347
  + 285
  -----
    632
\`\`\`
- Do NOT draw shapes with ASCII art. Instead, DESCRIBE the shape with labeled measurements in a simple list like:
  Rectangle: top = 5 ft, right = 3 ft, bottom = 5 ft, left = 3 ft
- NEVER use box-drawing characters (┌ ┐ └ ┘ │ ─ | + -) to draw shapes. Just describe them with words and numbers.
- Keep code blocks short (under 6 lines) and ONLY use them for stacking numbers vertically.`;

  // Convert to Anthropic format
  const anthropicMessages = messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content,
  }));

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: anthropicMessages,
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  res.json({ success: true, reply: text });
}));

// ─── AI Predictive Performance Model ────────────────────────────
app.post('/api/predict-performance', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { students, classAvg, standardsData, totalSessions } = req.body;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are a predictive analytics engine for a K-12 math class. Analyze this data and provide predictions.

Class data:
- Class average: ${classAvg || 'N/A'}%
- Total game sessions: ${totalSessions || 0}
- Standards performance: ${standardsData || 'No data'}

Student data (name, avg score, games played, trend):
${(students || []).map(s => `${s.name}: ${s.avg || '--'}%, ${s.gamesPlayed} games, trend ${s.trend || 'N/A'}`).join('\n')}

Return a JSON object with this exact structure:
{
  "predictions": [
    { "name": "Student Name", "currentAvg": 75, "predictedEndOfUnit": 82, "riskLevel": "low|medium|high|critical", "confidence": 85, "keyFactors": ["improving trend", "consistent practice"] }
  ],
  "classTrajectory": { "currentAvg": 72, "predictedAvg": 78, "trend": "improving|stable|declining" },
  "interventionPriority": [
    { "name": "Student Name", "urgency": "immediate|this_week|monitor", "reason": "declining scores", "action": "1-on-1 review of fractions" }
  ],
  "cohorts": [
    { "label": "High Performers", "students": ["Name1","Name2"], "recommendation": "Challenge with advanced problems" },
    { "label": "At Risk", "students": ["Name3"], "recommendation": "Daily targeted practice" }
  ]
}

Return ONLY valid JSON, no markdown.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, ...parsed });
  } catch {
    res.json({ success: true, rawAnalysis: text });
  }
}));

// ─── AI Cohort Clustering Analysis ──────────────────────────────
app.post('/api/cohort-analysis', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { students, standardsData } = req.body;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are a learning analytics engine. Cluster these students into meaningful cohorts based on performance patterns.

Student data (name, avg, games played, trend, weak standards):
${(students || []).map(s => `${s.name}: avg ${s.avg || '--'}%, ${s.gamesPlayed} games, trend ${s.trend || 'N/A'}, weak: ${s.weakStandards || 'none'}`).join('\n')}

Standards data: ${standardsData || 'N/A'}

Return JSON with this structure:
{
  "cohorts": [
    {
      "id": "cluster-1",
      "label": "Descriptive Name",
      "color": "#hex",
      "students": ["Name1", "Name2"],
      "characteristics": "Brief description of what defines this group",
      "avgScore": 72,
      "sharedWeaknesses": ["TEKS 3.4A", "TEKS 3.5B"],
      "sharedStrengths": ["TEKS 3.2A"],
      "recommendation": "Specific teaching strategy",
      "groupSize": 3
    }
  ],
  "insights": "2-3 sentences of overall class insight"
}

Return ONLY valid JSON, no markdown.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, ...parsed });
  } catch {
    res.json({ success: true, rawAnalysis: text });
  }
}));

// ─── AI Intervention Suggestions ────────────────────────────────
app.post('/api/intervention-suggestions', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { studentName, avg, trend, weakStandards, gamesPlayed, gradeLevel } = req.body;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `You are an intervention specialist for ${gradeLevel || 'Grade 3'} math.

Student: ${studentName}
- Average score: ${avg || 'N/A'}%
- Games played: ${gamesPlayed || 0}
- Trend: ${trend || 'N/A'}
- Weak standards: ${weakStandards || 'none identified'}

Generate 3 specific, actionable intervention strategies. For each:
1. Strategy name
2. Time required (e.g., "5 min daily" or "15 min twice/week")
3. Step-by-step instructions the teacher can follow immediately
4. Expected timeline to see improvement
5. How to monitor progress

Be specific to this student's data. No generic advice.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  res.json({ success: true, interventions: text });
}));

// ─── AI Personalised Learning Pathway ───────────────────────────
app.post('/api/generate-pathway', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { gradeId, masterySnapshot, totalAttempts, accuracy, masteredCount, totalConcepts } = req.body;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: `You are an adaptive learning engine for a ${gradeId || 'Grade 3'} math student.

Student data:
- Total attempts: ${totalAttempts || 0}
- Overall accuracy: ${accuracy || 0}%
- Mastered: ${masteredCount || 0} of ${totalConcepts || 0} concepts
- Mastery snapshot: ${masterySnapshot || 'No data yet'}

Generate a personalised 5-step learning pathway. For each step:
1. Name the specific concept/skill
2. Why it's the right next step (prerequisite logic)
3. Suggested activity type (warm-up, mini-lesson, practice game, or review)
4. Expected time

Also include:
- One sentence on pacing advice
- One strength to celebrate
- One area needing focused attention

Be encouraging and specific. Use the student's actual mastery data.`,
    }],
  });

  const pathway = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  res.json({ success: true, pathway });
}));

// ─── AI Auto-Grade Discussions/Exit Tickets in Bulk ─────────────
app.post('/api/auto-grade-batch', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { items, rubricScale, gradeLevel } = req.body;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Grade these student responses on a ${rubricScale || '1-5'} scale for a ${gradeLevel || 'Grade 3'} class.

Rubric: 5=Exceptional (insightful, evidence-based), 4=Proficient (correct, clear), 3=Developing (partially correct), 2=Emerging (minimal effort), 1=Incomplete (off-topic or no substance).

Student responses:
${(items || []).map((item, i) => `${i + 1}. Student "${item.studentName}": "${item.response}"`).join('\n')}

Return ONLY a JSON array:
[{"studentId":"${items?.[0]?.studentId || 'id'}","grade":4,"feedback":"Brief 1-sentence feedback"}]

Include ALL students. Return ONLY valid JSON, no markdown.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, grades: parsed });
  } catch {
    res.json({ success: true, rawGrades: text });
  }
}));

// ─── AI Feedback Draft Generator ────────────────────────────────
app.post('/api/generate-feedback-draft', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { students, classAvg, gradeLevel, context } = req.body;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Generate personalized feedback drafts for each student in a ${gradeLevel || 'Grade 3'} math class.
Context: ${context || 'End of week progress'}. Class average: ${classAvg || 'N/A'}%.

Student data:
${(students || []).map(s => `- ${s.name}: ${s.avg || 'N/A'}% avg, ${s.gamesPlayed || 0} games, trend: ${s.trend || 'N/A'}, strengths: ${s.strengths || 'N/A'}, areas to improve: ${s.weaknesses || 'N/A'}`).join('\n')}

For each student write:
1. A warm, encouraging opening (1 sentence)
2. Specific praise for what they've done well
3. One concrete next step for improvement
4. A motivational closing

Keep each feedback to 3-4 sentences. Be specific to their data. Tone: warm, professional, encouraging.

Return JSON array: [{"name":"Student Name","feedback":"The full feedback text","parentVersion":"Shorter version suitable for parent communication"}]
Return ONLY valid JSON.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, feedbacks: parsed });
  } catch {
    res.json({ success: true, rawFeedback: text });
  }
}));

// ─── AI Content Transformation (Text → Interactive Module) ──────
app.post('/api/transform-content', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { content, gradeLevel, contentType } = req.body;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `Transform this ${contentType || 'text'} content into an interactive learning module for ${gradeLevel || 'Grade 3'} students.

Source content:
"""
${(content || '').slice(0, 4000)}
"""

Create a structured module with:
1. A clear lesson title
2. Learning objectives (2-3 bullet points)
3. Key vocabulary with student-friendly definitions
4. Content broken into 3-4 digestible sections with headers
5. 2-3 check-for-understanding questions (multiple choice) embedded between sections
6. A summary/recap section
7. 2 extension activities

Return JSON:
{
  "title": "Lesson Title",
  "objectives": ["obj1", "obj2"],
  "vocabulary": [{"term":"word","definition":"meaning"}],
  "sections": [
    {"header":"Section Title","content":"Rich content text","type":"content"},
    {"header":"Check Your Understanding","questions":[{"question":"Q?","options":["A","B","C","D"],"correct":"A"}],"type":"quiz"}
  ],
  "summary": "Recap text",
  "extensions": ["Activity 1 description", "Activity 2 description"]
}

Return ONLY valid JSON.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, module: parsed });
  } catch {
    res.json({ success: true, rawModule: text });
  }
}));

// ─── AI Accessibility Check ─────────────────────────────────────
app.post('/api/accessibility-check', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { content, contentType } = req.body;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: `Perform an accessibility audit on this educational content.

Content type: ${contentType || 'text'}
Content:
"""
${(content || '').slice(0, 3000)}
"""

Check for:
1. Reading level appropriateness (Flesch-Kincaid grade level)
2. Complex vocabulary that may need simplification
3. Sentence length issues (>20 words = flag)
4. Missing alt text descriptions for any referenced images
5. Color contrast concerns in any formatting
6. Cultural sensitivity and inclusiveness
7. Cognitive load (too much info at once?)

Return JSON:
{
  "score": 85,
  "grade": "A|B|C|D|F",
  "readingLevel": "Grade X",
  "issues": [
    {"severity":"high|medium|low","category":"readability|vocabulary|structure|inclusivity","issue":"Description","suggestion":"How to fix","line":"relevant text snippet"}
  ],
  "strengths": ["What's already good"],
  "summary": "1-2 sentence overall assessment"
}

Return ONLY valid JSON.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, ...parsed });
  } catch {
    res.json({ success: true, rawCheck: text });
  }
}));

// ─── AI Standards Mapping (auto-map outcomes to frameworks) ──────
app.post('/api/map-standards', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { learningOutcomes, sourceFramework, targetFramework, gradeLevel, context } = req.body;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an educational standards alignment expert. Map these learning outcomes from ${sourceFramework || 'TEKS'} to ${targetFramework || 'Common Core'}.

Grade level: ${gradeLevel || 'Grade 3 Mathematics'}
Context: ${context || 'K-12 math education'}

Learning outcomes to map:
${JSON.stringify(learningOutcomes || [], null, 2)}

For each outcome, find the closest matching standard(s) in the target framework.

Return JSON:
{
  "mappings": [
    {
      "sourceId": "source standard id",
      "sourceDescription": "what it says",
      "targetStandards": [
        {"id":"target.id","description":"what it maps to","confidence":"high|medium|low","alignment":"full|partial|related","notes":"Any alignment notes"}
      ],
      "gaps": ["Any aspects not covered by target framework"]
    }
  ],
  "coverageSummary": {
    "totalMapped": 10,
    "fullAlignment": 7,
    "partialAlignment": 2,
    "noMatch": 1,
    "coveragePercent": 90
  },
  "recommendations": ["Recommendations for addressing gaps"]
}

Return ONLY valid JSON.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, result: parsed });
  } catch {
    res.json({ success: true, rawResult: text });
  }
}));

// ─── AI Compliance Report Generator ─────────────────────────────
app.post('/api/compliance-report', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { auditBundle, frameworkId, reportType } = req.body;

  const prompts = {
    'full-report': `Generate a comprehensive compliance report for this educational program. Analyze the audit data and produce a formal report suitable for accreditation reviewers.`,
    'gap-analysis': `Perform a gap analysis: identify which standards lack sufficient evidence, which students are below proficiency, and what remediation is needed.`,
    'evidence-summary': `Summarize all evidence artifacts, their alignment to standards, and assess whether evidence is sufficient for each standard.`,
    'readiness-assessment': `Assess whether this program is ready for an accreditation audit. Identify strengths, weaknesses, and specific actions needed before an audit.`,
  };

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `${prompts[reportType] || prompts['full-report']}

Framework: ${frameworkId || 'TEKS'}
Audit data (summarized):
${JSON.stringify(auditBundle || {}, null, 2).slice(0, 4000)}

Return JSON:
{
  "title": "Report Title",
  "date": "Report date",
  "overallCompliance": 85,
  "overallGrade": "A|B|C|D|F",
  "executiveSummary": "2-3 sentence summary",
  "sections": [
    {"heading":"Section","content":"Detailed content","status":"compliant|partial|non-compliant","score":90}
  ],
  "standardsAnalysis": [
    {"standardId":"id","description":"desc","evidenceCount":5,"sufficiency":"sufficient|insufficient|none","avgPerformance":82,"recommendation":"action needed"}
  ],
  "gaps": [{"area":"Description","severity":"critical|major|minor","recommendation":"How to fix","deadline":"Suggested timeline"}],
  "strengths": ["strength1"],
  "actionItems": [{"action":"What to do","priority":"high|medium|low","owner":"Who","deadline":"When"}],
  "auditReadiness": {"ready":true,"score":85,"blockers":["blocker1"],"nextSteps":["step1"]}
}

Return ONLY valid JSON.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, result: parsed });
  } catch {
    res.json({ success: true, rawResult: text });
  }
}));

// ─── Admin Compliance Agent ──────────────────────────────────────
app.post('/api/compliance-agent', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { platformData, scanType } = req.body;

  const systemPrompt = `You are an Admin Compliance Agent for an educational LMS platform (Quantegy AI). You perform autonomous compliance audits to ensure the platform meets regulatory, accessibility, and quality standards for Texas K-12 education.

PLATFORM DATA:
${JSON.stringify(platformData || {}, null, 2).slice(0, 3000)}`;

  const prompts = {
    'full-audit': `Perform a full compliance audit of this platform. Check:
1. TEKS alignment — Are all classes properly aligned to Texas TEKS standards?
2. Accessibility — WCAG 2.1 AA compliance for content and UI
3. Data privacy — FERPA, COPPA, and student data handling
4. Content quality — Grade-level appropriateness, bias detection
5. Assessment integrity — Fair grading practices, auto-grade reliability
6. Usage policies — Screen time limits, equitable access

Return JSON:
{
  "overallScore": 85,
  "overallGrade": "A|B|C|D|F",
  "categories": [
    {"name":"TEKS Alignment","score":90,"status":"pass|warning|fail","findings":["finding1"],"actions":["action1"]},
    {"name":"Accessibility","score":80,"status":"pass|warning|fail","findings":["finding1"],"actions":["action1"]},
    {"name":"Data Privacy","score":95,"status":"pass|warning|fail","findings":["finding1"],"actions":["action1"]},
    {"name":"Content Quality","score":85,"status":"pass|warning|fail","findings":["finding1"],"actions":["action1"]},
    {"name":"Assessment Integrity","score":88,"status":"pass|warning|fail","findings":["finding1"],"actions":["action1"]},
    {"name":"Usage Policies","score":82,"status":"pass|warning|fail","findings":["finding1"],"actions":["action1"]}
  ],
  "criticalIssues": [{"issue":"Description","severity":"critical|high|medium","remediation":"How to fix","deadline":"immediate|30-days|90-days"}],
  "recommendations": ["rec1","rec2"],
  "nextAuditDate": "date suggestion"
}
Return ONLY valid JSON.`,
    'teks-alignment': `Audit TEKS alignment specifically. For each class, verify standards are correct for the grade level.
Return JSON:
{"teksAudit":[{"className":"Name","gradeLevel":"Grade X","alignedCount":10,"misalignedCount":2,"coverage":"85%","gaps":["gap1"],"recommendations":["rec1"]}],"summary":"Overall assessment"}
Return ONLY valid JSON.`,
    'privacy-check': `Perform a data privacy and security audit. Check FERPA, COPPA compliance, data handling practices.
Return JSON:
{"privacyScore":90,"ferpaCompliant":true,"coppaCompliant":true,"findings":[{"area":"Area","status":"compliant|at-risk|non-compliant","detail":"Description","action":"What to do"}],"dataRetentionPolicy":"assessment","encryptionStatus":"assessment","summary":"Overall assessment"}
Return ONLY valid JSON.`,
    'content-review': `Audit all content for quality, bias, and grade-level appropriateness.
Return JSON:
{"contentScore":88,"findings":[{"area":"Area","score":90,"issues":["issue1"],"positives":["positive1"]}],"biasCheck":{"score":92,"flags":["flag1"]},"readabilityCheck":{"avgGradeLevel":"Grade X","appropriate":true},"summary":"Overall assessment"}
Return ONLY valid JSON.`,
  };

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompts[scanType] || prompts['full-audit'] }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, result: parsed });
  } catch {
    res.json({ success: true, rawResult: text });
  }
}));

// ─── Data Insights Agent ─────────────────────────────────────────
app.post('/api/data-insights-agent', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { platformData, analysisType } = req.body;

  const systemPrompt = `You are a Data Insights Agent for an educational LMS (Quantegy AI). You autonomously analyze platform data to discover patterns, predict trends, detect anomalies, and generate actionable reports. Think like a data scientist who specializes in education analytics.

PLATFORM DATA:
${JSON.stringify(platformData || {}, null, 2).slice(0, 4000)}`;

  const prompts = {
    'full-analysis': `Perform comprehensive data analysis. Return JSON:
{
  "summary": "Executive summary (2-3 sentences)",
  "keyMetrics": [{"metric":"name","value":"value","trend":"up|down|stable","significance":"high|medium|low"}],
  "patterns": [{"pattern":"Description of pattern found","evidence":"Supporting data","impact":"What this means","actionable":"What to do about it"}],
  "anomalies": [{"anomaly":"What's unusual","severity":"high|medium|low","possibleCause":"Why","recommendation":"What to do"}],
  "predictions": [{"prediction":"What will likely happen","confidence":"high|medium|low","timeframe":"when","basis":"Based on what data"}],
  "segments": [{"segment":"Student/class group","size":"count","characteristics":["char1"],"recommendation":"Tailored action"}],
  "report": {"title":"Weekly Insights Report","highlights":["highlight1"],"concerns":["concern1"],"opportunities":["opportunity1"]}
}
Return ONLY valid JSON.`,
    'trend-forecast': `Forecast performance trends for the next 4 weeks based on current data patterns. Return JSON:
{"forecasts":[{"metric":"name","currentValue":"value","predictedValues":[{"week":"Week 1","value":"predicted","confidence":"high|medium|low"}],"trend":"improving|declining|stable","riskLevel":"low|medium|high"}],"summary":"Assessment"}
Return ONLY valid JSON.`,
    'anomaly-detection': `Detect anomalies and outliers in the data. Return JSON:
{"anomalies":[{"type":"performance|engagement|behavioral|systemic","description":"What's unusual","affectedEntities":["who/what"],"severity":"critical|high|medium|low","evidence":"data points","recommendedAction":"what to do"}],"normalRanges":{"avgScore":"X-Y%","engagement":"X-Y%","sessionsPerWeek":"X-Y"},"summary":"Assessment"}
Return ONLY valid JSON.`,
    'cohort-analysis': `Segment students into cohorts and analyze each. Return JSON:
{"cohorts":[{"name":"Cohort Name","size":10,"avgScore":75,"characteristics":["char1"],"trend":"improving|declining|stable","riskLevel":"low|medium|high","recommendation":"Targeted action"}],"crossCohortInsights":["insight1"],"summary":"Assessment"}
Return ONLY valid JSON.`,
  };

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2500,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompts[analysisType] || prompts['full-analysis'] }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, result: parsed });
  } catch {
    res.json({ success: true, rawResult: text });
  }
}));

// ─── AI Auto-Translate (UI strings batch) ────────────────────────
app.post('/api/auto-translate', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { strings, targetLang, targetLangName, context } = req.body;

  if (!strings || !targetLang) return res.json({ success: false, error: 'Missing strings or targetLang.' });

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Translate the following UI strings from English to ${targetLangName || targetLang}.

Context: These are interface labels for an educational math learning platform for K-12 students and teachers.

IMPORTANT RULES:
1. Keep translations SHORT — they are button labels, menu items, headings
2. Use natural, locally common phrasing — not literal word-for-word translation
3. Keep technical terms (STAAR, TEKS, TExES, AI, Pro) untranslated
4. For languages with formal/informal forms, use the informal/friendly form (this is for students)
5. Maintain the same meaning and tone

Strings to translate (JSON object with key:english_value):
${JSON.stringify(strings)}

Return ONLY a valid JSON object with the same keys but translated values:
{"key1":"translated1","key2":"translated2"}

Return ONLY valid JSON, no markdown.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, translations: parsed });
  } catch {
    res.json({ success: false, rawText: text });
  }
}));

// ─── AI Content Adaptation (translate + culturally adapt) ────────
app.post('/api/adapt-content', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { content, contentType, sourceLang, targetLang, targetLangName, targetRegion, gradeLevel } = req.body;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `Translate AND culturally adapt this educational content from ${sourceLang || 'English'} to ${targetLangName || targetLang} for ${targetRegion || 'the target region'}.

Content type: ${contentType || 'lesson material'}
Grade level: ${gradeLevel || 'Grade 3'}

SOURCE CONTENT:
"""
${(content || '').slice(0, 4000)}
"""

ADAPTATION RULES:
1. Translate accurately while maintaining educational intent
2. Replace cultural references with locally relevant ones (e.g. "dollars" → local currency, "baseball" → local sport)
3. Adjust examples to use local names, places, and contexts
4. Ensure math notation follows local conventions
5. Simplify vocabulary if needed for the target audience
6. Add brief cultural notes [in brackets] where important differences exist
7. Keep mathematical concepts and formulas unchanged
8. Use age-appropriate language for ${gradeLevel || 'Grade 3'} students

Return JSON:
{
  "translatedContent": "The fully translated and adapted content",
  "adaptations": [{"original":"what was changed","adapted":"what it became","reason":"why"}],
  "culturalNotes": ["Any important cultural considerations"],
  "readingLevel": "Estimated grade level of the translated content",
  "confidence": "high|medium|low"
}

Return ONLY valid JSON.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, ...parsed });
  } catch {
    res.json({ success: true, translatedContent: text, adaptations: [], confidence: 'low' });
  }
}));

// ─── AI Teaching Agent (Autonomous Tutor) ────────────────────────
app.post('/api/ai-tutor', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { history, studentProfile, lessonTopic, gradeLevel, mode } = req.body;

  const systemPrompt = `You are an expert AI Teaching Agent — an autonomous, Socratic tutor for ${gradeLevel || 'Grade 3'} Texas math students.

STUDENT PROFILE:
- Accuracy: ${studentProfile?.accuracy || 'unknown'}%
- Mastered concepts: ${studentProfile?.masteredCount || 0}
- Struggling areas: ${studentProfile?.weakAreas || 'none identified'}
- Current streak: ${studentProfile?.streak || 0} days
- Level: ${studentProfile?.level || 1}

YOUR BEHAVIOR:
1. GUIDE, don't lecture. Ask one question at a time.
2. If the student answers correctly, praise specifically and advance to the next step.
3. If wrong, give a gentle hint and let them try again. Never just give the answer.
4. Break complex problems into small, numbered steps.
5. Use real-world examples and visuals (describe them).
6. After 3-4 successful steps, give a mini-challenge to reinforce.
7. Track progress through the lesson and tell the student where they are ("Step 2 of 5").
8. End each message with either a question or a clear next action.
9. Use encouraging, age-appropriate language.
10. If the student seems stuck (2+ wrong attempts), simplify and scaffold.

${mode === 'practice' ? 'MODE: Practice — Focus on drill problems with increasing difficulty.' : ''}
${mode === 'explain' ? 'MODE: Explain — Focus on conceptual understanding with worked examples.' : ''}
${mode === 'review' ? 'MODE: Review — Quick review of previously learned material.' : ''}

CURRENT LESSON TOPIC: ${lessonTopic || 'math practice'}

Keep responses concise (3-5 sentences max). Always end with a question or prompt for the student.`;

  const messages = (history || []).map((m) => ({ role: m.role, content: m.content }));
  if (messages.length === 0) {
    messages.push({ role: 'user', content: `Start a lesson on: ${lessonTopic || 'math'}` });
  }

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: systemPrompt,
    messages,
  });

  const reply = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  res.json({ success: true, reply });
}));

// ─── Agentic Workflow (Autonomous Teacher Actions) ───────────────
app.post('/api/agentic-workflow', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { classData, action } = req.body;

  const systemPrompt = `You are an Agentic Workflow AI for a teacher's LMS. You analyze class data and recommend or execute autonomous actions.

CLASS DATA:
${JSON.stringify(classData || {}, null, 2).slice(0, 3000)}

You must return a JSON object with actions to take. Be specific and actionable.`;

  const prompts = {
    'full-scan': `Analyze this class comprehensively. Return JSON:
{
  "summary": "1-2 sentence class health assessment",
  "urgentActions": [{"action":"type","target":"who/what","reason":"why","priority":"high|medium|low"}],
  "assignmentSuggestions": [{"name":"Assignment Name","game":"game-id","teks":"TEKS standard","reason":"why"}],
  "gradingActions": [{"student":"name","type":"auto-grade|review|intervene","reason":"why"}],
  "interventions": [{"student":"name","type":"message|extra-practice|parent-contact","message":"what to do","urgency":"immediate|this-week|monitor"}],
  "insights": ["Key insight 1", "Key insight 2"]
}
Return ONLY valid JSON.`,
    'suggest-assignments': `Based on class performance gaps, suggest 3-5 targeted assignments. Return JSON:
{"assignments":[{"name":"Name","gameType":"math-match|math-sprint|fraction-pizza|etc","targetTeks":"TEKS code","reason":"Why this assignment","difficulty":"easy|medium|hard"}]}
Return ONLY valid JSON.`,
    'auto-intervene': `Identify students who need immediate intervention. Return JSON:
{"interventions":[{"studentName":"Name","riskLevel":"critical|high|medium","indicators":["indicator1"],"suggestedActions":[{"action":"Description","timeframe":"today|this-week"}],"draftMessage":"A message to send to the student or parent"}]}
Return ONLY valid JSON.`,
    'grade-and-feedback': `Generate grading actions and feedback for all students. Return JSON:
{"feedback":[{"studentName":"Name","overallGrade":"A|B|C|D|F","strengths":["str1"],"improvements":["imp1"],"feedbackDraft":"2-3 sentence feedback","parentNote":"1 sentence for parents"}]}
Return ONLY valid JSON.`,
  };

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompts[action] || prompts['full-scan'] }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, result: parsed });
  } catch {
    res.json({ success: true, rawResult: text });
  }
}));

// ─── Student AI Agent (Personalized Companion) ──────────────────
app.post('/api/student-agent', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { studentProfile, trigger, context } = req.body;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `You are a personalized AI learning companion for a ${studentProfile?.grade || 'Grade 3'} student. Be warm, encouraging, and specific.

STUDENT DATA:
- Name: ${studentProfile?.name || 'Student'}
- Level: ${studentProfile?.level || 1} (${studentProfile?.title || 'Novice'})
- XP: ${studentProfile?.xp || 0}
- Accuracy: ${studentProfile?.accuracy || 0}%
- Mastered: ${studentProfile?.mastered || 0} concepts
- Streak: ${studentProfile?.streak || 0} days
- Weak areas: ${studentProfile?.weakAreas || 'none'}
- Strong areas: ${studentProfile?.strongAreas || 'none'}
- Last active: ${studentProfile?.lastActive || 'unknown'}

TRIGGER: ${trigger || 'dashboard-visit'}
CONTEXT: ${context || 'Student opened their dashboard'}

Based on the trigger, generate a short, personalized response. Return JSON:
{
  "message": "Your personalized message (2-3 sentences, encouraging)",
  "suggestion": {"type":"practice|review|challenge|celebrate|streak","label":"Button text","conceptId":"optional-concept-id","reason":"Why this suggestion"},
  "mood": "encouraging|celebrating|motivating|gentle-push|welcoming",
  "emoji": "single relevant emoji"
}

Triggers and expected behavior:
- "dashboard-visit": Welcome back, suggest what to do next based on data
- "streak-milestone": Celebrate the streak achievement
- "low-accuracy": Gently encourage and suggest easier review
- "mastery-achieved": Big celebration for mastering a concept
- "idle-return": Welcome back after absence, ease them in
- "challenge-complete": React to challenge result
- "game-complete": React to game performance

Return ONLY valid JSON.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, ...parsed });
  } catch {
    res.json({ success: true, message: text, mood: 'encouraging', emoji: '\u2728' });
  }
}));

// ─── AI Plagiarism / Originality Check ───────────────────────────
app.post('/api/ai/plagiarism-check', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { content, submissionId } = req.body;
  if (!content || !content.trim()) return res.json({ success: false, error: 'No content provided.' });

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are an academic integrity analyst. Evaluate the following student submission for originality.

SUBMISSION:
"""
${content.slice(0, 5000)}
"""

Analyze the text for:
1. Overall originality (0-100 score, where 100 = fully original)
2. Signs of AI-generated content (repetitive phrasing, overly formal tone, lack of personal voice)
3. Signs of copy-paste (abrupt style changes, inconsistent vocabulary level, formatting artifacts)
4. Flagged passages that seem borrowed or machine-generated

Return ONLY valid JSON:
{
  "score": 85,
  "confidence": "high|medium|low",
  "verdict": "likely_original|may_contain_borrowed|likely_ai_generated",
  "flags": [
    {"passage": "exact text snippet", "reason": "Why this is flagged", "type": "ai_pattern|copy_paste|style_inconsistency"}
  ],
  "analysis": "2-3 sentence summary of findings"
}

Be fair and balanced. Students can write well — do not penalize good writing. Focus on concrete indicators.
Return ONLY valid JSON.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, ...parsed, submissionId });
  } catch {
    res.json({ success: true, score: 50, confidence: 'low', verdict: 'unknown', flags: [], analysis: text, submissionId });
  }
}));

// ─── AI Adaptive Challenge Generator ─────────────────────────────
app.post('/api/adaptive-challenge', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });
  const { gradeLevel, accuracy, masteredCount, level, weakAreas } = req.body;

  const difficulty = accuracy >= 85 ? 'hard' : accuracy >= 65 ? 'medium' : 'easy';
  const xpReward = difficulty === 'hard' ? 40 : difficulty === 'medium' ? 25 : 15;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Generate a single ${difficulty} math challenge for a ${gradeLevel || 'Grade 3'} Texas student.

Student profile:
- Current accuracy: ${accuracy || 50}%
- Concepts mastered: ${masteredCount || 0}
- Player level: ${level || 1}
- Weak areas: ${weakAreas || 'general math'}

Requirements:
- Aligned to Texas TEKS standards
- ${difficulty === 'hard' ? 'Multi-step problem requiring critical thinking' : difficulty === 'medium' ? 'Standard grade-level problem' : 'Foundational concept review'}
- Include 4 multiple-choice options
- Include a helpful hint

Return ONLY JSON:
{
  "question": "The full question text",
  "options": ["A", "B", "C", "D"],
  "correct": "B",
  "hint": "A helpful hint without giving away the answer",
  "xpReward": ${xpReward},
  "skill": "The TEKS skill being tested",
  "difficulty": "${difficulty}"
}

Return ONLY valid JSON.`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    res.json({ success: true, challenge: { ...parsed, xpReward } });
  } catch {
    res.json({ success: true, rawChallenge: text });
  }
}));

// ─── Marketplace Course Purchase (Stripe) ───────────────────────
app.post('/api/marketplace/checkout', asyncHandler(async (req, res) => {
  const { courseId, courseTitle, price, priceModel, seller, buyer } = req.body;

  if (stripe) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: priceModel === 'subscription' ? 'subscription' : 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: courseTitle || 'Course Purchase' },
          unit_amount: Math.round((price || 0) * 100),
          ...(priceModel === 'subscription' ? { recurring: { interval: 'month' } } : {}),
        },
        quantity: 1,
      }],
      success_url: `${req.headers.origin || 'http://localhost:4173'}/marketplace?checkout=success&course=${courseId}`,
      cancel_url: `${req.headers.origin || 'http://localhost:4173'}/marketplace?checkout=cancel`,
      metadata: { courseId, seller, buyer, priceModel },
    });
    res.json({ success: true, sessionId: session.id, url: session.url });
  } else {
    res.json({ success: true, demo: true, courseId, buyer, seller, price });
  }
}));

// ─── Certificate Verification (public) ──────────────────────────
app.get('/api/verify/:verifyId', (req, res) => {
  res.json({ success: true, message: 'Certificate verification is handled client-side.', verifyId: req.params.verifyId });
});

app.get('/api/health', (req, res) => {
  const hasStripe = !!stripe;
  const hasStudentPriceIds = !!(STUDENT_BILLING_PLANS.student_exam_onetime?.priceId
    && STUDENT_BILLING_PLANS.student_monthly?.priceId);
  res.json({
    ok: true,
    hasKey: hasValidKey,
    hasStripe,
    hasStudentPriceIds,
    hasAnthropic: !!anthropic,
    uptimeSeconds: Math.floor(process.uptime()),
    sloEndpoint: '/api/sre/slos',
    metricsEndpoint: '/api/sre/metrics',
  });
});

app.get('/api/status', (req, res) => {
  const metrics24 = getSREMetrics(24);
  const burn = getBurnRateReport();
  const p95 = metrics24?.requestSummary?.latencyMs?.p95;
  const err5xx = metrics24?.requestSummary?.error5xxRatePercent;
  const degraded = (p95 != null && p95 > (SLO_TARGETS.latency.api.p95Ms * 1.1))
    || (err5xx != null && err5xx > SLO_TARGETS.reliability.max5xxPercent)
    || burn.signals.fastBurn
    || burn.signals.slowBurn;

  res.json({
    success: true,
    status: degraded ? 'degraded' : 'operational',
    generatedAt: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    components: [
      { name: 'api', status: 'operational' },
      { name: 'database', status: 'operational' },
      { name: 'ai-service', status: anthropic ? 'operational' : 'degraded' },
    ],
    slo: metrics24.targetEvaluation,
    burnRate: burn,
  });
});

// ── Versioned API aliases (v1) ──
app.get('/api/v1/health', (req, res) => {
  const hasStripe = !!stripe;
  res.json({
    success: true,
    version: 'v1',
    ok: true,
    hasKey: hasValidKey,
    hasStripe,
    hasAnthropic: !!anthropic,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.get('/api/v1/status', (req, res) => {
  const metrics24 = getSREMetrics(24);
  const burn = getBurnRateReport();
  const p95 = metrics24?.requestSummary?.latencyMs?.p95;
  const err5xx = metrics24?.requestSummary?.error5xxRatePercent;
  const degraded = (p95 != null && p95 > (SLO_TARGETS.latency.api.p95Ms * 1.1))
    || (err5xx != null && err5xx > SLO_TARGETS.reliability.max5xxPercent)
    || burn.signals.fastBurn
    || burn.signals.slowBurn;

  res.json({
    success: true,
    version: 'v1',
    status: degraded ? 'degraded' : 'operational',
    generatedAt: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    components: [
      { name: 'api', status: 'operational' },
      { name: 'database', status: 'operational' },
      { name: 'ai-service', status: anthropic ? 'operational' : 'degraded' },
    ],
    slo: metrics24.targetEvaluation,
    burnRate: burn,
  });
});

app.get('/api/v1/sre/metrics', (req, res) => {
  const windowHours = Math.max(1, Math.min(24 * 30, Number(req.query.windowHours) || 24));
  res.json({ success: true, version: 'v1', ...getSREMetrics(windowHours) });
});

app.get('/api/v1/openapi.json', (req, res) => {
  res.json(getOpenAPISpec());
});

// ── Data Export / Deletion (FERPA right to inspect, right to delete) ──

app.get('/api/data-request/export/:studentId', requireTeacher, (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = getStudents().find(s => s.id === studentId || s.username === studentId);
    if (!student) return res.status(404).json({ success: false, error: 'Student not found.' });

    const submissions = getSubmissionsByStudent(studentId);
    const notifications = getNotifications(studentId, 9999);
    const classIds = student.classIds || [];

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.username,
      student: { id: student.id, username: student.username, displayName: student.displayName, createdAt: student.createdAt },
      classIds,
      submissions,
      notifications,
    };

    res.setHeader('Content-Disposition', `attachment; filename="student_${studentId}_export.json"`);
    res.json({ success: true, data: exportData });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/data-request/delete/:studentId', requireTeacher, (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = getStudents().find(s => s.id === studentId || s.username === studentId);
    if (!student) return res.status(404).json({ success: false, error: 'Student not found.' });

    const deleteTransaction = db.transaction(() => {
      db.prepare('DELETE FROM submissions WHERE studentId = ?').run(studentId);
      db.prepare('DELETE FROM notifications WHERE userId = ?').run(studentId);
      db.prepare('DELETE FROM student_classes WHERE studentId = ?').run(studentId);
      db.prepare('DELETE FROM chat_messages WHERE authorId = ?').run(studentId);
      try { db.prepare('DELETE FROM scorm_attempts WHERE studentId = ?').run(studentId); } catch {}
      try { db.prepare('DELETE FROM annotations WHERE authorId = ?').run(studentId); } catch {}
      try { db.prepare('DELETE FROM moderated_grades WHERE graderId = ?').run(studentId); } catch {}
      db.prepare('DELETE FROM students WHERE id = ?').run(studentId);
    });

    deleteTransaction();
    res.json({ success: true, message: `All data for student ${studentId} has been deleted.` });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

async function runBulkProvisioningTask(payload = {}, scope = {}) {
  const {
    districtId = '',
    subAccountId = '',
    schoolId = '',
    teachers = [],
    classes = [],
    students = [],
    enrollments = [],
    dryRun = false,
  } = payload || {};

  const result = {
    teachers: { created: 0, existing: 0, errors: [] },
    classes: { created: 0, updated: 0, errors: [] },
    students: { created: 0, existing: 0, errors: [] },
    enrollments: { linked: 0, errors: [] },
    dryRun: !!dryRun,
  };

  for (const t of teachers) {
    const username = String(t?.username || '').trim();
    const password = String(t?.password || '').trim() || 'Teacher123!';
    if (!username) {
      result.teachers.errors.push('Teacher username required.');
      continue;
    }
    const existing = findTeacher(username);
    if (existing) result.teachers.existing++;
    else if (!dryRun) {
      const add = await addTeacher(username, password);
      if (add.success) result.teachers.created++;
      else result.teachers.errors.push(`${username}: ${add.error}`);
    } else result.teachers.created++;
  }

  const byTeacher = new Map();
  for (const c of classes) {
    const teacher = String(c?.teacher || '').trim();
    if (!teacher || !c?.id) {
      result.classes.errors.push(`Invalid class payload: ${JSON.stringify(c)}`);
      continue;
    }
    const scopedClass = { ...c, districtId, subAccountId, schoolId };
    byTeacher.set(teacher, [...(byTeacher.get(teacher) || []), scopedClass]);
  }
  for (const [teacher, incoming] of byTeacher.entries()) {
    const existing = getClassesByTeacher(teacher);
    const map = new Map(existing.map((c) => [c.id, c]));
    for (const c of incoming) {
      const prev = map.get(c.id);
      if (prev) result.classes.updated++;
      else result.classes.created++;
      map.set(c.id, { ...prev, ...c });
    }
    if (!dryRun) saveClassesForTeacher(teacher, [...map.values()]);
  }

  const currentStudents = getStudents();
  for (const s of students) {
    const username = String(s?.username || '').trim();
    const displayName = String(s?.displayName || username || 'Student').trim();
    const classCode = String(s?.classCode || '').trim() || undefined;
    const password = String(s?.password || '').trim() || 'student1234';
    if (!username) {
      result.students.errors.push('Student username required.');
      continue;
    }
    const existing = currentStudents.find((x) => x.username === username);
    if (existing) {
      result.students.existing++;
      continue;
    }
    if (!dryRun) {
      const add = await addStudent({ username, password, displayName, classCode });
      if (add.success) result.students.created++;
      else result.students.errors.push(`${username}: ${add.error}`);
    } else result.students.created++;
  }

  if (enrollments.length > 0) {
    const studentsNow = getStudents();
    for (const e of enrollments) {
      const classId = String(e?.classId || '').trim();
      const studentUsername = String(e?.studentUsername || '').trim();
      if (!classId || !studentUsername) {
        result.enrollments.errors.push(`Invalid enrollment payload: ${JSON.stringify(e)}`);
        continue;
      }
      const classMeta = getClassMetaById(classId);
      if (!classMeta) {
        result.enrollments.errors.push(`Class not found: ${classId}`);
        continue;
      }
      if (!hasScopeForClass(scope, classMeta)) {
        result.enrollments.errors.push(`Out of scope class: ${classId}`);
        continue;
      }
      const student = studentsNow.find((x) => x.username === studentUsername);
      if (!student) {
        result.enrollments.errors.push(`Student not found: ${studentUsername}`);
        continue;
      }
      if (!dryRun) {
        db.prepare('INSERT OR IGNORE INTO student_classes (studentId, classId) VALUES (?, ?)').run(student.id, classId);
      }
      result.enrollments.linked++;
    }
  }

  return result;
}

async function runRosterSyncTask({ classId, students = [], mode = 'upsert', deactivateMissing = false, dryRun = false } = {}, scope = {}) {
  const normalizedMode = String(mode || 'upsert').toLowerCase();
  const hardDeactivate = deactivateMissing === true || normalizedMode === 'full';
  const classMeta = getClassMetaById(classId);
  if (!classMeta) throw new Error('Class not found.');
  if (!hasScopeForClass(scope, classMeta)) throw new Error('Forbidden: outside district/sub-account/school scope.');

  const rows = Array.isArray(students) ? students : [];
  if (rows.length === 0) throw new Error('students[] required.');

  const summary = { created: 0, existing: 0, enrolled: 0, deactivated: 0, errors: [] };
  const existingStudents = getStudents();
  const activeIds = new Set();

  for (const r of rows) {
    const username = String(r?.username || r?.email || '').trim().toLowerCase();
    const displayName = String(r?.displayName || r?.name || username || 'Student').trim();
    if (!username) {
      summary.errors.push(`Invalid row: ${JSON.stringify(r)}`);
      continue;
    }
    let stu = existingStudents.find((s) => s.username.toLowerCase() === username);
    if (!stu) {
      const add = await addStudent({ username, password: 'student1234', displayName });
      if (!add.success) {
        summary.errors.push(`${username}: ${add.error}`);
        continue;
      }
      summary.created++;
      stu = add.student;
    } else {
      summary.existing++;
    }

    if (!dryRun) {
      db.prepare('INSERT OR IGNORE INTO student_classes (studentId, classId) VALUES (?, ?)').run(stu.id, classId);
    }
    activeIds.add(stu.id);
    summary.enrolled++;
  }

  if (hardDeactivate && !dryRun) {
    const inClass = getStudents().filter((s) => (s.classIds || []).includes(classId));
    for (const stu of inClass) {
      if (!activeIds.has(stu.id)) {
        db.prepare('DELETE FROM student_classes WHERE studentId = ? AND classId = ?').run(stu.id, classId);
        summary.deactivated++;
      }
    }
  }

  return { classId, classMeta, mode: normalizedMode, deactivateMissing: hardDeactivate, dryRun: !!dryRun, summary };
}

jobQueue.registerHandler('admin.provisioning.bulk', async (payload, meta) => {
  const scope = meta?.scope || {};
  const result = await runBulkProvisioningTask(payload, scope);
  return { success: true, result };
});

jobQueue.registerHandler('admin.roster.sync', async (payload, meta) => {
  const scope = meta?.scope || {};
  const result = await runRosterSyncTask(payload, scope);
  return { success: true, ...result };
});

app.get('/api/admin/scopes/:username', requireAdminCapability('canManageUsers'), (req, res) => {
  const target = req.params.username;
  const scope = getAdminScope(target);
  res.json({ success: true, username: target, scope });
});

app.get('/api/admin/scopes/me', requireAdmin, (req, res) => {
  const scope = req.user?.scope || getAdminScope(req.user.username);
  res.json({ success: true, username: req.user.username, scope });
});

app.put('/api/admin/scopes/:username', requireAdminCapability('canManageUsers'), (req, res) => {
  const target = req.params.username;
  const updated = setAdminScope(target, req.body?.scope || {});
  res.json({ success: true, username: target, scope: updated });
});

app.post('/api/admin/provisioning/bulk', requireAdminCapability('canProvision'), asyncHandler(async (req, res) => {
  const scope = req.user?.scope || getAdminScope(req.user.username);
  const enqueue = req.query.async === '1' || req.body?.enqueue === true;
  if (enqueue) {
    const job = jobQueue.enqueue('admin.provisioning.bulk', req.body || {}, {
      requestedBy: req.user.username,
      scope,
      maxAttempts: Number(req.body?.maxAttempts || 3),
    });
    return res.status(202).json({ success: true, queued: true, jobId: job.id, job });
  }

  const result = await runBulkProvisioningTask(req.body || {}, scope);
  res.json({ success: true, queued: false, result });
}));

app.post('/api/admin/roster/sync/:classId', requireAdminCapability('canSyncRoster'), requireAdminClassScope(), asyncHandler(async (req, res) => {
  const classId = req.params.classId;
  const scope = req.user?.scope || getAdminScope(req.user.username);
  const payload = {
    classId,
    students: Array.isArray(req.body?.students) ? req.body.students : [],
    mode: req.body?.mode || 'upsert',
    deactivateMissing: req.body?.deactivateMissing === true,
    dryRun: req.body?.dryRun === true,
  };
  const enqueue = req.query.async === '1' || req.body?.enqueue === true;
  if (enqueue) {
    const job = jobQueue.enqueue('admin.roster.sync', payload, {
      requestedBy: req.user.username,
      scope,
      maxAttempts: Number(req.body?.maxAttempts || 3),
    });
    return res.status(202).json({ success: true, queued: true, jobId: job.id, job });
  }

  const out = await runRosterSyncTask(payload, scope);
  res.json({ success: true, queued: false, ...out });
}));

function toCSV(rows = []) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => esc(row[h])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

app.get('/api/admin/standards/:owner', requireAdmin, (req, res) => {
  const owner = String(req.params.owner || '').trim();
  if (!owner) return res.status(400).json({ success: false, error: 'owner is required.' });
  const standards = getStandardsByOwner(owner);
  res.json({ success: true, owner, standards, count: standards.length });
});

app.put('/api/admin/standards/:owner', requireAdmin, (req, res) => {
  const owner = String(req.params.owner || '').trim();
  if (!owner) return res.status(400).json({ success: false, error: 'owner is required.' });
  const standards = Array.isArray(req.body?.standards) ? req.body.standards : [];
  const out = replaceStandardsForOwner(owner, standards);
  if (!out.success) return res.status(400).json(out);
  res.json({ success: true, owner, standards: out.standards, count: out.standards.length });
});

app.get('/api/admin/district-hierarchy', requireAdmin, (req, res) => {
  const scope = req.user?.scope || getAdminScope(req.user.username);
  const data = getDistrictHierarchy('global');
  const districts = Array.isArray(data?.districts) ? data.districts : [];
  const filtered = isScopedAdmin(scope)
    ? districts.filter((d) => hasScopeForDistrict(scope, d))
    : districts;
  res.json({ success: true, hierarchy: { ...data, districts: filtered } });
});

app.put('/api/admin/district-hierarchy', requireAdmin, (req, res) => {
  const scope = req.user?.scope || getAdminScope(req.user.username);
  const incoming = req.body?.hierarchy || {};
  const incomingDistricts = Array.isArray(incoming?.districts) ? incoming.districts : [];
  const existing = getDistrictHierarchy('global');
  const existingDistricts = Array.isArray(existing?.districts) ? existing.districts : [];

  if (!isScopedAdmin(scope)) {
    const saved = saveDistrictHierarchy({ districts: incomingDistricts }, 'global');
    return res.json({ success: true, hierarchy: saved.data });
  }

  const outOfScopePayload = incomingDistricts.filter((d) => !hasScopeForDistrict(scope, d));
  if (outOfScopePayload.length > 0) {
    return res.status(403).json({
      success: false,
      error: 'Payload includes district entries outside admin scope.',
      districtIds: outOfScopePayload.map((d) => d?.id).filter(Boolean),
    });
  }

  const incomingById = new Map(incomingDistricts.map((d) => [String(d.id || ''), d]));
  const merged = existingDistricts.map((d) => {
    if (!hasScopeForDistrict(scope, d)) return d;
    const replacement = incomingById.get(String(d.id || ''));
    return replacement ? replacement : d;
  });
  for (const d of incomingDistricts) {
    const id = String(d.id || '');
    if (!id) continue;
    const exists = merged.some((x) => String(x.id || '') === id);
    if (!exists && hasScopeForDistrict(scope, d)) merged.push(d);
  }

  const saved = saveDistrictHierarchy({ districts: merged }, 'global');
  const filtered = (Array.isArray(saved.data?.districts) ? saved.data.districts : [])
    .filter((d) => hasScopeForDistrict(scope, d));
  res.json({ success: true, hierarchy: { ...saved.data, districts: filtered } });
});

app.get('/api/admin/classes', requireAdmin, (req, res) => {
  const scope = req.user?.scope || getAdminScope(req.user.username);
  const districtId = String(req.query.districtId || '').trim();
  const schoolId = String(req.query.schoolId || '').trim();
  const teacher = String(req.query.teacher || '').trim();
  const classes = listAllClasses()
    .filter((c) => hasScopeForClass(scope, c))
    .filter((c) => (districtId ? String(c.districtId || '') === districtId : true))
    .filter((c) => (schoolId ? String(c.schoolId || '') === schoolId : true))
    .filter((c) => (teacher ? String(c.teacher || '') === teacher : true));
  return res.json({ success: true, classes, count: classes.length });
});

app.put('/api/admin/classes/:classId/meta', requireAdmin, requireAdminClassScope(), (req, res) => {
  const classId = String(req.params.classId || '').trim();
  const current = getClassById(classId);
  if (!current) return res.status(404).json({ success: false, error: 'Class not found.' });
  const patch = req.body?.meta || {};
  const allowedFields = new Set(['districtId', 'districtName', 'subAccountId', 'subAccountName', 'schoolId', 'schoolName']);
  const cleanPatch = {};
  for (const [k, v] of Object.entries(patch || {})) {
    if (allowedFields.has(k)) cleanPatch[k] = v == null ? '' : String(v);
  }
  const next = { ...current, ...cleanPatch, id: classId };
  db.prepare('UPDATE classes SET data = ? WHERE id = ?').run(JSON.stringify(next), classId);
  return res.json({ success: true, class: next });
});

app.get('/api/admin/onboarding/report', requireAdmin, (req, res) => {
  const scope = req.user?.scope || getAdminScope(req.user.username);
  const districtId = String(req.query.districtId || '').trim();
  const owner = String(req.query.owner || '').trim();
  const classId = String(req.query.classId || '').trim();
  const format = String(req.query.format || 'json').toLowerCase();
  if (districtId) {
    const hierarchy = getDistrictHierarchy('global');
    const districts = Array.isArray(hierarchy?.districts) ? hierarchy.districts : [];
    const district = districts.find((d) => String(d.id) === districtId);
    if (!district) return res.status(404).json({ success: false, error: 'District not found.' });
    if (!hasScopeForDistrict(scope, district)) {
      return res.status(403).json({ success: false, error: 'Forbidden: district outside admin scope.' });
    }
  }
  const report = computeOnboardingReport({ districtId, owner, classId }, scope);

  if (format === 'csv') {
    const filename = `onboarding-report-${districtId || 'district'}-${Date.now()}.csv`;
    const rows = Object.entries(report.checks).map(([checkId, ok]) => ({
      check: checkId,
      status: ok ? 'pass' : 'fail',
      districtId: report.districtId,
      owner: report.owner,
      classId: report.classId,
      scorePct: report.scorePct,
      generatedAt: report.generatedAt,
    }));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(toCSV(rows));
  }

  return res.json({ success: true, report });
});

app.put('/api/admin/onboarding/ready/:districtId', requireAdmin, (req, res) => {
  const districtId = String(req.params.districtId || '').trim();
  if (!districtId) return res.status(400).json({ success: false, error: 'districtId is required.' });

  const scope = req.user?.scope || getAdminScope(req.user.username);
  const owner = String(req.body?.owner || '').trim();
  const classId = String(req.body?.classId || '').trim();
  const notes = String(req.body?.notes || '').trim();
  const report = computeOnboardingReport({ districtId, owner, classId }, scope);

  if (!report.readyToMark) {
    return res.status(400).json({
      success: false,
      error: 'Blocking checks failed. District cannot be marked ready yet.',
      report,
    });
  }

  const hierarchy = getDistrictHierarchy('global');
  const districts = Array.isArray(hierarchy?.districts) ? hierarchy.districts : [];
  const idx = districts.findIndex((d) => String(d.id) === districtId);
  if (idx === -1) return res.status(404).json({ success: false, error: 'District not found.' });
  if (!hasScopeForDistrict(scope, districts[idx])) {
    return res.status(403).json({ success: false, error: 'Forbidden: district outside admin scope.' });
  }

  const nowIso = new Date().toISOString();
  const nextDistricts = [...districts];
  const existingOnboarding = nextDistricts[idx]?.onboarding || {};
  const existingHistory = Array.isArray(existingOnboarding.history) ? existingOnboarding.history : [];
  const historyEntry = {
    id: `ob-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: nowIso,
    actor: req.user.username,
    action: 'mark-ready',
    owner,
    classId,
    scorePct: report.scorePct,
    notes,
  };
  nextDistricts[idx] = {
    ...nextDistricts[idx],
    onboarding: {
      ...existingOnboarding,
      ready: true,
      readyAt: nowIso,
      readyBy: req.user.username,
      owner,
      classId,
      scorePct: report.scorePct,
      notes,
      history: [historyEntry, ...existingHistory].slice(0, 200),
    },
  };
  const saved = saveDistrictHierarchy({ ...hierarchy, districts: nextDistricts }, 'global');
  return res.json({
    success: true,
    message: 'District marked onboarding-ready.',
    districtId,
    onboarding: nextDistricts[idx].onboarding,
    hierarchy: saved.data,
    report,
  });
});

app.put('/api/admin/onboarding/not-ready/:districtId', requireAdmin, (req, res) => {
  const districtId = String(req.params.districtId || '').trim();
  if (!districtId) return res.status(400).json({ success: false, error: 'districtId is required.' });

  const hierarchy = getDistrictHierarchy('global');
  const districts = Array.isArray(hierarchy?.districts) ? hierarchy.districts : [];
  const idx = districts.findIndex((d) => String(d.id) === districtId);
  if (idx === -1) return res.status(404).json({ success: false, error: 'District not found.' });
  const scope = req.user?.scope || getAdminScope(req.user.username);
  if (!hasScopeForDistrict(scope, districts[idx])) {
    return res.status(403).json({ success: false, error: 'Forbidden: district outside admin scope.' });
  }

  const owner = String(req.body?.owner || '').trim();
  const classId = String(req.body?.classId || '').trim();
  const notes = String(req.body?.notes || '').trim();
  const nowIso = new Date().toISOString();
  const nextDistricts = [...districts];
  const existingOnboarding = nextDistricts[idx]?.onboarding || {};
  const existingHistory = Array.isArray(existingOnboarding.history) ? existingOnboarding.history : [];
  const historyEntry = {
    id: `ob-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: nowIso,
    actor: req.user.username,
    action: 'mark-not-ready',
    owner,
    classId,
    notes,
  };

  nextDistricts[idx] = {
    ...nextDistricts[idx],
    onboarding: {
      ...existingOnboarding,
      ready: false,
      readyAt: null,
      readyBy: '',
      owner: owner || existingOnboarding.owner || '',
      classId: classId || existingOnboarding.classId || '',
      notes,
      history: [historyEntry, ...existingHistory].slice(0, 200),
    },
  };
  const saved = saveDistrictHierarchy({ ...hierarchy, districts: nextDistricts }, 'global');
  return res.json({
    success: true,
    message: 'District marked not-ready.',
    districtId,
    onboarding: nextDistricts[idx].onboarding,
    hierarchy: saved.data,
  });
});

app.get('/api/admin/onboarding/history/:districtId', requireAdmin, (req, res) => {
  const districtId = String(req.params.districtId || '').trim();
  if (!districtId) return res.status(400).json({ success: false, error: 'districtId is required.' });
  const hierarchy = getDistrictHierarchy('global');
  const districts = Array.isArray(hierarchy?.districts) ? hierarchy.districts : [];
  const district = districts.find((d) => String(d.id) === districtId);
  if (!district) return res.status(404).json({ success: false, error: 'District not found.' });
  const scope = req.user?.scope || getAdminScope(req.user.username);
  if (!hasScopeForDistrict(scope, district)) {
    return res.status(403).json({ success: false, error: 'Forbidden: district outside admin scope.' });
  }
  const onboarding = district.onboarding || {};
  const history = Array.isArray(onboarding.history) ? onboarding.history : [];
  return res.json({
    success: true,
    districtId,
    ready: !!onboarding.ready,
    readyAt: onboarding.readyAt || null,
    readyBy: onboarding.readyBy || '',
    history,
    count: history.length,
  });
});

app.get('/api/admin/standards-mappings/:owner', requireAdmin, (req, res) => {
  const owner = String(req.params.owner || '').trim();
  if (!owner) return res.status(400).json({ success: false, error: 'owner is required.' });
  const scope = req.user?.scope || getAdminScope(req.user.username);
  const raw = getStandardMappingsByOwner(owner, {
    classId: req.query.classId ? String(req.query.classId) : '',
    assignmentId: req.query.assignmentId ? String(req.query.assignmentId) : '',
  });
  const mappings = raw.filter((m) => {
    const meta = getClassMetaById(m.classId);
    return meta ? hasScopeForClass(scope, meta) : false;
  });
  res.json({ success: true, owner, mappings, count: mappings.length });
});

app.put('/api/admin/standards-mappings/:owner', requireAdmin, (req, res) => {
  const owner = String(req.params.owner || '').trim();
  if (!owner) return res.status(400).json({ success: false, error: 'owner is required.' });
  const scope = req.user?.scope || getAdminScope(req.user.username);
  const mappings = Array.isArray(req.body?.mappings) ? req.body.mappings : [];
  const errors = validateMappingsForOwner(owner, mappings, scope);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: 'Invalid mappings payload.', errors });
  }
  const out = replaceStandardMappingsForOwner(owner, mappings);
  if (!out.success) return res.status(400).json(out);
  const filtered = out.mappings.filter((m) => {
    const meta = getClassMetaById(m.classId);
    return meta ? hasScopeForClass(scope, meta) : false;
  });
  res.json({ success: true, owner, mappings: filtered, count: filtered.length });
});

app.get('/api/admin/mastery-dashboard/:owner', requireAdmin, (req, res) => {
  const owner = String(req.params.owner || '').trim();
  if (!owner) return res.status(400).json({ success: false, error: 'owner is required.' });
  const scope = req.user?.scope || getAdminScope(req.user.username);
  const level = req.query.level ? String(req.query.level) : 'class';
  const scopeValue = req.query.scopeValue ? String(req.query.scopeValue) : '';
  const format = req.query.format ? String(req.query.format) : 'json';
  const out = getMasteryDashboard(owner, { level, scopeValue });
  const rows = filterRowsByAdminScope(out.rows || [], scope);
  const summary = summarizeMasteryRows(rows);
  if (format === 'csv') {
    const filename = `mastery-${owner}-${level}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(toCSV(rows));
  }
  return res.json({ success: true, owner, level, scopeValue, rows, summary });
});

app.get('/api/admin/jobs', requireAdmin, (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined;
  const type = req.query.type ? String(req.query.type) : undefined;
  const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 100));
  const jobs = jobQueue.list({ status, type, limit });
  res.json({ success: true, jobs, count: jobs.length });
});

app.get('/api/admin/jobs/:jobId', requireAdmin, (req, res) => {
  const job = jobQueue.get(req.params.jobId);
  if (!job) return res.status(404).json({ success: false, error: 'Job not found.' });
  res.json({ success: true, job });
});

app.get('/api/admin/jobs-stream', (req, res) => {
  let user = null;
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      user = verifyToken(authHeader.slice(7));
    } else if (req.query.token) {
      user = verifyToken(String(req.query.token));
    }
  } catch {
    user = null;
  }
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ success: false, error: 'Admin authentication required.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  send({ type: 'connected', at: new Date().toISOString() });

  const unsubscribe = jobQueue.subscribe((evt) => {
    send({ type: 'job', event: evt.action, job: evt.job, at: new Date().toISOString() });
  });

  const heartbeat = setInterval(() => {
    res.write(`: ping ${Date.now()}\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });
});

app.post('/api/admin/jobs/:jobId/retry', requireAdmin, (req, res) => {
  const retried = jobQueue.retry(req.params.jobId);
  if (!retried) return res.status(404).json({ success: false, error: 'Job not found.' });
  res.json({ success: true, job: retried });
});

app.post('/api/admin/jobs/:jobId/cancel', requireAdmin, (req, res) => {
  const cancelled = jobQueue.cancel(req.params.jobId, req.user?.username || 'admin');
  if (!cancelled) return res.status(404).json({ success: false, error: 'Job not found.' });
  res.json({ success: true, job: cancelled });
});

app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
  const limit = Math.max(10, Math.min(1000, Number(req.query.limit) || 200));
  const logs = readAuditLogs(limit);
  res.json({ success: true, logs });
});

app.post('/api/sre/alerts/check', requireAdmin, asyncHandler(async (req, res) => {
  const windowHours = Math.max(1, Math.min(24 * 30, Number(req.body?.windowHours) || 24));
  const cooldownMinutes = Math.max(1, Math.min(24 * 60, Number(req.body?.cooldownMinutes) || 15));
  const metricsPayload = getSREMetrics(windowHours);
  const result = await maybeSendSLOAlerts({
    metricsPayload,
    sloTargets: SLO_TARGETS,
    cooldownMinutes,
  });
  res.json({ success: true, ...result });
}));

// Quick test endpoint to verify API key works
app.get('/api/test-key', asyncHandler(async (req, res) => {
  if (!anthropic) {
    return res.json({ success: false, error: 'No Anthropic API key configured.' });
  }
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 20,
    messages: [{ role: 'user', content: 'Say hello in 3 words.' }],
  });
  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  res.json({ success: true, reply: text });
}));

// ─── End-to-End Course Generator (multi-step AI pipeline) ───────────
app.post('/api/generate-full-course', asyncHandler(async (req, res) => {
  if (!anthropic) return res.json({ success: false, error: 'AI not configured.' });

  const {
    courseName, description, gradeLevel, gradeId, teksStandards,
    learningOutcomes, numWeeks, classType, includeQuizzes, includeAssignments,
  } = req.body;

  const gradeLabel = gradeId === 'algebra' ? 'Algebra I'
    : gradeId === 'grade4' ? 'Grade 4'
    : gradeId === 'grade5' ? 'Grade 5'
    : 'Grade 3';

  const standardsList = (teksStandards || []).join(', ') || 'general math standards';
  const outcomesList = (learningOutcomes || []).join('\n- ') || 'age-appropriate math proficiency';
  const weeks = numWeeks || 4;

  // ── STEP 1: Generate course outline with structured units and lessons ──
  const outlineMsg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [{ role: 'user', content: `You are an expert Texas curriculum architect. Generate a complete ${weeks}-week course outline.

Course: ${courseName || 'Math Course'}
${description ? `Description: ${description}` : ''}
Grade: ${gradeLabel}
Type: ${classType || 'STAAR'} preparation
TEKS Standards: ${standardsList}

Learning outcomes:
- ${outcomesList}

Return ONLY valid JSON (no markdown fences):
{
  "courseTitle": "Course name",
  "overview": "2-3 sentence course description",
  "totalWeeks": ${weeks},
  "units": [
    {
      "unitNumber": 1,
      "title": "Unit title",
      "weekStart": 1,
      "weekEnd": 1,
      "focus": "What this unit covers",
      "teksAligned": ["3.4A", "3.4B"],
      "lessons": [
        {
          "lessonNumber": 1,
          "title": "Lesson title",
          "duration": "45 min",
          "objective": "Students will be able to...",
          "teksStandard": "3.4A",
          "bloomLevel": "apply",
          "activities": ["Activity 1", "Activity 2"],
          "materials": ["Material 1"],
          "assessment": "How learning is checked"
        }
      ]
    }
  ],
  "pacing": "Brief pacing guidance",
  "differentiationStrategy": "How to differentiate across the course"
}

Generate 3-5 lessons per unit, ${weeks <= 2 ? '1-2' : weeks <= 4 ? '2-4' : '4-6'} units total. Make it practical and classroom-ready.` }],
  });

  let outline;
  try {
    const outlineText = outlineMsg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    outline = JSON.parse(outlineText.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
  } catch (e) {
    return res.json({ success: false, error: 'Failed to parse course outline.', raw: outlineMsg.content });
  }

  // ── STEP 2: Generate detailed lesson plans for each lesson ──
  const allLessons = [];
  for (const unit of (outline.units || [])) {
    for (const lesson of (unit.lessons || [])) {
      allLessons.push({ ...lesson, unitTitle: unit.title, unitNumber: unit.unitNumber });
    }
  }

  const lessonBatches = [];
  const BATCH_SIZE = 4;
  for (let i = 0; i < allLessons.length; i += BATCH_SIZE) {
    lessonBatches.push(allLessons.slice(i, i + BATCH_SIZE));
  }

  const detailedLessons = [];
  for (const batch of lessonBatches) {
    const batchPromises = batch.map((lesson) =>
      anthropic.messages.create({
        model: MODEL,
        max_tokens: 1500,
        messages: [{ role: 'user', content: `Create a detailed lesson plan. Return ONLY valid JSON (no markdown fences).

Grade: ${gradeLabel} | TEKS: ${lesson.teksStandard || standardsList}
Lesson: "${lesson.title}" (${lesson.duration || '45 min'})
Objective: ${lesson.objective}
Bloom's Level: ${lesson.bloomLevel || 'apply'}

{
  "title": "${lesson.title}",
  "objective": "...",
  "teksStandard": "${lesson.teksStandard || ''}",
  "duration": "${lesson.duration || '45 min'}",
  "warmUp": {"activity": "...", "duration": "5 min", "description": "..."},
  "directInstruction": {"duration": "15 min", "steps": ["Step 1...", "Step 2..."], "keyVocabulary": ["term1"]},
  "guidedPractice": {"duration": "10 min", "activity": "...", "description": "..."},
  "independentPractice": {"duration": "10 min", "activity": "...", "suggestedGame": "Math Sprint or similar"},
  "closure": {"duration": "5 min", "exitTicket": "1-2 question check", "reflection": "..."},
  "differentiation": {"approaching": "...", "onLevel": "...", "advanced": "..."},
  "materials": ["item1", "item2"]
}` }],
      }).then((msg) => {
        const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
        try {
          return { ...JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()), _unit: lesson.unitNumber, _lessonNum: lesson.lessonNumber };
        } catch {
          return { title: lesson.title, objective: lesson.objective, _unit: lesson.unitNumber, _lessonNum: lesson.lessonNumber, _raw: text };
        }
      })
    );
    const results = await Promise.all(batchPromises);
    detailedLessons.push(...results);
  }

  // ── STEP 3: Generate quiz questions per unit (if requested) ──
  const unitQuizzes = [];
  if (includeQuizzes !== false) {
    for (const unit of (outline.units || [])) {
      const teksForUnit = (unit.teksAligned || []).join(', ') || standardsList;
      const quizMsg = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: 'user', content: `Generate a unit quiz. Return ONLY valid JSON (no markdown fences).

Grade: ${gradeLabel} | Unit: "${unit.title}" | TEKS: ${teksForUnit}
Topics covered: ${(unit.lessons || []).map((l) => l.title).join(', ')}

{
  "unitNumber": ${unit.unitNumber},
  "quizTitle": "Unit ${unit.unitNumber} Quiz: ${unit.title}",
  "instructions": "Answer all questions. Show your work where applicable.",
  "questions": [
    {"id": 1, "type": "multiple-choice", "question": "...", "options": {"A":"...","B":"...","C":"...","D":"..."}, "correct": "A", "teks": "3.4A", "bloom": "apply", "points": 2},
    {"id": 2, "type": "true-false", "statement": "...", "correct": true, "explanation": "...", "teks": "3.4A", "bloom": "remember", "points": 1},
    {"id": 3, "type": "open-ended", "question": "...", "rubric": "...", "sampleAnswer": "...", "teks": "3.4B", "bloom": "analyze", "points": 3}
  ],
  "totalPoints": 20
}

Generate 8-10 questions mixing types. Align to TEKS. Vary Bloom's levels.` }],
      });
      try {
        const text = quizMsg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
        unitQuizzes.push(JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()));
      } catch {
        unitQuizzes.push({ unitNumber: unit.unitNumber, quizTitle: `Unit ${unit.unitNumber} Quiz`, questions: [] });
      }
    }
  }

  // ── STEP 4: Generate suggested game assignments (if requested) ──
  let suggestedAssignments = [];
  if (includeAssignments !== false) {
    const assignMsg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: `Suggest game-based assignments for this course. Return ONLY valid JSON (no markdown fences).

Grade: ${gradeLabel} | Course: "${courseName || 'Math Course'}"
TEKS: ${standardsList}
Available games: Math Match (matching equations), Math Sprint (timed drills), Algebra Sprint (equation solving), Q-Blocks (spatial reasoning), TEKS Crush (standards review), Math Jeopardy (competitive review), Math Bingo (number recognition)

Units: ${(outline.units || []).map((u) => `Unit ${u.unitNumber}: ${u.title} (${(u.teksAligned || []).join(', ')})`).join('; ')}

[
  {"unitNumber": 1, "gameName": "Math Sprint", "gameId": "math-sprint", "gamePath": "/games/math-sprint", "purpose": "Why this game for this unit", "teks": ["3.4A"], "suggestedWhen": "After lesson 2"},
]

Suggest 1-2 games per unit. Match game mechanics to learning goals.` }],
    });
    try {
      const text = assignMsg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
      suggestedAssignments = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    } catch { /* assignments are optional */ }
  }

  // ── STEP 5: Assemble the complete course ──
  const modules = (outline.units || []).map((unit) => ({
    unitNumber: unit.unitNumber,
    title: unit.title,
    weekStart: unit.weekStart,
    weekEnd: unit.weekEnd,
    focus: unit.focus,
    teksAligned: unit.teksAligned || [],
    lessons: detailedLessons
      .filter((l) => l._unit === unit.unitNumber)
      .sort((a, b) => (a._lessonNum || 0) - (b._lessonNum || 0))
      .map(({ _unit, _lessonNum, _raw, ...rest }) => rest),
    quiz: unitQuizzes.find((q) => q.unitNumber === unit.unitNumber) || null,
    assignments: (suggestedAssignments || []).filter((a) => a.unitNumber === unit.unitNumber),
  }));

  res.json({
    success: true,
    course: {
      title: outline.courseTitle || courseName,
      overview: outline.overview,
      totalWeeks: outline.totalWeeks || weeks,
      gradeLevel: gradeLabel,
      gradeId,
      teksStandards: teksStandards || [],
      classType: classType || 'staar',
      pacing: outline.pacing,
      differentiationStrategy: outline.differentiationStrategy,
      modules,
      totalLessons: detailedLessons.length,
      totalQuizQuestions: unitQuizzes.reduce((sum, q) => sum + (q.questions || []).length, 0),
      totalAssignments: (suggestedAssignments || []).length,
      generatedAt: new Date().toISOString(),
    },
  });
}));

// ════════════════════════════════════════════════════════════════
//  GRADE POSTING POLICIES
// ════════════════════════════════════════════════════════════════

app.post('/api/auth/assignments/:id/post-grades', requireTeacherOrTA, (req, res) => {
  try {
    const username = req.user.username;
    const assignmentId = req.params.id;
    const assignments = getAssignmentsByTeacher(username);
    const target = assignments.find(a => a.id === assignmentId);
    if (!target) return res.json({ success: false, error: 'Assignment not found.' });
    target.gradesPosted = true;
    target.postedAt = new Date().toISOString();
    saveAssignmentsForTeacher(username, assignments);
    res.json({ success: true, assignmentId, postedAt: target.postedAt });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.post('/api/auth/assignments/:id/hide-grades', requireTeacherOrTA, (req, res) => {
  try {
    const username = req.user.username;
    const assignmentId = req.params.id;
    const assignments = getAssignmentsByTeacher(username);
    const target = assignments.find(a => a.id === assignmentId);
    if (!target) return res.json({ success: false, error: 'Assignment not found.' });
    target.gradesPosted = false;
    target.postedAt = null;
    saveAssignmentsForTeacher(username, assignments);
    res.json({ success: true, assignmentId });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  PEER REVIEWS
// ════════════════════════════════════════════════════════════════

app.post('/api/peer-reviews/assign', requireTeacher, (req, res) => {
  try {
    const { assignmentId, classId, anonymous, rubric, studentIds } = req.body;
    if (!assignmentId || !classId) return res.json({ success: false, error: 'assignmentId and classId required.' });
    const result = createPeerReviewAssignment({ assignmentId, classId, anonymous, rubric, studentIds });
    const pairings = (result.reviews || []).map(r => ({
      reviewer: r.reviewerStudentId,
      reviewee: r.revieweeStudentId,
      reviewerName: r.reviewerStudentId,
      revieweeName: r.revieweeStudentId,
      status: r.status || 'pending',
      id: r.id,
    }));
    res.json({ ...result, pairings });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/peer-reviews/review/:id', requireAuth, (req, res) => {
  try {
    const review = getPeerReviewById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found.' });
    res.json({ success: true, ...review });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/peer-reviews/:assignmentId', requireAuth, (req, res) => {
  try {
    const data = getPeerReviewAssignment(req.params.assignmentId);
    if (!data) return res.json({ success: true, peerReview: null, reviews: [], pairings: [] });
    const pairings = (data.reviews || []).map(r => ({
      reviewer: r.reviewerStudentId,
      reviewee: r.revieweeStudentId,
      reviewerName: r.reviewerStudentId,
      revieweeName: r.revieweeStudentId,
      status: r.status || 'pending',
      id: r.id,
    }));
    res.json({ success: true, peerReview: data, reviews: data.reviews, pairings });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.put('/api/peer-reviews/:id/submit', requireAuth, (req, res) => {
  try {
    const { score, feedback, rubricScores } = req.body;
    const result = submitPeerReview(req.params.id, { score, feedback, rubricScores });
    res.json(result);
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/peer-reviews/student/:studentId', requireAuth, (req, res) => {
  try {
    const reviews = getPeerReviewsForStudent(req.params.studentId);
    res.json({ success: true, reviews });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  STUDENT GROUPS
// ════════════════════════════════════════════════════════════════

app.post('/api/classes/:classId/groups', requireTeacher, (req, res) => {
  try {
    const result = createGroup(req.params.classId, req.body.name);
    res.json(result);
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/classes/:classId/groups', requireAuth, (req, res) => {
  try {
    const groups = getGroupsByClass(req.params.classId);
    res.json({ success: true, groups });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.put('/api/groups/:id/members', requireTeacher, (req, res) => {
  try {
    const result = setGroupMembers(req.params.id, req.body.studentIds);
    res.json(result);
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.delete('/api/groups/:id', requireTeacher, (req, res) => {
  try {
    const result = deleteGroup(req.params.id);
    res.json(result);
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.post('/api/classes/:classId/invite-ta', requireTeacher, (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.json({ success: false, error: 'username required.' });
    const result = addTAToClass(username.trim(), req.params.classId);
    res.json(result);
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.delete('/api/classes/:classId/tas/:username', requireTeacher, (req, res) => {
  try {
    const result = removeTAFromClass(req.params.username, req.params.classId);
    res.json(result);
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/classes/:classId/tas', requireTeacherOrTA, (req, res) => {
  try {
    const tas = getTAsForClass(req.params.classId);
    res.json({ success: true, tas });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  ANNOUNCEMENT READ TRACKING
// ════════════════════════════════════════════════════════════════

app.post('/api/announcements/:id/mark-read', requireAuth, (req, res) => {
  try {
    const userId = req.user.studentId || req.user.username;
    markAnnouncementRead(req.params.id, userId);
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/announcements/:id/reads', requireAuth, (req, res) => {
  try {
    const reads = getAnnouncementReads(req.params.id);
    const count = getAnnouncementReadCount(req.params.id);
    res.json({ success: true, reads, count });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  STUDENT ACTIVITY LOG
// ════════════════════════════════════════════════════════════════

app.post('/api/activity/log', requireAuth, (req, res) => {
  try {
    const entries = Array.isArray(req.body.entries) ? req.body.entries : [req.body];
    const userId = req.user.studentId || req.user.username;
    const userRole = req.user.role || 'student';
    const stamped = entries.map(e => ({ ...e, userId, userRole }));
    const result = logActivity(stamped);
    res.json(result);
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/activity/user/:userId', requireAuth, (req, res) => {
  try {
    const logs = getActivityByUser(req.params.userId, Number(req.query.limit) || 100);
    const summary = getActivitySummary(req.params.userId);
    res.json({ success: true, logs, summary });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/activity/class/:classId', requireTeacher, (req, res) => {
  try {
    const logs = getClassActivityLog(req.params.classId, Number(req.query.limit) || 500);
    const timeOnTask = getTimeOnResource('class', req.params.classId);
    res.json({ success: true, logs, timeOnTask });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  ICAL CALENDAR EXPORT
// ════════════════════════════════════════════════════════════════

app.get('/api/calendar/ical-token', requireAuth, (req, res) => {
  try {
    const userId = req.user.studentId || req.user.username;
    const userRole = req.user.role || 'teacher';
    const token = getOrCreateIcalToken(userId, userRole);
    res.json({ success: true, token, url: `/api/calendar/ical/${token}` });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.post('/api/calendar/ical-revoke', requireAuth, (req, res) => {
  try {
    const userId = req.user.studentId || req.user.username;
    revokeIcalToken(userId);
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

app.get('/api/calendar/ical/:token', (req, res) => {
  try {
    const record = resolveIcalToken(req.params.token);
    if (!record) return res.status(404).send('Invalid or revoked token.');
    const { userId, userRole } = record;
    let assignments = [];
    if (userRole === 'teacher') {
      assignments = getAssignmentsByTeacher(userId);
    } else {
      const stu = db.prepare('SELECT classId FROM student_classes WHERE studentId = ?').all(userId);
      for (const { classId } of stu) {
        const rows = db.prepare('SELECT data FROM assignments WHERE classId = ?').all(classId);
        assignments.push(...rows.map(r => JSON.parse(r.data)));
      }
    }
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const fmtDate = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
    let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//AllenAce//LMS//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n';
    for (const a of assignments) {
      if (!a.dueDate) continue;
      const due = new Date(a.dueDate);
      if (isNaN(due.getTime())) continue;
      const uid = `${a.id}@allenace`;
      ics += `BEGIN:VEVENT\r\nUID:${uid}\r\nDTSTAMP:${fmtDate(now)}\r\nDTSTART:${fmtDate(due)}\r\nSUMMARY:${(a.name || a.title || 'Assignment').replace(/[\r\n]/g, ' ')}\r\nDESCRIPTION:Due for ${a.classId || 'class'}\r\nEND:VEVENT\r\n`;
    }
    ics += 'END:VCALENDAR\r\n';
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="allen-ace.ics"');
    res.send(ics);
  } catch (err) {
    res.status(500).send('Error generating calendar.');
  }
});

// ════════════════════════════════════════════════════════════════
//  GLOBAL SEARCH
// ════════════════════════════════════════════════════════════════

app.get('/api/search', requireAuth, (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ success: true, results: { classes: [], assignments: [], students: [], wiki: [] } });
    const teacher = req.user.role === 'admin' ? undefined : req.user.username;
    const results = globalSearch(q, { teacher, limit: Number(req.query.limit) || 30 });
    res.json({ success: true, results });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// Serve the built frontend (if dist/ exists after `npm run build`)
const distPath = path.join(__dirname, '..', 'dist');
const distExists = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));
if (distExists) {
  app.use(express.static(distPath, {
    maxAge: 0,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    },
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    if (req.query.lti === '1' || req.path === '/lti-launch') {
      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Security-Policy', "frame-ancestors *;");
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('[startup] dist/ not found — frontend will not be served. Run "npm run build" or set a Build Command on Render.');
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.status(200).send('<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>API Server Running</h2><p>The frontend has not been built yet. Run <code>npm run build</code> or configure the Build Command on Render.</p><p><a href="/api/health">API Health Check</a></p></body></html>');
  });
}

// Express error-handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Express error middleware caught:', err);
  if (!res.headersSent) {
    res.status(500).json({ success: false, error: extractErrorMessage(err) });
  }
});

// Catch unhandled rejections/exceptions so the server doesn't crash
process.on('unhandledRejection', (reason) => {
  console.error('[fatal] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught Exception:', err);
  // Don't exit — keep the server alive so health/billing endpoints still work
});

try {
  validateProductionEnv();
} catch (err) {
  console.error('[startup] validateProductionEnv error (non-fatal):', err.message);
}

const PORT = process.env.PORT || 3001;
let httpServer;
let io;
try {
  httpServer = http.createServer(app);
  io = initSocketIO(httpServer);
  console.log('Socket.IO real-time server initialized.');
} catch (err) {
  console.error('[startup] Socket.IO init failed (non-fatal):', err.message);
  httpServer = httpServer || http.createServer(app);
}

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!hasValidKey) {
    console.warn('WARNING: ANTHROPIC_API_KEY missing or placeholder. Add your key to .env');
  } else {
    console.log('Anthropic API key loaded. AI features ready.');
  }
  const googleId = process.env.GOOGLE_CLIENT_ID || '';
  const googleOk = googleId.length > 10 && !googleId.includes('demo') && googleId.endsWith('.apps.googleusercontent.com');
  if (googleOk) {
    console.log('Google sign-in: GOOGLE_CLIENT_ID loaded. "Continue with Google" is enabled.');
  } else {
    console.warn('Google sign-in: GOOGLE_CLIENT_ID missing or invalid in .env. Add it and restart to enable "Continue with Google".');
  }

  const alertIntervalMin = Number(process.env.SLO_ALERT_INTERVAL_MIN || 0);
  if (alertIntervalMin > 0) {
    const intervalMs = Math.max(1, alertIntervalMin) * 60 * 1000;
    setInterval(async () => {
      try {
        const metricsPayload = getSREMetrics(24);
        const result = await maybeSendSLOAlerts({
          metricsPayload,
          sloTargets: SLO_TARGETS,
          cooldownMinutes: Number(process.env.SLO_ALERT_COOLDOWN_MIN || 15),
        });
        if (result.alerted) {
          console.warn('[sre] SLO alert sent:', JSON.stringify(result.channels));
        }
      } catch (err) {
        console.error('[sre] Scheduled alert check failed:', err.message);
      }
    }, intervalMs);
    console.log(`[sre] Scheduled SLO alert checks every ${alertIntervalMin} minute(s).`);
  }
});
