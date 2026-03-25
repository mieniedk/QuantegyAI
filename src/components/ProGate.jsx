import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { hasProAccess, getStatusLabel, isTrialExpired } from '../utils/subscription';

/**
 * Wraps a Pro-only page. If the teacher is not logged in or their trial
 * has expired (and they haven't paid), shows an upgrade prompt instead.
 */
const ProGate = ({ children, featureName }) => {
  const username = localStorage.getItem('quantegy-teacher-user');

  // No teacher logged in
  if (!username) {
    return (
      <div style={containerStyle}>
        <h2>Sign in Required</h2>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          Please log in to the <Link to="/teacher" style={{ color: '#2563eb' }}>Teacher Portal</Link> to access {featureName || 'this feature'}.
        </p>
      </div>
    );
  }

  // Teacher logged in but no Pro access
  if (!hasProAccess(username)) {
    return (
      <div style={containerStyle}>
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12,
          padding: '32px 24px', textAlign: 'center', maxWidth: 500, margin: '0 auto',
        }}>
          <h2 style={{ margin: '0 0 8px', color: '#991b1b' }}>Pro Feature</h2>
          <p style={{ color: '#7f1d1d', margin: '0 0 16px', lineHeight: 1.6 }}>
            <strong>{featureName || 'This feature'}</strong> requires an active subscription.
            Your trial has ended.
          </p>
          <Link to={`/pricing?user=${username}`} style={{
            display: 'inline-block', padding: '12px 28px',
            background: '#2563eb', color: '#fff', borderRadius: 10,
            textDecoration: 'none', fontWeight: 700, fontSize: 15,
          }}>
            View Plans & Upgrade
          </Link>
          <p style={{ marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
            {getStatusLabel(username)}
          </p>
        </div>
      </div>
    );
  }

  // Pro access is active — render the page normally
  return children;
};

ProGate.propTypes = {
  children: PropTypes.node.isRequired,
  featureName: PropTypes.string,
};

const containerStyle = {
  padding: '60px 24px',
  maxWidth: 600,
  margin: '0 auto',
  textAlign: 'center',
  fontFamily: 'system-ui, sans-serif',
};

export default ProGate;
