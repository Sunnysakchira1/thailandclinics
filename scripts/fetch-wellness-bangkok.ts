/**
 * Research fetch: Bangkok wellness clinics via Outscraper Maps Search (async).
 * Multiple query terms, merged + deduped by place_id → raw JSON.
 *
 * Usage: npx tsx --env-file=.env.local scripts/fetch-dental-bangkok.ts
 * Env: OUTSCRAPER_API_KEY
 * Out: data/wellness_bangkok_raw.json
 */
import { writeFileSync } from "fs";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const QUERIES = [
  "wellness clinic Bangkok",
  "IV drip therapy clinic Bangkok",
  "health screening clinic Bangkok",
  "anti-aging longevity clinic Bangkok",
  "functional medicine clinic Bangkok",
];
const LIMIT = "200";
const OUT = "data/wellness_bangkok_raw.json";

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
  console.log(`  Job ${start.id} polling…`);

  for (let attempt = 1; attempt <= 90; attempt++) {
    await sleep(5000);
    const r = await fetch(loc, { headers: { "X-API-KEY": apiKey } });
    if (!r.ok) { console.log(`    poll ${attempt}: HTTP ${r.status}`); continue; }
    const j = (await r.json()) as { status?: string; data?: any[][] };
    if (j.status === "Success") {
      const data = (j.data ?? []).flat();
      console.log(`  ✓ ${data.length} results`);
      return data;
    }
    if (attempt % 6 === 0) console.log(`    poll ${attempt}: ${j.status}`);
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
      if (pid && !byPlaceId.has(pid)) byPlaceId.set(pid, row);
    }
  }

  const merged = [...byPlaceId.values()];
  writeFileSync(OUT, JSON.stringify(merged, null, 2));
  console.log(`\n${totalRaw} raw rows across ${QUERIES.length} queries → ${merged.length} unique places → ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
