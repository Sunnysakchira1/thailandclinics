import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "Thailand Clinics — Find Verified Dental, Physio & Cosmetic Clinics",
  description:
    "Find verified dental, physiotherapy, cosmetic, and wellness clinics in Bangkok, Phuket, Chiang Mai and Pattaya. Trusted by expats and medical tourists since 2024.",
  alternates: {
    canonical: "/",
  },
};

const cities = [
  {
    name: "Bangkok",
    slug: "bangkok",
    tagline: "600+ clinics across 50 districts",
    gradient: "linear-gradient(160deg, #2a5c40 0%, #1a3d2b 100%)",
  },
  {
    name: "Phuket",
    slug: "phuket",
    tagline: "Island clinics serving expats & tourists",
    gradient: "linear-gradient(160deg, #2a4a5c 0%, #1a3040 100%)",
  },
  {
    name: "Chiang Mai",
    slug: "chiang-mai",
    tagline: "Northern Thailand's wellness hub",
    gradient: "linear-gradient(160deg, #5c432a 0%, #3d2d1a 100%)",
  },
  {
    name: "Pattaya",
    slug: "pattaya",
    tagline: "Coastal clinics, English-speaking",
    gradient: "linear-gradient(160deg, #5c2a3e 0%, #3d1a28 100%)",
  },
];

const categories = [
  { name: "Physiotherapy", slug: "physiotherapy-clinics", icon: "🦴" },
  { name: "Dental",        slug: "dental-clinics",        icon: "🦷" },
  { name: "Cosmetic",      slug: "cosmetic-clinics",      icon: "✨" },
  { name: "Wellness",      slug: "wellness-clinics",      icon: "🌿" },
];

export default function HomePage() {
  return (
    <>
      <Nav />

      <main>
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section
          style={{
            backgroundColor: "var(--linen)",
            padding: "80px 48px 72px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* Eyebrow */}
          <p
            className="animate-fade-up delay-0"
            style={{
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--terracotta)",
              marginBottom: "16px",
              opacity: 0,
            }}
          >
            Healthcare in Thailand
          </p>

          {/* Headline */}
          <h1
            className="animate-fade-up delay-100"
            style={{
              fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
              fontSize: "clamp(48px, 7vw, 84px)",
              fontWeight: 300,
              lineHeight: 1.05,
              color: "var(--charcoal)",
              maxWidth: "800px",
              marginBottom: "24px",
              opacity: 0,
            }}
          >
            Find the right clinic,{" "}
            <em style={{ color: "var(--green)", fontStyle: "italic" }}>
              verified
            </em>{" "}
            for you
          </h1>

          {/* Subtitle */}
          <p
            className="animate-fade-up delay-200"
            style={{
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize: "16px",
              fontWeight: 400,
              color: "var(--charcoal-soft)",
              maxWidth: "520px",
              lineHeight: 1.65,
              marginBottom: "40px",
              opacity: 0,
            }}
          >
            Physiotherapy, dental, cosmetic and wellness clinics across Bangkok,
            Phuket, Chiang Mai and Pattaya — vetted and trusted by expats.
          </p>

          {/* Search bar */}
          <div
            className="animate-fade-up delay-300"
            style={{
              display: "flex",
              gap: "0",
              maxWidth: "560px",
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              boxShadow: "0 2px 24px rgba(26,71,49,0.06)",
              marginBottom: "48px",
              opacity: 0,
            }}
          >
            <input
              type="text"
              placeholder="Search clinics, e.g. physiotherapy Sukhumvit"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "14px 16px",
                fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                fontSize: "14px",
                color: "var(--charcoal)",
                background: "transparent",
                borderRadius: "4px 0 0 4px",
              }}
            />
            <button
              style={{
                backgroundColor: "var(--green)",
                color: "var(--white)",
                border: "none",
                padding: "14px 24px",
                fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                fontSize: "13.5px",
                fontWeight: 500,
                cursor: "pointer",
                borderRadius: "0 4px 4px 0",
                whiteSpace: "nowrap",
              }}
            >
              Search
            </button>
          </div>

          {/* Stats row */}
          <div
            className="animate-fade-up delay-400"
            style={{ display: "flex", gap: "40px", opacity: 0 }}
          >
            {[
              { value: "363+", label: "Verified clinics" },
              { value: "4",    label: "Cities covered" },
              { value: "4",    label: "Specialities" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  style={{
                    fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
                    fontSize: "28px",
                    fontWeight: 400,
                    color: "var(--charcoal)",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                    fontSize: "12px",
                    color: "var(--muted)",
                    fontWeight: 400,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Cities ─────────────────────────────────────────────── */}
        <section
          style={{
            padding: "72px 48px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--terracotta)",
              marginBottom: "12px",
            }}
          >
            Browse by City
          </p>
          <h2
            style={{
              fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
              fontSize: "36px",
              fontWeight: 400,
              color: "var(--charcoal)",
              marginBottom: "32px",
            }}
          >
            Choose your city
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                style={{
                  textDecoration: "none",
                  display: "block",
                  borderRadius: "6px",
                  overflow: "hidden",
                  background: city.gradient,
                  padding: "40px 24px 28px",
                  position: "relative",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(10,30,20,0.72) 0%, rgba(10,30,20,0.1) 60%)",
                  }}
                />
                <div style={{ position: "relative" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
                      fontSize: "28px",
                      fontWeight: 400,
                      color: "var(--white)",
                      marginBottom: "8px",
                    }}
                  >
                    {city.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                      fontSize: "12.5px",
                      color: "rgba(255,255,255,0.75)",
                      fontWeight: 400,
                    }}
                  >
                    {city.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Categories ─────────────────────────────────────────── */}
        <section
          style={{
            padding: "0 48px 72px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--terracotta)",
              marginBottom: "12px",
            }}
          >
            Browse by Speciality
          </p>
          <h2
            style={{
              fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
              fontSize: "36px",
              fontWeight: 400,
              color: "var(--charcoal)",
              marginBottom: "32px",
            }}
          >
            What are you looking for?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/bangkok/${cat.slug}`}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "20px 24px",
                  background: "var(--white)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "6px",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <span style={{ fontSize: "24px" }}>{cat.icon}</span>
                <span
                  style={{
                    fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
                    fontSize: "21px",
                    fontWeight: 500,
                    color: "var(--charcoal)",
                  }}
                >
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        style={{
          backgroundColor: "var(--footer-bg)",
          color: "rgba(255,255,255,0.6)",
          padding: "48px",
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          fontSize: "13px",
          fontWeight: 400,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
              fontSize: "18px",
            }}
          >
            <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.7)" }}>thailand</span>
            <span style={{ fontWeight: 600, color: "var(--green-light)" }}>clinics</span>
          </span>
          <p>© 2024 ThailandClinics.co — Built for expats and medical tourists</p>
        </div>
      </footer>
    </>
  );
}
