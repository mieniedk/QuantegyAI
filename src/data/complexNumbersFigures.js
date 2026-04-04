/**
 * Complex-numbers concept refresh figures (SVG via data URI for sanitize-safe img tags).
 */

function svgImg(svg, alt) {
  const src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return `<img src="${src}" alt="${alt}" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:10px;border:1px solid #e2e8f0;background:#fafafa" />`;
}

// Origin O(70,190); Re right, Im up (SVG y decreases upward)
const PLANE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 230" width="300" height="230">
  <line x1="70" y1="190" x2="255" y2="190" stroke="#64748b" stroke-width="2"/>
  <line x1="70" y1="190" x2="70" y2="35" stroke="#64748b" stroke-width="2"/>
  <polygon points="255,190 247,186 247,194" fill="#64748b"/>
  <polygon points="70,35 66,43 74,43" fill="#64748b"/>
  <text x="262" y="198" font-size="13" fill="#334155" font-family="system-ui,sans-serif">Re</text>
  <text x="52" y="32" font-size="13" fill="#334155" font-family="system-ui,sans-serif">Im</text>
  <line x1="70" y1="190" x2="154" y2="134" stroke="#93c5fd" stroke-width="2.5"/>
  <line x1="154" y1="134" x2="154" y2="190" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="5,4"/>
  <line x1="70" y1="134" x2="154" y2="134" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="5,4"/>
  <circle cx="154" cy="134" r="7" fill="#2563eb" stroke="#1e40af" stroke-width="1.5"/>
  <text x="158" y="128" font-size="12" fill="#1e3a8a" font-family="system-ui,sans-serif" font-weight="700">z = a + bi</text>
  <text x="108" y="204" font-size="12" fill="#475569" font-family="system-ui,sans-serif">a</text>
  <text x="160" y="168" font-size="12" fill="#475569" font-family="system-ui,sans-serif">b</text>
  <text x="58" y="202" font-size="11" fill="#64748b" font-family="system-ui,sans-serif">O</text>
</svg>`;

const MOD_ARG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 230" width="300" height="230">
  <line x1="70" y1="190" x2="255" y2="190" stroke="#64748b" stroke-width="2"/>
  <line x1="70" y1="190" x2="70" y2="35" stroke="#64748b" stroke-width="2"/>
  <polygon points="255,190 247,186 247,194" fill="#64748b"/>
  <polygon points="70,35 66,43 74,43" fill="#64748b"/>
  <text x="262" y="198" font-size="13" fill="#334155" font-family="system-ui,sans-serif">Re</text>
  <text x="52" y="32" font-size="13" fill="#334155" font-family="system-ui,sans-serif">Im</text>
  <polyline points="70,190 154,190 154,134" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="70" y1="190" x2="154" y2="134" stroke="#7c3aed" stroke-width="3"/>
  <circle cx="154" cy="134" r="6" fill="#2563eb"/>
  <path d="M 105 190 A 35 35 0 0 0 140 162" fill="none" stroke="#dc2626" stroke-width="2"/>
  <text x="118" y="178" font-size="12" fill="#dc2626" font-family="system-ui,sans-serif" font-weight="700">θ = arg(z)</text>
  <text x="95" y="150" font-size="12" fill="#6d28d9" font-family="system-ui,sans-serif" font-weight="700">|z|</text>
  <text x="100" y="204" font-size="11" fill="#475569" font-family="system-ui,sans-serif">a</text>
  <text x="160" y="168" font-size="11" fill="#475569" font-family="system-ui,sans-serif">b</text>
</svg>`;

const EULER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240">
  <line x1="40" y1="120" x2="280" y2="120" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="160" y1="200" x2="160" y2="40" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="285" y="128" font-size="12" fill="#64748b" font-family="system-ui,sans-serif">Re</text>
  <text x="168" y="38" font-size="12" fill="#64748b" font-family="system-ui,sans-serif">Im</text>
  <circle cx="160" cy="120" r="70" fill="none" stroke="#2563eb" stroke-width="2"/>
  <line x1="160" y1="120" x2="214" y2="120" stroke="#0d9488" stroke-width="2.5"/>
  <line x1="214" y1="120" x2="214" y2="75" stroke="#0369a1" stroke-width="2.5"/>
  <line x1="160" y1="120" x2="214" y2="75" stroke="#7c3aed" stroke-width="3"/>
  <circle cx="214" cy="75" r="6" fill="#7c3aed"/>
  <text x="216" y="70" font-size="11" fill="#5b21b6" font-family="system-ui,sans-serif" font-weight="700">e^(iθ)</text>
  <text x="178" y="138" font-size="11" fill="#0f766e" font-family="system-ui,sans-serif">cos θ</text>
  <text x="218" y="100" font-size="11" fill="#0369a1" font-family="system-ui,sans-serif">i·sin θ</text>
  <text x="48" y="210" font-size="11" fill="#475569" font-family="system-ui,sans-serif">Unit circle: e^(iθ) = cos θ + i sin θ</text>
</svg>`;

const CONJUGATE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" width="300" height="220">
  <line x1="50" y1="110" x2="260" y2="110" stroke="#64748b" stroke-width="2"/>
  <line x1="110" y1="190" x2="110" y2="30" stroke="#64748b" stroke-width="2"/>
  <polygon points="260,110 252,106 252,114" fill="#64748b"/>
  <polygon points="110,30 106,38 114,38" fill="#64748b"/>
  <text x="268" y="118" font-size="12" fill="#334155" font-family="system-ui,sans-serif">Re</text>
  <text x="92" y="28" font-size="12" fill="#334155" font-family="system-ui,sans-serif">Im</text>
  <circle cx="190" cy="70" r="7" fill="#2563eb"/>
  <circle cx="190" cy="150" r="7" fill="#0891b2"/>
  <line x1="190" y1="70" x2="190" y2="150" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,4"/>
  <text x="196" y="66" font-size="11" fill="#1e40af" font-family="system-ui,sans-serif" font-weight="700">a + bi</text>
  <text x="196" y="168" font-size="11" fill="#0e7490" font-family="system-ui,sans-serif" font-weight="700">a − bi</text>
  <text x="52" y="205" font-size="11" fill="#475569" font-family="system-ui,sans-serif">Real coefficients ⟹ roots pair as conjugates</text>
</svg>`;

const wrapFigures = (blocks) => [
  '<div style="display:grid;gap:14px;margin-top:10px;max-width:620px;margin-left:auto;margin-right:auto">',
  ...blocks,
  '</div>',
].join('');

/** Plane + modulus/argument (concept refresh slide 1, micro-teach full strip first half). */
export const complexPlaneModArgFiguresHtml = wrapFigures([
  '<div><div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px">Complex plane: z = a + bi ↔ (a, b)</div>',
  svgImg(PLANE_SVG, 'Complex plane with real and imaginary axes and point z = a + bi'),
  '</div>',
  '<div><div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px">|z| and arg(z)</div>',
  svgImg(MOD_ARG_SVG, 'Right triangle showing modulus |z| and argument θ from the positive real axis'),
  '</div>',
]);

/** Euler + conjugate pairs (concept refresh slide 2). */
export const eulerConjugateFiguresHtml = wrapFigures([
  '<div><div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px">Euler: e^(iθ) = cos θ + i sin θ (unit circle)</div>',
  svgImg(EULER_SVG, 'Unit circle showing e to the i theta as cos theta plus i sin theta'),
  '</div>',
  '<div><div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px">Conjugate pairs (real coefficients)</div>',
  svgImg(CONJUGATE_SVG, 'Complex conjugate roots symmetric about the real axis'),
  '</div>',
]);

/** All four panels (e.g. micro-teach / Concept Explorer). */
export const complexPlaneEulerConjugateFiguresHtml = [
  '<div style="display:grid;gap:14px;margin-top:10px;max-width:620px;margin-left:auto;margin-right:auto">',
  '<div><div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px">Complex plane: z = a + bi ↔ (a, b)</div>',
  svgImg(PLANE_SVG, 'Complex plane with real and imaginary axes and point z = a + bi'),
  '</div>',
  '<div><div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px">|z| and arg(z)</div>',
  svgImg(MOD_ARG_SVG, 'Right triangle showing modulus |z| and argument θ from the positive real axis'),
  '</div>',
  '<div><div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px">Euler: e^(iθ) = cos θ + i sin θ (unit circle)</div>',
  svgImg(EULER_SVG, 'Unit circle showing e to the i theta as cos theta plus i sin theta'),
  '</div>',
  '<div><div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px">Conjugate pairs (real coefficients)</div>',
  svgImg(CONJUGATE_SVG, 'Complex conjugate roots symmetric about the real axis'),
  '</div>',
  '</div>',
].join('');
