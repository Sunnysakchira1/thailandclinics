import { eq, desc, and, ne, sql, isNotNull, isNull, count, notInArray } from "drizzle-orm";
import { db } from "./index";
import { clinics, cities, categories, clinicReviews, brands, transitStations, clinicStations, treatmentPrices } from "./schema";
import { WR_BASELINE, WR_WEIGHT, weightedRating } from "../ranking";
import { effectiveTier, isTopRated, normaliseTier, type Tier } from "../tiers";

/* Volume-aware weighted rating as a SQL ORDER BY fragment — mirrors
   weightedRating() in ../ranking so every ranking surface uses one formula. */
const weightedRatingOrder = sql`((COALESCE(${clinics.googleReviewsCount}, 0) * COALESCE(${clinics.googleRating}, 0) + ${WR_WEIGHT} * ${WR_BASELINE}) / (COALESCE(${clinics.googleReviewsCount}, 0) + ${WR_WEIGHT})) DESC`;

/* ─── Types ──────────────────────────────────────────────────────── */
/** Plan + earned tag. `tier` is already brand-resolved (effectiveTier). */
export type TierInfo = { tier: Tier; topRated: boolean };

export type ClinicListItem = {
  id:                 number;
  name:               string;
  nameEn:             string | null;
  slug:               string;
  district:           string | null;
  googleRating:       number | null;
  googleReviewsCount: number | null;
  verified:           boolean | null;
  englishSpeaking:    boolean | null;
  nearBts:            boolean | null;
  nearMrt:            boolean | null;
  openWeekends:         boolean | null;
  hasParking:           boolean | null;
  wheelchairAccessible: boolean | null;
  appointmentRequired:  boolean | null;
  acceptsCard:          boolean | null;
  acceptsNfc:           boolean | null;
  openLate:             boolean | null;
  featured:             boolean | null;
  featuredPosition:     number | null;
  photoUrl:             string | null;
  services:             string | null;
  brandId:              number | null;
};

export type ClinicProfile = {
  id:                 number;
  name:               string;
  nameEn:             string | null;
  nameTh:             string | null;
  slug:               string;
  district:           string | null;
  address:            string | null;
  postalCode:         string | null;
  lat:                number;
  lng:                number;
  phone:              string | null;
  website:            string | null;
  email:              string | null;
  googlePlaceId:      string | null;
  cid:                string | null;
  googleRating:       number | null;
  googleReviewsCount: number | null;
  englishSpeaking:    boolean | null;
  nearBts:            boolean | null;
  nearMrt:            boolean | null;
  openWeekends:       boolean | null;
  verified:           boolean | null;
  featured:           boolean | null;
  about:              string | null;
  services:           string | null;
  languages:          string | null;
  openingHours:       string | null;
  photoUrl:           string | null;
  reviewPositives:        string | null;
  reviewNegatives:        string | null;
  reviewSummaryCount:     number | null;
  reviewSummaryUpdatedAt: string | null;
  lastVerifiedAt:     string | null;
  brandId:            number | null;
  tier:               Tier;
  topRated:           boolean;
  // joined
  cityName:     string;
  citySlug:     string;
  categoryName: string;
  categorySlug: string;
};

/* ─── Queries ────────────────────────────────────────────────────── */
export async function getClinicsBySlug(
  citySlug: string,
  categorySlug: string
): Promise<(ClinicListItem & TierInfo)[]> {
  const rows = await db
    .select({
      id:                 clinics.id,
      name:               clinics.name,
      nameEn:             clinics.nameEn,
      slug:               clinics.slug,
      district:           clinics.district,
      googleRating:       clinics.googleRating,
      googleReviewsCount: clinics.googleReviewsCount,
      verified:           clinics.verified,
      englishSpeaking:    clinics.englishSpeaking,
      nearBts:            clinics.nearBts,
      nearMrt:            clinics.nearMrt,
      openWeekends:       clinics.openWeekends,
      featured:             clinics.featured,
      featuredPosition:     clinics.featuredPosition,
      photoUrl:             clinics.photoUrl,
      services:             clinics.services,
      hasParking:           clinics.hasParking,
      wheelchairAccessible: clinics.wheelchairAccessible,
      appointmentRequired:  clinics.appointmentRequired,
      acceptsCard:          clinics.acceptsCard,
      acceptsNfc:           clinics.acceptsNfc,
      openLate:             clinics.openLate,
      brandId:              clinics.brandId,
      clinicTier:           clinics.tier,
      brandTier:            brands.tier,
      clinicTopRated:       clinics.topRated,
      brandTopRated:        brands.topRated,
    })
    .from(clinics)
    .innerJoin(cities,     eq(clinics.cityId,     cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .leftJoin(brands,      eq(clinics.brandId,    brands.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug)))
    .orderBy(weightedRatingOrder, desc(clinics.googleReviewsCount));
  return rows.map(({ clinicTier, brandTier, clinicTopRated, brandTopRated, ...c }) => ({
    ...c,
    tier:     effectiveTier(clinicTier, brandTier),
    topRated: isTopRated(clinicTopRated, brandTopRated),
  }));
}

export async function getClinicProfile(
  clinicSlug: string
): Promise<ClinicProfile | null> {
  const rows = await db
    .select({
      id:                 clinics.id,
      name:               clinics.name,
      nameEn:             clinics.nameEn,
      nameTh:             clinics.nameTh,
      slug:               clinics.slug,
      district:           clinics.district,
      address:            clinics.address,
      postalCode:         clinics.postalCode,
      lat:                clinics.lat,
      lng:                clinics.lng,
      phone:              clinics.phone,
      website:            clinics.website,
      email:              clinics.email,
      googlePlaceId:      clinics.googlePlaceId,
      cid:                clinics.cid,
      googleRating:       clinics.googleRating,
      googleReviewsCount: clinics.googleReviewsCount,
      englishSpeaking:    clinics.englishSpeaking,
      nearBts:            clinics.nearBts,
      nearMrt:            clinics.nearMrt,
      openWeekends:       clinics.openWeekends,
      verified:           clinics.verified,
      featured:           clinics.featured,
      about:              clinics.about,
      services:           clinics.services,
      languages:          clinics.languages,
      openingHours:       clinics.openingHours,
      photoUrl:           clinics.photoUrl,
      reviewPositives:        clinics.reviewPositives,
      reviewNegatives:        clinics.reviewNegatives,
      reviewSummaryCount:     clinics.reviewSummaryCount,
      reviewSummaryUpdatedAt: clinics.reviewSummaryUpdatedAt,
      lastVerifiedAt:     clinics.lastVerifiedAt,
      brandId:            clinics.brandId,
      clinicTier:         clinics.tier,
      brandTier:          brands.tier,
      clinicTopRated:     clinics.topRated,
      brandTopRated:      brands.topRated,
      cityName:     cities.name,
      citySlug:     cities.slug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(clinics)
    .innerJoin(cities,     eq(clinics.cityId,     cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .leftJoin(brands,      eq(clinics.brandId,    brands.id))
    .where(eq(clinics.slug, clinicSlug))
    .limit(1);

  if (!rows[0]) return null;
  const { clinicTier, brandTier, clinicTopRated, brandTopRated, ...c } = rows[0];
  return {
    ...c,
    tier:     effectiveTier(clinicTier, brandTier),
    topRated: isTopRated(clinicTopRated, brandTopRated),
  };
}

/** Count clinics in a city+category */
export async function getClinicCount(
  citySlug: string,
  categorySlug: string
): Promise<number> {
  const rows = await db
    .select({ value: sql<number>`count(*)` })
    .from(clinics)
    .innerJoin(cities,     eq(clinics.cityId,     cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug)));
  return Number(rows[0]?.value ?? 0);
}

/** Count all clinics in a city (across every category) */
export async function getCityClinicCount(citySlug: string): Promise<number> {
  const rows = await db
    .select({ value: sql<number>`count(*)` })
    .from(clinics)
    .innerJoin(cities, eq(clinics.cityId, cities.id))
    .where(eq(cities.slug, citySlug));
  return Number(rows[0]?.value ?? 0);
}

/** Count every clinic on the site */
export async function getTotalClinicCount(): Promise<number> {
  const rows = await db.select({ value: sql<number>`count(*)` }).from(clinics);
  return Number(rows[0]?.value ?? 0);
}

/** Top N clinics by review count for a city+category */
export async function getTopClinicsByReviews(
  citySlug: string,
  categorySlug: string,
  limit: number
): Promise<ClinicListItem[]> {
  return db
    .select({
      id:                   clinics.id,
      name:                 clinics.name,
      nameEn:               clinics.nameEn,
      slug:                 clinics.slug,
      district:             clinics.district,
      googleRating:         clinics.googleRating,
      googleReviewsCount:   clinics.googleReviewsCount,
      verified:             clinics.verified,
      englishSpeaking:      clinics.englishSpeaking,
      nearBts:              clinics.nearBts,
      nearMrt:              clinics.nearMrt,
      openWeekends:         clinics.openWeekends,
      featured:             clinics.featured,
      featuredPosition:     clinics.featuredPosition,
      photoUrl:             clinics.photoUrl,
      services:             clinics.services,
      hasParking:           clinics.hasParking,
      wheelchairAccessible: clinics.wheelchairAccessible,
      appointmentRequired:  clinics.appointmentRequired,
      acceptsCard:          clinics.acceptsCard,
      acceptsNfc:           clinics.acceptsNfc,
      openLate:             clinics.openLate,
      brandId:              clinics.brandId,
    })
    .from(clinics)
    .innerJoin(cities,     eq(clinics.cityId,     cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug)))
    .orderBy(desc(clinics.googleReviewsCount))
    .limit(limit);
}

/** Featured clinics first (by position), then top by reviews — for homepage */
export async function getHomepageClinics(
  citySlug: string,
  categorySlug: string,
  limit: number
): Promise<ClinicListItem[]> {
  return db
    .select({
      id:                   clinics.id,
      name:                 clinics.name,
      nameEn:               clinics.nameEn,
      slug:                 clinics.slug,
      district:             clinics.district,
      googleRating:         clinics.googleRating,
      googleReviewsCount:   clinics.googleReviewsCount,
      verified:             clinics.verified,
      englishSpeaking:      clinics.englishSpeaking,
      nearBts:              clinics.nearBts,
      nearMrt:              clinics.nearMrt,
      openWeekends:         clinics.openWeekends,
      featured:             clinics.featured,
      featuredPosition:     clinics.featuredPosition,
      photoUrl:             clinics.photoUrl,
      services:             clinics.services,
      hasParking:           clinics.hasParking,
      wheelchairAccessible: clinics.wheelchairAccessible,
      appointmentRequired:  clinics.appointmentRequired,
      acceptsCard:          clinics.acceptsCard,
      acceptsNfc:           clinics.acceptsNfc,
      openLate:             clinics.openLate,
      brandId:              clinics.brandId,
    })
    .from(clinics)
    .innerJoin(cities,     eq(clinics.cityId,     cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug), isNull(clinics.brandId)))
    .orderBy(
      sql`CASE WHEN ${clinics.featured} = 1 AND ${clinics.featuredPosition} IS NOT NULL THEN ${clinics.featuredPosition} ELSE 9999 END`,
      weightedRatingOrder
    )
    .limit(limit);
}

export type HomepageFeaturedCard = {
  key: string; name: string; url: string; categorySlug: string; district: string | null;
  rating: number | null; reviews: number | null; photoUrl: string | null; tier: Tier; topRated: boolean;
};

/** Homepage featured cards: Premium clinics + Premium brands in the city (by featured_position),
 *  then the best organic standalone clinics in any category, up to `limit`. */
export async function getHomepageFeatured(citySlug: string, limit: number): Promise<HomepageFeaturedCard[]> {
  const [premClinics, premBrands] = await Promise.all([
    db.select({
      id: clinics.id, name: clinics.name, nameEn: clinics.nameEn, slug: clinics.slug,
      categorySlug: categories.slug, district: clinics.district,
      rating: clinics.googleRating, reviews: clinics.googleReviewsCount, photoUrl: clinics.photoUrl,
      position: clinics.featuredPosition, topRated: clinics.topRated,
    })
      .from(clinics)
      .innerJoin(cities,     eq(clinics.cityId,     cities.id))
      .innerJoin(categories, eq(clinics.categoryId, categories.id))
      .where(and(eq(cities.slug, citySlug), sql`${clinics.tier} = 'premium'`, isNull(clinics.brandId))),
    db.select({
      id: brands.id, name: brands.name, slug: brands.slug, categorySlug: categories.slug,
      rating: brands.avgRating, reviews: brands.totalReviews, position: brands.featuredPosition, topRated: brands.topRated,
      photoUrl: sql<string | null>`(SELECT c.photo_url FROM clinics c WHERE c.brand_id = ${brands.id} AND c.photo_url IS NOT NULL ORDER BY COALESCE(c.featured_position, 9999), c.google_reviews_count DESC LIMIT 1)`,
    })
      .from(brands)
      .innerJoin(cities,     eq(brands.cityId,     cities.id))
      .innerJoin(categories, eq(brands.categoryId, categories.id))
      .where(and(eq(cities.slug, citySlug), sql`${brands.tier} = 'premium'`)),
  ]);

  const paid = [
    ...premClinics.map((c) => ({
      position: c.position,
      card: {
        key: `c${c.id}`, name: c.nameEn ?? c.name, url: `/${citySlug}/${c.categorySlug}/${c.slug}/`,
        categorySlug: c.categorySlug, district: c.district, rating: c.rating, reviews: c.reviews,
        photoUrl: c.photoUrl, tier: "premium" as Tier, topRated: isTopRated(c.topRated),
      },
    })),
    ...premBrands.map((b) => ({
      position: b.position,
      card: {
        key: `b${b.id}`, name: b.name, url: `/${citySlug}/${b.categorySlug}/${b.slug}/`,
        categorySlug: b.categorySlug, district: null, rating: b.rating, reviews: b.reviews,
        photoUrl: b.photoUrl, tier: "premium" as Tier, topRated: isTopRated(null, b.topRated),
      },
    })),
  ].sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999)).map((p) => p.card);

  const cards = paid.slice(0, limit);
  if (cards.length >= limit) return cards;

  const listed = premClinics.map((c) => c.id);
  const organic = await db.select({
    id: clinics.id, name: clinics.name, nameEn: clinics.nameEn, slug: clinics.slug,
    categorySlug: categories.slug, district: clinics.district,
    rating: clinics.googleRating, reviews: clinics.googleReviewsCount, photoUrl: clinics.photoUrl, tier: clinics.tier,
    topRated: clinics.topRated,
  })
    .from(clinics)
    .innerJoin(cities,     eq(clinics.cityId,     cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), isNull(clinics.brandId),
      listed.length ? notInArray(clinics.id, listed) : undefined))
    .orderBy(weightedRatingOrder, desc(clinics.googleReviewsCount))
    .limit(limit - cards.length);

  return [...cards, ...organic.map((c) => ({
    key: `c${c.id}`, name: c.nameEn ?? c.name, url: `/${citySlug}/${c.categorySlug}/${c.slug}/`,
    categorySlug: c.categorySlug, district: c.district, rating: c.rating, reviews: c.reviews,
    photoUrl: c.photoUrl, tier: effectiveTier(c.tier), topRated: isTopRated(c.topRated),
  }))];
}

export type ClinicReviewRow = {
  id:         number;
  authorName: string;
  rating:     number;
  text:       string;
  reviewDate: string | null;
};

/** Recent reviews with text for a clinic */
export async function getClinicReviews(clinicId: number, limit = 20): Promise<ClinicReviewRow[]> {
  return db
    .select({
      id:         clinicReviews.id,
      authorName: clinicReviews.authorName,
      rating:     clinicReviews.rating,
      text:       clinicReviews.text,
      reviewDate: clinicReviews.reviewDate,
    })
    .from(clinicReviews)
    .where(and(eq(clinicReviews.clinicId, clinicId), isNotNull(clinicReviews.text)))
    .orderBy(desc(clinicReviews.reviewDate))
    .limit(limit) as Promise<ClinicReviewRow[]>;
}

/* ─── City landing page ──────────────────────────────────────────── */

/** Clinic counts per category for a city */
export async function getCategoryCountsForCity(
  citySlug: string
): Promise<{ categorySlug: string; count: number }[]> {
  const rows = await db
    .select({ categorySlug: categories.slug, count: sql<number>`count(*)` })
    .from(clinics)
    .innerJoin(cities,      eq(clinics.cityId,     cities.id))
    .innerJoin(categories,  eq(clinics.categoryId, categories.id))
    .where(eq(cities.slug, citySlug))
    .groupBy(categories.slug);
  return rows.map(r => ({ categorySlug: r.categorySlug, count: Number(r.count) }));
}

/** Top N clinics in a city across all categories, ordered by review count */
export type CityTopRow = ClinicListItem & TierInfo & { key: string; categorySlug: string };

/**
 * City page rows: Premium entries pinned first (standalone Premium clinics,
 * Premium brands as one hub row, and any Premium branch of a non-Premium
 * brand), ordered by featured_position then weighted rating. Then up to
 * `limit` organic standalone clinics by weighted rating. Premium rows are
 * added on top of the organic limit, never in place of it.
 */
export async function getTopClinicsByCity(
  citySlug: string,
  limit: number
): Promise<CityTopRow[]> {
  const [premClinics, premBrands, premBranches] = await Promise.all([
    db.select({
      id: clinics.id, name: clinics.name, nameEn: clinics.nameEn, slug: clinics.slug,
      district: clinics.district, googleRating: clinics.googleRating,
      googleReviewsCount: clinics.googleReviewsCount, featuredPosition: clinics.featuredPosition,
      tier: clinics.tier, categorySlug: categories.slug, topRated: clinics.topRated,
    })
      .from(clinics)
      .innerJoin(cities,     eq(clinics.cityId,     cities.id))
      .innerJoin(categories, eq(clinics.categoryId, categories.id))
      .where(and(eq(cities.slug, citySlug), isNull(clinics.brandId), sql`${clinics.tier} = 'premium'`)),
    db.select({
      id: brands.id, name: brands.name, slug: brands.slug,
      googleRating: brands.avgRating, googleReviewsCount: brands.totalReviews,
      featuredPosition: brands.featuredPosition, tier: brands.tier, categorySlug: categories.slug,
      brandTopRated: brands.topRated,
    })
      .from(brands)
      .innerJoin(cities,     eq(brands.cityId,     cities.id))
      .innerJoin(categories, eq(brands.categoryId, categories.id))
      .where(and(eq(cities.slug, citySlug), sql`${brands.tier} = 'premium'`)),
    db.select({
      id: clinics.id, name: clinics.name, nameEn: clinics.nameEn,
      branchSlug: clinics.branchSlug, brandSlug: brands.slug,
      district: clinics.district, googleRating: clinics.googleRating,
      googleReviewsCount: clinics.googleReviewsCount, featuredPosition: clinics.featuredPosition,
      tier: clinics.tier, brandTier: brands.tier, categorySlug: categories.slug,
      topRated: clinics.topRated, brandTopRated: brands.topRated,
    })
      .from(clinics)
      .innerJoin(brands,     eq(clinics.brandId,    brands.id))
      .innerJoin(cities,     eq(clinics.cityId,     cities.id))
      .innerJoin(categories, eq(clinics.categoryId, categories.id))
      .where(and(eq(cities.slug, citySlug), sql`${clinics.tier} = 'premium'`)),
  ]);

  const asRow = (r: {
    key: string; id: number; name: string; nameEn: string | null; slug: string;
    district: string | null; googleRating: number | null; googleReviewsCount: number | null;
    featuredPosition: number | null; tier: Tier; categorySlug: string;
    topRated?: unknown; brandTopRated?: unknown;
  }): CityTopRow => ({
    ...(r as unknown as ClinicListItem),
    key: r.key, categorySlug: r.categorySlug, tier: r.tier,
    topRated: isTopRated(r.topRated, r.brandTopRated),
  });

  const pinned = [
    ...premClinics.map((c) => asRow({ ...c, key: `c${c.id}`, tier: effectiveTier(c.tier) })),
    ...premBrands.map((b) => asRow({
      ...b, key: `b${b.id}`, nameEn: null, district: null, tier: effectiveTier(null, b.tier),
    })),
    // A Premium branch whose brand is already Premium is covered by the brand row.
    ...premBranches
      .filter((c) => c.branchSlug && normaliseTier(c.brandTier) !== "premium")
      .map((c) => asRow({ ...c, key: `c${c.id}`, slug: `${c.brandSlug}/${c.branchSlug}`, tier: "premium" })),
  ].filter((r) => r.tier === "premium")
    .sort((a, b) =>
      ((a.featuredPosition ?? 9999) - (b.featuredPosition ?? 9999)) ||
      (weightedRating(b.googleRating, b.googleReviewsCount) - weightedRating(a.googleRating, a.googleReviewsCount)));

  const pinnedIds = premClinics.map((c) => c.id);
  const organic = await db
    .select({
      id:                 clinics.id,
      name:               clinics.name,
      nameEn:             clinics.nameEn,
      slug:               clinics.slug,
      district:           clinics.district,
      googleRating:       clinics.googleRating,
      googleReviewsCount: clinics.googleReviewsCount,
      verified:           clinics.verified,
      englishSpeaking:    clinics.englishSpeaking,
      nearBts:            clinics.nearBts,
      nearMrt:            clinics.nearMrt,
      openWeekends:       clinics.openWeekends,
      featured:           clinics.featured,
      featuredPosition:   clinics.featuredPosition,
      photoUrl:           clinics.photoUrl,
      tier:               clinics.tier,
      topRated:           clinics.topRated,
      categorySlug:       categories.slug,
    })
    .from(clinics)
    .innerJoin(cities,      eq(clinics.cityId,     cities.id))
    .innerJoin(categories,  eq(clinics.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), isNull(clinics.brandId),
      pinnedIds.length ? notInArray(clinics.id, pinnedIds) : undefined))
    .orderBy(weightedRatingOrder)
    .limit(limit);

  return [
    ...pinned,
    ...organic.map((c) => ({
      ...(c as unknown as ClinicListItem),
      key: `c${c.id}`, categorySlug: c.categorySlug,
      tier: effectiveTier(c.tier),
      topRated: isTopRated(c.topRated),
    })),
  ];
}

/* ─── Category landing page ──────────────────────────────────────── */

/** Clinic counts per city for a category */
export async function getCityCountsForCategory(
  catSlug: string
): Promise<{ citySlug: string; count: number }[]> {
  const rows = await db
    .select({ citySlug: cities.slug, count: sql<number>`count(*)` })
    .from(clinics)
    .innerJoin(cities,      eq(clinics.cityId,     cities.id))
    .innerJoin(categories,  eq(clinics.categoryId, categories.id))
    .where(eq(categories.slug, catSlug))
    .groupBy(cities.slug);
  return rows.map(r => ({ citySlug: r.citySlug, count: Number(r.count) }));
}

/** Top N clinics for a category across all cities, ordered by rating */
export async function getTopClinicsByCategory(
  catSlug: string,
  limit: number
): Promise<(ClinicListItem & { citySlug: string })[]> {
  return db
    .select({
      id:                 clinics.id,
      name:               clinics.name,
      nameEn:             clinics.nameEn,
      slug:               clinics.slug,
      district:           clinics.district,
      googleRating:       clinics.googleRating,
      googleReviewsCount: clinics.googleReviewsCount,
      verified:           clinics.verified,
      englishSpeaking:    clinics.englishSpeaking,
      nearBts:            clinics.nearBts,
      nearMrt:            clinics.nearMrt,
      openWeekends:       clinics.openWeekends,
      featured:           clinics.featured,
      featuredPosition:   clinics.featuredPosition,
      photoUrl:           clinics.photoUrl,
      citySlug:           cities.slug,
    })
    .from(clinics)
    .innerJoin(cities,      eq(clinics.cityId,     cities.id))
    .innerJoin(categories,  eq(clinics.categoryId, categories.id))
    .where(and(eq(categories.slug, catSlug), isNull(clinics.brandId)))
    .orderBy(weightedRatingOrder)
    .limit(limit) as unknown as (ClinicListItem & { citySlug: string })[];
}

/** Fetch all clinics in same city+category for proximity sort in JS */
export async function getNearbyPool(
  citySlug:     string,
  categorySlug: string,
  excludeId:    number
): Promise<ClinicListItem[]> {
  return db
    .select({
      id:                   clinics.id,
      name:                 clinics.name,
      nameEn:               clinics.nameEn,
      slug:                 clinics.slug,
      district:             clinics.district,
      googleRating:         clinics.googleRating,
      googleReviewsCount:   clinics.googleReviewsCount,
      verified:             clinics.verified,
      englishSpeaking:      clinics.englishSpeaking,
      nearBts:              clinics.nearBts,
      nearMrt:              clinics.nearMrt,
      openWeekends:         clinics.openWeekends,
      featured:             clinics.featured,
      featuredPosition:     clinics.featuredPosition,
      photoUrl:             clinics.photoUrl,
      services:             clinics.services,
      hasParking:           clinics.hasParking,
      wheelchairAccessible: clinics.wheelchairAccessible,
      appointmentRequired:  clinics.appointmentRequired,
      acceptsCard:          clinics.acceptsCard,
      acceptsNfc:           clinics.acceptsNfc,
      openLate:             clinics.openLate,
      brandId:              clinics.brandId,
    })
    .from(clinics)
    .innerJoin(cities,     eq(clinics.cityId,     cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(
      and(
        eq(cities.slug,      citySlug),
        eq(categories.slug,  categorySlug),
        ne(clinics.id,       excludeId),
        isNull(clinics.brandId)
      )
    );
}

/* ─── Brand + Branch queries ─────────────────────────────────────── */

export type BranchRow = {
  branchSlug: string | null; name: string; nameEn: string | null; district: string | null;
  googleRating: number | null; googleReviewsCount: number | null;
  lat: number; lng: number; openingHours: string | null; photoUrl: string | null;
  googlePlaceId: string | null;
} & TierInfo;

export async function getBrandHub(citySlug: string, categorySlug: string, brandSlug: string) {
  const [b] = await db.select({
    id: brands.id, name: brands.name, slug: brands.slug, about: brands.about, website: brands.website,
    logoUrl: brands.logoUrl, branchCount: brands.branchCount, avgRating: brands.avgRating,
    totalReviews: brands.totalReviews, featured: brands.featured, editorsNote: brands.editorsNote,
    brandTier: brands.tier, brandTopRated: brands.topRated,
    cityName: cities.name, citySlug: cities.slug,
    categoryName: categories.name, categorySlug: categories.slug,
  }).from(brands)
    .innerJoin(cities, eq(brands.cityId, cities.id))
    .innerJoin(categories, eq(brands.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug), eq(brands.slug, brandSlug)))
    .limit(1);
  if (!b) return null;
  const { brandTier, brandTopRated, ...hub } = b;
  const branchRows = await db.select({
    branchSlug: clinics.branchSlug, name: clinics.name, nameEn: clinics.nameEn, district: clinics.district,
    googleRating: clinics.googleRating, googleReviewsCount: clinics.googleReviewsCount,
    lat: clinics.lat, lng: clinics.lng, openingHours: clinics.openingHours, photoUrl: clinics.photoUrl,
    googlePlaceId: clinics.googlePlaceId, clinicTier: clinics.tier, clinicTopRated: clinics.topRated,
  }).from(clinics).where(eq(clinics.brandId, b.id))
    .orderBy(desc(clinics.googleReviewsCount));
  // Branches inherit the brand plan and the brand's Top rated flag.
  const branches: BranchRow[] = branchRows.map(({ clinicTier, clinicTopRated, ...r }) => ({
    ...r,
    tier:     effectiveTier(clinicTier, brandTier),
    topRated: isTopRated(clinicTopRated, brandTopRated),
  }));
  return {
    ...hub,
    tier:     effectiveTier(brandTier),
    topRated: isTopRated(null, brandTopRated),
    branches,
  };
}

export async function getBranchProfile(
  brandSlug: string,
  branchSlug: string,
): Promise<(ClinicProfile & { brandName: string; brandSlug: string; brandBranchCount: number; brandEditorsNote: string | null; branchSlug: string | null; brandId: number | null }) | null> {
  const [row] = await db.select({
    id: clinics.id, name: clinics.name, nameEn: clinics.nameEn, nameTh: clinics.nameTh, slug: clinics.slug,
    district: clinics.district, address: clinics.address, postalCode: clinics.postalCode,
    lat: clinics.lat, lng: clinics.lng, phone: clinics.phone, website: clinics.website, email: clinics.email,
    googlePlaceId: clinics.googlePlaceId, cid: clinics.cid, googleRating: clinics.googleRating,
    googleReviewsCount: clinics.googleReviewsCount, englishSpeaking: clinics.englishSpeaking,
    nearBts: clinics.nearBts, nearMrt: clinics.nearMrt, openWeekends: clinics.openWeekends,
    verified: clinics.verified, featured: clinics.featured, about: clinics.about, services: clinics.services,
    languages: clinics.languages, openingHours: clinics.openingHours, photoUrl: clinics.photoUrl,
    reviewPositives: clinics.reviewPositives, reviewNegatives: clinics.reviewNegatives,
    reviewSummaryCount: clinics.reviewSummaryCount, reviewSummaryUpdatedAt: clinics.reviewSummaryUpdatedAt,
    lastVerifiedAt: clinics.lastVerifiedAt, cityName: cities.name, citySlug: cities.slug,
    categoryName: categories.name, categorySlug: categories.slug, branchSlug: clinics.branchSlug,
    brandId: clinics.brandId, brandName: brands.name, brandSlug: brands.slug,
    brandBranchCount: brands.branchCount, brandEditorsNote: brands.editorsNote,
    clinicTier: clinics.tier, brandTier: brands.tier,
    clinicTopRated: clinics.topRated, brandTopRated: brands.topRated,
  }).from(clinics)
    .innerJoin(cities, eq(clinics.cityId, cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .innerJoin(brands, eq(clinics.brandId, brands.id))
    .where(and(eq(brands.slug, brandSlug), eq(clinics.branchSlug, branchSlug)))
    .limit(1);
  if (!row) return null;
  const { clinicTier, brandTier, clinicTopRated, brandTopRated, ...p } = row;
  return {
    ...p,
    tier:     effectiveTier(clinicTier, brandTier),
    topRated: isTopRated(clinicTopRated, brandTopRated),
  };
}

export async function getBrandSiblings(brandId: number, excludeBranchSlug: string): Promise<BranchRow[]> {
  const rows = await db.select({
    branchSlug: clinics.branchSlug, name: clinics.name, nameEn: clinics.nameEn, district: clinics.district,
    googleRating: clinics.googleRating, googleReviewsCount: clinics.googleReviewsCount,
    lat: clinics.lat, lng: clinics.lng, openingHours: clinics.openingHours, photoUrl: clinics.photoUrl,
    googlePlaceId: clinics.googlePlaceId, clinicTier: clinics.tier, brandTier: brands.tier,
    clinicTopRated: clinics.topRated, brandTopRated: brands.topRated,
  }).from(clinics)
    .innerJoin(brands, eq(clinics.brandId, brands.id))
    .where(and(eq(clinics.brandId, brandId), ne(clinics.branchSlug, excludeBranchSlug)));
  return rows.map(({ clinicTier, brandTier, clinicTopRated, brandTopRated, ...r }) => ({
    ...r,
    tier:     effectiveTier(clinicTier, brandTier),
    topRated: isTopRated(clinicTopRated, brandTopRated),
  }));
}

export type ListingEntry = ClinicListItem & TierInfo & { isBrand: boolean; brandSlug?: string; branchCount?: number };

export async function getListingEntries(citySlug: string, categorySlug: string): Promise<ListingEntry[]> {
  // standalone clinics (brand_id IS NULL)
  const standalone = (await getClinicsBySlug(citySlug, categorySlug))
    .filter((c) => c.brandId == null)
    .map((c) => ({ ...c, isBrand: false }));
  // brands as single entries
  const brandRows = await db.select({
    id: brands.id, name: brands.name, slug: brands.slug, district: sql<string | null>`NULL`,
    googleRating: brands.avgRating, googleReviewsCount: brands.totalReviews,
    photoUrl: brands.logoUrl, branchCount: brands.branchCount, featured: brands.featured,
    featuredPosition: brands.featuredPosition, brandTier: brands.tier, brandTopRated: brands.topRated,
  }).from(brands)
    .innerJoin(cities, eq(brands.cityId, cities.id))
    .innerJoin(categories, eq(brands.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug)));
  const brandEntries = brandRows.map((b) => ({
    id: -b.id, name: b.name, nameEn: b.name, slug: b.slug, district: null,
    googleRating: b.googleRating, googleReviewsCount: b.googleReviewsCount, photoUrl: b.photoUrl,
    verified: true, englishSpeaking: false, nearBts: false, nearMrt: false, openWeekends: false,
    featured: b.featured, featuredPosition: b.featuredPosition, services: null, hasParking: false, wheelchairAccessible: false,
    appointmentRequired: false, acceptsCard: false, acceptsNfc: false, openLate: false,
    brandId: null, isBrand: true, brandSlug: b.slug, branchCount: b.branchCount,
    tier: effectiveTier(b.brandTier),
    topRated: isTopRated(null, b.brandTopRated),
  })) as ListingEntry[];
  return [...brandEntries, ...standalone]
    .sort((a, b) => (b.googleRating ?? 0) - (a.googleRating ?? 0)
      || (b.googleReviewsCount ?? 0) - (a.googleReviewsCount ?? 0));
}

/* ─── Guides (programmatic AIO layer) ────────────────────────────── */

/** All city×category combos that have clinics — only generate a guide where we have data. */
export async function getGuideCombos(): Promise<{ citySlug: string; categorySlug: string; count: number }[]> {
  const rows = await db.select({
    citySlug: cities.slug, categorySlug: categories.slug, n: sql<number>`count(*)`,
  }).from(clinics)
    .innerJoin(cities, eq(clinics.cityId, cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .groupBy(cities.slug, categories.slug);
  return rows.map((r) => ({ citySlug: r.citySlug, categorySlug: r.categorySlug, count: Number(r.n) }));
}

export type GuideShortlistItem = {
  name: string; href: string; district: string | null;
  googleRating: number | null; googleReviewsCount: number | null;
  isBrand: boolean; branchCount?: number | null; snippet: string | null;
};

/** Top clinics for a city+category (weighted rank), with a review-summary snippet — the guide shortlist. */
export async function getGuideShortlist(citySlug: string, categorySlug: string, limit: number, curatedOrder?: string[]): Promise<GuideShortlistItem[]> {
  const entries = await getListingEntries(citySlug, categorySlug);
  const idOf = (e: ListingEntry) => (e.isBrand ? e.brandSlug : e.slug);
  let ordered: ListingEntry[];
  if (curatedOrder && curatedOrder.length) {
    // Editorial curation: exactly these clinics, in this order (skip any not found).
    const byId = new Map(entries.map((e) => [idOf(e), e]));
    ordered = curatedOrder.map((id) => byId.get(id)).filter((e): e is ListingEntry => Boolean(e)).slice(0, limit);
  } else {
    entries.sort((a, b) =>
      weightedRating(b.googleRating, b.googleReviewsCount) - weightedRating(a.googleRating, a.googleReviewsCount)
      || (b.googleReviewsCount ?? 0) - (a.googleReviewsCount ?? 0));
    ordered = entries.slice(0, limit);
  }
  const out: GuideShortlistItem[] = [];
  for (const e of ordered) {
    let snippet: string | null = null;
    if (!e.isBrand) {
      const [row] = await db.select({ rp: clinics.reviewPositives }).from(clinics).where(eq(clinics.slug, e.slug)).limit(1);
      try { const arr = JSON.parse(row?.rp ?? "[]") as (string | null)[]; snippet = arr.filter(Boolean)[0] ?? null; } catch { /* noop */ }
    }
    out.push({
      name: e.nameEn ?? e.name,
      href: e.isBrand ? `/${citySlug}/${categorySlug}/${e.brandSlug}/` : `/${citySlug}/${categorySlug}/${e.slug}/`,
      district: e.district, googleRating: e.googleRating, googleReviewsCount: e.googleReviewsCount,
      isBrand: e.isBrand, branchCount: (e as ListingEntry & { branchCount?: number }).branchCount ?? null, snippet,
    });
  }
  return out;
}

/** Top districts where a city+category's clinics cluster — for the guide's "where to find them" section. */
export async function getCategoryDistricts(citySlug: string, categorySlug: string, limit: number): Promise<{ district: string; count: number }[]> {
  const rows = await db.select({ district: clinics.district, n: sql<number>`count(*)` })
    .from(clinics)
    .innerJoin(cities, eq(clinics.cityId, cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug), isNotNull(clinics.district)))
    .groupBy(clinics.district)
    .orderBy(sql`count(*) desc`)
    .limit(limit);
  return rows.map((r) => ({ district: r.district as string, count: Number(r.n) }));
}

export async function getBrandSlugs() {
  return db.select({ slug: brands.slug, citySlug: cities.slug, categorySlug: categories.slug })
    .from(brands).innerJoin(cities, eq(brands.cityId, cities.id))
    .innerJoin(categories, eq(brands.categoryId, categories.id));
}

export async function getStandaloneClinicSlugs() {
  return db.select({ slug: clinics.slug, citySlug: cities.slug, categorySlug: categories.slug })
    .from(clinics).innerJoin(cities, eq(clinics.cityId, cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(isNull(clinics.brandId));
}

export async function getBranchParams() {
  return db.select({ brandSlug: brands.slug, branchSlug: clinics.branchSlug,
                     citySlug: cities.slug, categorySlug: categories.slug })
    .from(clinics).innerJoin(brands, eq(clinics.brandId, brands.id))
    .innerJoin(cities, eq(clinics.cityId, cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id));
}

/* ─── Title disambiguation ───────────────────────────────────────── */
/** "city:lowercased display name" for every name shared by 2+ clinics in a city.
 *  Memoised per build — every clinic page's generateMetadata calls it. */
let duplicateNamesPromise: Promise<Set<string>> | null = null;
export function getDuplicateDisplayNames(): Promise<Set<string>> {
  duplicateNamesPromise ??= db
    .select({
      key: sql<string>`${cities.slug} || ':' || lower(coalesce(${clinics.nameEn}, ${clinics.name}))`,
      n:   count(),
    })
    .from(clinics)
    .innerJoin(cities, eq(clinics.cityId, cities.id))
    .groupBy(sql`1`)
    .having(sql`count(*) > 1`)
    .then((rows) => new Set(rows.map((r) => r.key)));
  return duplicateNamesPromise;
}

/* ─── Transit ────────────────────────────────────────────────────── */
export type NearbyStation = { system: string; name: string; distanceM: number };

/** Nearest rail stations for a clinic (≤ 2, within 1 km), closest first. */
export async function getClinicStations(clinicId: number): Promise<NearbyStation[]> {
  return db
    .select({ system: transitStations.system, name: transitStations.name, distanceM: clinicStations.distanceM })
    .from(clinicStations)
    .innerJoin(transitStations, eq(clinicStations.stationId, transitStations.id))
    .where(eq(clinicStations.clinicId, clinicId))
    .orderBy(clinicStations.distanceM);
}

/* ─── Prices ─────────────────────────────────────────────────────── */
export type PriceRecord = {
  treatment:   string;
  product:     string | null;
  priceThb:    number;
  priceMaxThb: number | null;
  unit:        string;
  quantity:    number | null;
  sourceUrl:   string;
  checkedAt:   string;
  note:        string | null;
  /** Clinic or brand the price belongs to — one id per price-setting entity. */
  entityKey:   string;
};

const priceCols = {
  treatment: treatmentPrices.treatment, product: treatmentPrices.product,
  priceThb: treatmentPrices.priceThb, priceMaxThb: treatmentPrices.priceMaxThb,
  unit: treatmentPrices.unit, quantity: treatmentPrices.quantity,
  sourceUrl: treatmentPrices.sourceUrl, checkedAt: treatmentPrices.checkedAt, note: treatmentPrices.note,
  entityKey: sql<string>`CASE WHEN ${treatmentPrices.brandId} IS NOT NULL THEN 'b' || ${treatmentPrices.brandId} ELSE 'c' || ${treatmentPrices.clinicId} END`,
};

/** Prices for one clinic: its own, plus chain-wide prices from its brand. */
export async function getClinicPrices(clinicId: number, brandId: number | null): Promise<PriceRecord[]> {
  const where = brandId != null
    ? sql`${treatmentPrices.clinicId} = ${clinicId} OR ${treatmentPrices.brandId} = ${brandId}`
    : eq(treatmentPrices.clinicId, clinicId);
  return db.select(priceCols).from(treatmentPrices).where(where)
    .orderBy(treatmentPrices.treatment, treatmentPrices.priceThb);
}

/** All price records for a treatment in a city (clinic- and brand-level). */
export async function getTreatmentPrices(treatment: string, citySlug: string): Promise<PriceRecord[]> {
  return db.select(priceCols).from(treatmentPrices)
    .leftJoin(clinics, eq(treatmentPrices.clinicId, clinics.id))
    .leftJoin(brands, eq(treatmentPrices.brandId, brands.id))
    .innerJoin(cities, sql`${cities.id} = COALESCE(${clinics.cityId}, ${brands.cityId})`)
    .where(and(eq(treatmentPrices.treatment, treatment), eq(cities.slug, citySlug)));
}

/* ─── Search index ───────────────────────────────────────────────── */
export type SearchRow = {
  id: number; name: string; nameTh: string | null; slug: string;
  citySlug: string; categorySlug: string; district: string | null;
  rating: number | null; reviews: number | null; photoUrl: string | null;
  services: string | null; tier: string | null;
  brandSlug: string | null; brandName: string | null; brandTier: string | null;
  topRated: boolean; brandTopRated: boolean | null;
  branchSlug: string | null; stations: string[];
};

/** Every clinic, flattened for the static search index. Tiers are raw; map via effectiveTier. */
export async function getSearchRows(): Promise<SearchRow[]> {
  const [rows, stationRows] = await Promise.all([
    db.select({
      id:           clinics.id,
      name:         clinics.name,
      nameEn:       clinics.nameEn,
      nameTh:       clinics.nameTh,
      slug:         clinics.slug,
      citySlug:     cities.slug,
      categorySlug: categories.slug,
      district:     clinics.district,
      rating:       clinics.googleRating,
      reviews:      clinics.googleReviewsCount,
      photoUrl:     clinics.photoUrl,
      services:     clinics.services,
      tier:         clinics.tier,
      brandSlug:    brands.slug,
      brandName:    brands.name,
      brandTier:    brands.tier,
      topRated:     clinics.topRated,
      brandTopRated: brands.topRated,
      branchSlug:   clinics.branchSlug,
    })
      .from(clinics)
      .innerJoin(cities,     eq(clinics.cityId,     cities.id))
      .innerJoin(categories, eq(clinics.categoryId, categories.id))
      .leftJoin(brands,      eq(clinics.brandId,    brands.id)),
    db.select({ clinicId: clinicStations.clinicId, name: transitStations.name })
      .from(clinicStations)
      .innerJoin(transitStations, eq(clinicStations.stationId, transitStations.id))
      .orderBy(clinicStations.distanceM),
  ]);
  const stations = new Map<number, string[]>();
  for (const s of stationRows) {
    const list = stations.get(s.clinicId) ?? [];
    list.push(s.name);
    stations.set(s.clinicId, list);
  }
  return rows.map(({ nameEn, ...r }) => ({
    ...r,
    name: nameEn ?? r.name,
    stations: stations.get(r.id) ?? [],
  }));
}
