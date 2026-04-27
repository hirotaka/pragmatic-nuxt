import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type * as schema from "~~/db/schema";

/**
 * Database type for SQLite-compatible databases (libSQL, D1, etc.)
 * Uses BaseSQLiteDatabase as the common interface for all SQLite adapters.
 */
export type Database = BaseSQLiteDatabase<"async", unknown, typeof schema>;
