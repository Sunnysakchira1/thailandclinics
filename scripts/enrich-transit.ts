/**
 * Enrich near_bts and near_mrt columns using haversine distance
 *
 * Usage: npx tsx scripts/enrich-transit.ts
 *
 * Threshold: 500 metres (0.5 km)
 * Idempotent — safe to re-run, overwrites existing values.
 */

import { createClient } from '@libsql/client'

const client = createClient({
  url:       process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

// ─── Station lists ────────────────────────────────────────────────────────────

const BTS_STATIONS = [
  // Sukhumvit Line
  { name: 'Mo Chit',           lat: 13.8020, lng: 100.5535 },
  { name: 'Saphan Khwai',      lat: 13.7949, lng: 100.5495 },
  { name: 'Ari',               lat: 13.7798, lng: 100.5462 },
  { name: 'Sanam Pao',         lat: 13.7697, lng: 100.5406 },
  { name: 'Victory Monument',  lat: 13.7641, lng: 100.5375 },
  { name: 'Phaya Thai',        lat: 13.7530, lng: 100.5334 },
  { name: 'Ratchathewi',       lat: 13.7481, lng: 100.5307 },
  { name: 'Siam',              lat: 13.7453, lng: 100.5341 },
  { name: 'Chit Lom',          lat: 13.7440, lng: 100.5498 },
  { name: 'Ploen Chit',        lat: 13.7416, lng: 100.5494 },
  { name: 'Nana',              lat: 13.7397, lng: 100.5565 },
  { name: 'Asok',              lat: 13.7359, lng: 100.5608 },
  { name: 'Phrom Phong',       lat: 13.7304, lng: 100.5698 },
  { name: 'Thong Lo',          lat: 13.7255, lng: 100.5782 },
  { name: 'Ekkamai',           lat: 13.7195, lng: 100.5852 },
  { name: 'Phra Khanong',      lat: 13.7139, lng: 100.5901 },
  { name: 'On Nut',            lat: 13.7010, lng: 100.5992 },
  { name: 'Bang Chak',         lat: 13.6949, lng: 100.6054 },
  { name: 'Punnawithi',        lat: 13.6887, lng: 100.6109 },
  { name: 'Udom Suk',          lat: 13.6803, lng: 100.6143 },
  { name: 'Bang Na',           lat: 13.6703, lng: 100.6162 },
  // Silom Line
  { name: 'National Stadium',  lat: 13.7454, lng: 100.5294 },
  { name: 'Ratchadamri',       lat: 13.7437, lng: 100.5396 },
  { name: 'Sala Daeng',        lat: 13.7270, lng: 100.5336 },
  { name: 'Chong Nonsi',       lat: 13.7231, lng: 100.5256 },
  { name: 'Surasak',           lat: 13.7193, lng: 100.5161 },
  { name: 'Saphan Taksin',     lat: 13.7190, lng: 100.5098 },
  { name: 'Wongwian Yai',      lat: 13.7236, lng: 100.4960 },
  { name: 'Krung Thon Buri',   lat: 13.7265, lng: 100.4986 },
  // Gold Line
  { name: 'Krung Thon Buri (Gold)', lat: 13.7265, lng: 100.4978 },
  { name: 'Charoen Nakhon',    lat: 13.7219, lng: 100.5029 },
  { name: 'Khlong San',        lat: 13.7173, lng: 100.5074 },
]

const MRT_STATIONS = [
  // Blue Line
  { name: 'Hua Lamphong',              lat: 13.7390, lng: 100.5165 },
  { name: 'Si Lom',                    lat: 13.7283, lng: 100.5340 },
  { name: 'Lumphini',                  lat: 13.7252, lng: 100.5441 },
  { name: 'Khlong Toei',               lat: 13.7228, lng: 100.5547 },
  { name: 'Queen Sirikit',             lat: 13.7229, lng: 100.5602 },
  { name: 'Sukhumvit',                 lat: 13.7358, lng: 100.5608 },
  { name: 'Phetchaburi',               lat: 13.7501, lng: 100.5688 },
  { name: 'Thailand Cultural Centre',  lat: 13.7578, lng: 100.5678 },
  { name: 'Huai Khwang',               lat: 13.7763, lng: 100.5706 },
  { name: 'Sutthisan',                 lat: 13.7868, lng: 100.5619 },
  { name: 'Ratchadaphisek',            lat: 13.7854, lng: 100.5560 },
  { name: 'Lat Phrao',                 lat: 13.8041, lng: 100.5671 },
  { name: 'Phahon Yothin',             lat: 13.8143, lng: 100.5624 },
  { name: 'Chatuchak Park',            lat: 13.8023, lng: 100.5535 },
  { name: 'Kamphaeng Phet',            lat: 13.7986, lng: 100.5519 },
  { name: 'Bang Sue',                  lat: 13.8032, lng: 100.5235 },
  { name: 'Tao Poon',                  lat: 13.8070, lng: 100.5296 },
  { name: 'Bang Pho',                  lat: 13.8115, lng: 100.5225 },
  { name: 'Si Yaek Nonthaburi',        lat: 13.8555, lng: 100.5193 },
  { name: 'Nonthaburi 1',              lat: 13.8638, lng: 100.5171 },
  // Purple Line
  { name: 'Tao Poon (Purple)',         lat: 13.8072, lng: 100.5299 },
  { name: 'Bang Son',                  lat: 13.8167, lng: 100.5232 },
  { name: 'Wong Sawang',               lat: 13.8247, lng: 100.5270 },
  { name: 'Khae Rai',                  lat: 13.8340, lng: 100.5177 },
  { name: 'Ministry of Public Health', lat: 13.8455, lng: 100.5120 },
  // Yellow Line
  { name: 'Lat Phrao (Yellow)',        lat: 13.8133, lng: 100.5717 },
  { name: 'Phawana',                   lat: 13.7937, lng: 100.5901 },
  { name: 'On Nut (Yellow)',           lat: 13.7063, lng: 100.5938 },
]

// ─── Haversine ────────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function minDist(lat: number, lng: number, stations: { lat: number; lng: number }[]): number {
  return Math.min(...stations.map(s => haversineKm(lat, lng, s.lat, s.lng)))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const result = await client.execute(
    `SELECT id, lat, lng FROM clinics WHERE lat IS NOT NULL AND lng IS NOT NULL`
  )

  const rows = result.rows as { id: number | bigint; lat: number; lng: number }[]
  console.log(`Found ${rows.length} clinics with coordinates`)

  const THRESHOLD_KM = 0.5

  type UpdateRow = { id: number | bigint; nearBts: number; nearMrt: number }
  const updates: UpdateRow[] = []

  for (const row of rows) {
    const lat = Number(row.lat)
    const lng = Number(row.lng)

    const btsDist = minDist(lat, lng, BTS_STATIONS)
    const mrtDist = minDist(lat, lng, MRT_STATIONS)

    updates.push({
      id:      row.id,
      nearBts: btsDist < THRESHOLD_KM ? 1 : 0,
      nearMrt: mrtDist < THRESHOLD_KM ? 1 : 0,
    })
  }

  // Batch UPDATE in groups of 25
  const BATCH_SIZE = 25
  let updated = 0

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    await client.batch(
      batch.map(u => ({
        sql: 'UPDATE clinics SET near_bts = ?, near_mrt = ? WHERE id = ?',
        args: [u.nearBts, u.nearMrt, u.id],
      }))
    )
    updated += batch.length
  }

  const btsCount = updates.filter(u => u.nearBts === 1).length
  const mrtCount = updates.filter(u => u.nearMrt === 1).length
  console.log(`Updated ${updated} clinics. near_bts: ${btsCount} clinics, near_mrt: ${mrtCount} clinics`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
