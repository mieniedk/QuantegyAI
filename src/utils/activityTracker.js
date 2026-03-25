const TOKEN_KEY = 'quantegy-auth-token';
let currentPage = null;
let pageStartTime = null;

function getToken() { return localStorage.getItem(TOKEN_KEY); }

export function trackPageView(resourceType, resourceId) {
  flushTimeOnPage();
  currentPage = { resourceType, resourceId };
  pageStartTime = Date.now();
  sendActivity({ action: 'page_view', resourceType, resourceId });
}

function flushTimeOnPage() {
  if (currentPage && pageStartTime) {
    const duration = Date.now() - pageStartTime;
    if (duration > 2000) {
      sendActivity({ action: 'time_on_page', ...currentPage, durationMs: duration });
    }
  }
  currentPage = null;
  pageStartTime = null;
}

function sendActivity(entry) {
  const token = getToken();
  if (!token) return;
  try {
    fetch('/api/activity/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(entry),
    }).catch((err) => { console.warn('Activity log failed:', err); });
  } catch (err) {
    console.warn('Activity log failed:', err);
  }
}

export function trackAssignmentStart(assessmentId) {
  sendActivity({ action: 'assignment_start', resourceType: 'assessment', resourceId: assessmentId });
}

export function trackAssignmentSubmit(assessmentId, submissionId) {
  sendActivity({ action: 'assignment_submit', resourceType: 'assessment', resourceId: assessmentId, meta: { submissionId } });
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushTimeOnPage);
}
