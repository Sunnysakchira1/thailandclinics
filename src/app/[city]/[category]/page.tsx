import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getListingEntries } from "@/lib/db/queries";
import ListingsClient from "@/components/clinic/ListingsClient";
import { GUIDE_CATEGORIES, guideSlug } from "@/lib/guides";

/* ─── Config ─────────────────────────────────────────────────────── */
const CITIES = ["bangkok", "phuket", "chiang-mai", "pattaya"];
const CATEGORIES = [
  "physiotherapy-clinics",
  "dental-clinics",
  "cosmetic-clinics",
  "wellness-clinics",
  "fertility-clinics",
];

export const dynamicParams = false;

export function generateStaticParams() {
  return CITIES.flatMap((city) =>
    CATEGORIES.map((category) => ({ city, category }))
  );
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function cityLabel(slug: string) {
  const map: Record<string, string> = {
    "bangkok":    "Bangkok",
    "phuket":     "Phuket",
    "chiang-mai": "Chiang Mai",
    "pattaya":    "Pattaya",
  };
  return map[slug] ?? slug;
}

function catLabel(slug: string) {
  const map: Record<string, string> = {
    "physiotherapy-clinics": "Physiotherapy Clinics",
    "dental-clinics":        "Dental Clinics",
    "cosmetic-clinics":      "Cosmetic Clinics",
    "wellness-clinics":      "Wellness Clinics",
    "fertility-clinics":     "IVF & Fertility Clinics",
  };
  return map[slug] ?? slug;
}

function catTitleLabel(slug: string) {
  const map: Record<string, string> = {
    "physiotherapy-clinics": "Physiotherapy Clinics",
    "dental-clinics":        "Dental Clinics",
    "cosmetic-clinics":      "Cosmetic Clinics",
    "wellness-clinics":      "Wellness Clinics",
    "fertility-clinics":     "IVF & Fertility Clinics",
  };
  return map[slug] ?? slug;
}

/* ─── Metadata ───────────────────────────────────────────────────── */
type Props = { params: Promise<{ city: string; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, category } = await params;
  const cityName = cityLabel(city);
  const catName  = catLabel(category);
  const catShort = catTitleLabel(category);

  const title       = `${catShort} in ${cityName} — Verified Clinics | ThailandClinics`;
  const description = `Browse verified ${catName.toLowerCase()} in ${cityName}. Filter by English-speaking staff, BTS/MRT access and review count. Trusted by expats since 2024.`;

  return {
    title,
    description,
    alternates: { canonical: `/${city}/${category}/` },
    openGraph:  { title, description },
  };
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default async function CategoryPage({ params }: Props) {
  const { city, category } = await params;

  if (!CITIES.includes(city) || !CATEGORIES.includes(category)) {
    notFound();
  }

  const clinicList = await getListingEntries(city, category);
  // Reverse link to the AIO guide — only when a guide exists for this combo.
  const guideCat = GUIDE_CATEGORIES[category];
  const guideHref = guideCat && clinicList.length >= 5 ? `/guides/${guideSlug(city, category)}/` : null;
  const guideLabel = guideCat ? `How to choose a ${guideCat.noun} in ${cityLabel(city)}` : null;

  return (
    <ListingsClient
      clinics={clinicList}
      citySlug={city}
      catSlug={category}
      cityName={cityLabel(city)}
      catName={catLabel(category)}
      guideHref={guideHref}
      guideLabel={guideLabel}
    />
  );
}
