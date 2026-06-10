import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({ 
    url: process.env.TURSO_URL!, 
    authToken: process.env.TURSO_AUTH_TOKEN!
  });

  const rows = await client.execute(
    "SELECT id, name, slug, name_en FROM clinics WHERE name_en IS NULL OR name_en = '' ORDER BY id"
  );

  rows.rows.forEach(r => {
    console.log(`ID ${r[0]}: ${r[2]}`);
    console.log(`   "${r[1]}"`);
    console.log();
  });
}

main().catch(e => { console.error(e); process.exit(1); });
