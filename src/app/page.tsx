import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import StructuredData from "@/components/seo/StructuredData";
import { getClinicCount, getTopClinicsByReviews } from "@/lib/db/queries";

/* ─── SEO ────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Thailand Clinics — Verified Dental, Physio & Cosmetic Clinics",
  description:
    "Find verified physiotherapy, dental, cosmetic and wellness clinics in Bangkok, Chiang Mai, Phuket and Pattaya. Trusted by expats and medical tourists. English-speaking clinics flagged.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Thailand Clinics — Verified Dental, Physio & Cosmetic Clinics",
    description:
      "Find verified physiotherapy, dental, cosmetic and wellness clinics in Bangkok, Chiang Mai, Phuket and Pattaya. Trusted by expats and medical tourists.",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailandclinics.co";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type":    "WebSite",
  name:       "ThailandClinics.co",
  url:        siteUrl,
  potentialAction: {
    "@type":      "SearchAction",
    target:       { "@type": "EntryPoint", urlTemplate: `${siteUrl}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

/* ─── Static data ────────────────────────────────────────────────── */
const CARD_GRADIENTS = [
  "linear-gradient(135deg, #e8e2d9 0%, #d4cfc8 50%, #c8c0b5 100%)",
  "linear-gradient(135deg, #d4cfc8 0%, #c0b8ae 50%, #b0a89a 100%)",
  "linear-gradient(135deg, #c8d4ce 0%, #b0c0b8 50%, #9aada4 100%)",
];

const CITY_TILES = [
  { name: "Bangkok",    slug: "bangkok",    bg: "linear-gradient(160deg, #2a5c40 0%, #1a3d2b 100%)", count: "329+ clinics" },
  { name: "Chiang Mai", slug: "chiang-mai", bg: "linear-gradient(160deg, #5c432a 0%, #3d2d1a 100%)", count: "Coming soon" },
  { name: "Phuket",     slug: "phuket",     bg: "linear-gradient(160deg, #2a4a5c 0%, #1a3040 100%)", count: "Coming soon" },
  { name: "Pattaya",    slug: "pattaya",    bg: "linear-gradient(160deg, #5c2a3e 0%, #3d1a28 100%)", count: "Coming soon" },
  { name: "Koh Samui",  slug: "koh-samui",  bg: "linear-gradient(160deg, #3a5c2a 0%, #253d1a 100%)", count: "Coming soon" },
];

/* ─── Page ───────────────────────────────────────────────────────── */
export default async function HomePage() {
  const [physioCount, topClinics] = await Promise.all([
    getClinicCount("bangkok", "physiotherapy-clinics"),
    getTopClinicsByReviews("bangkok", "physiotherapy-clinics", 3),
  ]);

  return (
    <>
      <StructuredData data={[websiteSchema]} />
      <Nav />

      <main style={{ backgroundColor: "var(--linen)" }}>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — HERO
        ══════════════════════════════════════════════════════ */}
        <section style={{ backgroundColor: "var(--linen)" }}>
          <div className="hero-pad" style={{
            maxWidth:  "1100px",
            margin:    "0 auto",
            textAlign: "center",
          }}>
            {/* Eyebrow */}
            <p
              className="hero-eyebrow animate-fade-up delay-0"
              style={{
                display:       "inline-flex",
                alignItems:    "center",
                gap:           "8px",
                fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
                fontSize:      "12px",
                fontWeight:    500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color:         "var(--terracotta)",
                marginBottom:  "28px",
                opacity:       0,
              }}
            >
              Thailand&rsquo;s Healthcare Directory
            </p>

            {/* H1 */}
            <h1
              className="animate-fade-up delay-100"
              style={{
                fontFamily:    "var(--font-cormorant, 'Cormorant Garamond', serif)",
                fontSize:      "clamp(48px, 7vw, 84px)",
                fontWeight:    300,
                lineHeight:    1.08,
                letterSpacing: "-0.01em",
                color:         "var(--charcoal)",
                marginBottom:  "24px",
                opacity:       0,
              }}
            >
              The definitive guide to<br />
              <em style={{ fontStyle: "italic", color: "var(--green)" }}>healthcare in Thailand</em>
            </h1>

            {/* Subtitle */}
            <p
              className="animate-fade-up delay-200"
              style={{
                fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                fontSize:   "17px",
                fontWeight: 300,
                color:      "var(--muted)",
                maxWidth:   "520px",
                margin:     "0 auto 48px",
                lineHeight: 1.65,
                opacity:    0,
              }}
            >
              Trusted by expats and medical tourists across Bangkok, Chiang Mai, Phuket and beyond.
            </p>

            {/* Search bar */}
            <div
              className="animate-fade-up delay-300"
              style={{
                display:      "flex",
                alignItems:   "center",
                maxWidth:     "620px",
                margin:       "0 auto",
                border:       "1px solid var(--border)",
                borderRadius: "6px",
                background:   "var(--white)",
                overflow:     "hidden",
                boxShadow:    "0 2px 24px rgba(26,71,49,0.06)",
                opacity:      0,
              }}
            >
              <input
                type="text"
                placeholder="Physiotherapy, dental, wellness…"
                autoComplete="off"
                style={{
                  flex:       1,
                  padding:    "0 20px",
                  height:     "54px",
                  border:     "none",
                  outline:    "none",
                  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize:   "15px",
                  color:      "var(--charcoal)",
                  background: "transparent",
                  minWidth:   0,
                }}
              />
              <div style={{ width: "1px", height: "28px", background: "var(--border)", flexShrink: 0 }} />
              <select
                defaultValue="bangkok"
                style={{
                  padding:            "0 32px 0 16px",
                  height:             "54px",
                  border:             "none",
                  outline:            "none",
                  fontFamily:         "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize:           "15px",
                  color:              "var(--charcoal-soft)",
                  background:         "transparent",
                  cursor:             "pointer",
                  appearance:         "none",
                  WebkitAppearance:   "none",
                  backgroundImage:    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8278' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat:   "no-repeat",
                  backgroundPosition: "right 12px center",
                  flexShrink:         0,
                }}
              >
                <option value="bangkok">Bangkok</option>
                <option value="chiang-mai">Chiang Mai</option>
                <option value="phuket">Phuket</option>
                <option value="pattaya">Pattaya</option>
                <option value="koh-samui">Koh Samui</option>
              </select>
              <button
                className="search-btn"
                style={{
                  height:        "54px",
                  padding:       "0 28px",
                  background:    "var(--green)",
                  color:         "var(--white)",
                  border:        "none",
                  fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize:      "14px",
                  fontWeight:    500,
                  letterSpacing: "0.04em",
                  cursor:        "pointer",
                  flexShrink:    0,
                  transition:    "background 0.2s",
                }}
              >
                Search
              </button>
            </div>

            {/* Stats row */}
            <div
              className="animate-fade-up delay-400"
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            "20px",
                marginTop:      "36px",
                flexWrap:       "wrap",
                fontFamily:     "var(--font-dm-sans, 'DM Sans', sans-serif)",
                fontSize:       "13px",
                color:          "var(--muted)",
                opacity:        0,
              }}
            >
              <span><strong style={{ color: "var(--charcoal)", fontWeight: 500 }}>250+</strong> verified clinics</span>
              <StatDot />
              <span><strong style={{ color: "var(--charcoal)", fontWeight: 500 }}>5 cities</strong> across Thailand</span>
              <StatDot />
              <span>Trusted by <strong style={{ color: "var(--charcoal)", fontWeight: 500 }}>expats &amp; medical tourists</strong></span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — BROWSE BY SPECIALTY
        ══════════════════════════════════════════════════════ */}
        <section style={{ borderTop: "1px solid var(--border-soft)" }}>
          <div className="r-section" style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <p style={eyebrowStyle}>Browse by specialty</p>

            <div className="specialty-grid">

              {/* Physiotherapy — LIVE */}
              <Link href="/bangkok/physiotherapy-clinics/" style={{ textDecoration: "none" }}>
                <div className="category-tile" style={catTileBase}>
                  <svg style={catIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                    <line x1="6" y1="1" x2="6" y2="4"/>
                    <line x1="10" y1="1" x2="10" y2="4"/>
                    <line x1="14" y1="1" x2="14" y2="4"/>
                  </svg>
                  <div style={catNameStyle}>Physiotherapy</div>
                  <div style={catCountStyle}>{physioCount}+ clinics</div>
                  <div className="category-arrow" style={catArrowStyle}>Browse →</div>
                </div>
              </Link>

              {/* Dental — Coming Soon */}
              <div style={{ ...catTileBase, opacity: 0.6, cursor: "default" }}>
                <svg style={catIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M12 5c-1.7-1.7-4-2-5.5-.5S5 9 7 11l5 8 5-8c2-2 1.7-5 .5-6.5S13.7 3.3 12 5z"/>
                </svg>
                <div style={catNameStyle}>Dental</div>
                <div style={catCountStyle}>Coming soon</div>
              </div>

              {/* Wellness — Coming Soon */}
              <div style={{ ...catTileBase, opacity: 0.6, cursor: "default" }}>
                <svg style={catIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <div style={catNameStyle}>Wellness</div>
                <div style={catCountStyle}>Coming soon</div>
              </div>

              {/* Beauty — Coming Soon */}
              <div style={{ ...catTileBase, opacity: 0.6, cursor: "default" }}>
                <svg style={catIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                <div style={catNameStyle}>Beauty</div>
                <div style={catCountStyle}>Coming soon</div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 4 — FEATURED CLINICS
        ══════════════════════════════════════════════════════ */}
        <section className="featured-section" style={{
          background:   "var(--linen-dark)",
          borderTop:    "1px solid var(--border-soft)",
          borderBottom: "1px solid var(--border-soft)",
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Section header */}
            <div className="section-header" style={{ marginBottom: "36px" }}>
              <h2 style={{
                fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
                fontSize:   "36px",
                fontWeight: 400,
                color:      "var(--charcoal)",
                lineHeight: 1.15,
              }}>
                Highly rated in <em style={{ fontStyle: "italic", color: "var(--green)" }}>Bangkok</em>
              </h2>
              <Link href="/bangkok/physiotherapy-clinics/" style={sectionLinkStyle} className="section-link">
                View all Bangkok clinics →
              </Link>
            </div>

            {/* 3-column grid */}
            <div className="featured-grid">
              {topClinics.map((clinic, i) => {
                const displayName = clinic.nameEn ?? clinic.name;
                return (
                  <Link
                    key={clinic.id}
                    href={`/bangkok/physiotherapy-clinics/${clinic.slug}/`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <article className="featured-card" style={{
                      background:   "var(--white)",
                      border:       "1px solid var(--border-soft)",
                      borderRadius: "6px",
                      overflow:     "hidden",
                      cursor:       "pointer",
                    }}>
                      {/* Photo placeholder */}
                      <div style={{
                        width:          "100%",
                        aspectRatio:    "4/3",
                        background:     CARD_GRADIENTS[i],
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        position:       "relative",
                      }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                        {i === 0 && (
                          <div style={{
                            position:      "absolute",
                            top:           "12px",
                            left:          "12px",
                            background:    "var(--green)",
                            color:         "var(--white)",
                            fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
                            fontSize:      "10.5px",
                            fontWeight:    500,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            padding:       "4px 10px",
                            borderRadius:  "3px",
                          }}>
                            Top Rated
                          </div>
                        )}
                      </div>

                      {/* Card body */}
                      <div style={{ padding: "20px 22px 22px" }}>
                        <p style={{
                          fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
                          fontSize:      "11px",
                          fontWeight:    500,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color:         "var(--terracotta)",
                          marginBottom:  "8px",
                        }}>
                          Physiotherapy
                        </p>

                        <h3 style={{
                          fontFamily:   "var(--font-cormorant, 'Cormorant Garamond', serif)",
                          fontSize:     "21px",
                          fontWeight:   500,
                          color:        "var(--charcoal)",
                          lineHeight:   1.25,
                          marginBottom: "10px",
                        }}>
                          {displayName}
                        </h3>

                        <div style={{
                          display:    "flex",
                          alignItems: "center",
                          gap:        "8px",
                          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                          fontSize:   "13px",
                          color:      "var(--muted)",
                          flexWrap:   "wrap",
                        }}>
                          {clinic.googleRating !== null && (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--charcoal)", fontWeight: 500 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="#e8a020">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                              {clinic.googleRating.toFixed(1)}
                            </span>
                          )}
                          {clinic.googleRating !== null && <MetaDot />}
                          {clinic.googleReviewsCount !== null && (
                            <span>{clinic.googleReviewsCount.toLocaleString()} reviews</span>
                          )}
                          {clinic.district && <><MetaDot /><span>{clinic.district}</span></>}
                        </div>

                        {/* Card footer */}
                        <div style={{
                          marginTop:     "14px",
                          paddingTop:    "14px",
                          borderTop:     "1px solid var(--border-soft)",
                          display:       "flex",
                          alignItems:    "center",
                          justifyContent: "flex-end",
                          fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
                          fontSize:      "12.5px",
                          color:         "var(--muted)",
                        }}>
                          <span>View clinic →</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 5 — BROWSE BY CITY
        ══════════════════════════════════════════════════════ */}
        <section style={{ backgroundColor: "var(--linen)" }}>
          <div className="r-section" style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div className="section-header">
              <div>
                <p style={eyebrowStyle}>Explore by city</p>
                <h2 style={{
                  fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
                  fontSize:   "36px",
                  fontWeight: 400,
                  color:      "var(--charcoal)",
                  lineHeight: 1.15,
                }}>
                  Find clinics <em style={{ fontStyle: "italic", color: "var(--green)" }}>near you</em>
                </h2>
              </div>
              <Link href="/" style={sectionLinkStyle} className="section-link">All cities →</Link>
            </div>

            <div className="city-grid">
              {CITY_TILES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  style={{ textDecoration: "none", display: "block" }}
                  className="city-tile"
                >
                  <div style={{
                    position:     "relative",
                    borderRadius: "6px",
                    overflow:     "hidden",
                    aspectRatio:  "3/4",
                  }}>
                    {/* Background */}
                    <div
                      className="city-tile-bg"
                      style={{ position: "absolute", inset: 0, background: city.bg }}
                    />
                    {/* Overlay */}
                    <div style={{
                      position:   "absolute",
                      inset:      0,
                      background: "linear-gradient(to top, rgba(10,30,20,0.72) 0%, rgba(10,30,20,0.1) 60%)",
                    }} />
                    {/* Content */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 16px" }}>
                      <div style={{
                        fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
                        fontSize:   "22px",
                        fontWeight: 500,
                        color:      "var(--white)",
                        lineHeight: 1.2,
                        marginBottom: "4px",
                      }}>
                        {city.name}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                        fontSize:   "12px",
                        color:      "rgba(255,255,255,0.65)",
                      }}>
                        {city.count}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 6 — TRUST STRIP
        ══════════════════════════════════════════════════════ */}
        <section className="trust-pad" style={{ borderTop: "1px solid var(--border-soft)", background: "var(--white)" }}>
          <div className="trust-inner">

            {/* Verified listings */}
            <TrustItem
              title="Verified listings"
              subtitle="Real clinics, real data"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M12 3l-9 4.5v5c0 5.5 3.5 9.5 9 11 5.5-1.5 9-5.5 9-11v-5L12 3z"/>
                </svg>
              }
            />

            {/* Google ratings */}
            <TrustItem
              title="Google ratings included"
              subtitle="Sourced from 1,000s of reviews"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              }
            />

            {/* Up-to-date hours */}
            <TrustItem
              title="Up-to-date hours"
              subtitle="Opening times always current"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              }
            />

            {/* Expat-friendly */}
            <TrustItem
              title="Expat-friendly"
              subtitle="English-speaking clinics flagged"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              }
            />

          </div>
        </section>

      </main>

      {/* ══════════════════════════════════════════════════════
          SECTION 7 — FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer className="footer-pad" style={{ background: "var(--charcoal)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Top grid */}
          <div className="footer-grid">
            {/* Col 1 — Brand */}
            <div>
              <div style={{
                fontFamily:   "var(--font-cormorant, 'Cormorant Garamond', serif)",
                fontSize:     "22px",
                fontWeight:   500,
                color:        "var(--white)",
                marginBottom: "12px",
              }}>
                ThailandClinics.co
              </div>
              <p style={{
                fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                fontSize:   "13.5px",
                lineHeight: 1.65,
                color:      "rgba(255,255,255,0.5)",
                maxWidth:   "260px",
              }}>
                The definitive guide to healthcare in Thailand. Helping expats and medical tourists find trusted care since 2024.
              </p>
            </div>

            {/* Col 2 — Browse */}
            <FooterCol title="Browse" links={[
              { label: "Physiotherapy", href: "/bangkok/physiotherapy-clinics/" },
              { label: "Dental",        href: "/" },
              { label: "Wellness",      href: "/" },
              { label: "Beauty",        href: "/" },
            ]} />

            {/* Col 3 — Cities */}
            <FooterCol title="Cities" links={[
              { label: "Bangkok",    href: "/bangkok" },
              { label: "Chiang Mai", href: "/chiang-mai" },
              { label: "Phuket",     href: "/phuket" },
              { label: "Pattaya",    href: "/pattaya" },
              { label: "Koh Samui",  href: "/" },
            ]} />

            {/* Col 4 — Company */}
            <FooterCol title="Company" links={[
              { label: "About",            href: "/about/" },
              { label: "List Your Clinic", href: "/list-your-clinic/" },
              { label: "Contact",          href: "/contact/" },
              { label: "Privacy Policy",   href: "/privacy-policy/" },
            ]} />
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom" style={{
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize:   "12.5px",
            color:      "rgba(255,255,255,0.3)",
          }}>
            <span>© 2025 ThailandClinics.co — All rights reserved</span>
            <span>Made with care for expats in Thailand</span>
          </div>

        </div>
      </footer>
    </>
  );
}

/* ─── Small components ───────────────────────────────────────────── */
function StatDot() {
  return (
    <span style={{
      display:      "inline-block",
      width:        "4px",
      height:       "4px",
      borderRadius: "50%",
      background:   "var(--border)",
      flexShrink:   0,
    }} />
  );
}

function MetaDot() {
  return (
    <span style={{
      display:      "inline-block",
      width:        "3px",
      height:       "3px",
      borderRadius: "50%",
      background:   "var(--border)",
      flexShrink:   0,
    }} />
  );
}

function TrustItem({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ width: "32px", height: "32px", color: "var(--green)", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <strong style={{
          display:    "block",
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          fontSize:   "15px",
          fontWeight: 600,
          color:      "var(--charcoal)",
          lineHeight: 1.2,
        }}>
          {title}
        </strong>
        <span style={{
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          fontSize:   "12.5px",
          color:      "var(--muted)",
        }}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p style={{
        fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
        fontSize:      "11px",
        fontWeight:    500,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color:         "rgba(255,255,255,0.4)",
        marginBottom:  "20px",
      }}>
        {title}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link href={href} style={{
              fontFamily:     "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize:       "14px",
              color:          "rgba(255,255,255,0.6)",
              textDecoration: "none",
              transition:     "color 0.2s",
            }}
            className="footer-link"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Shared style objects ───────────────────────────────────────── */
const eyebrowStyle: React.CSSProperties = {
  fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
  fontSize:      "11px",
  fontWeight:    500,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color:         "var(--muted)",
  marginBottom:  "32px",
};

const catTileBase: React.CSSProperties = {
  border:       "1px solid var(--border)",
  borderRadius: "6px",
  padding:      "28px 24px",
  cursor:       "pointer",
  background:   "var(--white)",
};

const catIconStyle: React.CSSProperties = {
  width:        "36px",
  height:       "36px",
  marginBottom: "16px",
  color:        "var(--green)",
  display:      "block",
};

const catNameStyle: React.CSSProperties = {
  fontFamily:   "var(--font-cormorant, 'Cormorant Garamond', serif)",
  fontSize:     "20px",
  fontWeight:   500,
  color:        "var(--charcoal)",
  marginBottom: "6px",
};

const catCountStyle: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
  fontSize:   "12.5px",
  color:      "var(--muted)",
  fontWeight: 400,
};

const catArrowStyle: React.CSSProperties = {
  display:       "inline-block",
  marginTop:     "16px",
  fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
  fontSize:      "12px",
  color:         "var(--green)",
  letterSpacing: "0.06em",
  opacity:       0,
  transform:     "translateX(-4px)",
  transition:    "opacity 0.2s, transform 0.2s",
};

const sectionLinkStyle: React.CSSProperties = {
  fontFamily:     "var(--font-dm-sans, 'DM Sans', sans-serif)",
  fontSize:       "13px",
  color:          "var(--green)",
  textDecoration: "none",
  fontWeight:     500,
  borderBottom:   "1px solid transparent",
  transition:     "border-color 0.2s",
  whiteSpace:     "nowrap",
  paddingBottom:  "2px",
};
