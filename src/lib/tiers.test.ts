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
