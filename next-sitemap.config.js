/** @type {import('next-sitemap').IConfig} */

const { createClient } = require("@libsql/client");

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://thailandclinics.co",

  // robots.txt is managed manually in /public/robots.txt
  generateRobotsTxt: false,

  // Exclude non-indexed routes
  exclude: ["/api/*", "/admin/*"],

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

  // Add all dynamic clinic profile URLs from the database
  additionalPaths: async () => {
    const url       = process.env.TURSO_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      console.warn("⚠  next-sitemap: TURSO_URL/TURSO_AUTH_TOKEN not set — skipping clinic URLs");
      return [];
    }

    try {
      const client = createClient({ url, authToken });
      const result = await client.execute(`
        SELECT c.slug, ci.slug AS city_slug, ca.slug AS cat_slug
        FROM clinics c
        JOIN cities     ci ON c.city_id     = ci.id
        JOIN categories ca ON c.category_id = ca.id
        ORDER BY c.id
      `);

      return result.rows.map((row) => ({
        loc:        `/${row.city_slug}/${row.cat_slug}/${row.slug}/`,
        changefreq: "monthly",
        priority:   0.8,
        lastmod:    new Date().toISOString(),
      }));
    } catch (err) {
      console.error("next-sitemap: failed to fetch clinic URLs from DB:", err.message);
      return [];
    }
  },
};
