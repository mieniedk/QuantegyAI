/**
 * Mini-Lectures – Short, student-friendly lessons for each TEKS standard.
 *
 * Each lecture has:
 *   teks        – TEKS code (matches standard.code / TEKS_STANDARDS id)
 *   title       – Short title
 *   objective   – One-sentence "You will learn..."
 *   keyIdea     – The core concept in plain language
 *   steps       – Array of { title, content } teaching steps
 *   example     – { problem, solution: [step strings], answer }
 *   tip         – A student-friendly "remember this" tip
 *   visual      – Optional visual type hint: 'number-line', 'place-value', 'grid', 'fraction-bar', 'clock', 'chalkboard'
 *   video       – Optional short video URL: YouTube embed (e.g. https://www.youtube.com/embed/VIDEO_ID) or direct .mp4 URL; shown at the start of the lesson
 */

const LECTURES = {
  // ═══════════════════════════════════════════════════════════
  // NUMBER & OPERATIONS
  // ═══════════════════════════════════════════════════════════
  '3.2A': {
    teks: '3.2A',
    title: 'Expanded Form & Place Value',
    video: 'https://www.youtube.com/embed/jxA8MffVmPs', // Khan Academy: place value; replace with your own if needed
    objective: 'You will learn how to break a number into the value of each digit.',
    keyIdea: 'Every digit in a number has a value based on its position. The 5 in 5,063 is worth 5,000 because it\'s in the thousands place.',
    steps: [
      { title: 'Find the place', content: 'Start from the RIGHT. The first digit is ones, then tens, then hundreds, then thousands.' },
      { title: 'Multiply each digit', content: 'Multiply each digit by its place value: ones × 1, tens × 10, hundreds × 100, thousands × 1,000.' },
      { title: 'Write it out', content: 'Expanded form shows each part added together, skipping any zeros.' },
    ],
    example: {
      problem: 'Write 4,307 in expanded form.',
      solution: [
        '4 is in the thousands place → 4 × 1,000 = 4,000',
        '3 is in the hundreds place → 3 × 100 = 300',
        '0 is in the tens place → 0 × 10 = 0 (skip it!)',
        '7 is in the ones place → 7 × 1 = 7',
      ],
      answer: '4,000 + 300 + 7',
    },
    tip: 'If a digit is 0, you skip it in expanded form — there\'s nothing to add!',
    visual: 'place-value',
  },

  '3.2B': {
    teks: '3.2B',
    title: 'Place Value Relationships',
    video: 'https://www.youtube.com/embed/jxA8MffVmPs', // Khan Academy: place value
    objective: 'You will learn how each place is 10 times the one to its right.',
    keyIdea: 'In our number system, each place is 10 times bigger than the place to its right. 1 hundred = 10 tens. 1 thousand = 10 hundreds.',
    steps: [
      { title: 'The ×10 rule', content: 'Moving one place LEFT multiplies the value by 10. Moving one place RIGHT divides by 10.' },
      { title: 'Example chain', content: '1 → 10 → 100 → 1,000 → 10,000. Each step is ×10.' },
      { title: 'Digit value', content: 'The digit 6 in the tens place is worth 60. In the hundreds place, it\'s worth 600 — that\'s 10 times more!' },
    ],
    example: {
      problem: 'The digit 4 appears in 4,482. What is the value of each 4?',
      solution: [
        'The first 4 is in the thousands place → 4 × 1,000 = 4,000',
        'The second 4 is in the hundreds place → 4 × 100 = 400',
        '4,000 is 10 times more than 400',
      ],
      answer: '4,000 and 400. The thousands-place 4 is 10× the hundreds-place 4.',
    },
    tip: 'Think of places as a ×10 staircase — every step up is 10 times bigger!',
    visual: 'place-value',
  },

  '3.2C': {
    teks: '3.2C',
    title: 'Rounding to the Nearest Hundred',
    video: 'https://www.youtube.com/embed/lR_kUUPL8YY', // Khan Academy: place value / decimals
    objective: 'You will learn the trick to round any number to the nearest hundred.',
    keyIdea: 'To round to the nearest hundred, look at the TENS digit. If it\'s 5 or more, round up. If it\'s less than 5, round down.',
    steps: [
      { title: 'Find the two hundreds', content: 'Figure out which two hundreds your number is between. For 720, it\'s between 700 and 800.' },
      { title: 'Check the tens digit', content: 'Look at the digit in the tens place. This is your "decider" digit.' },
      { title: 'Apply the rule', content: 'If the tens digit is 0, 1, 2, 3, or 4 → round DOWN. If it\'s 5, 6, 7, 8, or 9 → round UP.' },
    ],
    example: {
      problem: 'Round 720 to the nearest hundred.',
      solution: [
        '720 is between 700 and 800.',
        'The tens digit is 2.',
        '2 < 5, so we round DOWN.',
      ],
      answer: '700',
    },
    tip: '"5 or more, let it soar! 4 or less, let it rest!" — that\'s the rounding rhyme!',
    visual: 'number-line',
  },

  // ═══════════════════════════════════════════════════════════
  // FRACTIONS
  // ═══════════════════════════════════════════════════════════
  '3.3C': {
    teks: '3.3C',
    title: 'Unit Fractions — One Part of a Whole',
    video: 'https://www.youtube.com/embed/3XOt1fjWKi8', // Khan Academy: numerator and denominator / fractions
    objective: 'You will learn what a unit fraction is and how to identify one.',
    keyIdea: 'A unit fraction is a fraction where the top number (numerator) is always 1. It means "one equal part" of a whole.',
    steps: [
      { title: 'Divide the whole into equal parts', content: 'Take a shape (like a pizza or a rectangle) and cut it into equal-sized pieces. The number of pieces becomes the denominator (bottom number).' },
      { title: 'Take ONE piece', content: 'A unit fraction represents just one of those equal pieces. The numerator is always 1.' },
      { title: 'Write it as 1/b', content: 'If the whole is divided into b equal parts, one part is written as 1/b. For example, if a pizza has 4 slices, one slice is 1/4.' },
    ],
    example: {
      problem: 'A sandwich is cut into 6 equal pieces. What fraction is ONE piece?',
      solution: [
        'The whole sandwich is cut into 6 equal parts, so the denominator is 6.',
        'We are looking at ONE piece, so the numerator is 1.',
        'One piece = 1/6.',
      ],
      answer: 'The fraction for one piece is 1/6.',
    },
    tip: 'If you see "one part" or "one slice," the answer is always 1 over the total number of parts!',
    visual: 'fraction-bar',
  },
  '3.3H': {
    teks: '3.3H',
    title: 'Comparing Fractions (Same Denominator)',
    video: 'https://www.youtube.com/embed/3XOt1fjWKi8',
    objective: 'You will learn how to compare fractions when the bottom numbers are the same.',
    keyIdea: 'When two fractions have the same denominator (bottom number), just compare the numerators (top numbers). More pieces = bigger fraction!',
    steps: [
      { title: 'Check the denominators', content: 'Are the bottom numbers the same? If yes, each piece is the same size.' },
      { title: 'Compare the numerators', content: 'The fraction with the bigger top number has more pieces, so it\'s the bigger fraction.' },
      { title: 'Write the answer', content: 'Use < (less than), > (greater than), or = (equal) to show which is bigger.' },
    ],
    example: {
      problem: 'Which is greater: 3/8 or 5/8?',
      solution: [
        'Both fractions have denominator 8 — same size pieces (eighths).',
        'Compare numerators: 3 vs 5.',
        '5 > 3, so 5/8 > 3/8.',
      ],
      answer: '5/8 is greater. Think: 5 pizza slices vs. 3 slices of the same size!',
    },
    tip: 'Same bottom number? Just look at the top! Bigger top = bigger fraction.',
    visual: 'fraction-bar',
  },

  // ═══════════════════════════════════════════════════════════
  // COMPUTATION & PROBLEM SOLVING
  // ═══════════════════════════════════════════════════════════
  '3.4A': {
    teks: '3.4A',
    title: 'Addition & Subtraction Within 1,000',
    video: 'https://www.youtube.com/embed/jxA8MffVmPs',
    objective: 'You will learn to add and subtract 3-digit numbers using place value.',
    keyIdea: 'Line up the digits by place value (ones under ones, tens under tens). Work from RIGHT to LEFT, regrouping when needed.',
    steps: [
      { title: 'Line up the numbers', content: 'Write the numbers vertically with ones, tens, and hundreds lined up.' },
      { title: 'Start with the ones', content: 'Add or subtract the ones column first. If the sum is 10+, regroup 1 to the tens.' },
      { title: 'Move left', content: 'Do the same for tens, then hundreds. For subtraction, regroup (trade) if the top digit is smaller.' },
    ],
    example: {
      problem: '347 + 285 = ?',
      solution: [
        'Ones: 7 + 5 = 12. Write 2, regroup 1.',
        'Tens: 4 + 8 = 12, plus 1 regrouped = 13. Write 3, regroup 1.',
        'Hundreds: 3 + 2 = 5, plus 1 regrouped = 6.',
      ],
      answer: '632',
    },
    tip: 'Always start from the ones (right side) and work your way left!',
    visual: 'chalkboard',
  },

  '3.4B': {
    teks: '3.4B',
    title: 'Rounding to Estimate',
    video: 'https://www.youtube.com/embed/lR_kUUPL8YY',
    objective: 'You will learn to round numbers first, then add or subtract to get a quick estimate.',
    keyIdea: 'Estimation helps you check if your answer makes sense. Round each number, then compute.',
    steps: [
      { title: 'Round each number', content: 'Round to the nearest 10 or 100 (whichever the problem asks).' },
      { title: 'Compute with rounded numbers', content: 'Add or subtract the rounded numbers — this is much easier!' },
      { title: 'Check your estimate', content: 'Your estimate should be close to the exact answer. If not, recheck!' },
    ],
    example: {
      problem: 'Estimate 489 + 312 by rounding to the nearest hundred.',
      solution: [
        '489 rounds to 500 (tens digit 8 ≥ 5 → round up).',
        '312 rounds to 300 (tens digit 1 < 5 → round down).',
        '500 + 300 = 800.',
      ],
      answer: '≈ 800 (the exact answer is 801, so our estimate is great!)',
    },
    tip: 'Estimation is like a quick guess that\'s close enough to check your math!',
  },

  '3.4C': {
    teks: '3.4C',
    title: 'Counting Coins',
    video: 'https://www.youtube.com/embed/jxA8MffVmPs',
    objective: 'You will learn the value of each coin and how to count a collection.',
    keyIdea: 'Quarter = 25¢, Dime = 10¢, Nickel = 5¢, Penny = 1¢. Count from largest to smallest!',
    steps: [
      { title: 'Sort by value', content: 'Group quarters first, then dimes, nickels, and pennies.' },
      { title: 'Count by groups', content: 'Count quarters by 25s, dimes by 10s, nickels by 5s, pennies by 1s.' },
      { title: 'Add it all up', content: 'Total = quarters amount + dimes amount + nickels amount + pennies amount.' },
    ],
    example: {
      problem: '2 quarters, 3 dimes, 1 nickel, 4 pennies. How much money?',
      solution: [
        'Quarters: 2 × 25¢ = 50¢',
        'Dimes: 3 × 10¢ = 30¢',
        'Nickel: 1 × 5¢ = 5¢',
        'Pennies: 4 × 1¢ = 4¢',
      ],
      answer: '50 + 30 + 5 + 4 = 89¢',
    },
    tip: 'Always start counting with the biggest coins first!',
  },

  '3.4F': {
    teks: '3.4F',
    title: 'Multiplication Facts (up to 10 × 10)',
    video: 'https://www.youtube.com/embed/jxA8MffVmPs',
    objective: 'You will learn your multiplication facts and tricks to remember them.',
    keyIdea: 'Multiplication is repeated addition. 4 × 6 means "4 groups of 6" or 6 + 6 + 6 + 6.',
    steps: [
      { title: 'Understand groups', content: '3 × 5 = 3 groups of 5 = 5 + 5 + 5 = 15.' },
      { title: 'Use skip counting', content: 'For ×3, count by 3s: 3, 6, 9, 12, 15... The 5th number is 5 × 3 = 15.' },
      { title: 'Know your tricks', content: '×1 = itself, ×2 = double, ×5 = ends in 0 or 5, ×10 = add a zero.' },
    ],
    example: {
      problem: '7 × 8 = ?',
      solution: [
        '7 × 8 means "7 groups of 8."',
        'Trick: 5 × 8 = 40 and 2 × 8 = 16.',
        '40 + 16 = 56.',
      ],
      answer: '56',
    },
    tip: '7 × 8 = 56 — Think: "5, 6, 7, 8" → 56 = 7 × 8! The digits go in order!',
  },

  '3.4G': {
    teks: '3.4G',
    title: 'Two-Digit × One-Digit Multiplication',
    video: 'https://www.youtube.com/embed/jxA8MffVmPs',
    objective: 'You will learn to multiply a two-digit number by a one-digit number.',
    keyIdea: 'Break the two-digit number into tens and ones, multiply each part, then add the results together.',
    steps: [
      { title: 'Break apart', content: 'Split the two-digit number: 23 = 20 + 3.' },
      { title: 'Multiply each part', content: 'Multiply the tens part and the ones part separately by the one-digit number.' },
      { title: 'Add the parts', content: 'Add the two products together to get the final answer.' },
    ],
    example: {
      problem: '23 × 4 = ?',
      solution: [
        'Break apart: 23 = 20 + 3.',
        'Multiply tens: 20 × 4 = 80.',
        'Multiply ones: 3 × 4 = 12.',
        'Add: 80 + 12 = 92.',
      ],
      answer: '92',
    },
    tip: 'This is called the "distributive property" — a fancy name for breaking apart!',
  },

  '3.4H': {
    teks: '3.4H',
    title: 'Division Word Problems',
    video: 'https://www.youtube.com/embed/jxA8MffVmPs',
    objective: 'You will learn to solve sharing and grouping problems using division.',
    keyIdea: 'Division answers "how many in each group?" or "how many groups?" Think of it as the reverse of multiplication.',
    steps: [
      { title: 'Read carefully', content: 'Is the problem about sharing equally or making equal groups?' },
      { title: 'Set up division', content: 'Total ÷ number of groups = items per group. Or: Total ÷ items per group = number of groups.' },
      { title: 'Think multiplication', content: 'Ask: "What times the divisor gives me the dividend?"' },
    ],
    example: {
      problem: '24 stickers shared equally among 6 friends. How many does each friend get?',
      solution: [
        'This is equal sharing: 24 ÷ 6 = ?',
        'Think: ? × 6 = 24.',
        '4 × 6 = 24 ✓',
      ],
      answer: '4 stickers each',
    },
    tip: 'Division and multiplication are opposites — knowing one helps you solve the other!',
  },

  '3.4I': {
    teks: '3.4I',
    title: 'Even & Odd Numbers',
    video: 'https://www.youtube.com/embed/jxA8MffVmPs',
    objective: 'You will learn to tell whether a number is even or odd.',
    keyIdea: 'Even numbers can be split into two equal groups with nothing left over. Odd numbers always have 1 left over.',
    steps: [
      { title: 'Look at the last digit', content: 'Only check the ONES digit (the last digit of the number).' },
      { title: 'Even digits', content: 'If the last digit is 0, 2, 4, 6, or 8 → the number is EVEN.' },
      { title: 'Odd digits', content: 'If the last digit is 1, 3, 5, 7, or 9 → the number is ODD.' },
    ],
    example: {
      problem: 'Is 3,746 even or odd?',
      solution: [
        'Look at the last digit: 6.',
        '6 is in the set {0, 2, 4, 6, 8}.',
        'So 3,746 is EVEN.',
      ],
      answer: 'Even (because 6 is an even digit)',
    },
    tip: 'You only need the LAST digit. Even a number with a million digits — just check the last one!',
  },

  '3.4K': {
    teks: '3.4K',
    title: 'Division Facts (Within 100)',
    video: 'https://www.youtube.com/embed/jxA8MffVmPs',
    objective: 'You will learn to divide by thinking about multiplication facts.',
    keyIdea: 'Division is the opposite of multiplication. If 6 × 7 = 42, then 42 ÷ 6 = 7 and 42 ÷ 7 = 6.',
    steps: [
      { title: 'Think multiplication', content: 'For 56 ÷ 8, ask yourself: "What times 8 equals 56?"' },
      { title: 'Use fact families', content: '7 × 8 = 56, so 56 ÷ 8 = 7 and 56 ÷ 7 = 8.' },
      { title: 'Check your work', content: 'Multiply your answer by the divisor. If you get the dividend, you\'re right!' },
    ],
    example: {
      problem: '72 ÷ 9 = ?',
      solution: [
        'Think: ? × 9 = 72.',
        '8 × 9 = 72 ✓',
      ],
      answer: '8',
    },
    tip: 'Every division fact has a matching multiplication fact — they\'re a family!',
  },

  // ═══════════════════════════════════════════════════════════
  // ALGEBRAIC REASONING
  // ═══════════════════════════════════════════════════════════
  '3.5A': {
    teks: '3.5A',
    title: 'Writing Equations for Word Problems',
    video: 'https://www.youtube.com/embed/CLWpkv6ccpA',
    objective: 'You will learn to turn a word problem into a math equation.',
    keyIdea: 'Read the problem, find the numbers, figure out the operation (add, subtract, multiply, divide), and write an equation.',
    steps: [
      { title: 'Read & highlight', content: 'Find the numbers and key words: "total" → add, "left" → subtract, "each" → divide, "groups of" → multiply.' },
      { title: 'Write the equation', content: 'Use a variable (like ? or □) for the unknown. Example: 45 + □ = 78.' },
      { title: 'Solve', content: 'Use inverse operations to find the unknown.' },
    ],
    example: {
      problem: 'Maria had some stickers. She got 23 more and now has 61. How many did she start with?',
      solution: [
        'Let □ = stickers Maria started with.',
        'Equation: □ + 23 = 61.',
        'Solve: □ = 61 − 23 = 38.',
      ],
      answer: '38 stickers',
    },
    tip: 'Key words help: "in all" or "total" = add. "How many more" or "left" = subtract.',
  },

  '3.5B': {
    teks: '3.5B',
    title: 'Multiplication Word Problems',
    video: 'https://www.youtube.com/embed/jxA8MffVmPs',
    objective: 'You will learn to spot and solve multiplication in word problems.',
    keyIdea: 'When you see "equal groups" in a problem, think multiplication! Number of groups × items in each group = total.',
    steps: [
      { title: 'Find the groups', content: 'Look for "rows," "bags," "teams," "packs" — anything that holds equal amounts.' },
      { title: 'Write the equation', content: 'groups × items per group = total.' },
      { title: 'Solve', content: 'Multiply to find the total, or divide to find a missing group size.' },
    ],
    example: {
      problem: 'There are 5 baskets with 8 apples each. How many apples in all?',
      solution: [
        '5 baskets = 5 groups.',
        '8 apples in each = 8 per group.',
        '5 × 8 = 40.',
      ],
      answer: '40 apples',
    },
    tip: '"Each," "every," "per" — these words almost always mean multiply!',
  },

  '3.5D': {
    teks: '3.5D',
    title: 'Missing Factors',
    video: 'https://www.youtube.com/embed/CLWpkv6ccpA',
    objective: 'You will learn to find the missing number in a multiplication or division equation.',
    keyIdea: 'If you know two of the three numbers in a fact family, you can find the third! Use the inverse operation.',
    steps: [
      { title: 'Identify what\'s missing', content: 'Is it the product, a factor, or the quotient?' },
      { title: 'Use inverse operations', content: 'Missing factor → divide. Missing product → multiply. Missing dividend → multiply.' },
      { title: 'Check with fact families', content: 'If ___ × 6 = 42, then 42 ÷ 6 = 7. The missing factor is 7.' },
    ],
    example: {
      problem: '___ × 9 = 63',
      solution: [
        'We need: what times 9 equals 63?',
        'Use division: 63 ÷ 9 = ?',
        '7 × 9 = 63 ✓',
      ],
      answer: '7',
    },
    tip: 'Cover the missing number and use the other operation to find it!',
  },

  '3.5E': {
    teks: '3.5E',
    title: 'Number Patterns',
    video: 'https://www.youtube.com/embed/CLWpkv6ccpA',
    objective: 'You will learn to find the rule in a pattern and extend it.',
    keyIdea: 'A pattern follows a rule. Find what changes each time (add 3? multiply by 2? subtract 5?) and keep going!',
    steps: [
      { title: 'Look at differences', content: 'Subtract each number from the next: 2, 5, 8, 11... → each goes up by 3.' },
      { title: 'Name the rule', content: 'The rule is: "Add 3 each time" or "Start at 2, +3."' },
      { title: 'Extend the pattern', content: 'Apply the rule to find the next numbers: 11 + 3 = 14, 14 + 3 = 17...' },
    ],
    example: {
      problem: 'What comes next? 4, 9, 14, 19, ___',
      solution: [
        'Differences: 9 − 4 = 5, 14 − 9 = 5, 19 − 14 = 5.',
        'Rule: add 5 each time.',
        'Next: 19 + 5 = 24.',
      ],
      answer: '24',
    },
    tip: 'Always check at least 2-3 differences to make sure the rule is consistent!',
  },

  // ═══════════════════════════════════════════════════════════
  // GEOMETRY & MEASUREMENT
  // ═══════════════════════════════════════════════════════════
  '3.6C': {
    teks: '3.6C',
    title: 'Area of Rectangles',
    video: 'https://www.youtube.com/embed/jxA8MffVmPs',
    objective: 'You will learn to find the area of a rectangle by multiplying length × width.',
    keyIdea: 'Area is the space INSIDE a shape, measured in square units. For rectangles: Area = length × width.',
    steps: [
      { title: 'Find length & width', content: 'Length is the longer side. Width is the shorter side.' },
      { title: 'Multiply', content: 'Area = length × width. The answer is in "square units" (sq cm, sq ft, etc.).' },
      { title: 'Don\'t confuse with perimeter!', content: 'Perimeter = distance AROUND. Area = space INSIDE.' },
    ],
    example: {
      problem: 'A garden is 7 meters long and 4 meters wide. What is the area?',
      solution: [
        'Length = 7 m, Width = 4 m.',
        'Area = 7 × 4 = 28.',
      ],
      answer: '28 square meters (28 m²)',
    },
    tip: 'Area = "how many unit squares fit inside." Perimeter = "how far to walk around."',
    visual: 'grid',
  },

  '3.7B': {
    teks: '3.7B',
    title: 'Perimeter of Polygons',
    video: 'https://www.youtube.com/embed/jxA8MffVmPs',
    objective: 'You will learn to find the perimeter by adding all the sides.',
    keyIdea: 'Perimeter is the total distance around the outside of a shape. Just add up ALL the side lengths!',
    steps: [
      { title: 'Count all the sides', content: 'A rectangle has 4 sides. A triangle has 3. A pentagon has 5.' },
      { title: 'Add them up', content: 'Perimeter = side 1 + side 2 + side 3 + ... Add every side!' },
      { title: 'Rectangle shortcut', content: 'For rectangles: P = 2 × (length + width). This saves time!' },
    ],
    example: {
      problem: 'A rectangle is 9 cm long and 5 cm wide. What is the perimeter?',
      solution: [
        'Add all sides: 9 + 5 + 9 + 5.',
        'Or use the shortcut: P = 2 × (9 + 5) = 2 × 14 = 28.',
      ],
      answer: '28 cm',
    },
    tip: 'Imagine an ant walking around the ENTIRE edge — perimeter is how far the ant walks!',
  },

  '3.7C': {
    teks: '3.7C',
    title: 'Elapsed Time',
    video: 'https://www.youtube.com/embed/lR_kUUPL8YY',
    objective: 'You will learn to figure out how much time passes between a start and end time.',
    keyIdea: 'Elapsed time = End time − Start time. Count the hours first, then the leftover minutes.',
    steps: [
      { title: 'Count the full hours', content: 'From 2:00 to 5:00 is 3 hours. Count hour by hour.' },
      { title: 'Count the extra minutes', content: 'From 2:15 to 2:00 is... wait, go forward! 2:15 to 3:15 = 1 hour.' },
      { title: 'Add hours + minutes', content: 'Put the hours and minutes together. Convert if minutes ≥ 60.' },
    ],
    example: {
      problem: 'A movie starts at 4:15 PM and ends at 6:00 PM. How long is it?',
      solution: [
        'From 4:15 to 5:15 = 1 hour.',
        'From 5:15 to 6:00 = 45 minutes.',
        'Total: 1 hour and 45 minutes.',
      ],
      answer: '1 hour 45 minutes',
    },
    tip: 'Break it into chunks: count to the next full hour first, then add the remaining minutes!',
    visual: 'clock',
  },

  // ═══════════════════════════════════════════════════════════
  // GRADE 7 & 8 (Math 7-12)
  // ═══════════════════════════════════════════════════════════
  '7.3A': {
    teks: '7.3A',
    title: 'Operations with Rational Numbers',
    video: 'https://www.youtube.com/embed/CLWpkv6ccpA', // Khan Academy: algebra
    objective: 'You will learn to add, subtract, multiply, and divide rational numbers fluently.',
    keyIdea: 'Rational numbers include integers and fractions. Same sign → add and keep; different signs → subtract and take the sign of the larger absolute value.',
    steps: [
      { title: 'Adding & subtracting', content: 'Same sign: add the absolute values and keep the sign. Different signs: subtract and use the sign of the number with the larger absolute value.' },
      { title: 'Multiplying & dividing', content: 'Same sign → positive result. Different signs → negative result. Then multiply or divide the absolute values.' },
    ],
    example: { problem: '(-3) + (-5) = ?', solution: ['Same sign (both negative). Add: 3 + 5 = 8.', 'Keep the sign: -8.'], answer: '-8' },
    tip: 'Think of negative as "opposite direction" on a number line.',
    visual: 'number-line',
  },
  '7.4A': {
    teks: '7.4A',
    title: 'Constant Rate of Change',
    video: 'https://www.youtube.com/embed/CLWpkv6ccpA', // Khan Academy: algebra
    objective: 'You will learn to represent constant rates of change (e.g. d = rt).',
    keyIdea: 'Rate of change is how much one quantity changes when another changes. Constant rate means the ratio stays the same (e.g. speed).',
    steps: [
      { title: 'Rate = amount per one unit', content: 'Miles per hour, dollars per pound. Rate = total amount ÷ number of units.' },
      { title: 'd = rt', content: 'Distance = rate × time. If you travel 60 mph for 2 hours, distance = 60 × 2 = 120 miles.' },
    ],
    example: { problem: 'A car goes 240 miles in 4 hours. What is the rate?', solution: ['d = rt, so r = d \u00F7 t', 'r = 240 \u00F7 4 = 60 miles per hour'], answer: '60 mph' },
    tip: 'Unit rate is "per 1" — divide to get the rate for one unit.',
    visual: 'chalkboard',
  },
  '7.4D': {
    teks: '7.4D',
    title: 'Ratios, Rates, and Percents',
    video: 'https://www.youtube.com/embed/CLWpkv6ccpA', // Khan Academy: algebra
    objective: 'You will solve problems involving ratios, rates, and percents (including percent increase and decrease).',
    keyIdea: 'Percent means "per hundred." To find percent of a number: convert % to a decimal and multiply. For increase or decrease: find the amount of change, then the new value.',
    steps: [
      { title: 'Percent of a number', content: 'Convert % to decimal (÷ 100). Multiply by the number. Example: 20% of 80 = 0.20 × 80 = 16.' },
      { title: 'Percent change', content: 'Percent increase: new = original × (1 + rate). Percent decrease: new = original × (1 − rate).' },
    ],
    example: { problem: 'A $50 shirt is 20% off. Sale price?', solution: ['20% off = pay 80%.', '0.80 × 50 = 40.'], answer: '$40' },
    tip: ' "Of" usually means multiply; "percent off" means multiply by (100 − percent)% as a decimal.',
    visual: 'chalkboard',
  },
  '8.4B': {
    teks: '8.4B',
    title: 'Slope and Unit Rate',
    video: 'https://www.youtube.com/embed/CLWpkv6ccpA', // Khan Academy: algebra
    objective: 'You will graph proportional relationships and interpret unit rate as slope.',
    keyIdea: 'In y = kx, the constant k is the unit rate and the slope of the line. Slope = rise over run = (y\u2082 \u2212 y\u2081) divided by (x\u2082 \u2212 x\u2081).',
    steps: [
      { title: 'Proportional → line through origin', content: 'When y = kx, the graph is a straight line through (0, 0). The slope is k.' },
      { title: 'Unit rate = slope', content: 'The steepness of the line (rise over run) is the unit rate: how much y changes when x increases by 1.' },
    ],
    example: { problem: 'y = 3x. What is the slope? Graph passes through (1, 3).', solution: ['Slope = coefficient of x = 3.', 'Unit rate: for every 1 unit of x, y increases by 3.'], answer: 'Slope = 3' },
    tip: 'Slope = vertical change ÷ horizontal change. Positive slope goes up left to right.',
    visual: 'chalkboard',
  },
  '8.5I': {
    teks: '8.5I',
    title: 'Linear Equations y = mx + b',
    video: 'https://www.youtube.com/embed/CLWpkv6ccpA', // Khan Academy: algebra
    objective: 'You will write equations in the form y = mx + b from verbal, table, and graphical representations.',
    keyIdea: 'y = mx + b: m is the slope (rate of change), b is the y-intercept (value when x = 0).',
    steps: [
      { title: 'Find the slope m', content: 'From two points: m = (y₂ − y₁)/(x₂ − x₁). From a table: m = change in y ÷ change in x.' },
      { title: 'Find the y-intercept b', content: 'Where the line crosses the y-axis (x = 0). Or substitute one point and m into y = mx + b and solve for b.' },
    ],
    example: { problem: 'Line through (0, 2) and (2, 6). Write y = mx + b.', solution: ['b = 2 (y when x = 0).', 'm = (6−2)/(2−0) = 2.', 'y = 2x + 2'], answer: 'y = 2x + 2' },
    tip: 'Start with b from the graph (y-axis crossing), then use two points to get m.',
    visual: 'chalkboard',
  },

  // ═══════════════════════════════════════════════════════════
  // ALGEBRA I (Math 7-12)
  // ═══════════════════════════════════════════════════════════
  'A.2A': {
    teks: 'A.2A',
    title: 'Domain and Range of Linear Functions',
    video: 'https://www.youtube.com/embed/CLWpkv6ccpA', // Khan Academy: algebra
    objective: 'You will determine the domain and range of linear functions.',
    keyIdea: 'Domain = all allowed x-values\nRange = all resulting y-values\nFor a linear function (no restrictions), domain and range are usually all real numbers.',
    steps: [
      { title: 'Domain', content: 'The set of inputs (x). For most linear functions, domain is all real numbers unless context limits it (e.g. non‑negative).' },
      { title: 'Range', content: 'The set of outputs (y). For y = mx + b with m ≠ 0, range is all real numbers.' },
    ],
    example: { problem: 'For f(x) = 2x + 1, domain and range?', solution: ['No restrictions on x → domain: all real numbers.', 'As x runs over reals, 2x+1 runs over all reals → range: all real numbers.'], answer: 'Both: all real numbers' },
    tip: 'Linear (non-constant) functions usually have domain and range = all real numbers.',
    visual: 'chalkboard',
  },
  'A.2B': {
    teks: 'A.2B',
    title: 'Linear Equations in Multiple Forms',
    video: 'https://www.youtube.com/embed/CLWpkv6ccpA', // Khan Academy: algebra
    objective: 'You will write linear equations in slope-intercept, point-slope, and standard form.',
    keyIdea: 'Slope-intercept: y = mx + b. Point-slope: y − y₁ = m(x − x₁). Standard: Ax + By = C. You can convert between them.',
    steps: [
      { title: 'Slope-intercept y = mx + b', content: 'Best for graphing. m = slope, b = y-intercept.' },
      { title: 'Point-slope', content: 'Use when you know one point (x₁, y₁) and slope m: y − y₁ = m(x − x₁).' },
      { title: 'Standard form', content: 'Ax + By = C. Useful for integer coefficients and finding intercepts.' },
    ],
    example: { problem: 'Line through (1, 3) with slope 2. Point-slope form?', solution: ['y − y₁ = m(x − x₁).', 'y − 3 = 2(x − 1).'], answer: 'y − 3 = 2(x − 1)' },
    tip: 'From point-slope, distribute and simplify to get slope-intercept.',
    visual: 'chalkboard',
  },
  'A.5A': {
    teks: 'A.5A',
    title: 'Solving Linear Equations',
    video: 'https://www.youtube.com/embed/CLWpkv6ccpA', // Khan Academy: solving equations
    objective: 'You will solve linear equations in one variable (including distributive property and variables on both sides).',
    keyIdea: 'Do the same operation to both sides to isolate the variable. Simplify first: distribute, combine like terms, then add or subtract and multiply or divide.',
    steps: [
      { title: 'Simplify each side', content: 'Distribute, combine like terms. Get the equation to the form ax + b = cx + d.' },
      { title: 'Get variables on one side', content: 'Add or subtract so all x terms are on one side, numbers on the other.' },
      { title: 'Solve', content: 'Add or subtract to isolate the x term, then multiply or divide to get x = number.' },
    ],
    example: { problem: 'Solve 2(x + 3) = 10.', solution: ['2x + 6 = 10', '2x = 4', 'x = 2'], answer: 'x = 2' },
    tip: 'Whatever you do to one side, do to the other. Goal: x = ___.',
    visual: 'chalkboard',
  },

  // ═══════════════════════════════════════════════════════════
  // PROBABILITY & STATISTICS
  // ═══════════════════════════════════════════════════════════
  'PROB.1': {
    teks: 'PROB.1',
    title: 'Probability Fundamentals',
    objective: 'You will learn how to calculate basic probabilities and apply the addition and multiplication rules.',
    keyIdea: 'Probability = favorable outcomes \u00F7 total outcomes. Values range from 0 (impossible) to 1 (certain). The complement of event A is P(not A) = 1 \u2212 P(A).',
    steps: [
      { title: 'Sample space', content: 'List every possible outcome. For a coin: {H, T}. For a die: {1, 2, 3, 4, 5, 6}. The total count is the denominator.' },
      { title: 'Favorable outcomes', content: 'Count the outcomes that match the event. P(even on a die) = 3 favorable \u00F7 6 total = \u00BD.' },
      { title: 'Addition rule', content: 'For mutually exclusive events: P(A or B) = P(A) + P(B). If not mutually exclusive, subtract the overlap: P(A) + P(B) \u2212 P(A and B).' },
      { title: 'Multiplication rule', content: 'For independent events: P(A and B) = P(A) \u00D7 P(B). Example: P(two heads in a row) = \u00BD \u00D7 \u00BD = \u00BC.' },
    ],
    example: {
      problem: 'A bag has 3 red and 5 blue marbles. What is P(red)?',
      solution: [
        'Total marbles = 3 + 5 = 8.',
        'Favorable (red) = 3.',
        'P(red) = 3 \u00F7 8 = 0.375 (or \u215C).',
      ],
      answer: '\u215C (0.375)',
    },
    tip: 'Always start by counting the total outcomes \u2014 that\u2019s your denominator!',
    visual: 'chalkboard',
  },
  'PROB.2': {
    teks: 'PROB.2',
    title: 'Descriptive Statistics',
    objective: 'You will learn how to summarize data using measures of center and spread.',
    keyIdea: 'Mean = sum \u00F7 count. Median = middle value when sorted. Mode = most frequent. Range = max \u2212 min. Standard deviation measures how spread out the data is.',
    steps: [
      { title: 'Mean (average)', content: 'Add all values, then divide by how many there are. Mean of {4, 7, 9} = (4 + 7 + 9) \u00F7 3 = 20 \u00F7 3 \u2248 6.67.' },
      { title: 'Median', content: 'Sort the data. If odd count, pick the middle. If even, average the two middle values.' },
      { title: 'Spread: range & IQR', content: 'Range = max \u2212 min. IQR = Q3 \u2212 Q1 (middle 50% of the data). IQR resists outliers better than range.' },
      { title: 'Standard deviation', content: 'Find each value\u2019s distance from the mean, square those distances, average them, then take the square root. A larger SD means data is more spread out.' },
    ],
    example: {
      problem: 'Find the mean and median of: 3, 7, 7, 9, 12.',
      solution: [
        'Mean = (3 + 7 + 7 + 9 + 12) \u00F7 5 = 38 \u00F7 5 = 7.6.',
        'Sorted data: 3, 7, 7, 9, 12.',
        'Middle value (3rd of 5) = 7 \u2192 median = 7.',
      ],
      answer: 'Mean = 7.6, Median = 7',
    },
    tip: 'Mean is sensitive to outliers; median is resistant. Choose wisely when describing \u201Ctypical.\u201D',
    visual: 'chalkboard',
  },
  'PROB.3': {
    teks: 'PROB.3',
    title: 'Counting Principles & Combinations',
    objective: 'You will learn how to count arrangements and selections using permutations and combinations.',
    keyIdea: 'Fundamental Counting Principle: if task A has m ways and task B has n ways, there are m \u00D7 n total ways. Permutations = order matters. Combinations = order doesn\u2019t matter.',
    steps: [
      { title: 'Counting Principle', content: 'Multiply the number of choices at each stage. 3 shirts \u00D7 4 pants = 12 outfits.' },
      { title: 'Permutations', content: 'When ORDER matters, use P(n, r) = n! \u00F7 (n\u2212r)!. How many ways to arrange 3 books out of 5? P(5,3) = 60.' },
      { title: 'Combinations', content: 'When ORDER doesn\u2019t matter, use C(n, r) = n! \u00F7 [r! \u00D7 (n\u2212r)!]. Choosing 3 books from 5 (any order): C(5,3) = 10.' },
      { title: 'When to use which?', content: 'Ask: does the order of selection change the result? Arranging a password \u2192 permutation. Picking a team \u2192 combination.' },
    ],
    example: {
      problem: 'How many 3-letter codes from A, B, C, D, E (no repeats)?',
      solution: [
        'Order matters (ABC \u2260 CBA), so use permutations.',
        'P(5, 3) = 5! \u00F7 (5\u22123)! = 5! \u00F7 2! = 120 \u00F7 2 = 60.',
      ],
      answer: '60 codes',
    },
    tip: 'Permutation = Position matters. Combination = Collection matters. Both start with "P" or "C" \u2014 match the first letter to the meaning!',
    visual: 'chalkboard',
  },

  // ═══════════════════════════════════════════════════════════
  // COMPETENCY-LEVEL LECTURES (used when no TEKS-specific lecture)
  // ═══════════════════════════════════════════════════════════
  'comp001': {
    teks: 'comp001',
    title: 'Number Concepts & Operations',
    objective: 'You will understand real number properties, operations, and number sense used throughout algebra and beyond.',
    keyIdea: 'The real number system includes naturals, integers, rationals, and irrationals. Master order of operations (PEMDAS), absolute value, and properties like distributive, commutative, and associative.',
    steps: [
      { title: 'Real number hierarchy', content: 'Natural \u2282 Whole \u2282 Integer \u2282 Rational \u2282 Real. Irrationals (like \u221A2 and \u03C0) fill the gaps on the number line.' },
      { title: 'Order of operations', content: 'PEMDAS: Parentheses, Exponents, Multiply or Divide (left to right), Add or Subtract (left to right).' },
      { title: 'Properties', content: 'Commutative (a+b = b+a), Associative ((a+b)+c = a+(b+c)), Distributive (a(b+c) = ab+ac). These simplify expressions.' },
    ],
    example: { problem: 'Simplify: 3(2x + 4) \u2212 5x.', solution: ['Distribute: 6x + 12 \u2212 5x.', 'Combine like terms: x + 12.'], answer: 'x + 12' },
    tip: 'When in doubt, distribute first, then combine like terms.',
    visual: 'chalkboard',
  },
  'comp002': {
    teks: 'comp002',
    title: 'Patterns, Algebra & Functions',
    objective: 'You will solve equations, work with functions, and recognize patterns in sequences.',
    keyIdea: 'Algebra is about finding unknowns. Isolate the variable by doing the same operation to both sides. Functions map each input to exactly one output.',
    steps: [
      { title: 'Solving equations', content: 'Goal: isolate x. Use inverse operations (add or subtract, multiply or divide) on both sides. Check your answer by plugging it back in.' },
      { title: 'Functions', content: 'A function f(x) gives one output for each input. Evaluate f(3) by replacing x with 3. Domain = valid inputs, Range = possible outputs.' },
      { title: 'Sequences & patterns', content: 'Arithmetic: constant difference (add d each time). Geometric: constant ratio (multiply by r). Find the rule, then predict any term.' },
    ],
    example: { problem: 'Solve: 3x \u2212 7 = 14.', solution: ['Add 7: 3x = 21.', 'Divide by 3: x = 7.'], answer: 'x = 7' },
    tip: 'Always check: 3(7) \u2212 7 = 21 \u2212 7 = 14. \u2713',
    visual: 'chalkboard',
  },
  'comp003': {
    teks: 'comp003',
    title: 'Geometry & Measurement',
    objective: 'You will use properties of shapes and measurement formulas to solve geometric problems.',
    keyIdea: 'Area, perimeter, and volume formulas let you quantify shapes. Transformations (translations, rotations, reflections) move shapes without changing size.',
    steps: [
      { title: 'Key formulas', content: 'Rectangle: A = lw, P = 2l+2w. Triangle: A = \u00BDbh. Circle: A = \u03C0r\u00B2, C = 2\u03C0r. Rectangular prism: V = lwh.' },
      { title: 'Pythagorean theorem', content: 'In a right triangle: a\u00B2 + b\u00B2 = c\u00B2, where c is the hypotenuse.' },
      { title: 'Transformations', content: 'Translation = slide, Rotation = turn, Reflection = flip, Dilation = resize. Congruent shapes have the same size and shape.' },
    ],
    example: { problem: 'Find the area of a triangle with base 10 and height 6.', solution: ['A = \u00BD \u00D7 base \u00D7 height.', 'A = \u00BD \u00D7 10 \u00D7 6 = 30.'], answer: '30 square units' },
    tip: 'Draw a picture and label everything \u2014 geometry problems are easier when you can see them.',
    visual: 'chalkboard',
  },
  'comp004': {
    teks: 'comp004',
    title: 'Probability & Statistics',
    objective: 'You will analyze data and calculate probabilities to make informed decisions.',
    keyIdea: 'Statistics summarizes data (mean, median, mode). Probability predicts likelihood (0 to 1). Together they help us understand uncertainty.',
    steps: [
      { title: 'Measures of center', content: 'Mean = sum divided by count. Median = middle value. Mode = most frequent. Use median when data has outliers.' },
      { title: 'Data displays', content: 'Histograms show frequency distribution. Box plots reveal quartiles and outliers. Scatter plots show relationships between variables.' },
      { title: 'Probability basics', content: 'P(event) = favorable outcomes divided by total outcomes. Complement: P(not A) = 1 \u2212 P(A). Independent events: P(A and B) = P(A) \u00D7 P(B).' },
      { title: 'Regression', content: 'A best-fit line summarizes the trend in a scatter plot. The equation y = mx + b lets you predict y from x.' },
    ],
    example: { problem: 'A spinner has 3 red, 2 blue, 1 green section. P(blue)?', solution: ['Total sections = 3 + 2 + 1 = 6.', 'Blue sections = 2.', 'P(blue) = 2 \u00F7 6 = \u2153.'], answer: '\u2153 (one-third)' },
    tip: 'Always check: do your probabilities add up to 1? If not, recount!',
    visual: 'chalkboard',
  },
  'comp005': {
    teks: 'comp005',
    title: 'Mathematical Processes & Problem Solving',
    objective: 'You will use reasoning, representations, and strategies to solve multi-step problems.',
    keyIdea: 'Problem solving is about understanding the question, choosing a strategy, executing, and checking. Multiple representations (table, graph, equation) offer different insights.',
    steps: [
      { title: 'Understand the problem', content: 'Read carefully. Identify what is given and what is asked. Restate the question in your own words.' },
      { title: 'Choose a strategy', content: 'Draw a diagram, make a table, look for patterns, write an equation, guess-and-check, or work backwards.' },
      { title: 'Solve & verify', content: 'Execute your plan step by step. Then check: does the answer make sense? Does it satisfy all conditions?' },
    ],
    example: { problem: 'Maria has twice as many stickers as Jon. Together they have 36. How many does each have?', solution: ['Let Jon = x, Maria = 2x.', 'x + 2x = 36 \u2192 3x = 36 \u2192 x = 12.', 'Jon: 12, Maria: 24.'], answer: 'Jon: 12, Maria: 24' },
    tip: 'Drawing a picture or making a table almost always helps \u2014 don\u2019t skip it!',
    visual: 'chalkboard',
  },
  'comp006': {
    teks: 'comp006',
    title: 'Mathematical Instruction & Assessment',
    objective: 'You will understand how to design instruction, use assessments, and support diverse learners in math.',
    keyIdea: 'Effective math teaching aligns tasks to standards, uses formative assessment to adjust instruction, and provides multiple entry points so all students can access the math.',
    steps: [
      { title: 'Align to standards', content: 'Start with the TEKS. Design tasks that target the standard. Use worked examples and scaffolded practice.' },
      { title: 'Formative assessment', content: 'Use exit tickets, observations, and questioning to check understanding in real time. Adjust instruction based on evidence.' },
      { title: 'Differentiation', content: 'Provide multiple representations, tiered tasks, and strategic grouping. ELL students benefit from visuals and sentence stems.' },
    ],
    example: { problem: 'A student answers \u00BE + \u00BD = 4/6. What misconception?', solution: ['The student added numerators (3+1=4) and denominators (4+2=6).', 'They forgot to find a common denominator first.'], answer: 'Added numerators and denominators separately without finding a common denominator.' },
    tip: 'Error analysis reveals student thinking \u2014 wrong answers are teaching opportunities!',
    visual: 'chalkboard',
  },
  // ═══════════════════════════════════════════════════════════
  // MATH 7-12 STANDARD-SPECIFIC LECTURES (c001–c021)
  // ═══════════════════════════════════════════════════════════
  'c001': {
    teks: 'c001',
    title: 'The Real Number System',
    video: 'https://www.youtube.com/embed/VEY08fMYmEU',
    objective: 'You will understand the structure of real numbers and how subsets relate.',
    keyIdea: 'Real numbers include naturals ⊂ wholes ⊂ integers ⊂ rationals ⊂ reals. Irrationals (√2, π) fill gaps. Every real number has a unique decimal representation.',
    steps: [
      { title: 'Number hierarchy', content: 'Natural (1,2,3…) → Whole (add 0) → Integer (add negatives) → Rational (a/b, b≠0) → Real (add irrationals).' },
      { title: 'Properties', content: 'Commutative, associative, distributive. Closure under +, −, ×. Division by zero undefined.' },
      { title: 'Decimal representations', content: 'Rationals terminate or repeat. Irrationals neither terminate nor repeat.' },
    ],
    example: { problem: 'Classify −7, 0, 3/4, √5, π.', solution: ['−7: integer (also rational, real).', '0: whole (also integer, rational, real).', '3/4: rational (also real).', '√5: irrational (also real).', 'π: irrational (also real).'], answer: 'All are real; √5 and π are irrational; −7, 0, 3/4 are rational.' },
    tip: 'Every integer is rational (write it as n/1), but not every rational is an integer.',
    visual: 'number-line',
  },
  'c002': {
    teks: 'c002',
    title: 'The Complex Number System',
    video: 'https://www.youtube.com/embed/SP-YJe7Vldo',
    objective: 'You will operate with complex numbers and represent them geometrically.',
    keyIdea: 'Complex numbers have the form a + bi where i² = −1. They extend the reals so every polynomial has roots.',
    steps: [
      { title: 'Operations', content: 'Add/subtract: combine real and imaginary parts. Multiply: FOIL and use i² = −1. Divide: multiply by conjugate.' },
      { title: 'Complex plane', content: 'Horizontal axis = real, vertical = imaginary. Point (a, b) represents a + bi. Modulus |z| = √(a² + b²).' },
      { title: 'Conjugate pairs', content: 'If a polynomial with real coefficients has root a+bi, then a−bi is also a root.' },
    ],
    example: { problem: '(3 + 2i)(1 − i) = ?', solution: ['FOIL: 3(1) + 3(−i) + 2i(1) + 2i(−i).', '= 3 − 3i + 2i − 2i².', 'i² = −1 → −2(−1) = 2.', '= 5 − i.'], answer: '5 − i' },
    tip: 'To divide complex numbers, multiply top and bottom by the conjugate of the denominator.',
    visual: 'chalkboard',
  },
  'c003': {
    teks: 'c003',
    title: 'Number Theory',
    video: 'https://www.youtube.com/embed/6OgDTCG1QCU',
    objective: 'You will apply prime factorization, divisibility rules, and modular arithmetic.',
    keyIdea: 'Every integer > 1 is either prime or a unique product of primes (Fundamental Theorem of Arithmetic). GCF and LCM come from prime factorizations.',
    steps: [
      { title: 'Prime factorization', content: 'Divide by smallest primes repeatedly. 60 = 2² × 3 × 5.' },
      { title: 'GCF & LCM', content: 'GCF: take lowest power of shared primes. LCM: take highest power of all primes.' },
      { title: 'Modular arithmetic', content: 'a ≡ b (mod n) means n divides (a − b). Clock arithmetic: 17 mod 5 = 2.' },
    ],
    example: { problem: 'Find GCF(48, 180).', solution: ['48 = 2⁴ × 3.', '180 = 2² × 3² × 5.', 'Shared: 2² × 3 = 12.'], answer: 'GCF = 12' },
    tip: 'Use a factor tree or repeated division to find prime factors quickly.',
    visual: 'chalkboard',
  },
  'c004': {
    teks: 'c004',
    title: 'Competency 004 — Patterns and Sequences',
    video: 'https://www.youtube.com/embed/XZJdyPkCxuE',
    objective: 'You will identify pattern structure, write explicit and recursive rules, and apply sequence models to financial and real-world contexts.',
    keyIdea: 'Sequence fluency means moving between representations: verbal rule, table, recursive form, and explicit nth-term form. On the exam, you will generalize arithmetic, geometric, and Fibonacci-like patterns and interpret rate and term meaning in applications like savings growth, repeated deposits, and annuity-style contexts.',
    steps: [
      { title: 'Classify the pattern', content: 'Check first differences (arithmetic) and common ratio (geometric). If each term uses prior terms, it is recursive.' },
      { title: 'Write both rules', content: 'Give recursive form (how to get next term) and explicit form a_n (directly compute term n).' },
      { title: 'Generalize and justify', content: 'Use a table and algebra to verify the rule for several terms, then explain why it works for all n.' },
      { title: 'Apply in context', content: 'Map terms and rates to meaning: deposit amount, growth factor, period count, and total value over time.' },
    ],
    example: {
      problem: 'A savings plan starts at 200 and adds 50 each month. Write recursive and explicit rules, then find month 10.',
      solution: [
        'Arithmetic sequence with common difference d = 50.',
        'Recursive: a₁ = 200, aₙ = aₙ₋₁ + 50.',
        'Explicit: aₙ = 200 + (n − 1) × 50.',
        'a₁₀ = 200 + 9 × 50 = 650.',
      ],
      answer: 'Recursive: a₁ = 200, aₙ = aₙ₋₁ + 50; Explicit: aₙ = 200 + (n − 1) × 50; Month 10 = 650',
    },
    tip: 'When stuck, make a 4-term table first. The table usually reveals whether the rule is additive, multiplicative, or recursive.',
    visual: 'chalkboard',
  },
  'c005': {
    teks: 'c005',
    title: 'Functions, Relations & Graphs',
    video: 'https://www.youtube.com/embed/kvGsIo1TmsM',
    objective: 'You will analyze functions using domain, range, transformations, composition, and inverses.',
    keyIdea: 'A function maps each input to exactly one output. Vertical line test checks if a graph is a function. Parent functions transform via shifts, stretches, and reflections.',
    steps: [
      { title: 'Function notation', content: 'f(x) names the output when x is input. f(3) means substitute 3 for x.' },
      { title: 'Domain & range', content: 'Domain = valid inputs. Range = resulting outputs. Watch for division by zero and even roots of negatives.' },
      { title: 'Transformations', content: 'f(x) + k shifts up, f(x − h) shifts right, −f(x) reflects about the x-axis, f(−x) reflects about the y-axis, af(x) stretches vertically.' },
    ],
    example: { problem: 'If f(x) = x² − 1, find f(−3).', solution: ['f(−3) = (−3)² − 1 = 9 − 1 = 8.'], answer: '8' },
    tip: 'Inverse functions "undo" each other: f(f⁻¹(x)) = x. Reflect the graph about the line y = x to find the inverse graphically.',
    visual: 'chalkboard',
  },
  'c006': {
    teks: 'c006',
    title: 'Linear & Quadratic Functions',
    video: 'https://www.youtube.com/embed/qeByhTF8WEw',
    objective: 'You will solve and graph linear and quadratic equations and systems.',
    keyIdea: 'Linear: y = mx + b (constant rate of change).\nQuadratic: y = ax² + bx + c (parabola). The discriminant b² − 4ac determines the number of real solutions.',
    steps: [
      { title: 'Linear equations', content: 'Slope m = rise/run. Forms: slope-intercept, point-slope, standard. Systems solved by substitution, elimination, or graphing.' },
      { title: 'Quadratic equations', content: 'Solve by factoring, completing the square, or the quadratic formula x = (−b ± √(b² − 4ac)) / 2a.' },
      { title: 'Vertex form', content: 'y = a(x − h)² + k. Vertex at (h, k). a > 0 opens up, a < 0 opens down.' },
    ],
    example: { problem: 'Solve x² − 5x + 6 = 0.', solution: ['Factor: (x − 2)(x − 3) = 0.', 'x = 2 or x = 3.'], answer: 'x = 2 or x = 3' },
    tip: 'The vertex x-coordinate is always −b/(2a). Plug back in to get the y-coordinate.',
    visual: 'chalkboard',
  },
  'c007': {
    teks: 'c007',
    title: 'Polynomial, Rational, Radical & Piecewise Functions',
    video: 'https://www.youtube.com/embed/MHeirBPOI6w',
    objective: 'You will analyze and graph higher-degree polynomials, rational expressions, and piecewise-defined functions.',
    keyIdea: 'End behavior depends on leading term. Rational functions have vertical asymptotes where the denominator is zero and horizontal asymptotes determined by degree comparison.',
    steps: [
      { title: 'Polynomial division', content: 'Use long division or synthetic division. Remainder Theorem: f(a) = remainder when dividing by (x − a).' },
      { title: 'Rational functions', content: 'Factor top & bottom. Cancel common factors (holes). Remaining denominator zeros → vertical asymptotes.' },
      { title: 'Piecewise functions', content: 'Different formulas on different intervals. Evaluate by checking which interval x falls in.' },
    ],
    example: { problem: 'Find asymptotes of f(x) = (x+1)/(x−2).', solution: ['Vertical: x = 2 (denominator = 0).', 'Horizontal: degrees equal → y = 1/1 = 1.'], answer: 'VA: x = 2, HA: y = 1' },
    tip: 'If degree of numerator > degree of denominator, there is a slant asymptote instead of a horizontal one.',
    visual: 'chalkboard',
  },
  'c008': {
    teks: 'c008',
    title: 'Exponential & Logarithmic Functions',
    video: 'https://www.youtube.com/embed/ntBWrcbAhaY',
    objective: 'You will model growth/decay with exponential functions and solve equations using logarithms.',
    keyIdea: 'Exponential: f(x) = a·b^(x) (initial value a, base b). Transforms: y = a·b^(x−h) + k shifts h horizontally and k vertically, scales by |a|; horizontal asymptote y = k. Logarithm is the inverse: log_b(y) = x ⟺ b^(x) = y. Log graphs: y = a·log_b(x−h) + k has vertical asymptote x = h, domain x > h.',
    steps: [
      { title: 'Exponential models', content: 'Compound interest (n times per year): A = P·(1 + r/n)^(nt). Continuous compounding: A = P·e^(rt). General growth/decay: N(t) = N₀·b^(t/k) or N(t) = N₀·e^(rt).' },
      { title: 'Log properties', content: 'log(ab) = log a + log b. log(a/b) = log a − log b. log(a^(n)) = n·log a. Change of base: log_b(x) = (ln x)/(ln b).' },
      { title: 'Solving equations', content: 'Exponential: match bases and set exponents equal, or take ln (or log_b) of both sides. Log equations: rewrite in exponential form b^(y) = x, then solve; check domain (argument of log must be positive).' },
    ],
    example: { problem: 'Solve 2^(x) = 32.', solution: ['32 = 2^(5).', 'So 2^(x) = 2^(5) → x = 5.'], answer: 'x = 5' },
    tip: 'When bases don\'t match, take ln of both sides: x = (ln 32)/(ln 2).',
    visual: 'chalkboard',
  },
  'c009': {
    teks: 'c009',
    title: 'Trigonometric & Circular Functions',
    video: 'https://www.youtube.com/embed/PUB0TaZ7bhA',
    objective: 'You will evaluate trig functions using the unit circle and graph sinusoidal functions.',
    keyIdea: 'On the unit circle, cos θ = x-coordinate and sin θ = y-coordinate. Fundamental identity: sin²θ + cos²θ = 1. Period of sin/cos is 2π.',
    steps: [
      { title: 'Unit circle', content: 'Memorize key angles: 0°, 30°, 45°, 60°, 90° and their radian equivalents. Use reference angles for other quadrants.' },
      { title: 'Graphing', content: 'y = A sin(Bx + C) + D: A = amplitude, period = 2π/B, phase shift = −C/B, vertical shift = D.' },
      { title: 'Identities', content: 'Pythagorean: sin²θ + cos²θ = 1. Double angle: sin 2θ = 2 sin θ cos θ.' },
    ],
    example: { problem: 'Find sin(5π/6).', solution: ['Reference angle: π − 5π/6 = π/6.', 'sin(π/6) = 1/2.', 'In QII, sine is positive → sin(5π/6) = 1/2.'], answer: '1/2' },
    tip: 'Remember "All Students Take Calculus" for which trig functions are positive in each quadrant (I: All, II: Sin, III: Tan, IV: Cos).',
    visual: 'chalkboard',
  },
  'c010': {
    teks: 'c010',
    title: 'Differential & Integral Calculus',
    video: 'https://www.youtube.com/embed/WUvTyaaNkzM',
    objective: 'You will compute limits, derivatives, and integrals and apply them to optimization and area problems.',
    keyIdea: 'The derivative measures instantaneous rate of change. The integral accumulates area. The Fundamental Theorem of Calculus links them: ∫(a)^(b) f(x) dx = F(b) − F(a).',
    steps: [
      { title: 'Limits', content: 'lim(x→a) f(x) = L means f(x) approaches L as x approaches a. Factor or rationalize to evaluate 0/0 forms.' },
      { title: 'Derivatives', content: 'Power rule: d/dx[x^(n)] = nx^(n−1). Product, quotient, and chain rules handle compositions. f′(x) = 0 at critical points.' },
      { title: 'Integrals', content: 'Antiderivative reverses differentiation. ∫x^(n) dx = (x^(n+1))/(n+1) + C. Definite integrals compute net area.' },
    ],
    example: { problem: 'Find d/dx[3x^(4) − 2x + 7].', solution: ['Power rule: 4·3x^(3) − 2 + 0.', '= 12x^(3) − 2.'], answer: '12x^(3) − 2' },
    tip: 'Derivative = slope of tangent. Integral = area under curve. They undo each other!',
    visual: 'chalkboard',
  },
  'c011': {
    teks: 'c011',
    title: 'Measurement',
    video: 'https://www.youtube.com/embed/mLeNaZcy-hE',
    objective: 'You will calculate perimeter, area, surface area, and volume and convert between units.',
    keyIdea: 'Measurement quantifies geometric attributes. Area is in square units, volume in cubic units. Scaling by factor k multiplies area by k² and volume by k³.',
    steps: [
      { title: 'Key formulas', content: 'Rectangle A = lw. Triangle A = ½bh. Circle A = πr². Prism V = Bh. Cylinder V = πr²h. Sphere V = (4/3)πr³.' },
      { title: 'Unit conversions', content: 'Use dimensional analysis: multiply by conversion factors so unwanted units cancel.' },
      { title: 'Scaling effects', content: 'If dimensions scale by factor k: lengths × k, areas × k², volumes × k³.' },
    ],
    example: { problem: 'A cylinder has radius 3 cm and height 10 cm. Find the volume.', solution: ['V = πr²h = π(3)²(10) = 90π ≈ 282.7 cm³.'], answer: '90π ≈ 282.7 cm³' },
    tip: 'Always check that units are consistent before computing.',
    visual: 'chalkboard',
  },
  'c012': {
    teks: 'c012',
    title: 'Euclidean Geometry — Axiomatic Systems',
    video: 'https://www.youtube.com/embed/EcVRXQKzZjo',
    objective: 'You will use postulates, theorems, and logical reasoning in Euclidean geometry.',
    keyIdea: 'Geometry builds from undefined terms (point, line, plane) through postulates to theorems proved by deduction. Congruence and similarity are central relationships.',
    steps: [
      { title: 'Angle relationships', content: 'Vertical angles are equal. Supplementary angles sum to 180°. Complementary angles sum to 90°.' },
      { title: 'Parallel line theorems', content: 'When a transversal crosses parallel lines: corresponding, alternate interior, and alternate exterior angles are congruent.' },
      { title: 'Triangle congruence', content: 'SSS, SAS, ASA, AAS, and HL (right triangles). CPCTC follows from congruence.' },
    ],
    example: { problem: 'Two angles are supplementary. One is 3x + 10 and the other is 2x + 20. Find x.', solution: ['3x + 10 + 2x + 20 = 180.', '5x + 30 = 180 → 5x = 150 → x = 30.'], answer: 'x = 30' },
    tip: 'Mark up diagrams with angle measures and tick marks—visual cues make proofs easier.',
    visual: 'chalkboard',
  },
  'c013': {
    teks: 'c013',
    title: 'Euclidean Geometry — Results & Applications',
    video: 'https://www.youtube.com/embed/LrGHmBhn0yI',
    objective: 'You will apply properties of triangles, polygons, and circles to solve geometry problems.',
    keyIdea: 'Triangle angles sum to 180°. Regular polygon interior angle = (n−2)·180°/n. Circle theorems relate arcs, chords, tangent lines, and inscribed angles.',
    steps: [
      { title: 'Triangle properties', content: 'Exterior angle = sum of remote interior angles. Midsegment is half the third side and parallel to it.' },
      { title: 'Polygon angles', content: 'Interior angle sum = (n−2)·180°. Each interior angle of a regular n-gon = (n−2)·180°/n.' },
      { title: 'Circle theorems', content: 'Central angle = intercepted arc. Inscribed angle = half the arc. Tangent ⊥ radius at point of tangency.' },
    ],
    example: { problem: 'Find the interior angle sum of a hexagon.', solution: ['n = 6. Sum = (6−2)·180° = 4·180° = 720°.'], answer: '720°' },
    tip: 'A hexagon can be divided into 4 triangles—that\'s why the angle sum is 4 × 180°.',
    visual: 'chalkboard',
  },
  'c014': {
    teks: 'c014',
    title: 'Coordinate, Transformational & Vector Geometry',
    video: 'https://www.youtube.com/embed/mLeNaZcy-hE',
    objective: 'You will use coordinate geometry, transformations, and vectors to analyze geometric relationships.',
    keyIdea: 'Distance = √((x₂−x₁)² + (y₂−y₁)²). Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2). Transformations preserve shape (rigid) or change size (dilation).',
    steps: [
      { title: 'Distance & midpoint', content: 'Use the distance formula for lengths and the midpoint formula for bisection.' },
      { title: 'Transformations', content: 'Translation (x+a, y+b), reflection (negate one coordinate), rotation (90°: (x,y)→(−y,x)), dilation (kx, ky).' },
      { title: 'Conic sections', content: 'Circle: (x−h)² + (y−k)² = r². Ellipse, parabola, hyperbola from the general second-degree equation.' },
    ],
    example: { problem: 'Find the distance between (1, 2) and (4, 6).', solution: ['d = √((4−1)² + (6−2)²) = √(9 + 16) = √25 = 5.'], answer: '5' },
    tip: 'The distance formula is just the Pythagorean theorem applied to coordinates.',
    visual: 'chalkboard',
  },
  'c015': {
    teks: 'c015',
    title: 'Data Analysis',
    video: 'https://www.youtube.com/embed/uAxyI_XfqXk',
    objective: 'You will summarize data using measures of center, spread, and appropriate displays.',
    keyIdea: 'Mean, median, and mode describe center. Range, IQR, and standard deviation describe spread. Choose displays (histogram, box plot, scatter plot) based on data type.',
    steps: [
      { title: 'Center measures', content: 'Mean = sum/count. Median = middle value. Mode = most frequent. Use median when outliers exist.' },
      { title: 'Spread measures', content: 'Range = max − min. IQR = Q3 − Q1 (resistant to outliers). SD measures average distance from mean.' },
      { title: 'Displays', content: 'Histogram for distributions. Box plot for quartiles/outliers. Scatter plot for bivariate relationships.' },
    ],
    example: { problem: 'Data: 2, 5, 5, 7, 12. Find median and IQR.', solution: ['Sorted: 2, 5, 5, 7, 12. Median = 5.', 'Q1 = 3.5, Q3 = 9.5. IQR = 9.5 − 3.5 = 6.'], answer: 'Median = 5, IQR = 6' },
    tip: 'Outliers are values more than 1.5 × IQR below Q1 or above Q3.',
    visual: 'chalkboard',
  },
  'c016': {
    teks: 'c016',
    title: 'Probability',
    video: 'https://www.youtube.com/embed/KzfWUEJjG18',
    objective: 'You will calculate probabilities using rules, counting techniques, and distributions.',
    keyIdea: 'P(event) = favorable/total. Addition rule for "or," multiplication rule for "and." Permutations for ordered arrangements, combinations for unordered selections.',
    steps: [
      { title: 'Basic probability', content: 'P(A) = favorable outcomes / total outcomes. 0 ≤ P(A) ≤ 1. P(not A) = 1 − P(A).' },
      { title: 'Compound events', content: 'Independent: P(A and B) = P(A)·P(B). Dependent: use conditional probability P(B|A).' },
      { title: 'Counting', content: 'Permutation P(n,r) = n!/(n−r)! (order matters). Combination C(n,r) = n!/[r!(n−r)!] (order doesn\'t matter).' },
    ],
    example: { problem: 'P(drawing 2 aces from a deck without replacement)?', solution: ['P(1st ace) = 4/52.', 'P(2nd ace | 1st ace) = 3/51.', 'P(both) = (4/52)(3/51) = 12/2652 = 1/221.'], answer: '1/221' },
    tip: 'Without replacement changes the denominator and numerator for the second draw.',
    visual: 'chalkboard',
  },
  'c017': {
    teks: 'c017',
    title: 'Statistical Inference',
    video: 'https://www.youtube.com/embed/xxpc-HPKN28',
    objective: 'You will apply hypothesis testing, confidence intervals, and regression to draw conclusions from data.',
    keyIdea: 'Statistical inference uses sample data to make conclusions about populations. The Central Limit Theorem ensures sample means are approximately normal for large n.',
    steps: [
      { title: 'Hypothesis testing', content: 'H₀ (null) vs. Hₐ (alternative). Compute a test statistic, compare to critical value or p-value to α.' },
      { title: 'Confidence intervals', content: 'Estimate ± margin of error. 95% CI: x̄ ± 1.96·(σ/√n). Wider interval = more confidence.' },
      { title: 'Regression', content: 'Line of best fit: ŷ = a + bx. r measures strength/direction of linear association. r² = proportion of variance explained.' },
    ],
    example: { problem: 'A sample of 100 has mean 74 and SD 10. Find 95% CI.', solution: ['ME = 1.96·(10/√100) = 1.96.', 'CI: 74 ± 1.96 = (72.04, 75.96).'], answer: '(72.04, 75.96)' },
    tip: 'A small p-value (< α) means reject H₀ — the evidence against it is strong.',
    visual: 'chalkboard',
  },
  'c018': {
    teks: 'c018',
    title: 'Mathematical Reasoning & Problem Solving',
    video: 'https://www.youtube.com/embed/tN9Xl1AcSv8',
    objective: 'You will apply deductive and inductive reasoning, proof strategies, and problem-solving methods.',
    keyIdea: 'Inductive reasoning finds patterns; deductive reasoning proves them. A single counterexample disproves a conjecture. Good problem-solving starts with understanding, then planning, executing, and verifying.',
    steps: [
      { title: 'Inductive vs. deductive', content: 'Inductive: observe patterns → conjecture. Deductive: use known facts and logic → proof.' },
      { title: 'Proof techniques', content: 'Direct proof, proof by contradiction, proof by contrapositive, mathematical induction.' },
      { title: 'Problem-solving strategies', content: 'Draw a picture, make a table, look for patterns, work backwards, simplify, consider special cases.' },
    ],
    example: { problem: 'Disprove: "All primes are odd."', solution: ['Find a counterexample: 2 is prime and even.'], answer: 'Counterexample: 2 is an even prime, so the statement is false.' },
    tip: 'To disprove a universal statement, you only need one counterexample.',
    visual: 'chalkboard',
  },
  'c019': {
    teks: 'c019',
    title: 'Mathematical Connections & Communication',
    video: 'https://www.youtube.com/embed/oECKpn0GELY',
    objective: 'You will connect mathematical ideas across strands and communicate reasoning using multiple representations.',
    keyIdea: 'Math concepts are interconnected. The same problem can be viewed algebraically, graphically, numerically, or verbally. Effective communication uses precise terminology and justification.',
    steps: [
      { title: 'Multiple representations', content: 'Table, graph, equation, verbal description — each reveals different insights about the same relationship.' },
      { title: 'Cross-strand connections', content: 'Algebra connects to geometry (coordinate proofs), statistics (regression), and number theory (modular arithmetic).' },
      { title: 'Mathematical communication', content: 'Use correct notation and vocabulary. Justify steps with properties, theorems, or definitions.' },
    ],
    example: { problem: 'Show 3 representations of y = 2x + 1.', solution: ['Verbal: "start at 1, go up 2 for each unit right."', 'Table: (0,1), (1,3), (2,5).', 'Graph: line through (0,1) with slope 2.'], answer: 'Verbal, tabular, and graphical representations all describe the same linear relationship.' },
    tip: 'When stuck, switch representations — a graph might reveal what an equation hides.',
    visual: 'chalkboard',
  },
  'c020': {
    teks: 'c020',
    title: 'Mathematical Learning & Instruction',
    video: 'https://www.youtube.com/embed/ZZQO3HGkFa8',
    objective: 'You will apply research-based strategies for teaching mathematics to diverse learners.',
    keyIdea: 'Effective math instruction moves from concrete to pictorial to abstract (CPA). Formative assessment informs differentiation. Questioning promotes deeper understanding.',
    steps: [
      { title: 'CPA progression', content: 'Concrete (manipulatives) → Pictorial (diagrams) → Abstract (symbols). Build understanding at each stage before moving on.' },
      { title: 'Differentiation', content: 'Tier tasks by complexity, provide sentence stems for ELLs, use multiple entry points so all learners access the math.' },
      { title: 'Questioning techniques', content: 'Ask open-ended questions that promote reasoning: "How do you know?" "Can you find another way?" "What if…?"' },
    ],
    example: { problem: 'A student says 1/2 + 1/3 = 2/5. What instructional move?', solution: ['The student added numerators and denominators separately.', 'Use fraction bars (concrete) to show 1/2 + 1/3 ≠ 2/5.', 'Guide toward common denominators: 3/6 + 2/6 = 5/6.'], answer: 'Use concrete models to show the misconception, then teach common denominators.' },
    tip: 'Wrong answers reveal student thinking — they are the best teaching opportunities.',
    visual: 'chalkboard',
  },
  'c021': {
    teks: 'c021',
    title: 'Mathematical Assessment',
    video: 'https://www.youtube.com/embed/oECKpn0GELY',
    objective: 'You will design and use assessments to monitor learning and guide instruction.',
    keyIdea: 'Formative assessment checks understanding during learning. Summative assessment evaluates at the end. Both should align with TEKS standards and drive instructional decisions.',
    steps: [
      { title: 'Formative vs. summative', content: 'Formative: exit tickets, observations, questioning (during learning). Summative: unit tests, benchmarks (after learning).' },
      { title: 'Error analysis', content: 'Look at wrong answers to diagnose misconceptions. Common patterns: procedural errors, conceptual misunderstandings, careless mistakes.' },
      { title: 'Using data', content: 'Analyze class data to group students, reteach concepts, and adjust pacing.' },
    ],
    example: { problem: 'Several students wrote √(9+16) = √9 + √16 = 3 + 4 = 7. Diagnose.', solution: ['They incorrectly distributed the radical over addition.', '√(9+16) = √25 = 5, not 7.', 'Misconception: √(a+b) ≠ √a + √b.'], answer: 'Students over-applied the "distribute" property to radicals. Reteach with counterexamples.' },
    tip: 'Always verify assessment items align with the specific TEKS standard being measured.',
    visual: 'chalkboard',
  },
};

export default LECTURES;

/** Get lecture for a TEKS code or competency ID. Returns null if not found. */
export function getLecture(teksCode) {
  return LECTURES[teksCode] || null;
}

/** Get a lecture appropriate for a given competency (comp001-comp006). Falls back to first matching TEKS lecture. */
export function getLectureForComp(compId, teksCode) {
  if (teksCode) {
    const codes = teksCode.split(',').map(t => t.trim());
    for (const code of codes) {
      if (LECTURES[code]) return LECTURES[code];
    }
  }
  if (LECTURES[compId]) return LECTURES[compId];
  return null;
}

/** Get all available lecture TEKS codes */
export function getAvailableLectures() {
  return Object.keys(LECTURES);
}
