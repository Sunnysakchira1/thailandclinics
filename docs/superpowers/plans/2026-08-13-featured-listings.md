# Paid Featured Listings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two paid listing tiers (Founding Featured, Spotlight) on ThailandClinics, sold via an enquiry form and fulfilled by a CLI script, with paid placement always labelled and never reordering the organic list.

**Architecture:** A new `tier` column on `clinics` becomes the source of truth, replacing reads of the existing `featured` boolean. Pure tier logic lives in `src/lib/tiers.ts` and is unit-tested. The listing page splits into a labelled paid block above an untouched organic list. Fulfilment is a guarded CLI script, not a payment integration.

**Tech Stack:** Next.js 15 App Router (`output: "export"`), Drizzle ORM over Turso/libSQL, TypeScript, plain CSS in `globals.css` + inline styles, Vitest (added in Task 1), Formspree for form delivery.

## Global Constraints

- Prices, verbatim: Founding Featured **฿1,490/month, ฿14,900/year**; Spotlight **฿3,900/month, ฿39,000/year**. Both locked 12 months from purchase.
- Slot limits: **5 Featured per city+category**, **1 Spotlight per city+category**, additive (6 paid max per city+category).
- Paid placement sits in a labelled block **above** the organic list and **never reorders it**. Any clinic with `tier = 'free'` must keep byte-identical ordering to today.
- Every paid placement carries a visible label: `Featured` or `Spotlight`. Never "Top Rated" — that claims merit for a paid slot.
- Editorial guides in `content/blog/` must never read `tier`.
- Site is `output: "export"`. No API routes, no per-request logic. Tier expiry and homepage rotation are evaluated at **build time**.
- British English. Sentence case headings. Design tokens only: `--green #1a4731`, `--linen #faf8f5`, `--terracotta` for eyebrow/tag labels only, never CTAs. Never Inter, never `#30669D`.
- Fonts: Cormorant Garamond for display, DM Sans for UI. No exceptions.
- Currency always written `฿1,490` with a thousands separator.

---

### Task 1: Tier logic module + test harness

**Files:**
- Create: `src/lib/tiers.ts`
- Create: `src/lib/tiers.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (add `test` script + devDependencies)

**Interfaces:**
- Consumes: nothing
- Produces: `TIERS`, `type Tier = 'free' | 'featured' | 'spotlight'`, `isPaidTier(tier, expiresAt, today): boolean`, `tierLabel(tier): string`, `slotLimit(tier): number`, `countWords(text): number`, `rotationOffset(dayOfYear, total): number`

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest@^3
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 3: Add the test script to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
```

- [ ] **Step 4: Write the failing tests**

Create `src/lib/tiers.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  isPaidTier, tierLabel, slotLimit, countWords, rotationOffset,
} from "./tiers";

describe("isPaidTier", () => {
  it("free is never paid", () => {
    expect(isPaidTier("free", null, "2026-08-13")).toBe(false);
    expect(isPaidTier("free", "2027-01-01", "2026-08-13")).toBe(false);
  });
  it("paid tier with no expiry is paid", () => {
    expect(isPaidTier("featured", null, "2026-08-13")).toBe(true);
  });
  it("paid tier expiring in the future is paid", () => {
    expect(isPaidTier("featured", "2026-12-31", "2026-08-13")).toBe(true);
  });
  it("expiry on the build date is still paid", () => {
    expect(isPaidTier("spotlight", "2026-08-13", "2026-08-13")).toBe(true);
  });
  it("expired tier is not paid", () => {
    expect(isPaidTier("featured", "2026-08-12", "2026-08-13")).toBe(false);
  });
});

describe("tierLabel", () => {
  it("labels paid tiers, never 'Top Rated'", () => {
    expect(tierLabel("featured")).toBe("Featured");
    expect(tierLabel("spotlight")).toBe("Spotlight");
  });
  it("free has no label", () => {
    expect(tierLabel("free")).toBe("");
  });
});

describe("slotLimit", () => {
  it("5 featured, 1 spotlight per city+category", () => {
    expect(slotLimit("featured")).toBe(5);
    expect(slotLimit("spotlight")).toBe(1);
  });
  it("free is unlimited", () => {
    expect(slotLimit("free")).toBe(Infinity);
  });
});

describe("countWords", () => {
  it("counts words separated by any whitespace", () => {
    expect(countWords("one two three")).toBe(3);
    expect(countWords("  padded   words \n here ")).toBe(3);
  });
  it("empty string is zero", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
  });
});

describe("rotationOffset", () => {
  it("returns zero when there is nothing to rotate", () => {
    expect(rotationOffset(200, 0)).toBe(0);
  });
  it("wraps within the total", () => {
    expect(rotationOffset(0, 3)).toBe(0);
    expect(rotationOffset(4, 3)).toBe(1);
    expect(rotationOffset(200, 3)).toBe(200 % 3);
  });
});
```

- [ ] **Step 5: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module './tiers'`

- [ ] **Step 6: Write the implementation**

Create `src/lib/tiers.ts`:

```ts
/**
 * Paid listing tiers.
 *
 * `tier` is the source of truth. The legacy `clinics.featured` boolean is
 * deprecated and must not be read anywhere.
 *
 * The site is a static export, so expiry is evaluated at BUILD time. A lapsed
 * clinic drops to organic on the next deploy, not the instant it expires.
 */
export type Tier = "free" | "featured" | "spotlight";

export const TIERS = {
  featured: {
    id: "featured" as const,
    name: "Founding Featured",
    monthly: 1490,
    annual: 14900,
    slots: 5,
  },
  spotlight: {
    id: "spotlight" as const,
    name: "Spotlight",
    monthly: 3900,
    annual: 39000,
    slots: 1,
  },
};

export const MAX_EXTENDED_ABOUT_WORDS = 300;

export function isPaidTier(
  tier: Tier | string | null,
  expiresAt: string | null,
  today: string,
): boolean {
  if (tier !== "featured" && tier !== "spotlight") return false;
  if (expiresAt === null) return true;
  return expiresAt >= today; // ISO YYYY-MM-DD compares lexicographically
}

export function tierLabel(tier: Tier | string | null): string {
  if (tier === "featured") return "Featured";
  if (tier === "spotlight") return "Spotlight";
  return "";
}

export function slotLimit(tier: Tier | string | null): number {
  if (tier === "featured") return TIERS.featured.slots;
  if (tier === "spotlight") return TIERS.spotlight.slots;
  return Infinity;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

export function rotationOffset(dayOfYear: number, total: number): number {
  if (total <= 0) return 0;
  return dayOfYear % total;
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 13 tests

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/tiers.ts src/lib/tiers.test.ts
git commit -m "feat(tiers): add tier logic module with unit tests"
```

---

### Task 2: Schema migration and query layer

**Files:**
- Modify: `src/lib/db/schema.ts:72-73` (clinics table)
- Modify: `src/lib/db/queries.ts:30-31, 85-108` (ListingEntry type and select)
- Create: `scripts/migrate-tiers.ts`

**Interfaces:**
- Consumes: `Tier`, `isPaidTier` from `src/lib/tiers.ts`
- Produces: `ListingEntry` gains `tier: string | null`, `tierExpiresAt: string | null`, `customPhotoUrl`, `extendedAbout`, `logoUrl`, `coverImageUrl`, `instagramUrl`, `facebookUrl` — all `string | null`

- [ ] **Step 1: Add columns to the Drizzle schema**

In `src/lib/db/schema.ts`, immediately after the `featuredPosition` line in the `clinics` table:

```ts
  // Paid tiers. `featured` above is DEPRECATED — `tier` is the source of truth.
  tier:            text("tier").default("free"),
  tierExpiresAt:   text("tier_expires_at"),     // ISO date YYYY-MM-DD
  customPhotoUrl:  text("custom_photo_url"),
  extendedAbout:   text("extended_about"),      // max 300 words
  logoUrl:         text("logo_url"),            // spotlight only
  coverImageUrl:   text("cover_image_url"),     // spotlight only, 1200x400
  instagramUrl:    text("instagram_url"),
  facebookUrl:     text("facebook_url"),
```

- [ ] **Step 2: Write the migration script**

Create `scripts/migrate-tiers.ts`. Idempotent `ALTER TABLE` rather than `drizzle-kit push`, because push can propose destructive changes against live data.

```ts
/**
 * Adds the paid-tier columns to `clinics`. Safe to run repeatedly.
 * Usage: npx tsx --env-file=.env.local scripts/migrate-tiers.ts
 */
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const COLUMNS: [string, string][] = [
  ["tier", "TEXT DEFAULT 'free'"],
  ["tier_expires_at", "TEXT"],
  ["custom_photo_url", "TEXT"],
  ["extended_about", "TEXT"],
  ["logo_url", "TEXT"],
  ["cover_image_url", "TEXT"],
  ["instagram_url", "TEXT"],
  ["facebook_url", "TEXT"],
];

const info = await db.execute("PRAGMA table_info(clinics)");
const existing = new Set(info.rows.map((r) => String(r.name)));

for (const [name, type] of COLUMNS) {
  if (existing.has(name)) {
    console.log(`skip  ${name} (already present)`);
    continue;
  }
  await db.execute(`ALTER TABLE clinics ADD COLUMN ${name} ${type}`);
  console.log(`added ${name}`);
}

// Backfill: any clinic already flagged with the legacy boolean becomes featured.
const res = await db.execute(
  "UPDATE clinics SET tier = 'featured' WHERE featured = 1 AND (tier IS NULL OR tier = 'free')",
);
console.log(`backfilled ${res.rowsAffected} legacy featured clinics to tier='featured'`);
```

- [ ] **Step 3: Run the migration**

Run: `npx tsx --env-file=.env.local scripts/migrate-tiers.ts`
Expected: 8 `added` lines, then `backfilled 2 legacy featured clinics`

- [ ] **Step 4: Verify the columns exist**

Run:

```bash
npx tsx --env-file=.env.local -e "
import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const r = await db.execute(\"SELECT tier, COUNT(*) n FROM clinics GROUP BY tier\");
console.log(r.rows);
"
```

Expected: `[{ tier: 'featured', n: 2 }, { tier: 'free', n: 802 }]`

- [ ] **Step 5: Extend the `ListingEntry` type**

In `src/lib/db/queries.ts`, in the `ListingEntry` type (around line 30), after `featuredPosition`:

```ts
  tier:             string | null;
  tierExpiresAt:    string | null;
  customPhotoUrl:   string | null;
  extendedAbout:    string | null;
  logoUrl:          string | null;
  coverImageUrl:    string | null;
  instagramUrl:     string | null;
  facebookUrl:      string | null;
```

- [ ] **Step 6: Add the columns to the select**

In `getListingEntries` (around line 98), after `featuredPosition: clinics.featuredPosition,`:

```ts
      tier:             clinics.tier,
      tierExpiresAt:    clinics.tierExpiresAt,
      customPhotoUrl:   clinics.customPhotoUrl,
      extendedAbout:    clinics.extendedAbout,
      logoUrl:          clinics.logoUrl,
      coverImageUrl:    clinics.coverImageUrl,
      instagramUrl:     clinics.instagramUrl,
      facebookUrl:      clinics.facebookUrl,
```

- [ ] **Step 7: Verify the build compiles and data flows**

Run: `npx next build 2>&1 | grep -iE "error|✓ Generating"`
Expected: no errors, `✓ Generating static pages`

- [ ] **Step 8: Commit**

```bash
git add src/lib/db/schema.ts src/lib/db/queries.ts scripts/migrate-tiers.ts
git commit -m "feat(db): add paid tier columns and expose them in listing queries"
```

---

### Task 3: `set-tier` fulfilment script with slot enforcement

**Files:**
- Create: `scripts/set-tier.ts`
- Create: `src/lib/slots.ts`
- Create: `src/lib/slots.test.ts`

**Interfaces:**
- Consumes: `Tier`, `slotLimit`, `countWords`, `MAX_EXTENDED_ABOUT_WORDS` from `src/lib/tiers.ts`
- Produces: `canAssignSlot(tier, currentCount, isReassignment): { ok: boolean; reason?: string }`

- [ ] **Step 1: Write the failing slot tests**

Create `src/lib/slots.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { canAssignSlot } from "./slots";

describe("canAssignSlot", () => {
  it("allows a featured slot below the limit", () => {
    expect(canAssignSlot("featured", 4, false).ok).toBe(true);
  });
  it("rejects a 6th featured slot", () => {
    const r = canAssignSlot("featured", 5, false);
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("5");
  });
  it("rejects a 2nd spotlight slot", () => {
    const r = canAssignSlot("spotlight", 1, false);
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("1");
  });
  it("allows reassignment at the limit (clinic already holds a slot)", () => {
    expect(canAssignSlot("featured", 5, true).ok).toBe(true);
    expect(canAssignSlot("spotlight", 1, true).ok).toBe(true);
  });
  it("always allows downgrading to free", () => {
    expect(canAssignSlot("free", 999, false).ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './slots'`

- [ ] **Step 3: Implement `canAssignSlot`**

Create `src/lib/slots.ts`:

```ts
import { slotLimit, type Tier } from "./tiers";

/**
 * `currentCount` is how many clinics in the target city+category already hold
 * this tier, EXCLUDING the clinic being changed when `isReassignment` is true.
 */
export function canAssignSlot(
  tier: Tier,
  currentCount: number,
  isReassignment: boolean,
): { ok: boolean; reason?: string } {
  if (tier === "free") return { ok: true };
  if (isReassignment) return { ok: true };

  const limit = slotLimit(tier);
  if (currentCount >= limit) {
    return {
      ok: false,
      reason: `Sold out: ${limit} ${tier} slot(s) per city+category, ${currentCount} already taken.`,
    };
  }
  return { ok: true };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS, 18 tests total

- [ ] **Step 5: Write the fulfilment script**

Create `scripts/set-tier.ts`:

```ts
/**
 * Assign a paid tier to a clinic. Enforces slot limits and the 300-word cap.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/set-tier.ts \
 *     --slug thonglor-physio --tier featured --expires 2027-08-13
 *
 * Optional: --photo <path> --logo <path> --cover <path>
 *           --instagram <url> --facebook <url> --about "<text>"
 *   Downgrade: --tier free
 */
import { createClient } from "@libsql/client";
import { canAssignSlot } from "../src/lib/slots";
import { countWords, MAX_EXTENDED_ABOUT_WORDS, type Tier } from "../src/lib/tiers";

const arg = (n: string): string | undefined => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const slug = arg("slug");
const tier = arg("tier") as Tier | undefined;
if (!slug || !tier) throw new Error("--slug and --tier are required");
if (!["free", "featured", "spotlight"].includes(tier)) {
  throw new Error(`--tier must be free|featured|spotlight, got ${tier}`);
}

const expires = arg("expires") ?? null;
if (tier !== "free" && !expires) throw new Error("--expires YYYY-MM-DD required for a paid tier");
if (expires && !/^\d{4}-\d{2}-\d{2}$/.test(expires)) throw new Error("--expires must be YYYY-MM-DD");

const about = arg("about");
if (about && countWords(about) > MAX_EXTENDED_ABOUT_WORDS) {
  throw new Error(`--about is ${countWords(about)} words, max ${MAX_EXTENDED_ABOUT_WORDS}`);
}

const db = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });

const target = await db.execute({
  sql: `SELECT c.id, c.tier, c.city_id, c.category_id FROM clinics c WHERE c.slug = ?`,
  args: [slug],
});
if (target.rows.length === 0) throw new Error(`No clinic with slug "${slug}"`);
const { id, tier: currentTier, city_id, category_id } = target.rows[0] as Record<string, unknown>;

if (tier !== "free") {
  const held = await db.execute({
    sql: `SELECT COUNT(*) n FROM clinics
          WHERE city_id = ? AND category_id = ? AND tier = ? AND id != ?`,
    args: [city_id, category_id, tier, id],
  });
  const count = Number((held.rows[0] as Record<string, unknown>).n);
  const verdict = canAssignSlot(tier, count, currentTier === tier);
  if (!verdict.ok) throw new Error(verdict.reason);
}

await db.execute({
  sql: `UPDATE clinics SET
          tier = ?, tier_expires_at = ?,
          custom_photo_url = COALESCE(?, custom_photo_url),
          logo_url         = COALESCE(?, logo_url),
          cover_image_url  = COALESCE(?, cover_image_url),
          instagram_url    = COALESCE(?, instagram_url),
          facebook_url     = COALESCE(?, facebook_url),
          extended_about   = COALESCE(?, extended_about),
          updated_at = datetime('now')
        WHERE id = ?`,
  args: [
    tier, tier === "free" ? null : expires,
    arg("photo") ?? null, arg("logo") ?? null, arg("cover") ?? null,
    arg("instagram") ?? null, arg("facebook") ?? null, about ?? null,
    id,
  ],
});

console.log(`${slug}: tier=${tier}${expires ? ` expires=${expires}` : ""}`);
console.log("Deploy for this to appear on the live site.");
```

- [ ] **Step 6: Verify slot enforcement against the real database**

Run (a dry check that must FAIL once 5 slots are taken; with 0 taken it should succeed):

```bash
npx tsx --env-file=.env.local scripts/set-tier.ts --slug bibi-clinic --tier featured --expires 2027-08-13
npx tsx --env-file=.env.local scripts/set-tier.ts --slug bibi-clinic --tier free
```

Expected: first prints `bibi-clinic: tier=featured expires=2027-08-13`; second prints `bibi-clinic: tier=free`

- [ ] **Step 7: Commit**

```bash
git add src/lib/slots.ts src/lib/slots.test.ts scripts/set-tier.ts
git commit -m "feat(tiers): add set-tier fulfilment script with slot-limit enforcement"
```

---

### Task 4: Labelled paid block on listing pages

**Files:**
- Modify: `src/components/clinic/ListingsClient.tsx:487-488` (sort), `:722` (isFeatured), `:743` (border), `:779-795` (badge)
- Modify: `src/app/[city]/[category]/page.tsx` (pass `buildDate`)

**Interfaces:**
- Consumes: `isPaidTier`, `tierLabel` from `src/lib/tiers.ts`; `ListingEntry.tier`, `.tierExpiresAt`, `.customPhotoUrl`, `.extendedAbout`, `.instagramUrl`, `.facebookUrl`, `.logoUrl`
- Produces: nothing consumed by later tasks

**Behaviour required:** paid clinics render in a labelled block above the organic list, in **all three sort modes**. The organic list keeps today's ordering exactly. The `featured`/`featuredPosition` interleave at line 487 is removed.

- [ ] **Step 1: Pass the build date into the client component**

In `src/app/[city]/[category]/page.tsx`, where `<ListingsClient ... />` is rendered, add the prop:

```tsx
buildDate={new Date().toISOString().slice(0, 10)}
```

- [ ] **Step 2: Accept the prop and split the list**

In `ListingsClient.tsx`, add `buildDate: string;` to the props type, then replace the featured interleave at lines 487-488. Delete these two lines from the `sort === 'rating'` branch:

```ts
        const aPos = a.featured && a.featuredPosition != null ? a.featuredPosition : Infinity;
        const bPos = b.featured && b.featuredPosition != null ? b.featuredPosition : Infinity;
        if (aPos !== bPos) return aPos - bPos;
```

Then, immediately before `return list;` in the same memo, split:

```ts
    const paid = list.filter(c => isPaidTier(c.tier, c.tierExpiresAt, buildDate));
    const organic = list.filter(c => !isPaidTier(c.tier, c.tierExpiresAt, buildDate));
    paid.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier === 'spotlight' ? -1 : 1;
      return (a.featuredPosition ?? 99) - (b.featuredPosition ?? 99);
    });
    return { paid, organic };
```

Update the memo's type and every consumer to read `.paid` and `.organic`.

- [ ] **Step 3: Render the labelled paid block**

Above the existing organic `.map(...)`, insert:

```tsx
{paid.length > 0 && (
  <>
    <p style={{
      fontFamily: 'var(--font-dm-sans,"DM Sans",sans-serif)',
      fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px',
    }}>
      Featured clinics · paid placement
    </p>
    {paid.map((clinic) => renderCard(clinic, true))}
    <p style={{
      fontFamily: 'var(--font-dm-sans,"DM Sans",sans-serif)',
      fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: 'var(--muted)',
      margin: '32px 0 12px',
    }}>
      All clinics · ranked by rating
    </p>
  </>
)}
```

Extract the existing card JSX into `renderCard(clinic, isPaid)` so both blocks share it. Rank numbers restart at 1 in the organic block.

- [ ] **Step 4: Replace the misleading badge**

At line 779, replace the whole `{isFeatured && (...)}` block. The label must be the tier name, never "Top Rated":

```tsx
{isPaid && (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--green)',
    background: 'var(--green-pale)', padding: '3px 8px',
    borderRadius: '3px', marginBottom: '6px', width: 'fit-content',
  }}>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d={STAR_PATH} />
    </svg>
    {tierLabel(clinic.tier)}
  </div>
)}
```

Also change line 722 from `const isFeatured = !!clinic.featured;` to `const isPaid = isPaidTier(clinic.tier, clinic.tierExpiresAt, buildDate);` and update the `borderLeft` at line 743 to use `isPaid`.

- [ ] **Step 5: Render the paid extras**

Inside `renderCard`, when `isPaid`: use `clinic.customPhotoUrl ?? clinic.photoUrl` for the photo; render `clinic.extendedAbout` as a paragraph below the tags; render Instagram and Facebook links when present; render `clinic.logoUrl` as a 32px image beside the name when `tier === 'spotlight'`.

- [ ] **Step 6: Verify organic order is unchanged**

```bash
npx next build >/dev/null 2>&1
grep -o 'href="/bangkok/physiotherapy-clinics/[a-z0-9-]*/"' \
  .next/server/app/bangkok/physiotherapy-clinics.html | head -20 > /tmp/after.txt
git stash && npx next build >/dev/null 2>&1
grep -o 'href="/bangkok/physiotherapy-clinics/[a-z0-9-]*/"' \
  .next/server/app/bangkok/physiotherapy-clinics.html | head -20 > /tmp/before.txt
git stash pop && diff /tmp/before.txt /tmp/after.txt
```

Expected: no diff for a city+category with zero paid clinics.

- [ ] **Step 7: Verify the label**

```bash
grep -c "Top Rated" .next/server/app/bangkok/cosmetic-clinics.html
```

Expected: `0`

- [ ] **Step 8: Commit**

```bash
git add src/components/clinic/ListingsClient.tsx "src/app/[city]/[category]/page.tsx"
git commit -m "feat(listings): labelled paid block above organic list, replace 'Top Rated' badge"
```

---

### Task 5: Spotlight hero box

**Files:**
- Create: `src/components/clinic/SpotlightHero.tsx`
- Modify: `src/app/[city]/[category]/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ListingEntry`, `isPaidTier` from `src/lib/tiers.ts`
- Produces: `<SpotlightHero clinic={entry} citySlug={string} catSlug={string} />`

- [ ] **Step 1: Create the component**

Create `src/components/clinic/SpotlightHero.tsx`. A server component rendering the cover image (1200×400), logo, name, rating, extended description and a link to the profile. It must carry a visible `Spotlight · paid placement` eyebrow in `var(--muted)`, 11px DM Sans uppercase. Card radius 6px, cover `object-fit: cover`, `aspect-ratio: 3/1`.

- [ ] **Step 2: Add the CSS**

Append to `globals.css`:

```css
/* ── Spotlight hero ────────────────────────────────────────────── */
.spotlight-hero {
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--white);
  margin-bottom: 32px;
}
.spotlight-hero-cover { aspect-ratio: 3/1; overflow: hidden; background: var(--linen-dark); }
.spotlight-hero-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.spotlight-hero-body { padding: 24px; }
@media (max-width: 600px) { .spotlight-hero-body { padding: 18px; } }
```

- [ ] **Step 3: Render it on the listing page**

In `src/app/[city]/[category]/page.tsx`, before `<ListingsClient />`:

```tsx
const today = new Date().toISOString().slice(0, 10);
const spotlight = entries.find(
  (e) => e.tier === "spotlight" && isPaidTier(e.tier, e.tierExpiresAt, today),
);
```

Then `{spotlight && <SpotlightHero clinic={spotlight} citySlug={city} catSlug={category} />}`.

- [ ] **Step 4: Verify it renders only when a spotlight exists**

```bash
npx tsx --env-file=.env.local scripts/set-tier.ts --slug bibi-clinic --tier spotlight --expires 2027-08-13
npx next build >/dev/null 2>&1
grep -c "spotlight-hero" .next/server/app/bangkok/cosmetic-clinics.html   # expect >= 1
grep -c "spotlight-hero" .next/server/app/bangkok/dental-clinics.html     # expect 0
npx tsx --env-file=.env.local scripts/set-tier.ts --slug bibi-clinic --tier free
```

- [ ] **Step 5: Commit**

```bash
git add src/components/clinic/SpotlightHero.tsx "src/app/[city]/[category]/page.tsx" src/app/globals.css
git commit -m "feat(listings): add Spotlight hero box to city+category pages"
```

---

### Task 6: Homepage Spotlight rotation

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/lib/db/queries.ts` (add `getSpotlightClinics`)

**Interfaces:**
- Consumes: `rotationOffset`, `isPaidTier` from `src/lib/tiers.ts`
- Produces: `getSpotlightClinics(): Promise<ListingEntry[]>`

- [ ] **Step 1: Add the query**

In `src/lib/db/queries.ts`:

```ts
export async function getSpotlightClinics(): Promise<ListingEntry[]> {
  return db.select({ /* same shape as getListingEntries */ })
    .from(clinics)
    .innerJoin(cities,     eq(clinics.cityId,     cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(eq(clinics.tier, "spotlight"));
}
```

- [ ] **Step 2: Render a rotating slot on the homepage**

In `src/app/page.tsx`, compute at build time:

```tsx
const spotlights = (await getSpotlightClinics())
  .filter((c) => isPaidTier(c.tier, c.tierExpiresAt, today));
const dayOfYear = Math.floor(
  (Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86_400_000,
);
const offset = rotationOffset(dayOfYear, spotlights.length);
const shown = spotlights.length
  ? [...spotlights.slice(offset), ...spotlights.slice(0, offset)].slice(0, 3)
  : [];
```

Render `shown` in a section headed `Featured clinics` with the eyebrow `Paid placement · rotates with each site update`. Omit the entire section when `shown.length === 0`.

- [ ] **Step 3: Verify the section is absent with no spotlights**

```bash
npx next build >/dev/null 2>&1
grep -c "Paid placement" .next/server/app/index.html
```

Expected: `0` (no spotlight clinics currently set)

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/lib/db/queries.ts
git commit -m "feat(homepage): add build-time rotating Spotlight section"
```

---

### Task 7: `/for-clinics/` page with enquiry form

**Files:**
- Create: `src/app/for-clinics/page.tsx`
- Create: `src/app/for-clinics/layout.tsx`
- Create: `.env.example` entry `NEXT_PUBLIC_FORMSPREE_ENDPOINT=`

**Interfaces:**
- Consumes: `TIERS` from `src/lib/tiers.ts`
- Produces: the route `/for-clinics/`

**Copy constraints:** state real traffic honestly — "roughly 36,000 impressions and 330 clicks a month, growing"; never imply guaranteed leads. Include a block headed `This does not buy you a ranking`, reusing the wording from `/how-we-rank/`.

- [ ] **Step 1: Create the layout with metadata**

`src/app/for-clinics/layout.tsx`, following the pattern in `src/app/list-your-clinic/layout.tsx`. Title 55-62 chars: `Feature Your Clinic — Founding Rates | ThailandClinics`. Description 140-155 chars. Canonical `/for-clinics/`.

- [ ] **Step 2: Build the page**

Two tier cards from `TIERS`, prices `฿1,490`/`฿14,900` and `฿3,900`/`฿39,000`, slot counts, inclusions, honest traffic numbers, the no-ranking block, a Formspree form (`clinic name, city, category, contact name, email, phone, website, tier`), and a 4-question FAQ.

Form posts to `process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT`.

- [ ] **Step 3: Verify prices and honesty block render**

```bash
npx next build >/dev/null 2>&1
for s in "฿1,490" "฿14,900" "฿3,900" "฿39,000" "does not buy you a ranking"; do
  printf "%s  %s\n" "$(grep -c "$s" .next/server/app/for-clinics.html)" "$s"
done
```

Expected: every count `>= 1`

- [ ] **Step 4: Commit**

```bash
git add src/app/for-clinics .env.example
git commit -m "feat(for-clinics): add founding-tier offer page with enquiry form"
```

---

### Task 8: Owner CTAs

**Files:**
- Create: `src/components/marketing/OwnerCta.tsx`
- Create: `src/components/marketing/FeaturedBar.tsx`
- Modify: `src/app/[city]/[category]/page.tsx`, `src/components/layout/Nav.tsx`, `src/app/page.tsx` (footer), `src/app/globals.css`

**Interfaces:**
- Consumes: nothing
- Produces: `<OwnerCta />`, `<FeaturedBar />`

- [ ] **Step 1: Build `OwnerCta`**

Server component. Card at the foot of each listing page: heading `Own a clinic? Get listed at the top.`, body naming the benefits, button `See founding rates →` to `/for-clinics/`, and the line `From ฿1,490/month · 5 slots per category`. Reuse `.owner-strip` conventions; green filled button, 4px radius.

- [ ] **Step 2: Build `FeaturedBar`**

Client component (`"use client"`). Fixed bottom bar: `Own a clinic? [Get Featured →] ×`. Dismissal persisted to `localStorage` under `tc-featured-bar-dismissed`. Must not render until after mount, to avoid a hydration mismatch. Hidden below 600px so it never covers the existing mobile sticky call CTA.

- [ ] **Step 3: Mount both**

`OwnerCta` at the foot of `src/app/[city]/[category]/page.tsx`. `FeaturedBar` in the same page. Add a plain `For clinics` text link to `Nav.tsx` desktop and mobile lists — **a text link, not a third pill**. Add `For clinics` to the footer Company column in `src/app/page.tsx`.

- [ ] **Step 4: Verify**

```bash
npx next build >/dev/null 2>&1
grep -c "Own a clinic" .next/server/app/bangkok/cosmetic-clinics.html   # >= 1
grep -c "for-clinics" .next/server/app/index.html                       # >= 1
```

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing "src/app/[city]/[category]/page.tsx" src/components/layout/Nav.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat(marketing): add owner CTA card, dismissible featured bar and nav links"
```

---

### Task 9: Disclosure and Formspree migration

**Files:**
- Modify: `src/app/how-we-rank/page.tsx`
- Modify: `src/app/list-your-clinic/page.tsx`

- [ ] **Step 1: Add the disclosure paragraph**

In `how-we-rank/page.tsx`, in the existing featured-listings section, add:

> Featured and Spotlight placements are paid. They appear in a separate, clearly labelled block above the organic list, and they never change the order of the organic results below. Our editorial guides do not consider paid placement at all.

- [ ] **Step 2: Replace the mailto in `/list-your-clinic/`**

Swap the `mailto:` submit for a `fetch` POST to `process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT` with the existing form state, showing a success message on 200 and an error message otherwise.

- [ ] **Step 3: Verify no mailto remains on that page**

```bash
grep -c "mailto:" src/app/list-your-clinic/page.tsx
```

Expected: `0`

- [ ] **Step 4: Commit**

```bash
git add src/app/how-we-rank/page.tsx src/app/list-your-clinic/page.tsx
git commit -m "feat: disclose paid placement, migrate list-your-clinic off mailto"
```

---

### Task 10: Referral attribution and runbook

**Files:**
- Modify: outbound link component (locate with the grep in Step 1)
- Create: `docs/runbooks/featured-listings.md`

- [ ] **Step 1: Locate the existing UTM tracking**

```bash
git show 307206f --stat
grep -rn "utm_source\|utm_medium\|utm_campaign" src/ | head
```

- [ ] **Step 2: Make outbound clicks attributable per clinic**

Confirm the outbound URL carries a per-clinic identifier. If it only carries `utm_source=thailandclinics`, add `utm_content=<clinic-slug>` so referrals are attributable to an individual clinic. This is what makes renewal arguable.

- [ ] **Step 3: Verify on a built page**

```bash
npx next build >/dev/null 2>&1
grep -o 'utm_content=[a-z0-9-]*' .next/server/app/bangkok/cosmetic-clinics/bibi-clinic.html | head -1
```

Expected: `utm_content=bibi-clinic`

- [ ] **Step 4: Write the runbook**

Create `docs/runbooks/featured-listings.md` covering: enquiry arrives → check slots → invoice → collect assets → commit to `public/clinic-assets/` → run `set-tier.ts` → deploy → confirm → log the sale. State explicitly that expiry is evaluated at build time, so a lapsed clinic drops on the next deploy, and that a deploy is required for any tier change to appear.

- [ ] **Step 5: Commit**

```bash
git add docs/runbooks/featured-listings.md src/
git commit -m "feat: per-clinic referral attribution and featured-listings runbook"
```

---

## Self-Review

**Spec coverage:** Two tiers with exact prices (Task 7, global constraints) · slot limits enforced (Task 3) · schema migration incl. all 8 columns (Task 2) · paid block above organic, never reordering (Task 4) · labelled on every surface (Tasks 4, 5, 6) · `/how-we-rank/` disclosure (Task 9) · editorial exclusion (global constraint; no task reads `tier` in `content/`) · Spotlight hero (Task 5) · homepage build-time rotation (Task 6) · `/for-clinics/` (Task 7) · CTAs and nav/footer (Task 8) · Formspree incl. `/list-your-clinic/` (Tasks 7, 9) · `set-tier.ts` (Task 3) · runbook (Task 10) · referral attribution (Task 10) · asset storage under `public/clinic-assets/` (Task 10 runbook, Task 3 flags). All spec sections covered.

**Type consistency:** `Tier`, `isPaidTier`, `tierLabel`, `slotLimit`, `countWords`, `rotationOffset` defined in Task 1 and used with identical signatures in Tasks 2-6. `canAssignSlot` defined in Task 3, used only there. `ListingEntry` fields added in Task 2 are consumed with the same names in Tasks 4-6.

**Known gap accepted:** `getSpotlightClinics` in Task 6 duplicates the select shape of `getListingEntries`. Extracting a shared column list is a reasonable refactor for the implementer, but is not required.
