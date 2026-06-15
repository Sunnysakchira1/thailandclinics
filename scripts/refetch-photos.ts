/**
 * Re-fetch fresh Google photo URLs for clinics that currently have NO photo
 * (the placeholders), via Outscraper Google Maps Search REST API.
 *
 * Writes the fresh remote URL into photo_url. Then run
 * scripts/download-clinic-photos.ts to self-host them permanently.
 *
 * Usage: npx tsx --env-file=.env.local scripts/refetch-photos.ts
 * Env:   TURSO_URL, TURSO_AUTH_TOKEN, OUTSCRAPER_API_KEY
 */
import { createClient } from "@libsql/client";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Place {
  place_id?: string;
  photo?: string | null;
}

async function searchPlaces(placeIds: string[], apiKey: string, attempt = 1): Promise<Place[]> {
  const params = new URLSearchParams();
  placeIds.forEach((id) => params.append("query", id));
  params.set("async", "false");
  params.set("fields", "place_id,photo"); // keep payload (and cost) minimal

  const url = `https://api.app.outscraper.com/maps/search-v3?${params}`;
  const res = await fetch(url, { headers: { "X-API-KEY": apiKey } });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
  }
  const json = (await res.json()) as { data?: Place[][]; status?: string };

  if (json.status === "Pending" || json.status === "Running") {
    if (attempt > 10) throw new Error("Job timed out after 10 polls");
    console.log(`    pending, polling in 5s (attempt ${attempt})…`);
    await sleep(5000);
    return searchPlaces(placeIds, apiKey, attempt + 1);
  }

  // data is an array-per-query; flatten to the first place of each query
  return (json.data ?? []).flat();
}

async function main() {
  const apiKey = process.env.OUTSCRAPER_API_KEY;
  if (!apiKey) { console.error("OUTSCRAPER_API_KEY not set"); process.exit(1); }

  const c = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });

  const rows = (await c.execute(
    "SELECT id, google_place_id FROM clinics WHERE (photo_url IS NULL OR photo_url = '') AND google_place_id IS NOT NULL ORDER BY id"
  )).rows.map((r) => ({ id: Number(r[0]), placeId: String(r[1]) }));

  console.log(`Placeholder clinics to re-fetch: ${rows.length}`);
  const placeMap = new Map(rows.map((r) => [r.placeId, r.id]));

  const BATCH = 20;
  let withPhoto = 0;
  let noPhoto = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map((r) => r.placeId);
    const num = Math.floor(i / BATCH) + 1;
    const total = Math.ceil(rows.length / BATCH);
    console.log(`Batch ${num}/${total} — ${batch.length} places…`);

    let places: Place[] = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { places = await searchPlaces(batch, apiKey); break; }
      catch (e) {
        console.error(`  attempt ${attempt}: ${(e as Error).message.slice(0, 90)}`);
        if (attempt < 3) await sleep(12000 * attempt);
      }
    }

    for (const p of places) {
      const id = p.place_id ? placeMap.get(p.place_id) : undefined;
      if (!id) continue;
      const photo = (p.photo || "").trim();
      if (photo && /^https?:\/\//.test(photo)) {
        await c.execute({
          sql: "UPDATE clinics SET photo_url = ?, updated_at = ? WHERE id = ?",
          args: [photo, new Date().toISOString().slice(0, 10), id],
        });
        withPhoto++;
      } else {
        noPhoto++;
      }
    }
    if (i + BATCH < rows.length) await sleep(4000);
  }

  console.log(`\nFresh photo URL found: ${withPhoto}`);
  console.log(`Still no photo:        ${noPhoto}`);
  console.log(`\nNext: npx tsx --env-file=.env.local scripts/download-clinic-photos.ts`);
}

main().catch((e) => { console.error(e); process.exit(1); });
