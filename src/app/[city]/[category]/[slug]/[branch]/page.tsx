import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBranchProfile,
  getBranchParams,
  getClinicReviews,
  getBrandSiblings,
} from "@/lib/db/queries";
import ClinicProfileView, {
  buildClinicSchema,
  haversine,
} from "@/components/clinic/ClinicProfileView";

/* ─── Static params ─────────────────────────────────────────────── */
export async function generateStaticParams() {
  const rows = await getBranchParams();
  return rows
    .filter((r) => r.branchSlug != null)
    .map((r) => ({
      city: r.citySlug,
      category: r.categorySlug,
      slug: r.brandSlug,
      branch: r.branchSlug as string,
    }));
}

/* ─── Metadata ───────────────────────────────────────────────────── */
type Props = {
  params: Promise<{ city: string; category: string; slug: string; branch: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, category, slug, branch } = await params;
  const profile = await getBranchProfile(slug, branch);
  if (!profile) return {};

  const displayName = profile.nameEn ?? profile.name;
  const catShort    = profile.categoryName.replace(" Clinics", "");
  const district    = profile.district ?? profile.cityName;
  const title       = `${displayName} — ${catShort} in ${district}, ${profile.cityName} | ThailandClinics`;
  const description = `${displayName} is a verified ${catShort.toLowerCase()} clinic in ${district}, ${profile.cityName}. View reviews, opening hours and contact details for this branch.`;

  return {
    title,
    description,
    alternates: { canonical: `/${city}/${category}/${slug}/${branch}/` },
    openGraph: { title, description },
  };
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default async function BranchProfilePage({ params }: Props) {
  const { city, category, slug, branch } = await params;

  const profile = await getBranchProfile(slug, branch);
  if (!profile) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailand-clinics.com";

  // Brand context for cross-linking
  const brand = {
    name:        profile.brandName,
    slug:        profile.brandSlug,
    branchCount: profile.brandBranchCount,
  };

  const schemas = buildClinicSchema(profile, siteUrl, brand, branch);

  /* Fetch reviews, nearby pool, and brand siblings in parallel */
  const [reviews, nearbyPool, siblings] = await Promise.all([
    getClinicReviews(profile.id, 20),
    (async () => {
      const { db } = await import("@/lib/db/index");
      const { clinics: c, cities: ct, categories: cat } = await import("@/lib/db/schema");
      const { eq: eqF, and: andF, ne: neF, isNull: isNullF } = await import("drizzle-orm");
      return db.select({
        id: c.id, name: c.name, nameEn: c.nameEn, slug: c.slug,
        district: c.district, lat: c.lat, lng: c.lng,
        googleRating: c.googleRating, googleReviewsCount: c.googleReviewsCount,
      })
      .from(c)
      .innerJoin(ct,  eqF(c.cityId,     ct.id))
      .innerJoin(cat, eqF(c.categoryId, cat.id))
      .where(andF(eqF(ct.slug, city), eqF(cat.slug, category), neF(c.id, profile.id), isNullF(c.brandId)));
    })(),
    profile.brandId != null
      ? getBrandSiblings(profile.brandId, branch)
      : Promise.resolve([]),
  ]);

  /* Nearby — sort by haversine distance, take 3 (same approach as standalone) */
  const nearby = nearbyPool
    .map((n) => ({ ...n, dist: haversine(profile.lat, profile.lng, n.lat, n.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3);

  return (
    <ClinicProfileView
      clinic={profile}
      reviews={reviews}
      nearby={nearby}
      schemas={schemas}
      brand={brand}
      branchSlug={branch}
      siblings={siblings}
    />
  );
}
