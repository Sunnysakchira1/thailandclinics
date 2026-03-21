import Link from "next/link";
import type { ClinicListItem } from "@/lib/db/queries";

const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "1px" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth={i <= Math.round(rating) ? 0 : 1.5}
          style={{ color: "#e8a020", flexShrink: 0 }}>
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

interface Props {
  clinic: ClinicListItem & { citySlug?: string; categorySlug?: string };
  rank: number;
  citySlug?: string;
  catSlug?: string;
}

function rankColor(r: number) {
  if (r === 1) return "#c9a84c";
  if (r === 2) return "#8a8278";
  if (r === 3) return "#a0714c";
  return "var(--charcoal-soft)";
}

export default function CompactClinicRow({ clinic, rank, citySlug, catSlug }: Props) {
  const displayName = clinic.nameEn || clinic.name;
  const city  = citySlug  || (clinic as any).citySlug;
  const cat   = catSlug   || (clinic as any).categorySlug;
  const href  = cat ? `/${city}/${cat}/${clinic.slug}` : `/${clinic.slug}`;

  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: "16px",
      padding: "14px 20px",
      borderBottom: "1px solid var(--border-soft)",
      textDecoration: "none",
      background: "var(--white)",
      transition: "background 0.15s",
    }} className="compact-row">
      {/* Rank */}
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%",
        background: rankColor(rank), color: "var(--white)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: 600, flexShrink: 0,
      }}>{rank}</div>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-cormorant)", fontSize: "18px",
          fontWeight: 500, color: "var(--charcoal)", lineHeight: 1.2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }} className="compact-row-name">{displayName}</p>
        {clinic.district && (
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
            {clinic.district}
          </p>
        )}
      </div>

      {/* Rating */}
      {clinic.googleRating != null && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--charcoal)" }}>
            {clinic.googleRating.toFixed(1)}
          </span>
          <Stars rating={clinic.googleRating} />
          {clinic.googleReviewsCount != null && (
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              ({clinic.googleReviewsCount.toLocaleString()})
            </span>
          )}
        </div>
      )}

      {/* Arrow */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="var(--green)" strokeWidth="2" style={{ flexShrink: 0 }}
        className="compact-row-arrow">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
