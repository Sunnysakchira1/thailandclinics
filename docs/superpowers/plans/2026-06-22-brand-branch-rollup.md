# Brand → Branch Rollup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Roll multi-branch clinics up under a first-class `brand` entity — one brand hub page + listing card, with each branch keeping its own nested page — fixing both listing clutter and SEO cannibalization.

**Architecture:** New `brands` table scoped per city+category; `clinics` gain `brand_id` + `branch_slug`. Branches live at nested URLs `/[city]/[category]/[brand]/[branch]/`; the existing `[slug]` segment resolves brand-hub-or-standalone. Semi-automated detection script proposes brand clusters → human edits JSON → apply script writes brands, aggregates, and 301 redirects. Bangkok cosmetic ships first; the data step then repeats per category.

**Tech Stack:** Next.js 16 (App Router, `output: "export"`), Drizzle ORM + Turso (libsql), drizzle-kit (`push`), next-sitemap, Cloudflare Pages (`public/_redirects`), TypeScript, tsx scripts.

## Global Constraints

- **No test framework in this repo.** Each task is verified by *running and observing*: `npx drizzle-kit push`, `npx tsx --env-file=.env.local scripts/…`, DB queries, `npx next build`, and `curl` against `npx next dev -p 3947`. Copy that pattern; do not introduce jest/vitest.
- **Design system:** Cormorant Garamond (display) + DM Sans (UI). Colors via CSS vars (`--green #1a4731`, `--linen #faf8f5`, `--terracotta #c4622d`, etc.). Never Inter, never `#30669D`, never pure-white page bg. Match existing `src/app/[city]/[category]/[slug]/page.tsx` and `src/components/pages/CategoryLandingPage.tsx`.
- **URL canonical form:** trailing slash on every internal URL.
- **Brand scope:** one brand = one `(city_id, category_id)`. Cross-category/cross-city brands are out of scope.
- **Slug uniqueness:** brand slug unique per `(city_id, category_id)` and must not collide with any standalone clinic slug at the same level; branch_slug unique within a brand.
- **DB env:** every script and drizzle-kit call runs with `--env-file=.env.local` (TURSO_URL, TURSO_AUTH_TOKEN, etc.).
- **First target:** Bangkok cosmetic (`city=bangkok`, `category=cosmetic-clinics`) only. Other categories reuse the same scripts later.
- **Commit after every task.** Branch off `main` is not required (repo convention commits features to `main`); do NOT push until Task 13.

---

## File map

- Modify `src/lib/db/schema.ts` — add `brands` table; add `brandId`, `branchSlug` to `clinics`.
- Create `scripts/detect-brands.ts` — cluster candidate branches → review JSON.
- Create `scripts/apply-brands.ts` — apply reviewed JSON: brands, brand_id, branch_slug, aggregates, redirects.
- Modify `src/lib/db/queries.ts` — brand queries + listing rollup + branch resolution; new types.
- Modify `src/app/[city]/[category]/[slug]/page.tsx` — resolver (hub vs standalone) + static params.
- Create `src/app/[city]/[category]/[slug]/[branch]/page.tsx` — nested branch route.
- Create `src/components/brand/BrandHubPage.tsx` — brand hub template.
- Modify `src/components/clinic/ListingsClient.tsx` — brand card variant + count line + filter rule.
- Modify `next-sitemap.config.js` — depth-4 priority.
- Modify `public/_redirects` — appended by apply-brands (generated, not hand-written).
- Modify `CLAUDE.md` — un-lock 3-level rule, document brands model + internal linking.

---

### Task 1: Schema — `brands` table + `clinics.brand_id` / `branch_slug`

**Files:**
- Modify: `src/lib/db/schema.ts` (clinics table ~line 28-90; add brands table after clinics)

**Interfaces:**
- Produces: `brands` table (`id, name, slug, cityId, categoryId, about, website, logoUrl, branchCount, avgRating, totalReviews, createdAt, updatedAt`); `clinics.brandId` (nullable int FK), `clinics.branchSlug` (nullable text).

- [ ] **Step 1: Add the `brands` table to schema.ts**

Insert after the `clinics` table definition (before `clinicReviews`):

```ts
export const brands = sqliteTable("brands", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  name:        text("name").notNull(),
  slug:        text("slug").notNull(),
  cityId:      integer("city_id").notNull().references(() => cities.id),
  categoryId:  integer("category_id").notNull().references(() => categories.id),
  about:       text("about"),
  website:     text("website"),
  logoUrl:     text("logo_url"),
  branchCount:  integer("branch_count").notNull().default(0),
  avgRating:    real("avg_rating"),
  totalReviews: integer("total_reviews").notNull().default(0),
  createdAt:   text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt:   text("updated_at").notNull().default(sql`(datetime('now'))`),
}, (t) => ({
  brandSlugUnique: uniqueIndex("brands_city_cat_slug_unq").on(t.cityId, t.categoryId, t.slug),
}));
```

Ensure `uniqueIndex` is imported from `drizzle-orm/sqlite-core` at the top (add to the existing import that already brings in `sqliteTable`, `integer`, `text`, `real`).

- [ ] **Step 2: Add brand columns to the `clinics` table**

Inside `sqliteTable("clinics", {...})`, after `categoryId:`:

```ts
  brandId:    integer("brand_id").references(() => brands.id),
  branchSlug: text("branch_slug"),
```

Note: `brands` is defined after `clinics`, so the `.references(() => brands.id)` arrow (lazy) is required — do not reference eagerly.

- [ ] **Step 3: Push the schema to Turso**

Run: `npx drizzle-kit push --config drizzle.config.ts` (it reads env from the shell; prefix with env if needed: `TURSO_URL=… TURSO_AUTH_TOKEN=… npx drizzle-kit push`). Accept the additive changes when prompted (new table + nullable columns — no data loss).

Expected: drizzle-kit reports creating `brands` and altering `clinics` (2 new columns). If it warns about data loss, STOP — the changes should be purely additive.

- [ ] **Step 4: Verify columns exist**

Run:
```bash
npx tsx --env-file=.env.local -e '
import {createClient} from "@libsql/client";
const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_AUTH_TOKEN});
const t=await c.execute("PRAGMA table_info(clinics)");
console.log("clinics has brand_id/branch_slug:", t.rows.filter(r=>["brand_id","branch_slug"].includes(r.name)).map(r=>r.name));
const b=await c.execute("SELECT name FROM sqlite_master WHERE type=\"table\" AND name=\"brands\"");
console.log("brands table:", b.rows.length===1);
'
```
Expected: `clinics has brand_id/branch_slug: [ "brand_id", "branch_slug" ]` and `brands table: true`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat(db): add brands table + clinics.brand_id/branch_slug"
```

---

### Task 2: Brand detection script

**Files:**
- Create: `scripts/detect-brands.ts`

**Interfaces:**
- Produces: `data/brand-clusters-<city>-<category>.json` — `Array<{ name, slug, website, confidence, members: Array<{ clinicSlug, name, district, lat, lng, reviews, proposedBranchSlug }> }>`. Only clusters with ≥2 members are written.

- [ ] **Step 1: Write `scripts/detect-brands.ts`**

```ts
/**
 * Detect candidate multi-branch brands for a city+category → review JSON.
 * Usage: npx tsx --env-file=.env.local scripts/detect-brands.ts --city bangkok --category cosmetic-clinics --raw data/cosmetic_bangkok_raw.json
 * Output: data/brand-clusters-<city>-<category>.json  (then human-edit before apply)
 */
import fs from "fs";
import { createClient } from "@libsql/client";

const arg = (n: string, d?: string) => {
  const i = process.argv.indexOf(`--${n}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  if (d !== undefined) return d;
  throw new Error(`missing --${n}`);
};

const STOP = ["clinic","clinics","bangkok","คลินิก","สาขา","branch","co","ltd","the","by","centre","center","khlinik"];
const KNOWN_DISTRICT_HINTS = ["siam","silom","sathon","sathorn","thonglor","thong lo","asok","asoke","pinklao","bangkae","bang kae","ekkamai","ari","ratchada","emquartier","emporium","central"];

const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9ก-๙ ]/g, " ").replace(/\s+/g, " ").trim();
const domain = (url: string | null) => { try { return url ? new URL(url).hostname.replace(/^www\./, "") : null; } catch { return null; } };
const brandKey = (name: string) => norm(name).split(" ").filter(w => w && !STOP.includes(w)).slice(0, 2).join(" ");
const slugify = (s: string) => norm(s).replace(/[ก-๙]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

async function main() {
  const city = arg("city"), category = arg("category");
  const rawPath = arg("raw", "");
  const c = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });

  const rows = (await c.execute({
    sql: `SELECT cl.slug, COALESCE(cl.name_en, cl.name) disp, cl.name, cl.district, cl.lat, cl.lng,
                 cl.website, cl.google_reviews_count reviews
          FROM clinics cl JOIN cities ci ON ci.id=cl.city_id JOIN categories ca ON ca.id=cl.category_id
          WHERE ci.slug=? AND ca.slug=?`,
    args: [city, category],
  })).rows as any[];

  // optional owner signal from raw export
  const ownerBySlugName: Record<string, string> = {};
  if (rawPath && fs.existsSync(rawPath)) {
    const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
    for (const r of raw) if (r.owner_id) ownerBySlugName[norm(r.name || "")] = String(r.owner_id);
  }

  // cluster by brandKey, then merge clusters sharing a website domain
  const byKey: Record<string, any[]> = {};
  for (const r of rows) {
    const k = brandKey(r.disp);
    if (!k) continue;
    (byKey[k] ||= []).push(r);
  }

  const clusters = Object.entries(byKey)
    .filter(([, m]) => m.length >= 2)
    .map(([key, members]) => {
      // confidence: shared domain or owner across members raises it
      const domains = new Set(members.map(m => domain(m.website)).filter(Boolean));
      const distinctCoords = new Set(members.map(m => `${m.lat.toFixed(3)},${m.lng.toFixed(3)}`));
      const confidence = (domains.size === 1 ? 0.5 : 0.2) + (distinctCoords.size === members.length ? 0.4 : 0.1)
                         + (members.length >= 3 ? 0.1 : 0);
      const brandName = members.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))[0].disp
        .replace(/\s*[-–|:].*$/, "").trim();
      return {
        name: brandName,
        slug: slugify(brandName),
        website: [...domains][0] ? `https://${[...domains][0]}` : null,
        confidence: Math.min(1, Number(confidence.toFixed(2))),
        members: members.map(m => {
          // propose branch slug from district, else trailing words of name
          const distHint = KNOWN_DISTRICT_HINTS.find(h => norm(m.disp).includes(h) || norm(m.district || "").includes(h));
          const tail = norm(m.disp).split(" ").filter(w => !STOP.includes(w)).slice(2).join("-");
          const proposed = slugify(distHint || tail || m.district || "main");
          return { clinicSlug: m.slug, name: m.disp, district: m.district, lat: m.lat, lng: m.lng,
                   reviews: m.reviews, proposedBranchSlug: proposed || "main" };
        }),
      };
    })
    .sort((a, b) => b.members.length - a.members.length);

  const out = `data/brand-clusters-${city}-${category}.json`;
  fs.writeFileSync(out, JSON.stringify(clusters, null, 2));
  console.log(`Wrote ${clusters.length} candidate brands (${clusters.reduce((s, c) => s + c.members.length, 0)} branches) → ${out}`);
  console.log("⚠️  REVIEW + EDIT this file before running apply-brands.ts (fix names, slugs, branch slugs, false merges).");
}
main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run detection for Bangkok cosmetic**

Run: `npx tsx --env-file=.env.local scripts/detect-brands.ts --city bangkok --category cosmetic-clinics --raw data/cosmetic_bangkok_raw.json`
Expected: `Wrote ~11 candidate brands (~33 branches) → data/brand-clusters-bangkok-cosmetic-clinics.json`.

- [ ] **Step 3: Inspect the output**

Run: `node -e 'const x=require("./data/brand-clusters-bangkok-cosmetic-clinics.json"); x.forEach(b=>console.log(b.confidence, b.slug, "→", b.members.map(m=>m.proposedBranchSlug).join(",")))'`
Expected: Aura shows ~9 members with distinct branch slugs; confidence values present. Sanity-check no obviously-unrelated clinics are grouped.

- [ ] **Step 4: Commit the script**

```bash
git add scripts/detect-brands.ts
git commit -m "feat(scripts): brand detection → review JSON"
```

---

### CHECKPOINT A — human review of clusters (manual, no code)

Open `data/brand-clusters-bangkok-cosmetic-clinics.json` and edit:
- Fix any false merges (split unrelated clinics that share a name token, e.g. two different "Apex").
- Set the canonical `name` and brand `slug` (descriptive, e.g. `aura-bangkok-clinic`).
- Set each `proposedBranchSlug` to a clean location (`siam`, `silom`, `thonglor`…), unique within the brand.
- Delete any cluster that isn't actually one brand.

This file is the source of truth for Task 4. Do not proceed until reviewed. (`data/` is gitignored — the file is a working artifact, not committed.)

---

### Task 3: Apply script — brands, brand_id, branch_slug, aggregates, redirects

**Files:**
- Create: `scripts/apply-brands.ts`
- Modifies at runtime: `brands`/`clinics` rows in Turso, appends to `public/_redirects`.

**Interfaces:**
- Consumes: reviewed `data/brand-clusters-<city>-<category>.json`, schema from Task 1.
- Produces: `brands` rows; `clinics.brandId`+`branchSlug` set for members; cached aggregates; 301 lines in `public/_redirects`.

- [ ] **Step 1: Write `scripts/apply-brands.ts`**

```ts
/**
 * Apply a reviewed brand-clusters JSON to the DB + generate 301 redirects.
 * Usage: npx tsx --env-file=.env.local scripts/apply-brands.ts --city bangkok --category cosmetic-clinics [--dry-run]
 * Idempotent: re-running updates brands and re-points members.
 */
import fs from "fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { and, eq } from "drizzle-orm";
import { cities, categories, clinics, brands } from "../src/lib/db/schema";

const DRY = process.argv.includes("--dry-run");
const arg = (n: string) => { const i = process.argv.indexOf(`--${n}`); if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1]; throw new Error(`missing --${n}`); };
const REDIRECTS = "public/_redirects";

async function main() {
  const city = arg("city"), category = arg("category");
  const file = `data/brand-clusters-${city}-${category}.json`;
  const clusters = JSON.parse(fs.readFileSync(file, "utf8")) as any[];

  const client = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });
  const db = drizzle(client, { schema: { cities, categories, clinics, brands } });

  const [ci] = await db.select().from(cities).where(eq(cities.slug, city));
  const [ca] = await db.select().from(categories).where(eq(categories.slug, category));
  if (!ci || !ca) throw new Error("city or category not found");

  // validation: collect all standalone clinic slugs in this city+cat to guard collisions
  const allClinics = await db.select({ id: clinics.id, slug: clinics.slug })
    .from(clinics).where(and(eq(clinics.cityId, ci.id), eq(clinics.categoryId, ca.id)));
  const memberSlugs = new Set(clusters.flatMap(c => c.members.map((m: any) => m.clinicSlug)));
  const standaloneSlugs = new Set(allClinics.filter(c => !memberSlugs.has(c.slug)).map(c => c.slug));

  const seenBrandSlug = new Set<string>();
  const redirectLines: string[] = [];

  for (const cl of clusters) {
    if (seenBrandSlug.has(cl.slug)) throw new Error(`duplicate brand slug: ${cl.slug}`);
    seenBrandSlug.add(cl.slug);
    if (standaloneSlugs.has(cl.slug)) throw new Error(`brand slug "${cl.slug}" collides with a standalone clinic slug`);
    const branchSlugs = cl.members.map((m: any) => m.proposedBranchSlug);
    if (new Set(branchSlugs).size !== branchSlugs.length) throw new Error(`duplicate branch slug within brand ${cl.slug}`);

    // aggregates (review-weighted)
    const members = cl.members;
    const totalReviews = members.reduce((s: number, m: any) => s + (m.reviews || 0), 0);
    const wRating = totalReviews > 0
      ? members.reduce((s: number, m: any) => s + (m.rating || 0) * (m.reviews || 0), 0) / totalReviews
      : null;
    // members JSON lacks rating; fetch from DB per member below and recompute precisely.

    if (DRY) { console.log(`[dry] brand ${cl.slug}: ${members.length} branches, ${totalReviews} reviews`); continue; }

    // upsert brand (manual: select then insert/update — libsql has no native upsert via drizzle here)
    const existing = await db.select().from(brands)
      .where(and(eq(brands.cityId, ci.id), eq(brands.categoryId, ca.id), eq(brands.slug, cl.slug)));
    let brandId: number;
    const base = { name: cl.name, slug: cl.slug, cityId: ci.id, categoryId: ca.id,
                   website: cl.website ?? null, branchCount: members.length };
    if (existing[0]) { brandId = existing[0].id; await db.update(brands).set(base).where(eq(brands.id, brandId)); }
    else { const r = await db.insert(brands).values(base).returning({ id: brands.id }); brandId = r[0].id; }

    // point members + compute precise weighted rating from DB
    let sumWR = 0, sumR = 0; let flagshipPhoto: string | null = null; let flagshipReviews = -1;
    for (const m of members) {
      const [row] = await db.select({ id: clinics.id, slug: clinics.slug, rating: clinics.googleRating,
                                      reviews: clinics.googleReviewsCount, photo: clinics.photoUrl })
        .from(clinics).where(eq(clinics.slug, m.clinicSlug));
      if (!row) throw new Error(`member clinic not found: ${m.clinicSlug}`);
      await db.update(clinics).set({ brandId, branchSlug: m.proposedBranchSlug }).where(eq(clinics.id, row.id));
      const rv = row.reviews || 0; sumWR += (row.rating || 0) * rv; sumR += rv;
      if (rv > flagshipReviews) { flagshipReviews = rv; flagshipPhoto = row.photo; }

      // redirect old flat URL → new nested URL (skip the no-op where old slug === brand slug)
      const newPath = `/${city}/${category}/${cl.slug}/${m.proposedBranchSlug}/`;
      if (row.slug !== cl.slug) {
        redirectLines.push(`/${city}/${category}/${row.slug}/ ${newPath} 301`);
        redirectLines.push(`/${city}/${category}/${row.slug} ${newPath} 301`);
      }
    }
    const avg = sumR > 0 ? Math.round((sumWR / sumR) * 10) / 10 : null;
    await db.update(brands).set({ avgRating: avg, totalReviews: sumR, logoUrl: flagshipPhoto })
      .where(eq(brands.id, brandId));
    console.log(`✓ ${cl.slug}: ${members.length} branches, ${avg}★ (${sumR} reviews)`);
  }

  if (!DRY && redirectLines.length) {
    const header = `\n# Brand re-slug 301s — ${city}/${category} (generated by apply-brands.ts)\n`;
    fs.appendFileSync(REDIRECTS, header + redirectLines.join("\n") + "\n");
    console.log(`Appended ${redirectLines.length} redirect lines → ${REDIRECTS}`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
```

Note: the `logoUrl` column stores the flagship photo (reused as the brand's representative image; the `logoUrl` name is reserved for a future real logo but is fine to hold the photo now). If you prefer a dedicated `brandPhoto` column, add it in Task 1 instead — but reusing `logoUrl` keeps schema lean (YAGNI).

- [ ] **Step 2: Dry-run**

Run: `npx tsx --env-file=.env.local scripts/apply-brands.ts --city bangkok --category cosmetic-clinics --dry-run`
Expected: one `[dry] brand …` line per cluster, no DB writes, no errors (especially no slug-collision throws). If a collision throws, fix the reviewed JSON and re-run.

- [ ] **Step 3: Apply for real**

Run: `npx tsx --env-file=.env.local scripts/apply-brands.ts --city bangkok --category cosmetic-clinics`
Expected: `✓ <brand>` lines with branch counts + weighted ratings; `Appended N redirect lines → public/_redirects`.

- [ ] **Step 4: Verify DB state**

Run:
```bash
npx tsx --env-file=.env.local -e '
import {createClient} from "@libsql/client";
const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_AUTH_TOKEN});
console.log("brands:", (await c.execute("SELECT slug,branch_count,avg_rating,total_reviews FROM brands ORDER BY branch_count DESC")).rows);
console.log("branch members:", (await c.execute("SELECT COUNT(*) n FROM clinics WHERE brand_id IS NOT NULL")).rows[0].n);
console.log("aura branches:", (await c.execute("SELECT branch_slug FROM clinics WHERE brand_id=(SELECT id FROM brands WHERE slug=\"aura-bangkok-clinic\")")).rows.map(r=>r.branch_slug));
'
```
Expected: brands listed with sensible aggregates; member count ≈ 33; Aura branch_slugs are clean locations, none null.

- [ ] **Step 5: Commit (script + generated redirects)**

```bash
git add scripts/apply-brands.ts public/_redirects
git commit -m "feat(scripts): apply brand clusters — brand_id, aggregates, 301s"
```

---

### Task 4: Brand + branch queries and types

**Files:**
- Modify: `src/lib/db/queries.ts`

**Interfaces:**
- Produces:
  - `getBrandHub(citySlug, categorySlug, brandSlug): Promise<BrandHub | null>` where `BrandHub = { id, name, slug, about, website, logoUrl, branchCount, avgRating, totalReviews, cityName, citySlug, categoryName, categorySlug, branches: BranchRow[] }` and `BranchRow = { branchSlug, name, nameEn, district, googleRating, googleReviewsCount, lat, lng, openingHours, photoUrl }`.
  - `getBranchProfile(brandSlug, branchSlug): Promise<ClinicProfile & { brandName: string; brandSlug: string; branchSlug: string } | null>`.
  - `getBrandSiblings(brandId, excludeBranchSlug): Promise<BranchRow[]>`.
  - `getListingEntries(citySlug, categorySlug): Promise<ListingEntry[]>` — merged brand + standalone entries (replaces `getClinicsBySlug` usage in the listing route).
  - `ListingEntry = ClinicListItem & { isBrand: boolean; brandSlug?: string; branchCount?: number }`.
  - static-params helpers: `getBrandSlugs()`, `getStandaloneClinicSlugs()`, `getBranchParams()`.

- [ ] **Step 1: Add brand/branch queries to queries.ts**

Add near the other clinic queries (reuse existing `db`, `eq`, `and`, `desc`, `sql`, and the `clinics/cities/categories/brands` imports — add `brands` to the schema import at the top of the file):

```ts
export type BranchRow = {
  branchSlug: string | null; name: string; nameEn: string | null; district: string | null;
  googleRating: number | null; googleReviewsCount: number | null;
  lat: number; lng: number; openingHours: string | null; photoUrl: string | null;
};

export async function getBrandHub(citySlug: string, categorySlug: string, brandSlug: string) {
  const [b] = await db.select({
    id: brands.id, name: brands.name, slug: brands.slug, about: brands.about, website: brands.website,
    logoUrl: brands.logoUrl, branchCount: brands.branchCount, avgRating: brands.avgRating,
    totalReviews: brands.totalReviews, cityName: cities.name, citySlug: cities.slug,
    categoryName: categories.name, categorySlug: categories.slug,
  }).from(brands)
    .innerJoin(cities, eq(brands.cityId, cities.id))
    .innerJoin(categories, eq(brands.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug), eq(brands.slug, brandSlug)))
    .limit(1);
  if (!b) return null;
  const branches = await db.select({
    branchSlug: clinics.branchSlug, name: clinics.name, nameEn: clinics.nameEn, district: clinics.district,
    googleRating: clinics.googleRating, googleReviewsCount: clinics.googleReviewsCount,
    lat: clinics.lat, lng: clinics.lng, openingHours: clinics.openingHours, photoUrl: clinics.photoUrl,
  }).from(clinics).where(eq(clinics.brandId, b.id))
    .orderBy(desc(clinics.googleReviewsCount));
  return { ...b, branches };
}

export async function getBranchProfile(brandSlug: string, branchSlug: string) {
  const [row] = await db.select({
    // (same projection as getClinicProfile) …plus brand fields
    id: clinics.id, name: clinics.name, nameEn: clinics.nameEn, nameTh: clinics.nameTh, slug: clinics.slug,
    district: clinics.district, address: clinics.address, postalCode: clinics.postalCode,
    lat: clinics.lat, lng: clinics.lng, phone: clinics.phone, website: clinics.website, email: clinics.email,
    googlePlaceId: clinics.googlePlaceId, cid: clinics.cid, googleRating: clinics.googleRating,
    googleReviewsCount: clinics.googleReviewsCount, englishSpeaking: clinics.englishSpeaking,
    nearBts: clinics.nearBts, nearMrt: clinics.nearMrt, openWeekends: clinics.openWeekends,
    verified: clinics.verified, featured: clinics.featured, about: clinics.about, services: clinics.services,
    languages: clinics.languages, openingHours: clinics.openingHours, photoUrl: clinics.photoUrl,
    reviewPositives: clinics.reviewPositives, reviewNegatives: clinics.reviewNegatives,
    reviewSummaryCount: clinics.reviewSummaryCount, reviewSummaryUpdatedAt: clinics.reviewSummaryUpdatedAt,
    lastVerifiedAt: clinics.lastVerifiedAt, cityName: cities.name, citySlug: cities.slug,
    categoryName: categories.name, categorySlug: categories.slug, branchSlug: clinics.branchSlug,
    brandId: clinics.brandId, brandName: brands.name, brandSlug: brands.slug,
  }).from(clinics)
    .innerJoin(cities, eq(clinics.cityId, cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .innerJoin(brands, eq(clinics.brandId, brands.id))
    .where(and(eq(brands.slug, brandSlug), eq(clinics.branchSlug, branchSlug)))
    .limit(1);
  return row ?? null;
}

export async function getBrandSiblings(brandId: number, excludeBranchSlug: string): Promise<BranchRow[]> {
  return db.select({
    branchSlug: clinics.branchSlug, name: clinics.name, nameEn: clinics.nameEn, district: clinics.district,
    googleRating: clinics.googleRating, googleReviewsCount: clinics.googleReviewsCount,
    lat: clinics.lat, lng: clinics.lng, openingHours: clinics.openingHours, photoUrl: clinics.photoUrl,
  }).from(clinics).where(and(eq(clinics.brandId, brandId), ne(clinics.branchSlug, excludeBranchSlug)));
}
```

Add `ne` to the `drizzle-orm` import.

- [ ] **Step 2: Add the merged listing query + static-params helpers**

```ts
export type ListingEntry = ClinicListItem & { isBrand: boolean; brandSlug?: string; branchCount?: number };

export async function getListingEntries(citySlug: string, categorySlug: string): Promise<ListingEntry[]> {
  // standalone clinics (brand_id IS NULL)
  const standalone = (await getClinicsBySlug(citySlug, categorySlug))
    .filter((c: any) => c.brandId == null) // requires brandId added to getClinicsBySlug projection — see note
    .map((c) => ({ ...c, isBrand: false }));
  // brands as single entries
  const brandRows = await db.select({
    id: brands.id, name: brands.name, slug: brands.slug, district: sql<string | null>`NULL`,
    googleRating: brands.avgRating, googleReviewsCount: brands.totalReviews,
    photoUrl: brands.logoUrl, branchCount: brands.branchCount,
  }).from(brands)
    .innerJoin(cities, eq(brands.cityId, cities.id))
    .innerJoin(categories, eq(brands.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug)));
  const brandEntries = brandRows.map((b) => ({
    id: -b.id, name: b.name, nameEn: b.name, slug: b.slug, district: null,
    googleRating: b.googleRating, googleReviewsCount: b.googleReviewsCount, photoUrl: b.photoUrl,
    verified: true, englishSpeaking: false, nearBts: false, nearMrt: false, openWeekends: false,
    featured: false, featuredPosition: null, services: null, hasParking: false, wheelchairAccessible: false,
    appointmentRequired: false, acceptsCard: false, acceptsNfc: false, openLate: false,
    isBrand: true, brandSlug: b.slug, branchCount: b.branchCount,
  })) as ListingEntry[];
  return [...brandEntries, ...standalone]
    .sort((a, b) => (b.googleRating ?? 0) - (a.googleRating ?? 0)
      || (b.googleReviewsCount ?? 0) - (a.googleReviewsCount ?? 0));
}

export async function getBrandSlugs() {
  return db.select({ slug: brands.slug, citySlug: cities.slug, categorySlug: categories.slug })
    .from(brands).innerJoin(cities, eq(brands.cityId, cities.id))
    .innerJoin(categories, eq(brands.categoryId, categories.id));
}
export async function getStandaloneClinicSlugs() {
  return db.select({ slug: clinics.slug, citySlug: cities.slug, categorySlug: categories.slug })
    .from(clinics).innerJoin(cities, eq(clinics.cityId, cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(isNull(clinics.brandId));
}
export async function getBranchParams() {
  return db.select({ brandSlug: brands.slug, branchSlug: clinics.branchSlug,
                     citySlug: cities.slug, categorySlug: categories.slug })
    .from(clinics).innerJoin(brands, eq(clinics.brandId, brands.id))
    .innerJoin(cities, eq(clinics.cityId, cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id));
}
```

Add `isNull` to the `drizzle-orm` import.

- [ ] **Step 3: Add `brandId` to `getClinicsBySlug` projection**

In `getClinicsBySlug`, add to the `.select({...})`: `brandId: clinics.brandId,`. Update the `ClinicListItem` type (wherever it's defined in this file) to include `brandId: number | null`. This lets `getListingEntries` filter standalone clinics.

- [ ] **Step 4: Verify queries compile + return data**

Run:
```bash
npx tsx --env-file=.env.local -e '
import {getBrandHub,getListingEntries,getBranchParams} from "./src/lib/db/queries";
const hub=await getBrandHub("bangkok","cosmetic-clinics","aura-bangkok-clinic");
console.log("hub branches:", hub?.branches.length, "avg:", hub?.avgRating);
const entries=await getListingEntries("bangkok","cosmetic-clinics");
console.log("listing entries:", entries.length, "brands:", entries.filter(e=>e.isBrand).length);
console.log("branch params:", (await getBranchParams()).length);
'
```
Expected: hub branches ≈ 9; listing entries ≈ 126 (148 − 33 branches + 11 brands); branch params ≈ 33.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/queries.ts
git commit -m "feat(db): brand hub, branch, and listing-rollup queries"
```

---

### Task 5: Brand hub page component

**Files:**
- Create: `src/components/brand/BrandHubPage.tsx`

**Interfaces:**
- Consumes: `getBrandHub` result (Task 4).
- Produces: `<BrandHubPage hub={...} />` default export.

Build this following the existing profile design (`src/app/[city]/[category]/[slug]/page.tsx`) and `CategoryLandingPage.tsx` for layout/tokens. Required structure (use the design-system tokens from Global Constraints; reuse `ClinicPhoto`, `OpenStatus`, `StructuredData`, `Breadcrumb` components already in the repo):

- **Breadcrumb:** Home › City › Category › Brand.
- **Hero (white bg):** H1 = `hub.name` (Cormorant). Sub-line: `{branchCount} locations across {cityName}` · `{avgRating}★` · `{totalReviews.toLocaleString()} reviews`. If `hub.website`, a "Visit website →" link (green). If `hub.about`, a paragraph (DM Sans).
- **Locations section (linen bg):** heading "Locations". One row per `hub.branches` (sorted as returned): `ClinicPhoto`, branch display name (`nameEn ?? name`), district, `{rating}★ ({reviews})`, `OpenStatus` from `openingHours`, a Maps link, and the row links to `/{citySlug}/{categorySlug}/{hub.slug}/{branchSlug}/`. Reuse the `.nearby-row` styling pattern from the profile page.
- **Internal links (linen-dark bg):** "All {categoryName} in {cityName} →" → `/{citySlug}/{categorySlug}/`, and "{cityName} clinics →" → `/{citySlug}/`.
- **Schema (StructuredData):** an `Organization` object — `{ "@type":"Organization", name, url (canonical brand URL), sameAs:[website].filter, department: branches.map(b => ({ "@type":"MedicalClinic", name, address, geo:{ "@type":"GeoCoordinates", latitude, longitude }, url: branch URL })) }` — plus a `BreadcrumbList`.

- [ ] **Step 1: Create the component** following the structure above (mirror the markup idioms and CSS classes already used in the profile/listing pages — do not invent new class systems).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit` — Expected: no errors in `BrandHubPage.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/brand/BrandHubPage.tsx
git commit -m "feat(brand): brand hub page component"
```

---

### Task 6: Route resolver — `[slug]` renders hub or standalone

**Files:**
- Modify: `src/app/[city]/[category]/[slug]/page.tsx` (generateStaticParams ~262; default export ~358; generateMetadata ~275)

**Interfaces:**
- Consumes: `getBrandHub`, `getBrandSlugs`, `getStandaloneClinicSlugs`, existing `getClinicProfile`.

- [ ] **Step 1: Replace `generateStaticParams`** to enumerate standalone clinic slugs + brand slugs:

```ts
export async function generateStaticParams() {
  const { getStandaloneClinicSlugs, getBrandSlugs } = await import("@/lib/db/queries");
  const [clinicsR, brandsR] = await Promise.all([getStandaloneClinicSlugs(), getBrandSlugs()]);
  return [
    ...clinicsR.map((r) => ({ city: r.citySlug, category: r.categorySlug, slug: r.slug })),
    ...brandsR.map((r) => ({ city: r.citySlug, category: r.categorySlug, slug: r.slug })),
  ];
}
```

- [ ] **Step 2: Branch the page render** — at the top of `ClinicProfilePage`, try brand first:

```ts
export default async function ClinicProfilePage({ params }: Props) {
  const { city, category, slug } = await params;
  const { getBrandHub } = await import("@/lib/db/queries");
  const hub = await getBrandHub(city, category, slug);
  if (hub) {
    const BrandHubPage = (await import("@/components/brand/BrandHubPage")).default;
    return <BrandHubPage hub={hub} />;
  }
  const clinic = await getClinicProfile(slug);
  if (!clinic || clinic.brandId != null) notFound(); // branch clinics live at nested URL only
  // …existing standalone render unchanged…
}
```

(Add `brandId` to the `getClinicProfile` projection + `ClinicProfile` type so the `clinic.brandId != null` guard works — `brandId: clinics.brandId`.)

- [ ] **Step 3: Update `generateMetadata`** to return brand metadata when the slug is a brand (title `"{Brand} — {Category} in {City} | ThailandClinics"`, canonical `/{city}/{category}/{slug}/`); otherwise fall through to the existing clinic metadata.

- [ ] **Step 4: Verify build + render**

Run: `npx next build` (Expected: completes; static params include brand + standalone, not branch slugs).
Then `npx next dev -p 3947 &`, wait, and:
```bash
curl -sL http://localhost:3947/bangkok/cosmetic-clinics/aura-bangkok-clinic/ -o /tmp/h.html -w "%{http_code}\n"  # 200, brand hub H1
curl -sL http://localhost:3947/bangkok/cosmetic-clinics/aura-bangkok-clinic-siam/ -o /dev/null -w "%{http_code}\n" # old flat → 404 in dev (301 only in prod via _redirects)
```
Expected: hub 200 with "Aura" H1 + Locations; a standalone clinic still 200.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[city]/[category]/[slug]/page.tsx" src/lib/db/queries.ts
git commit -m "feat(routing): [slug] resolves brand hub or standalone clinic"
```

---

### Task 7: Nested branch route

**Files:**
- Create: `src/app/[city]/[category]/[slug]/[branch]/page.tsx`

**Interfaces:**
- Consumes: `getBranchProfile`, `getBranchParams`, `getBrandSiblings`, existing profile render + review queries.

- [ ] **Step 1: Create the nested page.** `generateStaticParams` uses `getBranchParams()` → `{ city, category, slug: brandSlug, branch: branchSlug }`. The render fetches `getBranchProfile(slug, branch)`; if null `notFound()`. Render the **existing clinic profile UI** (extract the standalone render from Task 6 into a shared `ClinicProfileView` component, or import and reuse it) passing the branch's data, plus the cross-link block from Task 8. `generateMetadata` builds title `"{Branch name} — {Category} in {District}, {City} | ThailandClinics"`, canonical `/{city}/{category}/{slug}/{branch}/`.

Note: to avoid duplicating the large profile JSX, refactor the standalone profile body from `[slug]/page.tsx` into `src/components/clinic/ClinicProfileView.tsx` and import it in both routes. Do this refactor as the first step here (move, don't rewrite).

- [ ] **Step 2: Verify build + render**

`npx next build` then dev-curl:
```bash
curl -sL http://localhost:3947/bangkok/cosmetic-clinics/aura-bangkok-clinic/siam/ -o /tmp/b.html -w "%{http_code}\n"
grep -oE '<h1[^>]*>[^<]*</h1>' /tmp/b.html | head -1
grep -oE 'MedicalClinic|aggregateRating' /tmp/b.html | sort -u
```
Expected: 200, H1 = branch name, schema present.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[city]/[category]/[slug]/[branch]/page.tsx" src/components/clinic/ClinicProfileView.tsx "src/app/[city]/[category]/[slug]/page.tsx"
git commit -m "feat(routing): nested branch profile route"
```

---

### Task 8: Branch cross-linking (Part-of-brand + siblings)

**Files:**
- Modify: `src/components/clinic/ClinicProfileView.tsx` (from Task 7)
- Use: `getBrandSiblings`

**Interfaces:**
- Consumes: optional `brand?: { name, slug, branchCount }` and `siblings?: BranchRow[]` props on `ClinicProfileView`.

- [ ] **Step 1: Add optional brand props to `ClinicProfileView`.** When `brand` is present, render near the H1: `"Part of {brand.name} — view all {brand.branchCount} locations →"` linking to `/{city}/{category}/{brand.slug}/`. When `siblings` present and non-empty, render an "Other {brand.name} locations" section (reuse `.nearby-row` styling), each linking to `/{city}/{category}/{brand.slug}/{sibling.branchSlug}/`, nearest-first (sort by haversine to current branch).

- [ ] **Step 2: Wire it in the nested route** (Task 7 page): fetch `getBrandSiblings(profile.brandId, branch)` and pass `brand` + `siblings` to `ClinicProfileView`. Standalone route passes neither.

- [ ] **Step 3: Verify render**

dev-curl the branch page; expect the "Part of Aura Bangkok Clinic — view all 9 locations" link and an "Other Aura … locations" section with sibling links.

- [ ] **Step 4: Commit**

```bash
git add src/components/clinic/ClinicProfileView.tsx "src/app/[city]/[category]/[slug]/[branch]/page.tsx"
git commit -m "feat(brand): branch ↔ brand cross-linking"
```

---

### Task 9: Listing rollup (brand card + count + filters)

**Files:**
- Modify: `src/app/[city]/[category]/page.tsx:82` (use `getListingEntries`)
- Modify: `src/components/clinic/ListingsClient.tsx`

**Interfaces:**
- Consumes: `getListingEntries` → `ListingEntry[]` (Task 4).

- [ ] **Step 1: Switch the listing route to `getListingEntries`.** In `src/app/[city]/[category]/page.tsx`, replace `getClinicsBySlug(city, category)` with `getListingEntries(city, category)`; pass the result to `ListingsClient` (same prop).

- [ ] **Step 2: Render brand entries in `ListingsClient`.** For an entry where `isBrand`, the card/row links to `/{city}/{category}/{brandSlug}/` and shows a badge `"{branchCount} locations"` (DM Sans, uppercase 10.5px, green-pale bg). Standalone entries render exactly as today. The card href is `entry.isBrand ? \`/${city}/${category}/${entry.brandSlug}/\` : \`/${city}/${category}/${entry.slug}/\``.

- [ ] **Step 3: Count line + filters.** Update the results count to `"{totalBranchesAndStandalone} clinics · {brandCount} brands"` (compute: standalone count + Σ branchCount = 148; brandCount = entries with isBrand). For client-side filters (English/BTS/etc.): a brand entry has no per-branch flags in `ListingEntry`; for v1 a brand entry passes a filter only when no such filter is active OR keep brand entries always visible and note this is the any-match simplification. Implement: brand entries are not filtered out by attribute filters in v1 (they always show); standalone clinics filter as today. (Document this as the v1 any-match behavior.)

- [ ] **Step 4: Verify render**

dev-curl `/bangkok/cosmetic-clinics/`:
```bash
curl -sL http://localhost:3947/bangkok/cosmetic-clinics/ -o /tmp/l.html
grep -oE 'href="/bangkok/cosmetic-clinics/aura-bangkok-clinic/"' /tmp/l.html | head -1   # brand card links to hub
grep -oiE '[0-9]+ locations' /tmp/l.html | head -3                                       # branch badge
grep -oiE '148 clinics · 11 brands|clinics ·' /tmp/l.html | head -1                       # count line
```
Expected: one Aura card linking to the hub with a "9 locations" badge; count line present; no 9 separate Aura cards.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[city]/[category]/page.tsx" src/components/clinic/ListingsClient.tsx
git commit -m "feat(listing): roll branches up into one brand card"
```

---

### Task 10: Sitemap + SEO finishing

**Files:**
- Modify: `next-sitemap.config.js`

- [ ] **Step 1: Give depth-4 (branch) URLs priority 0.8.** In the `transform` function, after the `depth === 3` branch add:

```js
    } else if (depth === 4) {
      // /[city]/[category]/[brand]/[branch]
      priority   = 0.8;
      changefreq = "monthly";
    }
```

(Brand hubs are depth 3 → already 0.8. next-sitemap discovers all pages by scanning `/out`, so nested branch pages are included automatically and old flat branch pages no longer exist in `/out`.)

- [ ] **Step 2: Build and verify sitemap contents**

```bash
npx next build   # runs postbuild → next-sitemap
grep -c "aura-bangkok-clinic/" out/sitemap*.xml      # hub + nested branches present
grep -c "aura-bangkok-clinic-siam" out/sitemap*.xml  # old flat slug absent → expect 0
```
Expected: nested + hub URLs present; old flat slug count = 0.

- [ ] **Step 3: Commit**

```bash
git add next-sitemap.config.js
git commit -m "feat(seo): sitemap priority for nested branch URLs"
```

---

### Task 11: CLAUDE.md — un-lock 3-level rule + document brands

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Edit the URL Structure (LOCKED) section** to add the brand/branch pattern:

```
/[city]/[category]/[brand]/            → brand hub (multi-branch clinics)
/[city]/[category]/[brand]/[branch]/   → individual branch profile
```
with an example (`/bangkok/cosmetic-clinics/aura-bangkok-clinic/silom/`) and a note that brand/branch nesting is the sanctioned exception to the 3-level rule.

- [ ] **Step 2: Amend "What NOT to Do → Never create URLs deeper than 3 levels"** to: "Never exceed 4 levels; the only sanctioned 4th level is `[brand]/[branch]` for multi-branch clinics."

- [ ] **Step 3: Amend "Site Architecture → Max 3 clicks"** to allow branch pages at 4 clicks via their brand hub.

- [ ] **Step 4: Add to the Data Model section** a short `brands` table description + `clinics.brand_id` / `branch_slug`, and add a PageRank/Internal-Linking line: "Brand hub ↔ its branches (both directions); branches cross-link nearest siblings."

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document brand/branch URL pattern + brands data model"
```

---

### Task 12: Full verification + deploy

- [ ] **Step 1: Clean build**

Run: `npx next build` — Expected: success, no type errors, all static params generated.

- [ ] **Step 2: Run the §16 verification checklist** from the spec against `npx next dev -p 3947`:
  - brand hub renders w/ correct aggregates + all branches
  - nested branch URL renders; schema valid
  - Aura bare-slug: hub at `/aura-bangkok-clinic/`, former bare branch at its district sub-path
  - listing: one Aura card "9 locations"; standalone unaffected; count line correct
  - `out/sitemap*.xml`: hub + nested present, old flat absent
  - `public/_redirects`: old flat → nested 301 lines present and well-formed

- [ ] **Step 3: Verify redirect lines format** match the existing file (two source lines per redirect, space-separated, `301`).

- [ ] **Step 4: Commit any verification fixes, then push**

```bash
git push origin main
```
Cloudflare Pages rebuilds; `_redirects` 301s activate in production.

- [ ] **Step 5: Post-deploy spot check** (after build finishes): `curl -sI https://thailand-clinics.com/bangkok/cosmetic-clinics/aura-bangkok-clinic-siam/` → expect `301` to the nested URL; `curl -sL …/aura-bangkok-clinic/` → 200 hub.

---

## Self-Review notes

- **Spec coverage:** §5 data model → Task 1; §7 detection/apply → Tasks 2-3; §8 routing → Tasks 6-7; §9 aggregation → Task 3; §10 hub → Task 5; §11 cross-links → Task 8; §12 listing → Task 9; §13 SEO/sitemap → Tasks 3 (redirects) + 10; §14 CLAUDE.md → Task 11; §15 rollout = task order; §16 verification → Task 12. All covered.
- **Repeat for other categories:** after Task 12, re-run Tasks 2-3 (detect → review → apply) for physiotherapy (Bangkok + Phuket) and future categories — no code changes, just data. Each run appends redirects and creates brand pages picked up by the existing routes/sitemap on next build.
- **Known v1 simplification:** brand entries always show in the listing regardless of attribute filters (any-match approximation) — documented in Task 9 Step 3 and spec §17.
