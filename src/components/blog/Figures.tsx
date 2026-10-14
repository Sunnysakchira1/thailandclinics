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

/* ── Price range chart (single series: one hue, no legend) ──────────── */
type PriceRow = { name: string; note: string; from: number; to?: number };
const baht = (n: number) => `฿${n.toLocaleString("en-GB")}`;

function PriceChart({ title, caption, rows, max }: { title: string; caption: string; rows: PriceRow[]; max: number }) {
  return (
    <Frame title={title} caption={caption}>
      <div role="table" aria-label={title}>
        {rows.map((p) => {
          const left = p.to ? (p.from / max) * 100 : 0;
          const width = ((p.to ?? p.from) - (p.to ? p.from : 0)) / max * 100;
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
          <span>฿0</span><span>{baht(max / 2)}</span><span>{baht(max)}</span>
        </div>
      </div>
    </Frame>
  );
}

const IvfPrices = () => (
  <PriceChart
    title="Published IVF/ICSI package prices in Bangkok, October 2026"
    caption="Source: each provider's own published price, checked 14 October 2026. Jetanin and Bumrungrad publish no package price. Packages include different things, so compare itemised quotes, not headline prices."
    max={500_000}
    rows={[
      { name: "Genesis Fertility Center", note: "4 ICSI packages", from: 150_000, to: 350_000 },
      { name: "MedPark", note: "IVF/ICSI, residents only", from: 280_000 },
      { name: "Prime Fertility Center", note: "ICSI package", from: 299_000 },
      { name: "Bangkok Hospital", note: "Fly-in package A", from: 335_000 },
      { name: "Bangkok Hospital", note: "Package B, with PGT-A + freezing", from: 456_000 },
    ]}
  />
);

const SurgeryPrices = () => (
  <PriceChart
    title="Published cosmetic surgery prices in Bangkok, October 2026"
    caption="Source: Bangkok Hospital and Yanhee published prices, checked 14 October 2026. Bangkok Hospital's breast augmentation price excludes implants; Yanhee's includes the named implant. Bumrungrad and Kamol publish no prices."
    max={300_000}
    rows={[
      { name: "Yanhee", note: "Rhinoplasty, implant to rib graft", from: 30_000, to: 220_000 },
      { name: "Bangkok Hospital", note: "Rhinoplasty, local to septum", from: 46_000, to: 265_000 },
      { name: "Yanhee", note: "Breast augmentation, incl. implant", from: 125_000, to: 217_000 },
      { name: "Bangkok Hospital", note: "Breast augmentation, excl. implant", from: 190_000, to: 202_000 },
      { name: "Yanhee", note: "Eyelid surgery, upper or lower", from: 33_500, to: 37_500 },
      { name: "Bangkok Hospital", note: "Eyelid surgery, upper or lower", from: 60_000 },
    ]}
  />
);

const PhysioPrices = () => (
  <PriceChart
    title="Published physiotherapy session prices in Bangkok, October 2026"
    caption="Source: each clinic's own price list, checked 14 October 2026. Hospitals (Vejthani, Bumrungrad, MedPark, Samitivej, BNH, Bangkok Hospital) publish no per-session price."
    max={4_000}
    rows={[
      { name: "Pain Away Clinic", note: "per session", from: 1_500, to: 3_000 },
      { name: "BPC Physio", note: "60 to 120 min", from: 2_000, to: 3_800 },
      { name: "Form Recovery and Wellness", note: "60 to 120 min", from: 2_100, to: 3_500 },
    ]}
  />
);

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

function SurgeryHospitalVsClinic() {
  return (
    <Frame title="Cosmetic surgery hospital or general hospital?" caption="ThailandClinics editorial summary, October 2026. For any operation under general anaesthesia, check the facility is licensed for surgery.">
      <Cards cols={[
        { tag: "Cosmetic surgery hospital", title: "Yanhee, Kamol", points: [
          "Cosmetic operations every day", "Usually lower prices", "Named surgeons to choose from", "Fewer other specialties on site",
        ], foot: "Suits healthy patients choosing on price or surgeon" },
        { tag: "General private hospital", title: "Bangkok Hospital, Bumrungrad", points: [
          "Every specialty and intensive care on site", "Published packages (Bangkok Hospital)", "Higher prices", "Fits complex medical histories",
        ], foot: "Suits patients with other medical conditions" },
      ]} />
    </Frame>
  );
}

function SurgeryQuote() {
  return (
    <Frame title="Ask every hospital to quote the same operation" caption="One identical request makes cosmetic surgery quotes comparable.">
      <Steps steps={[
        { title: "Surgeon", body: "Full name and Medical Council licence number" },
        { title: "Technique", body: "Exactly which procedure, open or closed" },
        { title: "Implant", body: "Brand, size and type, priced in" },
        { title: "Hospital stay", body: "Nights included, and the room type" },
        { title: "Follow-up", body: "Check-ups, stitch removal, garments" },
        { title: "Complications", body: "Who pays for a revision or readmission" },
      ]} />
    </Frame>
  );
}

function AestheticSafetyChecklist() {
  return (
    <Frame title="The ThailandClinics 6-point aesthetic safety check" caption="Run all six before any Botox or filler appointment in Bangkok.">
      <Steps steps={[
        { title: "Clinic licence", body: "11-digit number on the sign, certificate inside" },
        { title: "Doctor's licence", body: "Full name, checked with the Medical Council" },
        { title: "Thai FDA registration", body: "Toxin numbers start \"1C\"" },
        { title: "Sealed vial", body: "Opened in front of you; photograph the label" },
        { title: "Realistic price", body: "Not far below every licensed clinic" },
        { title: "Aftercare plan", body: "Who you call if something goes wrong" },
      ]} />
    </Frame>
  );
}

function VialCheck() {
  return (
    <Frame title="What to check on the box and vial" caption="Ask to see the product before treatment starts. A licensed clinic won't mind.">
      <Steps steps={[
        { title: "Sealed", body: "Unopened box and vial, opened in front of you" },
        { title: "Brand", body: "Matches the brand you were quoted" },
        { title: "Thai registration", body: "Registration number on the box, e.g. 1C …" },
        { title: "Lot + expiry", body: "Lot number and an expiry date in the future" },
        { title: "Look it up", body: "Search the brand on the Thai FDA product search" },
      ]} />
    </Frame>
  );
}

function AestheticRedFlags() {
  return (
    <Frame title="Red flags at an aesthetic clinic" caption="Each of these has come up in Thai enforcement cases. One is enough to walk away.">
      <Cards cols={[
        { tag: "The place", title: "Wrong setting", points: [
          "Treatment in a condo, home, hotel room or salon", "No licence number on the sign", "Booking only through social-media messages",
        ] },
        { tag: "The person", title: "Wrong injector", points: [
          "Won't give a full name or licence number", "Nickname only in adverts", "A beautician or nurse injecting alone",
        ] },
        { tag: "The product", title: "Wrong product", points: [
          "Won't show you the sealed vial", "Brand not on the Thai FDA database", "A price far below every licensed clinic",
        ] },
      ]} />
    </Frame>
  );
}

function PhysioHospitalVsClinic() {
  return (
    <Frame title="Physio clinic or hospital rehabilitation centre?" caption="ThailandClinics editorial summary, October 2026. After surgery, follow your surgeon's advice on where to do your rehab.">
      <Cards cols={[
        { tag: "Dedicated physio clinic", title: "Form, BPC, FRESH, Pain Away", points: [
          "Published session prices", "60-minute-plus sessions", "Usually the same physiotherapist each visit", "No referral needed",
        ], foot: "Suits back, neck, sports injuries and most post-op rehab" },
        { tag: "Hospital rehab centre", title: "Vejthani, Bumrungrad, MedPark", points: [
          "Rehabilitation doctors on site", "Robotic gait training, hydrotherapy", "Hospital prices, often plus a doctor's fee", "May need a doctor's visit first",
        ], foot: "Suits stroke, spinal injury and complex surgery" },
      ]} />
    </Frame>
  );
}

function PhysioFirstVisit() {
  return (
    <Frame title="What to bring to your first physio session" caption="Bringing these saves a session and helps your physiotherapist plan.">
      <Steps steps={[
        { title: "Your story", body: "When it started, what makes it better or worse" },
        { title: "Scans + reports", body: "MRI, X-ray or ultrasound reports, if you have them" },
        { title: "Surgery notes", body: "Operation notes and your surgeon's protocol" },
        { title: "Your goal", body: "Back to running, sleeping, lifting your child" },
        { title: "Clothes", body: "Shorts or loose clothing you can move in" },
      ]} />
    </Frame>
  );
}

function PostopChecklist() {
  return (
    <Frame title="The ThailandClinics 6-point post-surgery rehab check" caption="Ask every rehab provider the same six questions before your first session.">
      <Steps steps={[
        { title: "Licensed physio", body: "Physical Therapy Council licence" },
        { title: "Surgeon's protocol", body: "Followed, with contact if needed" },
        { title: "Phased plan", body: "Milestones to move to each phase" },
        { title: "Equipment", body: "Gym, pool or strength testing as needed" },
        { title: "Schedule", body: "Visits per phase, plus home exercises" },
        { title: "Clear price", body: "Per session, packages, refunds" },
      ]} />
    </Frame>
  );
}

function SurgeonHandover() {
  return (
    <Frame title="What your rehab clinic needs from your surgeon" caption="Ask your surgeon's team for these before you leave hospital.">
      <Steps steps={[
        { title: "Operation notes", body: "What was done, and the graft or implant used" },
        { title: "Weight-bearing", body: "How much weight the leg can take, and when" },
        { title: "Movement limits", body: "Range-of-motion limits and precautions" },
        { title: "Brace or aids", body: "Brace settings, crutches, how long" },
        { title: "Review dates", body: "When you see the surgeon again" },
      ]} />
    </Frame>
  );
}

function RehabMilestones() {
  return (
    <Frame title="Typical recovery milestones after surgery" caption="Sources: AAOS OrthoInfo and NHS patient guidance. Typical ranges only; your surgeon and physiotherapist set your own timeline.">
      <Cards cols={[
        { tag: "ACL reconstruction", title: "6–12 months to sport", points: [
          "Physio starts straight after surgery", "Return to sport depends on passing strength and function tests", "Not on time alone",
        ] },
        { tag: "Knee replacement", title: "Several months", points: [
          "Daily activities in about 3–6 weeks (AAOS)", "Walking without aids after about 6 weeks (NHS)", "Full recovery can take several months or longer",
        ] },
        { tag: "Hip replacement", title: "Several months", points: [
          "Light activities in about 3–6 weeks (AAOS)", "Movement precautions for about the first 6 weeks", "Full recovery takes several months (NHS)",
        ] },
      ]} />
    </Frame>
  );
}

const FIGURES: Record<string, () => React.JSX.Element> = {
  "surgery-prices": SurgeryPrices,
  "surgery-hospital-vs-clinic": SurgeryHospitalVsClinic,
  "surgery-quote": SurgeryQuote,
  "aesthetic-safety-checklist": AestheticSafetyChecklist,
  "vial-check": VialCheck,
  "aesthetic-red-flags": AestheticRedFlags,
  "physio-prices": PhysioPrices,
  "physio-hospital-vs-clinic": PhysioHospitalVsClinic,
  "physio-first-visit": PhysioFirstVisit,
  "postop-checklist": PostopChecklist,
  "surgeon-handover": SurgeonHandover,
  "rehab-milestones": RehabMilestones,
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
