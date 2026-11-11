/** The visitor's compare list: rules, localStorage persistence and a React hook. */
import { useSyncExternalStore } from 'react';
import type { StationLink } from '@/lib/listing-filters';

export const MAX_COMPARE = 3;
export const COMPARE_TTL_MS = 7 * 24 * 3_600_000;
const KEY = 'tc-compare-v1';

export interface CompareItem {
  id: number;
  name: string;
  href: string;
  citySlug: string;
  cityName: string;
  catSlug: string;
  catName: string;
  district: string | null;
  rating: number | null;
  reviews: number | null;
  topRated: boolean;
  stations: StationLink[];
  openingHours: string | null;
  englishSpeaking: boolean;
  freeParking: boolean;
  wheelchairAccessible: boolean;
  openLate: boolean;
  acceptsCard: boolean;
  acceptsNfc: boolean;
  lgbtqFriendly: boolean;
  services: string[];
  savedAt: number;
}

export type AddResult = { ok: true; list: CompareItem[] } | { ok: false; reason: 'full' | 'category' };

export function addToList(list: CompareItem[], item: CompareItem): AddResult {
  if (list.some((c) => c.id === item.id)) return { ok: true, list };
  if (list.length >= MAX_COMPARE) return { ok: false, reason: 'full' };
  if (list.length > 0 && list[0].catSlug !== item.catSlug) return { ok: false, reason: 'category' };
  return { ok: true, list: [...list, item] };
}

/** Accepts unknown stored JSON; drops anything malformed or older than the TTL. */
export function sanitiseStored(raw: unknown, now: number): CompareItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c): c is CompareItem =>
      !!c && typeof c === 'object' && typeof (c as CompareItem).id === 'number' &&
      typeof (c as CompareItem).name === 'string' && typeof (c as CompareItem).href === 'string' &&
      typeof (c as CompareItem).catSlug === 'string' && Array.isArray((c as CompareItem).services) &&
      Array.isArray((c as CompareItem).stations) && typeof (c as CompareItem).savedAt === 'number' &&
      now - (c as CompareItem).savedAt < COMPARE_TTL_MS)
    .slice(0, MAX_COMPARE);
}

const EMPTY: CompareItem[] = [];
let cache: CompareItem[] | null = null;
const listeners = new Set<() => void>();

function load(): CompareItem[] {
  try {
    return sanitiseStored(JSON.parse(localStorage.getItem(KEY) ?? '[]'), Date.now());
  } catch {
    return EMPTY;
  }
}

function commit(list: CompareItem[]) {
  cache = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* storage blocked: the list still works for this page view */ }
  listeners.forEach((l) => l());
}

function getSnapshot(): CompareItem[] {
  if (cache === null) cache = load();
  return cache;
}

function subscribe(listener: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) { cache = null; listener(); }
  };
  listeners.add(listener);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useCompareList(): CompareItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function addCompare(item: Omit<CompareItem, 'savedAt'>): AddResult {
  const result = addToList(getSnapshot(), { ...item, savedAt: Date.now() });
  if (result.ok) commit(result.list);
  return result;
}
export function removeCompare(id: number) { commit(getSnapshot().filter((c) => c.id !== id)); }
export function clearCompare() { commit([]); }
