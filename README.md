# Allen Ace LMS

## CI Badges

Replace `<OWNER>` with your GitHub org/user once, and badges will render automatically.

![CI](https://github.com/<OWNER>/allen-ace/actions/workflows/ci.yml/badge.svg)
![API Security Guardrails](https://img.shields.io/badge/API%20Security%20Guardrails-CI-blue)
![E2E Onboarding Wizard](https://img.shields.io/badge/E2E%20Onboarding%20Wizard-CI-blue)
![E2E Accessibility Smoke](https://img.shields.io/badge/E2E%20Accessibility%20Smoke-CI-blue)

---

## Branch Protection Setup

Run this once to enforce required checks on your default branch:

```powershell
pwsh ./scripts/set-branch-protection.ps1 -Owner "<OWNER>" -Repo "allen-ace" -Branch "main" -Token "<GITHUB_TOKEN>"
```

Required checks include: `Lint`, `Build`, `Unit Tests`, `API Integration Tests`, `API Security Guardrails`, `E2E Onboarding Wizard`, `E2E Accessibility Smoke`, and `Docker Build`.

## Running locally

1. **Install dependencies:** `npm install`

2. **Run both frontend and API** (recommended):
   ```bash
   npm run start
   ```
   This starts the API server on port **3001** and the Vite dev server. The app will be at **http://localhost:4173** (see `vite.config.js` for the port).

3. **Or run them separately:**
   - Terminal 1: `npm run server` (API on 3001)
   - Terminal 2: `npm run dev` (Vite on 4173)

4. **Open in browser:** **http://localhost:4173**

   If you see connection errors in the terminal for `127.0.0.1:3001`, the API server is not running; use `npm run start` or run `npm run server` in another terminal.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
