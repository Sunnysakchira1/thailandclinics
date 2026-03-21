import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "About ThailandClinics — Independent Clinic Directory for Expats",
  description:
    "ThailandClinics is an independent directory built for expats and medical tourists. No ads, no paid rankings. We verify clinics and surface real patient reviews.",
  alternates: { canonical: "/about/" },
  openGraph: {
    title: "About ThailandClinics — Independent Clinic Directory for Expats",
    description:
      "ThailandClinics is an independent directory built for expats and medical tourists. No ads, no paid rankings. We verify clinics and surface real patient reviews.",
  },
};

export default function AboutPage() {
  return (
    <>
      <Nav />

      <main style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>
        <div style={{
          maxWidth:  "760px",
          margin:    "0 auto",
          padding:   "64px 48px 96px",
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
            About
          </p>

          {/* H1 */}
          <h1 style={{
            fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
            fontSize:     "clamp(36px,5vw,52px)",
            fontWeight:   400,
            lineHeight:   1.1,
            color:        "var(--charcoal)",
            marginBottom: "32px",
          }}>
            About ThailandClinics
          </h1>

          <Divider />

          {/* Who we are */}
          <Section heading="Who we are">
            <p>
              ThailandClinics is an independent clinic directory built specifically for
              expats and medical tourists navigating healthcare in Thailand. We are not
              affiliated with any hospital group, insurance provider, or booking platform.
            </p>
            <p>
              We cover four categories — physiotherapy, dental, cosmetic, and wellness —
              across Bangkok, Phuket, Chiang Mai, and Pattaya.
            </p>
          </Section>

          {/* Mission */}
          <Section heading="Our mission">
            <p style={{ fontSize: "18px", fontStyle: "italic", color: "var(--charcoal)" }}>
              "We do the research so you don't have to."
            </p>
            <p>
              Finding good healthcare as a foreigner in Thailand is hard. Clinic websites
              are often in Thai, Google results mix ads with real listings, and word-of-mouth
              only goes so far. We exist to solve that problem with a clean, trustworthy
              source of verified clinic information.
            </p>
          </Section>

          {/* How we work */}
          <Section heading="How we work">
            <ol style={{ paddingLeft: "20px", margin: 0 }}>
              {[
                {
                  title: "We source clinic data",
                  body:  "Our database is built from Google Maps data covering thousands of clinics across Thailand. Every listing includes address, phone, website, opening hours, and GPS coordinates.",
                },
                {
                  title: "We filter for quality",
                  body:  "Clinics must have at least 5 Google reviews and be actively operating to appear in our directory. Closed and low-signal listings are excluded.",
                },
                {
                  title: "We verify listings",
                  body:  "Verified listings have been manually checked against the clinic's own website or direct contact. Verified status is displayed clearly on every profile.",
                },
                {
                  title: "We enrich with real reviews",
                  body:  "We pull the most recent patient reviews and use AI to generate plain-English summaries of what patients say — both positives and negatives. This gives you a balanced picture quickly.",
                },
              ].map(({ title, body }, i) => (
                <li key={i} style={{ marginBottom: "16px" }}>
                  <span style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontWeight: 500,
                    color:      "var(--charcoal)",
                  }}>
                    {title}
                  </span>
                  {" — "}
                  {body}
                </li>
              ))}
            </ol>
          </Section>

          {/* Why trust us */}
          <Section heading="Why trust us">
            <p>
              Every clinic profile displays its live Google rating and review count — sourced
              directly from Google Maps, not self-reported. AI review summaries are generated
              from real patient reviews and include both positive and negative signals.
            </p>
            <p>
              Our ranking logic is transparent and published. See{" "}
              <a href="/how-we-rank/" style={{ color: "var(--green)", textDecoration: "none", borderBottom: "1px solid var(--green)" }}>
                how we rank clinics
              </a>
              .
            </p>
          </Section>

          {/* Based in Bangkok */}
          <Section heading="Based in Bangkok">
            <p>
              We are based in Bangkok and have first-hand experience navigating the Thai
              healthcare system as foreigners. This platform is the resource we wished
              had existed when we arrived.
            </p>
          </Section>

          {/* Contact */}
          <Section heading="Get in touch">
            <p>
              Questions, corrections, or feedback — we read everything.
            </p>
            <p>
              <a
                href="mailto:hello@thailand-clinics.com"
                style={{
                  fontFamily:  "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize:    "15px",
                  fontWeight:  500,
                  color:       "var(--green)",
                  textDecoration: "none",
                }}
              >
                hello@thailand-clinics.com
              </a>
            </p>
          </Section>

        </div>
      </main>
    </>
  );
}

/* ─── Local components ───────────────────────────────────────────── */
function Divider() {
  return (
    <div style={{
      width:        "40px",
      height:       "2px",
      background:   "var(--green)",
      marginBottom: "40px",
    }} />
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "44px" }}>
      <h2 style={{
        fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
        fontSize:     "26px",
        fontWeight:   400,
        color:        "var(--charcoal)",
        marginBottom: "14px",
      }}>
        {heading}
      </h2>
      <div style={{
        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
        fontSize:   "15.5px",
        lineHeight: 1.75,
        color:      "var(--charcoal-soft)",
        display:    "flex",
        flexDirection: "column",
        gap:        "12px",
      }}>
        {children}
      </div>
    </div>
  );
}
