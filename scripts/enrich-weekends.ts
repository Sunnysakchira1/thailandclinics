/**
 * Enrich open_weekends column based on existing opening_hours JSON
 *
 * Usage: npx tsx scripts/enrich-weekends.ts
 *
 * Logic:
 *   open_weekends = true if Saturday OR Sunday value is truthy,
 *   non-empty, and not equal to "Closed" (case-insensitive)
 *
 * Idempotent — safe to re-run, overwrites existing values.
 */

import { createClient } from '@libsql/client'

const client = createClient({
  url:       process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

function isOpen(value: string | null | undefined): boolean {
  if (!value) return false
  const v = value.trim()
  if (v === '') return false
  if (v.toLowerCase() === 'closed') return false
  return true
}

async function main() {
  // Fetch all clinics with opening_hours set
  const result = await client.execute(
    `SELECT id, opening_hours FROM clinics WHERE opening_hours IS NOT NULL`
  )

  const rows = result.rows as { id: number | bigint; opening_hours: string }[]
  console.log(`Found ${rows.length} clinics with opening_hours`)

  type UpdateRow = { id: number | bigint; openWeekends: number }
  const updates: UpdateRow[] = []

  for (const row of rows) {
    let hours: Record<string, string> = {}
    try {
      hours = JSON.parse(row.opening_hours)
    } catch {
      // Malformed JSON — treat as no weekend hours
    }

    const satOpen = isOpen(hours['Saturday'])
    const sunOpen = isOpen(hours['Sunday'])
    const openWeekends = satOpen || sunOpen ? 1 : 0

    updates.push({ id: row.id, openWeekends })
  }

  // Batch UPDATE in groups of 25
  const BATCH_SIZE = 25
  let updated = 0

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    await client.batch(
      batch.map(u => ({
        sql: 'UPDATE clinics SET open_weekends = ? WHERE id = ?',
        args: [u.openWeekends, u.id],
      }))
    )
    updated += batch.length
  }

  const weekendCount = updates.filter(u => u.openWeekends === 1).length
  console.log(`Updated ${updated} clinics. ${weekendCount} open weekends found.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
