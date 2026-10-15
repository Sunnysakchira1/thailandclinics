/**
 * Adds the manual "Top rated" editorial flag to clinics and brands (default off).
 * Usage: npx tsx --env-file=.env.local scripts/migrate-top-rated.ts
 * Idempotent — safe to re-run. Sets no flags; editors set them by hand.
 */
import { createClient } from "@libsql/client";

const db = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });

const DDL = [
  "ALTER TABLE clinics ADD COLUMN top_rated INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE brands ADD COLUMN top_rated INTEGER NOT NULL DEFAULT 0",
];

async function main() {
  for (const sql of DDL) {
    try { await db.execute(sql); console.log("ok:", sql); }
    catch (e) { if (/duplicate column/i.test(String(e))) console.log("skip (exists):", sql); else throw e; }
  }
  const c = await db.execute(`SELECT COUNT(*) AS n FROM clinics WHERE top_rated=1`);
  const b = await db.execute(`SELECT COUNT(*) AS n FROM brands WHERE top_rated=1`);
  console.log("clinics flagged:", c.rows[0].n, "| brands flagged:", b.rows[0].n);
}
main();
