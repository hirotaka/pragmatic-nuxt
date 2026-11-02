import { realpath } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import * as schema from "@nuxthub/db/schema";
import { drizzle } from "drizzle-orm/libsql";

const databasePath = fileURLToPath(new URL("../../../.data/e2e/db/sqlite.db", import.meta.url));

export async function openE2EDatabase(baseURL: string | undefined) {
  if (!baseURL || new URL(baseURL).hostname !== "localhost" || new URL(baseURL).port !== "3100") {
    throw new Error("E2E data helpers require the disposable local app on localhost:3100");
  }
  if (await realpath(databasePath) !== databasePath) {
    throw new Error("The E2E database must already exist and must not resolve through a symlink");
  }
  const client = createClient({ url: `file:${databasePath}` });
  try {
    await client.execute("PRAGMA busy_timeout = 5000");
    return drizzle(client, { schema });
  }
  catch (error) {
    client.close();
    throw error;
  }
}

export async function prepareE2EDatabase(baseURL: string | undefined) {
  const db = await openE2EDatabase(baseURL);
  try {
    const result = await db.$client.execute("PRAGMA journal_mode = WAL");
    if (result.rows[0]?.journal_mode !== "wal") {
      throw new Error("The disposable E2E database must use WAL for workers and the preview");
    }
  }
  finally {
    db.$client.close();
  }
}

export async function clearE2EDatabase(baseURL: string | undefined) {
  const db = await openE2EDatabase(baseURL);
  try {
    await db.transaction(async (tx) => {
      await tx.delete(schema.comments);
      await tx.delete(schema.discussions);
      await tx.delete(schema.users);
      await tx.delete(schema.teams);
    });
  }
  finally {
    db.$client.close();
  }
}
