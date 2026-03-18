import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { cities, categories } from "../src/lib/db/schema";

const client = createClient({
  url:       process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

async function main() {
  console.log("Seeding cities...");
  await db.insert(cities).values([
    { name: "Bangkok",    slug: "bangkok",    lat: 13.7563, lng: 100.5018 },
    { name: "Phuket",     slug: "phuket",     lat: 7.8804,  lng: 98.3923  },
    { name: "Chiang Mai", slug: "chiang-mai", lat: 18.7883, lng: 98.9853  },
    { name: "Pattaya",    slug: "pattaya",    lat: 12.9236, lng: 100.8825 },
  ]).onConflictDoNothing();

  console.log("Seeding categories...");
  await db.insert(categories).values([
    { name: "Physiotherapy Clinics", slug: "physiotherapy-clinics" },
    { name: "Dental Clinics",        slug: "dental-clinics"        },
    { name: "Cosmetic Clinics",      slug: "cosmetic-clinics"      },
    { name: "Wellness Clinics",      slug: "wellness-clinics"      },
  ]).onConflictDoNothing();

  console.log("Done.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
