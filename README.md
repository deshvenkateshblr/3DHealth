# KYH — Know Your Health

A free, private health self-assessment that helps you prepare for a doctor's visit.
It turns your symptoms, daily routine and diet into ranked tests, exercises and
questions to take to your doctor. It runs entirely in the browser: nothing is
sent to a server. It is not medical advice.

Live: https://vividnova.com/3DHealth/

## Run locally
    python3 -m http.server 8000     # then open http://localhost:8000

## Everyday commands
    python3 tools/stamp.py          # before every commit: cache-busting, meta tags, sitemap.xml
    python3 tools/flow_test.py      # end-to-end smoke test (needs Playwright + Chromium)

## Structure
- `*.html` — one page per step (index, profile, symptoms, routine, diagnostics, diet, summary, next steps, about)
- `kyf_teaser.html` — teaser launch page (video, then forwards to the home page)
- `shared/` — styles, utilities, data files and assets
- `tools/` — build helpers and tests

## When the site address changes
1. `BASE` in `tools/stamp.py`
2. `KYH_SITE_URL` in `shared/doctorbrief.js`
3. The link in `kyf_teaser.html`
4. Re-run `python3 tools/stamp.py`
Also place `sitemap.xml` and a `robots.txt` pointing to it at the domain root.

## Licence and content
All rights reserved (see `LICENSE`). The code is public for transparency, so anyone can see what the app does with their data (nothing leaves the browser). It is not licensed for reuse. Linked videos and guideline material belong to their owners. KYH is not medical advice.
