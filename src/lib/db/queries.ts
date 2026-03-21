import { eq, desc, and, ne, sql, isNotNull, count } from "drizzle-orm";
import { db } from "./index";
import { clinics, cities, categories, clinicReviews } from "./schema";

/* ─── Types ──────────────────────────────────────────────────────── */
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
  openWeekends:       boolean | null;
  featured:           boolean | null;
  featuredPosition:   number | null;
  photoUrl:           string | null;
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
): Promise<ClinicListItem[]> {
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
    })
    .from(clinics)
    .innerJoin(cities,     eq(clinics.cityId,     cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug)))
    .orderBy(desc(clinics.googleRating), desc(clinics.googleReviewsCount));
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
      cityName:     cities.name,
      citySlug:     cities.slug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(clinics)
    .innerJoin(cities,     eq(clinics.cityId,     cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(eq(clinics.slug, clinicSlug))
    .limit(1);

  return rows[0] ?? null;
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

/** Top N clinics by review count for a city+category */
export async function getTopClinicsByReviews(
  citySlug: string,
  categorySlug: string,
  limit: number
): Promise<ClinicListItem[]> {
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
    })
    .from(clinics)
    .innerJoin(cities,     eq(clinics.cityId,     cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug)))
    .orderBy(desc(clinics.googleReviewsCount))
    .limit(limit);
}

export type ClinicReviewRow = {
  id:         number;
  authorName: string;
  rating:     number;
  text:       string;
  reviewDate: string | null;
};

/** Last 5 reviews with text for a clinic */
export async function getClinicReviews(clinicId: number): Promise<ClinicReviewRow[]> {
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
    .limit(5) as Promise<ClinicReviewRow[]>;
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
export async function getTopClinicsByCity(
  citySlug: string,
  limit: number
): Promise<ClinicListItem[]> {
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
      categorySlug:       categories.slug,
    } as any)
    .from(clinics)
    .innerJoin(cities,      eq(clinics.cityId,     cities.id))
    .innerJoin(categories,  eq(clinics.categoryId, categories.id))
    .where(eq(cities.slug, citySlug))
    .orderBy(desc(clinics.googleReviewsCount), desc(clinics.googleRating))
    .limit(limit) as unknown as ClinicListItem[];
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
    .where(eq(categories.slug, catSlug))
    .orderBy(desc(clinics.googleRating), desc(clinics.googleReviewsCount))
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
    })
    .from(clinics)
    .innerJoin(cities,     eq(clinics.cityId,     cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .where(
      and(
        eq(cities.slug,      citySlug),
        eq(categories.slug,  categorySlug),
        ne(clinics.id,       excludeId)
      )
    );
}
