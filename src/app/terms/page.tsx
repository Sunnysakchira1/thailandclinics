import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "Terms of Use — ThailandClinics",
  description:
    "Terms of use for ThailandClinics. Clinic information is provided as-is and is not medical advice. Data sourced from public records. Contact us for corrections.",
  alternates: { canonical: "/terms/" },
  openGraph: {
    title: "Terms of Use — ThailandClinics",
    description:
      "Terms of use for ThailandClinics. Clinic information is provided as-is and is not medical advice. Data sourced from public records. Contact us for corrections.",
  },
};

export default function TermsPage() {
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
            Legal
          </p>

          {/* H1 */}
          <h1 style={{
            fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
            fontSize:     "clamp(36px,5vw,52px)",
            fontWeight:   400,
            lineHeight:   1.1,
            color:        "var(--charcoal)",
            marginBottom: "16px",
          }}>
            Terms of Use
          </h1>

          {/* Effective date */}
          <p style={{
            fontFamily:   "var(--font-dm-sans,'DM Sans',sans-serif)",
            fontSize:     "13.5px",
            color:        "var(--muted)",
            marginBottom: "48px",
          }}>
            Effective date: March 2026
          </p>

          {/* Divider */}
          <div style={{ width: "40px", height: "2px", background: "var(--green)", marginBottom: "48px" }} />

          <Section heading="Acceptance of terms">
            <p>
              By using thailand-clinics.com ("the site"), you agree to these terms.
              If you don't agree, please don't use the site. We may update these terms
              from time to time — the effective date above reflects the most recent
              revision.
            </p>
          </Section>

          <Section heading="Not medical advice">
            <p>
              Nothing on this site is medical advice. Clinic listings, ratings, review
              summaries, and all other content are provided for informational purposes
              only to help you find and evaluate healthcare providers.
            </p>
            <p>
              Always consult a qualified medical professional for diagnosis, treatment,
              or any health-related decisions. ThailandClinics accepts no responsibility
              for the outcome of any medical treatment received at a listed clinic.
            </p>
          </Section>

          <Section heading="Information provided as-is">
            <p>
              We make reasonable efforts to ensure that clinic information — addresses,
              phone numbers, opening hours, ratings — is accurate and up to date. However,
              clinic details can change without notice. We cannot guarantee the accuracy,
              completeness, or currency of any listing.
            </p>
            <p>
              Always verify critical details (hours, location, services) directly with
              the clinic before visiting.
            </p>
          </Section>

          <Section heading="Data sources">
            <p>
              Clinic data on this site is sourced from publicly available information,
              including Google Maps, Google Business profiles, clinic websites, and
              direct verification. Review summaries are generated using AI based on
              publicly available patient reviews. We do not fabricate or selectively
              edit review content.
            </p>
          </Section>

          <Section heading="Corrections and takedown requests">
            <p>
              If you are a clinic owner and believe information about your clinic is
              incorrect, outdated, or should be removed, please contact us. We will
              review and respond within 14 business days.
            </p>
            <p>
              <a
                href="mailto:hello@thailand-clinics.com?subject=Listing correction request"
                style={{ color: "var(--green)", textDecoration: "none", borderBottom: "1px solid var(--green)" }}
              >
                hello@thailand-clinics.com
              </a>
            </p>
          </Section>

          <Section heading="Intellectual property">
            <p>
              The design, copy, and original content on this site are owned by
              ThailandClinics. Clinic names, ratings, and review content remain the
              property of their respective owners. You may not scrape, reproduce, or
              republish content from this site without written permission.
            </p>
          </Section>

          <Section heading="Third-party links">
            <p>
              Clinic profiles may link to external websites (clinic websites, Google
              Maps). We are not responsible for the content or privacy practices of
              those sites.
            </p>
          </Section>

          <Section heading="Limitation of liability">
            <p>
              To the fullest extent permitted by law, ThailandClinics is not liable
              for any direct, indirect, or consequential loss arising from your use
              of this site or reliance on any information contained within it.
            </p>
          </Section>

          <Section heading="Governing law">
            <p>
              These terms are governed by the laws of Thailand. Any disputes will be
              subject to the jurisdiction of the courts of Bangkok, Thailand.
            </p>
          </Section>

          <Section heading="Contact">
            <p>
              Questions about these terms:{" "}
              <a
                href="mailto:hello@thailand-clinics.com?subject=Terms enquiry"
                style={{ color: "var(--green)", textDecoration: "none", borderBottom: "1px solid var(--green)" }}
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

/* ─── Local component ────────────────────────────────────────────── */
function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h2 style={{
        fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
        fontSize:     "24px",
        fontWeight:   400,
        color:        "var(--charcoal)",
        marginBottom: "12px",
      }}>
        {heading}
      </h2>
      <div style={{
        fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
        fontSize:      "15px",
        lineHeight:    1.75,
        color:         "var(--charcoal-soft)",
        display:       "flex",
        flexDirection: "column",
        gap:           "12px",
      }}>
        {children}
      </div>
    </div>
  );
}
