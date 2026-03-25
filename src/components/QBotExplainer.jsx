import React from 'react';
import qbotImg from '../assets/qbot.svg';
import BaseTenBlocks, { parseBaseTenBlocks } from './BaseTenBlocks';

// ─── Place value labels (right to left) ────────────────────
const PLACE_NAMES = ['Ones', 'Tens', 'Hundreds', 'Thousands', 'Ten-Thous.'];

// ─── Detect rounding problems and generate explanation ──────
function parseRounding(question) {
  if (!question) return null;
  // "Round 720 to the nearest hundred", "What is 467 rounded to the nearest hundred?"
  const m = question.match(/(?:round|rounded?)\s+(\d[\d,]*)\s+to\s+the\s+nearest\s+(ten|hundred|thousand)/i);
  if (!m) return null;
  const num = parseInt(m[1].replace(/,/g, ''));
  const place = m[2].toLowerCase();
  if (isNaN(num)) return null;

  const placeValue = place === 'ten' ? 10 : place === 'hundred' ? 100 : 1000;
  const placeLabel = place === 'ten' ? 'tens' : place === 'hundred' ? 'hundreds' : 'thousands';
  // Which digit do we look at to decide?
  const deciderPlace = place === 'ten' ? 'ones' : place === 'hundred' ? 'tens' : 'hundreds';

  const lower = Math.floor(num / placeValue) * placeValue;
  const upper = lower + placeValue;
  const deciderDigit = place === 'ten'
    ? num % 10
    : place === 'hundred'
      ? Math.floor((num % 100) / 10)
      : Math.floor((num % 1000) / 100);
  const rounded = deciderDigit >= 5 ? upper : lower;
  const direction = deciderDigit >= 5 ? 'UP' : 'DOWN';
  const comparison = deciderDigit >= 5 ? '\u2265 5 (5 or more)' : '< 5 (less than 5)';

  const mid = lower + placeValue / 2;
  const steps = [
    { num: '1', text: `Find the two ${placeLabel} that **${num.toLocaleString()}** is between: **${lower.toLocaleString()}** and **${upper.toLocaleString()}**.` },
    { num: '2', text: `The **midpoint** (halfway) between ${lower.toLocaleString()} and ${upper.toLocaleString()} is **${mid.toLocaleString()}**.` },
    { num: '3', text: `Compare: **${num.toLocaleString()}** is ${deciderDigit >= 5 ? 'equal to or greater than' : 'less than'} **${mid.toLocaleString()}**, so it\u2019s on the **${direction === 'DOWN' ? 'left (lower)' : 'right (upper)'}** side.` },
    { num: '4', text: `The ${deciderPlace} digit is **${deciderDigit}**, which is ${comparison} \u2014 we round **${direction}**.` },
    { num: '5', text: `**${num.toLocaleString()}** rounded to the nearest ${place} is **${rounded.toLocaleString()}**.` },
  ];

  return { type: 'rounding', num, place, placeValue, lower, upper, deciderDigit, rounded, steps };
}

// ─── Detect place-value / compose-decompose problems ────────
const PV_PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands'];
const PV_PLACE_VALUES = [1, 10, 100, 1000, 10000, 100000];

function parsePlaceValue(question) {
  if (!question) return null;

  // Pattern 1: "What is the value of the 4 in 3,472?"
  const valOfMatch = question.match(/value\s+of\s+(?:the\s+)?(\d)\s+in\s+(\d[\d,]*)/i);
  if (valOfMatch) {
    const targetDigit = parseInt(valOfMatch[1]);
    const num = parseInt(valOfMatch[2].replace(/,/g, ''));
    if (isNaN(num) || isNaN(targetDigit)) return null;
    return buildPlaceValueResult(num, targetDigit, null);
  }

  // Pattern 2a: "What digit is in the hundreds place of 3,582?"
  const digitInMatch = question.match(/(?:what\s+)?digit\s+(?:is\s+)?in\s+the\s+(ones|tens|hundreds|thousands|ten.?thousands?)\s+place\s+(?:of|in)\s+(\d[\d,]*)/i);
  if (digitInMatch) {
    const placeName = digitInMatch[1].toLowerCase().replace(/[-\s]/g, '');
    const num = parseInt(digitInMatch[2].replace(/,/g, ''));
    if (isNaN(num)) return null;
    const placeMap = { ones: 0, tens: 1, hundreds: 2, thousands: 3, tenthousands: 4 };
    const placeIdx = placeMap[placeName] ?? 0;
    const digit = Math.floor(num / PV_PLACE_VALUES[placeIdx]) % 10;
    return buildPlaceValueResult(num, digit, placeIdx);
  }

  // Pattern 2b: "3,582 What digit is in the hundreds place?" (Math Sprint format: ctx prepended)
  const ctxDigitMatch = question.match(/^(\d[\d,]*)\s+(?:what\s+)?digit\s+(?:is\s+)?in\s+the\s+(ones|tens|hundreds|thousands|ten.?thousands?)\s+place/i);
  if (ctxDigitMatch) {
    const num = parseInt(ctxDigitMatch[1].replace(/,/g, ''));
    const placeName = ctxDigitMatch[2].toLowerCase().replace(/[-\s]/g, '');
    if (isNaN(num)) return null;
    const placeMap = { ones: 0, tens: 1, hundreds: 2, thousands: 3, tenthousands: 4 };
    const placeIdx = placeMap[placeName] ?? 0;
    const digit = Math.floor(num / PV_PLACE_VALUES[placeIdx]) % 10;
    return buildPlaceValueResult(num, digit, placeIdx);
  }

  // Pattern 2c: number anywhere + "digit in the X place" (generic fallback)
  const anyDigitPlace = question.match(/(?:what\s+)?digit\s+(?:is\s+)?in\s+the\s+(ones|tens|hundreds|thousands|ten.?thousands?)\s+place/i);
  if (anyDigitPlace) {
    const placeName = anyDigitPlace[1].toLowerCase().replace(/[-\s]/g, '');
    const numMatch = question.match(/(\d[\d,]{2,})/);
    if (numMatch) {
      const num = parseInt(numMatch[1].replace(/,/g, ''));
      if (!isNaN(num) && num >= 10) {
        const placeMap = { ones: 0, tens: 1, hundreds: 2, thousands: 3, tenthousands: 4 };
        const placeIdx = placeMap[placeName] ?? 0;
        const digit = Math.floor(num / PV_PLACE_VALUES[placeIdx]) % 10;
        return buildPlaceValueResult(num, digit, placeIdx);
      }
    }
  }

  // Pattern 3: "Find where the digit 5 is sitting in 3,582"
  const findDigitMatch = question.match(/(?:find|where|which\s+place).*?digit\s+(\d)\s+.*?in\s+(\d[\d,]*)/i);
  if (findDigitMatch) {
    const targetDigit = parseInt(findDigitMatch[1]);
    const num = parseInt(findDigitMatch[2].replace(/,/g, ''));
    if (isNaN(num) || isNaN(targetDigit)) return null;
    return buildPlaceValueResult(num, targetDigit, null);
  }

  // Pattern 4: "In X, what place is the digit Y in?"
  const placeOfDigitMatch = question.match(/(?:in\s+)?(\d[\d,]*).*?(?:what\s+place|which\s+place).*?digit\s+(\d)/i);
  if (placeOfDigitMatch) {
    const num = parseInt(placeOfDigitMatch[1].replace(/,/g, ''));
    const targetDigit = parseInt(placeOfDigitMatch[2]);
    if (isNaN(num) || isNaN(targetDigit)) return null;
    return buildPlaceValueResult(num, targetDigit, null);
  }

  // Pattern 5: "3000 + 500 + 80 + 2 = ?" (expanded form → compose number)
  const expandedSumMatch = question.match(/^(\d+(?:\s*\+\s*\d+)+)\s*=\s*\?/);
  if (expandedSumMatch) {
    const parts = expandedSumMatch[1].split('+').map(s => parseInt(s.trim()));
    const allPlaceValues = parts.every(p => {
      if (p === 0) return true;
      const s = String(p);
      return s[0] !== '0' && s.slice(1).split('').every(c => c === '0');
    });
    if (allPlaceValues && parts.length >= 2) {
      const num = parts.reduce((a, b) => a + b, 0);
      const digits = String(num).split('').map(Number);
      return {
        type: 'place-value',
        steps: [
          { num: '1', text: `Each number in the sum represents one digit's value: ${parts.filter(p => p > 0).map(p => `**${p.toLocaleString()}**`).join(', ')}.` },
          { num: '2', text: `Match each to its place: ${parts.filter(p => p > 0).map(p => { const pIdx = String(p).length - 1; return `${p.toLocaleString()} = ${PV_PLACE_NAMES[pIdx] || '?'}`; }).join(', ')}.` },
          { num: '3', text: `Combine them together: ${parts.filter(p => p > 0).join(' + ')} = **${num.toLocaleString()}**.` },
          { num: '4', text: `The expanded form ${parts.filter(p => p > 0).join(' + ')} equals **${num.toLocaleString()}**.` },
        ],
        num,
        digits,
        highlightColIdx: -1,
        targetDigit: null,
        showAllValues: true,
      };
    }
  }

  return null;
}

function buildPlaceValueResult(num, targetDigit, knownPlaceIdx) {
  const numStr = String(num);
  const digits = numStr.split('').map(Number);

  let highlightColIdx = -1;
  let placeName = '';
  let placeValue = 1;
  let digitValue = 0;

  if (knownPlaceIdx !== null && knownPlaceIdx !== undefined) {
    const colIdx = digits.length - 1 - knownPlaceIdx;
    if (colIdx >= 0 && colIdx < digits.length) {
      highlightColIdx = colIdx;
      placeName = PV_PLACE_NAMES[knownPlaceIdx] || `position ${knownPlaceIdx}`;
      placeValue = PV_PLACE_VALUES[knownPlaceIdx] || Math.pow(10, knownPlaceIdx);
      digitValue = targetDigit * placeValue;
    }
  } else {
    for (let i = 0; i < digits.length; i++) {
      if (digits[i] === targetDigit) {
        highlightColIdx = i;
        const placeIdx = digits.length - 1 - i;
        placeName = PV_PLACE_NAMES[placeIdx] || `position ${placeIdx}`;
        placeValue = PV_PLACE_VALUES[placeIdx] || Math.pow(10, placeIdx);
        digitValue = targetDigit * placeValue;
        break;
      }
    }
  }

  if (highlightColIdx < 0) return null;

  const steps = [
    { num: '1', text: `Find where the digit **${targetDigit}** is sitting in **${num.toLocaleString()}**. Reading right to left: ${digits.map((d, i) => `${d} is in ${PV_PLACE_NAMES[digits.length - 1 - i] || '?'}`).reverse().join(', ')}.` },
    { num: '2', text: `The digit **${targetDigit}** is in the **${placeName}** place.` },
    { num: '3', text: `To find the value, multiply the digit by its place: ${targetDigit} \u00D7 ${placeValue.toLocaleString()} = **${digitValue.toLocaleString()}**.` },
    { num: '4', text: `Remember: the "value" of a digit depends on its place. The digit ${targetDigit} in the ${placeName} place is worth **${digitValue.toLocaleString()}**, not just ${targetDigit}.` },
  ];

  return {
    type: 'place-value',
    steps,
    num,
    digits,
    highlightColIdx,
    targetDigit,
    placeName,
    placeValue,
    digitValue,
  };
}

function extractPlaceValueFromSmart(question) {
  if (!question) return null;

  // "3,582 What digit is in the hundreds place?" or "What digit is in the hundreds place?"
  const digitPlaceMatch = question.match(/(?:what\s+)?digit\s+(?:is\s+)?in\s+the\s+(ones|tens|hundreds|thousands|ten.?thousands?)\s+place/i);
  if (digitPlaceMatch) {
    const placeName = digitPlaceMatch[1].toLowerCase().replace(/[-\s]/g, '');
    const placeMap = { ones: 0, tens: 1, hundreds: 2, thousands: 3, tenthousands: 4 };
    const placeIdx = placeMap[placeName] ?? 0;
    const numMatch = question.match(/(\d[\d,]{2,})/);
    if (numMatch) {
      const num = parseInt(numMatch[1].replace(/,/g, ''));
      if (!isNaN(num) && num >= 10) {
        const digit = Math.floor(num / PV_PLACE_VALUES[placeIdx]) % 10;
        return buildPlaceValueResult(num, digit, placeIdx);
      }
    }
  }

  // "What is the expanded form of 5,063?"
  const expandedMatch = question.match(/expanded\s+(?:form|notation)\s+(?:of|for)\s+(\d[\d,]*)/i);
  if (expandedMatch) {
    const num = parseInt(expandedMatch[1].replace(/,/g, ''));
    const digits = String(num).split('').map(Number);
    return {
      type: 'place-value',
      num,
      digits,
      highlightColIdx: -1,
      targetDigit: null,
      showAllValues: true,
    };
  }

  // "3000 + 500 + 80 + 2 = ?" (expanded form sum)
  const expandedSumMatch = question.match(/^(\d+(?:\s*\+\s*\d+)+)\s*=\s*\?/);
  if (expandedSumMatch) {
    const parts = expandedSumMatch[1].split('+').map(s => parseInt(s.trim()));
    const allPlaceValues = parts.every(p => {
      if (p === 0) return true;
      const s = String(p);
      return s[0] !== '0' && s.slice(1).split('').every(c => c === '0');
    });
    if (allPlaceValues && parts.length >= 2) {
      const num = parts.reduce((a, b) => a + b, 0);
      const digits = String(num).split('').map(Number);
      return {
        type: 'place-value',
        num,
        digits,
        highlightColIdx: -1,
        targetDigit: null,
        showAllValues: true,
      };
    }
  }

  return null;
}

// ─── Detect rectangle perimeter / area problems ─────────────
function parseRectangle(question) {
  if (!question) return null;
  const q = question.toLowerCase();
  const isPerimeter = q.includes('perimeter');
  const isArea = q.includes('area');
  if (!isPerimeter && !isArea) return null;

  // "A rectangle has sides of 5 ft and 8 ft" (Math Sprint format)
  let m = question.match(/sides?\s+(?:of\s+)?(\d+)\s*(?:cm|m|in|ft|units?)?\s+and\s+(\d+)/i);
  // "A rectangle is 6 units long and 4 units wide"
  if (!m) m = question.match(/(\d+)\s*(?:cm|m|in|ft|units?)?\s+long\b.*?(\d+)\s*(?:cm|m|in|ft|units?)?\s+wide/i);
  // "length of X ... width of Y"
  if (!m) m = question.match(/(?:length|long)\s+(?:of\s+)?(\d+)\s*(?:cm|m|in|ft|units?)?.*?(?:width|wide)\s+(?:of\s+)?(\d+)/i);
  // "X cm by Y cm"
  if (!m) m = question.match(/(\d+)\s*(?:cm|m|in|ft|units?)?\s+(?:by|×|x)\s+(\d+)/i);
  // square: "sides of X"
  if (!m) {
    const sq = question.match(/square.*?sides?\s+(?:of\s+)?(\d+)/i) || question.match(/(\d+)\s*(?:cm|m|in|ft|units?).*?square/i);
    if (sq) {
      const s = parseInt(sq[1]);
      return { length: s, width: s, isSquare: true, isPerimeter, isArea };
    }
  }
  if (!m) return null;

  const length = Math.max(parseInt(m[1]), parseInt(m[2]));
  const width = Math.min(parseInt(m[1]), parseInt(m[2]));
  return { length, width, isSquare: length === width, isPerimeter, isArea };
}

// ─── Smart explanation generator for any question ───────────
// Attempts to understand the question and generate real step-by-step explanation
function generateSmartExplanation(question, explanation, correctAnswer) {
  if (!question) return null;
  const q = question.toLowerCase();
  const ans = (correctAnswer || '').toString();

  // ── Fraction comparison: "Which is greater: 3/8 or 5/8?" ──
  const fracCompare = question.match(/(?:which|what)\s+(?:fraction\s+)?is\s+(?:greater|larger|bigger|smaller|less)[^?]*?(\d+)\s*\/\s*(\d+)\s+(?:or|and)\s+(\d+)\s*\/\s*(\d+)/i);
  if (fracCompare) {
    const [, n1, d1, n2, d2] = fracCompare.map(Number);
    if (d1 === d2) {
      const bigger = n1 > n2 ? `${n1}/${d1}` : `${n2}/${d2}`;
      const smaller = n1 > n2 ? `${n2}/${d2}` : `${n1}/${d1}`;
      return {
        type: 'fraction', qbotMsg: "When fractions have the same bottom number (denominator), just compare the top numbers!",
        steps: [
          { num: '1', text: `Look at the denominators (bottom numbers): both fractions have ${d1}. That means each piece is the same size — one-${ordinal(d1)} of the whole.` },
          { num: '2', text: `Since the denominators are the same, compare the numerators (top numbers): ${n1} and ${n2}.` },
          { num: '3', text: `${Math.max(n1, n2)} is greater than ${Math.min(n1, n2)}, so ${bigger} has more pieces than ${smaller}.` },
          { num: '4', text: `The answer is ${bigger}. Think of it like pizza slices: ${Math.max(n1, n2)} slices is more than ${Math.min(n1, n2)} slices when they're the same size!` },
        ],
      };
    } else {
      // Different denominators — still explain
      const val1 = n1 / d1, val2 = n2 / d2;
      const bigger = val1 > val2 ? `${n1}/${d1}` : `${n2}/${d2}`;
      return {
        type: 'fraction', qbotMsg: "Let's compare these fractions by finding common ground!",
        steps: [
          { num: '1', text: `The fractions ${n1}/${d1} and ${n2}/${d2} have different denominators (${d1} and ${d2}).` },
          { num: '2', text: `To compare, we can think about what part of the whole each fraction represents.` },
          { num: '3', text: `${n1}/${d1} = ${(val1 * 100).toFixed(0)}% of the whole. ${n2}/${d2} = ${(val2 * 100).toFixed(0)}% of the whole.` },
          { num: '4', text: `${bigger} is the greater fraction.` },
        ],
      };
    }
  }

  // ── Fraction comparison with ○ symbol: "Compare: 2/6 ○ 5/6" ──
  const fracCircle = question.match(/(?:compare|order)[:\s]*(\d+)\s*\/\s*(\d+)\s*[○<>=]\s*(\d+)\s*\/\s*(\d+)/i);
  if (fracCircle) {
    const [, n1, d1, n2, d2] = fracCircle.map(Number);
    if (d1 === d2) {
      const sign = n1 < n2 ? '<' : n1 > n2 ? '>' : '=';
      const word = n1 < n2 ? 'less than' : n1 > n2 ? 'greater than' : 'equal to';
      return {
        type: 'fraction', qbotMsg: "Same denominator? Just compare the top numbers!",
        steps: [
          { num: '1', text: `Both fractions have the same denominator (${d1}). Each piece is the same size.` },
          { num: '2', text: `Compare the numerators: ${n1} and ${n2}.` },
          { num: '3', text: `${n1} is ${word} ${n2}, so ${n1}/${d1} ${sign} ${n2}/${d2}.` },
          { num: '4', text: `The symbol ${sign} goes in the circle. Remember: the open end of < or > points toward the bigger number.` },
        ],
      };
    }
  }

  // ── "Who ate more" / fraction word problems ──
  const fracWho = question.match(/(\w+)\s+(?:ate|has|had|took|drank|read|used)\s+(\d+)\s*\/\s*(\d+).*?(\w+)\s+(?:ate|has|had|took|drank|read|used)\s+(\d+)\s*\/\s*(\d+)/i);
  if (fracWho) {
    const [, name1, n1, d1, name2, n2, d2] = [fracWho[1], ...fracWho.slice(2).map(Number), fracWho[4], ...fracWho.slice(5).map(Number)];
    const nn1 = parseInt(fracWho[2]), dd1 = parseInt(fracWho[3]), nn2 = parseInt(fracWho[5]), dd2 = parseInt(fracWho[6]);
    const nm1 = fracWho[1], nm2 = fracWho[4];
    if (dd1 === dd2) {
      const winner = nn1 > nn2 ? nm1 : nm2;
      const bigN = Math.max(nn1, nn2), smallN = Math.min(nn1, nn2);
      return {
        type: 'fraction', qbotMsg: "Let's figure out who got more by comparing the fractions!",
        steps: [
          { num: '1', text: `${nm1} has ${nn1}/${dd1} and ${nm2} has ${nn2}/${dd2}. Both fractions have the same denominator (${dd1}), so the pieces are the same size.` },
          { num: '2', text: `Compare the numerators (top numbers): ${nn1} vs ${nn2}.` },
          { num: '3', text: `${bigN} is more than ${smallN}, so ${bigN}/${dd1} > ${smallN}/${dd2}.` },
          { num: '4', text: `${winner} has more because ${bigN}/${dd1} is the bigger fraction.` },
        ],
      };
    }
  }

  // ── Order fractions: "Put in order: 5/8, 2/8, 7/8" ──
  const fracOrder = question.match(/(?:order|sort|arrange|put)[^]*?(\d+\/\d+)(?:\s*,\s*(\d+\/\d+))+/i);
  if (fracOrder && q.includes('/')) {
    const fracs = question.match(/\d+\s*\/\s*\d+/g);
    if (fracs && fracs.length >= 2) {
      const parsed = fracs.map(f => { const [n, d] = f.split('/').map(Number); return { n, d, str: `${n}/${d}` }; });
      const sameDenom = parsed.every(f => f.d === parsed[0].d);
      if (sameDenom) {
        const isLeastFirst = q.includes('least') || q.includes('small') || q.includes('ascending');
        const sorted = [...parsed].sort((a, b) => isLeastFirst ? a.n - b.n : b.n - a.n);
        const label = isLeastFirst ? 'least to greatest (smallest first)' : 'greatest to least (biggest first)';
        return {
          type: 'fraction', qbotMsg: "Same denominators make ordering easy — just sort the top numbers!",
          steps: [
            { num: '1', text: `All fractions have the same denominator (${parsed[0].d}), so just compare the numerators.` },
            { num: '2', text: `The numerators are: ${parsed.map(f => f.n).join(', ')}. Sort them ${isLeastFirst ? 'smallest to biggest' : 'biggest to smallest'}: ${sorted.map(f => f.n).join(', ')}.` },
            { num: '3', text: `Put them back as fractions: ${sorted.map(f => f.str).join(', ')}.` },
            { num: '4', text: `From ${label}: ${sorted.map(f => f.str).join(', ')}.` },
          ],
        };
      }
    }
  }

  // ── Fraction number line: "divided into X equal parts. What fraction is at mark Y?" ──
  const fracLineMatch = question.match(/divided\s+into\s+(\d+)\s+equal\s+parts.*?(?:at\s+)?mark\s+(\d+)/i);
  if (fracLineMatch) {
    const dn = parseInt(fracLineMatch[1]), nm = parseInt(fracLineMatch[2]);
    return {
      type: 'fraction',
      qbotMsg: 'A number line helps us see fractions as points between 0 and 1!',
      steps: [
        { num: '1', text: `The number line from 0 to 1 is split into **${dn}** equal parts.` },
        { num: '2', text: `Each part is **1/${dn}** of the whole distance.` },
        { num: '3', text: `Mark ${nm} means we've moved **${nm}** parts from 0. That's ${nm} × (1/${dn}).` },
        { num: '4', text: `So the fraction at mark ${nm} is **${nm}/${dn}**.` },
      ],
    };
  }

  // ── Linear domain/range: "For f(x) = 2x + 3, if domain is all reals, range is ___" → show graph ──
  const linearDomainRange = question.match(/f\s*\(\s*x\s*\)\s*=\s*([^,]+).*?(?:domain|range)/i)
    || question.match(/y\s*=\s*([^,]+).*?(?:domain|range)/i)
    || (q.includes('domain') && q.includes('range') && (q.includes('f(x)') || q.includes('y =') || q.includes('linear')));
  const ansSuggestsAllReals = !ans || ans.toLowerCase().includes('all real') || ans.toLowerCase().includes('reals') || ans.includes('∞') || ans.includes('ℝ');
  if (linearDomainRange && ansSuggestsAllReals) {
    // Try to parse m and b from "2x + 3" or "2x+3"
    const eqMatch = question.match(/f\s*\(\s*x\s*\)\s*=\s*(\d+)\s*x\s*([+-])\s*(\d+)/i) || question.match(/y\s*=\s*(\d+)\s*x\s*([+-])\s*(\d+)/i);
    const m = eqMatch ? parseInt(eqMatch[1], 10) * (eqMatch[2] === '-' ? -1 : 1) : 2;
    const b = eqMatch ? (eqMatch[2] === '-' ? -parseInt(eqMatch[3], 10) : parseInt(eqMatch[3], 10)) : 3;
    return {
      type: 'linearDomainRangeGraph',
      qbotMsg: "For linear functions, the graph is a line that extends forever in both directions — so domain and range are both all real numbers. Here's a graph to show it:",
      graph: { m, b },
      steps: [
        { num: '1', text: `A **linear function** like f(x) = ${m}x ${b >= 0 ? '+' : ''} ${b} has the form y = mx + b. Its graph is a **straight line** with no gaps, no restrictions on x, and no bounds on y.` },
        { num: '2', text: '**Domain** = all possible x-values. You can plug in any real number for x (left/right on the graph goes to −∞ and ∞). So **domain is all reals**.' },
        { num: '3', text: '**Range** = all possible y-values. As x runs over all reals, the line goes up and down without stopping (the line extends infinitely up and down). So **range is all reals**.' },
        { num: '4', text: 'The graph above shows the line: every x gives one y, and every real y is hit. So the answer is **all reals**.' },
      ],
    };
  }

  // ── Shaded fraction: "X equal parts. Y parts are shaded. What fraction is shaded?" ──
  const shadedMatch = question.match(/(\d+)\s+equal\s+parts?.*?(\d+)\s+parts?\s+(?:is|are)\s+shaded/i)
    || question.match(/divided\s+into\s+(\d+)\s+equal\s+parts?.*?(\d+)\s+(?:is|are)\s+shaded/i);
  if (shadedMatch) {
    const dn = parseInt(shadedMatch[1]), nm = parseInt(shadedMatch[2]);
    return {
      type: 'fraction',
      qbotMsg: 'Fractions tell us how many parts of a whole are shaded!',
      steps: [
        { num: '1', text: `The shape is divided into **${dn}** equal parts (this is the **denominator** — the bottom number).` },
        { num: '2', text: `**${nm}** part${nm > 1 ? 's are' : ' is'} shaded (this is the **numerator** — the top number).` },
        { num: '3', text: `Write the fraction: numerator over denominator → **${nm}/${dn}**.` },
        { num: '4', text: `The fraction shaded is **${nm}/${dn}**.` },
      ],
    };
  }

  // ── Compose fractions: "1/4 + 1/4 + 1/4 = ?" ──
  const composeMatch = question.match(/^((?:\d+\/\d+\s*\+\s*)+\d+\/\d+)\s*=\s*\?/);
  if (composeMatch) {
    const parts = composeMatch[1].split('+').map(s => s.trim());
    const firstFrac = parts[0].match(/(\d+)\/(\d+)/);
    if (firstFrac) {
      const unitN = parseInt(firstFrac[1]), unitD = parseInt(firstFrac[2]);
      const count = parts.length;
      const totalN = unitN * count;
      return {
        type: 'fraction',
        qbotMsg: 'Adding unit fractions is like counting equal pieces!',
        steps: [
          { num: '1', text: `We are adding **${count}** copies of **${unitN}/${unitD}**.` },
          { num: '2', text: `Since all fractions have the same denominator (${unitD}), we just add the numerators.` },
          { num: '3', text: `${parts.map(() => unitN).join(' + ')} = **${totalN}** (that's ${count} × ${unitN}).` },
          { num: '4', text: `Keep the denominator the same: **${totalN}/${unitD}**.` },
        ],
      };
    }
  }

  // ── "How many does each person get?" (equal sharing / partition) ──
  if (q.includes('each person get') || q.includes('each get') || q.includes('shared equally')) {
    const shareMatch = question.match(/(\d+)\s+\w+\s+shared\s+equally\s+among\s+(\d+)/i)
      || question.match(/(\d+).*?(\d+)\s+(?:friends|people|kids|children|students)/i);
    if (shareMatch) {
      const total = parseInt(shareMatch[1]), people = parseInt(shareMatch[2]);
      const each = Math.floor(total / people);
      return {
        type: 'division',
        qbotMsg: 'Equal sharing means everyone gets the same amount!',
        steps: [
          { num: '1', text: `We have **${total}** items to share equally among **${people}** people.` },
          { num: '2', text: `This is a division problem: ${total} ÷ ${people}.` },
          { num: '3', text: `${each} × ${people} = ${each * people}, so each person gets **${each}**.` },
          { num: '4', text: `The answer is **${each}**.` },
        ],
      };
    }
  }

  // ── "How many objects in all?" (equal groups / arrays) ──
  if (q.includes('in all') || q.includes('objects') || q.includes('how many')) {
    const groupMatch = question.match(/(\d+)\s+(?:rows?|groups?|bags?|boxes?|packs?)\s+(?:with|of)\s+(\d+)/i);
    if (groupMatch) {
      const groups = parseInt(groupMatch[1]), per = parseInt(groupMatch[2]);
      return {
        type: 'multiplication',
        qbotMsg: 'Equal groups means we can multiply!',
        steps: [
          { num: '1', text: `There are **${groups}** groups with **${per}** in each group.` },
          { num: '2', text: `To find the total, multiply: ${groups} × ${per}.` },
          { num: '3', text: `${groups} × ${per} = **${groups * per}**.` },
          { num: '4', text: `There are **${groups * per}** objects in all.` },
        ],
      };
    }
  }

  // ── "X times as much as what number?" (multiplicative comparison) ──
  const multCompMatch = question.match(/(\d+)\s*[×x\*]\s*(\d+)\s+means\s+(\d+)\s+times\s+as\s+much\s+as\s+what/i);
  if (multCompMatch) {
    const a = parseInt(multCompMatch[1]), b = parseInt(multCompMatch[2]);
    return {
      type: 'multiplication',
      qbotMsg: '"Times as much" means multiplication compares two amounts!',
      steps: [
        { num: '1', text: `"${a} times as much as what number?" means ${a} × ? = ${a * b}.` },
        { num: '2', text: `We already see the multiplication: ${a} × **${b}**.` },
        { num: '3', text: `So the "what number" is **${b}**.` },
        { num: '4', text: `${a} times as much as **${b}** is ${a * b}.` },
      ],
    };
  }

  // ── "If A × B = C, then C ÷ A = ?" (quotient relation / fact families) ──
  const factFamilyMatch = question.match(/if\s+(\d+)\s*[×x\*]\s*(\d+)\s*=\s*(\d+).*?(\d+)\s*÷\s*(\d+)\s*=\s*\?/i);
  if (factFamilyMatch) {
    const a = parseInt(factFamilyMatch[1]), b = parseInt(factFamilyMatch[2]), product = parseInt(factFamilyMatch[3]);
    const divisor = parseInt(factFamilyMatch[5]);
    const answer = divisor === a ? b : a;
    return {
      type: 'division',
      qbotMsg: 'Multiplication and division are related — they\'re fact families!',
      steps: [
        { num: '1', text: `We know that **${a} × ${b} = ${product}**.` },
        { num: '2', text: `Multiplication and division are inverse operations. If ${a} × ${b} = ${product}, then ${product} ÷ ${a} = ${b} and ${product} ÷ ${b} = ${a}.` },
        { num: '3', text: `So ${product} ÷ ${divisor} = **${answer}**.` },
        { num: '4', text: `The answer is **${answer}**. Think of it: ${divisor} groups of ${answer} make ${product}.` },
      ],
    };
  }

  // ── Patterns: "2, 5, 8, 11, ___" ──
  if (q.includes('___') || q.includes('next in the pattern') || q.includes('what comes next')) {
    const nums = question.match(/\d+/g);
    if (nums && nums.length >= 3) {
      const seq = nums.map(Number);
      const diffs = [];
      for (let si = 1; si < seq.length; si++) diffs.push(seq[si] - seq[si - 1]);
      const isConstant = diffs.every(d => d === diffs[0]);
      if (isConstant && diffs.length > 0) {
        const step = diffs[0];
        const next = seq[seq.length - 1] + step;
        return {
          type: 'pattern',
          qbotMsg: 'Look for the rule — what\'s happening each time?',
          steps: [
            { num: '1', text: `The sequence is: **${seq.join(', ')}**.` },
            { num: '2', text: `Find the pattern: each number ${step > 0 ? 'increases' : 'decreases'} by **${Math.abs(step)}**.` },
            { num: '3', text: `The rule is: **${step > 0 ? '+' : ''}${step}** each time.` },
            { num: '4', text: `The last number is ${seq[seq.length - 1]}. Add ${step}: ${seq[seq.length - 1]} + ${step} = **${next}**.` },
          ],
        };
      }
    }
  }

  // ── Coins: "How many cents?" ──
  if (q.includes('cents') || q.includes('quarter') || q.includes('dime') || q.includes('nickel') || q.includes('pennies') || q.includes('penny')) {
    return {
      type: 'money',
      qbotMsg: 'Let\'s count each type of coin and add them up!',
      steps: [
        { num: '1', text: `Remember coin values: Quarter = 25¢, Dime = 10¢, Nickel = 5¢, Penny = 1¢.` },
        { num: '2', text: `Multiply each coin count by its value, then add them all together.` },
        { num: '3', text: `The total is **${ans}** cents.` },
      ],
    };
  }

  // ── Even / Odd ──
  if (q.includes('even or odd') || q.includes('is even') || q.includes('is odd')) {
    const evenOddNum = question.match(/(\d+)/);
    if (evenOddNum) {
      const n = parseInt(evenOddNum[1]);
      const lastDigit = n % 10;
      const isEven = n % 2 === 0;
      return {
        type: 'number-sense',
        qbotMsg: 'Look at the ones digit to tell if a number is even or odd!',
        steps: [
          { num: '1', text: `Look at the last digit (ones place) of **${n}**. It is **${lastDigit}**.` },
          { num: '2', text: `Even digits: 0, 2, 4, 6, 8. Odd digits: 1, 3, 5, 7, 9.` },
          { num: '3', text: `**${lastDigit}** is ${isEven ? 'even' : 'odd'}, so **${n}** is **${isEven ? 'Even' : 'Odd'}**.` },
        ],
      };
    }
  }

  // ── Missing factor: "5 × ___ = 35" ──
  const missingFactorMatch = question.match(/(\d+)\s*[×x\*]\s*___?\s*=\s*(\d+)/i);
  if (missingFactorMatch) {
    const a = parseInt(missingFactorMatch[1]), product = parseInt(missingFactorMatch[2]);
    const missing = Math.floor(product / a);
    return {
      type: 'multiplication',
      qbotMsg: 'Find the missing factor by thinking about division!',
      steps: [
        { num: '1', text: `We need: ${a} × ___ = ${product}.` },
        { num: '2', text: `Think: what number times ${a} makes ${product}? That's the same as ${product} ÷ ${a}.` },
        { num: '3', text: `${product} ÷ ${a} = **${missing}**.` },
        { num: '4', text: `Check: ${a} × ${missing} = ${a * missing}. ✓ The missing factor is **${missing}**.` },
      ],
    };
  }

  // ── Elapsed time: "preview is X min. movie is Y min" ──
  if (q.includes('total time') || q.includes('how long') || q.includes('altogether')) {
    const timeParts = question.match(/(\d+)\s*min/g);
    if (timeParts && timeParts.length >= 2) {
      const times = timeParts.map(t => parseInt(t));
      const total = times.reduce((a, b) => a + b, 0);
      return {
        type: 'time',
        qbotMsg: 'Add the times together to find the total!',
        steps: [
          { num: '1', text: `The times are: ${times.map(t => `**${t}** minutes`).join(' and ')}.` },
          { num: '2', text: `Add them: ${times.join(' + ')} = **${total}** minutes.` },
          { num: '3', text: `The total time is **${total}** minutes.` },
        ],
      };
    }
  }

  // ── Multiplication: "6 × 7 = ?" or "What is 6 times 7?" ──
  const multMatch = question.match(/(\d+)\s*[×x\*]\s*(\d+)/i) || question.match(/(\d+)\s+times\s+(\d+)/i);
  if (multMatch) {
    const a = parseInt(multMatch[1]), b = parseInt(multMatch[2]);
    const product = a * b;
    return {
      type: 'multiplication', qbotMsg: `Multiplication is just repeated addition! Let me show you ${a} × ${b}.`,
      steps: [
        { num: '1', text: `${a} × ${b} means "${a} groups of ${b}" (or ${b} groups of ${a}).` },
        { num: '2', text: `Think of it as adding ${b} a total of ${a} times: ${Array(Math.min(a, 10)).fill(b).join(' + ')}${a > 10 ? ' + ...' : ''}.` },
        { num: '3', text: `Count up: ${Array.from({ length: Math.min(a, 10) }, (_, i) => b * (i + 1)).join(', ')}${a > 10 ? ', ...' : ''}.` },
        { num: '4', text: `${a} × ${b} = ${product}.` },
      ],
    };
  }

  // ── Division: "24 ÷ 6 = ?" or "What is 24 divided by 6?" ──
  const divMatch = question.match(/(\d+)\s*[÷/]\s*(\d+)/i) || question.match(/(\d+)\s+divided\s+by\s+(\d+)/i);
  if (divMatch) {
    const a = parseInt(divMatch[1]), b = parseInt(divMatch[2]);
    if (b !== 0) {
      const quotient = Math.floor(a / b), remainder = a % b;
      const stepsArr = [
        { num: '1', text: `${a} ÷ ${b} means "how many groups of ${b} fit into ${a}?"` },
        { num: '2', text: `Think of the multiplication fact: ? × ${b} = ${a}.` },
        { num: '3', text: `${quotient} × ${b} = ${quotient * b}${remainder ? ` with ${remainder} left over` : ''}.` },
      ];
      if (remainder) {
        stepsArr.push({ num: '4', text: `${a} ÷ ${b} = ${quotient} remainder ${remainder}. (${quotient} groups of ${b} is ${quotient * b}, plus ${remainder} more makes ${a}.)` });
      } else {
        stepsArr.push({ num: '4', text: `${a} ÷ ${b} = ${quotient}. It divides evenly!` });
      }
      return { type: 'division', qbotMsg: `Division is sharing equally! Let's figure out ${a} ÷ ${b}.`, steps: stepsArr };
    }
  }

  // ── Perimeter: rectangle/square ──
  const perimRect = question.match(/(?:length|long)\s+(?:of\s+)?(\d+)\s*(?:cm|m|in|ft|inches|meters|feet)?\s+.*?(?:width|wide)\s+(?:of\s+)?(\d+)/i)
    || question.match(/(\d+)\s*(?:cm|m|in|ft|inches|meters|feet)\s+(?:long|length).*?(\d+)\s*(?:cm|m|in|ft|inches|meters|feet)\s+(?:wide|width)/i);
  if (perimRect && q.includes('perimeter')) {
    const l = parseInt(perimRect[1]), w = parseInt(perimRect[2]);
    const p = 2 * (l + w);
    return {
      type: 'perimeter', qbotMsg: "Perimeter means walking ALL the way around the outside!",
      steps: [
        { num: '1', text: `A rectangle has 2 long sides (${l}) and 2 short sides (${w}).` },
        { num: '2', text: `Add all four sides: ${l} + ${w} + ${l} + ${w}.` },
        { num: '3', text: `${l} + ${w} = ${l + w}, then ${l + w} + ${l} = ${l + w + l}, then ${l + w + l} + ${w} = ${p}.` },
        { num: '4', text: `The perimeter is ${p}. Shortcut: P = 2 × (${l} + ${w}) = 2 × ${l + w} = ${p}.` },
      ],
    };
  }

  const perimSquare = question.match(/square.*?sides?\s+(?:of\s+)?(\d+)/i) || question.match(/(\d+)\s*(?:cm|m|in|ft|inches|meters|feet).*?square/i);
  if (perimSquare && q.includes('perimeter')) {
    const s = parseInt(perimSquare[1]);
    return {
      type: 'perimeter', qbotMsg: "A square has 4 equal sides — so this is easy!",
      steps: [
        { num: '1', text: `A square has 4 equal sides. Each side is ${s}.` },
        { num: '2', text: `Perimeter = add all four sides: ${s} + ${s} + ${s} + ${s}.` },
        { num: '3', text: `${s} × 4 = ${s * 4}.` },
        { num: '4', text: `The perimeter is ${s * 4}.` },
      ],
    };
  }

  // ── Expanded form: "What is the expanded form of 5,063?" ──
  const expandedMatch = question.match(/expanded\s+(?:form|notation)\s+(?:of|for)\s+(\d[\d,]*)/i);
  if (expandedMatch) {
    const num = parseInt(expandedMatch[1].replace(/,/g, ''));
    const placeNames = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
    const placeVals = [1, 10, 100, 1000, 10000];
    const digits = String(num).split('').reverse().map(Number);
    const parts = [];
    const stepsArr = [];
    let stepN = 1;
    for (let i = digits.length - 1; i >= 0; i--) {
      if (digits[i] !== 0) {
        const val = digits[i] * placeVals[i];
        stepsArr.push({ num: String(stepN++), text: `The digit ${digits[i]} is in the ${placeNames[i]} place. Its value is ${digits[i]} × ${placeVals[i].toLocaleString()} = ${val.toLocaleString()}.` });
        parts.push(val.toLocaleString());
      }
    }
    stepsArr.push({ num: String(stepN), text: `The expanded form is: ${parts.join(' + ')}.` });
    return { type: 'place-value', qbotMsg: "Expanded form breaks a number into the value of each digit!", steps: stepsArr };
  }

  // ── "What digit is in the X place?" (Math Sprint format — number in ctx) ──
  const digitPlaceMatch = question.match(/what\s+digit\s+(?:is\s+)?in\s+the\s+(ones|tens|hundreds|thousands|ten.?thousands?)\s+place/i);
  if (digitPlaceMatch) {
    const placeName = digitPlaceMatch[1].toLowerCase().replace(/[-\s]/g, '');
    const placeMap = { ones: 0, tens: 1, hundreds: 2, thousands: 3, tenthousands: 4 };
    const placeIdx = placeMap[placeName] ?? 0;
    const placeValues = [1, 10, 100, 1000, 10000];
    const placeLabels = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
    const posOrdinals = ['1st (rightmost)', '2nd from the right', '3rd from the right', '4th from the right', '5th from the right'];
    // Try to find the number from the question or the correctAnswer context
    const numMatch = question.match(/(\d[\d,]+)/);
    if (numMatch) {
      const num = parseInt(numMatch[1].replace(/,/g, ''));
      const digit = Math.floor(num / placeValues[placeIdx]) % 10;
      const numDigits = String(num).split('').reverse().map(Number);
      const breakdown = [];
      for (let i = Math.min(numDigits.length - 1, 4); i >= 0; i--) {
        breakdown.push(`**${placeLabels[i]}**: ${numDigits[i]}`);
      }
      return {
        type: 'place-value',
        qbotMsg: `Each digit in a number has a position called its place value. Let's find the ${placeLabels[placeIdx]} digit!`,
        steps: [
          { num: '1', text: `Write out the number: **${num.toLocaleString()}**.` },
          { num: '2', text: `Break it down by place value (right to left): ${breakdown.join(', ')}.` },
          { num: '3', text: `The **${placeLabels[placeIdx]}** place is the ${posOrdinals[placeIdx]} digit.` },
          { num: '4', text: `The digit in the ${placeLabels[placeIdx]} place of ${num.toLocaleString()} is **${digit}**.` },
        ],
      };
    }
  }

  // ── Compare / order numbers: "> < =" questions ──
  if (q.includes('>') || q.includes('<') || q.includes('symbol') || q.includes('compare')) {
    const cmpMatch = question.match(/(\d[\d,]*)\s*___?\s*(\d[\d,]*)/);
    if (cmpMatch) {
      const a = parseInt(cmpMatch[1].replace(/,/g, '')), b = parseInt(cmpMatch[2].replace(/,/g, ''));
      const sym = a > b ? '>' : a < b ? '<' : '=';
      const word = a > b ? 'greater than' : a < b ? 'less than' : 'equal to';
      return {
        type: 'compare', qbotMsg: 'Compare the numbers by looking at place values from left to right!',
        steps: [
          { num: '1', text: `Look at the two numbers: **${a.toLocaleString()}** and **${b.toLocaleString()}**.` },
          { num: '2', text: `Compare from the highest place value. Which number is bigger?` },
          { num: '3', text: `${a.toLocaleString()} is ${word} ${b.toLocaleString()}.` },
          { num: '4', text: `The correct symbol is **${sym}**. Remember: the open side of < or > points to the bigger number.` },
        ],
      };
    }
  }

  // ── Unit fraction: "What fraction is ONE slice?" ──
  if (q.includes('one slice') || q.includes('one piece') || q.includes('one part') || (q.includes('1/') && q.includes('equal'))) {
    const partMatch = question.match(/(\d+)\s+equal\s+(parts?|slices?|pieces?|sections?)/i);
    if (partMatch) {
      const dn = parseInt(partMatch[1]);
      return {
        type: 'fraction', qbotMsg: 'A unit fraction is one piece of a whole divided into equal parts!',
        steps: [
          { num: '1', text: `The whole is divided into **${dn}** equal parts.` },
          { num: '2', text: `Each part is the same size — one out of ${dn} parts.` },
          { num: '3', text: `One part out of ${dn} is written as a fraction: **1/${dn}**.` },
          { num: '4', text: `The answer is **1/${dn}**.` },
        ],
      };
    }
  }

  // ── Equivalent fractions: "X/Y = ?/Z" ──
  const eqFracMatch = question.match(/(\d+)\s*\/\s*(\d+)\s*=\s*\?\s*\/\s*(\d+)/);
  if (eqFracMatch) {
    const [, n1, d1, d2] = eqFracMatch.map(Number);
    const multiplier = d2 / d1;
    const n2 = n1 * multiplier;
    return {
      type: 'fraction', qbotMsg: 'Equivalent fractions represent the same amount — we multiply top and bottom by the same number!',
      steps: [
        { num: '1', text: `We need: ${n1}/${d1} = ?/${d2}.` },
        { num: '2', text: `The denominator changed from ${d1} to ${d2}. That's × ${multiplier}.` },
        { num: '3', text: `Multiply the numerator by the same number: ${n1} × ${multiplier} = **${n2}**.` },
        { num: '4', text: `So ${n1}/${d1} = **${n2}/${d2}**. The missing number is **${n2}**.` },
      ],
    };
  }

  // ── "Are X/Y and A/B equivalent?" ──
  if (q.includes('equivalent') && q.includes('/')) {
    const eqMatch = question.match(/(\d+)\s*\/\s*(\d+).*?(\d+)\s*\/\s*(\d+)/);
    if (eqMatch) {
      const [, n1, d1, n2, d2] = eqMatch.map(Number);
      const isEq = n1 * d2 === n2 * d1;
      return {
        type: 'fraction', qbotMsg: 'Two fractions are equivalent if they represent the same point on a number line!',
        steps: [
          { num: '1', text: `Compare ${n1}/${d1} and ${n2}/${d2}.` },
          { num: '2', text: `Cross-multiply to check: ${n1} × ${d2} = ${n1 * d2}, and ${n2} × ${d1} = ${n2 * d1}.` },
          { num: '3', text: `${n1 * d2} ${n1 * d2 === n2 * d1 ? '=' : '≠'} ${n2 * d1}, so they are ${isEq ? '' : 'NOT '}equivalent.` },
          { num: '4', text: `The answer is **${isEq ? 'Yes' : 'No'}**.` },
        ],
      };
    }
  }

  // ── Capacity vs. Weight ──
  if (q.includes('capacity') || q.includes('weight') || q.includes('measured by')) {
    return {
      type: 'measurement', qbotMsg: 'Think about what you are measuring — how heavy, or how much liquid?',
      steps: [
        { num: '1', text: `Read the situation carefully.` },
        { num: '2', text: `**Weight** measures how heavy something is (grams, kilograms, pounds).` },
        { num: '3', text: `**Capacity** (liquid volume) measures how much liquid fits inside (liters, milliliters, cups).` },
        { num: '4', text: `The correct answer is **${ans}**.` },
      ],
    };
  }

  // ── Shapes: faces, edges, vertices ──
  if (q.includes('faces') || q.includes('edges') || q.includes('vertices') || q.includes('sides')) {
    const shapeMatch = question.match(/(cube|rectangular prism|triangular prism|sphere|cylinder|cone|quadrilateral|rectangle|square|trapezoid|rhombus|parallelogram)/i);
    if (shapeMatch) {
      const shape = shapeMatch[1].toLowerCase();
      return {
        type: 'geometry', qbotMsg: `Let's think about the properties of a ${shape}!`,
        steps: [
          { num: '1', text: `Identify the shape: **${shape}**.` },
          { num: '2', text: `Think about its properties — count the faces, edges, vertices, or sides.` },
          { num: '3', text: `The answer is **${ans}**.` },
        ],
      };
    }
  }

  // ── Repeated addition / multiplication representation ──
  const repAddMatch = question.match(/^(\d+(?:\s*\+\s*\d+)+)\s*=\s*\?/);
  if (repAddMatch) {
    const nums = repAddMatch[1].split('+').map(s => parseInt(s.trim()));
    const allSame = nums.every(n => n === nums[0]);
    if (allSame) {
      const total = nums[0] * nums.length;
      return {
        type: 'multiplication', qbotMsg: 'Repeated addition is the same as multiplication!',
        steps: [
          { num: '1', text: `We're adding ${nums[0]} a total of **${nums.length}** times.` },
          { num: '2', text: `That's the same as ${nums.length} × ${nums[0]}.` },
          { num: '3', text: `${nums.length} × ${nums[0]} = **${total}**.` },
          { num: '4', text: `The answer is **${total}**.` },
        ],
      };
    }
  }

  // ── Financial literacy / conceptual questions ──
  if (q.includes('credit') || q.includes('borrow') || q.includes('interest') || q.includes('saving') || q.includes('income') || q.includes('scarcity') || q.includes('spending') || q.includes('labor') || q.includes('human capital')) {
    return {
      type: 'financial', qbotMsg: 'This is a personal financial literacy question. Let\'s think it through!',
      steps: [
        { num: '1', text: `Read the question: "${question.length > 80 ? question.slice(0, 80) + '...' : question}"` },
        { num: '2', text: `Think about the key vocabulary: what do the money-related words mean?` },
        { num: '3', text: `The correct answer is **${ans}**.` },
      ],
    };
  }

  // ── Data / graphs questions ──
  if (q.includes('how many students') || q.includes('bar graph') || q.includes('frequency') || q.includes('data') || q.includes('favorite')) {
    return {
      type: 'data', qbotMsg: 'Read the data carefully and use addition or subtraction to solve!',
      steps: [
        { num: '1', text: `Look at the data provided in the question.` },
        { num: '2', text: `Find the numbers you need and decide: add, subtract, or compare?` },
        { num: '3', text: `The correct answer is **${ans}**.` },
      ],
    };
  }

  // ── Elapsed time: common patterns ──
  const timeMatch = question.match(/(\d{1,2}):(\d{2})\s*(AM|PM).*?(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (timeMatch && (q.includes('how long') || q.includes('elapsed') || q.includes('how many'))) {
    const [, h1, m1, p1, h2, m2, p2] = timeMatch;
    let mins1 = parseInt(h1) * 60 + parseInt(m1);
    let mins2 = parseInt(h2) * 60 + parseInt(m2);
    if (p1.toUpperCase() === 'PM' && parseInt(h1) !== 12) mins1 += 720;
    if (p2.toUpperCase() === 'PM' && parseInt(h2) !== 12) mins2 += 720;
    if (p1.toUpperCase() === 'AM' && parseInt(h1) === 12) mins1 -= 720;
    if (p2.toUpperCase() === 'AM' && parseInt(h2) === 12) mins2 -= 720;
    const diff = mins2 - mins1;
    if (diff > 0) {
      const hrs = Math.floor(diff / 60), mins = diff % 60;
      const timeStr = hrs > 0 ? (mins > 0 ? `${hrs} hour${hrs > 1 ? 's' : ''} and ${mins} minute${mins > 1 ? 's' : ''}` : `${hrs} hour${hrs > 1 ? 's' : ''}`) : `${mins} minutes`;
      return {
        type: 'time', qbotMsg: "Let's count the time from start to finish!",
        steps: [
          { num: '1', text: `Start time: ${h1}:${m1} ${p1}. End time: ${h2}:${m2} ${p2}.` },
          { num: '2', text: `Count forward from the start time to the end time.` },
          { num: '3', text: `The difference is ${diff} minutes total${hrs > 0 ? ` (${hrs} hour${hrs > 1 ? 's' : ''} × 60 = ${hrs * 60} minutes, plus ${mins} minutes)` : ''}.` },
          { num: '4', text: `The elapsed time is ${timeStr}.` },
        ],
      };
    }
  }

  // ── Generic: if we have a meaningful explanation, use it ──
  if (ans && explanation) {
    const cleaned = explanation.replace(/work through the problem[^.]*\./i, '').replace(/the correct answer is[^.]*\./i, '').trim();
    if (cleaned.length > 20 && !/^(give|here'?s? the explanation:?)\s*$/i.test(cleaned)) {
      return {
        type: 'generic', qbotMsg: "Here's how to think about this problem!",
        steps: [
          { num: '1', text: `Read the question carefully: "${question.length > 80 ? question.slice(0, 80) + '...' : question}"` },
          { num: '2', text: cleaned },
          { num: '3', text: `The correct answer is **${ans}**.` },
        ],
      };
    }
  }

  // ── Last resort: show graph of function when possible, otherwise just the correct answer
  if (ans) {
    // If question involves a linear function (domain/range or similar), show graph instead of "try more practice"
    const eqMatch = question.match(/f\s*\(\s*x\s*\)\s*=\s*(\d+)\s*x\s*([+-])\s*(\d+)/i) || question.match(/y\s*=\s*(\d+)\s*x\s*([+-])\s*(\d+)/i);
    if (eqMatch && (q.includes('domain') || q.includes('range') || q.includes('function'))) {
      const m = parseInt(eqMatch[1], 10) * (eqMatch[2] === '-' ? -1 : 1);
      const b = eqMatch[2] === '-' ? -parseInt(eqMatch[3], 10) : parseInt(eqMatch[3], 10);
      return {
        type: 'linearDomainRangeGraph',
        qbotMsg: "For linear functions, the graph is a line that extends forever in both directions — so domain and range are both all real numbers. Here's a graph to show it:",
        graph: { m, b },
        steps: [
          { num: '1', text: `A **linear function** like f(x) = ${m}x ${b >= 0 ? '+' : ''} ${b} has the form y = mx + b. Its graph is a **straight line** with no gaps, no restrictions on x, and no bounds on y.` },
          { num: '2', text: '**Domain** = all possible x-values. You can plug in any real number for x (left/right on the graph goes to −∞ and ∞). So **domain is all reals**.' },
          { num: '3', text: '**Range** = all possible y-values. As x runs over all reals, the line goes up and down without stopping (the line extends infinitely up and down). So **range is all reals**.' },
          { num: '4', text: `The graph above shows the line: every x gives one y, and every real y is hit. So the answer is **${ans}**.` },
        ],
      };
    }
    return {
      type: 'generic',
      qbotMsg: "Here's a step-by-step approach you can use:",
      steps: [
        { num: '1', text: '**Read the question carefully** — Identify what it is asking and what information is given.' },
        { num: '2', text: '**Plan your approach** — Decide which strategy, formula, or operation fits (e.g., addition, comparison, substitution).' },
        { num: '3', text: '**Work through it** — Apply your plan step by step, showing your work.' },
        { num: '4', text: `**Check your answer** — The correct answer is **${ans}**. Compare with your work to see where your reasoning led.` },
      ],
    };
  }

  return null;
}

// Helper: ordinal name for denominator
function ordinal(d) {
  if (d === 2) return 'half';
  if (d === 3) return 'third';
  if (d === 4) return 'fourth';
  if (d === 5) return 'fifth';
  if (d === 6) return 'sixth';
  if (d === 8) return 'eighth';
  if (d === 10) return 'tenth';
  if (d === 12) return 'twelfth';
  return `${d}th`;
}

// ─── Extract arithmetic from question text ─────────────────
function parseArithmetic(question, explanation) {
  if (!question) return null;

  // Direct patterns: "345 + 278", "802 − 356", "167 + 245 = ?"
  const directPat = /(\d[\d,]*)\s*([+\u2212\-])\s*(\d[\d,]*)/;
  const m = question.match(directPat);
  if (m) {
    const n1 = parseInt(m[1].replace(/,/g, ''));
    let op = m[2];
    const n2 = parseInt(m[3].replace(/,/g, ''));
    if (op === '-') op = '\u2212';
    if (!isNaN(n1) && !isNaN(n2) && n1 <= 99999 && n2 <= 99999) {
      const result = op === '+' ? n1 + n2 : n1 - n2;
      if (result >= 0) return { num1: n1, num2: n2, op, result };
    }
  }

  // Word problem patterns — look in explanation for "ADD: X + Y" or "SUBTRACT: X − Y"
  const combined = (question || '') + ' ' + (explanation || '');
  const addMatch = combined.match(/(?:we\s+)?ADD[:\s]+(\d[\d,]*)\s*\+\s*(\d[\d,]*)/i);
  if (addMatch) {
    const n1 = parseInt(addMatch[1].replace(/,/g, ''));
    const n2 = parseInt(addMatch[2].replace(/,/g, ''));
    if (!isNaN(n1) && !isNaN(n2) && n1 <= 99999 && n2 <= 99999) {
      return { num1: n1, num2: n2, op: '+', result: n1 + n2 };
    }
  }
  const subMatch = combined.match(/(?:we\s+)?SUBTRACT[:\s]+(\d[\d,]*)\s*[\u2212\-]\s*(\d[\d,]*)/i);
  if (subMatch) {
    const n1 = parseInt(subMatch[1].replace(/,/g, ''));
    const n2 = parseInt(subMatch[2].replace(/,/g, ''));
    if (!isNaN(n1) && !isNaN(n2) && n1 >= n2) {
      return { num1: n1, num2: n2, op: '\u2212', result: n1 - n2 };
    }
  }

  return null;
}

// ─── Get digit at a place value (0 = ones, 1 = tens, ...) ──
function digitAt(num, place) {
  return Math.floor(num / Math.pow(10, place)) % 10;
}

// ─── Compute addition columns ──────────────────────────────
function computeAddition(a, b) {
  const maxPlace = Math.max(String(a).length, String(b).length);
  const cols = [];
  let carry = 0;

  for (let p = 0; p < maxPlace; p++) {
    const dA = digitAt(a, p);
    const dB = digitAt(b, p);
    const sum = dA + dB + carry;
    cols.push({
      dA, dB,
      carryIn: carry,
      sum,
      digit: sum % 10,
      carryOut: Math.floor(sum / 10),
    });
    carry = Math.floor(sum / 10);
  }
  if (carry > 0) {
    cols.push({ dA: 0, dB: 0, carryIn: carry, sum: carry, digit: carry, carryOut: 0, isExtra: true });
  }
  // cols[0] = ones, cols[1] = tens, etc. — Reverse for display (left = highest)
  return cols.reverse();
}

// ─── Compute subtraction columns ───────────────────────────
function computeSubtraction(a, b) {
  const aStr = String(a);
  const maxPlace = aStr.length;
  const digits = aStr.split('').map(Number);
  const bPad = String(b).padStart(maxPlace, '0').split('').map(Number);

  // Working copy for regrouping (index 0 = leftmost / highest place)
  const working = [...digits];
  const regrouped = new Array(maxPlace).fill(false);

  for (let i = maxPlace - 1; i >= 0; i--) {
    if (working[i] < bPad[i]) {
      // Need to regroup from the left
      for (let j = i - 1; j >= 0; j--) {
        if (working[j] > 0) {
          working[j]--;
          for (let k = j + 1; k < i; k++) {
            working[k] += 9;
            regrouped[k] = true;
          }
          working[i] += 10;
          regrouped[i] = true;
          break;
        }
      }
    }
  }

  // Build display columns (left to right, index 0 = highest place)
  const rStr = String(a - b).padStart(maxPlace, ' ');
  const cols = [];
  for (let i = 0; i < maxPlace; i++) {
    cols.push({
      original: digits[i],
      working: working[i],
      regrouped: regrouped[i],
      dB: bPad[i],
      resultDigit: rStr[i] === ' ' ? null : parseInt(rStr[i]),
    });
  }
  return cols;
}

// ─── Generate column-by-column arithmetic steps ───────────
function generateAdditionSteps(a, b) {
  const maxPlace = Math.max(String(a).length, String(b).length);
  const placeNames = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
  const placeTitle = (p) => { const n = placeNames[p] || `place ${p}`; return n.charAt(0).toUpperCase() + n.slice(1); };
  const aPad = String(a).padStart(maxPlace, '0').split('').map(Number);
  const bPad = String(b).padStart(maxPlace, '0').split('').map(Number);
  const resultArr = new Array(maxPlace).fill(null);
  const carryArr = new Array(maxPlace + 1).fill(0);
  const steps = [];
  let carry = 0;
  let stepNum = 1;

  const addColSnap = (highlightP, label) => {
    const cols = [];
    for (let c = 0; c < maxPlace; c++) {
      const p = maxPlace - 1 - c;
      const hasCarry = carryArr[p] > 0;
      cols.push({
        label: placeTitle(p),
        top: aPad[c],
        bottom: bPad[c],
        carry: hasCarry ? carryArr[p] : null,
        result: resultArr[c] !== null ? resultArr[c] : null,
        highlight: p === highlightP,
      });
    }
    return { cols, label: label || '', isAddition: true };
  };

  steps.push({
    num: String(stepNum++),
    text: `**Line up the numbers** by place value. We'll add ${a.toLocaleString()} + ${b.toLocaleString()} starting from the ones place.`,
    columns: addColSnap(-1, `${a.toLocaleString()} + ${b.toLocaleString()}`),
  });

  for (let p = 0; p < maxPlace; p++) {
    const dA = digitAt(a, p);
    const dB = digitAt(b, p);
    const sum = dA + dB + carry;
    const resultDigit = sum % 10;
    const carryOut = Math.floor(sum / 10);

    carryArr[p] = carry;
    const colIdx = maxPlace - 1 - p;
    resultArr[colIdx] = resultDigit;
    if (carryOut > 0) carryArr[p + 1] = carryOut;

    let text = '';
    if (carry > 0) {
      text = `**${placeTitle(p)} place:** ${dA} + ${dB} + ${carry} (regrouped) = ${sum}.`;
    } else {
      text = `**${placeTitle(p)} place:** ${dA} + ${dB} = ${sum}.`;
    }

    if (carryOut > 0) {
      text += ` Write **${resultDigit}**, regroup **${carryOut}** to ${placeNames[p + 1] || 'next'}.`;
    } else {
      text += ` Write **${resultDigit}**.`;
    }

    steps.push({ num: String(stepNum++), text, columns: addColSnap(p, `${placeTitle(p)}: sum = ${sum}`) });
    carry = carryOut;
  }

  if (carry > 0) {
    const extraColIdx = -1; // conceptual; the final carry adds a new place
    steps.push({
      num: String(stepNum++),
      text: `Bring down the regrouped **${carry}**. It goes in the ${placeNames[maxPlace] || 'next'} place.`,
    });
  }

  const result = a + b;
  steps.push({
    num: String(stepNum),
    text: `The answer is **${result.toLocaleString()}**!`,
  });

  return steps;
}

function generateSubtractionSteps(a, b) {
  const aStr = String(a);
  const maxPlace = aStr.length;
  const placeNames = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
  const placeTitle = (p) => { const n = placeNames[p] || `place ${p}`; return n.charAt(0).toUpperCase() + n.slice(1); };
  const digits = aStr.split('').map(Number);
  const bPad = String(b).padStart(maxPlace, '0').split('').map(Number);
  const resultDigits = []; // filled as we compute each column
  const steps = [];
  let stepNum = 1;

  // Working copy for regrouping
  const working = [...digits];

  // Helper: build a columns snapshot object for rendering a mini-table
  const colSnap = (highlightIdx, label) => {
    const cols = [];
    for (let c = 0; c < maxPlace; c++) {
      const p = maxPlace - 1 - c;
      cols.push({
        label: placeTitle(p),
        top: working[c],
        original: digits[c],
        changed: working[c] !== digits[c],
        bottom: bPad[c],
        result: resultDigits[c] !== undefined ? resultDigits[c] : null,
        highlight: c === highlightIdx,
      });
    }
    return { cols, label: label || 'After regrouping' };
  };

  // Step 1: Setup with initial table
  steps.push({
    num: String(stepNum++),
    text: `**Set up the problem.** Write ${a.toLocaleString()} on top and ${b.toLocaleString()} below, lined up by place value.`,
    columns: colSnap(-1, `${a.toLocaleString()} \u2212 ${b.toLocaleString()}`),
  });

  // Process each column from right to left (ones first)
  for (let i = maxPlace - 1; i >= 0; i--) {
    const p = maxPlace - 1 - i; // place index (0=ones)
    const pTitle = placeTitle(p);
    const top = working[i];
    const bot = bPad[i];

    if (top >= bot) {
      const diff = top - bot;
      resultDigits[i] = diff;
      steps.push({
        num: String(stepNum++),
        text: `**${pTitle} place:** ${top} \u2212 ${bot} = **${diff}**. Write **${diff}**.`,
        columns: colSnap(i, `${pTitle}: ${top} \u2212 ${bot} = ${diff}`),
      });
    } else {
      steps.push({
        num: String(stepNum++),
        text: `**${pTitle} place:** We need ${top} \u2212 ${bot}, but **${top} is less than ${bot}**. We need to regroup!`,
        columns: colSnap(i, `${pTitle}: ${top} < ${bot} — need to regroup`),
      });

      let regroupFrom = -1;
      for (let j = i - 1; j >= 0; j--) {
        if (working[j] > 0) { regroupFrom = j; break; }
      }

      if (regroupFrom >= 0) {
        if (regroupFrom === i - 1) {
          const neighborPlace = placeTitle(maxPlace - 1 - regroupFrom);
          const oldNeighbor = working[regroupFrom];
          working[regroupFrom]--;
          working[i] += 10;
          steps.push({
            num: String(stepNum++),
            text: `**Regroup:** Trade 1 ${(placeNames[maxPlace - 1 - regroupFrom] || '').replace(/s$/, '')} from ${neighborPlace} (${oldNeighbor} \u2192 **${working[regroupFrom]}**) for 10 ${placeNames[p] || 'units'} in ${pTitle} (${top} \u2192 **${working[i]}**).`,
            columns: colSnap(i, `After regrouping from ${neighborPlace}`),
          });
        } else {
          const srcPlace = placeTitle(maxPlace - 1 - regroupFrom);
          const oldSrc = working[regroupFrom];
          steps.push({
            num: String(stepNum++),
            text: `The ${placeTitle(maxPlace - 1 - (i - 1))} place is **0** \u2014 go left to **${srcPlace}** (${oldSrc}).`,
            columns: colSnap(i - 1, `${placeTitle(maxPlace - 1 - (i - 1))} is 0 — look left`),
          });

          working[regroupFrom]--;
          steps.push({
            num: String(stepNum++),
            text: `**Trade 1 from ${srcPlace}:** ${oldSrc} \u2192 **${working[regroupFrom]}**.`,
            columns: colSnap(regroupFrom, `Took 1 from ${srcPlace}`),
          });

          for (let k = regroupFrom + 1; k < i; k++) {
            const midPlace = placeTitle(maxPlace - 1 - k);
            working[k] += 9;
            steps.push({
              num: String(stepNum++),
              text: `**Regroup through ${midPlace}:** receives 10, trades 1 away \u2192 keeps **${working[k]}**.`,
              columns: colSnap(k, `${midPlace} regrouped`),
            });
          }

          working[i] += 10;
          steps.push({
            num: String(stepNum++),
            text: `**${pTitle} receives 10:** ${top} \u2192 **${working[i]}**.`,
            columns: colSnap(i, `${pTitle} ready`),
          });
        }

        const diff = working[i] - bot;
        resultDigits[i] = diff;
        steps.push({
          num: String(stepNum++),
          text: `**Now subtract ${pTitle}:** ${working[i]} \u2212 ${bot} = **${diff}**. Write **${diff}**.`,
          columns: colSnap(i, `${pTitle}: ${working[i]} \u2212 ${bot} = ${diff}`),
        });
      } else {
        const diff = working[i] - bot;
        resultDigits[i] = diff;
        steps.push({
          num: String(stepNum++),
          text: `**${pTitle} place:** ${working[i]} \u2212 ${bot} = ${diff}. Write **${diff}**.`,
          columns: colSnap(i, `${pTitle}: ${working[i]} \u2212 ${bot} = ${diff}`),
        });
      }
    }
  }

  const result = a - b;
  steps.push({
    num: String(stepNum++),
    text: `**Read the answer** from left to right: **${result.toLocaleString()}**!`,
    columns: colSnap(-1, `Answer: ${result.toLocaleString()}`),
  });
  steps.push({
    num: String(stepNum),
    text: `**Check:** ${result.toLocaleString()} + ${b.toLocaleString()} = ${a.toLocaleString()} \u2714`,
  });

  return steps;
}

// ─── Cell size constants ───────────────────────────────────
const CELL = 42;
const GAP = 3;

// ─── Render step text with **bold** markers ──────────────
function renderStepText(text) {
  if (!text || !text.includes('**')) return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#1e40af' }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ─── Place Value Table (chalkboard style) ───────────────────
const PlaceValueTable = ({ pvData }) => {
  if (!pvData || !pvData.digits) return null;
  const { num, digits, highlightColIdx, targetDigit, placeName, placeValue, digitValue, showAllValues } = pvData;
  const numPlaces = digits.length;
  const colLabels = [];
  for (let i = 0; i < numPlaces; i++) {
    const placeIdx = numPlaces - 1 - i;
    colLabels.push(PV_PLACE_NAMES[placeIdx] || `10^${placeIdx}`);
  }

  const colW = 68;

  return (
    <div style={{
      background: 'linear-gradient(170deg, #1a2332 0%, #0f1923 100%)',
      borderRadius: 14,
      padding: '20px 20px 18px',
      boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4), 0 3px 16px rgba(0,0,0,0.12)',
      border: '3px solid #334155',
      marginBottom: 16,
      position: 'relative',
      overflowX: 'auto',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.015) 0%, transparent 60%)',
        pointerEvents: 'none', borderRadius: 11,
      }} />

      <div style={{ textAlign: 'center', color: '#e2e8f0', fontFamily: '"Fira Code", "Courier New", monospace' }}>
        <div style={{
          fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#94a3b8',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 16 }}>🔢</span> Place Value Chart — {num.toLocaleString()}
        </div>

        <div style={{ display: 'inline-block' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 3 }}>
            <thead>
              <tr>
                {colLabels.map((label, i) => {
                  const isHl = i === highlightColIdx;
                  return (
                    <th key={i} style={{
                      width: colW, padding: '6px 4px', textAlign: 'center',
                      fontSize: 11, fontWeight: 800,
                      color: isHl ? '#fbbf24' : '#94a3b8',
                      textTransform: 'capitalize', letterSpacing: 0.3,
                      borderBottom: `2px solid ${isHl ? '#fbbf24' : '#334155'}`,
                    }}>
                      {label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Place multiplier row */}
              <tr>
                {digits.map((_, i) => {
                  const placeIdx = numPlaces - 1 - i;
                  const pv = PV_PLACE_VALUES[placeIdx] || Math.pow(10, placeIdx);
                  const isHl = i === highlightColIdx;
                  return (
                    <td key={i} style={{
                      padding: '4px 4px', textAlign: 'center',
                      fontSize: 10, fontWeight: 600,
                      color: isHl ? 'rgba(251,191,36,0.7)' : 'rgba(148,163,184,0.4)',
                    }}>
                      ×{pv.toLocaleString()}
                    </td>
                  );
                })}
              </tr>
              {/* Digit row */}
              <tr>
                {digits.map((d, i) => {
                  const isHl = i === highlightColIdx;
                  return (
                    <td key={i} style={{
                      width: colW, height: 56, textAlign: 'center', verticalAlign: 'middle',
                      fontSize: 30, fontWeight: 900,
                      fontFamily: '"Courier New", monospace',
                      color: isHl ? '#1a2332' : showAllValues ? '#e2e8f0' : '#e2e8f0',
                      background: isHl
                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                        : 'rgba(255,255,255,0.04)',
                      borderRadius: 10,
                      boxShadow: isHl
                        ? '0 0 20px rgba(251,191,36,0.4), inset 0 1px 2px rgba(255,255,255,0.3)'
                        : 'none',
                      border: isHl ? '2px solid #fcd34d' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {d}
                    </td>
                  );
                })}
              </tr>
              {/* Value row */}
              <tr>
                {digits.map((d, i) => {
                  const placeIdx = numPlaces - 1 - i;
                  const pv = PV_PLACE_VALUES[placeIdx] || Math.pow(10, placeIdx);
                  const val = d * pv;
                  const isHl = i === highlightColIdx;
                  const showVal = showAllValues || isHl;
                  return (
                    <td key={i} style={{
                      padding: '6px 4px', textAlign: 'center',
                      fontSize: 13, fontWeight: 700,
                      color: isHl ? '#fbbf24' : showAllValues ? '#4ade80' : 'rgba(148,163,184,0.3)',
                    }}>
                      {showVal ? (d === 0 ? '0' : val.toLocaleString()) : ''}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Highlighted result callout */}
        {highlightColIdx >= 0 && targetDigit !== null && (
          <div style={{
            marginTop: 14, padding: '10px 20px',
            background: 'rgba(251,191,36,0.08)',
            borderRadius: 10, display: 'inline-block',
            border: '1px solid rgba(251,191,36,0.25)',
          }}>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
              The digit <span style={{ color: '#fbbf24', fontWeight: 800 }}>{targetDigit}</span> is in the <span style={{ color: '#fbbf24', fontWeight: 800, textTransform: 'capitalize' }}>{placeName}</span> place
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#4ade80' }}>
              {targetDigit} × {placeValue.toLocaleString()} = {digitValue.toLocaleString()}
            </div>
          </div>
        )}

        {/* Expanded form callout */}
        {showAllValues && (
          <div style={{
            marginTop: 14, padding: '10px 20px',
            background: 'rgba(74,222,128,0.08)',
            borderRadius: 10, display: 'inline-block',
            border: '1px solid rgba(74,222,128,0.25)',
          }}>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Expanded Form</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4ade80' }}>
              {digits.map((d, i) => {
                if (d === 0) return null;
                const placeIdx = numPlaces - 1 - i;
                const val = d * (PV_PLACE_VALUES[placeIdx] || Math.pow(10, placeIdx));
                return val.toLocaleString();
              }).filter(Boolean).join(' + ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Rectangle / Square Diagram ─────────────────────────────
const RectangleDiagram = ({ length, width, isSquare, isPerimeter, isArea }) => {
  const result = isPerimeter ? 2 * (length + width) : length * width;
  const formula = isPerimeter
    ? `P = 2 × (${length} + ${width}) = 2 × ${length + width} = ${result}`
    : `A = ${length} × ${width} = ${result}`;
  const unit = isPerimeter ? 'units' : 'sq units';

  const maxW = 240, minW = 80;
  const scale = maxW / Math.max(length, width);
  const rectW = Math.max(minW, Math.round(length * scale));
  const rectH = Math.max(minW * 0.5, Math.round(width * scale));

  const sideColor = isPerimeter ? '#60a5fa' : '#a78bfa';
  const fillColor = isArea ? 'rgba(167,139,250,0.12)' : 'rgba(96,165,250,0.06)';
  const accentColor = isPerimeter ? '#2563eb' : '#7c3aed';

  const perimTotal = 2 * (length + width);
  const marchId = React.useId ? React.useId() : 'march';

  return (
    <div style={{
      background: 'linear-gradient(170deg, #1a2332 0%, #0f1923 100%)',
      borderRadius: 14,
      padding: '20px 24px 18px',
      boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4), 0 3px 16px rgba(0,0,0,0.12)',
      border: '3px solid #334155',
      marginBottom: 16,
      position: 'relative',
    }}>
      {isPerimeter && (
        <style>{`
          @keyframes marchAnts { to { stroke-dashoffset: -24; } }
          @keyframes walkDot {
            0%   { offset-distance: 0%; }
            100% { offset-distance: 100%; }
          }
          @keyframes fadeInUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        `}</style>
      )}

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.015) 0%, transparent 60%)',
        pointerEvents: 'none', borderRadius: 11,
      }} />

      <div style={{ textAlign: 'center', color: '#e2e8f0', fontFamily: '"Fira Code", "Courier New", monospace' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#94a3b8' }}>
          {isSquare ? '📐 Square' : '📐 Rectangle'} — {isPerimeter ? 'Perimeter' : 'Area'}
        </div>

        {/* Rectangle drawing area */}
        <div style={{ display: 'inline-block', position: 'relative', padding: '28px 44px 32px 44px' }}>

          {/* SVG overlay for perimeter: marching ants + walking dot */}
          {isPerimeter && (
            <svg
              style={{ position: 'absolute', top: 28, left: 44, pointerEvents: 'none', overflow: 'visible' }}
              width={rectW} height={rectH}
              viewBox={`-2 -2 ${rectW + 4} ${rectH + 4}`}
            >
              <rect x="0" y="0" width={rectW} height={rectH} rx="4"
                fill="none" stroke="#60a5fa" strokeWidth="3"
                strokeDasharray="8 4"
                style={{ animation: 'marchAnts 0.6s linear infinite' }}
              />
              <rect x="0" y="0" width={rectW} height={rectH} rx="4"
                fill="none" stroke="transparent" strokeWidth="0"
                id={`perimPath-${marchId}`}
              />
              <circle r="6" fill="#fbbf24" style={{
                offsetPath: `path('M 0 0 L ${rectW} 0 L ${rectW} ${rectH} L 0 ${rectH} Z')`,
                animation: 'walkDot 4s linear infinite',
                filter: 'drop-shadow(0 0 6px #fbbf24)',
              }} />
            </svg>
          )}

          {/* The rectangle itself */}
          <div style={{
            width: rectW, height: rectH,
            border: isPerimeter ? '3px solid transparent' : `3px dashed ${sideColor}`,
            borderRadius: 4,
            background: fillColor,
            position: 'relative',
            boxShadow: isPerimeter
              ? `0 0 12px rgba(96,165,250,0.2)`
              : `0 0 12px rgba(167,139,250,0.2)`,
          }}>
            {isArea && (() => {
              const gridLines = [];
              const cols = Math.min(length, 12);
              const rows = Math.min(width, 12);
              for (let c = 1; c < cols; c++) {
                gridLines.push(
                  <div key={`vc${c}`} style={{
                    position: 'absolute',
                    left: `${(c / cols) * 100}%`, top: 0,
                    width: 1, height: '100%',
                    background: 'rgba(167,139,250,0.15)',
                  }} />
                );
              }
              for (let r = 1; r < rows; r++) {
                gridLines.push(
                  <div key={`hr${r}`} style={{
                    position: 'absolute',
                    top: `${(r / rows) * 100}%`, left: 0,
                    height: 1, width: '100%',
                    background: 'rgba(167,139,250,0.15)',
                  }} />
                );
              }
              return gridLines;
            })()}

            {isPerimeter && [
              { top: -6, left: -6 },
              { top: -6, right: -6 },
              { bottom: -6, left: -6 },
              { bottom: -6, right: -6 },
            ].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute', ...pos,
                width: 12, height: 12, borderRadius: '50%',
                background: '#60a5fa',
                boxShadow: '0 0 8px #60a5fa',
                border: '2px solid #1a2332',
                zIndex: 2,
              }} />
            ))}
          </div>

          {/* Top label (length) — with arrow */}
          <div style={{
            position: 'absolute', top: 2, left: 44, right: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <span style={{ color: sideColor, fontSize: 10 }}>◀</span>
            <div style={{ flex: 1, height: 2, background: sideColor, borderRadius: 1, opacity: 0.5 }} />
            <span style={{
              fontSize: 15, fontWeight: 800, color: '#fbbf24',
              background: '#1a2332', padding: '0 8px',
              whiteSpace: 'nowrap',
            }}>
              {length}
            </span>
            <div style={{ flex: 1, height: 2, background: sideColor, borderRadius: 1, opacity: 0.5 }} />
            <span style={{ color: sideColor, fontSize: 10 }}>▶</span>
          </div>

          {/* Right label (width) — with arrow */}
          <div style={{
            position: 'absolute', top: 28, bottom: 32, right: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            width: 40,
          }}>
            <span style={{ color: sideColor, fontSize: 10 }}>▲</span>
            <div style={{ flex: 1, width: 2, background: sideColor, borderRadius: 1, opacity: 0.5 }} />
            <span style={{
              fontSize: 15, fontWeight: 800, color: '#fbbf24',
              background: '#1a2332', padding: '2px 6px',
              whiteSpace: 'nowrap',
            }}>
              {width}
            </span>
            <div style={{ flex: 1, width: 2, background: sideColor, borderRadius: 1, opacity: 0.5 }} />
            <span style={{ color: sideColor, fontSize: 10 }}>▼</span>
          </div>

          {/* Bottom label (length — for perimeter) */}
          {isPerimeter && (
            <div style={{
              position: 'absolute', bottom: 4, left: 44, right: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <span style={{ color: sideColor, fontSize: 10, opacity: 0.5 }}>◀</span>
              <div style={{ flex: 1, height: 2, background: sideColor, borderRadius: 1, opacity: 0.3 }} />
              <span style={{
                fontSize: 13, fontWeight: 700, color: '#94a3b8',
                background: '#1a2332', padding: '0 6px',
              }}>
                {length}
              </span>
              <div style={{ flex: 1, height: 2, background: sideColor, borderRadius: 1, opacity: 0.3 }} />
              <span style={{ color: sideColor, fontSize: 10, opacity: 0.5 }}>▶</span>
            </div>
          )}

          {/* Left label (width — for perimeter) */}
          {isPerimeter && (
            <div style={{
              position: 'absolute', top: 28, bottom: 32, left: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              width: 40,
            }}>
              <span style={{ color: sideColor, fontSize: 10, opacity: 0.5 }}>▲</span>
              <div style={{ flex: 1, width: 2, background: sideColor, borderRadius: 1, opacity: 0.3 }} />
              <span style={{
                fontSize: 13, fontWeight: 700, color: '#94a3b8',
                background: '#1a2332', padding: '2px 4px',
              }}>
                {width}
              </span>
              <div style={{ flex: 1, width: 2, background: sideColor, borderRadius: 1, opacity: 0.3 }} />
              <span style={{ color: sideColor, fontSize: 10, opacity: 0.5 }}>▼</span>
            </div>
          )}

          {isArea && (
            <div style={{
              position: 'absolute',
              top: 28, left: 44,
              width: rectW, height: rectH,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                background: 'rgba(26,35,50,0.85)', borderRadius: 8, padding: '4px 12px',
                fontSize: 13, fontWeight: 700, color: '#a78bfa',
              }}>
                {length} × {width}
              </div>
            </div>
          )}
        </div>

        {/* "Walk around" running-total for perimeter */}
        {isPerimeter && (
          <div style={{
            marginTop: 6, display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 0, flexWrap: 'wrap',
          }}>
            {[
              { label: 'Top', val: length, color: '#60a5fa' },
              { label: 'Right', val: width, color: '#38bdf8' },
              { label: 'Bottom', val: length, color: '#818cf8' },
              { label: 'Left', val: width, color: '#a78bfa' },
            ].map((side, i) => {
              const runTotal = [length, width, length, width].slice(0, i + 1).reduce((a, b) => a + b, 0);
              return (
                <React.Fragment key={i}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '6px 10px', animation: `fadeInUp 0.4s ${i * 0.3}s both`,
                  }}>
                    <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>
                      {side.label}
                    </span>
                    <span style={{
                      fontSize: 18, fontWeight: 800, color: side.color,
                    }}>
                      {side.val}
                    </span>
                    <span style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
                      Total: {runTotal}
                    </span>
                  </div>
                  {i < 3 && (
                    <span style={{ fontSize: 18, color: '#475569', padding: '0 2px', marginTop: 6 }}>+</span>
                  )}
                </React.Fragment>
              );
            })}
            <span style={{ fontSize: 18, color: '#475569', padding: '0 4px', marginTop: 6 }}>=</span>
            <div style={{
              padding: '8px 16px', borderRadius: 10,
              background: 'rgba(52,211,153,0.15)',
              border: '2px solid rgba(52,211,153,0.3)',
              animation: 'fadeInUp 0.4s 1.2s both',
            }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#34d399' }}>
                {perimTotal}
              </span>
            </div>
          </div>
        )}

        {/* Formula and result */}
        <div style={{
          marginTop: 10, padding: '10px 16px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 10, display: 'inline-block',
          border: `1px solid rgba(${isPerimeter ? '96,165,250' : '167,139,250'},0.2)`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {isPerimeter ? 'Perimeter = 2 × (length + width)' : 'Area = length × width'}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: accentColor === '#2563eb' ? '#60a5fa' : '#a78bfa' }}>
            {formula} {unit}
          </div>
        </div>

        {/* Perimeter "footsteps" reminder */}
        {isPerimeter && (
          <div style={{
            marginTop: 12, padding: '10px 14px',
            background: 'rgba(251,191,36,0.06)',
            border: '1px solid rgba(251,191,36,0.15)',
            borderRadius: 10, fontSize: 12, color: '#fbbf24', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          }}>
            <span style={{ fontSize: 18 }}>🚶</span>
            Think of perimeter as walking all the way around the shape — count every side!
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// EXPLANATION CACHE — avoids re-parsing identical questions
// ═══════════════════════════════════════════════════════════
const _explanationCache = new Map();
const MAX_CACHE_SIZE = 500;

function getCachedExplanation(question, explanation, correctAnswer) {
  const key = `${question}|||${explanation || ''}|||${correctAnswer || ''}`;
  if (_explanationCache.has(key)) return _explanationCache.get(key);

  const placeVal = parsePlaceValue(question);
  const arith = !placeVal ? parseArithmetic(question, explanation) : null;
  const rounding = !arith && !placeVal ? parseRounding(question) : null;
  const baseTen = parseBaseTenBlocks(question);
  const rectData = !arith ? parseRectangle(question) : null;
  const isAddition = arith?.op === '+';
  const pvData = placeVal?.digits ? placeVal : (!arith && !rounding ? extractPlaceValueFromSmart(question) : null);

  let steps = [];
  let smartResult = null;

  if (arith) {
    steps = isAddition
      ? generateAdditionSteps(arith.num1, arith.num2)
      : generateSubtractionSteps(arith.num1, arith.num2);
  } else {
    steps = (explanation || '').split('\n').map((s) => s.trim()).filter(Boolean).map((s) => {
      const m = s.match(/^Step\s+(\d+):\s*(.*)/i);
      return m ? { num: m[1], text: m[2] } : null;
    }).filter(Boolean);

    if (steps.length === 0) {
      if (rounding) {
        steps = rounding.steps;
      } else if (placeVal) {
        steps = placeVal.steps;
      } else {
        smartResult = generateSmartExplanation(question, explanation, correctAnswer);
        if (smartResult) {
          steps = smartResult.steps;
        }
      }
    }
  }

  const result = { placeVal, arith, rounding, baseTen, rectData, isAddition, pvData, steps, smartResult };
  if (_explanationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = _explanationCache.keys().next().value;
    _explanationCache.delete(firstKey);
  }
  _explanationCache.set(key, result);
  return result;
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const QBotExplainer = ({ question, explanation, misconception, correctAnswer }) => {
  const { placeVal, arith, rounding, baseTen, rectData, isAddition, pvData, steps, smartResult } =
    getCachedExplanation(question, explanation, correctAnswer);

  // Final fallback: if we still have no steps but have explanation text, turn it into steps
  // Never show meaningless explanations (e.g. "give", or very short placeholder text)
  const isMeaninglessExplanation = (s) => !s || s.length < 25 || /^(give|here'?s? the explanation:?|the answer is\.?)\s*$/i.test(s.trim());
  let rawExplanation = null;
  let displaySteps = steps;
  if (steps.length === 0) {
    const cleaned = (explanation || '')
      .replace(/work through the problem[^.]*\./gi, '')
      .replace(/the correct answer is[^.]*\./gi, '')
      .trim();
    if (cleaned.length > 5 && !isMeaninglessExplanation(cleaned)) {
      const stepMarkers = /(\b(?:Step\s+\d+[.:]|First,?|Second,?|Next,?|Then,?|Finally,?|Now,?)\s*)/gi;
      const parts = cleaned.split(stepMarkers).filter(Boolean);
      const builtSteps = [];
      let num = 1;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;
        if (/^(?:Step\s+\d+[.:]|First,?|Second,?|Next,?|Then,?|Finally,?|Now,?)\s*$/i.test(part)) {
          const rest = parts[i + 1]?.trim();
          if (rest) {
            builtSteps.push({ num: String(num++), text: rest });
            i++;
          }
        } else if (part.length > 20) {
          builtSteps.push({ num: String(num++), text: part });
        }
      }
      if (builtSteps.length === 0) {
        const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
        if (sentences.length >= 1 && sentences.some(s => s.trim().length > 15)) {
          sentences.forEach((s, i) => {
            const t = s.trim();
            if (t.length > 10) builtSteps.push({ num: String(i + 1), text: t });
          });
        }
      }
      if (builtSteps.length > 0) {
        displaySteps = builtSteps;
      } else if (!isMeaninglessExplanation(cleaned)) {
        rawExplanation = cleaned;
      }
    }
  }

  // QBot teacher messages — always lead into step-by-step, never just "let me help you understand"
  const qbotMessage = arith
    ? isAddition
      ? "Let me line up these numbers! When we add, we start from the ones place and work left."
      : "Let\u2019s stack these numbers to subtract. Remember \u2014 start from the ones and regroup when you need to!"
    : baseTen
      ? "Look at these base-ten blocks! Each type of block represents a different place value. Let\u2019s count them up!"
      : rounding
        ? "Rounding is all about looking at the right digit! Let me show you the trick."
        : rectData
          ? rectData.isPerimeter
            ? "Perimeter means walking ALL the way around the outside! Let me draw the shape for you."
            : "Area is the space INSIDE the shape. Let\u2019s count the square units!"
          : placeVal
            ? "Place value tells us how much each digit is worth. Let\u2019s break it down!"
            : smartResult?.qbotMsg
              ? smartResult.qbotMsg
              : displaySteps.length > 0
                ? "Here\u2019s how we solve it step by step:"
                : "Here\u2019s the explanation:";

  return (
    <div style={{
      padding: '18px',
      background: '#fff',
      border: '2px solid #e2e8f0',
      borderTop: 'none',
      borderRadius: misconception ? '0' : '0 0 14px 14px',
    }}>
      {/* ── QBot teacher header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16,
      }}>
        {/* QBot avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 12px rgba(37,99,235,0.3)',
          overflow: 'hidden',
          border: '2px solid #c7d2fe',
        }}>
          <img src={qbotImg} alt="QBot Teacher" style={{ width: 42, height: 'auto' }} />
        </div>

        {/* Speech bubble */}
        <div style={{
          position: 'relative',
          padding: '12px 16px',
          background: '#eff6ff',
          borderRadius: '4px 16px 16px 16px',
          border: '1px solid #bfdbfe',
          fontSize: 14, fontWeight: 600, color: '#1e40af',
          lineHeight: 1.5, flex: 1,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 800, color: '#2563eb',
            textTransform: 'uppercase', letterSpacing: 0.8,
            marginBottom: 4,
          }}>
            QBot Teacher
          </div>
          {qbotMessage}
        </div>
      </div>

      {/* ── Chalkboard (arithmetic problems only) ── */}
      {arith && (
        <div style={{
          background: 'linear-gradient(170deg, #1a2332 0%, #0f1923 100%)',
          borderRadius: 14,
          padding: '20px 16px 18px',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4), 0 3px 16px rgba(0,0,0,0.12)',
          border: '3px solid #334155',
          marginBottom: 16,
          overflowX: 'auto',
          position: 'relative',
        }}>
          {/* Subtle chalk dust */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.015) 0%, transparent 60%)',
            pointerEvents: 'none', borderRadius: 11,
          }} />

          {isAddition
            ? <AdditionBoard num1={arith.num1} num2={arith.num2} result={arith.result} />
            : <SubtractionBoard num1={arith.num1} num2={arith.num2} result={arith.result} />
          }
        </div>
      )}

      {/* ── Base-ten blocks visual ── */}
      {baseTen && (
        <div style={{
          borderRadius: 14,
          padding: '16px 12px',
          marginBottom: 16,
          background: '#fff',
          border: '2px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
            fontSize: 13, fontWeight: 700, color: '#7c3aed',
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            <span style={{ fontSize: 16 }}>🧱</span>
            Base-Ten Blocks
          </div>
          <BaseTenBlocks
            thousands={baseTen.thousands}
            hundreds={baseTen.hundreds}
            tens={baseTen.tens}
            ones={baseTen.ones}
            size="md"
          />
        </div>
      )}

      {/* ── Place Value Table (place value problems) ── */}
      {pvData && <PlaceValueTable pvData={pvData} />}

      {/* ── Rounding visual (rounding problems only) ── */}
      {rounding && (
        <div style={{
          background: 'linear-gradient(170deg, #1a2332 0%, #0f1923 100%)',
          borderRadius: 14,
          padding: '20px 20px 18px',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4), 0 3px 16px rgba(0,0,0,0.12)',
          border: '3px solid #334155',
          marginBottom: 16,
          position: 'relative',
        }}>
          {/* Chalk dust overlay */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.015) 0%, transparent 60%)',
            pointerEvents: 'none', borderRadius: 11,
          }} />

          {/* Number line visualization */}
          {(() => {
            const lo = rounding.lower;
            const hi = rounding.upper;
            const mid = lo + rounding.placeValue / 2;
            const num = rounding.num;
            const pct = ((num - lo) / rounding.placeValue) * 100;
            const roundsDown = rounding.deciderDigit < 5;
            const deciderPlace = rounding.place === 'ten' ? 'ones' : rounding.place === 'hundred' ? 'tens' : 'hundreds';

            return (
              <div style={{ textAlign: 'center', color: '#e2e8f0', fontFamily: '"Fira Code", "Courier New", monospace' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#94a3b8' }}>
                  Number Line
                </div>

                {/* Main number line area */}
                <div style={{ position: 'relative', margin: '0 auto', maxWidth: 360, padding: '50px 0 46px' }}>

                  {/* Color-coded zones behind the line */}
                  <div style={{
                    position: 'absolute', left: 0, right: '50%', top: 48, height: 8,
                    background: roundsDown ? 'rgba(52,211,153,0.25)' : 'rgba(52,211,153,0.08)',
                    borderRadius: '4px 0 0 4px',
                  }} />
                  <div style={{
                    position: 'absolute', left: '50%', right: 0, top: 48, height: 8,
                    background: !roundsDown ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.08)',
                    borderRadius: '0 4px 4px 0',
                  }} />

                  {/* The number line itself */}
                  <div style={{
                    height: 4, background: 'linear-gradient(90deg, #475569, #64748b, #475569)',
                    borderRadius: 2, position: 'relative', top: 2,
                  }} />

                  {/* Lower bound (left end, 0%) */}
                  <div style={{
                    position: 'absolute', left: '0%', top: 0, textAlign: 'center',
                    transform: 'translateX(-50%)',
                  }}>
                    <div style={{
                      fontSize: 18, fontWeight: 800,
                      color: roundsDown ? '#34d399' : '#94a3b8',
                      marginBottom: 4,
                    }}>
                      {lo.toLocaleString()}
                    </div>
                    <div style={{
                      width: 3, height: 20,
                      background: roundsDown ? '#34d399' : '#64748b',
                      margin: '0 auto', borderRadius: 2,
                    }} />
                  </div>

                  {/* Midpoint marker (50%) */}
                  <div style={{
                    position: 'absolute', left: '50%', top: 0, textAlign: 'center',
                    transform: 'translateX(-50%)',
                  }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: '#94a3b8',
                      marginBottom: 4, whiteSpace: 'nowrap',
                    }}>
                      {mid.toLocaleString()}
                    </div>
                    {/* Dashed midpoint line */}
                    <div style={{
                      width: 0, height: 20, margin: '0 auto',
                      borderLeft: '2px dashed #94a3b8',
                    }} />
                    <div style={{
                      fontSize: 9, fontWeight: 600, color: '#94a3b8',
                      position: 'absolute', top: 62, left: '50%', transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap', letterSpacing: 0.5, textTransform: 'uppercase',
                    }}>
                      halfway
                    </div>
                  </div>

                  {/* Upper bound (right end, 100%) */}
                  <div style={{
                    position: 'absolute', right: '0%', top: 0, textAlign: 'center',
                    transform: 'translateX(50%)',
                  }}>
                    <div style={{
                      fontSize: 18, fontWeight: 800,
                      color: !roundsDown ? '#34d399' : '#94a3b8',
                      marginBottom: 4,
                    }}>
                      {hi.toLocaleString()}
                    </div>
                    <div style={{
                      width: 3, height: 20,
                      background: !roundsDown ? '#34d399' : '#64748b',
                      margin: '0 auto', borderRadius: 2,
                    }} />
                  </div>

                  {/* The number marker (yellow badge below the line) */}
                  <div style={{
                    position: 'absolute', textAlign: 'center',
                    left: `${pct}%`,
                    bottom: 0, transform: 'translateX(-50%)',
                    zIndex: 2,
                  }}>
                    <div style={{
                      width: 3, height: 22, background: '#fbbf24',
                      margin: '0 auto', borderRadius: 2,
                      boxShadow: '0 0 8px rgba(251,191,36,0.5)',
                    }} />
                    <div style={{
                      fontSize: 15, fontWeight: 800, color: '#1a2332',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: 8,
                      padding: '4px 14px', marginTop: 2, whiteSpace: 'nowrap',
                      boxShadow: '0 2px 10px rgba(251,191,36,0.4)',
                    }}>
                      {num.toLocaleString()}
                    </div>
                  </div>

                  {/* Round direction labels at bottom edges */}
                  <div style={{
                    position: 'absolute', left: '12%', bottom: -40,
                    fontSize: 11, fontWeight: 700,
                    color: roundsDown ? '#34d399' : '#64748b',
                    whiteSpace: 'nowrap', opacity: roundsDown ? 1 : 0.4,
                  }}>
                    ◀ round down
                  </div>
                  <div style={{
                    position: 'absolute', right: '12%', bottom: -40,
                    fontSize: 11, fontWeight: 700,
                    color: !roundsDown ? '#ef4444' : '#64748b',
                    whiteSpace: 'nowrap', opacity: !roundsDown ? 1 : 0.4,
                  }}>
                    round up ▶
                  </div>
                </div>

                {/* Comparison callout */}
                <div style={{
                  marginTop: 12, padding: '10px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10, display: 'inline-block',
                  border: `1px solid ${roundsDown ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.6 }}>
                    <span style={{ color: '#fbbf24', fontWeight: 800 }}>{num.toLocaleString()}</span>
                    {' '}is{' '}
                    <span style={{ color: roundsDown ? '#34d399' : '#ef4444', fontWeight: 800 }}>
                      {roundsDown ? 'less than' : 'equal to or greater than'}
                    </span>
                    {' '}<span style={{ color: '#94a3b8' }}>{mid.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                    so we round <strong style={{ color: roundsDown ? '#34d399' : '#ef4444' }}>
                      {roundsDown ? 'DOWN' : 'UP'}
                    </strong> to the nearest {rounding.place}
                  </div>
                </div>

                {/* Key digit callout */}
                <div style={{ marginTop: 14, fontSize: 15, color: '#cbd5e1' }}>
                  The <span style={{ color: '#fbbf24', fontWeight: 800 }}>{deciderPlace}</span> digit is{' '}
                  <span style={{
                    display: 'inline-block', width: 28, height: 28, lineHeight: '28px', borderRadius: '50%',
                    background: rounding.deciderDigit >= 5 ? '#ef4444' : '#22c55e',
                    color: '#fff', fontWeight: 800, fontSize: 16, textAlign: 'center',
                  }}>
                    {rounding.deciderDigit}
                  </span>
                  {' '}which is {rounding.deciderDigit >= 5 ? '5 or more → round UP!' : 'less than 5 → round DOWN!'}
                </div>

                {/* Final result */}
                <div style={{
                  marginTop: 14, fontSize: 22, fontWeight: 800,
                  color: '#34d399',
                }}>
                  {num.toLocaleString()} ≈ {rounding.rounded.toLocaleString()}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Rectangle / Square diagram (perimeter & area problems) ── */}
      {rectData && (
        <RectangleDiagram
          length={rectData.length}
          width={rectData.width}
          isSquare={rectData.isSquare}
          isPerimeter={rectData.isPerimeter}
          isArea={rectData.isArea}
        />
      )}

      {/* ── Linear domain/range graph (e.g. f(x) = 2x + 3) ── */}
      {smartResult?.type === 'linearDomainRangeGraph' && smartResult?.graph && (() => {
        const { m, b } = smartResult.graph;
        const w = 280, h = 200;
        const padding = { left: 36, right: 24, top: 20, bottom: 36 };
        const xMin = -5, xMax = 5, yMin = -8, yMax = 10;
        const scaleX = (w - padding.left - padding.right) / (xMax - xMin);
        const scaleY = (h - padding.top - padding.bottom) / (yMax - yMin);
        const toX = (x) => padding.left + (x - xMin) * scaleX;
        const toY = (y) => padding.top + (yMax - y) * scaleY;
        const ox = toX(0), oy = toY(0);
        const pts = [];
        for (let x = xMin; x <= xMax; x += 0.1) {
          const y = m * x + b;
          if (y >= yMin && y <= yMax) pts.push({ x: toX(x), y: toY(y) });
        }
        const pathD = pts.length >= 2 ? pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') : '';
        return (
          <div style={{
            marginBottom: 16,
            padding: '14px 16px',
            background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>📈 Graph of a linear function</div>
            <svg width={w} height={h} style={{ display: 'block', margin: '0 auto' }}>
              <defs>
                <marker id="arrowX" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#64748b" />
                </marker>
                <marker id="arrowY" markerWidth="8" markerHeight="8" refX="4" refY="6" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#64748b" />
                </marker>
              </defs>
              {/* Grid */}
              {[ -4, -2, 2, 4 ].map((n) => (
                <line key={`v${n}`} x1={toX(n)} y1={padding.top} x2={toX(n)} y2={h - padding.bottom} stroke="#e2e8f0" strokeWidth="0.5" />
              ))}
              {[ -6, -4, -2, 2, 4, 6, 8 ].filter((n) => n !== 0).map((n) => (
                <line key={`h${n}`} x1={padding.left} y1={toY(n)} x2={w - padding.right} y2={toY(n)} stroke="#e2e8f0" strokeWidth="0.5" />
              ))}
              {/* Axes */}
              <line x1={padding.left} y1={oy} x2={w - padding.right} y2={oy} stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowX)" />
              <line x1={ox} y1={h - padding.bottom} x2={ox} y2={padding.top} stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowY)" />
              {/* Line y = mx + b */}
              {pathD && <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
              {/* Labels */}
              <text x={w - padding.right - 4} y={oy - 6} textAnchor="end" fontSize="11" fill="#475569" fontWeight="600">x</text>
              <text x={ox + 6} y={padding.top + 4} textAnchor="start" fontSize="11" fill="#475569" fontWeight="600">y</text>
              <text x={ox - 6} y={oy + 4} textAnchor="end" fontSize="10" fill="#94a3b8">0</text>
              <text x={toX(1) - 4} y={oy + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">1</text>
              <text x={ox - 14} y={toY(1) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">1</text>
              <text x={w / 2} y={h - 8} textAnchor="middle" fontSize="10" fill="#2563eb" fontWeight="700">
                f(x) = {m}x {b >= 0 ? '+' : ''}{b}  →  domain: all reals, range: all reals
              </text>
            </svg>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 11, color: '#64748b' }}>
              <span><strong style={{ color: '#0f172a' }}>Domain</strong> = all possible x (horizontal) → all reals</span>
              <span><strong style={{ color: '#0f172a' }}>Range</strong> = all possible y (vertical) → all reals</span>
            </div>
          </div>
        );
      })()}

      {/* ── Step-by-step explanation ── */}
      {displaySteps.length > 0 && (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
            fontSize: 13, fontWeight: 700, color: '#1e40af',
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            <span style={{ fontSize: 16 }}>📝</span>
            {arith ? 'QBot\u2019s Column-by-Column' : rounding ? 'The Rounding Rule' : rectData ? (rectData.isPerimeter ? 'Finding the Perimeter' : 'Finding the Area') : 'Step-by-step'}
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {displaySteps.map((step, i) => (
              <div key={i}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: arith
                      ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                      : rounding
                        ? 'linear-gradient(135deg, #059669, #047857)'
                        : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff', fontSize: 12, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {step.num}
                  </div>
                  <p style={{
                    margin: 0, fontSize: 14, lineHeight: 1.6,
                    color: '#1e293b', paddingTop: 2,
                  }}>
                    {renderStepText(step.text)}
                  </p>
                </div>
                {step.columns && (
                  <div style={{
                    margin: '8px 0 6px 36px',
                    background: 'linear-gradient(170deg, #1a2332 0%, #0f1923 100%)',
                    borderRadius: 10,
                    padding: '10px 14px 8px',
                    border: '2px solid #334155',
                    fontFamily: '"Fira Code", "Courier New", monospace',
                    fontSize: 13,
                    color: '#e2e8f0',
                    display: 'inline-block',
                  }}>
                    {step.columns.label && (
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        {step.columns.label}
                      </div>
                    )}
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead>
                        <tr>
                          <th style={{ width: 18 }} />
                          {step.columns.cols.map((col, ci) => (
                            <th key={ci} style={{
                              padding: '2px 10px', textAlign: 'center', fontSize: 10,
                              color: col.highlight ? '#fbbf24' : '#94a3b8',
                              fontWeight: 700, borderBottom: '1px solid #334155',
                            }}>
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {step.columns.isAddition && step.columns.cols.some(c => c.carry) && (
                          <tr>
                            <td style={{ padding: '1px 4px', fontSize: 9, color: '#64748b' }} />
                            {step.columns.cols.map((col, ci) => (
                              <td key={ci} style={{
                                padding: '1px 10px', textAlign: 'center',
                                fontSize: 9, color: '#f59e0b', fontWeight: 700,
                              }}>
                                {col.carry ? col.carry : ''}
                              </td>
                            ))}
                          </tr>
                        )}
                        <tr>
                          <td style={{ padding: '4px 4px', fontSize: 12, color: '#64748b', textAlign: 'right' }} />
                          {step.columns.cols.map((col, ci) => {
                            const isSubtraction = !step.columns.isAddition;
                            return (
                              <td key={ci} style={{
                                padding: '4px 10px', textAlign: 'center',
                                color: (isSubtraction && col.changed) ? '#fbbf24' : '#e2e8f0',
                                fontWeight: (isSubtraction && col.changed) ? 800 : 600,
                                fontSize: col.top >= 10 ? 15 : 16,
                                position: 'relative',
                              }}>
                                {isSubtraction && col.changed && col.top !== col.original && (
                                  <span style={{
                                    position: 'absolute', top: -2, right: 2, fontSize: 8,
                                    color: '#ef4444', textDecoration: 'line-through', opacity: 0.7,
                                  }}>
                                    {col.original}
                                  </span>
                                )}
                                {col.top}
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          <td style={{
                            padding: '2px 4px', textAlign: 'right',
                            fontSize: 14, color: '#94a3b8', fontWeight: 700,
                          }}>
                            {step.columns.isAddition ? '+' : '\u2212'}
                          </td>
                          {step.columns.cols.map((col, ci) => (
                            <td key={ci} style={{
                              padding: '2px 10px', textAlign: 'center',
                              color: '#94a3b8', fontWeight: 600,
                            }}>
                              {col.bottom}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{ borderTop: '2px solid #4ade80' }} />
                          {step.columns.cols.map((col, ci) => (
                            <td key={ci} style={{
                              padding: '4px 10px', textAlign: 'center',
                              borderTop: '2px solid #4ade80',
                              color: col.result !== null ? '#4ade80' : 'transparent',
                              fontWeight: 800,
                            }}>
                              {col.result !== null ? col.result : '\u2013'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Raw explanation fallback (no steps parsed) ── */}
      {rawExplanation && (
        <div style={{
          padding: '14px 16px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: 10,
          fontSize: 14, lineHeight: 1.7,
          color: '#1e293b',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
            fontSize: 13, fontWeight: 700, color: '#1e40af',
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            <span style={{ fontSize: 16 }}>💡</span> Explanation
          </div>
          {rawExplanation}
        </div>
      )}

      {/* ── Misconception warning ── */}
      {misconception && (
        <div style={{
          marginTop: 14, padding: '12px 14px',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ flexShrink: 0, fontSize: 16 }}>⚠️</span>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#991b1b' }}>
              <strong>Common mistake:</strong> {misconception}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ADDITION BOARD
// ═══════════════════════════════════════════════════════════
const AdditionBoard = ({ num1, num2, result }) => {
  const cols = computeAddition(num1, num2);
  const totalCols = cols.length;
  const aLen = String(num1).length;
  const bLen = String(num2).length;
  const aOff = totalCols - aLen; // how many left cols are blank for num1
  const bOff = totalCols - bLen;

  // Place labels (right to left)
  const placeLabels = PLACE_NAMES.slice(0, totalCols).reverse();

  return (
    <div style={{ display: 'inline-block', minWidth: 'fit-content', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Place value labels */}
        <div style={{ display: 'flex', gap: GAP, marginBottom: 6, paddingLeft: CELL + GAP }}>
          {placeLabels.map((label, i) => (
            <div key={i} style={{
              width: CELL, textAlign: 'center',
              fontSize: 9, color: 'rgba(148,163,184,0.5)',
              fontFamily: 'system-ui, sans-serif', fontWeight: 700,
              letterSpacing: 0.3, textTransform: 'uppercase',
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* Regroup row */}
        <div style={{ display: 'flex', gap: GAP, height: 22, paddingLeft: CELL + GAP }}>
          {cols.map((col, i) => (
            <div key={i} style={{
              width: CELL, textAlign: 'center',
              fontSize: 15, fontWeight: 800,
              color: col.carryIn > 0 ? '#fbbf24' : 'transparent',
              fontFamily: '"Courier New", monospace',
              textShadow: col.carryIn > 0 ? '0 0 8px rgba(251,191,36,0.4)' : 'none',
            }}>
              {col.carryIn > 0 ? col.carryIn : ''}
            </div>
          ))}
        </div>

        {/* First number row */}
        <div style={{ display: 'flex', gap: GAP, paddingLeft: CELL + GAP }}>
          {cols.map((col, i) => {
            const show = i >= aOff && !col.isExtra;
            return (
              <div key={i} style={{
                width: CELL, height: CELL,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 800, color: show ? '#f1f5f9' : 'transparent',
                fontFamily: '"Courier New", monospace',
                textShadow: show ? '0 0 6px rgba(255,255,255,0.15)' : 'none',
                background: show ? 'rgba(255,255,255,0.04)' : 'transparent',
                borderRadius: 6,
              }}>
                {show ? col.dA : ''}
              </div>
            );
          })}
        </div>

        {/* Operator + second number row */}
        <div style={{ display: 'flex', gap: GAP, marginTop: GAP }}>
          {/* Operator cell */}
          <div style={{
            width: CELL, height: CELL,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#60a5fa',
            fontFamily: '"Courier New", monospace',
            textShadow: '0 0 8px rgba(96,165,250,0.3)',
          }}>
            +
          </div>
          {cols.map((col, i) => {
            const show = i >= bOff && !col.isExtra;
            return (
              <div key={i} style={{
                width: CELL, height: CELL,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 800, color: show ? '#f1f5f9' : 'transparent',
                fontFamily: '"Courier New", monospace',
                textShadow: show ? '0 0 6px rgba(255,255,255,0.15)' : 'none',
                background: show ? 'rgba(255,255,255,0.04)' : 'transparent',
                borderRadius: 6,
              }}>
                {show ? col.dB : ''}
              </div>
            );
          })}
        </div>

        {/* Divider line */}
        <div style={{
          height: 3, width: `calc(${(totalCols + 1) * (CELL + GAP)}px)`,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.6), rgba(255,255,255,0.1))',
          borderRadius: 2, margin: `8px 0`,
        }} />

        {/* Result row */}
        <div style={{ display: 'flex', gap: GAP, paddingLeft: CELL + GAP }}>
          {cols.map((col, i) => (
            <div key={i} style={{
              width: CELL, height: CELL,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 800,
              color: '#4ade80',
              fontFamily: '"Courier New", monospace',
              textShadow: '0 0 12px rgba(74,222,128,0.35)',
              background: 'rgba(74,222,128,0.06)',
              borderRadius: 6,
            }}>
              {col.digit}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SUBTRACTION BOARD
// ═══════════════════════════════════════════════════════════
const SubtractionBoard = ({ num1, num2, result }) => {
  const cols = computeSubtraction(num1, num2);
  const totalCols = cols.length;
  const bLen = String(num2).length;
  const bOff = totalCols - bLen;
  const rStr = String(result);
  const rOff = totalCols - rStr.length;

  const placeLabels = PLACE_NAMES.slice(0, totalCols).reverse();

  return (
    <div style={{ display: 'inline-block', minWidth: 'fit-content', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Place value labels */}
        <div style={{ display: 'flex', gap: GAP, marginBottom: 6, paddingLeft: CELL + GAP }}>
          {placeLabels.map((label, i) => (
            <div key={i} style={{
              width: CELL, textAlign: 'center',
              fontSize: 9, color: 'rgba(148,163,184,0.5)',
              fontFamily: 'system-ui, sans-serif', fontWeight: 700,
              letterSpacing: 0.3, textTransform: 'uppercase',
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* Regrouped annotations row */}
        <div style={{ display: 'flex', gap: GAP, height: 24, paddingLeft: CELL + GAP }}>
          {cols.map((col, i) => (
            <div key={i} style={{
              width: CELL, textAlign: 'center',
              fontSize: 13, fontWeight: 800,
              color: col.regrouped ? '#fb923c' : 'transparent',
              fontFamily: '"Courier New", monospace',
              textShadow: col.regrouped ? '0 0 6px rgba(251,146,60,0.4)' : 'none',
            }}>
              {col.regrouped ? col.working : ''}
            </div>
          ))}
        </div>

        {/* First number row (top number) */}
        <div style={{ display: 'flex', gap: GAP, paddingLeft: CELL + GAP }}>
          {cols.map((col, i) => (
            <div key={i} style={{
              width: CELL, height: CELL,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 800,
              fontFamily: '"Courier New", monospace',
              position: 'relative',
              color: col.regrouped ? 'rgba(241,245,249,0.35)' : '#f1f5f9',
              textShadow: !col.regrouped ? '0 0 6px rgba(255,255,255,0.15)' : 'none',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 6,
              textDecoration: col.regrouped ? 'line-through' : 'none',
              textDecorationColor: col.regrouped ? '#fb923c' : undefined,
            }}>
              {col.original}
            </div>
          ))}
        </div>

        {/* Operator + second number row */}
        <div style={{ display: 'flex', gap: GAP, marginTop: GAP }}>
          <div style={{
            width: CELL, height: CELL,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#f87171',
            fontFamily: '"Courier New", monospace',
            textShadow: '0 0 8px rgba(248,113,113,0.3)',
          }}>
            {'\u2212'}
          </div>
          {cols.map((col, i) => {
            const show = i >= bOff;
            return (
              <div key={i} style={{
                width: CELL, height: CELL,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 800, color: show ? '#f1f5f9' : 'transparent',
                fontFamily: '"Courier New", monospace',
                textShadow: show ? '0 0 6px rgba(255,255,255,0.15)' : 'none',
                background: show ? 'rgba(255,255,255,0.04)' : 'transparent',
                borderRadius: 6,
              }}>
                {show ? col.dB : ''}
              </div>
            );
          })}
        </div>

        {/* Divider line */}
        <div style={{
          height: 3, width: `calc(${(totalCols + 1) * (CELL + GAP)}px)`,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.6), rgba(255,255,255,0.1))',
          borderRadius: 2, margin: '8px 0',
        }} />

        {/* Result row */}
        <div style={{ display: 'flex', gap: GAP, paddingLeft: CELL + GAP }}>
          {cols.map((col, i) => {
            const show = i >= rOff;
            return (
              <div key={i} style={{
                width: CELL, height: CELL,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 800,
                color: show ? '#4ade80' : 'transparent',
                fontFamily: '"Courier New", monospace',
                textShadow: show ? '0 0 12px rgba(74,222,128,0.35)' : 'none',
                background: show ? 'rgba(74,222,128,0.06)' : 'transparent',
                borderRadius: 6,
              }}>
                {show && col.resultDigit !== null ? col.resultDigit : ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QBotExplainer;
export { parseArithmetic };
