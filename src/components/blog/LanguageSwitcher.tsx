import Link from "next/link";
import { getLanguageVersions, type Lang } from "@/lib/mdxI18n";

const SANS = "var(--font-dm-sans,'DM Sans',sans-serif)";

/**
 * Visible language switcher for blog posts that have translations. Plain crawlable links to every
 * language version, so each translation gets real internal links on top of the hreflang tags.
 * Renders nothing for English posts without translations.
 */
export default function LanguageSwitcher({ enSlug, current, label = "Language" }: { enSlug: string; current: "en" | Lang; label?: string }) {
  const versions = getLanguageVersions(enSlug);
  if (versions.length < 2) return null;
  return (
    <nav aria-label={label} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 14px", marginTop: "14px", fontFamily: SANS, fontSize: "12.5px", color: "var(--muted)" }}>
      <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
      {versions.map((v) => v.lang === current
        ? <span key={v.lang} lang={v.lang} aria-current="page" style={{ color: "var(--charcoal)", fontWeight: 600 }}>{v.name}</span>
        : <Link key={v.lang} href={v.href} hrefLang={v.lang} lang={v.lang} style={{ color: "var(--green)", textDecoration: "none" }}>{v.name}</Link>)}
    </nav>
  );
}
