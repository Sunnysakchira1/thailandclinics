import type { Tier } from "@/lib/tiers";

type Props = {
  tier: Tier;
  topRated: boolean;
  /** "listing" is the only context where Pro shows "Featured". */
  context?: "listing" | "default";
  size?: "sm" | "md";
};

const base = (size: "sm" | "md"): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: "5px",
  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontWeight: 600,
  fontSize: size === "sm" ? "9.5px" : "10.5px", lineHeight: 1,
  letterSpacing: "0.08em", textTransform: "uppercase",
  padding: size === "sm" ? "3px 6px" : "5px 9px", borderRadius: "3px", whiteSpace: "nowrap",
});

export default function PlanBadges({ tier, topRated, context = "default", size = "md" }: Props) {
  const showFeatured = tier === "pro" && context === "listing";
  if (tier !== "premium" && !showFeatured && !topRated) return null;
  return (
    <span style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap" }}>
      {tier === "premium" && (
        <span style={{ ...base(size), background: "var(--gold-pale)", border: "1px solid var(--gold)", color: "var(--gold-ink)" }}>◆ Premium</span>
      )}
      {showFeatured && (
        <span style={{ ...base(size), background: "var(--green)", color: "var(--white)" }}>Featured</span>
      )}
      {topRated && (
        <span style={{ ...base(size), background: "var(--green-pale)", border: "1px solid #cfe0d5", color: "var(--green)" }}>★ Top rated</span>
      )}
    </span>
  );
}
