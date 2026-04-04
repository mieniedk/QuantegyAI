import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Interactive manipulative: 2D homogeneous matrices as used in computer graphics
 * (model transforms: scale, rotation, shear, translation composed into one 3×3).
 */

const CX = 220;
const CY = 220;
const SCALE_PX = 42;

function multiply3(a, b) {
  const out = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += a[i][k] * b[k][j];
      out[i][j] = s;
    }
  }
  return out;
}

function apply3(M, v) {
  return [
    M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
    M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
    M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2],
  ];
}

/** Math coords: x right, y up → SVG y down */
function toSvg(x, y) {
  return { x: CX + SCALE_PX * x, y: CY - SCALE_PX * y };
}

function formatM(m) {
  return m.map((row) => row.map((n) => (Math.abs(n) < 1e-10 ? 0 : n)).map((n) => n.toFixed(2)));
}

// Simple “mesh”: quadrilateral + interior point (like a tiny 2D model)
const MODEL_VERTS = [
  [1.4, 0.3, 1],
  [0.2, 1.5, 1],
  [-1.2, 0.4, 1],
  [-0.4, -1.2, 1],
];

function MatrixTable({ label, m }) {
  const rows = formatM(m);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <table style={{ borderCollapse: 'collapse', fontSize: 13, fontFamily: 'ui-monospace, monospace' }}>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '6px 10px',
                    textAlign: 'center',
                    minWidth: 52,
                    background: i === 2 ? '#f1f5f9' : '#fff',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SliderRow({ label, value, onChange, min, max, step = 1 }) {
  return (
    <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr 52px', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14 }}>
      <span style={{ color: '#334155', fontWeight: 600 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%' }} />
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, color: '#0f172a' }}>{typeof value === 'number' && Math.abs(value) < 10 ? value.toFixed(2) : value}</span>
    </label>
  );
}

export default function MatrixTransformsGraphicsLab() {
  const [sx, setSx] = useState(1);
  const [sy, setSy] = useState(1);
  const [deg, setDeg] = useState(25);
  const [shx, setShx] = useState(0);
  const [shy, setShy] = useState(0);
  const [tx, setTx] = useState(0.3);
  const [ty, setTy] = useState(0.2);
  const [showFactors, setShowFactors] = useState(true);

  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const S = useMemo(
    () => [
      [sx, 0, 0],
      [0, sy, 0],
      [0, 0, 1],
    ],
    [sx, sy],
  );

  const H = useMemo(
    () => [
      [1, shx, 0],
      [shy, 1, 0],
      [0, 0, 1],
    ],
    [shx, shy],
  );

  const R = useMemo(
    () => [
      [cos, -sin, 0],
      [sin, cos, 0],
      [0, 0, 1],
    ],
    [cos, sin],
  );

  const T = useMemo(
    () => [
      [1, 0, tx],
      [0, 1, ty],
      [0, 0, 1],
    ],
    [tx, ty],
  );

  // Column vectors: apply S, then H, then R, then T → v' = T * R * H * S * v
  const M = useMemo(() => multiply3(T, multiply3(R, multiply3(H, S))), [T, R, H, S]);

  const transformed = useMemo(() => MODEL_VERTS.map((v) => apply3(M, v)), [M]);

  const origPoly = MODEL_VERTS.map((v) => {
    const p = toSvg(v[0], v[1]);
    return `${p.x},${p.y}`;
  }).join(' ');

  const newPoly = transformed.map((v) => {
    const p = toSvg(v[0], v[1]);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px 16px 48px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ margin: '0 0 8px', fontSize: 13 }}>
          <Link to="/classroom-tools" style={{ color: '#2563eb', fontWeight: 600 }}>← Classroom tools</Link>
          <span style={{ color: '#94a3b8' }}> · </span>
          <Link to="/" style={{ color: '#2563eb', fontWeight: 600 }}>Home</Link>
        </p>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, color: '#0f172a', fontWeight: 800 }}>Matrix transforms & computer graphics</h1>
        <p style={{ margin: '0 0 20px', fontSize: 15, color: '#475569', lineHeight: 1.55, maxWidth: 720 }}>
          In 2D and 3D pipelines, <strong>vertex positions</strong> are multiplied by matrices. Using <strong>homogeneous coordinates</strong>{' '}
          <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>(x, y, 1)</code>, translation fits into the same 3×3 multiply as scale, rotation, and shear.
          Order here: <strong>scale → shear → rotate → translate</strong> (rightmost matrix hits the vector first).
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 360px) 1fr',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              padding: '18px 18px 22px',
              boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
            }}
          >
            <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#1e293b' }}>Transform controls</h2>
            <SliderRow label="Scale x" value={sx} onChange={setSx} min={0.25} max={2} step={0.05} />
            <SliderRow label="Scale y" value={sy} onChange={setSy} min={0.25} max={2} step={0.05} />
            <SliderRow label="Rotate (°)" value={deg} onChange={setDeg} min={-180} max={180} step={1} />
            <SliderRow label="Shear x" value={shx} onChange={setShx} min={-0.8} max={0.8} step={0.02} />
            <SliderRow label="Shear y" value={shy} onChange={setShy} min={-0.8} max={0.8} step={0.02} />
            <SliderRow label="Translate x" value={tx} onChange={setTx} min={-2.5} max={2.5} step={0.05} />
            <SliderRow label="Translate y" value={ty} onChange={setTy} min={-2.5} max={2.5} step={0.05} />
            <button
              type="button"
              onClick={() => {
                setSx(1);
                setSy(1);
                setDeg(0);
                setShx(0);
                setShy(0);
                setTx(0);
                setTy(0);
              }}
              style={{
                marginTop: 8,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                color: '#334155',
              }}
            >
              Reset to identity
            </button>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
              <input type="checkbox" checked={showFactors} onChange={(e) => setShowFactors(e.target.checked)} />
              Show factor matrices (S, H, R, T)
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                background: '#fff',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                padding: 16,
                boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
              }}
            >
              <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800, color: '#1e293b' }}>Plot (y-axis points up mathematically)</h2>
              <svg viewBox="0 0 440 440" style={{ width: '100%', maxWidth: 440, display: 'block', margin: '0 auto', borderRadius: 10, background: '#fafafa' }}>
                <defs>
                  <marker id="arrowM" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" fill="#94a3b8" />
                  </marker>
                </defs>
                {/* Grid */}
                {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((g) => {
                  const a = toSvg(g, -5);
                  const b = toSvg(g, 5);
                  const c = toSvg(-5, g);
                  const d = toSvg(5, g);
                  return (
                    <g key={g}>
                      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#e2e8f0" strokeWidth={g === 0 ? 2 : 1} />
                      <line x1={c.x} y1={c.y} x2={d.x} y2={d.y} stroke="#e2e8f0" strokeWidth={g === 0 ? 2 : 1} />
                    </g>
                  );
                })}
                <line x1={CX} y1={CY} x2={CX + 120} y2={CY} stroke="#64748b" strokeWidth={2} markerEnd="url(#arrowM)" />
                <line x1={CX} y1={CY} x2={CX} y2={CY - 120} stroke="#64748b" strokeWidth={2} markerEnd="url(#arrowM)" />
                <text x={CX + 125} y={CY + 5} fontSize={12} fill="#475569" fontWeight={700}>x</text>
                <text x={CX + 6} y={CY - 125} fontSize={12} fill="#475569" fontWeight={700}>y</text>
                <text x={CX + 6} y={CY + 18} fontSize={11} fill="#64748b">O</text>

                <polygon points={origPoly} fill="rgba(37,99,235,0.12)" stroke="#93c5fd" strokeWidth={2} strokeDasharray="6 4" />
                <polygon points={newPoly} fill="rgba(22,163,74,0.2)" stroke="#16a34a" strokeWidth={2.5} />
                {MODEL_VERTS.map((v, i) => {
                  const p = toSvg(v[0], v[1]);
                  return <circle key={`o-${i}`} cx={p.x} cy={p.y} r={4} fill="#60a5fa" />;
                })}
                {transformed.map((v, i) => {
                  const p = toSvg(v[0], v[1]);
                  return <circle key={`t-${i}`} cx={p.x} cy={p.y} r={5} fill="#22c55e" stroke="#fff" strokeWidth={1.5} />;
                })}
              </svg>
              <p style={{ margin: '10px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>Blue dashed</span>: original model vertices ·{' '}
                <span style={{ color: '#16a34a', fontWeight: 700 }}>Green</span>: after <code style={{ fontSize: 11 }}>M = T·R·H·S</code>
              </p>
            </div>

            <div
              style={{
                background: '#fff',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                padding: 16,
                boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
              }}
            >
              <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#1e293b' }}>Combined model matrix M</h2>
              <MatrixTable label="M = T · R · H · S" m={M} />
              {showFactors && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 8 }}>
                  <MatrixTable label="S (scale)" m={S} />
                  <MatrixTable label="H (shear)" m={H} />
                  <MatrixTable label="R (rotate)" m={R} />
                  <MatrixTable label="T (translate)" m={T} />
                </div>
              )}
            </div>

            <div
              style={{
                background: '#eff6ff',
                borderRadius: 12,
                border: '1px solid #bfdbfe',
                padding: '14px 16px',
                fontSize: 14,
                color: '#1e3a5f',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ display: 'block', marginBottom: 6, color: '#1d4ed8' }}>Graphics pipeline context</strong>
              A <strong>vertex shader</strong> typically computes something like <code style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>clipPos = Projection × View × Model × vec4(position, 1)</code>.
              This lab is only the <strong>2D model</strong> part. The same idea extends to 4×4 matrices in 3D (with perspective in the projection matrix). Composing many matrices into one avoids per-vertex work and matches how game engines and APIs (WebGL, Metal, Vulkan) structure transforms.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
