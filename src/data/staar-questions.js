// STAAR Grade 3 Math Question Bank
// Organized by TEA Reporting Categories
// Question types: mc (multiple choice), grid (gridded response), multi (multi-select)

export const STAAR_REPORTING_CATEGORIES = [
  { id: 'cat1', name: 'Numerical Representations & Relationships', teks: ['3.2A','3.2B','3.2C','3.2D','3.3A','3.3B','3.3C','3.3D','3.3E','3.3F','3.3G','3.3H'], weight: 0.20 },
  { id: 'cat2', name: 'Computations & Algebraic Relationships', teks: ['3.4A','3.4B','3.4C','3.4D','3.4E','3.4F','3.4G','3.4H','3.4I','3.4J','3.4K','3.5A','3.5B','3.5C','3.5D','3.5E'], weight: 0.40 },
  { id: 'cat3', name: 'Geometry & Measurement', teks: ['3.6A','3.6B','3.6C','3.7A','3.7B','3.7C','3.7D','3.7E'], weight: 0.20 },
  { id: 'cat4', name: 'Data Analysis & Personal Financial Literacy', teks: ['3.8A','3.8B','3.9A','3.9B','3.9C','3.9D','3.9E'], weight: 0.20 },
];

export const STAAR_QUESTIONS = [
  // ═══════════════════════════════════════════════
  // CATEGORY 1: Numerical Representations & Relationships
  // ═══════════════════════════════════════════════

  // 3.2A — Place value
  { id: 's001', cat: 'cat1', teks: '3.2A', type: 'mc', difficulty: 1,
    q: 'What is the value of the digit 7 in the number 4,732?',
    choices: ['7', '70', '700', '7,000'], answer: '700',
    explanation: 'The 7 is in the hundreds place, so its value is 700.' },
  { id: 's002', cat: 'cat1', teks: '3.2A', type: 'mc', difficulty: 1,
    q: 'Which number has a 5 in the tens place?',
    choices: ['5,123', '1,253', '3,215', '2,531'], answer: '1,253',
    explanation: 'In 1,253 the digit 5 is in the tens place (50).' },
  { id: 's003', cat: 'cat1', teks: '3.2A', type: 'mc', difficulty: 2,
    q: 'Which shows 4,000 + 300 + 60 + 2 in standard form?',
    choices: ['4,362', '4,326', '4,632', '4,263'], answer: '4,362',
    explanation: '4,000 + 300 + 60 + 2 = 4,362.' },
  { id: 's004', cat: 'cat1', teks: '3.2A', type: 'grid', difficulty: 2,
    q: 'What is the value of the digit 9 in 9,045?',
    answer: '9000',
    explanation: 'The 9 is in the thousands place, so its value is 9,000.' },

  // 3.2B — Compare and order numbers
  { id: 's005', cat: 'cat1', teks: '3.2B', type: 'mc', difficulty: 1,
    q: 'Which symbol makes this statement true? 3,452 ___ 3,542',
    choices: ['>', '<', '='], answer: '<',
    explanation: '3,452 < 3,542. Compare the hundreds digits: 4 < 5.' },
  { id: 's006', cat: 'cat1', teks: '3.2B', type: 'mc', difficulty: 2,
    q: 'Which set of numbers is in order from least to greatest?',
    choices: ['1,234; 1,243; 1,324', '1,324; 1,243; 1,234', '1,243; 1,324; 1,234', '1,234; 1,324; 1,243'], answer: '1,234; 1,243; 1,324',
    explanation: '1,234 < 1,243 < 1,324 — compare digits from left to right.' },

  // 3.2C — Represent numbers on a number line
  { id: 's007', cat: 'cat1', teks: '3.2C', type: 'mc', difficulty: 1,
    q: 'A number line shows marks at 400, 450, 500, 550, 600. What number is at the mark halfway between 400 and 500?',
    choices: ['425', '450', '475', '500'], answer: '450',
    explanation: '450 is exactly halfway between 400 and 500.' },
  { id: 's008', cat: 'cat1', teks: '3.2C', type: 'mc', difficulty: 2,
    q: 'Which number is closest to 675 on a number line: 650, 670, 680, or 700?',
    choices: ['650', '670', '680', '700'], answer: '680',
    explanation: '675 is only 5 away from 680, making 680 the closest.' },

  // 3.2D — Round to nearest 10 or 100
  { id: 's009', cat: 'cat1', teks: '3.2D', type: 'mc', difficulty: 1,
    q: 'What is 347 rounded to the nearest hundred?',
    choices: ['300', '340', '350', '400'], answer: '300',
    explanation: '347 is closer to 300 than to 400 (the tens digit is 4, which is less than 5).' },
  { id: 's010', cat: 'cat1', teks: '3.2D', type: 'mc', difficulty: 1,
    q: 'What is 863 rounded to the nearest ten?',
    choices: ['860', '870', '900', '800'], answer: '860',
    explanation: '863 rounds down to 860 because the ones digit (3) is less than 5.' },

  // 3.3A — Represent fractions
  { id: 's011', cat: 'cat1', teks: '3.3A', type: 'mc', difficulty: 1,
    q: 'A pizza is cut into 8 equal slices. Maria ate 3 slices. What fraction of the pizza did Maria eat?',
    choices: ['3/8', '8/3', '3/5', '5/8'], answer: '3/8',
    explanation: 'Maria ate 3 out of 8 equal slices = 3/8.' },
  { id: 's012', cat: 'cat1', teks: '3.3A', type: 'mc', difficulty: 2,
    q: 'Which fraction represents the shaded part if 2 out of 6 equal parts of a rectangle are shaded?',
    choices: ['2/6', '4/6', '6/2', '2/4'], answer: '2/6',
    explanation: '2 shaded parts out of 6 total equal parts = 2/6.' },

  // 3.3D — Compare fractions
  { id: 's013', cat: 'cat1', teks: '3.3D', type: 'mc', difficulty: 1,
    q: 'Which fraction is greater: 5/8 or 3/8?',
    choices: ['5/8', '3/8', 'They are equal', 'Cannot compare'], answer: '5/8',
    explanation: 'Same denominator, so compare numerators: 5 > 3. So 5/8 > 3/8.' },
  { id: 's014', cat: 'cat1', teks: '3.3D', type: 'mc', difficulty: 2,
    q: 'Which is greater: 1/3 or 1/6?',
    choices: ['1/3', '1/6', 'They are equal', 'Cannot tell'], answer: '1/3',
    explanation: 'Same numerator, smaller denominator = larger fraction. 1/3 > 1/6.' },

  // 3.3E — Equivalent fractions
  { id: 's015', cat: 'cat1', teks: '3.3E', type: 'mc', difficulty: 2,
    q: 'Which fraction is equivalent to 1/2?',
    choices: ['2/4', '1/4', '2/3', '3/4'], answer: '2/4',
    explanation: '1/2 = 2/4. Multiply numerator and denominator by 2.' },
  { id: 's016', cat: 'cat1', teks: '3.3E', type: 'mc', difficulty: 2,
    q: '3/4 is equivalent to which fraction?',
    choices: ['6/8', '3/8', '4/6', '4/8'], answer: '6/8',
    explanation: '3/4 = 6/8. Multiply both parts by 2: 3×2=6, 4×2=8.' },

  // 3.3F — Represent equivalent fractions
  { id: 's017', cat: 'cat1', teks: '3.3F', type: 'mc', difficulty: 1,
    q: 'What number makes this true? 1/2 = __/4',
    choices: ['1', '2', '3', '4'], answer: '2',
    explanation: '1/2 = 2/4. The denominator doubled (2→4), so the numerator doubles (1→2).' },

  // 3.3H — Fractions greater than one
  { id: 's018', cat: 'cat1', teks: '3.3H', type: 'mc', difficulty: 2,
    q: 'Which fraction is greater than 1?',
    choices: ['5/3', '2/4', '3/8', '1/2'], answer: '5/3',
    explanation: 'When the numerator is larger than the denominator, the fraction is greater than 1. 5/3 > 1.' },

  // ═══════════════════════════════════════════════
  // CATEGORY 2: Computations & Algebraic Relationships
  // ═══════════════════════════════════════════════

  // 3.4A — Add and subtract
  { id: 's019', cat: 'cat2', teks: '3.4A', type: 'mc', difficulty: 1,
    q: 'What is 456 + 327?',
    choices: ['783', '773', '883', '683'], answer: '783',
    explanation: '456 + 327 = 783.' },
  { id: 's020', cat: 'cat2', teks: '3.4A', type: 'mc', difficulty: 1,
    q: 'What is 804 − 567?',
    choices: ['237', '247', '337', '227'], answer: '237',
    explanation: '804 − 567 = 237.' },
  { id: 's021', cat: 'cat2', teks: '3.4A', type: 'grid', difficulty: 2,
    q: 'A school has 1,245 students. 389 students are absent. How many students are present?',
    answer: '856',
    explanation: '1,245 − 389 = 856 students present.' },

  // 3.4C — Multiply (one-digit by one-digit)
  { id: 's022', cat: 'cat2', teks: '3.4C', type: 'mc', difficulty: 1,
    q: 'What is 7 × 8?',
    choices: ['54', '56', '48', '63'], answer: '56',
    explanation: '7 × 8 = 56.' },
  { id: 's023', cat: 'cat2', teks: '3.4C', type: 'mc', difficulty: 1,
    q: 'A garden has 6 rows with 9 plants in each row. How many plants are there in all?',
    choices: ['54', '45', '63', '48'], answer: '54',
    explanation: '6 × 9 = 54 plants.' },
  { id: 's024', cat: 'cat2', teks: '3.4C', type: 'grid', difficulty: 2,
    q: 'There are 8 bags with 7 marbles in each bag. What is the total number of marbles?',
    answer: '56',
    explanation: '8 × 7 = 56 marbles.' },

  // 3.4D — Divide (basic facts)
  { id: 's025', cat: 'cat2', teks: '3.4D', type: 'mc', difficulty: 1,
    q: 'What is 42 ÷ 6?',
    choices: ['6', '7', '8', '9'], answer: '7',
    explanation: '42 ÷ 6 = 7.' },
  { id: 's026', cat: 'cat2', teks: '3.4D', type: 'mc', difficulty: 2,
    q: '48 stickers are shared equally among 8 students. How many stickers does each student get?',
    choices: ['5', '6', '7', '8'], answer: '6',
    explanation: '48 ÷ 8 = 6 stickers each.' },

  // 3.4H — Word problems (number sentences)
  { id: 's027', cat: 'cat2', teks: '3.4H', type: 'mc', difficulty: 2,
    q: 'Jake had 52 baseball cards. He gave 18 to his friend and then found 7 more. Which number sentence shows how many he has now?',
    choices: ['52 − 18 + 7 = ?', '52 + 18 − 7 = ?', '52 − 18 − 7 = ?', '52 + 18 + 7 = ?'], answer: '52 − 18 + 7 = ?',
    explanation: 'Start with 52, subtract 18 (gave away), add 7 (found): 52 − 18 + 7 = 41.' },
  { id: 's028', cat: 'cat2', teks: '3.4H', type: 'mc', difficulty: 2,
    q: 'A store has 5 shelves with 8 toys on each shelf. Which number sentence finds the total?',
    choices: ['5 × 8 = ?', '5 + 8 = ?', '8 − 5 = ?', '8 ÷ 5 = ?'], answer: '5 × 8 = ?',
    explanation: 'Equal groups: 5 shelves × 8 toys = 5 × 8 = 40 toys.' },

  // 3.5A — Represent problems with equations
  { id: 's029', cat: 'cat2', teks: '3.5A', type: 'mc', difficulty: 1,
    q: 'What comes next in the pattern? 5, 10, 15, 20, ___',
    choices: ['24', '25', '30', '22'], answer: '25',
    explanation: 'The pattern adds 5 each time: 20 + 5 = 25.' },
  { id: 's030', cat: 'cat2', teks: '3.5A', type: 'mc', difficulty: 2,
    q: 'What is the rule for this pattern? 3, 9, 27, 81...',
    choices: ['Multiply by 3', 'Add 6', 'Multiply by 9', 'Add 3'], answer: 'Multiply by 3',
    explanation: '3 × 3 = 9, 9 × 3 = 27, 27 × 3 = 81. The rule is multiply by 3.' },

  // 3.5B — Missing number in equations
  { id: 's031', cat: 'cat2', teks: '3.5B', type: 'mc', difficulty: 1,
    q: 'What number makes this equation true? ___ × 6 = 42',
    choices: ['6', '7', '8', '9'], answer: '7',
    explanation: '7 × 6 = 42, so the missing number is 7.' },
  { id: 's032', cat: 'cat2', teks: '3.5B', type: 'grid', difficulty: 2,
    q: 'Find the missing number: 15 + ___ = 43',
    answer: '28',
    explanation: '43 − 15 = 28, so the missing number is 28.' },

  // 3.5C — Describe patterns in multiplication table
  { id: 's033', cat: 'cat2', teks: '3.5C', type: 'multi', difficulty: 2,
    q: 'Which of the following are TRUE about the multiples of 4? Select ALL that apply.',
    choices: ['They are always even', 'They end in 0 or 4 only', 'They include 4, 8, 12, 16...', 'They are all odd'], answer: ['They are always even', 'They include 4, 8, 12, 16...'],
    explanation: 'Multiples of 4 are always even (4, 8, 12, 16, 20, 24...) but can end in 0, 2, 4, 6, or 8.' },

  // 3.4K — Solve one-step and two-step problems
  { id: 's034', cat: 'cat2', teks: '3.4K', type: 'mc', difficulty: 2,
    q: 'Maria bought 3 packs of markers with 8 markers each. She already had 12 markers at home. How many markers does she have now?',
    choices: ['36', '23', '24', '32'], answer: '36',
    explanation: '3 × 8 = 24 new markers. 24 + 12 = 36 total markers.' },
  { id: 's035', cat: 'cat2', teks: '3.4K', type: 'mc', difficulty: 3,
    q: 'A farmer collected 156 eggs on Monday and 204 eggs on Tuesday. He packed them into boxes of 6. How many full boxes can he make?',
    choices: ['60', '56', '62', '58'], answer: '60',
    explanation: '156 + 204 = 360 eggs. 360 ÷ 6 = 60 boxes.' },

  // ═══════════════════════════════════════════════
  // CATEGORY 3: Geometry & Measurement
  // ═══════════════════════════════════════════════

  // 3.6A — Classify shapes
  { id: 's036', cat: 'cat3', teks: '3.6A', type: 'mc', difficulty: 1,
    q: 'Which shape has exactly 3 sides and 3 angles?',
    choices: ['Triangle', 'Rectangle', 'Pentagon', 'Hexagon'], answer: 'Triangle',
    explanation: 'A triangle has exactly 3 sides and 3 angles.' },
  { id: 's037', cat: 'cat3', teks: '3.6A', type: 'mc', difficulty: 2,
    q: 'A 3D shape has 6 faces, 12 edges, and 8 vertices. What shape is it?',
    choices: ['Cube', 'Cone', 'Cylinder', 'Sphere'], answer: 'Cube',
    explanation: 'A cube (or rectangular prism) has 6 faces, 12 edges, and 8 vertices.' },

  // 3.6B — Quadrilaterals
  { id: 's038', cat: 'cat3', teks: '3.6B', type: 'mc', difficulty: 1,
    q: 'Which shape is a quadrilateral with 4 equal sides and 4 right angles?',
    choices: ['Square', 'Rectangle', 'Rhombus', 'Trapezoid'], answer: 'Square',
    explanation: 'A square has 4 equal sides and 4 right angles.' },
  { id: 's039', cat: 'cat3', teks: '3.6B', type: 'multi', difficulty: 2,
    q: 'Which of these are quadrilaterals? Select ALL that apply.',
    choices: ['Rectangle', 'Triangle', 'Trapezoid', 'Rhombus'], answer: ['Rectangle', 'Trapezoid', 'Rhombus'],
    explanation: 'Quadrilaterals have 4 sides. Rectangle, trapezoid, and rhombus all have 4 sides. A triangle has only 3.' },

  // 3.6C — Area
  { id: 's040', cat: 'cat3', teks: '3.6C', type: 'mc', difficulty: 1,
    q: 'What is the area of a rectangle that is 5 units long and 3 units wide?',
    choices: ['15 square units', '16 square units', '8 square units', '30 square units'], answer: '15 square units',
    explanation: 'Area = length × width = 5 × 3 = 15 square units.' },
  { id: 's041', cat: 'cat3', teks: '3.6C', type: 'grid', difficulty: 2,
    q: 'A rectangular garden is 9 feet long and 4 feet wide. What is the area in square feet?',
    answer: '36',
    explanation: 'Area = 9 × 4 = 36 square feet.' },

  // 3.7A — Fractions on number line (measurement)
  { id: 's042', cat: 'cat3', teks: '3.7A', type: 'mc', difficulty: 1,
    q: 'A number line goes from 0 to 1 and is divided into 4 equal parts. What fraction is at the first mark?',
    choices: ['1/4', '1/2', '1/3', '3/4'], answer: '1/4',
    explanation: 'Divided into 4 equal parts, the first mark is 1/4 of the distance from 0 to 1.' },

  // 3.7B — Perimeter
  { id: 's043', cat: 'cat3', teks: '3.7B', type: 'mc', difficulty: 1,
    q: 'What is the perimeter of a rectangle with length 8 cm and width 5 cm?',
    choices: ['26 cm', '13 cm', '40 cm', '21 cm'], answer: '26 cm',
    explanation: 'Perimeter = 2 × (8 + 5) = 2 × 13 = 26 cm.' },
  { id: 's044', cat: 'cat3', teks: '3.7B', type: 'grid', difficulty: 2,
    q: 'A square has a perimeter of 36 inches. What is the length of one side?',
    answer: '9',
    explanation: 'A square has 4 equal sides. 36 ÷ 4 = 9 inches per side.' },
  { id: 's045', cat: 'cat3', teks: '3.7B', type: 'mc', difficulty: 3,
    q: 'A rectangle has a perimeter of 24 units. The length is 8 units. What is the width?',
    choices: ['4 units', '3 units', '8 units', '16 units'], answer: '4 units',
    explanation: 'Perimeter = 2(L + W). 24 = 2(8 + W). 12 = 8 + W. W = 4 units.' },

  // 3.7C — Elapsed time
  { id: 's046', cat: 'cat3', teks: '3.7C', type: 'mc', difficulty: 1,
    q: 'A movie starts at 2:15 PM and lasts 45 minutes. What time does it end?',
    choices: ['3:00 PM', '2:45 PM', '3:15 PM', '2:60 PM'], answer: '3:00 PM',
    explanation: '2:15 + 45 minutes = 3:00 PM.' },
  { id: 's047', cat: 'cat3', teks: '3.7C', type: 'mc', difficulty: 2,
    q: 'Sarah started her homework at 4:30 PM and finished at 5:15 PM. How long did she spend on homework?',
    choices: ['45 minutes', '30 minutes', '55 minutes', '1 hour'], answer: '45 minutes',
    explanation: 'From 4:30 to 5:15 is 45 minutes.' },

  // 3.7D — Liquid volume and weight
  { id: 's048', cat: 'cat3', teks: '3.7D', type: 'mc', difficulty: 1,
    q: 'Which unit would be best to measure the weight of a dog?',
    choices: ['Pounds', 'Inches', 'Liters', 'Minutes'], answer: 'Pounds',
    explanation: 'Weight is measured in pounds (or kilograms). Inches measure length, liters measure liquid, minutes measure time.' },

  // 3.7E — Determine liquid volume / weight
  { id: 's049', cat: 'cat3', teks: '3.7E', type: 'mc', difficulty: 2,
    q: 'A fish tank holds 12 liters. After adding water, it now has 8 liters. How many more liters are needed to fill it?',
    choices: ['4 liters', '3 liters', '20 liters', '8 liters'], answer: '4 liters',
    explanation: '12 − 8 = 4 more liters needed.' },

  // ═══════════════════════════════════════════════
  // CATEGORY 4: Data Analysis & Personal Financial Literacy
  // ═══════════════════════════════════════════════

  // 3.8A — Data from graphs
  { id: 's050', cat: 'cat4', teks: '3.8A', type: 'mc', difficulty: 1,
    q: 'A bar graph shows: Apples=8, Bananas=5, Grapes=10, Oranges=3. Which fruit is the most popular?',
    choices: ['Grapes', 'Apples', 'Bananas', 'Oranges'], answer: 'Grapes',
    explanation: 'Grapes has the tallest bar at 10, making it the most popular.' },
  { id: 's051', cat: 'cat4', teks: '3.8A', type: 'grid', difficulty: 2,
    q: 'A pictograph shows that each symbol = 2 votes. "Soccer" has 7 symbols. How many votes did Soccer get?',
    answer: '14',
    explanation: '7 symbols × 2 votes each = 14 votes.' },

  // 3.8B — Interpret data
  { id: 's052', cat: 'cat4', teks: '3.8B', type: 'mc', difficulty: 2,
    q: 'A dot plot shows the number of books students read: 1 book (3 dots), 2 books (5 dots), 3 books (4 dots), 4 books (2 dots). How many students are shown in all?',
    choices: ['14', '10', '12', '16'], answer: '14',
    explanation: '3 + 5 + 4 + 2 = 14 students total.' },
  { id: 's053', cat: 'cat4', teks: '3.8B', type: 'mc', difficulty: 2,
    q: 'Using the same dot plot: How many MORE students read 2 books than 4 books?',
    choices: ['3', '5', '2', '7'], answer: '3',
    explanation: '5 students read 2 books, 2 students read 4 books. 5 − 2 = 3 more.' },

  // 3.9A — Financial literacy — determining value of coins/bills
  { id: 's054', cat: 'cat4', teks: '3.9A', type: 'mc', difficulty: 1,
    q: 'Which combination of coins equals $0.75?',
    choices: ['3 quarters', '7 dimes', '7 nickels and 1 dime', '75 pennies'], answer: '3 quarters',
    explanation: '3 quarters = 3 × $0.25 = $0.75.' },

  // 3.9B — Calculate profit
  { id: 's055', cat: 'cat4', teks: '3.9B', type: 'mc', difficulty: 2,
    q: 'Luis bought supplies for $12 and sold lemonade for $20. What was his profit?',
    choices: ['$8', '$12', '$20', '$32'], answer: '$8',
    explanation: 'Profit = money earned − money spent = $20 − $12 = $8.' },

  // 3.9C — Spending plan
  { id: 's056', cat: 'cat4', teks: '3.9C', type: 'mc', difficulty: 2,
    q: 'Emma earns $15 each week. She saves $5, spends $7 on lunch, and gives $3 to charity. How much does she have left?',
    choices: ['$0', '$5', '$3', '$2'], answer: '$0',
    explanation: '$5 + $7 + $3 = $15. She spends all of it. $15 − $15 = $0 left.' },

  // 3.9D — Saving and borrowing
  { id: 's057', cat: 'cat4', teks: '3.9D', type: 'mc', difficulty: 1,
    q: 'Why is it better to save money over time to buy a toy than to borrow money?',
    choices: [
      'You avoid owing money to someone else',
      'Saving takes too long',
      'Borrowing is always free',
      'There is no difference'
    ], answer: 'You avoid owing money to someone else',
    explanation: 'When you save, you use your own money and don\'t owe anyone. Borrowing means you have to pay back, often with extra (interest).' },

  // 3.9E — Charitable giving
  { id: 's058', cat: 'cat4', teks: '3.9E', type: 'mc', difficulty: 1,
    q: 'Which is an example of a charitable contribution?',
    choices: [
      'Donating canned food to a food bank',
      'Buying a toy for yourself',
      'Saving money in a piggy bank',
      'Trading cards with a friend'
    ], answer: 'Donating canned food to a food bank',
    explanation: 'Charitable giving means helping others without expecting anything in return.' },

  // More Category 2 questions for depth
  { id: 's059', cat: 'cat2', teks: '3.4F', type: 'mc', difficulty: 1,
    q: 'What is 9 × 9?',
    choices: ['72', '81', '90', '79'], answer: '81',
    explanation: '9 × 9 = 81.' },
  { id: 's060', cat: 'cat2', teks: '3.4F', type: 'mc', difficulty: 1,
    q: 'What is 56 ÷ 7?',
    choices: ['6', '7', '8', '9'], answer: '8',
    explanation: '56 ÷ 7 = 8.' },

  // 3.5D — Input-output tables
  { id: 's061', cat: 'cat2', teks: '3.5D', type: 'mc', difficulty: 2,
    q: 'Look at this table: Input → 2, 4, 6, 8. Output → 6, 8, 10, 12. What is the rule?',
    choices: ['Add 4', 'Multiply by 3', 'Add 2', 'Multiply by 2'], answer: 'Add 4',
    explanation: '2+4=6, 4+4=8, 6+4=10, 8+4=12. The rule is add 4.' },

  // 3.5E — Represent real-world relationships
  { id: 's062', cat: 'cat2', teks: '3.5E', type: 'mc', difficulty: 2,
    q: 'Each table at a restaurant seats 4 people. Which equation shows how to find the number of people (p) for 7 tables?',
    choices: ['p = 4 × 7', 'p = 4 + 7', 'p = 7 − 4', 'p = 7 ÷ 4'], answer: 'p = 4 × 7',
    explanation: '4 people per table × 7 tables = 4 × 7 = 28 people.' },

  // Additional challenging questions
  { id: 's063', cat: 'cat2', teks: '3.4I', type: 'mc', difficulty: 2,
    q: 'Which number makes both equations true? ___ × 5 = 35 and 35 ÷ ___ = 5',
    choices: ['5', '6', '7', '8'], answer: '7',
    explanation: '7 × 5 = 35 and 35 ÷ 7 = 5. The inverse relationship shows 7 is the answer.' },

  { id: 's064', cat: 'cat1', teks: '3.3C', type: 'mc', difficulty: 1,
    q: 'A shape is divided into 4 equal parts. 3 parts are shaded. Which statement is true?',
    choices: [
      '3/4 of the shape is shaded',
      '1/4 of the shape is shaded',
      '4/3 of the shape is shaded',
      '3/3 of the shape is shaded'
    ], answer: '3/4 of the shape is shaded',
    explanation: '3 out of 4 equal parts shaded = 3/4.' },

  { id: 's065', cat: 'cat1', teks: '3.3B', type: 'mc', difficulty: 2,
    q: 'On a number line from 0 to 1, where would 3/4 be located?',
    choices: [
      'Between 1/2 and 1',
      'Between 0 and 1/2',
      'At the 1 mark',
      'At the 1/2 mark'
    ], answer: 'Between 1/2 and 1',
    explanation: '3/4 = 0.75, which is between 1/2 (0.5) and 1.' },

  { id: 's066', cat: 'cat1', teks: '3.3G', type: 'mc', difficulty: 2,
    q: 'Two students each have a candy bar. One student cut theirs into 4 pieces and ate 2. The other cut theirs into 8 pieces and ate 4. Did they eat the same amount?',
    choices: [
      'Yes — 2/4 = 4/8',
      'No — the second ate more',
      'No — the first ate more',
      'Cannot tell'
    ], answer: 'Yes — 2/4 = 4/8',
    explanation: '2/4 and 4/8 are equivalent fractions (both equal 1/2). They ate the same amount.' },

  { id: 's067', cat: 'cat2', teks: '3.4E', type: 'mc', difficulty: 1,
    q: 'Which model shows 3 × 4?',
    choices: [
      '3 groups of 4 objects',
      '4 groups minus 3',
      '3 objects plus 4 objects',
      '4 groups divided by 3'
    ], answer: '3 groups of 4 objects',
    explanation: '3 × 4 means 3 groups of 4, which totals 12.' },

  { id: 's068', cat: 'cat2', teks: '3.4G', type: 'mc', difficulty: 2,
    q: 'An array has 4 rows and 7 columns. What multiplication fact does it represent?',
    choices: ['4 × 7 = 28', '4 + 7 = 11', '7 − 4 = 3', '7 ÷ 4 = ?'], answer: '4 × 7 = 28',
    explanation: 'An array with 4 rows and 7 columns represents 4 × 7 = 28.' },

  { id: 's069', cat: 'cat2', teks: '3.4B', type: 'mc', difficulty: 1,
    q: 'Use mental math: What is 300 + 500?',
    choices: ['700', '800', '900', '200'], answer: '800',
    explanation: '3 hundreds + 5 hundreds = 8 hundreds = 800.' },

  { id: 's070', cat: 'cat2', teks: '3.4J', type: 'mc', difficulty: 2,
    q: 'If 6 × ? = 54, what is the value of ?',
    choices: ['8', '9', '7', '6'], answer: '9',
    explanation: '6 × 9 = 54.' },
];

export const STAAR_TEST_CONFIG = {
  grade3: {
    totalQuestions: 36,
    timeMinutes: 240,
    passingScore: 0.55,
    approachingScore: 0.40,
    masteringScore: 0.75,
    categoryDistribution: { cat1: 7, cat2: 15, cat3: 7, cat4: 7 },
  },
};
