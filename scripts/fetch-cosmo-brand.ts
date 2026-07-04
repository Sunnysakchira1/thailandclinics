/**
 * Fetch all Cosmo Clinic (cosmobeautyclinic.com) Bangkok branches via Outscraper.
 * Runs several query variants, merges + dedups by place_id → raw JSON.
 *
 * Usage: npx tsx --env-file=.env.local scripts/fetch-cosmo-brand.ts
 * Env: OUTSCRAPER_API_KEY
 * Out: data/cosmo_brand_raw.json
 */
import { writeFileSync } from "fs";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const QUERIES = [
  "Cosmo Clinic Bangkok",
  "The Cosmo Clinic Bangkok",
  "Cosmo Beauty Clinic Bangkok",
  "The Cosmo Clinic Tha Phra",
  "Cosmo Clinic Thapra",
  "The Cosmo Clinic MRT Tha Phra",
];
const LIMIT = "60";
const OUT = "data/cosmo_brand_raw.json";

async function runQuery(apiKey: string, query: string): Promise<any[]> {
  const params = new URLSearchParams();
  params.append("query", query);
  params.set("limit", LIMIT);
  params.set("language", "en");
  params.set("region", "TH");
  params.set("async", "true");

  const startUrl = `https://api.app.outscraper.com/maps/search-v3?${params}`;
  console.log(`\nSubmitting: "${query}"…`);
  const startRes = await fetch(startUrl, { headers: { "X-API-KEY": apiKey } });
  if (startRes.status !== 202 && !startRes.ok) {
    console.error(`  HTTP ${startRes.status}: ${(await startRes.text()).slice(0, 200)}`);
    return [];
  }
  const start = (await startRes.json()) as { id?: string; results_location?: string };
  const loc = start.results_location;
  if (!loc) { console.error("  No results_location", start); return []; }
  console.log(`  Job ${start.id} polling…`);

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

  const byId = new Map<string, any>();
  let total = 0;
  for (const q of QUERIES) {
    const data = await runQuery(apiKey, q);
    total += data.length;
    for (const row of data) {
      const pid = row.place_id;
      if (pid && !byId.has(pid)) byId.set(pid, row);
    }
  }

  // Keep only genuine Cosmo branches: name or website matches cosmo.
  const merged = [...byId.values()].filter((r) => {
    const name = (r.name || "").toLowerCase();
    const site = (r.website || r.site || "").toLowerCase();
    return name.includes("cosmo") || site.includes("cosmobeauty") || site.includes("cosmoclinic");
  });

  writeFileSync(OUT, JSON.stringify(merged, null, 2));
  console.log(`\n${total} raw across ${QUERIES.length} queries → ${byId.size} unique → ${merged.length} Cosmo matches → ${OUT}`);
  merged.forEach((r) =>
    console.log(`  ${r.rating}★ ${r.reviews}rev  ${r.business_status}  ${r.name}  [${r.city}]  ${r.website || r.site || ""}`)
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
