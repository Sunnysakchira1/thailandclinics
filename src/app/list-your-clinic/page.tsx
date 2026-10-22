"use client";

import { useState } from "react";
import { FORMSPREE_ENDPOINT, CONTACT_EMAIL } from "@/lib/forms";
import Nav from "@/components/layout/Nav";

const CITIES = ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Koh Samui", "Other"];
const CATEGORIES = ["Physiotherapy", "Dental", "Cosmetic / Aesthetic", "Wellness", "Other"];

const PLANS: { name: string; price: string; note?: string; premium?: boolean; features: string[] }[] = [
  {
    name: "Basic",
    price: "Free",
    features: [
      "Full profile with hours, services, languages and transit access",
      "Verified badge",
      "AI summary of your recent patient reviews",
      "Listed on your city and category pages",
      "Patients contact you directly",
      "No commission",
    ],
  },
  {
    name: "Pro",
    price: "฿4,900/month",
    features: [
      "Featured placement on your category page",
      "Published prices and photos",
      "Sponsored mention in related guides",
      "A dedicated account manager",
      "Monthly profile updates",
    ],
  },
  {
    name: "Premium",
    price: "฿9,900/month",
    note: "Most popular",
    premium: true,
    features: [
      "The top Featured slot in your category",
      "◆ Premium badge everywhere you appear",
      "Featured on our homepage and city page",
      "Up to 3 doctors with their credentials",
      "3 sponsored articles a year",
      "3 backlinks with your preferred anchor",
    ],
  },
];

const STATS = [
  { value: "690+",    label: "Verified clinics" },
  { value: "19,000+", label: "Reviews analysed" },
  { value: "4",       label: "Specialties" },
  { value: "2",       label: "Cities live, more coming" },
];

const AUDIENCE = [
  "Expats living in Thailand who need care they can trust",
  "Medical tourists planning treatment around a trip",
  "English-speaking locals comparing clinics before they commit",
];

const STEPS = [
  { n: "1", title: "Apply",       body: "Send your clinic details using the form below. Takes about two minutes." },
  { n: "2", title: "We verify",   body: "We check your clinic against Google data, confirm it's operational, and build your full profile." },
  { n: "3", title: "You go live", body: "Your verified listing publishes and patients start finding you — usually within 5–7 days." },
];

const REASONS = [
  { title: "Independent verification", body: "Every listing is manually checked — a trust signal a plain Google profile can't give you." },
  { title: "Built for decisions",      body: "Services, languages, transit access, hours and AI-summarised reviews — everything a patient needs to choose you." },
  { title: "Found by the right patients", body: "People filter for exactly what you offer — English-speaking, near BTS, open weekends — and you show up." },
  { title: "In the ‘best of’ shortlists", body: "Appear in curated category comparisons instead of being buried on page three of Maps." },
];

const FAQ = [
  { q: "How much does it cost?", a: "Basic is free. Pro is ฿4,900 a month and Premium is ฿9,900 a month. There's no commission on any plan, and patients contact you directly." },
  { q: "How long until I'm live?", a: "Most listings publish within 5–7 days of applying, once we've verified your clinic details." },
  { q: "What do you need from me?", a: "To start, just your clinic name, city, category and a contact email. We build the profile from verified public data and confirm the details with you before publishing." },
  { q: "How do I get my clinic to the top of my category?", a: "Premium puts your clinic at the top of your category with the ◆ Premium badge, and on our homepage and city page. Pro gives you a Featured spot on your category page. '★ Top rated' is separate: it's our editors' pick, and no more than five clinics in a category get it." },
  { q: "Can I update my listing later?", a: "Yes. Once you're verified, send us changes any time — new hours, services or photos — and we'll keep your profile current." },
  { q: "What if I'm not in Bangkok or Phuket?", a: "We're expanding to Chiang Mai, Pattaya and new specialties. Apply now and we'll add you the moment your city goes live." },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function ListYourClinicPage() {
  const [name, setName]         = useState("");
  const [clinic, setClinic]     = useState("");
  const [email, setEmail]       = useState("");
  const [city, setCity]         = useState("");
  const [category, setCategory] = useState("");

  const [status, setStatus]     = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subject = `[Clinic] Listing request — ${clinic}`;

    if (!FORMSPREE_ENDPOINT) {
      const body = `Name: ${name}\nClinic: ${clinic}\nEmail: ${email}\nCity: ${city}\nCategory: ${category}`;
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus("sending");
    try {
      const honeypot = (e.currentTarget.elements.namedItem("_gotcha") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          form: "Clinic: listing request", name, clinic, email, city, category,
          _subject: subject, _replyto: email, _gotcha: honeypot,
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
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

          {/* Audience & reach */}
          <div style={{ marginBottom: "48px" }}>
            <div style={{
              display:             "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap:                 "16px",
              padding:             "28px 0",
              borderTop:           "1px solid var(--border-soft)",
              borderBottom:        "1px solid var(--border-soft)",
              marginBottom:        "28px",
            }} className="lyc-stats">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div style={{
                    fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                    fontSize:   "clamp(24px,4vw,32px)",
                    fontWeight: 400,
                    color:      "var(--green)",
                    lineHeight: 1,
                    marginBottom: "6px",
                  }}>{value}</div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize:   "12px",
                    color:      "var(--muted)",
                    lineHeight: 1.4,
                  }}>{label}</div>
                </div>
              ))}
            </div>
            <p style={{
              fontFamily:   "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:     "15px",
              lineHeight:   1.75,
              color:        "var(--charcoal-soft)",
              marginBottom: "16px",
            }}>
              These aren't window-shoppers. They're people ready to book, and they reach you already searching for your service:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {AUDIENCE.map((a) => (
                <div key={a} style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: "0 12px", alignItems: "start" }}>
                  <span style={{ color: "var(--green)", fontWeight: 600, paddingTop: "1px" }}>›</span>
                  <span style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize:   "15px",
                    color:      "var(--charcoal)",
                    lineHeight: 1.5,
                  }}>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: "40px", height: "2px", background: "var(--green)", marginBottom: "48px" }} />

          {/* Plans */}
          <div style={{ marginBottom: "56px" }}>
            <h2 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "26px",
              fontWeight:   400,
              color:        "var(--charcoal)",
              marginBottom: "8px",
            }}>
              Choose your plan
            </h2>
            <p style={{
              fontFamily:   "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:     "15px",
              color:        "var(--muted)",
              marginBottom: "24px",
            }}>
              Every plan is commission-free, and patients always contact you directly.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", alignItems: "stretch" }} className="lyc-reasons">
              {PLANS.map(({ name, price, note, premium, features }) => (
                <div key={name} style={{
                  border:       premium ? "1px solid var(--gold)" : "1px solid var(--border-soft)",
                  boxShadow:    premium ? "inset 0 0 0 1px var(--gold)" : undefined,
                  borderRadius: "6px",
                  background:   premium ? "#fffdf7" : "var(--white)",
                  padding:      "20px 20px 22px",
                  display:      "flex",
                  flexDirection: "column",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", minHeight: "20px", marginBottom: "6px" }}>
                    <span style={{
                      fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "22px",
                      fontWeight: 500, color: "var(--charcoal)",
                    }}>{name}</span>
                    {note && (
                      <span style={{
                        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "10px", fontWeight: 600,
                        letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap",
                        background: "var(--gold-pale)", border: "1px solid var(--gold)", color: "var(--gold-ink)",
                        padding: "3px 6px", borderRadius: "4px",
                      }}>{note}</span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px",
                    fontWeight: 600, color: premium ? "var(--gold-ink)" : "var(--green)", marginBottom: "14px",
                  }}>{price}</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {features.map((f) => (
                      <li key={f} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: "0 8px", alignItems: "start" }}>
                        <span style={{ color: "var(--open)", fontSize: "13px", fontWeight: 600, paddingTop: "1px" }}>✓</span>
                        <span style={{
                          fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13.5px",
                          color: "var(--charcoal-soft)", lineHeight: 1.5,
                        }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div style={{ marginBottom: "56px" }}>
            <h2 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "26px",
              fontWeight:   400,
              color:        "var(--charcoal)",
              marginBottom: "24px",
            }}>
              How it works
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {STEPS.map(({ n, title, body }) => (
                <div key={n} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "0 16px", alignItems: "start" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "var(--green)", color: "var(--white)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", fontWeight: 600,
                  }}>{n}</div>
                  <div style={{ paddingTop: "4px" }}>
                    <div style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px",
                      fontWeight: 600, color: "var(--charcoal)", marginBottom: "4px",
                    }}>{title}</div>
                    <div style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px",
                      color: "var(--charcoal-soft)", lineHeight: 1.6,
                    }}>{body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why list with us */}
          <div style={{ marginBottom: "56px" }}>
            <h2 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "26px",
              fontWeight:   400,
              color:        "var(--charcoal)",
              marginBottom: "8px",
            }}>
              You already have a Google listing
            </h2>
            <p style={{
              fontFamily:   "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:     "15px",
              color:        "var(--muted)",
              marginBottom: "24px",
            }}>
              Here's what a verified ThailandClinics profile adds on top of it.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="lyc-reasons">
              {REASONS.map(({ title, body }) => (
                <div key={title} style={{
                  border: "1px solid var(--border-soft)", borderRadius: "6px",
                  background: "var(--white)", padding: "20px 22px",
                }}>
                  <div style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14.5px",
                    fontWeight: 600, color: "var(--charcoal)", marginBottom: "6px",
                  }}>{title}</div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px",
                    color: "var(--charcoal-soft)", lineHeight: 1.6,
                  }}>{body}</div>
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
              Start free on Basic
            </span>
            <span style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:   "14px",
              color:      "var(--charcoal-soft)",
              lineHeight: 1.6,
            }}>
              Every clinic starts on Basic, and Basic stays free. Upgrade to Pro
              or Premium whenever you want more visibility.
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

            {status === "sent" ? (
              <div role="status" style={{
                background: "var(--green-pale)", border: "1px solid var(--green)", borderRadius: "6px", padding: "24px 28px",
              }}>
                <div style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "26px", color: "var(--green)", marginBottom: "6px" }}>
                  Request received
                </div>
                <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", lineHeight: 1.7, color: "var(--charcoal-soft)", margin: 0 }}>
                  Thanks, {name.split(" ")[0] || "there"}. We&apos;ll reply to {email} about listing {clinic} within 2–3 business days.
                </p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Spam trap: hidden from people, filled in by bots */}
              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }} />

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
                disabled={status === "sending"}
                style={{
                  fontFamily:      "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize:        "14px",
                  fontWeight:      500,
                  backgroundColor: "var(--green)",
                  color:           "var(--white)",
                  border:          "none",
                  borderRadius:    "4px",
                  padding:         "14px 28px",
                  cursor:          status === "sending" ? "wait" : "pointer",
                  opacity:         status === "sending" ? 0.7 : 1,
                  alignSelf:       "flex-start",
                  transition:      "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--green-light)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--green)")}
              >
                {status === "sending" ? "Sending…" : "Submit listing request"}
              </button>

              {status === "error" && (
                <p role="alert" style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", color: "var(--terracotta)", margin: 0 }}>
                  Something went wrong sending your request. Please try again, or email us at{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--green)" }}>{CONTACT_EMAIL}</a>.
                </p>
              )}

              <p style={{
                fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                fontSize:   "12.5px",
                color:      "var(--muted)",
                margin:     0,
              }}>
                {FORMSPREE_ENDPOINT
                  ? "We reply within 2–3 business days."
                  : "Submitting opens your email app with your details filled in. We reply within 2–3 business days."}
              </p>

            </form>
            )}
          </div>

          {/* FAQ */}
          <div style={{ marginTop: "72px" }}>
            <h2 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "26px",
              fontWeight:   400,
              color:        "var(--charcoal)",
              marginBottom: "8px",
            }}>
              Clinic owner questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", marginTop: "16px" }}>
              {FAQ.map(({ q, a }) => (
                <details key={q} style={{ borderBottom: "1px solid var(--border-soft)" }} className="faq-item">
                  <summary style={{
                    fontFamily:     "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize:       "15px",
                    fontWeight:     500,
                    color:          "var(--charcoal)",
                    padding:        "18px 0",
                    cursor:         "pointer",
                    listStyle:      "none",
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "center",
                    gap:            "16px",
                  }}>
                    {q}
                    <span style={{ flexShrink: 0, color: "var(--muted)", fontSize: "18px", lineHeight: 1, userSelect: "none" }} className="faq-chevron" />
                  </summary>
                  <p style={{
                    fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize:      "14px",
                    lineHeight:    1.7,
                    color:         "var(--charcoal-soft)",
                    paddingBottom: "18px",
                    margin:        0,
                  }}>
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </div>

        </div>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
