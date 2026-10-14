import type { Metadata } from "next";

const title = "Get Matched With a Clinic in Thailand, Free | ThailandClinics";
const description =
  "Tell us what treatment you need and we'll send a free shortlist of 2–3 verified, English-speaking clinics in Thailand that fit your case, with reasons.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/get-matched/" },
  openGraph: { title, description },
};

export default function GetMatchedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
