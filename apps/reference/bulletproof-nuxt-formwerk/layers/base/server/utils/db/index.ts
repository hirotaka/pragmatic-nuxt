/**
 * Database adapter pattern
 *
 * By default, uses DATABASE_URL to connect to the database.
 * Set DATABASE_SQLITE_ADAPTER=d1 to use Cloudflare D1 (requires Cloudflare context).
 */
import type { H3Event } from "h3";
import type { Database } from "../../lib/db-adapters/types";

export type { Database };

/**
 * Get database instance
 *
 * - D1: Uses Cloudflare D1 binding from event context
 * - Default: Uses DATABASE_URL (supports SQLite, Turso, PostgreSQL, etc.)
 */
export const useDb = async (event: H3Event): Promise<Database> => {
  // Check at runtime - environment variables may not be available at module load time
  const isD1 = process.env.DATABASE_SQLITE_ADAPTER === "d1";

  if (isD1) {
    const { createD1Db } = await import("../../lib/db-adapters/d1");
    return createD1Db(event);
  }

  const { createDb } = await import("../../lib/db-adapters/default");
  return createDb(event);
};
