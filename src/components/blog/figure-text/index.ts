import de from "./de";
import en from "./en";
import es from "./es";
import fr from "./fr";
import it from "./it";
import pt from "./pt";
import type { FigureDict, FigureLang, Fmt } from "./types";

export * from "./types";

/** Thousands separator per language. fr uses U+202F (narrow no-break space). */
const THOUSANDS: Record<FigureLang, string> = {
  en: ",", de: ".", it: ".", es: ".", pt: ".", fr: " ",
};

/**
 * Groups an integer explicitly (no Intl locale data, so es/pt also group 4-digit numbers
 * and output is identical on every runtime). Figure numbers are whole baht.
 */
export function formatNumber(n: number, lang: FigureLang = "en"): string {
  const sign = n < 0 ? "-" : "";
  const digits = String(Math.round(Math.abs(n)));
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS[lang]);
}

export const formatBaht = (n: number, lang: FigureLang = "en") => `฿${formatNumber(n, lang)}`;

const BUILDERS: Record<FigureLang, (f: Fmt) => FigureDict> = { en, de, it, fr, es, pt };

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
