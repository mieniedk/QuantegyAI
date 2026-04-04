# Math 7-12 Runtime Browser Sweep

Base URL: `https://quantegy-ai.vercel.app`
Standards in app: **22** (`c001`..`c022`). The summary table below is the **c001–c021** sweep. Re-run `scripts/audit-math712-runtime.mjs` for **462** loop URLs (22 × 21 phases) and **88** direct game URLs (22 × 4).
Standards tested (this file): 21 (`c001`..`c021`)
Loop checks run: 441 (21 standards × 21 phases)
Direct game checks run: 84 (21 standards × 4 loop games)

## Per-Competency Summary

| Standard | Pass | Warn | Fail |
|---|---:|---:|---:|
| c001 | 21 | 0 | 0 |
| c002 | 21 | 0 | 0 |
| c003 | 21 | 0 | 0 |
| c004 | 21 | 0 | 0 |
| c005 | 21 | 0 | 0 |
| c006 | 21 | 0 | 0 |
| c007 | 21 | 0 | 0 |
| c008 | 21 | 0 | 0 |
| c009 | 21 | 0 | 0 |
| c010 | 21 | 0 | 0 |
| c011 | 21 | 0 | 0 |
| c012 | 21 | 0 | 0 |
| c013 | 21 | 0 | 0 |
| c014 | 21 | 0 | 0 |
| c015 | 21 | 0 | 0 |
| c016 | 21 | 0 | 0 |
| c017 | 21 | 0 | 0 |
| c018 | 21 | 0 | 0 |
| c019 | 21 | 0 | 0 |
| c020 | 21 | 0 | 0 |
| c021 | 21 | 0 | 0 |
| c022 | — | — | — |

**c022:** row placeholder — populate after re-running the audit script.

## Loop Tile Issues (Warn/Fail)

No warn/fail loop tile results.

## Direct Game URL Issues (Warn/Fail)

No warn/fail game URL results.

## Notes

- This sweep validates runtime loading and scope-warning surfaces per tile URL.
- Game feedback depth (full post-game review after completion) still requires full in-game playthrough interaction; this run verifies pages load and scoped-game availability messages.
