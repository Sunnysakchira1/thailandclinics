/**
 * Audit clinic photo_url coverage + reachability.
 * Read-only. Usage: npx tsx --env-file=.env.local scripts/audit-photos.ts
 */
import { createClient } from "@libsql/client";

async function main() {
  const c = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN });
  const rows = (await c.execute("SELECT id, slug, photo_url FROM clinics ORDER BY id")).rows;

  const total = rows.length;
  const empty = rows.filter((r) => !r[2] || String(r[2]).trim() === "");
  const has = rows.filter((r) => r[2] && String(r[2]).trim() !== "");

  const hosts: Record<string, number> = {};
  for (const r of has) {
    try {
      hosts[new URL(String(r[2])).host] = (hosts[new URL(String(r[2])).host] || 0) + 1;
    } catch {
      hosts["(invalid-url)"] = (hosts["(invalid-url)"] || 0) + 1;
    }
  }

  console.log(`Total clinics:        ${total}`);
  console.log(`Has photo_url:        ${has.length}`);
  console.log(`NULL/empty photo_url: ${empty.length}`);
  console.log(`\nHost breakdown:`);
  Object.entries(hosts).sort((a, b) => b[1] - a[1]).forEach(([h, n]) => console.log(`  ${n.toString().padStart(4)}  ${h}`));

  console.log(`\nSample photo_urls:`);
  has.slice(0, 4).forEach((r) => console.log(`  ${r[0]} ${r[1]}\n     ${String(r[2]).slice(0, 120)}`));

  if (empty.length) {
    console.log(`\nClinics WITHOUT photo (id slug):`);
    empty.slice(0, 30).forEach((r) => console.log(`  ${r[0]}  ${r[1]}`));
    if (empty.length > 30) console.log(`  … +${empty.length - 30} more`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
