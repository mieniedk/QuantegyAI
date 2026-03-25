# The One Continuous Study Flow

There is **one** continuous study flow in the app (especially for 7–12):

**Quick video → Quick quiz (3 questions) → Game → Quick concept info (text) → Quick quiz (3 questions) → Game → (repeat, adaptive)**

## Where it lives

Everything runs in **one page**: `PracticeLoop.jsx` (route `/practice-loop`).

| Step | What | In PracticeLoop |
|------|------|------------------|
| 1. Video | Quick video to introduce the concept | `phase=learn` |
| 2. Quiz | Quick quiz (3 questions) | `phase=check` |
| 3. Game | Game or interactive activity | `phase=game` |
| 4. Concept info | Quick concept info (text) | `phase=reminder` |
| 5. Quiz | Quick quiz (3 questions) | `phase=quiz` |
| 6. Game | Game → **Continue** back to step 4 | `phase=game` |

After each game, **Continue** returns to the next step (first time: concept info; then in the loop: concept info → quiz → game again). All adaptive.

## Entry points

- **Student (Learning Path):** `launchLearnCheckGame(concept)` → `/practice-loop?phase=learn&teks=...&label=...`
- **Test Prep:** One button "Continuous study (one flow)" → `/practice-loop?phase=learn`
- **WarmUp** (if used): "Practice with Games" → `/practice-loop?phase=reminder&...` (skips video and first quiz)

## Same concept throughout

**Video, quiz, key concept, and game must all be on the same concept.** Do not switch to unrelated topics (e.g. geometry after an equations quiz).

- **Practice Loop** passes `teks` (and when from comp002, algebra TEKS only) and `from=loop` to the game URL.
- **Math Sprint** (and any game opened from the loop): when `from=loop`, use only the TEKS from the URL to build questions — do not use the mixed grade 7–12 pool (which includes geometry). See `public/games/math-sprint.html` (`useMixed = !fromLoop && ...`).
- When the quiz was **Patterns and Algebra** (comp002), the game is given equation/algebra TEKS only (e.g. A.5A, A.3B, A.9C, A.2A, A.2B) so the game stays on equations, not geometry.

## Summary

- **One flow for 7–12:** Quick video → 3-question quiz → game → concept info → quick quiz → game (repeat).
- **Single implementation:** `src/pages/PracticeLoop.jsx`, route `/practice-loop`.
- **Same concept:** Video, quiz, key concept, and game must align; games opened from the loop use TEKS-only (no mixed pool).
