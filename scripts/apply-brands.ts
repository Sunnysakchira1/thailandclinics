/**
 * Apply a reviewed brand-clusters JSON to the DB + generate 301 redirects.
 * Usage: npx tsx --env-file=.env.local scripts/apply-brands.ts --city bangkok --category cosmetic-clinics [--dry-run]
 * Idempotent: re-running updates brands and re-points members.
 */
import fs from "fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { and, eq } from "drizzle-orm";
import { cities, categories, clinics, brands } from "../src/lib/db/schema";

const DRY = process.argv.includes("--dry-run");
const arg = (n: string) => { const i = process.argv.indexOf(`--${n}`); if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1]; throw new Error(`missing --${n}`); };
const REDIRECTS = "public/_redirects";

async function main() {
  const city = arg("city"), category = arg("category");
  const file = `data/brand-clusters-${city}-${category}.json`;
  const clusters = JSON.parse(fs.readFileSync(file, "utf8")) as any[];

  const client = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });
  const db = drizzle(client, { schema: { cities, categories, clinics, brands } });

  const [ci] = await db.select().from(cities).where(eq(cities.slug, city));
  const [ca] = await db.select().from(categories).where(eq(categories.slug, category));
  if (!ci || !ca) throw new Error("city or category not found");

  // validation: collect all standalone clinic slugs in this city+cat to guard collisions
  const allClinics = await db.select({ id: clinics.id, slug: clinics.slug })
    .from(clinics).where(and(eq(clinics.cityId, ci.id), eq(clinics.categoryId, ca.id)));
  const memberSlugs = new Set(clusters.flatMap(c => c.members.map((m: any) => m.clinicSlug)));
  const standaloneSlugs = new Set(allClinics.filter(c => !memberSlugs.has(c.slug)).map(c => c.slug));

  const seenBrandSlug = new Set<string>();
  const redirectLines: string[] = [];

  for (const cl of clusters) {
    if (seenBrandSlug.has(cl.slug)) throw new Error(`duplicate brand slug: ${cl.slug}`);
    seenBrandSlug.add(cl.slug);
    if (standaloneSlugs.has(cl.slug)) throw new Error(`brand slug "${cl.slug}" collides with a standalone clinic slug`);
    const branchSlugs = cl.members.map((m: any) => m.proposedBranchSlug);
    if (new Set(branchSlugs).size !== branchSlugs.length) throw new Error(`duplicate branch slug within brand ${cl.slug}`);

    // aggregates (review-weighted)
    const members = cl.members;
    const totalReviews = members.reduce((s: number, m: any) => s + (m.reviews || 0), 0);
    const wRating = totalReviews > 0
      ? members.reduce((s: number, m: any) => s + (m.rating || 0) * (m.reviews || 0), 0) / totalReviews
      : null;
    // members JSON lacks rating; fetch from DB per member below and recompute precisely.

    if (DRY) { console.log(`[dry] brand ${cl.slug}: ${members.length} branches, ${totalReviews} reviews`); continue; }

    // upsert brand (manual: select then insert/update — libsql has no native upsert via drizzle here)
    const existing = await db.select().from(brands)
      .where(and(eq(brands.cityId, ci.id), eq(brands.categoryId, ca.id), eq(brands.slug, cl.slug)));
    let brandId: number;
    const base = { name: cl.name, slug: cl.slug, cityId: ci.id, categoryId: ca.id,
                   website: cl.website ?? null, branchCount: members.length };
    if (existing[0]) { brandId = existing[0].id; await db.update(brands).set(base).where(eq(brands.id, brandId)); }
    else { const r = await db.insert(brands).values(base).returning({ id: brands.id }); brandId = r[0].id; }

    // point members + compute precise weighted rating from DB
    let sumWR = 0, sumR = 0; let flagshipPhoto: string | null = null; let flagshipReviews = -1;
    for (const m of members) {
      const [row] = await db.select({ id: clinics.id, slug: clinics.slug, rating: clinics.googleRating,
                                      reviews: clinics.googleReviewsCount, photo: clinics.photoUrl })
        .from(clinics).where(eq(clinics.slug, m.clinicSlug));
      if (!row) throw new Error(`member clinic not found: ${m.clinicSlug}`);
      await db.update(clinics).set({ brandId, branchSlug: m.proposedBranchSlug }).where(eq(clinics.id, row.id));
      const rv = row.reviews || 0; sumWR += (row.rating || 0) * rv; sumR += rv;
      if (rv > flagshipReviews) { flagshipReviews = rv; flagshipPhoto = row.photo; }

      // redirect old flat URL → new nested URL (skip the no-op where old slug === brand slug)
      const newPath = `/${city}/${category}/${cl.slug}/${m.proposedBranchSlug}/`;
      if (row.slug !== cl.slug) {
        redirectLines.push(`/${city}/${category}/${row.slug}/ ${newPath} 301`);
        redirectLines.push(`/${city}/${category}/${row.slug} ${newPath} 301`);
      }
    }
    const avg = sumR > 0 ? Math.round((sumWR / sumR) * 10) / 10 : null;
    await db.update(brands).set({ avgRating: avg, totalReviews: sumR, logoUrl: flagshipPhoto })
      .where(eq(brands.id, brandId));
    console.log(`✓ ${cl.slug}: ${members.length} branches, ${avg}★ (${sumR} reviews)`);
  }

  if (!DRY && redirectLines.length) {
    const header = `\n# Brand re-slug 301s — ${city}/${category} (generated by apply-brands.ts)\n`;
    fs.appendFileSync(REDIRECTS, header + redirectLines.join("\n") + "\n");
    console.log(`Appended ${redirectLines.length} redirect lines → ${REDIRECTS}`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
