import type { Tier } from "@/lib/tiers";
import { tierRank } from "@/lib/tiers";
import { normalise, words, isThai } from "./normalise";
import { TREATMENTS, CATEGORY_LABELS } from "./vocab";

export type SearchClinic = { id: number; n: string; u: string; c: string; k: string; d: string | null; r: number | null; v: number | null; t: Tier; tr: boolean; p: string | null; w: string };
export type SearchIndex = { v: 1; cities: { slug: string; name: string; count: number }[]; clinics: SearchClinic[] };
type Link = { label: string; url: string; sub: string };
export type SearchResults = { treatments: Link[]; clinics: SearchClinic[]; categories: Link[] };

const LIMITS = { clinics: 6, treatments: 3, categories: 2 };

function editsAtMostOne(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
  }
  return edits + (la - i) + (lb - j) <= 1;
}

/** 2 = prefix (or Thai substring), 1 = one-typo prefix, 0 = no match. */
export function wordHit(q: string, w: string): 0 | 1 | 2 {
  if (w.startsWith(q)) return 2;
  if (isThai(q) && w.includes(q)) return 2;
  if (q.length >= 5) {
    for (const L of [q.length - 1, q.length, q.length + 1]) {
      if (L > 0 && L <= w.length && editsAtMostOne(q, w.slice(0, L))) return 1;
    }
  }
  return 0;
}

const cache = new WeakMap<SearchClinic, string[]>();
const tokens = (c: SearchClinic) => { let t = cache.get(c); if (!t) { t = c.w.split(" "); cache.set(c, t); } return t; };

function allWordsHit(qs: string[], ws: string[]): number {
  let total = 0;
  for (const q of qs) {
    let best = 0;
    for (const w of ws) { const h = wordHit(q, w); if (h > best) best = h; if (best === 2) break; }
    if (!best) return 0;
    total += best;
  }
  return total;
}

const weighted = (c: SearchClinic) => { const r = c.r ?? 0, v = c.v ?? 0; return (v / (v + 50)) * r + (50 / (v + 50)) * 4.3; };

export function search(index: SearchIndex, query: string, city: string | ""): SearchResults {
  const q = normalise(query);
  const qs = words(query);
  const empty = { treatments: [], clinics: [], categories: [] };
  if (!qs.length) return empty;
  const linkCity = city || "bangkok";
  const cityName = index.cities.find(x => x.slug === linkCity)?.name ?? "Bangkok";

  const treatments = TREATMENTS.filter(t => {
    const ws = [...words(t.label), ...t.terms.flatMap(words)];
    return allWordsHit(qs, ws) > 0;
  }).slice(0, LIMITS.treatments).map(t => ({ label: t.label, url: `/${linkCity}/${t.category}/`, sub: `${CATEGORY_LABELS[t.category]} clinics in ${cityName}` }));

  const categories = Object.entries(CATEGORY_LABELS).filter(([slug, label]) => allWordsHit(qs, [...words(label), ...words(slug)]) > 0)
    .slice(0, LIMITS.categories).map(([slug, label]) => ({ label: `${label} clinics`, url: `/${linkCity}/${slug}/`, sub: `in ${cityName}` }));

  const scored: { c: SearchClinic; band: number; hit: number }[] = [];
  for (const c of index.clinics) {
    if (city && c.c !== city) continue;
    const hit = allWordsHit(qs, tokens(c));
    if (!hit) continue;
    const name = normalise(c.n);
    const band = name === q ? 3 : name.startsWith(q) ? 2 : 1;
    scored.push({ c, band, hit });
  }
  scored.sort((a, b) => b.band - a.band || tierRank(b.c.t) - tierRank(a.c.t) || b.hit - a.hit || weighted(b.c) - weighted(a.c));
  return { treatments, clinics: scored.slice(0, LIMITS.clinics).map(s => s.c), categories };
}
