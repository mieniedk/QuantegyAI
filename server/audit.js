import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const AUDIT_LOG_PATH = path.join(DATA_DIR, 'audit.log.jsonl');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function redactBody(body) {
  if (!body || typeof body !== 'object') return null;
  const cloned = { ...body };
  const secretKeys = ['password', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey'];
  for (const k of Object.keys(cloned)) {
    if (secretKeys.includes(k)) cloned[k] = '[REDACTED]';
  }
  return cloned;
}

export function appendAuditLog(entry) {
  try {
    const line = `${JSON.stringify(entry)}\n`;
    fs.appendFileSync(AUDIT_LOG_PATH, line, 'utf8');
  } catch (err) {
    // Keep audit logging non-blocking for request lifecycle.
    console.error('[audit] Failed to append audit entry:', err.message);
  }
}

export function readAuditLogs(limit = 200) {
  try {
    if (!fs.existsSync(AUDIT_LOG_PATH)) return [];
    const raw = fs.readFileSync(AUDIT_LOG_PATH, 'utf8');
    const lines = raw.split('\n').filter(Boolean);
    const tail = lines.slice(-Math.max(1, Math.min(2000, Number(limit) || 200)));
    return tail.reverse().map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch (err) {
    console.error('[audit] Failed to read audit logs:', err.message);
    return [];
  }
}

export function createAuditMiddleware({ decodeToken }) {
  return (req, res, next) => {
    const isApi = req.path.startsWith('/api/');
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const ignored = req.path.startsWith('/api/health') || req.path.startsWith('/api/sre/');
    if (!isApi || !isMutating || ignored) return next();

    const startedAt = Date.now();
    res.on('finish', () => {
      let actor = 'anonymous';
      let role = 'unknown';
      try {
        const auth = req.headers.authorization;
        if (auth && auth.startsWith('Bearer ')) {
          const decoded = decodeToken(auth.slice(7));
          actor = decoded?.username || decoded?.id || actor;
          role = decoded?.role || role;
        } else if (req.body?.username) {
          actor = req.body.username;
          role = req.body?.role || role;
        }
      } catch {
        // ignore token decode failures for audit enrichment
      }

      appendAuditLog({
        ts: new Date().toISOString(),
        actor,
        role,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
        ip: req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown',
        body: redactBody(req.body),
      });
    });
    next();
  };
}

