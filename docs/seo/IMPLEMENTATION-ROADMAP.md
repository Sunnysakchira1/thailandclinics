# Implementation Roadmap — ThailandClinics.com
*Generated: 2026-05-08*

## Phase 1 — Fix the Foundation (Week 1–2, May 2026)

These are blocking issues. Google cannot index the site properly until these are resolved.

### 1.1 Technical Fixes (do now)
- [ ] Fix sitemap 404 — investigate Cloudflare Pages build output, ensure sitemap.xml is served
- [ ] Fix sitemap trailing slashes — clinic profile URLs missing trailing slash in sitemap-0.xml
- [ ] Fix meta title on listing page — "Physio Clinics" → "Physiotherapy Clinics" (catTitleLabel bug)
- [ ] Fix broken links in ListingsClient.tsx:
  - `/about` → `/about/`
  - `/add-listing` → `/list-your-clinic/`
- [ ] Submit sitemap to GSC after fixing
- [ ] Request indexing for: homepage, /bangkok/physiotherapy-clinics/, 3 top clinic profiles

### 1.2 Commit Blog System (do now)
- [ ] Commit: src/app/blog/, src/components/blog/, src/lib/mdx.ts, src/mdx-components.tsx
- [ ] Commit: content/blog/physiotherapy-bangkok-guide.mdx
- [ ] Commit: modified package.json, globals.css, page.tsx (footer blog link)
- [ ] Verify /blog/ and /blog/physiotherapy-bangkok-guide/ are live after deploy

### 1.3 Listing Page Consistency Audit
- [ ] Verify all 16 listing pages (4 cities × 4 categories) load without errors
- [ ] Confirm "Coming soon" state renders correctly for empty categories
- [ ] Check all listing page nav links (Browse → /, About → /about/, List Your Clinic → /list-your-clinic/)
- [ ] Confirm breadcrumbs render correctly and link correctly on all listing pages

### 1.4 Commit Scripts
- [ ] Commit scripts/ directory (fetch-reviews.ts, generate-summaries.ts, import-clinics.ts, seed-base-data.ts)
- [ ] Delete backfill-cid.ts (dead code — CID is permanently corrupted)

---

## Phase 2 — Pillar Content (Week 2–4, May–Jun 2026)

### 2.1 /bangkok/physiotherapy-clinics/ Pillar Enhancement
Add static editorial content above and below the interactive list. This content renders server-side (SSG) and is readable by Google without JS.

**Above the list (in page.tsx, before ListingsClient):**
- 150-word intro paragraph answering "physiotherapy clinics Bangkok" immediately
- Quick stats: clinic count, avg rating, English-speaking count, price range

**Below the list (new server component, after ListingsClient):**
- FAQ block (5 questions, FAQPage schema)
  1. How much does physiotherapy cost in Bangkok?
  2. Do Bangkok physiotherapy clinics have English-speaking staff?
  3. Can I use international health insurance at Bangkok physio clinics?
  4. What's the difference between physiotherapy and Thai massage?
  5. How do I choose a physiotherapy clinic in Bangkok?
- Related links: dental clinics Bangkok, wellness clinics Bangkok, Phuket physiotherapy
- ItemList schema covering top 10 clinics by review count

### 2.2 Schema Additions (all listing pages)
- [ ] Add ItemList schema to /[city]/[category]/ pages (top 10 by review count)
- [ ] Add FAQPage schema to /[city]/[category]/ pages
- [ ] Add BreadcrumbList schema to listing pages (currently missing)
- [ ] Validate all schemas at search.google.com/test/rich-results

### 2.3 Blog Post 1 (physiotherapy-bangkok-guide.mdx)
Already written. After deploy:
- [ ] Add internal links from blog post → /bangkok/physiotherapy-clinics/ and 3 clinic profiles
- [ ] Add internal link from /bangkok/physiotherapy-clinics/ → blog post
- [ ] Submit URL to GSC for indexing

---

## Phase 3 — Data Expansion (Jun–Sep 2026)

### 3.1 Bangkok Dental Import
- [ ] Export Bangkok dental data from Outscraper (target: 200+ clinics)
- [ ] Parameterise import-clinics.ts to accept city + category args
- [ ] Run import, verify counts
- [ ] Run fetch-reviews.ts for dental clinics
- [ ] Run generate-summaries.ts for dental clinics
- [ ] Add pillar content to /bangkok/dental-clinics/
- [ ] Write + publish "Best Dental Clinics Bangkok" blog post

### 3.2 Bangkok Cosmetic + Wellness Imports
Same process as dental. Do after dental is complete and verified.

### 3.3 Phuket Import
- [ ] Export Phuket data from Outscraper (physio + dental)
- [ ] Run import, reviews, summaries
- [ ] Verify /phuket/physiotherapy-clinics/ and /phuket/dental-clinics/ pages
- [ ] Add pillar content to Phuket listing pages
- [ ] Write Phuket best-of blog posts

---

## Phase 4 — Authority Building (Sep–Dec 2026)

### 4.1 Link Building
Target sites with expat audience who link naturally to clinic directories:
- ExpatsinBangkok.com — community resource links
- InterNations Bangkok groups
- Facebook expat groups (indirect — get mentioned)
- Medical tourism blogs and travel sites
- Insurance provider resource pages (Cigna, Luma, AXA Thailand)

### 4.2 GEO (AI Search Visibility)
- [ ] Ensure FAQPage schema is present on all listing pages
- [ ] Add Speakable schema to key answer paragraphs
- [ ] Ensure llms.txt is current and comprehensive
- [ ] Monitor ChatGPT, Perplexity, Google AI Overviews for "physiotherapy clinics Bangkok" etc.
- [ ] Track AI citation frequency as standalone KPI (target: cited in 2+ AI platforms by Dec 2026)

### 4.3 Monthly Enrichment
- Run npm run enrich on 1st of each month
- Quality check 3 summaries
- Log in operations manual

### 4.4 Technical Ongoing
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms — measure at scale
- [ ] Image optimisation: add clinic photos once photo pipeline is built
- [ ] Consider ISR (incremental static regeneration) for clinic counts as data grows

---

## Decision Log

| Decision | Rationale |
|---|---|
| Pillar content on /[city]/[category]/ not separate /guides/ URL | Consolidates PageRank, avoids duplicate intent pages |
| FAQ content rendered server-side (SSG), not in ListingsClient | Google can read it without executing JS |
| Sitemap stays committed to /public/ | next-sitemap postbuild regenerates at build time; committed copy is backup |
| No pagination — cursor-based load more | Keeps all clinic data on one URL, avoids /page/2/ dilution |
| Category listing pages serve as pillar pages | ExpatDen model: one authoritative page per query intent |
