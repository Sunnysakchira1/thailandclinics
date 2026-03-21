import Link from "next/link";
import Nav from "@/components/layout/Nav";
import CompactClinicRow from "@/components/clinic/CompactClinicRow";
import {
  getCityCountsForCategory,
  getTopClinicsByCategory,
} from "@/lib/db/queries";

/* ─── Config ─────────────────────────────────────────────────────── */
const CITIES = [
  { slug: "bangkok",    label: "Bangkok" },
  { slug: "phuket",     label: "Phuket" },
  { slug: "chiang-mai", label: "Chiang Mai" },
  { slug: "pattaya",    label: "Pattaya" },
];

const CAT_LABELS: Record<string, string> = {
  "physiotherapy-clinics": "Physiotherapy Clinics",
  "dental-clinics":        "Dental Clinics",
  "cosmetic-clinics":      "Cosmetic Clinics",
  "wellness-clinics":      "Wellness Clinics",
};

const CAT_SHORT: Record<string, string> = {
  "physiotherapy-clinics": "Physiotherapy",
  "dental-clinics":        "Dental",
  "cosmetic-clinics":      "Cosmetic",
  "wellness-clinics":      "Wellness",
};

const CAT_INTROS: Record<string, string> = {
  "physiotherapy-clinics": "Thailand's physiotherapy clinics offer world-class treatment for sports injuries, office syndrome, and post-surgical rehabilitation at a fraction of Western prices.",
  "dental-clinics":        "Thailand is one of Asia's top dental tourism destinations, offering implants, veneers, and orthodontics at 50–70% below European and Australian prices.",
  "cosmetic-clinics":      "Bangkok's cosmetic clinics attract medical tourists from across Asia and beyond, offering everything from Botox to full surgical procedures.",
  "wellness-clinics":      "Thailand's wellness clinics blend Eastern and Western approaches, offering IV therapy, health screening, and preventive care.",
};

const CAT_SUBTITLES: Record<string, string> = {
  "physiotherapy-clinics": "Find verified physiotherapy clinics across Bangkok, Phuket, Chiang Mai and Pattaya.",
  "dental-clinics":        "Find verified dental clinics across Bangkok, Phuket, Chiang Mai and Pattaya.",
  "cosmetic-clinics":      "Find verified cosmetic clinics across Bangkok, Phuket, Chiang Mai and Pattaya.",
  "wellness-clinics":      "Find verified wellness clinics across Bangkok, Phuket, Chiang Mai and Pattaya.",
};

/* ─── Component ──────────────────────────────────────────────────── */
export default async function CategoryLandingPage({ catSlug }: { catSlug: string }) {
  const catName  = CAT_LABELS[catSlug];
  const catShort = CAT_SHORT[catSlug];
  const subtitle = CAT_SUBTITLES[catSlug];
  const intro    = CAT_INTROS[catSlug];

  const [cityCounts, topClinics] = await Promise.all([
    getCityCountsForCategory(catSlug),
    getTopClinicsByCategory(catSlug, 6),
  ]);

  const countMap: Record<string, number> = {};
  for (const r of cityCounts) countMap[r.citySlug] = r.count;
  const totalClinics = Object.values(countMap).reduce((a, b) => a + b, 0);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home",    "item": "https://thailandclinics.co/" },
          { "@type": "ListItem", "position": 2, "name": catName,   "item": `https://thailandclinics.co/${catSlug}/` },
        ],
      },
      {
        "@type": "MedicalSpecialty",
        "name": catName,
        "url":  `https://thailandclinics.co/${catSlug}/`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Nav />

      <main style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <div style={{ background: "var(--white)", borderBottom: "1px solid var(--border-soft)", padding: "40px 48px 36px" }} className="city-hero-pad">

          <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "var(--muted)", marginBottom: "20px" }}>
            <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</Link>
            <span style={{ opacity: 0.4 }}>›</span>
            <span style={{ color: "var(--charcoal-soft)" }}>{catName}</span>
          </nav>

          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "12px" }}>
            {catShort}
          </p>

          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "42px", fontWeight: 400, color: "var(--charcoal)", lineHeight: 1.15, marginBottom: "16px" }}>
            {catName} in <em style={{ fontStyle: "italic", color: "var(--green)" }}>Thailand</em>
          </h1>

          <p style={{ fontSize: "16px", color: "var(--charcoal-soft)", marginBottom: "24px", maxWidth: "560px", lineHeight: 1.6 }}>
            {subtitle}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "24px", fontWeight: 500, color: "var(--green)" }}>{totalClinics}</span>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>clinics listed</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "24px", fontWeight: 500, color: "var(--green)" }}>4</span>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>cities</span>
            </div>
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>Updated monthly</span>
          </div>
        </div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 48px 72px" }} className="city-content-pad">

          {/* ── City tiles ─────────────────────────────────────── */}
          <section style={{ marginBottom: "56px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "20px" }}>
              Browse by City
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }} className="city-cat-grid">
              {CITIES.map(c => {
                const cnt = countMap[c.slug] ?? 0;
                return (
                  <Link key={c.slug} href={`/${c.slug}/${catSlug}/`} style={{
                    display: "flex", flexDirection: "column", justifyContent: "center",
                    background: "var(--white)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: "6px", padding: "24px 20px",
                    textDecoration: "none", minHeight: "100px",
                    transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                  }} className="city-tile-card">
                    <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "22px", fontWeight: 400, color: "var(--charcoal)", marginBottom: "6px" }}>
                      {c.label}
                    </p>
                    <p style={{ fontSize: "12.5px", color: "var(--muted)" }}>
                      {cnt} clinics
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--green)", fontWeight: 500, marginTop: "8px" }}>
                      Browse →
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── Top rated clinics ──────────────────────────────── */}
          {topClinics.length > 0 && (
            <section style={{ marginBottom: "56px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "20px" }}>
                Top Rated {catName}
              </p>
              <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: "6px", overflow: "hidden" }}>
                {topClinics.map((clinic, i) => (
                  <CompactClinicRow
                    key={clinic.id}
                    clinic={clinic}
                    rank={i + 1}
                    citySlug={clinic.citySlug}
                    catSlug={catSlug}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Intro ──────────────────────────────────────────── */}
          <section style={{
            background: "var(--white)", border: "1px solid var(--border-soft)",
            borderRadius: "6px", padding: "28px 32px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "12px" }}>
              About {catName} in Thailand
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
