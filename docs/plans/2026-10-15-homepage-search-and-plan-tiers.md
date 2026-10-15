# Homepage search, city photos and plan tiers: implementation plan

> **For agentic workers:** Implement this plan task-by-task, inline or with one subagent per task (Agent tool). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the features sold in the partner deck: Basic/Pro/Premium tiers with badges, real type-ahead search, city photos, a Premium box in guides, a doctors section, and updated pricing copy.

**Architecture:** A `tier` column on `clinics` and `brands`. One small `src/lib/tiers.ts` holds every tier and Top-rated rule. One `PlanBadges` component is used on every page. Search is a static JSON index served by a force-static route handler (`/search-index.json`) and queried client-side by a pure, unit-tested engine in `src/lib/search/`.

**Tech stack:** Next.js 16 App Router with `output: "export"`, Turso via `@libsql/client` + Drizzle, React 19, next-mdx-remote, inline styles + globals.css. New dev dependency: vitest.

**Spec:** `docs/specs/2026-10-15-homepage-search-and-plan-tiers-design.md`. Read it before starting any task.

## Global constraints

- The site is a static export (`next.config.ts` → `output: "export"`). No server code at runtime. Every data change shows only after `npm run build`.
- Badge copy is exactly `◆ Premium`, `Featured` and `★ Top rated`. Never "Premium partner".
- Top rated means `googleRating >= 4.8 && googleReviewsCount >= 50`, on any tier. It is never derived from tier.
- `Featured` (Pro) renders on the category listing only.
- Gold (`--gold #c9a84c`, `--gold-pale #fbf4e2`, `--gold-ink #7a5d17`) is used only for Premium.
- Design rules in CLAUDE.md apply: Cormorant Garamond + DM Sans only, never #30669D, linen background, 0.2s ease card hovers, no new animations, sentence-case headings.
- Do not change URLs, titles, canonicals or the sitemap.
- Don't commit unrelated working-tree changes: `.env.example`, `next-env.d.ts`, `src/app/get-matched/page.tsx`, `src/lib/forms.ts`, `.claude/`, `.firecrawl/`, `.superpowers/`. Always `git add <explicit paths>`, never `git add -A` or `.`.
- Commit messages end with: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Scripts run with `npx tsx --env-file=.env.local scripts/<name>.ts`.

## Review focus

1. **A branch of a Premium brand** (e.g. a Cosmo branch profile) must show the Premium badge and doctors even though the branch row's own `tier` is `basic`. *Test: `effectiveTier` with brand premium + clinic basic → premium (Task 1).*
2. **A Premium clinic with rating < 4.8 or < 50 reviews** must show `◆ Premium` but not `★ Top rated`. *Test: `isTopRated(4.7, 900)` and `isTopRated(5, 12)` → false (Task 1).*
3. **Search with a typo or a different spelling** must still find the clinic: "ultera", "Asoke" vs "Asok", "Thong Lo" vs "Thonglor". *Tests in Task 3.*
4. **A search word that only appears in the middle of a word** must not match ("form" must not return "Maximum Performance"). *Test in Task 3.*
5. **Under the listing's "reviews" or "name" sort**, paid entries lose their pinned position but keep their badges. *Checked in the Task 2 browser step.*

---

### Task 1: Tier foundation (data, rules, badges, test runner)

**Files:**
- Create: `vitest.config.ts`, `src/lib/tiers.ts`, `src/lib/tiers.test.ts`, `scripts/migrate-tiers.ts`, `src/components/ui/PlanBadges.tsx`
- Modify: `package.json` (devDependency `vitest`, script `"test": "vitest run"`), `src/lib/db/schema.ts` (clinics + brands `tier`, new `clinicDoctors` table), `src/app/globals.css` (gold vars)

**Interfaces produced:**
- `type Tier = 'basic' | 'pro' | 'premium'`
- `normaliseTier(v: unknown): Tier`
- `effectiveTier(clinicTier: unknown, brandTier?: unknown): Tier`
- `isTopRated(rating: number | null | undefined, reviews: number | null | undefined): boolean`
- `tierRank(t: Tier): number` (premium 2, pro 1, basic 0)
- `<PlanBadges tier={Tier} topRated={boolean} context="listing" | "default" size?="sm" | "md" />`
- Schema: `clinics.tier`, `brands.tier`, `clinicDoctors` table

- [ ] **Step 1: Install vitest and add config**

```bash
npm i -D vitest@3.2.4
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { include: ["src/**/*.test.ts"] },
});
```
Add `"test": "vitest run"` to `package.json` scripts.

- [ ] **Step 2: Write the failing tests** in `src/lib/tiers.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { normaliseTier, effectiveTier, isTopRated, tierRank } from "./tiers";

describe("tiers", () => {
  it("normalises unknown values to basic", () => {
    expect(normaliseTier(undefined)).toBe("basic");
    expect(normaliseTier("gold")).toBe("basic");
    expect(normaliseTier("premium")).toBe("premium");
  });
  it("brand tier wins for branches", () => {
    expect(effectiveTier("basic", "premium")).toBe("premium");
    expect(effectiveTier("pro", null)).toBe("pro");
    expect(effectiveTier("premium", "basic")).toBe("premium");
  });
  it("top rated needs 4.8+ and 50+ reviews", () => {
    expect(isTopRated(4.8, 50)).toBe(true);
    expect(isTopRated(4.9, 369)).toBe(true);
    expect(isTopRated(4.7, 900)).toBe(false);
    expect(isTopRated(5, 12)).toBe(false);
    expect(isTopRated(null, 100)).toBe(false);
  });
  it("ranks premium > pro > basic", () => {
    expect(tierRank("premium")).toBeGreaterThan(tierRank("pro"));
    expect(tierRank("pro")).toBeGreaterThan(tierRank("basic"));
  });
});
```

- [ ] **Step 3: Run the tests to confirm they fail.** `npm test`. Expected: FAIL, cannot resolve `./tiers`.

- [ ] **Step 4: Implement `src/lib/tiers.ts`**

```ts
export type Tier = "basic" | "pro" | "premium";

export const TOP_RATED_MIN_RATING = 4.8;
export const TOP_RATED_MIN_REVIEWS = 50;

export function normaliseTier(v: unknown): Tier {
  return v === "pro" || v === "premium" ? v : "basic";
}

/** Branches inherit their brand's plan; the higher of the two wins. */
export function effectiveTier(clinicTier: unknown, brandTier?: unknown): Tier {
  const a = normaliseTier(clinicTier);
  const b = normaliseTier(brandTier);
  return tierRank(b) > tierRank(a) ? b : a;
}

/** Earned, never sold: independent of tier. */
export function isTopRated(rating: number | null | undefined, reviews: number | null | undefined): boolean {
  return (rating ?? 0) >= TOP_RATED_MIN_RATING && (reviews ?? 0) >= TOP_RATED_MIN_REVIEWS;
}

export function tierRank(t: Tier): number {
  return t === "premium" ? 2 : t === "pro" ? 1 : 0;
}
```

- [ ] **Step 5: Run the tests.** `npm test`. Expected: PASS.

- [ ] **Step 6: Migration script** `scripts/migrate-tiers.ts` (idempotent, same pattern as `scripts/enrich-about.ts`)

```ts
/**
 * Adds plan tiers + clinic_doctors, and sets the launch Premium entries.
 * Usage: npx tsx --env-file=.env.local scripts/migrate-tiers.ts
 * Idempotent — safe to re-run.
 */
import { createClient } from "@libsql/client";

const db = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });

const DDL = [
  "ALTER TABLE clinics ADD COLUMN tier TEXT NOT NULL DEFAULT 'basic'",
  "ALTER TABLE brands ADD COLUMN tier TEXT NOT NULL DEFAULT 'basic'",
  `CREATE TABLE IF NOT EXISTS clinic_doctors (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     clinic_id INTEGER NOT NULL REFERENCES clinics(id),
     name TEXT NOT NULL,
     role TEXT,
     credentials TEXT,
     licence TEXT,
     photo_url TEXT,
     sort_order INTEGER NOT NULL DEFAULT 0
   )`,
];

async function main() {
  for (const sql of DDL) {
    try { await db.execute(sql); console.log("ok:", sql.split("\n")[0]); }
    catch (e) { if (/duplicate column/i.test(String(e))) console.log("skip (exists):", sql.split("\n")[0]); else throw e; }
  }
  // Launch Premium entries (2026-10-15). Positions: Form Asoke 1, Cosmo 2, Genesis 3, Form Thonglor 4.
  await db.execute(`UPDATE clinics SET tier='premium', featured=1, featured_position=1 WHERE slug='form-recovery-and-wellness-at-asoke'`);
  await db.execute(`UPDATE clinics SET tier='premium', featured=1, featured_position=4 WHERE slug='form-recovery-and-wellness-at-thonglor'`);
  await db.execute(`UPDATE brands SET tier='premium', featured=1, featured_position=2 WHERE slug='cosmo-clinic'`);
  await db.execute(`UPDATE brands SET tier='premium', featured=1, featured_position=3 WHERE slug='genesis-fertility-center'`);
  const c = await db.execute(`SELECT name, tier, featured_position FROM clinics WHERE tier!='basic'`);
  const b = await db.execute(`SELECT name, tier, featured_position FROM brands WHERE tier!='basic'`);
  console.table(c.rows); console.table(b.rows);
}
main();
```

- [ ] **Step 7: Run the migration and verify.** Run `npx tsx --env-file=.env.local scripts/migrate-tiers.ts`. Expected: 2 clinics and 2 brands at `premium`. Run it again. Expected: "skip (exists)" lines and no error.

- [ ] **Step 8: Schema.** In `src/lib/db/schema.ts`:
  - Add `tier: text("tier").notNull().default("basic"),` after `featuredPosition` in **both** `clinics` and `brands`.
  - Append the table:

```ts
/* ─── clinic_doctors ──────────────────────────────────────────────── */
// Shown only on Premium profiles (max 3). Created by scripts/migrate-tiers.ts.
export const clinicDoctors = sqliteTable("clinic_doctors", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  clinicId:    integer("clinic_id").notNull().references(() => clinics.id),
  name:        text("name").notNull(),
  role:        text("role"),
  credentials: text("credentials"),
  licence:     text("licence"),
  photoUrl:    text("photo_url"),
  sortOrder:   integer("sort_order").notNull().default(0),
});
export type ClinicDoctor = typeof clinicDoctors.$inferSelect;
```

- [ ] **Step 9: Gold CSS vars.** In `src/app/globals.css`, add to `:root`: `--gold: #c9a84c; --gold-pale: #fbf4e2; --gold-ink: #7a5d17;`

- [ ] **Step 10: `src/components/ui/PlanBadges.tsx`** (server component, no hooks)

```tsx
import type { Tier } from "@/lib/tiers";

type Props = {
  tier: Tier;
  topRated: boolean;
  /** "listing" is the only context where Pro shows "Featured". */
  context?: "listing" | "default";
  size?: "sm" | "md";
};

const base = (size: "sm" | "md"): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: "5px",
  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontWeight: 600,
  fontSize: size === "sm" ? "9.5px" : "10.5px", lineHeight: 1,
  letterSpacing: "0.08em", textTransform: "uppercase",
  padding: size === "sm" ? "3px 6px" : "5px 9px", borderRadius: "3px", whiteSpace: "nowrap",
});

export default function PlanBadges({ tier, topRated, context = "default", size = "md" }: Props) {
  const showFeatured = tier === "pro" && context === "listing";
  if (tier !== "premium" && !showFeatured && !topRated) return null;
  return (
    <span style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap" }}>
      {tier === "premium" && (
        <span style={{ ...base(size), background: "var(--gold-pale)", border: "1px solid var(--gold)", color: "var(--gold-ink)" }}>◆ Premium</span>
      )}
      {showFeatured && (
        <span style={{ ...base(size), background: "var(--green)", color: "var(--white)" }}>Featured</span>
      )}
      {topRated && (
        <span style={{ ...base(size), background: "var(--green-pale)", border: "1px solid #cfe0d5", color: "var(--green)" }}>★ Top rated</span>
      )}
    </span>
  );
}
```

- [ ] **Step 11: Typecheck.** Run `npx tsc --noEmit`. Expected: no new errors.

- [ ] **Step 12: Commit**
```bash
git add vitest.config.ts package.json package-lock.json src/lib/tiers.ts src/lib/tiers.test.ts scripts/migrate-tiers.ts src/lib/db/schema.ts src/app/globals.css src/components/ui/PlanBadges.tsx
git commit -m "feat(tiers): plan tier data, top-rated rule and PlanBadges"
```

---

### Task 2: Category listing, clinic profile and brand hub show plans

**Files:**
- Modify: `src/lib/db/queries.ts` (return `tier`/`brandTier` from `getClinicsBySlug`, `getClinicProfile`, `getBrandHub`, `getBranchProfile`, `getBrandSiblings`, `getListingEntries`)
- Modify: `src/components/clinic/ListingsClient.tsx` (sort ~:485–493, row render ~:718–792)
- Modify: `src/components/clinic/ClinicProfileView.tsx` (badges above H1 ~:715–738; Editor's Pick block ~:779–806)
- Modify: brand hub component, i.e. whatever `getBrandHub` renders (`BrandHubPage`, found from `src/app/[city]/[category]/[slug]/page.tsx:76–79`)

**Interfaces:**
- Consumes: `effectiveTier`, `isTopRated`, `tierRank`, `PlanBadges` (Task 1)
- Produces: listing entries and profile objects carry `tier: Tier` (already effective, i.e. brand-resolved) and `topRated: boolean`.

- [ ] **Step 1: Queries.** In each function listed above, select `clinics.tier`, and for branch/brand rows also `brands.tier`. Map every returned object to include `tier: effectiveTier(row.tier, row.brandTier)` and `topRated: isTopRated(row.googleRating ?? row.avgRating, row.googleReviewsCount ?? row.totalReviews)`. For `getListingEntries` brand entries, use `brands.tier` and the brand aggregates (`avgRating`, `totalReviews`). Keep the existing `featured`/`featuredPosition` fields so other callers don't break.

- [ ] **Step 2: Listing sort.** In `ListingsClient.tsx`, replace the default ('rating') comparator so that it orders by `tierRank(b.tier) - tierRank(a.tier)`, then `(a.featuredPosition ?? 9999) - (b.featuredPosition ?? 9999)` among paid entries, then the existing weighted rating. Leave the 'reviews' and 'name' sorts purely organic.

- [ ] **Step 3: Listing rows.**
  - Remove the `isFeatured` → "Top Rated" pill (~:779–792).
  - Render `<PlanBadges tier={clinic.tier} topRated={clinic.topRated} context="listing" />` in its place, above the category eyebrow.
  - Row frame:
    - premium: `border: 2px solid var(--gold)`
    - pro: keep the existing green left border (~:743)
    - basic: unchanged
  - Rank circle colours stay as they are.
  - The `ListingsClient` row type gains `tier: Tier; topRated: boolean`. Thread it from the page that builds the listing props (search `getListingEntries(` and `getClinicsBySlug(` call sites).

- [ ] **Step 4: Profile.**
  - In `ClinicProfileView.tsx`, render `<PlanBadges tier={clinic.tier} topRated={clinic.topRated} />` directly above the H1.
  - Pro shows nothing extra on the profile; the default context hides Featured.
  - In the Editor's Pick block (~:779), change the condition from `editorsNote || clinic.featured` to `editorsNote`, so the physio-specific fallback copy (~:806) never renders for non-physio clinics.

- [ ] **Step 5: Brand hub.** On the brand hub header and on each branch card in the hub, render `PlanBadges` with the brand tier and the brand aggregates.

- [ ] **Step 6: Build and browser check.**
  - Run `npm run build`. Expected: success, with the same page count as before.
  - Serve with `npx serve out -l 3001`, or `python3 -m http.server 3001 -d out`.
  - Check `/bangkok/physiotherapy-clinics/`: Form Asoke is #1 and Form Thonglor #2, both with a gold frame + ◆ Premium + ★ Top rated. The organic list follows. Switch sort to "Most reviewed": Form is no longer pinned and keeps its badges.
  - Check `/bangkok/cosmetic-clinics/`: the Cosmo brand card is first with ◆ Premium.
  - Check `/bangkok/physiotherapy-clinics/form-recovery-and-wellness-at-asoke/`: badges show above the H1.
  - Check a Cosmo branch page: ◆ Premium shows.

- [ ] **Step 7: Commit** (explicit paths only)
```bash
git add src/lib/db/queries.ts src/components/clinic/ListingsClient.tsx src/components/clinic/ClinicProfileView.tsx <brand hub file> <listing page files touched>
git commit -m "feat(tiers): plan badges and ordering on listings, profiles and brand hubs"
```

---

### Task 3: Search engine and static index

**Files:**
- Create: `src/lib/search/normalise.ts`, `src/lib/search/vocab.ts`, `src/lib/search/engine.ts`, `src/lib/search/engine.test.ts`, `src/app/search-index.json/route.ts`
- Modify: `src/lib/db/queries.ts` (add `getSearchRows()`)

**Interfaces:**
- Consumes: `Tier`, `isTopRated`, `effectiveTier`, `tierRank` (Task 1)
- Produces:
  - `type SearchClinic = { id:number; n:string; u:string; c:string; k:string; d:string|null; r:number|null; v:number|null; t:Tier; tr:boolean; p:string|null; w:string }`. Here `w` is the space-joined normalised tokens.
  - `type SearchIndex = { v: 1; cities: { slug: string; name: string; count: number }[]; clinics: SearchClinic[] }`
  - `search(index: SearchIndex, query: string, city: string | ""): SearchResults`
  - `type SearchResults = { treatments: { label: string; url: string; sub: string }[]; clinics: SearchClinic[]; categories: { label: string; url: string; sub: string }[] }`
  - Route `GET /search-index.json` (static at build)

- [ ] **Step 1: `normalise.ts`**

```ts
const PHRASES: [RegExp, string][] = [
  [/\bthong ?lo\b/g, "thonglor"], [/\bthong ?lor\b/g, "thonglor"],
  [/\basoke\b/g, "asok"], [/\bphrom ?phong\b/g, "phromphong"],
  [/\bsathon\b/g, "sathorn"], [/\bon ?nut\b/g, "onnut"], [/\bekkamai\b/g, "ekamai"],
  [/\bphuket town\b/g, "phukettown"], [/\bnad\+/g, "nad"],
];
const THAI = /[฀-๿]/;

export function isThai(s: string): boolean { return THAI.test(s); }

export function normalise(s: string): string {
  let x = s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  x = x.replace(/&/g, " and ").replace(/@/g, " at ");
  for (const [re, to] of PHRASES) x = x.replace(re, to);
  return x.replace(/[^\p{L}\p{N}\s+]/gu, " ").replace(/\s+/g, " ").trim();
}

export function words(s: string): string[] { return normalise(s).split(" ").filter(Boolean); }
```

- [ ] **Step 2: `vocab.ts`** (treatments → category slug)

```ts
export const CATEGORY_LABELS: Record<string, string> = {
  "physiotherapy-clinics": "Physiotherapy",
  "dental-clinics": "Dental",
  "cosmetic-clinics": "Cosmetic",
  "wellness-clinics": "Wellness",
  "fertility-clinics": "IVF & fertility",
};

export const TREATMENTS: { label: string; category: string; terms: string[] }[] = [
  { label: "Ulthera / HIFU skin lifting", category: "cosmetic-clinics", terms: ["ulthera", "ultherapy", "hifu", "skin lift", "thermage"] },
  { label: "Botox", category: "cosmetic-clinics", terms: ["botox", "toxin", "wrinkle"] },
  { label: "Dermal fillers", category: "cosmetic-clinics", terms: ["filler", "fillers", "lip filler", "juvederm"] },
  { label: "Laser and skin treatments", category: "cosmetic-clinics", terms: ["laser", "pico", "acne", "scar", "pigmentation", "melasma"] },
  { label: "Thread lift", category: "cosmetic-clinics", terms: ["thread lift", "threadlift"] },
  { label: "Dental implants", category: "dental-clinics", terms: ["implant", "implants"] },
  { label: "Veneers", category: "dental-clinics", terms: ["veneer", "veneers"] },
  { label: "Invisalign and braces", category: "dental-clinics", terms: ["invisalign", "braces", "aligners", "orthodontist"] },
  { label: "Teeth whitening", category: "dental-clinics", terms: ["whitening", "teeth whitening"] },
  { label: "Root canal", category: "dental-clinics", terms: ["root canal"] },
  { label: "Crowns and bridges", category: "dental-clinics", terms: ["crown", "crowns", "bridge"] },
  { label: "IVF / ICSI", category: "fertility-clinics", terms: ["ivf", "icsi", "fertility", "infertility"] },
  { label: "Egg freezing", category: "fertility-clinics", terms: ["egg freezing", "freeze eggs"] },
  { label: "PGT genetic testing", category: "fertility-clinics", terms: ["pgt", "genetic testing", "pgs"] },
  { label: "IUI", category: "fertility-clinics", terms: ["iui", "insemination"] },
  { label: "Back and neck pain", category: "physiotherapy-clinics", terms: ["back pain", "neck pain", "spine", "sciatica", "slipped disc"] },
  { label: "Office syndrome", category: "physiotherapy-clinics", terms: ["office syndrome", "posture"] },
  { label: "Sports injury", category: "physiotherapy-clinics", terms: ["sports injury", "acl", "knee", "shoulder", "running injury"] },
  { label: "Post-surgery rehab", category: "physiotherapy-clinics", terms: ["rehab", "rehabilitation", "post surgery"] },
  { label: "Dry needling", category: "physiotherapy-clinics", terms: ["dry needling", "needling"] },
  { label: "Health check-up", category: "wellness-clinics", terms: ["health check", "checkup", "check up", "blood test"] },
  { label: "IV therapy / NAD+", category: "wellness-clinics", terms: ["iv drip", "iv therapy", "nad", "vitamin drip"] },
  { label: "Weight management", category: "wellness-clinics", terms: ["weight loss", "weight management", "ozempic"] },
];
```

- [ ] **Step 3: Failing tests** in `src/lib/search/engine.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { normalise } from "./normalise";
import { search, wordHit, type SearchIndex, type SearchClinic } from "./engine";

const mk = (o: Partial<SearchClinic> & { n: string }): SearchClinic => ({
  id: Math.floor(Math.random() * 1e6), u: "/x/", c: "bangkok", k: "physiotherapy-clinics", d: null,
  r: 4.5, v: 100, t: "basic", tr: false, p: null, w: normalise(o.n), ...o,
});
const IDX: SearchIndex = {
  v: 1,
  cities: [{ slug: "bangkok", name: "Bangkok", count: 3 }, { slug: "phuket", name: "Phuket", count: 1 }],
  clinics: [
    mk({ n: "Form Recovery and Wellness @ Asoke", t: "premium", tr: true, r: 4.9, v: 369, w: normalise("Form Recovery and Wellness @ Asoke Khlong Toei asok physiotherapy") }),
    mk({ n: "Maximum Performance", k: "wellness-clinics" }),
    mk({ n: "Asok Montri Dental Clinic", k: "dental-clinics", w: normalise("Asok Montri Dental Clinic asok dental") }),
    mk({ n: "Formosa Physio", r: 5, v: 900, w: normalise("Formosa Physio physiotherapy") }),
    mk({ n: "Patong Smile Dental", c: "phuket", k: "dental-clinics", w: normalise("Patong Smile Dental patong dental") }),
  ],
};

describe("normalise", () => {
  it("lowercases, strips accents and applies area aliases", () => {
    expect(normalise("Thong Lo")).toBe("thonglor");
    expect(normalise("ASOKE & Café")).toBe("asok and cafe");
  });
});

describe("wordHit", () => {
  it("matches word prefixes only", () => {
    expect(wordHit("form", "formosa")).toBe(2);
    expect(wordHit("form", "performance")).toBe(0);
  });
  it("tolerates one typo on 5+ letter words", () => {
    expect(wordHit("ultera", "ulthera")).toBe(1);
    expect(wordHit("invisalgn", "invisalign")).toBe(1);
    expect(wordHit("botx", "botox")).toBe(0); // too short for fuzzy
  });
});

describe("search", () => {
  it("never matches mid-word", () => {
    const names = search(IDX, "form", "").clinics.map(c => c.n);
    expect(names).not.toContain("Maximum Performance");
  });
  it("ranks premium above organic within the same match band", () => {
    const names = search(IDX, "form", "").clinics.map(c => c.n);
    expect(names[0]).toBe("Form Recovery and Wellness @ Asoke");
    expect(names).toContain("Formosa Physio");
  });
  it("requires every word to match (dental asok)", () => {
    const names = search(IDX, "dental asoke", "").clinics.map(c => c.n);
    expect(names).toEqual(["Asok Montri Dental Clinic"]);
  });
  it("finds treatments with typos and links to the category in the chosen city", () => {
    const r = search(IDX, "ultera", "phuket");
    expect(r.treatments[0].label).toMatch(/Ulthera/);
    expect(r.treatments[0].url).toBe("/phuket/cosmetic-clinics/");
  });
  it("filters clinics by city", () => {
    expect(search(IDX, "dental", "phuket").clinics.map(c => c.n)).toEqual(["Patong Smile Dental"]);
  });
  it("returns nothing for gibberish", () => {
    const r = search(IDX, "xyzqq", "");
    expect(r.clinics.length + r.treatments.length + r.categories.length).toBe(0);
  });
});
```

- [ ] **Step 4: Run them.** `npm test`. Expected: FAIL, `./engine` is missing.

- [ ] **Step 5: `engine.ts`**

```ts
import type { Tier } from "@/lib/tiers";
import { tierRank } from "@/lib/tiers";
import { normalise, words, isThai } from "./normalise";
import { TREATMENTS, CATEGORY_LABELS } from "./vocab";

export type SearchClinic = { id: number; n: string; u: string; c: string; k: string; d: string | null; r: number | null; v: number | null; t: Tier; tr: boolean; p: string | null; w: string };
export type SearchIndex = { v: 1; cities: { slug: string; name: string; count: number }[]; clinics: SearchClinic[] };
type Link = { label: string; url: string; sub: string };
export type SearchResults = { treatments: Link[]; clinics: SearchClinic[]; categories: Link[] };

const LIMITS = { clinics: 6, treatments: 3, categories: 2 };

function editsAtMostOne(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
  }
  return edits + (la - i) + (lb - j) <= 1;
}

/** 2 = prefix (or Thai substring), 1 = one-typo prefix, 0 = no match. */
export function wordHit(q: string, w: string): 0 | 1 | 2 {
  if (w.startsWith(q)) return 2;
  if (isThai(q) && w.includes(q)) return 2;
  if (q.length >= 5) {
    for (const L of [q.length - 1, q.length, q.length + 1]) {
      if (L > 0 && L <= w.length && editsAtMostOne(q, w.slice(0, L))) return 1;
    }
  }
  return 0;
}

const cache = new WeakMap<SearchClinic, string[]>();
const tokens = (c: SearchClinic) => { let t = cache.get(c); if (!t) { t = c.w.split(" "); cache.set(c, t); } return t; };

function allWordsHit(qs: string[], ws: string[]): number {
  let total = 0;
  for (const q of qs) {
    let best = 0;
    for (const w of ws) { const h = wordHit(q, w); if (h > best) best = h; if (best === 2) break; }
    if (!best) return 0;
    total += best;
  }
  return total;
}

const weighted = (c: SearchClinic) => { const r = c.r ?? 0, v = c.v ?? 0; return (v / (v + 50)) * r + (50 / (v + 50)) * 4.3; };

export function search(index: SearchIndex, query: string, city: string | ""): SearchResults {
  const q = normalise(query);
  const qs = words(query);
  const empty = { treatments: [], clinics: [], categories: [] };
  if (!qs.length) return empty;
  const linkCity = city || "bangkok";
  const cityName = index.cities.find(x => x.slug === linkCity)?.name ?? "Bangkok";

  const treatments = TREATMENTS.filter(t => {
    const ws = [...words(t.label), ...t.terms.flatMap(words)];
    return allWordsHit(qs, ws) > 0;
  }).slice(0, LIMITS.treatments).map(t => ({ label: t.label, url: `/${linkCity}/${t.category}/`, sub: `${CATEGORY_LABELS[t.category]} clinics in ${cityName}` }));

  const categories = Object.entries(CATEGORY_LABELS).filter(([slug, label]) => allWordsHit(qs, [...words(label), ...words(slug)]) > 0)
    .slice(0, LIMITS.categories).map(([slug, label]) => ({ label: `${label} clinics`, url: `/${linkCity}/${slug}/`, sub: `in ${cityName}` }));

  const scored: { c: SearchClinic; band: number; hit: number }[] = [];
  for (const c of index.clinics) {
    if (city && c.c !== city) continue;
    const hit = allWordsHit(qs, tokens(c));
    if (!hit) continue;
    const name = normalise(c.n);
    const band = name === q ? 3 : name.startsWith(q) ? 2 : 1;
    scored.push({ c, band, hit });
  }
  scored.sort((a, b) => b.band - a.band || tierRank(b.c.t) - tierRank(a.c.t) || b.hit - a.hit || weighted(b.c) - weighted(a.c));
  return { treatments, clinics: scored.slice(0, LIMITS.clinics).map(s => s.c), categories };
}
```

- [ ] **Step 6: Run the tests.** `npm test`. Expected: PASS. If a test fails, fix the engine, not the test. The tests encode the spec.

- [ ] **Step 7: `getSearchRows()` in queries.ts.** It returns every clinic with: id, display name (`nameEn ?? name`), `nameTh`, city slug, category slug, district, rating, reviews, `photoUrl`, `services` (JSON string array of slugs), clinic `tier`, brand slug/name/tier, `branchSlug`, and the names of its nearest stations. Get the station names with one extra query over `clinicStations` joined to `transitStations`, grouped in JS.

- [ ] **Step 8: Route** `src/app/search-index.json/route.ts`

```ts
import { getSearchRows, getCityClinicCount } from "@/lib/db/queries";
import { normalise } from "@/lib/search/normalise";
import { CATEGORY_LABELS } from "@/lib/search/vocab";
import { effectiveTier, isTopRated } from "@/lib/tiers";
import type { SearchIndex } from "@/lib/search/engine";

export const dynamic = "force-static";

const CITY_NAMES: Record<string, string> = { bangkok: "Bangkok", phuket: "Phuket", "chiang-mai": "Chiang Mai", pattaya: "Pattaya" };

export async function GET() {
  const rows = await getSearchRows();
  const clinics = rows.map(r => {
    const services: string[] = (() => { try { return JSON.parse(r.services ?? "[]"); } catch { return []; } })();
    const w = normalise([
      r.name, r.nameTh ?? "", r.district ?? "", r.brandName ?? "",
      CATEGORY_LABELS[r.categorySlug] ?? "", ...services.map(s => s.replace(/-/g, " ")), ...r.stations,
    ].join(" "));
    const url = r.brandSlug && r.branchSlug
      ? `/${r.citySlug}/${r.categorySlug}/${r.brandSlug}/${r.branchSlug}/`
      : `/${r.citySlug}/${r.categorySlug}/${r.slug}/`;
    return {
      id: r.id, n: r.name, u: url, c: r.citySlug, k: r.categorySlug, d: r.district,
      r: r.rating, v: r.reviews, t: effectiveTier(r.tier, r.brandTier), tr: isTopRated(r.rating, r.reviews),
      p: r.photoUrl, w: [...new Set(w.split(" "))].join(" "),
    };
  });
  const cities = await Promise.all(Object.keys(CITY_NAMES).map(async slug => ({ slug, name: CITY_NAMES[slug], count: await getCityClinicCount(slug) })));
  const body: SearchIndex = { v: 1, cities, clinics };
  return Response.json(body);
}
```

- [ ] **Step 9: Build check.** Run `npm run build`, then `ls -la out/search-index.json`. Expected: the file exists, is under 250 KB raw, and has 804 clinics (check with `node -e "console.log(require('./out/search-index.json').clinics.length)"`). If the build rejects a route at a `.json` path, rename the folder to `src/app/search-index/route.ts` with the URL `/search-index/`, and record that in the commit message.

- [ ] **Step 10: Commit**
```bash
git add src/lib/search src/app/search-index.json src/lib/db/queries.ts
git commit -m "feat(search): tested search engine and static search index"
```

---

### Task 4: Homepage: search bar, city photos, featured cards

**Files:**
- Rewrite: `src/components/hero/SearchBar.tsx`
- Create: `public/cities/bangkok.webp`, `phuket.webp`, `chiang-mai.webp`, `pattaya.webp` (600×800), `src/lib/cityPhotos.ts`
- Modify: `src/app/page.tsx` (CITY_TILES :42–47, city grid :480–529, featured section :317–458, data fetch ~:131)
- Modify: `src/lib/db/queries.ts` (add `getHomepageFeatured(citySlug, limit)`)

**Interfaces:**
- Consumes: `search`, `SearchIndex`, `SearchResults` (Task 3); `PlanBadges`, `isTopRated`, `tierRank`, `effectiveTier` (Task 1)
- Produces: `getHomepageFeatured(citySlug: string, limit: number): Promise<{ key: string; name: string; url: string; categorySlug: string; district: string|null; rating: number|null; reviews: number|null; photoUrl: string|null; tier: Tier; topRated: boolean }[]>`

- [ ] **Step 1: City photos.** The source images are in `/private/tmp/claude-501/-Users-sunny-Projects-thailandclinics/b01efd68-d116-45d2-8b1d-e7f000804f39/scratchpad/mock/city-*.jpg` (already 600×800). Convert each to webp at quality 78 into `public/cities/` with `cwebp -q 78 in.jpg -o out.webp`, or Python PIL `save(..., "WEBP", quality=78)` if cwebp is missing.

`src/lib/cityPhotos.ts`:
```ts
export const CITY_PHOTOS: Record<string, { src: string; alt: string; author: string; licence: string; source: string }> = {
  bangkok:      { src: "/cities/bangkok.webp",    alt: "Bangkok BTS skytrain at sunset",                  author: "Diliff",       licence: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Bangkok_skytrain_sunset.jpg" },
  phuket:       { src: "/cities/phuket.webp",     alt: "Sino-Portuguese shophouses on Thalang Road, Phuket Old Town", author: "Christophe95", licence: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Thalang_Road,_Old_Phuket_Town.jpg" },
  "chiang-mai": { src: "/cities/chiang-mai.webp", alt: "Golden Buddha statues at Wat Phra That Doi Suthep, Chiang Mai", author: "Jakub Hałun", licence: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:20171106_Wat_Phra_That_Doi_Suthep_0103_DxO.jpg" },
  pattaya:      { src: "/cities/pattaya.webp",    alt: "Pattaya skyline from the pier in the morning",    author: "iMahesh",      licence: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Skyline_of_Pattaya_from_the_Pier_on_a_morning.jpg" },
};
```

- [ ] **Step 2: City tiles.**
  - In `page.tsx`, keep each tile's gradient `bg` as a fallback, and add an `<img src alt loading="lazy" decoding="async">` absolutely positioned with `objectFit: "cover"` inside `.city-tile-bg`, so the existing scale(1.04) hover still works.
  - Replace the hardcoded counts with DB counts: fetch `getCityClinicCount` for each city.
  - Count > 0 shows "N clinics". Count 0 shows "Coming soon" text plus a small white chip (top-left, 4px radius, 11px uppercase DM Sans 500).
  - Fix the tile `href` to `/${slug}/`, with a trailing slash.
  - Under the grid, add a credit line: 11px DM Sans, `var(--muted)`, "City photos via Wikimedia Commons: Bangkok — <a>Diliff</a>, CC BY-SA 3.0 · …", with links `target="_blank" rel="noopener"`.

- [ ] **Step 3: `getHomepageFeatured(citySlug, limit)`.**
  - Premium standalone clinics in the city (`clinics.tier='premium' AND brand_id IS NULL`) plus premium brands in the city, as brand cards with brand aggregates, a photo taken from the brand's first branch, and the URL `/${city}/${category}/${brandSlug}/`.
  - Sorted by `featured_position`, then filled with the best organic standalone clinics in the city (any category, ordered by `weightedRatingOrder`, excluding those already listed) up to `limit`.
  - Card `url` uses the clinic's own city/category.

- [ ] **Step 4: Featured section.**
  - Fetch `getHomepageFeatured("bangkok", 4)`.
  - Heading: "Featured clinics in *Bangkok*" (italic green emphasis, as today).
  - Grid: 4 columns ≥1100px, 2 columns ≥640px, 1 below. Update the `.featured-grid` CSS in globals.css.
  - Each card: links to `card.url`; the eyebrow is that card's category label (not a hardcoded "Physiotherapy"); `<PlanBadges tier topRated />` goes in the photo's top-left (replacing the `i === 0` "Top Rated" div); a premium card gets `border: 2px solid var(--gold)`.
  - The "View all Bangkok clinics →" link goes to `/bangkok/`.

- [ ] **Step 5: SearchBar rewrite** (`'use client'`). Behaviour, which must match the approved mockup at `scratchpad/mock/index.html`:
  - State: `query`, `city` (`""` = all cities), `open`, `active` (index), `index: SearchIndex | null`.
  - On first focus, `fetch("/search-index.json")` once and store it. While it loads, show "Loading…" in the dropdown.
  - City `<select>`: "All cities", then only the cities with `count > 0` from the index. Before the index loads, render only "All cities".
  - Empty query, focused: a "Popular" group with 4 treatment links (Ulthera, Dental implants, IVF, Back and neck pain) for the chosen city (or Bangkok).
  - Non-empty query: `search(index, query, city)` rendered as the groups Treatments, Clinics and Categories, in that order:
    - Clinic option: 40×30 photo thumb (`p`), name (the matched prefix shown in `<strong>` green), `<PlanBadges size="sm" tier={c.t} topRated={c.tr} />`, sub-line `"{Category} · {district}, {City} · ★ {r} ({v})"`.
    - Empty result: "No matches for “{q}”. Try a treatment (e.g. “implants”) or an area (e.g. “Thonglor”)."
  - Keyboard: ArrowDown/ArrowUp move `active` with wrap-around and `scrollIntoView({block:"nearest"})`; Enter or Search goes to the active option, or the first option if none is active; Escape closes.
  - Mouse: `onMouseDown` + `preventDefault` on options so blur doesn't eat the click.
  - Navigation: `router.push(url)`.
  - ARIA: the input has `role="combobox"`, `aria-expanded`, `aria-controls="search-listbox"` and `aria-activedescendant`; the list has `role="listbox"`; options have `role="option"`, `id` and `aria-selected`.
  - Visual: keep the current outer styling (white, 6px radius, hero shadow, green Search button, `animate-fade-up delay-300` wrapper); dropdown max-height 460px with scrolling; group headings 10.5px uppercase muted; hover/active background `var(--green-pale)`.
  - Placeholder: "Clinic name, treatment or area — e.g. Ulthera, Asok". Hide the city select under 640px.

- [ ] **Step 6: Build and browser check.**
  - Run `npm run build` and serve `out/`.
  - On `/`, verify:
    - "form" → Form Asoke first (◆ Premium ★ Top rated), no "Maximum Performance"
    - "asoke" → Asok clinics
    - "ultera" → Ulthera treatment
    - "dental asok" → only dental clinics near Asok
    - "thong lo" → Thonglor clinics
    - "xyz" → the empty state
    - the arrow keys + Enter navigate
    - the city select shows only Bangkok and Phuket
    - the city tiles show photos and real counts, Chiang Mai and Pattaya show "Coming soon", and the credits line is present
    - featured cards: 4 Premium cards with gold frames, correct links
  - Check the mobile width (390px).
  - Check the browser console: no errors.

- [ ] **Step 7: Commit**
```bash
git add src/components/hero/SearchBar.tsx public/cities src/lib/cityPhotos.ts src/app/page.tsx src/app/globals.css src/lib/db/queries.ts
git commit -m "feat(home): type-ahead search, city photos and Premium featured cards"
```

---

### Task 5: City page pins Premium

**Files:** Modify `src/app/[city]/page.tsx` (~:78 data, ~:192 rows), `src/lib/db/queries.ts` (`getTopClinicsByCity`), `src/components/clinic/CompactClinicRow.tsx`

- [ ] **Step 1:** In `getTopClinicsByCity`, order by `CASE tier WHEN 'premium' THEN 0 ELSE 1 END`, then `featured_position` (nulls last), then the existing weighted rating. Include premium brands' branches by resolving the brand tier: join `brands`, and use `effectiveTier` in the JS mapping and in the sort. Return `tier` and `topRated`.
- [ ] **Step 2:** `CompactClinicRow` accepts optional `tier` and `topRated` props and renders `<PlanBadges size="sm" tier topRated />` before the name. A premium row gets `border: 1px solid var(--gold)` and a 6px radius.
- [ ] **Step 3:** Build and check `/bangkok/`. Expected: the Premium rows are at the top with badges, followed by organic rows. `/phuket/` is unchanged (no Premium there).
- [ ] **Step 4: Commit**
```bash
git add "src/app/[city]/page.tsx" src/lib/db/queries.ts src/components/clinic/CompactClinicRow.tsx
git commit -m "feat(city): pin Premium clinics on city pages"
```

---

### Task 6: Premium box in guides, and pricing copy

**Files:**
- Create: `src/components/blog/PremiumBox.tsx`
- Modify: `src/components/blog/MdxComponents.tsx` (register `PremiumBox` next to `CtaBlock` ~:140)
- Modify: the MDX guides that feature Form, Cosmo or Genesis. Find them with `grep -l -i "form recovery\|cosmo clinic\|genesis fertility" content/blog/*.mdx`.
- Modify: `src/app/list-your-clinic/page.tsx` (`INCLUDES` :9–30, `FAQ` :58–65), `src/app/how-we-rank/page.tsx` (:248–258)

- [ ] **Step 1: `PremiumBox.tsx`** (server component). It reads its badge state from props, so the MDX stays declarative:

```tsx
import Link from "next/link";
import PlanBadges from "@/components/ui/PlanBadges";

export default function PremiumBox({ topRated = false, children }: { topRated?: boolean; children: React.ReactNode }) {
  return (
    <aside style={{ border: "1px solid var(--gold)", background: "#fffdf7", borderRadius: "6px", padding: "18px 22px 14px", margin: "24px 0" }}>
      <PlanBadges tier="premium" topRated={topRated} size="sm" />
      <div style={{ marginTop: "8px" }}>{children}</div>
      <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "12px", color: "var(--muted)", margin: "10px 0 0" }}>
        Premium: this clinic pays for a labelled placement. Our rankings are editorial and not for sale.{" "}
        <Link href="/how-we-rank/" style={{ color: "var(--green)" }}>How we rank</Link>
      </p>
    </aside>
  );
}
```

- [ ] **Step 2:** Register it in `mdxComponents`. In each matched guide, wrap the Form / Cosmo / Genesis entry (its `###` heading plus that entry's paragraphs, up to the next `###`) in `<PremiumBox topRated>…</PremiumBox>`. Use `topRated` only when that clinic's DB rating is ≥ 4.8 with ≥ 50 reviews; check with a quick query. Leave a blank line after the opening tag and before the closing tag so the MDX inside still parses as markdown. Don't change any ranking order or wording.

- [ ] **Step 3: /list-your-clinic/.**
  - Rewrite `INCLUDES` as the three plans:
    - Basic, free: full profile, verified badge, AI review summary, listed on city + category pages, patients contact you directly, no commission
    - Pro, ฿4,900/month: Featured placement on your category page, published prices and photos, sponsored mention in related guides, dedicated account manager, monthly profile updates
    - Premium, ฿9,900/month: top Featured slot in your category, ◆ Premium badge everywhere you appear, ★ Top rated tag for clinics rated 4.8★+ with 50+ reviews, featured on our homepage and city page, up to 3 doctors with credentials, 3 sponsored articles per year, 3 backlinks with your preferred anchor
  - Render the plans as three cards (Premium card in a gold frame, labelled "Most popular"), following the page's existing card styles.
  - FAQ "How much does it cost?" → "Basic is free. Pro is ฿4,900 a month and Premium is ฿9,900 a month. There's no commission on any plan, and patients contact you directly."
  - FAQ "Can I pay to rank higher?" → "Paid plans add a clearly labelled placement — 'Featured' for Pro, '◆ Premium' for Premium — above the organic list. The organic order and our editorial guide rankings are based on ratings, reviews and our own research, and can't be bought. 'Top rated' is earned: it only appears for clinics rated 4.8★ or higher with 50+ reviews."
  - Tone follows `content/TONE.md`: British English, warm and direct.

- [ ] **Step 4: /how-we-rank/.** Update the paid-placement paragraph (:248–258) to say the same as the "Can I pay to rank higher?" answer.

- [ ] **Step 5:** Build. Check a matched guide (gold box with disclosure, ranking unchanged), `/list-your-clinic/` (three plans, FAQ updated) and the FAQPage JSON-LD in the built HTML (`grep -o '"FAQPage"' out/list-your-clinic/index.html`).

- [ ] **Step 6: Commit**
```bash
git add src/components/blog/PremiumBox.tsx src/components/blog/MdxComponents.tsx content/blog/<changed files> src/app/list-your-clinic/page.tsx src/app/how-we-rank/page.tsx
git commit -m "feat(tiers): Premium box in guides and plan pricing on list-your-clinic"
```

---

### Task 7: Doctors section (Premium only)

**Files:** Modify `src/lib/db/queries.ts` (`getClinicDoctors`), `src/components/clinic/ClinicProfileView.tsx`, and the profile/branch page files that call `ClinicProfileView` (pass `doctors`). Create `src/components/clinic/DoctorsSection.tsx`.

- [ ] **Step 1:** `getClinicDoctors(clinicId: number): Promise<ClinicDoctor[]>`: `SELECT * FROM clinic_doctors WHERE clinic_id=? ORDER BY sort_order, id LIMIT 3`.
- [ ] **Step 2:** `DoctorsSection.tsx`. It returns `null` when `doctors.length === 0`. Otherwise:
  - Heading "Our doctors" (Cormorant 28px, weight 400).
  - A 3-column grid (1 column under 640px) of cards: white, 6px radius, `var(--border-soft)` border, 16px padding.
  - Each card: a 56px round photo if `photoUrl`, otherwise initials on `var(--linen-dark)`; name (Cormorant 19px 500); role (12.5px green); credentials and licence (12px charcoal-soft, each on its own line).
- [ ] **Step 3:** In the profile and branch pages, fetch doctors only when `tier === "premium"` (effective), and pass them to `ClinicProfileView`, which renders `<DoctorsSection doctors={doctors} />` after the editorial block. Basic and Pro pages never query it.
- [ ] **Step 4:** Insert a temporary test doctor for Form Asoke, build, check that the section renders, then delete the row:
  `INSERT INTO clinic_doctors (clinic_id,name,role,credentials,sort_order) VALUES (69,'Test Doctor','Physiotherapist','BSc PT',0)`, and afterwards `DELETE FROM clinic_doctors WHERE name='Test Doctor'`. Rebuild and confirm the section is gone.
- [ ] **Step 5: Commit**
```bash
git add src/lib/db/queries.ts src/components/clinic/DoctorsSection.tsx src/components/clinic/ClinicProfileView.tsx <page files>
git commit -m "feat(tiers): doctors section on Premium profiles"
```

---

### Task 8: Final verification

- [ ] `npm test`: all pass.
- [ ] `npx tsc --noEmit` and `npm run lint`: no new errors.
- [ ] `npm run build`: success, same HTML page count as before ±0 (`find out -name index.html | wc -l`, compared with the count before Task 1). `out/search-index.json` exists.
- [ ] `git diff c153a77 -- scripts/build-sitemap.mjs next.config.ts` is empty.
- [ ] Browser pass on the served `out/`, desktop and 390px: home (search cases from Task 4), `/bangkok/`, `/bangkok/physiotherapy-clinics/`, `/bangkok/cosmetic-clinics/`, the Form Asoke profile, a Cosmo branch, a guide with a PremiumBox, `/list-your-clinic/`, `/how-we-rank/`. No console errors.
- [ ] Whole-change review by a fresh reviewer against the spec and the Review focus list.
