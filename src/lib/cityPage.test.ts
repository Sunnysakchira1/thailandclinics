import { describe, expect, it } from "vitest";
import { bahtRange, normaliseDistrict, sortCityEntries, topDistricts } from "./cityPage";

describe("sortCityEntries", () => {
  const e = (name: string, o: Partial<Parameters<typeof sortCityEntries>[0][0]>) => ({
    name, tier: "basic" as const, topRated: false, featuredPosition: null, rating: 4.8, reviews: 100, ...o,
  });

  it("puts premium first by featured_position, then top rated, then weighted rating", () => {
    const out = sortCityEntries([
      e("organic-big", { rating: 4.9, reviews: 2000 }),
      e("top", { topRated: true, rating: 4.5, reviews: 10 }),
      e("prem-2", { tier: "premium", featuredPosition: 2 }),
      e("prem-1", { tier: "premium", featuredPosition: 1, rating: 4.0 }),
      e("organic-small", { rating: 5.0, reviews: 3 }),
    ]);
    expect(out.map((x) => x.name)).toEqual(["prem-1", "prem-2", "top", "organic-big", "organic-small"]);
  });
});

describe("normaliseDistrict", () => {
  it("merges Bangkok spelling variants", () => {
    expect(normaliseDistrict("Klongtoey", "bangkok")).toBe("Khlong Toei");
    expect(normaliseDistrict("Wattana, Bangkok 10110", "bangkok")).toBe("Watthana");
    expect(normaliseDistrict("ปทุมวัน", "bangkok")).toBe("Pathum Wan");
    expect(normaliseDistrict("Dusit District", "bangkok")).toBe("Dusit");
    expect(normaliseDistrict("Amphoe Dusit", "bangkok")).toBe("Dusit");
  });

  it("merges Phuket variants and drops city-level values", () => {
    expect(normaliseDistrict("Mueang Phuket District", "phuket")).toBe("Mueang Phuket");
    expect(normaliseDistrict("อ.เมือง", "phuket")).toBe("Mueang Phuket");
    expect(normaliseDistrict("Bang tao", "phuket")).toBe("Thalang");
    expect(normaliseDistrict("PHUKET", "phuket")).toBeNull();
  });

  it("drops unmapped Thai-script values", () => {
    expect(normaliseDistrict("บางซื่อ", "bangkok")).toBeNull();
  });
});

describe("topDistricts", () => {
  it("sums variants before ranking", () => {
    const out = topDistricts(
      [
        { district: "Bang Rak", count: 5 },
        { district: "Khlong Toei", count: 4 },
        { district: "Klongtoei", count: 3 },
        { district: "Subdistrict", count: 9 },
      ],
      "bangkok",
      2,
    );
    expect(out).toEqual([{ district: "Khlong Toei", count: 7 }, { district: "Bang Rak", count: 5 }]);
  });
});

describe("bahtRange", () => {
  it("formats ranges and single figures", () => {
    expect(bahtRange(170, 250)).toBe("฿170–250");
    expect(bahtRange(5980, 21000)).toBe("฿5,980–21,000");
    expect(bahtRange(1600, 1600)).toBe("฿1,600");
  });
});
