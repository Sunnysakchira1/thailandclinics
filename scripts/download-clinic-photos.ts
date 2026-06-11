/**
 * Self-host clinic photos.
 *
 * Downloads each clinic's remote (Google) photo to public/clinic-photos/<id>.<ext>
 * and rewrites the DB photo_url to the local path "/clinic-photos/<id>.<ext>".
 * Result: stable, self-hosted images served by Cloudflare Pages that never expire.
 *
 * - Idempotent: rows whose photo_url already starts with "/clinic-photos/" are
 *   skipped unless --force.
 * - Only processes remote http(s) URLs that return a real image.
 * - Failures are left untouched (ClinicPhoto renders the branded placeholder).
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/download-clinic-photos.ts --dry-run
 *   npx tsx --env-file=.env.local scripts/download-clinic-photos.ts
 *   npx tsx --env-file=.env.local scripts/download-clinic-photos.ts --force
 */
import { createClient } from "@libsql/client";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");
const OUT_DIR = path.resolve("public/clinic-photos");
const PUBLIC_PREFIX = "/clinic-photos";
const CONCURRENCY = 8;
const TIMEOUT_MS = 20000;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const EXT_BY_CTYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

type Row = { id: number; slug: string; url: string };

/** Request a larger, consistent render size from Google's image CDN. */
function upsize(url: string): string {
  if (!url.includes("googleusercontent.com")) return url;
  return url.replace(/=[^=/]*$/, "=w1024-h768-k-no");
}

async function downloadOne(r: Row): Promise<{ id: number; localPath: string } | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(upsize(r.url), {
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: ctl.signal,
    });
    const ctype = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!res.ok || !ctype.startsWith("image/")) {
      console.log(`  ✗ ${r.id} ${r.slug} — ${res.status} ${ctype || "?"}`);
      return null;
    }
    const ext = EXT_BY_CTYPE[ctype] || "jpg";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1024) {
      console.log(`  ✗ ${r.id} ${r.slug} — too small (${buf.length}b)`);
      return null;
    }
    const filename = `${r.id}.${ext}`;
    if (!DRY_RUN) writeFileSync(path.join(OUT_DIR, filename), buf);
    console.log(`  ✓ ${r.id} ${r.slug} — ${(buf.length / 1024).toFixed(0)}kb ${ext}`);
    return { id: r.id, localPath: `${PUBLIC_PREFIX}/${filename}` };
  } catch (e: any) {
    console.log(`  ✗ ${r.id} ${r.slug} — ${e?.name === "AbortError" ? "timeout" : e?.message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const c = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

  const where = FORCE
    ? "photo_url IS NOT NULL AND photo_url != ''"
    : "photo_url LIKE 'http%'";
  const rows: Row[] = (
    await c.execute(`SELECT id, slug, photo_url FROM clinics WHERE ${where} ORDER BY id`)
  ).rows.map((r) => ({ id: Number(r[0]), slug: String(r[1]), url: String(r[2]) }))
    .filter((r) => /^https?:\/\//.test(r.url)); // only remote URLs are downloadable

  console.log(`Clinics with a downloadable remote photo: ${rows.length}`);
  if (DRY_RUN) console.log("--- DRY RUN (no files written, no DB writes) ---");
  mkdirSync(OUT_DIR, { recursive: true });

  const results: { id: number; localPath: string }[] = [];
  let i = 0;
  async function worker() {
    while (i < rows.length) {
      const res = await downloadOne(rows[i++]);
      if (res) results.push(res);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`\nDownloaded: ${results.length}/${rows.length}`);
  if (DRY_RUN) return;

  let updated = 0;
  for (const { id, localPath } of results) {
    const r = await c.execute({
      sql: "UPDATE clinics SET photo_url = ?, updated_at = ? WHERE id = ?",
      args: [localPath, new Date().toISOString().slice(0, 10), id],
    });
    updated += r.rowsAffected;
  }
  console.log(`DB photo_url rewritten to local path: ${updated}`);

  const remoteLeft = await c.execute("SELECT COUNT(*) FROM clinics WHERE photo_url LIKE 'http%'");
  const selfHosted = await c.execute(`SELECT COUNT(*) FROM clinics WHERE photo_url LIKE '${PUBLIC_PREFIX}/%'`);
  console.log(`Self-hosted: ${selfHosted.rows[0][0]} | remaining remote: ${remoteLeft.rows[0][0]}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
