# Math 7-12 Loop Audit Sheet (Tiles + Competencies)

Scope audited: `math712` loops (`c001`–`c022`) in `PracticeLoop`, loop quizzes, loop videos, loop interactive activities, and loop games (`q-blocks`, `math-match`, `math-bingo`, `math-jeopardy`).

## 1) 21-Tile Loop Checklist (Load + Topic Scope)

| Tile | Phase | Component Path | Load Status | Topic Scope Status | Notes |
|---|---|---|---|---|---|
| 1 | Diagnostic Quiz | `PracticeLoop` quiz phase | PASS | PASS | Uses scoped quiz pool chain; no unrelated fallback in strict loop mode. |
| 2 | Video A | `PracticeLoop` video phase | PASS | PASS | Scoped video logic prevents sibling-standard leakage for math loops. |
| 3 | Check Quiz 1 | `PracticeLoop` quiz phase | PASS | PASS | Scoped to loop standard/competency question pool. |
| 4 | Game A | `GamePhase` -> game URL | PASS | WARN | Loads reliably; topic depth depends on game bank granularity (std vs competency). |
| 5 | Check Quiz 2 | `PracticeLoop` quiz phase | PASS | PASS | Scoped quiz pool. |
| 6 | Interactive A | `ActivityPhase` | PASS | WARN | Alignment is strong for `comp001/comp002`; broader for `comp003-006`. |
| 7 | Check Quiz 3 | `PracticeLoop` quiz phase | PASS | PASS | Scoped quiz pool. |
| 8 | Concept Reminder | `concept-refresh` phase | PASS | PASS | Uses competency/standard reminder content. |
| 9 | Check Quiz 4 | `PracticeLoop` quiz phase | PASS | PASS | Scoped quiz pool. |
| 10 | Game B | `GamePhase` -> game URL | PASS | WARN | Same as Tile 4 scope caveat. |
| 11 | Check Quiz 5 | `PracticeLoop` quiz phase | PASS | PASS | Scoped quiz pool. |
| 12 | Interactive B | `ActivityPhase` | PASS | WARN | Same activity scope caveat as Tile 6. |
| 13 | Check Quiz 6 | `PracticeLoop` quiz phase | PASS | PASS | Scoped quiz pool. |
| 14 | Video B | `PracticeLoop` video-2 phase | PASS | PASS | Deep-dive fallback now keeps loop-relevant source. |
| 15 | Check Quiz 7 | `PracticeLoop` quiz phase | PASS | PASS | Scoped quiz pool. |
| 16 | Game C | `GamePhase` -> game URL | PASS | WARN | Same as Tile 4 scope caveat. |
| 17 | Check Quiz 8 | `PracticeLoop` quiz phase | PASS | PASS | Scoped quiz pool. |
| 18 | Interactive C | `ActivityPhase` | PASS | WARN | Same activity scope caveat as Tile 6. |
| 19 | Game D | `GamePhase` -> game URL | PASS | WARN | Same as Tile 4 scope caveat. |
| 20 | Readiness Quiz | `PracticeLoop` readiness phase | PASS | PASS | Scoped quiz pool + gating logic. |
| 21 | Mastery Test | `PracticeLoop` mastery phase | PASS | PASS | Scoped mastery pool and completion logic. |

## 2) Competency-by-Competency Sheet (`c001`–`c022`)

Legend:
- Quiz map refs = count of `STANDARD_MAP` references found in `texes-questions`.
- Video = lecture entry exists in `lectures.js`.
- Game scope = strictness of topic alignment inside loop games.
- Feedback = whether end-of-game tutoring review is present.
- Interactive alignment = how specifically activity modes target the standard.

| Standard | Domain | Quiz Map Refs | Video | Game Scope | Game Feedback | Interactive Alignment | Status |
|---|---|---:|---|---|---|---|---|
| c001 | comp001 | 4 | PASS | PARTIAL | PASS | STRONG | WARN |
| c002 | comp001 | 2 | PASS | PARTIAL | PASS | STRONG | WARN |
| c003 | comp001 | 2 | PASS | PARTIAL | PASS | STRONG | WARN |
| c004 | comp002 | 2 | PASS | PARTIAL | PASS | STRONG | WARN |
| c005 | comp002 | 2 | PASS | PARTIAL | PASS | STRONG | WARN |
| c006 | comp002 | 2 | PASS | PARTIAL | PASS | STRONG | WARN |
| c007 | comp002 | 2 | PASS | PARTIAL | PASS | STRONG | WARN |
| c008 | comp002 | 2 | PASS | PARTIAL | PASS | STRONG | WARN |
| c009 | comp002 | 1 | PASS | PARTIAL | PASS | STRONG | WARN |
| c010 | comp002 | 1 | PASS | PARTIAL | PASS | STRONG | WARN |
| c011 | comp003 | 2 | PASS | PARTIAL | PASS | COMP-LEVEL | WARN |
| c012 | comp003 | 2 | PASS | PARTIAL | PASS | COMP-LEVEL | WARN |
| c013 | comp003 | 2 | PASS | PARTIAL | PASS | COMP-LEVEL | WARN |
| c014 | comp003 | 2 | PASS | PARTIAL | PASS | COMP-LEVEL | WARN |
| c015 | comp004 | 2 | PASS | PARTIAL | PASS | COMP-LEVEL | WARN |
| c016 | comp004 | 2 | PASS | PARTIAL | PASS | COMP-LEVEL | WARN |
| c017 | comp004 | 1 | PASS | PARTIAL | PASS | COMP-LEVEL | WARN |
| c018 | comp005 | 3 | PASS | PARTIAL | PASS | COMP-LEVEL | WARN |
| c019 | comp005 | 2 | PASS | PARTIAL | PASS | COMP-LEVEL | WARN |
| c020 | comp006 | 2 | PASS | PARTIAL | PASS | COMP-LEVEL | WARN |
| c021 | comp006 | 2 | PASS | PARTIAL | PASS | COMP-LEVEL | WARN |
| c022 | comp005 | 12 | PASS | PARTIAL | PASS | COMP-LEVEL | WARN |

## 3) What Is Working

- 21-tile loop sequencing is standardized from `learning-loop-config.json` and mapped through `TILE_ID_TO_PHASE`.
- Quiz tiles are wired to scoped pools and avoid unrelated leaks in strict loop mode.
- Video tiles are now scoped for math loops and show source badges for transparency.
- All four loop games have post-game feedback pathways; loop-critical games now auto-open review.

## 4) Issues Found (Actionable)

1. **Game topic alignment is not uniformly per-standard (`c00x`) across all four loop games.**
   - `q-blocks` and `math-bingo` include explicit standard-aware pathways.
   - `math-match` uses competency pools for many standards, not per-standard pools.
   - `math-jeopardy` uses `STD_TO_COMP` fallback broadly; only some standards have dedicated banks.

2. **Interactive activities are not uniformly per-standard for `comp003`-`comp006`.**
   - `comp001` and `comp002` have stronger standard-mode targeting.
   - `comp003` (Geo), `comp004` (Stats), `comp005` (Reasoning), `comp006` (Pedagogy) run mostly competency-level activity sets.

3. **Quiz mapping depth is uneven for some standards (`c009`, `c010`, `c017` have low map refs).**
   - They are present, but thin relative to others, which can reduce variation and robustness.

## 5) Recommended Fix Order

1. Add per-standard banks (`c001`–`c022`) to `math-match` and `math-jeopardy` (remove broad fallback when strict scoped loop is active).
2. Split interactive activity banks by standard for `comp003`-`comp006` (not only by competency).
3. Expand low-depth quiz standards (`c009`, `c010`, `c017`) with additional mapped items.
4. Keep current game feedback behavior (already aligned with tutoring requirement); add regression checks for auto-open review.

