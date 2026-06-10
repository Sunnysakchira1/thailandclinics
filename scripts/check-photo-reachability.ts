/**
 * Check HTTP reachability + content-type of every clinic photo_url.
 * Read-only. Writes broken list to /tmp/broken-photos.json.
 * Usage: npx tsx --env-file=.env.local scripts/check-photo-reachability.ts
 */
import { createClient } from "@libsql/client";
import { writeFileSync } from "fs";

const CONCURRENCY = 24;
const TIMEOUT_MS = 12000;

type Row = { id: number; slug: string; url: string };
type Result = Row & { status: number | string; ok: boolean; ctype: string };

async function check(r: Row): Promise<Result> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    // Range request keeps it light; Google ignores it but still returns headers fast.
    const res = await fetch(r.url, {
      method: "GET",
      headers: { Range: "bytes=0-1024", "User-Agent": "Mozilla/5.0 (photo-audit)" },
      signal: ctl.signal,
      redirect: "follow",
    });
    const ctype = res.headers.get("content-type") || "";
    const ok = res.ok && ctype.startsWith("image/");
    // drain a little to free the socket, then ignore
    try { await res.body?.cancel(); } catch {}
    return { ...r, status: res.status, ok, ctype };
  } catch (e: any) {
    return { ...r, status: e?.name === "AbortError" ? "timeout" : "error", ok: false, ctype: "" };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const c = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN });
  const rows: Row[] = (await c.execute(
    "SELECT id, slug, photo_url FROM clinics WHERE photo_url IS NOT NULL AND photo_url != '' ORDER BY id"
  )).rows.map((r) => ({ id: Number(r[0]), slug: String(r[1]), url: String(r[2]) }));

  console.log(`Checking ${rows.length} photo URLs (concurrency ${CONCURRENCY})…\n`);

  const results: Result[] = [];
  let i = 0;
  async function worker() {
    while (i < rows.length) {
      const idx = i++;
      results.push(await check(rows[idx]));
      if (results.length % 50 === 0) process.stdout.write(`\r  ${results.length}/${rows.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write(`\r  ${results.length}/${rows.length}\n\n`);

  const broken = results.filter((r) => !r.ok);
  const byStatus: Record<string, number> = {};
  for (const r of results) byStatus[String(r.status)] = (byStatus[String(r.status)] || 0) + 1;

  console.log("Status breakdown:");
  Object.entries(byStatus).sort((a, b) => b[1] - a[1]).forEach(([s, n]) => console.log(`  ${n.toString().padStart(4)}  ${s}`));
  console.log(`\nFunctioning images: ${results.length - broken.length}/${results.length}`);
  console.log(`BROKEN: ${broken.length}`);
  broken.slice(0, 40).forEach((r) => console.log(`  ${r.id} ${r.slug} — ${r.status} ${r.ctype}`));

  writeFileSync("/tmp/broken-photos.json", JSON.stringify(broken.map((b) => ({ id: b.id, slug: b.slug })), null, 2));
  console.log(`\nWrote ${broken.length} broken → /tmp/broken-photos.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
