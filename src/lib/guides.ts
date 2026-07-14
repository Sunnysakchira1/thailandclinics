/**
 * AIO guides — programmatic "How to choose a [category] clinic in [city]" pages.
 *
 * Each guide is generated from a category content model + a city model + live
 * clinic data (top-clinic shortlist, counts). Content is written for AI-search
 * citation: a short extractable answer up top, decision criteria, real cost
 * stats, red flags, and an FAQ. Guides are only generated for city×category
 * combos that actually have clinics (see getGuideCombos in queries).
 *
 * To add a city or category to the programmatic layer, add an entry below — the
 * route, sitemap, and internal links pick it up automatically.
 */

export type GuideCity = {
  slug: string;
  name: string;
  transit: string;      // used in the "location & access" criterion
  tourismLine: string;  // medical-tourism context sentence
};

export const GUIDE_CITIES: Record<string, GuideCity> = {
  "bangkok": {
    slug: "bangkok", name: "Bangkok", transit: "a BTS or MRT station",
    tourismLine: "Bangkok is Southeast Asia's leading medical-tourism hub, with internationally accredited clinics and English-speaking specialists across the city.",
  },
  "phuket": {
    slug: "phuket", name: "Phuket", transit: "the main resort and town areas",
    tourismLine: "Phuket pairs holiday recovery with quality private clinics, and is popular with expats and visiting patients.",
  },
};

export type GuideCategory = {
  slug: string;
  noun: string;        // "dental clinic"
  nounPlural: string;  // "dental clinics"
  short: string;       // "Dental"
  answer: string;      // 40-60 word extractable direct answer ({city} token)
  criteria: { title: string; body: string }[];
  guidance: { h: string; p: string }[];
  costs: { label: string; th: string; west: string }[];
  redFlags: string[];
  faq: { q: string; a: string }[];
};

/* Interpolate {city} / {transit} tokens at render time. */
export function fillGuide(text: string, city: GuideCity): string {
  return text.replace(/\{city\}/g, city.name).replace(/\{transit\}/g, city.transit);
}

export const GUIDE_CATEGORIES: Record<string, GuideCategory> = {
  "dental-clinics": {
    slug: "dental-clinics",
    noun: "dental clinic",
    nounPlural: "dental clinics",
    short: "Dental",
    answer:
      "To choose a dental clinic in {city}, prioritise dentists with verifiable credentials, strong English communication and a high volume of recent patient reviews. Confirm sterilisation standards, transparent itemised pricing, and specific experience in your treatment — implants, veneers or orthodontics. For dental tourism, check aftercare and follow-up options before you book.",
    criteria: [
      { title: "Dentist credentials & specialisation", body: "Check the dentist is registered with the Thai Dental Council and trained in your specific treatment. Implants, veneers and orthodontics each demand particular expertise — a general dentist isn't always the right fit for complex work." },
      { title: "English-speaking dentists & coordinators", body: "Clear communication prevents costly misunderstandings about treatment plans and costs. {city}'s international clinics have fluent English-speaking dentists and treatment coordinators who walk you through every step." },
      { title: "Review volume & recency", body: "A 4.8 rating from 800 recent reviews means far more than a 5.0 from 12. High, consistent review volume is the strongest signal that a clinic reliably delivers." },
      { title: "Sterilisation & safety standards", body: "Ask about sterilisation protocols, single-use instruments and infection control. Reputable clinics display their standards openly and are happy to explain them on request." },
      { title: "Transparent, itemised pricing", body: "Get a written, itemised quote before any treatment starts. Thailand's price advantage disappears fast if unexpected fees appear mid-treatment." },
      { title: "Location & appointment access", body: "Implants and orthodontics need several visits. Choosing a clinic near {transit} makes follow-ups painless — a real factor if you're staying short-term." },
      { title: "Aftercare & follow-up", body: "For dental tourism, confirm what happens if something needs adjusting after you fly home: remote support, partner clinics abroad, or a return-visit window." },
    ],
    guidance: [
      { h: "Popular treatments and what to expect", p: "Bangkok and Phuket clinics handle everything from routine cleanings and fillings to full-mouth implants, veneers, Invisalign and All-on-4. International patients most often come for implants, veneers and crowns — treatments where the cost gap with the West is largest. Complex cases usually need two trips a few months apart (for example, implant placement then the final crown), so plan your timeline with the clinic before you travel." },
      { h: "Is dental treatment in {city} safe?", p: "Thailand's leading dental clinics use the same materials and equipment as Western practices — brands like Straumann and Nobel Biocare for implants — and many dentists trained or hold fellowships abroad. The variation is between clinics, not the country: a well-reviewed, transparent clinic with clear sterilisation standards is as safe as one at home. Verification is the point of this directory — every clinic we list is checked against its public record." },
      { h: "Dental tourism: planning your trip", p: "For a single crown or veneer set, allow 3–5 days. For implants, budget two visits over 3–6 months. Book your consultation before arriving so a treatment plan and quote are ready, and keep a few buffer days after major work in case of adjustments. Pick a clinic near your accommodation and public transport — you'll be making more visits than you expect." },
    ],
    costs: [
      { label: "Dental cleaning / scaling", th: "$30–50", west: "$150–300" },
      { label: "Dental implant (single)", th: "$1,000–2,000", west: "$3,000–5,000" },
      { label: "Porcelain veneer (per tooth)", th: "$250–500", west: "$900–2,500" },
      { label: "Root canal", th: "$100–250", west: "$700–1,500" },
      { label: "Crown", th: "$200–450", west: "$1,000–2,500" },
    ],
    redFlags: [
      "Prices far below the market average — quality dental work has real material and lab costs.",
      "No written treatment plan or itemised quote before work begins.",
      "Pressure to commit to expensive treatment on the first visit.",
      "Vague or evasive answers about the dentist's qualifications or experience.",
      "Very few reviews, or a sudden flood of reviews all posted within a short window.",
    ],
    faq: [
      { q: "How much does dental treatment cost in {city}?", a: "Routine cleanings run about $30–50, single implants $1,000–2,000, and porcelain veneers $250–500 per tooth — typically 50–70% below UK, US or Australian private prices. Always get a written itemised quote, as costs vary by clinic and case complexity." },
      { q: "Are dentists in {city} qualified?", a: "Dentists in Thailand must be registered with the Thai Dental Council, and many at leading clinics hold additional training or fellowships from institutions abroad. Ask about the specific dentist's qualifications and experience with your treatment." },
      { q: "Do {city} dental clinics have English-speaking dentists?", a: "Many do — especially the international clinics that serve expats and medical tourists. On our directory you can filter for English-speaking clinics so communication is never a barrier." },
      { q: "How long should I stay for dental implants?", a: "Implants usually need two visits over 3–6 months — placement first, then the final crown once the implant has integrated. Some clinics offer immediate-load options; confirm your timeline before booking travel." },
      { q: "Is it safe to get dental work done in Thailand?", a: "At reputable, well-reviewed clinics, yes — they use the same materials and standards as Western practices. Safety varies by clinic, not country, which is why verified reviews and clear sterilisation standards matter. Every clinic in our directory is checked against its public record." },
      { q: "How do I find the best dental clinic in {city}?", a: "Compare verified clinics by rating, review volume, English-speaking staff and location. Our {city} dental directory ranks clinics by a review-weighted score and summarises real patient feedback so you can shortlist quickly." },
    ],
  },
};

/* ─── Slug helpers ───────────────────────────────────────────────── */

/** e.g. ("bangkok","dental-clinics") → "how-to-choose-a-dental-clinic-in-bangkok" */
export function guideSlug(citySlug: string, categorySlug: string): string {
  const cat = GUIDE_CATEGORIES[categorySlug];
  const noun = (cat?.noun ?? categorySlug.replace(/-clinics$/, "")).replace(/\s+/g, "-");
  return `how-to-choose-a-${noun}-in-${citySlug}`;
}

/** Reverse a guide slug → { citySlug, categorySlug } (or null if it doesn't match a known combo). */
export function parseGuideSlug(slug: string): { citySlug: string; categorySlug: string } | null {
  const m = slug.match(/^how-to-choose-a-(.+)-in-([a-z-]+)$/);
  if (!m) return null;
  const [, nounPart, citySlug] = m;
  if (!GUIDE_CITIES[citySlug]) return null;
  const categorySlug = Object.keys(GUIDE_CATEGORIES).find(
    (k) => GUIDE_CATEGORIES[k].noun.replace(/\s+/g, "-") === nounPart,
  );
  return categorySlug ? { citySlug, categorySlug } : null;
}
