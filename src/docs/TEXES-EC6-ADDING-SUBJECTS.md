# Adding Other EC-6 Core Subjects (ELA, Science, Social Studies)

The app currently has **only the Mathematics section** of TExES Core Subjects EC-6 (291). This doc explains how to add English Language Arts and Reading, Science, Social Studies, and (optionally) Fine Arts, Health, PE.

---

## Where the math content came from

- **Competency/domain structure** – Aligned to the official TExES Core Subjects EC-6 (291) test framework. Get the current domains and weights from:
  - **Texas Education Agency (TEA) / NES Inc.:** https://www.tx.nesinc.com → select Core Subjects EC–6 (291) and open the test framework (PDF).
- **Question content** – The EC-6 math questions in this repo were written to match that framework (content + pedagogy). For other subjects you can:
  - Use the same framework PDF to define domains and write your own items, or
  - Use licensed question banks that align to the same competencies.

---

## How the math section is wired

1. **Data** (`src/data/texes-questions.js`):
   - `TEXES_DOMAINS_EC6` – array of `{ id, name, desc, weight, games? }` (one per competency).
   - `TEXES_QUESTIONS_EC6` – array of `{ id, comp, type: 'mc'|'multi', difficulty: 1|2, q, choices, answer, explanation }` with `comp` matching a domain `id`.
   - `TEXES_TEST_CONFIG.ec6` – `totalQuestions`, `timeMinutes`, `passingScore`, `categoryDistribution` (comp id → number of questions).

2. **App** (`src/pages/TexesPrep.jsx`):
   - `EXAM_OPTIONS` includes `{ id: 'ec6', label: 'EC–6 (Math)', examLabel: '...', questions, domains }`.
   - `getQuestionsForExam(examId)` returns `TEXES_QUESTIONS_EC6` when `examId === 'ec6'`.
   - `getDomainsForExam(examId)` returns `TEXES_DOMAINS_EC6` when `examId === 'ec6'`.
   - Full test, competency drills, and adaptive practice all use these.

---

## How to add another subject (e.g. EC-6 ELA)

### 1. Get the official structure

- From the **Core Subjects EC-6 (291)** framework on tx.nesinc.com, note:
  - Domains/competencies for **English Language Arts and Reading** (and their weights).
  - Approximate number of questions and time for that section.

### 2. Add data in `src/data/texes-questions.js`

- Define domains, e.g.:
  - `TEXES_DOMAINS_EC6_ELA` – same shape as `TEXES_DOMAINS_EC6` (e.g. `id: 'ec6_ela_1'`, `name`, `desc`, `weight`).
- Define questions:
  - `TEXES_QUESTIONS_EC6_ELA` – same shape as `TEXES_QUESTIONS_EC6`; each question has `comp` equal to one of the ELA domain ids.
- Add config:
  - In `TEXES_TEST_CONFIG`, add e.g. `ec6_ela: { totalQuestions, timeMinutes, passingScore, categoryDistribution }` (map each comp id to question count).

### 3. Wire a new “exam” in `TexesPrep.jsx`

- Add an exam option, e.g.:
  - `{ id: 'ec6_ela', label: 'EC–6 (ELA)', examLabel: 'Core Subjects EC–6 • ELA', questions: N, domains: M }`.
- In `getQuestionsForExam(examId)`:
  - if `examId === 'ec6_ela'` return `TEXES_QUESTIONS_EC6_ELA`.
- In `getDomainsForExam(examId)`:
  - if `examId === 'ec6_ela'` return `TEXES_DOMAINS_EC6_ELA`.
- No other changes needed: full test, drills, adaptive practice, results, and timer already use `examId`, so they will work for `ec6_ela` once the data and two getters are in place.

### 4. Repeat for Science and Social Studies

- Same pattern: new domain arrays, new question arrays, new `TEXES_TEST_CONFIG` entries, new `EXAM_OPTIONS` entry, and two branches in `getQuestionsForExam` / `getDomainsForExam` (e.g. `ec6_science`, `ec6_social_studies`).

---

## Optional: one “EC-6” entry with subject selector

Instead of separate top-level exam buttons (EC-6 Math, EC-6 ELA, …), you could:

- Keep a single **“Core Subjects EC-6”** option that, when selected, shows a **subject dropdown** (Math, ELA, Science, Social Studies).
- Setting the dropdown updates an internal `ec6Subject` (e.g. `'math' | 'ela' | 'science' | 'social'`) and the effective `examId` becomes `ec6_math`, `ec6_ela`, etc., with the same data and getters as above.

---

## Summary

- **Source for frameworks and competencies:** TEA / NES (tx.nesinc.com) for Core Subjects EC-6 (291); use the same for Math 7–12 and Math 4–8.
- **Math content in this repo:** Written to match that EC-6 math framework; no external question bank was referenced in code.
- **Adding other EC-6 subjects:** Add domains + questions + config in `texes-questions.js`, then add one exam id per subject and wire it in `getQuestionsForExam` and `getDomainsForExam` in `TexesPrep.jsx`; the rest of the prep flow (including adaptive) will work for each new subject.
