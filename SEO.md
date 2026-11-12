# SEO playbook for IQ Test Lab

Nobody can guarantee rankings, and "free IQ test" is a competitive search. This document records what is already built, how each page is targeted, and what to do next. **I have not verified search volumes**; validate every keyword in Google Search Console and a keyword tool before investing in new pages.

## 1. Keyword map (one primary topic per page)

| Page | Primary keyword | Supporting keywords | Search intent |
|---|---|---|---|
| `index.html` | free IQ test | IQ test online, IQ test without registration, free IQ test with instant results, IQ test for adults | Take a test now |
| `iq-score-chart.html` | IQ score chart | what is a good IQ score, average IQ, IQ percentile chart, IQ bell curve | Interpret a score |
| `what-is-iq.html` | what is IQ | IQ meaning, what does IQ stand for, history of IQ tests, fluid vs crystallised intelligence | Learn the concept |
| `iq-test-sample-questions.html` | IQ test sample questions | IQ test questions and answers, IQ practice test, matrix reasoning examples | Practise |
| `online-vs-professional-iq-test.html` | online vs professional IQ test | are online IQ tests accurate, how accurate are IQ tests, can online IQ test qualify for Mensa | Evaluate trust |
| `iq-test-tips.html` | how to take an IQ test | IQ test tips, how to prepare for an IQ test, how to improve IQ test score | Prepare |
| `how-iq-tests-work.html` | how IQ tests work | how IQ tests are scored, IQ test methodology | Trust and credibility |
| `test.html` | (none) | `noindex`, so it does not compete with the landing page | App |

Rule: do not target the same primary keyword on two pages (keyword cannibalisation).

## 2. What is already implemented

**On-page**
- Unique title (about 45 to 60 characters) and meta description (about 120 to 150) per page, keyword first, brand last
- Exactly one H1 per page, logical H2 sections with anchor IDs, and a table of contents (helps sitelinks and "jump to" results)
- Answer-first paragraphs near the top (good for featured snippets), tables for comparisons, FAQ sections
- 600 to 1,300 words on every content page, written for the reader; visible "Updated" date
- Descriptive internal links with keyword anchors: a "Keep reading" block on every content page, a footer link list, a header nav, and in-text links. Every page is reachable from the home page (checked)
- Honest limits stated on the page (Google's quality guidelines reward expertise and trust, and so do readers)

**Structured data (JSON-LD, validated as parseable JSON)**
- Home: `Organization`, `WebSite`, `WebApplication` (free offer), `FAQPage`
- Content pages: `Article`, `BreadcrumbList`, and `FAQPage` where a visible FAQ exists. FAQ markup text is identical to the visible text (checked in the audit)
- Deliberately **no** `aggregateRating` or review markup: there are no genuine reviews yet, and fake ones risk a manual penalty

**Technical**
- Canonical URL and Open Graph/Twitter tags on every page; `og:image` 1200 x 630
- `sitemap.xml` (all indexable pages, accurate `lastmod`), `robots.txt`
- A home page load is about 44 KB of HTML, CSS and JS before compression, with no third-party scripts and no render-blocking fonts. Responsive, keyboard-accessible, dark mode: good raw material for Core Web Vitals (measure it yourself with PageSpeed Insights after deploying)
- `noindex,follow` on the app page and 404 so thin pages do not dilute the site

## 3. Launch checklist

1. Deploy and open the live URL on a phone and a desktop; take the test once end to end.
2. **Google Search Console**: add a *URL-prefix* property for your exact URL (for GitHub Pages: `https://YOUR-USER.github.io/free-iq-test/`). Submit `sitemap.xml`. Use **URL Inspection → Request indexing** for the home page and each content page.
3. **Bing Webmaster Tools**: import from Search Console, submit the sitemap.
4. Run **PageSpeed Insights** on the home page and the test page.
5. Run Google's **Rich Results Test** on the home page and one content page.
6. Enable cookie-free analytics (Cloudflare Web Analytics, or Plausible).
7. Check Search Console weekly: Coverage (indexed pages), Performance (queries, CTR, average position).

> **GitHub Pages sub-path caveat.** A `user.github.io/repo/` URL works, but `robots.txt` and `sitemap.xml` at the sub-path are not auto-discovered by crawlers (so submit the sitemap manually as above), you cannot set HTTP headers, and a brand-new URL has no authority. A **custom domain** (with Cloudflare Pages) is strongly recommended before you invest in link building. When you move, set up 301 redirects and re-submit the sitemap.

## 4. Content roadmap (publish only if you can add real value)

Each new page should have a distinct purpose and link to the test:

1. **Fluid vs crystallised intelligence**, with examples and how each changes with age
2. **IQ test for kids and teens**: why online adult tests are not suitable, what a psychologist assessment involves (strong trust content)
3. **What IQ do you need for Mensa and other high-IQ societies**, based on each society's published criteria
4. **Famous misconceptions about IQ**
5. **Matrix reasoning explained**, with worked visual examples (you can reuse `sheet.js` to draw them)
6. **Number sequence tricks**, with 20 worked examples
7. **IQ vs EQ**, a clear, balanced explainer
8. Later: translated versions (Spanish, French, German, Portuguese) with proper `hreflang`, written by a fluent human, not machine-dumped

Quality rules: write original text, cite sources for any statistic, avoid inventing averages by country or profession, and update the "Updated" date only when you genuinely revise a page.

## 5. Off-page (this is where competitive rankings come from)

- Offer the **IQ score chart** and the **sample questions** as useful resources to psychology and education bloggers, teachers and study-skill sites
- Answer questions genuinely (and disclose your affiliation) on Q&A communities where the test is relevant; no link spamming
- Submit the site to reputable tool directories and "free tools" lists
- Create a shareable result image (already built) and encourage sharing; social shares are not a ranking factor by themselves, but they bring visits and links
- Build a modest brand presence: consistent name, logo and a contact email on the privacy page

## 6. What to avoid

- Fake reviews, fake ratings or fake "as seen on" badges
- Pages duplicated with small keyword swaps ("IQ test online", "online IQ test free", and so on) which Google treats as thin or doorway content
- Hiding the score behind payment or collecting an email before showing results; it hurts trust and conversion, and it is the main complaint about competitors
- Claiming clinical accuracy or giving a single exact IQ number with no range

## 7. Measure and iterate (first 90 days)

| When | Focus |
|---|---|
| Days 1 to 14 | Get indexed. Fix anything Search Console flags. Verify rich results |
| Days 15 to 45 | Read the Queries report: which searches show impressions? Improve titles and descriptions for pages with impressions but low click-through. Add the first two roadmap articles |
| Days 46 to 90 | Strengthen pages that rank on page 2 (more depth, better examples, internal links). Start outreach. Decide on a custom domain if you have not already |

Test results can be re-normed once you collect consent-based data (see `README.md`, "Improving accuracy"), and "we publish our methodology and norms" is itself a strong trust and link-building story.
