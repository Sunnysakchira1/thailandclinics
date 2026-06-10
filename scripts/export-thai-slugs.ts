import { createClient } from '@libsql/client';
import * as XLSX from 'xlsx';
import path from 'path';

const GARBLED = /khlinik|khayp|rachtkaya|ribalans|shkhlinik|chongnn|kayraks|phrom-9-kay|bilif-|knk-|smphr-|diekh-|efrch|phanraphi|nimebol|phawewo|omchan-ailf|phromfis|hlngoi|fisiooosn|wrphr-|sukhchit-shk|thithie|thrrmana|orngphy|banechtsch|dwngphr|kanyakhlin|pawita-khlin|balanssukh|nathakaya-khlin|sunysu|thrastm|rakssu|dubodi|khun-khlin|onusrn|chatrkwi|yunikhae|phawini-khlin|atthe-par|sakhaedoa|sakhaoosk|sakhaesn|sakhaedoa|mrc-suny|phawini-khlin/;

async function main() {
  const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const rows = await client.execute(
    "SELECT id, name, slug, name_en FROM clinics ORDER BY id"
  );

  const broken = rows.rows
    .filter(r => GARBLED.test(String(r[2])))
    .map(r => ({
      id: Number(r[0]),
      name: String(r[1] ?? ''),
      current_slug: String(r[2] ?? ''),
      name_en: r[3] ? String(r[3]) : '',
    }));

  const data = broken.map(r => ({
    'ID': r.id,
    'Thai Name': r.name,
    'Current Slug (broken)': r.current_slug,
    'Current URL': `https://thailand-clinics.com/bangkok/physiotherapy-clinics/${r.current_slug}/`,
    'New Slug (fill in)': '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  // Column widths
  ws['!cols'] = [
    { wch: 6 },   // ID
    { wch: 55 },  // Thai Name
    { wch: 55 },  // Current Slug
    { wch: 85 },  // Current URL
    { wch: 45 },  // New Slug
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Thai Clinic Slugs');

  const outPath = path.resolve('./data/thai-clinic-slugs.xlsx');
  XLSX.writeFile(wb, outPath);

  console.log(`Exported ${broken.length} rows → ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
