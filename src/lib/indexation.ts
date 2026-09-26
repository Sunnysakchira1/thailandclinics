import { getCategoryCountsForCity } from "@/lib/db/queries";

/**
 * Indexation rules — see docs/seo/indexation-rules.md.
 *
 * A city or city+category listing is only indexable once it lists enough
 * clinics to be useful. Below this it stays live and crawlable (noindex,
 * follow) so nav links still work, but it drops out of the index and the
 * sitemap. The page flips back to indexable on the next build once
 * inventory is imported — no code change needed.
 */
export const MIN_INDEXABLE_CLINICS = 3;

export const NOINDEX_FOLLOW = { index: false, follow: true } as const;

export async function cityClinicCount(citySlug: string, categorySlug?: string) {
  const rows = await getCategoryCountsForCity(citySlug);
  return categorySlug
    ? rows.find((r) => r.categorySlug === categorySlug)?.count ?? 0
    : rows.reduce((sum, r) => sum + r.count, 0);
}

export async function isListingIndexable(citySlug: string, categorySlug?: string) {
  return (await cityClinicCount(citySlug, categorySlug)) >= MIN_INDEXABLE_CLINICS;
}
