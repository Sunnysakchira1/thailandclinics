/**
 * Enrich english_speaking column using existing clinic data (no external APIs).
 *
 * Flags english_speaking = 1 if ANY of:
 *  1. about JSON contains "english" or "language" (deep key search)
 *  2. review_positives contains "english", "bilingual", or "speak"
 *  3. name_en contains a recognisable English word/pattern
 *
 * Idempotent — safe to re-run, overwrites existing values.
 *
 * Usage: npx tsx --env-file=.env.local scripts/enrich-english.ts
 */

import { createClient } from '@libsql/client'

// ─── Env validation ───────────────────────────────────────────────────────────

const TURSO_URL        = process.env.TURSO_URL
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  console.error('TURSO_URL or TURSO_AUTH_TOKEN is not set.')
  process.exit(1)
}

// ─── DB client ────────────────────────────────────────────────────────────────

const client = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN })

// ─── English word list for name_en heuristic ──────────────────────────────────

const ENGLISH_WORDS = [
  'clinic', 'center', 'centre', 'physio', 'physiotherapy', 'physical',
  'dental', 'dentist', 'therapy', 'therapist', 'health', 'medical', 'care',
  'wellness', 'rehab', 'rehabilitation', 'sport', 'sports', 'life', 'plus',
  'pro', 'fresh', 'body', 'spine', 'back', 'joint', 'bone', 'muscle',
  'pain', 'relief', 'recovery', 'movement', 'motion', 'balance', 'fit',
  'fitness', 'studio', 'the ', 'and ', 'of ', 'for ', 'by ', 'at ',
  'advanced', 'expert', 'premier', 'prime', 'elite', 'optimal', 'active',
  'urban', 'metro', 'city', 'new ', 'the ', 'total', 'complete', 'first',
  'international', 'bangkok', 'sukhumvit', 'thonglor', 'silom', 'siam',
  'ari', 'nana', 'asok', 'ekkamai', 'sathorn', 'lumpini',
]

// ─── Detection helpers ────────────────────────────────────────────────────────

function detectFromAbout(aboutRaw: string | null): boolean {
  if (!aboutRaw) return false
  try {
    const aboutStr = JSON.stringify(JSON.parse(aboutRaw)).toLowerCase()
    return aboutStr.includes('english') || aboutStr.includes('language')
  } catch {
    return false
  }
}

function detectFromReviewPositives(reviewsRaw: string | null): boolean {
  if (!reviewsRaw) return false
  try {
    const items: (string | null)[] = JSON.parse(reviewsRaw)
    return items.some(item => {
      if (!item) return false
      const lower = item.toLowerCase()
      return lower.includes('english') || lower.includes('bilingual') || lower.includes('speak')
    })
  } catch {
    return false
  }
}

function detectFromNameEn(nameEn: string | null): boolean {
  if (!nameEn || nameEn.trim().length <= 3) return false
  const lower = nameEn.toLowerCase()

  // Must have at least one space or be longer than 6 chars to avoid short transliterations
  const hasMultipleWords = nameEn.trim().includes(' ')
  const isLongEnough     = nameEn.trim().length > 6

  if (!hasMultipleWords && !isLongEnough) return false

  // Check for known English words
  return ENGLISH_WORDS.some(word => lower.includes(word))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const result = await client.execute(
    `SELECT id, name_en, about, review_positives, english_speaking FROM clinics`
  )

  const rows = result.rows as {
    id:               number | bigint
    name_en:          string | null
    about:            string | null
    review_positives: string | null
    english_speaking: number | null
  }[]

  console.log(`Checking ${rows.length} clinics for English-speaking signals...`)

  type Update = { id: number | bigint; value: number; reasons: string[] }
  const updates: Update[] = []

  for (const row of rows) {
    const reasons: string[] = []

    const fromAbout   = detectFromAbout(row.about)
    const fromReviews = detectFromReviewPositives(row.review_positives)
    const fromNameEn  = detectFromNameEn(row.name_en)

    if (fromAbout)   reasons.push('about')
    if (fromReviews) reasons.push('review_positives')
    if (fromNameEn)  reasons.push('name_en')

    updates.push({ id: row.id, value: reasons.length > 0 ? 1 : 0, reasons })
  }

  // Batch UPDATE in groups of 25
  const BATCH_SIZE = 25
  let updated = 0

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    await client.batch(
      batch.map(u => ({
        sql:  'UPDATE clinics SET english_speaking = ? WHERE id = ?',
        args: [u.value, u.id],
      }))
    )
    updated += batch.length
  }

  const flagged = updates.filter(u => u.value === 1)

  console.log(`\nChecked ${rows.length} clinics. ${flagged.length} flagged as English-speaking.`)
  console.log(`\nBreakdown by signal:`)
  console.log(`  about JSON:        ${updates.filter(u => u.reasons.includes('about')).length}`)
  console.log(`  review_positives:  ${updates.filter(u => u.reasons.includes('review_positives')).length}`)
  console.log(`  name_en heuristic: ${updates.filter(u => u.reasons.includes('name_en')).length}`)

  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
