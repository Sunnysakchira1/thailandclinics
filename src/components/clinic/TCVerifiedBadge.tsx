/**
 * TC Verified — the ThailandClinics trust mark.
 * Shown wherever reviews have been independently analysed by ThailandClinics.
 * This is the platform USP: we read and verify the reviews, not just relist them.
 */

interface Props {
  size?: "sm" | "md";
}

export default function TCVerifiedBadge({ size = "md" }: Props) {
  const md = size === "md";
  const mark = md ? 18 : 15;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: md ? "7px" : "5px",
        background: "var(--green-pale)",
        border: "1px solid rgba(26,71,49,0.18)",
        padding: md ? "5px 11px 5px 6px" : "3px 8px 3px 4px",
        borderRadius: "100px",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {/* Tc mark */}
      <span
        aria-hidden="true"
        style={{
          width: mark,
          height: mark,
          borderRadius: md ? "5px" : "4px",
          background: "var(--green)",
          color: "var(--linen)",
          fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
          fontSize: md ? "12px" : "10px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        T<span style={{ fontStyle: "italic" }}>c</span>
      </span>
      <span
        style={{
          fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
          fontSize: md ? "11px" : "9.5px",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--green)",
        }}
      >
        TC Verified
      </span>
    </span>
  );
}
