import { describe, it, expect } from "vitest";
import { normaliseTier, effectiveTier, isTopRated, tierRank, assertTopRatedCap } from "./tiers";

describe("tiers", () => {
  it("normalises unknown values to basic", () => {
    expect(normaliseTier(undefined)).toBe("basic");
    expect(normaliseTier("gold")).toBe("basic");
    expect(normaliseTier("premium")).toBe("premium");
  });
  it("brand tier wins for branches", () => {
    expect(effectiveTier("basic", "premium")).toBe("premium");
    expect(effectiveTier("pro", null)).toBe("pro");
    expect(effectiveTier("premium", "basic")).toBe("premium");
  });
  it("top rated is a manual editorial flag", () => {
    expect(isTopRated(1)).toBe(true);
    expect(isTopRated(true)).toBe(true);
    expect(isTopRated(0)).toBe(false);
    expect(isTopRated(false)).toBe(false);
    expect(isTopRated(null)).toBe(false);
    expect(isTopRated(undefined)).toBe(false);
  });
  it("branches inherit the brand's top rated flag", () => {
    expect(isTopRated(0, 1)).toBe(true);
    expect(isTopRated(false, true)).toBe(true);
    expect(isTopRated(null, null)).toBe(false);
    expect(isTopRated(0, 0)).toBe(false);
  });
  it("top rated ignores tier and ratings entirely", () => {
    // Off by default: no tier or rating value turns it on.
    expect(isTopRated(0)).toBe(false);
    expect(isTopRated("premium")).toBe(false);
    expect(isTopRated(0, "premium")).toBe(false);
    expect(isTopRated(4.9, 369)).toBe(false);
  });
  it("ranks premium > pro > basic", () => {
    expect(tierRank("premium")).toBeGreaterThan(tierRank("pro"));
    expect(tierRank("pro")).toBeGreaterThan(tierRank("basic"));
  });
});

describe("assertTopRatedCap", () => {
  const entry = (listing: string, key: string, topRated = true) => ({ listing, key, topRated });

  it("allows exactly 5 Top-rated entries in a listing", () => {
    const entries = [1, 2, 3, 4, 5].map((i) => entry("bangkok/physiotherapy-clinics", `c${i}`));
    entries.push(entry("bangkok/physiotherapy-clinics", "c6", false));
    expect(() => assertTopRatedCap(entries)).not.toThrow();
  });

  it("throws naming the listing and the entries when 6 are flagged", () => {
    const entries = [1, 2, 3, 4, 5, 6].map((i) => entry("bangkok/dental-clinics", `c${i}`));
    expect(() => assertTopRatedCap(entries)).toThrow(/bangkok\/dental-clinics/);
    expect(() => assertTopRatedCap(entries)).toThrow(/c6/);
  });

  it("counts a brand's branches once", () => {
    const entries = [
      ...[1, 2, 3, 4].map((i) => entry("bangkok/cosmetic-clinics", `c${i}`)),
      entry("bangkok/cosmetic-clinics", "cosmo"),
      entry("bangkok/cosmetic-clinics", "cosmo"),
      entry("bangkok/cosmetic-clinics", "cosmo"),
    ];
    expect(() => assertTopRatedCap(entries)).not.toThrow();
  });

  it("caps each listing separately", () => {
    const entries = [
      ...[1, 2, 3, 4, 5].map((i) => entry("bangkok/cosmetic-clinics", `c${i}`)),
      ...[1, 2, 3, 4, 5].map((i) => entry("phuket/cosmetic-clinics", `c${i}`)),
    ];
    expect(() => assertTopRatedCap(entries)).not.toThrow();
  });
});
