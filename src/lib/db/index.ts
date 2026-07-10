import { createClient, type Client, type InArgs } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Turso client hardened for the static build.
 *
 * `next build` (output: "export") statically generates ~500 pages, each firing
 * several queries — thousands of network round-trips to Turso's remote endpoint.
 * Run concurrently, that saturates the hobby-tier connection limit and throws
 * intermittent ETIMEDOUT/ECONNRESET, and a single failed query aborts the whole
 * build. Two guards fix it:
 *   1. a concurrency semaphore caps simultaneous in-flight requests (prevents
 *      the saturation that causes the timeouts), and
 *   2. transient network errors retry with exponential backoff (survive blips).
 * Both are tunable via env; defaults are safe for the hobby tier.
 */

const MAX_CONCURRENCY = Number(process.env.TURSO_MAX_CONCURRENCY ?? 8);
const MAX_RETRIES = Number(process.env.TURSO_MAX_RETRIES ?? 5);

const RETRYABLE =
  /ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|EPIPE|socket hang up|fetch failed|network|timed? ?out|\b(429|500|502|503|504|522|529)\b/i;

function isRetryable(err: unknown): boolean {
  const e = err as { code?: string; message?: string; cause?: { code?: string; message?: string } };
  const blob = `${e?.code ?? ""} ${e?.message ?? ""} ${e?.cause?.code ?? ""} ${e?.cause?.message ?? ""}`;
  return RETRYABLE.test(blob);
}

/* ── Concurrency semaphore ───────────────────────────────────────── */
let active = 0;
const waiters: Array<() => void> = [];
async function acquire(): Promise<void> {
  if (active < MAX_CONCURRENCY) { active++; return; }
  await new Promise<void>((res) => waiters.push(res)); // slot handed over by release()
}
function release(): void {
  const next = waiters.shift();
  if (next) next();   // hand our slot to the next waiter (active unchanged)
  else active--;      // no waiter: free the slot
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withGuards<T>(fn: () => Promise<T>): Promise<T> {
  await acquire();
  try {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (attempt === MAX_RETRIES || !isRetryable(err)) throw err;
        await sleep(250 * 2 ** attempt); // 250ms, 500ms, 1s, 2s, 4s
      }
    }
    throw lastErr;
  } finally {
    release();
  }
}

/* ── Wrap the retry-worthy methods (execute/batch); pass everything else through ── */
const rawClient = createClient({
  url:       process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const client = new Proxy(rawClient, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (prop === "execute" || prop === "batch") {
      return (...args: [string | { sql: string; args?: InArgs }, ...unknown[]]) =>
        withGuards(() => (value as (...a: unknown[]) => Promise<unknown>).apply(target, args));
    }
    return typeof value === "function" ? value.bind(target) : value;
  },
}) as Client;

export const db = drizzle(client, { schema });
