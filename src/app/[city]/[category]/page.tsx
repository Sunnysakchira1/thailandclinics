import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/layout/Nav";
import ClinicCard from "@/components/clinic/ClinicCard";
import { getClinicsBySlug, type ClinicListItem } from "@/lib/db/queries";

/* ─── Config ─────────────────────────────────────────────────────── */
const CITIES = ["bangkok", "phuket", "chiang-mai", "pattaya"];
const CATEGORIES = [
  "physiotherapy-clinics",
  "dental-clinics",
  "cosmetic-clinics",
  "wellness-clinics",
];

export const dynamicParams = false;

export function generateStaticParams() {
  return CITIES.flatMap((city) =>
    CATEGORIES.map((category) => ({ city, category }))
  );
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function cityLabel(slug: string) {
  const map: Record<string, string> = {
    "bangkok":    "Bangkok",
    "phuket":     "Phuket",
    "chiang-mai": "Chiang Mai",
    "pattaya":    "Pattaya",
  };
  return map[slug] ?? slug;
}

function catLabel(slug: string) {
  const map: Record<string, string> = {
    "physiotherapy-clinics": "Physiotherapy Clinics",
    "dental-clinics":        "Dental Clinics",
    "cosmetic-clinics":      "Cosmetic Clinics",
    "wellness-clinics":      "Wellness Clinics",
  };
  return map[slug] ?? slug;
}

/** Abbreviated category name for SEO titles only (H1 uses full catLabel) */
function catTitleLabel(slug: string) {
  const map: Record<string, string> = {
    "physiotherapy-clinics": "Physio Clinics",   // saves 7 chars
    "dental-clinics":        "Dental Clinics",
    "cosmetic-clinics":      "Cosmetic Clinics",
    "wellness-clinics":      "Wellness Clinics",
  };
  return map[slug] ?? slug;
}

/* ─── Metadata ───────────────────────────────────────────────────── */
type Props = { params: Promise<{ city: string; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, category } = await params;
  const cityName    = cityLabel(city);
  const catName     = catLabel(category);
  const catShort    = catTitleLabel(category);

  // Per CLAUDE.md: 55-62 chars — use abbreviated cat name for title, full name for description
  const title = `${catShort} in ${cityName} — Verified Clinics | ThailandClinics`;
  const description = `Browse verified ${catName.toLowerCase()} in ${cityName}. Filter by English-speaking staff, BTS/MRT access and review count. Trusted by expats since 2024.`;

  return {
    title,
    description,
    alternates: { canonical: `/${city}/${category}/` },
    openGraph:  { title, description },
  };
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default async function CategoryPage({ params }: Props) {
  const { city, category } = await params;

  if (!CITIES.includes(city) || !CATEGORIES.includes(category)) {
    notFound();
  }

  const cityName = cityLabel(city);
  const catName  = catLabel(category);

  const clinicList = await getClinicsBySlug(city, category);
  const count      = clinicList.length;

  return (
    <>
      <Nav />

      <main style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>

        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "1400px",
            margin:   "0 auto",
            padding:  "16px 48px",
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize: "12.5px",
            color:    "var(--muted)",
          }}
        >
          <a href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</a>
          {" / "}
          <a href={`/${city}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{cityName}</a>
          {" / "}
          <span style={{ color: "var(--charcoal-soft)" }}>{catName}</span>
        </div>

        <div
          style={{
            maxWidth: "1400px",
            margin:   "0 auto",
            padding:  "0 48px 72px",
            display:  "flex",
            gap:      "40px",
            alignItems: "flex-start",
          }}
        >
          {/* ── Sidebar ──────────────────────────────────────────── */}
          <aside
            style={{
              width:     "260px",
              flexShrink: 0,
              position:  "sticky",
              top:       "80px",
            }}
          >
            <div
              style={{
                background:   "var(--white)",
                border:       "1px solid var(--border-soft)",
                borderRadius: "6px",
                padding:      "24px",
              }}
            >
              <p
                style={{
                  fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize:      "11px",
                  fontWeight:    600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color:         "var(--muted)",
                  marginBottom:  "20px",
                }}
              >
                Filters
              </p>

              {[
                { label: "Language",     options: [{ id: "english",  label: "English speaking" }] },
                { label: "Transport",    options: [{ id: "bts", label: "Near BTS Skytrain" }, { id: "mrt", label: "Near MRT" }] },
                { label: "Availability", options: [{ id: "weekends", label: "Open weekends" }] },
              ].map((group) => (
                <div key={group.label} style={{ marginBottom: "20px" }}>
                  <p
                    style={{
                      fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
                      fontSize:      "11px",
                      fontWeight:    600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color:         "var(--charcoal-soft)",
                      marginBottom:  "10px",
                    }}
                  >
                    {group.label}
                  </p>
                  {group.options.map((opt) => (
                    <label
                      key={opt.id}
                      style={{
                        display:    "flex",
                        alignItems: "center",
                        gap:        "8px",
                        fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                        fontSize:   "13.5px",
                        color:      "var(--charcoal-soft)",
                        cursor:     "pointer",
                        marginBottom: "8px",
                      }}
                    >
                      <input type="checkbox" style={{ accentColor: "var(--green)" }} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          {/* ── Main ─────────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Header */}
            <div style={{ marginBottom: "8px" }}>
              <p
                style={{
                  fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize:      "11px",
                  fontWeight:    500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color:         "var(--terracotta)",
                  marginBottom:  "10px",
                }}
              >
                {cityName}
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
                  fontSize:   "36px",
                  fontWeight: 400,
                  color:      "var(--charcoal)",
                  marginBottom: "8px",
                  lineHeight: 1.1,
                }}
              >
                {catName} in {cityName}
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize:   "14px",
                  color:      "var(--muted)",
                  marginBottom: "24px",
                }}
              >
                {count} verified clinics — ranked by rating and review count
              </p>
            </div>

            {/* Sort pills */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
              {["Top rated", "Most reviewed"].map((label, i) => (
                <button
                  key={label}
                  style={{
                    fontFamily:   "var(--font-dm-sans, 'DM Sans', sans-serif)",
                    fontSize:     "13px",
                    fontWeight:   400,
                    padding:      "6px 16px",
                    borderRadius: "100px",
                    border:       "1px solid var(--border)",
                    background:   i === 0 ? "var(--green)" : "var(--white)",
                    color:        i === 0 ? "var(--white)" : "var(--charcoal-soft)",
                    cursor:       "pointer",
                    transition:   "background 0.2s ease",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── 3-column clinic grid ──────────────────────────── */}
            {count === 0 ? (
              <div
                style={{
                  background:   "var(--white)",
                  border:       "1px solid var(--border-soft)",
                  borderRadius: "6px",
                  padding:      "48px 32px",
                  textAlign:    "center",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
                    fontSize:   "22px",
                    color:      "var(--charcoal-soft)",
                  }}
                >
                  No clinics found yet
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                    fontSize:   "13.5px",
                    color:      "var(--muted)",
                    marginTop:  "8px",
                  }}
                >
                  {catName} data for {cityName} coming soon.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display:             "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap:                 "16px",
                }}
              >
                {clinicList.map((clinic: ClinicListItem, i: number) => (
                  <ClinicCard
                    key={clinic.id}
                    rank={i + 1}
                    name={clinic.name}
                    nameEn={clinic.nameEn}
                    slug={clinic.slug}
                    citySlug={city}
                    catSlug={category}
                    district={clinic.district}
                    rating={clinic.googleRating}
                    reviews={clinic.googleReviewsCount}
                    verified={clinic.verified}
                    englishSpeaking={clinic.englishSpeaking}
                    nearBts={clinic.nearBts}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
