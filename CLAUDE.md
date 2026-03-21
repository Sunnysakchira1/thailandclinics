# ThailandClinics — Claude Code Project Intelligence

## Identity
A high-trust healthcare clinic discovery platform for Thailand.
Targeting: medical tourists, expats, and English-speaking locals.
Cities: Bangkok, Phuket, Chiang Mai, Pattaya.
Categories: Physiotherapy, Dental, Cosmetic, Wellness.

Core philosophy: We do the research to find the best.
Not a lead gen site. Not a booking platform. Infrastructure.

---

## Tech Stack
- Next.js 15 (App Router, TypeScript) — SSG preferred, SSR only when necessary
- Turso database (SQLite at edge via @libsql/client)
- Drizzle ORM — all queries in /lib/db/queries.ts
- Tailwind CSS — utility classes only, no CSS modules
- Deployed on Cloudflare Pages via GitHub (NOT Vercel)
- Blog content: MDX files in /content/blog/

---

## URL Structure (LOCKED — Never change without explicit instruction)

/[city]/[category]/            → listing page
/[city]/[category]/[slug]/     → clinic profile
/blog/[slug]/                  → editorial content
/guides/[slug]/                → curated "best of" pages

Examples:
✅ /bangkok/physiotherapy-clinics/
✅ /bangkok/physiotherapy-clinics/thonglor-physio-center/
✅ /blog/best-physiotherapy-clinics-bangkok/
❌ /clinics/bangkok/physio/thonglor
❌ /th/bangkok/physiotherapy (never add country prefix)

---

## SEO Rules — Charles Floate Methodology

### Meta Titles
- 55-62 characters exactly — fill the space, never waste it
- Clinic profile: "[Clinic Name] — [Category] in [District], [City] | ThailandClinics"
- Category page: "[Category] in [City] — Verified Clinics | ThailandClinics"
- Blog post: "[Intent-matched headline] | ThailandClinics"
- Homepage: "Thailand Clinics — Find Verified Dental, Physio & Cosmetic Clinics"
- NEVER use the same title on two pages

### Meta Descriptions
- 140-155 characters
- Answer the search intent in the first clause
- Include a differentiator: verified, English-speaking, expat-trusted
- Example: "Browse 47 verified physiotherapy clinics in Bangkok. Filter by English-speaking, BTS access and review count. Trusted by expats since 2024."

### H1 Tags
- One per page, always
- Category page: "Physiotherapy Clinics in Bangkok" — not "Welcome to our physio page"
- Clinic page: exact clinic name — nothing else
- Answer the query in the first paragraph. No preamble.

### Internal Linking (PageRank Sculpting)
- Clinic profile → city page, category page, 3 nearby clinics (by lat/lng)
- Category page → top 5 featured clinics, 2 related categories, city page
- Blog post → 2-3 relevant clinic profiles, parent category page
- Homepage → all 4 city pages, all 4 category pages
- Always use descriptive anchor text. Never "click here" or "read more".
- Example: "physiotherapy clinics in Bangkok" not "see more clinics"

### Schema Markup (Required on Every Page)

Clinic profile:
- @type: ["LocalBusiness", "MedicalClinic"]
- Fields: name, address, telephone, url, geo (lat/lng), aggregateRating,
  openingHoursSpecification, medicalSpecialty, availableLanguage, hasMap

Category page:
- @type: "ItemList"
- Fields: name, numberOfItems, itemListElement with ListItem per clinic

Blog/Guide:
- @type: "Article"
- Fields: headline, datePublished, dateModified, author, publisher

Homepage:
- @type: "WebSite" with SearchAction potentialAction

BreadcrumbList on ALL pages except homepage.
Validate every schema with Google's Rich Results Test before deploying.

### Sitemap
- Priority 1.0: homepage
- Priority 0.9: city + category pages
- Priority 0.8: clinic profile pages
- Priority 0.7: blog/guide pages
- changefreq: weekly (category/city), monthly (clinic profiles, blog)
- Exclude: /api/*, /admin/*
- Auto-generate with next-sitemap at build time

### robots.txt
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://thailand-clinics.com/sitemap.xml

### Pre-Deploy SEO Checklist
- [ ] All pages have unique meta title (55-62 chars)
- [ ] All pages have meta description (140-155 chars)
- [ ] All pages have canonical tag
- [ ] No duplicate H1s
- [ ] Schema present and validated on all page types
- [ ] Internal links use descriptive anchor text
- [ ] Images have descriptive alt text
- [ ] No broken internal links
- [ ] Sitemap generated
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms

### Site Architecture (Never Violate)
- Max 3 clicks from homepage to any clinic profile
- Never create subcategories that add a 4th URL level
- Never paginate to /page/2/ — use cursor-based loading or load more

### Content Intent Rules
- Navigational query ("Bangkok physiotherapy clinics") → list immediately, no preamble
- Informational query → answer in first paragraph, then context
- Commercial query ("best dental Sukhumvit") → ranked list with differentiators

### E-E-A-T (Healthcare = YMYL — Google holds this to higher trust standard)
- "Last updated" date visible on clinic profiles and blog posts
- Source attribution on any statistics
- Author/reviewer field on blog posts
- About page explaining verification methodology
- Clear contact info in footer

---

## Design System

### ⚠️ READ THIS BEFORE WRITING ANY CODE
- Fonts: Cormorant Garamond (display) + DM Sans (UI). NOT Inter. NOT any system font.
- Primary color: #1a4731 (forest green). NOT #30669D (old blue). Never use the old blue.
- Page background: #faf8f5 (linen). NOT white. White is for cards only.

### CSS Variables — Copy into globals.css
```css
:root {
  --linen:         #faf8f5;
  --linen-dark:    #f2ede6;
  --charcoal:      #1a1a1a;
  --charcoal-soft: #3d3d3d;
  --green:         #1a4731;
  --green-light:   #2a5c40;
  --green-pale:    #eef4f0;
  --terracotta:    #c4622d;
  --border:        #e0d9ce;
  --border-soft:   #ece7df;
  --muted:         #8a8278;
  --white:         #ffffff;
  --open:          #2d7a4f;
  --star:          #e8a020;
  --footer-bg:     #1a1a1a;
}
```

### Google Fonts Import
```
Cormorant Garamond: ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500
DM Sans: ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300
```

### Font Usage Rules
- Cormorant Garamond → ALL display: H1, H2, section titles, clinic names, logo, city names
- DM Sans → ALL UI: body, nav, buttons, filters, badges, meta text, footer
- Never mix roles. Never use any other font.

### Type Scale
| Element              | Font               | Size                     | Weight |
|----------------------|--------------------|--------------------------|--------|
| Hero H1              | Cormorant Garamond | clamp(48px, 7vw, 84px)   | 300    |
| Section title        | Cormorant Garamond | 36px                     | 400    |
| Page title (listing) | Cormorant Garamond | 28px                     | 400    |
| Clinic row name      | Cormorant Garamond | 22px                     | 500    |
| Clinic card name     | Cormorant Garamond | 21px                     | 500    |
| Logo wordmark        | Cormorant Garamond | 20-22px                  | 600    |
| Body / description   | DM Sans            | 13.5-16px                | 400    |
| Nav links            | DM Sans            | 13.5px                   | 400    |
| Filter labels        | DM Sans            | 13.5px                   | 400    |
| Meta / review count  | DM Sans            | 12-12.5px                | 400    |
| Section eyebrow      | DM Sans            | 11px UPPERCASE           | 500    |
| Filter titles        | DM Sans            | 11px UPPERCASE           | 600    |
| Category tags        | DM Sans            | 10.5-11px UPPERCASE      | 500    |

Italic rule: Cormorant Garamond italic in var(--green) for emphasis words in headlines.
Example: "The definitive guide to *healthcare in Thailand*"

### Tailwind Config — extend tailwind.config.ts
```js
theme: {
  extend: {
    colors: {
      linen: '#faf8f5',
      'linen-dark': '#f2ede6',
      charcoal: '#1a1a1a',
      'charcoal-soft': '#3d3d3d',
      green: { DEFAULT: '#1a4731', light: '#2a5c40', pale: '#eef4f0' },
      terracotta: '#c4622d',
      border: { DEFAULT: '#e0d9ce', soft: '#ece7df' },
      muted: '#8a8278',
      open: '#2d7a4f',
      star: '#e8a020',
    },
    fontFamily: {
      serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      sans: ['DM Sans', 'sans-serif'],
    },
  }
}
```

### Spacing & Layout
- Page horizontal padding: 48px desktop, 24px mobile
- Section vertical padding: 72px
- Nav height: 64px (sticky)
- Max widths: sections 1200px, listing layout 1400px
- Sidebar width: 260px
- Clinic row photo: 200px wide, aspect-ratio 4/3

### Border Radius
- Cards (clinic card, category tile): 6px
- Buttons, CTA, small badges: 4px
- Pills / filter chips: 100px (fully rounded)

### Shadows
- Hero search bar only: 0 2px 24px rgba(26,71,49,0.06)
- Card hover: 0 12px 32px rgba(26,26,26,0.08)
- Category tile hover: 0 8px 24px rgba(26,71,49,0.08)

### Hover States
- All cards: translateY(-2px) or (-3px) + shadow
- City tiles: scale(1.04) on background
- Nav links: color → var(--green)
- Sort pills active: background var(--green), color white
- Checkboxes checked: background + border var(--green)
- Green buttons hover: background var(--green-light)

### Rank Badges (listing page)
- #1 Gold: #c9a84c
- #2 Silver: #8a8278
- #3 Bronze: #a0714c
- #4+ Charcoal: var(--charcoal)
- Size: 28×28px circle, font 11px weight 600

### City Tile Gradients
- Bangkok:    linear-gradient(160deg, #2a5c40 0%, #1a3d2b 100%)
- Chiang Mai: linear-gradient(160deg, #5c432a 0%, #3d2d1a 100%)
- Phuket:     linear-gradient(160deg, #2a4a5c 0%, #1a3040 100%)
- Pattaya:    linear-gradient(160deg, #5c2a3e 0%, #3d1a28 100%)
- Koh Samui:  linear-gradient(160deg, #3a5c2a 0%, #253d1a 100%)
City tile overlay: linear-gradient(to top, rgba(10,30,20,0.72) 0%, rgba(10,30,20,0.1) 60%)

### Animations (hero section only)
Staggered fadeUp (opacity 0→1, translateY 20px→0):
- eyebrow: 0.6s delay 0s
- headline: 0.6s delay 0.1s
- subtitle: 0.6s delay 0.2s
- search bar: 0.6s delay 0.3s
- stats row: 0.6s delay 0.4s
No other page animations. Card hover transitions: 0.2s ease only.

### Absolute Design Rules
- NEVER use Inter, Roboto, system fonts
- NEVER use #30669D anywhere
- NEVER use pure white as page background — always var(--linen)
- NEVER use gradients on text or buttons
- NEVER use rounded-full on cards
- Terracotta = category tags and eyebrow labels ONLY. Never for CTAs.
- Sentence case on all headings. ALL CAPS only for eyebrow/tag/filter labels.
- No popups, modals, or overlays on page load
- No stock photography

### Logo (Pending Final Design)
Logo is in progress. Do NOT invent a logo or use placeholder text.
When the logo is finalised, it will be provided as an SVG component.
For now, use this temporary text wordmark in the nav:
- "thailand" — Cormorant Garamond weight 400, #3d3d3d
- "clinics" — Cormorant Garamond weight 600, #1a4731

---

## Data Model

### clinics table
id, name, slug, city_id, category_id,
name_en (text, nullable),         ← English name — used for slug generation
name_th (text, nullable),         ← Thai name — displayed on page if present
address, district, postal_code, lat, lng,
phone, website, email,
google_place_id,
google_rating (decimal, 1dp),
google_reviews_count (integer),
english_speaking (bool, default false),
near_bts (bool, default false),
near_mrt (bool, default false),
open_weekends (bool, default false),
verified (bool, default false),
featured (bool, default false),
featured_position (integer, nullable),
about (text, nullable),
services (text, nullable),
languages (text, nullable),
opening_hours (JSON, nullable),
photo_url (text, nullable),
review_positives (text, nullable),        ← JSON array: ["point 1", "point 2", "point 3"]
review_negatives (text, nullable),        ← JSON array: ["point 1", "point 2", "point 3"] (nulls allowed in array)
review_summary_count (integer, nullable), ← how many reviews the summary is based on
review_summary_updated_at (text, nullable), ← ISO date string: YYYY-MM-DD
created_at, updated_at, last_verified_at

Display logic:
- name_en exists → use as primary display name
- only name_th exists → use name_th as primary display name
- Slug ALWAYS generated from name_en, never from name_th
- Show review block only if review_positives NOT NULL AND parsed array has >= 2 non-null items
- Display as two-column table: left = positives (checkmark), right = negatives (dash)
- Filter null values from both arrays before rendering
- Subtitle: "Based on [count] reviews · Updated [Month YYYY]"
- Each bullet: max 15 words, one sentence

### clinic_reviews table
id,
clinic_id (FK → clinics.id),
google_review_id (text, unique),  ← dedup key
author_name (text),
rating (integer 1-5),
text (text, nullable),
review_date (date),
created_at

### cities table
id, name, slug, lat, lng, clinic_count (cached integer)
Values: bangkok, phuket, chiang-mai, pattaya

### categories table
id, name, slug, description
Values: physiotherapy-clinics, dental-clinics, cosmetic-clinics, wellness-clinics

### blog_posts
NOT in database — sourced from /content/blog/*.mdx files

---

## Slug Generation Rules (Thai + English)

The problem: Thai names cannot go in URLs directly.
"ฟิสิโอ คลินิก" becomes %E0%B8%9F%E0%B8%B4... — broken for SEO.

Decision tree (run in this exact order):
1. Does an English name exist in the CSV? → use it
2. Does name contain Thai characters? → use `transliterate` npm package, then slugify
3. Neither? → slugify the name directly

After generating the slug:
- Under 4 characters? → use "clinic-" + last 6 chars of google_place_id
- Already exists in DB? → append "-[city-slug]" (e.g. "-bangkok")
- Still a collision? → append "-2", "-3" etc.

Slug formatting rules:
- Lowercase everything
- Spaces → hyphens
- Remove: ' " ( ) / . , & + @
- Replace: & → and, + → and, @ → at
- Remove Thai characters AFTER transliteration
- Max 60 characters — truncate at last complete word
- No double hyphens, no leading/trailing hyphens

Required package: `npm install transliterate`
Usage: `import { transliterate } from 'transliterate'`

Examples:
"Thonglor Physio Center"      → thonglor-physio-center
"Dr. Somchai's Clinic (BKK)"  → dr-somchais-clinic-bkk
"ฟิสิโอ คลินิก สุขุมวิท"        → fisio-klinik-sukhumwit
"BKK Physio & Wellness"       → bkk-physio-and-wellness

Never:
- Use Thai characters in a slug
- Generate slugs from address or about fields
- Change a slug once a page is indexed (requires 301 redirect)

---

## Component Conventions
- All components in /components/, PascalCase filenames
- /components/clinic/  → ClinicCard, ClinicRow, ClinicProfile, FilterChips
- /components/layout/  → Header, Footer, Nav, Breadcrumb
- /components/seo/     → StructuredData, MetaTags
- /components/ui/      → Button, Badge, Chip, Skeleton
- Tailwind only. No inline styles. No CSS modules.
- Every interactive element needs keyboard accessibility (focus states)
- generateMetadata() exported from every page file — no exceptions

---

## What NOT to Do

### Technical
- Never use Vercel — Cloudflare Pages only
- Never use useState for data that belongs in the database
- Never create URLs deeper than 3 levels: /city/category/clinic
- Never use ?query=params in indexed URLs
- Never paginate to /page/2/ — use cursor-based loading
- Never add a feature without asking: does this help users find the right clinic faster?

### SEO
- Never use the same meta title on two pages
- Never add a page without a canonical tag
- Never redirect everything to homepage — redirect to most relevant page
- Never add noindex without explicit instruction
- Never keyword stuff
- Never write intro paragraphs that don't answer the query

### Design
- Never add animations beyond what is specified above
- Never add popups, modals, or overlays on page load
- Never use stock photography
- Never use Inter or any font not specified in this file
- Never use #30669D

---

## Current Session Priority

### Built this session (2026-03-21, session 1)

**Production domain migrated: thailandclinics.co → thailand-clinics.com**
**5 new static pages:** /about/, /how-we-rank/, /privacy/, /terms/, /list-your-clinic/
**Footer updated:** Company column links correct, copyright 2026
**SEO/crawl files:** robots.txt fixed, llms.txt created, sitemap auto-generates at build
**queries.ts:** getCategoryCountsForCity, getTopClinicsByCity, getCityCountsForCategory,
getTopClinicsByCategory added

### Built this session (2026-03-21, session 2)

**Category landing pages — 4 pages built**
- src/app/(categories)/physiotherapy-clinics/page.tsx
- src/app/(categories)/dental-clinics/page.tsx
- src/app/(categories)/cosmetic-clinics/page.tsx
- src/app/(categories)/wellness-clinics/page.tsx
- Shared component: src/components/pages/CategoryLandingPage.tsx
- Route note: static routes in (categories)/ take priority over [city] dynamic segment

**Nav Browse dropdown**
- CSS-only hover dropdown in Nav.tsx — 2-column panel: By City + By Category
- Classes: .nav-browse-wrapper, .nav-browse-dropdown, .nav-browse-col-title, .nav-browse-link
- Added to globals.css

**Footer Browse column fixed**
- Dental, Wellness, Cosmetic now link to correct category pages (were all "/")
- Cities column has trailing slashes

**Clinic profile page — full redesign**
- File: src/app/[city]/[category]/[slug]/page.tsx
- New component: src/components/clinic/OpenStatus.tsx ('use client', Bangkok UTC+7)

Layout zones:
- Zone 1 Hero (white bg): At-a-Glance card (DOM-first → top on mobile, sticky right on
  desktop via CSS order), H1, rating, overview paragraph, attribute chips
- Zone 2 "What ThailandClinics Found" (linen-dark bg): key term pills + bolded bullets +
  "Worth knowing" negatives. Gated on >= 2 non-null review_positives.
- Patient Voices (linen bg): English-only (>65% Latin alpha), >= 4 stars, limit 3,
  no author names shown, "via Google" attribution
- Zone 3 Details (linen bg): collapsible <details> blocks — Opening Hours (today
  highlighted), Services, Location & Getting There
- Nearby (linen-dark bg): compact rows sorted by haversine distance, limit 3
- Mobile sticky CTA: fixed bottom bar with phone + "Call Now" button, hidden >= 1024px

Key helpers in page.tsx:
- extractKeyTerms(bullets) — matches TECHNIQUE_TERMS + CONDITION_TERMS arrays, max 8
- boldKeyTerms(text, terms) — wraps matches in <mark> with green-pale bg
- isEnglish(text) — >65% Latin alpha chars = English
- truncate(text, maxWords) — word-based truncation for overview paragraph
- parseHours(raw) — JSON opening hours → ordered day rows
- haversine(lat1,lng1,lat2,lng2) — distance in km for nearby sort

CSS profile classes added to globals.css:
.profile-hero, .profile-hero-inner, .profile-hero-grid, .profile-hero-content,
.profile-glance-card, .profile-editorial, .profile-editorial-inner,
.profile-verdict-card, .profile-voices, .profile-voices-inner, .profile-voices-grid,
.profile-details, .profile-details-inner, .profile-detail-block,
.profile-detail-summary, .profile-detail-content, .profile-nearby,
.profile-nearby-inner, .profile-sticky-cta, .glance-maps-btn, .nearby-row

**Google Maps URL — canonical format**
- Use: https://www.google.com/maps/search/?api=1&query=NAME&query_place_id=PLACE_ID
- Works on iOS app, Android app, and desktop browser
- DO NOT use cid column — values corrupted by float precision loss (see bug below)
- DO NOT use place_id: query format — unreliable on mobile

---

### Half done / in progress

- **City landing pages** (/bangkok/, /phuket/, /chiang-mai/, /pattaya/) — queries written,
  pages not yet built. Queries: getCategoryCountsForCity, getTopClinicsByCity
- **Multi-source reviews** (Trustpilot + Facebook + Google combined) — referenced on
  how-we-rank as "coming soon", pipeline not built
- **List your clinic form** — mailto: only, no backend. Options: Formspree, Resend
- **scripts/generate-summaries.ts** — untracked, not committed

---

### Bugs found but not fixed

- ~~`websiteSchema` name bug~~ — fixed 2026-03-21
- ~~Maps URL using corrupted CID~~ — fixed 2026-03-21
- **`cid` column in DB is permanently corrupted** — Outscraper exported CIDs as floats,
  SQLite stored them with precision loss (e.g. 7626080000000000000 vs real
  7626083593050235220). Never use the cid column for URLs. Use google_place_id always.
- **Sitemap-0.xml clinic profile URLs missing trailing slashes**
  (e.g. `.../thonglor-physio` not `.../thonglor-physio/`) — inconsistent with canonical URLs

---

### Next session priorities

1. Build city landing pages /bangkok/, /phuket/, /chiang-mai/, /pattaya/
   (queries getCategoryCountsForCity + getTopClinicsByCity already exist)
2. Decide on form backend for /list-your-clinic/ (Formspree, Resend, or keep mailto)
3. Commit scripts/generate-summaries.ts
4. Fix sitemap trailing slash issue

---

## Outscraper Column Mapping (Verified Against Real Export)

This mapping is confirmed from the actual Outscraper file.
426 rows, 106 columns. Do not guess column names — use these exactly.

### ⚠️ Critical: city vs district — the most common mistake

| Outscraper column | What it actually contains | Maps to |
|---|---|---|
| `city` | Bangkok SUB-DISTRICT (Watthana, Lat Phrao...) | `district` in DB |
| `state` | Province ("Bangkok", "Nonthaburi"...) | use to look up `city_id` |

city in Outscraper ≠ city in your database.
`state` == "Bangkok" is what maps to your Bangkok city_id.

### Full Column → DB Field Mapping

| Outscraper Column    | DB Field               | Notes |
|----------------------|------------------------|-------|
| `name`               | `name`                 | May be Thai+English mixed in one field |
| `place_id`           | `google_place_id`      | Use for dedup + slug fallback |
| `rating`             | `google_rating`        | Float, round to 1dp. ~4% null |
| `reviews`            | `google_reviews_count` | Integer. ~4% null |
| `address`            | `address`              | Full address string |
| `city`               | `district`             | ⚠️ Sub-district, NOT city |
| `state`              | city lookup            | ⚠️ "Bangkok" → city_id lookup |
| `postal_code`        | `postal_code`          | Float in file — convert to string |
| `latitude`           | `lat`                  | 100% present |
| `longitude`          | `lng`                  | 100% present |
| `phone`              | `phone`                | 99% present |
| `website`            | `website`              | 100% present |
| `email`              | `email`                | 72% present |
| `working_hours`      | `opening_hours`        | Already valid JSON — store directly |
| `about`              | `about`                | JSON with amenities/accessibility |
| `business_status`    | filter only            | Keep OPERATIONAL, skip rest |
| `photo`              | store for future use   | Google photo URL |

Ignore: `county`, `subtypes`, `type`, `h3`, `kgmid`, `cid`, `reviews_id`,
`working_hours_csv_compatible`, all `company_insights.*` columns,
all `reviews_per_score_*` columns, `website_generator`, `website_has_gtm`

### English Name Extraction Logic (for name_en field)

68% of names (289/426) contain Thai characters.
Many mix Thai + English in the same `name` field. Extract English like this:

Pattern 1 — English in brackets after Thai:
"บ้านใจอารีย์ (JR Physio Clinic - China Town)" → name_en = "JR Physio Clinic China Town"

Pattern 2 — English before colon, Thai after:
"Greenbell Medical Clinic : คลินิกกายภาพบำบัด" → name_en = "Greenbell Medical Clinic"

Pattern 3 — Latin prefix before Thai:
"FRESH คลินิกกายภาพบำบัด" → name_en = "FRESH"

Pattern 4 — Fully Thai, no Latin:
"รัชตกายา คลินิกกายภาพบำบัด" → name_en = null, transliterate for slug only

Extraction logic in code:
1. Extract content inside first () → if Latin-only → name_en
2. Extract text before ":" or "|" → if Latin-only → name_en
3. Extract leading Latin characters → if meaningful (>3 chars) → name_en
4. If none match → name_en = null

### Filter Rules (confirmed from real data)
- EXCLUDE: business_status != "OPERATIONAL" (3 rows are CLOSED_TEMPORARILY)
- EXCLUDE: reviews < 5 (leaves exactly 363 rows — your target number)
- All 426 rows have lat/lng — no coordinate filter needed
- No CLOSED_PERMANENTLY rows exist in this file

### Opening Hours
`working_hours` is valid JSON. Store directly in `opening_hours` column.
Format: `{"Monday": "9AM-8PM", "Tuesday": "Closed", "Wednesday": "9AM-8PM", ...}`
Do NOT use `working_hours_csv_compatible`.

### About Field
`about` is JSON with real structured data:
- Accessibility: wheelchair access, ramps
- Amenities: toilet, wifi
- Payments: NFC, cash, card
Store raw JSON in `about` column. Parse into individual fields in v2.

---

## Review Enrichment Pipeline

AI-generated summaries of the last 30 patient reviews per clinic.
Full pipeline documented in: ThailandClinics-ReviewEnrichment.md

### How it works
1. Export reviews from Outscraper (place_id → last 30 reviews)
2. Import to clinic_reviews table (scripts/import-reviews.ts)
3. Generate summaries via Claude Haiku API (scripts/generate-review-summaries.ts)
4. Display on clinic profile page — BEFORE the About section
5. Refresh monthly — script auto-detects stale summaries (>30 days)

### Display rules
- Only show if review_positives IS NOT NULL
  AND parsed array has >= 2 non-null items
- Display as two-column table: left = positives (checkmark icon), right = negatives (dash icon)
- Filter null values from both arrays before rendering bullets
- Show "Based on [count] reviews · Updated [Month YYYY]" as subtitle
- Each bullet: max 15 words
- Placement: between rating/chips section and About section

### The Claude prompt key rules
- Model: claude-haiku-4-5-20251001 (cheapest, fast enough)
- Force JSON output only — no preamble
- Require specificity: "avoid generic phrases without backing from reviews"
- negative field can be null — do not invent problems
- 500ms delay between API calls

### Scripts
- scripts/import-reviews.ts       — imports Outscraper reviews CSV
- scripts/generate-review-summaries.ts — generates AI summaries

### Environment variable required
ANTHROPIC_API_KEY= (add to .env.local and .env.example)

### Monthly cost
~$5/month for refresh of ~363 clinics

---

## External APIs

### Outscraper API
Used for: fetching Google Maps reviews per clinic (reviews enrichment pipeline)
SDK: outscraper-node (official Node.js/TypeScript SDK)
Install: npm install outscraper

Authentication: OUTSCRAPER_API_KEY (add to .env.local and .env.example)

Key method for reviews:
```typescript
import Outscraper from 'outscraper'
const client = new Outscraper(process.env.OUTSCRAPER_API_KEY)

// Fetch last 30 reviews for a place_id
const results = await client.googleMapsReviews(
  placeId,           // e.g. "ChIJxaKh6GCZ4jARVKExh59K1Wk"
  30,                // reviewsLimit
  'en',              // language — use 'en' for English reviews only
  undefined,         // cutoff (date threshold, optional)
  'newest'           // sort: 'newest' | 'most_relevant' | 'highest_rating'
)
```

Response shape per review:
```typescript
{
  autor_name: string,
  review_rating: number,      // 1-5
  review_text: string | null,
  review_datetime_utc: string // "MM/DD/YYYY HH:mm:ss"
  review_id: string           // unique review identifier
}
```

⚠️ Async pattern required for batches of 363 clinics:
- Do NOT call googleMapsReviews() 363 times in a loop — this will timeout
- Process in batches of 20 place_ids maximum per request
- Wait 2 seconds between batches
- See scripts/fetch-reviews.ts for the correct batching implementation

### Anthropic API
Used for: generating AI review summaries (review enrichment pipeline)
SDK: built-in fetch (no extra package needed)
Model: claude-haiku-4-5-20251001 (cheapest, fast enough for summaries)

Authentication: ANTHROPIC_API_KEY (add to .env.local and .env.example)

### Environment Variables Required
Add all to .env.local (never commit) and .env.example (commit the keys, not values):
```
TURSO_URL=
TURSO_AUTH_TOKEN=
NEXT_PUBLIC_SITE_URL=https://thailand-clinics.com
OUTSCRAPER_API_KEY=
ANTHROPIC_API_KEY=
```
