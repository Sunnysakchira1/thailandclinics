/**
 * Add "The Cosmo Clinic" (cosmobeautyclinic.com) as a brand with its 2 Bangkok
 * branches (Central Pinklao, Central Rama 3) → cosmetic-clinics / bangkok.
 *
 * Self-contained: inserts the 2 branch clinics (if absent), creates the brand,
 * links brand_id + branch_slug, computes cached aggregates. No redirects (new
 * pages, not re-slugged). Idempotent: dedup by google_place_id + slug.
 *
 * Usage: npx tsx --env-file=.env.local scripts/add-cosmo-brand.ts [--dry-run]
 */
import fs from "fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { and, eq } from "drizzle-orm";
import { cities, categories, clinics, brands } from "../src/lib/db/schema";
import { extractEnglishName, generateSlug, deduplicateSlug } from "../src/lib/utils/slugify";

const DRY = process.argv.includes("--dry-run");
const BRAND_NAME = "The Cosmo Clinic";
const BRAND_SLUG = "cosmo-clinic";
const BRAND_WEBSITE = "https://www.cosmobeautyclinic.com/";

// place_id → branch_slug (curated)
const BRANCH_SLUGS: Record<string, string> = {
  "ChIJC2gvdjiZ4jAR5hqQY92108w": "central-pinklao",
  "ChIJsVZEramZ4jARaGpYMad-ZcA": "central-rama-3",
  "ChIJk_aDK--Z4jARHHbWI2IY2hc": "tha-phra",
};

const client = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });
const db = drizzle(client, { schema: { cities, categories, clinics, brands } });

const clean = (v: unknown): string | null => {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" || s.toLowerCase() === "none" ? null : s;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const normalizeHours = (v: unknown): string | null => {
  let obj: Record<string, unknown>;
  if (v == null) return null;
  if (typeof v === "string") { try { obj = JSON.parse(v); } catch { return null; } }
  else if (typeof v === "object") obj = v as Record<string, unknown>;
  else return null;
  const out: Record<string, string> = {};
  for (const day of DAYS) {
    const raw = obj[day];
    if (Array.isArray(raw)) out[day] = raw.filter(Boolean).join(", ") || "Closed";
    else if (typeof raw === "string" && raw.trim()) out[day] = raw.trim();
    else out[day] = "Closed";
  }
  return JSON.stringify(out);
};
const jsonOrNull = (v: unknown): string | null => {
  if (v == null) return null;
  if (typeof v === "object") { try { return JSON.stringify(v); } catch { return null; } }
  if (typeof v === "string") { try { JSON.parse(v); return v; } catch { return null; } }
  return null;
};

async function main() {
  const raw: any[] = JSON.parse(fs.readFileSync("data/cosmo_brand_raw.json", "utf8"))
    .filter((x: any) => /cosmobeautyclinic/i.test(x.website || x.site || ""));
  if (raw.length !== 3) console.warn(`Expected 3 Cosmo branches, got ${raw.length}`);

  const [city] = await db.select().from(cities).where(eq(cities.slug, "bangkok"));
  const [cat] = await db.select().from(categories).where(eq(categories.slug, "cosmetic-clinics"));
  if (!city || !cat) { console.error("Missing bangkok / cosmetic-clinics"); process.exit(1); }

  const existing = await db.select({ slug: clinics.slug, placeId: clinics.googlePlaceId }).from(clinics);
  const usedSlugs = new Set(existing.map((r) => r.slug));
  const usedPlaceIds = new Set(existing.map((r) => r.placeId).filter(Boolean) as string[]);

  // ── Upsert brand ────────────────────────────────────────────────
  const [existingBrand] = await db.select().from(brands)
    .where(and(eq(brands.cityId, city.id), eq(brands.categoryId, cat.id), eq(brands.slug, BRAND_SLUG)));
  if (usedSlugs.has(BRAND_SLUG)) { console.error(`Brand slug "${BRAND_SLUG}" collides with a clinic slug`); process.exit(1); }

  let brandId = existingBrand?.id ?? -1;
  const branchIds: number[] = [];
  let sumWR = 0, sumR = 0, flagshipPhoto: string | null = null, flagshipReviews = -1;

  for (const row of raw) {
    const placeId = clean(row.place_id)!;
    const branchSlug = BRANCH_SLUGS[placeId];
    if (!branchSlug) { console.error(`No branch_slug mapping for ${placeId} (${row.name})`); process.exit(1); }

    const rawName = clean(row.name) ?? "";
    const nameEn = extractEnglishName(rawName);
    const rating = row.rating == null ? null : Math.round(parseFloat(String(row.rating)) * 10) / 10;
    const reviews = row.reviews == null ? null : parseInt(String(row.reviews), 10);
    const photo = clean(row.photo);

    if (reviews != null && rating != null) {
      sumWR += rating * reviews; sumR += reviews;
      if (reviews > flagshipReviews) { flagshipReviews = reviews; flagshipPhoto = photo; }
    }

    const alreadyId = existing.find((e) => e.placeId === placeId);
    if (DRY) {
      console.log(`[dry] ${alreadyId ? "exists" : "insert"} ${branchSlug}  ${rating}★ ${reviews}rev  ${rawName}`);
      continue;
    }

    if (!usedPlaceIds.has(placeId)) {
      const baseSlug = generateSlug(rawName, nameEn, placeId);
      const slug = deduplicateSlug(baseSlug, usedSlugs, "bangkok");
      usedSlugs.add(slug); usedPlaceIds.add(placeId);
      const inserted = await db.insert(clinics).values({
        name: rawName, slug, cityId: city.id, categoryId: cat.id,
        nameEn, nameTh: /[฀-๿]/.test(rawName) ? rawName : null,
        district: clean(row.city), address: clean(row.address), postalCode: clean(row.postal_code),
        lat: parseFloat(String(row.latitude ?? 0)), lng: parseFloat(String(row.longitude ?? 0)),
        phone: clean(row.phone), website: BRAND_WEBSITE, email: clean(row.email),
        googlePlaceId: placeId, googleRating: rating, googleReviewsCount: reviews,
        openingHours: normalizeHours(row.working_hours), about: jsonOrNull(row.about), photoUrl: photo,
        englishSpeaking: false, nearBts: false, nearMrt: false, openWeekends: false, verified: false, featured: false,
      }).returning({ id: clinics.id });
      branchIds.push(inserted[0].id);
    } else {
      const [c] = await db.select({ id: clinics.id }).from(clinics).where(eq(clinics.googlePlaceId, placeId));
      branchIds.push(c.id);
    }
  }

  const avg = sumR > 0 ? Math.round((sumWR / sumR) * 10) / 10 : null;
  console.log(`\nBrand "${BRAND_NAME}" [${BRAND_SLUG}] — ${raw.length} branches, avg ${avg}★, ${sumR} reviews`);
  if (DRY) { console.log("(dry run — nothing written)"); return; }

  const brandBase = {
    name: BRAND_NAME, slug: BRAND_SLUG, cityId: city.id, categoryId: cat.id,
    website: BRAND_WEBSITE, branchCount: raw.length, avgRating: avg, totalReviews: sumR, logoUrl: flagshipPhoto,
  };
  if (existingBrand) { await db.update(brands).set(brandBase).where(eq(brands.id, existingBrand.id)); brandId = existingBrand.id; }
  else { const r = await db.insert(brands).values(brandBase).returning({ id: brands.id }); brandId = r[0].id; }

  // link branches
  const placeToSlug = new Map(raw.map((r: any) => [clean(r.place_id)!, BRANCH_SLUGS[clean(r.place_id)!]]));
  for (const id of branchIds) {
    const [c] = await db.select({ placeId: clinics.googlePlaceId }).from(clinics).where(eq(clinics.id, id));
    await db.update(clinics).set({ brandId, branchSlug: placeToSlug.get(c.placeId!) }).where(eq(clinics.id, id));
  }

  const n = await client.execute({ sql: "SELECT COUNT(*) FROM clinics WHERE brand_id = ?", args: [brandId] });
  console.log(`✓ brand id ${brandId}; linked ${n.rows[0][0]} branches`);
  const cnt = await client.execute({ sql: "SELECT COUNT(*) FROM clinics WHERE city_id = ?", args: [city.id] });
  await db.update(cities).set({ clinicCount: Number(cnt.rows[0][0]) }).where(eq(cities.id, city.id));
  console.log(`Bangkok clinics now: ${cnt.rows[0][0]}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
