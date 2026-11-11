import { describe, expect, it } from 'vitest';
import { addToList, COMPARE_TTL_MS, MAX_COMPARE, sanitiseStored, type CompareItem } from './compare';

const item = (id: number, catSlug = 'dental-clinics', savedAt = 1000): CompareItem => ({
  id, name: `C${id}`, href: `/x/${id}/`, citySlug: 'bangkok', cityName: 'Bangkok', catSlug, catName: 'Dental Clinics',
  district: null, rating: 5, reviews: 10, topRated: false, stations: [], openingHours: null, englishSpeaking: false,
  freeParking: false, wheelchairAccessible: false, openLate: false, acceptsCard: false, acceptsNfc: false,
  lgbtqFriendly: false, services: [], savedAt,
});

describe('addToList', () => {
  it('adds up to the max, then refuses', () => {
    let list: CompareItem[] = [];
    for (let i = 1; i <= MAX_COMPARE; i++) {
      const r = addToList(list, item(i));
      expect(r.ok).toBe(true);
      if (r.ok) list = r.list;
    }
    expect(addToList(list, item(99))).toEqual({ ok: false, reason: 'full' });
  });
  it('refuses a different category', () => {
    expect(addToList([item(1)], item(2, 'cosmetic-clinics'))).toEqual({ ok: false, reason: 'category' });
  });
  it('does not duplicate', () => {
    const r = addToList([item(1)], item(1));
    expect(r.ok && r.list.length).toBe(1);
  });
});

describe('sanitiseStored', () => {
  it('rejects non-arrays and malformed rows', () => {
    expect(sanitiseStored({ a: 1 }, 2000)).toEqual([]);
    expect(sanitiseStored([null, 1, { id: 'x' }], 2000)).toEqual([]);
  });
  it('drops expired rows and keeps fresh ones', () => {
    const got = sanitiseStored([item(1, 'd', 0), item(2, 'd', COMPARE_TTL_MS)], COMPARE_TTL_MS + 1);
    expect(got.map((c) => c.id)).toEqual([2]);
  });
  it('caps a tampered list', () => {
    expect(sanitiseStored([1, 2, 3, 4, 5].map((i) => item(i)), 2000)).toHaveLength(MAX_COMPARE);
  });
});
