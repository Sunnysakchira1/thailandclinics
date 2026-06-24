/**
 * Detect candidate multi-branch brands for a city+category → review JSON.
 * Usage: npx tsx --env-file=.env.local scripts/detect-brands.ts --city bangkok --category cosmetic-clinics --raw data/cosmetic_bangkok_raw.json
 * Output: data/brand-clusters-<city>-<category>.json  (then human-edit before apply)
 */
import fs from "fs";
import { createClient } from "@libsql/client";

const arg = (n: string, d?: string) => {
  const i = process.argv.indexOf(`--${n}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  if (d !== undefined) return d;
  throw new Error(`missing --${n}`);
};

const STOP = ["clinic","clinics","bangkok","คลินิก","สาขา","branch","co","ltd","the","by","centre","center","khlinik"];
const KNOWN_DISTRICT_HINTS = ["siam","silom","sathon","sathorn","thonglor","thong lo","asok","asoke","pinklao","bangkae","bang kae","ekkamai","ari","ratchada","emquartier","emporium","central"];

const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9ก-๙ ]/g, " ").replace(/\s+/g, " ").trim();
const domain = (url: string | null) => { try { return url ? new URL(url).hostname.replace(/^www\./, "") : null; } catch { return null; } };
const brandKey = (name: string) => norm(name).split(" ").filter(Boolean).slice(0, 2).join(" ");
const slugify = (s: string) => norm(s).replace(/[ก-๙]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

async function main() {
  const city = arg("city"), category = arg("category");
  const rawPath = arg("raw", "");
  const c = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });

  const rows = (await c.execute({
    sql: `SELECT cl.slug, COALESCE(cl.name_en, cl.name) disp, cl.name, cl.district, cl.lat, cl.lng,
                 cl.website, cl.google_reviews_count reviews
          FROM clinics cl JOIN cities ci ON ci.id=cl.city_id JOIN categories ca ON ca.id=cl.category_id
          WHERE ci.slug=? AND ca.slug=?`,
    args: [city, category],
  })).rows as any[];

  // optional owner signal from raw export
  const ownerBySlugName: Record<string, string> = {};
  if (rawPath && fs.existsSync(rawPath)) {
    const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
    for (const r of raw) if (r.owner_id) ownerBySlugName[norm(r.name || "")] = String(r.owner_id);
  }

  // cluster by brandKey, then merge clusters sharing a website domain
  const byKey: Record<string, any[]> = {};
  for (const r of rows) {
    const k = brandKey(r.disp);
    if (!k) continue;
    (byKey[k] ||= []).push(r);
  }

  const clusters = Object.entries(byKey)
    .filter(([, m]) => m.length >= 2)
    .map(([key, members]) => {
      // confidence: shared domain or owner across members raises it
      const domains = new Set(members.map(m => domain(m.website)).filter(Boolean));
      const distinctCoords = new Set(members.map(m => `${m.lat.toFixed(3)},${m.lng.toFixed(3)}`));
      const confidence = (domains.size === 1 ? 0.5 : 0.2) + (distinctCoords.size === members.length ? 0.4 : 0.1)
                         + (members.length >= 3 ? 0.1 : 0);
      const brandName = members.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))[0].disp
        .replace(/\s*[-–|:].*$/, "").trim();
      return {
        name: brandName,
        slug: slugify(brandName),
        website: [...domains][0] ? `https://${[...domains][0]}` : null,
        confidence: Math.min(1, Number(confidence.toFixed(2))),
        members: members.map(m => {
          // propose branch slug from district, else trailing words of name
          const distHint = KNOWN_DISTRICT_HINTS.find(h => norm(m.disp).includes(h) || norm(m.district || "").includes(h));
          const tail = norm(m.disp).split(" ").filter(w => !STOP.includes(w)).slice(2).join("-");
          const proposed = slugify(distHint || tail || m.district || "main");
          return { clinicSlug: m.slug, name: m.disp, district: m.district, lat: m.lat, lng: m.lng,
                   reviews: m.reviews, proposedBranchSlug: proposed || "main" };
        }),
      };
    })
    .sort((a, b) => b.members.length - a.members.length);

  const out = `data/brand-clusters-${city}-${category}.json`;
  fs.writeFileSync(out, JSON.stringify(clusters, null, 2));
  console.log(`Wrote ${clusters.length} candidate brands (${clusters.reduce((s, c) => s + c.members.length, 0)} branches) → ${out}`);
  console.log("⚠️  REVIEW + EDIT this file before running apply-brands.ts (fix names, slugs, branch slugs, false merges).");
}
main().catch(e => { console.error(e); process.exit(1); });
