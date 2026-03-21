import type { Metadata } from "next";
import CategoryLandingPage from "@/components/pages/CategoryLandingPage";

const CAT_SLUG = "dental-clinics";

export const metadata: Metadata = {
  title: "Dental Clinics in Thailand — Verified Directory | ThailandClinics",
  description: "Browse verified dental clinics across Bangkok, Phuket, Chiang Mai and Pattaya. Implants, veneers, orthodontics at 50–70% below Western prices.",
  alternates: { canonical: `/${CAT_SLUG}/` },
  openGraph: {
    title: "Dental Clinics in Thailand — Verified Directory | ThailandClinics",
    description: "Browse verified dental clinics across Bangkok, Phuket, Chiang Mai and Pattaya. Implants, veneers, orthodontics at 50–70% below Western prices.",
  },
};

export default function DentalClinicsPage() {
  return <CategoryLandingPage catSlug={CAT_SLUG} />;
}
