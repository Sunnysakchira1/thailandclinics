import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "How We Rank Clinics — Transparent Methodology | ThailandClinics",
  description:
    "ThailandClinics ranks clinics by Google rating, review volume, recency, verified status, and data completeness. No paid rankings. Full methodology explained.",
  alternates: { canonical: "/how-we-rank/" },
  openGraph: {
    title: "How We Rank Clinics — Transparent Methodology | ThailandClinics",
    description:
      "ThailandClinics ranks clinics by Google rating, review volume, recency, verified status, and data completeness. No paid rankings. Full methodology explained.",
  },
};

const SIGNALS = [
  {
    number: "01",
    title:  "Google rating",
    role:   "Primary signal",
    body:   "A clinic's overall Google rating is the strongest indicator of patient satisfaction at scale. It reflects the aggregated opinion of everyone who has visited and left a review — not a curated selection. We use the live rating pulled directly from Google Maps.",
  },
  {
    number: "02",
    title:  "Review count",
    role:   "Volume of evidence",
    body:   "A 5.0 rating from 3 reviews means something very different to a 4.7 from 400 reviews. We weight review volume heavily — a high rating backed by more reviews earns a higher position. Clinics with fewer than 5 reviews are excluded from the directory entirely.",
  },
  {
    number: "03",
    title:  "Recency of reviews",
    role:   "Signal freshness",
    body:   "A clinic with strong reviews from three years ago may have changed staff, ownership, or quality. We factor in the recency of the most recent reviews to surface clinics that are actively delivering good care today.",
  },
  {
    number: "04",
    title:  "Verified listing status",
    role:   "Trust signal",
    body:   "Verified listings have been manually checked — contact details confirmed, operating status confirmed, and data reconciled with the clinic's own website or direct communication. Verified clinics receive a small ranking boost and display a visible badge.",
  },
  {
    number: "05",
    title:  "Data completeness",
    role:   "Profile quality",
    body:   "Clinics with complete profiles — phone, website, opening hours, English-speaking flag, BTS/MRT access — rank above incomplete ones at the same rating tier. A complete profile signals an active, accessible clinic.",
  },
];

export default function HowWeRankPage() {
  return (
    <>
      <Nav />

      <main style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>
        <div style={{
          maxWidth: "760px",
          margin:   "0 auto",
          padding:  "64px 48px 96px",
        }}>

          {/* Eyebrow */}
          <p style={{
            fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
            fontSize:      "11px",
            fontWeight:    500,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color:         "var(--terracotta)",
            marginBottom:  "16px",
          }}>
            Methodology
          </p>

          {/* H1 */}
          <h1 style={{
            fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
            fontSize:     "clamp(36px,5vw,52px)",
            fontWeight:   400,
            lineHeight:   1.1,
            color:        "var(--charcoal)",
            marginBottom: "20px",
          }}>
            How we rank clinics
          </h1>

          {/* Intro */}
          <p style={{
            fontFamily:   "var(--font-dm-sans,'DM Sans',sans-serif)",
            fontSize:     "16px",
            lineHeight:   1.75,
            color:        "var(--charcoal-soft)",
            marginBottom: "48px",
          }}>
            Choosing a clinic in a foreign country is stressful. You don't know which
            names to trust, the language barrier is real, and a bad experience can ruin
            more than just your day. We built this ranking system to cut through the noise
            and make that decision easier — so you can walk in with confidence, not doubt.
            Below is exactly how it works.
          </p>

          {/* Divider */}
          <div style={{ width: "40px", height: "2px", background: "var(--green)", marginBottom: "48px" }} />

          {/* Ranking signals */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {SIGNALS.map(({ number, title, role, body }, i) => (
              <div
                key={number}
                style={{
                  display:      "grid",
                  gridTemplateColumns: "56px 1fr",
                  gap:          "0 24px",
                  paddingBottom: "36px",
                  marginBottom: "36px",
                  borderBottom: i < SIGNALS.length - 1 ? "1px solid var(--border-soft)" : "none",
                }}
              >
                {/* Number */}
                <div style={{
                  fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                  fontSize:   "32px",
                  fontWeight: 300,
                  color:      "var(--border)",
                  lineHeight: 1,
                  paddingTop: "4px",
                }}>
                  {number}
                </div>

                {/* Content */}
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <h2 style={{
                      fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                      fontSize:   "22px",
                      fontWeight: 500,
                      color:      "var(--charcoal)",
                      margin:     0,
                    }}>
                      {title}
                    </h2>
                    <span style={{
                      fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
                      fontSize:      "11px",
                      fontWeight:    500,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color:         "var(--muted)",
                    }}>
                      {role}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize:   "15px",
                    lineHeight: 1.75,
                    color:      "var(--charcoal-soft)",
                    margin:     0,
                  }}>
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Multi-source reviews */}
          <div style={{ marginBottom: "44px" }}>
            <h2 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "26px",
              fontWeight:   400,
              color:        "var(--charcoal)",
              marginBottom: "14px",
            }}>
              We pull reviews from everywhere
            </h2>
            <p style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:   "15.5px",
              lineHeight: 1.75,
              color:      "var(--charcoal-soft)",
              marginBottom: "12px",
            }}>
              People leave reviews in different places — Google, Facebook, Trustpilot,
              and beyond. A clinic with 200 Google reviews and another 80 on Facebook
              tells a richer story than either source alone. We're building toward
              combining all of these into a single, unified picture for every clinic.
            </p>
            <p style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:   "15.5px",
              lineHeight: 1.75,
              color:      "var(--charcoal-soft)",
              margin:     0,
            }}>
              The goal is simple: when you read a clinic profile on ThailandClinics, you
              should have everything you need to make a confident decision — without having
              to open five tabs and piece it together yourself. We do that work so you
              don't have to.
            </p>
          </div>

          {/* What we don't do */}
          <div style={{
            background:   "var(--green-pale)",
            border:       "1px solid var(--green)",
            borderRadius: "6px",
            padding:      "28px 32px",
            marginBottom: "44px",
          }}>
            <h2 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "22px",
              fontWeight:   400,
              color:        "var(--green)",
              marginBottom: "12px",
            }}>
              What we don't do
            </h2>
            <ul style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:   "15px",
              lineHeight: 1.75,
              color:      "var(--charcoal-soft)",
              paddingLeft: "20px",
              margin:     0,
              display:    "flex",
              flexDirection: "column",
              gap:        "6px",
            }}>
              <li>Clinics cannot pay to rank higher in search results</li>
              <li>We do not accept payment for inclusion in the directory</li>
              <li>We do not remove negative reviews or alter rating data</li>
              <li>We do not fabricate or inflate review summaries</li>
            </ul>
          </div>

          {/* Featured placements */}
          <div style={{ marginBottom: "44px" }}>
            <h2 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "26px",
              fontWeight:   400,
              color:        "var(--charcoal)",
              marginBottom: "14px",
            }}>
              Featured placements
            </h2>
            <p style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:   "15.5px",
              lineHeight: 1.75,
              color:      "var(--charcoal-soft)",
              margin:     0,
            }}>
              Some clinics appear as featured listings at the top of a category page.
              Featured placements are always clearly labelled with a "Featured" badge and
              are visually distinct from organic results. They do not affect how other
              clinics rank below them.
            </p>
          </div>

          {/* Update cadence */}
          <div style={{ marginBottom: "44px" }}>
            <h2 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "26px",
              fontWeight:   400,
              color:        "var(--charcoal)",
              marginBottom: "14px",
            }}>
              How often we update
            </h2>
            <p style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:   "15.5px",
              lineHeight: 1.75,
              color:      "var(--charcoal-soft)",
              margin:     0,
            }}>
              Rankings are recalculated monthly as new Google review data is pulled.
              AI review summaries are refreshed on the same monthly cycle. Verified
              status is reviewed quarterly or when we receive a correction request.
            </p>
          </div>

          {/* CTA */}
          <div style={{
            borderTop:  "1px solid var(--border-soft)",
            paddingTop: "32px",
            display:    "flex",
            gap:        "24px",
            flexWrap:   "wrap",
            alignItems: "center",
          }}>
            <span style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:   "14px",
              color:      "var(--muted)",
            }}>
              Spot an error in a listing?
            </span>
            <a
              href="mailto:hello@thailand-clinics.com?subject=Listing correction"
              style={{
                fontFamily:     "var(--font-dm-sans,'DM Sans',sans-serif)",
                fontSize:       "13.5px",
                fontWeight:     500,
                color:          "var(--green)",
                textDecoration: "none",
                border:         "1px solid var(--green)",
                padding:        "8px 18px",
                borderRadius:   "4px",
              }}
            >
              Send a correction
            </a>
          </div>

        </div>
      </main>
    </>
  );
}
