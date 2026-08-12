/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://thailand-clinics.com",

  // Write to /out so Cloudflare Pages serves it (output: 'export' builds to /out)
  outDir: "./out",

  // Ensure all URLs have trailing slashes (matches canonical URLs)
  trailingSlash: true,

  // robots.txt is managed manually in /public/robots.txt
  generateRobotsTxt: false,

  // Exclude non-indexed routes and Next.js special files.
  // The icon/apple-icon PNGs are generated assets, not pages — without these
  // they get emitted as indexable URLs.
  exclude: [
    "/api/*",
    "/admin/*",
    "/icon.svg",
    "/icon.png",
    "/apple-icon.png",
    "/brand-guidelines",
  ],

  // Override priorities and changefreq per CLAUDE.md spec
  transform: async (config, path) => {
    const depth = path.split("/").filter(Boolean).length;

    // Depth-1 informational pages. Without this they fall through to the
    // depth <= 2 rule and get scored 0.9 weekly, level with the city and
    // category pages.
    const STATIC_PAGES = new Set([
      "/about",
      "/how-we-rank",
      "/privacy",
      "/terms",
      "/list-your-clinic",
      "/browse",
    ]);

    let priority    = 0.7;
    let changefreq  = "monthly";

    if (path === "/") {
      priority   = 1.0;
      changefreq = "weekly";
    } else if (path.startsWith("/blog/") || path.startsWith("/guides/")) {
      // Editorial content. Checked BEFORE the depth rules: /blog/[slug] is
      // depth 2 and would otherwise be scored 0.9 weekly as a city page.
      priority   = 0.7;
      changefreq = "monthly";
    } else if (STATIC_PAGES.has(path)) {
      priority   = 0.5;
      changefreq = "yearly";
    } else if (depth <= 2) {
      // /[city] or /[city]/[category]
      priority   = 0.9;
      changefreq = "weekly";
    } else if (depth === 3) {
      // /[city]/[category]/[slug]
      priority   = 0.8;
      changefreq = "monthly";
    } else if (depth === 4) {
      // /[city]/[category]/[brand]/[branch]
      priority   = 0.8;
      changefreq = "monthly";
    }

    return {
      loc:        path,
      changefreq,
      priority,
      lastmod:    config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },

  // No additionalPaths needed — output: 'export' generates all pages statically,
  // so next-sitemap discovers them by scanning the /out directory directly.
};
