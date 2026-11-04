import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { calculateReadTime, type PostFrontmatter } from "@/lib/mdx";

/**
 * Translated blog posts. Files live in content/blog-i18n/<lang>/<englishSlug>.mdx.
 * Frontmatter = the English keys plus `slug` (the localised URL slug).
 * URL: /<lang>/blog/<slug>/  · hreflang ties each translation to /blog/<englishSlug>/.
 */
export const LANGS = ["de", "it", "fr", "es", "pt"] as const;
export type Lang = (typeof LANGS)[number];

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

export const UI: Record<Lang, { home: string; blog: string; updated: string; published: string; by: string; browse: (cat: string) => string; readIn: string; cats: Record<string, string> }> = {
  de: { home: "Startseite", blog: "Ratgeber", updated: "Aktualisiert", published: "Veröffentlicht", by: "Von ThailandClinics", browse: (c) => `Alle geprüften ${c} in Bangkok vergleichen →`, readIn: "Auf Englisch lesen", cats: { fertility: "Kinderwunschkliniken", physiotherapy: "Physiotherapie-Praxen" } },
  it: { home: "Home", blog: "Guide", updated: "Aggiornato", published: "Pubblicato", by: "Di ThailandClinics", browse: (c) => `Confronta tutte le ${c} verificate a Bangkok →`, readIn: "Leggi in inglese", cats: { fertility: "cliniche della fertilità", physiotherapy: "cliniche di fisioterapia" } },
  fr: { home: "Accueil", blog: "Guides", updated: "Mis à jour", published: "Publié", by: "Par ThailandClinics", browse: (c) => `Comparer toutes les ${c} vérifiées à Bangkok →`, readIn: "Lire en anglais", cats: { fertility: "cliniques de fertilité", physiotherapy: "cliniques de kinésithérapie" } },
  es: { home: "Inicio", blog: "Guías", updated: "Actualizado", published: "Publicado", by: "Por ThailandClinics", browse: (c) => `Compara todas las ${c} verificadas en Bangkok →`, readIn: "Leer en inglés", cats: { fertility: "clínicas de fertilidad", physiotherapy: "clínicas de fisioterapia" } },
  pt: { home: "Início", blog: "Guias", updated: "Atualizado", published: "Publicado", by: "Por ThailandClinics", browse: (c) => `Compare todas as ${c} verificadas em Bangkok →`, readIn: "Ler em inglês", cats: { fertility: "clínicas de fertilidade", physiotherapy: "clínicas de fisioterapia" } },
};

const LOCALE: Record<Lang, string> = { de: "de-DE", it: "it-IT", fr: "fr-FR", es: "es-ES", pt: "pt-BR" };
export function formatLocalDate(lang: Lang, d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString(LOCALE[lang], { day: "numeric", month: "long", year: "numeric" });
}
