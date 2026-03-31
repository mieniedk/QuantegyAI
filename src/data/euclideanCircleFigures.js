import tangentPerp from '../assets/diagrams/euclid-tangent-perp.svg?url';
import twoTangents from '../assets/diagrams/euclid-two-tangents.svg?url';
import thales from '../assets/diagrams/euclid-thales.svg?url';
import chordChord from '../assets/diagrams/euclid-chord-chord.svg?url';
import secantSecant from '../assets/diagrams/euclid-secant-secant.svg?url';
import powerPoint from '../assets/diagrams/euclid-power-point.svg?url';

const cell = (src, alt, caption) =>
  `<div style="text-align:center;min-width:0">
    <img src="${src}" alt="${alt}" style="width:100%;max-width:168px;height:auto;aspect-ratio:200/180;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;display:block;margin:0 auto"/>
    <div style="font-size:11px;color:#64748b;margin-top:6px;line-height:1.35">${caption}</div>
  </div>`;

/** Sanitized HTML grid of circle-theorem diagrams for math712:c013 variant. */
export const euclideanCircleTheoremsFiguresHtml = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:12px;margin-top:14px">
${cell(tangentPerp, 'Circle with radius to point of tangency and perpendicular tangent line', 'Tangent ⊥ radius at tangency')}
${cell(twoTangents, 'Two tangent segments from an external point to a circle', 'Two tangents from external point: equal length')}
${cell(thales, 'Triangle inscribed in a semicircle with diameter as base', 'Measure of inscribed ∠ in semicircle = 90°')}
${cell(chordChord, 'Two chords intersecting inside a circle', 'Chord–chord: angle = ½(sum of intercepted arcs)')}
${cell(secantSecant, 'Two secants from an external point through a circle', 'Secant–secant (outside): angle = ½(difference of arcs)')}
${cell(powerPoint, 'Two chords intersecting at interior point E', 'Power of a point: EA·EB = EC·ED')}
</div>`;
