import Link from "next/link";

interface ClinicCardProps {
  rank:      number;
  name:      string;
  nameEn:    string | null;
  slug:      string;
  citySlug:  string;
  catSlug:   string;
  district:  string | null;
  rating:    number | null;
  reviews:   number | null;
  verified:  boolean | null;
  englishSpeaking: boolean | null;
  nearBts:   boolean | null;
}

const RANK_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: "#c9a84c", color: "#fff" },
  2: { bg: "#8a8278", color: "#fff" },
  3: { bg: "#a0714c", color: "#fff" },
};

function StarRating({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span style={{ color: "var(--star)", fontSize: "13px", letterSpacing: "1px" }}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(empty)}
    </span>
  );
}

export default function ClinicCard({
  rank,
  name,
  nameEn,
  slug,
  citySlug,
  catSlug,
  district,
  rating,
  reviews,
  verified,
  englishSpeaking,
  nearBts,
}: ClinicCardProps) {
  const displayName     = nameEn ?? name;
  const isVerifiedChoice = (rating ?? 0) >= 4.8;
  const rankStyle       = RANK_COLORS[rank] ?? { bg: "var(--charcoal)", color: "#fff" };

  return (
    <Link
      href={`/${citySlug}/${catSlug}/${slug}/`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        className="clinic-card"
        style={{
          background:    "var(--white)",
          border:        "1px solid var(--border-soft)",
          borderRadius:  "6px",
          padding:       "28px",
          cursor:        "pointer",
          height:        "100%",
          display:       "flex",
          flexDirection: "column",
          gap:           "12px",
          position:      "relative",
        }}
      >
        {/* Rank badge */}
        <div
          style={{
            position:     "absolute",
            top:          "16px",
            right:        "16px",
            width:        "28px",
            height:       "28px",
            borderRadius: "50%",
            background:   rankStyle.bg,
            color:        rankStyle.color,
            fontSize:     "11px",
            fontWeight:   600,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            fontFamily:   "var(--font-dm-sans, 'DM Sans', sans-serif)",
            flexShrink:   0,
          }}
        >
          {rank}
        </div>

        {/* Verified Choice badge */}
        {isVerifiedChoice && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
                fontSize:      "10.5px",
                fontWeight:    500,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color:         "var(--open)",
                background:    "var(--green-pale)",
                padding:       "3px 8px",
                borderRadius:  "4px",
              }}
            >
              ✓ Verified choice
            </span>
          </div>
        )}

        {/* Clinic name */}
        <h3
          style={{
            fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
            fontSize:   "21px",
            fontWeight: 500,
            color:      "var(--charcoal)",
            lineHeight: 1.2,
            margin:     0,
            paddingRight: "32px",
          }}
        >
          {displayName}
        </h3>

        {/* District */}
        {district && (
          <p
            style={{
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize:   "12.5px",
              color:      "var(--muted)",
              margin:     0,
            }}
          >
            {district}
          </p>
        )}

        {/* Rating row */}
        {rating !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <StarRating rating={rating} />
            <span
              style={{
                fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                fontSize:   "12.5px",
                fontWeight: 500,
                color:      "var(--charcoal-soft)",
              }}
            >
              {rating.toFixed(1)}
            </span>
            {reviews !== null && (
              <span
                style={{
                  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize:   "12px",
                  color:      "var(--muted)",
                }}
              >
                ({reviews.toLocaleString()} reviews)
              </span>
            )}
          </div>
        )}

        {/* Tags row */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "auto" }}>
          {englishSpeaking && (
            <span style={tagStyle}>EN</span>
          )}
          {nearBts && (
            <span style={tagStyle}>BTS</span>
          )}
        </div>
      </article>
    </Link>
  );
}

const tagStyle: React.CSSProperties = {
  fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
  fontSize:      "10.5px",
  fontWeight:    500,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color:         "var(--charcoal-soft)",
  background:    "var(--linen-dark)",
  padding:       "3px 8px",
  borderRadius:  "4px",
};
