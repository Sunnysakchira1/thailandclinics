/**
 * Clinic ranking — single source of truth.
 *
 * Volume-aware weighted rating (IMDb-style):  WR = (v·R + m·C) / (v + m)
 * A clinic must earn its raw rating with review volume, so a heavily-reviewed
 * 4.9★ outranks a tiny-sample 5.0★. Used by EVERY ranking surface (the listing
 * client sort and the SQL "top clinics" queries) so ordering is identical
 * across all cities and clinic types (physio, dental, cosmetic, wellness…).
 *
 * This module is intentionally dependency-free (no drizzle) so it is safe to
 * import into client components. queries.ts builds the equivalent SQL ORDER BY
 * from the same WR_BASELINE / WR_WEIGHT constants.
 */

export const WR_BASELINE = 4.6;   // C — prior/baseline rating
export const WR_WEIGHT   = 300;   // m — reviews needed to fully "earn" the raw rating

export function weightedRating(rating: number | null, reviews: number | null): number {
  const R = rating ?? 0;
  const v = reviews ?? 0;
  return (v * R + WR_WEIGHT * WR_BASELINE) / (v + WR_WEIGHT);
}
