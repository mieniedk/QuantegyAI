import parallelogram from '../assets/diagrams/quad-parallelogram.svg?url';
import rectangle from '../assets/diagrams/quad-rectangle.svg?url';
import rhombus from '../assets/diagrams/quad-rhombus.svg?url';
import square from '../assets/diagrams/quad-square.svg?url';
import trapezoid from '../assets/diagrams/quad-trapezoid.svg?url';
import kite from '../assets/diagrams/quad-kite.svg?url';

const cell = (src, alt, caption) =>
  `<div style="text-align:center;min-width:0">
    <img src="${src}" alt="${alt}" style="width:100%;max-width:168px;height:auto;aspect-ratio:200/180;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;display:block;margin:0 auto"/>
    <div style="font-size:11px;color:#64748b;margin-top:6px;line-height:1.35">${caption}</div>
  </div>`;

export const quadrilateralFiguresHtml = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:12px;margin-top:14px">
${cell(parallelogram, 'Parallelogram with parallel sides marked and diagonals bisecting each other', 'Parallelogram: opp. sides ‖ & ≅, diags bisect')}
${cell(rectangle, 'Rectangle with right angles and equal diagonals marked', 'Rectangle: 4 right ∠s, diags ≅')}
${cell(rhombus, 'Rhombus with all sides equal and perpendicular diagonals', 'Rhombus: all sides ≅, diags ⊥')}
${cell(square, 'Square with right angles, equal sides, and perpendicular equal diagonals', 'Square: rect + rhombus')}
${cell(trapezoid, 'Trapezoid with one pair of parallel sides and midsegment', 'Trapezoid: 1 pair ‖, midseg = ½(b₁+b₂)')}
${cell(kite, 'Kite with two pairs of consecutive equal sides and perpendicular diagonals', 'Kite: 2 pairs consec. sides ≅')}
</div>`;
