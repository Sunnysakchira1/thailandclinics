import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";
import StructuredData from "@/components/seo/StructuredData";
import CompareClient from "@/components/clinic/CompareClient";
import { NOINDEX_FOLLOW } from "@/lib/indexation";

const title = "Compare Clinics in Thailand Side by Side | ThailandClinics";
const description =
  "Compare up to three clinics in Thailand side by side: Google ratings, nearest station, opening hours, English-speaking staff, parking and treatments.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/compare/" },
  openGraph: { title, description },
  // Every visitor's list is different, so there is nothing here for search to index.
  robots: NOINDEX_FOLLOW,
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://thailand-clinics.com/" },
    { "@type": "ListItem", position: 2, name: "Compare clinics", item: "https://thailand-clinics.com/compare/" },
  ],
};

export default function ComparePage() {
  return (
    <>
      <StructuredData data={breadcrumb} />
      <Nav />
      <CompareClient />
    </>
  );
}
