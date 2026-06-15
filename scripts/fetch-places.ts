/**
 * Fetch Google Maps places via Outscraper Maps Search (async) → JSON file.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/fetch-places.ts --query "physiotherapy clinic Phuket" --limit 300 --out data/physio_data_phuket.json
 *
 * Env: OUTSCRAPER_API_KEY
 */
import { writeFileSync } from "fs";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function arg(name: string, def?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  if (def !== undefined) return def;
  throw new Error(`missing --${name}`);
}

async function main() {
  const apiKey = process.env.OUTSCRAPER_API_KEY;
  if (!apiKey) { console.error("OUTSCRAPER_API_KEY not set"); process.exit(1); }

  const query = arg("query");
  const limit = arg("limit", "300");
  const out = arg("out");

  const params = new URLSearchParams();
  params.append("query", query);
  params.set("limit", limit);
  params.set("language", "en");
  params.set("region", "TH");
  params.set("async", "true");

  const startUrl = `https://api.app.outscraper.com/maps/search-v3?${params}`;
  console.log(`Submitting: "${query}" (limit ${limit})…`);
  const startRes = await fetch(startUrl, { headers: { "X-API-KEY": apiKey } });
  if (startRes.status !== 202 && !startRes.ok) {
    console.error(`HTTP ${startRes.status}: ${(await startRes.text()).slice(0, 200)}`);
    process.exit(1);
  }
  const start = (await startRes.json()) as { id?: string; status?: string; results_location?: string };
  const loc = start.results_location;
  if (!loc) { console.error("No results_location returned", start); process.exit(1); }
  console.log(`Job ${start.id} submitted, polling…`);

  let data: any[] = [];
  for (let attempt = 1; attempt <= 60; attempt++) {
    await sleep(5000);
    const r = await fetch(loc, { headers: { "X-API-KEY": apiKey } });
    if (!r.ok) { console.log(`  poll ${attempt}: HTTP ${r.status}`); continue; }
    const j = (await r.json()) as { status?: string; data?: any[][] };
    if (j.status === "Success") {
      data = (j.data ?? []).flat();
      break;
    }
    console.log(`  poll ${attempt}: ${j.status}`);
  }

  if (!data.length) { console.error("No data returned (timed out or empty)"); process.exit(1); }

  writeFileSync(out, JSON.stringify(data, null, 2));
  console.log(`\nFetched ${data.length} places → ${out}`);
  // quick peek at fields on first record
  console.log("Sample fields:", Object.keys(data[0]).filter((k) =>
    ["name", "place_id", "rating", "reviews", "full_address", "city", "state", "business_status", "photo", "phone", "site"].includes(k)
  ).join(", "));
}

main().catch((e) => { console.error(e); process.exit(1); });
