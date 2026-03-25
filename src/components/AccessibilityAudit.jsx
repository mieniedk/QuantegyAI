import React, { useState, useCallback, useRef } from 'react';

// ─── WCAG 2.1 AA Audit Engine ─────────────────────────────────────────────────

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseColor(color) {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return null;
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return { r, g, b };
}

function contrastRatio(fg, bg) {
  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getSelector(el) {
  if (el.id) return `#${el.id}`;
  let path = el.tagName.toLowerCase();
  if (el.className && typeof el.className === 'string') {
    const cls = el.className.trim().split(/\s+/).slice(0, 2).join('.');
    if (cls) path += `.${cls}`;
  }
  if (el.parentElement && el.parentElement !== document.body) {
    const parent = el.parentElement.tagName.toLowerCase();
    return `${parent} > ${path}`;
  }
  return path;
}

function runDOMAudit() {
  const results = [];

  // 1. Images without alt text
  document.querySelectorAll('img').forEach((img) => {
    const hasAlt = img.hasAttribute('alt');
    const altVal = img.getAttribute('alt');
    if (!hasAlt) {
      results.push({ rule: '1.1.1 Non-text Content', status: 'fail', element: getSelector(img), details: 'Image missing alt attribute. Add descriptive alt text or alt="" for decorative images.' });
    } else if (altVal === '' && !img.getAttribute('role')) {
      results.push({ rule: '1.1.1 Non-text Content', status: 'warning', element: getSelector(img), details: 'Image has empty alt. If decorative, add role="presentation". If meaningful, add descriptive alt text.' });
    } else {
      results.push({ rule: '1.1.1 Non-text Content', status: 'pass', element: getSelector(img), details: `Alt text present: "${altVal?.substring(0, 50)}${(altVal?.length || 0) > 50 ? '...' : ''}"` });
    }
  });
  if (document.querySelectorAll('img').length === 0) {
    results.push({ rule: '1.1.1 Non-text Content', status: 'pass', element: 'page', details: 'No images found on page (or all are CSS backgrounds).' });
  }

  // 2. Color contrast
  const textEls = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label, li, td, th, div');
  let contrastChecked = 0;
  let contrastFails = 0;
  textEls.forEach((el) => {
    if (contrastChecked >= 30) return;
    const text = el.textContent?.trim();
    if (!text || text.length > 200) return;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return;
    const fg = parseColor(style.color);
    const bg = parseColor(style.backgroundColor);
    if (!fg || !bg) return;
    contrastChecked++;
    const ratio = contrastRatio(fg, bg);
    const fontSize = parseFloat(style.fontSize);
    const isBold = parseInt(style.fontWeight) >= 700;
    const isLarge = fontSize >= 18 || (fontSize >= 14 && isBold);
    const threshold = isLarge ? 3 : 4.5;
    if (ratio < threshold) {
      contrastFails++;
      if (contrastFails <= 5) {
        results.push({ rule: '1.4.3 Contrast (Minimum)', status: 'fail', element: getSelector(el), details: `Contrast ratio ${ratio.toFixed(2)}:1 (need ${threshold}:1). Text: "${text.substring(0, 40)}..."` });
      }
    }
  });
  if (contrastChecked > 0 && contrastFails === 0) {
    results.push({ rule: '1.4.3 Contrast (Minimum)', status: 'pass', element: 'page', details: `Checked ${contrastChecked} text elements — all pass WCAG AA contrast requirements.` });
  } else if (contrastFails > 5) {
    results.push({ rule: '1.4.3 Contrast (Minimum)', status: 'warning', element: 'page', details: `${contrastFails} total contrast failures found (showing first 5). Review computed styles.` });
  }

  // 3. Heading hierarchy
  const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  const headingLevels = headings.map((h) => parseInt(h.tagName[1]));
  const h1Count = headingLevels.filter((l) => l === 1).length;
  if (h1Count === 0) {
    results.push({ rule: '1.3.1 Info and Relationships', status: 'warning', element: 'page', details: 'No <h1> found. Each page should have exactly one <h1> element.' });
  } else if (h1Count > 1) {
    results.push({ rule: '1.3.1 Info and Relationships', status: 'warning', element: 'page', details: `Found ${h1Count} <h1> elements. Best practice is exactly one per page.` });
  } else {
    results.push({ rule: '1.3.1 Info and Relationships', status: 'pass', element: 'h1', details: 'Exactly one <h1> found on page.' });
  }
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i - 1] + 1) {
      results.push({ rule: '1.3.1 Info and Relationships', status: 'fail', element: getSelector(headings[i]), details: `Heading level skipped: <h${headingLevels[i - 1]}> followed by <h${headingLevels[i]}>. Don't skip heading levels.` });
    }
  }
  if (headings.length > 1 && headingLevels.every((l, i) => i === 0 || l <= headingLevels[i - 1] + 1)) {
    results.push({ rule: '1.3.1 Info and Relationships', status: 'pass', element: 'page', details: 'Heading hierarchy is correctly ordered with no skipped levels.' });
  }

  // 4. Interactive elements — keyboard accessibility
  const interactives = document.querySelectorAll('button, a[href], input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="menuitem"]');
  let kbFails = 0;
  interactives.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    const isNative = ['button', 'a', 'input', 'select', 'textarea'].includes(tag);
    if (!isNative) {
      const ti = el.getAttribute('tabindex');
      if (ti === null || parseInt(ti) < 0) {
        kbFails++;
        if (kbFails <= 3) {
          results.push({ rule: '2.1.1 Keyboard', status: 'fail', element: getSelector(el), details: `Custom interactive element (role="${el.getAttribute('role')}") is not keyboard focusable. Add tabindex="0".` });
        }
      }
    }
    const label = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.textContent?.trim();
    if (!label) {
      results.push({ rule: '4.1.2 Name, Role, Value', status: 'warning', element: getSelector(el), details: 'Interactive element has no accessible name. Add aria-label or visible text content.' });
    }
  });
  if (kbFails === 0) {
    results.push({ rule: '2.1.1 Keyboard', status: 'pass', element: 'page', details: `All ${interactives.length} interactive elements are keyboard accessible.` });
  }

  // 5. Form inputs with labels
  const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
  let labelFails = 0;
  inputs.forEach((input) => {
    const id = input.id;
    const hasLabel = id && document.querySelector(`label[for="${id}"]`);
    const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
    const wrappedInLabel = input.closest('label');
    const hasPlaceholder = input.getAttribute('placeholder');
    if (!hasLabel && !hasAriaLabel && !wrappedInLabel) {
      labelFails++;
      if (labelFails <= 3) {
        results.push({ rule: '1.3.1 Info and Relationships', status: 'fail', element: getSelector(input), details: `Form input missing associated label. Add <label for="..."> or aria-label.${hasPlaceholder ? ' Placeholder alone is not sufficient.' : ''}` });
      }
    }
  });
  if (inputs.length > 0 && labelFails === 0) {
    results.push({ rule: '1.3.1 Info and Relationships', status: 'pass', element: 'page', details: `All ${inputs.length} form inputs have associated labels or aria-label.` });
  }

  // 6. Skip navigation link
  const skipLink = document.querySelector('.skip-link, a[href="#main-content"], a[href="#main"]');
  if (skipLink) {
    results.push({ rule: '2.4.1 Bypass Blocks', status: 'pass', element: getSelector(skipLink), details: 'Skip navigation link found. Users can bypass repetitive content.' });
  } else {
    results.push({ rule: '2.4.1 Bypass Blocks', status: 'fail', element: 'page', details: 'No skip navigation link found. Add a visually hidden link to #main-content at the top of the page.' });
  }

  // 7. Focus indicators
  const focusStyle = document.querySelector('style, link[rel="stylesheet"]');
  const hasFocusCSS = !!document.querySelector('[class*="focus"]') ||
    getComputedStyle(document.documentElement).getPropertyValue('--focus-ring') ||
    document.styleSheets.length > 0;
  let focusIndicatorFound = false;
  try {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.selectorText && (rule.selectorText.includes(':focus-visible') || rule.selectorText.includes(':focus'))) {
            focusIndicatorFound = true;
            break;
          }
        }
      } catch (e) { /* cross-origin */ }
      if (focusIndicatorFound) break;
    }
  } catch (e) { /* ignore */ }
  results.push({
    rule: '2.4.7 Focus Visible',
    status: focusIndicatorFound ? 'pass' : 'warning',
    element: 'page',
    details: focusIndicatorFound
      ? 'Focus-visible CSS rules detected. Keyboard users can see focused elements.'
      : 'Could not detect focus indicator styles. Ensure :focus-visible styles are defined.',
  });

  // 8. ARIA landmarks
  const landmarks = {
    main: document.querySelector('main, [role="main"]'),
    nav: document.querySelector('nav, [role="navigation"]'),
    banner: document.querySelector('header[role="banner"], [role="banner"]'),
    contentinfo: document.querySelector('footer[role="contentinfo"], [role="contentinfo"]'),
  };
  const landmarkResults = [];
  if (landmarks.main) landmarkResults.push('main');
  if (landmarks.nav) landmarkResults.push('navigation');
  if (landmarks.banner) landmarkResults.push('banner');
  if (landmarks.contentinfo) landmarkResults.push('contentinfo');

  if (landmarkResults.length >= 2) {
    results.push({ rule: '1.3.1 ARIA Landmarks', status: 'pass', element: 'page', details: `Found landmarks: ${landmarkResults.join(', ')}.` });
  } else {
    results.push({ rule: '1.3.1 ARIA Landmarks', status: 'warning', element: 'page', details: `Only ${landmarkResults.length} landmark(s) found (${landmarkResults.join(', ') || 'none'}). Add main, nav, banner, contentinfo for screen reader navigation.` });
  }

  // 9. Page title
  const title = document.title;
  if (title && title.trim()) {
    results.push({ rule: '2.4.2 Page Titled', status: 'pass', element: 'title', details: `Page title: "${title}"` });
  } else {
    results.push({ rule: '2.4.2 Page Titled', status: 'fail', element: 'title', details: 'Page has no <title>. Add a descriptive title for screen readers and browser tabs.' });
  }

  // 10. Language of page
  const lang = document.documentElement.getAttribute('lang');
  if (lang) {
    results.push({ rule: '3.1.1 Language of Page', status: 'pass', element: 'html', details: `Page language set to "${lang}".` });
  } else {
    results.push({ rule: '3.1.1 Language of Page', status: 'fail', element: 'html', details: 'No lang attribute on <html>. Add lang="en" (or appropriate language code).' });
  }

  // 11. Link purpose
  const links = document.querySelectorAll('a[href]');
  let vagueLinkCount = 0;
  links.forEach((link) => {
    const text = (link.textContent || '').trim().toLowerCase();
    const ariaLabel = link.getAttribute('aria-label');
    if (['click here', 'here', 'more', 'read more', 'link'].includes(text) && !ariaLabel) {
      vagueLinkCount++;
      if (vagueLinkCount <= 2) {
        results.push({ rule: '2.4.4 Link Purpose', status: 'warning', element: getSelector(link), details: `Vague link text: "${text}". Use descriptive text or add aria-label.` });
      }
    }
  });
  if (vagueLinkCount === 0 && links.length > 0) {
    results.push({ rule: '2.4.4 Link Purpose', status: 'pass', element: 'page', details: `All ${links.length} links have descriptive text.` });
  }

  // 12. Use of color
  const errorEls = document.querySelectorAll('[style*="color: red"], [style*="color:#ef4444"], [style*="color:#dc2626"], .text-red, .text-danger');
  if (errorEls.length > 0) {
    results.push({ rule: '1.4.1 Use of Color', status: 'warning', element: 'page', details: `${errorEls.length} elements may use color alone to convey info. Ensure icons/text supplement color cues.` });
  } else {
    results.push({ rule: '1.4.1 Use of Color', status: 'pass', element: 'page', details: 'No obvious color-only indicators detected.' });
  }

  return results;
}

// ─── VPAT 2.4 criteria data ────────────────────────────────────────────────────

const VPAT_CRITERIA = [
  { id: '1.1.1', name: 'Non-text Content', level: 'A', conformance: 'Supports', remarks: 'Images use alt attributes. Decorative icons use aria-hidden="true". Emoji icons are supplemented with text labels.' },
  { id: '1.2.1', name: 'Audio-only and Video-only (Prerecorded)', level: 'A', conformance: 'Not Applicable', remarks: 'LMS does not host prerecorded audio-only content. Video Studio generates interactive video but relies on user-provided captions.' },
  { id: '1.3.1', name: 'Info and Relationships', level: 'A', conformance: 'Supports', remarks: 'Semantic HTML used throughout: headings, lists, tables with proper scope, ARIA landmarks (main, nav, banner). Tab interfaces use role="tab" / role="tabpanel" / aria-selected.' },
  { id: '1.4.1', name: 'Use of Color', level: 'A', conformance: 'Partially Supports', remarks: 'Status indicators use color + text labels. Some score visualizations use color-coded bars that include numeric values. Review game components for color-only cues.' },
  { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA', conformance: 'Supports', remarks: 'Primary text uses #0f172a on light backgrounds (>12:1). Secondary text uses #64748b on white (~5.7:1). Focus indicators use #2563eb with 3px outline. High-contrast forced-colors media query supported.' },
  { id: '2.1.1', name: 'Keyboard', level: 'A', conformance: 'Supports', remarks: 'All interactive elements use native HTML buttons/links or include tabindex="0" with role attributes. Tab navigation implemented on admin panels, class views, and assessment builder.' },
  { id: '2.4.1', name: 'Bypass Blocks', level: 'A', conformance: 'Supports', remarks: 'Skip-to-content link implemented (.skip-link) targeting #main-content. Visible on keyboard focus.' },
  { id: '2.4.2', name: 'Page Titled', level: 'A', conformance: 'Supports', remarks: 'Page title set via index.html. Individual views use descriptive headings within the SPA.' },
  { id: '2.4.4', name: 'Link Purpose (In Context)', level: 'A', conformance: 'Supports', remarks: 'Navigation links use descriptive text. Icon-only buttons include aria-label attributes (e.g., "Dismiss alert", "Notifications").' },
  { id: '3.1.1', name: 'Language of Page', level: 'A', conformance: 'Supports', remarks: 'HTML lang attribute set. LanguageContext provides i18n support with language selector component.' },
  { id: '3.3.1', name: 'Error Identification', level: 'A', conformance: 'Partially Supports', remarks: 'Form validation shows inline errors. Assessment submission has confirmation dialog with role="dialog" aria-modal. Some game components need improved error messaging.' },
  { id: '4.1.1', name: 'Parsing', level: 'A', conformance: 'Supports', remarks: 'React JSX ensures well-formed markup. No duplicate IDs in component hierarchy. ErrorBoundary catches rendering errors gracefully.' },
  { id: '4.1.2', name: 'Name, Role, Value', level: 'A', conformance: 'Supports', remarks: 'ARIA roles/properties used: role="tab/tablist/tabpanel", aria-selected, aria-label, aria-live="polite", role="dialog", role="timer", role="radiogroup", role="grid".' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AccessibilityAudit() {
  const [activeTab, setActiveTab] = useState('audit');
  const [auditResults, setAuditResults] = useState(null);
  const [auditFilter, setAuditFilter] = useState('all');
  const [running, setRunning] = useState(false);
  const [vpatData, setVpatData] = useState(VPAT_CRITERIA);
  const [fixes, setFixes] = useState({ highContrast: false, largeText: false, reduceAnimations: false, focusEnhance: false, srHints: false });
  const [copied, setCopied] = useState('');
  const statementRef = useRef(null);

  const handleRunAudit = useCallback(() => {
    setRunning(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        const results = runDOMAudit();
        setAuditResults(results);
        setRunning(false);
      }, 100);
    });
  }, []);

  const passes = auditResults?.filter((r) => r.status === 'pass').length || 0;
  const failures = auditResults?.filter((r) => r.status === 'fail').length || 0;
  const warnings = auditResults?.filter((r) => r.status === 'warning').length || 0;
  const total = passes + failures + warnings;
  const score = total > 0 ? Math.round((passes / total) * 100) : 0;

  const filteredResults = auditResults?.filter((r) => {
    if (auditFilter === 'all') return true;
    if (auditFilter === 'fail') return r.status === 'fail';
    if (auditFilter === 'warning') return r.status === 'warning';
    if (auditFilter === 'pass') return r.status === 'pass';
    return true;
  });

  const scoreColor = score > 90 ? '#22c55e' : score > 70 ? '#eab308' : '#ef4444';
  const statusIcon = { pass: '\u2705', fail: '\u274C', warning: '\u26A0\uFE0F' };
  const statusColor = { pass: '#dcfce7', fail: '#fef2f2', warning: '#fffbeb' };
  const statusBorder = { pass: '#bbf7d0', fail: '#fecaca', warning: '#fde68a' };
  const statusText = { pass: '#166534', fail: '#991b1b', warning: '#92400e' };

  // Live fixes toggle handler
  const toggleFix = (key) => {
    const next = !fixes[key];
    setFixes((prev) => ({ ...prev, [key]: next }));
    const root = document.documentElement;
    switch (key) {
      case 'highContrast':
        root.classList.toggle('a11y-high-contrast', next);
        break;
      case 'largeText':
        root.classList.toggle('a11y-large-text', next);
        break;
      case 'reduceAnimations':
        root.classList.toggle('a11y-reduce-motion', next);
        break;
      case 'focusEnhance':
        root.classList.toggle('a11y-focus-enhance', next);
        break;
      case 'srHints':
        root.classList.toggle('a11y-sr-hints', next);
        break;
    }
  };

  // Generate accessibility statement text
  const generateStatement = () => {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const knownIssues = auditResults?.filter((r) => r.status === 'fail').map((r) => `- ${r.rule}: ${r.details.split('.')[0]}.`).join('\n') || '- No known issues at this time.';
    return `ACCESSIBILITY STATEMENT
QuantegyAI Learning Management System

Last Updated: ${date}

COMMITMENT
QuantegyAI is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards.

CONFORMANCE STATUS
This platform aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. "Partially conformant" means that some parts of the content do not fully conform to the accessibility standard.

CURRENT COMPLIANCE
${auditResults ? `Based on our most recent automated audit:\n- ${passes} checks passed\n- ${failures} issues identified\n- ${warnings} warnings noted\n- Overall score: ${score}%` : 'Run an accessibility audit to generate current compliance data.'}

ACCESSIBILITY FEATURES
- Skip navigation link for keyboard users
- ARIA landmarks for screen reader navigation (main, nav, banner)
- Keyboard-accessible interactive elements with visible focus indicators
- Reduced motion support via prefers-reduced-motion media query
- High contrast mode support via forced-colors media query
- Touch target sizing (minimum 44x44px) for mobile users
- Multilingual support through language selector
- Screen reader announcements for dynamic content (aria-live regions)

KNOWN ISSUES
${knownIssues}

REMEDIATION PLAN
We aim to address all identified accessibility issues within 90 days of discovery. Critical issues (preventing access to core functionality) are prioritized for resolution within 30 days.

FEEDBACK
We welcome your feedback on the accessibility of QuantegyAI. Please let us know if you encounter accessibility barriers:

- Email: accessibility@allenace.com
- Phone: [Phone number]
- Address: [Physical address]

We try to respond to accessibility feedback within 3 business days.

TECHNICAL SPECIFICATIONS
Accessibility of QuantegyAI relies on the following technologies:
- HTML5
- WAI-ARIA 1.1
- CSS3
- JavaScript (React)

These technologies are relied upon for conformance with the accessibility standards used.`;
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.debug('Clipboard write failed, using fallback:', err);
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    }
  };

  const exportVPAT = () => {
    const header = 'Criteria\tConformance Level\tRemarks and Explanations';
    const rows = vpatData.map((c) => `${c.id} ${c.name} (Level ${c.level})\t${c.conformance}\t${c.remarks}`);
    copyToClipboard([header, ...rows].join('\n'), 'vpat');
  };

  const tabs = [
    { id: 'audit', label: 'Audit', icon: '\uD83D\uDD0D' },
    { id: 'vpat', label: 'VPAT', icon: '\uD83D\uDCCB' },
    { id: 'statement', label: 'Statement', icon: '\uD83D\uDCC4' },
    { id: 'settings', label: 'Settings', icon: '\u2699\uFE0F' },
  ];

  const card = { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 };
  const btnPrimary = (loading) => ({
    padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff', cursor: loading ? 'wait' : 'pointer',
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>{'\u267F'}</span>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
          WCAG Accessibility Audit & Compliance
        </h3>
        <span style={{
          padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: '#eff6ff', color: '#1d4ed8',
        }}>WCAG 2.1 AA</span>
      </div>

      {/* Tab bar */}
      <div role="tablist" aria-label="Accessibility audit sections" style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={activeTab === t.id}
            tabIndex={activeTab === t.id ? 0 : -1}
            onClick={() => setActiveTab(t.id)} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: activeTab === t.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
              background: activeTab === t.id ? '#eff6ff' : '#fff',
              color: activeTab === t.id ? '#1d4ed8' : '#475569',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
            <span style={{ fontSize: 13 }} aria-hidden="true">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ═══ AUDIT TAB ═══ */}
      {activeTab === 'audit' && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>Automated WCAG 2.1 AA Audit</h4>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Scans the current page DOM for accessibility violations, warnings, and best practices.
              </p>
            </div>
            <button type="button" onClick={handleRunAudit} disabled={running} style={btnPrimary(running)}>
              {running ? 'Scanning...' : auditResults ? 'Re-Run Audit' : 'Run Audit'}
            </button>
          </div>

          {auditResults && (
            <>
              {/* Summary */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16,
                padding: 16, borderRadius: 12, marginBottom: 16,
                background: score > 90 ? '#f0fdf4' : score > 70 ? '#fffbeb' : '#fef2f2',
                border: `1px solid ${score > 90 ? '#bbf7d0' : score > 70 ? '#fde68a' : '#fecaca'}`,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: scoreColor, color: '#fff',
                  fontSize: 22, fontWeight: 800, flexShrink: 0,
                }}>{score}%</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>
                    Accessibility Score
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                    <span style={{ color: '#166534', fontWeight: 700 }}>{'\u2705'} {passes} passes</span>
                    <span style={{ color: '#991b1b', fontWeight: 700 }}>{'\u274C'} {failures} failures</span>
                    <span style={{ color: '#92400e', fontWeight: 700 }}>{'\u26A0\uFE0F'} {warnings} warnings</span>
                  </div>
                </div>
              </div>

              {/* Filter bar */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[
                  { id: 'all', label: `All (${total})` },
                  { id: 'fail', label: `Failures (${failures})` },
                  { id: 'warning', label: `Warnings (${warnings})` },
                  { id: 'pass', label: `Passes (${passes})` },
                ].map((f) => (
                  <button key={f.id} type="button" onClick={() => setAuditFilter(f.id)} style={{
                    padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    border: auditFilter === f.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: auditFilter === f.id ? '#eff6ff' : '#fff',
                    color: auditFilter === f.id ? '#1d4ed8' : '#64748b',
                  }}>{f.label}</button>
                ))}
              </div>

              {/* Issue cards */}
              <div style={{ display: 'grid', gap: 8, maxHeight: 480, overflowY: 'auto' }}>
                {filteredResults.map((r, i) => (
                  <div key={i} style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: statusColor[r.status],
                    border: `1px solid ${statusBorder[r.status]}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{statusIcon[r.status]}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: statusText[r.status] }}>{r.rule}</span>
                      <span style={{
                        marginLeft: 'auto', padding: '2px 8px', borderRadius: 4, fontSize: 10,
                        fontWeight: 700, textTransform: 'uppercase',
                        background: `${statusBorder[r.status]}80`, color: statusText[r.status],
                      }}>{r.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', marginBottom: 4, lineHeight: 1.5 }}>{r.details}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{r.element}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!auditResults && !running && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{'\uD83D\uDD0D'}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Click "Run Audit" to scan this page for WCAG 2.1 AA compliance</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Checks images, contrast, headings, keyboard access, forms, landmarks, and more</div>
            </div>
          )}
        </div>
      )}

      {/* ═══ VPAT TAB ═══ */}
      {activeTab === 'vpat' && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>VPAT 2.4 — Voluntary Product Accessibility Template</h4>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Web (WCAG 2.1 Level AA) conformance documentation for QuantegyAI.
              </p>
            </div>
            <button type="button" onClick={exportVPAT} style={{
              padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
              background: copied === 'vpat' ? '#22c55e' : '#0f172a', color: '#fff', cursor: 'pointer',
            }}>
              {copied === 'vpat' ? 'Copied!' : 'Export VPAT'}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0', minWidth: 220 }}>Criteria</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0', minWidth: 160 }}>Conformance Level</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Remarks and Explanations</th>
                </tr>
              </thead>
              <tbody>
                {vpatData.map((c) => {
                  const confColor = c.conformance === 'Supports' ? '#166534' : c.conformance === 'Partially Supports' ? '#92400e' : c.conformance === 'Does Not Support' ? '#991b1b' : '#64748b';
                  const confBg = c.conformance === 'Supports' ? '#dcfce7' : c.conformance === 'Partially Supports' ? '#fef9c3' : c.conformance === 'Does Not Support' ? '#fef2f2' : '#f8fafc';
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a', verticalAlign: 'top' }}>
                        {c.id} {c.name}
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>Level {c.level}</div>
                      </td>
                      <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 6,
                          background: confBg, color: confColor, fontWeight: 700, fontSize: 11,
                        }}>{c.conformance}</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569', lineHeight: 1.5, verticalAlign: 'top' }}>{c.remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ STATEMENT TAB ═══ */}
      {activeTab === 'statement' && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>Accessibility Statement Generator</h4>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Auto-generated based on audit results and codebase features. Edit as needed before publishing.
              </p>
            </div>
            <button type="button" onClick={() => copyToClipboard(generateStatement(), 'statement')} style={{
              padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
              background: copied === 'statement' ? '#22c55e' : '#0f172a', color: '#fff', cursor: 'pointer',
            }}>
              {copied === 'statement' ? 'Copied!' : 'Copy Statement'}
            </button>
          </div>

          <div ref={statementRef} style={{
            padding: 20, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0',
            fontFamily: 'system-ui, sans-serif', fontSize: 13, lineHeight: 1.7, color: '#334155',
            whiteSpace: 'pre-wrap', maxHeight: 520, overflowY: 'auto',
          }}>
            {generateStatement()}
          </div>

          {!auditResults && (
            <div role="status" style={{
              marginTop: 12, padding: '10px 16px', borderRadius: 8,
              background: '#fffbeb', border: '1px solid #fde68a', fontSize: 12, color: '#92400e', fontWeight: 600,
            }}>
              Tip: Run an audit first (Audit tab) for the statement to include current compliance data.
            </div>
          )}
        </div>
      )}

      {/* ═══ SETTINGS / LIVE FIXES TAB ═══ */}
      {activeTab === 'settings' && (
        <div style={card}>
          <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>Live Accessibility Enhancements</h4>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>
            Toggle quick-fix accessibility improvements. These add CSS classes to the document root in real time.
          </p>

          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { key: 'highContrast', label: 'High Contrast Mode', desc: 'Increases text contrast and border visibility. Adds a11y-high-contrast class.', icon: '\uD83C\uDF13' },
              { key: 'largeText', label: 'Large Text Mode', desc: 'Scales all text up by 25% for better readability. Adds a11y-large-text class.', icon: '\uD83D\uDD24' },
              { key: 'reduceAnimations', label: 'Reduce Animations', desc: 'Disables transitions and animations site-wide. Adds a11y-reduce-motion class.', icon: '\u23F8\uFE0F' },
              { key: 'focusEnhance', label: 'Focus Indicator Enhancement', desc: 'Makes keyboard focus indicators larger and more visible. Adds a11y-focus-enhance class.', icon: '\uD83D\uDFE2' },
              { key: 'srHints', label: 'Screen Reader Hints', desc: 'Shows hidden ARIA labels and roles visually for testing. Adds a11y-sr-hints class.', icon: '\uD83D\uDDE3\uFE0F' },
            ].map((fix) => (
              <div key={fix.key} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                borderRadius: 10, background: fixes[fix.key] ? '#eff6ff' : '#f8fafc',
                border: `1px solid ${fixes[fix.key] ? '#bfdbfe' : '#e2e8f0'}`,
              }}>
                <span style={{ fontSize: 20 }} aria-hidden="true">{fix.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{fix.label}</div>
                  <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{fix.desc}</div>
                </div>
                <button type="button" onClick={() => toggleFix(fix.key)}
                  aria-pressed={fixes[fix.key]}
                  aria-label={`${fix.label}: ${fixes[fix.key] ? 'On' : 'Off'}`}
                  style={{
                    width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                    background: fixes[fix.key] ? '#2563eb' : '#cbd5e1', position: 'relative',
                    transition: 'background 0.2s',
                  }}>
                  <span style={{
                    position: 'absolute', top: 3, left: fixes[fix.key] ? 25 : 3,
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 8,
            background: '#f0f9ff', border: '1px solid #bae6fd', fontSize: 12, color: '#0c4a6e',
          }}>
            <strong>Note:</strong> These toggles add CSS classes to {'<html>'} for testing and user preference. For production, integrate with user settings and persist preferences via localStorage.
          </div>
        </div>
      )}
    </div>
  );
}
