# Math 7-12 Post-Fix Verification

Verification scope: strict loop launches (`from=loop`) for `math712` across loop games and interactive activities.

## Fixes Implemented

1. **Math Match strict standard-first**
   - Added direct standard key coverage `c001`–`c022` for `math712`.
   - In strict mode, selection now prioritizes explicit standard keys before broader competency keys.

2. **Math Jeopardy strict standard-first**
   - Added direct standard category keys `c001`–`c022` for `math712`.
   - In strict mode, current standard is now explicitly prioritized before broader fallback keys.

3. **Interactive activity standard overrides (`comp003`-`comp006`)**
   - Added `modeOverride` support to:
     - `GeoExplorer`
     - `StatsExplorer`
     - `PedagogyExplorer`
   - Wired standard-to-mode overrides in `CompetencyActivity`:
     - `c011`-`c014` -> geometry-specific modes
     - `c015`-`c017` -> stats/probability/inference-specific modes
     - `c018`-`c019` -> reasoning-specific modes
     - `c020`-`c021` -> pedagogy/assessment-specific modes

## Verification Matrix (Post-Fix)

| Check | Result | Notes |
|---|---|---|
| 21-tile loop sequence still intact | PASS | No loop phase/order changes introduced. |
| Strict loop game loading (`game-a`..`game-d`) | PASS | No blocking regressions; strict selectors remain non-leaky. |
| Math Match standard scoping in strict mode | PASS | Standard-first key path added and enforced. |
| Math Jeopardy standard scoping in strict mode | PASS | Standard-first key path added and enforced. |
| Q-Blocks feedback/review behavior | PASS | Existing auto-review and detailed per-question feedback untouched. |
| Math Bingo strict scoped deck behavior | PASS | Existing strict scoped logic retained. |
| Activity alignment for `comp003`-`comp006` | PASS | Standard-specific mode overrides now applied. |
| Lint on changed files | PASS | No lint errors on updated files. |

## Remaining Risk Notes

- Some standard-level game banks are still derived from domain-level content structure (better key targeting is now in place, but future work can deepen standard-specific item diversity per game).
- End-to-end runtime pass across all **22** standards (`c001`–`c022`) should still be done in-browser for final production signoff (this document verifies code-path correctness and scoping behavior).

