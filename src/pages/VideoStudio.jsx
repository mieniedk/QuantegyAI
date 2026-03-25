import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import {
  getStudioVideosList,
  saveStudioVideo,
  getStudioVideoBlob,
  deleteStudioVideo,
} from '../utils/videoStudio';
import { showAppToast } from '../utils/appToast';

/* ═══════════════════════════════════════════════════════════════
   VIDEO STUDIO — Canvas Studio–like
   Record webcam, screen, or upload. Manage & share to classes.
   ═══════════════════════════════════════════════════════════════ */

function formatDuration(sec) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideoStudio({ embedded, onBack, createdBy } = {}) {
  const isStudent = !localStorage.getItem('quantegy-teacher-user') && !!localStorage.getItem('quantegy-student-session');
  const effectiveEmbedded = embedded || isStudent;
  const studentSession = isStudent ? (() => { try { return JSON.parse(localStorage.getItem('quantegy-student-session')); } catch { return null; } })() : null;
  const effectiveCreatedBy = createdBy || (studentSession?.studentId || studentSession?.nickname || null) || 'teacher';
  const [mode, setMode] = useState('library'); // library | record | uploading
  const [recordMode, setRecordMode] = useState(null); // webcam | screen
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordTime, setRecordTime] = useState(0);
  const [videoTitle, setVideoTitle] = useState('');
  const [videos, setVideos] = useState(() => getStudioVideosList());
  const [playingId, setPlayingId] = useState(null);
  const [playingUrl, setPlayingUrl] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const fileInputRef = useRef(null);

  const refreshList = useCallback(() => setVideos(getStudioVideosList()), []);

  const startRecording = useCallback(async (type) => {
    try {
      let stream;
      if (type === 'webcam') {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      }
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          setRecordedBlob(blob);
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(1000);
      setRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => setRecordTime((t) => t + 1), 1000);
    } catch (err) {
      showAppToast(err.message || 'Could not access camera or screen.', { type: 'error' });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setRecording(false);
  }, []);

  const saveRecording = useCallback(async () => {
    if (!recordedBlob) return;
    setMode('uploading');
    try {
      await saveStudioVideo(recordedBlob, {
        title: videoTitle.trim() || 'Recording',
        duration: recordTime,
        createdBy: effectiveCreatedBy || localStorage.getItem('quantegy-teacher-user') || 'teacher',
      });
      refreshList();
      setRecordedBlob(null);
      setVideoTitle('');
      setRecordTime(0);
      setRecordMode(null);
      setMode('library');
    } catch (err) {
      setUploadError(err.message || 'Failed to save');
    }
    setMode('library');
  }, [recordedBlob, videoTitle, recordTime, refreshList]);

  const discardRecording = useCallback(() => {
    setRecordedBlob(null);
    setVideoTitle('');
    setRecordTime(0);
    setRecordMode(null);
    setMode('library');
  }, []);

  const handleUpload = useCallback(async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith('video/')) {
      setUploadError('Please select a video file.');
      return;
    }
    setMode('uploading');
    setUploadError('');
    try {
      await saveStudioVideo(file, {
        title: file.name.replace(/\.[^/.]+$/, '') || 'Uploaded Video',
        duration: 0,
        createdBy: effectiveCreatedBy || localStorage.getItem('quantegy-teacher-user') || 'teacher',
      });
      refreshList();
      setMode('library');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(err.message || 'Failed to upload');
      setMode('library');
    }
  }, [refreshList]);

  const playVideo = useCallback(async (id) => {
    if (playingUrl) URL.revokeObjectURL(playingUrl);
    const blob = await getStudioVideoBlob(id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setPlayingUrl(url);
      setPlayingId(id);
    }
  }, [playingUrl]);

  const closePlayer = useCallback(() => {
    if (playingUrl) URL.revokeObjectURL(playingUrl);
    setPlayingUrl(null);
    setPlayingId(null);
  }, [playingUrl]);

  const handleDelete = useCallback(async (id) => {
    if (!confirm('Delete this video?')) return;
    await deleteStudioVideo(id);
    if (playingId === id) closePlayer();
    refreshList();
  }, [playingId, closePlayer, refreshList]);

  const getStudioVideoUrl = (id) => `studio:${id}`;

  const backLink = effectiveEmbedded && onBack ? (
    <button type="button" onClick={onBack} style={{
      color: '#94a3b8', background: 'none', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 16, display: 'inline-block',
    }}>
      ← Back
    </button>
  ) : isStudent ? (
    <Link to="/student" style={{
      color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'inline-block',
    }}>
      ← Back to Class
    </Link>
  ) : (
    <Link to="/teacher-dashboard" style={{
      color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'inline-block',
    }}>
      ← Back to Dashboard
    </Link>
  );

  const content = (
    <div style={{ maxWidth: 800 }}>
      {backLink}

      <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
        🎬 Video Studio
      </h1>
      <p style={{ margin: 0, color: '#64748b', fontSize: 14, marginBottom: 24 }}>
        {effectiveEmbedded ? 'Record or upload videos for discussions and assignments.' : 'Record or upload videos. Add them to class Content modules.'}
      </p>

        {/* Record / Upload buttons */}
        {mode === 'library' && !recordedBlob && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => {
                setRecordMode('webcam');
                setMode('record');
                setTimeout(() => startRecording('webcam'), 100);
              }}
              style={{
                padding: '16px 24px',
                borderRadius: 12,
                border: '2px solid #2563eb',
                background: '#eff6ff',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 24 }}>📷</span>
              Record Webcam
            </button>
            <button
              type="button"
              onClick={() => {
                setRecordMode('screen');
                setMode('record');
                setTimeout(() => startRecording('screen'), 100);
              }}
              style={{
                padding: '16px 24px',
                borderRadius: 12,
                border: '2px solid #7c3aed',
                background: '#f5f3ff',
                color: '#7c3aed',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 24 }}>🖥️</span>
              Record Screen
            </button>
            <label
              style={{
                padding: '16px 24px',
                borderRadius: 12,
                border: '2px solid #059669',
                background: '#f0fdf4',
                color: '#059669',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleUpload}
              />
              <span style={{ fontSize: 24 }}>📤</span>
              Upload Video
            </label>
          </div>
        )}

        {/* Recording UI */}
        {mode === 'record' && !recordedBlob && (
          <div
            style={{
              background: '#0f172a',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                {recordMode === 'webcam' ? '📷 Webcam' : '🖥️ Screen'}
              </span>
              <span style={{ fontSize: 18, fontWeight: 800 }}>
                {formatDuration(recordTime)}
              </span>
            </div>
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                maxHeight: 320,
                borderRadius: 10,
                background: '#000',
              }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button
                type="button"
                onClick={stopRecording}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ⏹ Stop
              </button>
            </div>
          </div>
        )}

        {/* Preview recorded & save */}
        {recordedBlob && (
          <div
            style={{
              background: '#f8fafc',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Preview & Save</div>
            <video
              src={URL.createObjectURL(recordedBlob)}
              controls
              style={{ width: '100%', maxHeight: 300, borderRadius: 10, marginBottom: 12 }}
            />
            <input
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Video title"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 14,
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={saveRecording}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save to Library
              </button>
              <button
                type="button"
                onClick={discardRecording}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {uploadError && (
          <div
            style={{
              padding: 12,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 10,
              color: '#dc2626',
              marginBottom: 16,
            }}
          >
            {uploadError}
          </div>
        )}

        {mode === 'uploading' && (
          <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
            Saving...
          </div>
        )}

        {/* Video library */}
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#0f172a' }}>
          Your Videos
        </div>
        {videos.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: 14,
              border: '2px dashed #e2e8f0',
              color: '#94a3b8',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>No videos yet</div>
            <div style={{ fontSize: 13 }}>Record webcam, record screen, or upload a video.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {videos.map((v) => (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  onClick={() => playVideo(v.id)}
                  style={{
                    width: 140,
                    height: 80,
                    borderRadius: 8,
                    background: '#0f172a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 32,
                  }}
                >
                  ▶
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{v.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    {formatDuration(v.duration)} · {formatSize(v.size)} · {new Date(v.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        background: '#e0e7ff',
                        color: '#4338ca',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontWeight: 600,
                      }}
                    >
                      Use in Content: studio:{v.id}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(v.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 18,
                    padding: 8,
                    color: '#dc2626',
                  }}
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Video player modal */}
        {playingId && playingUrl && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={closePlayer}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                overflow: 'hidden',
                maxWidth: '90vw',
                maxHeight: '90vh',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={playingUrl}
                controls
                autoPlay
                style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block' }}
              />
              <div style={{ padding: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closePlayer}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );

  return effectiveEmbedded ? content : <TeacherLayout>{content}</TeacherLayout>;
}
