import { describe, it, expect } from "vitest";
import { normalise } from "./normalise";
import { search, wordHit, type SearchIndex, type SearchClinic } from "./engine";

const mk = (o: Partial<SearchClinic> & { n: string }): SearchClinic => ({
  id: Math.floor(Math.random() * 1e6), u: "/x/", c: "bangkok", k: "physiotherapy-clinics", d: null,
  r: 4.5, v: 100, t: "basic", tr: false, p: null, w: normalise(o.n), ...o,
});
const IDX: SearchIndex = {
  v: 1,
  cities: [{ slug: "bangkok", name: "Bangkok", count: 3 }, { slug: "phuket", name: "Phuket", count: 1 }],
  clinics: [
    mk({ n: "Form Recovery and Wellness @ Asoke", t: "premium", tr: true, r: 4.9, v: 369, w: normalise("Form Recovery and Wellness @ Asoke Khlong Toei asok physiotherapy") }),
    mk({ n: "Maximum Performance", k: "wellness-clinics" }),
    mk({ n: "Asok Montri Dental Clinic", k: "dental-clinics", w: normalise("Asok Montri Dental Clinic asok dental") }),
    mk({ n: "Formosa Physio", r: 5, v: 900, w: normalise("Formosa Physio physiotherapy") }),
    mk({ n: "Patong Smile Dental", c: "phuket", k: "dental-clinics", w: normalise("Patong Smile Dental patong dental") }),
  ],
};

describe("normalise", () => {
  it("lowercases, strips accents and applies area aliases", () => {
    expect(normalise("Thong Lo")).toBe("thonglor");
    expect(normalise("ASOKE & Café")).toBe("asok and cafe");
  });
});

describe("wordHit", () => {
  it("matches word prefixes only", () => {
    expect(wordHit("form", "formosa")).toBe(2);
    expect(wordHit("form", "performance")).toBe(0);
  });
  it("tolerates one typo on 5+ letter words", () => {
    expect(wordHit("ultera", "ulthera")).toBe(1);
    expect(wordHit("invisalgn", "invisalign")).toBe(1);
    expect(wordHit("botx", "botox")).toBe(0); // too short for fuzzy
  });
});

describe("search", () => {
  it("never matches mid-word", () => {
    const names = search(IDX, "form", "").clinics.map(c => c.n);
    expect(names).not.toContain("Maximum Performance");
  });
  it("ranks premium above organic within the same match band", () => {
    const names = search(IDX, "form", "").clinics.map(c => c.n);
    expect(names[0]).toBe("Form Recovery and Wellness @ Asoke");
    expect(names).toContain("Formosa Physio");
  });
  it("requires every word to match (dental asok)", () => {
    const names = search(IDX, "dental asoke", "").clinics.map(c => c.n);
    expect(names).toEqual(["Asok Montri Dental Clinic"]);
  });
  it("finds treatments with typos and links to the category in the chosen city", () => {
    const r = search(IDX, "ultera", "phuket");
    expect(r.treatments[0].label).toMatch(/Ulthera/);
    expect(r.treatments[0].url).toBe("/phuket/cosmetic-clinics/");
  });
  it("filters clinics by city", () => {
    expect(search(IDX, "dental", "phuket").clinics.map(c => c.n)).toEqual(["Patong Smile Dental"]);
  });
  it("returns nothing for gibberish", () => {
    const r = search(IDX, "xyzqq", "");
    expect(r.clinics.length + r.treatments.length + r.categories.length).toBe(0);
  });
});
