/**
 * Fetch last 30 English reviews per clinic from Outscraper → Turso DB
 *
 * Calls the Outscraper REST API directly (bypasses SDK which has broken
 * error handling on HTML error responses).
 *
 * Usage: npx tsx scripts/fetch-reviews.ts
 * Env:   TURSO_URL, TURSO_AUTH_TOKEN, OUTSCRAPER_API_KEY
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { isNotNull } from "drizzle-orm";
import { clinics, clinicReviews } from "../src/lib/db/schema";

/* ─── DB ─────────────────────────────────────────────────────────── */
const client = createClient({
  url:       process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(client, { schema: { clinics, clinicReviews } });

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseReviewDate(dtStr: string): string | null {
  try {
    const [datePart] = dtStr.split(" ");
    const [m, d, y]  = datePart.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  } catch { return null; }
}

/* ─── Outscraper REST call ───────────────────────────────────────── */
interface OutscraperReview {
  review_id:           string;
  author_title:        string;
  review_rating:       number;
  review_text:         string | null;
  review_datetime_utc: string;
}
interface OutscraperResult {
  place_id:     string;
  reviews_data: OutscraperReview[];
}

async function fetchReviews(
  placeIds: string[],
  apiKey:   string,
  attempt = 1
): Promise<OutscraperResult[]> {
  const params = new URLSearchParams();
  placeIds.forEach((id) => params.append("query", id));
  params.set("reviewsLimit", "30");
  params.set("language",     "en");
  params.set("sort",         "newest");
  params.set("async",        "false");

  const url = `https://api.app.outscraper.com/maps/reviews-v3?${params}`;

  const res = await fetch(url, {
    headers: { "X-API-KEY": apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
  }

  const json = await res.json() as { data?: OutscraperResult[]; status?: string };

  // Handle async job (should not happen with async=false, but just in case)
  if (json.status === "Pending" || json.status === "Running") {
    if (attempt > 10) throw new Error("Job timed out after 10 polls");
    console.log(`    Job pending, polling in 5s (attempt ${attempt})...`);
    await sleep(5000);
    // Re-poll with same params
    return fetchReviews(placeIds, apiKey, attempt + 1);
  }

  return json.data ?? [];
}

/* ─── Main ───────────────────────────────────────────────────────── */
async function main() {
  if (!process.env.OUTSCRAPER_API_KEY) {
    console.error("OUTSCRAPER_API_KEY not set"); process.exit(1);
  }
  const apiKey = process.env.OUTSCRAPER_API_KEY;

  /* 1. All clinics with a place_id */
  const allClinics = await db
    .select({ id: clinics.id, placeId: clinics.googlePlaceId })
    .from(clinics)
    .where(isNotNull(clinics.googlePlaceId));

  console.log(`Clinics to fetch: ${allClinics.length}`);

  /* 2. Existing review IDs for dedup */
  const existing = await db
    .select({ googleReviewId: clinicReviews.googleReviewId })
    .from(clinicReviews);

  const seenIds = new Set(existing.map((r) => r.googleReviewId).filter(Boolean));
  console.log(`Reviews already in DB: ${seenIds.size}`);

  /* 3. place_id → clinic_id map */
  const placeMap = new Map<string, number>(
    allClinics.map((c) => [c.placeId!, c.id])
  );

  /* 4. Batch: 20 place_ids per call, 5s between batches */
  const BATCH_SIZE   = 20;
  const BATCH_DELAY  = 5000;
  const placeIds     = allClinics.map((c) => c.placeId!);
  const totalBatches = Math.ceil(placeIds.length / BATCH_SIZE);

  let totalInserted = 0;

  for (let i = 0; i < placeIds.length; i += BATCH_SIZE) {
    const batch    = placeIds.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`Batch ${batchNum}/${totalBatches} — ${batch.length} clinics...`);

    let results: OutscraperResult[] = [];

    // Retry up to 3 times with backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        results = await fetchReviews(batch, apiKey);
        break;
      } catch (err) {
        const msg = (err as Error).message;
        console.error(`  Attempt ${attempt} failed: ${msg.slice(0, 100)}`);
        if (attempt < 3) {
          const wait = 15000 * attempt;
          console.log(`  Retrying in ${wait / 1000}s...`);
          await sleep(wait);
        } else {
          console.error(`  Skipping batch ${batchNum}`);
        }
      }
    }

    if (results.length === 0) {
      if (i + BATCH_SIZE < placeIds.length) await sleep(BATCH_DELAY);
      continue;
    }

    /* Insert reviews */
    const toInsert: (typeof clinicReviews.$inferInsert)[] = [];

    for (const result of results) {
      const clinicId = placeMap.get(result.place_id);
      if (!clinicId) continue;

      for (const rev of (result.reviews_data ?? [])) {
        if (!rev.review_id || seenIds.has(rev.review_id)) continue;
        seenIds.add(rev.review_id);
        toInsert.push({
          clinicId,
          googleReviewId: rev.review_id,
          authorName:     rev.author_title ?? "Anonymous",
          rating:         rev.review_rating,
          text:           rev.review_text ?? null,
          reviewDate:     parseReviewDate(rev.review_datetime_utc),
        });
      }
    }

    if (toInsert.length > 0) {
      for (let j = 0; j < toInsert.length; j += 50) {
        await db.insert(clinicReviews).values(toInsert.slice(j, j + 50)).onConflictDoNothing();
      }
      totalInserted += toInsert.length;
      console.log(`  +${toInsert.length} reviews (running total: ${totalInserted})`);
    } else {
      console.log(`  No new reviews`);
    }

    if (i + BATCH_SIZE < placeIds.length) await sleep(BATCH_DELAY);
  }

  /* Final count */
  const [{ count }] = await db
    .select({ count: clinicReviews.id })
    .from(clinicReviews)
    .then((rows) => [{ count: rows.length }]);

  console.log(`\n=== Done ===`);
  console.log(`Inserted this run : ${totalInserted}`);
  console.log(`Total in DB       : ${count}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
