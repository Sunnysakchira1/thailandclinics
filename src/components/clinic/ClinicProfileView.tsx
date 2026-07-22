import Link from "next/link";
import Nav from "@/components/layout/Nav";
import StructuredData from "@/components/seo/StructuredData";
import OpenStatus from "@/components/clinic/OpenStatus";
import ClinicPhoto from "@/components/clinic/ClinicPhoto";
import TCVerifiedBadge from "@/components/clinic/TCVerifiedBadge";
import { withUtm } from "@/lib/utils/outbound";
import type { ClinicProfile, ClinicReviewRow, BranchRow } from "@/lib/db/queries";

/* ─── Helpers ────────────────────────────────────────────────────── */
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatMonth(d: string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function truncate(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords ? text.trim() : words.slice(0, maxWords).join(" ") + "…";
}

/** Detect English text (>65% Latin alpha chars) */
function isEnglish(text: string | null): boolean {
  if (!text || text.length < 20) return false;
  const latin = (text.match(/[a-zA-Z]/g) ?? []).length;
  const alpha = (text.match(/\p{L}/gu) ?? []).length;
  return alpha > 0 && latin / alpha > 0.65;
}

/** Extract key terms from review bullet text */
const TECHNIQUE_TERMS = [
  "dry needling","manual therapy","shockwave therapy","kinesio taping","kinesiology taping",
  "cupping","acupuncture","pilates","laser therapy","TENS","ultrasound therapy",
  "myofascial release","deep tissue","IMS","PRP","traction","hydrotherapy",
];
const CONDITION_TERMS = [
  "office syndrome","herniated disc","ACL","sciatica","plantar fasciitis",
  "frozen shoulder","tennis elbow","lower back pain","neck pain","shoulder pain",
  "knee pain","scoliosis","spinal stenosis","sports injury","whiplash","carpal tunnel",
  "disc bulge","shin splints","IT band","post-surgical","rehabilitation",
];

function extractKeyTerms(bullets: string[]): string[] {
  const text = bullets.join(" ");
  const found: string[] = [];
  for (const term of TECHNIQUE_TERMS) {
    if (text.toLowerCase().includes(term.toLowerCase())) found.push(term);
  }
  for (const term of CONDITION_TERMS) {
    if (text.toLowerCase().includes(term.toLowerCase())) found.push(term);
  }
  const drNames = text.match(/\bDr\.?\s+[A-Z][a-zA-Z]+/g) ?? [];
  for (const dr of drNames) found.push(dr.trim());
  return [...new Set(found)].slice(0, 8);
}

function boldKeyTerms(text: string, terms: string[]): React.ReactNode {
  if (!terms.length) return text;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <mark key={m.index} style={{
        background: "var(--green-pale)", color: "var(--green)",
        fontWeight: 600, padding: "0 3px", borderRadius: "3px",
        fontStyle: "normal",
      }}>
        {m[0]}
      </mark>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? <>{parts}</> : text;
}

/* ─── Service cards ──────────────────────────────────────────────── */
const SERVICE_LABELS: Record<string, string> = {
  "sports-rehab":           "Sports rehab",
  "manual-therapy":         "Manual therapy",
  "dry-needling":           "Dry needling",
  "lymphatic-drainage":     "Lymphatic drainage",
  "pilates":                "Pilates",
  "post-surgery-rehab":     "Post-surgery rehab",
  "pediatric-physio":       "Paediatric physio",
  "neuro-rehab":            "Neuro rehab",
  "back-spine":             "Back & spine",
  "traditional-massage":    "Traditional massage",
  "tcm-acupuncture":        "TCM / Acupuncture",
  "general-dentistry":      "General dentistry",
  "orthodontics":           "Orthodontics",
  "implants":               "Implants",
  "whitening":              "Whitening",
  "root-canal":             "Root canal",
  "cosmetic-dentistry":     "Cosmetic dentistry",
  "pediatric-dentistry":    "Paediatric dentistry",
  "botox-fillers":          "Botox & fillers",
  "laser-treatments":       "Laser treatments",
  "skin-care":              "Skin care",
  "body-contouring":        "Body contouring",
  "prp":                    "PRP",
  "hair-removal":           "Hair removal",
  "anti-aging":             "Anti-aging",
  "yoga":                   "Yoga",
  "massage":                "Massage",
  "meditation":             "Meditation",
  "nutrition":              "Nutrition",
  "mental-health":          "Mental health",
  "traditional-thai-massage": "Thai massage",
  "detox":                  "Detox",
};

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  "sports-rehab":           "Injury recovery for active patients",
  "manual-therapy":         "Hands-on joint & soft tissue treatment",
  "dry-needling":           "Trigger point needle release",
  "lymphatic-drainage":     "Fluid & swelling reduction",
  "pilates":                "Core strength & movement rehab",
  "post-surgery-rehab":     "Recovery after operations",
  "pediatric-physio":       "Physiotherapy for children",
  "neuro-rehab":            "Neurological recovery programs",
  "back-spine":             "Back pain & spinal conditions",
  "traditional-massage":    "Classic therapeutic massage",
  "tcm-acupuncture":        "Traditional Chinese medicine",
  "general-dentistry":      "Routine dental care & prevention",
  "orthodontics":           "Braces & teeth alignment",
  "implants":               "Permanent tooth replacement",
  "whitening":              "Professional teeth whitening",
  "root-canal":             "Root canal & nerve treatment",
  "cosmetic-dentistry":     "Smile design & veneers",
  "pediatric-dentistry":    "Dental care for children",
  "botox-fillers":          "Injectables & facial volumising",
  "laser-treatments":       "Laser skin resurfacing & IPL",
  "skin-care":              "Facials & skin health",
  "body-contouring":        "Non-surgical fat reduction",
  "prp":                    "Platelet-rich plasma therapy",
  "hair-removal":           "Permanent hair reduction",
  "anti-aging":             "Wrinkle & collagen treatments",
  "yoga":                   "Yoga classes & instruction",
  "massage":                "Therapeutic massage",
  "meditation":             "Mindfulness & meditation",
  "nutrition":              "Dietary & nutritional guidance",
  "mental-health":          "Counselling & mental wellness",
  "traditional-thai-massage": "Authentic Thai massage",
  "detox":                  "Cleansing & detox programs",
};

const SERVICE_KEYWORDS: Record<string, string[]> = {
  "sports-rehab":           ["sport","athlete","run","marathon","football","soccer","tennis","golf","cycling","injury recovery","ACL","ligament"],
  "manual-therapy":         ["manual","hands-on","manipulation","mobilisation","mobilization","joint","therapist worked"],
  "dry-needling":           ["needle","dry needling","needling","trigger point","acupuncture needle"],
  "lymphatic-drainage":     ["lymph","drainage","swelling","edema","oedema","fluid"],
  "pilates":                ["pilates","core","reformer","strengthening"],
  "post-surgery-rehab":     ["surgery","operation","post-op","post op","after surgery","knee replacement","hip replacement","rehab after"],
  "pediatric-physio":       ["child","kid","paediatric","pediatric","baby","infant","son","daughter"],
  "neuro-rehab":            ["stroke","neuro","neurological","nerve damage","MS","Parkinson","brain"],
  "back-spine":             ["back","spine","disc","sciatica","lower back","herniated","lumbar","cervical","neck","scoliosis"],
  "traditional-massage":    ["traditional massage","deep tissue","sports massage","therapeutic massage"],
  "tcm-acupuncture":        ["acupuncture","TCM","traditional chinese","cupping","herbal","moxibustion"],
  "general-dentistry":      ["cleaning","check-up","filling","cavity","dental check","routine"],
  "orthodontics":           ["braces","orthodontic","alignment","Invisalign","retainer","straight teeth"],
  "implants":               ["implant","crown","bridge","missing tooth"],
  "whitening":              ["whiten","bleach","bright","white teeth","smile"],
  "root-canal":             ["root canal","nerve","endodontic","tooth pain"],
  "cosmetic-dentistry":     ["veneer","cosmetic","smile design","makeover","composite"],
  "pediatric-dentistry":    ["child","kid","paediatric","pediatric"],
  "botox-fillers":          ["botox","filler","injection","lip","jawline","hyaluronic"],
  "laser-treatments":       ["laser","IPL","light therapy","pigmentation","resurfacing"],
  "skin-care":              ["skin","facial","pore","moistur","glow","complexion","hydra"],
  "body-contouring":        ["contour","slim","fat reduction","cool","sculpt"],
  "prp":                    ["PRP","platelet","plasma","growth factor"],
  "hair-removal":           ["hair removal","wax","laser hair","shaving","unwanted hair"],
  "anti-aging":             ["aging","ageing","wrinkle","anti-age","collagen","tightening","lifting"],
  "yoga":                   ["yoga","pose","stretch","vinyasa","hatha"],
  "massage":                ["massage","relaxation","stress","tension","body work"],
  "meditation":             ["meditat","mindful","breathwork","calm","inner peace"],
  "nutrition":              ["nutriti","diet","food","eating","weight","meal plan"],
  "mental-health":          ["mental","anxiety","stress","depression","counsell","therapy","burnout"],
  "traditional-thai-massage": ["thai massage","traditional thai","nuad","pressure point"],
  "detox":                  ["detox","cleanse","flush","toxin","juice"],
};

function findReviewSnippet(serviceSlug: string, reviews: { text: string | null; rating: number }[]): string | null {
  const keywords = SERVICE_KEYWORDS[serviceSlug] ?? [];
  for (const review of reviews) {
    if (!review.text || review.rating < 4) continue;
    const text = review.text;
    const lower = text.toLowerCase();
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes(kw.toLowerCase()) && sentence.length > 25 && sentence.length < 200) {
            const words = sentence.split(/\s+/);
            return (words.length > 16 ? words.slice(0, 16).join(" ") + "…" : sentence);
          }
        }
      }
    }
  }
  return null;
}

/** Parse opening hours JSON → ordered rows */
const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function parseHours(raw: string | null): { day: string; hours: string }[] {
  if (!raw) return [];
  try {
    const obj = JSON.parse(raw) as Record<string, string>;
    return DAY_ORDER.filter((d) => obj[d]).map((d) => ({ day: d, hours: obj[d] }));
  } catch { return []; }
}

/** Opening hours → schema */
function hoursToSchema(raw: string | null) {
  return parseHours(raw)
    .filter((r) => r.hours.toLowerCase() !== "closed")
    .map((r) => {
      const [open, close] = r.hours.replace(/\s/g, "").split("-");
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${r.day}`,
        opens:  normaliseTime(open ?? ""),
        closes: normaliseTime(close ?? ""),
      };
    });
}

function normaliseTime(t: string): string {
  const m = t.match(/(\d+)(?::(\d+))?(AM|PM)/i);
  if (!m) return "00:00";
  let h = parseInt(m[1]);
  const min = m[2] ?? "00";
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

/* ─── Schema ─────────────────────────────────────────────────────── */
export function buildClinicSchema(
  clinic: ClinicProfile,
  siteUrl: string,
  brandOpt?: { name: string; slug: string; branchCount: number },
  branchSlugOpt?: string,
) {
  const displayName = clinic.nameEn ?? clinic.name;
  // For branch pages the canonical URL is the nested form
  const profileUrl = brandOpt && branchSlugOpt
    ? `${siteUrl}/${clinic.citySlug}/${clinic.categorySlug}/${brandOpt.slug}/${branchSlugOpt}/`
    : `${siteUrl}/${clinic.citySlug}/${clinic.categorySlug}/${clinic.slug}/`;
  const mapsUrl     = clinic.googlePlaceId
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName)}&query_place_id=${clinic.googlePlaceId}`
    : `https://maps.google.com/?q=${clinic.lat},${clinic.lng}`;

  const localBusiness: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":    ["LocalBusiness", "MedicalClinic"],
    name: displayName, url: profileUrl, telephone: clinic.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: clinic.address,
      addressLocality: clinic.district ?? clinic.cityName,
      addressRegion: clinic.cityName,
      postalCode: clinic.postalCode,
      addressCountry: "TH",
    },
    geo: { "@type": "GeoCoordinates", latitude: clinic.lat, longitude: clinic.lng },
    hasMap: mapsUrl,
    medicalSpecialty: clinic.categoryName.replace(" Clinics", ""),
    availableLanguage: clinic.englishSpeaking
      ? [{ "@type": "Language", name: "English" }, { "@type": "Language", name: "Thai" }]
      : [{ "@type": "Language", name: "Thai" }],
  };
  if (clinic.googleRating && clinic.googleReviewsCount) {
    localBusiness.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: clinic.googleRating, reviewCount: clinic.googleReviewsCount,
      bestRating: 5, worstRating: 1,
    };
  }
  const hours = hoursToSchema(clinic.openingHours);
  if (hours.length) localBusiness.openingHoursSpecification = hours;

  const breadcrumbItems: Record<string, unknown>[] = [
    { "@type": "ListItem", position: 1, name: "Home",              item: siteUrl },
    { "@type": "ListItem", position: 2, name: clinic.cityName,     item: `${siteUrl}/${clinic.citySlug}/` },
    { "@type": "ListItem", position: 3, name: clinic.categoryName, item: `${siteUrl}/${clinic.citySlug}/${clinic.categorySlug}/` },
  ];
  if (brandOpt && branchSlugOpt) {
    breadcrumbItems.push({
      "@type": "ListItem", position: 4, name: brandOpt.name,
      item: `${siteUrl}/${clinic.citySlug}/${clinic.categorySlug}/${brandOpt.slug}/`,
    });
    breadcrumbItems.push({ "@type": "ListItem", position: 5, name: displayName, item: profileUrl });
  } else {
    breadcrumbItems.push({ "@type": "ListItem", position: 4, name: displayName, item: profileUrl });
  }
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };
  return [localBusiness, breadcrumb];
}

/* ─── Stars component ────────────────────────────────────────────── */
const STAR = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", gap: "1px" }}>
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= rounded ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth={i <= rounded ? 0 : 1.5}
          style={{ color: "var(--star)", flexShrink: 0 }}>
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
}

/* ─── Nearby clinic shape (subset used by the nearby section) ─────── */
export type NearbyClinic = {
  id:                 number;
  name:               string;
  nameEn:             string | null;
  slug:               string;
  district:           string | null;
  googleRating:       number | null;
  googleReviewsCount: number | null;
};

/* ─── Props ──────────────────────────────────────────────────────── */
export type ClinicProfileViewProps = {
  /** Full clinic profile (standalone clinic OR a brand branch — only ClinicProfile fields are read). */
  clinic:      ClinicProfile;
  /** Recent reviews with text. */
  reviews:     ClinicReviewRow[];
  /** Nearby clinics, pre-sorted by distance and already sliced. Links use clinic.citySlug/categorySlug. */
  nearby:      NearbyClinic[];
  /** Pre-built schema objects (LocalBusiness + BreadcrumbList). */
  schemas:     Record<string, unknown>[];
  /** Brand context — present only on branch pages. */
  brand?:      { name: string; slug: string; branchCount: number };
  /** This branch's own branchSlug — present only on branch pages. */
  branchSlug?: string;
  /** Sibling branches (excluding this one) — present only on branch pages, sorted by caller. */
  siblings?:   BranchRow[];
  /** Editorial "Editor's Pick" copy — set on branch pages when the brand is featured. */
  editorsNote?: string | null;
};

/* ─── View ───────────────────────────────────────────────────────── */
export default function ClinicProfileView({ clinic, reviews, nearby, schemas, brand, branchSlug, siblings, editorsNote }: ClinicProfileViewProps) {
  const allReviews = reviews;
  const displayName = clinic.nameEn ?? clinic.name;
  const mapsUrl     = clinic.googlePlaceId
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName)}&query_place_id=${clinic.googlePlaceId}`
    : `https://maps.google.com/?q=${clinic.lat},${clinic.lng}`;

  /* Review summary */
  let positives: string[] = [];
  let negatives: (string | null)[] = [];
  try {
    if (clinic.reviewPositives) positives = JSON.parse(clinic.reviewPositives);
    if (clinic.reviewNegatives) negatives = JSON.parse(clinic.reviewNegatives);
  } catch { /* ignore */ }
  const posFiltered = positives.filter(Boolean);
  const negFiltered = negatives.filter(Boolean) as string[];
  const showSummary = posFiltered.length >= 2;

  /* Key terms extracted from all bullets */
  const keyTerms = extractKeyTerms([...posFiltered, ...negFiltered]);

  /* Overview paragraph — first positive bullet, capped at 100 words */
  const overview = posFiltered[0] ? truncate(posFiltered[0], 100) : null;

  /* English-only patient voices: ≥4 stars, limit 3 */
  const patientVoices = allReviews
    .filter((r) => r.rating >= 4 && isEnglish(r.text))
    .slice(0, 3);

  /* Opening hours */
  const hours = parseHours(clinic.openingHours);

  /* Attribute chips */
  const chips = [
    clinic.englishSpeaking && { label: "English speaking",  icon: "🗣" },
    clinic.nearBts         && { label: "Near BTS Skytrain", icon: "🚆" },
    clinic.nearMrt         && { label: "Near MRT",          icon: "🚇" },
    clinic.openWeekends    && { label: "Open weekends",     icon: "📅" },
    clinic.verified        && { label: "Verified",          icon: "✓",  accent: true },
  ].filter(Boolean) as { label: string; icon: string; accent?: boolean }[];

  /* Website host */
  let websiteHost = "";
  try { if (clinic.website) websiteHost = new URL(clinic.website).hostname.replace("www.", ""); } catch { /**/ }

  return (
    <>
      <StructuredData data={schemas} />
      <Nav />

      <main style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>

        {/* ── Clinic photo banner ──────────────────────────────── */}
        <div style={{
          width: "100%",
          height: "clamp(200px, 28vw, 340px)",
          overflow: "hidden",
          position: "relative",
          background: "var(--linen-dark)",
        }}>
          <ClinicPhoto url={clinic.photoUrl} name={displayName} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 50%, rgba(26,26,26,0.25) 100%)",
          }} />
        </div>

        {/* ══════════════════════════════════════════════════════════
            ZONE 1 — HERO
            White background. Two columns on desktop.
            At-a-Glance card is first in DOM → appears top-left on mobile,
            sticky right column on desktop via CSS ordering.
        ══════════════════════════════════════════════════════════ */}
        <div className="profile-hero">
          <div className="profile-hero-inner">
            <div className="profile-hero-grid">

              {/* ── At a Glance card ─── DOM first = mobile top ── */}
              <aside className="profile-glance-card">
                <p style={{
                  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "var(--muted)", marginBottom: "18px",
                }}>
                  At a Glance
                </p>

                {clinic.phone && (
                  <a href={`tel:${clinic.phone}`} style={{
                    display: "block",
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize: "20px", fontWeight: 600, color: "var(--green)",
                    textDecoration: "none", marginBottom: "12px", lineHeight: 1.2,
                  }}>
                    {clinic.phone}
                  </a>
                )}

                {websiteHost && (
                  <a href={withUtm(clinic.website!)} target="_blank" rel="noopener noreferrer" style={{
                    display: "block",
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize: "13px", color: "var(--charcoal-soft)",
                    textDecoration: "none", marginBottom: "10px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    🌐 {websiteHost}
                  </a>
                )}

                {clinic.address && (
                  <p style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize: "12.5px", color: "var(--muted)", lineHeight: 1.55,
                    marginBottom: "16px",
                  }}>
                    📍 {clinic.address}
                  </p>
                )}

                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: "8px", width: "100%",
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize: "13.5px", fontWeight: 500,
                    background: "var(--green)", color: "#fff",
                    padding: "12px 16px", borderRadius: "4px",
                    textDecoration: "none", marginBottom: "14px",
                    boxSizing: "border-box", transition: "background 0.2s",
                  }}
                  className="glance-maps-btn"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  Open in Google Maps
                </a>

                <OpenStatus hoursJson={clinic.openingHours} />

                {clinic.googleRating !== null && (
                  <>
                    <hr style={{ border: "none", borderTop: "1px solid var(--border-soft)", margin: "16px 0" }} />
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                      <span style={{
                        fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                        fontSize: "32px", fontWeight: 500, color: "var(--charcoal)", lineHeight: 1,
                      }}>
                        {clinic.googleRating.toFixed(1)}
                      </span>
                      <Stars rating={clinic.googleRating} size={14} />
                    </div>
                    {clinic.googleReviewsCount && (
                      <p style={{
                        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                        fontSize: "12px", color: "var(--muted)",
                      }}>
                        {clinic.googleReviewsCount.toLocaleString()} Google reviews
                      </p>
                    )}
                  </>
                )}

                {clinic.lastVerifiedAt && (
                  <>
                    <hr style={{ border: "none", borderTop: "1px solid var(--border-soft)", margin: "16px 0 12px" }} />
                    <p style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                      fontSize: "11px", color: "var(--muted)",
                    }}>
                      ✓ Verified {formatMonth(clinic.lastVerifiedAt)}
                    </p>
                  </>
                )}
              </aside>

              {/* ── Left: clinic identity + overview ─────────────── */}
              <div className="profile-hero-content">

                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" style={{
                  display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap",
                  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize: "12px", color: "var(--muted)", marginBottom: "20px",
                }}>
                  {(brand && branchSlug
                    ? [
                        { label: "Home",              href: "/" },
                        { label: clinic.cityName,     href: `/${clinic.citySlug}/` },
                        { label: clinic.categoryName, href: `/${clinic.citySlug}/${clinic.categorySlug}/` },
                        { label: brand.name,          href: `/${clinic.citySlug}/${clinic.categorySlug}/${brand.slug}/` },
                        { label: displayName,         href: null },
                      ]
                    : [
                        { label: "Home",              href: "/" },
                        { label: clinic.cityName,     href: `/${clinic.citySlug}/` },
                        { label: clinic.categoryName, href: `/${clinic.citySlug}/${clinic.categorySlug}/` },
                        { label: displayName,         href: null },
                      ]
                  ).map((crumb, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {i > 0 && <span style={{ opacity: 0.4 }}>›</span>}
                      {crumb.href
                        ? <Link href={crumb.href} style={{ color: "var(--muted)", textDecoration: "none" }}>{crumb.label}</Link>
                        : <span style={{ color: "var(--charcoal-soft)" }}>{crumb.label}</span>
                      }
                    </span>
                  ))}
                </nav>

                {/* Category + location row */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <span style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "var(--terracotta)",
                    background: "rgba(196,98,45,0.08)", padding: "3px 10px", borderRadius: "4px",
                  }}>
                    {clinic.categoryName.replace(" Clinics", "")}
                  </span>
                  {clinic.district && (
                    <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13px", color: "var(--muted)" }}>
                      {clinic.district}, {clinic.cityName}
                    </span>
                  )}
                </div>

                {/* H1 */}
                <h1 style={{
                  fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                  fontSize: "clamp(30px, 5vw, 42px)", fontWeight: 400,
                  color: "var(--charcoal)", lineHeight: 1.08, marginBottom: "16px",
                }}>
                  {displayName}
                </h1>

                {/* Part-of-brand cross-link — branch pages only */}
                {brand && branchSlug && (
                  <p style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize: "13px", color: "var(--muted)",
                    marginBottom: "16px", lineHeight: 1.4,
                  }}>
                    Part of{" "}
                    <Link
                      href={`/${clinic.citySlug}/${clinic.categorySlug}/${brand.slug}/`}
                      style={{ color: "var(--green)", textDecoration: "none", fontWeight: 500 }}
                    >
                      {brand.name}
                    </Link>
                    {" "}—{" "}
                    <Link
                      href={`/${clinic.citySlug}/${clinic.categorySlug}/${brand.slug}/`}
                      style={{ color: "var(--green)", textDecoration: "none" }}
                    >
                      view all {brand.branchCount} locations →
                    </Link>
                  </p>
                )}

                {/* Rating */}
                {clinic.googleRating !== null && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", flexWrap: "wrap" }}>
                    <Stars rating={clinic.googleRating} size={15} />
                    <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", fontWeight: 600, color: "var(--charcoal)" }}>
                      {clinic.googleRating.toFixed(1)}
                    </span>
                    {clinic.googleReviewsCount && (
                      <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13px", color: "var(--muted)" }}>
                        · {clinic.googleReviewsCount.toLocaleString()} Google reviews
                      </span>
                    )}
                  </div>
                )}

                {/* Editor's pick — featured clinics (brand note takes precedence over the physio fallback) */}
                {(editorsNote || clinic.featured) && (
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: "12px",
                    background: "var(--green-pale)",
                    border: "1px solid var(--green)",
                    borderLeft: "3px solid var(--green)",
                    borderRadius: "6px",
                    padding: "14px 18px",
                    marginBottom: "22px",
                    maxWidth: "560px",
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.6" style={{ flexShrink: 0, marginTop: "1px" }}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <div>
                      <p style={{
                        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                        fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em",
                        textTransform: "uppercase", color: "var(--green)", marginBottom: "4px",
                      }}>
                        Editor&rsquo;s Pick
                      </p>
                      <p style={{
                        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                        fontSize: "14px", color: "var(--charcoal)", lineHeight: 1.5, margin: 0,
                      }}>
                        {editorsNote ?? <>Widely recommended as one of the <strong>best physiotherapy clinics in Bangkok</strong> — featured across expat and medical-tourism guides.</>}
                      </p>
                    </div>
                  </div>
                )}

                {/* Overview paragraph */}
                {overview && (
                  <p style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize: "15px", color: "var(--charcoal-soft)", lineHeight: 1.75,
                    marginBottom: "22px", maxWidth: "520px",
                  }}>
                    {overview}
                  </p>
                )}

                {/* Attribute chips */}
                {chips.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {chips.map((c) => (
                      <span key={c.label} style={{
                        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                        fontSize: "12px", fontWeight: 500,
                        padding: "5px 12px", borderRadius: "100px",
                        border: c.accent ? "1px solid var(--green)" : "1px solid var(--border)",
                        background: c.accent ? "var(--green-pale)" : "var(--white)",
                        color: c.accent ? "var(--green)" : "var(--charcoal-soft)",
                      }}>
                        {c.icon} {c.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            ZONE 2 — WHAT THAILANDCLINICS FOUND
            Our editorial verdict. This is the USP.
        ══════════════════════════════════════════════════════════ */}
        {showSummary && (
          <div className="profile-editorial">
            <div className="profile-editorial-inner">

              {/* Section eyebrow + TC Verified trust mark */}
              <div style={{
                display: "flex", alignItems: "center", gap: "14px",
                flexWrap: "wrap", marginBottom: "16px",
              }}>
                <p style={{
                  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.16em",
                  textTransform: "uppercase", color: "var(--terracotta)", margin: 0,
                }}>
                  What ThailandClinics Found
                </p>
                <TCVerifiedBadge />
              </div>

              {/* Key terms pills */}
              {keyTerms.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                  {keyTerms.map((term) => (
                    <span key={term} style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                      fontSize: "12px", fontWeight: 500,
                      background: "var(--green-pale)",
                      color: "var(--green)",
                      border: "1px solid rgba(26,71,49,0.2)",
                      padding: "5px 12px", borderRadius: "100px",
                    }}>
                      {term}
                    </span>
                  ))}
                </div>
              )}

              {/* Verdict card */}
              <div className="profile-verdict-card">

                {/* Positives */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {posFiltered.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <span style={{
                        color: "var(--open)", fontWeight: 700, fontSize: "14px",
                        flexShrink: 0, marginTop: "2px", lineHeight: 1,
                      }}>✓</span>
                      <p style={{
                        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                        fontSize: "14.5px", color: "var(--charcoal-soft)",
                        lineHeight: 1.65, margin: 0,
                      }}>
                        {boldKeyTerms(p, keyTerms)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Negatives */}
                {negFiltered.length > 0 && (
                  <>
                    <hr style={{ border: "none", borderTop: "1px solid var(--border-soft)", margin: "20px 0 16px" }} />
                    <p style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                      fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
                      textTransform: "uppercase", color: "var(--muted)", marginBottom: "12px",
                    }}>
                      Worth knowing
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {negFiltered.map((n, i) => (
                        <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                          <span style={{ color: "var(--muted)", fontSize: "14px", flexShrink: 0, marginTop: "2px", lineHeight: 1 }}>–</span>
                          <p style={{
                            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                            fontSize: "14px", color: "var(--muted)", lineHeight: 1.6, margin: 0,
                          }}>
                            {n}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Subtitle */}
              {clinic.reviewSummaryCount && (
                <p style={{
                  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize: "11.5px", color: "var(--muted)", marginTop: "14px",
                  fontStyle: "italic",
                }}>
                  Based on {clinic.reviewSummaryCount} verified reviews analysed by ThailandClinics
                  {clinic.reviewSummaryUpdatedAt ? ` · Updated ${formatMonth(clinic.reviewSummaryUpdatedAt)}` : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            PATIENT VOICES — English-only, ≥4 stars, limit 3
        ══════════════════════════════════════════════════════════ */}
        {patientVoices.length >= 2 && (
          <div className="profile-voices">
            <div className="profile-voices-inner">
              <p style={{
                fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.16em",
                textTransform: "uppercase", color: "var(--muted)", marginBottom: "20px",
              }}>
                Patient Voices
              </p>
              <div className="profile-voices-grid">
                {patientVoices.map((r) => (
                  <div key={r.id} style={{
                    background: "var(--white)", border: "1px solid var(--border-soft)",
                    borderRadius: "6px", padding: "20px",
                  }}>
                    <div style={{ marginBottom: "12px" }}>
                      <Stars rating={r.rating} size={12} />
                    </div>
                    <p style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                      fontSize: "13.5px", color: "var(--charcoal-soft)",
                      lineHeight: 1.7, margin: "0 0 14px",
                    }}>
                      "{r.text}"
                    </p>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: "10px", flexWrap: "wrap",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                        fontSize: "11px", color: "var(--muted)",
                      }}>
                        via Google
                      </span>
                      <TCVerifiedBadge size="sm" />
                    </div>
                  </div>
                ))}
              </div>
              {clinic.googleReviewsCount && (
                <p style={{
                  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize: "12px", color: "var(--muted)", marginTop: "14px",
                }}>
                  {clinic.googleReviewsCount.toLocaleString()} total reviews on Google
                </p>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            ZONE 3 — DETAILS
        ══════════════════════════════════════════════════════════ */}
        <div className="profile-details">
          <div className="profile-details-inner">

            {/* Opening hours */}
            {hours.length > 0 && (
              <details className="profile-detail-block" open>
                <summary className="profile-detail-summary">Opening Hours</summary>
                <div className="profile-detail-content">
                  <div style={{ border: "1px solid var(--border-soft)", borderRadius: "6px", overflow: "hidden" }}>
                    {hours.map(({ day, hours: h }, i) => {
                      const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
                      const isToday   = day === todayName;
                      const isClosed  = h.toLowerCase() === "closed";
                      return (
                        <div key={day} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "11px 20px", minHeight: "44px",
                          background: isToday ? "var(--green-pale)" : i % 2 === 0 ? "var(--white)" : "var(--linen)",
                          borderBottom: i < hours.length - 1 ? "1px solid var(--border-soft)" : "none",
                        }}>
                          <span style={{
                            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                            fontSize: "14px", fontWeight: isToday ? 600 : 400,
                            color: isToday ? "var(--green)" : "var(--charcoal-soft)",
                            display: "flex", alignItems: "center", gap: "8px",
                          }}>
                            {day}
                            {isToday && <span style={{
                              fontSize: "10px", background: "var(--green)", color: "#fff",
                              padding: "1px 7px", borderRadius: "100px", fontWeight: 500,
                            }}>Today</span>}
                          </span>
                          <span style={{
                            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                            fontSize: "14px", fontWeight: isToday ? 500 : 400,
                            color: isClosed ? "var(--muted)" : isToday ? "var(--green)" : "var(--charcoal-soft)",
                          }}>
                            {h}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </details>
            )}

            {/* Services */}
            {(() => {
              let serviceList: string[] = [];
              try { serviceList = clinic.services ? JSON.parse(clinic.services) : []; } catch { /**/ }
              if (!serviceList.length) return null;
              return (
                <details className="profile-detail-block" open>
                  <summary className="profile-detail-summary">Services</summary>
                  <div className="profile-detail-content">
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "10px",
                    }}>
                      {serviceList.map((slug) => {
                        const label   = SERVICE_LABELS[slug] ?? slug;
                        const snippet = findReviewSnippet(slug, allReviews);
                        const sub     = snippet ?? SERVICE_DESCRIPTIONS[slug] ?? "";
                        return (
                          <div key={slug} style={{
                            background: "var(--white)",
                            border: "1px solid var(--border-soft)",
                            borderLeft: "3px solid var(--green-pale)",
                            borderRadius: "6px",
                            padding: "12px 14px",
                          }}>
                            <p style={{
                              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                              fontSize: "13.5px", fontWeight: 500,
                              color: "var(--charcoal)", margin: "0 0 5px",
                            }}>{label}</p>
                            {sub && (
                              <p style={{
                                fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                                fontSize: "12px",
                                fontStyle: snippet ? "italic" : "normal",
                                color: "var(--muted)", margin: 0, lineHeight: 1.5,
                              }}>
                                {snippet ? `"${sub}"` : sub}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </details>
              );
            })()}

            {/* Location */}
            <details className="profile-detail-block" open>
              <summary className="profile-detail-summary">Location &amp; Getting There</summary>
              <div className="profile-detail-content">
                {clinic.address && (
                  <p style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize: "14px", color: "var(--charcoal-soft)",
                    marginBottom: "16px", lineHeight: 1.5,
                  }}>
                    {clinic.address}
                  </p>
                )}
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize: "13px", fontWeight: 500,
                  color: "var(--green)", textDecoration: "none",
                  border: "1px solid var(--green)", padding: "8px 16px",
                  borderRadius: "4px", marginBottom: "16px",
                }}>
                  Open in Google Maps →
                </a>
                <div style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-soft)" }}>
                  <iframe
                    title={`${displayName} map`}
                    width="100%" height="260"
                    style={{ display: "block", border: "none" }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={clinic.googlePlaceId
                      ? `https://www.google.com/maps?q=place_id:${clinic.googlePlaceId}&output=embed`
                      : `https://www.google.com/maps?q=${clinic.lat},${clinic.lng}&z=15&output=embed`}
                  />
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            NEARBY CLINICS
        ══════════════════════════════════════════════════════════ */}
        {nearby.length > 0 && (
          <div className="profile-nearby">
            <div className="profile-nearby-inner">
              <p style={{
                fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "10px",
              }}>
                Nearby
              </p>
              <h2 style={{
                fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                fontSize: "26px", fontWeight: 400, color: "var(--charcoal)", marginBottom: "20px",
              }}>
                {clinic.categoryName} close to here
              </h2>
              <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: "6px", overflow: "hidden" }}>
                {nearby.map((n) => {
                  const nName = n.nameEn ?? n.name;
                  return (
                    <Link key={n.id} href={`/${clinic.citySlug}/${clinic.categorySlug}/${n.slug}/`}
                      className="nearby-row"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: "16px", padding: "16px 20px",
                        borderBottom: "1px solid var(--border-soft)",
                        textDecoration: "none", background: "var(--white)",
                        transition: "background 0.15s", minHeight: "56px",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                          fontSize: "18px", fontWeight: 500, color: "var(--charcoal)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          marginBottom: "2px",
                        }}>{nName}</p>
                        {n.district && (
                          <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "12px", color: "var(--muted)" }}>
                            {n.district}
                          </p>
                        )}
                      </div>
                      {n.googleRating !== null && (
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                          <span style={{ color: "var(--star)", fontSize: "12px" }}>★</span>
                          <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13px", fontWeight: 500, color: "var(--charcoal)" }}>
                            {n.googleRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13px", color: "var(--green)", fontWeight: 500, flexShrink: 0 }}>
                        View →
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Internal links */}
              <div style={{
                marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border-soft)",
                display: "flex", gap: "20px", flexWrap: "wrap",
                fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13px",
              }}>
                <Link href={`/${clinic.citySlug}/`} style={{ color: "var(--muted)", textDecoration: "none" }}>
                  All clinics in {clinic.cityName}
                </Link>
                <span style={{ color: "var(--border)" }}>·</span>
                <Link href={`/${clinic.citySlug}/${clinic.categorySlug}/`} style={{ color: "var(--muted)", textDecoration: "none" }}>
                  {clinic.categoryName} in {clinic.cityName}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            OTHER BRAND LOCATIONS — branch pages only
        ══════════════════════════════════════════════════════════ */}
        {brand && branchSlug && siblings && siblings.length > 0 && (() => {
          // Sort siblings by haversine distance from current branch
          const sorted = [...siblings]
            .filter((s) => s.branchSlug != null)
            .map((s) => ({ ...s, dist: haversine(clinic.lat, clinic.lng, s.lat, s.lng) }))
            .sort((a, b) => a.dist - b.dist);
          if (!sorted.length) return null;
          return (
            <div className="profile-nearby" style={{ background: "var(--linen)" }}>
              <div className="profile-nearby-inner">
                <p style={{
                  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "10px",
                }}>
                  Other locations
                </p>
                <h2 style={{
                  fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                  fontSize: "26px", fontWeight: 400, color: "var(--charcoal)", marginBottom: "20px",
                }}>
                  Other {brand.name} locations
                </h2>
                <div style={{ background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: "6px", overflow: "hidden" }}>
                  {sorted.map((s) => {
                    const sName = s.nameEn ?? s.name;
                    return (
                      <Link
                        key={s.branchSlug}
                        href={`/${clinic.citySlug}/${clinic.categorySlug}/${brand.slug}/${s.branchSlug}/`}
                        className="nearby-row"
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          gap: "16px", padding: "16px 20px",
                          borderBottom: "1px solid var(--border-soft)",
                          textDecoration: "none", background: "var(--white)",
                          transition: "background 0.15s", minHeight: "56px",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                            fontSize: "18px", fontWeight: 500, color: "var(--charcoal)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            marginBottom: "2px",
                          }}>{sName}</p>
                          {s.district && (
                            <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "12px", color: "var(--muted)" }}>
                              {s.district}
                            </p>
                          )}
                        </div>
                        {s.googleRating !== null && (
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                            <span style={{ color: "var(--star)", fontSize: "12px" }}>★</span>
                            <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13px", fontWeight: 500, color: "var(--charcoal)" }}>
                              {s.googleRating.toFixed(1)}
                            </span>
                            {s.googleReviewsCount != null && (
                              <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "12px", color: "var(--muted)" }}>
                                ({s.googleReviewsCount.toLocaleString()})
                              </span>
                            )}
                          </div>
                        )}
                        <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13px", color: "var(--green)", fontWeight: 500, flexShrink: 0 }}>
                          View →
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <div style={{
                  marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-soft)",
                  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13px",
                }}>
                  <Link
                    href={`/${clinic.citySlug}/${clinic.categorySlug}/${brand.slug}/`}
                    style={{ color: "var(--muted)", textDecoration: "none" }}
                  >
                    ← All {brand.name} locations
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}
      </main>

      {/* ══════════════════════════════════════════════════════════
          STICKY BOTTOM CTA — mobile only
      ══════════════════════════════════════════════════════════ */}
      {clinic.phone && (
        <div className="profile-sticky-cta">
          <div>
            <p style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize: "10px", color: "var(--muted)", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px",
            }}>
              Call clinic
            </p>
            <p style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize: "16px", fontWeight: 600, color: "var(--charcoal)",
            }}>
              {clinic.phone}
            </p>
          </div>
          <a href={`tel:${clinic.phone}`} style={{
            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
            fontSize: "14px", fontWeight: 600,
            background: "var(--green)", color: "#fff",
            padding: "13px 28px", borderRadius: "4px",
            textDecoration: "none", flexShrink: 0,
            minHeight: "48px", display: "flex", alignItems: "center",
          }}>
            Call Now
          </a>
        </div>
      )}
    </>
  );
}
