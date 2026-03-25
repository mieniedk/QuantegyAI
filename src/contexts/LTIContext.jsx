import React, { createContext, useContext, useState, useEffect } from 'react';

const LTIContext = createContext(null);

const LTI_SESSION_KEY = 'quantegy-lti-session';

export function LTIProvider({ children }) {
  const [ltiSession, setLtiSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      verifyToken(token).then(user => {
        if (user) {
          const session = { token, user, launchedAt: new Date().toISOString() };
          setLtiSession(session);
          sessionStorage.setItem(LTI_SESSION_KEY, JSON.stringify(session));
          const url = new URL(window.location);
          url.searchParams.delete('token');
          window.history.replaceState({}, '', url.toString());
        }
        setLoading(false);
      });
      return;
    }

    const stored = sessionStorage.getItem(LTI_SESSION_KEY);
    if (stored) {
      try {
        const session = JSON.parse(stored);
        setLtiSession(session);
      } catch (err) { console.debug('Invalid LTI session:', err); }
    }
    setLoading(false);
  }, []);

  const isLTI = !!ltiSession;
  const isInstructor = ltiSession?.user?.isInstructor ?? false;
  const userName = ltiSession?.user?.name || '';
  const platformName = ltiSession?.user?.platformName || '';
  const contextTitle = ltiSession?.user?.contextTitle || '';
  const ags = ltiSession?.user?.ags || null;
  const nrps = ltiSession?.user?.nrps || null;
  const custom = ltiSession?.user?.custom || {};

  async function postGrade(studentSub, score, maxScore = 100, comment = '') {
    if (!ags?.lineItemUrl && !ags?.lineItemId) return { success: false, error: 'No AGS endpoint available.' };
    try {
      const res = await fetch('/api/lti/grade-passback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: ltiSession.user.platformId,
          lineItemUrl: ags.lineItemId || ags.lineItemUrl,
          studentSub,
          score,
          maxScore,
          comment,
        }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async function fetchRoster() {
    if (!nrps?.contextMembershipsUrl) return { success: false, error: 'No NRPS endpoint available.' };
    try {
      const res = await fetch('/api/lti/roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: ltiSession.user.platformId,
          contextMembershipsUrl: nrps.contextMembershipsUrl,
        }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  function endSession() {
    sessionStorage.removeItem(LTI_SESSION_KEY);
    setLtiSession(null);
  }

  const value = {
    isLTI,
    loading,
    ltiSession,
    isInstructor,
    userName,
    platformName,
    contextTitle,
    ags,
    nrps,
    custom,
    postGrade,
    fetchRoster,
    endSession,
  };

  return <LTIContext.Provider value={value}>{children}</LTIContext.Provider>;
}

export function useLTI() {
  const ctx = useContext(LTIContext);
  if (!ctx) return { isLTI: false, loading: false };
  return ctx;
}

async function verifyToken(token) {
  try {
    const res = await fetch('/api/lti/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return data.success ? data.user : null;
  } catch (err) {
    console.warn('LTI token verification failed:', err);
    return null;
  }
}

export default LTIContext;
