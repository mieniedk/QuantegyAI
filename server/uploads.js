/**
 * File Upload Module
 *
 * Handles server-side file storage for:
 *  - Chat attachments (images, audio, video, documents)
 *  - Assignment/assessment submissions
 *  - Class feed attachments
 *  - General teacher/student file uploads
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const SUBDIRS = ['chat', 'submissions', 'feed', 'general'];

function ensureUploadDirs() {
  for (const sub of SUBDIRS) {
    const dir = path.join(UPLOADS_DIR, sub);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}
ensureUploadDirs();

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
  'video/mp4', 'video/webm', 'video/ogg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
  'application/zip',
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

function generateFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const hash = crypto.randomBytes(12).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
}

function createStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOADS_DIR, subfolder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, generateFilename(file.originalname));
    },
  });
}

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed.`), false);
  }
}

export const chatUpload = multer({
  storage: createStorage('chat'),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export const submissionUpload = multer({
  storage: createStorage('submissions'),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export const feedUpload = multer({
  storage: createStorage('feed'),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export const generalUpload = multer({
  storage: createStorage('general'),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

function fileToResponse(file, subfolder) {
  const isImage = file.mimetype.startsWith('image/');
  const isAudio = file.mimetype.startsWith('audio/');
  const isVideo = file.mimetype.startsWith('video/');
  let type = 'file';
  if (isImage) type = 'image';
  else if (isAudio) type = 'audio';
  else if (isVideo) type = 'video';

  return {
    id: path.basename(file.filename, path.extname(file.filename)),
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    type,
    url: `/uploads/${subfolder}/${file.filename}`,
  };
}

export function createUploadRouter(express, authMiddleware) {
  const router = express.Router();

  router.post('/chat', authMiddleware, chatUpload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });
    res.json({ success: true, file: fileToResponse(req.file, 'chat') });
  });

  router.post('/chat/multiple', authMiddleware, chatUpload.array('files', 5), (req, res) => {
    if (!req.files?.length) return res.status(400).json({ success: false, error: 'No files uploaded.' });
    res.json({ success: true, files: req.files.map(f => fileToResponse(f, 'chat')) });
  });

  router.post('/submission', authMiddleware, submissionUpload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });
    res.json({ success: true, file: fileToResponse(req.file, 'submissions') });
  });

  router.post('/submission/multiple', authMiddleware, submissionUpload.array('files', 10), (req, res) => {
    if (!req.files?.length) return res.status(400).json({ success: false, error: 'No files uploaded.' });
    res.json({ success: true, files: req.files.map(f => fileToResponse(f, 'submissions')) });
  });

  router.post('/feed', authMiddleware, feedUpload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });
    res.json({ success: true, file: fileToResponse(req.file, 'feed') });
  });

  router.post('/feed/multiple', authMiddleware, feedUpload.array('files', 5), (req, res) => {
    if (!req.files?.length) return res.status(400).json({ success: false, error: 'No files uploaded.' });
    res.json({ success: true, files: req.files.map(f => fileToResponse(f, 'feed')) });
  });

  router.post('/general', authMiddleware, generalUpload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });
    res.json({ success: true, file: fileToResponse(req.file, 'general') });
  });

  // Delete a file (teacher only)
  router.delete('/:subfolder/:filename', authMiddleware, (req, res) => {
    const { subfolder, filename } = req.params;
    if (!SUBDIRS.includes(subfolder)) return res.status(400).json({ success: false, error: 'Invalid folder.' });

    const safeName = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, subfolder, safeName);

    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, error: 'File not found.' });

    try {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Multer error handler
  router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, error: 'File too large. Maximum size is 50MB.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });

  return router;
}

export const UPLOADS_PATH = UPLOADS_DIR;
