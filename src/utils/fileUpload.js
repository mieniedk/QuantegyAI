import { getAuthToken } from './storage';

/**
 * Upload a file to the server.
 * @param {File} file - The File object to upload
 * @param {'chat'|'submission'|'feed'|'general'} category - Upload category
 * @returns {Promise<{success: boolean, file?: object, error?: string}>}
 */
export async function uploadFile(file, category = 'general') {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`/api/upload/${category}`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Upload multiple files to the server.
 * @param {File[]} files - Array of File objects
 * @param {'chat'|'submission'|'feed'|'general'} category - Upload category
 * @returns {Promise<{success: boolean, files?: object[], error?: string}>}
 */
export async function uploadFiles(files, category = 'general') {
  const token = getAuthToken();
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  try {
    const res = await fetch(`/api/upload/${category}/multiple`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete a file from the server.
 * @param {string} url - The file URL (e.g. /uploads/chat/filename.jpg)
 */
export async function deleteFile(url) {
  if (!url?.startsWith('/uploads/')) return { success: false, error: 'Invalid URL' };
  const token = getAuthToken();
  const parts = url.replace('/uploads/', '').split('/');
  if (parts.length !== 2) return { success: false, error: 'Invalid path' };

  try {
    const res = await fetch(`/api/upload/${parts[0]}/${parts[1]}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}
