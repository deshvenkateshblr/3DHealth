# KYH (3DHealth) — Site Map & Functionality

KYH is a browser-only, privacy-first self-assessment app. Users move through a guided path (**Fine → Diagnostics → Routine → Diet → Great**) and finish with a plan to take to their doctor. State lives in the browser (`loadState` / `persistState` / `goTo` in `shared/utils.js`); nothing is sent to a server. The page-to-page backup payload travels in the URL `#fragment` (`#d=…`, `#reason=…`), which browsers never send to servers or in Referer headers, and it is removed from the address bar once stored. Legacy `?d=` links still load.

## User flow

```
index → about → profile → symptoms → diagnostics → routine → routine-config → routine-plan → diet → diet-synthesis → summary → nextsteps
                   └──(pregnancy / special-care)──→ not-ready
```

## Pages

| # | Page | Step | What it does |
|---|------|------|--------------|
| 1 | `index.html` | Landing | Pitch, privacy badge, "Start Assessment" CTA, collapsible walkthrough video, three outcome cards (Decode / Optimize / Take Action). |
| 2 | `about.html` | Intro | Explains what KYH is, what it is not (not advice, not for special care), and the disclaimer. Gateway to the profile. |
| 3 | `profile.html` | Fine | "About You" form: sex, age, height, weight, waist, live BMI and waist-to-height gauges, India-specific cutoffs toggle, smoking, alcohol, reproductive health, PCOS, family history, dietary and cuisine preference. Optional session memory toggle. Screens out special-care cases. |
| 4 | `not-ready.html` | Safety exit | Shown for pregnancy or other special-care status. Pauses the flow and points to a clinician. Link back to profile. |
| 5 | `symptoms.html` | Fine | Searchable, categorised symptom and known-condition picker, plus optional vitals (fasting glucose, resting heart rate). Shapes every later recommendation. |
| 6 | `diagnostics.html` | Diagnostics | Ranked **top 10 lab tests** for the person's age, sex, risk profile and symptoms. Per-test last-done recency and optional self-reported result (within range / flagged / not sure). |
| 7 | `routine.html` | Routine (1/2) | Select the activities done in a typical week from a MET-based activity database, pre-filled with a baseline. |
| 8 | `routine-config.html` | Routine (2/2) | Set frequency and duration per activity (24-hour ledger), steps per day, daylight outdoors, dinner-to-sleep gap, post-meal walk. Estimates daily energy use (TDEE). |
| 9 | `routine-plan.html` | Routine | Ranked **top 10 exercises** tailored to symptoms, body profile and schedule, with safety tips. |
| 10 | `diet.html` | Diet | Food-quality frequency matrix and nutrient-by-nutrient questions. Ranks nutrient priorities, with a soft gate for unanswered items. |
| 11 | `diet-synthesis.html` | Diet | Synthesises answers into diet priorities, target calories, protein, fibre and water. |
| 12 | `summary.html` | Great | Insight cards grouped by About you / Diagnostics / Routine / Diet. Expandable details, **save findings (.txt)**, **print**. |
| 13 | `nextsteps.html` | Great | Tabbed hub: **Summary**, **Doctor Brief** (printable one-page A4 list of questions to ask), **AI Prompt** (four copy-ready prompts with the user's context), **Videos** (curated, symptom-matched expert videos). |
| 14 | `kyf_teaser.html` | Marketing | Standalone teaser ("Know Your Health — personalized path to your wellness"). Not linked from the main flow. |

## Shared modules (`shared/`)

| File | Purpose |
|------|---------|
| `styles.css` | Design system (paper/teal/amber palette, serif + mono type, masthead, cards, buttons). |
| `utils.js` | State, `goTo`, unit conversion, BMI/WHtR, risk categories, 5-step progress header, TDEE / water / protein / fibre estimators. |
| `insights.js` | Turns saved state into insight cards and the AI prompt context. |
| `doctorbrief.js` | Builds the printable Doctor Brief. |
| `summary-page.js` | Page logic for `summary.html`. |
| `icons.js` | Shared SVG icon set. |
| `data.symptoms.js`, `data.diagnostics.js`, `data.activities.js`, `data.exercises.js`, `data.diet.js`, `data.cuisine.js`, `data.routine.js` | Content databases. `data.routine.js` is currently empty. |
| `data.videos.sb.js`, `data.videos.nbs.js`, `drsk_video_data.js`, `ayushyp_video_data.js`, `curated_routine_video_data.js` | Curated video libraries. |
| `assets/` | Logos and hero image. |

## Observations

- `index.html` links only to `about.html`; there is no direct entry to later steps (by design).
- `kyf_teaser.html` is an orphan page, and `data.routine.js` is empty.
- Every step page falls back to an "We need your profile first" state if the profile is missing.
