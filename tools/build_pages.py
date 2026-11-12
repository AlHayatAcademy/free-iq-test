"""
IQ Test Lab page generator. Produces the static HTML pages, sitemap, robots, manifest and service worker.

  python tools/build_pages.py                                  # GitHub Pages project site (default URL below)
  python tools/build_pages.py --url https://example.com --clean-urls --email hello@example.com   # Cloudflare, root domain
  python tools/build_pages.py --name "My Brand"                # change the brand name everywhere

Modes
  default      links use relative paths and .html files, so the site works from ANY sub-path
               (for example https://USER.github.io/REPO/) and also from a root domain.
  --clean-urls links look like /test and /iq-score-chart. Only use on a root domain with a host that
               supports clean URLs (Cloudflare Pages does; GitHub Pages does not).
"""
import argparse, json, math, os, re
from urllib.parse import urlparse

ap = argparse.ArgumentParser()
ap.add_argument('--url', default='https://drimranhayat.github.io/free-iq-test', help='public base URL, no trailing slash')
ap.add_argument('--name', default='IQ Test Lab', help='brand name')
ap.add_argument('--clean-urls', action='store_true', help='use /page style URLs (root domain on Cloudflare Pages)')
ap.add_argument('--email', default='', help='contact email shown on the privacy page')
ap.add_argument('--og', action='store_true', help='also regenerate assets/img/og-image.png (needs Pillow)')
ARGS = ap.parse_args()

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = ARGS.name
DOMAIN = ARGS.url.rstrip('/')
CLEAN = ARGS.clean_urls
BASE = urlparse(DOMAIN).path.rstrip('/')
DATE = '2026-11-12'
DATE_HUMAN = 'November 12, 2026'
SLUG = re.sub(r'[^a-z0-9]+', '', SITE.lower()) or 'site'

PAGES = {
    '/test': 'test.html', '/iq-score-chart': 'iq-score-chart.html', '/how-iq-tests-work': 'how-iq-tests-work.html',
    '/what-is-iq': 'what-is-iq.html', '/iq-test-sample-questions': 'iq-test-sample-questions.html',
    '/online-vs-professional-iq-test': 'online-vs-professional-iq-test.html', '/iq-test-tips': 'iq-test-tips.html',
    '/privacy': 'privacy.html', '/terms': 'terms.html',
}

LOGO = ('<svg class="logo-mark" viewBox="0 0 28 28" aria-hidden="true" focusable="false">'
        '<circle class="ring" cx="14" cy="14" r="11"/><circle class="dot" cx="14" cy="14" r="5.5"/></svg>')

NAV = [('/', 'Free IQ test'), ('/iq-score-chart', 'IQ score chart'), ('/iq-test-sample-questions', 'Sample questions'),
       ('/what-is-iq', 'What is IQ?'), ('/how-iq-tests-work', 'How it works')]

# (path, anchor text, one-line description) used for "Keep reading" blocks and the home page
LEARN = [
    ('/iq-score-chart', 'IQ score chart', 'What each IQ range means, with percentiles and a bell curve.'),
    ('/what-is-iq', 'What is IQ?', 'Meaning, history, the scale and what a score can and cannot tell you.'),
    ('/iq-test-sample-questions', 'IQ test sample questions', 'Eight practice questions with answers and explanations.'),
    ('/online-vs-professional-iq-test', 'Online vs professional IQ test', 'How accurate online tests are and when to see a psychologist.'),
    ('/iq-test-tips', 'How to take an IQ test', 'Ten practical tips for your best result.'),
    ('/how-iq-tests-work', 'How our IQ test works', 'Scoring, accuracy and limits, explained openly.'),
]


# ----------------------------------------------------------------- helpers
def canon(path):
    if path == '/':
        return DOMAIN + '/'
    return DOMAIN + (path if CLEAN else '/' + PAGES.get(path, path.lstrip('/') + '.html'))


def localize(html, filename):
    """Rewrite root-absolute href/src values so the site works under a sub-path (non-clean mode)."""
    if CLEAN:
        return html
    is404 = filename == '404.html'
    pre = (BASE + '/') if is404 else ''

    def repl(m):
        attr, path = m.group(1), m.group(2)
        if path == '/':
            new = (BASE + '/') if is404 else './'
        elif path in PAGES:
            new = pre + PAGES[path]
        elif path.startswith('/assets/') or path in ('/favicon.svg', '/manifest.webmanifest'):
            new = pre + path[1:]
        else:
            return m.group(0)
        return f'{attr}="{new}"'
    return re.sub(r'(href|src)="(/[^"#]*)"', repl, html)


def write(name, content):
    p = os.path.join(OUT, name)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    if name.endswith('.html'):
        content = localize(content, name)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)


def head(title, desc, path, robots='index,follow,max-image-preview:large', ld=None, og_type='website'):
    url = canon(path)
    blocks = ''.join('<script type="application/ld+json">' + json.dumps(o, ensure_ascii=False) + '</script>\n' for o in (ld or []))
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta name="robots" content="{robots}">
<meta name="theme-color" content="#F4F7FB" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0B1222" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="{SITE}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{DOMAIN}/assets/img/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{SITE}: free IQ test with instant results">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/assets/css/style.css">
{blocks}</head>
<body>
<a class="skip" href="#main">Skip to content</a>
'''


def header(current):
    links = ''.join(f'<a href="{h}"' + (' aria-current="page"' if h == current else '') + f'>{t}</a>' for h, t in NAV)
    return f'''<header class="site-head"><div class="wrap">
<a class="logo" href="/" aria-label="{SITE} home">{LOGO}<span>{SITE}</span></a>
<nav class="site-nav" aria-label="Main">{links}</nav>
</div></header>
<main id="main">
'''


def footer():
    learn = ''.join(f'<li><a href="{p}">{t}</a></li>' for p, t, _ in LEARN)
    return f'''</main>
<footer class="site-foot"><div class="wrap cols">
<div><a class="logo" href="/">{LOGO}<span>{SITE}</span></a>
<p>{SITE} offers a free online IQ test for curiosity and self-insight. It is not a clinical or diagnostic assessment and is not age-adjusted.</p></div>
<div><h2>Free IQ test</h2><ul><li><a href="/test">Take the IQ test</a></li>{learn}</ul></div>
<div><h2>About</h2><ul><li><a href="/privacy">Privacy policy</a></li><li><a href="/terms">Terms of use</a></li></ul><p class="small">&copy; 2026 {SITE}</p></div>
</div></footer>
'''


def scripts(*names):
    return ''.join(f'<script src="/assets/js/{n}.js" defer></script>\n' for n in list(names) + ['pwa']) + '</body>\n</html>\n'


def crumbs(name):
    return f'<nav class="crumbs wrap" aria-label="Breadcrumb"><a href="/">Home</a> / <span>{name}</span></nav>'


def breadcrumb_ld(name, path):
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN + '/'},
        {'@type': 'ListItem', 'position': 2, 'name': name, 'item': canon(path)}]}


def article_ld(headline, desc, path):
    return {'@context': 'https://schema.org', '@type': 'Article', 'headline': headline, 'description': desc,
            'datePublished': DATE, 'dateModified': DATE, 'inLanguage': 'en',
            'image': DOMAIN + '/assets/img/og-image.png',
            'author': {'@type': 'Organization', 'name': SITE, 'url': DOMAIN + '/'},
            'publisher': {'@type': 'Organization', 'name': SITE, 'logo': {'@type': 'ImageObject', 'url': DOMAIN + '/assets/img/icon-512.png'}},
            'mainEntityOfPage': canon(path)}


def faq_ld(items):
    return {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in items]}


def faq_html(items):
    return ''.join(f'<details class="faq"><summary>{q}</summary><p>{a}</p></details>' for q, a in items)


def toc(items):
    return ('<nav class="toc" aria-label="On this page"><p class="toc-h">On this page</p><ul>' +
            ''.join(f'<li><a href="#{i}">{t}</a></li>' for i, t in items) + '</ul></nav>')


def related(current):
    items = ''.join(f'<li><a href="{p}">{t}</a><span>{d}</span></li>' for p, t, d in LEARN if p != current)
    return f'<aside class="keep" aria-label="Keep reading"><h2>Keep reading</h2><ul>{items}</ul></aside>'


def cta(text='Take the free IQ test'):
    return (f'<div class="callout"><strong>{text}.</strong> 24 questions, about 20 minutes, no sign-up. '
            f'<a href="/test">Start the test</a> and get a detailed report when you finish.</div>')


def updated():
    return f'<p class="meta">Updated {DATE_HUMAN}</p>'


def bell_static():
    W, H, pad, x0, x1, top, base = 600, 210, 24, 55, 145, 24, 174
    X = lambda v: round(pad + (v - x0) / (x1 - x0) * (W - 2 * pad), 1)
    Y = lambda v: round(base - math.exp(-0.5 * ((v - 100) / 15) ** 2) * (base - top), 1)
    d = f'M{X(x0)},{base}' + ''.join(f' L{X(v)},{Y(v)}' for v in range(x0, x1 + 1)) + f' L{X(x1)},{base} Z'
    ticks = ''.join(
        f'<line class="bell-tick" x1="{X(t)}" x2="{X(t)}" y1="{base}" y2="{base+5}"/>'
        f'<text class="bell-lbl" x="{X(t)}" y="{base+20}" text-anchor="middle">{t}</text>' for t in (70, 85, 100, 115, 130))
    return (f'<svg class="bell" viewBox="0 0 {W} {H}" role="img" aria-label="Bell curve of IQ scores centred on 100. '
            f'About 68 percent of people score between 85 and 115.">'
            f'<path class="bell-all" d="{d}"/><line class="bell-base" x1="{pad}" x2="{W-pad}" y1="{base}" y2="{base}"/>{ticks}</svg>')


def content_page(fname, path, name, title, desc, headline, body, faq=None, og_type='article'):
    ld = [breadcrumb_ld(name, path), article_ld(headline, desc, path)]
    if faq:
        ld.append(faq_ld(faq))
    html = (head(title, desc, path, ld=ld, og_type=og_type) + header(path) + crumbs(name) +
            f'<div class="wrap prose">\n{body}\n{related(path)}\n</div>\n' + footer() + scripts('config'))
    write(fname, html)


# ----------------------------------------------------------------- HOME
HOME_FAQ = [
    ('Is this IQ test really free?',
     'Yes. You can take the full test and see your estimated IQ, percentile, skills profile and detailed report without paying or giving an email address.'),
    ('Is there an IQ test without registration?',
     'Yes. This test needs no account, no email address and no payment details. Open the test, answer the questions and your results appear when you finish.'),
    ('How accurate is an online IQ test?',
     'A short online test gives a rough estimate. This one has 24 questions, so the likely range around your score is about 11 points either way. Professional tests are longer, supervised and standardised on thousands of people. Treat your result as a useful indication, not a diagnosis.'),
    ('How many questions are on the IQ test and how long does it take?',
     'There are 24 questions in four sections of six: patterns, numbers, words and logic. Most people finish in 15 to 22 minutes. There is a 30-minute overall limit, and your progress saves on your device.'),
    ('What is a good IQ score?',
     'IQ scores are set so that the average is 100. About half of people score between 90 and 109, and about 2 in 100 score 130 or above. See the IQ score chart for every range.'),
    ('What IQ score do you need for Mensa?',
     'Mensa membership requires a score at or above the 98th percentile on an approved, supervised test. On a scale with a standard deviation of 15 that is roughly an IQ of 130, although the exact number depends on the test. An online estimate cannot qualify you.'),
    ('What does the IQ test measure?',
     'Four reasoning skills: pattern reasoning with shapes, number sequences, verbal reasoning with word relationships, and logical reasoning. Each skill is scored separately so you can see your profile, not just one number.'),
    ('Can I take the IQ test on my phone?',
     'Yes. The test is designed for phones, tablets and computers, works in any modern browser and can be installed like an app. Use a quiet place and avoid interruptions for the most accurate result.'),
    ('Do you store my answers or personal data?',
     'No account or email is needed. Your answers and results stay in your browser on your own device so you can resume and view your report. They are not sent to our servers.'),
    ('Can children take this test?',
     'It is designed for ages 16 and over and is not age-adjusted, so scores for children would not be meaningful. For a child, ask a qualified educational or clinical psychologist.'),
    ('Can I retake the test to improve my score?',
     'You can, but the questions stay the same, so retaking soon mostly measures your memory of them. Wait at least four weeks, and use the practice tips in your report in between.'),
]


def build_home():
    title = f'Free IQ Test Online, Instant Results | {SITE}'
    desc = 'Take a free IQ test online: 24 questions, about 20 minutes, no sign-up. Get your estimated IQ, percentile and a detailed report instantly.'
    ld = [
        {'@context': 'https://schema.org', '@type': 'Organization', 'name': SITE, 'url': DOMAIN + '/',
         'logo': DOMAIN + '/assets/img/icon-512.png'},
        {'@context': 'https://schema.org', '@type': 'WebSite', 'name': SITE, 'url': DOMAIN + '/', 'inLanguage': 'en'},
        {'@context': 'https://schema.org', '@type': 'WebApplication', 'name': f'{SITE} Free IQ Test', 'url': DOMAIN + '/',
         'applicationCategory': 'EducationalApplication', 'operatingSystem': 'Any', 'browserRequirements': 'Requires JavaScript',
         'inLanguage': 'en', 'description': desc, 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}},
        faq_ld(HOME_FAQ),
    ]
    learn = ''.join(f'<li><a href="{p}">{t}</a><span>{d}</span></li>' for p, t, d in LEARN)
    html = head(title, desc, '/', ld=ld) + header('/') + f'''
<div class="wrap hero">
<div>
<h1>Free IQ test online: instant score and detailed report</h1>
<p class="lede">Twenty-four reasoning questions across patterns, numbers, words and logic. About 20 minutes, no sign-up. When you finish, you get your estimated IQ, your percentile and a full breakdown of how you did.</p>
<div class="row"><a class="btn btn-primary btn-lg" href="/test">Start the free IQ test</a><a class="btn btn-ghost" href="/how-iq-tests-work">How scoring works</a></div>
<ul class="chips-line"><li>No email or registration</li><li>Works on phone and desktop</li><li>Progress saves automatically</li><li>Honest margin of error</li></ul>
</div>
<aside class="sample" aria-label="Sample IQ test question">
<div id="sample"><p><strong>Sample question.</strong> Turn on JavaScript to try one here, or start the test.</p></div>
</aside>
</div>

<section class="band"><div class="wrap prose">
<h2>What is an IQ test?</h2>
<p>An IQ test is a set of reasoning problems whose results are converted into a score that compares you with other people. On the standard scale the average is 100, and about two thirds of people score between 85 and 115. Most IQ tests combine different kinds of question, such as pattern puzzles, number sequences, word relationships and logic, because intelligence is not one single skill.</p>
<p>New to the idea? Read <a href="/what-is-iq">what IQ means and where it came from</a>, then see <a href="/iq-score-chart">what each IQ score range means</a>.</p>
</div></section>

<section class="band"><div class="wrap two-col">
<h2>What you get when you finish</h2>
<dl class="defs">
<div><dt>Your estimated IQ and likely range</dt><dd>A score on the standard scale where 100 is average, shown with an honest range instead of false precision.</dd></div>
<div><dt>Your percentile</dt><dd>How your score compares with the general population, with a bell curve showing where you sit.</dd></div>
<div><dt>A skills profile</dt><dd>Pattern, number, verbal and logical reasoning scored separately, so you can see strengths and gaps.</dd></div>
<div><dt>A detailed IQ test report</dt><dd>Accuracy by difficulty, pace analysis, every question explained and a personal practice plan. Save it as a PDF.</dd></div>
</dl></div></section>

<section class="band"><div class="wrap two-col">
<h2>How the IQ test works</h2>
<ol class="steps">
<li><strong>Answer 24 questions</strong>Four sections of six: patterns, numbers, words and logic. Each section starts easy and gets harder.</li>
<li><strong>Go at your own pace</strong>There is a 30-minute overall limit. Skip and come back, or guess if unsure: scoring adjusts for lucky guesses.</li>
<li><strong>Read your report</strong>It appears instantly. Save it as a PDF or share an image of your result.</li>
</ol></div></section>

<section class="band"><div class="wrap two-col">
<h2>What this IQ test measures</h2>
<dl class="defs">
<div><dt>Pattern reasoning</dt><dd>Spotting the rule behind grids of shapes. This is the core of fluid intelligence, the ability to solve problems you have never seen before.</dd></div>
<div><dt>Number reasoning</dt><dd>Finding the rule in a sequence of numbers, from simple steps to sequences that hide two rules at once.</dd></div>
<div><dt>Verbal reasoning</dt><dd>Analogies, odd-one-out and vocabulary: how well you understand relationships between words.</dd></div>
<div><dt>Logical reasoning</dt><dd>Working out what must be true from the facts given, including multi-step deductions and puzzles with contradictions.</dd></div>
</dl></div></section>

<section class="band"><div class="wrap prose">
<h2>Online IQ test or professional IQ test?</h2>
<p>An online test like this one is quick, free and good for curiosity and self-insight. A professional test is given one-to-one by a psychologist, takes an hour or more and is standardised on thousands of people, which makes it the right choice for educational, clinical or official purposes.</p>
<div class="table-wrap"><table><thead><tr><th scope="col"></th><th scope="col">Online IQ test (this site)</th><th scope="col">Professional IQ test</th></tr></thead><tbody>
<tr><th scope="row">Who runs it</th><td>You, on your own device</td><td>A qualified psychologist, one-to-one</td></tr>
<tr><th scope="row">Time</th><td>About 20 minutes</td><td>Often an hour or more</td></tr>
<tr><th scope="row">Accuracy</th><td>Estimate with a wide range</td><td>Narrower margin of error</td></tr>
<tr><th scope="row">Best for</th><td>Curiosity and self-insight</td><td>Clinical, educational and official use</td></tr>
</tbody></table></div>
<p>The full comparison is on <a href="/online-vs-professional-iq-test">online vs professional IQ tests</a>.</p>
</div></section>

<section class="band"><div class="wrap prose">
<h2>How accurate is this free IQ test?</h2>
<p>Honest answer: it is a screening estimate. Twenty-four questions cannot match a supervised professional assessment standardised on thousands of people. We show a likely range of about 11 points either way, we correct for guessing, and we flag results that look unreliable, such as rushing or skipping many questions.</p>
<p>Read the full explanation, including how we convert points to an IQ score and what is still provisional, on <a href="/how-iq-tests-work">how our IQ test works</a>. Want to warm up first? Try the <a href="/iq-test-sample-questions">IQ test sample questions with answers</a>.</p>
</div></section>

<section class="band"><div class="wrap two-col">
<h2>Learn more about IQ</h2>
<ul class="linklist">{learn}</ul></div></section>

<section class="band"><div class="wrap prose">
<h2>IQ test frequently asked questions</h2>
{faq_html(HOME_FAQ)}
</div></section>

<section class="band"><div class="wrap">
<h2>Ready? It takes about 20 minutes.</h2>
<p class="lede">Find a quiet spot, put your phone on silent and give it your full attention.</p>
<div class="row"><a class="btn btn-primary btn-lg" href="/test">Start the free IQ test</a></div>
</div></section>
''' + footer() + scripts('config', 'sheet', 'home')
    write('index.html', html)


def build_test():
    title = f'IQ Test | {SITE}'
    html = head(title, 'Take the free IQ test: 24 questions in four sections, instant results.', '/test', robots='noindex,follow') + header('/') + '''
<noscript><div class="stage"><h1>JavaScript required</h1><p>The IQ test runs in your browser, so it needs JavaScript. Please enable it and reload this page.</p></div></noscript>
<div class="stage" id="app" aria-live="polite"><p class="muted">Loading the test…</p></div>
''' + footer() + scripts('config', 'sheet', 'questions', 'test')
    write('test.html', html)


# ----------------------------------------------------------------- CONTENT PAGES
CHART_FAQ = [
    ('What is a good IQ score?',
     'Any score from 90 to 109 is average, and about half of people land there. Scores of 110 and above are above average, and 130 and above are in the top 2 percent. IQ measures certain reasoning skills, not creativity, character or how well someone will do in life.'),
    ('What is the average IQ?',
     'The average IQ is 100 by definition. IQ tests are standardised so that the average score of the reference population is 100, with a standard deviation of 15 on most modern tests.'),
    ('What IQ is considered genius?',
     'There is no official IQ cutoff for genius. Scores of 130 and above are usually described as very high, and scores above 140 are sometimes called the genius range informally. Very high scores cannot be measured reliably by short online tests.'),
    ('What IQ score is the 98th percentile?',
     'An IQ of about 130 is at roughly the 98th percentile on a scale with a standard deviation of 15. That means about 98 out of 100 people score lower.'),
]


def build_chart():
    path = '/iq-score-chart'
    title = f'IQ Score Chart: What Is a Good IQ Score? | {SITE}'
    desc = 'IQ score chart with ranges, percentiles and a bell curve. Find out what a good IQ score is, what average IQ means and how common each score is.'
    ranges = [('130 and above', 'Very high', 'about 2%'), ('120 to 129', 'High', 'about 7%'),
              ('110 to 119', 'Above average', 'about 16%'), ('90 to 109', 'Average', 'about 50%'),
              ('80 to 89', 'Below average', 'about 16%'), ('70 to 79', 'Low', 'about 7%'),
              ('Below 70', 'Very low', 'about 2%')]
    z = lambda iq: 0.5 * (1 + math.erf((iq - 100) / 15 / math.sqrt(2)))
    pct_rows = ''.join(f'<tr><td>{iq}</td><td>{z(iq)*100:.1f}%</td></tr>' for iq in (70, 80, 85, 90, 100, 110, 115, 120, 130, 140, 145))
    rng_rows = ''.join(f'<tr><td>{a}</td><td>{b}</td><td>{c}</td></tr>' for a, b, c in ranges)
    body = f'''<h1>IQ score chart: what is a good IQ score?</h1>
{updated()}
<p class="lede">IQ scores are set on a scale where the average is 100 and most people fall within 15 points of it. This IQ score chart shows what each range means and how common it is.</p>
{toc([('ranges', 'IQ score ranges'), ('curve', 'The bell curve'), ('percentiles', 'IQ percentile chart'), ('good', 'What is a good IQ?'), ('reliable', 'How reliable is one score?'), ('faq', 'FAQ')])}

<h2 id="ranges">IQ score ranges</h2>
<div class="table-wrap"><table><thead><tr><th scope="col">IQ score</th><th scope="col">Common label</th><th scope="col">Share of people</th></tr></thead><tbody>{rng_rows}</tbody></table></div>
<p class="small muted">Labels vary between test publishers. The shares assume a normal distribution with a mean of 100 and a standard deviation of 15, the convention used by most modern IQ tests.</p>

<h2 id="curve">The IQ bell curve</h2>
{bell_static()}
<p>The curve is tallest at 100 because most people score near the average. About two thirds of people score between 85 and 115, and about 95 in 100 score between 70 and 130.</p>

<h2 id="percentiles">IQ percentile chart</h2>
<p>A percentile shows the share of people who score at or below a given IQ.</p>
<div class="table-wrap"><table><thead><tr><th scope="col">IQ score</th><th scope="col">Percentile</th></tr></thead><tbody>{pct_rows}</tbody></table></div>

<h2 id="good">What is a good IQ score?</h2>
<p>Any score from 90 to 109 is average, and about half of all people land there. Scores of 110 and above are above average. There is no single &ldquo;good&rdquo; number: IQ measures certain reasoning skills, not creativity, character, knowledge or how well someone will do in life. For the background, read <a href="/what-is-iq">what IQ is and how it is measured</a>.</p>

<h2 id="reliable">How reliable is a single IQ score?</h2>
<p>Even carefully built tests give slightly different scores on different days, because of sleep, mood and the particular questions. That is why professional reports give a range, and why you should treat a short online score as an estimate. Our test shows a likely range for the same reason.</p>

<h2 id="faq">IQ score chart FAQ</h2>
{faq_html(CHART_FAQ)}
{cta('Curious where you land on this chart?')}'''
    content_page('iq-score-chart.html', path, 'IQ score chart', title, desc, 'IQ score chart: what is a good IQ score?', body, CHART_FAQ)


WHAT_FAQ = [
    ('What does IQ stand for?', 'IQ stands for intelligence quotient. It is a score from a standardised test that estimates reasoning ability compared with other people of the same age.'),
    ('Is IQ genetic?', 'Both genes and environment contribute to differences in IQ scores. Education, nutrition, health and the learning environment all matter, which is why the question has no simple percentage answer that applies to every person.'),
    ('What is the highest possible IQ?', 'There is no fixed maximum, but scores far above about 160 cannot be measured reliably because too few people score that high to build trustworthy norms. Claims of extremely high IQ numbers should be treated with caution.'),
    ('Is IQ the same as intelligence?', 'No. IQ measures certain cognitive abilities such as reasoning, memory and verbal comprehension. Intelligence is a broader idea that also includes creativity, practical skills and social understanding, which IQ tests do not capture well.'),
]


def build_what_is_iq():
    path = '/what-is-iq'
    title = f'What Is IQ? Meaning, Scale and Limits | {SITE}'
    desc = 'What does IQ mean? Learn what IQ stands for, how the IQ scale works, a short history of IQ tests and what a score can and cannot tell you.'
    body = f'''<h1>What is IQ? Meaning, scale and what it can&rsquo;t tell you</h1>
{updated()}
<p class="lede">IQ stands for intelligence quotient: a score from a standardised test that estimates reasoning ability compared with other people of the same age. Here is where the idea came from, how the scale works and what a score can and cannot tell you.</p>
{toc([('meaning', 'What IQ means'), ('history', 'A short history'), ('measures', 'What IQ tests measure'), ('fluid', 'Fluid and crystallised intelligence'), ('predicts', 'What IQ predicts'), ('change', 'Can IQ change?'), ('myths', 'Common misconceptions'), ('faq', 'FAQ')])}

<h2 id="meaning">What does IQ mean?</h2>
<p>IQ stands for intelligence quotient. Today it is not literally a quotient. Modern tests convert your performance into a standard score by comparing it with a large reference group, called the norm group, made up of people your age. The scale is set so that the average is 100 and the standard deviation is 15, which means about two thirds of people score between 85 and 115. The <a href="/iq-score-chart">IQ score chart</a> shows every range.</p>

<h2 id="history">A short history of IQ tests</h2>
<ul>
<li><strong>1905:</strong> Alfred Binet and Th&eacute;odore Simon in France created the first practical intelligence scale, to identify schoolchildren who needed extra support.</li>
<li><strong>1912:</strong> William Stern proposed the &ldquo;intelligence quotient&rdquo;: mental age divided by chronological age, multiplied by 100.</li>
<li><strong>1916:</strong> Lewis Terman at Stanford revised Binet&rsquo;s scale into the Stanford&ndash;Binet test, which popularised IQ in the United States.</li>
<li><strong>1939:</strong> David Wechsler published the Wechsler&ndash;Bellevue scale. Its successors, the WAIS for adults and the WISC for children, use the modern &ldquo;deviation IQ&rdquo; based on norm groups.</li>
</ul>

<h2 id="measures">What do IQ tests measure?</h2>
<p>A full IQ test combines several abilities: verbal comprehension (vocabulary and word reasoning), visual and spatial reasoning, fluid reasoning (solving new problems), working memory and processing speed. Short online tests usually sample just one or two of these. Our <a href="/test">free IQ test</a> samples four reasoning skills, explained on <a href="/how-iq-tests-work">how our IQ test works</a>.</p>

<h2 id="fluid">Fluid and crystallised intelligence</h2>
<p>Psychologists Raymond Cattell and John Horn distinguished two broad kinds of ability. <strong>Fluid intelligence</strong> is the ability to solve unfamiliar problems, such as spotting the rule in a pattern. <strong>Crystallised intelligence</strong> is accumulated knowledge and skill, such as vocabulary. Fluid ability tends to peak in early adulthood, while crystallised knowledge tends to keep growing well into later life.</p>

<h2 id="predicts">What does IQ predict, and what does it not?</h2>
<p>IQ scores are associated with school achievement and, more modestly, with job performance. But they leave most of the variation in life outcomes unexplained. Motivation, effort, health, opportunity, relationships and plain luck all matter. An IQ score says nothing about someone&rsquo;s worth, character or creativity.</p>

<h2 id="change">Can your IQ change?</h2>
<p>IQ scores are fairly stable in adulthood, but not fixed. Education, health, sleep and stress can all affect performance. Practising a particular test format mostly improves your score on that format, which is why we suggest waiting at least four weeks before retaking a test. Across the 20th century, average raw scores on IQ tests rose in many countries by roughly three points per decade, a pattern known as the Flynn effect, which is why tests are periodically re-standardised.</p>

<h2 id="myths">Common misconceptions</h2>
<ul>
<li><strong>&ldquo;IQ is a single, exact number.&rdquo;</strong> Every score has a margin of error, which is why good reports give a range.</li>
<li><strong>&ldquo;A high IQ guarantees success.&rdquo;</strong> It helps with some tasks, but it is one factor among many.</li>
<li><strong>&ldquo;An online test can confirm giftedness.&rdquo;</strong> Only a supervised assessment by a qualified professional can. See <a href="/online-vs-professional-iq-test">online vs professional IQ tests</a>.</li>
</ul>

<h2 id="faq">IQ FAQ</h2>
{faq_html(WHAT_FAQ)}
{cta('Want to see your own estimate?')}'''
    content_page('what-is-iq.html', path, 'What is IQ?', title, desc, 'What is IQ? Meaning, scale and what it can\u2019t tell you', body, WHAT_FAQ)


SAMPLES = [
    ('Number series', 'What number comes next?  4, 9, 16, 25, ?', '36',
     'These are the square numbers: 2&sup2;, 3&sup2;, 4&sup2;, 5&sup2;. The next is 6&sup2; = 36.'),
    ('Number series', 'What number comes next?  2, 6, 12, 20, 30, ?', '42',
     'The gaps are 4, 6, 8, 10, so the next gap is 12, and 30 + 12 = 42.'),
    ('Verbal analogy', 'Glove is to hand as sock is to &hellip;', 'foot',
     'A glove is worn on a hand; a sock is worn on a foot. Put the relationship into a sentence first, then apply it.'),
    ('Odd one out', 'Which does not belong?  Oak, Maple, Birch, Rose, Pine', 'Rose',
     'Oak, maple, birch and pine are trees. A rose is a flowering shrub.'),
    ('Logic', 'All bloops are razzies. All razzies are lazzies. Are all bloops definitely lazzies?', 'Yes',
     'Bloops fit inside razzies, and razzies fit inside lazzies, so bloops must fit inside lazzies. Made-up words stop prior knowledge from getting in the way.'),
    ('Ordering', 'Maya is older than Leo. Leo is older than Sam. Who is the youngest?', 'Sam',
     'Chain the clues: Maya &gt; Leo &gt; Sam. Sam is at the end of the chain.'),
    ('Matrix reasoning', 'Which number replaces the question mark?  Row 1: 3, 5, 7.  Row 2: 4, 6, 8.  Row 3: 5, 7, ?', '9',
     'Each row goes up by 2 across, and each column goes up by 1 going down (7, 8, 9).'),
    ('Reasoning trap', 'A notebook and a pen cost $1.10 together. The notebook costs $1.00 more than the pen. How much does the pen cost?', '5 cents',
     'If the pen were 10 cents, the notebook would be $1.10 and the total $1.20. Let the pen be x: x + (x + 1.00) = 1.10, so x = 0.05.'),
]

SAMPLE_FAQ = [
    ('What kinds of questions are on an IQ test?', 'Most IQ tests mix pattern or matrix puzzles, number series, verbal analogies and vocabulary, logic problems, and often spatial or memory tasks. Short online tests usually use a smaller mix.'),
    ('Can you practise for an IQ test?', 'Practice makes the formats familiar, which helps you avoid wasting time, but it does not change underlying ability much. Practise to feel comfortable, then take the test in one calm sitting.'),
    ('Are these the same questions as the real test?', 'No. These examples are separate from the questions in our test, so practising here does not give away any answers.'),
]


def build_samples():
    path = '/iq-test-sample-questions'
    title = f'IQ Test Sample Questions With Answers | {SITE}'
    desc = 'Practice IQ test sample questions with answers and explanations: number series, analogies, logic and matrix reasoning. Then take the free test.'
    qs = ''.join(
        f'<div class="qa"><p class="qa-type">{t}</p><p class="qa-q"><strong>Question {i}.</strong> {q}</p>'
        f'<details class="faq reveal"><summary>Show the answer</summary><p><strong>{a}.</strong> {e}</p></details></div>'
        for i, (t, q, a, e) in enumerate(SAMPLES, 1))
    body = f'''<h1>IQ test sample questions with answers</h1>
{updated()}
<p class="lede">Eight practice questions covering the most common IQ test formats, each with a worked answer. Try each one before you open the explanation.</p>
{toc([('types', 'Types of IQ test question'), ('questions', 'Practice questions'), ('approach', 'How to approach each type'), ('faq', 'FAQ')])}

<h2 id="types">Types of IQ test questions</h2>
<ul>
<li><strong>Number series:</strong> find the rule and continue the sequence.</li>
<li><strong>Verbal analogies and odd-one-out:</strong> decide how words relate to each other.</li>
<li><strong>Logic and ordering:</strong> work out what must be true from stated facts.</li>
<li><strong>Matrix reasoning:</strong> spot the rules in a grid of shapes or numbers and find the missing piece.</li>
</ul>
<p>Want to try a visual matrix right now? There is an interactive sample on the <a href="/">free IQ test home page</a>.</p>

<h2 id="questions">IQ test practice questions</h2>
{qs}

<h2 id="approach">How to approach each type</h2>
<ul>
<li><strong>Number series:</strong> write the gaps between numbers. If the gaps are not constant, write the gaps of the gaps, or test multiplying.</li>
<li><strong>Analogies:</strong> say the relationship as a sentence before you look at the options.</li>
<li><strong>Logic:</strong> draw it. Circles for groups, a list for rankings. Test each answer by trying to make it false.</li>
<li><strong>Matrices:</strong> change one attribute at a time (shape, number, size, rotation, shading) and check rows, then columns.</li>
</ul>
<p>More strategies are in <a href="/iq-test-tips">how to take an IQ test</a>.</p>

<h2 id="faq">IQ test practice FAQ</h2>
{faq_html(SAMPLE_FAQ)}
{cta('Ready for the real thing?')}'''
    content_page('iq-test-sample-questions.html', path, 'IQ test sample questions', title, desc, 'IQ test sample questions with answers', body, SAMPLE_FAQ)


ONLINE_FAQ = [
    ('Are online IQ tests accurate?', 'Short online IQ tests give a rough estimate. They usually lack large, documented norm groups, are not age-adjusted and are taken in uncontrolled conditions, so the margin of error is wide. They are fine for curiosity, not for official decisions.'),
    ('Can an online IQ test qualify me for Mensa?', 'No. Mensa requires a supervised test from an approved source, with a score at or above the 98th percentile. Online practice tests cannot qualify you.'),
    ('How much does a professional IQ test cost?', 'Prices vary widely by country, provider and the type of assessment, from a modest fee for some supervised group tests to a substantial professional fee for a full clinical assessment. Ask the provider before booking.'),
]


def build_online_vs_pro():
    path = '/online-vs-professional-iq-test'
    title = f'Online vs Professional IQ Test: Which to Take? | {SITE}'
    desc = 'How accurate are online IQ tests compared with professional ones? See the differences, red flags to avoid and when you need a psychologist.'
    body = f'''<h1>Online vs professional IQ test: which should you take?</h1>
{updated()}
<p class="lede">Online IQ tests are quick and free, but they are not the same as a test given by a psychologist. Here is how they differ, how accurate each is and how to spot a misleading site.</p>
{toc([('short', 'The short answer'), ('compare', 'Side-by-side comparison'), ('enough', 'When an online test is enough'), ('pro', 'When you need a professional test'), ('flags', 'Red flags in online IQ tests'), ('faq', 'FAQ')])}

<h2 id="short">The short answer</h2>
<p>Use an online test for curiosity, self-insight and practice. Use a professional test when the result will be used for an educational, clinical, workplace or high-IQ society decision. An online estimate cannot replace a supervised assessment.</p>

<h2 id="compare">Online vs professional IQ test</h2>
<div class="table-wrap"><table><thead><tr><th scope="col"></th><th scope="col">Online IQ test</th><th scope="col">Professional IQ test</th></tr></thead><tbody>
<tr><th scope="row">Who runs it</th><td>You, on your own device</td><td>A qualified psychologist, usually one-to-one</td></tr>
<tr><th scope="row">Typical length</th><td>10 to 30 minutes</td><td>Often an hour or more</td></tr>
<tr><th scope="row">Content</th><td>A few dozen questions at most</td><td>Many items across ten or more subtests</td></tr>
<tr><th scope="row">Norm group</th><td>Varies; often small or undocumented</td><td>Standardised on thousands of people</td></tr>
<tr><th scope="row">Age adjustment</th><td>Often none</td><td>Compared with people of the same age</td></tr>
<tr><th scope="row">Margin of error</th><td>Wide</td><td>Narrower and reported in the results</td></tr>
<tr><th scope="row">Conditions</th><td>Uncontrolled</td><td>Quiet, supervised, standard procedure</td></tr>
<tr><th scope="row">Best for</th><td>Curiosity and practice</td><td>Clinical, educational and official use</td></tr>
</tbody></table></div>

<h2 id="enough">When an online test is enough</h2>
<ul>
<li>You are curious about your reasoning skills or want a baseline.</li>
<li>You want to see your relative strengths across pattern, number, verbal and logical reasoning.</li>
<li>You want practice before a supervised test.</li>
</ul>

<h2 id="pro">When you need a professional test</h2>
<ul>
<li>A school, doctor or employer asks for an assessment.</li>
<li>You suspect a learning difference or attention difficulty.</li>
<li>You want to apply to a high-IQ society such as Mensa.</li>
<li>You need a score you can document.</li>
</ul>

<h2 id="flags">Red flags in online IQ tests</h2>
<ul>
<li><strong>Payment before the score:</strong> you are asked for card details to see a result, especially a &ldquo;trial&rdquo; that can renew into a subscription.</li>
<li><strong>Always flattering scores:</strong> inflated results encourage sharing and purchases, but they are not honest.</li>
<li><strong>No methodology:</strong> no explanation of how the score is calculated or what it is based on.</li>
<li><strong>False precision:</strong> a single exact number with no margin of error.</li>
<li><strong>Genius promises:</strong> claims that five questions can reveal your genius level.</li>
</ul>
<p>We explain our own scoring, including what is still provisional, on <a href="/how-iq-tests-work">how our IQ test works</a>.</p>

<h2 id="faq">Online vs professional IQ test FAQ</h2>
{faq_html(ONLINE_FAQ)}
{cta('Try an online estimate first')}'''
    content_page('online-vs-professional-iq-test.html', path, 'Online vs professional IQ test', title, desc, 'Online vs professional IQ test: which should you take?', body, ONLINE_FAQ)


TIPS_FAQ = [
    ('How can I improve my IQ test score?', 'You can improve your score on a specific test by becoming familiar with the formats, managing time well and testing when rested. Lasting changes in underlying ability are smaller and slower, and come from things like sleep, health, education and regular mental challenge.'),
    ('Should I guess on an IQ test?', 'If the scoring corrects for guessing, as ours does, a guess has no expected cost and may help, so answer your best guess rather than leaving questions blank unless you truly cannot narrow the options.'),
]


def build_tips():
    path = '/iq-test-tips'
    title = f'How to Take an IQ Test: 10 Tips | {SITE}'
    desc = 'How to take an IQ test and get your best result: 10 practical tips on preparation, time, pattern puzzles, number series and avoiding common mistakes.'
    body = f'''<h1>How to take an IQ test: 10 tips for your best result</h1>
{updated()}
<p class="lede">You cannot cram for intelligence, but you can avoid the mistakes that lower a score. These ten tips help you show what you can really do.</p>
{toc([('tips', 'The 10 tips'), ('after', 'After the test'), ('faq', 'FAQ')])}

<h2 id="tips">10 tips for taking an IQ test</h2>
<ol>
<li><strong>Be rested.</strong> Tiredness lowers reasoning performance more than most people expect. Test when you are alert.</li>
<li><strong>Remove distractions.</strong> Put your phone on silent, close other tabs and take the test in one sitting.</li>
<li><strong>Read each question twice.</strong> Many wrong answers come from missing a word such as &ldquo;must&rdquo;, &ldquo;except&rdquo; or &ldquo;not&rdquo;.</li>
<li><strong>Predict before you look.</strong> For matrices and sequences, work out the answer first, then find it in the options. This stops tempting distractors from steering you.</li>
<li><strong>Name the rule.</strong> Say what changes across a row in plain words. If you cannot name the rule, you have not found it yet.</li>
<li><strong>Use scratch paper.</strong> Write the gaps in a number series or sketch a logic puzzle. Pen and paper are fine.</li>
<li><strong>Use elimination.</strong> Remove options that break the rule you found. Narrowing from five to two doubles your odds on a guess.</li>
<li><strong>Watch the clock, not the second hand.</strong> Spend about a minute per question, and skip and return to anything that takes much longer.</li>
<li><strong>Do not dwell on a miss.</strong> One missed question says little. Move on with a clear head.</li>
<li><strong>Do not memorise answers.</strong> Practise the question <em>types</em> with <a href="/iq-test-sample-questions">sample IQ questions</a> and keep the real test fresh.</li>
</ol>

<h2 id="after">After the test</h2>
<p>Read your score as a range, not a single number, and look at your skills profile for strengths and gaps. If you want to know what the number means, see the <a href="/iq-score-chart">IQ score chart</a>. If you want to retake the test, wait at least four weeks so you are measuring ability, not memory.</p>

<h2 id="faq">IQ test tips FAQ</h2>
{faq_html(TIPS_FAQ)}
{cta('Put the tips into practice')}'''
    content_page('iq-test-tips.html', path, 'How to take an IQ test', title, desc, 'How to take an IQ test: 10 tips for your best result', body, TIPS_FAQ)


def build_method():
    path = '/how-iq-tests-work'
    title = f'How Our IQ Test Works: Scoring and Accuracy | {SITE}'
    desc = f'How the {SITE} IQ test is built, scored and checked, how accurate it is, and what an online IQ test cannot tell you.'
    body = f'''<h1>How our IQ test works, and what it cannot tell you</h1>
{updated()}
<p class="lede">We would rather you understand your result than just trust it. Here is exactly how the test is built, scored and checked, including the parts that are still provisional.</p>
{toc([('measures', 'What it measures'), ('scoring', 'How the score is calculated'), ('provisional', 'What is still provisional'), ('quality', 'Quality checks'), ('limits', 'Limits'), ('age', 'Average IQ by age'), ('pro', 'When to see a professional')])}

<h2 id="measures">What the test measures</h2>
<p>The test has 24 questions in four sections of six: pattern reasoning (grids of shapes), number reasoning (sequences), verbal reasoning (analogies, odd-one-out, vocabulary) and logical reasoning (deductions from stated facts). Most items test fluid reasoning, the ability to work out new problems, with a smaller verbal component. Every question was written for this site. Within each section, questions run from easy to hard. For background, see <a href="/what-is-iq">what IQ is</a>.</p>

<h2 id="scoring">How the score is calculated</h2>
<ol>
<li><strong>Difficulty weighting.</strong> Each question is worth 1 to 5 points depending on how hard it is, so a hard question counts more than an easy one.</li>
<li><strong>Guess correction.</strong> A wrong answer subtracts a small fraction of the question&rsquo;s points, set so that random guessing earns zero on average. An unanswered question scores zero. This means guessing when unsure never costs you in expectation.</li>
<li><strong>Conversion to the IQ scale.</strong> The total is converted to the standard IQ scale, where the population average is 100 and the standard deviation is 15. Scores are limited to a range of 70 to 145, because a 24-question test cannot distinguish reliably beyond that.</li>
<li><strong>Percentile.</strong> Your percentile is calculated from your IQ using the normal distribution. See the <a href="/iq-score-chart">IQ score chart</a>.</li>
</ol>

<h2 id="provisional">What is still provisional</h2>
<div class="callout">Professional tests convert scores using norms from thousands of people in a representative sample. {SITE} does not yet have a large sample of its own. The conversion from points to IQ is currently based on estimates of how an average adult performs on each question, and it will be refined as real data accumulates.</div>
<p>This is the main reason we show a likely range instead of a single exact number, and why you should not treat the result as a precise measurement. The range we show is about 11 points either way (a 90% interval). That figure assumes a reliability of roughly 0.80 for a test of this length, which is an assumption we have not yet measured.</p>

<h2 id="quality">Quality checks on your result</h2>
<p>Your report flags results that are likely to be unreliable, so you are not misled by a score that does not reflect your ability. We check for: many unanswered questions, very fast answering (a typical sign of guessing), and answers clustered in the same on-screen position. When a flag appears, treat the score as provisional and consider retaking the test calmly.</p>

<h2 id="limits">Limits of any online IQ test</h2>
<ul>
<li><strong>It is an estimate, not a diagnosis.</strong> It cannot identify learning differences, giftedness or disability. Those need an assessment by a qualified psychologist.</li>
<li><strong>It is not age-adjusted.</strong> Professional tests compare you with people your own age. This test does not, so it is designed for ages 16 and over and is not suitable for children.</li>
<li><strong>Conditions matter.</strong> Noise, tiredness, stress, a small screen and unfamiliarity with puzzle formats all affect the score.</li>
<li><strong>Practice effects.</strong> Retaking the same questions mostly measures your memory of them. Wait at least four weeks.</li>
<li><strong>Language and culture.</strong> The verbal section is in English and assumes familiarity with common English words.</li>
<li><strong>A ceiling.</strong> Very high ability cannot be measured accurately by a short test.</li>
</ul>

<h2 id="age">Average IQ by age</h2>
<p>On professional tests the average is 100 at every age, because each person is compared with others of the same age. Raw problem-solving speed changes across a lifetime, but the IQ scale adjusts for that. Since this test is not age-adjusted yet, we do not publish age-specific averages for it.</p>

<h2 id="pro">When to see a professional</h2>
<p>If you need an IQ score for educational placement, clinical decisions, workplace requirements or high-IQ society membership, use a supervised test from a qualified psychologist or the society itself. See <a href="/online-vs-professional-iq-test">online vs professional IQ tests</a> for the full comparison.</p>
{cta('Take the free IQ test')}'''
    content_page('how-iq-tests-work.html', path, 'How it works', title, desc, 'How our IQ test works, and what it cannot tell you', body)


def build_privacy():
    contact = f'<p>Questions: {ARGS.email}</p>' if ARGS.email else '<p>Contact details will be added here before launch.</p>'
    path = '/privacy'
    title = f'Privacy Policy: No Account or Email Needed | {SITE}'
    desc = f'How {SITE} handles your data: no account and no email are needed, and your test answers stay in your own browser.'
    html = head(title, desc, path, ld=[breadcrumb_ld('Privacy', path)]) + header('') + crumbs('Privacy') + f'''
<div class="wrap prose">
<h1>Privacy policy</h1>
<p class="muted">Last updated: {DATE_HUMAN}</p>
<p>{SITE} is built to collect as little as possible.</p>
<h2>What we collect</h2>
<ul>
<li><strong>Your test answers and results.</strong> These are stored only in your browser (local storage) on your own device so you can resume the test and view your report. They are not sent to our servers. Clearing your browser data, or using &ldquo;Retake the test&rdquo;, removes them.</li>
<li><strong>No account, no email.</strong> We do not ask for your name, email or any other personal details to take the test or see your report.</li>
<li><strong>Basic visit statistics.</strong> We may use privacy-friendly, cookie-free analytics to count visits and see which pages are popular. This does not include your test answers.</li>
<li><strong>Hosting logs.</strong> Our hosting provider processes standard technical data such as IP address to deliver and protect the site.</li>
</ul>
<h2>Sharing</h2>
<p>If you use &ldquo;Share result image&rdquo;, the image is created on your device and shared only where you choose to send it.</p>
<h2>Your choices</h2>
<p>You can delete your saved results at any time by clearing your browser&rsquo;s site data for this website.</p>
<h2>Contact</h2>
{contact}
<div class="callout"><strong>Site owner:</strong> update this page if you add payments, an email list, advertising or other analytics, and have it reviewed by a qualified professional for your region.</div>
</div>
''' + footer() + scripts('config')
    write('privacy.html', html)


def build_terms():
    path = '/terms'
    title = f'Terms of Use for the {SITE} IQ Test | {SITE}'
    desc = f'Terms of use for {SITE}, an online reasoning test provided for curiosity and self-insight, not clinical assessment.'
    html = head(title, desc, path, ld=[breadcrumb_ld('Terms', path)]) + header('') + crumbs('Terms') + f'''
<div class="wrap prose">
<h1>Terms of use</h1>
<p class="muted">Last updated: {DATE_HUMAN}</p>
<h2>Purpose of the test</h2>
<p>{SITE} provides an online reasoning test for entertainment, curiosity and self-insight. It is not a clinical, educational or employment assessment, and it does not diagnose any condition. Do not use the result to make medical, legal, educational or employment decisions.</p>
<h2>Accuracy</h2>
<p>Results are estimates with a wide margin of error and may differ from professionally administered tests. See <a href="/how-iq-tests-work">how our IQ test works</a>.</p>
<h2>Eligibility</h2>
<p>The test is designed for people aged 16 and over.</p>
<h2>Acceptable use</h2>
<p>Do not copy, scrape, resell or republish the questions or the test, or attempt to disrupt the site.</p>
<h2>No warranty and liability</h2>
<p>The site is provided &ldquo;as is&rdquo; without warranties. To the extent permitted by law, we are not liable for any loss arising from your use of the site or reliance on your results.</p>
<h2>Changes</h2>
<p>We may update the test, scoring and these terms. The date above shows the latest version.</p>
<div class="callout"><strong>Site owner:</strong> this is a starting template, not legal advice. Have it reviewed for your jurisdiction, especially before you introduce paid features, refunds or subscriptions.</div>
</div>
''' + footer() + scripts('config')
    write('terms.html', html)


def build_404():
    html = head(f'Page not found | {SITE}', 'This page does not exist.', '/404', robots='noindex,follow') + header('') + '''
<div class="wrap prose">
<h1>That page is not here</h1>
<p class="lede">The link may be old or mistyped.</p>
<div class="row"><a class="btn btn-primary" href="/">Go to the free IQ test</a><a class="btn btn-ghost" href="/iq-score-chart">IQ score chart</a></div>
</div>
''' + footer() + scripts('config')
    write('404.html', html)


# ----------------------------------------------------------------- static files
def build_static():
    urls = [('/', '1.0'), ('/iq-score-chart', '0.9'), ('/iq-test-sample-questions', '0.8'), ('/what-is-iq', '0.8'),
            ('/online-vs-professional-iq-test', '0.7'), ('/iq-test-tips', '0.7'), ('/how-iq-tests-work', '0.7'),
            ('/privacy', '0.2'), ('/terms', '0.2')]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for u, p in urls:
        sm += f'  <url><loc>{canon(u)}</loc><lastmod>{DATE}</lastmod><priority>{p}</priority></url>\n'
    write('sitemap.xml', sm + '</urlset>\n')
    write('robots.txt', f'User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n')
    write('favicon.svg',
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>.r{fill:none;stroke:#0E1A33;stroke-width:6}.d{fill:#2342F5}'
          '@media (prefers-color-scheme:dark){.r{stroke:#EAF0FF}.d{fill:#8197FF}}</style>'
          '<circle class="r" cx="32" cy="32" r="25"/><circle class="d" cx="32" cy="32" r="12.5"/></svg>\n')
    write('_headers', '''/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Content-Security-Policy: default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self'; img-src 'self' data: blob:; connect-src 'self' https://cloudflareinsights.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'

/assets/*
  Cache-Control: public, max-age=3600, must-revalidate

/favicon.svg
  Cache-Control: public, max-age=86400

/sw.js
  Cache-Control: no-cache
''')
    write('manifest.webmanifest', json.dumps({
        'name': f'{SITE}: Free IQ Test', 'short_name': SITE,
        'description': 'Free IQ test with instant results and a detailed report.',
        'start_url': './', 'scope': './', 'display': 'standalone',
        'background_color': '#F4F7FB', 'theme_color': '#2342F5',
        'icons': [
            {'src': 'assets/img/icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
            {'src': 'assets/img/icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
            {'src': 'assets/img/icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]},
        indent=2) + '\n')
    pages = ['./', 'test', 'iq-score-chart'] if CLEAN else ['./', 'test.html', 'iq-score-chart.html']
    core = pages + ['favicon.svg', 'assets/css/style.css', 'assets/js/config.js', 'assets/js/sheet.js',
                    'assets/js/questions.js', 'assets/js/test.js', 'assets/js/home.js']
    write('sw.js', """/* Service worker: makes the site installable and lets the test open offline. */
const VERSION = '%s-v3';
const SCOPE = self.registration.scope;
const CORE = %s.map((p) => new URL(p, SCOPE).href);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => Promise.all(CORE.map((u) => cache.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) { return; }
  if (req.mode === 'navigate') {
    // pages: network first (always fresh), fall back to the cache when offline
    event.respondWith(fetch(req).then((res) => {
      if (res.ok && res.type === 'basic' && !res.redirected) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match(SCOPE))));
    return;
  }
  // assets: serve from cache immediately and refresh in the background
  event.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
""" % (SLUG, json.dumps(core)))
    # keep the in-page brand name in sync
    cfg = os.path.join(OUT, 'assets/js/config.js')
    s = open(cfg, encoding='utf-8').read()
    s = re.sub(r"siteName: '[^']*'", "siteName: '" + SITE.replace("'", "\\'") + "'", s)
    open(cfg, 'w', encoding='utf-8').write(s)


def build_og():
    from PIL import Image, ImageDraw, ImageFont
    W, H = 1200, 630
    img = Image.new('RGB', (W, H), '#F4F7FB')
    d = ImageDraw.Draw(img)

    def font(size):
        for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'):
            if os.path.exists(p):
                return ImageFont.truetype(p, size)
        return ImageFont.load_default(size)
    d.rectangle([0, 0, W, 16], fill='#2342F5')
    d.text((80, 100), SITE, font=font(54), fill='#0E1A33')
    d.text((80, 200), 'Free IQ Test', font=font(120), fill='#0E1A33')
    d.text((80, 370), 'Instant score and a detailed report.', font=font(44), fill='#46536B')
    d.text((80, 430), 'No sign-up. About 20 minutes.', font=font(44), fill='#46536B')
    for i, L in enumerate('ABCDE'):
        cx = 110 + i * 110
        filled = i == 2
        d.ellipse([cx - 38, 492, cx + 38, 568], outline='#0E1A33', width=5, fill='#2342F5' if filled else '#FFFFFF')
        f = font(34)
        w = d.textlength(L, font=f)
        d.text((cx - w / 2, 508), L, font=f, fill='#FFFFFF' if filled else '#0E1A33')
    img.save(os.path.join(OUT, 'assets/img/og-image.png'), optimize=True)


if __name__ == '__main__':
    build_home(); build_test(); build_chart(); build_what_is_iq(); build_samples(); build_online_vs_pro()
    build_tips(); build_method(); build_privacy(); build_terms(); build_404(); build_static()
    if ARGS.og:
        build_og()
    print('built', 'clean-URL mode' if CLEAN else 'relative/.html mode', '|', SITE, '|', DOMAIN)
