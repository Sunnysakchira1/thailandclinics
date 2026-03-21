import type { Metadata } from "next";
import CategoryLandingPage from "@/components/pages/CategoryLandingPage";

const CAT_SLUG = "wellness-clinics";

export const metadata: Metadata = {
  title: "Wellness Clinics in Thailand — Verified Directory | ThailandClinics",
  description: "Browse verified wellness clinics across Bangkok, Phuket, Chiang Mai and Pattaya. IV therapy, health screening, preventive care. Trusted by expats.",
  alternates: { canonical: `/${CAT_SLUG}/` },
  openGraph: {
    title: "Wellness Clinics in Thailand — Verified Directory | ThailandClinics",
    description: "Browse verified wellness clinics across Bangkok, Phuket, Chiang Mai and Pattaya. IV therapy, health screening, preventive care. Trusted by expats.",
  },
};

export default function WellnessClinicsPage() {
  return <CategoryLandingPage catSlug={CAT_SLUG} />;
}
