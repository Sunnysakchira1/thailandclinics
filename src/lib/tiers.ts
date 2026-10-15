export type Tier = "basic" | "pro" | "premium";

export function normaliseTier(v: unknown): Tier {
  return v === "pro" || v === "premium" ? v : "basic";
}

/** Branches inherit their brand's plan; the higher of the two wins. */
export function effectiveTier(clinicTier: unknown, brandTier?: unknown): Tier {
  const a = normaliseTier(clinicTier);
  const b = normaliseTier(brandTier);
  return tierRank(b) > tierRank(a) ? b : a;
}

/** Strict flag check: only 1 / true (as stored by SQLite or Drizzle boolean mode) count. */
function isFlagSet(v: unknown): boolean {
  return v === true || v === 1;
}

/**
 * Top rated is a manual editorial flag — our editors' pick, never sold.
 * Independent of tier and of ratings. Branches inherit their brand's flag.
 */
export function isTopRated(clinicFlag: unknown, brandFlag?: unknown): boolean {
  return isFlagSet(clinicFlag) || isFlagSet(brandFlag);
}

export function tierRank(t: Tier): number {
  return t === "premium" ? 2 : t === "pro" ? 1 : 0;
}

/** Owner rule: at most this many Top-rated entries per city+category listing. */
export const TOP_RATED_CAP = 5;

/**
 * Build-time guard for the Top-rated cap. `listing` is "city/category";
 * `key` identifies the listing entry (brand slug for branches, so a brand counts once).
 * Throws, naming every listing over the cap and its entries, so the build fails loudly.
 */
export function assertTopRatedCap(
  entries: { listing: string; key: string; topRated: boolean }[],
  max = TOP_RATED_CAP,
): void {
  const byListing = new Map<string, Set<string>>();
  for (const e of entries) {
    if (!e.topRated) continue;
    const keys = byListing.get(e.listing) ?? new Set<string>();
    keys.add(e.key);
    byListing.set(e.listing, keys);
  }
  const over = [...byListing].filter(([, keys]) => keys.size > max);
  if (over.length === 0) return;
  const detail = over
    .map(([listing, keys]) => `${listing} has ${keys.size} Top-rated entries (max ${max}): ${[...keys].join(", ")}`)
    .join("; ");
  throw new Error(`Top-rated cap exceeded — ${detail}. Unflag entries in clinics.top_rated / brands.top_rated.`);
}
