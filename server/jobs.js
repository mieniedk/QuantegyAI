import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function safeRead() {
  try {
    const raw = fs.readFileSync(JOBS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function safeWrite(jobs) {
  ensureDir();
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs.slice(0, 2000), null, 2), 'utf-8');
}

export function createJobQueue() {
  const jobs = new Map();
  const handlers = new Map();
  const emitter = new EventEmitter();
  let running = false;

  for (const j of safeRead()) jobs.set(j.id, j);

  function persist() {
    const rows = [...jobs.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    safeWrite(rows);
  }

  function list({ status, type, limit = 100 } = {}) {
    let rows = [...jobs.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (status) rows = rows.filter((j) => j.status === status);
    if (type) rows = rows.filter((j) => j.type === type);
    return rows.slice(0, Math.max(1, Math.min(500, Number(limit) || 100)));
  }

  function get(id) {
    return jobs.get(id) || null;
  }

  function registerHandler(type, handler) {
    handlers.set(type, handler);
  }

  function enqueue(type, payload = {}, meta = {}) {
    const id = uuidv4();
    const job = {
      id,
      type,
      status: 'queued',
      payload,
      meta,
      attempts: 0,
      maxAttempts: Number(meta.maxAttempts || 3),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
      result: null,
      error: null,
    };
    jobs.set(id, job);
    persist();
    emitter.emit('job', { action: 'enqueued', job });
    schedule();
    return job;
  }

  function schedule() {
    if (running) return;
    running = true;
    setImmediate(processLoop);
  }

  async function processLoop() {
    try {
      while (true) {
        const next = [...jobs.values()]
          .filter((j) => j.status === 'queued')
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
        if (!next) break;

        const handler = handlers.get(next.type);
        if (!handler) {
          next.status = 'failed';
          next.error = `No handler registered for job type: ${next.type}`;
          next.updatedAt = new Date().toISOString();
          next.finishedAt = new Date().toISOString();
          persist();
          continue;
        }

        next.status = 'running';
        next.startedAt = new Date().toISOString();
        next.updatedAt = new Date().toISOString();
        next.attempts += 1;
        persist();
        emitter.emit('job', { action: 'running', job: next });

        try {
          const result = await handler(next.payload, next.meta, next);
          if (next.cancelRequested) {
            next.status = 'cancelled';
            next.result = null;
            next.error = 'Cancelled by user.';
          } else {
            next.status = 'succeeded';
            next.result = result ?? null;
            next.error = null;
          }
          next.updatedAt = new Date().toISOString();
          next.finishedAt = new Date().toISOString();
          persist();
          emitter.emit('job', { action: next.status, job: next });
        } catch (err) {
          if (next.cancelRequested) {
            next.status = 'cancelled';
            next.error = 'Cancelled by user.';
          } else {
            next.status = next.attempts < next.maxAttempts ? 'queued' : 'failed';
            next.error = err?.message || String(err);
          }
          next.updatedAt = new Date().toISOString();
          if (next.status === 'failed' || next.status === 'cancelled') next.finishedAt = new Date().toISOString();
          persist();
          emitter.emit('job', { action: next.status, job: next });
        }
      }
    } finally {
      running = false;
      // Catch any jobs queued while loop was finishing.
      const hasQueued = [...jobs.values()].some((j) => j.status === 'queued');
      if (hasQueued) schedule();
    }
  }

  function retry(id) {
    const job = jobs.get(id);
    if (!job) return null;
    if (job.status === 'running') return job;
    job.status = 'queued';
    job.cancelRequested = false;
    job.error = null;
    job.result = null;
    job.finishedAt = null;
    job.updatedAt = new Date().toISOString();
    persist();
    emitter.emit('job', { action: 'retry', job });
    schedule();
    return job;
  }

  function cancel(id, requestedBy = 'unknown') {
    const job = jobs.get(id);
    if (!job) return null;
    if (job.status === 'succeeded' || job.status === 'failed' || job.status === 'cancelled') return job;
    if (job.status === 'queued') {
      job.status = 'cancelled';
      job.cancelRequested = true;
      job.error = `Cancelled by ${requestedBy}`;
      job.updatedAt = new Date().toISOString();
      job.finishedAt = new Date().toISOString();
      persist();
      emitter.emit('job', { action: 'cancelled', job });
      return job;
    }
    // running
    job.cancelRequested = true;
    job.status = 'cancel_requested';
    job.error = `Cancellation requested by ${requestedBy}`;
    job.updatedAt = new Date().toISOString();
    persist();
    emitter.emit('job', { action: 'cancel_requested', job });
    return job;
  }

  function subscribe(listener) {
    emitter.on('job', listener);
    return () => emitter.off('job', listener);
  }

  return {
    list,
    get,
    registerHandler,
    enqueue,
    retry,
    cancel,
    subscribe,
    processNow: schedule,
  };
}

