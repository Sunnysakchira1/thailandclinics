export type Tier = "basic" | "pro" | "premium";

export const TOP_RATED_MIN_RATING = 4.8;
export const TOP_RATED_MIN_REVIEWS = 50;

export function normaliseTier(v: unknown): Tier {
  return v === "pro" || v === "premium" ? v : "basic";
}

/** Branches inherit their brand's plan; the higher of the two wins. */
export function effectiveTier(clinicTier: unknown, brandTier?: unknown): Tier {
  const a = normaliseTier(clinicTier);
  const b = normaliseTier(brandTier);
  return tierRank(b) > tierRank(a) ? b : a;
}

/** Earned, never sold: independent of tier. */
export function isTopRated(rating: number | null | undefined, reviews: number | null | undefined): boolean {
  return (rating ?? 0) >= TOP_RATED_MIN_RATING && (reviews ?? 0) >= TOP_RATED_MIN_REVIEWS;
}

export function tierRank(t: Tier): number {
  return t === "premium" ? 2 : t === "pro" ? 1 : 0;
}
