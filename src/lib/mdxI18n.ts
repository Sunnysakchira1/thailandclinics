import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { calculateReadTime, type PostFrontmatter } from "@/lib/mdx";

/**
 * Translated blog posts. Files live in content/blog-i18n/<lang>/<englishSlug>.mdx.
 * Frontmatter = the English keys plus `slug` (the localised URL slug).
 * URL: /<lang>/blog/<slug>/  · hreflang ties each translation to /blog/<englishSlug>/.
 */
export const LANGS = ["de", "it", "fr", "es", "pt", "zh", "ar"] as const;
export type Lang = (typeof LANGS)[number];

/** hreflang / <html lang> code per URL language. Chinese pages are Simplified Chinese. */
export const HREFLANG: Record<"en" | Lang, string> = { en: "en", de: "de", it: "it", fr: "fr", es: "es", pt: "pt", zh: "zh-Hans", ar: "ar" };
export const RTL_LANGS: readonly Lang[] = ["ar"];

/** getAlternates() keyed by hreflang code, for <link rel="alternate" hreflang>. */
export function getHreflangAlternates(enSlug: string): Record<string, string> {
  const alt = getAlternates(enSlug);
  return Object.fromEntries(Object.entries(alt).map(([k, v]) => [k === "x-default" ? k : HREFLANG[k as "en" | Lang], v]));
}

const I18N_DIR = path.join(process.cwd(), "content/blog-i18n");

export type LocalizedPost = PostFrontmatter & {
  lang: Lang;
  slug: string;       // localised slug
  enSlug: string;     // English post slug (file name)
  content: string;
  readTime: string;
};

function read(lang: Lang, file: string): LocalizedPost {
  const raw = fs.readFileSync(path.join(I18N_DIR, lang, file), "utf-8");
  const { data, content } = matter(raw);
  const enSlug = file.replace(/\.mdx$/, "");
  return { ...(data as PostFrontmatter & { slug?: string }), lang, slug: (data.slug as string) || enSlug, enSlug, content, readTime: calculateReadTime(content) } as LocalizedPost;
}

export function getLocalizedPosts(lang: Lang): LocalizedPost[] {
  const dir = path.join(I18N_DIR, lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).map((f) => read(lang, f));
}

export function getLocalizedPost(lang: Lang, slug: string): LocalizedPost | null {
  return getLocalizedPosts(lang).find((p) => p.slug === slug) ?? null;
}

/** hreflang map for an English post: { en: "/blog/x/", de: "/de/blog/y/", ... } (only languages that exist). */
export function getAlternates(enSlug: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of LANGS) {
    const p = getLocalizedPosts(lang).find((x) => x.enSlug === enSlug);
    if (p) out[lang] = `/${lang}/blog/${p.slug}/`;
  }
  if (Object.keys(out).length === 0) return {};
  return { en: `/blog/${enSlug}/`, ...out, "x-default": `/blog/${enSlug}/` };
}

/** Every language version of an English post, English first, for the visible language switcher.
 *  Same set as the hreflang map (minus x-default), so the links and the tags can't drift apart. */
export type LanguageVersion = { lang: "en" | Lang; href: string; name: string };
export const LANG_NAMES: Record<"en" | Lang, string> = { en: "English", de: "Deutsch", it: "Italiano", fr: "Français", es: "Español", pt: "Português", zh: "中文", ar: "العربية" };
export function getLanguageVersions(enSlug: string): LanguageVersion[] {
  const alt = getAlternates(enSlug);
  return (["en", ...LANGS] as const).filter((l) => alt[l]).map((l) => ({ lang: l, href: alt[l], name: LANG_NAMES[l] }));
}

export const UI: Record<Lang, { home: string; blog: string; updated: string; published: string; by: string; browse: (cat: string, city: string) => string; readIn: string; language: string; cats: Record<string, string> }> = {
  de: { home: "Startseite", blog: "Ratgeber", updated: "Aktualisiert", published: "Veröffentlicht", by: "Von ThailandClinics", browse: (c, city) => `Alle geprüften ${c} in ${city} vergleichen →`, readIn: "Auf Englisch lesen", language: "Sprache",
    cats: { fertility: "Kinderwunschkliniken", physiotherapy: "Physiotherapie-Praxen", cosmetic: "Schönheitskliniken", dental: "Zahnkliniken", wellness: "Wellness-Zentren" } },
  it: { home: "Home", blog: "Guide", updated: "Aggiornato", published: "Pubblicato", by: "Di ThailandClinics", browse: (c, city) => `Confronta tutte le ${c} verificate a ${city} →`, readIn: "Leggi in inglese", language: "Lingua",
    cats: { fertility: "cliniche della fertilità", physiotherapy: "cliniche di fisioterapia", cosmetic: "cliniche di medicina estetica", dental: "cliniche dentali", wellness: "strutture wellness" } },
  fr: { home: "Accueil", blog: "Guides", updated: "Mis à jour", published: "Publié", by: "Par ThailandClinics", browse: (c, city) => `Comparer toutes les ${c} vérifiées à ${city} →`, readIn: "Lire en anglais", language: "Langue",
    cats: { fertility: "cliniques de fertilité", physiotherapy: "cliniques de kinésithérapie", cosmetic: "cliniques esthétiques", dental: "cliniques dentaires", wellness: "adresses bien-être" } },
  es: { home: "Inicio", blog: "Guías", updated: "Actualizado", published: "Publicado", by: "Por ThailandClinics", browse: (c, city) => `Compara todas las ${c} verificadas en ${city} →`, readIn: "Leer en inglés", language: "Idioma",
    cats: { fertility: "clínicas de fertilidad", physiotherapy: "clínicas de fisioterapia", cosmetic: "clínicas estéticas", dental: "clínicas dentales", wellness: "clínicas de bienestar" } },
  pt: { home: "Início", blog: "Guias", updated: "Atualizado", published: "Publicado", by: "Por ThailandClinics", browse: (c, city) => `Compare todas as ${c} verificadas em ${city} →`, readIn: "Ler em inglês", language: "Idioma",
    cats: { fertility: "clínicas de fertilidade", physiotherapy: "clínicas de fisioterapia", cosmetic: "clínicas estéticas", dental: "clínicas odontológicas", wellness: "clínicas de bem-estar" } },
  zh: { home: "首页", blog: "指南", updated: "更新于", published: "发布于", by: "ThailandClinics 编辑部", browse: (c, city) => `比较${city}所有经过核实的${c} →`, readIn: "阅读英文版", language: "语言",
    cats: { fertility: "生殖中心", physiotherapy: "物理治疗诊所", cosmetic: "医美诊所", dental: "牙科诊所", wellness: "健康养生诊所" } },
  ar: { home: "الرئيسية", blog: "الأدلة", updated: "آخر تحديث", published: "تاريخ النشر", by: "بقلم ThailandClinics", browse: (c, city) => `قارن جميع ${c} الموثّقة في ${city} ←`, readIn: "اقرأ بالإنجليزية", language: "اللغة",
    cats: { fertility: "عيادات الخصوبة", physiotherapy: "عيادات العلاج الطبيعي", cosmetic: "عيادات التجميل", dental: "عيادات الأسنان", wellness: "عيادات العافية" } },
};

const LOCALE: Record<Lang, string> = { de: "de-DE", it: "it-IT", fr: "fr-FR", es: "es-ES", pt: "pt-BR", zh: "zh-CN", ar: "ar-u-nu-latn" };
export function formatLocalDate(lang: Lang, d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString(LOCALE[lang], { day: "numeric", month: "long", year: "numeric" });
}
