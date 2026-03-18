/**
 * Import Outscraper physiotherapy XLSX → Turso DB
 *
 * Usage: npx tsx scripts/import-clinics.ts
 *
 * Reads: ./data/physio_data_bangkok.xlsx
 * Filters: OPERATIONAL only, reviews >= 5
 * Maps: Outscraper 'city' → district, Outscraper 'state' → city_id lookup
 */

import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { cities, categories, clinics } from "../src/lib/db/schema";
import {
  extractEnglishName,
  generateSlug,
  deduplicateSlug,
} from "../src/lib/utils/slugify";

/* ─── DB client ──────────────────────────────────────────────────── */
const client = createClient({
  url:       process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(client, { schema: { cities, categories, clinics } });

/* ─── Helpers ────────────────────────────────────────────────────── */
function clean(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" || s.toLowerCase() === "none" ? null : s;
}

function cleanFloat(v: unknown): number | null {
  const s = clean(v);
  if (!s) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : Math.round(n * 10) / 10;
}

function cleanInt(v: unknown): number | null {
  const s = clean(v);
  if (!s) return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

function parseHours(v: unknown): string | null {
  const s = clean(v);
  if (!s) return null;
  try {
    JSON.parse(s);
    return s;
  } catch {
    return null;
  }
}

/* ─── Main ───────────────────────────────────────────────────────── */
async function main() {
  const xlsxPath = path.resolve("./data/physio_data_bangkok.xlsx");

  if (!fs.existsSync(xlsxPath)) {
    console.error("File not found:", xlsxPath);
    process.exit(1);
  }

  /* 1. Parse XLSX — first sheet, header row */
  const workbook  = XLSX.readFile(xlsxPath);
  const sheetName = workbook.SheetNames[0];
  const rows      = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[sheetName],
    { defval: null }
  );

  console.log(`Parsed ${rows.length} rows from ${sheetName}`);

  // Show column names from first row so we can verify mapping
  if (rows.length > 0) {
    console.log("Columns:", Object.keys(rows[0]).join(", "));
  }

  /* 2. Look up city_id and category_id */
  const [bangkokCity] = await db
    .select()
    .from(cities)
    .where(eq(cities.slug, "bangkok"));

  const [physioCategory] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, "physiotherapy-clinics"));

  if (!bangkokCity || !physioCategory) {
    console.error("Missing seed data — run seed-base-data.ts first");
    process.exit(1);
  }

  const cityId     = bangkokCity.id;
  const categoryId = physioCategory.id;

  /* 3. Load existing slugs and place_ids for dedup */
  const existingRows = await db
    .select({ slug: clinics.slug, placeId: clinics.googlePlaceId })
    .from(clinics);

  const usedSlugs    = new Set(existingRows.map((r) => r.slug));
  const usedPlaceIds = new Set(
    existingRows.map((r) => r.placeId).filter(Boolean) as string[]
  );

  /* 4. Filter and transform */
  let skippedStatus  = 0;
  let skippedReviews = 0;
  let skippedState   = 0;
  let skippedDupeId  = 0;

  const toInsert: (typeof clinics.$inferInsert)[] = [];

  for (const row of rows) {
    // Filter: OPERATIONAL only
    if (clean(row.business_status) !== "OPERATIONAL") {
      skippedStatus++;
      continue;
    }

    // Filter: reviews >= 5
    const reviewCount = cleanInt(row.reviews);
    if (reviewCount === null || reviewCount < 5) {
      skippedReviews++;
      continue;
    }

    // Filter: must be Bangkok state
    const state = clean(row.state);
    if (!state || !state.toLowerCase().includes("bangkok")) {
      skippedState++;
      continue;
    }

    // Dedup by google_place_id
    const placeId = clean(row.place_id);
    if (placeId && usedPlaceIds.has(placeId)) {
      skippedDupeId++;
      continue;
    }

    // Name extraction
    const rawName = clean(row.name) ?? "";
    const nameEn  = extractEnglishName(rawName);
    const nameTh  = /[\u0E00-\u0E7F]/.test(rawName) ? rawName : null;

    // Slug
    const baseSlug = generateSlug(rawName, nameEn, placeId ?? rawName);
    const slug     = deduplicateSlug(baseSlug, usedSlugs, "bangkok");
    usedSlugs.add(slug);
    if (placeId) usedPlaceIds.add(placeId);

    // Postal code: may come as float (10110.0) → strip decimal
    const postalRaw  = clean(row.postal_code);
    const postalCode = postalRaw
      ? String(parseInt(postalRaw, 10))
      : null;

    const lat = parseFloat(String(row.latitude  ?? 0));
    const lng = parseFloat(String(row.longitude ?? 0));

    toInsert.push({
      name:       rawName,
      slug,
      cityId,
      categoryId,
      nameEn,
      nameTh,
      // ⚠️ Outscraper 'city' column = sub-district, NOT city
      district:   clean(row.city),
      address:    clean(row.address),
      postalCode,
      lat,
      lng,
      phone:      clean(row.phone),
      website:    clean(row.website),
      email:      clean(row.email),
      googlePlaceId:      placeId,
      googleRating:       cleanFloat(row.rating),
      googleReviewsCount: reviewCount,
      openingHours:       parseHours(row.working_hours),
      about:              clean(row.about),
      photoUrl:           clean(row.photo),
      englishSpeaking: false,
      nearBts:         false,
      nearMrt:         false,
      openWeekends:    false,
      verified:        false,
      featured:        false,
    });
  }

  console.log(`
Filter summary:
  Not OPERATIONAL : ${skippedStatus}
  Reviews < 5     : ${skippedReviews}
  Non-Bangkok     : ${skippedState}
  Duplicate ID    : ${skippedDupeId}
  ─────────────────
  Ready to insert : ${toInsert.length}
  `);

  if (toInsert.length === 0) {
    console.log("Nothing to insert — check filters above.");
    process.exit(0);
  }

  /* 5. Batch insert in chunks of 50 (SQLite variable limit) */
  const BATCH  = 50;
  let inserted = 0;

  for (let i = 0; i < toInsert.length; i += BATCH) {
    const chunk = toInsert.slice(i, i + BATCH);
    await db.insert(clinics).values(chunk).onConflictDoNothing();
    inserted += chunk.length;
    process.stdout.write(`\rInserted ${inserted}/${toInsert.length}...`);
  }

  /* 6. Sample 3 rows for verification */
  const sample = await db
    .select({
      name:     clinics.name,
      nameEn:   clinics.nameEn,
      district: clinics.district,
      slug:     clinics.slug,
    })
    .from(clinics)
    .limit(3);

  const total = await db
    .select({ count: clinics.id })
    .from(clinics);

  console.log(`\n\n=== Verification ===`);
  console.log(`Total clinics in DB: ${total.length}`);
  console.log(`\nSample (3 rows):`);
  sample.forEach((r, i) =>
    console.log(
      ` ${i + 1}. ${r.nameEn ?? r.name} | district: ${r.district} | slug: ${r.slug}`
    )
  );

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
