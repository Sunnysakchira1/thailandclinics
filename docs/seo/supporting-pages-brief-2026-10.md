# Supporting pages brief: physiotherapy + IVF clusters (Oct 2026)

Tactic (Sunny, 31 Oct): build supporting pages that target EXACT long-tail queries, answer the
query in the first 1–2 sentences, translate into DE/IT/FR/ES/PT, and link every supporting page
to the cluster's MAIN MONEY PAGE.

## Money pages (every supporting page links here, descriptive anchor, at least twice:
## once in the first section, once in the closing line)
- Fertility cluster: `/bangkok/fertility-clinics/` — anchor e.g. "fertility clinics in Bangkok", "compare IVF clinics in Bangkok"
- Physiotherapy cluster: `/bangkok/physiotherapy-clinics/` — anchor e.g. "physiotherapy clinics in Bangkok", "compare physio clinics in Bangkok"

## The 10 supporting pages (exact query = H1 + title intent; queries from Google autocomplete, TH locale, 31 Oct)
| # | Slug | Exact target query | Cluster |
|---|---|---|---|
| 1 | ivf-cost-thailand | how much does ivf cost in thailand | fertility |
| 2 | ivf-gender-selection-thailand | is ivf gender selection legal in thailand | fertility |
| 3 | ivf-single-women-thailand | can single women do ivf in thailand | fertility |
| 4 | ivf-age-limit-thailand | ivf thailand age limit | fertility |
| 5 | egg-freezing-cost-thailand | how much does egg freezing cost in thailand | fertility |
| 6 | physiotherapy-cost-thailand | how much is physiotherapy in thailand | physiotherapy |
| 7 | physio-vs-thai-massage | physio vs thai massage | physiotherapy |
| 8 | sports-injury-clinic-bangkok | sports injury clinic bangkok | physiotherapy |
| 9 | physio-rehab-retreat-thailand | physio rehab retreat thailand | physiotherapy |
| 10 | physiotherapy-referral-thailand | do you need a referral for physiotherapy in thailand | physiotherapy |

## Page format (MDX in content/blog/<slug>.mdx)
Frontmatter (exact keys):
```
---
title: "<the exact query phrased naturally as a headline, 50–62 chars, no site-name suffix (titles render verbatim)>"
description: "<140–155 chars, answers the query in the first clause>"
publishedAt: "2026-10-31"
updatedAt: "2026-10-31"
category: "fertility" | "physiotherapy"
city: "thailand" (or "bangkok" for #8)
type: "cluster"
featured: false
---
```
Body rules:
- First paragraph = the direct answer in 1–2 sentences, with the number/verdict (price range, yes/no + condition). No preamble.
- Then a short "Why"/context section, a table where it helps (costs), "What to check" bullets, then the money-page link, then `## FAQ` with 3–5 `### Question` items (generates FAQPage schema).
- 700–1,100 words. One H1 is generated from title — do NOT write a `#` H1 in the body. Use `##` and `###` only.
- Follow content/TONE.md exactly (British English, second person, specific, honest, no AI filler words listed there).
- Internal links: money page (2×), plus 1–2 relevant existing posts:
  /blog/fertility-bangkok-guide/ · /blog/best-ivf-hospitals-bangkok/ · /blog/compare-fertility-clinics-bangkok-pgt/ ·
  /blog/physiotherapy-bangkok-guide/ · /blog/physiotherapy-hospitals-vs-clinics-bangkok/ · /blog/post-surgery-physio-rehab-bangkok/
- Allowed MDX components: plain markdown + tables, and `<CtaBlock eyebrow="" title="" body="" href="/get-matched/" label="" />` (one per page max, patient CTA to /get-matched/).
- Close with an italic editorial line: *Reviewed by ThailandClinics editorial team, October 2026. This page is general information, not medical or legal advice.*

## Facts — HEALTHCARE GATE (YMYL). Every factual claim needs a named primary source.
- Prices: use ONLY these already-verified site figures (Oct 2026) or a live clinic page you fetch yourself:
  - IVF/ICSI: GFC ฿150,000–350,000 (ICSI) · MedPark ฿280,000 (residents) · Bangkok Hospital ฿335,000; ฿456,000 with PGT-A · Prime ฿299,000 (ICSI) · Jetanin/Bumrungrad quote only. GFC PGT-A ฿39,900 first embryo, ฿15,900 after.
  - Pillar guide ranges: IVF/ICSI ฿250,000–450,000 excl. medication; medication +฿60,000–150,000; egg freezing ฿120,000–200,000 per cycle; storage ฿10,000–30,000/yr; IUI ฿15,000–35,000.
  - Physio: Form ฿2,100 (60 min) / ฿2,900 (90) / ฿3,500 (120), consult ฿1,000 · BPC ฿2,000 / ฿2,900 / ฿3,800, consult ฿700 · Pain Away ฿1,500–3,000 · hospitals don't publish.
- Law (Thailand): the Protection of a Child Born by Medically Assisted Reproductive Technology Act B.E. 2558 (2015) and any amendments — verify current position on: sex selection (banned except to avoid sex-linked genetic disease), who may have IVF (married couples; check the 2025 Marriage Equality Act effect and any ART Act amendment), single women (egg freezing allowed? IVF not?), surrogacy. Verify with primary/official sources (Thai government, Royal Gazette, Medical Council, Department of Health Service Support) or two reputable secondary sources. If you cannot verify, say so plainly on the page ("rules changed in 2025; confirm with the clinic") — never guess.
- Age limit: verify any Medical Council / clinic-stated age limits; if none is legislated, say so and give clinic practice with sources.
- Physio: Physical Therapy Council of Thailand licensing; referral rules; travel insurance practice — source or soften.
- NO outcome promises, no "best", no success-rate numbers without a defined source.

## Output per page
1. The MDX file.
2. Append to docs/seo/supporting-pages-verification-2026-10.md: page slug, each factual claim → source URL (or "softened/removed").
