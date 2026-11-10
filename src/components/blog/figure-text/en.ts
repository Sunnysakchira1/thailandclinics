import { INLINE_PRICES as P, type FigureDict, type Fmt } from "./types";

const en = (f: Fmt): FigureDict => ({
  inShort: "In short",
  figures: {
    "ivf-prices": {
      title: "Published IVF/ICSI package prices in Bangkok, October 2026",
      caption: "Source: each provider's own published price, checked 14 October 2026. Jetanin and Bumrungrad publish no package price. Packages include different things, so compare itemised quotes, not headline prices.",
      notes: [
        "4 ICSI packages",
        "IVF/ICSI, residents only",
        "ICSI package",
        "Fly-in package A",
        "Package B, with PGT-A + freezing",
      ],
    },
    "surgery-prices": {
      title: "Published cosmetic surgery prices in Bangkok, October 2026",
      caption: "Source: Bangkok Hospital and Yanhee published prices, checked 14 October 2026. Bangkok Hospital's breast augmentation price excludes implants; Yanhee's includes the named implant. Bumrungrad and Kamol publish no prices.",
      notes: [
        "Rhinoplasty, implant to rib graft",
        "Rhinoplasty, local to septum",
        "Breast augmentation, incl. implant",
        "Breast augmentation, excl. implant",
        "Eyelid surgery, upper or lower",
        "Eyelid surgery, upper or lower",
      ],
    },
    "physio-prices": {
      title: "Published physiotherapy session prices in Bangkok, October 2026",
      caption: "Source: each clinic's own price list, checked 14 October 2026. Hospitals (Vejthani, Bumrungrad, MedPark, Samitivej, BNH, Bangkok Hospital) publish no per-session price.",
      notes: ["per session", "60 to 120 min", "60 to 120 min"],
    },
    "hospital-vs-centre": {
      title: "Dedicated fertility centre or hospital-based centre?",
      caption: "ThailandClinics editorial summary, October 2026. Ask your own doctor whether your medical history calls for hospital backup.",
      cols: [
        { tag: "Dedicated centre", points: [
          "Does reproductive medicine only",
          "Lab volume concentrated on IVF",
          "Usually the lower package price",
          "A smaller team that knows your case",
        ], foot: "Suits most healthy patients" },
        { tag: "Hospital-based centre", points: [
          "Every other specialty in the same building",
          "Intensive care on site",
          "Hospital pricing",
          "Fits complex medical histories",
        ], foot: "Suits patients with other conditions or higher OHSS risk" },
      ],
    },
    "like-for-like-quote": {
      title: "Ask every provider to quote the same cycle",
      caption: "One identical request makes headline prices comparable. Send it to every provider on your shortlist.",
      steps: [
        { title: "Stimulation", body: "Including medication, with the dose cap stated" },
        { title: "Egg retrieval + ICSI", body: "Anaesthesia and embryo culture to day 5" },
        { title: "PGT-A", body: "Price for up to 4 embryos, biopsy included" },
        { title: "Freezing + storage", body: "All embryos, first year of storage" },
        { title: "Frozen transfer", body: "Lining preparation and one transfer" },
        { title: "Exclusions", body: "Everything not covered, in writing" },
      ],
    },
    "pgt-types": {
      title: "The three types of PGT",
      caption: "PGT means preimplantation genetic testing: a lab test on IVF embryos before transfer. Whether you need it is a decision for you and your fertility doctor.",
      cols: [
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
      ],
    },
    "pgt-timeline": {
      title: "How a PGT cycle runs",
      caption: "Typical sequence. Timings vary by clinic and by test: PGT-M can take longer.",
      steps: [
        { title: "IVF + egg retrieval", body: "Stimulation, then eggs collected and fertilised" },
        { title: "Culture to day 5–6", body: "Embryos grow to the blastocyst stage" },
        { title: "Biopsy", body: "A few outer cells are removed from each embryo" },
        { title: "Freeze", body: "Every biopsied embryo is frozen" },
        { title: "Test results", body: "Usually 1–3 weeks" },
        { title: "Frozen transfer", body: "In a later cycle, using a tested embryo" },
      ],
    },
    "pgt-checklist": {
      title: "The ThailandClinics 7-point PGT checklist",
      caption: "Use the same seven checks for every clinic, and ask for the answers in writing.",
      steps: [
        { title: "PGT types", body: "Does it offer the test you need?" },
        { title: "Where it's tested", body: "In-house lab or sent out?" },
        { title: "The lab", body: "Time-lapse, witnessing, ISO 15189, ESHRE" },
        { title: "The biopsy", body: "Who does it, and how often?" },
        { title: "Price per embryo", body: "Biopsy, test, freezing, storage" },
        { title: "Success data", body: "Live births per PGT-tested transfer, by age" },
        { title: "Thai law", body: "No sex selection; medical use only" },
      ],
    },
    "surgery-hospital-vs-clinic": {
      title: "Cosmetic surgery hospital or general hospital?",
      caption: "ThailandClinics editorial summary, October 2026. For any operation under general anaesthesia, check the facility is licensed for surgery.",
      cols: [
        { tag: "Cosmetic surgery hospital", points: [
          "Cosmetic operations every day", "Usually lower prices", "Named surgeons to choose from", "Fewer other specialties on site",
        ], foot: "Suits healthy patients choosing on price or surgeon" },
        { tag: "General private hospital", points: [
          "Every specialty and intensive care on site", "Published packages (Bangkok Hospital)", "Higher prices", "Fits complex medical histories",
        ], foot: "Suits patients with other medical conditions" },
      ],
    },
    "surgery-quote": {
      title: "Ask every hospital to quote the same operation",
      caption: "One identical request makes cosmetic surgery quotes comparable.",
      steps: [
        { title: "Surgeon", body: "Full name and Medical Council licence number" },
        { title: "Technique", body: "Exactly which procedure, open or closed" },
        { title: "Implant", body: "Brand, size and type, priced in" },
        { title: "Hospital stay", body: "Nights included, and the room type" },
        { title: "Follow-up", body: "Check-ups, stitch removal, garments" },
        { title: "Complications", body: "Who pays for a revision or readmission" },
      ],
    },
    "aesthetic-safety-checklist": {
      title: "The ThailandClinics 6-point aesthetic safety check",
      caption: "Run all six before any Botox or filler appointment in Bangkok.",
      steps: [
        { title: "Clinic licence", body: "11-digit number on the sign, certificate inside" },
        { title: "Doctor's licence", body: "Full name, checked with the Medical Council" },
        { title: "Thai FDA registration", body: "Toxin numbers start \"1C\"" },
        { title: "Sealed vial", body: "Opened in front of you; photograph the label" },
        { title: "Realistic price", body: "Not far below every licensed clinic" },
        { title: "Aftercare plan", body: "Who you call if something goes wrong" },
      ],
    },
    "vial-check": {
      title: "What to check on the box and vial",
      caption: "Ask to see the product before treatment starts. A licensed clinic won't mind.",
      steps: [
        { title: "Sealed", body: "Unopened box and vial, opened in front of you" },
        { title: "Brand", body: "Matches the brand you were quoted" },
        { title: "Thai registration", body: "Registration number on the box, e.g. 1C …" },
        { title: "Lot + expiry", body: "Lot number and an expiry date in the future" },
        { title: "Look it up", body: "Search the brand on the Thai FDA product search" },
      ],
    },
    "aesthetic-red-flags": {
      title: "Red flags at an aesthetic clinic",
      caption: "Each of these has come up in Thai enforcement cases. One is enough to walk away.",
      cols: [
        { tag: "The place", title: "Wrong setting", points: [
          "Treatment in a condo, home, hotel room or salon", "No licence number on the sign", "Booking only through social-media messages",
        ] },
        { tag: "The person", title: "Wrong injector", points: [
          "Won't give a full name or licence number", "Nickname only in adverts", "A beautician or nurse injecting alone",
        ] },
        { tag: "The product", title: "Wrong product", points: [
          "Won't show you the sealed vial", "Brand not on the Thai FDA database", "A price far below every licensed clinic",
        ] },
      ],
    },
    "physio-hospital-vs-clinic": {
      title: "Physio clinic or hospital rehabilitation centre?",
      caption: "ThailandClinics editorial summary, October 2026. After surgery, follow your surgeon's advice on where to do your rehab.",
      cols: [
        { tag: "Dedicated physio clinic", points: [
          "Published session prices", "60-minute-plus sessions", "Usually the same physiotherapist each visit", "No referral needed",
        ], foot: "Suits back, neck, sports injuries and most post-op rehab" },
        { tag: "Hospital rehab centre", points: [
          "Rehabilitation doctors on site", "Robotic gait training, hydrotherapy", "Hospital prices, often plus a doctor's fee", "May need a doctor's visit first",
        ], foot: "Suits stroke, spinal injury and complex surgery" },
      ],
    },
    "physio-first-visit": {
      title: "What to bring to your first physio session",
      caption: "Bringing these saves a session and helps your physiotherapist plan.",
      steps: [
        { title: "Your story", body: "When it started, what makes it better or worse" },
        { title: "Scans + reports", body: "MRI, X-ray or ultrasound reports, if you have them" },
        { title: "Surgery notes", body: "Operation notes and your surgeon's protocol" },
        { title: "Your goal", body: "Back to running, sleeping, lifting your child" },
        { title: "Clothes", body: "Shorts or loose clothing you can move in" },
      ],
    },
    "postop-checklist": {
      title: "The ThailandClinics 6-point post-surgery rehab check",
      caption: "Ask every rehab provider the same six questions before your first session.",
      steps: [
        { title: "Licensed physio", body: "Physical Therapy Council licence" },
        { title: "Surgeon's protocol", body: "Followed, with contact if needed" },
        { title: "Phased plan", body: "Milestones to move to each phase" },
        { title: "Equipment", body: "Gym, pool or strength testing as needed" },
        { title: "Schedule", body: "Visits per phase, plus home exercises" },
        { title: "Clear price", body: "Per session, packages, refunds" },
      ],
    },
    "surgeon-handover": {
      title: "What your rehab clinic needs from your surgeon",
      caption: "Ask your surgeon's team for these before you leave hospital.",
      steps: [
        { title: "Operation notes", body: "What was done, and the graft or implant used" },
        { title: "Weight-bearing", body: "How much weight the leg can take, and when" },
        { title: "Movement limits", body: "Range-of-motion limits and precautions" },
        { title: "Brace or aids", body: "Brace settings, crutches, how long" },
        { title: "Review dates", body: "When you see the surgeon again" },
      ],
    },
    "rehab-milestones": {
      title: "Typical recovery milestones after surgery",
      caption: "Sources: AAOS OrthoInfo and NHS patient guidance. Typical ranges only; your surgeon and physiotherapist set your own timeline.",
      cols: [
        { tag: "ACL reconstruction", title: "6–12 months to sport", points: [
          "Physio starts straight after surgery", "Return to sport depends on passing strength and function tests", "Not on time alone",
        ] },
        { tag: "Knee replacement", title: "Several months", points: [
          "Daily activities in about 3–6 weeks (AAOS)", "Walking without aids after about 6 weeks (NHS)", "Full recovery can take several months or longer",
        ] },
        { tag: "Hip replacement", title: "Several months", points: [
          "Light activities in about 3–6 weeks (AAOS)", "Movement precautions for about the first 6 weeks", "Full recovery takes several months (NHS)",
        ] },
      ],
    },
    "meditation-costs": {
      title: "Published meditation and healing course costs in Bangkok, October 2026",
      caption: "Source: each centre's own published price, checked 20 October 2026. Wat Mahathat Section 5 runs on donations; the Buddhadasa Indapanno Archives publish no cost. Saksit's fee includes the book, certificate and lunch.",
      notes: [
        "drop-in, suggested donation",
        "1-day vipassana taster",
        "2-day introductory course",
        "2-day Pranic Healing Level 1, all-in",
      ],
    },
    "meditation-vs-healing": {
      title: "Temple meditation, drop-in group or healing course?",
      caption: "ThailandClinics editorial summary, October 2026. All three are complementary practices, not medical treatment.",
      cols: [
        { tag: "Temple meditation", points: [
          "Vipassana and mindfulness", "Donation-based", "Dress code applies", "English on set days only",
        ], foot: "Suits first-timers and travellers" },
        { tag: "Drop-in group", points: [
          "Weekly sessions or private teaching", "Taught in English", `Donation to ${f.baht(P.houseOfDhammaTwoDayTo)}`, "Book ahead at House of Dhamma",
        ], foot: "Suits expats building a habit" },
        { tag: "Healing course", points: [
          "Pranic Healing in levels", "Certificate for each course", `Published ${f.num(P.saksitLevel1)} Baht entry fee`, "Prerequisites for later levels",
        ], foot: "Suits people who want to learn a practice" },
      ],
    },
    "meditation-before-you-go": {
      title: "Check these five things before you go",
      caption: "Temple schedules change around Buddhist holidays. Confirm by phone or email before you travel.",
      steps: [
        { title: "Language", body: "Is this session taught in English?" },
        { title: "Schedule", body: "Today's times, not last year's" },
        { title: "Booking", body: "Walk in, register, or pay a deposit" },
        { title: "Cost", body: "Donation, fee, and what it covers" },
        { title: "Dress code", body: "Shoulders and knees covered" },
      ],
    },
  },
});

export default en;
