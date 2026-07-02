import { eq, desc, and, ne, sql, isNotNull, isNull, count } from "drizzle-orm";
import { db } from "./index";
import { clinics, cities, categories, clinicReviews, brands } from "./schema";

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
      brandId:            clinics.brandId,
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
      desc(clinics.googleReviewsCount)
    )
    .limit(limit);
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
    .where(and(eq(cities.slug, citySlug), isNull(clinics.brandId)))
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
    .where(and(eq(categories.slug, catSlug), isNull(clinics.brandId)))
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
};

export async function getBrandHub(citySlug: string, categorySlug: string, brandSlug: string) {
  const [b] = await db.select({
    id: brands.id, name: brands.name, slug: brands.slug, about: brands.about, website: brands.website,
    logoUrl: brands.logoUrl, branchCount: brands.branchCount, avgRating: brands.avgRating,
    totalReviews: brands.totalReviews, cityName: cities.name, citySlug: cities.slug,
    categoryName: categories.name, categorySlug: categories.slug,
  }).from(brands)
    .innerJoin(cities, eq(brands.cityId, cities.id))
    .innerJoin(categories, eq(brands.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug), eq(brands.slug, brandSlug)))
    .limit(1);
  if (!b) return null;
  const branches = await db.select({
    branchSlug: clinics.branchSlug, name: clinics.name, nameEn: clinics.nameEn, district: clinics.district,
    googleRating: clinics.googleRating, googleReviewsCount: clinics.googleReviewsCount,
    lat: clinics.lat, lng: clinics.lng, openingHours: clinics.openingHours, photoUrl: clinics.photoUrl,
    googlePlaceId: clinics.googlePlaceId,
  }).from(clinics).where(eq(clinics.brandId, b.id))
    .orderBy(desc(clinics.googleReviewsCount));
  return { ...b, branches };
}

export async function getBranchProfile(
  brandSlug: string,
  branchSlug: string,
): Promise<(ClinicProfile & { brandName: string; brandSlug: string; brandBranchCount: number; branchSlug: string | null; brandId: number | null }) | null> {
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
    brandBranchCount: brands.branchCount,
  }).from(clinics)
    .innerJoin(cities, eq(clinics.cityId, cities.id))
    .innerJoin(categories, eq(clinics.categoryId, categories.id))
    .innerJoin(brands, eq(clinics.brandId, brands.id))
    .where(and(eq(brands.slug, brandSlug), eq(clinics.branchSlug, branchSlug)))
    .limit(1);
  return row ?? null;
}

export async function getBrandSiblings(brandId: number, excludeBranchSlug: string): Promise<BranchRow[]> {
  return db.select({
    branchSlug: clinics.branchSlug, name: clinics.name, nameEn: clinics.nameEn, district: clinics.district,
    googleRating: clinics.googleRating, googleReviewsCount: clinics.googleReviewsCount,
    lat: clinics.lat, lng: clinics.lng, openingHours: clinics.openingHours, photoUrl: clinics.photoUrl,
    googlePlaceId: clinics.googlePlaceId,
  }).from(clinics).where(and(eq(clinics.brandId, brandId), ne(clinics.branchSlug, excludeBranchSlug)));
}

export type ListingEntry = ClinicListItem & { isBrand: boolean; brandSlug?: string; branchCount?: number };

export async function getListingEntries(citySlug: string, categorySlug: string): Promise<ListingEntry[]> {
  // standalone clinics (brand_id IS NULL)
  const standalone = (await getClinicsBySlug(citySlug, categorySlug))
    .filter((c) => c.brandId == null)
    .map((c) => ({ ...c, isBrand: false }));
  // brands as single entries
  const brandRows = await db.select({
    id: brands.id, name: brands.name, slug: brands.slug, district: sql<string | null>`NULL`,
    googleRating: brands.avgRating, googleReviewsCount: brands.totalReviews,
    photoUrl: brands.logoUrl, branchCount: brands.branchCount,
  }).from(brands)
    .innerJoin(cities, eq(brands.cityId, cities.id))
    .innerJoin(categories, eq(brands.categoryId, categories.id))
    .where(and(eq(cities.slug, citySlug), eq(categories.slug, categorySlug)));
  const brandEntries = brandRows.map((b) => ({
    id: -b.id, name: b.name, nameEn: b.name, slug: b.slug, district: null,
    googleRating: b.googleRating, googleReviewsCount: b.googleReviewsCount, photoUrl: b.photoUrl,
    verified: true, englishSpeaking: false, nearBts: false, nearMrt: false, openWeekends: false,
    featured: false, featuredPosition: null, services: null, hasParking: false, wheelchairAccessible: false,
    appointmentRequired: false, acceptsCard: false, acceptsNfc: false, openLate: false,
    brandId: null, isBrand: true, brandSlug: b.slug, branchCount: b.branchCount,
  })) as ListingEntry[];
  return [...brandEntries, ...standalone]
    .sort((a, b) => (b.googleRating ?? 0) - (a.googleRating ?? 0)
      || (b.googleReviewsCount ?? 0) - (a.googleReviewsCount ?? 0));
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
