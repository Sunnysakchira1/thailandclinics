"use client";

import { useState } from "react";
import Nav from "@/components/layout/Nav";

const CITIES = ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Koh Samui", "Other"];
const CATEGORIES = ["Physiotherapy", "Dental", "Cosmetic / Aesthetic", "Wellness", "Other"];

const INCLUDES = [
  {
    icon: "✓",
    title: "Verified badge",
    body:  "Your listing is manually reviewed and marked verified — a visible trust signal that sets you apart.",
  },
  {
    icon: "✓",
    title: "Enhanced profile",
    body:  "Full profile with opening hours, services, languages spoken, BTS/MRT access, and a direct Maps link.",
  },
  {
    icon: "✓",
    title: "AI review summary",
    body:  "We summarise your most recent patient reviews into clear positives and negatives — helping patients make faster decisions.",
  },
  {
    icon: "✓",
    title: "Priority visibility",
    body:  "Featured clinics appear at the top of their category page, ahead of organic rankings.",
  },
];

export default function ListYourClinicPage() {
  const [name, setName]         = useState("");
  const [clinic, setClinic]     = useState("");
  const [email, setEmail]       = useState("");
  const [city, setCity]         = useState("");
  const [category, setCategory] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Clinic listing request — ${clinic}`);
    const body = encodeURIComponent(
      `Name: ${name}\nClinic: ${clinic}\nEmail: ${email}\nCity: ${city}\nCategory: ${category}`
    );
    window.location.href = `mailto:hello@thailand-clinics.com?subject=${subject}&body=${body}`;
  }

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
            For clinic owners
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
            List your clinic
          </h1>

          {/* Intro */}
          <p style={{
            fontFamily:   "var(--font-dm-sans,'DM Sans',sans-serif)",
            fontSize:     "16px",
            lineHeight:   1.75,
            color:        "var(--charcoal-soft)",
            marginBottom: "48px",
          }}>
            ThailandClinics is where expats and medical tourists go when they need to
            find a clinic they can trust. Get your clinic in front of the people actively
            looking for your services.
          </p>

          {/* Divider */}
          <div style={{ width: "40px", height: "2px", background: "var(--green)", marginBottom: "48px" }} />

          {/* What's included */}
          <div style={{ marginBottom: "56px" }}>
            <h2 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "26px",
              fontWeight:   400,
              color:        "var(--charcoal)",
              marginBottom: "24px",
            }}>
              What's included
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {INCLUDES.map(({ icon, title, body }) => (
                <div
                  key={title}
                  style={{
                    display:      "grid",
                    gridTemplateColumns: "24px 1fr",
                    gap:          "0 16px",
                    alignItems:   "start",
                  }}
                >
                  <span style={{
                    color:      "var(--open)",
                    fontSize:   "16px",
                    fontWeight: 600,
                    paddingTop: "2px",
                  }}>
                    {icon}
                  </span>
                  <div>
                    <span style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                      fontSize:   "15px",
                      fontWeight: 500,
                      color:      "var(--charcoal)",
                    }}>
                      {title}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                      fontSize:   "15px",
                      color:      "var(--charcoal-soft)",
                    }}>
                      {" — "}{body}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div style={{
            background:   "var(--green-pale)",
            border:       "1px solid var(--green)",
            borderRadius: "6px",
            padding:      "24px 28px",
            marginBottom: "56px",
            display:      "flex",
            alignItems:   "center",
            gap:          "16px",
            flexWrap:     "wrap",
          }}>
            <span style={{
              fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:   "28px",
              fontWeight: 400,
              color:      "var(--green)",
            }}>
              Free during beta
            </span>
            <span style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:   "14px",
              color:      "var(--charcoal-soft)",
              lineHeight: 1.6,
            }}>
              We're currently onboarding our first clinics at no cost.
              Pricing will be introduced later — early listings will be
              grandfathered in at a discounted rate.
            </span>
          </div>

          {/* Form */}
          <div>
            <h2 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "26px",
              fontWeight:   400,
              color:        "var(--charcoal)",
              marginBottom: "8px",
            }}>
              Join the waitlist
            </h2>
            <p style={{
              fontFamily:   "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:     "14px",
              color:        "var(--muted)",
              marginBottom: "28px",
            }}>
              Fill in your details and we'll be in touch within a few days.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              <Field label="Your name" required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Somchai Petcharat"
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="Clinic name" required>
                <input
                  type="text"
                  value={clinic}
                  onChange={(e) => setClinic(e.target.value)}
                  placeholder="e.g. Bangkok Physio Center"
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="Email address" required>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourclinic.com"
                  required
                  style={inputStyle}
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <Field label="City" required>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="">Select city</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Category" required>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <button
                type="submit"
                style={{
                  fontFamily:      "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize:        "14px",
                  fontWeight:      500,
                  backgroundColor: "var(--green)",
                  color:           "var(--white)",
                  border:          "none",
                  borderRadius:    "4px",
                  padding:         "14px 28px",
                  cursor:          "pointer",
                  alignSelf:       "flex-start",
                  transition:      "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--green-light)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--green)")}
              >
                Submit listing request
              </button>

              <p style={{
                fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                fontSize:   "12.5px",
                color:      "var(--muted)",
                margin:     0,
              }}>
                Submitting opens your email client with your details pre-filled.
                We'll reply within 2–3 business days.
              </p>

            </form>
          </div>

        </div>
      </main>
    </>
  );
}

/* ─── Local components ───────────────────────────────────────────── */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{
        fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
        fontSize:      "12px",
        fontWeight:    600,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color:         "var(--charcoal-soft)",
      }}>
        {label}{required && <span style={{ color: "var(--terracotta)", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily:      "var(--font-dm-sans,'DM Sans',sans-serif)",
  fontSize:        "14px",
  color:           "var(--charcoal)",
  backgroundColor: "var(--white)",
  border:          "1px solid var(--border)",
  borderRadius:    "4px",
  padding:         "10px 14px",
  outline:         "none",
  width:           "100%",
  boxSizing:       "border-box",
  appearance:      "none" as const,
};
