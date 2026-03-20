/**
 * Generate AI review summaries for clinics using Claude Haiku.
 *
 * Usage:
 *   Test (3 clinics):  npx tsx scripts/generate-summaries.ts --test
 *   Full run:          npx tsx scripts/generate-summaries.ts
 *
 * Reads clinic_reviews from Turso, calls Claude Haiku, writes back to clinics table.
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, isNull, sql } from "drizzle-orm";
import { clinics, clinicReviews } from "../src/lib/db/schema";

/* ─── Env validation ─────────────────────────────────────────────── */
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const TURSO_URL         = process.env.TURSO_URL;
const TURSO_AUTH_TOKEN  = process.env.TURSO_AUTH_TOKEN;

if (!ANTHROPIC_API_KEY) {
  console.error("❌  ANTHROPIC_API_KEY is not set. Add it to .env.local and re-run.");
  process.exit(1);
}
if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  console.error("❌  TURSO_URL or TURSO_AUTH_TOKEN is not set.");
  process.exit(1);
}

/* ─── DB ─────────────────────────────────────────────────────────── */
const client = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN });
const db     = drizzle(client, { schema: { clinics, clinicReviews } });

/* ─── Types ──────────────────────────────────────────────────────── */
type Summary = {
  positives: [string, string, string];
  negatives: [string | null, string | null, string | null];
};

/* ─── Helpers ────────────────────────────────────────────────────── */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatReviews(rows: { rating: number; text: string }[]): string {
  return rows
    .map((r) => `★${r.rating} — ${r.text.trim()}`)
    .join("\n");
}

/* ─── Claude API call ────────────────────────────────────────────── */
async function callClaude(
  clinicName: string,
  district:   string | null,
  category:   string,
  reviews:    { rating: number; text: string }[]
): Promise<{ raw: string; parsed: Summary | null }> {
  const reviewBlock = formatReviews(reviews);

  const systemPrompt =
    "You analyse patient reviews for a healthcare clinic directory used by expats and medical " +
    "tourists in Thailand. Write like a knowledgeable friend giving an honest recommendation " +
    "over coffee — warm, direct, and specific. Use plain conversational English. No jargon, " +
    "no corporate language, no essay phrases. Avoid words like: modalities, arsenal, intake, " +
    "parameters, facilitate, leverage, stark, notably, it is worth noting, this appears to. " +
    "Return only valid JSON — no other text.";

  const userContent =
`Clinic: ${clinicName}
Location: ${district ?? "Bangkok"}, Bangkok
Category: ${category}

${reviews.length} patient reviews, newest first:
${reviewBlock}

Return ONLY this JSON:
{
  "positives": [
    "2-3 sentences. Mention specific doctors by name if praised. Name specific conditions treated and outcomes. Example: Dr. Somchai is cited repeatedly for treating herniated discs and office syndrome — several patients note full recovery after 3-4 sessions having failed at other clinics.",
    "2-3 sentences on a second specific strength — different treatment, different doctor, or different patient type this clinic excels for.",
    "2-3 sentences on a third specific strength — could be equipment, approach, a particular technique like dry needling or manual therapy, or the English-language capability if consistently mentioned."
  ],
  "negatives": [
    "2-3 sentences on the most common complaint with specifics — is it the booking system, wait times, a specific process, parking, pricing transparency? Describe exactly what reviewers say.",
    "2-3 sentences on a second complaint if it appears in 2+ reviews. null if not enough evidence.",
    null
  ]
}

Rules:
- Each bullet is 2-3 full sentences — enough to be genuinely informative
- Name doctors if mentioned in multiple reviews
- Name specific conditions: office syndrome, herniated disc, frozen shoulder, ACL recovery, sports injury, post-surgery rehab
- Name specific techniques if mentioned: dry needling, manual therapy, ultrasound, taping, cupping, Pilates
- Negatives only if mentioned in 2+ reviews — null otherwise
- BANNED phrases (rewrite any bullet containing these): 'friendly staff', 'professional service', 'highly recommended', 'great experience', 'clean facilities', 'knowledgeable staff', 'good clinic', 'excellent service', 'wonderful experience'
- Every sentence must contain something specific to THIS clinic only
- If a sentence could describe any clinic in Bangkok, rewrite it`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method:  "POST",
    headers: {
      "x-api-key":         ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type":      "application/json",
    },
    body: JSON.stringify({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system:     systemPrompt,
      messages:   [{ role: "user", content: userContent }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Claude API ${response.status}: ${body}`);
  }

  const data = await response.json() as { content: { text: string }[] };
  const raw  = data.content[0]?.text ?? "";

  let parsed: Summary | null = null;
  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const obj = JSON.parse(cleaned) as unknown;

    if (
      typeof obj === "object" && obj !== null &&
      "positives" in obj && "negatives" in obj &&
      Array.isArray((obj as { positives: unknown[] }).positives) &&
      Array.isArray((obj as { negatives: unknown[] }).negatives) &&
      (obj as { positives: unknown[] }).positives.length >= 3 &&
      (obj as { negatives: unknown[] }).negatives.length >= 3
    ) {
      const o = obj as { positives: (string | null)[]; negatives: (string | null)[] };
      parsed = {
        positives: [o.positives[0] as string, o.positives[1] as string, o.positives[2] as string],
        negatives: [o.negatives[0] ?? null,    o.negatives[1] ?? null,    o.negatives[2] ?? null],
      };
    } else {
      console.warn("  ⚠️  Unexpected JSON shape");
    }
  } catch {
    console.warn("  ⚠️  JSON parse failed");
  }

  return { raw, parsed };
}

/* ─── Main ───────────────────────────────────────────────────────── */
async function main() {
  const isTest = process.argv.includes("--test");
  const LIMIT  = isTest ? 3 : Infinity;

  console.log(isTest
    ? "🧪  TEST MODE — processing first 3 clinics only\n"
    : "🚀  FULL RUN — processing all eligible clinics\n"
  );

  /* 1. Fetch category name alongside clinic */
  const eligible = await db
    .select({
      id:                 clinics.id,
      name:               clinics.name,
      nameEn:             clinics.nameEn,
      district:           clinics.district,
      googleReviewsCount: clinics.googleReviewsCount,
    })
    .from(clinics)
    .where(isNull(clinics.reviewPositives))
    .orderBy(sql`${clinics.googleReviewsCount} DESC`);

  /* Filter in-process: need >= 5 text reviews in clinic_reviews */
  const withEnoughReviews: typeof eligible = [];
  for (const clinic of eligible) {
    const countRows = await db
      .select({ cnt: sql<number>`count(*)` })
      .from(clinicReviews)
      .where(
        sql`${clinicReviews.clinicId} = ${clinic.id}
            AND ${clinicReviews.text} IS NOT NULL
            AND ${clinicReviews.text} != ''`
      );
    if (Number(countRows[0]?.cnt ?? 0) >= 5) withEnoughReviews.push(clinic);
    if (withEnoughReviews.length >= LIMIT) break;
  }

  const total = withEnoughReviews.length;
  console.log(`Found ${total} eligible clinic(s) to summarise.\n`);
  if (total === 0) { console.log("Nothing to do."); process.exit(0); }

  /* 2. Process each clinic */
  let generated = 0;
  let skipped   = 0;
  let errors    = 0;

  for (let i = 0; i < withEnoughReviews.length; i++) {
    const clinic      = withEnoughReviews[i];
    const displayName = clinic.nameEn ?? clinic.name;

    /* a) Fetch up to 30 most recent text reviews */
    const reviewRows = await db
      .select({ rating: clinicReviews.rating, text: clinicReviews.text })
      .from(clinicReviews)
      .where(
        sql`${clinicReviews.clinicId} = ${clinic.id}
            AND ${clinicReviews.text} IS NOT NULL
            AND ${clinicReviews.text} != ''`
      )
      .orderBy(sql`${clinicReviews.reviewDate} DESC`)
      .limit(30) as { rating: number; text: string }[];

    /* b) Skip if < 5 */
    if (reviewRows.length < 5) {
      console.log(`  Skipped ${displayName}: only ${reviewRows.length} reviews with text`);
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${total}] ${displayName} (${reviewRows.length} reviews)`);

    /* c–d) Call Claude + parse */
    try {
      const { raw, parsed } = await callClaude(
        displayName,
        clinic.district,
        "Physiotherapy",
        reviewRows
      );

      /* Always print raw in test mode */
      if (isTest) {
        console.log("\n  ── Raw JSON response ──");
        console.log(raw.split("\n").map((l) => "  " + l).join("\n"));
        console.log();
      }

      if (!parsed) {
        console.log(`  ❌  Parse failed — skipping`);
        errors++;
      } else {
        /* e) Write to DB */
        await db
          .update(clinics)
          .set({
            reviewPositives:        JSON.stringify(parsed.positives),
            reviewNegatives:        JSON.stringify(parsed.negatives),
            reviewSummaryCount:     reviewRows.length,
            reviewSummaryUpdatedAt: today(),
          })
          .where(eq(clinics.id, clinic.id));

        console.log(`  ✓  Saved`);
        generated++;
      }
    } catch (err) {
      console.error(`  ❌  API error for ${displayName}:`, err);
      errors++;
    }

    /* f) Rate limit */
    if (i < withEnoughReviews.length - 1) await sleep(600);

    /* Progress every 10 (full run only) */
    if (!isTest && (i + 1) % 10 === 0) {
      console.log(`\n── Progress: ${i + 1}/${total} ──\n`);
    }
  }

  /* 3. Final report */
  const inputTokensPerClinic  = 800;   // longer reviews + longer prompt
  const outputTokensPerClinic = 250;   // 2-3 sentences × 6 bullets
  const costPer1MInput        = 0.25;
  const costPer1MOutput       = 1.25;
  const estimatedCost = (
    (generated * inputTokensPerClinic  / 1_000_000) * costPer1MInput +
    (generated * outputTokensPerClinic / 1_000_000) * costPer1MOutput
  ).toFixed(4);

  console.log(`
════════════════════════════════
  Done
  Total processed : ${generated + skipped + errors}
  Generated       : ${generated}
  Skipped         : ${skipped}
  Errors          : ${errors}
  Est. cost       : $${estimatedCost}
════════════════════════════════`);

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
