/**
 * AIO guides — programmatic, pillar-page "How to choose a [category] clinic in [city]" guides.
 *
 * Each guide is generated from a category content model + a city model + live
 * clinic data (top-clinic shortlist, counts, the districts clinics cluster in).
 * Written long-form and structured for AI-search citation: an extractable answer
 * up top, a navigable table of contents, decision criteria, treatment breakdowns,
 * real cost stats, patient-type guidance, booking process, questions to ask, red
 * flags and a deep FAQ. Guides generate only for city×category combos with data.
 *
 * To add a city/category, add an entry below — route, sitemap and links pick it up.
 */

export type GuideCity = {
  slug: string;
  name: string;
  transit: string;
  tourismLine: string;
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
  noun: string;
  nounPlural: string;
  short: string;
  answer: string;                          // 40-60 word extractable direct answer
  whyCity: string;                         // the case for {city} (2-3 sentences)
  criteria: { title: string; body: string }[];
  treatments: { name: string; body: string }[];   // treatment / service breakdown
  costs: { label: string; th: string; west: string }[];
  costsNote: string;                       // context under the cost table
  audiences: { who: string; body: string }[];      // expat / tourist / local
  process: { step: string; body: string }[];       // how to book / what to expect
  questions: string[];                     // questions to ask before committing
  redFlags: string[];
  faq: { q: string; a: string }[];
};

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
    whyCity:
      "{city} is one of the world's most established dental-tourism destinations. Its leading clinics use the same materials and equipment as Western practices — Straumann and Nobel Biocare implants, CEREC same-day crowns — at 50–70% lower prices, and many dentists trained or hold fellowships abroad. The result is Western-standard dentistry without Western prices, which is why patients fly in from across Asia, Australia, the Middle East and Europe.",
    criteria: [
      { title: "Dentist credentials & specialisation", body: "Check the dentist is registered with the Thai Dental Council and trained in your specific treatment. Implants, veneers and orthodontics each demand particular expertise — a general dentist isn't always the right fit for complex work." },
      { title: "English-speaking dentists & coordinators", body: "Clear communication prevents costly misunderstandings about treatment plans and costs. {city}'s international clinics have fluent English-speaking dentists and treatment coordinators who walk you through every step." },
      { title: "Review volume & recency", body: "A 4.8 rating from 800 recent reviews means far more than a 5.0 from 12. High, consistent review volume is the strongest signal that a clinic reliably delivers — it's the single factor we weight most in our own rankings." },
      { title: "Sterilisation & safety standards", body: "Ask about sterilisation protocols, single-use instruments and infection control. Reputable clinics display their standards openly and are happy to explain them on request." },
      { title: "Transparent, itemised pricing", body: "Get a written, itemised quote before any treatment starts. Thailand's price advantage disappears fast if unexpected fees appear mid-treatment." },
      { title: "Technology & materials", body: "Digital scanners, 3D imaging and named implant/crown brands (Straumann, Nobel Biocare, Zirconia) signal a clinic investing in outcomes. Ask which brands they use — quality dentistry is transparent about materials." },
      { title: "Location & appointment access", body: "Implants and orthodontics need several visits. Choosing a clinic near {transit} makes follow-ups painless — a real factor if you're staying short-term." },
      { title: "Aftercare & follow-up", body: "For dental tourism, confirm what happens if something needs adjusting after you fly home: remote support, partner clinics abroad, or a return-visit window." },
    ],
    treatments: [
      { name: "Dental implants", body: "A titanium post placed in the jaw to replace a missing tooth, topped with a crown. Usually two visits over 3–6 months (placement, then the final crown once integrated), though some clinics offer immediate-load options. Thailand is especially popular for implants because the cost gap with the West is largest here." },
      { name: "Veneers & smile makeovers", body: "Thin porcelain shells bonded to the front of teeth to change shape, colour and alignment. A full set is typically completed in 3–5 days across two or three appointments — a common reason patients combine treatment with a holiday." },
      { name: "Crowns & bridges", body: "Caps that restore a damaged tooth, or fixed replacements for missing teeth. Many {city} clinics offer same-day CEREC crowns milled on-site, cutting a multi-visit job to a single appointment." },
      { name: "Orthodontics (braces & Invisalign)", body: "Traditional braces or clear aligners to straighten teeth. This needs ongoing supervision, so it suits residents and long-stay expats more than short-trip tourists — plan for regular check-ins." },
      { name: "Root canals & general dentistry", body: "Cleanings, fillings, extractions and root canal therapy. Routine care is inexpensive and widely available, and a good entry point for judging a clinic before committing to bigger work." },
    ],
    costs: [
      { label: "Dental cleaning / scaling", th: "$30–50", west: "$150–300" },
      { label: "Dental implant (single)", th: "$1,000–2,000", west: "$3,000–5,000" },
      { label: "Porcelain veneer (per tooth)", th: "$250–500", west: "$900–2,500" },
      { label: "Root canal", th: "$100–250", west: "$700–1,500" },
      { label: "Crown", th: "$200–450", west: "$1,000–2,500" },
      { label: "Invisalign (full)", th: "$2,500–4,500", west: "$4,000–8,000" },
    ],
    costsNote:
      "Even after flights and accommodation, a full-mouth restoration or a set of veneers usually costs far less in {city} than the same work at home — which is why the maths works for dental tourists. Always get a written itemised quote, as costs vary by clinic, materials and case complexity.",
    audiences: [
      { who: "Expats living in Thailand", body: "You have the luxury of building a long-term relationship with one clinic. Prioritise proximity to home or work, consistent quality and a dentist you trust for ongoing care — cleanings, check-ups and the occasional bigger job." },
      { who: "Medical tourists", body: "You're optimising a short window. Book your consultation before arriving so a plan and quote are ready, pick treatments that fit your timeline (veneers and crowns are trip-friendly; implants and orthodontics usually aren't), and confirm aftercare for once you're home." },
      { who: "English-speaking locals", body: "You can visit in person before committing. Use that: tour the clinic, meet the dentist, and judge the sterilisation standards and communication first-hand before booking major work." },
    ],
    process: [
      { step: "Shortlist & compare", body: "Compare verified clinics by rating, review volume, English-speaking staff and location. Our {city} dental directory ranks clinics by a review-weighted score and summarises real patient feedback." },
      { step: "Book a consultation", body: "Most clinics offer a first consultation with X-rays and a written treatment plan. For dental tourism, do this remotely or on day one so nothing eats into your trip." },
      { step: "Get an itemised quote", body: "Ask for the plan broken down by procedure, materials and number of visits. A clear quote is itself a quality signal." },
      { step: "Treatment & follow-up", body: "Complete the work over the planned visits, and confirm the aftercare arrangement — a review appointment, or remote support once you've flown home." },
    ],
    questions: [
      "Is the dentist registered with the Thai Dental Council, and what's their experience with my specific treatment?",
      "Can I get a written, itemised quote before we start?",
      "Which implant / crown / material brands do you use?",
      "What are your sterilisation and infection-control standards?",
      "How many visits will this take, and over what timeframe?",
      "What happens if something needs adjusting after I return home?",
    ],
    redFlags: [
      "Prices far below the market average — quality dental work has real material and lab costs.",
      "No written treatment plan or itemised quote before work begins.",
      "Pressure to commit to expensive treatment on the first visit.",
      "Vague or evasive answers about the dentist's qualifications or experience.",
      "Very few reviews, or a sudden flood of reviews all posted within a short window.",
      "Reluctance to name the materials or implant brands they use.",
    ],
    faq: [
      { q: "How much does dental treatment cost in {city}?", a: "Routine cleanings run about $30–50, single implants $1,000–2,000, and porcelain veneers $250–500 per tooth — typically 50–70% below UK, US or Australian private prices. Always get a written itemised quote, as costs vary by clinic and case complexity." },
      { q: "Are dentists in {city} qualified?", a: "Dentists in Thailand must be registered with the Thai Dental Council, and many at leading clinics hold additional training or fellowships from institutions abroad. Ask about the specific dentist's qualifications and experience with your treatment." },
      { q: "Do {city} dental clinics have English-speaking dentists?", a: "Many do — especially the international clinics that serve expats and medical tourists. On our directory you can filter for English-speaking clinics so communication is never a barrier." },
      { q: "How long should I stay for dental implants?", a: "Implants usually need two visits over 3–6 months — placement first, then the final crown once the implant has integrated. Some clinics offer immediate-load options; confirm your timeline before booking travel." },
      { q: "How many days do I need for veneers?", a: "A full set of veneers is typically completed in 3–5 days across two or three appointments, which is why they're one of the most popular dental-tourism treatments in {city}." },
      { q: "Is it safe to get dental work done in Thailand?", a: "At reputable, well-reviewed clinics, yes — they use the same materials and standards as Western practices. Safety varies by clinic, not country, which is why verified reviews and clear sterilisation standards matter. Every clinic in our directory is checked against its public record." },
      { q: "What implant brands do Thai clinics use?", a: "Leading clinics use the same premium systems as Western practices — Straumann, Nobel Biocare and similar. Ask which brand a clinic uses; a quality clinic will always tell you." },
      { q: "Can I claim dental treatment in Thailand on my insurance?", a: "Some international health-insurance and dental plans reimburse overseas treatment — check your policy before travelling and ask the clinic for itemised receipts and documentation." },
      { q: "How do I find the best dental clinic in {city}?", a: "Compare verified clinics by rating, review volume, English-speaking staff and location. Our {city} dental directory ranks clinics by a review-weighted score and summarises real patient feedback so you can shortlist quickly." },
    ],
  },
};

/* ─── Slug helpers ───────────────────────────────────────────────── */

export function guideSlug(citySlug: string, categorySlug: string): string {
  const cat = GUIDE_CATEGORIES[categorySlug];
  const noun = (cat?.noun ?? categorySlug.replace(/-clinics$/, "")).replace(/\s+/g, "-");
  return `how-to-choose-a-${noun}-in-${citySlug}`;
}

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
