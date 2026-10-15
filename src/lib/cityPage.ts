/**
 * Pure helpers for the city landing page (src/app/[city]/page.tsx).
 * Dependency-free so they can be unit tested without the database.
 */
import { weightedRating } from "./ranking";
import { tierRank, type Tier } from "./tiers";

/* ─── Specialty block ordering ───────────────────────────────────── */
export type SortableEntry = {
  tier: Tier;
  topRated: boolean;
  featuredPosition: number | null;
  rating: number | null;
  reviews: number | null;
};

/** Premium first (by featured_position), then the Top-rated flag, then weighted rating. */
export function sortCityEntries<T extends SortableEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const aPrem = a.tier === "premium" ? 1 : 0;
    const bPrem = b.tier === "premium" ? 1 : 0;
    if (aPrem !== bPrem) return bPrem - aPrem;
    if (aPrem && bPrem) {
      const pos = (a.featuredPosition ?? 9999) - (b.featuredPosition ?? 9999);
      if (pos !== 0) return pos;
    }
    if (a.topRated !== b.topRated) return a.topRated ? -1 : 1;
    return (
      weightedRating(b.rating, b.reviews) - weightedRating(a.rating, a.reviews) ||
      (b.reviews ?? 0) - (a.reviews ?? 0) ||
      tierRank(b.tier) - tierRank(a.tier)
    );
  });
}

/* ─── Districts ──────────────────────────────────────────────────── */
const key = (s: string) => s.toLowerCase().replace(/[^a-z฀-๿]/g, "");

/** Spelling variants (romanised and Thai) → canonical district name, per city. */
const DISTRICT_ALIASES: Record<string, Record<string, string>> = {
  bangkok: {
    pathumwan: "Pathum Wan", patumwan: "Pathum Wan", "ปทุมวัน": "Pathum Wan",
    watthana: "Watthana", wattana: "Watthana", "ทวีวัฒนา": "Thawi Watthana",
    bangrak: "Bang Rak", mahapruettharambangrak: "Bang Rak",
    khlongtoei: "Khlong Toei", klongtoey: "Khlong Toei", klongtoei: "Khlong Toei", klongteoy: "Khlong Toei",
    klongteoi: "Khlong Toei", kongtoei: "Khlong Toei", khlongtoeinuea: "Khlong Toei", "เขตคลองด": "Khlong Toei",
    sathon: "Sathon", sathorn: "Sathon",
    bangkapi: "Bang Kapi",
    phrakhanong: "Phra Khanong", prakanong: "Phra Khanong", "พระโขนง": "Phra Khanong",
    dusit: "Dusit",
    chatuchak: "Chatuchak", "จตุจักร": "Chatuchak",
    wangthonglang: "Wang Thonglang", "วังทองหลาง": "Wang Thonglang",
    ladyao: "Chatuchak", "ลาดยาว": "Chatuchak", "เขตลาดยาว": "Chatuchak",
    "ลาดพร้าว": "Lat Phrao", "คลองสามวา": "Khlong Sam Wa", "คลองสาน": "Khlong San",
    "บางคอแหลม": "Bang Kho Laem", "ราษฎร์บูรณะ": "Rat Burana", "เขตทวีวัฒนา": "Thawi Watthana",
    "ตำบลแขวงพญาไท": "Phaya Thai", khlongtan: "Khlong Toei",
  },
  phuket: {
    mueangphuket: "Mueang Phuket", mueang: "Mueang Phuket", muang: "Mueang Phuket", meung: "Mueang Phuket",
    mung: "Mueang Phuket", "เมือง": "Mueang Phuket", "อเมือง": "Mueang Phuket",
    thalang: "Thalang", bangtao: "Thalang",
    kathu: "Kathu", patong: "Kathu",
  },
};

/** Values that name the whole city or nothing useful — never shown as a district. */
const NOT_A_DISTRICT = new Set(["subdistrict", "phuket", "ภูเก็ต", "bangkok"]);

/**
 * Canonical district name for display, or null when the raw value can't be
 * placed (Thai-script with no alias, or a city-level value like "Phuket").
 */
export function normaliseDistrict(raw: string, citySlug: string): string | null {
  const cleaned = raw
    .replace(/,\s*bangkok.*$/i, "")
    .replace(/\s+district$/i, "")
    .replace(/^amphoe\s+/i, "")
    .trim();
  const k = key(cleaned);
  if (!k || NOT_A_DISTRICT.has(k)) return null;
  const alias = DISTRICT_ALIASES[citySlug]?.[k];
  if (alias) return alias;
  if (/[฀-๿]/.test(cleaned)) return null;
  return cleaned;
}

/** Merge spelling variants and return the top `n` districts by clinic count. */
export function topDistricts(
  rows: { district: string; count: number }[],
  citySlug: string,
  n: number,
): { district: string; count: number }[] {
  const merged = new Map<string, number>();
  for (const r of rows) {
    const d = normaliseDistrict(r.district, citySlug);
    if (!d) continue;
    merged.set(d, (merged.get(d) ?? 0) + r.count);
  }
  return [...merged]
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count || a.district.localeCompare(b.district))
    .slice(0, n);
}

/* ─── Prices ─────────────────────────────────────────────────────── */
export const baht = (n: number) => `฿${n.toLocaleString("en-GB")}`;

/** "฿170–250" style range; a single figure when min === max. */
export function bahtRange(min: number, max: number): string {
  return min === max ? baht(min) : `${baht(min)}–${max.toLocaleString("en-GB")}`;
}
