/**
 * Micro-concepts for TExES competencies
 * Structure: 60–120 words, one worked example, one "watch out" misconception
 * All math notation uses ^ for exponents (formatMathHtml renders as superscript)
 * Key: examId:compId or examId:teks for EC-6
 * Optional illustrationHtml: safe HTML (img grid) rendered below conceptText where supported.
 */

import { euclideanCircleTheoremsFiguresHtml } from './euclideanCircleFigures';

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
    conceptText: 'Probability: P(A) = (favorable)/(total). Independent: P(A and B) = P(A)·P(B). Mean = (Σx)/(n); median = middle; mode = most frequent. Normal: ~68% within 1σ, ~95% within 2σ. Conditional: P(A|B) = (P(A∩B))/(P(B)).',
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

  // ── Standard-level entries (c001–c021) with variants ──
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
        misconception: 'A quadratic always has exactly two roots in ℂ (the complex numbers). When there are no real roots, the two roots are complex conjugates.' },
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
    conceptText: 'Exponential: f(x) = a·b^(x); a = initial value, b = growth factor (b > 1 growth, 0 < b < 1 decay). Transforms: y = a·b^(x−h) + k — shift h right, k up, vertical scale |a|, horizontal asymptote y = k. Logarithm: log_b(x) = y ⟺ b^(y) = x. Laws: log(ab) = log a + log b; log(a/b) = log a − log b; log(a^(n)) = n·log a. Change of base: log_b(x) = (ln x)/(ln b). Log transforms: y = a·log_b(x−h) + k — vertical asymptote x = h, domain x > h. Discrete compounding: A = P·(1 + r/n)^(nt). Continuous: A = P·e^(rt). Half-life (N = N₀·e^(kt), k < 0): (ln 2)/|k|.',
    workedExample: 'Solve 3^(x) = 81: 81 = 3^(4), so x = 4. Or: x = log_3(81) = (ln 81)/(ln 3) = 4.',
    misconception: 'The log of a sum has no simple rule: log(a+b) ≠ log a + log b. The product rule applies to multiplication: log(a·b) = log a + log b.',
    variants: [
      { conceptText: 'Exponential growth/decay: N(t) = N₀·e^(kt). k > 0 growth, k < 0 decay. Doubling time: (ln 2)/k when k > 0. Half-life: (ln 2)/|k| when k < 0. Logarithmic scales: Richter (earthquakes), decibels (sound), pH (acidity). The graph of y = log_b(x) is the reflection of y = b^(x) about the line y = x. Domain of log: x > 0; range: all reals.',
        workedExample: 'A population doubles every 5 years. k = (ln 2)/(5) ≈ 0.1386. After 15 years: N = N₀·e^(0.1386·15) = N₀·e^(2.079) ≈ 8N₀ (three doubling periods: 2^(3) = 8).',
        misconception: 'In exponential growth, the rate of change itself increases over time. What stays constant is the growth factor (the percentage increase per unit time), not the rate.' },
      { conceptText: 'Solving exponential equations: same base → set exponents equal; different bases → take ln of both sides. Solving log equations: convert to exponential form, solve, check domain. Natural log: ln x = log_e(x). Properties: ln(e^(x)) = x and e^(ln(x)) = x. Inverse relationship: exponential and log undo each other. Applications: carbon dating, bacterial growth, Newton\'s cooling law.',
        workedExample: 'Solve: log_2(x) + log_2(x−2) = 3. Combine: log_2(x(x−2)) = 3 → 2^(3) = x(x−2) → x²−2x = 8 → x²−2x−8 = 0 → (x−4)(x+2) = 0. x = 4 (x = −2 excluded: log of negative).',
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
    conceptText: 'Limit: lim(x→a) f(x) = L. Derivative: f′(x) = lim(h→0) [f(x+h)−f(x)]/(h); measures instantaneous rate of change. Power rule: d/dx[x^n] = nx^(n−1). Chain rule: d/dx[f(g(x))] = f′(g(x))·g′(x). Fundamental Theorem: ∫_a^b f(x)dx = F(b)−F(a) where F′=f. Applications: optimization (set f′=0), area under curve, related rates.',
    workedExample: 'f(x) = x³ − 3x. f′(x) = 3x² − 3 = 0 → x = ±1. f″(x) = 6x: min at x=1, max at x=−1.',
    misconception: 'The derivative of a product requires the product rule: (fg)′ = f′g + fg′. You cannot simply multiply the individual derivatives.',
    variants: [
      { conceptText: 'Integration: the reverse of differentiation. Indefinite: ∫x^n dx = x^(n+1)/(n+1) + C (n≠−1). Definite integral = signed area under curve. Fundamental Theorem Part 1: d/dx[∫_a^x f(t)dt] = f(x). Part 2: ∫_a^b f(x)dx = F(b)−F(a). Substitution (u-sub): reverse chain rule. Area between curves: ∫(top − bottom)dx.',
        workedExample: '∫_0^2 (3x²−2x)dx = [x³−x²]_0^2 = (8−4)−(0−0) = 4.',
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
      { conceptText: 'Circle theorems: tangent ⊥ radius at point of tangency. Two tangents from external point are equal length. Inscribed angle in semicircle = 90°. Chord–chord angle = (1)/(2)(sum of intercepted arcs). Secant–secant angle from outside = (1)/(2)(difference of intercepted arcs). Power of a point: for two chords, (segment₁)(segment₂) = (segment₃)(segment₄).',
        illustrationHtml: euclideanCircleTheoremsFiguresHtml,
        workedExample: 'Two chords intersect inside a circle. Segments: 3 and 8 on one chord, x and 4 on the other. 3·8 = x·4 → x = 6.',
        misconception: 'Only a diameter passes through the center of a circle. A chord is any segment whose endpoints lie on the circle — it does not need to pass through the center.' },
      { conceptText: 'Properties of quadrilaterals: parallelogram (opposite sides ‖ and ≅, opposite angles ≅, diagonals bisect each other); rectangle (parallelogram + right angles, diagonals ≅); rhombus (parallelogram + all sides ≅, diagonals ⊥); square (rectangle + rhombus). Trapezoid: exactly one pair of parallel sides. Midsegment = (1)/(2)(base₁ + base₂). Kite: two pairs of consecutive sides ≅.',
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
    variants: [
      { conceptText: 'Box plots display five-number summary: min, Q₁, median, Q₃, max. Whiskers extend to min/max (or to fences, with dots for outliers). Comparing distributions: side-by-side box plots or back-to-back stem plots. Z-scores: z = (x−μ)/(σ) tells how many SDs from the mean. Empirical rule (normal): 68% within 1σ, 95% within 2σ, 99.7% within 3σ.',
        workedExample: 'Score 82, mean 75, SD 5. z = (82−75)/5 = 1.4. About 92% of scores are below (from z-table).',
        misconception: 'A z-score of 2 means your score is 2 standard deviations above the mean — not twice the mean. Z-scores measure distance in SD units.' },
      { conceptText: 'Scatter plots show bivariate data. Correlation r: −1 (perfect negative linear), 0 (none), +1 (perfect positive linear). r² = proportion of variation explained by the linear model. Residuals = observed − predicted; a good model has randomly scattered residuals. Influential points: high leverage (extreme x) and/or large residual. Lurking variables can create apparent associations.',
        workedExample: 'Regression: ŷ = 2.3x + 10.5, r = 0.94, r² = 0.88. Interpretation: 88% of variation in y is explained by x.',
        misconception: 'r measures only linear correlation. A strong curved relationship can have r ≈ 0, so r = 0 does not mean "no relationship" — only no linear relationship.' },
    ],
  },
  'math712:c016': {
    title: 'Probability',
    conceptText: 'P(A) = (favorable)/(total), 0 ≤ P ≤ 1. Complement: P(A′) = 1−P(A). Addition: P(A∪B) = P(A)+P(B)−P(A∩B). Independent: P(A∩B) = P(A)·P(B). Conditional: P(A|B) = P(A∩B)/P(B). Permutations: P(n,r) = n!/(n−r)!. Combinations: C(n,r) = n!/(r!(n−r)!). Expected value: E(X) = ΣxᵢP(xᵢ).',
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

  'math48:comp001': {
    title: 'Number Concepts',
    conceptText: 'Place value: digit value depends on position. Equivalent fractions: (a)/(b) = (c)/(d) ⟺ ad = bc. Decimals: 0.375 = (3)/(8). PEMDAS for order of operations. LCM: highest power of each prime factor; GCF: lowest power of each common prime factor. Negative numbers: −(−a) = a; rules for +, −, ×.',
    workedExample: '(3)/(8) = (?)/(24). 8×3 = 24, so 3×3 = 9. Answer: (9)/(24).',
    misconception: 'Larger denominator always means smaller fraction. Only true for same numerator; (1)/(3) > (1)/(4).',
  },
  'math48:comp002': {
    title: 'Patterns and Algebra',
    conceptText: 'Patterns: find the rule (add, multiply, or both). Variables: unknowns. Equations: isolate using inverse operations. Inequalities: <, >, ≤, ≥; multiply by negative flips the sign. Functions: input → output; tables, graphs, equations.',
    workedExample: '3x + 7 = 22 → 3x = 15 → x = 5.',
    misconception: 'Treating inequalities like equations when multiplying by negative — the inequality flips.',
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
 * Priority: TEKS-specific -> standard-specific -> competency-level.
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
