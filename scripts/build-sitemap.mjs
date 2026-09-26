// Segmented XML sitemap generator. Runs as `postbuild` against the static
// export in ./out. Replaces next-sitemap.
//
// Rules (see docs/seo/indexation-rules.md):
//   - A URL is listed ONLY if its built HTML has a self-referencing canonical
//     and no robots noindex. Indexation decisions made in page metadata are
//     therefore enforced here automatically — no separate exclude list to drift.
//   - lastmod is emitted only when we hold a real content date:
//       clinic / branch      → max(clinics.updated_at, review_summary_updated_at)
//       brand hub            → max over the brand row and its branches
//       listing / city / category landing → max over the clinics it lists
//       blog / guide         → Article dateModified in the built page
//     Pages with no real date (home, about, terms…) get no lastmod at all.
//     Never use the build time.
//
// Output: out/sitemap.xml (index) + out/sitemap-{core,listings,clinics,editorial}.xml

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

// Local builds: pick up .env.local (Cloudflare injects env vars directly).
if (!process.env.TURSO_URL && fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const OUT = path.resolve("out");
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://thailand-clinics.com").replace(/\/$/, "");
const CITIES = new Set(["bangkok", "phuket", "chiang-mai", "pattaya"]);

/* ─── 1. Collect built pages ─────────────────────────────────────── */
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "_next") walk(p, acc); }
    else if (e.name === "index.html") acc.push(p);
  }
  return acc;
}

const pages = [];
const skipped = [];
for (const file of walk(OUT)) {
  const rel = path.relative(OUT, path.dirname(file)).split(path.sep).join("/");
  const urlPath = rel === "" ? "/" : `/${rel}/`;
  const html = fs.readFileSync(file, "utf8");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
  const selfCanonical = canonical && new URL(canonical, SITE).pathname === urlPath;
  if (!selfCanonical || noindex) {
    skipped.push(`${urlPath} (${noindex ? "noindex" : canonical ? "canonicalised elsewhere" : "no canonical"})`);
    continue;
  }
  const articleModified = html.match(/"dateModified":"(\d{4}-\d{2}-\d{2})/)?.[1];
  pages.push({ urlPath, articleModified });
}

/* ─── 2. Real content dates from the database ────────────────────── */
const day = (s) => (s ? String(s).slice(0, 10) : null);
const max = (...ds) => ds.filter(Boolean).sort().at(-1) ?? null;

const dates = new Map(); // urlPath → YYYY-MM-DD
const bump = (key, d) => { if (d) dates.set(key, max(dates.get(key), d)); };

if (process.env.TURSO_URL) {
  const db = createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  const { rows } = await db.execute(`
    SELECT c.slug, c.branch_slug, c.updated_at, c.review_summary_updated_at,
           ci.slug AS city, ca.slug AS category,
           b.slug AS brand, b.updated_at AS brand_updated_at
    FROM clinics c
    JOIN cities ci     ON ci.id = c.city_id
    JOIN categories ca ON ca.id = c.category_id
    LEFT JOIN brands b ON b.id = c.brand_id`);
  for (const r of rows) {
    const d = max(day(r.updated_at), day(r.review_summary_updated_at));
    const listing = `/${r.city}/${r.category}/`;
    if (r.brand && r.branch_slug) {
      bump(`${listing}${r.brand}/${r.branch_slug}/`, d);
      bump(`${listing}${r.brand}/`, max(d, day(r.brand_updated_at)));
    } else {
      bump(`${listing}${r.slug}/`, d);
    }
    bump(listing, d);
    bump(`/${r.city}/`, d);
    bump(`/${r.category}/`, d);
  }
} else {
  console.warn("[sitemap] TURSO_URL not set — clinic/listing lastmod omitted");
}

/* ─── 3. Segment ─────────────────────────────────────────────────── */
function segmentOf(p) {
  const parts = p.split("/").filter(Boolean);
  if (parts[0] === "blog" || parts[0] === "guides") return "editorial";
  if (CITIES.has(parts[0])) {
    if (parts.length === 2) return "listings";
    if (parts.length >= 3) return "clinics";
  }
  return "core"; // home, city hubs, category landings, static pages
}

// Priority/changefreq per CLAUDE.md. Google ignores both; kept for other engines.
function hints(p, seg) {
  const depth = p.split("/").filter(Boolean).length;
  if (p === "/") return [1.0, "weekly"];
  if (seg === "editorial") return [0.7, "monthly"];
  if (seg === "clinics") return [0.8, "monthly"];
  if (seg === "listings") return [0.9, "weekly"];
  if (depth === 1 && (CITIES.has(p.slice(1, -1)) || p.endsWith("-clinics/"))) return [0.9, "weekly"];
  return [0.5, "yearly"];
}

const segments = { core: [], listings: [], clinics: [], editorial: [] };
for (const { urlPath, articleModified } of pages) {
  const seg = segmentOf(urlPath);
  const lastmod = seg === "editorial" ? articleModified ?? null : dates.get(urlPath) ?? null;
  segments[seg].push({ urlPath, lastmod, hints: hints(urlPath, seg) });
}

/* ─── 4. Write ───────────────────────────────────────────────────── */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const index = [];
for (const [name, entries] of Object.entries(segments)) {
  if (!entries.length) continue;
  entries.sort((a, b) => a.urlPath.localeCompare(b.urlPath));
  const body = entries.map(({ urlPath, lastmod, hints: [pr, cf] }) =>
    `<url><loc>${esc(SITE + urlPath)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>${cf}</changefreq><priority>${pr.toFixed(1)}</priority></url>`
  ).join("\n");
  const file = `sitemap-${name}.xml`;
  fs.writeFileSync(path.join(OUT, file),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
  const segLastmod = max(...entries.map((e) => e.lastmod));
  index.push(`<sitemap><loc>${SITE}/${file}</loc>${segLastmod ? `<lastmod>${segLastmod}</lastmod>` : ""}</sitemap>`);
  console.log(`[sitemap] ${file}: ${entries.length} URLs`);
}
fs.writeFileSync(path.join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${index.join("\n")}\n</sitemapindex>\n`);
console.log(`[sitemap] skipped ${skipped.length}: ${skipped.join(", ")}`);
