import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import CompactClinicRow from "@/components/clinic/CompactClinicRow";
import {
  getCategoryCountsForCity,
  getTopClinicsByCity,
} from "@/lib/db/queries";

/* ─── Config ─────────────────────────────────────────────────────── */
const CITIES = ["bangkok", "phuket", "chiang-mai", "pattaya"];

export const dynamicParams = false;
export function generateStaticParams() {
  return CITIES.map(city => ({ city }));
}

/* ─── Helpers ────────────────────────────────────────────────────── */
const CITY_LABELS: Record<string, string> = {
  "bangkok":    "Bangkok",
  "phuket":     "Phuket",
  "chiang-mai": "Chiang Mai",
  "pattaya":    "Pattaya",
};

const CITY_INTROS: Record<string, string> = {
  "bangkok":    "Bangkok is Thailand's medical hub, with hundreds of internationally accredited clinics serving expats and medical tourists.",
  "phuket":     "Phuket's thriving expat community is served by a growing network of English-speaking clinics across all specialties.",
  "chiang-mai": "Chiang Mai offers affordable, high-quality healthcare with a large expat-friendly clinic network in the city centre.",
  "pattaya":    "Pattaya has a well-developed healthcare infrastructure catering to its large international resident population.",
};

const CATEGORIES = [
  { slug: "physiotherapy-clinics", label: "Physiotherapy Clinics", icon: "🏃" },
  { slug: "dental-clinics",        label: "Dental Clinics",        icon: "🦷" },
  { slug: "cosmetic-clinics",      label: "Cosmetic Clinics",      icon: "✨" },
  { slug: "wellness-clinics",      label: "Wellness Clinics",      icon: "🌿" },
];

const CAT_COLORS: Record<string, string> = {
  "physiotherapy-clinics": "linear-gradient(135deg, #1a4731 0%, #0f2d1f 100%)",
  "dental-clinics":        "linear-gradient(135deg, #2a4a5c 0%, #1a3040 100%)",
  "cosmetic-clinics":      "linear-gradient(135deg, #5c2a4a 0%, #3d1a30 100%)",
  "wellness-clinics":      "linear-gradient(135deg, #4a5c2a 0%, #2d3d1a 100%)",
};

/* ─── Metadata ───────────────────────────────────────────────────── */
type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityName = CITY_LABELS[city] ?? city;
  const title       = `${cityName} Clinics — Verified Healthcare Directory | ThailandClinics`;
  const description = `Browse verified dental, physiotherapy, cosmetic and wellness clinics in ${cityName}. Trusted by expats and medical tourists. Filter by English-speaking staff.`;
  return {
    title,
    description,
    alternates: { canonical: `/${city}/` },
    openGraph:  { title, description },
  };
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default async function CityPage({ params }: Props) {
  const { city } = await params;
  if (!CITIES.includes(city)) notFound();

  const cityName = CITY_LABELS[city];
  const intro    = CITY_INTROS[city];

  const [catCounts, topClinics] = await Promise.all([
    getCategoryCountsForCity(city),
    getTopClinicsByCity(city, 6),
  ]);

  const countMap: Record<string, number> = {};
  for (const r of catCounts) countMap[r.categorySlug] = r.count;
  const totalClinics = Object.values(countMap).reduce((a, b) => a + b, 0);

  /* ─── Schema ─────────────────────────────────────────────────── */
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home",    "item": "https://thailandclinics.co/" },
          { "@type": "ListItem", "position": 2, "name": cityName,  "item": `https://thailandclinics.co/${city}/` },
        ],
      },
      {
        "@type": "ItemList",
        "name": `Clinics in ${cityName}`,
        "numberOfItems": totalClinics,
        "url": `https://thailandclinics.co/${city}/`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Nav />

      <main style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>

        {/* ── Hero / Title ─────────────────────────────────────── */}
        <div style={{ background: "var(--white)", borderBottom: "1px solid var(--border-soft)", padding: "40px 48px 36px" }} className="city-hero-pad">

          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "var(--muted)", marginBottom: "20px" }}>
            <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</Link>
            <span style={{ opacity: 0.4 }}>›</span>
            <span style={{ color: "var(--charcoal-soft)" }}>{cityName}</span>
          </nav>

          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "12px" }}>
            Healthcare Directory
          </p>

          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "42px", fontWeight: 400, color: "var(--charcoal)", lineHeight: 1.15, marginBottom: "16px" }}>
            Clinics in <em style={{ fontStyle: "italic", color: "var(--green)" }}>{cityName}</em>
          </h1>

          <p style={{ fontSize: "16px", color: "var(--charcoal-soft)", marginBottom: "24px", maxWidth: "560px", lineHeight: 1.6 }}>
            Find verified physiotherapy, dental, cosmetic and wellness clinics in {cityName}.
          </p>

          {/* Stat row */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            {[
              { label: "clinics listed", value: totalClinics },
              { label: "categories",     value: 4 },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "24px", fontWeight: 500, color: "var(--green)" }}>{value}</span>
                <span style={{ fontSize: "13px", color: "var(--muted)" }}>{label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>Updated monthly</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 48px 72px" }} className="city-content-pad">

          {/* ── Category tiles ─────────────────────────────────── */}
          <section style={{ marginBottom: "56px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "20px" }}>
              Browse by Specialty
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }} className="city-cat-grid">
              {CATEGORIES.map(cat => {
                const catCount = countMap[cat.slug] ?? 0;
                return (
                  <Link key={cat.slug} href={`/${city}/${cat.slug}/`} style={{
                    display: "flex", flexDirection: "column", justifyContent: "flex-end",
                    background: CAT_COLORS[cat.slug],
                    borderRadius: "6px", padding: "24px 20px 20px",
                    textDecoration: "none", minHeight: "140px",
                    position: "relative", overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }} className="city-cat-tile">
                    <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "20px", fontWeight: 500, color: "rgba(255,255,255,0.95)", lineHeight: 1.2, marginBottom: "6px" }}>
                      {cat.label}
                    </p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", fontWeight: 400 }}>
                      {catCount} clinics
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── Most reviewed clinics ───────────────────────────── */}
          {topClinics.length > 0 && (
            <section style={{ marginBottom: "56px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "20px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
                  Most Reviewed in {cityName}
                </p>
              </div>
              <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: "6px", overflow: "hidden" }}>
                {topClinics.map((clinic, i) => (
                  <CompactClinicRow
                    key={clinic.id}
                    clinic={clinic}
                    rank={i + 1}
                    citySlug={city}
                    catSlug={(clinic as any).categorySlug}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── City intro ──────────────────────────────────────── */}
          <section style={{
            background: "var(--white)", border: "1px solid var(--border-soft)",
            borderRadius: "6px", padding: "28px 32px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "12px" }}>
              About Healthcare in {cityName}
            </p>
            <p style={{ fontSize: "15px", color: "var(--charcoal-soft)", lineHeight: 1.7 }}>
              {intro}
            </p>
          </section>

        </div>
      </main>
    </>
  );
}
