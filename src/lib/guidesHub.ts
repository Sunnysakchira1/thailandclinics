/**
 * /guides/ editorial hub — pure data shaping.
 *
 * Takes every blog post (content/blog/*.mdx frontmatter) plus the programmatic
 * "How to choose a {noun} in {city}" guide combos and groups them by city, then
 * specialty. No fs / db access here so it can be unit-tested directly.
 */
import { GUIDE_CATEGORIES, GUIDE_CITIES, GUIDES_UPDATED_AT, guideSlug } from "./guides";

export type HubPostInput = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  city: string;
  type?: string;
};

export type HubComboInput = { citySlug: string; categorySlug: string; count: number };

export type HubItemKind = "Guide" | "Best of" | "Comparison" | "Checklist";

export type HubItem = {
  key: string;            // unique: blog slug or guide slug
  source: "blog" | "guide";
  href: string;
  title: string;
  description: string;
  updatedAt: string;      // YYYY-MM-DD
  kind: HubItemKind;
};

export type HubSpecialty = { slug: string; label: string; items: HubItem[] };
export type HubCity = { slug: string; name: string; specialties: HubSpecialty[] };
export type GuidesHub = { latest: HubItem[]; cities: HubCity[] };

/** Post frontmatter category → specialty key (matches GUIDE_CATEGORIES keys). */
const POST_CATEGORY_TO_SPECIALTY: Record<string, string> = {
  physiotherapy: "physiotherapy-clinics",
  dental:        "dental-clinics",
  cosmetic:      "cosmetic-clinics",
  wellness:      "wellness-clinics",
  fertility:     "fertility-clinics",
  ivf:           "fertility-clinics",
  "expat-guide": "general",
};

export const SPECIALTY_ORDER: { slug: string; label: string }[] = [
  { slug: "physiotherapy-clinics", label: "Physiotherapy" },
  { slug: "dental-clinics",        label: "Dental" },
  { slug: "cosmetic-clinics",      label: "Cosmetic" },
  { slug: "wellness-clinics",      label: "Wellness" },
  { slug: "fertility-clinics",     label: "IVF & fertility" },
  { slug: "general",               label: "Healthcare in Thailand" },
];

const CITY_NAMES: Record<string, string> = {
  bangkok: "Bangkok", phuket: "Phuket", "chiang-mai": "Chiang Mai",
  pattaya: "Pattaya", "koh-samui": "Koh Samui", thailand: "Across Thailand",
};
const CITY_ORDER = ["bangkok", "phuket", "chiang-mai", "pattaya", "koh-samui"];

export function specialtyForPost(category: string): string {
  return POST_CATEGORY_TO_SPECIALTY[category] ?? (category.endsWith("-clinics") ? category : "general");
}

export function cityName(slug: string): string {
  return CITY_NAMES[slug] ?? GUIDE_CITIES[slug]?.name
    ?? slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

/** Eyebrow label: frontmatter type first, then title heuristics. */
export function postKind(p: Pick<HubPostInput, "title" | "type">): HubItemKind {
  if (p.type === "pillar" || p.type === "guide") return "Guide";
  if (p.type === "best-of") return "Best of";
  const t = p.title.toLowerCase();
  if (/complete expat guide/.test(t)) return "Guide";
  if (/checklist|\bchecks?\b/.test(t)) return "Checklist";
  if (/comparison|\bcompare\b|\bvs\.?\b/.test(t)) return "Comparison";
  if (/\bbest\b|\branked\b|\btop \d+/.test(t)) return "Best of";
  return "Guide";
}

const isPillar = (p: HubPostInput) => p.type === "pillar" || /complete expat guide/i.test(p.title);
const postDate = (p: HubPostInput) => p.updatedAt || p.publishedAt;

/** Trim to a sensible one-liner, cutting at a word boundary. */
export function oneLine(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:—–-]$/, "") + "…";
}

function postToItem(p: HubPostInput): HubItem {
  return {
    key: p.slug, source: "blog", href: `/blog/${p.slug}/`,
    title: p.title, description: oneLine(p.description),
    updatedAt: postDate(p), kind: postKind(p),
  };
}

/** Combos that get a "How to choose" guide page — same filter as the route. */
export function eligibleCombos(combos: HubComboInput[]): HubComboInput[] {
  return combos.filter((c) => GUIDE_CATEGORIES[c.categorySlug] && GUIDE_CITIES[c.citySlug] && c.count >= 5);
}

function comboToItem(c: HubComboInput): HubItem {
  const cat = GUIDE_CATEGORIES[c.categorySlug];
  const city = GUIDE_CITIES[c.citySlug];
  const slug = guideSlug(c.citySlug, c.categorySlug);
  return {
    key: slug, source: "guide", href: `/guides/${slug}/`,
    title: `How to choose a ${cat.noun} in ${city.name}`,
    description: `What to check, what treatment costs, the red flags to avoid and a shortlist from ${c.count} ${cat.nounPlural} we track in ${city.name}.`,
    updatedAt: GUIDES_UPDATED_AT, kind: "Guide",
  };
}

const newestFirst = (a: HubItem, b: HubItem) =>
  b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title);

export function buildGuidesHub(posts: HubPostInput[], combos: HubComboInput[]): GuidesHub {
  // city → specialty → { pillars, others, guides }
  type Bucket = { pillars: HubItem[]; others: HubItem[]; guides: HubItem[] };
  const tree = new Map<string, Map<string, Bucket>>();
  const bucket = (city: string, spec: string): Bucket => {
    if (!tree.has(city)) tree.set(city, new Map());
    const m = tree.get(city)!;
    if (!m.has(spec)) m.set(spec, { pillars: [], others: [], guides: [] });
    return m.get(spec)!;
  };

  for (const p of posts) {
    const b = bucket(p.city || "thailand", specialtyForPost(p.category));
    (isPillar(p) ? b.pillars : b.others).push(postToItem(p));
  }
  for (const c of eligibleCombos(combos)) {
    bucket(c.citySlug, c.categorySlug).guides.push(comboToItem(c));
  }

  const cityRank = (s: string) => {
    if (s === "thailand") return 1000;
    const i = CITY_ORDER.indexOf(s);
    return i === -1 ? 500 : i;
  };
  const specRank = (s: string) => {
    const i = SPECIALTY_ORDER.findIndex((o) => o.slug === s);
    return i === -1 ? 500 : i;
  };

  const cities: HubCity[] = [...tree.entries()]
    .sort(([a], [b]) => cityRank(a) - cityRank(b) || a.localeCompare(b))
    .map(([citySlug, specs]) => ({
      slug: citySlug,
      name: cityName(citySlug),
      specialties: [...specs.entries()]
        .sort(([a], [b]) => specRank(a) - specRank(b) || a.localeCompare(b))
        .map(([specSlug, b]) => ({
          slug: specSlug,
          label: SPECIALTY_ORDER.find((o) => o.slug === specSlug)?.label ?? GUIDE_CATEGORIES[specSlug]?.short ?? specSlug,
          items: [...b.pillars.sort(newestFirst), ...b.others.sort(newestFirst), ...b.guides],
        })),
    }));

  const latest = posts
    .map(postToItem)
    .sort((a, b) => {
      const pa = posts.find((p) => p.slug === a.key)!;
      const pb = posts.find((p) => p.slug === b.key)!;
      return b.updatedAt.localeCompare(a.updatedAt) || pb.publishedAt.localeCompare(pa.publishedAt) || a.title.localeCompare(b.title);
    })
    .slice(0, 3);

  return { latest, cities };
}

/** Flat list of every item in the city sections (for checks/tests). */
export function hubItems(hub: GuidesHub): HubItem[] {
  return hub.cities.flatMap((c) => c.specialties.flatMap((s) => s.items));
}
