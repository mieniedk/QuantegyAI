/**
 * Test Bank – Pre-made questions organized by TEKS standard.
 *
 * The Question Generator checks the bank FIRST and only calls the AI
 * for questions that aren't already stored here. Teachers can also
 * save AI-generated questions back into the bank so the library grows
 * over time without burning more tokens.
 *
 * Structure:
 *   Each entry has: id, teks, grade, format, difficulty, question/statement,
 *   options (MC), correct, answer, misconception/explanation, representation,
 *   source ("bank" | "ai-saved")
 *
 * Persistence: the initial seed lives here; runtime additions are persisted
 * in localStorage under "allen-ace-test-bank".
 */

// ─── Seed questions ────────────────────────────────────────────────────────

export const SEED_QUESTIONS = [
  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.2A – Compose and decompose numbers up to 100,000
  // ══════════════════════════════════════════════════════════════════════════

  // ── Multiple Choice versions ──────────────────────────────────────────
  {
    id: 'bank-3.2A-mc-001',
    teks: '3.2A',
    grade: 'grade3',
    format: 'multiple-choice',
    difficulty: 'Developing',
    representation: 'Visual / pictorial',
    question: 'Look at the base-ten blocks: 3 thousand-cubes, 2 hundred-flats, 4 ten-rods, 7 unit-cubes. What is this number in standard form?',
    options: { A: '3,247', B: '30,247', C: '3,274', D: '32,470' },
    correct: 'A',
    explanation: 'Step 1: Count the thousand-cubes. There are 3, so the thousands digit is 3. That means 3 × 1,000 = 3,000.\nStep 2: Count the hundred-flats. There are 2, so the hundreds digit is 2. That means 2 × 100 = 200.\nStep 3: Count the ten-rods. There are 4, so the tens digit is 4. That means 4 × 10 = 40.\nStep 4: Count the unit-cubes. There are 7, so the ones digit is 7. That means 7 × 1 = 7.\nStep 5: Add them all together: 3,000 + 200 + 40 + 7 = 3,247.',
    misconception: 'Students may write 30,247 confusing the place value of the thousands place.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-mc-001b',
    teks: '3.2A',
    grade: 'grade3',
    format: 'multiple-choice',
    difficulty: 'Developing',
    representation: 'Visual / pictorial',
    question: 'Look at the base-ten blocks: 1 thousand-cube, 5 hundred-flats, 0 ten-rods, 3 unit-cubes. What is this number in standard form?',
    options: { A: '1,530', B: '1,503', C: '1,053', D: '15,003' },
    correct: 'B',
    explanation: 'Step 1: Count the thousand-cubes. There is 1, so the thousands digit is 1. That means 1 × 1,000 = 1,000.\nStep 2: Count the hundred-flats. There are 5, so the hundreds digit is 5. That means 5 × 100 = 500.\nStep 3: There are 0 ten-rods, so the tens digit is 0. That means 0 × 10 = 0.\nStep 4: Count the unit-cubes. There are 3, so the ones digit is 3. That means 3 × 1 = 3.\nStep 5: Add them all together: 1,000 + 500 + 0 + 3 = 1,503.',
    misconception: 'Students may confuse the absence of tens and write 1,530 by placing the 3 in the tens spot.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-mc-001c',
    teks: '3.2A',
    grade: 'grade3',
    format: 'multiple-choice',
    difficulty: 'Emerging',
    representation: 'Visual / pictorial',
    question: 'Look at the base-ten blocks: 0 thousand-cubes, 4 hundred-flats, 6 ten-rods, 2 unit-cubes. What is this number in standard form?',
    options: { A: '462', B: '4,620', C: '642', D: '426' },
    correct: 'A',
    explanation: 'Step 1: There are no thousand-cubes, so the number is less than 1,000.\nStep 2: Count the hundred-flats. There are 4, so the hundreds digit is 4. That means 4 × 100 = 400.\nStep 3: Count the ten-rods. There are 6, so the tens digit is 6. That means 6 × 10 = 60.\nStep 4: Count the unit-cubes. There are 2, so the ones digit is 2. That means 2 × 1 = 2.\nStep 5: Add them all together: 400 + 60 + 2 = 462.',
    misconception: 'Students may reorder the digits instead of mapping each block type to its place value.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-mc-001d',
    teks: '3.2A',
    grade: 'grade3',
    format: 'multiple-choice',
    difficulty: 'Proficient',
    representation: 'Visual / pictorial',
    question: 'Look at the base-ten blocks: 2 thousand-cubes, 0 hundred-flats, 8 ten-rods, 5 unit-cubes. What is this number in standard form?',
    options: { A: '2,850', B: '2,085', C: '285', D: '20,085' },
    correct: 'B',
    explanation: 'Step 1: Count the thousand-cubes. There are 2, so the thousands digit is 2. That means 2 × 1,000 = 2,000.\nStep 2: There are 0 hundred-flats, so the hundreds digit is 0. That means 0 × 100 = 0.\nStep 3: Count the ten-rods. There are 8, so the tens digit is 8. That means 8 × 10 = 80.\nStep 4: Count the unit-cubes. There are 5, so the ones digit is 5. That means 5 × 1 = 5.\nStep 5: Add them all together: 2,000 + 0 + 80 + 5 = 2,085. Notice the 0 in the hundreds place!',
    misconception: 'Students may skip the empty hundreds place and write 285 instead of 2,085.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-mc-001e',
    teks: '3.2A',
    grade: 'grade3',
    format: 'multiple-choice',
    difficulty: 'Developing',
    representation: 'Visual / pictorial',
    question: 'Look at the base-ten blocks: 5 thousand-cubes, 1 hundred-flat, 3 ten-rods, 9 unit-cubes. What is this number in standard form?',
    options: { A: '5,193', B: '5,139', C: '51,390', D: '5,931' },
    correct: 'B',
    explanation: 'Step 1: Count the thousand-cubes. There are 5, so the thousands digit is 5. That means 5 × 1,000 = 5,000.\nStep 2: Count the hundred-flats. There is 1, so the hundreds digit is 1. That means 1 × 100 = 100.\nStep 3: Count the ten-rods. There are 3, so the tens digit is 3. That means 3 × 10 = 30.\nStep 4: Count the unit-cubes. There are 9, so the ones digit is 9. That means 9 × 1 = 9.\nStep 5: Add them all together: 5,000 + 100 + 30 + 9 = 5,139.',
    misconception: 'Students may scramble the digit order, writing 5,193 or 5,931 instead of matching each block type to its correct place value.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-mc-001f',
    teks: '3.2A',
    grade: 'grade3',
    format: 'multiple-choice',
    difficulty: 'Mastered',
    representation: 'Visual / pictorial',
    question: 'Look at the base-ten blocks: 4 thousand-cubes, 7 hundred-flats, 0 ten-rods, 0 unit-cubes. What is this number in standard form?',
    options: { A: '4,007', B: '470', C: '4,700', D: '47,000' },
    correct: 'C',
    explanation: 'Step 1: Count the thousand-cubes. There are 4, so the thousands digit is 4. That means 4 × 1,000 = 4,000.\nStep 2: Count the hundred-flats. There are 7, so the hundreds digit is 7. That means 7 × 100 = 700.\nStep 3: There are 0 ten-rods, so the tens digit is 0. That means 0 × 10 = 0.\nStep 4: There are 0 unit-cubes, so the ones digit is 0. That means 0 × 1 = 0.\nStep 5: Add them all together: 4,000 + 700 + 0 + 0 = 4,700. The zeros act as placeholders!',
    misconception: 'Students may write 470 (missing the thousands) or 47,000 (adding extra zeros).',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-mc-002',
    teks: '3.2A',
    grade: 'grade3',
    format: 'multiple-choice',
    difficulty: 'Developing',
    representation: 'Symbolic / equation',
    question: 'Maria wrote the expanded form of 5,063 as: 5,000 + 600 + 3. What should it be?',
    options: { A: '5,000 + 600 + 3', B: '5,000 + 60 + 3', C: '5,000 + 63', D: '50,000 + 60 + 3' },
    correct: 'B',
    explanation: 'Step 1: Look at the number 5,063. The digit 5 is in the thousands place, so its value is 5,000.\nStep 2: The digit 0 is in the hundreds place, so there are no hundreds (0 × 100 = 0). We skip it in expanded form.\nStep 3: The digit 6 is in the tens place — not the hundreds place! So its value is 6 × 10 = 60.\nStep 4: The digit 3 is in the ones place, so its value is 3 × 1 = 3.\nStep 5: The correct expanded form is: 5,000 + 60 + 3. Maria made a mistake by writing 600 instead of 60.',
    misconception: 'Students may think Maria is correct because they confuse the tens digit (6 = 60) with the hundreds digit (6 = 600).',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-mc-003',
    teks: '3.2A',
    grade: 'grade3',
    format: 'multiple-choice',
    difficulty: 'Developing',
    representation: 'Symbolic / equation',
    question: 'What is the expanded notation for 8,405?',
    options: { A: '8,000 + 400 + 50', B: '8,000 + 40 + 5', C: '8,000 + 400 + 5', D: '80,000 + 400 + 5' },
    correct: 'C',
    explanation: 'Step 1: The digit 8 is in the thousands place. Its value is 8 × 1,000 = 8,000.\nStep 2: The digit 4 is in the hundreds place. Its value is 4 × 100 = 400.\nStep 3: The digit 0 is in the tens place. That means there are zero tens (0 × 10 = 0), so we skip it.\nStep 4: The digit 5 is in the ones place. Its value is 5 × 1 = 5.\nStep 5: Put it together: 8,000 + 400 + 5. The zero in the tens place means we don\'t write anything for tens.',
    misconception: 'Students may forget zeros and write 8 + 4 + 5, or put 50 instead of 5 by misreading the ones digit.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-mc-004',
    teks: '3.2A',
    grade: 'grade3',
    format: 'multiple-choice',
    difficulty: 'Developing',
    representation: 'Word problem',
    question: 'The Rodriguez family has 2 thousand-dollar bills, 3 hundred-dollar bills, 1 ten-dollar bill, and 9 one-dollar bills. How much money do they have?',
    options: { A: '$2,391', B: '$2,319', C: '$2,139', D: '$23,190' },
    correct: 'B',
    explanation: 'Step 1: 2 thousand-dollar bills = 2 × $1,000 = $2,000. The digit 2 goes in the thousands place.\nStep 2: 3 hundred-dollar bills = 3 × $100 = $300. The digit 3 goes in the hundreds place.\nStep 3: 1 ten-dollar bill = 1 × $10 = $10. The digit 1 goes in the tens place.\nStep 4: 9 one-dollar bills = 9 × $1 = $9. The digit 9 goes in the ones place.\nStep 5: Add them up: $2,000 + $300 + $10 + $9 = $2,319. The number is: 2 thousands, 3 hundreds, 1 ten, 9 ones.',
    misconception: 'Students may add incorrectly and get $2,391 by reversing the digits in the tens and ones places.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-mc-005',
    teks: '3.2A',
    grade: 'grade3',
    format: 'multiple-choice',
    difficulty: 'Proficient',
    representation: 'Mixed',
    question: 'The number 46,582 has the digit 6 in the thousands place. Which shows this number in expanded notation?',
    options: {
      A: '40,000 + 6,000 + 500 + 80 + 2',
      B: '46,000 + 500 + 80 + 2',
      C: '4,000 + 6,000 + 500 + 80 + 2',
      D: '40,000 + 600 + 500 + 80 + 2',
    },
    correct: 'A',
    explanation: 'Step 1: Start from the left. The digit 4 is in the ten-thousands place. Its value is 4 × 10,000 = 40,000.\nStep 2: The digit 6 is in the thousands place. Its value is 6 × 1,000 = 6,000.\nStep 3: The digit 5 is in the hundreds place. Its value is 5 × 100 = 500.\nStep 4: The digit 8 is in the tens place. Its value is 8 × 10 = 80.\nStep 5: The digit 2 is in the ones place. Its value is 2 × 1 = 2.\nStep 6: In expanded notation: 40,000 + 6,000 + 500 + 80 + 2 = 46,582.',
    misconception: 'Students may circle the wrong digit (often the 4 in ten thousands place) or incorrectly assign place values.',
    source: 'bank',
  },

  // ── True / False versions ─────────────────────────────────────────────
  {
    id: 'bank-3.2A-tf-001',
    teks: '3.2A',
    grade: 'grade3',
    format: 'true-false',
    difficulty: 'Emerging',
    representation: 'Symbolic / equation',
    statement: 'The expanded form of 3,247 is 3,000 + 200 + 40 + 7.',
    correct: true,
    explanation: '3 thousands = 3,000, 2 hundreds = 200, 4 tens = 40, 7 ones = 7. Added together = 3,247.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-tf-002',
    teks: '3.2A',
    grade: 'grade3',
    format: 'true-false',
    difficulty: 'Emerging',
    representation: 'Symbolic / equation',
    statement: 'The expanded form of 5,063 is 5,000 + 600 + 3.',
    correct: false,
    explanation: 'The 6 is in the tens place, not the hundreds place. The correct expanded form is 5,000 + 60 + 3.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-tf-003',
    teks: '3.2A',
    grade: 'grade3',
    format: 'true-false',
    difficulty: 'Developing',
    representation: 'Symbolic / equation',
    statement: 'In the number 8,405, the digit 0 means there are no tens.',
    correct: true,
    explanation: '8,405 has 8 thousands, 4 hundreds, 0 tens, and 5 ones. The zero in the tens place means there are no groups of ten.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-tf-004',
    teks: '3.2A',
    grade: 'grade3',
    format: 'true-false',
    difficulty: 'Proficient',
    representation: 'Symbolic / equation',
    statement: 'The number 46,582 can be written as 4 ten thousands + 6 thousands + 5 hundreds + 8 tens + 2 ones.',
    correct: true,
    explanation: '40,000 + 6,000 + 500 + 80 + 2 = 46,582. Each digit is multiplied by its place value.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-tf-005',
    teks: '3.2A',
    grade: 'grade3',
    format: 'true-false',
    difficulty: 'Developing',
    representation: 'Word problem',
    statement: '2 thousand-dollar bills, 3 hundred-dollar bills, 1 ten-dollar bill, and 9 one-dollar bills total $2,391.',
    correct: false,
    explanation: 'The correct total is $2,319. The 1 is in the tens place ($10) and the 9 is in the ones place ($9), not the other way around.',
    source: 'bank',
  },

  // ── Open-Ended versions ───────────────────────────────────────────────
  {
    id: 'bank-3.2A-oe-001',
    teks: '3.2A',
    grade: 'grade3',
    format: 'open-ended',
    difficulty: 'Developing',
    representation: 'Visual / pictorial',
    question: 'Look at the base-ten blocks: 3 thousand-cubes, 2 hundred-flats, 4 ten-rods, 7 unit-cubes. Write this number in standard form, expanded form, and word form.',
    answer: 'Standard form: 3,247. Expanded form: 3,000 + 200 + 40 + 7. Word form: Three thousand, two hundred forty-seven.',
    misconception: 'Students may write 30,000 + 200 + 40 + 7 in expanded form, confusing the place value of the thousands place.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-oe-002',
    teks: '3.2A',
    grade: 'grade3',
    format: 'open-ended',
    difficulty: 'Proficient',
    representation: 'Symbolic / equation',
    question: 'Maria wrote the number 5,063 in expanded form as: 5,000 + 600 + 3. Is Maria correct? If not, what should the expanded form be? Explain your thinking.',
    answer: 'No. The correct expanded form is 5,000 + 60 + 3. Maria wrote 600 instead of 60 for the tens place. The digit 6 is in the tens place so it represents 60, not 600.',
    misconception: 'Students may think Maria is correct because they don\'t recognize that 6 in the tens place represents 60, not 600.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-oe-003',
    teks: '3.2A',
    grade: 'grade3',
    format: 'open-ended',
    difficulty: 'Developing',
    representation: 'Symbolic / equation',
    question: 'Complete the place value chart for 8,405 (Ten Thousands, Thousands, Hundreds, Tens, Ones) and write the number in expanded notation.',
    answer: 'Ten Thousands: 0, Thousands: 8, Hundreds: 4, Tens: 0, Ones: 5. Expanded notation: 8,000 + 400 + 5.',
    misconception: 'Students may forget to include zeros in the place value chart or omit them in expanded form.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-oe-004',
    teks: '3.2A',
    grade: 'grade3',
    format: 'open-ended',
    difficulty: 'Developing',
    representation: 'Word problem',
    question: 'The Rodriguez family has 2 thousand-dollar bills, 3 hundred-dollar bills, 1 ten-dollar bill, and 9 one-dollar bills. How much money do they have? Write your answer in standard form and expanded form.',
    answer: 'Standard form: $2,319. Expanded form: $2,000 + $300 + $10 + $9.',
    misconception: 'Students may add incorrectly and get $2,391 by reversing the digits in the tens and ones places.',
    source: 'bank',
  },
  {
    id: 'bank-3.2A-oe-005',
    teks: '3.2A',
    grade: 'grade3',
    format: 'open-ended',
    difficulty: 'Proficient',
    representation: 'Mixed',
    question: 'Look at the number 46,582. Circle the digit in the thousands place. Then show three different ways to represent this number: using place value words, base-ten block symbols, and expanded notation.',
    answer: 'The digit 6 should be circled. Way 1: 4 ten thousands + 6 thousands + 5 hundreds + 8 tens + 2 ones. Way 2: ⬜⬜⬜⬜ ⬛⬛⬛⬛⬛⬛ ▬▬▬▬▬ ||||||||  ••. Way 3: 40,000 + 6,000 + 500 + 80 + 2.',
    misconception: 'Students may circle the 4 (ten thousands) instead of the 6 (thousands), or incorrectly represent place values.',
    source: 'bank',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.2B – Digit identification / place value relationships
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'bank-3.2B-mc-001', teks: '3.2B', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'In the number 4,729, what digit is in the hundreds place?', options: { A: '4', B: '7', C: '2', D: '9' }, correct: 'B',
    explanation: 'Step 1: Write out the place values from right to left: 9 is in the ones place, 2 is in the tens place, 7 is in the hundreds place, 4 is in the thousands place.\nStep 2: The question asks for the hundreds place. Count three places from the right: ones → tens → hundreds.\nStep 3: The digit in the hundreds place is 7.',
    misconception: 'Students may confuse hundreds with thousands.', source: 'bank' },
  { id: 'bank-3.2B-mc-002', teks: '3.2B', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is the value of the digit 5 in 3,582?', options: { A: '5', B: '50', C: '500', D: '5,000' }, correct: 'C',
    explanation: 'Step 1: Find where the digit 5 is sitting in 3,582. Reading right to left: 2 is in ones, 8 is in tens, 5 is in hundreds, 3 is in thousands.\nStep 2: The digit 5 is in the hundreds place.\nStep 3: To find the value, multiply the digit by its place: 5 × 100 = 500.\nStep 4: Remember: the "value" of a digit depends on its place. The digit 5 in the hundreds place is worth 500, not just 5.',
    misconception: 'Students may give the face value (5) instead of the place value (500).', source: 'bank' },
  { id: 'bank-3.2B-mc-003', teks: '3.2B', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Which digit is in the tens place in 6,407?', options: { A: '6', B: '4', C: '0', D: '7' }, correct: 'C',
    explanation: 'Step 1: Label each digit in 6,407 from right to left: 7 is in the ones place, 0 is in the tens place, 4 is in the hundreds place, 6 is in the thousands place.\nStep 2: The question asks for the tens place — that\'s the second digit from the right.\nStep 3: The digit in the tens place is 0. Even though it\'s zero, it still holds that place! It means there are no groups of ten.',
    misconception: 'Students may skip the zero and select 4.', source: 'bank' },
  { id: 'bank-3.2B-mc-004', teks: '3.2B', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Word problem',
    question: 'The value of the 8 in 8,135 is how many times the value of the 8 in 281?', options: { A: '10 times', B: '100 times', C: '1,000 times', D: 'The same' }, correct: 'B',
    explanation: 'Step 1: Find the value of 8 in 8,135. Label the places: 8 is in the thousands place, 1 is hundreds, 3 is tens, 5 is ones. So 8 × 1,000 = 8,000.\nStep 2: Find the value of 8 in 281. Label the places: 2 is in the hundreds place, 8 is in the tens place, 1 is in the ones place. So 8 × 10 = 80.\nStep 3: Compare: How many times bigger is 8,000 than 80? Divide: 8,000 ÷ 80 = 100.\nStep 4: The value of the 8 in 8,135 is 100 times the value of the 8 in 281.',
    misconception: 'Students may not understand relative place values.', source: 'bank' },
  { id: 'bank-3.2B-mc-005', teks: '3.2B', grade: 'grade3', format: 'multiple-choice', difficulty: 'Emerging', representation: 'Symbolic / equation',
    question: 'In the number 952, the digit 9 has a value of —', options: { A: '9', B: '90', C: '900', D: '9,000' }, correct: 'C',
    explanation: 'Step 1: Label each place in 952 from right to left: 2 is in the ones place, 5 is in the tens place, 9 is in the hundreds place.\nStep 2: The digit 9 is in the hundreds place.\nStep 3: Multiply the digit by its place value: 9 × 100 = 900.\nStep 4: So the value of the 9 in 952 is 900. The face value is just 9, but the place value is 900.',
    misconception: 'Students may give face value.', source: 'bank' },

  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.2C – Round whole numbers to the nearest hundred
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'bank-3.2C-mc-001', teks: '3.2C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is 467 rounded to the nearest hundred?', options: { A: '400', B: '470', C: '500', D: '460' }, correct: 'C',
    explanation: 'Step 1: Find the two hundreds that 467 is between: 400 and 500.\nStep 2: Look at the tens digit to decide which hundred is closer. The tens digit is 6.\nStep 3: Since 6 ≥ 5, we round UP to the next hundred.\nStep 4: 467 rounded to the nearest hundred is 500.',
    misconception: 'Students may round to the nearest ten instead.', source: 'bank' },
  { id: 'bank-3.2C-mc-002', teks: '3.2C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is 832 rounded to the nearest hundred?', options: { A: '800', B: '830', C: '900', D: '840' }, correct: 'A',
    explanation: 'Step 1: Find the two hundreds that 832 is between: 800 and 900.\nStep 2: Look at the tens digit to decide. The tens digit is 3.\nStep 3: Since 3 < 5, we round DOWN to the lower hundred.\nStep 4: 832 rounded to the nearest hundred is 800.',
    misconception: 'Students may round up when the tens digit is less than 5.', source: 'bank' },
  { id: 'bank-3.2C-mc-003', teks: '3.2C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Round 1,250 to the nearest hundred.', options: { A: '1,200', B: '1,300', C: '1,000', D: '1,250' }, correct: 'B',
    explanation: 'Step 1: Find the two hundreds that 1,250 is between: 1,200 and 1,300.\nStep 2: Look at the tens digit. The tens digit is 5.\nStep 3: When the tens digit is exactly 5, the rule is to round UP.\nStep 4: 1,250 rounded to the nearest hundred is 1,300.',
    misconception: 'Students may be unsure about rounding when the tens digit is exactly 5.', source: 'bank' },
  { id: 'bank-3.2C-mc-004', teks: '3.2C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Emerging', representation: 'Symbolic / equation',
    question: 'What is 349 rounded to the nearest hundred?', options: { A: '300', B: '350', C: '400', D: '340' }, correct: 'A',
    explanation: 'Step 1: Find the two hundreds that 349 is between: 300 and 400.\nStep 2: Look at the tens digit. The tens digit is 4.\nStep 3: Since 4 < 5, we round DOWN to the lower hundred.\nStep 4: 349 rounded to the nearest hundred is 300.',
    misconception: 'Students may confuse rounding to the nearest ten vs hundred.', source: 'bank' },
  { id: 'bank-3.2C-mc-005', teks: '3.2C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Word problem',
    question: 'A school has 678 students. About how many students is that, rounded to the nearest hundred?', options: { A: '600', B: '680', C: '700', D: '670' }, correct: 'C',
    explanation: 'Step 1: Find the two hundreds that 678 is between: 600 and 700.\nStep 2: Look at the tens digit. The tens digit is 7.\nStep 3: Since 7 ≥ 5, we round UP to the next hundred.\nStep 4: 678 rounded to the nearest hundred is 700. So the school has about 700 students.',
    misconception: 'Students may round to the nearest ten.', source: 'bank' },
  { id: 'bank-3.2C-mc-006', teks: '3.2C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Emerging', representation: 'Symbolic / equation',
    question: 'Round 720 to the nearest hundred.', options: { A: '700', B: '720', C: '800', D: '730' }, correct: 'A',
    explanation: 'Step 1: Find the two hundreds that 720 is between: 700 and 800.\nStep 2: Look at the tens digit to decide which hundred is closer. The tens digit is 2.\nStep 3: Since 2 < 5 (less than 5), we round DOWN to the lower hundred.\nStep 4: 720 rounded to the nearest hundred is 700.',
    misconception: 'Students may think the number stays the same when rounding, or confuse rounding with truncating.', source: 'bank' },
  { id: 'bank-3.2C-mc-007', teks: '3.2C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Emerging', representation: 'Symbolic / equation',
    question: 'Round 550 to the nearest hundred.', options: { A: '500', B: '550', C: '600', D: '560' }, correct: 'C',
    explanation: 'Step 1: Find the two hundreds that 550 is between: 500 and 600.\nStep 2: Look at the tens digit. The tens digit is 5.\nStep 3: When the tens digit is exactly 5, we round UP to the next hundred.\nStep 4: 550 rounded to the nearest hundred is 600.',
    misconception: 'Students may not know the rule for exactly 5 — the convention is to round up.', source: 'bank' },
  { id: 'bank-3.2C-mc-008', teks: '3.2C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Word problem',
    question: 'A bakery made 913 cupcakes. About how many is that, rounded to the nearest hundred?', options: { A: '900', B: '910', C: '1,000', D: '920' }, correct: 'A',
    explanation: 'Step 1: Find the two hundreds that 913 is between: 900 and 1,000.\nStep 2: Look at the tens digit. The tens digit is 1.\nStep 3: Since 1 < 5 (less than 5), we round DOWN to the lower hundred.\nStep 4: 913 rounded to the nearest hundred is 900. The bakery made about 900 cupcakes.',
    misconception: 'Students may round to the nearest ten (910) instead of the nearest hundred.', source: 'bank' },
  { id: 'bank-3.2C-mc-009', teks: '3.2C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Round 2,485 to the nearest hundred.', options: { A: '2,400', B: '2,490', C: '2,500', D: '2,000' }, correct: 'C',
    explanation: 'Step 1: Find the two hundreds that 2,485 is between: 2,400 and 2,500.\nStep 2: Look at the tens digit. The tens digit is 8.\nStep 3: Since 8 ≥ 5 (5 or more), we round UP to the next hundred.\nStep 4: 2,485 rounded to the nearest hundred is 2,500.',
    misconception: 'Students may round to the nearest ten or the nearest thousand instead of hundred.', source: 'bank' },
  { id: 'bank-3.2C-mc-010', teks: '3.2C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Proficient', representation: 'Word problem',
    question: 'Jayden says 450 rounds to 400. Mia says it rounds to 500. Who is correct when rounding to the nearest hundred?', options: { A: 'Jayden', B: 'Mia', C: 'Both are correct', D: 'Neither is correct' }, correct: 'B',
    explanation: 'Step 1: Find the two hundreds that 450 is between: 400 and 500.\nStep 2: Look at the tens digit. The tens digit is 5.\nStep 3: When the digit is exactly 5, we follow the convention and round UP.\nStep 4: 450 rounded to the nearest hundred is 500, so Mia is correct. The rule is: 5 or more, round up!',
    misconception: 'Students may think "5 is in the middle, so we round down." The standard convention is to round up at 5.', source: 'bank' },

  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.3H – Compare fractions with same denominator
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'bank-3.3H-mc-001', teks: '3.3H', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Which fraction is greater: 3/8 or 5/8?', options: { A: '3/8', B: '5/8', C: 'They are equal', D: 'Cannot tell' }, correct: 'B',
    explanation: 'Step 1: Both fractions have the same denominator (8). This means each piece is the same size — one-eighth.\nStep 2: When the denominators are the same, compare the numerators (the top numbers).\nStep 3: 5 is greater than 3, so 5/8 has more pieces than 3/8.\nStep 4: 5/8 > 3/8. Think of it like pizza slices: 5 slices is more than 3 slices when they\'re the same size!',
    misconception: 'Students may think smaller numerator means larger fraction.', source: 'bank' },
  { id: 'bank-3.3H-mc-002', teks: '3.3H', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Compare: 2/6 ○ 5/6. What goes in the circle?', options: { A: '>', B: '<', C: '=', D: 'Cannot compare' }, correct: 'B',
    explanation: 'Step 1: Both fractions have the same denominator (6). Each piece is one-sixth of the whole.\nStep 2: Compare the numerators: 2 and 5.\nStep 3: 2 is less than 5, so 2/6 is less than 5/6.\nStep 4: The symbol < (less than) goes in the circle: 2/6 < 5/6. The open end of < points toward the bigger number.',
    misconception: 'Students may reverse the inequality sign.', source: 'bank' },
  { id: 'bank-3.3H-mc-003', teks: '3.3H', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Visual / pictorial',
    question: 'Sam ate 3/4 of a pizza. Mia ate 1/4 of the same size pizza. Who ate more?', options: { A: 'Sam', B: 'Mia', C: 'They ate the same', D: 'Not enough info' }, correct: 'A',
    explanation: 'Step 1: The pizza is cut into 4 equal slices (that\'s what the denominator 4 means).\nStep 2: Sam ate 3 out of 4 slices (3/4). Mia ate 1 out of 4 slices (1/4).\nStep 3: Since both pizzas are the same size and cut into the same number of pieces, compare numerators: 3 > 1.\nStep 4: Sam ate more pizza because 3/4 > 1/4.',
    misconception: 'Students may not connect fractions to real amounts.', source: 'bank' },
  { id: 'bank-3.3H-mc-004', teks: '3.3H', grade: 'grade3', format: 'multiple-choice', difficulty: 'Emerging', representation: 'Symbolic / equation',
    question: 'Which is smaller: 7/10 or 4/10?', options: { A: '7/10', B: '4/10', C: 'They are equal', D: 'Neither' }, correct: 'B',
    explanation: 'Step 1: Both fractions have the same denominator (10). Each piece is one-tenth.\nStep 2: Compare the numerators: 7 and 4.\nStep 3: 4 is less than 7, so 4/10 is the smaller fraction.\nStep 4: 4/10 < 7/10. Fewer pieces of the same size means a smaller amount.',
    misconception: 'Students may think larger numbers are always larger fractions.', source: 'bank' },
  { id: 'bank-3.3H-mc-005', teks: '3.3H', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Put these in order from least to greatest: 5/8, 2/8, 7/8', options: { A: '7/8, 5/8, 2/8', B: '2/8, 5/8, 7/8', C: '5/8, 2/8, 7/8', D: '2/8, 7/8, 5/8' }, correct: 'B',
    explanation: 'Step 1: All three fractions have the same denominator (8), so just compare the numerators.\nStep 2: The numerators are 5, 2, and 7. Order them from smallest to biggest: 2, 5, 7.\nStep 3: Match them back to fractions: 2/8, 5/8, 7/8.\nStep 4: From least to greatest: 2/8, 5/8, 7/8. Remember, "least to greatest" means smallest first!',
    misconception: 'Students may order from greatest to least.', source: 'bank' },

  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.3C – Unit Fractions
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'bank-3.3C-mc-001', teks: '3.3C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Pictorial',
    question: 'A pizza is cut into 4 equal slices. What fraction is ONE slice?', options: { A: '1/2', B: '1/4', C: '4/4', D: '4/1' }, correct: 'B',
    explanation: 'Step 1: The pizza is divided into 4 equal parts.\nStep 2: A unit fraction has a numerator of 1. It means "one part out of the whole."\nStep 3: Since there are 4 equal parts and we are looking at ONE slice, the fraction is 1/4.\nStep 4: The answer is 1/4.',
    misconception: 'Students may confuse the whole (4/4) with one part (1/4).', source: 'bank' },
  { id: 'bank-3.3C-mc-002', teks: '3.3C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Pictorial',
    question: 'A chocolate bar is broken into 8 equal pieces. What fraction is one piece?', options: { A: '1/8', B: '8/1', C: '1/2', D: '8/8' }, correct: 'A',
    explanation: 'Step 1: The bar is divided into 8 equal pieces.\nStep 2: One piece out of 8 equal pieces is written as 1/8.\nStep 3: The numerator (1) tells us how many pieces we have. The denominator (8) tells us how many equal pieces make the whole.\nStep 4: The answer is 1/8.',
    misconception: 'Students may write 8/1 instead of 1/8.', source: 'bank' },
  { id: 'bank-3.3C-mc-003', teks: '3.3C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Pictorial',
    question: 'A pie is cut into 3 equal slices. What fraction represents one slice?', options: { A: '3/1', B: '1/2', C: '1/3', D: '3/3' }, correct: 'C',
    explanation: 'Step 1: The pie is cut into 3 equal slices.\nStep 2: A unit fraction represents ONE part of a whole. It always has 1 as the numerator.\nStep 3: Since the whole has 3 equal parts, one part is 1/3.\nStep 4: The answer is 1/3.',
    misconception: 'Students may say 3/3 (the whole) instead of 1/3 (one part).', source: 'bank' },
  { id: 'bank-3.3C-mc-004', teks: '3.3C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Proficient', representation: 'Word problem',
    question: 'Maria has a ribbon cut into 6 equal pieces. She gives away 1 piece. What fraction did she give away?', options: { A: '1/6', B: '5/6', C: '6/1', D: '1/5' }, correct: 'A',
    explanation: 'Step 1: The ribbon is divided into 6 equal pieces.\nStep 2: Maria gave away 1 piece. We need the fraction for that one piece.\nStep 3: One piece out of 6 is the unit fraction 1/6.\nStep 4: The answer is 1/6.',
    misconception: 'Students may give 5/6 (the remaining pieces) instead of 1/6 (the one given away).', source: 'bank' },
  { id: 'bank-3.3C-mc-005', teks: '3.3C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Proficient', representation: 'Symbolic / equation',
    question: 'Which of these is a unit fraction?', options: { A: '3/4', B: '2/6', C: '1/2', D: '4/4' }, correct: 'C',
    explanation: 'Step 1: A unit fraction always has 1 as the numerator (top number).\nStep 2: Check each option: 3/4 (numerator is 3, not 1), 2/6 (numerator is 2, not 1), 1/2 (numerator is 1 ✔), 4/4 (numerator is 4, not 1).\nStep 3: The only fraction with a numerator of 1 is 1/2.\nStep 4: The answer is 1/2.',
    misconception: 'Students may think any fraction is a unit fraction, or confuse unit fractions with whole numbers.', source: 'bank' },

  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.4A – Add and subtract within 1,000
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'bank-3.4A-mc-001', teks: '3.4A', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is 345 + 278?', options: { A: '613', B: '623', C: '523', D: '633' }, correct: 'B',
    explanation: 'Step 1: Add the ones: 5 + 8 = 13. Write down 3, regroup 1 to the tens column.\nStep 2: Add the tens: 4 + 7 = 11, plus the regrouped 1 = 12. Write down 2, regroup 1 to the hundreds column.\nStep 3: Add the hundreds: 3 + 2 = 5, plus the regrouped 1 = 6. Write down 6.\nStep 4: The answer is 623.',
    misconception: 'Students may forget to regroup when adding.', source: 'bank' },
  { id: 'bank-3.4A-mc-002', teks: '3.4A', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is 802 − 356?', options: { A: '446', B: '456', C: '546', D: '444' }, correct: 'A',
    explanation: 'Step 1: Start with the ones: 2 − 6. We can\'t do that, so regroup from the tens. But the tens digit is 0!\nStep 2: Go to the hundreds: trade 1 hundred from the 8 (now 7). That hundred becomes 10 tens. Now the tens place has 10.\nStep 3: Trade 1 ten from the 10 tens (now 9 tens). The ones place becomes 12. Now: 12 − 6 = 6.\nStep 4: Tens: 9 − 5 = 4. Hundreds: 7 − 3 = 4.\nStep 5: The answer is 446.',
    misconception: 'Students may struggle with regrouping across zeros.', source: 'bank' },
  { id: 'bank-3.4A-mc-003', teks: '3.4A', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Word problem',
    question: 'A store has 463 red apples and 289 green apples. How many apples in all?', options: { A: '742', B: '752', C: '652', D: '842' }, correct: 'B',
    explanation: 'Step 1: "How many in all?" means we ADD: 463 + 289.\nStep 2: Ones: 3 + 9 = 12. Write 2, regroup 1.\nStep 3: Tens: 6 + 8 = 14, plus regrouped 1 = 15. Write 5, regroup 1.\nStep 4: Hundreds: 4 + 2 = 6, plus regrouped 1 = 7. Write 7.\nStep 5: The answer is 752 apples in all.',
    misconception: 'Students may make regrouping errors.', source: 'bank' },
  { id: 'bank-3.4A-mc-004', teks: '3.4A', grade: 'grade3', format: 'multiple-choice', difficulty: 'Proficient', representation: 'Word problem',
    question: 'There were 500 books. 187 were checked out. How many are left?', options: { A: '313', B: '323', C: '413', D: '287' }, correct: 'A',
    explanation: 'Step 1: "How many are left?" means we SUBTRACT: 500 − 187.\nStep 2: Ones: 0 − 7. We can\'t, so regroup. The tens digit is also 0, so go to hundreds.\nStep 3: Trade 1 hundred (500 → 400 + 100). Turn that 100 into 10 tens. Trade 1 ten (10 → 9). The ones become 10.\nStep 4: Ones: 10 − 7 = 3. Tens: 9 − 8 = 1. Hundreds: 4 − 1 = 3.\nStep 5: The answer is 313 books left.',
    misconception: 'Students may add instead of subtract.', source: 'bank' },
  { id: 'bank-3.4A-mc-005', teks: '3.4A', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: '167 + 245 = ?', options: { A: '312', B: '412', C: '402', D: '422' }, correct: 'B',
    explanation: 'Step 1: Add the ones: 7 + 5 = 12. Write 2, regroup 1.\nStep 2: Add the tens: 6 + 4 = 10, plus regrouped 1 = 11. Write 1, regroup 1.\nStep 3: Add the hundreds: 1 + 2 = 3, plus regrouped 1 = 4. Write 4.\nStep 4: The answer is 412.',
    misconception: 'Students may not regroup tens properly.', source: 'bank' },

  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.4F – Multiply up to 10 × 10
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'bank-3.4F-mc-001', teks: '3.4F', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is 7 × 8?', options: { A: '48', B: '54', C: '56', D: '63' }, correct: 'C',
    explanation: 'Step 1: Think of 7 × 8 as 7 groups of 8 (or 8 groups of 7).\nStep 2: One strategy: break 8 into 5 + 3. Then 7 × 5 = 35 and 7 × 3 = 21.\nStep 3: Add them: 35 + 21 = 56.\nStep 4: 7 × 8 = 56. A memory trick: 5, 6, 7, 8 → 56 = 7 × 8!',
    misconception: 'Students commonly confuse 7×8 with 6×8=48 or 7×9=63.', source: 'bank' },
  { id: 'bank-3.4F-mc-002', teks: '3.4F', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is 6 × 9?', options: { A: '45', B: '56', C: '54', D: '63' }, correct: 'C',
    explanation: 'Step 1: Think of 6 × 9 as 6 groups of 9.\nStep 2: Use the 9s trick: 6 × 9 — hold up your 6th finger. Count fingers to the left: 5. Count fingers to the right: 4. The answer is 54!\nStep 3: Or: 6 × 10 = 60, then subtract one group of 6: 60 − 6 = 54.\nStep 4: 6 × 9 = 54.',
    misconception: 'Students may confuse with 6×8 or 7×9.', source: 'bank' },
  { id: 'bank-3.4F-mc-003', teks: '3.4F', grade: 'grade3', format: 'multiple-choice', difficulty: 'Emerging', representation: 'Word problem',
    question: 'There are 4 rows of desks with 5 desks in each row. How many desks are there?', options: { A: '9', B: '20', C: '25', D: '15' }, correct: 'B',
    explanation: 'Step 1: "4 rows with 5 in each" means equal groups — this is multiplication!\nStep 2: Multiply: 4 × 5 = 20.\nStep 3: You can also count: 5 + 5 + 5 + 5 = 20 (repeated addition).\nStep 4: There are 20 desks total. We multiply, not add, when finding totals from equal groups.',
    misconception: 'Students may add instead of multiply.', source: 'bank' },
  { id: 'bank-3.4F-mc-004', teks: '3.4F', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: '8 × 8 = ?', options: { A: '56', B: '72', C: '64', D: '48' }, correct: 'C',
    explanation: 'Step 1: 8 × 8 is a "square" fact — the same number times itself.\nStep 2: Think of it as 8 groups of 8. You can break it up: 8 × 8 = 8 × (4 + 4) = 32 + 32 = 64.\nStep 3: Or use a pattern: 7 × 8 = 56, so 8 × 8 = 56 + 8 = 64.\nStep 4: 8 × 8 = 64. This is a key fact to memorize!',
    misconception: 'Students commonly confuse nearby square facts.', source: 'bank' },
  { id: 'bank-3.4F-mc-005', teks: '3.4F', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is 9 × 7?', options: { A: '56', B: '63', C: '72', D: '54' }, correct: 'B',
    explanation: 'Step 1: 9 × 7 means 9 groups of 7 (or 7 groups of 9).\nStep 2: Use the 9s trick: 9 × 7 — the tens digit is one less than 7 = 6, and digits add to 9: 6 + 3 = 9. So 63!\nStep 3: Or: 10 × 7 = 70, then subtract one group of 7: 70 − 7 = 63.\nStep 4: 9 × 7 = 63.',
    misconception: 'Students often mix up 9×7 with 8×7 or 9×6.', source: 'bank' },

  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.4K – Division facts within 100
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'bank-3.4K-mc-001', teks: '3.4K', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is 36 ÷ 4?', options: { A: '8', B: '9', C: '7', D: '6' }, correct: 'B',
    explanation: 'Step 1: Division asks: "How many groups of 4 fit into 36?" or "4 times what equals 36?"\nStep 2: Think of the related multiplication: 4 × ? = 36.\nStep 3: Count up: 4 × 8 = 32 (too small), 4 × 9 = 36 ✓\nStep 4: 36 ÷ 4 = 9.',
    misconception: 'Students may guess without connecting to multiplication.', source: 'bank' },
  { id: 'bank-3.4K-mc-002', teks: '3.4K', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: '56 ÷ 8 = ?', options: { A: '6', B: '8', C: '7', D: '9' }, correct: 'C',
    explanation: 'Step 1: Ask yourself: "8 times what number equals 56?"\nStep 2: Think through the 8 times table: 8 × 6 = 48 (too small), 8 × 7 = 56 ✓\nStep 3: Since 8 × 7 = 56, that means 56 ÷ 8 = 7.\nStep 4: Multiplication and division are inverse operations — they undo each other!',
    misconception: 'Students may confuse with 48÷8 or 56÷7.', source: 'bank' },
  { id: 'bank-3.4K-mc-003', teks: '3.4K', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Word problem',
    question: 'There are 24 cookies shared equally among 6 friends. How many cookies does each friend get?', options: { A: '3', B: '4', C: '6', D: '5' }, correct: 'B',
    explanation: 'Step 1: "Shared equally" means DIVISION. We divide 24 cookies into 6 equal groups.\nStep 2: Set up the division: 24 ÷ 6 = ?\nStep 3: Think: 6 × ? = 24. Count: 6 × 4 = 24 ✓\nStep 4: Each friend gets 4 cookies. You can check: 4 × 6 = 24. ✓',
    misconception: 'Students may add or subtract instead of dividing.', source: 'bank' },
  { id: 'bank-3.4K-mc-004', teks: '3.4K', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: '45 ÷ 9 = ?', options: { A: '4', B: '6', C: '5', D: '9' }, correct: 'C',
    explanation: 'Step 1: Ask: "9 times what equals 45?"\nStep 2: Use the 9s pattern: 9 × 5 = 45 ✓ (digits of 45 add to 9: 4 + 5 = 9).\nStep 3: So 45 ÷ 9 = 5.\nStep 4: Check: 5 × 9 = 45 ✓',
    misconception: 'Students may not connect to 9×5=45.', source: 'bank' },
  { id: 'bank-3.4K-mc-005', teks: '3.4K', grade: 'grade3', format: 'multiple-choice', difficulty: 'Emerging', representation: 'Symbolic / equation',
    question: '18 ÷ 3 = ?', options: { A: '5', B: '7', C: '6', D: '9' }, correct: 'C',
    explanation: 'Step 1: Ask: "How many groups of 3 fit into 18?" or "3 × ? = 18"\nStep 2: Count by 3s: 3, 6, 9, 12, 15, 18. That\'s 6 jumps!\nStep 3: So 18 ÷ 3 = 6.\nStep 4: Check: 3 × 6 = 18 ✓',
    misconception: 'Students may confuse with 15÷3.', source: 'bank' },

  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.5D – Missing factor / unknown in multiplication
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'bank-3.5D-mc-001', teks: '3.5D', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: '6 × ___ = 42. What is the missing number?', options: { A: '6', B: '7', C: '8', D: '9' }, correct: 'B',
    explanation: 'Step 1: We need to find what number times 6 equals 42.\nStep 2: This is the same as asking: 42 ÷ 6 = ?\nStep 3: Think through the 6 times table: 6 × 6 = 36, 6 × 7 = 42 ✓\nStep 4: The missing number is 7. Multiplication and division are related — use one to find the other!',
    misconception: 'Students may not see this as a division problem.', source: 'bank' },
  { id: 'bank-3.5D-mc-002', teks: '3.5D', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: '___ × 8 = 48. Find the missing number.', options: { A: '5', B: '7', C: '6', D: '8' }, correct: 'C',
    explanation: 'Step 1: We need: ? × 8 = 48. What times 8 gives us 48?\nStep 2: Rewrite as division: 48 ÷ 8 = ?\nStep 3: Think: 8 × 5 = 40 (too small), 8 × 6 = 48 ✓\nStep 4: The missing number is 6. Check: 6 × 8 = 48 ✓',
    misconception: 'Students may not use the inverse relationship.', source: 'bank' },
  { id: 'bank-3.5D-mc-003', teks: '3.5D', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Word problem',
    question: 'Maria arranged 35 stickers into 5 equal rows. How many stickers are in each row?', options: { A: '5', B: '6', C: '7', D: '8' }, correct: 'C',
    explanation: 'Step 1: Maria has 35 stickers total and makes 5 equal rows.\nStep 2: Write it as: 5 × ? = 35, or 35 ÷ 5 = ?\nStep 3: Think: 5 × 7 = 35 ✓\nStep 4: Each row has 7 stickers. Check: 5 rows × 7 stickers = 35 total ✓',
    misconception: 'Students may confuse rows and stickers per row.', source: 'bank' },
  { id: 'bank-3.5D-mc-004', teks: '3.5D', grade: 'grade3', format: 'multiple-choice', difficulty: 'Emerging', representation: 'Symbolic / equation',
    question: '4 × ___ = 20. What goes in the blank?', options: { A: '4', B: '5', C: '6', D: '16' }, correct: 'B',
    explanation: 'Step 1: We need to find: 4 × ? = 20.\nStep 2: Rewrite as: 20 ÷ 4 = ?\nStep 3: Skip count by 4s: 4, 8, 12, 16, 20. It took 5 jumps!\nStep 4: 4 × 5 = 20, so the missing number is 5. (Don\'t subtract: 20 − 4 = 16 is wrong!)',
    misconception: 'Students may add instead of dividing.', source: 'bank' },
  { id: 'bank-3.5D-mc-005', teks: '3.5D', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: '___ × 9 = 81. What is the missing factor?', options: { A: '7', B: '8', C: '9', D: '10' }, correct: 'C',
    explanation: 'Step 1: We need: ? × 9 = 81.\nStep 2: Rewrite as: 81 ÷ 9 = ?\nStep 3: Use the 9s pattern: digits of 81 add to 9 (8+1=9) — that confirms it\'s a multiple of 9. Count: 9 × 9 = 81 ✓\nStep 4: The missing factor is 9. This is a perfect square: 9² = 81!',
    misconception: 'Students may not know 9×9.', source: 'bank' },

  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.5E – Number patterns
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'bank-3.5E-mc-001', teks: '3.5E', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What comes next in this pattern? 5, 10, 15, 20, ___', options: { A: '22', B: '24', C: '25', D: '30' }, correct: 'C',
    explanation: 'Step 1: Find the rule — look at how each number changes: 10 − 5 = 5, 15 − 10 = 5, 20 − 15 = 5.\nStep 2: The rule is "add 5" each time. This is skip counting by 5!\nStep 3: Apply the rule: 20 + 5 = 25.\nStep 4: The next number in the pattern is 25.',
    misconception: 'Students may not identify the "add 5" rule.', source: 'bank' },
  { id: 'bank-3.5E-mc-002', teks: '3.5E', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is the rule for this pattern? 3, 6, 9, 12, 15', options: { A: 'Add 2', B: 'Add 3', C: 'Multiply by 2', D: 'Add 4' }, correct: 'B',
    explanation: 'Step 1: Find the difference between each pair: 6 − 3 = 3, 9 − 6 = 3, 12 − 9 = 3, 15 − 12 = 3.\nStep 2: The difference is always 3. Each number is 3 more than the one before.\nStep 3: The rule is "Add 3." This is the 3 times table: 3, 6, 9, 12, 15!',
    misconception: 'Students may not see the constant difference.', source: 'bank' },
  { id: 'bank-3.5E-mc-003', teks: '3.5E', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Continue the pattern: 2, 4, 8, 16, ___', options: { A: '18', B: '20', C: '24', D: '32' }, correct: 'D',
    explanation: 'Step 1: Check if it\'s "add something": 4 − 2 = 2, 8 − 4 = 4, 16 − 8 = 8. The differences are not the same, so it\'s not addition.\nStep 2: Check multiplication: 2 × 2 = 4, 4 × 2 = 8, 8 × 2 = 16. Each number is doubled (×2)!\nStep 3: Apply the rule: 16 × 2 = 32.\nStep 4: The next number is 32.',
    misconception: 'Students may add instead of multiply.', source: 'bank' },
  { id: 'bank-3.5E-mc-004', teks: '3.5E', grade: 'grade3', format: 'multiple-choice', difficulty: 'Emerging', representation: 'Symbolic / equation',
    question: 'What comes next? 10, 20, 30, 40, ___', options: { A: '45', B: '50', C: '60', D: '42' }, correct: 'B',
    explanation: 'Step 1: Find the difference: 20 − 10 = 10, 30 − 20 = 10, 40 − 30 = 10.\nStep 2: The rule is "add 10" each time. This is counting by tens!\nStep 3: Apply: 40 + 10 = 50.\nStep 4: The next number is 50.',
    misconception: 'Students may add a different number.', source: 'bank' },
  { id: 'bank-3.5E-mc-005', teks: '3.5E', grade: 'grade3', format: 'multiple-choice', difficulty: 'Proficient', representation: 'Word problem',
    question: 'Anna saves $4 each week. After 1 week she has $4, after 2 weeks $8. How much after 5 weeks?', options: { A: '$16', B: '$18', C: '$20', D: '$24' }, correct: 'C',
    explanation: 'Step 1: The pattern is: Week 1 = $4, Week 2 = $8, Week 3 = $12, and so on. She adds $4 each week.\nStep 2: Continue the pattern: Week 3 = $12, Week 4 = $16, Week 5 = $20.\nStep 3: Or use multiplication: $4 per week × 5 weeks = $20.\nStep 4: After 5 weeks, Anna has $20.',
    misconception: 'Students may not extend the pattern correctly.', source: 'bank' },

  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.6C – Area of rectangles
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'bank-3.6C-mc-001', teks: '3.6C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Visual / pictorial',
    question: 'A rectangle is 6 units long and 4 units wide. What is its area?', options: { A: '10 sq units', B: '20 sq units', C: '24 sq units', D: '12 sq units' }, correct: 'C',
    explanation: 'Step 1: Area measures how much space a shape covers. For rectangles: Area = length × width.\nStep 2: The length is 6 and the width is 4.\nStep 3: Multiply: 6 × 4 = 24.\nStep 4: The area is 24 square units. (Don\'t add 6 + 4 = 10 — that\'s only half the perimeter, not the area!)',
    misconception: 'Students may add length + width or compute perimeter.', source: 'bank' },
  { id: 'bank-3.6C-mc-002', teks: '3.6C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Word problem',
    question: 'A garden is 8 feet long and 3 feet wide. How many square feet is the garden?', options: { A: '11 sq ft', B: '22 sq ft', C: '24 sq ft', D: '32 sq ft' }, correct: 'C',
    explanation: 'Step 1: "How many square feet" is asking for the AREA.\nStep 2: Use the formula: Area = length × width = 8 × 3.\nStep 3: 8 × 3 = 24.\nStep 4: The garden is 24 square feet. (If the question asked for perimeter, we would add all sides: 8 + 3 + 8 + 3 = 22, but this asks for area.)',
    misconception: 'Students may confuse area and perimeter formulas.', source: 'bank' },
  { id: 'bank-3.6C-mc-003', teks: '3.6C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Area = length × width. If length = 9 and width = 5, what is the area?', options: { A: '14', B: '40', C: '45', D: '54' }, correct: 'C',
    explanation: 'Step 1: The formula is given: Area = length × width.\nStep 2: Plug in: Area = 9 × 5.\nStep 3: 9 × 5 = 45.\nStep 4: The area is 45 square units. Remember, for area we MULTIPLY (×), not add (+).',
    misconception: 'Students may add instead of multiply.', source: 'bank' },
  { id: 'bank-3.6C-mc-004', teks: '3.6C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Emerging', representation: 'Visual / pictorial',
    question: 'A rectangle made of unit squares has 3 rows and 7 columns. What is the area?', options: { A: '10 sq units', B: '20 sq units', C: '21 sq units', D: '24 sq units' }, correct: 'C',
    explanation: 'Step 1: Count the rows: 3. Count the columns: 7.\nStep 2: You could count every single unit square, OR multiply: 3 rows × 7 columns = 21.\nStep 3: The area is 21 square units.\nStep 4: Multiplying rows by columns is a shortcut for counting every square in the grid!',
    misconception: 'Students may count incorrectly or add.', source: 'bank' },
  { id: 'bank-3.6C-mc-005', teks: '3.6C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Proficient', representation: 'Word problem',
    question: 'A rug covers 48 square feet. It is 8 feet long. How wide is it?', options: { A: '5 feet', B: '6 feet', C: '7 feet', D: '40 feet' }, correct: 'B',
    explanation: 'Step 1: We know: Area = length × width, and Area = 48, length = 8.\nStep 2: So: 48 = 8 × width. We need to find the width.\nStep 3: Divide: width = 48 ÷ 8 = 6.\nStep 4: The rug is 6 feet wide. Check: 8 × 6 = 48 ✓',
    misconception: 'Students may subtract instead of dividing.', source: 'bank' },

  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.7B – Perimeter of polygons
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'bank-3.7B-mc-001', teks: '3.7B', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Visual / pictorial',
    question: 'A rectangle has a length of 8 cm and a width of 5 cm. What is its perimeter?', options: { A: '13 cm', B: '26 cm', C: '40 cm', D: '21 cm' }, correct: 'B',
    explanation: 'Step 1: Perimeter is the distance around the outside of a shape. For a rectangle, add ALL four sides.\nStep 2: A rectangle has 2 lengths and 2 widths: 8 + 5 + 8 + 5.\nStep 3: Add: 8 + 5 = 13, then 13 + 8 = 21, then 21 + 5 = 26.\nStep 4: The perimeter is 26 cm. Shortcut: P = 2 × (length + width) = 2 × (8 + 5) = 2 × 13 = 26.',
    misconception: 'Students may add only two sides or compute area.', source: 'bank' },
  { id: 'bank-3.7B-mc-002', teks: '3.7B', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'A square has sides of 6 inches. What is the perimeter?', options: { A: '12 inches', B: '18 inches', C: '24 inches', D: '36 inches' }, correct: 'C',
    explanation: 'Step 1: A square has 4 equal sides. Each side is 6 inches.\nStep 2: Perimeter = add all sides: 6 + 6 + 6 + 6.\nStep 3: 6 × 4 = 24.\nStep 4: The perimeter is 24 inches. (Don\'t confuse with area: 6 × 6 = 36 is the area, not the perimeter!)',
    misconception: 'Students may multiply only two sides.', source: 'bank' },
  { id: 'bank-3.7B-mc-003', teks: '3.7B', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Word problem',
    question: 'A triangle has sides of 4 cm, 5 cm, and 6 cm. What is the perimeter?', options: { A: '10 cm', B: '15 cm', C: '20 cm', D: '30 cm' }, correct: 'B',
    explanation: 'Step 1: Perimeter means add up ALL the sides of the shape.\nStep 2: A triangle has 3 sides: 4, 5, and 6.\nStep 3: Add them: 4 + 5 + 6 = 15.\nStep 4: The perimeter is 15 cm. For any polygon, perimeter = sum of all side lengths.',
    misconception: 'Students may forget to add all three sides.', source: 'bank' },
  { id: 'bank-3.7B-mc-004', teks: '3.7B', grade: 'grade3', format: 'multiple-choice', difficulty: 'Emerging', representation: 'Visual / pictorial',
    question: 'A rectangle is 10 m long and 3 m wide. What is the perimeter?', options: { A: '13 m', B: '26 m', C: '30 m', D: '16 m' }, correct: 'B',
    explanation: 'Step 1: A rectangle has 2 long sides and 2 short sides.\nStep 2: Add all four: 10 + 3 + 10 + 3 = 26.\nStep 3: Or use the shortcut: P = 2 × (10 + 3) = 2 × 13 = 26.\nStep 4: The perimeter is 26 m. (10 + 3 = 13 is only half the perimeter — you need to go all the way around!)',
    misconception: 'Students may add only L+W without doubling.', source: 'bank' },
  { id: 'bank-3.7B-mc-005', teks: '3.7B', grade: 'grade3', format: 'multiple-choice', difficulty: 'Proficient', representation: 'Word problem',
    question: 'A rectangular park has a perimeter of 40 meters. If the length is 12 meters, what is the width?', options: { A: '8 meters', B: '14 meters', C: '16 meters', D: '28 meters' }, correct: 'A',
    explanation: 'Step 1: Perimeter of a rectangle = 2 × length + 2 × width. We know P = 40 and length = 12.\nStep 2: The two lengths use: 2 × 12 = 24 meters.\nStep 3: That leaves 40 − 24 = 16 meters for the two widths.\nStep 4: Each width = 16 ÷ 2 = 8 meters. Check: 12 + 8 + 12 + 8 = 40 ✓',
    misconception: 'Students may subtract only once instead of solving 2L+2W=P.', source: 'bank' },

  // ══════════════════════════════════════════════════════════════════════════
  // TEKS 3.7C – Elapsed time
  // ══════════════════════════════════════════════════════════════════════════
  { id: 'bank-3.7C-mc-001', teks: '3.7C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Word problem',
    question: 'Soccer practice starts at 3:15 PM and ends at 4:00 PM. How long is practice?', options: { A: '30 minutes', B: '45 minutes', C: '1 hour', D: '15 minutes' }, correct: 'B',
    explanation: 'Step 1: Start time is 3:15 PM. End time is 4:00 PM.\nStep 2: From 3:15 to 3:00 would be going backward 15 min — instead, count forward: 3:15 → 4:15 would be 1 hour.\nStep 3: But we only need to go to 4:00, which is 15 minutes less than 4:15. So: 1 hour − 15 min = 45 min.\nStep 4: Or count by chunks: 3:15 → 3:30 (15 min) → 3:45 (30 min) → 4:00 (45 min). Practice is 45 minutes.',
    misconception: 'Students may subtract only the minutes.', source: 'bank' },
  { id: 'bank-3.7C-mc-002', teks: '3.7C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Word problem',
    question: 'A movie starts at 2:30 PM. It is 1 hour and 45 minutes long. What time does it end?', options: { A: '3:45 PM', B: '4:15 PM', C: '4:00 PM', D: '3:15 PM' }, correct: 'B',
    explanation: 'Step 1: Start at 2:30 PM. Add 1 hour first: 2:30 + 1 hour = 3:30 PM.\nStep 2: Now add 45 minutes: 3:30 + 45 minutes.\nStep 3: 3:30 + 30 min = 4:00 PM. Then 4:00 + 15 min = 4:15 PM. (30 + 15 = 45 minutes)\nStep 4: The movie ends at 4:15 PM. When adding minutes past :60, the hour number goes up by 1.',
    misconception: 'Students may not handle crossing the hour correctly.', source: 'bank' },
  { id: 'bank-3.7C-mc-003', teks: '3.7C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Emerging', representation: 'Word problem',
    question: 'Lunch starts at 11:30 AM and ends at 12:00 PM. How long is lunch?', options: { A: '15 minutes', B: '20 minutes', C: '30 minutes', D: '1 hour' }, correct: 'C',
    explanation: 'Step 1: Start = 11:30 AM. End = 12:00 PM.\nStep 2: Count forward from 11:30: 11:30 → 11:45 (15 min) → 12:00 (30 min).\nStep 3: Lunch is 30 minutes long.\nStep 4: Don\'t be confused by the AM/PM switch — 11:30 AM to 12:00 PM is just 30 minutes, not a whole hour!',
    misconception: 'Students may be confused by AM/PM transition.', source: 'bank' },
  { id: 'bank-3.7C-mc-004', teks: '3.7C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Proficient', representation: 'Word problem',
    question: 'School starts at 8:00 AM and ends at 3:30 PM. How many hours and minutes is the school day?', options: { A: '6 hours 30 minutes', B: '7 hours', C: '7 hours 30 minutes', D: '8 hours' }, correct: 'C',
    explanation: 'Step 1: Count the hours first: 8:00 AM → 12:00 PM = 4 hours. 12:00 PM → 3:00 PM = 3 hours. Total hours: 4 + 3 = 7 hours.\nStep 2: Now add the leftover minutes: we ended at 3:00, but school goes to 3:30 — that\'s 30 more minutes.\nStep 3: Total: 7 hours + 30 minutes = 7 hours 30 minutes.\nStep 4: The school day is 7 hours and 30 minutes long.',
    misconception: 'Students may miscalculate across noon.', source: 'bank' },
  { id: 'bank-3.7C-mc-005', teks: '3.7C', grade: 'grade3', format: 'multiple-choice', difficulty: 'Developing', representation: 'Word problem',
    question: 'It takes Jake 25 minutes to walk to school. If he leaves at 7:40 AM, what time does he arrive?', options: { A: '8:00 AM', B: '8:05 AM', C: '7:65 AM', D: '8:15 AM' }, correct: 'B',
    explanation: 'Step 1: Start time = 7:40 AM. Add 25 minutes.\nStep 2: 7:40 + 20 minutes = 8:00 AM (that uses 20 of the 25 minutes).\nStep 3: 8:00 + 5 minutes = 8:05 AM (the remaining 5 minutes).\nStep 4: Jake arrives at 8:05 AM. Remember: there\'s no such time as "7:65" — after 7:59 comes 8:00!',
    misconception: 'Students may add minutes past 60 without converting to a new hour.', source: 'bank' },

  // ══════════════════════════════════════════════════════════════════════════
  // ALGEBRA I – TEKS-aligned seed questions
  // ══════════════════════════════════════════════════════════════════════════

  // ── A.3A – Slope (Multiple Choice) ──
  {
    id: 'bank-A.3A-mc-001', teks: 'A.3A', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is the slope of the line through (1, 2) and (4, 11)?',
    options: { A: '3', B: '9', C: '1/3', D: '−3' }, correct: 'A',
    explanation: 'Step 1: Use the slope formula: m = (y₂ − y₁)/(x₂ − x₁).\nStep 2: Label points: (x₁, y₁) = (1, 2) and (x₂, y₂) = (4, 11).\nStep 3: Calculate the rise (change in y): 11 − 2 = 9.\nStep 4: Calculate the run (change in x): 4 − 1 = 3.\nStep 5: Divide: m = (9)/(3) = 3. The slope is 3.',
    misconception: 'Students may forget to divide rise by run and just report the rise (9).', source: 'bank',
  },
  {
    id: 'bank-A.3A-mc-002', teks: 'A.3A', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is the slope of y = −2x + 7?',
    options: { A: '7', B: '−2', C: '2', D: '−7' }, correct: 'B',
    explanation: 'Step 1: This is in slope-intercept form: y = mx + b, where m is the slope and b is the y-intercept.\nStep 2: Compare: y = −2x + 7 matches y = mx + b.\nStep 3: The coefficient of x is −2, so m = −2.\nStep 4: The slope is −2. (The 7 is the y-intercept, not the slope!)',
    misconception: 'Students may confuse the y-intercept (7) with the slope.', source: 'bank',
  },
  {
    id: 'bank-A.3A-mc-003', teks: 'A.3A', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Proficient', representation: 'Symbolic / equation',
    question: 'A line passes through (−2, 5) and (−2, 9). What is its slope?',
    options: { A: '0', B: '4', C: 'Undefined', D: '−4' }, correct: 'C',
    explanation: 'Step 1: Use slope formula: m = (y₂ − y₁)/(x₂ − x₁).\nStep 2: Rise = 9 − 5 = 4. Run = −2 − (−2) = 0.\nStep 3: m = (4)/(0). Division by zero is UNDEFINED.\nStep 4: Both points have x = −2, so this is a VERTICAL line. Vertical lines have undefined slope. (Horizontal lines have slope 0 — don\'t mix them up!)',
    misconception: 'Students may say slope is 0 for a vertical line instead of undefined.', source: 'bank',
  },

  // ── A.5A – Solve Linear Equations (Multiple Choice) ──
  {
    id: 'bank-A.5A-mc-001', teks: 'A.5A', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Solve: 3(x − 4) = 15',
    options: { A: 'x = 9', B: 'x = 7', C: 'x = 3', D: 'x = 19/3' }, correct: 'A',
    explanation: 'Step 1: Distribute the 3: 3 · x − 3 · 4 = 15 → 3x − 12 = 15.\nStep 2: Add 12 to both sides: 3x = 15 + 12 = 27.\nStep 3: Divide both sides by 3: x = 27 / 3 = 9.\nStep 4: Check: 3(9 − 4) = 3(5) = 15 ✓',
    misconception: 'Students may forget to distribute the 3 and solve x − 4 = 15 → x = 19.', source: 'bank',
  },
  {
    id: 'bank-A.5A-mc-002', teks: 'A.5A', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Proficient', representation: 'Symbolic / equation',
    question: 'Solve: 5x + 3 = 2x − 9',
    options: { A: 'x = −4', B: 'x = 4', C: 'x = −2', D: 'x = 2' }, correct: 'A',
    explanation: 'Step 1: Get all x terms on one side. Subtract 2x from both sides: 5x − 2x + 3 = −9 → 3x + 3 = −9.\nStep 2: Subtract 3 from both sides: 3x = −9 − 3 = −12.\nStep 3: Divide by 3: x = −12 / 3 = −4.\nStep 4: Check: 5(−4) + 3 = −20 + 3 = −17. And 2(−4) − 9 = −8 − 9 = −17. ✓',
    misconception: 'Students may incorrectly combine like terms when variables are on both sides.', source: 'bank',
  },

  // ── A.8A – Solve Quadratics (Multiple Choice) ──
  {
    id: 'bank-A.8A-mc-001', teks: 'A.8A', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Solve by factoring: x² + 5x + 6 = 0',
    options: { A: 'x = −2 and x = −3', B: 'x = 2 and x = 3', C: 'x = −1 and x = −6', D: 'x = 1 and x = 6' }, correct: 'A',
    explanation: 'Step 1: Factor x² + 5x + 6. Find two numbers that multiply to 6 AND add to 5.\nStep 2: Try pairs: 1 × 6 = 6, 1 + 6 = 7 ✗. Try 2 × 3 = 6, 2 + 3 = 5 ✓\nStep 3: Factor: (x + 2)(x + 3) = 0.\nStep 4: Set each factor = 0: x + 2 = 0 → x = −2. x + 3 = 0 → x = −3.\nStep 5: Solutions: x = −2 and x = −3. The signs flip because we set (x + number) = 0.',
    misconception: 'Students may find factors of 6 but forget to negate them.', source: 'bank',
  },
  {
    id: 'bank-A.8A-mc-002', teks: 'A.8A', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Proficient', representation: 'Symbolic / equation',
    question: 'Solve: x² − 16 = 0',
    options: { A: 'x = 4 only', B: 'x = ±4', C: 'x = ±8', D: 'x = 16' }, correct: 'B',
    explanation: 'Step 1: Recognize this as a difference of squares: x² − 16 = x² − 4².\nStep 2: Factor: (x + 4)(x − 4) = 0.\nStep 3: Set each factor = 0: x + 4 = 0 → x = −4. x − 4 = 0 → x = 4.\nStep 4: Or: move 16 over: x² = 16. Take the square root of both sides: x = ±√16 = ±4.\nStep 5: Both x = 4 and x = −4 are solutions. Always check for ± with square roots!',
    misconception: 'Students may only find the positive root and forget the negative one.', source: 'bank',
  },

  // ── A.10E – Factor Trinomials (Multiple Choice) ──
  {
    id: 'bank-A.10E-mc-001', teks: 'A.10E', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Factor: x² − 7x + 12',
    options: { A: '(x − 3)(x − 4)', B: '(x + 3)(x + 4)', C: '(x − 2)(x − 6)', D: '(x + 3)(x − 4)' }, correct: 'A',
    explanation: 'Step 1: For x² − 7x + 12, find two numbers that multiply to +12 AND add to −7.\nStep 2: Since the product is positive (+12) and the sum is negative (−7), BOTH numbers must be negative.\nStep 3: Try: (−3) × (−4) = +12 ✓ and (−3) + (−4) = −7 ✓\nStep 4: Factor: (x − 3)(x − 4). Check by FOIL: x² − 4x − 3x + 12 = x² − 7x + 12 ✓',
    misconception: 'Students may get the signs wrong, especially when both factors are negative.', source: 'bank',
  },

  // ── A.11B – Exponent Laws (Multiple Choice) ──
  {
    id: 'bank-A.11B-mc-001', teks: 'A.11B', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Simplify: x⁴ · x³',
    options: { A: 'x⁷', B: 'x¹²', C: 'x¹', D: '2x⁷' }, correct: 'A',
    explanation: 'Step 1: When multiplying powers with the same base, ADD the exponents. This is the Product Rule: xᵃ · xᵇ = xᵃ⁺ᵇ.\nStep 2: x⁴ · x³ = x⁴⁺³ = x⁷.\nStep 3: Think of it this way: x⁴ means (x·x·x·x) and x³ means (x·x·x). Together: x·x·x·x·x·x·x = x⁷.\nStep 4: Remember: multiply bases → ADD exponents. Don\'t multiply the exponents (4 × 3 = 12 is wrong here).',
    misconception: 'Students may multiply exponents instead of adding them.', source: 'bank',
  },
  {
    id: 'bank-A.11B-mc-002', teks: 'A.11B', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Proficient', representation: 'Symbolic / equation',
    question: 'Simplify: (x³)²',
    options: { A: 'x⁵', B: 'x⁶', C: 'x⁹', D: '2x³' }, correct: 'B',
    explanation: 'Step 1: When raising a power to a power, MULTIPLY the exponents. This is the Power Rule: (xᵃ)ᵇ = xᵃ·ᵇ.\nStep 2: (x³)² = x³ˣ² = x⁶.\nStep 3: Think of it as: (x³)² = x³ · x³ = x³⁺³ = x⁶.\nStep 4: Power of a power → MULTIPLY exponents. Don\'t add them (3 + 2 = 5 is wrong here).',
    misconception: 'Students may add exponents instead of multiplying for the power rule.', source: 'bank',
  },

  // ── A.7A – Quadratic Key Attributes (Multiple Choice) ──
  {
    id: 'bank-A.7A-mc-001', teks: 'A.7A', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'What is the vertex of y = (x − 3)² + 1?',
    options: { A: '(3, 1)', B: '(−3, 1)', C: '(3, −1)', D: '(1, 3)' }, correct: 'A',
    explanation: 'Step 1: Vertex form is y = a(x − h)² + k, where the vertex is (h, k).\nStep 2: Compare: y = (x − 3)² + 1 matches y = (x − h)² + k.\nStep 3: h = 3 (note: it\'s x − 3, so h is positive 3, not −3!) and k = 1.\nStep 4: The vertex is (3, 1). Remember: the sign inside the parentheses is OPPOSITE to the h value.',
    misconception: 'Students often negate the h value incorrectly, getting (−3, 1).', source: 'bank',
  },

  // ── A.5C – Systems of Equations (Multiple Choice) ──
  {
    id: 'bank-A.5C-mc-001', teks: 'A.5C', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'Solve the system: y = x + 1 and y = 2x − 3. What is x?',
    options: { A: '4', B: '2', C: '5', D: '−2' }, correct: 'A',
    explanation: 'Step 1: Both equations equal y, so set them equal to each other: x + 1 = 2x − 3.\nStep 2: Subtract x from both sides: 1 = x − 3.\nStep 3: Add 3 to both sides: 4 = x, so x = 4.\nStep 4: Check: y = 4 + 1 = 5. And y = 2(4) − 3 = 8 − 3 = 5. Both give y = 5 ✓',
    misconception: 'Students may substitute incorrectly or solve for y instead of x.', source: 'bank',
  },

  // ── A.12B – Function Notation (Multiple Choice) ──
  {
    id: 'bank-A.12B-mc-001', teks: 'A.12B', grade: 'algebra', format: 'multiple-choice',
    difficulty: 'Developing', representation: 'Symbolic / equation',
    question: 'If f(x) = 3x − 5, what is f(4)?',
    options: { A: '7', B: '12', C: '17', D: '−2' }, correct: 'A',
    explanation: 'Step 1: f(4) means "plug in 4 for x" in the function f(x) = 3x − 5.\nStep 2: Replace every x with 4: f(4) = 3(4) − 5.\nStep 3: Multiply first: 3 × 4 = 12.\nStep 4: Subtract: 12 − 5 = 7.\nStep 5: f(4) = 7. Function notation f(4) just means "evaluate at x = 4."',
    misconception: 'Students may substitute but forget to subtract 5 from the product.', source: 'bank',
  },

  // ── Algebra I True/False ──
  {
    id: 'bank-A.3A-tf-001', teks: 'A.3A', grade: 'algebra', format: 'true-false',
    difficulty: 'Developing', representation: 'Symbolic / equation',
    statement: 'The slope of a horizontal line is 0.',
    correct: true,
    explanation: 'A horizontal line has no vertical change (rise = 0), so slope = 0/run = 0.', source: 'bank',
  },
  {
    id: 'bank-A.3A-tf-002', teks: 'A.3A', grade: 'algebra', format: 'true-false',
    difficulty: 'Developing', representation: 'Symbolic / equation',
    statement: 'The slope of a vertical line is 0.',
    correct: false,
    explanation: 'A vertical line has undefined slope because the run is 0 (division by zero).', source: 'bank',
  },
  {
    id: 'bank-A.11B-tf-001', teks: 'A.11B', grade: 'algebra', format: 'true-false',
    difficulty: 'Developing', representation: 'Symbolic / equation',
    statement: 'x⁰ = 0 for any nonzero value of x.',
    correct: false,
    explanation: 'Any nonzero number raised to the 0 power equals 1, not 0.', source: 'bank',
  },
  {
    id: 'bank-A.8A-tf-001', teks: 'A.8A', grade: 'algebra', format: 'true-false',
    difficulty: 'Proficient', representation: 'Symbolic / equation',
    statement: 'The equation x² = −9 has real solutions.',
    correct: false,
    explanation: 'No real number squared gives a negative result. This equation has no real solutions.', source: 'bank',
  },
];

// ─── localStorage persistence layer ────────────────────────────────────────

const STORAGE_KEY = 'allen-ace-test-bank';

/** Load the full bank: seed + any teacher-added questions */
export const loadBank = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const extras = stored ? JSON.parse(stored) : [];
    // Merge: seed always present, extras appended (dedup by id)
    const ids = new Set(SEED_QUESTIONS.map((q) => q.id));
    const merged = [...SEED_QUESTIONS];
    extras.forEach((q) => { if (!ids.has(q.id)) { merged.push(q); ids.add(q.id); } });
    return merged;
  } catch {
    return [...SEED_QUESTIONS];
  }
};

/** Save teacher-added questions (only the extras, not the seed) */
export const saveExtras = (allQuestions) => {
  const seedIds = new Set(SEED_QUESTIONS.map((q) => q.id));
  const extras = allQuestions.filter((q) => !seedIds.has(q.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(extras));
};

/** Add one or more questions to the bank */
export const addToBank = (newQuestions) => {
  const bank = loadBank();
  const ids = new Set(bank.map((q) => q.id));
  const toAdd = (Array.isArray(newQuestions) ? newQuestions : [newQuestions])
    .filter((q) => !ids.has(q.id));
  if (toAdd.length === 0) return bank;
  const updated = [...bank, ...toAdd];
  saveExtras(updated);
  return updated;
};

/** Remove a question by id */
export const removeFromBank = (questionId) => {
  const bank = loadBank().filter((q) => q.id !== questionId);
  saveExtras(bank);
  return bank;
};

// ─── Query helpers ─────────────────────────────────────────────────────────

/** Get questions matching filters. Any filter can be null/'' to skip. */
export const queryBank = ({ teks, grade, format, difficulty, representation, limit } = {}) => {
  let results = loadBank();
  if (teks) results = results.filter((q) => q.teks === teks);
  if (grade) results = results.filter((q) => q.grade === grade);
  if (format) results = results.filter((q) => q.format === format);
  if (difficulty) results = results.filter((q) => q.difficulty === difficulty);
  if (representation && representation !== 'Mixed') {
    results = results.filter((q) => q.representation === representation || q.representation === 'Mixed');
  }
  // Shuffle for variety
  results = results.sort(() => Math.random() - 0.5);
  if (limit && limit > 0) results = results.slice(0, limit);
  return results;
};

/** Get available TEKS codes that have banked questions */
export const getBankedTeks = () => {
  const bank = loadBank();
  const map = {};
  bank.forEach((q) => {
    if (!map[q.teks]) map[q.teks] = { teks: q.teks, count: 0, formats: new Set() };
    map[q.teks].count++;
    map[q.teks].formats.add(q.format);
  });
  return Object.values(map).map((e) => ({ ...e, formats: [...e.formats] }));
};

/** Get stats about the bank */
export const getBankStats = () => {
  const bank = loadBank();
  const teksSet = new Set(bank.map((q) => q.teks));
  const formatCounts = {};
  bank.forEach((q) => { formatCounts[q.format] = (formatCounts[q.format] || 0) + 1; });
  return {
    total: bank.length,
    seedCount: SEED_QUESTIONS.length,
    savedCount: bank.length - SEED_QUESTIONS.length,
    teksCount: teksSet.size,
    teksList: [...teksSet].sort(),
    formatCounts,
  };
};

// ─── Practice-loop helpers ──────────────────────────────────────────────────

const RESULTS_KEY = 'allen-ace-practice-results';

/** Map a TEKS code to its concept identifier (the TEKS code itself). */
export const getConceptId = (teks) => (teks ? String(teks) : null);

/** Return stored lecture content for a TEKS (placeholder — no lectures stored yet). */
export const getLecture = (teks) => {
  if (!teks) return null;
  const bank = loadBank();
  const q = bank.find((item) => item.teks === teks && item.lecture);
  return q ? q.lecture : null;
};

/** Persist a practice result for spaced-repetition tracking. */
export const recordResult = (conceptId, { correct, time, gameId } = {}) => {
  if (!conceptId) return;
  try {
    const stored = localStorage.getItem(RESULTS_KEY);
    const results = stored ? JSON.parse(stored) : [];
    results.push({ conceptId, correct: !!correct, time: time || 0, gameId: gameId || '', ts: Date.now() });
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  } catch { /* quota exceeded — silently skip */ }
};
