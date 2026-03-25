import React, { useState, useEffect, useRef } from 'react';
import { getStudioVideoBlob } from '../utils/videoStudio';
import SkeletonLoader from './SkeletonLoader';

/** Renders a video from Video Studio (studio:id URL) */
export default function StudioVideoPlayer({ url, style }) {
  const [objectUrl, setObjectUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const urlRef = useRef(null);

  useEffect(() => {
    if (!url || !url.startsWith('studio:')) return;
    const id = url.replace(/^studio:/, '');
    let mounted = true;
    setLoading(true);
    setError(null);
    getStudioVideoBlob(id)
      .then((blob) => {
        if (!mounted || !blob) return;
        const ourl = URL.createObjectURL(blob);
        urlRef.current = ourl;
        setObjectUrl(ourl);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Video not found');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [url]);

  if (loading) {
    return (
      <div style={{ ...style, background: '#f1f5f9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, padding: 24 }}>
        <SkeletonLoader variant="card" width={320} height={100} />
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ ...style, background: '#fef2f2', borderRadius: 10, padding: 12, color: '#dc2626', fontSize: 13 }}>
        {error}
      </div>
    );
  }
  if (!objectUrl) return null;
  return (
    <video
      src={objectUrl}
      controls
      style={{ width: '100%', maxHeight: 240, borderRadius: 10, marginTop: 8, ...style }}
    />
  );
}
