# Allen Ace LMS vs Blackboard Learn — Comparison

A feature-by-feature comparison of **Allen Ace** (this LMS) with **Blackboard Learn** (Ultra experience), based on the current codebase and public Blackboard documentation.

---

## 1. Audience & Focus

| Aspect | Allen Ace | Blackboard Learn |
|--------|-----------|------------------|
| **Primary audience** | K–12 (Texas TEKS, STAAR, TExES) | Higher ed + K–12 (broad) |
| **Standards alignment** | TEKS, STAAR, TExES built-in; competency/domain mapping | Generic; standards often added via config or LTI |
| **Teacher certification prep** | TExES prep (20+ exams, practice tests, adaptive drills) | Not a focus; separate products |
| **State assessment prep** | STAAR prep, TEKS-aligned games | Not built-in |

**Summary:** Allen Ace is **K–12 and Texas-centric** (TEKS, STAAR, TExES). Blackboard is **institution-agnostic** and used globally across K–12 and higher ed.

---

## 2. Content & Course Design

| Feature | Allen Ace | Blackboard Learn |
|---------|-----------|------------------|
| **Course/class structure** | Classes with join codes; sections; TEKS/TExES domains | Courses, modules, learning modules |
| **Content types** | Content modules, course content library (TEKS domains), printables, pacing guides, wiki pages | Documents (enhanced), files, links, LTI, SCORM, learning modules |
| **Pre-built curriculum** | TEKS-aligned course content (e.g. grade 1–5 math), lesson plans, modules | None out of the box; instructor-created |
| **Video** | Video Studio (record, upload); Studio player | Video Studio (record, captions, transcripts); inline video |
| **AI content generation** | Teacher Copilot: lesson plans, course gen, spiral review, question gen | AI Design Assistant: test questions, rubrics; AI conversation/role-play |
| **Mastery / pathways** | Mastery Path Builder; concept tracker; competency dashboards | Mastery learning; learning pathways |
| **Blueprints** | Blueprint Manager (template courses) | Course templates / course copy |
| **Commons** | Shared content (Commons page) | Learning object repository (varies by deployment) |

**Summary:** Allen Ace emphasizes **standards-aligned, ready-made K–12 content** and **AI-assisted planning**. Blackboard emphasizes **flexible content authoring** and **AI for assignments/rubrics**.

---

## 3. Assessments & Quizzes

| Feature | Allen Ace | Blackboard Learn |
|---------|-----------|------------------|
| **Question types** | 14+ (MC, select-all, T/F, short answer, fill-blank, matching, ordering, numeric, categorization, formula, essay, file upload, URL, hot-spot, Likert) | MC, T/F, matching, ordering, fill-in-blank, essay, file upload, etc. |
| **Assessment engine** | Full engine: create, publish, take, grade; item analysis; proctoring events | Tests & assignments; flexible grading; item analysis (varies) |
| **Timed / proctoring** | Time limits, max attempts, optional proctoring level, lockdown | Timed tests; SafeAssign; proctoring integrations |
| **Rubrics** | Rubric Builder; AI grading assistant; moderated grading | Rubrics; inline feedback; AI Design Assistant for rubrics |
| **STAAR/TExES practice** | STAAR prep, TExES prep (full/adaptive/drills per exam) | N/A |
| **Gamified practice** | 20+ TEKS-aligned math games (e.g. Math Sprint, Fraction Pizza); game results → gradebook | No built-in games |

**Summary:** Allen Ace has a **rich assessment engine** and **dedicated state/certification prep**. Blackboard has **strong assignment/test tools** and **flexible grading**, but no built-in K–12 games or STAAR/TExES prep.

---

## 4. Gradebook & Grading

| Feature | Allen Ace | Blackboard Learn |
|---------|-----------|------------------|
| **Gradebook** | Per-class gradebook; assignment columns; manual + auto (game/assessment) grades | Ultra Gradebook; global Grades page; per-course |
| **Auto-grading** | From game results and objective assessments; per-assignment toggle | From tests/quizzes; auto-grade on submission |
| **Speed grading** | Speed Grader; bulk feedback | Flexible Grading; grade from multiple places |
| **Late policy** | Per-assignment (accept, deduct, zero); grace period | Due dates; late submission handling |
| **Analytics** | Item analysis; early warning; misconception detection; actionable analytics | Item analysis (varies); retention/performance analytics |

**Summary:** Both support **flexible gradebooks and grading**. Allen Ace ties grades to **games and TEKS/TExES**, and adds **early warning and misconception analytics**.

---

## 5. Communication & Collaboration

| Feature | Allen Ace | Blackboard Learn |
|---------|-----------|------------------|
| **Announcements / feed** | Class feed; activity stream | Announcements; activity stream |
| **Discussions** | Class discussions (e.g. exit tickets, discussions) | Discussions; graded discussions; post-first options |
| **Chat** | Class chat | Messages / chat (varies by product) |
| **Inbox** | Inbox page | Notifications; email (configurable) |
| **Live/video** | Video Meet (in-app video); live game sessions | Blackboard Collaborate; Zoom/Teams integrations |
| **Notifications** | Notification bell; notification preferences | Announcement indicators; read/unread; notification settings |

**Summary:** Both offer **announcements, discussions, and notifications**. Allen Ace adds **class chat and in-app video meet**; Blackboard leans on **Collaborate and third-party video**.

---

## 6. Integrations & Interoperability

| Feature | Allen Ace | Blackboard Learn |
|---------|-----------|------------------|
| **LTI** | LTI 1.x launch; LTI admin; LTIBanner; deep link / grade passback (design) | LTI 1.1/1.3; deep linking; grade passback |
| **SCORM** | SCORM player component | SCORM in learning modules |
| **SIS** | SIS panel (district/school hierarchy); enterprise provisioning | SIS integration (enrollment, roster sync) |
| **API** | Public API docs; status/health endpoints; SRE endpoints | REST APIs; Building Blocks |

**Summary:** Both support **LTI and SCORM**. Allen Ace has **SIS and enterprise provisioning**; Blackboard has **mature SIS and ecosystem**.

---

## 7. Administration & Compliance

| Feature | Allen Ace | Blackboard Learn |
|---------|-----------|------------------|
| **Admin dashboard** | ROI/analytics; class/teacher metrics; engagement; SLO dashboard; audit logs | System admin; course admin; analytics (varies) |
| **District/school hierarchy** | District hierarchy manager; onboarding wizard | Multi-tenant / org structure (varies) |
| **Compliance** | Compliance agent; accreditation dashboard; DPA, privacy, terms, security docs | FERPA, accessibility; configurable policies |
| **Accessibility** | Accessibility audit component; a11y considerations | Accessibility (WCAG); Ally (optional) |
| **Audit** | Admin audit logs | Audit trails (admin/course) |

**Summary:** Allen Ace targets **K–12 district admin and compliance** (SLOs, accreditation, audit) and includes a **built-in WCAG 2.1 AA audit** (contrast, headings, keyboard, labels, skip link, landmarks). Blackboard offers **institution-level admin** and optional **Ally** for accessibility scanning and alternative formats. See the dedicated comparison below.

---

## 7b. Accessibility: How You Compare With Blackboard Now

After recent fixes (labels, aria-labels, decorative images, skip link, focus visible), here’s how Allen Ace stacks up.

| Aspect | Allen Ace | Blackboard / Ally |
|--------|-----------|-------------------|
| **Built-in auditing** | **Yes** — WCAG 2.1 AA audit at `/accessibility-audit` (images/alt, contrast, headings, keyboard, form labels, skip link, focus visible, landmarks). No extra license. | **With Ally** — Scanning + checklist (WCAG 2.1/2.2 AA). Ally is an **optional, paid** add-on. |
| **Core UX (key pages)** | Skip link; focus visible; labeled form inputs and icon-only buttons on Teacher dashboard, Class view, Student (join), TExES/STAAR prep; decorative images with `role="presentation"`. | Learn Ultra is designed for accessibility; Ally provides feedback and scores on content. |
| **Alternative formats** | **No** — No auto-generated audio, ePub, braille, tagged PDF, etc. | **With Ally** — Auto alternative formats (audio, ePub, braille, tagged PDF, HTML, BeeLine, translations). |
| **Content scanning** | Audit runs on the **live DOM** (one page at a time). You fix issues in code. | Ally scans **course content** (files, images) and guides instructors to fix or replace. |
| **Theme / preference** | **Yes** — Light/dark theme (CSS variables). | Theme and display options vary by deployment. |
| **ARIA / semantics** | **Yes** — Tabs, menus, alerts, landmarks where needed. | Yes in Ultra; Ally doesn’t replace semantic HTML. |

**Summary**

- **On par or ahead:** You have **built-in WCAG 2.1 AA auditing** and **recent fixes** on high-traffic flows. Many Blackboard sites only get that level of checking if they **buy Ally**. So for “we take accessibility seriously and we audit it,” you’re in a strong position.
- **Where Blackboard/Ally still leads:** **Alternative formats** (audio, ePub, braille, tagged PDF, etc.) and **automated content-level** feedback for instructors. If a district asks “can students get this as audio or braille?”, Blackboard + Ally can say yes out of the box; you’d need a later feature (or integration) for that.
- **Positioning:** “We build accessibility in and ship a built-in audit; we’ve fixed audit findings on our main pages” is a clear, honest story. You can add “We’re exploring alternative formats in a future release” if you want to match Ally on that later.

---

## 8. Analytics & Reporting

| Feature | Allen Ace | Blackboard Learn |
|---------|-----------|------------------|
| **Teacher analytics** | Teacher dashboard (ProGate); class/student progress; TEKS mastery; game usage | Course analytics; performance reports |
| **Admin analytics** | Platform-wide engagement; ROI; class/teacher performance; SLO metrics | Institutional analytics; Learn Analytics (optional) |
| **Mastery** | Mastery panel; concept tracker; competency dashboards; cross-competency dashboard | Mastery learning; learning paths |
| **Data/insights agents** | Data insights agent; actionable analytics | Analytics dashboards; reports |

**Summary:** Allen Ace is built around **TEKS/mastery and game-based engagement**. Blackboard provides **course and institutional reporting**; advanced analytics often via add-ons.

---

## 9. Unique or Differentiating Aspects

### Allen Ace

- **TEKS/STAAR/TExES native:** Standards, question banks, and practice tests built in.
- **20+ math games** tied to TEKS and gradebook (evidence of mastery).
- **Teacher Copilot:** AI for lesson plans, course generation, spiral review, question gen, feedback drafts.
- **Live games** and in-class tools (e.g. warm-up, classroom tools).
- **Parent portal** and **student portfolio**.
- **Concept map,** **pacing guide,** **printables** for K–12 workflow.
- **Subscription/trial** (e.g. Pro features, checkout, marketplace).
- **Lightweight stack:** React/Vite, optional backend; can run with local storage.

### Blackboard Learn

- **Scale and ecosystem:** Used by thousands of institutions; long-standing support and integrations.
- **Ultra experience:** Modern UI; consistent across courses and institutions.
- **AI Design Assistant:** Context-aware question and rubric generation.
- **Flexible grading:** Single place to see and complete grading across courses.
- **Global calendar:** One calendar for all courses and due dates.
- **Rich content authoring:** Enhanced documents, multiple block types, responsive layout.
- **Collaborate:** Built-in virtual classroom and video.
- **Enterprise features:** SSO, SIS, hosting, compliance, and support at scale.

---

## 10. Summary Table

| Dimension | Allen Ace | Blackboard Learn |
|-----------|-----------|------------------|
| **Best for** | K–12 Texas (TEKS, STAAR, TExES); game-based mastery; teacher AI copilot | Any institution; broad feature set; enterprise LMS |
| **Content** | Standards-aligned library; AI course gen; games as content | Instructor-built; LTI/SCORM; AI-assisted authoring |
| **Assessments** | 14+ question types; STAAR/TExES prep; games → grades | Tests & assignments; flexible grading; SafeAssign |
| **Gradebook** | Per-class; game + assessment auto-grade; early warning | Ultra Gradebook; global view; flexible grading |
| **Communication** | Feed, chat, discussions, video meet, inbox | Announcements, discussions, Collaborate, messages |
| **Integrations** | LTI, SCORM, SIS panel, API | LTI, SCORM, SIS, Building Blocks, REST API |
| **Admin** | District hierarchy; SLO; compliance; audit | System/course admin; institutional analytics |
| **Accessibility** | Built-in WCAG 2.1 AA audit; skip link; focus visible; labels/ARIA on key pages; dark theme | WCAG in Ultra; optional Ally (scanning + alternative formats) |
| **Deployment** | Self-hosted / flexible (e.g. Docker); client-heavy | Typically SaaS or managed hosting |

---

*This comparison is based on the Allen Ace codebase (routes, components, utils, docs) and public Blackboard Learn Ultra documentation. Blackboard feature availability can vary by license and deployment.*

---

## Accessibility: Should You Improve?

**Yes.** For K–12 and district sales, accessibility is a differentiator and often a requirement (IDEA, Section 504, district RFPs). You already have a strong base:

- **Skip link** to main content
- **WCAG 2.1 AA audit** (`/accessibility-audit`): images/alt, contrast, heading hierarchy, keyboard focus, form labels, skip link, focus visible, landmarks, page title
- **ARIA** in key flows (e.g. Student tabs, ClassView menus)
- **Theme** with dark mode (reduces glare; helps some users)

**Worth adding or tightening:**

1. **Fix audit findings first** — Run the audit on high-traffic pages (Teacher dashboard, Class view, Student, TExES/STAAR prep) and fix fails (e.g. missing `alt`, low contrast, unlabeled buttons).
2. **Focus visible everywhere** — You already have `:focus-visible` in `index.css`; ensure custom components (e.g. game UIs, modals) don’t override or hide focus so keyboard users always see where focus is.
3. **Screen-reader testing** — Spot-check with NVDA or VoiceOver on critical paths (take assessment, join class, view grades). **Done:** See `docs/ACCESSIBILITY-SCREEN-READER-TESTING.md` for step-by-step instructions; Take Assessment, Join Class, and View Grades flows are hardened with landmarks, live regions, and alerts.
4. **Optional: Ally-style “alternative formats”** — If you want to match Blackboard’s Ally, consider a later phase: export content as audio, PDF, or tagged HTML for students who need it.

Improving accessibility strengthens your compliance story and positions you ahead of “we use optional Ally” by having **built-in auditing and fixes** in the product.
