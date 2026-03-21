import type { Metadata } from "next";
import CategoryLandingPage from "@/components/pages/CategoryLandingPage";

const CAT_SLUG = "physiotherapy-clinics";

export const metadata: Metadata = {
  title: "Physiotherapy Clinics in Thailand — Verified Directory | ThailandClinics",
  description: "Browse verified physiotherapy clinics across Bangkok, Phuket, Chiang Mai and Pattaya. English-speaking staff, sports injury, rehab. Trusted by expats.",
  alternates: { canonical: `/${CAT_SLUG}/` },
  openGraph: {
    title: "Physiotherapy Clinics in Thailand — Verified Directory | ThailandClinics",
    description: "Browse verified physiotherapy clinics across Bangkok, Phuket, Chiang Mai and Pattaya. English-speaking staff, sports injury, rehab. Trusted by expats.",
  },
};

export default function PhysiotherapyClinicsPage() {
  return <CategoryLandingPage catSlug={CAT_SLUG} />;
}
