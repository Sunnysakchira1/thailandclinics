/**
 * Import curated Phuket wellness clinics → Turso (wellness-clinics / phuket).
 * Reads raw Outscraper merge (data/wellness_phuket_raw.json).
 *
 * Phuket is spa/GP-heavy, so the bar is TIGHTER than Bangkok: OPERATIONAL ·
 * state=Phuket · reviews>=20 · rating>=4.2 · NOT spa/derm/dental/etc · NOT
 * GP-noise (STI/cannabis/beauty-surgery/vet/pharmacy/resort/sauna) · MUST
 * carry an explicit medical-wellness signal (longevity, health check, IV,
 * anti-aging, functional, holistic/TCM). Idempotent: dedup by place_id + slug.
 *
 * Usage: npx tsx --env-file=.env.local scripts/import-wellness-phuket.ts [--dry-run]
 */
import fs from "fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { cities, categories, clinics } from "../src/lib/db/schema";
import { extractEnglishName, generateSlug, deduplicateSlug } from "../src/lib/utils/slugify";

const DRY = process.argv.includes("--dry-run");
const MIN_REVIEWS = 20;
const MIN_RATING = 4.2;

const client = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });
const db = drizzle(client, { schema: { cities, categories, clinics } });

const clean = (v: unknown): string | null => {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" || s.toLowerCase() === "none" ? null : s;
};
const jsonOrNull = (v: unknown): string | null => {
  if (v == null) return null;
  if (typeof v === "string") { try { JSON.parse(v); return v; } catch { return null; } }
  if (typeof v === "object") { try { return JSON.stringify(v); } catch { return null; } }
  return null;
};
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const normalizeHours = (v: unknown): string | null => {
  let obj: Record<string, unknown>;
  if (v == null) return null;
  if (typeof v === "string") { try { obj = JSON.parse(v); } catch { return null; } }
  else if (typeof v === "object") obj = v as Record<string, unknown>;
  else return null;
  const out: Record<string, string> = {};
  for (const day of DAYS) {
    const raw = obj[day];
    if (Array.isArray(raw)) out[day] = raw.filter(Boolean).join(", ") || "Closed";
    else if (typeof raw === "string" && raw.trim()) out[day] = raw.trim();
    else out[day] = "Closed";
  }
  return JSON.stringify(out);
};

const NOISE = /spa|massage|นวด|yoga|โยคะ|meditation|ผิวพรรณ|skin care|dermatolog|โรคผิวหนัง|ศัลยกรรม|plastic surgery|เสริมความงาม|กายภาพบำบัด|physical therapy|ทันตกรรม|dental|urolog|ปลูกผม|hair|ขายผลิตภัณฑ์|product|nail|ร้านทำเล็บ|wholesaler|ผู้ค้าส่ง/i;
const HARD_EXCLUDE = /กัญชา|cannabis|weed|โรคติดต่อทางเพศ|\bSTI\b|\bSTD\b|beauty and surgery|aesthetic|สัตว์|veterinar|pharmacy|ร้านขายยา|optical|แว่น|\bresort\b|sauna|ayurveda|retreat|anantara/i;
// Explicit medical-wellness signal. NOTE: deliberately excludes the too-generic
// เวชกรรม/"medical clinic", which would pull in every GP/walk-in clinic.
const WELLNESS = /wellness|longevity|anti-?ag(e)?ing|regenerat|\bIV\b|drip|vitamin|health ?(check|screen)|check-?up|ตรวจสุขภาพ|hormone|functional medicine|preventive|integrative|holistic|detox|\bNAD\b|ozone|ชะลอวัย|เวลเนส|acupuncture|ฝังเข็ม|chinese medicine|ยาจีน|แพทย์แผนจีน/i;

// Belongs elsewhere / not a clean wellness clinic — drop by place_id.
const EXCLUDE_PLACE_IDS = new Set<string>([
  "ChIJ7WlfHNMgRoIRJEUq7Lqz0GQ",  // Rawai Medical Clinic — general GP
  "ChIJWcvMyxUxUDARcReN-6HchNI",  // Siam Clinic Aesthetic & Wellness (Koh Kaew) — aesthetic → cosmetic
  "ChIJabY1QscxUDARz6Yqs0pPkqk",  // Siam Clinic Aesthetic & Wellness (Chalong) — aesthetic → cosmetic
  "ChIJh9Gf3Ds5UDARx36AgH4CkmY",  // Sole Mio Clinic — hotel-attached wellness
]);
// Fix broken name-extraction (parenthetical grabbed as the English name).
const SLUG_OVERRIDES: Record<string, string> = {
  "ChIJz8inXbExUDARZyh00TB7lFs": "tcm-house-clinic",  // "…TCM HOUSE CLINIC (Appointment Only)…"
};

async function main() {
  const raw: Record<string, unknown>[] = JSON.parse(fs.readFileSync("data/wellness_phuket_raw.json", "utf8"));
  console.log(`Loaded ${raw.length} raw places`);

  const sig = (r: Record<string, unknown>) => `${clean(r.name) ?? ""} ${clean(r.category) ?? clean(r.type) ?? ""}`;
  const filtered = raw.filter((r) => {
    if (clean(r.business_status) !== "OPERATIONAL") return false;
    if (!clean(r.state)?.toLowerCase().includes("phuket")) return false;
    if (EXCLUDE_PLACE_IDS.has(String(r.place_id))) return false;
    const cat = clean(r.category) ?? clean(r.type);
    if (cat && NOISE.test(cat)) return false;
    if (HARD_EXCLUDE.test(sig(r))) return false;
    if (!WELLNESS.test(sig(r))) return false;              // must be genuine wellness
    const reviews = parseInt(String(r.reviews ?? 0), 10) || 0;
    const rating = parseFloat(String(r.rating ?? 0)) || 0;
    return reviews >= MIN_REVIEWS && rating >= MIN_RATING;
  });
  console.log(`Passed medical-wellness bar: ${filtered.length}`);

  const [city] = await db.select().from(cities).where(eq(cities.slug, "phuket"));
  const [cat] = await db.select().from(categories).where(eq(categories.slug, "wellness-clinics"));
  if (!city || !cat) { console.error("Missing phuket city or wellness-clinics category"); process.exit(1); }

  const existing = await db.select({ slug: clinics.slug, placeId: clinics.googlePlaceId }).from(clinics);
  const usedSlugs = new Set(existing.map((r) => r.slug));
  const usedPlaceIds = new Set(existing.map((r) => r.placeId).filter(Boolean) as string[]);

  const toInsert: (typeof clinics.$inferInsert)[] = [];
  let skipDupe = 0;
  const wr = (R: number, v: number) => (v * R + 300 * 4.6) / (v + 300);
  filtered.sort((a, b) =>
    wr(parseFloat(String(b.rating)) || 0, parseInt(String(b.reviews), 10) || 0) -
    wr(parseFloat(String(a.rating)) || 0, parseInt(String(a.reviews), 10) || 0));

  for (const row of filtered) {
    const placeId = clean(row.place_id);
    if (placeId && usedPlaceIds.has(placeId)) { skipDupe++; continue; }
    const rawName = clean(row.name) ?? "";
    const nameEn = extractEnglishName(rawName);
    const nameTh = /[฀-๿]/.test(rawName) ? rawName : null;
    const baseSlug = (placeId && SLUG_OVERRIDES[placeId]) || generateSlug(rawName, nameEn, placeId ?? rawName);
    const slug = deduplicateSlug(baseSlug, usedSlugs, "phuket");
    usedSlugs.add(slug);
    if (placeId) usedPlaceIds.add(placeId);
    const rating = row.rating == null ? null : Math.round(parseFloat(String(row.rating)) * 10) / 10;
    const reviews = row.reviews == null ? null : parseInt(String(row.reviews), 10);
    toInsert.push({
      name: rawName, slug, cityId: city.id, categoryId: cat.id, nameEn, nameTh,
      district: clean(row.city), address: clean(row.address), postalCode: clean(row.postal_code),
      lat: parseFloat(String(row.latitude ?? 0)), lng: parseFloat(String(row.longitude ?? 0)),
      phone: clean(row.phone), website: clean(row.website), email: clean(row.email),
      googlePlaceId: placeId, googleRating: rating, googleReviewsCount: reviews,
      openingHours: normalizeHours(row.working_hours), about: jsonOrNull(row.about), photoUrl: clean(row.photo),
      englishSpeaking: false, nearBts: false, nearMrt: false, openWeekends: false, verified: false, featured: false,
    });
  }

  console.log(`Ready to insert: ${toInsert.length} | skipped (dupe): ${skipDupe}`);
  if (DRY) {
    toInsert.forEach((c) => console.log(`  ${(c.googleRating + "★").padEnd(6)} ${String(c.googleReviewsCount).padEnd(5)} ${c.slug}`));
    console.log("(dry run)"); return;
  }

  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const slice = toInsert.slice(i, i + BATCH);
    await db.insert(clinics).values(slice).onConflictDoNothing();
    inserted += slice.length;
  }
  console.log(`Inserted: ${inserted}`);
  const cnt = await client.execute({ sql: "SELECT COUNT(*) FROM clinics WHERE city_id = ?", args: [city.id] });
  await db.update(cities).set({ clinicCount: Number(cnt.rows[0][0]) }).where(eq(cities.id, city.id));
  console.log(`Phuket clinics now: ${cnt.rows[0][0]}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
