What it is:

Build me a web application called Grahita Space. It's a companion and connectivity platform for the "Grahita Band" wearable device — it displays students' real-time physiological data (BPM/HRV), detects indications of cognitive-stress overload, and bridges three parties — students, school counselors (Guru BK), and parents — so that academic stress can be identified and addressed early.

The app receives the following data pushed in real time from the Grahita Band device:


BPM (heart rate) data
HRV (heart rate variability) data
Cognitive-stress status: optimal, load, or overload


The app must be bilingual: Bahasa Indonesia (default) and English, with a visible language switcher. Code, comments, and variable names can stay in English regardless of the selected UI language.


What it needs:

Build three separate role-based experiences behind a single login system. Do not simplify or merge these flows — reproduce each screen listed below.

Authentication


A login/registration page where users sign up or sign in with a username and password.
On login, route the user based on their role: siswa (student), guru_bk (school counselor), or orang_tua (parent).


Role 1 — Siswa (Student)


Home page: navigation buttons to the other 3 pages, an "About Us" section, and hyperlink buttons to the Grahita Space team's Instagram, YouTube, TikTok, and email.
Health Dashboard page: real-time HRV card, real-time BPM card, a combined BPM/HRV trend chart, an educational intervention guide generated from the HRV/BPM readings, and a monthly stress-evaluation chart scaled by HRV.
Academic Dashboard page: per-semester academic performance — average grade, highest grade, and a list of subjects that need attention.
Questionnaire & Suggestions page: an emotional-validation questionnaire plus suggestions generated from the questionnaire results and HRV data, and a separate section showing suggestions/solutions written by the Guru BK.


Role 2 — Guru BK (School Counselor)


Login, landing on a student roster page: every assigned ("binaan") student listed with an Optimal/Load/Overload color indicator, plus a chart ranking subjects from most-focused/optimal to most cognitive-overload.
Clicking a student opens a detail view: their individual trend history and a text field for the counselor to write and submit a suggestion/intervention note for that student.


Role 3 — Orang Tua (Parent)


Login, scoped to see only their own child's data — no roster, no other students.
A summary dashboard: weekly/monthly stress and grade summary, system-generated suggestions, and the suggestions written by the Guru BK for their child.


Language / Localization


Support two UI languages: Bahasa Indonesia (default) and English.
Add a persistent language switcher (e.g. "ID / EN" toggle) visible on every page, including pre-login screens.
Store the user's language choice locally (so it persists across sessions) and, once logged in, also save it on their user profile so it's remembered across devices.
Localize all static interface strings: navigation, buttons, form labels, headings, status labels ("Optimal"/"Load"/"Overload" → localized equivalents), and system-generated suggestion/intervention text.
Do not auto-translate free-text user-generated content — Guru BK's written suggestion notes and student questionnaire free-text answers should display exactly as entered, in whichever language they were written.
The "Graphite" AI Assistant should detect and reply in whichever language the user is currently viewing the app in.
Build the translation strings in a structure that's easy to extend later (e.g. a single locale dictionary/JSON per language, not hard-coded text scattered across components).


Feature modules (MVP scope — build all of these)

ModuleDetailsLanding & BrandHero section, About Us, social links (Instagram/TikTok/YouTube/Email)AuthenticationSign up & Sign in, role-based access: siswa / guru_bk / orang_tuaStudent Home DashboardReal-time BPM card, real-time HRV card, real-time trend chart, "waiting for data" state when the device isn't connectedIntervention ModuleOverload warning banner, cognitive-stress status banner, 3 recommendations (4-7-8 breathing, rest reminder, stretching), a "Start 4-7-8 Breathing Exercise" button, an "Edu-Intervention Guide" linkReport / AcademicMonthly stress-trend evaluation chart, average grade, highest grade, per-subject grade reportSuggestion & QuestionnaireEmotion-validation questionnaire (1–10 emoji slider), submit evaluation resultsJournal & ArticlesList of wellbeing educational articlesPsychologist & PsychiatristA simple booking form / list for consultationsAI Assistant "Graphite"Chat widget, quick-reply chips ("Stres ujian", "Tips belajar", "Cara tenang"), a visible disclaimer that it is not a replacement for a licensed professionalGuru BK DashboardRoster of all assigned students with color status + per-student detail viewParent DashboardStatus and summary for their own child only

Explicitly out of scope for this build (do not build these)


A CMS for non-developers to edit articles (articles are seeded manually via the Firebase console)
Push notifications (a visual dashboard indicator is enough for now)
An automated calendar-based booking system for psychologists (a simple form is enough)


Other

Include any other features or functionality needed to make this app work properly that aren't explicitly listed above (e.g. empty/loading/error states, session handling, basic form validation).


How it looks:

Design direction: "Modern Corporate, Clinical-Professional" with pronounced, genuine glassmorphism — a formal, high-trust dashboard aesthetic built from real frosted-glass panels, not just dark rectangles with a thin border. Prioritize clarity, whitespace, and grid discipline over decoration — this is a tool people rely on to spot a mental-health warning sign, so nothing should feel gimmicky or busy — but the glass effect itself should be unmistakable: translucent panels that visibly blur the colorful background behind them, with a soft light-catching highlight along their top edge, floating above a layered, atmospheric backdrop. Do not render glass panels as flat solid-color boxes with no blur and no visible depth — that defeats the entire style.


Mode: Dark mode by default (reduces eye strain during late-night study sessions and stress monitoring).
Background atmosphere (required for the glass effect to actually read): every page sits on a layered backdrop, not a flat solid color. Behind the UI, place 2–4 large, softly-blurred organic gradient shapes ("blobs") in the brand's mint, azure, and deep-navy tones (e.g. a mint-to-azure blob top-right, a deep-navy-to-violet blob bottom-left), blurred heavily (80–120px) and set to low opacity so they read as ambient color washes, not shapes with hard edges. This atmosphere is what the frosted-glass panels blur and refract — without it, the glass panels will look like flat dark boxes.
Color palette: a refined, more restrained take on the brand palette — same mint/navy DNA, tuned for a formal clinical-dashboard feel rather than a neon "cosmic" one. Status colors follow traffic-light logic (mint/amber/red) so meaning is instantly readable under stress.

Background / Surface: #0B0D1F (neutral graphite-navy — deliberately less purple than a typical "cosmic" dark theme), #070810 for the lowest/deepest containers (e.g. footer)
Card / Elevated surfaces: #161A33 – #1E2240, using a subtle 16–20px backdrop-blur "glass" treatment rather than flat panels; #282C4E for the highest/active elevation
Primary — brand & "Optimal" status: #00D9A0 (a slightly more clinical, less neon mint than pure #00E6A8), text-on-primary #00281C
Secondary — informational/links only (not a status color): #3FA9E0 softened azure, text-on-secondary #00283A — reserved for hyperlinks, informational badges, and secondary chart lines
"Load" status: #F5B450 warm amber — replaces the old sky-blue "Load" so status colors follow conventional traffic-light logic (mint = good, amber = caution, red = critical), which reads faster under stress than an arbitrary blue
"Overload" / critical status: #F2545B soft red, used sparingly and only for genuine alerts
Tertiary (subtle grouping, low-priority containers): #E2E5FF / deep navy #12142A variant
Muted / metadata text: #8C90AC (neutral slate-gray, no purple tint)
Outline color for card borders and dividers: #33374F at low opacity — neutral slate rather than green-gray, to keep the base palette calm and let color only appear where it's meaningful (status, actions, links)



Typography: dual-font system for clarity under stress —

Plus Jakarta Sans (weight 600–700) for headlines and large biometric numbers (BPM/HRV data-display values), sizes ranging roughly 24px–48px
Inter (weight 400–500) for all body copy, labels, form fields, and dashboard microcopy, minimum 14px, 1.5 line-height minimum for paragraphs
Never drop body text below font-weight 400



Layout:

12-column grid on desktop (>1024px) with a persistent sidebar navigation for Guru BK and Orang Tua dashboards
Single-column, mobile-first stacked cards for the Student experience (<768px), with a bottom nav or hamburger menu
2-column masonry for tablet (768–1024px)
Container max-width 1280–1440px, 24px gutter, 16px mobile / 40–64px desktop margins
Dashboard cards use 24px internal padding so data has room to breathe



Shape: rounded corners throughout, 8px for inputs, 12–16px for cards and widgets, fully rounded (pill) for status badges and tags — communicates safety and approachability without looking childish
Elevation — glass panel recipe (apply this consistently to the navbar, sidebar, and every card):

Background: brand surface color at low opacity (e.g. rgba(22, 26, 51, 0.55) for cards, slightly lighter/more transparent for the navbar), never a fully opaque fill
backdrop-filter: blur(20px) (24–32px on the navbar/sidebar, which sit above more of the background atmosphere) so the blurred blobs are visibly diffusing through the panel
Border: a thin 1px border in rgba(255,255,255,0.12), brightened to rgba(255,255,255,0.24) along just the top edge, to mimic a light-catching glass rim like real frosted glass
Shadow: soft, diffused, tinted with the panel's status/brand color at ~12–15% opacity — no hard black drop-shadows
The sidebar and top navbar must themselves be glass panels floating over the background atmosphere (not solid-fill navy blocks) — this is the single biggest gap between a "flat dark theme" and true glassmorphism
Avatar/profile chips (e.g. the user's initials badge in the top-right corner) get the same glass treatment: a circular frosted panel with a thin bright rim, not a flat solid-color circle



Core components to design formally and consistently:

Biometric card: large data-display number (e.g. "72 BPM"), a small trend sparkline, and a status pill badge in the top-right corner
Status pill: Optimal = mint bg / dark text; Load = amber bg / dark text; Overload = red bg / white text
Buttons: Primary = solid mint with dark text (high emphasis); Ghost = 1px 20%-opacity white border with white text (secondary actions); Stress-Response button = a larger 64px-tall button with a slow, gentle pulse animation, used only for "Emergency Check-in" / "Breathing Exercise" CTAs
Form fields: dark input backgrounds, 1px border, label always shown above the field (never placeholder-only), border and soft outer glow switch to the primary mint color on focus
Icons: Material Symbols, Outlined/Rounded style, consistent 2px stroke weight
Language switcher: a small, unobtrusive "ID / EN" pill toggle, styled like the Ghost button (low emphasis, doesn't compete with primary CTAs), placed in the top navigation bar (desktop) and inside the mobile menu (student view)



Motion: soft 200ms ease-out transitions for hover/active states; for loading states prefer a slow rhythmic pulse — avoid flashing, strobing, or aggressive motion, since users may be actively stressed while using this
Accessibility: minimum 44×44px hit area for every clickable element regardless of visual size; maintain strong contrast between text and background at all times
Visual reference: if attaching reference images, use them only for the glass technique — frosted translucent panels, blurred colorful background shapes, and the bright top-edge highlight on cards — not for their blue color scheme. Apply that exact technique using this project's navy/mint/amber/red palette instead.



Backend features:


Authentication: Firebase Authentication using username + password, with three distinct roles (siswa, guru_bk, orang_tua) that gate which dashboard and data each user can see.
Database: Firebase Realtime Database storing:

User profiles and role assignments, including each user's preferredLanguage (id or en)
Relationships: which student belongs to which parent, and which students are assigned ("binaan") to which Guru BK
Real-time BPM/HRV stream data and computed cognitive-stress status per student
Per-semester, per-subject academic scores
Questionnaire responses and their generated suggestions
Guru BK suggestion/intervention notes per student
Journal/article content (seeded manually via the Firebase console — no in-app editor)
Psychologist/psychiatrist consultation booking form submissions



Cloud Function: one Cloud Function powering the "Graphite" AI Assistant chat (calls an LLM API), returning responses to the quick-reply chips and free-text chat in the user's currently selected language (id or en), and always surfacing the professional-help disclaimer.
Security rules:

A siswa account can only read/write its own data
A guru_bk account can only read data for students explicitly assigned to them, and can only write to the suggestion-notes field
An orang_tua account can only read data belonging to their own linked child, with no write access to biometric or academic data



Hosting: deploy-ready for Vercel, output should be a lightweight static HTML/CSS/JS build (no heavy frontend framework), consistent with the existing Grahita Space stack.