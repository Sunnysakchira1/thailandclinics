/**
 * Research fetch: Bangkok IVF / fertility clinics via Outscraper Maps Search (async).
 * Runs several query terms, merges, dedups by place_id → one raw JSON file.
 *
 * Usage: npx tsx --env-file=.env.local scripts/fetch-fertility-bangkok.ts
 * Env: OUTSCRAPER_API_KEY
 * Out: data/fertility_bangkok_raw.json
 */
import { writeFileSync } from "fs";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const QUERIES = [
  "IVF clinic Bangkok",
  "fertility clinic Bangkok",
  "fertility center Bangkok",
  "IVF center Bangkok",
  "reproductive medicine clinic Bangkok",
];
const LIMIT = "120";
const OUT = "data/fertility_bangkok_raw.json";

async function runQuery(apiKey: string, query: string): Promise<any[]> {
  const params = new URLSearchParams();
  params.append("query", query);
  params.set("limit", LIMIT);
  params.set("language", "en");
  params.set("region", "TH");
  params.set("async", "true");

  const startUrl = `https://api.app.outscraper.com/maps/search-v3?${params}`;
  console.log(`\nSubmitting: "${query}" (limit ${LIMIT})…`);
  const startRes = await fetch(startUrl, { headers: { "X-API-KEY": apiKey } });
  if (startRes.status !== 202 && !startRes.ok) {
    console.error(`  HTTP ${startRes.status}: ${(await startRes.text()).slice(0, 200)}`);
    return [];
  }
  const start = (await startRes.json()) as { id?: string; results_location?: string };
  const loc = start.results_location;
  if (!loc) { console.error("  No results_location", start); return []; }
  console.log(`  Job ${start.id} submitted, polling…`);

  for (let attempt = 1; attempt <= 60; attempt++) {
    await sleep(5000);
    const r = await fetch(loc, { headers: { "X-API-KEY": apiKey } });
    if (!r.ok) { console.log(`    poll ${attempt}: HTTP ${r.status}`); continue; }
    const j = (await r.json()) as { status?: string; data?: any[][] };
    if (j.status === "Success") {
      const data = (j.data ?? []).flat();
      console.log(`  ✓ ${data.length} results`);
      return data;
    }
    console.log(`    poll ${attempt}: ${j.status}`);
  }
  console.error("  timed out");
  return [];
}

async function main() {
  const apiKey = process.env.OUTSCRAPER_API_KEY;
  if (!apiKey) { console.error("OUTSCRAPER_API_KEY not set"); process.exit(1); }

  const byPlaceId = new Map<string, any>();
  let totalRaw = 0;
  for (const q of QUERIES) {
    const data = await runQuery(apiKey, q);
    totalRaw += data.length;
    for (const row of data) {
      const pid = row.place_id;
      if (!pid) continue;
      if (!byPlaceId.has(pid)) byPlaceId.set(pid, row);
    }
  }

  const merged = [...byPlaceId.values()];
  writeFileSync(OUT, JSON.stringify(merged, null, 2));
  console.log(`\n${totalRaw} raw rows across ${QUERIES.length} queries → ${merged.length} unique places → ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
