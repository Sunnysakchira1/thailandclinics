import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "Brand Guidelines | ThailandClinics",
  description:
    "The ThailandClinics brand system — logo, color, typography, spacing, and voice.",
  robots: { index: false, follow: false },
};

/* ── tokens (mirror of globals.css :root) ───────────────────────── */
const SERIF = "var(--font-cormorant, 'Cormorant Garamond', serif)";
const SANS = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const COLORS = [
  { group: "Foundation", items: [
    { name: "Linen", hex: "#faf8f5", role: "Page background — never pure white", dark: false },
    { name: "Linen Dark", hex: "#f2ede6", role: "Alternating section background", dark: false },
    { name: "White", hex: "#ffffff", role: "Cards only", dark: false },
    { name: "Border", hex: "#e0d9ce", role: "Standard borders", dark: false },
    { name: "Border Soft", hex: "#ece7df", role: "Subtle dividers", dark: false },
  ]},
  { group: "Brand green", items: [
    { name: "Green", hex: "#1a4731", role: "Primary brand colour, logo, CTAs", dark: true },
    { name: "Green Light", hex: "#2a5c40", role: "Hover states, accents", dark: true },
    { name: "Green Pale", hex: "#eef4f0", role: "Tints, highlights, key-term marks", dark: false },
  ]},
  { group: "Ink", items: [
    { name: "Charcoal", hex: "#1a1a1a", role: "Headings, footer", dark: true },
    { name: "Charcoal Soft", hex: "#3d3d3d", role: "Body emphasis", dark: true },
    { name: "Muted", hex: "#8a8278", role: "Secondary / meta text", dark: true },
  ]},
  { group: "Accent (sparingly)", items: [
    { name: "Terracotta", hex: "#c4622d", role: "Category tags + eyebrows ONLY — never CTAs", dark: true },
    { name: "Star", hex: "#e8a020", role: "Rating stars", dark: true },
    { name: "Open", hex: "#2d7a4f", role: "Open-now status", dark: true },
  ]},
];

const TYPE_SCALE = [
  ["Hero H1", "Cormorant Garamond", "clamp(48–84px)", "300"],
  ["Section title", "Cormorant Garamond", "36px", "400"],
  ["Page title", "Cormorant Garamond", "28px", "400"],
  ["Clinic name", "Cormorant Garamond", "21–22px", "500"],
  ["Logo wordmark", "Cormorant Garamond", "20–22px", "500–600"],
  ["Body / description", "DM Sans", "13.5–16px", "400"],
  ["Nav / filters", "DM Sans", "13.5px", "400"],
  ["Meta / reviews", "DM Sans", "12–12.5px", "400"],
  ["Eyebrow", "DM Sans", "11px · UPPERCASE", "500"],
  ["Category tag", "DM Sans", "10.5–11px · UPPERCASE", "500"],
];

/* ── small presentational helpers ───────────────────────────────── */
function Eyebrow({ children, color = "var(--terracotta)" }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color }}>
      {children}
    </div>
  );
}

function Section({ n, title, intro, bg = "var(--linen)", children }: {
  n: string; title: string; intro?: string; bg?: string; children: React.ReactNode;
}) {
  return (
    <section style={{ background: bg, padding: "72px 48px", borderTop: "1px solid var(--border-soft)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow>{n}</Eyebrow>
        <h2 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 400, color: "var(--charcoal)", margin: "10px 0 0" }}>{title}</h2>
        {intro && <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.65, color: "var(--charcoal-soft)", maxWidth: 680, margin: "14px 0 0" }}>{intro}</p>}
        <div style={{ marginTop: 40 }}>{children}</div>
      </div>
    </section>
  );
}

/** The primary wordmark, rendered live. */
function Wordmark({ size = 34, reverse = false }: { size?: number; reverse?: boolean }) {
  const color = reverse ? "var(--linen)" : "var(--green)";
  return (
    <span style={{ fontFamily: SERIF, fontSize: size, fontWeight: 500, color, letterSpacing: "-0.01em", lineHeight: 1 }}>
      Thailand<span style={{ fontStyle: "italic" }}>Clinics</span>
    </span>
  );
}

function LockupCard({ label, hint, bg = "var(--white)", children }: {
  label: string; hint?: string; bg?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ border: "1px solid var(--border-soft)", borderRadius: 6, overflow: "hidden", background: "var(--white)" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--charcoal-soft)" }}>{label}</span>
        {hint && <span style={{ fontFamily: SANS, fontSize: 11, fontStyle: "italic", color: "var(--muted)" }}>{hint}</span>}
      </div>
      <div style={{ background: bg, minHeight: 132, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        {children}
      </div>
    </div>
  );
}

export default function BrandGuidelines() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--linen)" }}>
        {/* Cover */}
        <header style={{ background: "var(--green)", color: "var(--linen)", padding: "84px 48px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Eyebrow color="rgba(250,248,245,0.6)">Brand Guidelines</Eyebrow>
            <h1 style={{ fontFamily: SERIF, fontSize: "clamp(44px, 7vw, 76px)", fontWeight: 300, margin: "16px 0 0", lineHeight: 1.05 }}>
              Thailand<span style={{ fontStyle: "italic" }}>Clinics</span>
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 15, color: "rgba(250,248,245,0.75)", margin: "18px 0 0", maxWidth: 560, lineHeight: 1.6 }}>
              The Independent Clinic Directory. The visual and verbal system behind a
              high-trust healthcare discovery platform for Thailand.
            </p>
            <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(250,248,245,0.5)", marginTop: 28, letterSpacing: "0.04em" }}>
              Version 1.0 · 2026
            </div>
          </div>
        </header>

        {/* 01 — Essence */}
        <Section n="01 — Brand essence" title="What we are" bg="var(--linen)"
          intro="ThailandClinics is infrastructure, not a lead-gen site or a booking platform. We do the research so medical tourists, expats, and English-speaking locals can find the best clinic faster.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            <div style={{ background: "var(--green-pale)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 24 }}>
              <div style={{ fontFamily: SERIF, fontSize: 22, color: "var(--green)", fontStyle: "italic" }}>“We do the research to find the best.”</div>
              <p style={{ fontFamily: SANS, fontSize: 13.5, color: "var(--charcoal-soft)", marginTop: 12, lineHeight: 1.6 }}>The core promise. Every page should earn trust before it asks for anything.</p>
            </div>
            <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 24 }}>
              <Eyebrow color="var(--green)">We are</Eyebrow>
              <ul style={{ fontFamily: SANS, fontSize: 13.5, color: "var(--charcoal-soft)", lineHeight: 1.8, margin: "10px 0 0", paddingLeft: 18 }}>
                <li>Verified, research-led infrastructure</li>
                <li>Expat- and tourist-trusted</li>
                <li>Editorial, calm, premium</li>
              </ul>
            </div>
            <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 24 }}>
              <Eyebrow color="var(--terracotta)">We are not</Eyebrow>
              <ul style={{ fontFamily: SANS, fontSize: 13.5, color: "var(--charcoal-soft)", lineHeight: 1.8, margin: "10px 0 0", paddingLeft: 18 }}>
                <li>A lead-gen funnel</li>
                <li>A booking platform</li>
                <li>Loud, salesy, or cluttered</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* 02 — Logo */}
        <Section n="02 — Logo" title="The wordmark" bg="var(--linen-dark)"
          intro="The primary logo is the editorial wordmark: “Thailand” in roman, “Clinics” in italic, set in Cormorant Garamond, forest green. The premium, publication feel — trust comes from the typography.">
          {/* hero wordmark */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: "56px 24px", textAlign: "center", marginBottom: 24 }}>
            <Wordmark size={56} />
          </div>
          {/* lockups */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <LockupCard label="Primary"><Wordmark size={28} /></LockupCard>
            <LockupCard label="Stacked">
              <div style={{ textAlign: "center", fontFamily: SERIF, color: "var(--green)", lineHeight: 1.05 }}>
                <div style={{ fontSize: 26, fontWeight: 500 }}>Thailand</div>
                <div style={{ fontSize: 26, fontStyle: "italic" }}>Clinics</div>
              </div>
            </LockupCard>
            <LockupCard label="With tagline">
              <div style={{ textAlign: "center" }}>
                <Wordmark size={24} />
                <div style={{ fontFamily: SANS, fontSize: 8.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginTop: 8 }}>The Independent Clinic Directory</div>
              </div>
            </LockupCard>
            <LockupCard label="Favicon · Tc" hint="app icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="ThailandClinics Tc favicon" width={72} height={72} style={{ borderRadius: 16, display: "block" }} />
            </LockupCard>
            <LockupCard label="Mono · ink">
              <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 500, color: "var(--charcoal)" }}>Thailand<span style={{ fontStyle: "italic" }}>Clinics</span></span>
            </LockupCard>
            <LockupCard label="Mono · reverse" bg="var(--green)"><Wordmark size={28} reverse /></LockupCard>
          </div>

          {/* clear space + misuse */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 32 }}>
            <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 24 }}>
              <Eyebrow color="var(--green)">Clear space & sizing</Eyebrow>
              <ul style={{ fontFamily: SANS, fontSize: 13.5, color: "var(--charcoal-soft)", lineHeight: 1.8, margin: "10px 0 0", paddingLeft: 18 }}>
                <li>Keep clear space equal to the cap-height of “T” on all sides</li>
                <li>Minimum wordmark width: 110px on screen</li>
                <li>Use the Tc mark below 110px (favicons, avatars, app icons)</li>
              </ul>
            </div>
            <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 24 }}>
              <Eyebrow color="var(--terracotta)">Never</Eyebrow>
              <ul style={{ fontFamily: SANS, fontSize: 13.5, color: "var(--charcoal-soft)", lineHeight: 1.8, margin: "10px 0 0", paddingLeft: 18 }}>
                <li>Recolour the wordmark or use the old blue (#30669D)</li>
                <li>Substitute the font, stretch, skew, or add shadows/gradients</li>
                <li>Set “Clinics” in roman or “Thailand” in italic</li>
                <li>Place on a busy photo without the green or linen field</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* 03 — Colour */}
        <Section n="03 — Colour" title="Palette" bg="var(--linen)"
          intro="Forest green leads. Linen is the canvas — never pure white for backgrounds. Terracotta is reserved for category tags and eyebrows only, never for buttons.">
          {COLORS.map((g) => (
            <div key={g.group} style={{ marginBottom: 28 }}>
              <Eyebrow color="var(--muted)">{g.group}</Eyebrow>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14, marginTop: 12 }}>
                {g.items.map((c) => (
                  <div key={c.name} style={{ border: "1px solid var(--border-soft)", borderRadius: 6, overflow: "hidden", background: "var(--white)" }}>
                    <div style={{ background: c.hex, height: 72, borderBottom: "1px solid var(--border-soft)" }} />
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "var(--charcoal)" }}>{c.name}</div>
                      <div style={{ fontFamily: SANS, fontSize: 11.5, color: "var(--muted)", marginTop: 1, textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.hex}</div>
                      <div style={{ fontFamily: SANS, fontSize: 11.5, color: "var(--charcoal-soft)", marginTop: 6, lineHeight: 1.45 }}>{c.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ background: "var(--green-pale)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: "14px 18px", fontFamily: SANS, fontSize: 13, color: "var(--charcoal-soft)" }}>
            <strong style={{ color: "var(--terracotta)" }}>Forbidden:</strong> the old blue <code>#30669D</code> appears nowhere. Page backgrounds are never pure white. Gradients are never used on text or buttons.
          </div>
        </Section>

        {/* 04 — Typography */}
        <Section n="04 — Typography" title="Two typefaces, two roles" bg="var(--linen-dark)"
          intro="Cormorant Garamond for everything display. DM Sans for everything UI. Never mix the roles, never introduce a third typeface.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
            <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 28 }}>
              <Eyebrow color="var(--green)">Display</Eyebrow>
              <div style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, color: "var(--charcoal)", marginTop: 10, lineHeight: 1.1 }}>Cormorant Garamond</div>
              <div style={{ fontFamily: SERIF, fontSize: 16, color: "var(--muted)", marginTop: 8 }}>Headings · clinic names · logo · city names</div>
            </div>
            <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 28 }}>
              <Eyebrow color="var(--green)">Interface</Eyebrow>
              <div style={{ fontFamily: SANS, fontSize: 34, fontWeight: 500, color: "var(--charcoal)", marginTop: 10, lineHeight: 1.1 }}>DM Sans</div>
              <div style={{ fontFamily: SANS, fontSize: 14, color: "var(--muted)", marginTop: 10 }}>Body · nav · buttons · filters · badges · meta</div>
            </div>
          </div>

          {/* italic-green rule */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 28, marginBottom: 28 }}>
            <Eyebrow color="var(--green)">Emphasis rule</Eyebrow>
            <div style={{ fontFamily: SERIF, fontSize: 30, color: "var(--charcoal)", marginTop: 12, lineHeight: 1.25 }}>
              The definitive guide to <em style={{ color: "var(--green)" }}>healthcare in Thailand</em>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: "var(--muted)", marginTop: 10 }}>Emphasis = Cormorant italic in green. Use once per headline, never for whole lines.</p>
          </div>

          {/* scale table */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: SANS, fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--linen-dark)" }}>
                  {["Element", "Typeface", "Size", "Weight"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--charcoal-soft)", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TYPE_SCALE.map((r, i) => (
                  <tr key={r[0]} style={{ borderTop: "1px solid var(--border-soft)", background: i % 2 ? "var(--linen)" : "var(--white)" }}>
                    <td style={{ padding: "9px 16px", color: "var(--charcoal)", fontWeight: 500 }}>{r[0]}</td>
                    <td style={{ padding: "9px 16px", color: "var(--charcoal-soft)" }}>{r[1]}</td>
                    <td style={{ padding: "9px 16px", color: "var(--charcoal-soft)" }}>{r[2]}</td>
                    <td style={{ padding: "9px 16px", color: "var(--muted)" }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 05 — Layout */}
        <Section n="05 — Layout & form" title="Spacing, radius, elevation" bg="var(--linen)"
          intro="Generous, calm spacing. Soft borders over hard shadows. Corners are gently rounded; pills are fully rounded.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { t: "Spacing", rows: [["Page padding", "48px / 24px mobile"], ["Section padding", "72px vertical"], ["Nav height", "64px sticky"]] },
              { t: "Max widths", rows: [["Sections", "1200px"], ["Listing", "1400px"], ["Sidebar", "260px"]] },
              { t: "Radius", rows: [["Cards", "6px"], ["Buttons / badges", "4px"], ["Pills / chips", "100px"]] },
            ].map((b) => (
              <div key={b.t} style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 24 }}>
                <Eyebrow color="var(--green)">{b.t}</Eyebrow>
                <table style={{ width: "100%", marginTop: 10, fontFamily: SANS, fontSize: 13, borderCollapse: "collapse" }}>
                  <tbody>
                    {b.rows.map((r) => (
                      <tr key={r[0]}><td style={{ padding: "5px 0", color: "var(--charcoal-soft)" }}>{r[0]}</td><td style={{ padding: "5px 0", color: "var(--muted)", textAlign: "right" }}>{r[1]}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          {/* radius + shadow demo */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 24 }}>
            <div style={{ width: 120, height: 80, background: "var(--white)", border: "1px solid var(--border)", borderRadius: 6, boxShadow: "0 12px 32px rgba(26,26,26,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontSize: 11, color: "var(--muted)" }}>Card hover</div>
            <div style={{ padding: "9px 18px", background: "var(--green)", color: "var(--white)", borderRadius: 4, fontFamily: SANS, fontSize: 13, alignSelf: "center" }}>Button</div>
            <div style={{ padding: "7px 16px", background: "var(--white)", border: "1px solid var(--border)", borderRadius: 100, fontFamily: SANS, fontSize: 12.5, color: "var(--charcoal-soft)", alignSelf: "center" }}>Pill / chip</div>
            <div style={{ padding: "3px 8px", background: "var(--linen-dark)", borderRadius: 4, fontFamily: SANS, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--terracotta)", alignSelf: "center" }}>Category tag</div>
          </div>
        </Section>

        {/* 06 — Voice */}
        <Section n="06 — Voice & tone" title="How we speak" bg="var(--linen-dark)"
          intro="Healthcare is YMYL — Google and readers hold us to a higher trust standard. Answer first, prove it, never hype.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 24 }}>
              <Eyebrow color="var(--green)">Do</Eyebrow>
              <ul style={{ fontFamily: SANS, fontSize: 13.5, color: "var(--charcoal-soft)", lineHeight: 1.8, margin: "10px 0 0", paddingLeft: 18 }}>
                <li>Answer the query in the first sentence — no preamble</li>
                <li>Be specific and benefit-led; cite sources for any stat</li>
                <li>Short sentences, active voice, zero jargon</li>
                <li>Show “last updated” dates and verification methodology</li>
              </ul>
            </div>
            <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 24 }}>
              <Eyebrow color="var(--terracotta)">Don’t</Eyebrow>
              <ul style={{ fontFamily: SANS, fontSize: 13.5, color: "var(--charcoal-soft)", lineHeight: 1.8, margin: "10px 0 0", paddingLeft: 18 }}>
                <li>Open with “Welcome to…” or filler intros</li>
                <li>Keyword-stuff or over-promise outcomes</li>
                <li>Use “click here” / “read more” — anchor real phrases</li>
                <li>Make medical claims we can’t attribute</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* 07 — Applications */}
        <Section n="07 — In product" title="The system, applied" bg="var(--linen)"
          intro="The header above this page shows the wordmark in use. Below: a clinic card and rank badges drawn straight from the live components.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {/* clinic card mock */}
            <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 28, position: "relative" }}>
              <div style={{ position: "absolute", top: 16, right: 16, width: 28, height: 28, borderRadius: "50%", background: "#c9a84c", color: "#fff", fontFamily: SANS, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>1</div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--open)", background: "var(--green-pale)", padding: "3px 8px", borderRadius: 4, display: "inline-block" }}>✓ Verified choice</div>
              <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 500, color: "var(--charcoal)", margin: "12px 0 0" }}>Thonglor Physio Center</h3>
              <div style={{ fontFamily: SANS, fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>Watthana, Bangkok</div>
              <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, color: "var(--charcoal-soft)" }}>
                <span style={{ color: "var(--star)" }}>★★★★★</span> 4.9 <span style={{ color: "var(--muted)" }}>(287 reviews)</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                {["EN", "BTS"].map((t) => (
                  <span key={t} style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--charcoal-soft)", background: "var(--linen-dark)", padding: "3px 8px", borderRadius: 4 }}>{t}</span>
                ))}
              </div>
            </div>
            {/* rank badges */}
            <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: 28 }}>
              <Eyebrow color="var(--green)">Rank badges</Eyebrow>
              <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                {[["1", "#c9a84c", "Gold"], ["2", "#8a8278", "Silver"], ["3", "#a0714c", "Bronze"], ["4+", "#1a1a1a", "Charcoal"]].map(([n, bg, name]) => (
                  <div key={name} style={{ textAlign: "center" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: bg, color: "#fff", fontFamily: SANS, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>{n}</div>
                    <div style={{ fontFamily: SANS, fontSize: 10.5, color: "var(--muted)", marginTop: 6 }}>{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <footer style={{ background: "var(--footer-bg)", color: "rgba(250,248,245,0.6)", padding: "40px 48px", fontFamily: SANS, fontSize: 12.5 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span>ThailandClinics — Brand Guidelines v1.0</span>
            <span>© 2026 · Internal &amp; partner use</span>
          </div>
        </footer>
      </main>
    </>
  );
}
