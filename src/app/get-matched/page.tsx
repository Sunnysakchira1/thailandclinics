"use client";

import { useState } from "react";
import Nav from "@/components/layout/Nav";
import { FORMSPREE_ENDPOINT, CONTACT_EMAIL } from "@/lib/forms";

const TREATMENTS: { group: string; items: string[] }[] = [
  { group: "Fertility", items: ["IVF / ICSI", "PGT (genetic testing)", "Egg freezing", "IUI", "Fertility testing"] },
  { group: "Dental", items: ["Dental implants", "Veneers", "Crowns or bridges", "Braces or Invisalign", "Root canal", "Teeth whitening", "Check-up and cleaning"] },
  { group: "Cosmetic (non-surgical)", items: ["Botox", "Dermal fillers", "Ulthera / HIFU skin lifting", "Laser and skin treatments", "Acne or scar treatment", "Thread lift"] },
  { group: "Cosmetic surgery", items: ["Rhinoplasty (nose)", "Breast augmentation", "Eyelid surgery", "Facelift", "Liposuction"] },
  { group: "Physiotherapy", items: ["Back or neck pain", "Sports injury", "Post-surgery rehab (ACL, knee, hip)", "Office syndrome", "Physio for older adults"] },
  { group: "Wellness", items: ["Health check-up", "IV therapy / NAD+", "Weight management"] },
  { group: "Something else", items: ["Other (tell us below)"] },
];
const CITIES = ["Bangkok", "Phuket", "Chiang Mai", "Pattaya", "Not sure yet"];
const TIMING = ["Within a month", "1–3 months", "3–6 months", "Just researching"];

const STEPS = [
  { n: "1", title: "Tell us what you need", body: "Treatment, city, timing and anything that matters to you. Takes two minutes." },
  { n: "2", title: "We do the research", body: "We check your case against the clinics in our directory: services, published prices, lab and doctors, and what patients say." },
  { n: "3", title: "You get a shortlist", body: "2–3 clinics that fit, why each one fits, and the questions to ask them. Usually within 2–3 business days." },
];

const FAQ = [
  { q: "Is it free?", a: "Yes. The shortlist is free for patients, and you're under no obligation to book anything." },
  { q: "Is this medical advice?", a: "No. We're not doctors. We help you find clinics worth talking to, then you and the clinic's doctor decide on treatment." },
  { q: "Will you share my details with clinics?", a: "No. We send the shortlist to you, and you decide who to contact. We don't pass your details to any clinic without your permission." },
  { q: "Should I send my medical records?", a: "Not to us. A short description is enough for a shortlist. Send records to the clinic you choose, once you've spoken to them." },
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

export default function GetMatchedPage() {
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [country, setCountry]     = useState("");
  const [treatment, setTreatment] = useState("");
  const [city, setCity]           = useState("");
  const [timing, setTiming]       = useState("");
  const [notes, setNotes]         = useState("");
  const [status, setStatus]       = useState<"idle" | "sending" | "sent" | "error">("idle");
  const isOther = treatment.startsWith("Other");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subject = `[Patient] Shortlist request — ${treatment} in ${city}`;
    const fields = { form: "Patient: get matched", name, email, country, treatment, city, timing, notes };

    if (!FORMSPREE_ENDPOINT) {
      const body = `Name: ${name}\nEmail: ${email}\nCountry: ${country}\nTreatment: ${treatment}\nCity: ${city}\nTiming: ${timing}\n\nWhat matters to me:\n${notes}`;
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus("sending");
    try {
      const honeypot = (e.currentTarget.elements.namedItem("_gotcha") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...fields, _subject: subject, _replyto: email, _gotcha: honeypot }),
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
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "64px 48px 96px" }} className="gm-wrap">

          <p style={{
            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "11px", fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--terracotta)", marginBottom: "16px",
          }}>
            For patients
          </p>

          <h1 style={{
            fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "clamp(36px,5vw,52px)",
            fontWeight: 400, lineHeight: 1.1, color: "var(--charcoal)", marginBottom: "20px",
          }}>
            Get matched with the <em style={{ color: "var(--green)" }}>right clinic</em>
          </h1>

          <p style={{
            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "16px", lineHeight: 1.75,
            color: "var(--charcoal-soft)", marginBottom: "48px",
          }}>
            Tell us what you need and we&apos;ll send you a free shortlist of 2–3 clinics in Thailand that fit your
            case, with the reasons and the questions to ask each one. We do the research so you don&apos;t have to
            compare 40 websites.
          </p>

          {/* How it works */}
          <div style={{ marginBottom: "56px" }}>
            <h2 style={{
              fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "26px", fontWeight: 400,
              color: "var(--charcoal)", marginBottom: "24px",
            }}>
              How it works
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {STEPS.map(({ n, title, body }) => (
                <div key={n} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "0 16px", alignItems: "start" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%", background: "var(--green)", color: "var(--white)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", fontWeight: 600,
                  }}>{n}</div>
                  <div style={{ paddingTop: "4px" }}>
                    <div style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", fontWeight: 600,
                      color: "var(--charcoal)", marginBottom: "4px",
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

          <div style={{ width: "40px", height: "2px", background: "var(--green)", marginBottom: "48px" }} />

          {/* Form */}
          <div>
            <h2 style={{
              fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "26px", fontWeight: 400,
              color: "var(--charcoal)", marginBottom: "8px",
            }}>
              Request your shortlist
            </h2>
            <p style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", color: "var(--muted)",
              marginBottom: "28px",
            }}>
              A short description is enough. Please don&apos;t send medical records.
            </p>

            {status === "sent" ? (
              <div role="status" style={{
                background: "var(--green-pale)", border: "1px solid var(--green)", borderRadius: "6px", padding: "24px 28px",
              }}>
                <div style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "26px", color: "var(--green)", marginBottom: "6px" }}>
                  Request received
                </div>
                <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", lineHeight: 1.7, color: "var(--charcoal-soft)", margin: 0 }}>
                  Thanks, {name.split(" ")[0] || "there"}. We&apos;ll email your shortlist to {email} within 2–3 business days.
                </p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Spam trap: hidden from people, filled in by bots */}
              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="gm-grid">
                <Field label="Your name" id="gm-name" required>
                  <input id="gm-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
                </Field>
                <Field label="Email address" id="gm-email" required>
                  <input id="gm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="gm-grid">
                <Field label="Treatment" id="gm-treatment" required>
                  <select id="gm-treatment" value={treatment} onChange={(e) => setTreatment(e.target.value)} required style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">Select treatment</option>
                    {TREATMENTS.map(({ group, items }) => (
                      <optgroup key={group} label={group}>
                        {items.map((t) => <option key={t} value={t}>{t}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </Field>
                <Field label="City" id="gm-city" required>
                  <select id="gm-city" value={city} onChange={(e) => setCity(e.target.value)} required style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">Select city</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="gm-grid">
                <Field label="Where you're travelling from" id="gm-country">
                  <input id="gm-country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Australia, or living in Bangkok" style={inputStyle} />
                </Field>
                <Field label="When" id="gm-timing">
                  <select id="gm-timing" value={timing} onChange={(e) => setTiming(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">Select timing</option>
                    {TIMING.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>

              <Field label={isOther ? "What treatment do you need?" : "What matters most to you?"} id="gm-notes" required={isOther}>
                <textarea id="gm-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} required={isOther}
                  placeholder={isOther
                    ? "Tell us the treatment, plus anything that matters: budget, English-speaking doctor, location"
                    : "e.g. budget, PGT, English-speaking doctor, near BTS, a hospital setting"}
                  style={{ ...inputStyle, resize: "vertical" }} />
              </Field>

              <button type="submit" className="gm-submit" disabled={status === "sending"} style={{
                fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", fontWeight: 500,
                backgroundColor: "var(--green)", color: "var(--white)", border: "none", borderRadius: "4px",
                padding: "14px 28px", cursor: status === "sending" ? "wait" : "pointer", alignSelf: "flex-start",
                opacity: status === "sending" ? 0.7 : 1,
              }}>
                {status === "sending" ? "Sending…" : "Send my request"}
              </button>

              {status === "error" && (
                <p role="alert" style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", color: "var(--terracotta)", margin: 0 }}>
                  Something went wrong sending your request. Please try again, or email us at{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--green)" }}>{CONTACT_EMAIL}</a>.
                </p>
              )}

              <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "12.5px", color: "var(--muted)", margin: 0 }}>
                {FORMSPREE_ENDPOINT
                  ? "Free, with no obligation. We reply within 2–3 business days."
                  : "Submitting opens your email app with your details filled in. We reply within 2–3 business days."}
              </p>
            </form>
            )}
          </div>

          {/* FAQ */}
          <div style={{ marginTop: "72px" }}>
            <h2 style={{
              fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "26px", fontWeight: 400,
              color: "var(--charcoal)", marginBottom: "8px",
            }}>
              Questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", marginTop: "16px" }}>
              {FAQ.map(({ q, a }) => (
                <details key={q} style={{ borderBottom: "1px solid var(--border-soft)" }} className="faq-item">
                  <summary style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", fontWeight: 500,
                    color: "var(--charcoal)", padding: "18px 0", cursor: "pointer", listStyle: "none",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px",
                  }}>
                    {q}
                    <span style={{ flexShrink: 0, color: "var(--muted)", fontSize: "18px", lineHeight: 1, userSelect: "none" }} className="faq-chevron" />
                  </summary>
                  <p style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", lineHeight: 1.7,
                    color: "var(--charcoal-soft)", paddingBottom: "18px", margin: 0,
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
function Field({ label, id, required, children }: { label: string; id: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label htmlFor={id} style={{
        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "12px", fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--charcoal-soft)",
      }}>
        {label}{required && <span style={{ color: "var(--terracotta)", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", color: "var(--charcoal)",
  backgroundColor: "var(--white)", border: "1px solid var(--border)", borderRadius: "4px",
  padding: "10px 14px", width: "100%", boxSizing: "border-box", appearance: "none" as const,
};
