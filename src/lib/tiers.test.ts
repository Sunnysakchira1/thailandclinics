import { describe, it, expect } from "vitest";
import { normaliseTier, effectiveTier, isTopRated, tierRank } from "./tiers";

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
  it("top rated needs 4.8+ and 50+ reviews", () => {
    expect(isTopRated(4.8, 50)).toBe(true);
    expect(isTopRated(4.9, 369)).toBe(true);
    expect(isTopRated(4.7, 900)).toBe(false);
    expect(isTopRated(5, 12)).toBe(false);
    expect(isTopRated(null, 100)).toBe(false);
  });
  it("ranks premium > pro > basic", () => {
    expect(tierRank("premium")).toBeGreaterThan(tierRank("pro"));
    expect(tierRank("pro")).toBeGreaterThan(tierRank("basic"));
  });
});
