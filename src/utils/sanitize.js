/**
 * HTML sanitization for safe rendering of user/rich content.
 * Uses DOMPurify to prevent XSS when using dangerouslySetInnerHTML.
 */

import DOMPurify from 'dompurify';
import { formatMathHtml } from './mathFormat';

/**
 * Sanitize HTML for safe display. Allows rich text (Quill) and math (KaTeX) markup.
 * Keeps img src with data: URIs (e.g. drawings) unchanged.
 * @param {string} html - Raw HTML string
 * @returns {string} Sanitized HTML safe for dangerouslySetInnerHTML
 */
/**
 * Validate a returnUrl to prevent open-redirect / javascript: injection.
 * Only allows same-origin paths (starts with `/`, not `//` or protocol).
 */
export function sanitizeReturnUrl(url) {
  if (typeof url !== 'string' || !url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !/^\/\\/.test(trimmed)) {
    try { new URL(trimmed, 'http://localhost'); } catch { return ''; }
    return trimmed;
  }
  return '';
}

export function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';
  if (typeof window === 'undefined') return html; // SSR fallback: pass through (or return '' in strict mode)
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(html);
  const prepared = !hasHtmlTags && html.includes('^') ? formatMathHtml(html) : html;
  return DOMPurify.sanitize(prepared, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'span', 'img', 'ul', 'ol', 'li',
      'blockquote', 'pre', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div',
      'sub', 'sup', 'mark', 'del', 'ins',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'data-value'],
    ALLOW_DATA_ATTR: false,
    ADD_DATA_URI_TAGS: ['img'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data):|[^a-z+.-])/i,
  });
}
