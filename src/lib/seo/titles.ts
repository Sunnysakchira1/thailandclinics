/**
 * Clinic / brand-hub <title> builder.
 *
 * Format (2026-09): "[Clinic] [City] — Reviews, Treatments & Hours | ThailandClinics"
 * Chosen from GSC: clinic pages mostly rank for the clinic's own name plus
 * "reviews", "price list", "services", "location". The title now says we
 * answer those. "Prices" is deliberately absent until we hold price data.
 *
 * Titles target the CLAUDE.md 55-62 char window: candidates run longest →
 * shortest and the first one that fits ≤ 62 wins.
 */

const MAX = 62;
const SUFFIX = " | ThailandClinics";

/** Hand-set labels where name + district still collide (same chain, same district). */
const LABEL_OVERRIDES: Record<string, string> = {
  "flex-rehab-clinic-bangkok-4": "Flex Rehab Clinic Sai Yud",
  "flex-rehab-clinic-bangkok-5": "Flex Rehab Clinic Thep Rak",
  "flex-rehab-clinic-bangkok-6": "Flex Rehab Clinic Ratchayothin",
  "flex-rehab-clinic-bangkok-7": "Flex Rehab Clinic Major Ratchayothin",
};

function joinFacets(f: string[]): string {
  return f.length <= 1 ? f.join("") : `${f.slice(0, -1).join(", ")} & ${f.at(-1)}`;
}

function truncateWords(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max + 1);
  const i = cut.lastIndexOf(" ");
  return (i > 10 ? cut.slice(0, i) : s.slice(0, max)).replace(/[\s,–—:-]+$/, "");
}

function pick(cands: string[], fallbackName: string, tail: string): string {
  const hit = cands.find((c) => c.length <= MAX);
  return hit ?? `${truncateWords(fallbackName, MAX - tail.length)}${tail}`;
}

export function clinicTitle(opts: {
  slug: string;
  name: string;
  city: string;
  district: string | null;
  hasServices: boolean;
  hasHours: boolean;
  /** true when another clinic in the city shares this display name */
  duplicateName: boolean;
}): string {
  const { slug, name, city, district, hasServices, hasHours, duplicateName } = opts;

  let label = LABEL_OVERRIDES[slug] ?? name;
  if (!LABEL_OVERRIDES[slug] && duplicateName && district && !name.toLowerCase().includes(district.toLowerCase())) {
    label = `${name} ${district}`;
  }

  const hasCity = label.toLowerCase().includes(city.toLowerCase());
  const withCity = hasCity ? label : `${label} ${city}`;
  const full = joinFacets(["Reviews", hasServices && "Treatments", hasHours && "Hours"].filter(Boolean) as string[]);
  const mid = joinFacets(["Reviews", hasServices ? "Treatments" : hasHours ? "Hours" : null].filter(Boolean) as string[]);
  const withDistrict = district && !label.toLowerCase().includes(district.toLowerCase()) && !hasCity
    ? `${label}, ${district}, ${city}` : null;

  // What the page offers ("Treatments", "Hours") matches the query modifiers
  // and outranks the site-name suffix, which Google already shows above the
  // title. So facets are dropped last, the suffix first.
  return pick([
    withDistrict && `${withDistrict} — ${full}${SUFFIX}`,
    `${withCity} — ${full}${SUFFIX}`,
    `${label} — ${full}${SUFFIX}`,
    `${withCity} — ${mid}${SUFFIX}`,
    `${label} — ${mid}${SUFFIX}`,
    `${withCity} — ${full}`,
    `${label} — ${full}`,
    `${label} — ${mid}`,
    `${label} — Reviews${SUFFIX}`,
    `${label} — Reviews`,
  ].filter(Boolean) as string[], label, " — Reviews");
}

export function brandHubTitle(opts: { name: string; city: string; branchCount: number | null }): string {
  const { name, city, branchCount } = opts;
  const withCity = name.toLowerCase().includes(city.toLowerCase()) ? name : `${name} ${city}`;
  const n = branchCount && branchCount > 1 ? `${branchCount} Branches` : "Branches";
  return pick([
    `${withCity} — ${n}, Reviews & Hours${SUFFIX}`,
    `${name} — ${n}, Reviews & Hours${SUFFIX}`,
    `${withCity} — ${n} & Reviews${SUFFIX}`,
    `${name} — ${n} & Reviews${SUFFIX}`,
    `${withCity} — ${n}, Reviews & Hours`,
    `${name} — ${n}, Reviews & Hours`,
    `${name} — ${n} & Reviews`,
  ], name, ` — ${n}`);
}
