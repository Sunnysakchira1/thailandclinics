# Homepage Enrichment — Design Spec
**Date:** 2026-05-10
**Status:** Approved for implementation

---

## Goals

1. Differentiate the Browse by City H2 (now too similar to the new H1).
2. Add 5 new sections to make the homepage substantive — targeting "thailand clinics" keyword and improving E-E-A-T for YMYL.

---

## H2 Change: Browse by City

**Current:** "Find clinics *near you*"
**New:** "Choose your *destination*"

- "destination" rendered in italic, `color: var(--green)` — matches existing italic-green emphasis pattern.
- Differentiates from H1 ("Find clinics in *Thailand* near you") by shifting to a travel/discovery frame rather than a location frame.

---

## Final Page Order

```
Hero (H1: "Find clinics in Thailand near you")
Browse by Specialty
Featured Clinics (Bangkok physio)
Browse by City                          ← H2 updated
━━━ NEW SECTIONS BELOW ━━━
Why Thailand?                           ← stats + price table
How it works                            ← 3-step numbered
Recent blog posts                       ← MDX frontmatter
Editorial / About block                 ← SEO copy
FAQ                                     ← accordion + FAQPage schema
━━━━━━━━━━━━━━━━━━━━━━━━━
Trust Strip
Footer
```

---

## Section Designs

### 1. Why Thailand?

**Background:** Two-tone — dark green stats row on top, `var(--linen-dark)` price table below. Combined into one visual unit inside one `<section>`.

**Stats row (dark green `#1a4731` bg):**
- Eyebrow: "Why patients choose Thailand" — DM Sans 10px uppercase, `rgba(255,255,255,0.5)`
- 3 stats in a horizontal row (4-col grid on desktop, 2×2 on mobile):
  - **70%** — Lower cost vs. UK & US
  - **500K+** — Medical tourists per year
  - **63** — JCI-accredited hospitals
  - **4.8★** — Average clinic rating on ThailandClinics
- Stat number: Cormorant Garamond 48px weight 300, white
- Label: DM Sans 12px, `rgba(255,255,255,0.6)`

**Price table (linen-dark bg, `var(--border)` border):**
- Label: "Typical treatment costs" — DM Sans 10px uppercase muted
- 3 columns: Thailand (green, bold) | UK (muted) | USA (muted)
- Rows: Physiotherapy session | Dental cleaning | GP consultation
- Values (hardcoded, editable):

| Treatment | Thailand | UK | USA |
|---|---|---|---|
| Physiotherapy session | $25–40 | $80–120 | $100–150 |
| Dental cleaning | $30–50 | $100–200 | $150–300 |
| GP consultation | $20–35 | $60–120 | $150–300 |

- Small disclaimer: "Estimates based on 2025 private clinic pricing. Actual costs vary by clinic and treatment."
- Link: "How we verify listings →" → `/how-we-rank/`

**H2:** "Why patients choose *Thailand*" — Cormorant Garamond 36px weight 400, italic green on "Thailand"

---

### 2. How it Works

**Background:** `var(--white)`
**Eyebrow:** "How it works" — DM Sans 11px uppercase muted
**H2:** "Find the right clinic in *minutes*" — Cormorant Garamond 36px, italic green on "minutes"

**Layout:** 3-step horizontal row with numbered circles connected by a thin `var(--border)` line.

| Step | Title | Description |
|---|---|---|
| 1 | Browse | Filter by city, specialty, English-speaking, or BTS/MRT access |
| 2 | Compare | Read verified ratings, opening hours, and patient review summaries |
| 3 | Contact directly | Call or visit — no booking fees, no middlemen |

- Circle: 40×40px, `var(--green)` bg, white text, weight 500
- Connector line: 1px `var(--border)`, horizontally centred between circles, z-index below circles
- Step title: Cormorant Garamond 20px weight 500, charcoal
- Description: DM Sans 13px, `var(--muted)`, max ~120 chars
- Mobile: stacks vertically, connector line hidden

---

### 3. Recent Blog Posts

**Background:** `var(--linen-dark)`
**Eyebrow:** "From the guide" — DM Sans 11px uppercase muted
**H2:** "Guides for expats & medical tourists" — Cormorant Garamond 36px weight 400
**Section link:** "View all guides →" → `/blog/`

**Data source:** Read MDX frontmatter from `/content/blog/*.mdx` at build time using `fs.readdirSync` + `gray-matter`. No DB query needed.

**Fields used from frontmatter:** `title`, `description`, `publishedAt`, `category`, `city`, `slug` (derived from filename).

**Card layout:** Up to 3 cards in a responsive grid (3-col desktop, 1-col mobile).
- Category tag (terracotta) + city badge
- Title: Cormorant Garamond 21px weight 500
- Description: DM Sans 13.5px muted, truncated to ~100 chars
- Date: DM Sans 12px muted
- "Read →" link to `/blog/[slug]/`

**Graceful degradation:** If only 1 post exists, show 1 card full-width (or 2-col with a "More guides coming soon" placeholder card). Do not show section if 0 posts.

**Dependency:** Install `gray-matter` — `npm install gray-matter` — for parsing MDX frontmatter.

---

### 4. Editorial / About Block

**Background:** `var(--linen)`
**H2:** "Thailand's most trusted clinic directory" — Cormorant Garamond 36px weight 400. No italic emphasis (this is a factual claim, not decorative).

**Layout:** Single column, max-width 720px, centred.

**Copy (3 paragraphs, SEO-optimised for "thailand clinics"):**

> **Paragraph 1 — What it is:**
> ThailandClinics is an independent directory of verified physiotherapy, dental, cosmetic and wellness clinics across Bangkok, Chiang Mai, Phuket and Pattaya. Every listing is checked against Google data, cross-referenced for accuracy, and updated regularly — so the information you read reflects real opening hours, real ratings, and real contact details.

> **Paragraph 2 — Who it's for:**
> We built this for the people who need it most: expats navigating a new healthcare system, medical tourists planning treatment around a trip, and English-speaking locals who want to compare options before committing. We flag English-speaking clinics, BTS and MRT proximity, and weekend availability — the details that matter when you're new to a city.

> **Paragraph 3 — The model:**
> ThailandClinics earns nothing from bookings or referrals. Clinics cannot pay for placement — rankings are based entirely on Google ratings, review volume, and our own verification checks. You contact clinics directly. We just make it easier to find the right one.

**Links:**
- "How we rank clinics →" → `/how-we-rank/`
- "About ThailandClinics →" → `/about/`

These sit inline at the bottom of the block as DM Sans 13px green links.

---

### 5. FAQ

**Background:** `var(--white)`
**H2:** "Common questions about Thailand clinics" — Cormorant Garamond 36px weight 400
**Eyebrow:** "FAQ" — DM Sans 11px uppercase muted

**Layout:** `<details>`/`<summary>` accordion — consistent with the clinic profile page pattern. No JS required.

**Questions (7):**

1. **Are clinics in Thailand affordable?** — Yes. Physiotherapy sessions run $25–40, dental cleanings $30–50 — typically 60–75% less than UK or US private rates. See the cost comparison above.
2. **Do Bangkok clinics have English-speaking staff?** — Many do. Use the English-speaking filter on any listing page to see only those clinics.
3. **How do I find a physiotherapy clinic near a BTS station?** — Filter by "Near BTS" on the Bangkok physiotherapy listing page. Every clinic with BTS or MRT proximity is flagged.
4. **How does ThailandClinics verify listings?** — We cross-reference clinic data with Google Maps, check for operational status, and review English-language patient reviews. [Full methodology →](/how-we-rank/)
5. **Can I book appointments through ThailandClinics?** — No. We're a discovery platform, not a booking service. Contact clinics directly by phone or through their website — details are on every clinic page.
6. **Which Thai cities are covered?** — Bangkok is fully indexed (330+ clinics). Chiang Mai, Phuket, Pattaya and Koh Samui are coming in 2026.
7. **Is Thailand good for medical tourism?** — Thailand receives over 500,000 medical tourists annually and has 63 JCI-accredited hospitals — the international gold standard for hospital quality. For most elective and specialist treatments, quality is high and wait times are short.

**Schema:** Add `FAQPage` JSON-LD with all 7 Q&As. Nest inside the existing `StructuredData` component alongside `websiteSchema`.

**Accordion style:** Same `<details>` pattern as clinic profile — `border-bottom: 1px solid var(--border-soft)`, DM Sans 15px question, DM Sans 14px answer in muted.

---

## Implementation Notes

### No new DB queries
All new sections use either:
- Hardcoded static data (stats, prices, FAQ, editorial copy)
- MDX frontmatter read at build time (blog posts)

### gray-matter install required
`npm install gray-matter` — lightweight, widely used, no peer dep issues.

### Structured data additions
- `FAQPage` schema — new, added to page-level `StructuredData`
- Existing `WebSite` schema — unchanged

### File changes
- `src/app/page.tsx` — all new sections added inline (follow existing pattern of inline sections + small components at bottom)
- No new component files needed — small helper components stay in `page.tsx`

### Responsive behaviour
- Why Thailand stats: 2×2 grid on mobile
- How it works: vertical stack on mobile, connector line hidden
- Blog cards: 1-col on mobile, 2-col at md, 3-col at lg
- Editorial: single column, already responsive
- FAQ: unchanged at any width

---

## Out of Scope

- Actual search bar functionality (already decorative)
- More than 3 blog cards
- City-specific FAQ answers
- Dynamic stats pulled from DB
