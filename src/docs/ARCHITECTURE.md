# Allen Ace / Quantegy AI – Architecture Blueprint

A complete, systems-level design for a modern, forward-thinking, AI-integrated, game-centric LMS built for K–12 (TEKS-aligned), but future-ready.

**Aligned to standards from the Texas Education Agency when used in Texas.**

This is not a feature list for marketing. This is a systems-level design for something genuinely revolutionary.

---

## 1️⃣ Core Philosophy

A modern LMS should:

- **Teach**
- **Diagnose**
- **Adapt**
- **Motivate**
- **Prove mastery**
- **Reduce teacher workload**
- **Produce actionable analytics**
- **Be fun without being shallow**

**Games are not decorations. They are delivery vehicles for mastery evidence.**

---

## 2️⃣ AI-Powered Teacher Copilot Layer

### A. Standards-Aware Planning AI

- Generates lesson plans aligned to TEKS SE
- Creates spiral review schedules
- Designs remediation pathways
- Suggests game assignments by mastery gap
- Auto-builds formative assessments

### B. Smart Question Generator

- Creates new problems at specific difficulty levels
- Generates multiple representations
- Produces misconception-targeted questions
- Varies language complexity

### C. AI Feedback Engine

- Generates personalised student feedback
- Highlights misconception patterns
- Suggests intervention strategies
- Drafts parent communication

### D. Rubric + Grading Assistant

- Evaluates written explanations
- Suggests rubric scores
- Flags academic dishonesty patterns
- Tracks reasoning quality over time

---

## 3️⃣ Game Engine Layer (Core Innovation)

### A. Modular Game Framework

Instead of many one-off games:

- **3–5 core engines**
- Standards mapped
- Skinnable themes

**Examples:**

- Array Builder Engine
- Fraction Manipulation Engine
- Number Line Challenge Engine
- Word Problem Quest Engine
- Logic Strategy Engine

**Each engine:**

- Logs mastery evidence
- Detects misconceptions
- Feeds analytics engine

### B. Adaptive Difficulty AI

- Adjusts number size
- Adjusts representation
- Adjusts time pressure
- Switches modes (visual → symbolic)
- Introduces scaffolded hints

Not just “harder or easier.” **Cognitively adaptive.**

### C. Micro-Diagnostic Mode

- 60-second diagnostic bursts
- Detects specific conceptual gaps
- Builds mastery probability
- Updates student profile

---

## 4️⃣ Mastery Intelligence Engine

**Tracks:**

- Mastery per TEKS SE
- Representation flexibility
- Fluency speed
- Retention after delay
- Transfer to novel context
- Confidence patterns

Uses **Bayesian-style updating** to estimate mastery probability.

**Displays:**

- **Green** = Mastered  
- **Yellow** = Emerging  
- **Red** = Intervention Needed  

---

## 5️⃣ Revolutionary Student Dashboard

Students see:

- **Mastery Map** (visualised standards grid)
- Progress streaks
- **Concept badges** (tied to SE, not random)
- **“Next Best Challenge”**
- Growth trajectory

Not just points. **Skill progression.**

---

## 6️⃣ Advanced Teacher Analytics

### A. Concept Heatmap

- Class-wide weak SEs
- Subgroup patterns
- Representation failure clusters

### B. Misconception Dashboard

Example: *“42% of students confuse group count vs group size in multiplication.”*

### C. Predictive Risk Model

- Flags students at risk of falling behind
- Based on mastery slope
- Not just grades

---

## 7️⃣ Game-Based Mastery Verification

**Mastery is not granted by one high score.**

Mastery requires:

- Accuracy threshold
- Across multiple representations
- Across time
- With transfer challenge

**System auto-schedules:**

- Retention check 3 days later
- Spiral review insertion

---

## 8️⃣ AI Tutoring Mode (Guardrailed)

Instead of giving answers, AI:

- Asks guiding questions
- Prompts strategy reflection
- Encourages explanation
- Shows worked examples only when necessary

---

## 9️⃣ Standards & Curriculum Layer

- Full TEKS database
- SE-level tagging
- Crosswalk to Common Core (optional)
- Coverage tracker
- Gap alerts

Teachers see: *“3.4C under-addressed this month.”*

---

## 🔟 Engagement Without Gimmicks

- Seasonal tournaments
- Class leaderboards (**optional & configurable**)
- Mastery leagues
- Collaborative quests
- Skill-based avatars

**Leaderboards must be optional** to avoid demotivation.

---

## 1️⃣1️⃣ Modern UX Requirements

- Fast load
- Mobile compatible
- Clean minimal interface
- Low cognitive clutter
- Teacher quick-assign
- One-click insights

---

## 1️⃣2️⃣ AI Governance + Safety

- PII protection
- Prompt logging
- Transparent AI suggestions
- Teacher override
- Bias detection in question generation

---

## 1️⃣3️⃣ Integration Ecosystem

- SIS sync
- Google Classroom sync
- Canvas / LMS integration (LTI)
- Grade export
- API access

---

## 1️⃣4️⃣ What Makes It Truly Revolutionary

Not: *“Games in an LMS.”*

But: **A unified mastery intelligence system** where:

- Game performance  
- Diagnostic AI  
- Representation diversity  
- Retention checks  

**= Verified standards mastery**

That is rare in current edtech.

---

## 1️⃣5️⃣ Strategic Build Order

**For the build, start with:**

1. **One grade** (Grade 3)
2. **3–5 highest-impact SEs**
3. **3 core game engines**
4. **Full mastery analytics**
5. **Teacher dashboard MVP**
6. **AI copilot for question generation**

---

# Current State vs Blueprint

Mapping of the existing codebase to this blueprint (as of the last update).

| Blueprint area | Current state | Notes |
|----------------|---------------|--------|
| **1. Core philosophy** | Aligned | Games wired to TEKS; test prep + continuous learning path (quiz → game → quiz). |
| **2. AI Copilot** | Partial | Teacher Copilot exists; question generation and planning AI vary by feature. |
| **3. Game engine layer** | Partial | Many individual games (Math Sprint, Math Match, Teks Crush, etc.) with TEKS mapping in `src/data/games.js` and `taxonomy.js`. Concept-level tracking via `conceptTracker.js`. Not yet consolidated into 3–5 modular engines. |
| **4. Mastery intelligence** | Partial | Per-concept stats (attempts, correct, streak, history) in `conceptTracker.js`. Adaptive practice and “Where you stand” (strengthened / keep practicing) in TestPrepPage. No Bayesian mastery probability or Green/Yellow/Red per SE yet. |
| **5. Student dashboard** | Partial | Student view, games, grade views. No unified Mastery Map or “Next Best Challenge” yet. |
| **6. Teacher analytics** | Partial | Class view, gradebook, some dashboards. No concept heatmap or misconception dashboard yet. |
| **7. Mastery verification** | Partial | Multiple representations and adaptive quizzes exist; no auto retention check or spiral scheduling yet. |
| **8. AI tutoring** | Partial | QBot, explainers, hints in places; not a full guardrailed tutoring mode. |
| **9. Standards layer** | Strong | Full TEKS in `src/data/teks.js`, taxonomy in `src/data/taxonomy.js`, SE-level concepts and game mapping. |
| **10. Engagement** | Present | Games, prep flows, optional leaderboards possible; tournaments/leagues not built. |
| **11. UX** | Present | Responsive, TeacherLayout, quick-assign patterns. |
| **12. AI governance** | Varies | PII and auth in place; prompt logging and bias checks depend on AI integration. |
| **13. Integrations** | Present | LTI (Canvas etc.), grade export, API; SIS/Google sync as needed. |
| **14. Revolutionary core** | In progress | Moving toward “game + diagnostic + representation + retention = verified mastery”; not yet end-to-end. |
| **15. Strategic start** | Partially aligned | Grade 3 and multiple grades have content; focus on Grade 3 + 3–5 SEs + 3 engines + mastery analytics + teacher MVP + AI question gen is the recommended next step. |

---

## Operational & SRE (unchanged)

- Production SLO targets and telemetry: `src/docs/SRE-SLOS.md`
- Incident response: `src/docs/INCIDENT-RESPONSE-SLO.md`
- Disaster recovery: `src/docs/DR-RUNBOOK.md`
- API: `src/docs/API-V1.md`, Load testing: `src/docs/LOAD-TESTING.md`
