import type { PriceRecord } from "@/lib/db/queries";

/**
 * Price aggregation. Records are only comparable once converted to one unit
 * per treatment; anything that can't be converted honestly is left out of the
 * statistics (it still shows on the clinic's own profile).
 */

/** Minimum distinct clinics/chains before a median or range is published. */
export const MIN_PRICE_SAMPLE = 5;

const COMPARABLE: Record<string, { label: string; toUnit: (r: PriceRecord) => number | null }> = {
  "botox": {
    label: "per unit",
    toUnit: (r) =>
      r.unit === "unit" ? r.priceThb
      : (r.unit === "vial" || r.unit === "area") && r.quantity ? r.priceThb / r.quantity
      : null,
  },
  "dermal-filler": {
    label: "per cc",
    toUnit: (r) => (r.unit === "cc" && r.quantity === 1 ? r.priceThb : null),
  },
  "ulthera": {
    label: "per line",
    toUnit: (r) => (r.unit === "lines" && r.quantity ? r.priceThb / r.quantity : null),
  },
};

export type PriceStats = {
  treatment:    string;
  unitLabel:    string;
  clinics:      number;   // distinct clinics/chains with a comparable price
  records:      number;
  min:          number;
  max:          number;
  median:       number;
  lastChecked:  string;   // YYYY-MM-DD
  firstChecked: string;
  publishable:  boolean;  // clinics >= MIN_PRICE_SAMPLE
};

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function priceStats(treatment: string, records: PriceRecord[]): PriceStats | null {
  const rule = COMPARABLE[treatment];
  if (!rule) return null;
  // One record per distinct (clinic, product, price-per-unit): a clinic that
  // lists five face areas at the same ฿200/unit shouldn't count five times.
  const seen = new Set<string>();
  const usable = records
    .map((r) => ({ r, v: rule.toUnit(r) }))
    .filter((x): x is { r: PriceRecord; v: number } => x.v != null && x.v > 0)
    .filter(({ r, v }) => {
      const key = `${r.entityKey}|${r.product ?? ""}|${Math.round(v)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  if (!usable.length) return null;
  const values = usable.map((x) => x.v);
  const dates = usable.map((x) => x.r.checkedAt).sort();
  const clinics = new Set(usable.map((x) => x.r.entityKey)).size;
  return {
    treatment,
    unitLabel:    rule.label,
    clinics,
    records:      usable.length,
    min:          Math.round(Math.min(...values)),
    max:          Math.round(Math.max(...values)),
    median:       Math.round(median(values)),
    firstChecked: dates[0],
    lastChecked:  dates.at(-1)!,
    publishable:  clinics >= MIN_PRICE_SAMPLE,
  };
}
