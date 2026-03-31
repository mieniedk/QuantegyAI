/**
 * SVG illustrations for Data Analysis / Statistics micro-concepts (c015–c017).
 */

export const boxPlotFigureHtml = `
<div style="text-align:center;margin:16px 0">
  <svg viewBox="0 0 400 120" width="100%" style="max-width:420px;display:inline-block">
    <!-- axis -->
    <line x1="30" y1="80" x2="370" y2="80" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="30" y="98" font-size="10" fill="#6b7280" text-anchor="middle">10</text>
    <text x="98" y="98" font-size="10" fill="#6b7280" text-anchor="middle">20</text>
    <text x="166" y="98" font-size="10" fill="#6b7280" text-anchor="middle">30</text>
    <text x="234" y="98" font-size="10" fill="#6b7280" text-anchor="middle">40</text>
    <text x="302" y="98" font-size="10" fill="#6b7280" text-anchor="middle">50</text>
    <text x="370" y="98" font-size="10" fill="#6b7280" text-anchor="middle">60</text>
    <!-- ticks -->
    <line x1="30" y1="78" x2="30" y2="83" stroke="#94a3b8" stroke-width="1"/>
    <line x1="98" y1="78" x2="98" y2="83" stroke="#94a3b8" stroke-width="1"/>
    <line x1="166" y1="78" x2="166" y2="83" stroke="#94a3b8" stroke-width="1"/>
    <line x1="234" y1="78" x2="234" y2="83" stroke="#94a3b8" stroke-width="1"/>
    <line x1="302" y1="78" x2="302" y2="83" stroke="#94a3b8" stroke-width="1"/>
    <line x1="370" y1="78" x2="370" y2="83" stroke="#94a3b8" stroke-width="1"/>
    <!-- whisker left: min=12 -->
    <line x1="44" y1="50" x2="132" y2="50" stroke="#2563eb" stroke-width="2"/>
    <line x1="44" y1="38" x2="44" y2="62" stroke="#2563eb" stroke-width="2"/>
    <!-- box: Q1=25, Q3=45 -->
    <rect x="132" y="30" width="170" height="40" rx="3" fill="rgba(37,99,235,0.15)" stroke="#2563eb" stroke-width="2"/>
    <!-- median=35 -->
    <line x1="200" y1="30" x2="200" y2="70" stroke="#dc2626" stroke-width="2.5"/>
    <!-- whisker right: max=52 -->
    <line x1="302" y1="50" x2="346" y2="50" stroke="#2563eb" stroke-width="2"/>
    <line x1="346" y1="38" x2="346" y2="62" stroke="#2563eb" stroke-width="2"/>
    <!-- labels -->
    <text x="44" y="24" font-size="9" fill="#1e40af" text-anchor="middle" font-weight="700">Min=12</text>
    <text x="132" y="24" font-size="9" fill="#1e40af" text-anchor="middle" font-weight="700">Q\u2081=25</text>
    <text x="200" y="18" font-size="9" fill="#dc2626" text-anchor="middle" font-weight="700">Median=35</text>
    <text x="302" y="24" font-size="9" fill="#1e40af" text-anchor="middle" font-weight="700">Q\u2083=45</text>
    <text x="346" y="24" font-size="9" fill="#1e40af" text-anchor="middle" font-weight="700">Max=52</text>
    <!-- IQR bracket -->
    <line x1="132" y1="108" x2="302" y2="108" stroke="#7c3aed" stroke-width="1.5"/>
    <line x1="132" y1="104" x2="132" y2="112" stroke="#7c3aed" stroke-width="1.5"/>
    <line x1="302" y1="104" x2="302" y2="112" stroke="#7c3aed" stroke-width="1.5"/>
    <text x="217" y="118" font-size="9" fill="#7c3aed" text-anchor="middle" font-weight="700">IQR = Q\u2083 \u2212 Q\u2081 = 20</text>
  </svg>
  <div style="font-size:12px;color:#64748b;margin-top:6px">Box plot showing the five-number summary. The red line marks the median.</div>
</div>`;

export const bellCurveFigureHtml = `
<div style="text-align:center;margin:16px 0">
  <svg viewBox="0 0 400 160" width="100%" style="max-width:420px;display:inline-block">
    <!-- axis -->
    <line x1="30" y1="130" x2="370" y2="130" stroke="#94a3b8" stroke-width="1.5"/>
    <!-- SD bands (99.7% → 95% → 68%) -->
    <rect x="52" y="20" width="296" height="110" rx="3" fill="rgba(234,179,8,0.08)"/>
    <rect x="100" y="20" width="200" height="110" rx="3" fill="rgba(124,58,237,0.1)"/>
    <rect x="148" y="20" width="104" height="110" rx="3" fill="rgba(37,99,235,0.15)"/>
    <!-- bell curve path (approximate normal) -->
    <path d="M52,128 C80,126 100,120 130,95 C148,76 170,35 200,25 C230,35 252,76 270,95 C300,120 320,126 348,128" fill="none" stroke="#2563eb" stroke-width="2.5"/>
    <!-- mean line -->
    <line x1="200" y1="20" x2="200" y2="130" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4 2"/>
    <!-- SD markers -->
    <line x1="148" y1="125" x2="148" y2="135" stroke="#2563eb" stroke-width="1"/>
    <line x1="252" y1="125" x2="252" y2="135" stroke="#2563eb" stroke-width="1"/>
    <line x1="100" y1="125" x2="100" y2="135" stroke="#7c3aed" stroke-width="1"/>
    <line x1="300" y1="125" x2="300" y2="135" stroke="#7c3aed" stroke-width="1"/>
    <line x1="52" y1="125" x2="52" y2="135" stroke="#b45309" stroke-width="1"/>
    <line x1="348" y1="125" x2="348" y2="135" stroke="#b45309" stroke-width="1"/>
    <!-- labels -->
    <text x="200" y="145" font-size="9" fill="#dc2626" text-anchor="middle" font-weight="700">\u03BC</text>
    <text x="148" y="145" font-size="8" fill="#2563eb" text-anchor="middle">\u03BC\u22121\u03C3</text>
    <text x="252" y="145" font-size="8" fill="#2563eb" text-anchor="middle">\u03BC+1\u03C3</text>
    <text x="100" y="145" font-size="8" fill="#7c3aed" text-anchor="middle">\u03BC\u22122\u03C3</text>
    <text x="300" y="145" font-size="8" fill="#7c3aed" text-anchor="middle">\u03BC+2\u03C3</text>
    <text x="52" y="145" font-size="8" fill="#b45309" text-anchor="middle">\u03BC\u22123\u03C3</text>
    <text x="348" y="145" font-size="8" fill="#b45309" text-anchor="middle">\u03BC+3\u03C3</text>
    <!-- percentage labels -->
    <text x="200" y="80" font-size="11" fill="#2563eb" text-anchor="middle" font-weight="800">68%</text>
    <text x="200" y="105" font-size="10" fill="#7c3aed" text-anchor="middle" font-weight="700">95%</text>
    <text x="200" y="120" font-size="9" fill="#b45309" text-anchor="middle" font-weight="600">99.7%</text>
  </svg>
  <div style="font-size:12px;color:#64748b;margin-top:6px">The Empirical Rule: 68-95-99.7% of data falls within 1, 2, 3 standard deviations of the mean.</div>
</div>`;

export const zScoreFigureHtml = `
<div style="text-align:center;margin:16px 0">
  <svg viewBox="0 0 400 130" width="100%" style="max-width:420px;display:inline-block">
    <!-- axis -->
    <line x1="30" y1="90" x2="370" y2="90" stroke="#94a3b8" stroke-width="1.5"/>
    <!-- bell curve (faint) -->
    <path d="M40,88 C80,85 120,70 160,45 C180,30 190,18 200,15 C210,18 220,30 240,45 C280,70 320,85 360,88" fill="rgba(37,99,235,0.08)" stroke="#93c5fd" stroke-width="1.5"/>
    <!-- mean line -->
    <line x1="200" y1="10" x2="200" y2="90" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4 2"/>
    <text x="200" y="105" font-size="10" fill="#dc2626" text-anchor="middle" font-weight="700">\u03BC = 75</text>
    <!-- x = 82 marker -->
    <line x1="256" y1="10" x2="256" y2="90" stroke="#059669" stroke-width="2"/>
    <circle cx="256" cy="48" r="5" fill="#059669"/>
    <text x="256" y="105" font-size="10" fill="#059669" text-anchor="middle" font-weight="700">x = 82</text>
    <!-- arrow showing z -->
    <line x1="204" y1="25" x2="252" y2="25" stroke="#7c3aed" stroke-width="1.5" marker-end="url(#arrowZ)"/>
    <defs><marker id="arrowZ" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#7c3aed"/></marker></defs>
    <text x="228" y="20" font-size="10" fill="#7c3aed" text-anchor="middle" font-weight="700">z = 1.4</text>
    <!-- formula -->
    <text x="200" y="125" font-size="11" fill="#334155" text-anchor="middle" font-weight="600">z = (x \u2212 \u03BC) / \u03C3 = (82 \u2212 75) / 5 = 1.4</text>
  </svg>
  <div style="font-size:12px;color:#64748b;margin-top:6px">A z-score of 1.4 means the value is 1.4 standard deviations above the mean.</div>
</div>`;

export const stemPlotFigureHtml = `
<div style="text-align:center;margin:16px 0">
  <div style="display:inline-block;text-align:left;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 20px;font-family:monospace">
    <div style="font-size:13px;font-weight:800;color:#1e293b;margin-bottom:8px;font-family:sans-serif">Stem-and-Leaf Plot</div>
    <div style="font-size:12px;color:#6b7280;margin-bottom:6px;font-family:sans-serif">Data: 12, 15, 18, 21, 23, 25, 27, 31, 34, 38, 42, 45</div>
    <table style="border-collapse:collapse;font-size:14px">
      <tr><td style="padding:2px 12px 2px 0;font-weight:700;color:#2563eb;text-align:right;border-right:2px solid #2563eb">1</td><td style="padding:2px 0 2px 8px;color:#1e293b">2 &nbsp;5 &nbsp;8</td></tr>
      <tr><td style="padding:2px 12px 2px 0;font-weight:700;color:#2563eb;text-align:right;border-right:2px solid #2563eb">2</td><td style="padding:2px 0 2px 8px;color:#1e293b">1 &nbsp;3 &nbsp;5 &nbsp;7</td></tr>
      <tr><td style="padding:2px 12px 2px 0;font-weight:700;color:#2563eb;text-align:right;border-right:2px solid #2563eb">3</td><td style="padding:2px 0 2px 8px;color:#1e293b">1 &nbsp;4 &nbsp;8</td></tr>
      <tr><td style="padding:2px 12px 2px 0;font-weight:700;color:#2563eb;text-align:right;border-right:2px solid #2563eb">4</td><td style="padding:2px 0 2px 8px;color:#1e293b">2 &nbsp;5</td></tr>
    </table>
    <div style="font-size:11px;color:#7c3aed;margin-top:6px;font-family:sans-serif"><strong>Key:</strong> 2|3 = 23. The stem (tens) is on the left; the leaf (ones) is on the right.</div>
  </div>
  <div style="font-size:12px;color:#64748b;margin-top:6px">Stem-and-leaf plots preserve individual data values while showing distribution shape.</div>
</div>`;

export const scatterCorrelationFigureHtml = `
<div style="text-align:center;margin:16px 0">
  <svg viewBox="0 0 400 160" width="100%" style="max-width:420px;display:inline-block">
    <!-- axes -->
    <line x1="40" y1="140" x2="380" y2="140" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="40" y1="10" x2="40" y2="140" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="210" y="158" font-size="10" fill="#6b7280" text-anchor="middle">Hours studied</text>
    <text x="12" y="80" font-size="10" fill="#6b7280" text-anchor="middle" transform="rotate(-90,12,80)">Test score</text>
    <!-- data points (positive correlation) -->
    <circle cx="65" cy="120" r="4" fill="#2563eb" opacity="0.8"/>
    <circle cx="90" cy="108" r="4" fill="#2563eb" opacity="0.8"/>
    <circle cx="120" cy="95" r="4" fill="#2563eb" opacity="0.8"/>
    <circle cx="140" cy="100" r="4" fill="#2563eb" opacity="0.8"/>
    <circle cx="170" cy="78" r="4" fill="#2563eb" opacity="0.8"/>
    <circle cx="200" cy="70" r="4" fill="#2563eb" opacity="0.8"/>
    <circle cx="230" cy="60" r="4" fill="#2563eb" opacity="0.8"/>
    <circle cx="260" cy="55" r="4" fill="#2563eb" opacity="0.8"/>
    <circle cx="290" cy="42" r="4" fill="#2563eb" opacity="0.8"/>
    <circle cx="320" cy="35" r="4" fill="#2563eb" opacity="0.8"/>
    <circle cx="350" cy="28" r="4" fill="#2563eb" opacity="0.8"/>
    <!-- regression line -->
    <line x1="55" y1="125" x2="360" y2="24" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 3" opacity="0.8"/>
    <!-- r label -->
    <rect x="280" y="100" width="100" height="30" rx="6" fill="#fff" stroke="#e5e7eb" stroke-width="1"/>
    <text x="330" y="113" font-size="10" fill="#dc2626" text-anchor="middle" font-weight="700">r = 0.96</text>
    <text x="330" y="125" font-size="8" fill="#6b7280" text-anchor="middle">strong positive</text>
  </svg>
  <div style="font-size:12px;color:#64748b;margin-top:6px">Scatter plot with a strong positive linear correlation (r \u2248 0.96).</div>
</div>`;

export const histogramFigureHtml = `
<div style="text-align:center;margin:16px 0">
  <svg viewBox="0 0 400 150" width="100%" style="max-width:420px;display:inline-block">
    <!-- axes -->
    <line x1="50" y1="120" x2="370" y2="120" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="50" y1="10" x2="50" y2="120" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="210" y="142" font-size="10" fill="#6b7280" text-anchor="middle">Score range</text>
    <text x="18" y="70" font-size="10" fill="#6b7280" text-anchor="middle" transform="rotate(-90,18,70)">Frequency</text>
    <!-- bars (right-skewed distribution) -->
    <rect x="58" y="98" width="48" height="22" rx="2" fill="#2563eb" opacity="0.7"/>
    <rect x="110" y="58" width="48" height="62" rx="2" fill="#2563eb" opacity="0.8"/>
    <rect x="162" y="28" width="48" height="92" rx="2" fill="#2563eb" opacity="0.9"/>
    <rect x="214" y="48" width="48" height="72" rx="2" fill="#2563eb" opacity="0.8"/>
    <rect x="266" y="78" width="48" height="42" rx="2" fill="#2563eb" opacity="0.7"/>
    <rect x="318" y="100" width="48" height="20" rx="2" fill="#2563eb" opacity="0.6"/>
    <!-- frequency labels -->
    <text x="82" y="94" font-size="9" fill="#fff" text-anchor="middle" font-weight="700">3</text>
    <text x="134" y="54" font-size="9" fill="#fff" text-anchor="middle" font-weight="700">8</text>
    <text x="186" y="24" font-size="9" fill="#fff" text-anchor="middle" font-weight="700">12</text>
    <text x="238" y="44" font-size="9" fill="#fff" text-anchor="middle" font-weight="700">9</text>
    <text x="290" y="74" font-size="9" fill="#fff" text-anchor="middle" font-weight="700">5</text>
    <text x="342" y="96" font-size="9" fill="#fff" text-anchor="middle" font-weight="700">2</text>
    <!-- bin labels -->
    <text x="82" y="134" font-size="8" fill="#6b7280" text-anchor="middle">50-59</text>
    <text x="134" y="134" font-size="8" fill="#6b7280" text-anchor="middle">60-69</text>
    <text x="186" y="134" font-size="8" fill="#6b7280" text-anchor="middle">70-79</text>
    <text x="238" y="134" font-size="8" fill="#6b7280" text-anchor="middle">80-89</text>
    <text x="290" y="134" font-size="8" fill="#6b7280" text-anchor="middle">90-99</text>
    <text x="342" y="134" font-size="8" fill="#6b7280" text-anchor="middle">100+</text>
    <!-- mean/median markers -->
    <line x1="192" y1="120" x2="192" y2="126" stroke="#dc2626" stroke-width="2"/>
    <text x="192" y="148" font-size="8" fill="#dc2626" text-anchor="middle" font-weight="700">Mean \u2248 76</text>
  </svg>
  <div style="font-size:12px;color:#64748b;margin-top:6px">Histogram showing frequency distribution of test scores. Slightly left-skewed.</div>
</div>`;

export const outlierFigureHtml = `
<div style="text-align:center;margin:16px 0">
  <svg viewBox="0 0 400 100" width="100%" style="max-width:420px;display:inline-block">
    <!-- axis -->
    <line x1="30" y1="60" x2="370" y2="60" stroke="#94a3b8" stroke-width="1.5"/>
    <!-- data dots (clustered) -->
    <circle cx="120" cy="60" r="5" fill="#2563eb" opacity="0.8"/>
    <circle cx="140" cy="60" r="5" fill="#2563eb" opacity="0.8"/>
    <circle cx="155" cy="60" r="5" fill="#2563eb" opacity="0.8"/>
    <circle cx="170" cy="60" r="5" fill="#2563eb" opacity="0.8"/>
    <circle cx="185" cy="60" r="5" fill="#2563eb" opacity="0.8"/>
    <circle cx="195" cy="60" r="5" fill="#2563eb" opacity="0.8"/>
    <circle cx="210" cy="60" r="5" fill="#2563eb" opacity="0.8"/>
    <circle cx="225" cy="60" r="5" fill="#2563eb" opacity="0.8"/>
    <!-- outlier -->
    <circle cx="340" cy="60" r="6" fill="none" stroke="#dc2626" stroke-width="2.5"/>
    <text x="340" y="45" font-size="9" fill="#dc2626" text-anchor="middle" font-weight="700">Outlier!</text>
    <!-- fence line -->
    <line x1="280" y1="50" x2="280" y2="70" stroke="#d97706" stroke-width="1.5" stroke-dasharray="3 2"/>
    <text x="280" y="84" font-size="8" fill="#d97706" text-anchor="middle">Upper fence</text>
    <text x="280" y="93" font-size="8" fill="#d97706" text-anchor="middle">Q\u2083 + 1.5\u00D7IQR</text>
    <!-- Q1/Q3 labels -->
    <text x="145" y="84" font-size="8" fill="#2563eb" text-anchor="middle" font-weight="600">Q\u2081</text>
    <text x="220" y="84" font-size="8" fill="#2563eb" text-anchor="middle" font-weight="600">Q\u2083</text>
  </svg>
  <div style="font-size:12px;color:#64748b;margin-top:6px">An outlier lies beyond the fence (Q\u2083 + 1.5\u00D7IQR). Outliers pull the mean but not the median.</div>
</div>`;
