import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "Browse Clinics in Thailand — By City & Specialty | ThailandClinics",
  description:
    "Browse verified clinics across Bangkok, Chiang Mai, Phuket and Pattaya. Filter by specialty: physiotherapy, dental, cosmetic and wellness clinics.",
  alternates: { canonical: "/browse/" },
};

const CITIES = [
  { label: "Bangkok",    slug: "bangkok",    count: "330+" },
  { label: "Chiang Mai", slug: "chiang-mai", count: "Coming soon" },
  { label: "Phuket",     slug: "phuket",     count: "Coming soon" },
  { label: "Pattaya",    slug: "pattaya",    count: "Coming soon" },
];

const SPECIALTIES = [
  {
    label:       "Physiotherapy",
    slug:        "physiotherapy-clinics",
    description: "Sports rehab, back pain, post-surgery recovery.",
  },
  {
    label:       "Dental",
    slug:        "dental-clinics",
    description: "General dentistry, implants, whitening, orthodontics.",
  },
  {
    label:       "Cosmetic",
    slug:        "cosmetic-clinics",
    description: "Botox, fillers, laser treatments, skin care.",
  },
  {
    label:       "Wellness",
    slug:        "wellness-clinics",
    description: "Yoga, spa, meditation, holistic health.",
  },
];

export default function BrowsePage() {
  return (
    <>
      <Nav />
      <main style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{
          maxWidth:  "1200px",
          margin:    "0 auto",
          padding:   "64px 48px 0",
        }}>
          <p style={{
            fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
            fontSize:      "11px",
            fontWeight:    500,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color:         "var(--terracotta)",
            marginBottom:  "12px",
          }}>
            Directory
          </p>
          <h1 style={{
            fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
            fontSize:     "clamp(36px,5vw,52px)",
            fontWeight:   400,
            lineHeight:   1.1,
            color:        "var(--charcoal)",
            marginBottom: "48px",
          }}>
            Browse clinics in <em style={{ fontStyle: "italic", color: "var(--green)" }}>Thailand</em>
          </h1>
        </div>

        {/* By City */}
        <section style={{
          maxWidth: "1200px",
          margin:   "0 auto",
          padding:  "0 48px 72px",
        }}>
          <h2 style={{
            fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
            fontSize:     "28px",
            fontWeight:   400,
            color:        "var(--charcoal)",
            marginBottom: "24px",
          }}>
            By city
          </h2>
          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap:                 "16px",
          }}>
            {CITIES.map(city => (
              <Link
                key={city.slug}
                href={`/${city.slug}/`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="browse-tile"
                  style={{
                    padding:      "28px 24px",
                    background:   "var(--white)",
                    border:       "1px solid var(--border)",
                    borderRadius: "6px",
                    transition:   "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <p style={{
                    fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
                    fontSize:     "22px",
                    fontWeight:   500,
                    color:        "var(--charcoal)",
                    marginBottom: "6px",
                  }}>
                    {city.label}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize:   "13px",
                    color:      "var(--muted)",
                  }}>
                    {city.count} clinics
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* By Specialty */}
        <section style={{
          backgroundColor: "var(--linen-dark)",
          padding:         "56px 0 72px",
        }}>
          <div style={{
            maxWidth: "1200px",
            margin:   "0 auto",
            padding:  "0 48px",
          }}>
            <h2 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "28px",
              fontWeight:   400,
              color:        "var(--charcoal)",
              marginBottom: "24px",
            }}>
              By specialty
            </h2>
            <div style={{
              display:             "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap:                 "16px",
            }}>
              {SPECIALTIES.map(s => (
                <Link
                  key={s.slug}
                  href={`/bangkok/${s.slug}/`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="browse-tile"
                    style={{
                      padding:      "28px 24px",
                      background:   "var(--white)",
                      border:       "1px solid var(--border)",
                      borderRadius: "6px",
                      transition:   "transform 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <p style={{
                      fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
                      fontSize:     "22px",
                      fontWeight:   500,
                      color:        "var(--charcoal)",
                      marginBottom: "6px",
                    }}>
                      {s.label}
                    </p>
                    <p style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                      fontSize:   "13px",
                      color:      "var(--muted)",
                      lineHeight: 1.5,
                    }}>
                      {s.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
