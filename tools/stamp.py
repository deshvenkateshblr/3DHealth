#!/usr/bin/env python3
"""Stamp a build id on every local asset URL and keep share/SEO tags in every page head.

Run before each deploy:  python3 tools/stamp.py [BUILD_ID]
BUILD_ID defaults to today's date plus the short git hash.
Idempotent: safe to run repeatedly.

Per page this sets the <title>, meta description, robots rule, canonical link (indexable pages),
share tags and, on the home page, structured data. It also writes sitemap.xml. The text for each
page lives in PAGES below; edit it there, not in the HTML.
When the site address changes: update BASE here, KYH_SITE_URL in shared/doctorbrief.js and the
link in kyf_teaser.html, then re-run this script.
"""
import re, sys, glob, json, subprocess, datetime, html

BASE = 'https://vividnova.com/3DHealth/'
OG_IMAGE = 'shared/assets/og-image.png'
DEFAULT_DESC = ("KYH (Know Your Health) helps you understand your health across Diagnostics, "
                "Daily Routine and Diet, then walk into your doctor's visit prepared.")

# Per-page search and share text. indexable=True: search engines may list it (canonical + sitemap).
# Everything else is a step in the personal flow or a redirect: followed, but not listed.
# Title up to 60 characters, description 70 to 160 (longer text is cut off in search results).
PAGES = {
    'index.html': dict(indexable=True,
        title="KYH \u2014 Know Your Health: prepare for your doctor's visit",
        desc="KYH (Know Your Health) turns your symptoms, daily routine and diet into ranked tests, exercises and questions for your doctor. Private and free."),
    'about.html': dict(indexable=True,
        title="About KYH \u2014 what it is and what it is not",
        desc="What KYH is and is not: a private self-check that helps you prepare for a doctor's visit. It gives no diagnosis and is not for special-care situations."),
    'profile.html': dict(indexable=True,
        title="Start your KYH health self-check \u2014 About you",
        desc="Start your KYH self-check: enter your age, sex, height, weight and lifestyle to get tests, exercises and diet priorities matched to you. Stays in your browser."),
    'symptoms.html': dict(indexable=False,
        title="Your symptoms \u2014 KYH",
        desc="Pick your symptoms and known conditions to match lab tests, exercises and nutrition priorities to you. Your answers stay in your browser."),
    'diagnostics.html': dict(indexable=False,
        title="Tests matched to you \u2014 KYH",
        desc="See the lab tests most relevant to your age, sex and symptoms, note when you last had each one, and take the list to your doctor."),
    'routine.html': dict(indexable=False,
        title="Your daily routine \u2014 KYH",
        desc="Describe a typical day: sleep, work, movement and exercise. KYH estimates your daily energy use as you go. Your answers stay in your browser."),
    'routine-config.html': dict(indexable=False,
        title="Set up your routine \u2014 KYH",
        desc="This step has moved. Describe a typical day in KYH: sleep, work, movement and exercise, with your daily energy use estimated as you go."),
    'routine-plan.html': dict(indexable=False,
        title="Exercises matched to you \u2014 KYH",
        desc="A shortlist of exercises matched to your symptoms and body profile, with the intensity of each and who should avoid it."),
    'diet.html': dict(indexable=False,
        title="Your diet: food and nutrient check \u2014 KYH",
        desc="Say how often you eat key food groups and which nutrients you get, to find the dietary gaps worth raising with your doctor."),
    'diet-synthesis.html': dict(indexable=False,
        title="Your diet priorities \u2014 KYH",
        desc="Your diet priorities in one place: estimated daily energy use, calorie target, protein, fibre and water, worked out from your answers."),
    'summary.html': dict(indexable=False,
        title="Your findings \u2014 KYH",
        desc="Your KYH findings on one page: test, routine and diet insights from your answers, ready to save or print. Self-reported, not a diagnosis."),
    'nextsteps.html': dict(indexable=False,
        title="Doctor Brief, AI prompts and videos \u2014 KYH",
        desc="Turn your KYH findings into a one-page Doctor Brief, ready-to-copy AI prompts and learning videos matched to your context."),
    'not-ready.html': dict(indexable=False,
        title="Not ready yet \u2014 KYH",
        desc="KYH pauses for pregnancy and other special-care situations. Your doctor is the right guide; here is what to ask and why."),
    'kyf_teaser.html': dict(indexable=False,
        title="KYH \u2014 Know Your Health: a short walkthrough",
        desc="Watch a short walkthrough of KYH, the private self-check that helps you prepare for your doctor's visit, then start your own."),
}

def build_id():
    if len(sys.argv) > 1:
        return sys.argv[1]
    try:
        h = subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD'], text=True).strip()
    except Exception:
        h = 'local'
    return datetime.date.today().strftime('%Y%m%d') + '-' + h

BUILD = build_id()
ASSET = re.compile(r'''((?:src|href)=["'])((?:shared/)[^"'#?]+\.(?:js|css|png|jpg|jpeg|svg|webp))(\?[^"'#]*)?(["'])''')

def stamp_assets(s):
    return ASSET.sub(lambda m: f'{m.group(1)}{m.group(2)}?v={BUILD}{m.group(4)}', s)

def norm_title(t, page=''):
    t = html.unescape(t).strip()
    if page == 'index.html':
        return 'KYH — Know Your Health'
    t = re.sub(r'\s*[—–-]\s*Know Your Health.*$', '', t)
    t = re.sub(r'\s*[—–-]\s*KYH.*$', '', t)      # drop existing "- KYH" suffix
    t = re.sub(r'\s+KYH$', '', t).strip()                   # "About You KYH"
    if not t or t.upper() == 'KYH':
        return 'KYH — Know Your Health'
    return f'{t} — KYH'

def page_url(page):
    return BASE + ('' if page == 'index.html' else page)

def share_block(page, title, desc):
    url = page_url(page)
    indexable = PAGES.get(page, {}).get('indexable', False)
    e = lambda x: html.escape(x, quote=True)
    robots = 'index, follow, max-image-preview:large' if indexable else 'noindex, follow'
    ld = ''
    if page == 'index.html':
        data = {"@context": "https://schema.org", "@type": "WebApplication", "name": "KYH \u2014 Know Your Health",
                "url": BASE, "description": desc, "applicationCategory": "HealthApplication",
                "operatingSystem": "Any", "inLanguage": "en", "browserRequirements": "Requires JavaScript"}
        ld = '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + '</script>\n'
    return (
        '<!-- share:start -->\n'
        f'<meta name="robots" content="{robots}">\n'
        + (f'<link rel="canonical" href="{e(url)}">\n' if indexable else '') +
        f'<link rel="icon" href="shared/assets/kyh_logo_final.png?v={BUILD}">\n'
        '<meta name="theme-color" content="#1f7a6d">\n'
        '<meta property="og:type" content="website">\n'
        '<meta property="og:locale" content="en_IN">\n'
        '<meta property="og:site_name" content="KYH — Know Your Health">\n'
        f'<meta property="og:title" content="{e(title)}">\n'
        f'<meta property="og:description" content="{e(desc)}">\n'
        f'<meta property="og:url" content="{e(url)}">\n'
        f'<meta property="og:image" content="{BASE}{OG_IMAGE}?v={BUILD}">\n'
        '<meta property="og:image:width" content="1200">\n'
        '<meta property="og:image:height" content="630">\n'
        '<meta property="og:image:alt" content="KYH \u2014 Know Your Health">\n'
        '<meta name="twitter:card" content="summary_large_image">\n'
        + ld +
        '<!-- share:end -->'
    )

def check_text(page, title, desc):
    """Fail loudly on text that search engines would cut off or that two pages share."""
    problems = []
    if len(title) > 60: problems.append(f'title is {len(title)} characters (max 60)')
    if not 70 <= len(desc) <= 160: problems.append(f'description is {len(desc)} characters (70 to 160)')
    return [f'{page}: {x}' for x in problems]

problems, seen_titles, seen_descs = [], {}, {}
for path in sorted(glob.glob('*.html')):
    s = open(path, encoding='utf-8').read()
    orig = s
    s = re.sub(r'<!-- share:start -->.*?<!-- share:end -->\n?', '', s, flags=re.S)
    s = re.sub(r'<link rel="icon"[^>]*>\n?', '', s)
    s = re.sub(r'<meta name="robots"[^>]*>\n?', '', s)
    s = re.sub(r'<link rel="canonical"[^>]*>\n?', '', s)
    spec = PAGES.get(path)
    m = re.search(r'<title>(.*?)</title>', s, re.S)
    title = spec['title'] if spec else (norm_title(m.group(1), path) if m else 'KYH \u2014 Know Your Health')
    if m:
        s = s.replace(m.group(0), '<title>' + html.escape(title, quote=False) + '</title>', 1)
    d = re.search(r'<meta name="description" content="[^"]*">', s)
    desc = spec['desc'] if spec else (html.unescape(re.search(r'content="([^"]*)"', d.group(0)).group(1)) if d else DEFAULT_DESC)
    tag = '<meta name="description" content="' + html.escape(desc) + '">'
    s = s.replace(d.group(0), tag, 1) if d else s.replace('</title>', '</title>\n' + tag, 1)
    s = s.replace('</head>', share_block(path, title, desc) + '\n</head>', 1)
    s = stamp_assets(s)
    problems += check_text(path, title, desc)
    if title in seen_titles: problems.append(f'{path}: same title as {seen_titles[title]}')
    if desc in seen_descs: problems.append(f'{path}: same description as {seen_descs[desc]}')
    seen_titles.setdefault(title, path); seen_descs.setdefault(desc, path)
    if not spec: problems.append(f'{path}: not listed in PAGES')
    if s != orig:
        open(path, 'w', encoding='utf-8').write(s)
        print('stamped', path)

# sitemap.xml: indexable pages only, dated by the last commit that touched each page
def last_changed(page):
    try:
        d = subprocess.check_output(['git', 'log', '-1', '--format=%cs', '--', page], text=True).strip()
        return d or datetime.date.today().isoformat()
    except Exception:
        return datetime.date.today().isoformat()
urls = [p for p, v in PAGES.items() if v['indexable']]
urls.sort(key=lambda p: (p != 'index.html', p))
sitemap = ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + ''.join(f'  <url><loc>{html.escape(page_url(p))}</loc><lastmod>{last_changed(p)}</lastmod></url>\n' for p in urls)
           + '</urlset>\n')
old = open('sitemap.xml', encoding='utf-8').read() if glob.glob('sitemap.xml') else ''
if sitemap != old:
    open('sitemap.xml', 'w', encoding='utf-8').write(sitemap)
    print('wrote sitemap.xml')

print('build', BUILD)
if problems:
    print('\nSEO problems:'); [print('  ' + x) for x in problems]
    sys.exit(1)
