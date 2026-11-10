import ar from "./ar";
import de from "./de";
import en from "./en";
import es from "./es";
import fr from "./fr";
import it from "./it";
import pt from "./pt";
import zh from "./zh";
import type { FigureDict, FigureLang, Fmt } from "./types";

export * from "./types";

/**
 * Thousands separator per language. fr uses U+202F (narrow no-break space); zh and ar use
 * the English comma. Digits are always Western 0-9 (never Arabic-Indic).
 */
const THOUSANDS: Record<FigureLang, string> = {
  en: ",", de: ".", it: ".", es: ".", pt: ".", fr: " ", zh: ",", ar: ",",
};

/**
 * Groups an integer explicitly (no Intl locale data, so es/pt also group 4-digit numbers
 * and output is identical on every runtime). Figure numbers are whole baht.
 */
export function formatNumber(n: number, lang: FigureLang = "en"): string {
  const sign = n < 0 ? "-" : "";
  const digits = String(Math.round(Math.abs(n)));
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS[lang] ?? ",");
}

export const formatBaht = (n: number, lang: FigureLang = "en") => `฿${formatNumber(n, lang)}`;

const BUILDERS: Record<FigureLang, (f: Fmt) => FigureDict> = { en, de, it, fr, es, pt, zh, ar };

/** Right-to-left languages (the page wrapper carries dir="rtl"). */
export const isRtl = (lang: FigureLang | undefined) => lang === "ar";

const cache = new Map<FigureLang, { fmt: Fmt; dict: FigureDict }>();

/** Formatters + translated figure text for a language. Unknown values fall back to English. */
export function figureText(lang: FigureLang = "en"): { fmt: Fmt; dict: FigureDict } {
  const l: FigureLang = lang in BUILDERS ? lang : "en";
  let hit = cache.get(l);
  if (!hit) {
    const fmt: Fmt = { baht: (n) => formatBaht(n, l), num: (n) => formatNumber(n, l) };
    hit = { fmt, dict: BUILDERS[l](fmt) };
    cache.set(l, hit);
  }
  return hit;
}
