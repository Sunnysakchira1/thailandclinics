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
  sources: { label: string; url: string; note: string }[];  // authoritative external references
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
    sources: [
      { label: "Thai Dental Council", url: "https://www.dentalcouncil.or.th/", note: "The regulator every dentist practising in Thailand must be registered with." },
      { label: "Joint Commission International (JCI)", url: "https://www.jointcommissioninternational.org/", note: "The global gold standard for healthcare accreditation — worth checking for hospital-based clinics." },
      { label: "Straumann", url: "https://www.straumann.com/", note: "A leading dental-implant system used by many top clinics; useful for verifying implant brands." },
      { label: "Nobel Biocare", url: "https://www.nobelbiocare.com/", note: "Another premium implant system to look for when comparing implant quality." },
    ],
  },

  "physiotherapy-clinics": {
    slug: "physiotherapy-clinics",
    noun: "physiotherapy clinic",
    nounPlural: "physiotherapy clinics",
    short: "Physiotherapy",
    answer:
      "To choose a physiotherapy clinic in {city}, look for licensed physiotherapists with real experience in your specific problem — sports injury, back pain, post-surgical rehab or office syndrome. Prioritise clinics with strong recent reviews, English-speaking therapists, and hands-on manual therapy rather than machine-only sessions. Check the location, session length and whether they offer the technique you actually need.",
    whyCity:
      "{city} has a deep bench of physiotherapy clinics serving desk-bound professionals, athletes and post-operative patients — at a fraction of Western prices. Many therapists trained internationally and blend evidence-based Western physiotherapy with techniques like dry needling and manual therapy. For expats with office syndrome or visitors recovering from surgery, quality one-on-one rehab is affordable and easy to access.",
    criteria: [
      { title: "Licensed physiotherapist & specialisation", body: "Confirm you'll be treated by a registered physiotherapist, and that they have real experience with your condition. Sports injuries, neuro rehab and post-surgical recovery each need different expertise." },
      { title: "Hands-on treatment, not machines only", body: "The best outcomes come from manual therapy and guided exercise, not a passive session on a machine. Ask how much of the session is one-on-one with the therapist." },
      { title: "English-speaking therapists", body: "Rehab depends on clear instructions and feedback. {city}'s international clinics have fluent English-speaking physiotherapists who can explain your programme properly." },
      { title: "Review volume & recency", body: "A high rating backed by hundreds of recent reviews signals a clinic that consistently gets people better — the factor we weight most heavily in our rankings." },
      { title: "Condition-specific experience", body: "A clinic that treats your problem daily — say ACL rehab or chronic lower-back pain — will have sharper protocols than a generalist." },
      { title: "Session length & one-to-one time", body: "Longer sessions with dedicated therapist time usually beat short, shared slots. Ask how long a session runs and how many patients the therapist handles at once." },
      { title: "Location & access", body: "Rehab means repeat visits. A clinic near {transit} keeps a twice-weekly programme realistic." },
      { title: "Home visits & follow-up", body: "Some clinics offer home physiotherapy or remote exercise plans — valuable if you're recovering from surgery or have limited mobility." },
    ],
    treatments: [
      { name: "Sports injury rehabilitation", body: "Assessment and staged recovery for strains, sprains, ligament injuries (ACL, rotator cuff) and return-to-sport programmes — often combining manual therapy, strengthening and movement retraining." },
      { name: "Back, neck & office syndrome", body: "The most common reason expats visit: posture-related neck and back pain, headaches and repetitive strain from desk work. Treatment blends manual therapy, dry needling and a home exercise plan." },
      { name: "Post-surgical rehabilitation", body: "Structured recovery after orthopaedic surgery — joint replacements, spinal surgery, fracture repair — to restore strength and range of motion safely." },
      { name: "Manual therapy & dry needling", body: "Hands-on mobilisation and trigger-point dry needling to release tight muscles and restore movement, usually alongside an exercise programme." },
      { name: "Chronic pain & neuro rehab", body: "Longer-term management for chronic pain, and rehabilitation after stroke or neurological injury — areas where a specialist clinic makes a real difference." },
    ],
    costs: [
      { label: "Physiotherapy session", th: "$25–45", west: "$80–150" },
      { label: "Initial assessment", th: "$30–60", west: "$100–200" },
      { label: "Dry needling session", th: "$30–55", west: "$70–130" },
      { label: "Sports rehab (per session)", th: "$35–60", west: "$90–160" },
      { label: "Home visit", th: "$50–90", west: "$150–300" },
    ],
    costsNote:
      "Physiotherapy in {city} typically costs 60–75% less than private rehab in the UK, US or Australia, with longer, more hands-on sessions. Actual prices vary by clinic and programme — ask for a per-session rate and an estimate of how many sessions you'll need.",
    audiences: [
      { who: "Expats living in Thailand", body: "Most expats come for office syndrome or a recurring injury. Pick a clinic near home or work you can visit consistently, with a therapist who sets a clear home-exercise plan between sessions." },
      { who: "Post-surgery & medical tourists", body: "If you're recovering from surgery, look for a clinic experienced in post-operative rehab and, ideally, one that can coordinate with your surgeon. Home-visit options help in the early stages." },
      { who: "Athletes & active people", body: "For sports injuries, choose a clinic with a sports-rehab focus and return-to-sport programming rather than general physiotherapy." },
    ],
    process: [
      { step: "Shortlist & compare", body: "Compare verified clinics by rating, review volume, English-speaking staff and specialisation. Our {city} physiotherapy directory ranks clinics by a review-weighted score." },
      { step: "Book an assessment", body: "A first session should include a proper assessment of your condition and a diagnosis — not just treatment. This shapes everything that follows." },
      { step: "Agree a treatment plan", body: "Ask for the expected number of sessions, the approach, and what you should do between visits. Progress should be reviewed, not open-ended." },
      { step: "Treatment & progression", body: "Effective rehab progresses — the programme should get harder as you improve, with clear milestones toward your goal." },
    ],
    questions: [
      "Will I be treated by a licensed physiotherapist, and what's their experience with my condition?",
      "How much of each session is hands-on, one-to-one time?",
      "How many sessions do you expect this will take?",
      "What exercises should I do between visits?",
      "Do you coordinate with my doctor or surgeon if needed?",
      "Do you offer home visits or remote exercise plans?",
    ],
    redFlags: [
      "Sessions that are mostly passive machine time with little therapist contact.",
      "No proper assessment or diagnosis before treatment starts.",
      "An open-ended plan with no expected number of sessions or milestones.",
      "No home-exercise programme — recovery stalls without it.",
      "Vague answers about the therapist's qualifications.",
      "Few reviews, or a sudden burst of reviews in a short window.",
    ],
    faq: [
      { q: "How much does physiotherapy cost in {city}?", a: "A session typically runs $25–45, with an initial assessment $30–60 — usually 60–75% below private rates in the UK, US or Australia, and often with longer one-to-one time." },
      { q: "Are physiotherapists in {city} qualified?", a: "Physiotherapists in Thailand must be registered with the Physical Therapy Council, and many at international clinics hold additional training abroad. Ask about the therapist's experience with your specific condition." },
      { q: "Do I need a doctor's referral for physiotherapy?", a: "Usually not — most private clinics accept self-referrals. If you're recovering from surgery, bring any relevant reports so the therapist can work safely from your history." },
      { q: "How many sessions will I need?", a: "It depends on the condition: office syndrome might resolve in a handful of sessions, while post-surgical or chronic cases take longer. A good clinic gives you an estimate and reviews progress." },
      { q: "Do {city} physio clinics have English-speaking therapists?", a: "Many do, especially the international clinics. You can filter for English-speaking clinics on our directory." },
      { q: "Can I get physiotherapy at home?", a: "Yes — some clinics offer home visits, which is useful after surgery or when mobility is limited. Look for it in the clinic's services or ask directly." },
      { q: "What's the difference between physiotherapy and massage?", a: "Physiotherapy is a licensed medical discipline that diagnoses and treats movement problems with assessment, manual therapy and prescribed exercise. Massage relaxes muscles but doesn't diagnose or rehabilitate — for an injury, you want a physiotherapist." },
      { q: "Is dry needling the same as acupuncture?", a: "No. Dry needling targets muscular trigger points to release tension, based on Western anatomy, and is often used within a physiotherapy programme. Acupuncture follows traditional Chinese medicine principles." },
      { q: "How do I find the best physiotherapy clinic in {city}?", a: "Compare verified clinics by rating, review volume, specialisation and English-speaking staff. Our {city} physiotherapy directory ranks clinics by a review-weighted score and summarises real patient feedback." },
    ],
    sources: [
      { label: "Physical Therapy Council of Thailand", url: "https://pt.or.th/", note: "The body every physiotherapist practising in Thailand must be registered with." },
      { label: "World Physiotherapy", url: "https://world.physio/", note: "The global federation for the profession — useful background on standards of practice." },
      { label: "NHS: Physiotherapy", url: "https://www.nhs.uk/conditions/physiotherapy/", note: "A plain-English overview of what physiotherapy involves and when it helps." },
    ],
  },

  "cosmetic-clinics": {
    slug: "cosmetic-clinics",
    noun: "cosmetic clinic",
    nounPlural: "cosmetic clinics",
    short: "Cosmetic",
    answer:
      "To choose a cosmetic clinic in {city}, prioritise licensed doctors, genuine before-and-after results, and authentic, brand-name products (real Botox, Juvederm, approved lasers). Look for strong recent reviews, transparent pricing and an honest consultation that doesn't over-sell. Confirm who performs the treatment — a doctor, not an untrained technician — and check hygiene and aftercare before you book.",
    whyCity:
      "{city} is one of Asia's aesthetic-medicine capitals. Its clinics offer world-class injectables, lasers and skin treatments — often with the newest devices — at prices well below the West, which is why patients travel in for Botox, fillers, ultherapy and skin rejuvenation. The range is enormous, so the art is separating genuine medical clinics from cheap, high-volume operators.",
    criteria: [
      { title: "Licensed doctors performing treatment", body: "Injectables and lasers are medical procedures. Confirm a registered doctor (ideally a dermatologist or trained aesthetic physician) performs or directly supervises your treatment — not an unqualified technician." },
      { title: "Genuine before-and-after results", body: "Ask to see real, unretouched before-and-afters of the clinic's own patients for your specific treatment. Generic stock images are a warning sign." },
      { title: "Authentic, brand-name products", body: "Insist on genuine, approved products — real Botox or Dysport, brand-name fillers like Juvederm or Restylane, FDA/TFDA-cleared lasers. Counterfeit injectables are the biggest safety risk in cheap clinics." },
      { title: "Review volume & recency", body: "High, consistent review volume from recent patients is the strongest signal a clinic delivers safe, natural results — the factor we weight most in our rankings." },
      { title: "Honest consultation, no hard sell", body: "A good clinic recommends what you need and talks you out of what you don't. Pressure to buy expensive packages on the spot is a red flag." },
      { title: "Transparent pricing", body: "Get pricing per unit or per session in writing. Filler priced 'per syringe' and Botox 'per unit' let you compare clinics fairly." },
      { title: "Hygiene & facilities", body: "Clean, professional, clinical facilities — not a back-room in a salon. Sterile technique matters for injectables and any skin procedure." },
      { title: "Aftercare & follow-up", body: "Ask what happens if you have swelling, bruising or an uneven result, and whether touch-ups are included. Reputable clinics stand behind their work." },
    ],
    treatments: [
      { name: "Botox & anti-wrinkle injections", body: "Muscle-relaxing injections to soften frown lines, crow's feet and forehead lines. Quick, results in a few days, lasting 3–4 months. Ask which brand and how many units — pricing should be per unit." },
      { name: "Dermal fillers", body: "Hyaluronic-acid fillers to restore volume, define cheeks and lips, or smooth folds. Insist on genuine brand-name fillers and a doctor with an eye for natural, balanced results." },
      { name: "Laser & skin resurfacing", body: "Lasers for pigmentation, redness, acne scars and overall skin texture — from gentle 'laser facials' to fractional resurfacing. Match the device to your skin type and concern." },
      { name: "Ultherapy & skin tightening", body: "Ultrasound (Ultherapy/HIFU) and radiofrequency to lift and tighten skin without surgery. Popular for the jawline and lower face; results build over months." },
      { name: "Acne & pigmentation treatment", body: "Medical programmes combining lasers, peels and prescription care for active acne, scarring and melasma — an area where a doctor-led clinic clearly outperforms a spa." },
    ],
    costs: [
      { label: "Botox (per area)", th: "$80–200", west: "$250–600" },
      { label: "Dermal filler (per syringe)", th: "$200–450", west: "$600–1,200" },
      { label: "Laser facial / treatment", th: "$60–200", west: "$200–600" },
      { label: "Ultherapy / HIFU", th: "$300–900", west: "$1,500–4,000" },
      { label: "Consultation", th: "Often free–$30", west: "$100–250" },
    ],
    costsNote:
      "{city}'s aesthetic prices run 50–70% below Western clinics, but with cosmetic treatment, cheapest is rarely best — the savings should come from lower operating costs, not counterfeit products or unqualified injectors. Get pricing per unit or session in writing.",
    audiences: [
      { who: "Expats living in Thailand", body: "You can build a relationship with one doctor for ongoing maintenance (Botox, skin programmes). Prioritise a clinic and injector whose results you trust and can return to." },
      { who: "Medical tourists", body: "Non-surgical treatments like Botox, fillers and laser facials fit a short trip well, with minimal downtime. Book a consultation before arriving and leave a buffer day in case of swelling or bruising." },
      { who: "First-timers", body: "Start conservative with a well-reviewed, doctor-led clinic. A good practitioner will under-treat rather than over-fill on a first visit — you can always add more." },
    ],
    process: [
      { step: "Shortlist & compare", body: "Compare verified clinics by rating, review volume, doctor credentials and treatment. Our {city} cosmetic directory ranks clinics by a review-weighted score." },
      { step: "Book a consultation", body: "A proper consultation assesses your face and goals and sets realistic expectations. Use it to confirm who'll perform the treatment and which products they use." },
      { step: "Confirm products & pricing", body: "Ask for the brand, the number of units or syringes, and the total in writing before agreeing to anything." },
      { step: "Treatment & follow-up", body: "After treatment, follow the aftercare advice and attend any review. Ask upfront whether touch-ups are included." },
    ],
    questions: [
      "Who will perform my treatment — a licensed doctor or a technician?",
      "Which product brand will you use, and can I see it's genuine and sealed?",
      "Can I see before-and-after photos of your own patients for this treatment?",
      "How much is it per unit / per syringe, in total?",
      "What are the risks, and what happens if I'm not happy with the result?",
      "Are touch-ups or reviews included?",
    ],
    redFlags: [
      "Prices far below the market — counterfeit injectables are the classic reason.",
      "Treatment performed by an unlicensed technician rather than a doctor.",
      "Refusal to show the product brand, or to open a sealed vial in front of you.",
      "Only generic stock before-and-afters, never the clinic's own patients.",
      "High-pressure selling of expensive packages on the first visit.",
      "A 'clinic' operating out of a salon or beauty shop with no clinical facilities.",
    ],
    faq: [
      { q: "How much does Botox cost in {city}?", a: "Botox is typically $80–200 per area (or priced per unit), and dermal fillers $200–450 per syringe — around 50–70% below Western prices. Always confirm the brand and the number of units or syringes in the price." },
      { q: "Is it safe to get Botox and fillers in {city}?", a: "At a licensed, doctor-led clinic using genuine brand-name products, yes. The main risk is cheap clinics using counterfeit injectables or unqualified injectors — which is exactly why verified reviews and product authenticity matter." },
      { q: "Are the products genuine?", a: "At reputable clinics, yes — real Botox/Dysport and brand-name fillers. Ask to see the sealed product and its brand before treatment; a good clinic will happily show you." },
      { q: "Will a doctor perform my treatment?", a: "At a proper medical clinic, a licensed doctor or trained aesthetic physician performs or directly supervises injectables and lasers. Confirm this before booking." },
      { q: "How long is the recovery for injectables?", a: "Botox has essentially no downtime; fillers may cause temporary swelling or bruising for a few days. If you're a tourist, leave a buffer day before flying or big events." },
      { q: "Do {city} cosmetic clinics have English-speaking doctors?", a: "Many do, particularly the international clinics serving expats and medical tourists. You can filter for English-speaking clinics on our directory." },
      { q: "What's the difference between a cosmetic clinic and a spa?", a: "A cosmetic (aesthetic) clinic is a medical facility where licensed doctors perform injectables, lasers and skin procedures. A spa offers non-medical beauty and relaxation treatments and can't legally provide medical aesthetics." },
      { q: "How do I avoid an over-done look?", a: "Choose a doctor known for natural results, start conservatively, and be wary of anyone pushing large volumes on a first visit. You can always add more later." },
      { q: "How do I find the best cosmetic clinic in {city}?", a: "Compare verified clinics by rating, review volume, doctor credentials and genuine results. Our {city} cosmetic directory ranks clinics by a review-weighted score and summarises real patient feedback." },
    ],
    sources: [
      { label: "The Medical Council of Thailand", url: "https://www.tmc.or.th/", note: "The body that licenses doctors in Thailand — including those performing medical aesthetics." },
      { label: "Thai FDA (medical products)", url: "https://www.fda.moph.go.th/", note: "Regulates medical devices and products; relevant to product and laser authenticity." },
      { label: "Botox (Allergan Aesthetics)", url: "https://www.botox.com/", note: "The genuine product's site — useful to understand what real Botox is." },
    ],
  },

  "wellness-clinics": {
    slug: "wellness-clinics",
    noun: "wellness clinic",
    nounPlural: "wellness clinics",
    short: "Wellness",
    answer:
      "To choose a wellness clinic in {city}, look for a doctor-led medical practice — not a spa — offering evidence-based services like IV therapy, health screening, hormone optimisation or functional medicine. Prioritise licensed medical staff, real diagnostic and lab capability, transparent claims, and strong recent reviews. Be wary of clinics that over-promise or push supplements over genuine care.",
    whyCity:
      "{city} has become a hub for medical wellness — preventive health screening, IV and vitamin therapy, hormone and longevity medicine — aimed at expats and health-conscious travellers. The best clinics are doctor-led and evidence-based, offering executive check-ups and personalised programmes at prices far below the West. The key is telling genuine medical wellness apart from spas trading on the 'wellness' label.",
    criteria: [
      { title: "Doctor-led & medically licensed", body: "Genuine wellness medicine is delivered by licensed doctors, not just therapists. Confirm a medical doctor oversees your assessment, IV protocol or hormone programme." },
      { title: "Evidence-based, honest claims", body: "Good clinics are clear about what's proven and what's supportive. Be cautious of miracle cures, aggressive anti-ageing promises or one-size-fits-all 'detox' packages." },
      { title: "Diagnostics & lab capability", body: "Real preventive medicine starts with data — blood panels, screening, sometimes imaging. A clinic that tests before it treats is a good sign." },
      { title: "Review volume & recency", body: "Strong, recent review volume signals a clinic patients trust and return to — the factor we weight most in our rankings." },
      { title: "Personalised, not packaged", body: "The best programmes are tailored to your results and goals, not sold as a fixed package to everyone who walks in." },
      { title: "Transparent pricing", body: "Get itemised pricing for consultations, tests and treatments. Wellness is where vague 'programme' pricing can hide a lot." },
      { title: "Location & access", body: "For ongoing programmes (IV courses, hormone follow-ups), a clinic near {transit} makes the schedule realistic." },
      { title: "Follow-up & ongoing care", body: "Preventive and hormone medicine works over time. Look for clinics that review your results and adjust, not one-off drips." },
    ],
    treatments: [
      { name: "IV therapy & vitamin drips", body: "Intravenous vitamins, minerals and antioxidants for hydration, recovery, immunity or energy. Best delivered under medical supervision, with the mix matched to your needs rather than a generic drip." },
      { name: "Health screening & executive check-ups", body: "Comprehensive preventive panels — bloods, cardiovascular, cancer markers, sometimes imaging — to catch issues early. {city} is popular for affordable, thorough executive check-ups." },
      { name: "Hormone optimisation", body: "Testing and, where appropriate, medically supervised hormone therapy for fatigue, menopause/andropause and related concerns. This needs proper diagnostics and ongoing monitoring." },
      { name: "Functional & regenerative medicine", body: "A root-cause approach to fatigue, gut health and chronic symptoms, sometimes including regenerative therapies. Quality varies widely — a doctor-led, evidence-based clinic matters most here." },
      { name: "Medical weight management", body: "Doctor-supervised weight programmes combining assessment, nutrition and, where appropriate, medication — distinct from cosmetic 'slimming' offers." },
    ],
    costs: [
      { label: "IV vitamin drip", th: "$50–150", west: "$150–400" },
      { label: "Executive health screening", th: "$200–600", west: "$800–2,500" },
      { label: "Hormone blood panel", th: "$100–300", west: "$300–800" },
      { label: "Doctor consultation", th: "$30–80", west: "$150–350" },
      { label: "Functional-medicine programme", th: "from $300", west: "from $1,000" },
    ],
    costsNote:
      "Medical wellness in {city} — especially health screening — often costs a fraction of the equivalent in the West, which is why executive check-ups are a popular reason to visit. Ask for itemised pricing so you can see exactly what a 'programme' includes.",
    audiences: [
      { who: "Expats living in Thailand", body: "Wellness clinics are ideal for preventive health you'd otherwise put off — an annual screen, sorting out fatigue, or a hormone review. Choose a doctor-led clinic you can build an ongoing relationship with." },
      { who: "Health & medical tourists", body: "A comprehensive health screening pairs well with a trip and costs far less than at home. Book the panel in advance and allow time for results and a doctor consultation." },
      { who: "Longevity & optimisation seekers", body: "If you're after hormone optimisation or functional medicine, prioritise clinics that test thoroughly, explain the evidence, and monitor over time rather than selling one-off treatments." },
    ],
    process: [
      { step: "Shortlist & compare", body: "Compare verified clinics by rating, review volume, medical credentials and services. Our {city} wellness directory ranks clinics by a review-weighted score." },
      { step: "Book an assessment", body: "Genuine wellness care starts with a consultation and, usually, tests. Be wary of any clinic that recommends a big programme before assessing you." },
      { step: "Review your results", body: "A doctor should walk you through your data and explain what's recommended and why — with clear, itemised pricing." },
      { step: "Programme & follow-up", body: "For hormones, IV courses or functional programmes, expect monitoring and adjustment over time, not a single visit." },
    ],
    questions: [
      "Is this clinic doctor-led, and will a licensed doctor oversee my care?",
      "What testing do you do before recommending treatment?",
      "What's the evidence behind this treatment, and what results are realistic?",
      "Can I get itemised pricing for the consultation, tests and treatments?",
      "How will you monitor and follow up over time?",
      "Is this genuinely medical, or is it a spa service?",
    ],
    redFlags: [
      "Non-medical staff delivering what should be medical treatment.",
      "Big 'wellness packages' recommended before any assessment or testing.",
      "Miracle or anti-ageing claims that sound too good to be true.",
      "Heavy pressure to buy supplements or long programmes upfront.",
      "A spa presenting itself as a medical wellness clinic.",
      "Vague, bundled pricing with no itemised breakdown.",
    ],
    faq: [
      { q: "What is a medical wellness clinic?", a: "A doctor-led clinic offering preventive and optimisation medicine — health screening, IV and vitamin therapy, hormone optimisation, functional medicine and medical weight management. It's distinct from a spa, which offers non-medical relaxation and beauty treatments." },
      { q: "How much does a health screening cost in {city}?", a: "A comprehensive executive check-up typically runs $200–600, versus $800–2,500 in the West — one of the main reasons health tourists come to {city}. Packages vary, so ask exactly what's included." },
      { q: "Is IV therapy safe?", a: "Under medical supervision at a licensed clinic, IV therapy is generally safe. It should be prescribed to your needs by a doctor, not offered as a generic drip to everyone — check who oversees it." },
      { q: "Are these clinics run by real doctors?", a: "The genuine ones are. Because 'wellness' is an unregulated word, confirm a licensed medical doctor leads the clinic and oversees treatment. Every clinic in our directory is a medical (not spa) clinic, checked against its public record." },
      { q: "Do you exclude spas from this directory?", a: "Yes. This is a healthcare directory, so we list doctor-led medical wellness clinics — IV therapy, health screening, hormone and functional medicine — and deliberately exclude day spas, massage and yoga studios." },
      { q: "Do {city} wellness clinics have English-speaking doctors?", a: "Many do, especially those serving expats and international patients. You can filter for English-speaking clinics on our directory." },
      { q: "Is hormone therapy available in {city}?", a: "Yes, at doctor-led wellness and anti-ageing clinics — but it requires proper testing and ongoing monitoring. Choose a clinic that assesses thoroughly before prescribing." },
      { q: "How do I tell a medical wellness clinic from a spa?", a: "A medical wellness clinic has licensed doctors, does diagnostics, and treats with evidence-based medicine. A spa offers relaxation and beauty services and can't legally provide medical care. When in doubt, ask who's in charge of your treatment." },
      { q: "How do I find the best wellness clinic in {city}?", a: "Compare verified, doctor-led clinics by rating, review volume, services and medical credentials. Our {city} wellness directory ranks clinics by a review-weighted score and summarises real patient feedback." },
    ],
    sources: [
      { label: "The Medical Council of Thailand", url: "https://www.tmc.or.th/", note: "The body that licenses the doctors who should lead any genuine medical wellness clinic." },
      { label: "Joint Commission International (JCI)", url: "https://www.jointcommissioninternational.org/", note: "The global accreditation standard — worth checking for hospital-affiliated wellness centres." },
      { label: "NHS: Vitamins and supplements", url: "https://www.nhs.uk/conditions/vitamins-and-minerals/", note: "Evidence-based background to weigh wellness and IV/vitamin claims against." },
    ],
  },

  "fertility-clinics": {
    slug: "fertility-clinics",
    noun: "fertility clinic",
    nounPlural: "fertility clinics",
    short: "IVF & Fertility",
    answer:
      "To choose a fertility clinic in {city}, prioritise the laboratory and embryology team, the specialist doctor (a reproductive endocrinologist), and honest, age-adjusted success rates. Confirm accreditation, transparent all-in pricing, English-speaking support and the technology on offer (ICSI, genetic screening, egg freezing). Be wary of any clinic that guarantees success — no reputable clinic can.",
    whyCity:
      "{city} is one of the world's leading destinations for IVF and fertility care. Its top clinics offer advanced techniques — ICSI, genetic screening (PGT), egg and embryo freezing — with experienced specialists and modern labs, at a fraction of Western costs. English-speaking coordinators and strong success rates draw international patients, though it's worth knowing that surrogacy and sex selection are legally restricted in Thailand.",
    criteria: [
      { title: "Laboratory & embryology quality", body: "In IVF, the lab is everything. A skilled embryology team and a modern lab (air quality, time-lapse incubators) drive success far more than a fancy waiting room. Ask about the lab and the embryologists." },
      { title: "Specialist reproductive doctor", body: "Look for a reproductive endocrinologist or fertility specialist — not a general OB-GYN — leading your care, with real experience in cases like yours." },
      { title: "Honest, age-adjusted success rates", body: "Success rates mean nothing without context. Ask for live-birth rates per cycle, for your age group. Beware of headline rates with no age or per-cycle breakdown." },
      { title: "Accreditation & standards", body: "Look for recognised accreditation and adherence to international standards. Hospital-affiliated or JCI-accredited settings add assurance for complex care." },
      { title: "Transparent all-in pricing", body: "IVF has many add-ons (ICSI, freezing, PGT, medication). Get a written, all-in estimate so you can compare clinics honestly — the headline cycle price is rarely the total." },
      { title: "English-speaking & emotional support", body: "Fertility treatment is demanding. Fluent English-speaking coordinators and genuine emotional support make a real difference through a stressful process." },
      { title: "Technology on offer", body: "ICSI, PGT genetic screening, time-lapse embryo monitoring and egg/embryo freezing expand your options. Confirm the clinic offers what your case needs." },
      { title: "Personalised protocol", body: "Good clinics tailor the stimulation protocol to your body and history rather than running everyone through the same programme." },
    ],
    treatments: [
      { name: "IVF (in-vitro fertilisation)", body: "Eggs are retrieved, fertilised in the lab and an embryo is transferred to the uterus. The core fertility treatment, and where lab quality matters most. Typically one cycle over a few weeks, sometimes repeated." },
      { name: "ICSI", body: "A single sperm is injected directly into an egg — used for male-factor infertility or previous fertilisation failure. Most {city} clinics offer it; it's usually an add-on to IVF." },
      { name: "IUI (intrauterine insemination)", body: "A simpler, lower-cost treatment placing prepared sperm directly into the uterus. Suited to milder cases, and often tried before IVF." },
      { name: "Egg & embryo freezing", body: "Freezing eggs or embryos to preserve fertility — for medical reasons or to delay parenthood. {city} is a popular, affordable destination for elective egg freezing." },
      { name: "Genetic screening (PGT)", body: "Testing embryos for chromosomal or genetic conditions before transfer, to improve success rates and reduce miscarriage risk — particularly relevant with older eggs or known genetic conditions." },
    ],
    costs: [
      { label: "IVF cycle (base)", th: "$4,000–6,500", west: "$12,000–20,000" },
      { label: "ICSI (add-on)", th: "$700–1,500", west: "$1,500–3,000" },
      { label: "Egg freezing (cycle)", th: "$3,000–5,000", west: "$8,000–15,000" },
      { label: "IUI", th: "$500–1,200", west: "$1,000–3,000" },
      { label: "Genetic screening (PGT, per cycle)", th: "$2,000–4,000", west: "$4,000–8,000" },
    ],
    costsNote:
      "IVF in {city} typically costs 50–70% less than in the US or UK, even before you factor in that many cycles need add-ons. Always ask for an all-in written estimate including medication, ICSI, freezing and PGT — the base cycle price is rarely the final figure.",
    audiences: [
      { who: "International fertility patients", body: "Most travel for the combination of cost, technology and success rates. Start with a remote consultation, get an all-in quote, and plan for a stay of two to three weeks around egg retrieval and transfer — or split treatment across trips." },
      { who: "Expats living in Thailand", body: "You can build a full relationship with one clinic and specialist through what is often a multi-cycle journey. Prioritise the lab, the doctor and the support you'll lean on." },
      { who: "Fertility preservation (egg freezing)", body: "If you're freezing eggs electively, focus on lab quality and freezing/thaw success rates, and ask about long-term storage costs and options." },
    ],
    process: [
      { step: "Consult & test", body: "An initial consultation and fertility testing (hormones, ultrasound, semen analysis) establish the picture and the right approach. This can often start remotely." },
      { step: "Agree a protocol & quote", body: "The specialist designs a stimulation protocol for your case, and you get an all-in written estimate covering medication and any add-ons." },
      { step: "Stimulation & retrieval", body: "Around 10–14 days of monitored ovarian stimulation, then egg retrieval — the part that usually requires you to be in {city}." },
      { step: "Fertilisation, transfer & follow-up", body: "Eggs are fertilised in the lab; an embryo is transferred (fresh or frozen) and you follow up on the outcome. Frozen transfers can be timed to a later trip." },
    ],
    questions: [
      "What are your live-birth success rates per cycle for my age group?",
      "Who leads the lab, and what embryo technology do you use?",
      "Is my care led by a reproductive endocrinologist?",
      "Can I get an all-in written quote including medication, ICSI, freezing and PGT?",
      "How long will I need to be in {city}, and can treatment be split across trips?",
      "What emotional and English-language support do you provide?",
    ],
    redFlags: [
      "Any guarantee of success — no reputable fertility clinic can promise a baby.",
      "Headline success rates with no age breakdown or per-cycle basis.",
      "Reluctance to give an all-in written estimate.",
      "Vague answers about the lab, embryologists or the doctor's specialism.",
      "Pressure to start an expensive cycle before proper testing.",
      "Offers of legally restricted services (commercial surrogacy, sex selection) in Thailand.",
    ],
    faq: [
      { q: "How much does IVF cost in {city}?", a: "A base IVF cycle typically runs $4,000–6,500, versus $12,000–20,000 in the US — but add-ons like ICSI, medication, freezing and genetic screening raise the total, so always get an all-in written estimate." },
      { q: "What are IVF success rates in {city}?", a: "Leading clinics report strong success rates, but they're highly age-dependent. Ask each clinic for its live-birth rate per cycle for your specific age group — a single headline number without context isn't meaningful." },
      { q: "How long do I need to stay for IVF?", a: "Plan for roughly two to three weeks around stimulation, egg retrieval and transfer. Many clinics can split treatment across trips — for example, retrieval on one visit and a frozen-embryo transfer on another." },
      { q: "Is IVF in Thailand safe and well-regulated?", a: "Thailand has an established, regulated ART sector and leading clinics use international-standard labs and techniques. As always, quality varies by clinic — the lab, the specialist and verified outcomes are what matter." },
      { q: "Is surrogacy available in {city}?", a: "Commercial surrogacy and sex selection are legally restricted in Thailand and not available to most international patients. If a clinic offers them, treat it as a serious red flag. IVF, ICSI, egg freezing and genetic screening are widely and legally available." },
      { q: "Can I freeze my eggs in {city}?", a: "Yes — elective egg freezing is widely available and far more affordable than in the West. Focus on the clinic's lab and freeze/thaw success rates, and ask about long-term storage costs." },
      { q: "Do {city} fertility clinics have English-speaking staff?", a: "Many do, with dedicated English-speaking coordinators for international patients. You can filter for English-speaking clinics on our directory." },
      { q: "What's the difference between IVF and ICSI?", a: "In standard IVF, sperm and eggs are combined in a dish to fertilise. In ICSI, a single sperm is injected directly into each egg — used mainly for male-factor infertility. ICSI is usually an add-on to an IVF cycle." },
      { q: "How do I find the best fertility clinic in {city}?", a: "Compare verified clinics by rating, review volume, lab quality, specialist experience and honest success data. Our {city} IVF & fertility directory ranks clinics by a review-weighted score and summarises real patient feedback." },
    ],
    sources: [
      { label: "The Medical Council of Thailand", url: "https://www.tmc.or.th/", note: "Licenses the fertility specialists who should lead your care." },
      { label: "ESHRE (European Society of Human Reproduction)", url: "https://www.eshre.eu/", note: "A leading authority on ART standards and patient information." },
      { label: "ASRM: Patient resources", url: "https://www.reproductivefacts.org/", note: "Plain-English, evidence-based patient guidance on IVF and fertility from the American Society for Reproductive Medicine." },
    ],
  },
};

/* ─── Editorial shortlist curation ───────────────────────────────────
   Pin specific clinics at the top of a city+category guide's "Verified
   top clinics" list, in this exact order, overriding the default
   review-weighted ranking for that combo only. Values match the guide
   href identifier — a brand slug for brand hubs, otherwise the clinic
   slug. Keep in sync with the matching blog pillar's "5 Best" section. */
export const GUIDE_CURATED_SHORTLIST: Record<string, string[]> = {
  "bangkok:fertility-clinics": [
    "genesis-fertility-center",   // brand hub — GFC (editorial #1)
    "vfc-v-fertility-center",
    "prime-fertility-center",
    "smile-ivf-clinic",
    "bangkok-central-clinic-ivf",
  ],
  "bangkok:cosmetic-clinics": [
    "cosmo-clinic",               // brand hub — The Cosmo Clinic (editorial #1)
    "aura-bangkok-clinic",        // brand hub
    "the-line-k",
    "banobagi-clinic-thailand",
    "v-square-clinic",            // brand hub
  ],
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
