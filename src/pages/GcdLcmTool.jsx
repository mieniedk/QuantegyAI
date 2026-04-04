import React from 'react';
import { Link } from 'react-router-dom';
import GcdLcmExplorer from '../components/GcdLcmExplorer';

/**
 * Standalone tool page (embed in LMS via URL or use in class).
 */
export default function GcdLcmTool() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px 16px 48px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ margin: '0 0 16px', fontSize: 14 }}>
          <Link to="/classroom-tools" style={{ color: '#2563eb', fontWeight: 600 }}>
            ← Classroom tools
          </Link>
        </p>
        <GcdLcmExplorer
          onComplete={() => {}}
          continueLabel="Done exploring"
          badgeLabel="GCD & LCM explorer"
          embedded={false}
        />
      </div>
    </div>
  );
}
