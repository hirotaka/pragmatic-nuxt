import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { D1Database as D1DatabaseType } from "@cloudflare/workers-types";
import type { H3Event } from "h3";
import * as schema from "~~/db/schema";

type D1Database = DrizzleD1Database<typeof schema>;

/**
 * Get D1 database instance from H3 event context
 * This is used for Cloudflare Pages deployment
 */
export const createD1Db = async (event: H3Event): Promise<D1Database> => {
  const cloudflareEnv = event.context.cloudflare?.env as
    | { DB?: D1DatabaseType }
    | undefined;

  if (!cloudflareEnv?.DB) {
    throw new Error("D1 database binding not found. Make sure you are running on Cloudflare with D1 configured.");
  }

  return drizzle(cloudflareEnv.DB, { schema });
};
