# Competitor audit and strategies applied

**Method and limits.** This audit is based on search results and third-party write-ups about the leading IQ test sites (Mensa Norway, 123test, RIOT IQ, MyIQ, IQtest.net, World Wide IQ Test, PsychTests, Cognitive Metrics and others), plus public reviews. I did not run a hands-on test of each site, so treat details as directional and re-check anything you plan to cite. **Nothing was copied**: no questions, text, design or code from any of these sites. Everything here is original work that adopts good *practices*.

## What the leading sites do

| Pattern | Seen at | Why it works | IQ Test Lab |
|---|---|---|---|
| Free test, no registration | 123test, Mensa Norway test | Lowest friction, builds trust, earns links and shares | Yes: no account or email |
| Short test (about 25 min or less) | Mensa Norway (35 puzzles, 25 min, score range 85 to 145), many apps | Higher completion rate | 24 questions, about 20 min |
| Matrix / pattern puzzles as the core | Mensa Norway | Language-light, widely recognised format | Yes, plus numbers, words, logic |
| Honesty about limits and norm group | 123test explains norm groups and limits; RIOT highlights margin of error | Credibility; Google rewards helpfulness and expertise | Methodology page, margin of error, provisional-norm disclosure |
| Free score, paid detailed report / certificate | World Wide IQ Test, PsychTests-style "snapshot then buy", IQtest.net certificate | Standard freemium funnel | Built in: one config switch (`fullReportFree`) |
| Percentile, comparison graph, certificate-style output | MyIQ reviewers praise percentile graph and certificate | Makes the number meaningful and shareable | Percentile, bell curve, PDF report, share image |
| Extra tests (personality, "love style") | MyIQ | More reasons to stay and return | Roadmap |
| Adaptive difficulty | MyIQ reviews mention it | Feels personalised, shorter tests | Roadmap (needs real item data first) |
| Long, supervised, professionally normed paid tests | RIOT IQ (about 52 min, stated margin of error of 3.7 points) | Premium credibility | Out of scope; the site says so |

## Problems in this market (avoided on purpose)

- **Trial-to-subscription traps.** A Trustpilot reviewer of MyIQ describes paying a small "trial" fee for results and being surprised by what followed. IQ Test Lab plans one-time pricing, stated clearly.
- **Flattering scores.** One reviewer of Cognitive Metrics claims it is the only site that does not inflate scores to push purchases. Inflated scores drive shares but destroy trust. IQ Test Lab corrects for guessing and floors random guessers near 70 (simulated: about 75 on average, versus about 101 for a typical-ability profile).
- **Unverifiable accuracy claims.** Several lists describe tests with no published norm sample. IQ Test Lab publishes how it scores and what is provisional.
- **Uniform-sounding review walls.** Review pages full of near-identical praise are not persuasive. IQ Test Lab shows no fabricated ratings and uses no fake review schema.
- **Email walls and lead-gen funnels.** Not used.

## Strategy map: what was implemented

**User friendliness and engagement**

- One-tap start; a live sample question on the homepage (try before you commit)
- Four short sections with a transition screen after each, a progress bar and a hideable timer
- Skip, go back, review unanswered questions before submitting; keyboard shortcuts (A to F, Enter)
- Auto-save and resume; works on phones with large tap targets; offline-capable PWA
- Animated score reveal, shareable result image, "Save as PDF" report
- Accessible: semantic markup, focus management, ARIA labels on every puzzle cell, reduced-motion and dark-mode support

**Accuracy**

- Difficulty-weighted scoring and guess correction (random guessing earns about zero)
- Easy-to-hard ordering inside each section; answer positions shuffled per session
- Quality flags: rushing, answer-position bias, too many skipped questions
- Honest likely range (about 11 points) and a 70 to 145 reporting range
- Every item verified: distractors cannot satisfy the rule, sequences re-derived independently (one ambiguous distractor was found and fixed during testing)
- Calibration clearly labelled provisional, with a documented path to real norming

**Detailed report (generated at completion)**

Score, range and percentile; bell curve; four-skill profile with explanations; accuracy by difficulty; pace and speed-versus-accuracy insight; all 24 questions reviewed with explanations; personalised practice plan; limitations; printable PDF.

**SEO**

Keyword-targeted landing page and FAQ (with matching FAQPage markup), IQ score chart page, methodology page, canonical URLs, Open Graph cards, sitemap and robots, noindex on the app page to avoid thin-content duplication, clean URLs, a small payload (about 44 KB of HTML, CSS and JS for the home page, no third-party scripts) as a base for good Core Web Vitals.

## Gaps and suggested roadmap

1. Collect opt-in anonymous data and re-norm the scoring (highest priority for accuracy)
2. Larger item bank with randomised forms
3. Verifiable certificate with a report ID lookup (paid tier)
4. Personality and emotional-style quizzes as separate, honestly labelled products
5. Adaptive testing once item statistics exist
6. Translations with `hreflang`
7. Content marketing: 10 to 20 helpful articles linking to the test
