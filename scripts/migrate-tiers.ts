/**
 * Adds plan tiers + clinic_doctors, and sets the launch Premium entries.
 * Usage: npx tsx --env-file=.env.local scripts/migrate-tiers.ts
 * Idempotent — safe to re-run.
 */
import { createClient } from "@libsql/client";

const db = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });

const DDL = [
  "ALTER TABLE clinics ADD COLUMN tier TEXT NOT NULL DEFAULT 'basic'",
  "ALTER TABLE brands ADD COLUMN tier TEXT NOT NULL DEFAULT 'basic'",
  `CREATE TABLE IF NOT EXISTS clinic_doctors (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     clinic_id INTEGER NOT NULL REFERENCES clinics(id),
     name TEXT NOT NULL,
     role TEXT,
     credentials TEXT,
     licence TEXT,
     photo_url TEXT,
     sort_order INTEGER NOT NULL DEFAULT 0
   )`,
];

async function main() {
  for (const sql of DDL) {
    try { await db.execute(sql); console.log("ok:", sql.split("\n")[0]); }
    catch (e) { if (/duplicate column/i.test(String(e))) console.log("skip (exists):", sql.split("\n")[0]); else throw e; }
  }
  // Launch Premium entries (2026-10-15). Positions: Form Asoke 1, Cosmo 2, Genesis 3, Form Thonglor 4.
  await db.execute(`UPDATE clinics SET tier='premium', featured=1, featured_position=1 WHERE slug='form-recovery-and-wellness-at-asoke'`);
  await db.execute(`UPDATE clinics SET tier='premium', featured=1, featured_position=4 WHERE slug='form-recovery-and-wellness-at-thonglor'`);
  await db.execute(`UPDATE brands SET tier='premium', featured=1, featured_position=2 WHERE slug='cosmo-clinic'`);
  await db.execute(`UPDATE brands SET tier='premium', featured=1, featured_position=3 WHERE slug='genesis-fertility-center'`);
  const c = await db.execute(`SELECT name, tier, featured_position FROM clinics WHERE tier!='basic'`);
  const b = await db.execute(`SELECT name, tier, featured_position FROM brands WHERE tier!='basic'`);
  console.table(c.rows); console.table(b.rows);
}
main();
