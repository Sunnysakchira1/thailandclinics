# Brand → Branch Rollup — Design Spec

**Date:** 2026-06-22
**Status:** Approved design → ready for implementation plan
**Author:** Sunny + Claude

---

## 1. Problem

Many clinics are multi-branch chains listed as separate, near-identical profiles. In the
Bangkok cosmetic category alone, ~22% of clinics belong to one of 11 brands — Aura is **9**
separate profiles (Siam, Sathon, Bangkae, Thonglor, Asok, Pinklao…), Apex ~5, V Square 3,
KKC 4. This will worsen with dental (chain-heavy) and additional cities.

Two compounding harms:
- **Listing UX / fairness** — one brand dominates the rankings, crowding out variety.
- **SEO cannibalization** — many thin, near-duplicate pages compete against each other and
  dilute brand authority instead of consolidating into one strong page.

## 2. Goal

Model a **brand** as a first-class entity. Branches roll up under it. This fixes both harms
with one data model:
- The listing shows **one card per brand** (+ standalone clinics).
- A **brand hub page** consolidates SEO authority and presents all locations.
- **Each branch keeps its own page** for hyper-local intent ("Aura Thonglor", "cosmetic clinic
  near Thonglor BTS"), nested under the brand.

## 3. Locked decisions (from brainstorming)

1. **Both UX + SEO** solved via a brand rollup data model.
2. **Keep location pages AND a brand hub** (additive in spirit — but see §6, re-slugging needs 301s).
3. **Separate `brands` table** (not self-referential, not denormalized columns).
4. **Semi-automated detection + human confirm.**
5. **Descriptive, nested URLs:** `/[city]/[category]/[brand]/[branch]/`.

## 4. URL structure (overrides the previously LOCKED 3-level rule)

```
/bangkok/cosmetic-clinics/aura-bangkok-clinic/            → brand hub
/bangkok/cosmetic-clinics/aura-bangkok-clinic/silom/      → branch profile
/bangkok/cosmetic-clinics/aura-bangkok-clinic/siam/       → branch profile
/bangkok/cosmetic-clinics/some-solo-clinic/              → standalone clinic (still 3 levels)
```

- **Brand slug** is descriptive (`aura-bangkok-clinic`), unique within a city+category AND
  across clinic slugs at the same level.
- **Branch slug** is a short location (`silom`, `siam`), unique **within the brand**.
- Standalone clinics are unchanged at 3 levels.

This consciously supersedes CLAUDE.md's *"Never create URLs deeper than 3 levels"* and
*"Max 3 clicks from homepage to any clinic profile."* **CLAUDE.md must be updated** to record
brand/branch nesting as the sanctioned pattern (see §12).

## 5. Data model

New `brands` table (Drizzle, mirrors existing schema style). A brand is scoped to one
**city + category** (cross-city brands are out of scope — see §13).

```
brands:
  id              integer PK autoincrement
  name            text not null          -- canonical brand name, e.g. "Aura Bangkok Clinic"
  slug            text not null          -- descriptive, unique per (city_id, category_id)
  city_id         integer not null FK → cities.id
  category_id     integer not null FK → categories.id
  about           text (nullable)        -- brand-level editorial; nullable in v1
  website         text (nullable)
  logo_url        text (nullable)        -- reserved; unused in v1
  branch_count    integer not null default 0   -- cached
  avg_rating      real (nullable)              -- cached, review-weighted
  total_reviews   integer not null default 0   -- cached
  created_at, updated_at
  UNIQUE (city_id, category_id, slug)
```

`clinics` gains:
```
  brand_id     integer (nullable) FK → brands.id   -- null = standalone clinic
  branch_slug  text (nullable)                      -- within-brand slug for nested URL; null for standalone
```

- `clinics.slug` stays the globally-unique slug. For **standalone** clinics it remains the
  URL slug. For **branches** it is retained only as the **301 redirect source** (old flat URL);
  the live URL is `brand.slug + "/" + branch_slug`.
- `branch_slug` is unique within a `brand_id`.

## 6. Re-slugging + 301 redirects

Branches shipped today at flat slugs (`…/aura-bangkok-clinic-siam/`). Re-slugging to nested
(`…/aura-bangkok-clinic/siam/`) requires 301s so no link/crawl breaks. Timing is ideal —
deployed hours ago, barely indexed.

- Mechanism: append to `public/_redirects` (Cloudflare Pages), matching the existing proven
  format — **two source lines per redirect** (trailing slash + non-trailing), `301`.
- The bare `aura-bangkok-clinic` branch (1,389 reviews) collides with the desired brand slug.
  Resolution: that branch's content moves to a district sub-path
  (`…/aura-bangkok-clinic/[district]/`), and the **brand hub takes over** the now-freed path
  `…/aura-bangkok-clinic/`. This is a **content takeover, not a redirect** — the URL is
  unchanged, so **no `_redirects` line** is written for it (writing one would be a self-loop).
  A visitor who bookmarked the old bare URL lands on the hub, which links to every branch.
- `apply-brands.ts` (see §7) emits redirect lines from each branch's old `clinics.slug` →
  new nested path before/while it sets `branch_slug`.

## 7. Brand detection pipeline (semi-automated)

**Step 1 — `scripts/detect-brands.ts`** (per city+category):
- Inputs: clinics for the city+category from DB, plus the raw Outscraper JSON on disk
  (`data/cosmetic_bangkok_raw.json`) for owner signals.
- Cluster candidate branches by a blend of:
  - normalized name prefix similarity (strip district/branch suffixes: "สาขา", "branch", known districts)
  - shared **website domain**
  - shared Google **owner_id / owner_title** (from raw JSON)
  - geographic spread (multiple distinct lat/lng under one name = chain)
- Output: `data/brand-clusters-<city>-<category>.json` — array of proposed brands:
  `{ name, slug, website, confidence, members: [{ clinic_slug, name, district, proposed_branch_slug }] }`.

**Step 2 — human review:** edit the JSON — merge/split clusters, fix false merges (e.g. two
unrelated "Apex"), set canonical `name`, `slug`, and each `proposed_branch_slug`.

**Step 3 — `scripts/apply-brands.ts`:**
- Validates the reviewed file (slug uniqueness within city+category and vs clinic slugs;
  branch_slug uniqueness within brand).
- Upserts `brands`, sets `clinics.brand_id` + `branch_slug`.
- Computes cached aggregates (§9).
- Emits 301 redirect lines into `public/_redirects`.
- Idempotent; re-runnable. Reusable for dental / other cities.

## 8. Routing (Next.js static export)

Two page files (the 3rd and 4th dynamic segments share the `[slug]` position, so the 4th is
nested under it):

- `src/app/[city]/[category]/[slug]/page.tsx` (existing, extended):
  - Resolve `[slug]`: if it matches a **brand** (in this city+category) → render **BrandHub**;
    else if it matches a **standalone clinic** (`brand_id IS NULL`) → render existing
    **ClinicProfile**; else `notFound()`.
  - `generateStaticParams`: standalone clinic slugs ∪ brand slugs.
  - Branch clinics (`brand_id` set) are **not** resolved here — their old slug is redirected.

- `src/app/[city]/[category]/[slug]/[branch]/page.tsx` (new):
  - `[slug]` = brand slug, `[branch]` = `branch_slug`. Render **branch profile** (reuses the
    existing ClinicProfile rendering — a branch is a clinic row) plus brand cross-links (§11).
  - `generateStaticParams`: for each brand, each branch_slug.

## 9. Aggregation rules

- `avg_rating` = review-weighted mean across branches: `Σ(rating_i × reviews_i) / Σ(reviews_i)`,
  rounded to 1 dp.
- `total_reviews` = Σ branch reviews.
- `branch_count` = count of branches.
- Brand photo = the **flagship** (most-reviewed) branch's `photo_url`.
- Recomputed by `apply-brands.ts`; a refresh is implied whenever branch data changes.

## 10. Brand hub page (v1)

New template `src/components/brand/BrandHubPage.tsx` (matching the existing profile design
system — Cormorant/DM Sans, linen/green palette):
- **H1** = brand name.
- **Hero / at-a-glance:** aggregated rating + total reviews, `branch_count` ("9 locations
  across Bangkok"), brand `about` (if present), website link.
- **Locations section:** one row per branch — district, rating, today's open status, Maps link,
  → links to that branch's page. Sorted by review count (flagship first).
- **Internal links:** city page, category page.
- **Schema:** `Organization` for the brand, with branch locations as a `department` (or
  `location`) array of `LocalBusiness` entries (name, address, geo, url). `BreadcrumbList`:
  City › Category › Brand.

Deferred to later (not v1): brand-level AI "What ThailandClinics Found" summary, an all-pins map.

## 11. Branch page changes

On a branch profile (clinic with `brand_id`):
- **"Part of [Brand] — view all 9 locations →"** link near the H1, to the brand hub.
- **"Other [Brand] locations"** section: sibling branches, nearest-first.
- **Breadcrumb stays flat-ish**: City › Category › Brand › Branch (now the hierarchy genuinely
  exists in the URL, so a 4-crumb trail is correct).
- **Canonical = self** (each branch is a distinct location with distinct address/reviews).

## 12. Listing rollup

`getClinicsBySlug` (city+category listing query) changes to return a **merged list**:
- One entry per **brand** (using cached aggregates; card shows a "9 locations" badge and links
  to the brand hub) **+** all **standalone clinics**.
- Sorted together by the existing ranking (primary: rating; tie-break: reviews). Brands use
  `avg_rating` / `total_reviews`.
- **Count line** becomes e.g. "148 clinics · 11 brands".
- **Filters** (English / BTS / MRT / weekends): a brand is shown if **any** of its branches
  matches the active filters. (Per-branch "3 of 9 match" badge is deferred.)
- The `ClinicCard` / `ClinicRow` components gain a brand variant (badge + branch_count); or a
  thin `BrandCard` wrapper reusing the same visual.

## 13. SEO & sitemap

- Brand hub: self-canonical; `Organization` schema; added to sitemap (priority 0.8).
- Branch pages: self-canonical; the new internal links flow PageRank between hub ↔ branches.
- No cannibalization: hub targets "[brand] clinic bangkok"; branches target "[brand] [district]".
- Sitemap generation must emit brand hub URLs and nested branch URLs (and **not** the old flat
  branch URLs).
- `public/_redirects` carries old-flat → new-nested 301s.

## 14. CLAUDE.md updates (part of this work)

- URL Structure section: add the brand/branch nesting pattern as sanctioned.
- "What NOT to Do → Never create URLs deeper than 3 levels": amend to allow brand/branch nesting.
- "Site Architecture → Max 3 clicks": amend (branches are 4 from home, by design).
- Internal Linking (PageRank Sculpting): add brand ↔ branch rules.
- Data Model: document `brands` table + `clinics.brand_id` / `branch_slug`.

## 15. Rollout order (single category first: Bangkok cosmetic)

1. Schema: add `brands` table + `clinics.brand_id` / `branch_slug` (migration).
2. `detect-brands.ts` → review JSON → `apply-brands.ts` (brands, brand_id, branch_slug,
   aggregates, redirects).
3. Routing: extend `[slug]` resolver + add `[slug]/[branch]` page.
4. BrandHubPage component + branch cross-links.
5. Listing rollup query + card.
6. Sitemap + schema + `public/_redirects`.
7. CLAUDE.md updates.
8. Build, verify (§16), deploy.
9. Then repeat the data step for physiotherapy (Bangkok + Phuket) and future categories.

## 16. Verification

- Build passes (`next build`, static export).
- Brand hub renders: correct aggregated rating, all branches listed, links resolve.
- Branch page renders at nested URL; old flat URL 301s to it (test a sample in `_redirects`).
- Bare-slug collision case (Aura) resolves: hub at `/aura-bangkok-clinic/`, former bare branch
  at its district sub-path, old URL 301 → hub.
- Listing shows one Aura card with "9 locations" badge; standalone clinics unaffected; count
  line correct.
- Sitemap contains hub + nested branch URLs, not old flat URLs.
- Schema validates (Organization on hub, LocalBusiness on branches).
- Filters: enabling "English" still surfaces a brand if any branch qualifies.

## 17. Out of scope (v1 YAGNI)

Brand-level AI summary, all-pins map, brand logos, cross-city brands, "X of Y match filter"
badges, per-branch verified/featured at brand level. Branch-level verdict blocks stay on
branch pages.

## 18. Risks / watch-items

- **False merges** in detection → mitigated by the human-confirm step.
- **Slug collisions** (brand vs clinic vs branch) → validated in `apply-brands.ts`.
- **Redirect correctness** for the Aura bare-slug case → explicit test in §16.
- **Ranking fairness**: a mega-brand with huge `total_reviews` shouldn't auto-top by volume —
  ranking is rating-primary, so this is controlled; revisit if a brand still dominates.
