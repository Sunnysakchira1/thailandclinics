/**
 * Null out photo_url for clinics whose Google photo URL is confirmed dead
 * (from /tmp/broken-photos.json). These render the branded ClinicPhoto
 * placeholder directly, avoiding a failed network request + broken-image flash.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/null-dead-photos.ts --dry-run
 *   npx tsx --env-file=.env.local scripts/null-dead-photos.ts
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const dead: { id: number; slug: string }[] = JSON.parse(
    readFileSync("/tmp/broken-photos.json", "utf8")
  );
  const c = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

  console.log(`Dead photos to null: ${dead.length}`);
  if (DRY_RUN) {
    dead.slice(0, 10).forEach((d) => console.log(`  ${d.id} ${d.slug}`));
    console.log("(dry run — no writes)");
    return;
  }

  let n = 0;
  for (const d of dead) {
    const r = await c.execute({
      sql: "UPDATE clinics SET photo_url = NULL, updated_at = ? WHERE id = ?",
      args: [new Date().toISOString().slice(0, 10), d.id],
    });
    n += r.rowsAffected;
  }
  console.log(`Nulled ${n} photo_url values.`);

  const remaining = await c.execute(
    "SELECT COUNT(*) FROM clinics WHERE photo_url IS NOT NULL AND photo_url != ''"
  );
  console.log(`Clinics still with a photo_url: ${remaining.rows[0][0]}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
