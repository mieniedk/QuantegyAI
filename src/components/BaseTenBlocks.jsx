import React from 'react';

/**
 * BaseTenBlocks – Visual representation of base-ten manipulatives.
 *
 * Props:
 *   thousands: number of thousand-cubes (big cubes)
 *   hundreds:  number of hundred-flats (flat squares)
 *   tens:      number of ten-rods     (long bars)
 *   ones:      number of unit-cubes   (tiny cubes)
 *   showLabels: boolean – show count labels under each group (default true)
 *   size:       'sm' | 'md' | 'lg' (default 'md')
 *   animate:    boolean – subtle entrance animation (default true)
 */

// ─── Color palette for each place value ────────────────────
const COLORS = {
  thousand: { fill: '#7c3aed', stroke: '#5b21b6', label: '#7c3aed', bg: '#f5f3ff', name: 'Thousands' },
  hundred:  { fill: '#2563eb', stroke: '#1d4ed8', label: '#2563eb', bg: '#eff6ff', name: 'Hundreds' },
  ten:      { fill: '#059669', stroke: '#047857', label: '#059669', bg: '#ecfdf5', name: 'Tens' },
  one:      { fill: '#f59e0b', stroke: '#d97706', label: '#f59e0b', bg: '#fffbeb', name: 'Ones' },
};

// ─── Size presets ──────────────────────────────────────────
const SIZES = {
  sm: { cube: 36, flat: 28, rod: 22, unit: 10, gap: 3, groupGap: 12 },
  md: { cube: 48, flat: 34, rod: 28, unit: 12, gap: 4, groupGap: 16 },
  lg: { cube: 60, flat: 42, rod: 34, unit: 14, gap: 5, groupGap: 20 },
};

// ─── Individual block shapes ──────────────────────────────

/** Thousand cube — isometric 3D cube with three visible faces */
const ThousandCube = ({ size, delay }) => {
  const s = size;
  const depth = Math.round(s * 0.28);
  const face = s - 4;

  return (
    <div style={{
      width: s + depth, height: s + depth,
      position: 'relative',
      animation: delay != null ? `baseTenPop 0.3s ease ${delay}ms both` : undefined,
    }}>
      {/* ── Right side face (depth) ── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: depth,
        height: face,
        background: 'linear-gradient(180deg, #5b21b6 0%, #4c1d95 100%)',
        borderRadius: '0 4px 4px 0',
        border: `2px solid ${COLORS.thousand.stroke}`,
        borderLeft: 'none',
        overflow: 'hidden',
      }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={`rs-${i}`} style={{
            position: 'absolute', left: 0, right: 0,
            top: `${(i + 1) * 10}%`, height: 1,
            background: 'rgba(255,255,255,0.12)',
          }} />
        ))}
      </div>

      {/* ── Top face (depth) ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: face,
        height: depth,
        background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)',
        borderRadius: '4px 4px 0 0',
        border: `2px solid ${COLORS.thousand.stroke}`,
        borderBottom: 'none',
        overflow: 'hidden',
        transformOrigin: 'bottom left',
      }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={`ts-${i}`} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${(i + 1) * 10}%`, width: 1,
            background: 'rgba(255,255,255,0.18)',
          }} />
        ))}
      </div>

      {/* ── Top-right connector (corner triangle) ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: depth,
        height: depth,
        background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
        borderRadius: '0 4px 0 0',
        border: `2px solid ${COLORS.thousand.stroke}`,
        borderLeft: 'none',
        borderBottom: 'none',
        opacity: 0.85,
      }} />

      {/* ── Front face (main 10×10 grid) ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: face, height: face,
        background: `linear-gradient(180deg, ${COLORS.thousand.fill} 0%, #6d28d9 100%)`,
        borderRadius: 4,
        border: `2px solid ${COLORS.thousand.stroke}`,
        display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center',
        padding: 2, gap: 1, overflow: 'hidden',
      }}>
        {/* 10×10 grid lines */}
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={`h-${i}`} style={{
            position: 'absolute', left: 2, right: 2,
            top: `${(i + 1) * 10}%`, height: 1,
            background: 'rgba(255,255,255,0.18)',
          }} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={`v-${i}`} style={{
            position: 'absolute', top: 2, bottom: 2,
            left: `${(i + 1) * 10}%`, width: 1,
            background: 'rgba(255,255,255,0.18)',
          }} />
        ))}
        <span style={{
          fontSize: s * 0.26, fontWeight: 800, color: 'rgba(255,255,255,0.9)',
          textShadow: '0 1px 3px rgba(0,0,0,0.35)', zIndex: 1,
        }}>1000</span>
      </div>

      {/* ── "10 layers" label on the side face ── */}
      <div style={{
        position: 'absolute',
        bottom: face * 0.38,
        right: 2,
        width: depth - 6,
        textAlign: 'center',
        fontSize: Math.max(7, depth * 0.32),
        fontWeight: 700,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 1.1,
        pointerEvents: 'none',
      }}>
        10<br/>deep
      </div>
    </div>
  );
};

/** Hundred flat — square with 10×10 grid */
const HundredFlat = ({ size, delay }) => {
  const s = size;
  return (
    <div style={{
      width: s, height: s, position: 'relative',
      animation: delay != null ? `baseTenPop 0.3s ease ${delay}ms both` : undefined,
    }}>
      <div style={{
        width: '100%', height: '100%',
        background: `linear-gradient(135deg, ${COLORS.hundred.fill}, #3b82f6)`,
        borderRadius: 3,
        border: `1.5px solid ${COLORS.hundred.stroke}`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* 10x10 grid */}
        {Array.from({ length: 9 }).map((_, i) => (
          <React.Fragment key={i}>
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: `${(i + 1) * 10}%`, height: 1,
              background: 'rgba(255,255,255,0.25)',
            }} />
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${(i + 1) * 10}%`, width: 1,
              background: 'rgba(255,255,255,0.25)',
            }} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/** Ten rod — long vertical bar with 10 segments */
const TenRod = ({ size, delay }) => {
  const w = size * 0.35;
  const h = size;
  return (
    <div style={{
      width: w, height: h,
      animation: delay != null ? `baseTenPop 0.3s ease ${delay}ms both` : undefined,
    }}>
      <div style={{
        width: '100%', height: '100%',
        background: `linear-gradient(180deg, ${COLORS.ten.fill}, #10b981)`,
        borderRadius: 3,
        border: `1.5px solid ${COLORS.ten.stroke}`,
        position: 'relative', overflow: 'hidden',
      }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0,
            top: `${(i + 1) * 10}%`, height: 1,
            background: 'rgba(255,255,255,0.35)',
          }} />
        ))}
      </div>
    </div>
  );
};

/** Unit cube — small square */
const UnitCube = ({ size, delay }) => (
  <div style={{
    width: size, height: size,
    background: `linear-gradient(135deg, ${COLORS.one.fill}, #fbbf24)`,
    borderRadius: 2,
    border: `1px solid ${COLORS.one.stroke}`,
    animation: delay != null ? `baseTenPop 0.3s ease ${delay}ms both` : undefined,
  }} />
);

// ─── Group of blocks for one place value ──────────────────
// ALWAYS renders — even when count is 0 — so students see every place value
const BlockGroup = ({ count, type, dims, showLabels, animate, forceShow }) => {
  // Only skip thousands when there are truly none and forceShow is not set
  if (count === 0 && type === 'thousand' && !forceShow) return null;

  const color = COLORS[type];
  const blocks = [];

  for (let i = 0; i < count; i++) {
    const delay = animate ? i * 80 : undefined;
    switch (type) {
      case 'thousand':
        blocks.push(<ThousandCube key={i} size={dims.cube} delay={delay} />);
        break;
      case 'hundred':
        blocks.push(<HundredFlat key={i} size={dims.flat} delay={delay} />);
        break;
      case 'ten':
        blocks.push(<TenRod key={i} size={dims.rod} delay={delay} />);
        break;
      case 'one':
        blocks.push(<UnitCube key={i} size={dims.unit} delay={delay} />);
        break;
    }
  }

  const isEmpty = count === 0;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      {showLabels && (
        <div style={{
          fontSize: 11, fontWeight: 700, color: isEmpty ? '#94a3b8' : color.label,
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {color.name}
        </div>
      )}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: dims.gap,
        justifyContent: 'center', alignItems: 'center',
        padding: isEmpty ? '12px 14px' : '8px 10px',
        background: isEmpty ? '#f8fafc' : color.bg,
        borderRadius: 10,
        border: isEmpty ? '2px dashed #e2e8f0' : `1.5px dashed ${color.fill}40`,
        minWidth: 44, minHeight: 44,
      }}>
        {isEmpty ? (
          <span style={{
            fontSize: 22, fontWeight: 800, color: '#cbd5e1',
            fontFamily: 'system-ui, sans-serif',
          }}>0</span>
        ) : blocks}
      </div>
      {showLabels && (
        <div style={{
          fontSize: isEmpty ? 14 : 16, fontWeight: 800,
          color: isEmpty ? '#94a3b8' : color.label,
        }}>
          {count} × {type === 'thousand' ? '1,000' : type === 'hundred' ? '100' : type === 'ten' ? '10' : '1'}
        </div>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────
const BaseTenBlocks = ({
  thousands = 0,
  hundreds = 0,
  tens = 0,
  ones = 0,
  showLabels = true,
  size = 'md',
  animate = true,
}) => {
  const dims = SIZES[size] || SIZES.md;
  const total = thousands * 1000 + hundreds * 100 + tens * 10 + ones;

  return (
    <div>
      {/* CSS keyframe for pop-in animation */}
      <style>{`
        @keyframes baseTenPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: dims.groupGap,
        justifyContent: 'center', alignItems: 'flex-end',
        padding: 12,
      }}>
        <BlockGroup count={thousands} type="thousand" dims={dims} showLabels={showLabels} animate={animate} />
        <BlockGroup count={hundreds} type="hundred" dims={dims} showLabels={showLabels} animate={animate} />
        <BlockGroup count={tens} type="ten" dims={dims} showLabels={showLabels} animate={animate} />
        <BlockGroup count={ones} type="one" dims={dims} showLabels={showLabels} animate={animate} />
      </div>

      {/* Total equation — always show ALL place values to teach place value correctly */}
      {showLabels && (
        <div style={{
          textAlign: 'center', marginTop: 8, padding: '10px 16px',
          background: '#f8fafc', borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}>
          {/* Place value labels row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 6,
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            {thousands > 0 && <span style={{ color: COLORS.thousand.label, minWidth: 48, textAlign: 'center' }}>Thousands</span>}
            {thousands > 0 && <span style={{ color: '#cbd5e1', width: 14 }}></span>}
            <span style={{ color: COLORS.hundred.label, minWidth: 36, textAlign: 'center' }}>Hundreds</span>
            <span style={{ color: '#cbd5e1', width: 14 }}></span>
            <span style={{ color: COLORS.ten.label, minWidth: 24, textAlign: 'center' }}>Tens</span>
            <span style={{ color: '#cbd5e1', width: 14 }}></span>
            <span style={{ color: COLORS.one.label, minWidth: 24, textAlign: 'center' }}>Ones</span>
          </div>
          {/* Equation row */}
          <span style={{ fontSize: 15, color: '#64748b', fontWeight: 700 }}>
            {thousands > 0 && <><span style={{ color: COLORS.thousand.label }}>{(thousands * 1000).toLocaleString()}</span> + </>}
            <span style={{ color: COLORS.hundred.label }}>{hundreds * 100}</span>
            {' + '}
            <span style={{ color: COLORS.ten.label }}>{tens * 10}</span>
            {' + '}
            <span style={{ color: COLORS.one.label }}>{ones}</span>
            {' = '}
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{total.toLocaleString()}</span>
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Parse a question to detect base-ten block references.
 * Returns { thousands, hundreds, tens, ones } or null if not detected.
 */
export const parseBaseTenBlocks = (question) => {
  if (!question) return null;
  const q = question.toLowerCase();
  if (!q.includes('base-ten') && !q.includes('base ten') && !q.includes('blocks')) return null;

  const thousands = parseInt((q.match(/(\d+)\s*thousand[- ]?cubes?/i) || [])[1]) || 0;
  const hundreds = parseInt((q.match(/(\d+)\s*hundred[- ]?flats?/i) || [])[1]) || 0;
  const tens = parseInt((q.match(/(\d+)\s*ten[- ]?rods?/i) || [])[1]) || 0;
  const ones = parseInt((q.match(/(\d+)\s*(?:unit[- ]?cubes?|ones?[- ]?cubes?)/i) || [])[1]) || 0;

  if (thousands === 0 && hundreds === 0 && tens === 0 && ones === 0) return null;
  return { thousands, hundreds, tens, ones };
};

export default BaseTenBlocks;
