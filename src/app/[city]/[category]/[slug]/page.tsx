import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/layout/Nav";
import ClinicCard from "@/components/clinic/ClinicCard";
import StructuredData from "@/components/seo/StructuredData";
import {
  getClinicProfile,
  getNearbyPool,
  getClinicReviews,
  type ClinicProfile,
  type ClinicListItem,
  type ClinicReviewRow,
} from "@/lib/db/queries";

/* ─── Helpers ────────────────────────────────────────────────────── */
/** Haversine distance in km */
function haversine(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R   = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatMonth(isoDate: string | null): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Handles both "YYYY-MM-DD" and "MM/DD/YYYY HH:mm:ss" (Outscraper) */
function formatReviewDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Parse Outscraper about JSON into renderable groups */
function parseAbout(raw: string | null): Record<string, string[]> {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const result: Record<string, string[]> = {};
    for (const [group, val] of Object.entries(obj)) {
      if (typeof val === "object" && val !== null) {
        const items = Object.entries(val as Record<string, unknown>)
          .filter(([, v]) => v === true)
          .map(([k]) => k);
        if (items.length) result[group] = items;
      }
    }
    return result;
  } catch { return {}; }
}

/** Parse opening hours JSON → ordered day array */
const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function parseHours(raw: string | null): Array<{ day: string; hours: string }> {
  if (!raw) return [];
  try {
    const obj = JSON.parse(raw) as Record<string, string>;
    return DAY_ORDER
      .filter((d) => obj[d])
      .map((d) => ({ day: d, hours: obj[d] }));
  } catch { return []; }
}

/** Opening hours → schema openingHoursSpecification */
const DAY_MAP: Record<string, string> = {
  Monday: "Mo", Tuesday: "Tu", Wednesday: "We",
  Thursday: "Th", Friday: "Fr", Saturday: "Sa", Sunday: "Su",
};

function hoursToSchema(raw: string | null) {
  const parsed = parseHours(raw);
  return parsed
    .filter((r) => r.hours.toLowerCase() !== "closed")
    .map((r) => {
      const [open, close] = r.hours.replace(/\s/g, "").split("-");
      return {
        "@type":    "OpeningHoursSpecification",
        dayOfWeek:  `https://schema.org/${r.day}`,
        opens:      normalizeTime(open),
        closes:     normalizeTime(close),
      };
    });
}

function normalizeTime(t: string): string {
  if (!t) return "00:00";
  const m = t.match(/(\d+)(?::(\d+))?(AM|PM)/i);
  if (!m) return "00:00";
  let h = parseInt(m[1]);
  const min = m[2] ?? "00";
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

/* ─── Static params (required for output: 'export') ─────────────── */
export async function generateStaticParams() {
  const { db } = await import("@/lib/db/index");
  const { clinics: c, cities: ct, categories: cat } = await import("@/lib/db/schema");
  const { eq: eqF } = await import("drizzle-orm");

  const rows = await db
    .select({ slug: c.slug, citySlug: ct.slug, categorySlug: cat.slug })
    .from(c)
    .innerJoin(ct,  eqF(c.cityId,     ct.id))
    .innerJoin(cat, eqF(c.categoryId, cat.id));

  return rows.map((r) => ({
    city:     r.citySlug,
    category: r.categorySlug,
    slug:     r.slug,
  }));
}

/* ─── Metadata ───────────────────────────────────────────────────── */
type Props = {
  params: Promise<{ city: string; category: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const clinic = await getClinicProfile(slug);
  if (!clinic) return {};

  const displayName = clinic.nameEn ?? clinic.name;
  const catShort    = clinic.categoryName.replace(" Clinics", "");

  // Target 55-62 chars per CLAUDE.md — clinic names vary so profile titles
  // will naturally run 65-85 chars. This is acceptable; Google's pixel budget
  // (~600px) accommodates ~65 chars. Never truncate the clinic name.
  const title = `${displayName} — ${catShort} in ${clinic.district ?? clinic.cityName}, ${clinic.cityName} | ThailandClinics`;
  const description = `${displayName} is a ${catShort.toLowerCase()} clinic in ${clinic.district ?? clinic.cityName}, ${clinic.cityName}. View opening hours, contact details and patient reviews.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${clinic.citySlug}/${clinic.categorySlug}/${clinic.slug}/`,
    },
    openGraph: { title, description },
  };
}

/* ─── Schema builders ────────────────────────────────────────────── */
function buildSchema(clinic: ClinicProfile, siteUrl: string) {
  const displayName = clinic.nameEn ?? clinic.name;
  const profileUrl  = `${siteUrl}/${clinic.citySlug}/${clinic.categorySlug}/${clinic.slug}/`;
  const mapsUrl     = clinic.googlePlaceId
    ? `https://maps.google.com/?q=place_id:${clinic.googlePlaceId}`
    : `https://maps.google.com/?q=${clinic.lat},${clinic.lng}`;

  const localBusiness: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":    ["LocalBusiness", "MedicalClinic"],
    name:       displayName,
    url:        profileUrl,
    telephone:  clinic.phone,
    address: {
      "@type":           "PostalAddress",
      streetAddress:     clinic.address,
      addressLocality:   clinic.district ?? clinic.cityName,
      addressRegion:     clinic.cityName,
      postalCode:        clinic.postalCode,
      addressCountry:    "TH",
    },
    geo: {
      "@type":    "GeoCoordinates",
      latitude:   clinic.lat,
      longitude:  clinic.lng,
    },
    hasMap:          mapsUrl,
    medicalSpecialty: clinic.categoryName.replace(" Clinics", ""),
    availableLanguage: clinic.englishSpeaking
      ? [{ "@type": "Language", name: "English" }, { "@type": "Language", name: "Thai" }]
      : [{ "@type": "Language", name: "Thai" }],
  };

  if (clinic.googleRating && clinic.googleReviewsCount) {
    localBusiness.aggregateRating = {
      "@type":       "AggregateRating",
      ratingValue:   clinic.googleRating,
      reviewCount:   clinic.googleReviewsCount,
      bestRating:    5,
      worstRating:   1,
    };
  }

  const hours = hoursToSchema(clinic.openingHours);
  if (hours.length) localBusiness.openingHoursSpecification = hours;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",             item: siteUrl },
      { "@type": "ListItem", position: 2, name: clinic.cityName,    item: `${siteUrl}/${clinic.citySlug}` },
      { "@type": "ListItem", position: 3, name: clinic.categoryName, item: `${siteUrl}/${clinic.citySlug}/${clinic.categorySlug}/` },
      { "@type": "ListItem", position: 4, name: displayName,        item: profileUrl },
    ],
  };

  return [localBusiness, breadcrumb];
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default async function ClinicProfilePage({ params }: Props) {
  const { city, category, slug } = await params;
  const clinic = await getClinicProfile(slug);
  if (!clinic) notFound();

  const displayName = clinic.nameEn ?? clinic.name;
  const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailand-clinics.com";
  const schemas     = buildSchema(clinic, siteUrl);

  // Patient reviews and nearby clinics in parallel
  const [reviews, pool] = await Promise.all([
    getClinicReviews(clinic.id),
    getNearbyPool(city, category, clinic.id),
  ]);

  // We need lat/lng for pool items — fetch them separately
  // Approximation: we have lat/lng on clinic; pool items need it too.
  // Re-query with lat/lng for distance sort
  const nearbyWithCoords = await (async () => {
    const { db } = await import("@/lib/db/index");
    const { clinics: c, cities: ct, categories: cat } = await import("@/lib/db/schema");
    const { eq: eqF, and: andF, ne: neF } = await import("drizzle-orm");
    return db
      .select({
        id: c.id, name: c.name, nameEn: c.nameEn, slug: c.slug,
        district: c.district, lat: c.lat, lng: c.lng,
        googleRating: c.googleRating, googleReviewsCount: c.googleReviewsCount,
        verified: c.verified, englishSpeaking: c.englishSpeaking,
        nearBts: c.nearBts, nearMrt: c.nearMrt, openWeekends: c.openWeekends,
        featured: c.featured, featuredPosition: c.featuredPosition, photoUrl: c.photoUrl,
      })
      .from(c)
      .innerJoin(ct,  eqF(c.cityId,     ct.id))
      .innerJoin(cat, eqF(c.categoryId, cat.id))
      .where(andF(eqF(ct.slug, city), eqF(cat.slug, category), neF(c.id, clinic.id)));
  })();

  const nearby = nearbyWithCoords
    .map((n) => ({
      ...n,
      dist: haversine(clinic.lat, clinic.lng, n.lat, n.lng),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3);

  const about     = parseAbout(clinic.about);
  const hours     = parseHours(clinic.openingHours);
  const mapsUrl   = clinic.cid
    ? `https://maps.google.com/?q=place_id:${clinic.googlePlaceId}`
    : `https://maps.google.com/?q=${clinic.lat},${clinic.lng}`;

  // Parse review summary
  let positives: string[] = [];
  let negatives: (string | null)[] = [];
  try {
    if (clinic.reviewPositives) positives = JSON.parse(clinic.reviewPositives);
    if (clinic.reviewNegatives) negatives = JSON.parse(clinic.reviewNegatives);
  } catch { /* ignore */ }
  const showReviewSummary =
    positives.filter(Boolean).length >= 2;

  return (
    <>
      <StructuredData data={schemas} />
      <Nav />

      <main style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>

        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <div className="px-page" style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "16px", paddingBottom: "16px" }}>
          <nav
            aria-label="Breadcrumb"
            style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:   "12.5px",
              color:      "var(--muted)",
              display:    "flex",
              gap:        "4px",
              alignItems: "center",
              flexWrap:   "wrap",
            }}
          >
            {[
              { label: "Home",                  href: "/" },
              { label: clinic.cityName,         href: `/${clinic.citySlug}` },
              { label: clinic.categoryName,     href: `/${clinic.citySlug}/${clinic.categorySlug}/` },
              { label: displayName,             href: null },
            ].map((crumb, i, arr) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {i > 0 && <span style={{ color: "var(--border)" }}>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} style={{ color: "var(--muted)", textDecoration: "none" }}>
                    {crumb.label}
                  </a>
                ) : (
                  <span style={{ color: "var(--charcoal-soft)" }}>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        <div className="px-page" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "72px" }}>
          <div className="profile-layout">

            {/* ── Main column ──────────────────────────────────── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* H1 + meta */}
              <div style={{ marginBottom: "24px" }}>
                <p style={{
                  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize: "11px", fontWeight: 500,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  color: "var(--terracotta)", marginBottom: "10px",
                }}>
                  {clinic.categoryName}
                </p>
                <h1 style={{
                  fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                  fontSize: "clamp(28px,4vw,44px)", fontWeight: 400,
                  color: "var(--charcoal)", lineHeight: 1.1, marginBottom: "10px",
                }}>
                  {displayName}
                </h1>
                {clinic.nameTh && clinic.nameTh !== clinic.name && (
                  <p style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize: "15px", color: "var(--muted)", marginBottom: "6px",
                  }}>
                    {clinic.nameTh}
                  </p>
                )}
                <p style={{
                  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize: "14px", color: "var(--muted)",
                }}>
                  {[clinic.district, clinic.cityName].filter(Boolean).join(", ")}
                </p>
              </div>

              {/* Rating */}
              {clinic.googleRating !== null && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px",
                }}>
                  <span style={{ color: "var(--star)", fontSize: "18px" }}>
                    {"★".repeat(Math.floor(clinic.googleRating))}
                    {clinic.googleRating % 1 >= 0.5 ? "½" : ""}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                    fontSize: "15px", fontWeight: 500, color: "var(--charcoal)",
                  }}>
                    {clinic.googleRating.toFixed(1)}
                  </span>
                  {clinic.googleReviewsCount && (
                    <span style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                      fontSize: "13px", color: "var(--muted)",
                    }}>
                      ({clinic.googleReviewsCount.toLocaleString()} Google reviews)
                    </span>
                  )}
                </div>
              )}

              {/* Attribute chips */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
                {clinic.englishSpeaking && <Chip label="English speaking" />}
                {clinic.nearBts         && <Chip label="Near BTS Skytrain" />}
                {clinic.nearMrt         && <Chip label="Near MRT" />}
                {clinic.openWeekends    && <Chip label="Open weekends" />}
                {clinic.verified        && <Chip label="Verified" accent />}
              </div>

              {/* Review summary */}
              {showReviewSummary && (
                <Section title="What patients say">
                  <div className="review-grid">
                    <div className="review-col">
                      {positives.filter(Boolean).map((p, i) => (
                        <p key={i} style={bulletStyle}>
                          <span style={{ color: "var(--open)", marginRight: "8px" }}>✓</span>{p}
                        </p>
                      ))}
                    </div>
                    <div className="review-col">
                      {negatives.filter(Boolean).map((n, i) => (
                        <p key={i} style={bulletStyle}>
                          <span style={{ color: "var(--muted)", marginRight: "8px" }}>–</span>{n}
                        </p>
                      ))}
                    </div>
                  </div>
                  {clinic.reviewSummaryCount && (
                    <p style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                      fontSize: "12px", color: "var(--muted)", marginTop: "10px",
                    }}>
                      Based on {clinic.reviewSummaryCount} reviews
                      {clinic.reviewSummaryUpdatedAt
                        ? ` · Updated ${formatMonth(clinic.reviewSummaryUpdatedAt)}`
                        : ""}
                    </p>
                  )}
                </Section>
              )}

              {/* Patient reviews */}
              {reviews.length > 0 && (
                <Section title="Patient reviews">
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          background:    "var(--white)",
                          border:        "1px solid var(--border-soft)",
                          borderRadius:  "6px",
                          padding:       "20px 24px",
                        }}
                      >
                        <div style={{
                          display:      "flex",
                          alignItems:   "center",
                          gap:          "10px",
                          marginBottom: "10px",
                          flexWrap:     "wrap",
                        }}>
                          <span style={{ color: "var(--star)", fontSize: "14px", letterSpacing: "1px" }}>
                            {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                          </span>
                          <span style={{
                            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                            fontSize:   "13px",
                            fontWeight: 500,
                            color:      "var(--charcoal)",
                          }}>
                            {r.authorName}
                          </span>
                          {r.reviewDate && (
                            <span style={{
                              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                              fontSize:   "12px",
                              color:      "var(--muted)",
                            }}>
                              {formatReviewDate(r.reviewDate)}
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                          fontSize:   "14px",
                          color:      "var(--charcoal-soft)",
                          lineHeight: 1.7,
                          margin:     0,
                        }}>
                          {r.text}
                        </p>
                      </div>
                    ))}
                  </div>
                  {clinic.googleReviewsCount && (
                    <p style={{
                      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                      fontSize:   "12px",
                      color:      "var(--muted)",
                      textAlign:  "center",
                      marginTop:  "16px",
                    }}>
                      Based on {clinic.googleReviewsCount.toLocaleString()} Google reviews
                    </p>
                  )}
                </Section>
              )}

              {/* About */}
              {Object.keys(about).length > 0 && (
                <Section title="About">
                  {Object.entries(about).map(([group, items]) => (
                    <div key={group} style={{ marginBottom: "12px" }}>
                      <p style={{
                        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                        fontSize: "11px", fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: "0.07em",
                        color: "var(--charcoal-soft)", marginBottom: "6px",
                      }}>
                        {group}
                      </p>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {items.map((item) => (
                          <span key={item} style={{
                            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                            fontSize: "12.5px", color: "var(--charcoal-soft)",
                            background: "var(--linen-dark)", padding: "4px 10px",
                            borderRadius: "4px",
                          }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </Section>
              )}

              {/* Opening hours */}
              {hours.length > 0 && (
                <Section title="Opening hours">
                  <div style={{
                    border: "1px solid var(--border-soft)", borderRadius: "6px",
                    overflow: "hidden",
                  }}>
                    {hours.map(({ day, hours: h }, i) => {
                      const today    = new Date().toLocaleDateString("en-US", { weekday: "long" });
                      const isToday  = day === today;
                      const isClosed = h.toLowerCase() === "closed";
                      return (
                        <div
                          key={day}
                          style={{
                            display: "flex", justifyContent: "space-between",
                            padding: "10px 20px",
                            background: isToday ? "var(--green-pale)" : i % 2 === 0 ? "var(--white)" : "var(--linen)",
                            borderBottom: i < hours.length - 1 ? "1px solid var(--border-soft)" : "none",
                          }}
                        >
                          <span style={{
                            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                            fontSize: "13.5px",
                            fontWeight: isToday ? 500 : 400,
                            color: isToday ? "var(--green)" : "var(--charcoal-soft)",
                          }}>
                            {day}
                          </span>
                          <span style={{
                            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                            fontSize: "13.5px",
                            color: isClosed ? "var(--muted)" : isToday ? "var(--green)" : "var(--charcoal-soft)",
                          }}>
                            {h}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}

              {/* Contact */}
              <Section title="Contact">
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {clinic.address && (
                    <ContactRow label="Address" value={clinic.address} />
                  )}
                  {clinic.phone && (
                    <ContactRow label="Phone">
                      <a
                        href={`tel:${clinic.phone}`}
                        style={{
                          fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                          fontSize: "14px", color: "var(--green)", textDecoration: "none",
                        }}
                      >
                        {clinic.phone}
                      </a>
                    </ContactRow>
                  )}
                  {clinic.website && (
                    <ContactRow label="Website">
                      <a
                        href={clinic.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                          fontSize: "14px", color: "var(--green)", textDecoration: "none",
                        }}
                      >
                        {new URL(clinic.website).hostname.replace("www.", "")}
                      </a>
                    </ContactRow>
                  )}
                  <div style={{ marginTop: "8px" }}>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                        fontSize: "13.5px", fontWeight: 500,
                        backgroundColor: "var(--green)", color: "var(--white)",
                        padding: "10px 20px", borderRadius: "4px",
                        textDecoration: "none",
                      }}
                    >
                      View on Google Maps
                    </a>
                  </div>
                </div>
              </Section>

              {/* Internal links */}
              <div style={{
                marginTop: "40px", paddingTop: "24px",
                borderTop: "1px solid var(--border-soft)",
                fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                fontSize: "13px", color: "var(--muted)",
                display: "flex", gap: "16px", flexWrap: "wrap",
              }}>
                <a href={`/${clinic.citySlug}`} style={{ color: "var(--muted)", textDecoration: "none" }}>
                  All clinics in {clinic.cityName}
                </a>
                <span>·</span>
                <a href={`/${clinic.citySlug}/${clinic.categorySlug}/`} style={{ color: "var(--muted)", textDecoration: "none" }}>
                  {clinic.categoryName} in {clinic.cityName}
                </a>
              </div>
            </div>

            {/* ── Sidebar ──────────────────────────────────────── */}
            <aside className="profile-sidebar">
              {/* Quick info card */}
              <div style={{
                background: "var(--white)", border: "1px solid var(--border-soft)",
                borderRadius: "6px", padding: "24px", marginBottom: "16px",
              }}>
                <p style={{
                  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "16px",
                }}>
                  At a glance
                </p>
                {clinic.googleRating !== null && (
                  <div style={{ marginBottom: "12px" }}>
                    <p style={glanceLabel}>Google Rating</p>
                    <p style={glanceValue}>
                      {clinic.googleRating.toFixed(1)} ★{" "}
                      <span style={{ fontWeight: 400, fontSize: "12px", color: "var(--muted)" }}>
                        ({clinic.googleReviewsCount?.toLocaleString()})
                      </span>
                    </p>
                  </div>
                )}
                {clinic.district && (
                  <div style={{ marginBottom: "12px" }}>
                    <p style={glanceLabel}>District</p>
                    <p style={glanceValue}>{clinic.district}</p>
                  </div>
                )}
                {clinic.phone && (
                  <div style={{ marginBottom: "12px" }}>
                    <p style={glanceLabel}>Phone</p>
                    <a href={`tel:${clinic.phone}`} style={{ ...glanceValue, color: "var(--green)", textDecoration: "none" }}>
                      {clinic.phone}
                    </a>
                  </div>
                )}
                {clinic.lastVerifiedAt && (
                  <div>
                    <p style={glanceLabel}>Last verified</p>
                    <p style={{ ...glanceValue, fontSize: "12px" }}>
                      {formatMonth(clinic.lastVerifiedAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Google Maps embed */}
              <div style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-soft)" }}>
                <iframe
                  title={`${displayName} location map`}
                  width="100%"
                  height="220"
                  style={{ display: "block", border: "none" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${clinic.lat},${clinic.lng}&z=15&output=embed`}
                />
              </div>
            </aside>
          </div>

          {/* ── Nearby clinics ─────────────────────────────────────── */}
          {nearby.length > 0 && (
            <div style={{ marginTop: "64px", paddingTop: "40px", borderTop: "1px solid var(--border-soft)" }}>
              <p style={{
                fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                fontSize: "11px", fontWeight: 500, textTransform: "uppercase",
                letterSpacing: "0.1em", color: "var(--terracotta)", marginBottom: "10px",
              }}>
                Nearby
              </p>
              <h2 style={{
                fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                fontSize: "28px", fontWeight: 400, color: "var(--charcoal)",
                marginBottom: "24px",
              }}>
                {clinic.categoryName} close to here
              </h2>
              <div className="clinic-grid">
                {nearby.map((n, i) => (
                  <ClinicCard
                    key={n.id}
                    rank={i + 1}
                    name={n.name}
                    nameEn={n.nameEn}
                    slug={n.slug}
                    citySlug={clinic.citySlug}
                    catSlug={clinic.categorySlug}
                    district={n.district}
                    rating={n.googleRating}
                    reviews={n.googleReviewsCount}
                    verified={n.verified}
                    englishSpeaking={n.englishSpeaking}
                    nearBts={n.nearBts}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

/* ─── Small reusable components ──────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <h2 style={{
        fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
        fontSize: "22px", fontWeight: 400, color: "var(--charcoal)",
        marginBottom: "16px", paddingBottom: "10px",
        borderBottom: "1px solid var(--border-soft)",
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Chip({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span style={{
      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
      fontSize: "12px", fontWeight: 500,
      padding: "5px 12px", borderRadius: "100px",
      border: `1px solid ${accent ? "var(--green)" : "var(--border)"}`,
      background: accent ? "var(--green-pale)" : "var(--white)",
      color: accent ? "var(--green)" : "var(--charcoal-soft)",
    }}>
      {label}
    </span>
  );
}

function ContactRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: "16px" }}>
      <span style={{
        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
        fontSize: "12px", fontWeight: 600, textTransform: "uppercase",
        letterSpacing: "0.07em", color: "var(--muted)", minWidth: "72px", paddingTop: "2px",
      }}>
        {label}
      </span>
      {children ?? (
        <span style={{
          fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
          fontSize: "14px", color: "var(--charcoal-soft)",
        }}>
          {value}
        </span>
      )}
    </div>
  );
}

const bulletStyle: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
  fontSize:   "13.5px",
  color:      "var(--charcoal-soft)",
  lineHeight: 1.5,
  marginBottom: "8px",
  margin:     "0 0 8px 0",
};

const glanceLabel: React.CSSProperties = {
  fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
  fontSize:      "11px",
  fontWeight:    600,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color:         "var(--muted)",
  marginBottom:  "2px",
};

const glanceValue: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
  fontSize:   "14px",
  fontWeight: 500,
  color:      "var(--charcoal)",
  margin:     0,
};
