/**
 * Classify clinic services using Claude Haiku API.
 * Stores result as JSON array in the `services` column.
 *
 * Idempotent — skips clinics where services IS NOT NULL.
 *
 * Usage: npx tsx --env-file=.env.local scripts/enrich-services.ts
 */

import { createClient } from '@libsql/client'

// ─── Env validation ───────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const TURSO_URL         = process.env.TURSO_URL
const TURSO_AUTH_TOKEN  = process.env.TURSO_AUTH_TOKEN

if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. Add it to .env.local and re-run.')
  process.exit(1)
}
if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  console.error('TURSO_URL or TURSO_AUTH_TOKEN is not set.')
  process.exit(1)
}

// ─── DB client ────────────────────────────────────────────────────────────────

const client = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN })

// ─── Service taxonomy ─────────────────────────────────────────────────────────

const SERVICE_TAXONOMY: Record<string, string[]> = {
  'physiotherapy-clinics': [
    'sports-rehab', 'manual-therapy', 'dry-needling', 'lymphatic-drainage',
    'pilates', 'post-surgery-rehab', 'pediatric-physio', 'neuro-rehab',
    'back-spine', 'traditional-massage', 'tcm-acupuncture',
  ],
  'dental-clinics': [
    'general-dentistry', 'orthodontics', 'implants', 'whitening',
    'root-canal', 'cosmetic-dentistry', 'pediatric-dentistry',
  ],
  'cosmetic-clinics': [
    'botox-fillers', 'laser-treatments', 'skin-care', 'body-contouring',
    'prp', 'hair-removal', 'anti-aging',
  ],
  'wellness-clinics': [
    'iv-therapy', 'health-screening', 'anti-aging', 'hormone-therapy',
    'vitamin-therapy', 'weight-management', 'functional-medicine', 'nutrition',
  ],
  'fertility-clinics': [
    'ivf', 'icsi', 'iui', 'egg-freezing', 'genetic-screening',
    'egg-sperm-donation', 'male-fertility', 'fertility-consultation',
  ],
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ClinicRow = {
  id:               number | bigint
  name:             string
  name_en:          string | null
  about:            string | null
  review_positives: string | null
  category_slug:    string
}

type AnthropicResponse = {
  content: { text: string }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

function buildPrompt(clinic: ClinicRow, taxonomy: string[]): string {
  const displayName  = clinic.name_en || clinic.name
  const aboutSection = clinic.about ?? 'not available'

  let reviewSection = 'not available'
  if (clinic.review_positives) {
    try {
      const bullets = JSON.parse(clinic.review_positives) as unknown[]
      const filtered = bullets.filter((b): b is string => typeof b === 'string' && b.length > 0)
      if (filtered.length > 0) reviewSection = filtered.join('; ')
    } catch { /* leave as not available */ }
  }

  return `You are classifying a clinic's services.

Clinic name: ${displayName}
Category: ${clinic.category_slug}
About (Google data): ${aboutSection}
Patient review highlights: ${reviewSection}

From this list of services for ${clinic.category_slug}, select which ones this clinic likely offers.
Prioritise evidence from patient review highlights — they directly describe treatments received.
Only select services clearly indicated by the data. If uncertain, do not include it.

Available services: ${taxonomy.join(', ')}

Respond with ONLY a JSON array of service slugs. Example: ["sports-rehab","dry-needling"]
If none apply or data is insufficient, respond with: []`
}

async function callClaude(prompt: string): Promise<string[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages:   [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Claude API ${response.status}: ${body}`)
  }

  const data = await response.json() as AnthropicResponse
  const raw  = data.content[0]?.text ?? ''

  return raw
}

function parseAndValidate(raw: string, taxonomy: string[]): string[] {
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
    const parsed  = JSON.parse(cleaned) as unknown

    if (!Array.isArray(parsed)) return []

    // Validate each item is a string that exists in our taxonomy
    return (parsed as unknown[]).filter(
      (item): item is string =>
        typeof item === 'string' && taxonomy.includes(item)
    )
  } catch {
    return []
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Fetch clinics with no services data or empty array (reprocess with improved prompt)
  const result = await client.execute(`
    SELECT c.id, c.name, c.name_en, c.about, c.review_positives, cat.slug as category_slug
    FROM clinics c
    JOIN categories cat ON c.category_id = cat.id
    WHERE c.services IS NULL OR c.services = '[]'
    ORDER BY c.google_reviews_count DESC
  `)

  const rows = result.rows as ClinicRow[]
  const total = rows.length

  if (total === 0) {
    console.log('Nothing to do — all clinics already have services data.')
    process.exit(0)
  }

  console.log(`Found ${total} clinics to classify. Starting...\n`)

  let processed = 0
  let errors    = 0

  for (let i = 0; i < rows.length; i++) {
    const clinic   = rows[i]
    const taxonomy = SERVICE_TAXONOMY[clinic.category_slug]

    if (!taxonomy) {
      console.log(`[${i + 1}/${total}] ${clinic.name_en ?? clinic.name} — unknown category "${clinic.category_slug}", storing []`)
      await client.execute({
        sql:  'UPDATE clinics SET services = ? WHERE id = ?',
        args: ['[]', clinic.id],
      })
      processed++
      continue
    }

    const displayName = clinic.name_en ?? clinic.name
    const prompt      = buildPrompt(clinic, taxonomy)

    try {
      const raw       = await callClaude(prompt)
      const services  = parseAndValidate(raw, taxonomy)
      const jsonValue = JSON.stringify(services)

      await client.execute({
        sql:  'UPDATE clinics SET services = ? WHERE id = ?',
        args: [jsonValue, clinic.id],
      })

      console.log(`[${i + 1}/${total}] ${displayName} → ${jsonValue}`)
      processed++
    } catch (err) {
      console.warn(`[${i + 1}/${total}] WARNING: ${displayName} — API error: ${err}`)
      // Store empty array rather than leaving NULL so we don't re-process on next run
      await client.execute({
        sql:  'UPDATE clinics SET services = ? WHERE id = ?',
        args: ['[]', clinic.id],
      })
      errors++
    }

    // Rate limit: 300ms between calls
    if (i < rows.length - 1) await sleep(300)

    // Progress every 25
    if ((i + 1) % 25 === 0) {
      console.log(`\n── Progress: ${i + 1}/${total} ──\n`)
    }
  }

  console.log(`
════════════════════════════════
  Done
  Total processed : ${processed + errors}
  Successful      : ${processed}
  Errors (stored []): ${errors}
════════════════════════════════`)

  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
