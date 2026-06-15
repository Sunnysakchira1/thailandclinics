/**
 * Import the cleaned Phuket physiotherapy set → Turso DB.
 * Mirrors scripts/import-clinics.ts mapping, but reads the normalized JSON
 * (data/phuket_import.json) produced from the Outscraper fetch.
 *
 * Idempotent: dedup by google_place_id against existing rows.
 * Usage: npx tsx --env-file=.env.local scripts/import-phuket.ts [--dry-run]
 */
import fs from "fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { cities, categories, clinics } from "../src/lib/db/schema";
import { extractEnglishName, generateSlug, deduplicateSlug } from "../src/lib/utils/slugify";

const DRY = process.argv.includes("--dry-run");
const client = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });
const db = drizzle(client, { schema: { cities, categories, clinics } });

// Manual slugs for fully-Thai names with no usable embedded English.
const SLUG_OVERRIDES: Record<string, string> = {
  "ChIJP2_1BAA3UDAR1XHFvjG7qcs": "thalang-physiotherapy-clinic",
  "ChIJp_T31sI3UDARhkMZzfHgTLY": "manna-physical-therapy-clinic-phuket",
  "ChIJG9UkGX0zUDARGqvr0nCgMk0": "phatcharaphan-physiotherapy-clinic",
  "ChIJS1suRsozUDARs1YXULmqJ7s": "thongnak-physiotherapy-clinic-phuket",
};

const clean = (v: unknown): string | null => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" || s.toLowerCase() === "none" ? null : s;
};

async function main() {
  const rows: Record<string, unknown>[] = JSON.parse(fs.readFileSync("data/phuket_import.json", "utf8"));
  console.log(`Loaded ${rows.length} Phuket clinics`);

  const [city] = await db.select().from(cities).where(eq(cities.slug, "phuket"));
  const [cat] = await db.select().from(categories).where(eq(categories.slug, "physiotherapy-clinics"));
  if (!city || !cat) { console.error("Missing phuket city or physiotherapy category"); process.exit(1); }

  const existing = await db.select({ slug: clinics.slug, placeId: clinics.googlePlaceId }).from(clinics);
  const usedSlugs = new Set(existing.map((r) => r.slug));
  const usedPlaceIds = new Set(existing.map((r) => r.placeId).filter(Boolean) as string[]);

  const toInsert: (typeof clinics.$inferInsert)[] = [];
  let skipDupe = 0;

  for (const row of rows) {
    const placeId = clean(row.place_id);
    if (placeId && usedPlaceIds.has(placeId)) { skipDupe++; continue; }

    const rawName = clean(row.name) ?? "";
    const nameEn = extractEnglishName(rawName);
    const nameTh = /[฀-๿]/.test(rawName) ? rawName : null;

    const baseSlug = (placeId && SLUG_OVERRIDES[placeId]) || generateSlug(rawName, nameEn, placeId ?? rawName);
    const slug = deduplicateSlug(baseSlug, usedSlugs, "phuket");
    usedSlugs.add(slug);
    if (placeId) usedPlaceIds.add(placeId);

    const ratingRaw = row.rating;
    const rating = ratingRaw == null ? null : Math.round(parseFloat(String(ratingRaw)) * 10) / 10;
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
      openingHours: clean(row.working_hours_norm),
      about: clean(row.about_norm),
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
  if (DRY) { toInsert.slice(0, 10).forEach((c) => console.log(`  ${c.slug}  (${c.googleRating}★ ${c.googleReviewsCount})`)); console.log("(dry run)"); return; }

  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    await db.insert(clinics).values(toInsert.slice(i, i + BATCH)).onConflictDoNothing();
    inserted += toInsert.slice(i, i + BATCH).length;
  }
  console.log(`Inserted: ${inserted}`);

  const count = await client.execute("SELECT COUNT(*) FROM clinics WHERE city_id = " + city.id);
  console.log(`Total Phuket clinics now: ${count.rows[0][0]}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
