/**
 * Shapes for the translatable text of the editorial figures in Figures.tsx.
 * Data (prices, clinic/hospital/brand names) lives in Figures.tsx and is shared by
 * every language; these dictionaries hold only the words a reader sees.
 */
export type FigureLang = "en" | "de" | "it" | "fr" | "es" | "pt" | "zh" | "ar";

/** Price chart: `notes[i]` belongs to row i of the figure's data rows. */
export type PriceText = { title: string; caption: string; notes: string[] };

/** Comparison card. `title` is omitted when the card title is a list of names (kept in Figures.tsx). */
export type CardText = { tag: string; title?: string; points: string[]; foot?: string };
export type CardsText = { title: string; caption: string; cols: CardText[] };

export type StepText = { title: string; body: string };
export type StepsText = { title: string; caption: string; steps: StepText[] };

/** Formatters handed to each dictionary so inline prices use the shared numbers. */
export type Fmt = {
  /** "฿150,000" (en, zh, ar) / "฿150.000" (de, it, es, pt) / "฿150 000" (fr, U+202F). Western digits always. */
  baht: (n: number) => string;
  /** Plain grouped number, same separators as `baht`. */
  num: (n: number) => string;
};

export type FigureTexts = {
  "surgery-prices": PriceText;
  "surgery-hospital-vs-clinic": CardsText;
  "surgery-quote": StepsText;
  "aesthetic-safety-checklist": StepsText;
  "vial-check": StepsText;
  "aesthetic-red-flags": CardsText;
  "physio-prices": PriceText;
  "physio-hospital-vs-clinic": CardsText;
  "physio-first-visit": StepsText;
  "postop-checklist": StepsText;
  "surgeon-handover": StepsText;
  "rehab-milestones": CardsText;
  "ivf-prices": PriceText;
  "hospital-vs-centre": CardsText;
  "like-for-like-quote": StepsText;
  "pgt-types": CardsText;
  "pgt-timeline": StepsText;
  "pgt-checklist": StepsText;
  "meditation-costs": PriceText;
  "meditation-vs-healing": CardsText;
  "meditation-before-you-go": StepsText;
};

export type FigureDict = {
  /** Eyebrow + aria-label of the <InShort> answer capsule. */
  inShort: string;
  figures: FigureTexts;
};

/** Prices quoted inside figure text, shared with the chart rows so they cannot drift. */
export const INLINE_PRICES = {
  /** House of Dhamma 2-day course upper bound = top of the "Donation to ฿9,000" range. */
  houseOfDhammaTwoDayTo: 9_000,
  /** Saksit 2-day Pranic Healing Level 1, all-in. */
  saksitLevel1: 9_500,
} as const;
