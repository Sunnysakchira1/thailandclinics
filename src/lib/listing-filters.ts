/** Listing filter engine: pure, client-safe, no database imports. */
import { isOpenAt, isOpenOnDay, parseHours, type Clock, type HoursMap } from '@/lib/opening-hours';
import { SERVICE_LABELS, SERVICE_TAXONOMY } from '@/lib/service-taxonomy';

export interface StationLink { name: string; system: string; distanceM: number }

/** The attributes one physical clinic can be filtered on. */
export interface Filterable {
  district: string | null;
  services: string | null;
  englishSpeaking: boolean | null;
  nearBts: boolean | null;
  nearMrt: boolean | null;
  openWeekends: boolean | null;
  openLate: boolean | null;
  hasParking: boolean | null;
  wheelchairAccessible: boolean | null;
  acceptsCard: boolean | null;
  acceptsNfc: boolean | null;
  openingHours: string | null;
  freeParking: boolean;
  lgbtqFriendly: boolean;
  stations: StationLink[];
}

export interface FilterEntry extends Filterable {
  isBrand: boolean;
  branchCount?: number;
  googleRating: number | null;
  googleReviewsCount: number | null;
  topRated: boolean;
  branches?: Filterable[];
}

export interface FilterState { on: string[]; minRating: number | null; minReviews: number | null }
export const EMPTY_FILTERS: FilterState = { on: [], minRating: null, minReviews: null };

export interface Facet { raw: Filterable; services: string[]; hours: HoursMap | null }
export interface Prepared<T extends FilterEntry = FilterEntry> { entry: T; self: Facet; branches: Facet[] }

function parseServices(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function facetOf(raw: Filterable): Facet {
  return { raw, services: parseServices(raw.services), hours: parseHours(raw.openingHours) };
}

export function prepareEntries<T extends FilterEntry>(entries: T[]): Prepared<T>[] {
  return entries.map((entry) => ({ entry, self: facetOf(entry), branches: (entry.branches ?? []).map(facetOf) }));
}

/** Free parking and LGBTQ+ flags from the Google "about" JSON. */
export function amenitiesFromAbout(json: string | null): { freeParking: boolean; lgbtqFriendly: boolean } {
  const none = { freeParking: false, lgbtqFriendly: false };
  if (!json) return none;
  try {
    const about = JSON.parse(json) as Record<string, Record<string, unknown> | null>;
    if (!about || typeof about !== 'object') return none;
    const parking = about['Parking'] ?? {};
    return {
      freeParking: Object.entries(parking).some(([k, v]) => v === true && /^free/i.test(k)),
      lgbtqFriendly: Object.values(about).some((section) =>
        !!section && typeof section === 'object' && section['LGBTQ+ friendly'] === true),
    };
  } catch {
    return none;
  }
}

type Test = (f: Facet, clock: Clock | null) => boolean;

const TOGGLES: Record<string, { label: string; chip?: string; test: Test }> = {
  openNow:      { label: 'Open now', test: (f, c) => !!c && isOpenAt(f.hours, c) },
  openSunday:   { label: 'Open Sunday', test: (f) => isOpenOnDay(f.hours, 'Sunday') },
  openWeekends: { label: 'Open weekends', test: (f) => !!f.raw.openWeekends },
  openLate:     { label: 'Open late (after 8pm)', chip: 'Open late', test: (f) => !!f.raw.openLate },
  nearBts:      { label: 'BTS within 500 m', test: (f) => !!f.raw.nearBts },
  nearMrt:      { label: 'MRT within 500 m', test: (f) => !!f.raw.nearMrt },
  freeParking:  { label: 'Free parking', test: (f) => f.raw.freeParking },
  hasParking:   { label: 'Any parking', test: (f) => !!f.raw.hasParking },
  wheelchairAccessible: { label: 'Wheelchair access', test: (f) => !!f.raw.wheelchairAccessible },
  englishSpeaking: { label: 'English speaking', test: (f) => !!f.raw.englishSpeaking },
  acceptsCard:  { label: 'Accepts card', test: (f) => !!f.raw.acceptsCard },
  acceptsNfc:   { label: 'Mobile / NFC payment', chip: 'Mobile payment', test: (f) => !!f.raw.acceptsNfc },
  lgbtqFriendly: { label: 'LGBTQ+ friendly', test: (f) => f.raw.lgbtqFriendly },
};
export const TOP_RATED = 'topRated';

const stationId = (s: { system: string; name: string }) => `st:${s.system}|${s.name}`;

interface Compiled {
  tests: Test[]; services: string[]; stations: string[]; districts: string[];
  minRating: number | null; minReviews: number | null; topRated: boolean; hasAttr: boolean;
}

function compile(state: FilterState): Compiled {
  const tests: Test[] = []; const services: string[] = []; const stations: string[] = []; const districts: string[] = [];
  for (const id of state.on) {
    if (id.startsWith('svc:')) services.push(id.slice(4));
    else if (id.startsWith('st:')) stations.push(id);
    else if (id.startsWith('dist:')) districts.push(id.slice(5));
    else if (TOGGLES[id]) tests.push(TOGGLES[id].test);
  }
  return {
    tests, services, stations, districts,
    minRating: state.minRating, minReviews: state.minReviews, topRated: state.on.includes(TOP_RATED),
    hasAttr: tests.length + services.length + stations.length + districts.length > 0,
  };
}

function facetMatches(f: Facet, c: Compiled, clock: Clock | null): boolean {
  if (!c.tests.every((t) => t(f, clock))) return false;
  if (!c.services.every((s) => f.services.includes(s))) return false;
  if (c.districts.length && !(f.raw.district && c.districts.includes(f.raw.district))) return false;
  if (c.stations.length && !f.raw.stations.some((s) => c.stations.includes(stationId(s)))) return false;
  return true;
}

/** How many physical clinics this entry contributes under the filters (0 = hidden). */
function matchCount(p: Prepared, c: Compiled, clock: Clock | null): number {
  const { entry } = p;
  if (c.minRating !== null && (entry.googleRating ?? 0) < c.minRating) return 0;
  if (c.minReviews !== null && (entry.googleReviewsCount ?? 0) < c.minReviews) return 0;
  if (c.topRated && !entry.topRated) return 0;
  if (!entry.isBrand) return facetMatches(p.self, c, clock) ? 1 : 0;
  if (!c.hasAttr) return p.branches.length || entry.branchCount || 0;
  return p.branches.filter((b) => facetMatches(b, c, clock)).length;
}

export function applyFilters<T extends FilterEntry>(list: Prepared<T>[], state: FilterState, clock: Clock | null) {
  const c = compile(state);
  const entries: Prepared<T>[] = [];
  let clinics = 0;
  for (const p of list) {
    const n = matchCount(p, c, clock);
    if (n > 0) { entries.push(p); clinics += n; }
  }
  return { entries, clinics };
}

export function countClinics(list: Prepared[], state: FilterState, clock: Clock | null): number {
  const c = compile(state);
  return list.reduce((sum, p) => sum + matchCount(p, c, clock), 0);
}

const orPrefix = (id: string) => ['st:', 'dist:'].find((p) => id.startsWith(p));

/** The state you'd be looking at if this option were the one you added. */
export function stateWith(state: FilterState, id: string): FilterState {
  const p = orPrefix(id);
  const rest = p ? state.on.filter((x) => !x.startsWith(p)) : state.on.filter((x) => x !== id);
  return { ...state, on: [...rest, id] };
}

export function toggleFilter(state: FilterState, id: string): FilterState {
  return { ...state, on: state.on.includes(id) ? state.on.filter((x) => x !== id) : [...state.on, id] };
}

export const activeFilterCount = (s: FilterState) => s.on.length + (s.minRating !== null ? 1 : 0) + (s.minReviews !== null ? 1 : 0);

export interface FilterOption { id: string; label: string; system?: string }
export interface FilterSections {
  hours: FilterOption[]; stations: FilterOption[]; access: FilterOption[];
  practical: FilterOption[]; services: FilterOption[]; districts: FilterOption[]; hasTopRated: boolean;
}

export const RATING_OPTIONS = [{ value: 4.5, label: '4.5 & up' }, { value: 4, label: '4.0 & up' }, { value: 3, label: '3.0 & up' }];
export const REVIEW_OPTIONS = [{ value: 100, label: '100+ reviews' }, { value: 500, label: '500+ reviews' }, { value: 1000, label: '1,000+ reviews' }];

const allFacets = (list: Prepared[]) => list.flatMap((p) => (p.entry.isBrand ? p.branches : [p.self]));

export function buildSections(list: Prepared[], catSlug: string): FilterSections {
  const facets = allFacets(list);
  const toggles = (ids: string[]) => ids
    .filter((id) => (id === 'openNow' ? facets.some((f) => f.hours) : facets.some((f) => TOGGLES[id].test(f, null))))
    .map((id) => ({ id, label: TOGGLES[id].label }));

  const stationCounts = new Map<string, { n: number; system: string; name: string }>();
  const districtCounts = new Map<string, number>();
  for (const f of facets) {
    for (const s of f.raw.stations) {
      const id = stationId(s);
      stationCounts.set(id, { n: (stationCounts.get(id)?.n ?? 0) + 1, system: s.system, name: s.name });
    }
    if (f.raw.district) districtCounts.set(f.raw.district, (districtCounts.get(f.raw.district) ?? 0) + 1);
  }

  return {
    hours: toggles(['openNow', 'openSunday', 'openWeekends', 'openLate']),
    stations: [...stationCounts.entries()]
      .sort((a, b) => b[1].n - a[1].n || a[1].name.localeCompare(b[1].name))
      .map(([id, s]) => ({ id, label: s.name, system: s.system })),
    access: toggles(['nearBts', 'nearMrt', 'freeParking', 'hasParking', 'wheelchairAccessible']),
    practical: toggles(['englishSpeaking', 'acceptsCard', 'acceptsNfc', 'lgbtqFriendly']),
    services: (SERVICE_TAXONOMY[catSlug] ?? [])
      .filter((s) => facets.some((f) => f.services.includes(s)))
      .map((s) => ({ id: `svc:${s}`, label: SERVICE_LABELS[s] ?? s })),
    districts: [...districtCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([d]) => ({ id: `dist:${d}`, label: d })),
    hasTopRated: list.some((p) => p.entry.topRated),
  };
}

export function chipLabel(id: string): string {
  if (id === TOP_RATED) return 'Top rated';
  if (id.startsWith('svc:')) return SERVICE_LABELS[id.slice(4)] ?? id.slice(4);
  if (id.startsWith('dist:')) return id.slice(5);
  if (id.startsWith('st:')) return id.slice(3).replace('|', ' ');
  return TOGGLES[id]?.chip ?? TOGGLES[id]?.label ?? id;
}
