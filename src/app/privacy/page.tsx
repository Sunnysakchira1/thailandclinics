import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "Privacy Policy — ThailandClinics",
  description:
    "ThailandClinics privacy policy. We collect no personal data from visitors beyond standard analytics. No data is sold. Clinic data sourced from public records.",
  alternates: { canonical: "/privacy/" },
  openGraph: {
    title: "Privacy Policy — ThailandClinics",
    description:
      "ThailandClinics privacy policy. We collect no personal data from visitors beyond standard analytics. No data is sold. Clinic data sourced from public records.",
  },
};

export default function PrivacyPage() {
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
            Privacy Policy
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

          <Section heading="Overview">
            <p>
              ThailandClinics ("we", "us", "our") operates the website at
              thailand-clinics.com. This policy explains what information we collect,
              how we use it, and your rights. We've kept it short because there isn't
              much to say — we don't collect much.
            </p>
          </Section>

          <Section heading="What we collect">
            <p>
              <strong>Analytics.</strong> We use standard web analytics to understand
              how visitors use the site — pages viewed, referral sources, device type,
              and general location (country/city level). This data is aggregated and
              anonymous. We do not track individual users across sessions or across
              other websites.
            </p>
            <p>
              <strong>Contact emails.</strong> If you email us directly, we store your
              email address and message in order to respond. We do not add you to any
              mailing list without your explicit consent.
            </p>
            <p>
              <strong>Clinic listing enquiries.</strong> If you submit a clinic listing
              request via our waitlist form, we collect your name, clinic name, email
              address, city, and category. This information is used only to contact
              you about your listing.
            </p>
            <p>
              <strong>We do not collect:</strong> payment information, sensitive personal
              data, health information, or any data from minors.
            </p>
          </Section>

          <Section heading="Cookies">
            <p>
              We use minimal cookies — only those required for the site to function
              and anonymous analytics. We do not use advertising cookies or
              third-party tracking pixels.
            </p>
          </Section>

          <Section heading="Google Maps data">
            <p>
              Clinic profiles on this site include data sourced from Google Maps,
              including ratings, review counts, addresses, and opening hours. This
              data is displayed in accordance with Google's Terms of Service. We do
              not store or republish individual Google user reviews in identifiable form
              beyond what is required to display review summaries.
            </p>
          </Section>

          <Section heading="How we use your data">
            <p>
              We use the data we collect solely to operate and improve this website.
              Specifically:
            </p>
            <ul style={{ paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>To respond to your messages and enquiries</li>
              <li>To process clinic listing requests</li>
              <li>To understand how the site is being used so we can improve it</li>
            </ul>
          </Section>

          <Section heading="We do not sell your data">
            <p>
              We do not sell, rent, or share your personal information with third parties
              for their marketing purposes. Ever.
            </p>
          </Section>

          <Section heading="Data retention">
            <p>
              Contact and enquiry emails are retained for as long as necessary to
              respond and follow up. Analytics data is retained in aggregated,
              anonymous form. You can request deletion of any personally identifiable
              data we hold about you at any time.
            </p>
          </Section>

          <Section heading="Your rights">
            <p>
              You have the right to request access to, correction of, or deletion of
              any personal data we hold about you. To make a request, email us at{" "}
              <a
                href="mailto:hello@thailand-clinics.com?subject=Privacy request"
                style={{ color: "var(--green)", textDecoration: "none", borderBottom: "1px solid var(--green)" }}
              >
                hello@thailand-clinics.com
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section heading="Changes to this policy">
            <p>
              We may update this policy from time to time. The effective date at the
              top of this page will reflect the most recent revision. Continued use
              of the site after a change constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section heading="Contact">
            <p>
              Questions about this policy or how we handle data:{" "}
              <a
                href="mailto:hello@thailand-clinics.com?subject=Privacy enquiry"
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
