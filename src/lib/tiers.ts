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
