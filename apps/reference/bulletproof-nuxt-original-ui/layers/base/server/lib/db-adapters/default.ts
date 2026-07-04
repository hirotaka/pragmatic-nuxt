import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import type { H3Event } from "h3";
import { resolve, dirname } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import * as schema from "~~/db/schema";
import type { Database } from "./types";

// Singleton for database client
let dbInstance: Database | null = null;

/**
 * Default database adapter using DATABASE_URL
 *
 * Supports any URL format that @libsql/client accepts:
 * - file:./path - Local SQLite file (relative path converted to absolute)
 * - file:/absolute/path - Local SQLite file (absolute path)
 * - libsql://... - Turso remote database
 *
 * The event parameter is kept for API compatibility with other adapters
 */
export const createDb = async (_event: H3Event): Promise<Database> => {
  if (dbInstance) {
    return dbInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  // SQLite with relative path - resolve to absolute path
  if (databaseUrl.startsWith("file:./")) {
    let projectRoot = process.env.INIT_CWD || process.env.PWD || process.cwd();

    // If we're in the .output directory, go up one level to the project root
    if (projectRoot.endsWith("/.output") || projectRoot.endsWith("\\.output")) {
      projectRoot = dirname(projectRoot);
    }

    const relativePath = databaseUrl.replace("file:./", "");
    const absolutePath = resolve(projectRoot, relativePath);

    // Ensure parent directory exists
    const dbDir = dirname(absolutePath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    const client = createClient({ url: `file:${absolutePath}` });
    dbInstance = drizzle(client, { schema });
    return dbInstance;
  }

  // Absolute path or other URL format (e.g., Turso remote URL)
  const client = createClient({ url: databaseUrl });
  dbInstance = drizzle(client, { schema });

  return dbInstance;
};
