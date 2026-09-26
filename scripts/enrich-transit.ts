/**
 * Load Bangkok rail stations and link each clinic to its nearest ones.
 *
 * Usage: npx tsx --env-file=.env.local scripts/enrich-transit.ts
 *
 * - Upserts data/transit-stations.json (OpenStreetMap snapshot, 188 stations)
 *   into transit_stations.
 * - Rebuilds clinic_stations: up to 2 nearest stations within 1 km.
 * - Recomputes near_bts / near_mrt (station within 500 m), which drive the
 *   listing filters. ARL and SRT Red Line stations don't set either flag.
 *
 * Idempotent — safe to re-run. Refresh the JSON from Overpass when lines open.
 */

import { createClient } from '@libsql/client'
import fs from 'node:fs'

const client = createClient({
  url:       process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

type Station = { osm_id: number; name: string; name_th: string | null; system: string; lat: number; lng: number }

const LINK_RADIUS_M = 1000
const FLAG_RADIUS_M = 500
const MAX_LINKS     = 2

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function main() {
  const stations: Station[] = JSON.parse(fs.readFileSync('data/transit-stations.json', 'utf8'))

  await client.batch([
    `CREATE TABLE IF NOT EXISTS transit_stations (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       osm_id INTEGER NOT NULL UNIQUE,
       name TEXT NOT NULL, name_th TEXT, system TEXT NOT NULL,
       lat REAL NOT NULL, lng REAL NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS clinic_stations (
       clinic_id INTEGER NOT NULL REFERENCES clinics(id),
       station_id INTEGER NOT NULL REFERENCES transit_stations(id),
       distance_m INTEGER NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS clinic_stations_unq ON clinic_stations(clinic_id, station_id)`,
  ], 'write')

  await client.batch(stations.map((s) => ({
    sql: `INSERT INTO transit_stations (osm_id, name, name_th, system, lat, lng) VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(osm_id) DO UPDATE SET name = excluded.name, name_th = excluded.name_th,
            system = excluded.system, lat = excluded.lat, lng = excluded.lng`,
    args: [s.osm_id, s.name, s.name_th, s.system, s.lat, s.lng],
  })), 'write')

  const stationRows = (await client.execute('SELECT id, osm_id, system, lat, lng FROM transit_stations')).rows
  const known = new Set(stations.map((s) => s.osm_id))
  const live = stationRows.filter((r) => known.has(Number(r.osm_id)))

  const clinics = (await client.execute('SELECT id, lat, lng FROM clinics WHERE lat IS NOT NULL AND lng IS NOT NULL')).rows

  const links: { clinicId: number; stationId: number; distanceM: number }[] = []
  const flags: { id: number; bts: number; mrt: number }[] = []
  for (const c of clinics) {
    const near = live
      .map((s) => ({ s, d: haversineM(Number(c.lat), Number(c.lng), Number(s.lat), Number(s.lng)) }))
      .filter((x) => x.d <= LINK_RADIUS_M)
      .sort((a, b) => a.d - b.d)
    for (const x of near.slice(0, MAX_LINKS)) {
      links.push({ clinicId: Number(c.id), stationId: Number(x.s.id), distanceM: Math.round(x.d) })
    }
    const within = near.filter((x) => x.d <= FLAG_RADIUS_M)
    flags.push({
      id:  Number(c.id),
      bts: within.some((x) => x.s.system === 'BTS') ? 1 : 0,
      mrt: within.some((x) => x.s.system === 'MRT') ? 1 : 0,
    })
  }

  await client.execute('DELETE FROM clinic_stations')
  for (let i = 0; i < links.length; i += 50) {
    await client.batch(links.slice(i, i + 50).map((l) => ({
      sql: 'INSERT INTO clinic_stations (clinic_id, station_id, distance_m) VALUES (?, ?, ?)',
      args: [l.clinicId, l.stationId, l.distanceM],
    })), 'write')
  }
  for (let i = 0; i < flags.length; i += 50) {
    await client.batch(flags.slice(i, i + 50).map((f) => ({
      sql: 'UPDATE clinics SET near_bts = ?, near_mrt = ? WHERE id = ?',
      args: [f.bts, f.mrt, f.id],
    })), 'write')
  }

  const linked = new Set(links.map((l) => l.clinicId)).size
  console.log(`Stations: ${live.length}. Clinics: ${clinics.length}, linked to a station within 1 km: ${linked}.`)
  console.log(`near_bts: ${flags.filter((f) => f.bts).length}, near_mrt: ${flags.filter((f) => f.mrt).length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
