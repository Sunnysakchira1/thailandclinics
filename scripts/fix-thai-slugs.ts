/**
 * Fix slugs for clinics with Thai names.
 *
 * Targets:
 *   1. All clinics with 'clinic-XXXXXX' slugs (Thai-only names that fell through to place_id fallback)
 *   2. Slugs with underscores or double-dashes
 *
 * Usage: npx tsx --env-file=.env.local scripts/fix-thai-slugs.ts
 *        npx tsx --env-file=.env.local scripts/fix-thai-slugs.ts --dry-run
 */

import { createClient } from "@libsql/client";
import { generateSlug, deduplicateSlug } from "../src/lib/utils/slugify";

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const rows = await client.execute(
    "SELECT id, name, slug, name_en, google_place_id FROM clinics ORDER BY id"
  );

  type Row = { id: number; name: string; slug: string; nameEn: string | null; placeId: string };
  const all: Row[] = rows.rows.map((r) => ({
    id: Number(r[0]),
    name: String(r[1] ?? ""),
    slug: String(r[2] ?? ""),
    nameEn: r[3] ? String(r[3]) : null,
    placeId: String(r[4] ?? ""),
  }));

  const currentSlugs = new Set(all.map((r) => r.slug));

  // Identify rows that need fixing
  const needsFix = all.filter((r) => {
    const isPlaceholderSlug = /^clinic-[a-z0-9_-]{3,8}$/.test(r.slug);
    const hasUnderscore = r.slug.includes("_");
    const hasDoubleDash = r.slug.includes("--");
    return isPlaceholderSlug || hasUnderscore || hasDoubleDash;
  });

  console.log(`Total clinics: ${all.length}`);
  console.log(`Clinics needing slug fix: ${needsFix.length}`);
  if (DRY_RUN) console.log("--- DRY RUN (no DB writes) ---\n");

  const updates: { id: number; oldSlug: string; newSlug: string }[] = [];

  // Build working slug set (start from slugs of clinics NOT being updated)
  const keepSlugs = new Set(
    all.filter((r) => !needsFix.find((n) => n.id === r.id)).map((r) => r.slug)
  );

  for (const row of needsFix) {
    // Generate new slug with the fixed algorithm
    const baseSlug = generateSlug(row.name, row.nameEn, row.placeId);
    const newSlug = deduplicateSlug(baseSlug, keepSlugs, "bangkok");
    keepSlugs.add(newSlug);

    if (newSlug !== row.slug) {
      updates.push({ id: row.id, oldSlug: row.slug, newSlug });
      console.log(`  ${row.id}: "${row.name.slice(0, 50)}"`);
      console.log(`    ${row.slug} → ${newSlug}`);
    } else {
      console.log(`  ${row.id}: slug unchanged → ${row.slug}`);
    }
  }

  console.log(`\nUpdates to apply: ${updates.length}`);

  if (DRY_RUN || updates.length === 0) {
    if (DRY_RUN) console.log("\n(dry run — no changes made)");
    return;
  }

  // Apply updates
  let done = 0;
  for (const { id, oldSlug, newSlug } of updates) {
    await client.execute({
      sql: "UPDATE clinics SET slug = ? WHERE id = ? AND slug = ?",
      args: [newSlug, id, oldSlug],
    });
    done++;
    process.stdout.write(`\rUpdated ${done}/${updates.length}...`);
  }

  console.log(`\n\nDone. ${done} slugs updated.`);

  // Verify: check for remaining problematic slugs
  const check = await client.execute(
    "SELECT id, slug FROM clinics WHERE slug LIKE '%\\_%' OR slug LIKE '%--%' ORDER BY id"
  );
  if (check.rows.length > 0) {
    console.log("\nWarning — remaining problematic slugs:");
    check.rows.forEach((r) => console.log(`  ID ${r[0]}: ${r[1]}`));
  } else {
    console.log("✓ No remaining underscores or double-dashes in slugs.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
