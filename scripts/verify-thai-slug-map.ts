/**
 * Verify the Thai slug mapping from /tmp/slugmap.json against the live DB.
 * Read-only — no writes.
 *
 * Usage: npx tsx --env-file=.env.local scripts/verify-thai-slug-map.ts
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

type MapRow = { id: number; old_slug: string; new_slug: string; db_old_slug: string };

async function main() {
  const map: MapRow[] = JSON.parse(readFileSync("/tmp/slugmap.json", "utf8"));
  const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const res = await client.execute("SELECT id, slug FROM clinics");
  const byId = new Map<number, string>();
  const allSlugs = new Set<string>();
  for (const r of res.rows) {
    byId.set(Number(r[0]), String(r[1]));
    allSlugs.add(String(r[1]));
  }

  const mapIds = new Set(map.map((m) => m.id));
  const newSlugSet = new Set(map.map((m) => m.new_slug));

  let problems = 0;

  for (const m of map) {
    const dbSlug = byId.get(m.id);
    if (dbSlug === undefined) {
      console.log(`✗ id ${m.id}: NOT FOUND in DB`);
      problems++;
      continue;
    }
    if (dbSlug !== m.old_slug) {
      // already migrated? or mismatch
      if (dbSlug === m.new_slug) {
        console.log(`• id ${m.id}: already migrated → ${m.new_slug}`);
      } else {
        console.log(`✗ id ${m.id}: DB slug "${dbSlug}" != sheet old "${m.old_slug}"`);
        problems++;
      }
    }
    // collision: new slug already used by a DIFFERENT clinic (not in our map set)
    if (allSlugs.has(m.new_slug)) {
      // find which id owns it
      const owners = [...byId.entries()].filter(([, s]) => s === m.new_slug).map(([i]) => i);
      const otherOwners = owners.filter((i) => i !== m.id);
      if (otherOwners.length > 0) {
        console.log(`✗ id ${m.id}: new slug "${m.new_slug}" collides with clinic id(s) ${otherOwners.join(",")}`);
        problems++;
      }
    }
  }

  // any new slug equal to an old slug of a clinic NOT being migrated (would create dup)
  for (const m of map) {
    for (const [id, slug] of byId) {
      if (!mapIds.has(id) && slug === m.new_slug) {
        console.log(`✗ id ${m.id}: new slug "${m.new_slug}" already held by non-migrating clinic ${id}`);
        problems++;
      }
    }
  }

  console.log(`\nRows in map: ${map.length}`);
  console.log(`Unique new slugs: ${newSlugSet.size}`);
  console.log(problems === 0 ? "✓ No problems — safe to apply." : `✗ ${problems} problem(s) found.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
