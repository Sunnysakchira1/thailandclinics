/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://thailand-clinics.com",

  // Write to /out so Cloudflare Pages serves it (output: 'export' builds to /out)
  outDir: "./out",

  // Ensure all URLs have trailing slashes (matches canonical URLs)
  trailingSlash: true,

  // robots.txt is managed manually in /public/robots.txt
  generateRobotsTxt: false,

  // Exclude non-indexed routes and Next.js special files
  exclude: ["/api/*", "/admin/*", "/icon.svg", "/brand-guidelines"],

  // Override priorities and changefreq per CLAUDE.md spec
  transform: async (config, path) => {
    const depth = path.split("/").filter(Boolean).length;

    let priority    = 0.7;
    let changefreq  = "monthly";

    if (path === "/") {
      priority   = 1.0;
      changefreq = "weekly";
    } else if (depth <= 2) {
      // /[city] or /[city]/[category]
      priority   = 0.9;
      changefreq = "weekly";
    } else if (depth === 3) {
      // /[city]/[category]/[slug]
      priority   = 0.8;
      changefreq = "monthly";
    }
    // blog/guides would be 0.7 monthly (default)

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
