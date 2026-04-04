/**
 * Micro-concepts for TExES competencies
 * Structure: 60–120 words, one worked example, one "watch out" misconception
 * All math notation uses ^ for exponents (formatMathHtml renders as superscript)
 * Key: examId:compId or examId:teks for EC-6
 * Optional illustrationHtml: safe HTML (img grid) rendered below conceptText where supported.
 * Optional conceptRefreshSlides: [{ conceptText, illustrationHtml? }] for paged concept recap only.
 */

import { euclideanCircleTheoremsFiguresHtml, chordVsDiameterFigureHtml } from './euclideanCircleFigures';
import { quadrilateralFiguresHtml } from './quadrilateralFigures';
import {
  boxPlotFigureHtml, bellCurveFigureHtml, zScoreFigureHtml,
  stemPlotFigureHtml, scatterCorrelationFigureHtml, histogramFigureHtml,
  outlierFigureHtml,
} from './statsDataFigures';
import {
  complexPlaneEulerConjugateFiguresHtml,
  complexPlaneModArgFiguresHtml,
  eulerConjugateFiguresHtml,
} from './complexNumbersFigures';

export const MICRO_CONCEPTS = {
  // ═══════════════════════════════════════════════════════════════
  // Math 7–12 (math712)
  // ═══════════════════════════════════════════════════════════════

  // ── Competency-level fallbacks ──
  'math712:comp001': {
    title: 'Number Concepts',
    conceptText: 'Real numbers: rationals ((a)/(b), b≠0) and irrationals (π, √2). LCM: take the highest power of each prime factor; GCF: take the lowest power of each common prime factor. Exponent rules: a^m · a^n = a^(m+n); a^m ÷ a^n = a^(m−n); (a^m)^n = a^(mn); a^0 = 1 (a≠0); a^(−n) = (1)/(a^n). Radicals: √(ab) = √a·√b. Absolute value: |x−a| < b ⟺ −b < x−a < b.',
    workedExample: 'LCM(8,12): 8 = 2³, 12 = 2²×3. LCM = 2³×3 = 24. Also: 7^(−2) = (1)/(7²) = (1)/(49).',
    misconception: 'The product of two irrationals can be rational. Example: √2 · √2 = 2, which is rational.',
  },
  'math712:comp002': {
    title: 'Patterns and Algebra',
    conceptText: 'Linear: slope m = (y₂−y₁)/(x₂−x₁), y = mx + b. Quadratics: vertex form f(x) = a(x−h)² + k has vertex (h, k). Arithmetic sequence: aₙ = a₁ + (n − 1) · d. Systems: add or substitute to eliminate. Exponent rules (same base): a^m · a^n = a^(m+n); a^m ÷ a^n = a^(m−n); (a^m)^n = a^(mn).',
    workedExample: '2^(3x) · 2^(2x) = 2^(3x+2x) = 2^(5x). Slope (2,5)→(4,11): m = 6/2 = 3.',
    misconception: 'Vertex (h,k) sign confusion: (x−2)²−3 has vertex (2, −3), not (−2, 3).',
  },
  'math712:comp003': {
    title: 'Geometry and Measurement',
    conceptText: 'Interior angles: n-gon sum = (n−2)×180°; regular = (sum)/(n). Volume: cylinder V = πr²h; cone V = (1)/(3)πr²h. Similar figures: length ∝ k; area ∝ k²; volume ∝ k³. Pythagorean: a² + b² = c². Absolute value inequality: |x−a| < b ⟺ −b < x−a < b.',
    workedExample: 'Regular hexagon: sum = 720°, each = 120°. Scale factor 3: area multiplies by 9.',
    misconception: 'Area scales by the square of the scale factor (k²). Doubling each side gives 4× the area, not 2×.',
  },
  'math712:comp004': {
    title: 'Probability and Statistics',
    conceptText: 'Probability: P(A) = favorable outcomes ÷ total outcomes. Independent: P(A and B) = P(A)·P(B). Mean = Σx ÷ n; median = middle; mode = most frequent. Normal: ~68% within 1σ, ~95% within 2σ. Conditional: P(A|B) = P(A∩B) ÷ P(B).',
    workedExample: 'P(5 on fair die) = (1)/(6). P(two 5s) = (1)/(6)·(1)/(6) = (1)/(36).',
    misconception: 'Correlation does not imply causation. Two variables can be related without one causing the other.',
  },
  'math712:comp005': {
    title: 'Mathematical Processes',
    conceptText: 'Problem-solving: understand, plan, solve, check. Reasoning: conjectures, counterexamples, proofs. Communication: precise language, clear notation. Connections: algebra, geometry, real-world. Multiple representations: tables, graphs, equations.',
    workedExample: 'Disprove "all primes odd": 2 is prime and even. One counterexample suffices.',
    misconception: 'Verifying a pattern for a few cases does not prove it. A formal proof or counterexample is needed for certainty.',
  },
  'math712:comp006': {
    title: 'Mathematical Learning, Instruction & Assessment',
    conceptText: 'Effective math instruction uses formative assessment to guide decisions. Diagnostic items reveal misconceptions; exit tickets measure daily progress. Differentiation: scaffolded tasks, multiple entry points. Rubrics communicate expectations and align to TEKS standards.',
    workedExample: 'A student writes (3)/(4) + (1)/(2) = (4)/(6). The misconception is adding numerators and denominators separately — use common denominator: (3)/(4) + (2)/(4) = (5)/(4).',
    misconception: 'Formative and summative assessment serve different purposes. Formative informs instruction in real time; summative measures achievement after instruction.',
  },

  // ── Standard-level entries (c001–c022) with variants ──
  // Each entry has a base concept plus a `variants` array. getMicroConcept
  // rotates through them so the user sees fresh content each visit.

  // Domain I — Number Concepts
  'math712:c001': {
    title: 'Real Number System',
    conceptText: 'Real numbers = rationals ∪ irrationals. Rationals: (a)/(b) with b≠0 (includes integers, terminating and repeating decimals). Irrationals: non-repeating, non-terminating (π, √2, e). Number line is complete — every point is a real number. Properties: commutative, associative, distributive, identity, inverse. Ordering: density — between any two reals there is another real.',
    workedExample: 'Show 0.3̄ is rational: let x = 0.333… → 10x = 3.333… → 9x = 3 → x = (1)/(3).',
    misconception: 'A radical sign does not make a number irrational. √4 = 2, which is rational. Only non-perfect-square roots (like √2, √3) are irrational.',
    variants: [
      { conceptText: 'Subsets of ℝ: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Closure: ℚ is closed under +, −, ×, ÷ (b ≠ 0). ℝ is closed under +, −, ×, and ÷ (divisor ≠ 0). The additive inverse of a is −a. The Multiplicative inverse of a (a ≠ 0) is (1)/(a). The distributive property, a(b + c) = ab + ac, links addition and multiplication. Absolute value as a piecewise function: |a| = { a, if a ≥ 0; −a, if a < 0 }.',
        workedExample: 'Is √(50) rational? 50 is not a perfect square, so √(50) is irrational. Simplify: √(50) = √(25·2) = 5√2.',
        misconception: 'The sum of two irrationals can be rational. Example: (3+√2) + (3−√2) = 6, which is rational.' },
      { conceptText: 'Decimal representations: terminating → rational (0.75 = (3)/(4)). Repeating → rational (0.16̅ = 0.1666… = (1)/(6)). Non-repeating, non-terminating → irrational (π, e). Every fraction can be written as a terminating or repeating decimal. To convert repeating: set x = decimal, multiply to shift, subtract. Density: between any two distinct reals there are infinitely many rationals and irrationals.',
        workedExample: 'Convert 0.27̄ to a fraction: x = 0.2777… → 10x = 2.777… → 10x − x = 2.5 → 9x = 2.5 → x = (5)/(18).',
        misconception: 'π is irrational and cannot be expressed as any fraction. (22)/(7) ≈ 3.1429 is only an approximation; π ≈ 3.14159… continues without repeating.' },
    ],
  },
  'math712:c002': {
    title: 'Complex Numbers',
    conceptText: 'Complex: z = a + bi where i² = −1. Addition: (a+bi) + (c+di) = (a+c) + (b+d)i. Multiplication uses FOIL and i² = −1. Conjugate: z̄ = a − bi; z·z̄ = a² + b². Magnitude: |z| = √(a²+b²). Polar form: z = r(cos θ + i sin θ). Fundamental Theorem of Algebra: degree-n polynomial has exactly n roots (counting multiplicity) in ℂ.',
    workedExample: '(2+3i)(1−i) = 2 − 2i + 3i − 3i² = 2 + i + 3 = 5 + i.',
    misconception: 'By definition, i² = −1 (not +1). Getting this sign right is critical — it cascades through every complex multiplication.',
    variants: [
      { conceptText: 'Powers of i cycle: i^1 = i, i^2 = −1, i^3 = −i, i^4 = 1, then repeats. Division: multiply numerator and denominator by the conjugate. Polar multiplication: multiply magnitudes, add angles. De Moivre\'s Theorem: (r·cis θ)^n = r^n·cis(nθ). Roots: n-th roots of z give n equally spaced points on a circle of radius r^(1/n).',
        workedExample: 'Divide (3+4i)/(1−2i): multiply by (1+2i)/(1+2i) → (3+4i)(1+2i)/((1)²+(2)²) = (−5+10i)/(5) = −1+2i.',
        misconception: 'To divide complex numbers, multiply numerator and denominator by the conjugate of the denominator. You cannot just divide real and imaginary parts separately.' },
      { conceptText: 'The complex plane: real axis (horizontal), imaginary axis (vertical). Each z = a+bi is the point (a,b). Magnitude |z| = distance from origin. Argument arg(z) = angle from positive real axis. Euler\'s formula: e^(iθ) = cos θ + i sin θ. This connects exponential and trigonometric functions. Conjugate roots theorem: polynomial with real coefficients → complex roots come in conjugate pairs.',
        workedExample: 'x² + 4 = 0 → x² = −4 → x = ±2i. Both roots are conjugates: 2i and −2i.',
        misconception: 'A quadratic always has exactly two roots in ℂ (the complex numbers). When there are no real roots, the two roots are complex conjugates.',
        illustrationHtml: complexPlaneEulerConjugateFiguresHtml,
        conceptRefreshSlides: [
          {
            conceptText: 'The complex plane: real axis (horizontal), imaginary axis (vertical). Each z = a+bi is the point (a,b). Magnitude |z| = distance from origin. Argument arg(z) = angle from positive real axis.',
            illustrationHtml: complexPlaneModArgFiguresHtml,
          },
          {
            conceptText: 'Euler\'s formula: e^(iθ) = cos θ + i sin θ. This connects exponential and trigonometric functions. Conjugate roots theorem: polynomial with real coefficients → complex roots come in conjugate pairs.',
            illustrationHtml: eulerConjugateFiguresHtml,
          },
        ] },
    ],
  },
  'math712:c003': {
    title: 'Number Theory',
    conceptText: 'Fundamental Theorem of Arithmetic: every integer > 1 has a unique prime factorization. GCF: lowest power of common primes; LCM: highest power of all primes. Euclidean algorithm: gcd(a,b) = gcd(b, a mod b). Divisibility rules speed factor finding. Modular arithmetic: a ≡ b (mod n) means n | (a−b). Combinations: C(n,k) = (n!)/(k!(n−k)!).',
    workedExample: 'gcd(48,18): 48 = 2·18 + 12; 18 = 1·12 + 6; 12 = 2·6 + 0. So gcd = 6.',
    misconception: '1 is not a prime number. Primes must have exactly two distinct factors (1 and themselves); 1 has only one factor.',
    variants: [
      { conceptText: 'Divisibility tests: by 2 → last digit even; by 3 → digit sum divisible by 3; by 9 → digit sum divisible by 9; by 4 → last two digits form a multiple of 4; by 6 → divisible by both 2 and 3. Prime factorization enables GCF/LCM. Permutations P(n,r) = n!/(n−r)!: order matters. Combinations C(n,r): order doesn\'t matter.',
        workedExample: 'Is 2,574 divisible by 6? Sum of digits: 2+5+7+4 = 18 (div by 3) and last digit 4 (even). Yes, divisible by 6.',
        misconception: 'Divisibility does not always "combine" as expected. For example, 6 is divisible by both 2 and 6, but not by 12. The key is LCM: LCM(2,6) = 6, not 12.' },
      { conceptText: 'Modular arithmetic: clock arithmetic. a ≡ b (mod n) means a and b have the same remainder when divided by n. Addition and multiplication preserve congruence. Fermat\'s Little Theorem: if p is prime and gcd(a,p)=1, then a^(p−1) ≡ 1 (mod p). Applications: cryptography (RSA), checksums, day-of-week calculations.',
        workedExample: 'What is 2^10 mod 7? 2^3 = 8 ≡ 1 (mod 7). So 2^10 = (2^3)^3 · 2^1 ≡ 1^3 · 2 = 2 (mod 7).',
        misconception: 'Modular arithmetic works with any positive integer modulus, not just primes. Primes give nicer algebraic properties (every nonzero element has a multiplicative inverse), but the system is valid for any modulus.' },
    ],
  },

  // Domain II — Patterns and Algebra
  'math712:c004': {
    title: 'Patterns & Sequences',
    conceptText: 'Arithmetic sequence: aₙ = a₁ + (n−1)d; sum Sₙ = (n(a₁+aₙ))/(2). Geometric sequence: aₙ = a₁·r^(n−1); sum Sₙ = a₁(1−r^(n))/(1−r). Fibonacci: each term is sum of two preceding. Sigma notation: Σ_{k=1}^{n} compresses a series. Mathematical induction: base case + inductive step proves ∀n. Finance: compound interest A = P·(1 + (r)/(n))^(nt).',
    workedExample: 'Arithmetic: a₁ = 3, d = 5. a₂₀ = 3 + 19·5 = 98. S₂₀ = (20(3+98))/(2) = 1010.',
    misconception: 'An arithmetic sequence adds the same value each time (common difference d); a geometric sequence multiplies by the same value (common ratio r). "Adds 2 each time" is arithmetic (d=2), not geometric.',
    variants: [
      { conceptText: 'Geometric series: finite Sₙ = a₁(1−r^(n))/(1−r); infinite (|r| < 1) S = a₁/(1−r). Recursive vs. explicit formulas: recursive defines aₙ in terms of previous terms; explicit gives aₙ directly from n. Sigma notation: Σ_{k=1}^{n} k = (n(n+1))/(2). Mathematical induction: prove P(1), then assume P(k) → prove P(k+1).',
        workedExample: 'Infinite geometric: a₁ = 12, r = (1)/(3). S = 12/(1−(1)/(3)) = 12/((2)/(3)) = 18.',
        misconception: 'An infinite geometric series converges to a finite sum when |r| < 1. Not all infinite series diverge.' },
      { conceptText: 'Recognizing sequence type: constant difference → arithmetic; constant ratio → geometric; neither → check Fibonacci, quadratic, or other patterns. Finance applications: simple interest I = Prt; compound A = P·(1 + (r)/(n))^(nt); continuous A = P·e^(rt). Annuities use geometric series. Recursion in CS: loops and recursive functions model sequences directly.',
        workedExample: 'Sequence: 2, 6, 18, 54… Ratio = 3 (geometric). a₁₀ = 2·3^(9) = 2·19683 = 39366.',
        misconception: 'Compound interest earns interest on previously accumulated interest, causing exponential growth. This is fundamentally different from simple interest, which grows linearly.' },
    ],
  },
  'math712:c005': {
    title: 'Functions, Relations & Graphs',
    conceptText: 'Function: each input has exactly one output. Vertical line test checks if a graph is a function. Domain: set of valid inputs; Range: set of outputs. Composition: (f∘g)(x) = f(g(x)). Inverse: f^(−1) reverses f; exists only if f is one-to-one (horizontal line test). Transformations: y = a·f(x−h)+k shifts h right, k up, stretches by |a|, reflects about the x-axis if a < 0.',
    workedExample: 'f(x) = 2x+1, g(x) = x². (f∘g)(3) = f(9) = 19. f^(−1)(x) = (x−1)/(2).',
    misconception: 'f^(−1)(x) denotes the inverse function, not the reciprocal. The reciprocal of f(x) is written [f(x)]^(−1) or 1/f(x).',
    variants: [
      { conceptText: 'Parent functions: linear y=x, quadratic y=x², cubic y=x³, absolute y=|x|, square root y=√x, reciprocal y=1/x. Transformations from parent: y = a·f(b(x−h))+k. |a| vertical stretch, 1/|b| horizontal stretch, h right shift, k up shift. If a<0 reflect about the x-axis; if b<0 reflect about the y-axis. Even functions: f(−x)=f(x) (symmetric about y-axis). Odd: f(−x)=−f(x) (rotational symmetry about origin).',
        workedExample: 'y = −2(x+3)² + 5: parent y=x², shift left 3, up 5, vertical stretch ×2, reflected about the x-axis. Vertex (−3,5), opens down.',
        misconception: 'The order of transformations matters. A horizontal shift then a stretch gives a different result than stretch then shift (inside vs. outside the function).' },
      { conceptText: 'Piecewise functions: different rules on different intervals of the domain. Graph by plotting each piece on its interval. Continuity: no breaks in the graph. Step functions (greatest integer) are piecewise. Composition is not commutative: f∘g ≠ g∘f in general. To find domain of f∘g: start with domain of g, then restrict to where g(x) is in the domain of f.',
        workedExample: 'f(x) = √x, g(x) = 4−x². Domain of f∘g: need 4−x² ≥ 0 → −2 ≤ x ≤ 2. (f∘g)(1) = √(4−1) = √3.',
        misconception: 'Function composition is not commutative: f(g(x)) and g(f(x)) are generally different. Always evaluate the inner function first.' },
    ],
  },
  'math712:c006': {
    title: 'Linear & Quadratic Functions',
    conceptText: 'Linear: y = mx + b; slope m = (y₂−y₁)/(x₂−x₁); parallel lines have equal slopes; perpendicular slopes multiply to −1. Systems: substitution, elimination, or matrices. Quadratic: standard ax²+bx+c, vertex a(x−h)²+k, factored a(x−r₁)(x−r₂). Discriminant Δ = b²−4ac: Δ>0 two real roots, Δ=0 one, Δ<0 two complex.',
    workedExample: 'Solve x²−5x+6 = 0: factors (x−2)(x−3) = 0, so x = 2 or x = 3. Vertex: h = (5)/(2), k = −(1)/(4).',
    misconception: 'In vertex form f(x) = a(x−h)²+k, the vertex is (h,k). For (x−2)²−3 the vertex is (2,−3), not (−2,3). The sign inside the parentheses is opposite to h.',
    variants: [
      { conceptText: 'Systems of equations: substitution (solve one variable, plug into other), elimination (add/subtract to cancel a variable), matrices (row reduction or Cramer\'s rule). Consistent = at least one solution; inconsistent = no solution; dependent = infinitely many. Linear inequalities: shade above (>) or below (<); system = intersection of shaded regions.',
        workedExample: '2x + y = 7, x − y = 2. Add: 3x = 9, x = 3, y = 1. Check: 2(3)+1 = 7 ✓, 3−1 = 2 ✓.',
        misconception: 'Parallel lines (same slope, different intercept) never intersect, so the system has no solution and is inconsistent.' },
      { conceptText: 'Completing the square: x² + bx → (x + (b)/(2))² − ((b)/(2))². Converts standard to vertex form. Quadratic formula: x = (−b ± √(b²−4ac))/(2a). Applications: projectile motion h(t) = −16t² + v₀t + h₀, maximum height at vertex. Axis of symmetry: x = −b/(2a). Factoring patterns: difference of squares a²−b² = (a+b)(a−b); perfect square trinomial.',
        workedExample: 'x² + 6x + 2 = 0. Complete the square: (x+3)² − 9 + 2 = 0 → (x+3)² = 7 → x = −3 ± √7.',
        misconception: 'The quadratic formula works for every quadratic equation, not only when factoring fails. Factoring is simply faster when it applies.' },
    ],
  },
  'math712:c007': {
    title: 'Polynomial, Rational, Radical & Piecewise Functions',
    conceptText: 'Polynomial degree n has at most n zeros and n−1 turning points. Rational: f(x) = p(x)/q(x); vertical asymptotes where q(x)=0 (simplified); horizontal asymptote from leading term comparison. Radical: domain restricted to keep radicand ≥ 0 (even index). Piecewise: different rules on different intervals. Factor theorem: (x−c) is a factor iff f(c) = 0.',
    workedExample: 'f(x) = (x+1)/((x−2)(x+3)). Vertical asymptotes: x = 2, x = −3. Horizontal: y = 0 (degree bottom > top).',
    misconception: 'Cancelling a common factor in a rational function creates a hole (removable discontinuity), not an asymptote — but the function is still undefined at that point.',
    variants: [
      { conceptText: 'End behavior of polynomials: even degree with positive leading coeff → both ends up; odd degree positive → left down, right up. Rational zeros theorem: possible rational roots = ±(factors of constant)/(factors of leading coefficient). Synthetic division: quick polynomial ÷ (x−c). Remainder theorem: f(c) = remainder when f(x) ÷ (x−c). Descartes\' Rule of Signs counts possible positive/negative real zeros.',
        workedExample: 'f(x) = 2x³ − 3x² − 8x + 12. Possible rational roots: ±1, ±2, ±3, ±4, ±6, ±12, ±(1)/(2), ±(3)/(2). Test x=2: f(2)=0. Factor: (x−2)(2x²+x−6) = (x−2)(2x−3)(x+2).',
        misconception: 'A degree-5 polynomial has at most 5 real zeros. Some roots may be complex (non-real) or repeated, so the graph may cross the x-axis fewer than 5 times.' },
      { conceptText: 'Radical equations: isolate the radical, raise both sides to the index power, check for extraneous solutions. Rational equations: multiply by LCD, solve, exclude values that make original denominator zero. Piecewise functions: evaluate by finding which interval x falls in, then use that piece\'s rule. Absolute value equations |f(x)| = k → f(x) = k or f(x) = −k.',
        workedExample: '√(x+3) = x−1. Square both sides: x+3 = x²−2x+1 → x²−3x−2 = 0 → x = (3±√17)/(2). Check: only x ≈ 3.56 works; x ≈ −0.56 is extraneous.',
        misconception: 'Squaring both sides of an equation can introduce extraneous solutions. Always check your answers in the original equation.' },
    ],
  },
  'math712:c008': {
    title: 'Exponential & Logarithmic Functions',
    conceptText: 'Exponential: f(x) = a·b^x; a = initial value, b = growth factor (b > 1 growth, 0 < b < 1 decay). Transforms: y = a·b^(x−h) + k — shift h right, k up, vertical scale |a|, horizontal asymptote y = k. Logarithm: log_b(x) = y ⟺ b^y = x (with b > 0, b ≠ 1). Laws: log(ab) = log a + log b; log(a/b) = log a − log b; log(a^n) = n·log a. Change of base: log_b(x) = (ln x)/(ln b). Log transforms: y = a·log_b(x−h) + k — vertical asymptote x = h, domain x > h. Discrete compounding: A = P·(1 + r/n)^(nt). Continuous: A = P·e^(rt). Half-life (N = N₀·e^(kt), k < 0): (ln 2)/|k|.',
    workedExample: 'Solve 3^x = 81: 81 = 3^4, so x = 4. Or: x = log₃(81) = (ln 81)/(ln 3) = 4.',
    misconception: 'The log of a sum has no simple rule: log(a+b) ≠ log a + log b. The product rule applies to multiplication: log(a·b) = log a + log b.',
    variants: [
      { conceptText: 'Exponential growth/decay: N(t) = N₀·e^(kt). k > 0 growth, k < 0 decay. Doubling time: (ln 2)/k when k > 0. Half-life: (ln 2)/|k| when k < 0. Logarithmic scales: Richter (earthquakes), decibels (sound), pH (acidity). The graph of y = log_b(x) is the reflection of y = b^x about the line y = x. Domain of log: x > 0; range: all reals.',
        workedExample: 'A population doubles every 5 years. k = (ln 2)/(5) ≈ 0.1386. After 15 years: N = N₀·e^(0.1386·15) = N₀·e^(2.079) ≈ 8N₀ (three doubling periods: 2^(3) = 8).',
        misconception: 'In exponential growth, the rate of change itself increases over time. What stays constant is the growth factor (the percentage increase per unit time), not the rate.' },
      { conceptText: 'Solving exponential equations: same base → set exponents equal; different bases → take ln of both sides. Solving log equations: convert to exponential form, solve, check domain. Natural log: ln x = log_e(x). Properties: ln(e^x) = x and e^(ln(x)) = x. Inverse relationship: exponential and log undo each other. Applications: carbon dating, bacterial growth, Newton\'s cooling law.',
        workedExample: 'Solve: log₂(x) + log₂(x−2) = 3. Combine: log₂(x(x−2)) = 3 → 2^3 = x(x−2) → x²−2x = 8 → x²−2x−8 = 0 → (x−4)(x+2) = 0. x = 4 (x = −2 excluded: log of negative).',
        misconception: 'ln(0) is undefined (it approaches −∞). The value that equals zero is ln(1) = 0, because e^(0) = 1.' },
    ],
  },
  'math712:c009': {
    title: 'Trigonometric & Circular Functions',
    conceptText: 'Unit circle: (cos θ, sin θ). SOH-CAH-TOA: sin = opp/hyp, cos = adj/hyp, tan = opp/adj. Key identities — Pythagorean: sin²θ + cos²θ = 1; tan²θ + 1 = sec²θ; 1 + cot²θ = csc²θ. Reciprocal: csc θ = 1/sin θ; sec θ = 1/cos θ; cot θ = 1/tan θ. Quotient: tan θ = sin θ/cos θ; cot θ = cos θ/sin θ. Double angle: sin(2θ) = 2 sin θ cos θ; cos(2θ) = cos²θ − sin²θ. Sum/difference: sin(A±B) = sin A cos B ± cos A sin B; cos(A±B) = cos A cos B ∓ sin A sin B. Law of Sines: a/sin A = b/sin B = c/sin C. Law of Cosines: c² = a² + b² − 2ab cos C.',
    workedExample: 'Verify: tan²θ + 1 = sec²θ. Start with sin²θ + cos²θ = 1. Divide by cos²θ: (sin²θ)/(cos²θ) + 1 = (1)/(cos²θ) → tan²θ + 1 = sec²θ ✓.',
    misconception: 'Trig functions are not linear: sin(A+B) = sin A cos B + cos A sin B, not sin A + sin B.',
    variants: [
      { conceptText: 'Special angles to memorize: sin(0)=0, sin(30°)=(1)/(2), sin(45°)=(√2)/(2), sin(60°)=(√3)/(2), sin(90°)=1. Cosine is the reverse order. Reference angles: for any angle in standard position, find the acute angle to the x-axis, then apply the sign from the quadrant (All Students Take Calculus). Radian conversion: degrees × (π)/(180) = radians.',
        workedExample: 'Find sin(240°). Reference angle: 240°−180° = 60°. Quadrant III → sin is negative. sin(240°) = −sin(60°) = −(√3)/(2).',
        misconception: 'The double-angle formula is sin(2θ) = 2·sin(θ)·cos(θ), not simply 2·sin(θ). The cos(θ) factor is essential.' },
      { conceptText: 'Trig identities: sin²θ+cos²θ = 1; tan²θ+1 = sec²θ; 1+cot²θ = csc²θ. Double angle: sin(2θ) = 2sinθcosθ; cos(2θ) = cos²θ−sin²θ = 2cos²θ−1 = 1−2sin²θ. Sum/difference: sin(A±B) = sinAcosB ± cosAsinB. Verifying identities: work one side to match the other using known identities. These are essential for simplifying expressions and solving trig equations.',
        workedExample: 'Verify: (sin²θ)/(1−cosθ) = 1+cosθ. Numerator = 1−cos²θ = (1−cosθ)(1+cosθ). Cancel (1−cosθ): result = 1+cosθ ✓.',
        misconception: 'sin(A) = sin(B) does not mean A = B. The full solution is A = B + 2kπ or A = π − B + 2kπ. Always account for multiple solution families.' },
    ],
  },
  'math712:c010': {
    title: 'Calculus Concepts',
    conceptText: 'Limit: lim(x→a) f(x) = L. Derivative: f′(x) = lim(h→0) [f(x+h)−f(x)]/(h); measures instantaneous rate of change. Power rule: d/dx[x^n] = nx^(n−1). Chain rule: d/dx[f(g(x))] = f′(g(x))·g′(x). Fundamental Theorem (Part 2): if F′ = f, then ∫_(a)^(b) f(x) dx = F(b) − F(a). Applications: optimization (set f′=0), area under curve, related rates.',
    workedExample: 'f(x) = x³ − 3x. f′(x) = 3x² − 3 = 0 → x = ±1. f″(x) = 6x: min at x=1, max at x=−1.',
    misconception: 'The derivative of a product requires the product rule: (fg)′ = f′g + fg′. You cannot simply multiply the individual derivatives.',
    variants: [
      { conceptText: 'Integration: the reverse of differentiation. Indefinite: ∫x^n dx = x^(n+1)/(n+1) + C (n≠−1). Definite integral = signed area under the curve. Fundamental Theorem — Part 1: if A(x) = ∫_(a)^(x) f(t) dt, then A′(x) = f(x); equivalently (d)/(dx)[∫_(a)^(x) f(t) dt] = f(x). Part 2: if F′ = f, then ∫_(a)^(b) f(x) dx = F(b) − F(a). Substitution (u-sub): reverse chain rule. Area between curves: ∫(top − bottom) dx.',
        workedExample: '∫_(0)^(2) (3x²−2x) dx = [x³−x²]_(0)^(2) = (8−4)−(0−0) = 4.',
        misconception: 'The integral of 1/x is ln|x| + C (with absolute value). The absolute value is essential because ln is only defined for positive arguments, and 1/x exists for x < 0 too.' },
      { conceptText: 'Continuity: f is continuous at a if lim(x→a) f(x) = f(a). Differentiability implies continuity (but not vice versa). Mean Value Theorem: if f is continuous on [a,b] and differentiable on (a,b), then ∃c in (a,b) with f′(c) = (f(b)−f(a))/(b−a). Related rates: differentiate an equation with respect to time, substitute known rates. L\'Hôpital\'s Rule: 0/0 or ∞/∞ → differentiate top and bottom.',
        workedExample: 'Balloon: V = (4)/(3)πr³. dV/dt = 4πr²·dr/dt. If dr/dt = 2 cm/s when r = 5: dV/dt = 4π(25)(2) = 200π cm³/s.',
        misconception: 'Continuity does not guarantee differentiability. For example, |x| is continuous at x=0 but has a cusp (no derivative). Differentiability is a stronger condition than continuity.' },
    ],
  },

  // Domain III — Geometry and Measurement
  'math712:c011': {
    title: 'Measurement — Area & Volume Formulas',
    conceptText: 'Area formulas — Rectangle: A = lw. Triangle: A = (1)/(2)bh. Circle: A = πr². Parallelogram: A = bh. Trapezoid: A = (1)/(2)(b₁+b₂)h. Volume formulas — Rectangular prism: V = lwh. Cylinder: V = πr²h. Cone: V = (1)/(3)πr²h. Sphere: V = (4)/(3)πr³. Surface area: add all face areas. Scaling: lengths × k → areas × k², volumes × k³.',
    workedExample: 'Cylinder r=3, h=10: V = π(9)(10) = 90π ≈ 282.7. Surface area = 2πr² + 2πrh = 18π + 60π = 78π ≈ 245.0.',
    misconception: 'Volume scales by the cube of the scale factor (k³). Doubling all dimensions gives 2³ = 8 times the volume, not 2×.',
    variants: [
      { conceptText: 'Composite figures — Break a complex shape into simpler pieces (rectangles, triangles, circles). Find each area or volume, then add them. For holes or cut-outs, subtract the removed part. Heron\'s formula finds triangle area from three sides: s = (a+b+c)/(2), then A = √(s(s−a)(s−b)(s−c)). Unit conversions: multiply by conversion fractions. For area units, square the linear factor (1 m² = 10,000 cm²). For volume units, cube it (1 m³ = 1,000,000 cm³).',
        workedExample: 'Triangle sides 5, 6, 7. s = (5+6+7)/(2) = 9. A = √(9·4·3·2) = √216 = 6√6 ≈ 14.7 square units.',
        misconception: 'Area unit conversions require squaring the linear factor. Since 1 m = 100 cm, 1 m² = 100² = 10,000 cm² (not just ×100).' },
      { conceptText: 'Surface area & volume of round solids — Sphere: SA = 4πr², V = (4)/(3)πr³. Cone: lateral SA = πrl (l = slant height = √(r²+h²)), total SA = πrl + πr². Cylinder: SA = 2πr² + 2πrh, V = πr²h. Cavalieri\'s Principle: two solids with equal cross-sectional areas at every height have the same volume. Cross-sections: slicing a cylinder parallel to the base gives a circle; slicing a cone gives a circle, ellipse, parabola, or hyperbola depending on angle.',
        workedExample: 'Sphere r=6: V = (4)/(3)π(216) = 288π ≈ 904.8. SA = 4π(36) = 144π ≈ 452.4.',
        misconception: 'Surface area and volume scale differently: SA scales by k² and volume by k³. Doubling all dimensions gives SA × 4 but volume × 8.' },
      { conceptText: 'Circle measurement — Circumference: C = 2πr = πd. Area: A = πr². Arc length (part of circumference): s = rθ, where θ is in radians. Sector area (pizza slice): A = (1)/(2)r²θ. Converting degrees to radians: multiply by π/(180). A full circle has 2π radians = 360°. Segment area (region between a chord and its arc) = sector area − triangle area.',
        workedExample: 'Circle r=10, central angle 60° = π/(3) rad. Arc length = 10·π/(3) ≈ 10.47. Sector area = (1)/(2)(100)(π)/(3) ≈ 52.4.',
        misconception: 'The formula arc length = rθ requires θ in radians. Convert degrees first: for example, 60° × π/(180) = π/(3) rad.' },
    ],
  },
  'math712:c012': {
    title: 'Euclidean Geometry — Axiomatic Systems',
    conceptText: 'Axioms (postulates) are accepted without proof; theorems are proved from axioms. Parallel postulate distinguishes Euclidean from non-Euclidean geometry. Congruence (SSS, SAS, ASA, AAS, HL) and similarity (AA, SAS~, SSS~). Constructions: compass and straightedge. Vertical angles are congruent; supplementary angles sum to 180°; complementary sum to 90°.',
    workedExample: 'Prove: vertical angles are congruent. ∠1 + ∠2 = 180° and ∠2 + ∠3 = 180° → ∠1 = ∠3.',
    misconception: 'SSA (side-side-angle) is not a valid congruence theorem. It is ambiguous — two different triangles can share the same SSA configuration.',
    variants: [
      { conceptText: 'Non-Euclidean geometry: change the parallel postulate. Hyperbolic: through a point not on a line, infinitely many parallels; triangle angles sum < 180°. Elliptic (spherical): no parallel lines exist; triangle angles sum > 180°. Constructions: bisect angle, perpendicular bisector, copy segment — all compass and straightedge. Proofs: two-column (statement/reason), paragraph, flow chart.',
        workedExample: 'On a sphere, a triangle with three 90° angles exists (one-eighth of the sphere). Angle sum = 270° > 180°. This is impossible in Euclidean geometry.',
        misconception: 'Non-Euclidean geometries (hyperbolic, spherical) are equally valid mathematical systems. They describe curved spaces such as Earth\'s surface and spacetime.' },
      { conceptText: 'Similarity: same shape, possibly different size. AA criterion: two pairs of congruent angles → similar triangles. SAS~ and SSS~ also work. Similar triangles → sides proportional: (a)/(a\') = (b)/(b\') = (c)/(c\') = k. Corresponding altitudes, medians, and angle bisectors are also proportional by k. Areas scale by k²; volumes by k³. CPCTC: corresponding parts of congruent triangles are congruent (used after proving congruence).',
        workedExample: 'Triangles with sides 3,4,5 and 6,8,10. Ratios: 6/3 = 8/4 = 10/5 = 2 → similar by SSS~ with k = 2. Area ratio = 4.',
        misconception: 'Congruent triangles have the same shape and size regardless of orientation. One may be reflected or rotated relative to the other and still be congruent.' },
    ],
  },
  'math712:c013': {
    title: 'Euclidean Geometry — Results & Applications',
    conceptText: 'Triangle angle sum = 180°. Exterior angle = sum of remote interior angles. Quadrilateral angle sum = 360°. Polygon interior sum = (n−2)·180°. Circle: central angle = intercepted arc; inscribed angle = (1)/(2) arc. Arc length = rθ (radians). Sector area = (1)/(2)r²θ. Similar triangles: corresponding sides proportional, angles equal.',
    workedExample: 'Inscribed angle intercepts a 100° arc → inscribed angle = 50°. Regular octagon: interior angle = (6·180°)/(8) = 135°.',
    misconception: 'An inscribed angle is half the intercepted arc, not equal to it. A central angle equals the intercepted arc.',
    variants: [
      { conceptText: 'Circle theorems: tangent ⊥ radius at point of tangency. Two tangents from external point are equal length. The measure of an inscribed ∠ in a semicircle = 90°. Chord–chord angle = (1)/(2)(sum of intercepted arcs). Secant–secant angle from outside = (1)/(2)(difference of intercepted arcs). Power of a point: for two chords, (segment₁)(segment₂) = (segment₃)(segment₄).',
        illustrationHtml: euclideanCircleTheoremsFiguresHtml,
        misconceptionIllustrationHtml: chordVsDiameterFigureHtml,
        workedExample: 'Two chords intersect inside a circle. Segments: 3 and 8 on one chord, x and 4 on the other. 3·8 = x·4 → x = 6.',
        misconception: 'Only a diameter passes through the center of a circle. A chord is any segment whose endpoints lie on the circle — it does not need to pass through the center.' },
      { conceptText: 'Properties of quadrilaterals: parallelogram (opposite sides ‖ and ≅, opposite angles ≅, diagonals bisect each other); rectangle (parallelogram + right angles, diagonals ≅); rhombus (parallelogram + all sides ≅, diagonals ⊥); square (rectangle + rhombus). Trapezoid: exactly one pair of parallel sides. Midsegment = (1)/(2)(base₁ + base₂). Kite: two pairs of consecutive sides ≅.',
        illustrationHtml: quadrilateralFiguresHtml,
        workedExample: 'Prove ABCD is a parallelogram: show AB ‖ CD and AB = CD (one pair of sides both parallel and equal suffices).',
        misconception: 'A rhombus has all sides equal, but its angles need not be 90°. A square is a special case of a rhombus where all angles are right angles.' },
    ],
  },
  'math712:c014': {
    title: 'Coordinate, Transformational & Vector Geometry',
    conceptText: 'Distance: d = √((x₂−x₁)²+(y₂−y₁)²). Midpoint: ((x₁+x₂)/(2),(y₁+y₂)/(2)). Conic sections: circle (x−h)²+(y−k)²=r²; ellipse, parabola, hyperbola. Transformations: translation (slide), reflection (flip), rotation (turn), dilation (scale). Compositions of transformations. Vectors: magnitude, direction, addition, scalar multiplication, dot product.',
    workedExample: 'Reflect (3,4) about the y-axis → (−3,4). Rotate 90° CCW about origin: (x,y) → (−y,x), so (3,4) → (−4,3).',
    misconception: 'Dilation preserves angles and shape (producing similar figures) but scales all distances by the factor k. Only isometries preserve distances.',
    variants: [
      { conceptText: 'Conic sections from general form Ax²+Bxy+Cy²+Dx+Ey+F=0. Circle: A=C, B=0. Ellipse: AC>0, A≠C. Parabola: AC=0 (one squared term). Hyperbola: AC<0. Standard forms: ellipse ((x−h)²)/(a²) + ((y−k)²)/(b²) = 1; hyperbola ((x−h)²)/(a²) − ((y−k)²)/(b²) = 1. Foci, vertices, asymptotes characterize each conic.',
        workedExample: '4x²+9y²=36 → (x²)/(9)+(y²)/(4)=1. Ellipse: a=3 (horizontal), b=2 (vertical). c=√(9−4)=√5. Foci at (±√5, 0).',
        misconception: 'The foci of an ellipse lie inside the ellipse, along the major axis. The vertices (not the foci) are at the endpoints of the major axis.' },
      { conceptText: 'Vectors: v = ⟨a,b⟩. Magnitude: |v| = √(a²+b²). Unit vector: v/|v|. Addition: ⟨a,b⟩+⟨c,d⟩ = ⟨a+c,b+d⟩. Scalar multiplication: k⟨a,b⟩ = ⟨ka,kb⟩. Dot product: u·v = a₁a₂+b₁b₂ = |u||v|cos θ. Perpendicular ⟺ u·v = 0. Transformation matrices: rotation by θ → [[cos θ, −sin θ],[sin θ, cos θ]]. Isometries preserve distance; similarities preserve shape.',
        workedExample: 'u = ⟨3,4⟩, v = ⟨−4,3⟩. u·v = (3)(−4)+(4)(3) = 0 → perpendicular. |u| = |v| = 5.',
        misconception: 'Vectors add component-by-component, not by multiplying magnitudes. The magnitude of the sum depends on the angle between the vectors (parallelogram law).' },
    ],
  },

  // Domain IV — Probability and Statistics
  'math712:c015': {
    title: 'Data Analysis',
    conceptText: 'Central tendency: mean (balance point), median (middle value), mode (most frequent). Spread: range, IQR = Q₃−Q₁, variance = Σ(xᵢ−x̄)²/(n−1), standard deviation = √variance. Displays: histogram (frequency), box plot (five-number summary), scatter plot (bivariate). Skewness: right-skewed → mean > median; left-skewed → mean < median. Outliers: beyond Q₁−1.5·IQR or Q₃+1.5·IQR.',
    workedExample: 'Data: 2,3,5,7,11. Mean = 28/5 = 5.6. Median = 5. No outliers (IQR = 7−3 = 4; fences at −3 and 13).',
    misconception: 'The median is more resistant to outliers than the mean and is often better for skewed data. Choose the measure of center that fits the distribution.',
    illustrationHtml: histogramFigureHtml,
    variants: [
      { title: 'Data Analysis — Box Plots & Five-Number Summary',
        conceptText: 'Box plots display the five-number summary: min, Q₁, median, Q₃, max. The box spans from Q₁ to Q₃ (the interquartile range, IQR). The line inside the box marks the median. Whiskers extend to the smallest and largest non-outlier values. Outliers (values beyond Q₁ − 1.5·IQR or Q₃ + 1.5·IQR) are shown as individual dots. Side-by-side box plots let you compare the center, spread, and skewness of two or more distributions at a glance.',
        workedExample: 'Data: 5, 8, 12, 15, 18, 22, 25, 30, 35, 80. Five-number summary: min=5, Q₁=12, median=20, Q₃=30, max=80. IQR=18. Upper fence = 30 + 27 = 57. The value 80 is an outlier.',
        misconception: 'The whiskers do NOT always go to min and max. In a modified box plot, whiskers stop at the fences (Q₁ − 1.5·IQR and Q₃ + 1.5·IQR) and values beyond are plotted as individual outlier dots.',
        illustrationHtml: boxPlotFigureHtml },
      { title: 'Data Analysis — Z-Scores',
        conceptText: 'A z-score tells you how many standard deviations a value is from the mean: z = (x − μ) / σ. A positive z means above the mean; negative means below. Z-scores let you compare values from different distributions on the same scale. For a normal distribution, you can use z-tables to find the percentage of data below any z-score. Most data (99.7%) falls between z = −3 and z = +3.',
        workedExample: 'Test score 82, class mean 75, SD 5. z = (82 − 75) / 5 = 1.4. From the z-table, about 92% of scores are below 82.',
        misconception: 'A z-score of 2 means your score is 2 standard deviations above the mean — not twice the mean. Z-scores measure distance in SD units, not multiples of the value itself.',
        illustrationHtml: zScoreFigureHtml },
      { title: 'Data Analysis — Empirical Rule (68-95-99.7)',
        conceptText: 'For data that follows a normal (bell-shaped) distribution, the Empirical Rule states: approximately 68% of data falls within 1 standard deviation of the mean (μ ± 1σ), 95% within 2 standard deviations (μ ± 2σ), and 99.7% within 3 standard deviations (μ ± 3σ). This rule helps you quickly estimate probabilities and identify unusual values without a z-table.',
        workedExample: 'Heights: μ = 170 cm, σ = 6 cm. By the Empirical Rule: 68% are between 164–176 cm, 95% between 158–182 cm, 99.7% between 152–188 cm. A height of 190 cm is beyond 3σ — very unusual.',
        misconception: 'The Empirical Rule applies ONLY to approximately normal (bell-shaped) distributions. For skewed or bimodal data, these percentages will not hold. Always check the shape first.',
        illustrationHtml: bellCurveFigureHtml },
      { title: 'Data Analysis — Stem-and-Leaf Plots',
        conceptText: 'A stem-and-leaf plot organizes data by splitting each value into a "stem" (leading digits) and a "leaf" (last digit). Unlike a histogram, it preserves every individual data value. Back-to-back stem plots place two data sets on opposite sides of the stem column to compare distributions. Reading the leaves in order gives you the sorted data — making it easy to find the median, mode, and range directly.',
        workedExample: 'Data: 23, 25, 31, 34, 38, 42, 45, 48. Stem 2: 3 5 | Stem 3: 1 4 8 | Stem 4: 2 5 8. Median: average of 34 and 38 = 36.',
        misconception: 'The stem is not always the tens digit. For large values (like 150, 162, 178), the stem can be the hundreds-and-tens (15, 16, 17) with the ones digit as the leaf.',
        illustrationHtml: stemPlotFigureHtml },
      { title: 'Data Analysis — Scatter Plots & Correlation',
        conceptText: 'Scatter plots show bivariate data. Correlation r ranges from −1 (perfect negative linear) to +1 (perfect positive linear). r = 0 means no linear relationship. r² is the coefficient of determination: it tells you what proportion of variation in y is explained by the linear model. Residuals = observed − predicted; a good model has randomly scattered residuals with no pattern.',
        workedExample: 'Regression: ŷ = 2.3x + 10.5, r = 0.94, r² = 0.88. Interpretation: 88% of variation in y is explained by x. The remaining 12% is due to other factors.',
        misconception: 'r measures ONLY linear correlation. A strong curved relationship can have r ≈ 0. Also, correlation does not imply causation — lurking variables can create apparent associations.',
        illustrationHtml: scatterCorrelationFigureHtml },
      { title: 'Data Analysis — Outliers & Their Effects',
        conceptText: 'An outlier is a data value that is unusually far from the rest of the data. The IQR method identifies outliers as values below Q₁ − 1.5·IQR or above Q₃ + 1.5·IQR. Outliers strongly affect the mean and standard deviation but have little effect on the median and IQR. When outliers are present, the median and IQR are more reliable measures of center and spread. Always investigate outliers: they may be errors, or they may reveal important information.',
        workedExample: 'Data: 10, 12, 13, 14, 15, 16, 50. Without 50: mean = 13.3. With 50: mean = 18.6. The median barely changes (14 vs 14). The outlier shifted the mean by 5.3 but the median by 0.',
        misconception: 'Not every outlier should be removed. An outlier might be a genuine extreme value (e.g., a very high test score). Removing it without justification distorts the data.',
        illustrationHtml: outlierFigureHtml },
      { title: 'Data Analysis — Histograms & Distribution Shape',
        conceptText: 'A histogram groups continuous data into bins and shows frequency with bar heights. The shape reveals the distribution: symmetric (mean ≈ median), right-skewed (tail stretches right, mean > median), left-skewed (tail stretches left, mean < median), bimodal (two peaks), or uniform (flat). The choice of bin width matters — too few bins hide patterns, too many create noise. Unlike bar charts, histogram bars touch because the data is continuous.',
        workedExample: 'Exam scores in bins of 10: 50-59: 3, 60-69: 8, 70-79: 12, 80-89: 9, 90-99: 5, 100+: 2. The peak at 70-79 shows the mode class. Shape is roughly symmetric (slightly left-skewed since the tail extends lower).',
        misconception: 'Histograms are NOT the same as bar charts. Bar charts display categorical data with gaps between bars. Histograms display continuous data with no gaps. The x-axis represents intervals, not categories.',
        illustrationHtml: histogramFigureHtml },
      { title: 'Data Analysis — Comparing Mean, Median & Mode',
        conceptText: 'Mean = sum/count (sensitive to outliers). Median = middle value when sorted (resistant to outliers). Mode = most frequent value (useful for categorical data). For a symmetric distribution, mean ≈ median ≈ mode. For right-skewed: mean > median. For left-skewed: mean < median. Choose the measure that best represents the data: use median for skewed data or data with outliers; use mean when data is roughly symmetric.',
        workedExample: 'Salaries: $30K, $35K, $40K, $42K, $45K, $500K. Mean = $115K (pulled up by the $500K outlier). Median = $41K (better represents the typical salary). Mode = none (all unique). Report the median here.',
        misconception: 'The mean is not always the "best" average. For skewed distributions (like income data), the median is more representative because it is not distorted by extreme values.' },
    ],
  },
  'math712:c016': {
    title: 'Probability',
    conceptText: 'P(A) = favorable outcomes ÷ total outcomes, 0 ≤ P ≤ 1. Complement: P(A′) = 1 − P(A). Addition: P(A∪B) = P(A) + P(B) − P(A∩B). Independent: P(A∩B) = P(A)·P(B). Conditional: P(A|B) = P(A∩B) ÷ P(B). Permutations: P(n,r) = n! ÷ (n−r)!. Combinations: C(n,r) = n! ÷ (r!(n−r)!). Expected value: E(X) = ΣxᵢP(xᵢ).',
    workedExample: 'Draw 2 cards without replacement: P(both aces) = (4/52)·(3/51) = 12/2652 = 1/221.',
    misconception: 'P(A or B) = P(A) + P(B) − P(A∩B). You must subtract the overlap to avoid double-counting (unless A and B are mutually exclusive, where P(A∩B) = 0).',
    variants: [
      { conceptText: 'Bayes\' Theorem: P(A|B) = P(B|A)·P(A)/P(B). Useful for "reverse" conditional probability. Tree diagrams organize multi-stage experiments. Binomial distribution: P(X=k) = C(n,k)·p^k·(1−p)^(n−k) for n independent trials with success probability p. Expected value of binomial: np. Geometric distribution: P(X=k) = (1−p)^(k−1)·p for trials until first success.',
        workedExample: 'Fair coin, 10 flips. P(exactly 7 heads) = C(10,7)·(0.5)^7·(0.5)^3 = 120/1024 ≈ 0.117.',
        misconception: 'Each coin flip is independent — past results do not affect future probability. Believing heads is "due" after several tails is the gambler\'s fallacy.' },
      { conceptText: 'Normal distribution: bell curve, symmetric about μ. Standard normal: μ=0, σ=1. Z-score converts any normal to standard: z = (x−μ)/σ. Using z-tables or calculator: P(a < X < b) = area under curve between a and b. For large samples, many distributions approximate normal (Central Limit Theorem). Expected value: E(X) = ΣxP(x) for discrete; E(aX+b) = aE(X)+b.',
        workedExample: 'Heights: μ=170cm, σ=8cm. P(height > 186) = P(Z > 2) ≈ 0.0228, or about 2.3%.',
        misconception: 'Many real datasets are skewed, bimodal, or uniform — not everything is normal. Always check the distribution shape before applying normal-curve rules.' },
    ],
  },
  'math712:c017': {
    title: 'Statistical Inference',
    conceptText: 'Sampling distribution: distribution of a statistic over many samples. Central Limit Theorem: sample means → normal as n increases, regardless of population shape. Confidence interval: point estimate ± margin of error. Hypothesis testing: H₀ (null) vs. Hₐ; p-value < α → reject H₀. Regression: ŷ = a+bx; r measures linear correlation strength (−1 to 1). Residual = observed − predicted.',
    workedExample: '95% CI for mean: x̄ ± 1.96·(σ/√n). If x̄=50, σ=10, n=25: 50 ± 1.96·2 = (46.08, 53.92).',
    misconception: 'The true mean is a fixed value. A 95% confidence interval means that 95% of intervals constructed this way (across repeated samples) would contain the true mean.',
    variants: [
      { conceptText: 'Type I error: rejecting H₀ when it\'s true (false positive); probability = α. Type II error: failing to reject H₀ when it\'s false (false negative); probability = β. Power = 1−β. Increase power by: increasing n, increasing α, larger effect size. P-value: probability of getting a result at least as extreme as observed, assuming H₀ is true. Small p-value → strong evidence against H₀.',
        workedExample: 'Test H₀: μ = 100 vs. Hₐ: μ > 100. Sample: x̄ = 104, σ = 15, n = 36. z = (104−100)/(15/6) = 1.6. P-value ≈ 0.055. At α = 0.05, fail to reject H₀ (barely).',
        misconception: 'A p-value is the probability of observing data as extreme as (or more extreme than) the sample, assuming H₀ is true. It does not tell you the probability that H₀ is true.' },
      { conceptText: 'Experiment design: randomization (random assignment to groups), replication (enough subjects for reliable results), control (comparison group), blinding (reduce bias). Observational studies can show association but not causation. Confounding variable: related to both explanatory and response variable. Stratified sampling: divide population into strata, sample from each. Systematic, cluster, and convenience sampling each have trade-offs.',
        workedExample: 'Drug trial: randomly assign 200 patients to treatment or placebo (100 each). Double-blind: neither patients nor doctors know which group. Compare outcomes → can infer causation.',
        misconception: 'A large sample does not eliminate bias. A biased sampling method (e.g., voluntary response) produces biased results regardless of size. Randomization is what reduces bias.' },
    ],
  },

  // Domain V — Mathematical Processes and Perspectives
  'math712:c018': {
    title: 'Mathematical Reasoning & Problem Solving',
    conceptText: 'Inductive reasoning: observe patterns → form conjecture. Deductive reasoning: apply known rules → prove conclusion. Direct proof: assume premises, derive conclusion. Indirect proof (contradiction): assume negation, derive contradiction. Counterexample: one case that disproves a universal claim. Polya\'s steps: understand, plan, carry out, look back.',
    workedExample: 'Disprove "n²+n+41 is always prime": try n=40 → 40²+40+41 = 1681 = 41². Not prime.',
    misconception: 'Checking many examples suggests a pattern but does not prove it. A formal proof or a single counterexample is needed for mathematical certainty.',
    variants: [
      { conceptText: 'Proof techniques: direct (assume P, derive Q), contrapositive (assume ¬Q, derive ¬P), contradiction (assume ¬statement, derive impossibility), mathematical induction (base case + inductive step). Logical connectives: AND (∧), OR (∨), NOT (¬), IF-THEN (→), IFF (↔). Converse: Q→P; inverse: ¬P→¬Q; contrapositive: ¬Q→¬P (logically equivalent to original).',
        workedExample: 'Prove: if n² is even, then n is even. Contrapositive: if n is odd → n² is odd. n = 2k+1 → n² = 4k²+4k+1 = 2(2k²+2k)+1 (odd). ✓',
        misconception: 'The converse of a true statement is not necessarily true. "If it rains, the ground is wet" is true, but "if the ground is wet, it rained" is false (could be sprinklers).' },
      { conceptText: 'Problem-solving strategies (Polya): draw a diagram, look for patterns, work backwards, make a simpler problem, guess and check, use variables, make a table, consider special cases. Reasonableness: estimate before computing, check units, verify with substitution. Mathematical modeling: identify variables → set up equation → solve → interpret → validate. Real-world constraints may limit mathematical solutions.',
        workedExample: 'A farmer has 100m of fencing for a rectangular pen along a barn (3 sides fenced). Maximize area: A = x(100−2x). A\'(x) = 100−4x = 0 → x = 25, A = 1250 m². Check: reasonable for 100m of fence.',
        misconception: 'Many problems can be solved in multiple ways. Flexibility in approach — trying different strategies — is a hallmark of strong mathematical thinking.' },
    ],
  },
  'math712:c019': {
    title: 'Mathematical Connections & Communication',
    conceptText: 'Multiple representations: verbal → numerical → algebraic → graphical. Connections across strands: algebra explains geometry (coordinate proofs), statistics uses algebra (regression equations). Real-world modeling: translate context into math, solve, interpret back. Precise mathematical vocabulary avoids ambiguity. History: contributions from many cultures (zero from India, algebra from al-Khwarizmi, Euclid\'s Elements).',
    workedExample: '"Distance from 5 is at most 3" → |x−5| ≤ 3 → 2 ≤ x ≤ 8. Verbal → algebraic → graphical (number line segment).',
    misconception: 'Mathematics has roots in many cultures: Mesopotamia, Egypt, India, China, the Islamic world, and beyond. Modern math is built on contributions from around the globe.',
    variants: [
      { conceptText: 'Technology in math: graphing calculators visualize functions, dynamic geometry (Desmos, GeoGebra) explores conjectures, spreadsheets model data. Mathematical communication: use precise definitions, correct notation, logical argument structure. Writing a proof communicates reasoning unambiguously. Tables, graphs, and equations are complementary views of the same relationship — fluency in translation between them is essential.',
        workedExample: 'Table: (0,2),(1,5),(2,8),(3,11). Pattern: add 3. Equation: y = 3x + 2. Graph: line with slope 3, y-intercept 2. All represent the same linear function.',
        misconception: 'A graph is a visual approximation, not an exact function definition. Two different formulas (e.g., sin x and a polynomial) can produce identical-looking graphs on a small interval.' },
      { conceptText: 'Cross-strand connections: Pythagorean theorem links algebra (a²+b²=c²) and geometry (right triangles). Trigonometry connects circular geometry with algebraic functions. Probability uses combinatorics from number theory. Calculus extends algebraic patterns to continuous change. Historical milestones: Euler\'s identity e^(iπ)+1=0 unifies five fundamental constants. Mathematics as a universal language transcends cultural boundaries.',
        workedExample: 'Prove the quadrilateral with vertices (0,0),(4,0),(5,3),(1,3) is a parallelogram. Slopes: bottom 0, top 0 (parallel); left 3/1=3, right 3/1=3 (parallel). Both pairs parallel → parallelogram. Algebra verifies geometry.',
        misconception: 'Algebra, geometry, statistics, and calculus constantly reinforce each other. The strongest problem-solvers draw connections across mathematical domains.' },
    ],
  },

  'math712:c022': {
    title: 'Mathematical Perspectives (Standard VI)',
    conceptText: 'Standard VI highlights how mathematics sits in history and society: ideas develop over centuries; notation and proof styles change; applications (navigation, physics, computing) steer what questions matter. Axiomatic systems (Euclid\'s postulates, field axioms for ℝ) make explicit what is assumed versus what is proved. Non-Euclidean geometry and set-theoretic foundations show mathematics can reorganize its “bedrock” while staying rigorous.',
    workedExample: 'Students ask whether math is invented or discovered. A balanced classroom answer: humans invent language and axioms; once chosen, many consequences are forced by logic — so results feel discovered. Example: whether you treat geometry as Euclidean or hyperbolic changes theorems, but proof discipline stays.',
    misconception: 'Mathematics is not only ancient Greek nor only modern Western Europe — significant contributions come from Mesopotamia, Egypt, India, China, the Islamic world, Africa, and the Americas. Credit the people and contexts honestly.',
    variants: [
      { conceptText: 'Ethnomathematics studies patterns, games, textiles, and architecture as mathematical activity in cultural settings — not “less rigorous,” just differently formalized. Gödel\'s incompleteness and the four-color computer proof illustrate that “truth” and “proof” remain philosophically rich even after high school algebra.',
        workedExample: 'Compare Egyptian unit fractions to modern fraction notation — same rational numbers, different representation system. Discuss efficiency and pedagogy: which helps which learner first?',
        misconception: 'A single culture or era does not own mathematics; classrooms should reflect global contributors (e.g., al-Khwarizmi, Brahmagupta, Hypatia, Emmy Noether, Srinivasa Ramanujan).' },
    ],
  },

  // Domain VI — Mathematical Learning, Instruction & Assessment
  'math712:c020': {
    title: 'Mathematical Learning & Instruction',
    conceptText: 'Concrete → representational → abstract (CRA) progression. Manipulatives build conceptual understanding before symbolic work. Differentiation: tiered tasks, flexible grouping, multiple entry points. Questioning: higher-order questions promote reasoning ("Why does that work?" vs. "What is the answer?"). Technology: graphing calculators, dynamic geometry software, coding. TEKS alignment ensures all students access grade-level content.',
    workedExample: 'Teaching area of a circle: students arrange pizza-slice sectors into approximate parallelogram → discover A ≈ (1)/(2)·C·r = πr².',
    misconception: 'Research shows that developing conceptual understanding alongside procedures leads to deeper, more transferable learning than mastering procedures alone.',
    variants: [
      { conceptText: 'Bloom\'s Taxonomy: remember, understand, apply, analyze, evaluate, create. Effective math instruction targets higher levels. Productive struggle: students learn more from working through challenges than from being shown solutions immediately. Wait time: pausing 3–5 seconds after a question increases quality and quantity of responses. Collaborative learning (think-pair-share, group problem-solving) develops communication and reasoning.',
        workedExample: 'Instead of "What is 3×4?" (recall), ask "Why does 3×4 give the same answer as 4×3? Can you show it with tiles?" (analyze/evaluate). Both address the same fact but at different Bloom\'s levels.',
        misconception: 'Productive struggle is a normal and necessary part of learning. The teacher\'s role is to scaffold appropriately, not to remove all difficulty.' },
      { conceptText: 'English Language Learners (ELLs) in math: use visuals, manipulatives, sentence stems, math vocabulary walls. Differentiated instruction: vary content, process, or product based on readiness, interest, or learning profile. Formative assessment drives instructional decisions in real time. Growth mindset: mathematical ability develops with effort — praise process, not innate talent. Culturally responsive teaching makes math accessible to all students.',
        workedExample: 'For ELLs learning "greater than / less than": use number lines, comparison cards, and the sentence stem "_____ is greater than _____ because _____." Vocabulary is explicitly taught alongside the concept.',
        misconception: 'All students can develop mathematical proficiency with appropriate instruction, support, and effort. Believing some people are simply "not math people" contradicts growth-mindset research.' },
    ],
  },
  'math712:c021': {
    title: 'Mathematical Assessment',
    conceptText: 'Formative assessment: ongoing, informs instruction (exit tickets, observations, questioning). Summative: evaluates learning after instruction (unit tests, finals). Diagnostic: identifies prior knowledge and misconceptions before instruction. Error analysis: categorize student mistakes to target instruction. Rubrics: criteria + performance levels for consistent scoring. Validity: does it measure what it claims? Reliability: consistent results across administrations.',
    workedExample: 'Student error: (x+3)² = x²+9. Missing the middle term — the misconception is applying exponent to each term separately. Correct: (x+3)² = x²+6x+9.',
    misconception: 'Formative assessment — ongoing checks during instruction — is the most powerful tool for day-to-day instructional decisions. Not all assessment is summative.',
    variants: [
      { conceptText: 'Error analysis includes procedural errors (wrong steps), conceptual errors (wrong understanding), and careless errors (attention lapses); each error type needs a different intervention. Common math error patterns: adding numerators and denominators in fractions ((1)/(2)+(1)/(3)≠(2)/(5)), distributing exponents over addition ((a+b)²≠a²+b²), and sign errors with negatives. Performance tasks are open-ended problems that assess deeper understanding and application. Norm-referenced tests compare students to peers (percentile ranks); criterion-referenced tests measure mastery against a fixed standard (e.g., STAAR).',
        workedExample: 'Student writes: −3² = 9. Error analysis: confusing −(3²) with (−3)². −3² = −9 by order of operations (exponent before negation). (−3)² = 9. Intervention: explicit instruction on order of operations with negatives.',
        misconception: 'Multiple-choice tests primarily measure recognition and recall. Open-ended tasks, performance assessments, and student interviews better reveal conceptual understanding and reasoning.' },
      { conceptText: 'Questioning taxonomy: factual ("What is…"), procedural ("How do you…"), conceptual ("Why does…"), metacognitive ("How do you know your answer is correct?"). Exit tickets: 1–3 quick questions at end of lesson to check for understanding. Think-alouds: students verbalize their reasoning process, revealing misconceptions. Item analysis after a test: which items had highest error rates? What patterns emerge? Use data to reteach, not just re-test.',
        workedExample: 'Exit ticket after fractions lesson: "Is (2)/(3) + (1)/(4) closer to 1 or closer to (1)/(2)? Explain." This checks estimation, concept, and communication — richer than "compute (2)/(3) + (1)/(4)."',
        misconception: 'Effective assessment is aligned to learning objectives, appropriate in difficulty, and provides actionable feedback. Quality matters far more than length or difficulty.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // Math 4–8 (math48)
  // ═══════════════════════════════════════════════════════════════

  // ── Domain-level fallbacks (comp48_1 – comp48_6) ──

  'math48:comp48_1': {
    title: 'Number Concepts',
    conceptText: 'Place value: each digit\'s value depends on its position (ones, tens, hundreds, …). Equivalent fractions: (a)/(b) = (c)/(d) when a × d = b × c. Decimals: 0.375 = (3)/(8). Comparing fractions: find a common denominator or use cross-multiplication. Negative numbers on the number line extend left of zero. Rational numbers include all fractions and terminating or repeating decimals.',
    workedExample: 'Compare (3)/(5) and (2)/(3). Cross-multiply: 3 × 3 = 9 and 5 × 2 = 10. Since 9 < 10, (3)/(5) < (2)/(3).',
    misconception: 'A larger denominator means a smaller fraction only when the numerators are equal. For example, (1)/(3) > (1)/(4), but (3)/(4) > (2)/(3).',
  },
  'math48:comp48_2': {
    title: 'Patterns and Algebra',
    conceptText: 'Patterns: find the rule (add, multiply, or both). Variables represent unknowns. Solve equations by using inverse operations to isolate the variable. Inequalities use <, >, ≤, ≥; multiplying or dividing by a negative number flips the inequality sign. Functions map each input to exactly one output — represented by tables, graphs, or equations.',
    workedExample: '3x + 7 = 22. Subtract 7: 3x = 15. Divide by 3: x = 5. Check: 3(5) + 7 = 22 ✓.',
    misconception: 'When you multiply or divide both sides of an inequality by a negative number, the direction of the inequality reverses.',
  },
  'math48:comp48_3': {
    title: 'Geometry and Measurement',
    conceptText: 'Classify shapes by sides, angles, and symmetry. Area formulas: rectangle A = l × w; triangle A = (1)/(2) × b × h; circle A = πr². Volume: rectangular prism V = l × w × h; cylinder V = πr²h. The Pythagorean theorem (a² + b² = c²) relates the sides of a right triangle. Transformations (slides, flips, turns) move figures without changing size or shape.',
    workedExample: 'Find the area of a triangle with base 10 cm and height 6 cm. A = (1)/(2) × 10 × 6 = 30 cm².',
    misconception: 'Perimeter measures the distance around a shape (in linear units), while area measures the space inside (in square units). They use different formulas and different units.',
  },
  'math48:comp48_4': {
    title: 'Probability and Statistics',
    conceptText: 'Probability measures how likely an event is: P(event) = favorable outcomes ÷ total outcomes, always between 0 and 1. Central tendency: mean = sum ÷ count; median = middle value; mode = most frequent. Data displays include bar graphs, line graphs, histograms, and box plots. Range = max − min measures spread.',
    workedExample: 'Data set: 4, 7, 7, 9, 13. Mean = (4 + 7 + 7 + 9 + 13) ÷ 5 = 40 ÷ 5 = 8. Median = 7 (middle value). Mode = 7.',
    misconception: 'The mean, median, and mode can all be different values. The mean is affected by outliers; the median is more resistant to extreme values.',
  },
  'math48:comp48_5': {
    title: 'Mathematical Processes',
    conceptText: 'Problem-solving steps: understand the problem, make a plan, carry out the plan, check your answer. Strategies: draw a picture, look for a pattern, work backwards, make a table, guess and check. Reasoning: inductive (observe patterns → make a conjecture) vs. deductive (apply known rules → reach a conclusion). A single counterexample disproves a conjecture.',
    workedExample: 'Conjecture: "All odd numbers are prime." Counterexample: 9 = 3 × 3 is odd but not prime. The conjecture is false.',
    misconception: 'Checking a few examples supports a conjecture but does not prove it. One counterexample is enough to disprove a claim.',
  },
  'math48:comp48_6': {
    title: 'Learning, Instruction & Assessment',
    conceptText: 'The CRA model (Concrete → Representational → Abstract) builds understanding from hands-on objects to pictures to symbols. Formative assessment (exit tickets, observations) guides daily instruction. Summative assessment (unit tests) measures mastery. Error analysis identifies whether mistakes are conceptual, procedural, or careless — each requires a different intervention.',
    workedExample: 'A student writes (1)/(2) + (1)/(3) = (2)/(5). Error: adding numerators and denominators separately. Correct: common denominator → (3)/(6) + (2)/(6) = (5)/(6).',
    misconception: 'Formative assessment happens during instruction to adjust teaching in real time, while summative assessment happens after instruction to measure overall learning.',
  },

  // ── Standard-level entries (m48_c001 – m48_c018) ──

  'math48:m48_c001': {
    title: 'Number Systems & Place Value',
    conceptText: 'Place value: in 3,405.72, the 3 is in the thousands place (3,000), the 4 in hundreds (400), the 7 in tenths (0.7), and the 2 in hundredths (0.02). Comparing decimals: line up decimal points and compare digit by digit from left to right. Fractions, decimals, and percents are different forms of the same number. Every point on the number line corresponds to a number.',
    workedExample: 'Order from least to greatest: 0.45, (3)/(8), 0.4. Convert: (3)/(8) = 0.375, and 0.4 = 0.400. So 0.375 < 0.400 < 0.450 → (3)/(8), 0.4, 0.45.',
    misconception: 'A decimal with more digits is not necessarily larger. For example, 0.5 > 0.38 because 5 tenths > 3 tenths, even though 0.38 has more digits.',
    variants: [
      { conceptText: 'Rational numbers include positive and negative fractions, decimals, and integers. On the number line, negative numbers lie to the left of zero. Opposites are equidistant from zero on opposite sides: the opposite of 3 is −3. Absolute value |n| is the distance from zero, always non-negative. Integers: …, −3, −2, −1, 0, 1, 2, 3, … Whole numbers are the non-negative integers: 0, 1, 2, 3, …',
        workedExample: 'Place −2.5, (3)/(4), and −1 on a number line. −2.5 is farthest left, then −1, then (3)/(4) (which is 0.75, to the right of 0). Order: −2.5 < −1 < (3)/(4).',
        misconception: 'Absolute value gives distance from zero, not the sign of the number. |−7| = 7 and |7| = 7 — both are 7 units from zero.' },
    ],
  },
  'math48:m48_c002': {
    title: 'Operations & Computational Fluency',
    conceptText: 'Four operations with whole numbers, fractions, and decimals. Order of operations (PEMDAS): Parentheses, Exponents, Multiplication/Division (left to right), Addition/Subtraction (left to right). Fraction operations: add/subtract → common denominator; multiply → numerator × numerator, denominator × denominator; divide → multiply by the reciprocal. Estimation: round to compatible numbers to check reasonableness.',
    workedExample: 'Evaluate: 3 + 4 × 2² − (6 ÷ 3). Parentheses: 6 ÷ 3 = 2. Exponents: 2² = 4. Multiply: 4 × 4 = 16. Add/Subtract: 3 + 16 − 2 = 17.',
    misconception: 'Multiplication and division have equal priority and are performed left to right — multiplication does not always come before division.',
    variants: [
      { conceptText: 'Adding fractions: (2)/(5) + (1)/(3) → common denominator 15 → (6)/(15) + (5)/(15) = (11)/(15). Subtracting mixed numbers: convert to improper fractions or regroup. Multiplying decimals: multiply as whole numbers, then count total decimal places. Dividing decimals: move the decimal in the divisor to make it a whole number, then move the dividend\'s decimal the same number of places.',
        workedExample: '2.4 × 0.15: multiply 24 × 15 = 360. Count decimal places: 1 + 2 = 3. Place decimal: 0.360. Answer: 0.36.',
        misconception: 'When multiplying decimals, the number of decimal places in the product equals the total number of decimal places in both factors.' },
    ],
  },
  'math48:m48_c003': {
    title: 'Number Theory & Proportional Reasoning',
    conceptText: 'Prime numbers have exactly two factors (1 and themselves). Prime factorization: break a number into prime factors using a factor tree. GCF: product of the lowest power of each common prime factor. LCM: product of the highest power of each prime factor. Ratios compare two quantities. Proportions: (a)/(b) = (c)/(d) → cross-multiply to solve. Percent means "per hundred": 25% = (25)/(100) = 0.25.',
    workedExample: 'Find GCF and LCM of 12 and 18. Factor: 12 = 2² × 3; 18 = 2 × 3². GCF = 2 × 3 = 6. LCM = 2² × 3² = 36.',
    misconception: 'The number 1 is not prime because it has only one factor (itself). A prime number must have exactly two distinct factors.',
    variants: [
      { conceptText: 'Proportional reasoning: if 3 apples cost $1.50, find the cost of 7 apples. Set up: (3)/($1.50) = (7)/(x). Cross-multiply: 3x = $10.50, so x = $3.50. Unit rate: cost per one item ($0.50 per apple). Converting: fraction → decimal: divide numerator by denominator. Decimal → percent: multiply by 100. Percent → fraction: put over 100 and simplify.',
        workedExample: 'Convert (3)/(8) to a percent. Divide: 3 ÷ 8 = 0.375. Multiply by 100: 37.5%.',
        misconception: 'To find a percent of a number, convert the percent to a decimal first, then multiply. 30% of 60 = 0.30 × 60 = 18, not 30 × 60.' },
    ],
  },
  'math48:m48_c004': {
    title: 'Patterns & Algebraic Thinking',
    conceptText: 'Arithmetic patterns add (or subtract) the same amount each time: 3, 7, 11, 15, … (add 4). Geometric patterns multiply (or divide) by the same factor: 2, 6, 18, 54, … (multiply by 3). Input-output tables show a rule that connects each input to its output. To find the rule, look at what operation(s) turn each input into the corresponding output.',
    workedExample: 'Input-output table: (1→5), (2→8), (3→11), (4→14). Pattern: output = 3 × input + 2. Check: 3(1) + 2 = 5 ✓, 3(4) + 2 = 14 ✓.',
    misconception: 'An arithmetic pattern has a constant difference between consecutive terms. A geometric pattern has a constant ratio (each term is multiplied by the same number).',
    variants: [
      { conceptText: 'Sequences can be described with a rule or recursively (each term depends on the previous). The nth term of an arithmetic sequence: aₙ = first term + (n − 1) × common difference. Look for patterns in shapes too: triangular numbers (1, 3, 6, 10, …) grow by +2, +3, +4, … Tile patterns that grow each step can model linear or quadratic relationships.',
        workedExample: 'Arithmetic sequence: 5, 9, 13, 17, … Common difference = 4. The 10th term: a₁₀ = 5 + (10 − 1) × 4 = 5 + 36 = 41.',
        misconception: 'Not every pattern with numbers is arithmetic or geometric. Some patterns add increasing amounts (like 1, 3, 6, 10, …) or follow other rules.' },
    ],
  },
  'math48:m48_c005': {
    title: 'Expressions, Equations & Inequalities',
    conceptText: 'An expression contains numbers, variables, and operations but no equals sign: 3x + 7. An equation states that two expressions are equal: 3x + 7 = 22. Solve by using inverse operations to isolate the variable. Distributive property: a(b + c) = ab + ac. Combine like terms: 4x + 3x = 7x. Inequalities use <, >, ≤, ≥ and have a range of solutions.',
    workedExample: 'Solve 2(x + 3) = 14. Distribute: 2x + 6 = 14. Subtract 6: 2x = 8. Divide by 2: x = 4.',
    misconception: 'The distributive property applies to every term inside the parentheses: 3(x + 5) = 3x + 15, not 3x + 5.',
    variants: [
      { conceptText: 'Translating words to algebra: "5 more than a number" → n + 5; "twice a number decreased by 3" → 2n − 3; "a number divided by 4" → n ÷ 4. Two-step equations: undo addition/subtraction first, then multiplication/division. Checking solutions: substitute back into the original equation. Graphing inequalities on a number line: open circle for < or >, closed circle for ≤ or ≥.',
        workedExample: '"Seven less than three times a number is 20." Translate: 3n − 7 = 20. Add 7: 3n = 27. Divide by 3: n = 9. Check: 3(9) − 7 = 20 ✓.',
        misconception: '"Less than" reverses the order in an expression. "7 less than n" is n − 7, not 7 − n.' },
    ],
  },
  'math48:m48_c006': {
    title: 'Linear Functions & Relations',
    conceptText: 'A linear function has a constant rate of change (slope). Slope = rise ÷ run = (y₂ − y₁) ÷ (x₂ − x₁). Slope-intercept form: y = mx + b, where m = slope and b = y-intercept. Proportional relationships pass through the origin (b = 0): y = kx. Non-proportional linear relationships have b ≠ 0.',
    workedExample: 'Find the equation of the line through (1, 3) and (3, 7). Slope: (7 − 3) ÷ (3 − 1) = 4 ÷ 2 = 2. Use point (1, 3): 3 = 2(1) + b → b = 1. Equation: y = 2x + 1.',
    misconception: 'A proportional relationship always passes through the origin (0, 0). If the y-intercept is not zero, the relationship is linear but not proportional.',
    variants: [
      { conceptText: 'Graphing y = mx + b: start at (0, b) on the y-axis, then use slope as rise/run to plot a second point. Positive slope → line goes up left to right. Negative slope → line goes down. Zero slope → horizontal line. Undefined slope → vertical line. Parallel lines have the same slope. Perpendicular lines have slopes that are negative reciprocals (m₁ × m₂ = −1).',
        workedExample: 'Graph y = −(2)/(3)x + 4. Start at (0, 4). Slope = −(2)/(3): move right 3, down 2 to reach (3, 2). Draw the line through both points.',
        misconception: 'Slope is a ratio (rise over run), not just "how steep it looks." A slope of (2)/(3) means for every 3 units right, the line rises 2 units.' },
    ],
  },
  'math48:m48_c007': {
    title: 'Geometric Properties & Relationships',
    conceptText: 'Angles: acute (< 90°), right (= 90°), obtuse (> 90° and < 180°), straight (= 180°). Triangles: classified by sides (equilateral, isosceles, scalene) and angles (acute, right, obtuse). Quadrilaterals: parallelogram, rectangle, rhombus, square, trapezoid. Parallel lines never meet; perpendicular lines meet at 90°. Congruent figures have the same shape and size. Similar figures have the same shape but may differ in size.',
    workedExample: 'A triangle has angles 50° and 60°. Find the third angle: 180° − 50° − 60° = 70°. Since all angles are less than 90°, it is an acute triangle.',
    misconception: 'The angles in every triangle always sum to exactly 180°, regardless of the triangle\'s shape or size.',
    variants: [
      { conceptText: 'Similar figures have proportional sides and equal corresponding angles. Scale factor = ratio of corresponding sides. If two triangles have two pairs of equal angles (AA), they are similar. Congruent means identical in shape and size — all sides and angles match. A square is always a rectangle and a rhombus, but a rectangle is not always a square.',
        workedExample: 'Triangles with sides 3, 4, 5 and 6, 8, 10. Ratios: 6 ÷ 3 = 2, 8 ÷ 4 = 2, 10 ÷ 5 = 2 — all equal, so the triangles are similar with scale factor 2.',
        misconception: 'All squares are rectangles (four right angles), but not all rectangles are squares (a rectangle may have unequal side lengths).' },
    ],
  },
  'math48:m48_c008': {
    title: 'Measurement Concepts',
    conceptText: 'Perimeter = distance around (sum of side lengths). Area formulas: rectangle A = l × w; triangle A = (1)/(2) × b × h; parallelogram A = b × h; trapezoid A = (1)/(2)(b₁ + b₂) × h; circle A = πr². Volume: rectangular prism V = l × w × h; cylinder V = πr²h. Unit conversions: 1 ft = 12 in; 1 km = 1,000 m; 1 gal = 4 qt. Pythagorean theorem: a² + b² = c² (right triangles only).',
    workedExample: 'A right triangle has legs 6 cm and 8 cm. Find the hypotenuse: c² = 6² + 8² = 36 + 64 = 100. c = √100 = 10 cm.',
    misconception: 'The Pythagorean theorem only applies to right triangles. Side c must be the hypotenuse — the side opposite the right angle.',
    variants: [
      { conceptText: 'Surface area = total area of all faces. Rectangular prism SA = 2(lw + lh + wh). Cylinder SA = 2πr² + 2πrh. To convert units, multiply by conversion factors: 5 ft × (12 in)/(1 ft) = 60 in. For area, square the conversion: 1 ft² = 144 in². For volume, cube it: 1 ft³ = 1,728 in³. Composite figures: break into simpler shapes, find each area, then add (or subtract for holes).',
        workedExample: 'Surface area of a box 4 cm × 3 cm × 2 cm: SA = 2(4 × 3 + 4 × 2 + 3 × 2) = 2(12 + 8 + 6) = 2(26) = 52 cm².',
        misconception: 'When converting area units, square the linear factor. Since 1 m = 100 cm, then 1 m² = 100² = 10,000 cm², not just 100 cm².' },
    ],
  },
  'math48:m48_c009': {
    title: 'Coordinate & Transformational Geometry',
    conceptText: 'The coordinate plane has an x-axis (horizontal) and y-axis (vertical), meeting at the origin (0, 0). Points are written (x, y). Quadrants: I (+, +), II (−, +), III (−, −), IV (+, −). Translations slide a figure without rotating or flipping. Reflections flip across a line (mirror image). Rotations turn around a point. Dilations enlarge or shrink by a scale factor. Line symmetry: a figure can be folded along a line so both halves match.',
    workedExample: 'Reflect point (3, −2) across the x-axis: the x-coordinate stays the same and the y-coordinate changes sign → (3, 2). Reflect across the y-axis: (−3, −2).',
    misconception: 'Reflecting across the x-axis changes the sign of the y-coordinate (not x). Reflecting across the y-axis changes the sign of the x-coordinate.',
    variants: [
      { conceptText: 'Translation rule: (x, y) → (x + a, y + b) shifts right a and up b. Rotation 90° counterclockwise about the origin: (x, y) → (−y, x). Rotation 180°: (x, y) → (−x, −y). Dilation with scale factor k centered at the origin: (x, y) → (kx, ky). If k > 1 the figure enlarges; if 0 < k < 1 it shrinks. Dilations preserve shape (similar figures) but not size.',
        workedExample: 'Translate triangle with vertices (1, 2), (4, 2), (1, 5) by the rule (x + 3, y − 1): new vertices → (4, 1), (7, 1), (4, 4).',
        misconception: 'A dilation changes size but preserves shape — all angles stay the same, and sides remain proportional. The image is similar to the original, not congruent (unless scale factor = 1).' },
    ],
  },
  'math48:m48_c010': {
    title: 'Data Analysis & Displays',
    conceptText: 'Mean = sum of values ÷ number of values. Median = middle value when data is ordered (average the two middle values if even count). Mode = most frequent value. Range = maximum − minimum. Bar graphs compare categories. Line graphs show change over time. Histograms show frequency within intervals. Box plots display the five-number summary: minimum, Q₁, median, Q₃, maximum.',
    workedExample: 'Data: 12, 15, 15, 18, 20. Mean = 80 ÷ 5 = 16. Median = 15. Mode = 15. Range = 20 − 12 = 8.',
    misconception: 'The mean is sensitive to outliers. Adding an extreme value (like 100 to this set) pulls the mean up significantly, but the median barely changes.',
    variants: [
      { conceptText: 'Box plots show spread and skew at a glance. Q₁ is the median of the lower half; Q₃ is the median of the upper half. IQR = Q₃ − Q₁ measures the middle 50% spread. Outliers: values below Q₁ − 1.5 × IQR or above Q₃ + 1.5 × IQR. Dot plots show individual data points. Stem-and-leaf plots preserve actual values while showing distribution shape.',
        workedExample: 'Data: 2, 4, 5, 7, 8, 10, 12. Q₁ = 4, median = 7, Q₃ = 10, IQR = 6. Outlier fences: 4 − 9 = −5 and 10 + 9 = 19. No outliers in this set.',
        misconception: 'A box plot does not show the mean — it shows the median (the line inside the box). The box represents the middle 50% of the data (from Q₁ to Q₃).' },
    ],
  },
  'math48:m48_c011': {
    title: 'Probability',
    conceptText: 'Probability = favorable outcomes ÷ total outcomes. Always between 0 (impossible) and 1 (certain). Theoretical probability: based on equally likely outcomes. Experimental probability: based on actual trials. Sample space = list of all possible outcomes. Tree diagrams organize multi-step experiments. Compound events: use multiplication (AND) or addition (OR).',
    workedExample: 'Roll a fair number cube. P(even) = 3 favorable (2, 4, 6) ÷ 6 total = 3 ÷ 6 = 1 ÷ 2. P(greater than 4) = 2 ÷ 6 = 1 ÷ 3.',
    misconception: 'Probability of 0 means the event is impossible; probability of 1 means the event is certain. A probability cannot be negative or greater than 1.',
    variants: [
      { conceptText: 'Independent events: the outcome of one does not affect the other. P(A and B) = P(A) × P(B). Dependent events: the first outcome changes the possibilities for the second. P(A and B) = P(A) × P(B given A). Complement: P(not A) = 1 − P(A). "Or" events (mutually exclusive): P(A or B) = P(A) + P(B).',
        workedExample: 'Bag has 3 red and 5 blue marbles. Draw two without replacement. P(both red) = (3)/(8) × (2)/(7) = (6)/(56) = (3)/(28).',
        misconception: 'When drawing without replacement, probabilities change after each draw because the total number of items decreases. This makes the events dependent.' },
    ],
  },
  'math48:m48_c012': {
    title: 'Statistical Reasoning',
    conceptText: 'A sample is a subset of a population. Random sampling gives every member an equal chance of being selected, reducing bias. Biased samples (like surveying only your friends) do not represent the population. Predictions from data: use trends, proportions, or averages to estimate. Variability measures: IQR (interquartile range) and MAD (mean absolute deviation) show how spread out data is.',
    workedExample: 'MAD for 4, 6, 8, 10, 12: mean = 8. Absolute deviations: |4−8|=4, |6−8|=2, |8−8|=0, |10−8|=2, |12−8|=4. MAD = (4+2+0+2+4) ÷ 5 = 12 ÷ 5 = 2.4.',
    misconception: 'A larger sample size generally gives more reliable predictions, but the sampling method matters more than size. A biased sample stays biased no matter how large it is.',
    variants: [
      { conceptText: 'Sampling methods: random (every member has equal chance), stratified (divide into groups, sample from each), convenience (easiest to reach — often biased), voluntary response (people choose to respond — often biased). Making predictions: if 12 out of 50 surveyed prefer vanilla, predict about 12 ÷ 50 = 24% of the full population prefers vanilla. Compare two data sets using their centers (mean/median) and their spreads (IQR/MAD).',
        workedExample: 'Class A median = 78, IQR = 10. Class B median = 82, IQR = 20. Class B scored higher on average, but Class A was more consistent (smaller spread).',
        misconception: 'Two data sets can have the same mean but very different spreads. Always look at both center and variability to fully compare distributions.' },
    ],
  },
  'math48:m48_c013': {
    title: 'Problem Solving & Reasoning',
    conceptText: 'Polya\'s four steps: (1) Understand the problem, (2) Make a plan, (3) Carry out the plan, (4) Look back and check. Strategies: draw a diagram, make a table, look for a pattern, work backwards, guess-and-check, write an equation. Inductive reasoning: observe specific cases → form a general conjecture. Deductive reasoning: apply a known rule → reach a guaranteed conclusion. A counterexample disproves a conjecture.',
    workedExample: 'Conjecture: "The sum of two odd numbers is always odd." Test: 3 + 5 = 8 (even). Counterexample found! The sum of two odd numbers is always even.',
    misconception: 'Inductive reasoning (pattern-based) can suggest what is true, but only deductive reasoning (rule-based) can prove it with certainty.',
  },
  'math48:m48_c014': {
    title: 'Mathematical Connections',
    conceptText: 'Math connects across strands: fractions relate to division, area models connect multiplication to geometry, and proportional reasoning links ratios to graphs. Real-world applications: budgeting (operations), cooking (fractions), construction (measurement), sports statistics (data). Multiple representations: a relationship can be shown with words, a table, an equation, or a graph — all convey the same information in different ways.',
    workedExample: 'A recipe uses (3)/(4) cup of flour for 12 cookies. For 36 cookies (3 batches): (3)/(4) × 3 = (9)/(4) = 2(1)/(4) cups. Fractions, multiplication, and real-world context connect.',
    misconception: 'Math strands are not isolated topics. Algebra, geometry, data, and number sense constantly reinforce each other in real problems.',
  },
  'math48:m48_c015': {
    title: 'Communication & Mathematical Language',
    conceptText: 'Precise vocabulary matters: "equal," "equivalent," "congruent," and "similar" each have specific meanings. Translating between representations: verbal descriptions ↔ numerical expressions ↔ algebraic equations ↔ graphs/diagrams. Explaining reasoning: state your claim, provide evidence (computation or logic), and connect back to the problem. Justification shows why an answer is correct, not just what the answer is.',
    workedExample: '"Is (2)/(4) equal to (1)/(2)?" Justify: (2)/(4) simplifies by dividing numerator and denominator by 2: (2 ÷ 2)/(4 ÷ 2) = (1)/(2). Yes, they are equivalent fractions.',
    misconception: '"Equal" and "equivalent" have distinct uses in math. Two fractions are equivalent (same value, different form); two expressions are equal when they have the same value for all variable values.',
  },
  'math48:m48_c016': {
    title: 'How Students Learn Mathematics',
    conceptText: 'CRA model: Concrete (manipulatives like base-ten blocks, fraction tiles), Representational (drawings, diagrams, number lines), Abstract (symbols and equations). Students progress through developmental stages — younger learners need more concrete experience. Common misconceptions at grades 4–8: "multiplication always makes bigger," "you can\'t subtract a bigger number from a smaller one," "longer decimals are always larger."',
    workedExample: 'Teaching fractions with CRA: Concrete — fold paper strips into halves, thirds, fourths. Representational — shade fraction bars on a worksheet. Abstract — compute (1)/(2) + (1)/(4) = (3)/(4) using symbols.',
    misconception: 'Multiplication does not always make a number bigger. Multiplying by a fraction less than 1 makes the product smaller: 8 × (1)/(2) = 4.',
    variants: [
      { conceptText: 'Piaget\'s stages relevant to grades 4–8: concrete operational (ages ~7–11, logical thinking about concrete objects) and formal operational (ages ~11+, abstract and hypothetical thinking). Students in transition may handle some abstract ideas but still need concrete anchors. Productive struggle is valuable — students learn more when they work through challenges rather than being told procedures. Growth mindset: effort and strategies develop math ability.',
        workedExample: 'A 5th grader struggles with −3 + 5. Concrete: use a number line, start at −3, jump right 5 → land on 2. Representational: draw the jumps. Abstract: −3 + 5 = 2.',
        misconception: 'Students develop mathematical understanding at different rates, and concrete models remain helpful even for older students encountering new abstract concepts.' },
    ],
  },
  'math48:m48_c017': {
    title: 'Planning & Instructional Strategies',
    conceptText: 'Lesson design should align to TEKS standards with a clear objective, engaging activity, and assessment. Differentiation: adjust content, process, or product based on student readiness. Scaffolding: provide temporary support (hints, graphic organizers, sentence stems) and gradually remove it. ELL strategies: visual aids, vocabulary walls, hands-on activities, bilingual glossaries. Technology: virtual manipulatives, graphing tools (Desmos), and practice software enhance learning.',
    workedExample: 'Objective: "Students will solve two-step equations." Differentiation — struggling: use algebra tiles; on-level: solve symbolically; advanced: write and solve their own word problems. All groups share strategies at the end.',
    misconception: 'Differentiation does not mean giving advanced students "more problems." It means providing appropriately challenging tasks that deepen understanding for every learner.',
    variants: [
      { conceptText: 'Manipulatives: base-ten blocks (place value), fraction tiles (fraction operations), algebra tiles (equations), geoboards (area/perimeter), pattern blocks (geometry). Using manipulatives is not just for younger students — they help build understanding of new concepts at any grade. Questioning strategies: factual ("What is…"), procedural ("How do you…"), conceptual ("Why does…"), metacognitive ("How do you know?"). Higher-order questions promote deeper thinking.',
        workedExample: 'Teaching area of a parallelogram: students cut a triangle from one side of a paper parallelogram and slide it to the other side, forming a rectangle. They see that A = base × height.',
        misconception: 'Effective instruction balances conceptual understanding with procedural fluency. Students need both to be flexible problem solvers.' },
    ],
  },
  'math48:m48_c018': {
    title: 'Assessment',
    conceptText: 'Formative assessment: ongoing checks during instruction — exit tickets, thumbs up/down, whiteboard responses, questioning. Summative assessment: end-of-unit or end-of-course tests measuring mastery. Diagnostic assessment: given before a unit to identify prior knowledge and gaps. Error analysis: examine student work to determine if errors are conceptual (misunderstanding), procedural (wrong steps), or careless (attention slips). Use assessment data to reteach, regroup, or extend.',
    workedExample: 'Student work: (3)/(4) − (1)/(2) = (2)/(2) = 1. Error analysis: the student subtracted numerators (3 − 1 = 2) and denominators (4 − 2 = 2) separately. Intervention: reteach common denominators — (3)/(4) − (2)/(4) = (1)/(4).',
    misconception: 'Assessment is not just testing — it is a continuous process of gathering evidence about student learning to make informed instructional decisions.',
    variants: [
      { conceptText: 'Rubrics define criteria and performance levels (e.g., 4 = exceeds, 3 = meets, 2 = approaching, 1 = beginning). They make expectations clear and scoring consistent. Item analysis after a test: which questions had the highest error rate? What misconceptions do the wrong answers reveal? Data-driven instruction: use patterns in student performance to plan reteaching, small-group intervention, or enrichment. Portfolios show growth over time.',
        workedExample: 'After a test, 70% of students missed the question on subtracting mixed numbers. The most common wrong answer suggests students forgot to regroup. Plan: reteach regrouping with fraction models before moving on.',
        misconception: 'A single test score does not fully represent a student\'s understanding. Multiple forms of evidence (tests, observations, student work, discussions) provide a more complete picture.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // EC-6
  // ═══════════════════════════════════════════════════════════════

  'ec6:comp_ec6_5': {
    title: 'Number Concepts and Operations',
    conceptText: 'Number sense: counting, place value, operations with whole numbers and fractions. Equivalent fractions; comparing (common denominator); add/subtract like denominators. Multiplication = equal groups; division = sharing. Decimals and percent.',
    workedExample: '(1)/(2) + (1)/(4) = (2)/(4) + (1)/(4) = (3)/(4). Common denominator first.',
    misconception: 'Adding numerators and denominators: (1)/(2) + (1)/(3) ≠ (2)/(5). Must find common denominator.',
  },

  // ═══════════════════════════════════════════════════════════════
  // Linear Algebra (linearAlgebra)
  // ═══════════════════════════════════════════════════════════════

  // ── Competency-level fallbacks ──
  'linearAlgebra:la_vectors': {
    title: 'Vectors & Vector Spaces',
    conceptText: 'A vector in ℝⁿ is an ordered n-tuple. Vector addition and scalar multiplication are component-wise. The dot product u·v = Σuᵢvᵢ measures alignment; u·v = 0 ⟺ orthogonal. Norm: ‖v‖ = √(v·v). A set of vectors is linearly independent if no vector is a linear combination of the others. Span = set of all linear combinations. A basis is a linearly independent spanning set; its size is the dimension of the space.',
    workedExample: 'Show {⟨1,0,0⟩, ⟨0,1,0⟩, ⟨0,0,1⟩} is a basis for ℝ³: independent (no vector is a combo of others) and span = ℝ³. dim(ℝ³) = 3.',
    misconception: 'The zero vector is never part of a linearly independent set. Including 0 in a set automatically makes it dependent because 1·0 = 0 is a nontrivial combination.',
  },
  'linearAlgebra:la_matrices': {
    title: 'Matrices & Linear Systems',
    conceptText: 'A matrix is a rectangular array of numbers. Product AB: row i of A dots each column of B. AB ≠ BA in general. Row reduction (Gaussian elimination) converts a system to echelon form. Pivots mark leading variables; columns without pivots correspond to free variables. Rank = number of pivots. A square matrix is invertible ⟺ rank = n ⟺ det ≠ 0.',
    workedExample: 'Solve: x + 2y = 5, 3x + 5y = 14. Row reduce: R₂ − 3R₁ → −y = −1 → y = 1, x = 3.',
    misconception: 'Matrix multiplication is commutative only for special cases (e.g., diagonal matrices). In general AB ≠ BA, and the product may not even be defined if dimensions are swapped.',
  },
  'linearAlgebra:la_transforms': {
    title: 'Linear Transformations',
    conceptText: 'T: ℝⁿ→ℝᵐ is linear if T(u+v) = T(u)+T(v) and T(cv) = cT(v). Every linear transformation has a standard matrix A such that T(x) = Ax. The kernel (null space) is {v: T(v) = 0}; the range (image) is {T(v): v ∈ ℝⁿ}. Rank-nullity theorem: rank(A) + nullity(A) = n.',
    workedExample: 'T(x,y) = (x+y, x−y). Matrix A = [[1,1],[1,−1]]. ker(T): x+y=0 and x−y=0 → x=y=0, so ker = {0}. T is one-to-one.',
    misconception: 'T(0) = 0 is a necessary condition for linearity, not sufficient. A function with T(0) = 0 can still fail T(u+v) = T(u)+T(v).',
  },
  'linearAlgebra:la_det_eigen': {
    title: 'Determinants & Eigenvalues',
    conceptText: 'det([[a,b],[c,d]]) = ad−bc. For n×n, use cofactor expansion or row reduce. Properties: det(AB) = det(A)det(B); row swap flips sign; scaling a row by k multiplies det by k. Eigenvalue λ: det(A−λI) = 0 (characteristic polynomial). Eigenvector v ≠ 0: Av = λv. The eigenspace for λ is ker(A−λI).',
    workedExample: 'A = [[2,1],[0,3]]. det(A−λI) = (2−λ)(3−λ) = 0 → λ = 2, 3. For λ=2: (A−2I)v = 0 → v = t⟨1,0⟩.',
    misconception: 'Eigenvalues of a real matrix are not always real. A real matrix can have complex eigenvalues (they come in conjugate pairs). Only symmetric real matrices are guaranteed all real eigenvalues.',
  },
  'linearAlgebra:la_inner': {
    title: 'Inner Product Spaces',
    conceptText: 'An inner product generalizes the dot product. In ℝⁿ: ⟨u,v⟩ = Σuᵢvᵢ. Orthogonal = ⟨u,v⟩ = 0. Projection: proj_v(u) = (⟨u,v⟩/⟨v,v⟩)v. Gram-Schmidt turns any basis into an orthogonal (or orthonormal) basis. The least-squares solution x̂ to Ax = b satisfies AᵀAx̂ = Aᵀb.',
    workedExample: 'Gram-Schmidt on {⟨1,1⟩, ⟨1,0⟩}: v₁ = ⟨1,1⟩. v₂ = ⟨1,0⟩ − proj_{v₁}⟨1,0⟩ = ⟨1,0⟩ − (1/2)⟨1,1⟩ = ⟨1/2, −1/2⟩.',
    misconception: 'Orthogonal and orthonormal are different. Orthogonal means mutually perpendicular; orthonormal additionally requires each vector to have unit length (norm = 1).',
  },
  'linearAlgebra:la_diag': {
    title: 'Diagonalization & Applications',
    conceptText: 'A is diagonalizable if A = PDP⁻¹ where D is diagonal (eigenvalues) and P has eigenvectors as columns. This requires n linearly independent eigenvectors. Powers: A^k = PD^kP⁻¹. The Spectral Theorem: real symmetric → orthogonally diagonalizable (A = QDQᵀ). SVD decomposes any matrix A = UΣVᵀ. Applications: Markov chains, differential equations, PCA.',
    workedExample: 'A = [[4,1],[2,3]], eigenvalues 5, 2, eigenvectors ⟨1,1⟩, ⟨1,−2⟩. P = [[1,1],[1,−2]], D = [[5,0],[0,2]]. A^3 = PD³P⁻¹.',
    misconception: 'Not every square matrix is diagonalizable. A matrix needs n linearly independent eigenvectors. Defective matrices (where geometric multiplicity < algebraic multiplicity for some eigenvalue) cannot be diagonalized.',
  },

  // ── Standard-level entries (la_c001–la_c012) ──
  'linearAlgebra:la_c001': {
    title: 'Vector Operations & Properties',
    conceptText: 'Vectors in ℝⁿ: v = ⟨v₁, v₂, …, vₙ⟩. Addition: u + v = ⟨u₁+v₁, …, uₙ+vₙ⟩. Scalar multiplication: cv = ⟨cv₁, …, cvₙ⟩. Dot product: u·v = Σuᵢvᵢ. Angle: cos θ = (u·v)/(‖u‖‖v‖). Cauchy-Schwarz: |u·v| ≤ ‖u‖‖v‖. Triangle inequality: ‖u+v‖ ≤ ‖u‖+‖v‖.',
    workedExample: 'u = ⟨1,2,−1⟩, v = ⟨3,0,4⟩. u·v = 3+0−4 = −1. ‖u‖ = √6, ‖v‖ = 5. cos θ = −1/(5√6).',
    misconception: 'The dot product of two vectors is a vector. It is a scalar (a single number), not a vector. The cross product (only in ℝ³) gives a vector.',
    variants: [
      { conceptText: 'The cross product u × v (ℝ³ only) gives a vector perpendicular to both u and v. ‖u × v‖ = ‖u‖‖v‖ sin θ. Direction: right-hand rule. Properties: u × v = −(v × u) (anticommutative). Computation: determinant of [[i,j,k],[u₁,u₂,u₃],[v₁,v₂,v₃]]. Parallel vectors ⟺ u × v = 0.',
        workedExample: 'u = ⟨1,0,0⟩, v = ⟨0,1,0⟩. u × v = ⟨0·0−0·1, 0·0−1·0, 1·1−0·0⟩ = ⟨0,0,1⟩ = k.',
        misconception: 'The cross product is commutative. It is anticommutative: u × v = −(v × u). Swapping the order reverses the direction.' },
    ],
  },
  'linearAlgebra:la_c002': {
    title: 'Linear Independence, Span & Basis',
    conceptText: 'Vectors {v₁,…,vₖ} are linearly independent if c₁v₁+…+cₖvₖ = 0 ⟹ all cᵢ = 0. Span{v₁,…,vₖ} = set of all linear combinations. A basis for subspace W is a linearly independent set that spans W. Every basis of W has the same size — the dimension of W.',
    workedExample: 'Is {⟨1,2,3⟩, ⟨4,5,6⟩, ⟨7,8,9⟩} independent? Row reduce → third row becomes all zeros → dependent. dim(span) = 2.',
    misconception: 'A spanning set is always a basis. A spanning set may contain extra (dependent) vectors. Remove dependent ones to get a basis.',
    variants: [
      { conceptText: 'Subspace tests: W ⊆ ℝⁿ is a subspace if (1) 0 ∈ W, (2) u,v ∈ W ⟹ u+v ∈ W, (3) u ∈ W, c ∈ ℝ ⟹ cu ∈ W. Examples: null space of A, column space of A, solution set of Ax = 0. Non-examples: {(x,y): x ≥ 0} (not closed under scalar mult by −1).',
        workedExample: 'Is W = {(x,y,z): x+y−z = 0} a subspace? 0 ∈ W ✓. Closure: if x₁+y₁−z₁ = 0 and x₂+y₂−z₂ = 0, then (x₁+x₂)+(y₁+y₂)−(z₁+z₂) = 0 ✓. Yes, W is a subspace of ℝ³ with dim 2.',
        misconception: 'A subspace must pass through the origin. This is correct — and is the simplest check. If a set does not contain the zero vector, it cannot be a subspace.' },
    ],
  },
  'linearAlgebra:la_c003': {
    title: 'Matrix Operations',
    conceptText: 'Matrix addition: add entry-by-entry (same dimensions). Scalar multiplication: multiply every entry. Matrix product AB: entry (i,j) = row i of A · column j of B. Transpose: (Aᵀ)ᵢⱼ = Aⱼᵢ. Properties: (AB)ᵀ = BᵀAᵀ, (AB)⁻¹ = B⁻¹A⁻¹. Inverse A⁻¹ exists ⟺ A is square with det ≠ 0.',
    workedExample: 'A = [[1,2],[3,4]]. A⁻¹ = (1/(ad−bc))[[d,−b],[−c,a]] = (1/(−2))[[4,−2],[−3,1]] = [[−2,1],[3/2,−1/2]].',
    misconception: '(AB)⁻¹ = A⁻¹B⁻¹ is incorrect. The correct formula reverses the order: (AB)⁻¹ = B⁻¹A⁻¹, just like (AB)ᵀ = BᵀAᵀ.',
    variants: [
      { conceptText: 'Special matrices: symmetric (A = Aᵀ), skew-symmetric (A = −Aᵀ), orthogonal (AᵀA = I), upper/lower triangular. Block matrices: partition into sub-matrices. Trace: tr(A) = sum of diagonal entries; tr(AB) = tr(BA). Powers: A² = AA, A^k computed by diagonalization if possible.',
        workedExample: 'A = [[0,−1],[1,0]]. Aᵀ = [[0,1],[−1,0]] = −A → skew-symmetric. AᵀA = [[1,0],[0,1]] = I → also orthogonal.',
        misconception: 'Every matrix that satisfies A² = I is the identity. Reflection matrices (e.g., [[1,0],[0,−1]]) also satisfy A² = I but are not I.' },
    ],
  },
  'linearAlgebra:la_c004': {
    title: 'Systems of Linear Equations',
    conceptText: 'System Ax = b: consistent (at least one solution) or inconsistent (none). Gaussian elimination: use row operations to reach echelon form. Back-substitute to solve. RREF: every pivot is 1 with zeros above and below. Homogeneous Ax = 0 always has x = 0; nontrivial solutions exist ⟺ free variables ⟺ rank < n.',
    workedExample: 'x + y + z = 6, 2x + 3y + z = 14, x + y + 2z = 9. Row reduce → z = 3, y = 2, x = 1.',
    misconception: 'A system with more unknowns than equations always has infinitely many solutions. It has infinitely many or no solutions — never a unique one — but it can still be inconsistent.',
    variants: [
      { conceptText: 'Parametric solutions: free variables become parameters. Example: if z is free, express x and y in terms of z. Solution set is a line or plane through the origin (for homogeneous) or a translated version (for nonhomogeneous). Superposition: general solution to Ax = b is x_p + x_h where x_p is any particular solution and x_h ∈ null(A).',
        workedExample: 'x + 2y − z = 3, 2x + 4y − 2z = 6. Row 2 is 2×Row 1 → only 1 equation in 3 unknowns → 2 free variables (y = s, z = t). x = 3 − 2s + t.',
        misconception: 'Row reduction changes the solution set. It does not — elementary row operations produce equivalent systems with the same solution set.' },
    ],
  },
  'linearAlgebra:la_c005': {
    title: 'Definition & Matrix Representation',
    conceptText: 'T: ℝⁿ→ℝᵐ is linear if T(αu + βv) = αT(u) + βT(v). The standard matrix: A = [T(e₁) | T(e₂) | … | T(eₙ)]. Composition: T₂ ∘ T₁ corresponds to B·A. T is invertible ⟺ A is invertible ⟺ T is both one-to-one and onto.',
    workedExample: 'T(x,y) = (2x−y, x+3y). T(e₁) = (2,1), T(e₂) = (−1,3). A = [[2,−1],[1,3]]. det = 7 ≠ 0 → invertible.',
    misconception: 'A linear transformation always maps a square to a square. It maps parallelograms to parallelograms (or degenerate cases). Only orthogonal transformations preserve angles and lengths.',
  },
  'linearAlgebra:la_c006': {
    title: 'Kernel, Range & Rank-Nullity',
    conceptText: 'Kernel = null space: ker(T) = {v: T(v) = 0}. Range = image = column space of A. Rank = dim(range). Nullity = dim(ker). Rank-nullity theorem: rank + nullity = n (number of columns). T is injective ⟺ nullity = 0. T is surjective ⟺ rank = m.',
    workedExample: 'A = [[1,2,3],[0,1,1]]. RREF: [[1,0,1],[0,1,1]]. Rank = 2, nullity = 1. ker: x₃ free, x₂ = −x₃, x₁ = −x₃. ker = span{⟨−1,−1,1⟩}.',
    misconception: 'Rank and nullity can each independently be anything. They are constrained: rank + nullity always equals the number of columns.',
  },
  'linearAlgebra:la_c007': {
    title: 'Determinants',
    conceptText: '2×2: det = ad−bc. n×n: cofactor expansion along any row or column. Row operations: swap → ×(−1); scale row by k → ×k; add multiple of one row to another → no change. det(AB) = det(A)det(B). det(Aᵀ) = det(A). det(A⁻¹) = 1/det(A). Geometric meaning: |det(A)| = volume scaling factor of the transformation.',
    workedExample: 'A = [[2,1,3],[0,4,1],[0,0,5]]. Triangular → det = product of diagonal = 2·4·5 = 40.',
    misconception: 'det(A+B) = det(A) + det(B) is false. The determinant is multiplicative (det(AB) = det(A)det(B)) but not additive.',
    variants: [
      { conceptText: 'Cramer\'s rule: for Ax = b (n×n, det A ≠ 0), xᵢ = det(Aᵢ)/det(A) where Aᵢ replaces column i with b. Useful for small systems and theory; computationally expensive for large n. The determinant also appears in the change-of-variables formula for integrals (Jacobian) and in eigenvalue computation.',
        workedExample: '2x + y = 5, x − y = 1. det(A) = −3. x = det([[5,1],[1,−1]])/−3 = (−6)/(−3) = 2. y = det([[2,5],[1,1]])/−3 = (−3)/(−3) = 1.',
        misconception: 'Cramer\'s rule is the most efficient way to solve systems. For large systems, row reduction or LU decomposition is far more efficient. Cramer\'s rule requires computing n+1 determinants.' },
    ],
  },
  'linearAlgebra:la_c008': {
    title: 'Eigenvalues & Eigenvectors',
    conceptText: 'Eigenvalue λ: Av = λv (v ≠ 0). Find λ: solve det(A − λI) = 0 (characteristic polynomial). Then find eigenvectors: solve (A − λI)v = 0. Algebraic multiplicity: multiplicity of λ as a root. Geometric multiplicity: dim(eigenspace). Always: geo ≤ alg. Sum of eigenvalues = tr(A). Product = det(A).',
    workedExample: 'A = [[3,1],[0,2]]. det(A−λI) = (3−λ)(2−λ) = 0 → λ = 3, 2. For λ=3: v = ⟨1,0⟩. For λ=2: v = ⟨−1,1⟩.',
    misconception: 'Eigenvectors for different eigenvalues can be parallel. Eigenvectors corresponding to distinct eigenvalues are always linearly independent.',
    variants: [
      { conceptText: 'The Cayley-Hamilton theorem: every matrix satisfies its own characteristic polynomial. If p(λ) = det(A−λI), then p(A) = 0. This is useful for computing A⁻¹ and high powers of A without diagonalization. Complex eigenvalues of real matrices come in conjugate pairs (a ± bi) and correspond to rotation-scaling in the real plane.',
        workedExample: 'A = [[0,−1],[1,0]]. Char poly: λ²+1 = 0 → λ = ±i. Cayley-Hamilton: A²+I = 0, i.e. A² = −I. Check: [[0,−1],[1,0]]² = [[−1,0],[0,−1]] = −I ✓.',
        misconception: 'A matrix with complex eigenvalues cannot represent a real transformation. It can — a 2×2 rotation matrix has complex eigenvalues (e^(±iθ)) and is perfectly real.' },
    ],
  },
  'linearAlgebra:la_c009': {
    title: 'Inner Products & Orthogonality',
    conceptText: 'An inner product on ℝⁿ satisfies: (1) ⟨u,v⟩ = ⟨v,u⟩, (2) ⟨au+bv,w⟩ = a⟨u,w⟩+b⟨v,w⟩, (3) ⟨v,v⟩ ≥ 0 with equality iff v = 0. The standard dot product is one example. Orthogonal complement: W⊥ = {v: ⟨v,w⟩ = 0 ∀w ∈ W}. ℝⁿ = W ⊕ W⊥ (direct sum).',
    workedExample: 'W = span{⟨1,1,0⟩}. W⊥ = {⟨x,y,z⟩: x+y = 0} = span{⟨−1,1,0⟩, ⟨0,0,1⟩}. dim(W) + dim(W⊥) = 1+2 = 3 = dim(ℝ³).',
    misconception: 'The orthogonal complement of a line through the origin in ℝ³ is another line. It is a plane — dim(W⊥) = n − dim(W) = 3 − 1 = 2.',
  },
  'linearAlgebra:la_c010': {
    title: 'Gram-Schmidt & Projections',
    conceptText: 'Gram-Schmidt process: given {v₁,…,vₖ}, produce orthogonal {u₁,…,uₖ}. u₁ = v₁. uⱼ = vⱼ − Σᵢ₌₁^(j−1) proj_{uᵢ}(vⱼ). Normalize to get orthonormal. Orthogonal projection onto W: proj_W(v) = Σ (⟨v,uᵢ⟩/⟨uᵢ,uᵢ⟩)uᵢ. Least squares: x̂ = (AᵀA)⁻¹Aᵀb minimizes ‖Ax−b‖².',
    workedExample: 'Least squares for y = mx+b fitting points (0,1),(1,3),(2,4): A = [[0,1],[1,1],[2,1]], b = [1,3,4]. AᵀA = [[5,3],[3,3]], Aᵀb = [11,8]. x̂ = [3/2, 7/6]. Best fit: y = 1.5x + 1.17.',
    misconception: 'Least squares gives an exact solution. It gives the best approximation when Ax = b has no exact solution (b ∉ col(A)). The residual ‖Ax̂ − b‖ is minimized but generally not zero.',
  },
  'linearAlgebra:la_c011': {
    title: 'Diagonalization & Similarity',
    conceptText: 'A is diagonalizable ⟺ A has n linearly independent eigenvectors ⟺ A = PDP⁻¹. Then A^k = PD^kP⁻¹. Similar matrices (B = P⁻¹AP) share eigenvalues, det, trace, rank, and characteristic polynomial. Spectral Theorem: real symmetric matrix → eigenvalues are real, eigenvectors from different eigenvalues are orthogonal, and A = QDQᵀ with Q orthogonal.',
    workedExample: 'A = [[5,4],[4,−1]], symmetric. Eigenvalues: λ²−4λ−21 = 0 → λ = 7, −3. Eigenvectors orthogonal: ⟨2,1⟩, ⟨−1,2⟩. A = QDQᵀ.',
    misconception: 'A matrix with repeated eigenvalues is never diagonalizable. It may still be diagonalizable if the eigenspace has full dimension (geometric multiplicity = algebraic multiplicity). For example, I = identity is diagonalizable with all eigenvalues equal to 1.',
  },
  'linearAlgebra:la_c012': {
    title: 'SVD & Applications',
    conceptText: 'Singular Value Decomposition: any m×n matrix A = UΣVᵀ. U (m×m orthogonal), Σ (m×n diagonal with σ₁ ≥ σ₂ ≥ … ≥ 0), V (n×n orthogonal). σᵢ = √(eigenvalue of AᵀA). Nonzero σs = rank. Low-rank approximation: keep top k singular values. PCA: eigenvectors of the covariance matrix give principal components. Markov chains: steady state is the eigenvector for λ = 1.',
    workedExample: 'Markov transition P = [[0.7,0.4],[0.3,0.6]]. Steady state: Pq = q → (P−I)q = 0. q = [4/7, 3/7] (normalized).',
    misconception: 'SVD only applies to square matrices. SVD works for any m×n matrix — it is the most general matrix decomposition.',
  },

  // ═══════════════════════════════════════════════════════════════
  // Calculus (calculus)
  // ═══════════════════════════════════════════════════════════════
  'calculus:calc_limits': {
    title: 'L\'Hospital\'s Rule, Limits & Continuity',
    conceptText: 'A limit describes behavior near a point, not necessarily at the point. A function is continuous at x=a if f(a) exists, lim(x→a)f(x) exists, and they are equal. For rational limits, factor/cancel where possible. For ∞ behavior, compare leading terms. L\'Hospital\'s Rule applies to 0/0 and ∞/∞ forms after confirming those forms.',
    workedExample: 'lim(x→2)(x²−4)/(x−2) = lim(x→2)(x+2) = 4 after canceling (x−2).',
    misconception: 'If f(a) is undefined, the limit at a cannot exist. False: limits can exist even when the function value is missing or different.',
  },
  'calculus:calc_derivatives': {
    title: 'Derivative Foundations',
    conceptText: 'Derivative means instantaneous rate of change and slope of the tangent line. Core rules: power, product, quotient, chain. Implicit differentiation handles equations where y is not isolated. Related rates differentiate with respect to time and substitute known values last.',
    workedExample: 'If y²=x+1, differentiate: 2y(dy/dx)=1 so dy/dx=1/(2y).',
    misconception: 'A derivative is the same as average rate of change. Average rate uses two points; derivative is the limit as the interval shrinks to 0.',
  },
  'calculus:calc_derivative_apps': {
    title: 'Applications of Derivatives',
    conceptText: 'Use f\' to analyze increasing/decreasing intervals and local extrema. Use f\'\' for concavity and inflection points. Optimization combines modeling + derivative tests. Mean Value Theorem connects average rate on [a,b] to an instantaneous rate at some c in (a,b).',
    workedExample: 'For f(x)=x²−4x+1, f\'=2x−4 gives critical point x=2. Since f\' changes from negative to positive, x=2 is a local minimum.',
    misconception: 'If f\'(c)=0 then c is automatically a max or min. It may also be neither (e.g., a flat inflection).',
  },
  'calculus:calc_integrals': {
    title: 'Integrals & Accumulation',
    conceptText: 'Indefinite integrals find antiderivatives (+C). Definite integrals represent signed accumulation. FTC links derivatives and integrals: d/dx ∫(from a to x)f(t)dt=f(x), and ∫(from a to b)f(x)dx=F(b)-F(a). Use u-substitution when the integrand is a composition.',
    workedExample: '∫(from 0 to 2) 3x dx = (3/2)x² | 0→2 = 6.',
    misconception: 'Definite integrals always equal geometric area. They give signed area (below-axis parts subtract).',
  },
  'calculus:calc_series': {
    title: 'Sequences & Series',
    conceptText: 'A sequence is an ordered list; a series is a sum of sequence terms. Geometric series converge when |r|<1. p-series Σ1/n^p converges when p>1. Ratio test helps with factorial/exponential terms. Taylor/Maclaurin polynomials approximate functions near a center.',
    workedExample: 'Σ(1/n²) converges because p=2>1.',
    misconception: 'If terms go to 0, the series must converge. Necessary but not sufficient (harmonic series diverges).',
  },
  'calculus:calc_advanced': {
    title: 'Advanced Calculus Modeling',
    conceptText: 'Differential equations model change, slope fields visualize solution behavior, and separable equations allow variable separation. Parametric and polar forms describe motion and geometry beyond y=f(x). Average value connects accumulated change to an equivalent constant rate.',
    workedExample: 'For y\'=ky, solution is y=Ce^(kt). If k<0, decay; if k>0, growth.',
    misconception: 'All differential equations have elementary closed-form solutions. Many require numerical or qualitative methods.',
  },
  'calculus:calc_c002': {
    title: 'L\'Hospital\'s Rule (Indeterminate Forms)',
    conceptText: 'L\'Hospital\'s Rule: if lim(x→a) f(x)/g(x) gives 0/0 or ∞/∞ and f,g are differentiable near a with g\'(x)≠0, then lim f/g = lim f\'/g\' (if that new limit exists). You may apply repeatedly when needed. It also works for x→∞ under the same conditions.',
    workedExample: 'lim(x→0)(1−cos x)/x² is 0/0. Differentiate top and bottom: lim(sin x)/(2x)=1/2.',
    misconception: 'Use L\'Hospital on any difficult limit. Convert first to 0/0 or ∞/∞; forms like 0·∞ or ∞−∞ need algebraic rewriting.',
  },
};

/**
 * Exponent rules reference (mathematically correct).
 * Use when displaying exponent rules in UI.
 */
export const EXPONENT_RULES = [
  { rule: 'Product (same base)', formula: 'a^m · a^n = a^(m+n)' },
  { rule: 'Quotient (same base)', formula: 'a^m ÷ a^n = a^(m−n)' },
  { rule: 'Power of a power', formula: '(a^m)^n = a^(mn)' },
  { rule: 'Zero exponent', formula: 'a^(0) = 1 (a ≠ 0)' },
  { rule: 'Negative exponent', formula: 'a^(−n) = (1)/(a^(n)) (a ≠ 0)' },
  { rule: 'Product to a power', formula: '(ab)^(n) = a^(n) · b^(n)' },
  { rule: 'Quotient to a power', formula: '((a)/(b))^(n) = (a^(n))/(b^(n)) (b ≠ 0)' },
];

/**
 * Get micro-concept for the current learning scope.
 * Priority: TEKS-specific → standard-specific → competency-level.
 * @param {number} [variantIndex=0] — rotate through variants (0 = base, 1+ = variants array)
 */
export function getMicroConcept(examId, compId, teks, standardId, variantIndex = 0) {
  if (!examId) return null;
  const keys = [];
  if (teks) keys.push(`${examId}:${teks}`);
  if (standardId) keys.push(`${examId}:${standardId}`);
  if (compId) keys.push(`${examId}:${compId}`);
  for (const key of keys) {
    const entry = MICRO_CONCEPTS[key];
    if (!entry) continue;
    if (variantIndex > 0 && entry.variants && entry.variants.length > 0) {
      const vi = ((variantIndex - 1) % entry.variants.length);
      const v = entry.variants[vi];
      return { title: entry.title, ...v };
    }
    return entry;
  }
  return null;
}
