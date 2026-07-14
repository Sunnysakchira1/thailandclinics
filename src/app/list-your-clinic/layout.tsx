import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your Clinic — Get Verified & Featured | ThailandClinics",
  description:
    "Add your clinic to ThailandClinics — the directory trusted by expats and medical tourists. Get a verified badge, enhanced profile and priority visibility.",
  alternates: { canonical: "/list-your-clinic/" },
  openGraph: {
    title: "List Your Clinic — Get Verified & Featured | ThailandClinics",
    description:
      "Add your clinic to ThailandClinics — the directory trusted by expats and medical tourists. Verified badge, enhanced profile and priority visibility.",
  },
};

export default function ListYourClinicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
