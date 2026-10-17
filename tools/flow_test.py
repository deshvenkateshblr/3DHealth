#!/usr/bin/env python3
"""KYH smoke test: drives the real click path (profile -> symptoms -> diagnostics -> routine ->
exercises -> diet -> diet synthesis -> summary -> next steps) in headless Chromium, then runs
a few state-injected regression checks. It starts its own local web server, so nothing needs to
be running first.

    pip install playwright && playwright install chromium      (once)
    python3 tools/flow_test.py                                  (exit code 0 = all passed)

Add --headed to watch it. Every page is also checked for script errors and for local files that
fail to load. Keep the expectations here in step with the app: when wording or a rule changes on
purpose, change the matching check below.
"""
import contextlib
import functools
import http.server
import json
import re
import socket
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
STATE_KEY = 'chart_state_v1'
results = []          # (ok, name, detail)


def check(ok, name, detail=''):
    results.append((bool(ok), name, detail))
    print(('  ok    ' if ok else '  FAIL  ') + name + (('  -> ' + str(detail)) if (detail and not ok) else ''))
    return bool(ok)


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


@contextlib.contextmanager
def serve():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        port = s.getsockname()[1]
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', port), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    try:
        yield f'http://127.0.0.1:{port}/'
    finally:
        httpd.shutdown()


def watch(page, problems):
    page.on('pageerror', lambda e: problems.append(('script error', page.url.split('/')[-1], str(e)[:160])))
    page.on('response', lambda r: problems.append(('http %s' % r.status, r.url.split('/')[-1], ''))
            if r.status >= 400 and r.url.startswith('http://127.0.0.1') else None)


def state_of(page):
    return page.evaluate(f"JSON.parse(sessionStorage.getItem('{STATE_KEY}') || 'null')")


def inject(page, base, state, then):
    page.goto(base + 'about.html')
    page.evaluate("([k, s]) => sessionStorage.setItem(k, JSON.stringify(s))", [STATE_KEY, state])
    page.goto(base + then)
    page.wait_for_timeout(700)


def card_names(page):
    return page.eval_on_selector_all('.test-card', 'els => els.map(e => e.dataset.exercise || e.dataset.test || "")')


def answer_all_no(page):
    n = page.locator('.test-card').count()
    for i in range(n):
        page.locator(f'label[for$="-{i}-no"]').first.click()
    return n


def full_flow(page, base, problems):
    print('\nFull flow, real clicks')
    # --- home
    page.goto(base + 'index.html')
    logo = page.evaluate("[...document.images].filter(i => /kyh_logo/.test(i.src)).map(i => [i.naturalWidth, i.complete])")
    check(logo and all(w > 0 and c for w, c in logo), 'home: logo loads', logo)
    page.locator('a[href="profile.html"], a[href^="profile.html#"]').first.click()
    page.wait_for_url(re.compile(r'profile\.html'))

    # --- profile
    page.select_option('#f-sex', 'Female')
    page.fill('#f-age', '52')
    page.fill('#f-height-cm', '160')
    page.fill('#f-weight-kg', '70')
    page.fill('#f-waist-cm', '92')
    page.select_option('#f-smoking', 'Never')
    page.select_option('#f-alcohol', 'Occasional')
    page.select_option('#f-repro-status', 'Post-menopausal')
    page.select_option('#f-diet-type', 'Vegetarian')
    page.evaluate("() => { const s = document.getElementById('f-cuisine-type'); if (s.options.length < 2) throw new Error('no cuisines'); }")
    page.select_option('#f-cuisine-type', index=1)
    page.locator('#profile-form button[type=submit]').click()
    page.wait_for_url(re.compile(r'symptoms\.html'))
    check(True, 'profile: form accepted, moved to symptoms')

    # --- symptoms
    for s in ('Back Pain', 'Fatigue', 'Insomnia'):
        page.fill('#symptom-input', s)
        page.locator(f'.browse-chip[data-s="{s}"]').first.click()
    page.fill('#symptom-input', '')
    page.locator('#continue-btn').click()
    page.wait_for_url(re.compile(r'diagnostics\.html'))
    check(sorted(state_of(page)['profile']['symptoms']) == ['Back Pain', 'Fatigue', 'Insomnia'], 'symptoms: three picked and carried forward')

    # --- diagnostics
    page.wait_for_selector('.test-card')
    n = answer_all_no(page)
    check(0 < n <= 10, 'diagnostics: cards shown, at most 10', n)
    page.locator('#continue-btn').click()
    page.wait_for_url(re.compile(r'routine\.html'))

    # --- routine (nothing pre-selected; daily and weekly)
    page.wait_for_selector('#continue-btn')
    check(page.locator('.browse-chip.selected').count() == 0, 'routine: nothing pre-selected')
    page.locator('.browse-chip[data-id="sleep-7"]').click()
    page.locator('.browse-chip[data-id="act_015"]').click()
    page.locator('label[for="hd-act_015-480"]').click()
    page.locator('.browse-chip[data-id="act_101"]').click()
    page.locator('label[for="hd-act_101-30"]').click()
    page.locator('.browse-chip[data-id="act_207"]').click()          # Weightlifting (Light), weekly
    page.locator('label[for="pw-act_207-3"]').click()
    page.locator('label[for="ln-act_207-60"]').click()
    tally = page.inner_text('#rt-tally')
    check(re.search(r'\d+(\.\d)? / 24 hrs described', tally), 'routine: 24-hour tally shown', tally)
    nudge = page.inner_text('#rt-nudge')
    check('Not in the daily total' in nudge and re.search(r'about [\d,]+ kcal each time', nudge), 'routine: weekly activity priced and kept out of the daily total', nudge[-200:])
    page.locator('#continue-btn').click()
    page.wait_for_url(re.compile(r'routine-plan\.html'))
    routine = state_of(page)['routine']
    check(routine.get('estimatedCalories', 0) > 1000, 'routine: daily burn saved', routine.get('estimatedCalories'))
    check(any(a.get('freq') == 'weekly' for a in routine['activities']), 'routine: weekly activity saved')

    # --- exercises
    page.wait_for_selector('.test-card')
    check(page.inner_text('h2').strip() == 'Your matched exercises', 'exercises: heading says "matched"', page.inner_text('h2'))
    n = answer_all_no(page)
    check(n == 10, 'exercises: ten cards', n)
    page.locator('#continue-btn').click()
    page.wait_for_url(re.compile(r'diet\.html'))

    # --- diet: the six food-quality markers are required; nutrients use the soft gate (continue anyway)
    page.wait_for_selector('#nutrient-list .test-card')
    page.locator('#continue-btn').click()
    check('Please answer all Food Quality markers' in page.inner_text('#answer-counter'), 'diet: unanswered food markers are asked for')
    marker_foods = page.eval_on_selector_all('.fq-desktop-only input[type=radio][data-food]', 'els => [...new Set(els.map(e => e.dataset.food))]')
    for food in marker_foods:
        page.locator(f'.fq-desktop-only input[data-food="{food}"][value="1-2x/Wk"]').check()
    check(len(marker_foods) == 6, 'diet: six food markers answered', marker_foods)
    page.locator('#continue-btn').click()
    page.locator('#soft-gate-continue-link').click()
    page.wait_for_url(re.compile(r'diet-synthesis\.html'))
    diet = state_of(page)['diet']
    check(diet.get('target', {}).get('cal', 0) >= 1200, 'diet: calorie target at or above the intake floor', diet.get('target'))

    # --- diet synthesis -> summary
    page.wait_for_selector('a.btn:has-text("Finish")')
    page.locator('a.btn:has-text("Finish")').click()
    page.wait_for_url(re.compile(r'summary\.html'))
    page.wait_for_timeout(800)
    body = page.inner_text('body')
    check('Your weekly activities' in body, 'summary: weekly activities insight shown')
    check('Your estimated daily energy use' in body, 'summary: daily energy insight shown')
    brief = page.evaluate("""() => { const d = document.createElement('div');
        KYHDoctorBrief.mountDoctorBrief(d, JSON.parse(sessionStorage.getItem('%s'))); return d.textContent; }""" % STATE_KEY)
    check('Weekly activities:' in brief and 'kcal a week' in brief, 'doctor brief: weekly activities line present')
    check('Typical day:' in brief, 'doctor brief: typical day present')

    # --- next steps
    page.goto(base + 'nextsteps.html')
    page.wait_for_timeout(900)
    ns = page.inner_text('body')
    check('prepare for your doctor consultation' in ns.lower(), 'next steps: doctor prep shown')   # headings are styled in capitals
    check(page.locator('.video-card, [data-video-id], a[href*="youtube.com/watch"]').count() > 0, 'next steps: learning videos listed')


def regressions(page, base):
    print('\nRegression checks, injected state')
    prof = {'age': 45, 'sex': 'Female', 'heightCm': 160, 'weightKg': 65, 'bmi': 25.4, 'whtr': 0.5,
            'symptoms': ['Balance Issues', 'Osteoporosis', 'Muscle Weakness', 'Memory Loss', 'Cognitive Decline']}
    seniors = ("Farmer's Walk (Loaded Carries)", 'Shadow Boxing / Light Sparring (Seated or Standing)', 'Static Lunge (Split Squat Hold)')
    shown = {}
    for age in (64, 65):
        inject(page, base, {'profile': dict(prof, age=age), 'vitals': {}, 'diagnostics': {}, 'routine': {}}, 'routine-plan.html')
        names = card_names(page)
        shown[age] = [x for x in seniors if x in names]
        check(len(names) == 10, f'age {age}: exercise list still fills 10', len(names))
        check('Senior Citizen' not in page.inner_text('body'), f'age {age}: derived flag is never printed')
    check(len(shown[64]) >= 1, 'age 64: moderate-to-high items can still appear', shown[64])
    check(shown[65] == [], 'age 65: moderate-to-high items are hidden', shown[65])

    # incoming links are untrusted: red flags are dropped when state arrives in a #d= fragment
    page.goto(base + 'about.html')
    link = page.evaluate("p => encodeStateParam(p)", {'profile': dict(prof, symptoms=['Chest Pain', 'Back Pain', 'Fainting / Passing Out']), 'vitals': {}, 'diagnostics': {}, 'routine': {}})
    page.goto(base + 'symptoms.html#d=' + link)
    page.wait_for_timeout(700)
    st = state_of(page)
    check(st and 'Chest Pain' not in st['profile']['symptoms'] and 'Fainting / Passing Out' not in st['profile']['symptoms'] and 'Back Pain' in st['profile']['symptoms'],
          'red-flag symptoms are stripped from an incoming link', st and st['profile']['symptoms'])

    # a weekly-only routine must not change the daily burn
    base_acts = [{'id': 'act_011', 'hours': 7, 'mins': 0, 'freq': 'daily'}, {'id': 'act_015', 'hours': 8, 'mins': 0, 'freq': 'daily'}]
    weekly = base_acts + [{'id': 'act_207', 'freq': 'weekly', 'perWeek': 3, 'hours': 1, 'mins': 0}]
    burns = []
    for acts in (base_acts, weekly):
        inject(page, base, {'profile': prof, 'vitals': {}, 'diagnostics': {}, 'routine': {'activities': acts, 'activitiesConfirmed': True}}, 'summary.html')
        burns.append(page.evaluate("estimateTdeeFromActivities(JSON.parse(sessionStorage.getItem('%s')).routine.activities, 65, undefined, JSON.parse(sessionStorage.getItem('%s')).profile)" % (STATE_KEY, STATE_KEY)))
    check(burns[0] == burns[1] and burns[0] > 1000, 'weekly activities do not change the daily burn', burns)

    # pregnancy is out of scope: the profile page pauses with a care message instead of continuing
    page.goto(base + 'about.html')
    page.evaluate("k => sessionStorage.removeItem(k)", STATE_KEY)
    page.goto(base + 'profile.html')
    page.select_option('#f-sex', 'Female')
    page.select_option('#f-repro-status', 'Currently pregnant')
    page.wait_for_timeout(400)
    check('Your pregnancy deserves specialized care' in page.inner_text('body'), 'pregnancy: profile pauses with a care message')


def main():
    headed = '--headed' in sys.argv
    problems = []
    with serve() as base, sync_playwright() as p:
        browser = p.chromium.launch(headless=not headed)
        page = browser.new_page(viewport={'width': 1280, 'height': 900})
        watch(page, problems)
        try:
            full_flow(page, base, problems)
        except Exception as e:                       # the flow stops at its first failure; later steps depend on it
            check(False, 'full flow stopped', f'{type(e).__name__}: {str(e).splitlines()[0][:200]}  (at {page.url.split("/")[-1][:60]})')
        try:
            regressions(page, base)
        except Exception as e:
            check(False, 'regression checks stopped', f'{type(e).__name__}: {str(e).splitlines()[0][:200]}')
        browser.close()
    print('\nPage health')
    check(not problems, 'no script errors or failed local files on any page', problems[:6])
    failed = [r for r in results if not r[0]]
    print(f'\n{len(results) - len(failed)} passed, {len(failed)} failed')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
