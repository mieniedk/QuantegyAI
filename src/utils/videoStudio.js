/**
 * Video Studio storage — IndexedDB for video blobs, localStorage for metadata
 * Canvas Studio–like: record & store videos for class content
 */

const DB_NAME = 'allen-ace-video-studio';
const DB_VERSION = 1;
const STORE_NAME = 'videos';
const META_KEY = 'allen-ace-studio-videos';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export function getStudioVideosList() {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStudioVideosList(list) {
  localStorage.setItem(META_KEY, JSON.stringify(list));
}

export async function saveStudioVideo(blob, metadata) {
  const id = `studio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const meta = {
    id,
    title: metadata.title || 'Untitled Video',
    createdAt: new Date().toISOString(),
    duration: metadata.duration || 0,
    createdBy: metadata.createdBy || 'teacher',
    size: blob.size,
  };
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id, blob });
    tx.oncomplete = () => {
      const list = getStudioVideosList();
      list.unshift(meta);
      saveStudioVideosList(list);
      db.close();
      resolve({ ...meta, id });
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getStudioVideoBlob(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      db.close();
      resolve(req.result?.blob || null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteStudioVideo(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => {
      const list = getStudioVideosList().filter((v) => v.id !== id);
      saveStudioVideosList(list);
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}
