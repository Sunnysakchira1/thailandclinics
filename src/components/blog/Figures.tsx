/**
 * Editorial figures for blog posts, used from MDX as <Figure name="..." /> (or with
 * lang="de" etc. on translated posts). Built in HTML/CSS (not image files) so they use
 * the site fonts, stay sharp and reflow on mobile. No stock photography: every figure is
 * drawn from data the post itself states. Update the figure when the post's numbers change.
 *
 * Data (prices, clinic/hospital/brand names) is defined once here and shared by every
 * language. The words a reader sees live in ./figure-text/<lang>.ts.
 */
import type { ReactNode } from "react";
import {
  figureText, INLINE_PRICES,
  type CardsText, type FigureLang, type FigureTexts, type Fmt, type PriceText, type StepsText,
} from "./figure-text";

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
/** One bar. The note (what the price covers) comes from the language dictionary, by index. */
type PriceRow = { name: string; from: number; to?: number };
type PriceData = { max: number; rows: PriceRow[] };

function PriceChart({ t, data, fmt }: { t: PriceText; data: PriceData; fmt: Fmt }) {
  const { max, rows } = data;
  const baht = fmt.baht;
  return (
    <Frame title={t.title} caption={t.caption}>
      <div role="table" aria-label={t.title}>
        {rows.map((p, i) => {
          const note = t.notes[i];
          const left = p.to ? (p.from / max) * 100 : 0;
          const width = ((p.to ?? p.from) - (p.to ? p.from : 0)) / max * 100;
          const value = p.to ? `${baht(p.from)}–${baht(p.to)}` : baht(p.from);
          return (
            <div role="row" key={p.name + note} style={{ marginBottom: "14px" }}>
              <div role="rowheader" style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "5px" }}>
                <span style={label}><strong style={{ fontWeight: 600 }}>{p.name}</strong> <span style={{ color: "var(--muted)" }}>· {note}</span></span>
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

const PRICE_DATA = {
  "ivf-prices": {
    max: 500_000,
    rows: [
      { name: "Genesis Fertility Center", from: 150_000, to: 350_000 },
      { name: "MedPark", from: 280_000 },
      { name: "Prime Fertility Center", from: 299_000 },
      { name: "Bangkok Hospital", from: 335_000 },
      { name: "Bangkok Hospital", from: 456_000 },
    ],
  },
  "surgery-prices": {
    max: 300_000,
    rows: [
      { name: "Yanhee", from: 30_000, to: 220_000 },
      { name: "Bangkok Hospital", from: 46_000, to: 265_000 },
      { name: "Yanhee", from: 125_000, to: 217_000 },
      { name: "Bangkok Hospital", from: 190_000, to: 202_000 },
      { name: "Yanhee", from: 33_500, to: 37_500 },
      { name: "Bangkok Hospital", from: 60_000 },
    ],
  },
  "physio-prices": {
    max: 4_000,
    rows: [
      { name: "Pain Away Clinic", from: 1_500, to: 3_000 },
      { name: "BPC Physio", from: 2_000, to: 3_800 },
      { name: "Form Recovery and Wellness", from: 2_100, to: 3_500 },
    ],
  },
  "meditation-costs": {
    max: 10_000,
    rows: [
      { name: "Bangkok Shambhala", from: 150, to: 300 },
      { name: "House of Dhamma", from: 4_500, to: 5_000 },
      { name: "House of Dhamma", from: 8_000, to: INLINE_PRICES.houseOfDhammaTwoDayTo },
      { name: "Saksit Meditation and Healing Centre", from: INLINE_PRICES.saksitLevel1 },
    ],
  },
} satisfies Record<string, PriceData>;

/* ── Two- or three-column comparison cards ─────────────────────────────── */
type Card = { tag: string; title: string; points: string[]; foot?: string };

function Cards({ cols }: { cols: Card[] }) {
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

/**
 * Card titles that are lists of names stay here, in one place for every language.
 * `null` means the title is a translatable phrase taken from the dictionary.
 */
const CARD_NAMES = {
  "hospital-vs-centre": ["GFC, Jetanin, VFC, Prime", "Bangkok Hospital, MedPark, Bumrungrad"],
  "pgt-types": [null, null, null],
  "surgery-hospital-vs-clinic": ["Yanhee, Kamol", "Bangkok Hospital, Bumrungrad"],
  "aesthetic-red-flags": [null, null, null],
  "physio-hospital-vs-clinic": ["Form, BPC, FRESH, Pain Away", "Vejthani, Bumrungrad, MedPark"],
  "rehab-milestones": [null, null, null],
  "meditation-vs-healing": ["Wat Mahathat, Buddhadasa Archives", "Shambhala, House of Dhamma", "Saksit Meditation and Healing Centre"],
} satisfies Record<string, (string | null)[]>;

function CardsFigure({ t, names }: { t: CardsText; names: (string | null)[] }) {
  return (
    <Frame title={t.title} caption={t.caption}>
      <Cards cols={t.cols.map((c, i) => ({
        tag: c.tag, title: names[i] ?? c.title ?? "", points: c.points, ...(c.foot ? { foot: c.foot } : {}),
      }))} />
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

function StepsFigure({ t }: { t: StepsText }) {
  return (
    <Frame title={t.title} caption={t.caption}>
      <Steps steps={t.steps} />
    </Frame>
  );
}

/* ── Registry ──────────────────────────────────────────────────────────── */
type FigureName = keyof FigureTexts;
type Renderer = (t: FigureTexts, fmt: Fmt) => React.JSX.Element;

const price = (n: keyof typeof PRICE_DATA): Renderer =>
  function renderPriceFigure(t, fmt) { return <PriceChart t={t[n]} data={PRICE_DATA[n]} fmt={fmt} />; };
const cards = (n: keyof typeof CARD_NAMES): Renderer =>
  function renderCardsFigure(t) { return <CardsFigure t={t[n]} names={CARD_NAMES[n]} />; };
const steps = (n: { [K in FigureName]: FigureTexts[K] extends StepsText ? K : never }[FigureName]): Renderer =>
  function renderStepsFigure(t) { return <StepsFigure t={t[n]} />; };

const FIGURES: Record<FigureName, Renderer> = {
  "surgery-prices": price("surgery-prices"),
  "surgery-hospital-vs-clinic": cards("surgery-hospital-vs-clinic"),
  "surgery-quote": steps("surgery-quote"),
  "aesthetic-safety-checklist": steps("aesthetic-safety-checklist"),
  "vial-check": steps("vial-check"),
  "aesthetic-red-flags": cards("aesthetic-red-flags"),
  "physio-prices": price("physio-prices"),
  "physio-hospital-vs-clinic": cards("physio-hospital-vs-clinic"),
  "physio-first-visit": steps("physio-first-visit"),
  "postop-checklist": steps("postop-checklist"),
  "surgeon-handover": steps("surgeon-handover"),
  "rehab-milestones": cards("rehab-milestones"),
  "ivf-prices": price("ivf-prices"),
  "hospital-vs-centre": cards("hospital-vs-centre"),
  "like-for-like-quote": steps("like-for-like-quote"),
  "pgt-types": cards("pgt-types"),
  "pgt-timeline": steps("pgt-timeline"),
  "pgt-checklist": steps("pgt-checklist"),
  "meditation-costs": price("meditation-costs"),
  "meditation-vs-healing": cards("meditation-vs-healing"),
  "meditation-before-you-go": steps("meditation-before-you-go"),
};

/** Every figure name, for tests and tooling. */
export const FIGURE_NAMES = Object.keys(FIGURES) as FigureName[];

export function Figure({ name, lang = "en" }: { name: string; lang?: FigureLang }) {
  const render = (FIGURES as Record<string, Renderer | undefined>)[name];
  if (!render) return null;
  const { dict, fmt } = figureText(lang);
  return render(dict.figures, fmt);
}

/** "In short" answer capsule at the top of a post. */
export function InShort({ children, lang = "en" }: { children: ReactNode; lang?: FigureLang }) {
  const heading = figureText(lang).dict.inShort;
  return (
    <aside aria-label={heading} style={{
      background: "var(--green-pale)", borderLeft: "3px solid var(--green)",
      borderRadius: "0 6px 6px 0", padding: "20px 24px", margin: "8px 0 28px",
    }}>
      <div style={{ ...eyebrow, color: "var(--green)", fontWeight: 600 }}>{heading}</div>
      <div className="in-short-body">{children}</div>
    </aside>
  );
}
