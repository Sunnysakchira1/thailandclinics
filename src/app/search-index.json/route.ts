import { getSearchRows, getCityClinicCount } from "@/lib/db/queries";
import { normalise } from "@/lib/search/normalise";
import { CATEGORY_LABELS } from "@/lib/search/vocab";
import { effectiveTier, isTopRated } from "@/lib/tiers";
import type { SearchIndex } from "@/lib/search/engine";

export const dynamic = "force-static";

const CITY_NAMES: Record<string, string> = { bangkok: "Bangkok", phuket: "Phuket", "chiang-mai": "Chiang Mai", pattaya: "Pattaya" };

export async function GET() {
  const rows = await getSearchRows();
  const clinics = rows.map(r => {
    const services: string[] = (() => { try { return JSON.parse(r.services ?? "[]"); } catch { return []; } })();
    const w = normalise([
      r.name, r.nameTh ?? "", r.district ?? "", r.brandName ?? "",
      CATEGORY_LABELS[r.categorySlug] ?? "", ...services.map(s => s.replace(/-/g, " ")), ...r.stations,
    ].join(" "));
    const url = r.brandSlug && r.branchSlug
      ? `/${r.citySlug}/${r.categorySlug}/${r.brandSlug}/${r.branchSlug}/`
      : `/${r.citySlug}/${r.categorySlug}/${r.slug}/`;
    return {
      id: r.id, n: r.name, u: url, c: r.citySlug, k: r.categorySlug, d: r.district,
      r: r.rating, v: r.reviews, t: effectiveTier(r.tier, r.brandTier), tr: isTopRated(r.topRated, r.brandTopRated),
      p: r.photoUrl, w: [...new Set(w.split(" "))].join(" "),
    };
  });
  const cities = await Promise.all(Object.keys(CITY_NAMES).map(async slug => ({ slug, name: CITY_NAMES[slug], count: await getCityClinicCount(slug) })));
  const body: SearchIndex = { v: 1, cities, clinics };
  return Response.json(body);
}
