/**
 * Enrich 6 boolean columns from existing about and opening_hours JSON
 *
 * New columns:
 *   has_parking           — about.Parking has any true value
 *   wheelchair_accessible — about.Accessibility has any "Wheelchair" key with true
 *   appointment_required  — about.Planning["Appointment required"] === true
 *   accepts_card          — about.Payments["Credit cards"] or ["Debit cards"] === true
 *   accepts_nfc           — about.Payments["NFC mobile payments"] === true
 *   open_late             — any Mon–Fri closing time >= 20:00 (8PM)
 *
 * Usage: npx tsx --env-file=.env.local scripts/enrich-about.ts
 *
 * Idempotent — safe to re-run.
 */

import { createClient } from '@libsql/client'

const db = createClient({
  url:       process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

// ─── Step 1: Add new columns (idempotent) ─────────────────────────────────────

const NEW_COLUMNS = [
  'ALTER TABLE clinics ADD COLUMN has_parking INTEGER DEFAULT 0',
  'ALTER TABLE clinics ADD COLUMN wheelchair_accessible INTEGER DEFAULT 0',
  'ALTER TABLE clinics ADD COLUMN appointment_required INTEGER DEFAULT 0',
  'ALTER TABLE clinics ADD COLUMN accepts_card INTEGER DEFAULT 0',
  'ALTER TABLE clinics ADD COLUMN accepts_nfc INTEGER DEFAULT 0',
  'ALTER TABLE clinics ADD COLUMN open_late INTEGER DEFAULT 0',
]

async function addColumns() {
  for (const sql of NEW_COLUMNS) {
    try {
      await db.execute(sql)
      const col = sql.match(/ADD COLUMN (\w+)/)?.[1]
      console.log(`  Added column: ${col}`)
    } catch {
      // Column already exists — safe to ignore
    }
  }
}

// ─── Parse helpers ────────────────────────────────────────────────────────────

function parseAbout(raw: string | null): {
  hasParking: number
  wheelchairAccessible: number
  appointmentRequired: number
  acceptsCard: number
  acceptsNfc: number
} {
  const zero = { hasParking: 0, wheelchairAccessible: 0, appointmentRequired: 0, acceptsCard: 0, acceptsNfc: 0 }

  if (!raw) return zero

  let about: Record<string, Record<string, boolean>>
  try {
    about = JSON.parse(raw)
  } catch {
    return zero
  }

  // has_parking — Parking section, any key with value true
  const parking = about['Parking'] ?? {}
  const hasParking = Object.values(parking).some(v => v === true) ? 1 : 0

  // wheelchair_accessible — Accessibility section, any key containing "Wheelchair" with value true
  const access = about['Accessibility'] ?? {}
  const wheelchairAccessible = Object.entries(access).some(
    ([k, v]) => k.toLowerCase().includes('wheelchair') && v === true
  ) ? 1 : 0

  // appointment_required — Planning["Appointment required"] === true
  const planning = about['Planning'] ?? {}
  const appointmentRequired = planning['Appointment required'] === true ? 1 : 0

  // accepts_card — Payments["Credit cards"] or Payments["Debit cards"] === true
  const payments = about['Payments'] ?? {}
  const acceptsCard = (payments['Credit cards'] === true || payments['Debit cards'] === true) ? 1 : 0

  // accepts_nfc — Payments["NFC mobile payments"] === true
  const acceptsNfc = payments['NFC mobile payments'] === true ? 1 : 0

  return { hasParking, wheelchairAccessible, appointmentRequired, acceptsCard, acceptsNfc }
}

/**
 * Extract closing hour as a decimal (e.g. "8PM" → 20, "7:30PM" → 19.5, "Closed" → 0).
 * Input is the full time-range string e.g. "10AM-8PM" or "9AM–9:30PM".
 */
function closingHour(timeRange: string): number {
  const parts = timeRange.split(/[-–]/)
  if (parts.length < 2) return 0
  const closing = parts[parts.length - 1].trim()
  const match = closing.match(/(\d+)(?::(\d+))?(AM|PM)/i)
  if (!match) return 0
  let hour = parseInt(match[1])
  const mins = parseInt(match[2] || '0')
  const ampm = match[3].toUpperCase()
  if (ampm === 'PM' && hour !== 12) hour += 12
  if (ampm === 'AM' && hour === 12) hour = 0
  return hour + mins / 60
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

function parseHours(raw: string | null): { openLate: number } {
  if (!raw) return { openLate: 0 }

  let hours: Record<string, string>
  try {
    hours = JSON.parse(raw)
  } catch {
    return { openLate: 0 }
  }

  const openLate = WEEKDAYS.some(day => {
    const entry = hours[day]
    if (!entry) return false
    return closingHour(entry) >= 20
  }) ? 1 : 0

  return { openLate }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Enrich-about: adding new columns...')
  await addColumns()
  console.log()

  // Fetch all clinics
  const result = await db.execute(
    `SELECT id, about, opening_hours FROM clinics`
  )

  const rows = result.rows as { id: number | bigint; about: string | null; opening_hours: string | null }[]
  console.log(`Processing ${rows.length} clinics...`)

  type UpdateRow = {
    id: number | bigint
    hasParking: number
    wheelchairAccessible: number
    appointmentRequired: number
    acceptsCard: number
    acceptsNfc: number
    openLate: number
  }

  const updates: UpdateRow[] = rows.map(row => {
    const about = parseAbout(row.about)
    const { openLate } = parseHours(row.opening_hours)
    return {
      id: row.id,
      ...about,
      openLate,
    }
  })

  // Batch UPDATE in groups of 25
  const BATCH_SIZE = 25
  let processed = 0

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    await db.batch(
      batch.map(u => ({
        sql: `UPDATE clinics SET
          has_parking = ?,
          wheelchair_accessible = ?,
          appointment_required = ?,
          accepts_card = ?,
          accepts_nfc = ?,
          open_late = ?
          WHERE id = ?`,
        args: [
          u.hasParking,
          u.wheelchairAccessible,
          u.appointmentRequired,
          u.acceptsCard,
          u.acceptsNfc,
          u.openLate,
          u.id,
        ],
      }))
    )
    processed += batch.length
  }

  // ─── Summary ─────────────────────────────────────────────────────────────────
  const r = await db.execute(`
    SELECT
      SUM(has_parking)            AS has_parking,
      SUM(wheelchair_accessible)  AS wheelchair_accessible,
      SUM(appointment_required)   AS appointment_required,
      SUM(accepts_card)           AS accepts_card,
      SUM(accepts_nfc)            AS accepts_nfc,
      SUM(open_late)              AS open_late
    FROM clinics
  `)

  const s = r.rows[0]
  console.log()
  console.log(`Processed ${processed} clinics.`)
  console.log(`has_parking: ${s.has_parking} | wheelchair_accessible: ${s.wheelchair_accessible} | appointment_required: ${s.appointment_required}`)
  console.log(`accepts_card: ${s.accepts_card} | accepts_nfc: ${s.accepts_nfc} | open_late: ${s.open_late}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
