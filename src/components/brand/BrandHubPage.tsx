import Link from "next/link";
import Nav from "@/components/layout/Nav";
import StructuredData from "@/components/seo/StructuredData";
import OpenStatus from "@/components/clinic/OpenStatus";
import ClinicPhoto from "@/components/clinic/ClinicPhoto";
import type { BranchRow } from "@/lib/db/queries";

/* ─── Types ──────────────────────────────────────────────────────── */
export type BrandHub = {
  id: number;
  name: string;
  slug: string;
  about: string | null;
  website: string | null;
  logoUrl: string | null;
  branchCount: number | null;
  avgRating: number | null;
  totalReviews: number | null;
  featured: boolean | null;
  editorsNote: string | null;
  cityName: string;
  citySlug: string;
  categoryName: string;
  categorySlug: string;
  branches: BranchRow[];
};

/* ─── Schema builder ─────────────────────────────────────────────── */
function buildSchemas(hub: BrandHub, siteUrl: string) {
  const brandUrl = `${siteUrl}/${hub.citySlug}/${hub.categorySlug}/${hub.slug}/`;

  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: hub.name,
    url: brandUrl,
    sameAs: [hub.website].filter(Boolean),
    department: hub.branches.map((b) => {
      const branchUrl = `${siteUrl}/${hub.citySlug}/${hub.categorySlug}/${hub.slug}/${b.branchSlug}/`;
      return {
        "@type": "MedicalClinic",
        name: b.nameEn ?? b.name,
        address: b.district ?? undefined,
        geo: {
          "@type": "GeoCoordinates",
          latitude: b.lat,
          longitude: b.lng,
        },
        url: branchUrl,
      };
    }),
  };

  const breadcrumb: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",              item: siteUrl },
      { "@type": "ListItem", position: 2, name: hub.cityName,        item: `${siteUrl}/${hub.citySlug}/` },
      { "@type": "ListItem", position: 3, name: hub.categoryName,    item: `${siteUrl}/${hub.citySlug}/${hub.categorySlug}/` },
      { "@type": "ListItem", position: 4, name: hub.name,            item: brandUrl },
    ],
  };

  return [org, breadcrumb];
}

/* ─── Component ──────────────────────────────────────────────────── */
export default function BrandHubPage({ hub }: { hub: BrandHub }) {
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailand-clinics.com";
  const schemas  = buildSchemas(hub, siteUrl);
  const brandUrl = `${siteUrl}/${hub.citySlug}/${hub.categorySlug}/${hub.slug}/`;

  const branchCount  = hub.branchCount ?? hub.branches.length;
  const avgRating    = hub.avgRating;
  const totalReviews = hub.totalReviews;

  return (
    <>
      <StructuredData data={schemas} />
      <Nav />

      <main style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--border-soft)",
          padding: "40px 48px 36px",
        }} className="city-hero-pad">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{
            display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap",
            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
            fontSize: "12px", color: "var(--muted)", marginBottom: "20px",
          }}>
            {[
              { label: "Home",            href: "/" },
              { label: hub.cityName,      href: `/${hub.citySlug}/` },
              { label: hub.categoryName,  href: `/${hub.citySlug}/${hub.categorySlug}/` },
              { label: hub.name,          href: null },
            ].map((crumb, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {i > 0 && <span style={{ opacity: 0.4 }}>›</span>}
                {crumb.href
                  ? <Link href={crumb.href} style={{ color: "var(--muted)", textDecoration: "none" }}>{crumb.label}</Link>
                  : <span style={{ color: "var(--charcoal-soft)" }}>{crumb.label}</span>
                }
              </span>
            ))}
          </nav>

          {/* Category eyebrow */}
          <p style={{
            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
            fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "12px",
          }}>
            {hub.categoryName.replace(" Clinics", "")}
          </p>

          {/* H1 */}
          <h1 style={{
            fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
            fontSize: "clamp(30px, 5vw, 42px)", fontWeight: 400,
            color: "var(--charcoal)", lineHeight: 1.1, marginBottom: "14px",
          }}>
            {hub.name}
          </h1>

          {/* Sub-line stats */}
          <div style={{
            display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
            fontSize: "14px", color: "var(--muted)", marginBottom: "20px",
          }}>
            <span>{branchCount} location{branchCount !== 1 ? "s" : ""} across {hub.cityName}</span>
            {avgRating !== null && (
              <>
                <span style={{ color: "var(--border)" }}>·</span>
                <span style={{ color: "var(--charcoal-soft)" }}>
                  {avgRating.toFixed(1)}<span style={{ color: "var(--star)" }}>★</span>
                </span>
              </>
            )}
            {totalReviews !== null && (
              <>
                <span style={{ color: "var(--border)" }}>·</span>
                <span>{totalReviews.toLocaleString()} reviews</span>
              </>
            )}
          </div>

          {/* The Locully Special — featured brands (premium placement tier) */}
          {hub.editorsNote && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "12px",
              background: "var(--green-pale)",
              border: "1px solid var(--green)",
              borderLeft: "3px solid var(--green)",
              borderRadius: "6px",
              padding: "14px 18px",
              margin: "0 0 20px",
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
                  The Locully Special
                </p>
                <p style={{
                  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                  fontSize: "14px", color: "var(--charcoal)", lineHeight: 1.5, margin: 0,
                }}>
                  {hub.editorsNote}
                </p>
              </div>
            </div>
          )}

          {/* Website link */}
          {hub.website && (
            <a
              href={hub.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                fontSize: "13.5px", fontWeight: 500,
                color: "var(--green)", textDecoration: "none",
                marginBottom: hub.about ? "20px" : "0",
              }}
            >
              Visit website →
            </a>
          )}

          {/* About paragraph */}
          {hub.about && (
            <p style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize: "15px", color: "var(--charcoal-soft)", lineHeight: 1.75,
              marginTop: "16px", maxWidth: "580px", margin: "16px 0 0",
            }}>
              {hub.about}
            </p>
          )}
        </div>

        {/* ── Locations section ────────────────────────────────── */}
        <div style={{ background: "var(--linen)", padding: "48px 48px 56px" }} className="city-hero-pad">
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

            <h2 style={{
              fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize: "28px", fontWeight: 400,
              color: "var(--charcoal)", marginBottom: "24px",
            }}>
              Locations
            </h2>

            <div style={{
              background: "var(--white)",
              border: "1px solid var(--border-soft)",
              borderRadius: "6px", overflow: "hidden",
            }}>
              {hub.branches.map((branch, i) => {
                const displayName = branch.nameEn ?? branch.name;
                const branchHref  = `/${hub.citySlug}/${hub.categorySlug}/${hub.slug}/${branch.branchSlug}/`;
                const mapsUrl     = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName)}${branch.googlePlaceId ? `&query_place_id=${branch.googlePlaceId}` : ""}`;

                return (
                  <div
                    key={branch.branchSlug ?? i}
                    style={{
                      display: "flex", alignItems: "stretch",
                      borderBottom: i < hub.branches.length - 1 ? "1px solid var(--border-soft)" : "none",
                    }}
                  >
                    {/* Photo thumbnail */}
                    <div style={{
                      position: "relative", flexShrink: 0,
                      width: "120px", aspectRatio: "4/3",
                      overflow: "hidden", background: "var(--linen-dark)",
                    }}>
                      <ClinicPhoto url={branch.photoUrl} name={displayName} />
                    </div>

                    {/* Content row — plain div, no wrapping Link, so Maps <a> and View <Link> are siblings */}
                    <div
                      className="nearby-row"
                      style={{
                        flex: 1, display: "flex", alignItems: "center",
                        justifyContent: "space-between", gap: "16px",
                        padding: "16px 20px",
                        background: "var(--white)",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                          fontSize: "20px", fontWeight: 500, color: "var(--charcoal)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          marginBottom: "3px",
                        }}>
                          {displayName}
                        </p>
                        {branch.district && (
                          <p style={{
                            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                            fontSize: "12.5px", color: "var(--muted)", marginBottom: "6px",
                          }}>
                            {branch.district}
                          </p>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          {branch.googleRating !== null && (
                            <span style={{
                              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                              fontSize: "13px", color: "var(--charcoal-soft)",
                            }}>
                              <span style={{ color: "var(--star)" }}>★</span>{" "}
                              {branch.googleRating.toFixed(1)}
                              {branch.googleReviewsCount !== null && (
                                <span style={{ color: "var(--muted)" }}>
                                  {" "}({branch.googleReviewsCount.toLocaleString()})
                                </span>
                              )}
                            </span>
                          )}
                          <OpenStatus hoursJson={branch.openingHours} />
                        </div>
                      </div>

                      {/* Right: sibling links — Maps <a> + View <Link> (only when branchSlug exists) */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                            fontSize: "12px", color: "var(--muted)", textDecoration: "none",
                            display: "inline-flex", alignItems: "center", gap: "4px",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                          </svg>
                          Map
                        </a>
                        {branch.branchSlug && (
                          <Link
                            href={branchHref}
                            style={{
                              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                              fontSize: "13px", color: "var(--green)", fontWeight: 500,
                              textDecoration: "none",
                            }}
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Internal links ───────────────────────────────────── */}
        <div style={{ background: "var(--linen-dark)", borderTop: "1px solid var(--border-soft)", padding: "32px 48px" }} className="city-hero-pad">
          <div style={{
            maxWidth: "1100px", margin: "0 auto",
            display: "flex", gap: "20px", flexWrap: "wrap",
            fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13.5px",
          }}>
            <Link
              href={`/${hub.citySlug}/${hub.categorySlug}/`}
              style={{ color: "var(--green)", textDecoration: "none", fontWeight: 500 }}
            >
              All {hub.categoryName} in {hub.cityName} →
            </Link>
            <span style={{ color: "var(--border)" }}>·</span>
            <Link
              href={`/${hub.citySlug}/`}
              style={{ color: "var(--muted)", textDecoration: "none" }}
            >
              {hub.cityName} clinics →
            </Link>
          </div>
        </div>

      </main>
    </>
  );
}
