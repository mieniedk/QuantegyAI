# Math 7–12 (TExES 235) — standard MC bank sizes

Multiple-choice items used by the **practice learning loop** are drawn from `getQuestionsForExam('math712')`, filtered by competency (`comp`) and standard (`c001`–`c022`) via `getStandardForQuestion` in `src/data/texes-questions.js`.

Target: **≥12 MC items per standard** and **at least one easy, one medium, and one hard** per standard (same difficulty buckets as `normalizeDifficulty` in the practice loop) so check/diagnostic/readiness/mastery phases and difficulty bias behave well.

## Per-standard counts (canonical `comp` + `c00x`)

| Standard | Domain   | MC count |
| -------- | -------- | -------: |
| c001     | comp001  |       25 |
| c002     | comp001  |       13 |
| c003     | comp001  |       16 |
| c004     | comp002  |       13 |
| c005     | comp002  |       14 |
| c006     | comp002  |       16 |
| c007     | comp002  |       13 |
| c008     | comp002  |       12 |
| c009     | comp002  |       12 |
| c010     | comp002  |       12 |
| c011     | comp003  |       12 |
| c012     | comp003  |       14 |
| c013     | comp003  |       12 |
| c014     | comp003  |       12 |
| c015     | comp004  |       17 |
| c016     | comp004  |       13 |
| c017     | comp004  |       12 |
| c018     | comp005  |       18 |
| c019     | comp005  |       12 |
| c020     | comp006  |       14 |
| c021     | comp006  |       14 |
| c022     | comp005  |       12 |

## Re-verify locally

From the repo root:

```bash
npm run audit:math712-banks
```

JSON output (e.g. for tooling): `node scripts/audit-math712-standard-banks.mjs --json`

Implementation: `src/utils/auditMath712StandardBanks.js` (also covered by `tests/unit/audit-math712-standard-banks.test.mjs` in `npm test`).

## Related loop behavior

- **Games** on Math 7–12 / 4–8: four loop slots prefer each domain’s `games` list in `TEXES_DOMAINS` (see `pickLoopFourGames` in `src/pages/PracticeLoop.jsx`).
- **Config**: tile sequence and quiz sizes live in `src/data/learning-loop-config.json`.
