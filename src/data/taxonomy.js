/**
 * Curriculum Taxonomy – The backbone of the skill picker system.
 *
 * Structure: Framework → Grade → Domain → Standard → Concepts → Subskills
 *
 * Every concept has a unique `conceptId` (e.g., "teks-3.4A-add-sub")
 * which is used as the key for tracking, filtering, and game wiring.
 *
 * Game templates declare which conceptIds they support via `gameConceptMap`.
 */

// ─── Frameworks ────────────────────────────────────────────────
export const FRAMEWORKS = [
  { id: 'teks', label: 'TEKS', region: 'Texas', description: 'Texas Essential Knowledge and Skills' },
  // Future: { id: 'ccss', label: 'Common Core', region: 'US National', description: 'Common Core State Standards' },
];

// ─── Grades ────────────────────────────────────────────────────
export const GRADES = {
  teks: [
    { id: 'grade1', label: 'Grade 1', subject: 'Mathematics' },
    { id: 'grade2', label: 'Grade 2', subject: 'Mathematics' },
    { id: 'grade3', label: 'Grade 3', subject: 'Mathematics' },
    { id: 'grade4', label: 'Grade 4', subject: 'Mathematics' },
    { id: 'grade5', label: 'Grade 5', subject: 'Mathematics' },
    { id: 'grade6', label: 'Grade 6', subject: 'Mathematics' },
    { id: 'grade7', label: 'Grade 7', subject: 'Mathematics' },
    { id: 'grade8', label: 'Grade 8', subject: 'Mathematics' },
    { id: 'grade4-8', label: 'TExES Math 4-8', subject: 'Mathematics' },
    { id: 'grade9', label: 'Grade 9', subject: 'Mathematics' },
    { id: 'grade10', label: 'Grade 10', subject: 'Mathematics' },
    { id: 'grade11', label: 'Grade 11', subject: 'Mathematics' },
    { id: 'algebra', label: 'Algebra I', subject: 'Mathematics' },
  ],
};

// ─── Domains (strands) per grade ───────────────────────────────
export const DOMAINS = {
  grade1: [
    { id: 'number-operations', label: 'Number & Operations', icon: '🔢' },
    { id: 'computation', label: 'Computation & Problem Solving', icon: '➕' },
    { id: 'algebraic-reasoning', label: 'Algebraic Reasoning', icon: '🔄' },
    { id: 'geometry-measurement', label: 'Geometry & Measurement', icon: '📐' },
    { id: 'data', label: 'Data Analysis', icon: '📊' },
  ],
  grade2: [
    { id: 'number-operations', label: 'Number & Operations', icon: '🔢' },
    { id: 'fractions', label: 'Fractions', icon: '🍕' },
    { id: 'computation', label: 'Computation & Problem Solving', icon: '➕' },
    { id: 'algebraic-reasoning', label: 'Algebraic Reasoning', icon: '🔄' },
    { id: 'geometry-measurement', label: 'Geometry & Measurement', icon: '📐' },
    { id: 'data-finance', label: 'Data & Financial Literacy', icon: '💰' },
  ],
  grade3: [
    { id: 'number-operations', label: 'Number & Operations', icon: '🔢' },
    { id: 'fractions', label: 'Fractions', icon: '🍕' },
    { id: 'computation', label: 'Computation & Problem Solving', icon: '➕' },
    { id: 'algebraic-reasoning', label: 'Algebraic Reasoning', icon: '🔄' },
    { id: 'geometry-measurement', label: 'Geometry & Measurement', icon: '📐' },
    { id: 'data-finance', label: 'Data & Financial Literacy', icon: '💰' },
  ],
  grade4: [
    { id: 'number-operations', label: 'Number & Operations', icon: '🔢' },
    { id: 'computation', label: 'Computation & Problem Solving', icon: '➕' },
    { id: 'fractions', label: 'Fractions & Decimals', icon: '🍕' },
    { id: 'algebraic-reasoning', label: 'Algebraic Reasoning', icon: '🔄' },
    { id: 'geometry-measurement', label: 'Geometry & Measurement', icon: '📐' },
    { id: 'data-finance', label: 'Data & Financial Literacy', icon: '💰' },
  ],
  grade5: [
    { id: 'number-operations', label: 'Number & Operations', icon: '🔢' },
    { id: 'computation', label: 'Computation & Problem Solving', icon: '➕' },
    { id: 'fractions', label: 'Fractions & Decimals', icon: '🍕' },
    { id: 'geometry-measurement', label: 'Geometry & Measurement', icon: '📐' },
    { id: 'data-finance', label: 'Data & Financial Literacy', icon: '💰' },
  ],
  grade6: [
    { id: 'number-operations', label: 'Number & Operations', icon: '🔢' },
    { id: 'computation', label: 'Computation & Problem Solving', icon: '➕' },
    { id: 'proportionality', label: 'Proportionality', icon: '📊' },
    { id: 'algebraic-reasoning', label: 'Algebraic Reasoning', icon: '🔄' },
    { id: 'geometry-measurement', label: 'Geometry & Measurement', icon: '📐' },
    { id: 'data-finance', label: 'Data & Financial Literacy', icon: '💰' },
  ],
  grade7: [
    { id: 'number-operations', label: 'Number & Operations', icon: '🔢' },
    { id: 'computation', label: 'Computation & Problem Solving', icon: '➕' },
    { id: 'proportionality', label: 'Proportionality', icon: '📊' },
    { id: 'algebraic-reasoning', label: 'Algebraic Reasoning', icon: '🔄' },
    { id: 'geometry-measurement', label: 'Geometry & Measurement', icon: '📐' },
    { id: 'data-finance', label: 'Data & Financial Literacy', icon: '💰' },
  ],
  grade8: [
    { id: 'number-operations', label: 'Number & Operations', icon: '🔢' },
    { id: 'proportionality', label: 'Proportionality', icon: '📊' },
    { id: 'algebraic-reasoning', label: 'Algebraic Reasoning', icon: '🔄' },
    { id: 'geometry-measurement', label: 'Geometry & Measurement', icon: '📐' },
    { id: 'data-finance', label: 'Data & Financial Literacy', icon: '💰' },
  ],
  'grade4-8': [
    { id: 'number-operations', label: 'Number & Operations', icon: '🔢' },
    { id: 'computation', label: 'Computation & Problem Solving', icon: '➕' },
    { id: 'proportionality', label: 'Proportionality', icon: '📊' },
    { id: 'algebraic-reasoning', label: 'Algebraic Reasoning', icon: '🔄' },
    { id: 'geometry-measurement', label: 'Geometry & Measurement', icon: '📐' },
    { id: 'data-finance', label: 'Data & Financial Literacy', icon: '💰' },
  ],
  grade9: [
    { id: 'linear-functions', label: 'Linear Functions', icon: '📈' },
    { id: 'equations-inequalities', label: 'Equations & Inequalities', icon: '⚖️' },
    { id: 'quadratics', label: 'Quadratic Functions', icon: '🎯' },
    { id: 'exponentials', label: 'Exponential Functions', icon: '📊' },
  ],
  grade10: [
    { id: 'logical-reasoning', label: 'Logical Reasoning & Proof', icon: '🔍' },
    { id: 'geometric-structure', label: 'Geometric Structure & Theorems', icon: '📐' },
    { id: 'measurement', label: 'Measurement & 3D Figures', icon: '📏' },
  ],
  grade11: [
    { id: 'quadratic-functions', label: 'Quadratic & Polynomial Functions', icon: '📈' },
    { id: 'exponential-logarithmic', label: 'Exponential & Logarithmic Functions', icon: '📊' },
    { id: 'equations-systems', label: 'Equations & Systems', icon: '⚖️' },
    { id: 'advanced-algebra', label: 'Advanced Algebra', icon: '🔢' },
  ],
  algebra: [
    { id: 'linear-functions', label: 'Linear Functions', icon: '📈' },
    { id: 'equations-inequalities', label: 'Equations & Inequalities', icon: '⚖️' },
    { id: 'quadratics', label: 'Quadratic Functions', icon: '🎯' },
    { id: 'exponentials', label: 'Exponential Functions', icon: '📊' },
  ],
};

// ─── Standards organized by domain ─────────────────────────────
// Each standard contains concepts, and each concept has subskills.
// `conceptId` is the universal key used for tracking and game wiring.
// `generators` lists the Math Sprint generator keys for this concept.

export const STANDARDS = {
  grade1: {
    'number-operations': [
      {
        id: '1.2A', code: '1.2A',
        description: 'Recognize instantly the quantity of structured arrangements (subitizing)',
        concepts: [
          {
            conceptId: 'teks-1.2A-subitizing',
            label: 'Subitizing',
            description: 'Recognize small quantities without counting',
            generators: ['g1_subitizing'],
            difficulty: 'foundational',
            subskills: ['recognize 1-5', 'recognize dot patterns', 'instant quantity recognition'],
          },
        ],
      },
      {
        id: '1.2B', code: '1.2B',
        description: 'Compose and decompose numbers up to 120 as hundreds, tens, and ones',
        concepts: [
          {
            conceptId: 'teks-1.2B-compose-decompose',
            label: 'Compose & Decompose to 120',
            description: 'Break numbers into tens and ones using models',
            generators: ['g1_composeDecompose'],
            difficulty: 'foundational',
            subskills: ['tens and ones', 'multiple ways', 'pictorial models'],
          },
        ],
      },
      {
        id: '1.2E', code: '1.2E',
        description: 'Use place value to compare whole numbers up to 120',
        concepts: [
          {
            conceptId: 'teks-1.2E-compare-place-value',
            label: 'Compare Using Place Value',
            description: 'Compare numbers using tens and ones',
            generators: ['g1_comparePlaceValue'],
            difficulty: 'foundational',
            subskills: ['greater than', 'less than', 'comparative language'],
          },
        ],
      },
      {
        id: '1.2F', code: '1.2F',
        description: 'Order whole numbers up to 120 using place value and number lines',
        concepts: [
          {
            conceptId: 'teks-1.2F-order-numbers',
            label: 'Order Numbers to 120',
            description: 'Order numbers from least to greatest and greatest to least',
            generators: ['g1_orderNumbers'],
            difficulty: 'foundational',
            subskills: ['least to greatest', 'greatest to least', 'open number line'],
          },
        ],
      },
      {
        id: '1.2G', code: '1.2G',
        description: 'Represent comparison of two numbers to 100 using >, <, or =',
        concepts: [
          {
            conceptId: 'teks-1.2G-compare-symbols',
            label: 'Compare with Symbols',
            description: 'Use >, <, and = to compare numbers',
            generators: ['g1_compareSymbols'],
            difficulty: 'foundational',
            subskills: ['greater than', 'less than', 'equal to', 'symbols'],
          },
        ],
      },
    ],
    computation: [
      {
        id: '1.3B', code: '1.3B',
        description: 'Solve word problems involving joining, separating, and comparing sets within 20',
        concepts: [
          {
            conceptId: 'teks-1.3B-word-problems',
            label: 'Add/Sub Word Problems',
            description: 'Solve joining, separating, and comparing problems within 20',
            generators: ['g1_wordProblems'],
            difficulty: 'developing',
            subskills: ['joining', 'separating', 'comparing', 'unknown in any position'],
          },
        ],
      },
      {
        id: '1.3C', code: '1.3C',
        description: 'Compose 10 with two or more addends',
        concepts: [
          {
            conceptId: 'teks-1.3C-compose-ten',
            label: 'Compose 10',
            description: 'Find addends that make 10',
            generators: ['g1_composeTen'],
            difficulty: 'foundational',
            subskills: ['two addends', 'three addends', 'number bonds for 10'],
          },
        ],
      },
      {
        id: '1.3D', code: '1.3D',
        description: 'Apply basic fact strategies to add and subtract within 20',
        concepts: [
          {
            conceptId: 'teks-1.3D-add-sub-20',
            label: 'Add & Subtract Within 20',
            description: 'Use making 10 and decomposing strategies',
            generators: ['g1_addSub20'],
            difficulty: 'developing',
            subskills: ['making 10', 'decomposing to 10', 'basic facts'],
          },
        ],
      },
      {
        id: '1.3E', code: '1.3E',
        description: 'Explain strategies used to solve addition and subtraction problems',
        concepts: [
          {
            conceptId: 'teks-1.3E-explain-strategies',
            label: 'Explain Strategies',
            description: 'Describe how you solved add/sub problems',
            generators: ['g1_explainStrategies'],
            difficulty: 'developing',
            subskills: ['verbal explanation', 'pictorial models', 'number sentences'],
          },
        ],
      },
      {
        id: '1.4A', code: '1.4A',
        description: 'Identify U.S. coins by value and describe relationships among them',
        concepts: [
          {
            conceptId: 'teks-1.4A-identify-coins',
            label: 'Identify Coins',
            description: 'Recognize pennies, nickels, dimes, quarters and their values',
            generators: ['g1_identifyCoins'],
            difficulty: 'foundational',
            subskills: ['penny', 'nickel', 'dime', 'quarter', 'relationships'],
          },
        ],
      },
      {
        id: '1.4B', code: '1.4B',
        description: 'Write a number with the cent symbol to describe coin value',
        concepts: [
          {
            conceptId: 'teks-1.4B-coin-value',
            label: 'Coin Value with Cent Symbol',
            description: 'Write coin values using the ¢ symbol',
            generators: ['g1_coinValue'],
            difficulty: 'foundational',
            subskills: ['cent symbol', 'penny 1¢', 'nickel 5¢', 'dime 10¢', 'quarter 25¢'],
          },
        ],
      },
      {
        id: '1.4C', code: '1.4C',
        description: 'Count by twos, fives, and tens to determine value of coin collections',
        concepts: [
          {
            conceptId: 'teks-1.4C-count-coins',
            label: 'Count Coins',
            description: 'Use skip counting to find total value of coins',
            generators: ['g1_countCoins'],
            difficulty: 'developing',
            subskills: ['count by 2s', 'count by 5s', 'count by 10s', 'mixed coins'],
          },
        ],
      },
    ],
    'algebraic-reasoning': [
      {
        id: '1.5A', code: '1.5A',
        description: 'Recite numbers forward and backward from any given number 1–120',
        concepts: [
          {
            conceptId: 'teks-1.5A-count-forward-backward',
            label: 'Count Forward & Backward',
            description: 'Recite numbers from any starting point within 120',
            generators: ['g1_countForwardBackward'],
            difficulty: 'foundational',
            subskills: ['forward from any number', 'backward from any number', 'within 120'],
          },
        ],
      },
      {
        id: '1.5B', code: '1.5B',
        description: 'Skip count by twos, fives, and tens to 120',
        concepts: [
          {
            conceptId: 'teks-1.5B-skip-count',
            label: 'Skip Counting',
            description: 'Count by 2s, 5s, and 10s to 120',
            generators: ['g1_skipCount'],
            difficulty: 'foundational',
            subskills: ['count by 2s', 'count by 5s', 'count by 10s'],
          },
        ],
      },
      {
        id: '1.5C', code: '1.5C',
        description: 'Determine 10 more and 10 less than a given number up to 120',
        concepts: [
          {
            conceptId: 'teks-1.5C-ten-more-less',
            label: '10 More & 10 Less',
            description: 'Find numbers that are 10 more or 10 less',
            generators: ['g1_tenMoreLess'],
            difficulty: 'foundational',
            subskills: ['10 more', '10 less', 'place value relationship'],
          },
        ],
      },
      {
        id: '1.5D', code: '1.5D',
        description: 'Represent word problems involving add/sub up to 20 with models and number sentences',
        concepts: [
          {
            conceptId: 'teks-1.5D-represent-word-problems',
            label: 'Represent Word Problems',
            description: 'Use models and equations for add/sub word problems',
            generators: ['g1_representWordProblems'],
            difficulty: 'developing',
            subskills: ['concrete models', 'pictorial models', 'number sentences'],
          },
        ],
      },
      {
        id: '1.5E', code: '1.5E',
        description: 'Understand that the equal sign represents same value on both sides',
        concepts: [
          {
            conceptId: 'teks-1.5E-equal-sign',
            label: 'Meaning of Equal Sign',
            description: 'Understand = means same value on both sides',
            generators: ['g1_equalSign'],
            difficulty: 'foundational',
            subskills: ['equal means same', 'both sides', 'true/false equations'],
          },
        ],
      },
      {
        id: '1.5G', code: '1.5G',
        description: 'Apply properties of operations to add and subtract',
        concepts: [
          {
            conceptId: 'teks-1.5G-properties',
            label: 'Properties of Operations',
            description: 'Use commutative and associative properties',
            generators: ['g1_properties'],
            difficulty: 'developing',
            subskills: ['commutative property', 'add three numbers', 'flexible strategies'],
          },
        ],
      },
    ],
    'geometry-measurement': [
      {
        id: '1.6A', code: '1.6A',
        description: 'Classify and sort 2D shapes based on attributes',
        concepts: [
          {
            conceptId: 'teks-1.6A-classify-shapes',
            label: 'Classify 2D Shapes',
            description: 'Sort shapes by their attributes',
            generators: ['g1_classifyShapes'],
            difficulty: 'foundational',
            subskills: ['regular and irregular', 'sides', 'vertices', 'informal language'],
          },
        ],
      },
      {
        id: '1.6B', code: '1.6B',
        description: 'Distinguish defining vs non-defining attributes of shapes',
        concepts: [
          {
            conceptId: 'teks-1.6B-shape-attributes',
            label: 'Defining Attributes',
            description: 'Identify what defines a shape vs what does not',
            generators: ['g1_definingAttributes'],
            difficulty: 'foundational',
            subskills: ['defining attributes', 'non-defining', '2D and 3D'],
          },
        ],
      },
      {
        id: '1.6D', code: '1.6D',
        description: 'Identify 2D shapes: circles, triangles, rectangles, squares, rhombuses, hexagons',
        concepts: [
          {
            conceptId: 'teks-1.6D-identify-shapes',
            label: 'Identify 2D Shapes',
            description: 'Name and describe circles, triangles, rectangles, squares, hexagons',
            generators: ['g1_identifyShapes'],
            difficulty: 'foundational',
            subskills: ['circle', 'triangle', 'rectangle', 'square', 'hexagon', 'attributes'],
          },
        ],
      },
      {
        id: '1.6E', code: '1.6E',
        description: 'Identify 3D solids: spheres, cones, cylinders, prisms',
        concepts: [
          {
            conceptId: 'teks-1.6E-identify-solids',
            label: 'Identify 3D Solids',
            description: 'Name spheres, cones, cylinders, rectangular prisms, triangular prisms',
            generators: ['g1_identifySolids'],
            difficulty: 'foundational',
            subskills: ['sphere', 'cone', 'cylinder', 'cube', 'prism', 'faces and edges'],
          },
        ],
      },
      {
        id: '1.6G', code: '1.6G',
        description: 'Partition 2D figures into two and four equal parts',
        concepts: [
          {
            conceptId: 'teks-1.6G-partition-equal',
            label: 'Partition into Equal Parts',
            description: 'Divide shapes into 2 or 4 fair shares',
            generators: ['g1_partitionEqual'],
            difficulty: 'foundational',
            subskills: ['halves', 'fourths', 'equal parts', 'fair shares'],
          },
        ],
      },
      {
        id: '1.6H', code: '1.6H',
        description: 'Identify examples and non-examples of halves and fourths',
        concepts: [
          {
            conceptId: 'teks-1.6H-halves-fourths',
            label: 'Halves & Fourths',
            description: 'Recognize and identify halves and fourths',
            generators: ['g1_halvesFourths'],
            difficulty: 'foundational',
            subskills: ['examples of halves', 'examples of fourths', 'non-examples'],
          },
        ],
      },
      {
        id: '1.7A', code: '1.7A',
        description: 'Use measuring tools to measure length of objects',
        concepts: [
          {
            conceptId: 'teks-1.7A-measure-length',
            label: 'Measure Length',
            description: 'Use tools to measure object lengths',
            generators: ['g1_measureLength'],
            difficulty: 'foundational',
            subskills: ['measuring tools', 'linear measurement', 'continuous nature'],
          },
        ],
      },
      {
        id: '1.7D', code: '1.7D',
        description: 'Describe length to the nearest whole unit',
        concepts: [
          {
            conceptId: 'teks-1.7D-describe-length',
            label: 'Describe Length',
            description: 'Report length with number and unit',
            generators: ['g1_describeLength'],
            difficulty: 'foundational',
            subskills: ['nearest whole', 'number and unit', 'inches or centimeters'],
          },
        ],
      },
      {
        id: '1.7E', code: '1.7E',
        description: 'Tell time to the hour and half hour',
        concepts: [
          {
            conceptId: 'teks-1.7E-tell-time',
            label: 'Tell Time',
            description: 'Read analog and digital clocks to hour and half hour',
            generators: ['g1_tellTime'],
            difficulty: 'foundational',
            subskills: ['hour', 'half hour', 'analog clock', 'digital clock'],
          },
        ],
      },
    ],
    data: [
      {
        id: '1.8C', code: '1.8C',
        description: 'Draw conclusions and answer questions using picture and bar graphs',
        concepts: [
          {
            conceptId: 'teks-1.8C-graphs',
            label: 'Picture & Bar Graphs',
            description: 'Use graphs to answer questions and draw conclusions',
            generators: ['g1_graphs'],
            difficulty: 'developing',
            subskills: ['read picture graph', 'read bar graph', 'answer questions', 'draw conclusions'],
          },
        ],
      },
    ],
  },
  grade2: {
    'number-operations': [
      {
        id: '2.2A', code: '2.2A',
        description: 'Compose and decompose numbers up to 1,200 as thousands, hundreds, tens, and ones',
        concepts: [
          {
            conceptId: 'teks-2.2A-compose-decompose-1200',
            label: 'Compose & Decompose to 1,200',
            description: 'Break numbers into thousands, hundreds, tens, and ones using models',
            generators: ['g2_composeDecompose1200'],
            difficulty: 'foundational',
            subskills: ['thousands', 'hundreds', 'tens', 'ones', 'multiple ways'],
          },
        ],
      },
      {
        id: '2.2B', code: '2.2B',
        description: 'Use standard, word, and expanded forms to represent numbers up to 1,200',
        concepts: [
          {
            conceptId: 'teks-2.2B-number-forms',
            label: 'Number Forms',
            description: 'Write numbers in standard, word, and expanded form',
            generators: ['g2_numberForms'],
            difficulty: 'foundational',
            subskills: ['standard form', 'word form', 'expanded form'],
          },
        ],
      },
      {
        id: '2.2C', code: '2.2C',
        description: 'Generate a number greater than or less than a given whole number up to 1,200',
        concepts: [
          {
            conceptId: 'teks-2.2C-greater-less',
            label: 'Greater Than / Less Than',
            description: 'Find numbers that are greater or less than a given number',
            generators: ['g2_greaterLess'],
            difficulty: 'foundational',
            subskills: ['one more', 'one less', '10 more', '10 less'],
          },
        ],
      },
      {
        id: '2.2D', code: '2.2D',
        description: 'Compare and order whole numbers up to 1,200 using place value',
        concepts: [
          {
            conceptId: 'teks-2.2D-compare-order',
            label: 'Compare & Order to 1,200',
            description: 'Compare and order numbers using >, <, =',
            generators: ['g2_compareOrder'],
            difficulty: 'foundational',
            subskills: ['compare with symbols', 'order least to greatest', 'order greatest to least'],
          },
        ],
      },
      {
        id: '2.2E', code: '2.2E',
        description: 'Locate the position of a given whole number on an open number line',
        concepts: [
          {
            conceptId: 'teks-2.2E-number-line-position',
            label: 'Number Line Position',
            description: 'Place numbers on an open number line',
            generators: ['g2_numberLinePosition'],
            difficulty: 'foundational',
            subskills: ['locate on number line', 'estimate position'],
          },
        ],
      },
      {
        id: '2.2F', code: '2.2F',
        description: 'Name the whole number that corresponds to a specific point on a number line',
        concepts: [
          {
            conceptId: 'teks-2.2F-number-from-point',
            label: 'Number from Number Line',
            description: 'Identify the number at a point on a number line',
            generators: ['g2_numberFromPoint'],
            difficulty: 'foundational',
            subskills: ['read number line', 'identify value at point'],
          },
        ],
      },
    ],
    fractions: [
      {
        id: '2.3A', code: '2.3A',
        description: 'Partition objects into equal parts and name halves, fourths, and eighths',
        concepts: [
          {
            conceptId: 'teks-2.3A-partition-halves-fourths-eighths',
            label: 'Partition Halves, Fourths, Eighths',
            description: 'Divide shapes into equal parts and name the parts',
            generators: ['g2_partitionFractions'],
            difficulty: 'foundational',
            subskills: ['halves', 'fourths', 'eighths', 'equal parts'],
          },
        ],
      },
      {
        id: '2.3B', code: '2.3B',
        description: 'Explain that more fractional parts = smaller part; fewer parts = larger part',
        concepts: [
          {
            conceptId: 'teks-2.3B-fraction-size',
            label: 'Fraction Size Relationship',
            description: 'Understand relationship between number of parts and part size',
            generators: ['g2_fractionSize'],
            difficulty: 'developing',
            subskills: ['more parts smaller', 'fewer parts larger'],
          },
        ],
      },
      {
        id: '2.3C', code: '2.3C',
        description: 'Count fractional parts beyond one whole using concrete models',
        concepts: [
          {
            conceptId: 'teks-2.3C-fractions-beyond-whole',
            label: 'Fractions Beyond One Whole',
            description: 'Count halves, fourths, eighths beyond one whole',
            generators: ['g2_fractionsBeyondWhole'],
            difficulty: 'developing',
            subskills: ['count beyond 1', 'parts to make whole'],
          },
        ],
      },
      {
        id: '2.3D', code: '2.3D',
        description: 'Identify examples and non-examples of halves, fourths, and eighths',
        concepts: [
          {
            conceptId: 'teks-2.3D-halves-fourths-eighths',
            label: 'Examples & Non-Examples',
            description: 'Recognize correct and incorrect representations of fractions',
            generators: ['g2_fractionExamples'],
            difficulty: 'foundational',
            subskills: ['halves', 'fourths', 'eighths', 'equal parts'],
          },
        ],
      },
    ],
    computation: [
      {
        id: '2.4A', code: '2.4A',
        description: 'Recall basic facts to add and subtract within 20 with automaticity',
        concepts: [
          {
            conceptId: 'teks-2.4A-add-sub-20',
            label: 'Add & Subtract Within 20',
            description: 'Fluently add and subtract within 20',
            generators: ['g2_addSub20'],
            difficulty: 'foundational',
            subskills: ['basic facts', 'automaticity', 'within 20'],
          },
        ],
      },
      {
        id: '2.4B', code: '2.4B',
        description: 'Add up to four two-digit numbers and subtract two-digit numbers',
        concepts: [
          {
            conceptId: 'teks-2.4B-add-sub-two-digit',
            label: 'Add & Subtract Two-Digit',
            description: 'Add and subtract two-digit numbers with place value strategies',
            generators: ['g2_addSubTwoDigit'],
            difficulty: 'developing',
            subskills: ['regrouping', 'place value', 'mental strategies'],
          },
        ],
      },
      {
        id: '2.4C', code: '2.4C',
        description: 'Solve one-step and multi-step word problems within 1,000',
        concepts: [
          {
            conceptId: 'teks-2.4C-word-problems-1000',
            label: 'Add/Sub Word Problems to 1,000',
            description: 'Solve addition and subtraction word problems within 1,000',
            generators: ['g2_wordProblems1000'],
            difficulty: 'developing',
            subskills: ['one-step', 'multi-step', 'within 1,000'],
          },
        ],
      },
      {
        id: '2.4D', code: '2.4D',
        description: 'Generate and solve problem situations for given number sentences',
        concepts: [
          {
            conceptId: 'teks-2.4D-generate-problems',
            label: 'Generate Problem Situations',
            description: 'Create word problems from number sentences',
            generators: ['g2_generateProblems'],
            difficulty: 'developing',
            subskills: ['match equation to situation', 'create story'],
          },
        ],
      },
      {
        id: '2.5A', code: '2.5A',
        description: 'Determine the value of a collection of coins up to one dollar',
        concepts: [
          {
            conceptId: 'teks-2.5A-coin-value',
            label: 'Coin Value to $1',
            description: 'Count the value of coins up to one dollar',
            generators: ['g2_coinValue'],
            difficulty: 'developing',
            subskills: ['pennies', 'nickels', 'dimes', 'quarters', 'mixed'],
          },
        ],
      },
      {
        id: '2.5B', code: '2.5B',
        description: 'Use cent symbol, dollar sign, and decimal point for coin values',
        concepts: [
          {
            conceptId: 'teks-2.5B-money-symbols',
            label: 'Money Symbols',
            description: 'Write money amounts using ¢, $, and decimal point',
            generators: ['g2_moneySymbols'],
            difficulty: 'foundational',
            subskills: ['cent symbol', 'dollar sign', 'decimal point'],
          },
        ],
      },
      {
        id: '2.6A', code: '2.6A',
        description: 'Model multiplication situations with equivalent sets joined',
        concepts: [
          {
            conceptId: 'teks-2.6A-equal-groups-mult',
            label: 'Equal Groups & Repeated Addition',
            description: 'Model multiplication as equal groups joined',
            generators: ['g2_equalGroupsMult'],
            difficulty: 'foundational',
            subskills: ['equal groups', 'repeated addition', 'arrays'],
          },
        ],
      },
      {
        id: '2.6B', code: '2.6B',
        description: 'Model division situations with objects separated into equivalent sets',
        concepts: [
          {
            conceptId: 'teks-2.6B-equal-shares-div',
            label: 'Equal Shares & Division',
            description: 'Model division as equal sharing',
            generators: ['g2_equalSharesDiv'],
            difficulty: 'foundational',
            subskills: ['equal sharing', 'partition into groups'],
          },
        ],
      },
    ],
    'algebraic-reasoning': [
      {
        id: '2.7A', code: '2.7A',
        description: 'Determine whether a number up to 40 is even or odd',
        concepts: [
          {
            conceptId: 'teks-2.7A-even-odd',
            label: 'Even & Odd to 40',
            description: 'Classify numbers as even or odd using pairings',
            generators: ['g2_evenOdd'],
            difficulty: 'foundational',
            subskills: ['pairings', 'even', 'odd'],
          },
        ],
      },
      {
        id: '2.7B', code: '2.7B',
        description: 'Determine 10 or 100 more or less than a given number up to 1,200',
        concepts: [
          {
            conceptId: 'teks-2.7B-ten-hundred-more-less',
            label: '10 & 100 More/Less',
            description: 'Find numbers that are 10 or 100 more or less',
            generators: ['g2_tenHundredMoreLess'],
            difficulty: 'foundational',
            subskills: ['10 more', '10 less', '100 more', '100 less'],
          },
        ],
      },
      {
        id: '2.7C', code: '2.7C',
        description: 'Represent and solve word problems with unknowns in any position',
        concepts: [
          {
            conceptId: 'teks-2.7C-unknown-word-problems',
            label: 'Unknown in Word Problems',
            description: 'Solve add/sub problems with unknown in any term',
            generators: ['g2_unknownWordProblems'],
            difficulty: 'developing',
            subskills: ['unknown addend', 'unknown subtrahend', 'unknown in any position'],
          },
        ],
      },
    ],
    'geometry-measurement': [
      {
        id: '2.8A', code: '2.8A',
        description: 'Create two-dimensional shapes based on given attributes',
        concepts: [
          {
            conceptId: 'teks-2.8A-create-shapes',
            label: 'Create 2D Shapes',
            description: 'Draw shapes with given sides and vertices',
            generators: ['g2_createShapes'],
            difficulty: 'foundational',
            subskills: ['sides', 'vertices', 'polygons'],
          },
        ],
      },
      {
        id: '2.8B', code: '2.8B',
        description: 'Classify and sort three-dimensional solids',
        concepts: [
          {
            conceptId: 'teks-2.8B-classify-3d',
            label: 'Classify 3D Solids',
            description: 'Sort spheres, cones, cylinders, prisms by attributes',
            generators: ['g2_classify3d'],
            difficulty: 'foundational',
            subskills: ['sphere', 'cone', 'cylinder', 'prism', 'faces', 'edges'],
          },
        ],
      },
      {
        id: '2.8C', code: '2.8C',
        description: 'Classify and sort polygons with 12 or fewer sides',
        concepts: [
          {
            conceptId: 'teks-2.8C-classify-polygons',
            label: 'Classify Polygons',
            description: 'Sort polygons by sides and vertices',
            generators: ['g2_classifyPolygons'],
            difficulty: 'foundational',
            subskills: ['sides', 'vertices', 'polygons up to 12 sides'],
          },
        ],
      },
      {
        id: '2.8D', code: '2.8D',
        description: 'Compose two-dimensional shapes and three-dimensional solids',
        concepts: [
          {
            conceptId: 'teks-2.8D-compose-shapes',
            label: 'Compose Shapes',
            description: 'Combine shapes to create new shapes',
            generators: ['g2_composeShapes'],
            difficulty: 'developing',
            subskills: ['compose 2D', 'compose 3D'],
          },
        ],
      },
      {
        id: '2.8E', code: '2.8E',
        description: 'Decompose two-dimensional shapes and identify resulting parts',
        concepts: [
          {
            conceptId: 'teks-2.8E-decompose-shapes',
            label: 'Decompose Shapes',
            description: 'Break shapes into parts and identify the parts',
            generators: ['g2_decomposeShapes'],
            difficulty: 'developing',
            subskills: ['decompose', 'identify parts'],
          },
        ],
      },
      {
        id: '2.9A', code: '2.9A',
        description: 'Find the length of objects using concrete models',
        concepts: [
          {
            conceptId: 'teks-2.9A-measure-length',
            label: 'Measure Length',
            description: 'Use concrete units to measure length',
            generators: ['g2_measureLength'],
            difficulty: 'foundational',
            subskills: ['concrete models', 'standard units'],
          },
        ],
      },
      {
        id: '2.9B', code: '2.9B',
        description: 'Describe inverse relationship between unit size and number of units',
        concepts: [
          {
            conceptId: 'teks-2.9B-unit-size',
            label: 'Unit Size Relationship',
            description: 'Understand smaller units need more to measure',
            generators: ['g2_unitSize'],
            difficulty: 'developing',
            subskills: ['inverse relationship', 'unit size'],
          },
        ],
      },
      {
        id: '2.9D', code: '2.9D',
        description: 'Determine length to nearest marked unit using rulers',
        concepts: [
          {
            conceptId: 'teks-2.9D-measure-ruler',
            label: 'Measure with Ruler',
            description: 'Use rulers to measure to nearest unit',
            generators: ['g2_measureRuler'],
            difficulty: 'foundational',
            subskills: ['ruler', 'inch', 'centimeter'],
          },
        ],
      },
      {
        id: '2.9E', code: '2.9E',
        description: 'Determine solution to problems involving length',
        concepts: [
          {
            conceptId: 'teks-2.9E-length-problems',
            label: 'Length Word Problems',
            description: 'Solve problems involving length and estimating',
            generators: ['g2_lengthProblems'],
            difficulty: 'developing',
            subskills: ['estimate', 'compare lengths', 'word problems'],
          },
        ],
      },
      {
        id: '2.9F', code: '2.9F',
        description: 'Find area of rectangle using square units',
        concepts: [
          {
            conceptId: 'teks-2.9F-area-rectangle',
            label: 'Area of Rectangle',
            description: 'Cover rectangle with square units and count',
            generators: ['g2_areaRectangle'],
            difficulty: 'foundational',
            subskills: ['square units', 'count', 'no gaps'],
          },
        ],
      },
      {
        id: '2.9G', code: '2.9G',
        description: 'Read and write time to the nearest minute',
        concepts: [
          {
            conceptId: 'teks-2.9G-tell-time-minute',
            label: 'Tell Time to Minute',
            description: 'Read analog and digital clocks to the minute',
            generators: ['g2_tellTimeMinute'],
            difficulty: 'foundational',
            subskills: ['minute', 'analog', 'digital', 'a.m.', 'p.m.'],
          },
        ],
      },
    ],
    'data-finance': [
      {
        id: '2.10A', code: '2.10A',
        description: 'Explain that bar length or picture count represents data points',
        concepts: [
          {
            conceptId: 'teks-2.10A-graph-scale',
            label: 'Graph Scale',
            description: 'Understand how graphs represent data',
            generators: ['g2_graphScale'],
            difficulty: 'foundational',
            subskills: ['bar graph', 'pictograph', 'scale'],
          },
        ],
      },
      {
        id: '2.10B', code: '2.10B',
        description: 'Organize data using pictographs and bar graphs',
        concepts: [
          {
            conceptId: 'teks-2.10B-organize-data',
            label: 'Organize Data',
            description: 'Create pictographs and bar graphs',
            generators: ['g2_organizeData'],
            difficulty: 'developing',
            subskills: ['pictograph', 'bar graph', 'intervals'],
          },
        ],
      },
      {
        id: '2.10C', code: '2.10C',
        description: 'Write and solve word problems using graph data',
        concepts: [
          {
            conceptId: 'teks-2.10C-graph-word-problems',
            label: 'Graph Word Problems',
            description: 'Solve add/sub problems using data from graphs',
            generators: ['g2_graphWordProblems'],
            difficulty: 'developing',
            subskills: ['read graph', 'solve problem', 'add/sub'],
          },
        ],
      },
      {
        id: '2.10D', code: '2.10D',
        description: 'Draw conclusions and make predictions from graphs',
        concepts: [
          {
            conceptId: 'teks-2.10D-graph-conclusions',
            label: 'Graph Conclusions',
            description: 'Make conclusions and predictions from graph data',
            generators: ['g2_graphConclusions'],
            difficulty: 'developing',
            subskills: ['conclusions', 'predictions'],
          },
        ],
      },
      {
        id: '2.11A', code: '2.11A',
        description: 'Calculate how money saved accumulates over time',
        concepts: [
          {
            conceptId: 'teks-2.11A-savings-accumulate',
            label: 'Savings Accumulate',
            description: 'Understand how savings grow over time',
            generators: ['g2_savingsAccumulate'],
            difficulty: 'developing',
            subskills: ['saving', 'accumulation'],
          },
        ],
      },
      {
        id: '2.11B', code: '2.11B',
        description: 'Explain that saving is an alternative to spending',
        concepts: [
          {
            conceptId: 'teks-2.11B-saving-vs-spending',
            label: 'Saving vs Spending',
            description: 'Understand saving as choice',
            generators: ['g2_savingVsSpending'],
            difficulty: 'foundational',
            subskills: ['saving', 'spending', 'choice'],
          },
        ],
      },
      {
        id: '2.11F', code: '2.11F',
        description: 'Differentiate between producers and consumers',
        concepts: [
          {
            conceptId: 'teks-2.11F-producers-consumers',
            label: 'Producers & Consumers',
            description: 'Identify producers and consumers',
            generators: ['g2_producersConsumers'],
            difficulty: 'foundational',
            subskills: ['producer', 'consumer', 'cost to produce'],
          },
        ],
      },
    ],
  },
  grade3: {
    'number-operations': [
      {
        id: '3.2A', code: '3.2A',
        description: 'Compose and decompose numbers up to 100,000 using place value',
        concepts: [
          {
            conceptId: 'teks-3.2A-expanded-form',
            label: 'Expanded Form',
            description: 'Write numbers as sums of place-value parts',
            generators: ['placeValue_expanded'],
            difficulty: 'foundational',
            subskills: ['identify thousands', 'identify hundreds', 'identify tens/ones', 'compose from parts'],
          },
        ],
      },
      {
        id: '3.2B', code: '3.2B',
        description: 'Describe relationships in the base-10 place value system',
        concepts: [
          {
            conceptId: 'teks-3.2B-digit-identification',
            label: 'Digit Identification',
            description: 'Identify the digit in a specific place value position',
            generators: ['placeValue_digit'],
            difficulty: 'foundational',
            subskills: ['ones place', 'tens place', 'hundreds place', 'thousands place'],
          },
        ],
      },
      {
        id: '3.2C', code: '3.2C',
        description: 'Round whole numbers to the nearest hundred',
        concepts: [
          {
            conceptId: 'teks-3.2C-round-hundred',
            label: 'Rounding to Hundreds',
            description: 'Round a number to the nearest hundred',
            generators: ['placeValue_round'],
            difficulty: 'foundational',
            subskills: ['identify benchmark hundreds', 'determine midpoint', 'apply rounding rule'],
          },
        ],
      },
      {
        id: '3.2D', code: '3.2D',
        description: 'Compare and order whole numbers up to 100,000',
        concepts: [
          {
            conceptId: 'teks-3.2D-compare-order',
            label: 'Compare & Order Numbers',
            description: 'Compare and order whole numbers using >, <, or =',
            generators: ['compareNumbers'],
            difficulty: 'foundational',
            subskills: ['use >, <, = symbols', 'order from least to greatest', 'order from greatest to least'],
          },
        ],
      },
    ],
    fractions: [
      {
        id: '3.3A', code: '3.3A',
        description: 'Represent fractions with concrete objects and pictorial models',
        concepts: [
          {
            conceptId: 'teks-3.3A-represent-fractions',
            label: 'Represent Fractions',
            description: 'Show fractions using models, strip diagrams, and number lines',
            generators: ['representFractions'],
            difficulty: 'foundational',
            subskills: ['shade models', 'identify fraction from model', 'denominators 2-8'],
          },
        ],
      },
      {
        id: '3.3B', code: '3.3B',
        description: 'Determine a fraction given a point on a number line',
        concepts: [
          {
            conceptId: 'teks-3.3B-fraction-number-line',
            label: 'Fractions on Number Lines',
            description: 'Identify fractions on a number line between 0 and 1',
            generators: ['fractionNumberLine'],
            difficulty: 'developing',
            subskills: ['locate fraction on number line', 'determine fraction from point', 'denominators 2-8'],
          },
        ],
      },
      {
        id: '3.3C', code: '3.3C',
        description: 'Explain that 1/b is one part of b equal parts',
        concepts: [
          {
            conceptId: 'teks-3.3C-unit-fractions',
            label: 'Unit Fractions',
            description: 'Understand that 1/b means 1 part out of b equal parts',
            generators: ['unitFractions'],
            difficulty: 'foundational',
            subskills: ['identify unit fraction', 'partition into equal parts', 'name the fraction'],
          },
        ],
      },
      {
        id: '3.3D', code: '3.3D',
        description: 'Compose and decompose fractions as sums of unit fractions',
        concepts: [
          {
            conceptId: 'teks-3.3D-compose-fractions',
            label: 'Compose & Decompose Fractions',
            description: 'Write a/b as a sum of 1/b parts',
            generators: ['composeFractions'],
            difficulty: 'developing',
            subskills: ['decompose into unit fractions', 'compose from unit fractions', 'additive reasoning'],
          },
        ],
      },
      {
        id: '3.3E', code: '3.3E',
        description: 'Solve problems partitioning objects among recipients',
        concepts: [
          {
            conceptId: 'teks-3.3E-partition-fractions',
            label: 'Partitioning & Sharing',
            description: 'Partition objects equally and express results as fractions',
            generators: ['partitionFractions'],
            difficulty: 'developing',
            subskills: ['equal sharing', 'partition objects', 'fraction from sharing'],
          },
        ],
      },
      {
        id: '3.3F', code: '3.3F',
        description: 'Represent equivalent fractions',
        concepts: [
          {
            conceptId: 'teks-3.3F-equivalent-fractions',
            label: 'Equivalent Fractions',
            description: 'Find and represent equivalent fractions with denominators 2-8',
            generators: ['equivalentFractions'],
            difficulty: 'developing',
            subskills: ['identify equivalent fractions', 'use models to show equivalence', 'number line equivalence'],
          },
        ],
      },
      {
        id: '3.3G', code: '3.3G',
        description: 'Explain when two fractions are equivalent',
        concepts: [
          {
            conceptId: 'teks-3.3G-explain-equivalence',
            label: 'Explain Fraction Equivalence',
            description: 'Justify why two fractions are equivalent using models or number lines',
            generators: ['explainEquivalence'],
            difficulty: 'proficient',
            subskills: ['same point on number line', 'same portion of whole', 'reasoning about equivalence'],
          },
        ],
      },
      {
        id: '3.3H', code: '3.3H',
        description: 'Compare two fractions having the same denominator',
        concepts: [
          {
            conceptId: 'teks-3.3H-compare-fractions',
            label: 'Comparing Fractions',
            description: 'Determine which of two fractions with the same denominator is greater',
            generators: ['compareFractions'],
            difficulty: 'developing',
            subskills: ['same denominator comparison', 'numerator reasoning', 'fraction size sense'],
          },
        ],
      },
    ],
    computation: [
      {
        id: '3.4A', code: '3.4A',
        description: 'Solve one-step and two-step addition and subtraction problems within 1,000',
        concepts: [
          {
            conceptId: 'teks-3.4A-add-sub',
            label: 'Addition & Subtraction',
            description: 'Add and subtract within 1,000 using place value strategies',
            generators: ['addSub'],
            difficulty: 'developing',
            subskills: ['add 3-digit numbers', 'subtract 3-digit numbers', 'regrouping', 'mental strategies'],
          },
          {
            conceptId: 'teks-3.4A-add-sub-word',
            label: 'Add/Sub Word Problems',
            description: 'Solve word problems involving addition and subtraction',
            generators: ['addSubWord'],
            difficulty: 'proficient',
            subskills: ['identify operation', 'extract numbers', 'multi-step reasoning'],
          },
        ],
      },
      {
        id: '3.4B', code: '3.4B',
        description: 'Round to the nearest 10 or 100 to estimate solutions',
        concepts: [
          {
            conceptId: 'teks-3.4B-rounding',
            label: 'Rounding & Estimation',
            description: 'Round to the nearest 10 or 100 and use compatible numbers',
            generators: ['rounding'],
            difficulty: 'developing',
            subskills: ['round to nearest 10', 'round to nearest 100', 'estimate sums/differences'],
          },
        ],
      },
      {
        id: '3.4C', code: '3.4C',
        description: 'Determine the value of coins in a collection',
        concepts: [
          {
            conceptId: 'teks-3.4C-money',
            label: 'Counting Coins',
            description: 'Count the total value of a collection of coins',
            generators: ['coins'],
            difficulty: 'developing',
            subskills: ['quarter value', 'dime value', 'nickel value', 'penny value', 'mixed coins'],
          },
        ],
      },
      {
        id: '3.4D', code: '3.4D',
        description: 'Determine the total number of objects in equal groups or arrays up to 10 by 10',
        concepts: [
          {
            conceptId: 'teks-3.4D-equal-groups',
            label: 'Equal Groups & Arrays',
            description: 'Find total objects when arranged in equal groups or arrays',
            generators: ['equalGroups'],
            difficulty: 'foundational',
            subskills: ['count equal groups', 'count arrays (rows × columns)', 'connect to multiplication'],
          },
        ],
      },
      {
        id: '3.4E', code: '3.4E',
        description: 'Represent multiplication facts using various approaches',
        concepts: [
          {
            conceptId: 'teks-3.4E-mult-representations',
            label: 'Multiplication Representations',
            description: 'Show multiplication with repeated addition, groups, arrays, area models, and skip counting',
            generators: ['multRepresent'],
            difficulty: 'developing',
            subskills: ['repeated addition', 'equal groups model', 'array model', 'area model', 'skip counting'],
          },
        ],
      },
      {
        id: '3.4F', code: '3.4F',
        description: 'Recall facts to multiply up to 10 × 10 with automaticity',
        concepts: [
          {
            conceptId: 'teks-3.4F-multiply-facts',
            label: 'Multiplication Facts',
            description: 'Recall multiplication facts up to 10 × 10',
            generators: ['multiply'],
            difficulty: 'developing',
            subskills: ['×2 facts', '×3 facts', '×4 facts', '×5 facts', '×6-9 facts', '×10 facts'],
          },
        ],
      },
      {
        id: '3.4G', code: '3.4G',
        description: 'Use strategies to multiply two-digit by one-digit numbers',
        concepts: [
          {
            conceptId: 'teks-3.4G-2digit-multiply',
            label: 'Two-Digit × One-Digit',
            description: 'Multiply a two-digit number by a one-digit number',
            generators: ['twoDigitByOne'],
            difficulty: 'proficient',
            subskills: ['partial products', 'distributive property', 'mental math'],
          },
        ],
      },
      {
        id: '3.4H', code: '3.4H',
        description: 'Determine the number of objects in each group in a division problem',
        concepts: [
          {
            conceptId: 'teks-3.4H-division-word',
            label: 'Division Word Problems',
            description: 'Solve equal sharing and equal grouping word problems',
            generators: ['divideWord'],
            difficulty: 'proficient',
            subskills: ['equal sharing', 'equal grouping', 'interpret remainder'],
          },
        ],
      },
      {
        id: '3.4I', code: '3.4I',
        description: 'Determine if a number is even or odd using divisibility rules',
        concepts: [
          {
            conceptId: 'teks-3.4I-even-odd',
            label: 'Even & Odd Numbers',
            description: 'Classify numbers as even or odd',
            generators: ['evenOdd'],
            difficulty: 'foundational',
            subskills: ['define even/odd', 'divisibility by 2', 'last digit rule'],
          },
        ],
      },
      {
        id: '3.4J', code: '3.4J',
        description: 'Determine a quotient using the relationship between multiplication and division',
        concepts: [
          {
            conceptId: 'teks-3.4J-quotient-relationship',
            label: 'Quotient from Multiplication',
            description: 'Use multiplication facts to find quotients',
            generators: ['quotientRelationship'],
            difficulty: 'developing',
            subskills: ['inverse operations', 'fact families', 'think multiplication to divide'],
          },
        ],
      },
      {
        id: '3.4K', code: '3.4K',
        description: 'Solve one-step division problems within 100',
        concepts: [
          {
            conceptId: 'teks-3.4K-division-facts',
            label: 'Division Facts',
            description: 'Divide within 100 using the relationship to multiplication',
            generators: ['divide'],
            difficulty: 'developing',
            subskills: ['÷2 facts', '÷3 facts', '÷5 facts', 'inverse of multiplication'],
          },
        ],
      },
    ],
    'algebraic-reasoning': [
      {
        id: '3.5A', code: '3.5A',
        description: 'Represent one- and two-step problems involving addition and subtraction using equations',
        concepts: [
          {
            conceptId: 'teks-3.5A-word-problems',
            label: 'Add/Sub Word Problems',
            description: 'Represent and solve addition/subtraction word problems',
            generators: ['addSubWord'],
            difficulty: 'proficient',
            subskills: ['write equation', 'identify unknowns', 'solve multi-step'],
          },
        ],
      },
      {
        id: '3.5B', code: '3.5B',
        description: 'Represent and solve one- and two-step multiplication and division problems',
        concepts: [
          {
            conceptId: 'teks-3.5B-mult-word',
            label: 'Multiplication Word Problems',
            description: 'Solve multiplication word problems with equal groups',
            generators: ['multiplyWord'],
            difficulty: 'proficient',
            subskills: ['equal groups model', 'write multiplication equation', 'multi-step'],
          },
        ],
      },
      {
        id: '3.5C', code: '3.5C',
        description: 'Describe a multiplication expression as a comparison',
        concepts: [
          {
            conceptId: 'teks-3.5C-mult-comparison',
            label: 'Multiplication as Comparison',
            description: 'Describe expressions like 3 × 24 as "3 times as much as 24"',
            generators: ['multComparison'],
            difficulty: 'developing',
            subskills: ['times as much', 'multiplicative comparison language', 'write comparison statements'],
          },
        ],
      },
      {
        id: '3.5D', code: '3.5D',
        description: 'Determine the unknown whole number in a multiplication or division equation',
        concepts: [
          {
            conceptId: 'teks-3.5D-missing-factor',
            label: 'Missing Factor',
            description: 'Find the unknown in a × ___ = b',
            generators: ['missingFactor'],
            difficulty: 'developing',
            subskills: ['inverse operations', 'fact families', 'number sense'],
          },
        ],
      },
      {
        id: '3.5E', code: '3.5E',
        description: 'Represent real-world relationships using number pairs and patterns',
        concepts: [
          {
            conceptId: 'teks-3.5E-patterns',
            label: 'Number Patterns',
            description: 'Continue and describe number patterns',
            generators: ['pattern'],
            difficulty: 'developing',
            subskills: ['find the rule', 'extend a pattern', 'describe the relationship'],
          },
        ],
      },
    ],
    'geometry-measurement': [
      {
        id: '3.6A', code: '3.6A',
        description: 'Classify and sort two- and three-dimensional figures',
        concepts: [
          {
            conceptId: 'teks-3.6A-classify-shapes',
            label: 'Classify 2D & 3D Shapes',
            description: 'Classify cones, cylinders, spheres, prisms, cubes using geometric language',
            generators: ['classifyShapes'],
            difficulty: 'foundational',
            subskills: ['name 3D figures', 'identify faces/edges/vertices', 'sort by attributes'],
          },
        ],
      },
      {
        id: '3.6B', code: '3.6B',
        description: 'Use attributes to recognize quadrilaterals',
        concepts: [
          {
            conceptId: 'teks-3.6B-quadrilaterals',
            label: 'Quadrilaterals',
            description: 'Recognize rhombuses, parallelograms, trapezoids, rectangles, and squares',
            generators: ['quadrilaterals'],
            difficulty: 'developing',
            subskills: ['identify quadrilateral types', 'compare attributes', 'draw non-examples'],
          },
        ],
      },
      {
        id: '3.6C', code: '3.6C',
        description: 'Determine the area of rectangles with whole number side lengths',
        concepts: [
          {
            conceptId: 'teks-3.6C-area',
            label: 'Area of Rectangles',
            description: 'Calculate area using length × width',
            generators: ['area'],
            difficulty: 'developing',
            subskills: ['count unit squares', 'apply formula', 'distinguish from perimeter'],
          },
        ],
      },
      {
        id: '3.7A', code: '3.7A',
        description: 'Represent fractions of halves, fourths, and eighths as distances from zero on a number line',
        concepts: [
          {
            conceptId: 'teks-3.7A-fraction-distance',
            label: 'Fractions as Distances',
            description: 'Place halves, fourths, and eighths on a number line',
            generators: ['fractionDistance'],
            difficulty: 'developing',
            subskills: ['halves on number line', 'fourths on number line', 'eighths on number line'],
          },
        ],
      },
      {
        id: '3.7B', code: '3.7B',
        description: 'Determine the perimeter of a polygon',
        concepts: [
          {
            conceptId: 'teks-3.7B-perimeter',
            label: 'Perimeter',
            description: 'Calculate perimeter by adding all side lengths',
            generators: ['perimeter'],
            difficulty: 'developing',
            subskills: ['add all sides', 'rectangles shortcut 2(l+w)', 'distinguish from area'],
          },
        ],
      },
      {
        id: '3.7C', code: '3.7C',
        description: 'Determine elapsed time',
        concepts: [
          {
            conceptId: 'teks-3.7C-time',
            label: 'Elapsed Time',
            description: 'Add and compute elapsed time in minutes and hours',
            generators: ['time'],
            difficulty: 'developing',
            subskills: ['add minutes', 'cross the hour', 'start/end time'],
          },
        ],
      },
      {
        id: '3.7D', code: '3.7D',
        description: 'Determine when to use measurements of liquid volume or weight',
        concepts: [
          {
            conceptId: 'teks-3.7D-measurement-choice',
            label: 'Capacity vs. Weight',
            description: 'Decide whether to measure liquid volume (capacity) or weight',
            generators: ['measurementChoice'],
            difficulty: 'foundational',
            subskills: ['identify capacity situations', 'identify weight situations', 'choose appropriate measurement'],
          },
        ],
      },
      {
        id: '3.7E', code: '3.7E',
        description: 'Determine liquid volume (capacity) or weight using appropriate units and tools',
        concepts: [
          {
            conceptId: 'teks-3.7E-measure-capacity-weight',
            label: 'Measure Capacity & Weight',
            description: 'Use appropriate units and tools to measure liquid volume and weight',
            generators: ['measureCapacityWeight'],
            difficulty: 'developing',
            subskills: ['liters and milliliters', 'grams and kilograms', 'choose correct tool'],
          },
        ],
      },
    ],
    'data-finance': [
      {
        id: '3.8A', code: '3.8A',
        description: 'Summarize a data set with multiple categories using graphs and tables',
        concepts: [
          {
            conceptId: 'teks-3.8A-data-display',
            label: 'Data Displays',
            description: 'Summarize data using frequency tables, dot plots, pictographs, and bar graphs',
            generators: ['dataDisplay'],
            difficulty: 'developing',
            subskills: ['read frequency table', 'read bar graph', 'read pictograph', 'interpret scaled intervals'],
          },
        ],
      },
      {
        id: '3.8B', code: '3.8B',
        description: 'Solve problems using categorical data from graphs and tables',
        concepts: [
          {
            conceptId: 'teks-3.8B-data-problems',
            label: 'Data Problem Solving',
            description: 'Solve one- and two-step problems using data from tables and graphs',
            generators: ['dataProblems'],
            difficulty: 'proficient',
            subskills: ['one-step data problems', 'two-step data problems', 'compare categories'],
          },
        ],
      },
      {
        id: '3.9A', code: '3.9A',
        description: 'Explain the connection between human capital/labor and income',
        concepts: [
          {
            conceptId: 'teks-3.9A-income',
            label: 'Income & Labor',
            description: 'Understand the relationship between work, skills, and income',
            generators: ['financialLiteracy'],
            difficulty: 'foundational',
            subskills: ['define income', 'human capital', 'labor and earnings'],
          },
        ],
      },
      {
        id: '3.9B', code: '3.9B',
        description: 'Describe the relationship between scarcity and cost',
        concepts: [
          {
            conceptId: 'teks-3.9B-scarcity',
            label: 'Scarcity & Cost',
            description: 'Understand how availability of resources affects cost',
            generators: ['financialLiteracy'],
            difficulty: 'foundational',
            subskills: ['define scarcity', 'supply and demand basics', 'cost impact'],
          },
        ],
      },
      {
        id: '3.9C', code: '3.9C',
        description: 'Identify costs and benefits of spending decisions',
        concepts: [
          {
            conceptId: 'teks-3.9C-spending',
            label: 'Spending Decisions',
            description: 'Identify costs and benefits of planned vs. unplanned spending',
            generators: ['financialLiteracy'],
            difficulty: 'developing',
            subskills: ['planned spending', 'unplanned spending', 'cost-benefit analysis'],
          },
        ],
      },
      {
        id: '3.9D', code: '3.9D',
        description: 'Explain that credit is borrowing with responsibility to repay',
        concepts: [
          {
            conceptId: 'teks-3.9D-credit',
            label: 'Credit & Borrowing',
            description: 'Understand credit, borrowing, and interest basics',
            generators: ['financialLiteracy'],
            difficulty: 'developing',
            subskills: ['define credit', 'borrower responsibility', 'interest concept'],
          },
        ],
      },
      {
        id: '3.9E', code: '3.9E',
        description: 'List reasons to save and explain the benefit of a savings plan',
        concepts: [
          {
            conceptId: 'teks-3.9E-saving',
            label: 'Saving & Planning',
            description: 'Understand the importance of saving money and having a savings plan',
            generators: ['financialLiteracy'],
            difficulty: 'foundational',
            subskills: ['reasons to save', 'savings plan benefits', 'saving for college'],
          },
        ],
      },
    ],
  },
  grade4: {
    'number-operations': [
      {
        id: '4.2A', code: '4.2A',
        description: 'Interpret place-value position as 10 times the position to the right',
        concepts: [
          {
            conceptId: 'teks-4.2A-place-value-relationships',
            label: 'Place Value Relationships',
            description: 'Understand 10× and 1/10 relationships between adjacent place values',
            generators: ['placeValue_digit'],
            difficulty: 'foundational',
            subskills: ['10 times relationship', 'one-tenth relationship', 'billions through hundredths'],
          },
        ],
      },
      {
        id: '4.2B', code: '4.2B',
        description: 'Represent digit value using expanded notation through billions and decimals',
        concepts: [
          {
            conceptId: 'teks-4.2B-expanded-notation',
            label: 'Expanded Notation',
            description: 'Write whole numbers and decimals in expanded notation',
            generators: ['placeValue_expanded'],
            difficulty: 'foundational',
            subskills: ['whole numbers to billions', 'decimals to hundredths', 'expanded form with decimals'],
          },
        ],
      },
      {
        id: '4.2C', code: '4.2C',
        description: 'Compare and order whole numbers to 1,000,000,000',
        concepts: [
          {
            conceptId: 'teks-4.2C-compare-order',
            label: 'Compare & Order Whole Numbers',
            description: 'Compare and order whole numbers using >, <, or =',
            generators: ['compareNumbers'],
            difficulty: 'foundational',
            subskills: ['compare up to billions', 'order least to greatest', 'order greatest to least'],
          },
        ],
      },
      {
        id: '4.2D', code: '4.2D',
        description: 'Round whole numbers to a given place value',
        concepts: [
          {
            conceptId: 'teks-4.2D-rounding',
            label: 'Rounding Whole Numbers',
            description: 'Round whole numbers to any place value',
            generators: ['placeValue_round'],
            difficulty: 'foundational',
            subskills: ['round to nearest 10', 'round to nearest 100', 'round to any place'],
          },
        ],
      },
    ],
    fractions: [
      {
        id: '4.3A', code: '4.3A',
        description: 'Represent a fraction a/b as a sum of fractions 1/b',
        concepts: [
          {
            conceptId: 'teks-4.3A-decompose-fractions',
            label: 'Decompose Fractions',
            description: 'Decompose fractions into sums of unit fractions',
            generators: ['composeFractions'],
            difficulty: 'foundational',
            subskills: ['decompose into unit fractions', 'multiple decompositions', 'same denominator'],
          },
        ],
      },
      {
        id: '4.3B', code: '4.3B',
        description: 'Decompose a fraction in more than one way',
        concepts: [
          {
            conceptId: 'teks-4.3B-decompose-multiple',
            label: 'Multiple Decompositions',
            description: 'Show different ways to decompose a fraction',
            generators: ['composeFractions'],
            difficulty: 'developing',
            subskills: ['different unit fraction sums', 'equivalent decompositions', 'justify with models'],
          },
        ],
      },
      {
        id: '4.3C', code: '4.3C',
        description: 'Determine if two fractions are equivalent',
        concepts: [
          {
            conceptId: 'teks-4.3C-equivalent-fractions',
            label: 'Equivalent Fractions',
            description: 'Determine equivalence using models, number lines, or reasoning',
            generators: ['equivalentFractions'],
            difficulty: 'developing',
            subskills: ['visual models', 'number line', 'multiply/divide numerator and denominator'],
          },
        ],
      },
      {
        id: '4.3D', code: '4.3D',
        description: 'Compare two fractions with different numerators and denominators',
        concepts: [
          {
            conceptId: 'teks-4.3D-compare-fractions',
            label: 'Compare Fractions',
            description: 'Compare fractions with different numerators and denominators',
            generators: ['compareFractions'],
            difficulty: 'developing',
            subskills: ['common denominator', 'common numerator', 'benchmark fractions', 'number line'],
          },
        ],
      },
      {
        id: '4.3E', code: '4.3E',
        description: 'Represent and solve addition/subtraction of fractions with equal denominators',
        concepts: [
          {
            conceptId: 'teks-4.3E-add-sub-fractions',
            label: 'Add & Subtract Fractions',
            description: 'Add and subtract fractions with like denominators',
            generators: ['addSubFractions'],
            difficulty: 'developing',
            subskills: ['add fractions', 'subtract fractions', 'sums greater than 1', 'simplify'],
          },
        ],
      },
      {
        id: '4.3F', code: '4.3F',
        description: 'Evaluate the reasonableness of sums and differences of fractions',
        concepts: [
          {
            conceptId: 'teks-4.3F-reasonableness-fractions',
            label: 'Reasonableness of Fraction Sums',
            description: 'Estimate and evaluate reasonableness of fraction sums and differences',
            generators: ['fractionEstimation'],
            difficulty: 'proficient',
            subskills: ['benchmark estimation', 'compare to 0, 1/2, 1', 'identify errors'],
          },
        ],
      },
      {
        id: '4.3G', code: '4.3G',
        description: 'Represent fractions and decimals on a number line',
        concepts: [
          {
            conceptId: 'teks-4.3G-fractions-decimals-number-line',
            label: 'Fractions & Decimals on Number Line',
            description: 'Place fractions and decimals on a number line',
            generators: ['fractionNumberLine'],
            difficulty: 'developing',
            subskills: ['fractions on number line', 'decimals on number line', 'relate fractions to decimals'],
          },
        ],
      },
    ],
    computation: [
      {
        id: '4.4A', code: '4.4A',
        description: 'Add and subtract whole numbers and decimals to hundredths',
        concepts: [
          {
            conceptId: 'teks-4.4A-add-sub-decimals',
            label: 'Add & Subtract Whole Numbers & Decimals',
            description: 'Add and subtract using the standard algorithm',
            generators: ['addSub'],
            difficulty: 'developing',
            subskills: ['whole numbers', 'decimals to hundredths', 'align place values', 'regrouping'],
          },
        ],
      },
      {
        id: '4.4B', code: '4.4B',
        description: 'Determine products of a number and 10 or 100',
        concepts: [
          {
            conceptId: 'teks-4.4B-multiply-ten-hundred',
            label: 'Multiply by 10 and 100',
            description: 'Use place value to multiply by 10 or 100',
            generators: ['multiply'],
            difficulty: 'foundational',
            subskills: ['multiply by 10', 'multiply by 100', 'place value patterns'],
          },
        ],
      },
      {
        id: '4.4C', code: '4.4C',
        description: 'Represent products of 2 two-digit numbers using arrays and area models',
        concepts: [
          {
            conceptId: 'teks-4.4C-two-digit-products',
            label: 'Two-Digit × Two-Digit',
            description: 'Multiply two two-digit numbers using models and algorithm',
            generators: ['twoDigitByOne'],
            difficulty: 'proficient',
            subskills: ['area model', 'array model', 'partial products', 'standard algorithm'],
          },
        ],
      },
      {
        id: '4.4D', code: '4.4D',
        description: 'Use strategies to multiply up to 4-digit by 1-digit and 2-digit by 2-digit',
        concepts: [
          {
            conceptId: 'teks-4.4D-multiplication-strategies',
            label: 'Multiplication Strategies',
            description: 'Use various strategies for multi-digit multiplication',
            generators: ['twoDigitByOne'],
            difficulty: 'proficient',
            subskills: ['4-digit × 1-digit', '2-digit × 2-digit', 'distributive property', 'estimation'],
          },
        ],
      },
      {
        id: '4.4E', code: '4.4E',
        description: 'Represent quotients using arrays, area models, and equations',
        concepts: [
          {
            conceptId: 'teks-4.4E-division-representations',
            label: 'Division Representations',
            description: 'Represent division with models and equations',
            generators: ['divideWord'],
            difficulty: 'developing',
            subskills: ['array model', 'area model', 'equation', 'remainder'],
          },
        ],
      },
      {
        id: '4.4F', code: '4.4F',
        description: 'Use strategies to divide up to 4-digit by 1-digit numbers',
        concepts: [
          {
            conceptId: 'teks-4.4F-division-strategies',
            label: 'Division Strategies',
            description: 'Divide with up to 4-digit dividends and 1-digit divisors',
            generators: ['divide'],
            difficulty: 'proficient',
            subskills: ['partial quotients', 'standard algorithm', 'remainder', 'interpret remainder'],
          },
        ],
      },
      {
        id: '4.4G', code: '4.4G',
        description: 'Round to the nearest 10, 100, or 1,000 to estimate solutions',
        concepts: [
          {
            conceptId: 'teks-4.4G-rounding-estimation',
            label: 'Rounding & Estimation',
            description: 'Round and use compatible numbers to estimate',
            generators: ['rounding'],
            difficulty: 'developing',
            subskills: ['round to nearest 10/100/1000', 'estimate products', 'estimate quotients'],
          },
        ],
      },
      {
        id: '4.4H', code: '4.4H',
        description: 'Solve with fluency one- and two-step problems involving multiplication and division',
        concepts: [
          {
            conceptId: 'teks-4.4H-mult-div-fluency',
            label: 'Multiplication & Division Fluency',
            description: 'Solve one- and two-step problems with multiplication and division',
            generators: ['multiplyWord', 'divideWord'],
            difficulty: 'proficient',
            subskills: ['one-step problems', 'two-step problems', 'multiplication', 'division'],
          },
        ],
      },
    ],
    'algebraic-reasoning': [
      {
        id: '4.5A', code: '4.5A',
        description: 'Represent multi-step problems using equations with a letter for unknown',
        concepts: [
          {
            conceptId: 'teks-4.5A-multi-step-equations',
            label: 'Multi-Step Equations',
            description: 'Represent problems with equations using a variable',
            generators: ['addSubWord'],
            difficulty: 'proficient',
            subskills: ['identify unknown', 'write equation', 'multi-step'],
          },
        ],
      },
      {
        id: '4.5B', code: '4.5B',
        description: 'Represent problems using an input-output table and numerical expressions',
        concepts: [
          {
            conceptId: 'teks-4.5B-input-output',
            label: 'Input-Output Tables',
            description: 'Use tables and expressions to represent relationships',
            generators: ['pattern'],
            difficulty: 'developing',
            subskills: ['input-output table', 'numerical expression', 'find rule'],
          },
        ],
      },
      {
        id: '4.5C', code: '4.5C',
        description: 'Use models to determine the formulas for perimeter and area',
        concepts: [
          {
            conceptId: 'teks-4.5C-perimeter-area-formulas',
            label: 'Perimeter & Area Formulas',
            description: 'Derive formulas for perimeter and area of rectangles',
            generators: ['perimeter', 'area'],
            difficulty: 'developing',
            subskills: ['perimeter formula', 'area formula', 'rectangles', 'squares'],
          },
        ],
      },
      {
        id: '4.5D', code: '4.5D',
        description: 'Solve problems related to perimeter and area',
        concepts: [
          {
            conceptId: 'teks-4.5D-perimeter-area-problems',
            label: 'Perimeter & Area Problems',
            description: 'Solve problems involving perimeter and area',
            generators: ['perimeter', 'area'],
            difficulty: 'proficient',
            subskills: ['find perimeter', 'find area', 'unknown side', 'word problems'],
          },
        ],
      },
    ],
    'geometry-measurement': [
      {
        id: '4.6A', code: '4.6A',
        description: 'Identify points, lines, line segments, rays, angles, and perpendicular/parallel lines',
        concepts: [
          {
            conceptId: 'teks-4.6A-geometric-figures',
            label: 'Geometric Figures',
            description: 'Identify and classify geometric figures',
            generators: ['classifyShapes'],
            difficulty: 'foundational',
            subskills: ['points', 'lines', 'rays', 'angles', 'perpendicular', 'parallel'],
          },
        ],
      },
      {
        id: '4.6B', code: '4.6B',
        description: 'Identify and draw one or more lines of symmetry',
        concepts: [
          {
            conceptId: 'teks-4.6B-symmetry',
            label: 'Lines of Symmetry',
            description: 'Identify and draw lines of symmetry',
            generators: ['symmetry'],
            difficulty: 'foundational',
            subskills: ['identify symmetry', 'draw symmetry', 'multiple lines'],
          },
        ],
      },
      {
        id: '4.6C', code: '4.6C',
        description: 'Apply knowledge of right angles to identify acute, right, and obtuse triangles',
        concepts: [
          {
            conceptId: 'teks-4.6C-triangle-types',
            label: 'Triangle Types',
            description: 'Classify triangles by angle measure',
            generators: ['classifyShapes'],
            difficulty: 'foundational',
            subskills: ['acute triangle', 'right triangle', 'obtuse triangle'],
          },
        ],
      },
      {
        id: '4.6D', code: '4.6D',
        description: 'Classify two-dimensional figures based on presence of parallel or perpendicular lines',
        concepts: [
          {
            conceptId: 'teks-4.6D-classify-2d',
            label: 'Classify 2D Figures',
            description: 'Classify figures by parallel and perpendicular lines',
            generators: ['quadrilaterals'],
            difficulty: 'developing',
            subskills: ['parallel lines', 'perpendicular lines', 'quadrilaterals', 'attributes'],
          },
        ],
      },
      {
        id: '4.7A', code: '4.7A',
        description: 'Illustrate the measure of an angle as the part of a circle',
        concepts: [
          {
            conceptId: 'teks-4.7A-angle-measure',
            label: 'Angle Measure',
            description: 'Understand angle measure as part of a circle',
            generators: ['angleMeasure'],
            difficulty: 'foundational',
            subskills: ['angle as rotation', 'degrees', 'circle'],
          },
        ],
      },
      {
        id: '4.7B', code: '4.7B',
        description: 'Illustrate degrees as the units used to measure an angle',
        concepts: [
          {
            conceptId: 'teks-4.7B-degrees',
            label: 'Degrees',
            description: 'Use degrees to measure angles',
            generators: ['angleMeasure'],
            difficulty: 'foundational',
            subskills: ['degree unit', 'protractor', 'measure angles'],
          },
        ],
      },
      {
        id: '4.7C', code: '4.7C',
        description: 'Determine the approximate measures of angles',
        concepts: [
          {
            conceptId: 'teks-4.7C-measure-angles',
            label: 'Measure Angles',
            description: 'Measure angles to the nearest degree',
            generators: ['angleMeasure'],
            difficulty: 'developing',
            subskills: ['use protractor', 'estimate', 'acute', 'obtuse', 'right'],
          },
        ],
      },
      {
        id: '4.7D', code: '4.7D',
        description: 'Draw an angle with a given measure',
        concepts: [
          {
            conceptId: 'teks-4.7D-draw-angles',
            label: 'Draw Angles',
            description: 'Draw angles of given measure',
            generators: ['angleMeasure'],
            difficulty: 'developing',
            subskills: ['draw with protractor', 'given measure', 'verify'],
          },
        ],
      },
      {
        id: '4.7E', code: '4.7E',
        description: 'Determine the measure of an unknown angle',
        concepts: [
          {
            conceptId: 'teks-4.7E-unknown-angles',
            label: 'Unknown Angles',
            description: 'Find unknown angle measures',
            generators: ['angleMeasure'],
            difficulty: 'proficient',
            subskills: ['adjacent angles', 'supplementary', 'complementary', 'unknown in figure'],
          },
        ],
      },
    ],
    'data-finance': [
      {
        id: '4.8A', code: '4.8A',
        description: 'Identify relative sizes of measurement units',
        concepts: [
          {
            conceptId: 'teks-4.8A-measurement-units',
            label: 'Measurement Units',
            description: 'Understand relative sizes of measurement units',
            generators: ['measurementChoice'],
            difficulty: 'foundational',
            subskills: ['customary units', 'metric units', 'conversions', 'relative size'],
          },
        ],
      },
      {
        id: '4.8B', code: '4.8B',
        description: 'Convert measurements within the same measurement system',
        concepts: [
          {
            conceptId: 'teks-4.8B-convert-measurements',
            label: 'Convert Measurements',
            description: 'Convert measurements within customary and metric systems',
            generators: ['measurementConversion'],
            difficulty: 'developing',
            subskills: ['customary conversions', 'metric conversions', 'multi-step'],
          },
        ],
      },
      {
        id: '4.8C', code: '4.8C',
        description: 'Solve problems involving elapsed time',
        concepts: [
          {
            conceptId: 'teks-4.8C-elapsed-time',
            label: 'Elapsed Time',
            description: 'Solve word problems involving elapsed time',
            generators: ['time'],
            difficulty: 'developing',
            subskills: ['add elapsed time', 'subtract', 'start/end time', 'multi-step'],
          },
        ],
      },
      {
        id: '4.9A', code: '4.9A',
        description: 'Represent data on a frequency table, dot plot, or stem-and-leaf plot',
        concepts: [
          {
            conceptId: 'teks-4.9A-data-display',
            label: 'Data Displays',
            description: 'Represent data using frequency tables, dot plots, stem-and-leaf',
            generators: ['dataDisplay'],
            difficulty: 'developing',
            subskills: ['frequency table', 'dot plot', 'stem-and-leaf', 'interpret'],
          },
        ],
      },
      {
        id: '4.9B', code: '4.9B',
        description: 'Solve one- and two-step problems using data in graphs',
        concepts: [
          {
            conceptId: 'teks-4.9B-data-problems',
            label: 'Data Problem Solving',
            description: 'Solve problems using data from graphs',
            generators: ['dataProblems'],
            difficulty: 'proficient',
            subskills: ['one-step', 'two-step', 'compare', 'sum', 'difference'],
          },
        ],
      },
      {
        id: '4.10A', code: '4.10A',
        description: 'Distinguish between fixed and variable expenses',
        concepts: [
          {
            conceptId: 'teks-4.10A-fixed-variable-expenses',
            label: 'Fixed & Variable Expenses',
            description: 'Distinguish between fixed and variable expenses',
            generators: ['financialLiteracy'],
            difficulty: 'foundational',
            subskills: ['fixed expenses', 'variable expenses', 'examples'],
          },
        ],
      },
      {
        id: '4.10B', code: '4.10B',
        description: 'Calculate profit in a given situation',
        concepts: [
          {
            conceptId: 'teks-4.10B-profit',
            label: 'Profit',
            description: 'Calculate profit in a given situation',
            generators: ['financialLiteracy'],
            difficulty: 'developing',
            subskills: ['revenue minus costs', 'profit formula', 'word problems'],
          },
        ],
      },
      {
        id: '4.10C', code: '4.10C',
        description: 'Compare the advantages of savings plans',
        concepts: [
          {
            conceptId: 'teks-4.10C-savings-plans',
            label: 'Savings Plans',
            description: 'Compare advantages of different savings plans',
            generators: ['financialLiteracy'],
            difficulty: 'foundational',
            subskills: ['savings options', 'compare plans', 'benefits'],
          },
        ],
      },
      {
        id: '4.10D', code: '4.10D',
        description: 'Describe how to allocate a weekly allowance',
        concepts: [
          {
            conceptId: 'teks-4.10D-allocate-allowance',
            label: 'Allocate Allowance',
            description: 'Describe how to allocate a weekly allowance',
            generators: ['financialLiteracy'],
            difficulty: 'foundational',
            subskills: ['spending', 'saving', 'sharing', 'budget'],
          },
        ],
      },
      {
        id: '4.10E', code: '4.10E',
        description: 'Describe the basic purpose of financial institutions',
        concepts: [
          {
            conceptId: 'teks-4.10E-financial-institutions',
            label: 'Financial Institutions',
            description: 'Understand the purpose of financial institutions',
            generators: ['financialLiteracy'],
            difficulty: 'foundational',
            subskills: ['banks', 'credit unions', 'savings', 'loans'],
          },
        ],
      },
    ],
  },
  grade5: {
    'number-operations': [
      {
        id: '5.2A', code: '5.2A',
        description: 'Represent digit value in decimals through thousandths using expanded notation',
        concepts: [
          {
            conceptId: 'teks-5.2A-decimal-expanded',
            label: 'Decimal Expanded Notation',
            description: 'Write decimals through thousandths in expanded notation',
            generators: ['g5_decimalExpanded'],
            difficulty: 'foundational',
            subskills: ['tenths', 'hundredths', 'thousandths', 'expanded form'],
          },
        ],
      },
      {
        id: '5.2B', code: '5.2B',
        description: 'Compare and order two decimals to thousandths',
        concepts: [
          {
            conceptId: 'teks-5.2B-compare-decimals',
            label: 'Compare & Order Decimals',
            description: 'Compare and order decimals to thousandths using >, <, =',
            generators: ['g5_compareDecimals'],
            difficulty: 'foundational',
            subskills: ['compare decimals', 'order least to greatest', 'thousandths'],
          },
        ],
      },
      {
        id: '5.2C', code: '5.2C',
        description: 'Round decimals to tenths or hundredths',
        concepts: [
          {
            conceptId: 'teks-5.2C-round-decimals',
            label: 'Round Decimals',
            description: 'Round decimals to tenths or hundredths',
            generators: ['g5_roundDecimals'],
            difficulty: 'foundational',
            subskills: ['round to tenths', 'round to hundredths'],
          },
        ],
      },
    ],
    computation: [
      {
        id: '5.3A', code: '5.3A',
        description: 'Estimate to determine solutions to mathematical and real-world problems',
        concepts: [
          {
            conceptId: 'teks-5.3A-estimation',
            label: 'Estimation',
            description: 'Estimate solutions for add, sub, mult, div problems',
            generators: ['g5_estimation'],
            difficulty: 'developing',
            subskills: ['round and estimate', 'reasonableness', 'real-world'],
          },
        ],
      },
      {
        id: '5.3B', code: '5.3B',
        description: 'Multiply three-digit by two-digit numbers using standard algorithm',
        concepts: [
          {
            conceptId: 'teks-5.3B-multiply-3x2',
            label: 'Three-Digit × Two-Digit',
            description: 'Multiply with fluency using standard algorithm',
            generators: ['g5_multiply3x2'],
            difficulty: 'proficient',
            subskills: ['standard algorithm', 'regrouping', 'fluency'],
          },
        ],
      },
      {
        id: '5.3C', code: '5.3C',
        description: 'Solve for quotients of four-digit dividend by two-digit divisor',
        concepts: [
          {
            conceptId: 'teks-5.3C-division-4x2',
            label: 'Division 4-Digit ÷ 2-Digit',
            description: 'Divide with proficiency using standard algorithm',
            generators: ['g5_division4x2'],
            difficulty: 'proficient',
            subskills: ['standard algorithm', 'partial quotients', 'remainders'],
          },
        ],
      },
    ],
    fractions: [
      {
        id: '5.3D', code: '5.3D',
        description: 'Represent multiplication of decimals with products to hundredths',
        concepts: [
          {
            conceptId: 'teks-5.3D-decimal-mult-models',
            label: 'Decimal Multiplication Models',
            description: 'Use area models for decimal multiplication',
            generators: ['g5_decimalMultModels'],
            difficulty: 'developing',
            subskills: ['area model', 'hundredths', 'pictorial'],
          },
        ],
      },
      {
        id: '5.3E', code: '5.3E',
        description: 'Solve for products of decimals to hundredths',
        concepts: [
          {
            conceptId: 'teks-5.3E-decimal-multiply',
            label: 'Multiply Decimals',
            description: 'Multiply decimals to hundredths including money',
            generators: ['g5_decimalMultiply'],
            difficulty: 'proficient',
            subskills: ['place value', 'money', 'hundredths'],
          },
        ],
      },
      {
        id: '5.3F', code: '5.3F',
        description: 'Represent quotients of decimals using area models',
        concepts: [
          {
            conceptId: 'teks-5.3F-decimal-div-models',
            label: 'Decimal Division Models',
            description: 'Use area models for decimal division',
            generators: ['g5_decimalDivModels'],
            difficulty: 'developing',
            subskills: ['area model', 'quotient', 'dividend', 'divisor'],
          },
        ],
      },
      {
        id: '5.3G', code: '5.3G',
        description: 'Solve for quotients of decimals to hundredths',
        concepts: [
          {
            conceptId: 'teks-5.3G-decimal-divide',
            label: 'Divide Decimals',
            description: 'Divide decimals using strategies and algorithms',
            generators: ['g5_decimalDivide'],
            difficulty: 'proficient',
            subskills: ['standard algorithm', 'hundredths', 'remainder'],
          },
        ],
      },
      {
        id: '5.3H', code: '5.3H',
        description: 'Add and subtract fractions with unequal denominators',
        concepts: [
          {
            conceptId: 'teks-5.3H-add-sub-fractions',
            label: 'Add & Subtract Fractions',
            description: 'Add and subtract fractions with different denominators',
            generators: ['g5_addSubFractions'],
            difficulty: 'proficient',
            subskills: ['common denominator', 'equivalent fractions', 'simplify'],
          },
        ],
      },
      {
        id: '5.3I', code: '5.3I',
        description: 'Multiply whole number and fraction using models',
        concepts: [
          {
            conceptId: 'teks-5.3I-whole-times-fraction',
            label: 'Whole × Fraction',
            description: 'Represent and solve whole number times fraction',
            generators: ['g5_wholeTimesFraction'],
            difficulty: 'developing',
            subskills: ['area model', 'repeated addition', 'pictorial'],
          },
        ],
      },
      {
        id: '5.3J', code: '5.3J',
        description: 'Represent division of unit fraction by whole and whole by unit fraction',
        concepts: [
          {
            conceptId: 'teks-5.3J-fraction-division',
            label: 'Fraction Division',
            description: 'Divide unit fractions by wholes and wholes by unit fractions',
            generators: ['g5_fractionDivision'],
            difficulty: 'proficient',
            subskills: ['1/3 ÷ 7', '7 ÷ 1/3', 'area models'],
          },
        ],
      },
      {
        id: '5.3K', code: '5.3K',
        description: 'Add and subtract positive rational numbers fluently',
        concepts: [
          {
            conceptId: 'teks-5.3K-add-sub-rational',
            label: 'Add & Subtract Rational Numbers',
            description: 'Fluently add and subtract fractions and decimals',
            generators: ['g5_addSubRational'],
            difficulty: 'proficient',
            subskills: ['fractions', 'decimals', 'fluency'],
          },
        ],
      },
      {
        id: '5.3L', code: '5.3L',
        description: 'Divide whole numbers by unit fractions and unit fractions by whole numbers',
        concepts: [
          {
            conceptId: 'teks-5.3L-divide-unit-fractions',
            label: 'Divide Unit Fractions',
            description: 'Divide with unit fractions',
            generators: ['g5_divideUnitFractions'],
            difficulty: 'proficient',
            subskills: ['whole ÷ unit fraction', 'unit fraction ÷ whole'],
          },
        ],
      },
    ],
    'algebraic-reasoning': [
      {
        id: '5.4A', code: '5.4A',
        description: 'Identify prime and composite numbers',
        concepts: [
          {
            conceptId: 'teks-5.4A-prime-composite',
            label: 'Prime & Composite',
            description: 'Identify prime and composite numbers',
            generators: ['g5_primeComposite'],
            difficulty: 'foundational',
            subskills: ['prime', 'composite', 'factors'],
          },
        ],
      },
      {
        id: '5.4B', code: '5.4B',
        description: 'Represent and solve multi-step problems with equations',
        concepts: [
          {
            conceptId: 'teks-5.4B-multi-step-equations',
            label: 'Multi-Step Equations',
            description: 'Solve multi-step problems using equations with letter for unknown',
            generators: ['g5_multiStepEquations'],
            difficulty: 'proficient',
            subskills: ['four operations', 'unknown quantity', 'strip diagrams'],
          },
        ],
      },
      {
        id: '5.4C', code: '5.4C',
        description: 'Generate numerical pattern from rule y = ax or y = x + a',
        concepts: [
          {
            conceptId: 'teks-5.4C-numerical-patterns',
            label: 'Numerical Patterns',
            description: 'Generate and graph patterns from rules',
            generators: ['g5_numericalPatterns'],
            difficulty: 'developing',
            subskills: ['y = ax', 'y = x + a', 'graph', 'table'],
          },
        ],
      },
      {
        id: '5.4D', code: '5.4D',
        description: 'Recognize additive vs multiplicative patterns',
        concepts: [
          {
            conceptId: 'teks-5.4D-pattern-types',
            label: 'Additive vs Multiplicative Patterns',
            description: 'Distinguish between additive and multiplicative patterns',
            generators: ['g5_patternTypes'],
            difficulty: 'developing',
            subskills: ['additive', 'multiplicative', 'table', 'graph'],
          },
        ],
      },
      {
        id: '5.4E', code: '5.4E',
        description: 'Describe the meaning of parentheses and brackets in expressions',
        concepts: [
          {
            conceptId: 'teks-5.4E-parentheses-brackets',
            label: 'Parentheses & Brackets',
            description: 'Understand order of operations with grouping symbols',
            generators: ['g5_parenthesesBrackets'],
            difficulty: 'foundational',
            subskills: ['parentheses', 'brackets', 'order of operations'],
          },
        ],
      },
      {
        id: '5.4F', code: '5.4F',
        description: 'Simplify numerical expressions with up to two levels of grouping',
        concepts: [
          {
            conceptId: 'teks-5.4F-simplify-expressions',
            label: 'Simplify Expressions',
            description: 'Simplify expressions with grouping symbols',
            generators: ['g5_simplifyExpressions'],
            difficulty: 'proficient',
            subskills: ['order of operations', 'two levels', 'no exponents'],
          },
        ],
      },
      {
        id: '5.4G', code: '5.4G',
        description: 'Develop formulas for volume of rectangular prism',
        concepts: [
          {
            conceptId: 'teks-5.4G-volume-formula',
            label: 'Volume Formula',
            description: 'Develop V = l × w × h and V = Bh',
            generators: ['g5_volumeFormula'],
            difficulty: 'developing',
            subskills: ['rectangular prism', 'cube', 'unit cubes'],
          },
        ],
      },
      {
        id: '5.4H', code: '5.4H',
        description: 'Solve problems related to perimeter, area, and volume',
        concepts: [
          {
            conceptId: 'teks-5.4H-perimeter-area-volume',
            label: 'Perimeter, Area & Volume',
            description: 'Solve problems involving perimeter, area, and volume',
            generators: ['g5_perimeterAreaVolume'],
            difficulty: 'proficient',
            subskills: ['perimeter', 'area', 'volume', 'word problems'],
          },
        ],
      },
    ],
    'geometry-measurement': [
      {
        id: '5.5A', code: '5.5A',
        description: 'Classify 2D figures in a hierarchy of sets and subsets',
        concepts: [
          {
            conceptId: 'teks-5.5A-classify-hierarchy',
            label: 'Classify 2D Hierarchy',
            description: 'Classify figures using graphic organizers',
            generators: ['g5_classifyHierarchy'],
            difficulty: 'proficient',
            subskills: ['quadrilaterals', 'attributes', 'properties', 'hierarchy'],
          },
        ],
      },
      {
        id: '5.6A', code: '5.6A',
        description: 'Recognize unit cube and volume as number of unit cubes',
        concepts: [
          {
            conceptId: 'teks-5.6A-unit-cube-volume',
            label: 'Unit Cube & Volume',
            description: 'Understand volume as filling with unit cubes',
            generators: ['g5_unitCubeVolume'],
            difficulty: 'foundational',
            subskills: ['unit cube', 'cubic unit', 'fill', 'no gaps'],
          },
        ],
      },
      {
        id: '5.6B', code: '5.6B',
        description: 'Determine volume of rectangular prism',
        concepts: [
          {
            conceptId: 'teks-5.6B-volume-rectangular-prism',
            label: 'Volume of Rectangular Prism',
            description: 'Find volume by packing or counting unit cubes',
            generators: ['g5_volumeRectangularPrism'],
            difficulty: 'developing',
            subskills: ['packing', 'counting', 'whole number sides'],
          },
        ],
      },
      {
        id: '5.7A', code: '5.7A',
        description: 'Solve problems by calculating conversions within measurement system',
        concepts: [
          {
            conceptId: 'teks-5.7A-measurement-conversions',
            label: 'Measurement Conversions',
            description: 'Convert within customary or metric systems',
            generators: ['g5_measurementConversions'],
            difficulty: 'proficient',
            subskills: ['customary', 'metric', 'conversion', 'multi-step'],
          },
        ],
      },
      {
        id: '5.8A', code: '5.8A',
        description: 'Describe key attributes of the coordinate plane',
        concepts: [
          {
            conceptId: 'teks-5.8A-coordinate-plane',
            label: 'Coordinate Plane',
            description: 'Understand axes, origin, x and y coordinates',
            generators: ['g5_coordinatePlane'],
            difficulty: 'foundational',
            subskills: ['axes', 'origin', 'x-coordinate', 'y-coordinate', 'ordered pair'],
          },
        ],
      },
      {
        id: '5.8B', code: '5.8B',
        description: 'Describe process for graphing ordered pairs',
        concepts: [
          {
            conceptId: 'teks-5.8B-graph-ordered-pairs',
            label: 'Graph Ordered Pairs',
            description: 'Graph ordered pairs in first quadrant',
            generators: ['g5_graphOrderedPairs'],
            difficulty: 'foundational',
            subskills: ['first quadrant', 'plot points', 'process'],
          },
        ],
      },
      {
        id: '5.8C', code: '5.8C',
        description: 'Graph ordered pairs from mathematical and real-world problems',
        concepts: [
          {
            conceptId: 'teks-5.8C-graph-problems',
            label: 'Graph from Problems',
            description: 'Graph ordered pairs from number patterns and problems',
            generators: ['g5_graphProblems'],
            difficulty: 'developing',
            subskills: ['number patterns', 'input-output', 'real-world'],
          },
        ],
      },
    ],
    'data-finance': [
      {
        id: '5.9A', code: '5.9A',
        description: 'Represent categorical and numerical data',
        concepts: [
          {
            conceptId: 'teks-5.9A-data-representation',
            label: 'Data Representation',
            description: 'Represent data with bar graphs, frequency tables, dot plots, stem-and-leaf',
            generators: ['g5_dataRepresentation'],
            difficulty: 'developing',
            subskills: ['bar graph', 'frequency table', 'dot plot', 'stem-and-leaf', 'fractions', 'decimals'],
          },
        ],
      },
      {
        id: '5.9B', code: '5.9B',
        description: 'Represent discrete paired data on scatterplot',
        concepts: [
          {
            conceptId: 'teks-5.9B-scatterplot',
            label: 'Scatterplot',
            description: 'Represent paired data on a scatterplot',
            generators: ['g5_scatterplot'],
            difficulty: 'developing',
            subskills: ['paired data', 'scatterplot', 'discrete'],
          },
        ],
      },
      {
        id: '5.9C', code: '5.9C',
        description: 'Solve problems using data from various graphs',
        concepts: [
          {
            conceptId: 'teks-5.9C-data-problems',
            label: 'Data Problem Solving',
            description: 'Solve one- and two-step problems using data',
            generators: ['g5_dataProblems'],
            difficulty: 'proficient',
            subskills: ['frequency table', 'dot plot', 'bar graph', 'stem-and-leaf', 'scatterplot'],
          },
        ],
      },
      {
        id: '5.10A', code: '5.10A',
        description: 'Define income tax, payroll tax, sales tax, and property tax',
        concepts: [
          {
            conceptId: 'teks-5.10A-tax-types',
            label: 'Types of Taxes',
            description: 'Define different types of taxes',
            generators: ['g5_taxTypes'],
            difficulty: 'foundational',
            subskills: ['income tax', 'payroll tax', 'sales tax', 'property tax'],
          },
        ],
      },
      {
        id: '5.10B', code: '5.10B',
        description: 'Explain difference between gross and net income',
        concepts: [
          {
            conceptId: 'teks-5.10B-gross-net-income',
            label: 'Gross vs Net Income',
            description: 'Distinguish gross and net income',
            generators: ['g5_grossNetIncome'],
            difficulty: 'foundational',
            subskills: ['gross income', 'net income', 'deductions'],
          },
        ],
      },
      {
        id: '5.10C', code: '5.10C',
        description: 'Identify advantages and disadvantages of payment methods',
        concepts: [
          {
            conceptId: 'teks-5.10C-payment-methods',
            label: 'Payment Methods',
            description: 'Compare check, credit card, debit card, electronic payments',
            generators: ['g5_paymentMethods'],
            difficulty: 'foundational',
            subskills: ['check', 'credit card', 'debit card', 'electronic', 'advantages', 'disadvantages'],
          },
        ],
      },
      {
        id: '5.10D', code: '5.10D',
        description: 'Develop a system for keeping financial records',
        concepts: [
          {
            conceptId: 'teks-5.10D-financial-records',
            label: 'Financial Records',
            description: 'Develop system for keeping and using financial records',
            generators: ['g5_financialRecords'],
            difficulty: 'foundational',
            subskills: ['records', 'tracking', 'system'],
          },
        ],
      },
      {
        id: '5.10E', code: '5.10E',
        description: 'Describe actions to balance budget when expenses exceed income',
        concepts: [
          {
            conceptId: 'teks-5.10E-balance-budget',
            label: 'Balance Budget',
            description: 'Describe actions when expenses exceed income',
            generators: ['g5_balanceBudget'],
            difficulty: 'developing',
            subskills: ['budget', 'expenses', 'income', 'balance'],
          },
        ],
      },
      {
        id: '5.10F', code: '5.10F',
        description: 'Balance a simple budget',
        concepts: [
          {
            conceptId: 'teks-5.10F-simple-budget',
            label: 'Simple Budget',
            description: 'Balance a simple budget',
            generators: ['g5_simpleBudget'],
            difficulty: 'proficient',
            subskills: ['income', 'expenses', 'balance', 'budget'],
          },
        ],
      },
    ],
  },
  grade6: {
    'number-operations': [
      { id: '6.2A', code: '6.2A', description: 'Classify whole numbers, integers, and rational numbers using Venn diagrams', concepts: [{ conceptId: 'teks-6.2A-classify-numbers', label: 'Classify Rational Numbers', description: 'Classify numbers using Venn diagrams', generators: ['g6_classifyNumbers'], difficulty: 'foundational', subskills: ['whole numbers', 'integers', 'rational numbers', 'Venn diagram'] }] },
      { id: '6.2B', code: '6.2B', description: 'Identify a number, its opposite, and its absolute value', concepts: [{ conceptId: 'teks-6.2B-opposite-absolute', label: 'Opposite & Absolute Value', description: 'Find opposite and absolute value', generators: ['g6_oppositeAbsolute'], difficulty: 'foundational', subskills: ['opposite', 'absolute value'] }] },
      { id: '6.2C', code: '6.2C', description: 'Locate, compare, and order integers and rational numbers on a number line', concepts: [{ conceptId: 'teks-6.2C-compare-order-number-line', label: 'Compare & Order on Number Line', description: 'Compare and order rational numbers', generators: ['g6_compareOrderNumberLine'], difficulty: 'foundational', subskills: ['number line', 'compare', 'order'] }] },
      { id: '6.2D', code: '6.2D', description: 'Order a set of rational numbers from mathematical and real-world contexts', concepts: [{ conceptId: 'teks-6.2D-order-rational', label: 'Order Rational Numbers', description: 'Order rational numbers in context', generators: ['g6_orderRational'], difficulty: 'developing', subskills: ['order', 'rational numbers', 'context'] }] },
      { id: '6.2E', code: '6.2E', description: 'Extend division to fraction notation a/b = a ÷ b', concepts: [{ conceptId: 'teks-6.2E-fraction-division', label: 'Fraction as Division', description: 'Understand a/b = a ÷ b', generators: ['g6_fractionDivision'], difficulty: 'foundational', subskills: ['fraction', 'division', 'notation'] }] },
    ],
    computation: [
      { id: '6.3A', code: '6.3A', description: 'Divide by rational = multiply by reciprocal', concepts: [{ conceptId: 'teks-6.3A-reciprocal', label: 'Division & Reciprocal', description: 'Divide by multiplying by reciprocal', generators: ['g6_reciprocal'], difficulty: 'foundational', subskills: ['reciprocal', 'division', 'multiplication'] }] },
      { id: '6.3B', code: '6.3B', description: 'Determine if quantity increases or decreases when multiplied by a fraction', concepts: [{ conceptId: 'teks-6.3B-fraction-scaling', label: 'Fraction Scaling', description: 'Effect of multiplying by fraction', generators: ['g6_fractionScaling'], difficulty: 'developing', subskills: ['fraction > 1', 'fraction < 1', 'increase', 'decrease'] }] },
      { id: '6.3C', code: '6.3C', description: 'Represent integer operations with concrete models', concepts: [{ conceptId: 'teks-6.3C-integer-models', label: 'Integer Operation Models', description: 'Model integer add/sub/mult/div', generators: ['g6_integerModels'], difficulty: 'foundational', subskills: ['counters', 'number line', 'models'] }] },
      { id: '6.3D', code: '6.3D', description: 'Add, subtract, multiply, and divide integers fluently', concepts: [{ conceptId: 'teks-6.3D-integer-operations', label: 'Integer Operations', description: 'Fluently operate with integers', generators: ['g6_integerOperations'], difficulty: 'proficient', subskills: ['add', 'subtract', 'multiply', 'divide', 'integers'] }] },
      { id: '6.3E', code: '6.3E', description: 'Multiply and divide positive rational numbers fluently', concepts: [{ conceptId: 'teks-6.3E-rational-operations', label: 'Rational Number Operations', description: 'Fluently multiply and divide rationals', generators: ['g6_rationalOperations'], difficulty: 'proficient', subskills: ['fractions', 'decimals', 'fluency'] }] },
    ],
    proportionality: [
      { id: '6.4A', code: '6.4A', description: 'Compare additive vs multiplicative relationships (y = ax vs y = x + a)', concepts: [{ conceptId: 'teks-6.4A-additive-multiplicative', label: 'Additive vs Multiplicative', description: 'Differentiate y = ax and y = x + a', generators: ['g6_additiveMultiplicative'], difficulty: 'developing', subskills: ['additive', 'multiplicative', 'y = ax', 'y = x + a'] }] },
      { id: '6.4B', code: '6.4B', description: 'Apply reasoning to solve ratio and rate problems', concepts: [{ conceptId: 'teks-6.4B-ratio-rate-reasoning', label: 'Ratio & Rate Reasoning', description: 'Solve prediction and comparison problems', generators: ['g6_ratioRateReasoning'], difficulty: 'proficient', subskills: ['ratios', 'rates', 'real-world'] }] },
      { id: '6.4E', code: '6.4E', description: 'Represent ratios and percents with models, fractions, decimals', concepts: [{ conceptId: 'teks-6.4E-ratios-percents', label: 'Ratios & Percents', description: 'Represent with models and symbols', generators: ['g6_ratiosPercents'], difficulty: 'developing', subskills: ['concrete models', 'fractions', 'decimals'] }] },
      { id: '6.4H', code: '6.4H', description: 'Convert units using proportions and unit rates', concepts: [{ conceptId: 'teks-6.4H-unit-conversion', label: 'Unit Conversion', description: 'Convert within measurement systems', generators: ['g6_unitConversion'], difficulty: 'proficient', subskills: ['proportions', 'unit rates', 'customary', 'metric'] }] },
      { id: '6.5A', code: '6.5A', description: 'Represent ratio and rate problems with scale factors, tables, graphs, proportions', concepts: [{ conceptId: 'teks-6.5A-ratio-representations', label: 'Ratio Representations', description: 'Represent with tables, graphs, proportions', generators: ['g6_ratioRepresentations'], difficulty: 'developing', subskills: ['scale factor', 'tables', 'graphs', 'proportions'] }] },
      { id: '6.5B', code: '6.5B', description: 'Solve percent problems: find whole, part, or percent', concepts: [{ conceptId: 'teks-6.5B-percent-problems', label: 'Percent Problems', description: 'Find whole, part, or percent', generators: ['g6_percentProblems'], difficulty: 'proficient', subskills: ['whole', 'part', 'percent', 'models'] }] },
    ],
    'algebraic-reasoning': [
      { id: '6.6A', code: '6.6A', description: 'Identify independent and dependent quantities from tables and graphs', concepts: [{ conceptId: 'teks-6.6A-independent-dependent', label: 'Independent & Dependent', description: 'Identify from tables and graphs', generators: ['g6_independentDependent'], difficulty: 'foundational', subskills: ['independent', 'dependent', 'tables', 'graphs'] }] },
      { id: '6.6B', code: '6.6B', description: 'Write equation from table representing relationship', concepts: [{ conceptId: 'teks-6.6B-equation-from-table', label: 'Equation from Table', description: 'Write equation from table', generators: ['g6_equationFromTable'], difficulty: 'developing', subskills: ['table', 'equation', 'relationship'] }] },
      { id: '6.6C', code: '6.6C', description: 'Represent situation with y = kx or y = x + b', concepts: [{ conceptId: 'teks-6.6C-represent-y-kx', label: 'Represent y = kx or y = x + b', description: 'Verbal, table, graph, equation', generators: ['g6_representYkx'], difficulty: 'developing', subskills: ['y = kx', 'y = x + b', 'tables', 'graphs'] }] },
      { id: '6.7A', code: '6.7A', description: 'Generate equivalent expressions using order of operations and exponents', concepts: [{ conceptId: 'teks-6.7A-order-operations', label: 'Order of Operations & Exponents', description: 'Equivalent expressions with exponents', generators: ['g6_orderOperations'], difficulty: 'developing', subskills: ['order of operations', 'exponents', 'prime factorization'] }] },
      { id: '6.7B', code: '6.7B', description: 'Distinguish between expressions and equations', concepts: [{ conceptId: 'teks-6.7B-expressions-equations', label: 'Expressions vs Equations', description: 'Distinguish verbally, numerically, algebraically', generators: ['g6_expressionsEquations'], difficulty: 'foundational', subskills: ['expression', 'equation', 'variable'] }] },
      { id: '6.7C', code: '6.7C', description: 'Determine if two expressions are equivalent', concepts: [{ conceptId: 'teks-6.7C-equivalent-expressions', label: 'Equivalent Expressions', description: 'Determine equivalence using models', generators: ['g6_equivalentExpressions'], difficulty: 'developing', subskills: ['concrete', 'pictorial', 'algebraic'] }] },
      { id: '6.7D', code: '6.7D', description: 'Generate equivalent expressions using properties', concepts: [{ conceptId: 'teks-6.7D-properties-operations', label: 'Properties of Operations', description: 'Inverse, identity, commutative, associative, distributive', generators: ['g6_propertiesOperations'], difficulty: 'developing', subskills: ['distributive', 'commutative', 'associative'] }] },
      { id: '6.9A', code: '6.9A', description: 'Write one-step equations and inequalities', concepts: [{ conceptId: 'teks-6.9A-write-equations', label: 'Write Equations & Inequalities', description: 'One-variable, one-step', generators: ['g6_writeEquations'], difficulty: 'developing', subskills: ['equation', 'inequality', 'constraints'] }] },
      { id: '6.9B', code: '6.9B', description: 'Represent solutions on number lines', concepts: [{ conceptId: 'teks-6.9B-solutions-number-line', label: 'Solutions on Number Line', description: 'Graph solutions to equations and inequalities', generators: ['g6_solutionsNumberLine'], difficulty: 'foundational', subskills: ['number line', 'solution', 'graph'] }] },
      { id: '6.10A', code: '6.10A', description: 'Model and solve one-step equations and inequalities', concepts: [{ conceptId: 'teks-6.10A-solve-equations', label: 'Solve One-Step Equations', description: 'Model and solve including geometric', generators: ['g6_solveEquations'], difficulty: 'proficient', subskills: ['one-step', 'model', 'solve', 'geometric'] }] },
      { id: '6.10B', code: '6.10B', description: 'Determine if value(s) make equation or inequality true', concepts: [{ conceptId: 'teks-6.10B-check-solutions', label: 'Check Solutions', description: 'Verify if value satisfies equation/inequality', generators: ['g6_checkSolutions'], difficulty: 'foundational', subskills: ['substitute', 'verify', 'true', 'false'] }] },
    ],
    'geometry-measurement': [
      { id: '6.8A', code: '6.8A', description: 'Triangle properties: sum of angles, side-angle relationship, triangle inequality', concepts: [{ conceptId: 'teks-6.8A-triangle-properties', label: 'Triangle Properties', description: 'Sum of angles, side lengths', generators: ['g6_triangleProperties'], difficulty: 'developing', subskills: ['sum of angles', 'triangle inequality', 'side-angle'] }] },
      { id: '6.8B', code: '6.8B', description: 'Model area formulas for parallelograms, trapezoids, triangles', concepts: [{ conceptId: 'teks-6.8B-area-formulas', label: 'Area Formulas', description: 'Parallelogram, trapezoid, triangle', generators: ['g6_areaFormulas'], difficulty: 'developing', subskills: ['parallelogram', 'trapezoid', 'triangle', 'decompose'] }] },
      { id: '6.8C', code: '6.8C', description: 'Write equations for area and volume problems', concepts: [{ conceptId: 'teks-6.8C-area-volume-equations', label: 'Area & Volume Equations', description: 'Write equations for problems', generators: ['g6_areaVolumeEquations'], difficulty: 'proficient', subskills: ['rectangle', 'parallelogram', 'trapezoid', 'triangle', 'volume'] }] },
      { id: '6.8D', code: '6.8D', description: 'Solve area and volume problems', concepts: [{ conceptId: 'teks-6.8D-area-volume-solve', label: 'Solve Area & Volume', description: 'Determine solutions for area/volume', generators: ['g6_areaVolumeSolve'], difficulty: 'proficient', subskills: ['area', 'volume', 'rational dimensions'] }] },
      { id: '6.11', code: '6.11', description: 'Graph points in all four quadrants', concepts: [{ conceptId: 'teks-6.11-coordinate-plane', label: 'Coordinate Plane', description: 'Graph points in all four quadrants', generators: ['g6_coordinatePlane'], difficulty: 'foundational', subskills: ['four quadrants', 'ordered pairs', 'rational numbers'] }] },
    ],
    'data-finance': [
      { id: '6.12A', code: '6.12A', description: 'Represent numeric data with dot plots, stem-and-leaf, histograms, box plots', concepts: [{ conceptId: 'teks-6.12A-data-graphical', label: 'Data Graphical Representation', description: 'Dot plots, stem-and-leaf, histograms, box plots', generators: ['g6_dataGraphical'], difficulty: 'developing', subskills: ['dot plot', 'stem-and-leaf', 'histogram', 'box plot'] }] },
      { id: '6.12B', code: '6.12B', description: 'Describe center, spread, and shape of data distribution', concepts: [{ conceptId: 'teks-6.12B-data-distribution', label: 'Data Distribution', description: 'Center, spread, shape', generators: ['g6_dataDistribution'], difficulty: 'developing', subskills: ['center', 'spread', 'shape'] }] },
      { id: '6.12C', code: '6.12C', description: 'Summarize with mean, median, range, IQR', concepts: [{ conceptId: 'teks-6.12C-numerical-summaries', label: 'Numerical Summaries', description: 'Mean, median, range, IQR', generators: ['g6_numericalSummaries'], difficulty: 'proficient', subskills: ['mean', 'median', 'range', 'IQR'] }] },
      { id: '6.12D', code: '6.12D', description: 'Summarize categorical data with mode, relative frequency, percent bar graph', concepts: [{ conceptId: 'teks-6.12D-categorical-summary', label: 'Categorical Data Summary', description: 'Mode, relative frequency, percent bar', generators: ['g6_categoricalSummary'], difficulty: 'developing', subskills: ['mode', 'relative frequency', 'percent bar'] }] },
      { id: '6.13A', code: '6.13A', description: 'Interpret numeric data in dot plots, stem-and-leaf, histograms, box plots', concepts: [{ conceptId: 'teks-6.13A-interpret-data', label: 'Interpret Data', description: 'Interpret various data displays', generators: ['g6_interpretData'], difficulty: 'proficient', subskills: ['interpret', 'dot plot', 'histogram', 'box plot'] }] },
      { id: '6.14A', code: '6.14A', description: 'Compare checking accounts and debit cards', concepts: [{ conceptId: 'teks-6.14A-checking-accounts', label: 'Checking Accounts', description: 'Compare features and costs', generators: ['g6_checkingAccounts'], difficulty: 'foundational', subskills: ['checking', 'debit card', 'financial institutions'] }] },
      { id: '6.14B', code: '6.14B', description: 'Distinguish debit vs credit cards', concepts: [{ conceptId: 'teks-6.14B-debit-credit', label: 'Debit vs Credit Cards', description: 'Distinguish between card types', generators: ['g6_debitCredit'], difficulty: 'foundational', subskills: ['debit', 'credit', 'difference'] }] },
      { id: '6.14C', code: '6.14C', description: 'Balance a check register', concepts: [{ conceptId: 'teks-6.14C-check-register', label: 'Check Register', description: 'Balance with deposits, withdrawals, transfers', generators: ['g6_checkRegister'], difficulty: 'developing', subskills: ['deposits', 'withdrawals', 'transfers', 'balance'] }] },
    ],
  },
  grade7: {
    'number-operations': [
      { id: '7.2', code: '7.2', description: 'Extend knowledge of sets and subsets using visual representation for rational numbers', concepts: [{ conceptId: 'teks-7.2-rational-sets', label: 'Rational Number Sets', description: 'Describe relationships between sets of rational numbers', generators: ['g7_rationalSets'], difficulty: 'foundational', subskills: ['sets', 'subsets', 'rational numbers', 'Venn diagram'] }] },
    ],
    computation: [
      { id: '7.3A', code: '7.3A', description: 'Add, subtract, multiply, and divide rational numbers fluently', concepts: [{ conceptId: 'teks-7.3A-rational-fluency', label: 'Rational Number Fluency', description: 'Fluently operate with rational numbers', generators: ['g7_rationalFluency'], difficulty: 'proficient', subskills: ['fractions', 'decimals', 'integers', 'fluency'] }] },
      { id: '7.3B', code: '7.3B', description: 'Apply operations to solve problems with rational numbers', concepts: [{ conceptId: 'teks-7.3B-rational-problems', label: 'Rational Number Problems', description: 'Solve multi-step problems with rationals', generators: ['g7_rationalProblems'], difficulty: 'proficient', subskills: ['word problems', 'rational numbers', 'multi-step'] }] },
    ],
    proportionality: [
      { id: '7.4A', code: '7.4A', description: 'Represent constant rates of change (d = rt)', concepts: [{ conceptId: 'teks-7.4A-constant-rate', label: 'Constant Rate of Change', description: 'Represent d = rt in multiple forms', generators: ['g7_constantRate'], difficulty: 'developing', subskills: ['rate', 'distance', 'time', 'tables', 'graphs'] }] },
      { id: '7.4B', code: '7.4B', description: 'Calculate unit rates from rates', concepts: [{ conceptId: 'teks-7.4B-unit-rates', label: 'Unit Rates', description: 'Calculate unit rates from given rates', generators: ['g7_unitRates'], difficulty: 'developing', subskills: ['unit rate', 'proportion'] }] },
      { id: '7.4C', code: '7.4C', description: 'Determine constant of proportionality k = y/x', concepts: [{ conceptId: 'teks-7.4C-constant-proportionality', label: 'Constant of Proportionality', description: 'Find k in proportional relationships', generators: ['g7_constantProportionality'], difficulty: 'developing', subskills: ['k = y/x', 'proportional', 'tables', 'graphs'] }] },
      { id: '7.4D', code: '7.4D', description: 'Solve ratio, rate, percent problems including percent increase/decrease', concepts: [{ conceptId: 'teks-7.4D-ratio-rate-percent', label: 'Ratios, Rates & Percents', description: 'Multi-step percent and financial problems', generators: ['g7_ratioRatePercent'], difficulty: 'proficient', subskills: ['percent increase', 'percent decrease', 'financial literacy'] }] },
      { id: '7.4E', code: '7.4E', description: 'Convert between measurement systems using proportions and unit rates', concepts: [{ conceptId: 'teks-7.4E-measurement-conversion', label: 'Measurement Conversion', description: 'Convert customary and metric', generators: ['g7_measurementConversion'], difficulty: 'developing', subskills: ['customary', 'metric', 'proportions', 'unit rates'] }] },
      { id: '7.5A', code: '7.5A', description: 'Generalize critical attributes of similarity', concepts: [{ conceptId: 'teks-7.5A-similarity', label: 'Similarity', description: 'Ratios within and between similar shapes', generators: ['g7_similarity'], difficulty: 'developing', subskills: ['similar', 'scale factor', 'ratios'] }] },
      { id: '7.5B', code: '7.5B', description: 'Describe π as ratio of circumference to diameter', concepts: [{ conceptId: 'teks-7.5B-pi-ratio', label: 'Pi as Ratio', description: 'π = C/d', generators: ['g7_piRatio'], difficulty: 'foundational', subskills: ['pi', 'circumference', 'diameter'] }] },
      { id: '7.5C', code: '7.5C', description: 'Solve problems involving similar shapes and scale drawings', concepts: [{ conceptId: 'teks-7.5C-scale-drawings', label: 'Scale Drawings', description: 'Similar shapes and scale factor problems', generators: ['g7_scaleDrawings'], difficulty: 'proficient', subskills: ['scale', 'similar figures', 'indirect measurement'] }] },
      { id: '7.6A', code: '7.6A', description: 'Represent sample spaces for simple and compound events', concepts: [{ conceptId: 'teks-7.6A-sample-spaces', label: 'Sample Spaces', description: 'Lists and tree diagrams', generators: ['g7_sampleSpaces'], difficulty: 'foundational', subskills: ['sample space', 'tree diagram', 'compound events'] }] },
      { id: '7.6I', code: '7.6I', description: 'Determine experimental and theoretical probabilities', concepts: [{ conceptId: 'teks-7.6I-probability', label: 'Experimental & Theoretical Probability', description: 'Simple and compound events', generators: ['g7_probability'], difficulty: 'proficient', subskills: ['experimental', 'theoretical', 'compound events'] }] },
    ],
    'algebraic-reasoning': [
      { id: '7.7', code: '7.7', description: 'Represent linear relationships as y = mx + b', concepts: [{ conceptId: 'teks-7.7-linear-relationships', label: 'Linear Relationships', description: 'Verbal, table, graph, equation y = mx + b', generators: ['g7_linearRelationships'], difficulty: 'developing', subskills: ['linear', 'y = mx + b', 'tables', 'graphs'] }] },
      { id: '7.10A', code: '7.10A', description: 'Write two-step equations and inequalities', concepts: [{ conceptId: 'teks-7.10A-write-equations', label: 'Write Two-Step Equations', description: 'Represent constraints with equations/inequalities', generators: ['g7_writeEquations'], difficulty: 'developing', subskills: ['two-step', 'equation', 'inequality'] }] },
      { id: '7.10B', code: '7.10B', description: 'Represent solutions on number lines', concepts: [{ conceptId: 'teks-7.10B-solutions-number-line', label: 'Solutions on Number Line', description: 'Graph two-step equation/inequality solutions', generators: ['g7_solutionsNumberLine'], difficulty: 'foundational', subskills: ['number line', 'solution', 'graph'] }] },
      { id: '7.11A', code: '7.11A', description: 'Model and solve two-step equations and inequalities', concepts: [{ conceptId: 'teks-7.11A-solve-two-step', label: 'Solve Two-Step Equations', description: 'Model and solve two-step', generators: ['g7_solveTwoStep'], difficulty: 'proficient', subskills: ['two-step', 'model', 'solve', 'algebra tiles'] }] },
      { id: '7.11B', code: '7.11B', description: 'Determine if value(s) make equations/inequalities true', concepts: [{ conceptId: 'teks-7.11B-check-solutions', label: 'Check Solutions', description: 'Verify if value satisfies two-step equation/inequality', generators: ['g7_checkSolutions'], difficulty: 'foundational', subskills: ['substitute', 'verify'] }] },
      { id: '7.11C', code: '7.11C', description: 'Write and solve equations using geometry (angles, triangles)', concepts: [{ conceptId: 'teks-7.11C-equations-geometry', label: 'Equations with Geometry', description: 'Sum of angles, angle relationships', generators: ['g7_equationsGeometry'], difficulty: 'proficient', subskills: ['sum of angles', 'complementary', 'supplementary', 'vertical'] }] },
    ],
    'geometry-measurement': [
      { id: '7.8A', code: '7.8A', description: 'Model volume relationship: rectangular prism and pyramid', concepts: [{ conceptId: 'teks-7.8A-prism-pyramid', label: 'Prism & Pyramid Volume', description: 'V_pyramid = (1/3)V_prism', generators: ['g7_prismPyramid'], difficulty: 'developing', subskills: ['volume', 'rectangular prism', 'pyramid'] }] },
      { id: '7.8B', code: '7.8B', description: 'Model volume: triangular prism and pyramid', concepts: [{ conceptId: 'teks-7.8B-triangular-volume', label: 'Triangular Prism & Pyramid', description: 'Volume relationship', generators: ['g7_triangularVolume'], difficulty: 'developing', subskills: ['triangular prism', 'triangular pyramid', 'volume'] }] },
      { id: '7.8C', code: '7.8C', description: 'Models for circumference and area of circle', concepts: [{ conceptId: 'teks-7.8C-circle-formulas', label: 'Circle Formulas', description: 'C = πd, A = πr² from models', generators: ['g7_circleFormulas'], difficulty: 'developing', subskills: ['circumference', 'area', 'circle', 'pi'] }] },
      { id: '7.9A', code: '7.9A', description: 'Solve volume problems: prisms and pyramids', concepts: [{ conceptId: 'teks-7.9A-volume-problems', label: 'Volume Problems', description: 'Rectangular and triangular prisms and pyramids', generators: ['g7_volumeProblems'], difficulty: 'proficient', subskills: ['volume', 'prism', 'pyramid'] }] },
      { id: '7.9B', code: '7.9B', description: 'Determine circumference and area of circles', concepts: [{ conceptId: 'teks-7.9B-circle-measures', label: 'Circle Circumference & Area', description: 'C = πd, A = πr²', generators: ['g7_circleMeasures'], difficulty: 'proficient', subskills: ['circumference', 'area', 'circle'] }] },
      { id: '7.9C', code: '7.9C', description: 'Area of composite figures', concepts: [{ conceptId: 'teks-7.9C-composite-area', label: 'Composite Area', description: 'Rectangles, parallelograms, trapezoids, triangles, semicircles', generators: ['g7_compositeArea'], difficulty: 'proficient', subskills: ['composite', 'decompose', 'area'] }] },
      { id: '7.9D', code: '7.9D', description: 'Lateral and total surface area from nets', concepts: [{ conceptId: 'teks-7.9D-surface-area', label: 'Surface Area', description: 'Prisms and pyramids from nets', generators: ['g7_surfaceArea'], difficulty: 'proficient', subskills: ['surface area', 'lateral area', 'net'] }] },
    ],
    'data-finance': [
      { id: '7.12A', code: '7.12A', description: 'Compare data using dot plots or box plots', concepts: [{ conceptId: 'teks-7.12A-compare-data', label: 'Compare Data', description: 'Shapes, centers, spreads', generators: ['g7_compareData'], difficulty: 'proficient', subskills: ['dot plot', 'box plot', 'center', 'spread'] }] },
      { id: '7.12B', code: '7.12B', description: 'Use random sample to make inferences about population', concepts: [{ conceptId: 'teks-7.12B-sample-inference', label: 'Sample Inference', description: 'Infer from random sample', generators: ['g7_sampleInference'], difficulty: 'developing', subskills: ['sample', 'population', 'inference'] }] },
      { id: '7.13A', code: '7.13A', description: 'Calculate sales tax and income tax', concepts: [{ conceptId: 'teks-7.13A-sales-income-tax', label: 'Sales & Income Tax', description: 'Calculate tax amounts', generators: ['g7_salesIncomeTax'], difficulty: 'developing', subskills: ['sales tax', 'income tax', 'percent'] }] },
      { id: '7.13B', code: '7.13B', description: 'Identify components of personal budget', concepts: [{ conceptId: 'teks-7.13B-personal-budget', label: 'Personal Budget', description: 'Income, savings, taxes, expenses', generators: ['g7_personalBudget'], difficulty: 'developing', subskills: ['budget', 'income', 'expenses', 'percent'] }] },
      { id: '7.13E', code: '7.13E', description: 'Calculate and compare simple and compound interest', concepts: [{ conceptId: 'teks-7.13E-interest', label: 'Simple & Compound Interest', description: 'Calculate and compare', generators: ['g7_interest'], difficulty: 'proficient', subskills: ['simple interest', 'compound interest'] }] },
      { id: '7.13F', code: '7.13F', description: 'Analyze monetary incentives (sales, rebates, coupons)', concepts: [{ conceptId: 'teks-7.13F-monetary-incentives', label: 'Monetary Incentives', description: 'Compare sales, rebates, coupons', generators: ['g7_monetaryIncentives'], difficulty: 'proficient', subskills: ['discount', 'rebate', 'coupon', 'compare'] }] },
    ],
  },
  grade8: {
    'number-operations': [
      { id: '8.2A', code: '8.2A', description: 'Describe relationships between sets of real numbers', concepts: [{ conceptId: 'teks-8.2A-real-number-sets', label: 'Real Number Sets', description: 'Visual representation of real number relationships', generators: ['g8_realNumberSets'], difficulty: 'foundational', subskills: ['real numbers', 'rational', 'irrational', 'subsets'] }] },
      { id: '8.2B', code: '8.2B', description: 'Approximate irrational numbers and locate on number line', concepts: [{ conceptId: 'teks-8.2B-approximate-irrational', label: 'Approximate Irrational Numbers', description: 'π and square roots < 225 on number line', generators: ['g8_approximateIrrational'], difficulty: 'developing', subskills: ['irrational', 'square root', 'pi', 'number line'] }] },
      { id: '8.2C', code: '8.2C', description: 'Convert between standard and scientific notation', concepts: [{ conceptId: 'teks-8.2C-scientific-notation', label: 'Scientific Notation', description: 'Convert standard ↔ scientific notation', generators: ['g8_scientificNotation'], difficulty: 'developing', subskills: ['scientific notation', 'standard form', 'exponents'] }] },
      { id: '8.2D', code: '8.2D', description: 'Order a set of real numbers', concepts: [{ conceptId: 'teks-8.2D-order-real', label: 'Order Real Numbers', description: 'Order real numbers from context', generators: ['g8_orderReal'], difficulty: 'proficient', subskills: ['order', 'real numbers', 'compare'] }] },
    ],
    proportionality: [
      { id: '8.3A', code: '8.3A', description: 'Ratio of corresponding sides in similar shapes', concepts: [{ conceptId: 'teks-8.3A-similar-proportional', label: 'Similar Shapes Proportional', description: 'Corresponding sides proportional in dilations', generators: ['g8_similarProportional'], difficulty: 'developing', subskills: ['similar', 'dilation', 'proportional', 'scale factor'] }] },
      { id: '8.3B', code: '8.3B', description: 'Compare shape and its dilation on coordinate plane', concepts: [{ conceptId: 'teks-8.3B-dilation-attributes', label: 'Dilation Attributes', description: 'Compare shape and dilation on coordinate plane', generators: ['g8_dilationAttributes'], difficulty: 'developing', subskills: ['dilation', 'coordinate plane', 'attributes'] }] },
      { id: '8.3C', code: '8.3C', description: 'Algebraic representation of dilation', concepts: [{ conceptId: 'teks-8.3C-dilation-algebraic', label: 'Dilation Algebraic', description: 'Effect of scale factor with origin as center', generators: ['g8_dilationAlgebraic'], difficulty: 'proficient', subskills: ['dilation', 'scale factor', 'origin', 'coordinates'] }] },
      { id: '8.4A', code: '8.4A', description: 'Slope m = (y₂−y₁)/(x₂−x₁) from similar triangles', concepts: [{ conceptId: 'teks-8.4A-slope-from-triangles', label: 'Slope from Similar Triangles', description: 'Slope same for any two points on line', generators: ['g8_slopeFromTriangles'], difficulty: 'developing', subskills: ['slope', 'similar triangles', 'rate of change'] }] },
      { id: '8.4B', code: '8.4B', description: 'Graph proportional relationships, unit rate as slope', concepts: [{ conceptId: 'teks-8.4B-proportional-slope', label: 'Proportional Slopes', description: 'Unit rate as slope of proportional line', generators: ['g8_proportionalSlope'], difficulty: 'developing', subskills: ['proportional', 'slope', 'unit rate', 'graph'] }] },
      { id: '8.4C', code: '8.4C', description: 'Rate of change, slope, y-intercept from table/graph', concepts: [{ conceptId: 'teks-8.4C-slope-y-intercept', label: 'Slope & Y-Intercept', description: 'Determine from table or graph', generators: ['g8_slopeYIntercept'], difficulty: 'proficient', subskills: ['slope', 'y-intercept', 'rate of change', 'linear'] }] },
      { id: '8.5A', code: '8.5A', description: 'Represent proportional with y = kx', concepts: [{ conceptId: 'teks-8.5A-proportional-y-kx', label: 'Proportional y = kx', description: 'Tables, graphs, equations', generators: ['g8_proportionalYkx'], difficulty: 'developing', subskills: ['proportional', 'y = kx', 'constant of proportionality'] }] },
      { id: '8.5B', code: '8.5B', description: 'Represent non-proportional with y = mx + b', concepts: [{ conceptId: 'teks-8.5B-nonproportional', label: 'Non-Proportional y = mx + b', description: 'b ≠ 0, tables, graphs, equations', generators: ['g8_nonproportional'], difficulty: 'developing', subskills: ['linear', 'y = mx + b', 'y-intercept'] }] },
      { id: '8.5I', code: '8.5I', description: 'Write y = mx + b from verbal, table, graph', concepts: [{ conceptId: 'teks-8.5I-write-linear', label: 'Write Linear Equation', description: 'Model linear relationship y = mx + b', generators: ['g8_writeLinear'], difficulty: 'proficient', subskills: ['linear', 'y = mx + b', 'model', 'equation'] }] },
      { id: '8.5G', code: '8.5G', description: 'Identify functions', concepts: [{ conceptId: 'teks-8.5G-identify-functions', label: 'Identify Functions', description: 'Ordered pairs, tables, mappings, graphs', generators: ['g8_identifyFunctions'], difficulty: 'foundational', subskills: ['function', 'input', 'output', 'vertical line test'] }] },
    ],
    'algebraic-reasoning': [
      { id: '8.8A', code: '8.8A', description: 'Write equations/inequalities with variables on both sides', concepts: [{ conceptId: 'teks-8.8A-write-equations-both', label: 'Write Equations Both Sides', description: 'Variables on both sides, rational coefficients', generators: ['g8_writeEquationsBoth'], difficulty: 'developing', subskills: ['equation', 'inequality', 'variables both sides'] }] },
      { id: '8.8C', code: '8.8C', description: 'Model and solve equations with variables on both sides', concepts: [{ conceptId: 'teks-8.8C-solve-both-sides', label: 'Solve Variables Both Sides', description: 'Model and solve multi-step', generators: ['g8_solveBothSides'], difficulty: 'proficient', subskills: ['solve', 'variables both sides', 'distributive', 'rational'] }] },
      { id: '8.8D', code: '8.8D', description: 'Angle sum, exterior angle, transversals, angle-angle criterion', concepts: [{ conceptId: 'teks-8.8D-angle-theorems', label: 'Angle Theorems', description: 'Triangle sum, exterior, transversals, similarity', generators: ['g8_angleTheorems'], difficulty: 'proficient', subskills: ['angle sum', 'exterior angle', 'transversal', 'parallel', 'similar triangles'] }] },
      { id: '8.9', code: '8.9', description: 'Solve systems by graphing', concepts: [{ conceptId: 'teks-8.9-systems-graphing', label: 'Systems by Graphing', description: 'Identify (x,y) satisfying both y = mx + b', generators: ['g8_systemsGraphing'], difficulty: 'proficient', subskills: ['system', 'intersection', 'graph', 'solution'] }] },
    ],
    'geometry-measurement': [
      { id: '8.6A', code: '8.6A', description: 'Volume formula V = Bh for cylinder', concepts: [{ conceptId: 'teks-8.6A-cylinder-volume', label: 'Cylinder Volume', description: 'V = Bh in terms of base area and height', generators: ['g8_cylinderVolume'], difficulty: 'developing', subskills: ['cylinder', 'volume', 'base area', 'height'] }] },
      { id: '8.6B', code: '8.6B', description: 'Volume relationship: cylinder and cone', concepts: [{ conceptId: 'teks-8.6B-cylinder-cone', label: 'Cylinder & Cone Volume', description: 'V_cone = (1/3)V_cylinder', generators: ['g8_cylinderCone'], difficulty: 'developing', subskills: ['cylinder', 'cone', 'volume', 'relationship'] }] },
      { id: '8.6C', code: '8.6C', description: 'Explain Pythagorean theorem with models', concepts: [{ conceptId: 'teks-8.6C-pythagorean-models', label: 'Pythagorean Theorem Models', description: 'Models and diagrams to explain', generators: ['g8_pythagoreanModels'], difficulty: 'foundational', subskills: ['Pythagorean', 'right triangle', 'a² + b² = c²'] }] },
      { id: '8.7A', code: '8.7A', description: 'Solve volume problems: cylinders, cones, spheres', concepts: [{ conceptId: 'teks-8.7A-volume-cylinders-cones-spheres', label: 'Volume Cylinders Cones Spheres', description: 'Volume problems', generators: ['g8_volumeCylindersConesSpheres'], difficulty: 'proficient', subskills: ['volume', 'cylinder', 'cone', 'sphere'] }] },
      { id: '8.7B', code: '8.7B', description: 'Surface area formulas for prisms and cylinders', concepts: [{ conceptId: 'teks-8.7B-surface-area', label: 'Surface Area', description: 'Lateral and total surface area', generators: ['g8_surfaceArea'], difficulty: 'proficient', subskills: ['surface area', 'lateral', 'prism', 'cylinder'] }] },
      { id: '8.7C', code: '8.7C', description: 'Pythagorean Theorem and converse', concepts: [{ conceptId: 'teks-8.7C-pythagorean-solve', label: 'Pythagorean Theorem Solve', description: 'Solve problems, use converse', generators: ['g8_pythagoreanSolve'], difficulty: 'proficient', subskills: ['Pythagorean', 'converse', 'right triangle', 'solve'] }] },
      { id: '8.7D', code: '8.7D', description: 'Distance between two points using Pythagorean', concepts: [{ conceptId: 'teks-8.7D-distance-points', label: 'Distance Between Points', description: 'Coordinate plane distance', generators: ['g8_distancePoints'], difficulty: 'proficient', subskills: ['distance', 'Pythagorean', 'coordinate plane'] }] },
      { id: '8.10A', code: '8.10A', description: 'Properties of rotations, reflections, translations, dilations', concepts: [{ conceptId: 'teks-8.10A-transformation-properties', label: 'Transformation Properties', description: 'Orientation and congruence', generators: ['g8_transformationProperties'], difficulty: 'developing', subskills: ['rotation', 'reflection', 'translation', 'dilation', 'congruence'] }] },
      { id: '8.10C', code: '8.10C', description: 'Algebraic representation of transformations', concepts: [{ conceptId: 'teks-8.10C-transformations-algebraic', label: 'Transformations Algebraic', description: 'Translations, reflections, rotations 90°–360°', generators: ['g8_transformationsAlgebraic'], difficulty: 'proficient', subskills: ['translation', 'reflection', 'rotation', 'algebraic', 'coordinate'] }] },
    ],
    'data-finance': [
      { id: '8.11A', code: '8.11A', description: 'Construct scatterplot, describe association', concepts: [{ conceptId: 'teks-8.11A-scatterplot', label: 'Scatterplots', description: 'Linear, non-linear, no association', generators: ['g8_scatterplot'], difficulty: 'proficient', subskills: ['scatterplot', 'bivariate', 'association', 'linear'] }] },
      { id: '8.11B', code: '8.11B', description: 'Mean absolute deviation', concepts: [{ conceptId: 'teks-8.11B-mean-absolute-deviation', label: 'Mean Absolute Deviation', description: 'MAD as average distance from mean', generators: ['g8_meanAbsoluteDeviation'], difficulty: 'proficient', subskills: ['MAD', 'mean', 'spread', 'deviation'] }] },
      { id: '8.12D', code: '8.12D', description: 'Simple and compound interest', concepts: [{ conceptId: 'teks-8.12D-interest', label: 'Simple & Compound Interest', description: 'Calculate and compare', generators: ['g8_interest'], difficulty: 'proficient', subskills: ['simple interest', 'compound interest'] }] },
      { id: '8.12E', code: '8.12E', description: 'Advantages and disadvantages of payment methods', concepts: [{ conceptId: 'teks-8.12E-payment-methods', label: 'Payment Methods', description: 'Compare payment options', generators: ['g8_paymentMethods'], difficulty: 'developing', subskills: ['debit', 'credit', 'payment', 'advantages'] }] },
    ],
  },
  grade10: {
    'logical-reasoning': [
      { id: 'G.2A', code: 'G.2A', description: 'Use constructions to explore attributes and make conjectures', concepts: [{ conceptId: 'teks-G.2A-constructions-conjectures', label: 'Constructions & Conjectures', description: 'Explore geometric figures through constructions', generators: ['g10_constructions'], difficulty: 'foundational', subskills: ['constructions', 'conjectures', 'geometric figures'] }] },
      { id: 'G.2B', code: 'G.2B', description: 'Make conjectures about angles, lines, polygons, circles', concepts: [{ conceptId: 'teks-G.2B-geometric-conjectures', label: 'Geometric Conjectures', description: 'Make and validate conjectures', generators: ['g10_geometricConjectures'], difficulty: 'developing', subskills: ['angles', 'lines', 'polygons', 'circles'] }] },
      { id: 'G.3A', code: 'G.3A', description: 'Validity of conditional, converse, inverse, contrapositive', concepts: [{ conceptId: 'teks-G.3A-conditional-logic', label: 'Conditional Logic', description: 'Analyze conditional statements', generators: ['g10_conditionalLogic'], difficulty: 'developing', subskills: ['conditional', 'converse', 'inverse', 'contrapositive'] }] },
      { id: 'G.4A', code: 'G.4A', description: 'Distinguish undefined terms, definitions, postulates, theorems', concepts: [{ conceptId: 'teks-G.4A-definitions-theorems', label: 'Definitions & Theorems', description: 'Distinguish geometric building blocks', generators: ['g10_definitionsTheorems'], difficulty: 'foundational', subskills: ['undefined terms', 'definitions', 'postulates', 'theorems'] }] },
      { id: 'G.5A', code: 'G.5A', description: 'Investigate patterns for conjectures about geometric relationships', concepts: [{ conceptId: 'teks-G.5A-patterns-conjectures', label: 'Patterns & Conjectures', description: 'Parallel lines, transversals, angle relationships', generators: ['g10_patternsConjectures'], difficulty: 'developing', subskills: ['parallel lines', 'transversal', 'angles'] }] },
    ],
    'geometric-structure': [
      { id: 'G.6A', code: 'G.6A', description: 'Verify theorems about angles, parallel lines, transversals', concepts: [{ conceptId: 'teks-G.6A-angle-theorems', label: 'Angle Theorems', description: 'Vertical angles, parallel lines cut by transversal', generators: ['g10_angleTheorems'], difficulty: 'proficient', subskills: ['vertical angles', 'corresponding', 'alternate interior'] }] },
      { id: 'G.6D', code: 'G.6D', description: 'Verify theorems about triangles, Pythagorean theorem', concepts: [{ conceptId: 'teks-G.6D-triangle-theorems', label: 'Triangle Theorems', description: 'Triangle relationships, Pythagorean proof', generators: ['g10_triangleTheorems'], difficulty: 'proficient', subskills: ['triangle sum', 'exterior angle', 'Pythagorean'] }] },
      { id: 'G.7A', code: 'G.7A', description: 'Apply Pythagorean theorem to solve problems', concepts: [{ conceptId: 'teks-G.7A-pythagorean-apply', label: 'Apply Pythagorean Theorem', description: 'Solve problems with right triangles', generators: ['g10_pythagoreanApply'], difficulty: 'proficient', subskills: ['Pythagorean', 'right triangle', 'solve'] }] },
      { id: 'G.8A', code: 'G.8A', description: 'Use similar triangles, trig ratios, right triangle properties', concepts: [{ conceptId: 'teks-G.8A-similar-trig', label: 'Similar Triangles & Trig', description: 'Solve problems with similar triangles and trig', generators: ['g10_similarTrig'], difficulty: 'proficient', subskills: ['similar triangles', 'trigonometric ratios', 'right triangles'] }] },
      { id: 'G.12A', code: 'G.12A', description: 'Use similar right triangles to develop understanding of slope', concepts: [{ conceptId: 'teks-G.12A-slope-similar', label: 'Slope from Similar Triangles', description: 'Connect slope to similar right triangles', generators: ['g10_slopeSimilar'], difficulty: 'developing', subskills: ['slope', 'similar triangles', 'rate of change'] }] },
      { id: 'G.12D', code: 'G.12D', description: 'Effect on linear and area measurements of dilations', concepts: [{ conceptId: 'teks-G.12D-dilation-measurements', label: 'Dilation Measurements', description: 'Effect of dilation on length and area', generators: ['g10_dilationMeasurements'], difficulty: 'proficient', subskills: ['dilation', 'linear', 'area'] }] },
    ],
    measurement: [
      { id: 'G.9A', code: 'G.9A', description: 'Arc length and area of sectors of circles', concepts: [{ conceptId: 'teks-G.9A-arc-sector', label: 'Arc Length & Sectors', description: 'Calculate arc length and sector area', generators: ['g10_arcSector'], difficulty: 'proficient', subskills: ['arc length', 'sector', 'circle'] }] },
      { id: 'G.10A', code: 'G.10A', description: 'Shapes of 2D cross-sections of 3D objects', concepts: [{ conceptId: 'teks-G.10A-cross-sections', label: 'Cross-Sections', description: 'Identify 2D cross-sections of 3D figures', generators: ['g10_crossSections'], difficulty: 'developing', subskills: ['cross-section', 'prism', 'pyramid', 'cylinder'] }] },
      { id: 'G.11A', code: 'G.11A', description: 'Surface area of prisms, pyramids, cylinders, cones, spheres', concepts: [{ conceptId: 'teks-G.11A-surface-area', label: 'Surface Area 3D', description: 'Lateral and total surface area formulas', generators: ['g10_surfaceArea3D'], difficulty: 'proficient', subskills: ['surface area', 'prism', 'pyramid', 'cylinder', 'cone', 'sphere'] }] },
    ],
  },
  grade11: {
    'quadratic-functions': [
      { id: '2A.2A', code: '2A.2A', description: 'Domain and range of quadratic, square root, exponential', concepts: [{ conceptId: 'teks-2A.2A-domain-range', label: 'Domain & Range Advanced', description: 'Quadratic, square root, exponential functions', generators: ['g11_domainRange'], difficulty: 'proficient', subskills: ['domain', 'range', 'quadratic', 'square root', 'exponential'] }] },
      { id: '2A.2B', code: '2A.2B', description: 'Write quadratic functions from key features', concepts: [{ conceptId: 'teks-2A.2B-quadratic-write', label: 'Write Quadratic Functions', description: 'From vertex, roots, key features', generators: ['g11_quadraticWrite'], difficulty: 'proficient', subskills: ['vertex form', 'standard form', 'roots'] }] },
      { id: '2A.3A', code: '2A.3A', description: 'Effects of transformations on graphs', concepts: [{ conceptId: 'teks-2A.3A-transformations', label: 'Graph Transformations', description: 'af(x), f(x)+d, f(x-c), f(bx)', generators: ['g11_transformations'], difficulty: 'proficient', subskills: ['vertical stretch', 'horizontal shift', 'reflection'] }] },
      { id: '2A.5A', code: '2A.5A', description: 'Transformations of polynomial, radical, exponential', concepts: [{ conceptId: 'teks-2A.5A-parent-transforms', label: 'Parent Function Transforms', description: 'Effects on polynomial, radical, exponential', generators: ['g11_parentTransforms'], difficulty: 'proficient', subskills: ['parent function', 'transformation'] }] },
      { id: '2A.8A', code: '2A.8A', description: 'Solve polynomial equations degree 3 and 4', concepts: [{ conceptId: 'teks-2A.8A-polynomial-solve', label: 'Solve Polynomial Equations', description: 'Degree 3 and 4', generators: ['g11_polynomialSolve'], difficulty: 'proficient', subskills: ['factoring', 'roots', 'polynomial'] }] },
      { id: '2A.9A', code: '2A.9A', description: 'Equation of a circle, center, radius, graph', concepts: [{ conceptId: 'teks-2A.9A-circle-equation', label: 'Circle Equation', description: '(x-h)²+(y-k)²=r²', generators: ['g11_circleEquation'], difficulty: 'proficient', subskills: ['circle', 'center', 'radius', 'graph'] }] },
    ],
    'exponential-logarithmic': [
      { id: '2A.4B', code: '2A.4B', description: 'Solve exponential and logarithmic equations', concepts: [{ conceptId: 'teks-2A.4B-exp-log-solve', label: 'Exponential & Log Equations', description: 'Solve exponential and logarithmic', generators: ['g11_expLogSolve'], difficulty: 'proficient', subskills: ['exponential', 'logarithm', 'solve'] }] },
      { id: '2A.6A', code: '2A.6A', description: 'Domain and range of exponential and logarithmic', concepts: [{ conceptId: 'teks-2A.6A-exp-log-domain', label: 'Exp & Log Domain/Range', description: 'Domain and range of exp and log functions', generators: ['g11_expLogDomain'], difficulty: 'developing', subskills: ['exponential', 'logarithm', 'domain', 'range'] }] },
      { id: '2A.6B', code: '2A.6B', description: 'Graph exponential and logarithmic functions', concepts: [{ conceptId: 'teks-2A.6B-exp-log-graph', label: 'Graph Exp & Log', description: 'Graph and identify key features', generators: ['g11_expLogGraph'], difficulty: 'proficient', subskills: ['exponential', 'logarithm', 'graph', 'asymptote'] }] },
    ],
    'equations-systems': [
      { id: '2A.4A', code: '2A.4A', description: 'Solve quadratic and square root equations', concepts: [{ conceptId: 'teks-2A.4A-quadratic-sqrt-solve', label: 'Quadratic & Square Root Equations', description: 'Solve quadratic and square root', generators: ['g11_quadraticSqrtSolve'], difficulty: 'proficient', subskills: ['quadratic', 'square root', 'solve'] }] },
    ],
    'advanced-algebra': [
      { id: '2A.7A', code: '2A.7A', description: 'Add, subtract, multiply polynomials', concepts: [{ conceptId: 'teks-2A.7A-polynomial-ops', label: 'Polynomial Operations', description: 'Add, subtract, multiply polynomials', generators: ['g11_polynomialOps'], difficulty: 'proficient', subskills: ['polynomial', 'add', 'subtract', 'multiply'] }] },
      { id: '2A.7B', code: '2A.7B', description: 'Quotient of polynomial division', concepts: [{ conceptId: 'teks-2A.7B-polynomial-divide', label: 'Polynomial Division', description: 'Divide polynomials degree 3 and 4', generators: ['g11_polynomialDivide'], difficulty: 'proficient', subskills: ['polynomial', 'division', 'quotient'] }] },
      { id: '2A.10A', code: '2A.10A', description: 'Add, subtract, multiply complex numbers', concepts: [{ conceptId: 'teks-2A.10A-complex-numbers', label: 'Complex Numbers', description: 'Operations with complex numbers', generators: ['g11_complexNumbers'], difficulty: 'proficient', subskills: ['complex', 'i', 'imaginary'] }] },
      { id: '2A.11A', code: '2A.11A', description: 'Fundamental theorem of algebra', concepts: [{ conceptId: 'teks-2A.11A-fundamental-theorem', label: 'Fundamental Theorem of Algebra', description: 'Number of roots of polynomial', generators: ['g11_fundamentalTheorem'], difficulty: 'developing', subskills: ['roots', 'polynomial', 'degree'] }] },
    ],
  },
  // Algebra I (Grade 9) – linear functions, equations, quadratics, exponentials
  algebra: {
    'linear-functions': [
      { id: 'A.2A', code: 'A.2A', description: 'Determine the domain and range of a linear function', concepts: [{ conceptId: 'teks-A.2A-domain-range', label: 'Domain & Range of Linear Functions', description: 'Domain and range from graphs, tables, equations', generators: ['gA_linear'], difficulty: 'foundational', subskills: ['domain', 'range', 'linear function'] }] },
      { id: 'A.2B', code: 'A.2B', description: 'Write linear equations in two variables in various forms', concepts: [{ conceptId: 'teks-A.2B-write-linear', label: 'Write Linear Equations', description: 'y = mx + b, point-slope, two points', generators: ['gA_linear'], difficulty: 'developing', subskills: ['slope-intercept', 'point-slope', 'two points'] }] },
      { id: 'A.2C', code: 'A.2C', description: 'Write linear equations from table, graph, verbal description', concepts: [{ conceptId: 'teks-A.2C-linear-from-context', label: 'Linear from Table/Graph/Description', description: 'Write equations from representations', generators: ['gA_linear'], difficulty: 'developing', subskills: ['table', 'graph', 'verbal'] }] },
      { id: 'A.2D', code: 'A.2D', description: 'Write and solve equations involving direct variation', concepts: [{ conceptId: 'teks-A.2D-direct-variation', label: 'Direct Variation', description: 'y = kx and solving', generators: ['gA_linear'], difficulty: 'developing', subskills: ['direct variation', 'constant of proportionality'] }] },
      { id: 'A.3A', code: 'A.3A', description: 'Determine the slope of a line', concepts: [{ conceptId: 'teks-A.3A-slope', label: 'Slope of a Line', description: 'Slope from table, graph, points, equation', generators: ['gA_linear'], difficulty: 'foundational', subskills: ['slope', 'rise over run', 'rate of change'] }] },
      { id: 'A.3B', code: 'A.3B', description: 'Calculate the rate of change of a linear function', concepts: [{ conceptId: 'teks-A.3B-slope-intercept', label: 'Rate of Change & Linear Functions', description: 'Rate of change in context', generators: ['gA_linear'], difficulty: 'developing', subskills: ['rate of change', 'linear', 'context'] }] },
      { id: 'A.3C', code: 'A.3C', description: 'Graph linear functions and identify key features', concepts: [{ conceptId: 'teks-A.3C-graph-linear', label: 'Graph Linear Functions', description: 'Graph and identify intercepts, zeros, slope', generators: ['gA_linear'], difficulty: 'proficient', subskills: ['graph', 'x-intercept', 'y-intercept', 'slope'] }] },
      { id: 'A.3D', code: 'A.3D', description: 'Graph solution set of linear inequalities in two variables', concepts: [{ conceptId: 'teks-A.3D-graph-inequalities', label: 'Graph Linear Inequalities', description: 'Graph two-variable inequalities', generators: ['gA_linear'], difficulty: 'proficient', subskills: ['inequality', 'half-plane', 'boundary'] }] },
      { id: 'A.3E', code: 'A.3E', description: 'Effects on graph of f(x)=x when replaced by af(x), f(x)+d, etc.', concepts: [{ conceptId: 'teks-A.3E-linear-transforms', label: 'Transformations of Linear Functions', description: 'Vertical/horizontal stretches and shifts', generators: ['gA_linear'], difficulty: 'proficient', subskills: ['transformation', 'stretch', 'shift'] }] },
      { id: 'A.4A', code: 'A.4A', description: 'Correlation coefficient and linear association', concepts: [{ conceptId: 'teks-A.4A-correlation', label: 'Correlation Coefficient', description: 'Strength of linear association', generators: ['gA_linear'], difficulty: 'proficient', subskills: ['correlation', 'linear association'] }] },
      { id: 'A.4B', code: 'A.4B', description: 'Compare and contrast association and causation', concepts: [{ conceptId: 'teks-A.4B-association-causation', label: 'Association vs Causation', description: 'Distinguish association from causation', generators: ['gA_linear'], difficulty: 'developing', subskills: ['association', 'causation'] }] },
      { id: 'A.4C', code: 'A.4C', description: 'Write linear functions that fit data for predictions', concepts: [{ conceptId: 'teks-A.4C-linear-fit', label: 'Linear Fit to Data', description: 'Fit linear model and make predictions', generators: ['gA_linear'], difficulty: 'proficient', subskills: ['linear regression', 'fit', 'prediction'] }] },
    ],
    'equations-inequalities': [
      { id: 'A.5A', code: 'A.5A', description: 'Solve linear equations in one variable', concepts: [{ conceptId: 'teks-A.5A-solve-linear', label: 'Solve Linear Equations', description: 'One variable, distributive property, variables on both sides', generators: ['gA_linear'], difficulty: 'proficient', subskills: ['solve', 'one variable', 'linear equation'] }] },
      { id: 'A.5B', code: 'A.5B', description: 'Solve linear inequalities in one variable', concepts: [{ conceptId: 'teks-A.5B-solve-inequality', label: 'Solve Linear Inequalities', description: 'One variable inequalities', generators: ['gA_linear'], difficulty: 'proficient', subskills: ['inequality', 'one variable', 'solution set'] }] },
      { id: 'A.5C', code: 'A.5C', description: 'Solve systems of two linear equations in two variables', concepts: [{ conceptId: 'teks-A.5C-systems', label: 'Systems of Linear Equations', description: 'Solve systems for mathematical and real-world problems', generators: ['gA_linear'], difficulty: 'proficient', subskills: ['system', 'substitution', 'elimination'] }] },
    ],
    'quadratics': [
      { id: 'A.6A', code: 'A.6A', description: 'Domain and range of quadratic functions', concepts: [{ conceptId: 'teks-A.6A-quadratic-domain-range', label: 'Quadratic Domain & Range', description: 'Domain and range using inequalities', generators: ['gA_quadratic'], difficulty: 'developing', subskills: ['domain', 'range', 'quadratic'] }] },
      { id: 'A.6B', code: 'A.6B', description: 'Write quadratic functions in vertex form', concepts: [{ conceptId: 'teks-A.6B-quadratic-vertex', label: 'Quadratic Vertex Form', description: 'Write from vertex and point', generators: ['gA_quadratic'], difficulty: 'proficient', subskills: ['vertex form', 'standard form'] }] },
      { id: 'A.6C', code: 'A.6C', description: 'Write quadratic functions from solutions and graphs', concepts: [{ conceptId: 'teks-A.6C-quadratic-from-roots', label: 'Quadratic from Roots & Graph', description: 'Write from real solutions and graph', generators: ['gA_quadratic'], difficulty: 'proficient', subskills: ['roots', 'graph', 'equation'] }] },
      { id: 'A.7A', code: 'A.7A', description: 'Graph quadratic functions and identify key attributes', concepts: [{ conceptId: 'teks-A.7A-quadratic-graph', label: 'Graph Quadratic Functions', description: 'Graph and identify vertex, intercepts, axis of symmetry', generators: ['gA_quadratic'], difficulty: 'proficient', subskills: ['parabola', 'vertex', 'intercepts'] }] },
      { id: 'A.7B', code: 'A.7B', description: 'Relationship between linear factors and zeros', concepts: [{ conceptId: 'teks-A.7B-factors-zeros', label: 'Factors and Zeros', description: 'Linear factors and zeros of quadratics', generators: ['gA_quadratic'], difficulty: 'proficient', subskills: ['factors', 'zeros', 'quadratic'] }] },
      { id: 'A.7C', code: 'A.7C', description: 'Effects on graph of f(x)=x² under transformations', concepts: [{ conceptId: 'teks-A.7C-quadratic-transforms', label: 'Transformations of Quadratics', description: 'Effects of a, d, c, b on parabola', generators: ['gA_quadratic'], difficulty: 'proficient', subskills: ['transformation', 'parabola'] }] },
      { id: 'A.8A', code: 'A.8A', description: 'Solve quadratic equations by factoring, square roots, completing the square, formula', concepts: [{ conceptId: 'teks-A.8A-quadratic-solve', label: 'Solve Quadratic Equations', description: 'Factoring, square roots, complete the square, formula', generators: ['gA_quadratic'], difficulty: 'proficient', subskills: ['factoring', 'quadratic formula', 'solutions'] }] },
      { id: 'A.8B', code: 'A.8B', description: 'Write quadratic functions that fit data', concepts: [{ conceptId: 'teks-A.8B-quadratic-fit', label: 'Quadratic Fit to Data', description: 'Fit quadratic model for predictions', generators: ['gA_quadratic'], difficulty: 'proficient', subskills: ['fit', 'data', 'prediction'] }] },
    ],
    'exponentials': [
      { id: 'A.9A', code: 'A.9A', description: 'Domain and range of exponential functions f(x)=ab^x', concepts: [{ conceptId: 'teks-A.9A-exp-domain-range', label: 'Exponential Domain & Range', description: 'Domain and range using inequalities', generators: ['gA_exponential'], difficulty: 'developing', subskills: ['exponential', 'domain', 'range'] }] },
      { id: 'A.9B', code: 'A.9B', description: 'Interpret meaning of a and b in f(x)=ab^x', concepts: [{ conceptId: 'teks-A.9B-exp-meaning', label: 'Meaning of a and b in Exponentials', description: 'Interpret in real-world problems', generators: ['gA_exponential'], difficulty: 'developing', subskills: ['initial value', 'growth factor'] }] },
      { id: 'A.9C', code: 'A.9C', description: 'Write exponential functions for growth and decay', concepts: [{ conceptId: 'teks-A.9C-exponential-graph', label: 'Write Exponential Functions', description: 'f(x)=ab^x for growth and decay', generators: ['gA_exponential'], difficulty: 'proficient', subskills: ['growth', 'decay', 'exponential'] }] },
      { id: 'A.9D', code: 'A.9D', description: 'Graph exponential functions and identify key features', concepts: [{ conceptId: 'teks-A.9D-exponential-solve', label: 'Graph Exponential Functions', description: 'Graph growth/decay, identify y-intercept and asymptote', generators: ['gA_exponential'], difficulty: 'proficient', subskills: ['graph', 'asymptote', 'y-intercept'] }] },
    ],
  },
};
// TExES Math 4-8: aggregate standards from grades 4–8 for certification exam prep
STANDARDS['grade4-8'] = (() => {
  const merged = {};
  for (const g of ['grade4', 'grade5', 'grade6', 'grade7', 'grade8']) {
    const s = STANDARDS[g];
    if (!s) continue;
    for (const domainId of Object.keys(s)) {
      if (!merged[domainId]) merged[domainId] = [];
      merged[domainId].push(...(s[domainId] || []));
    }
  }
  return merged;
})();
// Grade 9 uses Algebra I standards (typical 9th grade course in Texas)
STANDARDS.grade9 = STANDARDS.algebra;

// ─── Difficulty levels ─────────────────────────────────────────
export const DIFFICULTY_LEVELS = [
  { id: 'foundational', label: 'Foundational', color: '#22c55e', description: 'Core building blocks' },
  { id: 'developing', label: 'Developing', color: '#3b82f6', description: 'Growing proficiency' },
  { id: 'proficient', label: 'Proficient', color: '#a855f7', description: 'Applied understanding' },
  { id: 'advanced', label: 'Advanced', color: '#f59e0b', description: 'Extended reasoning' },
];

// ─── Prerequisite Graph ───────────────────────────────────────
// Maps conceptId → array of prerequisite conceptIds that should be
// mastered (or at least proficient) before tackling the target.
export const PREREQUISITES = {
  // Grade 1 chains
  'teks-1.2B-compose-decompose': ['teks-1.2A-subitizing'],
  'teks-1.2E-compare-place-value': ['teks-1.2B-compose-decompose'],
  'teks-1.2F-order-numbers': ['teks-1.2E-compare-place-value'],
  'teks-1.2G-compare-symbols': ['teks-1.2E-compare-place-value'],
  'teks-1.3B-word-problems': ['teks-1.3C-compose-ten', 'teks-1.3D-add-sub-20'],
  'teks-1.3D-add-sub-20': ['teks-1.3C-compose-ten'],
  'teks-1.3E-explain-strategies': ['teks-1.3D-add-sub-20'],
  'teks-1.4B-coin-value': ['teks-1.4A-identify-coins'],
  'teks-1.4C-count-coins': ['teks-1.4A-identify-coins', 'teks-1.5B-skip-count'],
  'teks-1.5C-ten-more-less': ['teks-1.2B-compose-decompose'],
  'teks-1.5D-represent-word-problems': ['teks-1.3B-word-problems'],
  'teks-1.5E-equal-sign': ['teks-1.3C-compose-ten'],
  'teks-1.5G-properties': ['teks-1.3D-add-sub-20'],
  'teks-1.6B-shape-attributes': ['teks-1.6A-classify-shapes'],
  'teks-1.6D-identify-shapes': ['teks-1.6A-classify-shapes'],
  'teks-1.6E-identify-solids': ['teks-1.6A-classify-shapes'],
  'teks-1.6G-partition-equal': ['teks-1.6A-classify-shapes'],
  'teks-1.6H-halves-fourths': ['teks-1.6G-partition-equal'],
  'teks-1.7D-describe-length': ['teks-1.7A-measure-length'],
  // Grade 2 chains (build on Grade 1)
  'teks-2.2A-compose-decompose-1200': ['teks-1.2B-compose-decompose'],
  'teks-2.2B-number-forms': ['teks-2.2A-compose-decompose-1200'],
  'teks-2.2C-greater-less': ['teks-1.2G-compare-symbols'],
  'teks-2.2D-compare-order': ['teks-2.2A-compose-decompose-1200', 'teks-1.2G-compare-symbols'],
  'teks-2.2E-number-line-position': ['teks-1.2F-order-numbers'],
  'teks-2.2F-number-from-point': ['teks-2.2E-number-line-position'],
  'teks-2.3A-partition-halves-fourths-eighths': ['teks-1.6H-halves-fourths'],
  'teks-2.3B-fraction-size': ['teks-2.3A-partition-halves-fourths-eighths'],
  'teks-2.3C-fractions-beyond-whole': ['teks-2.3A-partition-halves-fourths-eighths'],
  'teks-2.3D-halves-fourths-eighths': ['teks-2.3A-partition-halves-fourths-eighths'],
  'teks-2.4A-add-sub-20': ['teks-1.3D-add-sub-20'],
  'teks-2.4B-add-sub-two-digit': ['teks-2.2A-compose-decompose-1200', 'teks-2.4A-add-sub-20'],
  'teks-2.4C-word-problems-1000': ['teks-2.4B-add-sub-two-digit', 'teks-1.3B-word-problems'],
  'teks-2.4D-generate-problems': ['teks-2.4C-word-problems-1000'],
  'teks-2.5A-coin-value': ['teks-1.4C-count-coins'],
  'teks-2.5B-money-symbols': ['teks-2.5A-coin-value'],
  'teks-2.6A-equal-groups-mult': ['teks-2.4A-add-sub-20'],
  'teks-2.6B-equal-shares-div': ['teks-2.6A-equal-groups-mult'],
  'teks-2.7A-even-odd': ['teks-2.4A-add-sub-20'],
  'teks-2.7B-ten-hundred-more-less': ['teks-1.5C-ten-more-less', 'teks-2.2A-compose-decompose-1200'],
  'teks-2.7C-unknown-word-problems': ['teks-2.4C-word-problems-1000'],
  'teks-2.8A-create-shapes': ['teks-1.6D-identify-shapes'],
  'teks-2.8B-classify-3d': ['teks-1.6E-identify-solids'],
  'teks-2.8C-classify-polygons': ['teks-1.6D-identify-shapes'],
  'teks-2.8D-compose-shapes': ['teks-2.8A-create-shapes'],
  'teks-2.8E-decompose-shapes': ['teks-2.8A-create-shapes'],
  'teks-2.9A-measure-length': ['teks-1.7A-measure-length'],
  'teks-2.9D-measure-ruler': ['teks-2.9A-measure-length'],
  'teks-2.9E-length-problems': ['teks-2.9D-measure-ruler'],
  'teks-2.9F-area-rectangle': ['teks-2.8A-create-shapes'],
  'teks-2.9G-tell-time-minute': ['teks-1.7E-tell-time'],
  'teks-2.10A-graph-scale': ['teks-1.8C-graphs'],
  'teks-2.10B-organize-data': ['teks-2.10A-graph-scale'],
  'teks-2.10C-graph-word-problems': ['teks-2.10B-organize-data', 'teks-2.4C-word-problems-1000'],
  'teks-2.10D-graph-conclusions': ['teks-2.10C-graph-word-problems'],
  'teks-2.11A-savings-accumulate': ['teks-2.5A-coin-value'],
  'teks-2.11B-saving-vs-spending': ['teks-2.5A-coin-value'],
  'teks-2.11F-producers-consumers': ['teks-2.5A-coin-value'],
  // Grade 3+ (Fractions build on number sense)
  'teks-3.3A-represent-fractions': ['teks-3.2A-expanded-form'],
  'teks-3.3B-fraction-number-line': ['teks-3.3A-represent-fractions'],
  'teks-3.3C-unit-fractions': ['teks-3.3A-represent-fractions'],
  'teks-3.3D-compose-fractions': ['teks-3.3C-unit-fractions'],
  'teks-3.3E-partition-fractions': ['teks-3.3C-unit-fractions'],
  'teks-3.3F-equivalent-fractions': ['teks-3.3D-compose-fractions', 'teks-3.3B-fraction-number-line'],
  'teks-3.3G-explain-equivalence': ['teks-3.3F-equivalent-fractions'],
  'teks-3.3H-compare-fractions': ['teks-3.3A-represent-fractions', 'teks-3.2D-compare-order'],
  // Computation chain
  'teks-3.4A-add-sub': ['teks-3.2A-expanded-form', 'teks-3.2B-digit-identification'],
  'teks-3.4A-add-sub-word': ['teks-3.4A-add-sub'],
  'teks-3.4B-rounding': ['teks-3.2C-round-hundred', 'teks-3.4A-add-sub'],
  'teks-3.4C-money': ['teks-3.4A-add-sub'],
  'teks-3.4E-mult-representations': ['teks-3.4D-equal-groups'],
  'teks-3.4F-multiply-facts': ['teks-3.4D-equal-groups', 'teks-3.4E-mult-representations'],
  'teks-3.4G-2digit-multiply': ['teks-3.4F-multiply-facts'],
  'teks-3.4H-division-word': ['teks-3.4K-division-facts'],
  'teks-3.4J-quotient-relationship': ['teks-3.4F-multiply-facts'],
  'teks-3.4K-division-facts': ['teks-3.4J-quotient-relationship'],
  // Algebraic reasoning builds on computation
  'teks-3.5A-word-problems': ['teks-3.4A-add-sub-word'],
  'teks-3.5B-mult-word': ['teks-3.4F-multiply-facts'],
  'teks-3.5C-mult-comparison': ['teks-3.4F-multiply-facts'],
  'teks-3.5D-missing-factor': ['teks-3.4F-multiply-facts', 'teks-3.4J-quotient-relationship'],
  'teks-3.5E-patterns': ['teks-3.4D-equal-groups'],
  // Geometry & measurement
  'teks-3.6B-quadrilaterals': ['teks-3.6A-classify-shapes'],
  'teks-3.6C-area': ['teks-3.4F-multiply-facts'],
  'teks-3.7A-fraction-distance': ['teks-3.3A-represent-fractions', 'teks-3.3B-fraction-number-line'],
  'teks-3.7B-perimeter': ['teks-3.4A-add-sub'],
  'teks-3.7E-measure-capacity-weight': ['teks-3.7D-measurement-choice'],
  // Data & finance
  'teks-3.8B-data-problems': ['teks-3.8A-data-display', 'teks-3.4A-add-sub'],
  'teks-3.9C-spending': ['teks-3.9A-income', 'teks-3.9B-scarcity'],
  'teks-3.9D-credit': ['teks-3.9C-spending'],
  // Algebra I chains
  'teks-A.3B-slope-intercept': ['teks-A.2A-domain-range'],
  'teks-A.3C-graph-linear': ['teks-A.3B-slope-intercept'],
  'teks-A.5A-solve-linear': ['teks-A.3B-slope-intercept'],
  'teks-A.5B-solve-inequality': ['teks-A.5A-solve-linear'],
  'teks-A.5C-systems': ['teks-A.5A-solve-linear'],
  'teks-A.7A-quadratic-graph': ['teks-A.3C-graph-linear'],
  'teks-A.8A-quadratic-solve': ['teks-A.7A-quadratic-graph'],
  'teks-A.9C-exponential-graph': ['teks-A.3C-graph-linear'],
  'teks-A.9D-exponential-solve': ['teks-A.9C-exponential-graph'],
  // Grade 4 chains
  'teks-4.2A-place-value-relationships': ['teks-3.2B-digit-identification'],
  'teks-4.2B-expanded-notation': ['teks-3.2A-expanded-form', 'teks-4.2A-place-value-relationships'],
  'teks-4.2C-compare-order': ['teks-3.2D-compare-order'],
  'teks-4.2D-rounding': ['teks-3.2C-round-hundred'],
  'teks-4.3A-decompose-fractions': ['teks-3.3D-compose-fractions'],
  'teks-4.3B-decompose-multiple': ['teks-4.3A-decompose-fractions'],
  'teks-4.3C-equivalent-fractions': ['teks-3.3F-equivalent-fractions'],
  'teks-4.3D-compare-fractions': ['teks-3.3H-compare-fractions', 'teks-4.3C-equivalent-fractions'],
  'teks-4.3E-add-sub-fractions': ['teks-4.3A-decompose-fractions'],
  'teks-4.3F-reasonableness-fractions': ['teks-4.3E-add-sub-fractions'],
  'teks-4.3G-fractions-decimals-number-line': ['teks-3.3B-fraction-number-line', 'teks-4.2B-expanded-notation'],
  'teks-4.4A-add-sub-decimals': ['teks-3.4A-add-sub', 'teks-4.2B-expanded-notation'],
  'teks-4.4B-multiply-ten-hundred': ['teks-4.2A-place-value-relationships'],
  'teks-4.4C-two-digit-products': ['teks-3.4G-2digit-multiply'],
  'teks-4.4D-multiplication-strategies': ['teks-4.4C-two-digit-products'],
  'teks-4.4E-division-representations': ['teks-3.4K-division-facts'],
  'teks-4.4F-division-strategies': ['teks-4.4E-division-representations'],
  'teks-4.4G-rounding-estimation': ['teks-4.2D-rounding', 'teks-4.4A-add-sub-decimals'],
  'teks-4.4H-mult-div-fluency': ['teks-4.4D-multiplication-strategies', 'teks-4.4F-division-strategies'],
  'teks-4.5A-multi-step-equations': ['teks-3.5A-word-problems'],
  'teks-4.5B-input-output': ['teks-3.5E-patterns'],
  'teks-4.5C-perimeter-area-formulas': ['teks-3.6C-area', 'teks-3.7B-perimeter'],
  'teks-4.5D-perimeter-area-problems': ['teks-4.5C-perimeter-area-formulas'],
  'teks-4.6A-geometric-figures': ['teks-3.6A-classify-shapes'],
  'teks-4.6B-symmetry': ['teks-3.6B-quadrilaterals'],
  'teks-4.6C-triangle-types': ['teks-4.6A-geometric-figures'],
  'teks-4.6D-classify-2d': ['teks-4.6A-geometric-figures'],
  'teks-4.7A-angle-measure': ['teks-4.6A-geometric-figures'],
  'teks-4.7B-degrees': ['teks-4.7A-angle-measure'],
  'teks-4.7C-measure-angles': ['teks-4.7B-degrees'],
  'teks-4.7D-draw-angles': ['teks-4.7C-measure-angles'],
  'teks-4.7E-unknown-angles': ['teks-4.7C-measure-angles'],
  'teks-4.8A-measurement-units': ['teks-3.7D-measurement-choice'],
  'teks-4.8B-convert-measurements': ['teks-4.8A-measurement-units'],
  'teks-4.8C-elapsed-time': ['teks-3.7C-time'],
  'teks-4.9A-data-display': ['teks-3.8A-data-display'],
  'teks-4.9B-data-problems': ['teks-4.9A-data-display', 'teks-4.4A-add-sub-decimals'],
  'teks-4.10A-fixed-variable-expenses': ['teks-3.9A-income'],
  'teks-4.10B-profit': ['teks-4.4A-add-sub-decimals', 'teks-4.10A-fixed-variable-expenses'],
  'teks-4.10C-savings-plans': ['teks-3.9E-saving'],
  'teks-4.10D-allocate-allowance': ['teks-3.9C-spending'],
  'teks-4.10E-financial-institutions': ['teks-3.9D-credit'],
  // Grade 5 chains (build on Grade 4)
  'teks-5.2A-decimal-expanded': ['teks-4.2B-expanded-notation'],
  'teks-5.2B-compare-decimals': ['teks-4.2B-expanded-notation', 'teks-5.2A-decimal-expanded'],
  'teks-5.2C-round-decimals': ['teks-4.2D-rounding', 'teks-5.2A-decimal-expanded'],
  'teks-5.3A-estimation': ['teks-4.4G-rounding-estimation'],
  'teks-5.3B-multiply-3x2': ['teks-4.4D-multiplication-strategies'],
  'teks-5.3C-division-4x2': ['teks-4.4F-division-strategies'],
  'teks-5.3D-decimal-mult-models': ['teks-4.4C-two-digit-products', 'teks-4.2B-expanded-notation'],
  'teks-5.3E-decimal-multiply': ['teks-5.3D-decimal-mult-models'],
  'teks-5.3F-decimal-div-models': ['teks-4.4E-division-representations', 'teks-5.2A-decimal-expanded'],
  'teks-5.3G-decimal-divide': ['teks-5.3F-decimal-div-models'],
  'teks-5.3H-add-sub-fractions': ['teks-4.3E-add-sub-fractions'],
  'teks-5.3I-whole-times-fraction': ['teks-4.3A-decompose-fractions'],
  'teks-5.3J-fraction-division': ['teks-5.3I-whole-times-fraction'],
  'teks-5.3K-add-sub-rational': ['teks-5.3H-add-sub-fractions', 'teks-4.4A-add-sub-decimals'],
  'teks-5.3L-divide-unit-fractions': ['teks-5.3J-fraction-division'],
  'teks-5.4A-prime-composite': ['teks-4.4F-division-strategies'],
  'teks-5.4B-multi-step-equations': ['teks-4.5A-multi-step-equations'],
  'teks-5.4C-numerical-patterns': ['teks-4.5B-input-output'],
  'teks-5.4D-pattern-types': ['teks-5.4C-numerical-patterns'],
  'teks-5.4E-parentheses-brackets': ['teks-4.5A-multi-step-equations'],
  'teks-5.4F-simplify-expressions': ['teks-5.4E-parentheses-brackets'],
  'teks-5.4G-volume-formula': ['teks-4.5C-perimeter-area-formulas'],
  'teks-5.4H-perimeter-area-volume': ['teks-5.4G-volume-formula', 'teks-4.5D-perimeter-area-problems'],
  'teks-5.5A-classify-hierarchy': ['teks-4.6D-classify-2d'],
  'teks-5.6A-unit-cube-volume': ['teks-4.6A-geometric-figures'],
  'teks-5.6B-volume-rectangular-prism': ['teks-5.6A-unit-cube-volume', 'teks-5.4G-volume-formula'],
  'teks-5.7A-measurement-conversions': ['teks-4.8B-convert-measurements'],
  'teks-5.8A-coordinate-plane': ['teks-4.5B-input-output'],
  'teks-5.8B-graph-ordered-pairs': ['teks-5.8A-coordinate-plane'],
  'teks-5.8C-graph-problems': ['teks-5.8B-graph-ordered-pairs', 'teks-5.4C-numerical-patterns'],
  'teks-5.9A-data-representation': ['teks-4.9A-data-display'],
  'teks-5.9B-scatterplot': ['teks-5.9A-data-representation'],
  'teks-5.9C-data-problems': ['teks-5.9A-data-representation', 'teks-4.9B-data-problems'],
  'teks-5.10A-tax-types': ['teks-4.10A-fixed-variable-expenses'],
  'teks-5.10B-gross-net-income': ['teks-4.10B-profit'],
  'teks-5.10C-payment-methods': ['teks-4.10C-savings-plans'],
  'teks-5.10D-financial-records': ['teks-4.10D-allocate-allowance'],
  'teks-5.10E-balance-budget': ['teks-4.10E-financial-institutions'],
  'teks-5.10F-simple-budget': ['teks-5.10E-balance-budget'],
  // Grade 6 chains
  'teks-6.2A-classify-numbers': ['teks-5.2A-decimal-expanded', 'teks-5.2B-compare-decimals'],
  'teks-6.2B-opposite-absolute': ['teks-5.2C-round-decimals'],
  'teks-6.2C-compare-order-number-line': ['teks-6.2A-classify-numbers', 'teks-5.2B-compare-decimals'],
  'teks-6.2D-order-rational': ['teks-6.2C-compare-order-number-line'],
  'teks-6.2E-fraction-division': ['teks-5.3J-fraction-division'],
  'teks-6.3A-reciprocal': ['teks-6.2E-fraction-division', 'teks-5.3L-divide-unit-fractions'],
  'teks-6.3B-fraction-scaling': ['teks-5.3I-whole-times-fraction'],
  'teks-6.3C-integer-models': ['teks-6.2B-opposite-absolute'],
  'teks-6.3D-integer-operations': ['teks-6.3C-integer-models'],
  'teks-6.3E-rational-operations': ['teks-5.3E-decimal-multiply', 'teks-5.3G-decimal-divide', 'teks-6.3A-reciprocal'],
  'teks-6.4A-additive-multiplicative': ['teks-5.4C-numerical-patterns', 'teks-5.8C-graph-problems'],
  'teks-6.4B-ratio-rate-reasoning': ['teks-5.4C-numerical-patterns'],
  'teks-6.4E-ratios-percents': ['teks-5.3H-add-sub-fractions', 'teks-4.3E-add-sub-fractions'],
  'teks-6.4H-unit-conversion': ['teks-5.7A-measurement-conversions'],
  'teks-6.5A-ratio-representations': ['teks-6.4A-additive-multiplicative'],
  'teks-6.5B-percent-problems': ['teks-6.4E-ratios-percents'],
  'teks-6.6A-independent-dependent': ['teks-5.8B-graph-ordered-pairs'],
  'teks-6.6B-equation-from-table': ['teks-6.6A-independent-dependent', 'teks-5.4B-multi-step-equations'],
  'teks-6.6C-represent-y-kx': ['teks-6.6B-equation-from-table'],
  'teks-6.7A-order-operations': ['teks-5.4E-parentheses-brackets', 'teks-5.4F-simplify-expressions'],
  'teks-6.7B-expressions-equations': ['teks-5.4B-multi-step-equations'],
  'teks-6.7C-equivalent-expressions': ['teks-6.7B-expressions-equations'],
  'teks-6.7D-properties-operations': ['teks-5.4F-simplify-expressions'],
  'teks-6.9A-write-equations': ['teks-6.7B-expressions-equations'],
  'teks-6.9B-solutions-number-line': ['teks-6.2C-compare-order-number-line'],
  'teks-6.10A-solve-equations': ['teks-6.9A-write-equations', 'teks-5.4B-multi-step-equations'],
  'teks-6.10B-check-solutions': ['teks-6.2B-opposite-absolute'],
  'teks-6.8A-triangle-properties': ['teks-4.6C-triangle-types', 'teks-4.7E-unknown-angles'],
  'teks-6.8B-area-formulas': ['teks-1.6G-partition-equal', 'teks-4.5D-perimeter-area-problems'],
  'teks-6.8C-area-volume-equations': ['teks-6.8B-area-formulas', 'teks-5.6B-volume-rectangular-prism'],
  'teks-6.8D-area-volume-solve': ['teks-6.8C-area-volume-equations'],
  'teks-6.11-coordinate-plane': ['teks-5.8A-coordinate-plane', 'teks-5.8B-graph-ordered-pairs'],
  'teks-6.12A-data-graphical': ['teks-5.9A-data-representation'],
  'teks-6.12B-data-distribution': ['teks-6.12A-data-graphical'],
  'teks-6.12C-numerical-summaries': ['teks-5.9C-data-problems'],
  'teks-6.12D-categorical-summary': ['teks-5.9A-data-representation'],
  'teks-6.13A-interpret-data': ['teks-6.12A-data-graphical', 'teks-6.12C-numerical-summaries'],
  'teks-6.14A-checking-accounts': ['teks-5.10E-balance-budget'],
  'teks-6.14B-debit-credit': ['teks-6.14A-checking-accounts'],
  'teks-6.14C-check-register': ['teks-5.10F-simple-budget'],
  // Grade 7 chains
  'teks-7.2-rational-sets': ['teks-6.2A-classify-numbers'],
  'teks-7.3A-rational-fluency': ['teks-6.3D-integer-operations', 'teks-6.3E-rational-operations'],
  'teks-7.3B-rational-problems': ['teks-7.3A-rational-fluency'],
  'teks-7.4A-constant-rate': ['teks-6.4A-additive-multiplicative', 'teks-6.6C-represent-y-kx'],
  'teks-7.4B-unit-rates': ['teks-6.4B-ratio-rate-reasoning'],
  'teks-7.4C-constant-proportionality': ['teks-7.4A-constant-rate'],
  'teks-7.4D-ratio-rate-percent': ['teks-6.5B-percent-problems'],
  'teks-7.4E-measurement-conversion': ['teks-6.4H-unit-conversion'],
  'teks-7.5A-similarity': ['teks-6.5A-ratio-representations'],
  'teks-7.5B-pi-ratio': ['teks-6.4E-ratios-percents'],
  'teks-7.5C-scale-drawings': ['teks-7.5A-similarity'],
  'teks-7.6A-sample-spaces': ['teks-6.12A-data-graphical'],
  'teks-7.6I-probability': ['teks-7.6A-sample-spaces'],
  'teks-7.7-linear-relationships': ['teks-6.6C-represent-y-kx'],
  'teks-7.10A-write-equations': ['teks-6.10A-solve-equations'],
  'teks-7.10B-solutions-number-line': ['teks-6.9B-solutions-number-line'],
  'teks-7.11A-solve-two-step': ['teks-6.10A-solve-equations', 'teks-7.10A-write-equations'],
  'teks-7.11B-check-solutions': ['teks-6.10B-check-solutions'],
  'teks-7.11C-equations-geometry': ['teks-6.8A-triangle-properties', 'teks-7.11A-solve-two-step'],
  'teks-7.8A-prism-pyramid': ['teks-6.8D-area-volume-solve', 'teks-5.6B-volume-rectangular-prism'],
  'teks-7.8B-triangular-volume': ['teks-7.8A-prism-pyramid'],
  'teks-7.8C-circle-formulas': ['teks-7.5B-pi-ratio'],
  'teks-7.9A-volume-problems': ['teks-7.8A-prism-pyramid', 'teks-7.8B-triangular-volume'],
  'teks-7.9B-circle-measures': ['teks-7.8C-circle-formulas'],
  'teks-7.9C-composite-area': ['teks-6.8B-area-formulas', 'teks-7.9B-circle-measures'],
  'teks-7.9D-surface-area': ['teks-6.8B-area-formulas'],
  'teks-7.12A-compare-data': ['teks-6.12A-data-graphical', 'teks-6.12C-numerical-summaries'],
  'teks-7.12B-sample-inference': ['teks-7.6A-sample-spaces', 'teks-6.12A-data-graphical'],
  'teks-7.13A-sales-income-tax': ['teks-6.5B-percent-problems'],
  'teks-7.13B-personal-budget': ['teks-6.14C-check-register'],
  'teks-7.13E-interest': ['teks-7.4D-ratio-rate-percent'],
  'teks-7.13F-monetary-incentives': ['teks-7.4D-ratio-rate-percent'],
  // Grade 8 chains
  'teks-8.2A-real-number-sets': ['teks-7.2-rational-sets'],
  'teks-8.2B-approximate-irrational': ['teks-7.2-rational-sets', 'teks-6.2C-compare-order-number-line'],
  'teks-8.2C-scientific-notation': ['teks-6.7A-order-operations'],
  'teks-8.2D-order-real': ['teks-8.2A-real-number-sets', 'teks-8.2B-approximate-irrational'],
  'teks-8.3A-similar-proportional': ['teks-7.5A-similarity'],
  'teks-8.3B-dilation-attributes': ['teks-8.3A-similar-proportional', 'teks-6.11-coordinate-plane'],
  'teks-8.3C-dilation-algebraic': ['teks-8.3B-dilation-attributes'],
  'teks-8.4A-slope-from-triangles': ['teks-7.5A-similarity', 'teks-7.7-linear-relationships'],
  'teks-8.4B-proportional-slope': ['teks-7.4C-constant-proportionality'],
  'teks-8.4C-slope-y-intercept': ['teks-7.7-linear-relationships', 'teks-8.4A-slope-from-triangles'],
  'teks-8.5A-proportional-y-kx': ['teks-7.4C-constant-proportionality'],
  'teks-8.5B-nonproportional': ['teks-7.7-linear-relationships'],
  'teks-8.5I-write-linear': ['teks-8.4C-slope-y-intercept', 'teks-8.5B-nonproportional'],
  'teks-8.5G-identify-functions': ['teks-7.7-linear-relationships'],
  'teks-8.8A-write-equations-both': ['teks-7.11A-solve-two-step'],
  'teks-8.8C-solve-both-sides': ['teks-7.11A-solve-two-step', 'teks-8.8A-write-equations-both'],
  'teks-8.8D-angle-theorems': ['teks-7.11C-equations-geometry', 'teks-6.8A-triangle-properties'],
  'teks-8.9-systems-graphing': ['teks-8.5I-write-linear', 'teks-7.7-linear-relationships'],
  'teks-8.6A-cylinder-volume': ['teks-7.9A-volume-problems', 'teks-7.8C-circle-formulas'],
  'teks-8.6B-cylinder-cone': ['teks-7.8A-prism-pyramid', 'teks-8.6A-cylinder-volume'],
  'teks-8.6C-pythagorean-models': ['teks-6.8A-triangle-properties'],
  'teks-8.7A-volume-cylinders-cones-spheres': ['teks-8.6A-cylinder-volume', 'teks-8.6B-cylinder-cone'],
  'teks-8.7B-surface-area': ['teks-7.9D-surface-area'],
  'teks-8.7C-pythagorean-solve': ['teks-8.6C-pythagorean-models'],
  'teks-8.7D-distance-points': ['teks-8.7C-pythagorean-solve', 'teks-6.11-coordinate-plane'],
  'teks-8.10A-transformation-properties': ['teks-8.3B-dilation-attributes'],
  'teks-8.10C-transformations-algebraic': ['teks-8.10A-transformation-properties'],
  'teks-8.11A-scatterplot': ['teks-7.12A-compare-data'],
  'teks-8.11B-mean-absolute-deviation': ['teks-6.12C-numerical-summaries'],
  'teks-8.12D-interest': ['teks-7.13E-interest'],
  'teks-8.12E-payment-methods': ['teks-6.14B-debit-credit'],
  // Grade 10 Geometry (builds on Grade 8 and Algebra I)
  'teks-G.2A-constructions-conjectures': ['teks-8.10A-transformation-properties'],
  'teks-G.2B-geometric-conjectures': ['teks-G.2A-constructions-conjectures'],
  'teks-G.3A-conditional-logic': ['teks-8.8D-angle-theorems'],
  'teks-G.4A-definitions-theorems': ['teks-8.8D-angle-theorems'],
  'teks-G.5A-patterns-conjectures': ['teks-8.8D-angle-theorems'],
  'teks-G.6A-angle-theorems': ['teks-8.8D-angle-theorems', 'teks-G.5A-patterns-conjectures'],
  'teks-G.6D-triangle-theorems': ['teks-8.7C-pythagorean-solve', 'teks-G.6A-angle-theorems'],
  'teks-G.7A-pythagorean-apply': ['teks-8.7C-pythagorean-solve'],
  'teks-G.8A-similar-trig': ['teks-8.3A-similar-proportional', 'teks-G.7A-pythagorean-apply'],
  'teks-G.9A-arc-sector': ['teks-7.9B-circle-measures'],
  'teks-G.10A-cross-sections': ['teks-8.6A-cylinder-volume', 'teks-8.7A-volume-cylinders-cones-spheres'],
  'teks-G.11A-surface-area': ['teks-8.7B-surface-area'],
  'teks-G.12A-slope-similar': ['teks-8.4A-slope-from-triangles'],
  'teks-G.12D-dilation-measurements': ['teks-8.10A-transformation-properties', 'teks-8.3C-dilation-algebraic'],
  // Grade 11 Algebra II (builds on Algebra I and Geometry)
  'teks-2A.2A-domain-range': ['teks-A.7A-quadratic-graph', 'teks-A.9D-exponential-solve'],
  'teks-2A.2B-quadratic-write': ['teks-A.7A-quadratic-graph'],
  'teks-2A.3A-transformations': ['teks-A.7A-quadratic-graph'],
  'teks-2A.4A-quadratic-sqrt-solve': ['teks-A.8A-quadratic-solve'],
  'teks-2A.4B-exp-log-solve': ['teks-A.9D-exponential-solve'],
  'teks-2A.5A-parent-transforms': ['teks-2A.3A-transformations'],
  'teks-2A.6A-exp-log-domain': ['teks-A.9D-exponential-solve'],
  'teks-2A.6B-exp-log-graph': ['teks-A.9D-exponential-solve'],
  'teks-2A.7A-polynomial-ops': ['teks-A.8A-quadratic-solve'],
  'teks-2A.7B-polynomial-divide': ['teks-2A.7A-polynomial-ops'],
  'teks-2A.8A-polynomial-solve': ['teks-2A.7B-polynomial-divide'],
  'teks-2A.9A-circle-equation': ['teks-G.7A-pythagorean-apply'],
  'teks-2A.10A-complex-numbers': ['teks-A.8A-quadratic-solve'],
  'teks-2A.11A-fundamental-theorem': ['teks-2A.8A-polynomial-solve'],
};

/** Get prerequisites for a concept */
export function getPrerequisites(conceptId) {
  return PREREQUISITES[conceptId] || [];
}

/** Get all concepts that depend on this one (reverse lookup) */
export function getDependents(conceptId) {
  return Object.entries(PREREQUISITES)
    .filter(([, prereqs]) => prereqs.includes(conceptId))
    .map(([id]) => id);
}

// ─── Game ↔ Concept mapping ───────────────────────────────────
// Declares which concepts each game template supports and what
// item types / constraints it uses for that concept.
export const GAME_CONCEPT_MAP = {
  'math-sprint': {
    templateName: 'Q-Bot Math Sprint',
    supportedItemTypes: ['mcq'],
    concepts: [
      // Grade 1 – Number & Operations
      'teks-1.2A-subitizing', 'teks-1.2B-compose-decompose', 'teks-1.2E-compare-place-value',
      'teks-1.2F-order-numbers', 'teks-1.2G-compare-symbols',
      // Grade 1 – Computation
      'teks-1.3B-word-problems', 'teks-1.3C-compose-ten', 'teks-1.3D-add-sub-20',
      'teks-1.3E-explain-strategies', 'teks-1.4A-identify-coins', 'teks-1.4B-coin-value', 'teks-1.4C-count-coins',
      // Grade 1 – Algebraic Reasoning
      'teks-1.5A-count-forward-backward', 'teks-1.5B-skip-count', 'teks-1.5C-ten-more-less',
      'teks-1.5D-represent-word-problems', 'teks-1.5E-equal-sign', 'teks-1.5G-properties',
      // Grade 1 – Geometry & Measurement
      'teks-1.6A-classify-shapes', 'teks-1.6B-shape-attributes', 'teks-1.6D-identify-shapes',
      'teks-1.6E-identify-solids', 'teks-1.6G-partition-equal', 'teks-1.6H-halves-fourths',
      'teks-1.7A-measure-length', 'teks-1.7D-describe-length', 'teks-1.7E-tell-time',
      // Grade 1 – Data
      'teks-1.8C-graphs',
      // Grade 2 – Number & Operations
      'teks-2.2A-compose-decompose-1200', 'teks-2.2B-number-forms', 'teks-2.2C-greater-less',
      'teks-2.2D-compare-order', 'teks-2.2E-number-line-position', 'teks-2.2F-number-from-point',
      // Grade 2 – Fractions
      'teks-2.3A-partition-halves-fourths-eighths', 'teks-2.3B-fraction-size',
      'teks-2.3C-fractions-beyond-whole', 'teks-2.3D-halves-fourths-eighths',
      // Grade 2 – Computation
      'teks-2.4A-add-sub-20', 'teks-2.4B-add-sub-two-digit', 'teks-2.4C-word-problems-1000',
      'teks-2.4D-generate-problems', 'teks-2.5A-coin-value', 'teks-2.5B-money-symbols',
      'teks-2.6A-equal-groups-mult', 'teks-2.6B-equal-shares-div',
      // Grade 2 – Algebraic Reasoning
      'teks-2.7A-even-odd', 'teks-2.7B-ten-hundred-more-less', 'teks-2.7C-unknown-word-problems',
      // Grade 2 – Geometry & Measurement
      'teks-2.8A-create-shapes', 'teks-2.8B-classify-3d', 'teks-2.8C-classify-polygons',
      'teks-2.8D-compose-shapes', 'teks-2.8E-decompose-shapes',
      'teks-2.9A-measure-length', 'teks-2.9B-unit-size', 'teks-2.9D-measure-ruler',
      'teks-2.9E-length-problems', 'teks-2.9F-area-rectangle', 'teks-2.9G-tell-time-minute',
      // Grade 2 – Data & Financial Literacy
      'teks-2.10A-graph-scale', 'teks-2.10B-organize-data', 'teks-2.10C-graph-word-problems',
      'teks-2.10D-graph-conclusions', 'teks-2.11A-savings-accumulate',
      'teks-2.11B-saving-vs-spending', 'teks-2.11F-producers-consumers',
      // Grade 3 – Number & Operations
      'teks-3.2A-expanded-form', 'teks-3.2B-digit-identification', 'teks-3.2C-round-hundred', 'teks-3.2D-compare-order',
      // Grade 3 – Fractions
      'teks-3.3A-represent-fractions', 'teks-3.3B-fraction-number-line', 'teks-3.3C-unit-fractions',
      'teks-3.3D-compose-fractions', 'teks-3.3E-partition-fractions', 'teks-3.3F-equivalent-fractions',
      'teks-3.3G-explain-equivalence', 'teks-3.3H-compare-fractions',
      // Grade 3 – Computation
      'teks-3.4A-add-sub', 'teks-3.4A-add-sub-word',
      'teks-3.4B-rounding', 'teks-3.4C-money',
      'teks-3.4D-equal-groups', 'teks-3.4E-mult-representations',
      'teks-3.4F-multiply-facts', 'teks-3.4G-2digit-multiply',
      'teks-3.4H-division-word', 'teks-3.4I-even-odd',
      'teks-3.4J-quotient-relationship', 'teks-3.4K-division-facts',
      // Grade 3 – Algebraic Reasoning
      'teks-3.5A-word-problems', 'teks-3.5B-mult-word',
      'teks-3.5C-mult-comparison', 'teks-3.5D-missing-factor', 'teks-3.5E-patterns',
      // Grade 3 – Geometry & Measurement
      'teks-3.6A-classify-shapes', 'teks-3.6B-quadrilaterals',
      'teks-3.6C-area', 'teks-3.7A-fraction-distance',
      'teks-3.7B-perimeter', 'teks-3.7C-time',
      'teks-3.7D-measurement-choice', 'teks-3.7E-measure-capacity-weight',
      // Grade 3 – Data & Financial Literacy
      'teks-3.8A-data-display', 'teks-3.8B-data-problems',
      'teks-3.9A-income', 'teks-3.9B-scarcity', 'teks-3.9C-spending',
      'teks-3.9D-credit', 'teks-3.9E-saving',
      // Grade 4 – Number & Operations
      'teks-4.2A-place-value-relationships', 'teks-4.2B-expanded-notation',
      'teks-4.2C-compare-order', 'teks-4.2D-rounding',
      // Grade 4 – Fractions & Decimals
      'teks-4.3A-decompose-fractions', 'teks-4.3B-decompose-multiple',
      'teks-4.3C-equivalent-fractions', 'teks-4.3D-compare-fractions',
      'teks-4.3E-add-sub-fractions', 'teks-4.3F-reasonableness-fractions',
      'teks-4.3G-fractions-decimals-number-line',
      // Grade 4 – Computation
      'teks-4.4A-add-sub-decimals', 'teks-4.4B-multiply-ten-hundred',
      'teks-4.4C-two-digit-products', 'teks-4.4D-multiplication-strategies',
      'teks-4.4E-division-representations', 'teks-4.4F-division-strategies',
      'teks-4.4G-rounding-estimation', 'teks-4.4H-mult-div-fluency',
      // Grade 4 – Algebraic Reasoning
      'teks-4.5A-multi-step-equations', 'teks-4.5B-input-output',
      'teks-4.5C-perimeter-area-formulas', 'teks-4.5D-perimeter-area-problems',
      // Grade 4 – Geometry & Measurement
      'teks-4.6A-geometric-figures', 'teks-4.6B-symmetry',
      'teks-4.6C-triangle-types', 'teks-4.6D-classify-2d',
      'teks-4.7A-angle-measure', 'teks-4.7B-degrees',
      'teks-4.7C-measure-angles', 'teks-4.7D-draw-angles', 'teks-4.7E-unknown-angles',
      // Grade 4 – Data & Financial Literacy
      'teks-4.8A-measurement-units', 'teks-4.8B-convert-measurements', 'teks-4.8C-elapsed-time',
      'teks-4.9A-data-display', 'teks-4.9B-data-problems',
      'teks-4.10A-fixed-variable-expenses', 'teks-4.10B-profit',
      'teks-4.10C-savings-plans', 'teks-4.10D-allocate-allowance', 'teks-4.10E-financial-institutions',
      // Grade 5 – Number & Operations
      'teks-5.2A-decimal-expanded', 'teks-5.2B-compare-decimals', 'teks-5.2C-round-decimals',
      // Grade 5 – Computation
      'teks-5.3A-estimation', 'teks-5.3B-multiply-3x2', 'teks-5.3C-division-4x2',
      // Grade 5 – Fractions
      'teks-5.3D-decimal-mult-models', 'teks-5.3E-decimal-multiply', 'teks-5.3F-decimal-div-models',
      'teks-5.3G-decimal-divide', 'teks-5.3H-add-sub-fractions', 'teks-5.3I-whole-times-fraction',
      'teks-5.3J-fraction-division', 'teks-5.3K-add-sub-rational', 'teks-5.3L-divide-unit-fractions',
      // Grade 5 – Algebraic Reasoning
      'teks-5.4A-prime-composite', 'teks-5.4B-multi-step-equations', 'teks-5.4C-numerical-patterns',
      'teks-5.4D-pattern-types', 'teks-5.4E-parentheses-brackets', 'teks-5.4F-simplify-expressions',
      'teks-5.4G-volume-formula', 'teks-5.4H-perimeter-area-volume',
      // Grade 5 – Geometry & Measurement
      'teks-5.5A-classify-hierarchy', 'teks-5.6A-unit-cube-volume', 'teks-5.6B-volume-rectangular-prism',
      'teks-5.7A-measurement-conversions', 'teks-5.8A-coordinate-plane', 'teks-5.8B-graph-ordered-pairs', 'teks-5.8C-graph-problems',
      // Grade 5 – Data & Financial Literacy
      'teks-5.9A-data-representation', 'teks-5.9B-scatterplot', 'teks-5.9C-data-problems',
      'teks-5.10A-tax-types', 'teks-5.10B-gross-net-income', 'teks-5.10C-payment-methods',
      'teks-5.10D-financial-records', 'teks-5.10E-balance-budget', 'teks-5.10F-simple-budget',
      // Grade 6
      'teks-6.2A-classify-numbers', 'teks-6.2B-opposite-absolute', 'teks-6.2C-compare-order-number-line',
      'teks-6.2D-order-rational', 'teks-6.2E-fraction-division',
      'teks-6.3A-reciprocal', 'teks-6.3B-fraction-scaling', 'teks-6.3C-integer-models',
      'teks-6.3D-integer-operations', 'teks-6.3E-rational-operations',
      'teks-6.4A-additive-multiplicative', 'teks-6.4B-ratio-rate-reasoning', 'teks-6.4E-ratios-percents',
      'teks-6.4H-unit-conversion', 'teks-6.5A-ratio-representations', 'teks-6.5B-percent-problems',
      'teks-6.6A-independent-dependent', 'teks-6.6B-equation-from-table', 'teks-6.6C-represent-y-kx',
      'teks-6.7A-order-operations', 'teks-6.7B-expressions-equations', 'teks-6.7C-equivalent-expressions',
      'teks-6.7D-properties-operations',
      'teks-6.8A-triangle-properties', 'teks-6.8B-area-formulas', 'teks-6.8C-area-volume-equations',
      'teks-6.8D-area-volume-solve', 'teks-6.11-coordinate-plane',
      'teks-6.9A-write-equations', 'teks-6.9B-solutions-number-line', 'teks-6.10A-solve-equations',
      'teks-6.10B-check-solutions',
      'teks-6.12A-data-graphical', 'teks-6.12B-data-distribution', 'teks-6.12C-numerical-summaries',
      'teks-6.12D-categorical-summary', 'teks-6.13A-interpret-data',
      'teks-6.14A-checking-accounts', 'teks-6.14B-debit-credit', 'teks-6.14C-check-register',
      // Grade 7
      'teks-7.2-rational-sets', 'teks-7.3A-rational-fluency', 'teks-7.3B-rational-problems',
      'teks-7.4A-constant-rate', 'teks-7.4B-unit-rates', 'teks-7.4C-constant-proportionality',
      'teks-7.4D-ratio-rate-percent', 'teks-7.4E-measurement-conversion',
      'teks-7.5A-similarity', 'teks-7.5B-pi-ratio', 'teks-7.5C-scale-drawings',
      'teks-7.6A-sample-spaces', 'teks-7.6I-probability',
      'teks-7.7-linear-relationships', 'teks-7.10A-write-equations', 'teks-7.10B-solutions-number-line',
      'teks-7.11A-solve-two-step', 'teks-7.11B-check-solutions', 'teks-7.11C-equations-geometry',
      'teks-7.8A-prism-pyramid', 'teks-7.8B-triangular-volume', 'teks-7.8C-circle-formulas',
      'teks-7.9A-volume-problems', 'teks-7.9B-circle-measures', 'teks-7.9C-composite-area', 'teks-7.9D-surface-area',
      'teks-7.12A-compare-data', 'teks-7.12B-sample-inference',
      'teks-7.13A-sales-income-tax', 'teks-7.13B-personal-budget', 'teks-7.13E-interest', 'teks-7.13F-monetary-incentives',
      // Grade 8
      'teks-8.2A-real-number-sets', 'teks-8.2B-approximate-irrational', 'teks-8.2C-scientific-notation', 'teks-8.2D-order-real',
      'teks-8.3A-similar-proportional', 'teks-8.3B-dilation-attributes', 'teks-8.3C-dilation-algebraic',
      'teks-8.4A-slope-from-triangles', 'teks-8.4B-proportional-slope', 'teks-8.4C-slope-y-intercept',
      'teks-8.5A-proportional-y-kx', 'teks-8.5B-nonproportional', 'teks-8.5I-write-linear', 'teks-8.5G-identify-functions',
      'teks-8.8A-write-equations-both', 'teks-8.8C-solve-both-sides', 'teks-8.8D-angle-theorems', 'teks-8.9-systems-graphing',
      'teks-8.6A-cylinder-volume', 'teks-8.6B-cylinder-cone', 'teks-8.6C-pythagorean-models',
      'teks-8.7A-volume-cylinders-cones-spheres', 'teks-8.7B-surface-area', 'teks-8.7C-pythagorean-solve', 'teks-8.7D-distance-points',
      'teks-8.10A-transformation-properties', 'teks-8.10C-transformations-algebraic',
      'teks-8.11A-scatterplot', 'teks-8.11B-mean-absolute-deviation',
      'teks-8.12D-interest', 'teks-8.12E-payment-methods',
      // Grade 10 – Geometry
      'teks-G.2A-constructions-conjectures', 'teks-G.2B-geometric-conjectures', 'teks-G.3A-conditional-logic',
      'teks-G.4A-definitions-theorems', 'teks-G.5A-patterns-conjectures',
      'teks-G.6A-angle-theorems', 'teks-G.6D-triangle-theorems', 'teks-G.7A-pythagorean-apply',
      'teks-G.8A-similar-trig', 'teks-G.9A-arc-sector', 'teks-G.10A-cross-sections',
      'teks-G.11A-surface-area', 'teks-G.12A-slope-similar', 'teks-G.12D-dilation-measurements',
      // Grade 11 – Algebra II
      'teks-2A.2A-domain-range', 'teks-2A.2B-quadratic-write', 'teks-2A.3A-transformations',
      'teks-2A.4A-quadratic-sqrt-solve', 'teks-2A.4B-exp-log-solve', 'teks-2A.5A-parent-transforms',
      'teks-2A.6A-exp-log-domain', 'teks-2A.6B-exp-log-graph',
      'teks-2A.7A-polynomial-ops', 'teks-2A.7B-polynomial-divide', 'teks-2A.8A-polynomial-solve',
      'teks-2A.9A-circle-equation', 'teks-2A.10A-complex-numbers', 'teks-2A.11A-fundamental-theorem',
    ],
  },
  'math-match': {
    templateName: 'Math Match',
    supportedItemTypes: ['match-pairs'],
    concepts: [
      // Grade 1
      'teks-1.2A-subitizing', 'teks-1.2B-compose-decompose', 'teks-1.2G-compare-symbols',
      'teks-1.3C-compose-ten', 'teks-1.3D-add-sub-20', 'teks-1.4A-identify-coins',
      'teks-1.5B-skip-count', 'teks-1.5E-equal-sign', 'teks-1.6A-classify-shapes',
      'teks-1.6D-identify-shapes', 'teks-1.6G-partition-equal', 'teks-1.6H-halves-fourths',
      // Grade 2
      'teks-2.2A-compose-decompose-1200', 'teks-2.2D-compare-order', 'teks-2.2B-number-forms',
      'teks-2.3A-partition-halves-fourths-eighths', 'teks-2.3D-halves-fourths-eighths',
      'teks-2.4A-add-sub-20', 'teks-2.4B-add-sub-two-digit', 'teks-2.5A-coin-value',
      'teks-2.5B-money-symbols', 'teks-2.6A-equal-groups-mult', 'teks-2.6B-equal-shares-div',
      'teks-2.7A-even-odd', 'teks-2.7B-ten-hundred-more-less',
      'teks-2.8A-create-shapes', 'teks-2.8B-classify-3d', 'teks-2.8C-classify-polygons',
      'teks-2.9F-area-rectangle', 'teks-2.9G-tell-time-minute',
      'teks-2.10A-graph-scale', 'teks-2.10B-organize-data',
      // Grade 3
      'teks-3.2A-expanded-form', 'teks-3.2B-digit-identification', 'teks-3.2D-compare-order',
      'teks-3.3A-represent-fractions', 'teks-3.3F-equivalent-fractions', 'teks-3.3H-compare-fractions',
      'teks-3.4A-add-sub', 'teks-3.4D-equal-groups', 'teks-3.4E-mult-representations',
      'teks-3.4F-multiply-facts', 'teks-3.4I-even-odd', 'teks-3.4J-quotient-relationship', 'teks-3.4K-division-facts',
      'teks-3.5A-word-problems', 'teks-3.5B-mult-word', 'teks-3.5C-mult-comparison', 'teks-3.5D-missing-factor', 'teks-3.5E-patterns',
      // Grade 4
      'teks-4.2A-place-value-relationships', 'teks-4.2B-expanded-notation', 'teks-4.2C-compare-order',
      'teks-4.3C-equivalent-fractions', 'teks-4.3D-compare-fractions',
      'teks-4.4A-add-sub-decimals', 'teks-4.4B-multiply-ten-hundred', 'teks-4.4C-two-digit-products',
      'teks-4.4D-multiplication-strategies', 'teks-4.4E-division-representations', 'teks-4.4F-division-strategies',
      'teks-4.4G-rounding-estimation', 'teks-4.4H-mult-div-fluency',
      'teks-4.5A-multi-step-equations', 'teks-4.5B-input-output',
      // Grade 5
      'teks-5.2A-decimal-expanded', 'teks-5.2B-compare-decimals', 'teks-5.2C-round-decimals',
      'teks-5.3B-multiply-3x2', 'teks-5.3C-division-4x2', 'teks-5.3E-decimal-multiply',
      'teks-5.3H-add-sub-fractions', 'teks-5.3K-add-sub-rational',
      'teks-5.4A-prime-composite', 'teks-5.4B-multi-step-equations', 'teks-5.4E-parentheses-brackets', 'teks-5.4F-simplify-expressions',
      // Grade 6
      'teks-6.2A-classify-numbers', 'teks-6.2B-opposite-absolute', 'teks-6.2C-compare-order-number-line',
      'teks-6.3A-reciprocal', 'teks-6.3D-integer-operations', 'teks-6.3E-rational-operations',
      'teks-6.4A-additive-multiplicative', 'teks-6.4B-ratio-rate-reasoning', 'teks-6.5A-ratio-representations',
      'teks-6.5B-percent-problems', 'teks-6.6A-independent-dependent', 'teks-6.6B-equation-from-table',
      'teks-6.7A-order-operations', 'teks-6.7B-expressions-equations', 'teks-6.7D-properties-operations',
      'teks-6.9A-write-equations', 'teks-6.10A-solve-equations', 'teks-6.10B-check-solutions',
      // Grade 7
      'teks-7.2-rational-sets', 'teks-7.3A-rational-fluency', 'teks-7.3B-rational-problems',
      'teks-7.4A-constant-rate', 'teks-7.4C-constant-proportionality', 'teks-7.4D-ratio-rate-percent',
      'teks-7.5A-similarity', 'teks-7.5C-scale-drawings', 'teks-7.6A-sample-spaces', 'teks-7.6I-probability',
      'teks-7.7-linear-relationships', 'teks-7.10A-write-equations', 'teks-7.11A-solve-two-step',
      'teks-7.11B-check-solutions', 'teks-7.11C-equations-geometry',
      // Grade 8
      'teks-8.2A-real-number-sets', 'teks-8.2B-approximate-irrational', 'teks-8.2C-scientific-notation',
      'teks-8.3A-similar-proportional', 'teks-8.4A-slope-from-triangles', 'teks-8.4C-slope-y-intercept',
      'teks-8.5A-proportional-y-kx', 'teks-8.5B-nonproportional', 'teks-8.5I-write-linear',
      'teks-8.8A-write-equations-both', 'teks-8.8C-solve-both-sides', 'teks-8.8D-angle-theorems', 'teks-8.9-systems-graphing',
      'teks-8.6C-pythagorean-models', 'teks-8.7C-pythagorean-solve', 'teks-8.7D-distance-points',
      'teks-8.10C-transformations-algebraic', 'teks-8.11A-scatterplot',
      // Grade 10
      'teks-G.3A-conditional-logic', 'teks-G.6A-angle-theorems', 'teks-G.7A-pythagorean-apply',
      'teks-G.8A-similar-trig', 'teks-G.11A-surface-area',
      // Grade 11
      'teks-2A.4A-quadratic-sqrt-solve', 'teks-2A.7A-polynomial-ops', 'teks-2A.8A-polynomial-solve',
      'teks-2A.10A-complex-numbers',
    ],
  },
  'q-blocks': {
    templateName: 'Q-Blocks',
    supportedItemTypes: ['mcq'],
    concepts: [
      // Grade 1
      'teks-1.2B-compose-decompose', 'teks-1.2G-compare-symbols',
      'teks-1.3C-compose-ten', 'teks-1.3D-add-sub-20', 'teks-1.4A-identify-coins', 'teks-1.4C-count-coins',
      'teks-1.5B-skip-count', 'teks-1.5D-represent-word-problems', 'teks-1.5E-equal-sign',
      // Grade 2
      'teks-2.2A-compose-decompose-1200', 'teks-2.2D-compare-order',
      'teks-2.4A-add-sub-20', 'teks-2.4B-add-sub-two-digit', 'teks-2.5A-coin-value',
      'teks-2.6A-equal-groups-mult', 'teks-2.6B-equal-shares-div',
      'teks-2.7B-ten-hundred-more-less', 'teks-2.7C-unknown-word-problems',
      'teks-2.5B-money-symbols', 'teks-2.4D-generate-problems',
      // Grade 3
      'teks-3.2A-expanded-form', 'teks-3.2C-round-hundred',
      'teks-3.4A-add-sub', 'teks-3.4B-rounding', 'teks-3.4C-money',
      'teks-3.4D-equal-groups', 'teks-3.4E-mult-representations',
      'teks-3.4F-multiply-facts', 'teks-3.4G-2digit-multiply',
      'teks-3.4I-even-odd', 'teks-3.4J-quotient-relationship', 'teks-3.4K-division-facts',
      'teks-3.5A-word-problems', 'teks-3.5B-mult-word', 'teks-3.5D-missing-factor',
      // Grade 4
      'teks-4.2A-place-value-relationships', 'teks-4.2B-expanded-notation', 'teks-4.2D-rounding',
      'teks-4.4A-add-sub-decimals', 'teks-4.4B-multiply-ten-hundred',
      'teks-4.4C-two-digit-products', 'teks-4.4D-multiplication-strategies',
      'teks-4.4E-division-representations', 'teks-4.4F-division-strategies',
      'teks-4.4G-rounding-estimation', 'teks-4.4H-mult-div-fluency',
      'teks-4.5A-multi-step-equations', 'teks-4.5B-input-output',
      // Grade 5
      'teks-5.2A-decimal-expanded', 'teks-5.2B-compare-decimals',
      'teks-5.3B-multiply-3x2', 'teks-5.3C-division-4x2', 'teks-5.3E-decimal-multiply',
      'teks-5.3K-add-sub-rational', 'teks-5.4B-multi-step-equations',
      'teks-5.4E-parentheses-brackets', 'teks-5.4F-simplify-expressions',
      // Grade 6
      'teks-6.2A-classify-numbers', 'teks-6.2B-opposite-absolute',
      'teks-6.3A-reciprocal', 'teks-6.3D-integer-operations', 'teks-6.3E-rational-operations',
      'teks-6.4B-ratio-rate-reasoning', 'teks-6.5B-percent-problems',
      'teks-6.7A-order-operations', 'teks-6.7D-properties-operations',
      'teks-6.10A-solve-equations', 'teks-6.10B-check-solutions',
      // Grade 7
      'teks-7.2-rational-sets', 'teks-7.3A-rational-fluency', 'teks-7.3B-rational-problems',
      'teks-7.4A-constant-rate', 'teks-7.4D-ratio-rate-percent', 'teks-7.5C-scale-drawings',
      'teks-7.7-linear-relationships', 'teks-7.11A-solve-two-step',       'teks-7.11B-check-solutions', 'teks-7.11C-equations-geometry',
      // Grade 8
      'teks-8.2A-real-number-sets', 'teks-8.2B-approximate-irrational', 'teks-8.2C-scientific-notation',
      'teks-8.4C-slope-y-intercept', 'teks-8.5I-write-linear', 'teks-8.8C-solve-both-sides', 'teks-8.8D-angle-theorems',
      'teks-8.9-systems-graphing', 'teks-8.7C-pythagorean-solve', 'teks-8.7D-distance-points',
      // Grade 10
      'teks-G.3A-conditional-logic', 'teks-G.6A-angle-theorems', 'teks-G.7A-pythagorean-apply',
      'teks-G.8A-similar-trig', 'teks-G.11A-surface-area',
      // Grade 11
      'teks-2A.4A-quadratic-sqrt-solve', 'teks-2A.7A-polynomial-ops', 'teks-2A.8A-polynomial-solve',
      'teks-2A.10A-complex-numbers',
    ],
  },
};

// ─── Lookup helpers ────────────────────────────────────────────

/** Get all concepts (flat list) for a grade */
export function getAllConcepts(gradeId) {
  const gradeStandards = STANDARDS[gradeId];
  if (!gradeStandards) return [];
  const concepts = [];
  for (const domainId of Object.keys(gradeStandards)) {
    for (const standard of gradeStandards[domainId]) {
      for (const concept of standard.concepts) {
        concepts.push({ ...concept, standardCode: standard.code, domainId });
      }
    }
  }
  return concepts;
}

/** Get all concepts for a specific domain in a grade */
export function getConceptsByDomain(gradeId, domainId) {
  const domainStandards = STANDARDS[gradeId]?.[domainId] || [];
  const concepts = [];
  for (const standard of domainStandards) {
    for (const concept of standard.concepts) {
      concepts.push({ ...concept, standardCode: standard.code, domainId });
    }
  }
  return concepts;
}

/** Get a concept by its universal conceptId */
export function getConceptById(conceptId) {
  for (const gradeId of Object.keys(STANDARDS)) {
    for (const domainId of Object.keys(STANDARDS[gradeId])) {
      for (const standard of STANDARDS[gradeId][domainId]) {
        for (const concept of standard.concepts) {
          if (concept.conceptId === conceptId) {
            return { ...concept, standardCode: standard.code, gradeId, domainId };
          }
        }
      }
    }
  }
  return null;
}

/** Get games that support a specific concept */
export function getGamesForConcept(conceptId) {
  const matches = [];
  for (const [gameId, mapping] of Object.entries(GAME_CONCEPT_MAP)) {
    if (mapping.concepts.includes(conceptId)) {
      matches.push(gameId);
    }
  }
  return matches;
}

/** Get the generator keys for a concept (used to wire into Math Sprint) */
export function getGeneratorsForConcept(conceptId) {
  const concept = getConceptById(conceptId);
  return concept?.generators || [];
}

/** Get TEKS code(s) for a concept (for URL parameters to game) */
export function getTeksForConcept(conceptId) {
  const concept = getConceptById(conceptId);
  return concept?.standardCode || '';
}
