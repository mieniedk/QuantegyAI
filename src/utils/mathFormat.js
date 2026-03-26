/**
 * Format mathematical notation for display.
 *
 * Handles:
 *  - Fractions: (num)/(den) → proper vertical fraction via CSS inline-flex
 *  - Simple fractions: token/token (no spaces) → same
 *  - Exponents: ^(expr) or ^char → <sup>
 *  - Square roots: √(expr), √[expr], ³√expr, √n → √ with vinculum (overline)
 *
 * Use with sanitizeHtml + dangerouslySetInnerHTML when rendering.
 */

/* ── Fraction inline styles ── */
const FRAC =
  'display:inline-flex;flex-direction:column;text-align:center;vertical-align:middle;' +
  'font-size:0.88em;line-height:1.2;margin:0 2px';
const FRAC_NUM = 'border-bottom:1.5px solid currentColor;padding:0 3px 1px';
const FRAC_DEN = 'padding:1px 3px 0';

function renderFrac(numHtml, denHtml) {
  return `<span style="${FRAC}"><span style="${FRAC_NUM}">${numHtml}</span><span style="${FRAC_DEN}">${denHtml}</span></span>`;
}

/* ── Limit operator: lim with subscript underneath ── */
const LIM_WRAP =
  'display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;' +
  'margin:0 3px;line-height:1';
const LIM_OP = 'font-weight:700;font-size:1em;line-height:1.1';
const LIM_SUB = 'font-size:0.72em;line-height:1;margin-top:-1px;white-space:nowrap';

function renderLimit(subscriptHtml) {
  return `<span style="${LIM_WRAP}"><span style="${LIM_OP}">lim</span><span style="${LIM_SUB}">${subscriptHtml}</span></span>`;
}

/* ── Integral with bounds: upper/lower limits beside ∫ ── */
const INT_WRAP =
  'display:inline-flex;align-items:center;vertical-align:middle;margin:0 2px';
const INT_BOUNDS =
  'display:inline-flex;flex-direction:column;align-items:center;font-size:0.68em;' +
  'line-height:1.1;margin-left:-1px;margin-right:2px';

function renderIntegralBounds(upperHtml, lowerHtml) {
  return `<span style="${INT_WRAP}"><span style="font-size:1.25em;line-height:1">∫</span><span style="${INT_BOUNDS}"><span>${upperHtml}</span><span>${lowerHtml}</span></span></span>`;
}

/* ── Radical (square root) via Unicode √ + CSS flex alignment ── */
const RAD_WRAP =
  'display:inline-flex;align-items:flex-start;vertical-align:baseline;' +
  'white-space:nowrap;line-height:1';
const RAD_SIGN =
  'font-size:1.15em;line-height:1;flex-shrink:0';
const RAD_VINCULUM =
  'border-top:1.5px solid currentColor;line-height:1;' +
  'padding:0.08em 2px 0 2px;margin-left:-0.08em';

function renderRadical(innerHtml, indexHtml) {
  const idx = indexHtml
    ? `<sup style="font-size:0.65em;margin-right:-2px">${indexHtml}</sup>`
    : '';
  return `<span style="${RAD_WRAP}">${idx}<span style="${RAD_SIGN}">\u221A</span><span style="${RAD_VINCULUM}">${innerHtml}</span></span>`;
}

/* ── HTML escaping ── */
function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Balanced-paren matcher ── */
function matchParen(s, i) {
  if (i >= s.length || s[i] !== '(') return -1;
  let depth = 1;
  let j = i + 1;
  while (j < s.length && depth > 0) {
    if (s[j] === '(') depth++;
    else if (s[j] === ')') depth--;
    j++;
  }
  return depth === 0 ? j - 1 : -1;
}

/* ── Balanced-bracket matcher ── */
function matchBracket(s, i) {
  if (i >= s.length || s[i] !== '[') return -1;
  let depth = 1;
  let j = i + 1;
  while (j < s.length && depth > 0) {
    if (s[j] === '[') depth++;
    else if (s[j] === ']') depth--;
    j++;
  }
  return depth === 0 ? j - 1 : -1;
}

/* ── Balanced-brace matcher ── */
function matchBrace(s, i) {
  if (i >= s.length || s[i] !== '{') return -1;
  let depth = 1;
  let j = i + 1;
  while (j < s.length && depth > 0) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}') depth--;
    j++;
  }
  return depth === 0 ? j - 1 : -1;
}

/* ── Exponent-char test ── */
const EXP_CHAR = /[a-zA-Z0-9\u00B2\u00B3\u2070-\u2079\u00BD+\-]/;

/* ── Chars that continue a bare radicand (digits, letters, subscripts) ── */
const RADICAL_CHAR = /[a-zA-Z0-9\u2080-\u2089\u2090-\u209C\u0300-\u036F]/;

/* ── Unicode superscript digits used as nth-root index (², ³, etc.) ── */
const SUPERSCRIPT_DIGITS = '\u00B2\u00B3\u2074\u2075\u2076\u2077\u2078\u2079';

/* ── Characters that break a simple-fraction token ── */
function isBreak(ch) {
  return ' \t,;:.=<>!?\n\r'.includes(ch);
}

/**
 * Strip redundant outer parentheses from a fraction component.
 * E.g. "(2a)" → "2a" but "(a)(b)" → "(a)(b)" (not a single matching pair).
 */
function stripOuterParens(s) {
  if (s.length < 2 || s[0] !== '(' || s[s.length - 1] !== ')') return s;
  let depth = 1;
  for (let i = 1; i < s.length - 1; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') depth--;
    if (depth === 0) return s;
  }
  return s.slice(1, -1);
}

function shouldRenderSimpleFraction(numText, denText) {
  const n = (numText || '').trim();
  const d = (denText || '').trim();
  if (!n || !d) return false;
  // Keep trig quotients like sinθ/cosθ and a/sinA in inline form to avoid
  // breaking function grouping in prose.
  if (/(sin|cos|tan|sec|csc|cot)/i.test(n) || /(sin|cos|tan|sec|csc|cot)/i.test(d)) {
    return false;
  }
  // Only auto-stack if at least one side is explicitly numeric.
  if (!/\d/.test(n) && !/\d/.test(d)) return false;
  return true;
}

/**
 * Core recursive parser. Converts raw math text to HTML with proper fractions
 * and superscripts.
 */
function parseMath(s) {
  const tokens = []; // { type:'char', ch } | { type:'html', html }
  let i = 0;

  while (i < s.length) {
    /* ── 1. Parenthesized fraction: (num)/(den) ── */
    if (s[i] === '(') {
      const numClose = matchParen(s, i);
      if (numClose > i) {
        let j = numClose + 1;
        while (j < s.length && s[j] === ' ') j++;
        if (j < s.length && s[j] === '/') {
          let k = j + 1;
          while (k < s.length && s[k] === ' ') k++;
          if (k < s.length && s[k] === '(') {
            const denClose = matchParen(s, k);
            if (denClose > k) {
              const num = s.slice(i + 1, numClose);
              const den = s.slice(k + 1, denClose);
              tokens.push({ type: 'html', html: renderFrac(parseMath(num), parseMath(den)) });
              i = denClose + 1;
              continue;
            }
          }
        }
      }
    }

    /* ── 2. Exponent: ^(expr) or ^chars ── */
    if (s[i] === '^') {
      if (i + 1 < s.length && s[i + 1] === '(') {
        const close = matchParen(s, i + 1);
        if (close > i + 1) {
          tokens.push({ type: 'html', html: '<sup>' + parseMath(s.slice(i + 2, close)) + '</sup>' });
          i = close + 1;
          continue;
        }
      } else {
        let j = i + 1;
        while (j < s.length && EXP_CHAR.test(s[j])) j++;
        if (j > i + 1) {
          tokens.push({ type: 'html', html: '<sup>' + escapeHtml(s.slice(i + 1, j)) + '</sup>' });
          i = j;
          continue;
        }
      }
    }

    /* ── 3. Square root: √(expr), √[expr], ³√n, √n, √ n ── */
    if (s[i] === '\u221A' || s[i] === '√') {
      let indexHtml = '';
      if (tokens.length > 0 && tokens[tokens.length - 1].type === 'char'
          && SUPERSCRIPT_DIGITS.includes(tokens[tokens.length - 1].ch)) {
        indexHtml = escapeHtml(tokens.pop().ch);
      }

      let next = i + 1;
      while (next < s.length && s[next] === ' ') next++;

      if (next < s.length && s[next] === '(') {
        const close = matchParen(s, next);
        if (close > i + 1) {
          tokens.push({ type: 'html', html: renderRadical(parseMath(s.slice(next + 1, close)), indexHtml) });
          i = close + 1;
          continue;
        }
      }

      if (next < s.length && s[next] === '[') {
        const close = matchBracket(s, next);
        if (close > i + 1) {
          tokens.push({ type: 'html', html: renderRadical(parseMath(s.slice(next + 1, close)), indexHtml) });
          i = close + 1;
          continue;
        }
      }

      let j = next;
      while (j < s.length && RADICAL_CHAR.test(s[j])) j++;
      if (j > next) {
        tokens.push({ type: 'html', html: renderRadical(parseMath(s.slice(next, j)), indexHtml) });
        i = j;
        continue;
      }

      tokens.push({ type: 'char', ch: s[i] });
      i++;
      continue;
    }

    /* ── 4. Limit notation: lim_(sub), lim(sub), or lim_{sub} ── */
    if (
      s.slice(i, i + 3) === 'lim' &&
      (i === 0 || /[\s(=,;:+\-]/.test(s[i - 1])) &&
      i + 3 < s.length
    ) {
      let j = i + 3;
      if (s[j] === '_') j++;
      if (j < s.length && (s[j] === '(' || s[j] === '{')) {
        const opener = s[j];
        const close = opener === '(' ? matchParen(s, j) : matchBrace(s, j);
        if (close > j) {
          tokens.push({ type: 'html', html: renderLimit(parseMath(s.slice(j + 1, close))) });
          i = close + 1;
          continue;
        }
      }
    }

    /* ── 4b. Integral with bounds: ∫_(lo)^(hi) or ∫(lo)(hi) ── */
    if ((s[i] === '\u222B' || s[i] === '∫') && i + 1 < s.length) {
      let j = i + 1;
      if (s[j] === '_') j++;
      if (j < s.length && s[j] === '(') {
        const loClose = matchParen(s, j);
        if (loClose > j) {
          let k = loClose + 1;
          if (k < s.length && s[k] === '^') k++;
          if (k < s.length && s[k] === '(') {
            const hiClose = matchParen(s, k);
            if (hiClose > k) {
              const lower = s.slice(j + 1, loClose);
              const upper = s.slice(k + 1, hiClose);
              tokens.push({ type: 'html', html: renderIntegralBounds(parseMath(upper), parseMath(lower)) });
              i = hiClose + 1;
              continue;
            }
          }
        }
      }
    }

    /* ── 5. Simple fraction: token/token (no spaces around /) ── */
    if (s[i] === '/' && i > 0 && i + 1 < s.length && s[i - 1] !== ' ' && s[i + 1] !== ' ') {
      // Gather denominator (forward)
      let denEnd = i + 1;
      let pDepth = 0;
      while (denEnd < s.length) {
        const ch = s[denEnd];
        if (ch === '(') pDepth++;
        else if (ch === ')') { if (pDepth > 0) pDepth--; else break; }
        else if (pDepth === 0 && isBreak(ch)) break;
        denEnd++;
      }

      if (denEnd > i + 1) {
        // Gather numerator (backward through tokens)
        let numChars = [];
        let t = tokens.length - 1;
        let pd = 0;
        while (t >= 0 && tokens[t].type === 'char') {
          const ch = tokens[t].ch;
          if (ch === ')') pd++;
          else if (ch === '(') { if (pd > 0) pd--; else break; }
          else if (pd === 0 && isBreak(ch)) break;
          numChars.unshift(ch);
          t--;
        }

        if (numChars.length > 0) {
          const numText = stripOuterParens(numChars.join(''));
          const denText = stripOuterParens(s.slice(i + 1, denEnd));
          if (shouldRenderSimpleFraction(numText, denText)) {
            tokens.splice(t + 1);
            tokens.push({ type: 'html', html: renderFrac(parseMath(numText), parseMath(denText)) });
            i = denEnd;
            continue;
          }
        }
      }
    }

    /* ── 5. Plain character ── */
    tokens.push({ type: 'char', ch: s[i] });
    i++;
  }

  return tokens.map((t) => (t.type === 'html' ? t.html : escapeHtml(t.ch))).join('');
}

/**
 * Convert raw math text to HTML with proper fractions and superscripts.
 * @param {string} str - e.g. "m = (y₂−y₁)/(x₂−x₁)"
 * @returns {string} HTML with inline-styled fractions and <sup> tags
 */
export function formatMathHtml(str) {
  if (typeof str !== 'string') return '';
  // Normalize common authoring patterns into standard math notation.
  const normalized = str
    // "√ 2" -> "√2" so radicals parse correctly.
    .replace(/([√\u221A])\s+(?=[(\[]|[A-Za-z0-9])/g, '$1')
    // Use standard symbols for common authored operators.
    .replace(/!=/g, '≠')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/->/g, '→')
    // Prefer symbolic infinity over text.
    .replace(/\binfinity\b/gi, '∞')
    // Render the common set-union token.
    .replace(/\sU\s/g, ' ∪ ');
  return parseMath(normalized);
}

/**
 * Convert concept text to bullet-point HTML.
 * Splits on ". " or "; " so each idea becomes its own bullet.
 * Applies formatMathHtml to each bullet for proper rendering.
 */
export function conceptToBulletHtml(str) {
  if (typeof str !== 'string' || !str.trim()) return '';
  const parts = str.split(/\.\s+|;\s+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) return formatMathHtml(str);
  const items = parts.map((p) => `<li>${formatMathHtml(p)}</li>`).join('');
  return `<ul style="margin:0 0 0 18px;padding-left:8px;line-height:1.7">${items}</ul>`;
}
