/**
 * Import curated Bangkok dental clinics → Turso (dental-clinics / bangkok).
 * Reads raw Outscraper merge (data/dental_bangkok_raw.json).
 *
 * Bar:  OPERATIONAL · state=Bangkok · reviews >= 20 · rating >= 4.2  (NO cap)
 * Junk types stripped. Idempotent: dedup by google_place_id + slug.
 *
 * Usage: npx tsx --env-file=.env.local scripts/import-fertility-bangkok.ts [--dry-run]
 */
import fs from "fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { cities, categories, clinics } from "../src/lib/db/schema";
import { extractEnglishName, generateSlug, deduplicateSlug } from "../src/lib/utils/slugify";

const DRY = process.argv.includes("--dry-run");
const MIN_REVIEWS = 50;
const MIN_RATING = 4.5;

const SLUG_OVERRIDES: Record<string, string> = {};
const ALWAYS_INCLUDE = new Set<string>();

const client = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });
const db = drizzle(client, { schema: { cities, categories, clinics } });

const clean = (v: unknown): string | null => {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" || s.toLowerCase() === "none" ? null : s;
};
const jsonOrNull = (v: unknown): string | null => {
  if (v == null) return null;
  if (typeof v === "string") { try { JSON.parse(v); return v; } catch { return null; } }
  if (typeof v === "object") { try { return JSON.stringify(v); } catch { return null; } }
  return null;
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

// Non-fertility types → drop (product shops, spas, unrelated).
const JUNK_KEYWORDS = ["ร้านขาย", "wholesaler", "ผู้ค้าส่ง", "nail salon", "ร้านทำเล็บ", "spa", "massage"];
const isJunk = (cat: string | null): boolean => {
  if (!cat) return false;
  const lc = cat.toLowerCase();
  return JUNK_KEYWORDS.some((k) => lc.includes(k.toLowerCase()));
};

async function main() {
  const raw: Record<string, unknown>[] = JSON.parse(fs.readFileSync("data/dental_bangkok_raw.json", "utf8"));
  console.log(`Loaded ${raw.length} raw places`);

  const filtered = raw.filter((r) => {
    if (clean(r.business_status) !== "OPERATIONAL") return false;
    if (!clean(r.state)?.toLowerCase().includes("bangkok")) return false;
    if (isJunk(clean(r.category) ?? clean(r.type))) return false;
    if (ALWAYS_INCLUDE.has(String(r.place_id))) return true;   // landmark override
    const reviews = parseInt(String(r.reviews ?? 0), 10) || 0;
    const rating = parseFloat(String(r.rating ?? 0)) || 0;
    return reviews >= MIN_REVIEWS && rating >= MIN_RATING;
  });
  console.log(`Passed bar (rev>=${MIN_REVIEWS}, rating>=${MIN_RATING}): ${filtered.length}`);

  const [city] = await db.select().from(cities).where(eq(cities.slug, "bangkok"));
  const [cat] = await db.select().from(categories).where(eq(categories.slug, "dental-clinics"));
  if (!city || !cat) { console.error("Missing bangkok city or dental-clinics category"); process.exit(1); }

  const existing = await db.select({ slug: clinics.slug, placeId: clinics.googlePlaceId }).from(clinics);
  const usedSlugs = new Set(existing.map((r) => r.slug));
  const usedPlaceIds = new Set(existing.map((r) => r.placeId).filter(Boolean) as string[]);

  const toInsert: (typeof clinics.$inferInsert)[] = [];
  let skipDupe = 0;

  // rank by weighted rating so the imported order is sensible (display re-sorts anyway)
  const wr = (R: number, v: number) => (v * R + 300 * 4.6) / (v + 300);
  filtered.sort((a, b) =>
    wr(parseFloat(String(b.rating)) || 0, parseInt(String(b.reviews), 10) || 0) -
    wr(parseFloat(String(a.rating)) || 0, parseInt(String(a.reviews), 10) || 0));

  for (const row of filtered) {
    const placeId = clean(row.place_id);
    if (placeId && usedPlaceIds.has(placeId)) { skipDupe++; continue; }

    const rawName = clean(row.name) ?? "";
    const nameEn = extractEnglishName(rawName);
    const nameTh = /[฀-๿]/.test(rawName) ? rawName : null;

    const baseSlug = (placeId && SLUG_OVERRIDES[placeId]) || generateSlug(rawName, nameEn, placeId ?? rawName);
    const slug = deduplicateSlug(baseSlug, usedSlugs, "bangkok");
    usedSlugs.add(slug);
    if (placeId) usedPlaceIds.add(placeId);

    const rating = row.rating == null ? null : Math.round(parseFloat(String(row.rating)) * 10) / 10;
    const reviews = row.reviews == null ? null : parseInt(String(row.reviews), 10);

    toInsert.push({
      name: rawName, slug, cityId: city.id, categoryId: cat.id, nameEn, nameTh,
      district: clean(row.city), address: clean(row.address), postalCode: clean(row.postal_code),
      lat: parseFloat(String(row.latitude ?? 0)), lng: parseFloat(String(row.longitude ?? 0)),
      phone: clean(row.phone), website: clean(row.website), email: clean(row.email),
      googlePlaceId: placeId, googleRating: rating, googleReviewsCount: reviews,
      openingHours: normalizeHours(row.working_hours), about: jsonOrNull(row.about), photoUrl: clean(row.photo),
      englishSpeaking: false, nearBts: false, nearMrt: false, openWeekends: false, verified: false, featured: false,
    });
  }

  console.log(`Ready to insert: ${toInsert.length} | skipped (dupe): ${skipDupe}`);
  if (DRY) {
    toInsert.forEach((c) => console.log(`  ${(c.googleRating + "★").padEnd(6)} ${String(c.googleReviewsCount).padEnd(5)} ${c.slug}`));
    console.log("(dry run)"); return;
  }

  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const slice = toInsert.slice(i, i + BATCH);
    await db.insert(clinics).values(slice).onConflictDoNothing();
    inserted += slice.length;
  }
  console.log(`Inserted: ${inserted}`);

  const cnt = await client.execute({ sql: "SELECT COUNT(*) FROM clinics WHERE city_id = ?", args: [city.id] });
  await db.update(cities).set({ clinicCount: Number(cnt.rows[0][0]) }).where(eq(cities.id, city.id));
  console.log(`Bangkok clinics now: ${cnt.rows[0][0]}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
