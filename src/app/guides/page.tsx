import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import StructuredData from "@/components/seo/StructuredData";
import { getGuideCombos } from "@/lib/db/queries";
import { getAllPosts } from "@/lib/mdx";
import { buildGuidesHub, type HubItem } from "@/lib/guidesHub";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailand-clinics.com";

export const metadata: Metadata = {
  title: "Thailand Clinic Guides by City & Specialty | ThailandClinics",
  description: "Every ThailandClinics guide in one place: expat guides, ranked best-of lists, comparisons and checklists for Bangkok and Phuket, sorted by specialty.",
  alternates: { canonical: "/guides/" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Guides", item: `${siteUrl}/guides/` },
  ],
};

const SERIF = "var(--font-cormorant,'Cormorant Garamond',serif)";
const SANS = "var(--font-dm-sans,'DM Sans',sans-serif)";

function monthYear(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function HubCard({ item }: { item: HubItem }) {
  return (
    <Link href={item.href} className="guides-hub-card" style={{
      display: "flex", flexDirection: "column", gap: "8px", textDecoration: "none",
      background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: "6px", padding: "18px 20px",
    }}>
      <span style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--terracotta)" }}>
        {item.kind}
      </span>
      <span style={{ fontFamily: SERIF, fontSize: "21px", fontWeight: 500, lineHeight: 1.2, color: "var(--charcoal)" }}>
        {item.title}
      </span>
      <span style={{ fontFamily: SANS, fontSize: "14px", lineHeight: 1.6, color: "var(--charcoal-soft)" }}>
        {item.description}
      </span>
      <span style={{ fontFamily: SANS, fontSize: "12px", color: "var(--muted)", marginTop: "auto", paddingTop: "4px" }}>
        Updated {monthYear(item.updatedAt)}
      </span>
    </Link>
  );
}

export default async function GuidesIndexPage() {
  const hub = buildGuidesHub(getAllPosts(), await getGuideCombos());

  return (
    <>
      <StructuredData data={[breadcrumbSchema]} />
      <Nav />
      <main style={{ backgroundColor: "var(--linen)", minHeight: "70vh" }}>
        <div className="guides-hub-wrap" style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "14px" }}>
            Guides
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(32px,5vw,48px)", fontWeight: 400, lineHeight: 1.12, color: "var(--charcoal)", marginBottom: "18px" }}>
            Clinic guides for <em style={{ fontStyle: "italic", color: "var(--green)" }}>Bangkok and Phuket</em>
          </h1>
          <p style={{ fontFamily: SANS, fontSize: "16px", lineHeight: 1.75, color: "var(--charcoal-soft)", marginBottom: "24px", maxWidth: "640px" }}>
            Every guide we&rsquo;ve written, sorted by city and specialty: start with the expat guide for your treatment, then use the ranked lists, comparisons and checklists to build your shortlist.
          </p>

          <nav aria-label="Jump to city" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "44px" }}>
            {hub.cities.map((c) => (
              <a key={c.slug} href={`#${c.slug}`} className="guides-hub-pill" style={{
                fontFamily: SANS, fontSize: "13.5px", color: "var(--green)", background: "var(--white)",
                border: "1px solid var(--border)", borderRadius: "100px", padding: "7px 16px", textDecoration: "none",
              }}>
                {c.name} guides
              </a>
            ))}
          </nav>

          {/* Latest */}
          <section aria-labelledby="latest-heading" style={{ marginBottom: "56px" }}>
            <h2 id="latest-heading" style={{ fontFamily: SERIF, fontSize: "28px", fontWeight: 400, color: "var(--charcoal)", marginBottom: "18px" }}>
              Latest
            </h2>
            <div className="guides-hub-grid">
              {hub.latest.map((item) => <HubCard key={item.key} item={item} />)}
            </div>
          </section>

          {hub.cities.map((city) => (
            <section key={city.slug} id={city.slug} style={{ marginBottom: "56px", scrollMarginTop: "88px" }}>
              <h2 style={{ fontFamily: SERIF, fontSize: "36px", fontWeight: 400, color: "var(--charcoal)", marginBottom: "8px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                {city.name}
              </h2>
              {city.specialties.map((spec) => (
                <div key={spec.slug} style={{ marginTop: "28px" }}>
                  <h3 style={{ fontFamily: SERIF, fontSize: "24px", fontWeight: 500, color: "var(--green)", marginBottom: "14px" }}>
                    {spec.label}
                  </h3>
                  <div className="guides-hub-grid">
                    {spec.items.map((item) => <HubCard key={item.key} item={item} />)}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
