// Postbuild: the root layout renders <html lang="en"> on every page, including the
// translated blog posts under /de /it /fr /es /pt. Rewrite the lang attribute in the
// static export so crawlers and browsers see the real language without running JS.
// Runs against ./out after `next build` (output: "export").

import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const LANGS = ["de", "it", "fr", "es", "pt"];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

let changed = 0;
for (const lang of LANGS) {
  for (const file of walk(path.join(OUT, lang))) {
    const html = fs.readFileSync(file, "utf8");
    const next = html.replace(/<html lang="en"/, `<html lang="${lang}"`);
    if (next !== html) { fs.writeFileSync(file, next); changed++; }
  }
}
console.log(`set-html-lang: ${changed} translated pages updated`);
