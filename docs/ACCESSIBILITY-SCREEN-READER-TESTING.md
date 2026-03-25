# Screen-Reader Testing Guide

Spot-check critical paths with **NVDA** (Windows) or **VoiceOver** (Mac) to ensure keyboard and screen-reader users can complete key tasks. Run these checks after any major UI change to the flows below.

---

## 1. Setting Up

### NVDA (Windows)

- **Download:** [nvaccess.org/download](https://www.nvaccess.org/download/)
- **Start:** Run NVDA; it will start reading. Use **Ctrl** to pause/resume.
- **Navigate:** **Tab** (next focusable), **Shift+Tab** (previous). **Arrow keys** in lists/buttons.
- **Read current:** **Insert + Down Arrow** (or **NVDA + Down**). **Insert + F5** (elements list).

### VoiceOver (Mac)

- **Enable:** **Cmd + F5** (or System Settings → Accessibility → VoiceOver).
- **Navigate:** **VO + Right/Left** (next/previous item). **Tab** moves by focusable elements.
- **Interact with group:** **VO + Shift + Down** (e.g. enter a table or list); **VO + Shift + Up** to exit.
- **Stop reading:** **Ctrl**.

---

## 2. Critical Path 1: Take Assessment

**URL (example):** `/assessment/:assessmentId` (use a published assessment from your class).

### Steps to test

1. Open the assessment start page (title, description, question count, time limit, **Begin Assessment** button).
2. **Tab** through the page. You should hear:
   - The page title (e.g. “Assessment title” as heading).
   - “Begin Assessment” or “Retake Assessment” button.
   - If there are previous attempts, their list (heading and attempt rows).
3. Activate **Begin Assessment**. The page should move to the first question.
4. You should hear:
   - A **live announcement** or heading indicating “Question 1 of N” (or the current question).
   - The question text (heading or main content).
   - The **timer** (e.g. “Time remaining: 5:00”) if the assessment is timed.
   - Answer controls (multiple choice buttons, text field, etc.) with clear labels.
5. **Tab** through the question area: answer options, **Flag for Review**, **Previous**, **Next** / **Submit**.
6. Use **Next** to go to question 2. The **question position** should be announced or clearly readable (e.g. “Question 2 of 10”).
7. Open the **question grid** in the sidebar. Each button should announce “Question N”, “answered” if done, “flagged” if flagged.
8. Submit the assessment. You should hear the **results** (e.g. “Passed” or “Keep Practicing”) and score.

### Pass criteria

- [ ] Page has a clear heading (assessment title or “Question N of M”).
- [ ] All interactive elements (buttons, links, inputs) are reachable by Tab and have an accessible name.
- [ ] Question changes are announced (live region or heading update).
- [ ] Timer (if present) is announced (e.g. `role="timer"` / `aria-label`).
- [ ] Results screen is announced (heading and score).

---

## 3. Critical Path 2: Join Class

**URL:** `/student` (not yet joined, or after “Leave” so the join screen shows).

### Steps to test

1. On the student landing page, **Tab** to the main content. You should hear the “Join your class” heading (or equivalent) and the **Class code** label and edit field.
2. **Tab** to the **Your name** (or “Nickname”) label and edit field.
3. Enter a class code (e.g. from your teacher class) and a name. **Tab** to **Join class** and activate it.
4. If the code is **invalid**, an **error message** should be announced immediately (e.g. “Invalid class code” or “Class not found”). The message should have `role="alert"` so it’s read without the user moving focus.
5. If the code is **valid**, you should land on the student dashboard and hear the class name and a clear heading (e.g. “Hey, [name]!” or the first tab panel).

### Pass criteria

- [ ] Form has a clear region/heading (“Join your class” or similar).
- [ ] “Class code” and “Your name” inputs have visible labels that are associated (e.g. `label` + `id` / `aria-label`).
- [ ] Submit button has an accessible name (“Join class” or equivalent).
- [ ] Error message is announced automatically when join fails (`role="alert"` or live region).
- [ ] After success, focus or heading indicates the dashboard (e.g. class name, first tab).

---

## 4. Critical Path 3: View Grades

**URL:** `/student-grades` or `/student-grades/:classId` (as a student who has grades).

### Steps to test

1. Open the grades page. You should hear the **page heading** (e.g. “My Grades” or the class name as **h1**).
2. If there are **multiple classes**, a **dropdown** (“Select class” or class name) should be focusable and announce its label and selected option.
3. **Tab** through the **summary cards** (Overall average, Total assignments, Completed, Missing). Each card should have a clear label and value (e.g. “Overall average, 85%”).
4. **Tab** to the **category filter** (if present). It should announce its purpose (e.g. “Filter by category”, “All categories”).
5. The **assignments table** should be navigable:
   - **Table caption or region label** (e.g. “All assignments”) so the user knows what the table is.
   - **Column headers** (Assignment, Category, Due date, Score, Grade, Status) announced when moving by cell (e.g. `scope="col"` and/or `headers`).
   - Row content (assignment name, category, date, score, grade, status) read in a logical order.

### Pass criteria

- [ ] Page has one main heading (h1) for the grades view.
- [ ] Class selector has an accessible name (e.g. “Select class”).
- [ ] Summary cards are labeled (not only icons).
- [ ] Assignments table has a caption or `aria-label` describing it.
- [ ] Table headers are properly associated (`scope="col"` or `id`/`headers`) so cells are announced with their column.

---

## 5. Quick Checklist (All Paths)

- [ ] **Skip link:** From the top of the page, one Tab should focus “Skip to main content” (or equivalent); activating it moves focus to main content.
- [ ] **Focus visible:** When moving by Tab, the focused element always shows a visible focus ring (no `outline: none` overriding `:focus-visible`).
- [ ] **No focus traps:** In modals or steps, Tab cycles through focusable elements and doesn’t leave the user stuck (unless intentional, e.g. modal trap with Escape to close).
- [ ] **Headings:** Each view has a logical heading (h1 for page, h2 for sections). No skipped levels (e.g. h1 → h3).

---

## 6. When to Re-run

- After changing layout or labels on **Take Assessment**, **Student join**, or **Student grades**.
- After adding new question types or controls to assessments.
- After changing the student dashboard or navigation (tabs, sidebar).
- Before a release or demo that emphasizes accessibility.

---

*For automated checks, use the built-in **Accessibility audit** at `/accessibility-audit`. This guide covers manual screen-reader checks that automation cannot fully replace.*
