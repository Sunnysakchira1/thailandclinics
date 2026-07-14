import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import { getGuideCombos } from "@/lib/db/queries";
import { GUIDE_CITIES, GUIDE_CATEGORIES, guideSlug } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Clinic Guides — How to Choose a Clinic in Thailand | ThailandClinics",
  description: "Practical guides to choosing the right clinic in Thailand — the criteria that matter, real treatment costs, red flags to avoid and shortlists of verified top-rated clinics.",
  alternates: { canonical: "/guides/" },
};

export default async function GuidesIndexPage() {
  const combos = (await getGuideCombos())
    .filter((c) => GUIDE_CATEGORIES[c.categorySlug] && GUIDE_CITIES[c.citySlug] && c.count >= 5)
    .sort((a, b) => a.citySlug.localeCompare(b.citySlug) || a.categorySlug.localeCompare(b.categorySlug));

  // group by city
  const byCity = new Map<string, typeof combos>();
  for (const c of combos) {
    if (!byCity.has(c.citySlug)) byCity.set(c.citySlug, []);
    byCity.get(c.citySlug)!.push(c);
  }

  return (
    <>
      <Nav />
      <main style={{ backgroundColor: "var(--linen)", minHeight: "70vh" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto", padding: "56px 24px 88px" }}>
          <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "14px" }}>
            Guides
          </p>
          <h1 style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "clamp(32px,5vw,48px)", fontWeight: 400, lineHeight: 1.12, color: "var(--charcoal)", marginBottom: "18px" }}>
            How to choose a <em style={{ fontStyle: "italic", color: "var(--green)" }}>clinic in Thailand</em>
          </h1>
          <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "16px", lineHeight: 1.75, color: "var(--charcoal-soft)", marginBottom: "48px", maxWidth: "620px" }}>
            Practical, no-nonsense guides for expats and medical tourists: the criteria that matter, what treatment really costs, the red flags to avoid, and a shortlist of verified top-rated clinics for each.
          </p>

          {[...byCity.entries()].map(([citySlug, list]) => (
            <section key={citySlug} style={{ marginBottom: "44px" }}>
              <h2 style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "26px", fontWeight: 400, color: "var(--charcoal)", marginBottom: "20px" }}>
                {GUIDE_CITIES[citySlug].name}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {list.map((c) => {
                  const cat = GUIDE_CATEGORIES[c.categorySlug];
                  return (
                    <Link key={c.categorySlug} href={`/guides/${guideSlug(citySlug, c.categorySlug)}/`} style={{ textDecoration: "none" }}>
                      <div style={{ border: "1px solid var(--border-soft)", borderRadius: "6px", background: "var(--white)", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }} className="guide-clinic-row">
                        <span style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "20px", fontWeight: 500, color: "var(--charcoal)" }}>
                          How to choose a {cat.noun} in {GUIDE_CITIES[citySlug].name}
                        </span>
                        <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13px", color: "var(--green)", whiteSpace: "nowrap" }}>{c.count} clinics →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
