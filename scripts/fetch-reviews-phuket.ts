/**
 * Fetch last 30 English reviews per clinic for PHUKET clinics only (city_id = 2)
 * → clinic_reviews. Same Outscraper REST + batching as fetch-reviews.ts, but
 * scoped so it does NOT re-pull (and re-bill) the 329 Bangkok clinics.
 *
 * Usage: npx tsx --env-file=.env.local scripts/fetch-reviews-phuket.ts
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { clinics, clinicReviews } from "../src/lib/db/schema";

const client = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });
const db = drizzle(client, { schema: { clinics, clinicReviews } });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseReviewDate(s: string): string | null {
  try { const [d] = s.split(" "); const [m, dd, y] = d.split("/"); return `${y}-${m.padStart(2, "0")}-${dd.padStart(2, "0")}`; }
  catch { return null; }
}

interface OReview { review_id: string; author_title: string; review_rating: number; review_text: string | null; review_datetime_utc: string; }
interface OResult { place_id: string; reviews_data: OReview[]; }

async function fetchReviews(placeIds: string[], apiKey: string, attempt = 1): Promise<OResult[]> {
  const params = new URLSearchParams();
  placeIds.forEach((id) => params.append("query", id));
  params.set("reviewsLimit", "30");
  params.set("language", "en");
  params.set("sort", "newest");
  params.set("async", "false");
  const res = await fetch(`https://api.app.outscraper.com/maps/reviews-v3?${params}`, { headers: { "X-API-KEY": apiKey } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 120)}`);
  const json = (await res.json()) as { data?: OResult[]; status?: string };
  if (json.status === "Pending" || json.status === "Running") {
    if (attempt > 10) throw new Error("timed out");
    await sleep(5000);
    return fetchReviews(placeIds, apiKey, attempt + 1);
  }
  return json.data ?? [];
}

async function main() {
  const apiKey = process.env.OUTSCRAPER_API_KEY;
  if (!apiKey) { console.error("OUTSCRAPER_API_KEY not set"); process.exit(1); }

  const phuket = await db.select({ id: clinics.id, placeId: clinics.googlePlaceId })
    .from(clinics).where(eq(clinics.cityId, 2));
  const list = phuket.filter((c) => c.placeId) as { id: number; placeId: string }[];
  console.log(`Phuket clinics to fetch reviews for: ${list.length}`);

  const existing = await db.select({ rid: clinicReviews.googleReviewId }).from(clinicReviews);
  const seen = new Set(existing.map((r) => r.rid).filter(Boolean));
  const placeMap = new Map(list.map((c) => [c.placeId, c.id]));

  const BATCH = 20;
  let inserted = 0;
  for (let i = 0; i < list.length; i += BATCH) {
    const batch = list.slice(i, i + BATCH).map((c) => c.placeId);
    console.log(`Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(list.length / BATCH)} — ${batch.length}…`);
    let results: OResult[] = [];
    for (let a = 1; a <= 3; a++) {
      try { results = await fetchReviews(batch, apiKey); break; }
      catch (e) { console.error(`  attempt ${a}: ${(e as Error).message.slice(0, 90)}`); if (a < 3) await sleep(15000 * a); }
    }
    const toInsert: (typeof clinicReviews.$inferInsert)[] = [];
    for (const r of results) {
      const cid = placeMap.get(r.place_id);
      if (!cid) continue;
      for (const rev of r.reviews_data ?? []) {
        if (!rev.review_id || seen.has(rev.review_id)) continue;
        seen.add(rev.review_id);
        toInsert.push({ clinicId: cid, googleReviewId: rev.review_id, authorName: rev.author_title ?? "Anonymous", rating: rev.review_rating, text: rev.review_text ?? null, reviewDate: parseReviewDate(rev.review_datetime_utc) });
      }
    }
    for (let j = 0; j < toInsert.length; j += 50) await db.insert(clinicReviews).values(toInsert.slice(j, j + 50)).onConflictDoNothing();
    inserted += toInsert.length;
    console.log(`  +${toInsert.length} (total ${inserted})`);
    if (i + BATCH < list.length) await sleep(4000);
  }
  console.log(`\nDone. Inserted ${inserted} reviews for Phuket.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
