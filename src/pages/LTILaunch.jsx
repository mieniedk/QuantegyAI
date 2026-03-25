import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLTI } from '../contexts/LTIContext.jsx';

export default function LTILaunch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLTI, loading, isInstructor, custom } = useLTI();

  useEffect(() => {
    if (loading) return;

    if (!isLTI) {
      navigate('/');
      return;
    }

    const route = searchParams.get('route') || custom?.route;

    if (route) {
      navigate(route);
    } else if (isInstructor) {
      navigate('/teacher-dashboard');
    } else {
      navigate('/student');
    }
  }, [isLTI, loading, isInstructor, custom, navigate, searchParams]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Launching Quantegy AI</h2>
        <p style={{ color: '#a5b4fc', fontSize: 14 }}>Setting up your session...</p>
        <div style={{
          width: 48, height: 48, margin: '20px auto',
          border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#818cf8',
          borderRadius: '50%', animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
