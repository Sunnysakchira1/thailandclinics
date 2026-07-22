/**
 * Research fetch: Phuket wellness clinics via Outscraper Maps Search (async).
 * Multiple query terms, merged + deduped by place_id → raw JSON, then applies
 * the SAME medical-wellness curation bar as import-wellness-bangkok.ts to
 * report viability (how many genuine medical-wellness clinics survive the
 * spa/massage filter) before we commit to enrichment.
 * Usage: npx tsx --env-file=.env.local scripts/fetch-wellness-phuket.ts
 */
import fs from "fs";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const QUERIES = [
  "wellness clinic Phuket",
  "IV drip therapy clinic Phuket",
  "health screening clinic Phuket",
  "anti-aging longevity clinic Phuket",
  "functional medicine clinic Phuket",
  "medical clinic Phuket",
];
const LIMIT = "200";
const OUT = "data/wellness_phuket_raw.json";

// Same filter as import-wellness-bangkok.ts
const NOISE = /spa|massage|นวด|yoga|โยคะ|meditation|ผิวพรรณ|skin care|dermatolog|โรคผิวหนัง|ศัลยกรรม|plastic surgery|เสริมความงาม|กายภาพบำบัด|physical therapy|ทันตกรรม|dental|ทางเดินปัสสาวะ|urolog|ปลูกผม|hair|ขายผลิตภัณฑ์|product|nail|ร้านทำเล็บ|wholesaler|ผู้ค้าส่ง/i;
const NAME_NOISE = /med ?spa|เมดสปา|\bspa\b|dermatolog|aesthetic|aestheta|ผิวพรรณ/i;
const MIN_REVIEWS = 20, MIN_RATING = 4.2;
const clean = (v: unknown): string | null => (v == null ? null : String(v).trim() || null);

async function runQuery(apiKey: string, query: string): Promise<any[]> {
  const params = new URLSearchParams();
  params.append("query", query);
  params.set("limit", LIMIT);
  params.set("language", "en");
  params.set("region", "TH");
  params.set("async", "true");
  const startRes = await fetch(`https://api.app.outscraper.com/maps/search-v3?${params}`, { headers: { "X-API-KEY": apiKey } });
  if (startRes.status !== 202 && !startRes.ok) { console.error(`  HTTP ${startRes.status}`); return []; }
  const start = (await startRes.json()) as { id?: string; results_location?: string };
  const loc = start.results_location;
  if (!loc) { console.error("  no results_location"); return []; }
  console.log(`  "${query}" → job ${start.id} polling…`);
  for (let attempt = 1; attempt <= 90; attempt++) {
    await sleep(5000);
    const r = await fetch(loc, { headers: { "X-API-KEY": apiKey } });
    if (!r.ok) continue;
    const j = (await r.json()) as { status?: string; data?: any[][] };
    if (j.status === "Success") { const data = (j.data ?? []).flat(); console.log(`  ✓ ${data.length} results`); return data; }
  }
  console.error("  timed out"); return [];
}

async function main() {
  const apiKey = process.env.OUTSCRAPER_API_KEY;
  if (!apiKey) { console.error("OUTSCRAPER_API_KEY not set"); process.exit(1); }
  const byPlaceId = new Map<string, any>();
  for (const q of QUERIES) { for (const row of await runQuery(apiKey, q)) { if (row.place_id) byPlaceId.set(row.place_id, row); } }
  const merged = [...byPlaceId.values()];
  fs.writeFileSync(OUT, JSON.stringify(merged, null, 2));
  console.log(`\n${merged.length} unique places → ${OUT}`);

  // Viability: apply the medical-wellness bar
  const isJunk = (cat: string | null) => !!cat && NOISE.test(cat);
  const wr = (r: number, v: number) => (v * r + 300 * 4.6) / (v + 300);
  const passed = merged.filter((r) => {
    if (clean(r.business_status) !== "OPERATIONAL") return false;
    if (!clean(r.state)?.toLowerCase().includes("phuket")) return false;
    if (isJunk(clean(r.category) ?? clean(r.type))) return false;
    if (NAME_NOISE.test(clean(r.name) ?? "")) return false;
    const reviews = parseInt(String(r.reviews ?? 0), 10) || 0;
    const rating = parseFloat(String(r.rating ?? 0)) || 0;
    return reviews >= MIN_REVIEWS && rating >= MIN_RATING;
  });
  passed.sort((a, b) => wr(+b.rating || 0, +b.reviews || 0) - wr(+a.rating || 0, +a.reviews || 0));
  console.log(`\n════ VIABILITY: ${passed.length} genuine medical-wellness clinics pass the bar ════\n`);
  passed.slice(0, 15).forEach((r, i) =>
    console.log(`${i + 1}. ${r.name}  —  ${r.rating}★ (${r.reviews})  [${clean(r.category) ?? clean(r.type)}]  ${clean(r.city) ?? ""}`));
}
main();
