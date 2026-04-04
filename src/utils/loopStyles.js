/**
 * Unified design tokens for the Practice Loop — Brilliant.org / Duolingo inspired.
 * Every phase card, quiz, button, and interactive component imports from here
 * so the entire loop feels like one cohesive product.
 */

/* ── Palette ── */
export const COLOR = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',

  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',

  green: '#059669',
  greenDark: '#047857',
  greenLight: '#d1fae5',
  greenBorder: '#34d399',

  blue: '#2563eb',
  blueBg: '#eff6ff',
  blueBorder: '#93c5fd',

  purple: '#7c3aed',
  purpleBg: '#f5f3ff',

  amber: '#d97706',
  amberBg: '#fef3c7',
  amberBorder: '#fcd34d',

  red: '#dc2626',
  redBg: '#fef2f2',

  successBg: '#ecfdf5',
  successBorder: '#86efac',
  successText: '#065f46',
};

/* ── Responsive tokens ── */
export const MOBILE_BP = 768;
export const SMALL_PHONE_BP = 390;
export const TIGHT_LANDSCAPE_HEIGHT_BP = 430;

/* ── Page-level layout ── */
export const PAGE_WRAP = {
  minHeight: '100vh',
  background: COLOR.bg,
  fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  padding: '24px 16px 40px',
};

export const PAGE_HEADER = {
  margin: '0 0 4px',
  fontSize: 28,
  fontWeight: 800,
  color: COLOR.text,
  letterSpacing: '-0.02em',
};

export const PAGE_SUBTITLE = {
  margin: '0 0 24px',
  fontSize: 15,
  color: COLOR.textSecondary,
  lineHeight: 1.5,
};

export const SECTION_HEADING = {
  margin: '0 0 14px',
  fontSize: 17,
  fontWeight: 800,
  color: COLOR.text,
};

/* ── Card ── */
export const CARD = {
  background: COLOR.card,
  borderRadius: 16,
  padding: 28,
  border: `1px solid ${COLOR.border}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
};

/* ── Buttons ── */
export const BTN_PRIMARY = {
  width: '100%',
  padding: '14px 24px',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  background: `linear-gradient(135deg, ${COLOR.green}, ${COLOR.greenDark})`,
  color: '#fff',
  border: `2px solid ${COLOR.greenBorder}`,
  borderRadius: 12,
  boxShadow: '0 0 14px rgba(5,150,105,0.25)',
  transition: 'transform 0.1s, box-shadow 0.15s',
};

export const BTN_PRIMARY_DISABLED = {
  ...BTN_PRIMARY,
  background: '#d1d5db',
  border: '2px solid #d1d5db',
  color: '#9ca3af',
  boxShadow: 'none',
  cursor: 'not-allowed',
  opacity: 0.8,
};

export const BTN_SECONDARY = {
  width: '100%',
  marginTop: 10,
  padding: '12px 20px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  background: COLOR.borderLight,
  color: COLOR.textSecondary,
  border: `1px solid ${COLOR.border}`,
  borderRadius: 12,
  transition: 'background 0.15s',
};

export const BTN_GAME_LINK = {
  display: 'block',
  width: '100%',
  padding: '16px 24px',
  fontSize: 17,
  fontWeight: 700,
  textAlign: 'center',
  background: `linear-gradient(135deg, ${COLOR.green}, ${COLOR.greenDark})`,
  color: '#fff',
  borderRadius: 12,
  textDecoration: 'none',
  marginBottom: 10,
  border: `2px solid ${COLOR.greenBorder}`,
  boxShadow: '0 0 14px rgba(5,150,105,0.25)',
};

export const BTN_ACCENT = {
  padding: '12px 20px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`,
  color: '#fff',
  border: `2px solid ${COLOR.blueBorder}`,
  borderRadius: 12,
  boxShadow: '0 0 14px rgba(37,99,235,0.18)',
  transition: 'transform 0.1s, box-shadow 0.15s',
};

export const BTN_PURPLE = {
  padding: '12px 20px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  background: `linear-gradient(135deg, ${COLOR.purple}, #5b21b6)`,
  color: '#fff',
  border: '2px solid #a78bfa',
  borderRadius: 12,
  boxShadow: '0 0 14px rgba(124,58,237,0.18)',
  transition: 'transform 0.1s, box-shadow 0.15s',
};

export const BTN_AMBER = {
  padding: '12px 20px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  background: `linear-gradient(135deg, ${COLOR.amber}, #b45309)`,
  color: '#fff',
  border: `2px solid ${COLOR.amberBorder}`,
  borderRadius: 12,
  boxShadow: '0 0 14px rgba(217,119,6,0.18)',
  transition: 'transform 0.1s, box-shadow 0.15s',
};

export const CHIP = (color, bg) => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  color: color,
  background: bg,
  letterSpacing: '0.01em',
});

/* ── Quiz options ── */
export const OPTION_BASE = {
  padding: '14px 16px',
  textAlign: 'left',
  borderRadius: 12,
  border: `2px solid ${COLOR.border}`,
  background: COLOR.card,
  cursor: 'pointer',
  fontSize: 15,
  lineHeight: 1.5,
  transition: 'border-color 0.15s, background 0.15s',
};

export const OPTION_SELECTED = {
  ...OPTION_BASE,
  borderColor: COLOR.blue,
  background: COLOR.blueBg,
};

export const OPTION_DISABLED = {
  ...OPTION_BASE,
  cursor: 'default',
};

/* ── Phase badge (top of each card) ── */
export const BADGE = {
  display: 'inline-block',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '4px 10px',
  borderRadius: 6,
  marginBottom: 12,
};

/* ── Typography ── */
export const HEADING = {
  margin: '0 0 8px',
  fontSize: 20,
  fontWeight: 800,
  color: COLOR.text,
  lineHeight: 1.3,
};

export const BODY = {
  margin: '0 0 20px',
  fontSize: 15,
  color: COLOR.textSecondary,
  lineHeight: 1.65,
};

export const QUESTION_TEXT = {
  fontWeight: 700,
  color: COLOR.text,
  marginBottom: 10,
  fontSize: 15,
  lineHeight: 1.5,
};

/* ── Result banner ── */
export const resultBanner = (allCorrect) => ({
  padding: '14px 18px',
  borderRadius: 12,
  background: allCorrect ? COLOR.successBg : COLOR.amberBg,
  border: `1px solid ${allCorrect ? COLOR.successBorder : COLOR.amberBorder}`,
  marginTop: 8,
  marginBottom: 20,
});

export const resultTitle = {
  fontSize: 14,
  fontWeight: 800,
  color: COLOR.text,
};

export const resultScore = (allCorrect) => ({
  fontSize: 18,
  fontWeight: 800,
  color: allCorrect ? COLOR.successText : COLOR.amber,
  marginTop: 4,
});

/* ── Scope badge (competency pill) ── */
export const SCOPE_BADGE = {
  display: 'inline-block',
  marginBottom: 12,
  padding: '5px 12px',
  borderRadius: 999,
  background: COLOR.blueBg,
  border: `1px solid ${COLOR.blueBorder}`,
  color: COLOR.blue,
  fontSize: 11,
  fontWeight: 700,
};

/* ── Progress bar ── */
export const PROGRESS_TRACK = {
  height: 8,
  borderRadius: 8,
  background: '#e5e7eb',
  overflow: 'hidden',
};

export const progressFill = (pct, color = COLOR.green) => ({
  width: `${Math.min(100, Math.max(0, pct))}%`,
  height: '100%',
  borderRadius: 8,
  background: color,
  transition: 'width 0.5s ease',
});

/**
 * Spread onto the track element (the bar container) for screen readers / WCAG progressbar.
 * @param {{ value: number, min?: number, max?: number, label?: string, valueText?: string }} opts
 */
export function progressBarA11y({ value, min = 0, max = 100, label, valueText }) {
  const lo = Number(min);
  const hi = Number(max);
  const raw = Number(value);
  const clamped = Number.isFinite(raw) ? Math.min(hi, Math.max(lo, Math.round(raw))) : lo;
  return {
    role: 'progressbar',
    'aria-valuenow': clamped,
    'aria-valuemin': lo,
    'aria-valuemax': hi,
    ...(label ? { 'aria-label': label } : {}),
    ...(valueText != null && String(valueText) !== '' ? { 'aria-valuetext': String(valueText) } : {}),
  };
}
