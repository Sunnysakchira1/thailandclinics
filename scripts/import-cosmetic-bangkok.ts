/**
 * Import curated Bangkok beauty/cosmetic clinics → Turso DB (cosmetic-clinics / bangkok).
 * Reads raw Outscraper merge (data/cosmetic_bangkok_raw.json).
 *
 * Curated bar:  OPERATIONAL · state=Bangkok · reviews >= 25 · rating >= 4.2
 * Junk types stripped (nail salons, product shops, urology, etc.)
 * Ranked by Bayesian quality score, capped at CAP.
 * Idempotent: dedup by google_place_id and slug against existing rows.
 *
 * Usage: npx tsx --env-file=.env.local scripts/import-cosmetic-bangkok.ts [--dry-run]
 */
import fs from "fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { cities, categories, clinics } from "../src/lib/db/schema";
import { extractEnglishName, generateSlug, deduplicateSlug } from "../src/lib/utils/slugify";

const DRY = process.argv.includes("--dry-run");
const CAP = 150;
const MIN_REVIEWS = 25;
const MIN_RATING = 4.2;
const PRIOR = 50; // Bayesian prior strength (review-count credibility)

const client = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });
const db = drizzle(client, { schema: { cities, categories, clinics } });

const clean = (v: unknown): string | null => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" || s.toLowerCase() === "none" ? null : s;
};
const jsonOrNull = (v: unknown): string | null => {
  if (v == null) return null;
  if (typeof v === "string") { try { JSON.parse(v); return v; } catch { return null; } }
  if (typeof v === "object") { try { return JSON.stringify(v); } catch { return null; } }
  return null;
};

// Normalize Outscraper working_hours → {Mon..Sun: "9AM-8PM"} string-per-day (matches physio format).
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
  return Object.keys(out).length ? JSON.stringify(out) : null;
};

// Categories that are not beauty/aesthetic clinics → drop.
const JUNK_CATEGORIES = new Set<string>([
  "ร้านทำเล็บ", "Nail salon",
  "ผู้ค้าส่งผลิตภัณฑ์ความงาม",
  "ร้านขายผลิตภัณฑ์เพื่อสุขภาพและความงาม",
  "คลินิกระบบทางเดินปัสสาวะ",
]);
const JUNK_KEYWORDS = ["ร้านขาย", "wholesaler", "ทางเดินปัสสาวะ", "ผู้ค้าส่ง"];
const isJunk = (cat: string | null): boolean => {
  if (!cat) return false;
  if (JUNK_CATEGORIES.has(cat)) return true;
  const lc = cat.toLowerCase();
  return JUNK_KEYWORDS.some((k) => lc.includes(k.toLowerCase()));
};

async function main() {
  const raw: Record<string, unknown>[] = JSON.parse(fs.readFileSync("data/cosmetic_bangkok_raw.json", "utf8"));
  console.log(`Loaded ${raw.length} raw places`);

  // ── Filter to curated set ───────────────────────────────────────
  const filtered = raw.filter((r) => {
    if (clean(r.business_status) !== "OPERATIONAL") return false;
    if (!clean(r.state)?.toLowerCase().includes("bangkok")) return false;
    const reviews = parseInt(String(r.reviews ?? 0), 10) || 0;
    const rating = parseFloat(String(r.rating ?? 0)) || 0;
    if (reviews < MIN_REVIEWS || rating < MIN_RATING) return false;
    if (isJunk(clean(r.category) ?? clean(r.type))) return false;
    return true;
  });
  console.log(`Passed curated bar: ${filtered.length}`);

  // ── Bayesian quality rank ───────────────────────────────────────
  const C = filtered.reduce((s, r) => s + (parseFloat(String(r.rating)) || 0), 0) / filtered.length;
  const scored = filtered.map((r) => {
    const v = parseInt(String(r.reviews), 10) || 0;
    const R = parseFloat(String(r.rating)) || 0;
    const score = (v / (v + PRIOR)) * R + (PRIOR / (v + PRIOR)) * C;
    return { r, score };
  }).sort((a, b) => b.score - a.score);

  const picked = scored.slice(0, CAP).map((x) => x.r);
  console.log(`Mean rating C=${C.toFixed(3)} | ranked, capped at ${CAP} → ${picked.length} clinics`);

  // ── Resolve city + category ─────────────────────────────────────
  const [city] = await db.select().from(cities).where(eq(cities.slug, "bangkok"));
  const [cat] = await db.select().from(categories).where(eq(categories.slug, "cosmetic-clinics"));
  if (!city || !cat) { console.error("Missing bangkok city or cosmetic-clinics category"); process.exit(1); }

  const existing = await db.select({ slug: clinics.slug, placeId: clinics.googlePlaceId }).from(clinics);
  const usedSlugs = new Set(existing.map((r) => r.slug));
  const usedPlaceIds = new Set(existing.map((r) => r.placeId).filter(Boolean) as string[]);

  const toInsert: (typeof clinics.$inferInsert)[] = [];
  let skipDupe = 0;

  for (const row of picked) {
    const placeId = clean(row.place_id);
    if (placeId && usedPlaceIds.has(placeId)) { skipDupe++; continue; }

    const rawName = clean(row.name) ?? "";
    const nameEn = extractEnglishName(rawName);
    const nameTh = /[฀-๿]/.test(rawName) ? rawName : null;

    const baseSlug = generateSlug(rawName, nameEn, placeId ?? rawName);
    const slug = deduplicateSlug(baseSlug, usedSlugs, "bangkok");
    usedSlugs.add(slug);
    if (placeId) usedPlaceIds.add(placeId);

    const rating = row.rating == null ? null : Math.round(parseFloat(String(row.rating)) * 10) / 10;
    const reviews = row.reviews == null ? null : parseInt(String(row.reviews), 10);

    toInsert.push({
      name: rawName,
      slug,
      cityId: city.id,
      categoryId: cat.id,
      nameEn,
      nameTh,
      district: clean(row.city), // Outscraper 'city' = sub-district
      address: clean(row.address),
      postalCode: clean(row.postal_code),
      lat: parseFloat(String(row.latitude ?? 0)),
      lng: parseFloat(String(row.longitude ?? 0)),
      phone: clean(row.phone),
      website: clean(row.website),
      email: clean(row.email),
      googlePlaceId: placeId,
      googleRating: rating,
      googleReviewsCount: reviews,
      openingHours: normalizeHours(row.working_hours),
      about: jsonOrNull(row.about),
      photoUrl: clean(row.photo),
      englishSpeaking: false,
      nearBts: false,
      nearMrt: false,
      openWeekends: false,
      verified: false,
      featured: false,
    });
  }

  console.log(`Ready to insert: ${toInsert.length} | skipped (dupe place_id): ${skipDupe}`);
  if (DRY) {
    toInsert.slice(0, 20).forEach((c) => console.log(`  ${(c.googleRating + "★").padEnd(6)} ${String(c.googleReviewsCount).padEnd(5)} ${c.slug}`));
    console.log("(dry run — nothing written)");
    return;
  }

  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const slice = toInsert.slice(i, i + BATCH);
    await db.insert(clinics).values(slice).onConflictDoNothing();
    inserted += slice.length;
  }
  console.log(`Inserted: ${inserted}`);

  // Refresh cached city count (city-level total across categories)
  const cnt = await client.execute({ sql: "SELECT COUNT(*) FROM clinics WHERE city_id = ?", args: [city.id] });
  await db.update(cities).set({ clinicCount: Number(cnt.rows[0][0]) }).where(eq(cities.id, city.id));
  console.log(`Bangkok total clinics now: ${cnt.rows[0][0]} (cached count updated)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
