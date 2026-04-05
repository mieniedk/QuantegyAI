/**
 * Inline figures for Math 7–12 Domain I (real numbers) micro-concepts.
 * SVGs are embedded as data-URI img tags so sanitizeHtml (DOMPurify) keeps them.
 */

function svgImg(svg, alt) {
  const src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return `<img src="${src}" alt="${alt}" style="max-width:100%;height:auto;display:block;margin:12px auto 0;border-radius:10px;border:1px solid #e2e8f0;background:#fafafa" />`;
}

const SUBSETS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="400" height="220">
  <rect x="8" y="8" width="384" height="204" rx="16" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
  <text x="200" y="30" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a" font-family="system-ui,sans-serif">ℝ Real numbers</text>
  <ellipse cx="200" cy="125" rx="168" ry="72" fill="#f5f3ff" stroke="#7c3aed" stroke-width="2"/>
  <text x="200" y="78" text-anchor="middle" font-size="11" font-weight="700" fill="#5b21b6" font-family="system-ui,sans-serif">ℚ Rationals</text>
  <ellipse cx="200" cy="128" rx="100" ry="48" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
  <text x="200" y="118" text-anchor="middle" font-size="10" font-weight="700" fill="#1d4ed8" font-family="system-ui,sans-serif">ℤ Integers</text>
  <ellipse cx="200" cy="132" rx="52" ry="28" fill="#ecfdf5" stroke="#16a34a" stroke-width="2"/>
  <text x="200" y="138" text-anchor="middle" font-size="10" font-weight="800" fill="#166534" font-family="system-ui,sans-serif">ℕ</text>
  <text x="24" y="198" font-size="9" fill="#64748b" font-family="system-ui,sans-serif">π, √2, e ∈ ℝ \\ ℚ</text>
</svg>`;

const NUMBER_LINE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 88" width="440" height="88">
  <line x1="24" y1="44" x2="416" y2="44" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
  <polygon points="416,44 404,38 404,50" fill="#334155"/>
  <line x1="80" y1="36" x2="80" y2="52" stroke="#2563eb" stroke-width="2"/>
  <text x="80" y="30" text-anchor="middle" font-size="11" font-weight="700" fill="#1d4ed8" font-family="system-ui,sans-serif">0</text>
  <line x1="140" y1="36" x2="140" y2="52" stroke="#059669" stroke-width="2"/>
  <text x="140" y="30" text-anchor="middle" font-size="10" font-weight="700" fill="#047857" font-family="system-ui,sans-serif">¾</text>
  <line x1="200" y1="36" x2="200" y2="52" stroke="#7c3aed" stroke-width="2"/>
  <text x="200" y="30" text-anchor="middle" font-size="10" font-weight="700" fill="#6d28d9" font-family="system-ui,sans-serif">√2</text>
  <line x1="280" y1="36" x2="280" y2="52" stroke="#7c3aed" stroke-width="2"/>
  <text x="280" y="30" text-anchor="middle" font-size="10" font-weight="700" fill="#6d28d9" font-family="system-ui,sans-serif">π</text>
  <line x1="360" y1="36" x2="360" y2="52" stroke="#059669" stroke-width="2"/>
  <text x="360" y="30" text-anchor="middle" font-size="10" font-weight="700" fill="#047857" font-family="system-ui,sans-serif">1</text>
  <text x="220" y="78" text-anchor="middle" font-size="9" fill="#64748b" font-family="system-ui,sans-serif">Schematic spacing — all are single points on ℝ</text>
</svg>`;

/** Nested subsets ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ (schematic). */
export const realNumberSubsetsNestedHtml = `
<div style="max-width:420px;margin:12px auto;font-family:system-ui,sans-serif;">
  ${svgImg(SUBSETS_SVG, 'Nested sets: natural numbers inside integers inside rationals inside real numbers')}
  <p style="margin:8px 0 0;font-size:11px;color:#64748b;text-align:center;">Every natural is an integer; every integer is rational; not every real is rational.</p>
</div>
`.trim();

/** Number line sketch: sample rationals vs irrationals (not to scale). */
export const realNumberLineSamplesHtml = `
<div style="max-width:440px;margin:12px auto;font-family:system-ui,sans-serif;">
  ${svgImg(NUMBER_LINE_SVG, 'Number line with sample rational and irrational points')}
</div>
`.trim();

/** Terminating vs repeating vs non-repeating decimals — three columns. */
export const decimalTypesVisualHtml = `
<div style="max-width:460px;margin:12px auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;font-family:system-ui,sans-serif;">
  <div style="background:#ecfdf5;border:1px solid #86efac;border-radius:10px;padding:10px;text-align:center;">
    <div style="font-size:10px;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:0.04em;">Terminating</div>
    <div style="font-size:18px;font-weight:800;color:#059669;margin:6px 0;">0.75</div>
    <div style="font-size:11px;color:#047857">→ rational (e.g. ³⁄₄)</div>
  </div>
  <div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:10px;padding:10px;text-align:center;">
    <div style="font-size:10px;font-weight:800;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.04em;">Repeating</div>
    <div style="font-size:18px;font-weight:800;color:#2563eb;margin:6px 0;">0.166…</div>
    <div style="font-size:11px;color:#1e40af">→ rational (e.g. ⅙)</div>
  </div>
  <div style="background:#faf5ff;border:1px solid #c4b5fd;border-radius:10px;padding:10px;text-align:center;">
    <div style="font-size:10px;font-weight:800;color:#6d28d9;text-transform:uppercase;letter-spacing:0.04em;">Non-repeating</div>
    <div style="font-size:16px;font-weight:800;color:#7c3aed;margin:6px 0;">π , e</div>
    <div style="font-size:11px;color:#5b21b6">→ irrational</div>
  </div>
</div>
`.trim();
