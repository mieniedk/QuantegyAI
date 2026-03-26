/**
 * Micro-concepts for TExES competencies
 * Structure: 60–120 words, one worked example, one "watch out" misconception
 * All math notation uses ^ for exponents (formatMathHtml renders as superscript)
 * Key: examId:compId or examId:teks for EC-6
 */

export const MICRO_CONCEPTS = {
  // ═══════════════════════════════════════════════════════════════
  // Math 7–12 (math712)
  // ═══════════════════════════════════════════════════════════════

  // ── Competency-level fallbacks ──
  'math712:comp001': {
    title: 'Number Concepts',
    conceptText: 'Real numbers: rationals ((a)/(b), b≠0) and irrationals (π, √2). LCM: take the highest power of each prime factor; GCF: take the lowest power of each common prime factor. Exponent rules: a^m · a^n = a^(m+n); a^m ÷ a^n = a^(m−n); (a^m)^n = a^(mn); a^0 = 1 (a≠0); a^(−n) = (1)/(a^n). Radicals: √(ab) = √a·√b. Absolute value: |x−a| < b ⟺ −b < x−a < b.',
    workedExample: 'LCM(8,12): 8 = 2³, 12 = 2²×3. LCM = 2³×3 = 24. Also: 7^(−2) = (1)/(7²) = (1)/(49).',
    misconception: 'Product of two irrationals is always irrational. Counterexample: √2 · √2 = 2 (rational).',
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
    misconception: 'Area scales linearly with scale factor. Wrong — area scales by k². Double side → 4× area.',
  },
  'math712:comp004': {
    title: 'Probability and Statistics',
    conceptText: 'Probability: P(A) = (favorable)/(total). Independent: P(A and B) = P(A)·P(B). Mean = (Σx)/(n); median = middle; mode = most frequent. Normal: ~68% within 1σ, ~95% within 2σ. Conditional: P(A|B) = (P(A∩B))/(P(B)).',
    workedExample: 'P(5 on fair die) = (1)/(6). P(two 5s) = (1)/(6)·(1)/(6) = (1)/(36).',
    misconception: 'Correlation implies causation. Variables can be related without one causing the other.',
  },
  'math712:comp005': {
    title: 'Mathematical Processes',
    conceptText: 'Problem-solving: understand, plan, solve, check. Reasoning: conjectures, counterexamples, proofs. Communication: precise language, clear notation. Connections: algebra, geometry, real-world. Multiple representations: tables, graphs, equations.',
    workedExample: 'Disprove "all primes odd": 2 is prime and even. One counterexample suffices.',
    misconception: 'Verifying a pattern for a few cases proves it. Inductive reasoning needs proof or counterexample.',
  },
  'math712:comp006': {
    title: 'Mathematical Learning, Instruction & Assessment',
    conceptText: 'Effective math instruction uses formative assessment to guide decisions. Diagnostic items reveal misconceptions; exit tickets measure daily progress. Differentiation: scaffolded tasks, multiple entry points. Rubrics communicate expectations and align to TEKS standards.',
    workedExample: 'A student writes (3)/(4) + (1)/(2) = (4)/(6). The misconception is adding numerators and denominators separately — use common denominator: (3)/(4) + (2)/(4) = (5)/(4).',
    misconception: 'Formative and summative assessment serve the same purpose. Formative informs instruction in real time; summative measures achievement after instruction.',
  },

  // ── Standard-level entries (c001–c021) with variants ──
  // Each entry has a base concept plus a `variants` array. getMicroConcept
  // rotates through them so the user sees fresh content each visit.

  // Domain I — Number Concepts
  'math712:c001': {
    title: 'Real Number System',
    conceptText: 'Real numbers = rationals ∪ irrationals. Rationals: (a)/(b) with b≠0 (includes integers, terminating and repeating decimals). Irrationals: non-repeating, non-terminating (π, √2, e). Number line is complete — every point is a real number. Properties: commutative, associative, distributive, identity, inverse. Ordering: density — between any two reals there is another real.',
    workedExample: 'Show 0.3̄ is rational: let x = 0.333… → 10x = 3.333… → 9x = 3 → x = (1)/(3).',
    misconception: '√4 is irrational because it has a radical sign. Wrong — √4 = 2, which is rational. Only non-perfect-square roots are irrational.',
    variants: [
      { conceptText: 'Subsets of ℝ: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Closure: ℚ is closed under +, −, ×, ÷ (b ≠ 0). ℝ is closed under all four operations. The additive inverse of a is −a. The Multiplicative inverse of a (a ≠ 0) is (1)/(a). The distributive property, a(b + c) = ab + ac, links addition and multiplication. Absolute value: |a| = a if a ≥ 0, and |a| = −a if a < 0.',
        workedExample: 'Is √(50) rational? 50 is not a perfect square, so √(50) is irrational. Simplify: √(50) = √(25·2) = 5√2.',
        misconception: 'The sum of two irrationals is always irrational. Counterexample: (3+√2) + (3−√2) = 6 (rational).' },
      { conceptText: 'Decimal representations: terminating → rational (0.75 = (3)/(4)). Repeating → rational (0.16̅ = 0.1666… = (1)/(6)). Non-repeating, non-terminating → irrational (π, e). Every fraction can be written as a terminating or repeating decimal. To convert repeating: set x = decimal, multiply to shift, subtract. Density: between any two distinct reals there are infinitely many rationals and irrationals.',
        workedExample: 'Convert 0.27̄ to a fraction: x = 0.2777… → 10x = 2.777… → 10x − x = 2.5 → 9x = 2.5 → x = (5)/(18).',
        misconception: 'π = (22)/(7) exactly. Wrong — (22)/(7) is only an approximation (≈3.1429 vs. π ≈ 3.14159…). π is irrational and has no exact fraction.' },
    ],
  },
  'math712:c002': {
    title: 'Complex Numbers',
    conceptText: 'Complex: z = a + bi where i² = −1. Addition: (a+bi) + (c+di) = (a+c) + (b+d)i. Multiplication uses FOIL and i² = −1. Conjugate: z̄ = a − bi; z·z̄ = a² + b². Magnitude: |z| = √(a²+b²). Polar form: z = r(cos θ + i sin θ). Fundamental Theorem of Algebra: degree-n polynomial has exactly n roots (counting multiplicity) in ℂ.',
    workedExample: '(2+3i)(1−i) = 2 − 2i + 3i − 3i² = 2 + i + 3 = 5 + i.',
    misconception: 'i² = 1. Wrong — i² = −1 by definition. This sign error cascades through every complex multiplication.',
    variants: [
      { conceptText: 'Powers of i cycle: i^1 = i, i^2 = −1, i^3 = −i, i^4 = 1, then repeats. Division: multiply numerator and denominator by the conjugate. Polar multiplication: multiply magnitudes, add angles. De Moivre\'s Theorem: (r·cis θ)^n = r^n·cis(nθ). Roots: n-th roots of z give n equally spaced points on a circle of radius r^(1/n).',
        workedExample: 'Divide (3+4i)/(1−2i): multiply by (1+2i)/(1+2i) → (3+4i)(1+2i)/((1)²+(2)²) = (−5+10i)/(5) = −1+2i.',
        misconception: 'To divide complex numbers, just divide real and imaginary parts separately. Wrong — you must multiply by the conjugate of the denominator.' },
      { conceptText: 'The complex plane: real axis (horizontal), imaginary axis (vertical). Each z = a+bi is the point (a,b). Magnitude |z| = distance from origin. Argument arg(z) = angle from positive real axis. Euler\'s formula: e^(iθ) = cos θ + i sin θ. This connects exponential and trigonometric functions. Conjugate roots theorem: polynomial with real coefficients → complex roots come in conjugate pairs.',
        workedExample: 'x² + 4 = 0 → x² = −4 → x = ±2i. Both roots are conjugates: 2i and −2i.',
        misconception: 'A quadratic with no real roots has no roots at all. Wrong — it has two complex conjugate roots. The Fundamental Theorem guarantees degree-2 → exactly 2 roots in ℂ.' },
    ],
  },
  'math712:c003': {
    title: 'Number Theory',
    conceptText: 'Fundamental Theorem of Arithmetic: every integer > 1 has a unique prime factorization. GCF: lowest power of common primes; LCM: highest power of all primes. Euclidean algorithm: gcd(a,b) = gcd(b, a mod b). Divisibility rules speed factor finding. Modular arithmetic: a ≡ b (mod n) means n | (a−b). Combinations: C(n,k) = (n!)/(k!(n−k)!).',
    workedExample: 'gcd(48,18): 48 = 2·18 + 12; 18 = 1·12 + 6; 12 = 2·6 + 0. So gcd = 6.',
    misconception: '1 is a prime number. Wrong — primes have exactly two distinct factors (1 and themselves). 1 has only one factor.',
    variants: [
      { conceptText: 'Divisibility tests: by 2 → last digit even; by 3 → digit sum divisible by 3; by 9 → digit sum divisible by 9; by 4 → last two digits form a multiple of 4; by 6 → divisible by both 2 and 3. Prime factorization enables GCF/LCM. Permutations P(n,r) = n!/(n−r)!: order matters. Combinations C(n,r): order doesn\'t matter.',
        workedExample: 'Is 2,574 divisible by 6? Sum of digits: 2+5+7+4 = 18 (div by 3) and last digit 4 (even). Yes, divisible by 6.',
        misconception: 'If a number is divisible by 2 and by 6, it must be divisible by 12. Wrong — 6 is divisible by 2 and 6 but not 12. Check: LCM(2,6) = 6, not 12.' },
      { conceptText: 'Modular arithmetic: clock arithmetic. a ≡ b (mod n) means a and b have the same remainder when divided by n. Addition and multiplication preserve congruence. Fermat\'s Little Theorem: if p is prime and gcd(a,p)=1, then a^(p−1) ≡ 1 (mod p). Applications: cryptography (RSA), checksums, day-of-week calculations.',
        workedExample: 'What is 2^10 mod 7? 2^3 = 8 ≡ 1 (mod 7). So 2^10 = (2^3)^3 · 2^1 ≡ 1^3 · 2 = 2 (mod 7).',
        misconception: 'Modular arithmetic only works with primes. Wrong — it works with any positive integer modulus. Primes just give nicer algebraic properties (every nonzero element has an inverse).' },
    ],
  },

  // Domain II — Patterns and Algebra
  'math712:c004': {
    title: 'Patterns & Sequences',
    conceptText: 'Arithmetic sequence: aₙ = a₁ + (n−1)d; sum Sₙ = (n)/(2)(a₁+aₙ). Geometric sequence: aₙ = a₁·r^(n−1); sum Sₙ = a₁(1−r^n)/(1−r). Fibonacci: each term is sum of two preceding. Sigma notation: Σ compresses series. Mathematical induction: base case + inductive step proves ∀n. Finance: compound interest A = P(1 + (r)/(n))^(nt).',
    workedExample: 'Arithmetic: a₁ = 3, d = 5. a₂₀ = 3 + 19·5 = 98. S₂₀ = (20)/(2)(3+98) = 1010.',
    misconception: 'Confusing arithmetic and geometric: "adds 2 each time" is arithmetic (d=2), not geometric. Geometric multiplies by a fixed ratio.',
    variants: [
      { conceptText: 'Geometric series: finite Sₙ = a₁(1−r^n)/(1−r); infinite (|r|<1) S = a₁/(1−r). Recursive vs. explicit formulas: recursive defines aₙ in terms of previous terms; explicit gives aₙ directly from n. Sigma notation: Σ(k=1 to n) k = n(n+1)/2. Mathematical induction: prove P(1), then assume P(k) → prove P(k+1).',
        workedExample: 'Infinite geometric: a₁ = 12, r = (1)/(3). S = 12/(1−(1)/(3)) = 12/((2)/(3)) = 18.',
        misconception: 'An infinite series always diverges. Wrong — if |r| < 1, a geometric series converges to a finite sum.' },
      { conceptText: 'Recognizing sequence type: constant difference → arithmetic; constant ratio → geometric; neither → check Fibonacci, quadratic, or other patterns. Finance applications: simple interest I = Prt; compound A = P(1+(r)/(n))^(nt); continuous A = Pe^(rt). Annuities use geometric series. Recursion in CS: loops and recursive functions model sequences directly.',
        workedExample: 'Sequence: 2, 6, 18, 54… Ratio = 3 (geometric). a₁₀ = 2·3^9 = 2·19683 = 39366.',
        misconception: 'Compound interest is just simple interest applied many times. Wrong — compound interest earns interest on previous interest, causing exponential (not linear) growth.' },
    ],
  },
  'math712:c005': {
    title: 'Functions, Relations & Graphs',
    conceptText: 'Function: each input has exactly one output. Vertical line test checks if a graph is a function. Domain: set of valid inputs; Range: set of outputs. Composition: (f∘g)(x) = f(g(x)). Inverse: f^(−1) reverses f; exists only if f is one-to-one (horizontal line test). Transformations: y = a·f(x−h)+k shifts h right, k up, stretches by |a|, reflects if a < 0.',
    workedExample: 'f(x) = 2x+1, g(x) = x². (f∘g)(3) = f(9) = 19. f^(−1)(x) = (x−1)/(2).',
    misconception: 'f^(−1)(x) means (1)/(f(x)). Wrong — f^(−1) is the inverse function, not the reciprocal. (1)/(f(x)) is [f(x)]^(−1).',
    variants: [
      { conceptText: 'Parent functions: linear y=x, quadratic y=x², cubic y=x³, absolute y=|x|, square root y=√x, reciprocal y=1/x. Transformations from parent: y = a·f(b(x−h))+k. |a| vertical stretch, 1/|b| horizontal stretch, h right shift, k up shift. If a<0 reflect over x-axis; if b<0 reflect over y-axis. Even functions: f(−x)=f(x) (symmetric about y-axis). Odd: f(−x)=−f(x) (rotational symmetry about origin).',
        workedExample: 'y = −2(x+3)² + 5: parent y=x², shift left 3, up 5, vertical stretch ×2, reflected over x-axis. Vertex (−3,5), opens down.',
        misconception: 'All transformations are commutative — order doesn\'t matter. Wrong — applying a horizontal shift then a stretch gives a different result than stretch then shift (inside vs. outside the function).' },
      { conceptText: 'Piecewise functions: different rules on different intervals of the domain. Graph by plotting each piece on its interval. Continuity: no breaks in the graph. Step functions (greatest integer) are piecewise. Composition is not commutative: f∘g ≠ g∘f in general. To find domain of f∘g: start with domain of g, then restrict to where g(x) is in the domain of f.',
        workedExample: 'f(x) = √x, g(x) = 4−x². Domain of f∘g: need 4−x² ≥ 0 → −2 ≤ x ≤ 2. (f∘g)(1) = √(4−1) = √3.',
        misconception: 'f(g(x)) and g(f(x)) are the same. Wrong — composition is not commutative. f(g(2)) and g(f(2)) generally give different values.' },
    ],
  },
  'math712:c006': {
    title: 'Linear & Quadratic Functions',
    conceptText: 'Linear: y = mx + b; slope m = (y₂−y₁)/(x₂−x₁); parallel lines have equal slopes; perpendicular slopes multiply to −1. Systems: substitution, elimination, or matrices. Quadratic: standard ax²+bx+c, vertex a(x−h)²+k, factored a(x−r₁)(x−r₂). Discriminant Δ = b²−4ac: Δ>0 two real roots, Δ=0 one, Δ<0 two complex.',
    workedExample: 'Solve x²−5x+6 = 0: factors (x−2)(x−3) = 0, so x = 2 or x = 3. Vertex: h = (5)/(2), k = −(1)/(4).',
    misconception: 'Vertex (h,k) sign confusion: f(x) = (x−2)²−3 has vertex (2,−3), not (−2,3). The h in (x−h) is positive when the graph shifts right.',
    variants: [
      { conceptText: 'Systems of equations: substitution (solve one variable, plug into other), elimination (add/subtract to cancel a variable), matrices (row reduction or Cramer\'s rule). Consistent = at least one solution; inconsistent = no solution; dependent = infinitely many. Linear inequalities: shade above (>) or below (<); system = intersection of shaded regions.',
        workedExample: '2x + y = 7, x − y = 2. Add: 3x = 9, x = 3, y = 1. Check: 2(3)+1 = 7 ✓, 3−1 = 2 ✓.',
        misconception: 'Parallel lines form an inconsistent system with one solution. Wrong — parallel lines (same slope, different intercept) never intersect, so NO solution (inconsistent).' },
      { conceptText: 'Completing the square: x² + bx → (x + (b)/(2))² − ((b)/(2))². Converts standard to vertex form. Quadratic formula: x = (−b ± √(b²−4ac))/(2a). Applications: projectile motion h(t) = −16t² + v₀t + h₀, maximum height at vertex. Axis of symmetry: x = −b/(2a). Factoring patterns: difference of squares a²−b² = (a+b)(a−b); perfect square trinomial.',
        workedExample: 'x² + 6x + 2 = 0. Complete the square: (x+3)² − 9 + 2 = 0 → (x+3)² = 7 → x = −3 ± √7.',
        misconception: 'The quadratic formula only works when you can\'t factor. Wrong — it always works for any quadratic. Factoring is just faster when possible.' },
    ],
  },
  'math712:c007': {
    title: 'Polynomial, Rational, Radical & Piecewise Functions',
    conceptText: 'Polynomial degree n has at most n zeros and n−1 turning points. Rational: f(x) = p(x)/q(x); vertical asymptotes where q(x)=0 (simplified); horizontal asymptote from leading term comparison. Radical: domain restricted to keep radicand ≥ 0 (even index). Piecewise: different rules on different intervals. Factor theorem: (x−c) is a factor iff f(c) = 0.',
    workedExample: 'f(x) = (x+1)/((x−2)(x+3)). Vertical asymptotes: x = 2, x = −3. Horizontal: y = 0 (degree bottom > top).',
    misconception: 'Cancelling a factor removes the asymptote. Partially true — it becomes a hole, not an asymptote, but the function is still undefined there.',
    variants: [
      { conceptText: 'End behavior of polynomials: even degree with positive leading coeff → both ends up; odd degree positive → left down, right up. Rational zeros theorem: possible rational roots = ±(factors of constant)/(factors of leading coefficient). Synthetic division: quick polynomial ÷ (x−c). Remainder theorem: f(c) = remainder when f(x) ÷ (x−c). Descartes\' Rule of Signs counts possible positive/negative real zeros.',
        workedExample: 'f(x) = 2x³ − 3x² − 8x + 12. Possible rational roots: ±1, ±2, ±3, ±4, ±6, ±12, ±(1)/(2), ±(3)/(2). Test x=2: f(2)=0. Factor: (x−2)(2x²+x−6) = (x−2)(2x−3)(x+2).',
        misconception: 'A degree-5 polynomial always has 5 x-intercepts. Wrong — it has at most 5 real zeros, but some may be complex (non-real) or repeated.' },
      { conceptText: 'Radical equations: isolate the radical, raise both sides to the index power, check for extraneous solutions. Rational equations: multiply by LCD, solve, exclude values that make original denominator zero. Piecewise functions: evaluate by finding which interval x falls in, then use that piece\'s rule. Absolute value equations |f(x)| = k → f(x) = k or f(x) = −k.',
        workedExample: '√(x+3) = x−1. Square both sides: x+3 = x²−2x+1 → x²−3x−2 = 0 → x = (3±√17)/(2). Check: only x ≈ 3.56 works; x ≈ −0.56 is extraneous.',
        misconception: 'Squaring both sides of an equation preserves all solutions. Wrong — it can introduce extraneous solutions. Always check answers in the original equation.' },
    ],
  },
  'math712:c008': {
    title: 'Exponential & Logarithmic Functions',
    conceptText: 'Exponential: f(x) = a·b^x; growth if b > 1, decay if 0 < b < 1. Logarithm: log_b(x) = y ⟺ b^y = x. Laws: log(ab) = log a + log b; log(a/b) = log a − log b; log(a^n) = n·log a. Change of base: log_b(x) = (ln x)/(ln b). Compound interest: A = Pe^(rt) (continuous). Half-life: t_(1/2) = (ln 2)/(k).',
    workedExample: 'Solve 3^x = 81: 81 = 3^4, so x = 4. Or: x = log₃(81) = (ln 81)/(ln 3) = 4.',
    misconception: 'log(a+b) = log a + log b. Wrong — the log of a sum has no simple rule. The product rule is log(a·b) = log a + log b.',
    variants: [
      { conceptText: 'Exponential growth/decay: N(t) = N₀·e^(kt). k > 0 growth, k < 0 decay. Doubling time: t_d = (ln 2)/(k). Half-life: t_(1/2) = (ln 2)/(|k|). Logarithmic scales: Richter (earthquakes), decibels (sound), pH (acidity). The graph of y = log_b(x) is the reflection of y = b^x over y = x. Domain of log: x > 0; range: all reals.',
        workedExample: 'A population doubles every 5 years. k = (ln 2)/(5) ≈ 0.1386. After 15 years: N = N₀·e^(0.1386·15) = N₀·e^(2.079) ≈ 8N₀ (tripled the doublings: 2³ = 8).',
        misconception: 'Exponential growth means the rate is constant. Wrong — the rate of change itself increases. What\'s constant is the growth factor (percentage increase per unit time).' },
      { conceptText: 'Solving exponential equations: same base → set exponents equal; different bases → take ln of both sides. Solving log equations: convert to exponential form, solve, check domain. Natural log: ln x = log_e(x). Properties: ln(e^x) = x and e^(ln x) = x. Inverse relationship: exponential and log undo each other. Applications: carbon dating, bacterial growth, Newton\'s cooling law.',
        workedExample: 'Solve: log₂(x) + log₂(x−2) = 3. Combine: log₂(x(x−2)) = 3 → x²−2x = 8 → x²−2x−8 = 0 → (x−4)(x+2) = 0. x = 4 (x = −2 excluded: log of negative).',
        misconception: 'ln(0) = 0. Wrong — ln(0) is undefined (−∞ as a limit). ln(1) = 0 because e^0 = 1.' },
    ],
  },
  'math712:c009': {
    title: 'Trigonometric & Circular Functions',
    conceptText: 'Unit circle: (cos θ, sin θ). SOH-CAH-TOA: sin = opp/hyp, cos = adj/hyp, tan = opp/adj. Key identities — Pythagorean: sin²θ + cos²θ = 1; tan²θ + 1 = sec²θ; 1 + cot²θ = csc²θ. Reciprocal: csc θ = 1/sin θ; sec θ = 1/cos θ; cot θ = 1/tan θ. Quotient: tan θ = sin θ/cos θ; cot θ = cos θ/sin θ. Double angle: sin(2θ) = 2 sin θ cos θ; cos(2θ) = cos²θ − sin²θ. Sum/difference: sin(A±B) = sin A cos B ± cos A sin B; cos(A±B) = cos A cos B ∓ sin A sin B. Law of Sines: a/sin A = b/sin B = c/sin C. Law of Cosines: c² = a² + b² − 2ab cos C.',
    workedExample: 'Verify: tan²θ + 1 = sec²θ. Start with sin²θ + cos²θ = 1. Divide by cos²θ: (sin²θ)/(cos²θ) + 1 = (1)/(cos²θ) → tan²θ + 1 = sec²θ ✓.',
    misconception: 'sin(A+B) = sin A + sin B. Wrong — the correct formula is sin(A+B) = sin A cos B + cos A sin B. Trig functions of sums are NOT the sum of trig functions.',
    variants: [
      { conceptText: 'Special angles to memorize: sin(0)=0, sin(30°)=(1)/(2), sin(45°)=(√2)/(2), sin(60°)=(√3)/(2), sin(90°)=1. Cosine is the reverse order. Reference angles: for any angle in standard position, find the acute angle to the x-axis, then apply the sign from the quadrant (All Students Take Calculus). Radian conversion: degrees × (π)/(180) = radians.',
        workedExample: 'Find sin(240°). Reference angle: 240°−180° = 60°. Quadrant III → sin is negative. sin(240°) = −sin(60°) = −(√3)/(2).',
        misconception: 'sin(2θ) = 2·sin(θ). Wrong — use the double-angle formula: sin(2θ) = 2·sin(θ)·cos(θ). Trig functions are not linear.' },
      { conceptText: 'Trig identities: sin²θ+cos²θ = 1; tan²θ+1 = sec²θ; 1+cot²θ = csc²θ. Double angle: sin(2θ) = 2sinθcosθ; cos(2θ) = cos²θ−sin²θ = 2cos²θ−1 = 1−2sin²θ. Sum/difference: sin(A±B) = sinAcosB ± cosAsinB. Verifying identities: work one side to match the other using known identities. These are essential for simplifying expressions and solving trig equations.',
        workedExample: 'Verify: (sin²θ)/(1−cosθ) = 1+cosθ. Numerator = 1−cos²θ = (1−cosθ)(1+cosθ). Cancel (1−cosθ): result = 1+cosθ ✓.',
        misconception: 'You can cancel sin from both sides of sin(A) = sin(B) to get A = B. Wrong — sin(A)=sin(B) means A = B+2kπ OR A = π−B+2kπ. Multiple solution families exist.' },
    ],
  },
  'math712:c010': {
    title: 'Calculus Concepts',
    conceptText: 'Limit: lim(x→a) f(x) = L. Derivative: f′(x) = lim(h→0) [f(x+h)−f(x)]/(h); measures instantaneous rate of change. Power rule: d/dx[x^n] = nx^(n−1). Chain rule: d/dx[f(g(x))] = f′(g(x))·g′(x). Fundamental Theorem: ∫_a^b f(x)dx = F(b)−F(a) where F′=f. Applications: optimization (set f′=0), area under curve, related rates.',
    workedExample: 'f(x) = x³ − 3x. f′(x) = 3x² − 3 = 0 → x = ±1. f″(x) = 6x: min at x=1, max at x=−1.',
    misconception: 'The derivative of a product is the product of derivatives. Wrong — use the product rule: (fg)′ = f′g + fg′.',
    variants: [
      { conceptText: 'Integration: the reverse of differentiation. Indefinite: ∫x^n dx = x^(n+1)/(n+1) + C (n≠−1). Definite integral = signed area under curve. Fundamental Theorem Part 1: d/dx[∫_a^x f(t)dt] = f(x). Part 2: ∫_a^b f(x)dx = F(b)−F(a). Substitution (u-sub): reverse chain rule. Area between curves: ∫(top − bottom)dx.',
        workedExample: '∫_0^2 (3x²−2x)dx = [x³−x²]_0^2 = (8−4)−(0−0) = 4.',
        misconception: 'The integral of 1/x is ln(x). Close but incomplete — it\'s ln|x| + C. The absolute value matters because ln is only defined for positive arguments.' },
      { conceptText: 'Continuity: f is continuous at a if lim(x→a) f(x) = f(a). Differentiability implies continuity (but not vice versa). Mean Value Theorem: if f is continuous on [a,b] and differentiable on (a,b), then ∃c in (a,b) with f′(c) = (f(b)−f(a))/(b−a). Related rates: differentiate an equation with respect to time, substitute known rates. L\'Hôpital\'s Rule: 0/0 or ∞/∞ → differentiate top and bottom.',
        workedExample: 'Balloon: V = (4)/(3)πr³. dV/dt = 4πr²·dr/dt. If dr/dt = 2 cm/s when r = 5: dV/dt = 4π(25)(2) = 200π cm³/s.',
        misconception: 'A function with a vertical tangent is not differentiable there. Correct — but a function with a cusp (like |x| at x=0) is continuous yet not differentiable, showing that continuity ≠ differentiability.' },
    ],
  },

  // Domain III — Geometry and Measurement
  'math712:c011': {
    title: 'Measurement — Area & Volume Formulas',
    conceptText: 'Area formulas — Rectangle: A = lw. Triangle: A = (1)/(2)bh. Circle: A = πr². Parallelogram: A = bh. Trapezoid: A = (1)/(2)(b₁+b₂)h. Volume formulas — Rectangular prism: V = lwh. Cylinder: V = πr²h. Cone: V = (1)/(3)πr²h. Sphere: V = (4)/(3)πr³. Surface area: add all face areas. Scaling: lengths × k → areas × k², volumes × k³.',
    workedExample: 'Cylinder r=3, h=10: V = π(9)(10) = 90π ≈ 282.7. Surface area = 2πr² + 2πrh = 18π + 60π = 78π ≈ 245.0.',
    misconception: 'Doubling all dimensions doubles the volume. Wrong — volume scales by k³, so doubling gives 2³ = 8 times the volume.',
    variants: [
      { conceptText: 'Composite figures — Break a complex shape into simpler pieces (rectangles, triangles, circles). Find each area or volume, then add them. For holes or cut-outs, subtract the removed part. Heron\'s formula finds triangle area from three sides: s = (a+b+c)/(2), then A = √(s(s−a)(s−b)(s−c)). Unit conversions: multiply by conversion fractions. For area units, square the linear factor (1 m² = 10,000 cm²). For volume units, cube it (1 m³ = 1,000,000 cm³).',
        workedExample: 'Triangle sides 5, 6, 7. s = (5+6+7)/(2) = 9. A = √(9·4·3·2) = √216 = 6√6 ≈ 14.7 square units.',
        misconception: 'To convert square meters to square centimeters, multiply by 100. Wrong — 1 m = 100 cm, so 1 m² = (100)² = 10,000 cm². Areas use the square of the linear conversion factor.' },
      { conceptText: 'Surface area & volume of round solids — Sphere: SA = 4πr², V = (4)/(3)πr³. Cone: lateral SA = πrl (l = slant height = √(r²+h²)), total SA = πrl + πr². Cylinder: SA = 2πr² + 2πrh, V = πr²h. Cavalieri\'s Principle: two solids with equal cross-sectional areas at every height have the same volume. Cross-sections: slicing a cylinder parallel to the base gives a circle; slicing a cone gives a circle, ellipse, parabola, or hyperbola depending on angle.',
        workedExample: 'Sphere r=6: V = (4)/(3)π(216) = 288π ≈ 904.8. SA = 4π(36) = 144π ≈ 452.4.',
        misconception: 'Surface area and volume scale the same way. Wrong — SA scales by k² and volume by k³. Double all dimensions: SA × 4, volume × 8.' },
      { conceptText: 'Circle measurement — Circumference: C = 2πr = πd. Area: A = πr². Arc length (part of circumference): s = rθ, where θ is in radians. Sector area (pizza slice): A = (1)/(2)r²θ. Converting degrees to radians: multiply by π/(180). A full circle has 2π radians = 360°. Segment area (region between a chord and its arc) = sector area − triangle area.',
        workedExample: 'Circle r=10, central angle 60° = π/(3) rad. Arc length = 10·π/(3) ≈ 10.47. Sector area = (1)/(2)(100)(π)/(3) ≈ 52.4.',
        misconception: 'Arc length = rθ works with degrees. Wrong — θ must be in radians. Convert first: 60° × π/(180) = π/(3).' },
    ],
  },
  'math712:c012': {
    title: 'Euclidean Geometry — Axiomatic Systems',
    conceptText: 'Axioms (postulates) are accepted without proof; theorems are proved from axioms. Parallel postulate distinguishes Euclidean from non-Euclidean geometry. Congruence (SSS, SAS, ASA, AAS, HL) and similarity (AA, SAS~, SSS~). Constructions: compass and straightedge. Vertical angles are congruent; supplementary angles sum to 180°; complementary sum to 90°.',
    workedExample: 'Prove: vertical angles are congruent. ∠1 + ∠2 = 180° and ∠2 + ∠3 = 180° → ∠1 = ∠3.',
    misconception: 'SSA (side-side-angle) is a valid congruence theorem. Wrong — SSA is ambiguous (two possible triangles), so it does not guarantee congruence.',
    variants: [
      { conceptText: 'Non-Euclidean geometry: change the parallel postulate. Hyperbolic: through a point not on a line, infinitely many parallels; triangle angles sum < 180°. Elliptic (spherical): no parallel lines exist; triangle angles sum > 180°. Constructions: bisect angle, perpendicular bisector, copy segment — all compass and straightedge. Proofs: two-column (statement/reason), paragraph, flow chart.',
        workedExample: 'On a sphere, a triangle with three 90° angles exists (one-eighth of the sphere). Angle sum = 270° > 180°. This is impossible in Euclidean geometry.',
        misconception: 'Euclidean geometry is the only "correct" geometry. Wrong — non-Euclidean geometries are equally valid and describe curved spaces like Earth\'s surface or spacetime.' },
      { conceptText: 'Similarity: same shape, possibly different size. AA criterion: two pairs of congruent angles → similar triangles. SAS~ and SSS~ also work. Similar triangles → sides proportional: (a)/(a\') = (b)/(b\') = (c)/(c\') = k. Corresponding altitudes, medians, and angle bisectors are also proportional by k. Areas scale by k²; volumes by k³. CPCTC: corresponding parts of congruent triangles are congruent (used after proving congruence).',
        workedExample: 'Triangles with sides 3,4,5 and 6,8,10. Ratios: 6/3 = 8/4 = 10/5 = 2 → similar by SSS~ with k = 2. Area ratio = 4.',
        misconception: 'Congruent triangles must face the same direction. Wrong — congruent means same shape and size regardless of orientation. One may be reflected or rotated relative to the other.' },
    ],
  },
  'math712:c013': {
    title: 'Euclidean Geometry — Results & Applications',
    conceptText: 'Triangle angle sum = 180°. Exterior angle = sum of remote interior angles. Quadrilateral angle sum = 360°. Polygon interior sum = (n−2)·180°. Circle: central angle = intercepted arc; inscribed angle = (1)/(2) arc. Arc length = rθ (radians). Sector area = (1)/(2)r²θ. Similar triangles: corresponding sides proportional, angles equal.',
    workedExample: 'Inscribed angle intercepts a 100° arc → inscribed angle = 50°. Regular octagon: interior angle = (6·180°)/(8) = 135°.',
    misconception: 'An inscribed angle equals its arc. Wrong — an inscribed angle is half the intercepted arc. A central angle equals the arc.',
    variants: [
      { conceptText: 'Circle theorems: tangent ⊥ radius at point of tangency. Two tangents from external point are equal length. Inscribed angle in semicircle = 90°. Chord–chord angle = (1)/(2)(sum of intercepted arcs). Secant–secant angle from outside = (1)/(2)(difference of intercepted arcs). Power of a point: for two chords, (segment₁)(segment₂) = (segment₃)(segment₄).',
        workedExample: 'Two chords intersect inside a circle. Segments: 3 and 8 on one chord, x and 4 on the other. 3·8 = x·4 → x = 6.',
        misconception: 'A chord always passes through the center. Wrong — only a diameter passes through the center. A chord is any segment with both endpoints on the circle.' },
      { conceptText: 'Properties of quadrilaterals: parallelogram (opposite sides ‖ and ≅, opposite angles ≅, diagonals bisect each other); rectangle (parallelogram + right angles, diagonals ≅); rhombus (parallelogram + all sides ≅, diagonals ⊥); square (rectangle + rhombus). Trapezoid: exactly one pair of parallel sides. Midsegment = (1)/(2)(base₁ + base₂). Kite: two pairs of consecutive sides ≅.',
        workedExample: 'Prove ABCD is a parallelogram: show AB ‖ CD and AB = CD (one pair of sides both parallel and equal suffices).',
        misconception: 'A rhombus is always a square. Wrong — a rhombus has all sides equal but angles need not be 90°. A square is a special rhombus (with right angles).' },
    ],
  },
  'math712:c014': {
    title: 'Coordinate, Transformational & Vector Geometry',
    conceptText: 'Distance: d = √((x₂−x₁)²+(y₂−y₁)²). Midpoint: ((x₁+x₂)/(2),(y₁+y₂)/(2)). Conic sections: circle (x−h)²+(y−k)²=r²; ellipse, parabola, hyperbola. Transformations: translation (slide), reflection (flip), rotation (turn), dilation (scale). Compositions of transformations. Vectors: magnitude, direction, addition, scalar multiplication, dot product.',
    workedExample: 'Reflect (3,4) over y-axis → (−3,4). Rotate 90° CCW about origin: (x,y) → (−y,x), so (3,4) → (−4,3).',
    misconception: 'Dilation preserves distances. Wrong — dilation preserves angles and shape (similarity), but scales all distances by the factor k.',
    variants: [
      { conceptText: 'Conic sections from general form Ax²+Bxy+Cy²+Dx+Ey+F=0. Circle: A=C, B=0. Ellipse: AC>0, A≠C. Parabola: AC=0 (one squared term). Hyperbola: AC<0. Standard forms: ellipse ((x−h)²)/(a²) + ((y−k)²)/(b²) = 1; hyperbola ((x−h)²)/(a²) − ((y−k)²)/(b²) = 1. Foci, vertices, asymptotes characterize each conic.',
        workedExample: '4x²+9y²=36 → (x²)/(9)+(y²)/(4)=1. Ellipse: a=3 (horizontal), b=2 (vertical). c=√(9−4)=√5. Foci at (±√5, 0).',
        misconception: 'The foci of an ellipse are at the endpoints of the major axis. Wrong — foci are inside the ellipse on the major axis. Vertices are at the endpoints.' },
      { conceptText: 'Vectors: v = ⟨a,b⟩. Magnitude: |v| = √(a²+b²). Unit vector: v/|v|. Addition: ⟨a,b⟩+⟨c,d⟩ = ⟨a+c,b+d⟩. Scalar multiplication: k⟨a,b⟩ = ⟨ka,kb⟩. Dot product: u·v = a₁a₂+b₁b₂ = |u||v|cos θ. Perpendicular ⟺ u·v = 0. Transformation matrices: rotation by θ → [[cos θ, −sin θ],[sin θ, cos θ]]. Isometries preserve distance; similarities preserve shape.',
        workedExample: 'u = ⟨3,4⟩, v = ⟨−4,3⟩. u·v = (3)(−4)+(4)(3) = 0 → perpendicular. |u| = |v| = 5.',
        misconception: 'Vector addition is the same as multiplying the magnitudes. Wrong — vectors add component-by-component. The magnitude of the sum depends on the angle between them (parallelogram law).' },
    ],
  },

  // Domain IV — Probability and Statistics
  'math712:c015': {
    title: 'Data Analysis',
    conceptText: 'Central tendency: mean (balance point), median (middle value), mode (most frequent). Spread: range, IQR = Q₃−Q₁, variance = Σ(xᵢ−x̄)²/(n−1), standard deviation = √variance. Displays: histogram (frequency), box plot (five-number summary), scatter plot (bivariate). Skewness: right-skewed → mean > median; left-skewed → mean < median. Outliers: beyond Q₁−1.5·IQR or Q₃+1.5·IQR.',
    workedExample: 'Data: 2,3,5,7,11. Mean = 28/5 = 5.6. Median = 5. No outliers (IQR = 7−3 = 4; fences at −3 and 13).',
    misconception: 'Mean is always the best measure of center. Wrong — median is more resistant to outliers and better for skewed data.',
    variants: [
      { conceptText: 'Box plots display five-number summary: min, Q₁, median, Q₃, max. Whiskers extend to min/max (or to fences, with dots for outliers). Comparing distributions: side-by-side box plots or back-to-back stem plots. Z-scores: z = (x−μ)/(σ) tells how many SDs from the mean. Empirical rule (normal): 68% within 1σ, 95% within 2σ, 99.7% within 3σ.',
        workedExample: 'Score 82, mean 75, SD 5. z = (82−75)/5 = 1.4. About 92% of scores are below (from z-table).',
        misconception: 'A z-score of 2 means you scored twice the average. Wrong — it means your score is 2 standard deviations above the mean, not 2× the mean.' },
      { conceptText: 'Scatter plots show bivariate data. Correlation r: −1 (perfect negative linear), 0 (none), +1 (perfect positive linear). r² = proportion of variation explained by the linear model. Residuals = observed − predicted; a good model has randomly scattered residuals. Influential points: high leverage (extreme x) and/or large residual. Lurking variables can create apparent associations.',
        workedExample: 'Regression: ŷ = 2.3x + 10.5, r = 0.94, r² = 0.88. Interpretation: 88% of variation in y is explained by x.',
        misconception: 'r = 0 means no relationship between x and y. Wrong — r measures only linear correlation. A strong curved relationship can have r near 0.' },
    ],
  },
  'math712:c016': {
    title: 'Probability',
    conceptText: 'P(A) = (favorable)/(total), 0 ≤ P ≤ 1. Complement: P(A′) = 1−P(A). Addition: P(A∪B) = P(A)+P(B)−P(A∩B). Independent: P(A∩B) = P(A)·P(B). Conditional: P(A|B) = P(A∩B)/P(B). Permutations: P(n,r) = n!/(n−r)!. Combinations: C(n,r) = n!/(r!(n−r)!). Expected value: E(X) = ΣxᵢP(xᵢ).',
    workedExample: 'Draw 2 cards without replacement: P(both aces) = (4/52)·(3/51) = 12/2652 = 1/221.',
    misconception: 'P(A or B) = P(A) + P(B) always. Wrong — you must subtract P(A∩B) to avoid double-counting unless A and B are mutually exclusive.',
    variants: [
      { conceptText: 'Bayes\' Theorem: P(A|B) = P(B|A)·P(A)/P(B). Useful for "reverse" conditional probability. Tree diagrams organize multi-stage experiments. Binomial distribution: P(X=k) = C(n,k)·p^k·(1−p)^(n−k) for n independent trials with success probability p. Expected value of binomial: np. Geometric distribution: P(X=k) = (1−p)^(k−1)·p for trials until first success.',
        workedExample: 'Fair coin, 10 flips. P(exactly 7 heads) = C(10,7)·(0.5)^7·(0.5)^3 = 120/1024 ≈ 0.117.',
        misconception: 'After 5 tails in a row, heads is "due." Wrong — each coin flip is independent. Past results don\'t affect future probability. This is the gambler\'s fallacy.' },
      { conceptText: 'Normal distribution: bell curve, symmetric about μ. Standard normal: μ=0, σ=1. Z-score converts any normal to standard: z = (x−μ)/σ. Using z-tables or calculator: P(a < X < b) = area under curve between a and b. For large samples, many distributions approximate normal (Central Limit Theorem). Expected value: E(X) = ΣxP(x) for discrete; E(aX+b) = aE(X)+b.',
        workedExample: 'Heights: μ=170cm, σ=8cm. P(height > 186) = P(Z > 2) ≈ 0.0228, or about 2.3%.',
        misconception: 'All data follows a normal distribution. Wrong — many real datasets are skewed, bimodal, or uniform. Always check the shape before applying normal-curve rules.' },
    ],
  },
  'math712:c017': {
    title: 'Statistical Inference',
    conceptText: 'Sampling distribution: distribution of a statistic over many samples. Central Limit Theorem: sample means → normal as n increases, regardless of population shape. Confidence interval: point estimate ± margin of error. Hypothesis testing: H₀ (null) vs. Hₐ; p-value < α → reject H₀. Regression: ŷ = a+bx; r measures linear correlation strength (−1 to 1). Residual = observed − predicted.',
    workedExample: '95% CI for mean: x̄ ± 1.96·(σ/√n). If x̄=50, σ=10, n=25: 50 ± 1.96·2 = (46.08, 53.92).',
    misconception: 'A 95% CI means 95% chance the true mean is in this interval. Wrong — the true mean is fixed; 95% of such intervals (across repeated sampling) would contain it.',
    variants: [
      { conceptText: 'Type I error: rejecting H₀ when it\'s true (false positive); probability = α. Type II error: failing to reject H₀ when it\'s false (false negative); probability = β. Power = 1−β. Increase power by: increasing n, increasing α, larger effect size. P-value: probability of getting a result at least as extreme as observed, assuming H₀ is true. Small p-value → strong evidence against H₀.',
        workedExample: 'Test H₀: μ = 100 vs. Hₐ: μ > 100. Sample: x̄ = 104, σ = 15, n = 36. z = (104−100)/(15/6) = 1.6. P-value ≈ 0.055. At α = 0.05, fail to reject H₀ (barely).',
        misconception: 'P-value is the probability that H₀ is true. Wrong — p-value is the probability of the observed data (or more extreme) given H₀ is true. It says nothing about the probability of H₀ itself.' },
      { conceptText: 'Experiment design: randomization (random assignment to groups), replication (enough subjects for reliable results), control (comparison group), blinding (reduce bias). Observational studies can show association but not causation. Confounding variable: related to both explanatory and response variable. Stratified sampling: divide population into strata, sample from each. Systematic, cluster, and convenience sampling each have trade-offs.',
        workedExample: 'Drug trial: randomly assign 200 patients to treatment or placebo (100 each). Double-blind: neither patients nor doctors know which group. Compare outcomes → can infer causation.',
        misconception: 'Large sample size guarantees no bias. Wrong — a biased sampling method (e.g., voluntary response) produces biased results regardless of size. Randomization is what reduces bias.' },
    ],
  },

  // Domain V — Mathematical Processes and Perspectives
  'math712:c018': {
    title: 'Mathematical Reasoning & Problem Solving',
    conceptText: 'Inductive reasoning: observe patterns → form conjecture. Deductive reasoning: apply known rules → prove conclusion. Direct proof: assume premises, derive conclusion. Indirect proof (contradiction): assume negation, derive contradiction. Counterexample: one case that disproves a universal claim. Polya\'s steps: understand, plan, carry out, look back.',
    workedExample: 'Disprove "n²+n+41 is always prime": try n=40 → 40²+40+41 = 1681 = 41². Not prime.',
    misconception: 'Checking many examples proves a statement. Wrong — induction only suggests; a proof (or counterexample) is needed for certainty.',
    variants: [
      { conceptText: 'Proof techniques: direct (assume P, derive Q), contrapositive (assume ¬Q, derive ¬P), contradiction (assume ¬statement, derive impossibility), mathematical induction (base case + inductive step). Logical connectives: AND (∧), OR (∨), NOT (¬), IF-THEN (→), IFF (↔). Converse: Q→P; inverse: ¬P→¬Q; contrapositive: ¬Q→¬P (logically equivalent to original).',
        workedExample: 'Prove: if n² is even, then n is even. Contrapositive: if n is odd → n² is odd. n = 2k+1 → n² = 4k²+4k+1 = 2(2k²+2k)+1 (odd). ✓',
        misconception: 'The converse of a true statement is always true. Wrong — "if it rains, the ground is wet" is true, but "if the ground is wet, it rained" is false (sprinklers).' },
      { conceptText: 'Problem-solving strategies (Polya): draw a diagram, look for patterns, work backwards, make a simpler problem, guess and check, use variables, make a table, consider special cases. Reasonableness: estimate before computing, check units, verify with substitution. Mathematical modeling: identify variables → set up equation → solve → interpret → validate. Real-world constraints may limit mathematical solutions.',
        workedExample: 'A farmer has 100m of fencing for a rectangular pen along a barn (3 sides fenced). Maximize area: A = x(100−2x). A\'(x) = 100−4x = 0 → x = 25, A = 1250 m². Check: reasonable for 100m of fence.',
        misconception: 'There is always exactly one correct strategy for a problem. Wrong — many problems can be solved multiple ways. Flexibility in approach is a hallmark of mathematical thinking.' },
    ],
  },
  'math712:c019': {
    title: 'Mathematical Connections & Communication',
    conceptText: 'Multiple representations: verbal → numerical → algebraic → graphical. Connections across strands: algebra explains geometry (coordinate proofs), statistics uses algebra (regression equations). Real-world modeling: translate context into math, solve, interpret back. Precise mathematical vocabulary avoids ambiguity. History: contributions from many cultures (zero from India, algebra from al-Khwarizmi, Euclid\'s Elements).',
    workedExample: '"Distance from 5 is at most 3" → |x−5| ≤ 3 → 2 ≤ x ≤ 8. Verbal → algebraic → graphical (number line segment).',
    misconception: 'Math developed only in Western Europe. Wrong — foundational contributions came from Mesopotamia, Egypt, India, China, the Islamic world, and many other cultures.',
    variants: [
      { conceptText: 'Technology in math: graphing calculators visualize functions, dynamic geometry (Desmos, GeoGebra) explores conjectures, spreadsheets model data. Mathematical communication: use precise definitions, correct notation, logical argument structure. Writing a proof communicates reasoning unambiguously. Tables, graphs, and equations are complementary views of the same relationship — fluency in translation between them is essential.',
        workedExample: 'Table: (0,2),(1,5),(2,8),(3,11). Pattern: add 3. Equation: y = 3x + 2. Graph: line with slope 3, y-intercept 2. All represent the same linear function.',
        misconception: 'A graph always tells you the exact function. Wrong — a graph shows a visual approximation. Identical-looking graphs can have different formulas (e.g., sin x and a polynomial may overlap on a small interval).' },
      { conceptText: 'Cross-strand connections: Pythagorean theorem links algebra (a²+b²=c²) and geometry (right triangles). Trigonometry connects circular geometry with algebraic functions. Probability uses combinatorics from number theory. Calculus extends algebraic patterns to continuous change. Historical milestones: Euler\'s identity e^(iπ)+1=0 unifies five fundamental constants. Mathematics as a universal language transcends cultural boundaries.',
        workedExample: 'Prove the quadrilateral with vertices (0,0),(4,0),(5,3),(1,3) is a parallelogram. Slopes: bottom 0, top 0 (parallel); left 3/1=3, right 3/1=3 (parallel). Both pairs parallel → parallelogram. Algebra verifies geometry.',
        misconception: 'Each branch of math is independent and unconnected. Wrong — algebra, geometry, statistics, and calculus constantly reinforce each other. The strongest problem-solvers draw connections across domains.' },
    ],
  },

  // Domain VI — Mathematical Learning, Instruction & Assessment
  'math712:c020': {
    title: 'Mathematical Learning & Instruction',
    conceptText: 'Concrete → representational → abstract (CRA) progression. Manipulatives build conceptual understanding before symbolic work. Differentiation: tiered tasks, flexible grouping, multiple entry points. Questioning: higher-order questions promote reasoning ("Why does that work?" vs. "What is the answer?"). Technology: graphing calculators, dynamic geometry software, coding. TEKS alignment ensures all students access grade-level content.',
    workedExample: 'Teaching area of a circle: students arrange pizza-slice sectors into approximate parallelogram → discover A ≈ (1)/(2)·C·r = πr².',
    misconception: 'Students should master procedures before understanding concepts. Research shows conceptual understanding alongside procedures leads to deeper, more transferable learning.',
    variants: [
      { conceptText: 'Bloom\'s Taxonomy: remember, understand, apply, analyze, evaluate, create. Effective math instruction targets higher levels. Productive struggle: students learn more from working through challenges than from being shown solutions immediately. Wait time: pausing 3–5 seconds after a question increases quality and quantity of responses. Collaborative learning (think-pair-share, group problem-solving) develops communication and reasoning.',
        workedExample: 'Instead of "What is 3×4?" (recall), ask "Why does 3×4 give the same answer as 4×3? Can you show it with tiles?" (analyze/evaluate). Both address the same fact but at different Bloom\'s levels.',
        misconception: 'Struggling means a student isn\'t ready for the content. Wrong — productive struggle is a normal and necessary part of learning. The teacher\'s role is to scaffold appropriately, not remove all difficulty.' },
      { conceptText: 'English Language Learners (ELLs) in math: use visuals, manipulatives, sentence stems, math vocabulary walls. Differentiated instruction: vary content, process, or product based on readiness, interest, or learning profile. Formative assessment drives instructional decisions in real time. Growth mindset: mathematical ability develops with effort — praise process, not innate talent. Culturally responsive teaching makes math accessible to all students.',
        workedExample: 'For ELLs learning "greater than / less than": use number lines, comparison cards, and the sentence stem "_____ is greater than _____ because _____." Vocabulary is explicitly taught alongside the concept.',
        misconception: 'Some students are simply "not math people." Wrong — research on growth mindset shows all students can develop mathematical proficiency with appropriate instruction, support, and effort.' },
    ],
  },
  'math712:c021': {
    title: 'Mathematical Assessment',
    conceptText: 'Formative assessment: ongoing, informs instruction (exit tickets, observations, questioning). Summative: evaluates learning after instruction (unit tests, finals). Diagnostic: identifies prior knowledge and misconceptions before instruction. Error analysis: categorize student mistakes to target instruction. Rubrics: criteria + performance levels for consistent scoring. Validity: does it measure what it claims? Reliability: consistent results across administrations.',
    workedExample: 'Student error: (x+3)² = x²+9. Missing the middle term — the misconception is applying exponent to each term separately. Correct: (x+3)² = x²+6x+9.',
    misconception: 'All assessment is summative. Wrong — formative assessment is the most powerful tool for day-to-day instructional decisions and is ongoing throughout a lesson.',
    variants: [
      { conceptText: 'Error analysis: procedural errors (wrong steps), conceptual errors (wrong understanding), careless errors (attention lapses). Each needs different intervention. Common math error patterns: adding numerators/denominators in fractions, distributing exponents over addition, sign errors with negatives. Performance tasks: open-ended problems that assess deeper understanding and application. Portfolios: collections of student work showing growth over time.',
        workedExample: 'Student writes: −3² = 9. Error analysis: confusing −(3²) with (−3)². −3² = −9 by order of operations (exponent before negation). (−3)² = 9. Intervention: explicit instruction on order of operations with negatives.',
        misconception: 'Multiple-choice tests measure deep understanding. Wrong — they primarily measure recognition and recall. Open-ended tasks, performance assessments, and interviews better reveal conceptual understanding and reasoning.' },
      { conceptText: 'Questioning taxonomy: factual ("What is…"), procedural ("How do you…"), conceptual ("Why does…"), metacognitive ("How do you know your answer is correct?"). Exit tickets: 1–3 quick questions at end of lesson to check for understanding. Think-alouds: students verbalize their reasoning process, revealing misconceptions. Item analysis after a test: which items had highest error rates? What patterns emerge? Use data to reteach, not just re-test.',
        workedExample: 'Exit ticket after fractions lesson: "Is (2)/(3) + (1)/(4) closer to 1 or closer to (1)/(2)? Explain." This checks estimation, concept, and communication — richer than "compute (2)/(3) + (1)/(4)."',
        misconception: 'The best assessment is the longest and most difficult one. Wrong — effective assessment is aligned to learning objectives, appropriate in difficulty, and provides actionable feedback. Quality over quantity.' },
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
};

/**
 * Exponent rules reference (mathematically correct).
 * Use when displaying exponent rules in UI.
 */
export const EXPONENT_RULES = [
  { rule: 'Product (same base)', formula: 'a^m · a^n = a^(m+n)' },
  { rule: 'Quotient (same base)', formula: 'a^m ÷ a^n = a^(m−n)' },
  { rule: 'Power of a power', formula: '(a^m)^n = a^(mn)' },
  { rule: 'Zero exponent', formula: 'a^0 = 1 (a ≠ 0)' },
  { rule: 'Negative exponent', formula: 'a^(−n) = (1)/(a^n) (a ≠ 0)' },
  { rule: 'Product to a power', formula: '(ab)^n = a^n · b^n' },
  { rule: 'Quotient to a power', formula: '((a)/(b))^n = (a^n)/(b^n) (b ≠ 0)' },
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
