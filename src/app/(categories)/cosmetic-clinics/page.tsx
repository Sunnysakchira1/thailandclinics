import type { Metadata } from "next";
import CategoryLandingPage from "@/components/pages/CategoryLandingPage";

const CAT_SLUG = "cosmetic-clinics";

export const metadata: Metadata = {
  title: "Cosmetic Clinics in Thailand — Verified Directory | ThailandClinics",
  description: "Browse verified cosmetic clinics across Bangkok, Phuket, Chiang Mai and Pattaya. Botox, fillers, surgical procedures. Trusted by medical tourists.",
  alternates: { canonical: `/${CAT_SLUG}/` },
  openGraph: {
    title: "Cosmetic Clinics in Thailand — Verified Directory | ThailandClinics",
    description: "Browse verified cosmetic clinics across Bangkok, Phuket, Chiang Mai and Pattaya. Botox, fillers, surgical procedures. Trusted by medical tourists.",
  },
};

export default function CosmeticClinicsPage() {
  return <CategoryLandingPage catSlug={CAT_SLUG} />;
}
