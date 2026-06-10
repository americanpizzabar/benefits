import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon serverless SQL client. Lazily initialized so a missing DATABASE_URL only
 * fails when a query actually runs (keeps `next build` working without a DB).
 *
 * Use as a tagged template — values are parameterized automatically:
 *   const rows = await sql`select * from benefits where id = ${id}`;
 */
let client: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url);
  }
  return client;
}

export const sql: NeonQueryFunction<false, false> = ((...args: unknown[]) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (getClient() as any)(...args)) as NeonQueryFunction<false, false>;
