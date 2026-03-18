/**
 * Backfill cid field on existing clinics from the Outscraper XLSX.
 * Usage: npx tsx scripts/backfill-cid.ts
 */

import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { clinics } from "../src/lib/db/schema";

const client = createClient({
  url:       process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(client, { schema: { clinics } });

function cleanCid(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const n = Number(v);
  if (!isFinite(n) || n === 0) return null;
  return BigInt(Math.round(n)).toString();
}

async function main() {
  const xlsxPath = path.resolve("./data/physio_data_bangkok.xlsx");
  if (!fs.existsSync(xlsxPath)) {
    console.error("File not found:", xlsxPath);
    process.exit(1);
  }

  const workbook  = XLSX.readFile(xlsxPath);
  const rows      = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[workbook.SheetNames[0]],
    { defval: null }
  );

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const placeId = row.place_id ? String(row.place_id).trim() : null;
    const cid     = cleanCid(row.cid);

    if (!placeId || !cid) { skipped++; continue; }

    const result = await db
      .update(clinics)
      .set({ cid })
      .where(eq(clinics.googlePlaceId, placeId));

    if ((result as unknown as { rowsAffected?: number }).rowsAffected !== 0) {
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`Done — updated: ${updated}, skipped/no match: ${skipped}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
