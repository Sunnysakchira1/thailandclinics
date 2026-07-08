import type { Metadata } from "next";
import CategoryLandingPage from "@/components/pages/CategoryLandingPage";

const CAT_SLUG = "fertility-clinics";

export const metadata: Metadata = {
  title: "IVF & Fertility Clinics in Thailand — Verified | ThailandClinics",
  description: "Browse verified IVF & fertility clinics across Bangkok, Phuket, Chiang Mai and Pattaya. IVF, ICSI, egg freezing & genetic screening. Trusted by medical tourists.",
  alternates: { canonical: `/${CAT_SLUG}/` },
  openGraph: {
    title: "IVF & Fertility Clinics in Thailand — Verified | ThailandClinics",
    description: "Browse verified IVF & fertility clinics across Bangkok, Phuket, Chiang Mai and Pattaya. IVF, ICSI, egg freezing & genetic screening. Trusted by medical tourists.",
  },
};

export default function FertilityClinicsPage() {
  return <CategoryLandingPage catSlug={CAT_SLUG} />;
}
