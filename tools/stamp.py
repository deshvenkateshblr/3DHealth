#!/usr/bin/env python3
"""Stamp a build id on every local asset URL and keep share/SEO tags in every page head.

Run before each deploy:  python3 tools/stamp.py [BUILD_ID]
BUILD_ID defaults to today's date plus the short git hash.
Idempotent: safe to run repeatedly.
"""
import re, sys, glob, subprocess, datetime, html

BASE = 'https://vividnova.com/3DHealth/'
OG_IMAGE = 'shared/assets/og-image.png'
DEFAULT_DESC = ("KYH (Know Your Health) helps you understand your health across Diagnostics, "
                "Daily Routine and Diet, then walk into your doctor's visit prepared.")

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

def share_block(page, title, desc):
    url = BASE + ('' if page == 'index.html' else page)
    e = lambda x: html.escape(x, quote=True)
    return (
        '<!-- share:start -->\n'
        f'<link rel="icon" href="shared/assets/kyh_logo_final.png?v={BUILD}">\n'
        '<meta name="theme-color" content="#1f7a6d">\n'
        '<meta property="og:type" content="website">\n'
        '<meta property="og:site_name" content="KYH — Know Your Health">\n'
        f'<meta property="og:title" content="{e(title)}">\n'
        f'<meta property="og:description" content="{e(desc)}">\n'
        f'<meta property="og:url" content="{e(url)}">\n'
        f'<meta property="og:image" content="{BASE}{OG_IMAGE}?v={BUILD}">\n'
        '<meta property="og:image:width" content="1200">\n'
        '<meta property="og:image:height" content="630">\n'
        '<meta name="twitter:card" content="summary_large_image">\n'
        '<!-- share:end -->'
    )

for path in sorted(glob.glob('*.html')):
    s = open(path, encoding='utf-8').read()
    orig = s
    s = re.sub(r'<!-- share:start -->.*?<!-- share:end -->\n?', '', s, flags=re.S)
    s = re.sub(r'<link rel="icon"[^>]*>\n?', '', s)
    m = re.search(r'<title>(.*?)</title>', s, re.S)
    title = norm_title(m.group(1), path) if m else 'KYH — Know Your Health'
    if m:
        s = s.replace(m.group(0), '<title>' + html.escape(title, quote=False) + '</title>', 1)
    d = re.search(r'<meta name="description" content="([^"]*)"', s)
    desc = html.unescape(d.group(1)) if d else DEFAULT_DESC
    if not d:
        s = s.replace('</title>', '</title>\n<meta name="description" content="' + html.escape(desc) + '">', 1)
    s = s.replace('</head>', share_block(path, title, desc) + '\n</head>', 1)
    s = stamp_assets(s)
    if s != orig:
        open(path, 'w', encoding='utf-8').write(s)
        print('stamped', path)
print('build', BUILD)
