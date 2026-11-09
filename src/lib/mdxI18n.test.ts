import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";
import { LANGS, getAlternates, getLanguageVersions } from "./mdxI18n";

const translated = fs.readdirSync(path.join(process.cwd(), "content/blog-i18n/de")).map((f) => f.replace(/\.mdx$/, ""));

describe("language switcher", () => {
  it("lists English first, then every translation", () => {
    for (const enSlug of translated) {
      const v = getLanguageVersions(enSlug);
      expect(v.map((x) => x.lang)).toEqual(["en", ...LANGS]);
      expect(v[0].href).toBe(`/blog/${enSlug}/`);
    }
  });
  it("links match the hreflang map exactly", () => {
    for (const enSlug of translated) {
      const alt = getAlternates(enSlug);
      for (const x of getLanguageVersions(enSlug)) expect(alt[x.lang]).toBe(x.href);
    }
  });
  it("renders nothing for posts without translations", () => {
    expect(getLanguageVersions("no-such-post")).toEqual([]);
  });
});
