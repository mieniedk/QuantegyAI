# Math 7–12 domain games — load & post-game review

This table covers every **`games[]` entry** on `TEXES_DOMAINS` in `src/data/texes-questions.js` (Math 7–12 certification framework). The practice loop picks **four** games per run from that list (see `pickLoopFourGames` in `src/pages/PracticeLoop.jsx`).

**Loads?** — In this repo, each id below has a matching **React route** in `src/main.jsx`, except **Q-Blocks** is played as **`/games/q-blocks.html`** inside an iframe (`QBlocks.jsx`) for loop embeds. All are expected to load in production builds if the app is deployed normally.

**Review afterward?** — Code-level summary only (not a substitute for QA in the browser).

| Game id | Listed for domains | Loads (in app) | Post-game review (code) |
| ------- | ------------------ | -------------- | ------------------------- |
| `math-match` | I (001), VI (006) | Yes — `/games/math-match` | **Yes.** After completion, review opens automatically (short delay); uses shared `GameReview` with per-item explanations where provided. |
| `math-sprint` | I, II, III, IV, V, VI | Yes — `/games/math-sprint` | **Yes.** Results screen offers **Review Answers**; opens `GameReview` with sprint history. |
| `q-blocks` | I, II, IV, V, VI (and III via loop fill rules) | Yes — iframe `q-blocks.html` | **Yes — strongest in-app write-up.** Game over can route to **Full Review** with per-question cards and step-by-step style messaging (`showReviewScreen`, `reviewCards` in `public/games/q-blocks.html`). |
| `number-line-ninja` | I, III | Yes — `/games/number-line-ninja` | **Yes.** **Review Answers** → `GameReview` with `answeredQuestions`. |
| `qbot-shop` | I | Yes — `/games/qbot-shop` | **Yes.** **Review** → `GameReview` with round `history`. |
| `math-bingo` | I, III, IV, VI | Yes — `/games/math-bingo` | **Yes.** After game over, review is **auto-opened** when there is history; uses `GameReview` + expression explanations. |
| `math-memory` | I, V, VI | Yes — `/games/math-memory` | **Yes.** **Review Pairs** → `GameReview` with match results. |
| `algebra-sprint` | II, V | Yes — `/games/algebra-sprint` | **Yes.** On game over, **results are the `GameReview` screen** (full list with explanations from history). |
| `equation-balance` | II | Yes — `/games/equation-balance` | **Yes.** **Review** / **Review Answers** → `GameReview`. |
| `math-maze` | II, III, V | Yes — `/games/math-maze` | **Yes.** **Review Answers** → `GameReview`. |
| `math-millionaire` | II, IV, V | Yes — `/games/math-millionaire` | **Yes.** Game-over screen has **Review Solutions** → `GameReview` (not auto-opened). |
| `graph-explorer` | III, IV | Yes — `/games/graph-explorer` | **Yes.** **Review Solutions** → `GameReview` with `history`. |
| `math-jeopardy` | III, IV | Yes — `/games/math-jeopardy` | **Yes.** Review **auto-opens** after game over when there are answered items; `GameReview`. |
| `crosses-knots` | III, V, VI | Yes — `/games/crosses-knots` | **Yes.** **Review Rounds** → `GameReview` with `roundHistory`. |

## “Thorough tutoring session” — what the code actually does

- **Shared `GameReview`** (`src/components/GameReview.jsx`): lists items, correct vs your answer, **explanation** (from item data or generic fallback), **misconception** hints for wrong answers, filter all/wrong/correct, and can include **QBotExplainer** where wired. Depth depends on whether each game passes rich `explanation` fields on every item.
- **Q-Blocks (HTML)** has a **dedicated full-review flow** tailored to its question log (including stronger “walkthrough” style copy in places).
- None of the above replaces a **live human tutor**; they are **automated post-game reviews**.

## Competency rollup (which games can appear for each domain)

| Domain | `comp` id | Games in `TEXES_DOMAINS.games` |
| ------ | --------- | ------------------------------ |
| Number Concepts | `comp001` | math-match, math-sprint, q-blocks, number-line-ninja, qbot-shop, math-bingo, math-memory |
| Patterns & Algebra | `comp002` | algebra-sprint, math-sprint, equation-balance, math-maze, q-blocks, math-millionaire |
| Geometry & Measurement | `comp003` | graph-explorer, number-line-ninja, math-sprint, math-maze, math-jeopardy, crosses-knots, math-bingo |
| Probability & Statistics | `comp004` | math-sprint, graph-explorer, math-jeopardy, math-millionaire, math-bingo, q-blocks |
| Processes & Perspectives | `comp005` | math-maze, q-blocks, crosses-knots, math-sprint, algebra-sprint, math-memory, math-millionaire |
| Learning, Instruction & Assessment | `comp006` | math-sprint, math-memory, math-match, crosses-knots, math-bingo, q-blocks |

Individual **standards** (`c001`–`c022`) share the same game pool as their parent domain.
