// TExES Question Banks
// ─────────────────────────────────────────────────────────────────────────────
// Official competency/domain info: Texas Education Agency (TEA) / NES Inc.
//   • TExES program: https://www.tx.nesinc.com
//   • Core Subjects EC-6 (291): test framework PDF lists domains and weights
//   • Math 7-12 (235), Math 4-8 (115): same site for frameworks
// Build question banks from the framework + your own items or licensed content.
// ─────────────────────────────────────────────────────────────────────────────
// Organized by exam competencies/domains. Question types: mc (multiple choice), multi (multi-select)

export const TEXES_DOMAINS = [
  // ═══ Domain I — Number Concepts (approx. 14%) ═══
  { id: 'comp001', name: 'Number Concepts', desc: 'Real & complex numbers, number theory.', weight: 0.14,
    games: ['math-match', 'math-sprint', 'q-blocks', 'number-line-ninja', 'qbot-shop', 'math-bingo', 'math-memory', 'teks-crush'],
    video: 'https://www.youtube.com/embed/VEY08fMYmEU',
    videos: ['https://www.youtube.com/embed/VEY08fMYmEU', 'https://www.youtube.com/embed/vRJqPo_zcnQ', 'https://www.youtube.com/embed/6OgDTCG1QCU'],
    standards: [
      { id: 'c001', name: 'Competency 001 — Real Number System',
        desc: 'Structure, operations, algorithms and representations of real numbers; place value, number base, decimal representations; properties of subsets; deductive reasoning with algebraic processes.' },
      { id: 'c002', name: 'Competency 002 — Complex Number System',
        desc: 'Complex number operations (addition, multiplication, roots); representations (vector, ordered pair, polar, exponential); algebraic structure; conjugate, magnitude, multiplicative inverse.' },
      { id: 'c003', name: 'Competency 003 — Number Theory',
        desc: 'Prime factorization, Euclidean algorithm, divisibility, modular arithmetic, fundamental theorem of arithmetic, permutations & combinations, vectors & matrices vs. number systems, estimation.' },
    ],
  },
  // ═══ Domain II — Patterns and Algebra (approx. 33%) ═══
  { id: 'comp002', name: 'Patterns and Algebra', desc: 'Patterns, functions, equations, algebraic reasoning, calculus.', weight: 0.33,
    games: ['algebra-sprint', 'math-sprint', 'equation-balance', 'math-maze', 'q-blocks', 'teks-crush', 'math-millionaire'],
    video: 'https://www.youtube.com/embed/NybHckSEQBI',
    videos: ['https://www.youtube.com/embed/NybHckSEQBI', 'https://www.youtube.com/embed/MHeirBPOI6w', 'https://www.youtube.com/embed/qeByhTF8WEw'],
    standards: [
      { id: 'c004', name: 'Competency 004 — Patterns',
        desc: 'Sequences and series (arithmetic, geometric, Fibonacci); mathematical induction; recursion and iteration; finance applications (interest, annuities); recognizing and extending patterns.' },
      { id: 'c005', name: 'Competency 005 — Functions, Relations & Graphs',
        desc: 'Domain/range, function notation, composition, inverses, even/odd functions, one-to-one functions; transformations of parent functions; multiple representations of functions.' },
      { id: 'c006', name: 'Competency 006 — Linear & Quadratic Functions',
        desc: 'Slope, equations of lines, systems of linear equations/inequalities, quadratic equations (factoring, completing the square, quadratic formula), vertex form, zeros, linear/matrix algebra.' },
      { id: 'c007', name: 'Competency 007 — Polynomial, Rational, Radical, Absolute Value & Piecewise Functions',
        desc: 'Polynomial operations & factoring, rational expressions, radical equations, piecewise functions, asymptotes, significant points, domain/range restrictions.' },
      { id: 'c008', name: 'Competency 008 — Exponential & Logarithmic Functions',
        desc: 'Exponential growth/decay, logarithmic scales, laws of exponents & logarithms, compound interest, modeling with exponential/logarithmic functions, their graphs and properties.' },
      { id: 'c009', name: 'Competency 009 — Trigonometric & Circular Functions',
        desc: 'Unit circle, sine/cosine/tangent and their graphs, trigonometric identities, inverse trig functions, amplitude/frequency/phase shift, periodic phenomena modeling.' },
      { id: 'c010', name: 'Competency 010 — Differential & Integral Calculus',
        desc: 'Limits and continuity, derivatives (rate of change, tangent lines), first/second derivative analysis, fundamental theorem of calculus, integration, optimization, related rates.' },
    ],
  },
  // ═══ Domain III — Geometry and Measurement (approx. 19%) ═══
  { id: 'comp003', name: 'Geometry and Measurement', desc: 'Measurement, Euclidean geometry, coordinate & transformational geometry.', weight: 0.19,
    games: ['graph-explorer', 'number-line-ninja', 'math-sprint', 'math-maze', 'math-jeopardy', 'crosses-knots', 'math-bingo'],
    video: 'https://www.youtube.com/embed/mLeNaZcy-hE',
    videos: ['https://www.youtube.com/embed/mLeNaZcy-hE', 'https://www.youtube.com/embed/EcVRXQKzZjo', 'https://www.youtube.com/embed/LrGHmBhn0yI'],
    standards: [
      { id: 'c011', name: 'Competency 011 — Measurement',
        desc: 'Perimeter, area, surface area, volume; unit conversions, dimensional analysis; Pythagorean theorem; effects of scaling on length/area/volume; area under curves (Riemann sums).' },
      { id: 'c012', name: 'Competency 012 — Euclidean Geometry (Axiomatic Systems)',
        desc: 'Points, lines, planes, angles; parallel & perpendicular lines; congruence & similarity; axiomatic systems; constructions; Euclidean vs. non-Euclidean geometry.' },
      { id: 'c013', name: 'Competency 013 — Euclidean Geometry (Results & Applications)',
        desc: 'Properties of triangles, quadrilaterals, polygons, circles; 2D and 3D shapes; cross-sections and nets; geometric patterns; arc length, sector area.' },
      { id: 'c014', name: 'Competency 014 — Coordinate, Transformational & Vector Geometry',
        desc: 'Coordinate geometry; distance/midpoint; conic sections; transformations (reflections, rotations, translations, dilations); symmetry; vectors and matrices in geometry.' },
    ],
  },
  // ═══ Domain IV — Probability and Statistics (approx. 14%) ═══
  { id: 'comp004', name: 'Probability and Statistics', desc: 'Data analysis, probability, statistical inference.', weight: 0.14,
    games: ['math-sprint', 'graph-explorer', 'math-jeopardy', 'math-millionaire', 'math-bingo', 'q-blocks', 'teks-crush'],
    video: 'https://www.youtube.com/embed/uAxyI_XfqXk',
    videos: ['https://www.youtube.com/embed/uAxyI_XfqXk', 'https://www.youtube.com/embed/KzfWUEJjG18', 'https://www.youtube.com/embed/xxpc-HPKN28'],
    standards: [
      { id: 'c015', name: 'Competency 015 — Data Analysis',
        desc: 'Central tendency (mean, median, mode), dispersion (range, IQR, variance, standard deviation), data displays (histograms, box plots, scatter plots, stem-and-leaf), shape and skewness, measurement scales.' },
      { id: 'c016', name: 'Competency 016 — Probability',
        desc: 'Sample spaces, independent/dependent events, conditional probability, addition/multiplication rules, combinations, permutations, discrete/continuous distributions (binomial, geometric, normal), expected value.' },
      { id: 'c017', name: 'Competency 017 — Statistical Inference',
        desc: 'Hypothesis testing, confidence intervals, sampling distributions, central limit theorem, law of large numbers, regression and correlation, residual analysis, biased/unbiased estimators, experiment design.' },
    ],
  },
  // ═══ Domain V — Mathematical Processes and Perspectives (approx. 10%) ═══
  { id: 'comp005', name: 'Mathematical Processes and Perspectives', desc: 'Reasoning, problem-solving, connections, communication, history of math.', weight: 0.10,
    games: ['math-maze', 'teks-crush', 'crosses-knots', 'math-sprint', 'algebra-sprint', 'math-memory', 'math-millionaire'],
    video: 'https://www.youtube.com/embed/tN9Xl1AcSv8',
    videos: ['https://www.youtube.com/embed/tN9Xl1AcSv8', 'https://www.youtube.com/embed/oECKpn0GELY', 'https://www.youtube.com/embed/ZZQO3HGkFa8'],
    standards: [
      { id: 'c018', name: 'Competency 018 — Mathematical Reasoning & Problem Solving',
        desc: 'Inductive/deductive reasoning, direct & indirect proofs, counterexamples, conjectures, problem-solving strategies, evaluating reasonableness, mathematical models.' },
      { id: 'c019', name: 'Competency 019 — Connections & Communication',
        desc: 'Cross-strand connections, real-world applications, mathematical terminology, multiple representations, translating between verbal/symbolic forms, history of mathematics, technology.' },
    ],
  },
  // ═══ Domain VI — Mathematical Learning, Instruction & Assessment (approx. 10%) ═══
  { id: 'comp006', name: 'Mathematical Learning, Instruction & Assessment', desc: 'How students learn math, instructional planning, assessment.', weight: 0.10,
    games: ['math-sprint', 'math-memory', 'math-match', 'crosses-knots', 'math-bingo', 'q-blocks', 'teks-crush'],
    video: 'https://www.youtube.com/embed/tN9Xl1AcSv8',
    videos: ['https://www.youtube.com/embed/tN9Xl1AcSv8', 'https://www.youtube.com/embed/oECKpn0GELY', 'https://www.youtube.com/embed/ZZQO3HGkFa8'],
    standards: [
      { id: 'c020', name: 'Competency 020 — Mathematical Learning & Instruction',
        desc: 'How children learn math; concrete-to-abstract continuum; manipulatives and technology; instructional strategies; TEKS alignment; differentiating for diverse learners including ELLs; research-based practices.' },
      { id: 'c021', name: 'Competency 021 — Mathematical Assessment',
        desc: 'Formative vs. summative assessment; designing worthwhile tasks; identifying misconceptions and error patterns; using assessment to guide instruction; monitoring progress; scoring procedures.' },
    ],
  },
];

const STANDARD_MAP = {
  // ── Domain I: Number Concepts (c001–c003) ──
  t001:'c001',t003:'c001',t004:'c001',t005:'c001',t006:'c001',t007:'c001',t008:'c001',
  t043:'c001',t044:'c001',t045:'c001',t046:'c001',t048:'c001',t049:'c001',t050:'c001',
  t051:'c001',t053:'c001',t054:'c001','t055b':'c001',t056:'c001',t057:'c001',
  t059:'c001',t061:'c001',t062:'c001',t063:'c001',t064:'c001',
  t058:'c002',
  tc01:'c002',tc02:'c002',tc03:'c002',tc04:'c002',tc05:'c002',tc06:'c002',tc07:'c002',tc08:'c002',tc09:'c002',tc10:'c002',tc11:'c002',tc12:'c002',
  t002:'c003',t047:'c003',t052:'c003',t060:'c003',
  tn01:'c003',tn02:'c003',tn03:'c003',tn04:'c003',tn05:'c003',tn06:'c003',tn07:'c003',tn08:'c003',tn09:'c003',tn10:'c003',tn11:'c003',tn12:'c003',

  // ── Domain II: Patterns and Algebra (c004–c010) ──
  // c004 Patterns (sequences, series, induction)
  t012:'c004',t069:'c004',t079:'c004',
  tp01:'c004',tp02:'c004',tp03:'c004',tp04:'c004',tp05:'c004',tp06:'c004',tp07:'c004',tp08:'c004',
  // c005 Functions, Relations & Graphs
  t016:'c005',t070:'c005',t075:'c005',t076:'c005',t078:'c005',t085:'c005',
  tf01:'c005',tf02:'c005',tf03:'c005',tf04:'c005',tf05:'c005',tf06:'c005',tf07:'c005',tf08:'c005',
  // c006 Linear & Quadratic
  t009:'c006',t010:'c006',t011:'c006',t013:'c006',t015:'c006',t017:'c006',t018:'c006',
  t065:'c006',t066:'c006',t067:'c006',t068:'c006',t074:'c006',t080:'c006',t081:'c006',t082:'c006',t086:'c006',
  // c007 Polynomial, Rational, Radical, Absolute Value, Piecewise
  t071:'c007',t073:'c007',t077:'c007',t083:'c007',t084:'c007',
  tr01:'c007',tr02:'c007',tr03:'c007',tr04:'c007',tr05:'c007',tr06:'c007',tr07:'c007',tr08:'c007',
  // c008 Exponential & Logarithmic
  t014:'c008',t072:'c008',
  te01:'c008',te02:'c008',te03:'c008',te04:'c008',te05:'c008',te06:'c008',te07:'c008',te08:'c008',
  // c009 Trigonometric & Circular
  tg01:'c009',tg02:'c009',tg03:'c009',tg04:'c009',tg05:'c009',tg06:'c009',tg07:'c009',tg08:'c009',tg09:'c009',tg10:'c009',
  // c010 Differential & Integral Calculus
  td01:'c010',td02:'c010',td03:'c010',td04:'c010',td05:'c010',td06:'c010',td07:'c010',td08:'c010',td09:'c010',td10:'c010',

  // ── Domain III: Geometry and Measurement (c011–c014) ──
  // c011 Measurement
  t020:'c011',t021:'c011',t023:'c011',t024:'c011',t025:'c011',
  t091:'c011',t099:'c011',t100:'c011',t101:'c011',t102:'c011',t107:'c011',t108:'c011',
  // c012 Euclidean Geometry (Axiomatic)
  t019:'c012',t087:'c012',t088:'c012',t089:'c012',t090:'c012',t093:'c012',t096:'c012',t097:'c012',
  tx01:'c012',tx02:'c012',tx03:'c012',tx04:'c012',tx05:'c012',tx06:'c012',
  // c013 Euclidean Geometry (Results & Applications)
  t022:'c013',t092:'c013',t094:'c013',t095:'c013',t098:'c013',t106:'c013',
  tga01:'c013',tga02:'c013',tga03:'c013',tga04:'c013',
  // c014 Coordinate, Transformational & Vector Geometry
  t026:'c014',t103:'c014',t104:'c014',t105:'c014',
  tv01:'c014',tv02:'c014',tv03:'c014',tv04:'c014',tv05:'c014',tv06:'c014',

  // ── Domain IV: Probability and Statistics (c015–c017) ──
  // c015 Data Analysis
  t028:'c015',t030:'c015',t031:'c015',t032:'c015',t034:'c015',
  t110:'c015',t111:'c015',t114:'c015',t119:'c015',t120:'c015',t121:'c015',t122:'c015',t123:'c015',t126:'c015',t127:'c015',t128:'c015',t129:'c015',
  // c016 Probability
  t027:'c016',t029:'c016',t033:'c016',
  t109:'c016',t112:'c016',t113:'c016',t115:'c016',t116:'c016',t117:'c016',t118:'c016',t124:'c016',t125:'c016',t130:'c016',
  // c017 Statistical Inference
  ts01:'c017',ts02:'c017',ts03:'c017',ts04:'c017',ts05:'c017',ts06:'c017',ts07:'c017',ts08:'c017',ts09:'c017',ts10:'c017',

  // ── Domain V: Mathematical Processes and Perspectives (c018–c019) ──
  // c018 Reasoning & Problem Solving
  t035:'c018',t036:'c018',t038:'c018',t040:'c018',
  t133:'c018',t134:'c018',t137:'c018',t143:'c018',t146:'c018',t151:'c018',
  t037:'c018',t131:'c018',t132:'c018',t135:'c018',t139:'c018',t140:'c018',t141:'c018',t144:'c018',
  // c019 Connections & Communication
  t039:'c019',t041:'c019',t042:'c019',t136:'c019',t138:'c019',t142:'c019',t145:'c019',t147:'c019',
  t148:'c019',t149:'c019',t150:'c019',t152:'c019',

  // ── Domain VI: Mathematical Learning, Instruction & Assessment (c020–c021) ──
  ti01:'c020',ti02:'c020',ti03:'c020',ti04:'c020',ti05:'c020',ti06:'c020',ti07:'c020',ti08:'c020',
  ti09:'c020',ti10:'c020',ti11:'c020',ti12:'c020',ti13:'c020',ti14:'c020',
  ta01:'c021',ta02:'c021',ta03:'c021',ta04:'c021',ta05:'c021',ta06:'c021',ta07:'c021',ta08:'c021',
  ta09:'c021',ta10:'c021',ta11:'c021',ta12:'c021',ta13:'c021',ta14:'c021',
};

export function getStandardForQuestion(qId) { return STANDARD_MAP[qId] || null; }

export function getStandardsForComp(examId, compId) {
  const domains = getDomainsForExam(examId) || [];
  const dom = domains.find(d => d.id === compId);
  return dom?.standards || [];
}

export const TEXES_QUESTIONS = [
  // ═══════════════════════════════════════════════
  // DOMAIN I: Number Concepts
  // ═══════════════════════════════════════════════

  { id: 't001', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'Which of the following is an irrational number?',
    choices: ['√(9)', 'π', '0.75', '-2/3'], answer: 'π',
    explanation: 'π is irrational — it cannot be expressed as a ratio of two integers and has a non-repeating, non-terminating decimal.' },
  { id: 't002', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'What is the least common multiple of 8 and 12?',
    choices: ['4', '24', '48', '96'], answer: '24',
    explanation: 'LCM(8, 12) = 24. Prime factors: 8 = 2³, 12 = 2²×3. LCM = 2³×3 = 24.' },
  { id: 't003', comp: 'comp001', type: 'mc', difficulty: 3,
    q: 'A student claims that the product of any two irrational numbers is always irrational. Which counterexample disproves this?',
    choices: ['√(2) × √(3)', '√(2) × √(2)', 'π × 2', 'e × π'], answer: '√(2) × √(2)',
    explanation: '√(2) × √(2) = 2, which is rational. So the product of two irrationals can be rational.' },
  { id: 't004', comp: 'comp001', type: 'mc', difficulty: 3,
    q: 'Which property is illustrated by: If a + b = c, then a = c − b?',
    choices: ['Commutative', 'Associative', 'Inverse (addition)', 'Distributive'], answer: 'Inverse (addition)',
    explanation: 'Using the additive inverse: subtracting b from both sides isolates a. This uses the property that addition and subtraction are inverse operations.' },
  { id: 't005', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'Express 3/8 as a decimal.',
    choices: ['0.375', '0.38', '0.83', '2.67'], answer: '0.375',
    explanation: '3 ÷ 8 = 0.375.' },
  { id: 't006', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Which best describes the set of numbers that satisfy |x − 3| < 5?',
    choices: ['x < 8', '−2 < x < 8', 'x > −2', 'x < −2 or x > 8'], answer: '−2 < x < 8',
    explanation: '|x − 3| < 5 means −5 < x − 3 < 5, so −2 < x < 8.' },
  { id: 't007', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'What is 7^(-2) in simplest form?',
    choices: ['−49', '1/49', '−1/49', '49'], answer: '1/49',
    explanation: 'a^(-n) = 1/a^n. So 7^(-2) = 1/7² = 1/49.' },
  { id: 't008', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Simplify: √(50) − √(18)',
    choices: ['√(32)', '2√(2)', '4√(2)', '8√(2)'], answer: '2√(2)',
    explanation: '√(50) = 5√(2), √(18) = 3√(2). So 5√(2) − 3√(2) = 2√(2).' },

  // ── Number Concepts (additional) ──
  { id: 't043', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'Which of the following numbers is irrational?',
    choices: ['√(49)', '√(50)', '0.75', '-3'], answer: '√(50)',
    explanation: '√(50) = 5√(2), which cannot be expressed as a ratio of two integers. √(49) = 7, 0.75 = 3/4, and -3 are all rational.' },
  { id: 't044', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'What is the value of 2³ + 3²?',
    choices: ['17', '13', '25', '12'], answer: '17',
    explanation: '2³ = 8 and 3² = 9, so 8 + 9 = 17.' },
  { id: 't045', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'Which property is illustrated by (a + b) + c = a + (b + c)?',
    choices: ['Commutative', 'Associative', 'Distributive', 'Identity'], answer: 'Associative',
    explanation: 'The associative property states that the grouping of addends does not change the sum.' },
  { id: 't046', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'What is 15% of 80?',
    choices: ['10', '12', '15', '18'], answer: '12',
    explanation: '15% of 80 = 0.15 × 80 = 12.' },
  { id: 't047', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'Which number is a prime number?',
    choices: ['27', '29', '33', '39'], answer: '29',
    explanation: '29 has no positive divisors other than 1 and itself. 27 = 3³, 33 = 3×11, 39 = 3×13.' },
  { id: 't048', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'Simplify: |−7| − |3|',
    choices: ['4', '10', '-4', '-10'], answer: '4',
    explanation: '|−7| = 7 and |3| = 3, so 7 − 3 = 4.' },
  { id: 't049', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'If x is a positive integer and √(2x) is rational, which must be true?',
    choices: ['x is even', 'x is odd', 'x is a perfect square', '2x is a perfect square'], answer: '2x is a perfect square',
    explanation: '√(2x) is rational only when 2x is a perfect square, so 2x = n² for some integer n.' },
  { id: 't050', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Evaluate: 2/3 ÷ 4/5 × 6/7',
    choices: ['5/7', '20/21', '15/14', '8/21'], answer: '5/7',
    explanation: '2/3 ÷ 4/5 = 2/3 × 5/4 = 5/6. Then 5/6 × 6/7 = 30/42 = 5/7.' },
  { id: 't051', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'What is the value of 5 − 2[4 − (2 − 1)²]?',
    choices: ['-1', '3', '5', '7'], answer: '-1',
    explanation: 'Using PEMDAS: (2−1)=1, 1²=1, 4−1=3, 2(3)=6, 5−6=−1.' },
  { id: 't052', comp: 'comp001', type: 'mc', difficulty: 3,
    q: 'The LCM of two numbers is 72 and their GCF is 6. If one number is 24, what is the other?',
    choices: ['18', '12', '36', '48'], answer: '18',
    explanation: 'For two numbers a and b, LCM × GCF = a × b. So 72 × 6 = 24 × b, giving b = 432/24 = 18.' },
  { id: 't053', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Simplify: (2⁻³ × 2⁵) ÷ 2²',
    choices: ['1', '2', '4', '8'], answer: '1',
    explanation: '2⁻³ × 2⁵ = 2². Then 2² ÷ 2² = 2⁰ = 1.' },
  { id: 't054', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Which expression is equivalent to 8^(2/3)?',
    choices: ['4', '2√(2)', '³√(64)', '16'], answer: '4',
    explanation: '8^(2/3) = (8^(1/3))² = 2² = 4, or (8²)^(1/3) = 64^(1/3) = 4.' },
  { id: 't055b', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Simplify: √(48) − √(12)',
    choices: ['2√(3)', '3√(3)', '4√(3)', '6√(3)'], answer: '2√(3)',
    explanation: '√(48) = 4√(3) and √(12) = 2√(3), so 4√(3) − 2√(3) = 2√(3).' },
  { id: 't056', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Solve for x: |2x − 5| = 11',
    choices: ['x = 8 or x = -3', 'x = 8 or x = 3', 'x = -8 or x = 3', 'x = 3 or x = -3'], answer: 'x = 8 or x = -3',
    explanation: '2x − 5 = 11 gives x = 8; 2x − 5 = −11 gives x = −3.' },
  { id: 't057', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Express 0.0000456 in scientific notation.',
    choices: ['4.56 × 10⁻⁵', '4.56 × 10⁻⁶', '45.6 × 10⁻⁶', '4.56 × 10⁵'], answer: '4.56 × 10⁻⁵',
    explanation: '0.0000456 = 4.56 × 10⁻⁵ (decimal moved 5 places right).' },
  { id: 't058', comp: 'comp001', type: 'mc', difficulty: 3,
    q: 'Simplify: (3 + 2i)(3 − 2i)',
    choices: ['5', '9 − 4i', '13', '9 + 4i'], answer: '13',
    explanation: '(3+2i)(3−2i) = 9 − 6i + 6i − 4i² = 9 − 4(−1) = 9 + 4 = 13.' },
  { id: 't059', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'A recipe uses flour and sugar in the ratio 5:3. If 2.5 cups of flour are used, how many cups of sugar are needed?',
    choices: ['1.5', '2', '2.5', '4.17'], answer: '1.5',
    explanation: '5/3 = 2.5/s, so 5s = 7.5, s = 1.5 cups.' },
  { id: 't060', comp: 'comp001', type: 'mc', difficulty: 3,
    q: 'Which number is divisible by both 6 and 9?',
    choices: ['126', '134', '142', '158'], answer: '126',
    explanation: '126 ÷ 6 = 21 and 126 ÷ 9 = 14. The others are not divisible by both.' },
  { id: 't061', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Simplify: √(18) · √(8)',
    choices: ['6√(2)', '12', '12√(2)', '6'], answer: '12',
    explanation: '√(18) · √(8) = √(18×8) = √(144) = 12.' },
  { id: 't062', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'If 0.4̅ (that is, 0.444..., where the overline means the 4 repeats forever) = a/b in lowest terms, what is a + b?',
    choices: ['13', '14', '15', '16'], answer: '13',
    explanation: '0.4̅ means 0.444... (a repeating decimal), not complex conjugate notation. 0.4̅ = 4/9. In lowest terms, a = 4 and b = 9, so a + b = 13.' },
  { id: 't063', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Evaluate: (−2)⁴ − (−2)³',
    choices: ['8', '16', '24', '-8'], answer: '24',
    explanation: '(−2)⁴ = 16 and (−2)³ = −8, so 16 − (−8) = 16 + 8 = 24.' },
  { id: 't064', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'For which value of x is the expression (x² − 4)/(x − 2) undefined?',
    choices: ['x = -2', 'x = 0', 'x = 2', 'x = 4'], answer: 'x = 2',
    explanation: 'The expression is undefined when x − 2 = 0, i.e., when x = 2.' },

  // ── Competency 002: Complex Number System ──
  { id: 'tc01', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'Simplify: i² + i⁴',
    choices: ['0', '-2', '2', '-1'], answer: '0',
    explanation: 'i² = −1 and i⁴ = 1, so −1 + 1 = 0.' },
  { id: 'tc02', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'What is the real part of the complex number 7 − 3i?',
    choices: ['-3', '3', '7', '-7'], answer: '7',
    explanation: 'For a + bi, the real part is a. In 7 − 3i, the real part is 7.' },
  { id: 'tc03', comp: 'comp001', type: 'mc', difficulty: 3,
    q: 'What is the modulus (magnitude) of 3 + 4i?',
    choices: ['5', '7', '25', '√(7)'], answer: '5',
    explanation: '|3 + 4i| = √(3² + 4²) = √(9 + 16) = √(25) = 5.' },
  { id: 'tc04', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'What is the complex conjugate of −2 + 5i?',
    choices: ['2 + 5i', '−2 − 5i', '2 − 5i', '5 − 2i'], answer: '−2 − 5i',
    explanation: 'The conjugate of a + bi is a − bi. So the conjugate of −2 + 5i is −2 − 5i.' },
  { id: 'tc05', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Multiply: (2 + 3i)(1 − i)',
    choices: ['5 + i', '5 − i', '-1 + i', '-1 + 5i'], answer: '5 + i',
    explanation: '(2+3i)(1−i) = 2 − 2i + 3i − 3i² = 2 + i − 3(−1) = 2 + i + 3 = 5 + i.' },
  { id: 'tc06', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Which equation has no real solutions but has complex solutions?',
    choices: ['x² − 4 = 0', 'x² + 1 = 0', 'x² − x = 0', 'x² = 9'], answer: 'x² + 1 = 0',
    explanation: 'x² + 1 = 0 gives x² = −1, which has no real solutions. Its complex solutions are x = ±i.' },
  { id: 'tc07', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Simplify: i¹⁷',
    choices: ['1', '-1', 'i', '-i'], answer: 'i',
    explanation: 'Powers of i cycle with period 4: i¹=i, i²=−1, i³=−i, i⁴=1. 17 mod 4 = 1, so i¹⁷ = i.' },
  { id: 'tc08', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'What is the multiplicative inverse of 2 + i?',
    choices: ['2 − i', '(2 − i)/5', '(2 + i)/5', '1/(2+i)'], answer: '(2 − i)/5',
    explanation: '1/(2+i) = (2−i)/((2+i)(2−i)) = (2−i)/(4+1) = (2−i)/5.' },
  { id: 'tc09', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Express the complex number with modulus 2 and argument π/3 in rectangular form.',
    choices: ['1 + i√(3)', '√(3) + i', '2 + 2i', '1 + i'], answer: '1 + i√(3)',
    explanation: '2(cos π/3 + i sin π/3) = 2(1/2 + i(√(3))/2) = 1 + i√(3).' },
  { id: 'tc10', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'If z = 1 + i, what is z²?',
    choices: ['2i', '2', '-2i', '1 + 2i'], answer: '2i',
    explanation: '(1+i)² = 1 + 2i + i² = 1 + 2i − 1 = 2i.' },
  { id: 'tc11', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'On the complex plane, adding 3 + 2i to a point is equivalent to which geometric transformation?',
    choices: ['Translation right 3, up 2', 'Rotation by 90°', 'Reflection over the real axis', 'Dilation by factor 3'], answer: 'Translation right 3, up 2',
    explanation: 'Adding a complex number shifts the point: +3 on the real axis (right), +2 on the imaginary axis (up).' },
  { id: 'tc12', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Solve x² + 2x + 5 = 0.',
    choices: ['x = −1 ± 2i', 'x = 1 ± 2i', 'x = −1 ± √(6)', 'x = −2 ± i'], answer: 'x = −1 ± 2i',
    explanation: 'x = (−2 ± √(4−20))/2 = (−2 ± √(−16))/2 = (−2 ± 4i)/2 = −1 ± 2i.' },

  // ── Competency 003: Number Theory ──
  { id: 'tn01', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'What is the prime factorization of 84?',
    choices: ['2² × 3 × 7', '2 × 3² × 7', '2² × 21', '4 × 21'], answer: '2² × 3 × 7',
    explanation: '84 = 2 × 42 = 2 × 2 × 21 = 2² × 3 × 7.' },
  { id: 'tn02', comp: 'comp001', type: 'mc', difficulty: 1,
    q: 'What is the GCD (greatest common divisor) of 36 and 48?',
    choices: ['6', '8', '12', '24'], answer: '12',
    explanation: '36 = 2² × 3² and 48 = 2⁴ × 3. GCD = 2² × 3 = 12.' },
  { id: 'tn03', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Using the Euclidean algorithm, what is GCD(252, 105)?',
    choices: ['7', '14', '21', '42'], answer: '21',
    explanation: '252 = 2(105) + 42; 105 = 2(42) + 21; 42 = 2(21) + 0. GCD = 21.' },
  { id: 'tn04', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'What is 17 mod 5?',
    choices: ['2', '3', '4', '5'], answer: '2',
    explanation: '17 ÷ 5 = 3 remainder 2. So 17 mod 5 = 2.' },
  { id: 'tn05', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'By the Fundamental Theorem of Arithmetic, every integer greater than 1 can be written uniquely as:',
    choices: ['A sum of primes', 'A product of primes', 'A power of a prime', 'A difference of primes'], answer: 'A product of primes',
    explanation: 'The Fundamental Theorem of Arithmetic states every integer > 1 has a unique prime factorization (product of primes).' },
  { id: 'tn06', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'How many ways can 5 students be arranged in a line? (5!)',
    choices: ['25', '60', '120', '720'], answer: '120',
    explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120 permutations.' },
  { id: 'tn07', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'From a group of 8, a committee of 3 is chosen. How many combinations are possible? C(8,3)',
    choices: ['24', '56', '336', '512'], answer: '56',
    explanation: 'C(8,3) = 8!/(3!·5!) = (8×7×6)/(3×2×1) = 56.' },
  { id: 'tn08', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'In modular arithmetic, what is (7 × 8) mod 10?',
    choices: ['4', '5', '6', '56'], answer: '6',
    explanation: '7 × 8 = 56. 56 mod 10 = 6.' },
  { id: 'tn09', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Which of the following is NOT true about matrix multiplication?',
    choices: ['It is associative', 'It is distributive over addition', 'It is commutative', 'The identity matrix acts as a multiplicative identity'], answer: 'It is commutative',
    explanation: 'Matrix multiplication is generally not commutative: AB ≠ BA in general.' },
  { id: 'tn10', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'A number is divisible by 12 if and only if it is divisible by:',
    choices: ['2 and 6', '3 and 4', '4 and 6', '6 and 12'], answer: '3 and 4',
    explanation: '12 = 3 × 4 where GCD(3,4)=1. So divisibility by 12 ⟺ divisibility by both 3 and 4.' },
  { id: 'tn11', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'How many two-digit prime numbers have a units digit of 3?',
    choices: ['4', '5', '6', '7'], answer: '6',
    explanation: '13, 23, 43, 53, 73, 83 are the two-digit primes ending in 3 (33=3×11, 63=7×9, 93=3×31 are not prime). That gives 6.' },
  { id: 'tn12', comp: 'comp001', type: 'mc', difficulty: 2,
    q: 'Estimate √(50) to the nearest integer.',
    choices: ['6', '7', '8', '9'], answer: '7',
    explanation: '7² = 49 and 8² = 64. Since 50 is closest to 49, √(50) ≈ 7.' },

  // ═══════════════════════════════════════════════
  // DOMAIN II: Patterns and Algebra
  // ═══════════════════════════════════════════════

  { id: 't009', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'What is the slope of the line passing through (2, 5) and (4, 11)?',
    choices: ['2', '3', '4', '6'], answer: '3',
    explanation: 'Slope = (11 − 5)/(4 − 2) = 6/2 = 3.' },
  { id: 't010', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'Solve for x: 3x + 7 = 22',
    choices: ['x = 5', 'x = 15/3', 'x = 29/3', 'x = 6'], answer: 'x = 5',
    explanation: '3x = 15, so x = 5.' },
  { id: 't011', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'Which function has a vertex at (2, −3)?',
    choices: ['f(x) = (x − 2)² − 3', 'f(x) = (x + 2)² − 3', 'f(x) = (x − 2)² + 3', 'f(x) = x² − 3'], answer: 'f(x) = (x − 2)² − 3',
    explanation: 'Vertex form f(x) = a(x − h)² + k has vertex (h, k). So (x − 2)² − 3 has vertex (2, −3).' },
  { id: 't012', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'The first four terms of a sequence are 3, 7, 11, 15. What is the 10th term?',
    choices: ['39', '40', '43', '47'], answer: '39',
    explanation: 'Arithmetic sequence with d = 4. aₙ = a₁ + (n − 1) · d. So a₁₀ = 3 + 9(4) = 39.' },
  { id: 't013', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'Solve the system: 2x + y = 10 and x − y = 2.',
    choices: ['x = 4, y = 2', 'x = 3, y = 4', 'x = 4, y = 6', 'x = 2, y = 6'], answer: 'x = 4, y = 2',
    explanation: 'Adding equations: 3x = 12, x = 4. Then 4 − y = 2, so y = 2.' },
  { id: 't014', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'Which expression is equivalent to 2^(3x) · 2^(2x)?',
    choices: ['2^(5x)', '2^(6x)', '4^(5x)', '2^(5x²)'], answer: '2^(5x)',
    explanation: 'When multiplying powers with the same base, add exponents: 2^(3x) · 2^(2x) = 2^(3x + 2x) = 2^(5x).' },
  { id: 't015', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Factor completely: x² − 5x − 6',
    choices: ['(x − 6)(x + 1)', '(x − 3)(x − 2)', '(x + 6)(x − 1)', '(x − 2)(x + 3)'], answer: '(x − 6)(x + 1)',
    explanation: 'x² − 5x − 6 = (x − 6)(x + 1). Check: −6 + 1 = −5, −6(1) = −6.' },
  { id: 't016', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'If f(x) = 2x + 1 and g(x) = x², what is (f ∘ g)(3)?',
    choices: ['19', '21', '49', '7'], answer: '19',
    explanation: '(f ∘ g)(3) = f(g(3)) = f(9) = 2(9) + 1 = 19.' },
  { id: 't017', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Which inequality represents "x is at least 5 and less than 12"?',
    choices: ['5 < x ≤ 12', '5 ≤ x < 12', 'x ≥ 5 and x ≤ 12', '5 < x < 12'], answer: '5 ≤ x < 12',
    explanation: '"At least 5" means x ≥ 5. "Less than 12" means x < 12. Combined: 5 ≤ x < 12.' },
  { id: 't018', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'What is the range of f(x) = −x² + 4?',
    choices: ['[4, ∞)', '(−∞, 4]', '[0, 4]', '(−∞, ∞)'], answer: '(−∞, 4]',
    explanation: 'Parabola opens down (a < 0), vertex at (0, 4). Maximum is 4, so range is y ≤ 4, or (−∞, 4].' },

  // ── Patterns and Algebra (additional) ──
  { id: 't065', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'What is the solution to 3(2x - 5) + 4 = 7x - 2?',
    choices: ['x = 9', 'x = -9', 'x = 11', 'x = -11'], answer: 'x = -9',
    explanation: 'Distribute: 6x - 15 + 4 = 7x - 2, so 6x - 11 = 7x - 2. Subtract 6x: -11 = x - 2. Add 2: x = -9.' },
  { id: 't066', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'A line passes through (2, 5) and (6, 13). What is its slope?',
    choices: ['2', '3', '4', '8'], answer: '2',
    explanation: 'Slope m = (y₂ - y₁)/(x₂ - x₁) = (13 - 5)/(6 - 2) = 8/4 = 2.' },
  { id: 't067', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Solve the system: 2x + 3y = 12 and 4x - y = 5. What is the value of x + y?',
    choices: ['3', '4', '5', '6'], answer: '4',
    explanation: 'From 4x - y = 5, y = 4x - 5. Substitute: 2x + 3(4x-5) = 12 → 14x = 27 → x = 27/14. Then y = 29/14. So x+y = 56/14 = 4.' },
  { id: 't068', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'For f(x) = x² - 6x + 8, what is the x-coordinate of the vertex?',
    choices: ['-6', '3', '4', '8'], answer: '3',
    explanation: 'For ax² + bx + c, vertex x = -b/(2a) = 6/2 = 3.' },
  { id: 't069', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'The first term of an arithmetic sequence is 7 and the common difference is -4. What is the 10th term?',
    choices: ['-29', '-33', '-37', '-41'], answer: '-29',
    explanation: 'aₙ = a₁ + (n-1)d = 7 + 9(-4) = 7 - 36 = -29.' },
  { id: 't070', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'If f(x) = √(x - 3), what is the domain of f?',
    choices: ['All real numbers', 'x ≥ 0', 'x ≥ 3', 'x > 3'], answer: 'x ≥ 3',
    explanation: 'The radicand must be nonnegative: x - 3 ≥ 0, so x ≥ 3.' },
  { id: 't071', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Simplify: (3x² - 2x + 1) - (x² + 4x - 3) + (2x² - x).',
    choices: ['4x² - 7x + 4', '4x² - 5x + 4', '6x² - 7x - 2', '4x² - 7x - 2'], answer: '4x² - 7x + 4',
    explanation: '(3x² - 2x + 1) - (x² + 4x - 3) + (2x² - x) = 4x² - 7x + 4.' },
  { id: 't072', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'A population doubles every 5 years. If the initial population is 500, which function models the population P after t years?',
    choices: ['P(t) = 500(2)^(t/5)', 'P(t) = 500(5)^(2t)', 'P(t) = 1000(2)^t', 'P(t) = 500(2)^(5t)'], answer: 'P(t) = 500(2)^(t/5)',
    explanation: 'Doubling every 5 years means P(t) = 500 · 2^(t/5).' },
  { id: 't073', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Simplify: (x² - 9)/(x² + 5x + 6) ÷ (x - 3)/(x + 2).',
    choices: ['(x + 3)/(x + 2)', '1', '(x - 3)/(x + 2)', '(x + 3)/(x - 3)'], answer: '1',
    explanation: '(x²-9)/(x²+5x+6) = (x-3)(x+3)/((x+2)(x+3)) = (x-3)/(x+2). Dividing by (x-3)/(x+2) gives 1.' },
  { id: 't074', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'The graph of y = x² is reflected across the x-axis, shifted right 3 units, and up 2 units. What is the new equation?',
    choices: ['y = -(x - 3)² + 2', 'y = -(x + 3)² + 2', 'y = (x - 3)² - 2', 'y = -(x - 3)² - 2'], answer: 'y = -(x - 3)² + 2',
    explanation: 'Reflect: -x². Right 3: -(x-3)². Up 2: -(x-3)² + 2.' },
  { id: 't075', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'If f(x) = 2x - 1 and g(x) = x² + 2, what is (f ∘ g)(-2)?',
    choices: ['-15', '-11', '11', '15'], answer: '11',
    explanation: '(f ∘ g)(-2) = f(g(-2)) = f((-2)²+2) = f(6) = 2(6)-1 = 11.' },
  { id: 't076', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'If f(x) = (x + 4)/3 for all real x, what is f⁻¹(x)?',
    choices: ['3x - 4', '3x + 4', '(x - 4)/3', '3/(x + 4)'], answer: '3x - 4',
    explanation: 'Set y = (x+4)/3. Solve for x: 3y = x+4, x = 3y-4. So f⁻¹(x) = 3x - 4.' },
  { id: 't077', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'How many solutions does |2x - 5| = 3 have?',
    choices: ['0', '1', '2', 'Infinitely many'], answer: '2',
    explanation: '2x-5=3 gives x=4; 2x-5=-3 gives x=1. Two solutions.' },
  { id: 't078', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Let f(x) = { x² if x < 0; 2x + 1 if x ≥ 0 }. What is f(-2) + f(3)?',
    choices: ['10', '11', '12', '13'], answer: '11',
    explanation: 'f(-2) = (-2)² = 4 (since -2 < 0). f(3) = 2(3)+1 = 7 (since 3 ≥ 0). Sum = 11.' },
  { id: 't079', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'In a geometric sequence, a₁ = 2 and r = 3. What is a₅?',
    choices: ['54', '81', '162', '243'], answer: '162',
    explanation: 'a₅ = a₁ · r⁴ = 2 · 3⁴ = 2 · 81 = 162.' },
  { id: 't080', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Which values of x satisfy both 2x + 1 > 5 and x - 3 ≤ 1?',
    choices: ['2 < x ≤ 4', 'x > 2', 'x ≤ 4', '2 < x < 4'], answer: '2 < x ≤ 4',
    explanation: '2x+1>5 → x>2. x-3≤1 → x≤4. Both hold when 2 < x ≤ 4.' },
  { id: 't081', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Solve x² - 6x + 5 = 0 by completing the square. What is the larger solution?',
    choices: ['1', '3', '5', '6'], answer: '5',
    explanation: 'x²-6x+5=0 → (x-3)²=4 → x-3=±2 → x=5 or x=1. Larger is 5.' },
  { id: 't082', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'A line has slope -2/3 and passes through (6, -1). What is its equation in slope-intercept form?',
    choices: ['y = -2/3 x + 3', 'y = -2/3 x - 5', 'y = -2/3 x + 5', 'y = -2/3 x - 1'], answer: 'y = -2/3 x + 3',
    explanation: 'y-(-1)=(-2/3)(x-6) → y+1=-2x/3+4 → y=-2x/3+3.' },
  { id: 't083', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Which is a factor of 6x² - 7x - 20?',
    choices: ['2x - 5', '3x + 4', '2x + 5', '3x - 4'], answer: '2x - 5',
    explanation: '6x² - 7x - 20 = (2x - 5)(3x + 4). So 2x - 5 is a factor.' },
  { id: 't084', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Solve: 1/(x - 1) + 1/(x + 1) = 2/(x² - 1).',
    choices: ['x = 0', 'x = 1', 'x = -1', 'No solution'], answer: 'No solution',
    explanation: 'LCD is (x-1)(x+1). Multiplying: (x+1)+(x-1)=2 → 2x=2 → x=1. But x=1 makes the original undefined. No solution.' },
  { id: 't085', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'The function f(x) = 1/(x - 2) has domain x ≠ 2. What is the range of f?',
    choices: ['All real numbers', 'y ≠ 0', 'y > 0', 'y ≠ 2'], answer: 'y ≠ 0',
    explanation: 'f(x)=1/(x-2) can take any nonzero value. As x→±∞, f→0 but never equals 0. Range is y ≠ 0.' },
  { id: 't086', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Use the quadratic formula to solve 2x² - 4x - 3 = 0. What is the sum of the solutions?',
    choices: ['2', '-2', '4', '-3/2'], answer: '2',
    explanation: 'Sum of roots = -b/a = 4/2 = 2.' },

  // ═══════════════════════════════════════════════
  // DOMAIN III: Geometry and Measurement
  // ═══════════════════════════════════════════════

  { id: 't019', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'The interior angles of a regular hexagon each measure:',
    choices: ['90°', '120°', '135°', '180°'], answer: '120°',
    explanation: 'Sum of interior angles = (n−2)×180° = 720°. Each angle = 720°/6 = 120°.' },
  { id: 't020', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'What is the volume of a cylinder with radius 3 and height 8? (V = πr²h)',
    choices: ['24π', '72π', '96π', '216π'], answer: '72π',
    explanation: 'V = π(3)²(8) = π(9)(8) = 72π.' },
  { id: 't021', comp: 'comp003', type: 'mc', difficulty: 3,
    q: 'Two similar triangles have scale factor 3. If the smaller has area 12, what is the larger area?',
    choices: ['36', '48', '108', '144'], answer: '108',
    explanation: 'Area scales by the square of the scale factor. 3² = 9, so 12 × 9 = 108.' },
  { id: 't022', comp: 'comp003', type: 'mc', difficulty: 3,
    q: 'A right triangle has legs 5 and 12. What is the length of the hypotenuse?',
    choices: ['13', '17', '√(119)', '7'], answer: '13',
    explanation: 'a² + b² = c². 25 + 144 = 169, so c = 13.' },
  { id: 't023', comp: 'comp003', type: 'mc', difficulty: 3,
    q: 'Convert 2.5 hours to seconds.',
    choices: ['150', '900', '9000', '15000'], answer: '9000',
    explanation: '2.5 hr × 60 min/hr × 60 sec/min = 9000 seconds.' },
  { id: 't024', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'What is the surface area of a cube with edge length 4?',
    choices: ['48', '64', '96', '16'], answer: '96',
    explanation: 'SA = 6s² = 6(4)² = 6(16) = 96.' },
  { id: 't025', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'A circle has circumference 10π. What is its area?',
    choices: ['25π', '10π', '5π', '100π'], answer: '25π',
    explanation: 'C = 2πr = 10π, so r = 5. A = πr² = π(25) = 25π.' },
  { id: 't026', comp: 'comp003', type: 'mc', difficulty: 3,
    q: 'Which transformation maps (x, y) to (−x, y)?',
    choices: ['Reflection over x-axis', 'Reflection over y-axis', 'Rotation 90°', 'Translation'], answer: 'Reflection over y-axis',
    explanation: 'Reflecting over the y-axis negates the x-coordinate: (x, y) → (−x, y).' },
  { id: 't087', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'Two angles are complementary. If one measures 37°, what does the other measure?',
    choices: ['53°', '63°', '143°', '37°'], answer: '53°',
    explanation: 'Complementary angles sum to 90°. So 90° − 37° = 53°.' },
  { id: 't088', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'In the figure, a transversal cuts two parallel lines. If a corresponding angle measures 115°, what is the measure of its supplementary angle on the same line?',
    choices: ['65°', '115°', '245°', '90°'], answer: '65°',
    explanation: 'Supplementary angles sum to 180°. So 180° − 115° = 65°.' },
  { id: 't089', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'In a triangle, one interior angle is 50° and another is 70°. What is the measure of the exterior angle at the third vertex?',
    choices: ['60°', '120°', '130°', '110°'], answer: '120°',
    explanation: 'The exterior angle equals the sum of the two non-adjacent interior angles: 50° + 70° = 120°.' },
  { id: 't090', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'Two triangles have sides of lengths 4, 5, 6 and 8, 10, 12 respectively. Which congruence or similarity statement applies?',
    choices: ['SSS congruence', 'SAS congruence', 'The triangles are similar by SSS', 'The triangles are not necessarily similar'], answer: 'The triangles are similar by SSS',
    explanation: 'The sides are proportional (scale factor 2): 8/4 = 10/5 = 12/6 = 2. SSS similarity: if corresponding sides are proportional, the triangles are similar.' },
  { id: 't091', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'Triangles ABC and DEF are similar with AB/DE = 2/3. If the area of triangle ABC is 24 square units, what is the area of triangle DEF?',
    choices: ['16', '36', '54', '108'], answer: '54',
    explanation: 'Area scales by the square of the scale factor. Scale factor from DEF to ABC is 2/3, so area ratio is (2/3)² = 4/9. Thus DEF area = 24 ÷ (4/9) = 24 × 9/4 = 54.' },
  { id: 't092', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'A right triangle has legs of length 7 and 24. What is the length of the hypotenuse?',
    choices: ['25', '31', '√(625)', '17'], answer: '25',
    explanation: 'By the Pythagorean theorem: 7² + 24² = 49 + 576 = 625 = 25². So c = 25.' },
  { id: 't093', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'A triangle has sides of lengths 6, 8, and 11. Which statement is true?',
    choices: ['It is a right triangle', 'It is acute', 'It is obtuse', 'It cannot be a triangle'], answer: 'It is obtuse',
    explanation: 'By the converse of the Pythagorean theorem: 6² + 8² = 100, 11² = 121. Since 100 < 121, the angle opposite the side of length 11 is obtuse.' },
  { id: 't094', comp: 'comp003', type: 'mc', difficulty: 3,
    q: 'In a 30°-60°-90° triangle, the side opposite the 30° angle has length 5. What is the length of the hypotenuse?',
    choices: ['5√(3)', '10', '5/2', '10√(3)'], answer: '10',
    explanation: 'In a 30-60-90 triangle, the hypotenuse is twice the shorter leg. So hypotenuse = 2(5) = 10.' },
  { id: 't095', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'A 45°-45°-90° triangle has a leg of length 6√(2). What is the length of the hypotenuse?',
    choices: ['6', '12', '6√(2)', '12√(2)'], answer: '12',
    explanation: 'In a 45-45-90 triangle, hypotenuse = leg × √(2). So hypotenuse = 6√(2) × √(2) = 6(2) = 12.' },
  { id: 't096', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'In a parallelogram, consecutive angles are:',
    choices: ['Congruent', 'Supplementary', 'Complementary', 'Vertical'], answer: 'Supplementary',
    explanation: 'In a parallelogram, consecutive angles are supplementary — they sum to 180°.' },
  { id: 't097', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'A quadrilateral has diagonals that are congruent and bisect each other at right angles. What type of quadrilateral is it?',
    choices: ['Parallelogram only', 'Rectangle only', 'Rhombus only', 'Square'], answer: 'Square',
    explanation: 'Congruent diagonals → rectangle. Diagonals bisect at right angles → rhombus. A quadrilateral with both properties is a square.' },
  { id: 't098', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'An inscribed angle intercepts an arc of 80°. What is the measure of the inscribed angle?',
    choices: ['40°', '80°', '160°', '20°'], answer: '40°',
    explanation: 'The inscribed angle is half the measure of its intercepted arc. So 80°/2 = 40°.' },
  { id: 't099', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'A sector of a circle with radius 9 has a central angle of 120°. What is the area of the sector?',
    choices: ['27π', '81π', '54π', '9π'], answer: '27π',
    explanation: 'Sector area = (θ/360°) × πr² = (120/360) × π(81) = (1/3)(81π) = 27π.' },
  { id: 't100', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'A trapezoid has bases of length 6 and 10 and a height of 4. What is its area?',
    choices: ['32', '64', '24', '40'], answer: '32',
    explanation: 'Area of trapezoid = (1/2)(b₁ + b₂)h = (1/2)(6 + 10)(4) = (1/2)(16)(4) = 32.' },
  { id: 't101', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'A right circular cone has radius 4 and height 9. What is its volume?',
    choices: ['36π', '48π', '144π', '108π'], answer: '48π',
    explanation: 'V = (1/3)πr²h = (1/3)π(16)(9) = 48π.' },
  { id: 't102', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'A sphere has a volume of 36π. What is its surface area?',
    choices: ['24π', '36π', '48π', '72π'], answer: '36π',
    explanation: 'V = (4/3)πr³ = 36π ⇒ r³ = 27 ⇒ r = 3. SA = 4πr² = 4π(9) = 36π.' },
  { id: 't103', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'What is the distance between the points (−2, 3) and (4, 7)?',
    choices: ['2√(13)', '√(52)', '10', '2√(5)'], answer: '2√(13)',
    explanation: 'd = √[(4−(−2))² + (7−3)²] = √[36 + 16] = √(52) = 2√(13).' },
  { id: 't104', comp: 'comp003', type: 'mc', difficulty: 3,
    q: 'The midpoint of the segment joining (a, b) and (c, d) is (5, −1). If (a, b) = (2, 3), what is (c, d)?',
    choices: ['(8, −5)', '(7, −4)', '(3.5, 1)', '(8, 1)'], answer: '(8, −5)',
    explanation: 'Midpoint = ((a+c)/2, (b+d)/2) = (5, −1). So (2+c)/2 = 5 ⇒ c = 8, and (3+d)/2 = −1 ⇒ d = −5.' },
  { id: 't105', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'A dilation with center at the origin and scale factor 1/2 maps the point (8, −6) to which point?',
    choices: ['(4, −3)', '(16, −12)', '(4, 3)', '(−4, 3)'], answer: '(4, −3)',
    explanation: 'Under dilation from the origin, (x, y) → (kx, ky). So (8, −6) → ((1/2)(8), (1/2)(−6)) = (4, −3).' },
  { id: 't106', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'In a right triangle, the side adjacent to a 35° angle has length 12. What is the length of the hypotenuse, to the nearest tenth?',
    choices: ['14.6', '20.9', '7.0', '6.9'], answer: '14.6',
    explanation: 'cos(35°) = adjacent/hypotenuse = 12/h. So h = 12/cos(35°) ≈ 12/0.819 ≈ 14.6.' },
  { id: 't107', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'Convert 3.2 kilometers to meters.',
    choices: ['320', '3200', '0.0032', '32'], answer: '3200',
    explanation: '1 km = 1000 m. So 3.2 km = 3.2 × 1000 = 3200 m.' },
  { id: 't108', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'A central angle of 72° intercepts an arc of a circle. If the radius is 5, what is the arc length?',
    choices: ['2π', '5π', '4π', '10π'], answer: '2π',
    explanation: 'Arc length = (θ/360°) × 2πr = (72/360) × 2π(5) = (1/5)(10π) = 2π.' },

  // ═══════════════════════════════════════════════
  // DOMAIN IV: Probability and Statistics
  // ═══════════════════════════════════════════════

  { id: 't027', comp: 'comp004', type: 'mc', difficulty: 1,
    q: 'A fair die is rolled. What is P(rolling a 4 or 5)?',
    choices: ['1/6', '1/3', '1/2', '2/3'], answer: '1/3',
    explanation: 'P(4) = 1/6, P(5) = 1/6. P(4 or 5) = 1/6 + 1/6 = 2/6 = 1/3.' },
  { id: 't028', comp: 'comp004', type: 'mc', difficulty: 3,
    q: 'Data: 3, 7, 7, 9, 12. What is the mean?',
    choices: ['7', '7.6', '8', '9'], answer: '7.6',
    explanation: 'Mean = (3 + 7 + 7 + 9 + 12) / 5 = 38/5 = 7.6.' },
  { id: 't029', comp: 'comp004', type: 'mc', difficulty: 3,
    q: 'Two cards are drawn from a standard deck without replacement. What is P(both are aces)?',
    choices: ['4/52 × 3/51', '4/52 × 4/51', '1/52 × 1/51', '4/52 + 3/51'], answer: '4/52 × 3/51',
    explanation: 'P(first ace) = 4/52. P(second ace | first ace) = 3/51. Multiply for independent events in sequence.' },
  { id: 't030', comp: 'comp004', type: 'mc', difficulty: 3,
    q: 'Which measure is most affected by outliers?',
    choices: ['Median', 'Mode', 'Mean', 'Range'], answer: 'Mean',
    explanation: 'The mean uses every value, so extreme outliers can pull it greatly. Median and mode are more resistant.' },
  { id: 't031', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'A normal distribution has mean 50 and standard deviation 10. Approximately what percent of data falls between 40 and 60?',
    choices: ['34%', '68%', '95%', '99.7%'], answer: '68%',
    explanation: 'Within one standard deviation of the mean: about 68% of data (empirical rule).' },
  { id: 't032', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'Data set A has a larger standard deviation than set B. What does this imply?',
    choices: ['A has more data points', 'A has greater spread', 'A has a higher mean', 'A has a higher median'], answer: 'A has greater spread',
    explanation: 'Standard deviation measures spread/variability. Larger SD means data are more spread out.' },
  { id: 't033', comp: 'comp004', type: 'mc', difficulty: 3,
    q: 'A box contains 3 red and 5 blue marbles. Two are drawn with replacement. P(both red)?',
    choices: ['9/64', '3/8', '3/28', '9/56'], answer: '9/64',
    explanation: 'P(red) = 3/8 each draw. With replacement: (3/8)(3/8) = 9/64.' },
  { id: 't034', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'Which graph best shows the relationship between two variables that have correlation r = −0.9?',
    choices: ['Strong positive linear', 'Strong negative linear', 'No pattern', 'Curved'], answer: 'Strong negative linear',
    explanation: 'r = −0.9 indicates a strong negative linear correlation — as one increases, the other decreases.' },

  // ═══════════════════════════════════════════════
  // DOMAIN V: Mathematical Processes
  // ═══════════════════════════════════════════════

  { id: 't035', comp: 'comp005', type: 'mc', difficulty: 3,
    q: 'A student solves 2x + 5 = 11 by first writing 2x = 6. Which property justifies this step?',
    choices: ['Distributive', 'Subtraction property of equality', 'Addition property of equality', 'Symmetric'], answer: 'Subtraction property of equality',
    explanation: 'Subtracting 5 from both sides: 2x + 5 − 5 = 11 − 5 → 2x = 6. This uses the subtraction property of equality.' },
  { id: 't036', comp: 'comp005', type: 'mc', difficulty: 3,
    q: 'Which is an example of inductive reasoning?',
    choices: [
      'All primes > 2 are odd; therefore 7 is odd.',
      '1+2=3, 2+3=5, 3+4=7; the sum of consecutive integers is odd.',
      'If n is even, then n² is even. 6 is even, so 36 is even.',
      'For all n, 2n is even by definition.'
    ], answer: '1+2=3, 2+3=5, 3+4=7; the sum of consecutive integers is odd.',
    explanation: 'Inductive reasoning uses specific examples to form a general conclusion. The other options use deductive logic.' },
  { id: 't037', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'A problem asks for the number of diagonals in a convex n-gon. Which approach builds procedural fluency?',
    choices: ['Memorizing the formula n(n−3)/2 only', 'Deriving from the pattern for triangle, quadrilateral, pentagon', 'Using a calculator only', 'Looking up the answer'], answer: 'Deriving from the pattern for triangle, quadrilateral, pentagon',
    explanation: 'Building from specific cases (triangle=0, quadrilateral=2, pentagon=5) develops understanding and procedural fluency.' },
  { id: 't038', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'A student writes "3 + 2x" instead of "2x + 3" and gets marked wrong. What principle is violated?',
    choices: ['Order of operations', 'Commutative property', 'The teacher\'s preference', 'Distributive property'], answer: 'Commutative property',
    explanation: 'Addition is commutative: a + b = b + a. So 3 + 2x = 2x + 3. The answer should not be marked wrong; both are correct.' },
  { id: 't039', comp: 'comp005', type: 'mc', difficulty: 3,
    q: 'Which best describes mathematical modeling?',
    choices: ['Memorizing formulas', 'Using real-world contexts to formulate and solve problems', 'Only solving textbook problems', 'Using a calculator'], answer: 'Using real-world contexts to formulate and solve problems',
    explanation: 'Mathematical modeling involves translating real-world situations into mathematical form, solving, and interpreting results.' },
  { id: 't040', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'A proof shows that if n² is even, then n is even. What type of reasoning is typically used?',
    choices: ['Induction', 'Direct proof', 'Proof by contrapositive', 'Counterexample'], answer: 'Proof by contrapositive',
    explanation: "The contrapositive of 'if n² even then n even' is 'if n odd then n² odd' — often easier to prove directly." },
  { id: 't041', comp: 'comp005', type: 'mc', difficulty: 3,
    q: 'Which strategy helps students understand why the area of a triangle is ½bh?',
    choices: ['Rote memorization only', 'Showing that two congruent triangles form a parallelogram', 'Using only the formula', 'Skipping the derivation'], answer: 'Showing that two congruent triangles form a parallelogram',
    explanation: 'Two congruent triangles form a parallelogram with area bh, so one triangle has area ½bh. This builds conceptual understanding.' },
  { id: 't042', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'What does "productive struggle" promote in math class?',
    choices: ['Immediate answers', 'Frustration with no support', 'Sense-making and persistence', 'Avoiding difficult problems'], answer: 'Sense-making and persistence',
    explanation: 'Productive struggle — grappling with challenging problems with appropriate support — builds perseverance and deep understanding.' },

  // ═══════════════════════════════════════════════
  // DOMAIN IV: Probability and Statistics (additional)
  // ═══════════════════════════════════════════════

  { id: 't109', comp: 'comp004', type: 'mc', difficulty: 1,
    q: 'A bag contains 4 red, 3 blue, and 5 green marbles. What is P(drawing a red marble)?',
    choices: ['1/3', '1/4', '1/2', '4/9'], answer: '1/3',
    explanation: 'P(red) = 4/(4+3+5) = 4/12 = 1/3.' },
  { id: 't110', comp: 'comp004', type: 'mc', difficulty: 1,
    q: 'Find the median of: 2, 5, 8, 12, 15.',
    choices: ['5', '8', '8.4', '12'], answer: '8',
    explanation: 'The median is the middle value when ordered. With 5 values, the 3rd value is 8.' },
  { id: 't111', comp: 'comp004', type: 'mc', difficulty: 1,
    q: 'What is the range of the data set 3, 7, 9, 12, 15?',
    choices: ['6', '9', '12', '15'], answer: '12',
    explanation: 'Range = max − min = 15 − 3 = 12.' },
  { id: 't112', comp: 'comp004', type: 'mc', difficulty: 1,
    q: 'In how many ways can 4 students be seated in a row of 4 chairs?',
    choices: ['4', '8', '16', '24'], answer: '24',
    explanation: '4! = 4 × 3 × 2 × 1 = 24 permutations.' },
  { id: 't113', comp: 'comp004', type: 'mc', difficulty: 1,
    q: 'A fair coin is flipped twice. What is P(two heads)?',
    choices: ['1/4', '1/2', '3/4', '1'], answer: '1/4',
    explanation: 'P(HH) = (1/2)(1/2) = 1/4. Independent events.' },
  { id: 't114', comp: 'comp004', type: 'mc', difficulty: 1,
    q: 'Which measure of center is found by summing all values and dividing by the count?',
    choices: ['Median', 'Mode', 'Mean', 'Range'], answer: 'Mean',
    explanation: 'Mean = sum of values / number of values.' },
  { id: 't115', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'P(A) = 0.4, P(B) = 0.5, and A and B are independent. What is P(A and B)?',
    choices: ['0.2', '0.9', '0.1', '0.45'], answer: '0.2',
    explanation: 'For independent events: P(A and B) = P(A) × P(B) = 0.4 × 0.5 = 0.2.' },
  { id: 't116', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'Given P(A) = 0.3 and P(B|A) = 0.6, what is P(A and B)?',
    choices: ['0.18', '0.9', '0.5', '0.2'], answer: '0.18',
    explanation: 'P(A and B) = P(A) × P(B|A) = 0.3 × 0.6 = 0.18.' },
  { id: 't117', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'A game pays $5 with probability 0.2 and $0 otherwise. What is the expected value?',
    choices: ['$1', '$2.50', '$5', '$0.20'], answer: '$1',
    explanation: 'E(X) = 5(0.2) + 0(0.8) = 1.' },
  { id: 't118', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'How many 3-person committees can be formed from 8 people?',
    choices: ['24', '56', '336', '512'], answer: '56',
    explanation: 'C(8,3) = 8!/(3!5!) = (8×7×6)/(3×2×1) = 56.' },
  { id: 't119', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'A data set has mean 70 and standard deviation 5. About what percent of values lie above 75?',
    choices: ['16%', '34%', '50%', '68%'], answer: '16%',
    explanation: '75 is one SD above the mean. About 16% lie above one SD (half of the 32% outside ±1 SD).' },
  { id: 't120', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'In a box plot, the "box" represents which portion of the data?',
    choices: ['The middle 25%', 'The middle 50%', 'The middle 75%', 'All the data'], answer: 'The middle 50%',
    explanation: 'The box spans Q1 to Q3, representing the interquartile range (middle 50%).' },
  { id: 't121', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'A histogram is skewed right. Which statement is most likely true?',
    choices: ['Mean < median', 'Mean = median', 'Mean > median', 'Mode is highest'], answer: 'Mean > median',
    explanation: 'Right skew pulls the mean toward the tail; mean is typically greater than median.' },
  { id: 't122', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'A regression line has slope 2.3. For each 1-unit increase in x, y changes by:',
    choices: ['1 unit', '2.3 units', '0.43 units', 'Cannot determine'], answer: '2.3 units',
    explanation: 'Slope is the rate of change: Δy/Δx. Slope 2.3 means y increases 2.3 per 1-unit increase in x.' },
  { id: 't123', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'A researcher selects every 10th student from an alphabetical list. This is an example of:',
    choices: ['Simple random sampling', 'Stratified sampling', 'Systematic sampling', 'Cluster sampling'], answer: 'Systematic sampling',
    explanation: 'Systematic sampling uses a fixed interval (every kth element) from an ordered list.' },
  { id: 't124', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'A die is rolled 60 times; a 6 appears 8 times. The experimental probability of 6 is:',
    choices: ['1/6', '8/60', '1/8', '52/60'], answer: '8/60',
    explanation: 'Experimental probability = observed frequency / total trials = 8/60.' },
  { id: 't125', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'Drawing two cards from a deck without replacement is an example of:',
    choices: ['Independent events', 'Dependent events', 'Mutually exclusive events', 'Complementary events'], answer: 'Dependent events',
    explanation: 'The second draw depends on the first; probabilities change after each draw.' },
  { id: 't126', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'A two-way table shows 20 students like math, 15 like science, and 8 like both. How many like math or science?',
    choices: ['27', '35', '43', '8'], answer: '27',
    explanation: 'P(A or B) = P(A) + P(B) − P(A and B). Count: 20 + 15 − 8 = 27.' },
  { id: 't127', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'Correlation r = 0.85 indicates:',
    choices: ['Strong negative relationship', 'Strong positive relationship', 'No relationship', 'Causal relationship'], answer: 'Strong positive relationship',
    explanation: 'r close to 1 indicates strong positive linear correlation.' },
  { id: 't128', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'Within 2 standard deviations of the mean in a normal distribution, about what percent of data lies?',
    choices: ['68%', '95%', '99.7%', '100%'], answer: '95%',
    explanation: 'Empirical rule: about 95% of data falls within 2 standard deviations of the mean.' },
  { id: 't129', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'Which sampling method divides the population into subgroups and randomly samples from each?',
    choices: ['Convenience', 'Stratified', 'Cluster', 'Voluntary'], answer: 'Stratified',
    explanation: 'Stratified sampling divides the population into strata and samples from each subgroup.' },
  { id: 't130', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'The theoretical probability of rolling a sum of 7 with two dice is 6/36. After 180 rolls, about how many 7s would you expect?',
    choices: ['30', '36', '42', '60'], answer: '30',
    explanation: 'Expected count = (6/36) × 180 = 30.' },

  // ═══════════════════════════════════════════════
  // DOMAIN V: Mathematical Processes (additional)
  // ═══════════════════════════════════════════════

  { id: 't131', comp: 'comp005', type: 'mc', difficulty: 1,
    q: 'Which problem-solving strategy involves working backward from the desired result?',
    choices: ['Guess and check', 'Working backward', 'Drawing a diagram', 'Making a table'], answer: 'Working backward',
    explanation: 'Working backward starts from the goal and reverses the steps to find the solution path.' },
  { id: 't132', comp: 'comp005', type: 'mc', difficulty: 1,
    q: 'A student estimates 47 × 23 as 50 × 20 = 1000. The actual product is 1081. Is the estimate reasonable?',
    choices: ['Yes, within 10%', 'No, far off', 'Cannot tell', 'Exactly correct'], answer: 'Yes, within 10%',
    explanation: '1081 is about 8% higher than 1000; estimates within 10% are generally considered reasonable.' },
  { id: 't133', comp: 'comp005', type: 'mc', difficulty: 1,
    q: 'Which term describes reasoning from general principles to specific conclusions?',
    choices: ['Inductive', 'Deductive', 'Abductive', 'Analogical'], answer: 'Deductive',
    explanation: 'Deductive reasoning applies general rules to reach specific conclusions.' },
  { id: 't134', comp: 'comp005', type: 'mc', difficulty: 1,
    q: 'To disprove "All prime numbers are odd," one would use a:',
    choices: ['Direct proof', 'Counterexample', 'Proof by contradiction', 'Inductive argument'], answer: 'Counterexample',
    explanation: 'A single counterexample (e.g., 2) disproves a universal statement.' },
  { id: 't135', comp: 'comp005', type: 'mc', difficulty: 1,
    q: 'Which representation helps students see the part-whole structure of fractions?',
    choices: ['Number line only', 'Area model', 'Symbols only', 'Word problems only'], answer: 'Area model',
    explanation: 'Area models (e.g., circles, rectangles) visually show parts of a whole.' },
  { id: 't136', comp: 'comp005', type: 'mc', difficulty: 1,
    q: 'A teacher uses a real-world scenario (budgeting for a trip) to teach percentages. This illustrates:',
    choices: ['Rote memorization', 'Mathematical modeling', 'Abstract symbolism only', 'Test prep'], answer: 'Mathematical modeling',
    explanation: 'Mathematical modeling connects math to real-world contexts for formulation and solution.' },
  { id: 't137', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'A student claims "multiplying always makes numbers bigger." Which counterexample is most effective?',
    choices: ['5 × 3 = 15', '0.5 × 4 = 2', '0.5 × 0.5 = 0.25', '−2 × 3 = −6'], answer: '0.5 × 0.5 = 0.25',
    explanation: 'Multiplying two numbers less than 1 produces a smaller number; 0.25 < 0.5.' },
  { id: 't138', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'Which teaching strategy best develops conceptual understanding before procedural fluency?',
    choices: ['Drill worksheets first', 'Use manipulatives and visual models before symbols', 'Memorize formulas only', 'Skip to abstract notation'], answer: 'Use manipulatives and visual models before symbols',
    explanation: 'Concrete-representational-abstract (CRA) sequence builds understanding before formal procedures.' },
  { id: 't139', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'A student writes 2 + 3 × 4 = 20. What type of error did they make?',
    choices: ['Conceptual', 'Order of operations', 'Arithmetic', 'Notation'], answer: 'Order of operations',
    explanation: 'Correct: 2 + 3×4 = 2 + 12 = 14. They likely computed (2+3)×4 = 20, violating PEMDAS.' },
  { id: 't140', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'Which phrase is mathematically precise when describing a relationship?',
    choices: ['"x gets bigger"', '"x increases"', '"the graph goes up"', '"y gets larger as x increases"'], answer: '"y gets larger as x increases"',
    explanation: 'Precise language specifies both variables and the direction of change.' },
  { id: 't141', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'Graphing calculators are most appropriate for exploring:',
    choices: ['Basic addition facts', 'Function behavior and transformations', 'Memorizing formulas', 'Single-step equations'], answer: 'Function behavior and transformations',
    explanation: 'Technology supports exploration of graphs, tables, and dynamic representations of functions.' },
  { id: 't142', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'Connecting slope in algebra to rate of change in science illustrates:',
    choices: ['Isolated skills', 'Mathematical connections across topics', 'Test-taking strategies', 'Memorization'], answer: 'Mathematical connections across topics',
    explanation: 'Making connections across disciplines deepens understanding and transfer.' },
  { id: 't143', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'A proof that assumes the negation of the conclusion and derives a contradiction uses:',
    choices: ['Direct proof', 'Proof by contradiction', 'Induction', 'Counterexample'], answer: 'Proof by contradiction',
    explanation: 'Proof by contradiction assumes the statement is false and shows this leads to a logical contradiction.' },
  { id: 't144', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'When a student says "borrow" instead of "regroup" in subtraction, the teacher should:',
    choices: ['Ignore the terminology', 'Correct to precise language: regrouping', 'Mark it wrong', 'Use "borrow" exclusively'], answer: 'Correct to precise language: regrouping',
    explanation: '"Regroup" accurately describes exchanging place values; "borrow" implies something is returned.' },
  { id: 't145', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'Which approach helps students understand why the formula for the area of a trapezoid works?',
    choices: ['Memorizing A = ½(b₁+b₂)h only', 'Decomposing into two triangles or a rectangle and triangles', 'Using only numbers', 'Skipping the derivation'], answer: 'Decomposing into two triangles or a rectangle and triangles',
    explanation: 'Decomposition builds conceptual understanding of how the formula relates to known shapes.' },
  { id: 't146', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'A student solves 2(x+3) = 10 by writing 2x+6 = 10. Which property is applied?',
    choices: ['Commutative', 'Associative', 'Distributive', 'Identity'], answer: 'Distributive',
    explanation: 'Distributive property: a(b+c) = ab + ac. Here 2(x+3) = 2x + 6.' },
  { id: 't147', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'Pedagogical content knowledge (PCK) in math refers to:',
    choices: ['Knowing math content only', 'Knowing how to teach math effectively', 'Student management only', 'Assessment design only'], answer: 'Knowing how to teach math effectively',
    explanation: 'PCK combines content knowledge with knowledge of how students learn and common misconceptions.' },
  { id: 't148', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'A student consistently adds denominators when adding fractions (e.g., 1/2 + 1/3 = 2/5). This suggests:',
    choices: ['A procedural error only', 'A conceptual misunderstanding of fraction addition', 'Carelessness', 'Correct method'], answer: 'A conceptual misunderstanding of fraction addition',
    explanation: 'Adding denominators indicates confusion about what fractions represent and why common denominators are needed.' },
  { id: 't149', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'Which representation of a linear relationship is most useful for finding the y-intercept?',
    choices: ['Table of values', 'Graph', 'Equation in slope-intercept form', 'Verbal description'], answer: 'Equation in slope-intercept form',
    explanation: 'y = mx + b directly shows the y-intercept as b.' },
  { id: 't150', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'Estimating before calculating helps students:',
    choices: ['Avoid doing the actual problem', 'Check reasonableness of answers', 'Finish faster', 'Skip steps'], answer: 'Check reasonableness of answers',
    explanation: 'Estimation provides a ballpark to verify that computed answers make sense.' },
  { id: 't151', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'Inductive reasoning is used when:',
    choices: ['Proving a theorem from axioms', 'Observing a pattern and forming a conjecture', 'Using a counterexample', 'Applying a known formula'], answer: 'Observing a pattern and forming a conjecture',
    explanation: 'Inductive reasoning generalizes from specific examples to a broader conclusion.' },
  { id: 't152', comp: 'comp005', type: 'mc', difficulty: 2,
    q: 'When analyzing student work, identifying that a student used the wrong formula for the area of a circle reflects:',
    choices: ['Error analysis', 'Grading only', 'Punishment', 'Ignoring the mistake'], answer: 'Error analysis',
    explanation: 'Error analysis examines what went wrong to inform instruction and address misconceptions.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 004 — Patterns (tp01–tp08)
  // ═══════════════════════════════════════════════
  { id: 'tp01', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'What is the 20th term of the arithmetic sequence 5, 8, 11, 14, …?',
    choices: ['62', '63', '65', '60'], answer: '62',
    explanation: 'a_n = a_1 + (n−1)d = 5 + 19(3) = 62.' },
  { id: 'tp02', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'Find the sum of the first 10 terms of the geometric series with a₁ = 3 and r = 2.',
    choices: ['3069', '3072', '1023', '6141'], answer: '3069',
    explanation: 'S_n = a₁(rⁿ − 1)/(r − 1) = 3(2¹⁰ − 1)/(2 − 1) = 3(1023) = 3069.' },
  { id: 'tp03', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'The principle of mathematical induction requires which two steps?',
    choices: ['Base case and inductive step', 'Hypothesis and conclusion', 'Counterexample and proof', 'Estimate and exact answer'], answer: 'Base case and inductive step',
    explanation: 'Induction requires proving a base case and then showing the statement holds for n+1 if it holds for n.' },
  { id: 'tp04', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'A recursive sequence is defined by a₁ = 2 and aₙ = aₙ₋₁ + 5. What is a₆?',
    choices: ['27', '32', '22', '25'], answer: '27',
    explanation: 'a₂ = 7, a₃ = 12, a₄ = 17, a₅ = 22, a₆ = 27.' },
  { id: 'tp05', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'An investment of $1,000 earns 5% annual interest compounded yearly. Which expression gives the value after n years?',
    choices: ['1000(1.05)ⁿ', '1000 + 50n', '1000(0.95)ⁿ', '1050n'], answer: '1000(1.05)ⁿ',
    explanation: 'Compound interest: A = P(1 + r)ⁿ = 1000(1.05)ⁿ.' },
  { id: 'tp06', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'In the Fibonacci sequence (1, 1, 2, 3, 5, 8, …), what is the 8th term?',
    choices: ['21', '13', '34', '8'], answer: '21',
    explanation: 'Fibonacci: 1,1,2,3,5,8,13,21. The 8th term is 21.' },
  { id: 'tp07', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'What is the sum of the first 5 terms of the arithmetic series 2 + 7 + 12 + 17 + …?',
    choices: ['60', '55', '50', '65'], answer: '60',
    explanation: 'S_n = n/2 · (2a₁ + (n−1)d) = 5/2 · (4 + 20) = 5/2 · 24 = 60. Or just add: 2+7+12+17+22 = 60.' },
  { id: 'tp08', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'What is the sum of the infinite geometric series 27 + 9 + 3 + 1 + …?',
    choices: ['40.5', '81', '36', '54'], answer: '40.5',
    explanation: 'S = a/(1 − r) = 27/(1 − 1/3) = 27/(2/3) = 40.5.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 005 — Functions, Relations & Graphs (tf01–tf08)
  // ═══════════════════════════════════════════════
  { id: 'tf01', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'Which relation is a function?',
    choices: ['{(1,2), (1,5), (3,4)}', '{(-2,1), (0,3), (4,7)}', '{(2,6), (3,6), (2,8)}', '{(0,0), (0,1), (1,1)}'], answer: '{(-2,1), (0,3), (4,7)}',
    explanation: 'A relation is a function when each input x has exactly one output y. Only the second set has no repeated x-values with different outputs.' },
  { id: 'tf02', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'What is the domain of f(x) = (x + 1)/(x - 3)?',
    choices: ['All real numbers', 'x != -1', 'x != 3', 'x > 3'], answer: 'x != 3',
    explanation: 'The denominator cannot be 0. So x - 3 != 0, which means x != 3.' },
  { id: 'tf03', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'If f(1)=4, f(2)=7, and f(3)=10, what is f(4) for the linear rule shown by this table?',
    choices: ['11', '12', '13', '14'], answer: '13',
    explanation: 'Outputs increase by 3 each time, so the next value is 10 + 3 = 13.' },
  { id: 'tf04', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'If f(x) = 5x - 9, what is f^-1(x)?',
    choices: ['(x + 9)/5', '(x - 9)/5', '5x + 9', '1/(5x - 9)'], answer: '(x + 9)/5',
    explanation: 'Set y = 5x - 9. Swap x and y: x = 5y - 9. Solve for y: y = (x + 9)/5.' },
  { id: 'tf05', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'Let f(x) = √(x - 1) and g(x) = 2x + 3. What is the domain of (f o g)(x)?',
    choices: ['x >= 1', 'x >= -1', 'x >= -1/2', 'all real numbers'], answer: 'x >= -1',
    explanation: '(f o g)(x) = √((2x + 3) - 1) = √(2x + 2). Require 2x + 2 >= 0, so x >= -1.' },
  { id: 'tf06', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'For h(x) = -2|x - 4| + 7, which statement is true?',
    choices: ['Vertex (4, 7) and opens downward', 'Vertex (-4, 7) and opens upward', 'Vertex (4, -7) and opens downward', 'Vertex (7, 4) and opens upward'], answer: 'Vertex (4, 7) and opens downward',
    explanation: 'In a|x-h|+k, vertex is (h,k). Here h=4, k=7. Since a=-2 < 0, the graph opens downward.' },
  { id: 'tf07', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'On which interval is f(x) = x^2 one-to-one?',
    choices: ['(-infinity, infinity)', '[0, infinity)', '[-2, 2]', '(-2, 2)'], answer: '[0, infinity)',
    explanation: 'x^2 is not one-to-one on all real numbers because f(2)=f(-2). Restricting to x >= 0 makes it strictly increasing and one-to-one.' },
  { id: 'tf08', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'For f(x) = {2x+1, x<2; kx-3, x>=2}, what value of k makes f continuous at x=2?',
    choices: ['k = 1', 'k = 2', 'k = 3', 'k = 4'], answer: 'k = 4',
    explanation: 'Left value at x=2 is 2(2)+1 = 5. Right value is 2k-3. Set equal: 2k-3=5 -> 2k=8 -> k=4.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 008 — Exponential & Logarithmic (te01–te08)
  // ═══════════════════════════════════════════════
  { id: 'te01', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'Simplify: log₂(32)',
    choices: ['4', '5', '6', '16'], answer: '5',
    explanation: '2⁵ = 32, so log₂(32) = 5.' },
  { id: 'te02', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'If f(x) = 3ˣ, what is f(4)?',
    choices: ['12', '81', '64', '27'], answer: '81',
    explanation: '3⁴ = 81.' },
  { id: 'te03', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'Solve for x: 2ˣ = 16',
    choices: ['2', '3', '4', '8'], answer: '4',
    explanation: '2⁴ = 16, so x = 4.' },
  { id: 'te04', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Which property is used to simplify log(ab) = log a + log b?',
    choices: ['Power rule', 'Product rule', 'Quotient rule', 'Change of base'], answer: 'Product rule',
    explanation: 'The product rule of logarithms states log(ab) = log a + log b.' },
  { id: 'te05', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'A bacteria colony doubles every 3 hours. Starting with 100 bacteria, which models the population after t hours?',
    choices: ['100(2)^(t/3)', '100 + 2t', '200t', '100(3)^(t/2)'], answer: '100(2)^(t/3)',
    explanation: 'Doubling every 3 hours: P(t) = 100 · 2^(t/3).' },
  { id: 'te06', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'The Richter scale is logarithmic. An earthquake of magnitude 7 is how many times more intense than magnitude 5?',
    choices: ['2', '20', '100', '1000'], answer: '100',
    explanation: 'Each unit is 10× more intense: 10^(7−5) = 10² = 100.' },
  { id: 'te07', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'What is the y-intercept of f(x) = 5 · 2ˣ?',
    choices: ['2', '5', '10', '0'], answer: '5',
    explanation: 'f(0) = 5 · 2⁰ = 5 · 1 = 5.' },
  { id: 'te08', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Solve: log₃(x) + log₃(x − 2) = 1',
    choices: ['3', '−1', '3 and −1', 'No solution'], answer: '3',
    explanation: 'log₃(x(x−2)) = 1 → x² − 2x = 3 → x² − 2x − 3 = 0 → (x−3)(x+1) = 0. Since x must be positive, x = 3.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 007 — Polynomial, Rational, Radical, Absolute Value, Piecewise (tr01–tr08)
  // ═══════════════════════════════════════════════
  { id: 'tr01', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'Factor completely: x^2 - 16',
    choices: ['(x - 8)(x + 2)', '(x - 4)(x + 4)', '(x - 2)(x + 8)', '(x - 16)(x + 1)'], answer: '(x - 4)(x + 4)',
    explanation: 'x^2 - 16 is a difference of squares: a^2 - b^2 = (a-b)(a+b).' },
  { id: 'tr02', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'Simplify √(48).',
    choices: ['2√(12)', '4√(3)', '6√(2)', '8√(3)'], answer: '4√(3)',
    explanation: '√(48) = √(16*3) = 4√(3).' },
  { id: 'tr03', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'Solve |x - 5| = 2.',
    choices: ['x = 3 or x = 7', 'x = 5 only', 'x = -3 or x = -7', 'no solution'], answer: 'x = 3 or x = 7',
    explanation: '|x-5|=2 gives x-5=2 or x-5=-2, so x=7 or x=3.' },
  { id: 'tr04', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'Simplify: 1/x + 1/x',
    choices: ['1/x^2', '2/x', '2x', 'x/2'], answer: '2/x',
    explanation: 'Like terms with the same denominator add: 1/x + 1/x = 2/x.' },
  { id: 'tr05', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'If P(x) = x^3 - 4x^2 + x + 6, what is the remainder when P(x) is divided by x - 2?',
    choices: ['-4', '0', '2', '6'], answer: '0',
    explanation: 'By the Remainder Theorem, remainder is P(2)=8-16+2+6=0.' },
  { id: 'tr06', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'Solve the inequality: (x - 1)/(x + 2) < 0.',
    choices: ['(-2, 1)', '(-infinity, -2) U (1, infinity)', '(-infinity, 1)', '(-2, infinity)'], answer: '(-2, 1)',
    explanation: 'Critical values are x=-2 (undefined) and x=1 (zero). Test intervals show expression is negative only on (-2,1).' },
  { id: 'tr07', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'Solve √(x + 5) = x - 1.',
    choices: ['x = 4', 'x = -2', 'x = 4 and x = -2', 'no solution'], answer: 'x = 4',
    explanation: 'Require x-1 >= 0 so x >= 1. Square: x+5 = (x-1)^2 = x^2 - 2x + 1 -> x^2 - 3x - 4 = 0 -> (x-4)(x+1)=0. Only x=4 satisfies original equation.' },
  { id: 'tr08', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'For f(x) = |x - 2| + |x + 1|, what is the minimum value of f(x)?',
    choices: ['1', '2', '3', '4'], answer: '3',
    explanation: 'The sum of distances to -1 and 2 is minimized for any x between -1 and 2, and that minimum equals the distance between endpoints: 2 - (-1) = 3.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 009 — Trigonometric & Circular (tg01–tg10)
  // ═══════════════════════════════════════════════
  { id: 'tg01', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'What is sin(30°)?',
    choices: ['1/2', '(√(2))/2', '(√(3))/2', '1'], answer: '1/2',
    explanation: 'sin(30°) = 1/2 is a standard unit circle value.' },
  { id: 'tg02', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'What is the period of y = sin(x)?',
    choices: ['π', '2π', 'π/2', '4π'], answer: '2π',
    explanation: 'The standard sine function has period 2π.' },
  { id: 'tg03', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'If cos(θ) = −3/5 and θ is in Quadrant III, what is sin(θ)?',
    choices: ['4/5', '−4/5', '3/5', '−3/5'], answer: '−4/5',
    explanation: 'In Q III both sin and cos are negative. sin²θ + cos²θ = 1 → sin²θ = 1 − 9/25 = 16/25 → sin θ = −4/5.' },
  { id: 'tg04', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'Which identity is equivalent to sin²θ + cos²θ?',
    choices: ['0', '1', 'tan²θ', '2sinθcosθ'], answer: '1',
    explanation: 'The Pythagorean identity: sin²θ + cos²θ = 1.' },
  { id: 'tg05', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'What is the amplitude and period of y = 3sin(2x)?',
    choices: ['Amplitude 3, period π', 'Amplitude 2, period 3π', 'Amplitude 3, period 2π', 'Amplitude 6, period π'], answer: 'Amplitude 3, period π',
    explanation: 'For y = A sin(Bx): amplitude = |A| = 3, period = 2π/|B| = 2π/2 = π.' },
  { id: 'tg06', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'On the unit circle, what are the coordinates at angle π/2?',
    choices: ['(0, 1)', '(1, 0)', '(−1, 0)', '(0, −1)'], answer: '(0, 1)',
    explanation: 'At π/2 (90°), the point is (cos π/2, sin π/2) = (0, 1).' },
  { id: 'tg07', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Simplify: tan(θ) · cos(θ)',
    choices: ['sin(θ)', 'cos(θ)', '1', 'sec(θ)'], answer: 'sin(θ)',
    explanation: 'tan θ · cos θ = (sin θ / cos θ) · cos θ = sin θ.' },
  { id: 'tg08', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'What is cos(π/3)?',
    choices: ['1/2', '(√(3))/2', '(√(2))/2', '0'], answer: '1/2',
    explanation: 'cos(60°) = cos(π/3) = 1/2.' },
  { id: 'tg09', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'The function y = sin(x − π/4) is the graph of y = sin(x) shifted:',
    choices: ['Left π/4', 'Right π/4', 'Up π/4', 'Down π/4'], answer: 'Right π/4',
    explanation: 'y = sin(x − c) shifts the graph right by c units.' },
  { id: 'tg10', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'If sin⁻¹(x) = π/6, what is x?',
    choices: ['1/2', '(√(3))/2', '(√(2))/2', '1'], answer: '1/2',
    explanation: 'sin(π/6) = 1/2, so sin⁻¹(1/2) = π/6, meaning x = 1/2.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 010 — Differential & Integral Calculus (td01–td10)
  // ═══════════════════════════════════════════════
  { id: 'td01', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'What is lim(x→2) (x² − 4)/(x − 2)?',
    choices: ['0', '2', '4', 'Does not exist'], answer: '4',
    explanation: '(x² − 4)/(x − 2) = (x+2)(x−2)/(x−2) = x + 2. At x = 2: 2 + 2 = 4.' },
  { id: 'td02', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'If f(x) = 3x², what is f′(x)?',
    choices: ['3x', '6x', '6x²', '3'], answer: '6x',
    explanation: 'Power rule: d/dx(3x²) = 6x.' },
  { id: 'td03', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'The derivative of a function at a point gives the:',
    choices: ['Area under the curve', 'Slope of the tangent line', 'Y-intercept', 'Maximum value'], answer: 'Slope of the tangent line',
    explanation: 'The derivative at a point is the instantaneous rate of change, i.e., the slope of the tangent line.' },
  { id: 'td04', comp: 'comp002', type: 'mc', difficulty: 3,
    q: 'Find ∫(2x + 3) dx.',
    choices: ['x² + 3x + C', '2x² + 3x + C', 'x² + 3 + C', '2 + C'], answer: 'x² + 3x + C',
    explanation: '∫(2x + 3) dx = x² + 3x + C.' },
  { id: 'td05', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'If f′(x) > 0 on an interval, then f is:',
    choices: ['Decreasing', 'Increasing', 'Constant', 'Concave down'], answer: 'Increasing',
    explanation: 'A positive first derivative means the function is increasing.' },
  { id: 'td06', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'The Fundamental Theorem of Calculus connects:',
    choices: ['Algebra and geometry', 'Differentiation and integration', 'Statistics and probability', 'Trigonometry and calculus'], answer: 'Differentiation and integration',
    explanation: 'The FTC states that differentiation and integration are inverse processes.' },
  { id: 'td07', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'If f″(x) < 0, the graph of f is:',
    choices: ['Concave up', 'Concave down', 'Linear', 'Increasing'], answer: 'Concave down',
    explanation: 'Negative second derivative means the graph is concave down.' },
  { id: 'td08', comp: 'comp002', type: 'mc', difficulty: 1,
    q: 'What is d/dx(5)?',
    choices: ['5', '0', '1', '5x'], answer: '0',
    explanation: 'The derivative of a constant is 0.' },
  { id: 'td09', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'A particle\'s position is s(t) = t³ − 6t. Its velocity at t = 2 is:',
    choices: ['6', '4', '0', '−6'], answer: '6',
    explanation: 'v(t) = s′(t) = 3t² − 6. v(2) = 12 − 6 = 6.' },
  { id: 'td10', comp: 'comp002', type: 'mc', difficulty: 2,
    q: 'Evaluate: ∫₀² (4x) dx',
    choices: ['4', '8', '16', '2'], answer: '8',
    explanation: '∫₀² 4x dx = [2x²]₀² = 2(4) − 0 = 8.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 013 — Euclidean Geometry extra (tga01–tga04)
  // ═══════════════════════════════════════════════
  { id: 'tga01', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'A regular pentagon has how many lines of symmetry?',
    choices: ['3', '5', '4', '10'], answer: '5',
    explanation: 'A regular n-gon has n lines of symmetry. A pentagon has 5.' },
  { id: 'tga02', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'A cross-section of a cone parallel to the base produces what shape?',
    choices: ['Triangle', 'Circle', 'Ellipse', 'Rectangle'], answer: 'Circle',
    explanation: 'A plane parallel to the base of a cone produces a smaller circle.' },
  { id: 'tga03', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'In a circle, a tangent line at point P is ______ to the radius at P.',
    choices: ['Parallel', 'Perpendicular', 'Congruent', 'Bisecting'], answer: 'Perpendicular',
    explanation: 'A tangent to a circle is always perpendicular to the radius at the point of tangency.' },
  { id: 'tga04', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'The sum of interior angles of a quadrilateral is:',
    choices: ['180°', '360°', '540°', '720°'], answer: '360°',
    explanation: 'Sum of interior angles = (n − 2) · 180° = 2 · 180° = 360°.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 014 — Coordinate, Transformational & Vector Geometry (tv01–tv06)
  // ═══════════════════════════════════════════════
  { id: 'tv01', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'Which equation represents a circle with center (3, −2) and radius 5?',
    choices: ['(x−3)² + (y+2)² = 25', '(x+3)² + (y−2)² = 25', '(x−3)² + (y−2)² = 5', '(x+3)² + (y+2)² = 5'], answer: '(x−3)² + (y+2)² = 25',
    explanation: 'Standard form: (x−h)² + (y−k)² = r². With center (3,−2) and r = 5: (x−3)² + (y+2)² = 25.' },
  { id: 'tv02', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'A rotation of 90° counterclockwise about the origin maps (x, y) to:',
    choices: ['(−y, x)', '(y, −x)', '(−x, −y)', '(x, −y)'], answer: '(−y, x)',
    explanation: 'A 90° CCW rotation maps (x, y) → (−y, x).' },
  { id: 'tv03', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'A translation maps every point (x, y) to (x + 3, y − 2). Point (1, 5) maps to:',
    choices: ['(4, 3)', '(−2, 7)', '(3, −2)', '(4, 7)'], answer: '(4, 3)',
    explanation: '(1+3, 5−2) = (4, 3).' },
  { id: 'tv04', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'The equation x²/9 + y²/4 = 1 represents:',
    choices: ['A circle', 'An ellipse', 'A hyperbola', 'A parabola'], answer: 'An ellipse',
    explanation: 'x²/a² + y²/b² = 1 with a ≠ b is the standard form of an ellipse.' },
  { id: 'tv05', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'Two lines are perpendicular. If one has slope 2/3, the other has slope:',
    choices: ['2/3', '−2/3', '3/2', '−3/2'], answer: '−3/2',
    explanation: 'Perpendicular slopes are negative reciprocals: −1/(2/3) = −3/2.' },
  { id: 'tv06', comp: 'comp003', type: 'mc', difficulty: 2,
    q: 'A figure has rotational symmetry of order 4. Through what angle can it be rotated onto itself?',
    choices: ['45°', '60°', '90°', '120°'], answer: '90°',
    explanation: 'Order 4 means 360°/4 = 90° rotation maps the figure onto itself.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 017 — Statistical Inference (ts01–ts10)
  // ═══════════════════════════════════════════════
  { id: 'ts01', comp: 'comp004', type: 'mc', difficulty: 3,
    q: 'The Central Limit Theorem states that as sample size increases, the sampling distribution of the mean approaches:',
    choices: ['Uniform distribution', 'Normal distribution', 'Binomial distribution', 'Poisson distribution'], answer: 'Normal distribution',
    explanation: 'By the CLT, sample means approximate a normal distribution as n increases, regardless of the population shape.' },
  { id: 'ts02', comp: 'comp004', type: 'mc', difficulty: 3,
    q: 'A 95% confidence interval means:',
    choices: ['95% of data falls in the interval', '95% of intervals from repeated samples contain the true parameter', 'The probability the parameter is in the interval is 0.95', 'The sample mean is 95% accurate'], answer: '95% of intervals from repeated samples contain the true parameter',
    explanation: 'Confidence level refers to the long-run proportion of intervals that capture the true parameter.' },
  { id: 'ts03', comp: 'comp004', type: 'mc', difficulty: 1,
    q: 'Increasing sample size generally makes a confidence interval:',
    choices: ['Wider', 'Narrower', 'Unchanged', 'Invalid'], answer: 'Narrower',
    explanation: 'Larger samples reduce the standard error, producing narrower confidence intervals.' },
  { id: 'ts04', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'In hypothesis testing, a Type I error is:',
    choices: ['Failing to reject a false null', 'Rejecting a true null hypothesis', 'Accepting the alternative', 'A calculation mistake'], answer: 'Rejecting a true null hypothesis',
    explanation: 'Type I error = false positive: rejecting H₀ when it is actually true.' },
  { id: 'ts05', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'A correlation coefficient of r = −0.92 indicates:',
    choices: ['Weak positive relationship', 'Strong negative relationship', 'No relationship', 'Perfect positive relationship'], answer: 'Strong negative relationship',
    explanation: 'r close to −1 indicates a strong negative linear relationship.' },
  { id: 'ts06', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'In a regression analysis, the residual is the difference between:',
    choices: ['Two predicted values', 'The observed value and the predicted value', 'The mean and the median', 'Two sample means'], answer: 'The observed value and the predicted value',
    explanation: 'Residual = observed y − predicted ŷ.' },
  { id: 'ts07', comp: 'comp004', type: 'mc', difficulty: 1,
    q: 'Which sampling method gives every member of the population an equal chance of selection?',
    choices: ['Convenience sampling', 'Simple random sampling', 'Voluntary response', 'Quota sampling'], answer: 'Simple random sampling',
    explanation: 'SRS ensures equal probability of selection for every individual.' },
  { id: 'ts08', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'The Law of Large Numbers states that as the number of trials increases:',
    choices: ['Variance increases', 'The sample mean converges to the population mean', 'Results become less predictable', 'The mode approaches the median'], answer: 'The sample mean converges to the population mean',
    explanation: 'LLN: x̄ approaches μ as n → ∞.' },
  { id: 'ts09', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'A scatter plot shows a curved pattern. The best approach is to:',
    choices: ['Use linear regression anyway', 'Transform the data (e.g., log) and re-fit', 'Ignore the pattern', 'Remove outliers'], answer: 'Transform the data (e.g., log) and re-fit',
    explanation: 'Nonlinear data can often be linearized with transformations (log, power) before fitting a regression model.' },
  { id: 'ts10', comp: 'comp004', type: 'mc', difficulty: 2,
    q: 'An unbiased estimator is one where:',
    choices: ['It always equals the parameter', 'Its expected value equals the parameter', 'Its variance is zero', 'It never changes'], answer: 'Its expected value equals the parameter',
    explanation: 'An estimator is unbiased if E(estimator) = parameter being estimated.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 020 — Mathematical Learning & Instruction (ti01–ti08)
  // ═══════════════════════════════════════════════
  { id: 'ti01', comp: 'comp006', type: 'mc', difficulty: 1,
    q: 'The concrete-representational-abstract (CRA) sequence suggests instruction should move from:',
    choices: ['Abstract to concrete', 'Concrete manipulatives to visual models to symbolic notation', 'Symbolic to visual', 'Abstract to representational only'], answer: 'Concrete manipulatives to visual models to symbolic notation',
    explanation: 'CRA builds understanding by starting with hands-on objects, then pictures/diagrams, then symbols.' },
  { id: 'ti02', comp: 'comp006', type: 'mc', difficulty: 2,
    q: 'A teacher notices ELL students struggle with word problems. The BEST strategy is to:',
    choices: ['Skip word problems', 'Use visual models, act out scenarios, and teach key vocabulary', 'Only assign computation', 'Lower the difficulty permanently'], answer: 'Use visual models, act out scenarios, and teach key vocabulary',
    explanation: 'Multimodal supports (visuals, acting out, vocabulary instruction) help ELLs access mathematical content.' },
  { id: 'ti03', comp: 'comp006', type: 'mc', difficulty: 1,
    q: 'Using base-10 blocks to teach place value is an example of:',
    choices: ['Abstract instruction', 'Drill and practice', 'Concrete representation', 'Formative assessment'], answer: 'Concrete representation',
    explanation: 'Base-10 blocks are manipulatives that provide a concrete, hands-on representation of place value concepts.' },
  { id: 'ti04', comp: 'comp006', type: 'mc', difficulty: 2,
    q: 'Research shows that students learn math best when they:',
    choices: ['Only memorize procedures', 'Understand concepts and connect them to procedures', 'Work alone at all times', 'Avoid making mistakes'], answer: 'Understand concepts and connect them to procedures',
    explanation: 'Conceptual understanding linked to procedural fluency leads to deeper, more transferable learning.' },
  { id: 'ti05', comp: 'comp006', type: 'mc', difficulty: 1,
    q: 'Which practice promotes mathematical discourse in the classroom?',
    choices: ['Silent individual work only', 'Asking open-ended questions and having students explain their reasoning', 'Only showing the answer key', 'Timed tests'], answer: 'Asking open-ended questions and having students explain their reasoning',
    explanation: 'Open-ended questions and explanation promote dialogue and deepen understanding.' },
  { id: 'ti06', comp: 'comp006', type: 'mc', difficulty: 2,
    q: 'A student who can follow a procedure but cannot explain why it works likely lacks:',
    choices: ['Procedural fluency', 'Conceptual understanding', 'Computational speed', 'Test-taking skills'], answer: 'Conceptual understanding',
    explanation: 'Being able to execute but not explain indicates procedural knowledge without conceptual depth.' },
  { id: 'ti07', comp: 'comp006', type: 'mc', difficulty: 2,
    q: 'Which instructional approach best supports students who struggle with fractions?',
    choices: ['More timed tests', 'Using number lines, area models, and real-world contexts', 'Skipping fractions entirely', 'Only teaching the algorithm'], answer: 'Using number lines, area models, and real-world contexts',
    explanation: 'Multiple representations (number lines, area models, contexts) build fraction sense and understanding.' },
  { id: 'ti08', comp: 'comp006', type: 'mc', difficulty: 1,
    q: 'Using graphing calculators in the classroom allows students to:',
    choices: ['Avoid learning math', 'Explore functions and visualize concepts more efficiently', 'Skip homework', 'Replace the teacher'], answer: 'Explore functions and visualize concepts more efficiently',
    explanation: 'Technology like graphing calculators supports exploration, visualization, and deeper analysis.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 021 — Mathematical Assessment (ta01–ta08)
  // ═══════════════════════════════════════════════
  { id: 'ta01', comp: 'comp006', type: 'mc', difficulty: 1,
    q: 'Formative assessment is primarily used to:',
    choices: ['Assign final grades', 'Monitor learning and adjust instruction during teaching', 'Rank students', 'Replace homework'], answer: 'Monitor learning and adjust instruction during teaching',
    explanation: 'Formative assessment provides ongoing feedback to guide and improve instruction.' },
  { id: 'ta02', comp: 'comp006', type: 'mc', difficulty: 1,
    q: 'Which is an example of formative assessment?',
    choices: ['End-of-year state test', 'Exit ticket after a lesson', 'SAT', 'Final exam'], answer: 'Exit ticket after a lesson',
    explanation: 'Exit tickets are quick formative checks used during or immediately after instruction.' },
  { id: 'ta03', comp: 'comp006', type: 'mc', difficulty: 2,
    q: 'A student consistently writes 3/4 + 1/2 = 4/6. This error pattern suggests the student:',
    choices: ['Understands fractions well', 'Is adding numerators and denominators separately', 'Needs more geometry practice', 'Has a computation error only'], answer: 'Is adding numerators and denominators separately',
    explanation: 'Adding numerators and denominators (3+1)/(4+2) = 4/6 is a common fraction misconception about needing common denominators.' },
  { id: 'ta04', comp: 'comp006', type: 'mc', difficulty: 2,
    q: 'A rubric for a math performance task should:',
    choices: ['Only count the final answer', 'Describe levels of quality for process, reasoning, and communication', 'Be kept secret from students', 'Focus only on neatness'], answer: 'Describe levels of quality for process, reasoning, and communication',
    explanation: 'Good rubrics articulate criteria for reasoning, process, and communication at multiple performance levels.' },
  { id: 'ta05', comp: 'comp006', type: 'mc', difficulty: 1,
    q: 'Summative assessment is best described as:',
    choices: ['Ongoing monitoring during learning', 'Evaluating student learning at the end of a unit or course', 'Informal observation', 'Peer assessment only'], answer: 'Evaluating student learning at the end of a unit or course',
    explanation: 'Summative assessments evaluate cumulative learning after instruction is complete.' },
  { id: 'ta06', comp: 'comp006', type: 'mc', difficulty: 2,
    q: 'A teacher wants to know if students understand the concept of slope before teaching linear equations. Which is most appropriate?',
    choices: ['Give a unit test', 'Use a diagnostic pre-assessment', 'Wait and see', 'Assign homework on linear equations'], answer: 'Use a diagnostic pre-assessment',
    explanation: 'Diagnostic pre-assessment identifies prior knowledge and misconceptions to inform instruction.' },
  { id: 'ta07', comp: 'comp006', type: 'mc', difficulty: 2,
    q: 'Having students explain their problem-solving strategy in writing assesses:',
    choices: ['Only computational ability', 'Mathematical communication and reasoning', 'Memorization', 'Speed'], answer: 'Mathematical communication and reasoning',
    explanation: 'Written explanations reveal depth of understanding, reasoning processes, and communication skills.' },
  { id: 'ta08', comp: 'comp006', type: 'mc', difficulty: 1,
    q: 'Which assessment accommodates diverse learners?',
    choices: ['Only timed written tests', 'Multiple formats (oral, written, performance-based) with appropriate supports', 'One single format for all', 'No assessment'], answer: 'Multiple formats (oral, written, performance-based) with appropriate supports',
    explanation: 'Varied assessment formats ensure all students can demonstrate their knowledge regardless of learning differences.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 012 — Euclidean Geometry (Axiomatic Systems) (tx01–tx06)
  // ═══════════════════════════════════════════════
  { id: 'tx01', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'In Euclidean geometry, through any two distinct points there is exactly one:',
    choices: ['Circle', 'Line', 'Plane', 'Ray'], answer: 'Line',
    explanation: 'This is a foundational Euclidean postulate: two distinct points determine exactly one line.' },
  { id: 'tx02', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'If two angles form a linear pair, they are:',
    choices: ['Congruent', 'Complementary', 'Supplementary', 'Vertical'], answer: 'Supplementary',
    explanation: 'A linear pair forms a straight line, so the angle measures sum to 180 degrees.' },
  { id: 'tx03', comp: 'comp003', type: 'mc', difficulty: 1,
    q: 'If lines l and m are both perpendicular to line n in the same plane, then l and m are:',
    choices: ['Parallel', 'Skew', 'Perpendicular', 'Intersecting at one point'], answer: 'Parallel',
    explanation: 'In a plane, two lines perpendicular to the same line are parallel.' },
  { id: 'tx04', comp: 'comp003', type: 'mc', difficulty: 3,
    q: 'Which set of information is sufficient to prove two triangles congruent?',
    choices: ['AAA', 'SSA', 'AAS', 'Only one side and one angle'], answer: 'AAS',
    explanation: 'AAS is a valid triangle congruence criterion. AAA proves similarity, and SSA is generally ambiguous.' },
  { id: 'tx05', comp: 'comp003', type: 'mc', difficulty: 3,
    q: 'A statement is true in Euclidean geometry but not on a sphere. Which statement is it?',
    choices: ['Through a point not on a line, exactly one parallel line can be drawn', 'The shortest path between two points is a geodesic', 'The sum of angles in a triangle can exceed 180 degrees', 'Great circles intersect'], answer: 'Through a point not on a line, exactly one parallel line can be drawn',
    explanation: 'Playfair\'s axiom (unique parallel line) is Euclidean. On a sphere, great circles always intersect, so there are no parallel geodesics.' },
  { id: 'tx06', comp: 'comp003', type: 'mc', difficulty: 3,
    q: 'To prove vertical angles are congruent, a standard proof strategy uses:',
    choices: ['Distance formula only', 'The definition of midpoint', 'Linear pairs and supplementary angles', 'Pythagorean theorem'], answer: 'Linear pairs and supplementary angles',
    explanation: 'Each vertical angle forms a linear pair with the same adjacent angle. Angles supplementary to the same angle are congruent.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 020 — Mathematical Learning & Instruction (ti09–ti14)
  // ═══════════════════════════════════════════════
  { id: 'ti09', comp: 'comp006', type: 'mc', difficulty: 1,
    q: 'An instructional objective aligned to best practice is MOST clearly stated as:',
    choices: ['Students will cover Chapter 4', 'Students will understand math better', 'Given a real-world ratio context, students solve and justify a proportion with >=80% accuracy', 'Students will listen to lecture'], answer: 'Given a real-world ratio context, students solve and justify a proportion with >=80% accuracy',
    explanation: 'Strong objectives identify performance, conditions, and criteria for success.' },
  { id: 'ti10', comp: 'comp006', type: 'mc', difficulty: 1,
    q: 'Which move best supports productive struggle without lowering rigor?',
    choices: ['Give the full worked solution immediately', 'Reduce every problem to one-step items', 'Ask probing questions and provide a partially completed representation', 'Skip the task'], answer: 'Ask probing questions and provide a partially completed representation',
    explanation: 'Scaffolding should preserve cognitive demand while supporting access.' },
  { id: 'ti11', comp: 'comp006', type: 'mc', difficulty: 3,
    q: 'A class can compute slope from two points but struggles to interpret slope in context. Which next lesson design is strongest?',
    choices: ['More isolated slope drills', 'A matching task linking graphs, tables, equations, and verbal rate situations', 'A timed quiz only', 'Move to a new unit'], answer: 'A matching task linking graphs, tables, equations, and verbal rate situations',
    explanation: 'Multiple representations build conceptual transfer from procedure to interpretation.' },
  { id: 'ti12', comp: 'comp006', type: 'mc', difficulty: 3,
    q: 'When introducing a new proof format, which sequence best reflects gradual release?',
    choices: ['Independent proof -> teacher model -> guided practice', 'Teacher model -> guided co-construction -> independent proof', 'Independent work only', 'Lecture only with no practice'], answer: 'Teacher model -> guided co-construction -> independent proof',
    explanation: 'Gradual release follows I do, we do, you do to build independence.' },
  { id: 'ti13', comp: 'comp006', type: 'mc', difficulty: 3,
    q: 'A teacher wants discourse to reveal reasoning quality. Which protocol is most effective?',
    choices: ['Cold-call final answers only', 'Think-pair-share with required sentence stems and public error analysis', 'Silent worksheet completion', 'Random guessing game'], answer: 'Think-pair-share with required sentence stems and public error analysis',
    explanation: 'Structured talk plus evidence-based critique surfaces student thinking and misconceptions.' },
  { id: 'ti14', comp: 'comp006', type: 'mc', difficulty: 3,
    q: 'In a mixed-readiness class, which plan is most aligned with equitable differentiation?',
    choices: ['Same worksheet, same pacing, no supports', 'Lower expectations for struggling students permanently', 'Common high-level task with tiered scaffolds, strategic grouping, and extension prompts', 'Separate curriculum with unrelated topics'], answer: 'Common high-level task with tiered scaffolds, strategic grouping, and extension prompts',
    explanation: 'Equitable differentiation maintains rigor while providing variable supports and challenge.' },

  // ═══════════════════════════════════════════════
  // NEW: Competency 021 — Mathematical Assessment (ta09–ta14)
  // ═══════════════════════════════════════════════
  { id: 'ta09', comp: 'comp006', type: 'mc', difficulty: 1,
    q: 'A test is reliable when it:',
    choices: ['Always has difficult questions', 'Measures many standards at once', 'Produces consistent results across administrations', 'Uses only multiple-choice items'], answer: 'Produces consistent results across administrations',
    explanation: 'Reliability refers to score consistency, not necessarily content breadth or difficulty.' },
  { id: 'ta10', comp: 'comp006', type: 'mc', difficulty: 1,
    q: 'A test has strong validity when it:',
    choices: ['Has many items', 'Measures what it is intended to measure', 'Is easy to grade', 'Uses norm-referenced scores only'], answer: 'Measures what it is intended to measure',
    explanation: 'Validity is about alignment between the construct and what the assessment captures.' },
  { id: 'ta11', comp: 'comp006', type: 'mc', difficulty: 3,
    q: 'On a 10-item exit ticket, item 6 was answered correctly by 95% of students and does not separate high and low performers. Best interpretation?',
    choices: ['Item likely too easy and low-discrimination', 'Item is invalid because many students got it right', 'Instruction failed on that standard', 'Item is automatically biased'], answer: 'Item likely too easy and low-discrimination',
    explanation: 'Very high p-value with weak discrimination suggests the item adds little information about proficiency differences.' },
  { id: 'ta12', comp: 'comp006', type: 'mc', difficulty: 3,
    q: 'Students miss a multi-step equation item mostly due to arithmetic slips after correct setup. The most precise follow-up is:',
    choices: ['Reteach equation modeling only', 'Reteach only integer arithmetic', 'Use two-part items separating model setup from computation accuracy', 'Drop multi-step items from future assessments'], answer: 'Use two-part items separating model setup from computation accuracy',
    explanation: 'Splitting setup and computation yields actionable diagnostic data for targeted intervention.' },
  { id: 'ta13', comp: 'comp006', type: 'mc', difficulty: 3,
    q: 'Which assessment revision most directly reduces construct-irrelevant language load for multilingual learners in math?',
    choices: ['Increase reading passage length', 'Replace technical math terms with nonstandard wording', 'Use concise syntax, visuals, and clarified context without changing mathematical demand', 'Remove all word problems'], answer: 'Use concise syntax, visuals, and clarified context without changing mathematical demand',
    explanation: 'Accessibility should reduce language barriers while preserving the intended math construct.' },
  { id: 'ta14', comp: 'comp006', type: 'mc', difficulty: 3,
    q: 'After a unit test, which action best closes the assessment-instruction loop?',
    choices: ['Record grades and move on', 'Re-teach every lesson in order', 'Group students by error pattern, assign targeted reassessment tasks, and compare growth on aligned exit checks', 'Offer optional extra credit only'], answer: 'Group students by error pattern, assign targeted reassessment tasks, and compare growth on aligned exit checks',
    explanation: 'Data-driven regrouping plus aligned reassessment links evidence directly to instructional response.' },
];

export const TEXES_TEST_CONFIG = {
  math712: {
    totalQuestions: 90,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: {
      comp001: 11,
      comp002: 22,
      comp003: 18,
      comp004: 18,
      comp005: 12,
      comp006: 9,
    },
  },
  math48: {
    totalQuestions: 100,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: {
      comp48_1: 16,
      comp48_2: 21,
      comp48_3: 21,
      comp48_4: 16,
      comp48_5: 10,
      comp48_6: 16,
    },
  },
  ec6: {
    totalQuestions: 47,
    timeMinutes: 60,
    passingScore: 0.70,
    categoryDistribution: {
      comp_ec6_1: 8,
      comp_ec6_2: 8,
      comp_ec6_3: 8,
      comp_ec6_4: 10,
      comp_ec6_5: 8,
      comp_ec6_6: 5,
    },
  },
  ec6_ela: {
    totalQuestions: 45,
    timeMinutes: 60,
    passingScore: 0.70,
    categoryDistribution: { ec6_ela_1: 12, ec6_ela_2: 12, ec6_ela_3: 11, ec6_ela_4: 10 },
  },
  ec6_science: {
    totalQuestions: 45,
    timeMinutes: 60,
    passingScore: 0.70,
    categoryDistribution: { ec6_sci_1: 15, ec6_sci_2: 15, ec6_sci_3: 15 },
  },
  ec6_social: {
    totalQuestions: 45,
    timeMinutes: 60,
    passingScore: 0.70,
    categoryDistribution: { ec6_soc_1: 15, ec6_soc_2: 15, ec6_soc_3: 15 },
  },
  ec6_full: {
    totalQuestions: 182,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: {
      comp_ec6_1: 8,
      comp_ec6_2: 8,
      comp_ec6_3: 8,
      comp_ec6_4: 10,
      comp_ec6_5: 8,
      comp_ec6_6: 5,
      ec6_ela_1: 12,
      ec6_ela_2: 12,
      ec6_ela_3: 11,
      ec6_ela_4: 10,
      ec6_sci_1: 15,
      ec6_sci_2: 15,
      ec6_sci_3: 15,
      ec6_soc_1: 15,
      ec6_soc_2: 15,
      ec6_soc_3: 15,
    },
  },
  physicalScience: {
    totalQuestions: 90,
    timeMinutes: 285,
    passingScore: 0.70,
    categoryDistribution: {
      comp_phys_1: 20,
      comp_phys_2: 30,
      comp_phys_3: 30,
      comp_phys_4: 10,
    },
  },
  chemistry: {
    totalQuestions: 100,
    timeMinutes: 285,
    passingScore: 0.70,
    categoryDistribution: {
      comp_chem_1: 24,
      comp_chem_2: 41,
      comp_chem_3: 23,
      comp_chem_4: 12,
    },
  },
  ela712: {
    totalQuestions: 100,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: {
      comp_ela_1: 15,
      comp_ela_2: 40,
      comp_ela_3: 30,
      comp_ela_4: 15,
    },
  },
  bilingual: {
    totalQuestions: 80,
    timeMinutes: 285,
    passingScore: 0.70,
    categoryDistribution: {
      comp_bil_1: 20,
      comp_bil_2: 20,
      comp_bil_3: 20,
      comp_bil_4: 20,
    },
  },
  science712: {
    totalQuestions: 140,
    timeMinutes: 285,
    passingScore: 0.70,
    categoryDistribution: {
      comp_sci_1: 14,
      comp_sci_2: 28,
      comp_sci_3: 28,
      comp_sci_4: 11,
      comp_sci_5: 11,
      comp_sci_6: 11,
      comp_sci_7: 8,
      comp_sci_8: 13,
      comp_sci_9: 8,
      comp_sci_10: 8,
    },
  },
  lifeScience712: {
    totalQuestions: 100,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: {
      comp_life_1: 15,
      comp_life_2: 20,
      comp_life_3: 20,
      comp_life_4: 20,
      comp_life_5: 15,
      comp_life_6: 10,
    },
  },
  physicsMath612: {
    totalQuestions: 120,
    timeMinutes: 285,
    passingScore: 0.70,
    categoryDistribution: {
      comp_physmath_1: 8,
      comp_physmath_2: 19,
      comp_physmath_3: 12,
      comp_physmath_4: 8,
      comp_physmath_5: 6,
      comp_physmath_6: 6,
      comp_physmath_7: 8,
      comp_physmath_8: 47,
      comp_physmath_9: 6,
    },
  },
  socialStudies712: {
    totalQuestions: 140,
    timeMinutes: 285,
    passingScore: 0.70,
    categoryDistribution: {
      comp_ss_1: 21,
      comp_ss_2: 28,
      comp_ss_3: 18,
      comp_ss_4: 18,
      comp_ss_5: 18,
      comp_ss_6: 18,
      comp_ss_7: 19,
    },
  },
  history712: {
    totalQuestions: 100,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: {
      comp_hist_1: 30,
      comp_hist_2: 36,
      comp_hist_3: 20,
      comp_hist_4: 14,
    },
  },
  ela48: {
    totalQuestions: 100,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: { comp_ela48_1: 33, comp_ela48_2: 67 },
  },
  science48: {
    totalQuestions: 100,
    timeMinutes: 285,
    passingScore: 0.70,
    categoryDistribution: { comp_sci48_1: 22, comp_sci48_2: 22, comp_sci48_3: 22, comp_sci48_4: 22, comp_sci48_5: 12 },
  },
  socialStudies48: {
    totalQuestions: 100,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: { comp_ss48_1: 14, comp_ss48_2: 14, comp_ss48_3: 14, comp_ss48_4: 14, comp_ss48_5: 15, comp_ss48_6: 29 },
  },
  esl: {
    totalQuestions: 80,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: { comp_esl_1: 20, comp_esl_2: 36, comp_esl_3: 24 },
  },
  specialEd: {
    totalQuestions: 150,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: { comp_sped_1: 20, comp_sped_2: 50, comp_sped_3: 50, comp_sped_4: 30 },
  },
  ppr: {
    totalQuestions: 100,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: { comp_ppr_1: 34, comp_ppr_2: 13, comp_ppr_3: 33, comp_ppr_4: 20 },
  },
  bilingualSpanish: {
    totalQuestions: 84,
    timeMinutes: 210,
    passingScore: 0.70,
    categoryDistribution: { comp_btl_1: 18, comp_btl_2: 22, comp_btl_3: 24, comp_btl_4: 20 },
  },
  str: {
    totalQuestions: 90,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: { comp_str_1: 14, comp_str_2: 36, comp_str_3: 32, comp_str_4: 8 },
  },
  artEC12: {
    totalQuestions: 100,
    timeMinutes: 285,
    passingScore: 0.70,
    categoryDistribution: { comp_art_1: 32, comp_art_2: 27, comp_art_3: 14, comp_art_4: 27 },
  },
  musicEC12: {
    totalQuestions: 100,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: { comp_mus_1: 25, comp_mus_2: 17, comp_mus_3: 17, comp_mus_4: 25, comp_mus_5: 16 },
  },
  peEC12: {
    totalQuestions: 90,
    timeMinutes: 285,
    passingScore: 0.70,
    categoryDistribution: { comp_pe_1: 20, comp_pe_2: 20, comp_pe_3: 20, comp_pe_4: 12, comp_pe_5: 18 },
  },
  cs812: {
    totalQuestions: 100,
    timeMinutes: 285,
    passingScore: 0.70,
    categoryDistribution: { comp_cs_1: 12, comp_cs_2: 35, comp_cs_3: 40, comp_cs_4: 13 },
  },
  techAppEC12: {
    totalQuestions: 100,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: { comp_tech_1: 15, comp_tech_2: 30, comp_tech_3: 25, comp_tech_4: 30 },
  },
  readingSpecialist: {
    totalQuestions: 100,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: { comp_rs_1: 57, comp_rs_2: 14, comp_rs_3: 14, comp_rs_4: 15 },
  },
  schoolCounselor: {
    totalQuestions: 90,
    timeMinutes: 285,
    passingScore: 0.70,
    categoryDistribution: { comp_sc_1: 16, comp_sc_2: 40, comp_sc_3: 16, comp_sc_4: 18 },
  },
  loteSpanish: {
    totalQuestions: 120,
    timeMinutes: 300,
    passingScore: 0.70,
    categoryDistribution: { comp_lote_1: 42, comp_lote_2: 10, comp_lote_3: 20, comp_lote_4: 20, comp_lote_5: 14, comp_lote_6: 14 },
  },
};

// ═══════════════════════════════════════════════════════════════
// TExES Physical Science 6–12 (237) — Physics & Chemistry
// 100 questions, ~4 hr 45 min. Domains: Scientific Inquiry, Physics, Chemistry, Instruction
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_PHYSICAL_SCIENCE = [
  { id: 'comp_phys_1', name: 'Scientific Inquiry and Processes', desc: 'Nature of science, lab safety, data analysis.', weight: 0.25, games: [] },
  { id: 'comp_phys_2', name: 'Physics', desc: 'Mechanics, E&M, waves, thermodynamics.', weight: 0.35, games: [] },
  { id: 'comp_phys_3', name: 'Chemistry', desc: 'Matter, bonding, reactions, periodicity.', weight: 0.30, games: [] },
  { id: 'comp_phys_4', name: 'Science Learning, Instruction, and Assessment', desc: 'Pedagogy, safety, equity.', weight: 0.10, games: [] },
];

export const TEXES_QUESTIONS_PHYSICAL_SCIENCE = [
  // Domain I: Scientific Inquiry and Processes
  { id: 'phys001', comp: 'comp_phys_1', type: 'mc', difficulty: 1, q: 'Which step of the scientific method follows forming a hypothesis?', choices: ['Designing an experiment', 'Making observations', 'Drawing conclusions', 'Communicating results'], answer: 'Designing an experiment', explanation: 'After forming a testable hypothesis, scientists design experiments to test it.' },
  { id: 'phys002', comp: 'comp_phys_1', type: 'mc', difficulty: 1, q: 'What is the primary purpose of a control group in an experiment?', choices: ['To speed up the experiment', 'To provide a baseline for comparison', 'To test multiple variables', 'To ensure random results'], answer: 'To provide a baseline for comparison', explanation: 'The control group is used for comparison so that the effect of the independent variable can be identified.' },
  { id: 'phys003', comp: 'comp_phys_1', type: 'mc', difficulty: 2, q: 'A student measures the length of a table three times: 1.52 m, 1.48 m, 1.51 m. The accepted value is 1.50 m. How would you describe the precision and accuracy?', choices: ['High precision, high accuracy', 'High precision, low accuracy', 'Low precision, high accuracy', 'Low precision, low accuracy'], answer: 'High precision, high accuracy', explanation: 'Measurements are close to each other (precise) and close to the accepted value (accurate).' },
  { id: 'phys004', comp: 'comp_phys_1', type: 'mc', difficulty: 1, q: 'Which of the following is a safe practice in the lab?', choices: ['Eating at the lab bench', 'Wearing safety goggles when using chemicals', 'Pouring water into acid', 'Leaving hot plates unattended'], answer: 'Wearing safety goggles when using chemicals', explanation: 'Safety goggles protect eyes from splashes and fumes when working with chemicals.' },
  { id: 'phys005', comp: 'comp_phys_1', type: 'mc', difficulty: 2, q: 'What type of graph is best for showing the relationship between two continuous variables?', choices: ['Bar graph', 'Pie chart', 'Line graph', 'Histogram'], answer: 'Line graph', explanation: 'Line graphs effectively show how one variable changes with another (e.g., position vs. time).' },
  { id: 'phys006', comp: 'comp_phys_1', type: 'mc', difficulty: 1, q: 'What does it mean for a theory to be falsifiable?', choices: ['It has been proven false', 'It can be tested and potentially disproven', 'It is based on opinion', 'It has no supporting evidence'], answer: 'It can be tested and potentially disproven', explanation: 'Scientific theories must be falsifiable—there must be a way to test them and potentially show they are wrong.' },
  { id: 'phys007', comp: 'comp_phys_1', type: 'mc', difficulty: 2, q: 'Which represents a valid scientific claim?', choices: ['The experiment was successful', 'Increasing force increased acceleration, supporting F = ma', 'Physics is the best science', 'The data looked good'], answer: 'Increasing force increased acceleration, supporting F = ma', explanation: 'A valid scientific claim links evidence (data) to a testable relationship or model.' },
  { id: 'phys008', comp: 'comp_phys_1', type: 'mc', difficulty: 1, q: 'What is the SI unit of mass?', choices: ['Pound', 'Gram', 'Kilogram', 'Newton'], answer: 'Kilogram', explanation: 'The SI base unit of mass is the kilogram (kg).' },
  { id: 'phys009', comp: 'comp_phys_1', type: 'mc', difficulty: 2, q: 'Convert 25°C to Kelvin.', choices: ['248 K', '298 K', '273 K', '25 K'], answer: '298 K', explanation: 'K = °C + 273.15, so 25 + 273.15 ≈ 298 K.' },
  { id: 'phys010', comp: 'comp_phys_1', type: 'mc', difficulty: 1, q: 'Which of the following is a derived unit?', choices: ['Meter', 'Second', 'Kilogram', 'Newton'], answer: 'Newton', explanation: 'The newton (N) is derived from kg·m/s²; meter, second, and kilogram are base units.' },
  { id: 'phys010a', comp: 'comp_phys_1', type: 'mc', difficulty: 1, q: 'What is the purpose of peer review in science?', choices: ['To grade students', 'To evaluate and validate research before publication', 'To replace experiments', 'To speed up discovery'], answer: 'To evaluate and validate research before publication', explanation: 'Peer review allows other scientists to evaluate methods and conclusions before work is published.' },
  { id: 'phys010b', comp: 'comp_phys_1', type: 'mc', difficulty: 2, q: 'Which variable is typically plotted on the x-axis in a position-time graph?', choices: ['Position', 'Time', 'Velocity', 'Acceleration'], answer: 'Time', explanation: 'Time is usually the independent variable and is plotted on the x-axis.' },
  { id: 'phys010c', comp: 'comp_phys_1', type: 'mc', difficulty: 1, q: 'What does a steep slope on a distance-time graph indicate?', choices: ['Low speed', 'High speed', 'Zero speed', 'Constant deceleration'], answer: 'High speed', explanation: 'Steep slope means large change in distance per time—high speed.' },
  { id: 'phys010d', comp: 'comp_phys_1', type: 'mc', difficulty: 2, q: 'A measurement is reported as 3.40 ± 0.05 cm. What does 0.05 represent?', choices: ['The true value', 'The uncertainty or error', 'The average', 'The percent error'], answer: 'The uncertainty or error', explanation: 'The ± value indicates the uncertainty or margin of error in the measurement.' },
  { id: 'phys010e', comp: 'comp_phys_1', type: 'mc', difficulty: 1, q: 'Which is a qualitative observation?', choices: ['The mass is 50 g', 'The liquid is blue', 'The temperature is 25°C', 'The length is 10 cm'], answer: 'The liquid is blue', explanation: 'Qualitative observations describe qualities (color, texture) without numbers.' },
  { id: 'phys010f', comp: 'comp_phys_1', type: 'mc', difficulty: 2, q: 'In a double-blind experiment, who is unaware of which group receives the treatment?', choices: ['Only the subjects', 'Only the researchers', 'Both subjects and researchers', 'Neither'], answer: 'Both subjects and researchers', explanation: 'Double-blind design reduces bias; neither participants nor researchers know who gets the treatment.' },
  { id: 'phys010g', comp: 'comp_phys_1', type: 'mc', difficulty: 1, q: 'What is the SI unit of temperature?', choices: ['Fahrenheit', 'Celsius', 'Kelvin', 'Calorie'], answer: 'Kelvin', explanation: 'The SI base unit of temperature is the kelvin (K).' },
  { id: 'phys010h', comp: 'comp_phys_1', type: 'mc', difficulty: 2, q: 'Which best describes a scientific model?', choices: ['A perfect copy of reality', 'A simplified representation used to explain or predict', 'An untestable idea', 'A final answer'], answer: 'A simplified representation used to explain or predict', explanation: 'Models are simplified representations that help explain phenomena and make predictions.' },
  { id: 'phys010i', comp: 'comp_phys_1', type: 'mc', difficulty: 1, q: 'How many significant figures are in 0.00450?', choices: ['2', '3', '5', '6'], answer: '3', explanation: 'Leading zeros do not count; trailing zero after decimal counts. So 4, 5, 0 = 3 significant figures.' },

  // Domain II: Physics
  { id: 'phys011', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'An object moves at constant velocity. What is the net force on it?', choices: ['Zero', 'Equal to its weight', 'Increasing', 'Equal to its mass'], answer: 'Zero', explanation: 'Newton\'s first law: constant velocity means zero acceleration, so net force is zero.' },
  { id: 'phys012', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'What is the acceleration of a 5 kg object when a 10 N force is applied?', choices: ['0.5 m/s²', '2 m/s²', '50 m/s²', '2 N'], answer: '2 m/s²', explanation: 'F = ma → a = F/m = 10/5 = 2 m/s².' },
  { id: 'phys013', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'A ball is thrown upward. At the top of its path, what is its velocity and acceleration?', choices: ['v = 0, a = 0', 'v = 0, a = 9.8 m/s² downward', 'v = 9.8 m/s up, a = 0', 'v = 9.8 m/s down, a = 9.8 m/s² down'], answer: 'v = 0, a = 9.8 m/s² downward', explanation: 'At the peak, velocity is zero; acceleration due to gravity is still 9.8 m/s² downward.' },
  { id: 'phys014', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'What is the kinetic energy of a 4 kg object moving at 3 m/s?', choices: ['6 J', '12 J', '18 J', '36 J'], answer: '18 J', explanation: 'KE = ½mv² = ½(4)(9) = 18 J.' },
  { id: 'phys015', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'A 2 kg block is lifted 5 m at constant speed. How much work is done by the lifter? (g = 10 m/s²)', choices: ['10 J', '50 J', '100 J', '20 J'], answer: '100 J', explanation: 'W = Fd = mgd = (2)(10)(5) = 100 J. Force equals weight for constant speed.' },
  { id: 'phys016', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'Which has greater momentum: a truck at rest or a bicycle moving at 5 m/s?', choices: ['Truck', 'Bicycle', 'Same', 'Cannot determine without masses'], answer: 'Bicycle', explanation: 'Momentum p = mv. The truck at rest has zero momentum; the moving bicycle has nonzero momentum.' },
  { id: 'phys017', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'Two charges repel each other. What can you conclude?', choices: ['Both are positive', 'Both are negative', 'They have the same sign', 'One is neutral'], answer: 'They have the same sign', explanation: 'Like charges repel; opposite charges attract. So both are positive or both are negative.' },
  { id: 'phys018', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'What is the unit of electric current?', choices: ['Volt', 'Ampere', 'Ohm', 'Coulomb'], answer: 'Ampere', explanation: 'The SI unit of electric current is the ampere (A).' },
  { id: 'phys019', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'A wave has frequency 5 Hz and wavelength 2 m. What is its speed?', choices: ['2.5 m/s', '7 m/s', '10 m/s', '0.4 m/s'], answer: '10 m/s', explanation: 'v = fλ = (5)(2) = 10 m/s.' },
  { id: 'phys020', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'Sound travels fastest in:', choices: ['Air', 'Water', 'Steel', 'Vacuum'], answer: 'Steel', explanation: 'Sound is a mechanical wave; it travels fastest in solids (steel), then liquids, then gases.' },
  { id: 'phys021', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'The first law of thermodynamics states that:', choices: ['Energy cannot be created or destroyed', 'Entropy always increases', 'Heat flows from cold to hot', 'Absolute zero is unattainable'], answer: 'Energy cannot be created or destroyed', explanation: 'The first law is conservation of energy: ΔU = Q − W (for a system).' },
  { id: 'phys022', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'What type of wave is light?', choices: ['Longitudinal only', 'Transverse only', 'Both longitudinal and transverse', 'Neither'], answer: 'Transverse only', explanation: 'Light is an electromagnetic wave; E and B fields oscillate perpendicular to the direction of propagation.' },
  { id: 'phys023', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'A resistor has 6 V across it and 2 A through it. What is its resistance?', choices: ['3 Ω', '12 Ω', '8 Ω', '1/3 Ω'], answer: '3 Ω', explanation: 'V = IR → R = V/I = 6/2 = 3 Ω.' },
  { id: 'phys024', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'Which quantity is conserved in an elastic collision?', choices: ['Only momentum', 'Only kinetic energy', 'Both momentum and kinetic energy', 'Neither'], answer: 'Both momentum and kinetic energy', explanation: 'In an elastic collision, both total momentum and total kinetic energy are conserved.' },
  { id: 'phys025', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'A car rounds a curve at constant speed. What provides the centripetal force?', choices: ['Gravity', 'Friction between tires and road', 'The engine', 'Normal force only'], answer: 'Friction between tires and road', explanation: 'Friction between the tires and the road provides the centripetal force that keeps the car in a curved path.' },
  { id: 'phys025a', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'What is power defined as?', choices: ['Force × distance', 'Work ÷ time', 'Mass × velocity', 'Energy × time'], answer: 'Work ÷ time', explanation: 'Power P = W/t, the rate at which work is done (unit: watt).' },
  { id: 'phys025b', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'A 3 Ω and a 6 Ω resistor are in parallel. What is their equivalent resistance?', choices: ['2 Ω', '9 Ω', '18 Ω', '0.5 Ω'], answer: '2 Ω', explanation: '1/R_eq = 1/3 + 1/6 = 1/2, so R_eq = 2 Ω.' },
  { id: 'phys025c', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'Which electromagnetic wave has the longest wavelength?', choices: ['Gamma rays', 'Visible light', 'Radio waves', 'X-rays'], answer: 'Radio waves', explanation: 'Radio waves have the longest wavelength in the EM spectrum; gamma rays the shortest.' },
  { id: 'phys025d', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'According to Newton\'s third law, if you push a wall, the wall pushes you with:', choices: ['Less force', 'More force', 'Equal force in the opposite direction', 'No force'], answer: 'Equal force in the opposite direction', explanation: 'Newton\'s third law: for every action there is an equal and opposite reaction.' },
  { id: 'phys025e', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'What is the gravitational potential energy of a 2 kg book 3 m above the ground? (g = 10 m/s²)', choices: ['6 J', '60 J', '5 J', '20 J'], answer: '60 J', explanation: 'PE = mgh = (2)(10)(3) = 60 J.' },
  { id: 'phys025f', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'When a wave passes from air into water, which property can change?', choices: ['Frequency', 'Wavelength', 'Amplitude', 'None'], answer: 'Wavelength', explanation: 'Frequency stays the same (set by source); speed and wavelength change at the boundary.' },
  { id: 'phys025g', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'What does a positive slope on a velocity-time graph indicate?', choices: ['Constant velocity', 'Positive acceleration', 'Negative acceleration', 'Zero acceleration'], answer: 'Positive acceleration', explanation: 'Slope of v-t graph = acceleration; positive slope means positive acceleration.' },
  { id: 'phys025h', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'In a series circuit with two identical bulbs, if one bulb is removed, the other:', choices: ['Gets brighter', 'Stays the same', 'Goes out', 'Flickers'], answer: 'Goes out', explanation: 'In a series circuit there is only one path; opening it stops current everywhere.' },
  { id: 'phys025i', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'What is the unit of pressure in SI?', choices: ['Newton', 'Pascal', 'Joule', 'Watt'], answer: 'Pascal', explanation: 'Pressure is force per area; SI unit is the pascal (Pa) = N/m².' },
  { id: 'phys025j', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'A 0.5 kg object has 25 J of kinetic energy. What is its speed?', choices: ['5 m/s', '10 m/s', '50 m/s', '12.5 m/s'], answer: '10 m/s', explanation: 'KE = ½mv² → 25 = ½(0.5)v² → v² = 100 → v = 10 m/s.' },
  { id: 'phys025k', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'Refraction occurs when light:', choices: ['Bounces off a surface', 'Bends when entering a new medium', 'Splits into colors', 'Is absorbed'], answer: 'Bends when entering a new medium', explanation: 'Refraction is the bending of light when it passes between media of different optical density.' },
  { id: 'phys025l', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'What is the efficiency of a machine that does 40 J of useful work with 100 J of input?', choices: ['40%', '60%', '250%', '2.5%'], answer: '40%', explanation: 'Efficiency = (useful output / input) × 100% = (40/100)(100) = 40%.' },
  { id: 'phys025m', comp: 'comp_phys_2', type: 'mc', difficulty: 1, q: 'Which law states that total energy in a closed system is constant?', choices: ['Newton\'s first law', 'Conservation of energy', 'Ohm\'s law', 'Boyle\'s law'], answer: 'Conservation of energy', explanation: 'The law of conservation of energy: energy cannot be created or destroyed in an isolated system.' },
  { id: 'phys025n', comp: 'comp_phys_2', type: 'mc', difficulty: 2, q: 'An object in free fall has:', choices: ['Constant velocity', 'Constant acceleration downward', 'Zero acceleration', 'Increasing mass'], answer: 'Constant acceleration downward', explanation: 'Free fall means only gravity acts; a = g ≈ 9.8 m/s² downward (neglecting air resistance).' },

  // Domain III: Chemistry
  { id: 'phys026', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'What is the atomic number of an element?', choices: ['Number of neutrons', 'Number of protons', 'Number of protons + neutrons', 'Number of electrons in a neutral atom'], answer: 'Number of protons', explanation: 'The atomic number is the number of protons in the nucleus (and electrons in a neutral atom).' },
  { id: 'phys027', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'Which subatomic particle has a negative charge?', choices: ['Proton', 'Neutron', 'Electron', 'Nucleus'], answer: 'Electron', explanation: 'Electrons carry a negative charge; protons are positive; neutrons are neutral.' },
  { id: 'phys028', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'What type of bond is formed when electrons are shared between atoms?', choices: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], answer: 'Covalent', explanation: 'Covalent bonds involve the sharing of electron pairs between atoms.' },
  { id: 'phys029', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'What is the chemical formula for water?', choices: ['H2O2', 'HO', 'H2O', 'OH'], answer: 'H2O', explanation: 'Water is H₂O—two hydrogen atoms and one oxygen atom per molecule.' },
  { id: 'phys030', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'In a balanced chemical equation, what must be equal on both sides?', choices: ['Only the number of molecules', 'Only the number of atoms of each element', 'Only the total mass', 'The number of compounds'], answer: 'Only the number of atoms of each element', explanation: 'The law of conservation of mass requires the same number of each type of atom on both sides.' },
  { id: 'phys031', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'Which phase of matter has a definite volume but not a definite shape?', choices: ['Solid', 'Liquid', 'Gas', 'Plasma'], answer: 'Liquid', explanation: 'Liquids have a definite volume but take the shape of their container.' },
  { id: 'phys032', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'What is the pH of a neutral solution at 25°C?', choices: ['0', '5', '7', '14'], answer: '7', explanation: 'A neutral solution has pH = 7; below 7 is acidic, above 7 is basic.' },
  { id: 'phys033', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'Which group on the periodic table contains the noble gases?', choices: ['Group 1', 'Group 2', 'Group 17', 'Group 18'], answer: 'Group 18', explanation: 'Group 18 (or 8A) contains the noble gases: He, Ne, Ar, Kr, Xe, Rn.' },
  { id: 'phys034', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'What type of reaction is: 2H₂ + O₂ → 2H₂O?', choices: ['Decomposition', 'Single replacement', 'Combustion', 'Synthesis/combination'], answer: 'Synthesis/combination', explanation: 'Two or more substances combine to form one product; also a combustion reaction.' },
  { id: 'phys035', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'What is the molar mass of CO₂? (C = 12, O = 16)', choices: ['28 g/mol', '44 g/mol', '32 g/mol', '12 g/mol'], answer: '44 g/mol', explanation: '12 + 16 + 16 = 44 g/mol.' },
  { id: 'phys036', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'Which statement about isotopes is true?', choices: ['They have the same mass number', 'They have the same number of protons but different neutrons', 'They have different atomic numbers', 'They are always radioactive'], answer: 'They have the same number of protons but different neutrons', explanation: 'Isotopes of an element have the same atomic number (protons) but different mass (neutrons).' },
  { id: 'phys037', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'What is the charge on an ion with 11 protons and 10 electrons?', choices: ['+1', '−1', '0', '+2'], answer: '+1', explanation: 'Net charge = protons − electrons = 11 − 10 = +1.' },
  { id: 'phys038', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'In an exothermic reaction, what happens to the temperature of the surroundings?', choices: ['It decreases', 'It increases', 'It stays the same', 'It fluctuates'], answer: 'It increases', explanation: 'Exothermic reactions release heat to the surroundings, so the temperature of the surroundings increases.' },
  { id: 'phys039', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'Which is a property of acids?', choices: ['Turn litmus blue', 'Taste bitter', 'Feel slippery', 'Turn litmus red'], answer: 'Turn litmus red', explanation: 'Acids turn blue litmus red; bases turn red litmus blue.' },
  { id: 'phys040', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'How many valence electrons does nitrogen (group 15) have?', choices: ['3', '5', '7', '15'], answer: '5', explanation: 'Group 15 elements have 5 valence electrons.' },
  { id: 'phys040a', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'What is the chemical symbol for sodium?', choices: ['S', 'Na', 'So', 'Sd'], answer: 'Na', explanation: 'Sodium comes from Latin natrium; symbol is Na.' },
  { id: 'phys040b', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'What type of bond holds Na and Cl together in NaCl?', choices: ['Covalent', 'Ionic', 'Metallic', 'Hydrogen'], answer: 'Ionic', explanation: 'NaCl is an ionic compound; Na⁺ and Cl⁻ are held by electrostatic attraction.' },
  { id: 'phys040c', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'How many atoms of oxygen are in 2H₂O?', choices: ['1', '2', '4', '0'], answer: '2', explanation: '2H₂O means two water molecules; each has one O, so 2 oxygen atoms total.' },
  { id: 'phys040d', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'What happens to the volume of a gas when pressure increases at constant temperature?', choices: ['Increases', 'Decreases', 'Stays the same', 'Doubles'], answer: 'Decreases', explanation: 'Boyle\'s law: at constant T, P and V are inversely related.' },
  { id: 'phys040e', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'Which is a compound?', choices: ['O₂', 'N₂', 'CO₂', 'He'], answer: 'CO₂', explanation: 'A compound has two or more elements; CO₂ has carbon and oxygen.' },
  { id: 'phys040f', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'In the reaction 2Mg + O₂ → 2MgO, what is the ratio of Mg to MgO?', choices: ['1:1', '2:1', '1:2', '2:2'], answer: '1:1', explanation: '2 mol Mg produce 2 mol MgO, so the ratio is 1:1.' },
  { id: 'phys040g', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'What is the charge of a proton?', choices: ['Neutral', 'Negative', 'Positive', 'Variable'], answer: 'Positive', explanation: 'Protons have a positive charge (+1 elementary charge).' },
  { id: 'phys040h', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'Which process is endothermic?', choices: ['Combustion', 'Freezing', 'Condensation', 'Melting'], answer: 'Melting', explanation: 'Melting requires heat input to break intermolecular forces; it is endothermic.' },
  { id: 'phys040i', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'What is the mass number of an atom with 6 protons and 8 neutrons?', choices: ['6', '8', '14', '2'], answer: '14', explanation: 'Mass number = protons + neutrons = 6 + 8 = 14.' },
  { id: 'phys040j', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'Which element is most electronegative?', choices: ['Sodium', 'Carbon', 'Fluorine', 'Hydrogen'], answer: 'Fluorine', explanation: 'Fluorine has the highest electronegativity on the Pauling scale.' },
  { id: 'phys040k', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'What state of matter has the most kinetic energy in its particles?', choices: ['Solid', 'Liquid', 'Gas', 'Plasma'], answer: 'Gas', explanation: 'Gas particles have the most kinetic energy and move freely.' },
  { id: 'phys040l', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'A solution with a pH of 2 is:', choices: ['Basic', 'Neutral', 'Acidic', 'Salt'], answer: 'Acidic', explanation: 'pH < 7 indicates an acidic solution.' },
  { id: 'phys040m', comp: 'comp_phys_3', type: 'mc', difficulty: 1, q: 'What is the formula for density?', choices: ['m + V', 'm/V', 'V/m', 'm × V'], answer: 'm/V', explanation: 'Density ρ = mass/volume (e.g., g/cm³).' },
  { id: 'phys040n', comp: 'comp_phys_3', type: 'mc', difficulty: 2, q: 'Which is a strong acid?', choices: ['Acetic acid', 'HCl (hydrochloric acid)', 'Carbonic acid', 'Citric acid'], answer: 'HCl (hydrochloric acid)', explanation: 'HCl is a strong acid; it fully dissociates in water.' },

  // Domain IV: Science Learning, Instruction, and Assessment
  { id: 'phys041', comp: 'comp_phys_4', type: 'mc', difficulty: 2, q: 'What is the main purpose of inquiry-based science instruction?', choices: ['To cover more content quickly', 'To have students discover concepts through investigation', 'To avoid using textbooks', 'To reduce lab costs'], answer: 'To have students discover concepts through investigation', explanation: 'Inquiry-based instruction emphasizes student-led investigation and sense-making.' },
  { id: 'phys042', comp: 'comp_phys_4', type: 'mc', difficulty: 2, q: 'Which strategy best supports English learners in a physics lab?', choices: ['Only oral instructions', 'Visual demos, lab diagrams, and key vocabulary pre-taught', 'Faster pacing', 'Avoiding group work'], answer: 'Visual demos, lab diagrams, and key vocabulary pre-taught', explanation: 'Multiple modalities and explicit vocabulary support access for ELs.' },
  { id: 'phys043', comp: 'comp_phys_4', type: 'mc', difficulty: 1, q: 'What is a key safety rule before any lab?', choices: ['Read the procedure and follow teacher instructions', 'Start mixing chemicals immediately', 'Work alone', 'Skip the safety goggles if in a hurry'], answer: 'Read the procedure and follow teacher instructions', explanation: 'Reading procedures and following instructions minimize risk and ensure safe practice.' },
  { id: 'phys044', comp: 'comp_phys_4', type: 'mc', difficulty: 2, q: 'A student believes that heavier objects fall faster. What is the best way to address this misconception?', choices: ['Tell them they are wrong', 'Have them predict, then drop two objects of different mass and observe', 'Skip the topic', 'Only show a video'], answer: 'Have them predict, then drop two objects of different mass and observe', explanation: 'Hands-on investigation with prediction and observation helps replace the misconception with evidence.' },
  { id: 'phys045', comp: 'comp_phys_4', type: 'mc', difficulty: 2, q: 'Which is an example of formative assessment in science?', choices: ['End-of-unit test only', 'Exit ticket or lab conclusion questions during a unit', 'State test only', 'Final exam only'], answer: 'Exit ticket or lab conclusion questions during a unit', explanation: 'Formative assessment during instruction informs teaching and helps students reflect on learning.' },
  { id: 'phys045a', comp: 'comp_phys_4', type: 'mc', difficulty: 2, q: 'Why is it important for students to discuss experimental design before conducting a lab?', choices: ['To save time', 'To clarify variables, controls, and safety', 'To avoid writing', 'To skip the procedure'], answer: 'To clarify variables, controls, and safety', explanation: 'Pre-lab discussion builds understanding of design and promotes safe, valid experiments.' },
  { id: 'phys045b', comp: 'comp_phys_4', type: 'mc', difficulty: 1, q: 'What should students do if a chemical spill occurs?', choices: ['Ignore it', 'Notify the teacher immediately and follow cleanup procedures', 'Clean it alone', 'Leave the room'], answer: 'Notify the teacher immediately and follow cleanup procedures', explanation: 'Reporting and following procedures minimize risk and ensure proper handling.' },
  { id: 'phys045c', comp: 'comp_phys_4', type: 'mc', difficulty: 2, q: 'Differentiation in science can include:', choices: ['Only varying reading level', 'Varying content, process, and product based on readiness and interest', 'Teaching the same way to everyone', 'Only extra credit'], answer: 'Varying content, process, and product based on readiness and interest', explanation: 'Differentiation addresses varied readiness, interest, and learning profiles.' },
  { id: 'phys045d', comp: 'comp_phys_4', type: 'mc', difficulty: 2, q: 'What is the value of having students argue from evidence in science?', choices: ['It takes less time', 'It builds critical thinking and connects claims to data', 'It avoids labs', 'It replaces writing'], answer: 'It builds critical thinking and connects claims to data', explanation: 'Argument from evidence is a key practice that deepens understanding and scientific literacy.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Chemistry 7–12 (240) — 100 questions, ~4 hr 45 min
// Domains: Scientific Inquiry (24%), Matter and Energy (41%), Chemical Reactions (23%), Instruction (12%)
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_CHEMISTRY = [
  { id: 'comp_chem_1', name: 'Scientific Inquiry and Processes', desc: 'Lab safety, inquiry, nature of science, math in science.', weight: 0.24, games: [] },
  { id: 'comp_chem_2', name: 'Matter and Energy', desc: 'Atomic structure, bonding, gases, solutions, energy.', weight: 0.41, games: [] },
  { id: 'comp_chem_3', name: 'Chemical Reactions', desc: 'Kinetics, equilibrium, acids and bases, redox.', weight: 0.23, games: [] },
  { id: 'comp_chem_4', name: 'Science Learning, Instruction, and Assessment', desc: 'Teaching strategies, assessment.', weight: 0.12, games: [] },
];

export const TEXES_QUESTIONS_CHEMISTRY = [
  // Domain I: Scientific Inquiry and Processes
  { id: 'chem001', comp: 'comp_chem_1', type: 'mc', difficulty: 1, q: 'When diluting an acid, you should always:', choices: ['Add acid to water', 'Add water to acid', 'Mix them quickly', 'Use cold water only'], answer: 'Add acid to water', explanation: 'Always add acid to water (never water to concentrated acid) to avoid violent splashing and heat release.' },
  { id: 'chem002', comp: 'comp_chem_1', type: 'mc', difficulty: 1, q: 'What is the purpose of a control in an experiment?', choices: ['To speed up the experiment', 'To provide a baseline for comparison', 'To use more chemicals', 'To ensure a positive result'], answer: 'To provide a baseline for comparison', explanation: 'The control provides a baseline so the effect of the independent variable can be identified.' },
  { id: 'chem003', comp: 'comp_chem_1', type: 'mc', difficulty: 2, q: 'How many significant figures are in 0.05020?', choices: ['3', '4', '5', '2'], answer: '4', explanation: 'Leading zeros do not count; trailing zero after a decimal counts. So 5, 0, 2, 0 = 4 significant figures.' },
  { id: 'chem004', comp: 'comp_chem_1', type: 'mc', difficulty: 1, q: 'Which piece of equipment is used to measure volume of a liquid precisely?', choices: ['Beaker', 'Graduated cylinder', 'Test tube', 'Spatula'], answer: 'Graduated cylinder', explanation: 'A graduated cylinder is designed for measuring liquid volumes with better precision than a beaker.' },
  { id: 'chem005', comp: 'comp_chem_1', type: 'mc', difficulty: 2, q: 'Convert 2.5 atm to mmHg. (1 atm = 760 mmHg)', choices: ['304 mmHg', '1900 mmHg', '760 mmHg', '3.3 mmHg'], answer: '1900 mmHg', explanation: '2.5 × 760 = 1900 mmHg.' },
  { id: 'chem006', comp: 'comp_chem_1', type: 'mc', difficulty: 1, q: 'What does MSDS stand for?', choices: ['Material Safety Data Sheet', 'Molecular Structure Data System', 'Measurement Standard for Data', 'None of these'], answer: 'Material Safety Data Sheet', explanation: 'MSDS (or SDS) provides safety and hazard information for chemicals.' },
  { id: 'chem007', comp: 'comp_chem_1', type: 'mc', difficulty: 2, q: 'A student reports a density of 1.05 g/mL with uncertainty ±0.02. The accepted value is 1.08 g/mL. What can you conclude?', choices: ['High accuracy, high precision', 'Low accuracy, high precision', 'High accuracy, low precision', 'Low accuracy, low precision'], answer: 'Low accuracy, high precision', explanation: 'Measurements are close to each other (precise) but not close to 1.08 (low accuracy).' },
  { id: 'chem008', comp: 'comp_chem_1', type: 'mc', difficulty: 1, q: 'Which is a quantitative observation?', choices: ['The solution is blue', 'The reaction is exothermic', 'The mass is 12.5 g', 'The odor is strong'], answer: 'The mass is 12.5 g', explanation: 'Quantitative observations involve numbers and measurement.' },
  { id: 'chem009', comp: 'comp_chem_1', type: 'mc', difficulty: 2, q: 'What is the percent error if the measured value is 8.2 and the accepted value is 8.0?', choices: ['2.4%', '2.5%', '0.2%', '97.6%'], answer: '2.5%', explanation: 'Percent error = |measured − accepted| / accepted × 100 = 0.2/8.0 × 100 = 2.5%.' },
  { id: 'chem010', comp: 'comp_chem_1', type: 'mc', difficulty: 1, q: 'In a chemical lab, safety goggles should be worn:', choices: ['Only when using acids', 'Whenever chemicals or glassware are used', 'Only during cleanup', 'Only by the teacher'], answer: 'Whenever chemicals or glassware are used', explanation: 'Goggles protect eyes from splashes and flying glass whenever chemicals or glassware are in use.' },
  { id: 'chem011', comp: 'comp_chem_1', type: 'mc', difficulty: 2, q: 'Which best describes the role of peer review in science?', choices: ['To grade students', 'To evaluate research before publication', 'To replace experiments', 'To speed up discovery'], answer: 'To evaluate research before publication', explanation: 'Peer review allows other scientists to evaluate methods and conclusions.' },
  { id: 'chem012', comp: 'comp_chem_1', type: 'mc', difficulty: 1, q: 'What is the SI unit for amount of substance?', choices: ['Gram', 'Mole', 'Liter', 'Pascal'], answer: 'Mole', explanation: 'The mole (mol) is the SI unit for amount of substance.' },
  { id: 'chem013', comp: 'comp_chem_1', type: 'mc', difficulty: 2, q: 'Express 450 nm in meters using scientific notation.', choices: ['4.5 × 10⁻⁷ m', '4.5 × 10⁻⁹ m', '4.5 × 10⁻¹¹ m', '450 × 10⁻⁹ m'], answer: '4.5 × 10⁻⁷ m', explanation: '450 nm = 450 × 10⁻⁹ m = 4.5 × 10⁻⁷ m.' },
  { id: 'chem014', comp: 'comp_chem_1', type: 'mc', difficulty: 1, q: 'Which is a hypothesis?', choices: ['Water boils at 100°C', 'If we heat water, it will boil', 'Chemistry is interesting', 'The lab took 30 minutes'], answer: 'If we heat water, it will boil', explanation: 'A hypothesis is a testable prediction (if…then…).' },
  { id: 'chem015', comp: 'comp_chem_1', type: 'mc', difficulty: 2, q: 'Why is it important to record data immediately during a lab?', choices: ['To save paper', 'To avoid forgetting or misrecording observations', 'To please the teacher', 'To finish faster'], answer: 'To avoid forgetting or misrecording observations', explanation: 'Immediate recording improves accuracy and reliability of data.' },

  // Domain II: Matter and Energy
  { id: 'chem016', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'What is the atomic number of carbon?', choices: ['6', '12', '18', '24'], answer: '6', explanation: 'Carbon has 6 protons; the atomic number is the number of protons.' },
  { id: 'chem017', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'How many valence electrons does chlorine (Group 17) have?', choices: ['1', '7', '17', '8'], answer: '7', explanation: 'Group 17 elements have 7 valence electrons.' },
  { id: 'chem018', comp: 'comp_chem_2', type: 'mc', difficulty: 2, q: 'Which bond is most polar?', choices: ['C–H', 'C–F', 'C–C', 'C–I'], answer: 'C–F', explanation: 'Fluorine is highly electronegative; C–F has the largest electronegativity difference.' },
  { id: 'chem019', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'What is the molecular geometry of water (H₂O)?', choices: ['Linear', 'Trigonal planar', 'Bent', 'Tetrahedral'], answer: 'Bent', explanation: 'Water has two bonding pairs and two lone pairs on oxygen, giving a bent shape.' },
  { id: 'chem020', comp: 'comp_chem_2', type: 'mc', difficulty: 2, q: 'According to the ideal gas law, if temperature is held constant and pressure doubles, what happens to volume?', choices: ['Doubles', 'Halves', 'Stays the same', 'Quadruples'], answer: 'Halves', explanation: 'PV = nRT; at constant T and n, P and V are inversely proportional (Boyle\'s law).' },
  { id: 'chem021', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'What is the molar mass of H₂SO₄? (H=1, S=32, O=16)', choices: ['82 g/mol', '98 g/mol', '96 g/mol', '49 g/mol'], answer: '98 g/mol', explanation: '2(1) + 32 + 4(16) = 2 + 32 + 64 = 98 g/mol.' },
  { id: 'chem022', comp: 'comp_chem_2', type: 'mc', difficulty: 2, q: 'Which compound is ionic?', choices: ['CO₂', 'NH₃', 'NaCl', 'CH₄'], answer: 'NaCl', explanation: 'NaCl is formed from Na⁺ and Cl⁻; it is an ionic compound.' },
  { id: 'chem023', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'What is the charge on an ion with 17 protons and 18 electrons?', choices: ['+1', '−1', '0', '+2'], answer: '−1', explanation: '17 − 18 = −1; the ion has one extra electron.' },
  { id: 'chem024', comp: 'comp_chem_2', type: 'mc', difficulty: 2, q: 'Which electron configuration represents a noble gas?', choices: ['1s²2s²2p⁶3s¹', '1s²2s²2p⁶', '1s²2s²2p⁵', '1s²2s²2p⁶3s²3p²'], answer: '1s²2s²2p⁶', explanation: '1s²2s²2p⁶ is neon; noble gases have full valence shells.' },
  { id: 'chem025', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'What is the formula for density?', choices: ['m × V', 'm/V', 'V/m', 'm + V'], answer: 'm/V', explanation: 'Density ρ = mass/volume.' },
  { id: 'chem026', comp: 'comp_chem_2', type: 'mc', difficulty: 2, q: 'In a saturated solution at equilibrium, the rate of dissolving equals:', choices: ['Zero', 'The rate of crystallization', 'The rate of evaporation', 'The rate of diffusion'], answer: 'The rate of crystallization', explanation: 'At saturation, dissolution and crystallization occur at equal rates.' },
  { id: 'chem027', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'Which sublevel has the highest energy in the third shell?', choices: ['3s', '3p', '3d', '3f'], answer: '3p', explanation: 'For n=3, 3s and 3p exist; 3d is higher but in the 4th period. Within n=3, 3p > 3s.' },
  { id: 'chem028', comp: 'comp_chem_2', type: 'mc', difficulty: 2, q: 'What is the oxidation state of sulfur in H₂SO₄?', choices: ['−2', '0', '+4', '+6'], answer: '+6', explanation: 'H is +1, O is −2. 2(+1) + S + 4(−2) = 0 → S = +6.' },
  { id: 'chem029', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'Which phase change is exothermic?', choices: ['Melting', 'Vaporization', 'Sublimation', 'Condensation'], answer: 'Condensation', explanation: 'Condensation (gas to liquid) releases heat to the surroundings.' },
  { id: 'chem030', comp: 'comp_chem_2', type: 'mc', difficulty: 2, q: 'How many moles are in 88 g of CO₂? (C=12, O=16)', choices: ['0.5 mol', '1 mol', '2 mol', '4 mol'], answer: '2 mol', explanation: 'Molar mass CO₂ = 44 g/mol. 88/44 = 2 mol.' },
  { id: 'chem031', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'What type of bond exists in O₂?', choices: ['Ionic', 'Single covalent', 'Double covalent', 'Triple covalent'], answer: 'Double covalent', explanation: 'O₂ has a double bond (two shared electron pairs) between the two oxygen atoms.' },
  { id: 'chem032', comp: 'comp_chem_2', type: 'mc', difficulty: 2, q: 'Which has the highest boiling point at 1 atm?', choices: ['CH₄', 'NH₃', 'H₂O', 'HF'], answer: 'H₂O', explanation: 'Water has strong hydrogen bonding and a higher boiling point than the others at 1 atm.' },
  { id: 'chem033', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'What is Avogadro\'s number?', choices: ['6.02 × 10²³', '3.00 × 10⁸', '9.8', '22.4'], answer: '6.02 × 10²³', explanation: 'Avogadro\'s number is the number of particles in one mole: 6.022 × 10²³.' },
  { id: 'chem034', comp: 'comp_chem_2', type: 'mc', difficulty: 2, q: 'A solution is 0.50 M NaCl. What is the concentration of chloride ions?', choices: ['0.25 M', '0.50 M', '1.0 M', '0.50 mol'], answer: '0.50 M', explanation: 'NaCl dissociates to Na⁺ and Cl⁻; one Cl⁻ per NaCl, so [Cl⁻] = 0.50 M.' },
  { id: 'chem035', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'Which element is in the same period as phosphorus?', choices: ['Nitrogen', 'Arsenic', 'Silicon', 'Oxygen'], answer: 'Silicon', explanation: 'Phosphorus is in period 3; silicon is also in period 3.' },
  { id: 'chem036', comp: 'comp_chem_2', type: 'mc', difficulty: 2, q: 'What is the percent by mass of carbon in CO₂? (C=12, O=16)', choices: ['27%', '33%', '73%', '50%'], answer: '27%', explanation: 'Molar mass = 44. Carbon = 12. (12/44) × 100 ≈ 27%.' },
  { id: 'chem037', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'Which is a property of transition metals?', choices: ['They form only +1 ions', 'They often have multiple oxidation states', 'They are all gases', 'They do not conduct electricity'], answer: 'They often have multiple oxidation states', explanation: 'Transition metals commonly exhibit multiple oxidation states due to d electrons.' },
  { id: 'chem038', comp: 'comp_chem_2', type: 'mc', difficulty: 2, q: 'At STP, what volume does 1 mole of any ideal gas occupy?', choices: ['22.4 L', '24.0 L', '0.0821 L', '1 L'], answer: '22.4 L', explanation: 'At STP (0°C, 1 atm), 1 mol of ideal gas occupies 22.4 L.' },
  { id: 'chem039', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'What is the chemical symbol for gold?', choices: ['Go', 'Gd', 'Au', 'Ag'], answer: 'Au', explanation: 'Gold comes from Latin aurum; symbol is Au.' },
  { id: 'chem040', comp: 'comp_chem_2', type: 'mc', difficulty: 2, q: 'Which molecule has a tetrahedral geometry?', choices: ['CO₂', 'BF₃', 'CH₄', 'H₂O'], answer: 'CH₄', explanation: 'CH₄ has four bonding pairs around carbon with no lone pairs; tetrahedral geometry.' },
  { id: 'chem041', comp: 'comp_chem_2', type: 'mc', difficulty: 1, q: 'What is the mass number of an atom with 15 protons and 16 neutrons?', choices: ['15', '16', '31', '1'], answer: '31', explanation: 'Mass number = protons + neutrons = 15 + 16 = 31.' },

  // Domain III: Chemical Reactions
  { id: 'chem042', comp: 'comp_chem_3', type: 'mc', difficulty: 1, q: 'What type of reaction is: 2H₂ + O₂ → 2H₂O?', choices: ['Decomposition', 'Single replacement', 'Combustion', 'Double replacement'], answer: 'Combustion', explanation: 'Hydrogen burns in oxygen to form water; this is a combustion (and synthesis) reaction.' },
  { id: 'chem043', comp: 'comp_chem_3', type: 'mc', difficulty: 2, q: 'In a reversible reaction at equilibrium, the forward and reverse rates are:', choices: ['Zero', 'Equal', 'Increasing', 'Decreasing'], answer: 'Equal', explanation: 'At equilibrium, the forward and reverse reaction rates are equal.' },
  { id: 'chem044', comp: 'comp_chem_3', type: 'mc', difficulty: 1, q: 'What is the pH of a solution with [H⁺] = 10⁻³ M?', choices: ['3', '−3', '11', '7'], answer: '3', explanation: 'pH = −log[H⁺] = −log(10⁻³) = 3.' },
  { id: 'chem045', comp: 'comp_chem_3', type: 'mc', difficulty: 2, q: 'Which change would increase the rate of a reaction?', choices: ['Decreasing temperature', 'Decreasing concentration', 'Adding a catalyst', 'Removing products'], answer: 'Adding a catalyst', explanation: 'A catalyst lowers the activation energy and increases the rate.' },
  { id: 'chem046', comp: 'comp_chem_3', type: 'mc', difficulty: 1, q: 'In the reaction Zn + 2HCl → ZnCl₂ + H₂, what is oxidized?', choices: ['HCl', 'Zn', 'ZnCl₂', 'H₂'], answer: 'Zn', explanation: 'Zinc loses electrons (oxidation number 0 → +2); it is oxidized.' },
  { id: 'chem047', comp: 'comp_chem_3', type: 'mc', difficulty: 2, q: 'According to Le Chatelier\'s principle, adding more reactant to an equilibrium will:', choices: ['Have no effect', 'Shift the equilibrium toward products', 'Shift toward reactants', 'Stop the reaction'], answer: 'Shift the equilibrium toward products', explanation: 'Adding reactant favors the forward reaction, shifting equilibrium toward products.' },
  { id: 'chem048', comp: 'comp_chem_3', type: 'mc', difficulty: 1, q: 'What is a strong base?', choices: ['NH₃', 'NaOH', 'H₂O', 'CH₃COOH'], answer: 'NaOH', explanation: 'NaOH (sodium hydroxide) fully dissociates in water; it is a strong base.' },
  { id: 'chem049', comp: 'comp_chem_3', type: 'mc', difficulty: 2, q: 'The rate law for a reaction is rate = k[A]²[B]. What is the order with respect to A?', choices: ['0', '1', '2', '3'], answer: '2', explanation: 'The exponent on [A] is 2, so the reaction is second order in A.' },
  { id: 'chem050', comp: 'comp_chem_3', type: 'mc', difficulty: 1, q: 'Which is the reducing agent in 2Fe₂O₃ + 3C → 4Fe + 3CO₂?', choices: ['Fe₂O₃', 'C', 'Fe', 'CO₂'], answer: 'C', explanation: 'Carbon is oxidized (0 → +4); the species that is oxidized is the reducing agent.' },
  { id: 'chem051', comp: 'comp_chem_3', type: 'mc', difficulty: 2, q: 'In an endothermic reaction, increasing temperature:', choices: ['Shifts equilibrium toward reactants', 'Shifts equilibrium toward products', 'Has no effect', 'Stops the reaction'], answer: 'Shifts equilibrium toward products', explanation: 'Endothermic reactions absorb heat; adding heat (higher T) favors the product side.' },
  { id: 'chem052', comp: 'comp_chem_3', type: 'mc', difficulty: 1, q: 'What is the conjugate base of H₂O?', choices: ['H₃O⁺', 'OH⁻', 'H₂O', 'O²⁻'], answer: 'OH⁻', explanation: 'After H₂O donates H⁺, the conjugate base is OH⁻.' },
  { id: 'chem053', comp: 'comp_chem_3', type: 'mc', difficulty: 2, q: 'A first-order reaction has a half-life of 20 s. What is the rate constant k?', choices: ['0.035 s⁻¹', '0.069 s⁻¹', '20 s⁻¹', '0.05 s⁻¹'], answer: '0.035 s⁻¹', explanation: 'For first order: t₁/₂ = ln2/k = 0.693/k. k = 0.693/20 ≈ 0.035 s⁻¹.' },
  { id: 'chem054', comp: 'comp_chem_3', type: 'mc', difficulty: 1, q: 'Which is a neutralization reaction?', choices: ['HCl + NaOH → NaCl + H₂O', '2H₂ + O₂ → 2H₂O', 'CaCO₃ → CaO + CO₂', 'Zn + Cu²⁺ → Zn²⁺ + Cu'], answer: 'HCl + NaOH → NaCl + H₂O', explanation: 'Neutralization is acid + base → salt + water.' },
  { id: 'chem055', comp: 'comp_chem_3', type: 'mc', difficulty: 2, q: 'For the equilibrium N₂ + 3H₂ ⇌ 2NH₃, increasing pressure will:', choices: ['Favor reactants', 'Favor products', 'Have no effect', 'Decrease temperature'], answer: 'Favor products', explanation: 'Products have fewer moles of gas (2 vs 4); higher pressure favors the side with fewer moles.' },
  { id: 'chem056', comp: 'comp_chem_3', type: 'mc', difficulty: 1, q: 'What is the oxidation number of oxygen in most compounds?', choices: ['+2', '−2', '0', '+1'], answer: '−2', explanation: 'Oxygen is usually −2 in compounds (except peroxides and OF₂).' },
  { id: 'chem057', comp: 'comp_chem_3', type: 'mc', difficulty: 2, q: 'Which factor does NOT affect the rate of a chemical reaction?', choices: ['Temperature', 'Concentration', 'Catalyst', 'Equilibrium constant'], answer: 'Equilibrium constant', explanation: 'The equilibrium constant (K) describes the position of equilibrium, not the rate. Rate is affected by T, concentration, catalyst, surface area.' },
  { id: 'chem058', comp: 'comp_chem_3', type: 'mc', difficulty: 1, q: 'A buffer solution resists changes in:', choices: ['Volume', 'Temperature', 'pH', 'Concentration of reactants only'], answer: 'pH', explanation: 'Buffers resist changes in pH when small amounts of acid or base are added.' },
  { id: 'chem059', comp: 'comp_chem_3', type: 'mc', difficulty: 2, q: 'In a voltaic cell, oxidation occurs at the:', choices: ['Cathode', 'Anode', 'Salt bridge', 'Voltmeter'], answer: 'Anode', explanation: 'Oxidation occurs at the anode; reduction occurs at the cathode.' },
  { id: 'chem060', comp: 'comp_chem_3', type: 'mc', difficulty: 1, q: 'What is the product of a reaction between an acid and a carbonate?', choices: ['Salt and water only', 'Salt, water, and carbon dioxide', 'Only CO₂', 'Hydrogen gas'], answer: 'Salt, water, and carbon dioxide', explanation: 'Acid + carbonate → salt + water + CO₂ (e.g., 2HCl + CaCO₃ → CaCl₂ + H₂O + CO₂).' },

  // Domain IV: Science Learning, Instruction, and Assessment
  { id: 'chem061', comp: 'comp_chem_4', type: 'mc', difficulty: 2, q: 'What is the main goal of inquiry-based chemistry instruction?', choices: ['To cover more chapters', 'To have students investigate and construct understanding', 'To avoid labs', 'To reduce costs'], answer: 'To have students investigate and construct understanding', explanation: 'Inquiry-based instruction emphasizes student-led investigation and sense-making.' },
  { id: 'chem062', comp: 'comp_chem_4', type: 'mc', difficulty: 2, q: 'Which strategy helps address the misconception that atoms expand when heated?', choices: ['Only tell students they are wrong', 'Use models and discussion: spacing between particles increases, not particle size', 'Skip the topic', 'Memorize definitions only'], answer: 'Use models and discussion: spacing between particles increases, not particle size', explanation: 'Addressing the misconception with particle models and discussion builds correct understanding.' },
  { id: 'chem063', comp: 'comp_chem_4', type: 'mc', difficulty: 1, q: 'Before a lab involving flammable materials, students should:', choices: ['Work quickly', 'Know the location of the fire extinguisher and safety procedures', 'Work alone', 'Skip the pre-lab'], answer: 'Know the location of the fire extinguisher and safety procedures', explanation: 'Knowing safety equipment and procedures minimizes risk.' },
  { id: 'chem064', comp: 'comp_chem_4', type: 'mc', difficulty: 2, q: 'Which is an example of formative assessment in chemistry?', choices: ['Only the final exam', 'Exit ticket or lab write-up questions during a unit', 'State test only', 'No homework'], answer: 'Exit ticket or lab write-up questions during a unit', explanation: 'Formative assessment during instruction informs teaching and student reflection.' },
  { id: 'chem065', comp: 'comp_chem_4', type: 'mc', difficulty: 2, q: 'How can a teacher support English learners in chemistry?', choices: ['Avoid visuals', 'Use diagrams, lab demos, and pre-teach key vocabulary', 'Speed up pacing', 'Avoid group work'], answer: 'Use diagrams, lab demos, and pre-teach key vocabulary', explanation: 'Multiple representations and explicit vocabulary support access for ELs.' },
  { id: 'chem066', comp: 'comp_chem_4', type: 'mc', difficulty: 1, q: 'What is the purpose of a pre-lab discussion?', choices: ['To skip the lab', 'To clarify procedure, safety, and expected outcomes', 'To grade faster', 'To reduce materials'], answer: 'To clarify procedure, safety, and expected outcomes', explanation: 'Pre-lab discussion ensures students understand how to perform the lab safely and what to observe.' },
  { id: 'chem067', comp: 'comp_chem_4', type: 'mc', difficulty: 2, q: 'Differentiation in chemistry can include:', choices: ['One pace for everyone', 'Varying lab roles, reading supports, and product options by readiness', 'Only extra credit', 'Only for struggling students'], answer: 'Varying lab roles, reading supports, and product options by readiness', explanation: 'Differentiation addresses varied readiness, interest, and learning profiles.' },
  { id: 'chem068', comp: 'comp_chem_4', type: 'mc', difficulty: 2, q: 'Why is it valuable for students to balance equations before a lab?', choices: ['To save time', 'To understand mole ratios and predict amounts of products', 'To avoid writing', 'To please the teacher'], answer: 'To understand mole ratios and predict amounts of products', explanation: 'Balancing equations reinforces stoichiometry and prepares students for quantitative labs.' },
  { id: 'chem069', comp: 'comp_chem_4', type: 'mc', difficulty: 1, q: 'When should students wear gloves in the chemistry lab?', choices: ['Never', 'When handling chemicals that can be absorbed or cause irritation', 'Only when heating', 'Only the teacher'], answer: 'When handling chemicals that can be absorbed or cause irritation', explanation: 'Gloves protect skin from absorption and irritation when handling certain chemicals.' },
  { id: 'chem070', comp: 'comp_chem_4', type: 'mc', difficulty: 2, q: 'What is the value of using particulate-level models in chemistry instruction?', choices: ['They replace all labs', 'They help students visualize what cannot be seen at the macro scale', 'They are only for advanced students', 'They slow down instruction'], answer: 'They help students visualize what cannot be seen at the macro scale', explanation: 'Particulate models bridge macroscopic observations and atomic/molecular reasoning.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES English Language Arts and Reading 7–12 (231)
// 100 selected-response questions, 5 hours. Domains: Integrated ELA/Diverse Learners (15%), Literature & Reading (40%), Written Communication (30%), Oral & Media (15%)
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_ELA712 = [
  { id: 'comp_ela_1', name: 'Integrated Language Arts, Diverse Learners, and the Study of English', desc: 'Language structure, development, diverse learners.', weight: 0.15, games: [] },
  { id: 'comp_ela_2', name: 'Literature, Reading Processes, and Skills for Literary and Nonliterary Texts', desc: 'Reading comprehension, analysis, genres.', weight: 0.40, games: [] },
  { id: 'comp_ela_3', name: 'Written Communication', desc: 'Writing process, composition, conventions.', weight: 0.30, games: [] },
  { id: 'comp_ela_4', name: 'Oral Communication and Media Literacy', desc: 'Speaking, listening, media literacy.', weight: 0.15, games: [] },
];

export const TEXES_QUESTIONS_ELA712 = [
  // Domain I: Integrated Language Arts, Diverse Learners, Study of English
  { id: 'ela001', comp: 'comp_ela_1', type: 'mc', difficulty: 1, q: 'Which approach best supports English learners in acquiring academic vocabulary?', choices: ['Teaching only definitions', 'Using context, visuals, and multiple exposures in reading and discussion', 'Avoiding technical terms', 'Assigning more homework'], answer: 'Using context, visuals, and multiple exposures in reading and discussion', explanation: 'Academic vocabulary is best acquired through rich context, visuals, and repeated meaningful use.' },
  { id: 'ela002', comp: 'comp_ela_1', type: 'mc', difficulty: 2, q: 'What is the primary purpose of teaching morphology (roots, prefixes, suffixes) in secondary ELA?', choices: ['To replace reading', 'To help students decode and infer word meaning', 'To prepare for spelling bees only', 'To avoid using a dictionary'], answer: 'To help students decode and infer word meaning', explanation: 'Morphology supports decoding and inferring meaning of unfamiliar words across content.' },
  { id: 'ela003', comp: 'comp_ela_1', type: 'mc', difficulty: 1, q: 'Which term refers to the rules governing sentence structure?', choices: ['Phonology', 'Syntax', 'Semantics', 'Pragmatics'], answer: 'Syntax', explanation: 'Syntax is the set of rules for how words combine into phrases and sentences.' },
  { id: 'ela004', comp: 'comp_ela_1', type: 'mc', difficulty: 2, q: 'A student consistently writes "their" for "there." What type of error is this?', choices: ['Spelling', 'Homophone confusion', 'Punctuation', 'Capitalization'], answer: 'Homophone confusion', explanation: '"Their" and "there" are homophones—words that sound alike but have different meanings and spellings.' },
  { id: 'ela005', comp: 'comp_ela_1', type: 'mc', difficulty: 1, q: 'What is the study of the history and development of the English language called?', choices: ['Syntax', 'Etymology', 'Phonetics', 'Rhetoric'], answer: 'Etymology', explanation: 'Etymology is the study of word origins and how meanings and forms have changed over time.' },
  { id: 'ela006', comp: 'comp_ela_1', type: 'mc', difficulty: 2, q: 'Which strategy best supports struggling readers in a mixed-ability classroom?', choices: ['Giving them easier texts only', 'Using scaffolded instruction, chunking, and gradual release', 'Skipping whole-class discussion', 'Assigning less work'], answer: 'Using scaffolded instruction, chunking, and gradual release', explanation: 'Scaffolding, chunking, and gradual release build competence without lowering expectations.' },
  { id: 'ela007', comp: 'comp_ela_1', type: 'mc', difficulty: 1, q: 'Which is a coordinating conjunction?', choices: ['although', 'because', 'and', 'when'], answer: 'and', explanation: 'Coordinating conjunctions (FANBOYS: for, and, nor, but, or, yet, so) join grammatically equal elements.' },
  { id: 'ela008', comp: 'comp_ela_1', type: 'mc', difficulty: 2, q: 'Differentiation in ELA for diverse learners should primarily address:', choices: ['Only reading level', 'Readiness, interest, and learning profile through varied texts and tasks', 'Giving everyone the same test', 'Extra time only'], answer: 'Readiness, interest, and learning profile through varied texts and tasks', explanation: 'Differentiation considers what students need, what engages them, and how they learn best.' },
  { id: 'ela009', comp: 'comp_ela_1', type: 'mc', difficulty: 1, q: 'What is a dialect?', choices: ['A language error', 'A variety of a language with distinct vocabulary, grammar, or pronunciation', 'Slang only', 'A dead language'], answer: 'A variety of a language with distinct vocabulary, grammar, or pronunciation', explanation: 'Dialects are legitimate varieties of a language, often tied to region or social group.' },
  { id: 'ela010', comp: 'comp_ela_1', type: 'mc', difficulty: 2, q: 'Why is it important to value students\' home languages and dialects in ELA instruction?', choices: ['To avoid teaching standard English', 'To build identity and bridge to academic English', 'To replace grammar instruction', 'To shorten lessons'], answer: 'To build identity and bridge to academic English', explanation: 'Valuing home language supports identity and provides a bridge to academic register.' },
  { id: 'ela011', comp: 'comp_ela_1', type: 'mc', difficulty: 1, q: 'Which sentence is punctuated correctly?', choices: ['The teacher said, "Read the next chapter."', 'The teacher said "Read the next chapter."', 'The teacher said, Read the next chapter.', 'The teacher said "Read the next chapter".'], answer: 'The teacher said, "Read the next chapter."', explanation: 'A comma introduces the quote; the period goes inside the quotation marks.' },
  { id: 'ela012', comp: 'comp_ela_1', type: 'mc', difficulty: 2, q: 'What is code-switching in language use?', choices: ['A grammar error', 'Alternating between languages or registers depending on context', 'Using only formal language', 'Avoiding slang'], answer: 'Alternating between languages or registers depending on context', explanation: 'Code-switching is shifting between languages or varieties (e.g., home vs. academic) appropriately.' },
  { id: 'ela013', comp: 'comp_ela_1', type: 'mc', difficulty: 1, q: 'Which is an example of a complex sentence?', choices: ['I ran. She walked.', 'I ran, and she walked.', 'Although I ran, she walked.', 'I ran and walked.'], answer: 'Although I ran, she walked.', explanation: 'A complex sentence has one independent clause and at least one dependent clause.' },
  { id: 'ela014', comp: 'comp_ela_1', type: 'mc', difficulty: 2, q: 'A student writes "Me and him went to the store." How can the teacher best address this?', choices: ['Mark it wrong only', 'Explain subject pronouns (I, he) and have students practice in similar sentences', 'Ignore it', 'Only correct the essay'], answer: 'Explain subject pronouns (I, he) and have students practice in similar sentences', explanation: 'Explicit instruction on subject vs. object pronouns with practice supports lasting change.' },
  { id: 'ela015', comp: 'comp_ela_1', type: 'mc', difficulty: 1, q: 'What is the antecedent in "Maria finished her book"?', choices: ['book', 'her', 'Maria', 'finished'], answer: 'Maria', explanation: 'The antecedent is the noun that a pronoun refers to—here, "Maria" for "her."' },

  // Domain II: Literature, Reading Processes, Literary and Nonliterary Texts
  { id: 'ela016', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'What is the main idea of a text?', choices: ['The first sentence', 'The central point or message the author conveys', 'The longest paragraph', 'The title only'], answer: 'The central point or message the author conveys', explanation: 'The main idea is the central claim or message that the rest of the text supports.' },
  { id: 'ela017', comp: 'comp_ela_2', type: 'mc', difficulty: 2, q: 'In literature, what is theme?', choices: ['The plot summary', 'A central idea or insight about human nature or life', 'The setting', 'The author\'s biography'], answer: 'A central idea or insight about human nature or life', explanation: 'Theme is the underlying message or insight that the work explores.' },
  { id: 'ela018', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'Which genre typically features a hero, quest, and supernatural elements?', choices: ['Realistic fiction', 'Epic', 'Essay', 'Biography'], answer: 'Epic', explanation: 'Epics are long narrative poems or stories featuring a hero, quest, and often supernatural elements.' },
  { id: 'ela019', comp: 'comp_ela_2', type: 'mc', difficulty: 2, q: 'What is the primary purpose of an author using first-person point of view?', choices: ['To be objective', 'To create a close connection to the narrator\'s thoughts and experience', 'To describe multiple characters equally', 'To avoid bias'], answer: 'To create a close connection to the narrator\'s thoughts and experience', explanation: 'First-person POV gives direct access to the narrator\'s perspective and voice.' },
  { id: 'ela020', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'What is inference in reading?', choices: ['Copying the text', 'Drawing a conclusion based on evidence and reasoning', 'Guessing randomly', 'Summarizing only'], answer: 'Drawing a conclusion based on evidence and reasoning', explanation: 'Inference is a conclusion reached from evidence and reasoning, not stated explicitly.' },
  { id: 'ela021', comp: 'comp_ela_2', type: 'mc', difficulty: 2, q: 'Which rhetorical appeal targets the audience\'s emotions?', choices: ['Ethos', 'Pathos', 'Logos', 'Kairos'], answer: 'Pathos', explanation: 'Pathos appeals to emotion; ethos to credibility; logos to logic; kairos to timing/context.' },
  { id: 'ela022', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'What is the tone of a text?', choices: ['The plot', 'The author\'s attitude toward the subject or audience', 'The setting', 'The number of characters'], answer: 'The author\'s attitude toward the subject or audience', explanation: 'Tone is the attitude conveyed by word choice, style, and content.' },
  { id: 'ela023', comp: 'comp_ela_2', type: 'mc', difficulty: 2, q: 'In poetry, what is meter?', choices: ['The theme', 'The regular pattern of stressed and unstressed syllables', 'The rhyme scheme only', 'The number of stanzas'], answer: 'The regular pattern of stressed and unstressed syllables', explanation: 'Meter is the rhythmic structure created by the pattern of stressed and unstressed syllables.' },
  { id: 'ela024', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'Which is a characteristic of nonfiction?', choices: ['It is always true', 'It presents information about real people, events, or ideas', 'It has no structure', 'It cannot use narrative'], answer: 'It presents information about real people, events, or ideas', explanation: 'Nonfiction is prose that presents factual information about the real world.' },
  { id: 'ela025', comp: 'comp_ela_2', type: 'mc', difficulty: 2, q: 'What is the purpose of close reading?', choices: ['To read quickly', 'To analyze text carefully for detail, structure, and meaning', 'To skip difficult words', 'To summarize only'], answer: 'To analyze text carefully for detail, structure, and meaning', explanation: 'Close reading involves careful analysis of language, structure, and meaning.' },
  { id: 'ela026', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'What is symbolism in literature?', choices: ['The dictionary definition of a word', 'When an object, character, or event represents something beyond its literal meaning', 'The author\'s name', 'The publication date'], answer: 'When an object, character, or event represents something beyond its literal meaning', explanation: 'Symbolism uses concrete elements to represent abstract ideas or themes.' },
  { id: 'ela027', comp: 'comp_ela_2', type: 'mc', difficulty: 2, q: 'Which strategy helps students comprehend dense informational text?', choices: ['Reading once only', 'Chunking the text, identifying main ideas, and discussing key vocabulary', 'Skipping headings', 'Avoiding discussion'], answer: 'Chunking the text, identifying main ideas, and discussing key vocabulary', explanation: 'Chunking, main-idea identification, and vocabulary support build comprehension of complex text.' },
  { id: 'ela028', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'What is the conflict in a story?', choices: ['The setting', 'The struggle or problem the protagonist faces', 'The resolution', 'The title'], answer: 'The struggle or problem the protagonist faces', explanation: 'Conflict is the central struggle that drives the plot.' },
  { id: 'ela029', comp: 'comp_ela_2', type: 'mc', difficulty: 2, q: 'What does it mean to analyze an argument in a nonfiction text?', choices: ['To summarize only', 'To identify claim, evidence, reasoning, and evaluate strength', 'To agree with the author', 'To ignore counterclaims'], answer: 'To identify claim, evidence, reasoning, and evaluate strength', explanation: 'Analyzing an argument involves identifying and evaluating claim, evidence, and reasoning.' },
  { id: 'ela030', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'Which literary device compares two things using "like" or "as"?', choices: ['Metaphor', 'Simile', 'Hyperbole', 'Personification'], answer: 'Simile', explanation: 'A simile is a direct comparison using "like" or "as."' },
  { id: 'ela031', comp: 'comp_ela_2', type: 'mc', difficulty: 2, q: 'What is the purpose of teaching students to identify an author\'s purpose?', choices: ['To memorize genres', 'To understand why the author wrote and how that shapes content and style', 'To skip the introduction', 'To only read for plot'], answer: 'To understand why the author wrote and how that shapes content and style', explanation: 'Author\'s purpose (e.g., persuade, inform, entertain) shapes content and style.' },
  { id: 'ela032', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'What is foreshadowing?', choices: ['A summary at the end', 'Hints or clues that suggest what will happen later', 'The climax', 'The setting'], answer: 'Hints or clues that suggest what will happen later', explanation: 'Foreshadowing gives advance hints about later events.' },
  { id: 'ela033', comp: 'comp_ela_2', type: 'mc', difficulty: 2, q: 'When comparing two texts, students should focus on:', choices: ['Only plot', 'Theme, structure, style, and how each achieves its purpose', 'Only the longer text', 'Publication date only'], answer: 'Theme, structure, style, and how each achieves its purpose', explanation: 'Comparing texts involves analyzing theme, structure, style, and purpose.' },
  { id: 'ela034', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'What is the climax of a story?', choices: ['The beginning', 'The turning point or moment of greatest tension', 'The resolution', 'The setting'], answer: 'The turning point or moment of greatest tension', explanation: 'The climax is the peak of conflict and tension before the resolution.' },
  { id: 'ela035', comp: 'comp_ela_2', type: 'mc', difficulty: 2, q: 'Which question best promotes critical reading of a persuasive text?', choices: ['What is the title?', 'What claim is the author making, and what evidence supports it?', 'How long is it?', 'Who is the publisher?'], answer: 'What claim is the author making, and what evidence supports it?', explanation: 'Identifying claim and evidence is central to evaluating argument.' },
  { id: 'ela036', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'What is alliteration?', choices: ['Repeated vowel sounds', 'Repetition of initial consonant sounds', 'End rhyme', 'Meter'], answer: 'Repetition of initial consonant sounds', explanation: 'Alliteration is the repetition of the same consonant sound at the start of nearby words.' },
  { id: 'ela037', comp: 'comp_ela_2', type: 'mc', difficulty: 2, q: 'How can a teacher help students understand a difficult historical or cultural context in a text?', choices: ['Skip the text', 'Provide background information, images, or short readings to build context', 'Only define words', 'Assign more pages'], answer: 'Provide background information, images, or short readings to build context', explanation: 'Building context through background and supplementary materials supports comprehension.' },
  { id: 'ela038', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'What is the difference between mood and tone?', choices: ['They are the same', 'Mood is the feeling created for the reader; tone is the author\'s attitude', 'Mood is the plot', 'Tone is the setting'], answer: 'Mood is the feeling created for the reader; tone is the author\'s attitude', explanation: 'Mood is the atmosphere or feeling; tone is the author\'s attitude.' },
  { id: 'ela039', comp: 'comp_ela_2', type: 'mc', difficulty: 2, q: 'What is the purpose of teaching students to cite textual evidence?', choices: ['To make essays longer', 'To support claims with evidence from the text', 'To avoid analysis', 'To copy the text'], answer: 'To support claims with evidence from the text', explanation: 'Citing evidence grounds analysis and argument in the text.' },
  { id: 'ela040', comp: 'comp_ela_2', type: 'mc', difficulty: 1, q: 'Which is an example of dramatic irony?', choices: ['The audience knows something a character does not', 'Two characters argue', 'The play has five acts', 'The setting is a castle'], answer: 'The audience knows something a character does not', explanation: 'Dramatic irony occurs when the audience has information that characters do not.' },

  // Domain III: Written Communication
  { id: 'ela041', comp: 'comp_ela_3', type: 'mc', difficulty: 1, q: 'What is the first stage of the writing process?', choices: ['Publishing', 'Prewriting/planning', 'Editing', 'Grading'], answer: 'Prewriting/planning', explanation: 'Prewriting (brainstorming, outlining, planning) is typically the first stage.' },
  { id: 'ela042', comp: 'comp_ela_3', type: 'mc', difficulty: 2, q: 'Why is revision different from editing?', choices: ['They are the same', 'Revision focuses on content, structure, and clarity; editing on mechanics and conventions', 'Revision is done last only', 'Editing is more important'], answer: 'Revision focuses on content, structure, and clarity; editing on mechanics and conventions', explanation: 'Revision addresses "big picture" content and structure; editing addresses grammar, spelling, punctuation.' },
  { id: 'ela043', comp: 'comp_ela_3', type: 'mc', difficulty: 1, q: 'What is a thesis statement?', choices: ['A question', 'A sentence that states the main claim or argument of an essay', 'The conclusion', 'A quote'], answer: 'A sentence that states the main claim or argument of an essay', explanation: 'The thesis is the central claim that the essay will develop and support.' },
  { id: 'ela044', comp: 'comp_ela_3', type: 'mc', difficulty: 2, q: 'Which transition best shows contrast?', choices: ['Furthermore', 'Similarly', 'However', 'In addition'], answer: 'However', explanation: '"However" signals a contrast or opposition between ideas.' },
  { id: 'ela045', comp: 'comp_ela_3', type: 'mc', difficulty: 1, q: 'What is the purpose of a topic sentence in a paragraph?', choices: ['To end the paragraph', 'To state the main idea of that paragraph', 'To introduce the next paragraph', 'To list sources'], answer: 'To state the main idea of that paragraph', explanation: 'The topic sentence expresses the paragraph\'s main idea; other sentences support it.' },
  { id: 'ela046', comp: 'comp_ela_3', type: 'mc', difficulty: 2, q: 'Why is it important to teach students to write for different audiences?', choices: ['To make assignments longer', 'So they adapt tone, evidence, and structure to the reader', 'To avoid narrative', 'To use only formal language'], answer: 'So they adapt tone, evidence, and structure to the reader', explanation: 'Audience shapes purpose, tone, and how evidence is presented.' },
  { id: 'ela047', comp: 'comp_ela_3', type: 'mc', difficulty: 1, q: 'Which is a run-on sentence?', choices: ['I ran. She walked.', 'I ran she walked.', 'I ran, and she walked.', 'Although I ran, she walked.'], answer: 'I ran she walked.', explanation: 'A run-on joins two independent clauses without proper punctuation or conjunction.' },
  { id: 'ela048', comp: 'comp_ela_3', type: 'mc', difficulty: 2, q: 'What is the purpose of peer review in the writing process?', choices: ['To grade the paper', 'To give feedback from a reader\'s perspective and encourage revision', 'To replace the teacher', 'To shorten the process'], answer: 'To give feedback from a reader\'s perspective and encourage revision', explanation: 'Peer review provides audience feedback and supports revision.' },
  { id: 'ela049', comp: 'comp_ela_3', type: 'mc', difficulty: 1, q: 'What is plagiarism?', choices: ['Using big words', 'Using someone else\'s words or ideas without giving credit', 'Writing long essays', 'Using a thesaurus'], answer: 'Using someone else\'s words or ideas without giving credit', explanation: 'Plagiarism is presenting another\'s work or ideas as one\'s own without attribution.' },
  { id: 'ela050', comp: 'comp_ela_3', type: 'mc', difficulty: 2, q: 'Which best describes argumentative writing?', choices: ['Only opinions', 'A claim supported by evidence and reasoning', 'A story', 'A summary only'], answer: 'A claim supported by evidence and reasoning', explanation: 'Argumentative writing advances a claim with evidence and reasoning.' },
  { id: 'ela051', comp: 'comp_ela_3', type: 'mc', difficulty: 1, q: 'What is the role of a conclusion in an essay?', choices: ['To introduce new ideas', 'To summarize main points and leave the reader with a final thought', 'To list sources only', 'To repeat the introduction'], answer: 'To summarize main points and leave the reader with a final thought', explanation: 'The conclusion reinforces the argument and provides closure.' },
  { id: 'ela052', comp: 'comp_ela_3', type: 'mc', difficulty: 2, q: 'Why is it important to teach sentence variety?', choices: ['To make essays longer', 'To improve flow, emphasis, and readability', 'To avoid short sentences', 'To use only complex sentences'], answer: 'To improve flow, emphasis, and readability', explanation: 'Varied sentence length and structure improve style and clarity.' },
  { id: 'ela053', comp: 'comp_ela_3', type: 'mc', difficulty: 1, q: 'Which punctuation is used to introduce a list after an independent clause?', choices: ['Period', 'Colon', 'Semicolon', 'Comma'], answer: 'Colon', explanation: 'A colon can introduce a list that follows a complete clause.' },
  { id: 'ela054', comp: 'comp_ela_3', type: 'mc', difficulty: 2, q: 'What is the purpose of a counterclaim in argumentative writing?', choices: ['To agree with the opposition', 'To acknowledge an opposing view and respond to it', 'To confuse the reader', 'To avoid evidence'], answer: 'To acknowledge an opposing view and respond to it', explanation: 'Addressing counterclaims strengthens argument and shows critical thinking.' },
  { id: 'ela055', comp: 'comp_ela_3', type: 'mc', difficulty: 1, q: 'What is a fragment?', choices: ['A complete sentence', 'A group of words that does not express a complete thought', 'A long paragraph', 'A thesis'], answer: 'A group of words that does not express a complete thought', explanation: 'A fragment is missing a subject, verb, or complete thought.' },
  { id: 'ela056', comp: 'comp_ela_3', type: 'mc', difficulty: 2, q: 'Which strategy helps students develop ideas during prewriting?', choices: ['Only outlining', 'Brainstorming, freewriting, or listing to generate ideas', 'Skipping prewriting', 'Copying a model'], answer: 'Brainstorming, freewriting, or listing to generate ideas', explanation: 'Prewriting strategies help generate and organize ideas before drafting.' },
  { id: 'ela057', comp: 'comp_ela_3', type: 'mc', difficulty: 1, q: 'What is the purpose of MLA or APA format?', choices: ['To make papers longer', 'To provide a standard way to cite sources and format papers', 'To avoid quotes', 'To replace revision'], answer: 'To provide a standard way to cite sources and format papers', explanation: 'Citation styles ensure consistent, clear attribution and formatting.' },
  { id: 'ela058', comp: 'comp_ela_3', type: 'mc', difficulty: 2, q: 'Why is it important to teach writing as a process rather than a single draft?', choices: ['To assign more homework', 'So students plan, draft, revise, and edit to improve quality', 'To avoid grading', 'To save time'], answer: 'So students plan, draft, revise, and edit to improve quality', explanation: 'Process-oriented instruction supports development of stronger writing.' },
  { id: 'ela059', comp: 'comp_ela_3', type: 'mc', difficulty: 1, q: 'Which sentence uses the passive voice?', choices: ['The teacher graded the papers.', 'The papers were graded by the teacher.', 'The teacher is grading.', 'Grade the papers.'], answer: 'The papers were graded by the teacher.', explanation: 'In passive voice, the subject receives the action; the doer may follow "by."' },
  { id: 'ela060', comp: 'comp_ela_3', type: 'mc', difficulty: 2, q: 'What is the purpose of showing models of strong and weak writing?', choices: ['To discourage students', 'To make criteria visible and support self-assessment', 'To replace feedback', 'To grade faster'], answer: 'To make criteria visible and support self-assessment', explanation: 'Models help students see what quality looks like and assess their own work.' },

  // Domain IV: Oral Communication and Media Literacy
  { id: 'ela061', comp: 'comp_ela_4', type: 'mc', difficulty: 1, q: 'What is active listening?', choices: ['Hearing only', 'Paying attention, understanding, and responding appropriately to what is said', 'Waiting to talk', 'Taking notes only'], answer: 'Paying attention, understanding, and responding appropriately to what is said', explanation: 'Active listening involves attention, comprehension, and appropriate response.' },
  { id: 'ela062', comp: 'comp_ela_4', type: 'mc', difficulty: 2, q: 'Why is it important to teach students to evaluate sources for credibility?', choices: ['To avoid the internet', 'To distinguish reliable from unreliable information in research and media', 'To use only books', 'To shorten research'], answer: 'To distinguish reliable from unreliable information in research and media', explanation: 'Evaluating credibility is essential for research and media literacy.' },
  { id: 'ela063', comp: 'comp_ela_4', type: 'mc', difficulty: 1, q: 'What is media literacy?', choices: ['Only watching videos', 'The ability to access, analyze, evaluate, and create media', 'Avoiding social media', 'Reading newspapers only'], answer: 'The ability to access, analyze, evaluate, and create media', explanation: 'Media literacy includes accessing, analyzing, evaluating, and creating media.' },
  { id: 'ela064', comp: 'comp_ela_4', type: 'mc', difficulty: 2, q: 'Which element is important in an effective oral presentation?', choices: ['Reading the entire script with no eye contact', 'Clear organization, eye contact, and appropriate pace', 'Speaking as fast as possible', 'Avoiding visuals'], answer: 'Clear organization, eye contact, and appropriate pace', explanation: 'Organization, eye contact, and pace support clarity and engagement.' },
  { id: 'ela065', comp: 'comp_ela_4', type: 'mc', difficulty: 1, q: 'What is bias in media?', choices: ['Factual reporting', 'A tendency to favor one perspective over others', 'Neutral language', 'Multiple sources'], answer: 'A tendency to favor one perspective over others', explanation: 'Bias is a preference or slant that can affect how information is presented.' },
  { id: 'ela066', comp: 'comp_ela_4', type: 'mc', difficulty: 2, q: 'How can a teacher support students in collaborative discussion?', choices: ['By doing all the talking', 'By establishing norms, roles, and sentence starters for respectful discourse', 'By avoiding disagreement', 'By grading participation only'], answer: 'By establishing norms, roles, and sentence starters for respectful discourse', explanation: 'Norms and scaffolds support equitable, productive discussion.' },
  { id: 'ela067', comp: 'comp_ela_4', type: 'mc', difficulty: 1, q: 'What is the purpose of a claim in argument?', choices: ['To ask a question', 'To state the position or conclusion being argued', 'To list evidence', 'To conclude'], answer: 'To state the position or conclusion being argued', explanation: 'The claim is the arguable position that evidence and reasoning support.' },
  { id: 'ela068', comp: 'comp_ela_4', type: 'mc', difficulty: 2, q: 'Which question helps students analyze how a video conveys meaning?', choices: ['How long is it?', 'What techniques (editing, sound, images) are used and what effect do they have?', 'Who is in it?', 'When was it made?'], answer: 'What techniques (editing, sound, images) are used and what effect do they have?', explanation: 'Analyzing techniques and effects builds media literacy.' },
  { id: 'ela069', comp: 'comp_ela_4', type: 'mc', difficulty: 1, q: 'What is the difference between fact and opinion?', choices: ['They are the same', 'Facts can be verified; opinions are beliefs or judgments', 'Facts are longer', 'Opinions are always wrong'], answer: 'Facts can be verified; opinions are beliefs or judgments', explanation: 'Facts are verifiable; opinions are subjective judgments.' },
  { id: 'ela070', comp: 'comp_ela_4', type: 'mc', difficulty: 2, q: 'Why should students practice speaking in front of peers?', choices: ['To embarrass them', 'To build confidence and receive feedback in a supportive context', 'To replace writing', 'To save time'], answer: 'To build confidence and receive feedback in a supportive context', explanation: 'Practice and peer feedback build speaking skills and confidence.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Bilingual Education Supplemental (164)
// 80 questions, 4 hr 45 min. Domains: Foundations, Language Acquisition, Literacy Development, Content Instruction & Assessment
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_BILINGUAL = [
  { id: 'comp_bil_1', name: 'Foundations of Bilingual Education', desc: 'History, concepts, LPAC, program models, learning environments.', weight: 0.25, games: [] },
  { id: 'comp_bil_2', name: 'Language Acquisition and Development', desc: 'L1/L2 acquisition, linguistic concepts, theories, factors.', weight: 0.25, games: [] },
  { id: 'comp_bil_3', name: 'Literacy Development', desc: 'Literacy in L1 and L2, assessment, transfer, biliteracy.', weight: 0.25, games: [] },
  { id: 'comp_bil_4', name: 'Content Instruction and Assessment', desc: 'Assessment, L1/L2 instruction, comprehensible input, strategies.', weight: 0.25, games: [] },
];

export const TEXES_QUESTIONS_BILINGUAL = [
  // Domain I: Foundations of Bilingual Education
  { id: 'bil001', comp: 'comp_bil_1', type: 'mc', difficulty: 1, q: 'What is the primary goal of additive bilingual education programs?', choices: ['To replace the first language with English', 'To develop proficiency in both languages while adding English', 'To teach only in English', 'To delay English instruction'], answer: 'To develop proficiency in both languages while adding English', explanation: 'Additive programs maintain and develop L1 while adding L2 (English), supporting cognitive and academic growth.' },
  { id: 'bil002', comp: 'comp_bil_1', type: 'mc', difficulty: 2, q: 'What is the role of the Language Proficiency Assessment Committee (LPAC)?', choices: ['To grade students', 'To determine placement, monitor progress, and make decisions for emergent bilingual students', 'To replace the teacher', 'To administer state tests only'], answer: 'To determine placement, monitor progress, and make decisions for emergent bilingual students', explanation: 'LPAC is responsible for identification, placement, and instructional decisions for ELLs per state policy.' },
  { id: 'bil003', comp: 'comp_bil_1', type: 'mc', difficulty: 1, q: 'Which term describes a program that uses two languages for instruction?', choices: ['ESL only', 'Bilingual education', 'Monolingual immersion', 'Subtractive program'], answer: 'Bilingual education', explanation: 'Bilingual education uses two languages for instruction to develop biliteracy and content knowledge.' },
  { id: 'bil004', comp: 'comp_bil_1', type: 'mc', difficulty: 2, q: 'Why is it important to create a multicultural learning environment in a bilingual classroom?', choices: ['To avoid using L1', 'To address affective, linguistic, and cognitive needs and value students\' backgrounds', 'To teach only American culture', 'To reduce materials'], answer: 'To address affective, linguistic, and cognitive needs and value students\' backgrounds', explanation: 'Multicultural environments support identity, engagement, and transfer between languages and cultures.' },
  { id: 'bil005', comp: 'comp_bil_1', type: 'mc', difficulty: 1, q: 'What is biculturalism?', choices: ['Speaking two languages only', 'Understanding and participating in two or more cultures', 'Replacing one culture with another', 'Teaching culture only in social studies'], answer: 'Understanding and participating in two or more cultures', explanation: 'Biculturalism involves competence and identity in more than one culture.' },
  { id: 'bil006', comp: 'comp_bil_1', type: 'mc', difficulty: 2, q: 'Which program model is most aligned with additive bilingualism?', choices: ['Early-exit transitional', 'Dual language (two-way or one-way)', 'English-only submersion', 'Late-exit with minimal L1'], answer: 'Dual language (two-way or one-way)', explanation: 'Dual language programs aim for high levels of proficiency in both languages (additive).' },
  { id: 'bil007', comp: 'comp_bil_1', type: 'mc', difficulty: 1, q: 'What does LPAC stand for?', choices: ['Language Program and Curriculum', 'Language Proficiency Assessment Committee', 'Literacy and Parent Advisory Council', 'Learning Progress Assessment Center'], answer: 'Language Proficiency Assessment Committee', explanation: 'LPAC is the committee that makes decisions for English learners regarding placement and services.' },
  { id: 'bil008', comp: 'comp_bil_1', type: 'mc', difficulty: 2, q: 'Why might a subtractive bilingual environment be harmful?', choices: ['It supports both languages', 'It can lead to loss of L1 and affect identity and academic transfer', 'It speeds up English acquisition', 'It is required by law'], answer: 'It can lead to loss of L1 and affect identity and academic transfer', explanation: 'Subtractive approaches devalue L1 and may lead to language loss and reduced academic benefit from L1.' },
  { id: 'bil009', comp: 'comp_bil_1', type: 'mc', difficulty: 1, q: 'Which is a state-approved bilingual program model in Texas?', choices: ['English-only immersion', 'Dual language immersion', 'No L1 instruction', 'Short-term ESL only'], answer: 'Dual language immersion', explanation: 'Texas approves various models including dual language immersion for bilingual education.' },
  { id: 'bil010', comp: 'comp_bil_1', type: 'mc', difficulty: 2, q: 'How can a teacher create an effective bilingual learning environment?', choices: ['By using only English', 'By providing comprehensible input in both languages and valuing both cultures', 'By avoiding L1 in class', 'By testing more often'], answer: 'By providing comprehensible input in both languages and valuing both cultures', explanation: 'Effective environments use both languages purposefully and affirm students\' languages and cultures.' },

  // Domain II: Language Acquisition and Development
  { id: 'bil011', comp: 'comp_bil_2', type: 'mc', difficulty: 1, q: 'What is the difference between BICS and CALP?', choices: ['They are the same', 'BICS is social language; CALP is academic language', 'BICS is written only; CALP is oral only', 'CALP is easier'], answer: 'BICS is social language; CALP is academic language', explanation: 'BICS (Basic Interpersonal Communication Skills) is conversational; CALP (Cognitive Academic Language Proficiency) is academic.' },
  { id: 'bil012', comp: 'comp_bil_2', type: 'mc', difficulty: 2, q: 'According to Krashen, what is comprehensible input?', choices: ['Any English input', 'Input that is slightly above the learner\'s current level (i+1) and understandable', 'Only written text', 'Input with no new vocabulary'], answer: 'Input that is slightly above the learner\'s current level (i+1) and understandable', explanation: 'Comprehensible input (i+1) is key to acquisition: understandable but slightly challenging.' },
  { id: 'bil013', comp: 'comp_bil_2', type: 'mc', difficulty: 1, q: 'What is the silent period in second language acquisition?', choices: ['A learning disability', 'A phase when the learner may produce little speech but is building comprehension', 'A period of no instruction', 'Only in adults'], answer: 'A phase when the learner may produce little speech but is building comprehension', explanation: 'Many learners have a silent period where they listen and comprehend before speaking extensively.' },
  { id: 'bil014', comp: 'comp_bil_2', type: 'mc', difficulty: 2, q: 'Which factor can positively affect second language acquisition?', choices: ['High anxiety only', 'Strong literacy in L1 and meaningful exposure to L2', 'Avoiding L1 completely', 'Delaying L2 instruction'], answer: 'Strong literacy in L1 and meaningful exposure to L2', explanation: 'L1 literacy and meaningful L2 input support L2 acquisition and transfer.' },
  { id: 'bil015', comp: 'comp_bil_2', type: 'mc', difficulty: 1, q: 'What is code-switching?', choices: ['A grammar error', 'Alternating between languages within a conversation or utterance', 'Using only one language', 'A test type'], answer: 'Alternating between languages within a conversation or utterance', explanation: 'Code-switching is the use of more than one language in discourse; it is a natural bilingual behavior.' },
  { id: 'bil016', comp: 'comp_bil_2', type: 'mc', difficulty: 2, q: 'What is the interdependence hypothesis (CUP)?', choices: ['L1 and L2 are unrelated', 'Proficiency in L1 can support development in L2 through a common underlying proficiency', 'L2 replaces L1', 'Only one language at a time'], answer: 'Proficiency in L1 can support development in L2 through a common underlying proficiency', explanation: 'CUP suggests that literacy and cognitive skills transfer across languages when both are supported.' },
  { id: 'bil017', comp: 'comp_bil_2', type: 'mc', difficulty: 1, q: 'Which term refers to the first language a person learns?', choices: ['L2', 'Target language', 'L1', 'Second language'], answer: 'L1', explanation: 'L1 is the first (native/home) language; L2 is the second or additional language.' },
  { id: 'bil018', comp: 'comp_bil_2', type: 'mc', difficulty: 2, q: 'Why might a student mix languages (e.g., use an L1 word in an L2 sentence)?', choices: ['Always a deficit', 'Often due to developing vocabulary or accessing concepts learned in one language', 'To avoid learning', 'Only in young children'], answer: 'Often due to developing vocabulary or accessing concepts learned in one language', explanation: 'Mixing can reflect developing proficiency and conceptual knowledge across languages.' },
  { id: 'bil019', comp: 'comp_bil_2', type: 'mc', difficulty: 1, q: 'What is the affective filter?', choices: ['A test', 'The emotional factors (e.g., anxiety) that can block language acquisition', 'A type of curriculum', 'A language level'], answer: 'The emotional factors (e.g., anxiety) that can block language acquisition', explanation: 'Krashen\'s affective filter: high anxiety can block comprehensible input from being acquired.' },
  { id: 'bil020', comp: 'comp_bil_2', type: 'mc', difficulty: 2, q: 'Which practice best supports second language development in the classroom?', choices: ['Correcting every error immediately', 'Providing rich input, interaction, and opportunities to use language purposefully', 'Using only worksheets', 'Avoiding group work'], answer: 'Providing rich input, interaction, and opportunities to use language purposefully', explanation: 'Acquisition is supported by meaningful input, interaction, and purposeful use of language.' },

  // Domain III: Literacy Development
  { id: 'bil021', comp: 'comp_bil_3', type: 'mc', difficulty: 1, q: 'What is biliteracy?', choices: ['Reading only in English', 'The ability to read and write in two languages', 'Writing only in L1', 'A single literacy test'], answer: 'The ability to read and write in two languages', explanation: 'Biliteracy is literacy in two languages.' },
  { id: 'bil022', comp: 'comp_bil_3', type: 'mc', difficulty: 2, q: 'Why is literacy development in L1 important for L2 literacy?', choices: ['It is not important', 'Skills and strategies can transfer; strong L1 literacy supports L2 literacy', 'L1 should be avoided', 'Only oral L1 matters'], answer: 'Skills and strategies can transfer; strong L1 literacy supports L2 literacy', explanation: 'Research shows transfer of literacy skills and strategies when L1 literacy is developed.' },
  { id: 'bil023', comp: 'comp_bil_3', type: 'mc', difficulty: 1, q: 'Which is an example of a literacy assessment for emergent bilinguals?', choices: ['Only norm-referenced tests in English', 'Running records, retells, or assessments in L1 and L2 as appropriate', 'No reading assessments', 'Spelling tests only'], answer: 'Running records, retells, or assessments in L1 and L2 as appropriate', explanation: 'Multiple measures, including in L1 when applicable, give a fuller picture of literacy.' },
  { id: 'bil024', comp: 'comp_bil_3', type: 'mc', difficulty: 2, q: 'How can a teacher promote biliteracy in the classroom?', choices: ['By teaching only in English', 'By providing reading and writing opportunities in both languages with appropriate scaffolds', 'By avoiding L1 texts', 'By testing in English only'], answer: 'By providing reading and writing opportunities in both languages with appropriate scaffolds', explanation: 'Biliteracy is promoted through sustained, scaffolded practice in both languages.' },
  { id: 'bil025', comp: 'comp_bil_3', type: 'mc', difficulty: 1, q: 'What is literacy transfer?', choices: ['Only copying text', 'The application of reading/writing skills and strategies from one language to another', 'Forgetting L1', 'A single language only'], answer: 'The application of reading/writing skills and strategies from one language to another', explanation: 'Transfer refers to using skills and strategies from one language in another.' },
  { id: 'bil026', comp: 'comp_bil_3', type: 'mc', difficulty: 2, q: 'Which strategy supports decoding for emergent bilinguals who are learning to read in L2?', choices: ['Avoiding phonics', 'Teaching letter-sound relationships and connecting to known words in L1 when helpful', 'Only whole word', 'No L1 references'], answer: 'Teaching letter-sound relationships and connecting to known words in L1 when helpful', explanation: 'Phonics and cross-linguistic connections can support decoding in L2.' },
  { id: 'bil027', comp: 'comp_bil_3', type: 'mc', difficulty: 1, q: 'What is the role of vocabulary instruction in biliteracy?', choices: ['Only in English', 'To build word knowledge in both languages to support comprehension', 'To replace reading', 'Only in L1'], answer: 'To build word knowledge in both languages to support comprehension', explanation: 'Vocabulary in both languages supports comprehension and expression in both.' },
  { id: 'bil028', comp: 'comp_bil_3', type: 'mc', difficulty: 2, q: 'Why might a teacher use shared reading or read-alouds in both L1 and L2?', choices: ['To save time', 'To model fluency, build comprehension, and develop vocabulary in both languages', 'To avoid student reading', 'Only in one language'], answer: 'To model fluency, build comprehension, and develop vocabulary in both languages', explanation: 'Read-alouds in both languages support language and literacy development in both.' },
  { id: 'bil029', comp: 'comp_bil_3', type: 'mc', difficulty: 1, q: 'Which term describes reading that is appropriate for a student\'s level with support?', choices: ['Frustration level', 'Independent level', 'Instructional level', 'Silent only'], answer: 'Instructional level', explanation: 'Instructional level is where the student can read with appropriate support and instruction.' },
  { id: 'bil030', comp: 'comp_bil_3', type: 'mc', difficulty: 2, q: 'How can writing instruction support biliteracy?', choices: ['By writing only in English', 'By allowing drafting or brainstorming in L1 and writing in L2 (or both) with strategy instruction', 'By avoiding L1', 'By grading grammar only'], answer: 'By allowing drafting or brainstorming in L1 and writing in L2 (or both) with strategy instruction', explanation: 'Using L1 for planning and L2 for production (or both) supports biliteracy development.' },

  // Domain IV: Content Instruction and Assessment
  { id: 'bil031', comp: 'comp_bil_4', type: 'mc', difficulty: 1, q: 'What is comprehensible input in content instruction?', choices: ['Only English', 'Content presented in ways that make it understandable (e.g., visuals, scaffolding, language support)', 'Only lectures', 'No support'], answer: 'Content presented in ways that make it understandable (e.g., visuals, scaffolding, language support)', explanation: 'Comprehensible input makes content accessible through scaffolding and language support.' },
  { id: 'bil032', comp: 'comp_bil_4', type: 'mc', difficulty: 2, q: 'Why should assessment for emergent bilinguals consider both content and language?', choices: ['To fail more students', 'To distinguish between language proficiency and content knowledge', 'To avoid testing', 'To use only one language'], answer: 'To distinguish between language proficiency and content knowledge', explanation: 'Separating language from content helps tailor instruction and avoid misclassification.' },
  { id: 'bil033', comp: 'comp_bil_4', type: 'mc', difficulty: 1, q: 'Which strategy makes content accessible to emergent bilinguals?', choices: ['Speaking faster', 'Using visuals, graphic organizers, and pre-teaching key vocabulary', 'Avoiding L1', 'Only written text'], answer: 'Using visuals, graphic organizers, and pre-teaching key vocabulary', explanation: 'Visuals, organizers, and vocabulary preview support comprehension of content.' },
  { id: 'bil034', comp: 'comp_bil_4', type: 'mc', difficulty: 2, q: 'What is the purpose of using authentic materials in bilingual instruction?', choices: ['To make lessons longer', 'To provide purposeful, real-world language and content experiences', 'To avoid textbooks', 'To test only'], answer: 'To provide purposeful, real-world language and content experiences', explanation: 'Authentic materials connect learning to real-world use and increase engagement.' },
  { id: 'bil035', comp: 'comp_bil_4', type: 'mc', difficulty: 1, q: 'What is sheltered instruction?', choices: ['Hiding content', 'Teaching content in a way that makes it comprehensible while developing language', 'Teaching only language', 'No scaffolding'], answer: 'Teaching content in a way that makes it comprehensible while developing language', explanation: 'Sheltered instruction combines content and language objectives with scaffolding.' },
  { id: 'bil036', comp: 'comp_bil_4', type: 'mc', difficulty: 2, q: 'How can a teacher use data to inform instruction for emergent bilinguals?', choices: ['By ignoring data', 'By using assessment data to identify strengths and needs and plan next steps', 'By testing only in English', 'By grouping only by grade'], answer: 'By using assessment data to identify strengths and needs and plan next steps', explanation: 'Data-informed instruction targets specific language and content needs.' },
  { id: 'bil037', comp: 'comp_bil_4', type: 'mc', difficulty: 1, q: 'Which is an example of a content-area strategy that supports language development?', choices: ['Only multiple choice', 'Think-pair-share, sentence frames, or structured discussions', 'Silent work only', 'No discussion'], answer: 'Think-pair-share, sentence frames, or structured discussions', explanation: 'Structured talk and writing support both content learning and language development.' },
  { id: 'bil038', comp: 'comp_bil_4', type: 'mc', difficulty: 2, q: 'Why is it important to teach learning strategies (e.g., summarizing, questioning) in bilingual settings?', choices: ['To replace language', 'So students can apply strategies across languages and content areas', 'To avoid reading', 'Only in L1'], answer: 'So students can apply strategies across languages and content areas', explanation: 'Strategies transfer and support comprehension and learning in both languages.' },
  { id: 'bil039', comp: 'comp_bil_4', type: 'mc', difficulty: 1, q: 'What is the role of L1 in content instruction in a bilingual program?', choices: ['No role', 'To clarify concepts, build background, and support transfer when used purposefully', 'To replace L2', 'Only for discipline'], answer: 'To clarify concepts, build background, and support transfer when used purposefully', explanation: 'Strategic use of L1 can clarify content and support transfer to L2.' },
  { id: 'bil040', comp: 'comp_bil_4', type: 'mc', difficulty: 2, q: 'Which assessment practice is most appropriate for emergent bilinguals in content areas?', choices: ['Only standardized tests in English', 'Multiple measures, including performance tasks and accommodations as allowed', 'No accommodations', 'Only oral exams'], answer: 'Multiple measures, including performance tasks and accommodations as allowed', explanation: 'Multiple measures and appropriate accommodations give a fairer picture of content knowledge.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Science 7–12 (236)
// 140 questions, ~4 hr 45 min. Domains: Scientific Inquiry, Physics, Chemistry, Cell, Heredity, Diversity, Ecosystems, Earth, Universe, Instruction
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_SCIENCE712 = [
  { id: 'comp_sci_1', name: 'Scientific Inquiry and Processes', desc: 'Nature of science, lab safety, data analysis.', weight: 0.10, games: [] },
  { id: 'comp_sci_2', name: 'Physics', desc: 'Mechanics, E&M, waves, thermodynamics.', weight: 0.20, games: [] },
  { id: 'comp_sci_3', name: 'Chemistry', desc: 'Matter, bonding, reactions, periodicity.', weight: 0.20, games: [] },
  { id: 'comp_sci_4', name: 'Cell Structure and Processes', desc: 'Cell biology, metabolism, cellular respiration.', weight: 0.08, games: [] },
  { id: 'comp_sci_5', name: 'Heredity and Evolution of Life', desc: 'Genetics, heredity, evolution.', weight: 0.08, games: [] },
  { id: 'comp_sci_6', name: 'Diversity of Life', desc: 'Classification, diversity, adaptations.', weight: 0.08, games: [] },
  { id: 'comp_sci_7', name: 'Interdependence of Life and Environmental Systems', desc: 'Ecology, ecosystems, biogeochemical cycles.', weight: 0.06, games: [] },
  { id: 'comp_sci_8', name: 'Earth\'s History and Structure', desc: 'Geology, Earth systems, history.', weight: 0.09, games: [] },
  { id: 'comp_sci_9', name: 'Solar System and Universe', desc: 'Astronomy, components and properties.', weight: 0.06, games: [] },
  { id: 'comp_sci_10', name: 'Science Learning, Instruction and Assessment', desc: 'Pedagogy, safety, equity.', weight: 0.05, games: [] },
];

export const TEXES_QUESTIONS_SCIENCE712 = [
  // Domain I: Scientific Inquiry and Processes
  { id: 'sci001', comp: 'comp_sci_1', type: 'mc', difficulty: 1, q: 'Which step of the scientific method follows forming a hypothesis?', choices: ['Designing an experiment', 'Making observations', 'Drawing conclusions', 'Communicating results'], answer: 'Designing an experiment', explanation: 'After forming a testable hypothesis, scientists design experiments to test it.' },
  { id: 'sci002', comp: 'comp_sci_1', type: 'mc', difficulty: 1, q: 'What is the primary purpose of a control group?', choices: ['To speed up the experiment', 'To provide a baseline for comparison', 'To test multiple variables', 'To ensure random results'], answer: 'To provide a baseline for comparison', explanation: 'The control group is used for comparison so the effect of the independent variable can be identified.' },
  { id: 'sci003', comp: 'comp_sci_1', type: 'mc', difficulty: 2, q: 'A measurement is reported as 3.40 ± 0.05 cm. What does 0.05 represent?', choices: ['The true value', 'The uncertainty or error', 'The average', 'The percent error'], answer: 'The uncertainty or error', explanation: 'The ± value indicates the uncertainty or margin of error in the measurement.' },
  { id: 'sci004', comp: 'comp_sci_1', type: 'mc', difficulty: 1, q: 'Which is a safe practice in the lab?', choices: ['Eating at the lab bench', 'Wearing safety goggles when using chemicals', 'Pouring water into acid', 'Leaving hot plates unattended'], answer: 'Wearing safety goggles when using chemicals', explanation: 'Safety goggles protect eyes from splashes and fumes.' },
  { id: 'sci005', comp: 'comp_sci_1', type: 'mc', difficulty: 2, q: 'What type of graph is best for showing the relationship between two continuous variables?', choices: ['Bar graph', 'Pie chart', 'Line graph', 'Histogram'], answer: 'Line graph', explanation: 'Line graphs effectively show how one variable changes with another.' },
  { id: 'sci006', comp: 'comp_sci_1', type: 'mc', difficulty: 1, q: 'What does it mean for a theory to be falsifiable?', choices: ['It has been proven false', 'It can be tested and potentially disproven', 'It is based on opinion', 'It has no supporting evidence'], answer: 'It can be tested and potentially disproven', explanation: 'Scientific theories must be falsifiable.' },

  // Domain II: Physics
  { id: 'sci007', comp: 'comp_sci_2', type: 'mc', difficulty: 1, q: 'An object moves at constant velocity. What is the net force on it?', choices: ['Zero', 'Equal to its weight', 'Increasing', 'Equal to its mass'], answer: 'Zero', explanation: 'Newton\'s first law: constant velocity means zero acceleration, so net force is zero.' },
  { id: 'sci008', comp: 'comp_sci_2', type: 'mc', difficulty: 1, q: 'What is the acceleration of a 5 kg object when a 10 N force is applied?', choices: ['0.5 m/s²', '2 m/s²', '50 m/s²', '2 N'], answer: '2 m/s²', explanation: 'F = ma → a = F/m = 10/5 = 2 m/s².' },
  { id: 'sci009', comp: 'comp_sci_2', type: 'mc', difficulty: 2, q: 'A ball is thrown upward. At the top of its path, what is its velocity and acceleration?', choices: ['v = 0, a = 0', 'v = 0, a = 9.8 m/s² downward', 'v = 9.8 m/s up, a = 0', 'v = 9.8 m/s down, a = 9.8 m/s² down'], answer: 'v = 0, a = 9.8 m/s² downward', explanation: 'At the peak, velocity is zero; acceleration due to gravity is still 9.8 m/s² downward.' },
  { id: 'sci010', comp: 'comp_sci_2', type: 'mc', difficulty: 1, q: 'What is the kinetic energy of a 4 kg object moving at 3 m/s?', choices: ['6 J', '12 J', '18 J', '36 J'], answer: '18 J', explanation: 'KE = ½mv² = ½(4)(9) = 18 J.' },
  { id: 'sci011', comp: 'comp_sci_2', type: 'mc', difficulty: 1, q: 'What is the unit of electric current?', choices: ['Volt', 'Ampere', 'Ohm', 'Coulomb'], answer: 'Ampere', explanation: 'The SI unit of electric current is the ampere (A).' },
  { id: 'sci012', comp: 'comp_sci_2', type: 'mc', difficulty: 2, q: 'A wave has frequency 5 Hz and wavelength 2 m. What is its speed?', choices: ['2.5 m/s', '7 m/s', '10 m/s', '0.4 m/s'], answer: '10 m/s', explanation: 'v = fλ = (5)(2) = 10 m/s.' },
  { id: 'sci013', comp: 'comp_sci_2', type: 'mc', difficulty: 1, q: 'Sound travels fastest in:', choices: ['Air', 'Water', 'Steel', 'Vacuum'], answer: 'Steel', explanation: 'Sound is a mechanical wave; it travels fastest in solids.' },
  { id: 'sci014', comp: 'comp_sci_2', type: 'mc', difficulty: 2, q: 'The first law of thermodynamics states that:', choices: ['Energy cannot be created or destroyed', 'Entropy always increases', 'Heat flows from cold to hot', 'Absolute zero is unattainable'], answer: 'Energy cannot be created or destroyed', explanation: 'The first law is conservation of energy.' },

  // Domain III: Chemistry
  { id: 'sci015', comp: 'comp_sci_3', type: 'mc', difficulty: 1, q: 'What is the atomic number of an element?', choices: ['Number of neutrons', 'Number of protons', 'Number of protons + neutrons', 'Number of electrons in a neutral atom'], answer: 'Number of protons', explanation: 'The atomic number is the number of protons in the nucleus.' },
  { id: 'sci016', comp: 'comp_sci_3', type: 'mc', difficulty: 1, q: 'Which subatomic particle has a negative charge?', choices: ['Proton', 'Neutron', 'Electron', 'Nucleus'], answer: 'Electron', explanation: 'Electrons carry a negative charge.' },
  { id: 'sci017', comp: 'comp_sci_3', type: 'mc', difficulty: 2, q: 'What type of bond is formed when electrons are shared between atoms?', choices: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], answer: 'Covalent', explanation: 'Covalent bonds involve the sharing of electron pairs between atoms.' },
  { id: 'sci018', comp: 'comp_sci_3', type: 'mc', difficulty: 1, q: 'What is the chemical formula for water?', choices: ['H2O2', 'HO', 'H2O', 'OH'], answer: 'H2O', explanation: 'Water is H₂O.' },
  { id: 'sci019', comp: 'comp_sci_3', type: 'mc', difficulty: 2, q: 'In a balanced chemical equation, what must be equal on both sides?', choices: ['Only the number of molecules', 'The number of atoms of each element', 'Only the total mass', 'The number of compounds'], answer: 'The number of atoms of each element', explanation: 'The law of conservation of mass requires the same number of each type of atom on both sides.' },
  { id: 'sci020', comp: 'comp_sci_3', type: 'mc', difficulty: 1, q: 'What is the pH of a neutral solution at 25°C?', choices: ['0', '5', '7', '14'], answer: '7', explanation: 'A neutral solution has pH = 7.' },
  { id: 'sci021', comp: 'comp_sci_3', type: 'mc', difficulty: 2, q: 'Which statement about isotopes is true?', choices: ['They have the same mass number', 'They have the same number of protons but different neutrons', 'They have different atomic numbers', 'They are always radioactive'], answer: 'They have the same number of protons but different neutrons', explanation: 'Isotopes have the same atomic number but different mass (neutrons).' },
  { id: 'sci022', comp: 'comp_sci_3', type: 'mc', difficulty: 1, q: 'In an exothermic reaction, what happens to the temperature of the surroundings?', choices: ['It decreases', 'It increases', 'It stays the same', 'It fluctuates'], answer: 'It increases', explanation: 'Exothermic reactions release heat to the surroundings.' },

  // Domain IV: Cell Structure and Processes
  { id: 'sci023', comp: 'comp_sci_4', type: 'mc', difficulty: 1, q: 'Where does cellular respiration primarily occur in eukaryotic cells?', choices: ['Nucleus', 'Ribosomes', 'Mitochondria', 'Golgi apparatus'], answer: 'Mitochondria', explanation: 'Cellular respiration (ATP production) occurs mainly in the mitochondria.' },
  { id: 'sci024', comp: 'comp_sci_4', type: 'mc', difficulty: 2, q: 'What is the function of the cell membrane?', choices: ['Only to provide shape', 'To control what enters and leaves the cell', 'To make proteins only', 'To store DNA'], answer: 'To control what enters and leaves the cell', explanation: 'The cell membrane is selectively permeable and regulates passage of materials.' },
  { id: 'sci025', comp: 'comp_sci_4', type: 'mc', difficulty: 1, q: 'Which organelle is the site of protein synthesis?', choices: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Chloroplast'], answer: 'Ribosome', explanation: 'Ribosomes assemble proteins from amino acids using mRNA.' },
  { id: 'sci026', comp: 'comp_sci_4', type: 'mc', difficulty: 2, q: 'What is the main product of photosynthesis?', choices: ['Oxygen and glucose', 'Only carbon dioxide', 'Only water', 'ATP only'], answer: 'Oxygen and glucose', explanation: 'Photosynthesis produces glucose and releases oxygen as a byproduct.' },
  { id: 'sci027', comp: 'comp_sci_4', type: 'mc', difficulty: 1, q: 'Which process occurs in the nucleus?', choices: ['Cellular respiration', 'DNA replication and transcription', 'Protein folding', 'Glycolysis'], answer: 'DNA replication and transcription', explanation: 'DNA replication and transcription of DNA to RNA occur in the nucleus.' },
  { id: 'sci028', comp: 'comp_sci_4', type: 'mc', difficulty: 2, q: 'What is the role of ATP in the cell?', choices: ['To store genetic information', 'To provide energy for cellular processes', 'To build cell walls', 'To transport oxygen'], answer: 'To provide energy for cellular processes', explanation: 'ATP is the main energy currency of the cell.' },

  // Domain V: Heredity and Evolution
  { id: 'sci029', comp: 'comp_sci_5', type: 'mc', difficulty: 1, q: 'What is an allele?', choices: ['A type of cell', 'A variant form of a gene', 'A chromosome', 'A trait'], answer: 'A variant form of a gene', explanation: 'Alleles are different versions of the same gene.' },
  { id: 'sci030', comp: 'comp_sci_5', type: 'mc', difficulty: 2, q: 'A homozygous dominant parent and a homozygous recessive parent have offspring. What is the genotype ratio of the F1 generation?', choices: ['All heterozygous', '1:2:1', 'All dominant', '3:1'], answer: 'All heterozygous', explanation: 'Cross AA × aa gives all Aa (heterozygous).' },
  { id: 'sci031', comp: 'comp_sci_5', type: 'mc', difficulty: 1, q: 'What is natural selection?', choices: ['Random change in genes', 'Process by which organisms better adapted to the environment tend to survive and reproduce', 'Choice by humans', 'Acquired traits passed on'], answer: 'Process by which organisms better adapted to the environment tend to survive and reproduce', explanation: 'Natural selection is the mechanism of evolutionary change.' },
  { id: 'sci032', comp: 'comp_sci_5', type: 'mc', difficulty: 2, q: 'What does the fossil record provide evidence for?', choices: ['Only current species', 'Change in life over time and common ancestry', 'That species do not change', 'Only dinosaurs'], answer: 'Change in life over time and common ancestry', explanation: 'The fossil record shows change over time and supports evolution.' },
  { id: 'sci033', comp: 'comp_sci_5', type: 'mc', difficulty: 1, q: 'Where are genes located?', choices: ['Only in the cytoplasm', 'On chromosomes (DNA)', 'Only in ribosomes', 'In the cell membrane'], answer: 'On chromosomes (DNA)', explanation: 'Genes are segments of DNA on chromosomes.' },
  { id: 'sci034', comp: 'comp_sci_5', type: 'mc', difficulty: 2, q: 'What is a mutation?', choices: ['Always harmful', 'A change in the DNA sequence', 'Only in somatic cells', 'Never passed to offspring'], answer: 'A change in the DNA sequence', explanation: 'A mutation is a change in the nucleotide sequence of DNA.' },

  // Domain VI: Diversity of Life
  { id: 'sci035', comp: 'comp_sci_6', type: 'mc', difficulty: 1, q: 'What is the broadest taxonomic category?', choices: ['Species', 'Genus', 'Kingdom', 'Domain'], answer: 'Domain', explanation: 'Domain is the highest level in modern classification (e.g., Bacteria, Archaea, Eukarya).' },
  { id: 'sci036', comp: 'comp_sci_6', type: 'mc', difficulty: 2, q: 'Which characteristic distinguishes prokaryotes from eukaryotes?', choices: ['Prokaryotes are always larger', 'Eukaryotes have a membrane-bound nucleus; prokaryotes do not', 'Prokaryotes have mitochondria', 'Eukaryotes have no DNA'], answer: 'Eukaryotes have a membrane-bound nucleus; prokaryotes do not', explanation: 'The presence of a nucleus is a key structural difference.' },
  { id: 'sci037', comp: 'comp_sci_6', type: 'mc', difficulty: 1, q: 'What is an adaptation?', choices: ['A learned behavior only', 'A trait that increases fitness in an environment', 'A mutation that is always harmful', 'A random event'], answer: 'A trait that increases fitness in an environment', explanation: 'Adaptations are heritable traits that improve survival and reproduction.' },
  { id: 'sci038', comp: 'comp_sci_6', type: 'mc', difficulty: 2, q: 'Which group includes organisms that can perform photosynthesis?', choices: ['Only plants', 'Plants, some protists, and some bacteria', 'Only bacteria', 'Only algae'], answer: 'Plants, some protists, and some bacteria', explanation: 'Photosynthesis occurs in plants, many protists (e.g., algae), and some bacteria.' },
  { id: 'sci039', comp: 'comp_sci_6', type: 'mc', difficulty: 1, q: 'What is a species?', choices: ['Any group of organisms', 'A group that can interbreed and produce fertile offspring', 'A genus', 'A family'], answer: 'A group that can interbreed and produce fertile offspring', explanation: 'The biological species concept defines species by reproductive compatibility.' },

  // Domain VII: Interdependence and Environmental Systems
  { id: 'sci040', comp: 'comp_sci_7', type: 'mc', difficulty: 1, q: 'What is a producer in an ecosystem?', choices: ['An organism that eats others', 'An organism that makes its own food (e.g., via photosynthesis)', 'A decomposer', 'A consumer only'], answer: 'An organism that makes its own food (e.g., via photosynthesis)', explanation: 'Producers (autotrophs) capture energy and form the base of food chains.' },
  { id: 'sci041', comp: 'comp_sci_7', type: 'mc', difficulty: 2, q: 'What is the role of decomposers?', choices: ['To produce oxygen', 'To break down dead matter and recycle nutrients', 'To prey on herbivores', 'To fix nitrogen only'], answer: 'To break down dead matter and recycle nutrients', explanation: 'Decomposers break down organic matter and return nutrients to the ecosystem.' },
  { id: 'sci042', comp: 'comp_sci_7', type: 'mc', difficulty: 1, q: 'In a food chain, energy flows from:', choices: ['Consumers to producers', 'Producers to consumers', 'Decomposers to producers', 'Top predators only'], answer: 'Producers to consumers', explanation: 'Energy flows from producers (e.g., plants) to consumers.' },
  { id: 'sci043', comp: 'comp_sci_7', type: 'mc', difficulty: 2, q: 'What is the carbon cycle?', choices: ['Only respiration', 'The movement of carbon through living things, the atmosphere, ocean, and Earth', 'Only photosynthesis', 'Only combustion'], answer: 'The movement of carbon through living things, the atmosphere, ocean, and Earth', explanation: 'The carbon cycle describes how carbon moves through biotic and abiotic reservoirs.' },
  { id: 'sci044', comp: 'comp_sci_7', type: 'mc', difficulty: 1, q: 'What is a limiting factor in a population?', choices: ['A factor that has no effect', 'A factor that restricts population growth', 'Always predation', 'Only food'], answer: 'A factor that restricts population growth', explanation: 'Limiting factors (food, space, predators, etc.) limit population size.' },

  // Domain VIII: Earth's History and Structure
  { id: 'sci045', comp: 'comp_sci_8', type: 'mc', difficulty: 1, q: 'What type of rock is formed from cooling magma or lava?', choices: ['Sedimentary', 'Metamorphic', 'Igneous', 'Organic'], answer: 'Igneous', explanation: 'Igneous rocks form from the cooling and solidification of magma or lava.' },
  { id: 'sci046', comp: 'comp_sci_8', type: 'mc', difficulty: 2, q: 'How do scientists estimate the age of fossils?', choices: ['Only by depth', 'Relative dating and radiometric dating', 'Only by appearance', 'By color'], answer: 'Relative dating and radiometric dating', explanation: 'Relative dating (stratigraphy) and radiometric dating provide age estimates.' },
  { id: 'sci047', comp: 'comp_sci_8', type: 'mc', difficulty: 1, q: 'What causes earthquakes?', choices: ['Only volcanoes', 'Release of energy along faults (plate movement)', 'Only weather', 'Ocean currents'], answer: 'Release of energy along faults (plate movement)', explanation: 'Earthquakes result from the sudden release of energy along fault lines.' },
  { id: 'sci048', comp: 'comp_sci_8', type: 'mc', difficulty: 2, q: 'What is the theory of plate tectonics?', choices: ['Earth is flat', 'Earth\'s lithosphere is divided into plates that move', 'Plates do not move', 'Only ocean plates move'], answer: 'Earth\'s lithosphere is divided into plates that move', explanation: 'Plate tectonics describes the movement of lithospheric plates.' },
  { id: 'sci049', comp: 'comp_sci_8', type: 'mc', difficulty: 1, q: 'Which layer of Earth is liquid?', choices: ['Crust', 'Mantle', 'Outer core', 'Inner core'], answer: 'Outer core', explanation: 'The outer core is molten iron and nickel; the inner core is solid.' },

  // Domain IX: Solar System and Universe
  { id: 'sci050', comp: 'comp_sci_9', type: 'mc', difficulty: 1, q: 'What causes the seasons on Earth?', choices: ['Distance from the Sun', 'The tilt of Earth\'s axis', 'Only the Moon', 'Ocean currents'], answer: 'The tilt of Earth\'s axis', explanation: 'The tilt of Earth\'s axis causes different hemispheres to receive different amounts of sunlight through the year.' },
  { id: 'sci051', comp: 'comp_sci_9', type: 'mc', difficulty: 2, q: 'What is a light-year?', choices: ['A unit of time', 'The distance light travels in one year', 'The age of a star', 'A unit of brightness'], answer: 'The distance light travels in one year', explanation: 'A light-year is a unit of distance, not time.' },
  { id: 'sci052', comp: 'comp_sci_9', type: 'mc', difficulty: 1, q: 'Which planet is known as the Red Planet?', choices: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 'Mars', explanation: 'Mars appears red due to iron oxide (rust) on its surface.' },
  { id: 'sci053', comp: 'comp_sci_9', type: 'mc', difficulty: 2, q: 'What is the primary source of the Sun\'s energy?', choices: ['Burning fuel', 'Nuclear fusion of hydrogen', 'Chemical reactions', 'Gravity only'], answer: 'Nuclear fusion of hydrogen', explanation: 'The Sun produces energy by fusing hydrogen into helium in its core.' },
  { id: 'sci054', comp: 'comp_sci_9', type: 'mc', difficulty: 1, q: 'What causes the phases of the Moon?', choices: ['Earth\'s shadow only', 'The relative positions of Earth, Moon, and Sun', 'The Moon moving closer and farther', 'Eclipses only'], answer: 'The relative positions of Earth, Moon, and Sun', explanation: 'Moon phases result from how much of the lit side we see from Earth.' },

  // Domain X: Science Learning, Instruction and Assessment
  { id: 'sci055', comp: 'comp_sci_10', type: 'mc', difficulty: 1, q: 'What is the purpose of a pre-lab safety discussion?', choices: ['To skip the lab', 'To ensure students understand hazards and procedures', 'To replace equipment', 'To grade faster'], answer: 'To ensure students understand hazards and procedures', explanation: 'Pre-lab safety discussions reduce risk and prepare students for the lab.' },
  { id: 'sci056', comp: 'comp_sci_10', type: 'mc', difficulty: 2, q: 'Which strategy best supports inquiry-based learning in science?', choices: ['Only lectures', 'Posing questions, designing investigations, and analyzing data', 'Avoiding experiments', 'Memorizing definitions only'], answer: 'Posing questions, designing investigations, and analyzing data', explanation: 'Inquiry involves asking questions, designing and conducting investigations, and analyzing results.' },
  { id: 'sci057', comp: 'comp_sci_10', type: 'mc', difficulty: 1, q: 'Why is it important to use formative assessment in science class?', choices: ['To replace summative tests', 'To inform instruction and provide feedback during learning', 'To grade only', 'To avoid labs'], answer: 'To inform instruction and provide feedback during learning', explanation: 'Formative assessment helps teachers adjust instruction and students improve.' },
  { id: 'sci058', comp: 'comp_sci_10', type: 'mc', difficulty: 2, q: 'How can a teacher make science accessible to diverse learners?', choices: ['By lowering expectations', 'By using varied representations, scaffolds, and connecting to students\' experiences', 'By avoiding labs', 'By teaching only from the textbook'], answer: 'By using varied representations, scaffolds, and connecting to students\' experiences', explanation: 'Multiple representations and relevance support equity and access.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Life Science 7–12 (238)
// 100 questions, 5 hr. Domains: Scientific Inquiry, Cell, Heredity/Evolution, Diversity, Ecosystems, Instruction
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_LIFE_SCIENCE712 = [
  { id: 'comp_life_1', name: 'Scientific Inquiry and Processes', desc: 'Lab safety, nature of science, inquiry, history of science.', weight: 0.15, games: [] },
  { id: 'comp_life_2', name: 'Cell Structure and Processes', desc: 'Biomolecules, organelles, cellular life processes, development.', weight: 0.20, games: [] },
  { id: 'comp_life_3', name: 'Heredity and Evolution of Life', desc: 'Genetics, heredity, evolution.', weight: 0.20, games: [] },
  { id: 'comp_life_4', name: 'Diversity of Life', desc: 'Classification, diversity, adaptations, kingdoms.', weight: 0.20, games: [] },
  { id: 'comp_life_5', name: 'Interdependence of Life and Environmental Systems', desc: 'Ecology, ecosystems, biogeochemical cycles.', weight: 0.15, games: [] },
  { id: 'comp_life_6', name: 'Science Learning, Instruction and Assessment', desc: 'Pedagogy, how students learn science, assessment.', weight: 0.10, games: [] },
];

export const TEXES_QUESTIONS_LIFE_SCIENCE712 = [
  // Domain I: Scientific Inquiry and Processes
  { id: 'life001', comp: 'comp_life_1', type: 'mc', difficulty: 1, q: 'What is the primary purpose of a control group in an experiment?', choices: ['To speed up the experiment', 'To provide a baseline for comparison', 'To test multiple variables', 'To ensure random results'], answer: 'To provide a baseline for comparison', explanation: 'The control group is used for comparison so the effect of the independent variable can be identified.' },
  { id: 'life002', comp: 'comp_life_1', type: 'mc', difficulty: 2, q: 'Which represents a valid scientific claim?', choices: ['The experiment was successful', 'Increasing temperature increased enzyme activity, supporting the hypothesis', 'Biology is the best science', 'The data looked good'], answer: 'Increasing temperature increased enzyme activity, supporting the hypothesis', explanation: 'A valid scientific claim links evidence to a testable relationship.' },
  { id: 'life003', comp: 'comp_life_1', type: 'mc', difficulty: 1, q: 'Which is a safe practice when working with living organisms in the lab?', choices: ['Releasing organisms into the wild', 'Washing hands after handling organisms and following disposal procedures', 'Keeping specimens at room temperature only', 'Skipping safety guidelines'], answer: 'Washing hands after handling organisms and following disposal procedures', explanation: 'Hand washing and proper disposal reduce risk when working with living organisms.' },
  { id: 'life004', comp: 'comp_life_1', type: 'mc', difficulty: 2, q: 'What does it mean for a theory to be falsifiable?', choices: ['It has been proven false', 'It can be tested and potentially disproven', 'It is based on opinion', 'It has no supporting evidence'], answer: 'It can be tested and potentially disproven', explanation: 'Scientific theories must be falsifiable.' },
  { id: 'life005', comp: 'comp_life_1', type: 'mc', difficulty: 1, q: 'What is the purpose of peer review in science?', choices: ['To grade students', 'To evaluate and validate research before publication', 'To replace experiments', 'To speed up discovery'], answer: 'To evaluate and validate research before publication', explanation: 'Peer review allows other scientists to evaluate methods and conclusions.' },
  { id: 'life006', comp: 'comp_life_1', type: 'mc', difficulty: 2, q: 'Which variable is typically plotted on the x-axis in a growth experiment?', choices: ['Dependent variable', 'Independent variable (e.g., time)', 'Control', 'Constant'], answer: 'Independent variable (e.g., time)', explanation: 'The independent variable is usually plotted on the x-axis.' },
  { id: 'life007', comp: 'comp_life_1', type: 'mc', difficulty: 1, q: 'What is a hypothesis?', choices: ['A proven fact', 'A testable prediction or explanation', 'The conclusion', 'A random guess'], answer: 'A testable prediction or explanation', explanation: 'A hypothesis is a testable statement that can be supported or refuted by evidence.' },
  { id: 'life008', comp: 'comp_life_1', type: 'mc', difficulty: 2, q: 'Why is it important to use multiple trials in an experiment?', choices: ['To finish faster', 'To reduce the effect of random error and increase reliability', 'To use more materials', 'To avoid analysis'], answer: 'To reduce the effect of random error and increase reliability', explanation: 'Multiple trials help identify consistent results and reduce chance effects.' },

  // Domain II: Cell Structure and Processes
  { id: 'life009', comp: 'comp_life_2', type: 'mc', difficulty: 1, q: 'Where does cellular respiration primarily occur in eukaryotic cells?', choices: ['Nucleus', 'Ribosomes', 'Mitochondria', 'Golgi apparatus'], answer: 'Mitochondria', explanation: 'Cellular respiration (ATP production) occurs mainly in the mitochondria.' },
  { id: 'life010', comp: 'comp_life_2', type: 'mc', difficulty: 2, q: 'What is the function of the cell membrane?', choices: ['Only to provide shape', 'To control what enters and leaves the cell', 'To make proteins only', 'To store DNA'], answer: 'To control what enters and leaves the cell', explanation: 'The cell membrane is selectively permeable and regulates passage of materials.' },
  { id: 'life011', comp: 'comp_life_2', type: 'mc', difficulty: 1, q: 'Which organelle is the site of protein synthesis?', choices: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Chloroplast'], answer: 'Ribosome', explanation: 'Ribosomes assemble proteins from amino acids using mRNA.' },
  { id: 'life012', comp: 'comp_life_2', type: 'mc', difficulty: 2, q: 'What is the main product of photosynthesis?', choices: ['Oxygen and glucose', 'Only carbon dioxide', 'Only water', 'ATP only'], answer: 'Oxygen and glucose', explanation: 'Photosynthesis produces glucose and releases oxygen as a byproduct.' },
  { id: 'life013', comp: 'comp_life_2', type: 'mc', difficulty: 1, q: 'Which biomolecule is the primary source of energy for cells?', choices: ['Protein', 'Nucleic acid', 'Carbohydrate', 'Lipid'], answer: 'Carbohydrate', explanation: 'Carbohydrates (e.g., glucose) are a primary energy source; they are broken down in cellular respiration.' },
  { id: 'life014', comp: 'comp_life_2', type: 'mc', difficulty: 2, q: 'What is the role of ATP in the cell?', choices: ['To store genetic information', 'To provide energy for cellular processes', 'To build cell walls', 'To transport oxygen'], answer: 'To provide energy for cellular processes', explanation: 'ATP is the main energy currency of the cell.' },
  { id: 'life015', comp: 'comp_life_2', type: 'mc', difficulty: 1, q: 'Which process occurs in the nucleus?', choices: ['Cellular respiration', 'DNA replication and transcription', 'Protein folding', 'Glycolysis'], answer: 'DNA replication and transcription', explanation: 'DNA replication and transcription of DNA to RNA occur in the nucleus.' },
  { id: 'life016', comp: 'comp_life_2', type: 'mc', difficulty: 2, q: 'What is mitosis?', choices: ['Cell death', 'Division of a cell that produces two genetically identical daughter cells', 'Fertilization', 'Protein synthesis'], answer: 'Division of a cell that produces two genetically identical daughter cells', explanation: 'Mitosis produces two diploid daughter cells with identical DNA.' },
  { id: 'life017', comp: 'comp_life_2', type: 'mc', difficulty: 1, q: 'Which structure is found in plant cells but not in animal cells?', choices: ['Mitochondria', 'Cell membrane', 'Chloroplast', 'Ribosome'], answer: 'Chloroplast', explanation: 'Chloroplasts (for photosynthesis) are in plant cells, not typical animal cells.' },
  { id: 'life018', comp: 'comp_life_2', type: 'mc', difficulty: 2, q: 'What is the function of enzymes?', choices: ['To store energy', 'To speed up chemical reactions (catalysts)', 'To carry genetic information', 'To provide structure only'], answer: 'To speed up chemical reactions (catalysts)', explanation: 'Enzymes are biological catalysts that lower activation energy.' },

  // Domain III: Heredity and Evolution
  { id: 'life019', comp: 'comp_life_3', type: 'mc', difficulty: 1, q: 'What is an allele?', choices: ['A type of cell', 'A variant form of a gene', 'A chromosome', 'A trait'], answer: 'A variant form of a gene', explanation: 'Alleles are different versions of the same gene.' },
  { id: 'life020', comp: 'comp_life_3', type: 'mc', difficulty: 2, q: 'A homozygous dominant parent and a homozygous recessive parent have offspring. What is the genotype of the F1 generation?', choices: ['All heterozygous', '1:2:1 ratio', 'All dominant', '3:1 dominant to recessive'], answer: 'All heterozygous', explanation: 'Cross AA × aa gives all Aa (heterozygous).' },
  { id: 'life021', comp: 'comp_life_3', type: 'mc', difficulty: 1, q: 'What is natural selection?', choices: ['Random change in genes', 'Process by which organisms better adapted to the environment tend to survive and reproduce', 'Choice by humans', 'Acquired traits passed on'], answer: 'Process by which organisms better adapted to the environment tend to survive and reproduce', explanation: 'Natural selection is the mechanism of evolutionary change.' },
  { id: 'life022', comp: 'comp_life_3', type: 'mc', difficulty: 2, q: 'What does the fossil record provide evidence for?', choices: ['Only current species', 'Change in life over time and common ancestry', 'That species do not change', 'Only dinosaurs'], answer: 'Change in life over time and common ancestry', explanation: 'The fossil record shows change over time and supports evolution.' },
  { id: 'life023', comp: 'comp_life_3', type: 'mc', difficulty: 1, q: 'Where are genes located?', choices: ['Only in the cytoplasm', 'On chromosomes (DNA)', 'Only in ribosomes', 'In the cell membrane'], answer: 'On chromosomes (DNA)', explanation: 'Genes are segments of DNA on chromosomes.' },
  { id: 'life024', comp: 'comp_life_3', type: 'mc', difficulty: 2, q: 'What is a mutation?', choices: ['Always harmful', 'A change in the DNA sequence', 'Only in somatic cells', 'Never passed to offspring'], answer: 'A change in the DNA sequence', explanation: 'A mutation is a change in the nucleotide sequence of DNA.' },
  { id: 'life025', comp: 'comp_life_3', type: 'mc', difficulty: 1, q: 'What is meiosis?', choices: ['Cell division that produces identical cells', 'Cell division that produces gametes with half the chromosome number', 'Protein synthesis', 'Respiration'], answer: 'Cell division that produces gametes with half the chromosome number', explanation: 'Meiosis produces haploid gametes (e.g., sperm, egg).' },
  { id: 'life026', comp: 'comp_life_3', type: 'mc', difficulty: 2, q: 'Which provides evidence for evolution?', choices: ['Only fossils', 'Fossils, comparative anatomy, molecular biology, and biogeography', 'Only behavior', 'Only size'], answer: 'Fossils, comparative anatomy, molecular biology, and biogeography', explanation: 'Multiple lines of evidence support the theory of evolution.' },
  { id: 'life027', comp: 'comp_life_3', type: 'mc', difficulty: 1, q: 'What is the genotype of an individual who has two different alleles for a gene?', choices: ['Homozygous', 'Heterozygous', 'Dominant only', 'Recessive only'], answer: 'Heterozygous', explanation: 'Heterozygous means two different alleles (e.g., Aa).' },
  { id: 'life028', comp: 'comp_life_3', type: 'mc', difficulty: 2, q: 'What is genetic drift?', choices: ['Selection by humans', 'Random change in allele frequencies in small populations', 'Only mutation', 'Migration only'], answer: 'Random change in allele frequencies in small populations', explanation: 'Genetic drift is the random change in allele frequency, especially in small populations.' },

  // Domain IV: Diversity of Life
  { id: 'life029', comp: 'comp_life_4', type: 'mc', difficulty: 1, q: 'What is the broadest taxonomic category in modern classification?', choices: ['Species', 'Genus', 'Kingdom', 'Domain'], answer: 'Domain', explanation: 'Domain is the highest level (e.g., Bacteria, Archaea, Eukarya).' },
  { id: 'life030', comp: 'comp_life_4', type: 'mc', difficulty: 2, q: 'Which characteristic distinguishes prokaryotes from eukaryotes?', choices: ['Prokaryotes are always larger', 'Eukaryotes have a membrane-bound nucleus; prokaryotes do not', 'Prokaryotes have mitochondria', 'Eukaryotes have no DNA'], answer: 'Eukaryotes have a membrane-bound nucleus; prokaryotes do not', explanation: 'The presence of a nucleus is a key structural difference.' },
  { id: 'life031', comp: 'comp_life_4', type: 'mc', difficulty: 1, q: 'What is an adaptation?', choices: ['A learned behavior only', 'A trait that increases fitness in an environment', 'A mutation that is always harmful', 'A random event'], answer: 'A trait that increases fitness in an environment', explanation: 'Adaptations are heritable traits that improve survival and reproduction.' },
  { id: 'life032', comp: 'comp_life_4', type: 'mc', difficulty: 2, q: 'Which group includes organisms that can perform photosynthesis?', choices: ['Only plants', 'Plants, some protists, and some bacteria', 'Only bacteria', 'Only algae'], answer: 'Plants, some protists, and some bacteria', explanation: 'Photosynthesis occurs in plants, many protists (e.g., algae), and some bacteria.' },
  { id: 'life033', comp: 'comp_life_4', type: 'mc', difficulty: 1, q: 'What is a species?', choices: ['Any group of organisms', 'A group that can interbreed and produce fertile offspring', 'A genus', 'A family'], answer: 'A group that can interbreed and produce fertile offspring', explanation: 'The biological species concept defines species by reproductive compatibility.' },
  { id: 'life034', comp: 'comp_life_4', type: 'mc', difficulty: 2, q: 'Which kingdom includes multicellular organisms that absorb nutrients from decaying matter?', choices: ['Plantae', 'Animalia', 'Fungi', 'Protista'], answer: 'Fungi', explanation: 'Fungi are heterotrophs that often absorb nutrients from dead or decaying matter.' },
  { id: 'life035', comp: 'comp_life_4', type: 'mc', difficulty: 1, q: 'What is the role of the vascular system in plants?', choices: ['Only photosynthesis', 'Transport of water, minerals, and nutrients', 'Only support', 'Only reproduction'], answer: 'Transport of water, minerals, and nutrients', explanation: 'Vascular tissue (xylem, phloem) transports materials through the plant.' },
  { id: 'life036', comp: 'comp_life_4', type: 'mc', difficulty: 2, q: 'Which is a characteristic of arthropods?', choices: ['Only six legs', 'Exoskeleton and jointed appendages', 'Only aquatic', 'No segmentation'], answer: 'Exoskeleton and jointed appendages', explanation: 'Arthropods have an exoskeleton and jointed appendages (e.g., insects, crustaceans).' },
  { id: 'life037', comp: 'comp_life_4', type: 'mc', difficulty: 1, q: 'Which group of organisms has no cell nucleus?', choices: ['Fungi', 'Protists', 'Bacteria', 'Plants'], answer: 'Bacteria', explanation: 'Bacteria are prokaryotes and lack a membrane-bound nucleus.' },
  { id: 'life038', comp: 'comp_life_4', type: 'mc', difficulty: 2, q: 'What is the main function of roots in plants?', choices: ['Only photosynthesis', 'Anchorage and absorption of water and minerals', 'Only reproduction', 'Only storage'], answer: 'Anchorage and absorption of water and minerals', explanation: 'Roots anchor the plant and absorb water and minerals from the soil.' },

  // Domain V: Interdependence and Environmental Systems
  { id: 'life039', comp: 'comp_life_5', type: 'mc', difficulty: 1, q: 'What is a producer in an ecosystem?', choices: ['An organism that eats others', 'An organism that makes its own food (e.g., via photosynthesis)', 'A decomposer', 'A consumer only'], answer: 'An organism that makes its own food (e.g., via photosynthesis)', explanation: 'Producers (autotrophs) form the base of food chains.' },
  { id: 'life040', comp: 'comp_life_5', type: 'mc', difficulty: 2, q: 'What is the role of decomposers?', choices: ['To produce oxygen', 'To break down dead matter and recycle nutrients', 'To prey on herbivores', 'To fix nitrogen only'], answer: 'To break down dead matter and recycle nutrients', explanation: 'Decomposers break down organic matter and return nutrients to the ecosystem.' },
  { id: 'life041', comp: 'comp_life_5', type: 'mc', difficulty: 1, q: 'In a food chain, energy flows from:', choices: ['Consumers to producers', 'Producers to consumers', 'Decomposers to producers', 'Top predators only'], answer: 'Producers to consumers', explanation: 'Energy flows from producers (e.g., plants) to consumers.' },
  { id: 'life042', comp: 'comp_life_5', type: 'mc', difficulty: 2, q: 'What is the carbon cycle?', choices: ['Only respiration', 'The movement of carbon through living things, the atmosphere, ocean, and Earth', 'Only photosynthesis', 'Only combustion'], answer: 'The movement of carbon through living things, the atmosphere, ocean, and Earth', explanation: 'The carbon cycle describes how carbon moves through biotic and abiotic reservoirs.' },
  { id: 'life043', comp: 'comp_life_5', type: 'mc', difficulty: 1, q: 'What is a limiting factor in a population?', choices: ['A factor that has no effect', 'A factor that restricts population growth', 'Always predation', 'Only food'], answer: 'A factor that restricts population growth', explanation: 'Limiting factors (food, space, predators, etc.) limit population size.' },
  { id: 'life044', comp: 'comp_life_5', type: 'mc', difficulty: 2, q: 'What is carrying capacity?', choices: ['The maximum population size an environment can sustain', 'The minimum population', 'The birth rate only', 'The death rate only'], answer: 'The maximum population size an environment can sustain', explanation: 'Carrying capacity is the maximum population that resources can support.' },
  { id: 'life045', comp: 'comp_life_5', type: 'mc', difficulty: 1, q: 'What is a niche?', choices: ['Only where an organism lives', 'The role an organism plays in its ecosystem (including habitat and interactions)', 'Only what it eats', 'Only its predators'], answer: 'The role an organism plays in its ecosystem (including habitat and interactions)', explanation: 'A niche includes an organism\'s role, habitat, and interactions.' },
  { id: 'life046', comp: 'comp_life_5', type: 'mc', difficulty: 2, q: 'Which relationship benefits one species and harms the other?', choices: ['Mutualism', 'Commensalism', 'Parasitism', 'Competition'], answer: 'Parasitism', explanation: 'In parasitism, the parasite benefits and the host is harmed.' },
  { id: 'life047', comp: 'comp_life_5', type: 'mc', difficulty: 1, q: 'What is biodiversity?', choices: ['Only the number of species', 'The variety of life at all levels (genes, species, ecosystems)', 'Only plants', 'Only animals'], answer: 'The variety of life at all levels (genes, species, ecosystems)', explanation: 'Biodiversity includes genetic, species, and ecosystem diversity.' },

  // Domain VI: Science Learning, Instruction and Assessment
  { id: 'life048', comp: 'comp_life_6', type: 'mc', difficulty: 1, q: 'What is the purpose of a pre-lab safety discussion?', choices: ['To skip the lab', 'To ensure students understand hazards and procedures', 'To replace equipment', 'To grade faster'], answer: 'To ensure students understand hazards and procedures', explanation: 'Pre-lab safety discussions reduce risk.' },
  { id: 'life049', comp: 'comp_life_6', type: 'mc', difficulty: 2, q: 'Which strategy best supports inquiry-based learning in life science?', choices: ['Only lectures', 'Posing questions, designing investigations (e.g., with organisms), and analyzing data', 'Avoiding experiments', 'Memorizing definitions only'], answer: 'Posing questions, designing investigations (e.g., with organisms), and analyzing data', explanation: 'Inquiry involves asking questions, designing and conducting investigations, and analyzing results.' },
  { id: 'life050', comp: 'comp_life_6', type: 'mc', difficulty: 1, q: 'Why is it important to use formative assessment in science class?', choices: ['To replace summative tests', 'To inform instruction and provide feedback during learning', 'To grade only', 'To avoid labs'], answer: 'To inform instruction and provide feedback during learning', explanation: 'Formative assessment helps teachers adjust instruction and students improve.' },
  { id: 'life051', comp: 'comp_life_6', type: 'mc', difficulty: 2, q: 'How can a teacher address common misconceptions about evolution or genetics?', choices: ['By ignoring them', 'By eliciting prior ideas and using evidence-based activities to build accurate concepts', 'By avoiding the topic', 'By testing only'], answer: 'By eliciting prior ideas and using evidence-based activities to build accurate concepts', explanation: 'Addressing misconceptions requires uncovering ideas and building on evidence.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Physics/Mathematics 6–12 (243)
// 120 questions, ~4 hr 45 min. Domains: Number, Algebra, Geometry, Stats, Math Processes, Math Instruction, Scientific Inquiry, Physics, Science Instruction
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_PHYSICS_MATH_612 = [
  { id: 'comp_physmath_1', name: 'Number Concepts', desc: 'Number systems, operations, number theory.', weight: 0.07, games: [] },
  { id: 'comp_physmath_2', name: 'Patterns and Algebra', desc: 'Patterns, functions, algebraic reasoning.', weight: 0.16, games: [] },
  { id: 'comp_physmath_3', name: 'Geometry and Measurement', desc: 'Geometric properties, spatial reasoning, measurement.', weight: 0.10, games: [] },
  { id: 'comp_physmath_4', name: 'Probability and Statistics', desc: 'Probability, statistics, data analysis.', weight: 0.07, games: [] },
  { id: 'comp_physmath_5', name: 'Mathematical Processes and Perspectives', desc: 'Reasoning, problem solving, connections.', weight: 0.05, games: [] },
  { id: 'comp_physmath_6', name: 'Mathematical Learning, Instruction and Assessment', desc: 'Pedagogy, assessment, equity.', weight: 0.05, games: [] },
  { id: 'comp_physmath_7', name: 'Scientific Inquiry and Processes', desc: 'Nature of science, lab safety, data analysis.', weight: 0.07, games: [] },
  { id: 'comp_physmath_8', name: 'Physics', desc: 'Mechanics, E&M, waves, thermodynamics.', weight: 0.39, games: [] },
  { id: 'comp_physmath_9', name: 'Science Learning, Instruction and Assessment', desc: 'Pedagogy, safety, equity.', weight: 0.04, games: [] },
];

export const TEXES_QUESTIONS_PHYSICS_MATH_612 = [
  // Domain I: Number Concepts
  { id: 'pm001', comp: 'comp_physmath_1', type: 'mc', difficulty: 1, q: 'Which of the following is an irrational number?', choices: ['√(9)', 'π', '0.75', '-2/3'], answer: 'π', explanation: 'π is irrational — it cannot be expressed as a ratio of two integers.' },
  { id: 'pm002', comp: 'comp_physmath_1', type: 'mc', difficulty: 1, q: 'What is the least common multiple of 8 and 12?', choices: ['4', '24', '48', '96'], answer: '24', explanation: 'LCM(8, 12) = 24.' },
  { id: 'pm003', comp: 'comp_physmath_1', type: 'mc', difficulty: 2, q: 'What is 7^(-2) in simplest form?', choices: ['−49', '1/49', '−1/49', '49'], answer: '1/49', explanation: 'a^(-n) = 1/a^n. So 7^(-2) = 1/49.' },
  { id: 'pm004', comp: 'comp_physmath_1', type: 'mc', difficulty: 2, q: 'Simplify: √(50) − √(18)', choices: ['√(32)', '2√(2)', '4√(2)', '8√(2)'], answer: '2√(2)', explanation: '√(50) = 5√(2), √(18) = 3√(2). So 5√(2) − 3√(2) = 2√(2).' },
  { id: 'pm005', comp: 'comp_physmath_1', type: 'mc', difficulty: 1, q: 'Express 3/8 as a decimal.', choices: ['0.375', '0.38', '0.83', '2.67'], answer: '0.375', explanation: '3 ÷ 8 = 0.375.' },
  { id: 'pm006', comp: 'comp_physmath_1', type: 'mc', difficulty: 2, q: 'Which best describes the set of numbers that satisfy |x − 3| < 5?', choices: ['x < 8', '−2 < x < 8', 'x > −2', 'x < −2 or x > 8'], answer: '−2 < x < 8', explanation: '|x − 3| < 5 means −5 < x − 3 < 5, so −2 < x < 8.' },

  // Domain II: Patterns and Algebra
  { id: 'pm007', comp: 'comp_physmath_2', type: 'mc', difficulty: 1, q: 'What is the slope of the line passing through (2, 5) and (4, 11)?', choices: ['2', '3', '4', '6'], answer: '3', explanation: 'Slope = (11 − 5)/(4 − 2) = 3.' },
  { id: 'pm008', comp: 'comp_physmath_2', type: 'mc', difficulty: 1, q: 'Solve for x: 3x + 7 = 22', choices: ['x = 5', 'x = 15/3', 'x = 29/3', 'x = 6'], answer: 'x = 5', explanation: '3x = 15, so x = 5.' },
  { id: 'pm009', comp: 'comp_physmath_2', type: 'mc', difficulty: 2, q: 'Which function has a vertex at (2, −3)?', choices: ['f(x) = (x − 2)² − 3', 'f(x) = (x + 2)² − 3', 'f(x) = (x − 2)² + 3', 'f(x) = x² − 3'], answer: 'f(x) = (x − 2)² − 3', explanation: 'Vertex form f(x) = a(x − h)² + k has vertex (h, k).' },
  { id: 'pm010', comp: 'comp_physmath_2', type: 'mc', difficulty: 2, q: 'The first four terms of a sequence are 3, 7, 11, 15. What is the 10th term?', choices: ['39', '40', '43', '47'], answer: '39', explanation: 'Arithmetic: aₙ = a₁ + (n − 1) · d = 3 + (n − 1)(4). a₁₀ = 39.' },
  { id: 'pm011', comp: 'comp_physmath_2', type: 'mc', difficulty: 2, q: 'Solve the system: 2x + y = 10 and x − y = 2.', choices: ['x = 4, y = 2', 'x = 3, y = 4', 'x = 4, y = 6', 'x = 2, y = 6'], answer: 'x = 4, y = 2', explanation: 'Adding equations: 3x = 12, x = 4. Then y = 2.' },
  { id: 'pm012', comp: 'comp_physmath_2', type: 'mc', difficulty: 2, q: 'Factor completely: x² − 5x − 6', choices: ['(x − 6)(x + 1)', '(x − 3)(x − 2)', '(x + 6)(x − 1)', '(x − 2)(x + 3)'], answer: '(x − 6)(x + 1)', explanation: 'x² − 5x − 6 = (x − 6)(x + 1).' },
  { id: 'pm013', comp: 'comp_physmath_2', type: 'mc', difficulty: 2, q: 'If f(x) = 2x + 1 and g(x) = x², what is (f ∘ g)(3)?', choices: ['19', '21', '49', '7'], answer: '19', explanation: '(f ∘ g)(3) = f(g(3)) = f(9) = 19.' },
  { id: 'pm014', comp: 'comp_physmath_2', type: 'mc', difficulty: 2, q: 'What is the range of f(x) = −x² + 4?', choices: ['[4, ∞)', '(−∞, 4]', '[0, 4]', '(−∞, ∞)'], answer: '(−∞, 4]', explanation: 'Parabola opens down; maximum is 4, so range is y ≤ 4.' },
  { id: 'pm015', comp: 'comp_physmath_2', type: 'mc', difficulty: 1, q: 'Which expression is equivalent to 2^(3x) · 2^(2x)?', choices: ['2^(5x)', '2^(6x)', '4^(5x)', '2^(5x²)'], answer: '2^(5x)', explanation: 'Add exponents: 2^(3x) · 2^(2x) = 2^(5x).' },

  // Domain III: Geometry and Measurement
  { id: 'pm016', comp: 'comp_physmath_3', type: 'mc', difficulty: 1, q: 'The interior angles of a regular hexagon each measure:', choices: ['90°', '120°', '135°', '180°'], answer: '120°', explanation: 'Sum = (n−2)×180° = 720°; each = 720°/6 = 120°.' },
  { id: 'pm017', comp: 'comp_physmath_3', type: 'mc', difficulty: 1, q: 'What is the volume of a cylinder with radius 3 and height 8? (V = πr²h)', choices: ['24π', '72π', '96π', '216π'], answer: '72π', explanation: 'V = π(3)²(8) = 72π.' },
  { id: 'pm018', comp: 'comp_physmath_3', type: 'mc', difficulty: 2, q: 'Two similar triangles have scale factor 3. If the smaller has area 12, what is the larger area?', choices: ['36', '48', '108', '144'], answer: '108', explanation: 'Area scales by the square of the scale factor. 12 × 9 = 108.' },
  { id: 'pm019', comp: 'comp_physmath_3', type: 'mc', difficulty: 2, q: 'A right triangle has legs 5 and 12. What is the length of the hypotenuse?', choices: ['13', '17', '√(119)', '7'], answer: '13', explanation: 'a² + b² = c². 25 + 144 = 169, so c = 13.' },
  { id: 'pm020', comp: 'comp_physmath_3', type: 'mc', difficulty: 2, q: 'Which transformation maps (x, y) to (−x, y)?', choices: ['Reflection over x-axis', 'Reflection over y-axis', 'Rotation 90°', 'Translation'], answer: 'Reflection over y-axis', explanation: 'Reflecting over the y-axis negates the x-coordinate.' },
  { id: 'pm021', comp: 'comp_physmath_3', type: 'mc', difficulty: 1, q: 'A circle has circumference 10π. What is its area?', choices: ['25π', '10π', '5π', '100π'], answer: '25π', explanation: 'C = 2πr = 10π, so r = 5. A = πr² = 25π.' },

  // Domain IV: Probability and Statistics
  { id: 'pm022', comp: 'comp_physmath_4', type: 'mc', difficulty: 1, q: 'A fair die is rolled. What is P(rolling a 4 or 5)?', choices: ['1/6', '1/3', '1/2', '2/3'], answer: '1/3', explanation: 'P(4 or 5) = 2/6 = 1/3.' },
  { id: 'pm023', comp: 'comp_physmath_4', type: 'mc', difficulty: 2, q: 'Data: 3, 7, 7, 9, 12. What is the mean?', choices: ['7', '7.6', '8', '9'], answer: '7.6', explanation: 'Mean = 38/5 = 7.6.' },
  { id: 'pm024', comp: 'comp_physmath_4', type: 'mc', difficulty: 2, q: 'Which measure is most affected by outliers?', choices: ['Median', 'Mode', 'Mean', 'Range'], answer: 'Mean', explanation: 'The mean uses every value, so outliers can pull it greatly.' },
  { id: 'pm025', comp: 'comp_physmath_4', type: 'mc', difficulty: 2, q: 'A normal distribution has mean 50 and standard deviation 10. Approximately what percent of data falls between 40 and 60?', choices: ['34%', '68%', '95%', '99.7%'], answer: '68%', explanation: 'Within one standard deviation: about 68% (empirical rule).' },

  // Domain V: Mathematical Processes and Perspectives
  { id: 'pm026', comp: 'comp_physmath_5', type: 'mc', difficulty: 2, q: 'A student solves 2x + 5 = 11 by first writing 2x = 6. Which property justifies this step?', choices: ['Distributive', 'Subtraction property of equality', 'Addition property of equality', 'Symmetric'], answer: 'Subtraction property of equality', explanation: 'Subtracting 5 from both sides uses the subtraction property of equality.' },
  { id: 'pm027', comp: 'comp_physmath_5', type: 'mc', difficulty: 2, q: 'Which best describes mathematical modeling?', choices: ['Memorizing formulas', 'Using real-world contexts to formulate and solve problems', 'Only solving textbook problems', 'Using a calculator'], answer: 'Using real-world contexts to formulate and solve problems', explanation: 'Modeling involves translating real-world situations into mathematics.' },
  { id: 'pm028', comp: 'comp_physmath_5', type: 'mc', difficulty: 1, q: 'What does "productive struggle" promote in math class?', choices: ['Immediate answers', 'Frustration with no support', 'Sense-making and persistence', 'Avoiding difficult problems'], answer: 'Sense-making and persistence', explanation: 'Productive struggle builds perseverance and deep understanding.' },

  // Domain VI: Mathematical Learning, Instruction and Assessment
  { id: 'pm029', comp: 'comp_physmath_6', type: 'mc', difficulty: 1, q: 'Which strategy helps students understand why the area of a triangle is ½bh?', choices: ['Rote memorization only', 'Showing that two congruent triangles form a parallelogram', 'Using only the formula', 'Skipping the derivation'], answer: 'Showing that two congruent triangles form a parallelogram', explanation: 'Two congruent triangles form a parallelogram with area bh; one triangle has ½bh.' },
  { id: 'pm030', comp: 'comp_physmath_6', type: 'mc', difficulty: 2, q: 'Why is it important to use multiple representations (graphs, tables, equations) in math instruction?', choices: ['To lengthen lessons', 'To support different learning styles and deepen conceptual understanding', 'To avoid algebra', 'To replace verbal explanation'], answer: 'To support different learning styles and deepen conceptual understanding', explanation: 'Multiple representations help students connect ideas and access content.' },

  // Domain VII: Scientific Inquiry and Processes
  { id: 'pm031', comp: 'comp_physmath_7', type: 'mc', difficulty: 1, q: 'Which step of the scientific method follows forming a hypothesis?', choices: ['Designing an experiment', 'Making observations', 'Drawing conclusions', 'Communicating results'], answer: 'Designing an experiment', explanation: 'After forming a hypothesis, scientists design experiments to test it.' },
  { id: 'pm032', comp: 'comp_physmath_7', type: 'mc', difficulty: 1, q: 'What is the primary purpose of a control group?', choices: ['To speed up the experiment', 'To provide a baseline for comparison', 'To test multiple variables', 'To ensure random results'], answer: 'To provide a baseline for comparison', explanation: 'The control group is used for comparison.' },
  { id: 'pm033', comp: 'comp_physmath_7', type: 'mc', difficulty: 2, q: 'What type of graph is best for showing the relationship between two continuous variables?', choices: ['Bar graph', 'Pie chart', 'Line graph', 'Histogram'], answer: 'Line graph', explanation: 'Line graphs show how one variable changes with another.' },
  { id: 'pm034', comp: 'comp_physmath_7', type: 'mc', difficulty: 1, q: 'What is the SI unit of mass?', choices: ['Pound', 'Gram', 'Kilogram', 'Newton'], answer: 'Kilogram', explanation: 'The SI base unit of mass is the kilogram (kg).' },

  // Domain VIII: Physics
  { id: 'pm035', comp: 'comp_physmath_8', type: 'mc', difficulty: 1, q: 'An object moves at constant velocity. What is the net force on it?', choices: ['Zero', 'Equal to its weight', 'Increasing', 'Equal to its mass'], answer: 'Zero', explanation: 'Newton\'s first law: constant velocity means zero acceleration.' },
  { id: 'pm036', comp: 'comp_physmath_8', type: 'mc', difficulty: 1, q: 'What is the acceleration of a 5 kg object when a 10 N force is applied?', choices: ['0.5 m/s²', '2 m/s²', '50 m/s²', '2 N'], answer: '2 m/s²', explanation: 'F = ma → a = F/m = 10/5 = 2 m/s².' },
  { id: 'pm037', comp: 'comp_physmath_8', type: 'mc', difficulty: 2, q: 'A ball is thrown upward. At the top of its path, what is its velocity and acceleration?', choices: ['v = 0, a = 0', 'v = 0, a = 9.8 m/s² downward', 'v = 9.8 m/s up, a = 0', 'v = 9.8 m/s down, a = 9.8 m/s² down'], answer: 'v = 0, a = 9.8 m/s² downward', explanation: 'At the peak, velocity is zero; acceleration is still g downward.' },
  { id: 'pm038', comp: 'comp_physmath_8', type: 'mc', difficulty: 1, q: 'What is the kinetic energy of a 4 kg object moving at 3 m/s?', choices: ['6 J', '12 J', '18 J', '36 J'], answer: '18 J', explanation: 'KE = ½mv² = ½(4)(9) = 18 J.' },
  { id: 'pm039', comp: 'comp_physmath_8', type: 'mc', difficulty: 2, q: 'A 2 kg block is lifted 5 m at constant speed. How much work is done by the lifter? (g = 10 m/s²)', choices: ['10 J', '50 J', '100 J', '20 J'], answer: '100 J', explanation: 'W = Fd = mgd = (2)(10)(5) = 100 J.' },
  { id: 'pm040', comp: 'comp_physmath_8', type: 'mc', difficulty: 1, q: 'What is the unit of electric current?', choices: ['Volt', 'Ampere', 'Ohm', 'Coulomb'], answer: 'Ampere', explanation: 'The SI unit of electric current is the ampere (A).' },
  { id: 'pm041', comp: 'comp_physmath_8', type: 'mc', difficulty: 2, q: 'A wave has frequency 5 Hz and wavelength 2 m. What is its speed?', choices: ['2.5 m/s', '7 m/s', '10 m/s', '0.4 m/s'], answer: '10 m/s', explanation: 'v = fλ = (5)(2) = 10 m/s.' },
  { id: 'pm042', comp: 'comp_physmath_8', type: 'mc', difficulty: 1, q: 'Sound travels fastest in:', choices: ['Air', 'Water', 'Steel', 'Vacuum'], answer: 'Steel', explanation: 'Sound is a mechanical wave; it travels fastest in solids.' },
  { id: 'pm043', comp: 'comp_physmath_8', type: 'mc', difficulty: 2, q: 'The first law of thermodynamics states that:', choices: ['Energy cannot be created or destroyed', 'Entropy always increases', 'Heat flows from cold to hot', 'Absolute zero is unattainable'], answer: 'Energy cannot be created or destroyed', explanation: 'The first law is conservation of energy.' },
  { id: 'pm044', comp: 'comp_physmath_8', type: 'mc', difficulty: 1, q: 'What type of wave is light?', choices: ['Longitudinal only', 'Transverse only', 'Both', 'Neither'], answer: 'Transverse only', explanation: 'Light is an electromagnetic wave; E and B oscillate perpendicular to propagation.' },
  { id: 'pm045', comp: 'comp_physmath_8', type: 'mc', difficulty: 2, q: 'A resistor has 6 V across it and 2 A through it. What is its resistance?', choices: ['3 Ω', '12 Ω', '8 Ω', '1/3 Ω'], answer: '3 Ω', explanation: 'V = IR → R = V/I = 6/2 = 3 Ω.' },
  { id: 'pm046', comp: 'comp_physmath_8', type: 'mc', difficulty: 1, q: 'Which quantity is conserved in an elastic collision?', choices: ['Only momentum', 'Only kinetic energy', 'Both momentum and kinetic energy', 'Neither'], answer: 'Both momentum and kinetic energy', explanation: 'In an elastic collision, both are conserved.' },
  { id: 'pm047', comp: 'comp_physmath_8', type: 'mc', difficulty: 2, q: 'According to Newton\'s third law, if you push a wall, the wall pushes you with:', choices: ['Less force', 'More force', 'Equal force in the opposite direction', 'No force'], answer: 'Equal force in the opposite direction', explanation: 'Newton\'s third law: equal and opposite reaction.' },
  { id: 'pm048', comp: 'comp_physmath_8', type: 'mc', difficulty: 1, q: 'What is power defined as?', choices: ['Force × distance', 'Work ÷ time', 'Mass × velocity', 'Energy × time'], answer: 'Work ÷ time', explanation: 'Power P = W/t, the rate at which work is done.' },
  { id: 'pm049', comp: 'comp_physmath_8', type: 'mc', difficulty: 2, q: 'A 3 Ω and a 6 Ω resistor are in parallel. What is their equivalent resistance?', choices: ['2 Ω', '9 Ω', '18 Ω', '0.5 Ω'], answer: '2 Ω', explanation: '1/R_eq = 1/3 + 1/6 = 1/2, so R_eq = 2 Ω.' },
  { id: 'pm050', comp: 'comp_physmath_8', type: 'mc', difficulty: 1, q: 'What is the gravitational potential energy of a 2 kg book 3 m above the ground? (g = 10 m/s²)', choices: ['6 J', '60 J', '5 J', '20 J'], answer: '60 J', explanation: 'PE = mgh = (2)(10)(3) = 60 J.' },

  // Domain IX: Science Learning, Instruction and Assessment
  { id: 'pm051', comp: 'comp_physmath_9', type: 'mc', difficulty: 1, q: 'What is the purpose of a pre-lab safety discussion?', choices: ['To skip the lab', 'To ensure students understand hazards and procedures', 'To replace equipment', 'To grade faster'], answer: 'To ensure students understand hazards and procedures', explanation: 'Pre-lab safety discussions reduce risk.' },
  { id: 'pm052', comp: 'comp_physmath_9', type: 'mc', difficulty: 2, q: 'Which strategy best supports inquiry-based learning in physics?', choices: ['Only lectures', 'Posing questions, designing investigations, and analyzing data', 'Avoiding experiments', 'Memorizing formulas only'], answer: 'Posing questions, designing investigations, and analyzing data', explanation: 'Inquiry involves questions, investigations, and analysis.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Social Studies 7–12 (232)
// 140 questions, ~4 hr 45 min. Domains: World History, U.S. History, Texas History, Geography/Culture, Government, Economics/STS, Foundations/Instruction
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_SOCIAL_STUDIES712 = [
  { id: 'comp_ss_1', name: 'World History', desc: 'Ancient civilizations, world history 600–present.', weight: 0.15, games: [] },
  { id: 'comp_ss_2', name: 'U.S. History', desc: 'U.S. history from founding to present.', weight: 0.20, games: [] },
  { id: 'comp_ss_3', name: 'Texas History', desc: 'Texas history, geography, and culture.', weight: 0.13, games: [] },
  { id: 'comp_ss_4', name: 'Geography, Culture and Behavioral/Social Sciences', desc: 'Geography, culture, sociology, psychology.', weight: 0.13, games: [] },
  { id: 'comp_ss_5', name: 'Government and Citizenship', desc: 'U.S. and Texas government, citizenship.', weight: 0.13, games: [] },
  { id: 'comp_ss_6', name: 'Economics and Science, Technology, Society', desc: 'Economics, STS.', weight: 0.13, games: [] },
  { id: 'comp_ss_7', name: 'Social Studies Foundations, Skills, Research and Instruction', desc: 'Disciplinary literacy, research, pedagogy.', weight: 0.13, games: [] },
];

export const TEXES_QUESTIONS_SOCIAL_STUDIES712 = [
  // Domain I: World History
  { id: 'ss001', comp: 'comp_ss_1', type: 'mc', difficulty: 1, q: 'Which civilization developed the concept of democracy in ancient Greece?', choices: ['Rome', 'Athens', 'Sparta', 'Persia'], answer: 'Athens', explanation: 'Athens is credited with developing early democratic practices (e.g., citizen assembly).' },
  { id: 'ss002', comp: 'comp_ss_1', type: 'mc', difficulty: 2, q: 'What was a major effect of the Columbian Exchange?', choices: ['Only European benefit', 'Exchange of crops, animals, and diseases between hemispheres', 'Isolation of Asia', 'End of trade'], answer: 'Exchange of crops, animals, and diseases between hemispheres', explanation: 'The Columbian Exchange transferred plants, animals, and diseases between the Americas and Afro-Eurasia.' },
  { id: 'ss003', comp: 'comp_ss_1', type: 'mc', difficulty: 1, q: 'Which event is often considered the start of World War I?', choices: ['Pearl Harbor', 'Assassination of Archduke Franz Ferdinand', 'Invasion of Poland', 'D-Day'], answer: 'Assassination of Archduke Franz Ferdinand', explanation: 'The assassination in Sarajevo (1914) triggered a chain of alliances that led to war.' },
  { id: 'ss004', comp: 'comp_ss_1', type: 'mc', difficulty: 2, q: 'What was the Enlightenment?', choices: ['A war', 'An intellectual movement emphasizing reason, rights, and scientific inquiry', 'A religious revival only', 'A trade agreement'], answer: 'An intellectual movement emphasizing reason, rights, and scientific inquiry', explanation: 'The Enlightenment stressed reason, natural rights, and reform.' },
  { id: 'ss005', comp: 'comp_ss_1', type: 'mc', difficulty: 1, q: 'Which empire built an extensive road system in the Andes?', choices: ['Aztec', 'Maya', 'Inca', 'Olmec'], answer: 'Inca', explanation: 'The Inca built a vast road network to administer their empire.' },
  { id: 'ss006', comp: 'comp_ss_1', type: 'mc', difficulty: 2, q: 'What was the main cause of the Cold War?', choices: ['Trade disputes only', 'Ideological and geopolitical rivalry between the U.S. and Soviet Union', 'Colonial independence', 'Economic depression'], answer: 'Ideological and geopolitical rivalry between the U.S. and Soviet Union', explanation: 'The Cold War was a prolonged rivalry between capitalist and communist blocs.' },

  // Domain II: U.S. History
  { id: 'ss007', comp: 'comp_ss_2', type: 'mc', difficulty: 1, q: 'Which document established the framework for the U.S. government?', choices: ['Declaration of Independence', 'Articles of Confederation', 'U.S. Constitution', 'Bill of Rights'], answer: 'U.S. Constitution', explanation: 'The Constitution established the structure of the federal government.' },
  { id: 'ss008', comp: 'comp_ss_2', type: 'mc', difficulty: 2, q: 'What was the main purpose of the Lewis and Clark expedition?', choices: ['To conquer territory', 'To explore the Louisiana Purchase and find a route to the Pacific', 'To negotiate treaties only', 'To map the East Coast'], answer: 'To explore the Louisiana Purchase and find a route to the Pacific', explanation: 'Jefferson sent the expedition to explore the newly acquired land and seek a western route.' },
  { id: 'ss009', comp: 'comp_ss_2', type: 'mc', difficulty: 1, q: 'Which amendment abolished slavery in the United States?', choices: ['13th', '14th', '15th', '19th'], answer: '13th', explanation: 'The 13th Amendment abolished slavery.' },
  { id: 'ss010', comp: 'comp_ss_2', type: 'mc', difficulty: 2, q: 'What was the significance of the Seneca Falls Convention (1848)?', choices: ['Labor rights only', 'It launched the organized women\'s rights movement in the U.S.', 'End of slavery', 'Immigration reform'], answer: 'It launched the organized women\'s rights movement in the U.S.', explanation: 'Seneca Falls is often cited as the start of the organized U.S. women\'s rights movement.' },
  { id: 'ss011', comp: 'comp_ss_2', type: 'mc', difficulty: 1, q: 'Which event brought the U.S. into World War II?', choices: ['D-Day', 'Attack on Pearl Harbor', 'Invasion of Poland', 'Battle of Britain'], answer: 'Attack on Pearl Harbor', explanation: 'The Japanese attack on Pearl Harbor (1941) led the U.S. to enter the war.' },
  { id: 'ss012', comp: 'comp_ss_2', type: 'mc', difficulty: 2, q: 'What was the Great Society?', choices: ['A colonial plan', 'Lyndon B. Johnson\'s domestic program to reduce poverty and expand civil rights', 'A military strategy', 'A trade pact'], answer: 'Lyndon B. Johnson\'s domestic program to reduce poverty and expand civil rights', explanation: 'The Great Society included programs like Medicare, Medicaid, and civil rights legislation.' },

  // Domain III: Texas History
  { id: 'ss013', comp: 'comp_ss_3', type: 'mc', difficulty: 1, q: 'When did Texas gain independence from Mexico?', choices: ['1821', '1836', '1845', '1861'], answer: '1836', explanation: 'Texas declared independence in 1836; the Republic of Texas existed until annexation in 1845.' },
  { id: 'ss014', comp: 'comp_ss_3', type: 'mc', difficulty: 2, q: 'What was the significance of the Battle of the Alamo?', choices: ['It ended the Texas Revolution', 'It became a symbol of resistance and sacrifice for Texas independence', 'It was a Mexican victory with no lasting impact', 'It led to immediate U.S. annexation'], answer: 'It became a symbol of resistance and sacrifice for Texas independence', explanation: 'The Alamo became a rallying cry ("Remember the Alamo") for Texan forces.' },
  { id: 'ss015', comp: 'comp_ss_3', type: 'mc', difficulty: 1, q: 'In what year was Texas admitted to the United States?', choices: ['1836', '1845', '1848', '1865'], answer: '1845', explanation: 'Texas was annexed and admitted as the 28th state in 1845.' },
  { id: 'ss016', comp: 'comp_ss_3', type: 'mc', difficulty: 2, q: 'Which natural resource was central to Texas\'s economy in the early 20th century?', choices: ['Gold', 'Oil', 'Timber only', 'Cotton only'], answer: 'Oil', explanation: 'The discovery of oil (e.g., Spindletop, 1901) transformed Texas\'s economy.' },
  { id: 'ss017', comp: 'comp_ss_3', type: 'mc', difficulty: 1, q: 'What is the state capital of Texas?', choices: ['Houston', 'Dallas', 'Austin', 'San Antonio'], answer: 'Austin', explanation: 'Austin has been the capital of Texas since 1839 (Republic) and after statehood.' },
  { id: 'ss018', comp: 'comp_ss_3', type: 'mc', difficulty: 2, q: 'Which group had a major influence on Texas culture and place names?', choices: ['Only Anglo settlers', 'Native peoples, Spanish/Mexican, Anglo, and others', 'Only European', 'Only African American'], answer: 'Native peoples, Spanish/Mexican, Anglo, and others', explanation: 'Texas culture reflects Native American, Spanish/Mexican, Anglo, and other influences.' },

  // Domain IV: Geography, Culture, Behavioral/Social Sciences
  { id: 'ss019', comp: 'comp_ss_4', type: 'mc', difficulty: 1, q: 'What is absolute location?', choices: ['Location relative to other places', 'Exact position using coordinates (e.g., latitude and longitude)', 'A region only', 'A landform'], answer: 'Exact position using coordinates (e.g., latitude and longitude)', explanation: 'Absolute location is the exact position on Earth\'s surface (e.g., 30°N, 97°W).' },
  { id: 'ss020', comp: 'comp_ss_4', type: 'mc', difficulty: 2, q: 'What is culture?', choices: ['Only art and music', 'The shared beliefs, values, customs, and behaviors of a group', 'Only language', 'Only religion'], answer: 'The shared beliefs, values, customs, and behaviors of a group', explanation: 'Culture includes beliefs, values, customs, language, and practices.' },
  { id: 'ss021', comp: 'comp_ss_4', type: 'mc', difficulty: 1, q: 'Which social science studies human behavior and mental processes?', choices: ['Economics', 'Psychology', 'Geography', 'Political science'], answer: 'Psychology', explanation: 'Psychology is the study of behavior and mental processes.' },
  { id: 'ss022', comp: 'comp_ss_4', type: 'mc', difficulty: 2, q: 'What is the difference between weather and climate?', choices: ['They are the same', 'Weather is short-term conditions; climate is long-term patterns', 'Climate is daily only', 'Weather is long-term'], answer: 'Weather is short-term conditions; climate is long-term patterns', explanation: 'Weather describes short-term conditions; climate describes long-term averages and patterns.' },
  { id: 'ss023', comp: 'comp_ss_4', type: 'mc', difficulty: 1, q: 'What is migration?', choices: ['Only moving within a country', 'The movement of people from one place to another', 'Only immigration', 'Only emigration'], answer: 'The movement of people from one place to another', explanation: 'Migration is the movement of people; it can be internal or international.' },
  { id: 'ss024', comp: 'comp_ss_4', type: 'mc', difficulty: 2, q: 'Which factor often influences population distribution?', choices: ['Only politics', 'Physical geography, resources, and economic opportunity', 'Only culture', 'Only language'], answer: 'Physical geography, resources, and economic opportunity', explanation: 'People tend to settle where resources, climate, and opportunity support life.' },

  // Domain V: Government and Citizenship
  { id: 'ss025', comp: 'comp_ss_5', type: 'mc', difficulty: 1, q: 'How many branches does the U.S. federal government have?', choices: ['One', 'Two', 'Three', 'Four'], answer: 'Three', explanation: 'The U.S. has three branches: legislative, executive, and judicial (separation of powers).' },
  { id: 'ss026', comp: 'comp_ss_5', type: 'mc', difficulty: 2, q: 'What is federalism?', choices: ['Rule by one person', 'Division of power between national and state governments', 'Only state power', 'Only national power'], answer: 'Division of power between national and state governments', explanation: 'Federalism is the sharing of power between the federal and state governments.' },
  { id: 'ss027', comp: 'comp_ss_5', type: 'mc', difficulty: 1, q: 'Which branch of government makes laws in the United States?', choices: ['Executive', 'Judicial', 'Legislative', 'President only'], answer: 'Legislative', explanation: 'Congress (House and Senate) is the legislative branch and makes federal laws.' },
  { id: 'ss028', comp: 'comp_ss_5', type: 'mc', difficulty: 2, q: 'What is the purpose of the Bill of Rights?', choices: ['To create the government', 'To protect individual liberties and limit government power', 'To establish taxes', 'To create the courts'], answer: 'To protect individual liberties and limit government power', explanation: 'The Bill of Rights (first 10 amendments) protects fundamental rights.' },
  { id: 'ss029', comp: 'comp_ss_5', type: 'mc', difficulty: 1, q: 'What is citizenship?', choices: ['Only voting', 'Membership in a political community with associated rights and responsibilities', 'Only birth in a country', 'Only naturalization'], answer: 'Membership in a political community with associated rights and responsibilities', explanation: 'Citizenship entails rights (e.g., vote) and responsibilities (e.g., obey laws, serve when required).' },
  { id: 'ss030', comp: 'comp_ss_5', type: 'mc', difficulty: 2, q: 'What is checks and balances?', choices: ['Only judicial review', 'The system where each branch can limit the power of the others', 'Only Congress checking the president', 'Only the president vetoing'], answer: 'The system where each branch can limit the power of the others', explanation: 'Checks and balances prevent any one branch from dominating.' },

  // Domain VI: Economics and STS
  { id: 'ss031', comp: 'comp_ss_6', type: 'mc', difficulty: 1, q: 'What is scarcity?', choices: ['Abundance of resources', 'Limited resources relative to unlimited wants', 'Only money', 'Only natural resources'], answer: 'Limited resources relative to unlimited wants', explanation: 'Scarcity means we must make choices because resources are limited.' },
  { id: 'ss032', comp: 'comp_ss_6', type: 'mc', difficulty: 2, q: 'What is opportunity cost?', choices: ['The cost of production', 'The value of the next best alternative given up when making a choice', 'Only monetary cost', 'Only time'], answer: 'The value of the next best alternative given up when making a choice', explanation: 'Opportunity cost is what you give up when you choose one option over another.' },
  { id: 'ss033', comp: 'comp_ss_6', type: 'mc', difficulty: 1, q: 'In a market economy, how are most prices determined?', choices: ['By government only', 'By supply and demand', 'By tradition only', 'By one company'], answer: 'By supply and demand', explanation: 'In a market economy, prices are largely determined by supply and demand.' },
  { id: 'ss034', comp: 'comp_ss_6', type: 'mc', difficulty: 2, q: 'What is the relationship between science, technology, and society (STS)?', choices: ['They are unrelated', 'Science and technology influence society, and society influences their development', 'Only society matters', 'Only technology matters'], answer: 'Science and technology influence society, and society influences their development', explanation: 'STS examines the mutual influence of science, technology, and society.' },
  { id: 'ss035', comp: 'comp_ss_6', type: 'mc', difficulty: 1, q: 'What is inflation?', choices: ['A decrease in prices', 'A general increase in prices over time', 'Only wage increase', 'Only interest rates'], answer: 'A general increase in prices over time', explanation: 'Inflation is a sustained increase in the general price level.' },
  { id: 'ss036', comp: 'comp_ss_6', type: 'mc', difficulty: 2, q: 'What is a monopoly?', choices: ['Many sellers', 'A market with one seller (or dominant seller) of a product', 'Government ownership only', 'A small number of buyers'], answer: 'A market with one seller (or dominant seller) of a product', explanation: 'A monopoly exists when one firm dominates the market for a good or service.' },

  // Domain VII: Social Studies Foundations, Skills, Research and Instruction
  { id: 'ss037', comp: 'comp_ss_7', type: 'mc', difficulty: 1, q: 'What is a primary source?', choices: ['A textbook', 'A first-hand account or artifact from the time period studied', 'A summary only', 'A movie'], answer: 'A first-hand account or artifact from the time period studied', explanation: 'Primary sources are original materials from the period (e.g., letters, documents, artifacts).' },
  { id: 'ss038', comp: 'comp_ss_7', type: 'mc', difficulty: 2, q: 'Why is it important to use multiple perspectives in social studies instruction?', choices: ['To lengthen lessons', 'To help students understand that history and society are interpreted in different ways', 'To avoid controversy', 'To replace primary sources'], answer: 'To help students understand that history and society are interpreted in different ways', explanation: 'Multiple perspectives build critical thinking and a more nuanced view.' },
  { id: 'ss039', comp: 'comp_ss_7', type: 'mc', difficulty: 1, q: 'What is historical context?', choices: ['Only dates', 'The circumstances, conditions, and setting in which an event occurred', 'Only geography', 'Only people'], answer: 'The circumstances, conditions, and setting in which an event occurred', explanation: 'Context includes time, place, culture, and conditions surrounding an event.' },
  { id: 'ss040', comp: 'comp_ss_7', type: 'mc', difficulty: 2, q: 'Which strategy supports literacy in social studies?', choices: ['Only lecture', 'Using document analysis, vocabulary instruction, and argumentative writing', 'Avoiding reading', 'Only multiple choice'], answer: 'Using document analysis, vocabulary instruction, and argumentative writing', explanation: 'Document analysis, vocabulary, and argumentative writing build disciplinary literacy.' },
  { id: 'ss041', comp: 'comp_ss_7', type: 'mc', difficulty: 1, q: 'What is the difference between a fact and an opinion in historical analysis?', choices: ['They are the same', 'Facts can be verified; opinions are interpretations or judgments', 'Facts are always wrong', 'Opinions are always wrong'], answer: 'Facts can be verified; opinions are interpretations or judgments', explanation: 'Facts are verifiable; opinions are interpretations or value judgments.' },
  { id: 'ss042', comp: 'comp_ss_7', type: 'mc', difficulty: 2, q: 'How can a teacher promote civic engagement in social studies?', choices: ['By avoiding current events', 'By connecting content to current issues, service learning, and informed action', 'By testing only', 'By avoiding debate'], answer: 'By connecting content to current issues, service learning, and informed action', explanation: 'Civic engagement is fostered through relevance and opportunities for action.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES History 7–12 (233)
// 100 questions, 5 hr. Domains: World History, U.S. History, Texas History, Foundations/Skills/Instruction
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_HISTORY712 = [
  { id: 'comp_hist_1', name: 'World History', desc: 'Ancient civilizations, world history 600–present.', weight: 0.30, games: [] },
  { id: 'comp_hist_2', name: 'U.S. History', desc: 'U.S. history from founding to present.', weight: 0.36, games: [] },
  { id: 'comp_hist_3', name: 'Texas History', desc: 'Texas history, geography, culture.', weight: 0.20, games: [] },
  { id: 'comp_hist_4', name: 'Foundations, Skills, Research and Instruction', desc: 'Historical thinking, research, pedagogy.', weight: 0.14, games: [] },
];

export const TEXES_QUESTIONS_HISTORY712 = [
  // Domain I: World History
  { id: 'hist001', comp: 'comp_hist_1', type: 'mc', difficulty: 1, q: 'Which civilization developed the concept of democracy in ancient Greece?', choices: ['Rome', 'Athens', 'Sparta', 'Persia'], answer: 'Athens', explanation: 'Athens is credited with developing early democratic practices.' },
  { id: 'hist002', comp: 'comp_hist_1', type: 'mc', difficulty: 2, q: 'What was a major effect of the Columbian Exchange?', choices: ['Only European benefit', 'Exchange of crops, animals, and diseases between hemispheres', 'Isolation of Asia', 'End of trade'], answer: 'Exchange of crops, animals, and diseases between hemispheres', explanation: 'The Columbian Exchange transferred plants, animals, and diseases between the Americas and Afro-Eurasia.' },
  { id: 'hist003', comp: 'comp_hist_1', type: 'mc', difficulty: 1, q: 'Which event is often considered the start of World War I?', choices: ['Pearl Harbor', 'Assassination of Archduke Franz Ferdinand', 'Invasion of Poland', 'D-Day'], answer: 'Assassination of Archduke Franz Ferdinand', explanation: 'The assassination in 1914 triggered a chain of alliances that led to war.' },
  { id: 'hist004', comp: 'comp_hist_1', type: 'mc', difficulty: 2, q: 'What was the Enlightenment?', choices: ['A war', 'An intellectual movement emphasizing reason, rights, and scientific inquiry', 'A religious revival only', 'A trade agreement'], answer: 'An intellectual movement emphasizing reason, rights, and scientific inquiry', explanation: 'The Enlightenment stressed reason, natural rights, and reform.' },
  { id: 'hist005', comp: 'comp_hist_1', type: 'mc', difficulty: 1, q: 'Which empire built an extensive road system in the Andes?', choices: ['Aztec', 'Maya', 'Inca', 'Olmec'], answer: 'Inca', explanation: 'The Inca built a vast road network.' },
  { id: 'hist006', comp: 'comp_hist_1', type: 'mc', difficulty: 2, q: 'What was the main cause of the Cold War?', choices: ['Trade disputes only', 'Ideological and geopolitical rivalry between the U.S. and Soviet Union', 'Colonial independence', 'Economic depression'], answer: 'Ideological and geopolitical rivalry between the U.S. and Soviet Union', explanation: 'The Cold War was a prolonged rivalry between capitalist and communist blocs.' },
  { id: 'hist007', comp: 'comp_hist_1', type: 'mc', difficulty: 1, q: 'Which religion originated in the Arabian Peninsula in the 7th century?', choices: ['Christianity', 'Judaism', 'Islam', 'Buddhism'], answer: 'Islam', explanation: 'Islam originated in the Arabian Peninsula with the teachings of Muhammad.' },
  { id: 'hist008', comp: 'comp_hist_1', type: 'mc', difficulty: 2, q: 'What was the Renaissance?', choices: ['A war', 'A period of renewed interest in classical learning, art, and humanism in Europe', 'A religious movement only', 'A trade route'], answer: 'A period of renewed interest in classical learning, art, and humanism in Europe', explanation: 'The Renaissance revived classical ideas and emphasized human potential.' },

  // Domain II: U.S. History
  { id: 'hist009', comp: 'comp_hist_2', type: 'mc', difficulty: 1, q: 'Which document established the framework for the U.S. government?', choices: ['Declaration of Independence', 'Articles of Confederation', 'U.S. Constitution', 'Bill of Rights'], answer: 'U.S. Constitution', explanation: 'The Constitution established the structure of the federal government.' },
  { id: 'hist010', comp: 'comp_hist_2', type: 'mc', difficulty: 2, q: 'What was the main purpose of the Lewis and Clark expedition?', choices: ['To conquer territory', 'To explore the Louisiana Purchase and find a route to the Pacific', 'To negotiate treaties only', 'To map the East Coast'], answer: 'To explore the Louisiana Purchase and find a route to the Pacific', explanation: 'Jefferson sent the expedition to explore the newly acquired land.' },
  { id: 'hist011', comp: 'comp_hist_2', type: 'mc', difficulty: 1, q: 'Which amendment abolished slavery in the United States?', choices: ['13th', '14th', '15th', '19th'], answer: '13th', explanation: 'The 13th Amendment abolished slavery.' },
  { id: 'hist012', comp: 'comp_hist_2', type: 'mc', difficulty: 2, q: 'What was the significance of the Seneca Falls Convention (1848)?', choices: ['Labor rights only', 'It launched the organized women\'s rights movement in the U.S.', 'End of slavery', 'Immigration reform'], answer: 'It launched the organized women\'s rights movement in the U.S.', explanation: 'Seneca Falls is often cited as the start of the organized U.S. women\'s rights movement.' },
  { id: 'hist013', comp: 'comp_hist_2', type: 'mc', difficulty: 1, q: 'Which event brought the U.S. into World War II?', choices: ['D-Day', 'Attack on Pearl Harbor', 'Invasion of Poland', 'Battle of Britain'], answer: 'Attack on Pearl Harbor', explanation: 'The Japanese attack on Pearl Harbor (1941) led the U.S. to enter the war.' },
  { id: 'hist014', comp: 'comp_hist_2', type: 'mc', difficulty: 2, q: 'What was the Great Society?', choices: ['A colonial plan', 'Lyndon B. Johnson\'s domestic program to reduce poverty and expand civil rights', 'A military strategy', 'A trade pact'], answer: 'Lyndon B. Johnson\'s domestic program to reduce poverty and expand civil rights', explanation: 'The Great Society included Medicare, Medicaid, and civil rights legislation.' },
  { id: 'hist015', comp: 'comp_hist_2', type: 'mc', difficulty: 1, q: 'Who wrote the Declaration of Independence?', choices: ['George Washington', 'Thomas Jefferson', 'Benjamin Franklin', 'John Adams'], answer: 'Thomas Jefferson', explanation: 'Thomas Jefferson was the primary author of the Declaration of Independence.' },
  { id: 'hist016', comp: 'comp_hist_2', type: 'mc', difficulty: 2, q: 'What was the main cause of the Civil War?', choices: ['Tariffs only', 'Disputes over slavery, states\' rights, and sectionalism', 'Foreign invasion', 'Economic depression only'], answer: 'Disputes over slavery, states\' rights, and sectionalism', explanation: 'Slavery and related political and economic issues led to secession and war.' },

  // Domain III: Texas History
  { id: 'hist017', comp: 'comp_hist_3', type: 'mc', difficulty: 1, q: 'When did Texas gain independence from Mexico?', choices: ['1821', '1836', '1845', '1861'], answer: '1836', explanation: 'Texas declared independence in 1836.' },
  { id: 'hist018', comp: 'comp_hist_3', type: 'mc', difficulty: 2, q: 'What was the significance of the Battle of the Alamo?', choices: ['It ended the Texas Revolution', 'It became a symbol of resistance and sacrifice for Texas independence', 'It was a Mexican victory with no lasting impact', 'It led to immediate U.S. annexation'], answer: 'It became a symbol of resistance and sacrifice for Texas independence', explanation: 'The Alamo became a rallying cry for Texan forces.' },
  { id: 'hist019', comp: 'comp_hist_3', type: 'mc', difficulty: 1, q: 'In what year was Texas admitted to the United States?', choices: ['1836', '1845', '1848', '1865'], answer: '1845', explanation: 'Texas was admitted as the 28th state in 1845.' },
  { id: 'hist020', comp: 'comp_hist_3', type: 'mc', difficulty: 2, q: 'Which natural resource was central to Texas\'s economy in the early 20th century?', choices: ['Gold', 'Oil', 'Timber only', 'Cotton only'], answer: 'Oil', explanation: 'The discovery of oil (e.g., Spindletop) transformed Texas\'s economy.' },
  { id: 'hist021', comp: 'comp_hist_3', type: 'mc', difficulty: 1, q: 'What is the state capital of Texas?', choices: ['Houston', 'Dallas', 'Austin', 'San Antonio'], answer: 'Austin', explanation: 'Austin has been the capital since the Republic era.' },
  { id: 'hist022', comp: 'comp_hist_3', type: 'mc', difficulty: 2, q: 'Which group had a major influence on Texas culture and place names?', choices: ['Only Anglo settlers', 'Native peoples, Spanish/Mexican, Anglo, and others', 'Only European', 'Only African American'], answer: 'Native peoples, Spanish/Mexican, Anglo, and others', explanation: 'Texas culture reflects multiple influences.' },

  // Domain IV: Foundations, Skills, Research and Instruction
  { id: 'hist023', comp: 'comp_hist_4', type: 'mc', difficulty: 1, q: 'What is a primary source?', choices: ['A textbook', 'A first-hand account or artifact from the time period studied', 'A summary only', 'A movie'], answer: 'A first-hand account or artifact from the time period studied', explanation: 'Primary sources are original materials from the period.' },
  { id: 'hist024', comp: 'comp_hist_4', type: 'mc', difficulty: 2, q: 'Why is it important to use multiple perspectives in history instruction?', choices: ['To lengthen lessons', 'To help students understand that history is interpreted in different ways', 'To avoid controversy', 'To replace primary sources'], answer: 'To help students understand that history is interpreted in different ways', explanation: 'Multiple perspectives build critical thinking.' },
  { id: 'hist025', comp: 'comp_hist_4', type: 'mc', difficulty: 1, q: 'What is historical context?', choices: ['Only dates', 'The circumstances, conditions, and setting in which an event occurred', 'Only geography', 'Only people'], answer: 'The circumstances, conditions, and setting in which an event occurred', explanation: 'Context includes time, place, and conditions surrounding an event.' },
  { id: 'hist026', comp: 'comp_hist_4', type: 'mc', difficulty: 2, q: 'Which strategy supports historical thinking skills?', choices: ['Only lecture', 'Sourcing, corroboration, and close reading of primary and secondary sources', 'Avoiding documents', 'Only multiple choice'], answer: 'Sourcing, corroboration, and close reading of primary and secondary sources', explanation: 'Sourcing, corroboration, and close reading are key historical thinking skills.' },
  { id: 'hist027', comp: 'comp_hist_4', type: 'mc', difficulty: 1, q: 'What is the difference between a fact and an interpretation in history?', choices: ['They are the same', 'Facts can be verified; interpretations are explanations or judgments', 'Facts are always wrong', 'Interpretations are always wrong'], answer: 'Facts can be verified; interpretations are explanations or judgments', explanation: 'Facts are verifiable; interpretations are constructed from evidence.' },
  { id: 'hist028', comp: 'comp_hist_4', type: 'mc', difficulty: 2, q: 'How can a teacher promote historical empathy?', choices: ['By avoiding perspectives', 'By having students consider the context and viewpoints of people in the past', 'By testing only', 'By avoiding primary sources'], answer: 'By having students consider the context and viewpoints of people in the past', explanation: 'Historical empathy involves understanding past actors in their context.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES ELA and Reading 4–8 (117) — 100 questions, 5 hr. Domains: Oral Language/Early Literacy/Word ID/Fluency; Reading Comprehension/Writing/Viewing/Study Skills
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_ELA48 = [
  { id: 'comp_ela48_1', name: 'Oral Language, Early Literacy, Word ID, Fluency', desc: 'Oral language, foundations of reading, word analysis, fluency.', weight: 0.33, games: [] },
  { id: 'comp_ela48_2', name: 'Reading Comprehension, Writing, Viewing, Study Skills', desc: 'Comprehension, assessment, written language, viewing and representing, inquiry.', weight: 0.67, games: [] },
];

export const TEXES_QUESTIONS_ELA48 = [
  { id: 'ela48_001', comp: 'comp_ela48_1', type: 'mc', difficulty: 1, q: 'What is phonemic awareness?', choices: ['Understanding that print carries meaning', 'The ability to hear and manipulate individual sounds in words', 'Knowing letter names', 'Reading fluency'], answer: 'The ability to hear and manipulate individual sounds in words', explanation: 'Phonemic awareness is the ability to recognize and manipulate phonemes (individual sounds).' },
  { id: 'ela48_002', comp: 'comp_ela48_1', type: 'mc', difficulty: 2, q: 'Which strategy best supports fluency development in grades 4–8?', choices: ['Only silent reading', 'Repeated reading, reader\'s theater, and modeling fluent reading', 'Avoiding oral reading', 'Speed drills only'], answer: 'Repeated reading, reader\'s theater, and modeling fluent reading', explanation: 'Repeated reading and modeling build accuracy, rate, and prosody.' },
  { id: 'ela48_003', comp: 'comp_ela48_1', type: 'mc', difficulty: 1, q: 'What is decoding?', choices: ['Understanding meaning', 'Using letter-sound knowledge to read words', 'Writing only', 'Spelling only'], answer: 'Using letter-sound knowledge to read words', explanation: 'Decoding is translating written symbols into sounds to read words.' },
  { id: 'ela48_004', comp: 'comp_ela48_1', type: 'mc', difficulty: 2, q: 'Why is oral language development important for literacy?', choices: ['It is not important', 'It provides the foundation for vocabulary, comprehension, and written expression', 'Only for young children', 'Only for ELLs'], answer: 'It provides the foundation for vocabulary, comprehension, and written expression', explanation: 'Oral language supports vocabulary, syntax, and comprehension needed for reading and writing.' },
  { id: 'ela48_005', comp: 'comp_ela48_1', type: 'mc', difficulty: 1, q: 'Which is an example of a blend?', choices: ['ship', 'stop', 'chat', 'thing'], answer: 'stop', explanation: 'A blend is two or more consonants together, each sound heard (e.g., /s/ + /t/ in stop).' },
  { id: 'ela48_006', comp: 'comp_ela48_1', type: 'mc', difficulty: 2, q: 'What is the role of morphology (roots, prefixes, suffixes) in grades 4–8?', choices: ['Only for spelling', 'To help students decode and infer meaning of multisyllabic words', 'To replace phonics', 'Only in writing'], answer: 'To help students decode and infer meaning of multisyllabic words', explanation: 'Morphology supports word recognition and vocabulary in upper elementary and middle grades.' },
  { id: 'ela48_007', comp: 'comp_ela48_2', type: 'mc', difficulty: 1, q: 'What is the main idea of a text?', choices: ['The first sentence', 'The central point or message the author conveys', 'The longest paragraph', 'The title only'], answer: 'The central point or message the author conveys', explanation: 'The main idea is the central claim or message that the rest of the text supports.' },
  { id: 'ela48_008', comp: 'comp_ela48_2', type: 'mc', difficulty: 2, q: 'Which strategy supports reading comprehension of informational text?', choices: ['Only reading once', 'Using text structure (e.g., headings, cause-effect) and summarizing', 'Skipping vocabulary', 'Avoiding discussion'], answer: 'Using text structure (e.g., headings, cause-effect) and summarizing', explanation: 'Text structure and summarizing help students organize and retain information.' },
  { id: 'ela48_009', comp: 'comp_ela48_2', type: 'mc', difficulty: 1, q: 'What is inference in reading?', choices: ['Copying the text', 'Drawing a conclusion based on evidence and reasoning', 'Guessing randomly', 'Summarizing only'], answer: 'Drawing a conclusion based on evidence and reasoning', explanation: 'Inference is a conclusion reached from evidence in the text, not stated explicitly.' },
  { id: 'ela48_010', comp: 'comp_ela48_2', type: 'mc', difficulty: 2, q: 'Why is the writing process important for students in grades 4–8?', choices: ['To make assignments longer', 'To plan, draft, revise, and edit for clarity and impact', 'To avoid grammar', 'To replace reading'], answer: 'To plan, draft, revise, and edit for clarity and impact', explanation: 'The writing process supports development of ideas and quality of writing.' },
  { id: 'ela48_011', comp: 'comp_ela48_2', type: 'mc', difficulty: 1, q: 'What is a thesis statement?', choices: ['A question', 'A sentence that states the main claim of an essay', 'The conclusion', 'A quote'], answer: 'A sentence that states the main claim of an essay', explanation: 'The thesis is the central claim that the essay will develop and support.' },
  { id: 'ela48_012', comp: 'comp_ela48_2', type: 'mc', difficulty: 2, q: 'How can viewing and representing support literacy in grades 4–8?', choices: ['By replacing reading', 'By analyzing and creating visual and digital texts to deepen comprehension and communication', 'By avoiding media', 'By testing only'], answer: 'By analyzing and creating visual and digital texts to deepen comprehension and communication', explanation: 'Viewing and representing extend literacy to multimodal texts.' },
  { id: 'ela48_013', comp: 'comp_ela48_2', type: 'mc', difficulty: 1, q: 'What is the purpose of formative assessment in reading?', choices: ['To grade only', 'To inform instruction and provide feedback during learning', 'To replace summative tests', 'To rank students'], answer: 'To inform instruction and provide feedback during learning', explanation: 'Formative assessment helps teachers adjust instruction and students improve.' },
  { id: 'ela48_014', comp: 'comp_ela48_2', type: 'mc', difficulty: 2, q: 'Which question promotes close reading?', choices: ['What is the title?', 'What evidence does the author use to support the claim?', 'How long is the text?', 'Who is the publisher?'], answer: 'What evidence does the author use to support the claim?', explanation: 'Close reading involves analyzing how the author supports ideas with evidence.' },
  { id: 'ela48_015', comp: 'comp_ela48_2', type: 'mc', difficulty: 1, q: 'What is theme in literature?', choices: ['The plot summary', 'A central idea or insight about human nature or life', 'The setting', 'The author\'s biography'], answer: 'A central idea or insight about human nature or life', explanation: 'Theme is the underlying message or insight that the work explores.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Science 4–8 (116) — 100 questions, ~4 hr 45 min. 5 domains
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_SCIENCE48 = [
  { id: 'comp_sci48_1', name: 'Scientific Inquiry and Processes', desc: 'Inquiry, safety, tools, investigations.', weight: 0.22, games: [] },
  { id: 'comp_sci48_2', name: 'Physical Science', desc: 'Forces, motion, matter, chemical properties.', weight: 0.22, games: [] },
  { id: 'comp_sci48_3', name: 'Life Science', desc: 'Organisms, ecosystems, heredity.', weight: 0.22, games: [] },
  { id: 'comp_sci48_4', name: 'Earth and Space Science', desc: 'Earth systems, space.', weight: 0.22, games: [] },
  { id: 'comp_sci48_5', name: 'Science Learning, Instruction and Assessment', desc: 'Pedagogy, assessment.', weight: 0.12, games: [] },
];

export const TEXES_QUESTIONS_SCIENCE48 = [
  { id: 's48_001', comp: 'comp_sci48_1', type: 'mc', difficulty: 1, q: 'What is the first step in the scientific method?', choices: ['Form a hypothesis', 'Ask a question or identify a problem', 'Draw conclusions', 'Communicate results'], answer: 'Ask a question or identify a problem', explanation: 'Scientific inquiry begins with a question or problem to investigate.' },
  { id: 's48_002', comp: 'comp_sci48_1', type: 'mc', difficulty: 2, q: 'Why is a control group important in an experiment?', choices: ['To speed up the experiment', 'To provide a baseline for comparison', 'To test more variables', 'To ensure random results'], answer: 'To provide a baseline for comparison', explanation: 'The control group is used for comparison so the effect of the variable can be identified.' },
  { id: 's48_003', comp: 'comp_sci48_2', type: 'mc', difficulty: 1, q: 'What is the force that pulls objects toward Earth?', choices: ['Magnetism', 'Gravity', 'Friction', 'Inertia'], answer: 'Gravity', explanation: 'Gravity is the force of attraction between masses; it pulls objects toward Earth.' },
  { id: 's48_004', comp: 'comp_sci48_2', type: 'mc', difficulty: 2, q: 'Which is a chemical change?', choices: ['Ice melting', 'Paper being cut', 'Wood burning', 'Water evaporating'], answer: 'Wood burning', explanation: 'A chemical change produces new substances; burning wood produces ash and gases.' },
  { id: 's48_005', comp: 'comp_sci48_3', type: 'mc', difficulty: 1, q: 'Where does photosynthesis occur in a plant?', choices: ['Roots', 'Stems', 'Leaves', 'Flowers'], answer: 'Leaves', explanation: 'Photosynthesis occurs mainly in the leaves, where chloroplasts capture light.' },
  { id: 's48_006', comp: 'comp_sci48_3', type: 'mc', difficulty: 2, q: 'What is the role of decomposers in an ecosystem?', choices: ['To produce oxygen', 'To break down dead matter and recycle nutrients', 'To prey on herbivores', 'To make food'], answer: 'To break down dead matter and recycle nutrients', explanation: 'Decomposers break down organic matter and return nutrients to the soil.' },
  { id: 's48_007', comp: 'comp_sci48_4', type: 'mc', difficulty: 1, q: 'What causes the seasons on Earth?', choices: ['Distance from the Sun', 'The tilt of Earth\'s axis', 'The Moon', 'Ocean currents'], answer: 'The tilt of Earth\'s axis', explanation: 'The tilt of Earth\'s axis causes different hemispheres to receive different amounts of sunlight.' },
  { id: 's48_008', comp: 'comp_sci48_4', type: 'mc', difficulty: 2, q: 'What type of rock is formed from cooled lava?', choices: ['Sedimentary', 'Metamorphic', 'Igneous', 'Organic'], answer: 'Igneous', explanation: 'Igneous rocks form from the cooling and solidification of magma or lava.' },
  { id: 's48_009', comp: 'comp_sci48_5', type: 'mc', difficulty: 1, q: 'What is the purpose of a pre-lab safety discussion?', choices: ['To skip the lab', 'To ensure students understand hazards and procedures', 'To replace equipment', 'To grade faster'], answer: 'To ensure students understand hazards and procedures', explanation: 'Pre-lab safety discussions reduce risk and prepare students.' },
  { id: 's48_010', comp: 'comp_sci48_5', type: 'mc', difficulty: 2, q: 'Which strategy best supports inquiry-based learning in science?', choices: ['Only lectures', 'Posing questions, designing investigations, and analyzing data', 'Avoiding experiments', 'Memorizing only'], answer: 'Posing questions, designing investigations, and analyzing data', explanation: 'Inquiry involves asking questions, conducting investigations, and analyzing results.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Social Studies 4–8 (118) — 100 questions, 5 hr. 6 domains (Content + Foundations)
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_SOCIAL_STUDIES48 = [
  { id: 'comp_ss48_1', name: 'History', desc: 'U.S. and Texas history, significant events.', weight: 0.14, games: [] },
  { id: 'comp_ss48_2', name: 'Geography', desc: 'Physical and human geography.', weight: 0.14, games: [] },
  { id: 'comp_ss48_3', name: 'Economics', desc: 'Economic concepts and principles.', weight: 0.14, games: [] },
  { id: 'comp_ss48_4', name: 'Government and Citizenship', desc: 'Government, citizenship.', weight: 0.14, games: [] },
  { id: 'comp_ss48_5', name: 'Culture; Science, Technology, Society', desc: 'Culture, STS.', weight: 0.15, games: [] },
  { id: 'comp_ss48_6', name: 'Social Studies Foundations, Skills and Instruction', desc: 'Pedagogy, skills, instruction.', weight: 0.29, games: [] },
];

export const TEXES_QUESTIONS_SOCIAL_STUDIES48 = [
  { id: 'ss48_001', comp: 'comp_ss48_1', type: 'mc', difficulty: 1, q: 'Which document established the framework for the U.S. government?', choices: ['Declaration of Independence', 'U.S. Constitution', 'Bill of Rights', 'Articles of Confederation'], answer: 'U.S. Constitution', explanation: 'The Constitution established the structure of the federal government.' },
  { id: 'ss48_002', comp: 'comp_ss48_1', type: 'mc', difficulty: 2, q: 'When did Texas gain independence from Mexico?', choices: ['1821', '1836', '1845', '1861'], answer: '1836', explanation: 'Texas declared independence in 1836.' },
  { id: 'ss48_003', comp: 'comp_ss48_2', type: 'mc', difficulty: 1, q: 'What is absolute location?', choices: ['Location relative to other places', 'Exact position using coordinates (e.g., latitude and longitude)', 'A region', 'A landform'], answer: 'Exact position using coordinates (e.g., latitude and longitude)', explanation: 'Absolute location is exact position on Earth\'s surface.' },
  { id: 'ss48_004', comp: 'comp_ss48_2', type: 'mc', difficulty: 2, q: 'What is the difference between weather and climate?', choices: ['They are the same', 'Weather is short-term; climate is long-term patterns', 'Climate is daily only', 'Weather is long-term'], answer: 'Weather is short-term; climate is long-term patterns', explanation: 'Weather describes short-term conditions; climate describes long-term patterns.' },
  { id: 'ss48_005', comp: 'comp_ss48_3', type: 'mc', difficulty: 1, q: 'What is scarcity?', choices: ['Abundance of resources', 'Limited resources relative to unlimited wants', 'Only money', 'Only natural resources'], answer: 'Limited resources relative to unlimited wants', explanation: 'Scarcity means we must make choices because resources are limited.' },
  { id: 'ss48_006', comp: 'comp_ss48_3', type: 'mc', difficulty: 2, q: 'What is opportunity cost?', choices: ['The cost of production', 'The value of the next best alternative given up', 'Only monetary cost', 'Only time'], answer: 'The value of the next best alternative given up', explanation: 'Opportunity cost is what you give up when you choose one option.' },
  { id: 'ss48_007', comp: 'comp_ss48_4', type: 'mc', difficulty: 1, q: 'How many branches does the U.S. federal government have?', choices: ['One', 'Two', 'Three', 'Four'], answer: 'Three', explanation: 'The U.S. has three branches: legislative, executive, and judicial.' },
  { id: 'ss48_008', comp: 'comp_ss48_4', type: 'mc', difficulty: 2, q: 'What is federalism?', choices: ['Rule by one person', 'Division of power between national and state governments', 'Only state power', 'Only national power'], answer: 'Division of power between national and state governments', explanation: 'Federalism is the sharing of power between federal and state governments.' },
  { id: 'ss48_009', comp: 'comp_ss48_5', type: 'mc', difficulty: 1, q: 'What is culture?', choices: ['Only art and music', 'The shared beliefs, values, customs, and behaviors of a group', 'Only language', 'Only religion'], answer: 'The shared beliefs, values, customs, and behaviors of a group', explanation: 'Culture includes beliefs, values, customs, and practices.' },
  { id: 'ss48_010', comp: 'comp_ss48_6', type: 'mc', difficulty: 1, q: 'What is a primary source?', choices: ['A textbook', 'A first-hand account or artifact from the time period', 'A summary only', 'A movie'], answer: 'A first-hand account or artifact from the time period', explanation: 'Primary sources are original materials from the period.' },
  { id: 'ss48_011', comp: 'comp_ss48_6', type: 'mc', difficulty: 2, q: 'Why is it important to use multiple perspectives in social studies?', choices: ['To lengthen lessons', 'To help students understand that history is interpreted in different ways', 'To avoid controversy', 'To replace primary sources'], answer: 'To help students understand that history is interpreted in different ways', explanation: 'Multiple perspectives build critical thinking.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES ESL Supplemental (154) — 80 questions, 5 hr. 3 domains
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_ESL = [
  { id: 'comp_esl_1', name: 'Language Concepts and Language Acquisition', desc: 'Language structure, first and second language acquisition.', weight: 0.25, games: [] },
  { id: 'comp_esl_2', name: 'ESL Instruction and Assessment', desc: 'ESL methods, literacy, academic language, assessment.', weight: 0.45, games: [] },
  { id: 'comp_esl_3', name: 'Foundations, Cultural Awareness, Family and Community', desc: 'ESL programs, culture, family and community involvement.', weight: 0.30, games: [] },
];

export const TEXES_QUESTIONS_ESL = [
  { id: 'esl001', comp: 'comp_esl_1', type: 'mc', difficulty: 1, q: 'What is the difference between BICS and CALP?', choices: ['They are the same', 'BICS is social language; CALP is academic language', 'BICS is written only; CALP is oral only', 'CALP is easier'], answer: 'BICS is social language; CALP is academic language', explanation: 'BICS (Basic Interpersonal Communication Skills) is conversational; CALP (Cognitive Academic Language Proficiency) is academic.' },
  { id: 'esl002', comp: 'comp_esl_1', type: 'mc', difficulty: 2, q: 'According to Krashen, what is comprehensible input?', choices: ['Any English input', 'Input that is slightly above the learner\'s current level (i+1) and understandable', 'Only written text', 'Input with no new vocabulary'], answer: 'Input that is slightly above the learner\'s current level (i+1) and understandable', explanation: 'Comprehensible input (i+1) is key to acquisition: understandable but slightly challenging.' },
  { id: 'esl003', comp: 'comp_esl_1', type: 'mc', difficulty: 1, q: 'What is the silent period in second language acquisition?', choices: ['A learning disability', 'A phase when the learner may produce little speech but is building comprehension', 'A period of no instruction', 'Only in adults'], answer: 'A phase when the learner may produce little speech but is building comprehension', explanation: 'Many learners have a silent period where they listen and comprehend before speaking extensively.' },
  { id: 'esl004', comp: 'comp_esl_2', type: 'mc', difficulty: 1, q: 'What is sheltered instruction?', choices: ['Hiding content', 'Teaching content in a way that makes it comprehensible while developing language', 'Teaching only language', 'No scaffolding'], answer: 'Teaching content in a way that makes it comprehensible while developing language', explanation: 'Sheltered instruction combines content and language objectives with scaffolding.' },
  { id: 'esl005', comp: 'comp_esl_2', type: 'mc', difficulty: 2, q: 'Why should assessment for ELLs consider both content and language?', choices: ['To fail more students', 'To distinguish between language proficiency and content knowledge', 'To avoid testing', 'To use only one language'], answer: 'To distinguish between language proficiency and content knowledge', explanation: 'Separating language from content helps tailor instruction and avoid misclassification.' },
  { id: 'esl006', comp: 'comp_esl_2', type: 'mc', difficulty: 1, q: 'Which strategy makes content accessible to ELLs?', choices: ['Speaking faster', 'Using visuals, graphic organizers, and pre-teaching key vocabulary', 'Avoiding L1', 'Only written text'], answer: 'Using visuals, graphic organizers, and pre-teaching key vocabulary', explanation: 'Visuals, organizers, and vocabulary preview support comprehension.' },
  { id: 'esl007', comp: 'comp_esl_3', type: 'mc', difficulty: 1, q: 'Why is it important to value students\' home languages and cultures in ESL?', choices: ['To avoid teaching English', 'To build identity and bridge to academic English', 'To replace grammar instruction', 'To shorten lessons'], answer: 'To build identity and bridge to academic English', explanation: 'Valuing home language supports identity and provides a bridge to academic English.' },
  { id: 'esl008', comp: 'comp_esl_3', type: 'mc', difficulty: 2, q: 'How can family and community involvement support ELLs?', choices: ['By replacing school', 'By connecting home and school, sharing cultural knowledge, and supporting literacy', 'By avoiding home language', 'By testing only'], answer: 'By connecting home and school, sharing cultural knowledge, and supporting literacy', explanation: 'Family and community partnerships support language and academic development.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Special Education EC–12 (161) — 150 questions, 5 hr. 4 domains
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_SPECIAL_ED = [
  { id: 'comp_sped_1', name: 'Understanding Individuals with Disabilities and Evaluating Their Needs', desc: 'Disability characteristics, assessment.', weight: 0.13, games: [] },
  { id: 'comp_sped_2', name: 'Promoting Student Learning and Development', desc: 'Instructional planning, classroom management, behavior.', weight: 0.33, games: [] },
  { id: 'comp_sped_3', name: 'Promoting Achievement in ELA and Mathematics', desc: 'Content-specific instruction in ELA and math.', weight: 0.33, games: [] },
  { id: 'comp_sped_4', name: 'Foundations and Professional Roles', desc: 'Philosophical, historical, legal foundations; collaboration.', weight: 0.20, games: [] },
];

export const TEXES_QUESTIONS_SPECIAL_ED = [
  { id: 'sped001', comp: 'comp_sped_1', type: 'mc', difficulty: 1, q: 'What is an IEP?', choices: ['A grade report', 'An Individualized Education Program that outlines services and goals for a student with a disability', 'A medical record', 'A discipline plan'], answer: 'An Individualized Education Program that outlines services and goals for a student with a disability', explanation: 'The IEP is a legal document that specifies goals, services, and accommodations.' },
  { id: 'sped002', comp: 'comp_sped_1', type: 'mc', difficulty: 2, q: 'Why is it important to use multiple assessments when evaluating a student for special education?', choices: ['To delay services', 'To get a comprehensive picture and avoid misidentification', 'To reduce paperwork', 'To use only one test'], answer: 'To get a comprehensive picture and avoid misidentification', explanation: 'Multiple assessments provide a fuller picture of strengths and needs.' },
  { id: 'sped003', comp: 'comp_sped_2', type: 'mc', difficulty: 1, q: 'What is positive behavior support?', choices: ['Punishment only', 'A proactive approach that teaches and reinforces desired behaviors', 'Ignoring behavior', 'Removal only'], answer: 'A proactive approach that teaches and reinforces desired behaviors', explanation: 'PBS focuses on preventing problem behavior and teaching replacement skills.' },
  { id: 'sped004', comp: 'comp_sped_2', type: 'mc', difficulty: 2, q: 'What is the purpose of accommodations in instruction?', choices: ['To change the content', 'To provide access without changing what is being taught', 'To reduce expectations', 'To replace instruction'], answer: 'To provide access without changing what is being taught', explanation: 'Accommodations level the playing field; they do not change the standard.' },
  { id: 'sped005', comp: 'comp_sped_3', type: 'mc', difficulty: 1, q: 'Which strategy supports reading comprehension for students with learning disabilities?', choices: ['Only oral reading', 'Chunking text, graphic organizers, and explicit strategy instruction', 'Avoiding reading', 'Longer passages only'], answer: 'Chunking text, graphic organizers, and explicit strategy instruction', explanation: 'Scaffolding and strategy instruction support comprehension.' },
  { id: 'sped006', comp: 'comp_sped_3', type: 'mc', difficulty: 2, q: 'What is the purpose of explicit instruction in mathematics for students with disabilities?', choices: ['To skip concepts', 'To break down skills into steps and model clearly', 'To avoid practice', 'To use only calculators'], answer: 'To break down skills into steps and model clearly', explanation: 'Explicit instruction clarifies steps and reduces cognitive load.' },
  { id: 'sped007', comp: 'comp_sped_4', type: 'mc', difficulty: 1, q: 'What is the role of the general education teacher in the IEP process?', choices: ['No role', 'To participate in development and implementation of the IEP', 'To replace the special education teacher', 'To attend only when required'], answer: 'To participate in development and implementation of the IEP', explanation: 'General education teachers are part of the IEP team and implement accommodations.' },
  { id: 'sped008', comp: 'comp_sped_4', type: 'mc', difficulty: 2, q: 'What does FERPA protect?', choices: ['Only grades', 'The privacy of student education records', 'Teacher evaluations', 'School budgets'], answer: 'The privacy of student education records', explanation: 'FERPA protects the privacy of student education records.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES PPR EC–12 (160) — 100 questions, 5 hr. 4 domains
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_PPR = [
  { id: 'comp_ppr_1', name: 'Designing Instruction and Assessment', desc: 'Design instruction and assessment to promote student learning.', weight: 0.34, games: [] },
  { id: 'comp_ppr_2', name: 'Creating a Positive Classroom Environment', desc: 'Respect, rapport, equity, excellence.', weight: 0.13, games: [] },
  { id: 'comp_ppr_3', name: 'Implementing Effective Instruction and Assessment', desc: 'Responsive instruction, communication, engagement, feedback.', weight: 0.33, games: [] },
  { id: 'comp_ppr_4', name: 'Fulfilling Professional Roles and Responsibilities', desc: 'Legal, ethical, professional conduct.', weight: 0.20, games: [] },
];

export const TEXES_QUESTIONS_PPR = [
  { id: 'ppr001', comp: 'comp_ppr_1', type: 'mc', difficulty: 1, q: 'What is the purpose of learning objectives?', choices: ['To fill lesson plans', 'To define what students will know or be able to do by the end of the lesson', 'To replace assessment', 'To satisfy administrators'], answer: 'To define what students will know or be able to do by the end of the lesson', explanation: 'Objectives clarify the intended learning outcome for the lesson.' },
  { id: 'ppr002', comp: 'comp_ppr_1', type: 'mc', difficulty: 2, q: 'Why is it important to align assessment with objectives?', choices: ['To lengthen tests', 'To measure what was taught and inform next steps', 'To avoid grading', 'To use only one type'], answer: 'To measure what was taught and inform next steps', explanation: 'Alignment ensures assessment fairly measures the intended learning.' },
  { id: 'ppr003', comp: 'comp_ppr_2', type: 'mc', difficulty: 1, q: 'What contributes to a positive classroom climate?', choices: ['Only rules', 'Respectful relationships, clear expectations, and a safe environment', 'Only rewards', 'Only discipline'], answer: 'Respectful relationships, clear expectations, and a safe environment', explanation: 'Climate is built through relationships, expectations, and safety.' },
  { id: 'ppr004', comp: 'comp_ppr_2', type: 'mc', difficulty: 2, q: 'How can a teacher promote equity in the classroom?', choices: ['By treating everyone the same regardless of need', 'By recognizing diverse needs and providing appropriate support and access', 'By avoiding differentiation', 'By grouping by ability only'], answer: 'By recognizing diverse needs and providing appropriate support and access', explanation: 'Equity involves meeting students where they are and providing access.' },
  { id: 'ppr005', comp: 'comp_ppr_3', type: 'mc', difficulty: 1, q: 'What is the purpose of formative assessment?', choices: ['To grade only', 'To inform instruction and provide feedback during learning', 'To replace summative tests', 'To rank students'], answer: 'To inform instruction and provide feedback during learning', explanation: 'Formative assessment helps teachers adjust and students improve.' },
  { id: 'ppr006', comp: 'comp_ppr_3', type: 'mc', difficulty: 2, q: 'Which strategy promotes active student engagement?', choices: ['Only lecture', 'Questioning, discussion, and hands-on or collaborative tasks', 'Silent work only', 'Avoiding group work'], answer: 'Questioning, discussion, and hands-on or collaborative tasks', explanation: 'Active engagement involves students in doing and thinking.' },
  { id: 'ppr007', comp: 'comp_ppr_4', type: 'mc', difficulty: 1, q: 'What is a teacher\'s ethical responsibility regarding student confidentiality?', choices: ['To share with anyone who asks', 'To protect student information except as required by law or policy', 'To discuss only with colleagues', 'To ignore it'], answer: 'To protect student information except as required by law or policy', explanation: 'Confidentiality protects students and families; exceptions exist for safety and law.' },
  { id: 'ppr008', comp: 'comp_ppr_4', type: 'mc', difficulty: 2, q: 'Why is professional development important for teachers?', choices: ['Only for renewal', 'To improve practice and stay current with research and policy', 'To avoid teaching', 'To meet only minimum requirements'], answer: 'To improve practice and stay current with research and policy', explanation: 'Ongoing professional development supports effective teaching.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Bilingual Target Language Proficiency – Spanish (190) — 84 selected-response, ~3.5 hr. 4 domains
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_BILINGUAL_SPANISH = [
  { id: 'comp_btl_1', name: 'Listening Comprehension', desc: 'Derive meaning and interpret oral Spanish in school contexts.', weight: 0.21, games: [] },
  { id: 'comp_btl_2', name: 'Reading Comprehension', desc: 'Literal, inferential, interpretive reading in Spanish.', weight: 0.26, games: [] },
  { id: 'comp_btl_3', name: 'Oral Expression', desc: 'Interpersonal and presentational oral discourse in Spanish.', weight: 0.29, games: [] },
  { id: 'comp_btl_4', name: 'Written Expression', desc: 'Effective writing in Spanish for school and professional contexts.', weight: 0.24, games: [] },
];

export const TEXES_QUESTIONS_BILINGUAL_SPANISH = [
  { id: 'btl001', comp: 'comp_btl_1', type: 'mc', difficulty: 1, q: '¿Qué debe hacer un maestro bilingüe para comprender mejor a los padres que hablan español?', choices: ['Hablar más alto', 'Escuchar activamente y confirmar lo entendido', 'Solo usar inglés', 'Evitar reuniones'], answer: 'Escuchar activamente y confirmar lo entendido', explanation: 'La escucha activa y la confirmación mejoran la comunicación con las familias.' },
  { id: 'btl002', comp: 'comp_btl_1', type: 'mc', difficulty: 2, q: 'En un anuncio escolar en español, la frase "Se les recuerda a los padres" significa que:', choices: ['Los padres están en la escuela', 'Se recuerda algo a los padres', 'Los padres deben recordar solo', 'No es importante'], answer: 'Se recuerda algo a los padres', explanation: '"Se les recuerda" es una construcción de recordatorio dirigido a los padres.' },
  { id: 'btl003', comp: 'comp_btl_2', type: 'mc', difficulty: 1, q: '¿Qué estrategia ayuda a comprender un texto en español?', choices: ['Leer solo una vez', 'Identificar la idea principal y el vocabulario clave', 'Evitar el contexto', 'Saltar párrafos'], answer: 'Identificar la idea principal y el vocabulario clave', explanation: 'La idea principal y el vocabulario clave apoyan la comprensión lectora.' },
  { id: 'btl004', comp: 'comp_btl_2', type: 'mc', difficulty: 2, q: 'En un texto informativo en español, el propósito del autor suele ser:', choices: ['Solo entretener', 'Informar, explicar o persuadir', 'Solo describir', 'Solo narrar'], answer: 'Informar, explicar o persuadir', explanation: 'Los textos informativos pueden informar, explicar o persuadir.' },
  { id: 'btl005', comp: 'comp_btl_3', type: 'mc', difficulty: 1, q: '¿Qué es importante al dar instrucciones orales en español en clase?', choices: ['Hablar rápido', 'Usar lenguaje claro y verificar comprensión', 'Solo escribir', 'Evitar repetición'], answer: 'Usar lenguaje claro y verificar comprensión', explanation: 'Claridad y verificación aseguran que los estudiantes comprendan.' },
  { id: 'btl006', comp: 'comp_btl_3', type: 'mc', difficulty: 2, q: 'Al explicar un concepto académico en español, el maestro debe:', choices: ['Usar solo términos técnicos', 'Usar vocabulario apropiado y ejemplos que apoyen la comprensión', 'Evitar ejemplos', 'Solo leer el libro'], answer: 'Usar vocabulario apropiado y ejemplos que apoyen la comprensión', explanation: 'El vocabulario y los ejemplos adecuados apoyan la comprensión académica.' },
  { id: 'btl007', comp: 'comp_btl_4', type: 'mc', difficulty: 1, q: '¿Qué debe incluir una nota formal a los padres en español?', choices: ['Solo el nombre', 'Saludo apropiado, mensaje claro y despedida', 'Solo la fecha', 'Lenguaje informal solo'], answer: 'Saludo apropiado, mensaje claro y despedida', explanation: 'Una nota formal incluye saludo, mensaje claro y cierre apropiado.' },
  { id: 'btl008', comp: 'comp_btl_4', type: 'mc', difficulty: 2, q: 'Al redactar un informe de progreso en español, es importante:', choices: ['Usar solo abreviaturas', 'Ser claro, preciso y usar la convención apropiada', 'Evitar detalles', 'Solo listar calificaciones'], answer: 'Ser claro, preciso y usar la convención apropiada', explanation: 'Claridad, precisión y convención apoyan la comunicación profesional.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Mathematics 4–8 (115) — Domains & Question Bank
// 6 domains, grades 4–8 content
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_48 = [
  { id: 'comp48_1', name: 'Number Concepts', desc: 'Number systems, operations, number theory (grades 4–8).', weight: 0.16, games: ['math-match', 'math-sprint', 'q-blocks', 'fraction-pizza', 'fraction-frenzy', 'number-line-ninja'],
    video: 'https://www.youtube.com/embed/Bz4RUgka_Ew',
    videos: ['https://www.youtube.com/embed/Bz4RUgka_Ew', 'https://www.youtube.com/embed/BpBh8gvMifs', 'https://www.youtube.com/embed/CLWpkv6ccpA'] },
  { id: 'comp48_2', name: 'Patterns and Algebra', desc: 'Patterns, functions, algebraic reasoning (grades 4–8).', weight: 0.21, games: ['math-sprint', 'equation-balance', 'math-maze', 'q-blocks', 'math-match', 'teks-crush'],
    video: 'https://www.youtube.com/embed/NybHckSEQBI',
    videos: ['https://www.youtube.com/embed/NybHckSEQBI', 'https://www.youtube.com/embed/bAerID24QJ0', 'https://www.youtube.com/embed/LzYJVsvqS50'] },
  { id: 'comp48_3', name: 'Geometry and Measurement', desc: 'Geometric properties, measurement (grades 4–8).', weight: 0.21, games: ['shape-shifter', 'graph-explorer', 'number-line-ninja', 'time-traveler', 'math-sprint'],
    video: 'https://www.youtube.com/embed/V3dFHt9p5W4',
    videos: ['https://www.youtube.com/embed/V3dFHt9p5W4', 'https://www.youtube.com/embed/AA6RfgP-AHU', 'https://www.youtube.com/embed/EINpkcphsPQ'] },
  { id: 'comp48_4', name: 'Probability and Statistics', desc: 'Probability, statistics, data analysis (grades 4–8).', weight: 0.16, games: ['math-sprint', 'graph-explorer', 'math-jeopardy', 'math-millionaire'],
    video: 'https://www.youtube.com/embed/uAxyI_XfqXk',
    videos: ['https://www.youtube.com/embed/uAxyI_XfqXk', 'https://www.youtube.com/embed/hgtMWR3TFnY', 'https://www.youtube.com/embed/S5_5KyCVjrU'] },
  { id: 'comp48_5', name: 'Mathematical Processes and Perspectives', desc: 'Reasoning, problem solving, connections.', weight: 0.10, games: ['math-maze', 'teks-crush', 'crosses-knots', 'math-sprint'],
    video: 'https://www.youtube.com/embed/ZZQO3HGkFa8',
    videos: ['https://www.youtube.com/embed/ZZQO3HGkFa8', 'https://www.youtube.com/embed/wblW_M_HVQ8', 'https://www.youtube.com/embed/VMEV__2wW3E'] },
  { id: 'comp48_6', name: 'Mathematical Learning, Instruction and Assessment', desc: 'Pedagogy, assessment, equity.', weight: 0.16, games: ['math-sprint', 'math-match', 'fraction-frenzy'],
    video: 'https://www.youtube.com/embed/jxA8MffVmPs',
    videos: ['https://www.youtube.com/embed/jxA8MffVmPs', 'https://www.youtube.com/embed/tuVd355R-OQ', 'https://www.youtube.com/embed/2OU-pb7CCT0'] },
];

export const TEXES_QUESTIONS_48 = [
  // Domain I: Number Concepts (comp48_1)
  { id: 't48_001', comp: 'comp48_1', type: 'mc', difficulty: 1, q: 'Which fraction is equivalent to 0.375?', choices: ['3/8', '3/5', '5/8', '2/5'], answer: '3/8', explanation: '3 ÷ 8 = 0.375.' },
  { id: 't48_002', comp: 'comp48_1', type: 'mc', difficulty: 1, q: 'What is the greatest common factor of 24 and 36?', choices: ['6', '12', '18', '24'], answer: '12', explanation: 'Factors of 24: 1,2,3,4,6,8,12,24. Of 36: 1,2,3,4,6,9,12,18,36. GCF = 12.' },
  { id: 't48_003', comp: 'comp48_1', type: 'mc', difficulty: 1, q: 'Order from least to greatest: 2/3, 3/4, 5/6.', choices: ['2/3, 3/4, 5/6', '5/6, 3/4, 2/3', '2/3, 5/6, 3/4', '3/4, 2/3, 5/6'], answer: '2/3, 3/4, 5/6', explanation: 'Common denominator 12: 2/3=8/12, 3/4=9/12, 5/6=10/12. So 8/12 < 9/12 < 10/12.' },
  { id: 't48_004', comp: 'comp48_1', type: 'mc', difficulty: 2, q: 'A student says 0.3 × 0.2 = 0.6. What is the best way to correct the misconception?', choices: ['Show 3/10 × 2/10 = 6/100 = 0.06', 'Use a calculator', 'Memorize the rule', 'Round to whole numbers'], answer: 'Show 3/10 × 2/10 = 6/100 = 0.06', explanation: 'Connecting decimals to fractions (tenths × tenths = hundredths) builds understanding.' },
  { id: 't48_005', comp: 'comp48_1', type: 'mc', difficulty: 1, q: 'Which number is prime?', choices: ['21', '23', '25', '27'], answer: '23', explanation: '23 has no factors other than 1 and 23. 21=3×7, 25=5×5, 27=3×9.' },
  { id: 't48_006', comp: 'comp48_1', type: 'mc', difficulty: 2, q: 'Express 5/6 as a decimal rounded to the nearest hundredth.', choices: ['0.83', '0.84', '0.85', '0.86'], answer: '0.83', explanation: '5 ÷ 6 = 0.8333... Rounded to hundredths: 0.83.' },
  { id: 't48_007', comp: 'comp48_1', type: 'mc', difficulty: 1, q: 'What is the least common multiple of 6 and 10?', choices: ['30', '60', '2', '20'], answer: '30', explanation: 'LCM(6, 10) = 30. 6 = 2×3, 10 = 2×5; LCM = 2×3×5 = 30.' },
  { id: 't48_008', comp: 'comp48_1', type: 'mc', difficulty: 2, q: 'Which property is illustrated by (4 + 7) + 3 = 4 + (7 + 3)?', choices: ['Commutative', 'Associative', 'Distributive', 'Identity'], answer: 'Associative', explanation: 'Associative property of addition: grouping of addends does not change the sum.' },
  { id: 't48_009', comp: 'comp48_1', type: 'mc', difficulty: 1, q: 'Round 47.856 to the nearest tenth.', choices: ['47.8', '47.9', '48.0', '47.86'], answer: '47.9', explanation: 'The hundredths digit is 5, so round up: 47.9.' },
  { id: 't48_010', comp: 'comp48_1', type: 'mc', difficulty: 2, q: 'Which is the best representation for teaching that 3/4 = 6/8?', choices: ['Number line with both fractions marked', 'Two equivalent fraction bars or circles', 'Only the symbolic equation', 'Memorization only'], answer: 'Two equivalent fraction bars or circles', explanation: 'Visual models show that the same amount is shaded; multiplying numerator and denominator by 2 gives an equivalent fraction.' },

  // Domain II: Patterns and Algebra (comp48_2)
  { id: 't48_011', comp: 'comp48_2', type: 'mc', difficulty: 1, q: 'What is the next number in the pattern: 2, 5, 8, 11, ___?', choices: ['13', '14', '15', '16'], answer: '14', explanation: 'Arithmetic sequence with common difference 3. 11 + 3 = 14.' },
  { id: 't48_012', comp: 'comp48_2', type: 'mc', difficulty: 1, q: 'Solve for n: 4n + 7 = 27', choices: ['n = 4', 'n = 5', 'n = 6', 'n = 7'], answer: 'n = 5', explanation: '4n = 20, so n = 5.' },
  { id: 't48_013', comp: 'comp48_2', type: 'mc', difficulty: 2, q: 'Which equation represents "5 less than twice a number is 13"?', choices: ['2x − 5 = 13', '5 − 2x = 13', '2(x − 5) = 13', '5x − 2 = 13'], answer: '2x − 5 = 13', explanation: 'Twice a number is 2x; 5 less than that is 2x − 5 = 13.' },
  { id: 't48_014', comp: 'comp48_2', type: 'mc', difficulty: 1, q: 'Find the slope of the line through (1, 2) and (4, 8).', choices: ['2', '3', '4', '6'], answer: '2', explanation: 'Slope = (8 − 2)/(4 − 1) = 6/3 = 2.' },
  { id: 't48_015', comp: 'comp48_2', type: 'mc', difficulty: 2, q: 'Simplify: 3(2x − 4) + 2(x + 1)', choices: ['8x − 10', '8x − 2', '6x − 10', '5x − 2'], answer: '8x − 10', explanation: '3(2x−4) + 2(x+1) = 6x − 12 + 2x + 2 = 8x − 10.' },
  { id: 't48_016', comp: 'comp48_2', type: 'mc', difficulty: 2, q: 'Which table shows a linear relationship?', choices: ['x: 1,2,3,4 and y: 2,4,8,16', 'x: 1,2,3,4 and y: 3,5,7,9', 'x: 1,2,3,4 and y: 1,4,9,16', 'x: 1,2,3,4 and y: 2,3,5,8'], answer: 'x: 1,2,3,4 and y: 3,5,7,9', explanation: 'y increases by 2 each time (constant rate of change); y = 2x + 1.' },
  { id: 't48_017', comp: 'comp48_2', type: 'mc', difficulty: 1, q: 'What is the 8th term in the sequence 5, 8, 11, 14, ...?', choices: ['26', '27', '28', '29'], answer: '26', explanation: 'Arithmetic: aₙ = a₁ + (n − 1) · d = 5 + (n − 1)(3). a₈ = 5 + 21 = 26.' },
  { id: 't48_018', comp: 'comp48_2', type: 'mc', difficulty: 2, q: 'Solve: 2(x − 3) = x + 4', choices: ['x = 7', 'x = 10', 'x = 4', 'x = 5'], answer: 'x = 10', explanation: '2x − 6 = x + 4 → x = 10.' },
  { id: 't48_019', comp: 'comp48_2', type: 'mc', difficulty: 2, q: 'Which expression is equivalent to 15 − 3(4 − x)?', choices: ['3x + 3', '3x − 3', '27 − 3x', '3 − 3x'], answer: '3x + 3', explanation: '15 − 12 + 3x = 3 + 3x = 3x + 3.' },
  { id: 't48_020', comp: 'comp48_2', type: 'mc', difficulty: 1, q: 'If y = 3x − 2, what is y when x = 4?', choices: ['10', '12', '14', '6'], answer: '10', explanation: 'y = 3(4) − 2 = 12 − 2 = 10.' },

  // Domain III: Geometry and Measurement (comp48_3)
  { id: 't48_021', comp: 'comp48_3', type: 'mc', difficulty: 1, q: 'What is the area of a rectangle with length 8 cm and width 5 cm?', choices: ['13 cm²', '26 cm²', '40 cm²', '80 cm²'], answer: '40 cm²', explanation: 'Area = length × width = 8 × 5 = 40 cm².' },
  { id: 't48_022', comp: 'comp48_3', type: 'mc', difficulty: 1, q: 'How many faces does a rectangular prism have?', choices: ['4', '6', '8', '12'], answer: '6', explanation: 'A rectangular prism has 6 faces (top, bottom, front, back, left, right).' },
  { id: 't48_023', comp: 'comp48_3', type: 'mc', difficulty: 2, q: 'The area of a triangle is 24 square units. If the base is 8 units, what is the height?', choices: ['3', '6', '4', '12'], answer: '6', explanation: 'A = ½bh → 24 = ½(8)h → h = 6.' },
  { id: 't48_024', comp: 'comp48_3', type: 'mc', difficulty: 1, q: 'What is the perimeter of a square with side length 7 m?', choices: ['14 m', '28 m', '49 m', '7 m'], answer: '28 m', explanation: 'Perimeter = 4 × side = 4 × 7 = 28 m.' },
  { id: 't48_025', comp: 'comp48_3', type: 'mc', difficulty: 2, q: 'A circle has radius 5. What is its circumference? (Use π = 3.14)', choices: ['15.7', '31.4', '78.5', '25'], answer: '31.4', explanation: 'C = 2πr = 2(3.14)(5) = 31.4.' },
  { id: 't48_026', comp: 'comp48_3', type: 'mc', difficulty: 2, q: 'Two triangles are similar. The scale factor is 2. If the smaller has perimeter 12, what is the larger perimeter?', choices: ['24', '6', '14', '36'], answer: '24', explanation: 'Perimeter scales by the same factor. 12 × 2 = 24.' },
  { id: 't48_027', comp: 'comp48_3', type: 'mc', difficulty: 1, q: 'Which angle measure is obtuse?', choices: ['45°', '90°', '120°', '180°'], answer: '120°', explanation: 'Obtuse angles are greater than 90° and less than 180°. 120° is obtuse.' },
  { id: 't48_028', comp: 'comp48_3', type: 'mc', difficulty: 2, q: 'Convert 3.5 km to meters.', choices: ['35 m', '350 m', '3500 m', '0.0035 m'], answer: '3500 m', explanation: '1 km = 1000 m, so 3.5 km = 3500 m.' },
  { id: 't48_029', comp: 'comp48_3', type: 'mc', difficulty: 1, q: 'What is the volume of a box that is 4 ft by 3 ft by 2 ft?', choices: ['9 ft³', '24 ft³', '14 ft³', '12 ft³'], answer: '24 ft³', explanation: 'V = l × w × h = 4 × 3 × 2 = 24 ft³.' },
  { id: 't48_030', comp: 'comp48_3', type: 'mc', difficulty: 2, q: 'A trapezoid has bases 6 and 10 and height 4. What is its area?', choices: ['32', '40', '24', '16'], answer: '32', explanation: 'A = ½(b1 + b2)h = ½(6 + 10)(4) = 32.' },

  // Domain IV: Probability and Statistics (comp48_4)
  { id: 't48_031', comp: 'comp48_4', type: 'mc', difficulty: 1, q: 'A bag has 4 red and 6 blue marbles. What is P(drawing a red marble)?', choices: ['4/10', '6/10', '4/6', '1/4'], answer: '4/10', explanation: 'P(red) = number of red / total = 4/10.' },
  { id: 't48_032', comp: 'comp48_4', type: 'mc', difficulty: 1, q: 'Find the median of: 3, 7, 8, 10, 14', choices: ['7', '8', '7.5', '10'], answer: '8', explanation: 'Middle value when ordered is 8.' },
  { id: 't48_033', comp: 'comp48_4', type: 'mc', difficulty: 2, q: 'The mean of five numbers is 12. The sum of four of them is 45. What is the fifth number?', choices: ['15', '12', '10', '9'], answer: '15', explanation: 'Total for 5 numbers = 12 × 5 = 60. Fifth = 60 − 45 = 15.' },
  { id: 't48_034', comp: 'comp48_4', type: 'mc', difficulty: 1, q: 'A spinner has 4 equal sections. What is P(landing on section 1)?', choices: ['1/4', '1/2', '4', '1'], answer: '1/4', explanation: 'One favorable outcome out of 4 equally likely: 1/4.' },
  { id: 't48_035', comp: 'comp48_4', type: 'mc', difficulty: 2, q: 'Which measure is most affected by an outlier?', choices: ['Median', 'Mode', 'Mean', 'Range'], answer: 'Mean', explanation: 'The mean uses every value, so one extreme value can shift it greatly.' },
  { id: 't48_036', comp: 'comp48_4', type: 'mc', difficulty: 2, q: 'Data: 2, 4, 4, 6, 8. What is the range?', choices: ['4', '6', '8', '5'], answer: '6', explanation: 'Range = max − min = 8 − 2 = 6.' },
  { id: 't48_037', comp: 'comp48_4', type: 'mc', difficulty: 1, q: 'A coin is flipped twice. What is P(two heads)?', choices: ['1/4', '1/2', '1', '1/3'], answer: '1/4', explanation: 'P(HH) = ½ × ½ = 1/4.' },
  { id: 't48_038', comp: 'comp48_4', type: 'mc', difficulty: 2, q: 'Which graph best shows change over time?', choices: ['Bar graph', 'Line graph', 'Pie chart', 'Pictograph'], answer: 'Line graph', explanation: 'Line graphs are often used to show trends and change over time.' },
  { id: 't48_039', comp: 'comp48_4', type: 'mc', difficulty: 1, q: 'What is the mode of 3, 5, 5, 7, 5, 9?', choices: ['5', '5.67', '6', '3'], answer: '5', explanation: '5 appears most often (3 times).' },
  { id: 't48_040', comp: 'comp48_4', type: 'mc', difficulty: 2, q: 'A class has 20 students. 12 are girls. If one is chosen at random, P(boy)?', choices: ['8/20', '12/20', '1/2', '8/12'], answer: '8/20', explanation: 'P(boy) = 8/20 = 2/5.' },

  // Domain V: Mathematical Processes (comp48_5)
  { id: 't48_041', comp: 'comp48_5', type: 'mc', difficulty: 2, q: 'Which step uses the additive identity?', choices: ['5 + 0 = 5', '5 × 1 = 5', '5 + (−5) = 0', '3(5 + 2) = 15 + 6'], answer: '5 + 0 = 5', explanation: 'Additive identity: a + 0 = a. So 5 + 0 = 5.' },
  { id: 't48_042', comp: 'comp48_5', type: 'mc', difficulty: 2, q: 'A student solves 3x = 12 by guessing 4. How could you reinforce the operation?', choices: ['"What operation undoes multiplication?"', 'Just mark it correct', 'Give more problems', 'Use a calculator'], answer: '"What operation undoes multiplication?"', explanation: 'Connecting to inverse operations (division) builds algebraic understanding.' },
  { id: 't48_043', comp: 'comp48_5', type: 'mc', difficulty: 2, q: 'Which is an example of deductive reasoning?', choices: ['Every even number I tried is divisible by 2; so all evens are.', 'All multiples of 4 are even. 12 is a multiple of 4. So 12 is even.', 'I drew 3 triangles; each had 180°.', 'The pattern 2,4,6 suggests the next is 8.'], answer: 'All multiples of 4 are even. 12 is a multiple of 4. So 12 is even.', explanation: 'Deductive reasoning: from general principle to specific conclusion.' },
  { id: 't48_044', comp: 'comp48_5', type: 'mc', difficulty: 1, q: 'Which property justifies 7 + 3 = 3 + 7?', choices: ['Associative', 'Commutative', 'Distributive', 'Identity'], answer: 'Commutative', explanation: 'Commutative property of addition: order of addends does not change the sum.' },
  { id: 't48_045', comp: 'comp48_5', type: 'mc', difficulty: 2, q: 'What does "mathematical modeling" emphasize?', choices: ['Memorizing formulas', 'Using real-world contexts to formulate and solve', 'Only drill', 'Calculator use only'], answer: 'Using real-world contexts to formulate and solve', explanation: 'Modeling connects math to real situations: represent, solve, interpret.' },

  // Domain VI: Learning, Instruction, Assessment (comp48_6)
  { id: 't48_046', comp: 'comp48_6', type: 'mc', difficulty: 2, q: 'Which formative assessment is most useful during a lesson?', choices: ['End-of-unit test only', 'Exit ticket or quick check', 'Final exam', 'Homework grade only'], answer: 'Exit ticket or quick check', explanation: 'Formative assessment during instruction helps adjust teaching in real time.' },
  { id: 't48_047', comp: 'comp48_6', type: 'mc', difficulty: 2, q: 'A student consistently adds denominators when adding fractions. What should the teacher do first?', choices: ['Assign more practice', 'Use visual models to show same-sized parts', 'Move on', 'Only correct the answer'], answer: 'Use visual models to show same-sized parts', explanation: 'Addressing the misconception (common denominator, not adding denominators) with visuals builds understanding.' },
  { id: 't48_048', comp: 'comp48_6', type: 'mc', difficulty: 2, q: 'Which strategy supports English learners in math?', choices: ['Only oral instruction', 'Visuals, manipulatives, and clear vocabulary', 'Faster pacing', 'Avoiding word problems'], answer: 'Visuals, manipulatives, and clear vocabulary', explanation: 'Multiple representations and explicit vocabulary support access for ELs.' },
  { id: 't48_049', comp: 'comp48_6', type: 'mc', difficulty: 2, q: 'What is the main purpose of a number talk?', choices: ['To grade speed', 'To build fluency and flexible strategies through discussion', 'To replace instruction', 'To test only'], answer: 'To build fluency and flexible strategies through discussion', explanation: 'Number talks emphasize mental strategies and sharing reasoning.' },
  { id: 't48_050', comp: 'comp48_6', type: 'mc', difficulty: 2, q: 'Differentiation in math class should primarily address:', choices: ['Only readiness', 'Readiness, interest, and learning profile', 'Only interest', 'Slower pace for all'], answer: 'Readiness, interest, and learning profile', explanation: 'Differentiation considers what students need, what engages them, and how they learn best.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Core Subjects EC-6 (291) — Mathematics Section
// 47 questions, 60 min. Grades EC–6 math content + instruction
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_EC6 = [
  { id: 'comp_ec6_1', name: 'Mathematical Processes', desc: 'Reasoning, problem solving, connections (EC–6).', weight: 0.17, games: ['math-maze', 'teks-crush', 'crosses-knots', 'math-sprint'] },
  { id: 'comp_ec6_2', name: 'Probability and Statistics', desc: 'Data, probability, graphs (EC–6).', weight: 0.17, games: ['graph-explorer', 'math-sprint', 'math-jeopardy'] },
  { id: 'comp_ec6_3', name: 'Geometry and Measurement', desc: 'Shapes, measurement, spatial reasoning (EC–6).', weight: 0.17, games: ['shape-shifter', 'time-traveler', 'number-line-ninja', 'math-sprint'] },
  { id: 'comp_ec6_4', name: 'Patterns and Algebra', desc: 'Patterns, operations, algebraic thinking (EC–6).', weight: 0.21, games: ['equation-balance', 'math-maze', 'q-blocks', 'math-match'] },
  { id: 'comp_ec6_5', name: 'Number Concepts and Operations', desc: 'Number sense, operations, fractions (EC–6).', weight: 0.17, games: ['math-sprint', 'fraction-pizza', 'fraction-frenzy', 'speed-builder', 'qbot-shop'] },
  { id: 'comp_ec6_6', name: 'Mathematics Instruction', desc: 'Pedagogy, assessment, differentiation (EC–6).', weight: 0.11, games: ['math-sprint', 'fraction-frenzy', 'math-match'] },
];

export const TEXES_QUESTIONS_EC6 = [
  // Mathematical Processes (comp_ec6_1)
  { id: 'ec6_01', comp: 'comp_ec6_1', type: 'mc', difficulty: 1, q: 'Which property is shown by 4 + 0 = 4?', choices: ['Commutative', 'Associative', 'Identity (addition)', 'Distributive'], answer: 'Identity (addition)', explanation: 'Additive identity: adding 0 does not change the number.' },
  { id: 'ec6_02', comp: 'comp_ec6_1', type: 'mc', difficulty: 1, q: 'A first grader says 7 + 5 = 11. What is the best next step?', choices: ['Mark wrong and move on', 'Use counters or a number line to count together', 'Give more worksheets', 'Tell them to memorize'], answer: 'Use counters or a number line to count together', explanation: 'Concrete tools help students build number sense and correct the count.' },
  { id: 'ec6_03', comp: 'comp_ec6_1', type: 'mc', difficulty: 2, q: 'Which is an example of inductive reasoning?', choices: ['All squares are rectangles. This is a square. So it is a rectangle.', 'I drew 3 triangles; each had 3 sides. So all triangles have 3 sides.', '2 + 3 = 5 by definition of addition.', 'If it rains, the ground gets wet.'], answer: 'I drew 3 triangles; each had 3 sides. So all triangles have 3 sides.', explanation: 'Inductive reasoning: drawing a general conclusion from specific examples.' },
  { id: 'ec6_04', comp: 'comp_ec6_1', type: 'mc', difficulty: 2, q: 'What does "mathematical modeling" mean in K–6?', choices: ['Memorizing formulas only', 'Using real-world situations to represent and solve problems', 'Using a calculator only', 'Drill only'], answer: 'Using real-world situations to represent and solve problems', explanation: 'Modeling connects math to contexts: represent with pictures or equations, solve, interpret.' },
  { id: 'ec6_05', comp: 'comp_ec6_1', type: 'mc', difficulty: 1, q: 'Which justifies 6 × 3 = 3 × 6?', choices: ['Associative property', 'Commutative property', 'Distributive property', 'Identity property'], answer: 'Commutative property', explanation: 'Commutative property of multiplication: order of factors does not change the product.' },
  { id: 'ec6_06', comp: 'comp_ec6_1', type: 'mc', difficulty: 2, q: 'A student says the sum of two odd numbers is always odd. How do you respond?', choices: ['Agree', 'Have them test 3 + 5, 7 + 9 and look for a pattern', 'Tell them the rule only', 'Skip it'], answer: 'Have them test 3 + 5, 7 + 9 and look for a pattern', explanation: 'Testing examples helps students discover that odd + odd = even.' },
  { id: 'ec6_07', comp: 'comp_ec6_1', type: 'mc', difficulty: 2, q: 'What is "productive struggle"?', choices: ['Letting students fail without support', 'Challenging tasks with appropriate support so students make sense and persist', 'Only easy problems', 'Timed drills only'], answer: 'Challenging tasks with appropriate support so students make sense and persist', explanation: 'Productive struggle balances challenge with scaffolding to build understanding.' },
  { id: 'ec6_08', comp: 'comp_ec6_1', type: 'mc', difficulty: 1, q: 'Which shows the associative property of addition?', choices: ['2 + 3 = 3 + 2', '(2 + 3) + 4 = 2 + (3 + 4)', '2(3 + 4) = 2(3) + 2(4)', '5 + 0 = 5'], answer: '(2 + 3) + 4 = 2 + (3 + 4)', explanation: 'Associative: grouping of addends does not change the sum.' },

  // Probability and Statistics (comp_ec6_2)
  { id: 'ec6_09', comp: 'comp_ec6_2', type: 'mc', difficulty: 1, q: 'A bag has 3 red and 5 blue marbles. What is P(red)?', choices: ['3/8', '5/8', '3/5', '1/2'], answer: '3/8', explanation: 'P(red) = 3 favorable / 8 total = 3/8.' },
  { id: 'ec6_10', comp: 'comp_ec6_2', type: 'mc', difficulty: 1, q: 'Find the median of 2, 5, 7, 8, 12.', choices: ['5', '6.8', '7', '8'], answer: '7', explanation: 'Median is the middle value when ordered: 7.' },
  { id: 'ec6_11', comp: 'comp_ec6_2', type: 'mc', difficulty: 1, q: 'Which graph is best for comparing categories?', choices: ['Line graph', 'Bar graph', 'Number line', 'Table only'], answer: 'Bar graph', explanation: 'Bar graphs are effective for comparing counts or values across categories.' },
  { id: 'ec6_12', comp: 'comp_ec6_2', type: 'mc', difficulty: 2, q: 'A class voted for favorite fruit: 8 apple, 6 banana, 4 orange. What is the mode?', choices: ['6', 'apple', '8', '18'], answer: 'apple', explanation: 'Mode is the value that appears most often: apple (8 votes).' },
  { id: 'ec6_13', comp: 'comp_ec6_2', type: 'mc', difficulty: 1, q: 'A spinner has 5 equal sections. P(landing on one specific section)?', choices: ['1/5', '5', '1', '1/2'], answer: '1/5', explanation: 'One favorable outcome out of 5 equally likely: 1/5.' },
  { id: 'ec6_14', comp: 'comp_ec6_2', type: 'mc', difficulty: 2, q: 'Data: 4, 6, 6, 8, 10. What is the range?', choices: ['6', '6.8', '4', '10'], answer: '6', explanation: 'Range = max − min = 10 − 4 = 6.' },
  { id: 'ec6_15', comp: 'comp_ec6_2', type: 'mc', difficulty: 2, q: 'Which measure is most affected by one very large value?', choices: ['Median', 'Mode', 'Mean', 'Range'], answer: 'Mean', explanation: 'The mean includes every value, so one outlier can change it a lot.' },
  { id: 'ec6_16', comp: 'comp_ec6_2', type: 'mc', difficulty: 1, q: 'A coin is flipped. P(heads)?', choices: ['1/2', '1', '0', '1/4'], answer: '1/2', explanation: 'Two equally likely outcomes; P(heads) = 1/2.' },

  // Geometry and Measurement (comp_ec6_3)
  { id: 'ec6_17', comp: 'comp_ec6_3', type: 'mc', difficulty: 1, q: 'How many sides does a hexagon have?', choices: ['5', '6', '7', '8'], answer: '6', explanation: 'A hexagon has 6 sides.' },
  { id: 'ec6_18', comp: 'comp_ec6_3', type: 'mc', difficulty: 1, q: 'What is the area of a rectangle 7 cm by 4 cm?', choices: ['11 cm²', '22 cm²', '28 cm²', '14 cm²'], answer: '28 cm²', explanation: 'Area = length × width = 7 × 4 = 28 cm².' },
  { id: 'ec6_19', comp: 'comp_ec6_3', type: 'mc', difficulty: 1, q: 'Which shape has exactly 4 right angles?', choices: ['Triangle', 'Pentagon', 'Square', 'Hexagon'], answer: 'Square', explanation: 'A square has 4 sides and 4 right angles.' },
  { id: 'ec6_20', comp: 'comp_ec6_3', type: 'mc', difficulty: 2, q: 'A rectangle has perimeter 24 cm. If the length is 8 cm, what is the width?', choices: ['4 cm', '8 cm', '6 cm', '16 cm'], answer: '4 cm', explanation: 'P = 2(l + w). 24 = 2(8 + w) → 12 = 8 + w → w = 4.' },
  { id: 'ec6_21', comp: 'comp_ec6_3', type: 'mc', difficulty: 1, q: 'How many minutes are in 2 hours?', choices: ['60', '120', '90', '200'], answer: '120', explanation: '2 × 60 = 120 minutes.' },
  { id: 'ec6_22', comp: 'comp_ec6_3', type: 'mc', difficulty: 2, q: 'A triangle has base 10 and height 4. What is its area?', choices: ['14', '20', '40', '5'], answer: '20', explanation: 'Area = ½ × base × height = ½(10)(4) = 20.' },
  { id: 'ec6_23', comp: 'comp_ec6_3', type: 'mc', difficulty: 1, q: 'Which is a characteristic of a cube?', choices: ['6 faces, all squares', '4 faces', '8 faces', 'Circular base'], answer: '6 faces, all squares', explanation: 'A cube has 6 congruent square faces.' },
  { id: 'ec6_24', comp: 'comp_ec6_3', type: 'mc', difficulty: 2, q: 'Convert 3 feet to inches.', choices: ['36 inches', '12 inches', '30 inches', '24 inches'], answer: '36 inches', explanation: '1 ft = 12 in, so 3 ft = 36 in.' },

  // Patterns and Algebra (comp_ec6_4)
  { id: 'ec6_25', comp: 'comp_ec6_4', type: 'mc', difficulty: 1, q: 'What is the next number: 2, 4, 6, 8, ___?', choices: ['9', '10', '12', '14'], answer: '10', explanation: 'Pattern: add 2 each time. 8 + 2 = 10.' },
  { id: 'ec6_26', comp: 'comp_ec6_4', type: 'mc', difficulty: 1, q: 'Solve: 5 + n = 12', choices: ['n = 6', 'n = 7', 'n = 17', 'n = 8'], answer: 'n = 7', explanation: 'n = 12 − 5 = 7.' },
  { id: 'ec6_27', comp: 'comp_ec6_4', type: 'mc', difficulty: 2, q: 'Which equation matches "twice a number plus 3 is 11"?', choices: ['2 + 3n = 11', '2n + 3 = 11', '2(n + 3) = 11', 'n + 5 = 11'], answer: '2n + 3 = 11', explanation: 'Twice a number is 2n; plus 3 gives 2n + 3 = 11.' },
  { id: 'ec6_28', comp: 'comp_ec6_4', type: 'mc', difficulty: 1, q: 'Complete: 3, 6, 9, 12, ___', choices: ['14', '15', '16', '18'], answer: '15', explanation: 'Add 3 each time. 12 + 3 = 15.' },
  { id: 'ec6_29', comp: 'comp_ec6_4', type: 'mc', difficulty: 2, q: 'Simplify: 2 × (4 + 3)', choices: ['11', '14', '8', '9'], answer: '14', explanation: '2 × 7 = 14. Or distributive: 2(4) + 2(3) = 8 + 6 = 14.' },
  { id: 'ec6_30', comp: 'comp_ec6_4', type: 'mc', difficulty: 1, q: 'If 4 boxes have 20 crayons total, how many in one box?', choices: ['4', '5', '6', '24'], answer: '5', explanation: '20 ÷ 4 = 5 crayons per box.' },
  { id: 'ec6_31', comp: 'comp_ec6_4', type: 'mc', difficulty: 2, q: 'Which input-output rule fits: in 2 → out 6; in 3 → out 9?', choices: ['Add 4', 'Multiply by 2', 'Multiply by 3', 'Add 3'], answer: 'Multiply by 3', explanation: '2×3=6, 3×3=9. Rule: multiply by 3.' },
  { id: 'ec6_32', comp: 'comp_ec6_4', type: 'mc', difficulty: 2, q: 'Solve: 3n − 2 = 10', choices: ['n = 2', 'n = 4', 'n = 3', 'n = 6'], answer: 'n = 4', explanation: '3n = 12, so n = 4.' },
  { id: 'ec6_33', comp: 'comp_ec6_4', type: 'mc', difficulty: 1, q: 'What is 7 × 8?', choices: ['54', '56', '64', '15'], answer: '56', explanation: '7 × 8 = 56.' },
  { id: 'ec6_34', comp: 'comp_ec6_4', type: 'mc', difficulty: 2, q: 'A number doubled plus 5 equals 17. What is the number?', choices: ['6', '11', '7', '12'], answer: '6', explanation: '2n + 5 = 17 → 2n = 12 → n = 6.' },

  // Number Concepts and Operations (comp_ec6_5)
  { id: 'ec6_35', comp: 'comp_ec6_5', type: 'mc', difficulty: 1, q: 'Which fraction is equivalent to 1/2?', choices: ['2/4', '1/4', '3/4', '2/3'], answer: '2/4', explanation: '1/2 = 2/4 (multiply numerator and denominator by 2).' },
  { id: 'ec6_36', comp: 'comp_ec6_5', type: 'mc', difficulty: 1, q: 'Round 3,847 to the nearest hundred.', choices: ['3,800', '3,900', '4,000', '3,850'], answer: '3,800', explanation: 'The tens digit is 4, so round down: 3,800.' },
  { id: 'ec6_37', comp: 'comp_ec6_5', type: 'mc', difficulty: 1, q: 'What is 1/4 + 1/4?', choices: ['1/8', '2/4 or 1/2', '2/8', '1/2 only'], answer: '2/4 or 1/2', explanation: 'Same denominator: 1/4 + 1/4 = 2/4 = 1/2.' },
  { id: 'ec6_38', comp: 'comp_ec6_5', type: 'mc', difficulty: 2, q: 'Which is the best way to teach why 3/4 > 1/2?', choices: ['Memorize only', 'Use fraction bars or circles to show 3/4 and 1/2', 'Only symbols', 'Calculator only'], answer: 'Use fraction bars or circles to show 3/4 and 1/2', explanation: 'Visual models show that 3 parts out of 4 is more than 1 part out of 2.' },
  { id: 'ec6_39', comp: 'comp_ec6_5', type: 'mc', difficulty: 1, q: 'What is the value of the 5 in 35,291?', choices: ['5', '50', '500', '5,000'], answer: '5,000', explanation: 'The 5 is in the thousands place: 5 × 1,000 = 5,000.' },
  { id: 'ec6_40', comp: 'comp_ec6_5', type: 'mc', difficulty: 2, q: 'Express 0.25 as a fraction in simplest form.', choices: ['25/100', '1/4', '2/5', '1/25'], answer: '1/4', explanation: '0.25 = 25/100 = 1/4.' },
  { id: 'ec6_41', comp: 'comp_ec6_5', type: 'mc', difficulty: 1, q: 'Which number is composite?', choices: ['11', '13', '15', '17'], answer: '15', explanation: '15 = 3 × 5, so it is composite. The others are prime.' },
  { id: 'ec6_42', comp: 'comp_ec6_5', type: 'mc', difficulty: 2, q: 'A student adds denominators when adding 1/3 + 1/4. What misconception is this?', choices: ['They understand common denominators', 'They think you add denominators like whole numbers', 'They are multiplying', 'They are subtracting'], answer: 'They think you add denominators like whole numbers', explanation: 'Adding denominators (1/3+1/4=2/7) ignores the need for a common denominator.' },

  // Mathematics Instruction (comp_ec6_6)
  { id: 'ec6_43', comp: 'comp_ec6_6', type: 'mc', difficulty: 2, q: 'What is the main purpose of using manipulatives in K–6 math?', choices: ['To replace all symbolic work', 'To build concrete understanding before abstract symbols', 'To save time', 'To avoid word problems'], answer: 'To build concrete understanding before abstract symbols', explanation: 'Manipulatives help students connect ideas to symbols (CRA: concrete → representational → abstract).' },
  { id: 'ec6_44', comp: 'comp_ec6_6', type: 'mc', difficulty: 2, q: 'Which is an example of formative assessment?', choices: ['End-of-year test only', 'Exit ticket or quick check during a lesson', 'Report card only', 'State test only'], answer: 'Exit ticket or quick check during a lesson', explanation: 'Formative assessment happens during instruction to inform teaching and learning.' },
  { id: 'ec6_45', comp: 'comp_ec6_6', type: 'mc', difficulty: 2, q: 'How can a teacher support English learners in math?', choices: ['Avoid visuals', 'Use visuals, manipulatives, and clear vocabulary', 'Speed up pacing', 'Avoid word problems'], answer: 'Use visuals, manipulatives, and clear vocabulary', explanation: 'Multiple representations and explicit language support access for ELs.' },
  { id: 'ec6_46', comp: 'comp_ec6_6', type: 'mc', difficulty: 2, q: 'What is a "number talk" primarily used for?', choices: ['Grading speed', 'Building mental math and flexible strategies through discussion', 'Replacing instruction', 'Testing only'], answer: 'Building mental math and flexible strategies through discussion', explanation: 'Number talks focus on strategies and reasoning, not just answers.' },
  { id: 'ec6_47', comp: 'comp_ec6_6', type: 'mc', difficulty: 2, q: 'When differentiating math instruction, a teacher should consider:', choices: ['Only student readiness', 'Readiness, interest, and how students learn best', 'Only interest', 'One pace for everyone'], answer: 'Readiness, interest, and how students learn best', explanation: 'Differentiation addresses what students need, what engages them, and learning preferences.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Core Subjects EC-6 (291) — ELA, Science, Social Studies (placeholders)
// Add question banks per TEA framework. See src/docs/TEXES-EC6-ADDING-SUBJECTS.md
// ═══════════════════════════════════════════════════════════════

export const TEXES_DOMAINS_EC6_ELA = [
  { id: 'ec6_ela_1', name: 'Reading Development', desc: 'Foundational reading, comprehension (EC–6).', weight: 0.25, games: [] },
  { id: 'ec6_ela_2', name: 'Writing and Research', desc: 'Composition, research, conventions (EC–6).', weight: 0.25, games: [] },
  { id: 'ec6_ela_3', name: 'Oral Language and Media', desc: 'Listening, speaking, media literacy (EC–6).', weight: 0.25, games: [] },
  { id: 'ec6_ela_4', name: 'ELA Instruction', desc: 'Pedagogy, assessment, differentiation (EC–6).', weight: 0.25, games: [] },
];
export const TEXES_QUESTIONS_EC6_ELA = [
  { id: 'ec6ela001', comp: 'ec6_ela_1', type: 'mc', difficulty: 1, q: 'What is phonemic awareness?', choices: ['Knowing letter names', 'The ability to hear and manipulate individual sounds in words', 'Reading fluency', 'Understanding print'], answer: 'The ability to hear and manipulate individual sounds in words', explanation: 'Phonemic awareness is the ability to recognize and manipulate phonemes.' },
  { id: 'ec6ela002', comp: 'ec6_ela_1', type: 'mc', difficulty: 2, q: 'Which strategy supports reading comprehension in the elementary grades?', choices: ['Only round-robin reading', 'Predicting, questioning, and summarizing during read-alouds', 'Avoiding discussion', 'Only silent reading'], answer: 'Predicting, questioning, and summarizing during read-alouds', explanation: 'Interactive read-alouds with strategies build comprehension.' },
  { id: 'ec6ela003', comp: 'ec6_ela_1', type: 'mc', difficulty: 1, q: 'What is the main idea of a text?', choices: ['The first sentence', 'The central point or message the author conveys', 'The title', 'The longest paragraph'], answer: 'The central point or message the author conveys', explanation: 'The main idea is the central message that the text supports.' },
  { id: 'ec6ela004', comp: 'ec6_ela_2', type: 'mc', difficulty: 1, q: 'What is the first stage of the writing process?', choices: ['Publishing', 'Prewriting/planning', 'Editing', 'Grading'], answer: 'Prewriting/planning', explanation: 'Prewriting (brainstorming, planning) is typically the first stage.' },
  { id: 'ec6ela005', comp: 'ec6_ela_2', type: 'mc', difficulty: 2, q: 'Why is revision different from editing?', choices: ['They are the same', 'Revision focuses on content and structure; editing on mechanics', 'Revision is done last only', 'Editing is more important'], answer: 'Revision focuses on content and structure; editing on mechanics', explanation: 'Revision addresses "big picture"; editing addresses grammar and conventions.' },
  { id: 'ec6ela006', comp: 'ec6_ela_2', type: 'mc', difficulty: 1, q: 'What is a topic sentence?', choices: ['The last sentence', 'A sentence that states the main idea of a paragraph', 'A question', 'The title'], answer: 'A sentence that states the main idea of a paragraph', explanation: 'The topic sentence expresses the paragraph\'s main idea.' },
  { id: 'ec6ela007', comp: 'ec6_ela_3', type: 'mc', difficulty: 1, q: 'What is active listening?', choices: ['Hearing only', 'Paying attention, understanding, and responding appropriately', 'Waiting to talk', 'Taking notes only'], answer: 'Paying attention, understanding, and responding appropriately', explanation: 'Active listening involves attention, comprehension, and response.' },
  { id: 'ec6ela008', comp: 'ec6_ela_3', type: 'mc', difficulty: 2, q: 'How can media literacy be developed in elementary grades?', choices: ['By avoiding media', 'By analyzing purpose and message in age-appropriate media', 'Only by watching', 'Only in middle school'], answer: 'By analyzing purpose and message in age-appropriate media', explanation: 'Students can analyze purpose and message with support.' },
  { id: 'ec6ela009', comp: 'ec6_ela_4', type: 'mc', difficulty: 1, q: 'What is the purpose of formative assessment in ELA?', choices: ['To grade only', 'To inform instruction and provide feedback during learning', 'To replace summative tests', 'To rank students'], answer: 'To inform instruction and provide feedback during learning', explanation: 'Formative assessment helps teachers adjust and students improve.' },
  { id: 'ec6ela010', comp: 'ec6_ela_4', type: 'mc', difficulty: 2, q: 'Which strategy supports differentiated instruction in reading?', choices: ['One text for all', 'Using varied texts, grouping, and targeted support by need', 'Avoiding groups', 'Only whole class'], answer: 'Using varied texts, grouping, and targeted support by need', explanation: 'Differentiation addresses readiness, interest, and need.' },
];

export const TEXES_DOMAINS_EC6_SCIENCE = [
  { id: 'ec6_sci_1', name: 'Life Science', desc: 'Organisms, ecosystems, life processes (EC–6).', weight: 0.33, games: [] },
  { id: 'ec6_sci_2', name: 'Physical and Earth Science', desc: 'Matter, energy, Earth systems (EC–6).', weight: 0.33, games: [] },
  { id: 'ec6_sci_3', name: 'Science Instruction', desc: 'Inquiry, safety, pedagogy (EC–6).', weight: 0.34, games: [] },
];
export const TEXES_QUESTIONS_EC6_SCIENCE = [
  { id: 'ec6sci001', comp: 'ec6_sci_1', type: 'mc', difficulty: 1, q: 'Where does photosynthesis occur in a plant?', choices: ['Roots', 'Stems', 'Leaves', 'Flowers'], answer: 'Leaves', explanation: 'Photosynthesis occurs mainly in the leaves.' },
  { id: 'ec6sci002', comp: 'ec6_sci_1', type: 'mc', difficulty: 2, q: 'What is the role of decomposers in an ecosystem?', choices: ['To produce oxygen', 'To break down dead matter and recycle nutrients', 'To prey on herbivores', 'To make food'], answer: 'To break down dead matter and recycle nutrients', explanation: 'Decomposers break down organic matter and return nutrients.' },
  { id: 'ec6sci003', comp: 'ec6_sci_1', type: 'mc', difficulty: 1, q: 'What do living things need to survive?', choices: ['Only food', 'Food, water, air, and often shelter', 'Only water', 'Only shelter'], answer: 'Food, water, air, and often shelter', explanation: 'Living things need basic requirements to survive.' },
  { id: 'ec6sci004', comp: 'ec6_sci_2', type: 'mc', difficulty: 1, q: 'What is the force that pulls objects toward Earth?', choices: ['Magnetism', 'Gravity', 'Friction', 'Inertia'], answer: 'Gravity', explanation: 'Gravity pulls objects toward Earth.' },
  { id: 'ec6sci005', comp: 'ec6_sci_2', type: 'mc', difficulty: 2, q: 'Which is a chemical change?', choices: ['Ice melting', 'Paper being cut', 'Wood burning', 'Water evaporating'], answer: 'Wood burning', explanation: 'A chemical change produces new substances.' },
  { id: 'ec6sci006', comp: 'ec6_sci_2', type: 'mc', difficulty: 1, q: 'What causes the seasons on Earth?', choices: ['Distance from the Sun', 'The tilt of Earth\'s axis', 'The Moon', 'Ocean currents'], answer: 'The tilt of Earth\'s axis', explanation: 'The tilt of Earth\'s axis causes seasonal changes.' },
  { id: 'ec6sci007', comp: 'ec6_sci_3', type: 'mc', difficulty: 1, q: 'What is the first step in the scientific method?', choices: ['Form a hypothesis', 'Ask a question or identify a problem', 'Draw conclusions', 'Communicate results'], answer: 'Ask a question or identify a problem', explanation: 'Scientific inquiry begins with a question or problem.' },
  { id: 'ec6sci008', comp: 'ec6_sci_3', type: 'mc', difficulty: 2, q: 'Why is a pre-lab safety discussion important?', choices: ['To skip the lab', 'To ensure students understand hazards and procedures', 'To replace equipment', 'To grade faster'], answer: 'To ensure students understand hazards and procedures', explanation: 'Pre-lab safety reduces risk.' },
  { id: 'ec6sci009', comp: 'ec6_sci_3', type: 'mc', difficulty: 1, q: 'What type of graph is best for showing how something changes over time?', choices: ['Pie chart', 'Bar graph', 'Line graph', 'Picture graph'], answer: 'Line graph', explanation: 'Line graphs show change over time well.' },
];

export const TEXES_DOMAINS_EC6_SOCIAL = [
  { id: 'ec6_soc_1', name: 'History and Culture', desc: 'Texas, U.S., world history (EC–6).', weight: 0.33, games: [] },
  { id: 'ec6_soc_2', name: 'Geography and Economics', desc: 'Spatial reasoning, economic concepts (EC–6).', weight: 0.33, games: [] },
  { id: 'ec6_soc_3', name: 'Government and Social Studies Instruction', desc: 'Civics, pedagogy (EC–6).', weight: 0.34, games: [] },
];
export const TEXES_QUESTIONS_EC6_SOCIAL = [
  { id: 'ec6soc001', comp: 'ec6_soc_1', type: 'mc', difficulty: 1, q: 'Which Native American group lived in teepees and followed buffalo on the Great Plains?', choices: ['Pueblo', 'Plains Indians', 'Inuit', 'Iroquois'], answer: 'Plains Indians', explanation: 'Plains Indians used teepees and depended on buffalo.' },
  { id: 'ec6soc002', comp: 'ec6_soc_1', type: 'mc', difficulty: 1, q: 'What year did Texas become a state?', choices: ['1836', '1845', '1861', '1776'], answer: '1845', explanation: 'Texas joined the United States in 1845.' },
  { id: 'ec6soc003', comp: 'ec6_soc_1', type: 'mc', difficulty: 2, q: 'Why did colonists protest British taxes before the American Revolution?', choices: ['They wanted lower prices', 'They had no representation in Parliament', 'They preferred French rule', 'They wanted to join Spain'], answer: 'They had no representation in Parliament', explanation: '"No taxation without representation" was a key grievance.' },
  { id: 'ec6soc004', comp: 'ec6_soc_1', type: 'mc', difficulty: 1, q: 'Who was the first president of the United States?', choices: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'], answer: 'George Washington', explanation: 'George Washington was the first U.S. president.' },
  { id: 'ec6soc005', comp: 'ec6_soc_1', type: 'mc', difficulty: 2, q: 'What was the main purpose of the Lewis and Clark expedition?', choices: ['To find gold', 'To explore the Louisiana Purchase and find a route to the Pacific', 'To fight Native Americans', 'To establish colonies'], answer: 'To explore the Louisiana Purchase and find a route to the Pacific', explanation: 'Jefferson sent them to map and explore the new territory.' },
  { id: 'ec6soc006', comp: 'ec6_soc_2', type: 'mc', difficulty: 1, q: 'What is the capital of Texas?', choices: ['Houston', 'Dallas', 'Austin', 'San Antonio'], answer: 'Austin', explanation: 'Austin is the state capital of Texas.' },
  { id: 'ec6soc007', comp: 'ec6_soc_2', type: 'mc', difficulty: 1, q: 'Which of these is a natural resource?', choices: ['A factory', 'Coal', 'Money', 'A road'], answer: 'Coal', explanation: 'Natural resources come from the Earth; coal is one.' },
  { id: 'ec6soc008', comp: 'ec6_soc_2', type: 'mc', difficulty: 2, q: 'What is opportunity cost?', choices: ['The price of a product', 'The value of the next best alternative given up when making a choice', 'The cost of labor', 'Tax paid by businesses'], answer: 'The value of the next best alternative given up when making a choice', explanation: 'Opportunity cost is what you give up when you choose one option.' },
  { id: 'ec6soc009', comp: 'ec6_soc_2', type: 'mc', difficulty: 1, q: 'What do we call the study of where places are and why they are there?', choices: ['History', 'Geography', 'Economics', 'Government'], answer: 'Geography', explanation: 'Geography studies location and spatial relationships.' },
  { id: 'ec6soc010', comp: 'ec6_soc_2', type: 'mc', difficulty: 2, q: 'Why do people trade with other countries?', choices: ['To avoid taxes', 'To get goods and services they cannot produce as efficiently', 'To reduce travel', 'To eliminate jobs'], answer: 'To get goods and services they cannot produce as efficiently', explanation: 'Trade allows countries to benefit from specialization.' },
  { id: 'ec6soc011', comp: 'ec6_soc_3', type: 'mc', difficulty: 1, q: 'How many branches does the U.S. federal government have?', choices: ['Two', 'Three', 'Four', 'Five'], answer: 'Three', explanation: 'Legislative, executive, and judicial.' },
  { id: 'ec6soc012', comp: 'ec6_soc_3', type: 'mc', difficulty: 1, q: 'Who makes laws for the United States?', choices: ['The President', 'The Supreme Court', 'Congress', 'The states only'], answer: 'Congress', explanation: 'Congress is the legislative branch and makes federal laws.' },
  { id: 'ec6soc013', comp: 'ec6_soc_3', type: 'mc', difficulty: 2, q: 'What is the best way to teach primary-grade students about community helpers?', choices: ['Only use a textbook', 'Use role-play and visits from or to community workers', 'Assign long readings', 'Skip social studies'], answer: 'Use role-play and visits from or to community workers', explanation: 'Hands-on and real-world connections support understanding.' },
  { id: 'ec6soc014', comp: 'ec6_soc_3', type: 'mc', difficulty: 2, q: 'Why is it important to use multiple sources when teaching history?', choices: ['To make lessons longer', 'To show different perspectives and build critical thinking', 'To avoid textbooks', 'To reduce writing'], answer: 'To show different perspectives and build critical thinking', explanation: 'Multiple sources help students compare and analyze.' },
  { id: 'ec6soc015', comp: 'ec6_soc_3', type: 'mc', difficulty: 1, q: 'What document describes the plan for the U.S. government?', choices: ['The Declaration of Independence', 'The Constitution', 'The Bill of Rights', 'The Mayflower Compact'], answer: 'The Constitution', explanation: 'The Constitution sets up the structure of the government.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Science of Teaching Reading (293) — 90 questions, 5 hr
// Domains: Reading Pedagogy; Foundational Skills; Comprehension; Analysis and Response
// ═══════════════════════════════════════════════════════════════
export const TEXES_DOMAINS_STR = [
  { id: 'comp_str_1', name: 'Reading Pedagogy', desc: 'SBRR, five components of reading, development.', weight: 0.15, games: [] },
  { id: 'comp_str_2', name: 'Reading Development: Foundational Skills', desc: 'Phonological awareness, phonics, fluency, vocabulary.', weight: 0.40, games: [] },
  { id: 'comp_str_3', name: 'Reading Development: Comprehension', desc: 'Literary and informational text comprehension.', weight: 0.35, games: [] },
  { id: 'comp_str_4', name: 'Analysis and Response', desc: 'Analysis and response to instruction and assessment.', weight: 0.10, games: [] },
];
export const TEXES_QUESTIONS_STR = [
  { id: 'str001', comp: 'comp_str_1', type: 'mc', difficulty: 1, q: 'Which of the following is one of the five essential components of reading identified by scientific research?', choices: ['Spelling', 'Phonemic awareness', 'Handwriting', 'Grammar'], answer: 'Phonemic awareness', explanation: 'The five components are phonemic awareness, phonics, fluency, vocabulary, and comprehension.' },
  { id: 'str002', comp: 'comp_str_1', type: 'mc', difficulty: 2, q: 'A teacher focuses on explicit, systematic instruction in letter-sound relationships. Which component of reading does this support?', choices: ['Fluency', 'Phonics', 'Comprehension', 'Vocabulary'], answer: 'Phonics', explanation: 'Phonics is the relationship between letters and sounds; systematic instruction is key.' },
  { id: 'str003', comp: 'comp_str_2', type: 'mc', difficulty: 1, q: 'What is phonemic awareness?', choices: ['Knowing letter names', 'The ability to hear and manipulate individual sounds in words', 'Reading quickly', 'Spelling correctly'], answer: 'The ability to hear and manipulate individual sounds in words', explanation: 'Phonemic awareness is oral and auditory; it does not involve print.' },
  { id: 'str004', comp: 'comp_str_2', type: 'mc', difficulty: 2, q: 'A student reads "the cat sat on the mat" slowly and word-by-word. Which area should the teacher target?', choices: ['Phonemic awareness', 'Phonics', 'Fluency', 'Comprehension'], answer: 'Fluency', explanation: 'Fluency is the ability to read with accuracy, rate, and prosody.' },
  { id: 'str005', comp: 'comp_str_2', type: 'mc', difficulty: 1, q: 'Which strategy best supports vocabulary development in early elementary?', choices: ['Memorizing definitions only', 'Using words in context and explicit instruction of high-utility words', 'Avoiding new words', 'Reading only decodable text'], answer: 'Using words in context and explicit instruction of high-utility words', explanation: 'Context and explicit instruction build vocabulary effectively.' },
  { id: 'str006', comp: 'comp_str_3', type: 'mc', difficulty: 1, q: 'What is the main purpose of teaching comprehension strategies?', choices: ['To speed up reading', 'To help students understand and remember what they read', 'To replace phonics', 'To improve spelling'], answer: 'To help students understand and remember what they read', explanation: 'Comprehension strategies support meaning-making.' },
  { id: 'str007', comp: 'comp_str_3', type: 'mc', difficulty: 2, q: 'Which activity best supports comprehension of informational text?', choices: ['Only oral reading', 'Using text structure (headings, captions) and asking questions', 'Copying the text', 'Skipping difficult words'], answer: 'Using text structure (headings, captions) and asking questions', explanation: 'Text structure and questioning support informational comprehension.' },
  { id: 'str008', comp: 'comp_str_4', type: 'mc', difficulty: 2, q: 'A teacher reviews a running record and notices a student often guesses from the first letter. What should the teacher do next?', choices: ['Ignore it', 'Provide targeted phonics and decoding practice', 'Only assign easier text', 'Focus only on comprehension'], answer: 'Provide targeted phonics and decoding practice', explanation: 'First-letter guessing suggests the student needs stronger decoding.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Art EC–12 (178) — 100 questions, ~4 hr 45 min
// Domains: Creating; Culture/History; Aesthetic Analysis; Art Education
// ═══════════════════════════════════════════════════════════════
export const TEXES_DOMAINS_ART_EC12 = [
  { id: 'comp_art_1', name: 'Creating Works of Art', desc: 'Elements, principles, media, techniques.', weight: 0.32, games: [] },
  { id: 'comp_art_2', name: 'Art, Culture, and History', desc: 'Visual arts in history and culture.', weight: 0.27, games: [] },
  { id: 'comp_art_3', name: 'Aesthetic Knowledge and Analysis', desc: 'Perception, interpretation, critique.', weight: 0.14, games: [] },
  { id: 'comp_art_4', name: 'Art Education', desc: 'Curriculum, instruction, assessment.', weight: 0.27, games: [] },
];
export const TEXES_QUESTIONS_ART_EC12 = [
  { id: 'art001', comp: 'comp_art_1', type: 'mc', difficulty: 1, q: 'Which of the following is an element of art?', choices: ['Balance', 'Line', 'Emphasis', 'Unity'], answer: 'Line', explanation: 'Line is one of the elements of art; balance and emphasis are principles.' },
  { id: 'art002', comp: 'comp_art_1', type: 'mc', difficulty: 2, q: 'What is the difference between hue and value in color?', choices: ['Hue is brightness, value is the name', 'Hue is the color name (e.g. red); value is lightness or darkness', 'They are the same', 'Value is saturation'], answer: 'Hue is the color name (e.g. red); value is lightness or darkness', explanation: 'Hue = color family; value = light/dark.' },
  { id: 'art003', comp: 'comp_art_2', type: 'mc', difficulty: 1, q: 'Which art movement is known for capturing light and everyday scenes in late 19th-century France?', choices: ['Baroque', 'Impressionism', 'Cubism', 'Pop Art'], answer: 'Impressionism', explanation: 'Impressionists focused on light and ordinary subject matter.' },
  { id: 'art004', comp: 'comp_art_2', type: 'mc', difficulty: 2, q: 'How can art reflect cultural identity?', choices: ['Only through realism', 'Through subject matter, symbols, materials, and techniques valued by a culture', 'Only in museums', 'Only in ancient art'], answer: 'Through subject matter, symbols, materials, and techniques valued by a culture', explanation: 'Culture shapes what and how art is made.' },
  { id: 'art005', comp: 'comp_art_3', type: 'mc', difficulty: 1, q: 'What does "critique" in art education typically involve?', choices: ['Only praising the work', 'Describing, analyzing, interpreting, and evaluating artwork', 'Copying the work', 'Grading with a number only'], answer: 'Describing, analyzing, interpreting, and evaluating artwork', explanation: 'Critique is a structured response to art.' },
  { id: 'art006', comp: 'comp_art_4', type: 'mc', difficulty: 2, q: 'Why is it important to use varied assessments in the art classroom?', choices: ['To reduce grading', 'To address different learning styles and measure both process and product', 'To avoid rubrics', 'To focus only on final pieces'], answer: 'To address different learning styles and measure both process and product', explanation: 'Varied assessments give a fuller picture of learning.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Music EC–12 (177) — 100 questions, 5 hr
// Domains: Listening; Theory/Composition; History/Culture; Performance; Education
// ═══════════════════════════════════════════════════════════════
export const TEXES_DOMAINS_MUSIC_EC12 = [
  { id: 'comp_mus_1', name: 'Listening', desc: 'Musical perception and analysis.', weight: 0.25, games: [] },
  { id: 'comp_mus_2', name: 'Music Theory and Composition', desc: 'Notation, theory, composition.', weight: 0.17, games: [] },
  { id: 'comp_mus_3', name: 'Music History and Culture', desc: 'Historical and cultural context.', weight: 0.17, games: [] },
  { id: 'comp_mus_4', name: 'Music Classroom Performance', desc: 'Performance and conducting.', weight: 0.25, games: [] },
  { id: 'comp_mus_5', name: 'Music Education', desc: 'Instruction, assessment, professional practice.', weight: 0.16, games: [] },
];
export const TEXES_QUESTIONS_MUSIC_EC12 = [
  { id: 'mus001', comp: 'comp_mus_1', type: 'mc', difficulty: 1, q: 'What is the term for the speed of the beat in music?', choices: ['Dynamics', 'Tempo', 'Timbre', 'Pitch'], answer: 'Tempo', explanation: 'Tempo refers to the speed of the beat.' },
  { id: 'mus002', comp: 'comp_mus_1', type: 'mc', difficulty: 2, q: 'A piece that alternates between forte and piano is primarily contrasting what?', choices: ['Tempo', 'Dynamics', 'Key', 'Meter'], answer: 'Dynamics', explanation: 'Forte (loud) and piano (soft) are dynamic levels.' },
  { id: 'mus003', comp: 'comp_mus_2', type: 'mc', difficulty: 1, q: 'In 4/4 time, how many beats does a half note receive?', choices: ['1', '2', '4', '1/2'], answer: '2', explanation: 'A half note gets two beats in 4/4.' },
  { id: 'mus004', comp: 'comp_mus_3', type: 'mc', difficulty: 1, q: 'Which period is known for ornate, elaborate compositions (e.g., Bach, Handel)?', choices: ['Classical', 'Romantic', 'Baroque', 'Modern'], answer: 'Baroque', explanation: 'Baroque music is known for ornamentation and counterpoint.' },
  { id: 'mus005', comp: 'comp_mus_4', type: 'mc', difficulty: 2, q: 'What is the primary role of a conductor in an ensemble?', choices: ['To play the loudest', 'To set tempo, cue entrances, and shape interpretation', 'To replace the composer', 'To tune instruments only'], answer: 'To set tempo, cue entrances, and shape interpretation', explanation: 'The conductor leads and interprets the performance.' },
  { id: 'mus006', comp: 'comp_mus_5', type: 'mc', difficulty: 2, q: 'Why should music teachers use a variety of teaching strategies (singing, moving, playing, listening)?', choices: ['To fill time', 'To address different learning modalities and reinforce concepts', 'To avoid assessment', 'To reduce rehearsal'], answer: 'To address different learning modalities and reinforce concepts', explanation: 'Varied strategies reach more learners and deepen understanding.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Physical Education EC–12 (258) — 90 questions, ~4 hr 45 min
// Domains: Movement; Health-Related Fitness; Program; All Learners/Professional; (Constructed)
// ═══════════════════════════════════════════════════════════════
export const TEXES_DOMAINS_PE_EC12 = [
  { id: 'comp_pe_1', name: 'Movement Knowledge and Skills', desc: 'Motor development, movement concepts.', weight: 0.22, games: [] },
  { id: 'comp_pe_2', name: 'Health-Related Fitness', desc: 'Cardiovascular, strength, flexibility, body composition.', weight: 0.22, games: [] },
  { id: 'comp_pe_3', name: 'The Physical Education Program', desc: 'Curriculum, instruction, assessment.', weight: 0.22, games: [] },
  { id: 'comp_pe_4', name: 'Educating All Learners and Professional Practice', desc: 'Differentiation, safety, ethics.', weight: 0.13, games: [] },
  { id: 'comp_pe_5', name: 'Application and Analysis', desc: 'Integration and professional practice.', weight: 0.20, games: [] },
];
export const TEXES_QUESTIONS_PE_EC12 = [
  { id: 'pe001', comp: 'comp_pe_1', type: 'mc', difficulty: 1, q: 'Which of the following is a locomotor movement?', choices: ['Bending', 'Skipping', 'Twisting', 'Stretching'], answer: 'Skipping', explanation: 'Locomotor movements travel through space; skipping is one.' },
  { id: 'pe002', comp: 'comp_pe_1', type: 'mc', difficulty: 2, q: 'What is the correct order of stages in the fundamental movement phase?', choices: ['Specialized, initial, elementary', 'Initial, elementary, mature', 'Mature, initial, elementary', 'Elementary, mature, initial'], answer: 'Initial, elementary, mature', explanation: 'Children progress from initial to elementary to mature patterns.' },
  { id: 'pe003', comp: 'comp_pe_2', type: 'mc', difficulty: 1, q: 'Which component of health-related fitness refers to the range of motion at a joint?', choices: ['Cardiovascular endurance', 'Flexibility', 'Muscular strength', 'Body composition'], answer: 'Flexibility', explanation: 'Flexibility is the ability to move joints through their range of motion.' },
  { id: 'pe004', comp: 'comp_pe_2', type: 'mc', difficulty: 2, q: 'Why is it important to include a cool-down after vigorous activity?', choices: ['To save time', 'To gradually lower heart rate and prevent blood pooling', 'To replace warm-up', 'To reduce equipment use'], answer: 'To gradually lower heart rate and prevent blood pooling', explanation: 'Cool-down aids recovery and reduces dizziness.' },
  { id: 'pe005', comp: 'comp_pe_3', type: 'mc', difficulty: 2, q: 'What is the main purpose of using formative assessment in PE?', choices: ['To assign grades only', 'To inform instruction and provide feedback during the unit', 'To replace summative assessment', 'To compare students'], answer: 'To inform instruction and provide feedback during the unit', explanation: 'Formative assessment guides teaching and learning in progress.' },
  { id: 'pe006', comp: 'comp_pe_4', type: 'mc', difficulty: 1, q: 'How can a PE teacher best support a student with a physical disability?', choices: ['Exclude from activities', 'Modify activities and use inclusive equipment so the student can participate', 'Only assign written work', 'Ignore the disability'], answer: 'Modify activities and use inclusive equipment so the student can participate', explanation: 'Inclusion and modifications allow all students to participate.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Computer Science 8–12 (241) — 100 questions, ~4 hr 45 min
// ═══════════════════════════════════════════════════════════════
export const TEXES_DOMAINS_CS_812 = [
  { id: 'comp_cs_1', name: 'Technology Applications Core', desc: 'Technology tools, digital literacy, instruction.', weight: 0.125, games: [] },
  { id: 'comp_cs_2', name: 'Program Design and Development', desc: 'Software development, problem solving.', weight: 0.35, games: [] },
  { id: 'comp_cs_3', name: 'Programming Language Topics', desc: 'Algorithms, control structures, data types.', weight: 0.40, games: [] },
  { id: 'comp_cs_4', name: 'Specialized Topics', desc: 'Robotics, digital forensics, discrete math.', weight: 0.125, games: [] },
];
export const TEXES_QUESTIONS_CS_812 = [
  { id: 'cs001', comp: 'comp_cs_1', type: 'mc', difficulty: 1, q: 'What is the main purpose of using version control (e.g., Git)?', choices: ['To delete old code', 'To track changes and collaborate on code', 'To run programs faster', 'To replace testing'], answer: 'To track changes and collaborate on code', explanation: 'Version control manages revisions and supports teamwork.' },
  { id: 'cs002', comp: 'comp_cs_2', type: 'mc', difficulty: 2, q: 'In the software development life cycle, when is testing typically emphasized?', choices: ['Only at the end', 'Throughout development, including after each phase', 'Only during design', 'Only by users'], answer: 'Throughout development, including after each phase', explanation: 'Testing is ongoing to catch defects early.' },
  { id: 'cs003', comp: 'comp_cs_3', type: 'mc', difficulty: 1, q: 'What structure allows a program to repeat a set of statements until a condition is false?', choices: ['Sequence', 'Selection (if)', 'Loop', 'Variable'], answer: 'Loop', explanation: 'Loops repeat code based on a condition.' },
  { id: 'cs004', comp: 'comp_cs_3', type: 'mc', difficulty: 2, q: 'What is the time complexity of a linear search through an array of n elements in the worst case?', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 'O(n)', explanation: 'Linear search may check every element once.' },
  { id: 'cs005', comp: 'comp_cs_4', type: 'mc', difficulty: 1, q: 'Which of these is an example of a binary value?', choices: ['0 or 1', 'A–Z', 'Red, Green, Blue', '0–9'], answer: '0 or 1', explanation: 'Binary uses only two digits: 0 and 1.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Technology Applications EC–12 (242) — 100 questions, 5 hr
// ═══════════════════════════════════════════════════════════════
export const TEXES_DOMAINS_TECH_EC12 = [
  { id: 'comp_tech_1', name: 'Technology Applications Core', desc: 'Foundational tech competencies, instruction.', weight: 0.15, games: [] },
  { id: 'comp_tech_2', name: 'Digital Art and Animation', desc: 'Digital art, animation instruction.', weight: 0.30, games: [] },
  { id: 'comp_tech_3', name: 'Digital Communication and Multimedia', desc: 'Multimedia, digital communication.', weight: 0.25, games: [] },
  { id: 'comp_tech_4', name: 'Web Design', desc: 'Web design and development.', weight: 0.30, games: [] },
];
export const TEXES_QUESTIONS_TECH_EC12 = [
  { id: 'tech001', comp: 'comp_tech_1', type: 'mc', difficulty: 1, q: 'What does "digital citizenship" typically include?', choices: ['Only coding', 'Responsible, ethical use of technology and online safety', 'Only hardware', 'Only software licenses'], answer: 'Responsible, ethical use of technology and online safety', explanation: 'Digital citizenship covers ethics and safety online.' },
  { id: 'tech002', comp: 'comp_tech_2', type: 'mc', difficulty: 2, q: 'Which principle of design refers to the arrangement of elements to create visual stability?', choices: ['Contrast', 'Balance', 'Repetition', 'Proximity'], answer: 'Balance', explanation: 'Balance creates a sense of equilibrium in design.' },
  { id: 'tech003', comp: 'comp_tech_3', type: 'mc', difficulty: 1, q: 'What is the main purpose of storyboarding in multimedia production?', choices: ['To write code', 'To plan sequence and content before production', 'To replace editing', 'To store files'], answer: 'To plan sequence and content before production', explanation: 'Storyboarding organizes and plans the project.' },
  { id: 'tech004', comp: 'comp_tech_4', type: 'mc', difficulty: 2, q: 'What does CSS primarily control in a web page?', choices: ['Server logic', 'Structure of content', 'Presentation and layout', 'Database queries'], answer: 'Presentation and layout', explanation: 'CSS styles the appearance and layout of HTML.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES Reading Specialist (151) — 100 questions, 5 hr
// ═══════════════════════════════════════════════════════════════
export const TEXES_DOMAINS_READING_SPECIALIST = [
  { id: 'comp_rs_1', name: 'Instruction and Assessment: Components of Literacy', desc: 'Oral language, phonics, fluency, comprehension, vocabulary.', weight: 0.57, games: [] },
  { id: 'comp_rs_2', name: 'Instruction and Assessment: Resources and Procedures', desc: 'Assessment and instructional methods.', weight: 0.14, games: [] },
  { id: 'comp_rs_3', name: 'Meeting the Needs of Individual Students', desc: 'ELL, dyslexia, reading difficulties.', weight: 0.14, games: [] },
  { id: 'comp_rs_4', name: 'Professional Knowledge and Leadership', desc: 'Theory, research, collaboration.', weight: 0.14, games: [] },
];
export const TEXES_QUESTIONS_READING_SPECIALIST = [
  { id: 'rs001', comp: 'comp_rs_1', type: 'mc', difficulty: 2, q: 'A reading specialist is helping a teacher interpret a running record. The student often substitutes words that look similar. What does this suggest?', choices: ['Strong comprehension', 'Overreliance on visual cues; may need phonics and meaning strategies', 'Strong decoding', 'No intervention needed'], answer: 'Overreliance on visual cues; may need phonics and meaning strategies', explanation: 'Visual substitutions suggest strengthening decoding and context use.' },
  { id: 'rs002', comp: 'comp_rs_2', type: 'mc', difficulty: 1, q: 'What is a key purpose of using diagnostic reading assessments?', choices: ['To assign grades only', 'To identify specific strengths and needs for targeted instruction', 'To replace screening', 'To compare schools'], answer: 'To identify specific strengths and needs for targeted instruction', explanation: 'Diagnostic assessments inform targeted instruction.' },
  { id: 'rs003', comp: 'comp_rs_3', type: 'mc', difficulty: 2, q: 'When planning instruction for students with dyslexia, what is essential?', choices: ['Only longer texts', 'Explicit, systematic, multisensory instruction in phonics and language', 'Only oral reading', 'Avoiding decoding'], answer: 'Explicit, systematic, multisensory instruction in phonics and language', explanation: 'Structured literacy approaches are recommended for dyslexia.' },
  { id: 'rs004', comp: 'comp_rs_4', type: 'mc', difficulty: 1, q: 'How can a reading specialist support school-wide literacy?', choices: ['By working only in isolation', 'By coaching teachers, leading PD, and supporting curriculum alignment', 'By replacing classroom teachers', 'By testing only'], answer: 'By coaching teachers, leading PD, and supporting curriculum alignment', explanation: 'Leadership and collaboration extend impact school-wide.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES School Counselor (252) — 90 questions, ~4 hr 45 min
// ═══════════════════════════════════════════════════════════════
export const TEXES_DOMAINS_SCHOOL_COUNSELOR = [
  { id: 'comp_sc_1', name: 'Knowledge of Learners', desc: 'Development, learning theories, diversity.', weight: 0.18, games: [] },
  { id: 'comp_sc_2', name: 'Comprehensive School Counseling Program', desc: 'Texas Model, delivery, implementation.', weight: 0.44, games: [] },
  { id: 'comp_sc_3', name: 'The Professional School Counselor', desc: 'Communication, collaboration, ethics.', weight: 0.18, games: [] },
  { id: 'comp_sc_4', name: 'Analysis and Response', desc: 'Assessing needs and planning interventions.', weight: 0.20, games: [] },
];
export const TEXES_QUESTIONS_SCHOOL_COUNSELOR = [
  { id: 'sc001', comp: 'comp_sc_1', type: 'mc', difficulty: 1, q: 'According to developmental theory, why is it important for school counselors to consider a student\'s age and stage?', choices: ['To label students', 'To provide developmentally appropriate support and expectations', 'To avoid parents', 'To focus only on academics'], answer: 'To provide developmentally appropriate support and expectations', explanation: 'Development influences how students learn and cope.' },
  { id: 'sc002', comp: 'comp_sc_2', type: 'mc', difficulty: 2, q: 'What are the four components of the Texas Model for Comprehensive School Counseling Programs?', choices: ['Only individual counseling', 'Foundation, Delivery, Management, Accountability', 'Only group work', 'Only crisis response'], answer: 'Foundation, Delivery, Management, Accountability', explanation: 'The Texas Model includes these four components.' },
  { id: 'sc003', comp: 'comp_sc_3', type: 'mc', difficulty: 1, q: 'When should a school counselor breach confidentiality?', choices: ['When a student is mildly upset', 'When there is risk of harm to self or others or as required by law', 'Never', 'Whenever a parent asks'], answer: 'When there is risk of harm to self or others or as required by law', explanation: 'Safety and legal requirements may require disclosure.' },
  { id: 'sc004', comp: 'comp_sc_4', type: 'mc', difficulty: 2, q: 'A counselor notices a pattern of absences among a group of students. What is an appropriate next step?', choices: ['Ignore the pattern', 'Analyze data, identify possible causes, and plan targeted interventions', 'Contact only parents', 'Refer all to administration only'], answer: 'Analyze data, identify possible causes, and plan targeted interventions', explanation: 'Data-driven action supports at-risk students.' },
];

// ═══════════════════════════════════════════════════════════════
// TExES LOTE Spanish (613) — 120 questions, 5 hr
// ═══════════════════════════════════════════════════════════════
export const TEXES_DOMAINS_LOTE_SPANISH = [
  { id: 'comp_lote_1', name: 'Instruction and Assessment', desc: 'Language acquisition, TEKS, assessment.', weight: 0.346, games: [] },
  { id: 'comp_lote_2', name: 'Cultural Understanding', desc: 'Culture and language connections.', weight: 0.08, games: [] },
  { id: 'comp_lote_3', name: 'Interpretive Listening', desc: 'Comprehension of spoken Spanish.', weight: 0.167, games: [] },
  { id: 'comp_lote_4', name: 'Interpretive Reading', desc: 'Comprehension of written Spanish.', weight: 0.167, games: [] },
  { id: 'comp_lote_5', name: 'Written Expression', desc: 'Writing in Spanish.', weight: 0.12, games: [] },
  { id: 'comp_lote_6', name: 'Oral Expression', desc: 'Speaking in Spanish.', weight: 0.12, games: [] },
];
export const TEXES_QUESTIONS_LOTE_SPANISH = [
  { id: 'lote001', comp: 'comp_lote_1', type: 'mc', difficulty: 2, q: 'According to second language acquisition theory, what is "comprehensible input"?', choices: ['Only grammar rules', 'Language that is slightly above the learner\'s level but understandable with context', 'Only native speaker speech', 'Only written text'], answer: 'Language that is slightly above the learner\'s level but understandable with context', explanation: 'Krashen\'s i+1: input that is understandable but challenging.' },
  { id: 'lote002', comp: 'comp_lote_2', type: 'mc', difficulty: 1, q: 'Why is it important to integrate culture into LOTE instruction?', choices: ['To replace grammar', 'Language and culture are intertwined; culture supports meaning and motivation', 'To fill time', 'Only for advanced students'], answer: 'Language and culture are intertwined; culture supports meaning and motivation', explanation: 'Culture gives context and purpose for language.' },
  { id: 'lote003', comp: 'comp_lote_3', type: 'mc', difficulty: 1, q: 'What does "interpretive listening" assess?', choices: ['Speaking ability', 'Ability to understand spoken language', 'Writing ability', 'Grammar only'], answer: 'Ability to understand spoken language', explanation: 'Interpretive mode focuses on comprehension.' },
  { id: 'lote004', comp: 'comp_lote_4', type: 'mc', difficulty: 2, q: 'When selecting authentic reading materials for Spanish class, what should the teacher consider?', choices: ['Only length', 'Student level, interest, and cultural relevance', 'Only grammar points', 'Only Spain'], answer: 'Student level, interest, and cultural relevance', explanation: 'Appropriate texts support engagement and comprehension.' },
  { id: 'lote005', comp: 'comp_lote_5', type: 'mc', difficulty: 1, q: 'What is the purpose of using rubrics for presentational writing in LOTE?', choices: ['To reduce grading', 'To clarify expectations and provide consistent feedback', 'To avoid grammar', 'To replace peer review'], answer: 'To clarify expectations and provide consistent feedback', explanation: 'Rubrics make criteria clear and feedback consistent.' },
  { id: 'lote006', comp: 'comp_lote_6', type: 'mc', difficulty: 2, q: 'How can a teacher promote oral proficiency in the classroom?', choices: ['Only multiple-choice tests', 'By providing frequent, structured opportunities for speaking in the target language', 'Only in English', 'Only at the end of the year'], answer: 'By providing frequent, structured opportunities for speaking in the target language', explanation: 'Practice in the target language builds proficiency.' },
];

/** Map TEKS code to TExES Math 7–12 competency so quiz questions match the video/lecture topic. */
const TEKS_TO_COMP_MATH712 = {
  'A.2A': 'comp002', 'A.2B': 'comp002', 'A.2C': 'comp002', 'A.2D': 'comp002', 'A.2E': 'comp002', 'A.2F': 'comp002', 'A.2G': 'comp002', 'A.2H': 'comp002',
  'A.3A': 'comp002', 'A.3B': 'comp002', 'A.3C': 'comp002',
  'A.5A': 'comp002', 'A.5B': 'comp002', 'A.5C': 'comp002',
  'A.7A': 'comp002', 'A.7B': 'comp002', 'A.7C': 'comp002', 'A.8A': 'comp002', 'A.8B': 'comp002',
  'A.9A': 'comp002', 'A.9B': 'comp002', 'A.9C': 'comp002', 'A.9D': 'comp002',
  '2A.2A': 'comp002', '2A.2B': 'comp002', '2A.3A': 'comp002', '2A.4A': 'comp002', '2A.4B': 'comp002', '2A.5A': 'comp002', '2A.6A': 'comp002', '2A.6B': 'comp002', '2A.7A': 'comp002', '2A.7B': 'comp002', '2A.8A': 'comp002', '2A.9A': 'comp002', '2A.10A': 'comp002', '2A.11A': 'comp002',
  'G.2A': 'comp003', 'G.2B': 'comp003', 'G.3A': 'comp003', 'G.4A': 'comp003', 'G.5A': 'comp003', 'G.6A': 'comp003', 'G.6D': 'comp003', 'G.7A': 'comp003', 'G.8A': 'comp003', 'G.9A': 'comp003', 'G.10A': 'comp003', 'G.11A': 'comp003', 'G.12A': 'comp003', 'G.12D': 'comp003',
  '7.3A': 'comp002', '7.4A': 'comp002', '7.4D': 'comp002', '8.4B': 'comp002', '8.5I': 'comp002',
};

/** Get TExES competency id for a TEKS code (math712/math48) so practice loop can filter questions to match the video topic. */
export function getCompForTeks(teks, examId) {
  if (!teks || typeof teks !== 'string') return null;
  const code = teks.split(',')[0].trim();
  if (examId === 'math712') return TEKS_TO_COMP_MATH712[code] || null;
  if (examId === 'math48') return TEKS_TO_COMP_MATH712[code] || null;
  return null;
}

/** Short bullet-style key concept for a TExES comp. Used when the quiz came from the comp pool (not the TEKS-specific bank) so the reminder matches what was actually practiced. */
export function getCompKeyIdea(compId) {
  const ideas = {
    comp001: 'Real numbers, operations, and number sense.\nUse place value, properties, and inverse operations.',
    comp002: 'Solve linear equations: do the same to both sides to isolate x.\nSequences: find the rule (e.g. +4), then apply it.\nFactor and simplify expressions when needed.',
    comp003: 'Use formulas for area, perimeter, and volume.\nProperties of shapes and transformations.',
    comp004: 'Probability = favorable outcomes / total outcomes.\nInterpret data, mean, median, and spread.',
    comp005: 'Reason about problems and check that answers make sense.\nConnect representations (equations, graphs, tables).',
    comp006: 'Design instruction using formative assessment data.\nAlign tasks to TEKS and differentiate for learner needs.',
  };
  return ideas[compId] || null;
}

/** Display name for a TExES comp (for key concept page title when quiz was from comp pool). */
export function getCompName(compId) {
  const d = (TEXES_DOMAINS || []).find((x) => x.id === compId);
  return d ? d.name : compId;
}

/** Return domains array for a TExES exam id (used by ClassWizard, ClassView, TexesPrep). */
export function getDomainsForExam(examId) {
  const map = {
    math712: () => TEXES_DOMAINS,
    math48: () => TEXES_DOMAINS_48,
    ec6: () => TEXES_DOMAINS_EC6,
    ec6_ela: () => TEXES_DOMAINS_EC6_ELA,
    ec6_science: () => TEXES_DOMAINS_EC6_SCIENCE,
    ec6_social: () => TEXES_DOMAINS_EC6_SOCIAL,
    ec6_full: () => [...TEXES_DOMAINS_EC6, ...TEXES_DOMAINS_EC6_ELA, ...TEXES_DOMAINS_EC6_SCIENCE, ...TEXES_DOMAINS_EC6_SOCIAL],
    physicalScience: () => TEXES_DOMAINS_PHYSICAL_SCIENCE,
    chemistry: () => TEXES_DOMAINS_CHEMISTRY,
    ela712: () => TEXES_DOMAINS_ELA712,
    science712: () => TEXES_DOMAINS_SCIENCE712,
    lifeScience712: () => TEXES_DOMAINS_LIFE_SCIENCE712,
    physicsMath612: () => TEXES_DOMAINS_PHYSICS_MATH_612,
    socialStudies712: () => TEXES_DOMAINS_SOCIAL_STUDIES712,
    history712: () => TEXES_DOMAINS_HISTORY712,
    ela48: () => TEXES_DOMAINS_ELA48,
    science48: () => TEXES_DOMAINS_SCIENCE48,
    socialStudies48: () => TEXES_DOMAINS_SOCIAL_STUDIES48,
    esl: () => TEXES_DOMAINS_ESL,
    specialEd: () => TEXES_DOMAINS_SPECIAL_ED,
    ppr: () => TEXES_DOMAINS_PPR,
    bilingualSpanish: () => TEXES_DOMAINS_BILINGUAL_SPANISH,
    bilingual: () => TEXES_DOMAINS_BILINGUAL,
    str: () => TEXES_DOMAINS_STR,
    artEC12: () => TEXES_DOMAINS_ART_EC12,
    musicEC12: () => TEXES_DOMAINS_MUSIC_EC12,
    peEC12: () => TEXES_DOMAINS_PE_EC12,
    cs812: () => TEXES_DOMAINS_CS_812,
    techAppEC12: () => TEXES_DOMAINS_TECH_EC12,
    readingSpecialist: () => TEXES_DOMAINS_READING_SPECIALIST,
    schoolCounselor: () => TEXES_DOMAINS_SCHOOL_COUNSELOR,
    loteSpanish: () => TEXES_DOMAINS_LOTE_SPANISH,
  };
  const fn = map[examId];
  return fn ? fn() : TEXES_DOMAINS;
}

/** Return questions array for a TExES exam id (used by TexesPrep / TestPrepPage). */
export function getQuestionsForExam(examId) {
  const map = {
    math712: () => TEXES_QUESTIONS,
    math48: () => TEXES_QUESTIONS_48,
    ec6: () => TEXES_QUESTIONS_EC6,
    ec6_ela: () => TEXES_QUESTIONS_EC6_ELA,
    ec6_science: () => TEXES_QUESTIONS_EC6_SCIENCE,
    ec6_social: () => TEXES_QUESTIONS_EC6_SOCIAL,
    ec6_full: () => [...TEXES_QUESTIONS_EC6, ...TEXES_QUESTIONS_EC6_ELA, ...TEXES_QUESTIONS_EC6_SCIENCE, ...TEXES_QUESTIONS_EC6_SOCIAL],
    physicalScience: () => TEXES_QUESTIONS_PHYSICAL_SCIENCE,
    chemistry: () => TEXES_QUESTIONS_CHEMISTRY,
    ela712: () => TEXES_QUESTIONS_ELA712,
    science712: () => TEXES_QUESTIONS_SCIENCE712,
    lifeScience712: () => TEXES_QUESTIONS_LIFE_SCIENCE712,
    physicsMath612: () => TEXES_QUESTIONS_PHYSICS_MATH_612,
    socialStudies712: () => TEXES_QUESTIONS_SOCIAL_STUDIES712,
    history712: () => TEXES_QUESTIONS_HISTORY712,
    ela48: () => TEXES_QUESTIONS_ELA48,
    science48: () => TEXES_QUESTIONS_SCIENCE48,
    socialStudies48: () => TEXES_QUESTIONS_SOCIAL_STUDIES48,
    esl: () => TEXES_QUESTIONS_ESL,
    specialEd: () => TEXES_QUESTIONS_SPECIAL_ED,
    ppr: () => TEXES_QUESTIONS_PPR,
    bilingualSpanish: () => TEXES_QUESTIONS_BILINGUAL_SPANISH,
    bilingual: () => TEXES_QUESTIONS_BILINGUAL,
    str: () => TEXES_QUESTIONS_STR,
    artEC12: () => TEXES_QUESTIONS_ART_EC12,
    musicEC12: () => TEXES_QUESTIONS_MUSIC_EC12,
    peEC12: () => TEXES_QUESTIONS_PE_EC12,
    cs812: () => TEXES_QUESTIONS_CS_812,
    techAppEC12: () => TEXES_QUESTIONS_TECH_EC12,
    readingSpecialist: () => TEXES_QUESTIONS_READING_SPECIALIST,
    schoolCounselor: () => TEXES_QUESTIONS_SCHOOL_COUNSELOR,
    loteSpanish: () => TEXES_QUESTIONS_LOTE_SPANISH,
  };
  const fn = map[examId];
  if (!fn) {
    if (import.meta.env?.DEV) {
      console.warn(`getQuestionsForExam: unknown examId "${examId}", returning empty array`);
    }
    return [];
  }
  return fn();
}
