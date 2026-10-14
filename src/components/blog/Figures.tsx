/**
 * Editorial figures for blog posts, used from MDX as <Figure name="..." />.
 * Built in HTML/CSS (not image files) so they use the site fonts, stay sharp and
 * reflow on mobile. No stock photography: every figure is drawn from data the
 * post itself states. Update the figure when the post's numbers change.
 */
import type { ReactNode } from "react";

const SANS = "var(--font-dm-sans,'DM Sans',sans-serif)";
const SERIF = "var(--font-cormorant,'Cormorant Garamond',serif)";

function Frame({ title, caption, children }: { title: string; caption: string; children: ReactNode }) {
  return (
    <figure style={{
      background: "var(--white)", border: "1px solid var(--border)", borderRadius: "6px",
      padding: "24px", margin: "32px 0",
    }}>
      <div style={{ fontFamily: SERIF, fontSize: "22px", fontWeight: 500, color: "var(--charcoal)", lineHeight: 1.25, marginBottom: "18px" }}>
        {title}
      </div>
      {children}
      <figcaption style={{ fontFamily: SANS, fontSize: "12.5px", color: "var(--muted)", lineHeight: 1.6, marginTop: "16px" }}>
        {caption}
      </figcaption>
    </figure>
  );
}

const label: React.CSSProperties = { fontFamily: SANS, fontSize: "13.5px", color: "var(--charcoal)", lineHeight: 1.4 };
const meta: React.CSSProperties = { fontFamily: SANS, fontSize: "12.5px", color: "var(--charcoal-soft)", lineHeight: 1.55 };
const eyebrow: React.CSSProperties = {
  fontFamily: SANS, fontSize: "11px", fontWeight: 500, letterSpacing: "0.1em",
  textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "6px",
};

/* ── IVF package prices (single series: one hue, no legend) ───────────── */
const MAX = 500_000;
const PRICES: { name: string; note: string; from: number; to?: number }[] = [
  { name: "Genesis Fertility Center", note: "4 ICSI packages", from: 150_000, to: 350_000 },
  { name: "MedPark", note: "IVF/ICSI, residents only", from: 280_000 },
  { name: "Prime Fertility Center", note: "ICSI package", from: 299_000 },
  { name: "Bangkok Hospital", note: "Fly-in package A", from: 335_000 },
  { name: "Bangkok Hospital", note: "Package B, with PGT-A + freezing", from: 456_000 },
];
const baht = (n: number) => `฿${n.toLocaleString("en-GB")}`;

function IvfPrices() {
  return (
    <Frame
      title="Published IVF/ICSI package prices in Bangkok, October 2026"
      caption="Source: each provider's own published price, checked 14 October 2026. Jetanin and Bumrungrad publish no package price. Packages include different things, so compare itemised quotes, not headline prices."
    >
      <div role="table" aria-label="Published IVF package prices">
        {PRICES.map((p) => {
          const left = p.to ? (p.from / MAX) * 100 : 0;
          const width = ((p.to ?? p.from) - (p.to ? p.from : 0)) / MAX * 100;
          const value = p.to ? `${baht(p.from)}–${baht(p.to)}` : baht(p.from);
          return (
            <div role="row" key={p.name + p.note} style={{ marginBottom: "14px" }}>
              <div role="rowheader" style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "5px" }}>
                <span style={label}><strong style={{ fontWeight: 600 }}>{p.name}</strong> <span style={{ color: "var(--muted)" }}>· {p.note}</span></span>
                <span role="cell" style={{ ...label, fontWeight: 600, whiteSpace: "nowrap" }}>{value}</span>
              </div>
              <div style={{ position: "relative", height: "10px", background: "var(--linen-dark)", borderRadius: "4px" }} title={`${p.name}: ${value}`}>
                <div style={{
                  position: "absolute", left: `${left}%`, width: `${width}%`, top: 0, bottom: 0,
                  background: p.to ? "var(--green-light)" : "var(--green)", borderRadius: "4px",
                }} />
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "space-between", ...meta, color: "var(--muted)", marginTop: "4px" }}>
          <span>฿0</span><span>฿250,000</span><span>฿500,000</span>
        </div>
      </div>
    </Frame>
  );
}

/* ── Two- or three-column comparison cards ─────────────────────────────── */
function Cards({ cols }: { cols: { tag: string; title: string; points: string[]; foot?: string }[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
      {cols.map((c) => (
        <div key={c.title} style={{
          flex: "1 1 200px", background: "var(--linen)", border: "1px solid var(--border-soft)",
          borderRadius: "6px", padding: "18px",
        }}>
          <div style={eyebrow}>{c.tag}</div>
          <div style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 500, color: "var(--charcoal)", marginBottom: "10px", lineHeight: 1.2 }}>{c.title}</div>
          <ul style={{ margin: 0, paddingLeft: "18px", listStyleType: "disc" }} className="mdx-list">
            {c.points.map((pt) => <li key={pt} style={{ ...meta, marginBottom: "5px" }}>{pt}</li>)}
          </ul>
          {c.foot && <div style={{ ...meta, color: "var(--green)", fontWeight: 500, marginTop: "10px" }}>{c.foot}</div>}
        </div>
      ))}
    </div>
  );
}

function HospitalVsCentre() {
  return (
    <Frame
      title="Dedicated fertility centre or hospital-based centre?"
      caption="ThailandClinics editorial summary, October 2026. Ask your own doctor whether your medical history calls for hospital backup."
    >
      <Cards cols={[
        { tag: "Dedicated centre", title: "GFC, Jetanin, VFC, Prime", points: [
          "Does reproductive medicine only",
          "Lab volume concentrated on IVF",
          "Usually the lower package price",
          "A smaller team that knows your case",
        ], foot: "Suits most healthy patients" },
        { tag: "Hospital-based centre", title: "Bangkok Hospital, MedPark, Bumrungrad", points: [
          "Every other specialty in the same building",
          "Intensive care on site",
          "Hospital pricing",
          "Fits complex medical histories",
        ], foot: "Suits patients with other conditions or higher OHSS risk" },
      ]} />
    </Frame>
  );
}

/* ── Numbered steps (vertical on mobile, wraps on desktop) ─────────────── */
function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: "12px" }}>
      {steps.map((s, i) => (
        <li key={s.title} style={{
          flex: "1 1 150px", background: "var(--linen)", border: "1px solid var(--border-soft)",
          borderRadius: "6px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "flex-start",
        }}>
          <span aria-hidden style={{
            flex: "0 0 28px", height: "28px", borderRadius: "100px", background: "var(--green)", color: "var(--white)",
            fontFamily: SANS, fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center",
          }}>{i + 1}</span>
          <span>
            <span style={{ ...label, fontWeight: 600, display: "block", marginBottom: "3px" }}>{s.title}</span>
            <span style={meta}>{s.body}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function LikeForLikeQuote() {
  return (
    <Frame
      title="Ask every provider to quote the same cycle"
      caption="One identical request makes headline prices comparable. Send it to every provider on your shortlist."
    >
      <Steps steps={[
        { title: "Stimulation", body: "Including medication, with the dose cap stated" },
        { title: "Egg retrieval + ICSI", body: "Anaesthesia and embryo culture to day 5" },
        { title: "PGT-A", body: "Price for up to 4 embryos, biopsy included" },
        { title: "Freezing + storage", body: "All embryos, first year of storage" },
        { title: "Frozen transfer", body: "Lining preparation and one transfer" },
        { title: "Exclusions", body: "Everything not covered, in writing" },
      ]} />
    </Frame>
  );
}

function PgtTypes() {
  return (
    <Frame
      title="The three types of PGT"
      caption="PGT means preimplantation genetic testing: a lab test on IVF embryos before transfer. Whether you need it is a decision for you and your fertility doctor."
    >
      <Cards cols={[
        { tag: "PGT-A", title: "Aneuploidy", points: [
          "Checks embryos for the wrong number of chromosomes",
          "The most common test",
          "Often suggested from age 37, or after repeated miscarriage or failed transfers",
        ] },
        { tag: "PGT-M", title: "Monogenic", points: [
          "Tests for one known inherited condition, e.g. thalassaemia",
          "The lab usually builds a test for your family first",
          "Adds weeks to the timeline",
        ] },
        { tag: "PGT-SR", title: "Structural rearrangement", points: [
          "For a partner who carries a translocation or inversion",
          "Offered by fewer clinics",
          "In Bangkok: MedPark and VFC list it",
        ] },
      ]} />
    </Frame>
  );
}

function PgtTimeline() {
  return (
    <Frame
      title="How a PGT cycle runs"
      caption="Typical sequence. Timings vary by clinic and by test: PGT-M can take longer."
    >
      <Steps steps={[
        { title: "IVF + egg retrieval", body: "Stimulation, then eggs collected and fertilised" },
        { title: "Culture to day 5–6", body: "Embryos grow to the blastocyst stage" },
        { title: "Biopsy", body: "A few outer cells are removed from each embryo" },
        { title: "Freeze", body: "Every biopsied embryo is frozen" },
        { title: "Test results", body: "Usually 1–3 weeks" },
        { title: "Frozen transfer", body: "In a later cycle, using a tested embryo" },
      ]} />
    </Frame>
  );
}

function PgtChecklist() {
  return (
    <Frame
      title="The ThailandClinics 7-point PGT checklist"
      caption="Use the same seven checks for every clinic, and ask for the answers in writing."
    >
      <Steps steps={[
        { title: "PGT types", body: "Does it offer the test you need?" },
        { title: "Where it's tested", body: "In-house lab or sent out?" },
        { title: "The lab", body: "Time-lapse, witnessing, ISO 15189, ESHRE" },
        { title: "The biopsy", body: "Who does it, and how often?" },
        { title: "Price per embryo", body: "Biopsy, test, freezing, storage" },
        { title: "Success data", body: "Live births per PGT-tested transfer, by age" },
        { title: "Thai law", body: "No sex selection; medical use only" },
      ]} />
    </Frame>
  );
}

const FIGURES: Record<string, () => React.JSX.Element> = {
  "ivf-prices": IvfPrices,
  "hospital-vs-centre": HospitalVsCentre,
  "like-for-like-quote": LikeForLikeQuote,
  "pgt-types": PgtTypes,
  "pgt-timeline": PgtTimeline,
  "pgt-checklist": PgtChecklist,
};

export function Figure({ name }: { name: string }) {
  const F = FIGURES[name];
  return F ? <F /> : null;
}

/** "In short" answer capsule at the top of a post. */
export function InShort({ children }: { children: ReactNode }) {
  return (
    <aside aria-label="In short" style={{
      background: "var(--green-pale)", borderLeft: "3px solid var(--green)",
      borderRadius: "0 6px 6px 0", padding: "20px 24px", margin: "8px 0 28px",
    }}>
      <div style={{ ...eyebrow, color: "var(--green)", fontWeight: 600 }}>In short</div>
      <div className="in-short-body">{children}</div>
    </aside>
  );
}
