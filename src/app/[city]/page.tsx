import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isListingIndexable, NOINDEX_FOLLOW } from "@/lib/indexation";
import Nav from "@/components/layout/Nav";
import ClinicPhoto from "@/components/clinic/ClinicPhoto";
import PlanBadges from "@/components/ui/PlanBadges";
import StructuredData from "@/components/seo/StructuredData";
import { CITY_PHOTOS } from "@/lib/cityPhotos";
import { getBlogPosts } from "@/lib/blog";
import { GUIDE_CATEGORIES, GUIDE_CITIES, guideSlug } from "@/lib/guides";
import { sortCityEntries, topDistricts, normaliseDistrict, bahtRange, baht } from "@/lib/cityPage";
import {
  getCategoryCountsForCity,
  getCityEntries,
  getCityDistrictCounts,
  getCityPriceRanges,
  type CityEntry,
  type PriceRange,
} from "@/lib/db/queries";

/* ─── Config ─────────────────────────────────────────────────────── */
const CITIES = ["bangkok", "phuket", "chiang-mai", "pattaya"];

export const dynamicParams = false;
export function generateStaticParams() {
  return CITIES.map(city => ({ city }));
}

const CITY_LABELS: Record<string, string> = {
  "bangkok":    "Bangkok",
  "phuket":     "Phuket",
  "chiang-mai": "Chiang Mai",
  "pattaya":    "Pattaya",
};

const CITY_GRADIENTS: Record<string, string> = {
  "bangkok":    "linear-gradient(160deg, #2a5c40 0%, #1a3d2b 100%)",
  "chiang-mai": "linear-gradient(160deg, #5c432a 0%, #3d2d1a 100%)",
  "phuket":     "linear-gradient(160deg, #2a4a5c 0%, #1a3040 100%)",
  "pattaya":    "linear-gradient(160deg, #5c2a3e 0%, #3d1a28 100%)",
};

/** Specialties in display order. `lower` is the label used mid-sentence. */
const SPECIALTIES = [
  { slug: "physiotherapy-clinics", label: "Physiotherapy",   lower: "physiotherapy",   short: "physiotherapy" },
  { slug: "dental-clinics",        label: "Dental",          lower: "dental",          short: "dental" },
  { slug: "cosmetic-clinics",      label: "Cosmetic",        lower: "cosmetic",        short: "cosmetic" },
  { slug: "wellness-clinics",      label: "Wellness",        lower: "wellness",        short: "wellness" },
  { slug: "fertility-clinics",     label: "IVF & fertility", lower: "IVF & fertility", short: "fertility" },
];
const SPECIALTY_BY_SHORT = Object.fromEntries(SPECIALTIES.map((s) => [s.short, s]));

/** Specialty blurbs: city-specific where we have them, generic otherwise. */
const BLURBS: Record<string, Record<string, string>> = {
  bangkok: {
    "physiotherapy-clinics": "Back pain, sports injuries, office syndrome and post-surgery rehab. Independent clinics around Asok and Thonglor are often better value than hospital rehab.",
    "dental-clinics":        "From check-ups to implants and Invisalign. Bangkok dental prices are typically a third of UK or Australian rates.",
    "cosmetic-clinics":      "Botox, fillers, Ulthera and laser. Check the clinic is licensed and the product is genuine before you book.",
    "wellness-clinics":      "Health check-ups, IV therapy and longevity clinics.",
    "fertility-clinics":     "IVF, ICSI, egg freezing and PGT, at some of Asia's busiest fertility centres.",
  },
  phuket: {
    "physiotherapy-clinics": "Sports injuries, back pain and rehab after a scooter fall or surgery. Most clinics sit around Phuket Town, Chalong and the west-coast beaches.",
    "wellness-clinics":      "Health check-ups, IV drips and longevity programmes. A spa is not a wellness clinic, so look for a doctor on site.",
  },
};
const GENERIC_BLURBS: Record<string, string> = {
  "physiotherapy-clinics": "Back pain, sports injuries and rehab after surgery, at clinics we've checked for English-speaking staff and review volume.",
  "dental-clinics":        "Check-ups, implants, veneers and orthodontics. Ask for a written, itemised quote before treatment starts.",
  "cosmetic-clinics":      "Botox, fillers and laser. Check the clinic is licensed and the product is genuine before you book.",
  "wellness-clinics":      "Health check-ups, IV therapy and longevity clinics. A spa is not a wellness clinic, so look for a doctor on site.",
  "fertility-clinics":     "IVF, ICSI, egg freezing and PGT. Compare success rates by age group, not headline numbers.",
};

/** Answer-first hero intro. `{n}` = clinic count, `{specs}` = specialties with clinics. */
const INTROS: Record<string, string> = {
  bangkok: "Bangkok has more English-speaking private clinics than anywhere else in Thailand. We've checked {n} of them across {specs} — here are the ones worth your time, by specialty.",
  phuket:  "Phuket's private clinics cluster around Phuket Town, Chalong and the west-coast beaches, and most of the ones we list have English-speaking staff. We've checked {n} across {specs} — here are the ones worth your time, by specialty.",
};
const GENERIC_INTRO = "We've checked {n} clinics in {city} across {specs} — here are the ones worth your time, by specialty.";

/** BTS / area sub-labels for the hotspot bars. */
const AREAS: Record<string, Record<string, string>> = {
  bangkok: {
    "Pathum Wan":   "Siam, Chit Lom, Ploenchit",
    "Watthana":     "Phrom Phong, Thonglor, Ekkamai",
    "Bang Rak":     "Silom, Sala Daeng",
    "Khlong Toei":  "Asok, Nana, Queen Sirikit",
    "Huai Khwang":  "Ratchada, Rama 9",
    "Phaya Thai":   "Ari, Victory Monument",
    "Ratchathewi":  "Ratchathewi, Pratunam",
    "Sathon":       "Sathorn, Chong Nonsi",
    "Bangkok Noi":  "Siriraj, Thonburi side",
    "Bang Kapi":    "Ramkhamhaeng, The Mall Bangkapi",
    "Chatuchak":    "Mo Chit, Chatuchak Park",
    "Bang Na":      "Bang Na, Udom Suk",
    "Phra Khanong": "On Nut, Phra Khanong",
  },
  phuket: {
    "Mueang Phuket": "Phuket Town, Chalong, Rawai, Kata",
    "Thalang":       "Airport, Bang Tao, Laguna",
    "Kathu":         "Patong, Kamala, Kathu",
  },
};

const HOTSPOT_COPY: Record<string, string> = {
  bangkok: "Most English-speaking clinics cluster along the BTS Sukhumvit and Silom lines. Pathum Wan (Siam, Chit Lom, Ploenchit) has the big mall clinics and the hospital outpatient centres; Watthana and Khlong Toei (Asok to Ekkamai) are where most expats live and where you'll find the independent physio and dental clinics. If you're staying near a BTS station, filter for “Near BTS” on any specialty page.",
};

/* ─── FAQ ────────────────────────────────────────────────────────── */
type Qa = { q: string; a: string };

function pick(ranges: PriceRange[], treatment: string, unit: string, quantity: number): PriceRange | undefined {
  return ranges.find((r) => r.treatment === treatment && r.unit === unit && r.quantity === quantity);
}

/** Cost answer built only from published prices in treatment_prices. Never invents numbers. */
function costAnswer(ranges: PriceRange[], cityName: string): string {
  const parts: string[] = [];
  const botox = pick(ranges, "botox", "unit", 1);
  if (botox) parts.push(`Botox ${bahtRange(botox.min, botox.max)} a unit (${botox.clinics} ${botox.clinics === 1 ? "clinic" : "clinics"})`);
  const filler = pick(ranges, "dermal-filler", "cc", 1);
  if (filler) parts.push(`dermal filler ${bahtRange(filler.min, filler.max)} per 1cc (${filler.clinics} ${filler.clinics === 1 ? "clinic" : "clinics"})`);
  const ulthera = pick(ranges, "ulthera", "lines", 300);
  if (ulthera) parts.push(`Ulthera from ${baht(ulthera.min)} for 300 lines`);
  if (parts.length === 0) {
    return `We only quote prices clinics publish, and we don't hold any for ${cityName} yet. Ask the clinic for a written, itemised quote before treatment starts, and check whether the consultation is included.`;
  }
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  return `We only quote prices clinics publish themselves. So far that covers cosmetic treatments: ${list}. For physio, dental and other care, ask for a written, itemised quote before you book. Specialty pages show published prices where clinics share them.`;
}

function faqFor(city: string, cityName: string, ranges: PriceRange[]): Qa[] {
  const cost: Qa = { q: "How much does a visit cost?", a: costAnswer(ranges, cityName) };
  if (city === "bangkok") {
    return [
      { q: "Clinic or hospital — which should I use?", a: "For routine care (a dental check-up, physio for back pain, Botox) a specialist clinic is usually quicker and cheaper. For anything needing surgery, imaging or overnight care, go to a hospital — Bumrungrad, Samitivej and Bangkok Hospital all have international desks." },
      { q: "Will the staff speak English?", a: "At most clinics in central Bangkok, yes — we flag English-speaking clinics on every listing so you don't have to guess." },
      { q: "Does my insurance cover clinic visits?", a: "Many international policies cover outpatient care at private clinics, but direct billing is rarer than at hospitals. Ask the clinic for an itemised receipt and claim it back." },
      cost,
    ];
  }
  if (city === "phuket") {
    return [
      { q: "Clinic or hospital — which should I use?", a: "For routine care (physio for a sports injury, a health check-up, an IV drip) a specialist clinic is usually quicker and cheaper. For anything needing surgery, imaging or overnight care, go to a hospital — Bangkok Hospital Phuket and Bangkok Hospital Siriroj in Phuket Town both have international departments." },
      { q: "Will the staff speak English?", a: "At most of the clinics we list in Phuket, yes — especially around Phuket Town, Chalong and Patong, which see a lot of visitors. We flag English-speaking clinics on every listing so you don't have to guess." },
      { q: "Does my insurance cover clinic visits?", a: "Many international and travel policies cover outpatient care for an injury, but direct billing is rarer at clinics than at hospitals, and elective treatments such as IV drips are often excluded. Ask for an itemised receipt and check your policy before you book." },
      cost,
    ];
  }
  return [
    { q: "Clinic or hospital — which should I use?", a: `For routine care (a dental check-up, physio for back pain) a specialist clinic is usually quicker and cheaper. For anything needing surgery, imaging or overnight care, go to a hospital with an international department.` },
    { q: "Will the staff speak English?", a: `It varies across ${cityName}, so we flag English-speaking clinics on every listing so you don't have to guess.` },
    { q: "Does my insurance cover clinic visits?", a: "Many international policies cover outpatient care at private clinics, but direct billing is rarer than at hospitals. Ask the clinic for an itemised receipt and claim it back." },
    cost,
  ];
}

/* ─── Metadata ───────────────────────────────────────────────────── */
type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityName = CITY_LABELS[city] ?? city;
  const title       = `${cityName} Clinics — Verified Healthcare Directory | ThailandClinics`;
  const description = `Browse verified dental, physiotherapy, cosmetic and wellness clinics in ${cityName}. Trusted by expats and medical tourists. Filter by English-speaking staff.`;
  return {
    title,
    description,
    alternates: { canonical: `/${city}/` },
    openGraph:  { title, description },
    ...(!(await isListingIndexable(city)) && { robots: NOINDEX_FOLLOW }),
  };
}

/* ─── Small pieces ───────────────────────────────────────────────── */
function EntryCard({ entry }: { entry: CityEntry }) {
  const premium = entry.tier === "premium";
  const detail = entry.branchCount ? `${entry.branchCount} branches` : entry.district;
  return (
    <Link href={entry.url} className={`cp-card${premium ? " cp-card-premium" : ""}`}>
      <div className="cp-card-photo">
        <ClinicPhoto url={entry.photoUrl} name={entry.name} />
        <div className="cp-card-badges">
          <PlanBadges tier={entry.tier} topRated={entry.topRated} size="sm" />
        </div>
      </div>
      <div className="cp-card-body">
        <h4 className="cp-card-name">{entry.name}</h4>
        <p className="cp-meta">
          {entry.rating != null && (
            <>
              <span style={{ color: "var(--star)" }} aria-hidden>★</span>{" "}
              <b>{entry.rating.toFixed(1)}</b> ({(entry.reviews ?? 0).toLocaleString("en-GB")}){detail ? " · " : ""}
            </>
          )}
          {detail}
        </p>
      </div>
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="cp-eyebrow">{children}</p>;
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default async function CityPage({ params }: Props) {
  const { city } = await params;
  if (!CITIES.includes(city)) notFound();

  const cityName = CITY_LABELS[city];
  const photo = CITY_PHOTOS[city];

  const [catCounts, rawEntries, districtRows, priceRanges] = await Promise.all([
    getCategoryCountsForCity(city),
    getCityEntries(city),
    getCityDistrictCounts(city),
    getCityPriceRanges(city),
  ]);

  // Show clean district names on cards ("Thalang District" → "Thalang"); keep the raw value if it can't be placed.
  const entries = rawEntries.map((e) => ({ ...e, district: e.district ? (normaliseDistrict(e.district, city) ?? e.district) : null }));

  const countMap: Record<string, number> = {};
  for (const r of catCounts) countMap[r.categorySlug] = r.count;
  const totalClinics = Object.values(countMap).reduce((a, b) => a + b, 0);
  const specialties = SPECIALTIES.filter((s) => (countMap[s.slug] ?? 0) > 0);
  const hasClinics = totalClinics > 0;

  const posts = getBlogPosts();
  const postSlugs = new Set(posts.map((p) => p.slug));
  const cityPosts = posts.filter((p) => p.city === city).slice(0, 9);

  const blocks = specialties.map((s) => {
    const count = countMap[s.slug];
    const top = sortCityEntries(entries.filter((e) => e.categorySlug === s.slug)).slice(0, 3);
    const pillar = `${s.short}-${city}-guide`;
    let guideHref: string | null = null;
    if (postSlugs.has(pillar)) guideHref = `/blog/${pillar}/`;
    else if (GUIDE_CITIES[city] && GUIDE_CATEGORIES[s.slug] && count >= 5) guideHref = `/guides/${guideSlug(city, s.slug)}/`;
    const blurb = BLURBS[city]?.[s.slug] ?? GENERIC_BLURBS[s.slug];
    return { ...s, count, top, guideHref, blurb };
  });

  const districts = totalClinics >= 20 ? topDistricts(districtRows, city, 6) : [];
  const maxDistrict = districts[0]?.count ?? 1;

  const specList = specialties.map((s) => s.lower.replace("IVF & fertility", "IVF"));
  const specText = specList.length <= 1 ? (specList[0] ?? "") : `${specList.slice(0, -1).join(", ")} and ${specList[specList.length - 1]}`;
  const intro = hasClinics
    ? (INTROS[city] ?? GENERIC_INTRO)
        .replace("{n}", totalClinics.toLocaleString("en-GB"))
        .replace("{specs}", specText)
        .replace("{city}", cityName)
    : `We're researching ${cityName} clinics now — listings are coming soon.`;

  const faq = hasClinics ? faqFor(city, cityName, priceRanges) : [];

  /* ─── Schema ─────────────────────────────────────────────────── */
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailand-clinics.com";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home",    "item": `${siteUrl}/` },
          { "@type": "ListItem", "position": 2, "name": cityName,  "item": `${siteUrl}/${city}/` },
        ],
      },
      {
        "@type": "ItemList",
        "name": `Clinics in ${cityName}`,
        "numberOfItems": totalClinics,
        "url": `${siteUrl}/${city}/`,
      },
    ],
  };
  const faqSchema = faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  } : null;

  return (
    <>
      <StructuredData data={schema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <Nav />

      <main className="cp" style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>

        {/* ── 1. Hero ───────────────────────────────────────────── */}
        <header className="cp-hero" style={{ background: CITY_GRADIENTS[city] }}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.src} alt={photo.alt} className="cp-hero-img" fetchPriority="high" />
          )}
          <div className="cp-hero-overlay" aria-hidden />
          <div className="cp-wrap cp-hero-inner">
            <nav aria-label="Breadcrumb" className="cp-crumb">
              <Link href="/">Home</Link>
              <span aria-hidden> › </span>
              <span aria-current="page">{cityName}</span>
            </nav>
            <h1 className="cp-h1">Clinics in <em>{cityName}</em></h1>
            <p className="cp-lede">{intro}</p>
            <div className="cp-hrow">
              {hasClinics && (
                <>
                  <div className="cp-hstat"><b>{totalClinics.toLocaleString("en-GB")}</b>clinics listed</div>
                  <div className="cp-hstat"><b>{specialties.length}</b>{specialties.length === 1 ? "specialty" : "specialties"}</div>
                  <div className="cp-hstat"><b>Flagged</b>English-speaking</div>
                </>
              )}
              <Link href="/get-matched/" className="cp-btn cp-btn-light">Get a free shortlist →</Link>
            </div>
          </div>
          {photo && (
            <a href={photo.source} className="cp-credit" target="_blank" rel="noopener noreferrer">
              Photo: {photo.author}, {photo.licence}
            </a>
          )}
        </header>

        {hasClinics && (
          <>
            {/* ── 2. Sticky specialty chips ───────────────────────── */}
            <nav className="cp-jump" aria-label="Jump to specialty">
              <div className="cp-wrap cp-jump-inner">
                {blocks.map((b) => (
                  <a key={b.slug} href={`#${b.slug}`} className="cp-chip">
                    {b.label} <span>{b.count}</span>
                  </a>
                ))}
              </div>
            </nav>

            {/* ── 3. Specialty blocks ─────────────────────────────── */}
            <section className="cp-section">
              <div className="cp-wrap">
                <Eyebrow>By specialty</Eyebrow>
                <h2 className="cp-h2" style={{ margin: "10px 0 8px" }}>Start with <em>what you need</em></h2>
                {blocks.map((b) => (
                  <div key={b.slug} id={b.slug} className="cp-spec">
                    <div>
                      <Eyebrow>{b.count} {b.count === 1 ? "clinic" : "clinics"}</Eyebrow>
                      <h3 className="cp-spec-title">{b.label}</h3>
                      <p className="cp-spec-blurb">{b.blurb}</p>
                      <div className="cp-spec-links">
                        <Link href={`/${city}/${b.slug}/`}>See all {b.count} {b.lower} clinics →</Link>
                        {b.guideHref && <Link href={b.guideHref}>Read the {b.lower} guide →</Link>}
                      </div>
                    </div>
                    <div className="cp-cards">
                      {b.top.map((e) => <EntryCard key={e.key} entry={e} />)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── 4. Guides ─────────────────────────────────────────── */}
        {cityPosts.length > 0 && (
          <section className="cp-section cp-band">
            <div className="cp-wrap">
              <Eyebrow>Guides</Eyebrow>
              <h2 className="cp-h2" style={{ marginTop: "10px" }}>Before you <em>book in {cityName}</em></h2>
              <div className="cp-ggrid">
                {cityPosts.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}/`} className="cp-guide">
                    <span className="cp-eyebrow cp-eyebrow-sm">{SPECIALTY_BY_SHORT[p.category]?.label ?? p.category}</span>
                    <h4 className="cp-guide-title">{p.title}</h4>
                    <span className="cp-guide-link">Read the guide →</span>
                  </Link>
                ))}
              </div>
              <Link href={`/guides/#${city}`} className="cp-more">See all {cityName} guides →</Link>
            </div>
          </section>
        )}

        {/* ── 5. Hotspots ───────────────────────────────────────── */}
        {districts.length > 0 && (
          <section className="cp-section">
            <div className="cp-wrap cp-hs">
              <div>
                <Eyebrow>Where to look</Eyebrow>
                <h2 className="cp-h2" style={{ marginTop: "10px" }}>{cityName}&rsquo;s <em>clinic hotspots</em></h2>
                <p className="cp-hs-copy">
                  {HOTSPOT_COPY[city] ?? `Clinics in ${cityName} cluster in a handful of districts. These are the ${districts.length} with the most clinics we list.`}
                </p>
              </div>
              <div className="cp-bars">
                {districts.map((d) => (
                  <div key={d.district} className="cp-bar">
                    <div>
                      {d.district}
                      {AREAS[city]?.[d.district] && <small>{AREAS[city][d.district]}</small>}
                    </div>
                    <i style={{ width: `${(d.count / maxDistrict) * 100}%` }} aria-hidden />
                    <em>{d.count}</em>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 6. FAQ ────────────────────────────────────────────── */}
        {faq.length > 0 && (
          <section className="cp-section" style={{ paddingTop: districts.length > 0 ? 0 : undefined }}>
            <div className="cp-wrap">
              <Eyebrow>Good to know</Eyebrow>
              <h2 className="cp-h2" style={{ margin: "10px 0 18px" }}>Healthcare in {cityName}, <em>briefly</em></h2>
              <div className="cp-faq">
                {faq.map((f, i) => (
                  <details key={f.q} open={i === 0}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Empty city: meanwhile ─────────────────────────────── */}
        {!hasClinics && (
          <section className="cp-section">
            <div className="cp-wrap">
              <Eyebrow>Meanwhile</Eyebrow>
              <h2 className="cp-h2" style={{ margin: "10px 0 24px" }}>Where we <em>already cover</em></h2>
              <div className="cp-ggrid">
                <Link href="/bangkok/" className="cp-guide">
                  <span className="cp-eyebrow cp-eyebrow-sm">City</span>
                  <h4 className="cp-guide-title">Clinics in Bangkok</h4>
                  <span className="cp-guide-link">Browse Bangkok clinics →</span>
                </Link>
                <Link href="/phuket/" className="cp-guide">
                  <span className="cp-eyebrow cp-eyebrow-sm">City</span>
                  <h4 className="cp-guide-title">Clinics in Phuket</h4>
                  <span className="cp-guide-link">Browse Phuket clinics →</span>
                </Link>
                <Link href="/guides/" className="cp-guide">
                  <span className="cp-eyebrow cp-eyebrow-sm">Guides</span>
                  <h4 className="cp-guide-title">Guides to healthcare in Thailand</h4>
                  <span className="cp-guide-link">Read the guides →</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── 7. CTA ────────────────────────────────────────────── */}
        <section className="cp-section" style={{ paddingTop: 0 }}>
          <div className="cp-wrap">
            <div className="cp-cta">
              <div>
                <h3>{hasClinics ? "Not sure where to start?" : `Need a clinic in ${cityName} now?`}</h3>
                <p>
                  {hasClinics
                    ? `Tell us what you need and we'll send a free shortlist of 2–3 ${cityName} clinics that fit.`
                    : "Tell us what you need and we'll help you find one."}
                </p>
              </div>
              <Link href="/get-matched/" className="cp-btn cp-btn-light">Get matched — it&rsquo;s free</Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
