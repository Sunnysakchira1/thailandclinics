import { describe, it, expect } from "vitest";
import { getAllPosts } from "./mdx";
import { buildGuidesHub, hubItems, eligibleCombos, postKind } from "./guidesHub";
import { guideSlug } from "./guides";

const combos = [
  { citySlug: "bangkok", categorySlug: "physiotherapy-clinics", count: 120 },
  { citySlug: "bangkok", categorySlug: "dental-clinics", count: 40 },
  { citySlug: "phuket", categorySlug: "wellness-clinics", count: 8 },
  { citySlug: "phuket", categorySlug: "dental-clinics", count: 3 },      // below threshold
  { citySlug: "pattaya", categorySlug: "dental-clinics", count: 30 },    // no guide city
];

describe("buildGuidesHub", () => {
  const posts = getAllPosts();
  const hub = buildGuidesHub(posts, combos);
  const items = hubItems(hub);

  it("includes every blog post exactly once", () => {
    expect(posts.length).toBeGreaterThanOrEqual(17);
    for (const p of posts) {
      expect(items.filter((i) => i.key === p.slug && i.source === "blog")).toHaveLength(1);
    }
    expect(items.filter((i) => i.source === "blog")).toHaveLength(posts.length);
  });

  it("includes exactly the eligible how-to-choose guides", () => {
    const want = eligibleCombos(combos).map((c) => guideSlug(c.citySlug, c.categorySlug)).sort();
    expect(want).toHaveLength(3);
    expect(items.filter((i) => i.source === "guide").map((i) => i.key).sort()).toEqual(want);
  });

  it("orders Bangkok then Phuket", () => {
    expect(hub.cities[0].slug).toBe("bangkok");
    expect(hub.cities[1].slug).toBe("phuket");
  });

  it("puts the pillar first and the how-to-choose guide last in a group", () => {
    const physio = hub.cities[0].specialties.find((s) => s.slug === "physiotherapy-clinics")!;
    expect(physio.items[0].title).toMatch(/Complete Expat Guide/);
    expect(physio.items.at(-1)!.source).toBe("guide");
    const middle = physio.items.slice(1, -1).map((i) => i.updatedAt);
    expect([...middle].sort().reverse()).toEqual(middle);
  });

  it("latest strip has 3 newest posts", () => {
    expect(hub.latest).toHaveLength(3);
    const newest = posts.map((p) => p.updatedAt || p.publishedAt).sort().reverse()[0];
    expect(hub.latest[0].updatedAt).toBe(newest);
  });

  it("derives eyebrow kinds", () => {
    expect(postKind({ title: "X — Complete Expat Guide", type: "pillar" })).toBe("Guide");
    expect(postKind({ title: "How to Compare Bangkok Fertility Clinics for PGT: Checklist", type: "cluster" })).toBe("Checklist");
    expect(postKind({ title: "Physiotherapy in Bangkok: Hospitals vs Physio Clinics, 2026", type: "cluster" })).toBe("Comparison");
    expect(postKind({ title: "10 Best Botox Clinics in Bangkok, Ranked With Prices 2026", type: "cluster" })).toBe("Best of");
  });
});
