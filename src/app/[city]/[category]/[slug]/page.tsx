import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getClinicProfile,
  getClinicReviews,
} from "@/lib/db/queries";
import ClinicProfileView, {
  buildClinicSchema,
  haversine,
} from "@/components/clinic/ClinicProfileView";

/* ─── Static params ─────────────────────────────────────────────── */
export async function generateStaticParams() {
  const { getStandaloneClinicSlugs, getBrandSlugs } = await import("@/lib/db/queries");
  const [clinicsR, brandsR] = await Promise.all([getStandaloneClinicSlugs(), getBrandSlugs()]);
  return [
    ...clinicsR.map((r) => ({ city: r.citySlug, category: r.categorySlug, slug: r.slug })),
    ...brandsR.map((r) => ({ city: r.citySlug, category: r.categorySlug, slug: r.slug })),
  ];
}

/* ─── Metadata ───────────────────────────────────────────────────── */
type Props = { params: Promise<{ city: string; category: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, category, slug } = await params;
  // Try brand first
  const { getBrandHub } = await import("@/lib/db/queries");
  const hub = await getBrandHub(city, category, slug);
  if (hub) {
    const catShort = hub.categoryName.replace(" Clinics", "");
    const title = `${hub.name} — ${catShort} in ${hub.cityName} | ThailandClinics`;
    const description = `Explore ${hub.branchCount ?? "all"} ${catShort.toLowerCase()} branches of ${hub.name} across ${hub.cityName}. Compare ratings, reviews, opening hours and contact details for each location.`;
    return {
      title, description,
      alternates: { canonical: `/${hub.citySlug}/${hub.categorySlug}/${hub.slug}/` },
      openGraph: { title, description },
    };
  }
  const clinic = await getClinicProfile(slug);
  if (!clinic) return {};
  const displayName = clinic.nameEn ?? clinic.name;
  const catShort    = clinic.categoryName.replace(" Clinics", "");
  const title       = `${displayName} — ${catShort} in ${clinic.district ?? clinic.cityName}, ${clinic.cityName} | ThailandClinics`;
  const description = `${displayName} is a verified ${catShort.toLowerCase()} clinic in ${clinic.district ?? clinic.cityName}, ${clinic.cityName}. View reviews, opening hours and contact details.`;
  return {
    title, description,
    alternates: { canonical: `/${clinic.citySlug}/${clinic.categorySlug}/${clinic.slug}/` },
    openGraph: { title, description },
  };
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default async function ClinicProfilePage({ params }: Props) {
  const { city, category, slug } = await params;

  // Try brand hub first
  const { getBrandHub } = await import("@/lib/db/queries");
  const hub = await getBrandHub(city, category, slug);
  if (hub) {
    const BrandHubPage = (await import("@/components/brand/BrandHubPage")).default;
    return <BrandHubPage hub={hub} />;
  }

  const clinic = await getClinicProfile(slug);
  // 404 if not found OR if it's a branch clinic (branch clinics live at nested URL only)
  if (!clinic || clinic.brandId != null) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailand-clinics.com";
  const schemas = buildClinicSchema(clinic, siteUrl);

  /* Fetch reviews + nearby in parallel */
  const [reviews, nearbyPool] = await Promise.all([
    getClinicReviews(clinic.id, 20),
    (async () => {
      const { db } = await import("@/lib/db/index");
      const { clinics: c, cities: ct, categories: cat } = await import("@/lib/db/schema");
      const { eq: eqF, and: andF, ne: neF } = await import("drizzle-orm");
      return db.select({
        id: c.id, name: c.name, nameEn: c.nameEn, slug: c.slug,
        district: c.district, lat: c.lat, lng: c.lng,
        googleRating: c.googleRating, googleReviewsCount: c.googleReviewsCount,
      })
      .from(c)
      .innerJoin(ct,  eqF(c.cityId,     ct.id))
      .innerJoin(cat, eqF(c.categoryId, cat.id))
      .where(andF(eqF(ct.slug, city), eqF(cat.slug, category), neF(c.id, clinic.id)));
    })(),
  ]);

  /* Nearby — sort by distance, take 3 */
  const nearby = nearbyPool
    .map((n) => ({ ...n, dist: haversine(clinic.lat, clinic.lng, n.lat, n.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3);

  return (
    <ClinicProfileView
      clinic={clinic}
      reviews={reviews}
      nearby={nearby}
      schemas={schemas}
    />
  );
}
