/**
 * Load data/prices.csv into treatment_prices (replace-all).
 *
 * Usage: npx tsx --env-file=.env.local scripts/import-prices.ts
 *
 * Each row's `slug` is matched to a brand first (chain-wide price), then to a
 * standalone clinic, within the row's city + category. Unmatched rows fail the
 * run — nothing is written unless every row resolves.
 */

import { createClient } from '@libsql/client'
import fs from 'node:fs'

const client = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! })

const UNITS = new Set(['unit', 'vial', 'area', 'cc', 'ml', 'lines', 'session', 'syringe'])

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = [], field = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (ch !== '\r') field += ch
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const [head, ...body] = rows.filter((r) => r.some((c) => c.trim()))
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])))
}

async function main() {
  const rows = parseCsv(fs.readFileSync('data/prices.csv', 'utf8'))

  await client.execute(`CREATE TABLE IF NOT EXISTS treatment_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinic_id INTEGER REFERENCES clinics(id),
    brand_id INTEGER REFERENCES brands(id),
    treatment TEXT NOT NULL, product TEXT,
    price_thb INTEGER NOT NULL, price_max_thb INTEGER,
    unit TEXT NOT NULL, quantity REAL,
    source_url TEXT NOT NULL, checked_at TEXT NOT NULL, note TEXT)`)

  const brands = (await client.execute(`SELECT b.id, b.slug, ci.slug city, ca.slug cat FROM brands b
    JOIN cities ci ON ci.id = b.city_id JOIN categories ca ON ca.id = b.category_id`)).rows
  const clinics = (await client.execute(`SELECT c.id, c.slug, ci.slug city, ca.slug cat FROM clinics c
    JOIN cities ci ON ci.id = c.city_id JOIN categories ca ON ca.id = c.category_id WHERE c.brand_id IS NULL`)).rows

  const errors: string[] = []
  const inserts = rows.map((r, i) => {
    const line = i + 2
    const brand  = brands.find((b) => b.slug === r.slug && b.city === r.city && b.cat === r.category)
    const clinic = brand ? null : clinics.find((c) => c.slug === r.slug && c.city === r.city && c.cat === r.category)
    if (!brand && !clinic) errors.push(`line ${line}: no brand or clinic '${r.slug}' in ${r.city}/${r.category}`)
    if (!UNITS.has(r.unit)) errors.push(`line ${line}: unknown unit '${r.unit}'`)
    if (!/^\d+$/.test(r.price_thb)) errors.push(`line ${line}: price_thb must be a whole number`)
    if (!/^https?:\/\//.test(r.source_url)) errors.push(`line ${line}: source_url required`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.checked_at)) errors.push(`line ${line}: checked_at must be YYYY-MM-DD`)
    return {
      sql: `INSERT INTO treatment_prices (clinic_id, brand_id, treatment, product, price_thb, price_max_thb, unit, quantity, source_url, checked_at, note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [clinic?.id ?? null, brand?.id ?? null, r.treatment, r.product || null, Number(r.price_thb),
             r.price_max_thb ? Number(r.price_max_thb) : null, r.unit, r.quantity ? Number(r.quantity) : null,
             r.source_url, r.checked_at, r.note || null],
    }
  })

  if (errors.length) {
    console.error(`Not imported — ${errors.length} problem(s):\n  ${errors.join('\n  ')}`)
    process.exit(1)
  }

  await client.batch(['DELETE FROM treatment_prices', ...inserts], 'write')
  console.log(`Imported ${inserts.length} price records.`)
}

main().catch((err) => { console.error(err); process.exit(1) })
