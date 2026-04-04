# Math 7-12 Game Review Runtime Verification

Base URL: `https://quantegy-ai.vercel.app`
Standards in app: **22** (`c001`..`c022`). Counts below are the **c001–c021** automation run; re-run `scripts/audit-math712-game-reviews.mjs` to include **c022**.
Standards tested (this file): 21 (`c001`..`c021`)
Game review checks: 84 (21 standards × 4 games)
Result: 4 pass, 80 fail

## Per-Standard Totals

| Standard | Pass | Fail |
|---|---:|---:|
| c001 | 1 | 3 |
| c002 | 0 | 4 |
| c003 | 0 | 4 |
| c004 | 0 | 4 |
| c005 | 0 | 4 |
| c006 | 0 | 4 |
| c007 | 1 | 3 |
| c008 | 0 | 4 |
| c009 | 0 | 4 |
| c010 | 0 | 4 |
| c011 | 0 | 4 |
| c012 | 0 | 4 |
| c013 | 0 | 4 |
| c014 | 0 | 4 |
| c015 | 1 | 3 |
| c016 | 1 | 3 |
| c017 | 0 | 4 |
| c018 | 0 | 4 |
| c019 | 0 | 4 |
| c020 | 0 | 4 |
| c021 | 0 | 4 |
| c022 | — | — |

**c022:** re-run audit to fill pass/fail totals and detailed rows.

## Detailed Results

| Standard | Game | Status | Notes |
|---|---|---|---|
| c001 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c001 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c001 | math-bingo | PASS | review-verified (10803ms) |
| c001 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c002 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c002 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c002 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c002 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c003 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c003 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c003 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c003 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c004 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c004 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c004 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c004 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c005 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c005 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c005 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c005 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c006 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c006 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c006 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c006 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c007 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c007 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c007 | math-bingo | PASS | review-verified (10120ms) |
| c007 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c008 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c008 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c008 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c008 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c009 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c009 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c009 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c009 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c010 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c010 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c010 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c010 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c011 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c011 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c011 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c011 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c012 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c012 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c012 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c012 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c013 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c013 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c013 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c013 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c014 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c014 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c014 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c014 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c015 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c015 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c015 | math-bingo | PASS | review-verified (10688ms) |
| c015 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c016 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c016 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c016 | math-bingo | PASS | review-verified (10245ms) |
| c016 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c017 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c017 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c017 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c017 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c018 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c018 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c018 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c018 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c019 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c019 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c019 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c019 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c020 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c020 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c020 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c020 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c021 | q-blocks | FAIL | Error: page.evaluate: ReferenceError: stats is not defined
    at eval (eval at evaluate (:290:30), <anonymous>:4:21)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44) |
| c021 | math-match | FAIL | Error: mathmatch-react-dispatch-failed |
| c021 | math-bingo | FAIL | TimeoutError: page.waitForSelector: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |
| c021 | math-jeopardy | FAIL | TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Attempted') to be visible
 |

## Verification Method

- `q-blocks`: forced valid end-state then confirmed full review cards render.
- `math-bingo`: automated call progression to game-over, then confirmed review screen.
- `math-jeopardy`: played clue, ended game, confirmed review screen.
- `math-match`: runtime state dispatch to end-state, confirmed `GameReview` UI render.
