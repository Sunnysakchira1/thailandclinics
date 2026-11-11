import { describe, expect, it } from 'vitest';
import {
  amenitiesFromAbout, applyFilters, buildSections, chipLabel, countClinics, EMPTY_FILTERS, prepareEntries,
  stateWith, toggleFilter, type FilterEntry, type Filterable,
} from './listing-filters';

const base: Filterable = {
  district: 'Watthana', services: '["back-spine"]', englishSpeaking: false, nearBts: false, nearMrt: false,
  openWeekends: false, openLate: false, hasParking: false, wheelchairAccessible: false, acceptsCard: false,
  acceptsNfc: false, openingHours: null, freeParking: false, lgbtqFriendly: false, stations: [],
};
const clinic = (o: Partial<FilterEntry> = {}): FilterEntry => ({
  ...base, isBrand: false, googleRating: 4.8, googleReviewsCount: 200, topRated: false, ...o,
});
const asok = { name: 'Asok', system: 'BTS', distanceM: 300 };
const phrom = { name: 'Phrom Phong', system: 'BTS', distanceM: 400 };
const on = (...ids: string[]) => ({ ...EMPTY_FILTERS, on: ids });
const monday10 = { day: 'Monday', minutes: 600 };

describe('applyFilters', () => {
  const list = prepareEntries([
    clinic({ stations: [asok], englishSpeaking: true }),
    clinic({ stations: [phrom], district: 'Bang Na' }),
    clinic({ googleRating: 4.2, googleReviewsCount: 20 }),
  ]);
  it('returns everything with no filters', () => {
    expect(applyFilters(list, EMPTY_FILTERS, null).clinics).toBe(3);
  });
  it('ORs stations', () => {
    expect(applyFilters(list, on('st:BTS|Asok', 'st:BTS|Phrom Phong'), null).clinics).toBe(2);
  });
  it('ANDs across groups', () => {
    expect(applyFilters(list, on('st:BTS|Asok', 'dist:Bang Na'), null).clinics).toBe(0);
    expect(applyFilters(list, on('st:BTS|Asok', 'englishSpeaking'), null).clinics).toBe(1);
  });
  it('applies rating and review thresholds', () => {
    expect(applyFilters(list, { ...EMPTY_FILTERS, minRating: 4.5 }, null).clinics).toBe(2);
    expect(applyFilters(list, { ...EMPTY_FILTERS, minReviews: 100 }, null).clinics).toBe(2);
  });
  it('requires every selected service', () => {
    const l = prepareEntries([clinic({ services: '["a","b"]' }), clinic({ services: '["a"]' }), clinic({ services: 'bad' })]);
    expect(applyFilters(l, on('svc:a', 'svc:b'), null).clinics).toBe(1);
  });
  it('open now uses the clock, and matches nothing without one', () => {
    const l = prepareEntries([clinic({ openingHours: '{"Monday":"9AM-5PM"}' }), clinic({ openingHours: '{"Monday":"Closed"}' }), clinic()]);
    expect(applyFilters(l, on('openNow'), monday10).clinics).toBe(1);
    expect(applyFilters(l, on('openNow'), null).clinics).toBe(0);
  });
});

describe('brands', () => {
  const brand = clinic({
    isBrand: true, district: null, services: null, branchCount: 3, topRated: true,
    branches: [
      { ...base, stations: [asok], englishSpeaking: true },
      { ...base, stations: [asok] },
      { ...base, stations: [phrom], englishSpeaking: true },
    ],
  });
  const list = prepareEntries([brand]);
  it('counts all branches when unfiltered', () => {
    expect(applyFilters(list, EMPTY_FILTERS, null).clinics).toBe(3);
  });
  it('counts only matching branches', () => {
    expect(applyFilters(list, on('st:BTS|Asok'), null).clinics).toBe(2);
  });
  it('needs one branch to satisfy every filter at once', () => {
    expect(applyFilters(list, on('st:BTS|Phrom Phong', 'englishSpeaking'), null).clinics).toBe(1);
    expect(applyFilters(list, on('st:BTS|Phrom Phong', 'wheelchairAccessible'), null).entries).toHaveLength(0);
  });
  it('checks Top rated on the brand', () => {
    expect(applyFilters(list, on('topRated'), null).clinics).toBe(3);
  });
  it('still shows a brand whose branches failed to load', () => {
    const l = prepareEntries([{ ...brand, branches: [] }]);
    expect(applyFilters(l, EMPTY_FILTERS, null).clinics).toBe(3);
  });
});

describe('stateWith', () => {
  it('previews an OR option on its own, so counts do not stack', () => {
    expect(stateWith(on('st:BTS|Asok', 'nearMrt'), 'st:BTS|Siam').on.sort()).toEqual(['nearMrt', 'st:BTS|Siam']);
  });
  it('previews an AND option on top of the rest', () => {
    expect(stateWith(on('nearMrt'), 'openLate').on).toEqual(['nearMrt', 'openLate']);
  });
  it('gives the count a visitor actually lands on', () => {
    const list = prepareEntries([clinic({ stations: [asok] }), clinic({ stations: [phrom] })]);
    const state = on('st:BTS|Asok');
    expect(countClinics(list, stateWith(state, 'st:BTS|Phrom Phong'), null)).toBe(1);
  });
  it('toggleFilter adds and removes', () => {
    expect(toggleFilter(toggleFilter(EMPTY_FILTERS, 'x'), 'x').on).toEqual([]);
  });
});

describe('buildSections', () => {
  it('omits stations outside Bangkok-style data and empty toggles', () => {
    const s = buildSections(prepareEntries([clinic()]), 'physiotherapy-clinics');
    expect(s.stations).toEqual([]);
    expect(s.access).toEqual([]);
    expect(s.hours).toEqual([]);
    expect(s.hasTopRated).toBe(false);
  });
  it('sorts stations by clinics served, including branches', () => {
    const list = prepareEntries([
      clinic({ stations: [phrom] }),
      clinic({ isBrand: true, branches: [{ ...base, stations: [asok] }, { ...base, stations: [asok] }] }),
    ]);
    expect(buildSections(list, 'x').stations.map((o) => o.label)).toEqual(['Asok', 'Phrom Phong']);
  });
  it('offers Open now whenever hours exist', () => {
    const s = buildSections(prepareEntries([clinic({ openingHours: '{"Monday":"9AM-5PM"}' })]), 'x');
    expect(s.hours.map((o) => o.id)).toContain('openNow');
  });
});

describe('labels and amenities', () => {
  it('chipLabel', () => {
    expect(chipLabel('st:BTS|Asok')).toBe('BTS Asok');
    expect(chipLabel('dist:Bang Na')).toBe('Bang Na');
    expect(chipLabel('acceptsNfc')).toBe('Mobile payment');
    expect(chipLabel('topRated')).toBe('Top rated');
  });
  it('amenitiesFromAbout reads Google sections', () => {
    expect(amenitiesFromAbout('{"Parking":{"Free parking lot":true},"Crowd":{"LGBTQ+ friendly":true}}'))
      .toEqual({ freeParking: true, lgbtqFriendly: true });
    expect(amenitiesFromAbout('{"Parking":{"Paid parking lot":true,"Free parking lot":false}}'))
      .toEqual({ freeParking: false, lgbtqFriendly: false });
    expect(amenitiesFromAbout('nope')).toEqual({ freeParking: false, lgbtqFriendly: false });
    expect(amenitiesFromAbout(null)).toEqual({ freeParking: false, lgbtqFriendly: false });
  });
});
