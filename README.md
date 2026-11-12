# IQ Test Lab: free online IQ test (static, SEO-focused site)

A fast, no-build IQ test website. Plain HTML, CSS and JavaScript, ready for GitHub Pages or Cloudflare Pages.

- 24 original questions in four sections (patterns, numbers, words, logic), easy to hard
- Difficulty-weighted, guess-corrected scoring with a margin of error and result quality checks
- Detailed report generated the moment the test ends (profile, difficulty analysis, pace, full question review, practice plan, PDF, share image)
- Installable as an app (PWA), works offline once loaded
- SEO built in: keyword-mapped pages, structured data, sitemap, internal linking, fast and accessible (see `SEO.md`)
- No account, no email, no external fonts or libraries

> **Important:** the scoring calibration is **provisional** (see "Improving accuracy"). Do not market the result as a clinical or exact IQ.

**This zip is pre-built for Cloudflare Pages at `https://free-iq-test.pages.dev` using clean URLs.** For another address, rebuild (section 1).

## Layout and retention features

- **Start button always on top:** a persistent "Start the free IQ test" button in the header on every page, plus the hero button. Both are visible without scrolling on laptops, desktops, tablets and phones (checked at 8 screen sizes from 1920 x 950 down to 320 x 520).
- **Every question fits on one screen** at 100% zoom: the puzzle and the answers sit side by side on wide screens, and the Back/Next bar stays reachable on phones.
- **Resume anywhere:** progress saves automatically; the home page shows a "Welcome back" banner with a Continue button.
- **Reports stay for 90 days** on the device, so people can come back to them.
- **Progress tracking:** a short history of past scores is kept (up to 10), and each new report compares with the previous one, noting what is within measurement noise.
- **Retake reminder:** a one-tap calendar file (.ics) set 28 days out, so retakes measure ability, not memory.
- **Shareable result image** and **Save as PDF** report; **Install the app** button where the browser supports it; works offline after the first visit.
- All of this is stored in the visitor's own browser. Nothing is sent to a server (verified: no external requests during a full test).

## How this build was verified

Real Chromium at 8 viewport sizes (Start button, Begin button and every question's Next button on screen, no sideways scrolling, report and returning-visitor home page); a Cloudflare-style server (clean URLs, `.html` redirects) with a full link crawl, a full test run, service worker and offline check; scoring simulations; persistence, history, expiry and calendar-file tests; and an SEO audit (titles, headings, schema, sitemap, orphan pages). The one thing not tested is the strict Content-Security-Policy header in `_headers`, which only Cloudflare itself applies: after deploying, open the browser console and look for "Content Security Policy" errors.

## Files

```
index.html                          Landing page: "free IQ test" + live sample question + FAQ
test.html                           The test app (noindex; people arrive from the pages below)
iq-score-chart.html                 IQ ranges, percentiles, bell curve, FAQ
what-is-iq.html                     What IQ means, history, fluid vs crystallised intelligence
iq-test-sample-questions.html       8 practice questions with answers
online-vs-professional-iq-test.html Accuracy, differences, red flags
iq-test-tips.html                   10 tips for taking an IQ test
how-iq-tests-work.html              Methodology page (builds trust)
privacy.html, terms.html            TEMPLATES. Have them reviewed before launch
404.html, robots.txt, sitemap.xml, _headers, manifest.webmanifest, sw.js, favicon.svg   (generated)
tools/build_pages.py                Page generator (see section 1)
assets/js/config.js                 <- paywall switch, price, norms, brand name
assets/js/questions.js              Question bank
assets/js/test.js                   Test flow, scoring, quality checks, report, share image
assets/js/sheet.js                  SVG renderer for the visual puzzles
assets/css/style.css                Design system (light/dark, print styles for the PDF report)
SEO.md                              Keyword map, checklist and growth plan
AUDIT.md                            Competitor audit and strategies applied
```

## 0. Rename the GitHub repo (recommended: `free-iq-test`)

On GitHub Pages the repository name is part of your URL, so a keyword-bearing name helps.

1. GitHub → your repo → **Settings → General → Repository name** → `free-iq-test` → **Rename**.
2. Locally: `git remote set-url origin https://github.com/YOUR-USER/free-iq-test.git`
3. Confirm **Settings → Pages** still deploys from `main` / root. Your site is now at `https://YOUR-USER.github.io/free-iq-test/`. The old URL stops working, so update any links you shared.

If you choose a different repo name, rebuild with it: `python tools/build_pages.py --url https://YOUR-USER.github.io/YOUR-REPO`.

## 1. Set your URL, brand and contact email

All pages are generated by `tools/build_pages.py` (Python 3, no packages). The repo already contains the built output; run the generator only when you change the URL, brand, email, FAQ or shared page chrome (header, footer).

```bash
# GitHub Pages project site (the script's default URL: https://drimranhayat.github.io/free-iq-test)
python tools/build_pages.py --email you@yourdomain.com

# Cloudflare Pages at the pages.dev address (how this zip was built)
python tools/build_pages.py --url https://free-iq-test.pages.dev --clean-urls --email you@yourdomain.com

# Change the brand name everywhere (titles, header, manifest, share image, config)
python tools/build_pages.py --name "Your Brand" --email you@yourdomain.com

# Cloudflare Pages on your own root domain (clean URLs like /iq-score-chart)
python tools/build_pages.py --url https://yourdomain.com --clean-urls --name "Your Brand" --email you@yourdomain.com
```

| Mode | When | Links look like |
|---|---|---|
| default | GitHub Pages sub-path, or any host | `test.html`, `assets/...` (relative; work from any folder) |
| `--clean-urls` | A root domain on Cloudflare Pages | `/test`, `/iq-score-chart` |

Do not use `--clean-urls` on GitHub Pages: it serves files, not clean URLs, and links would break.

When you materially change a page's content, update `DATE` and `DATE_HUMAN` at the top of `tools/build_pages.py` so "Updated ..." dates and sitemap `lastmod` stay honest. Replace `assets/img/og-image.png` (1200 x 630) and the icons with your own artwork if you like (`--og` regenerates the share image with the brand name).

## 2. Run locally

```bash
python -m http.server 8000      # then open http://localhost:8000/
```

(For `--clean-urls` builds use `npx serve .` or `npx wrangler pages dev .`.)

## 3. Deploy

**GitHub Pages:** push to `main`, then Settings → Pages → Deploy from branch → `main` / root. Changes go live about a minute after each push.

**Cloudflare Pages (recommended once you have a domain):**

```bash
python tools/build_pages.py --url https://yourdomain.com --clean-urls --email you@yourdomain.com
git add . && git commit -m "Build for Cloudflare" && git push
```

In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git** → pick the repo → Framework preset **None**, build command **empty**, output directory **`/`** → Deploy. Add your custom domain, turn on **Always Use HTTPS** and **Web Analytics** (cookie-free). `_headers` sets security headers and a strict Content-Security-Policy on Cloudflare (GitHub Pages ignores it).

After the first deploy follow the Search Console steps in `SEO.md`.

## 4. Free now, paid report later

`assets/js/config.js`:

```js
fullReportFree: true,    // launch mode: everyone sees the full report
checkoutUrl: '',         // your payment link
priceLabel: '$4.99',
```

Set `fullReportFree: false` and the free result keeps the score, percentile, bell curve and skills profile, while the detailed sections are replaced by a purchase card.

### Adding payments properly

The switch above is only a **front-end gate**: a technical visitor could bypass it. Before charging, verify payment on the server:

1. Pick a payment provider that can pay out in your country (not every processor, for example Stripe, is available everywhere; check before building).
2. Use a hosted checkout link, with a **success URL** back to your site.
3. Add a Cloudflare Pages Function (`functions/api/...`) that receives the provider's webhook and stores the paid session in Workers KV.
4. Move the premium report HTML generation into a Pages Function that returns it only for a valid paid token. The client sends the answers; the server returns the report sections.
5. Keep pricing honest: **one-time price, no hidden subscription**, a clear refund policy. Then update the FAQ answer "Is this IQ test really free?", the privacy page and the terms.

## 5. Improving accuracy (the most important thing to do after launch)

Today's norms (`norms: { mean: 22, sd: 11 }`) are estimates. To make scores genuinely defensible:

1. **Collect anonymous results with consent**: score, per-item correct/incorrect, time. A Pages Function plus Cloudflare D1 is enough. Update the privacy page first.
2. After about **1,000 completions**, compute the mean and SD of the weighted score and put them in `config.js`.
3. Run **item analysis**: percent correct per question (should rise from easy to hard), and correlation of each item with the total score. Replace items that do not discriminate.
4. Measure **reliability** (Cronbach's alpha) and update `ciHalfWidth` with the real value.
5. Grow the item bank to 60+ and serve randomised forms (reduces answer sharing and practice effects).
6. Later: age norms, a validation study against a recognised test, and adaptive item selection.

Quality checks already built in: guess correction, rushing detection, answer-position bias detection, incomplete-test warning, honest range, 70 to 145 limits.

## 6. SEO checklist

Already done: keyword-targeted title and H1 on the landing page, meta descriptions, canonical URLs, Open Graph/Twitter cards, JSON-LD (WebSite, WebApplication, FAQPage, Article, BreadcrumbList), sitemap, robots, clean URLs, semantic headings, mobile-first, no render-blocking third parties, accessible markup.

To do (this is where rankings come from):

- Publish more helpful pages, each with one clear purpose and a link to the test: what is IQ, fluid vs crystallised intelligence, IQ test practice tips, IQ vs EQ, famous misconceptions about IQ. Write them yourself with real substance.
- Earn links: share the IQ score chart, offer it to education and psychology bloggers.
- **Do not** add fake `aggregateRating` markup or invented reviews. Search engines penalise it, and it is dishonest.
- Re-check Core Web Vitals in PageSpeed Insights after you deploy.
- When you add languages, use `hreflang` and translated (not machine-dumped) content.

## 7. Legal

`privacy.html` and `terms.html` are starting templates, **not legal advice**. Have them reviewed for your region. The site states it is not a clinical assessment and is for ages 16+; keep that wording.
