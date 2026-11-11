import type { Tier } from "@/lib/tiers";

export type BadgeLang = "en" | "de" | "it" | "fr" | "es" | "pt" | "zh" | "ar";

/** Badge labels per language. "Premium" reads naturally in every language, so it stays. */
const LABELS: Record<BadgeLang, { premium: string; featured: string; topRated: string }> = {
  en: { premium: "◆ Premium", featured: "Featured", topRated: "★ Top rated" },
  de: { premium: "◆ Premium", featured: "Empfohlen", topRated: "★ Top bewertet" },
  it: { premium: "◆ Premium", featured: "In evidenza", topRated: "★ Tra i più votati" },
  fr: { premium: "◆ Premium", featured: "À la une", topRated: "★ Parmi les mieux notés" },
  es: { premium: "◆ Premium", featured: "Destacado", topRated: "★ Mejor valorado" },
  pt: { premium: "◆ Premium", featured: "Destaque", topRated: "★ Mais bem avaliado" },
  zh: { premium: "◆ Premium", featured: "精选", topRated: "★ 高评分" },
  ar: { premium: "◆ Premium", featured: "مميّز", topRated: "★ تقييم مرتفع" },
};

type Props = {
  tier: Tier;
  topRated: boolean;
  /** "listing" is the only context where Pro shows "Featured". */
  context?: "listing" | "default";
  size?: "sm" | "md";
  /** Label language; English by default. */
  lang?: BadgeLang;
};

const base = (size: "sm" | "md", lang: BadgeLang = "en"): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: "5px",
  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontWeight: 600,
  fontSize: size === "sm" ? "9.5px" : "10.5px", lineHeight: 1,
  // Letter-spacing breaks Arabic letter joining.
  letterSpacing: lang === "ar" ? "normal" : "0.08em", textTransform: "uppercase",
  padding: size === "sm" ? "3px 6px" : "5px 9px", borderRadius: "3px", whiteSpace: "nowrap",
});

export default function PlanBadges({ tier, topRated, context = "default", size = "md", lang = "en" }: Props) {
  const l = LABELS[lang] ?? LABELS.en;
  const showFeatured = tier === "pro" && context === "listing";
  if (tier !== "premium" && !showFeatured && !topRated) return null;
  return (
    <span style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap" }}>
      {tier === "premium" && (
        <span style={{ ...base(size, lang), background: "var(--gold-pale)", border: "1px solid var(--gold)", color: "var(--gold-ink)" }}>{l.premium}</span>
      )}
      {showFeatured && (
        <span style={{ ...base(size, lang), background: "var(--green)", color: "var(--white)" }}>{l.featured}</span>
      )}
      {topRated && (
        <span style={{ ...base(size, lang), background: "var(--green-pale)", border: "1px solid #cfe0d5", color: "var(--green)" }}>{l.topRated}</span>
      )}
    </span>
  );
}
