import React from 'react';
import { useLTI } from '../contexts/LTIContext.jsx';

export default function LTIBanner() {
  const { isLTI, platformName, contextTitle, isInstructor, userName } = useLTI();
  if (!isLTI) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #1e40af, #7c3aed)',
      color: '#fff',
      padding: '6px 16px',
      fontSize: 12,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ opacity: 0.7 }}>LTI</span>
        <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.3)' }} />
        <span>Connected via {platformName || 'LMS'}</span>
        {contextTitle && <>
          <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.3)' }} />
          <span style={{ opacity: 0.85 }}>{contextTitle}</span>
        </>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ opacity: 0.85 }}>{userName}</span>
        <span style={{
          padding: '1px 8px', borderRadius: 4, fontSize: 10,
          background: isInstructor ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)',
        }}>
          {isInstructor ? 'Instructor' : 'Student'}
        </span>
      </div>
    </div>
  );
}
